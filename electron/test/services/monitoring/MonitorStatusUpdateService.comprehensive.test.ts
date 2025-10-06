/**
 * Comprehensive test coverage for MonitorStatusUpdateService Target: Increase
 * coverage from 6.66% to 95%+
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Monitor, Site } from "../../../../shared/types";
import {
    MonitorStatusUpdateService,
    type StatusUpdateMonitorCheckResult,
} from "../../../services/monitoring/MonitorStatusUpdateService";

// Mock external dependencies
vi.mock("../../../utils/logger", () => {
    const createLoggerMock = () => ({
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    });

    return {
        monitorLogger: createLoggerMock(),
        logger: createLoggerMock(),
        diagnosticsLogger: createLoggerMock(),
    };
});

vi.mock("../../../../shared/utils/logTemplates", () => ({
    interpolateLogTemplate: vi.fn(
        (template: string, params: Record<string, string>) =>
            `${template}: ${JSON.stringify(params)}`
    ),
    LOG_TEMPLATES: {
        warnings: {
            MONITOR_NOT_FOUND_CACHE: "MONITOR_NOT_FOUND_CACHE",
            MONITOR_NOT_MONITORING: "MONITOR_NOT_MONITORING",
            MONITOR_FRESH_DATA_MISSING: "MONITOR_FRESH_DATA_MISSING",
        },
    },
}));

// Helper functions to create test data
function createTestMonitor(overrides: Partial<Monitor> = {}): Monitor {
    return {
        id: "test-monitor-1",
        type: "http",
        host: "example.com",
        monitoring: true,
        status: "up",
        responseTime: 150,
        history: [],
        checkInterval: 60_000,
        retryAttempts: 3,
        timeout: 5000,
        activeOperations: ["op-123"],
        ...overrides,
    };
}

function createTestSite(overrides: Partial<Site> = {}): Site {
    return {
        identifier: "test-site-1",
        name: "Test Site",
        monitoring: true,
        monitors: [createTestMonitor()],
        ...overrides,
    };
}

function createTestResult(
    overrides: Partial<StatusUpdateMonitorCheckResult> = {}
): StatusUpdateMonitorCheckResult {
    return {
        monitorId: "test-monitor-1",
        operationId: "op-123",
        status: "up",
        responseTime: 200,
        timestamp: new Date(),
        details: "Check completed successfully",
        ...overrides,
    };
}

describe(MonitorStatusUpdateService, () => {
    let service: MonitorStatusUpdateService;
    let mockOperationRegistry: any;
    let mockMonitorRepository: any;
    let mockSitesCache: any;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Create fresh mock objects for each test
        mockOperationRegistry = {
            validateOperation: vi.fn(),
            completeOperation: vi.fn(),
        };

        mockMonitorRepository = {
            findByIdentifier: vi.fn(),
            update: vi.fn(),
        };

        mockSitesCache = {
            getAll: vi.fn(),
            set: vi.fn(),
            get: vi.fn(),
        };

        service = new MonitorStatusUpdateService(
            mockOperationRegistry,
            mockMonitorRepository,
            mockSitesCache
        );
    });

    describe("Constructor", () => {
        it("should create instance with all required dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitorStatusUpdateService",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(service).toBeInstanceOf(MonitorStatusUpdateService);
        });
    });

    describe("updateMonitorStatus", () => {
        it("should successfully update monitor status when operation is valid", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitorStatusUpdateService",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Data Update", "type");

            // Arrange
            const testMonitor = createTestMonitor();
            const testResult = createTestResult();
            const expectedUpdates = {
                lastChecked: testResult.timestamp,
                responseTime: testResult.responseTime,
                status: "up" as const,
                activeOperations: [], // Should remove the operation
            };

            mockOperationRegistry.validateOperation.mockReturnValue(true);
            mockMonitorRepository.findByIdentifier.mockResolvedValue(
                testMonitor
            );
            mockMonitorRepository.update.mockResolvedValue(undefined);
            mockSitesCache.getAll.mockReturnValue([createTestSite()]);
            mockMonitorRepository.findByIdentifier
                .mockResolvedValueOnce(testMonitor) // First call for status update
                .mockResolvedValueOnce(testMonitor); // Second call for cache refresh

            // Act
            const result = await service.updateMonitorStatus(testResult);

            // Assert
            expect(result).toBeTruthy();
            expect(
                mockOperationRegistry.validateOperation
            ).toHaveBeenCalledWith("op-123");
            expect(mockMonitorRepository.findByIdentifier).toHaveBeenCalledWith(
                "test-monitor-1"
            );
            expect(mockMonitorRepository.update).toHaveBeenCalledWith(
                "test-monitor-1",
                expectedUpdates
            );
            expect(
                mockOperationRegistry.completeOperation
            ).toHaveBeenCalledWith("op-123");
        });

        it("should return false when operation is invalid", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitorStatusUpdateService",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const testResult = createTestResult();
            mockOperationRegistry.validateOperation.mockReturnValue(false);

            // Act
            const result = await service.updateMonitorStatus(testResult);

            // Assert
            expect(result).toBeFalsy();
            expect(
                mockOperationRegistry.validateOperation
            ).toHaveBeenCalledWith("op-123");
            expect(
                mockMonitorRepository.findByIdentifier
            ).not.toHaveBeenCalled();
        });

        it("should return false when monitor is not found", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitorStatusUpdateService",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            // Arrange
            const testResult = createTestResult();
            mockOperationRegistry.validateOperation.mockReturnValue(true);
            mockMonitorRepository.findByIdentifier.mockResolvedValue(undefined);

            // Act
            const result = await service.updateMonitorStatus(testResult);

            // Assert
            expect(result).toBeFalsy();
            expect(
                mockOperationRegistry.completeOperation
            ).toHaveBeenCalledWith("op-123");
        });

        it("should return false when monitor is not actively monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitorStatusUpdateService",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            // Arrange
            const testMonitor = createTestMonitor({ monitoring: false });
            const testResult = createTestResult();
            mockOperationRegistry.validateOperation.mockReturnValue(true);
            mockMonitorRepository.findByIdentifier.mockResolvedValue(
                testMonitor
            );

            // Act
            const result = await service.updateMonitorStatus(testResult);

            // Assert
            expect(result).toBeFalsy();
            expect(
                mockOperationRegistry.completeOperation
            ).toHaveBeenCalledWith("op-123");
        });

        it("should handle 'down' status correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitorStatusUpdateService",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const testMonitor = createTestMonitor();
            const testResult = createTestResult({ status: "down" });
            const expectedUpdates = {
                lastChecked: testResult.timestamp,
                responseTime: testResult.responseTime,
                status: "down" as const,
                activeOperations: [],
            };

            mockOperationRegistry.validateOperation.mockReturnValue(true);
            mockMonitorRepository.findByIdentifier.mockResolvedValue(
                testMonitor
            );
            mockMonitorRepository.update.mockResolvedValue(undefined);
            mockSitesCache.getAll.mockReturnValue([createTestSite()]);

            // Act
            const result = await service.updateMonitorStatus(testResult);

            // Assert
            expect(result).toBeTruthy();
            expect(mockMonitorRepository.update).toHaveBeenCalledWith(
                "test-monitor-1",
                expectedUpdates
            );
        });

        it("should handle monitor with no active operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitorStatusUpdateService",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            // Arrange
            const testMonitor = createTestMonitor({
                activeOperations: [],
            });
            const testResult = createTestResult();
            const expectedUpdates = {
                lastChecked: testResult.timestamp,
                responseTime: testResult.responseTime,
                status: "up" as const,
                activeOperations: [],
            };

            mockOperationRegistry.validateOperation.mockReturnValue(true);
            mockMonitorRepository.findByIdentifier.mockResolvedValue(
                testMonitor
            );
            mockMonitorRepository.update.mockResolvedValue(undefined);
            mockSitesCache.getAll.mockReturnValue([createTestSite()]);

            // Act
            const result = await service.updateMonitorStatus(testResult);

            // Assert
            expect(result).toBeTruthy();
            expect(mockMonitorRepository.update).toHaveBeenCalledWith(
                "test-monitor-1",
                expectedUpdates
            );
        });

        it("should handle database errors gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitorStatusUpdateService",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            const testMonitor = createTestMonitor();
            const testResult = createTestResult();
            const dbError = new Error("Database connection failed");

            mockOperationRegistry.validateOperation.mockReturnValue(true);
            mockMonitorRepository.findByIdentifier.mockResolvedValue(
                testMonitor
            );
            mockMonitorRepository.update.mockRejectedValue(dbError);

            // Act
            const result = await service.updateMonitorStatus(testResult);

            // Assert
            expect(result).toBeFalsy();
            expect(
                mockOperationRegistry.completeOperation
            ).toHaveBeenCalledWith("op-123");
        });

        it("should handle site not found in cache", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitorStatusUpdateService",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Caching", "type");

            // Arrange
            const testMonitor = createTestMonitor();
            const testResult = createTestResult();

            mockOperationRegistry.validateOperation.mockReturnValue(true);
            mockMonitorRepository.findByIdentifier.mockResolvedValue(
                testMonitor
            );
            mockMonitorRepository.update.mockResolvedValue(undefined);
            mockSitesCache.getAll.mockReturnValue([]); // No sites in cache

            // Act
            const result = await service.updateMonitorStatus(testResult);

            // Assert
            expect(result).toBeTruthy(); // Should still complete successfully
            expect(mockSitesCache.set).not.toHaveBeenCalled();
        });

        it("should handle cache refresh errors gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitorStatusUpdateService",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            const testMonitor = createTestMonitor();
            const testSite = createTestSite();
            const testResult = createTestResult();
            const cacheError = new Error("Cache operation failed");

            mockOperationRegistry.validateOperation.mockReturnValue(true);
            mockMonitorRepository.findByIdentifier.mockResolvedValue(
                testMonitor
            );
            mockMonitorRepository.update.mockResolvedValue(undefined);
            mockSitesCache.getAll.mockReturnValue([testSite]);
            mockSitesCache.set.mockImplementation(() => {
                throw cacheError;
            });

            // Act
            const result = await service.updateMonitorStatus(testResult);

            // Assert
            expect(result).toBeTruthy(); // Should still complete successfully despite cache error
        });
    });

    describe("StatusUpdateMonitorCheckResult interface", () => {
        it("should support all required fields", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitorStatusUpdateService",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result: StatusUpdateMonitorCheckResult = {
                monitorId: "test-monitor",
                operationId: "test-operation",
                status: "up",
                responseTime: 100,
                timestamp: new Date(),
            };

            expect(result.monitorId).toBe("test-monitor");
            expect(result.operationId).toBe("test-operation");
            expect(result.status).toBe("up");
            expect(result.responseTime).toBe(100);
            expect(result.timestamp).toBeInstanceOf(Date);
        });

        it("should support optional fields", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: MonitorStatusUpdateService",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result: StatusUpdateMonitorCheckResult = {
                monitorId: "test-monitor",
                operationId: "test-operation",
                status: "down",
                responseTime: 500,
                timestamp: new Date(),
                details: "Connection timeout",
                error: "TIMEOUT_ERROR",
            };

            expect(result.details).toBe("Connection timeout");
            expect(result.error).toBe("TIMEOUT_ERROR");
        });
    });
});
