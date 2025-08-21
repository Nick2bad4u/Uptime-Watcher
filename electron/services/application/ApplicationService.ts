/**
 * Main application service that orchestrates all other services and coordinates
 * application lifecycle across the Electron backend.
 *
 * @remarks
 * Uses dependency injection through {@link ServiceContainer} to manage all
 * services and their dependencies. Provides proper initialization order, event
 * handler setup, and cleanup. Handles Electron app events and orchestrates
 * service startup and shutdown.
 *
 * Key responsibilities:
 *
 * - Application lifecycle management (startup, shutdown, error handling)
 * - Service container initialization and dependency injection
 * - Event handler registration for Electron app events
 * - Graceful shutdown coordination for all services
 * - Error handling and recovery for application-level failures
 * - Development vs production environment handling
 * - Service health monitoring and status reporting
 *
 * @example Basic application service usage:
 *
 * ```typescript
 * const appService = new ApplicationService();
 *
 * // Initialize all services
 * await appService.initializeServices();
 *
 * // Start the application
 * await appService.startApplication();
 *
 * // Shutdown gracefully
 * await appService.shutdown();
 * ```
 *
 * @example Service dependency access:
 *
 * ```typescript
 * // Access services through the container
 * const databaseManager = appService.getDatabaseManager();
 * const monitorManager = appService.getMonitorManager();
 * ```
 *
 * @packageDocumentation
 *
 * @public
 */
import { isDevelopment } from "@shared/utils/environment";
import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";
import { app } from "electron";

import { logger } from "../../utils/logger";
import { ServiceContainer } from "../ServiceContainer";

/**
 * Main application service that orchestrates all other services and coordinates
 * application lifecycle across the Electron backend.
 *
 * @remarks
 * Uses dependency injection through {@link ServiceContainer} to manage all
 * services and their dependencies. Provides proper initialization order, event
 * handler setup, and cleanup. Handles Electron app events and orchestrates
 * service startup and shutdown.
 *
 * Key responsibilities:
 *
 * - Application lifecycle management (startup, shutdown, error handling)
 * - Service container initialization and dependency injection
 * - Event handler registration for Electron app events
 * - Graceful shutdown coordination for all services
 * - Error handling and recovery for application-level failures
 * - Development vs production environment handling
 * - Service health monitoring and status reporting
 *
 * @example Basic application service usage:
 *
 * ```typescript
 * const appService = new ApplicationService();
 *
 * // Initialize all services
 * await appService.initializeServices();
 *
 * // Start the application
 * await appService.startApplication();
 *
 * // Shutdown gracefully
 * await appService.shutdown();
 * ```
 *
 * @example Service dependency access:
 *
 * ```typescript
 * // Access services through the container
 * const databaseManager = appService.getDatabaseManager();
 * const monitorManager = appService.getMonitorManager();
 * ```
 *
 * @public
 */
export class ApplicationService {
    /**
     * The container for all application services.
     *
     * @readonly
     *
     * @internal
     */
    private readonly serviceContainer: ServiceContainer;

    /**
     * Named event handler for app ready event.
     */
    private readonly handleAppReady = (): void => {
        void (async (): Promise<void> => {
            try {
                await this.onAppReady();
            } catch (error) {
                logger.error(
                    LOG_TEMPLATES.errors.APPLICATION_INITIALIZATION_ERROR,
                    error
                );
            }
        })();
    };

    /**
     * Named event handler for window-all-closed event.
     */
    private readonly handleWindowAllClosed = (): void => {
        logger.info(LOG_TEMPLATES.services.APPLICATION_WINDOWS_CLOSED);
        if (process.platform !== "darwin") {
            logger.info(LOG_TEMPLATES.services.APPLICATION_QUITTING);
            app.quit();
        }
    };

    /**
     * Named event handler for activate event.
     */
    private readonly handleActivate = (): void => {
        logger.info(LOG_TEMPLATES.services.APPLICATION_ACTIVATED);
        const windowService = this.serviceContainer.getWindowService();
        if (windowService.getAllWindows().length === 0) {
            logger.info(LOG_TEMPLATES.services.APPLICATION_CREATING_WINDOW);
            windowService.createMainWindow();
        }
    };

