/**
 * Interfaces for database utilities to support dependency injection and testing.
 */

import { Database } from "node-sqlite3-wasm";

import { UptimeEvents, TypedEventBus } from "../../events";
import { Monitor, Site, StatusHistory } from "../../types";

/**
 * Logger interface abstraction.
 */
export interface ILogger {
    debug(message: string, ...args: unknown[]): void;
    error(message: string, error?: unknown, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
}

/**
 * Site repository interface.
 */
export interface ISiteRepository {
    findAll(): Promise<{ identifier: string; name?: string | undefined }[]>;
    findByIdentifier(identifier: string): Promise<{ identifier: string; name?: string | undefined } | undefined>;
    upsert(site: Pick<Site, "identifier" | "name">): Promise<void>;
    upsertInternal(db: Database, site: Pick<Site, "identifier" | "name" | "monitoring">): void;
    delete(identifier: string): Promise<boolean>;
    deleteInternal(db: Database, identifier: string): boolean;
    // Import/Export operations
    exportAll(): Promise<Site[]>;
    deleteAll(): Promise<void>;
    bulkInsert(sites: { identifier: string; name?: string }[]): Promise<void>;
}

/**
 * Monitor repository interface.
 */
export interface IMonitorRepository {
    findBySiteIdentifier(siteIdentifier: string): Promise<Monitor[]>;
    create(siteIdentifier: string, monitor: Monitor): Promise<string>;
    createInternal(db: Database, siteIdentifier: string, monitor: Omit<Monitor, "id">): string;
    update(monitorId: string, monitor: Partial<Monitor>): Promise<void>;
    updateInternal(db: Database, monitorId: string, monitor: Partial<Monitor>): void;
    delete(monitorId: string): Promise<boolean>;
    deleteBySiteIdentifier(siteIdentifier: string): Promise<void>;
    deleteBySiteIdentifierInternal(db: Database, siteIdentifier: string): void;
    deleteMonitorInternal(db: Database, monitorId: string): boolean;
    // Import/Export operations
    deleteAll(): Promise<void>;
    bulkCreate(siteIdentifier: string, monitors: Monitor[]): Promise<Monitor[]>;
}

/**
 * History repository interface.
 */
export interface IHistoryRepository {
    findByMonitorId(monitorId: string): Promise<StatusHistory[]>;
    create(monitorId: string, history: StatusHistory): Promise<void>;
    deleteByMonitorId(monitorId: string): Promise<void>;
    deleteByMonitorIdInternal(db: Database, monitorId: string): void;
    // Import/Export operations
    deleteAll(): Promise<void>;
    deleteAllInternal(db: Database): void;
    addEntry(monitorId: string, history: StatusHistory, details?: string): Promise<void>;
    addEntryInternal(db: Database, monitorId: string, history: StatusHistory, details?: string): void;
    pruneHistory(monitorId: string, limit: number): Promise<void>;
    pruneHistoryInternal(db: Database, monitorId: string, limit: number): void;
    pruneAllHistoryInternal(db: Database, limit: number): void;
}

/**
 * Settings repository interface.
 */
export interface ISettingsRepository {
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string): Promise<void>;
    setInternal(db: Database, key: string, value: string): void;
    delete(key: string): Promise<void>;
    deleteInternal(db: Database, key: string): void;
    // Import/Export operations
    getAll(): Promise<Record<string, string>>;
    deleteAll(): Promise<void>;
    deleteAllInternal(db: Database): void;
    bulkInsert(settings: Record<string, string>): Promise<void>;
    bulkInsertInternal(db: Database, settings: Record<string, string>): void;
}

/**
 * Configuration for site loading operations.
 */
export interface SiteLoadingConfig {
    /** Repository dependencies */
    repositories: {
        site: ISiteRepository;
        monitor: IMonitorRepository;
        history: IHistoryRepository;
        settings: ISettingsRepository;
    };
    /** Logger instance */
    logger: ILogger;
    /** Typed event emitter for error handling */
    eventEmitter: TypedEventBus<UptimeEvents>;
}

/**
 * Configuration for site writing operations.
 */
export interface SiteWritingConfig {
    /** Repository dependencies */
    repositories: {
        site: ISiteRepository;
        monitor: IMonitorRepository;
    };
    /** Logger instance */
    logger: ILogger;
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
export interface ISiteCache {
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
export class SiteCache implements ISiteCache {
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
                console.error("Cache invalidation callback error:", error);
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

export class SiteCreationError extends Error {
    constructor(identifier: string, cause?: Error) {
        super(`Failed to create site: ${identifier}`);
        this.name = "SiteCreationError";
        if (cause?.stack) {
            this.stack = cause.stack;
        }
    }
}

export class SiteUpdateError extends Error {
    constructor(identifier: string, cause?: Error) {
        super(`Failed to update site: ${identifier}`);
        this.name = "SiteUpdateError";
        if (cause?.stack) {
            this.stack = cause.stack;
        }
    }
}

export class SiteDeletionError extends Error {
    constructor(identifier: string, cause?: Error) {
        super(`Failed to delete site: ${identifier}`);
        this.name = "SiteDeletionError";
        if (cause?.stack) {
            this.stack = cause.stack;
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
