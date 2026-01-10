/**
 * Tests for useBackendFocusSync hook
 *
 * @file Comprehensive tests covering all branches and edge cases for the
 *   backend focus synchronization hook.
 */

import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useBackendFocusSync } from "../../hooks/useBackendFocusSync";
import { useSitesStore } from "../../stores/sites/useSitesStore";
import type { SitesStore } from "../../stores/sites/types";

// Mock the useSitesStore
const mockfullResyncSites = vi.fn();

// Create a minimal mock store with only the required properties
const createMockStore = (): Partial<SitesStore> => ({
    fullResyncSites: mockfullResyncSites,
    sites: [],
    selectedMonitorIds: {},
    selectedSiteIdentifier: undefined,
    // Add minimal mock implementations for other required methods
    addMonitorToSite: vi.fn(),
    addSite: vi.fn(),
    checkSiteNow: vi.fn(),
    createSite: vi.fn(),
    deleteSite: vi.fn(),
    downloadSqliteBackup: vi.fn().mockResolvedValue({
        buffer: new ArrayBuffer(8),
        fileName: "backup.db",
        metadata: {
            appVersion: "0.0.0-test",
            checksum: "mock-checksum",
            createdAt: 0,
            originalPath: "/tmp/backup.db",
            retentionHintDays: 30,
            schemaVersion: 1,
            sizeBytes: 8,
        },
    }),
    saveSqliteBackup: vi.fn().mockResolvedValue({ canceled: true } as const),
    getSelectedMonitorId: vi.fn(),
    getSelectedSite: vi.fn(),
    getSyncStatus: vi.fn(),
    initializeSites: vi.fn(),
    modifySite: vi.fn(),
    removeMonitorFromSite: vi.fn(),
    removeSite: vi.fn(),
    setSelectedMonitorId: vi.fn(),
    setLastBackupMetadata: vi.fn(),
    selectSite: vi.fn(),
    setSites: vi.fn(),
    lastBackupMetadata: undefined,
    startSiteMonitoring: vi.fn(),
    startSiteMonitorMonitoring: vi.fn(),
    stopSiteMonitoring: vi.fn(),
    stopSiteMonitorMonitoring: vi.fn(),
    subscribeToStatusUpdates: vi.fn(),
    subscribeToSyncEvents: vi.fn(),
    syncSites: vi.fn(),
    unsubscribeFromStatusUpdates: vi.fn(),
    updateMonitorRetryAttempts: vi.fn(),
    updateMonitorTimeout: vi.fn(),
    updateSiteCheckInterval: vi.fn(),
});

