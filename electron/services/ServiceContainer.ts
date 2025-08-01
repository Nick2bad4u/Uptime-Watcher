/**
 * Centralized dependency injection container for all Electron services.
 *
 * @remarks
 * Provides a unified mechanism for managing service dependencies and their lifecycle,
 * ensuring correct initialization order and singleton management.
 *
 * Services are categorized as:
 * - Core Services: Infrastructure (Database, IPC)
 * - Application Services: Business logic orchestrators
 * - Feature Services: Specific functionality (Monitoring, Notifications)
 * - Utility Services: Support functions (Window, Updater)
 *
 * @public
 */
import { UptimeEvents } from "../events/eventTypes";
import { TypedEventBus } from "../events/TypedEventBus";
import { ConfigurationManager } from "../managers/ConfigurationManager";
import { DatabaseManager } from "../managers/DatabaseManager";
import { MonitorManager } from "../managers/MonitorManager";
import { IMonitoringOperations, SiteManager } from "../managers/SiteManager";
import { Site } from "../types";
import { UptimeOrchestrator } from "../UptimeOrchestrator";
import { logger } from "../utils/logger";
import { DatabaseService } from "./database/DatabaseService";
import { HistoryRepository } from "./database/HistoryRepository";
import { MonitorRepository } from "./database/MonitorRepository";
import { SettingsRepository } from "./database/SettingsRepository";
import { SiteRepository } from "./database/SiteRepository";
import { IpcService } from "./ipc/IpcService";
import { EnhancedMonitoringServiceFactory } from "./monitoring/EnhancedMonitoringServiceFactory";
import { NotificationService } from "./notifications/NotificationService";
import { SiteService } from "./site/SiteService";
import { AutoUpdaterService } from "./updater/AutoUpdaterService";
import { WindowService } from "./window/WindowService";

/**
 * Configuration options for {@link ServiceContainer}.
 *
 * @remarks
 * Controls service initialization and runtime behavior.
 *
 * @public
 */
export interface ServiceContainerConfig {
    /**
     * Enables debug logging for service initialization and lifecycle events.
     *
     * @remarks
     * When enabled, logs detailed information about service creation, dependency injection,
     * initialization order, timing, manager setup, event forwarding, and error contexts.
     *
     * @defaultValue false
     */
    enableDebugLogging?: boolean;

    /**
     * Custom notification service configuration.
     *
     * @remarks
     * Controls system notification behavior for monitor status changes.
     * Can be modified at runtime via {@link NotificationService.updateConfig}.
     *
     * @defaultValue `{ showDownAlerts: true, showUpAlerts: true }`
     *
     * @see {@link NotificationService}
     */
    notificationConfig?: {
        /** Enables notifications when monitors go down. */
        showDownAlerts: boolean;
        /** Enables notifications when monitors come back up. */
        showUpAlerts: boolean;
    };
}

/**
 * Centralized service container for dependency management and lifecycle orchestration.
 *
 * @remarks
 * Provides singleton access to all core, application, feature, and utility services.
 * Ensures correct initialization order and dependency injection.
 *
 * @public
 */
export class ServiceContainer {
    private static instance: ServiceContainer | undefined = undefined;

