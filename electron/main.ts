/**
 * Main entry point for the Electron application.
 * Sets up proper shutdown handlers for graceful cleanup.
 *
 * @packageDocumentation
 * @remarks
 * contextIsolation is enabled and uses preload scripts for secure logging.
 */

import { app } from "electron";
import { installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from "electron-devtools-installer";
import log from "electron-log/main";

import { ApplicationService } from "./services/application/ApplicationService";
import { logger } from "./utils/logger";

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
        logger.info("Starting Uptime Watcher application"); /* v8 ignore next */
        this.applicationService = new ApplicationService();

        // Ensure cleanup is only called once to prevent double-cleanup errors
        let cleanedUp = false;
        const safeCleanup = () => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!cleanedUp && this.applicationService?.cleanup) {
                cleanedUp = true;
                this.applicationService.cleanup().catch((error) => {
                    logger.error("[Main] Cleanup failed", error); /* v8 ignore next */
                });
            }
        };

        // Setup cleanup on Node.js process exit to ensure graceful shutdown.
        // Note: 'beforeExit' may not fire in all shutdown scenarios (e.g., forced kills or SIGKILL).
        // It is best-effort and should be combined with Electron's 'will-quit' for robustness.
        process.on("beforeExit", safeCleanup);

        // Also handle Electron's will-quit event for robust cleanup
        app.on("will-quit", safeCleanup);
    }
}

// Start the application
/**
 * Intentionally not assigning the Main instance to a variable.
 * This ensures the instance persists for the application's lifetime,
 * preventing premature garbage collection and maintaining lifecycle handlers.
 */
// eslint-disable-next-line sonarjs/constructor-for-side-effects -- Main instance needed for lifecycle management
new Main();

void app.whenReady().then(async () => {
    // Wait a bit for the main window to be created and ready
    await new Promise((resolve) => setTimeout(resolve, 1));

    try {
        const extensions = await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS], {
            loadExtensionOptions: { allowFileAccess: true },
        });
        logger.info(`[Main] Added Extensions: ${extensions.map((ext) => ext.name).join(", ")}`);
        return extensions;
    } catch (error) {
        logger.warn("[Main] Failed to install dev extensions (this is normal in production)", error);
        return [];
    }
});
