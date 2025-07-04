/**
 * Test suite for store utils
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createBaseStore, withErrorHandling, createPersistConfig, debounce, logStoreAction } from "../stores/utils";
import type { BaseStore } from "../stores/types";

describe("Store Utils", () => {
    describe("createBaseStore", () => {
        it("should create a base store slice with proper methods", () => {
            const mockSet = vi.fn();
            const baseStore = createBaseStore(mockSet);

            expect(baseStore).toHaveProperty("clearError");
            expect(baseStore).toHaveProperty("isLoading");
            expect(baseStore).toHaveProperty("lastError");
            expect(baseStore).toHaveProperty("setError");
            expect(baseStore).toHaveProperty("setLoading");
            expect(baseStore.isLoading).toBe(false);
            expect(baseStore.lastError).toBeUndefined();
        });

        it("should call set with correct parameters when setError is called", () => {
            const mockSet = vi.fn();
            const baseStore = createBaseStore(mockSet);

            baseStore.setError("Test error");
            expect(mockSet).toHaveBeenCalledWith({ lastError: "Test error" });
        });

        it("should call set with correct parameters when setLoading is called", () => {
            const mockSet = vi.fn();
            const baseStore = createBaseStore(mockSet);

            baseStore.setLoading(true);
            expect(mockSet).toHaveBeenCalledWith({ isLoading: true });
        });

        it("should call set with correct parameters when clearError is called", () => {
            const mockSet = vi.fn();
            const baseStore = createBaseStore(mockSet);

            baseStore.clearError();
            expect(mockSet).toHaveBeenCalledWith({ lastError: undefined });
        });
    });

    describe("withErrorHandling", () => {
        let mockStore: Pick<BaseStore, "setError" | "setLoading" | "clearError">;

        beforeEach(() => {
            mockStore = {
                setError: vi.fn(),
                setLoading: vi.fn(),
                clearError: vi.fn(),
            };
        });

        it("should handle successful operations", async () => {
            const operation = vi.fn().mockResolvedValue("success");

            const result = await withErrorHandling(operation, mockStore);

            expect(result).toBe("success");
            expect(mockStore.setLoading).toHaveBeenCalledWith(true);
            expect(mockStore.clearError).toHaveBeenCalled();
            expect(mockStore.setLoading).toHaveBeenCalledWith(false);
            expect(mockStore.setError).not.toHaveBeenCalled();
        });

        it("should handle operations that throw Error instances", async () => {
            const error = new Error("Test error");
            const operation = vi.fn().mockRejectedValue(error);

            await expect(withErrorHandling(operation, mockStore)).rejects.toThrow("Test error");

            expect(mockStore.setLoading).toHaveBeenCalledWith(true);
            expect(mockStore.clearError).toHaveBeenCalled();
            expect(mockStore.setError).toHaveBeenCalledWith("Test error");
            expect(mockStore.setLoading).toHaveBeenCalledWith(false);
        });

        it("should handle operations that throw non-Error values", async () => {
            const operation = vi.fn().mockRejectedValue("string error");

            await expect(withErrorHandling(operation, mockStore)).rejects.toThrow("string error");

            expect(mockStore.setError).toHaveBeenCalledWith("string error");
        });

        it("should handle operations that throw objects", async () => {
            const operation = vi.fn().mockRejectedValue({ message: "object error" });

            await expect(withErrorHandling(operation, mockStore)).rejects.toThrow();

            expect(mockStore.setError).toHaveBeenCalledWith("[object Object]");
        });

        it("should always call setLoading(false) in finally block", async () => {
            const operation = vi.fn().mockRejectedValue(new Error("Test error"));

            try {
                await withErrorHandling(operation, mockStore);
            } catch {
                // Expected to throw
            }

            expect(mockStore.setLoading).toHaveBeenCalledWith(false);
        });
    });

    describe("createPersistConfig", () => {
        it("should create persist config with correct name", () => {
            const config = createPersistConfig("test-store");

            expect(config).toEqual({
                name: "uptime-watcher-test-store",
                partialize: undefined,
            });
        });

        it("should create persist config with partialize function", () => {
            const partialize = (state: Record<string, unknown>) => ({ field: state.field });
            const config = createPersistConfig("test-store", partialize);

            expect(config).toEqual({
                name: "uptime-watcher-test-store",
                partialize,
            });
        });
    });

    describe("debounce", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("should debounce function calls", () => {
            const func = vi.fn();
            const debouncedFunc = debounce(func, 100);

            debouncedFunc("arg1", "arg2");
            debouncedFunc("arg1", "arg2");
            debouncedFunc("arg1", "arg2");

            expect(func).not.toHaveBeenCalled();

            vi.advanceTimersByTime(100);

            expect(func).toHaveBeenCalledTimes(1);
            expect(func).toHaveBeenCalledWith("arg1", "arg2");
        });

        it("should handle different argument sets separately", () => {
            const func = vi.fn();
            const debouncedFunc = debounce(func, 100);

            debouncedFunc("arg1");
            debouncedFunc("arg2");

            vi.advanceTimersByTime(100);

            expect(func).toHaveBeenCalledTimes(2);
            expect(func).toHaveBeenCalledWith("arg1");
            expect(func).toHaveBeenCalledWith("arg2");
        });

        it("should clear previous timeout when called again with same arguments", () => {
            const func = vi.fn();
            const debouncedFunc = debounce(func, 100);

            debouncedFunc("arg1");
            vi.advanceTimersByTime(50);
            debouncedFunc("arg1"); // Should clear previous timeout

            vi.advanceTimersByTime(50);
            expect(func).not.toHaveBeenCalled();

            vi.advanceTimersByTime(50);
            expect(func).toHaveBeenCalledTimes(1);
        });

        it("should clean up timeout map after execution", () => {
            const func = vi.fn();
            const debouncedFunc = debounce(func, 100);

            debouncedFunc("arg1");
            vi.advanceTimersByTime(100);

            expect(func).toHaveBeenCalledTimes(1);

            // Call again with same args - should work normally
            debouncedFunc("arg1");
            vi.advanceTimersByTime(100);

            expect(func).toHaveBeenCalledTimes(2);
        });
    });

    describe("logStoreAction", () => {
        let consoleSpy: ReturnType<typeof vi.spyOn>;

        beforeEach(() => {
            consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        });

        afterEach(() => {
            consoleSpy.mockRestore();
        });

        it("should log in development environment", () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = "development";

            logStoreAction("TestStore", "testAction", { data: "test" });

            expect(consoleSpy).toHaveBeenCalledWith("[TestStore] testAction", { data: "test" });

            process.env.NODE_ENV = originalEnv;
        });

        it("should not log in production environment", () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = "production";

            logStoreAction("TestStore", "testAction", { data: "test" });

            expect(consoleSpy).not.toHaveBeenCalled();

            process.env.NODE_ENV = originalEnv;
        });

        it("should log without data parameter", () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = "development";

            logStoreAction("TestStore", "testAction");

            expect(consoleSpy).toHaveBeenCalledWith("[TestStore] testAction", undefined);

            process.env.NODE_ENV = originalEnv;
        });
    });
});
