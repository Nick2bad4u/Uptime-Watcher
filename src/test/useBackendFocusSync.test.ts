/**
 * Test suite for useBackendFocusSync hook
 * Tests focus event handling and backend synchronization
 */

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useStore } from "../store";
import { useBackendFocusSync } from "../hooks/useBackendFocusSync";

// Mock useStore
vi.mock("../store", () => ({
    useStore: vi.fn(),
}));

describe("useBackendFocusSync Hook", () => {
    const mockFullSyncFromBackend = vi.fn();
    let mockAddEventListener: ReturnType<typeof vi.fn>;
    let mockRemoveEventListener: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock useStore selector
        (useStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
            const mockState = {
                fullSyncFromBackend: mockFullSyncFromBackend,
            };
            return selector ? selector(mockState) : mockState;
        });

        // Mock window event listeners
        mockAddEventListener = vi.fn();
        mockRemoveEventListener = vi.fn();
        Object.defineProperty(window, "addEventListener", {
            value: mockAddEventListener,
            writable: true,
        });
        Object.defineProperty(window, "removeEventListener", {
            value: mockRemoveEventListener,
            writable: true,
        });
    });

    describe("Basic Functionality", () => {
        it("does not set up focus listener when disabled by default", () => {
            renderHook(() => useBackendFocusSync());

            expect(mockAddEventListener).not.toHaveBeenCalled();
        });

        it("does not set up focus listener when explicitly disabled", () => {
            renderHook(() => useBackendFocusSync(false));

            expect(mockAddEventListener).not.toHaveBeenCalled();
        });

        it("sets up focus listener when enabled", () => {
            renderHook(() => useBackendFocusSync(true));

            expect(mockAddEventListener).toHaveBeenCalledWith("focus", expect.any(Function));
        });

        it("removes focus listener on unmount when enabled", () => {
            const { unmount } = renderHook(() => useBackendFocusSync(true));

            // Get the listener function that was registered
            const focusListener = mockAddEventListener.mock.calls[0][1];

            unmount();

            expect(mockRemoveEventListener).toHaveBeenCalledWith("focus", focusListener);
        });
    });

    describe("Focus Event Handling", () => {
        it("calls fullSyncFromBackend on window focus when enabled", () => {
            renderHook(() => useBackendFocusSync(true));

            // Get the focus event handler
            const focusHandler = mockAddEventListener.mock.calls[0][1];

            // Simulate focus event
            focusHandler();

            expect(mockFullSyncFromBackend).toHaveBeenCalled();
        });

        it("does not call fullSyncFromBackend when disabled", () => {
            renderHook(() => useBackendFocusSync(false));

            // Should not have registered any listener
            expect(mockAddEventListener).not.toHaveBeenCalled();
            expect(mockFullSyncFromBackend).not.toHaveBeenCalled();
        });
    });

    describe("State Changes", () => {
        it("sets up listener when enabled state changes from false to true", () => {
            const { rerender } = renderHook(({ enabled }) => useBackendFocusSync(enabled), {
                initialProps: { enabled: false },
            });

            expect(mockAddEventListener).not.toHaveBeenCalled();

            rerender({ enabled: true });

            expect(mockAddEventListener).toHaveBeenCalledWith("focus", expect.any(Function));
        });

        it("removes listener when enabled state changes from true to false", () => {
            const { rerender } = renderHook(({ enabled }) => useBackendFocusSync(enabled), {
                initialProps: { enabled: true },
            });

            expect(mockAddEventListener).toHaveBeenCalled();
            const focusListener = mockAddEventListener.mock.calls[0][1];

            rerender({ enabled: false });

            expect(mockRemoveEventListener).toHaveBeenCalledWith("focus", focusListener);
        });
    });

    describe("Dependency Updates", () => {
        it("updates listener when fullSyncFromBackend function changes", () => {
            const newMockFullSync = vi.fn();

            const { rerender } = renderHook(() => useBackendFocusSync(true));

            expect(mockAddEventListener).toHaveBeenCalledTimes(1);

            // Mock function change
            (useStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
                const mockState = {
                    fullSyncFromBackend: newMockFullSync,
                };
                return selector ? selector(mockState) : mockState;
            });

            rerender();

            // Should remove old listener and add new one
            expect(mockRemoveEventListener).toHaveBeenCalled();
            expect(mockAddEventListener).toHaveBeenCalledTimes(2);
        });
    });

    describe("Multiple Focus Events", () => {
        it("handles multiple focus events correctly", () => {
            renderHook(() => useBackendFocusSync(true));

            const focusHandler = mockAddEventListener.mock.calls[0][1];

            // Simulate multiple focus events
            focusHandler();
            focusHandler();
            focusHandler();

            expect(mockFullSyncFromBackend).toHaveBeenCalledTimes(3);
        });
    });
});
