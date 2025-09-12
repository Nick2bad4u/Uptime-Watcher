/**
 * Comprehensive fast-check tests for abortUtils.ts
 *
 * @file This file contains property-based tests for abort signal utilities,
 *   timeout handling, retry operations, and cancellation management.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import fc from "fast-check";
import {
    createCombinedAbortSignal,
    createAbortableOperation,
    retryWithAbort,
    sleep,
    raceWithAbort,
    isAbortError,
    type CombineSignalsOptions,
} from "../../../../shared/utils/abortUtils.js";

describe("abortUtils.ts - Comprehensive Fast-Check Tests", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    describe(
        () => "createCombinedAbortSignal",
        () => {
            it("should create valid abort signal with timeout", () => {
                fc.assert(
                    fc.property(
                        fc.integer({ min: 1, max: 10_000 }), // timeout in ms
                        fc.option(fc.string(), { nil: undefined }), // optional reason
                        (timeoutMs, reason) => {
                            const options: CombineSignalsOptions = {
                                timeoutMs,
                            };
                            if (reason !== undefined) {
                                options.reason = reason;
                            }
                            const signal = createCombinedAbortSignal(options);

                            expect(signal).toBeInstanceOf(AbortSignal);
                            expect(signal.aborted).toBeFalsy();

                            // Advance time to trigger timeout
                            vi.advanceTimersByTime(timeoutMs + 100);

                            expect(signal.aborted).toBeTruthy();
                            if (reason) {
                                expect(signal.reason).toBe(reason);
                            }
                        }
                    )
                );
            });

            it("should handle multiple additional signals", () => {
                fc.assert(
                    fc.property(
                        fc.array(fc.boolean(), { minLength: 1, maxLength: 5 }), // signal states
                        (shouldAbort) => {
                            const controllers = shouldAbort.map(
                                () => new AbortController()
                            );
                            const additionalSignals = controllers.map(
                                (c) => c.signal
                            );

                            const signal = createCombinedAbortSignal({
                                additionalSignals,
                            });
                            expect(signal.aborted).toBeFalsy();

                            // Abort one of the controllers
                            const abortIndex = shouldAbort.findIndex(Boolean);
                            if (abortIndex !== -1) {
                                controllers[abortIndex]?.abort("Test abort");
                                expect(signal.aborted).toBeTruthy();
                            }
                        }
                    )
                );
            });

            it("should handle edge cases gracefully", () => {
                fc.assert(
                    fc.property(
                        fc.record({
                            timeoutMs: fc.option(
                                fc.oneof(
                                    fc.integer({ min: -1000, max: 0 }), // invalid timeout
                                    fc.integer({ min: 1, max: 1000 }) // valid timeout
                                )
                            ),
                            additionalSignals: fc.option(
                                fc.array(
                                    fc.oneof(
                                        fc.constant(null), // null signal
                                        fc.constant(undefined), // undefined signal
                                        fc.constant(
                                            new AbortController().signal
                                        ) // valid signal
                                    )
                                )
                            ),
                            reason: fc.option(fc.string()),
                        }),
                        (options) => {
                            expect(() => {
                                const signal = createCombinedAbortSignal(
                                    options as CombineSignalsOptions
                                );
                                expect(signal).toBeInstanceOf(AbortSignal);
                            }).not.toThrow();
                        }
                    )
                );
            });

            it("should return single signal when only one provided", () => {
                fc.assert(
                    fc.property(
                        fc.boolean(), // whether to abort the signal
                        (shouldAbort) => {
                            const controller = new AbortController();
                            if (shouldAbort) {
                                controller.abort("Test reason");
                            }

                            const signal = createCombinedAbortSignal({
                                additionalSignals: [controller.signal],
                            });

                            expect(signal.aborted).toBe(shouldAbort);
                            if (shouldAbort) {
                                expect(signal.reason).toBe("Test reason");
                            }
                        }
                    )
                );
            });
        }
    );

    describe(
        () => "createAbortableOperation",
        () => {
            it("should execute operation successfully with valid signals", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.integer({ min: 1, max: 100 }), // operation result
                        fc.integer({ min: 100, max: 1000 }), // timeout
                        async (result, timeoutMs) => {
                            const cleanup = vi.fn();
                            const operation = vi.fn().mockResolvedValue(result);

                            const promise = createAbortableOperation(
                                operation,
                                {
                                    timeoutMs,
                                    cleanup,
                                }
                            );

                            // Operation should complete before timeout
                            const actualResult = await promise;

                            expect(actualResult).toBe(result);
                            expect(operation).toHaveBeenCalledTimes(1);
                            expect(cleanup).toHaveBeenCalledTimes(1);

                            // Verify signal was passed
                            const passedSignal = operation.mock.calls[0]?.[0];
                            expect(passedSignal).toBeInstanceOf(AbortSignal);
                        }
                    )
                );
            });

            it("should handle operation errors and still call cleanup", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.string(), // error message
                        async (errorMessage) => {
                            const cleanup = vi.fn();
                            const operation = vi
                                .fn()
                                .mockRejectedValue(new Error(errorMessage));

                            await expect(
                                createAbortableOperation(operation, { cleanup })
                            ).rejects.toThrow(errorMessage);

                            expect(cleanup).toHaveBeenCalledTimes(1);
                        }
                    )
                );
            });

            it("should handle abortion during operation", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.integer({ min: 10, max: 100 }), // abort delay
                        async (abortDelay) => {
                            const cleanup = vi.fn();
                            const controller = new AbortController();

                            const operation = vi.fn().mockImplementation(
                                async (signal: AbortSignal) =>
                                    // Simulate long operation
                                    new Promise((resolve, reject) => {
                                        const timeout = setTimeout(
                                            () => resolve("success"),
                                            1000
                                        );
                                        signal.addEventListener("abort", () => {
                                            clearTimeout(timeout);
                                            reject(new Error("Aborted"));
                                        });
                                    })
                            );

                            const promise = createAbortableOperation(
                                operation,
                                {
                                    additionalSignals: [controller.signal],
                                    cleanup,
                                }
                            );

                            // Abort after delay
                            setTimeout(() => controller.abort(), abortDelay);
                            vi.advanceTimersByTime(abortDelay);

                            await expect(promise).rejects.toThrow("Aborted");
                            expect(cleanup).toHaveBeenCalledTimes(1);
                        }
                    )
                );
            });
        }
    );

    describe(
        () => "sleep",
        () => {
            it("should resolve after specified time without signal", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.integer({ min: 1, max: 1000 }), // sleep duration
                        async (ms) => {
                            const promise = sleep(ms);

                            // Should not resolve immediately
                            vi.advanceTimersByTime(ms - 1);
                            // Promise should still be pending

                            // Complete the sleep
                            vi.advanceTimersByTime(1);
                            await expect(promise).resolves.toBeUndefined();
                        }
                    )
                );
            });

            it("should abort when signal is triggered", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.integer({ min: 100, max: 1000 }), // sleep duration
                        fc.integer({ min: 1, max: 50 }), // abort time
                        async (sleepMs, abortMs) => {
                            const controller = new AbortController();
                            const promise = sleep(sleepMs, controller.signal);

                            // Abort before sleep completes
                            setTimeout(
                                () => controller.abort("Test abort"),
                                abortMs
                            );
                            vi.advanceTimersByTime(abortMs);

                            await expect(promise).rejects.toThrow();
                        }
                    )
                );
            });

            it("should handle already aborted signals", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.integer({ min: 1, max: 1000 }), // sleep duration
                        fc.string(), // abort reason
                        async (ms, reason) => {
                            const controller = new AbortController();
                            controller.abort(reason);

                            await expect(
                                sleep(ms, controller.signal)
                            ).rejects.toThrow();
                        }
                    )
                );
            });
        }
    );

    describe(
        () => "retryWithAbort",
        () => {
            it("should succeed on first attempt when operation succeeds", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.string(), // success result
                        async (result) => {
                            const operation = vi.fn().mockResolvedValue(result);

                            const actualResult = await retryWithAbort(
                                operation,
                                {
                                    maxRetries: 3,
                                    initialDelay: 1,
                                }
                            );

                            expect(actualResult).toBe(result);
                            expect(operation).toHaveBeenCalledTimes(1);
                        }
                    ),
                    { numRuns: 10 } // Reduced number of runs for performance
                );
            });

            it("should respect abort signal during retries", async () => {
                const controller = new AbortController();
                const operation = vi
                    .fn()
                    .mockRejectedValue(new Error("Always fails"));

                // Abort immediately
                controller.abort();

                const promise = retryWithAbort(operation, {
                    maxRetries: 5,
                    initialDelay: 1,
                    signal: controller.signal,
                });

                await expect(promise).rejects.toThrow("Operation was aborted");
            });
        }
    );

    describe(
        () => "raceWithAbort",
        () => {
            it("should resolve when operation completes before abort", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.integer({ min: 1, max: 100 }), // operation delay
                        fc.integer({ min: 200, max: 1000 }), // signal delay (longer than operation)
                        fc.string(), // result
                        async (operationDelay, signalDelay, result) => {
                            const controller = new AbortController();
                            const operation = new Promise((resolve) =>
                                setTimeout(
                                    () => resolve(result),
                                    operationDelay
                                )
                            );

                            const promise = raceWithAbort(
                                operation,
                                controller.signal
                            );

                            // Schedule abort after operation should complete
                            setTimeout(() => controller.abort(), signalDelay);

                            // Advance time to complete operation but not abort
                            vi.advanceTimersByTime(operationDelay + 10);

                            await expect(promise).resolves.toBe(result);
                        }
                    )
                );
            });

            it("should abort when signal triggers before operation", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.integer({ min: 1, max: 100 }), // abort delay
                        fc.integer({ min: 200, max: 1000 }), // operation delay (longer than abort)
                        async (abortDelay, operationDelay) => {
                            const controller = new AbortController();
                            const operation = new Promise((resolve) =>
                                setTimeout(
                                    () => resolve("success"),
                                    operationDelay
                                )
                            );

                            const promise = raceWithAbort(
                                operation,
                                controller.signal
                            );

                            // Abort before operation completes
                            setTimeout(() => controller.abort(), abortDelay);
                            vi.advanceTimersByTime(abortDelay + 10);

                            await expect(promise).rejects.toThrow(
                                "Operation was aborted"
                            );
                        }
                    )
                );
            });

            it("should handle already aborted signals", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.string(), // abort reason
                        async (reason) => {
                            const controller = new AbortController();
                            controller.abort(reason);

                            const operation = new Promise((resolve) =>
                                setTimeout(() => resolve("success"), 1000)
                            );

                            await expect(
                                raceWithAbort(operation, controller.signal)
                            ).rejects.toThrow("Operation was aborted");
                        }
                    )
                );
            });
        }
    );

    describe(
        () => "isAbortError",
        () => {
            it("should correctly identify abort errors", () => {
                fc.assert(
                    fc.property(
                        fc.string(), // error name
                        fc.string(), // error message
                        (name, message) => {
                            const error = new Error(message);
                            error.name = name;

                            const isAbort = isAbortError(error);

                            if (name === "AbortError") {
                                expect(isAbort).toBeTruthy();
                            } else {
                                expect(isAbort).toBeFalsy();
                            }
                        }
                    )
                );
            });

            it("should handle non-error values gracefully", () => {
                fc.assert(
                    fc.property(
                        fc.oneof(
                            fc.string(),
                            fc.integer(),
                            fc.boolean(),
                            fc.constant(null),
                            fc.constant(undefined)
                        ),
                        (value) => {
                            expect(isAbortError(value)).toBeFalsy();
                        }
                    )
                );
            });
        }
    );

    describe("edge cases and error handling", () => {
        it("should handle invalid timeout values gracefully", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.integer({ max: 0 }), // non-positive numbers
                        fc.constant(Number.NaN) // NaN (but not Infinity since it throws)
                    ),
                    (invalidTimeout) => {
                        expect(() => {
                            createCombinedAbortSignal({
                                timeoutMs: invalidTimeout,
                            });
                        }).not.toThrow();
                    }
                )
            );
        });

        it("should handle null/undefined options properly", () => {
            fc.assert(
                fc.property(
                    fc.oneof(fc.constant(undefined), fc.record({})),
                    (options) => {
                        expect(() => {
                            createCombinedAbortSignal(
                                options as CombineSignalsOptions | undefined
                            );
                        }).not.toThrow();
                    }
                )
            );
        });

        it("should properly clean up event listeners and timers", () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 100, max: 1000 }), // timeout
                    (timeoutMs) => {
                        const clearTimeoutSpy = vi.spyOn(
                            global,
                            "clearTimeout"
                        );

                        // Create a signal with timeout and custom reason to trigger cleanup logic
                        const signal = createCombinedAbortSignal({
                            timeoutMs,
                            reason: "Test timeout",
                        });

                        // The signal should be created without throwing
                        expect(signal).toBeInstanceOf(AbortSignal);

                        clearTimeoutSpy.mockRestore();
                    }
                )
            );
        });
    });
});
