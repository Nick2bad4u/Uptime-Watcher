/**
 * Interfaces for database utilities to support dependency injection and testing.
 */

import { UptimeEvents } from "../../events/eventTypes";
import { TypedEventBus } from "../../events/TypedEventBus";
import { HistoryRepository } from "../../services/database/HistoryRepository";
import { MonitorRepository } from "../../services/database/MonitorRepository";
import { SettingsRepository } from "../../services/database/SettingsRepository";
import { SiteRepository } from "../../services/database/SiteRepository";
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
 * Configuration for monitoring operations.
 */
export interface MonitoringConfig {
    /** Function to set history limit */
    setHistoryLimit: (limit: number) => void;
    /** Function to setup new monitors for a site */
    setupNewMonitors: (site: Site, newMonitorIds: string[]) => Promise<void>;
    /** Function to start monitoring for a site/monitor */
    startMonitoring: (identifier: string, monitorId: string) => Promise<boolean>;
    /** Function to stop monitoring for a site/monitor */
    stopMonitoring: (identifier: string, monitorId: string) => Promise<boolean>;
}

/**
 * Site cache interface with advanced cache management capabilities.
 */
export interface SiteCacheInterface {
    /** Bulk update cache with new data */
    bulkUpdate(sites: Site[]): void;
    clear(): void;
    delete(identifier: string): boolean;
    entries(): IterableIterator<[string, Site]>;
    get(identifier: string): Site | undefined;
    /** Get all cached sites as array */
    getAll(): Site[];
    /** Check if cache entry exists */
    has(identifier: string): boolean;
    /** Invalidate cache entry and emit invalidation event */
    invalidate(identifier: string): void;
    /** Invalidate all cache entries */
    invalidateAll(): void;
    set(identifier: string, site: Site): void;
    size(): number;
}

/**
 * Configuration for site loading operations.
 */
export interface SiteLoadingConfig {
    /** Typed event emitter for error handling */
    eventEmitter: TypedEventBus<UptimeEvents>;
    /** Logger instance */
    logger: Logger;
    /** Repository dependencies */
    repositories: {
        history: HistoryRepository;
        monitor: MonitorRepository;
        settings: SettingsRepository;
        site: SiteRepository;
    };
}

/**
 * Configuration for site writing operations.
 */
export interface SiteWritingConfig {
    /** Logger instance */
    logger: Logger;
    /** Repository dependencies */
    repositories: {
        monitor: MonitorRepository;
        site: SiteRepository;
    };
}

/**
 * Advanced implementation of ISiteCache with invalidation support.
 */
export class SiteCache implements SiteCacheInterface {
    private readonly cache = new Map<string, Site>();
    private readonly invalidationCallbacks = new Set<(identifier?: string) => void>();

    bulkUpdate(sites: Site[]): void {
        this.cache.clear();
        for (const site of sites) {
            this.cache.set(site.identifier, site);
        }
        this.notifyInvalidation();
    }

    clear(): void {
        this.cache.clear();
        this.notifyInvalidation();
    }

    delete(identifier: string): boolean {
        const deleted = this.cache.delete(identifier);
        if (deleted) {
            this.notifyInvalidation(identifier);
        }
        return deleted;
    }

    entries(): IterableIterator<[string, Site]> {
        return this.cache.entries();
    }

    get(identifier: string): Site | undefined {
        return this.cache.get(identifier);
    }

    getAll(): Site[] {
        return [...this.cache.values()];
    }

    has(identifier: string): boolean {
        return this.cache.has(identifier);
    }

    invalidate(identifier: string): void {
        this.cache.delete(identifier);
        this.notifyInvalidation(identifier);
    }

    invalidateAll(): void {
        this.cache.clear();
        this.notifyInvalidation();
    }

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

    set(identifier: string, site: Site): void {
        this.cache.set(identifier, site);
    }

    size(): number {
        return this.cache.size;
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

export class SiteLoadingError extends Error {
    constructor(message: string, cause?: Error) {
        super(`Failed to load sites: ${message}`);
        this.name = "SiteLoadingError";
        if (cause?.stack) {
            this.stack = cause.stack;
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
