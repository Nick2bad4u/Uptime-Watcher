/**
 * Adapters for existing repository classes to implement the new interfaces.
 * These adapters make the existing concrete classes compatible with the new interfaces.
 */

import { SiteRepository, MonitorRepository, HistoryRepository, SettingsRepository } from "../../services/database";
import { Monitor, Site, StatusHistory } from "../../types";
import { monitorLogger } from "../logger";
import { ISiteRepository, IMonitorRepository, IHistoryRepository, ISettingsRepository, ILogger } from "./interfaces";

/**
 * Adapter for SiteRepository to implement ISiteRepository interface.
 */
export class SiteRepositoryAdapter implements ISiteRepository {
    private readonly repository: SiteRepository;

    constructor(repository: SiteRepository) {
        this.repository = repository;
    }

    async findAll(): Promise<Array<{ identifier: string; name?: string | undefined }>> {
        return this.repository.findAll();
    }

    async findByIdentifier(identifier: string): Promise<{ identifier: string; name?: string | undefined } | undefined> {
        return this.repository.findByIdentifier(identifier);
    }

    async upsert(site: Pick<Site, "identifier" | "name">): Promise<void> {
        return this.repository.upsert(site);
    }

    async delete(identifier: string): Promise<boolean> {
        return this.repository.delete(identifier);
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

    async update(monitorId: string, monitor: Monitor): Promise<void> {
        return this.repository.update(monitorId, monitor);
    }

    async delete(monitorId: string): Promise<boolean> {
        return this.repository.delete(monitorId);
    }

    async deleteBySiteIdentifier(siteIdentifier: string): Promise<void> {
        return this.repository.deleteBySiteIdentifier(siteIdentifier);
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
        const result = await this.repository.get(key);
        return result ?? undefined;
    }

    async set(key: string, value: string): Promise<void> {
        return this.repository.set(key, value);
    }

    async delete(key: string): Promise<void> {
        return this.repository.delete(key);
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
