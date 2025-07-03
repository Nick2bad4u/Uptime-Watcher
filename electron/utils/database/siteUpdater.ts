import { MonitorRepository } from "../../services/database/MonitorRepository";
import { SiteRepository } from "../../services/database/SiteRepository";
import { Site } from "../../types";
import { isDev } from "../../utils";
import { logger } from "../../utils/logger";

/**
 * Dependencies required for site update operations.
 */
export interface SiteUpdateDependencies {
    monitorRepository: MonitorRepository;
    siteRepository: SiteRepository;
    sites: Map<string, Site>;
    logger: typeof logger;
}

/**
 * Callbacks for recursive operations to support test mocking.
 */
export interface SiteUpdateCallbacks {
    stopMonitoringForSite: (identifier: string, monitorId?: string) => Promise<boolean>;
    startMonitoringForSite: (identifier: string, monitorId?: string) => Promise<boolean>;
}

/**
 * Update a site with new values.
 */
export async function updateSite(
    deps: SiteUpdateDependencies,
    callbacks: SiteUpdateCallbacks,
    identifier: string,
    updates: Partial<Site>
): Promise<Site> {
    const site = validateUpdateSiteInput(deps, identifier);
    const updatedSite = createUpdatedSite(deps, site, updates);

    await deps.siteRepository.upsert(updatedSite);

    if (updates.monitors) {
        await updateSiteMonitors(deps, identifier, updates.monitors);
        await handleMonitorIntervalChanges(deps, callbacks, identifier, site, updates.monitors);
    }

    return updatedSite;
}

/**
 * Validate input parameters for updateSite operation.
 */
export function validateUpdateSiteInput(deps: SiteUpdateDependencies, identifier: string): Site {
    if (!identifier) {
        throw new Error("Site identifier is required");
    }

    const site = deps.sites.get(identifier);
    if (!site) {
        throw new Error(`Site not found: ${identifier}`);
    }

    return site;
}

/**
 * Create updated site object with new values.
 */
export function createUpdatedSite(deps: SiteUpdateDependencies, site: Site, updates: Partial<Site>): Site {
    const updatedSite: Site = {
        ...site,
        ...updates,
        monitors: updates.monitors || site.monitors,
    };
    deps.sites.set(site.identifier, updatedSite);
    return updatedSite;
}

/**
 * Update monitors in the database for a site.
 */
export async function updateSiteMonitors(
    deps: SiteUpdateDependencies,
    identifier: string,
    newMonitors: Site["monitors"]
): Promise<void> {
    const dbMonitors = await deps.monitorRepository.findBySiteIdentifier(identifier);

    await deleteObsoleteMonitors(deps, dbMonitors, newMonitors);
    await upsertSiteMonitors(deps, identifier, newMonitors);
}

/**
 * Delete monitors that are no longer in the updated monitors array.
 */
export async function deleteObsoleteMonitors(
    deps: SiteUpdateDependencies,
    dbMonitors: Site["monitors"],
    newMonitors: Site["monitors"]
): Promise<void> {
    const toDelete = dbMonitors.filter((dbm) => !newMonitors.some((m) => String(m.id) === String(dbm.id)));

    for (const monitor of toDelete) {
        if (monitor.id) {
            await deps.monitorRepository.delete(monitor.id);
        }
    }
}

/**
 * Create or update monitors in the database.
 */
export async function upsertSiteMonitors(
    deps: SiteUpdateDependencies,
    identifier: string,
    monitors: Site["monitors"]
): Promise<void> {
    for (const monitor of monitors) {
        if (monitor.id && !isNaN(Number(monitor.id))) {
            await deps.monitorRepository.update(monitor.id, monitor);
        } else {
            const newId = await deps.monitorRepository.create(identifier, monitor);
            monitor.id = newId;
        }
    }
}

/**
 * Handle monitor interval changes and restart monitoring if needed.
 */
async function handleMonitorIntervalChanges(
    deps: SiteUpdateDependencies,
    callbacks: SiteUpdateCallbacks,
    identifier: string,
    originalSite: Site,
    updatedMonitors: Site["monitors"]
): Promise<void> {
    for (const updatedMonitor of updatedMonitors) {
        const prevMonitor = originalSite.monitors.find((m) => String(m.id) === String(updatedMonitor.id));
        if (!prevMonitor) continue;

        const intervalChanged = hasIntervalChanged(updatedMonitor, prevMonitor);
        if (intervalChanged) {
            await restartMonitorForIntervalChange(deps, callbacks, identifier, updatedMonitor, prevMonitor);
        }
    }
}

/**
 * Check if the monitor's check interval has changed.
 */
function hasIntervalChanged(updatedMonitor: Site["monitors"][0], prevMonitor: Site["monitors"][0]): boolean {
    return (
        typeof updatedMonitor.checkInterval === "number" && updatedMonitor.checkInterval !== prevMonitor.checkInterval
    );
}

/**
 * Restart monitoring for a monitor with changed interval.
 */
async function restartMonitorForIntervalChange(
    deps: SiteUpdateDependencies,
    callbacks: SiteUpdateCallbacks,
    identifier: string,
    updatedMonitor: Site["monitors"][0],
    prevMonitor: Site["monitors"][0]
): Promise<void> {
    if (isDev()) {
        deps.logger.debug(
            `[updateSite] Restarting monitor ${updatedMonitor.id}: interval changed from ${prevMonitor.checkInterval}ms to ${updatedMonitor.checkInterval}ms`
        );
    }

    const wasMonitoring = prevMonitor.monitoring ?? false;
    await callbacks.stopMonitoringForSite(identifier, String(updatedMonitor.id));

    if (wasMonitoring) {
        await callbacks.startMonitoringForSite(identifier, String(updatedMonitor.id));
    }
}
