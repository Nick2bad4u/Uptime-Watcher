/**
 * Centralized dependency injection container for all Electron services.
 *
 * @remarks
 * Provides a unified way to manage service dependencies and lifecycle,
 * ensuring proper initialization order and singleton management where appropriate.
 *
 * Services are categorized by type:
 * - **Core Services**: Essential infrastructure (Database, IPC)
 * - **Application Services**: Business logic orchestrators
 * - **Feature Services**: Specific functionality (Monitoring, Notifications)
 * - **Utility Services**: Support functions (Window, Updater)
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
import { NotificationService } from "./notifications/NotificationService";
import { SiteService } from "./site/SiteService";
import { AutoUpdaterService } from "./updater/AutoUpdaterService";
import { WindowService } from "./window/WindowService";

/**
 * Service container configuration interface.
 */
export interface ServiceContainerConfig {
    /** Enable debug logging for service initialization */
    enableDebugLogging?: boolean;
    /** Custom notification service configuration */
    notificationConfig?: {
        showDownAlerts: boolean;
        showUpAlerts: boolean;
    };
}

/**
 * Centralized service container for dependency management.
 */
export class ServiceContainer {
    private static instance: ServiceContainer | undefined = undefined;

    private _autoUpdaterService?: AutoUpdaterService;

    // Manager Services (Business Layer)
    private _configurationManager?: ConfigurationManager;

    private _databaseManager?: DatabaseManager;

    // Core Services (Infrastructure)
    private _databaseService?: DatabaseService;

    // Repository Services (Data Layer)
    private _historyRepository?: HistoryRepository;

    private _ipcService?: IpcService;

    private _monitorManager?: MonitorManager;
    private _monitorRepository?: MonitorRepository;
    private _notificationService?: NotificationService;
    private _settingsRepository?: SettingsRepository;

    private _siteManager?: SiteManager;
    private _siteRepository?: SiteRepository;
    private _siteService?: SiteService;
    // Application Services (Business Logic)
    private _uptimeOrchestrator?: UptimeOrchestrator;
    // Utility Services
    private _windowService?: WindowService;

    private readonly config: ServiceContainerConfig;

    private constructor(config: ServiceContainerConfig = {}) {
        this.config = config;
        if (config.enableDebugLogging) {
            logger.debug("[ServiceContainer] Creating new service container");
        }
    }

    /**
     * Get the singleton service container instance.
     */
    public static getInstance(config?: ServiceContainerConfig): ServiceContainer {
        ServiceContainer.instance ??= new ServiceContainer(config ?? {});
        return ServiceContainer.instance;
    }

    /**
     * Reset container for testing purposes.
     */
    public static resetForTesting(): void {
        ServiceContainer.instance = undefined;
    }

