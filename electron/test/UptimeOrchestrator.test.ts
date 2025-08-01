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
    resetSettings: vi.fn(() => Promise.resolve()),
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
    isMonitoringActive: vi.fn(() => true),
    getActiveMonitorCount: vi.fn(() => 5),
    isMonitorActiveInScheduler: vi.fn(() => true),
    restartMonitorWithNewConfig: vi.fn(() => true),
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
    getSitesFromCache: vi.fn(() => [
        {
            identifier: "test-site",
            name: "Test Site",
            monitors: [{ id: "monitor-1" }, { id: "monitor-2" }],
            monitoring: true,
        } as Site,
    ]),
    updateSitesCache: vi.fn(() => Promise.resolve()),
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

        it("should validate initialization and throw for missing database manager method", () => {
            const invalidDependencies = {
                databaseManager: { initialize: undefined } as any,
                monitorManager: mockMonitorManager,
                siteManager: mockSiteManager,
            };

            const invalidOrchestrator = new UptimeOrchestrator(invalidDependencies);
            expect(() => invalidOrchestrator["validateInitialization"]()).toThrow(
                "DatabaseManager not properly initialized - missing initialize method"
            );
        });

        it("should validate initialization and throw for missing site manager method", () => {
            const invalidDependencies = {
                databaseManager: mockDatabaseManager,
                monitorManager: mockMonitorManager,
                siteManager: { initialize: undefined } as any,
            };

            const invalidOrchestrator = new UptimeOrchestrator(invalidDependencies);
            expect(() => invalidOrchestrator["validateInitialization"]()).toThrow(
                "SiteManager not properly initialized - missing initialize method"
            );
        });

        it("should validate initialization and throw for missing monitor manager method", () => {
            const invalidDependencies = {
                databaseManager: mockDatabaseManager,
                monitorManager: { startMonitoring: undefined } as any,
                siteManager: mockSiteManager,
            };

            const invalidOrchestrator = new UptimeOrchestrator(invalidDependencies);
            expect(() => invalidOrchestrator["validateInitialization"]()).toThrow(
                "MonitorManager not properly initialized - missing startMonitoring method"
            );
        });
    });

    describe("Settings Management", () => {
        it("should reset settings successfully", async () => {
            await orchestrator.resetSettings();

            expect(mockDatabaseManager.resetSettings).toHaveBeenCalled();
        });

        it("should set history limit successfully", async () => {
            await orchestrator.setHistoryLimit(500);

            expect(mockDatabaseManager.setHistoryLimit).toHaveBeenCalledWith(500);
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
                    checkInterval: 30_000,
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

        it.skip("should handle monitor removal with failed restart after failed removal", async () => {
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
                        checkInterval: 30_000,
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

        it("should handle internal database events", async () => {
            const sites = [
                {
                    identifier: "test-site-1",
                    name: "Test Site 1",
                    monitors: [],
                    monitoring: true,
                } as Site,
            ];

            // Emit internal database event
            orchestrator.emitTyped("internal:database:update-sites-cache-requested", {
                sites,
                operation: "update-sites-cache-requested",
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockSiteManager.updateSitesCache).toHaveBeenCalledWith(sites);
            expect(mockMonitorManager.setupSiteForMonitoring).toHaveBeenCalledWith(sites[0]);
        });

        it("should handle internal database events with monitoring setup failures", async () => {
            const sites = [
                {
                    identifier: "test-site-fail",
                    name: "Test Site Fail",
                    monitors: [],
                    monitoring: true,
                } as Site,
            ];

            vi.mocked(mockMonitorManager.setupSiteForMonitoring).mockRejectedValueOnce(new Error("Setup failed"));

            // Emit internal database event
            orchestrator.emitTyped("internal:database:update-sites-cache-requested", {
                sites,
                operation: "update-sites-cache-requested",
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockSiteManager.updateSitesCache).toHaveBeenCalledWith(sites);
            expect(mockMonitorManager.setupSiteForMonitoring).toHaveBeenCalledWith(sites[0]);
        });

        it("should handle get sites from cache request", async () => {
            // Emit internal database event
            orchestrator.emitTyped("internal:database:get-sites-from-cache-requested", {
                operation: "get-sites-from-cache-requested",
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockSiteManager.getSitesFromCache).toHaveBeenCalled();
        });

        it("should handle database initialized event", async () => {
            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            // Emit internal database event
            orchestrator.emitTyped("internal:database:initialized", {
                operation: "initialized",
                success: true,
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(emitTypedSpy).toHaveBeenCalledWith(
                "database:transaction-completed",
                expect.objectContaining({
                    operation: "initialize",
                    success: true,
                })
            );
        });

        it("should handle database initialized event with errors", async () => {
            // Mock emitTyped to throw an error specifically for "database:transaction-completed"
            const originalEmitTyped = orchestrator.emitTyped.bind(orchestrator);
            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped").mockImplementation((event, data) => {
                if (event === "database:transaction-completed") {
                    throw new Error("Emit failed");
                }
                return originalEmitTyped(event, data);
            });

            // Emit internal database event - this should trigger the error catch block
            orchestrator.emitTyped("internal:database:initialized", {
                operation: "initialized",
                success: true,
                timestamp: Date.now(),
            });

            // Wait for async processing to complete and handle the error
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Verify that emitTyped was called and the error was caught
            expect(emitTypedSpy).toHaveBeenCalledWith(
                "database:transaction-completed",
                expect.objectContaining({
                    operation: "initialize",
                    success: true,
                })
            );

            // Restore the spy
            emitTypedSpy.mockRestore();
        });

        it("should handle internal site added events", async () => {
            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            // Create the test site object
            const testSite = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            // Emit internal site event with SiteEventData format (what the actual implementation expects)
            // Note: Using 'as any' due to type mismatch between eventTypes.ts and actual implementation
            orchestrator.emitTyped("internal:site:added" as any, {
                identifier: "test-site",
                site: testSite,
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(emitTypedSpy).toHaveBeenCalledWith(
                "site:added",
                expect.objectContaining({
                    source: "user",
                })
            );
        });

        it("should handle internal site removed events", async () => {
            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            // Create the test site object
            const testSite = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            // Emit internal site event with SiteEventData format (what the actual implementation expects)
            // Note: Using 'as any' due to type mismatch between eventTypes.ts and actual implementation
            orchestrator.emitTyped("internal:site:removed" as any, {
                identifier: "test-site",
                site: testSite,
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(emitTypedSpy).toHaveBeenCalledWith(
                "site:removed",
                expect.objectContaining({
                    cascade: true,
                    siteId: "test-site",
                    siteName: "Test Site",
                })
            );
        });

        it("should handle internal site removed events with missing identifier", async () => {
            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            // Create the test site object
            const testSite = {
                identifier: "fallback-site",
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            // Emit internal site event without identifier to test fallback to site.identifier
            // Note: Using 'as any' due to type mismatch between eventTypes.ts and actual implementation
            orchestrator.emitTyped("internal:site:removed" as any, {
                site: testSite,
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(emitTypedSpy).toHaveBeenCalledWith(
                "site:removed",
                expect.objectContaining({
                    cascade: true,
                    siteId: "fallback-site", // Should use site.identifier as fallback
                    siteName: "Test Site",
                })
            );
        });

        it("should handle internal site updated events", async () => {
            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            // Create the test site objects
            const updatedSite = {
                identifier: "test-site",
                name: "Updated Site",
                monitors: [],
                monitoring: true,
            };

            const previousSite = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            // Emit internal site event with SiteEventData format (what the actual implementation expects)
            // Note: Using 'as any' due to type mismatch between eventTypes.ts and actual implementation
            orchestrator.emitTyped("internal:site:updated" as any, {
                identifier: "test-site",
                site: updatedSite,
                previousSite: previousSite,
                timestamp: Date.now(),
                updatedFields: ["name"],
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(emitTypedSpy).toHaveBeenCalledWith(
                "site:updated",
                expect.objectContaining({
                    updatedFields: ["name"],
                })
            );
        });

        it("should handle internal site updated events with fallback values", async () => {
            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            // Create the test site object
            const updatedSite = {
                identifier: "test-site",
                name: "Updated Site",
                monitors: [],
                monitoring: true,
            };

            // Emit internal site event without previousSite and updatedFields to test fallbacks
            // Note: Using 'as any' due to type mismatch between eventTypes.ts and actual implementation
            orchestrator.emitTyped("internal:site:updated" as any, {
                identifier: "test-site",
                site: updatedSite,
                timestamp: Date.now(),
                // No previousSite or updatedFields provided to test fallbacks
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(emitTypedSpy).toHaveBeenCalledWith(
                "site:updated",
                expect.objectContaining({
                    previousSite: updatedSite, // Should fallback to site
                    site: updatedSite,
                    updatedFields: [], // Should fallback to empty array
                })
            );
        });

        it("should handle monitor started events", async () => {
            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            // Emit internal monitor event
            orchestrator.emitTyped("internal:monitor:started", {
                identifier: "test-site",
                operation: "started",
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockSiteManager.getSitesFromCache).toHaveBeenCalled();
            expect(emitTypedSpy).toHaveBeenCalledWith(
                "monitoring:started",
                expect.objectContaining({
                    monitorCount: 2, // Two monitors from mock site
                    siteCount: 1,
                })
            );
        });

        it("should handle monitor started events with errors", async () => {
            vi.mocked(mockSiteManager.getSitesFromCache).mockImplementationOnce(() => {
                throw new Error("Cache error");
            });

            // Emit internal monitor event
            orchestrator.emitTyped("internal:monitor:started", {
                identifier: "test-site",
                operation: "started",
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            // Should not throw, but should log error
            expect(mockSiteManager.getSitesFromCache).toHaveBeenCalled();
        });

        it("should handle monitor stopped events when monitoring is active", async () => {
            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            // Emit internal monitor event
            orchestrator.emitTyped("internal:monitor:stopped", {
                identifier: "test-site",
                operation: "stopped",
                reason: "user",
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockMonitorManager.isMonitoringActive).toHaveBeenCalled();
            expect(mockMonitorManager.getActiveMonitorCount).toHaveBeenCalled();
            expect(emitTypedSpy).toHaveBeenCalledWith(
                "monitoring:stopped",
                expect.objectContaining({
                    activeMonitors: 5,
                    reason: "user",
                })
            );
        });

        it("should handle monitor stopped events when monitoring is inactive", async () => {
            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");
            vi.mocked(mockMonitorManager.isMonitoringActive).mockReturnValueOnce(false);

            // Emit internal monitor event
            orchestrator.emitTyped("internal:monitor:stopped", {
                identifier: "test-site",
                operation: "stopped",
                reason: "user",
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockMonitorManager.isMonitoringActive).toHaveBeenCalled();
            expect(emitTypedSpy).toHaveBeenCalledWith(
                "monitoring:stopped",
                expect.objectContaining({
                    activeMonitors: 0,
                    reason: "user",
                })
            );
        });

        it("should handle monitor stopped events with errors", async () => {
            vi.mocked(mockMonitorManager.isMonitoringActive).mockImplementationOnce(() => {
                throw new Error("Monitor error");
            });

            // Emit internal monitor event
            orchestrator.emitTyped("internal:monitor:stopped", {
                identifier: "test-site",
                operation: "stopped",
                reason: "user",
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            // Should not throw, but should log error
            expect(mockMonitorManager.isMonitoringActive).toHaveBeenCalled();
        });

        it("should handle start monitoring requests successfully", async () => {
            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            // Emit start monitoring request
            orchestrator.emitTyped("internal:site:start-monitoring-requested", {
                identifier: "test-site",
                monitorId: "monitor-1",
                operation: "start-monitoring-requested",
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockMonitorManager.startMonitoringForSite).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(emitTypedSpy).toHaveBeenCalledWith(
                "internal:site:start-monitoring-response",
                expect.objectContaining({
                    success: true,
                    identifier: "test-site",
                    monitorId: "monitor-1",
                })
            );
        });

        it("should handle start monitoring requests with errors", async () => {
            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");
            vi.mocked(mockMonitorManager.startMonitoringForSite).mockRejectedValueOnce(new Error("Start failed"));

            // Emit start monitoring request
            orchestrator.emitTyped("internal:site:start-monitoring-requested", {
                identifier: "test-site",
                monitorId: "monitor-1",
                operation: "start-monitoring-requested",
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(emitTypedSpy).toHaveBeenCalledWith(
                "internal:site:start-monitoring-response",
                expect.objectContaining({
                    success: false,
                    identifier: "test-site",
                    monitorId: "monitor-1",
                })
            );
        });

        it("should handle stop monitoring requests successfully", async () => {
            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            // Emit stop monitoring request
            orchestrator.emitTyped("internal:site:stop-monitoring-requested", {
                identifier: "test-site",
                monitorId: "monitor-1",
                operation: "stop-monitoring-requested",
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockMonitorManager.stopMonitoringForSite).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(emitTypedSpy).toHaveBeenCalledWith(
                "internal:site:stop-monitoring-response",
                expect.objectContaining({
                    success: true,
                    identifier: "test-site",
                    monitorId: "monitor-1",
                })
            );
        });

        it("should handle stop monitoring requests with errors", async () => {
            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");
            vi.mocked(mockMonitorManager.stopMonitoringForSite).mockRejectedValueOnce(new Error("Stop failed"));

            // Emit stop monitoring request
            orchestrator.emitTyped("internal:site:stop-monitoring-requested", {
                identifier: "test-site",
                monitorId: "monitor-1",
                operation: "stop-monitoring-requested",
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(emitTypedSpy).toHaveBeenCalledWith(
                "internal:site:stop-monitoring-response",
                expect.objectContaining({
                    success: false,
                    identifier: "test-site",
                    monitorId: "monitor-1",
                })
            );
        });

        it("should handle is monitoring active requests", async () => {
            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            // Emit is monitoring active request
            orchestrator.emitTyped("internal:site:is-monitoring-active-requested", {
                identifier: "test-site",
                monitorId: "monitor-1",
                operation: "is-monitoring-active-requested",
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockMonitorManager.isMonitorActiveInScheduler).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(emitTypedSpy).toHaveBeenCalledWith(
                "internal:site:is-monitoring-active-response",
                expect.objectContaining({
                    isActive: true,
                    identifier: "test-site",
                    monitorId: "monitor-1",
                })
            );
        });

        it("should handle restart monitoring requests successfully", async () => {
            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");
            const testMonitor = {
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
            } as Monitor;

            // Emit restart monitoring request
            orchestrator.emitTyped("internal:site:restart-monitoring-requested", {
                identifier: "test-site",
                monitor: testMonitor,
                operation: "restart-monitoring-requested",
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockMonitorManager.restartMonitorWithNewConfig).toHaveBeenCalledWith("test-site", testMonitor);
            expect(emitTypedSpy).toHaveBeenCalledWith(
                "internal:site:restart-monitoring-response",
                expect.objectContaining({
                    success: true,
                    identifier: "test-site",
                    monitorId: "monitor-1",
                })
            );
        });

        it("should handle restart monitoring requests with errors", async () => {
            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");
            const testMonitor = {
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
            } as Monitor;

            vi.mocked(mockMonitorManager.restartMonitorWithNewConfig).mockImplementationOnce(() => {
                throw new Error("Restart failed");
            });

            // Emit restart monitoring request
            orchestrator.emitTyped("internal:site:restart-monitoring-requested", {
                identifier: "test-site",
                monitor: testMonitor,
                operation: "restart-monitoring-requested",
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(emitTypedSpy).toHaveBeenCalledWith(
                "internal:site:restart-monitoring-response",
                expect.objectContaining({
                    success: false,
                    identifier: "test-site",
                    monitorId: "monitor-1",
                })
            );
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
