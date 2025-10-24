/**
 * Main entry point for the Electron application.
 *
 * @remarks
 * Sets up logging, initializes the application service, and configures shutdown
 * handlers for graceful cleanup. Uses context isolation and preload scripts for
 * secure logging.
 *
 * @packageDocumentation
 */

import type { BrowserWindow } from "electron";

import { ensureError } from "@shared/utils/errorHandling";
import { app } from "electron";
import debug from "electron-debug";
import {
    installExtension,
    REACT_DEVELOPER_TOOLS,
    REDUX_DEVTOOLS,
} from "electron-devtools-installer";
import log from "electron-log/main";

import { isDev } from "./electronUtils";
import { ApplicationService } from "./services/application/ApplicationService";
import { ServiceContainer } from "./services/ServiceContainer";
import { logger } from "./utils/logger";

// Initialize electron-debug for enhanced debugging capabilities
debug({
    devToolsMode: "right", // Dock DevTools to the right by default
    isEnabled: isDev(), // Only enable in development mode
    showDevTools: isDev(), // Auto-open DevTools in development
});

// Configure electron-log for main process
/**
 * Configures logging levels based on environment and command line arguments.
 *
 * @remarks
 * Analyzes command line flags and environment to determine appropriate logging
 * levels for both console and file output. Supports debug, production, and info
 * level configurations.
 *
 * @returns Object containing console and file logging levels
 */
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
    return ((): {
        consoleLevel: ElectronLogLevel;
        fileLevel: ElectronLogLevel;
    } => {
        if (debugFlag) {
            const configuration = {
                consoleLevel: "debug" as ElectronLogLevel,
                fileLevel: "debug" as ElectronLogLevel,
            };
            logger.debug(
                "[Logging] Debug logging enabled via command line flag",
                configuration
            );
            return configuration;
        } else if (productionFlag) {
            const configuration = {
                consoleLevel: "info" as ElectronLogLevel,
                fileLevel: "warn" as ElectronLogLevel,
            };
            logger.info(
                "[Logging] Production logging level enabled via command line flag",
                configuration
            );
            return configuration;
        } else if (infoFlag) {
            const configuration = {
                consoleLevel: "info" as ElectronLogLevel,
                fileLevel: "info" as ElectronLogLevel,
            };
            logger.info(
                "[Logging] Info logging level enabled via command line flag",
                configuration
            );
            return configuration;
        }
        // Default development behavior
        const isDevMode = !app.isPackaged;
        const configuration = {
            consoleLevel: (isDevMode ? "debug" : "info") as ElectronLogLevel,
            fileLevel: (isDevMode ? "info" : "warn") as ElectronLogLevel,
        };
        logger.debug("[Logging] Using default logging configuration", {
            ...configuration,
            isDevMode,
        });
        return configuration;
    })();
};

// Enable preload mode for reliable logging in Electron's main process,
// especially with context isolation enabled
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

// Configure remote debugging for MCP electron server support
// Only enable remote debugging if not running in headless mode (tests)
if (
    (isDev() || process.argv.includes("--enable-mcp-debugging")) &&
    !process.env["HEADLESS"]
) {
    try {
        app.commandLine.appendSwitch("remote-debugging-port", "9222");
        logger.info(
            "[Main] Remote debugging enabled on port 9222 (Electron MCP)"
        );
    } catch (error) {
        logger.warn("[Main] Failed to set remote debugging port", error);
    }
}

