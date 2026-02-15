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
import type { Logger } from "@shared/utils/logger/interfaces";
import type { Promisable } from "type-fest";

import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";

import type { StandardizedCache } from "../../utils/cache/StandardizedCache";
import type { DatabaseService } from "./DatabaseService";
import type { MonitoringConfig, SiteWritingConfig } from "./interfaces";
import type {
    MonitorRepository,
    MonitorRepositoryTransactionAdapter,
} from "./MonitorRepository";
import type {
    SiteRepository,
    SiteRepositoryTransactionAdapter,
} from "./SiteRepository";

import { withDatabaseOperation } from "../../utils/operationalHooks";
import {
    createMonitorConfig,
    type NormalizedMonitorConfig,
} from "../monitoring/createMonitorConfig";
import { SiteNotFoundError } from "./interfaces";
import { deleteSiteWithAdapters } from "./siteDeletion";
import {
    buildMonitorUpdateData,
    createMonitorSignature,
} from "./siteWriterService/monitorPersistenceUtils";
import { createSiteMonitorTransactionAdapters } from "./transactionAdapters";

/**
 * Service responsible for writing site and monitor records to the database.
 *
 * @remarks
 * Encapsulates multi-step write operations behind a testable API so callers do
 * not need to manage transactions, cache updates, or repository wiring
 * directly.
 *
 * @public
 */
export class SiteWriterService {
    private readonly databaseService: DatabaseService;

    private readonly logger: Logger;

    private readonly repositories: {
        monitor: MonitorRepository;
        site: SiteRepository;
    };

    /**
     * Execute a database transaction with site and monitor repository adapters.
     *
     * @remarks
     * Centralizes transaction adapter creation so higher-level operations reuse
     * identical wiring. This guarantees consistent adapter lifetimes and keeps
     * transactional codepaths focused on domain behavior instead of setup
     * boilerplate.
     *
     * @typeParam T - Result returned by the transactional operation.
     *
     * @param operation - Callback invoked with repository adapters scoped to
     *   the active transaction.
     *
     * @returns Result from the provided operation.
     */
    private async withSiteMonitorTransaction<T>(
        operation: (adapters: {
            monitorTx: MonitorRepositoryTransactionAdapter;
            siteTx: SiteRepositoryTransactionAdapter;
        }) => Promisable<T>
    ): Promise<T> {
        return this.databaseService.executeTransaction(async (db) =>
            operation(
                createSiteMonitorTransactionAdapters(db, this.repositories)
            )
        );
    }

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
     * logger.info(`Monitor ID: ${newSite.monitors[0].id}`); // Generated ID like 'mon_123'
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

                const normalizedMonitors = this.normalizeMonitorsForPersistence(
                    siteData.monitors,
                    {
                        siteIdentifier: siteData.identifier,
                    }
                );

                const site: Site = {
                    ...siteData,
                    monitors: normalizedMonitors,
                };

