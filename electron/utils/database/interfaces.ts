/**
 * Interfaces for database utilities to support dependency injection and testing.
 */

import { EventEmitter } from "events";

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
    findAll(): Promise<Array<{ identifier: string; name?: string | undefined }>>;
    findByIdentifier(identifier: string): Promise<{ identifier: string; name?: string | undefined } | undefined>;
    upsert(site: Pick<Site, "identifier" | "name">): Promise<void>;
    delete(identifier: string): Promise<boolean>;
}

/**
 * Monitor repository interface.
 */
export interface IMonitorRepository {
    findBySiteIdentifier(siteIdentifier: string): Promise<Monitor[]>;
    create(siteIdentifier: string, monitor: Monitor): Promise<string>;
    update(monitorId: string, monitor: Monitor): Promise<void>;
    delete(monitorId: string): Promise<boolean>;
    deleteBySiteIdentifier(siteIdentifier: string): Promise<void>;
}

/**
 * History repository interface.
 */
export interface IHistoryRepository {
    findByMonitorId(monitorId: string): Promise<StatusHistory[]>;
    create(monitorId: string, history: StatusHistory): Promise<void>;
    deleteByMonitorId(monitorId: string): Promise<void>;
}

/**
 * Settings repository interface.
 */
export interface ISettingsRepository {
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
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
    /** Event emitter for error handling */
    eventEmitter: EventEmitter;
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
}

/**
 * Site cache interface.
 */
export interface ISiteCache {
    get(identifier: string): Site | undefined;
    set(identifier: string, site: Site): void;
    delete(identifier: string): boolean;
    clear(): void;
    size(): number;
    entries(): IterableIterator<[string, Site]>;
}

/**
 * Simple implementation of ISiteCache using Map.
 */
export class SiteCache implements ISiteCache {
    private readonly cache = new Map<string, Site>();

    get(identifier: string): Site | undefined {
        return this.cache.get(identifier);
    }

    set(identifier: string, site: Site): void {
        this.cache.set(identifier, site);
    }

    delete(identifier: string): boolean {
        return this.cache.delete(identifier);
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }

    entries(): IterableIterator<[string, Site]> {
        return this.cache.entries();
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
        if (cause && cause.stack) {
            this.stack = cause.stack;
        }
    }
}

export class SiteUpdateError extends Error {
    constructor(identifier: string, cause?: Error) {
        super(`Failed to update site: ${identifier}`);
        this.name = "SiteUpdateError";
        if (cause && cause.stack) {
            this.stack = cause.stack;
        }
    }
}

export class SiteDeletionError extends Error {
    constructor(identifier: string, cause?: Error) {
        super(`Failed to delete site: ${identifier}`);
        this.name = "SiteDeletionError";
        if (cause && cause.stack) {
            this.stack = cause.stack;
        }
    }
}

export class SiteLoadingError extends Error {
    constructor(message: string, cause?: Error) {
        super(`Failed to load sites: ${message}`);
        this.name = "SiteLoadingError";
        if (cause && cause.stack) {
            this.stack = cause.stack;
        }
    }
}
