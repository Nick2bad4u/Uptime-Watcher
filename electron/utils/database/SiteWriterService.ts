/**
 * Service for site writing operations.
 * Provides a testable, dependency-injected service for site creation, update, and deletion.
 */

import { Database } from "node-sqlite3-wasm";

import { DatabaseService } from "../../services/database/DatabaseService";
import { MonitorRepository } from "../../services/database/MonitorRepository";
import { SiteRepository } from "../../services/database/SiteRepository";
import { Monitor, Site } from "../../types";
import { StandardizedCache } from "../cache/StandardizedCache";
import { withDatabaseOperation } from "../operationalHooks";
import { Logger, MonitoringConfig, SiteNotFoundError, SiteWritingConfig } from "./interfaces";

/**
 * Service for handling site writing operations.
 * Separates data operations from side effects for better testability.
 */
export class SiteWriterService {
    private readonly databaseService: DatabaseService;
    private readonly logger: Logger;
    private readonly repositories: {
        monitor: MonitorRepository;
        site: SiteRepository;
    };

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

                const site: Site = {
                    ...siteData,
                };

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
     * Delete a site and all its monitors from the database.
     * Pure data operation without side effects.
     */
    async deleteSite(sitesCache: StandardizedCache<Site>, identifier: string): Promise<boolean> {
        return withDatabaseOperation(
            async () => {
                this.logger.info(`Removing site: ${identifier}`);

                // Remove from cache
                const removed = sitesCache.delete(identifier);

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
     * Detect new monitors that were added to an existing site.
     *
     * @param originalMonitors - The original monitors before update
     * @param updatedMonitors - The updated monitors after update
     * @returns Array of new monitor IDs (may include empty strings for monitors without IDs)
     *
     * @remarks
     * This method handles two scenarios:
     * 1. **Monitors with IDs**: Compares IDs to detect new ones
     * 2. **Monitors without IDs**: Detects new monitors by comparing monitor objects
     *    since IDs are assigned during database creation
     *
     * Monitors without IDs are returned with empty string placeholders to indicate
     * they need special handling during monitor setup operations.
     */
    public detectNewMonitors(originalMonitors: Site["monitors"], updatedMonitors: Site["monitors"]): string[] {
        const originalIds = new Set(originalMonitors.map((m) => m.id).filter(Boolean));
        const newMonitorIds: string[] = [];

        // Create a comparison set of original monitors for detecting new monitors without IDs
        const originalMonitorSignatures = new Set(originalMonitors.map((m) => this.createMonitorSignature(m)));

        for (const monitor of updatedMonitors) {
            if (monitor.id && !originalIds.has(monitor.id)) {
                // Monitor has ID and is not in original set
                newMonitorIds.push(monitor.id);
            } else if (!monitor.id) {
                // Monitor without ID - check if it's genuinely new by comparing signature
                const monitorSignature = this.createMonitorSignature(monitor);
                if (!originalMonitorSignatures.has(monitorSignature)) {
                    // New monitor without ID - use empty string as placeholder
                    newMonitorIds.push("");
                }
            }
        }

        return newMonitorIds;
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
     * Update a site with new values.
     * Pure data operation without side effects.
     */
    async updateSite(sitesCache: StandardizedCache<Site>, identifier: string, updates: Partial<Site>): Promise<Site> {
        return withDatabaseOperation(
            async () => {
                // Validate input
                const site = this.validateSiteExists(sitesCache, identifier);

                // Create updated site
                const updatedSite = this.createUpdatedSite(sitesCache, site, updates);

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
     * Create a unique signature for a monitor based on its configuration.
     *
     * @param monitor - The monitor to create a signature for
     * @returns A string signature representing the monitor's configuration
     *
     * @remarks
     * Used to detect new monitors that don't have IDs yet. The signature includes
     * all configuration properties that make a monitor unique, excluding runtime
     * properties like status, lastChecked, and responseTime.
     */
    private createMonitorSignature(monitor: Site["monitors"][0]): string {
        return [
            `type:${monitor.type}`,
            `host:${monitor.host ?? ""}`,
            `port:${monitor.port ?? ""}`,
            `url:${monitor.url ?? ""}`,
            `checkInterval:${monitor.checkInterval}`,
            `timeout:${monitor.timeout}`,
            `retryAttempts:${monitor.retryAttempts}`,
        ].join("|");
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
     * Create updated site object with new values.
     */
    private createUpdatedSite(sitesCache: StandardizedCache<Site>, site: Site, updates: Partial<Site>): Site {
        const updatedSite: Site = {
            ...site,
            ...updates,
            monitors: updates.monitors ?? site.monitors,
        };
        sitesCache.set(site.identifier, updatedSite);
        return updatedSite;
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
     * Validate that a site exists in the cache.
     */
    private validateSiteExists(sitesCache: StandardizedCache<Site>, identifier: string): Site {
        if (!identifier) {
            throw new SiteNotFoundError("Site identifier is required");
        }

        const site = sitesCache.get(identifier);
        if (!site) {
            throw new SiteNotFoundError(identifier);
        }

        return site;
    }
}
