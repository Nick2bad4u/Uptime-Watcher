/**
 * Service for site writing operations.
 * Provides a testable, dependency-injected service for site creation, update, and deletion.
 */

import { Database } from "node-sqlite3-wasm";

import { DatabaseService } from "../../services/index";
import { Site, Monitor } from "../../types";
import {
    ILogger,
    ISiteRepository,
    IMonitorRepository,
    ISiteCache,
    SiteWritingConfig,
    MonitoringConfig,
    SiteNotFoundError,
    SiteCreationError,
    SiteUpdateError,
    SiteDeletionError,
} from "./interfaces";

/**
 * Service for handling site writing operations.
 * Separates data operations from side effects for better testability.
 */
export class SiteWriterService {
    private readonly repositories: {
        site: ISiteRepository;
        monitor: IMonitorRepository;
    };
    private readonly logger: ILogger;
    private readonly databaseService: DatabaseService;

    constructor(config: SiteWritingConfig & { databaseService: DatabaseService }) {
        this.repositories = config.repositories;
        this.logger = config.logger;
        this.databaseService = config.databaseService;
    }

    /**
     * Create a new site in the database with its monitors.
     * Pure data operation without side effects.
     */
    async createSite(siteData: Site): Promise<Site> {
        try {
            this.logger.info(`Creating new site in database: ${siteData.identifier}`);

            const site: Site = { ...siteData };

            // Use transaction for atomicity
            await this.databaseService.executeTransaction((db) => {
                // Persist site to database using internal method to avoid nested transactions
                this.repositories.site.upsertInternal(db, site);

                // Remove all existing monitors for this site, then insert new ones
                this.repositories.monitor.deleteBySiteIdentifierInternal(db, site.identifier);

                // Create monitors and assign IDs using internal method to avoid nested transactions
                for (const monitor of site.monitors) {
                    const newId = this.repositories.monitor.createInternal(db, site.identifier, monitor);
                    monitor.id = newId;
                }

                return Promise.resolve();
            });

            this.logger.info(`Site created successfully in database: ${site.identifier} (${site.name ?? "unnamed"})`);
            return site;
        } catch (error) {
            const message = `Failed to create site ${siteData.identifier}: ${error instanceof Error ? error.message : String(error)}`;
            this.logger.error(message, error);
            throw new SiteCreationError(siteData.identifier, error instanceof Error ? error : undefined);
        }
    }

    /**
     * Update a site with new values.
     * Pure data operation without side effects.
     */
    async updateSite(siteCache: ISiteCache, identifier: string, updates: Partial<Site>): Promise<Site> {
        try {
            // Validate input
            const site = this.validateSiteExists(siteCache, identifier);

            // Create updated site
            const updatedSite = this.createUpdatedSite(siteCache, site, updates);

            // Use transaction for atomicity
            await this.databaseService.executeTransaction((db) => {
                // Persist to database using internal method to avoid nested transactions
                this.repositories.site.upsertInternal(db, updatedSite);

                // Update monitors if provided - UPDATE existing monitors instead of recreating
                if (updates.monitors) {
                    return this.updateMonitorsPreservingHistory(db, identifier, updates.monitors);
                }
                return Promise.resolve();
            });

            this.logger.info(`Site updated successfully: ${identifier}`);
            return updatedSite;
        } catch (error) {
            if (error instanceof SiteNotFoundError) {
                throw error;
            }
            const message = `Failed to update site ${identifier}: ${error instanceof Error ? error.message : String(error)}`;
            this.logger.error(message, error);
            throw new SiteUpdateError(identifier, error instanceof Error ? error : undefined);
        }
    }