    /**
     * Singleton instance of {@link AutoUpdaterService}.
     * @internal
     */
    private autoUpdaterService?: AutoUpdaterService;
    private readonly config: ServiceContainerConfig;
    /**
     * Singleton instance of {@link ConfigurationManager}.
     * @internal
     */
    private configurationManager?: ConfigurationManager;
    /**
     * Singleton instance of {@link DatabaseManager}.
     * @internal
     */
    private databaseManager?: DatabaseManager;
    /**
     * Singleton instance of {@link DatabaseService}.
     * @internal
     */
    private databaseService?: DatabaseService;
    /**
     * Singleton instance of {@link HistoryRepository}.
     * @internal
     */
    private historyRepository?: HistoryRepository;
    /**
     * Singleton instance of {@link IpcService}.
     * @internal
     */
    private ipcService?: IpcService;
    /**
     * Singleton instance of {@link MonitorManager}.
     * @internal
     */
    private monitorManager?: MonitorManager;
    /**
     * Singleton instance of {@link MonitorRepository}.
     * @internal
     */
    private monitorRepository?: MonitorRepository;
    /**
     * Singleton instance of {@link NotificationService}.
     * @internal
     */
    private notificationService?: NotificationService;
    /**
     * Singleton instance of {@link SettingsRepository}.
     * @internal
     */
    private settingsRepository?: SettingsRepository;
    /**
     * Singleton instance of {@link SiteManager}.
     * @internal
     */
    private siteManager?: SiteManager;
    /**
     * Singleton instance of {@link SiteRepository}.
     * @internal
     */
    private siteRepository?: SiteRepository;
    /**
     * Singleton instance of {@link SiteService}.
     * @internal
     */
    private siteService?: SiteService;
    /**
     * Singleton instance of {@link UptimeOrchestrator}.
     * @internal
     */
    private uptimeOrchestrator?: UptimeOrchestrator;
    /**
     * Singleton instance of {@link WindowService}.
     * @internal
     */
    private windowService?: WindowService;

    /**
     * Constructs a new {@link ServiceContainer}.
     *
     * @remarks
     * Use {@link ServiceContainer.getInstance} to obtain the singleton instance.
     *
     * @param config - Optional configuration for service container behavior.
     */
    private constructor(config: ServiceContainerConfig = {}) {
        this.config = config;
        if (config.enableDebugLogging) {
            logger.debug("[ServiceContainer] Creating new service container");
        }
    }

    /**
     * Gets the singleton {@link ServiceContainer} instance.
     *
     * @remarks
     * If the instance does not exist, it is created with the provided configuration.
     *
     * @param config - Optional configuration for the container.
     * @returns The singleton {@link ServiceContainer} instance.
     */
    public static getInstance(config?: ServiceContainerConfig): ServiceContainer {
        ServiceContainer.instance ??= new ServiceContainer(config ?? {});
        return ServiceContainer.instance;
    }

    /**
     * Resets the singleton container for testing purposes.
     *
     * @remarks
     * Clears the singleton instance to allow clean test isolation.
     * Does not clean up existing service instances or close resources.
     * Call cleanup methods on services before reset if needed.
     *
     * @example
     * ```typescript
     * ServiceContainer.resetForTesting();
     * const container = ServiceContainer.getInstance({ enableDebugLogging: true });
     * ```
     *
     * @internal
     */
    public static resetForTesting(): void {
        ServiceContainer.instance = undefined;
    }

