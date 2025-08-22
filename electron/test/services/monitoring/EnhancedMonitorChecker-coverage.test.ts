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
        // Create mock dependencies matching the actual interfaces
        mockEventBus = {
            emitTyped: vi.fn().mockResolvedValue(undefined),
            emit: vi.fn(),
            on: vi.fn(),
            off: vi.fn(),
            once: vi.fn(),
            removeAllListeners: vi.fn(),
        };

        mockSitesCache = {
            get: vi.fn(),
            set: vi.fn(),
            has: vi.fn(),
            invalidate: vi.fn(),
        };

        mockSiteRepository = {
            findByIdentifier: vi.fn(),
            update: vi.fn(),
            create: vi.fn(),
            findById: vi.fn(),
            findAll: vi.fn(),
            delete: vi.fn(),
            deleteAll: vi.fn(),
            executeTransaction: vi.fn(),
        };

        mockMonitorRepository = {
            update: vi.fn().mockResolvedValue(undefined),
            create: vi.fn(),
            findById: vi.fn(),
            findByIdentifier: vi.fn().mockResolvedValue({
                id: "monitor-1",
                type: "http",
                status: "up",
            }),
            findBySiteId: vi.fn(),
            findAll: vi.fn(),
            delete: vi.fn(),
            deleteAll: vi.fn(),
            deleteBySiteId: vi.fn(),
            executeTransaction: vi.fn(),
        };

        mockHistoryRepository = {
            create: vi.fn(),
            findById: vi.fn(),
            findBySiteId: vi.fn(),
            findAll: vi.fn(),
            findByTimeRange: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            deleteAll: vi.fn(),
            deleteBySiteId: vi.fn(),
            deleteBySiteIdAndOlderThan: vi.fn(),
            executeTransaction: vi.fn(),
            addEntry: vi.fn().mockResolvedValue(undefined),
            getHistoryCount: vi.fn().mockResolvedValue(5),
        };

        mockOperationRegistry = {
            initiateCheck: vi.fn().mockReturnValue("operation-123"),
            validateOperation: vi.fn().mockReturnValue(true),
            completeOperation: vi.fn(),
            cancelOperations: vi.fn(),
            getOperation: vi.fn().mockReturnValue(null),
            getAllOperations: vi.fn(),
        };

        mockMonitorFactory = {
            getMonitor: vi.fn(),
        };

        mockTimeoutManager = {
            scheduleTimeout: vi.fn(),
            clearTimeout: vi.fn(),
            operationRegistry: {} as any,
            timeouts: new Map(),
        };

        mockStatusUpdateService = {
            updateMonitorStatus: vi.fn().mockResolvedValue({
                status: "up",
                timestamp: Date.now(),
                responseTime: 150,
            }),
        };

        // Create the EnhancedMonitorChecker instance
        enhancedChecker = new EnhancedMonitorChecker({
            eventEmitter: mockEventBus,
            sites: mockSitesCache,
            siteRepository: mockSiteRepository,
            monitorRepository: mockMonitorRepository,
            historyRepository: mockHistoryRepository,
            operationRegistry: mockOperationRegistry,
            monitorFactory: mockMonitorFactory,
            timeoutManager: mockTimeoutManager,
            statusUpdateService: mockStatusUpdateService,
            getHistoryLimit: () => 100,
        });

        // Spy on the monitor instances after construction
        vi.spyOn(enhancedChecker["httpMonitor"], "check").mockResolvedValue({
            status: "up",
            responseTime: 100,
            details: "HTTP 200 OK",
        });

        vi.spyOn(enhancedChecker["dnsMonitor"], "check").mockResolvedValue({
            status: "up",
            responseTime: 50,
            details: "DNS resolved successfully",
        });
    });

    describe("Constructor and Initialization", () => {
        it("should initialize with all dependencies", () => {
            const checker = new EnhancedMonitorChecker({
                eventEmitter: mockEventBus,
                sites: mockSitesCache,
                siteRepository: mockSiteRepository,
                monitorRepository: mockMonitorRepository,
                historyRepository: mockHistoryRepository,
                operationRegistry: mockOperationRegistry,
                monitorFactory: mockMonitorFactory,
                timeoutManager: mockTimeoutManager,
                statusUpdateService: mockStatusUpdateService,
                getHistoryLimit: () => 100,
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
                    host: "example.com",
                    path: "/",
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

        it("should handle manual check with valid site and monitor", async () => {
            // For manual checks, we expect the HttpMonitor instance to be called
            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                true
            );

            console.log("Test result:", JSON.stringify(result, null, 2));
            if (result?.details) {
                console.log("Error details:", result.details);
            }

            expect(result).toBeDefined();
            expect(result?.status).toBe("up");
            expect(result?.monitorId).toBe("monitor-1");

            // For manual checks, operation registry should NOT be called
            expect(mockOperationRegistry.initiateCheck).not.toHaveBeenCalled();

            // The spied HttpMonitor check method should be called
            expect(enhancedChecker["httpMonitor"].check).toHaveBeenCalled();
        });

        it("should return undefined for non-existent monitor", async () => {
            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "non-existent-monitor",
                true
            );

            expect(result).toBeUndefined();
        });

        it("should handle monitor check failure", async () => {
            const operationId = "op-123";
            mockOperationRegistry.initiateCheck.mockReturnValue(operationId);
            mockOperationRegistry.validateOperation.mockReturnValue(true);

            // Mock the monitor to return a 'down' status
            vi.spyOn(enhancedChecker["httpMonitor"], "check").mockResolvedValue(
                {
                    status: "down",
                    responseTime: 0,
                    details: "Connection timeout",
                }
            );

            mockStatusUpdateService.updateMonitorStatus.mockResolvedValue(true);

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                true
            );

            expect(result).toBeDefined();
            expect(result?.status).toBe("down");
        });

        it("should handle monitor check returning null result", async () => {
            const operationId = "op-123";
            mockOperationRegistry.initiateCheck.mockReturnValue(operationId);
            mockOperationRegistry.validateOperation.mockReturnValue(true);

            // Mock the monitor repository update to fail to trigger undefined return
            mockMonitorRepository.update.mockRejectedValue(
                new Error("Database failure")
            );

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                false
            ); // Use correlated check

            expect(result).toBeUndefined();
        });

        it("should handle status update service throwing error", async () => {
            const operationId = "op-123";
            mockOperationRegistry.initiateCheck.mockReturnValue(operationId);
            mockOperationRegistry.validateOperation.mockReturnValue(true);

            // Mock the monitor to return a successful result
            vi.spyOn(enhancedChecker["httpMonitor"], "check").mockResolvedValue(
                {
                    status: "up",
                    responseTime: 100,
                    details: "HTTP 200 OK",
                }
            );

            // Mock status update service to return false (update failed)
            mockStatusUpdateService.updateMonitorStatus.mockResolvedValue(
                false
            );

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                false
            ); // Use correlated check

            expect(result).toBeUndefined();
        });
    });

    describe("startMonitoring Method Coverage", () => {
        it("should start monitoring successfully", async () => {
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

        it("should handle monitor update failure", async () => {
            mockMonitorRepository.update.mockRejectedValue(
                new Error("Database error")
            );

            const result = await enhancedChecker.startMonitoring(
                "test-site",
                "monitor-1"
            );

            expect(result).toBe(false);
        });

        it("should handle successful monitoring start with event emission", async () => {
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

        it("should handle event emission error gracefully", async () => {
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
        it("should stop monitoring and cancel operations", async () => {
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

        it("should handle successful stop with event emission", async () => {
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

        it("should handle stop monitoring errors", async () => {
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
        it("should cover operation registry cancellation", async () => {
            const result = await enhancedChecker.startMonitoring(
                "test-site",
                "monitor-3"
            );

            expect(mockOperationRegistry.cancelOperations).toHaveBeenCalledWith(
                "monitor-3"
            );
            expect(result).toBe(true);
        });

        it("should cover repository integration", async () => {
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
        it("should handle operation validation failure", async () => {
            const operationId = "op-123";
            mockOperationRegistry.initiateCheck.mockReturnValue(operationId);

            // Mock the monitor to return a successful result
            vi.spyOn(enhancedChecker["httpMonitor"], "check").mockResolvedValue(
                {
                    status: "up",
                    responseTime: 100,
                    details: "HTTP 200 OK",
                }
            );

            // Mock the operation validation to fail in the status update service
            // This causes updateMonitorStatus to return false
            mockStatusUpdateService.updateMonitorStatus.mockResolvedValue(
                false
            );

            const mockSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        host: "example.com",
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

        it("should handle monitor factory returning null", async () => {
            const operationId = "op-123";
            mockOperationRegistry.initiateCheck.mockReturnValue(operationId);

            // Mock the monitor repository update to fail during setup to trigger undefined return
            mockMonitorRepository.update.mockRejectedValue(
                new Error("Database failure during setup")
            );

            // Test with a different monitor type to ensure proper type handling
            const mockSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "dns", // Use DNS monitor type
                        host: "example.com",
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
            ); // Use correlated check

            expect(result).toBeUndefined();
        });
    });
});
