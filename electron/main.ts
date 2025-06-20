import { app, BrowserWindow, ipcMain, Notification } from "electron";
import path from "path";
import { isDev } from "./utils";
import { UptimeMonitor } from "./uptimeMonitor";
import { StatusUpdate, Site } from "./types";

class Main {
    private mainWindow: BrowserWindow | null = null;
    private uptimeMonitor: UptimeMonitor;

    constructor() {
        this.uptimeMonitor = new UptimeMonitor();
        this.setupApp();
        this.setupIPC();
    }

    private setupApp() {
        app.on("ready", this.createMainWindow.bind(this));
        app.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
                app.quit();
            }
        });
        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createMainWindow();
            }
        });
    }

    private createMainWindow() {
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
            this.mainWindow.loadURL("http://localhost:5173");
            this.mainWindow.webContents.openDevTools();
        } else {
            this.mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
        }

        this.mainWindow.once("ready-to-show", () => {
            this.mainWindow?.show();
        });

        this.mainWindow.on("closed", () => {
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
            this.mainWindow?.webContents.send("status-update", data);
        });

        this.uptimeMonitor.on("site-down", (site: Site) => {
            if (Notification.isSupported()) {
                new Notification({
                    title: "Site Down Alert",
                    body: `${site.name || site.url} is currently down!`,
                    urgency: "critical",
                }).show();
            }
        });

        this.uptimeMonitor.on("site-restored", (site: Site) => {
            if (Notification.isSupported()) {
                new Notification({
                    title: "Site Restored",
                    body: `${site.name || site.url} is back online!`,
                    urgency: "normal",
                }).show();
            }
        });
    }
}

new Main();
