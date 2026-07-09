/**
 * @file Verifies MonitorManager default interval logging uses seconds.
 */

import type { Site } from "@shared/types";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { MonitorManager } from "../../managers/MonitorManager";

// Hoist the mock function to avoid initialization issues
const mockInterpolateLogTemplate = vi.hoisted(() =>
    vi.fn((template: string, params: any) => {
        // Simulate the interval interpolation used by production log templates.
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

describe("MonitorManager interval logging", () => {
    let manager: MonitorManager;
    let mockDependencies: any;
    let mockEnhancedServices: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset template interpolation mock to return the seconds value.
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

    describe("DEFAULT_CHECK_INTERVAL seconds conversion", () => {
        it("should log 300000ms defaults as 300s", async () => {
            // Arrange: Create a site with monitors that will trigger interval app
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
                    },
                ],
            };

            // Mock repository to return monitors that need interval updates
            mockDependencies.siteRepository.findAllSites.mockResolvedValue([
                testSite,
            ]);
            mockDependencies.monitorRepository.findMonitorsBySiteId.mockResolvedValue(
                testSite.monitors
            );

            // Act: Setup site for monitoring (this triggers the interval app and division)
            await manager.setupSiteForMonitoring(testSite);

            // Assert: Verify the interpolation was called with the correct seconds value
            expect(mockInterpolateLogTemplate).toHaveBeenCalledWith(
                expect.stringContaining("interval"),
                expect.objectContaining({
                    interval: 300, // DEFAULT_CHECK_INTERVAL (300000) / 1000 = 300s
                    monitorId: "monitor-1",
                })
            );

            expect(mockInterpolateLogTemplate).not.toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    interval: 300_000_000,
                })
            );
        });

        it("should log defaulted intervals consistently for different monitors", async () => {
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
                    },
                ],
            };

            mockDependencies.siteRepository.findAllSites.mockResolvedValue([
                testSite,
            ]);
            mockDependencies.monitorRepository.findMonitorsBySiteId.mockResolvedValue(
                testSite.monitors
            );

            await manager.setupSiteForMonitoring(testSite);

            expect(mockInterpolateLogTemplate).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    interval: 300,
                    monitorId: "custom-monitor",
                })
            );
        });

        it("should log the default interval in a reasonable seconds range", async () => {
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
                    },
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

            expect(loggedInterval).not.toBe(60_000_000);
            expect(loggedInterval).not.toBe(0.06);
        });
    });
});
