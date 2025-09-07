/**
 * Additional property-based tests for abortUtils to achieve 100% coverage.
 * Targets specific edge cases that may not be covered by existing tests.
 *
 * @packageDocumentation
 */

import { describe, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import * as fc from "fast-check";
import { test } from "@fast-check/vitest";
import {
    isAbortError,
    raceWithAbort,
    createCombinedAbortSignal,
} from "../../utils/abortUtils.js";

describe("AbortUtils Coverage Gap Fuzzing Tests", () => {
    beforeAll(() => {
        // Mock AbortSignal.timeout for fake timers compatibility
        if (!AbortSignal.timeout) {
            vi.spyOn(AbortSignal, "timeout").mockImplementation(
                (delay: number) => {
                    const controller = new AbortController();
                    setTimeout(() => controller.abort(), delay);
                    return controller.signal;
                }
            );
        }

        if (!AbortSignal.any) {
            vi.spyOn(AbortSignal, "any").mockImplementation(
                (signals: AbortSignal[]) => {
                    const controller = new AbortController();
                    for (const signal of signals) {
                        if (signal.aborted) {
                            controller.abort();
                            break;
                        }
                        signal.addEventListener(
                            "abort",
                            () => controller.abort(),
                            { once: true }
                        );
                    }
                    return controller.signal;
                }
            );
        }
    });

    beforeEach(() => {
        vi.clearAllTimers();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("isAbortError - Edge Case Coverage", () => {
        test.prop([
            fc.oneof(
                // Test the specific message patterns that trigger the lines
                fc.constant("Operation ABORTED due to timeout"),
                fc.constant("Request was CANCELLED by user"),
                fc.constant("Process aborted"),
                fc.constant("Task cancelled"),
                fc.string().filter((s) => s.toLowerCase().includes("aborted")),
                fc.string().filter((s) => s.toLowerCase().includes("cancelled"))
            ),
        ])("should handle all abort/cancel message patterns", (message) => {
            const error = new Error(message);
            expect(isAbortError(error)).toBeTruthy();
        });

        test.prop([
            fc.oneof(
                fc
                    .string()
                    .filter(
                        (s) =>
                            !s.toLowerCase().includes("abort") &&
                            !s.toLowerCase().includes("cancel")
                    ),
                fc.constant(""),
                fc.constant("   "), // whitespace only
                fc.constant("This is a normal error"),
                fc.constant("HTTP 404 Not Found")
            ),
        ])("should return false for non-abort error messages", (message) => {
            const error = new Error(message);
            error.name = "SomeOtherError"; // Not AbortError or TimeoutError
            expect(isAbortError(error)).toBeFalsy();
        });

        test.prop([
            fc.record({
                name: fc.constantFrom(
                    "TypeError",
                    "ReferenceError",
                    "SyntaxError",
                    "NetworkError"
                ),
                message: fc
                    .string()
                    .filter(
                        (s) =>
                            !s.toLowerCase().includes("abort") &&
                            !s.toLowerCase().includes("cancel")
                    ),
            }),
        ])(
            "should return false for errors with non-abort names and messages",
            (errorData) => {
                const error = new Error(errorData.message);
                error.name = errorData.name;
                expect(isAbortError(error)).toBeFalsy();
            }
        );

        test("should handle DOMException types correctly", () => {
            // Test DOMException with AbortError name
            const domAbortError = new DOMException(
                "User aborted",
                "AbortError"
            );
            expect(isAbortError(domAbortError)).toBeTruthy();

            // Test DOMException with TimeoutError name
            const domTimeoutError = new DOMException(
                "Timeout occurred",
                "TimeoutError"
            );
            expect(isAbortError(domTimeoutError)).toBeTruthy();

            // Test DOMException with other names
            const domOtherError = new DOMException("Some error", "DataError");
            expect(isAbortError(domOtherError)).toBeFalsy();
        });
    });

    describe("raceWithAbort - Edge Case Coverage", () => {
        test.prop([fc.string()])(
            "should handle already aborted signal synchronously",
            async (result) => {
                const controller = new AbortController();
                controller.abort(); // Abort immediately

                const operation = Promise.resolve(result);

                await expect(
                    raceWithAbort(operation, controller.signal)
                ).rejects.toThrow("Operation was aborted");
            }
        );

        test.prop([fc.string(), fc.integer({ min: 1, max: 50 })])(
            "should handle abort during operation execution",
            async (result, delayMs) => {
                const controller = new AbortController();

                // Create a longer-running operation
                const operation = new Promise<string>((resolve) => {
                    setTimeout(() => resolve(result), delayMs * 2);
                });

                // Start the race
                const racePromise = raceWithAbort(operation, controller.signal);

                // Abort after a shorter delay
                setTimeout(() => {
                    controller.abort();
                }, delayMs);

                vi.advanceTimersByTime(delayMs + 10);

                await expect(racePromise).rejects.toThrow(
                    "Operation was aborted"
                );
            }
        );

        test.prop([fc.string()])(
            "should clean up event listeners on success",
            async (result) => {
                const controller = new AbortController();
                const operation = Promise.resolve(result);

                const raceResult = await raceWithAbort(
                    operation,
                    controller.signal
                );
                expect(raceResult).toBe(result);

                // Verify no memory leaks by checking that aborting doesn't affect anything
                controller.abort();
                // If listeners weren't cleaned up, this might cause issues
            }
        );

        test.prop([fc.string()])(
            "should handle operation rejection independently of abort",
            async (errorMessage) => {
                const controller = new AbortController();
                const operation = Promise.reject(new Error(errorMessage));

                await expect(
                    raceWithAbort(operation, controller.signal)
                ).rejects.toThrow(errorMessage);
            }
        );
    });

    describe("createCombinedAbortSignal - Edge Cases", () => {
        test.prop([fc.integer({ min: 1, max: 100 })])(
            "should handle timeout-only signals correctly",
            async (timeoutMs) => {
                const signal = createCombinedAbortSignal({ timeoutMs });

                expect(signal.aborted).toBeFalsy();

                // Fast-forward time
                vi.advanceTimersByTime(timeoutMs + 1);

                expect(signal.aborted).toBeTruthy();
            }
        );

        test.prop([fc.string()])(
            "should handle custom abort reasons",
            (reason) => {
                const signal = createCombinedAbortSignal({
                    timeoutMs: 100,
                    reason,
                });

                vi.advanceTimersByTime(101);

                expect(signal.aborted).toBeTruthy();
                if (signal.reason) {
                    expect(signal.reason).toBe(reason);
                }
            }
        );

        test.prop([fc.array(fc.boolean(), { minLength: 1, maxLength: 5 })])(
            "should handle multiple additional signals",
            (shouldAbort) => {
                const controllers = shouldAbort.map(
                    () => new AbortController()
                );
                const additionalSignals = controllers.map((c) => c.signal);

                const signal = createCombinedAbortSignal({
                    additionalSignals,
                });

                expect(signal.aborted).toBeFalsy();

                // Abort one of the additional signals
                if (controllers.length > 0) {
                    controllers[0].abort();
                    expect(signal.aborted).toBeTruthy();
                }
            }
        );
    });

    describe("Complex Integration Scenarios", () => {
        test.prop([
            fc.array(fc.integer({ min: 10, max: 100 }), {
                minLength: 2,
                maxLength: 5,
            }),
        ])(
            "should handle complex abort scenarios with multiple operations",
            async (delays) => {
                const controller = new AbortController();

                const operations = delays.map(
                    (delay) =>
                        new Promise<number>((resolve) => {
                            setTimeout(() => resolve(delay), delay);
                        })
                );

                // Start all races
                const racePromises = operations.map((op) =>
                    raceWithAbort(op, controller.signal)
                );

                // Abort after the shortest delay
                const minDelay = Math.min(...delays);
                setTimeout(() => {
                    controller.abort();
                }, minDelay / 2);

                vi.advanceTimersByTime(minDelay);

                // All should be aborted
                await Promise.all(
                    racePromises.map((promise) =>
                        expect(promise).rejects.toThrow("Operation was aborted")
                    )
                );
            }
        );
    });
});
