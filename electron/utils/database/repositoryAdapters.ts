/**
 * Adapters for existing repository classes to implement the new interfaces.
 * These adapters make the existing concrete classes compatible with the new interfaces.
 */

/* eslint-disable @typescript-eslint/require-await -- Adapter methods must be async to match interface contracts */

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
        return this.repository.findAll();
    }

    async findByIdentifier(identifier: string): Promise<{ identifier: string; name?: string | undefined } | undefined> {
        return this.repository.findByIdentifier(identifier);
    }

    async upsert(site: Pick<Site, "identifier" | "name" | "monitoring">): Promise<void> {
        return this.repository.upsert(site);
    }

    upsertInternal(db: Database, site: Pick<Site, "identifier" | "name" | "monitoring">): void {
        return this.repository.upsertInternal(db, site);
    }

    async delete(identifier: string): Promise<boolean> {
        return this.repository.delete(identifier);
    }

    deleteInternal(db: Database, identifier: string): boolean {
        return this.repository.deleteInternal(db, identifier);
    }

    // Import/Export operations
    async exportAll(): Promise<Site[]> {
        // The repository returns basic site data, we need to build full Site objects
        const siteData = this.repository.exportAll();
        return siteData.map((site) => ({
            identifier: site.identifier,
            name: site.name ?? "Unnamed Site",
            monitors: [], // Will be populated by caller if needed
            monitoring: true,
        }));
    }

    async deleteAll(): Promise<void> {
        return this.repository.deleteAll();
    }

    async bulkInsert(sites: { identifier: string; name?: string }[]): Promise<void> {
        return this.repository.bulkInsert(sites);
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
        return this.repository.findBySiteIdentifier(siteIdentifier);
    }

    async create(siteIdentifier: string, monitor: Monitor): Promise<string> {
        return this.repository.create(siteIdentifier, monitor);
    }

    createInternal(db: Database, siteIdentifier: string, monitor: Monitor): string {
        return this.repository.createInternal(db, siteIdentifier, monitor);
    }

    async update(monitorId: string, monitor: Monitor): Promise<void> {
        return this.repository.update(monitorId, monitor);
    }

    updateInternal(db: Database, monitorId: string, monitor: Partial<Monitor>): void {
        return this.repository.updateInternal(db, monitorId, monitor);
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
        return this.repository.deleteAll();
    }

    async bulkCreate(siteIdentifier: string, monitors: Monitor[]): Promise<Monitor[]> {
        return this.repository.bulkCreate(siteIdentifier, monitors);
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
        return this.repository.findByMonitorId(monitorId);
    }

    async create(monitorId: string, history: StatusHistory): Promise<void> {
        return this.repository.addEntry(monitorId, history);
    }

    async deleteByMonitorId(monitorId: string): Promise<void> {
        return this.repository.deleteByMonitorId(monitorId);
    }

    deleteByMonitorIdInternal(db: Database, monitorId: string): void {
        return this.repository.deleteByMonitorIdInternal(db, monitorId);
    }

    // Import/Export operations
    async deleteAll(): Promise<void> {
        return this.repository.deleteAll();
    }

    deleteAllInternal(db: Database): void {
        return this.repository.deleteAllInternal(db);
    }

    async addEntry(monitorId: string, history: StatusHistory, details?: string): Promise<void> {
        return this.repository.addEntry(monitorId, history, details);
    }

    addEntryInternal(db: Database, monitorId: string, history: StatusHistory, details?: string): void {
        return this.repository.addEntryInternal(db, monitorId, history, details);
    }

    async pruneHistory(monitorId: string, limit: number): Promise<void> {
        return this.repository.pruneHistory(monitorId, limit);
    }

    pruneHistoryInternal(db: Database, monitorId: string, limit: number): void {
        return this.repository.pruneHistoryInternal(db, monitorId, limit);
    }

    pruneAllHistoryInternal(db: Database, limit: number): void {
        return this.repository.pruneAllHistoryInternal(db, limit);
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
        return result ?? undefined;
    }

    async set(key: string, value: string): Promise<void> {
        return this.repository.set(key, value);
    }

    setInternal(db: Database, key: string, value: string): void {
        return this.repository.setInternal(db, key, value);
    }

    async delete(key: string): Promise<void> {
        return this.repository.delete(key);
    }

    deleteInternal(db: Database, key: string): void {
        return this.repository.deleteInternal(db, key);
    }

    // Import/Export operations
    async getAll(): Promise<Record<string, string>> {
        return this.repository.getAll();
    }

    async deleteAll(): Promise<void> {
        return this.repository.deleteAll();
    }

    deleteAllInternal(db: Database): void {
        return this.repository.deleteAllInternal(db);
    }

    async bulkInsert(settings: Record<string, string>): Promise<void> {
        return this.repository.bulkInsert(settings);
    }

    bulkInsertInternal(db: Database, settings: Record<string, string>): void {
        return this.repository.bulkInsertInternal(db, settings);
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
