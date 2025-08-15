/**
 * Comprehensive tests for MonitorOperationRegistry.
 *
 * @remarks
 * Tests monitor operation lifecycle management, tracking, cancellation, and
 * correlation functionality.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
    MonitorOperationRegistry,
    operationRegistry,
    type MonitorCheckOperation,
    type MonitorCheckResult,
} from "../../../services/monitoring/MonitorOperationRegistry";
import { monitorLogger as logger } from "../../../utils/logger";

// Mock the logger
vi.mock("../../../utils/logger", () => ({
    monitorLogger: {
        debug: vi.fn(),
    },
}));

// Mock crypto.randomUUID for predictable test results
const mockUUIDCounter = { value: 0 };
const mockRandomUUID = vi.fn(() => {
    mockUUIDCounter.value++;
    return `test-uuid-${mockUUIDCounter.value}`;
});

vi.stubGlobal("crypto", {
    randomUUID: mockRandomUUID,
});

describe("MonitorOperationRegistry", () => {
    let registry: MonitorOperationRegistry;
    const mockMonitorId = "monitor-123";

    beforeEach(() => {
        vi.clearAllMocks();
        mockUUIDCounter.value = 0; // Reset counter for each test
        registry = new MonitorOperationRegistry();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("initiateCheck", () => {
        it("should create and register a new operation", () => {
            const operationId = registry.initiateCheck(mockMonitorId);

            expect(operationId).toBe("test-uuid-1");
            expect(mockRandomUUID).toHaveBeenCalledOnce();
            expect(logger.debug).toHaveBeenCalledWith(
                `Initiated operation test-uuid-1 for monitor ${mockMonitorId}`
            );

            const operation = registry.getOperation(operationId);
            expect(operation).toBeDefined();
            expect(operation?.id).toBe(operationId);
            expect(operation?.monitorId).toBe(mockMonitorId);
            expect(operation?.cancelled).toBe(false);
            expect(operation?.initiatedAt).toBeInstanceOf(Date);
        });

        it("should generate unique operation IDs for multiple operations", () => {
            const operationId1 = registry.initiateCheck(mockMonitorId);
            const operationId2 = registry.initiateCheck("monitor-456");

            expect(operationId1).toBe("test-uuid-1");
            expect(operationId2).toBe("test-uuid-2");
            expect(operationId1).not.toBe(operationId2);

            expect(registry.getOperation(operationId1)).toBeDefined();
            expect(registry.getOperation(operationId2)).toBeDefined();
        });

        it("should handle UUID collision by retrying", () => {
            // Mock to simulate collision on first attempt
            mockRandomUUID
                .mockReturnValueOnce("collision-uuid") // First call - will collide
                .mockReturnValueOnce("collision-uuid") // Second call - simulate another collision
                .mockReturnValueOnce("unique-uuid"); // Third call - success

            // Manually add an operation with the "collision" UUID
            const existingOperation: MonitorCheckOperation = {
                id: "collision-uuid",
                monitorId: "existing-monitor",
                cancelled: false,
                initiatedAt: new Date(),
            };
            registry
                .getActiveOperations()
                .set("collision-uuid", existingOperation);

            const operationId = registry.initiateCheck(mockMonitorId);

            expect(operationId).toBe("unique-uuid");
            expect(mockRandomUUID).toHaveBeenCalledTimes(3);
            expect(registry.getOperation(operationId)).toBeDefined();
        });

        it("should throw error after multiple failed UUID generation attempts", () => {
            // Mock to always return the same UUID (collision every time)
            mockRandomUUID.mockReturnValue("always-collision");

            // Manually add an operation with the collision UUID
            const existingOperation: MonitorCheckOperation = {
                id: "always-collision",
                monitorId: "existing-monitor",
                cancelled: false,
                initiatedAt: new Date(),
            };
            registry
                .getActiveOperations()
                .set("always-collision", existingOperation);

            expect(() => registry.initiateCheck(mockMonitorId)).toThrow(
                "Failed to generate a unique operation ID after multiple attempts."
            );

            expect(mockRandomUUID).toHaveBeenCalledTimes(5); // Should try 5 times
        });

        it("should handle empty monitor ID", () => {
            const operationId = registry.initiateCheck("");

            expect(operationId).toBe("test-uuid-1");

            const operation = registry.getOperation(operationId);
            expect(operation?.monitorId).toBe("");
        });

        it("should set accurate timestamps", () => {
            const beforeTime = new Date();
            const operationId = registry.initiateCheck(mockMonitorId);
            const afterTime = new Date();

            const operation = registry.getOperation(operationId);
            expect(operation?.initiatedAt).toBeDefined();
            expect(operation!.initiatedAt.getTime()).toBeGreaterThanOrEqual(
                beforeTime.getTime()
            );
            expect(operation!.initiatedAt.getTime()).toBeLessThanOrEqual(
                afterTime.getTime()
            );
        });
    });

    describe("getOperation", () => {
        it("should return operation when it exists", () => {
            const operationId = registry.initiateCheck(mockMonitorId);

            const operation = registry.getOperation(operationId);

            expect(operation).toBeDefined();
            expect(operation?.id).toBe(operationId);
            expect(operation?.monitorId).toBe(mockMonitorId);
        });

        it("should return undefined when operation does not exist", () => {
            const operation = registry.getOperation("non-existent-id");

            expect(operation).toBeUndefined();
        });

        it("should return undefined for empty operation ID", () => {
            const operation = registry.getOperation("");

            expect(operation).toBeUndefined();
        });
    });

    describe("validateOperation", () => {
        it("should return true for active, non-cancelled operation", () => {
            const operationId = registry.initiateCheck(mockMonitorId);

            const isValid = registry.validateOperation(operationId);

            expect(isValid).toBe(true);
        });

        it("should return false for non-existent operation", () => {
            const isValid = registry.validateOperation("non-existent-id");

            expect(isValid).toBe(false);
        });

        it("should return false for cancelled operation", () => {
            const operationId = registry.initiateCheck(mockMonitorId);

            // Cancel the operation
            registry.cancelOperations(mockMonitorId);

            const isValid = registry.validateOperation(operationId);

            expect(isValid).toBe(false);
        });

        it("should return false for empty operation ID", () => {
            const isValid = registry.validateOperation("");

            expect(isValid).toBe(false);
        });
    });

    describe("cancelOperations", () => {
        it("should cancel all operations for a specific monitor", () => {
            const operationId1 = registry.initiateCheck(mockMonitorId);
            const operationId2 = registry.initiateCheck(mockMonitorId);
            const operationId3 = registry.initiateCheck("other-monitor");

            registry.cancelOperations(mockMonitorId);

            // Operations for target monitor should be cancelled
            expect(registry.getOperation(operationId1)?.cancelled).toBe(true);
            expect(registry.getOperation(operationId2)?.cancelled).toBe(true);

            // Operation for other monitor should not be affected
            expect(registry.getOperation(operationId3)?.cancelled).toBe(false);

            // Should log the cancellation
            expect(logger.debug).toHaveBeenCalledWith(
                "Cancelled 2 operations for monitor monitor-123"
            );
        });

        it("should not log when no operations to cancel", () => {
            // Clear any previous debug calls
            vi.clearAllMocks();

            registry.cancelOperations(mockMonitorId);

            // Should not log when no operations are cancelled
            expect(logger.debug).not.toHaveBeenCalled();
        });

        it("should handle empty monitor ID", () => {
            const operationId = registry.initiateCheck("");

            registry.cancelOperations("");

            expect(registry.getOperation(operationId)?.cancelled).toBe(true);
        });

        it("should cancel only one operation when only one exists", () => {
            const operationId = registry.initiateCheck(mockMonitorId);

            registry.cancelOperations(mockMonitorId);

            expect(registry.getOperation(operationId)?.cancelled).toBe(true);
            expect(logger.debug).toHaveBeenCalledWith(
                "Cancelled 1 operations for monitor monitor-123"
            );
        });

        it("should not affect operations after they are cancelled", () => {
            const operationId = registry.initiateCheck(mockMonitorId);

            registry.cancelOperations(mockMonitorId);
            expect(registry.validateOperation(operationId)).toBe(false);

            // Cancelling again should not change anything
            registry.cancelOperations(mockMonitorId);
            expect(registry.validateOperation(operationId)).toBe(false);
        });
    });

    describe("completeOperation", () => {
        it("should remove operation from registry when completed", () => {
            const operationId = registry.initiateCheck(mockMonitorId);

            // Verify operation exists
            expect(registry.getOperation(operationId)).toBeDefined();

            registry.completeOperation(operationId);

            // Operation should be removed
            expect(registry.getOperation(operationId)).toBeUndefined();
            expect(logger.debug).toHaveBeenCalledWith(
                "Completed operation test-uuid-1 for monitor monitor-123"
            );
        });

        it("should not log or error when completing non-existent operation", () => {
            // Clear any previous debug calls
            vi.clearAllMocks();

            registry.completeOperation("non-existent-id");

            // Should not log anything
            expect(logger.debug).not.toHaveBeenCalled();
        });

        it("should handle empty operation ID", () => {
            // Clear any previous debug calls
            vi.clearAllMocks();

            registry.completeOperation("");

            // Should not log anything
            expect(logger.debug).not.toHaveBeenCalled();
        });

        it("should complete operation even if it was cancelled", () => {
            const operationId = registry.initiateCheck(mockMonitorId);

            // Cancel then complete
            registry.cancelOperations(mockMonitorId);
            registry.completeOperation(operationId);

            // Operation should be removed
            expect(registry.getOperation(operationId)).toBeUndefined();
        });
    });

    describe("getActiveOperations", () => {
        it("should return empty map when no operations exist", () => {
            const activeOps = registry.getActiveOperations();

            expect(activeOps).toBeInstanceOf(Map);
            expect(activeOps.size).toBe(0);
        });

        it("should return all active operations", () => {
            const operationId1 = registry.initiateCheck(mockMonitorId);
            const operationId2 = registry.initiateCheck("monitor-456");

            const activeOps = registry.getActiveOperations();

            expect(activeOps.size).toBe(2);
            expect(activeOps.has(operationId1)).toBe(true);
            expect(activeOps.has(operationId2)).toBe(true);
            expect(activeOps.get(operationId1)?.monitorId).toBe(mockMonitorId);
            expect(activeOps.get(operationId2)?.monitorId).toBe("monitor-456");
        });

        it("should return reference to actual internal map", () => {
            const operationId = registry.initiateCheck(mockMonitorId);

            const activeOps1 = registry.getActiveOperations();
            const activeOps2 = registry.getActiveOperations();

            // Should be the same reference
            expect(activeOps1).toBe(activeOps2);
            expect(activeOps1.has(operationId)).toBe(true);
        });

        it("should reflect changes when operations are completed", () => {
            const operationId = registry.initiateCheck(mockMonitorId);

            let activeOps = registry.getActiveOperations();
            expect(activeOps.size).toBe(1);

            registry.completeOperation(operationId);

            activeOps = registry.getActiveOperations();
            expect(activeOps.size).toBe(0);
        });

        it("should include cancelled operations until they are completed", () => {
            const operationId = registry.initiateCheck(mockMonitorId);

            registry.cancelOperations(mockMonitorId);

            const activeOps = registry.getActiveOperations();
            expect(activeOps.size).toBe(1);
            expect(activeOps.get(operationId)?.cancelled).toBe(true);
        });
    });

    describe("Integration scenarios", () => {
        it("should handle complete operation lifecycle", () => {
            // Initiate multiple operations
            const op1 = registry.initiateCheck("monitor-1");
            const op2 = registry.initiateCheck("monitor-2");
            const op3 = registry.initiateCheck("monitor-1");

            // Verify all are active
            expect(registry.validateOperation(op1)).toBe(true);
            expect(registry.validateOperation(op2)).toBe(true);
            expect(registry.validateOperation(op3)).toBe(true);
            expect(registry.getActiveOperations().size).toBe(3);

            // Cancel operations for monitor-1
            registry.cancelOperations("monitor-1");

            // Only monitor-2 operation should still be valid
            expect(registry.validateOperation(op1)).toBe(false);
            expect(registry.validateOperation(op2)).toBe(true);
            expect(registry.validateOperation(op3)).toBe(false);

            // Complete all operations
            registry.completeOperation(op1);
            registry.completeOperation(op2);
            registry.completeOperation(op3);

            // All should be removed
            expect(registry.getActiveOperations().size).toBe(0);
        });

        it("should handle multiple monitors with multiple operations", () => {
            const monitors = ["monitor-1", "monitor-2", "monitor-3"];
            const operations: string[] = [];

            // Create 2 operations for each monitor
            for (const monitorId of monitors) {
                operations.push(
                    registry.initiateCheck(monitorId),
                    registry.initiateCheck(monitorId)
                );
            }

            expect(registry.getActiveOperations().size).toBe(6);

            // Cancel operations for monitor-2
            registry.cancelOperations("monitor-2");

            // Verify correct operations are cancelled
            const activeOps = registry.getActiveOperations();
            let cancelledCount = 0;
            let activeCount = 0;

            for (const [, operation] of activeOps) {
                if (operation.cancelled) {
                    cancelledCount++;
                    expect(operation.monitorId).toBe("monitor-2");
                } else {
                    activeCount++;
                    expect(operation.monitorId).not.toBe("monitor-2");
                }
            }

            expect(cancelledCount).toBe(2);
            expect(activeCount).toBe(4);
        });

        it("should maintain operation state consistency", () => {
            const operationId = registry.initiateCheck(mockMonitorId);

            // Get operation reference
            const operation = registry.getOperation(operationId);
            expect(operation).toBeDefined();

            const originalInitiatedAt = operation!.initiatedAt;
            const originalId = operation!.id;

            // Cancel operation
            registry.cancelOperations(mockMonitorId);

            // Same reference should now be cancelled
            expect(operation!.cancelled).toBe(true);
            expect(operation!.id).toBe(originalId);
            expect(operation!.initiatedAt).toBe(originalInitiatedAt);
            expect(operation!.monitorId).toBe(mockMonitorId);
        });
    });

    describe("Singleton operationRegistry", () => {
        it("should export a singleton instance", () => {
            expect(operationRegistry).toBeInstanceOf(MonitorOperationRegistry);
        });

        it("should be the same instance across imports", () => {
            // This test ensures the singleton pattern works
            const operationId = operationRegistry.initiateCheck("test-monitor");

            expect(operationRegistry.getOperation(operationId)).toBeDefined();
            expect(operationRegistry.validateOperation(operationId)).toBe(true);

            // Clean up
            operationRegistry.completeOperation(operationId);
        });
    });

    describe("Type definitions", () => {
        it("should create MonitorCheckOperation with correct structure", () => {
            const operationId = registry.initiateCheck(mockMonitorId);
            const operation = registry.getOperation(operationId);

            expect(operation).toMatchObject({
                id: expect.any(String),
                monitorId: expect.any(String),
                cancelled: expect.any(Boolean),
                initiatedAt: expect.any(Date),
            });
        });

        it("should work with MonitorCheckResult interface", () => {
            const operationId = registry.initiateCheck(mockMonitorId);

            // Simulate creating a result that would link to this operation
            const result: MonitorCheckResult = {
                monitorId: mockMonitorId,
                operationId: operationId,
                status: "up",
                responseTime: 150,
                timestamp: new Date(),
            };

            expect(result.operationId).toBe(operationId);
            expect(registry.validateOperation(result.operationId)).toBe(true);
        });
    });
});
