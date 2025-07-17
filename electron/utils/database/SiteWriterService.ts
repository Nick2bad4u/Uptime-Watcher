/**
 * Service for site writing operations.
 * Provides a testable, dependency-injected service for site creation, update, and deletion.
 */

import { Database } from "node-sqlite3-wasm";

import { DatabaseService } from "../../services/database/DatabaseService";
import { SiteRepository } from "../../services/database/SiteRepository";
import { MonitorRepository } from "../../services/database/MonitorRepository";
import { Site, Monitor } from "../../types";
import { withDatabaseOperation } from "../operationalHooks";
import { Logger, SiteCacheInterface, SiteWritingConfig, MonitoringConfig, SiteNotFoundError } from "./interfaces";

/**
 * Service for handling site writing operations.
 * Separates data operations from side effects for better testability.
 */
export class SiteWriterService {
    private readonly repositories: {
        site: SiteRepository;
        monitor: MonitorRepository;
    };
    private readonly logger: Logger;
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
        return withDatabaseOperation(
            async () => {
                this.logger.info(`Creating new site in database: ${siteData.identifier}`);

                const site: Site = { ...siteData };

                // Use executeTransaction for atomic multi-step operation
                await this.databaseService.executeTransaction((db) => {
                    // Persist site to database using internal method
                    this.repositories.site.upsertInternal(db, site);

                    // Remove all existing monitors for this site, then insert new ones
                    this.repositories.monitor.deleteBySiteIdentifierInternal(db, site.identifier);

                    // Create monitors and assign IDs using internal method
                    for (const monitor of site.monitors) {
                        const newId = this.repositories.monitor.createInternal(db, site.identifier, monitor);
                        monitor.id = newId;
                    }

                    return Promise.resolve();
                });

                this.logger.info(
                    `Site created successfully in database: ${site.identifier} (${site.name || "unnamed"})`
                );
                return site;
            },
            "site-writer-create",
            undefined,
            { identifier: siteData.identifier, monitorCount: siteData.monitors.length }
        );
    }

    /**
     * Update a site with new values.
     * Pure data operation without side effects.
     */
    async updateSite(siteCache: SiteCacheInterface, identifier: string, updates: Partial<Site>): Promise<Site> {
        return withDatabaseOperation(
            async () => {
                // Validate input
                const site = this.validateSiteExists(siteCache, identifier);

                // Create updated site
                const updatedSite = this.createUpdatedSite(siteCache, site, updates);

                // Use executeTransaction for atomic multi-step operation
                await this.databaseService.executeTransaction(async (db) => {
                    // Persist to database using internal method
                    this.repositories.site.upsertInternal(db, updatedSite);

                    // Update monitors if provided - UPDATE existing monitors instead of recreating
                    if (updates.monitors) {
                        await this.updateMonitorsPreservingHistory(db, identifier, updates.monitors);
                    }
                });

                this.logger.info(`Site updated successfully: ${identifier}`);
                return updatedSite;
            },
            "site-writer-update",
            undefined,
            { identifier }
        );
    }

    /**
     * Delete a site and all its monitors from the database.
     * Pure data operation without side effects.
     */
    async deleteSite(siteCache: SiteCacheInterface, identifier: string): Promise<boolean> {
        return withDatabaseOperation(
            async () => {
                this.logger.info(`Removing site: ${identifier}`);

                // Remove from cache
                const removed = siteCache.delete(identifier);

                // Use executeTransaction for atomic multi-table deletion
                await this.databaseService.executeTransaction((db) => {
                    // Remove from database using internal methods
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
            },
            "site-writer-delete",
            undefined,
            { identifier }
        );
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
    private validateSiteExists(siteCache: SiteCacheInterface, identifier: string): Site {
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
    private createUpdatedSite(siteCache: SiteCacheInterface, site: Site, updates: Partial<Site>): Site {
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
        const existingMonitors = await this.repositories.monitor.findBySiteIdentifier(siteIdentifier);

        // Process each monitor: update existing or create new
        this.processMonitorUpdates(db, siteIdentifier, newMonitors, existingMonitors);

        // Clean up monitors that are no longer needed
        this.removeObsoleteMonitors(db, siteIdentifier, newMonitors, existingMonitors);
    }

    /**
     * Process monitor updates and creations.
     */
    private processMonitorUpdates(
        db: Database,
        siteIdentifier: string,
        newMonitors: Site["monitors"],
        existingMonitors: Site["monitors"]
    ): void {
        for (const newMonitor of newMonitors) {
            this.processIndividualMonitor(db, siteIdentifier, newMonitor, existingMonitors);
        }
    }

    /**
     * Process a single monitor: update if exists, create if new.
     */
    private processIndividualMonitor(
        db: Database,
        siteIdentifier: string,
        newMonitor: Monitor,
        existingMonitors: Site["monitors"]
    ): void {
        if (newMonitor.id) {
            this.handleExistingMonitor(db, siteIdentifier, newMonitor, existingMonitors);
        } else {
            this.createNewMonitor(db, siteIdentifier, newMonitor);
        }
    }

    /**
     * Handle a monitor that has an ID (existing or orphaned).
     */
    private handleExistingMonitor(
        db: Database,
        siteIdentifier: string,
        newMonitor: Monitor,
        existingMonitors: Site["monitors"]
    ): void {
        const existingMonitor = existingMonitors.find((m) => m.id === newMonitor.id);

        if (existingMonitor) {
            this.updateExistingMonitor(db, siteIdentifier, newMonitor, existingMonitor);
        } else {
            this.createNewMonitor(db, siteIdentifier, newMonitor, "ID not found");
        }
    }

    /**
     * Update an existing monitor in the database.
     */
    private updateExistingMonitor(
        db: Database,
        siteIdentifier: string,
        newMonitor: Monitor,
        existingMonitor: Monitor
    ): void {
        if (!newMonitor.id) {
            return; // Safety check - should not happen in this context
        }

        const updateData = this.buildMonitorUpdateData(newMonitor, existingMonitor);
        this.repositories.monitor.updateInternal(db, newMonitor.id, updateData);
        this.logger.debug(`Updated existing monitor ${newMonitor.id} for site ${siteIdentifier}`);
    }

    /**
     * Build the update data for a monitor, preserving existing state.
     */
    private buildMonitorUpdateData(newMonitor: Monitor, existingMonitor: Monitor): Partial<Monitor> {
        const updateData: Partial<Monitor> = {
            checkInterval: newMonitor.checkInterval,
            monitoring: existingMonitor.monitoring,
            retryAttempts: newMonitor.retryAttempts,
            status: existingMonitor.status,
            timeout: newMonitor.timeout,
            type: newMonitor.type,
        };

        // Only update optional fields if they are defined
        if (newMonitor.host !== undefined) {
            updateData.host = newMonitor.host;
        }
        if (newMonitor.port !== undefined) {
            updateData.port = newMonitor.port;
        }
        if (newMonitor.url !== undefined) {
            updateData.url = newMonitor.url;
        }

        return updateData;
    }

    /**
     * Create a new monitor in the database.
     */
    private createNewMonitor(db: Database, siteIdentifier: string, newMonitor: Monitor, reason?: string): void {
        const newId = this.repositories.monitor.createInternal(db, siteIdentifier, newMonitor);
        newMonitor.id = newId;

        const reasonSuffix = reason ? ` (${reason})` : "";
        this.logger.debug(`Created new monitor ${newId} for site ${siteIdentifier}${reasonSuffix}`);
    }

    /**
     * Remove monitors that are no longer in the site configuration.
     */
    private removeObsoleteMonitors(
        db: Database,
        siteIdentifier: string,
        newMonitors: Site["monitors"],
        existingMonitors: Site["monitors"]
    ): void {
        const newMonitorIds = new Set(newMonitors.map((m) => m.id).filter(Boolean));

        for (const existingMonitor of existingMonitors) {
            if (!newMonitorIds.has(existingMonitor.id)) {
                this.repositories.monitor.deleteInternal(db, existingMonitor.id);
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
    async deleteSite(siteCache: SiteCacheInterface, identifier: string): Promise<boolean> {
        return this.siteWriterService.deleteSite(siteCache, identifier);
    }

    /**
     * Update a site with monitoring state handling.
     * Coordinates data updates with monitoring side effects.
     */
    async updateSiteWithMonitoring(
        siteCache: SiteCacheInterface,
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