    /**
     * Gets the {@link AutoUpdaterService} singleton.
     *
     * @returns The {@link AutoUpdaterService} instance.
     */
    public getAutoUpdaterService(): AutoUpdaterService {
        if (!this.autoUpdaterService) {
            this.autoUpdaterService = new AutoUpdaterService();
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created AutoUpdaterService");
            }
        }
        return this.autoUpdaterService;
    }

    /**
     * Gets the {@link ConfigurationManager} singleton.
     *
     * @returns The {@link ConfigurationManager} instance.
     */
    public getConfigurationManager(): ConfigurationManager {
        if (!this.configurationManager) {
            this.configurationManager = new ConfigurationManager();
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created ConfigurationManager");
            }
        }
        return this.configurationManager;
    }

    /**
     * Gets the {@link DatabaseManager} singleton.
     *
     * @remarks
     * Instantiates with required repositories, configuration manager, and event bus.
     *
     * @returns The {@link DatabaseManager} instance.
     */
    public getDatabaseManager(): DatabaseManager {
        if (!this.databaseManager) {
            const databaseEventBus = new TypedEventBus<UptimeEvents>("DatabaseManagerEventBus");
            this.databaseManager = new DatabaseManager({
                configurationManager: this.getConfigurationManager(),
                eventEmitter: databaseEventBus,
                repositories: {
                    database: this.getDatabaseService(),
                    history: this.getHistoryRepository(),
                    monitor: this.getMonitorRepository(),
                    settings: this.getSettingsRepository(),
                    site: this.getSiteRepository(),
                },
            });
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created DatabaseManager with dependencies");
            }
        }
        return this.databaseManager;
    }

    /**
     * Gets the {@link DatabaseService} singleton.
     *
     * @returns The {@link DatabaseService} instance.
     */
    public getDatabaseService(): DatabaseService {
        this.databaseService ??= DatabaseService.getInstance();
        return this.databaseService;
    }

    /**
     * Gets the {@link HistoryRepository} singleton.
     *
     * @returns The {@link HistoryRepository} instance.
     */
    public getHistoryRepository(): HistoryRepository {
        if (!this.historyRepository) {
            this.historyRepository = new HistoryRepository({
                databaseService: this.getDatabaseService(),
            });
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created HistoryRepository");
            }
        }
        return this.historyRepository;
    }

    /**
     * Gets a summary of initialization status for all services.
     *
     * @remarks
     * Useful for debugging and diagnostics.
     *
     * @returns An object mapping service names to their initialization status.
     */
    public getInitializationStatus(): Record<string, boolean> {
        return {
            AutoUpdaterService: this.autoUpdaterService !== undefined,
            ConfigurationManager: this.configurationManager !== undefined,
            DatabaseManager: this.databaseManager !== undefined,
            DatabaseService: this.databaseService !== undefined,
            HistoryRepository: this.historyRepository !== undefined,
            IpcService: this.ipcService !== undefined,
            MonitorManager: this.monitorManager !== undefined,
            MonitorRepository: this.monitorRepository !== undefined,
            NotificationService: this.notificationService !== undefined,
            SettingsRepository: this.settingsRepository !== undefined,
            SiteManager: this.siteManager !== undefined,
            SiteRepository: this.siteRepository !== undefined,
            SiteService: this.siteService !== undefined,
            UptimeOrchestrator: this.uptimeOrchestrator !== undefined,
            WindowService: this.windowService !== undefined,
        };
    }

    /**
     * Gets all initialized services for shutdown and debugging.
     *
     * @remarks
     * Dynamically discovers all initialized services by inspecting private fields.
     * Only includes services that are actually initialized (not undefined).
     *
     * @returns Array of objects containing service names and their instances.
     */
    public getInitializedServices(): { name: string; service: unknown }[] {
        const services: { name: string; service: unknown }[] = [];
        const serviceMap: Record<string, unknown> = {
            AutoUpdaterService: this.autoUpdaterService,
            ConfigurationManager: this.configurationManager,
            DatabaseManager: this.databaseManager,
            DatabaseService: this.databaseService,
            HistoryRepository: this.historyRepository,
            IpcService: this.ipcService,
            MonitorManager: this.monitorManager,
            MonitorRepository: this.monitorRepository,
            NotificationService: this.notificationService,
            SettingsRepository: this.settingsRepository,
            SiteManager: this.siteManager,
            SiteRepository: this.siteRepository,
            SiteService: this.siteService,
            UptimeOrchestrator: this.uptimeOrchestrator,
            WindowService: this.windowService,
        };
        for (const [serviceName, serviceInstance] of Object.entries(serviceMap)) {
            if (serviceInstance !== undefined) {
                services.push({ name: serviceName, service: serviceInstance });
            }
        }
        return services;
    }

    /**
     * Gets the {@link IpcService} singleton.
     *
     * @remarks
     * Instantiates with dependencies on orchestrator and updater.
     *
     * @returns The {@link IpcService} instance.
     */
    public getIpcService(): IpcService {
        if (!this.ipcService) {
            const orchestrator = this.getUptimeOrchestrator();
            const updater = this.getAutoUpdaterService();
            this.ipcService = new IpcService(orchestrator, updater);
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created IpcService with dependencies");
            }
        }
        return this.ipcService;
    }

    /**
     * Gets the {@link MonitorManager} singleton.
     *
     * @remarks
     * Instantiates with repositories, event bus, and dependency injection.
     * Forwards important events to the main orchestrator.
     *
     * @returns The {@link MonitorManager} instance.
     * @throws Error if {@link SiteManager} is not initialized when required.
     */
    public getMonitorManager(): MonitorManager {
        if (!this.monitorManager) {
            const monitorEventBus = new TypedEventBus<UptimeEvents>("MonitorManagerEventBus");

            // Get sites cache function
            const getSitesCache = () => {
                if (!this.siteManager) {
                    throw new Error(
                        "Service dependency error: SiteManager not fully initialized. " +
                            "This usually indicates a circular dependency or incorrect initialization order. " +
                            "Ensure ServiceContainer.initialize() completes before accessing SiteManager functionality."
                    );
                }
                return this.siteManager.getSitesCache();
            };

            // Create enhanced monitoring services
            const enhancedServices = EnhancedMonitoringServiceFactory.create({
                eventEmitter: monitorEventBus,
                getHistoryLimit: () => this.getDatabaseManager().getHistoryLimit(),
                historyRepository: this.getHistoryRepository(),
                monitorRepository: this.getMonitorRepository(),
                siteRepository: this.getSiteRepository(),
                sites: getSitesCache(),
            });

            this.monitorManager = new MonitorManager(
                {
                    databaseService: this.getDatabaseService(),
                    eventEmitter: monitorEventBus,
                    getHistoryLimit: () => {
                        return this.getDatabaseManager().getHistoryLimit();
                    },
                    getSitesCache,
                    repositories: {
                        history: this.getHistoryRepository(),
                        monitor: this.getMonitorRepository(),
                        site: this.getSiteRepository(),
                    },
                    siteService: this.getSiteService(),
                },
                enhancedServices
            );
            this.setupEventForwarding(monitorEventBus, "MonitorManager");
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created MonitorManager with dependencies");
            }
        }
        return this.monitorManager;
    }

    /**
     * Gets the {@link MonitorRepository} singleton.
     *
     * @returns The {@link MonitorRepository} instance.
     */
    public getMonitorRepository(): MonitorRepository {
        if (!this.monitorRepository) {
            this.monitorRepository = new MonitorRepository({
                databaseService: this.getDatabaseService(),
            });
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created MonitorRepository");
            }
        }
        return this.monitorRepository;
    }

    /**
     * Gets the {@link NotificationService} singleton.
     *
     * @returns The {@link NotificationService} instance.
     */
    public getNotificationService(): NotificationService {
        if (!this.notificationService) {
            this.notificationService = new NotificationService(this.config.notificationConfig);
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created NotificationService");
            }
        }
        return this.notificationService;
    }

    /**
     * Gets the {@link SettingsRepository} singleton.
     *
     * @returns The {@link SettingsRepository} instance.
     */
    public getSettingsRepository(): SettingsRepository {
        if (!this.settingsRepository) {
            this.settingsRepository = new SettingsRepository({
                databaseService: this.getDatabaseService(),
            });
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created SettingsRepository");
            }
        }
        return this.settingsRepository;
    }

    /**
     * Gets the {@link SiteManager} singleton.
     *
     * @remarks
     * Instantiates with repositories, event bus, and monitoring operations.
     * Forwards important events to the main orchestrator.
     *
     * @returns The {@link SiteManager} instance.
     * @throws Error if setting the history limit fails.
     */
    public getSiteManager(): SiteManager {
        if (!this.siteManager) {
            const monitoringOperations: IMonitoringOperations = {
                /**
                 * Sets the history limit for monitor data retention.
                 *
                 * @remarks
                 * Delegates to {@link DatabaseManager.setHistoryLimit}.
                 *
                 * @param limit - Maximum number of history entries to retain.
                 * @returns Promise that resolves when the limit is set.
                 * @throws Error if setting the limit fails.
                 */
                setHistoryLimit: async (limit: number): Promise<void> => {
                    try {
                        const databaseManager = this.getDatabaseManager();
                        await databaseManager.setHistoryLimit(limit);
                        logger.debug(`[ServiceContainer] History limit set to ${limit} via DatabaseManager`);
                    } catch (error) {
                        logger.error("[ServiceContainer] Failed to set history limit", {
                            error: error instanceof Error ? error.message : String(error),
                            limit,
                        });
                        throw error;
                    }
                },
                /**
                 * Sets up new monitors for a site.
                 *
                 * @param site - The {@link Site} to set up monitors for.
                 * @param newMonitorIds - Array of monitor IDs to set up.
                 * @returns Promise that resolves when setup is complete.
                 */
                setupNewMonitors: async (site: Site, newMonitorIds: string[]): Promise<void> => {
                    const monitorManager = this.getMonitorManager();
                    return monitorManager.setupNewMonitors(site, newMonitorIds);
                },
                /**
                 * Starts monitoring for a site and monitor ID.
                 *
                 * @param identifier - The site identifier.
                 * @param monitorId - The monitor ID.
                 * @returns Promise resolving to true if monitoring started, false otherwise.
                 */
                startMonitoringForSite: async (identifier: string, monitorId: string): Promise<boolean> => {
                    const monitorManager = this.getMonitorManager();
                    return monitorManager.startMonitoringForSite(identifier, monitorId);
                },
                /**
                 * Stops monitoring for a site and monitor ID.
                 *
                 * @param identifier - The site identifier.
                 * @param monitorId - The monitor ID.
                 * @returns Promise resolving to true if monitoring stopped, false otherwise.
                 */
                stopMonitoringForSite: async (identifier: string, monitorId: string): Promise<boolean> => {
                    const monitorManager = this.getMonitorManager();
                    return monitorManager.stopMonitoringForSite(identifier, monitorId);
                },
            };
            const siteEventBus = new TypedEventBus<UptimeEvents>("SiteManagerEventBus");
            this.siteManager = new SiteManager({
                configurationManager: this.getConfigurationManager(),
                databaseService: this.getDatabaseService(),
                eventEmitter: siteEventBus,
                historyRepository: this.getHistoryRepository(),
                monitoringOperations,
                monitorRepository: this.getMonitorRepository(),
                settingsRepository: this.getSettingsRepository(),
                siteRepository: this.getSiteRepository(),
            });
            this.setupEventForwarding(siteEventBus, "SiteManager");
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created SiteManager with dependencies");
            }
        }
        return this.siteManager;
    }

    /**
     * Gets the {@link SiteRepository} singleton.
     *
     * @returns The {@link SiteRepository} instance.
     */
    public getSiteRepository(): SiteRepository {
        if (!this.siteRepository) {
            this.siteRepository = new SiteRepository({
                databaseService: this.getDatabaseService(),
            });
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created SiteRepository");
            }
        }
        return this.siteRepository;
    }

    /**
     * Gets the {@link SiteService} singleton.
     *
     * @returns The {@link SiteService} instance.
     */
    public getSiteService(): SiteService {
        if (!this.siteService) {
            this.siteService = new SiteService({
                databaseService: this.getDatabaseService(),
                historyRepository: this.getHistoryRepository(),
                monitorRepository: this.getMonitorRepository(),
                siteRepository: this.getSiteRepository(),
            });
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created SiteService");
            }
        }
        return this.siteService;
    }

    /**
     * Gets the {@link UptimeOrchestrator} singleton.
     *
     * @remarks
     * Instantiates with injected manager dependencies.
     *
     * @returns The {@link UptimeOrchestrator} instance.
     */
    public getUptimeOrchestrator(): UptimeOrchestrator {
        if (!this.uptimeOrchestrator) {
            this.uptimeOrchestrator = new UptimeOrchestrator({
                databaseManager: this.getDatabaseManager(),
                monitorManager: this.getMonitorManager(),
                siteManager: this.getSiteManager(),
            });
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created UptimeOrchestrator with injected dependencies");
            }
        }
        return this.uptimeOrchestrator;
    }

    /**
     * Gets the {@link WindowService} singleton.
     *
     * @returns The {@link WindowService} instance.
     */
    public getWindowService(): WindowService {
        if (!this.windowService) {
            this.windowService = new WindowService();
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created WindowService");
            }
        }
        return this.windowService;
    }

    /**
     * Initializes all services in the correct order.
     *
     * @remarks
     * Ensures all dependencies are resolved and services are ready for use.
     * Should be called once during application startup.
     *
     * @returns Promise that resolves when all services are initialized.
     */
    public async initialize(): Promise<void> {
        logger.info("[ServiceContainer] Initializing services");
        this.getDatabaseService().initialize();
        this.getHistoryRepository();
        this.getMonitorRepository();
        this.getSettingsRepository();
        this.getSiteRepository();
        this.getSiteService();
        this.getSiteManager();
        this.getMonitorManager();
        const databaseManager = this.getDatabaseManager();
        await databaseManager.initialize();
        this.getConfigurationManager();
        await this.getUptimeOrchestrator().initialize();
        this.getIpcService().setupHandlers();
        logger.info("[ServiceContainer] All services initialized successfully");
    }

    /**
     * Gets the main orchestrator if initialized.
     *
     * @remarks
     * Used internally for event forwarding.
     *
     * @returns The {@link UptimeOrchestrator} instance, or null if not initialized.
     * @internal
     */
    private getMainOrchestrator(): null | UptimeOrchestrator {
        return this.uptimeOrchestrator ?? null;
    }

    /**
     * Sets up event forwarding from a manager's event bus to the main orchestrator.
     *
     * @remarks
     * Ensures frontend status updates work properly while maintaining dependency isolation.
     *
     * @param managerEventBus - The {@link TypedEventBus} to forward events from.
     * @param managerName - The name of the manager for logging.
     */
    private setupEventForwarding(managerEventBus: TypedEventBus<UptimeEvents>, managerName: string): void {
        const eventsToForward = [
            "monitor:status-changed",
            "monitor:up",
            "monitor:down",
            "monitoring:started",
            "monitoring:stopped",
            "internal:monitor:started",
            "internal:monitor:stopped",
            "internal:monitor:manual-check-completed",
            "internal:monitor:site-setup-completed",
            "site:added",
            "site:updated",
            "site:removed",
            "internal:site:updated",
            "site:cache-updated",
            "internal:site:cache-updated",
            "sites:state-synchronized",
            "site:cache-miss",
            "system:error",
        ] as const;

        for (const eventType of eventsToForward) {
            managerEventBus.on(eventType, (data: unknown) => {
                const mainOrchestrator = this.getMainOrchestrator();
                if (mainOrchestrator) {
                    mainOrchestrator.emitTyped(eventType, data as UptimeEvents[typeof eventType]).catch((error) => {
                        logger.error(`[ServiceContainer] Error forwarding ${eventType} from ${managerName}:`, error);
                    });
                    if (this.config.enableDebugLogging) {
                        logger.debug(
                            `[ServiceContainer] Forwarded ${eventType} from ${managerName} to main orchestrator`
                        );
                    }
                }
            });
        }
        if (this.config.enableDebugLogging) {
            logger.debug(
                `[ServiceContainer] Set up event forwarding for ${managerName} (${eventsToForward.length} events)`
            );
        }
    }
}