// Hot reload for preload scripts (development only)
if (isDev()) {
    // Enhanced hot reload protection configuration
    const HOT_RELOAD_THROTTLE_MS = 1000; // Minimum time between individual reloads
    const MAX_RELOADS_PER_WINDOW = 5; // Maximum reloads in sliding window
    const RATE_LIMIT_WINDOW_MS = 10_000; // 10 seconds sliding window
    const CIRCUIT_BREAKER_TIMEOUT_MS = 30_000; // 30 seconds timeout in circuit breaker mode
    const PROGRESSIVE_BACKOFF_MULTIPLIER = 2; // Multiplier for progressive backoff

    // Hot reload state management
    let lastHotReloadTime = 0;
    let reloadHistory: number[] = []; // Track recent reload timestamps
    let isReloadInProgress = false;
    let circuitBreakerMode = false;
    let circuitBreakerUntil = 0;
    let circuitBreakerCount = 0;
    let reloadProgressTimer: NodeJS.Timeout | null = null;

    /**
     * Cleans old entries from reload history based on sliding window.
     */
    const cleanReloadHistory = (): void => {
        const now = Date.now();
        reloadHistory = reloadHistory.filter(
            (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
        );
    };

    /**
     * Checks if rate limit is exceeded within the sliding window.
     *
     * @returns True if rate limit is exceeded
     */
    const isRateLimitExceeded = (): boolean => {
        cleanReloadHistory();
        return reloadHistory.length >= MAX_RELOADS_PER_WINDOW;
    };

    /**
     * Activates circuit breaker mode with progressive backoff.
     */
    const activateCircuitBreaker = (): void => {
        circuitBreakerCount++;
        const backoffTime =
            CIRCUIT_BREAKER_TIMEOUT_MS *
            PROGRESSIVE_BACKOFF_MULTIPLIER **
                Math.min(circuitBreakerCount - 1, 3);

        circuitBreakerMode = true;
        circuitBreakerUntil = Date.now() + backoffTime;

        logger.warn(
            `[Main] Hot reload circuit breaker activated (attempt ${circuitBreakerCount}). ` +
                `Disabled for ${backoffTime / 1000} seconds due to excessive reload frequency.`
        );
    };

    /**
     * Checks and resets circuit breaker if timeout has passed.
     */
    const checkCircuitBreakerReset = (): void => {
        if (circuitBreakerMode && Date.now() > circuitBreakerUntil) {
            circuitBreakerMode = false;
            logger.info(
                "[Main] Hot reload circuit breaker reset - normal operation resumed"
            );
        }
    };

    /**
     * Handles hot reload messages from vite-plugin-electron with comprehensive
     * protection against infinite loops.
     *
     * @param msg - Message from the plugin
     */
    const handleHotReload = (msg: unknown): void => {
        if (msg !== "electron-vite&type=hot-reload") {
            return;
        }

        const now = Date.now();

        // Check if circuit breaker is active
        checkCircuitBreakerReset();
        if (circuitBreakerMode) {
            logger.debug("[Main] Hot reload blocked - circuit breaker active");
            return;
        }

        // Check if reload is already in progress
        if (isReloadInProgress) {
            logger.debug(
                "[Main] Hot reload blocked - reload already in progress"
            );
            return;
        }

        // Basic throttling - minimum time between reloads
        if (now - lastHotReloadTime < HOT_RELOAD_THROTTLE_MS) {
            logger.debug(
                "[Main] Hot reload throttled - too frequent (basic throttle)"
            );
            return;
        }

        // Rate limiting - check sliding window
        if (isRateLimitExceeded()) {
            logger.warn(
                `[Main] Hot reload rate limit exceeded (${MAX_RELOADS_PER_WINDOW} ` +
                    `reloads in ${RATE_LIMIT_WINDOW_MS / 1000}s window)`
            );
            activateCircuitBreaker();
            return;
        }

        // Proceed with hot reload
        isReloadInProgress = true;

        const container = ServiceContainer.getExistingInstance();
        if (!container) {
            logger.debug(
                "[Main] Hot reload skipped - service container not initialized"
            );
            isReloadInProgress = false;
            return;
        }

        let windows: BrowserWindow[] | null = null;

        try {
            windows = container.getWindowService().getAllWindows();
        } catch (error) {
            logger.error(
                "[Main] Failed to obtain WindowService for hot reload",
                ensureError(error)
            );
        }

        if (!windows || windows.length === 0) {
            logger.debug(
                "[Main] Hot reload skipped - no windows currently available"
            );
            isReloadInProgress = false;
            return;
        }

        lastHotReloadTime = now;
        reloadHistory.push(now);

        logger.info(
            `[Main] Performing hot reload (${reloadHistory.length}/${MAX_RELOADS_PER_WINDOW} in window)`
        );

        try {
            for (const win of windows) {
                win.webContents.reload();
            }
        } catch (error) {
            logger.error("[Main] Error during hot reload", ensureError(error));
        } finally {
            // Always reset reload progress flag, even on error
            if (reloadProgressTimer) {
                clearTimeout(reloadProgressTimer);
                reloadProgressTimer = null;
            }
            // Reset reload progress flag after a short delay
            reloadProgressTimer = setTimeout(() => {
                isReloadInProgress = false;
                reloadProgressTimer = null;
            }, 500); // 500ms timeout for reload operation
        }
    };
    /**
     * Cleans up the hot reload listener on app quit.
     */
    const handleCleanup = (): void => {
        process.off("message", handleHotReload);
        app.off("before-quit", handleCleanup); // <-- Remove the before-quit listener

        // Clean up any pending timer
        if (reloadProgressTimer) {
            clearTimeout(reloadProgressTimer);
            reloadProgressTimer = null;
        }
    };
    process.on("message", handleHotReload);
    app.on("before-quit", handleCleanup);
}

/**
 * Main application class that initializes and manages the Electron app.
 *
 * @remarks
 * Uses a modular {@link ApplicationService} for clean separation of concerns and
 * follows the single responsibility principle. Handles application lifecycle
 * management, including initialization, cleanup, and graceful shutdown.
 *
 * Ensures that cleanup is performed only once, even if multiple shutdown events
 * are triggered, to prevent resource leaks and errors.
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
        if (!this.cleanedUp) {
            this.cleanedUp = true;
            // Handle cleanup asynchronously without blocking process exit
            // Use setImmediate to avoid blocking the event loop
            setImmediate((): void => {
                void (async (): Promise<void> => {
                    try {
                        await this.performCleanup();
                    } catch (error: unknown) {
                        logger.error(
                            "[Main] Unexpected error during process exit cleanup",
                            error
                        );
                        // Log the error but don't prevent process exit
                    }
                })();
            });
        }
    };

    /**
     * Named event handler for safe cleanup on app quit.
     */
    private readonly handleAppQuit = (): void => {
        if (!this.cleanedUp) {
            this.cleanedUp = true;
            // Handle cleanup asynchronously during app quit
            setImmediate((): void => {
                void (async (): Promise<void> => {
                    try {
                        await this.performCleanup();
                    } catch (error: unknown) {
                        logger.error(
                            "[Main] Unexpected error during app quit cleanup",
                            error
                        );
                        // Don't throw - app is already quitting, just exit with error code
                        app.exit(1);
                    }
                })();
            });
        }
    };

    /**
     * Performs cleanup of application service.
     *
     * @returns Promise that resolves when cleanup is complete
     */
    private async performCleanup(): Promise<void> {
        try {
            await this.applicationService.cleanup();
        } catch (error) {
            logger.error("[Main] Cleanup failed", error);
            // Don't re-throw as this is called during shutdown
        }
    }

    /**
     * Constructs the main application and sets up shutdown handlers.
     *
     * @remarks
     * Sets up logging, creates the application service, and configures cleanup
     * handlers. Establishes event listeners for both Node.js process events and
     * Electron app events to ensure proper cleanup in all shutdown scenarios.
     *
     * The cleanup is designed to be idempotent—safe to call multiple times
     * without side effects or errors.
     *
     * @throws {@link Error} If cleanup fails, the error is logged and
     *   re-thrown.
     */
    public constructor() {
        logger.info("Starting Uptime Watcher application");
        this.applicationService = new ApplicationService();

        // Setup cleanup on Node.js process exit to ensure graceful shutdown.
        // Note: 'beforeExit' may not fire in all shutdown scenarios (e.g.,
        // forced kills or SIGKILL). It is best-effort and should be combined
        // with Electron's 'will-quit' for robustness.
        process.on("beforeExit", this.handleProcessExit);

        // Also handle Electron's will-quit event for robust cleanup
        app.on("will-quit", this.handleAppQuit);
    }

    /**
     * Removes event listeners to prevent memory leaks.
     *
     * @remarks
     * Called during application shutdown to clean up event listeners and
     * prevent memory leaks. Removes both Node.js process and Electron app event
     * listeners that were set up in the constructor.
     */
    public removeEventListeners(): void {
        process.off("beforeExit", this.handleProcessExit);
        app.off("will-quit", this.handleAppQuit);
    }
}

