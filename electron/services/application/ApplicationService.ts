import { app } from "electron";

import { StatusUpdate, Site } from "../../types";
import { UptimeOrchestrator } from "../../UptimeOrchestrator";
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
    private readonly windowService: WindowService;
    private readonly ipcService: IpcService;
    private readonly notificationService: NotificationService;
    private readonly autoUpdaterService: AutoUpdaterService;
    private readonly uptimeOrchestrator: UptimeOrchestrator;

    constructor() {
        logger.info("[ApplicationService] Initializing application services");

        // Initialize core services
        this.windowService = new WindowService();
        this.notificationService = new NotificationService();
        this.autoUpdaterService = new AutoUpdaterService();
        this.uptimeOrchestrator = new UptimeOrchestrator();

        // Initialize IPC with dependencies
        this.ipcService = new IpcService(this.uptimeOrchestrator, this.autoUpdaterService);

        this.setupApplication();
    }

    /**
     * Setup application-level event handlers.
     */
    private setupApplication(): void {
        app.on("ready", async () => {
            try {
                await this.onAppReady();
            } catch (error) {
                logger.error("[ApplicationService] Error during app initialization", error);
            }
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
    private async onAppReady(): Promise<void> {
        // Initialize the uptime monitor with database
        await this.uptimeOrchestrator.initialize();

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
        this.uptimeOrchestrator.on("status-update", (data: StatusUpdate) => {
            const monitorStatuses = data.site.monitors
                .map((m) => {
                    const responseTimeInfo = m.responseTime ? ` (${m.responseTime}ms)` : "";
                    return `${m.type}: ${m.status}${responseTimeInfo}`;
                })
                .join(", ");

            logger.debug(`[ApplicationService] Status update for ${data.site.identifier}: ${monitorStatuses}`);
            logger.debug(`[ApplicationService] Sending status-update to renderer`);
            this.windowService.sendToRenderer("status-update", data);
        });

        // Monitor down alerts
        this.uptimeOrchestrator.on("site-monitor-down", ({ monitorId, site }: { monitorId: string; site: Site }) => {
            logger.debug(`[ApplicationService] Monitor down alert for ${site.identifier}, monitor: ${monitorId}`);
            this.notificationService.notifyMonitorDown(site, monitorId);
        });

        // Monitor up alerts
        this.uptimeOrchestrator.on("site-monitor-up", ({ monitorId, site }: { monitorId: string; site: Site }) => {
            logger.debug(`[ApplicationService] Monitor up alert for ${site.identifier}, monitor: ${monitorId}`);
            this.notificationService.notifyMonitorUp(site, monitorId);
        });

        // Database errors
        this.uptimeOrchestrator.on("db-error", ({ error, operation }: { error: Error; operation: string }) => {
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
            this.uptimeOrchestrator.stopMonitoring();
            this.windowService.closeMainWindow();
        } catch (error) {
            logger.error("[ApplicationService] Error during cleanup", error);
        }
    }
}
