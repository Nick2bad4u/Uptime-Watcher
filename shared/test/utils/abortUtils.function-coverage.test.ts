/**
 * Targeted tests to improve function coverage for abortUtils. Tests specific
 * function paths that might not be covered by fuzzing tests.
 *
 * @packageDocumentation
 */

import { describe, expect, test } from "vitest";
import {
    isAbortError,
    createCombinedAbortSignal,
    raceWithAbort,
} from "../../utils/abortUtils.js";

describe("AbortUtils Function Coverage Tests", () => {
    describe(isAbortError, () => {
        test("should return true for Error with AbortError name", () => {
            const error = new Error("Test error");
            error.name = "AbortError";
            expect(isAbortError(error)).toBeTruthy();
        });

        test("should return true for Error with TimeoutError name", () => {
            const error = new Error("Test error");
            error.name = "TimeoutError";
            expect(isAbortError(error)).toBeTruthy();
        });

        test("should return true for Error with aborted message", () => {
            const error = new Error("Operation was aborted");
            expect(isAbortError(error)).toBeTruthy();
        });

        test("should return true for Error with cancelled message", () => {
            const error = new Error("Request was cancelled");
            expect(isAbortError(error)).toBeTruthy();
        });

        test("should return true for Error with mixed case cancelled message", () => {
            const error = new Error("Request was CANCELLED by user");
            expect(isAbortError(error)).toBeTruthy();
        });

        test("should return true for DOMException with AbortError name", () => {
            const domError = new DOMException("Aborted", "AbortError");
            expect(isAbortError(domError)).toBeTruthy();
        });

        test("should return true for DOMException with TimeoutError name", () => {
            const domError = new DOMException("Timeout", "TimeoutError");
            expect(isAbortError(domError)).toBeTruthy();
        });

        test("should return true for DOMException with aborted message", () => {
            const domError = new DOMException(
                "Operation was aborted",
                "NetworkError"
            );
            expect(isAbortError(domError)).toBeTruthy();
        });

        test("should return true for DOMException with cancelled message", () => {
            const domError = new DOMException(
                "Request cancelled",
                "NetworkError"
            );
            expect(isAbortError(domError)).toBeTruthy();
        });

        test("should return false for regular Error", () => {
            const error = new Error("Regular error");
            expect(isAbortError(error)).toBeFalsy();
        });

        test("should return false for non-Error objects", () => {
            expect(isAbortError("string error")).toBeFalsy();
            expect(isAbortError(null)).toBeFalsy();
            expect(isAbortError(undefined)).toBeFalsy();
            expect(isAbortError(123)).toBeFalsy();
            expect(isAbortError({})).toBeFalsy();
        });
    });

    describe(createCombinedAbortSignal, () => {
        test("should create signal with only timeout", () => {
            const signal = createCombinedAbortSignal({ timeoutMs: 100 });
            expect(signal.aborted).toBeFalsy();
        });

        test("should create signal with empty additional signals array", () => {
            const signal = createCombinedAbortSignal({
                additionalSignals: [],
                timeoutMs: 100,
            });
            expect(signal.aborted).toBeFalsy();
        });

        test("should create signal with no options", () => {
            const signal = createCombinedAbortSignal();
            expect(signal.aborted).toBeFalsy();
        });

        test("should immediately abort if additional signal is already aborted", () => {
            const controller = new AbortController();
            controller.abort();

            const signal = createCombinedAbortSignal({
                additionalSignals: [controller.signal],
            });

            expect(signal.aborted).toBeTruthy();
        });

        test("should handle reason option", () => {
            const signal = createCombinedAbortSignal({
                reason: "Test abort reason",
                timeoutMs: 100,
            });
            expect(signal.aborted).toBeFalsy();
        });
    });

    describe(raceWithAbort, () => {
        test("should resolve with operation result when not aborted", async () => {
            const operation = Promise.resolve("success");
            const controller = new AbortController();

            const result = await raceWithAbort(operation, controller.signal);
            expect(result).toBe("success");
        });

        test("should reject when signal is already aborted", async () => {
            const operation = Promise.resolve("success");
            const controller = new AbortController();
            controller.abort();

            await expect(
                raceWithAbort(operation, controller.signal)
            ).rejects.toThrowError();
        });

        test("should reject when signal aborts during operation", async () => {
            const operation = new Promise((resolve) => {
                setTimeout(() => resolve("success"), 200);
            });
            const controller = new AbortController();

            // Abort after 100ms
            setTimeout(() => controller.abort(), 100);

            await expect(
                raceWithAbort(operation, controller.signal)
            ).rejects.toThrowError();
        });

        test("should handle operation that rejects", async () => {
            const operation = Promise.reject(new Error("operation failed"));
            const controller = new AbortController();

            await expect(
                raceWithAbort(operation, controller.signal)
            ).rejects.toThrowError("operation failed");
        });
    });
});
