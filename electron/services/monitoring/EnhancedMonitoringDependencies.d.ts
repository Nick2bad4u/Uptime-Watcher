/**
 * Shared dependency contract for the enhanced monitoring subsystem.
 *
 * @remarks
 * This type is intentionally extracted into its own module so that:
 *
 * - The dependency surface stays a single source of truth
 * - Services that need “most of the same dependencies” can extend it without
 *   duplicating import blocks and property lists
 * - Factory code can accept a single, well-documented parameter type
 *
 * This interface is purely a TypeScript contract (no runtime code).
 *
 * @public
 */

import type { Site } from "@shared/types";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";
import type { HistoryRepository } from "../database/HistoryRepository";
import type { MonitorRepository } from "../database/MonitorRepository";
import type { SiteRepository } from "../database/SiteRepository";
import type { MonitorOperationRegistry } from "./MonitorOperationRegistry";

/**
 * Dependencies required for creating and configuring enhanced monitoring
 * services.
 *
 * @remarks
 * This interface defines all the external dependencies that the enhanced
 * monitoring factory requires to create fully functional monitoring services.
 * Each dependency serves a specific purpose in the monitoring ecosystem and
 * must be properly configured before service creation.
 *
 * **Dependency Categories:**
 *
 * - **Data Access**: Repositories for persistent storage operations
 * - **Caching**: In-memory data access for performance optimization
 * - **Communication**: Event system for monitoring notifications
 * - **Configuration**: Dynamic settings and limits
 *
 * This interface is also used as a base type for
 * {@link electron/services/monitoring/EnhancedMonitorChecker#EnhancedMonitorCheckConfig | EnhancedMonitorCheckConfig}
 * (which adds checker-only dependencies like timeout and status update
 * services).
 *
 * @example
 *
 * ```typescript
 * const dependencies: EnhancedMonitoringDependencies = {
 *     eventEmitter: new TypedEventBus(),
 *     getHistoryLimit: () => userSettings.historyLimit,
 *     historyRepository: new HistoryRepository({
 *         databaseService: dbService,
 *     }),
 *     monitorRepository: new MonitorRepository({
 *         databaseService: dbService,
 *     }),
 *     operationRegistry: registry,
 *     siteRepository: new SiteRepository({ databaseService: dbService }),
 *     sites: new StandardizedCache<Site>(),
 * };
 * ```
 */
export interface EnhancedMonitoringDependencies {
    /**
     * Event emitter for system-wide communication and monitoring notifications.
     *
     * @remarks
     * Used to broadcast monitor status changes, operation events, and other
     * monitoring-related notifications throughout the application. Essential
     * for UI updates and cross-component communication.
     */
    readonly eventEmitter: TypedEventBus<UptimeEvents>;

    /**
     * Function to get the current maximum number of history entries to keep for
     * each monitor.
     *
     * @remarks
     * This function provides dynamic access to the history limit setting, which
     * may change during runtime based on user configuration or system
     * constraints. Used for automatic history pruning during status updates.
     *
     * @returns The maximum number of status history entries to retain per
     *   monitor
     */
    readonly getHistoryLimit: () => number;

    /**
     * Repository for monitor status history operations and management.
     *
     * @remarks
     * Handles persistence and retrieval of monitor status history entries,
     * including automatic pruning based on the configured history limit.
     * Essential for trend analysis and historical reporting.
     */
    readonly historyRepository: HistoryRepository;

    /**
     * Repository for monitor entity operations and configuration management.
     *
     * @remarks
     * Manages monitor entity persistence, status updates, configuration
     * changes, and monitor-related database operations. Core component for
     * monitor state management.
     */
    readonly monitorRepository: MonitorRepository;

    /**
     * Registry coordinating active monitor operations to prevent race
     * conditions.
     */
    readonly operationRegistry: MonitorOperationRegistry;

    /**
     * Repository for site entity operations and site-monitor relationship
     * management.
     *
     * @remarks
     * Handles site entity persistence and manages the relationship between
     * sites and their associated monitors. Required for site-level monitoring
     * operations.
     */
    readonly siteRepository: SiteRepository;

    /**
     * In-memory cache for fast access to site and monitor configurations.
     *
     * @remarks
     * Provides high-performance, in-memory access to site configurations and
     * monitor definitions, reducing database load during frequent monitoring
     * operations. Critical for maintaining acceptable monitoring performance at
     * scale.
     */
    readonly sites: StandardizedCache<Site>;
}
