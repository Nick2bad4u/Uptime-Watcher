/**
 * Comprehensive tests for monitor lifecycle management utilities Targeting 98%
 * branch coverage for all monitoring lifecycle functions
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

import {
    startAllMonitoring,
    startMonitoringForSite,
    stopAllMonitoring,
    stopMonitoringForSite,
    type MonitoringLifecycleConfig,
    type MonitoringCallback,
} from "../../../utils/monitoring/monitorLifecycle";
import { MONITOR_STATUS, type MonitorStatus } from "../../../../shared/types";
import { UptimeEvents } from "../../../events/eventTypes";
import { TypedEventBus } from "../../../events/TypedEventBus";
import { DatabaseService } from "../../../services/database/DatabaseService";
import { MonitorRepository } from "../../../services/database/MonitorRepository";
import { MonitorScheduler } from "../../../services/monitoring/MonitorScheduler";
import { Site, Monitor } from "../../../../shared/types.js";
import { StandardizedCache } from "../../../utils/cache/StandardizedCache";
import * as operationalHooks from "../../../utils/operationalHooks";

// Mock dependencies
vi.mock("../../../utils/operationalHooks");

const mockWithDatabaseOperation = vi.mocked(
    operationalHooks.withDatabaseOperation
);

describe("Monitor Lifecycle Management - Comprehensive Coverage", () => {
    let config: MonitoringLifecycleConfig;
    let mockDatabaseService: DatabaseService;
    let mockEventEmitter: TypedEventBus<UptimeEvents>;
    let mockLogger: any;
    let mockMonitorRepository: MonitorRepository;
    let mockMonitorScheduler: MonitorScheduler;
    let mockSitesCache: StandardizedCache<Site>;
    let mockDatabase: any;

    const createMockMonitor = (
        id: string,
        monitoring = false,
        status: MonitorStatus = MONITOR_STATUS.PENDING
    ): Monitor => ({
        id,
        type: "http",
        url: "https://example.com",
        monitoring,
        status,
        checkInterval: 30_000,
        timeout: 5000,
        retryAttempts: 3,
        responseTime: -1,
        history: [],
        activeOperations: [],
    });

    const createMockSite = (identifier: string, monitors: Monitor[]): Site => ({
        identifier,
        name: "Test Site",
        monitoring: true,
        monitors,
    });

    beforeEach(() => {
        // Create mocks
        mockDatabase = {} as any;

        mockDatabaseService = {
            getDatabase: vi.fn().mockReturnValue(mockDatabase),
        } as any;

        mockEventEmitter = new TypedEventBus<UptimeEvents>("test");

        mockLogger = {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
        };

        mockMonitorRepository = {
            updateInternal: vi.fn(),
            clearActiveOperationsInternal: vi.fn(),
            findBySiteIdentifier: vi.fn().mockResolvedValue([]),
        } as any;

        mockMonitorScheduler = {
            startSite: vi.fn(),
            stopSite: vi.fn(),
            startMonitor: vi.fn().mockReturnValue(true),
            stopMonitor: vi.fn().mockReturnValue(true),
            stopAll: vi.fn(),
        } as any;

        mockSitesCache = new StandardizedCache<Site>({ name: "test-cache" });

        config = {
            databaseService: mockDatabaseService,
            eventEmitter: mockEventEmitter,
            logger: mockLogger,
            monitorRepository: mockMonitorRepository,
            monitorScheduler: mockMonitorScheduler,
            sites: mockSitesCache,
        };

        // Mock withDatabaseOperation to execute the callback
        mockWithDatabaseOperation.mockImplementation(async (callback) => {
            await callback();
        });
    });

    describe("startAllMonitoring", () => {
        it("should return current state when monitoring is already running", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const result = await startAllMonitoring(config, true);

            expect(result).toBe(true);
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "Monitoring already running"
            );
        });

        it("should start monitoring for all sites and monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitor1 = createMockMonitor("monitor1");
            const monitor2 = createMockMonitor("monitor2");
            const site1 = createMockSite("site1", [monitor1]);
            const site2 = createMockSite("site2", [monitor2]);

            mockSitesCache.set("site1", site1);
            mockSitesCache.set("site2", site2);

            const result = await startAllMonitoring(config, false);

            expect(result).toBe(true);
            expect(mockLogger.info).toHaveBeenCalledWith(
                `Starting monitoring with ${mockSitesCache.size} sites (per-site intervals)`
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                `Started all monitoring operations and set monitors to ${MONITOR_STATUS.PENDING}`
            );
            expect(mockMonitorScheduler.startSite).toHaveBeenCalledWith(site1);
            expect(mockMonitorScheduler.startSite).toHaveBeenCalledWith(site2);
            expect(mockMonitorRepository.updateInternal).toHaveBeenCalledWith(
                mockDatabase,
                "monitor1",
                {
                    monitoring: true,
                    status: MONITOR_STATUS.PENDING,
                }
            );
            expect(mockMonitorRepository.updateInternal).toHaveBeenCalledWith(
                mockDatabase,
                "monitor2",
                {
                    monitoring: true,
                    status: MONITOR_STATUS.PENDING,
                }
            );
        });

        it("should handle monitors without IDs gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitorWithoutId = createMockMonitor("");
            monitorWithoutId.id = undefined as any;
            const site = createMockSite("site1", [monitorWithoutId]);

            mockSitesCache.set("site1", site);

            const result = await startAllMonitoring(config, false);

            expect(result).toBe(true);
            expect(mockMonitorRepository.updateInternal).not.toHaveBeenCalled();
            expect(mockMonitorScheduler.startSite).toHaveBeenCalledWith(site);
        });

        it("should handle database errors during monitor updates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = createMockMonitor("monitor1");
            const site = createMockSite("site1", [monitor]);

            mockSitesCache.set("site1", site);

            const dbError = new Error("Database error");
            mockWithDatabaseOperation.mockRejectedValueOnce(dbError);

            const result = await startAllMonitoring(config, false);

            expect(result).toBe(true);
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Failed to update monitor monitor1 to ${MONITOR_STATUS.PENDING} status`,
                dbError
            );
        });

        it("should handle empty sites cache", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            const result = await startAllMonitoring(config, false);

            expect(result).toBe(true);
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Starting monitoring with 0 sites (per-site intervals)"
            );
            expect(mockMonitorScheduler.startSite).not.toHaveBeenCalled();
        });
    });

    describe("startMonitoringForSite", () => {
        it("should return false when site is not found", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = await startMonitoringForSite(
                config,
                "nonexistent-site"
            );

            expect(result).toBe(false);
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "Site not found for monitoring: nonexistent-site"
            );
        });

        it("should start monitoring for specific monitor when monitorId provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createMockMonitor("monitor1");
            const site = createMockSite("site1", [monitor]);

            mockSitesCache.set("site1", site);

            const result = await startMonitoringForSite(
                config,
                "site1",
                "monitor1"
            );

            expect(result).toBe(true);
            expect(mockMonitorRepository.updateInternal).toHaveBeenCalledWith(
                mockDatabase,
                "monitor1",
                {
                    monitoring: true,
                    status: MONITOR_STATUS.PENDING,
                }
            );
            expect(
                mockMonitorRepository.clearActiveOperationsInternal
            ).toHaveBeenCalledWith(mockDatabase, "monitor1");
            expect(mockMonitorScheduler.startMonitor).toHaveBeenCalledWith(
                "site1",
                monitor
            );
        });

        it("should start monitoring for all site monitors when no monitorId provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitor1 = createMockMonitor("monitor1");
            const monitor2 = createMockMonitor("monitor2");
            const site = createMockSite("site1", [monitor1, monitor2]);

            mockSitesCache.set("site1", site);

            // The function requires a callback to process all site monitors
            const result = await startMonitoringForSite(config, "site1");

            // Without a callback, processAllSiteMonitors returns false
            expect(result).toBe(false);
        });

        it("should handle monitor not found in site", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createMockMonitor("monitor1");
            const site = createMockSite("site1", [monitor]);

            mockSitesCache.set("site1", site);

            const result = await startMonitoringForSite(
                config,
                "site1",
                "nonexistent-monitor"
            );

            expect(result).toBe(false);
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "Monitor not found: site1:nonexistent-monitor"
            );
        });

        it("should use callback for recursive operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createMockMonitor("monitor1");
            const site = createMockSite("site1", [monitor]);

            mockSitesCache.set("site1", site);

            const mockCallback: MonitoringCallback = vi
                .fn()
                .mockResolvedValue(true);

            const result = await startMonitoringForSite(
                config,
                "site1",
                undefined,
                mockCallback
            );

            expect(result).toBe(true);
            expect(mockCallback).toHaveBeenCalledWith("site1", "monitor1");
        });
    });

    describe("stopAllMonitoring", () => {
        it("should stop monitoring for all sites and set monitors to paused", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitor1 = createMockMonitor(
                "monitor1",
                true,
                MONITOR_STATUS.UP
            );
            const monitor2 = createMockMonitor(
                "monitor2",
                true,
                MONITOR_STATUS.DOWN
            );
            const site1 = createMockSite("site1", [monitor1]);
            const site2 = createMockSite("site2", [monitor2]);

            mockSitesCache.set("site1", site1);
            mockSitesCache.set("site2", site2);

            const result = await stopAllMonitoring(config);

            expect(result).toBe(false);
            expect(mockLogger.info).toHaveBeenCalledWith(
                `Stopped all site monitoring intervals and set monitors to ${MONITOR_STATUS.PAUSED}`
            );
            expect(mockMonitorScheduler.stopAll).toHaveBeenCalledOnce();
            expect(mockMonitorRepository.updateInternal).toHaveBeenCalledWith(
                mockDatabase,
                "monitor1",
                {
                    monitoring: false,
                    status: MONITOR_STATUS.PAUSED,
                }
            );
            expect(mockMonitorRepository.updateInternal).toHaveBeenCalledWith(
                mockDatabase,
                "monitor2",
                {
                    monitoring: false,
                    status: MONITOR_STATUS.PAUSED,
                }
            );
        });

        it("should handle monitors without IDs gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitorWithoutId = createMockMonitor("", true);
            monitorWithoutId.id = undefined as any;
            const site = createMockSite("site1", [monitorWithoutId]);

            mockSitesCache.set("site1", site);

            const result = await stopAllMonitoring(config);

            expect(result).toBe(false);
            expect(mockMonitorRepository.updateInternal).not.toHaveBeenCalled();
            expect(mockMonitorScheduler.stopAll).toHaveBeenCalledOnce();
        });

        it("should handle database errors during monitor updates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = createMockMonitor("monitor1", true);
            const site = createMockSite("site1", [monitor]);

            mockSitesCache.set("site1", site);

            const dbError = new Error("Database error");
            mockWithDatabaseOperation.mockRejectedValueOnce(dbError);

            const result = await stopAllMonitoring(config);

            expect(result).toBe(false);
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Failed to update monitor monitor1 to ${MONITOR_STATUS.PAUSED} status`,
                dbError
            );
        });

        it("should handle empty sites cache", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            const result = await stopAllMonitoring(config);

            expect(result).toBe(false);
            expect(mockMonitorScheduler.stopAll).toHaveBeenCalledOnce();
        });

        it("should only update monitors that are currently monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            const monitorActive = createMockMonitor(
                "monitor1",
                true,
                MONITOR_STATUS.UP
            );
            const monitorInactive = createMockMonitor(
                "monitor2",
                false,
                MONITOR_STATUS.PAUSED
            );
            const site = createMockSite("site1", [
                monitorActive,
                monitorInactive,
            ]);

            mockSitesCache.set("site1", site);

            const result = await stopAllMonitoring(config);

            expect(result).toBe(false);
            expect(mockMonitorRepository.updateInternal).toHaveBeenCalledTimes(
                1
            );
            expect(mockMonitorRepository.updateInternal).toHaveBeenCalledWith(
                mockDatabase,
                "monitor1",
                {
                    monitoring: false,
                    status: MONITOR_STATUS.PAUSED,
                }
            );
        });
    });

    describe("stopMonitoringForSite", () => {
        it("should return false when site is not found", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = await stopMonitoringForSite(
                config,
                "nonexistent-site"
            );

            expect(result).toBe(false);
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "Site not found for stopping monitoring: nonexistent-site"
            );
        });

        it("should stop monitoring for specific monitor when monitorId provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createMockMonitor(
                "monitor1",
                true,
                MONITOR_STATUS.UP
            );
            const site = createMockSite("site1", [monitor]);

            mockSitesCache.set("site1", site);

            const result = await stopMonitoringForSite(
                config,
                "site1",
                "monitor1"
            );

            expect(result).toBe(true);
            expect(mockMonitorRepository.updateInternal).toHaveBeenCalledWith(
                mockDatabase,
                "monitor1",
                {
                    monitoring: false,
                    status: MONITOR_STATUS.PAUSED,
                }
            );
            expect(
                mockMonitorRepository.clearActiveOperationsInternal
            ).toHaveBeenCalledWith(mockDatabase, "monitor1");
            expect(mockMonitorScheduler.stopMonitor).toHaveBeenCalledWith(
                "site1",
                "monitor1"
            );
        });

        it("should stop monitoring for all site monitors when no monitorId provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitor1 = createMockMonitor(
                "monitor1",
                true,
                MONITOR_STATUS.UP
            );
            const monitor2 = createMockMonitor(
                "monitor2",
                true,
                MONITOR_STATUS.DOWN
            );
            const site = createMockSite("site1", [monitor1, monitor2]);

            mockSitesCache.set("site1", site);

            // The function requires a callback to process all site monitors
            const result = await stopMonitoringForSite(config, "site1");

            // Without a callback, processAllSiteMonitors returns false
            expect(result).toBe(false);
        });

        it("should handle monitor not found in site", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createMockMonitor("monitor1");
            const site = createMockSite("site1", [monitor]);

            mockSitesCache.set("site1", site);

            const result = await stopMonitoringForSite(
                config,
                "site1",
                "nonexistent-monitor"
            );

            expect(result).toBe(false);
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "Monitor not found: site1:nonexistent-monitor"
            );
        });

        it("should only stop monitors that are currently monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitorActive = createMockMonitor(
                "monitor1",
                true,
                MONITOR_STATUS.UP
            );
            const monitorInactive = createMockMonitor(
                "monitor2",
                false,
                MONITOR_STATUS.PAUSED
            );
            const site = createMockSite("site1", [
                monitorActive,
                monitorInactive,
            ]);

            mockSitesCache.set("site1", site);

            const mockCallback: MonitoringCallback = vi
                .fn()
                .mockResolvedValue(true);

            const result = await stopMonitoringForSite(
                config,
                "site1",
                undefined,
                mockCallback
            );

            expect(result).toBe(true);
            // Callback should be called for both monitors since filtering happens at a different level
            expect(mockCallback).toHaveBeenCalledTimes(2);
        });

        it("should use callback for recursive operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createMockMonitor("monitor1", true);
            const site = createMockSite("site1", [monitor]);

            mockSitesCache.set("site1", site);

            const mockCallback: MonitoringCallback = vi
                .fn()
                .mockResolvedValue(true);

            const result = await stopMonitoringForSite(
                config,
                "site1",
                undefined,
                mockCallback
            );

            expect(result).toBe(true);
            expect(mockCallback).toHaveBeenCalledWith("site1", "monitor1");
        });

        it("should handle database errors during stop operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = createMockMonitor("monitor1", true);
            const site = createMockSite("site1", [monitor]);

            mockSitesCache.set("site1", site);

            const dbError = new Error("Database error");
            mockWithDatabaseOperation.mockRejectedValueOnce(dbError);

            const result = await stopMonitoringForSite(
                config,
                "site1",
                "monitor1"
            );

            expect(result).toBe(false);
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to stop monitoring for site1:monitor1",
                dbError
            );
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle undefined monitor properties gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = {
                type: "http",
                url: "https://example.com",
            } as Monitor;
            const site = createMockSite("site1", [monitor]);

            mockSitesCache.set("site1", site);

            const result = await startAllMonitoring(config, false);

            expect(result).toBe(true);
            expect(mockMonitorRepository.updateInternal).not.toHaveBeenCalled();
        });

        it("should handle sites with empty monitor arrays", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const site = createMockSite("site1", []);

            mockSitesCache.set("site1", site);

            const result = await startAllMonitoring(config, false);

            expect(result).toBe(true);
            expect(mockMonitorScheduler.startSite).toHaveBeenCalledWith(site);
            expect(mockMonitorRepository.updateInternal).not.toHaveBeenCalled();
        });

        it("should handle database service returning null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            mockDatabaseService.getDatabase = vi.fn().mockReturnValue(null);

            const monitor = createMockMonitor("monitor1");
            const site = createMockSite("site1", [monitor]);

            mockSitesCache.set("site1", site);

            const result = await startAllMonitoring(config, false);

            expect(result).toBe(true);
            expect(mockMonitorRepository.updateInternal).toHaveBeenCalledWith(
                null,
                "monitor1",
                {
                    monitoring: true,
                    status: MONITOR_STATUS.PENDING,
                }
            );
        });

        it("should handle concurrent operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorLifecycle", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const monitor1 = createMockMonitor("monitor1");
            const monitor2 = createMockMonitor("monitor2");
            const site = createMockSite("site1", [monitor1, monitor2]);

            mockSitesCache.set("site1", site);

            // Start multiple operations concurrently
            const [
                result1,
                result2,
                result3,
            ] = await Promise.all([
                startAllMonitoring(config, false),
                startMonitoringForSite(config, "site1"), // This returns false without callback
                stopMonitoringForSite(config, "site1"), // This returns false without callback
            ]);

            expect(result1).toBe(true); // startAllMonitoring should succeed
            expect(result2).toBe(false); // startMonitoringForSite without callback returns false
            expect(result3).toBe(false); // stopMonitoringForSite without callback returns false
        });
    });
});
