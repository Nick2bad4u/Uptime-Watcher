import { BrowserWindow } from "electron";
import * as path from "node:path";

import { isDev } from "../../electronUtils";
import { logger } from "../../utils/index";

/**
 * Service responsible for window management and lifecycle.
 * Handles window creation, configuration, and event management.
 */
export class WindowService {
    private mainWindow: BrowserWindow | null = null;

    /**
     * Create and configure the main application window.
     */
    public createMainWindow(): BrowserWindow {
        this.mainWindow = new BrowserWindow({
            height: 800,
            minHeight: 600,
            minWidth: 800,
            show: false,
            titleBarStyle: "default",
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                preload: path.join(__dirname, "preload.js"),
            },
            width: 1200,
        });

        this.loadContent();
        this.setupWindowEvents();

        return this.mainWindow;
    }

    /**
     * Load the appropriate content based on environment.
     */
    private loadContent(): void {
        if (!this.mainWindow) return;

        if (isDev()) {
            logger.debug("[WindowService] Development mode: loading from localhost");
            this.mainWindow.loadURL("http://localhost:5173").catch((error) => {
                logger.error("[WindowService] Failed to load development URL", error);
            });
            this.mainWindow.webContents.openDevTools();
        } else {
            logger.debug("[WindowService] Production mode: loading from dist");
            this.mainWindow.loadFile(path.join(__dirname, "../dist/index.html")).catch((error) => {
                logger.error("[WindowService] Failed to load production file", error);
            });
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

        this.mainWindow.on("closed", () => {
            logger.info("[WindowService] Main window closed");

            this.mainWindow = null;
        });
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
     * Close the main window.
     */
    public closeMainWindow(): void {
        if (this.hasMainWindow()) {
            this.mainWindow?.close();
        }
    }

    /**
     * Get all browser windows.
     */
    public getAllWindows(): BrowserWindow[] {
        return BrowserWindow.getAllWindows();
    }
}
