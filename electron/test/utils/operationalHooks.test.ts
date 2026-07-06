/**
 * Test file to verify operational hooks implementation.
 */

import { createAbortError } from "@shared/utils/abortError";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";

import { logger } from "../../utils/logger";
import {
    createOperationalHookContext,
    withDatabaseOperation,
    withOperationalHooks,
} from "../../utils/operationalHooks";

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

    it("should not invoke context accessors while freezing metadata", () => {
        let getterCalls = 0;
        const contextInput = { operation: "seed" };
        Object.defineProperty(contextInput, "secret", {
            enumerable: true,
            get() {
                getterCalls += 1;
                throw new Error("context getter should not run");
            },
        });

        const context = createOperationalHookContext(contextInput);

        expect(context).toEqual({ operation: "seed" });
        expect(Object.hasOwn(context, "secret")).toBeFalsy();
        expect(Object.isFrozen(context)).toBeTruthy();
        expect(getterCalls).toBe(0);
    });
});

describe("Operational Hooks", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

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

        it("should stop retrying when aborted", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Cancellation", "type");

            const controller = new AbortController();

            const mockOperation = vi.fn().mockImplementation(async () => {
                controller.abort("cancelled");
                throw new Error("First failure");
            });

            await expect(
                withOperationalHooks(mockOperation, {
                    operationName: "abort-retry",
                    maxRetries: 3,
                    initialDelay: 50,
                    emitEvents: false,
                    signal: controller.signal,
                })
            ).rejects.toMatchObject({ name: "AbortError" });

            expect(mockOperation).toHaveBeenCalledTimes(1);
        });
        it("should preserve the signal reason when already aborted before the first attempt", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Cancellation", "type");

            const controller = new AbortController();
            const abortReason = new Error("user stopped operation");
            controller.abort(abortReason);

            const mockOperation = vi.fn().mockResolvedValue("success");

            await expect(
                withOperationalHooks(mockOperation, {
                    emitEvents: false,
                    maxRetries: 3,
                    operationName: "already-aborted",
                    signal: controller.signal,
                })
            ).rejects.toMatchObject({
                cause: abortReason,
                name: "AbortError",
            });

            expect(mockOperation).not.toHaveBeenCalled();
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
            ).rejects.toThrow("Persistent failure");

            expect(mockOperation).toHaveBeenCalledTimes(2);
        });
        it("should treat non-positive max retries as one total attempt", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi.fn().mockResolvedValue("success");

            await expect(
                withOperationalHooks(mockOperation, {
                    emitEvents: false,
                    maxRetries: 0,
                    operationName: "zero-max-retries",
                })
            ).resolves.toBe("success");

            expect(mockOperation).toHaveBeenCalledTimes(1);
        });
        it("should default non-finite max retries before retrying", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockOperation = vi
                .fn()
                .mockRejectedValue(new Error("Persistent failure"));

            await expect(
                withOperationalHooks(mockOperation, {
                    emitEvents: false,
                    initialDelay: 0,
                    maxRetries: Number.POSITIVE_INFINITY,
                    operationName: "infinite-max-retries",
                })
            ).rejects.toThrow("Persistent failure");

            expect(mockOperation).toHaveBeenCalledTimes(3);
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
            ).rejects.toThrow("cancelled");

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("custom-log-level"),
                expect.objectContaining({
                    errorMessage: failure.message,
                    errorName: failure.name,
                    operationId: expect.stringMatching(
                        /^op_\d+_[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/v
                    ),
                })
            );
            expect(errorSpy).not.toHaveBeenCalled();

            warnSpy.mockRestore();
            errorSpy.mockRestore();
        });

        it("should not invoke error code accessors while building failure metadata", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            let getterCalls = 0;
            const failure = new Error("failed with accessor code");
            Object.defineProperty(failure, "code", {
                enumerable: true,
                get() {
                    getterCalls += 1;
                    throw new Error("code getter should not run");
                },
            });

            const mockOperation = vi.fn().mockRejectedValue(failure);
            const warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {
                // no-op for test isolation
            });

            await expect(
                withOperationalHooks(mockOperation, {
                    emitEvents: false,
                    failureLogLevel: "warn",
                    maxRetries: 1,
                    operationName: "accessor-code",
                })
            ).rejects.toThrow("failed with accessor code");

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("accessor-code"),
                expect.not.objectContaining({
                    errorCode: expect.any(String),
                })
            );
            expect(getterCalls).toBe(0);

            warnSpy.mockRestore();
        });

        it("downgrades AbortError logging to debug", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Cancellation", "type");

            const abortError = createAbortError();
            const mockOperation = vi.fn().mockRejectedValue(abortError);

            const warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {
                // no-op
            });
            const errorSpy = vi
                .spyOn(logger, "error")
                .mockImplementation(() => {
                    // no-op
                });
            const debugSpy = vi
                .spyOn(logger, "debug")
                .mockImplementation(() => {
                    // no-op
                });

            await expect(
                withOperationalHooks(mockOperation, {
                    operationName: "abort-log-level",
                    maxRetries: 1,
                    emitEvents: false,
                    failureLogLevel: () => "error",
                })
            ).rejects.toMatchObject({ name: "AbortError" });

            expect(warnSpy).not.toHaveBeenCalled();
            expect(errorSpy).not.toHaveBeenCalled();

            const debugMessages = debugSpy.mock.calls
                .map((call) => call[0])
                .filter((value): value is string => typeof value === "string");
            expect(
                debugMessages.some((message) =>
                    message.includes("abort-log-level")
                )
            ).toBeTruthy();

            warnSpy.mockRestore();
            errorSpy.mockRestore();
            debugSpy.mockRestore();
        });

        it("marks AbortError lifecycle emissions as cancelled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Cancellation", "type");

            const abortError = createAbortError();
            const mockOperation = vi.fn().mockRejectedValue(abortError);

            const eventEmitter = {
                emitTyped: vi.fn().mockResolvedValue(undefined),
            } as unknown as TypedEventBus<UptimeEvents>;

            await expect(
                withOperationalHooks(mockOperation, {
                    operationName: "abort-event",
                    maxRetries: 1,
                    emitEvents: true,
                    eventEmitter,
                })
            ).rejects.toMatchObject({ name: "AbortError" });

            expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:transaction-completed",
                expect.objectContaining({
                    cancelled: true,
                    lifecycleStage: "failure",
                    operation: "abort-event:failed",
                    success: false,
                })
            );
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
        it("uses monotonic time for lifecycle durations when the wall clock moves backward", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationalHooks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Observability", "type");

            const eventEmitter = {
                emitTyped: vi.fn().mockResolvedValue(undefined),
            } as unknown as TypedEventBus<UptimeEvents>;

            vi.spyOn(Date, "now")
                .mockReturnValueOnce(50_000)
                .mockReturnValueOnce(10_000)
                .mockReturnValueOnce(9000);
            vi.spyOn(performance, "now")
                .mockReturnValueOnce(200)
                .mockReturnValueOnce(245);

            await withOperationalHooks(async () => "telemetry", {
                emitEvents: true,
                eventEmitter,
                maxRetries: 1,
                operationName: "monotonic-duration",
            });

            expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:transaction-completed",
                expect.objectContaining({
                    duration: 45,
                    lifecycleStage: "success",
                    operation: "monotonic-duration:completed",
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
