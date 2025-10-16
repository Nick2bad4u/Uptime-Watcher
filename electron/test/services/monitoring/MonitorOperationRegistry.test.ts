/**
 * Comprehensive tests for MonitorOperationRegistry with AbortController.
 *
 * @remarks
 * Tests monitor operation lifecycle management, tracking, cancellation, and
 * correlation functionality using AbortController.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
    MonitorOperationRegistry,
    type MonitorCheckOperation,
    type MonitorCheckResult,
} from "../../../services/monitoring/MonitorOperationRegistry";
import { monitorLogger as logger } from "../../../utils/logger";

// Mock the logger
vi.mock("../../../utils/logger", () => {
    const createLoggerMock = () => ({
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    });

    return {
        monitorLogger: {
            debug: vi.fn(),
        },
        logger: createLoggerMock(),
        diagnosticsLogger: createLoggerMock(),
    };
});

// Mock crypto.randomUUID for predictable test results
const mockUUIDCounter = { value: 0 };
const mockRandomUUID = vi.fn(() => {
    mockUUIDCounter.value++;
    return `test-uuid-${mockUUIDCounter.value}`;
});

vi.stubGlobal("crypto", {
    randomUUID: mockRandomUUID,
});

describe(MonitorOperationRegistry, () => {
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
        it("should create and register a new operation with AbortController", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const result = registry.initiateCheck(mockMonitorId);

            expect(result.operationId).toBe("test-uuid-1");
            expect(result.signal).toBeInstanceOf(AbortSignal);
            expect(result.signal.aborted).toBeFalsy();
            expect(mockRandomUUID).toHaveBeenCalledTimes(1);
            expect(logger.debug).toHaveBeenCalledWith(
                `Initiated operation test-uuid-1 for monitor ${mockMonitorId}`
            );

            const operation = registry.getOperation(result.operationId);
            expect(operation).toBeDefined();
            expect(operation?.id).toBe(result.operationId);
            expect(operation?.monitorId).toBe(mockMonitorId);
            expect(operation?.signal).toBe(result.signal);
            expect(operation?.abortController).toBeInstanceOf(AbortController);
            expect(operation?.initiatedAt).toBeInstanceOf(Date);
        });

        it("should generate unique operation IDs for multiple operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result1 = registry.initiateCheck(mockMonitorId);
            const result2 = registry.initiateCheck("monitor-456");

            expect(result1.operationId).toBe("test-uuid-1");
            expect(result2.operationId).toBe("test-uuid-2");
            expect(result1.operationId).not.toBe(result2.operationId);
            expect(result1.signal).not.toBe(result2.signal);

            expect(registry.getOperation(result1.operationId)).toBeDefined();
            expect(registry.getOperation(result2.operationId)).toBeDefined();
        });

        it("should handle UUID collision by retrying", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // First create an operation to occupy an ID
            const existingResult = registry.initiateCheck("existing-monitor");

            // Now force collisions returning existingId twice then a new one
            mockRandomUUID
                .mockReturnValueOnce(existingResult.operationId)
                .mockReturnValueOnce(existingResult.operationId)
                .mockReturnValueOnce("unique-uuid"); // Third attempt succeeds

            const result = registry.initiateCheck(mockMonitorId);

            expect(result.operationId).toBe("unique-uuid");
            // Existing initial call + 3 new attempts = 4 total calls
            expect(mockRandomUUID).toHaveBeenCalledTimes(4);
            expect(registry.getOperation(result.operationId)).toBeDefined();
        });

        it("should throw error after multiple failed UUID generation attempts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            // Seed registry with an initial operation
            const existingResult = registry.initiateCheck("existing-monitor");
            // Force all subsequent generations to return same existing ID
            mockRandomUUID.mockReturnValue(existingResult.operationId);

            expect(() => registry.initiateCheck(mockMonitorId)).toThrow(
                "Failed to generate a unique operation ID after multiple attempts."
            );

            // 1 initial call + 5 retry attempts inside second initiateCheck = 6 total
            expect(mockRandomUUID).toHaveBeenCalledTimes(6);
        });

        it("should handle empty monitor ID", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const result = registry.initiateCheck("");

            expect(result.operationId).toBe("test-uuid-1");

            const operation = registry.getOperation(result.operationId);
            expect(operation?.monitorId).toBe("");
        });

        it("should set accurate timestamps", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const beforeTime = new Date();
            const result = registry.initiateCheck(mockMonitorId);
            const afterTime = new Date();

            const operation = registry.getOperation(result.operationId);
            expect(operation?.initiatedAt).toBeDefined();
            expect(operation!.initiatedAt.getTime()).toBeGreaterThanOrEqual(
                beforeTime.getTime()
            );
            expect(operation!.initiatedAt.getTime()).toBeLessThanOrEqual(
                afterTime.getTime()
            );
        });

        it("should support timeout option", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = registry.initiateCheck(mockMonitorId, {
                timeoutMs: 5000,
            });

            expect(result.signal).toBeInstanceOf(AbortSignal);
            // Note: We can't easily test the timeout without waiting or mocking AbortSignal.timeout
            // but we can verify the signal is properly created
            expect(result.signal.aborted).toBeFalsy();
        });

        it("should support additional signals", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const externalController = new AbortController();
            const result = registry.initiateCheck(mockMonitorId, {
                additionalSignals: [externalController.signal],
            });

            expect(result.signal).toBeInstanceOf(AbortSignal);
            expect(result.signal.aborted).toBeFalsy();

            // Abort the external signal
            externalController.abort();

            // The combined signal should now be aborted
            expect(result.signal.aborted).toBeTruthy();
        });
    });

    describe("getOperation", () => {
        it("should return operation when it exists", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = registry.initiateCheck(mockMonitorId);

            const operation = registry.getOperation(result.operationId);

            expect(operation).toBeDefined();
            expect(operation?.id).toBe(result.operationId);
            expect(operation?.monitorId).toBe(mockMonitorId);
        });

        it("should return undefined when operation does not exist", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const operation = registry.getOperation("non-existent-id");

            expect(operation).toBeUndefined();
        });

        it("should return undefined for empty operation ID", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const operation = registry.getOperation("");

            expect(operation).toBeUndefined();
        });
    });

    describe("validateOperation", () => {
        it("should return true for active, non-aborted operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = registry.initiateCheck(mockMonitorId);

            const isValid = registry.validateOperation(result.operationId);

            expect(isValid).toBeTruthy();
        });

        it("should return false for non-existent operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const isValid = registry.validateOperation("non-existent-id");

            expect(isValid).toBeFalsy();
        });

        it("should return false for aborted operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = registry.initiateCheck(mockMonitorId);

            // Cancel the operation via AbortController
            registry.cancelOperations(mockMonitorId);

            const isValid = registry.validateOperation(result.operationId);

            expect(isValid).toBeFalsy();
        });

        it("should return false for empty operation ID", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const isValid = registry.validateOperation("");

            expect(isValid).toBeFalsy();
        });
    });

    describe("cancelOperations", () => {
        it("should abort all operations for a specific monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const result1 = registry.initiateCheck(mockMonitorId);
            const result2 = registry.initiateCheck(mockMonitorId);
            const result3 = registry.initiateCheck("other-monitor");

            registry.cancelOperations(mockMonitorId);

            // Operations for target monitor should be aborted
            expect(result1.signal.aborted).toBeTruthy();
            expect(result2.signal.aborted).toBeTruthy();

            // Operation for other monitor should not be affected
            expect(result3.signal.aborted).toBeFalsy();

            // Should log the cancellation
            expect(logger.debug).toHaveBeenCalledWith(
                "Cancelled 2 operations for monitor monitor-123"
            );
        });

        it("should not log when no operations to cancel", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Clear any previous debug calls
            vi.clearAllMocks();

            registry.cancelOperations(mockMonitorId);

            // Should not log when no operations are cancelled
            expect(logger.debug).not.toHaveBeenCalled();
        });

        it("should handle empty monitor ID", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const result = registry.initiateCheck("");

            registry.cancelOperations("");

            expect(result.signal.aborted).toBeTruthy();
        });

        it("should cancel only one operation when only one exists", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = registry.initiateCheck(mockMonitorId);

            registry.cancelOperations(mockMonitorId);

            expect(result.signal.aborted).toBeTruthy();
            expect(logger.debug).toHaveBeenCalledWith(
                "Cancelled 1 operations for monitor monitor-123"
            );
        });

        it("should not affect operations after they are aborted", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = registry.initiateCheck(mockMonitorId);

            registry.cancelOperations(mockMonitorId);
            expect(registry.validateOperation(result.operationId)).toBeFalsy();

            // Cancelling again should not change anything or cause issues
            registry.cancelOperations(mockMonitorId);
            expect(registry.validateOperation(result.operationId)).toBeFalsy();
        });
    });

    describe("completeOperation", () => {
        it("should remove operation from registry and abort signal when completed", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Deletion", "type");

            const result = registry.initiateCheck(mockMonitorId);

            // Verify operation exists and signal is not aborted
            expect(registry.getOperation(result.operationId)).toBeDefined();
            expect(result.signal.aborted).toBeFalsy();

            registry.completeOperation(result.operationId);

            // Operation should be removed and signal should be aborted
            expect(registry.getOperation(result.operationId)).toBeUndefined();
            expect(result.signal.aborted).toBeTruthy();
            expect(logger.debug).toHaveBeenCalledWith(
                "Completed operation test-uuid-1 for monitor monitor-123"
            );
        });

        it("should not log or error when completing non-existent operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            // Clear any previous debug calls
            vi.clearAllMocks();

            registry.completeOperation("non-existent-id");

            // Should not log anything
            expect(logger.debug).not.toHaveBeenCalled();
        });

        it("should handle empty operation ID", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Clear any previous debug calls
            vi.clearAllMocks();

            registry.completeOperation("");

            // Should not log anything
            expect(logger.debug).not.toHaveBeenCalled();
        });

        it("should complete operation even if it was already aborted", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = registry.initiateCheck(mockMonitorId);

            // Cancel then complete
            registry.cancelOperations(mockMonitorId);
            expect(result.signal.aborted).toBeTruthy();

            registry.completeOperation(result.operationId);

            // Operation should be removed
            expect(registry.getOperation(result.operationId)).toBeUndefined();
        });
    });

    describe("getActiveOperations", () => {
        it("should return empty map when no operations exist", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const activeOps = registry.getActiveOperations();

            expect(activeOps).toBeInstanceOf(Map);
            expect(activeOps.size).toBe(0);
        });

        it("should return all active operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result1 = registry.initiateCheck(mockMonitorId);
            const result2 = registry.initiateCheck("monitor-456");

            const activeOps = registry.getActiveOperations();

            expect(activeOps.size).toBe(2);
            expect(activeOps.has(result1.operationId)).toBeTruthy();
            expect(activeOps.has(result2.operationId)).toBeTruthy();
            expect(activeOps.get(result1.operationId)?.monitorId).toBe(
                mockMonitorId
            );
            expect(activeOps.get(result2.operationId)?.monitorId).toBe(
                "monitor-456"
            );
        });

        it("should return defensive copy of internal map", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = registry.initiateCheck(mockMonitorId);

            const activeOps1 = registry.getActiveOperations();
            const activeOps2 = registry.getActiveOperations();

            // Should NOT be the same reference (defensive copy)
            expect(activeOps1).not.toBe(activeOps2);
            expect(activeOps1.has(result.operationId)).toBeTruthy();
            // Mutating returned map should not affect registry
            activeOps1.clear();
            const stillPresent = registry.getOperation(result.operationId);
            expect(stillPresent).toBeDefined();
        });

        it("should reflect changes when operations are completed", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = registry.initiateCheck(mockMonitorId);

            let activeOps = registry.getActiveOperations();
            expect(activeOps.size).toBe(1);

            registry.completeOperation(result.operationId);

            activeOps = registry.getActiveOperations();
            expect(activeOps.size).toBe(0);
        });

        it("should include aborted operations until they are completed", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = registry.initiateCheck(mockMonitorId);

            registry.cancelOperations(mockMonitorId);

            const activeOps = registry.getActiveOperations();
            expect(activeOps.size).toBe(1);
            expect(
                activeOps.get(result.operationId)?.signal.aborted
            ).toBeTruthy();
        });
    });

    describe("Integration scenarios", () => {
        it("should handle complete operation lifecycle with AbortController", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Initiate multiple operations
            const op1 = registry.initiateCheck("monitor-1");
            const op2 = registry.initiateCheck("monitor-2");
            const op3 = registry.initiateCheck("monitor-1");

            // Verify all are active
            expect(registry.validateOperation(op1.operationId)).toBeTruthy();
            expect(registry.validateOperation(op2.operationId)).toBeTruthy();
            expect(registry.validateOperation(op3.operationId)).toBeTruthy();
            expect(registry.getActiveOperations().size).toBe(3);

            // Cancel operations for monitor-1
            registry.cancelOperations("monitor-1");

            // Only monitor-2 operation should still be valid
            expect(registry.validateOperation(op1.operationId)).toBeFalsy();
            expect(registry.validateOperation(op2.operationId)).toBeTruthy();
            expect(registry.validateOperation(op3.operationId)).toBeFalsy();

            // Verify signals are aborted appropriately
            expect(op1.signal.aborted).toBeTruthy();
            expect(op2.signal.aborted).toBeFalsy();
            expect(op3.signal.aborted).toBeTruthy();

            // Complete all operations
            registry.completeOperation(op1.operationId);
            registry.completeOperation(op2.operationId);
            registry.completeOperation(op3.operationId);

            // All should be removed
            expect(registry.getActiveOperations().size).toBe(0);
        });

        it("should handle multiple monitors with multiple operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const monitors = [
                "monitor-1",
                "monitor-2",
                "monitor-3",
            ];
            const operations: { operationId: string; signal: AbortSignal }[] =
                [];

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
            let abortedCount = 0;
            let activeCount = 0;

            for (const [, operation] of activeOps) {
                if (operation.signal.aborted) {
                    abortedCount++;
                } else {
                    activeCount++;
                }
            }

            expect(abortedCount).toBe(2);
            expect(activeCount).toBe(4);
        });

        it("should maintain operation state consistency with AbortController", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = registry.initiateCheck(mockMonitorId);

            // Get operation reference
            const operation = registry.getOperation(result.operationId);
            expect(operation).toBeDefined();

            const originalInitiatedAt = operation!.initiatedAt;
            const originalId = operation!.id;

            // Cancel operation
            registry.cancelOperations(mockMonitorId);

            // Same reference should now have aborted signal
            expect(operation!.signal.aborted).toBeTruthy();
            expect(operation!.id).toBe(originalId);
            expect(operation!.initiatedAt).toBe(originalInitiatedAt);
            expect(operation!.monitorId).toBe(mockMonitorId);
        });
    });

    describe("Type definitions", () => {
        it("should create MonitorCheckOperation with correct AbortController structure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = registry.initiateCheck(mockMonitorId);
            const operation = registry.getOperation(result.operationId);

            expect(operation).toBeDefined();

            // Verify the structure matches the interface
            const typedOperation: MonitorCheckOperation = operation!;
            expect(typedOperation.id).toBe(result.operationId);
            expect(typedOperation.monitorId).toBe(mockMonitorId);
            expect(typedOperation.initiatedAt).toBeInstanceOf(Date);
            expect(typedOperation.abortController).toBeInstanceOf(
                AbortController
            );
            expect(typedOperation.signal).toBeInstanceOf(AbortSignal);
        });

        it("should work with MonitorCheckResult interface", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Test that the result interface is compatible
            const mockResult: MonitorCheckResult = {
                monitorId: "test-monitor",
                operationId: "test-operation-id",
                responseTime: 123,
                status: "up",
                timestamp: new Date(),
            };

            expect(mockResult.operationId).toBe("test-operation-id");
            expect(mockResult.status).toBe("up");
            expect(mockResult.responseTime).toBe(123);
        });
    });

    describe("AbortController specific features", () => {
        it("should properly abort signal when operation is cancelled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: AbortController", "type");

            const result = registry.initiateCheck(mockMonitorId);

            expect(result.signal.aborted).toBeFalsy();

            // Add event listener to test abort event
            let abortEventFired = false;
            result.signal.addEventListener("abort", () => {
                abortEventFired = true;
            });

            registry.cancelOperations(mockMonitorId);

            expect(result.signal.aborted).toBeTruthy();
            expect(abortEventFired).toBeTruthy();
        });

        it("should combine timeout and additional signals correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorOperationRegistry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: AbortController", "type");

            const externalController = new AbortController();
            const result = registry.initiateCheck(mockMonitorId, {
                timeoutMs: 10_000, // Long timeout
                additionalSignals: [externalController.signal],
            });

            expect(result.signal.aborted).toBeFalsy();

            // External signal should trigger abort
            externalController.abort();

            expect(result.signal.aborted).toBeTruthy();
        });
    });
});
