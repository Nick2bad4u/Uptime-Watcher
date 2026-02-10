/* V8 ignore start */

/**
 * Site manager type contracts extracted from {@link electron/managers/SiteManager#SiteManager}.
 *
 * @remarks
 * `electron/managers/SiteManager.ts` is a very large module (CRUD + cache +
 * state sync). Keeping the type-only contracts in a dedicated module:
 *
 * - Reduces noise in the main implementation file
 * - Avoids re-reading hundreds of lines when refactoring behavior
 * - Keeps dependency injection contracts easy to locate
 */

import type { Site } from "@shared/types";

import type { UptimeEvents } from "../events/eventTypes";
import type { TypedEventBus } from "../events/TypedEventBus";
import type { ConfigurationManager } from "./ConfigurationManager";
import type { SiteManagerRepositories } from "./databaseRepositorySets";

/** @internal Runtime marker to satisfy coverage for the pure type module. */
export const SITE_MANAGER_TYPES_RUNTIME_MARKER = true as const;

/**
 * Defines the contract for monitoring operations that can be performed in
 * coordination with site management.
 *
 * @remarks
 * This allows loose coupling between the SiteManager and MonitorManager while
 * still enabling coordinated operations.
 */
export interface IMonitoringOperations {
    /**
     * Update the global history limit setting.
     *
     * @param limit - The new history limit value.
     */
    setHistoryLimit: (limit: number) => Promise<void>;

    /**
     * Set up monitoring for newly created monitors.
     *
     * @param site - The site containing new monitors.
     * @param newMonitorIds - Array of new monitor IDs to set up.
     */
    setupNewMonitors: (site: Site, newMonitorIds: string[]) => Promise<void>;

    /**
     * Start monitoring for a specific site and monitor.
     *
     * @param identifier - The site identifier.
     * @param monitorId - The monitor ID to start monitoring for.
     */
    startMonitoringForSite: (
        identifier: string,
        monitorId: string
    ) => Promise<boolean>;

    /**
     * Stop monitoring for a specific site and monitor.
     *
     * @param identifier - The site identifier.
     * @param monitorId - The monitor ID to stop monitoring for.
     */
    stopMonitoringForSite: (
        identifier: string,
        monitorId: string
    ) => Promise<boolean>;
}

/**
 * Dependency injection configuration for {@link electron/managers/SiteManager#SiteManager}.
 */
export interface SiteManagerDependencies {
    /** Configuration manager for business rules and validation. */
    configurationManager: ConfigurationManager;

    /** Database service for transaction management. */
    databaseService: SiteManagerRepositories["databaseService"];

    /** Event emitter for system-wide communication. */
    eventEmitter: TypedEventBus<UptimeEvents>;

    /** History repository for status history management. */
    historyRepository: SiteManagerRepositories["historyRepository"];

    /** Optional MonitorManager dependency for coordinated operations. */
    monitoringOperations?: IMonitoringOperations;

    /** Monitor repository for monitor-related operations. */
    monitorRepository: SiteManagerRepositories["monitorRepository"];

    /** Settings repository for configuration management. */
    settingsRepository: SiteManagerRepositories["settingsRepository"];

    /** Site repository for database operations. */
    siteRepository: SiteManagerRepositories["siteRepository"];
}

/* V8 ignore end */
