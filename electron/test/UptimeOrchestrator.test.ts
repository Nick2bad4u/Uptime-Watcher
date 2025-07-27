/**
 * Comprehensive tests for UptimeOrchestrator with 100% branch coverage.
 * Tests all orchestration paths, error handling, and event coordination.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { UptimeOrchestrator, UptimeOrchestratorDependencies } from "../UptimeOrchestrator";
import { DatabaseManager } from "../managers/DatabaseManager";
import { MonitorManager } from "../managers/MonitorManager";
import { SiteManager } from "../managers/SiteManager";
import { Site, Monitor, StatusUpdate } from "../types";

// Mock all dependencies with proper typing
const mockDatabaseManager = {
    getHistoryLimit: vi.fn(() => 1000),
    setHistoryLimit: vi.fn(() => Promise.resolve()),
    downloadBackup: vi.fn(() =>
        Promise.resolve({
            buffer: Buffer.from("test"),
            fileName: "backup.db",
        })
    ),
    exportData: vi.fn(() => Promise.resolve('{"sites": []}')),
    importData: vi.fn(() => Promise.resolve(true)),
    initialize: vi.fn(() => Promise.resolve()),
} as unknown as DatabaseManager;

const mockMonitorManager = {
    setupSiteForMonitoring: vi.fn(() => Promise.resolve()),
    checkSiteManually: vi.fn(() =>
        Promise.resolve({
            siteIdentifier: "test-site",
            monitorId: "test-monitor",
            status: "up",
            timestamp: "2024-01-01T00:00:00.000Z",
            site: {
                identifier: "test-site",
                name: "Test Site",
                monitors: [],
                monitoring: true,
            },
        } as StatusUpdate)
    ),
    startMonitoringForSite: vi.fn(() => Promise.resolve(true)),
    stopMonitoringForSite: vi.fn(() => Promise.resolve(true)),
    startMonitoring: vi.fn(() => Promise.resolve()),
    stopMonitoring: vi.fn(() => Promise.resolve()),
} as unknown as MonitorManager;

const mockSiteManager = {
    addSite: vi.fn(() =>
        Promise.resolve({
            identifier: "test-site",
            name: "Test Site",
            monitors: [],
            monitoring: true,
        } as Site)
    ),
    removeSite: vi.fn(() => Promise.resolve(true)),
    updateSite: vi.fn(() =>
        Promise.resolve({
            identifier: "test-site",
            name: "Updated Site",
            monitors: [],
            monitoring: true,
        } as Site)
    ),
    getSites: vi.fn(() => Promise.resolve([])),
    removeMonitor: vi.fn(() => Promise.resolve(true)),
    initialize: vi.fn(() => Promise.resolve()),
} as unknown as SiteManager;

describe("UptimeOrchestrator", () => {
    let orchestrator: UptimeOrchestrator;
    let dependencies: UptimeOrchestratorDependencies;

    beforeEach(() => {
        dependencies = {
            databaseManager: mockDatabaseManager,
            monitorManager: mockMonitorManager,
            siteManager: mockSiteManager,
        };

        orchestrator = new UptimeOrchestrator(dependencies);
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Clean up any event listeners
        orchestrator.removeAllListeners();
    });

    describe("Constructor and Initialization", () => {
        it("should create orchestrator with valid dependencies", () => {
            expect(orchestrator).toBeDefined();
            expect(orchestrator.historyLimit).toBe(1000);
        });

        it("should throw error when dependencies are not provided", () => {
            expect(() => new UptimeOrchestrator()).toThrow("UptimeOrchestrator requires dependencies to be injected");
        });

        it("should throw error when dependencies are undefined", () => {
            expect(() => new UptimeOrchestrator(undefined)).toThrow(
                "UptimeOrchestrator requires dependencies to be injected"
            );
        });

        it("should initialize successfully", async () => {
            await expect(orchestrator.initialize()).resolves.not.toThrow();
            expect(mockDatabaseManager.initialize).toHaveBeenCalled();
            expect(mockSiteManager.initialize).toHaveBeenCalled();
        });

        it("should handle initialization errors", async () => {
            vi.mocked(mockDatabaseManager.initialize).mockRejectedValueOnce(new Error("Init failed"));

            await expect(orchestrator.initialize()).rejects.toThrow("Init failed");
        });
    });

    describe("Site Management", () => {
        const testSite: Site = {
            identifier: "test-site",
            name: "Test Site",
            monitors: [
                {
                    id: "monitor-1",
                    type: "http",
                    status: "pending",
                    history: [],
                    url: "https://example.com",
                    checkInterval: 30000,
                    timeout: 5000,
                    monitoring: true,
                    responseTime: 0,
                    retryAttempts: 3,
                } as Monitor,
            ],
            monitoring: true,
        };

        it("should add site successfully", async () => {
            const result = await orchestrator.addSite(testSite);

            expect(mockSiteManager.addSite).toHaveBeenCalledWith(testSite);
            expect(mockMonitorManager.setupSiteForMonitoring).toHaveBeenCalled();
            expect(result).toEqual(
                expect.objectContaining({
                    identifier: "test-site",
                    name: "Test Site",
                })
            );
        });

        it("should handle site addition failure and cleanup", async () => {
            vi.mocked(mockMonitorManager.setupSiteForMonitoring).mockRejectedValueOnce(new Error("Setup failed"));

            await expect(orchestrator.addSite(testSite)).rejects.toThrow("Setup failed");

            expect(mockSiteManager.removeSite).toHaveBeenCalledWith(testSite.identifier);
        });

        it("should handle cleanup failure during site addition rollback", async () => {
            vi.mocked(mockMonitorManager.setupSiteForMonitoring).mockRejectedValueOnce(new Error("Setup failed"));
            vi.mocked(mockSiteManager.removeSite).mockRejectedValueOnce(new Error("Cleanup failed"));

            await expect(orchestrator.addSite(testSite)).rejects.toThrow("Setup failed");

            expect(mockSiteManager.removeSite).toHaveBeenCalledWith(testSite.identifier);
        });

        it("should remove site successfully", async () => {
            const result = await orchestrator.removeSite("test-site");

            expect(mockSiteManager.removeSite).toHaveBeenCalledWith("test-site");
            expect(result).toBe(true);
        });

        it("should update site successfully", async () => {
            const updateData: Partial<Site> = { name: "Updated Site" };
            const result = await orchestrator.updateSite("test-site", updateData);

            expect(mockSiteManager.updateSite).toHaveBeenCalledWith("test-site", updateData);
            expect(result).toEqual(
                expect.objectContaining({
                    name: "Updated Site",
                })
            );
        });

        it("should get sites successfully", async () => {
            const result = await orchestrator.getSites();

            expect(mockSiteManager.getSites).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe("Monitor Management", () => {
        it("should check site manually", async () => {
            const result = await orchestrator.checkSiteManually("test-site", "monitor-1");

            expect(mockMonitorManager.checkSiteManually).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(result).toEqual(
                expect.objectContaining({
                    siteIdentifier: "test-site",
                    status: "up",
                })
            );
        });

        it("should check site manually without monitor ID", async () => {
            const result = await orchestrator.checkSiteManually("test-site");

            expect(mockMonitorManager.checkSiteManually).toHaveBeenCalledWith("test-site", undefined);
            expect(result).toBeDefined();
        });

        it("should start monitoring for site", async () => {
            const result = await orchestrator.startMonitoringForSite("test-site", "monitor-1");

            expect(mockMonitorManager.startMonitoringForSite).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(result).toBe(true);
        });

        it("should start monitoring for site without monitor ID", async () => {
            const result = await orchestrator.startMonitoringForSite("test-site");

            expect(mockMonitorManager.startMonitoringForSite).toHaveBeenCalledWith("test-site", undefined);
            expect(result).toBe(true);
        });

        it("should stop monitoring for site", async () => {
            const result = await orchestrator.stopMonitoringForSite("test-site", "monitor-1");

            expect(mockMonitorManager.stopMonitoringForSite).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(result).toBe(true);
        });

        it("should stop monitoring for site without monitor ID", async () => {
            const result = await orchestrator.stopMonitoringForSite("test-site");

            expect(mockMonitorManager.stopMonitoringForSite).toHaveBeenCalledWith("test-site", undefined);
            expect(result).toBe(true);
        });

        it("should remove monitor successfully", async () => {
            const result = await orchestrator.removeMonitor("test-site", "monitor-1");

            expect(mockMonitorManager.stopMonitoringForSite).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(mockSiteManager.removeMonitor).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(result).toBe(true);
        });

        it("should handle monitor removal with failed stop monitoring", async () => {
            vi.mocked(mockMonitorManager.stopMonitoringForSite).mockResolvedValueOnce(false);

            const result = await orchestrator.removeMonitor("test-site", "monitor-1");

            expect(mockSiteManager.removeMonitor).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(result).toBe(true);
        });

        it("should handle monitor removal with failed database removal", async () => {
            vi.mocked(mockSiteManager.removeMonitor).mockResolvedValueOnce(false);

            const result = await orchestrator.removeMonitor("test-site", "monitor-1");

            expect(mockMonitorManager.startMonitoringForSite).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(result).toBe(false);
        });

        it("should handle monitor removal with failed restart after failed removal", async () => {
            vi.mocked(mockSiteManager.removeMonitor).mockResolvedValueOnce(false);
            vi.mocked(mockMonitorManager.startMonitoringForSite).mockRejectedValueOnce(new Error("Restart failed"));

            const result = await orchestrator.removeMonitor("test-site", "monitor-1");

            expect(result).toBe(false);
        });

        it("should handle monitor removal errors", async () => {
            vi.mocked(mockMonitorManager.stopMonitoringForSite).mockRejectedValueOnce(new Error("Stop failed"));

            await expect(orchestrator.removeMonitor("test-site", "monitor-1")).rejects.toThrow("Stop failed");
        });
    });

    describe("Global Monitoring Control", () => {
        it("should start monitoring", async () => {
            await orchestrator.startMonitoring();

            expect(mockMonitorManager.startMonitoring).toHaveBeenCalled();
        });

        it("should stop monitoring", async () => {
            await orchestrator.stopMonitoring();

            expect(mockMonitorManager.stopMonitoring).toHaveBeenCalled();
        });
    });

    describe("Data Management", () => {
        it("should download backup successfully", async () => {
            const result = await orchestrator.downloadBackup();

            expect(mockDatabaseManager.downloadBackup).toHaveBeenCalled();
            expect(result).toEqual({
                buffer: expect.any(Buffer),
                fileName: "backup.db",
            });
        });

        it("should export data successfully", async () => {
            const result = await orchestrator.exportData();

            expect(mockDatabaseManager.exportData).toHaveBeenCalled();
            expect(result).toBe('{"sites": []}');
        });

        it("should import data successfully", async () => {
            const testData = '{"sites": []}';
            const result = await orchestrator.importData(testData);

            expect(mockDatabaseManager.importData).toHaveBeenCalledWith(testData);
            expect(result).toBe(true);
        });

        it("should get history limit", () => {
            const result = orchestrator.getHistoryLimit();

            expect(mockDatabaseManager.getHistoryLimit).toHaveBeenCalled();
            expect(result).toBe(1000);
        });

        it("should set history limit successfully", async () => {
            await orchestrator.setHistoryLimit(500);

            expect(mockDatabaseManager.setHistoryLimit).toHaveBeenCalledWith(500);
        });
    });

    describe("Event Handling", () => {
        it("should handle events without errors", () => {
            // Test that the orchestrator can emit events
            expect(() => {
                orchestrator.emitTyped("site:added", {
                    site: {
                        identifier: "test-site",
                        name: "Test Site",
                        monitors: [],
                        monitoring: true,
                    },
                    source: "user",
                    timestamp: Date.now(),
                });
            }).not.toThrow();
        });

        it("should handle monitor status change events", () => {
            expect(() => {
                orchestrator.emitTyped("monitor:status-changed", {
                    monitor: {
                        id: "monitor-1",
                        type: "http",
                        status: "up",
                        history: [],
                        checkInterval: 30000,
                        monitoring: true,
                        responseTime: 100,
                        retryAttempts: 3,
                        timeout: 5000,
                    },
                    newStatus: "up",
                    previousStatus: "down",
                    responseTime: 100,
                    site: {
                        identifier: "test-site",
                        name: "Test Site",
                        monitors: [],
                        monitoring: true,
                    },
                    siteId: "test-site",
                    timestamp: Date.now(),
                });
            }).not.toThrow();
        });
    });

    describe("Property Access", () => {
        it("should access history limit property", () => {
            expect(orchestrator.historyLimit).toBe(1000);
            expect(mockDatabaseManager.getHistoryLimit).toHaveBeenCalled();
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty site data", async () => {
            const emptySite: Site = {
                identifier: "",
                name: "",
                monitors: [],
                monitoring: false,
            };

            await expect(orchestrator.addSite(emptySite)).resolves.toBeDefined();
        });

        it("should handle undefined monitor ID in manual check", async () => {
            const result = await orchestrator.checkSiteManually("test-site", undefined);

            expect(mockMonitorManager.checkSiteManually).toHaveBeenCalledWith("test-site", undefined);
            expect(result).toBeDefined();
        });
    });

    describe("Error Scenarios", () => {
        it("should handle database manager errors", async () => {
            vi.mocked(mockDatabaseManager.exportData).mockRejectedValueOnce(new Error("Database error"));

            await expect(orchestrator.exportData()).rejects.toThrow("Database error");
        });

        it("should handle monitor manager errors", async () => {
            vi.mocked(mockMonitorManager.checkSiteManually).mockRejectedValueOnce(new Error("Monitor error"));

            await expect(orchestrator.checkSiteManually("test-site")).rejects.toThrow("Monitor error");
        });

        it("should handle site manager errors", async () => {
            vi.mocked(mockSiteManager.addSite).mockRejectedValueOnce(new Error("Site error"));

            const testSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            await expect(orchestrator.addSite(testSite)).rejects.toThrow("Site error");
        });
    });
});
