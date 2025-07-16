import { app } from "electron";

import { StatusUpdate, Site } from "../../types";
import { logger } from "../../utils/index";
import { ServiceContainer } from "../ServiceContainer";

/**
 * Main application service that orchestrates all other services.
 * Handles application lifecycle and service coordination.
 *
 * @remarks
 * Uses dependency injection through ServiceContainer to manage all services
 * and their dependencies. Provides proper initialization order and cleanup.
 */
export class ApplicationService {
    private readonly serviceContainer: ServiceContainer;

    constructor() {
        logger.info("[ApplicationService] Initializing application services"); /* v8 ignore next */

        // Get service container instance
        this.serviceContainer = ServiceContainer.getInstance({
            enableDebugLogging: process.env.NODE_ENV === "development",
        });

        this.setupApplication();
    }

    /**
     * Setup application-level event handlers.
     */
    private setupApplication(): void {
        app.on("ready", () => {
            this.onAppReady().catch((error) => {
                logger.error("[ApplicationService] Error during app initialization", error); /* v8 ignore next */
            });
        });

        app.on("window-all-closed", () => {
            logger.info("[ApplicationService] All windows closed"); /* v8 ignore next */
            if (process.platform !== "darwin") {
                logger.info("[ApplicationService] Quitting app (non-macOS)"); /* v8 ignore next */
                app.quit();
            }
        });

        app.on("activate", () => {
            logger.info("[ApplicationService] App activated"); /* v8 ignore next */
            const windowService = this.serviceContainer.getWindowService();
            if (windowService.getAllWindows().length === 0) {
                logger.info("[ApplicationService] No windows open, creating main window"); /* v8 ignore next */
                windowService.createMainWindow();
            }
        });
    }

    /**
     * Handle app ready event.
     */
    private async onAppReady(): Promise<void> {
        logger.info("[ApplicationService] App ready - initializing services"); /* v8 ignore next */

        // Initialize all services through the container
        await this.serviceContainer.initialize();

        // Create main window
        this.serviceContainer.getWindowService().createMainWindow();

        // Setup event handlers
        this.setupUptimeEventHandlers();

        // Setup auto-updater
        this.setupAutoUpdater();

        logger.info("[ApplicationService] All services initialized successfully"); /* v8 ignore next */
    }

    /**
     * Setup auto-updater with callbacks.
     */
    private setupAutoUpdater(): void {
        const autoUpdater = this.serviceContainer.getAutoUpdaterService();
        const windowService = this.serviceContainer.getWindowService();

        autoUpdater.setStatusCallback((statusData) => {
            windowService.sendToRenderer("update-status", statusData);
        });

        autoUpdater.initialize();
        autoUpdater.checkForUpdates().catch((error) => {
            logger.error("[ApplicationService] Failed to check for updates", error); /* v8 ignore next */
        });
    }

    /**
     * Setup event handlers for uptime monitoring events.
     */
    private setupUptimeEventHandlers(): void {
        const orchestrator = this.serviceContainer.getUptimeOrchestrator();
        const windowService = this.serviceContainer.getWindowService();
        const notificationService = this.serviceContainer.getNotificationService();

        orchestrator.on("status-update", (data: StatusUpdate) => {
            try {
                /* v8 ignore next */ logger.debug("[ApplicationService] Forwarding status update to renderer", {
                    siteId: data.site.identifier,
                    previousStatus: data.previousStatus,
                });

                windowService.sendToRenderer("status-update", data);
            } catch (error) {
                /* v8 ignore next 2 */ logger.error(
                    "[ApplicationService] Failed to forward status update to renderer",
                    error
                );
            }
        });

        // Forward monitoring start/stop events to renderer
        orchestrator.on("monitoring:started", (data) => {
            try {
                /* v8 ignore next 2 */ logger.debug(
                    "[ApplicationService] Forwarding monitoring started to renderer",
                    data
                );
                windowService.sendToRenderer("monitoring-started", data);
            } catch (error) {
                /* v8 ignore next 2 */ logger.error(
                    "[ApplicationService] Failed to forward monitoring started to renderer",
                    error
                );
            }
        });

        orchestrator.on("monitoring:stopped", (data) => {
            try {
                /* v8 ignore next 2 */ logger.debug(
                    "[ApplicationService] Forwarding monitoring stopped to renderer",
                    data
                );
                windowService.sendToRenderer("monitoring-stopped", data);
            } catch (error) {
                /* v8 ignore next 2 */ logger.error(
                    "[ApplicationService] Failed to forward monitoring stopped to renderer",
                    error
                );
            }
        });

        orchestrator.on("site-monitor-down", ({ monitorId, site }: { monitorId: string; site: Site }) => {
            /* v8 ignore next */ logger.debug("[ApplicationService] Monitor down notification", {
                monitorId,
                siteId: site.identifier,
            });
            notificationService.notifyMonitorDown(site, monitorId);
        });

        orchestrator.on("site-monitor-up", ({ monitorId, site }: { monitorId: string; site: Site }) => {
            /* v8 ignore next */ logger.debug("[ApplicationService] Monitor up notification", {
                monitorId,
                siteId: site.identifier,
            });
            notificationService.notifyMonitorUp(site, monitorId);
        });

        orchestrator.on("db-error", ({ error, operation }: { error: Error; operation: string }) => {
            /* v8 ignore next */ logger.error(`[ApplicationService] Database error during ${operation}`, error);
        });
    }

    /**
     * Cleanup resources before application shutdown.
     */
    public async cleanup(): Promise<void> {
        logger.info("[ApplicationService] Starting cleanup"); /* v8 ignore next */

        try {
            const services = this.serviceContainer.getInitializedServices();
            for (const { name } of services) {
                logger.debug(`[ApplicationService] Cleaning up ${name}`); /* v8 ignore next */
            }

            // Cleanup IPC handlers
            const ipcService = this.serviceContainer.getIpcService();
            if ("cleanup" in ipcService && typeof ipcService.cleanup === "function") {
                ipcService.cleanup();
            }

            // Stop monitoring
            const orchestrator = this.serviceContainer.getUptimeOrchestrator();
            await orchestrator.stopMonitoring();

            // Close windows
            this.serviceContainer.getWindowService().closeMainWindow();

            logger.info("[ApplicationService] Cleanup completed"); /* v8 ignore next */
        } catch (error) {
            logger.error("[ApplicationService] Error during cleanup", error); /* v8 ignore next */
        }
    }
}
