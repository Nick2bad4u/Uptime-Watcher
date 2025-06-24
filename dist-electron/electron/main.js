import { app, BrowserWindow, ipcMain, Notification } from "electron";
import { autoUpdater } from "electron-updater";
import path from "path";
import { isDev } from "./utils";
import { UptimeMonitor } from "./uptimeMonitor";
import log from "electron-log/main";
import fs from "fs";
// Configure electron-log for main process
log.initialize({ preload: true });
log.transports.file.level = "info";
log.transports.console.level = "debug";
log.transports.file.fileName = "uptime-watcher-main.log";
log.transports.file.maxSize = 1024 * 1024 * 5; // 5MB max file size
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";
log.transports.console.format = "[{h}:{i}:{s}.{ms}] [{level}] {text}";
const logger = {
    info: (message, ...args) => log.info(`[MAIN] ${message}`, ...args),
    error: (message, error, ...args) => {
        if (error instanceof Error) {
            log.error(`[MAIN] ${message}`, { message: error.message, stack: error.stack }, ...args);
        }
        else {
            log.error(`[MAIN] ${message}`, error, ...args);
        }
    },
    debug: (message, ...args) => log.debug(`[MAIN] ${message}`, ...args),
    warn: (message, ...args) => log.warn(`[MAIN] ${message}`, ...args),
};
class Main {
    constructor() {
        Object.defineProperty(this, "mainWindow", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "uptimeMonitor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.uptimeMonitor = new UptimeMonitor();
        this.setupApp();
        this.setupIPC();
    }
    setupApp() {
        logger.info("Setting up Electron app");
        app.on("ready", () => {
            logger.info("App ready, creating main window");
            this.createMainWindow();
            // Start auto-updater after window is created
            this.setupAutoUpdater();
        });
        app.on("window-all-closed", () => {
            logger.info("All windows closed");
            if (process.platform !== "darwin") {
                logger.info("Quitting app (non-macOS)");
                app.quit();
            }
        });
        app.on("activate", () => {
            logger.info("App activated");
            if (BrowserWindow.getAllWindows().length === 0) {
                logger.info("No windows open, creating main window");
                this.createMainWindow();
            }
        });
    }
    createMainWindow() {
        logger.info("Creating main window");
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            minWidth: 800,
            minHeight: 600,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, "preload.js"),
            },
            titleBarStyle: "default",
            show: false,
        });
        // Load the app
        if (isDev()) {
            logger.debug("Development mode: loading from localhost");
            this.mainWindow.loadURL("http://localhost:5173");
            this.mainWindow.webContents.openDevTools();
        }
        else {
            logger.debug("Production mode: loading from dist");
            this.mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
        }
        this.mainWindow.once("ready-to-show", () => {
            logger.info("Main window ready to show");
            this.mainWindow?.show();
        });
        this.mainWindow.on("closed", () => {
            logger.info("Main window closed");
            this.mainWindow = null;
        });
    }
    setupIPC() {
        // Site management
        ipcMain.handle("add-site", async (_, site) => {
            return this.uptimeMonitor.addSite(site);
        });
        ipcMain.handle("remove-site", async (_, identifier) => {
            return this.uptimeMonitor.removeSite(identifier);
        });
        ipcMain.handle("get-sites", async () => {
            return this.uptimeMonitor.getSites();
        });
        ipcMain.handle("update-history-limit", async (_, limit) => {
            return this.uptimeMonitor.setHistoryLimit(limit);
        });
        ipcMain.handle("get-history-limit", async () => {
            return this.uptimeMonitor.getHistoryLimit();
        });
        ipcMain.handle("start-monitoring", async () => {
            this.uptimeMonitor.startMonitoring();
            return true;
        });
        ipcMain.handle("stop-monitoring", async () => {
            this.uptimeMonitor.stopMonitoring();
            return true;
        });
        ipcMain.handle("check-site-now", async (_, identifier, monitorType) => {
            return this.uptimeMonitor.checkSiteManually(identifier, monitorType);
        });
        ipcMain.handle("export-data", async () => {
            return this.uptimeMonitor.exportData();
        });
        ipcMain.handle("import-data", async (_, data) => {
            return this.uptimeMonitor.importData(data);
        });
        ipcMain.handle("update-site", async (_, identifier, updates) => {
            return this.uptimeMonitor.updateSite(identifier, updates);
        });
        ipcMain.handle("start-monitoring-for-site", async (_, identifier, monitorType) => {
            return this.uptimeMonitor.startMonitoringForSite(identifier, monitorType);
        });
        ipcMain.handle("stop-monitoring-for-site", async (_, identifier, monitorType) => {
            return this.uptimeMonitor.stopMonitoringForSite(identifier, monitorType);
        });
        // Direct SQLite backup download
        const dbPath = path.join(app.getPath("userData"), "uptime-watcher.sqlite");
        ipcMain.handle("download-sqlite-backup", async () => {
            try {
                const buffer = fs.readFileSync(dbPath);
                return {
                    buffer,
                    fileName: "uptime-watcher-backup.sqlite",
                };
            }
            catch (error) {
                logger.error("Failed to read SQLite backup file", error);
                const message = error instanceof Error ? error.message : String(error);
                throw new Error("Failed to read SQLite backup file: " + message);
            }
        });
        // Listen for status updates from monitor
        this.uptimeMonitor.on("status-update", (data) => {
            const monitorStatuses = data.site.monitors
                .map((m) => `${m.type}: ${m.status}${m.responseTime ? ` (${m.responseTime}ms)` : ""}`)
                .join(", ");
            logger.debug(`Status update for ${data.site.identifier}: ${monitorStatuses}`);
            this.mainWindow?.webContents.send("status-update", data);
        });
        this.uptimeMonitor.on("site-monitor-down", ({ site, monitorType }) => {
            logger.warn(`Monitor down alert: ${site.name || site.identifier} [${monitorType}]`);
            if (Notification.isSupported()) {
                new Notification({
                    title: "Monitor Down Alert",
                    body: `${site.name || site.identifier} (${monitorType}) is currently down!`,
                    urgency: "critical",
                }).show();
                logger.info(`Notification sent for monitor down: ${site.name || site.identifier} (${monitorType})`);
            }
            else {
                logger.warn("Notifications not supported on this platform");
            }
        });
        this.uptimeMonitor.on("site-monitor-up", ({ site, monitorType }) => {
            logger.info(`Monitor restored: ${site.name || site.identifier} [${monitorType}]`);
            if (Notification.isSupported()) {
                new Notification({
                    title: "Monitor Restored",
                    body: `${site.name || site.identifier} (${monitorType}) is back online!`,
                    urgency: "normal",
                }).show();
                logger.info(`Notification sent for monitor restored: ${site.name || site.identifier} (${monitorType})`);
            }
            else {
                logger.warn("Notifications not supported on this platform");
            }
        });
        ipcMain.on("quit-and-install", () => {
            autoUpdater.quitAndInstall();
        });
    }
    setupAutoUpdater() {
        if (!this.mainWindow)
            return;
        autoUpdater.on("checking-for-update", () => {
            this.mainWindow?.webContents.send("update-status", { status: "checking" });
        });
        autoUpdater.on("update-available", () => {
            this.mainWindow?.webContents.send("update-status", { status: "available" });
        });
        autoUpdater.on("update-not-available", () => {
            this.mainWindow?.webContents.send("update-status", { status: "idle" });
        });
        autoUpdater.on("download-progress", () => {
            this.mainWindow?.webContents.send("update-status", { status: "downloading" });
        });
        autoUpdater.on("update-downloaded", () => {
            this.mainWindow?.webContents.send("update-status", { status: "downloaded" });
        });
        autoUpdater.on("error", (err) => {
            this.mainWindow?.webContents.send("update-status", { status: "error", error: err?.message || String(err) });
        });
        autoUpdater.checkForUpdatesAndNotify();
    }
}
new Main();
