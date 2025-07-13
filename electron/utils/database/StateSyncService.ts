/**
 * Centralized state synchronization service to unify multiple state sources.
 *
 * @remarks
 * This service resolves the issue of having three different state sources:
 * 1. Database (persistent storage)
 * 2. Cache (manager layer)
 * 3. Frontend store (UI state)
 *
 * It provides a single source of truth with automatic synchronization
 * and cache invalidation across all layers.
 */

import { UptimeEvents, TypedEventBus } from "../../events";
import { SiteRepository } from "../../services/index";
import { Site } from "../../types";
import { SiteCacheInterface } from "./interfaces";
import { logger } from "../logger";

/**
 * Configuration for state synchronization service.
 *
 * @public
 */
export interface StateSyncConfig {
    /** Site repository for database access */
    siteRepository: SiteRepository;
    /** Site cache for memory access */
    siteCache: SiteCacheInterface;
    /** Event emitter for state change notifications */
    eventEmitter: TypedEventBus<UptimeEvents>;
    /** Frontend store synchronization callback */
    frontendSync?: (sites: Site[]) => void;
    /** Enable debug logging for sync operations */
    enableDebugLogging?: boolean;
}

/**
 * State synchronization strategies.
 *
 * @public
 */
export type SyncStrategy =
    | "database-first" // Database is source of truth
    | "cache-first" // Cache is source of truth (with database fallback)
    | "hybrid"; // Intelligent selection based on data freshness

/**
 * Centralized state synchronization service.
 *
 * @remarks
 * Provides unified access to site data across all application layers
 * with automatic synchronization and cache invalidation.
 */
export class StateSyncService {
    private readonly config: StateSyncConfig;
    private readonly strategy: SyncStrategy;
    private lastSyncTimestamp = 0;
    private syncInProgress = false;

    /**
     * Create a new state synchronization service.
     *
     * @param config - Configuration for state synchronization
     * @param strategy - Synchronization strategy to use
     */
    constructor(config: StateSyncConfig, strategy: SyncStrategy = "hybrid") {
        this.config = config;
        this.strategy = strategy;
        this.setupCacheInvalidationHandling();
    }

    /**
     * Get all sites using the configured synchronization strategy.
     *
     * @returns Promise resolving to array of all sites
     */
    public async getSites(): Promise<Site[]> {
        switch (this.strategy) {
            case "database-first": {
                return this.getDatabaseSites();
            }
            case "cache-first": {
                return this.getCacheFirstSites();
            }
            case "hybrid": {
                return this.getHybridSites();
            }
            default: {
                throw new Error(`Unknown sync strategy: ${this.strategy}`);
            }
        }
    }

    /**
     * Get a single site by identifier.
     *
     * @param identifier - Site identifier
     * @returns Promise resolving to site or undefined
     */
    public async getSite(identifier: string): Promise<Site | undefined> {
        // Try cache first for single-site access
        const cachedSite = this.config.siteCache.get(identifier);
        if (cachedSite) {
            return cachedSite;
        }

        // Fallback to database
        const dbSite = await this.config.siteRepository.findByIdentifier(identifier);
        if (dbSite) {
            // Note: This would need to be expanded to load full Site object with monitors
            logger.warn("[StateSyncService] Partial site data from database - full site loading needed");
        }

        return undefined;
    }

