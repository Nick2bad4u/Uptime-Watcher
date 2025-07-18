/**
 * Window management service for Electron application windows.
 *
 * @remarks
 * Handles the creation, configuration, and lifecycle management of Electron
 * browser windows. Provides a centralized service for window operations
 * including content loading, event handling, and communication with renderers.
 *
 * Key responsibilities:
 * - Create and configure the main application window
 * - Load appropriate content based on environment (dev/prod)
 * - Handle window lifecycle events (ready-to-show, closed, etc.)
 * - Manage window state and provide access methods
 * - Facilitate communication between main and renderer processes
 *
 * The service automatically handles environment-specific loading:
 * - Development: Loads from Vite dev server with DevTools
 * - Production: Loads from built static files
 *
 * @example
 * ```typescript
 * const windowService = new WindowService();
 * const mainWindow = windowService.createMainWindow();
 *
 * // Send data to renderer
 * windowService.sendToRenderer('status-update', { status: 'up' });
 *
 * // Check if window exists
 * if (windowService.hasMainWindow()) {
 *   // Window operations...
 * }
 * ```
 *
 * @packageDocumentation
 */

import { BrowserWindow } from "electron";
// eslint-disable-next-line unicorn/import-style -- Need namespace import for path operations
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { isDev } from "../../electronUtils";
import { logger } from "../../utils/logger";

// ESM equivalent of __dirname
// eslint-disable-next-line unicorn/prefer-import-meta-properties
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line unicorn/prefer-import-meta-properties
const __dirname = path.dirname(__filename);

/**
 * Service responsible for window management and lifecycle.
 *
 * @remarks
 * Provides centralized management of Electron browser windows with proper
 * security configuration, content loading, and event handling. Ensures
 * windows are created with appropriate security settings including context
 * isolation and disabled node integration.
 */
export class WindowService {
    /** Reference to the main application window (null if not created) */
    private mainWindow: BrowserWindow | null = null;

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
     * @returns The created BrowserWindow instance
     *
     * @remarks
     * Creates a new main window with secure defaults including:
     * - Context isolation enabled for security
     * - Node integration disabled in renderer
     * - Preload script for safe IPC communication
     * - Appropriate minimum and default dimensions
     * - Environment-specific content loading
     *
     * The window is initially hidden and will be shown when ready-to-show
     * event is fired to prevent visual flash.
     */
    public createMainWindow(): BrowserWindow {
        this.mainWindow = new BrowserWindow({
            height: 800,
            minHeight: 600,
            minWidth: 800,
            show: false, // Hidden initially to prevent flash
            titleBarStyle: "default",
            webPreferences: {
                contextIsolation: true, // Security: isolate context
                nodeIntegration: false, // Security: disable node in renderer
                preload: path.join(__dirname, "preload.js"), // Safe IPC bridge
            },
            width: 1200,
        });

        this.loadContent();
        this.setupWindowEvents();

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
     */
    public getMainWindow(): BrowserWindow | null {
        return this.mainWindow;
    }

    /**
     * Check if the main window exists and is not destroyed.
     */
    public hasMainWindow(): boolean {
        return this.mainWindow !== null && !this.mainWindow.isDestroyed();
    }

    /**
     * Send a message to the main window's renderer process.
     */
    public sendToRenderer(channel: string, data?: unknown): void {
        if (this.hasMainWindow()) {
            logger.debug(`[WindowService] Sending to renderer: ${channel}`);
            this.mainWindow?.webContents.send(channel, data);
        } else {
            logger.warn(`[WindowService] Cannot send to renderer (no main window): ${channel}`);
        }
    }

    /**
     * Load the appropriate content based on the current environment.
     *
     * @remarks
     * Handles environment-specific content loading:
     * - Development: Loads from Vite dev server (localhost:5173) with DevTools
     * - Production: Loads from built static files in the app bundle
     *
     * Includes error handling for cases where the dev server might not be running.
     */
    private loadContent(): void {
        if (!this.mainWindow) return;

        if (isDev()) {
            logger.debug("[WindowService] Development mode: waiting for Vite dev server");
            logger.debug("[WindowService] NODE_ENV:", process.env.NODE_ENV);
            // Load from Vite dev server
            // Wait for Vite server before loading content
            void this.loadDevelopmentContent();
        } else {
            logger.debug("[WindowService] Production mode: loading from dist");
            this.mainWindow.loadFile(path.join(__dirname, "../dist/index.html")).catch((error) => {
                logger.error("[WindowService] Failed to load production file", error);
            });
        }
    }

    /**
     * Load development content after waiting for Vite server.
     */
    private async loadDevelopmentContent(): Promise<void> {
        try {
            await this.waitForViteServer();
            if (this.mainWindow) {
                await this.mainWindow.loadURL("http://localhost:5173");
                // Delay opening DevTools to ensure renderer is ready
                setTimeout(() => {
                    this.mainWindow?.webContents.openDevTools();
                }, 1000);
            }
        } catch (error) {
            logger.error("[WindowService] Failed to load development content", error);
        }
    }

    /**
     * Setup window event handlers.
     */
    private setupWindowEvents(): void {
        if (!this.mainWindow) return;

        this.mainWindow.once("ready-to-show", () => {
            logger.info("[WindowService] Main window ready to show");
            this.mainWindow?.show();
        });

        this.mainWindow.webContents.once("dom-ready", () => {
            logger.debug("[WindowService] DOM ready in renderer");
        });

        this.mainWindow.webContents.once("did-finish-load", () => {
            logger.debug("[WindowService] Renderer finished loading");
        });

        this.mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
            logger.error(`[WindowService] Failed to load renderer: ${errorCode} - ${errorDescription}`);
        });

        this.mainWindow.on("closed", () => {
            logger.info("[WindowService] Main window closed");
            this.mainWindow = null;
        });
    }

    /**
     * Wait for Vite dev server to be ready.
     */
    private async waitForViteServer(maxRetries = 30, retryDelay = 1000): Promise<void> {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch("http://localhost:5173");
                if (response.ok) {
                    logger.debug("[WindowService] Vite dev server is ready");
                    return;
                }
            } catch {
                // Server not ready yet
            }

            logger.debug(`[WindowService] Waiting for Vite dev server... (attempt ${i + 1}/${maxRetries})`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }

        throw new Error("Vite dev server did not become available within timeout");
    }
}
