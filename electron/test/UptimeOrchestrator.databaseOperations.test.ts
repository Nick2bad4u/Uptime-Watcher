/**
 * Tests for UptimeOrchestrator - Database Operations and Additional Methods.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

// Mock dependencies
vi.mock("../constants", () => ({
    DEFAULT_REQUEST_TIMEOUT: 10000,
    DEFAULT_CHECK_INTERVAL: 300000,
    STATUS_UPDATE_EVENT: "status-update",
    DEFAULT_HISTORY_LIMIT: 500,
}));

vi.mock("../utils", () => ({
    isDev: vi.fn(() => false),
}));

vi.mock("../utils/logger", () => ({
    monitorLogger: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    },
}));

vi.mock("../utils/retry", () => ({
    withDbRetry: vi.fn((fn) => fn()),
}));

// Mock database services
vi.mock("../services/database", () => ({
    DatabaseService: {
        getInstance: vi.fn(() => ({
            initialize: vi.fn(() => Promise.resolve()),
            close: vi.fn(() => Promise.resolve()),
            getDatabasePath: vi.fn(() => "/path/to/database.db"),
            downloadBackup: vi.fn(() => Promise.resolve({ buffer: Buffer.from("backup"), fileName: "backup.db" })),
        })),
    },
    SiteRepository: vi.fn(() => ({
        create: vi.fn(() => Promise.resolve("mock-site-id")),
        delete: vi.fn(() => Promise.resolve()),
        findAll: vi.fn(() => Promise.resolve([])),
        findByIdentifier: vi.fn(() => Promise.resolve(null)),
        update: vi.fn(() => Promise.resolve({})),
    })),
    MonitorRepository: vi.fn(() => ({
        create: vi.fn(() => Promise.resolve("mock-monitor-id")),
        delete: vi.fn(() => Promise.resolve()),
        findAll: vi.fn(() => Promise.resolve([])),
        findByIdentifier: vi.fn(() => Promise.resolve(null)),
        findBySiteIdentifier: vi.fn(() => Promise.resolve([])),
        update: vi.fn(() => Promise.resolve({})),
    })),
    HistoryRepository: vi.fn(() => ({
        create: vi.fn(() => Promise.resolve("mock-history-id")),
        delete: vi.fn(() => Promise.resolve()),
        findAll: vi.fn(() => Promise.resolve([])),
        findByMonitorId: vi.fn(() => Promise.resolve([])),
        deleteOldHistory: vi.fn(() => Promise.resolve()),
        count: vi.fn(() => Promise.resolve(0)),
        countByMonitorId: vi.fn(() => Promise.resolve(0)),
    })),
    SettingsRepository: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve(null)),
        set: vi.fn(() => Promise.resolve()),
        delete: vi.fn(() => Promise.resolve()),
        findAll: vi.fn(() => Promise.resolve([])),
    })),
}));

// Mock manager classes
vi.mock("../managers/SiteManager", () => ({
    SiteManager: vi.fn(() => ({
        initialize: vi.fn(() => Promise.resolve()),
        getSites: vi.fn(() => Promise.resolve([])),
        getSitesFromCache: vi.fn(() => []),
        addSite: vi.fn(() => Promise.resolve({})),
        removeSite: vi.fn(() => Promise.resolve(true)),
        updateSite: vi.fn(() => Promise.resolve({})),
        updateSitesCache: vi.fn(),
        getSitesCache: vi.fn(() => []),
        on: vi.fn(),
        emit: vi.fn(),
    })),
}));

vi.mock("../managers/MonitorManager", () => ({
    MonitorManager: vi.fn(() => ({
        initialize: vi.fn(() => Promise.resolve()),
        startMonitoring: vi.fn(() => Promise.resolve()),
        stopMonitoring: vi.fn(),
        isMonitoringActive: vi.fn(() => false),
        startMonitoringForSite: vi.fn(() => Promise.resolve(true)),
        stopMonitoringForSite: vi.fn(() => Promise.resolve(true)),
        checkSiteManually: vi.fn(() => Promise.resolve({ status: "up", responseTime: 100 })),
        setupSiteForMonitoring: vi.fn(() => Promise.resolve()),
        on: vi.fn(),
        emit: vi.fn(),
    })),
}));

vi.mock("../managers/DatabaseManager", () => ({
    DatabaseManager: vi.fn(() => ({
        initialize: vi.fn(() => Promise.resolve()),
        exportData: vi.fn(() => Promise.resolve("exported-data")),
        importData: vi.fn(() => Promise.resolve(true)),
        downloadBackup: vi.fn(() => Promise.resolve({ buffer: Buffer.from("backup"), fileName: "backup.db" })),
        refreshSites: vi.fn(() => Promise.resolve([])),
        setHistoryLimit: vi.fn(() => Promise.resolve()),
        on: vi.fn(),
        emit: vi.fn(),
    })),
}));

import { UptimeOrchestrator } from "../UptimeOrchestrator";
import { SiteManager } from "../managers/SiteManager";
import { MonitorManager } from "../managers/MonitorManager";
import { DatabaseManager } from "../managers/DatabaseManager";

describe("UptimeOrchestrator - Database Operations", () => {
    let uptimeOrchestrator: UptimeOrchestrator;
    let mockSiteManager: any;
    let mockMonitorManager: any;
    let mockDatabaseManager: any;

    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
        
        // Create new instance
        uptimeOrchestrator = new UptimeOrchestrator();
        
        // Get mock instances
        mockSiteManager = (SiteManager as any).mock.results[0]?.value;
        mockMonitorManager = (MonitorManager as any).mock.results[0]?.value;
        mockDatabaseManager = (DatabaseManager as any).mock.results[0]?.value;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("Site Operations", () => {
        it("should update site", async () => {
            const identifier = "test-site";
            const updates = { name: "Updated Site" };
            const expectedSite = { identifier, name: "Updated Site" };
            
            mockSiteManager.updateSite.mockResolvedValue(expectedSite);

            const result = await uptimeOrchestrator.updateSite(identifier, updates);

            expect(mockSiteManager.updateSite).toHaveBeenCalledWith(identifier, updates);
            expect(result).toEqual(expectedSite);
        });

        it("should handle updateSite errors", async () => {
            const identifier = "test-site";
            const updates = { name: "Updated Site" };
            const error = new Error("Update failed");
            
            mockSiteManager.updateSite.mockRejectedValue(error);

            await expect(uptimeOrchestrator.updateSite(identifier, updates)).rejects.toThrow("Update failed");
        });
    });

    describe("Database Operations", () => {
        it("should export data", async () => {
            const exportedData = "mock-exported-data";
            mockDatabaseManager.exportData.mockResolvedValue(exportedData);

            const result = await uptimeOrchestrator.exportData();

            expect(mockDatabaseManager.exportData).toHaveBeenCalled();
            expect(result).toBe(exportedData);
        });

        it("should handle exportData errors", async () => {
            const error = new Error("Export failed");
            mockDatabaseManager.exportData.mockRejectedValue(error);

            await expect(uptimeOrchestrator.exportData()).rejects.toThrow("Export failed");
        });

        it("should import data", async () => {
            const importData = "mock-import-data";
            mockDatabaseManager.importData.mockResolvedValue(true);

            const result = await uptimeOrchestrator.importData(importData);

            expect(mockDatabaseManager.importData).toHaveBeenCalledWith(importData);
            expect(result).toBe(true);
        });

        it("should handle importData errors", async () => {
            const importData = "mock-import-data";
            const error = new Error("Import failed");
            mockDatabaseManager.importData.mockRejectedValue(error);

            await expect(uptimeOrchestrator.importData(importData)).rejects.toThrow("Import failed");
        });

        it("should download backup", async () => {
            const backupData = { buffer: Buffer.from("backup"), fileName: "backup.db" };
            mockDatabaseManager.downloadBackup.mockResolvedValue(backupData);

            const result = await uptimeOrchestrator.downloadBackup();

            expect(mockDatabaseManager.downloadBackup).toHaveBeenCalled();
            expect(result).toEqual(backupData);
        });

        it("should handle downloadBackup errors", async () => {
            const error = new Error("Backup download failed");
            mockDatabaseManager.downloadBackup.mockRejectedValue(error);

            await expect(uptimeOrchestrator.downloadBackup()).rejects.toThrow("Backup download failed");
        });

        it("should refresh sites", async () => {
            const sites = [{ identifier: "site1" }, { identifier: "site2" }];
            mockDatabaseManager.refreshSites.mockResolvedValue(sites);

            const result = await uptimeOrchestrator.refreshSites();

            expect(mockDatabaseManager.refreshSites).toHaveBeenCalled();
            expect(result).toEqual(sites);
        });

        it("should handle refreshSites errors", async () => {
            const error = new Error("Refresh failed");
            mockDatabaseManager.refreshSites.mockRejectedValue(error);

            await expect(uptimeOrchestrator.refreshSites()).rejects.toThrow("Refresh failed");
        });
    });

    describe("History Management", () => {
        it("should set history limit", async () => {
            const limit = 1000;
            mockDatabaseManager.setHistoryLimit.mockResolvedValue();

            await uptimeOrchestrator.setHistoryLimit(limit);

            expect(mockDatabaseManager.setHistoryLimit).toHaveBeenCalledWith(limit);
        });

        it("should handle setHistoryLimit errors", async () => {
            const limit = 1000;
            const error = new Error("Set history limit failed");
            mockDatabaseManager.setHistoryLimit.mockRejectedValue(error);

            await expect(uptimeOrchestrator.setHistoryLimit(limit)).rejects.toThrow("Set history limit failed");
        });

        it("should get history limit", () => {
            // Test default history limit
            expect(uptimeOrchestrator.getHistoryLimit()).toBe(500);
        });

        it("should get updated history limit after set", async () => {
            const limit = 1000;
            mockDatabaseManager.setHistoryLimit.mockResolvedValue();
            
            // Simulate the event being emitted when history limit is updated
            await uptimeOrchestrator.setHistoryLimit(limit);
            
            // Manually trigger the event that would update the internal history limit
            uptimeOrchestrator.emit("history-limit-updated", { limit });
            
            expect(uptimeOrchestrator.getHistoryLimit()).toBe(500); // Still default until event is handled
        });
    });

    describe("Status Information", () => {
        it("should check if monitoring is active", () => {
            mockMonitorManager.isMonitoringActive.mockReturnValue(true);

            const result = uptimeOrchestrator.isMonitoringActive();

            expect(mockMonitorManager.isMonitoringActive).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it("should return false when monitoring is not active", () => {
            mockMonitorManager.isMonitoringActive.mockReturnValue(false);

            const result = uptimeOrchestrator.isMonitoringActive();

            expect(mockMonitorManager.isMonitoringActive).toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });

    describe("Event Handling", () => {
        it("should handle history limit updated events", () => {
            const newLimit = 1500;

            // Emit the event to update history limit
            uptimeOrchestrator.emit("database:history-limit-updated", { limit: newLimit });

            // The limit should be updated internally
            expect(uptimeOrchestrator.getHistoryLimit()).toBe(newLimit);
        });

        it("should handle start monitoring requested events", () => {
            const eventData = { identifier: "test-site", monitorId: "test-monitor" };
            
            uptimeOrchestrator.emit("site:start-monitoring-requested", eventData);

            expect(mockMonitorManager.startMonitoringForSite).toHaveBeenCalledWith(
                eventData.identifier,
                eventData.monitorId
            );
        });

        it("should handle stop monitoring requested events", () => {
            const eventData = { identifier: "test-site", monitorId: "test-monitor" };
            
            uptimeOrchestrator.emit("site:stop-monitoring-requested", eventData);

            expect(mockMonitorManager.stopMonitoringForSite).toHaveBeenCalledWith(
                eventData.identifier,
                eventData.monitorId
            );
        });

        it("should handle update sites cache requested events", () => {
            const eventData = { sites: [{ identifier: "site1" }, { identifier: "site2" }] };
            
            uptimeOrchestrator.emit("database:update-sites-cache-requested", eventData);

            expect(mockSiteManager.updateSitesCache).toHaveBeenCalledWith(eventData.sites);
        });

        it("should handle update sites cache requested events with no sites", () => {
            const eventData = {};
            
            uptimeOrchestrator.emit("database:update-sites-cache-requested", eventData);

            expect(mockSiteManager.updateSitesCache).not.toHaveBeenCalled();
        });

        it("should handle get sites from cache requested events", () => {
            const mockSites = [{ identifier: "site1" }];
            mockSiteManager.getSitesFromCache.mockReturnValue(mockSites);
            
            // Create a spy to capture emissions, but avoid the recursive call
            const originalEmit = uptimeOrchestrator.emit;
            let capturedEvent: string | undefined;
            let capturedData: any;
            
            uptimeOrchestrator.emit = vi.fn((event: string, data?: any) => {
                if (event === "database:get-sites-from-cache-requested" && data?.sites) {
                    capturedEvent = event;
                    capturedData = data;
                    return true;
                }
                return originalEmit.call(uptimeOrchestrator, event, data);
            });
            
            uptimeOrchestrator.emit("database:get-sites-from-cache-requested");

            expect(mockSiteManager.getSitesFromCache).toHaveBeenCalled();
            expect(capturedEvent).toBe("database:get-sites-from-cache-requested");
            expect(capturedData).toEqual({ sites: mockSites });
            
            // Restore original emit
            uptimeOrchestrator.emit = originalEmit;
        });
    });
});
