import { app } from "electron";

import { StatusUpdate } from "../../types";
import { UptimeMonitor } from "../../uptimeMonitor";
import { logger } from "../../utils/logger";
import { IpcService } from "../ipc";
import { NotificationService } from "../notifications";
import { AutoUpdaterService } from "../updater";
import { WindowService } from "../window";

/**
 * Main application service that orchestrates all other services.
 * Handles application lifecycle and service coordination.
 */
export class ApplicationService {
    private windowService: WindowService;
    private ipcService: IpcService;
    private notificationService: NotificationService;
    private autoUpdaterService: AutoUpdaterService;
    private uptimeMonitor: UptimeMonitor;

    constructor() {
        logger.info("[ApplicationService] Initializing application services");

        // Initialize core services
        this.windowService = new WindowService();
        this.notificationService = new NotificationService();
        this.autoUpdaterService = new AutoUpdaterService();
        this.uptimeMonitor = new UptimeMonitor();

        // Initialize IPC with dependencies
        this.ipcService = new IpcService(this.uptimeMonitor, this.autoUpdaterService);

        this.setupApplication();
    }

    /**
     * Setup application-level event handlers.
     */
    private setupApplication(): void {
        app.on("ready", () => {
            this.onAppReady();
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
            if (this.windowService.getAllWindows().length === 0) {
                logger.info("[ApplicationService] No windows open, creating main window");
                this.windowService.createMainWindow();
            }
        });
    }

    /**
     * Handle app ready event.
     */
    private onAppReady(): void {
        // Create main window
        this.windowService.createMainWindow();

        // Setup IPC handlers
        this.ipcService.setupHandlers();

        // Setup auto-updater
        this.setupAutoUpdater();

        // Setup monitor event listeners
        this.setupMonitorEvents();
    }

    /**
     * Setup auto-updater service.
     */
    private setupAutoUpdater(): void {
        this.autoUpdaterService.setStatusCallback((statusData) => {
            this.windowService.sendToRenderer("update-status", statusData);
        });

        this.autoUpdaterService.initialize();
        this.autoUpdaterService.checkForUpdates();
    }

    /**
     * Setup uptime monitor event listeners.
     */
    private setupMonitorEvents(): void {
        // Status updates
        this.uptimeMonitor.on("status-update", (data: StatusUpdate) => {
            const monitorStatuses = data.site.monitors
                .map((m) => `${m.type}: ${m.status}${m.responseTime ? ` (${m.responseTime}ms)` : ""}`)
                .join(", ");
            logger.debug(`[ApplicationService] Status update for ${data.site.identifier}: ${monitorStatuses}`);
            this.windowService.sendToRenderer("status-update", data);
        });

        // Monitor down alerts
        this.uptimeMonitor.on("site-monitor-down", ({ monitorId, site }) => {
            this.notificationService.notifyMonitorDown(site, monitorId);
        });

        // Monitor up alerts
        this.uptimeMonitor.on("site-monitor-up", ({ monitorId, site }) => {
            this.notificationService.notifyMonitorUp(site, monitorId);
        });

        // Database errors
        this.uptimeMonitor.on("db-error", ({ error, operation }) => {
            logger.error(`[ApplicationService] Database error during ${operation}`, error);
            // Could add error notifications here if needed
        });
    }

    /**
     * Cleanup all services (called on app quit).
     */
    public cleanup(): void {
        logger.info("[ApplicationService] Cleaning up services");

        try {
            this.ipcService.cleanup();
            this.uptimeMonitor.stopMonitoring();
            this.windowService.closeMainWindow();
        } catch (error) {
            logger.error("[ApplicationService] Error during cleanup", error);
        }
    }
}
