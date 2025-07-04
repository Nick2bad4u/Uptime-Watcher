/**
 * Test suite for useBackendFocusSync.
 * Comprehensive tests for backend focus sync functionality.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBackendFocusSync } from "../hooks/useBackendFocusSync";
import { useSitesStore } from "../stores";

// Mock the sites store
vi.mock("../stores", () => ({
    useSitesStore: vi.fn(),
}));

const mockUseSitesStore = vi.mocked(useSitesStore);

describe("useBackendFocusSync", () => {
    const mockFullSyncFromBackend = vi.fn();

    beforeEach(() => {
        mockUseSitesStore.mockReturnValue({
            fullSyncFromBackend: mockFullSyncFromBackend,
        });

        // Reset mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Clean up any event listeners
        vi.clearAllMocks();
    });

    it("should not add event listener when disabled", () => {
        const addEventListenerSpy = vi.spyOn(window, "addEventListener");

        renderHook(() => useBackendFocusSync(false));

        expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it("should not add event listener when no parameter provided (default false)", () => {
        const addEventListenerSpy = vi.spyOn(window, "addEventListener");

        renderHook(() => useBackendFocusSync());

        expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it("should add event listener when enabled", () => {
        const addEventListenerSpy = vi.spyOn(window, "addEventListener");

        renderHook(() => useBackendFocusSync(true));

        expect(addEventListenerSpy).toHaveBeenCalledWith("focus", expect.any(Function));
    });

    it("should remove event listener on cleanup", () => {
        const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

        const { unmount } = renderHook(() => useBackendFocusSync(true));

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith("focus", expect.any(Function));
    });

    it("should call fullSyncFromBackend when focus event is triggered", () => {
        renderHook(() => useBackendFocusSync(true));

        // Simulate focus event
        const focusEvent = new Event("focus");
        window.dispatchEvent(focusEvent);

        expect(mockFullSyncFromBackend).toHaveBeenCalledTimes(1);
    });

    it("should not call fullSyncFromBackend when disabled and focus event is triggered", () => {
        renderHook(() => useBackendFocusSync(false));

        // Simulate focus event
        const focusEvent = new Event("focus");
        window.dispatchEvent(focusEvent);

        expect(mockFullSyncFromBackend).not.toHaveBeenCalled();
    });

    it("should call fullSyncFromBackend multiple times for multiple focus events", () => {
        renderHook(() => useBackendFocusSync(true));

        // Simulate multiple focus events
        const focusEvent1 = new Event("focus");
        const focusEvent2 = new Event("focus");

        window.dispatchEvent(focusEvent1);
        window.dispatchEvent(focusEvent2);

        expect(mockFullSyncFromBackend).toHaveBeenCalledTimes(2);
    });

    it("should handle enabling and disabling", () => {
        const addEventListenerSpy = vi.spyOn(window, "addEventListener");
        const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

        const { rerender } = renderHook(({ enabled }) => useBackendFocusSync(enabled), {
            initialProps: { enabled: false },
        });

        expect(addEventListenerSpy).not.toHaveBeenCalled();

        // Enable
        rerender({ enabled: true });

        expect(addEventListenerSpy).toHaveBeenCalledWith("focus", expect.any(Function));

        // Disable
        rerender({ enabled: false });

        expect(removeEventListenerSpy).toHaveBeenCalledWith("focus", expect.any(Function));
    });

    it("should handle hook unmount while enabled", () => {
        const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

        const { unmount } = renderHook(() => useBackendFocusSync(true));

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith("focus", expect.any(Function));
    });

    it("should handle hook unmount while disabled", () => {
        const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

        const { unmount } = renderHook(() => useBackendFocusSync(false));

        unmount();

        expect(removeEventListenerSpy).not.toHaveBeenCalled();
    });
});
