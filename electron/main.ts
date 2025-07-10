/**
 * Main entry point for the Electron application.
 * Configures logging and initializes the application service.
 */

import log from "electron-log/main";

import { app } from "electron";
import { ApplicationService, logger } from "./index";

// Configure electron-log for main process
// Enable preload mode for reliable logging in Electron's main process, especially with context isolation enabled
log.initialize({ preload: true });
log.transports.file.level = "info";
log.transports.console.level = "debug";
log.transports.file.fileName = "uptime-watcher-main.log";
log.transports.file.maxSize = 1024 * 1024 * 5; // 5MB max file size
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";
log.transports.console.format = "[{h}:{i}:{s}.{ms}] [{level}] {text}";

/**
 * Main application class that initializes and manages the Electron app.
 * Uses modular ApplicationService for clean separation of concerns.
 */
class Main {
    /** Application service instance for managing app lifecycle and features */
    private readonly applicationService: ApplicationService;

    /**
     * Initialize the main application.
     * Sets up logging, creates application service, and configures cleanup handlers.
     */
    constructor() {
        logger.info("Starting Uptime Watcher application");
        this.applicationService = new ApplicationService();

        // Ensure cleanup is only called once
        let cleanedUp = false;
        const safeCleanup = () => {
            if (!cleanedUp) {
                this.applicationService.cleanup();
                cleanedUp = true;
            }
        };

        // Setup cleanup on app quit to ensure graceful shutdown
        process.on("beforeExit", safeCleanup);

        // Also handle Electron's will-quit event for robust cleanup
        app.on("will-quit", safeCleanup);
    }
}

// Start the application
// which is intentional in this case since we just need to keep the reference
// alive to prevent garbage collection.
new Main();
