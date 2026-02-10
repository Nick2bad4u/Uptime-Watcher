/**
 * Event forwarding helper for {@link ServiceContainer}.
 *
 * @remarks
 * `ServiceContainer` wires manager event buses (DatabaseManager,
 * MonitorManager, SiteManager) into the main {@link electron/UptimeOrchestrator#UptimeOrchestrator}. This
 * file extracts the forwarding and metadata-cleanup logic so the container
 * remains focused on dependency construction and lifecycle orchestration.
 */

import type { EventMetadata } from "@shared/types/events";

import { ensureError } from "@shared/utils/errorHandling";

import type { UptimeEventName, UptimeEvents } from "../events/eventTypes";

import {
    type EnhancedEventPayload,
    type EventKey,
    ORIGINAL_METADATA_SYMBOL,
    type TypedEventBus,
} from "../events/TypedEventBus";
import {
    FORWARDED_METADATA_PROPERTY_KEY,
    ORIGINAL_METADATA_PROPERTY_KEY,
    stripForwardedEventMetadata,
} from "../utils/eventMetadataForwarding";
import { fireAndForget } from "../utils/fireAndForget";
import { logger } from "../utils/logger";
import {
    type ForwardableEventPayload,
    type ForwardablePayloadWithMeta,
    toForwardablePayload,
} from "./ServiceContainer.utils";

/**
 * The subset of orchestrator functionality required for event forwarding.
 */
export interface ServiceContainerOrchestratorEmitter {
    emitTyped: <EventName extends EventKey<UptimeEvents>>(
        eventName: EventName,
        payload: UptimeEvents[EventName]
    ) => Promise<void>;
}

/** Construction options for {@link ServiceContainerEventForwarder}. */
export interface ServiceContainerEventForwarderOptions {
    /** True to emit debug logs. */
    enableDebugLogging: boolean;

    /** Provide access to the orchestrator (may be null if not constructed yet). */
    getMainOrchestrator: () => null | ServiceContainerOrchestratorEmitter;
}

/**
 * Handles bridging events from manager-specific event buses into the
 * orchestrator event bus.
 */
export class ServiceContainerEventForwarder {
    private readonly enableDebugLogging: boolean;

    private readonly getMainOrchestrator: () => null | ServiceContainerOrchestratorEmitter;

    public constructor(options: ServiceContainerEventForwarderOptions) {
        this.enableDebugLogging = options.enableDebugLogging;
        this.getMainOrchestrator = options.getMainOrchestrator;
    }

    /**
     * Sets up event forwarding from a manager's event bus to the main
     * orchestrator.
     */
    public setupEventForwarding(
        managerEventBus: TypedEventBus<UptimeEvents>,
        managerName: string
    ): void {
        const eventsToForward = [
            "monitor:status-changed",
            "monitor:up",
            "monitor:down",
            "internal:monitor:started",
            "internal:monitor:stopped",
            "internal:monitor:manual-check-completed",
            "internal:monitor:site-setup-completed",
            "internal:site:added",
            "internal:site:removed",
            "internal:site:updated",
            "sites:state-synchronized",
            "internal:database:data-imported",
            "internal:database:history-limit-updated",
            "internal:database:sites-refreshed",
            "internal:database:update-sites-cache-requested",
            "system:error",
        ] as const satisfies readonly UptimeEventName[];

        const maybeTypedBus = managerEventBus as {
            on?: TypedEventBus<UptimeEvents>["on"];
            onTyped?: TypedEventBus<UptimeEvents>["onTyped"];
        };

        if (typeof maybeTypedBus.onTyped === "function") {
            for (const eventName of eventsToForward) {
                maybeTypedBus.onTyped(
                    eventName,
                    (
                        payloadWithMeta: EnhancedEventPayload<
                            UptimeEvents[typeof eventName]
                        >
                    ): void => {
                        const forwardablePayload =
                            toForwardablePayload(payloadWithMeta);
                        this.emitForwardedEvent(
                            eventName,
                            forwardablePayload,
                            managerName
                        );
                    }
                );
            }
        } else {
            for (const eventName of eventsToForward) {
                const rawOn = (
                    managerEventBus as {
                        on?: TypedEventBus<UptimeEvents>["on"];
                    }
                ).on;

                if (typeof rawOn === "function") {
                    rawOn.call(
                        managerEventBus,
                        eventName,
                        (
                            payload: ForwardableEventPayload<typeof eventName>
                        ): void => {
                            this.emitForwardedEvent(
                                eventName,
                                payload,
                                managerName
                            );
                        }
                    );
                } else if (this.enableDebugLogging) {
                    logger.warn(
                        `[ServiceContainer] Skipping forwarding for ${eventName} because manager event bus for ${managerName} lacks an on() method`
                    );
                }
            }
        }

        if (this.enableDebugLogging) {
            logger.debug(
                `[ServiceContainer] Set up event forwarding for ${managerName} (${eventsToForward.length} events)`
            );
        }
    }

    /**
     * Strip manager-bus metadata from an event payload.
     *
     * @remarks
     * This is primarily exposed for the ServiceContainer test suite which
     * validates metadata forwarding behavior.
     *
     * @internal
     */
    public stripEventMetadataForForwarding<
        EventName extends EventKey<UptimeEvents>,
    >(
        eventName: EventName,
        payload: ForwardableEventPayload<EventName>
    ): UptimeEvents[EventName] {
        return this.stripEventMetadata(eventName, payload);
    }

