/**
 * Centralized dependency injection container for all Electron services.
 *
 * Services are categorized as:
 *
 * - Core Services: Infrastructure (Database, IPC)
 * - Application Services: Business logic orchestrators
 * - Feature Services: Specific functionality (Monitoring, Notifications)
 * - Utility Services: Support functions (Window, Updater)
 *
 * @public
 */
import type { UnknownRecord } from "type-fest";

import type { UptimeEvents } from "../events/eventTypes";

import { TypedEventBus } from "../events/TypedEventBus";
import { ConfigurationManager } from "../managers/ConfigurationManager";
import { DatabaseManager } from "../managers/DatabaseManager";
import { MonitorManager } from "../managers/MonitorManager";
import { SiteManager } from "../managers/SiteManager";
import { UptimeOrchestrator } from "../UptimeOrchestrator";
import { runIdempotentInitialization } from "../utils/idempotentInitialization";
import { logger } from "../utils/logger";
import { CloudService } from "./cloud/CloudService";
import { CloudSyncScheduler } from "./cloud/CloudSyncScheduler";
import { DatabaseService } from "./database/DatabaseService";
import { HistoryRepository } from "./database/HistoryRepository";
import { MonitorRepository } from "./database/MonitorRepository";
import { SettingsRepository } from "./database/SettingsRepository";
import { SiteRepository } from "./database/SiteRepository";
import { RendererEventBridge } from "./events/RendererEventBridge";
import { IpcService } from "./ipc/IpcService";
import { EnhancedMonitoringServiceFactory } from "./monitoring/EnhancedMonitoringServiceFactory";
import { MonitorOperationRegistry } from "./monitoring/MonitorOperationRegistry";
import { NotificationService } from "./notifications/NotificationService";
import { createMonitoringOperations } from "./ServiceContainer.monitoringOperations";
import { createSitesCacheGetter } from "./ServiceContainer.siteCacheAccessor";
import { hasInitializeMethod, isPromiseLike } from "./ServiceContainer.utils";
import { ServiceContainerEventForwarder } from "./ServiceContainerEventForwarder";
import { SyncEngine } from "./sync/SyncEngine";
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
     * When enabled, logs detailed information about service creation,
     * dependency injection, initialization order, timing, manager setup, event
     * forwarding, and error contexts.
     *
     * @defaultValue false
     */
    enableDebugLogging?: boolean;

    /**
     * Custom notification service configuration.
     *
     * @remarks
     * Controls system notification behavior for monitor status changes. Can be
     * modified at runtime via {@link NotificationService.updateConfig}.
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
 * Information about an initialized service.
 *
 * @remarks
 * Contains metadata about a service instance, including its name and the actual
 * service object. Used for service introspection and debugging.
 *
 * @public
 */
export interface ServiceInfo {
    /**
     * The name of the service.
     *
     * @remarks
     * Human-readable service name used for identification and debugging.
     * Corresponds to the service class name (e.g., "DatabaseService").
     */
    name: string;

    /**
     * The service instance.
     *
     * @remarks
     * The actual instantiated service object. Type is unknown to support all
     * service types in the container.
     */
    service: unknown;
}

/**
 * Centralized service container for dependency management and lifecycle
 * orchestration.
 *
 * @remarks
 * Provides singleton access to all core, application, feature, and utility
 * services. Ensures correct initialization order and dependency injection.
 *
 * @public
 */
export class ServiceContainer {
    /**
     * Singleton instance of the ServiceContainer.
     *
     * @remarks
     * Maintains the single instance of the ServiceContainer across the
     * application lifecycle. Initialized via getInstance() method and ensures
     * all services are managed through a single container.
     *
     * @internal
     */
    private static instance: ServiceContainer | undefined;

    /**
     * Singleton instance of {@link AutoUpdaterService}.
     *
     * @internal
     */
    private autoUpdaterService?: AutoUpdaterService;

    /**
     * Configuration settings for the service container.
     *
     * @remarks
     * Contains runtime configuration options including debug logging settings
     * and notification service preferences. Set during initialization and used
     * throughout the service container lifecycle.
     *
     * @internal
     */
    private readonly config: ServiceContainerConfig;

    /** Forwards manager event bus emissions into the orchestrator bus. */
    private readonly eventForwarder: ServiceContainerEventForwarder;

