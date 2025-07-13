import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { MonitorManager } from "../managers/MonitorManager";
import type { MonitorManagerDependencies } from "../managers/MonitorManager";
import type { Site, Monitor, StatusUpdate } from "../types";
import { isDev } from "../electronUtils";

// Use vi.hoisted to ensure these are available when mocks are hoisted
const {
    mockEmitTyped,
    mockPerformInitialMonitorChecks,
    mockStartAllMonitoring,
    mockStartMonitoringForSite,
    mockStopAllMonitoring,
    mockStopMonitoringForSite,
    mockCheckSiteManually,
    mockCheckMonitor,
    mockMonitorScheduler,
    mockLogger,
} = vi.hoisted(() => {
    const mockEmitTyped = vi.fn(() => Promise.resolve());
    const mockPerformInitialMonitorChecks = vi.fn(async () => {});
    const mockStartAllMonitoring = vi.fn(async () => true);
    const mockStartMonitoringForSite = vi.fn(async () => true);
    const mockStopAllMonitoring = vi.fn(async () => false);
    const mockStopMonitoringForSite = vi.fn(async () => true);
    const mockCheckSiteManually = vi.fn(async (): Promise<StatusUpdate | undefined> => ({
        site: {
            identifier: "test-site",
            name: "Test Site",
            monitoring: true,
            monitors: []
        },
        previousStatus: "pending"
    }));
    const mockCheckMonitor = vi.fn(async () => ({
        monitorId: "monitor1",
        status: "up" as const,
        responseTime: 100,
        statusCode: 200,
        timestamp: Date.now(),
        message: "OK",
    }));

    const mockMonitorScheduler = {
        setCheckCallback: vi.fn(),
        isMonitoring: vi.fn(() => true),
        restartMonitor: vi.fn(() => true),
    };

    const mockLogger = {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    };

    return {
        mockEmitTyped,
        mockPerformInitialMonitorChecks,
        mockStartAllMonitoring,
        mockStartMonitoringForSite,
        mockStopAllMonitoring,
        mockStopMonitoringForSite,
        mockCheckSiteManually,
        mockCheckMonitor,
        mockMonitorScheduler,
        mockLogger,
    };
});

// Mock the utils module
vi.mock("../utils", async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        monitorLogger: mockLogger,
        performInitialMonitorChecks: mockPerformInitialMonitorChecks,
        startAllMonitoring: mockStartAllMonitoring,
        startMonitoringForSite: mockStartMonitoringForSite,
        stopAllMonitoring: mockStopAllMonitoring,
        stopMonitoringForSite: mockStopMonitoringForSite,
        checkSiteManually: mockCheckSiteManually,
        checkMonitor: mockCheckMonitor,
    };
});

// Mock the services
vi.mock("../services", () => ({
    MonitorScheduler: vi.fn(() => mockMonitorScheduler),
    DatabaseService: vi.fn(),
    MonitorRepository: vi.fn(),
    HistoryRepository: vi.fn(),
    SiteRepository: vi.fn(),
}));

// Mock constants and utils
vi.mock("../constants", () => ({
    DEFAULT_CHECK_INTERVAL: 60000,
}));

vi.mock("../electronUtils", () => ({
    isDev: vi.fn(() => false),
}));

