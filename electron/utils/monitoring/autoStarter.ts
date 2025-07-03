import type { Site } from "../../types";

type Logger = {
    debug: (message: string, ...args: unknown[]) => void;
    error: (message: string, error?: unknown, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
};

/**
 * Automatically starts monitoring for all monitors in a site.
 * This utility function starts monitoring for new monitors that have been added.
 */
export async function autoStartMonitoring(
    site: Site,
    startMonitoringCallback: (siteIdentifier: string, monitorId?: string) => Promise<unknown>,
    logger: Logger,
    isDev: () => boolean
): Promise<void> {
    logger.debug(`[autoStartMonitoring] Starting monitoring for site: ${site.identifier}`);

    for (const monitor of site.monitors) {
        if (monitor.id) {
            await startMonitoringCallback(site.identifier, String(monitor.id));

            if (isDev()) {
                logger.debug(
                    `[autoStartMonitoring] Auto-started monitoring for monitor ${monitor.id} with interval ${monitor.checkInterval}ms`
                );
            }
        }
    }

    logger.info(`[autoStartMonitoring] Completed starting monitoring for all monitors in site: ${site.identifier}`);
}