vi.mock("../../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn((selector) => {
        const mockStore = createMockStore() as SitesStore;
        if (typeof selector === "function") {
            return selector(mockStore);
        }
        return mockStore;
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
        it("should not add event listener when disabled by default", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Event Processing", "type");

            renderHook(() => useBackendFocusSync());

            expect(mockAddEventListener).not.toHaveBeenCalled();
            expect(mockfullResyncSites).not.toHaveBeenCalled();
        });

        it("should not add event listener when explicitly disabled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Event Processing", "type");

            renderHook(() => useBackendFocusSync(false));

            expect(mockAddEventListener).not.toHaveBeenCalled();
            expect(mockfullResyncSites).not.toHaveBeenCalled();
        });

        it("should return undefined cleanup function when disabled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { unmount } = renderHook(() => useBackendFocusSync(false));

            // Should not throw when unmounting
            expect(() => unmount()).not.toThrowError();
            expect(mockRemoveEventListener).not.toHaveBeenCalled();
        });
    });

    describe("When enabled", () => {
        it("should add focus event listener when enabled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Event Processing", "type");

            renderHook(() => useBackendFocusSync(true));

            expect(mockAddEventListener).toHaveBeenCalledWith(
                "focus",
                expect.any(Function)
            );
            expect(mockAddEventListener).toHaveBeenCalledTimes(1);
        });

        it("should call fullResyncSites when focus event is triggered", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Event Processing", "type");

            renderHook(() => useBackendFocusSync(true));

            // Get the event handler that was registered
            expect(mockAddEventListener).toHaveBeenCalledWith(
                "focus",
                expect.any(Function)
            );
            const focusHandler = mockAddEventListener.mock.calls[0]?.[1];

            // Simulate focus event
            if (focusHandler) {
                focusHandler();
            }

            expect(mockfullResyncSites).toHaveBeenCalledTimes(1);
        });

        it("should handle multiple focus events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Event Processing", "type");

            renderHook(() => useBackendFocusSync(true));

            const focusHandler = mockAddEventListener.mock.calls[0]?.[1];

            // Simulate multiple focus events
            if (focusHandler) {
                focusHandler();
                focusHandler();
                focusHandler();
            }

            expect(mockfullResyncSites).toHaveBeenCalledTimes(3);
        });

        it("should remove event listener on unmount", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Deletion", "type");

            const { unmount } = renderHook(() => useBackendFocusSync(true));

            // Verify listener was added
            expect(mockAddEventListener).toHaveBeenCalledWith(
                "focus",
                expect.any(Function)
            );
            const focusHandler = mockAddEventListener.mock.calls[0]?.[1];

            // Unmount the component
            unmount();

            // Verify listener was removed with the same handler
            expect(mockRemoveEventListener).toHaveBeenCalledWith(
                "focus",
                focusHandler
            );
            expect(mockRemoveEventListener).toHaveBeenCalledTimes(1);
        });
    });

    describe("Dynamic enable/disable behavior", () => {
        it("should add listener when changing from disabled to enabled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { rerender } = renderHook(
                ({ enabled }) => useBackendFocusSync(enabled),
                {
                    initialProps: { enabled: false },
                }
            );

            // Initially disabled - no listener should be added
            expect(mockAddEventListener).not.toHaveBeenCalled();

            // Enable the hook
            rerender({ enabled: true });

            // Now listener should be added
            expect(mockAddEventListener).toHaveBeenCalledWith(
                "focus",
                expect.any(Function)
            );
            expect(mockAddEventListener).toHaveBeenCalledTimes(1);
        });

        it("should remove listener when changing from enabled to disabled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Deletion", "type");

            const { rerender } = renderHook(
                ({ enabled }) => useBackendFocusSync(enabled),
                {
                    initialProps: { enabled: true },
                }
            );

            // Initially enabled - listener should be added
            expect(mockAddEventListener).toHaveBeenCalledWith(
                "focus",
                expect.any(Function)
            );
            const focusHandler = mockAddEventListener.mock.calls[0]?.[1];

            // Disable the hook
            rerender({ enabled: false });

            // Listener should be removed
            expect(mockRemoveEventListener).toHaveBeenCalledWith(
                "focus",
                focusHandler
            );
            expect(mockRemoveEventListener).toHaveBeenCalledTimes(1);
        });

        it("should handle rapid enable/disable changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { rerender } = renderHook(
                ({ enabled }) => useBackendFocusSync(enabled),
                {
                    initialProps: { enabled: false },
                }
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
        it("should use store selector to get fullResyncSites function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Retrieval", "type");

            renderHook(() => useBackendFocusSync(true));

            // Verify that useSitesStore was called with a selector function
            expect(vi.mocked(useSitesStore)).toHaveBeenCalledWith(
                expect.any(Function)
            );
        });

        it("should re-run effect when fullResyncSites function changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const newMockFullSync = vi.fn();
            const mockStore = createMockStore() as SitesStore;

            // Initially return the first mock function
            vi.mocked(useSitesStore).mockImplementation((selector) => {
                const store = {
                    ...mockStore,
                    fullResyncSites: mockfullResyncSites,
                };
                if (typeof selector === "function") {
                    return selector(store);
                }
                return store;
            });

            const { rerender } = renderHook(() => useBackendFocusSync(true));

            expect(mockAddEventListener).toHaveBeenCalledTimes(1);
            const firstHandler = mockAddEventListener.mock.calls[0]?.[1];

            // Change the mock to return a new function
            vi.mocked(useSitesStore).mockImplementation((selector) => {
                const store = {
                    ...mockStore,
                    fullResyncSites: newMockFullSync,
                };
                if (typeof selector === "function") {
                    return selector(store);
                }
                return store;
            });

            // Force re-render
            rerender();

            // Should have removed old listener and added new one
            expect(mockRemoveEventListener).toHaveBeenCalledWith(
                "focus",
                firstHandler
            );
            expect(mockAddEventListener).toHaveBeenCalledTimes(2);

            // New handler should call the new function
            const secondHandler = mockAddEventListener.mock.calls[1]?.[1];
            secondHandler();

            expect(newMockFullSync).toHaveBeenCalledTimes(1);
            expect(mockfullResyncSites).not.toHaveBeenCalled();
        });
    });

    describe("Error handling and edge cases", () => {
        it("should handle fullResyncSites throwing an error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            mockfullResyncSites.mockImplementation(() => {
                throw new Error("Sync failed");
            });

            renderHook(() => useBackendFocusSync(true));

            const focusHandler = mockAddEventListener.mock.calls[0]?.[1];

            // Should not throw when focus handler is called
            expect(() => {
                if (focusHandler) {
                    focusHandler();
                }
            }).not.toThrowError();
        });

        it("should handle fullResyncSites returning a rejected promise", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            mockfullResyncSites.mockRejectedValue(
                new Error("Async sync failed")
            );

            renderHook(() => useBackendFocusSync(true));

            const focusHandler = mockAddEventListener.mock.calls[0]?.[1];

            // Should not throw when focus handler is called
            expect(() => {
                if (focusHandler) {
                    focusHandler();
                }
            }).not.toThrowError();
        });

        it("should work with truthy non-boolean values for enabled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { rerender } = renderHook(
                ({ enabled }) => useBackendFocusSync(enabled as any),
                {
                    initialProps: { enabled: "true" as any },
                }
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

        it("should work with falsy non-boolean values for enabled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { rerender } = renderHook(
                ({ enabled }) => useBackendFocusSync(enabled as any),
                {
                    initialProps: { enabled: null as any },
                }
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
            const mockStore = createMockStore() as SitesStore;
            vi.mocked(useSitesStore).mockImplementation((selector) => {
                const store = {
                    ...mockStore,
                    fullResyncSites: mockfullResyncSites,
                };
                if (typeof selector === "function") {
                    return selector(store);
                }
                return store;
            });
        });

        it("should work correctly when component mounts with enabled=true", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            renderHook(() => useBackendFocusSync(true));

            expect(mockAddEventListener).toHaveBeenCalledWith(
                "focus",
                expect.any(Function)
            );

            const focusHandler = mockAddEventListener.mock.calls[0]?.[1];
            if (focusHandler) {
                focusHandler();
            }

            expect(mockfullResyncSites).toHaveBeenCalledTimes(1);
        });

        it("should properly clean up when component unmounts while enabled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { unmount } = renderHook(() => useBackendFocusSync(true));

            const focusHandler = mockAddEventListener.mock.calls[0]?.[1];

            unmount();

            expect(mockRemoveEventListener).toHaveBeenCalledWith(
                "focus",
                focusHandler
            );
        });

        it("should handle multiple instances of the hook", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useBackendFocusSync", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { unmount: unmount1 } = renderHook(() =>
                useBackendFocusSync(true)
            );
            const { unmount: unmount2 } = renderHook(() =>
                useBackendFocusSync(true)
            );

            expect(mockAddEventListener).toHaveBeenCalledTimes(2);

            const handler1 = mockAddEventListener.mock.calls[0]?.[1];
            const handler2 = mockAddEventListener.mock.calls[1]?.[1];

            // Both handlers should work independently
            if (handler1) {
                handler1();
            }
            if (handler2) {
                handler2();
            }

            expect(mockfullResyncSites).toHaveBeenCalledTimes(2);

            // Clean up first instance
            unmount1();
            expect(mockRemoveEventListener).toHaveBeenCalledWith(
                "focus",
                handler1
            );

            // Second instance should still work
            handler2();
            expect(mockfullResyncSites).toHaveBeenCalledTimes(3);

            // Clean up second instance
            unmount2();
            expect(mockRemoveEventListener).toHaveBeenCalledWith(
                "focus",
                handler2
            );
        });
    });
});
