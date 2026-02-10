/**
 * Internal helper contracts for {@link ServiceContainer}.
 *
 * @remarks
 * `electron/services/ServiceContainer.ts` is intentionally large (DI container,
 * initialization sequencing, and event forwarding). This module extracts small
 * utility types and guards so refactors can happen without scrolling through
 * unrelated boilerplate.
 */

import type { EventMetadata } from "@shared/types/events";

import type { UptimeEvents } from "../events/eventTypes";
import type { EnhancedEventPayload, EventKey } from "../events/TypedEventBus";

/**
 * Represents a service that optionally exposes an
 * {@link PossiblyInitializableService.initialize | initialize}
 * method.
 */
export interface PossiblyInitializableService {
    /** Optional initializer invoked during container bootstrap. */
    initialize?: (() => Promise<void>) | (() => unknown);
}

/**
 * Type guard that determines if a service exposes an
 * {@link PossiblyInitializableService.initialize | initialize}
 * method.
 */
export function hasInitializeMethod(
    value: unknown
): value is PossiblyInitializableService & {
    initialize: () => unknown;
} {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const candidate = value as PossiblyInitializableService;
    return typeof candidate.initialize === "function";
}

/**
 * Supported payload formats for manager events forwarded to the orchestrator.
 *
 * @remarks
 * Manager event buses attach metadata to payloads via {@link EventMetadata}. The
 * orchestrator should receive the original payload shape without
 * EventEmitter-specific metadata. This helper type captures both
 * representations so forwarding helpers can normalize payloads safely while
 * preserving type safety.
 */
export type ForwardablePayloadBase<EventName extends EventKey<UptimeEvents>> =
    Omit<UptimeEvents[EventName], "_meta" | "_originalMeta">;

/**
 * Event payload shape accepted by the event-forwarding layer.
 *
 * @remarks
 * This is the normalized form that may (or may not) include `_meta` and
 * `_originalMeta` properties attached by {@link electron/events/TypedEventBus#TypedEventBus}.
 */
export type ForwardableEventPayload<EventName extends EventKey<UptimeEvents>> =
    ForwardablePayloadBase<EventName> & {
        _meta?: EventMetadata;
        _originalMeta?: EventMetadata;
    };

/**
 * Forwardable payload that is guaranteed to include `_meta`.
 */
export type ForwardablePayloadWithMeta<
    EventName extends EventKey<UptimeEvents>,
> = ForwardablePayloadBase<EventName> & {
    _meta: EventMetadata;
    _originalMeta?: EventMetadata;
};

/**
 * Cast {@link EnhancedEventPayload} into its forwardable representation.
 *
 * @remarks
 * This is a type-level normalization helper used by `ServiceContainer` when
 * bridging manager event buses into the orchestrator bus.
 */
export const toForwardablePayload = <EventName extends EventKey<UptimeEvents>>(
    payload: EnhancedEventPayload<UptimeEvents[EventName]>
): ForwardableEventPayload<EventName> => payload;

/**
 * Determines whether a value is promise-like.
 *
 * @remarks
 * Used by `ServiceContainer` to treat sync and async initialization uniformly
 * without narrowing to actual `Promise` instances.
 */
export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
    if (
        (typeof value !== "object" && typeof value !== "function") ||
        value === null
    ) {
        return false;
    }

    const { then } = value as { then?: unknown };
    return typeof then === "function";
}
