/**
 * Main entry point for the Electron application.
 *
 * @remarks
 * Sets up logging, initializes the application service, and configures shutdown handlers
 * for graceful cleanup. Uses context isolation and preload scripts for secure logging.
 *
 * @packageDocumentation
 */

import { app, BrowserWindow } from "electron";
import {
    installExtension,
    REACT_DEVELOPER_TOOLS,
    REDUX_DEVTOOLS,
} from "electron-devtools-installer";
import log from "electron-log/main";

import { isDev } from "./electronUtils";
import { ApplicationService } from "./services/application/ApplicationService";
import { logger } from "./utils/logger";

// Configure electron-log for main process
// Configure logging based on environment and command line arguments
const configureLogging = (): {
    consoleLevel: ElectronLogLevel;
    fileLevel: ElectronLogLevel;
} => {
    // Check for debug flag in command line arguments
    const args = new Set(process.argv.slice(2));
    const debugFlag = args.has("--debug") || args.has("--log-debug");
    const productionFlag =
        args.has("--log-production") || args.has("--log-prod");
    const infoFlag = args.has("--log-info");

    // Determine log level based on flags and environment
    // eslint-disable-next-line @typescript-eslint/init-declarations
    let consoleLevel: ElectronLogLevel;
    // eslint-disable-next-line @typescript-eslint/init-declarations
    let fileLevel: ElectronLogLevel;

    if (debugFlag) {
        consoleLevel = "debug";
        fileLevel = "debug";
        console.log("[LOGGING] Debug logging enabled via command line flag");
    } else if (productionFlag) {
        consoleLevel = "info";
        fileLevel = "warn";
        console.log(
            "[LOGGING] Production logging level enabled via command line flag"
        );
    } else if (infoFlag) {
        consoleLevel = "info";
        fileLevel = "info";
        console.log(
            "[LOGGING] Info logging level enabled via command line flag"
        );
    } else {
        // Default development behavior
        const isDevMode = !app.isPackaged;
        consoleLevel = isDevMode ? "debug" : "info";
        fileLevel = isDevMode ? "info" : "warn";
        console.log(
            `[LOGGING] Default logging: console=${consoleLevel}, file=${fileLevel} (isDev=${isDevMode})`
        );
    }

    return { consoleLevel, fileLevel };
};

// Enable preload mode for reliable logging in Electron's main process, especially with context isolation enabled
log.initialize({ preload: true });

type ElectronLogLevel =
    | "debug"
    | "error"
    | "info"
    | "silly"
    | "verbose"
    | "warn";

const ELECTRON_LOG_FILE = "uptime-watcher-main.log" as const;
const LOG_FILE_MAX_SIZE = 1024 ** 2 * 5; // 5MB max file size
const LOG_FILE_FORMAT: string =
    "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";
const LOG_CONSOLE_FORMAT: string = "[{h}:{i}:{s}.{ms}] [{level}] {text}";

const { consoleLevel, fileLevel } = configureLogging();
log.transports.file.level = fileLevel;
log.transports.console.level = consoleLevel;
log.transports.file.fileName = ELECTRON_LOG_FILE;
log.transports.file.maxSize = LOG_FILE_MAX_SIZE;
log.transports.file.format = LOG_FILE_FORMAT;
log.transports.console.format = LOG_CONSOLE_FORMAT;

// Hot reload for preload scripts (development only)
if (isDev()) {
    /**
     * Handle hot reload messages from vite-plugin-electron
     * @param msg - Message from the plugin
     */
    const handleHotReload = (msg: unknown): void => {
        if (msg === "electron-vite&type=hot-reload") {
            for (const win of BrowserWindow.getAllWindows()) {
                // Hot reload preload scripts
                win.webContents.reload();
            }
        }
    };
    /**
     * Clean up the hot reload listener on app quit
     */
    const handleCleanup = (): void => {
        process.off("message", handleHotReload);
        app.off("before-quit", handleCleanup); // <-- Remove the before-quit listener
    };
    process.on("message", handleHotReload);
    app.on("before-quit", handleCleanup);
}