                // Use executeTransaction for atomic multi-step operation
                await this.withSiteMonitorTransaction(
                    ({ monitorTx, siteTx }) => {
                        siteTx.upsert(site);

                        monitorTx.deleteBySiteIdentifier(site.identifier);

                        for (const monitor of site.monitors) {
                            const newId = monitorTx.create(
                                site.identifier,
                                monitor
                            );
                            monitor.id = newId;
                        }
                    }
                );

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
     *     logger.info("Site deleted successfully");
     * } else {
     *     logger.info("Site not found");
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
                const deletionResult = await this.withSiteMonitorTransaction(
                    ({ monitorTx, siteTx }) =>
                        deleteSiteWithAdapters({
                            identifier,
                            monitorAdapter: monitorTx,
                            siteAdapter: siteTx,
                        })
                );

                // Only remove from cache if database deletion was successful
                let removed = false;
                if (deletionResult.siteDeleted && sitesCache.has(identifier)) {
                    removed = sitesCache.delete(identifier);
                }

                if (deletionResult.siteDeleted) {
                    this.logger.info(
                        `Site removed successfully from database: ${identifier}`
                    );
                    this.logger.debug(
                        `Removed ${deletionResult.monitorCount} monitors for site: ${identifier}`
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
                return deletionResult.siteDeleted;
            },
            "site-writer-delete",
            undefined,
            { identifier }
        );
    }

    /**
     * Delete all sites and associated monitors from the database and cache.
     *
     * @remarks
     * Performs an atomic transaction that removes every monitor record prior to
     * deleting the related site entries. The in-memory cache is cleared only
     * after the transaction succeeds. Operational hooks wrap the process to
     * provide consistent logging, metrics, and retry semantics.
     *
     * The method returns the snapshot of sites that were removed so callers can
     * emit domain events without querying the cache after it has been cleared.
     *
     * @param sitesCache - Sites cache to clear after successful deletion.
     *
     * @returns Object containing the deleted site snapshot and record count.
     */
    public async deleteAllSites(sitesCache: StandardizedCache<Site>): Promise<{
        /** Total number of sites removed */
        deletedCount: number;
        /** Immutable snapshot of sites deleted during the operation */
        deletedSites: Site[];
    }> {
        const sitesToDelete = sitesCache.getAll();

        if (sitesToDelete.length === 0) {
            this.logger.debug(
                "[SiteWriterService] No sites available for bulk deletion"
            );
            return {
                deletedCount: 0,
                deletedSites: [],
            };
        }

        return withDatabaseOperation(
            async () => {
                await this.withSiteMonitorTransaction(
                    ({ monitorTx, siteTx }) => {
                        monitorTx.deleteAll();
                        siteTx.deleteAll();
                    }
                );

                sitesCache.clear();

                this.logger.info(
                    `[SiteWriterService] Deleted ${sitesToDelete.length} sites from database`
                );

                return {
                    deletedCount: sitesToDelete.length,
                    deletedSites: sitesToDelete,
                };
            },
            "site-writer-delete-all",
            undefined,
            { deletedCount: sitesToDelete.length }
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
                const normalizedMonitors = updates.monitors
                    ? this.normalizeMonitorsForPersistence(updates.monitors, {
                          existingMonitors: site.monitors,
                          siteIdentifier: identifier,
                      })
                    : site.monitors;

                const updatedSite: Site = {
                    ...site,
                    ...updates,
                    monitors: normalizedMonitors,
                };

                // Use executeTransaction for atomic multi-step operation
                await this.withSiteMonitorTransaction(
                    ({ monitorTx, siteTx }) => {
                        siteTx.upsert(updatedSite);

                        if (updates.monitors) {
                            this.updateMonitorsPreservingHistory(
                                monitorTx,
                                identifier,
                                normalizedMonitors
                            );
                        }
                    }
                );

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
            originalMonitors.map((m) => createMonitorSignature(m))
        );

        for (const monitor of updatedMonitors) {
            if (monitor.id && !originalIds.has(monitor.id)) {
                // Monitor has ID and is not in original set
                newMonitorIds.push(monitor.id);
            } else if (!monitor.id) {
                // Monitor without ID - check if it's genuinely new by
                // comparing signature
                const monitorSignature = createMonitorSignature(monitor);
                if (!originalMonitorSignatures.has(monitorSignature)) {
                    // New monitor without ID - use empty string as placeholder
                    newMonitorIds.push("");
                }
            }
        }

        return newMonitorIds;
    }

    private normalizeMonitorsForPersistence(
        monitors: Site["monitors"],
        options: {
            existingMonitors?: Site["monitors"];
            siteIdentifier: string;
        }
    ): Site["monitors"] {
        if (!Array.isArray(monitors) || monitors.length === 0) {
            return [];
        }

        const existingMap = new Map<string, Monitor>(
            (options.existingMonitors ?? [])
                .filter((monitor): monitor is Monitor & { id: string } =>
                    Boolean(monitor.id)
                )
                .map((monitor) => [monitor.id, monitor])
        );

        return monitors.map((monitor) =>
            this.normalizeMonitorConfiguration(
                monitor,
                monitor.id ? existingMap.get(monitor.id) : undefined,
                options.siteIdentifier
            )
        );
    }

    private normalizeMonitorConfiguration(
        monitor: Monitor,
        existingMonitor: Monitor | undefined,
        siteIdentifier: string
    ): Monitor {
        const defaults: Partial<NormalizedMonitorConfig> = {};

        if (
            existingMonitor?.checkInterval !== undefined &&
            Number.isFinite(existingMonitor.checkInterval)
        ) {
            defaults.checkInterval = existingMonitor.checkInterval;
        }

        if (
            existingMonitor?.retryAttempts !== undefined &&
            Number.isFinite(existingMonitor.retryAttempts)
        ) {
            defaults.retryAttempts = existingMonitor.retryAttempts;
        }

        if (
            existingMonitor?.timeout !== undefined &&
            Number.isFinite(existingMonitor.timeout)
        ) {
            defaults.timeout = existingMonitor.timeout;
        }

        const normalizedConfig = createMonitorConfig(monitor, defaults);

        const normalizedMonitor: Monitor = {
            ...monitor,
            checkInterval: normalizedConfig.checkInterval,
            retryAttempts: normalizedConfig.retryAttempts,
            timeout: normalizedConfig.timeout,
        };

        this.logMonitorNormalization(
            monitor,
            normalizedMonitor,
            siteIdentifier
        );

        return normalizedMonitor;
    }

    private logMonitorNormalization(
        original: Monitor,
        normalized: Monitor,
        siteIdentifier: string
    ): void {
        const monitorId = original.id || "<new-monitor>";

        const originalInterval = original.checkInterval;
        if (originalInterval !== normalized.checkInterval) {
            if (
                typeof originalInterval !== "number" ||
                !Number.isFinite(originalInterval) ||
                originalInterval <= 0
            ) {
                this.logger.warn(
                    "[SiteWriterService] Monitor missing valid checkInterval; defaulting to minimum",
                    {
                        monitorId,
                        siteIdentifier,
                    }
                );
            } else if (originalInterval < MIN_MONITOR_CHECK_INTERVAL_MS) {
                this.logger.warn(
                    "[SiteWriterService] Monitor checkInterval below minimum; clamping to shared floor",
                    {
                        minimum: MIN_MONITOR_CHECK_INTERVAL_MS,
                        monitorId,
                        originalInterval,
                        siteIdentifier,
                    }
                );
            }
        }

        if (
            normalized.retryAttempts !== original.retryAttempts &&
            (typeof original.retryAttempts !== "number" ||
                !Number.isFinite(original.retryAttempts) ||
                original.retryAttempts < 0)
        ) {
            this.logger.warn(
                "[SiteWriterService] Monitor retryAttempts invalid; defaulting to non-negative floor",
                {
                    monitorId,
                    normalizedRetryAttempts: normalized.retryAttempts,
                    originalRetryAttempts: original.retryAttempts,
                    siteIdentifier,
                }
            );
        }

        if (
            normalized.timeout !== original.timeout &&
            (typeof original.timeout !== "number" ||
                !Number.isFinite(original.timeout) ||
                original.timeout <= 0)
        ) {
            this.logger.warn(
                "[SiteWriterService] Monitor timeout invalid; defaulting to fallback",
                {
                    monitorId,
                    normalizedTimeout: normalized.timeout,
                    originalTimeout: original.timeout,
                    siteIdentifier,
                }
            );
        }
    }

    /**
     * Create a new monitor in the database.
     */
    private createNewMonitor(
        monitorTx: MonitorRepositoryTransactionAdapter,
        siteIdentifier: string,
        newMonitor: Monitor,
        reason?: string
    ): void {
        const newId = monitorTx.create(siteIdentifier, newMonitor);
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
        monitorTx: MonitorRepositoryTransactionAdapter,
        siteIdentifier: string,
        newMonitor: Monitor,
        existingMonitors: Site["monitors"]
    ): void {
        const existingMonitor = existingMonitors.find(
            (m) => m.id === newMonitor.id
        );

        if (existingMonitor) {
            this.updateExistingMonitor(
                monitorTx,
                siteIdentifier,
                newMonitor,
                existingMonitor
            );
        } else {
            this.createNewMonitor(
                monitorTx,
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
        monitorTx: MonitorRepositoryTransactionAdapter,
        siteIdentifier: string,
        newMonitor: Monitor,
        existingMonitors: Site["monitors"]
    ): void {
        if (newMonitor.id) {
            this.handleExistingMonitor(
                monitorTx,
                siteIdentifier,
                newMonitor,
                existingMonitors
            );
        } else {
            this.createNewMonitor(monitorTx, siteIdentifier, newMonitor);
        }
    }

    /**
     * Process monitor updates and creations.
     */
    private processMonitorUpdates(
        monitorTx: MonitorRepositoryTransactionAdapter,
        siteIdentifier: string,
        newMonitors: Site["monitors"],
        existingMonitors: Site["monitors"]
    ): void {
        for (const newMonitor of newMonitors) {
            this.processIndividualMonitor(
                monitorTx,
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
        monitorTx: MonitorRepositoryTransactionAdapter,
        siteIdentifier: string,
        newMonitors: Site["monitors"],
        existingMonitors: Site["monitors"]
    ): void {
        const newMonitorIds = new Set(
            newMonitors.map((m) => m.id).filter(Boolean)
        );

        for (const existingMonitor of existingMonitors) {
            if (!newMonitorIds.has(existingMonitor.id)) {
                monitorTx.deleteById(existingMonitor.id);
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
        monitorTx: MonitorRepositoryTransactionAdapter,
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

        const updateData = buildMonitorUpdateData(newMonitor, existingMonitor);
        monitorTx.update(newMonitor.id, updateData);
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
     * @param monitorTx - Monitor repository transaction adapter
     * @param siteIdentifier - The site identifier to update monitors for
     * @param newMonitors - Array of new monitor configurations
     *
     * @returns Promise that resolves when all monitor updates are complete
     */
    private updateMonitorsPreservingHistory(
        monitorTx: MonitorRepositoryTransactionAdapter,
        siteIdentifier: string,
        newMonitors: Site["monitors"]
    ): void {
        // Fetch existing monitors using the transaction database instance
        // This ensures consistent reads within the transaction boundary
        const existingMonitors = monitorTx.findBySiteIdentifier(siteIdentifier);

        // Process each monitor: update existing or create new
        this.processMonitorUpdates(
            monitorTx,
            siteIdentifier,
            newMonitors,
            existingMonitors
        );

        // Clean up monitors that are no longer needed
        this.removeObsoleteMonitors(
            monitorTx,
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
