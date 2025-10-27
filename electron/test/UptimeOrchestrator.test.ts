/**
 * Comprehensive tests for UptimeOrchestrator with 100% branch coverage. Tests
 * all orchestration paths, error handling, and event coordination.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { UptimeOrchestrator } from "../UptimeOrchestrator";
import type { UptimeOrchestratorDependencies } from "../UptimeOrchestrator.types";
import { DatabaseManager } from "../managers/DatabaseManager";
import { MonitorManager } from "../managers/MonitorManager";
import { SiteManager } from "../managers/SiteManager";
import type { Site, Monitor, StatusUpdate } from "@shared/types";
import { STATE_SYNC_ACTION, STATE_SYNC_SOURCE } from "@shared/types/stateSync";
import { ApplicationError } from "@shared/utils/errorHandling";

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
    getSiteFromCache: vi.fn((_identifier?: string) => ({
        identifier: "test-site",
        name: "Test Site",
        monitors: [
            { id: "monitor-1", monitoring: true },
            { id: "monitor-2", monitoring: false },
        ] as unknown as Monitor[],
        monitoring: true,
    })),
    deleteAllSites: vi.fn(() => Promise.resolve(0)),
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
    removeMonitor: vi.fn(() =>
        Promise.resolve({
            identifier: "test-site",
            name: "Test Site",
            monitors: [
                { id: "monitor-2", monitoring: false },
            ] as unknown as Monitor[],
            monitoring: true,
        } as Site)
    ),
    initialize: vi.fn(() => Promise.resolve()),
} as unknown as SiteManager;

describe(UptimeOrchestrator, () => {
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
        it("should create orchestrator with valid dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Constructor", "type");

            expect(orchestrator).toBeDefined();
            expect(orchestrator.historyLimit).toBe(1000);
        });

        it("should throw error when dependencies are not provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            expect(() => new UptimeOrchestrator()).toThrow(
                "UptimeOrchestrator requires dependencies to be injected"
            );
        });

        it("should throw error when dependencies are undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            expect(() => new UptimeOrchestrator(undefined)).toThrow(
                "UptimeOrchestrator requires dependencies to be injected"
            );
        });

        it("should initialize successfully", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Initialization", "type");

            await expect(orchestrator.initialize()).resolves.not.toThrow();
            expect(mockDatabaseManager.initialize).toHaveBeenCalled();
            expect(mockSiteManager.initialize).toHaveBeenCalled();
        });

        it("should handle initialization errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Initialization", "type");

            vi.mocked(mockDatabaseManager.initialize).mockRejectedValueOnce(
                new Error("Init failed")
            );

            const error = (await orchestrator
                .initialize()
                .catch((error_) => error_)) as ApplicationError;

            expect(error).toBeInstanceOf(ApplicationError);
            expect(error).toMatchObject({
                code: "ORCHESTRATOR_INITIALIZE_FAILED",
                message: "Failed to initialize orchestrator",
            });
            expect(error.cause).toBeInstanceOf(Error);
            expect((error.cause as Error).message).toBe("Init failed");
        });

        it("should validate initialization and throw for missing database manager method", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Initialization", "type");

            const invalidDependencies = {
                databaseManager: {
                    getHistoryLimit: (): number => 1000,
                    initialize: undefined,
                } as any,
                monitorManager: mockMonitorManager,
                siteManager: mockSiteManager,
            };

            const invalidOrchestrator = new UptimeOrchestrator(
                invalidDependencies
            );
            expect(() =>
                invalidOrchestrator["validateInitialization"]()
            ).toThrow(
                "DatabaseManager not properly initialized - missing initialize method"
            );
        });

        it("should validate initialization and throw for missing site manager method", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Initialization", "type");

            const invalidDependencies = {
                databaseManager: mockDatabaseManager,
                monitorManager: mockMonitorManager,
                siteManager: { initialize: undefined } as any,
            };

            const invalidOrchestrator = new UptimeOrchestrator(
                invalidDependencies
            );
            expect(() =>
                invalidOrchestrator["validateInitialization"]()
            ).toThrow(
                "SiteManager not properly initialized - missing initialize method"
            );
        });

        it("should validate initialization and throw for missing monitor manager method", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Initialization", "type");

            const invalidDependencies = {
                databaseManager: mockDatabaseManager,
                monitorManager: { startMonitoring: undefined } as any,
                siteManager: mockSiteManager,
            };

            const invalidOrchestrator = new UptimeOrchestrator(
                invalidDependencies
            );
            expect(() =>
                invalidOrchestrator["validateInitialization"]()
            ).toThrow(
                "MonitorManager not properly initialized - missing startMonitoring method"
            );
        });
    });

    describe("internal:database:history-limit-updated event", () => {
        it("should forward history limit updates with previous limit tracking", async () => {
            const handler = vi.fn();
            orchestrator.on("settings:history-limit-updated", handler);

            const firstPayload = {
                limit: 750,
                operation: "history-limit-updated" as const,
                timestamp: Date.now(),
            };

            await orchestrator.emitTyped(
                "internal:database:history-limit-updated",
                firstPayload
            );

            await new Promise((resolve) => setImmediate(resolve));

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...firstPayload,
                    previousLimit: 1000,
                })
            );

            const secondPayload = {
                limit: 600,
                operation: "history-limit-updated" as const,
                timestamp: firstPayload.timestamp + 1,
            };

            await orchestrator.emitTyped(
                "internal:database:history-limit-updated",
                secondPayload
            );

            await new Promise((resolve) => setImmediate(resolve));

            expect(handler).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    ...secondPayload,
                    previousLimit: 750,
                })
            );
        });

        it("should ignore payloads with invalid limits", async () => {
            const handler = vi.fn();
            orchestrator.on("settings:history-limit-updated", handler);

            await orchestrator.emitTyped(
                "internal:database:history-limit-updated",
                {
                    limit: -5,
                    operation: "history-limit-updated" as const,
                    timestamp: Date.now(),
                }
            );

            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe("Settings Management", () => {
        it("should reset settings successfully", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            await orchestrator.resetSettings();

            expect(mockDatabaseManager.resetSettings).toHaveBeenCalled();
        });

        it("should set history limit successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Configuration", "type");

            await orchestrator.setHistoryLimit(500);

            expect(mockDatabaseManager.setHistoryLimit).toHaveBeenCalledWith(
                500
            );
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

        it("should add site successfully", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const result = await orchestrator.addSite(testSite);

            expect(mockSiteManager.addSite).toHaveBeenCalledWith(testSite);
            expect(
                mockMonitorManager.setupSiteForMonitoring
            ).toHaveBeenCalled();
            expect(result).toEqual(
                expect.objectContaining({
                    identifier: "test-site",
                    name: "Test Site",
                })
            );
        });

        it("should handle site addition failure and cleanup", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(
                mockMonitorManager.setupSiteForMonitoring
            ).mockRejectedValueOnce(new Error("Setup failed"));

            const error = (await orchestrator
                .addSite(testSite)
                .catch((error_) => error_)) as ApplicationError;

            expect(error).toBeInstanceOf(ApplicationError);
            expect(error).toMatchObject({
                code: "ORCHESTRATOR_ADD_SITE_FAILED",
                message: "Failed to add site test-site",
            });
            expect(error.cause).toBeInstanceOf(Error);
            expect((error.cause as Error).message).toBe("Setup failed");

            expect(mockSiteManager.removeSite).toHaveBeenCalledWith(
                testSite.identifier
            );
        });

        it("should handle cleanup failure during site addition rollback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(
                mockMonitorManager.setupSiteForMonitoring
            ).mockRejectedValueOnce(new Error("Setup failed"));
            vi.mocked(mockSiteManager.removeSite).mockRejectedValueOnce(
                new Error("Cleanup failed")
            );

            const error = (await orchestrator
                .addSite(testSite)
                .catch((error_) => error_)) as ApplicationError;

            expect(error).toBeInstanceOf(ApplicationError);
            expect(error).toMatchObject({
                code: "ORCHESTRATOR_ADD_SITE_FAILED",
                message: "Failed to add site test-site",
            });
            expect(error.cause).toBeInstanceOf(Error);
            expect((error.cause as Error).message).toBe("Setup failed");

            expect(mockSiteManager.removeSite).toHaveBeenCalledWith(
                testSite.identifier
            );
        });

        it("should remove site successfully", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Deletion", "type");

            vi.mocked(
                mockMonitorManager.stopMonitoringForSite
            ).mockResolvedValueOnce(true);
            vi.mocked(mockSiteManager.removeSite).mockResolvedValueOnce(true);

            const result = await orchestrator.removeSite("test-site");

            expect(
                mockMonitorManager.stopMonitoringForSite
            ).toHaveBeenCalledWith("test-site");
            expect(mockSiteManager.removeSite).toHaveBeenCalledWith(
                "test-site"
            );
            expect(
                mockMonitorManager.startMonitoringForSite
            ).not.toHaveBeenCalled();
            expect(result).toBeTruthy();
        });

        it("should abort removal when monitoring stop fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(
                mockMonitorManager.stopMonitoringForSite
            ).mockResolvedValueOnce(false);

            const result = await orchestrator.removeSite("site-failure");

            expect(result).toBeFalsy();
            expect(mockSiteManager.removeSite).not.toHaveBeenCalled();
            expect(
                mockMonitorManager.startMonitoringForSite
            ).not.toHaveBeenCalled();
        });

        it("should restart monitoring when deletion fails but monitoring stopped", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(
                mockMonitorManager.stopMonitoringForSite
            ).mockResolvedValueOnce(true);
            vi.mocked(mockSiteManager.removeSite).mockResolvedValueOnce(false);

            const result = await orchestrator.removeSite("test-site");

            expect(result).toBeFalsy();
            expect(
                mockMonitorManager.startMonitoringForSite
            ).toHaveBeenCalledWith("test-site", "monitor-1");
        });

        it("should emit critical error when monitor restart fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(
                mockMonitorManager.stopMonitoringForSite
            ).mockResolvedValueOnce(true);
            vi.mocked(mockSiteManager.removeSite).mockResolvedValueOnce(false);
            vi.mocked(
                mockMonitorManager.startMonitoringForSite
            ).mockResolvedValueOnce(false);

            const error = (await orchestrator
                .removeSite("test-site")
                .catch((error_) => error_)) as ApplicationError;

            expect(error).toBeInstanceOf(ApplicationError);
            expect(error).toMatchObject({
                code: "ORCHESTRATOR_REMOVE_SITE_FAILED",
                message: "Failed to remove site test-site",
            });
            expect(error.cause).toBeInstanceOf(Error);
            expect((error.cause as Error).message).toMatch(
                /Critical state inconsistency/
            );
        });

        it("should stop monitoring before deleting all sites", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Deletion", "type");

            vi.mocked(mockSiteManager.deleteAllSites).mockResolvedValueOnce(4);

            const result = await orchestrator.deleteAllSites();

            expect(mockMonitorManager.stopMonitoring).toHaveBeenCalled();
            expect(mockSiteManager.deleteAllSites).toHaveBeenCalled();
            expect(result).toBe(4);
        });

        it("should update site successfully", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            const updateData: Partial<Site> = { name: "Updated Site" };
            const result = await orchestrator.updateSite(
                "test-site",
                updateData
            );

            expect(mockSiteManager.updateSite).toHaveBeenCalledWith(
                "test-site",
                updateData
            );
            expect(result).toEqual(
                expect.objectContaining({
                    name: "Updated Site",
                })
            );
        });

        it("should get sites successfully", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Retrieval", "type");

            const result = await orchestrator.getSites();

            expect(mockSiteManager.getSites).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe("Monitor Management", () => {
        it("should check site manually", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const result = await orchestrator.checkSiteManually(
                "test-site",
                "monitor-1"
            );

            expect(mockMonitorManager.checkSiteManually).toHaveBeenCalledWith(
                "test-site",
                "monitor-1"
            );
            expect(result).toEqual(
                expect.objectContaining({
                    siteIdentifier: "test-site",
                    status: "up",
                })
            );
        });

        it("should check site manually without monitor ID", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const result = await orchestrator.checkSiteManually("test-site");

            expect(mockMonitorManager.checkSiteManually).toHaveBeenCalledWith(
                "test-site",
                undefined
            );
            expect(result).toBeDefined();
        });

        it("should start monitoring for site", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const result = await orchestrator.startMonitoringForSite(
                "test-site",
                "monitor-1"
            );

            expect(
                mockMonitorManager.startMonitoringForSite
            ).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(result).toBeTruthy();
        });

        it("should start monitoring for site without monitor ID", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const result =
                await orchestrator.startMonitoringForSite("test-site");

            expect(
                mockMonitorManager.startMonitoringForSite
            ).toHaveBeenCalledWith("test-site", undefined);
            expect(result).toBeTruthy();
        });

        it("should stop monitoring for site", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const result = await orchestrator.stopMonitoringForSite(
                "test-site",
                "monitor-1"
            );

            expect(
                mockMonitorManager.stopMonitoringForSite
            ).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(result).toBeTruthy();
        });

        it("should stop monitoring for site without monitor ID", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const result =
                await orchestrator.stopMonitoringForSite("test-site");

            expect(
                mockMonitorManager.stopMonitoringForSite
            ).toHaveBeenCalledWith("test-site", undefined);
            expect(result).toBeTruthy();
        });

        it("should remove monitor successfully", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Deletion", "type");

            const result = await orchestrator.removeMonitor(
                "test-site",
                "monitor-1"
            );

            expect(
                mockMonitorManager.stopMonitoringForSite
            ).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(mockSiteManager.removeMonitor).toHaveBeenCalledWith(
                "test-site",
                "monitor-1"
            );
            expect(result).toEqual(
                expect.objectContaining({ identifier: "test-site" })
            );
        });

        it("should handle monitor removal with failed stop monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(
                mockMonitorManager.stopMonitoringForSite
            ).mockResolvedValueOnce(false);

            const result = await orchestrator.removeMonitor(
                "test-site",
                "monitor-1"
            );

            expect(mockSiteManager.removeMonitor).toHaveBeenCalledWith(
                "test-site",
                "monitor-1"
            );
            expect(result).toBeTruthy();
        });

        it("should handle monitor removal with failed database removal", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            const removalError = new Error("Database removal failed");
            vi.mocked(mockSiteManager.removeMonitor).mockRejectedValueOnce(
                removalError
            );

            const error = (await orchestrator
                .removeMonitor("test-site", "monitor-1")
                .catch((error_) => error_)) as ApplicationError;

            expect(
                mockMonitorManager.startMonitoringForSite
            ).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(error).toBeInstanceOf(ApplicationError);
            expect(error).toMatchObject({
                code: "ORCHESTRATOR_REMOVE_MONITOR_FAILED",
                message: "Failed to remove monitor test-site/monitor-1",
            });
            expect(error.cause).toBe(removalError);
        });

        it("should handle monitor removal with failed restart after failed removal", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(mockSiteManager.removeMonitor).mockRejectedValueOnce(
                new Error("Database removal failed")
            );
            vi.mocked(
                mockMonitorManager.startMonitoringForSite
            ).mockRejectedValueOnce(new Error("Restart failed"));

            const error = (await orchestrator
                .removeMonitor("test-site", "monitor-1")
                .catch((error_) => error_)) as ApplicationError;

            expect(error).toBeInstanceOf(ApplicationError);
            expect(error).toMatchObject({
                code: "ORCHESTRATOR_REMOVE_MONITOR_FAILED",
                message: "Failed to remove monitor test-site/monitor-1",
            });
            expect(error.cause).toBeInstanceOf(Error);
            expect((error.cause as Error).message).toBe(
                "Critical state inconsistency: Monitor test-site/monitor-1 stopped but database removal failed and restart failed"
            );
        });

        it("should handle monitor removal errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(
                mockMonitorManager.stopMonitoringForSite
            ).mockRejectedValueOnce(new Error("Stop failed"));

            const error = (await orchestrator
                .removeMonitor("test-site", "monitor-1")
                .catch((error_) => error_)) as ApplicationError;

            expect(error).toBeInstanceOf(ApplicationError);
            expect(error).toMatchObject({
                code: "ORCHESTRATOR_REMOVE_MONITOR_FAILED",
                message: "Failed to remove monitor test-site/monitor-1",
            });
            expect(error.cause).toBeInstanceOf(Error);
            expect((error.cause as Error).message).toBe("Stop failed");
        });
    });

    describe("Global Monitoring Control", () => {
        it("should start monitoring", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            await orchestrator.startMonitoring();

            expect(mockMonitorManager.startMonitoring).toHaveBeenCalled();
        });

        it("should stop monitoring", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            await orchestrator.stopMonitoring();

            expect(mockMonitorManager.stopMonitoring).toHaveBeenCalled();
        });
    });

    describe("Data Management", () => {
        it("should download backup successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Backup Operation", "type");

            const result = await orchestrator.downloadBackup();

            expect(mockDatabaseManager.downloadBackup).toHaveBeenCalled();
            expect(result).toEqual({
                buffer: expect.any(Buffer),
                fileName: "backup.db",
            });
        });

        it("should export data successfully", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            const result = await orchestrator.exportData();

            expect(mockDatabaseManager.exportData).toHaveBeenCalled();
            expect(result).toBe('{"sites": []}');
        });

        it("should import data successfully", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Import Operation", "type");

            const testData = '{"sites": []}';
            const result = await orchestrator.importData(testData);

            expect(mockDatabaseManager.importData).toHaveBeenCalledWith(
                testData
            );
            expect(result).toBeTruthy();
        });

        it("should get history limit", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Retrieval", "type");

            const result = orchestrator.getHistoryLimit();

            expect(mockDatabaseManager.getHistoryLimit).toHaveBeenCalled();
            expect(result).toBe(1000);
        });

        it("should set history limit successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Configuration", "type");

            await orchestrator.setHistoryLimit(500);

            expect(mockDatabaseManager.setHistoryLimit).toHaveBeenCalledWith(
                500
            );
        });
    });

    describe("Event Handling", () => {
        it("should handle events without errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should handle monitor status change events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            expect(() => {
                orchestrator.emitTyped("monitor:status-changed", {
                    monitor: {
                        checkInterval: 30_000,
                        history: [],
                        id: "monitor-1",
                        monitoring: true,
                        responseTime: 100,
                        retryAttempts: 3,
                        status: "up",
                        timeout: 5000,
                        type: "http",
                    },
                    monitorId: "monitor-1",
                    previousStatus: "down",
                    responseTime: 100,
                    site: {
                        identifier: "test-site",
                        monitors: [],
                        monitoring: true,
                        name: "Test Site",
                    },
                    siteIdentifier: "test-site",
                    status: "up",
                    timestamp: new Date().toISOString(),
                });
            }).not.toThrow();
        });

        it("should handle internal database events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Event Processing", "type");

            const sites = [
                {
                    identifier: "test-site-1",
                    name: "Test Site 1",
                    monitors: [],
                    monitoring: true,
                } as Site,
            ];

            // Emit internal database event
            orchestrator.emitTyped(
                "internal:database:update-sites-cache-requested",
                {
                    sites,
                    operation: "update-sites-cache-requested",
                    timestamp: Date.now(),
                }
            );

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockSiteManager.updateSitesCache).toHaveBeenCalledWith(
                sites,
                "UptimeOrchestrator.handleUpdateSitesCacheRequest",
                expect.objectContaining({
                    action: STATE_SYNC_ACTION.BULK_SYNC,
                    emitSyncEvent: true,
                    siteIdentifier: "all",
                    source: STATE_SYNC_SOURCE.CACHE,
                    timestamp: expect.any(Number),
                    sites,
                })
            );
            expect(
                mockMonitorManager.setupSiteForMonitoring
            ).toHaveBeenCalledWith(sites[0]);
        });

        it("should handle internal database events with monitoring setup failures", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            const sites = [
                {
                    identifier: "test-site-fail",
                    name: "Test Site Fail",
                    monitors: [],
                    monitoring: true,
                } as Site,
            ];

            vi.mocked(
                mockMonitorManager.setupSiteForMonitoring
            ).mockRejectedValueOnce(new Error("Setup failed"));

            // Emit internal database event
            orchestrator.emitTyped(
                "internal:database:update-sites-cache-requested",
                {
                    sites,
                    operation: "update-sites-cache-requested",
                    timestamp: Date.now(),
                }
            );

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockSiteManager.updateSitesCache).toHaveBeenCalledWith(
                sites,
                "UptimeOrchestrator.handleUpdateSitesCacheRequest",
                expect.objectContaining({
                    action: STATE_SYNC_ACTION.BULK_SYNC,
                    emitSyncEvent: true,
                    siteIdentifier: "all",
                    source: STATE_SYNC_SOURCE.CACHE,
                    timestamp: expect.any(Number),
                    sites,
                })
            );
            expect(
                mockMonitorManager.setupSiteForMonitoring
            ).toHaveBeenCalledWith(sites[0]);
        });

        it("should handle get sites from cache request", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Retrieval", "type");

            // Emit internal database event
            orchestrator.emitTyped(
                "internal:database:get-sites-from-cache-requested",
                {
                    operation: "get-sites-from-cache-requested",
                    timestamp: Date.now(),
                }
            );

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockSiteManager.getSitesFromCache).toHaveBeenCalled();
        });

        it("should handle database initialized event", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Initialization", "type");

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

        it("should handle database initialized event with errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Initialization", "type");

            // Mock emitTyped to throw an error specifically for "database:transaction-completed"
            const originalEmitTyped = orchestrator.emitTyped.bind(orchestrator);
            const emitTypedSpy = vi
                .spyOn(orchestrator, "emitTyped")
                .mockImplementation((event, data) => {
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

        it("should handle internal site added events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Event Processing", "type");

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
                source: "user",
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

        it("should forward site addition source metadata", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Event Processing", "type");

            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            const testSite = {
                identifier: "imported-site",
                name: "Imported Site",
                monitors: [],
                monitoring: true,
            };

            orchestrator.emitTyped("internal:site:added" as any, {
                identifier: "imported-site",
                site: testSite,
                source: "import",
                timestamp: Date.now(),
            });

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(emitTypedSpy).toHaveBeenCalledWith(
                "site:added",
                expect.objectContaining({
                    site: testSite,
                    source: "import",
                })
            );
        });

        it("should handle internal site removed events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Deletion", "type");

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
                    cascade: false,
                    siteIdentifier: "test-site",
                    siteName: "Test Site",
                })
            );
        });

        it("should handle internal site removed events with missing identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Deletion", "type");

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
                    cascade: false,
                    siteIdentifier: "fallback-site", // Should use site.identifier as fallback
                    siteName: "Test Site",
                })
            );
        });

        it("should forward cascade metadata when provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Deletion", "type");

            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            orchestrator.emitTyped("internal:site:removed" as any, {
                cascade: true,
                identifier: "bulk-site",
                site: {
                    identifier: "bulk-site",
                    monitors: [],
                    monitoring: false,
                    name: "Bulk Site",
                },
                timestamp: Date.now(),
            });

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(emitTypedSpy).toHaveBeenCalledWith(
                "site:removed",
                expect.objectContaining({
                    cascade: true,
                    siteIdentifier: "bulk-site",
                    siteName: "Bulk Site",
                })
            );
        });

        it("should handle internal site updated events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

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
                    previousSite,
                    updatedFields: ["name"],
                })
            );
        });

        it("should retain previous site snapshot when monitors are removed", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "regression");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitor Removal", "type");

            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            const previousSite = {
                identifier: "site-monitor-test",
                name: "Site With Two Monitors",
                monitors: [
                    { id: "monitor-1", monitoring: true },
                    { id: "monitor-2", monitoring: true },
                ],
                monitoring: true,
            } as Site;

            const updatedSite = {
                ...previousSite,
                monitors: [
                    {
                        id: "monitor-1",
                        monitoring: true,
                    },
                ],
            } as Site;

            orchestrator.emitTyped("internal:site:updated" as any, {
                identifier: "site-monitor-test",
                previousSite,
                site: updatedSite,
                timestamp: Date.now(),
                updatedFields: ["monitors"],
            });

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(emitTypedSpy).toHaveBeenCalledWith(
                "site:updated",
                expect.objectContaining({
                    previousSite: expect.objectContaining({
                        monitors: expect.arrayContaining([
                            expect.objectContaining({ id: "monitor-2" }),
                        ]),
                    }),
                    site: expect.objectContaining({
                        monitors: expect.not.arrayContaining([
                            expect.objectContaining({ id: "monitor-2" }),
                        ]),
                    }),
                })
            );
        });

        it("should handle internal site updated events with fallback values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

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

        it("should handle monitor started events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

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

        it("should emit global cache invalidation for bulk monitor start", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            orchestrator.emitTyped("internal:monitor:started", {
                identifier: "all",
                operation: "started",
                timestamp: Date.now(),
            });

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(emitTypedSpy).toHaveBeenCalledWith(
                "cache:invalidated",
                expect.objectContaining({
                    reason: "update",
                    type: "all",
                })
            );
        });

        it("should handle monitor started events with errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(mockSiteManager.getSitesFromCache).mockImplementationOnce(
                () => {
                    throw new Error("Cache error");
                }
            );

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

        it("should emit monitor check completion events for manual checks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            const monitor = {
                checkInterval: 60_000,
                history: [],
                id: "monitor-1",
                monitoring: true,
                responseTime: 150,
                retryAttempts: 0,
                status: "up",
                timeout: 30_000,
                type: "http",
                url: "https://example.com",
            } as unknown as Monitor;

            const site = {
                identifier: "test-site",
                monitoring: true,
                monitors: [monitor],
                name: "Test Site",
            } as unknown as Site;

            const manualResult: StatusUpdate = {
                monitor,
                monitorId: monitor.id,
                site,
                siteIdentifier: site.identifier,
                status: "up",
                timestamp: new Date("2024-01-01T00:00:00.000Z").toISOString(),
            };

            const completionTimestamp = Date.now();

            orchestrator.emitTyped("internal:monitor:manual-check-completed", {
                identifier: site.identifier,
                monitorId: monitor.id,
                operation: "manual-check-completed",
                result: manualResult,
                timestamp: completionTimestamp,
            });

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(emitTypedSpy).toHaveBeenCalledWith(
                "monitor:check-completed",
                expect.objectContaining({
                    checkType: "manual",
                    monitorId: monitor.id,
                    siteIdentifier: site.identifier,
                    timestamp: completionTimestamp,
                })
            );

            expect(emitTypedSpy).toHaveBeenCalledWith(
                "monitor:check-completed",
                expect.objectContaining({
                    result: expect.objectContaining({
                        monitor,
                        monitorId: monitor.id,
                        site,
                        siteIdentifier: site.identifier,
                    }),
                })
            );
        });

        it("should enrich manual check completion events using cached site data when missing snapshots", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");
            const getSiteFromCacheSpy = vi.spyOn(
                mockSiteManager,
                "getSiteFromCache"
            );

            const siteFromCache = mockSiteManager.getSiteFromCache("test-site");

            if (!siteFromCache) {
                throw new Error(
                    "Expected site to exist in cache for test setup"
                );
            }

            const monitorId = siteFromCache.monitors[0]?.id ?? "monitor-1";

            const manualResult: StatusUpdate = {
                monitorId,
                siteIdentifier: siteFromCache.identifier,
                status: "up",
                timestamp: new Date("2024-02-01T00:00:00.000Z").toISOString(),
            };

            orchestrator.emitTyped("internal:monitor:manual-check-completed", {
                identifier: siteFromCache.identifier,
                monitorId,
                operation: "manual-check-completed",
                result: manualResult,
                timestamp: Date.now(),
            });

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(getSiteFromCacheSpy).toHaveBeenCalledWith(
                siteFromCache.identifier
            );

            const emittedPayload = emitTypedSpy.mock.calls.find(
                ([eventName]) => eventName === "monitor:check-completed"
            )?.[1] as
                | {
                      result: StatusUpdate;
                  }
                | undefined;

            expect(emittedPayload).toBeDefined();
            expect(emittedPayload?.result.site?.identifier).toBe(
                siteFromCache.identifier
            );
        });

        it("should handle monitor stopped events when monitoring is active", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

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

            expect(mockMonitorManager.getActiveMonitorCount).toHaveBeenCalled();
            expect(emitTypedSpy).toHaveBeenCalledWith(
                "monitoring:stopped",
                expect.objectContaining({
                    activeMonitors: 5,
                    reason: "user",
                })
            );
        });

        it("should emit global cache invalidation for bulk monitor stop", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            orchestrator.emitTyped("internal:monitor:stopped", {
                identifier: "all",
                operation: "stopped",
                reason: "user",
                timestamp: Date.now(),
            });

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(emitTypedSpy).toHaveBeenCalledWith(
                "cache:invalidated",
                expect.objectContaining({
                    reason: "update",
                    type: "all",
                })
            );
        });

        it("should handle monitor stopped events when monitoring is inactive", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");
            vi.mocked(
                mockMonitorManager.getActiveMonitorCount
            ).mockReturnValueOnce(0);

            // Emit internal monitor event
            orchestrator.emitTyped("internal:monitor:stopped", {
                identifier: "test-site",
                operation: "stopped",
                reason: "user",
                timestamp: Date.now(),
            });

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(mockMonitorManager.getActiveMonitorCount).toHaveBeenCalled();
            expect(emitTypedSpy).toHaveBeenCalledWith(
                "monitoring:stopped",
                expect.objectContaining({
                    activeMonitors: 0,
                    reason: "user",
                })
            );
        });

        it("should handle monitor stopped events with errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(
                mockMonitorManager.getActiveMonitorCount
            ).mockImplementationOnce(() => {
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
            expect(mockMonitorManager.getActiveMonitorCount).toHaveBeenCalled();
        });

        it("should handle start monitoring requests successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

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

            expect(
                mockMonitorManager.startMonitoringForSite
            ).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(emitTypedSpy).toHaveBeenCalledWith(
                "internal:site:start-monitoring-response",
                expect.objectContaining({
                    success: true,
                    identifier: "test-site",
                    monitorId: "monitor-1",
                })
            );
        });

        it("should handle start monitoring requests with errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");
            vi.mocked(
                mockMonitorManager.startMonitoringForSite
            ).mockRejectedValueOnce(new Error("Start failed"));

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

        it("should handle stop monitoring requests successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

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

            expect(
                mockMonitorManager.stopMonitoringForSite
            ).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(emitTypedSpy).toHaveBeenCalledWith(
                "internal:site:stop-monitoring-response",
                expect.objectContaining({
                    success: true,
                    identifier: "test-site",
                    monitorId: "monitor-1",
                })
            );
        });

        it("should handle stop monitoring requests with errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");
            vi.mocked(
                mockMonitorManager.stopMonitoringForSite
            ).mockRejectedValueOnce(new Error("Stop failed"));

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

        it("should handle is monitoring active requests", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");

            // Emit is monitoring active request
            orchestrator.emitTyped(
                "internal:site:is-monitoring-active-requested",
                {
                    identifier: "test-site",
                    monitorId: "monitor-1",
                    operation: "is-monitoring-active-requested",
                    timestamp: Date.now(),
                }
            );

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(
                mockMonitorManager.isMonitorActiveInScheduler
            ).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(emitTypedSpy).toHaveBeenCalledWith(
                "internal:site:is-monitoring-active-response",
                expect.objectContaining({
                    isActive: true,
                    identifier: "test-site",
                    monitorId: "monitor-1",
                })
            );
        });

        it("should handle restart monitoring requests successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");
            const testMonitor = {
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
            } as Monitor;

            // Emit restart monitoring request
            orchestrator.emitTyped(
                "internal:site:restart-monitoring-requested",
                {
                    identifier: "test-site",
                    monitor: testMonitor,
                    operation: "restart-monitoring-requested",
                    timestamp: Date.now(),
                }
            );

            // Wait for async processing
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(
                mockMonitorManager.restartMonitorWithNewConfig
            ).toHaveBeenCalledWith("test-site", testMonitor);
            expect(emitTypedSpy).toHaveBeenCalledWith(
                "internal:site:restart-monitoring-response",
                expect.objectContaining({
                    success: true,
                    identifier: "test-site",
                    monitorId: "monitor-1",
                })
            );
        });

        it("should handle restart monitoring requests with errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            const emitTypedSpy = vi.spyOn(orchestrator, "emitTyped");
            const testMonitor = {
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
            } as Monitor;

            vi.mocked(
                mockMonitorManager.restartMonitorWithNewConfig
            ).mockImplementationOnce(() => {
                throw new Error("Restart failed");
            });

            // Emit restart monitoring request
            orchestrator.emitTyped(
                "internal:site:restart-monitoring-requested",
                {
                    identifier: "test-site",
                    monitor: testMonitor,
                    operation: "restart-monitoring-requested",
                    timestamp: Date.now(),
                }
            );

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
        it("should access history limit property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Configuration", "type");

            expect(orchestrator.historyLimit).toBe(1000);
            expect(mockDatabaseManager.getHistoryLimit).toHaveBeenCalled();
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty site data", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const emptySite: Site = {
                identifier: "",
                name: "",
                monitors: [],
                monitoring: false,
            };

            await expect(
                orchestrator.addSite(emptySite)
            ).resolves.toBeDefined();
        });

        it("should handle undefined monitor ID in manual check", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const result = await orchestrator.checkSiteManually(
                "test-site",
                undefined
            );

            expect(mockMonitorManager.checkSiteManually).toHaveBeenCalledWith(
                "test-site",
                undefined
            );
            expect(result).toBeDefined();
        });
    });

    describe("Error Scenarios", () => {
        it("should handle database manager errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(mockDatabaseManager.exportData).mockRejectedValueOnce(
                new Error("Database error")
            );

            const error = (await orchestrator
                .exportData()
                .catch((error_) => error_)) as ApplicationError;

            expect(error).toBeInstanceOf(ApplicationError);
            expect(error).toMatchObject({
                code: "ORCHESTRATOR_EXPORT_DATA_FAILED",
                message: "Failed to export application data",
            });
            expect(error.cause).toBeInstanceOf(Error);
            expect((error.cause as Error).message).toBe("Database error");
        });

        it("should handle monitor manager errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(
                mockMonitorManager.checkSiteManually
            ).mockRejectedValueOnce(new Error("Monitor error"));

            const error = (await orchestrator
                .checkSiteManually("test-site")
                .catch((error_) => error_)) as ApplicationError;

            expect(error).toBeInstanceOf(ApplicationError);
            expect(error).toMatchObject({
                code: "ORCHESTRATOR_MANUAL_CHECK_FAILED",
                message: "Failed to run manual check for site test-site",
            });
            expect(error.cause).toBeInstanceOf(Error);
            expect((error.cause as Error).message).toBe("Monitor error");
        });

        it("should handle site manager errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: UptimeOrchestrator", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(mockSiteManager.addSite).mockRejectedValueOnce(
                new Error("Site error")
            );

            const testSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            const error = (await orchestrator
                .addSite(testSite)
                .catch((error_) => error_)) as ApplicationError;

            expect(error).toBeInstanceOf(ApplicationError);
            expect(error).toMatchObject({
                code: "ORCHESTRATOR_ADD_SITE_FAILED",
                message: "Failed to add site test-site",
            });
            expect(error.cause).toBeInstanceOf(Error);
            expect((error.cause as Error).message).toBe("Site error");
        });
    });
});
