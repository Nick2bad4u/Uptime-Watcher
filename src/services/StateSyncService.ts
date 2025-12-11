/**
 * Service layer for handling state synchronization operations via Electron IPC.
 *
 * @remarks
 * Ensures all state synchronization interactions go through the typed
 * `stateSync` preload domain with proper initialization, logging, and error
 * handling. Provides typed wrappers for sync status retrieval, full sync
 * requests, and event subscriptions, so renderer code never touches the
 * `window.electronAPI.stateSync` bridge directly.
 *
 * For a store-level view of how these operations integrate with the sites
 * cache, see the "State sync pipeline" section in `docs/TSDoc/stores/sites.md`
 * and the "State synchronization pipeline (sites & cache)" subsection in
 * `docs/Architecture/README.md`.
 */

import {
    safeParseStateSyncEventData,
    type StateSyncEventData,
} from "@shared/types/events";
import {
    parseStateSyncFullSyncResult,
    parseStateSyncStatusSummary,
    STATE_SYNC_ACTION,
    type StateSyncFullSyncResult,
    type StateSyncStatusSummary,
} from "@shared/types/stateSync";
import { ensureError } from "@shared/utils/errorHandling";

import { logger } from "./logger";
import { resolveCleanupHandler } from "./utils/cleanupHandlers";
import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";

const { ensureInitialized, wrap } = ((): ReturnType<
    typeof getIpcServiceHelpers
> => {
    try {
        return getIpcServiceHelpers("StateSyncService", {
            bridgeContracts: [
                {
                    domain: "stateSync",
                    methods: [
                        "getSyncStatus",
                        "onStateSyncEvent",
                        "requestFullSync",
                    ],
                },
            ],
        });
    } catch (error: unknown) {
        throw ensureError(error);
    }
})();

/**
 * Contract for renderer-facing state synchronization operations.
 *
 * @remarks
 * Provides guarded access to preload-managed IPC endpoints so callers do not
 * touch the `window.electronAPI` global directly. Implementations must ensure
 * the Electron bridge is ready before invoking any underlying channel.
 */
interface StateSyncServiceContract {
    /** Retrieves the latest synchronization status snapshot from the backend. */
    readonly getSyncStatus: () => Promise<StateSyncStatusSummary>;
    /** Ensures the preload bridge is available prior to IPC usage. */
    readonly initialize: () => Promise<void>;
    /**
     * Registers a handler for incremental state sync events and returns a
     * cleanup callback.
     */
    readonly onStateSyncEvent: (
        callback: (event: StateSyncEventData) => void
    ) => Promise<() => void>;
    /**
     * Requests a full synchronization cycle and returns the backend result
     * payload.
     */
    readonly requestFullSync: () => Promise<StateSyncFullSyncResult>;
}

/**
 * Facade for state synchronization status, full-sync requests, and incremental
 * sync events.
 *
 * @remarks
 * This service delegates to the typed `stateSync` preload domain via
 * {@link getIpcServiceHelpers}, and validates all IPC responses using the shared
 * snapshot helpers from `@shared/types/stateSync`. It also implements a guarded
 * subscription pipeline that recovers from malformed `state-sync-event`
 * payloads by triggering a full-sync and synthesizing a replacement `BULK_SYNC`
 * event.
 */
