/**
 * Comprehensive tests for Events domain API Includes fast-check property-based
 * testing for robust coverage
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import fc from "fast-check";

import type { Monitor, Site, StatusHistory } from "@shared/types";
import {
    sampleOne,
    siteNameArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";

// Mock electron using vi.hoisted() to ensure proper initialization order
const mockIpcRenderer = vi.hoisted(() => ({
    invoke: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
}));

const diagnosticsWarnSpy = vi.hoisted(() => vi.fn());
const guardFailureSpy = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const buildPayloadPreviewMock = vi.hoisted(() =>
    vi.fn((payload: unknown) => {
        try {
            return JSON.stringify(payload);
        } catch {
            return undefined;
        }
    })
);

vi.mock("electron", () => ({
    ipcRenderer: mockIpcRenderer,
}));

vi.mock("../../../preload/utils/preloadLogger", () => ({
    buildPayloadPreview: buildPayloadPreviewMock,
    preloadLogger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
    preloadDiagnosticsLogger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: diagnosticsWarnSpy,
    },
    reportPreloadGuardFailure: guardFailureSpy,
}));

import { createEventsApi } from "../../../preload/domains/eventsApi";
import type {
    CacheInvalidatedEventData,
    HistoryLimitUpdatedEventData,
    MonitorCheckCompletedEventData,
    MonitorDownEventData,
    MonitorStatusChangedEventData,
    MonitoringControlEventData,
    MonitorUpEventData,
    TestEventData,
    UpdateStatusEventData,
} from "@shared/types/events";

const createMonitorFixture = (overrides: Partial<Monitor> = {}): Monitor => ({
    activeOperations: [],
    checkInterval: 60_000,
    history: [] as StatusHistory[],
    id: "monitor-123",
    monitoring: true,
    responseTime: 1200,
    retryAttempts: 0,
    status: "up",
    timeout: 30_000,
    type: "http",
    url: "https://example.com",
    ...overrides,
});

const createSiteFixture = (overrides: Partial<Site> = {}): Site => ({
    identifier: "site-abc",
    monitoring: true,
    monitors: [createMonitorFixture()],
    name: overrides.name ?? sampleOne(siteNameArbitrary),
    ...overrides,
});

describe("Events Domain API", () => {
    let eventsApi: ReturnType<typeof createEventsApi>;

    beforeEach(() => {
        vi.clearAllMocks();
        diagnosticsWarnSpy.mockClear();
        guardFailureSpy.mockClear();
        buildPayloadPreviewMock.mockClear();
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
                "onMonitorCheckCompleted",
                "onHistoryLimitUpdated",
                "onMonitoringStarted",
                "onMonitoringStopped",
                "onMonitorStatusChanged",
                "onMonitorUp",
                "onSiteAdded",
                "onSiteRemoved",
                "onSiteUpdated",
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
            // Check that both APIs have the same structure (methods)
            expect(Object.keys(api1)).toEqual(Object.keys(api2));
            // Check that all methods are functions
            for (const key of Object.keys(api1)) {
                expect(typeof api1[key as keyof typeof api1]).toBe("function");
                expect(typeof api2[key as keyof typeof api2]).toBe("function");
            }
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
            const monitor = createMonitorFixture({
                id: "test-monitor",
                status: "down",
            });
            const site = createSiteFixture({
                identifier: "test-site",
                monitors: [monitor],
            });
            const mockEventData: MonitorDownEventData = {
                details: "Synthetic outage detected",
                monitor,
                monitorId: monitor.id,
                previousStatus: "up",
                responseTime: monitor.responseTime,
                site,
                siteIdentifier: site.identifier,
                status: "down",
                timestamp: new Date().toISOString(),
            };

            eventsApi.onMonitorDown(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            const mockEvent = { sender: {} };
            eventHandler?.(mockEvent, mockEventData);

            expect(callback).toHaveBeenCalledWith(mockEventData);
        });

        it("should handle monitor down events with minimal data", () => {
            const callback = vi.fn();
            const monitor = createMonitorFixture({ id: "minimal-monitor" });
            const site = createSiteFixture({
                identifier: "site",
                monitors: [monitor],
            });
            const mockEventData: MonitorDownEventData = {
                monitor,
                monitorId: monitor.id,
                site,
                siteIdentifier: site.identifier,
                status: "down",
                timestamp: new Date().toISOString(),
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
            const monitor = createMonitorFixture({
                id: "test-monitor",
                status: "up",
            });
            const site = createSiteFixture({
                identifier: "test-site",
                monitors: [monitor],
            });
            const mockEventData: MonitorUpEventData = {
                monitor,
                monitorId: monitor.id,
                previousStatus: "down",
                responseTime: monitor.responseTime,
                site,
                siteIdentifier: site.identifier,
                status: "up",
                timestamp: new Date().toISOString(),
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
            const monitor = createMonitorFixture({ id: "test-monitor" });
            const site = createSiteFixture({
                identifier: "test-site",
                monitors: [monitor],
            });
            const mockEventData: MonitorStatusChangedEventData = {
                monitor,
                monitorId: monitor.id,
                site,
                siteIdentifier: site.identifier,
                status: "up",
                timestamp: new Date().toISOString(),
            };

            eventsApi.onMonitorStatusChanged(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, mockEventData);

            expect(callback).toHaveBeenCalledWith(mockEventData);
        });

        it("should accept canonical payloads that include monitor and site context", () => {
            const callback = vi.fn();
            const canonicalPayload: MonitorStatusChangedEventData & {
                monitor: Monitor & Record<string, unknown>;
                site: Site & Record<string, unknown>;
            } = {
                details: "Recovered",
                monitor: createMonitorFixture() as Monitor &
                    Record<string, unknown>,
                monitorId: "monitor-123",
                previousStatus: "down",
                responseTime: 1200,
                site: createSiteFixture() as Site & Record<string, unknown>,
                siteIdentifier: "site-abc",
                status: "up",
                timestamp: new Date().toISOString(),
            };

            mockIpcRenderer.on.mockClear();
            eventsApi.onMonitorStatusChanged(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls.at(-1)?.[1];
            eventHandler?.({}, canonicalPayload);

            expect(callback).toHaveBeenCalledWith(canonicalPayload);
        });

        it("should drop outdated monitor status payloads", () => {
            const callback = vi.fn();
            const outdatedPayload = {
                monitorId: "monitor-outdated",
                newStatus: "down",
                previousStatus: "up",
                // INTENTIONAL: verify preload guard rejects siteId payloads from earlier builds.
                siteId: "site-outdated",
                timestamp: Date.now(),
            };

            mockIpcRenderer.on.mockClear();
            eventsApi.onMonitorStatusChanged(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls.at(-1)?.[1];
            eventHandler?.({}, outdatedPayload);

            expect(callback).not.toHaveBeenCalled();
            expect(diagnosticsWarnSpy).toHaveBeenCalledWith(
                "[eventsApi] Dropped malformed payload for 'monitor:status-changed'",
                expect.objectContaining({
                    guard: expect.stringContaining("isMonitor"),
                    payloadType: "object",
                })
            );
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "monitor:status-changed",
                    guard: expect.stringContaining("isMonitor"),
                    reason: "monitor:status-changed",
                })
            );
        });
    });

    describe("onMonitorCheckCompleted", () => {
        it("should register listener for manual check completion events", () => {
            const callback = vi.fn();

            const cleanup = eventsApi.onMonitorCheckCompleted(callback);

            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "monitor:check-completed",
                expect.any(Function)
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should forward manual check completion payloads to callback", () => {
            const callback = vi.fn();
            const eventData: MonitorCheckCompletedEventData = {
                checkType: "manual",
                monitorId: "monitor-123",
                result: {
                    details: "Manual verification completed",
                    monitor: createMonitorFixture(),
                    monitorId: "monitor-123",
                    previousStatus: "down",
                    site: createSiteFixture(),
                    siteIdentifier: "site-abc",
                    status: "up",
                    timestamp: new Date().toISOString(),
                },
                siteIdentifier: "site-abc",
                timestamp: Date.now(),
            };

            eventsApi.onMonitorCheckCompleted(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, eventData);

            expect(callback).toHaveBeenCalledWith(eventData);
        });

        it("should drop malformed manual check completion payloads", () => {
            const callback = vi.fn();
            const malformedPayload = {
                checkType: "manual",
                monitorId: "monitor-123",
                siteIdentifier: "site-abc",
                timestamp: Date.now(),
                // Missing result payload entirely
            };

            mockIpcRenderer.on.mockClear();
            eventsApi.onMonitorCheckCompleted(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, malformedPayload);

            expect(callback).not.toHaveBeenCalled();
            expect(diagnosticsWarnSpy).toHaveBeenCalledWith(
                "[eventsApi] Dropped malformed payload for 'monitor:check-completed'",
                expect.objectContaining({
                    guard: expect.stringContaining(
                        "isMonitorCheckCompletedEventDataPayload"
                    ),
                    payloadType: "object",
                })
            );
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "monitor:check-completed",
                    guard: "isMonitorCheckCompletedEventDataPayload",
                    reason: "monitor:check-completed",
                })
            );
        });
    });

    describe("onHistoryLimitUpdated", () => {
        it("should register listener for history limit updates", () => {
            const callback = vi.fn();

            const cleanup = eventsApi.onHistoryLimitUpdated(callback);

            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "settings:history-limit-updated",
                expect.any(Function)
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should forward history limit payloads to callback", () => {
            const callback = vi.fn();
            const payload: HistoryLimitUpdatedEventData = {
                limit: 750,
                operation: "history-limit-updated",
                previousLimit: 500,
                timestamp: Date.now(),
            };

            eventsApi.onHistoryLimitUpdated(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, payload);

            expect(callback).toHaveBeenCalledWith(payload);
        });

        it("should reject malformed history limit payloads", () => {
            const callback = vi.fn();

            eventsApi.onHistoryLimitUpdated(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.(
                {},
                {
                    limit: "invalid",
                    operation: "history-limit-updated",
                    timestamp: Date.now(),
                }
            );

            expect(callback).not.toHaveBeenCalled();
            expect(diagnosticsWarnSpy).toHaveBeenCalledWith(
                "[eventsApi] Dropped malformed payload for 'settings:history-limit-updated'",
                expect.objectContaining({
                    guard: "isHistoryLimitUpdatedEventDataPayload",
                    payloadType: "object",
                })
            );
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "settings:history-limit-updated",
                    guard: "isHistoryLimitUpdatedEventDataPayload",
                    reason: "settings:history-limit-updated",
                })
            );
        });
    });

    describe("onSiteAdded", () => {
        it("should register listener for site added events", () => {
            const callback = vi.fn();
            const site = createSiteFixture();
            const payload = {
                site,
                source: "user" as const,
                timestamp: Date.now(),
            };

            const cleanup = eventsApi.onSiteAdded(callback);

            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "site:added",
                expect.any(Function)
            );

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, payload);

            expect(callback).toHaveBeenCalledWith(payload);
            expect(typeof cleanup).toBe("function");
        });

        it("should reject malformed site added payloads", () => {
            const callback = vi.fn();

            eventsApi.onSiteAdded(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.(
                {},
                { site: {}, source: "invalid", timestamp: "bad" }
            );

            expect(callback).not.toHaveBeenCalled();
            expect(diagnosticsWarnSpy).toHaveBeenCalledWith(
                "[eventsApi] Dropped malformed payload for 'site:added'",
                expect.objectContaining({
                    guard: "isSiteAddedEventDataPayload",
                    payloadType: "object",
                })
            );
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "site:added",
                    guard: "isSiteAddedEventDataPayload",
                    reason: "site:added",
                })
            );
        });
    });

    describe("onSiteRemoved", () => {
        it("should register listener for site removed events", () => {
            const callback = vi.fn();
            const payload = {
                cascade: false,
                siteIdentifier: "site-abc",
                siteName: "Example",
                timestamp: Date.now(),
            };

            const cleanup = eventsApi.onSiteRemoved(callback);

            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "site:removed",
                expect.any(Function)
            );

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, payload);

            expect(callback).toHaveBeenCalledWith(payload);
            expect(typeof cleanup).toBe("function");
        });

        it("should reject malformed site removed payloads", () => {
            const callback = vi.fn();

            eventsApi.onSiteRemoved(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, { cascade: "nope", timestamp: "invalid" });

            expect(callback).not.toHaveBeenCalled();
            expect(diagnosticsWarnSpy).toHaveBeenCalledWith(
                "[eventsApi] Dropped malformed payload for 'site:removed'",
                expect.objectContaining({
                    guard: "isSiteRemovedEventDataPayload",
                    payloadType: "object",
                })
            );
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "site:removed",
                    guard: "isSiteRemovedEventDataPayload",
                    reason: "site:removed",
                })
            );
        });
    });

    describe("onSiteUpdated", () => {
        it("should register listener for site updated events", () => {
            const callback = vi.fn();
            const previousSite = createSiteFixture({ name: "Old" });
            const site = createSiteFixture({ name: "New" });
            const payload = {
                previousSite,
                site,
                timestamp: Date.now(),
                updatedFields: ["name"],
            };

            const cleanup = eventsApi.onSiteUpdated(callback);

            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "site:updated",
                expect.any(Function)
            );

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, payload);

            expect(callback).toHaveBeenCalledWith(payload);
            expect(typeof cleanup).toBe("function");
        });

        it("should reject malformed site updated payloads", () => {
            const callback = vi.fn();

            eventsApi.onSiteUpdated(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.(
                {},
                { previousSite: {}, site: {}, updatedFields: "oops" }
            );

            expect(callback).not.toHaveBeenCalled();
            expect(diagnosticsWarnSpy).toHaveBeenCalledWith(
                "[eventsApi] Dropped malformed payload for 'site:updated'",
                expect.objectContaining({
                    guard: "isSiteUpdatedEventDataPayload",
                    payloadType: "object",
                })
            );
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "site:updated",
                    guard: "isSiteUpdatedEventDataPayload",
                    reason: "site:updated",
                })
            );
        });
    });

    describe("onTestEvent", () => {
        it("should register listener for test events", () => {
            const callback = vi.fn();

            const cleanup = eventsApi.onTestEvent(callback);

            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "test-event",
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
                "update-status",
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
            const cleanupHandlers: [string, unknown][] = [];

            eventsApi.onCacheInvalidated(() => {});
            eventsApi.onMonitorDown(() => {});
            eventsApi.onMonitorCheckCompleted(() => {});
            eventsApi.onHistoryLimitUpdated(() => {});
            eventsApi.onMonitoringStarted(() => {});
            eventsApi.onMonitoringStopped(() => {});
            eventsApi.onMonitorStatusChanged(() => {});
            eventsApi.onMonitorUp(() => {});
            eventsApi.onSiteAdded(() => {});
            eventsApi.onSiteRemoved(() => {});
            eventsApi.onSiteUpdated(() => {});
            eventsApi.onTestEvent(() => {});
            eventsApi.onUpdateStatus(() => {});

            // Capture handlers as they were registered.
            for (const [channel, handler] of mockIpcRenderer.on.mock.calls) {
                cleanupHandlers.push([channel as string, handler]);
            }

            eventsApi.removeAllListeners();

            expect(mockIpcRenderer.removeListener).toHaveBeenCalledTimes(
                cleanupHandlers.length
            );

            for (const [channel, handler] of cleanupHandlers) {
                expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith(
                    channel,
                    handler
                );
            }
        });

        it("should work even when no listeners are registered", () => {
            const freshApi = createEventsApi();

            expect(() => freshApi.removeAllListeners()).not.toThrowError();
            expect(mockIpcRenderer.removeListener).not.toHaveBeenCalled();
        });
    });

    describe("Property-based testing with fast-check", () => {
        it("should handle various event data structures", () => {
            const statusValues = [
                "degraded",
                "down",
                "paused",
                "pending",
                "up",
            ] as const;
            const MIN_ISO_TIMESTAMP_MS = -8_640_000_000_000_000 + 1;
            const MAX_ISO_TIMESTAMP_MS = 8_640_000_000_000_000 - 1;
            const nonWhitespaceString = (constraints?: {
                readonly maxLength?: number;
                readonly minLength?: number;
            }) =>
                (() => {
                    const minLength = constraints?.minLength ?? 1;
                    const maxLength =
                        constraints?.maxLength ?? Math.max(32, minLength);

                    return fc
                        .string({
                            maxLength,
                            minLength,
                        })
                        .filter((value) => /\S/u.test(value));
                })();

            const monitorFixtureArbitrary = fc
                .record({
                    id: nonWhitespaceString({ maxLength: 200, minLength: 1 }),
                    monitoring: fc.boolean(),
                    responseTime: fc.nat({ max: 10_000 }),
                    status: fc.constantFrom(...statusValues),
                })
                .map((overrides) =>
                    createMonitorFixture({
                        id: overrides.id,
                        monitoring: overrides.monitoring,
                        responseTime: overrides.responseTime,
                        status: overrides.status,
                    })
                );

            const siteOverrideArbitrary = fc.record({
                identifier: nonWhitespaceString({
                    maxLength: 100,
                    minLength: 1,
                }),
                monitoring: fc.boolean(),
                name: fc.option(
                    nonWhitespaceString({ maxLength: 200, minLength: 1 }),
                    {
                        nil: undefined,
                    }
                ),
            });

            const statusUpdateArbitrary = fc
                .tuple(
                    monitorFixtureArbitrary,
                    siteOverrideArbitrary,
                    fc.option(fc.string(), { nil: undefined }),
                    fc.option(fc.constantFrom(...statusValues), {
                        nil: undefined,
                    }),
                    fc.option(fc.nat({ max: 10_000 }), {
                        nil: undefined,
                    }),
                    fc.constantFrom(...statusValues),
                    fc.date()
                )
                .map(
                    ([
                        monitor,
                        siteOverrides,
                        details,
                        previousStatus,
                        responseTime,
                        status,
                        timestampValue,
                    ]) => {
                        const normalizedTime = (() => {
                            const time = timestampValue.getTime();
                            if (Number.isNaN(time)) {
                                return 0;
                            }
                            return Math.max(
                                MIN_ISO_TIMESTAMP_MS,
                                Math.min(MAX_ISO_TIMESTAMP_MS, time)
                            );
                        })();

                        const site = createSiteFixture({
                            identifier: siteOverrides.identifier,
                            monitoring: siteOverrides.monitoring,
                            ...(siteOverrides.name === undefined
                                ? {}
                                : { name: siteOverrides.name }),
                            monitors: [monitor],
                        });

                        return {
                            details: details ?? "",
                            monitor,
                            monitorId: monitor.id,
                            previousStatus: previousStatus ?? status,
                            responseTime: responseTime ?? 0,
                            site,
                            siteIdentifier: site.identifier,
                            status,
                            timestamp: new Date(normalizedTime).toISOString(),
                        } satisfies MonitorStatusChangedEventData;
                    }
                );

            fc.assert(
                fc.property(statusUpdateArbitrary, (eventData) => {
                    const callback = vi.fn();
                    eventsApi.onMonitorStatusChanged(callback);

                    const eventHandler =
                        mockIpcRenderer.on.mock.calls.at(-1)?.[1];
                    eventHandler?.({}, eventData);

                    expect(callback).toHaveBeenCalledWith(eventData);
                }),
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
                { method: eventsApi.onTestEvent, channel: "test-event" },
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
                "test-event",
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

            const monitor = createMonitorFixture({ id: "monitor" });
            const site = createSiteFixture({
                identifier: "site",
                monitors: [monitor],
            });

            // Trigger cache event
            const cacheHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            cacheHandler?.(
                {},
                {
                    identifier: "site-123",
                    reason: "update",
                    timestamp: Date.now(),
                    type: "site",
                }
            );

            // Trigger monitor event
            const monitorHandler = mockIpcRenderer.on.mock.calls[1]?.[1];
            monitorHandler?.(
                {},
                {
                    monitor,
                    monitorId: monitor.id,
                    previousStatus: "up",
                    site,
                    siteIdentifier: site.identifier,
                    status: "down",
                    timestamp: new Date().toISOString(),
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
            }).not.toThrowError();

            expect(throwingCallback).toHaveBeenCalled();
        });

        it("should handle undefined event data", () => {
            const callback = vi.fn();

            eventsApi.onTestEvent(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, undefined);

            expect(callback).not.toHaveBeenCalled();
            expect(diagnosticsWarnSpy).toHaveBeenCalledWith(
                "[eventsApi] Dropped malformed payload for 'test-event'",
                expect.objectContaining({
                    guard: expect.stringContaining("isTestEventDataPayload"),
                    payloadType: "undefined",
                })
            );
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "test-event",
                    guard: expect.stringContaining("isTestEventDataPayload"),
                })
            );
        });

        it("should handle null event data", () => {
            const callback = vi.fn();

            eventsApi.onMonitorStatusChanged(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, null);

            expect(callback).not.toHaveBeenCalled();
            expect(diagnosticsWarnSpy).toHaveBeenCalledWith(
                "[eventsApi] Dropped malformed payload for 'monitor:status-changed'",
                expect.objectContaining({
                    guard: expect.stringContaining("isMonitorStatusChanged"),
                    payloadType: "object",
                })
            );
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "monitor:status-changed",
                    guard: expect.stringContaining("isMonitorStatusChanged"),
                })
            );
        });

        it("should handle malformed event data gracefully", () => {
            const callback = vi.fn();

            eventsApi.onCacheInvalidated(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            const malformedData = { unexpected: "structure" };
            eventHandler?.({}, malformedData);

            expect(callback).not.toHaveBeenCalled();
            expect(diagnosticsWarnSpy).toHaveBeenCalledWith(
                "[eventsApi] Dropped malformed payload for 'cache:invalidated'",
                expect.objectContaining({
                    guard: expect.stringContaining(
                        "isCacheInvalidatedEventDataPayload"
                    ),
                    payloadType: "object",
                })
            );
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "cache:invalidated",
                    guard: expect.stringContaining(
                        "isCacheInvalidatedEventDataPayload"
                    ),
                })
            );
        });

        it("should handle cleanup function called multiple times", () => {
            const callback = vi.fn();

            const cleanup = eventsApi.onTestEvent(callback);

            cleanup();
            cleanup(); // Should not error on second call
            cleanup(); // Or third call

            // Should only remove listener once per actual registration
            expect(mockIpcRenderer.removeListener).toHaveBeenCalledTimes(1);
        });

        it("should handle event data with circular references", () => {
            const callback = vi.fn();
            const circularData: Record<string, unknown> = { message: "test" };
            circularData["self"] = circularData; // Create circular reference

            eventsApi.onTestEvent(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];

            expect(() => {
                eventHandler?.({}, circularData);
            }).not.toThrowError();

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
                    expect(typeof data.siteIdentifier).toBe("string");
                    expect(data.status).toBe("down");
                }),
                api.onMonitorUp((data: MonitorUpEventData) => {
                    expect(typeof data.siteIdentifier).toBe("string");
                    expect(data.status).toBe("up");
                }),
                api.onMonitorStatusChanged(
                    (data: MonitorStatusChangedEventData) => {
                        expect(typeof data.siteIdentifier).toBe("string");
                    }
                ),
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
            }).not.toThrowError();
        });
    });
});
