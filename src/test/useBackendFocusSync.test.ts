/**
 * Test for useBackendFocusSync hook.
 * Basic tests for the hook functionality.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBackendFocusSync } from "../hooks/useBackendFocusSync";

// Mock the stores
vi.mock("../stores", () => ({
    useSitesStore: vi.fn(() => ({
        sites: [],
        fullSyncFromBackend: vi.fn(),
    })),
}));

// Mock window.addEventListener
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(window, 'addEventListener', {
    value: mockAddEventListener,
    writable: true,
});

Object.defineProperty(window, 'removeEventListener', {
    value: mockRemoveEventListener,
    writable: true,
});

describe("useBackendFocusSync", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should initialize without errors", () => {
        const { result } = renderHook(() => useBackendFocusSync());
        expect(result.current).toBeUndefined();
    });

    it("should handle hook lifecycle", () => {
        const { unmount } = renderHook(() => useBackendFocusSync());
        
        // Should not throw when unmounting
        expect(() => unmount()).not.toThrow();
    });

    it("should register event listeners when enabled", () => {
        renderHook(() => useBackendFocusSync(true));
        
        expect(mockAddEventListener).toHaveBeenCalledWith("focus", expect.any(Function));
    });

    it("should not register event listeners when disabled", () => {
        renderHook(() => useBackendFocusSync(false));
        
        expect(mockAddEventListener).not.toHaveBeenCalled();
    });
});
