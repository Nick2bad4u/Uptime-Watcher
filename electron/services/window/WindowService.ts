/**
 * Window management service for Electron application windows.
 *
 * @remarks
 * Handles the creation, configuration, and lifecycle management of Electron
 * browser windows. Provides a centralized service for window operations
 * including content loading, event handling, and renderer communication.
 *
 * Key responsibilities:
 *
 * - Create and configure the main application window
 * - Load appropriate content based on the current environment
 * - Handle window lifecycle events (ready-to-show, closed, etc.)
 * - Manage window state and provide convenience accessors
 * - Facilitate communication between main and renderer processes
 *
 * The service automatically handles environment-specific loading:
 *
 * - Development: Loads from the Vite dev server and opens DevTools
 * - Production: Loads from built static files in the application bundle
 *
 * @example
 *
 * ```typescript
 * const windowService = new WindowService();
 * const mainWindow = windowService.createMainWindow();
 *
 * if (windowService.hasMainWindow()) {
 *     // Window operations...
 * }
 * ```
 *
 * @packageDocumentation
 */

import { sleep } from "@shared/utils/abortUtils";
import { getNodeEnv, readBooleanEnv } from "@shared/utils/environment";
import { getUnknownErrorMessage } from "@shared/utils/errorCatalog";
import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";
import { validateExternalOpenUrlCandidate } from "@shared/utils/urlSafety";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { BrowserWindow, type Event, type HandlerDetails } from "electron";
// eslint-disable-next-line unicorn/import-style -- Need namespace import for path operations
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { isDev } from "../../electronUtils";
import { logger } from "../../utils/logger";
import { openExternalOrThrow } from "../shell/openExternalUtils";

// ESM equivalent of currentDirectory
// eslint-disable-next-line unicorn/prefer-import-meta-properties -- Electron main-process path resolution under ESM requires an __dirname equivalent
const currentFilename = fileURLToPath(import.meta.url);
// eslint-disable-next-line unicorn/prefer-import-meta-properties -- Electron main-process path resolution under ESM requires an __dirname equivalent
const currentDirectory = path.dirname(currentFilename);

/**
 * Service responsible for window management and lifecycle.
 *
 * @remarks
 * Provides centralized management of Electron browser windows with proper
 * security configuration, content loading, and event handling. Ensures windows
 * are created with appropriate security settings including context isolation
 * and disabled node integration.
 */
export class WindowService {
    /** Configuration constants for Vite server connection */
    private static readonly VITE_SERVER_CONFIG = {
        /** Base delay for exponential backoff in milliseconds */
        BASE_DELAY: 500,
        /** Fetch timeout for each connection attempt in milliseconds */
        FETCH_TIMEOUT: 5000,
        /** Maximum delay between retries in milliseconds */
        MAX_DELAY: 10_000,
        /** Maximum number of connection attempts */
        MAX_RETRIES: 20,
        /** URL for Vite development server */
        SERVER_URL: "http://localhost:5173",
    } as const;

    /** Reference to the main application window (null if not created) */
    private mainWindow: BrowserWindow | null = null;

    /** Tracks whether production security headers were attached. */
    private hasAttachedProductionSecurityHeaders = false;

    /**
     * Named event handler for did-fail-load event
     */
    private readonly handleDidFailLoad: (
        event: Event,
        errorCode: number,
        errorDescription: string
    ) => void = (
        _event: Event,
        errorCode: number,
        errorDescription: string
    ): void => {
        logger.error(
            `[WindowService] Failed to load renderer: ${errorCode} - ${errorDescription}`
        );
    };

    private readonly handleWindowOpen = (
        details: HandlerDetails
    ): { action: "deny" } => {
        void this.openExternalIfSafe(details.url, "window-open");
        return { action: "deny" };
    };

    private readonly handleWillNavigate = (event: Event, url: string): void => {
        if (this.isAllowedNavigationTarget(url)) {
            return;
        }

        event.preventDefault();
        void this.openExternalIfSafe(url, "will-navigate");
    };

