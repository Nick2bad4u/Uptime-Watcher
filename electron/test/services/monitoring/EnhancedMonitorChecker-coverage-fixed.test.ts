/**
 * @file Comprehensive coverage tests for EnhancedMonitorChecker.ts
 *
 *   This test file targets all uncovered lines and branches in
 *   EnhancedMonitorChecker.ts to boost coverage from 43.4% to maximum
 *   coverage.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { EnhancedMonitorChecker } from "../../../services/monitoring/EnhancedMonitorChecker";
import type { Site } from "../../../../shared/types";

describe("EnhancedMonitorChecker Coverage Tests", () => {
    let enhancedChecker: EnhancedMonitorChecker;
    let mockEventBus: any;
    let mockSitesCache: any;
    let mockSiteRepository: any;
    let mockMonitorRepository: any;
    let mockHistoryRepository: any;
    let mockOperationRegistry: any;
    let mockMonitorFactory: any;
    let mockTimeoutManager: any;
    let mockStatusUpdateService: any;

    beforeEach(() => {
        // Create mock dependencies
        mockEventBus = {
            emit: vi.fn().mockResolvedValue(undefined),
            emitTyped: vi.fn().mockResolvedValue(undefined),
        };

        mockSitesCache = {
            get: vi.fn(),
        };

        mockSiteRepository = {
            findByIdentifier: vi.fn(),
        };

        mockMonitorRepository = {
            update: vi.fn().mockResolvedValue(true),
            findByIdentifier: vi.fn().mockResolvedValue({
                id: "monitor-1",
                type: "http",
                url: "https://example.com/",
                status: "up",
                lastChecked: new Date(),
                checkInterval: 30_000,
                history: [],
                monitoring: true,
                responseTime: 200,
                retryAttempts: 3,
                timeout: 10_000,
            }),
            create: vi.fn(),
        };

        mockHistoryRepository = {
            create: vi.fn(),
            addEntry: vi.fn().mockResolvedValue(undefined),
        };

        mockOperationRegistry = {
            initiateCheck: vi.fn(),
            validateOperation: vi.fn(),
            completeOperation: vi.fn(),
            cancelOperations: vi.fn().mockReturnValue(undefined),
        };

        mockMonitorFactory = {
            getMonitor: vi.fn(),
        };

        mockTimeoutManager = {
            createTimeout: vi.fn(),
            scheduleTimeout: vi.fn(),
            clearTimeout: vi.fn(),
        };

        mockStatusUpdateService = {
            updateMonitorStatus: vi.fn(),
        };

        // Create the EnhancedMonitorChecker instance
        enhancedChecker = new EnhancedMonitorChecker({
            eventEmitter: mockEventBus,
            getHistoryLimit: () => 100,
            historyRepository: mockHistoryRepository,
            monitorRepository: mockMonitorRepository,
            operationRegistry: mockOperationRegistry,
            siteRepository: mockSiteRepository,
            sites: mockSitesCache,
            statusUpdateService: mockStatusUpdateService,
            timeoutManager: mockTimeoutManager,
        });

        // Replace the actual monitor instances with mocks
        (enhancedChecker as any).httpMonitor = {
            check: vi.fn(),
        };
        (enhancedChecker as any).pingMonitor = {
            check: vi.fn(),
        };
        (enhancedChecker as any).portMonitor = {
            check: vi.fn(),
        };
        (enhancedChecker as any).dnsMonitor = {
            check: vi.fn(),
        };
    });

    describe("Constructor and Initialization", () => {
        it("should initialize with all dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: EnhancedMonitorChecker-coverage-fixed", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const checker = new EnhancedMonitorChecker({
                eventEmitter: mockEventBus,
                getHistoryLimit: () => 100,
                historyRepository: mockHistoryRepository,
                monitorRepository: mockMonitorRepository,
                operationRegistry: mockOperationRegistry,
                siteRepository: mockSiteRepository,
                sites: mockSitesCache,
                statusUpdateService: mockStatusUpdateService,
                timeoutManager: mockTimeoutManager,
            });

            expect(checker).toBeDefined();
        });
    });

    describe("checkMonitor Method Coverage", () => {
        const mockSite: Site = {
            identifier: "test-site",
            name: "Test Site",
            monitoring: true,
            monitors: [
                {
                    id: "monitor-1",
                    type: "http",
                    url: "https://example.com/",
                    status: "pending",
                    lastChecked: new Date(),
                    checkInterval: 30_000,
                    history: [],
                    monitoring: true,
                    responseTime: 0,
                    retryAttempts: 3,
                    timeout: 10_000,
                },
            ],
        };

        it("should handle manual check with valid site and monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: EnhancedMonitorChecker-coverage-fixed", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            // Mock the repository methods that are called
            mockMonitorRepository.update.mockResolvedValue(true);
            mockMonitorRepository.findByIdentifier.mockResolvedValue({
                ...mockSite.monitors[0],
                status: "up",
                lastChecked: new Date(),
                responseTime: 200,
            });
            mockHistoryRepository.create.mockResolvedValue(undefined);

            // Mock the HTTP monitor check method to return success
            const mockCheckResult = {
                details: "Check successful",
                responseTime: 200,
                status: "up" as const,
            };

            // Mock the HTTP monitor's check method directly
            (enhancedChecker as any).httpMonitor.check.mockResolvedValue(
                mockCheckResult
            );

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                true
            );

            expect(result).toBeDefined();
            expect(result?.status).toBe("up");
            expect(result?.monitorId).toBe("monitor-1");
            expect(mockMonitorRepository.update).toHaveBeenCalled();
        });

        it("should return undefined for non-existent monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: EnhancedMonitorChecker-coverage-fixed", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "non-existent-monitor",
                true
            );

            expect(result).toBeUndefined();
        });

        it("should handle monitor check failure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: EnhancedMonitorChecker-coverage-fixed", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            // Mock the repository methods that are called
            mockMonitorRepository.update.mockResolvedValue(true);
            mockMonitorRepository.findByIdentifier.mockResolvedValue({
                ...mockSite.monitors[0],
                status: "down",
                lastChecked: new Date(),
                responseTime: -1,
            });
            mockHistoryRepository.create.mockResolvedValue(undefined);

            // Mock the internal monitor check to return failure
            const mockCheckResult = {
                details: "Connection timeout",
                responseTime: -1,
                status: "down" as const,
            };

            // Mock the HTTP monitor's check method directly
            (enhancedChecker as any).httpMonitor.check.mockResolvedValue(
                mockCheckResult
            );

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                true
            );

            expect(result).toBeDefined();
            expect(result?.status).toBe("down");
        });

        it("should handle monitor check returning null result", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: EnhancedMonitorChecker-coverage-fixed", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const operationId = "op-123";
            mockOperationRegistry.initiateCheck.mockReturnValue(operationId);
            mockOperationRegistry.validateOperation.mockReturnValue(true);

            const mockMonitorService = {
                check: vi.fn().mockResolvedValue(null),
            };
            mockMonitorFactory.getMonitor.mockReturnValue(mockMonitorService);

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                true
            );

            expect(result).toBeUndefined();
        });

        it("should handle status update service throwing error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: EnhancedMonitorChecker-coverage-fixed", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const operationId = "op-123";
            mockOperationRegistry.initiateCheck.mockReturnValue(operationId);
            mockOperationRegistry.validateOperation.mockReturnValue(true);

            const mockMonitorService = {
                check: vi.fn().mockResolvedValue({
                    success: true,
                    status: "up",
                    responseTime: 200,
                }),
            };
            mockMonitorFactory.getMonitor.mockReturnValue(mockMonitorService);
            mockStatusUpdateService.updateMonitorStatus.mockRejectedValue(
                new Error("Update failed")
            );

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                true
            );

            expect(result).toBeUndefined();
        });
    });

    describe("startMonitoring Method Coverage", () => {
        it("should start monitoring successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: EnhancedMonitorChecker-coverage-fixed", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const result = await enhancedChecker.startMonitoring(
                "test-site",
                "monitor-1"
            );

            expect(result).toBe(true);
            expect(mockMonitorRepository.update).toHaveBeenCalledWith(
                "monitor-1",
                {
                    activeOperations: [],
                    monitoring: true,
                }
            );
            expect(mockOperationRegistry.cancelOperations).toHaveBeenCalledWith(
                "monitor-1"
            );
        });

        it("should handle monitor update failure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: EnhancedMonitorChecker-coverage-fixed", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockMonitorRepository.update.mockRejectedValue(
                new Error("Database error")
            );

            const result = await enhancedChecker.startMonitoring(
                "test-site",
                "monitor-1"
            );

            expect(result).toBe(false);
        });

        it("should handle successful monitoring start with event emission", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: EnhancedMonitorChecker-coverage-fixed", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const result = await enhancedChecker.startMonitoring(
                "test-site",
                "monitor-2"
            );

            expect(result).toBe(true);
            expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
                "internal:monitor:started",
                expect.objectContaining({
                    identifier: "test-site",
                    monitorId: "monitor-2",
                    operation: "started",
                })
            );
        });

        it("should handle event emission error gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: EnhancedMonitorChecker-coverage-fixed", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockEventBus.emitTyped.mockRejectedValue(
                new Error("Event emission failed")
            );

            const result = await enhancedChecker.startMonitoring(
                "test-site",
                "monitor-1"
            );

            expect(result).toBe(false);
        });
    });

    describe("stopMonitoring Method Coverage", () => {
        it("should stop monitoring and cancel operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: EnhancedMonitorChecker-coverage-fixed", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const result = await enhancedChecker.stopMonitoring(
                "test-site",
                "monitor-1"
            );

            expect(mockOperationRegistry.cancelOperations).toHaveBeenCalledWith(
                "monitor-1"
            );
            expect(mockMonitorRepository.update).toHaveBeenCalledWith(
                "monitor-1",
                {
                    activeOperations: [],
                    monitoring: false,
                }
            );
            expect(result).toBe(true);
        });

        it("should handle successful stop with event emission", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: EnhancedMonitorChecker-coverage-fixed", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Event Processing", "type");

            const result = await enhancedChecker.stopMonitoring(
                "test-site",
                "monitor-2"
            );

            expect(result).toBe(true);
            expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
                "internal:monitor:stopped",
                expect.objectContaining({
                    identifier: "test-site",
                    monitorId: "monitor-2",
                    operation: "stopped",
                    reason: "user",
                })
            );
        });

        it("should handle stop monitoring errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: EnhancedMonitorChecker-coverage-fixed", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockMonitorRepository.update.mockRejectedValue(
                new Error("Database update failed")
            );

            const result = await enhancedChecker.stopMonitoring(
                "test-site",
                "monitor-1"
            );

            expect(result).toBe(false);
        });
    });

    describe("Operation Registry Integration", () => {
        it("should cover operation registry cancellation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: EnhancedMonitorChecker-coverage-fixed", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = await enhancedChecker.startMonitoring(
                "test-site",
                "monitor-3"
            );

            expect(mockOperationRegistry.cancelOperations).toHaveBeenCalledWith(
                "monitor-3"
            );
            expect(result).toBe(true);
        });

        it("should cover repository integration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: EnhancedMonitorChecker-coverage-fixed", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = await enhancedChecker.stopMonitoring(
                "test-site",
                "monitor-1"
            );

            expect(mockMonitorRepository.update).toHaveBeenCalledWith(
                "monitor-1",
                {
                    activeOperations: [],
                    monitoring: false,
                }
            );
            expect(result).toBe(true);
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle operation validation failure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: EnhancedMonitorChecker-coverage-fixed", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const operationId = "op-123";
            mockOperationRegistry.initiateCheck.mockReturnValue(operationId);
            mockOperationRegistry.validateOperation.mockReturnValue(false);

            const mockSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com/",
                        status: "pending",
                        lastChecked: new Date(),
                        checkInterval: 30_000,
                        history: [],
                        monitoring: true,
                        responseTime: 0,
                        retryAttempts: 3,
                        timeout: 10_000,
                    },
                ],
            };

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                false
            );

            expect(result).toBeUndefined();
        });

        it("should handle monitor factory returning null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: EnhancedMonitorChecker-coverage-fixed", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const operationId = "op-123";
            mockOperationRegistry.initiateCheck.mockReturnValue(operationId);
            mockOperationRegistry.validateOperation.mockReturnValue(true);
            mockMonitorFactory.getMonitor.mockReturnValue(null);

            const mockSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com/",
                        status: "pending",
                        lastChecked: new Date(),
                        checkInterval: 30_000,
                        history: [],
                        monitoring: true,
                        responseTime: 0,
                        retryAttempts: 3,
                        timeout: 10_000,
                    },
                ],
            };

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                true
            );

            expect(result).toBeUndefined();
        });
    });
});
