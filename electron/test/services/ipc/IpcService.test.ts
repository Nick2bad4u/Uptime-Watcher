/**
 * Tests for IpcService.
 * Validates IPC communication handling and service orchestration.
 */

import { ipcMain } from "electron";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { IpcService } from "../../../services/ipc/IpcService";

// Mock dependencies
vi.mock("electron", () => ({
    ipcMain: {
        handle: vi.fn(),
        on: vi.fn(),
        removeAllListeners: vi.fn(),
    },
}));

vi.mock("../../../uptimeMonitor", () => ({
    UptimeMonitor: vi.fn(),
}));

vi.mock("../../../utils", () => ({
    isDev: vi.fn(() => false),
}));

vi.mock("../../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

vi.mock("../../updater/AutoUpdaterService", () => ({
    AutoUpdaterService: vi.fn(),
}));

describe("IpcService", () => {
    let ipcService: IpcService;
    let mockUptimeMonitor: any;
    let mockAutoUpdaterService: any;
    let mockIpcMain: any;
    let logger: any;

    beforeEach(async () => {
        vi.clearAllMocks();

        logger = (await import("../../../utils/logger")).logger;

        mockUptimeMonitor = {
            addSite: vi.fn(),
            removeSite: vi.fn(),
            getSites: vi.fn(),
            updateSite: vi.fn(),
            startMonitoring: vi.fn(),
            stopMonitoring: vi.fn(),
            startMonitoringForSite: vi.fn(),
            stopMonitoringForSite: vi.fn(),
            checkSiteManually: vi.fn(),
            exportData: vi.fn(),
            importData: vi.fn(),
            setHistoryLimit: vi.fn(),
            getHistoryLimit: vi.fn(),
            downloadBackup: vi.fn(),
        };

        mockAutoUpdaterService = {
            quitAndInstall: vi.fn(),
        };

        mockIpcMain = ipcMain;

        ipcService = new IpcService(mockUptimeMonitor, mockAutoUpdaterService);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("Constructor", () => {
        it("should initialize with uptime monitor and auto updater service", () => {
            expect(ipcService).toBeDefined();
        });
    });

    describe("setupHandlers", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should setup all handler groups", () => {
            // Verify that ipcMain.handle was called for all expected channels
            const expectedChannels = [
                "add-site",
                "remove-site",
                "get-sites",
                "update-site",
                "start-monitoring",
                "stop-monitoring",
                "start-monitoring-for-site",
                "stop-monitoring-for-site",
                "check-site-now",
                "export-data",
                "import-data",
                "update-history-limit",
                "get-history-limit",
                "download-sqlite-backup",
            ];

            expectedChannels.forEach((channel) => {
                expect(mockIpcMain.handle).toHaveBeenCalledWith(channel, expect.any(Function));
            });

            // Verify system handlers
            expect(mockIpcMain.on).toHaveBeenCalledWith("quit-and-install", expect.any(Function));
        });
    });

    describe("Site Handlers", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should handle add-site", async () => {
            const mockSite = { identifier: "example.com", url: "https://example.com" };
            mockUptimeMonitor.addSite.mockResolvedValue(mockSite);

            const addSiteHandler = getHandlerForChannel("add-site");
            const result = await addSiteHandler(null, mockSite);

            expect(mockUptimeMonitor.addSite).toHaveBeenCalledWith(mockSite);
            expect(result).toBe(mockSite);
        });

        it("should handle remove-site", async () => {
            const identifier = "example.com";
            mockUptimeMonitor.removeSite.mockResolvedValue(true);

            const removeSiteHandler = getHandlerForChannel("remove-site");
            const result = await removeSiteHandler(null, identifier);

            expect(mockUptimeMonitor.removeSite).toHaveBeenCalledWith(identifier);
            expect(result).toBe(true);
        });

        it("should handle get-sites", async () => {
            const mockSites = [{ identifier: "example.com" }];
            mockUptimeMonitor.getSites.mockResolvedValue(mockSites);

            const getSitesHandler = getHandlerForChannel("get-sites");
            const result = await getSitesHandler();

            expect(mockUptimeMonitor.getSites).toHaveBeenCalled();
            expect(result).toBe(mockSites);
        });

        it("should handle update-site", async () => {
            const identifier = "example.com";
            const updates = { name: "Updated Site" };
            mockUptimeMonitor.updateSite.mockResolvedValue(true);

            const updateSiteHandler = getHandlerForChannel("update-site");
            const result = await updateSiteHandler(null, identifier, updates);

            expect(mockUptimeMonitor.updateSite).toHaveBeenCalledWith(identifier, updates);
            expect(result).toBe(true);
        });
    });

    describe("Monitoring Handlers", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should handle start-monitoring", async () => {
            const startMonitoringHandler = getHandlerForChannel("start-monitoring");
            const result = await startMonitoringHandler();

            expect(mockUptimeMonitor.startMonitoring).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it("should handle stop-monitoring", async () => {
            const stopMonitoringHandler = getHandlerForChannel("stop-monitoring");
            const result = await stopMonitoringHandler();

            expect(mockUptimeMonitor.stopMonitoring).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it("should handle start-monitoring-for-site", async () => {
            const identifier = "example.com";
            const monitorType = "http";
            mockUptimeMonitor.startMonitoringForSite.mockResolvedValue(true);

            const startMonitoringForSiteHandler = getHandlerForChannel("start-monitoring-for-site");
            const result = await startMonitoringForSiteHandler(null, identifier, monitorType);

            expect(mockUptimeMonitor.startMonitoringForSite).toHaveBeenCalledWith(identifier, monitorType);
            expect(result).toBe(true);
        });

        it("should handle stop-monitoring-for-site", async () => {
            const identifier = "example.com";
            const monitorType = "http";
            mockUptimeMonitor.stopMonitoringForSite.mockResolvedValue(true);

            const stopMonitoringForSiteHandler = getHandlerForChannel("stop-monitoring-for-site");
            const result = await stopMonitoringForSiteHandler(null, identifier, monitorType);

            expect(mockUptimeMonitor.stopMonitoringForSite).toHaveBeenCalledWith(identifier, monitorType);
            expect(result).toBe(true);
        });

        it("should handle check-site-now", async () => {
            const identifier = "example.com";
            const monitorType = "http";
            const mockResult = { status: "up", responseTime: 250 };
            mockUptimeMonitor.checkSiteManually.mockResolvedValue(mockResult);

            const checkSiteNowHandler = getHandlerForChannel("check-site-now");
            const result = await checkSiteNowHandler(null, identifier, monitorType);

            expect(mockUptimeMonitor.checkSiteManually).toHaveBeenCalledWith(identifier, monitorType);
            expect(result).toBe(mockResult);
        });
    });

    describe("Data Handlers", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should handle export-data", async () => {
            const mockExportData = { sites: [], history: [] };
            mockUptimeMonitor.exportData.mockResolvedValue(mockExportData);

            const exportDataHandler = getHandlerForChannel("export-data");
            const result = await exportDataHandler();

            expect(mockUptimeMonitor.exportData).toHaveBeenCalled();
            expect(result).toBe(mockExportData);
        });

        it("should handle import-data", async () => {
            const mockImportData = { sites: [], history: [] };
            mockUptimeMonitor.importData.mockResolvedValue(true);

            const importDataHandler = getHandlerForChannel("import-data");
            const result = await importDataHandler(null, mockImportData);

            expect(mockUptimeMonitor.importData).toHaveBeenCalledWith(mockImportData);
            expect(result).toBe(true);
        });

        it("should handle update-history-limit", async () => {
            const limit = 30;
            mockUptimeMonitor.setHistoryLimit.mockResolvedValue(true);

            const updateHistoryLimitHandler = getHandlerForChannel("update-history-limit");
            const result = await updateHistoryLimitHandler(null, limit);

            expect(mockUptimeMonitor.setHistoryLimit).toHaveBeenCalledWith(limit);
            expect(result).toBe(true);
        });

        it("should handle get-history-limit", async () => {
            const limit = 30;
            mockUptimeMonitor.getHistoryLimit.mockResolvedValue(limit);

            const getHistoryLimitHandler = getHandlerForChannel("get-history-limit");
            const result = await getHistoryLimitHandler();

            expect(mockUptimeMonitor.getHistoryLimit).toHaveBeenCalled();
            expect(result).toBe(limit);
        });

        it("should handle download-sqlite-backup successfully", async () => {
            const mockBackupData = { path: "/path/to/backup" };
            mockUptimeMonitor.downloadBackup.mockResolvedValue(mockBackupData);

            const downloadBackupHandler = getHandlerForChannel("download-sqlite-backup");
            const result = await downloadBackupHandler();

            expect(mockUptimeMonitor.downloadBackup).toHaveBeenCalled();
            expect(result).toBe(mockBackupData);
        });

        it("should handle download-sqlite-backup errors", async () => {
            const error = new Error("Backup failed");
            mockUptimeMonitor.downloadBackup.mockRejectedValue(error);

            const downloadBackupHandler = getHandlerForChannel("download-sqlite-backup");

            await expect(downloadBackupHandler()).rejects.toThrow("Failed to download SQLite backup: Backup failed");
            expect(logger.error).toHaveBeenCalledWith("[IpcService] Failed to download SQLite backup", error);
        });

        it("should handle download-sqlite-backup with non-Error objects", async () => {
            const error = "String error";
            mockUptimeMonitor.downloadBackup.mockRejectedValue(error);

            const downloadBackupHandler = getHandlerForChannel("download-sqlite-backup");

            await expect(downloadBackupHandler()).rejects.toThrow("Failed to download SQLite backup: String error");
        });
    });

    describe("System Handlers", () => {
        beforeEach(() => {
            ipcService.setupHandlers();
        });

        it("should handle quit-and-install", () => {
            const quitAndInstallHandler = getListenerForChannel("quit-and-install");
            quitAndInstallHandler();

            expect(logger.info).toHaveBeenCalledWith("[IpcService] Handling quit-and-install");
            expect(mockAutoUpdaterService.quitAndInstall).toHaveBeenCalled();
        });
    });

    describe("Debug Logging", () => {
        beforeEach(async () => {
            const { isDev } = await import("../../../utils");
            vi.mocked(isDev).mockReturnValue(true);
            ipcService.setupHandlers();
        });

        it("should log debug messages in development mode", async () => {
            const getSitesHandler = getHandlerForChannel("get-sites");
            await getSitesHandler();

            expect(logger.debug).toHaveBeenCalledWith("[IpcService] Handling get-sites");
        });

        it("should log debug messages with parameters", async () => {
            const identifier = "example.com";
            const removeSiteHandler = getHandlerForChannel("remove-site");
            await removeSiteHandler(null, identifier);

            expect(logger.debug).toHaveBeenCalledWith("[IpcService] Handling remove-site", { identifier });
        });
    });

    describe("cleanup", () => {
        it("should remove all IPC listeners", () => {
            ipcService.cleanup();

            expect(logger.info).toHaveBeenCalledWith("[IpcService] Cleaning up IPC handlers");
            expect(mockIpcMain.removeAllListeners).toHaveBeenCalled();
        });
    });

    // Helper functions
    function getHandlerForChannel(channel: string): Function {
        const call = mockIpcMain.handle.mock.calls.find((call: any[]) => call[0] === channel);
        expect(call).toBeDefined();
        return call![1];
    }

    function getListenerForChannel(channel: string): Function {
        const call = mockIpcMain.on.mock.calls.find((call: any[]) => call[0] === channel);
        expect(call).toBeDefined();
        return call![1];
    }
});
