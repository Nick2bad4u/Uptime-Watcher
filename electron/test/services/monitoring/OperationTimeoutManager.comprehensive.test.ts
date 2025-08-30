/**
 * Comprehensive test suite for OperationTimeoutManager
 *
 * @remarks
 * Tests all functionality including timeout scheduling, clearing, and automatic
 * operation cancellation on timeout with proper logging.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OperationTimeoutManager } from "../../../services/monitoring/OperationTimeoutManager";
import type {
    MonitorCheckOperation,
    MonitorOperationRegistry,
} from "../../../services/monitoring/MonitorOperationRegistry";

// Mock the logger
vi.mock("../../../utils/logger", () => ({
    monitorLogger: {
        debug: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock log templates
vi.mock("@shared/utils/logTemplates", () => ({
    interpolateLogTemplate: vi.fn((template: string, params: any) =>
        template.replaceAll(
            /{(?<key>\w+)}/g,
            (match, key) => params[key] || match
        )
    ),
    LOG_TEMPLATES: {
        debug: {
            OPERATION_TIMEOUT_SCHEDULED:
                "Timeout scheduled for operation {operationId} with {timeoutMs}ms",
        },
        warnings: {
            OPERATION_TIMEOUT: "Operation {operationId} timed out, cancelling",
        },
    },
}));

describe("OperationTimeoutManager - Comprehensive Coverage", () => {
    let operationTimeoutManager: OperationTimeoutManager;
    let mockOperationRegistry: MonitorOperationRegistry;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        // Mock the operation registry
        mockOperationRegistry = {
            getOperation: vi.fn(),
            cancelOperations: vi.fn(),
        } as unknown as MonitorOperationRegistry;

        operationTimeoutManager = new OperationTimeoutManager(
            mockOperationRegistry
        );
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("Constructor", () => {
        it("should create instance with operation registry", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(operationTimeoutManager).toBeDefined();
            expect(operationTimeoutManager).toBeInstanceOf(
                OperationTimeoutManager
            );
        });
    });

    describe("scheduleTimeout", () => {
        it("should schedule timeout for operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const operationId = "op-123";
            const timeoutMs = 5000;

            operationTimeoutManager.scheduleTimeout(operationId, timeoutMs);

            // Verify timeout was scheduled
            expect(vi.getTimerCount()).toBe(1);
        });

        it("should log debug message when timeout is scheduled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const { monitorLogger } = await import("../../../utils/logger");
            const { interpolateLogTemplate, LOG_TEMPLATES } = await import(
                "@shared/utils/logTemplates"
            );

            const operationId = "op-456";
            const timeoutMs = 3000;

            operationTimeoutManager.scheduleTimeout(operationId, timeoutMs);

            expect(interpolateLogTemplate).toHaveBeenCalledWith(
                LOG_TEMPLATES.debug.OPERATION_TIMEOUT_SCHEDULED,
                { operationId, timeoutMs }
            );
            expect(monitorLogger.debug).toHaveBeenCalled();
        });

        it("should store multiple timeouts for different operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            operationTimeoutManager.scheduleTimeout("op-1", 1000);
            operationTimeoutManager.scheduleTimeout("op-2", 2000);
            operationTimeoutManager.scheduleTimeout("op-3", 3000);

            expect(vi.getTimerCount()).toBe(3);
        });

        it("should replace existing timeout for same operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const operationId = "op-replace";

            // Schedule first timeout
            operationTimeoutManager.scheduleTimeout(operationId, 1000);
            expect(vi.getTimerCount()).toBe(1);

            // Schedule second timeout for same operation (old one still runs)
            operationTimeoutManager.scheduleTimeout(operationId, 2000);
            expect(vi.getTimerCount()).toBe(2); // Both timeouts are active
        });
    });

    describe("clearTimeout", () => {
        it("should clear existing timeout", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const operationId = "op-clear";

            // Schedule a timeout
            operationTimeoutManager.scheduleTimeout(operationId, 5000);
            expect(vi.getTimerCount()).toBe(1);

            // Clear the timeout
            operationTimeoutManager.clearTimeout(operationId);
            expect(vi.getTimerCount()).toBe(0);
        });

        it("should log debug message when timeout is cleared", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const { monitorLogger } = await import("../../../utils/logger");
            const operationId = "op-clear-log";

            // Schedule and clear timeout
            operationTimeoutManager.scheduleTimeout(operationId, 5000);
            operationTimeoutManager.clearTimeout(operationId);

            expect(monitorLogger.debug).toHaveBeenCalledWith(
                `Cleared timeout for operation ${operationId}`
            );
        });

        it("should do nothing when clearing non-existent timeout", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const { monitorLogger } = await import("../../../utils/logger");

            // Clear non-existent timeout (should not throw or log)
            operationTimeoutManager.clearTimeout("non-existent");

            // Should not log debug message for non-existent timeout
            expect(monitorLogger.debug).not.toHaveBeenCalledWith(
                expect.stringContaining(
                    "Cleared timeout for operation non-existent"
                )
            );
        });

        it("should clear specific timeout without affecting others", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            operationTimeoutManager.scheduleTimeout("op-1", 1000);
            operationTimeoutManager.scheduleTimeout("op-2", 2000);
            operationTimeoutManager.scheduleTimeout("op-3", 3000);
            expect(vi.getTimerCount()).toBe(3);

            // Clear one timeout
            operationTimeoutManager.clearTimeout("op-2");
            expect(vi.getTimerCount()).toBe(2);
        });
    });

    describe("handleTimeout (timeout execution)", () => {
        it("should handle timeout for active operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const { monitorLogger } = await import("../../../utils/logger");
            const { interpolateLogTemplate, LOG_TEMPLATES } = await import(
                "@shared/utils/logTemplates"
            );

            const operationId = "op-timeout";
            const monitorId = "monitor-123";

            // Mock active operation
            const abortController = new AbortController();
            const mockOperation: MonitorCheckOperation = {
                id: operationId,
                monitorId,
                abortController,
                signal: abortController.signal,
                initiatedAt: new Date(),
            };

            vi.mocked(mockOperationRegistry.getOperation).mockReturnValue(
                mockOperation
            );

            // Schedule timeout
            operationTimeoutManager.scheduleTimeout(operationId, 1000);

            // Fast-forward time to trigger timeout
            vi.advanceTimersByTime(1000);

            // Verify operation was retrieved
            expect(mockOperationRegistry.getOperation).toHaveBeenCalledWith(
                operationId
            );

            // Verify warning was logged
            expect(interpolateLogTemplate).toHaveBeenCalledWith(
                LOG_TEMPLATES.warnings.OPERATION_TIMEOUT,
                { operationId }
            );
            expect(monitorLogger.warn).toHaveBeenCalled();

            // Verify operation was cancelled
            expect(mockOperationRegistry.cancelOperations).toHaveBeenCalledWith(
                monitorId
            );
        });

        it("should not cancel already cancelled operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const operationId = "op-cancelled";
            const monitorId = "monitor-456";

            // Mock cancelled operation
            const abortControllerCancelled = new AbortController();
            abortControllerCancelled.abort(); // Make it aborted
            const mockOperation: MonitorCheckOperation = {
                id: operationId,
                monitorId,
                abortController: abortControllerCancelled,
                signal: abortControllerCancelled.signal,
                initiatedAt: new Date(),
            };

            vi.mocked(mockOperationRegistry.getOperation).mockReturnValue(
                mockOperation
            );

            // Schedule timeout
            operationTimeoutManager.scheduleTimeout(operationId, 1000);

            // Fast-forward time to trigger timeout
            vi.advanceTimersByTime(1000);

            // Verify operation was retrieved
            expect(mockOperationRegistry.getOperation).toHaveBeenCalledWith(
                operationId
            );

            // Verify operation was NOT cancelled (already cancelled)
            expect(
                mockOperationRegistry.cancelOperations
            ).not.toHaveBeenCalled();
        });

        it("should handle timeout for non-existent operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const operationId = "op-non-existent";

            // Mock registry returning null/undefined
            vi.mocked(mockOperationRegistry.getOperation).mockReturnValue(
                undefined
            );

            // Schedule timeout
            operationTimeoutManager.scheduleTimeout(operationId, 1000);

            // Fast-forward time to trigger timeout
            vi.advanceTimersByTime(1000);

            // Verify operation was retrieved
            expect(mockOperationRegistry.getOperation).toHaveBeenCalledWith(
                operationId
            );

            // Verify no cancellation was attempted
            expect(
                mockOperationRegistry.cancelOperations
            ).not.toHaveBeenCalled();
        });

        it("should clear timeout after handling timeout", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const operationId = "op-clear-after";

            // Mock operation
            const abortController2 = new AbortController();
            const mockOperation: MonitorCheckOperation = {
                id: operationId,
                monitorId: "monitor-789",
                abortController: abortController2,
                signal: abortController2.signal,
                initiatedAt: new Date(),
            };

            vi.mocked(mockOperationRegistry.getOperation).mockReturnValue(
                mockOperation
            );

            // Schedule timeout
            operationTimeoutManager.scheduleTimeout(operationId, 1000);
            expect(vi.getTimerCount()).toBe(1);

            // Fast-forward time to trigger timeout
            vi.advanceTimersByTime(1000);

            // Verify timeout was cleared after handling
            expect(vi.getTimerCount()).toBe(0);
        });
    });

    describe("Edge Cases and Error Conditions", () => {
        it("should handle zero timeout", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const operationId = "op-zero";

            operationTimeoutManager.scheduleTimeout(operationId, 0);
            expect(vi.getTimerCount()).toBe(1);

            // Advance by zero time
            vi.advanceTimersByTime(0);
            expect(vi.getTimerCount()).toBe(0);
        });

        it("should handle negative timeout", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const operationId = "op-negative";

            // Should still schedule timeout (setTimeout handles negative as 0)
            operationTimeoutManager.scheduleTimeout(operationId, -1000);
            expect(vi.getTimerCount()).toBe(1);
        });

        it("should handle very large timeout", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const operationId = "op-large";
            const largeTimeout = Number.MAX_SAFE_INTEGER;

            operationTimeoutManager.scheduleTimeout(operationId, largeTimeout);
            expect(vi.getTimerCount()).toBe(1);
        });

        it("should handle empty operation ID", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const operationId = "";

            operationTimeoutManager.scheduleTimeout(operationId, 1000);
            expect(vi.getTimerCount()).toBe(1);

            operationTimeoutManager.clearTimeout(operationId);
            expect(vi.getTimerCount()).toBe(0);
        });

        it("should handle special characters in operation ID", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const operationId = "op-with-special-chars-!@#$%^&*()";

            operationTimeoutManager.scheduleTimeout(operationId, 1000);
            expect(vi.getTimerCount()).toBe(1);

            operationTimeoutManager.clearTimeout(operationId);
            expect(vi.getTimerCount()).toBe(0);
        });
    });

    describe("Integration Scenarios", () => {
        it("should handle rapid schedule and clear cycles", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const operationId = "op-rapid";

            // Rapid schedule/clear cycles
            for (let i = 0; i < 10; i++) {
                operationTimeoutManager.scheduleTimeout(operationId, 1000);
                operationTimeoutManager.clearTimeout(operationId);
            }

            expect(vi.getTimerCount()).toBe(0);
        });

        it("should handle concurrent operations with different timeouts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Mock operations
            const operations = [
                {
                    id: "op-1",
                    monitorId: "monitor-1",
                    abortController: new AbortController(),
                    get signal() {
                        return this.abortController.signal;
                    },
                    initiatedAt: new Date(),
                },
                {
                    id: "op-2",
                    monitorId: "monitor-2",
                    abortController: new AbortController(),
                    get signal() {
                        return this.abortController.signal;
                    },
                    initiatedAt: new Date(),
                },
                {
                    id: "op-3",
                    monitorId: "monitor-3",
                    abortController: new AbortController(),
                    get signal() {
                        return this.abortController.signal;
                    },
                    initiatedAt: new Date(),
                },
            ];

            vi.mocked(mockOperationRegistry.getOperation).mockImplementation(
                (id) => operations.find((op) => op.id === id)
            );

            // Schedule timeouts with different durations
            operationTimeoutManager.scheduleTimeout("op-1", 1000);
            operationTimeoutManager.scheduleTimeout("op-2", 2000);
            operationTimeoutManager.scheduleTimeout("op-3", 3000);

            expect(vi.getTimerCount()).toBe(3);

            // Advance time to trigger first timeout
            vi.advanceTimersByTime(1000);
            expect(mockOperationRegistry.cancelOperations).toHaveBeenCalledWith(
                "monitor-1"
            );
            expect(vi.getTimerCount()).toBe(2);

            // Advance time to trigger second timeout
            vi.advanceTimersByTime(1000);
            expect(mockOperationRegistry.cancelOperations).toHaveBeenCalledWith(
                "monitor-2"
            );
            expect(vi.getTimerCount()).toBe(1);

            // Advance time to trigger third timeout
            vi.advanceTimersByTime(1000);
            expect(mockOperationRegistry.cancelOperations).toHaveBeenCalledWith(
                "monitor-3"
            );
            expect(vi.getTimerCount()).toBe(0);

            // Verify all cancellations occurred
            expect(
                mockOperationRegistry.cancelOperations
            ).toHaveBeenCalledTimes(3);
        });

        it("should handle clearing timeout before it expires", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: OperationTimeoutManager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const operationId = "op-clear-before-expire";

            // Mock operation
            const abortController3 = new AbortController();
            const mockOperation: MonitorCheckOperation = {
                id: operationId,
                monitorId: "monitor-clear",
                abortController: abortController3,
                signal: abortController3.signal,
                initiatedAt: new Date(),
            };

            vi.mocked(mockOperationRegistry.getOperation).mockReturnValue(
                mockOperation
            );

            // Schedule timeout
            operationTimeoutManager.scheduleTimeout(operationId, 2000);

            // Clear before expiry
            vi.advanceTimersByTime(1000);
            operationTimeoutManager.clearTimeout(operationId);

            // Advance past original timeout
            vi.advanceTimersByTime(2000);

            // Verify operation was NOT cancelled (timeout was cleared)
            expect(
                mockOperationRegistry.cancelOperations
            ).not.toHaveBeenCalled();
        });
    });
});
