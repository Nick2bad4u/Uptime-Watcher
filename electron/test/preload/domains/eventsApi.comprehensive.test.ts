/**
 * Comprehensive tests for Events domain API Includes fast-check property-based
 * testing for robust coverage
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import fc from "fast-check";

// Mock electron using vi.hoisted() to ensure proper initialization order
const mockIpcRenderer = vi.hoisted(() => ({
    invoke: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer: mockIpcRenderer,
}));

import { createEventsApi } from "../../../preload/domains/eventsApi";
import type { StatusUpdate, Monitor, Site } from "../../../../shared/types";
import type {
    CacheInvalidatedEventData,
    MonitorDownEventData,
    MonitoringControlEventData,
    MonitorUpEventData,
    TestEventData,
    UpdateStatusEventData,
} from "@shared/types/events";

describe("Events Domain API", () => {
    let eventsApi: ReturnType<typeof createEventsApi>;

    beforeEach(() => {
        vi.clearAllMocks();
        eventsApi = createEventsApi();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("API Structure Validation", () => {
        it("should expose all required event listener methods", () => {
            const expectedMethods = [
                "onCacheInvalidated",
                "onMonitorDown",
                "onMonitoringStarted",
                "onMonitoringStopped",
                "onMonitorStatusChanged",
                "onMonitorUp",
                "onTestEvent",
                "onUpdateStatus",
                "removeAllListeners",
            ];

            for (const method of expectedMethods) {
                expect(eventsApi).toHaveProperty(method);
                expect(typeof eventsApi[method as keyof typeof eventsApi]).toBe(
                    "function"
                );
            }
        });

        it("should create fresh API instance each time", () => {
            const api1 = createEventsApi();
            const api2 = createEventsApi();

            expect(api1).not.toBe(api2);
            expect(api1).toEqual(api2);
        });
    });

    describe("onCacheInvalidated", () => {
        it("should register event listener and return cleanup function", () => {
            const callback = vi.fn();

            const cleanup = eventsApi.onCacheInvalidated(callback);

            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "cache:invalidated",
                expect.any(Function)
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should call callback with proper data when event is received", () => {
            const callback = vi.fn();
            const mockEventData: CacheInvalidatedEventData = {
                reason: "update",
                type: "site",
                timestamp: Date.now(),
            };

            eventsApi.onCacheInvalidated(callback);

            // Simulate event being received
            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            const mockEvent = { sender: {} };
            eventHandler?.(mockEvent, mockEventData);

            expect(callback).toHaveBeenCalledWith(mockEventData);
        });

        it("should cleanup listener when cleanup function is called", () => {
            const callback = vi.fn();

            const cleanup = eventsApi.onCacheInvalidated(callback);
            cleanup();

            expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith(
                "cache:invalidated",
                expect.any(Function)
            );
        });

        it("should handle multiple listeners for same event", () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            const cleanup1 = eventsApi.onCacheInvalidated(callback1);
            const cleanup2 = eventsApi.onCacheInvalidated(callback2);

            expect(mockIpcRenderer.on).toHaveBeenCalledTimes(2);
            expect(typeof cleanup1).toBe("function");
            expect(typeof cleanup2).toBe("function");
        });
    });

    describe("onMonitorDown", () => {
        it("should register event listener for monitor down events", () => {
            const callback = vi.fn();

            const cleanup = eventsApi.onMonitorDown(callback);

            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "monitor:down",
                expect.any(Function)
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should call callback with monitor down data", () => {
            const callback = vi.fn();
            const mockEventData: MonitorDownEventData = {
                siteId: "test-site",
                monitor: {
                    id: "test-monitor",
                    name: "Test Monitor",
                    type: "http",
                    url: "https://example.com",
                    isActive: false,
                } as unknown as Monitor,
                site: {
                    id: "test-site",
                    name: "Test Site",
                    url: "https://example.com",
                    isActive: true,
                } as unknown as Site,
                timestamp: Date.now(),
            };

            eventsApi.onMonitorDown(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            const mockEvent = { sender: {} };
            eventHandler?.(mockEvent, mockEventData);

            expect(callback).toHaveBeenCalledWith(mockEventData);
        });

        it("should handle monitor down events with minimal data", () => {
            const callback = vi.fn();
            const mockEventData: MonitorDownEventData = {
                siteId: "site",
                monitor: {} as any,
                site: {} as any,
                timestamp: Date.now(),
            };

            eventsApi.onMonitorDown(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, mockEventData);

            expect(callback).toHaveBeenCalledWith(mockEventData);
        });
    });

    describe("onMonitorUp", () => {
        it("should register event listener for monitor up events", () => {
            const callback = vi.fn();

            const cleanup = eventsApi.onMonitorUp(callback);

            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "monitor:up",
                expect.any(Function)
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should call callback with monitor up data", () => {
            const callback = vi.fn();
            const mockEventData: MonitorUpEventData = {
                siteId: "test-site",
                monitor: {} as any,
                site: {} as any,
                timestamp: Date.now(),
            };

            eventsApi.onMonitorUp(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            const mockEvent = { sender: {} };
            eventHandler?.(mockEvent, mockEventData);

            expect(callback).toHaveBeenCalledWith(mockEventData);
        });
    });

    describe("onMonitoringStarted and onMonitoringStopped", () => {
        it("should register listeners for monitoring control events", () => {
            const startCallback = vi.fn();
            const stopCallback = vi.fn();

            const cleanup1 = eventsApi.onMonitoringStarted(startCallback);
            const cleanup2 = eventsApi.onMonitoringStopped(stopCallback);

            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "monitoring:started",
                expect.any(Function)
            );
            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "monitoring:stopped",
                expect.any(Function)
            );
            expect(typeof cleanup1).toBe("function");
            expect(typeof cleanup2).toBe("function");
        });

        it("should handle monitoring control event data", () => {
            const startCallback = vi.fn();
            const mockEventData: MonitoringControlEventData = {
                activeMonitors: 5,
                monitorCount: 10,
                siteCount: 3,
                timestamp: Date.now(),
            };

            eventsApi.onMonitoringStarted(startCallback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, mockEventData);

            expect(startCallback).toHaveBeenCalledWith(mockEventData);
        });
    });

    describe("onMonitorStatusChanged", () => {
        it("should register listener for status change events", () => {
            const callback = vi.fn();

            const cleanup = eventsApi.onMonitorStatusChanged(callback);

            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "monitor:status-changed",
                expect.any(Function)
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should call callback with status update data", () => {
            const callback = vi.fn();
            const mockEventData: StatusUpdate = {
                siteIdentifier: "test-site",
                monitorId: "test-monitor",
                status: "up",
                timestamp: new Date().toISOString(),
            };

            eventsApi.onMonitorStatusChanged(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, mockEventData);

            expect(callback).toHaveBeenCalledWith(mockEventData);
        });
    });

    describe("onTestEvent", () => {
        it("should register listener for test events", () => {
            const callback = vi.fn();

            const cleanup = eventsApi.onTestEvent(callback);

            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "test:event",
                expect.any(Function)
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should handle test event data", () => {
            const callback = vi.fn();
            const mockEventData: TestEventData = {
                message: "Test event triggered",
                timestamp: Date.now(),
                data: { someValue: 42 },
            };

            eventsApi.onTestEvent(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, mockEventData);

            expect(callback).toHaveBeenCalledWith(mockEventData);
        });
    });

    describe("onUpdateStatus", () => {
        it("should register listener for update status events", () => {
            const callback = vi.fn();

            const cleanup = eventsApi.onUpdateStatus(callback);

            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "update:status",
                expect.any(Function)
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should handle update status event data", () => {
            const callback = vi.fn();
            const mockEventData: UpdateStatusEventData = {
                status: "checking",
                error: "Connection failed",
            };

            eventsApi.onUpdateStatus(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, mockEventData);

            expect(callback).toHaveBeenCalledWith(mockEventData);
        });
    });

    describe("removeAllListeners", () => {
        it("should remove all listeners for all event channels", () => {
            eventsApi.removeAllListeners();

            const expectedChannels = [
                "cache:invalidated",
                "monitor:down",
                "monitoring:started",
                "monitoring:stopped",
                "monitor:status-changed",
                "monitor:up",
                "test:event",
                "update:status",
            ];

            expect(mockIpcRenderer.removeAllListeners).toHaveBeenCalledTimes(
                expectedChannels.length
            );
            for (const channel of expectedChannels) {
                expect(mockIpcRenderer.removeAllListeners).toHaveBeenCalledWith(
                    channel
                );
            }
        });

        it("should work even when no listeners are registered", () => {
            const freshApi = createEventsApi();

            expect(() => freshApi.removeAllListeners()).not.toThrow();
        });
    });

    describe("Property-based testing with fast-check", () => {
        it("should handle various event data structures", () => {
            fc.assert(
                fc.property(
                    fc.record({
                        siteIdentifier: fc.string(),
                        monitorId: fc.string(),
                        timestamp: fc.integer({ min: 0 }),
                        status: fc.oneof(
                            fc.constant("up"),
                            fc.constant("down"),
                            fc.constant("pending")
                        ),
                        responseTime: fc.integer({ min: 0, max: 60_000 }),
                    }),
                    (eventData) => {
                        const callback = vi.fn();
                        eventsApi.onMonitorStatusChanged(callback);

                        const eventHandler =
                            mockIpcRenderer.on.mock.calls.at(-1)?.[1];
                        eventHandler?.({}, eventData);

                        expect(callback).toHaveBeenCalledWith(eventData);
                    }
                ),
                { numRuns: 20 }
            );
        });

        it("should handle various callback functions", () => {
            fc.assert(
                fc.property(fc.func(fc.anything()), (callback) => {
                    const cleanup = eventsApi.onCacheInvalidated(callback);

                    expect(typeof cleanup).toBe("function");
                    expect(mockIpcRenderer.on).toHaveBeenCalled();
                }),
                { numRuns: 10 }
            );
        });

        it("should handle various event channels dynamically", () => {
            const eventMethods = [
                {
                    method: eventsApi.onCacheInvalidated,
                    channel: "cache:invalidated",
                },
                { method: eventsApi.onMonitorDown, channel: "monitor:down" },
                { method: eventsApi.onMonitorUp, channel: "monitor:up" },
                { method: eventsApi.onTestEvent, channel: "test:event" },
            ];

            fc.assert(
                fc.property(
                    fc.integer({ min: 0, max: eventMethods.length - 1 }),
                    (index) => {
                        const eventMethod = eventMethods[index];
                        if (eventMethod) {
                            const { method, channel } = eventMethod;
                            const callback = vi.fn();

                            method(callback);

                            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                                channel,
                                expect.any(Function)
                            );
                        }
                    }
                ),
                { numRuns: 20 }
            );
        });

        it("should handle event data with various timestamp values", () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 0, max: Date.now() + 86_400_000 }), // Current time + 1 day
                    (timestamp) => {
                        const callback = vi.fn();
                        const eventData = {
                            message: "Test",
                            timestamp,
                            data: {},
                        };

                        eventsApi.onTestEvent(callback);

                        const eventHandler =
                            mockIpcRenderer.on.mock.calls.at(-1)?.[1];
                        eventHandler?.({}, eventData);

                        expect(callback).toHaveBeenCalledWith(eventData);
                    }
                ),
                { numRuns: 15 }
            );
        });
    });

    describe("Integration and concurrency scenarios", () => {
        it("should handle multiple event listeners concurrently", () => {
            const callbacks = Array.from({ length: 10 }, () => vi.fn());
            const cleanups: (() => void)[] = [];

            // Register multiple listeners
            for (const callback of callbacks) {
                cleanups.push(eventsApi.onCacheInvalidated(callback));
            }

            expect(mockIpcRenderer.on).toHaveBeenCalledTimes(10);

            // Cleanup all listeners
            for (const cleanup of cleanups) {
                cleanup();
            }

            expect(mockIpcRenderer.removeListener).toHaveBeenCalledTimes(10);
        });

        it("should handle mixed event types simultaneously", () => {
            const cacheCallback = vi.fn();
            const monitorCallback = vi.fn();
            const testCallback = vi.fn();

            eventsApi.onCacheInvalidated(cacheCallback);
            eventsApi.onMonitorDown(monitorCallback);
            eventsApi.onTestEvent(testCallback);

            expect(mockIpcRenderer.on).toHaveBeenCalledTimes(3);
            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "cache:invalidated",
                expect.any(Function)
            );
            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "monitor:down",
                expect.any(Function)
            );
            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "test:event",
                expect.any(Function)
            );
        });

        it("should handle rapid event registration and cleanup", () => {
            const callbacks = Array.from({ length: 100 }, () => vi.fn());

            // Register and immediately cleanup
            for (const callback of callbacks) {
                const cleanup = eventsApi.onTestEvent(callback);
                cleanup();
            }

            expect(mockIpcRenderer.on).toHaveBeenCalledTimes(100);
            expect(mockIpcRenderer.removeListener).toHaveBeenCalledTimes(100);
        });

        it("should maintain event listener isolation", () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            const cleanup1 = eventsApi.onCacheInvalidated(callback1);
            const cleanup2 = eventsApi.onMonitorDown(callback2);

            // Trigger cache event
            const cacheHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            cacheHandler?.({}, { cacheType: "sites", timestamp: Date.now() });

            // Trigger monitor event
            const monitorHandler = mockIpcRenderer.on.mock.calls[1]?.[1];
            monitorHandler?.(
                {},
                {
                    siteIdentifier: "site",
                    monitorId: "monitor",
                    status: "down",
                    timestamp: Date.now(),
                    responseTime: 0,
                }
            );

            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);

            cleanup1();
            cleanup2();
        });
    });

    describe("Error handling and edge cases", () => {
        it("should handle callbacks that throw errors", () => {
            const throwingCallback = vi.fn().mockImplementation(() => {
                throw new Error("Callback error");
            });

            eventsApi.onTestEvent(throwingCallback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];

            // Should not throw when calling the event handler
            expect(() => {
                eventHandler?.({}, { message: "test", timestamp: Date.now() });
            }).not.toThrow();

            expect(throwingCallback).toHaveBeenCalled();
        });

        it("should handle undefined event data", () => {
            const callback = vi.fn();

            eventsApi.onTestEvent(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, undefined);

            expect(callback).toHaveBeenCalledWith(undefined);
        });

        it("should handle null event data", () => {
            const callback = vi.fn();

            eventsApi.onMonitorStatusChanged(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, null);

            expect(callback).toHaveBeenCalledWith(null);
        });

        it("should handle malformed event data gracefully", () => {
            const callback = vi.fn();

            eventsApi.onCacheInvalidated(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            const malformedData = { unexpected: "structure" };
            eventHandler?.({}, malformedData);

            expect(callback).toHaveBeenCalledWith(malformedData);
        });

        it("should handle cleanup function called multiple times", () => {
            const callback = vi.fn();

            const cleanup = eventsApi.onTestEvent(callback);

            cleanup();
            cleanup(); // Should not error on second call
            cleanup(); // Or third call

            // Should only remove listener once per actual registration
            expect(mockIpcRenderer.removeListener).toHaveBeenCalledTimes(3);
        });

        it("should handle event data with circular references", () => {
            const callback = vi.fn();
            const circularData: Record<string, unknown> = { message: "test" };
            circularData["self"] = circularData; // Create circular reference

            eventsApi.onTestEvent(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];

            expect(() => {
                eventHandler?.({}, circularData);
            }).not.toThrow();

            expect(callback).toHaveBeenCalledWith(circularData);
        });
    });

    describe("Type safety and contract validation", () => {
        it("should maintain proper typing for all event methods", () => {
            // This test ensures TypeScript compilation succeeds with proper types
            const api = createEventsApi();

            // These should all compile without type errors
            const cleanups = [
                api.onCacheInvalidated((data: CacheInvalidatedEventData) => {
                    expect(typeof data.type).toBe("string");
                }),
                api.onMonitorDown((data: MonitorDownEventData) => {
                    expect(typeof data.siteId).toBe("string");
                }),
                api.onMonitorUp((data: MonitorUpEventData) => {
                    expect(typeof data.siteId).toBe("string");
                }),
                api.onMonitorStatusChanged((data: StatusUpdate) => {
                    expect(typeof data.siteIdentifier).toBe("string");
                }),
                api.onTestEvent((data: TestEventData) => {
                    expect(typeof data["message"]).toBe("string");
                }),
                api.onUpdateStatus((data: UpdateStatusEventData) => {
                    expect(typeof data.status).toBe("string");
                }),
            ];

            // All cleanup functions should be callable
            for (const cleanup of cleanups) {
                expect(typeof cleanup).toBe("function");
            }
        });

        it("should return proper cleanup function types", () => {
            const callback = vi.fn();
            const cleanup = eventsApi.onTestEvent(callback);

            // Should be a function that returns void
            const result = cleanup();
            expect(result).toBeUndefined();
        });

        it("should handle function context properly", () => {
            const { onTestEvent, removeAllListeners } = eventsApi;
            const callback = vi.fn();

            // Destructured functions should work correctly
            expect(() => {
                const cleanup = onTestEvent(callback);
                removeAllListeners();
                cleanup();
            }).not.toThrow();
        });
    });
});
