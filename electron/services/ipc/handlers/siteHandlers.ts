import type { IpcInvokeChannel, IpcInvokeChannelParams } from "@shared/types/ipc";

import { SITES_CHANNELS } from "@shared/types/preload";
import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import { deriveSiteSnapshot } from "@shared/utils/siteSnapshots";

import type { UptimeOrchestrator } from "../../../UptimeOrchestrator";

import { logger } from "../../../utils/logger";
import { createStandardizedIpcRegistrar } from "../utils";
import { SiteHandlerValidators } from "../validators/sites";

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
    const register = createStandardizedIpcRegistrar(registeredHandlers);

    register(
        SITES_CHANNELS.addSite,
        (site: IpcInvokeChannelParams<typeof SITES_CHANNELS.addSite>[0]) =>
            uptimeOrchestrator.addSite(site),
        SiteHandlerValidators.addSite
    );

    register(
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
                        duplicates: snapshot.duplicates,
                        originalSites: sites.length,
                        sanitizedSites: snapshot.sanitizedSites.length,
                    }
                );
            }

            return snapshot.sanitizedSites;
        },
        SiteHandlerValidators.getSites
    );

    register(
        SITES_CHANNELS.updateSite,
        (
            identifier: IpcInvokeChannelParams<typeof SITES_CHANNELS.updateSite>[0],
            updates: IpcInvokeChannelParams<typeof SITES_CHANNELS.updateSite>[1]
        ) =>
            uptimeOrchestrator.updateSite(identifier, updates),
        SiteHandlerValidators.updateSite
    );

    register(
        SITES_CHANNELS.removeSite,
        (identifier: IpcInvokeChannelParams<typeof SITES_CHANNELS.removeSite>[0]) =>
            uptimeOrchestrator.removeSite(identifier),
        SiteHandlerValidators.removeSite
    );

    register(
        SITES_CHANNELS.removeMonitor,
        (
            siteIdentifier: IpcInvokeChannelParams<
                typeof SITES_CHANNELS.removeMonitor
            >[0],
            monitorId: IpcInvokeChannelParams<typeof SITES_CHANNELS.removeMonitor>[1]
        ) =>
            uptimeOrchestrator.removeMonitor(siteIdentifier, monitorId),
        SiteHandlerValidators.removeMonitor
    );

    register(
        SITES_CHANNELS.deleteAllSites,
        () => uptimeOrchestrator.deleteAllSites(),
        SiteHandlerValidators.deleteAllSites
    );

    // No further handlers.
}