    public getAutoUpdaterService(): AutoUpdaterService {
        if (!this._autoUpdaterService) {
            this._autoUpdaterService = new AutoUpdaterService();
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created AutoUpdaterService");
            }
        }
        return this._autoUpdaterService;
    }

    // Manager Services (Business Layer)
    public getConfigurationManager(): ConfigurationManager {
        if (!this._configurationManager) {
            this._configurationManager = new ConfigurationManager();
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created ConfigurationManager");
            }
        }
        return this._configurationManager;
    }

    public getDatabaseManager(): DatabaseManager {
        if (!this._databaseManager) {
            // Create a separate event bus for DatabaseManager to avoid circular dependency
            const databaseEventBus = new TypedEventBus<UptimeEvents>("DatabaseManagerEventBus");

            // DatabaseManager requires repositories and event bus
            this._databaseManager = new DatabaseManager({
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
        return this._databaseManager;
    }

    // Core Services
    public getDatabaseService(): DatabaseService {
        this._databaseService ??= DatabaseService.getInstance();
        return this._databaseService;
    }

    // Repository Services (Data Layer)
    public getHistoryRepository(): HistoryRepository {
        if (!this._historyRepository) {
            this._historyRepository = new HistoryRepository({
                databaseService: this.getDatabaseService(),
            });
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created HistoryRepository");
            }
        }
        return this._historyRepository;
    }

    /**
     * Get all initialized services for shutdown.
     */
    public getInitializedServices(): { name: string; service: unknown }[] {
        const services: { name: string; service: unknown }[] = [];

        if (this._databaseService) services.push({ name: "DatabaseService", service: this._databaseService });
        if (this._windowService) services.push({ name: "WindowService", service: this._windowService });
        if (this._autoUpdaterService) {
            services.push({ name: "AutoUpdaterService", service: this._autoUpdaterService });
        }
        if (this._notificationService) {
            services.push({ name: "NotificationService", service: this._notificationService });
        }
        if (this._uptimeOrchestrator) services.push({ name: "UptimeOrchestrator", service: this._uptimeOrchestrator });
        if (this._ipcService) services.push({ name: "IpcService", service: this._ipcService });
        if (this._siteManager) services.push({ name: "SiteManager", service: this._siteManager });
        if (this._monitorManager) services.push({ name: "MonitorManager", service: this._monitorManager });
        if (this._databaseManager) services.push({ name: "DatabaseManager", service: this._databaseManager });
        if (this._configurationManager)
            services.push({ name: "ConfigurationManager", service: this._configurationManager });

        return services;
    }

    public getIpcService(): IpcService {
        if (!this._ipcService) {
            // IPC service depends on orchestrator and updater
            const orchestrator = this.getUptimeOrchestrator();
            const updater = this.getAutoUpdaterService();

            this._ipcService = new IpcService(orchestrator, updater);
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created IpcService with dependencies");
            }
        }
        return this._ipcService;
    }

    public getMonitorManager(): MonitorManager {
        if (!this._monitorManager) {
            // Create a separate event bus for MonitorManager to avoid circular dependency
            const monitorEventBus = new TypedEventBus<UptimeEvents>("MonitorManagerEventBus");

            // MonitorManager requires repositories and event bus
            this._monitorManager = new MonitorManager({
                databaseService: this.getDatabaseService(),
                eventEmitter: monitorEventBus,
                getHistoryLimit: () => {
                    // Get actual history limit from DatabaseManager instead of hardcoded value
                    return this.getDatabaseManager().getHistoryLimit();
                },
                getSitesCache: () => {
                    // Direct access to avoid circular dependency - SiteManager should be created before MonitorManager
                    if (!this._siteManager) {
                        throw new Error("SiteManager must be initialized before MonitorManager");
                    }
                    return this._siteManager.getSitesCache();
                },
                repositories: {
                    history: this.getHistoryRepository(),
                    monitor: this.getMonitorRepository(),
                    site: this.getSiteRepository(),
                },
                siteService: this.getSiteService(),
            });

            // Forward important events from MonitorManager to main orchestrator for frontend
            this.setupEventForwarding(monitorEventBus, "MonitorManager");

            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created MonitorManager with dependencies");
            }
        }
        return this._monitorManager;
    }

    public getMonitorRepository(): MonitorRepository {
        if (!this._monitorRepository) {
            this._monitorRepository = new MonitorRepository({
                databaseService: this.getDatabaseService(),
            });
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created MonitorRepository");
            }
        }
        return this._monitorRepository;
    }

    public getNotificationService(): NotificationService {
        if (!this._notificationService) {
            this._notificationService = new NotificationService(this.config.notificationConfig);
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created NotificationService");
            }
        }
        return this._notificationService;
    }

    public getSettingsRepository(): SettingsRepository {
        if (!this._settingsRepository) {
            this._settingsRepository = new SettingsRepository({
                databaseService: this.getDatabaseService(),
            });
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created SettingsRepository");
            }
        }
        return this._settingsRepository;
    }

    public getSiteManager(): SiteManager {
        if (!this._siteManager) {
            // Create monitoring operations interface that will be passed to SiteManager
            const monitoringOperations: IMonitoringOperations = {
                setHistoryLimit: (limit: number): Promise<void> => {
                    // This could be implemented if needed
                    logger.debug(`[ServiceContainer] setHistoryLimit called with ${limit}`);
                    return Promise.resolve();
                },
                setupNewMonitors: async (site: Site, newMonitorIds: string[]): Promise<void> => {
                    const monitorManager = this.getMonitorManager();
                    return monitorManager.setupNewMonitors(site, newMonitorIds);
                },
                startMonitoringForSite: async (identifier: string, monitorId: string): Promise<boolean> => {
                    const monitorManager = this.getMonitorManager();
                    return monitorManager.startMonitoringForSite(identifier, monitorId);
                },
                stopMonitoringForSite: async (identifier: string, monitorId: string): Promise<boolean> => {
                    const monitorManager = this.getMonitorManager();
                    return monitorManager.stopMonitoringForSite(identifier, monitorId);
                },
            };

            // SiteManager requires repositories and event bus
            // Create a separate event bus for SiteManager to avoid circular dependency
            const siteEventBus = new TypedEventBus<UptimeEvents>("SiteManagerEventBus");

            this._siteManager = new SiteManager({
                configurationManager: this.getConfigurationManager(),
                databaseService: this.getDatabaseService(),
                eventEmitter: siteEventBus,
                historyRepository: this.getHistoryRepository(),
                monitoringOperations,
                monitorRepository: this.getMonitorRepository(),
                settingsRepository: this.getSettingsRepository(),
                siteRepository: this.getSiteRepository(),
            });
            // Forward important events from SiteManager to main orchestrator for frontend
            this.setupEventForwarding(siteEventBus, "SiteManager");

            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created SiteManager with dependencies");
            }
        }
        return this._siteManager;
    }

    public getSiteRepository(): SiteRepository {
        if (!this._siteRepository) {
            this._siteRepository = new SiteRepository({
                databaseService: this.getDatabaseService(),
            });
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created SiteRepository");
            }
        }
        return this._siteRepository;
    }

    public getSiteService(): SiteService {
        if (!this._siteService) {
            this._siteService = new SiteService({
                databaseService: this.getDatabaseService(),
                historyRepository: this.getHistoryRepository(),
                monitorRepository: this.getMonitorRepository(),
                siteRepository: this.getSiteRepository(),
            });
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created SiteService");
            }
        }
        return this._siteService;
    }

    // Application Services
    public getUptimeOrchestrator(): UptimeOrchestrator {
        if (!this._uptimeOrchestrator) {
            // Create UptimeOrchestrator with injected manager dependencies
            this._uptimeOrchestrator = new UptimeOrchestrator({
                databaseManager: this.getDatabaseManager(),
                monitorManager: this.getMonitorManager(),
                siteManager: this.getSiteManager(),
            });
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created UptimeOrchestrator with injected dependencies");
            }
        }
        return this._uptimeOrchestrator;
    }

    // Utility Services
    public getWindowService(): WindowService {
        if (!this._windowService) {
            this._windowService = new WindowService();
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created WindowService");
            }
        }
        return this._windowService;
    }

    /**
     * Initialize all services in the correct order.
     */
    public async initialize(): Promise<void> {
        logger.info("[ServiceContainer] Initializing services");

        // Initialize core services first
        this.getDatabaseService().initialize();

        // Initialize repositories
        this.getHistoryRepository();
        this.getMonitorRepository();
        this.getSettingsRepository();
        this.getSiteRepository();

        // Initialize services
        this.getSiteService();

        // Initialize managers - order matters for circular dependencies
        this.getSiteManager();
        this.getMonitorManager();

        // Initialize DatabaseManager with proper settings loading
        const databaseManager = this.getDatabaseManager();
        await databaseManager.initialize();

        this.getConfigurationManager();

        // Initialize application services
        await this.getUptimeOrchestrator().initialize();

        // Initialize IPC (depends on orchestrator)
        this.getIpcService().setupHandlers();

        logger.info("[ServiceContainer] All services initialized successfully");
    }

    /**
     * Get the main orchestrator (but only when it's actually being used, not during creation)
     */
    private getMainOrchestrator(): null | UptimeOrchestrator {
        return this._uptimeOrchestrator ?? null;
    }

    /**
     * Setup event forwarding from manager event buses to the main orchestrator.
     * This ensures frontend status updates work properly while maintaining dependency isolation.
     */
    private setupEventForwarding(managerEventBus: TypedEventBus<UptimeEvents>, managerName: string): void {
        // List of events that should be forwarded to the frontend
        const eventsToForward = [
            // Monitor status events
            "monitor:status-changed",
            "monitor:up",
            "monitor:down",

            // Monitor lifecycle events
            "monitoring:started",
            "monitoring:stopped",
            "internal:monitor:started",
            "internal:monitor:stopped",
            "internal:monitor:manual-check-completed",
            "internal:monitor:site-setup-completed",

            // Site lifecycle events
            "site:added",
            "site:updated",
            "site:removed",
            "internal:site:updated",
            "site:cache-updated",
            "internal:site:cache-updated",

            // System events
            "sites:state-synchronized",
            "site:cache-miss",
            "system:error",
        ] as const;

        // Set up forwarding for each important event
        for (const eventType of eventsToForward) {
            managerEventBus.on(eventType, (data: unknown) => {
                const mainOrchestrator = this.getMainOrchestrator();
                if (mainOrchestrator) {
                    // Forward the event to the main orchestrator so frontend can receive it
                    // Use unknown type to let the event system handle validation
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