    /**
     * Singleton instance of {@link ConfigurationManager}.
     *
     * @internal
     */
    private configurationManager?: ConfigurationManager;

    /**
     * Singleton instance of {@link DatabaseManager}.
     *
     * @internal
     */
    private databaseManager?: DatabaseManager;

    /**
     * Singleton instance of {@link DatabaseService}.
     *
     * @internal
     */
    private databaseService?: DatabaseService;

    /**
     * Singleton instance of {@link HistoryRepository}.
     *
     * @internal
     */
    private historyRepository?: HistoryRepository;

    /**
     * Singleton instance of {@link IpcService}.
     *
     * @internal
     */
    private ipcService?: IpcService;

    /**
     * Singleton instance of {@link MonitorManager}.
     *
     * @internal
     */
    private monitorManager?: MonitorManager;

     /**
    * Singleton instance of {@link MonitorOperationRegistry}.
      *
      * @internal
      */
    private monitorOperationRegistry?: MonitorOperationRegistry;

    /**
     * Singleton instance of {@link MonitorRepository}.
     *
     * @internal
     */
    private monitorRepository?: MonitorRepository;

    /**
     * Singleton instance of {@link NotificationService}.
     *
     * @internal
     */
    private notificationService?: NotificationService;

    /** Renderer event bridge singleton. */
    private rendererEventBridge?: RendererEventBridge;

    /** Cloud backup/sync service singleton. */
    private cloudService?: CloudService;

    private cloudSyncScheduler?: CloudSyncScheduler;

    private syncEngine?: SyncEngine;

    /**
     * Singleton instance of {@link SettingsRepository}.
     *
     * @internal
     */
    private settingsRepository?: SettingsRepository;

    /**
    * Singleton instance of {@link SiteManager}.
     *
     * @internal
     */
    private siteManager?: SiteManager;

    /**
     * Singleton instance of {@link SiteRepository}.
     *
     * @internal
     */
    private siteRepository?: SiteRepository;

    /**
    * Singleton instance of {@link UptimeOrchestrator}.
     *
     * @internal
     */
    private uptimeOrchestrator?: UptimeOrchestrator;

    /**
     * Cached initialization promise for idempotent startup.
     *
     * @remarks
     * `initialize()` may be called multiple times (e.g., tests or re-entrant
     * app bootstrap). We treat initialization as idempotent and re-use the same
     * in-flight promise.
     */
    private initializationPromise: Promise<void> | undefined;

    /**
     * Singleton instance of {@link WindowService}.
     *
     * @internal
     */
    private windowService?: WindowService;

    public static getInstance(
        config?: ServiceContainerConfig
    ): ServiceContainer {
        ServiceContainer.instance ??= new ServiceContainer(config ?? {});
        return ServiceContainer.instance;
    }

    /**
     * Retrieves the existing service container instance without creating a new one.
     *
     * @remarks
     * Prefer this in code paths that must not create services implicitly.
     *
     * @returns The existing instance, or `undefined` if not initialized.
     */
    public static getExisting(): ServiceContainer | undefined {
        return ServiceContainer.instance;
    }

    /**
     * Reset the singleton instance (tests only).
     */
    public static resetForTesting(): void {
        ServiceContainer.instance = undefined;
    }

    /**
     * Initializes all core services and orchestrators in dependency order.
     */
    public async initialize(): Promise<void> {
        await runIdempotentInitialization(
            () => this.initializationPromise,
            (promise) => {
                this.initializationPromise = promise;
            },
            async () => {
                logger.info("[ServiceContainer] Initializing services");
                this.getDatabaseService().initialize();
                await this.tryInitializeService(
                    this.getConfigurationManager(),
                    "ConfigurationManager"
                );
                this.getHistoryRepository();
                this.getMonitorRepository();
                this.getSettingsRepository();
                this.getSiteRepository();

                // UptimeOrchestrator is responsible for initializing the stateful
                // managers it coordinates (DatabaseManager/SiteManager/etc.).
                await this.getUptimeOrchestrator().initialize();
                this.getIpcService().setupHandlers();

                // Start background cloud sync polling after IPC is ready.
                await this.tryInitializeService(
                    this.getCloudSyncScheduler(),
                    "CloudSyncScheduler"
                );

                logger.info(
                    "[ServiceContainer] All services initialized successfully"
                );
            }
        );
    }

