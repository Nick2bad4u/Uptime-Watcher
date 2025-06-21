import { app, BrowserWindow, ipcMain, Notification } from "electron";
import path from "path";
import { isDev } from "./utils";
import { UptimeMonitor } from "./uptimeMonitor";
import { StatusUpdate, Site } from "./types";
import log from "electron-log/main";

// Configure electron-log for main process
log.initialize({ preload: true });
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
log.transports.file.fileName = 'uptime-watcher-main.log';
log.transports.file.maxSize = 1024 * 1024 * 5; // 5MB max file size
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
log.transports.console.format = '[{h}:{i}:{s}.{ms}] [{level}] {text}';

const logger = {
  info: (message: string, ...args: any[]) => log.info(`[MAIN] ${message}`, ...args),
  error: (message: string, error?: Error | any, ...args: any[]) => {
    if (error instanceof Error) {
      log.error(`[MAIN] ${message}`, { message: error.message, stack: error.stack }, ...args);
    } else {
      log.error(`[MAIN] ${message}`, error, ...args);
    }
  },
  debug: (message: string, ...args: any[]) => log.debug(`[MAIN] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => log.warn(`[MAIN] ${message}`, ...args),
};

class Main {
    private mainWindow: BrowserWindow | null = null;
    private uptimeMonitor: UptimeMonitor;

    constructor() {
        this.uptimeMonitor = new UptimeMonitor();
        this.setupApp();
        this.setupIPC();
    }

    private setupApp() {
        logger.info('Setting up Electron app');
        
        app.on("ready", () => {
            logger.info('App ready, creating main window');
            this.createMainWindow();
        });
        
        app.on("window-all-closed", () => {
            logger.info('All windows closed');
            if (process.platform !== "darwin") {
                logger.info('Quitting app (non-macOS)');
                app.quit();
            }
        });
        
        app.on("activate", () => {
            logger.info('App activated');
            if (BrowserWindow.getAllWindows().length === 0) {
                logger.info('No windows open, creating main window');
                this.createMainWindow();
            }
        });
    }

    private createMainWindow() {
        logger.info('Creating main window');
        
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
            logger.debug('Development mode: loading from localhost');
            this.mainWindow.loadURL("http://localhost:5173");
            this.mainWindow.webContents.openDevTools();
        } else {
            logger.debug('Production mode: loading from dist');
            this.mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
        }

        this.mainWindow.once("ready-to-show", () => {
            logger.info('Main window ready to show');
            this.mainWindow?.show();
        });

        this.mainWindow.on("closed", () => {
            logger.info('Main window closed');
            this.mainWindow = null;
        });
    }

    private setupIPC() {
        // Site management
        ipcMain.handle("add-site", async (_, site) => {
            return this.uptimeMonitor.addSite(site);
        });

        ipcMain.handle("remove-site", async (_, url) => {
            return this.uptimeMonitor.removeSite(url);
        });

        ipcMain.handle("get-sites", async () => {
            return this.uptimeMonitor.getSites();
        });

        ipcMain.handle("update-check-interval", async (_, interval) => {
            return this.uptimeMonitor.setCheckInterval(interval);
        });

        ipcMain.handle("get-check-interval", async () => {
            return this.uptimeMonitor.getCheckInterval();
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

        ipcMain.handle("check-site-now", async (_, url) => {
            return this.uptimeMonitor.checkSiteManually(url);
        });

        ipcMain.handle("export-data", async () => {
            return this.uptimeMonitor.exportData();
        });

        ipcMain.handle("import-data", async (_, data) => {
            return this.uptimeMonitor.importData(data);
        });

        ipcMain.handle("update-site", async (_, url, updates) => {
            return this.uptimeMonitor.updateSite(url, updates);
        });

        // Listen for status updates from monitor
        this.uptimeMonitor.on("status-update", (data: StatusUpdate) => {
            logger.debug(`Status update for ${data.site.url}: ${data.site.status}${data.site.responseTime ? ` (${data.site.responseTime}ms)` : ''}`);
            this.mainWindow?.webContents.send("status-update", data);
        });

        this.uptimeMonitor.on("site-down", (site: Site) => {
            logger.warn(`Site down alert: ${site.name || site.url}`);
            if (Notification.isSupported()) {
                new Notification({
                    title: "Site Down Alert",
                    body: `${site.name || site.url} is currently down!`,
                    urgency: "critical",
                }).show();
                logger.info(`Notification sent for site down: ${site.name || site.url}`);
            } else {
                logger.warn('Notifications not supported on this platform');
            }
        });

        this.uptimeMonitor.on("site-restored", (site: Site) => {
            logger.info(`Site restored: ${site.name || site.url}`);
            if (Notification.isSupported()) {
                new Notification({
                    title: "Site Restored",
                    body: `${site.name || site.url} is back online!`,
                    urgency: "normal",
                }).show();
                logger.info(`Notification sent for site restored: ${site.name || site.url}`);
            } else {
                logger.warn('Notifications not supported on this platform');
            }
        });
    }
}

new Main();