// Start the application
/**
 * @remarks
 * Intentionally not assigning the Main instance to a variable. This ensures the
 * instance persists for the application's lifetime, preventing premature
 * garbage collection and maintaining lifecycle handlers.
 */
if (process.versions.electron) {
    // eslint-disable-next-line sonarjs/constructor-for-side-effects, no-new -- Main instance needed for lifecycle management
    new Main();

    /**
     * Installs React and Redux DevTools extensions after the Electron app is
     * ready.
     *
     * @remarks
     * Extensions are installed only after {@link app.whenReady} to ensure the
     * Electron environment is fully initialized, as extension installation
     * requires the app to be ready. In development, these extensions enhance
     * debugging capabilities.
     *
     * @example
     *
     * ```typescript
     * // Extensions are installed automatically in development mode.
     * ```
     *
     * @returns `Promise<Array<{id: string; name: string}>>` The installed
     *   extension references, or an empty array in production or on failure.
     */
    void (async (): Promise<void> => {
        await app.whenReady();
        // Wait a bit for the main window to be created and ready
        await new Promise<void>((resolve) => {
            // Timer will complete immediately, cleanup not needed
            // eslint-disable-next-line clean-timer/assign-timer-id -- Timer completes with Promise resolution
            setTimeout(resolve, 1);
        });

        if (isDev()) {
            try {
                const extensions = await installExtension(
                    [
                        REDUX_DEVTOOLS,
                        REACT_DEVELOPER_TOOLS,
                        "jambeljnbnfbkcpnoiaedcabbgmnnlcd",
                    ],
                    {
                        loadExtensionOptions: { allowFileAccess: true },
                    }
                );
                logger.info(
                    `[Main] Added Extensions: ${extensions.map((ext) => ext.name).join(", ")}`
                );
            } catch (error) {
                logger.warn(
                    "[Main] Failed to install dev extensions (this is normal in production)",
                    error
                );
            }
        }
    })();
}