    /**
     * Cleans up resources before application shutdown.
     *
     * @remarks
     * Performs ordered shutdown of all services including IPC cleanup,
     * monitoring stoppage, and window closure. Follows project error handling
     * standards by re-throwing errors after logging for upstream handling.
     *
     * @example
     *
     * ```typescript
     * await appService.cleanup();
     * ```
     *
     * @returns A promise that resolves when cleanup is complete.
     *
     * @throws Re-throws any errors encountered during cleanup for upstream
     *   handling.
     *
     * @public
     */
    public async cleanup(): Promise<void> {
        logger.info(LOG_TEMPLATES.services.APPLICATION_CLEANUP_START);

        try {
            const services = this.serviceContainer.getInitializedServices();
            for (const { name } of services) {
                logger.debug(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.debug.APPLICATION_CLEANUP_SERVICE,
                        { name }
                    )
                );
            }

            // Remove application event listeners
            this.removeApplicationEventListeners();

            // Cleanup IPC handlers
            // NOTE: Currently synchronous, but designed to be
            // future-compatible with async cleanup
            const ipcService = this.serviceContainer.getIpcService();
            if (
                "cleanup" in ipcService &&
                typeof ipcService.cleanup === "function"
            ) {
                ipcService.cleanup();
            }

            // Stop monitoring
            const orchestrator = this.serviceContainer.getUptimeOrchestrator();
            await orchestrator.stopMonitoring();

            // Close windows
            // NOTE: Currently synchronous, but designed to be
            // future-compatible with async closure
            this.serviceContainer.getWindowService().closeMainWindow();

            logger.info(LOG_TEMPLATES.services.APPLICATION_CLEANUP_COMPLETE);
        } catch (error) {
            logger.error(LOG_TEMPLATES.errors.APPLICATION_CLEANUP_ERROR, error);
            // Re-throw errors after logging (project standard)
            throw error;
        }
    }

    /**
     * Handles the application ready event and initializes all services.
     *
     * @remarks
     * Performs ordered initialization of all services through the
     * {@link ServiceContainer}, creates the main application window, and sets up
     * event handlers and auto-updater. This method is called automatically when
     * Electron's 'ready' event fires. Errors are caught and logged by the
     * calling {@link setupApplication} method.
     *
     * @returns A promise that resolves when initialization is complete.
     *
     * @internal
     */
    private async onAppReady(): Promise<void> {
        logger.info(LOG_TEMPLATES.services.APPLICATION_READY);

        // Initialize all services through the container
        await this.serviceContainer.initialize();

        // Create main window
        this.serviceContainer.getWindowService().createMainWindow();

        // Setup event handlers
        this.setupUptimeEventHandlers();

        // Setup auto-updater
        this.setupAutoUpdater();

        logger.info(LOG_TEMPLATES.services.APPLICATION_SERVICES_INITIALIZED);
    }

    /**
     * Constructs the {@link ApplicationService} and sets up the service
     * container.
     *
     * @remarks
     * Creates a {@link ServiceContainer} instance with appropriate debug
     * settings and sets up application-level event handlers. This constructor
     * should be called once during application startup.
     *
     * @example
     *
     * ```typescript
     * const appService = new ApplicationService();
     * ```
     *
     * @public
     */
    public constructor() {
        logger.info(LOG_TEMPLATES.services.APPLICATION_INITIALIZING);

        // Get service container instance
        this.serviceContainer = ServiceContainer.getInstance({
            enableDebugLogging: isDevelopment(),
        });

        this.setupApplication();
    }

    /**
     * Sets up application-level Electron event handlers.
     *
     * @remarks
     * Configures handlers for core Electron application lifecycle events:
     *
     * - 'ready': Triggers service initialization and window creation
     * - 'window-all-closed': Handles application shutdown (platform-specific)
     * - 'activate': Handles application reactivation (macOS dock click)
     *
     * This method is called during construction to ensure event handlers are
     * registered before Electron's ready event fires.
     *
     * @internal
     */
    private setupApplication(): void {
        app.on("ready", this.handleAppReady);
        app.on("window-all-closed", this.handleWindowAllClosed);
        app.on("activate", this.handleActivate);
    }

    /**
     * Removes application event listeners. Called during cleanup to prevent
     * memory leaks.
     *
     * @internal
     */
    private removeApplicationEventListeners(): void {
        app.off("ready", this.handleAppReady);
        app.off("window-all-closed", this.handleWindowAllClosed);
        app.off("activate", this.handleActivate);
    }

    /**
     * Sets up the auto-updater service with status callbacks and
     * initialization.
     *
     * @remarks
     * Configures the auto-updater service to:
     *
     * - Send update status notifications to the renderer process
     * - Initialize the auto-updater mechanism
     * - Perform initial update check with error handling
     *
     * Update check errors are logged but not re-thrown to prevent application
     * startup failures due to network issues.
     *
     * @internal
     */
    private setupAutoUpdater(): void {
        const autoUpdater = this.serviceContainer.getAutoUpdaterService();
        const windowService = this.serviceContainer.getWindowService();

        autoUpdater.setStatusCallback((statusData) => {
            windowService.sendToRenderer("update-status", statusData);
        });

        autoUpdater.initialize();
        void (async (): Promise<void> => {
            try {
                await autoUpdater.checkForUpdates();
            } catch (error) {
                logger.error(
                    LOG_TEMPLATES.errors.APPLICATION_UPDATE_CHECK_ERROR,
                    error
                );
            }
        })();
    }

    /**
     * Sets up typed event handlers for uptime monitoring system events.
     *
     * @remarks
     * Establishes communication bridge between the uptime monitoring system and
     * the renderer process by forwarding typed events including: - Monitor
     * status changes (up/down/status-changed)
     *
     * - Monitoring lifecycle events (started/stopped)
     * - Cache invalidation events
     * - System errors
     *
     * Also triggers desktop notifications for monitor state changes. All event
     * forwarding includes error handling to prevent event processing failures
     * from affecting monitoring operations.
     *
     * @internal
     */
    private setupUptimeEventHandlers(): void {
        const orchestrator = this.serviceContainer.getUptimeOrchestrator();
        const windowService = this.serviceContainer.getWindowService();
        const notificationService =
            this.serviceContainer.getNotificationService();

        // Handle monitor status changes with typed events
        orchestrator.onTyped("monitor:status-changed", (data) => {
            try {
                logger.debug(
                    LOG_TEMPLATES.debug.APPLICATION_FORWARDING_MONITOR_STATUS,
                    {
                        monitorId: data.monitor.id,
                        newStatus: data.newStatus,
                        previousStatus: data.previousStatus,
                        siteId: data.siteId,
                    }
                );

                // Send status update to renderer
                windowService.sendToRenderer("monitor:status-changed", data);
            } catch (error) {
                logger.error(
                    LOG_TEMPLATES.errors
                        .APPLICATION_FORWARD_MONITOR_STATUS_ERROR,
                    error
                );
            }
        });

        // Handle monitor up events
        orchestrator.onTyped("monitor:up", (data) => {
            try {
                logger.info(
                    LOG_TEMPLATES.debug.APPLICATION_FORWARDING_MONITOR_UP,
                    {
                        monitorId: data.monitor.id,
                        siteId: data.siteId,
                        siteName: data.site.name,
                    }
                );

                windowService.sendToRenderer("monitor:up", data);
                notificationService.notifyMonitorUp(data.site, data.monitor.id);
            } catch (error) {
                logger.error(
                    LOG_TEMPLATES.errors.APPLICATION_FORWARD_MONITOR_UP_ERROR,
                    error
                );
            }
        });

        // Handle monitor down events
        orchestrator.onTyped("monitor:down", (data) => {
            try {
                logger.warn(LOG_TEMPLATES.warnings.APPLICATION_MONITOR_DOWN, {
                    monitorId: data.monitor.id,
                    siteId: data.siteId,
                    siteName: data.site.name,
                });

                windowService.sendToRenderer("monitor:down", data);
                notificationService.notifyMonitorDown(
                    data.site,
                    data.monitor.id
                );
            } catch (error) {
                logger.error(
                    LOG_TEMPLATES.errors.APPLICATION_FORWARD_MONITOR_DOWN_ERROR,
                    error
                );
            }
        });

        // Handle system errors
        orchestrator.onTyped("system:error", (data) => {
            logger.error(
                interpolateLogTemplate(
                    LOG_TEMPLATES.errors.APPLICATION_SYSTEM_ERROR,
                    { context: data.context }
                ),
                data.error
            );
        });

        // Forward monitoring start/stop events to renderer
        orchestrator.onTyped("monitoring:started", (data) => {
            try {
                logger.debug(
                    LOG_TEMPLATES.debug
                        .APPLICATION_FORWARDING_MONITORING_STARTED,
                    data
                );
                windowService.sendToRenderer("monitoring:started", data);
            } catch (error) {
                logger.error(
                    LOG_TEMPLATES.errors
                        .APPLICATION_FORWARD_MONITORING_STARTED_ERROR,
                    error
                );
            }
        });

        orchestrator.onTyped("monitoring:stopped", (data) => {
            try {
                logger.debug(
                    LOG_TEMPLATES.debug
                        .APPLICATION_FORWARDING_MONITORING_STOPPED,
                    data
                );
                windowService.sendToRenderer("monitoring:stopped", data);
            } catch (error) {
                logger.error(
                    LOG_TEMPLATES.errors
                        .APPLICATION_FORWARD_MONITORING_STOPPED_ERROR,
                    error
                );
            }
        });

        // Handle cache invalidation events
        orchestrator.onTyped("cache:invalidated", (data) => {
            try {
                logger.debug(
                    LOG_TEMPLATES.debug
                        .APPLICATION_FORWARDING_CACHE_INVALIDATION,
                    {
                        identifier: data.identifier,
                        reason: data.reason,
                        type: data.type,
                    }
                );
                windowService.sendToRenderer("cache:invalidated", data);
            } catch (error) {
                logger.error(
                    LOG_TEMPLATES.errors
                        .APPLICATION_FORWARD_CACHE_INVALIDATION_ERROR,
                    error
                );
            }
        });
    }
}
