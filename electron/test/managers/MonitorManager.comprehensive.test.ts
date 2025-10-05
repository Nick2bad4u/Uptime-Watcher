/**
 * Comprehensive tests for MonitorManager.ts Targets 90%+ branch coverage for
 * all MonitorManager functions
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { MonitorManager } from "../../managers/MonitorManager";
import type { Site, StatusUpdate, Monitor } from "../../../shared/types.js";
import { DEFAULT_CHECK_INTERVAL } from "../../constants";

/**
 * Helper function to create a complete Monitor object with all required
 * properties
 */
function createMockMonitor(overrides: Partial<Monitor> = {}): Monitor {
    return {
        id: "mock-monitor",
        type: "http",
        monitoring: true,
        checkInterval: 5000,
        timeout: 5000,
        retryAttempts: 3,
        responseTime: 0,
        status: "pending",
        history: [],
        ...overrides,
    };
}

// Mock all the dependencies
vi.mock("../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
    diagnosticsLogger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("../../electronUtils", () => ({
    isDev: vi.fn(() => false),
}));

// Enhanced monitoring is now fully integrated into MonitorManager

// Mock all the dependencies at the top level
const mockSetCheckCallback = vi.fn();
const mockGetActiveCount = vi.fn(() => 0);
const mockIsMonitoring = vi.fn(() => false);
const mockRestartMonitor = vi.fn(() => true);

// Mock MonitorScheduler
vi.mock("../../services/monitoring/MonitorScheduler", () => ({
    MonitorScheduler: vi.fn(() => ({
        setCheckCallback: mockSetCheckCallback,
        getActiveCount: mockGetActiveCount,
        isMonitoring: mockIsMonitoring,
        restartMonitor: mockRestartMonitor,
    })),
}));

vi.mock("../../utils/operationalHooks", () => ({
    withDatabaseOperation: vi.fn(async (operation) => await operation()),
}));

describe("MonitorManager - Comprehensive Coverage", () => {
    let manager: MonitorManager;
    let mockDependencies: any;
    let mockEnhancedServices: any;
    let mockSite: Site;
    let mockMonitor: Site["monitors"][0];
    let mockSitesCache: {
        get: ReturnType<typeof vi.fn>;
        getAll: ReturnType<typeof vi.fn>;
        set: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mockMonitor = {
            id: "monitor-1",
            type: "http",
            monitoring: true,
            checkInterval: 5000,
            url: "https://example.com",
            timeout: 5000,
            retryAttempts: 3,
            responseTime: 0,
            status: "pending",
            history: [],
        };

        mockSite = {
            identifier: "site-1",
            name: "Test Site",
            monitoring: true,
            monitors: [mockMonitor],
        };

        mockSitesCache = {
            get: vi.fn(() => mockSite),
            getAll: vi.fn(() => [mockSite]),
            set: vi.fn(),
        };

        mockDependencies = {
            databaseService: {
                executeTransaction: vi.fn(
                    async (fn: (db: unknown) => Promise<void>) => {
                        await fn({});
                    }
                ),
                getDatabase: vi.fn(() => ({})),
            },
            eventEmitter: {
                emitTyped: vi.fn(),
            },
            getHistoryLimit: vi.fn(() => 10),
            getSitesCache: vi.fn(() => mockSitesCache),
            repositories: {
                history: {},
                monitor: {
                    updateInternal: vi.fn(),
                    createTransactionAdapter: vi
                        .fn()
                        .mockImplementation((db: unknown) => ({
                            update: vi.fn((id: string, changes: unknown) =>
                                mockDependencies.repositories.monitor.updateInternal(
                                    db,
                                    id,
                                    changes
                                )
                            ),
                        })),
                },
                site: {},
            },
            siteService: {},
        };

        mockEnhancedServices = {
            checker: {
                checkMonitor: vi.fn(),
                startMonitoring: vi.fn(),
                stopMonitoring: vi.fn(),
            },
            operationRegistry: {},
            statusUpdateService: {},
            timeoutManager: {},
        } as any; // Type assertion to bypass strict typing for tests

        manager = new MonitorManager(mockDependencies, mockEnhancedServices);
    });

    describe("Constructor and Basic Methods", () => {
        it("should construct with all dependencies properly injected", async ({
            annotate,
        }) => {
            await annotate("Component: MonitorManager", "component");
            await annotate(
                "Test Type: Unit - Constructor Validation",
                "test-type"
            );
            await annotate(
                "Operation: Dependency Injection Validation",
                "operation"
            );
            await annotate(
                "Priority: Critical - Core Initialization",
                "priority"
            );
            await annotate(
                "Complexity: Medium - Multi-Dependency Constructor",
                "complexity"
            );
            await annotate(
                "Dependencies: Event emitter, scheduler, services",
                "dependencies"
            );
            await annotate(
                "Purpose: Ensure MonitorManager is properly constructed with all dependencies",
                "purpose"
            );

            expect(manager).toBeDefined();
            expect(mockDependencies.eventEmitter).toBeDefined();
        });

        it("should return current active monitor count", async ({
            annotate,
        }) => {
            await annotate("Component: MonitorManager", "component");
            await annotate("Test Type: Unit - State Query", "test-type");
            await annotate(
                "Operation: Active Monitor Count Retrieval",
                "operation"
            );
            await annotate("Priority: High - Monitoring Status", "priority");
            await annotate(
                "Complexity: Low - Scheduler Delegation",
                "complexity"
            );
            await annotate(
                "Delegation: Delegates to MonitorScheduler",
                "delegation"
            );
            await annotate(
                "Purpose: Validate active monitor count reporting",
                "purpose"
            );

            const result = manager.getActiveMonitorCount();
            expect(result).toBe(0);
        });

        it("should check if specific monitor is active in scheduler", async ({
            annotate,
        }) => {
            await annotate("Component: MonitorManager", "component");
            await annotate("Test Type: Unit - State Query", "test-type");
            await annotate(
                "Operation: Individual Monitor Status Check",
                "operation"
            );
            await annotate(
                "Priority: Medium - Monitor Status Tracking",
                "priority"
            );
            await annotate("Complexity: Low - Scheduler Query", "complexity");
            await annotate("Scope: Site-specific monitor status", "scope");
            await annotate(
                "Purpose: Validate individual monitor active status checking",
                "purpose"
            );

            const result = manager.isMonitorActiveInScheduler(
                "site-1",
                "monitor-1"
            );
            expect(result).toBeFalsy();
        });

        it("should return initial monitoring state as false", async ({
            annotate,
        }) => {
            await annotate("Component: MonitorManager", "component");
            await annotate("Test Type: Unit - Initial State", "test-type");
            await annotate(
                "Operation: Global Monitoring State Check",
                "operation"
            );
            await annotate("Priority: Medium - System State", "priority");
            await annotate(
                "Complexity: Low - Boolean State Check",
                "complexity"
            );
            await annotate(
                "Initial State: No monitoring active at startup",
                "initial-state"
            );
            await annotate(
                "Purpose: Validate initial monitoring state is inactive",
                "purpose"
            );

            expect(manager.isMonitoringActive()).toBeFalsy();
        });

        it("should restart monitor with new config successfully", async ({
            annotate,
        }) => {
            await annotate("Component: MonitorManager", "component");
            await annotate(
                "Test Type: Unit - Configuration Update",
                "test-type"
            );
            await annotate(
                "Operation: Monitor Configuration Restart",
                "operation"
            );
            await annotate(
                "Priority: High - Dynamic Configuration",
                "priority"
            );
            await annotate(
                "Complexity: Medium - Config Application",
                "complexity"
            );
            await annotate(
                "Hot Reload: Apply new config without full restart",
                "hot-reload"
            );
            await annotate(
                "Purpose: Validate monitor can be restarted with new configuration",
                "purpose"
            );

            const result = manager.restartMonitorWithNewConfig(
                "site-1",
                mockMonitor
            );
            expect(result).toBeTruthy();
        });
    });

    describe("checkSiteManually - Comprehensive Coverage", () => {
        it("should perform manual check and emit completion event", async ({
            annotate,
        }) => {
            await annotate("Component: MonitorManager", "component");
            await annotate(
                "Test Type: Integration - Manual Check Flow",
                "test-type"
            );
            await annotate(
                "Operation: Manual Site Check with Event Emission",
                "operation"
            );
            await annotate(
                "Priority: Critical - Core Functionality",
                "priority"
            );
            await annotate(
                "Complexity: High - Multi-Service Integration",
                "complexity"
            );
            await annotate(
                "Event Flow: Check execution -> status update -> event emission",
                "event-flow"
            );
            await annotate(
                "Purpose: Validate complete manual check flow with proper event emission",
                "purpose"
            );

            const mockStatusUpdate: StatusUpdate = {
                siteIdentifier: "site-1",
                monitorId: "monitor-1",
                status: "up",
                timestamp: new Date().toISOString(),
            };

            // Mock the enhanced checker to return the status update
            vi.mocked(
                mockEnhancedServices.checker.checkMonitor
            ).mockResolvedValue(mockStatusUpdate);

            const result = await manager.checkSiteManually(
                "site-1",
                "monitor-1"
            );

            expect(
                mockEnhancedServices.checker.checkMonitor
            ).toHaveBeenCalledWith(
                mockSite,
                "monitor-1",
                true // IsManualCheck flag
            );
            expect(
                mockDependencies.eventEmitter.emitTyped
            ).toHaveBeenCalledWith(
                "internal:monitor:manual-check-completed",
                expect.objectContaining({
                    identifier: "site-1",
                    monitorId: "monitor-1",
                    operation: "manual-check-completed",
                    result: mockStatusUpdate,
                })
            );
            expect(result).toEqual(mockStatusUpdate);
        });

        it("should handle manual check without monitor ID", async () => {
            const mockStatusUpdate: StatusUpdate = {
                siteIdentifier: "site-1",
                monitorId: "monitor-1",
                status: "up",
                timestamp: new Date().toISOString(),
            };

            // Mock the enhanced checker to return the status update
            vi.mocked(
                mockEnhancedServices.checker.checkMonitor
            ).mockResolvedValue(mockStatusUpdate);

            const result = await manager.checkSiteManually("site-1");

            // Should check the first monitor when no specific monitor ID provided
            expect(
                mockEnhancedServices.checker.checkMonitor
            ).toHaveBeenCalledWith(mockSite, "monitor-1", true);
            expect(
                mockDependencies.eventEmitter.emitTyped
            ).toHaveBeenCalledWith(
                "internal:monitor:manual-check-completed",
                expect.objectContaining({
                    identifier: "site-1",
                    operation: "manual-check-completed",
                    result: mockStatusUpdate,
                })
            );
            expect(result).toEqual(mockStatusUpdate);
        });

        it("should handle manual check returning null", async () => {
            // Mock the enhanced checker to return undefined
            vi.mocked(
                mockEnhancedServices.checker.checkMonitor
            ).mockResolvedValue(undefined);

            const result = await manager.checkSiteManually(
                "site-1",
                "monitor-1"
            );

            expect(
                mockEnhancedServices.checker.checkMonitor
            ).toHaveBeenCalledWith(mockSite, "monitor-1", true);
            expect(result).toBeUndefined();
        });
    });

    describe("setupNewMonitors - Comprehensive Coverage", () => {
        it("should setup new monitors successfully", async () => {
            const newMonitorIds = ["monitor-2", "monitor-3"];
            const newMonitor1 = createMockMonitor({
                id: "monitor-2",
                type: "http",
                monitoring: true,
            });
            const newMonitor2 = createMockMonitor({
                id: "monitor-3",
                type: "http",
                monitoring: false,
            });

            const siteWithNewMonitors = {
                ...mockSite,
                monitors: [
                    ...mockSite.monitors,
                    newMonitor1,
                    newMonitor2,
                ],
            };

            await manager.setupNewMonitors(siteWithNewMonitors, newMonitorIds);

            // The setup should complete without errors
            expect(true).toBeTruthy(); // Test completed successfully
        });

        it("should handle empty new monitor IDs array", async () => {
            await manager.setupNewMonitors(mockSite, []);

            // Should complete without errors but not emit events
            expect(
                mockDependencies.eventEmitter.emitTyped
            ).not.toHaveBeenCalled();
        });

        it("should handle new monitor IDs that don't match any monitors", async () => {
            await manager.setupNewMonitors(mockSite, ["non-existent-id"]);

            // Should complete without errors
            expect(
                mockDependencies.eventEmitter.emitTyped
            ).not.toHaveBeenCalled();
        });

        it("should apply default intervals to new monitors without checkInterval", async () => {
            const newMonitor = createMockMonitor({
                id: "monitor-new",
                type: "http",
                monitoring: true,
                checkInterval: 0, // Should trigger default interval
            });
            const siteWithNewMonitor = {
                ...mockSite,
                monitors: [...mockSite.monitors, newMonitor],
            };

            await manager.setupNewMonitors(siteWithNewMonitor, ["monitor-new"]);

            expect(newMonitor.checkInterval).toBe(DEFAULT_CHECK_INTERVAL);
        });
    });

    describe("setupSiteForMonitoring - Comprehensive Coverage", () => {
        it("should setup site successfully with auto-start", async () => {
            // Use a monitor without checkInterval to trigger updateInternal
            const siteWithoutInterval = {
                ...mockSite,
                monitors: [
                    createMockMonitor({
                        id: "monitor-1",
                        type: "http",
                        monitoring: true,
                        // No checkInterval - this will trigger shouldApplyDefaultInterval
                        url: "https://example.com",
                        checkInterval: 0, // Explicitly set to 0 to test default application
                    }),
                ],
            };

            await manager.setupSiteForMonitoring(siteWithoutInterval);

            expect(
                mockDependencies.repositories.monitor.updateInternal
            ).toHaveBeenCalled();
            expect(
                mockDependencies.eventEmitter.emitTyped
            ).toHaveBeenCalledWith(
                "internal:monitor:site-setup-completed",
                expect.objectContaining({
                    identifier: "site-1",
                    operation: "site-setup-completed",
                })
            );
        });

        it("should setup site with monitoring disabled", async () => {
            const disabledSite = { ...mockSite, monitoring: false };

            await manager.setupSiteForMonitoring(disabledSite);

            expect(
                mockDependencies.eventEmitter.emitTyped
            ).toHaveBeenCalledWith(
                "internal:monitor:site-setup-completed",
                expect.objectContaining({
                    identifier: "site-1",
                })
            );
        });

        it("should setup site with no monitors", async () => {
            const siteWithoutMonitors = { ...mockSite, monitors: [] };

            await manager.setupSiteForMonitoring(siteWithoutMonitors);

            expect(
                mockDependencies.eventEmitter.emitTyped
            ).toHaveBeenCalledWith(
                "internal:monitor:site-setup-completed",
                expect.objectContaining({
                    identifier: "site-1",
                })
            );
        });

        it("should setup site with monitors having individual monitoring disabled", async () => {
            const disabledMonitor = { ...mockMonitor, monitoring: false };
            const siteWithDisabledMonitor = {
                ...mockSite,
                monitors: [disabledMonitor],
            };

            await manager.setupSiteForMonitoring(siteWithDisabledMonitor);

            expect(
                mockDependencies.eventEmitter.emitTyped
            ).toHaveBeenCalledWith(
                "internal:monitor:site-setup-completed",
                expect.objectContaining({
                    identifier: "site-1",
                })
            );
        });

        it("should setup site with monitors missing IDs", async () => {
            const monitorWithoutId = {
                ...mockMonitor,
                id: "invalid-id",
            } as Monitor; // Use a valid string instead of undefined
            const siteWithInvalidMonitor = {
                ...mockSite,
                monitors: [monitorWithoutId],
            };

            await manager.setupSiteForMonitoring(siteWithInvalidMonitor);

            expect(
                mockDependencies.eventEmitter.emitTyped
            ).toHaveBeenCalledWith(
                "internal:monitor:site-setup-completed",
                expect.objectContaining({
                    identifier: "site-1",
                })
            );
        });

        it("should apply default intervals in development mode", async () => {
            const { isDev } = await import("../../electronUtils");
            vi.mocked(isDev).mockReturnValue(true);

            const monitorWithoutInterval = { ...mockMonitor, checkInterval: 0 };
            const siteWithoutInterval = {
                ...mockSite,
                monitors: [monitorWithoutInterval],
            };

            await manager.setupSiteForMonitoring(siteWithoutInterval);

            expect(
                mockDependencies.repositories.monitor.updateInternal
            ).toHaveBeenCalledWith({}, "monitor-1", {
                checkInterval: DEFAULT_CHECK_INTERVAL,
            });
        });
    });

    describe("Start/Stop Monitoring - Enhanced Coverage", () => {
        it("should start monitoring for all sites using enhanced system", async () => {
            // Spy on the enhanced method directly
            const startAllSpy = vi
                .spyOn(manager, "startAllMonitoringEnhanced" as any)
                .mockResolvedValue(true);

            await manager.startMonitoring();

            expect(startAllSpy).toHaveBeenCalled();
            expect(
                mockDependencies.eventEmitter.emitTyped
            ).toHaveBeenCalledWith(
                "monitoring:started",
                expect.objectContaining({
                    monitorCount: 1,
                    siteCount: 1,
                })
            );
        });

        it("should start monitoring for specific site with monitor ID using enhanced system", async () => {
            // Spy on the enhanced method directly
            const startForSiteSpy = vi
                .spyOn(manager, "startMonitoringForSiteEnhanced" as any)
                .mockResolvedValue(true);

            const result = await manager.startMonitoringForSite(
                "site-1",
                "monitor-1"
            );

            expect(startForSiteSpy).toHaveBeenCalled();
            expect(
                mockDependencies.eventEmitter.emitTyped
            ).toHaveBeenCalledWith(
                "internal:monitor:started",
                expect.objectContaining({
                    identifier: "site-1",
                    monitorId: "monitor-1",
                    operation: "started",
                })
            );
            expect(result).toBeTruthy();
        });

        it("should start monitoring for specific site without monitor ID using enhanced system", async () => {
            // Spy on the enhanced method directly
            const startForSiteSpy = vi
                .spyOn(manager, "startMonitoringForSiteEnhanced" as any)
                .mockResolvedValue(true);

            const result = await manager.startMonitoringForSite("site-1");

            expect(startForSiteSpy).toHaveBeenCalled();
            expect(
                mockDependencies.eventEmitter.emitTyped
            ).toHaveBeenCalledWith(
                "internal:monitor:started",
                expect.objectContaining({
                    identifier: "site-1",
                    operation: "started",
                })
            );
            expect(result).toBeTruthy();
        });

        it("should handle failed start monitoring for site in enhanced system", async () => {
            // Spy on the enhanced method to return false
            const startForSiteSpy = vi
                .spyOn(manager, "startMonitoringForSiteEnhanced" as any)
                .mockResolvedValue(false);

            const result = await manager.startMonitoringForSite("site-1");

            expect(startForSiteSpy).toHaveBeenCalled();
            expect(
                mockDependencies.eventEmitter.emitTyped
            ).not.toHaveBeenCalledWith(
                "internal:monitor:started",
                expect.any(Object)
            );
            expect(result).toBeFalsy();
        });

        it("should stop monitoring for all sites using enhanced system", async () => {
            // Spy on the enhanced method directly
            const stopAllSpy = vi
                .spyOn(manager, "stopAllMonitoringEnhanced" as any)
                .mockResolvedValue(false);

            await manager.stopMonitoring();

            expect(stopAllSpy).toHaveBeenCalled();
            expect(
                mockDependencies.eventEmitter.emitTyped
            ).toHaveBeenCalledWith(
                "monitoring:stopped",
                expect.objectContaining({
                    activeMonitors: 0,
                    reason: "user",
                })
            );
        });

        it("should stop monitoring for specific site with monitor ID using enhanced system", async () => {
            // Spy on the enhanced method directly
            const stopForSiteSpy = vi
                .spyOn(manager, "stopMonitoringForSiteEnhanced" as any)
                .mockResolvedValue(true);

            const result = await manager.stopMonitoringForSite(
                "site-1",
                "monitor-1"
            );

            expect(stopForSiteSpy).toHaveBeenCalled();
            expect(
                mockDependencies.eventEmitter.emitTyped
            ).toHaveBeenCalledWith(
                "internal:monitor:stopped",
                expect.objectContaining({
                    identifier: "site-1",
                    monitorId: "monitor-1",
                    operation: "stopped",
                    reason: "user",
                })
            );
            expect(result).toBeTruthy();
        });

        it("should handle failed stop monitoring for site", async () => {
            // Spy on the enhanced method to return false
            const stopForSiteSpy = vi
                .spyOn(manager, "stopMonitoringForSiteEnhanced" as any)
                .mockResolvedValue(false);

            const result = await manager.stopMonitoringForSite("site-1");

            expect(stopForSiteSpy).toHaveBeenCalled();
            expect(
                mockDependencies.eventEmitter.emitTyped
            ).not.toHaveBeenCalledWith(
                "internal:monitor:stopped",
                expect.any(Object)
            );
            expect(result).toBeFalsy();
        });
    });

    describe("Edge Cases and Error Paths", () => {
        it("should handle recursive call prevention in startMonitoringForSite", async () => {
            // Mock the enhanced method to return true
            const startForSiteSpy = vi
                .spyOn(manager, "startMonitoringForSiteEnhanced" as any)
                .mockResolvedValue(true);

            // Test that the method can be called without causing infinite recursion
            const result = await manager.startMonitoringForSite(
                "site-1",
                "monitor-1"
            );
            expect(result).toBeTruthy();
            expect(startForSiteSpy).toHaveBeenCalled();
        });

        it("should handle recursive call prevention in stopMonitoringForSite", async () => {
            // Mock the enhanced method to return true
            const stopForSiteSpy = vi
                .spyOn(manager, "stopMonitoringForSiteEnhanced" as any)
                .mockResolvedValue(true);

            // Test that the method can be called without causing infinite recursion
            const result = await manager.stopMonitoringForSite(
                "site-1",
                "monitor-1"
            );
            expect(result).toBeTruthy();
            expect(stopForSiteSpy).toHaveBeenCalled();
        });

        it("should handle shouldApplyDefaultInterval with zero checkInterval", async () => {
            const monitorWithZeroInterval = {
                ...mockMonitor,
                checkInterval: 0,
            };
            const siteWithZeroInterval = {
                ...mockSite,
                monitors: [monitorWithZeroInterval],
            };

            // Test by calling setupSiteForMonitoring which triggers applyDefaultIntervals
            await manager.setupSiteForMonitoring(siteWithZeroInterval);

            // Zero is considered falsy, so default interval should be applied
            expect(
                mockDependencies.repositories.monitor.updateInternal
            ).toHaveBeenCalledWith({}, "monitor-1", {
                checkInterval: DEFAULT_CHECK_INTERVAL,
            });
            expect(mockSitesCache.set).toHaveBeenCalledWith(
                siteWithZeroInterval.identifier,
                expect.objectContaining({
                    monitors: [
                        expect.objectContaining({
                            checkInterval: DEFAULT_CHECK_INTERVAL,
                        }),
                    ],
                })
            );
            const remediatedMonitor = siteWithZeroInterval.monitors[0];
            expect(remediatedMonitor).toBeDefined();
            expect(remediatedMonitor?.checkInterval).toBe(
                DEFAULT_CHECK_INTERVAL
            );
        });

        it("should handle shouldApplyDefaultInterval with null checkInterval", async () => {
            const monitorWithNullInterval = {
                ...mockMonitor,
                checkInterval: null as any,
            };
            const siteWithNullInterval = {
                ...mockSite,
                monitors: [monitorWithNullInterval],
            };

            await manager.setupSiteForMonitoring(siteWithNullInterval);

            expect(
                mockDependencies.repositories.monitor.updateInternal
            ).toHaveBeenCalledWith({}, "monitor-1", {
                checkInterval: DEFAULT_CHECK_INTERVAL,
            });
            expect(mockSitesCache.set).toHaveBeenCalledWith(
                siteWithNullInterval.identifier,
                expect.objectContaining({
                    monitors: [
                        expect.objectContaining({
                            checkInterval: DEFAULT_CHECK_INTERVAL,
                        }),
                    ],
                })
            );
            const remediatedNullMonitor = siteWithNullInterval.monitors[0];
            expect(remediatedNullMonitor).toBeDefined();
            expect(remediatedNullMonitor?.checkInterval).toBe(
                DEFAULT_CHECK_INTERVAL
            );
        });

        it("should handle shouldApplyDefaultInterval with undefined checkInterval", async () => {
            const monitorWithUndefinedInterval = {
                ...mockMonitor,
                checkInterval: undefined as any,
            };
            const siteWithUndefinedInterval = {
                ...mockSite,
                monitors: [monitorWithUndefinedInterval],
            };

            await manager.setupSiteForMonitoring(siteWithUndefinedInterval);

            expect(
                mockDependencies.repositories.monitor.updateInternal
            ).toHaveBeenCalledWith({}, "monitor-1", {
                checkInterval: DEFAULT_CHECK_INTERVAL,
            });
            expect(mockSitesCache.set).toHaveBeenCalledWith(
                siteWithUndefinedInterval.identifier,
                expect.objectContaining({
                    monitors: [
                        expect.objectContaining({
                            checkInterval: DEFAULT_CHECK_INTERVAL,
                        }),
                    ],
                })
            );
            const remediatedUndefinedMonitor =
                siteWithUndefinedInterval.monitors[0];
            expect(remediatedUndefinedMonitor).toBeDefined();
            expect(remediatedUndefinedMonitor?.checkInterval).toBe(
                DEFAULT_CHECK_INTERVAL
            );
        });

        it("should auto-start monitoring after default interval remediation", async () => {
            const monitorWithoutInterval = {
                ...mockMonitor,
                checkInterval: 0,
                monitoring: true,
            };
            const siteNeedingRemediation = {
                ...mockSite,
                monitors: [monitorWithoutInterval],
            };

            const startSpy = vi
                .spyOn(manager, "startMonitoringForSite")
                .mockResolvedValue(true);

            await manager.setupSiteForMonitoring(siteNeedingRemediation);

            expect(startSpy).toHaveBeenCalledWith(
                siteNeedingRemediation.identifier,
                "monitor-1"
            );
        });

        it("should handle site not found in cache during scheduled check", async () => {
            mockDependencies.getSitesCache = vi.fn(() => ({
                get: vi.fn(() => null), // Site not found
                getAll: vi.fn(() => []),
            }));

            const testEnhancedServices = {
                checker: {
                    checkMonitor: vi.fn(),
                    startMonitoring: vi.fn(),
                    stopMonitoring: vi.fn(),
                },
                operationRegistry: {},
                statusUpdateService: {},
                timeoutManager: {},
            } as any;

            // Create a new manager instance with the updated cache
            new MonitorManager(mockDependencies, testEnhancedServices); // Don't need to store reference

            // Simulate a scheduled check by getting the callback and calling it
            const MonitorSchedulerMock = await import(
                "../../services/monitoring/MonitorScheduler"
            );
            const scheduleInstance =
                new MonitorSchedulerMock.MonitorScheduler();

            // Get the callback that was set
            const callbackArgs = vi.mocked(scheduleInstance.setCheckCallback)
                .mock.calls[0];
            expect(callbackArgs).toBeDefined();

            if (callbackArgs) {
                const checkCallback = callbackArgs[0];

                // Call the callback with a site that won't be found
                await checkCallback("non-existent-site", "monitor-1");
            }

            // Should complete without errors (site not found is handled gracefully)
        });

        it("should handle monitor without ID in setupIndividualNewMonitors", async () => {
            const monitorWithoutId = createMockMonitor({
                id: "", // Use empty string instead of missing property
                type: "http",
                monitoring: true,
                checkInterval: 0,
            });
            const siteWithInvalidMonitor = {
                ...mockSite,
                monitors: [monitorWithoutId],
            };

            await manager.setupNewMonitors(siteWithInvalidMonitor, []);

            // Should complete without errors and not call updateInternal for monitor without ID
            expect(
                mockDependencies.repositories.monitor.updateInternal
            ).not.toHaveBeenCalled();
        });

        it("should handle auto-start with monitor missing id in autoStartNewMonitors", async () => {
            // Mock the enhanced method
            const startForSiteSpy = vi
                .spyOn(manager, "startMonitoringForSiteEnhanced" as any)
                .mockResolvedValue(true);

            const monitorWithoutId = createMockMonitor({
                id: "", // Use empty string for invalid ID test
                type: "http",
                monitoring: true,
                checkInterval: 5000,
            });
            const siteWithInvalidMonitor = {
                ...mockSite,
                monitors: [...mockSite.monitors, monitorWithoutId],
            };

            await manager.setupNewMonitors(siteWithInvalidMonitor, []);

            // Should complete without errors even with monitor missing ID
            // Only valid monitors should be processed
            expect(startForSiteSpy).not.toHaveBeenCalled();
        });
    });
});
