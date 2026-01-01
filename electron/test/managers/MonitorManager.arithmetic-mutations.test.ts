/**
 * Arithmetic mutation tests for MonitorManager.ts
 *
 * Targets interval division operations to kill arithmetic operator mutations.
 * These tests ensure proper millisecond to sec // The division should still use
 * DEFAULT_CHECK_INTERVAL (300000) not customInterval
 * expect(mockInterpolateLogTemplate).toHaveBeenCalledWith( expect.anything(),
 * expect.objectContaining({ interval: 300, // DEFAULT_CHECK_INTERVAL (300000) /
 * 1000 = 300s monitorId: "custom-monitor", })versions in logging and
 * calculations.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { MonitorManager } from "../../managers/MonitorManager";
import type { Site, Monitor } from "@shared/types";

// Hoist the mock function to avoid initialization issues
const mockInterpolateLogTemplate = vi.hoisted(() =>
    vi.fn((template: string, params: any) => {
        // Simulate template interpolation for arithmetic testing
        if (
            template &&
            typeof template === "string" &&
            template.includes("interval") &&
            params &&
            params.interval !== undefined
        ) {
            return `Applied interval for monitor ${params.monitorId}: ${params.interval}s`;
        }
        return template || "";
    })
);

// Mock all dependencies
vi.mock("../../services/database/DatabaseService");
vi.mock("../../services/monitoring/EnhancedMonitoringServiceFactory");
vi.mock("../../../shared/utils/logTemplates", () => ({
    interpolateLogTemplate: mockInterpolateLogTemplate,
    LOG_TEMPLATES: {
        debug: {
            MONITOR_INTERVALS_APPLIED:
                "[MonitorManager] Applied interval for monitor {monitorId}: {interval}s",
            MONITOR_MANAGER_INTERVALS_SETTING:
                "[MonitorManager] Applying default intervals for site: {identifier}",
        },
        services: {
            MONITOR_MANAGER_APPLYING_INTERVALS:
                "[MonitorManager] Completed applying default intervals for site: {identifier}",
        },
    },
}));

// Mock logger
const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
};

vi.mock("../../../shared/utils/logger", () => ({
    default: mockLogger,
}));

describe("MonitorManager arithmetic mutations", () => {
    let manager: MonitorManager;
    let mockDependencies: any;
    let mockEnhancedServices: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset template interpolation mock to return seconds value for testing
        mockInterpolateLogTemplate.mockImplementation(
            (template: string, params: any) => {
                if (
                    template &&
                    typeof template === "string" &&
                    template.includes("interval") &&
                    params &&
                    params.interval !== undefined
                ) {
                    return `Applied interval for monitor ${params.monitorId}: ${params.interval}s`;
                }
                return template || "";
            }
        );

        mockDependencies = {
            eventEmitter: {
                emitTyped: vi.fn(),
                onTyped: vi.fn(),
            },
            siteRepository: {
                findAllSites: vi.fn().mockResolvedValue([]),
            },
            monitorRepository: {
                findMonitorsBySiteId: vi.fn().mockResolvedValue([]),
                updateMonitor: vi.fn().mockResolvedValue({}),
            },
            historyRepository: {},
            databaseService: {
                executeTransaction: vi
                    .fn()
                    .mockImplementation(
                        async (
                            handler: (
                                db: Record<string, unknown>
                            ) => Promise<unknown> | unknown
                        ) => {
                            const db = {} as Record<string, unknown>;
                            return handler(db);
                        }
                    ),
                getDatabase: vi.fn().mockReturnValue({}),
            },
            cache: {
                set: vi.fn(),
                get: vi.fn(),
                delete: vi.fn(),
            },
            repositories: {
                monitor: {
                    updateInternal: vi.fn().mockResolvedValue({}),
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
            },
            getSitesCache: vi.fn().mockReturnValue({
                get: vi.fn(),
                set: vi.fn(),
                delete: vi.fn(),
            }),
        };

        mockEnhancedServices = {
            enhancedMonitorChecker: {
                executeOperation: vi.fn().mockResolvedValue({}),
            },
            enhancedScheduler: {
                isMonitorActive: vi.fn().mockReturnValue(false),
                startMonitoring: vi.fn().mockResolvedValue(true),
                stopMonitoring: vi.fn().mockResolvedValue(true),
            },
        };

        manager = new MonitorManager(mockDependencies, mockEnhancedServices);
    });

    describe("DEFAULT_CHECK_INTERVAL / 1000 division for seconds conversion", () => {
        it("should correctly convert 300000ms to 300s (kills / -> * mutation)", async () => {
            // Arrange: Create a site with monitors that will trigger interval application
            const testSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com",
                        checkInterval: 0, // Will be set to DEFAULT_CHECK_INTERVAL
                        monitoring: true,
                        status: "up",
                        responseTime: 0,
                        timeout: 0,
                        retryAttempts: 0,
                        history: [],
                    } as Monitor,
                ],
            };

            // Mock repository to return monitors that need interval updates
            mockDependencies.siteRepository.findAllSites.mockResolvedValue([
                testSite,
            ]);
            mockDependencies.monitorRepository.findMonitorsBySiteId.mockResolvedValue(
                testSite.monitors
            );

            // Act: Setup site for monitoring (this triggers the interval application and division)
            await manager.setupSiteForMonitoring(testSite);

            // Assert: Verify the interpolation was called with the correct seconds value
            expect(mockInterpolateLogTemplate).toHaveBeenCalledWith(
                expect.stringContaining("interval"),
                expect.objectContaining({
                    interval: 300, // DEFAULT_CHECK_INTERVAL (300000) / 1000 = 300s
                    monitorId: "monitor-1",
                })
            );

            // Mutation (/ 1000 -> * 1000) would yield 300_000_000 (300000ms * 1000 = 300_000_000s = massive value)
            expect(mockInterpolateLogTemplate).not.toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    interval: 300_000_000, // Ensure mutation doesn't produce this value
                })
            );
        });

        it("should handle custom intervals correctly (300000ms -> 300s)", async () => {
            // Test with a different interval to ensure the arithmetic is working correctly
            const testSite: Site = {
                identifier: "custom-site",
                name: "Custom Site",
                monitoring: true,
                monitors: [
                    {
                        id: "custom-monitor",
                        type: "http",
                        url: "https://custom.com",
                        checkInterval: 0, // Will be set to DEFAULT_CHECK_INTERVAL
                        monitoring: true,
                        status: "up",
                        responseTime: 0,
                        timeout: 0,
                        retryAttempts: 0,
                        history: [],
                    } as Monitor,
                ],
            };

            mockDependencies.siteRepository.findAllSites.mockResolvedValue([
                testSite,
            ]);
            mockDependencies.monitorRepository.findMonitorsBySiteId.mockResolvedValue(
                testSite.monitors
            );

            await manager.setupSiteForMonitoring(testSite);

            // The division should still use DEFAULT_CHECK_INTERVAL (300000) not customInterval
            expect(mockInterpolateLogTemplate).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    interval: 300, // Still DEFAULT_CHECK_INTERVAL / 1000
                    monitorId: "custom-monitor",
                })
            );
        });

        it("should log seconds value in reasonable range (kills extreme mutation values)", async () => {
            const testSite: Site = {
                identifier: "range-test",
                name: "Range Test",
                monitoring: true,
                monitors: [
                    {
                        id: "range-monitor",
                        type: "http",
                        url: "https://range.com",
                        checkInterval: 0,
                        monitoring: true,
                        status: "up",
                        responseTime: 0,
                        timeout: 0,
                        retryAttempts: 0,
                        history: [],
                    } as Monitor,
                ],
            };

            mockDependencies.siteRepository.findAllSites.mockResolvedValue([
                testSite,
            ]);
            mockDependencies.monitorRepository.findMonitorsBySiteId.mockResolvedValue(
                testSite.monitors
            );

            await manager.setupSiteForMonitoring(testSite);

            // Extract the actual interval value that was logged
            const calls = mockInterpolateLogTemplate.mock.calls;
            const intervalCall = calls.find(
                (call) =>
                    call[1] &&
                    typeof call[1] === "object" &&
                    "interval" in call[1]
            );

            expect(intervalCall).toBeDefined();
            const loggedInterval = intervalCall![1].interval;

            // The interval should be in a reasonable range for seconds (1-3600)
            expect(loggedInterval).toBeGreaterThan(0);
            expect(loggedInterval).toBeLessThan(3600); // Less than 1 hour in seconds

            // Specifically, DEFAULT_CHECK_INTERVAL / 1000 = 300000 / 1000 = 300
            expect(loggedInterval).toBe(300);

            // Ensure mutations don't produce unreasonable values
            expect(loggedInterval).not.toBe(60_000_000); // / -> * mutation
            expect(loggedInterval).not.toBe(0.06); // / -> * 1000000 hypothetical mutation
        });
    });
});