describe("MonitorManager", () => {
    let manager: MonitorManager;
    let mockDependencies: MonitorManagerDependencies;
    let mockSitesCache: any;
    let mockEventEmitter: any;
    let mockRepositories: any;
    let mockDatabaseService: any;

    const createMockSite = (identifier: string, monitors: Partial<Monitor>[] = []): Site => ({
        identifier,
        name: `Site ${identifier}`,
        monitoring: true,
        monitors: monitors.map((monitor, index) => ({
            id: monitor.id || `monitor${index + 1}`,
            siteIdentifier: identifier,
            type: monitor.type || "http",
            url: monitor.url || `https://${identifier}.example.com`,
            port: monitor.port,
            checkInterval: monitor.checkInterval || 60000,
            monitoring: monitor.monitoring ?? true, // Default to true as per interface docs
            status: monitor.status || "pending",
            responseTime: monitor.responseTime || -1,
            lastChecked: monitor.lastChecked,
            history: monitor.history || [],
            timeout: monitor.timeout || 30000,
            retryAttempts: monitor.retryAttempts || 3,
            created_at: new Date(),
            updated_at: new Date(),
            ...monitor,
        })) as Monitor[],
    });

    beforeEach(() => {
        vi.clearAllMocks();

        // Create mock sites cache
        const site1 = createMockSite("site1", [{ id: "monitor1" }, { id: "monitor2" }]);
        const site2 = createMockSite("site2", [{ id: "monitor3" }]);
        mockSitesCache = {
            getAll: vi.fn(() => [site1, site2]),
            get: vi.fn((key) => {
                if (key === "site1") return site1;
                if (key === "site2") return site2;
                return undefined;
            }),
            set: vi.fn(),
            has: vi.fn(),
            delete: vi.fn(),
            clear: vi.fn(),
            size: vi.fn(() => 2),
            invalidate: vi.fn(),
        };

        // Create mock event emitter
        mockEventEmitter = {
            emitTyped: mockEmitTyped,
        };

        // Create mock repositories
        mockRepositories = {
            monitor: {
                findBySiteIdentifier: vi.fn(() => Promise.resolve([])),
                create: vi.fn(),
                update: vi.fn(),
                updateInternal: vi.fn(),
                delete: vi.fn(),
            },
            history: {
                findByMonitorId: vi.fn(() => Promise.resolve([])),
                addEntry: vi.fn(),
                pruneHistory: vi.fn(),
            },
            site: {
                findAll: vi.fn(() => Promise.resolve([])),
                findByIdentifier: vi.fn(),
                upsert: vi.fn(),
                delete: vi.fn(),
            },
        };

        // Create mock database service
        mockDatabaseService = {
            initialize: vi.fn(() => Promise.resolve()),
            isInitialized: vi.fn(() => true),
            getDatabasePath: vi.fn(() => "/mock/path/database.db"),
            executeTransaction: vi.fn(async (callback) => {
                await callback({} as any); // Pass mock database
                return Promise.resolve();
            }),
        };

        // Create mock dependencies
        mockDependencies = {
            eventEmitter: mockEventEmitter,
            repositories: mockRepositories,
            databaseService: mockDatabaseService,
            getHistoryLimit: vi.fn(() => 500),
            getSitesCache: vi.fn(() => mockSitesCache),
        };

        // Create manager instance
        manager = new MonitorManager(mockDependencies);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("constructor", () => {
        it("should initialize with provided dependencies", () => {
            expect(manager).toBeInstanceOf(MonitorManager);
            expect(mockMonitorScheduler.setCheckCallback).toHaveBeenCalledWith(expect.any(Function));
        });
    });

    describe("startMonitoring", () => {
        it("should start monitoring for all sites", async () => {
            await manager.startMonitoring();

            expect(mockStartAllMonitoring).toHaveBeenCalledWith(
                expect.objectContaining({
                    databaseService: mockDatabaseService,
                    eventEmitter: mockEventEmitter,
                    logger: mockLogger,
                    monitorRepository: mockRepositories.monitor,
                    monitorScheduler: mockMonitorScheduler,
                    sites: mockSitesCache,
                }),
                false
            );
        });

        it("should emit monitoring started event with correct data", async () => {
            await manager.startMonitoring();

            expect(mockEmitTyped).toHaveBeenCalledWith("monitoring:started", {
                monitorCount: 3, // 2 monitors in site1 + 1 monitor in site2
                siteCount: 2,
                timestamp: expect.any(Number),
            });
        });
    });

    describe("stopMonitoring", () => {
        it("should stop monitoring for all sites", async () => {
            await manager.stopMonitoring();

            expect(mockStopAllMonitoring).toHaveBeenCalledWith({
                databaseService: mockDatabaseService,
                eventEmitter: mockEventEmitter,
                logger: mockLogger,
                monitorRepository: mockRepositories.monitor,
                monitorScheduler: mockMonitorScheduler,
                sites: mockSitesCache,
            });
        });

        it("should emit monitoring stopped event", async () => {
            await manager.stopMonitoring();

            expect(mockEmitTyped).toHaveBeenCalledWith("monitoring:stopped", {
                activeMonitors: 0,
                reason: "user",
                timestamp: expect.any(Number),
            });
        });
    });

    describe("startMonitoringForSite", () => {
        it("should start monitoring for a specific site", async () => {
            const result = await manager.startMonitoringForSite("site1");

            expect(mockStartMonitoringForSite).toHaveBeenCalledWith(
                expect.objectContaining({
                    databaseService: mockDatabaseService,
                    eventEmitter: mockEventEmitter,
                    logger: mockLogger,
                    monitorRepository: mockRepositories.monitor,
                    monitorScheduler: mockMonitorScheduler,
                    sites: mockSitesCache,
                }),
                "site1",
                undefined,
                expect.any(Function)
            );
            expect(result).toBe(true);
        });

        it("should start monitoring for a specific monitor", async () => {
            const result = await manager.startMonitoringForSite("site1", "monitor1");

            expect(mockStartMonitoringForSite).toHaveBeenCalledWith(
                expect.any(Object),
                "site1",
                "monitor1",
                expect.any(Function)
            );
            expect(result).toBe(true);
        });

        it("should emit monitor started event when successful", async () => {
            await manager.startMonitoringForSite("site1", "monitor1");

            expect(mockEmitTyped).toHaveBeenCalledWith("internal:monitor:started", {
                identifier: "site1",
                monitorId: "monitor1",
                operation: "started",
                timestamp: expect.any(Number),
            });
        });

        it("should not emit event when start fails", async () => {
            mockStartMonitoringForSite.mockResolvedValueOnce(false);

            await manager.startMonitoringForSite("site1", "monitor1");

            expect(mockEmitTyped).not.toHaveBeenCalledWith("internal:monitor:started", expect.any(Object));
        });
    });

    describe("stopMonitoringForSite", () => {
        it("should stop monitoring for a specific site", async () => {
            const result = await manager.stopMonitoringForSite("site1");

            expect(mockStopMonitoringForSite).toHaveBeenCalledWith(
                expect.objectContaining({
                    databaseService: mockDatabaseService,
                    eventEmitter: mockEventEmitter,
                    logger: mockLogger,
                    monitorRepository: mockRepositories.monitor,
                    monitorScheduler: mockMonitorScheduler,
                    sites: mockSitesCache,
                }),
                "site1",
                undefined,
                expect.any(Function)
            );
            expect(result).toBe(true);
        });

        it("should stop monitoring for a specific monitor", async () => {
            const result = await manager.stopMonitoringForSite("site1", "monitor1");

            expect(mockStopMonitoringForSite).toHaveBeenCalledWith(
                expect.any(Object),
                "site1",
                "monitor1",
                expect.any(Function)
            );
            expect(result).toBe(true);
        });

        it("should emit monitor stopped event when successful", async () => {
            await manager.stopMonitoringForSite("site1", "monitor1");

            expect(mockEmitTyped).toHaveBeenCalledWith("internal:monitor:stopped", {
                identifier: "site1",
                monitorId: "monitor1",
                operation: "stopped",
                reason: "user",
                timestamp: expect.any(Number),
            });
        });

        it("should not emit event when stop fails", async () => {
            mockStopMonitoringForSite.mockResolvedValueOnce(false);

            await manager.stopMonitoringForSite("site1", "monitor1");

            expect(mockEmitTyped).not.toHaveBeenCalledWith("internal:monitor:stopped", expect.any(Object));
        });
    });

    describe("checkSiteManually", () => {
        it("should perform manual check for a site", async () => {
            const result = await manager.checkSiteManually("site1");

            expect(mockCheckSiteManually).toHaveBeenCalledWith(
                expect.objectContaining({
                    databaseService: mockDatabaseService,
                    eventEmitter: mockEventEmitter,
                    historyLimit: 500,
                    logger: mockLogger,
                    repositories: mockRepositories,
                    sites: mockSitesCache,
                }),
                "site1",
                undefined
            );
            expect(result).toBeDefined();
            expect(result?.previousStatus).toBe("pending");
        });

        it("should perform manual check for a specific monitor", async () => {
            const result = await manager.checkSiteManually("site1", "monitor1");

            expect(mockCheckSiteManually).toHaveBeenCalledWith(expect.any(Object), "site1", "monitor1");
            expect(result).toBeDefined();
        });

        it("should emit manual check completed event", async () => {
            const result = await manager.checkSiteManually("site1", "monitor1");

            expect(mockEmitTyped).toHaveBeenCalledWith("internal:monitor:manual-check-completed", {
                identifier: "site1",
                monitorId: "monitor1",
                operation: "manual-check-completed",
                result: result,
                timestamp: expect.any(Number),
            });
        });

        it("should handle undefined result", async () => {
            mockCheckSiteManually.mockResolvedValueOnce(undefined);

            const result = await manager.checkSiteManually("site1");

            expect(result).toBeUndefined();
            expect(mockEmitTyped).toHaveBeenCalledWith("internal:monitor:manual-check-completed", {
                identifier: "site1",
                operation: "manual-check-completed",
                result: undefined,
                timestamp: expect.any(Number),
            });
        });
    });

    describe("setupSiteForMonitoring", () => {
        it.skip("should perform initial checks for all monitors", async () => {
            const site = createMockSite("testSite", [{ id: "monitor1" }, { id: "monitor2" }]);

            await manager.setupSiteForMonitoring(site);

            expect(mockPerformInitialMonitorChecks).toHaveBeenCalledWith(site, expect.any(Function), mockLogger);
        });

        it("should apply default intervals for monitors without checkInterval", async () => {
            const site = createMockSite("testSite", [
                { id: "monitor1", checkInterval: undefined },
                { id: "monitor2", checkInterval: 30000 },
            ]);

            await manager.setupSiteForMonitoring(site);

            // Should update monitor1 but not monitor2
            expect(mockDatabaseService.executeTransaction).toHaveBeenCalledTimes(1);
            expect(mockRepositories.monitor.updateInternal).toHaveBeenCalledWith(expect.anything(), "monitor1", {
                checkInterval: 60000, // DEFAULT_CHECK_INTERVAL
            });
        });

        it("should auto-start monitoring when appropriate", async () => {
            const site = createMockSite("testSite", [{ id: "monitor1" }]);

            await manager.setupSiteForMonitoring(site);

            // Should call startMonitoringForSite for the monitor
            expect(mockStartMonitoringForSite).toHaveBeenCalledWith(
                expect.any(Object),
                "testSite",
                "monitor1",
                expect.any(Function)
            );
        });

        it("should emit site setup completed event", async () => {
            const site = createMockSite("testSite", [{ id: "monitor1" }]);

            await manager.setupSiteForMonitoring(site);

            expect(mockEmitTyped).toHaveBeenCalledWith("internal:monitor:site-setup-completed", {
                identifier: "testSite",
                operation: "site-setup-completed",
                timestamp: expect.any(Number),
            });
        });
    });

    describe("business logic - default intervals", () => {
        it("should not apply default interval if monitor already has one", async () => {
            const site = createMockSite("testSite", [{ id: "monitor1", checkInterval: 30000 }]);

            await manager.setupSiteForMonitoring(site);

            expect(mockRepositories.monitor.updateInternal).not.toHaveBeenCalled();
        });

        it("should apply default interval to monitor without checkInterval", async () => {
            const site = createMockSite("testSite", [{ id: "monitor1", checkInterval: undefined }]);

            await manager.setupSiteForMonitoring(site);

            expect(site.monitors[0].checkInterval).toBe(60000);
            expect(mockRepositories.monitor.updateInternal).toHaveBeenCalledWith(expect.anything(), "monitor1", {
                checkInterval: 60000,
            });
        });
    });

    describe("business logic - auto-start monitoring", () => {
        beforeEach(() => {
            // Reset isDev mock
            vi.mocked(isDev).mockReturnValue(false);
        });

        it("should not auto-start for sites with no monitors", async () => {
            const site = createMockSite("testSite", []);

            await manager.setupSiteForMonitoring(site);

            expect(mockStartMonitoringForSite).not.toHaveBeenCalled();
        });

        it("should respect site monitoring property when false", async () => {
            const site = createMockSite("testSite", [{ id: "monitor1" }]);
            site.monitoring = false;

            await manager.setupSiteForMonitoring(site);

            expect(mockStartMonitoringForSite).not.toHaveBeenCalled();
        });

        it("should auto-start when site monitoring property is true", async () => {
            const site = createMockSite("testSite", [{ id: "monitor1" }]);
            site.monitoring = true;

            await manager.setupSiteForMonitoring(site);

            // Should call startMonitoringForSite for the monitor
            expect(mockStartMonitoringForSite).toHaveBeenCalledWith(
                expect.any(Object),
                "testSite",
                "monitor1",
                expect.any(Function)
            );
        });

        it("should auto-start by default when monitoring property is undefined", async () => {
            const site = createMockSite("testSite", [{ id: "monitor1" }]);
            // TypeScript would not normally allow this, but testing edge case
            (site as any).monitoring = undefined;

            await manager.setupSiteForMonitoring(site);

            expect(mockStartMonitoringForSite).toHaveBeenCalledWith(
                expect.any(Object),
                "testSite",
                "monitor1",
                expect.any(Function)
            );
        });
    });

    describe("utility methods", () => {
        it("should return monitoring status", () => {
            // Initial state should be false
            expect(manager.isMonitoringActive()).toBe(false);
        });

        it("should check if monitor is active in scheduler", () => {
            const result = manager.isMonitorActiveInScheduler("site1", "monitor1");

            expect(mockMonitorScheduler.isMonitoring).toHaveBeenCalledWith("site1", "monitor1");
            expect(result).toBe(true);
        });

        it("should restart monitor with new config", () => {
            const monitor = { id: "monitor1", checkInterval: 30000 } as Monitor;
            const result = manager.restartMonitorWithNewConfig("site1", monitor);

            expect(mockMonitorScheduler.restartMonitor).toHaveBeenCalledWith("site1", monitor);
            expect(result).toBe(true);
        });
    });

    describe("private method - handleScheduledCheck", () => {
        it("should handle scheduled check for existing site", async () => {
            // Access the private method through the callback
            const schedulerCallback = mockMonitorScheduler.setCheckCallback.mock.calls[0][0];

            await schedulerCallback("site1", "monitor1");

            expect(mockCheckMonitor).toHaveBeenCalledWith(
                expect.objectContaining({
                    databaseService: mockDatabaseService,
                    eventEmitter: mockEventEmitter,
                    historyLimit: 500,
                    logger: mockLogger,
                    repositories: mockRepositories,
                    sites: mockSitesCache,
                }),
                mockSitesCache.get("site1"),
                "monitor1"
            );
        });

        it("should handle scheduled check for non-existing site gracefully", async () => {
            const schedulerCallback = mockMonitorScheduler.setCheckCallback.mock.calls[0][0];

            await schedulerCallback("nonexistent", "monitor1");

            // Should not call checkMonitor for non-existent sites
            expect(mockCheckMonitor).not.toHaveBeenCalled();
        });
    });

    describe.skip("error handling", () => {
        it("should handle errors in setupSiteForMonitoring", async () => {
            mockPerformInitialMonitorChecks.mockRejectedValueOnce(new Error("Check failed"));

            const site = createMockSite("testSite", [{ id: "monitor1" }]);

            await expect(manager.setupSiteForMonitoring(site)).rejects.toThrow("Check failed");
        });

        it("should handle errors in database operations", async () => {
            mockDatabaseService.executeTransaction.mockRejectedValueOnce(new Error("DB Error"));

            const site = createMockSite("testSite", [{ id: "monitor1", checkInterval: undefined }]);

            await expect(manager.setupSiteForMonitoring(site)).rejects.toThrow("DB Error");
        });

        it("should handle errors in manual checks", async () => {
            mockCheckSiteManually.mockRejectedValueOnce(new Error("Check failed"));

            await expect(manager.checkSiteManually("site1")).rejects.toThrow("Check failed");
        });
    });

    describe("integration scenarios", () => {
        it("should handle complete monitoring lifecycle", async () => {
            // Start monitoring
            await manager.startMonitoring();
            expect(mockStartAllMonitoring).toHaveBeenCalled();

            // Start specific site
            await manager.startMonitoringForSite("site1");
            expect(mockStartMonitoringForSite).toHaveBeenCalled();

            // Manual check
            await manager.checkSiteManually("site1", "monitor1");
            expect(mockCheckSiteManually).toHaveBeenCalled();

            // Stop specific site
            await manager.stopMonitoringForSite("site1");
            expect(mockStopMonitoringForSite).toHaveBeenCalled();

            // Stop all monitoring
            await manager.stopMonitoring();
            expect(mockStopAllMonitoring).toHaveBeenCalled();
        });

        it("should handle site setup with multiple monitors", async () => {
            const site = createMockSite("complexSite", [
                { id: "monitor1", checkInterval: undefined },
                { id: "monitor2", checkInterval: 30000 },
                { id: "monitor3", checkInterval: undefined },
            ]);

            await manager.setupSiteForMonitoring(site);

            // Should apply default intervals to monitor1 and monitor3
            expect(mockDatabaseService.executeTransaction).toHaveBeenCalledTimes(2);
            expect(mockRepositories.monitor.updateInternal).toHaveBeenCalledWith(expect.anything(), "monitor1", {
                checkInterval: 60000,
            });
            expect(mockRepositories.monitor.updateInternal).toHaveBeenCalledWith(expect.anything(), "monitor3", {
                checkInterval: 60000,
            });
        });
    });
});
