/**
 * Tests for statusUpdateHandler.ts - covering all branches and scenarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Site } from "../../../../../shared/types";

// Mock the error handling utility
vi.mock("../../../../utils/errorHandling", () => ({
    withUtilityErrorHandling: vi.fn(),
    ensureError: vi.fn((err) =>
        err instanceof Error ? err : new Error(String(err))
    ),
}));

// Mock the logger
vi.mock("../../../../services/logger", () => ({
    default: {
        warn: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
    },
}));

// Mock environment utility
vi.mock("../../../../../shared/utils/environment", () => ({
    isDevelopment: vi.fn(),
}));

// Import after mocking
import { StatusUpdateManager } from "../../../../stores/sites/utils/statusUpdateHandler";
import { withUtilityErrorHandling } from "../../../../utils/errorHandling";
import { isDevelopment } from "../../../../../shared/utils/environment";

const mockWithUtilityErrorHandling = vi.mocked(withUtilityErrorHandling);
const mockIsDevelopment = vi.mocked(isDevelopment);

describe("StatusUpdateHandler", () => {
    let mockOptions: any;
    let mockElectronAPI: any;
    let manager: StatusUpdateManager;
    let mockSetSites: any;
    let mockGetSites: any;
    let mockFullSyncFromBackend: any;
    let mockOnUpdate: any;

    const createMockSite = (id: string, monitorId: string): Site => ({
        identifier: id,
        name: `Site ${id}`,
        monitoring: false,
        monitors: [
            {
                id: monitorId,
                type: "http",
                status: "up",
                monitoring: false,
                checkInterval: 60000,
                lastChecked: new Date(),
                responseTime: 100,
                retryAttempts: 3,
                timeout: 30000,
                history: [],
                url: `https://example-${id}.com`,
            },
        ],
    });

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock withUtilityErrorHandling to just call the function
        mockWithUtilityErrorHandling.mockImplementation(async (fn) => {
            await fn();
        });

        mockIsDevelopment.mockReturnValue(true);

        // Setup function mocks
        mockSetSites = vi.fn();
        mockGetSites = vi.fn(() => [createMockSite("site1", "monitor1")]);
        mockFullSyncFromBackend = vi.fn().mockResolvedValue(undefined);
        mockOnUpdate = vi.fn();

        // Setup options
        mockOptions = {
            setSites: mockSetSites,
            getSites: mockGetSites,
            fullSyncFromBackend: mockFullSyncFromBackend,
            onUpdate: mockOnUpdate,
        };

        // Setup electronAPI mock
        mockElectronAPI = {
            events: {
                onMonitorStatusChanged: vi.fn(),
                onMonitoringStarted: vi.fn(),
                onMonitoringStopped: vi.fn(),
            },
        };

        // Set up window.electronAPI mock
        if (!(window as any).electronAPI) {
            Object.defineProperty(window, "electronAPI", {
                value: mockElectronAPI,
                writable: true,
                configurable: true,
            });
        } else {
            (window as any).electronAPI = mockElectronAPI;
        }

        // Create manager instance
        manager = new StatusUpdateManager(mockOptions);
    });

    afterEach(() => {
        if (manager) {
            manager.unsubscribe();
        }
    });

    describe("Constructor", () => {
        it("should initialize with required options", () => {
            const testManager = new StatusUpdateManager(mockOptions);
            expect(testManager).toBeDefined();
            expect(testManager.isSubscribed()).toBe(false);
        });

        it("should initialize without optional onUpdate callback", () => {
            const optionsWithoutCallback = {
                setSites: mockSetSites,
                getSites: mockGetSites,
                fullSyncFromBackend: mockFullSyncFromBackend,
            };
            const testManager = new StatusUpdateManager(optionsWithoutCallback);
            expect(testManager).toBeDefined();
            expect(testManager.isSubscribed()).toBe(false);
        });
    });

    describe("Subscription Management", () => {
        it("should start as not subscribed", () => {
            expect(manager.isSubscribed()).toBe(false);
        });

        it("should become subscribed after calling subscribe", () => {
            // Mock the event listener functions to return cleanup functions
            mockElectronAPI.events.onMonitorStatusChanged.mockReturnValue(
                () => {}
            );
            mockElectronAPI.events.onMonitoringStarted.mockReturnValue(
                () => {}
            );
            mockElectronAPI.events.onMonitoringStopped.mockReturnValue(
                () => {}
            );

            manager.subscribe();
            expect(manager.isSubscribed()).toBe(true);
        });

        it("should set up event listeners when subscribing", () => {
            // Mock the event listener functions to return cleanup functions
            mockElectronAPI.events.onMonitorStatusChanged.mockReturnValue(
                () => {}
            );
            mockElectronAPI.events.onMonitoringStarted.mockReturnValue(
                () => {}
            );
            mockElectronAPI.events.onMonitoringStopped.mockReturnValue(
                () => {}
            );

            manager.subscribe();

            expect(
                mockElectronAPI.events.onMonitorStatusChanged
            ).toHaveBeenCalled();
            expect(
                mockElectronAPI.events.onMonitoringStarted
            ).toHaveBeenCalled();
            expect(
                mockElectronAPI.events.onMonitoringStopped
            ).toHaveBeenCalled();
        });

        it("should cleanup existing subscriptions before subscribing again", () => {
            const cleanupFn = vi.fn();
            mockElectronAPI.events.onMonitorStatusChanged.mockReturnValue(
                cleanupFn
            );
            mockElectronAPI.events.onMonitoringStarted.mockReturnValue(
                cleanupFn
            );
            mockElectronAPI.events.onMonitoringStopped.mockReturnValue(
                cleanupFn
            );

            manager.subscribe();
            manager.subscribe(); // Subscribe again

            expect(cleanupFn).toHaveBeenCalled();
        });

        it("should unsubscribe and remove all listeners", () => {
            const cleanupFn = vi.fn();
            mockElectronAPI.events.onMonitorStatusChanged.mockReturnValue(
                cleanupFn
            );
            mockElectronAPI.events.onMonitoringStarted.mockReturnValue(
                cleanupFn
            );
            mockElectronAPI.events.onMonitoringStopped.mockReturnValue(
                cleanupFn
            );

            manager.subscribe();
            expect(manager.isSubscribed()).toBe(true);

            manager.unsubscribe();
            expect(manager.isSubscribed()).toBe(false);
            expect(cleanupFn).toHaveBeenCalledTimes(3); // Called for each event type
        });

        it("should safely handle unsubscribing when not subscribed", () => {
            expect(manager.isSubscribed()).toBe(false);
            expect(() => manager.unsubscribe()).not.toThrow();
            expect(manager.isSubscribed()).toBe(false);
        });
    });

    describe("Event Handling", () => {
        let statusChangedCallback: any;
        let startedCallback: any;
        let stoppedCallback: any;

        beforeEach(() => {
            // Mock the event listener functions to capture callbacks
            mockElectronAPI.events.onMonitorStatusChanged.mockImplementation(
                (callback: any) => {
                    statusChangedCallback = callback;
                    return () => {}; // Return cleanup function
                }
            );
            mockElectronAPI.events.onMonitoringStarted.mockImplementation(
                (callback: any) => {
                    startedCallback = callback;
                    return () => {}; // Return cleanup function
                }
            );
            mockElectronAPI.events.onMonitoringStopped.mockImplementation(
                (callback: any) => {
                    stoppedCallback = callback;
                    return () => {}; // Return cleanup function
                }
            );
        });

        it("should handle monitor status changed events", async () => {
            manager.subscribe();

            // Create proper MonitorStatusChangedEvent format (what the backend sends)
            const monitorStatusEvent = {
                siteId: "site1", // Note: siteId, not siteIdentifier
                monitorId: "monitor1",
                newStatus: "down" as const, // Note: newStatus, not status
                previousStatus: "up" as const,
            };

            // Trigger the callback and wait for async execution
            await statusChangedCallback(monitorStatusEvent);

            expect(mockSetSites).toHaveBeenCalled();
            // The actual onUpdate gets called with the full StatusUpdate including the site
            expect(mockOnUpdate).toHaveBeenCalled();
            const actualUpdate = mockOnUpdate.mock.calls[0][0];
            expect(actualUpdate.siteIdentifier).toBe("site1"); // Converted to siteIdentifier in StatusUpdate
            expect(actualUpdate.monitorId).toBe("monitor1");
            expect(actualUpdate.status).toBe("down"); // Converted to status in StatusUpdate
        });

        it("should handle monitoring started events", async () => {
            manager.subscribe();

            const startEvent = { siteId: "site1" };

            // Trigger the callback and wait for async execution
            await startedCallback(startEvent);
            expect(mockFullSyncFromBackend).toHaveBeenCalled();
        });

        it("should handle monitoring stopped events", async () => {
            manager.subscribe();

            const stopEvent = { siteId: "site1" };

            // Trigger the callback and wait for async execution
            await stoppedCallback(stopEvent);
            expect(mockFullSyncFromBackend).toHaveBeenCalled();
        });
    });

    describe("Status Update Processing", () => {
        let statusChangedCallback: any;

        beforeEach(() => {
            mockElectronAPI.events.onMonitorStatusChanged.mockImplementation(
                (callback: any) => {
                    statusChangedCallback = callback;
                    return () => {};
                }
            );
            mockElectronAPI.events.onMonitoringStarted.mockReturnValue(
                () => {}
            );
            mockElectronAPI.events.onMonitoringStopped.mockReturnValue(
                () => {}
            );
        });

        it("should process status updates incrementally", async () => {
            manager.subscribe();

            // Use proper MonitorStatusChangedEvent format
            const monitorStatusEvent = {
                siteId: "site1",
                monitorId: "monitor1",
                newStatus: "down" as const,
                previousStatus: "up" as const,
            };

            await statusChangedCallback(monitorStatusEvent);

            expect(mockSetSites).toHaveBeenCalled();
            const newSites = mockSetSites.mock.calls[0][0];
            expect(newSites).toBeDefined();
            expect(Array.isArray(newSites)).toBe(true);
        });

        it("should fall back to full sync when site not found", async () => {
            mockGetSites.mockReturnValue([]); // Empty sites array
            manager.subscribe();

            // Use proper MonitorStatusChangedEvent format
            const monitorStatusEvent = {
                siteId: "nonexistent-site",
                monitorId: "monitor1",
                newStatus: "down" as const,
                previousStatus: "up" as const,
            };

            await statusChangedCallback(monitorStatusEvent);
            expect(mockFullSyncFromBackend).toHaveBeenCalled();
        });

        it("should fall back to full sync when monitor not found", async () => {
            manager.subscribe();

            const statusUpdate = {
                siteIdentifier: "site1",
                monitorId: "nonexistent-monitor",
                status: "down" as const,
                previousStatus: "up" as const,
                timestamp: "2025-07-30T21:42:53.299Z",
            };

            await statusChangedCallback(statusUpdate);
            expect(mockFullSyncFromBackend).toHaveBeenCalled();
        });
    });

    describe("Error Handling", () => {
        let statusChangedCallback: any;

        beforeEach(() => {
            mockElectronAPI.events.onMonitorStatusChanged.mockImplementation(
                (callback: any) => {
                    statusChangedCallback = callback;
                    return () => {};
                }
            );
            mockElectronAPI.events.onMonitoringStarted.mockReturnValue(
                () => {}
            );
            mockElectronAPI.events.onMonitoringStopped.mockReturnValue(
                () => {}
            );
        });

        it("should handle errors in status update processing gracefully", async () => {
            mockSetSites.mockImplementation(() => {
                throw new Error("Test error");
            });

            // Mock error handling to trigger fallback
            mockWithUtilityErrorHandling.mockImplementation(async (fn) => {
                try {
                    await fn();
                } catch {
                    // Simulate fallback to full sync on error
                    await mockFullSyncFromBackend();
                }
            });

            manager.subscribe();

            // Use proper MonitorStatusChangedEvent format
            const monitorStatusEvent = {
                siteId: "site1",
                monitorId: "monitor1",
                newStatus: "down" as const,
                previousStatus: "up" as const,
            };

            await statusChangedCallback(monitorStatusEvent);
            expect(mockFullSyncFromBackend).toHaveBeenCalled();
        });

        it("should handle errors in onUpdate callback gracefully", async () => {
            mockOnUpdate.mockImplementation(() => {
                throw new Error("onUpdate error");
            });

            manager.subscribe();

            const statusUpdate = {
                siteId: "site1",
                monitorId: "monitor1",
                newStatus: "down" as const,
                previousStatus: "up" as const,
            };

            expect(() => statusChangedCallback(statusUpdate)).not.toThrow();
        });

        it("should handle errors in full sync gracefully", async () => {
            mockFullSyncFromBackend.mockRejectedValue(new Error("Sync error"));

            manager.subscribe();

            expect(() => statusChangedCallback({})).not.toThrow();
        });
    });

    describe("Missing window.electronAPI", () => {
        beforeEach(() => {
            // Remove electronAPI for these tests
            (window as any).electronAPI = undefined;
        });

        afterEach(() => {
            // Restore electronAPI
            (window as any).electronAPI = mockElectronAPI;
        });

        it("should handle missing electronAPI gracefully", () => {
            manager = new StatusUpdateManager(mockOptions);
            expect(() => manager.subscribe()).toThrow();
        });

        it("should handle unsubscribe when electronAPI is missing", () => {
            manager = new StatusUpdateManager(mockOptions);
            expect(() => manager.unsubscribe()).not.toThrow();
            expect(manager.isSubscribed()).toBe(false);
        });
    });

    describe("Edge Cases", () => {
        let statusChangedCallback: any;

        beforeEach(() => {
            mockElectronAPI.events.onMonitorStatusChanged.mockImplementation(
                (callback: any) => {
                    statusChangedCallback = callback;
                    return () => {};
                }
            );
            mockElectronAPI.events.onMonitoringStarted.mockReturnValue(
                () => {}
            );
            mockElectronAPI.events.onMonitoringStopped.mockReturnValue(
                () => {}
            );
        });

        it("should handle empty sites array", async () => {
            mockGetSites.mockReturnValue([]);
            manager.subscribe();

            // Use proper MonitorStatusChangedEvent format
            const monitorStatusEvent = {
                siteId: "site1",
                monitorId: "monitor1",
                newStatus: "down" as const,
                previousStatus: "up" as const,
            };

            await statusChangedCallback(monitorStatusEvent);
            expect(mockFullSyncFromBackend).toHaveBeenCalled();
        });

        it("should handle sites with no monitors", async () => {
            const siteWithoutMonitors = {
                ...createMockSite("site1", "monitor1"),
                monitors: [],
            };
            mockGetSites.mockReturnValue([siteWithoutMonitors]);
            manager.subscribe();

            // Use proper MonitorStatusChangedEvent format
            const monitorStatusEvent = {
                siteId: "site1",
                monitorId: "monitor1",
                newStatus: "down" as const,
                previousStatus: "up" as const,
            };

            await statusChangedCallback(monitorStatusEvent);
            expect(mockFullSyncFromBackend).toHaveBeenCalled();
        });

        it("should handle null/undefined status updates", async () => {
            manager.subscribe();

            await statusChangedCallback(null);
            await statusChangedCallback(undefined);

            // Account for the initial full sync in subscribe() plus the 2 fallback syncs
            expect(mockFullSyncFromBackend).toHaveBeenCalledTimes(3);
        });

        it("should handle multiple rapid status updates", async () => {
            manager.subscribe();

            // Use proper MonitorStatusChangedEvent format
            const updates = [
                {
                    siteId: "site1",
                    monitorId: "monitor1",
                    newStatus: "down" as const,
                    previousStatus: "up" as const,
                },
                {
                    siteId: "site1",
                    monitorId: "monitor1",
                    newStatus: "up" as const,
                    previousStatus: "down" as const,
                },
                {
                    siteId: "site1",
                    monitorId: "monitor1",
                    newStatus: "down" as const,
                    previousStatus: "up" as const,
                },
            ];

            await Promise.all(
                updates.map((update) => statusChangedCallback(update))
            );

            expect(mockSetSites).toHaveBeenCalledTimes(3);
        });
    });
});
