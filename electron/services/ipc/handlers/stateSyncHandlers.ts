import type { IpcInvokeChannel } from "@shared/types/ipc";
import type {
    StateSyncFullSyncResult,
    StateSyncStatusSummary,
} from "@shared/types/stateSync";

import { STATE_SYNC_CHANNELS } from "@shared/types/preload";
import { STATE_SYNC_ACTION, STATE_SYNC_SOURCE } from "@shared/types/stateSync";

import type { UptimeOrchestrator } from "../../../UptimeOrchestrator";

import { logger } from "../../../utils/logger";
import {
    createStateSyncStatusSummary,
    normalizeStateSyncStatusSummary,
} from "../internal/stateSyncStatusSummary";
import { createStandardizedIpcRegistrar } from "../utils";
import { StateSyncHandlerValidators } from "../validators/stateSync";

/**
 * Dependencies required to register state synchronization IPC handlers.
 */
export interface StateSyncHandlersDependencies {
    readonly getStateSyncStatus: () => StateSyncStatusSummary;
    readonly registeredHandlers: Set<IpcInvokeChannel>;
    readonly setStateSyncStatus: (summary: StateSyncStatusSummary) => void;
    readonly uptimeOrchestrator: UptimeOrchestrator;
}

/**
 * Registers IPC handlers responsible for state sync orchestration.
 */
export function registerStateSyncHandlers({
    getStateSyncStatus,
    registeredHandlers,
    setStateSyncStatus,
    uptimeOrchestrator,
}: StateSyncHandlersDependencies): void {
    const register = createStandardizedIpcRegistrar(registeredHandlers);

    register(
        STATE_SYNC_CHANNELS.requestFullSync,
        async () => {
            const sites = await uptimeOrchestrator.getSites();
            const timestamp = Date.now();

            const { revision, sites: sanitizedSites } =
                await uptimeOrchestrator.emitSitesStateSynchronized({
                    action: STATE_SYNC_ACTION.BULK_SYNC,
                    siteIdentifier: "all",
                    sites,
                    source: STATE_SYNC_SOURCE.DATABASE,
                    timestamp,
                });

            const responseSites = sanitizedSites.map((site) =>
                structuredClone(site)
            );

            logger.debug("[IpcService] Full sync completed", {
                siteCount: responseSites.length,
            });

            const summary = createStateSyncStatusSummary({
                lastSyncAt: timestamp,
                siteCount: responseSites.length,
                source: STATE_SYNC_SOURCE.DATABASE,
                synchronized: true,
            });

            setStateSyncStatus(summary);

            return {
                completedAt: timestamp,
                revision,
                siteCount: summary.siteCount,
                sites: responseSites,
                source: summary.source,
                synchronized: summary.synchronized,
            } satisfies StateSyncFullSyncResult;
        },
        StateSyncHandlerValidators.requestFullSync
    );

    register(
        STATE_SYNC_CHANNELS.getSyncStatus,
        () => {
            const currentStatus = getStateSyncStatus();
            const cachedSiteCount = uptimeOrchestrator.getCachedSiteCount();
            const summary = normalizeStateSyncStatusSummary({
                cachedSiteCount,
                currentStatus,
            });

            setStateSyncStatus(summary);
            return summary;
        },
        StateSyncHandlerValidators.getSyncStatus
    );
}
