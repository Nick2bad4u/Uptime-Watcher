/**
 * Targeted tests to improve function coverage for abortUtils. Tests specific
 * function paths that might not be covered by fuzzing tests.
 *
 * @packageDocumentation
 */

import { describe, expect, test } from "vitest";

import {
    createCombinedAbortSignal,
    getAbortSignalReason,
    isAbortError,
    raceWithAbort,
    retryWithAbort,
} from "../../utils/abortUtils.js";

class SpyAbortSignal {
    public aborted = false;

    public readonly addCalls: {
        readonly listener: EventListenerOrEventListenerObject;
        readonly type: string;
    }[] = [];

    public readonly removeCalls: {
        readonly listener: EventListenerOrEventListenerObject;
        readonly type: string;
    }[] = [];

    private readonly abortListeners =
        new Set<EventListenerOrEventListenerObject>();

    public addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject
    ): void {
        this.addCalls.push({ type, listener });
        if (type === "abort") {
            this.abortListeners.add(listener);
        }
    }

    public removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject
    ): void {
        this.removeCalls.push({ type, listener });
        if (type === "abort") {
            this.abortListeners.delete(listener);
        }
    }

    public dispatchAbort(): void {
        this.aborted = true;
        for (const listener of this.abortListeners) {
            if (typeof listener === "function") {
                // RaceWithAbort registers a zero-arg handler.
                (listener as () => void)();
            } else {
                listener.handleEvent(undefined as never);
            }
        }
    }

    public getAbortListenerCount(): number {
        return this.abortListeners.size;
    }
}

describe("AbortUtils Function Coverage Tests", () => {
    describe(getAbortSignalReason, () => {
        test("should return native AbortSignal reasons", () => {
            const controller = new AbortController();
            const reason = new Error("native reason");
            controller.abort(reason);

            expect(getAbortSignalReason(controller.signal)).toBe(reason);
        });

        test("should not invoke reason accessors on signal-shaped objects", () => {
            let getterCalls = 0;
            const signal = {
                aborted: true,
                get reason() {
                    getterCalls += 1;
                    throw new Error("reason getter should not run");
                },
            };

            expect(
                getAbortSignalReason(signal as unknown as AbortSignal)
            ).toBeUndefined();
            expect(getterCalls).toBe(0);
        });
    });

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

        test("should return true for Error with canceled message", () => {
            const error = new Error("Request was canceled");
            expect(isAbortError(error)).toBeTruthy();
        });

        test("should return true for Error with ERR_CANCELED code", () => {
            const error = new Error("Request canceled");
            Reflect.set(error, "code", "ERR_CANCELED");
            expect(isAbortError(error)).toBeTruthy();
        });

        test("should not invoke Error code accessors", () => {
            let getterCalls = 0;
            const error = new Error("Regular error");
            Object.defineProperty(error, "code", {
                enumerable: true,
                get() {
                    getterCalls += 1;
                    throw new Error("code getter should not run");
                },
            });

            expect(isAbortError(error)).toBeFalsy();
            expect(getterCalls).toBe(0);
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

    describe(retryWithAbort, () => {
        test("should not invoke thrown object toString when retries are exhausted", async () => {
            let toStringCalls = 0;
            const thrown = {
                toString: () => {
                    toStringCalls += 1;
                    throw new Error("toString should not run");
                },
            };

            await expect(
                retryWithAbort(() => Promise.reject(thrown), {
                    maxRetries: 0,
                })
            ).rejects.toMatchObject({
                cause: thrown,
                message: "[non-error thrown object]",
            });

            expect(toStringCalls).toBe(0);
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
            ).rejects.toThrow();
        });

        test("should reject when signal aborts during operation", async () => {
            const operation = new Promise((resolve) => {
                setTimeout(() => {
                    resolve("success");
                }, 200);
            });
            const controller = new AbortController();

            // Abort after 100ms
            setTimeout(() => {
                controller.abort();
            }, 100);

            await expect(
                raceWithAbort(operation, controller.signal)
            ).rejects.toThrow();
        });

        test("should handle operation that rejects", async () => {
            const operation = Promise.reject(new Error("operation failed"));
            const controller = new AbortController();

            await expect(
                raceWithAbort(operation, controller.signal)
            ).rejects.toThrow("operation failed");
        });

        test("should not invoke rejection object toString", async () => {
            let toStringCalls = 0;
            const reason = {
                toString: () => {
                    toStringCalls += 1;
                    throw new Error("toString should not run");
                },
            };
            const controller = new AbortController();

            await expect(
                raceWithAbort(Promise.reject(reason), controller.signal)
            ).rejects.toMatchObject({
                cause: reason,
                message: "[non-error thrown object]",
            });

            expect(toStringCalls).toBe(0);
        });

        test("should remove abort listener when operation resolves", async () => {
            const signal = new SpyAbortSignal();
            const result = await raceWithAbort(
                Promise.resolve("ok"),
                signal as unknown as AbortSignal
            );

            expect(result).toBe("ok");
            expect(signal.getAbortListenerCount()).toBe(0);
            expect(
                signal.addCalls.filter((call) => call.type === "abort")
            ).toHaveLength(1);
            expect(
                signal.removeCalls.filter((call) => call.type === "abort")
            ).toHaveLength(1);
        });

        test("should remove abort listener when operation rejects", async () => {
            const signal = new SpyAbortSignal();

            await expect(
                raceWithAbort(
                    Promise.reject(new Error("boom")),
                    signal as unknown as AbortSignal
                )
            ).rejects.toThrow("boom");

            expect(signal.getAbortListenerCount()).toBe(0);
            expect(
                signal.addCalls.filter((call) => call.type === "abort")
            ).toHaveLength(1);
            expect(
                signal.removeCalls.filter((call) => call.type === "abort")
            ).toHaveLength(1);
        });

        test("should remove abort listener when aborted", async () => {
            const signal = new SpyAbortSignal();
            const pending = new Promise<string>(() => {
                // Intentionally never resolves
            });

            const promise = raceWithAbort(
                pending,
                signal as unknown as AbortSignal
            );

            signal.dispatchAbort();

            await expect(promise).rejects.toThrow("Operation was aborted");
            expect(signal.getAbortListenerCount()).toBe(0);
            expect(
                signal.addCalls.filter((call) => call.type === "abort")
            ).toHaveLength(1);
            expect(
                signal.removeCalls.filter((call) => call.type === "abort")
            ).toHaveLength(1);
        });

        test("should not attach abort listener when already aborted", async () => {
            const signal = new SpyAbortSignal();
            signal.aborted = true;

            await expect(
                raceWithAbort(
                    Promise.resolve("ok"),
                    signal as unknown as AbortSignal
                )
            ).rejects.toThrow("Operation was aborted");

            expect(signal.getAbortListenerCount()).toBe(0);
            expect(
                signal.addCalls.filter((call) => call.type === "abort")
            ).toHaveLength(0);
            expect(
                signal.removeCalls.filter((call) => call.type === "abort")
            ).toHaveLength(0);
        });
    });
});
