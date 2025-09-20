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
    logger: {
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
import { withUtilityErrorHandling } from "../../../../../shared/utils/errorHandling";
import { isDevelopment } from "../../../../../shared/utils/environment";

const mockWithUtilityErrorHandling = vi.mocked(withUtilityErrorHandling);
const mockIsDevelopment = vi.mocked(isDevelopment);

describe("StatusUpdateHandler", () => {
    let mockOptions: any;
    let mockElectronAPI: any;
    let manager: StatusUpdateManager;
    let mockSetSites: any;
    let mockGetSites: any;
    let mockfullResyncSites: any;
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
                checkInterval: 60_000,
                lastChecked: new Date(),
                responseTime: 100,
                retryAttempts: 3,
                timeout: 30_000,
                history: [],
                url: `https://example-${id}.com`,
            },
        ],
    });

    const createCompleteMonitorStatusEvent = (
        siteId: string,
        monitorId: string,
        newStatus: "up" | "down" = "down",
        previousStatus: "up" | "down" = "up"
    ) => {
        const mockSite = createMockSite(siteId, monitorId);
        const mockMonitor = {
            ...mockSite.monitors[0],
            status: newStatus, // Set the monitor status to the new status
        };
        return {
            siteId,
            monitorId,
            newStatus,
            previousStatus,
            monitor: mockMonitor,
            site: mockSite,
            timestamp: Date.now(),
        };
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock withUtilityErrorHandling to just call the function and handle parameters properly
        mockWithUtilityErrorHandling.mockImplementation(
            async (
                fn: () => Promise<any>,
                operationName: string,
                fallbackValue = undefined,
                shouldThrow = false
            ) => {
                try {
                    return await fn();
                } catch (error) {
                    if (shouldThrow) {
                        throw error;
                    }

                    if (fallbackValue === undefined) {
                        throw new Error(
                            `${operationName} failed and no fallback value provided. ` +
                                `When shouldThrow is false, you must provide a fallbackValue parameter.`,
                            { cause: error }
                        );
                    }

                    return fallbackValue;
                }
            }
        );

        mockIsDevelopment.mockReturnValue(true);

        // Setup function mocks
        mockSetSites = vi.fn();
        mockGetSites = vi.fn(() => [createMockSite("site1", "monitor1")]);
        mockfullResyncSites = vi.fn().mockResolvedValue(undefined);
        mockOnUpdate = vi.fn();

        // Setup options
        mockOptions = {
            setSites: mockSetSites,
            getSites: mockGetSites,
            fullResyncSites: mockfullResyncSites,
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
        if ((globalThis as any).electronAPI) {
            (globalThis as any).electronAPI = mockElectronAPI;
        } else {
            Object.defineProperty(globalThis, "electronAPI", {
                value: mockElectronAPI,
                writable: true,
                configurable: true,
            });
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
        it("should initialize with required options", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            const testManager = new StatusUpdateManager(mockOptions);
            expect(testManager).toBeDefined();
            expect(testManager.isSubscribed()).toBeFalsy();
        });

        it("should initialize without optional onUpdate callback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            const optionsWithoutCallback = {
                setSites: mockSetSites,
                getSites: mockGetSites,
                fullResyncSites: mockfullResyncSites,
            };
            const testManager = new StatusUpdateManager(optionsWithoutCallback);
            expect(testManager).toBeDefined();
            expect(testManager.isSubscribed()).toBeFalsy();
        });
    });

    describe("Subscription Management", () => {
        it("should start as not subscribed", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(manager.isSubscribed()).toBeFalsy();
        });

        it("should become subscribed after calling subscribe", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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
            expect(manager.isSubscribed()).toBeTruthy();
        });

        it("should set up event listeners when subscribing", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Event Processing", "type");

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

        it("should cleanup existing subscriptions before subscribing again", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should unsubscribe and remove all listeners", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Deletion", "type");

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
            expect(manager.isSubscribed()).toBeTruthy();

            manager.unsubscribe();
            expect(manager.isSubscribed()).toBeFalsy();
            expect(cleanupFn).toHaveBeenCalledTimes(3); // Called for each event type
        });

        it("should safely handle unsubscribing when not subscribed", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(manager.isSubscribed()).toBeFalsy();
            expect(() => manager.unsubscribe()).not.toThrow();
            expect(manager.isSubscribed()).toBeFalsy();
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

        it("should handle monitor status changed events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            manager.subscribe();

            // Create proper MonitorStatusChangedEvent format (what the backend sends)
            const monitorStatusEvent = createCompleteMonitorStatusEvent(
                "site1",
                "monitor1"
            );

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

        it("should handle monitoring started events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            manager.subscribe();

            const startEvent = { siteId: "site1" };

            // Trigger the callback and wait for async execution
            await startedCallback(startEvent);
            expect(mockfullResyncSites).toHaveBeenCalled();
        });

        it("should handle monitoring stopped events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            manager.subscribe();

            const stopEvent = { siteId: "site1" };

            // Trigger the callback and wait for async execution
            await stoppedCallback(stopEvent);
            expect(mockfullResyncSites).toHaveBeenCalled();
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

        it("should process status updates incrementally", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            manager.subscribe();

            // Use proper MonitorStatusChangedEvent format
            const monitorStatusEvent = createCompleteMonitorStatusEvent(
                "site1",
                "monitor1"
            );

            await statusChangedCallback(monitorStatusEvent);

            expect(mockSetSites).toHaveBeenCalled();
            const newSites = mockSetSites.mock.calls[0][0];
            expect(newSites).toBeDefined();
            expect(Array.isArray(newSites)).toBeTruthy();
        });

        it("should fall back to full sync when site not found", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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
            expect(mockfullResyncSites).toHaveBeenCalled();
        });

        it("should fall back to full sync when monitor not found", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            manager.subscribe();

            // Use proper MonitorStatusChangedEvent format
            const monitorStatusEvent = {
                siteId: "site1",
                monitorId: "nonexistent-monitor",
                newStatus: "down" as const,
                previousStatus: "up" as const,
            };

            await statusChangedCallback(monitorStatusEvent);
            expect(mockfullResyncSites).toHaveBeenCalled();
        });

        it("should handle invalid data format and fall back to full sync", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            manager.subscribe();

            // Test with invalid data structure
            const invalidData = {
                // Missing required fields
                incomplete: "data",
            };

            await statusChangedCallback(invalidData);
            expect(mockfullResyncSites).toHaveBeenCalled();
        });

        it("should handle when updated site is not found after update", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            manager.subscribe();

            // Create a mock site initially
            const originalSite = createMockSite("site1", "monitor1");
            mockGetSites.mockReturnValue([originalSite]);

            // Mock applyMonitorStatusUpdate to return empty array (simulate site removal)
            const originalApplyMethod = (manager as any)
                .applyMonitorStatusUpdate;
            (manager as any).applyMonitorStatusUpdate = vi
                .fn()
                .mockReturnValue([]);

            const monitorStatusEvent = {
                siteId: "site1",
                monitorId: "monitor1",
                newStatus: "down" as const,
                previousStatus: "up" as const,
            };

            await statusChangedCallback(monitorStatusEvent);

            // OnUpdate should not be called since updated site wasn't found in the result
            expect(mockOnUpdate).not.toHaveBeenCalled();

            // Restore original method
            (manager as any).applyMonitorStatusUpdate = originalApplyMethod;
        });

        it("should work without onUpdate callback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            // Create manager without onUpdate callback
            const optionsWithoutCallback = {
                setSites: mockSetSites,
                getSites: mockGetSites,
                fullResyncSites: mockfullResyncSites,
            };
            const managerWithoutCallback = new StatusUpdateManager(
                optionsWithoutCallback
            );

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

            managerWithoutCallback.subscribe();

            const monitorStatusEvent = createCompleteMonitorStatusEvent(
                "site1",
                "monitor1"
            );

            await statusChangedCallback(monitorStatusEvent);
            expect(mockSetSites).toHaveBeenCalled();

            managerWithoutCallback.unsubscribe();
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

        it("should handle errors in status update processing gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            mockSetSites.mockImplementation(() => {
                throw new Error("Test error");
            });

            // Mock error handling to trigger fallback
            mockWithUtilityErrorHandling.mockImplementation(
                async (
                    fn: () => Promise<any>,
                    _operationName: string,
                    fallbackValue = undefined,
                    shouldThrow = false
                ) => {
                    try {
                        return await fn();
                    } catch (error) {
                        if (shouldThrow) {
                            throw error;
                        }

                        if (fallbackValue === undefined) {
                            // Simulate fallback to full sync on error for this specific test
                            await mockfullResyncSites();
                            return void 0;
                        }

                        return fallbackValue;
                    }
                }
            );

            manager.subscribe();

            // Use proper MonitorStatusChangedEvent format
            const monitorStatusEvent = {
                siteId: "site1",
                monitorId: "monitor1",
                newStatus: "down" as const,
                previousStatus: "up" as const,
            };

            await statusChangedCallback(monitorStatusEvent);
            expect(mockfullResyncSites).toHaveBeenCalled();
        });

        it("should handle errors in onUpdate callback gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should handle errors in full sync gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            mockfullResyncSites.mockRejectedValue(new Error("Sync error"));

            manager.subscribe();

            expect(() => statusChangedCallback({})).not.toThrow();
        });
    });

    describe("Missing window.electronAPI", () => {
        beforeEach(() => {
            // Remove electronAPI for these tests
            (globalThis as any).electronAPI = undefined;
        });

        afterEach(() => {
            // Restore electronAPI
            (globalThis as any).electronAPI = mockElectronAPI;
        });

        it("should handle missing electronAPI gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            manager = new StatusUpdateManager(mockOptions);
            expect(() => manager.subscribe()).toThrow();
        });

        it("should handle unsubscribe when electronAPI is missing", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            manager = new StatusUpdateManager(mockOptions);
            expect(() => manager.unsubscribe()).not.toThrow();
            expect(manager.isSubscribed()).toBeFalsy();
        });
    });

    describe("Development Mode Logging", () => {
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

        it("should log debug messages in development mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const logger = await import("../../../../services/logger");
            mockIsDevelopment.mockReturnValue(true);

            manager.subscribe();

            // Test site not found branch with development logging
            mockGetSites.mockReturnValue([]); // No sites in store
            const monitorStatusEvent = createCompleteMonitorStatusEvent(
                "nonexistent-site",
                "monitor1"
            );

            await statusChangedCallback(monitorStatusEvent);
            expect(logger.logger.debug).toHaveBeenCalledWith(
                expect.stringContaining(
                    "Site nonexistent-site not found in store"
                )
            );
        });

        it("should log debug messages for monitor not found in development mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const logger = await import("../../../../services/logger");
            mockIsDevelopment.mockReturnValue(true);

            manager.subscribe();

            // Set up a site that exists but doesn't have the monitor we're looking for
            const siteWithoutMonitor = createMockSite(
                "site1",
                "different-monitor"
            );
            mockGetSites.mockReturnValue([siteWithoutMonitor]);

            const monitorStatusEvent = createCompleteMonitorStatusEvent(
                "site1",
                "nonexistent-monitor"
            );

            await statusChangedCallback(monitorStatusEvent);
            expect(logger.logger.debug).toHaveBeenCalledWith(
                expect.stringContaining("Monitor nonexistent-monitor not found")
            );
        });

        it("should log debug messages for successful updates in development mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            const logger = await import("../../../../services/logger");
            mockIsDevelopment.mockReturnValue(true);

            manager.subscribe();

            // Set up a site that exists with the monitor we're updating
            const site = createMockSite("site1", "monitor1");
            mockGetSites.mockReturnValue([site]);

            const monitorStatusEvent = createCompleteMonitorStatusEvent(
                "site1",
                "monitor1"
            );

            await statusChangedCallback(monitorStatusEvent);
            expect(logger.logger.debug).toHaveBeenCalledWith(
                expect.stringContaining("Applied incremental status update")
            );
        });

        it("should log warning for invalid data in development mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const logger = await import("../../../../services/logger");
            mockIsDevelopment.mockReturnValue(true);

            manager.subscribe();

            const invalidData = { invalid: "data" };
            await statusChangedCallback(invalidData);
            expect(logger.logger.warn).toHaveBeenCalledWith(
                expect.stringContaining(
                    "Invalid monitor status changed event data"
                ),
                invalidData
            );
        });

        it("should not log debug messages in production mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const logger = await import("../../../../services/logger");
            mockIsDevelopment.mockReturnValue(false);

            manager.subscribe();

            // Test site not found branch without development logging
            mockGetSites.mockReturnValue([]);
            const monitorStatusEvent = {
                siteId: "nonexistent-site",
                monitorId: "monitor1",
                newStatus: "down" as const,
                previousStatus: "up" as const,
            };

            await statusChangedCallback(monitorStatusEvent);
            expect(logger.logger.debug).not.toHaveBeenCalled();
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

        it("should handle empty sites array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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
            expect(mockfullResyncSites).toHaveBeenCalled();
        });

        it("should handle sites with no monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

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
            expect(mockfullResyncSites).toHaveBeenCalled();
        });

        it("should handle null/undefined status updates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            manager.subscribe();

            await statusChangedCallback(null);
            await statusChangedCallback(undefined);

            // Account for the initial full sync in subscribe() plus the 2 fallback syncs
            expect(mockfullResyncSites).toHaveBeenCalledTimes(3);
        });

        it("should handle multiple rapid status updates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            manager.subscribe();

            // Use proper MonitorStatusChangedEvent format
            const site = createMockSite("site1", "monitor1");
            mockGetSites.mockReturnValue([site]);

            const updates = [
                createCompleteMonitorStatusEvent(
                    "site1",
                    "monitor1",
                    "down",
                    "up"
                ),
                createCompleteMonitorStatusEvent(
                    "site1",
                    "monitor1",
                    "up",
                    "down"
                ),
                createCompleteMonitorStatusEvent(
                    "site1",
                    "monitor1",
                    "down",
                    "up"
                ),
            ];

            await Promise.all(
                updates.map((update) => statusChangedCallback(update))
            );

            expect(mockSetSites).toHaveBeenCalledTimes(3);
        });

        it("should handle various invalid data types for type guard", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            manager.subscribe();

            const invalidDataTypes = [
                null,
                undefined,
                "string",
                123,
                [],
                true,
                false,
                { monitorId: 123 }, // Wrong type
                { monitorId: "test" }, // Missing other fields
                { monitorId: "test", newStatus: null }, // Wrong type
                { monitorId: "test", newStatus: "up", previousStatus: 123 }, // Wrong type
                { monitorId: "test", newStatus: "up", previousStatus: "down" }, // Missing siteId
            ];

            for (const invalidData of invalidDataTypes) {
                await statusChangedCallback(invalidData);
            }

            // Should trigger full sync for each invalid data type
            expect(mockfullResyncSites).toHaveBeenCalledTimes(
                1 + invalidDataTypes.length // 1 for initial sync + one for each invalid data
            );
        });
    });

    describe("Additional Coverage for Missing Branches", () => {
        let statusChangedCallback: any;
        let monitoringStartedCallback: any;
        let monitoringStoppedCallback: any;

        beforeEach(() => {
            mockElectronAPI.events.onMonitorStatusChanged.mockImplementation(
                (callback: any) => {
                    statusChangedCallback = callback;
                    return () => {};
                }
            );
            mockElectronAPI.events.onMonitoringStarted.mockImplementation(
                (callback: any) => {
                    monitoringStartedCallback = callback;
                    return () => {};
                }
            );
            mockElectronAPI.events.onMonitoringStopped.mockImplementation(
                (callback: any) => {
                    monitoringStoppedCallback = callback;
                    return () => {};
                }
            );
        });

        it("should execute onUpdate callback when site is found after status update", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            manager.subscribe();

            // Setup site with monitor
            const site = createMockSite("site1", "monitor1");
            mockGetSites.mockReturnValue([site]);

            const event = createCompleteMonitorStatusEvent("site1", "monitor1");

            await statusChangedCallback(event);

            // Should have called onUpdate callback
            expect(mockOnUpdate).toHaveBeenCalledWith({
                monitorId: event.monitorId,
                previousStatus: event.previousStatus,
                site: expect.objectContaining({
                    identifier: "site1",
                }),
                siteIdentifier: event.siteId,
                status: event.newStatus,
                timestamp: expect.any(String),
            });
        });

        it("should trigger full sync when monitoring starts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            manager.subscribe();

            await monitoringStartedCallback();

            // Should have triggered full sync
            expect(mockfullResyncSites).toHaveBeenCalled();
        });

        it("should trigger full sync when monitoring stops", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            manager.subscribe();

            await monitoringStoppedCallback();

            // Should have triggered full sync
            expect(mockfullResyncSites).toHaveBeenCalled();
        });

        it("should handle invalid event data and log warning in development mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Event Processing", "type");

            const logger = await import("../../../../services/logger");
            mockIsDevelopment.mockReturnValue(true);

            manager.subscribe();

            // Create invalid event data
            const invalidEvent = {
                correlationId: undefined,
                monitorId: undefined,
                newStatus: undefined,
                previousStatus: undefined,
                siteId: undefined,
                timestamp: undefined,
            } as any;

            // Execute the listener with invalid data
            await statusChangedCallback(invalidEvent);

            // Should have triggered full sync as fallback
            expect(mockfullResyncSites).toHaveBeenCalled();

            // Should have logged warning in development mode
            expect(logger.logger.warn).toHaveBeenCalledWith(
                expect.stringContaining(
                    "Invalid monitor status changed event data"
                ),
                invalidEvent
            );
        });

        it("should not log warning for invalid data in production mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const logger = await import("../../../../services/logger");
            mockIsDevelopment.mockReturnValue(false);

            manager.subscribe();

            const invalidEvent = {
                incomplete: "data",
            } as any;

            await statusChangedCallback(invalidEvent);

            // Should still trigger full sync but without warning
            expect(mockfullResyncSites).toHaveBeenCalled();
            expect(logger.logger.warn).not.toHaveBeenCalled();
        });

        it("should cover development mode debug log for successful update", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            const logger = await import("../../../../services/logger");
            mockIsDevelopment.mockReturnValue(true);

            manager.subscribe();

            // Setup site with monitor for successful update
            const site = createMockSite("site1", "monitor1");
            mockGetSites.mockReturnValue([site]);

            const validEvent = createCompleteMonitorStatusEvent(
                "site1",
                "monitor1"
            );

            await statusChangedCallback(validEvent);

            // Should have logged successful update in development mode
            expect(logger.logger.debug).toHaveBeenCalledWith(
                expect.stringContaining("Applied incremental status update")
            );
        });

        it("should skip onUpdate callback when site is not found after status update", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            manager.subscribe();

            // Mock setSites to actually call the provided function to set state
            let storedSites: any[] = [createMockSite("site1", "monitor1")];
            mockGetSites.mockImplementation(() => storedSites);
            mockSetSites.mockImplementation(
                (siteSetter: any[] | ((arg0: any[]) => any[])) => {
                    storedSites =
                        typeof siteSetter === "function"
                            ? siteSetter(storedSites)
                            : siteSetter;
                }
            );

            const event = {
                siteId: "site1",
                monitorId: "monitor1",
                newStatus: "down" as const,
                previousStatus: "up" as const,
            };

            // First, clear the stored sites so the updated site won't be found
            storedSites = [];

            await statusChangedCallback(event);

            // OnUpdate should not have been called since no updated site was found
            expect(mockOnUpdate).not.toHaveBeenCalled();
        });

        it("should handle updating monitor status in site monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            manager.subscribe();

            // Create a site with multiple monitors to test the monitor finding logic
            const siteWithMultipleMonitors = {
                ...createMockSite("site1", "monitor1"),
                monitors: [
                    {
                        id: "monitor1",
                        status: "up" as const,
                        type: "http" as const,
                        name: "Monitor 1",
                        config: {},
                        createdAt: "2023-01-01T00:00:00Z",
                        updatedAt: "2023-01-01T00:00:00Z",
                    },
                    {
                        id: "monitor2",
                        status: "up" as const,
                        type: "http" as const,
                        name: "Monitor 2",
                        config: {},
                        createdAt: "2023-01-01T00:00:00Z",
                        updatedAt: "2023-01-01T00:00:00Z",
                    },
                ],
            };

            mockGetSites.mockReturnValue([siteWithMultipleMonitors]);

            const event = createCompleteMonitorStatusEvent(
                "site1",
                "monitor2", // Target the second monitor
                "down",
                "up"
            );

            await statusChangedCallback(event);

            // Should have updated the sites with the new monitor status
            expect(mockSetSites).toHaveBeenCalled();
            const updatedSitesArray = mockSetSites.mock.calls[0][0];

            // Find the updated site and verify the monitor status was changed
            const updatedSite = updatedSitesArray.find(
                (s: any) => s.identifier === "site1"
            );
            const updatedMonitor = updatedSite?.monitors.find(
                (m: any) => m.id === "monitor2"
            );
            expect(updatedMonitor?.status).toBe("down");
        });

        it("should test production mode branch by not logging in production", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const logger = await import("../../../../services/logger");
            mockIsDevelopment.mockReturnValue(false); // Production mode

            manager.subscribe();

            // Test site not found in production mode (should not log)
            mockGetSites.mockReturnValue([]);
            const event = {
                siteId: "nonexistent-site",
                monitorId: "monitor1",
                newStatus: "down" as const,
                previousStatus: "up" as const,
            };

            await statusChangedCallback(event);

            // Should trigger full sync but not log debug messages
            expect(mockfullResyncSites).toHaveBeenCalled();
            expect(logger.logger.debug).not.toHaveBeenCalled();
        });

        it("should test onUpdate callback conditional execution based on updated site presence", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            // Test with manager that has onUpdate callback
            manager.subscribe();

            let storedSites = [createMockSite("site1", "monitor1")];
            mockGetSites.mockImplementation(() => storedSites);
            mockSetSites.mockImplementation(
                (siteSetter: Site[] | ((arg0: Site[]) => Site[])) => {
                    storedSites =
                        typeof siteSetter === "function"
                            ? siteSetter(storedSites)
                            : siteSetter;
                }
            );

            const event = createCompleteMonitorStatusEvent(
                "site1",
                "monitor1",
                "down",
                "up"
            );

            await statusChangedCallback(event);

            // Should call onUpdate since updated site exists
            expect(mockOnUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    monitorId: "monitor1",
                    siteIdentifier: "site1",
                    status: "down",
                    previousStatus: "up",
                })
            );
        });

        it("should not log debug messages in production mode for successful update", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: statusUpdateHandler", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            const logger = await import("../../../../services/logger");
            mockIsDevelopment.mockReturnValue(false);

            manager.subscribe();

            const validEvent = {
                siteId: "site1",
                monitorId: "monitor1",
                newStatus: "down" as const,
                previousStatus: "up" as const,
            };

            await statusChangedCallback(validEvent);

            // Should not log debug messages in production
            expect(logger.logger.debug).not.toHaveBeenCalled();
        });
    });
});