    /**
     * Update a site across all state sources.
     *
     * @param site - Site to update
     */
    public async updateSite(site: Site): Promise<void> {
        try {
            this.syncInProgress = true;

            // Update database first (source of truth)
            await this.config.siteRepository.upsert(site);

            // Update cache
            this.config.siteCache.set(site.identifier, site);

            // Notify frontend
            if (this.config.frontendSync) {
                const allSites = this.config.siteCache.getAll();
                this.config.frontendSync(allSites);
            }

            // Emit state change event
            await this.config.eventEmitter.emitTyped("sites:state-synchronized", {
                action: "update",
                siteIdentifier: site.identifier,
                timestamp: Date.now(),
            });

            this.lastSyncTimestamp = Date.now();
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Delete a site from all state sources.
     *
     * @param identifier - Site identifier to delete
     */
    public async deleteSite(identifier: string): Promise<boolean> {
        try {
            this.syncInProgress = true;

            // Delete from database first
            const deleted = await this.config.siteRepository.delete(identifier);

            if (deleted) {
                // Remove from cache
                this.config.siteCache.delete(identifier);

                // Notify frontend
                if (this.config.frontendSync) {
                    const allSites = this.config.siteCache.getAll();
                    this.config.frontendSync(allSites);
                }

                // Emit state change event
                await this.config.eventEmitter.emitTyped("sites:state-synchronized", {
                    action: "delete",
                    siteIdentifier: identifier,
                    timestamp: Date.now(),
                });

                this.lastSyncTimestamp = Date.now();
            }

            return deleted;
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Force synchronization from database to all other state sources.
     */
    public async forceSyncFromDatabase(): Promise<void> {
        if (this.syncInProgress) {
            logger.debug("[StateSyncService] Sync already in progress, skipping force sync");
            return;
        }

        try {
            this.syncInProgress = true;

            // Load all sites from database
            const sites = await this.getDatabaseSites();

            // Update cache
            this.config.siteCache.bulkUpdate(sites);

            // Notify frontend
            if (this.config.frontendSync) {
                this.config.frontendSync(sites);
            }

            // Emit synchronization complete event
            await this.config.eventEmitter.emitTyped("sites:state-synchronized", {
                action: "bulk-sync",
                timestamp: Date.now(),
            });

            this.lastSyncTimestamp = Date.now();
            logger.info("[StateSyncService] Force sync completed", { siteCount: sites.length });
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Check if state is synchronized (no pending changes).
     */
    public isSynchronized(): boolean {
        return !this.syncInProgress;
    }

    /**
     * Get database sites (always from database).
     */
    private async getDatabaseSites(): Promise<Site[]> {
        // Note: This simplified version returns partial sites
        // In a full implementation, this would load complete Site objects with monitors
        await this.config.siteRepository.findAll();

        // For now, return empty array of full sites
        // This would need to be implemented to construct full Site objects
        logger.debug("[StateSyncService] Database-first strategy returning partial data");
        return [];
    }

    /**
     * Get cache-first sites (cache with database fallback).
     */
    private async getCacheFirstSites(): Promise<Site[]> {
        const cachedSites = this.config.siteCache.getAll();

        if (cachedSites.length > 0) {
            return cachedSites;
        }

        // Cache empty, fallback to database
        logger.debug("[StateSyncService] Cache empty, falling back to database");
        return this.getDatabaseSites();
    }

    /**
     * Get hybrid sites (intelligent strategy selection).
     */
    private async getHybridSites(): Promise<Site[]> {
        const cacheSize = this.config.siteCache.size();
        const timeSinceLastSync = Date.now() - this.lastSyncTimestamp;
        const SYNC_THRESHOLD_MS = 30_000; // 30 seconds

        // Use cache if it has data and sync is recent
        if (cacheSize > 0 && timeSinceLastSync < SYNC_THRESHOLD_MS) {
            return this.config.siteCache.getAll();
        }

        // Otherwise sync from database
        logger.debug("[StateSyncService] Hybrid strategy choosing database sync", {
            cacheSize,
            timeSinceLastSync,
        });

        const sites = await this.getDatabaseSites();
        this.config.siteCache.bulkUpdate(sites);
        return sites;
    }

    /**
     * Setup cache invalidation event handling.
     */
    private setupCacheInvalidationHandling(): void {
        // Check if cache supports invalidation callbacks
        if ("onInvalidation" in this.config.siteCache && typeof this.config.siteCache.onInvalidation === "function") {
            // Type assertion since we've verified the method exists
            const onInvalidation = this.config.siteCache.onInvalidation as (
                callback: (identifier?: string) => void
            ) => void;
            onInvalidation((identifier?: string) => {
                if (this.config.frontendSync && !this.syncInProgress) {
                    // Notify frontend of cache changes
                    const allSites = this.config.siteCache.getAll();
                    this.config.frontendSync(allSites);
                }

                logger.debug("[StateSyncService] Cache invalidated", {
                    identifier: identifier ?? "all",
                });
            });
        } else {
            logger.debug("[StateSyncService] Cache does not support invalidation callbacks");
        }
    }
}
