/**
 * Shared repository type bundles for manager-layer dependency injection.
 *
 * @remarks
 * Jscpd frequently flags the manager files because they need the same set of
 * repository/service types. Instead of repeating long import blocks, we define
 * stable “bundles” here that:
 *
 * - Centralize the repository shape used by each manager
 * - Keep imports in consuming files small without introducing barrel exports
 * - Remain type-only (no runtime code / no new execution paths)
 */

import type { DatabaseService } from "../services/database/DatabaseService";
import type { HistoryRepository } from "../services/database/HistoryRepository";
import type { MonitorRepository } from "../services/database/MonitorRepository";
import type { SettingsRepository } from "../services/database/SettingsRepository";
import type { SiteRepository } from "../services/database/SiteRepository";

/**
 * Repository set used by {@link DatabaseManager}.
 */
export interface DatabaseManagerRepositories {
    /** The main database service. */
    readonly database: DatabaseService;
    /** Repository for status history. */
    readonly history: HistoryRepository;
    /** Repository for monitor data. */
    readonly monitor: MonitorRepository;
    /** Repository for application settings. */
    readonly settings: SettingsRepository;
    /** Repository for site data. */
    readonly site: SiteRepository;
}

/**
 * Repository set used by {@link SiteManager}.
 */
export interface SiteManagerRepositories {
    /** Database service for transactional operations */
    readonly databaseService: DatabaseService;
    /** Repository for managing status history records */
    readonly historyRepository: HistoryRepository;
    /** Repository for managing monitor configuration and data */
    readonly monitorRepository: MonitorRepository;
    /** Repository for managing application settings */
    readonly settingsRepository: SettingsRepository;
    /** Repository for managing site configuration and data */
    readonly siteRepository: SiteRepository;
}
