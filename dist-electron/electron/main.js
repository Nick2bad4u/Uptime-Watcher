"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_updater_1 = require("electron-updater");
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const uptimeMonitor_1 = require("./uptimeMonitor");
const main_1 = __importDefault(require("electron-log/main"));
const fs_1 = __importDefault(require("fs"));
// Configure electron-log for main process
main_1.default.initialize({ preload: true });
main_1.default.transports.file.level = "info";
main_1.default.transports.console.level = "debug";
main_1.default.transports.file.fileName = "uptime-watcher-main.log";
main_1.default.transports.file.maxSize = 1024 * 1024 * 5; // 5MB max file size
main_1.default.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";
main_1.default.transports.console.format = "[{h}:{i}:{s}.{ms}] [{level}] {text}";
const logger = {
    info: (message, ...args) => main_1.default.info(`[MAIN] ${message}`, ...args),
    error: (message, error, ...args) => {
        if (error instanceof Error) {
            main_1.default.error(`[MAIN] ${message}`, { message: error.message, stack: error.stack }, ...args);
        }
        else {
            main_1.default.error(`[MAIN] ${message}`, error, ...args);
        }
    },
    debug: (message, ...args) => main_1.default.debug(`[MAIN] ${message}`, ...args),
    warn: (message, ...args) => main_1.default.warn(`[MAIN] ${message}`, ...args),
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
        this.uptimeMonitor = new uptimeMonitor_1.UptimeMonitor();
        this.setupApp();
        this.setupIPC();
    }
    setupApp() {
        logger.info("Setting up Electron app");
        electron_1.app.on("ready", () => {
            logger.info("App ready, creating main window");
            this.createMainWindow();
            // Start auto-updater after window is created
            this.setupAutoUpdater();
        });
        electron_1.app.on("window-all-closed", () => {
            logger.info("All windows closed");
            if (process.platform !== "darwin") {
                logger.info("Quitting app (non-macOS)");
                electron_1.app.quit();
            }
        });
        electron_1.app.on("activate", () => {
            logger.info("App activated");
            if (electron_1.BrowserWindow.getAllWindows().length === 0) {
                logger.info("No windows open, creating main window");
                this.createMainWindow();
            }
        });
    }
    createMainWindow() {
        logger.info("Creating main window");
        this.mainWindow = new electron_1.BrowserWindow({
            width: 1200,
            height: 800,
            minWidth: 800,
            minHeight: 600,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path_1.default.join(__dirname, "preload.js"),
            },
            titleBarStyle: "default",
            show: false,
        });
        // Load the app
        if ((0, utils_1.isDev)()) {
            logger.debug("Development mode: loading from localhost");
            this.mainWindow.loadURL("http://localhost:5173");
            this.mainWindow.webContents.openDevTools();
        }
        else {
            logger.debug("Production mode: loading from dist");
            this.mainWindow.loadFile(path_1.default.join(__dirname, "../dist/index.html"));
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
        electron_1.ipcMain.handle("add-site", async (_, site) => {
            return this.uptimeMonitor.addSite(site);
        });
        electron_1.ipcMain.handle("remove-site", async (_, identifier) => {
            return this.uptimeMonitor.removeSite(identifier);
        });
        electron_1.ipcMain.handle("get-sites", async () => {
            return this.uptimeMonitor.getSites();
        });
        electron_1.ipcMain.handle("update-history-limit", async (_, limit) => {
            return this.uptimeMonitor.setHistoryLimit(limit);
        });
        electron_1.ipcMain.handle("get-history-limit", async () => {
            return this.uptimeMonitor.getHistoryLimit();
        });
        electron_1.ipcMain.handle("start-monitoring", async () => {
            this.uptimeMonitor.startMonitoring();
            return true;
        });
        electron_1.ipcMain.handle("stop-monitoring", async () => {
            this.uptimeMonitor.stopMonitoring();
            return true;
        });
        electron_1.ipcMain.handle("check-site-now", async (_, identifier, monitorType) => {
            return this.uptimeMonitor.checkSiteManually(identifier, monitorType);
        });
        electron_1.ipcMain.handle("export-data", async () => {
            return this.uptimeMonitor.exportData();
        });
        electron_1.ipcMain.handle("import-data", async (_, data) => {
            return this.uptimeMonitor.importData(data);
        });
        electron_1.ipcMain.handle("update-site", async (_, identifier, updates) => {
            return this.uptimeMonitor.updateSite(identifier, updates);
        });
        electron_1.ipcMain.handle("start-monitoring-for-site", async (_, identifier, monitorType) => {
            return this.uptimeMonitor.startMonitoringForSite(identifier, monitorType);
        });
        electron_1.ipcMain.handle("stop-monitoring-for-site", async (_, identifier, monitorType) => {
            return this.uptimeMonitor.stopMonitoringForSite(identifier, monitorType);
        });
        // Direct SQLite backup download
        const dbPath = path_1.default.join(electron_1.app.getPath("userData"), "uptime-watcher.sqlite");
        electron_1.ipcMain.handle("download-sqlite-backup", async () => {
            try {
                const buffer = fs_1.default.readFileSync(dbPath);
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
            if (electron_1.Notification.isSupported()) {
                new electron_1.Notification({
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
            if (electron_1.Notification.isSupported()) {
                new electron_1.Notification({
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
        electron_1.ipcMain.on("quit-and-install", () => {
            electron_updater_1.autoUpdater.quitAndInstall();
        });
    }
    setupAutoUpdater() {
        if (!this.mainWindow)
            return;
        electron_updater_1.autoUpdater.on("checking-for-update", () => {
            this.mainWindow?.webContents.send("update-status", { status: "checking" });
        });
        electron_updater_1.autoUpdater.on("update-available", () => {
            this.mainWindow?.webContents.send("update-status", { status: "available" });
        });
        electron_updater_1.autoUpdater.on("update-not-available", () => {
            this.mainWindow?.webContents.send("update-status", { status: "idle" });
        });
        electron_updater_1.autoUpdater.on("download-progress", () => {
            this.mainWindow?.webContents.send("update-status", { status: "downloading" });
        });
        electron_updater_1.autoUpdater.on("update-downloaded", () => {
            this.mainWindow?.webContents.send("update-status", { status: "downloaded" });
        });
        electron_updater_1.autoUpdater.on("error", (err) => {
            this.mainWindow?.webContents.send("update-status", { status: "error", error: err?.message || String(err) });
        });
        electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
    }
}
new Main();
