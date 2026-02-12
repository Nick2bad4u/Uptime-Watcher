/**
 * Targeted tests for the {@link raceWithTimeout} helper.
 */

import { afterEach, describe, expect, it, vi } from "vitest";

import { isAbortError, raceWithTimeout } from "../../utils/abortUtils.js";

describe("shared/utils/abortUtils - raceWithTimeout", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("resolves when the operation finishes before the timeout", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: abortUtils", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Timeout", "type");

        vi.useFakeTimers();

        const operation = new Promise<string>((resolve) => {
            setTimeout(() => {
                resolve("ok");
            }, 50);
        });

        const promise = raceWithTimeout(operation, {
            timeoutMs: 100,
            timeoutMessage: "should not time out",
            unrefTimer: true,
        });

        await vi.advanceTimersByTimeAsync(50);
        await expect(promise).resolves.toBe("ok");
    });

    it("rejects with the timeout error when the timeout elapses first", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: abortUtils", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Timeout", "type");

        vi.useFakeTimers();

        const operation = new Promise<string>(() => {
            // Intentionally never resolves.
        });

        const promise = raceWithTimeout(operation, {
            timeoutMs: 25,
            timeoutMessage: "timed out",
            unrefTimer: true,
        });

        const rejectionExpectation = promise.then(
            () => {
                throw new Error(
                    "Expected raceWithTimeout to reject on timeout"
                );
            },
            (error: unknown) => {
                expect(error).toBeInstanceOf(Error);
                expect((error as Error).message).toMatch(/timed out/i);
            }
        );
        await vi.advanceTimersByTimeAsync(25);
        await rejectionExpectation;
    });

    it("rejects with an abort error when the abort signal fires first", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: abortUtils", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Abort", "type");

        vi.useFakeTimers();

        const controller = new AbortController();
        const operation = new Promise<string>(() => {
            // Intentionally never resolves.
        });

        const promise = raceWithTimeout(operation, {
            timeoutMs: 1000,
            signal: controller.signal,
        });

        const rejectionExpectation = promise.then(
            () => {
                throw new Error("Expected raceWithTimeout to reject on abort");
            },
            (error: unknown) => {
                expect(isAbortError(error)).toBeTruthy();
            }
        );

        controller.abort(new Error("stop"));

        await rejectionExpectation;
    });
});