    /**
     * Delete a site and all its monitors from the database.
     * Pure data operation without side effects.
     */
    async deleteSite(siteCache: ISiteCache, identifier: string): Promise<boolean> {
        try {
            this.logger.info(`Removing site: ${identifier}`);

            // Remove from cache
            const removed = siteCache.delete(identifier);

            // Use transaction for atomicity
            await this.databaseService.executeTransaction((db) => {
                // Remove from database using internal methods to avoid nested transactions
                this.repositories.monitor.deleteBySiteIdentifierInternal(db, identifier);
                this.repositories.site.deleteInternal(db, identifier);
                return Promise.resolve();
            });

            if (removed) {
                this.logger.info(`Site removed successfully: ${identifier}`);
            } else {
                this.logger.warn(`Site not found in cache for removal: ${identifier}`);
            }

            return removed;
        } catch (error) {
            const message = `Failed to delete site ${identifier}: ${error instanceof Error ? error.message : String(error)}`;
            this.logger.error(message, error);
            throw new SiteDeletionError(identifier, error instanceof Error ? error : undefined);
        }
    }

    /**
     * Handle monitoring state changes when monitor intervals are modified.
     * Side effect operation separated from data updates.
     */
    async handleMonitorIntervalChanges(
        identifier: string,
        originalSite: Site,
        newMonitors: Site["monitors"],
        monitoringConfig: MonitoringConfig
    ): Promise<void> {
        // Always handle monitor interval changes in both development and production

        try {
            for (const newMonitor of newMonitors) {
                const originalMonitor = originalSite.monitors.find((m) => m.id === newMonitor.id);

                if (originalMonitor?.checkInterval !== newMonitor.checkInterval) {
                    this.logger.debug(
                        `Monitor ${newMonitor.id} interval changed from ${originalMonitor?.checkInterval} to ${newMonitor.checkInterval}`
                    );

                    if (newMonitor.id) {
                        // Always stop to clean up any existing scheduling
                        await monitoringConfig.stopMonitoring(identifier, newMonitor.id);

                        // Only restart if the monitor was actually monitoring
                        if (originalMonitor?.monitoring) {
                            await monitoringConfig.startMonitoring(identifier, newMonitor.id);
                        }
                    }
                }
            }
        } catch (error) {
            this.logger.error(`Failed to handle monitor interval changes for site ${identifier}:`, error);
            // Don't throw - this is a side effect operation that shouldn't fail the update
        }
    }

    /**
     * Validate that a site exists in the cache.
     */
    private validateSiteExists(siteCache: ISiteCache, identifier: string): Site {
        if (!identifier) {
            throw new SiteNotFoundError("Site identifier is required");
        }

        const site = siteCache.get(identifier);
        if (!site) {
            throw new SiteNotFoundError(identifier);
        }

        return site;
    }

    /**
     * Create updated site object with new values.
     */
    private createUpdatedSite(siteCache: ISiteCache, site: Site, updates: Partial<Site>): Site {
        const updatedSite: Site = {
            ...site,
            ...updates,
            monitors: updates.monitors ?? site.monitors,
        };
        siteCache.set(site.identifier, updatedSite);
        return updatedSite;
    }