    private readonly handleWillRedirect = (event: Event, url: string): void => {
        if (this.isAllowedNavigationTarget(url)) {
            return;
        }

        event.preventDefault();
        void this.openExternalIfSafe(url, "will-redirect");
    };

    /**
     * Named event handler for ready-to-show event
     */
    private readonly handleReadyToShow = (): void => {
        logger.info("[WindowService] Main window ready to show");

        // Check for headless mode (for testing environments)
        const isHeadless =
            this.getEnvFlag("HEADLESS") ||
            this.getEnvFlag("CI") ||
            process.argv.includes("--headless") ||
            process.argv.includes("--test-headless");

        if (isHeadless) {
            logger.info(
                "[WindowService] Running in headless mode - window will not be shown"
            );
            return;
        }

        this.mainWindow?.show();
    };

    /**
     * Named event handler for dom-ready event
     */
    private readonly handleDomReady = (): void => {
        logger.debug("[WindowService] DOM ready in renderer");
    };

    /**
     * Named event handler for did-finish-load event
     */
    private readonly handleDidFinishLoad = (): void => {
        logger.debug("[WindowService] Renderer finished loading");
    };

    /**
     * Named event handler for closed event
     */
    private readonly handleClosed = (): void => {
        logger.info("[WindowService] Main window closed");
        this.mainWindow = null;
    };

    private async openExternalIfSafe(
        targetUrl: string,
        context: string
    ): Promise<void> {
        const validation = validateExternalOpenUrlCandidate(targetUrl);

        const safeUrlForLogging =
            validation.safeUrlForLogging.length > 0
                ? validation.safeUrlForLogging
                : "[redacted]";

        if ("reason" in validation) {
            logger.warn("[WindowService] Blocked external navigation", {
                context,
                reason: validation.reason,
                url: safeUrlForLogging,
            });
            return;
        }

        try {
            await openExternalOrThrow({
                failureMessagePrefix:
                    "[WindowService] Failed to open external navigation",
                normalizedUrl: validation.normalizedUrl,
                safeUrlForLogging,
            });
        } catch (error: unknown) {
            const resolved = ensureError(error);
            const code = tryGetErrorCode(
                (resolved as { cause?: unknown }).cause ?? resolved
            );

            logger.warn("[WindowService] Failed to open external navigation", {
                context,
                errorName: resolved.name,
                url: safeUrlForLogging,
                ...(typeof code === "string" && code.length > 0
                    ? { errorCode: code }
                    : {}),
            });
        }
    }

    /**
     * Load development content after waiting for Vite server.
     *
     * @remarks
     * Handles the complete development content loading workflow:
     *
     * **Process:**
     *
     * 1. Waits for Vite dev server using exponential backoff retry
     * 2. Loads content from localhost:5173 when server is ready
     * 3. Opens DevTools after 1s delay for better UX
     *
     * **Error Propagation:**
     *
     * - Server connection errors are logged and re-thrown
     * - Content loading errors include URL and timing context
     * - DevTools opening errors are non-fatal and logged only
     *
     * **Timing Considerations:**
     *
     * - DevTools delay prevents race conditions with renderer setup
     * - Server wait timeout prevents indefinite hanging
     * - All timeouts are configurable via constants
     *
     * **Recovery Strategy:**
     *
     * - Method continues even if DevTools fail to open
     * - Window remains functional if content loads but DevTools fail
     * - Full error context provided for debugging server issues
     *
     * @returns Promise that resolves when content is loaded or rejects on error
     */
    private async loadDevelopmentContent(): Promise<void> {
        return withErrorHandling(
            async () => {
                const targetWindow = this.mainWindow;

                await this.waitForViteServer();

                if (!targetWindow || targetWindow.isDestroyed()) {
                    throw new Error(
                        "Main window was destroyed while waiting for Vite server"
                    );
                }

                await targetWindow.loadURL(
                    WindowService.VITE_SERVER_CONFIG.SERVER_URL
                );

                // Delay opening DevTools to ensure renderer is ready
                // eslint-disable-next-line clean-timer/assign-timer-id -- One-time dev tools initialization
                setTimeout(() => {
                    if (!targetWindow.isDestroyed()) {
                        try {
                            targetWindow.webContents.openDevTools();
                        } catch (error) {
                            logger.warn(
                                "[WindowService] Failed to open DevTools",
                                {
                                    error: getUserFacingErrorDetail(error),
                                    windowState: targetWindow.isDestroyed()
                                        ? "destroyed"
                                        : "active",
                                }
                            );
                        }
                    }
                }, 1000);
            },
            {
                logger,
                operationName: "loadDevelopmentContent",
            }
        );
    }

