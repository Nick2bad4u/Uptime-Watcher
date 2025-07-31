/**
 * Tests for store utility functions.
 * Tests the core utilities used across all Zustand stores in the application.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import logger from "../../services/logger";
import { createBaseStore, createPersistConfig, debounce, logStoreAction, waitForElectronAPI } from "../../stores/utils";

// Mock logger
vi.mock("../../services/logger", () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock environment utility
vi.mock("../../../shared/utils/environment", () => ({
    isDevelopment: vi.fn(() => true),
}));

// Mock shared error handling
vi.mock("@shared/utils/errorHandling", () => ({
    withErrorHandling: vi.fn((function_) => function_),
}));

describe("Store Utils", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        // Reset window.electronAPI
        (window as any).electronAPI = undefined;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe("createBaseStore", () => {
        it("should create a base store with proper initial values", () => {
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

        it("should call setState when clearError is invoked", () => {
            const setState = vi.fn();
            const baseStore = createBaseStore(setState);

            baseStore.clearError();

            expect(setState).toHaveBeenCalledWith({ lastError: undefined });
        });

        it("should call setState when setError is invoked with error message", () => {
            const setState = vi.fn();
            const baseStore = createBaseStore(setState);
            const errorMessage = "Test error message";

            baseStore.setError(errorMessage);

            expect(setState).toHaveBeenCalledWith({ lastError: errorMessage });
        });

        it("should call setState when setError is invoked with undefined", () => {
            const setState = vi.fn();
            const baseStore = createBaseStore(setState);

            baseStore.setError(undefined);

            expect(setState).toHaveBeenCalledWith({ lastError: undefined });
        });

        it("should call setState when setLoading is invoked with true", () => {
            const setState = vi.fn();
            const baseStore = createBaseStore(setState);

            baseStore.setLoading(true);

            expect(setState).toHaveBeenCalledWith({ isLoading: true });
        });

        it("should call setState when setLoading is invoked with false", () => {
            const setState = vi.fn();
            const baseStore = createBaseStore(setState);

            baseStore.setLoading(false);

            expect(setState).toHaveBeenCalledWith({ isLoading: false });
        });
    });

    describe("createPersistConfig", () => {
        it("should create a persist config with prefixed name", () => {
            const config = createPersistConfig("test-store");

            expect(config).toEqual({
                name: "uptime-watcher-test-store",
                partialize: undefined,
            });
        });

        it("should create a persist config with custom partialize function", () => {
            const partializeFunction = (state: any) => ({ data: state.data });
            const config = createPersistConfig("test-store", partializeFunction);

            expect(config).toEqual({
                name: "uptime-watcher-test-store",
                partialize: partializeFunction,
            });
        });

        it("should handle different store names", () => {
            const config1 = createPersistConfig("sites");
            const config2 = createPersistConfig("settings");

            expect(config1.name).toBe("uptime-watcher-sites");
            expect(config2.name).toBe("uptime-watcher-settings");
        });
    });

    describe("debounce", () => {
        it("should debounce function calls", () => {
            const mockFunction = vi.fn();
            const debouncedFunction = debounce(mockFunction, 100);

            debouncedFunction("arg1");
            debouncedFunction("arg1");
            debouncedFunction("arg1");

            expect(mockFunction).not.toHaveBeenCalled();

            vi.advanceTimersByTime(100);

            expect(mockFunction).toHaveBeenCalledTimes(1);
            expect(mockFunction).toHaveBeenCalledWith("arg1");
        });

        it("should handle multiple different argument sets independently", () => {
            const mockFunction = vi.fn();
            const debouncedFunction = debounce(mockFunction, 100);

            debouncedFunction("arg1");
            debouncedFunction("arg2");

            vi.advanceTimersByTime(100);

            expect(mockFunction).toHaveBeenCalledTimes(2);
            expect(mockFunction).toHaveBeenCalledWith("arg1");
            expect(mockFunction).toHaveBeenCalledWith("arg2");
        });

        it("should reset timer when called again before timeout", () => {
            const mockFunction = vi.fn();
            const debouncedFunction = debounce(mockFunction, 100);

            debouncedFunction("arg1");
            vi.advanceTimersByTime(50);
            debouncedFunction("arg1"); // Reset timer
            vi.advanceTimersByTime(50);

            expect(mockFunction).not.toHaveBeenCalled();

            vi.advanceTimersByTime(50);

            expect(mockFunction).toHaveBeenCalledTimes(1);
        });

        it("should handle functions with no arguments", () => {
            const mockFunction = vi.fn();
            const debouncedFunction = debounce(mockFunction, 100);

            debouncedFunction();
            debouncedFunction();

            vi.advanceTimersByTime(100);

            expect(mockFunction).toHaveBeenCalledTimes(1);
        });

        it("should handle functions with multiple arguments", () => {
            const mockFunction = vi.fn();
            const debouncedFunction = debounce(mockFunction, 100);

            debouncedFunction("arg1", "arg2", "arg3");

            vi.advanceTimersByTime(100);

            expect(mockFunction).toHaveBeenCalledWith("arg1", "arg2", "arg3");
        });

        it("should cleanup timeouts properly", () => {
            const mockFunction = vi.fn();
            const debouncedFunction = debounce(mockFunction, 100);

            debouncedFunction("arg1");
            vi.advanceTimersByTime(100);

            // Call again with same args
            debouncedFunction("arg1");
            vi.advanceTimersByTime(100);

            expect(mockFunction).toHaveBeenCalledTimes(2);
        });
    });

    describe("logStoreAction", () => {
        it("should log store action in development mode", () => {
            logStoreAction("TestStore", "testAction");

            expect(logger.info).toHaveBeenCalledWith("[TestStore] testAction");
        });

        it("should log store action with data in development mode", () => {
            const data = { id: "test-id", value: 123 };
            logStoreAction("TestStore", "testAction", data);

            expect(logger.info).toHaveBeenCalledWith("[TestStore] testAction", data);
        });

        it("should not log when data is undefined", () => {
            logStoreAction("TestStore", "testAction", undefined);

            expect(logger.info).toHaveBeenCalledWith("[TestStore] testAction");
        });

        it("should handle different store names and actions", () => {
            logStoreAction("SitesStore", "addSite", { id: "site-123" });
            logStoreAction("SettingsStore", "updateTheme");

            expect(logger.info).toHaveBeenCalledWith("[SitesStore] addSite", { id: "site-123" });
            expect(logger.info).toHaveBeenCalledWith("[SettingsStore] updateTheme");
        });

        it("should not log in production mode", async () => {
            const { isDevelopment } = await vi.importMock("../../../shared/utils/environment");
            (isDevelopment as any).mockReturnValue(false);

            logStoreAction("TestStore", "testAction");

            expect(logger.info).not.toHaveBeenCalled();
        });
    });

    describe("waitForElectronAPI", () => {
        it("should resolve immediately when electronAPI is available", async () => {
            (window as any).electronAPI = {
                sites: { getSites: vi.fn() },
            };

            await expect(waitForElectronAPI()).resolves.toBeUndefined();
        });

        it("should work with custom maxAttempts and baseDelay", async () => {
            (window as any).electronAPI = {
                sites: { getSites: vi.fn() },
            };

            await expect(waitForElectronAPI(10, 50)).resolves.toBeUndefined();
        });
    });
});
