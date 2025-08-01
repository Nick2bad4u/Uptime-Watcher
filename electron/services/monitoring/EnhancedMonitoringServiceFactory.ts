/**
 * Factory for creating enhanced monitoring services with operation correlation.
 *
 * @remarks
 * Provides centralized creation and configuration of the enhanced monitoring
 * system components. Ensures proper dependency injection and configuration.
 *
 * @packageDocumentation
 */

import { UptimeEvents } from "../../events/eventTypes";
import { TypedEventBus } from "../../events/TypedEventBus";
import { Site } from "../../types";
import { StandardizedCache } from "../../utils/cache/StandardizedCache";
import { HistoryRepository } from "../database/HistoryRepository";
import { MonitorRepository } from "../database/MonitorRepository";
import { SiteRepository } from "../database/SiteRepository";
import { EnhancedMonitorCheckConfig, EnhancedMonitorChecker } from "./EnhancedMonitorChecker";
import { MonitorOperationRegistry, operationRegistry } from "./MonitorOperationRegistry";
import { MonitorStatusUpdateService } from "./MonitorStatusUpdateService";
import { OperationTimeoutManager } from "./OperationTimeoutManager";

/**
 * Dependencies for creating enhanced monitoring services.
 *
 * @public
 */
export interface EnhancedMonitoringDependencies {
    /** Event emitter for system-wide communication */
    eventEmitter: TypedEventBus<UptimeEvents>;
    /** Function to get the maximum number of history entries to keep */
    getHistoryLimit: () => number;
    /** Repository for history operations */
    historyRepository: HistoryRepository;
    /** Repository for monitor operations */
    monitorRepository: MonitorRepository;
    /** Repository for site operations */
    siteRepository: SiteRepository;
    /** Sites cache for quick access */
    sites: StandardizedCache<Site>;
}

/**
 * Enhanced monitoring services bundle.
 *
 * @public
 */
export interface EnhancedMonitoringServices {
    /** Enhanced monitor checker with operation correlation */
    checker: EnhancedMonitorChecker;
    /** Operation registry for correlation */
    operationRegistry: MonitorOperationRegistry;
    /** Status update service with validation */
    statusUpdateService: MonitorStatusUpdateService;
    /** Timeout manager for operation cleanup */
    timeoutManager: OperationTimeoutManager;
}

/**
 * Factory for creating enhanced monitoring services.
 *
 * @public
 */
export const EnhancedMonitoringServiceFactory = {
    /**
     * Create enhanced monitoring services bundle.
     *
     * @param dependencies - Required dependencies
     * @returns Complete enhanced monitoring services
     */
    create(dependencies: EnhancedMonitoringDependencies): EnhancedMonitoringServices {
        // Use singleton operation registry
        const operationRegistryInstance = operationRegistry;

        // Create timeout manager
        const timeoutManager = new OperationTimeoutManager(operationRegistryInstance);

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
