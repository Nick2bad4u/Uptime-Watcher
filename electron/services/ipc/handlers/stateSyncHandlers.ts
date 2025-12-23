import type { IpcInvokeChannel } from "@shared/types/ipc";
import type {
    StateSyncFullSyncResult,
    StateSyncStatusSummary,
} from "@shared/types/stateSync";

import { STATE_SYNC_CHANNELS } from "@shared/types/preload";
import { STATE_SYNC_ACTION, STATE_SYNC_SOURCE } from "@shared/types/stateSync";

import type { UptimeOrchestrator } from "../../../UptimeOrchestrator";

import { logger } from "../../../utils/logger";
import { registerStandardizedIpcHandler } from "../utils";
import { StateSyncHandlerValidators } from "../validators";

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
    registerStandardizedIpcHandler(
        STATE_SYNC_CHANNELS.requestFullSync,
        async () => {
            const sites = await uptimeOrchestrator.getSites();
            const timestamp = Date.now();

            const sanitizedSites =
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

            setStateSyncStatus({
                lastSyncAt: timestamp,
                siteCount: responseSites.length,
                source: STATE_SYNC_SOURCE.DATABASE,
                synchronized: true,
            });

            return {
                completedAt: timestamp,
                siteCount: responseSites.length,
                sites: responseSites,
                source: STATE_SYNC_SOURCE.DATABASE,
                synchronized: true,
            } satisfies StateSyncFullSyncResult;
        },
        StateSyncHandlerValidators.requestFullSync,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        STATE_SYNC_CHANNELS.getSyncStatus,
        () => {
            const currentStatus = getStateSyncStatus();
            const cachedSiteCount = uptimeOrchestrator.getCachedSiteCount();
            const hasTrustedDatabaseSummary =
                currentStatus.synchronized &&
                currentStatus.source === STATE_SYNC_SOURCE.DATABASE;

            // Normalize missing timestamps to an explicit null for consistency
            // with renderer expectations and serialization.
            const lastSyncAt = currentStatus.lastSyncAt ?? null;

            const normalizedCachedSiteCount = Number.isFinite(cachedSiteCount)
                ? cachedSiteCount
                : 0;

            const normalizedSiteCount =
                typeof currentStatus.siteCount === "number" &&
                Number.isFinite(currentStatus.siteCount)
                    ? currentStatus.siteCount
                    : normalizedCachedSiteCount;

            const summary: StateSyncStatusSummary = hasTrustedDatabaseSummary
                ? {
                      lastSyncAt,
                      siteCount: normalizedSiteCount,
                      source: STATE_SYNC_SOURCE.DATABASE,
                      synchronized: true,
                  }
                : {
                      lastSyncAt,
                      siteCount: normalizedCachedSiteCount,
                      source: STATE_SYNC_SOURCE.CACHE,
                      synchronized: false,
                  };

            setStateSyncStatus(summary);
            return summary;
        },
        StateSyncHandlerValidators.getSyncStatus,
        registeredHandlers
    );
}