export const StateSyncService: StateSyncServiceContract = {
    /**
     * Retrieves the latest synchronization summary from the backend.
     *
     * @remarks
     * The raw status returned by the preload bridge is parsed with
     * {@link parseStateSyncStatusSummary} to enforce the
     * {@link StateSyncStatusSummary} contract before it is returned to callers.
     *
     * @returns A promise that resolves with a {@link StateSyncStatusSummary}
     *   describing recent sync activity, including `lastSyncAt`, `siteCount`,
     *   `source`, and `synchronized` flags.
     *
     * @throws {@link Error} When the IPC bridge fails, the backend rejects the
     *   request, or the returned payload cannot be parsed into a valid
     *   {@link StateSyncStatusSummary}.
     */
    getSyncStatus: wrap("getSyncStatus", async (api) => {
        // eslint-disable-next-line n/no-sync -- IPC channel is asynchronous despite "Sync" suffix.
        const rawSummary = await api.stateSync.getSyncStatus();
        return parseStateSyncStatusSummary(rawSummary);
    }),

    /**
     * Ensures the preload bridge is initialized prior to invoking IPC.
     *
     * @remarks
     * Call this during application startup to ensure subsequent state-sync
     * operations do not pay the initialization cost on first use.
     *
     * @returns A promise that resolves when the `stateSync` bridge is ready for
     *   use.
     *
     * @throws {@link Error} When the Electron environment is unavailable or the
     *   preload bridge fails to initialize.
     */
    initialize: ensureInitialized,

    /**
     * Subscribes to incremental state synchronization updates.
     *
     * @remarks
     * Incoming `state-sync-event` payloads are first validated with
     * {@link safeParseStateSyncEventData}. When invalid payloads are observed,
     * the service logs structured diagnostics and schedules a guarded full-sync
     * recovery via {@link StateSyncService.requestFullSync}. A synthesized
     * `BULK_SYNC` event is emitted to the subscriber, and the service waits for
     * a matching broadcast from the backend before clearing its recovery
     * expectation.
     *
     * @param callback - Handler invoked with validated
     *   {@link StateSyncEventData} instances describing bulk or incremental site
     *   snapshots.
     *
     * @returns A promise that resolves with a cleanup function which removes
     *   the subscription when invoked.
     *
     * @throws {@link Error} When the bridge registration fails, the unsubscribe
     *   handler returned by the preload bridge cannot be normalized, or cleanup
     *   itself throws unexpectedly.
     */
    onStateSyncEvent: wrap(
        "onStateSyncEvent",
        async (api, callback: (event: StateSyncEventData) => void) => {
            /* eslint-disable n/no-sync, n/callback-return -- IPC bridge exposes asynchronous APIs with "Sync" suffix and forwards callbacks */
            let pendingRecovery: null | Promise<void> = null;
            let subscriptionActive = true;
            let pendingRecoveryExpectation: null | {
                appliedLocally: boolean;
                expectedTimestamp: number;
                siteCount: number;
                source: StateSyncFullSyncResult["source"];
            } = null;
            let pendingRecoveryTimer: null | ReturnType<typeof setTimeout> =
                null;

            const clearPendingRecoveryExpectation = (): void => {
                if (pendingRecoveryTimer) {
                    clearTimeout(pendingRecoveryTimer);
                    pendingRecoveryTimer = null;
                }
                pendingRecoveryExpectation = null;
            };

            const scheduleRecovery = (): void => {
                if (
                    pendingRecovery !== null ||
                    pendingRecoveryExpectation !== null
                ) {
                    return;
                }

                pendingRecovery = (async (): Promise<void> => {
                    try {
                        logger.warn(
                            "[StateSyncService] Attempting full sync recovery after invalid state sync event"
                        );

                        const rawFullSync =
                            await api.stateSync.requestFullSync();
                        const fullSync =
                            parseStateSyncFullSyncResult(rawFullSync);

                        logger.info(
                            "[StateSyncService] Full sync recovery snapshot retrieved",
                            {
                                siteCount: fullSync.siteCount,
                                source: fullSync.source,
                                timestamp: fullSync.completedAt,
                            }
                        );

                        if (!subscriptionActive) {
                            return;
                        }

                        const synthesizedEvent: StateSyncEventData = {
                            action: STATE_SYNC_ACTION.BULK_SYNC,
                            siteIdentifier: "all",
                            sites: fullSync.sites,
                            source: fullSync.source,
                            timestamp: fullSync.completedAt,
                        };

                        callback(synthesizedEvent);

                        pendingRecoveryExpectation = {
                            appliedLocally: true,
                            expectedTimestamp: fullSync.completedAt,
                            siteCount: fullSync.siteCount,
                            source: fullSync.source,
                        };

                        if (pendingRecoveryTimer) {
                            clearTimeout(pendingRecoveryTimer);
                        }

                        pendingRecoveryTimer = setTimeout(() => {
                            logger.warn(
                                "[StateSyncService] Full sync recovery broadcast not received within expected window",
                                {
                                    expectedTimestamp:
                                        pendingRecoveryExpectation?.expectedTimestamp,
                                }
                            );
                            clearPendingRecoveryExpectation();
                        }, 5000);
                    } catch (error: unknown) {
                        logger.error(
                            "[StateSyncService] Full sync recovery failed",
                            ensureError(error)
                        );
                    } finally {
                        pendingRecovery = null;
                    }
                })();
            };

            const unsubscribeCandidate = await Promise.resolve(
                api.stateSync.onStateSyncEvent((rawEvent) => {
                    const parsedEvent = safeParseStateSyncEventData(rawEvent);

                    if (!parsedEvent.success) {
                        logger.error(
                            "[StateSyncService] Ignoring invalid state sync event payload",
                            parsedEvent.error,
                            {
                                rawEvent,
                            }
                        );

                        scheduleRecovery();
                        return;
                    }

                    const shouldSkipCallback =
                        pendingRecoveryExpectation !== null &&
                        pendingRecoveryExpectation.appliedLocally &&
                        parsedEvent.data.timestamp ===
                            pendingRecoveryExpectation.expectedTimestamp;

                    if (!shouldSkipCallback) {
                        callback(parsedEvent.data);
                    }

                    if (
                        pendingRecoveryExpectation &&
                        parsedEvent.data.timestamp ===
                            pendingRecoveryExpectation.expectedTimestamp
                    ) {
                        logger.info(
                            "[StateSyncService] Full sync recovery broadcast applied",
                            {
                                siteCount: parsedEvent.data.sites.length,
                                source: parsedEvent.data.source,
                                timestamp: parsedEvent.data.timestamp,
                            }
                        );
                        clearPendingRecoveryExpectation();
                    }
                })
            );
            /* eslint-enable n/no-sync, n/callback-return -- Restore linting after state sync subscription block */

            const normalizedCleanup = resolveCleanupHandler(
                unsubscribeCandidate,
                {
                    handleCleanupError: (error: unknown) => {
                        logger.error(
                            "[StateSyncService] Failed to cleanup state sync subscription:",
                            ensureError(error)
                        );
                    },
                    handleInvalidCleanup: ({
                        actualType,
                        cleanupCandidate,
                    }) => {
                        logger.error(
                            "[StateSyncService] Preload bridge returned an invalid unsubscribe handler",
                            {
                                actualType,
                                value: cleanupCandidate,
                            }
                        );

                        return (): void => {
                            logger.error(
                                "[StateSyncService] Skip cleanup, unsubscribe handler was not a function"
                            );
                        };
                    },
                }
            );

            return (): void => {
                subscriptionActive = false;
                clearPendingRecoveryExpectation();
                pendingRecovery = null;
                normalizedCleanup();
            };
        }
    ),

    /**
     * Requests a full state synchronization cycle.
     *
     * @remarks
     * The raw snapshot returned by the backend is parsed using
     * {@link parseStateSyncFullSyncResult} to ensure it conforms to the
     * {@link StateSyncFullSyncResult} contract before being exposed to callers.
     *
     * @returns A promise that resolves with the {@link StateSyncFullSyncResult}
     *   emitted by the backend, including the authoritative `sites` array,
     *   `siteCount`, `completedAt` timestamp, and sync `source`.
     *
     * @throws {@link Error} When the IPC bridge fails, the backend rejects the
     *   request, or the returned payload cannot be parsed into a valid
     *   {@link StateSyncFullSyncResult}.
     */
    requestFullSync: wrap("requestFullSync", async (api) => {
        // eslint-disable-next-line n/no-sync -- IPC bridge exposes async method with "Sync" suffix.
        const rawResult = await api.stateSync.requestFullSync();
        return parseStateSyncFullSyncResult(rawResult);
    }),
};
