/**
 * Main entry point for the Electron application.
 *
 * @remarks
 * Configures logging and initializes the main application service.
 * Sets up proper shutdown handlers for graceful cleanup.
 *
 * @packageDocumentation
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
 *
 * @remarks
 * Uses modular ApplicationService for clean separation of concerns and follows
 * the single responsibility principle. Handles application lifecycle management
 * including initialization, cleanup, and graceful shutdown.
 *
 * The class ensures that cleanup is performed only once even if multiple
 * shutdown events are triggered, preventing resource leaks and errors.
 */
class Main {
    /** Application service instance for managing app lifecycle and features */
    private readonly applicationService: ApplicationService;

    /**
     * Initialize the main application.
     *
     * @remarks
     * Sets up logging, creates application service, and configures cleanup handlers.
     * Establishes event listeners for both Node.js process events and Electron
     * app events to ensure proper cleanup in all shutdown scenarios.
     *
     * The cleanup is designed to be idempotent - safe to call multiple times
     * without side effects or errors.
     */
    constructor() {
        logger.info("Starting Uptime Watcher application");
        this.applicationService = new ApplicationService();

        // Ensure cleanup is only called once to prevent double-cleanup errors
        let cleanedUp = false;
        const safeCleanup = () => {
            if (!cleanedUp) {
                this.applicationService.cleanup();
                cleanedUp = true;
            }
        };

        // Setup cleanup on Node.js process exit to ensure graceful shutdown
        process.on("beforeExit", safeCleanup);

        // Also handle Electron's will-quit event for robust cleanup
        app.on("will-quit", safeCleanup);
    }
}

// Start the application
// Create Main instance and keep reference alive to prevent garbage collection.
// This is intentional - we need the instance to persist for the lifetime of the application.
new Main();
