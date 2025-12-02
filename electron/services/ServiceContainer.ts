/**
 * Centralized dependency injection container for all Electron services.
 *
 * @remarks
 * Provides a unified mechanism for managing service dependencies and their
 * lifecycle, ensuring correct initialization order and singleton management.
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
import type { Site } from "@shared/types";
import type { EventMetadata } from "@shared/types/events";
import type { UnknownRecord } from "type-fest";

import { ensureError } from "@shared/utils/errorHandling";

import type { UptimeEventName, UptimeEvents } from "../events/eventTypes";
import type { EnhancedEventPayload, EventKey } from "../events/TypedEventBus";
import type { IMonitoringOperations } from "../managers/SiteManager";
import type { StandardizedCache } from "../utils/cache/StandardizedCache";

import {
    ORIGINAL_METADATA_SYMBOL,
    TypedEventBus,
} from "../events/TypedEventBus";
import { ConfigurationManager } from "../managers/ConfigurationManager";
import { DatabaseManager } from "../managers/DatabaseManager";
import { MonitorManager } from "../managers/MonitorManager";
import { SiteManager } from "../managers/SiteManager";
import { UptimeOrchestrator } from "../UptimeOrchestrator";
import {
    FORWARDED_METADATA_PROPERTY_KEY,
    ORIGINAL_METADATA_PROPERTY_KEY,
} from "../utils/eventMetadataForwarding";
import { logger } from "../utils/logger";
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
import { AutoUpdaterService } from "./updater/AutoUpdaterService";
import { WindowService } from "./window/WindowService";

/**
 * Represents a service that optionally exposes an {@link initialize} method.
 */
interface PossiblyInitializableService {
    /** Optional initializer invoked during container bootstrap. */
    initialize?: (() => Promise<void>) | (() => unknown);
}

/**
 * Type guard that determines if a service exposes an {@link initialize} method.
 *
 * @param value - Potential service instance to inspect.
 *
 * @returns True when the service defines an {@link initialize} method that can
 *   be invoked safely.
 */
function hasInitializeMethod(
    value: unknown
): value is PossiblyInitializableService & {
    initialize: () => unknown;
} {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const candidate = value as PossiblyInitializableService;
    return typeof candidate.initialize === "function";
}

/**
 * Supported payload formats for manager events forwarded to the orchestrator.
 *
 * @remarks
 * Manager event buses attach metadata to payloads via {@link EventMetadata}. The
 * orchestrator should receive the original payload shape without
 * EventEmitter-specific metadata. This helper type captures both
 * representations so forwarding helpers can normalize payloads safely while
 * preserving type safety.
 */
type ForwardablePayloadBase<EventName extends EventKey<UptimeEvents>> = Omit<
    UptimeEvents[EventName],
    "_meta" | "_originalMeta"
>;

type ForwardableEventPayload<EventName extends EventKey<UptimeEvents>> =
    ForwardablePayloadBase<EventName> & {
        _meta?: EventMetadata;
        _originalMeta?: EventMetadata;
    };

type ForwardablePayloadWithMeta<EventName extends EventKey<UptimeEvents>> =
    ForwardablePayloadBase<EventName> & {
        _meta: EventMetadata;
        _originalMeta?: EventMetadata;
    };

const toForwardablePayload = <EventName extends EventKey<UptimeEvents>>(
    payload: EnhancedEventPayload<UptimeEvents[EventName]>
): ForwardableEventPayload<EventName> => payload;

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
    if (
        (typeof value !== "object" && typeof value !== "function") ||
        value === null
    ) {
        return false;
    }

    const { then } = value as { then?: unknown };
    return typeof then === "function";
}

