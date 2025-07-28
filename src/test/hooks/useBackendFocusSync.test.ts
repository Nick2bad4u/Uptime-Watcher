/**
 * Tests for useBackendFocusSync hook
 * 
 * @fileoverview Comprehensive tests covering all branches and edge cases
 * for the backend focus synchronization hook.
 */

import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useBackendFocusSync } from "../../hooks/useBackendFocusSync";
import { useSitesStore } from "../../stores/sites/useSitesStore";

// Mock the useSitesStore
const mockFullSyncFromBackend = vi.fn();

vi.mock("../../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn((selector) => {
        if (typeof selector === "function") {
            return selector({
                fullSyncFromBackend: mockFullSyncFromBackend,
            });
        }
        return {
            fullSyncFromBackend: mockFullSyncFromBackend,
        };
    }),
}));

describe("useBackendFocusSync Hook", () => {
    // Store original addEventListener and removeEventListener
    const originalAddEventListener = window.addEventListener;
    const originalRemoveEventListener = window.removeEventListener;
    
    // Mock event listener functions
    const mockAddEventListener = vi.fn();
    const mockRemoveEventListener = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Replace window event listener methods with mocks
        window.addEventListener = mockAddEventListener;
        window.removeEventListener = mockRemoveEventListener;
    });

    afterEach(() => {
        // Restore original methods
        window.addEventListener = originalAddEventListener;
        window.removeEventListener = originalRemoveEventListener;
    });

    describe("When disabled (default behavior)", () => {
        it("should not add event listener when disabled by default", () => {
            renderHook(() => useBackendFocusSync());

            expect(mockAddEventListener).not.toHaveBeenCalled();
            expect(mockFullSyncFromBackend).not.toHaveBeenCalled();
        });

        it("should not add event listener when explicitly disabled", () => {
            renderHook(() => useBackendFocusSync(false));

            expect(mockAddEventListener).not.toHaveBeenCalled();
            expect(mockFullSyncFromBackend).not.toHaveBeenCalled();
        });

        it("should return undefined cleanup function when disabled", () => {
            const { unmount } = renderHook(() => useBackendFocusSync(false));

            // Should not throw when unmounting
            expect(() => unmount()).not.toThrow();
            expect(mockRemoveEventListener).not.toHaveBeenCalled();
        });
    });

    describe("When enabled", () => {
        it("should add focus event listener when enabled", () => {
            renderHook(() => useBackendFocusSync(true));

            expect(mockAddEventListener).toHaveBeenCalledWith("focus", expect.any(Function));
            expect(mockAddEventListener).toHaveBeenCalledTimes(1);
        });

        it("should call fullSyncFromBackend when focus event is triggered", () => {
            renderHook(() => useBackendFocusSync(true));

            // Get the event handler that was registered
            expect(mockAddEventListener).toHaveBeenCalledWith("focus", expect.any(Function));
            const focusHandler = mockAddEventListener.mock.calls[0][1];

            // Simulate focus event
            focusHandler();

            expect(mockFullSyncFromBackend).toHaveBeenCalledTimes(1);
        });

        it("should handle multiple focus events", () => {
            renderHook(() => useBackendFocusSync(true));

            const focusHandler = mockAddEventListener.mock.calls[0][1];

            // Simulate multiple focus events
            focusHandler();
            focusHandler();
            focusHandler();

            expect(mockFullSyncFromBackend).toHaveBeenCalledTimes(3);
        });

        it("should remove event listener on unmount", () => {
            const { unmount } = renderHook(() => useBackendFocusSync(true));

            // Verify listener was added
            expect(mockAddEventListener).toHaveBeenCalledWith("focus", expect.any(Function));
            const focusHandler = mockAddEventListener.mock.calls[0][1];

            // Unmount the component
            unmount();

            // Verify listener was removed with the same handler
            expect(mockRemoveEventListener).toHaveBeenCalledWith("focus", focusHandler);
            expect(mockRemoveEventListener).toHaveBeenCalledTimes(1);
        });
    });

    describe("Dynamic enable/disable behavior", () => {
        it("should add listener when changing from disabled to enabled", () => {
            const { rerender } = renderHook(
                ({ enabled }) => useBackendFocusSync(enabled),
                { initialProps: { enabled: false } }
            );

            // Initially disabled - no listener should be added
            expect(mockAddEventListener).not.toHaveBeenCalled();

            // Enable the hook
            rerender({ enabled: true });

            // Now listener should be added
            expect(mockAddEventListener).toHaveBeenCalledWith("focus", expect.any(Function));
            expect(mockAddEventListener).toHaveBeenCalledTimes(1);
        });

        it("should remove listener when changing from enabled to disabled", () => {
            const { rerender } = renderHook(
                ({ enabled }) => useBackendFocusSync(enabled),
                { initialProps: { enabled: true } }
            );

            // Initially enabled - listener should be added
            expect(mockAddEventListener).toHaveBeenCalledWith("focus", expect.any(Function));
            const focusHandler = mockAddEventListener.mock.calls[0][1];

            // Disable the hook
            rerender({ enabled: false });

            // Listener should be removed
            expect(mockRemoveEventListener).toHaveBeenCalledWith("focus", focusHandler);
            expect(mockRemoveEventListener).toHaveBeenCalledTimes(1);
        });

        it("should handle rapid enable/disable changes", () => {
            const { rerender } = renderHook(
                ({ enabled }) => useBackendFocusSync(enabled),
                { initialProps: { enabled: false } }
            );

            // Rapidly change enabled state
            rerender({ enabled: true });
            rerender({ enabled: false });
            rerender({ enabled: true });
            rerender({ enabled: false });

            // Should have added and removed listeners appropriately
            expect(mockAddEventListener).toHaveBeenCalledTimes(2);
            expect(mockRemoveEventListener).toHaveBeenCalledTimes(2);
        });
    });

    describe("Store selector behavior", () => {
        it("should use store selector to get fullSyncFromBackend function", () => {
            renderHook(() => useBackendFocusSync(true));

            // Verify that useSitesStore was called with a selector function
            expect(vi.mocked(useSitesStore)).toHaveBeenCalledWith(expect.any(Function));
        });

        it("should re-run effect when fullSyncFromBackend function changes", () => {
            const newMockFullSync = vi.fn();
            
            // Initially return the first mock function
            vi.mocked(useSitesStore).mockImplementation((selector) => {
                if (typeof selector === "function") {
                    return selector({
                        fullSyncFromBackend: mockFullSyncFromBackend,
                    });
                }
                return { fullSyncFromBackend: mockFullSyncFromBackend };
            });

            const { rerender } = renderHook(() => useBackendFocusSync(true));

            expect(mockAddEventListener).toHaveBeenCalledTimes(1);
            const firstHandler = mockAddEventListener.mock.calls[0][1];

            // Change the mock to return a new function
            vi.mocked(useSitesStore).mockImplementation((selector) => {
                if (typeof selector === "function") {
                    return selector({
                        fullSyncFromBackend: newMockFullSync,
                    });
                }
                return { fullSyncFromBackend: newMockFullSync };
            });

            // Force re-render
            rerender();

            // Should have removed old listener and added new one
            expect(mockRemoveEventListener).toHaveBeenCalledWith("focus", firstHandler);
            expect(mockAddEventListener).toHaveBeenCalledTimes(2);
            
            // New handler should call the new function
            const secondHandler = mockAddEventListener.mock.calls[1][1];
            secondHandler();
            
            expect(newMockFullSync).toHaveBeenCalledTimes(1);
            expect(mockFullSyncFromBackend).not.toHaveBeenCalled();
        });
    });

    describe("Error handling and edge cases", () => {
        it("should handle fullSyncFromBackend throwing an error", () => {
            mockFullSyncFromBackend.mockImplementation(() => {
                throw new Error("Sync failed");
            });

            renderHook(() => useBackendFocusSync(true));

            const focusHandler = mockAddEventListener.mock.calls[0][1];

            // Should not throw when focus handler is called
            expect(() => focusHandler()).not.toThrow();
        });

        it("should handle fullSyncFromBackend returning a rejected promise", () => {
            mockFullSyncFromBackend.mockRejectedValue(new Error("Async sync failed"));

            renderHook(() => useBackendFocusSync(true));

            const focusHandler = mockAddEventListener.mock.calls[0][1];

            // Should not throw when focus handler is called
            expect(() => focusHandler()).not.toThrow();
        });

        it("should work with truthy non-boolean values for enabled", () => {
            const { rerender } = renderHook(
                ({ enabled }) => useBackendFocusSync(enabled as any),
                { initialProps: { enabled: "true" as any } }
            );

            expect(mockAddEventListener).toHaveBeenCalledTimes(1);

            rerender({ enabled: 1 as any });
            // Should still be enabled with truthy value
            expect(mockRemoveEventListener).toHaveBeenCalledTimes(1);
            expect(mockAddEventListener).toHaveBeenCalledTimes(2);

            rerender({ enabled: 0 as any });
            // Should be disabled with falsy value
            expect(mockRemoveEventListener).toHaveBeenCalledTimes(2);
        });

        it("should work with falsy non-boolean values for enabled", () => {
            const { rerender } = renderHook(
                ({ enabled }) => useBackendFocusSync(enabled as any),
                { initialProps: { enabled: null as any } }
            );

            expect(mockAddEventListener).not.toHaveBeenCalled();

            rerender({ enabled: undefined as any });
            expect(mockAddEventListener).not.toHaveBeenCalled();

            rerender({ enabled: "" as any });
            expect(mockAddEventListener).not.toHaveBeenCalled();
        });
    });

    describe("Integration scenarios", () => {
        beforeEach(() => {
            // Reset the mock implementation for integration tests
            vi.mocked(useSitesStore).mockImplementation((selector) => {
                if (typeof selector === "function") {
                    return selector({
                        fullSyncFromBackend: mockFullSyncFromBackend,
                    });
                }
                return { fullSyncFromBackend: mockFullSyncFromBackend };
            });
        });

        it("should work correctly when component mounts with enabled=true", () => {
            renderHook(() => useBackendFocusSync(true));

            expect(mockAddEventListener).toHaveBeenCalledWith("focus", expect.any(Function));
            
            const focusHandler = mockAddEventListener.mock.calls[0][1];
            focusHandler();
            
            expect(mockFullSyncFromBackend).toHaveBeenCalledTimes(1);
        });

        it("should properly clean up when component unmounts while enabled", () => {
            const { unmount } = renderHook(() => useBackendFocusSync(true));

            const focusHandler = mockAddEventListener.mock.calls[0][1];

            unmount();

            expect(mockRemoveEventListener).toHaveBeenCalledWith("focus", focusHandler);
        });

        it("should handle multiple instances of the hook", () => {
            const { unmount: unmount1 } = renderHook(() => useBackendFocusSync(true));
            const { unmount: unmount2 } = renderHook(() => useBackendFocusSync(true));

            expect(mockAddEventListener).toHaveBeenCalledTimes(2);

            const handler1 = mockAddEventListener.mock.calls[0][1];
            const handler2 = mockAddEventListener.mock.calls[1][1];

            // Both handlers should work independently
            handler1();
            handler2();

            expect(mockFullSyncFromBackend).toHaveBeenCalledTimes(2);

            // Clean up first instance
            unmount1();
            expect(mockRemoveEventListener).toHaveBeenCalledWith("focus", handler1);

            // Second instance should still work
            handler2();
            expect(mockFullSyncFromBackend).toHaveBeenCalledTimes(3);

            // Clean up second instance
            unmount2();
            expect(mockRemoveEventListener).toHaveBeenCalledWith("focus", handler2);
        });
    });
});
