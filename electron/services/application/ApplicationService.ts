import { app } from "electron";

import { isDevelopment } from "../../../shared/utils/environment";
import { logger } from "../../utils/logger";
import { ServiceContainer } from "../ServiceContainer";

/**
 * @public
 * Main application service that orchestrates all other services.
 * Handles application lifecycle and service coordination.
 *
 * @remarks
 * Uses dependency injection through ServiceContainer to manage all services
 * and their dependencies. Provides proper initialization order and cleanup.
 */
export class ApplicationService {
    private readonly serviceContainer: ServiceContainer;

    /**
     * Constructs the ApplicationService and sets up the service container.
     *
     * @remarks
     * Creates a ServiceContainer instance with appropriate debug settings
     * and sets up application-level event handlers. This constructor should
     * be called once during application startup.
     * @example
     * ```typescript
     * const appService = new ApplicationService();
     * ```
     */
    constructor() {
        logger.info("[ApplicationService] Initializing application services");

        // Get service container instance
        this.serviceContainer = ServiceContainer.getInstance({
            enableDebugLogging: isDevelopment(),
        });

        this.setupApplication();
    }

    /**
     * Cleans up resources before application shutdown.
     *
     * @returns A promise that resolves when cleanup is complete.
     * @remarks
     * Performs ordered shutdown of all services including IPC cleanup,
     * monitoring stoppage, and window closure. Follows project error handling
     * standards by re-throwing errors after logging for upstream handling.
     * @throws Re-throws any errors encountered during cleanup for upstream handling.
     * @example
     * ```typescript
     * await appService.cleanup();
     * ```
     */
    public async cleanup(): Promise<void> {
        logger.info("[ApplicationService] Starting cleanup");

        try {
            const services = this.serviceContainer.getInitializedServices();
            for (const { name } of services) {
                logger.debug(`[ApplicationService] Cleaning up ${name}`);
            }

            // Cleanup IPC handlers
            // NOTE: Currently synchronous, but designed to be future-compatible with async cleanup
            const ipcService = this.serviceContainer.getIpcService();
            if ("cleanup" in ipcService && typeof ipcService.cleanup === "function") {
                ipcService.cleanup();
            }

            // Stop monitoring
            const orchestrator = this.serviceContainer.getUptimeOrchestrator();
            await orchestrator.stopMonitoring();

            // Close windows
            // NOTE: Currently synchronous, but designed to be future-compatible with async closure
            this.serviceContainer.getWindowService().closeMainWindow();

            logger.info("[ApplicationService] Cleanup completed");
        } catch (error) {
            logger.error("[ApplicationService] Error during cleanup", error);
            // Re-throw errors after logging (project standard)
            throw error;
        }
    }

    /**
     * Handles the application ready event and initializes all services.
     *
     * @returns A promise that resolves when initialization is complete.
     * @remarks
     * Performs ordered initialization of all services through the ServiceContainer,
     * creates the main application window, and sets up event handlers and auto-updater.
     * This method is called automatically when Electron's 'ready' event fires.
     * @throws Errors are caught and logged by the calling setupApplication method.
     */
    private async onAppReady(): Promise<void> {
        logger.info("[ApplicationService] App ready - initializing services");

        // Initialize all services through the container
        await this.serviceContainer.initialize();

        // Create main window
        this.serviceContainer.getWindowService().createMainWindow();

        // Setup event handlers
        this.setupUptimeEventHandlers();

        // Setup auto-updater
        this.setupAutoUpdater();

        logger.info("[ApplicationService] All services initialized successfully");
    }

    /**
     * Sets up application-level Electron event handlers.
     *
     * @remarks
     * Configures handlers for core Electron application lifecycle events:
     * - 'ready': Triggers service initialization and window creation
     * - 'window-all-closed': Handles application shutdown (platform-specific)
     * - 'activate': Handles application reactivation (macOS dock click)
     *
     * This method is called during constructor to ensure event handlers are
     * registered before Electron's ready event fires.
     */
    private setupApplication(): void {
        app.on("ready", () => {
            this.onAppReady().catch((error) => {
                logger.error("[ApplicationService] Error during app initialization", error);
            });
        });

        app.on("window-all-closed", () => {
            logger.info("[ApplicationService] All windows closed");
            if (process.platform !== "darwin") {
                logger.info("[ApplicationService] Quitting app (non-macOS)");
                app.quit();
            }
        });

        app.on("activate", () => {
            logger.info("[ApplicationService] App activated");
            const windowService = this.serviceContainer.getWindowService();
            if (windowService.getAllWindows().length === 0) {
                logger.info("[ApplicationService] No windows open, creating main window");
                windowService.createMainWindow();
            }
        });
    }

