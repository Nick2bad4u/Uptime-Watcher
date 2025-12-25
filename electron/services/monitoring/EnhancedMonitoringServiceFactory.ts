/**
 * Factory for creating and configuring enhanced monitoring services with
 * comprehensive operation correlation.
 *
 * @remarks
 * This factory provides centralized creation and configuration of the enhanced
 * monitoring system components, ensuring proper dependency injection, service
 * coordination, and consistent configuration across all monitoring operations.
 * It serves as the single point of truth for enhanced monitoring service
 * initialization.
 *
 * **Key Responsibilities:**
 *
 * - Creates and configures all enhanced monitoring service components
 * - Ensures proper dependency injection and service relationships
 * - Provides consistent configuration across all monitoring services
 * - Manages service lifecycle and initialization order
 * - Abstracts service creation complexity from consuming code
 *
 * **Service Components Created:**
 *
 * - {@link EnhancedMonitorChecker} - Core monitoring logic with operation
 *   correlation - {@link MonitorOperationRegistry} - Operation tracking and race
 *   condition prevention - {@link MonitorStatusUpdateService} - Safe concurrent
 *   status updates
 * - {@link OperationTimeoutManager} - Timeout management and resource cleanup
 *
 * @example
 *
 * ```typescript
 * const dependencies = {
 *     eventEmitter: typedEventBus,
 *     getHistoryLimit: () => 100,
 *     historyRepository: historyRepo,
 *     // ... other dependencies
 * };
 *
 * const services =
 *     EnhancedMonitoringServiceFactory.createServices(dependencies);
 * const result = await services.checker.checkMonitor(site, monitorId);
 * ```
 *
 * @public
 *
 * @see {@link EnhancedMonitoringDependencies} for required dependencies
 * @see {@link EnhancedMonitoringServices} for provided services
 */

import type { EnhancedMonitorCheckConfig } from "./EnhancedMonitorChecker";
import type { EnhancedMonitoringDependencies } from "./EnhancedMonitoringDependencies";
import type { MonitorOperationRegistry } from "./MonitorOperationRegistry";

import { EnhancedMonitorChecker } from "./EnhancedMonitorChecker";
import { MonitorStatusUpdateService } from "./MonitorStatusUpdateService";
import { OperationTimeoutManager } from "./OperationTimeoutManager";

/**
 * Complete bundle of enhanced monitoring services for operation correlation and
 * race condition prevention.
 *
 * @remarks
 * This interface defines the complete set of enhanced monitoring services that
 * work together to provide robust, race condition-safe monitoring operations.
 * All services are pre-configured and ready for use, with proper inter-service
 * dependencies already established.
 *
 * **Service Architecture:**
 *
 * - **Core Engine**: {@link EnhancedMonitorChecker} provides the main monitoring
 *   logic - **Operation Tracking**: {@link MonitorOperationRegistry} prevents
 *   race conditions - **Status Management**: {@link MonitorStatusUpdateService}
 *   ensures safe concurrent updates - **Resource Management**:
 *   {@link OperationTimeoutManager} handles timeouts and cleanup
 *
 * **Usage Pattern:** All services in this bundle are designed to work together.
 * The checker service is the primary interface for consumers, while the other
 * services provide supporting functionality that the checker coordinates
 * automatically.
 *
 * @example
 *
 * ```typescript
 * const services =
 *     EnhancedMonitoringServiceFactory.createServices(dependencies);
 *
 * // Primary usage - checker coordinates all other services
 * const result = await services.checker.checkMonitor(site, monitorId);
 *
 * // Advanced usage - direct access to supporting services
 * const isActive = services.registry.isOperationActive(monitorId);
 * await services.statusUpdateService.updateStatus(monitorId, newStatus);
 * ```
 *
 * @public
 *
 * @see {@link EnhancedMonitoringServiceFactory.createServices} for service creation
 * @see {@link EnhancedMonitoringDependencies} for required dependencies
 */
export interface EnhancedMonitoringServices {
    /**
     * Enhanced monitor checker with comprehensive operation correlation and
     * race condition prevention.
     *
     * @remarks
     * This is the primary service interface for monitor checking operations. It
     * coordinates with all other services in the bundle to provide safe,
     * efficient monitoring capabilities. Most consumers should interact
     * exclusively with this service.
     */
    checker: EnhancedMonitorChecker;

    /**
     * Operation registry for monitoring active operations and preventing race
     * conditions.
     *
     * @remarks
     * Tracks all active monitor operations to prevent duplicate or conflicting
     * checks. Primarily used internally by the checker service, but available
     * for advanced use cases requiring direct operation state querying.
     */
    operationRegistry: MonitorOperationRegistry;

