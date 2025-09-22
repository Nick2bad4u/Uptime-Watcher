/**
 * Service for site writing operations with dependency injection.
 *
 * @remarks
 * Provides a testable, dependency-injected service for site creation, updates,
 * and monitor management operations. Separates data operations from side
 * effects for better testability and maintains consistency with the repository
 * pattern.
 *
 * @packageDocumentation
 */

import type { Monitor, Site } from "@shared/types";
import type { MonitorRow } from "@shared/types/database";
import type { Logger } from "@shared/utils/logger/interfaces";
import type { Database } from "node-sqlite3-wasm";

import type { DatabaseService } from "../../services/database/DatabaseService";
import type { MonitorRepository } from "../../services/database/MonitorRepository";
import type { SiteRepository } from "../../services/database/SiteRepository";
import type { StandardizedCache } from "../cache/StandardizedCache";
import type { MonitoringConfig, SiteWritingConfig } from "./interfaces";

import { rowsToMonitors } from "../../services/database/utils/monitorMapper";
import { withDatabaseOperation } from "../operationalHooks";
import { SiteNotFoundError } from "./interfaces";

/**
 * Service for handling site writing operations. Separates data operations from
 * side effects for better testability.
 */

/**
 * Common SQL queries for site writer operations.
 *
 * @remarks
 * Centralizes query strings for maintainability and consistency. This constant
 * is internal to the service and not exported.
 *
 * @internal
 */
const SITE_WRITER_QUERIES = {
    SELECT_MONITORS_BY_SITE: "SELECT * FROM monitors WHERE site_identifier = ?",
} as const;

export class SiteWriterService {
    private readonly databaseService: DatabaseService;

    private readonly logger: Logger;

    private readonly repositories: {
        monitor: MonitorRepository;
        site: SiteRepository;
    };

