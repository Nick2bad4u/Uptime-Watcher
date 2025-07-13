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
        logger.info("[ApplicationService] Initializing application services");

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
     * Handle app ready event.
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
            logger.error("[ApplicationService] Failed to check for updates", error);
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
                logger.debug("[ApplicationService] Forwarding status update to renderer", {
                    siteId: data.site.identifier,
                    previousStatus: data.previousStatus,
                });

                windowService.sendToRenderer("status-update", data);
            } catch (error) {
                logger.error("[ApplicationService] Failed to forward status update to renderer", error);
            }
        });

        orchestrator.on("site-monitor-down", ({ monitorId, site }: { monitorId: string; site: Site }) => {
            logger.debug("[ApplicationService] Monitor down notification", { monitorId, siteId: site.identifier });
            notificationService.notifyMonitorDown(site, monitorId);
        });

        orchestrator.on("site-monitor-up", ({ monitorId, site }: { monitorId: string; site: Site }) => {
            logger.debug("[ApplicationService] Monitor up notification", { monitorId, siteId: site.identifier });
            notificationService.notifyMonitorUp(site, monitorId);
        });

        orchestrator.on("db-error", ({ error, operation }: { error: Error; operation: string }) => {
            logger.error(`[ApplicationService] Database error during ${operation}`, error);
        });
    }

    /**
     * Cleanup resources before application shutdown.
     */
    public async cleanup(): Promise<void> {
        logger.info("[ApplicationService] Starting cleanup");

        try {
            const services = this.serviceContainer.getInitializedServices();
            for (const { name } of services) {
                logger.debug(`[ApplicationService] Cleaning up ${name}`);
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

            logger.info("[ApplicationService] Cleanup completed");
        } catch (error) {
            logger.error("[ApplicationService] Error during cleanup", error);
        }
    }
}
