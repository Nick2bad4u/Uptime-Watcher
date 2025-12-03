/**
 * Test file to verify operational hooks implementation.
 */

import { describe, expect, it, vi } from "vitest";
import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import {
    createOperationalHookContext,
    withOperationalHooks,
    withDatabaseOperation,
} from "../../utils/operationalHooks";
import { logger } from "../../utils/logger";

describe(createOperationalHookContext, () => {
    it("should freeze and brand plain context objects", () => {
        const contextInput = { userId: "user-123", operation: "seed" };
        const context = createOperationalHookContext(contextInput);

        expect(context).toEqual(contextInput);
        expect(Object.isFrozen(context)).toBeTruthy();
        expect(context).not.toBe(contextInput);
    });

    it("should reuse previously branded contexts", () => {
        const branded = createOperationalHookContext({ region: "iad" });
        const rehydrated = createOperationalHookContext(branded);

        expect(rehydrated).toBe(branded);
    });
});

describe("Operational Hooks", () => {
    describe(withOperationalHooks, () => {
        it("should successfully execute operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi.fn().mockResolvedValue("success");

            const result = await withOperationalHooks(mockOperation, {
                operationName: "test-operation",
                maxRetries: 1,
                emitEvents: false,
            });
            expect(result).toBe("success");
            expect(mockOperation).toHaveBeenCalledTimes(1);
        });
        it("should retry on failure", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockOperation = vi
                .fn()
                .mockRejectedValueOnce(new Error("First failure"))
                .mockResolvedValue("success");

            const result = await withOperationalHooks(mockOperation, {
                operationName: "test-operation",
                maxRetries: 2,
                initialDelay: 1, // Very short delay for testing
                emitEvents: false,
            });
            expect(result).toBe("success");
            expect(mockOperation).toHaveBeenCalledTimes(2);
        });
        it("should fail after max retries", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockOperation = vi
                .fn()
                .mockRejectedValue(new Error("Persistent failure"));

            await expect(
                withOperationalHooks(mockOperation, {
                    operationName: "test-operation",
                    maxRetries: 2,
                    initialDelay: 1,
                    emitEvents: false,
                })
            ).rejects.toThrowError("Persistent failure");

            expect(mockOperation).toHaveBeenCalledTimes(2);
        });
        it("should respect custom failure log level", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const failure = new Error("cancelled");
            const mockOperation = vi.fn().mockRejectedValue(failure);
            const warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {
                // no-op for test isolation
            });
            const errorSpy = vi
                .spyOn(logger, "error")
                .mockImplementation(() => {
                    // no-op for test isolation
                });

            await expect(
                withOperationalHooks(mockOperation, {
                    operationName: "custom-log-level",
                    maxRetries: 1,
                    emitEvents: false,
                    failureLogLevel: () => "warn",
                })
            ).rejects.toThrowError("cancelled");

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("custom-log-level"),
                expect.objectContaining({
                    error: failure,
                    operationId: expect.any(String),
                })
            );
            expect(errorSpy).not.toHaveBeenCalled();

            warnSpy.mockRestore();
            errorSpy.mockRestore();
        });
        it("should call callbacks correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi.fn().mockResolvedValue("success");
            const onSuccess = vi.fn();
            const onRetry = vi.fn();
            const onFailure = vi.fn();

            await withOperationalHooks(mockOperation, {
                operationName: "test-operation",
                maxRetries: 1,
                emitEvents: false,
                onSuccess,
                onRetry,
                onFailure,
            });
            expect(onSuccess).toHaveBeenCalledWith("success");
            expect(onRetry).not.toHaveBeenCalled();
            expect(onFailure).not.toHaveBeenCalled();
        });
        it("should tag lifecycle events with context metadata", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Event Processing", "type");

            const eventEmitter = {
                emitTyped: vi.fn().mockResolvedValue(undefined),
            } as unknown as TypedEventBus<UptimeEvents>;

            await withOperationalHooks(async () => "telemetry", {
                context: { userId: "user-1" },
                emitEvents: true,
                eventEmitter,
                maxRetries: 1,
                operationName: "stage-success",
            });

            expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:transaction-completed",
                expect.objectContaining({
                    lifecycleStage: "start",
                    operation: "stage-success:started",
                    userId: "user-1",
                })
            );
            expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:transaction-completed",
                expect.objectContaining({
                    lifecycleStage: "success",
                    operation: "stage-success:completed",
                })
            );
        });
        it("should emit failure lifecycle tagging when retries exhaust", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Event Processing", "type");

            const eventEmitter = {
                emitTyped: vi.fn().mockResolvedValue(undefined),
            } as unknown as TypedEventBus<UptimeEvents>;

            await withOperationalHooks(
                async () => {
                    throw new Error("fail-stage");
                },
                {
                    emitEvents: true,
                    eventEmitter,
                    initialDelay: 1,
                    maxRetries: 1,
                    operationName: "stage-failure",
                    throwOnFailure: false,
                }
            );

            expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:transaction-completed",
                expect.objectContaining({
                    lifecycleStage: "failure",
                    operation: "stage-failure:failed",
                    success: false,
                })
            );
        });
    });
    describe(withDatabaseOperation, () => {
        it("should be a specialized wrapper with correct defaults", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi.fn().mockResolvedValue("db-result");

            const result = await withDatabaseOperation(
                mockOperation,
                "test-db-operation"
            );

            expect(result).toBe("db-result");
            expect(mockOperation).toHaveBeenCalledTimes(1);
        });
    });
});
