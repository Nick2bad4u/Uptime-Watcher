import type { RendererEventPayloadMap } from "@shared/ipc/rendererEvents";

import { ensureError } from "@shared/utils/errorHandling";

import type { ListenerAttachmentState } from "../baseTypes";

import { EventsService } from "../../../services/EventsService";
import { logger } from "../../../services/logger";

/**
 * Descriptor for a status update listener registration.
 *
 * @remarks
 * This intentionally abstracts the subscription wiring away from
 * {@link src/stores/sites/utils/statusUpdateHandler#StatusUpdateManager} so the manager can focus on orchestration and
 * recovery while this module focuses on listener setup.
 */
export interface StatusUpdateListenerDescriptor {
    /** Human-readable label used in diagnostics. */
    label: string;
    /** Registers the listener and returns the cleanup function. */
    register: () => Promise<() => void>;
    /** Scope key used when reporting registration errors. */
    scope: string;
}

/**
 * Dependencies required to build the canonical status-update listener set.
 */
export interface StatusUpdateListenerFactoryDependencies {
    /** Handles monitoring lifecycle events when monitoring starts. */
    handleMonitoringStarted: (
        event: RendererEventPayloadMap["monitoring:started"]
    ) => void;

    /** Handles monitoring lifecycle events when monitoring stops. */
    handleMonitoringStopped: (
        event: RendererEventPayloadMap["monitoring:stopped"]
    ) => void;

    /**
     * Processes an unknown candidate payload which may represent an enriched
     * monitor status update.
     */
    processStatusUpdateCandidate: (candidate: unknown, source: string) => void;
}

const safeHandleMonitoringLifecycleEvent = <TEvent>(
    phase: "started" | "stopped",
    handler: (event: TEvent) => void,
    event: TEvent
): void => {
    try {
        handler(event);
    } catch (error) {
        logger.error(
            `Error while processing monitoring ${phase} lifecycle event`,
            ensureError(error)
        );
    }
};

/**
 * Builds the canonical set of listener descriptors for status update
 * subscriptions.
 */
export const createStatusUpdateListenerDescriptors = (
    deps: StatusUpdateListenerFactoryDependencies
): StatusUpdateListenerDescriptor[] => [
    {
        label: "monitor:status-changed",
        register: () =>
            EventsService.onMonitorStatusChanged((data: unknown) => {
                deps.processStatusUpdateCandidate(
                    data,
                    "monitor:status-changed"
                );
            }),
        scope: "monitor:status-changed",
    },
    {
        label: "monitor:check-completed",
        register: () =>
            EventsService.onMonitorCheckCompleted(
                (event: RendererEventPayloadMap["monitor:check-completed"]) => {
                    deps.processStatusUpdateCandidate(
                        event.result,
                        "monitor:check-completed"
                    );
                }
            ),
        scope: "monitor:check-completed",
    },
    {
        label: "monitoring:started",
        register: () =>
            EventsService.onMonitoringStarted(
                (event: RendererEventPayloadMap["monitoring:started"]) => {
                    safeHandleMonitoringLifecycleEvent(
                        "started",
                        deps.handleMonitoringStarted,
                        event
                    );
                }
            ),
        scope: "monitoring:started",
    },
    {
        label: "monitoring:stopped",
        register: () =>
            EventsService.onMonitoringStopped(
                (event: RendererEventPayloadMap["monitoring:stopped"]) => {
                    safeHandleMonitoringLifecycleEvent(
                        "stopped",
                        deps.handleMonitoringStopped,
                        event
                    );
                }
            ),
        scope: "monitoring:stopped",
    },
];

/**
 * Creates the initial listener attachment state list for diagnostics.
 */
export const createInitialListenerStates = (
    descriptors: readonly StatusUpdateListenerDescriptor[]
): ListenerAttachmentState[] =>
    descriptors.map(({ label }) => ({
        attached: false,
        name: label,
    }));
