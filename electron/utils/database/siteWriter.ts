/**
 * Site writer utilities for database write operations.
 * Consolidates site creation, updating, and deletion operations.
 */

import { isDev } from "../../electronUtils";
import { MonitorRepository, SiteRepository } from "../../services/database";
import { DatabaseService } from "../../services/database/DatabaseService";
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
    databaseService: DatabaseService;
    siteData: Site;
}

/**
 * Dependencies required for site update operations.
 */
export interface SiteUpdateDependencies {
    monitorRepository: MonitorRepository;
    siteRepository: SiteRepository;
    databaseService: DatabaseService;
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
    /** Database service for transactions */
    databaseService: DatabaseService;
    /** Map of sites in memory for cache management */
    sites: Map<string, Site>;
    /** Logger instance */
    logger: Logger;
}

/**
 * Create a new site in the database with its monitors.
 * This is a pure technical operation - validation should be done by the caller.
 * Uses database transactions to ensure data consistency.
 *
 * @param config - Configuration object with repository instances and site data
 * @returns Promise with the site including monitors with IDs assigned
 */
export async function createSite(config: CreateSiteConfig): Promise<Site> {
    const { databaseService, repositories, siteData } = config;

    logger.info(`Creating new site in database: ${siteData.identifier}`);

    const site: Site = {
        ...siteData,
    };

    // Execute database operations in a transaction
    await databaseService.executeTransaction(async () => {
        // Persist site to DB using repository
        await repositories.site.upsert(site);

        // Remove all existing monitors for this site, then insert new ones using repository
        await repositories.monitor.deleteBySiteIdentifier(site.identifier);

        for (const monitor of site.monitors) {
            // Create monitor using repository and get the new ID
            const newId = await repositories.monitor.create(site.identifier, monitor);
            monitor.id = newId;
        }
    });

    logger.info(`Site created successfully in database: ${site.identifier} (${site.name ?? "unnamed"})`);
    return site;
}

/**
 * Update a site with new values.
 * Uses database transactions to ensure data consistency.
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

    // Create updated site object but don't update cache yet
    const updatedSite: Site = {
        ...site,
        ...updates,
        monitors: updates.monitors || site.monitors,
    };

    // Execute database updates in a transaction
    await deps.databaseService.executeTransaction(async () => {
        await deps.siteRepository.upsert(updatedSite);

        if (updates.monitors) {
            const updatedMonitors = await updateSiteMonitors(deps, identifier, updates.monitors);
            // Update the site object with the correct monitor IDs after database operations
            updatedSite.monitors = updatedMonitors;
        }
    });

    // Handle monitor interval changes after successful database transaction
    if (updates.monitors) {
        await handleMonitorIntervalChanges(deps, callbacks, identifier, site, updatedSite.monitors);
    }

    // Now update the cache with the correct data
    deps.sites.set(site.identifier, updatedSite);

    return updatedSite;
}

/**
 * Delete a site and all its monitors from the database.
 * Also removes the site from the in-memory cache.
 * Uses database transactions to ensure data consistency.
 *
 * @param params - Parameters for removing a site
 * @returns True if the site was found and removed, false otherwise
 */
export async function deleteSite(params: RemoveSiteParams): Promise<boolean> {
    const { databaseService, identifier, logger, repositories, sites } = params;

    logger.info(`Removing site: ${identifier}`);
    const removed = sites.delete(identifier);

    // Execute database operations in a transaction
    await databaseService.executeTransaction(async () => {
        // Remove all monitors and their history for this site using repositories
        await repositories.monitor.deleteBySiteIdentifier(identifier);

        // Remove the site using repository
        await repositories.site.delete(identifier);
    });

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
): Promise<Site["monitors"]> {
    const dbMonitors = await deps.monitorRepository.findBySiteIdentifier(identifier);

    await deleteObsoleteMonitors(deps, dbMonitors, newMonitors);
    const updatedMonitors = await upsertSiteMonitors(deps, identifier, newMonitors);

    return updatedMonitors;
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
 * Fixed to properly handle ID assignment and return updated monitors.
 */
export async function upsertSiteMonitors(
    deps: SiteUpdateDependencies,
    identifier: string,
    monitors: Site["monitors"]
): Promise<Site["monitors"]> {
    const updatedMonitors: Site["monitors"] = [];

    for (const monitor of monitors) {
        // Check if monitor exists in database (handles case where frontend assigns UUID but DB uses integers)
        if (monitor.id && monitor.id.trim() !== "") {
            const existingMonitor = await deps.monitorRepository.findById(monitor.id);
            if (existingMonitor) {
                // Monitor exists, update it
                await deps.monitorRepository.update(monitor.id, monitor);
                updatedMonitors.push(monitor);
            } else {
                // Monitor doesn't exist in DB (likely has frontend-assigned UUID), create new one
                const newId = await deps.monitorRepository.create(identifier, monitor);
                // Create new monitor object with the new ID
                const updatedMonitor = { ...monitor, id: newId };
                updatedMonitors.push(updatedMonitor);
            }
        } else {
            // No ID, definitely create new
            const newId = await deps.monitorRepository.create(identifier, monitor);
            // Create new monitor object with the new ID
            const updatedMonitor = { ...monitor, id: newId };
            updatedMonitors.push(updatedMonitor);
        }
    }

    return updatedMonitors;
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
