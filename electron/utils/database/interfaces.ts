/**
 * Interfaces for database utilities to support dependency injection and testing.
 */

import { UptimeEvents } from "../../events/eventTypes";
import { TypedEventBus } from "../../events/TypedEventBus";
import { SiteRepository } from "../../services/database/SiteRepository";
import { MonitorRepository } from "../../services/database/MonitorRepository";
import { HistoryRepository } from "../../services/database/HistoryRepository";
import { SettingsRepository } from "../../services/database/SettingsRepository";
import { Site } from "../../types";
import { dbLogger } from "../logger";

/**
 * Logger interface abstraction.
 */
export interface Logger {
    debug(message: string, ...args: unknown[]): void;
    error(message: string, error?: unknown, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
}

/**
 * Configuration for site loading operations.
 */
export interface SiteLoadingConfig {
    /** Repository dependencies */
    repositories: {
        site: SiteRepository;
        monitor: MonitorRepository;
        history: HistoryRepository;
        settings: SettingsRepository;
    };
    /** Logger instance */
    logger: Logger;
    /** Typed event emitter for error handling */
    eventEmitter: TypedEventBus<UptimeEvents>;
}

/**
 * Configuration for site writing operations.
 */
export interface SiteWritingConfig {
    /** Repository dependencies */
    repositories: {
        site: SiteRepository;
        monitor: MonitorRepository;
    };
    /** Logger instance */
    logger: Logger;
}

/**
 * Configuration for monitoring operations.
 */
export interface MonitoringConfig {
    /** Function to start monitoring for a site/monitor */
    startMonitoring: (identifier: string, monitorId: string) => Promise<boolean>;
    /** Function to stop monitoring for a site/monitor */
    stopMonitoring: (identifier: string, monitorId: string) => Promise<boolean>;
    /** Function to set history limit */
    setHistoryLimit: (limit: number) => void;
    /** Function to setup new monitors for a site */
    setupNewMonitors: (site: Site, newMonitorIds: string[]) => Promise<void>;
}

/**
 * Site cache interface with advanced cache management capabilities.
 */
export interface SiteCacheInterface {
    get(identifier: string): Site | undefined;
    set(identifier: string, site: Site): void;
    delete(identifier: string): boolean;
    clear(): void;
    size(): number;
    entries(): IterableIterator<[string, Site]>;
    /** Invalidate cache entry and emit invalidation event */
    invalidate(identifier: string): void;
    /** Invalidate all cache entries */
    invalidateAll(): void;
    /** Check if cache entry exists */
    has(identifier: string): boolean;
    /** Get all cached sites as array */
    getAll(): Site[];
    /** Bulk update cache with new data */
    bulkUpdate(sites: Site[]): void;
}

/**
 * Advanced implementation of ISiteCache with invalidation support.
 */
export class SiteCache implements SiteCacheInterface {
    private readonly cache = new Map<string, Site>();
    private readonly invalidationCallbacks = new Set<(identifier?: string) => void>();

    /**
     * Register callback for cache invalidation events.
     *
     * @param callback - Function to call when cache is invalidated
     * @returns Cleanup function to remove the callback
     */
    public onInvalidation(callback: (identifier?: string) => void): () => void {
        this.invalidationCallbacks.add(callback);
        return () => this.invalidationCallbacks.delete(callback);
    }

    get(identifier: string): Site | undefined {
        return this.cache.get(identifier);
    }

    set(identifier: string, site: Site): void {
        this.cache.set(identifier, site);
    }

    delete(identifier: string): boolean {
        const deleted = this.cache.delete(identifier);
        if (deleted) {
            this.notifyInvalidation(identifier);
        }
        return deleted;
    }

    clear(): void {
        this.cache.clear();
        this.notifyInvalidation();
    }

    size(): number {
        return this.cache.size;
    }

    entries(): IterableIterator<[string, Site]> {
        return this.cache.entries();
    }

    invalidate(identifier: string): void {
        this.cache.delete(identifier);
        this.notifyInvalidation(identifier);
    }

    invalidateAll(): void {
        this.cache.clear();
        this.notifyInvalidation();
    }

    has(identifier: string): boolean {
        return this.cache.has(identifier);
    }

    getAll(): Site[] {
        return [...this.cache.values()];
    }

    bulkUpdate(sites: Site[]): void {
        this.cache.clear();
        for (const site of sites) {
            this.cache.set(site.identifier, site);
        }
        this.notifyInvalidation();
    }

    private notifyInvalidation(identifier?: string): void {
        for (const callback of this.invalidationCallbacks) {
            try {
                callback(identifier);
            } catch (error) {
                // Silently handle callback errors to prevent cache corruption
                dbLogger.error("Cache invalidation callback error:", error);
            }
        }
    }
}

/**
 * Custom error types for better error handling.
 */
export class SiteNotFoundError extends Error {
    constructor(identifier: string) {
        super(`Site not found: ${identifier}`);
        this.name = "SiteNotFoundError";
    }
}

export class SiteLoadingError extends Error {
    constructor(message: string, cause?: Error) {
        super(`Failed to load sites: ${message}`);
        this.name = "SiteLoadingError";
        if (cause?.stack) {
            this.stack = cause.stack;
        }
    }
}
