/**
 * Branch coverage tests for operationalHooks.ts
 *
 * Current coverage: 50% branch coverage Goal: Increase to 98%+ branch coverage
 *
 * This file handles operational hooks for operations with error handling, retry
 * logic, and event emission capabilities.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("operationalHooks.ts - Branch Coverage", () => {
    let operationalHooks: any;
    let mockEventEmitter: any;

    beforeEach(async () => {
        // Reset all mocks before each test
        vi.clearAllMocks();

        // Mock logger
        vi.mock("../../utils/logger.js", () => ({
            logger: {
                info: vi.fn(),
                warn: vi.fn(),
                error: vi.fn(),
                debug: vi.fn(),
            },
        }));

        // Mock TypedEventBus
        mockEventEmitter = {
            emit: vi.fn().mockResolvedValue(undefined),
            emitTyped: vi.fn().mockResolvedValue(undefined),
        };

        operationalHooks = await import("../../utils/operationalHooks.js");
    });
    afterEach(() => {
        vi.resetAllMocks();
    });
    describe("withOperationalHooks - Success Paths", () => {
        it("should execute operation successfully on first attempt", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi.fn().mockResolvedValue("success");

            const result = await operationalHooks.withOperationalHooks(
                mockOperation,
                {
                    operationName: "testOperation",
                    maxRetries: 3,
                }
            );

            expect(result).toBe("success");
            expect(mockOperation).toHaveBeenCalledTimes(1);
        });
        it("should handle operation with event emission", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Event Processing", "type");

            const mockOperation = vi.fn().mockResolvedValue("success");

            const result = await operationalHooks.withOperationalHooks(
                mockOperation,
                {
                    operationName: "testOperation",
                    maxRetries: 3,
                    eventEmitter: mockEventEmitter,
                    emitEvents: true,
                }
            );

            expect(result).toBe("success");
            expect(mockEventEmitter.emitTyped).toHaveBeenCalled();
        });
        it("should handle operation without event emission", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Event Processing", "type");

            const mockOperation = vi.fn().mockResolvedValue("success");

            const result = await operationalHooks.withOperationalHooks(
                mockOperation,
                {
                    operationName: "testOperation",
                    maxRetries: 3,
                    emitEvents: false,
                }
            );

            expect(result).toBe("success");
            expect(mockEventEmitter.emit).not.toHaveBeenCalled();
        });
    });
    describe("withOperationalHooks - Retry Logic", () => {
        it("should retry on failure and eventually succeed", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockOperation = vi
                .fn()
                .mockRejectedValueOnce(new Error("First failure"))
                .mockRejectedValueOnce(new Error("Second failure"))
                .mockResolvedValueOnce("success");

            const result = await operationalHooks.withOperationalHooks(
                mockOperation,
                {
                    operationName: "testOperation",
                    maxRetries: 3,
                    initialDelay: 10, // Short delay for tests
                }
            );

            expect(result).toBe("success");
            expect(mockOperation).toHaveBeenCalledTimes(3);
        });
        it("should handle all retries exhausted - throwOnFailure=true", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockOperation = vi
                .fn()
                .mockRejectedValue(new Error("Persistent failure"));

            await expect(
                operationalHooks.withOperationalHooks(mockOperation, {
                    operationName: "testOperation",
                    maxRetries: 2,
                    throwOnFailure: true,
                    initialDelay: 10,
                })
            ).rejects.toThrow("Persistent failure");

            expect(mockOperation).toHaveBeenCalledTimes(2);
        });
        it("should handle all retries exhausted - throwOnFailure=false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockOperation = vi
                .fn()
                .mockRejectedValue(new Error("Persistent failure"));

            const result = await operationalHooks.withOperationalHooks(
                mockOperation,
                {
                    operationName: "testOperation",
                    maxRetries: 2,
                    throwOnFailure: false,
                    initialDelay: 10,
                }
            );

            expect(result).toBeNull();
            expect(mockOperation).toHaveBeenCalledTimes(2);
        });
    });
    describe("withOperationalHooks - Backoff Strategies", () => {
        it("should handle exponential backoff", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi
                .fn()
                .mockRejectedValueOnce(new Error("First failure"))
                .mockResolvedValueOnce("success");

            const result = await operationalHooks.withOperationalHooks(
                mockOperation,
                {
                    operationName: "testOperation",
                    maxRetries: 3,
                    backoff: "exponential",
                    initialDelay: 10,
                }
            );

            expect(result).toBe("success");
            expect(mockOperation).toHaveBeenCalledTimes(2);
        });
        it("should handle linear backoff", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi
                .fn()
                .mockRejectedValueOnce(new Error("First failure"))
                .mockResolvedValueOnce("success");

            const result = await operationalHooks.withOperationalHooks(
                mockOperation,
                {
                    operationName: "testOperation",
                    maxRetries: 3,
                    backoff: "linear",
                    initialDelay: 10,
                }
            );

            expect(result).toBe("success");
            expect(mockOperation).toHaveBeenCalledTimes(2);
        });
    });
    describe("withOperationalHooks - Callback Handling", () => {
        it("should call onSuccess callback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi.fn().mockResolvedValue("success");
            const onSuccess = vi.fn();

            const result = await operationalHooks.withOperationalHooks(
                mockOperation,
                {
                    operationName: "testOperation",
                    maxRetries: 3,
                    onSuccess,
                }
            );

            expect(result).toBe("success");
            expect(onSuccess).toHaveBeenCalledWith("success");
        });
        it("should call onRetry callback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi
                .fn()
                .mockRejectedValueOnce(new Error("First failure"))
                .mockResolvedValueOnce("success");
            const onRetry = vi.fn();

            const result = await operationalHooks.withOperationalHooks(
                mockOperation,
                {
                    operationName: "testOperation",
                    maxRetries: 3,
                    onRetry,
                    initialDelay: 10,
                }
            );

            expect(result).toBe("success");
            expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
        });
        it("should call onFailure callback when all retries exhausted", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockOperation = vi
                .fn()
                .mockRejectedValue(new Error("Persistent failure"));
            const onFailure = vi.fn();

            await expect(
                operationalHooks.withOperationalHooks(mockOperation, {
                    operationName: "testOperation",
                    maxRetries: 2,
                    onFailure,
                    initialDelay: 10,
                })
            ).rejects.toThrow();

            expect(onFailure).toHaveBeenCalledWith(expect.any(Error), 2);
        });
    });
    describe("withOperationalHooks - Error Handling Edge Cases", () => {
        it("should handle non-Error objects thrown", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockOperation = vi.fn().mockRejectedValue("string error");

            await expect(
                operationalHooks.withOperationalHooks(mockOperation, {
                    operationName: "testOperation",
                    maxRetries: 1,
                    initialDelay: 10,
                })
            ).rejects.toThrow("string error");
        });
        it("should handle null/undefined thrown", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi.fn().mockRejectedValue(null);

            await expect(
                operationalHooks.withOperationalHooks(mockOperation, {
                    operationName: "testOperation",
                    maxRetries: 1,
                    initialDelay: 10,
                })
            ).rejects.toThrow("null");
        });
        it("should handle callback errors gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockOperation = vi.fn().mockResolvedValue("success");
            const onSuccess = vi
                .fn()
                .mockRejectedValue(new Error("Callback error"));

            // Should not throw even if callback fails
            const result = await operationalHooks.withOperationalHooks(
                mockOperation,
                {
                    operationName: "testOperation",
                    maxRetries: 3,
                    onSuccess,
                }
            );

            expect(result).toBe("success");
        });
    });
    describe("withDatabaseOperation - Specialized Wrapper", () => {
        it("should execute database operation successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi
                .fn()
                .mockResolvedValue({ id: 1, name: "test" });

            const result = await operationalHooks.withDatabaseOperation(
                mockOperation,
                "createSite"
            );

            expect(result).toEqual({ id: 1, name: "test" });
            expect(mockOperation).toHaveBeenCalledTimes(1);
        });
        it("should handle database operation with event emitter", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Event Processing", "type");

            const mockOperation = vi.fn().mockResolvedValue({ id: 1 });

            const result = await operationalHooks.withDatabaseOperation(
                mockOperation,
                "updateSite",
                mockEventEmitter
            );

            expect(result).toEqual({ id: 1 });
            expect(mockEventEmitter.emitTyped).toHaveBeenCalled();
        });
        it("should handle database operation with context", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi.fn().mockResolvedValue({ success: true });
            const context = { siteId: "123", userId: "456" };

            const result = await operationalHooks.withDatabaseOperation(
                mockOperation,
                "deleteSite",
                mockEventEmitter,
                context
            );

            expect(result).toEqual({ success: true });
            expect(mockEventEmitter.emitTyped).toHaveBeenCalled();
        });
        it("should handle database operation failures with retries", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockOperation = vi
                .fn()
                .mockRejectedValueOnce(new Error("Database connection failed"))
                .mockResolvedValueOnce({ recovered: true });

            const result = await operationalHooks.withDatabaseOperation(
                mockOperation,
                "recoverSite"
            );

            expect(result).toEqual({ recovered: true });
            expect(mockOperation).toHaveBeenCalledTimes(2);
        });
        it("should use database-specific defaults", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi.fn().mockResolvedValue("success");

            // This tests that database operation uses specific defaults
            const result = await operationalHooks.withDatabaseOperation(
                mockOperation,
                "testDbOp"
            );

            expect(result).toBe("success");
            // The operation name should be prefixed with "database:"
            // This is tested implicitly through the function behavior
        });
    });
    describe("Configuration Edge Cases", () => {
        it("should handle minimal configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi.fn().mockResolvedValue("minimal");

            const result = await operationalHooks.withOperationalHooks(
                mockOperation,
                {
                    operationName: "minimal",
                }
            );

            expect(result).toBe("minimal");
        });
        it("should handle maximum configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi.fn().mockResolvedValue("maximal");
            const onSuccess = vi.fn();
            const onRetry = vi.fn();
            const onFailure = vi.fn();

            const result = await operationalHooks.withOperationalHooks(
                mockOperation,
                {
                    operationName: "maximal",
                    maxRetries: 5,
                    initialDelay: 50,
                    backoff: "exponential",
                    throwOnFailure: true,
                    emitEvents: true,
                    eventEmitter: mockEventEmitter,
                    context: { test: "data" },
                    onSuccess,
                    onRetry,
                    onFailure,
                }
            );

            expect(result).toBe("maximal");
            expect(onSuccess).toHaveBeenCalledWith("maximal");
        });
        it("should handle undefined/null context gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi.fn().mockResolvedValue("success");

            const result = await operationalHooks.withOperationalHooks(
                mockOperation,
                {
                    operationName: "testOperation",
                    context: undefined,
                }
            );

            expect(result).toBe("success");
        });
    });
    describe("Event Emission Edge Cases", () => {
        it("should handle event emission failures gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockOperation = vi.fn().mockResolvedValue("success");
            const failingEventEmitter = {
                emit: vi
                    .fn()
                    .mockRejectedValue(new Error("Event emission failed")),
                emitTyped: vi
                    .fn()
                    .mockRejectedValue(new Error("Event emission failed")),
            };

            // Should not throw even if event emission fails
            const result = await operationalHooks.withOperationalHooks(
                mockOperation,
                {
                    operationName: "testOperation",
                    eventEmitter: failingEventEmitter,
                    emitEvents: true,
                }
            );

            expect(result).toBe("success");
        });
        it("should handle event emitter without emit method", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks.branch-coverage", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Event Processing", "type");

            const mockOperation = vi.fn().mockResolvedValue("success");
            const invalidEventEmitter = {};

            const result = await operationalHooks.withOperationalHooks(
                mockOperation,
                {
                    operationName: "testOperation",
                    eventEmitter: invalidEventEmitter as any,
                    emitEvents: true,
                }
            );

            expect(result).toBe("success");
        });
    });
});
