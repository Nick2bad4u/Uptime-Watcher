import type { IpcInvokeChannel } from "@shared/types/ipc";
import type { DuplicateSiteIdentifier } from "@shared/validation/siteIntegrity";

import { SITES_CHANNELS } from "@shared/types/preload";
import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";
import { deriveSiteSnapshot } from "@shared/utils/siteSnapshots";

import type { UptimeOrchestrator } from "../../../UptimeOrchestrator";

import { logger } from "../../../utils/logger";
import { registerStandardizedIpcHandler } from "../utils";
import { SiteHandlerValidators } from "../validators";

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
        (site) => uptimeOrchestrator.addSite(site),
        SiteHandlerValidators.addSite,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        SITES_CHANNELS.deleteAllSites,
        async () => {
            logger.info(
                LOG_TEMPLATES.services.IPC_DELETE_ALL_SITES_HANDLER_CALLED
            );

            const deletedCount = await uptimeOrchestrator.deleteAllSites();

            logger.info(
                interpolateLogTemplate(
                    LOG_TEMPLATES.services.IPC_DELETE_ALL_SITES_COMPLETED,
                    { deletedCount }
                )
            );

            return deletedCount;
        },
        SiteHandlerValidators.deleteAllSites,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        SITES_CHANNELS.removeSite,
        (siteIdentifier) => uptimeOrchestrator.removeSite(siteIdentifier),
        SiteHandlerValidators.removeSite,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        SITES_CHANNELS.getSites,
        async () => {
            const sites = await uptimeOrchestrator.getSites();
            const snapshot = deriveSiteSnapshot(sites);

            if (snapshot.duplicates.length > 0) {
                logger.error(
                    LOG_TEMPLATES.errors
                        .IPC_DUPLICATE_SITES_IN_GET_SITES_RESPONSE,
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
        },
        SiteHandlerValidators.getSites,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        SITES_CHANNELS.updateSite,
        (siteIdentifier, updates) =>
            uptimeOrchestrator.updateSite(siteIdentifier, updates),
        SiteHandlerValidators.updateSite,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        SITES_CHANNELS.removeMonitor,
        (siteIdentifier, monitorIdentifier) =>
            uptimeOrchestrator.removeMonitor(siteIdentifier, monitorIdentifier),
        SiteHandlerValidators.removeMonitor,
        registeredHandlers
    );
}
