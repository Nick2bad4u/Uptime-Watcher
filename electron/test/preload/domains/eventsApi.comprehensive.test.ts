/**
 * Comprehensive tests for Events domain API Includes fast-check property-based
 * testing for robust coverage
 */

import type { Monitor, Site, StatusHistory } from "@shared/types";
import type {
    CacheInvalidatedEventData,
    HistoryLimitUpdatedEventData,
    MonitorCheckCompletedEventData,
    MonitoringControlEventData,
    MonitorStatusChangedEventData,
    UpdateStatusEventData,
} from "@shared/types/events";

import {
    sampleOne,
    siteNameArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";
import { DEFAULT_MAX_USER_FACING_ERROR_DETAIL_CHARS } from "@shared/utils/userFacingErrors";
import fc from "fast-check";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createEventsApi } from "../../../preload/domains/eventsApi";

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
                "onMonitorCheckCompleted",
                "onHistoryLimitUpdated",
                "onMonitoringStarted",
                "onMonitoringStopped",
                "onMonitorStatusChanged",
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

        it("should strip unexpected cache invalidation event fields", () => {
            const callback = vi.fn();
            const mockEventData = {
                identifier: "site-abc",
                reason: "update",
                secretToken: "secret-token",
                timestamp: Date.now(),
                type: "site",
            };

            eventsApi.onCacheInvalidated(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, mockEventData);

            expect(callback).toHaveBeenCalledWith({
                identifier: "site-abc",
                reason: "update",
                timestamp: mockEventData.timestamp,
                type: "site",
            });
        });

        it("should reject targeted cache invalidation payloads with invalid identifiers", () => {
            const callback = vi.fn();

            eventsApi.onCacheInvalidated(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.(
                {},
                {
                    identifier: "site\nabc",
                    reason: "update",
                    timestamp: Date.now(),
                    type: "site",
                }
            );
            eventHandler?.(
                {},
                {
                    identifier: "monitor\nabc",
                    reason: "update",
                    timestamp: Date.now(),
                    type: "monitor",
                }
            );

            expect(callback).not.toHaveBeenCalled();
            expect(guardFailureSpy).toHaveBeenCalledTimes(2);
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "cache:invalidated",
                    guard: "isCacheInvalidatedEventDataPayload",
                    reason: "payload-validation",
                })
            );
        });

        it("should reject cache invalidation payloads with invalid epoch timestamps", () => {
            const callback = vi.fn();

            eventsApi.onCacheInvalidated(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            for (const timestamp of [
                -1,
                1.5,
                8_640_000_000_000_001,
            ]) {
                eventHandler?.(
                    {},
                    {
                        reason: "update",
                        timestamp,
                        type: "site",
                    }
                );
            }

            expect(callback).not.toHaveBeenCalled();
            expect(guardFailureSpy).toHaveBeenCalledTimes(3);
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "cache:invalidated",
                    guard: "isCacheInvalidatedEventDataPayload",
                    reason: "payload-validation",
                })
            );
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

        it("should reject monitoring start payloads with invalid counts", () => {
            const callback = vi.fn();

            eventsApi.onMonitoringStarted(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            const invalidPayloads = [
                { monitorCount: -1, siteCount: 3, timestamp: Date.now() },
                { monitorCount: 1.5, siteCount: 3, timestamp: Date.now() },
                {
                    monitorCount: Number.POSITIVE_INFINITY,
                    siteCount: 3,
                    timestamp: Date.now(),
                },
                {
                    monitorCount: Number.NaN,
                    siteCount: 3,
                    timestamp: Date.now(),
                },
                { monitorCount: 10, siteCount: -1, timestamp: Date.now() },
            ];

            for (const invalidPayload of invalidPayloads) {
                eventHandler?.({}, invalidPayload);
            }

            expect(callback).not.toHaveBeenCalled();
            expect(guardFailureSpy).toHaveBeenCalledTimes(5);
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "monitoring:started",
                    guard: "isMonitoringStartedEventDataPayload",
                    reason: "payload-validation",
                })
            );
        });

        it("should reject monitoring stop payloads with invalid active monitor counts", () => {
            const callback = vi.fn();

            eventsApi.onMonitoringStopped(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            for (const invalidCount of [
                -1,
                1.5,
                Number.POSITIVE_INFINITY,
                Number.NaN,
            ]) {
                eventHandler?.(
                    {},
                    {
                        activeMonitors: invalidCount,
                        reason: "user",
                        timestamp: Date.now(),
                    }
                );
            }

            expect(callback).not.toHaveBeenCalled();
            expect(guardFailureSpy).toHaveBeenCalledTimes(4);
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "monitoring:stopped",
                    guard: "isMonitoringStoppedEventDataPayload",
                    reason: "payload-validation",
                })
            );
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
                site: Record<string, unknown> & Site;
            } = {
                details: "Recovered",
                monitor: createMonitorFixture() as Monitor &
                    Record<string, unknown>,
                monitorId: "monitor-123",
                previousStatus: "down",
                responseTime: 1200,
                site: createSiteFixture() as Record<string, unknown> & Site,
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
                    reason: "payload-validation",
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
                    reason: "payload-validation",
                })
            );
        });

        it("should drop check completion payloads with mismatched top-level identifiers", () => {
            const callback = vi.fn();
            const eventData: MonitorCheckCompletedEventData = {
                checkType: "manual",
                monitorId: "monitor-other",
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

            mockIpcRenderer.on.mockClear();
            eventsApi.onMonitorCheckCompleted(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, eventData);

            expect(callback).not.toHaveBeenCalled();
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "monitor:check-completed",
                    guard: "isMonitorCheckCompletedEventDataPayload",
                    reason: "payload-validation",
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
                    reason: "payload-validation",
                })
            );
        });

        it("should reject history limit payloads with non-normalized numeric values", () => {
            const callback = vi.fn();

            eventsApi.onHistoryLimitUpdated(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            const invalidPayloads = [
                {
                    limit: 25.5,
                    operation: "history-limit-updated",
                    timestamp: Date.now(),
                },
                {
                    limit: Number.MAX_SAFE_INTEGER + 1,
                    operation: "history-limit-updated",
                    timestamp: Date.now(),
                },
                {
                    limit: 750,
                    operation: "history-limit-updated",
                    previousLimit: 500.5,
                    timestamp: Date.now(),
                },
            ];

            for (const invalidPayload of invalidPayloads) {
                eventHandler?.({}, invalidPayload);
            }

            expect(callback).not.toHaveBeenCalled();
            expect(guardFailureSpy).toHaveBeenCalledTimes(3);
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "settings:history-limit-updated",
                    guard: "isHistoryLimitUpdatedEventDataPayload",
                    reason: "payload-validation",
                })
            );
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

        it("should strip unexpected update status event fields", () => {
            const callback = vi.fn();
            const mockEventData = {
                error: "Connection failed",
                refreshToken: "secret-token",
                status: "checking",
            };

            eventsApi.onUpdateStatus(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, mockEventData);

            expect(callback).toHaveBeenCalledWith({
                error: "Connection failed",
                status: "checking",
            });
        });

        it("should drop update errors that exceed the user-facing detail limit", () => {
            const callback = vi.fn();
            const oversizedPayload: UpdateStatusEventData = {
                error: "x".repeat(
                    DEFAULT_MAX_USER_FACING_ERROR_DETAIL_CHARS + 1
                ),
                status: "error",
            };

            eventsApi.onUpdateStatus(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, oversizedPayload);

            expect(callback).not.toHaveBeenCalled();
            expect(diagnosticsWarnSpy).toHaveBeenCalledWith(
                "[eventsApi] Dropped malformed payload for 'update-status'",
                expect.objectContaining({
                    guard: "isUpdateStatusEventDataPayload",
                    payloadType: "object",
                })
            );
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "update-status",
                    guard: "isUpdateStatusEventDataPayload",
                    reason: "payload-validation",
                })
            );
        });
    });

    describe("removeAllListeners", () => {
        it("should remove all listeners for all event channels", () => {
            const cleanupHandlers: [string, unknown][] = [];

            eventsApi.onCacheInvalidated(() => {});
            eventsApi.onMonitorCheckCompleted(() => {});
            eventsApi.onHistoryLimitUpdated(() => {});
            eventsApi.onMonitoringStarted(() => {});
            eventsApi.onMonitoringStopped(() => {});
            eventsApi.onMonitorStatusChanged(() => {});
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

            expect(() => {
                freshApi.removeAllListeners();
            }).not.toThrow();
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
            const MIN_ISO_TIMESTAMP_DATE = new Date(0);
            const MAX_ISO_TIMESTAMP_DATE = new Date("9999-12-31T23:59:59.999Z");
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
                        .filter((value) => /\S/v.test(value));
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
                    fc
                        .date({
                            max: MAX_ISO_TIMESTAMP_DATE,
                            min: MIN_ISO_TIMESTAMP_DATE,
                        })
                        .filter((date) => !Number.isNaN(date.getTime()))
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
                        const site = createSiteFixture({
                            identifier: siteOverrides.identifier,
                            monitoring: siteOverrides.monitoring,
                            ...(siteOverrides.name !== undefined && {
                                name: siteOverrides.name,
                            }),
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
                            timestamp: timestampValue.toISOString(),
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
            const statusCallback = vi.fn();
            const updateCallback = vi.fn();

            eventsApi.onCacheInvalidated(cacheCallback);
            eventsApi.onMonitorStatusChanged(statusCallback);
            eventsApi.onUpdateStatus(updateCallback);

            expect(mockIpcRenderer.on).toHaveBeenCalledTimes(3);
            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "cache:invalidated",
                expect.any(Function)
            );
            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "monitor:status-changed",
                expect.any(Function)
            );
            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "update-status",
                expect.any(Function)
            );
        });

        it("should handle rapid event registration and cleanup", () => {
            const callbacks = Array.from({ length: 100 }, () => vi.fn());

            // Register and immediately cleanup
            for (const callback of callbacks) {
                const cleanup = eventsApi.onCacheInvalidated(callback);
                cleanup();
            }

            expect(mockIpcRenderer.on).toHaveBeenCalledTimes(100);
            expect(mockIpcRenderer.removeListener).toHaveBeenCalledTimes(100);
        });

        it("should maintain event listener isolation", () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            const cleanup1 = eventsApi.onCacheInvalidated(callback1);
            const cleanup2 = eventsApi.onMonitorStatusChanged(callback2);

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

            eventsApi.onCacheInvalidated(throwingCallback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];

            // Should not throw when calling the event handler
            expect(() => {
                eventHandler?.(
                    {},
                    {
                        identifier: "site-123",
                        reason: "update",
                        timestamp: Date.now(),
                        type: "site",
                    }
                );
            }).not.toThrow();

            expect(throwingCallback).toHaveBeenCalled();
        });

        it("should handle undefined event data", () => {
            const callback = vi.fn();

            eventsApi.onCacheInvalidated(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls[0]?.[1];
            eventHandler?.({}, undefined);

            expect(callback).not.toHaveBeenCalled();
            expect(diagnosticsWarnSpy).toHaveBeenCalledWith(
                "[eventsApi] Dropped malformed payload for 'cache:invalidated'",
                expect.objectContaining({
                    guard: "isCacheInvalidatedEventDataPayload",
                    payloadType: "undefined",
                })
            );
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "cache:invalidated",
                    guard: "isCacheInvalidatedEventDataPayload",
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

        it("should report guard exceptions as malformed payloads", () => {
            const callback = vi.fn();
            const payload = {
                timestamp: Date.now(),
                type: "site",
            } as Record<string, unknown>;
            Object.defineProperty(payload, "reason", {
                enumerable: true,
                get() {
                    throw new Error("reason getter should be contained");
                },
            });
            buildPayloadPreviewMock.mockReturnValueOnce(undefined);

            eventsApi.onCacheInvalidated(callback);

            const eventHandler = mockIpcRenderer.on.mock.calls.at(-1)?.[1];
            expect(() => {
                eventHandler?.({}, payload);
            }).not.toThrow();

            expect(callback).not.toHaveBeenCalled();
            expect(diagnosticsWarnSpy).toHaveBeenCalledWith(
                "[eventsApi] Dropped malformed payload for 'cache:invalidated'",
                expect.objectContaining({
                    guard: "isCacheInvalidatedEventDataPayload",
                    payloadType: "object",
                })
            );
            expect(guardFailureSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    channel: "cache:invalidated",
                    guard: "isCacheInvalidatedEventDataPayload",
                    reason: "payload-validation",
                })
            );
        });

        it("should handle cleanup function called multiple times", () => {
            const callback = vi.fn();

            const cleanup = eventsApi.onCacheInvalidated(callback);

            cleanup();
            cleanup(); // Should not error on second call
            cleanup(); // Or third call

            // Should only remove listener once per actual registration
            expect(mockIpcRenderer.removeListener).toHaveBeenCalledTimes(1);
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
                api.onMonitorStatusChanged(
                    (data: MonitorStatusChangedEventData) => {
                        expect(typeof data.siteIdentifier).toBe("string");
                    }
                ),
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
            const cleanup = eventsApi.onCacheInvalidated(callback);

            // Should be a function that returns void
            const result = cleanup();
            expect(result).toBeUndefined();
        });

        it("should handle function context properly", () => {
            const { onCacheInvalidated, removeAllListeners } = eventsApi;
            const callback = vi.fn();

            // Destructured functions should work correctly
            expect(() => {
                const cleanup = onCacheInvalidated(callback);
                removeAllListeners();
                cleanup();
            }).not.toThrow();
        });
    });
});