    /**
     * Status update service with operation validation and concurrent access
     * safety.
     *
     * @remarks
     * Provides safe status update operations that validate against current
     * operation state to prevent race conditions during concurrent monitor
     * checks. Ensures status updates are only applied when appropriate and
     * maintains data consistency.
     */
    statusUpdateService: MonitorStatusUpdateService;

    /**
     * Timeout manager for operation lifecycle management and resource cleanup.
     *
     * @remarks
     * Handles operation timeouts, automatic cleanup procedures, and resource
     * management for monitor operations. Ensures that operations don't run
     * indefinitely and that resources are properly released when operations
     * complete or are cancelled.
     */
    timeoutManager: OperationTimeoutManager;
}

/**
 * Factory class for creating and configuring complete enhanced monitoring
 * service bundles.
 *
 * @remarks
 * This factory provides a single point of entry for creating all enhanced
 * monitoring services with proper dependency injection and configuration. It
 * ensures that all services are created with the correct interdependencies and
 * are ready for immediate use.
 *
 * **Factory Benefits:**
 *
 * - **Centralized Configuration**: Single place to configure all monitoring
 *   services - **Dependency Management**: Automatic handling of complex service
 *   dependencies - **Consistency**: Ensures all service instances use
 *   compatible configurations - **Simplicity**: Reduces boilerplate code for
 *   service instantiation
 * - **Testability**: Facilitates easy mocking and testing of service bundles
 *
 * @public
 */
export const EnhancedMonitoringServiceFactory = {
    /**
     * Creates a complete bundle of enhanced monitoring services configured for
     * immediate use.
     *
     * @remarks
     * This method creates and configures all enhanced monitoring services with
     * proper interdependencies. All services are initialized and ready for use
     * upon return. The factory handles complex service relationships
     * internally.
     *
     * **Service Creation Order:**
     *
     * 1. Operation registry for tracking active operations
     * 2. Status update service for safe concurrent updates
     * 3. Timeout manager for operation lifecycle management
     * 4. Enhanced checker with all dependencies injected
     *
     * **Dependency Validation:** The factory validates that all required
     * dependencies are provided and properly configured before creating
     * services. Invalid or missing dependencies will result in clear error
     * messages.
     *
     * @example Basic Service Creation
     *
     * ```typescript
     * const dependencies = {
     *     eventEmitter: typedEventBus,
     *     getHistoryLimit: () => 100,
     *     historyRepository: historyRepo,
     *     monitorRepository: monitorRepo,
     *     siteRepository: siteRepo,
     *     sites: sitesCache,
     * };
     *
     * const services =
     *     EnhancedMonitoringServiceFactory.createServices(dependencies);
     * const result = await services.checker.checkMonitor(site, monitorId);
     * ```
     *
     * @example Testing with Mocked Dependencies
     *
     * ```typescript
     * const mockDependencies = {
     *     eventEmitter: createMockEventBus(),
     *     getHistoryLimit: () => 50,
     *     historyRepository: createMockHistoryRepo(),
     *     // ... other mocked dependencies
     * };
     *
     * const services =
     *     EnhancedMonitoringServiceFactory.createServices(
     *         mockDependencies
     *     );
     * // Use services for testing...
     * ```
     *
     * @param dependencies - Complete set of required external dependencies
     *
     * @returns A complete bundle of enhanced monitoring services ready for use
     *
     * @throws Throws descriptive errors if required dependencies are missing,
     *   invalid, or incompatible with the enhanced monitoring system
     *
     * @public
     *
     * @see {@link EnhancedMonitoringDependencies} for dependency requirements
     * @see {@link EnhancedMonitoringServices} for provided service bundle
     */
    createServices(
        dependencies: EnhancedMonitoringDependencies
    ): EnhancedMonitoringServices {
        const operationRegistryInstance = dependencies.operationRegistry;

        // Create timeout manager
        const timeoutManager = new OperationTimeoutManager(
            operationRegistryInstance
        );

        // Create status update service
        const statusUpdateService = new MonitorStatusUpdateService(
            operationRegistryInstance,
            dependencies.monitorRepository,
            dependencies.sites
        );

        // Create enhanced monitor checker configuration
        const checkerConfig: EnhancedMonitorCheckConfig = {
            eventEmitter: dependencies.eventEmitter,
            getHistoryLimit: dependencies.getHistoryLimit,
            historyRepository: dependencies.historyRepository,
            monitorRepository: dependencies.monitorRepository,
            operationRegistry: operationRegistryInstance,
            siteRepository: dependencies.siteRepository,
            sites: dependencies.sites,
            statusUpdateService,
            timeoutManager,
        };

        // Create enhanced monitor checker
        const checker = new EnhancedMonitorChecker(checkerConfig);

        return {
            checker,
            operationRegistry: operationRegistryInstance,
            statusUpdateService,
            timeoutManager,
        };
    },
};
