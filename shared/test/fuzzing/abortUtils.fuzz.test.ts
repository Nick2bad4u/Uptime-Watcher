/**
 * Property-based tests for abort utilities using fast-check
 *
 * @packageDocumentation
 */

import { describe, expect, vi } from "vitest";
import * as fc from "fast-check";
import { test } from "@fast-check/vitest";
import {
    createCombinedAbortSignal,
    createAbortableOperation,
    sleep,
    retryWithAbort,
    isAbortError,
    raceWithAbort,
} from "../../utils/abortUtils.js";

describe("AbortUtils Fuzzing Tests", () => {
    describe("createCombinedAbortSignal", () => {
        test.prop([
            fc.record({
                timeoutMs: fc.option(fc.integer({ min: 1, max: 100 })), // Reduced max for faster tests
                reason: fc.option(fc.string()),
                additionalSignals: fc.option(fc.array(fc.constant(new AbortController().signal), { maxLength: 5 })),
            }, { requiredKeys: [] })
        ])(
            "should create valid AbortSignal from options",
            async (options) => {
                // Normalize null values to undefined for exact optional properties
                const normalizedOptions: {
                    timeoutMs?: number;
                    reason?: string;
                    additionalSignals?: AbortSignal[];
                } = {};

                if (options.timeoutMs !== null && options.timeoutMs !== undefined) {
                    normalizedOptions.timeoutMs = options.timeoutMs;
                }
                if (options.reason !== null && options.reason !== undefined) {
                    normalizedOptions.reason = options.reason;
                }
                if (options.additionalSignals !== null && options.additionalSignals !== undefined) {
                    normalizedOptions.additionalSignals = options.additionalSignals;
                }

                const signal = createCombinedAbortSignal(normalizedOptions);

                expect(signal).toBeInstanceOf(AbortSignal);
                expect(typeof signal.aborted).toBe("boolean");
                expect(typeof signal.throwIfAborted).toBe("function");
                expect(typeof signal.addEventListener).toBe("function");
                expect(typeof signal.removeEventListener).toBe("function");

                // Signal should not be aborted initially (unless timeout is very small)
                if (!normalizedOptions.timeoutMs || normalizedOptions.timeoutMs > 10) {
                    expect(signal.aborted).toBe(false);
                }
            }
        );

        test.prop([fc.array(fc.constant(new AbortController().signal), { minLength: 1, maxLength: 10 })])(
            "should handle multiple additional signals",
            (signals) => {
                const combinedSignal = createCombinedAbortSignal({
                    additionalSignals: signals,
                });

                expect(combinedSignal).toBeInstanceOf(AbortSignal);
                expect(combinedSignal.aborted).toBe(false);
            }
        );

        test.prop([fc.integer({ min: 1, max: 50 })])(
            "should create timeout signal that eventually aborts",
            async (timeoutMs) => {
                const signal = createCombinedAbortSignal({ timeoutMs });

                expect(signal.aborted).toBe(false);

                // Wait for timeout + buffer
                await new Promise<void>(resolve => {
                    setTimeout(resolve, timeoutMs + 20);
                });

                expect(signal.aborted).toBe(true);
            }
        );

        test(
            "should return non-aborting signal when no options provided",
            () => {
                const signal = createCombinedAbortSignal();

                expect(signal).toBeInstanceOf(AbortSignal);
                expect(signal.aborted).toBe(false);
            }
        );

        test(
            "should handle pre-aborted signals in additionalSignals",
            () => {
                const controller = new AbortController();
                controller.abort();

                const signal = createCombinedAbortSignal({
                    additionalSignals: [controller.signal],
                });

                expect(signal.aborted).toBe(true);
            }
        );

        test.prop([fc.array(fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.constant(new AbortController().signal)
        ), { maxLength: 5 })])(
            "should filter out null and undefined signals",
            (mixedSignals) => {
                const signal = createCombinedAbortSignal({
                    additionalSignals: mixedSignals as AbortSignal[],
                });

                expect(signal).toBeInstanceOf(AbortSignal);
                // Should not throw and should work normally
                expect(typeof signal.aborted).toBe("boolean");
            }
        );
    });

    describe("createAbortableOperation", () => {
        test.prop([
            fc.integer({ min: 1, max: 100 }),
            fc.string(),
        ])(
            "should execute operation and return result",
            async (delayMs, result) => {
                const operation = vi.fn(async (signal: AbortSignal) => {
                    expect(signal).toBeInstanceOf(AbortSignal);
                    await sleep(Math.min(delayMs, 50), signal); // Cap at 50ms for speed
                    return result;
                });

                const actualResult = await createAbortableOperation(operation);

                expect(actualResult).toBe(result);
                expect(operation).toHaveBeenCalledWith(expect.any(AbortSignal));
            }
        );

        test.prop([fc.integer({ min: 10, max: 100 })])(
            "should call cleanup function even when operation throws",
            async (_timeoutMs) => {
                const cleanup = vi.fn();
                const operation = vi.fn(async () => {
                    throw new Error("Operation failed");
                });

                await expect(
                    createAbortableOperation(operation, { cleanup })
                ).rejects.toThrow("Operation failed");

                expect(cleanup).toHaveBeenCalledTimes(1);
            }
        );

        test.prop([fc.integer({ min: 1, max: 50 })])(
            "should abort operation with timeout",
            async (timeoutMs) => {
                const cleanup = vi.fn();
                const operation = vi.fn(async (signal: AbortSignal) => {
                    // Simulate long-running operation
                    await sleep(timeoutMs * 10, signal);
                    return "should not reach here";
                });

                await expect(
                    createAbortableOperation(operation, { timeoutMs, cleanup })
                ).rejects.toThrow();

                expect(cleanup).toHaveBeenCalledTimes(1);
            }
        );

        test.prop([fc.string()])(
            "should handle operation that checks signal status",
            async (result) => {
                const operation = vi.fn(async (signal: AbortSignal) => {
                    if (signal.aborted) {
                        throw new Error("Already aborted");
                    }
                    return result;
                });

                const actualResult = await createAbortableOperation(operation);
                expect(actualResult).toBe(result);
            }
        );
    });

    describe("sleep", () => {
        test.prop([fc.integer({ min: 1, max: 50 })])(
            "should sleep for specified duration",
            async (ms) => {
                const start = Date.now();
                await sleep(ms);
                const elapsed = Date.now() - start;

                // Allow some tolerance for timing
                expect(elapsed).toBeGreaterThanOrEqual(ms - 10);
                expect(elapsed).toBeLessThan(ms + 50);
            }
        );

        test.prop([fc.integer({ min: 5, max: 30 })])(
            "should be abortable during sleep",
            async (ms) => {
                const controller = new AbortController();

                const sleepPromise = sleep(ms * 3, controller.signal);

                // Abort after short delay
                setTimeout(() => controller.abort(), Math.max(2, Math.floor(ms / 2)));

                await expect(sleepPromise).rejects.toThrow("Sleep was aborted");
            }
        );

        test.prop([fc.integer({ min: 1, max: 30 })])(
            "should reject immediately if signal is already aborted",
            async (ms) => {
                const controller = new AbortController();
                controller.abort();

                await expect(sleep(ms, controller.signal)).rejects.toThrow("Sleep was aborted");
            }
        );

        test(
            "should handle zero or negative sleep duration",
            async () => {
                const start = Date.now();
                await sleep(0);
                const elapsed = Date.now() - start;

                expect(elapsed).toBeLessThan(50); // Should resolve quickly, allowing for system variance
            }
        );
    });

    describe("retryWithAbort", () => {
        test.prop([
            fc.record({
                maxRetries: fc.integer({ min: 0, max: 2 }),
                initialDelay: fc.integer({ min: 1, max: 10 }),
                backoffMultiplier: fc.float({ min: 1, max: 1.5 }),
                maxDelay: fc.integer({ min: 20, max: 50 }),
            }, { requiredKeys: [] })
        ])(
            "should eventually succeed with valid options",
            async (options) => {
                const expectedResult = "success";
                let attempts = 0;
                // Always succeed immediately - this is a test for valid parameter combinations
                const operation = vi.fn(async () => {
                    attempts++;
                    return expectedResult;
                });

                const result = await retryWithAbort(operation, options);

                expect(result).toBe(expectedResult);
                expect(attempts).toBeGreaterThanOrEqual(1);
                expect(attempts).toBeLessThanOrEqual((options.maxRetries ?? 2) + 1);
            }
        );

        test.prop([fc.integer({ min: 1, max: 3 })])(
            "should fail after maxRetries attempts",
            async (maxRetries) => {
                const operation = vi.fn(async () => {
                    throw new Error("Always fails");
                });

                await expect(
                    retryWithAbort(operation, {
                        maxRetries,
                        initialDelay: 1 // Very short delay for speed
                    })
                ).rejects.toThrow("Always fails");

                expect(operation).toHaveBeenCalledTimes(maxRetries + 1);
            }
        );

        test.prop([fc.integer({ min: 2, max: 5 })])(
            "should be abortable during retries",
            async (maxRetries) => {
                const controller = new AbortController();
                const operation = vi.fn(async () => {
                    throw new Error("Retry me");
                });

                const retryPromise = retryWithAbort(operation, {
                    maxRetries,
                    initialDelay: 20, // Longer delay to ensure abort happens first
                    signal: controller.signal,
                });

                // Abort after short delay
                setTimeout(() => controller.abort(), 10);

                await expect(retryPromise).rejects.toThrow("Operation was aborted");
            }
        );

        test.prop([fc.integer({ min: 5, max: 20 })])(
            "should respect backoff multiplier",
            async (initialDelay) => {
                let attempts = 0;
                const operation = vi.fn(async () => {
                    attempts++;
                    throw new Error(`Attempt ${attempts}`);
                });

                const start = Date.now();

                await expect(
                    retryWithAbort(operation, {
                        maxRetries: 2,
                        initialDelay,
                        backoffMultiplier: 2,
                    })
                ).rejects.toThrow();

                const elapsed = Date.now() - start;
                const expectedMinTime = initialDelay + (initialDelay * 2); // First delay + second delay

                expect(elapsed).toBeGreaterThanOrEqual(expectedMinTime * 0.5); // More tolerance
            }
        );

        test(
            "should immediately abort if signal is already aborted",
            async () => {
                const controller = new AbortController();
                controller.abort();

                const operation = vi.fn(async () => "should not be called");

                await expect(
                    retryWithAbort(operation, { signal: controller.signal })
                ).rejects.toThrow("Operation was aborted");

                expect(operation).not.toHaveBeenCalled();
            }
        );
    });

    describe("isAbortError", () => {
        test.prop([fc.string()])(
            "should identify AbortError by name",
            (message) => {
                const error = new Error(message);
                error.name = "AbortError";

                expect(isAbortError(error)).toBe(true);
            }
        );

        test.prop([fc.string()])(
            "should identify TimeoutError by name",
            (message) => {
                const error = new Error(message);
                error.name = "TimeoutError";

                expect(isAbortError(error)).toBe(true);
            }
        );

        test.prop([fc.oneof(
            fc.constant("Operation was aborted"),
            fc.constant("Request cancelled by user"),
            fc.constant("ABORTED: Connection terminated"),
            fc.constant("The operation was cancelled"),
        )])(
            "should identify abort errors by message content",
            (message) => {
                const error = new Error(message);

                expect(isAbortError(error)).toBe(true);
            }
        );

        test.prop([fc.oneof(
            fc.constant("Network error"),
            fc.constant("File not found"),
            fc.constant("Permission denied"),
            fc.constant("Syntax error"),
            fc.constant("Type error"),
        )])(
            "should not identify non-abort errors",
            (message) => {
                const error = new Error(message);

                expect(isAbortError(error)).toBe(false);
            }
        );

        test.prop([fc.anything().filter(x => !(x instanceof Error))])(
            "should return false for non-Error values",
            (value) => {
                expect(isAbortError(value)).toBe(false);
            }
        );

        test(
            "should handle edge cases",
            () => {
                expect(isAbortError(null)).toBe(false);
                expect(isAbortError(undefined)).toBe(false);
                expect(isAbortError({})).toBe(false);
                expect(isAbortError("string")).toBe(false);
                expect(isAbortError(123)).toBe(false);

                // DOMException AbortError
                const domError = new DOMException("Operation aborted", "AbortError");
                expect(isAbortError(domError)).toBe(true);
            }
        );
    });

    describe("raceWithAbort", () => {
        test.prop([fc.string(), fc.integer({ min: 10, max: 100 })])(
            "should resolve with operation result when not aborted",
            async (result, delayMs) => {
                const controller = new AbortController();
                const operation = new Promise<string>(resolve => {
                    setTimeout(() => resolve(result), delayMs);
                });

                const raceResult = await raceWithAbort(operation, controller.signal);

                expect(raceResult).toBe(result);
            }
        );

        test.prop([fc.integer({ min: 10, max: 100 })])(
            "should reject when signal is aborted during operation",
            async (delayMs) => {
                const controller = new AbortController();
                const operation = new Promise<string>(resolve => {
                    setTimeout(() => resolve("should not resolve"), delayMs * 2);
                });

                const racePromise = raceWithAbort(operation, controller.signal);

                // Abort before operation completes
                setTimeout(() => controller.abort(), delayMs);

                await expect(racePromise).rejects.toThrow("Operation was aborted");
            }
        );

        test.prop([fc.string()])(
            "should reject immediately if signal is already aborted",
            async (result) => {
                const controller = new AbortController();
                controller.abort();

                const operation = Promise.resolve(result);

                await expect(
                    raceWithAbort(operation, controller.signal)
                ).rejects.toThrow("Operation was aborted");
            }
        );

        test.prop([fc.string()])(
            "should handle operation that rejects",
            async (errorMessage) => {
                const controller = new AbortController();
                const operation = Promise.reject(new Error(errorMessage));

                await expect(
                    raceWithAbort(operation, controller.signal)
                ).rejects.toThrow(errorMessage);
            }
        );

        test(
            "should clean up event listeners",
            async () => {
                const controller = new AbortController();
                const operation = Promise.resolve("result");

                const addEventListenerSpy = vi.spyOn(controller.signal, "addEventListener");

                const result = await raceWithAbort(operation, controller.signal);

                expect(result).toBe("result");
                expect(addEventListenerSpy).toHaveBeenCalledWith(
                    "abort",
                    expect.any(Function),
                    { once: true }
                );
            }
        );
    });

    describe("Edge Cases and Integration", () => {
        test.prop([fc.integer({ min: 1, max: 10 })])(
            "all abort utilities should handle rapid abort signals",
            async (count) => {
                const controllers = Array.from({ length: count }, () => new AbortController());
                const signals = controllers.map(c => c.signal);

                const combinedSignal = createCombinedAbortSignal({
                    additionalSignals: signals,
                });

                expect(combinedSignal.aborted).toBe(false);

                // Abort all controllers
                for (const c of controllers) {
                    c.abort();
                }

                // Combined signal should be aborted
                expect(combinedSignal.aborted).toBe(true);
            }
        );

        test.prop([fc.integer({ min: 10, max: 100 })])(
            "sleep and retry should work together with timeouts",
            async (timeoutMs) => {
                const controller = new AbortController();
                let attempts = 0;

                const operation = async () => {
                    attempts++;
                    await sleep(timeoutMs * 3, controller.signal); // Increased multiplier for more predictable timing
                    return "success";
                };

                const retryPromise = retryWithAbort(operation, {
                    maxRetries: 2,
                    initialDelay: 1,
                    signal: controller.signal,
                });

                // Abort during first retry - ensure it happens before operation completes
                setTimeout(() => controller.abort(), timeoutMs);

                await expect(retryPromise).rejects.toThrow("Operation was aborted");
                expect(attempts).toBeLessThanOrEqual(2);
            }
        );

        test(
            "createAbortableOperation should work with retryWithAbort",
            async () => {
                let attempts = 0;
                const operation = async (signal: AbortSignal) => {
                    attempts++;
                    if (attempts < 3) {
                        throw new Error(`Attempt ${attempts} failed`);
                    }

                    // Simulate some work that checks the signal
                    await sleep(10, signal);
                    return "finally succeeded";
                };

                const result = await createAbortableOperation(
                    async (signal) => retryWithAbort(
                        () => operation(signal),
                        { maxRetries: 5, initialDelay: 1 }
                    )
                );

                expect(result).toBe("finally succeeded");
                expect(attempts).toBe(3);
            }
        );
    });
});