/**
 * Main application class that initializes and manages the Electron app.
 *
 * @remarks
 * Uses a modular {@link ApplicationService} for clean separation of concerns and follows
 * the single responsibility principle. Handles application lifecycle management,
 * including initialization, cleanup, and graceful shutdown.
 *
 * Ensures that cleanup is performed only once, even if multiple shutdown events are triggered,
 * to prevent resource leaks and errors.
 */
class Main {
    /** Application service instance for managing app lifecycle and features */
    private readonly applicationService: ApplicationService;

    /** Flag to ensure cleanup is only called once */
    private cleanedUp = false;

    /**
     * Named event handler for safe cleanup on process exit.
     */
    private readonly handleProcessExit = (): void => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!this.cleanedUp && this.applicationService?.cleanup) {
            this.cleanedUp = true;
            void (async (): Promise<void> => {
                try {
                    await this.applicationService.cleanup();
                } catch (error) {
                    logger.error("[Main] Cleanup failed", error);
                    throw error;
                }
            })();
        }
    };

    /**
     * Named event handler for safe cleanup on app quit.
     */
    private readonly handleAppQuit = (): void => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!this.cleanedUp && this.applicationService?.cleanup) {
            this.cleanedUp = true;
            void (async (): Promise<void> => {
                try {
                    await this.applicationService.cleanup();
                } catch (error) {
                    logger.error("[Main] Cleanup failed", error);
                    throw error;
                }
            })();
        }
    };

    /**
     * Constructs the main application and sets up shutdown handlers.
     *
     * @remarks
     * Sets up logging, creates the application service, and configures cleanup handlers.
     * Establishes event listeners for both Node.js process events and Electron
     * app events to ensure proper cleanup in all shutdown scenarios.
     *
     * The cleanup is designed to be idempotent—safe to call multiple times
     * without side effects or errors.
     *
     * @throws {@link Error} If cleanup fails, the error is logged and re-thrown.
     */
    public constructor() {
        logger.info("Starting Uptime Watcher application");
        this.applicationService = new ApplicationService();

        // Setup cleanup on Node.js process exit to ensure graceful shutdown.
        // Note: 'beforeExit' may not fire in all shutdown scenarios (e.g., forced kills or SIGKILL).
        // It is best-effort and should be combined with Electron's 'will-quit' for robustness.
        process.on("beforeExit", this.handleProcessExit);

        // Also handle Electron's will-quit event for robust cleanup
        app.on("will-quit", this.handleAppQuit);
    }

    /**
     * Removes event listeners to prevent memory leaks.
     * Called during application shutdown.
     */
    public removeEventListeners(): void {
        process.off("beforeExit", this.handleProcessExit);
        app.off("will-quit", this.handleAppQuit);
    }
}

// Start the application
/**
 * @remarks
 * Intentionally not assigning the Main instance to a variable.
 * This ensures the instance persists for the application's lifetime,
 * preventing premature garbage collection and maintaining lifecycle handlers.
 */
if (process.versions.electron) {
    // eslint-disable-next-line sonarjs/constructor-for-side-effects -- Main instance needed for lifecycle management
    new Main();

    /**
     * Installs React and Redux DevTools extensions after the Electron app is ready.
     *
     * @remarks
     * Extensions are installed only after {@link app.whenReady} to ensure the Electron environment is fully initialized,
     * as extension installation requires the app to be ready. In development, these extensions enhance debugging capabilities.
     *
     * @returns Promise\<Array\<\{id: string; name: string\}\>\> The installed extension references, or an empty array in production or on failure.
     *
     * @example
     * ```typescript
     * // Extensions are installed automatically in development mode.
     * ```
     */
    void (async (): Promise<Array<{ id: string; name: string }>> => {
        await app.whenReady();
        // Wait a bit for the main window to be created and ready
        await new Promise((resolve) => setTimeout(resolve, 1));

        if (isDev()) {
            try {
                const extensions = await installExtension(
                    [REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS],
                    {
                        loadExtensionOptions: { allowFileAccess: true },
                    }
                );
                logger.info(
                    `[Main] Added Extensions: ${extensions.map((ext) => ext.name).join(", ")}`
                );
                return extensions;
            } catch (error) {
                logger.warn(
                    "[Main] Failed to install dev extensions (this is normal in production)",
                    error
                );
                return [];
            }
        }
        return []; // No extensions in production
    })();
}
