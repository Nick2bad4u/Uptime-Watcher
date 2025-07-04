/**
 * Site writer utilities for database write operations.
 * Consolidates site creation, updating, and deletion operations.
 */

import { isDev } from "../../electronUtils";
import { MonitorRepository, SiteRepository } from "../../services/database";
import { Site } from "../../types";
import { monitorLogger as logger } from "../logger";

type Logger = {
    debug: (message: string, ...args: unknown[]) => void;
    error: (message: string, error?: unknown, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
};

/**
 * Configuration object for createSite function.
 */
export interface CreateSiteConfig {
    repositories: {
        monitor: MonitorRepository;
        site: SiteRepository;
    };
    siteData: Site;
}

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
 * Parameters for removing a site from the database.
 */
export interface RemoveSiteParams {
    /** Site identifier to remove */
    identifier: string;
    /** Repository instances */
    repositories: {
        site: SiteRepository;
        monitor: MonitorRepository;
    };
    /** Map of sites in memory for cache management */
    sites: Map<string, Site>;
    /** Logger instance */
    logger: Logger;
}

/**
 * Create a new site in the database with its monitors.
 * This is a pure technical operation - validation should be done by the caller.
 *
 * @param config - Configuration object with repository instances and site data
 * @returns Promise with the site including monitors with IDs assigned
 */
export async function createSite(config: CreateSiteConfig): Promise<Site> {
    const { repositories, siteData } = config;

    logger.info(`Creating new site in database: ${siteData.identifier}`);

    const site: Site = {
        ...siteData,
    };

    // Persist site to DB using repository
    await repositories.site.upsert(site);

    // Remove all existing monitors for this site, then insert new ones using repository
    await repositories.monitor.deleteBySiteIdentifier(site.identifier);

    for (const monitor of site.monitors) {
        // Create monitor using repository and get the new ID
        const newId = await repositories.monitor.create(site.identifier, monitor);
        monitor.id = newId;
    }

    logger.info(`Site created successfully in database: ${site.identifier} (${site.name ?? "unnamed"})`);
    return site;
}

/**
 * Update a site with new values.
 *
 * @param deps - Dependencies for the update operation
 * @param callbacks - Callbacks for monitoring operations
 * @param identifier - Site identifier to update
 * @param updates - Partial site object with updates
 * @returns Promise with the updated site
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
 * Delete a site and all its monitors from the database.
 * Also removes the site from the in-memory cache.
 *
 * @param params - Parameters for removing a site
 * @returns True if the site was found and removed, false otherwise
 */
export async function deleteSite(params: RemoveSiteParams): Promise<boolean> {
    const { identifier, logger, repositories, sites } = params;

    logger.info(`Removing site: ${identifier}`);
    const removed = sites.delete(identifier);

    // Remove all monitors and their history for this site using repositories
    await repositories.monitor.deleteBySiteIdentifier(identifier);

    // Remove the site using repository
    await repositories.site.delete(identifier);

    if (removed) {
        logger.info(`Site removed successfully: ${identifier}`);
    } else {
        logger.warn(`Site not found for removal: ${identifier}`);
    }

    return removed;
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
 * Handle monitoring state changes when monitor intervals are modified.
 */
async function handleMonitorIntervalChanges(
    deps: SiteUpdateDependencies,
    callbacks: SiteUpdateCallbacks,
    identifier: string,
    originalSite: Site,
    newMonitors: Site["monitors"]
): Promise<void> {
    if (!isDev()) {
        return; // Skip in production
    }

    for (const newMonitor of newMonitors) {
        const originalMonitor = originalSite.monitors.find((m) => m.id === newMonitor.id);

        if (originalMonitor?.checkInterval !== newMonitor.checkInterval) {
            deps.logger.debug(
                `Monitor ${newMonitor.id} interval changed from ${originalMonitor?.checkInterval} to ${newMonitor.checkInterval}`
            );

            if (newMonitor.id) {
                // Always stop to clean up any existing scheduling
                await callbacks.stopMonitoringForSite(identifier, newMonitor.id);

                // Only restart if the monitor was actually monitoring
                if (originalMonitor?.monitoring) {
                    await callbacks.startMonitoringForSite(identifier, newMonitor.id);
                }
            }
        }
    }
}