    private emitForwardedEvent<EventName extends EventKey<UptimeEvents>>(
        eventName: EventName,
        payload: ForwardableEventPayload<EventName>,
        managerName: string
    ): void {
        const mainOrchestrator = this.getMainOrchestrator();
        if (!mainOrchestrator) {
            return;
        }

        const sanitizedPayload = this.stripEventMetadata(eventName, payload);
        const eventLabel = eventName;

        fireAndForget(
            async () => {
                await mainOrchestrator.emitTyped(eventName, sanitizedPayload);
            },
            {
                onError: (error: unknown) => {
                    const normalizedError = ensureError(error);
                    logger.error(
                        `[ServiceContainer] Error forwarding ${eventLabel} from ${managerName}`,
                        normalizedError,
                        {
                            event: eventLabel,
                            manager: managerName,
                        }
                    );
                },
            }
        );

        if (this.enableDebugLogging) {
            logger.debug(
                `[ServiceContainer] Forwarded ${eventLabel} from ${managerName} to main orchestrator`
            );
        }
    }

    private stripEventMetadata<EventName extends EventKey<UptimeEvents>>(
        eventName: EventName,
        payload: ForwardableEventPayload<EventName>
    ): UptimeEvents[EventName] {
        if (!this.isPayloadWithMetadata(payload)) {
            return stripForwardedEventMetadata(payload);
        }

        const payloadWithMeta: ForwardablePayloadWithMeta<EventName> = payload;
        const { forwarded, original } =
            this.extractForwardingMetadata(payloadWithMeta);

        if (this.enableDebugLogging) {
            const eventLabel = eventName;
            logger.debug(
                `[ServiceContainer] Stripped metadata from ${eventLabel} payload before forwarding`,
                {
                    metadata: forwarded,
                    originalMetadata: original,
                }
            );
        }

        const stripped = stripForwardedEventMetadata(payloadWithMeta);

        if (Array.isArray(payloadWithMeta) && !Array.isArray(stripped)) {
            throw new TypeError(
                "Unexpected non-array payload after metadata stripping"
            );
        }

        if (!Array.isArray(payloadWithMeta) && Array.isArray(stripped)) {
            throw new TypeError(
                "Unexpected array payload after metadata stripping"
            );
        }

        if (typeof stripped === "object") {
            this.applyForwardingMetadata(stripped, forwarded, original);
        }

        return stripped;
    }

    private isPayloadWithMetadata<EventName extends EventKey<UptimeEvents>>(
        payload: ForwardableEventPayload<EventName>
    ): payload is ForwardablePayloadWithMeta<EventName> {
        const maybeObject: unknown = payload;
        return (
            typeof maybeObject === "object" &&
            maybeObject !== null &&
            FORWARDED_METADATA_PROPERTY_KEY in maybeObject
        );
    }

    private normalizeEventMetadata(
        candidate: unknown
    ): EventMetadata | undefined {
        if (candidate === null || typeof candidate !== "object") {
            return undefined;
        }

        const maybeMetadata = candidate as Partial<EventMetadata>;

        if (
            typeof maybeMetadata.busId !== "string" ||
            typeof maybeMetadata.correlationId !== "string" ||
            typeof maybeMetadata.eventName !== "string" ||
            typeof maybeMetadata.timestamp !== "number"
        ) {
            return undefined;
        }

        return {
            busId: maybeMetadata.busId,
            correlationId: maybeMetadata.correlationId,
            eventName: maybeMetadata.eventName,
            timestamp: maybeMetadata.timestamp,
        } satisfies EventMetadata;
    }

    private extractForwardingMetadata<EventName extends EventKey<UptimeEvents>>(
        payload: ForwardablePayloadWithMeta<EventName>
    ): {
        forwarded?: EventMetadata;
        original?: EventMetadata;
    } {
        const forwarded = this.normalizeEventMetadata(
            Reflect.get(payload, FORWARDED_METADATA_PROPERTY_KEY)
        );

        const originalFromProperty = this.normalizeEventMetadata(
            Reflect.has(payload, ORIGINAL_METADATA_PROPERTY_KEY)
                ? Reflect.get(payload, ORIGINAL_METADATA_PROPERTY_KEY)
                : undefined
        );

        const originalFromSymbol = this.normalizeEventMetadata(
            Reflect.has(payload, ORIGINAL_METADATA_SYMBOL)
                ? Reflect.get(payload, ORIGINAL_METADATA_SYMBOL)
                : undefined
        );

        const original =
            originalFromSymbol ?? originalFromProperty ?? forwarded;

        const result: {
            forwarded?: EventMetadata;
            original?: EventMetadata;
        } = {};

        if (forwarded) {
            result.forwarded = forwarded;
        }

        if (original) {
            result.original = original;
        }

        return result;
    }

    private applyForwardingMetadata(
        target: object,
        forwarded: EventMetadata | undefined,
        original: EventMetadata | undefined
    ): void {
        if (!forwarded) {
            return;
        }

        const resolvedOriginal = original ?? forwarded;

        Object.defineProperty(target, FORWARDED_METADATA_PROPERTY_KEY, {
            configurable: true,
            enumerable: false,
            value: forwarded,
            writable: false,
        });

        Object.defineProperty(target, ORIGINAL_METADATA_PROPERTY_KEY, {
            configurable: true,
            enumerable: false,
            value: resolvedOriginal,
            writable: false,
        });

        Object.defineProperty(target, ORIGINAL_METADATA_SYMBOL, {
            configurable: true,
            enumerable: false,
            value: resolvedOriginal,
            writable: false,
        });
    }
}