    /**
     * Update monitors preserving their history and IDs.
     * This method updates existing monitors and creates new ones as needed.
     */
    private async updateMonitorsPreservingHistory(
        db: Database,
        siteIdentifier: string,
        newMonitors: Site["monitors"]
    ): Promise<void> {
        // Get existing monitors for this site
        const existingMonitors = await this.repositories.monitor.findBySiteIdentifier(siteIdentifier);

        // Update or create monitors
        for (const newMonitor of newMonitors) {
            if (newMonitor.id) {
                // Existing monitor - look for it in the database
                const existingMonitor = existingMonitors.find((m) => m.id === newMonitor.id);
                if (existingMonitor) {
                    const updateData: Partial<Monitor> = {
                        checkInterval: newMonitor.checkInterval,
                        monitoring: existingMonitor.monitoring,
                        retryAttempts: newMonitor.retryAttempts,
                        status: existingMonitor.status,
                        timeout: newMonitor.timeout,
                        type: newMonitor.type,
                    };
                    if (newMonitor.host !== undefined) {
                        updateData.host = newMonitor.host;
                    }
                    if (newMonitor.port !== undefined) {
                        updateData.port = newMonitor.port;
                    }
                    if (newMonitor.url !== undefined) {
                        updateData.url = newMonitor.url;
                    }
                    this.repositories.monitor.updateInternal(db, newMonitor.id, updateData);
                    this.logger.debug(`Updated existing monitor ${newMonitor.id} for site ${siteIdentifier}`);
                } else {
                    // Monitor ID exists but not found in database - treat as new
                    const newId = this.repositories.monitor.createInternal(db, siteIdentifier, newMonitor);
                    // Update the monitor object with the new database ID
                    newMonitor.id = newId;
                    this.logger.debug(`Created new monitor ${newId} for site ${siteIdentifier} (ID not found)`);
                }
            } else {
                // New monitor - create it
                const newId = this.repositories.monitor.createInternal(db, siteIdentifier, newMonitor);
                // Update the monitor object with the new database ID
                newMonitor.id = newId;
                this.logger.debug(`Created new monitor ${newId} for site ${siteIdentifier}`);
            }
        }

        // Remove monitors that are no longer in the site configuration
        const newMonitorIds = new Set(newMonitors.map((m) => m.id).filter(Boolean));
        for (const existingMonitor of existingMonitors) {
            if (!newMonitorIds.has(existingMonitor.id)) {
                // This monitor was removed from the site - delete it using internal method (we're already in a transaction)
                this.repositories.monitor.deleteMonitorInternal(db, existingMonitor.id);
                this.logger.debug(`Removed monitor ${existingMonitor.id} from site ${siteIdentifier}`);
            }
        }
    }

    /**
     * Detect new monitors that were added to an existing site.
     * @param originalMonitors - The original monitors before update
     * @param updatedMonitors - The updated monitors after update
     * @returns Array of new monitor IDs
     */
    public detectNewMonitors(originalMonitors: Site["monitors"], updatedMonitors: Site["monitors"]): string[] {
        const originalIds = new Set(originalMonitors.map((m) => m.id).filter(Boolean));
        const newMonitorIds: string[] = [];

        for (const monitor of updatedMonitors) {
            if (monitor.id && !originalIds.has(monitor.id)) {
                newMonitorIds.push(monitor.id);
            }
        }

        return newMonitorIds;
    }
}

/**
 * Orchestrates site writing operations with monitoring side effects.
 * Coordinates data operations with monitoring state changes.
 */
export class SiteWritingOrchestrator {
    private readonly siteWriterService: SiteWriterService;

    constructor(siteWriterService: SiteWriterService) {
        this.siteWriterService = siteWriterService;
    }

    /**
     * Create a new site in the database.
     * Pure data operation delegated to the service.
     */
    async createSite(siteData: Site): Promise<Site> {
        return this.siteWriterService.createSite(siteData);
    }

    /**
     * Delete a site from the database.
     * Pure data operation delegated to the service.
     */
    async deleteSite(siteCache: ISiteCache, identifier: string): Promise<boolean> {
        return this.siteWriterService.deleteSite(siteCache, identifier);
    }

    /**
     * Update a site with monitoring state handling.
     * Coordinates data updates with monitoring side effects.
     */
    async updateSiteWithMonitoring(
        siteCache: ISiteCache,
        identifier: string,
        updates: Partial<Site>,
        monitoringConfig: MonitoringConfig
    ): Promise<Site> {
        // Get original site before update
        const originalSite = siteCache.get(identifier);
        if (!originalSite) {
            throw new SiteNotFoundError(identifier);
        }

        // Perform the update
        const updatedSite = await this.siteWriterService.updateSite(siteCache, identifier, updates);

        // Handle monitoring changes if monitors were updated
        if (updates.monitors) {
            await this.siteWriterService.handleMonitorIntervalChanges(
                identifier,
                originalSite,
                updates.monitors,
                monitoringConfig
            );

            // Detect and setup new monitors to ensure consistency with new site behavior
            const newMonitorIds = this.siteWriterService.detectNewMonitors(originalSite.monitors, updates.monitors);
            if (newMonitorIds.length > 0) {
                await monitoringConfig.setupNewMonitors(updatedSite, newMonitorIds);
            }
        }

        return updatedSite;
    }
}