    /**
     * Sets up the auto-updater service with status callbacks and initialization.
     *
     * @remarks
     * Configures the auto-updater service to:
     * - Send update status notifications to the renderer process
     * - Initialize the auto-updater mechanism
     * - Perform initial update check with error handling
     *
     * Update check errors are logged but not re-thrown to prevent
     * application startup failures due to network issues.
     */
    private setupAutoUpdater(): void {
        const autoUpdater = this.serviceContainer.getAutoUpdaterService();
        const windowService = this.serviceContainer.getWindowService();

        autoUpdater.setStatusCallback((statusData) => {
            windowService.sendToRenderer("update-status", statusData);
        });

        autoUpdater.initialize();
        autoUpdater.checkForUpdates().catch((error) => {
            logger.error("[ApplicationService] Failed to check for updates", error);
        });
    }

    /**
     * Sets up typed event handlers for uptime monitoring system events.
     *
     * @remarks
     * Establishes communication bridge between the uptime monitoring system
     * and the renderer process by forwarding typed events including:
     * - Monitor status changes (up/down/status-changed)
     * - Monitoring lifecycle events (started/stopped)
     * - Cache invalidation events
     * - System errors
     *
     * Also triggers desktop notifications for monitor state changes.
     * All event forwarding includes error handling to prevent event
     * processing failures from affecting monitoring operations.
     */
    private setupUptimeEventHandlers(): void {
        const orchestrator = this.serviceContainer.getUptimeOrchestrator();
        const windowService = this.serviceContainer.getWindowService();
        const notificationService = this.serviceContainer.getNotificationService();

        // Handle monitor status changes with typed events
        orchestrator.onTyped("monitor:status-changed", (data) => {
            try {
                logger.debug("[ApplicationService] Forwarding monitor status change to renderer", {
                    monitorId: data.monitor.id,
                    newStatus: data.newStatus,
                    previousStatus: data.previousStatus,
                    siteId: data.siteId,
                });

                // Send status update to renderer
                windowService.sendToRenderer("monitor:status-changed", data);
            } catch (error) {
                logger.error("[ApplicationService] Failed to forward monitor status change to renderer", error);
            }
        });

        // Handle monitor up events
        orchestrator.onTyped("monitor:up", (data) => {
            try {
                logger.info("[ApplicationService] Monitor recovered - forwarding to renderer", {
                    monitorId: data.monitor.id,
                    siteId: data.siteId,
                    siteName: data.site.name,
                });

                windowService.sendToRenderer("monitor:up", data);
                notificationService.notifyMonitorUp(data.site, data.monitor.id);
            } catch (error) {
                logger.error("[ApplicationService] Failed to forward monitor up to renderer", error);
            }
        });

        // Handle monitor down events
        orchestrator.onTyped("monitor:down", (data) => {
            try {
                logger.warn("[ApplicationService] Monitor failure detected - forwarding to renderer", {
                    monitorId: data.monitor.id,
                    siteId: data.siteId,
                    siteName: data.site.name,
                });

                windowService.sendToRenderer("monitor:down", data);
                notificationService.notifyMonitorDown(data.site, data.monitor.id);
            } catch (error) {
                logger.error("[ApplicationService] Failed to forward monitor down to renderer", error);
            }
        });

        // Handle system errors
        orchestrator.onTyped("system:error", (data) => {
            logger.error(`[ApplicationService] System error: ${data.context}`, data.error);
        });

        // Forward monitoring start/stop events to renderer
        orchestrator.onTyped("monitoring:started", (data) => {
            try {
                logger.debug("[ApplicationService] Forwarding monitoring started to renderer", data);
                windowService.sendToRenderer("monitoring:started", data);
            } catch (error) {
                logger.error("[ApplicationService] Failed to forward monitoring started to renderer", error);
            }
        });

        orchestrator.onTyped("monitoring:stopped", (data) => {
            try {
                logger.debug("[ApplicationService] Forwarding monitoring stopped to renderer", data);
                windowService.sendToRenderer("monitoring:stopped", data);
            } catch (error) {
                logger.error("[ApplicationService] Failed to forward monitoring stopped to renderer", error);
            }
        });

        // Handle cache invalidation events
        orchestrator.onTyped("cache:invalidated", (data) => {
            try {
                logger.debug("[ApplicationService] Forwarding cache invalidation to renderer", {
                    identifier: data.identifier,
                    reason: data.reason,
                    type: data.type,
                });
                windowService.sendToRenderer("cache:invalidated", data);
            } catch (error) {
                logger.error("[ApplicationService] Failed to forward cache invalidation to renderer", error);
            }
        });
    }
}
