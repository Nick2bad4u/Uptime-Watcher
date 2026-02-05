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

import { getNodeEnv, readBooleanEnv } from "@shared/utils/environment";
import { getUnknownErrorMessage } from "@shared/utils/errorCatalog";
import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";
import { withRetry } from "@shared/utils/retry";
import { validateExternalOpenUrlCandidate } from "@shared/utils/urlSafety";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import {
    BrowserWindow,
    type Event,
    type HandlerDetails,
    type WebPreferences,
} from "electron";
import { randomInt } from "node:crypto";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { isDev } from "../../electronUtils";
import { logger } from "../../utils/logger";
import { openExternalOrThrow } from "../shell/openExternalUtils";
import {
    getProductionDistDirectory,
    isPathWithinDirectory,
} from "./utils/pathGuards";
import {
    applyProductionDocumentSecurityHeaders,
    getProductionCspHeaderValue,
} from "./utils/productionSecurityHeaders";

/**
 * Absolute directory path for this module.
 *
 * @remarks
 * Do not use `import.meta.dirname` because bundlers may not preserve it.
 * Prefer deriving it from `import.meta.url`, which is robust in both Node ESM
 * and bundled builds.
 */
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

const PRODUCTION_DIST_DIRECTORY = getProductionDistDirectory(currentDirectory);

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

    /** Tracks permission types we've already logged to avoid log spam. */
    private readonly loggedDeniedPermissions = new Set<string>();

    /** Tracks whether display media denial has been logged. */
    private hasLoggedDisplayMediaDenial = false;

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
     * Prevent attaching `<webview>` tags.
     *
     * @remarks
     * Even with `webPreferences.webviewTag = false`, explicitly denying
     * attachment provides defense-in-depth against unexpected Electron
     * regressions or future configuration drift.
     */
    private readonly handleWillAttachWebview = (
        event: Event,
        _webPreferences: WebPreferences,
        params: Record<string, string>
    ): void => {
        event.preventDefault();
        logger.warn("[WindowService] Blocked webview attachment", {
            src: typeof params["src"] === "string" ? params["src"] : "",
        });
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
                const devToolsTimer = setTimeout(() => {
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
                devToolsTimer.unref();
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

        class ViteDevServerNotReadyError extends Error {
            public override readonly name = "ViteDevServerNotReadyError";

            public constructor(message: string) {
                super(message);
            }
        }

        const JITTER_MS = 200;

        try {
            await withRetry(
                async () => {
                    // Create AbortController for fetch timeout
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => {
                        controller.abort();
                    }, FETCH_TIMEOUT);

                    try {
                        const response = await fetch(SERVER_URL, {
                            signal: controller.signal,
                        });

                        if (response.ok) {
                            logger.debug(
                                "[WindowService] Vite dev server is ready"
                            );
                            return;
                        }

                        // Preserve previous behavior: non-OK responses are
                        // treated as "not ready" without log spam.
                        throw new ViteDevServerNotReadyError(
                            `Vite dev server returned ${response.status}`
                        );
                    } finally {
                        clearTimeout(timeoutId);
                    }
                },
                {
                    delayMs: ({ attempt }) => {
                        // Calculate exponential backoff delay with jitter.
                        const exponentialDelay = Math.min(
                            BASE_DELAY * 2 ** (attempt - 1),
                            MAX_DELAY
                        );

                        // Use a cryptographically strong RNG to avoid
                        // pseudo-random lints (and because it's essentially
                        // free at this scale).
                        const jitter = randomInt(0, JITTER_MS + 1);

                        return exponentialDelay + jitter;
                    },
                    maxRetries: MAX_RETRIES,
                    onError: (error, attempt) => {
                        const resolved = ensureError(error);
                        // Log only significant errors or last attempt.
                        if (
                            attempt === MAX_RETRIES ||
                            (resolved.name !== "AbortError" &&
                                resolved.name !== "ViteDevServerNotReadyError")
                        ) {
                            logger.debug(
                                `[WindowService] Vite server not ready (attempt ${attempt}/${MAX_RETRIES}): ${getUnknownErrorMessage(resolved)}`
                            );
                        }
                    },
                    onFailedAttempt: ({ attempt, delayMs }) => {
                        logger.debug(
                            `[WindowService] Waiting ${Math.round(delayMs)}ms before retry ${attempt + 1}/${MAX_RETRIES}`
                        );
                    },
                }
            );
        } catch (error) {
            throw new Error(
                `Vite dev server did not become available after ${MAX_RETRIES} attempts`,
                { cause: error }
            );
        }
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
                if (parsed.protocol !== "file:") {
                    return false;
                }

                const targetPath = fileURLToPath(parsed);
                return isPathWithinDirectory(
                    targetPath,
                    PRODUCTION_DIST_DIRECTORY
                );
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
        const existingWindow = this.mainWindow;
        if (existingWindow) {
            logger.warn(
                "[WindowService] Main window already exists; returning existing instance"
            );
            return existingWindow;
        }

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
                // Keep the preload surface minimal and avoid Node.js built-ins.
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
                (_webContents, permission, grantPermission) => {
                    if (!this.loggedDeniedPermissions.has(permission)) {
                        this.loggedDeniedPermissions.add(permission);
                        logger.warn(
                            "[WindowService] Denied permission request",
                            { permission }
                        );
                    }

                    // Electron expects a boolean "grant" flag here, not an
                    // error-first Node.js callback.
                    grantPermission(false);
                }
            );

            // Extra hardening (Electron APIs differ slightly across versions).
            if (typeof session.setDevicePermissionHandler === "function") {
                session.setDevicePermissionHandler(() => false);
            }

            if (typeof session.setDisplayMediaRequestHandler === "function") {
                session.setDisplayMediaRequestHandler((_request, callback) => {
                    if (!this.hasLoggedDisplayMediaDenial) {
                        this.hasLoggedDisplayMediaDenial = true;
                        logger.warn(
                            "[WindowService] Denied display media (screen capture) request"
                        );
                    }

                    // Deny by providing no stream targets.
                    // (With exactOptionalPropertyTypes enabled, explicitly
                    // assigning `undefined` is not allowed for optional
                    // properties. Omitting the keys is the typed way to deny.)
                    callback({});
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
            const productionCsp = getProductionCspHeaderValue();

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

                    const headers = details.responseHeaders as
                        | Record<string, string | string[]>
                        | undefined;

                    const responseHeaders =
                        applyProductionDocumentSecurityHeaders({
                            productionCsp,
                            responseHeaders: headers,
                        });

                    callback({
                        cancel: false,
                        responseHeaders,
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
    public loadContent(): void {
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

        // Extra defense-in-depth: never allow webview tags.
        this.mainWindow.webContents.on(
            "will-attach-webview",
            this.handleWillAttachWebview
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

        this.mainWindow.webContents.removeListener(
            "will-attach-webview",
            this.handleWillAttachWebview
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