    /**
     * Attempts to call an optional `initialize` method on a service instance.
     *
     * @param service - Service instance that may expose an initialize method.
     * @param serviceName - Human-readable name for diagnostics while debug
     *   logging is enabled.
     */
    private async tryInitializeService(
        service: unknown,
        serviceName: string
    ): Promise<void> {
        if (hasInitializeMethod(service)) {
            const initializationResult = service.initialize();
            if (isPromiseLike(initializationResult)) {
                await initializationResult;
            }
            return;
        }

        if (this.config.enableDebugLogging) {
            logger.debug(
                "[ServiceContainer] Service '%s' does not define an initializer.",
                serviceName
            );
        }
    }

    /** Gets the {@link CloudSyncScheduler} singleton. */
    public getCloudSyncScheduler(): CloudSyncScheduler {
        if (!this.cloudSyncScheduler) {
            this.cloudSyncScheduler = new CloudSyncScheduler({
                cloudService: this.getCloudService(),
            });
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created CloudSyncScheduler");
            }
        }

        return this.cloudSyncScheduler;
    }

        /**
         * Gets or creates the {@link MonitorOperationRegistry} singleton instance.
         *
         * @remarks
         * Lazily initializes the registry if it does not exist. Debug logging tracks
         * creation when enabled.
         *
         * @returns The singleton {@link MonitorOperationRegistry} instance.
         */
    private getMonitorOperationRegistry(): MonitorOperationRegistry {
        if (!this.monitorOperationRegistry) {
            this.monitorOperationRegistry = new MonitorOperationRegistry();
            if (this.config.enableDebugLogging) {
                logger.debug(
                    "[ServiceContainer] Created MonitorOperationRegistry"
                );
            }
        }
        return this.monitorOperationRegistry;
    }

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

        this.eventForwarder = new ServiceContainerEventForwarder({
            enableDebugLogging: this.config.enableDebugLogging === true,
            getMainOrchestrator: (): null | UptimeOrchestrator =>
                this.getMainOrchestrator(),
        });

        if (config.enableDebugLogging) {
            logger.debug("[ServiceContainer] Creating new service container");
        }
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
     * Instantiates with required repositories, configuration manager, and event
     * bus.
     *
     * @returns The {@link DatabaseManager} instance.
     */
    public getDatabaseManager(): DatabaseManager {
        if (!this.databaseManager) {
            const databaseEventBus = new TypedEventBus<UptimeEvents>(
                "DatabaseManagerEventBus"
            );
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
            this.eventForwarder.setupEventForwarding(
                databaseEventBus,
                "DatabaseManager"
            );
            if (this.config.enableDebugLogging) {
                logger.debug(
                    "[ServiceContainer] Created DatabaseManager with dependencies"
                );
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
            CloudService: this.cloudService !== undefined,
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
            UptimeOrchestrator: this.uptimeOrchestrator !== undefined,
            WindowService: this.windowService !== undefined,
        };
    }

    /**
     * Gets all initialized services for shutdown and debugging.
     *
     * @remarks
     * Dynamically discovers all initialized services by inspecting private
     * fields. Only includes services that are actually initialized (not
     * undefined).
     *
     * @returns Array of objects containing service names and their instances.
     */
    public getInitializedServices(): ServiceInfo[] {
        const services: ServiceInfo[] = [];
        const serviceMap: UnknownRecord = {
            AutoUpdaterService: this.autoUpdaterService,
            CloudService: this.cloudService,
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
            UptimeOrchestrator: this.uptimeOrchestrator,
            WindowService: this.windowService,
        };
        for (const [serviceName, serviceInstance] of Object.entries(
            serviceMap
        )) {
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
            const notificationService = this.getNotificationService();
            const cloudService = this.getCloudService();
            this.ipcService = new IpcService(
                orchestrator,
                updater,
                notificationService,
                cloudService
            );
            if (this.config.enableDebugLogging) {
                logger.debug(
                    "[ServiceContainer] Created IpcService with dependencies"
                );
            }
        }
        return this.ipcService;
    }

    /**
     * Gets the {@link CloudService} singleton.
     */
    public getCloudService(): CloudService {
        if (!this.cloudService) {
            this.cloudService = new CloudService({
                orchestrator: this.getUptimeOrchestrator(),
                settings: this.getSettingsRepository(),
                syncEngine: this.getSyncEngine(),
            });

            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created CloudService");
            }
        }

        return this.cloudService;
    }

    /**
    * Gets the {@link SyncEngine} singleton.
     */
    public getSyncEngine(): SyncEngine {
        if (!this.syncEngine) {
            this.syncEngine = new SyncEngine({
                orchestrator: this.getUptimeOrchestrator(),
                settings: this.getSettingsRepository(),
            });

            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created SyncEngine");
            }
        }

        return this.syncEngine;
    }

    /**
    * Gets the {@link MonitorManager} singleton.
     *
     * @remarks
     * Instantiates with repositories, event bus, and dependency injection.
     * Forwards important events to the main orchestrator.
     *
    * @returns The {@link MonitorManager} instance.
     *
    * @throws Error if {@link SiteManager} is not initialized when required.
     */
    public getMonitorManager(): MonitorManager {
        if (!this.monitorManager) {
            // Ensure SiteManager is created first to avoid dependency issues
            this.getSiteManager();

            const monitorEventBus = new TypedEventBus<UptimeEvents>(
                "MonitorManagerEventBus"
            );

            const getSitesCache = createSitesCacheGetter({
                getSiteManager: () => this.siteManager,
            });

            // Create enhanced monitoring services
            const enhancedServices =
                EnhancedMonitoringServiceFactory.createServices({
                    eventEmitter: monitorEventBus,
                    getHistoryLimit: () =>
                        this.getDatabaseManager().getHistoryLimit(),
                    historyRepository: this.getHistoryRepository(),
                    monitorRepository: this.getMonitorRepository(),
                    operationRegistry: this.getMonitorOperationRegistry(),
                    siteRepository: this.getSiteRepository(),
                    sites: getSitesCache(),
                });

            this.monitorManager = new MonitorManager(
                {
                    databaseService: this.getDatabaseService(),
                    eventEmitter: monitorEventBus,
                    getHistoryLimit: (): number =>
                        this.getDatabaseManager().getHistoryLimit(),
                    getSitesCache,
                    repositories: {
                        history: this.getHistoryRepository(),
                        monitor: this.getMonitorRepository(),
                        site: this.getSiteRepository(),
                    },
                },
                enhancedServices
            );
            this.eventForwarder.setupEventForwarding(
                monitorEventBus,
                "MonitorManager"
            );
            if (this.config.enableDebugLogging) {
                logger.debug(
                    "[ServiceContainer] Created MonitorManager with dependencies"
                );
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
            this.notificationService = new NotificationService(
                this.getUptimeOrchestrator()
            );
            if (this.config.notificationConfig) {
                this.notificationService.updateConfig(
                    this.config.notificationConfig
                );
            }
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
     *
     * @throws Error if setting the history limit fails.
     */
    public getSiteManager(): SiteManager {
        if (!this.siteManager) {
            const monitoringOperations = createMonitoringOperations({
                enableDebugLogging: this.config.enableDebugLogging === true,
                getDatabaseManager: () => this.getDatabaseManager(),
                getMonitorManager: () => this.getMonitorManager(),
            });
            const siteEventBus = new TypedEventBus<UptimeEvents>(
                "SiteManagerEventBus"
            );
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
            this.eventForwarder.setupEventForwarding(
                siteEventBus,
                "SiteManager"
            );
            if (this.config.enableDebugLogging) {
                logger.debug(
                    "[ServiceContainer] Created SiteManager with dependencies"
                );
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
                logger.debug(
                    "[ServiceContainer] Created UptimeOrchestrator with injected dependencies"
                );
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
     * Gets the {@link RendererEventBridge} singleton.
     */
    public getRendererEventBridge(): RendererEventBridge {
        if (!this.rendererEventBridge) {
            this.rendererEventBridge = new RendererEventBridge(
                this.getWindowService()
            );
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created RendererEventBridge");
            }
        }
        return this.rendererEventBridge;
    }

    /**
     * Gets the main orchestrator if initialized.
     *
     * @remarks
     * Retained for the ServiceContainer test suite.
     *
     * @internal
     */

    private getMainOrchestrator(): null | UptimeOrchestrator {
        return this.uptimeOrchestrator ?? null;
    }
}