function isNonNullObject(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null;
}

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
     * Retrieves the existing service container instance without creating a new
     * one.
     */
    public static getExistingInstance(): ServiceContainer | undefined {
        return ServiceContainer.instance;
    }

    /**
     * Resets the singleton instance for test isolation.
     */
    public static resetForTesting(): void {
        ServiceContainer.instance = undefined;
    }

    /**
     * Initializes all core services and orchestrators in dependency order.
     */
    public async initialize(): Promise<void> {
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
        await this.getDatabaseManager().initialize();
        await this.tryInitializeService(this.getSiteManager(), "SiteManager");
        await this.tryInitializeService(
            this.getMonitorManager(),
            "MonitorManager"
        );
        await this.getUptimeOrchestrator().initialize();
        this.getIpcService().setupHandlers();
        logger.info("[ServiceContainer] All services initialized successfully");
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

    /**
     * Gets or creates the {@link MonitorOperationRegistry} singleton instance.
     *
     * @remarks
     * Lazily initializes the registry if it does not exist. Debug logging
     * tracks creation when enabled.
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
            this.setupEventForwarding(databaseEventBus, "DatabaseManager");
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
            this.ipcService = new IpcService(
                orchestrator,
                updater,
                notificationService
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

            // Get sites cache function
            const getSitesCache = (): StandardizedCache<Site> => {
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
            this.setupEventForwarding(monitorEventBus, "MonitorManager");
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
                this.config.notificationConfig
                    ? { config: this.config.notificationConfig }
                    : {}
            );
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
            const monitoringOperations: IMonitoringOperations = {
                /**
                 * Sets the history limit for monitor data retention.
                 *
                 * @remarks
                 * Delegates to {@link DatabaseManager.setHistoryLimit}.
                 *
                 * @param limit - Maximum number of history entries to retain.
                 *
                 * @returns Promise that resolves when the limit is set.
                 *
                 * @throws Error if setting the limit fails.
                 */
                setHistoryLimit: async (limit: number): Promise<void> => {
                    try {
                        const databaseManager = this.getDatabaseManager();
                        await databaseManager.setHistoryLimit(limit);
                        logger.debug(
                            `[ServiceContainer] History limit set to ${limit} via DatabaseManager`
                        );
                    } catch (error) {
                        logger.error(
                            "[ServiceContainer] Failed to set history limit",
                            {
                                error:
                                    error instanceof Error
                                        ? error.message
                                        : String(error),
                                limit,
                            }
                        );
                        throw error;
                    }
                },
                /**
                 * Sets up new monitors for a site.
                 *
                 * @param site - The {@link Site} to set up monitors for.
                 * @param newMonitorIds - Array of monitor IDs to set up.
                 *
                 * @returns Promise that resolves when setup is complete.
                 */
                setupNewMonitors: async (
                    site: Site,
                    newMonitorIds: string[]
                ): Promise<void> => {
                    const monitorManager = this.getMonitorManager();
                    return monitorManager.setupNewMonitors(site, newMonitorIds);
                },
                /**
                 * Starts monitoring for a site and monitor ID.
                 *
                 * @param identifier - The site identifier.
                 * @param monitorId - The monitor ID.
                 *
                 * @returns Promise resolving to true if monitoring started,
                 *   false otherwise.
                 */
                startMonitoringForSite: async (
                    identifier: string,
                    monitorId: string
                ): Promise<boolean> => {
                    const monitorManager = this.getMonitorManager();
                    return monitorManager.startMonitoringForSite(
                        identifier,
                        monitorId
                    );
                },
                /**
                 * Stops monitoring for a site and monitor ID.
                 *
                 * @param identifier - The site identifier.
                 * @param monitorId - The monitor ID.
                 *
                 * @returns Promise resolving to true if monitoring stopped,
                 *   false otherwise.
                 */
                stopMonitoringForSite: async (
                    identifier: string,
                    monitorId: string
                ): Promise<boolean> => {
                    const monitorManager = this.getMonitorManager();
                    return monitorManager.stopMonitoringForSite(
                        identifier,
                        monitorId
                    );
                },
            };
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
            this.setupEventForwarding(siteEventBus, "SiteManager");
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
     * Used internally for event forwarding.
     *
     * @returns The {@link UptimeOrchestrator} instance, or null if not
     *   initialized.
     *
     * @internal
     */
    private getMainOrchestrator(): null | UptimeOrchestrator {
        return this.uptimeOrchestrator ?? null;
    }

    /**
     * Sets up event forwarding from a manager's event bus to the main
     * orchestrator.
     *
     * @remarks
     * Ensures frontend status updates work properly while maintaining
     * dependency isolation.
     *
     * @param managerEventBus - The {@link TypedEventBus} to forward events from.
     * @param managerName - The name of the manager for logging.
     */
    private setupEventForwarding(
        managerEventBus: TypedEventBus<UptimeEvents>,
        managerName: string
    ): void {
        const eventsToForward = [
            "monitor:status-changed",
            "monitor:up",
            "monitor:down",
            "internal:monitor:started",
            "internal:monitor:stopped",
            "internal:monitor:manual-check-completed",
            "internal:monitor:site-setup-completed",
            "internal:site:added",
            "internal:site:removed",
            "internal:site:updated",
            "sites:state-synchronized",
            "internal:database:data-imported",
            "internal:database:history-limit-updated",
            "internal:database:sites-refreshed",
            "internal:database:update-sites-cache-requested",
            "system:error",
        ] as const satisfies readonly UptimeEventName[];

        const maybeTypedBus = managerEventBus as {
            on?: TypedEventBus<UptimeEvents>["on"];
            onTyped?: TypedEventBus<UptimeEvents>["onTyped"];
        };

        if (typeof maybeTypedBus.onTyped === "function") {
            for (const eventName of eventsToForward) {
                maybeTypedBus.onTyped(
                    eventName,
                    (
                        payloadWithMeta: EnhancedEventPayload<
                            UptimeEvents[typeof eventName]
                        >
                    ): void => {
                        const forwardablePayload =
                            toForwardablePayload(payloadWithMeta);
                        this.emitForwardedEvent(
                            eventName,
                            forwardablePayload,
                            managerName
                        );
                    }
                );
            }
        } else {
            for (const eventName of eventsToForward) {
                const rawOn = (
                    managerEventBus as {
                        on?: TypedEventBus<UptimeEvents>["on"];
                    }
                ).on;

                if (typeof rawOn === "function") {
                    rawOn.call(
                        managerEventBus,
                        eventName,
                        (
                            payload: ForwardableEventPayload<typeof eventName>
                        ): void => {
                            this.emitForwardedEvent(
                                eventName,
                                payload,
                                managerName
                            );
                        }
                    );
                } else if (this.config.enableDebugLogging) {
                    logger.warn(
                        `[ServiceContainer] Skipping forwarding for ${eventName} because manager event bus for ${managerName} lacks an on() method`
                    );
                }
            }
        }

        if (this.config.enableDebugLogging) {
            logger.debug(
                `[ServiceContainer] Set up event forwarding for ${managerName} (${eventsToForward.length} events)`
            );
        }
    }

    /**
     * Emits a manager event through the main orchestrator after metadata
     * cleanup.
     *
     * @typeParam EventName - Event identifier forwarded to the orchestrator.
     *
     * @param eventName - Name of the event being forwarded.
     * @param payload - Raw payload emitted by the manager event bus.
     * @param managerName - Name of the originating manager for diagnostics.
     */
    private emitForwardedEvent<EventName extends EventKey<UptimeEvents>>(
        eventName: EventName,
        payload: ForwardableEventPayload<EventName>,
        managerName: string
    ): void {
        const mainOrchestrator = this.getMainOrchestrator();
        if (!mainOrchestrator) {
            return;
        }

        const sanitizedPayload = this.stripEventMetadata(eventName, payload);
        const eventLabel = eventName;

        void (async (): Promise<void> => {
            try {
                await mainOrchestrator.emitTyped(eventName, sanitizedPayload);
            } catch (error: unknown) {
                const normalizedError = ensureError(error);
                logger.error(
                    `[ServiceContainer] Error forwarding ${eventLabel} from ${managerName}`,
                    normalizedError,
                    {
                        event: eventLabel,
                        manager: managerName,
                    }
                );
            }
        })();

        if (this.config.enableDebugLogging) {
            logger.debug(
                `[ServiceContainer] Forwarded ${eventLabel} from ${managerName} to main orchestrator`
            );
        }
    }

    /**
     * Removes event bus metadata from a payload before forwarding it upstream.
     *
     * @typeParam EventName - Event identifier forwarded to the orchestrator.
     *
     * @param eventName - Name of the event being forwarded (for logging
     *   context).
     * @param payload - Payload that may include event bus metadata artifacts.
     *
     * @returns Payload suitable for {@link UptimeOrchestrator.emitTyped}.
     */
    private stripEventMetadata<EventName extends EventKey<UptimeEvents>>(
        eventName: EventName,
        payload: ForwardableEventPayload<EventName>
    ): UptimeEvents[EventName] {
        if (!this.isPayloadWithMetadata(payload)) {
            if (Array.isArray(payload)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Array.from preserves the structural payload shape while dropping event metadata.
                return Array.from(
                    payload
                ) as unknown as UptimeEvents[EventName];
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Payload is already of the correct event type; we only need to assert away metadata.
            return payload as unknown as UptimeEvents[EventName];
        }

        const payloadWithMeta: ForwardablePayloadWithMeta<EventName> = payload;
        const { forwarded, original } =
            this.extractForwardingMetadata(payloadWithMeta);

        if (this.config.enableDebugLogging) {
            const eventLabel = eventName;
            logger.debug(
                `[ServiceContainer] Stripped metadata from ${eventLabel} payload before forwarding`,
                {
                    metadata: forwarded,
                    originalMetadata: original,
                }
            );
        }

        if (Array.isArray(payloadWithMeta)) {
            const clonedArray = Array.from(payloadWithMeta);
            this.applyForwardingMetadata(clonedArray, forwarded, original);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The metadata reattachment preserves the runtime payload shape.
            return clonedArray as unknown as UptimeEvents[EventName];
        }

        const clone: Record<string, unknown> = { ...payloadWithMeta };

        if (Reflect.has(clone, FORWARDED_METADATA_PROPERTY_KEY)) {
            Reflect.deleteProperty(clone, FORWARDED_METADATA_PROPERTY_KEY);
        }

        if (Reflect.has(clone, ORIGINAL_METADATA_PROPERTY_KEY)) {
            Reflect.deleteProperty(clone, ORIGINAL_METADATA_PROPERTY_KEY);
        }

        if (Reflect.has(clone, ORIGINAL_METADATA_SYMBOL)) {
            Reflect.deleteProperty(clone, ORIGINAL_METADATA_SYMBOL);
        }

        this.applyForwardingMetadata(clone, forwarded, original);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- After metadata removal, the clone matches the event payload contract.
        return clone as unknown as UptimeEvents[EventName];
    }

    /**
     * Determines whether a payload contains event bus metadata properties.
     */
    private isPayloadWithMetadata<EventName extends EventKey<UptimeEvents>>(
        payload: ForwardableEventPayload<EventName>
    ): payload is ForwardablePayloadWithMeta<EventName> {
        return (
            isNonNullObject(payload) &&
            FORWARDED_METADATA_PROPERTY_KEY in payload
        );
    }

    private normalizeEventMetadata(
        candidate: unknown
    ): EventMetadata | undefined {
        if (candidate === null || typeof candidate !== "object") {
            return undefined;
        }

        const maybeMetadata = candidate as Partial<EventMetadata>;

        if (
            typeof maybeMetadata.busId !== "string" ||
            typeof maybeMetadata.correlationId !== "string" ||
            typeof maybeMetadata.eventName !== "string" ||
            typeof maybeMetadata.timestamp !== "number"
        ) {
            return undefined;
        }

        return {
            busId: maybeMetadata.busId,
            correlationId: maybeMetadata.correlationId,
            eventName: maybeMetadata.eventName,
            timestamp: maybeMetadata.timestamp,
        } satisfies EventMetadata;
    }

    private extractForwardingMetadata<EventName extends EventKey<UptimeEvents>>(
        payload: ForwardablePayloadWithMeta<EventName>
    ): {
        forwarded?: EventMetadata;
        original?: EventMetadata;
    } {
        const forwarded = this.normalizeEventMetadata(
            Reflect.get(payload, FORWARDED_METADATA_PROPERTY_KEY)
        );

        const originalFromProperty = this.normalizeEventMetadata(
            Reflect.has(payload, ORIGINAL_METADATA_PROPERTY_KEY)
                ? Reflect.get(payload, ORIGINAL_METADATA_PROPERTY_KEY)
                : undefined
        );

        const originalFromSymbol = this.normalizeEventMetadata(
            Reflect.has(payload, ORIGINAL_METADATA_SYMBOL)
                ? Reflect.get(payload, ORIGINAL_METADATA_SYMBOL)
                : undefined
        );

        const original =
            originalFromSymbol ?? originalFromProperty ?? forwarded;

        const result: {
            forwarded?: EventMetadata;
            original?: EventMetadata;
        } = {};

        if (forwarded) {
            result.forwarded = forwarded;
        }

        if (original) {
            result.original = original;
        }

        return result;
    }

    private applyForwardingMetadata(
        target: object,
        forwarded: EventMetadata | undefined,
        original: EventMetadata | undefined
    ): void {
        if (!forwarded) {
            return;
        }

        const resolvedOriginal = original ?? forwarded;

        Object.defineProperty(target, FORWARDED_METADATA_PROPERTY_KEY, {
            configurable: true,
            enumerable: false,
            value: forwarded,
            writable: false,
        });

        Object.defineProperty(target, ORIGINAL_METADATA_PROPERTY_KEY, {
            configurable: true,
            enumerable: false,
            value: resolvedOriginal,
            writable: false,
        });

        Object.defineProperty(target, ORIGINAL_METADATA_SYMBOL, {
            configurable: true,
            enumerable: false,
            value: resolvedOriginal,
            writable: false,
        });
    }
}