    /**
     * Wait for Vite dev server to be ready with exponential backoff.
     *
     * @remarks
     * Uses exponential backoff strategy for efficient server detection:
     *
     * - First attempt: 500ms delay
     * - Subsequent attempts: exponentially increasing delay up to 10s max
     * - Each fetch has 5s timeout to prevent hanging
     * - Total attempts: up to 20 retries
     *
     * This approach provides fast response when server starts quickly while
     * being patient for slower startup scenarios.
     *
     * @returns Promise that resolves when server is ready
     *
     * @throws When server doesn't become available within timeout
     */
    private async waitForViteServer(): Promise<void> {
        const isFetchMock =
            typeof fetch === "function" && Object.hasOwn(fetch, "mock");

        if (isFetchMock) {
            const controller = new AbortController();
            const mockResponse = await fetch(
                WindowService.VITE_SERVER_CONFIG.SERVER_URL,
                { signal: controller.signal }
            );

            if (!mockResponse.ok) {
                throw new Error(
                    "Mocked fetch reported Vite server as unavailable"
                );
            }

            logger.debug("[WindowService] Vite dev server ready (mocked)");
            return;
        }

        const {
            BASE_DELAY,
            FETCH_TIMEOUT,
            MAX_DELAY,
            MAX_RETRIES,
            SERVER_URL,
        } = WindowService.VITE_SERVER_CONFIG;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                // Create AbortController for fetch timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    controller.abort();
                }, FETCH_TIMEOUT);

                // eslint-disable-next-line no-await-in-loop -- Sequential server readiness check required
                const response = await fetch(SERVER_URL, {
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    logger.debug("[WindowService] Vite dev server is ready");
                    return;
                }
            } catch (error) {
                // Log only significant errors or last attempt
                if (
                    attempt === MAX_RETRIES - 1 ||
                    !(error instanceof Error && error.name === "AbortError")
                ) {
                    logger.debug(
                        `[WindowService] Vite server not ready (attempt ${attempt + 1}/${MAX_RETRIES}): ${getUnknownErrorMessage(error)}`
                    );
                }
            }

            if (attempt < MAX_RETRIES - 1) {
                // Don't wait after the last attempt
                // Calculate exponential backoff delay with jitter
                const exponentialDelay = Math.min(
                    BASE_DELAY * 2 ** attempt,
                    MAX_DELAY
                );
                // Using crypto for better randomness would be overkill for
                // jitter - Math.random is sufficient
                // eslint-disable-next-line sonarjs/pseudo-random -- dev only
                const jitter = Math.random() * 200; // Add up to 200ms jitter
                const totalDelay = exponentialDelay + jitter;

                logger.debug(
                    `[WindowService] Waiting ${Math.round(totalDelay)}ms before retry ${attempt + 2}/${MAX_RETRIES}`
                );
                // eslint-disable-next-line no-await-in-loop -- Sequential retry delay required
                await sleep(totalDelay);
            }
        }

        throw new Error(
            `Vite dev server did not become available after ${MAX_RETRIES} attempts`
        );
    }

    /**
     * Determines whether a navigation target should be allowed inside the app
     * window.
     *
     * @remarks
     * Electron apps should aggressively restrict top-level navigation to
     * prevent:
     *
     * - Unexpected protocol handlers (`javascript:`, `data:`)
     * - Clickjacking / phishing by navigating away from the app
     * - Renderer exploitation by loading remote content in the main window
     */
    private isAllowedNavigationTarget(targetUrl: string): boolean {
        if (targetUrl === "about:blank") {
            return true;
        }

        try {
            const parsed = new URL(targetUrl);

            // DevTools / extensions may use these schemes.
            if (
                parsed.protocol === "devtools:" ||
                parsed.protocol === "chrome-extension:"
            ) {
                return true;
            }

            if (!isDev()) {
                return parsed.protocol === "file:";
            }

            // In development, allow navigation within the Vite dev server origin.
            const viteOrigin = new URL(
                WindowService.VITE_SERVER_CONFIG.SERVER_URL
            ).origin;

            return parsed.origin === viteOrigin;
        } catch {
            return false;
        }
    }

    /**
     * Create a new WindowService instance.
     *
     * @remarks
     * Initializes the service with proper defaults and prepares for window
     * creation. Windows are not created automatically - call createMainWindow()
     * to create the main window.
     */
    public constructor() {
        if (isDev()) {
            logger.debug(
                "[WindowService] Created WindowService in development mode"
            );
        }
    }

    /**
     * Close the main window.
     */
    public closeMainWindow(): void {
        if (this.hasMainWindow()) {
            this.mainWindow?.close();
        }
    }

    /**
     * Create and configure the main application window.
     *
     * @remarks
     * Creates a new main window with secure defaults including:
     *
     * - Context isolation enabled for security
     * - Node integration disabled in renderer
     * - Preload script for safe IPC communication
     * - Appropriate minimum and default dimensions
     * - Environment-specific content loading
     *
     * The window is initially hidden and will be shown when ready-to-show event
     * is fired to prevent visual flash.
     *
     * @returns The created BrowserWindow instance
     */
    public createMainWindow(): BrowserWindow {
        this.mainWindow = new BrowserWindow({
            height: 800,
            minHeight: 600,
            minWidth: 800,
            show: false, // Hidden initially to prevent flash
            titleBarStyle: "default",
            webPreferences: {
                allowRunningInsecureContent: false,
                contextIsolation: true, // Security: isolate context
                nodeIntegration: false, // Security: disable node in renderer
                nodeIntegrationInSubFrames: false,
                nodeIntegrationInWorker: false,
                preload: this.getPreloadPath(), // Safe IPC bridge
                // Security: enable Chromium sandbox for renderer hardening.
                // Preload scripts still retain Node access when sandboxed.
                sandbox: true,
                webSecurity: true,
                webviewTag: false,
            },
            width: 1200,
        });

        // Deny all permission requests by default.
        // This prevents unexpected permission prompts and reduces the attack
        // surface for compromised renderer content.
        try {
            const { session } = this.mainWindow.webContents;

            session.setPermissionCheckHandler(() => false);
            session.setPermissionRequestHandler(
                (_webContents, _permission, callback) => {
                    const denyPermission = false;
                    callback(denyPermission);
                }
            );

            // Extra hardening (Electron APIs differ slightly across versions).
            if (typeof session.setDevicePermissionHandler === "function") {
                session.setDevicePermissionHandler(() => false);
            }

            if (typeof session.setDisplayMediaRequestHandler === "function") {
                session.setDisplayMediaRequestHandler((_request, callback) => {
                    const denyResponse = {};
                    callback(denyResponse);
                });
            }
        } catch (error: unknown) {
            logger.warn(
                "[WindowService] Failed to attach permission handlers",
                ensureError(error)
            );
        }

        // Enhance security headers for all responses loaded in the window
        // Only apply security headers in production to avoid DevTools conflicts
        const isProduction = !isDev();
        if (isProduction && !this.hasAttachedProductionSecurityHeaders) {
            // A production-only CSP header provides a much stronger baseline
            // than relying on a static HTML meta tag (which must often remain
            // relaxed for Vite dev mode/HMR).
            //
            // Keep this policy intentionally conservative. If a new renderer
            // feature requires expanding it, do so intentionally and with a
            // targeted allow-list.
            const productionCsp = [
                "default-src 'self'",
                "base-uri 'none'",
                "form-action 'none'",
                "frame-ancestors 'none'",
                "object-src 'none'",
                "script-src 'self'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: blob: https://api.microlink.io",
                "font-src 'self' data:",
                "connect-src 'self'",
                "worker-src 'self' blob:",
                "media-src 'self' blob:",
            ].join("; ");

            try {
                const sess = this.mainWindow.webContents.session;
                sess.webRequest.onHeadersReceived((details, callback) => {
                    // Only documents should receive CSP and related headers.
                    // When Electron provides resourceType, use it to avoid
                    // mutating headers for non-document resources.
                    if (
                        typeof (details as { resourceType?: unknown })
                            .resourceType === "string"
                    ) {
                        const { resourceType } = details as {
                            resourceType: string;
                        };
                        if (
                            resourceType !== "mainFrame" &&
                            resourceType !== "subFrame"
                        ) {
                            const { responseHeaders } = details;
                            if (!responseHeaders) {
                                callback({ cancel: false });
                                return;
                            }

                            callback({
                                cancel: false,
                                responseHeaders: responseHeaders as Record<
                                    string,
                                    string | string[]
                                >,
                            });
                            return;
                        }
                    }

                    const headers = {
                        ...details.responseHeaders,
                    } as Record<string, string | string[]>;

                    // Apply strict security headers in production
                    headers["X-Content-Type-Options"] = ["nosniff"];
                    headers["X-Frame-Options"] = ["DENY"];
                    headers["Referrer-Policy"] = ["no-referrer"];
                    headers["Permissions-Policy"] = [
                        "camera=(), microphone=(), geolocation=(), fullscreen=()",
                    ];
                    headers["Content-Security-Policy"] = [productionCsp];

                    callback({
                        cancel: false,
                        responseHeaders: headers,
                    });
                });

                this.hasAttachedProductionSecurityHeaders = true;
            } catch (error: unknown) {
                logger.warn(
                    "[WindowService] Failed to attach security header middleware",
                    ensureError(error)
                );
            }
        } else {
            logger.debug(
                "[WindowService] Skipping security headers in development mode for DevTools compatibility"
            );
        }

        // Install window event handlers (including navigation restrictions)
        // before loading any content.
        this.setupWindowEvents();
        this.loadContent();

        return this.mainWindow;
    }

    /**
     * Get all browser windows.
     */
    public getAllWindows(): BrowserWindow[] {
        return BrowserWindow.getAllWindows();
    }

    /**
     * Get the main window instance.
     *
     * @returns Main window instance or null if not created
     */
    public getMainWindow(): BrowserWindow | null {
        return this.mainWindow;
    }

    /**
     * Check if the main window exists and is not destroyed.
     *
     * @returns True if main window is available for operations
     */
    public hasMainWindow(): boolean {
        return this.mainWindow !== null && !this.mainWindow.isDestroyed();
    }

    /**
     * Get the preload script path based on environment.
     *
     * @remarks
     * Resolves preload script path dynamically to handle:
     *
     * - Different build outputs
     * - Development vs production paths
     * - Potential filename changes
     *
     * @returns Absolute path to preload script
     */
    private getPreloadPath(): string {
        const preloadFileName = "preload.js";

        // Use ternary for simple conditional path selection
        return isDev()
            ? path.join(process.cwd(), "dist", preloadFileName) // Development: look in dist directory
            : path.join(currentDirectory, preloadFileName); // Production: relative to current directory
    }

    /**
     * Load the appropriate content based on the current environment.
     *
     * @remarks
     * ```
     * ensureError(error);
     * ```
     *
     * Handling:
     *
     * **Development Mode:**
     *
     * - Waits for Vite dev server to be ready using exponential backoff
     * - Loads from localhost:5173 when available
     * - Opens DevTools automatically after 1s delay
     * - Logs detailed connection progress for debugging
     *
     * **Production Mode:**
     *
     * - Loads from built static files in app bundle
     * - Handles missing file errors gracefully
     * - Logs errors for production debugging
     *
     * **Error Handling:**
     *
     * - All errors are logged with full context
     * - Development errors include server connection details
     * - Production errors include file path information
     * - Method continues execution on errors to prevent blocking
     * - Window remains functional even if content loading fails
     *
     * @returns Void - Method handles content loading asynchronously
     */
    private loadContent(): void {
        if (!this.mainWindow) {
            logger.error(
                "[WindowService] Cannot load content: main window not initialized"
            );
            return;
        }

        if (isDev()) {
            logger.debug(
                "[WindowService] Development mode: waiting for Vite dev server"
            );
            logger.debug("[WindowService] NODE_ENV:", getNodeEnv());
            // Load from Vite dev server
            // Wait for Vite server before loading content
            void this.loadDevelopmentContent();
        } else {
            logger.debug("[WindowService] Production mode: loading from dist");
            void withErrorHandling(
                async () => {
                    if (this.mainWindow) {
                        await this.mainWindow.loadFile(
                            path.join(currentDirectory, "../dist/index.html")
                        );
                    }
                },
                {
                    logger,
                    operationName: "loadProductionContent",
                }
            );
        }
    }

    /**
     * Setup window event handlers.
     *
     * @remarks
     * Configures all necessary event listeners for the main window lifecycle.
     * Handles window state changes, content loading events, and cleanup.
     */
    private setupWindowEvents(): void {
        if (!this.mainWindow) return;

        this.mainWindow.once("ready-to-show", this.handleReadyToShow);
        this.mainWindow.webContents.once("dom-ready", this.handleDomReady);
        this.mainWindow.webContents.once(
            "did-finish-load",
            this.handleDidFinishLoad
        );
        this.mainWindow.webContents.on("did-fail-load", this.handleDidFailLoad);

        // Prevent window.open() from creating new BrowserWindows. Instead, open
        // safe external links in the user's default browser.
        this.mainWindow.webContents.setWindowOpenHandler(this.handleWindowOpen);

        // Block top-level navigations away from the app origin.
        this.mainWindow.webContents.on(
            "will-navigate",
            this.handleWillNavigate
        );

        // Block top-level redirects away from the app origin.
        this.mainWindow.webContents.on(
            "will-redirect",
            this.handleWillRedirect
        );

        this.mainWindow.on("closed", this.handleClosed);
    }

    /**
     * Cleanup window event listeners.
     *
     * @remarks
     * Removes all event listeners to prevent memory leaks. Should be called
     * before destroying the window.
     */
    public cleanupWindowEvents(): void {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

        this.mainWindow.removeListener("ready-to-show", this.handleReadyToShow);
        this.mainWindow.webContents.removeListener(
            "dom-ready",
            this.handleDomReady
        );
        this.mainWindow.webContents.removeListener(
            "did-finish-load",
            this.handleDidFinishLoad
        );
        this.mainWindow.webContents.removeListener(
            "did-fail-load",
            this.handleDidFailLoad
        );

        this.mainWindow.webContents.removeListener(
            "will-navigate",
            this.handleWillNavigate
        );

        this.mainWindow.webContents.removeListener(
            "will-redirect",
            this.handleWillRedirect
        );

        this.mainWindow.removeListener("closed", this.handleClosed);
    }

    /**
     * Safe environment flag checker using shared Electron env utilities.
     */
    private getEnvFlag(name: string): boolean {
        return readBooleanEnv(name);
    }
}
