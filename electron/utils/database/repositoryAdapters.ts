/**
 * Adapters for existing repository classes to implement the new interfaces.
 * These adapters make the existing concrete classes compatible with the new interfaces.
 */

import { Database } from "node-sqlite3-wasm";

import { SiteRepository, MonitorRepository, HistoryRepository, SettingsRepository } from "../../services/index";
import { Monitor, Site, StatusHistory } from "../../types";
import { monitorLogger } from "../../utils/index";
import { ISiteRepository, IMonitorRepository, IHistoryRepository, ISettingsRepository, ILogger } from "./interfaces";

/**
 * Adapter for SiteRepository to implement ISiteRepository interface.
 */
export class SiteRepositoryAdapter implements ISiteRepository {
    private readonly repository: SiteRepository;

    constructor(repository: SiteRepository) {
        this.repository = repository;
    }

    async findAll(): Promise<{ identifier: string; name?: string | undefined }[]> {
        return Promise.resolve(this.repository.findAll());
    }

    async findByIdentifier(identifier: string): Promise<{ identifier: string; name?: string | undefined } | undefined> {
        return Promise.resolve(this.repository.findByIdentifier(identifier));
    }

    async upsert(site: Pick<Site, "identifier" | "name">): Promise<void> {
        return Promise.resolve(this.repository.upsert(site));
    }

    async delete(identifier: string): Promise<boolean> {
        return Promise.resolve(this.repository.delete(identifier));
    }

    // Import/Export operations
    async exportAll(): Promise<Site[]> {
        // The repository returns basic site data, we need to build full Site objects
        const siteData = this.repository.exportAll();
        return Promise.resolve(
            siteData.map((site) => ({
                identifier: site.identifier,
                name: site.name ?? "Unnamed Site",
                monitors: [], // Will be populated by caller if needed
                monitoring: true,
            }))
        );
    }

    async deleteAll(): Promise<void> {
        return Promise.resolve(this.repository.deleteAll());
    }

    async bulkInsert(sites: { identifier: string; name?: string }[]): Promise<void> {
        return Promise.resolve(this.repository.bulkInsert(sites));
    }
}

/**
 * Adapter for MonitorRepository to implement IMonitorRepository interface.
 */
export class MonitorRepositoryAdapter implements IMonitorRepository {
    private readonly repository: MonitorRepository;

    constructor(repository: MonitorRepository) {
        this.repository = repository;
    }

    async findBySiteIdentifier(siteIdentifier: string): Promise<Monitor[]> {
        return Promise.resolve(this.repository.findBySiteIdentifier(siteIdentifier));
    }

    async create(siteIdentifier: string, monitor: Monitor): Promise<string> {
        return Promise.resolve(this.repository.create(siteIdentifier, monitor));
    }

    async update(monitorId: string, monitor: Monitor): Promise<void> {
        return Promise.resolve(this.repository.update(monitorId, monitor));
    }

    async delete(monitorId: string): Promise<boolean> {
        return this.repository.delete(monitorId);
    }

    async deleteBySiteIdentifier(siteIdentifier: string): Promise<void> {
        return this.repository.deleteBySiteIdentifier(siteIdentifier);
    }

    deleteBySiteIdentifierInternal(db: Database, siteIdentifier: string): void {
        return this.repository.deleteBySiteIdentifierInternal(db, siteIdentifier);
    }

    deleteMonitorInternal(db: Database, monitorId: string): boolean {
        return this.repository.deleteMonitorInternal(db, monitorId);
    }

    // Import/Export operations
    async deleteAll(): Promise<void> {
        return Promise.resolve(this.repository.deleteAll());
    }

    async bulkCreate(siteIdentifier: string, monitors: Monitor[]): Promise<Monitor[]> {
        return Promise.resolve(this.repository.bulkCreate(siteIdentifier, monitors));
    }
}

/**
 * Adapter for HistoryRepository to implement IHistoryRepository interface.
 */
export class HistoryRepositoryAdapter implements IHistoryRepository {
    private readonly repository: HistoryRepository;

    constructor(repository: HistoryRepository) {
        this.repository = repository;
    }

    async findByMonitorId(monitorId: string): Promise<StatusHistory[]> {
        return Promise.resolve(this.repository.findByMonitorId(monitorId));
    }

    async create(monitorId: string, history: StatusHistory): Promise<void> {
        return Promise.resolve(this.repository.addEntry(monitorId, history));
    }

    async deleteByMonitorId(monitorId: string): Promise<void> {
        return Promise.resolve(this.repository.deleteByMonitorId(monitorId));
    }

    // Import/Export operations
    async deleteAll(): Promise<void> {
        return Promise.resolve(this.repository.deleteAll());
    }

    async addEntry(monitorId: string, history: StatusHistory, details?: string): Promise<void> {
        return Promise.resolve(this.repository.addEntry(monitorId, history, details));
    }

    async pruneHistory(monitorId: string, limit: number): Promise<void> {
        return Promise.resolve(this.repository.pruneHistory(monitorId, limit));
    }
}

/**
 * Adapter for SettingsRepository to implement ISettingsRepository interface.
 */
export class SettingsRepositoryAdapter implements ISettingsRepository {
    private readonly repository: SettingsRepository;

    constructor(repository: SettingsRepository) {
        this.repository = repository;
    }

    async get(key: string): Promise<string | undefined> {
        const result = this.repository.get(key);
        return Promise.resolve(result ?? undefined);
    }

    async set(key: string, value: string): Promise<void> {
        return Promise.resolve(this.repository.set(key, value));
    }

    async delete(key: string): Promise<void> {
        return Promise.resolve(this.repository.delete(key));
    }

    // Import/Export operations
    async getAll(): Promise<Record<string, string>> {
        return Promise.resolve(this.repository.getAll());
    }

    async deleteAll(): Promise<void> {
        return Promise.resolve(this.repository.deleteAll());
    }

    async bulkInsert(settings: Record<string, string>): Promise<void> {
        return Promise.resolve(this.repository.bulkInsert(settings));
    }
}

/**
 * Adapter for the logger to implement ILogger interface.
 */
export class LoggerAdapter implements ILogger {
    private readonly logger: typeof monitorLogger;

    constructor(logger: typeof monitorLogger) {
        this.logger = logger;
    }

    debug(message: string, ...args: unknown[]): void {
        this.logger.debug(message, ...args);
    }

    error(message: string, error?: unknown, ...args: unknown[]): void {
        this.logger.error(message, error, ...args);
    }

    info(message: string, ...args: unknown[]): void {
        this.logger.info(message, ...args);
    }

    warn(message: string, ...args: unknown[]): void {
        this.logger.warn(message, ...args);
    }
}
