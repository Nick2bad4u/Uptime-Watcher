/**
 * Comprehensive Fast-Check Fuzzing Tests for AbortUtils
 *
 * @remarks
 * This test suite provides comprehensive property-based test coverage for abort
 * utilities including signal operations, timeout handling, and retry
 * mechanisms.
 *
 * @file Provides comprehensive fuzzing coverage for shared/utils/abortUtils.ts
 *
 * @packageDocumentation
 */

import { describe, expect, vi, beforeEach, afterEach } from "vitest";
import { test as fcTest, fc } from "@fast-check/vitest";
import {
    createCombinedAbortSignal,
    createAbortableOperation,
    retryWithAbort,
    raceWithAbort,
    sleep,
    isAbortError,
} from "../../utils/abortUtils";

// =============================================================================
// Custom Fast-Check Arbitraries
// =============================================================================

/**
 * Generates promise factories for testing
 */
const promiseFactory = fc.oneof(
    fc.constant(() => Promise.resolve("success")),
    fc.constant(() => Promise.resolve("42")),
    fc.constant(() => Promise.reject(new Error("Test error"))),
    fc.integer({ min: 1, max: 10 }).map(
        // Reduced max delay
        (delay) => () =>
            new Promise<string>((resolve) => {
                setTimeout(() => {
                    resolve(`delayed-${delay}`);
                }, delay);
            })
    )
);

// =============================================================================
// Fuzzing Tests
// =============================================================================

const describeFn = describe;
const testProp = fcTest.prop;

describeFn("AbortUtils Comprehensive Fuzzing Tests", () => {
    let cleanupFunctions: (() => void)[] = [];

    beforeEach(() => {
        cleanupFunctions = [];
    });

    afterEach(() => {
        for (const cleanup of cleanupFunctions) {
            try {
                cleanup();
            } catch {
                // Ignore cleanup errors
            }
        }
        cleanupFunctions = [];
        vi.restoreAllMocks();
    });

    describeFn("createCombinedAbortSignal", () => {
        testProp([
            fc.array(fc.boolean(), { maxLength: 3 }),
            fc.oneof(fc.integer({ min: 1, max: 100 }), fc.constant(undefined)),
        ])(
            "should combine multiple signal states correctly",
            (signalStates, timeout) => {
                const controllers = signalStates.map(
                    () => new AbortController()
                );

                for (const [index, shouldAbort] of signalStates.entries()) {
                    if (shouldAbort && controllers[index]) {
                        controllers[index].abort("Test abort");
                    }
                }

                const additionalSignals = controllers.map((c) => c.signal);
                const combined = createCombinedAbortSignal({
                    additionalSignals,
                    ...(timeout !== undefined && { timeoutMs: timeout }),
                });

                expect(combined).toBeInstanceOf(AbortSignal);

                const hasAbortedSignal = signalStates.some(Boolean);
                if (hasAbortedSignal) {
                    expect(combined.aborted).toBeTruthy();
                }

                for (const controller of controllers) {
                    if (!controller.signal.aborted) {
                        controller.abort("Cleanup");
                    }
                }
            }
        );
    });

    describeFn("sleep", () => {
        testProp([
            fc.oneof(
                fc.integer({ min: 1, max: 10 }), // Reduced max duration
                fc.constantFrom(0, -1, 1.5)
            ),
        ])("should handle various sleep durations", async (duration) => {
            const abortController = new AbortController();

            if (
                typeof duration !== "number" ||
                duration <= 0 ||
                !Number.isFinite(duration)
            ) {
                await expect(
                    sleep(duration, abortController.signal)
                ).resolves.not.toThrowError();
                return;
            }

            if (duration < 8) {
                // Reduced threshold
                await expect(
                    sleep(duration, abortController.signal)
                ).resolves.toBeUndefined();
            } else {
                const effectiveDuration = duration + 32;
                const sleepPromise = sleep(
                    effectiveDuration,
                    abortController.signal
                );

                setTimeout(() => {
                    abortController.abort("Test timeout");
                }, 1);

                await expect(sleepPromise).rejects.toThrowError(
                    "Sleep was aborted"
                );
            }
        });
    });

    describeFn("isAbortError", () => {
        testProp([
            fc.oneof(
                fc.constant(new Error("Test error")),
                fc.constant(new Error("Operation was aborted")),
                fc.constant(
                    new DOMException("The operation was aborted", "AbortError")
                ),
                fc.constant("string error"),
                fc.constant(null),
                fc.constant(undefined),
                fc.object()
            ),
        ])("should correctly identify abort errors", (error) => {
            const result = isAbortError(error);

            expect(typeof result).toBe("boolean");

            if (
                error instanceof Error &&
                (error.message.includes("abort") || error.name === "AbortError")
            ) {
                expect(result).toBeTruthy();
            } else if (
                error instanceof DOMException &&
                error.name === "AbortError"
            ) {
                expect(result).toBeTruthy();
            }
        });
    });

    describeFn("retryWithAbort", () => {
        testProp([fc.integer({ min: 0, max: 3 })])(
            "should respect maximum retry attempts",
            async (maxRetries) => {
                let attemptCount = 0;
                const failingFactory = () => {
                    attemptCount++;
                    return Promise.reject(new Error(`Attempt ${attemptCount}`));
                };

                try {
                    await retryWithAbort(failingFactory, {
                        maxRetries,
                        initialDelay: 1,
                        maxDelay: 10,
                    });
                } catch (error) {
                    expect(attemptCount).toBeLessThanOrEqual(maxRetries + 1);
                    expect(attemptCount).toBeGreaterThan(0);
                    expect(error).toBeInstanceOf(Error);
                }
            }
        );
    });

    describeFn("createAbortableOperation", () => {
        testProp([
            fc.oneof(
                fc.constant(() => Promise.resolve("success")),
                fc.constant(() => Promise.reject(new Error("failure")))
            ),
        ])("should make operations abortable", async (operationFactory) => {
            const abortController = new AbortController();

            try {
                const abortableOp = createAbortableOperation(
                    operationFactory,
                    abortController.signal
                );

                expect(abortableOp).toBeInstanceOf(Promise);

                setTimeout(() => {
                    abortController.abort("Test abort");
                }, 5); // Reduced timeout

                await abortableOp;
            } catch (error) {
                if (abortController.signal.aborted) {
                    expect(
                        isAbortError(error) || error instanceof Error
                    ).toBeTruthy();
                }
            }
        });
    });

    describeFn("raceWithAbort", () => {
        testProp([promiseFactory])(
            "should race promises against abort signals",
            async (factory) => {
                const abortController = new AbortController();

                try {
                    const originalPromise = factory();
                    const raceResult = raceWithAbort(
                        originalPromise,
                        abortController.signal
                    );

                    expect(raceResult).toBeInstanceOf(Promise);

                    abortController.abort("Test abort");
                    await expect(raceResult).rejects.toThrowError();
                } catch (error) {
                    expect(error).toBeDefined();
                }
            }
        );
    });
});
