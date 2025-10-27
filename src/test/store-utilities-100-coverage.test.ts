/**
 * Comprehensive coverage tests for store utilities and common patterns.
 *
 * @remarks
 * This test suite targets store utilities, constants, and other areas that
 * commonly have coverage gaps to ensure 100% code coverage.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Import utilities and constants
import { createBaseStore, debounce, logStoreAction } from "../stores/utils";
import { TRANSITION_ALL } from "../constants";

// Mock logger and environment
vi.mock("../services/logger", () => {
    const mockLogger = {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
    };

    return {
        logger: mockLogger,
        Logger: mockLogger,
    };
});

vi.mock("@shared/utils/environment", () => ({
    isDevelopment: vi.fn(() => true),
}));

describe("Store Utilities 100% Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe(createBaseStore, () => {
        it("should create base store with proper initial values", () => {
            const setState = vi.fn();
            const baseStore = createBaseStore(setState);

            expect(baseStore).toEqual({
                clearError: expect.any(Function),
                isLoading: false,
                lastError: undefined,
                setError: expect.any(Function),
                setLoading: expect.any(Function),
            });
        });

        it("should clear error when clearError is called", () => {
            const setState = vi.fn();
            const baseStore = createBaseStore(setState);

            baseStore.clearError();

            expect(setState).toHaveBeenCalledWith({ lastError: undefined });
        });

        it("should set error when setError is called", () => {
            const setState = vi.fn();
            const baseStore = createBaseStore(setState);

            baseStore.setError("Test error");

            expect(setState).toHaveBeenCalledWith({ lastError: "Test error" });
        });

        it("should set loading state when setLoading is called", () => {
            const setState = vi.fn();
            const baseStore = createBaseStore(setState);

            baseStore.setLoading(true);

            expect(setState).toHaveBeenCalledWith({ isLoading: true });
        });

        it("should handle error messages in setError", () => {
            const setState = vi.fn();
            const baseStore = createBaseStore(setState);

            baseStore.setError("Test error message");

            expect(setState).toHaveBeenCalledWith({
                lastError: "Test error message",
            });
        });

        it("should handle undefined in setError", () => {
            const setState = vi.fn();
            const baseStore = createBaseStore(setState);

            baseStore.setError(undefined);

            expect(setState).toHaveBeenCalledWith({ lastError: undefined });
        });
    });

    describe(debounce, () => {
        it("should debounce function calls per argument set", () => {
            const mockFunction = vi.fn();
            const debouncedFunction = debounce(mockFunction, 100);

            // Call multiple times rapidly with different arguments
            debouncedFunction("arg1");
            debouncedFunction("arg2");
            debouncedFunction("arg3");

            // Function should not be called yet
            expect(mockFunction).not.toHaveBeenCalled();

            // Fast forward time
            vi.advanceTimersByTime(100);

            // Function should be called once for each unique argument set
            expect(mockFunction).toHaveBeenCalledTimes(3);
            expect(mockFunction).toHaveBeenNthCalledWith(1, "arg1");
            expect(mockFunction).toHaveBeenNthCalledWith(2, "arg2");
            expect(mockFunction).toHaveBeenNthCalledWith(3, "arg3");
        });

        it("should handle multiple debounce cycles", () => {
            const mockFunction = vi.fn();
            const debouncedFunction = debounce(mockFunction, 50);

            // First cycle
            debouncedFunction("first");
            vi.advanceTimersByTime(50);
            expect(mockFunction).toHaveBeenCalledWith("first");

            // Second cycle
            debouncedFunction("second");
            vi.advanceTimersByTime(50);
            expect(mockFunction).toHaveBeenCalledWith("second");

            expect(mockFunction).toHaveBeenCalledTimes(2);
        });

        it("should reset timer on subsequent calls with same arguments", () => {
            const mockFunction = vi.fn();
            const debouncedFunction = debounce(mockFunction, 100);

            debouncedFunction("same");
            vi.advanceTimersByTime(50);

            // Call again with same arguments before timer expires
            debouncedFunction("same");
            vi.advanceTimersByTime(50);

            // Function should not be called yet (timer was reset)
            expect(mockFunction).not.toHaveBeenCalled();

            // Wait for the full delay from the second call
            vi.advanceTimersByTime(50);

            expect(mockFunction).toHaveBeenCalledTimes(1);
            expect(mockFunction).toHaveBeenCalledWith("same");
        });

        it("should handle zero delay", () => {
            const mockFunction = vi.fn();
            const debouncedFunction = debounce(mockFunction, 0);

            debouncedFunction("test");
            vi.advanceTimersByTime(0);

            expect(mockFunction).toHaveBeenCalledWith("test");
        });

        it("should handle negative delay", () => {
            const mockFunction = vi.fn();
            const debouncedFunction = debounce(mockFunction, -10);

            debouncedFunction("test");
            vi.advanceTimersByTime(0);

            expect(mockFunction).toHaveBeenCalledWith("test");
        });

        it("should handle function with no arguments", () => {
            const mockFunction = vi.fn();
            const debouncedFunction = debounce(mockFunction, 50);

            debouncedFunction();
            vi.advanceTimersByTime(50);

            expect(mockFunction).toHaveBeenCalledWith();
        });

        it("should handle function with multiple arguments", () => {
            const mockFunction = vi.fn();
            const debouncedFunction = debounce(mockFunction, 50);

            debouncedFunction("arg1", "arg2", "arg3", 123, true);
            vi.advanceTimersByTime(50);

            expect(mockFunction).toHaveBeenCalledWith(
                "arg1",
                "arg2",
                "arg3",
                123,
                true
            );
        });

        it("should preserve this context", () => {
            const obj = {
                value: "test",
                method: vi.fn(function (this: any) {
                    return this.value;
                }),
            };

            const debouncedMethod = debounce(obj.method.bind(obj), 50);

            debouncedMethod();
            vi.advanceTimersByTime(50);

            expect(obj.method).toHaveBeenCalled();
        });
    });

    describe(logStoreAction, () => {
        it("should log store action in development", async () => {
            const { isDevelopment } = await import("@shared/utils/environment");
            const { logger } = await import("../services/logger");

            vi.mocked(isDevelopment).mockReturnValue(true);

            logStoreAction("TestStore", "testAction", { data: "test" });

            expect(logger.info).toHaveBeenCalledWith("[TestStore] testAction", {
                data: "test",
            });
        });

        it("should not log store action in production", async () => {
            const { isDevelopment } = await import("@shared/utils/environment");
            const { logger } = await import("../services/logger");

            vi.mocked(isDevelopment).mockReturnValue(false);

            logStoreAction("TestStore", "testAction", { data: "test" });

            expect(logger.info).not.toHaveBeenCalled();
        });

        it("should handle undefined payload", async () => {
            const { isDevelopment } = await import("@shared/utils/environment");
            const { logger } = await import("../services/logger");

            vi.mocked(isDevelopment).mockReturnValue(true);

            logStoreAction("TestStore", "testAction");

            expect(logger.info).toHaveBeenCalledWith("[TestStore] testAction");
        });

        it("should handle null payload", async () => {
            const { isDevelopment } = await import("@shared/utils/environment");
            const { logger } = await import("../services/logger");

            vi.mocked(isDevelopment).mockReturnValue(true);

            logStoreAction("TestStore", "testAction", null);

            expect(logger.info).toHaveBeenCalledWith(
                "[TestStore] testAction",
                null
            );
        });
    });

    it("should handle complex payload objects", async () => {
        const { isDevelopment } = await import("@shared/utils/environment");
        const { logger } = await import("../services/logger");

        vi.mocked(isDevelopment).mockReturnValue(true);

        const complexPayload = {
            nested: {
                deep: {
                    value: "test",
                },
            },
            array: [
                1,
                2,
                3,
            ],
            boolean: true,
            number: 42,
            nullValue: null,
            undefinedValue: undefined,
        };

        logStoreAction("TestStore", "testAction", complexPayload);

        expect(logger.info).toHaveBeenCalledWith(
            "[TestStore] testAction",
            complexPayload
        );
    });

    it("should handle empty string action names", async () => {
        const { isDevelopment } = await import("@shared/utils/environment");
        const { logger } = await import("../services/logger");

        vi.mocked(isDevelopment).mockReturnValue(true);

        logStoreAction("TestStore", "", { data: "test" });

        expect(logger.info).toHaveBeenCalledWith("[TestStore] ", {
            data: "test",
        });
    });

    it("should handle empty string store names", async () => {
        const { isDevelopment } = await import("@shared/utils/environment");
        const { logger } = await import("../services/logger");

        vi.mocked(isDevelopment).mockReturnValue(true);

        logStoreAction("", "testAction", { data: "test" });

        expect(logger.info).toHaveBeenCalledWith("[] testAction", {
            data: "test",
        });
    });
});

describe("Constants", () => {
    it("should export TRANSITION_ALL constant", () => {
        expect(TRANSITION_ALL).toBe("all 0.2s ease-in-out");
        expect(typeof TRANSITION_ALL).toBe("string");
    });

    it("should use TRANSITION_ALL in CSS-like context", () => {
        const style = {
            transition: TRANSITION_ALL,
            opacity: 1,
        };

        expect(style.transition).toBe("all 0.2s ease-in-out");
    });
});

describe("Integration Tests", () => {
    it("should work with createBaseStore and debounce together", () => {
        vi.useFakeTimers();
        const setState = vi.fn();
        const baseStore = createBaseStore(setState);

        const debouncedSetError = debounce(baseStore.setError, 100);

        debouncedSetError("error1");
        debouncedSetError("error2");
        debouncedSetError("error3");

        expect(setState).not.toHaveBeenCalled();

        vi.advanceTimersByTime(100);

        // Each unique error message creates a separate debounced call
        expect(setState).toHaveBeenCalledTimes(3);
        expect(setState).toHaveBeenNthCalledWith(1, { lastError: "error1" });
        expect(setState).toHaveBeenNthCalledWith(2, { lastError: "error2" });
        expect(setState).toHaveBeenNthCalledWith(3, { lastError: "error3" });
        vi.useRealTimers();
    });

    it("should handle rapid store actions with logging", async () => {
        const { isDevelopment } = await import("@shared/utils/environment");
        const { logger } = await import("../services/logger");

        vi.mocked(isDevelopment).mockReturnValue(true);
        vi.mocked(logger.info).mockClear(); // Clear any previous calls

        const actions = [
            { store: "Store1", action: "action1", payload: { id: 1 } },
            { store: "Store2", action: "action2", payload: { id: 2 } },
            { store: "Store1", action: "action3", payload: { id: 3 } },
        ];

        for (const { store, action, payload } of actions) {
            logStoreAction(store, action, payload);
        }

        expect(logger.info).toHaveBeenCalledTimes(3);
        expect(logger.info).toHaveBeenNthCalledWith(1, "[Store1] action1", {
            id: 1,
        });
        expect(logger.info).toHaveBeenNthCalledWith(2, "[Store2] action2", {
            id: 2,
        });
        expect(logger.info).toHaveBeenNthCalledWith(3, "[Store1] action3", {
            id: 3,
        });
    });

    it("should handle debounced logging", async () => {
        vi.useFakeTimers();
        const { isDevelopment } = await import("@shared/utils/environment");
        const { logger } = await import("../services/logger");

        vi.mocked(isDevelopment).mockReturnValue(true);
        vi.mocked(logger.info).mockClear(); // Clear any previous calls

        const debouncedLog = debounce(
            (store: string, action: string, payload: any) => {
                logStoreAction(store, action, payload);
            },
            50
        );

        debouncedLog("TestStore", "action1", { id: 1 });
        debouncedLog("TestStore", "action2", { id: 2 });
        debouncedLog("TestStore", "action3", { id: 3 });

        expect(logger.info).not.toHaveBeenCalled();

        vi.advanceTimersByTime(50);

        // Each unique argument set creates a separate debounced call
        expect(logger.info).toHaveBeenCalledTimes(3);
        expect(logger.info).toHaveBeenNthCalledWith(1, "[TestStore] action1", {
            id: 1,
        });
        expect(logger.info).toHaveBeenNthCalledWith(2, "[TestStore] action2", {
            id: 2,
        });
        expect(logger.info).toHaveBeenNthCalledWith(3, "[TestStore] action3", {
            id: 3,
        });
        vi.useRealTimers();
    });
});

describe("Edge Cases and Error Conditions", () => {
    it("should handle createBaseStore with null setState", () => {
        // The function doesn't validate input, so it won't throw
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Conflicting benchmark typecheck
        // @ts-ignore Testing error condition - intentionally passing null
        const result = createBaseStore(null);
        expect(result).toHaveProperty("clearError");
        expect(result).toHaveProperty("setError");
        expect(result).toHaveProperty("setLoading");
    });

    it("should handle debounce with null function", () => {
        // The function doesn't validate input, so it won't throw immediately
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Conflicting benchmark typecheck
        // @ts-ignore Testing error condition - intentionally passing null
        const result = debounce(null, 100);
        expect(typeof result).toBe("function");
    });

    it("should handle very large debounce delays", () => {
        vi.useFakeTimers();
        const mockFunction = vi.fn();
        const debouncedFunction = debounce(mockFunction, 999_999);

        debouncedFunction("test");
        vi.advanceTimersByTime(999_999);

        expect(mockFunction).toHaveBeenCalledWith("test");
        vi.useRealTimers();
    });

    it("should handle rapid successive debounce calls", () => {
        vi.useFakeTimers();
        const mockFunction = vi.fn();
        const debouncedFunction = debounce(mockFunction, 100);

        // Call 1000 times rapidly
        for (let i = 0; i < 1000; i++) {
            debouncedFunction(`call-${i}`);
        }

        vi.advanceTimersByTime(100);

        expect(mockFunction).toHaveBeenCalledTimes(1000);
        expect(mockFunction).toHaveBeenNthCalledWith(1000, "call-999");
        vi.useRealTimers();
    });

    it("should handle store actions with special characters", async () => {
        const { isDevelopment } = await import("@shared/utils/environment");
        const { logger } = await import("../services/logger");

        vi.mocked(isDevelopment).mockReturnValue(true);

        logStoreAction("Store@#$%", "action!@#$%^&*()", {
            "key with spaces": "value",
            "unicode-🚀": "rocket",
        });

        expect(logger.info).toHaveBeenCalledWith(
            "[Store@#$%] action!@#$%^&*()",
            {
                "key with spaces": "value",
                "unicode-🚀": "rocket",
            }
        );
    });
});
