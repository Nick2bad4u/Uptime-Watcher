import type { Site, StatusUpdate } from "@shared/types";

import {
    type StatusUpdateHandlerOptions,
    StatusUpdateManager,
} from "./statusUpdateHandler";
import { resolveExpectedListenerCount } from "./statusUpdateSubscriptionSummary";

type StatusUpdateCallback = (update: StatusUpdate) => void;

/**
 * Lazily initialized module-level singleton for renderer status updates.
 *
 * @remarks
 * The sites sync layer intentionally keeps a singleton
 * {@link src/stores/sites/utils/statusUpdateHandler#StatusUpdateManager} to
 * avoid duplicate event subscriptions across components.
 *
 * The callback can change between subscriptions (different components), so the
 * manager must not capture a stale callback reference. Instead, we keep a
 * mutable callback slot and expose a stable {@link dispatchStatusUpdate}
 * function that always forwards to the latest callback.
 */
const statusUpdateManagerSingleton: {
    callback: StatusUpdateCallback | undefined;
    instance: StatusUpdateManager | undefined;
} = {
    callback: undefined,
    instance: undefined,
};

/** Dispatches the status update to the latest registered callback (if any). */
export function dispatchStatusUpdate(update: StatusUpdate): void {
    statusUpdateManagerSingleton.callback?.(update);
}

/** Returns the currently registered status update callback. */
export function getStatusUpdateCallback(): StatusUpdateCallback | undefined {
    return statusUpdateManagerSingleton.callback;
}

/**
 * Registers (or replaces) the status update callback used by the singleton
 * dispatcher.
 */
export function setStatusUpdateCallback(callback: StatusUpdateCallback): void {
    statusUpdateManagerSingleton.callback = callback;
}

/**
 * Returns the active
 * {@link src/stores/sites/utils/statusUpdateHandler#StatusUpdateManager}
 * instance (if initialized).
 */
export function getStatusUpdateManagerInstance():
    | StatusUpdateManager
    | undefined {
    return statusUpdateManagerSingleton.instance;
}

/** Unsubscribes the active manager (if any) and clears the instance slot. */
export function unsubscribeStatusUpdateManager(): void {
    statusUpdateManagerSingleton.instance?.unsubscribe();
    statusUpdateManagerSingleton.instance = undefined;
}

/**
 * Ensures the singleton
 * {@link src/stores/sites/utils/statusUpdateHandler#StatusUpdateManager} exists
 * and returns it.
 */
export function ensureStatusUpdateManager(options: {
    readonly fullResyncSites: () => Promise<void>;
    readonly getSites: () => Site[];
    readonly setSites: (sites: Site[]) => void;
}): StatusUpdateManager {
    statusUpdateManagerSingleton.instance ??= new StatusUpdateManager({
        fullResyncSites: options.fullResyncSites,
        getSites: options.getSites,
        onUpdate: dispatchStatusUpdate,
        setSites: options.setSites,
    } satisfies StatusUpdateHandlerOptions);

    return statusUpdateManagerSingleton.instance;
}

/**
 * Resets the singleton for deterministic testing and dev hot-reload safety.
 */
export function resetStatusUpdateManagerSingleton(): void {
    unsubscribeStatusUpdateManager();
    statusUpdateManagerSingleton.callback = undefined;
}

/**
 * Expected listener count when falling back to the underlying manager.
 */
export function resolveFallbackExpectedListenerCount(): number {
    return resolveExpectedListenerCount(StatusUpdateManager);
}
