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

import { UptimeOrchestrator } from "../UptimeOrchestrator";
import { logger } from "../utils/logger";
import { DatabaseService } from "./database/DatabaseService";
import { IpcService } from "./ipc/IpcService";
import { NotificationService } from "./notifications/NotificationService";
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

    // Core Services (Infrastructure)
    private _databaseService?: DatabaseService;

    private _ipcService?: IpcService;

    private _notificationService?: NotificationService;

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
                logger.debug("[ServiceContainer] Created AutoUpdaterService"); /* v8 ignore next */
            }
        }
        return this._autoUpdaterService;
    }

    // Core Services
    public getDatabaseService(): DatabaseService {
        this._databaseService ??= DatabaseService.getInstance();
        return this._databaseService;
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

        return services;
    }

    public getIpcService(): IpcService {
        if (!this._ipcService) {
            // IPC service depends on orchestrator and updater
            const orchestrator = this.getUptimeOrchestrator();
            const updater = this.getAutoUpdaterService();

            this._ipcService = new IpcService(orchestrator, updater);
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created IpcService with dependencies"); /* v8 ignore next */
            }
        }
        return this._ipcService;
    }

    public getNotificationService(): NotificationService {
        if (!this._notificationService) {
            this._notificationService = new NotificationService(this.config.notificationConfig);
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created NotificationService"); /* v8 ignore next */
            }
        }
        return this._notificationService;
    }

    // Application Services
    public getUptimeOrchestrator(): UptimeOrchestrator {
        if (!this._uptimeOrchestrator) {
            this._uptimeOrchestrator = new UptimeOrchestrator();
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created UptimeOrchestrator"); /* v8 ignore next */
            }
        }
        return this._uptimeOrchestrator;
    }

    // Utility Services
    public getWindowService(): WindowService {
        if (!this._windowService) {
            this._windowService = new WindowService();
            if (this.config.enableDebugLogging) {
                logger.debug("[ServiceContainer] Created WindowService"); /* v8 ignore next */
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

        // Initialize application services
        await this.getUptimeOrchestrator().initialize();

        // Initialize IPC (depends on orchestrator)
        this.getIpcService().setupHandlers();

        logger.info("[ServiceContainer] All services initialized successfully");
    }
}