    /**
     * Create a new site in the database with its monitors. Pure data operation
     * without side effects.
     *
     * @remarks
     * This method performs atomic multi-step operations:
     *
     * 1. Creates the site record in the database
     * 2. Removes any existing monitors for this site (cleanup)
     * 3. Creates new monitors and assigns generated IDs
     *
     * All operations are wrapped in a transaction to ensure data consistency.
     * Monitor IDs are assigned during creation and updated in the returned
     * object.
     *
     * @example
     *
     * ```typescript
     * const newSite = await siteWriter.createSite({
     *     identifier: "my-site",
     *     name: "My Website",
     *     monitoring: false,
     *     monitors: [
     *         {
     *             id: "", // Will be assigned during creation
     *             type: "http",
     *             url: "https://example.com",
     *             checkInterval: 30000,
     *             timeout: 5000,
     *             retryAttempts: 3,
     *             monitoring: false,
     *             status: "pending",
     *             responseTime: 0,
     *             history: [],
     *         },
     *     ],
     * });
     * console.log(newSite.monitors[0].id); // Generated ID like 'mon_123'
     * ```
     *
     * @param siteData - Site configuration including monitors to create
     *
     * @returns Promise resolving to the created site with assigned monitor IDs
     *
     * @throws DatabaseError When database operations fail
     * @throws TransactionError When transaction rollback occurs
     */
    public async createSite(siteData: Site): Promise<Site> {
        return withDatabaseOperation(
            async () => {
                this.logger.info(
                    `Creating new site in database: ${siteData.identifier}`
                );

                const site: Site = {
                    ...siteData,
                };

                // Use executeTransaction for atomic multi-step operation
                await this.databaseService.executeTransaction((db) => {
                    // Persist site to database using internal method
                    this.repositories.site.upsertInternal(db, site);

                    // Remove all existing monitors for this site, then insert
                    // new ones
                    this.repositories.monitor.deleteBySiteIdentifierInternal(
                        db,
                        site.identifier
                    );

                    // Create monitors and assign IDs using internal method
                    for (const monitor of site.monitors) {
                        const newId = this.repositories.monitor.createInternal(
                            db,
                            site.identifier,
                            monitor
                        );
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
            {
                identifier: siteData.identifier,
                monitorCount: siteData.monitors.length,
            }
        );
    }

    /**
     * Delete a site and all its monitors from the database. Pure data operation
     * without side effects.
     *
     * @remarks
     * This method performs atomic multi-table deletion:
     *
     * 1. Removes the site from the cache
     * 2. Deletes all associated monitors from the database
     * 3. Deletes the site record from the database
     *
     * All database operations are wrapped in a transaction to ensure
     * consistency. If the site is not found in the cache, it will still attempt
     * database cleanup to handle cases where cache and database are out of
     * sync.
     *
     * @example
     *
     * ```typescript
     * const deleted = await siteWriter.deleteSite(
     *     sitesCache,
     *     "my-site-id"
     * );
     * if (deleted) {
     *     console.log("Site deleted successfully");
     * } else {
     *     console.log("Site not found");
     * }
     * ```
     *
     * @param sitesCache - Cache containing sites to update after deletion
     * @param identifier - Site identifier to delete
     *
     * @returns Promise resolving to true if site was found and deleted, false
     *   if not found
     *
     * @throws DatabaseError When database operations fail
     * @throws TransactionError When transaction rollback occurs
     */
    public async deleteSite(
        sitesCache: StandardizedCache<Site>,
        identifier: string
    ): Promise<boolean> {
        return withDatabaseOperation(
            async () => {
                this.logger.info(`Removing site: ${identifier}`);

                // Use executeTransaction for atomic multi-table deletion and capture result
                const dbDeletionSuccess =
                    await this.databaseService.executeTransaction((db) => {
                        // Remove from database using internal methods
                        this.repositories.monitor.deleteBySiteIdentifierInternal(
                            db,
                            identifier
                        );
                        const deletionResult =
                            this.repositories.site.deleteInternal(
                                db,
                                identifier
                            );
                        return Promise.resolve(deletionResult);
                    });

                // Only remove from cache if database deletion was successful
                let removed = false;
                if (dbDeletionSuccess && sitesCache.has(identifier)) {
                    removed = sitesCache.delete(identifier);
                }

                if (dbDeletionSuccess) {
                    this.logger.info(
                        `Site removed successfully from database: ${identifier}`
                    );
                } else {
                    this.logger.warn(
                        `Site not found in database for removal: ${identifier}`
                    );
                }

                if (removed) {
                    this.logger.debug(`Site removed from cache: ${identifier}`);
                }

                // Return actual database deletion result, not cache status
                return dbDeletionSuccess;
            },
            "site-writer-delete",
            undefined,
            { identifier }
        );
    }

    /**
     * Handle monitoring state changes when monitor intervals are modified. Side
     * effect operation separated from data updates.
     */
    public async handleMonitorIntervalChanges(
        identifier: string,
        originalSite: Site,
        newMonitors: Site["monitors"],
        monitoringConfig: MonitoringConfig
    ): Promise<void> {
        // Always handle monitor interval changes in both development and
        // production

        try {
            for (const newMonitor of newMonitors) {
                const originalMonitor = originalSite.monitors.find(
                    (m) => m.id === newMonitor.id
                );

                const intervalChanged =
                    originalMonitor?.checkInterval !== newMonitor.checkInterval;

                if (intervalChanged && newMonitor.id) {
                    this.logger.debug(
                        `Monitor ${newMonitor.id} interval changed from ${originalMonitor?.checkInterval} to ${newMonitor.checkInterval}`
                    );

                    // Always stop to clean up any existing scheduling
                    // eslint-disable-next-line no-await-in-loop -- Sequential monitor stop/start operations required
                    await monitoringConfig.stopMonitoring(
                        identifier,
                        newMonitor.id
                    );

                    // Only restart if the monitor was actually monitoring
                    if (originalMonitor?.monitoring) {
                        // eslint-disable-next-line no-await-in-loop -- Sequential monitor stop/start operations required
                        await monitoringConfig.startMonitoring(
                            identifier,
                            newMonitor.id
                        );
                    }
                }
            }
        } catch (error) {
            this.logger.error(
                `Failed to handle monitor interval changes for site ${identifier}:`,
                error
            );
            // Don't throw - this is a side effect operation that shouldn't
            // fail the update
        }
    }

    /**
     * Update a site with new values. Pure data operation without side effects.
     *
     * @remarks
     * This method performs atomic updates while preserving monitor history:
     *
     * 1. Validates the site exists in the cache
     * 2. Merges updates with existing site data
     * 3. Persists changes to the database within a transaction
     * 4. Updates or creates monitors while preserving their IDs and history
     *
     * When monitors are updated, existing monitors are preserved and updated
     * rather than being deleted and recreated. This maintains monitor history
     * and prevents ID changes that could break external references.
     *
     * @example
     *
     * ```typescript
     * const updatedSite = await siteWriter.updateSite(
     *     sitesCache,
     *     "my-site",
     *     {
     *         name: "Updated Site Name",
     *         monitoring: true,
     *         monitors: [
     *             {
     *                 id: "existing-monitor-id", // Existing monitor - will be updated
     *                 type: "http",
     *                 url: "https://updated-url.com",
     *                 checkInterval: 60000,
     *                 // ... other fields
     *             },
     *             {
     *                 id: "", // New monitor - will get new ID
     *                 type: "port",
     *                 host: "example.com",
     *                 port: 443,
     *                 // ... other fields
     *             },
     *         ],
     *     }
     * );
     * ```
     *
     * @param sitesCache - Cache containing sites to update
     * @param identifier - Site identifier to update
     * @param updates - Partial site data with fields to update
     *
     * @returns Promise resolving to the updated site object
     *
     * @throws SiteNotFoundError When the site is not found in cache
     * @throws DatabaseError When database operations fail
     * @throws TransactionError When transaction rollback occurs
     */
    public async updateSite(
        sitesCache: StandardizedCache<Site>,
        identifier: string,
        updates: Partial<Site>
    ): Promise<Site> {
        return withDatabaseOperation(
            async () => {
                // Validate input
                const site = this.validateSiteExists(sitesCache, identifier);

                // Create updated site object without updating cache yet
                const updatedSite: Site = {
                    ...site,
                    ...updates,
                    monitors: updates.monitors ?? site.monitors,
                };

                // Use executeTransaction for atomic multi-step operation
                await this.databaseService.executeTransaction((db) => {
                    // Persist to database using internal method
                    this.repositories.site.upsertInternal(db, updatedSite);

                    // Update monitors if provided - UPDATE existing monitors
                    // instead of recreating
                    if (updates.monitors) {
                        this.updateMonitorsPreservingHistory(
                            db,
                            identifier,
                            updates.monitors
                        );
                    }

                    return Promise.resolve();
                });

                // Update cache only after successful transaction
                sitesCache.set(identifier, updatedSite);

                this.logger.info(`Site updated successfully: ${identifier}`);
                return updatedSite;
            },
            "site-writer-update",
            undefined,
            { identifier }
        );
    }

    public constructor(
        config: SiteWritingConfig & { databaseService: DatabaseService }
    ) {
        this.repositories = config.repositories;
        this.logger = config.logger;
        this.databaseService = config.databaseService;
    }

    /**
     * Detect new monitors that were added to an existing site.
     *
     * @remarks
     * This method handles two scenarios:
     *
     * 1. **Monitors with IDs**: Compares IDs to detect new ones
     * 2. **Monitors without IDs**: Detects new monitors by comparing monitor
     *    objects since IDs are assigned during database creation
     *
     * Monitors without IDs are returned with empty string placeholders to
     * indicate they need special handling during monitor setup operations.
     *
     * @param originalMonitors - The original monitors before update
     * @param updatedMonitors - The updated monitors after update
     *
     * @returns Array of new monitor IDs (may include empty strings for monitors
     *   without IDs)
     */
    public detectNewMonitors(
        originalMonitors: Site["monitors"],
        updatedMonitors: Site["monitors"]
    ): string[] {
        const originalIds = new Set(
            originalMonitors.map((m) => m.id).filter(Boolean)
        );
        const newMonitorIds: string[] = [];

        // Create a comparison set of original monitors for detecting new
        // monitors without IDs
        const originalMonitorSignatures = new Set(
            originalMonitors.map((m) => this.createMonitorSignature(m))
        );

        for (const monitor of updatedMonitors) {
            if (monitor.id && !originalIds.has(monitor.id)) {
                // Monitor has ID and is not in original set
                newMonitorIds.push(monitor.id);
            } else if (!monitor.id) {
                // Monitor without ID - check if it's genuinely new by
                // comparing signature
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
     * Build the update data for a monitor, preserving existing state.
     */
    private buildMonitorUpdateData(
        newMonitor: Monitor,
        existingMonitor: Monitor
    ): Partial<Monitor> {
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

        // DNS-specific fields for DNS monitor support
        if (newMonitor.recordType !== undefined) {
            updateData.recordType = newMonitor.recordType;
        }
        if (newMonitor.expectedValue !== undefined) {
            updateData.expectedValue = newMonitor.expectedValue;
        }

        return updateData;
    }

    /**
     * Create a unique signature for a monitor based on its configuration.
     *
     * @remarks
     * Used to detect new monitors that don't have IDs yet. The signature
     * includes all configuration properties that make a monitor unique,
     * excluding runtime properties like status, lastChecked, and responseTime.
     *
     * @param monitor - The monitor to create a signature for
     *
     * @returns A string signature representing the monitor's configuration
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
    private createNewMonitor(
        db: Database,
        siteIdentifier: string,
        newMonitor: Monitor,
        reason?: string
    ): void {
        const newId = this.repositories.monitor.createInternal(
            db,
            siteIdentifier,
            newMonitor
        );
        newMonitor.id = newId;

        const reasonSuffix = reason ? ` (${reason})` : "";
        this.logger.debug(
            `Created new monitor ${newId} for site ${siteIdentifier}${reasonSuffix}`
        );
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
        const existingMonitor = existingMonitors.find(
            (m) => m.id === newMonitor.id
        );

        if (existingMonitor) {
            this.updateExistingMonitor(
                db,
                siteIdentifier,
                newMonitor,
                existingMonitor
            );
        } else {
            this.createNewMonitor(
                db,
                siteIdentifier,
                newMonitor,
                "ID not found"
            );
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
            this.handleExistingMonitor(
                db,
                siteIdentifier,
                newMonitor,
                existingMonitors
            );
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
            this.processIndividualMonitor(
                db,
                siteIdentifier,
                newMonitor,
                existingMonitors
            );
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
        const newMonitorIds = new Set(
            newMonitors.map((m) => m.id).filter(Boolean)
        );

        for (const existingMonitor of existingMonitors) {
            if (!newMonitorIds.has(existingMonitor.id)) {
                this.repositories.monitor.deleteInternal(
                    db,
                    existingMonitor.id
                );
                this.logger.debug(
                    `Removed monitor ${existingMonitor.id} from site ${siteIdentifier}`
                );
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
            // Safety check - this should not happen in this context
            this.logger.warn(
                `Attempted to update existing monitor without ID for site ${siteIdentifier}`,
                {
                    newMonitor,
                }
            );
            return;
        }

        const updateData = this.buildMonitorUpdateData(
            newMonitor,
            existingMonitor
        );
        this.repositories.monitor.updateInternal(db, newMonitor.id, updateData);
        this.logger.debug(
            `Updated existing monitor ${newMonitor.id} for site ${siteIdentifier}`
        );
    }

    /**
     * Update monitors preserving their history and IDs. This method updates
     * existing monitors and creates new ones as needed.
     *
     * @remarks
     * This method operates within a transaction context and uses the provided
     * database instance to maintain transactional consistency. All database
     * operations must use the same transaction instance.
     *
     * @param db - Database transaction instance to ensure transactional
     *   consistency
     * @param siteIdentifier - The site identifier to update monitors for
     * @param newMonitors - Array of new monitor configurations
     *
     * @returns Promise that resolves when all monitor updates are complete
     */
    private updateMonitorsPreservingHistory(
        db: Database,
        siteIdentifier: string,
        newMonitors: Site["monitors"]
    ): void {
        // Fetch existing monitors using the transaction database instance
        // This ensures consistent reads within the transaction boundary
        const monitorRows = db.all(
            SITE_WRITER_QUERIES.SELECT_MONITORS_BY_SITE,
            [siteIdentifier]
        ) as MonitorRow[];

        // Convert rows to monitor objects using the imported mapper
        const existingMonitors = rowsToMonitors(monitorRows);

        // Process each monitor: update existing or create new
        this.processMonitorUpdates(
            db,
            siteIdentifier,
            newMonitors,
            existingMonitors
        );

        // Clean up monitors that are no longer needed
        this.removeObsoleteMonitors(
            db,
            siteIdentifier,
            newMonitors,
            existingMonitors
        );
    }

    /**
     * Validate that a site exists in the cache.
     */
    private validateSiteExists(
        sitesCache: StandardizedCache<Site>,
        identifier: string
    ): Site {
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
