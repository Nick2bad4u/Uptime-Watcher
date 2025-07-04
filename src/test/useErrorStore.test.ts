/**
 * Test suite for useErrorStore.
 * Comprehensive tests for error store functionality.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useErrorStore } from "../stores/error/useErrorStore";

// Mock the logger
vi.mock("../../utils", () => ({
    logStoreAction: vi.fn(),
}));

describe("useErrorStore", () => {
    beforeEach(() => {
        // Reset the store before each test
        useErrorStore.setState({
            lastError: undefined,
            isLoading: false,
            storeErrors: {},
            operationLoading: {},
        });
    });

    describe("error management", () => {
        it("should set and clear error", () => {
            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setError("Test error");
            });

            expect(result.current.lastError).toBe("Test error");

            act(() => {
                result.current.clearError();
            });

            expect(result.current.lastError).toBeUndefined();
        });

        it("should handle store-specific errors", () => {
            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setStoreError("siteStore", "Site error");
            });

            expect(result.current.storeErrors.siteStore).toBe("Site error");
            expect(result.current.getStoreError("siteStore")).toBe("Site error");

            act(() => {
                result.current.clearStoreError("siteStore");
            });

            expect(result.current.storeErrors.siteStore).toBeUndefined();
            expect(result.current.getStoreError("siteStore")).toBeUndefined();
        });

        it("should clear all errors", () => {
            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setError("Global error");
                result.current.setStoreError("siteStore", "Site error");
                result.current.setStoreError("uiStore", "UI error");
            });

            expect(result.current.lastError).toBe("Global error");
            expect(result.current.storeErrors.siteStore).toBe("Site error");
            expect(result.current.storeErrors.uiStore).toBe("UI error");

            act(() => {
                result.current.clearAllErrors();
            });

            expect(result.current.lastError).toBeUndefined();
            expect(result.current.storeErrors).toEqual({});
        });

        it("should return undefined for non-existent store errors", () => {
            const { result } = renderHook(() => useErrorStore());

            expect(result.current.getStoreError("nonExistentStore")).toBeUndefined();
        });
    });

    describe("loading state management", () => {
        it("should set and get loading state", () => {
            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setLoading(true);
            });

            expect(result.current.isLoading).toBe(true);

            act(() => {
                result.current.setLoading(false);
            });

            expect(result.current.isLoading).toBe(false);
        });

        it("should handle operation-specific loading states", () => {
            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setOperationLoading("fetchSites", true);
            });

            expect(result.current.operationLoading.fetchSites).toBe(true);
            expect(result.current.getOperationLoading("fetchSites")).toBe(true);

            act(() => {
                result.current.setOperationLoading("fetchSites", false);
            });

            expect(result.current.operationLoading.fetchSites).toBe(false);
            expect(result.current.getOperationLoading("fetchSites")).toBe(false);
        });

        it("should return false for non-existent operation loading state", () => {
            const { result } = renderHook(() => useErrorStore());

            expect(result.current.getOperationLoading("nonExistentOperation")).toBe(false);
        });

        it("should handle multiple operation loading states", () => {
            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setOperationLoading("fetchSites", true);
                result.current.setOperationLoading("updateSite", true);
                result.current.setOperationLoading("deleteSite", false);
            });

            expect(result.current.getOperationLoading("fetchSites")).toBe(true);
            expect(result.current.getOperationLoading("updateSite")).toBe(true);
            expect(result.current.getOperationLoading("deleteSite")).toBe(false);
            expect(result.current.getOperationLoading("nonExistent")).toBe(false);
        });
    });

    describe("complex scenarios", () => {
        it("should handle mixed error and loading states", () => {
            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setError("Global error");
                result.current.setStoreError("siteStore", "Site error");
                result.current.setLoading(true);
                result.current.setOperationLoading("fetchSites", true);
            });

            expect(result.current.lastError).toBe("Global error");
            expect(result.current.storeErrors.siteStore).toBe("Site error");
            expect(result.current.isLoading).toBe(true);
            expect(result.current.getOperationLoading("fetchSites")).toBe(true);

            act(() => {
                result.current.clearError();
                result.current.setLoading(false);
            });

            expect(result.current.lastError).toBeUndefined();
            expect(result.current.storeErrors.siteStore).toBe("Site error"); // Should still exist
            expect(result.current.isLoading).toBe(false);
            expect(result.current.getOperationLoading("fetchSites")).toBe(true); // Should still exist
        });

        it("should handle undefined error values", () => {
            const { result } = renderHook(() => useErrorStore());

            act(() => {
                result.current.setError(undefined);
                result.current.setStoreError("testStore", undefined);
            });

            expect(result.current.lastError).toBeUndefined();
            expect(result.current.storeErrors.testStore).toBeUndefined();
        });
    });
});
