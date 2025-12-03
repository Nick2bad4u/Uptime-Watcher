import type { IpcInvokeChannel } from "@shared/types/ipc";
import type { DuplicateSiteIdentifier } from "@shared/validation/siteIntegrity";

import { SITES_CHANNELS } from "@shared/types/preload";
import { deriveSiteSnapshot } from "@shared/utils/siteSnapshots";

import type { UptimeOrchestrator } from "../../../UptimeOrchestrator";

import { logger } from "../../../utils/logger";
import { registerStandardizedIpcHandler } from "../utils";
import { SiteHandlerValidators } from "../validators";
import { withIgnoredIpcEvent } from "./handlerShared";

/**
 * Dependencies required to register site CRUD IPC handlers.
 */
export interface SiteHandlersDependencies {
    readonly registeredHandlers: Set<IpcInvokeChannel>;
    readonly uptimeOrchestrator: UptimeOrchestrator;
}

/**
 * Registers IPC handlers for site lifecycle operations.
 */
export function registerSiteHandlers({
    registeredHandlers,
    uptimeOrchestrator,
}: SiteHandlersDependencies): void {
    registerStandardizedIpcHandler(
        SITES_CHANNELS.addSite,
        withIgnoredIpcEvent((site) => uptimeOrchestrator.addSite(site)),
        SiteHandlerValidators.addSite,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        SITES_CHANNELS.deleteAllSites,
        withIgnoredIpcEvent(async () => {
            logger.info("delete-all-sites IPC handler called");
            const result = await uptimeOrchestrator.deleteAllSites();
            logger.info(`delete-all-sites completed, deleted ${result} sites`);
            return result;
        }),
        SiteHandlerValidators.deleteAllSites,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        SITES_CHANNELS.removeSite,
        withIgnoredIpcEvent((siteIdentifier) =>
            uptimeOrchestrator.removeSite(siteIdentifier)
        ),
        SiteHandlerValidators.removeSite,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        SITES_CHANNELS.getSites,
        withIgnoredIpcEvent(async () => {
            const sites = await uptimeOrchestrator.getSites();
            const snapshot = deriveSiteSnapshot(sites);

            if (snapshot.duplicates.length > 0) {
                logger.error(
                    "[IpcService] Duplicate site identifiers detected in get-sites response",
                    undefined,
                    {
                        duplicateCount: snapshot.duplicates.length,
                        duplicates: snapshot.duplicates.map(
                            (entry: DuplicateSiteIdentifier) => ({
                                identifier: entry.identifier,
                                occurrences: entry.occurrences,
                            })
                        ),
                        originalSites: sites.length,
                        sanitizedSites: snapshot.sanitizedSites.length,
                    }
                );
            }

            return snapshot.sanitizedSites.map((site) => structuredClone(site));
        }),
        SiteHandlerValidators.getSites,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        SITES_CHANNELS.updateSite,
        withIgnoredIpcEvent((siteIdentifier, updates) =>
            uptimeOrchestrator.updateSite(siteIdentifier, updates)
        ),
        SiteHandlerValidators.updateSite,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        SITES_CHANNELS.removeMonitor,
        withIgnoredIpcEvent((siteIdentifier, monitorIdentifier) =>
            uptimeOrchestrator.removeMonitor(siteIdentifier, monitorIdentifier)
        ),
        SiteHandlerValidators.removeMonitor,
        registeredHandlers
    );
}
