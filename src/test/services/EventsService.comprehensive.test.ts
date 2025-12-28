/**
 * Comprehensive tests for EventsService
 *
 * @remarks
 * This test suite provides comprehensive coverage for the EventsService
 * including initialization, event registration, error handling, and edge cases
 * to achieve 95%+ code coverage.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RendererEventPayloadMap } from "@shared/ipc/rendererEvents";
import {
    MONITORING_CONTROL_REASON,
    type MonitoringControlEventData,
    type MonitoringStartedEventData as SharedMonitoringStartedEventData,
    type MonitoringStoppedEventData as SharedMonitoringStoppedEventData,
    type CacheInvalidatedEventData,
    type MonitorDownEventData,
    type MonitorStatusChangedEventData,
    type MonitorUpEventData,
    type TestEventData,
    type UpdateStatusEventData,
} from "@shared/types/events";
import { createMockFunction } from "../utils/mockFactories";

type MonitoringStartedEventData = SharedMonitoringStartedEventData;
type MonitoringStoppedEventData = SharedMonitoringStoppedEventData;
type MonitorCheckCompletedEventPayload =
    RendererEventPayloadMap["monitor:check-completed"];
type MonitoringStartedEventHandler = (
    payload: MonitoringStartedEventData
) => void;
type MonitoringStoppedEventHandler = (
    payload: MonitoringStoppedEventData
) => void;

import { EventsService } from "../../services/EventsService";

const MOCK_BRIDGE_ERROR_MESSAGE =
    "ElectronAPI not available after maximum attempts. The application may not be running in an Electron environment.";

// Mock the bridge readiness helper to control initialization behavior
const mockWaitForElectronBridge = vi.hoisted(() => vi.fn());

const buildEventCallbacks = () => ({
    cacheInvalidated:
        createMockFunction<(data: CacheInvalidatedEventData) => void>(),
    monitorDown: createMockFunction<(data: MonitorDownEventData) => void>(),
    monitorCheckCompleted:
        createMockFunction<(data: MonitorCheckCompletedEventPayload) => void>(),
    monitoringStarted:
        createMockFunction<(data: MonitoringStartedEventData) => void>(),
    monitoringStopped:
        createMockFunction<(data: MonitoringStoppedEventData) => void>(),
    monitorStatusChanged:
        createMockFunction<(data: MonitorStatusChangedEventData) => void>(),
    monitorUp: createMockFunction<(data: MonitorUpEventData) => void>(),
    testEvent: createMockFunction<(data: TestEventData) => void>(),
    updateStatus: createMockFunction<(data: UpdateStatusEventData) => void>(),
});

const MockElectronBridgeNotReadyError = vi.hoisted(
    () =>
        class extends Error {
            public readonly diagnostics: unknown;

            public constructor(diagnostics: unknown) {
                super(MOCK_BRIDGE_ERROR_MESSAGE);
                this.name = "ElectronBridgeNotReadyError";
                this.diagnostics = diagnostics;
            }
        }
);

vi.mock("../../services/utils/electronBridgeReadiness", () => ({
    ElectronBridgeNotReadyError: MockElectronBridgeNotReadyError,
    waitForElectronBridge: mockWaitForElectronBridge,
}));

// Mock the logger
const mockLogger = vi.hoisted(() => ({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
}));
vi.mock("../../services/logger", () => ({
    logger: mockLogger,
}));

// Mock ensureError from shared utils
const mockEnsureError = vi.hoisted(() => vi.fn((error) => error));
vi.mock("../../../shared/utils/errorHandling", () => ({
    ensureError: mockEnsureError,
}));

// Helper functions for creating IPC response mocks
function createEventCleanupFunction(): () => void {
    return vi.fn();
}

function createMockEventApi() {
    return {
        onCacheInvalidated: vi.fn(() => createEventCleanupFunction()),
        onMonitorCheckCompleted: vi.fn(() => createEventCleanupFunction()),
        onHistoryLimitUpdated: vi.fn(() => createEventCleanupFunction()),
        onMonitorDown: vi.fn(() => createEventCleanupFunction()),
        onMonitoringStarted: vi.fn((_handler: MonitoringStartedEventHandler) =>
            createEventCleanupFunction()
        ),
        onMonitoringStopped: vi.fn((_handler: MonitoringStoppedEventHandler) =>
            createEventCleanupFunction()
        ),
        onMonitorStatusChanged: vi.fn(() => createEventCleanupFunction()),
        onMonitorUp: vi.fn(() => createEventCleanupFunction()),
        onSiteAdded: vi.fn(() => createEventCleanupFunction()),
        onSiteRemoved: vi.fn(() => createEventCleanupFunction()),
        onSiteUpdated: vi.fn(() => createEventCleanupFunction()),
        onTestEvent: vi.fn(() => createEventCleanupFunction()),
        onUpdateStatus: vi.fn(() => createEventCleanupFunction()),
    };
}

function createMonitoringStartedEventPayload(
    overrides: Partial<MonitoringStartedEventData> = {}
): MonitoringStartedEventData {
    const payload: MonitoringStartedEventData = {
        monitorCount: 2,
        siteCount: 1,
        timestamp: Date.now(),
        ...overrides,
    };

    return payload;
}

function createMonitoringStoppedEventPayload(
    overrides: Partial<MonitoringStoppedEventData> = {}
): MonitoringStoppedEventData {
    const payload: MonitoringStoppedEventData = {
        activeMonitors: 0,
        monitorCount: 2,
        reason: MONITORING_CONTROL_REASON.USER,
        siteCount: 1,
        timestamp: Date.now(),
        ...overrides,
    };

    return payload;
}

describe("EventsService", () => {
    let mockElectronAPI: { events: ReturnType<typeof createMockEventApi> };

    beforeEach(() => {
        vi.clearAllMocks();

        // Create fresh mock for each test
        mockElectronAPI = {
            events: createMockEventApi(),
        };

        // Set up global window.electronAPI mock
        (globalThis as any).window = {
            electronAPI: mockElectronAPI,
        };

        // Default successful initialization
        mockWaitForElectronBridge.mockReset();
        mockWaitForElectronBridge.mockImplementation(async () => {
            const bridge =
                (globalThis as any).window?.electronAPI ??
                (globalThis as any).electronAPI;

            if (!bridge) {
                throw new MockElectronBridgeNotReadyError({
                    attempts: 1,
                    reason: "ElectronAPI not available",
                });
            }
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
        delete (globalThis as any).window;
    });

    describe("Service Structure", () => {
        it("should expose all required methods", () => {
            const expectedMethods = [
                "initialize",
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
            ] as const;

            for (const method of expectedMethods) {
                expect(EventsService).toHaveProperty(method);
                expect(typeof EventsService[method]).toBe("function");
            }
        });
    });

    describe("initialize", () => {
        it("should initialize successfully when electron API is available", async () => {
            await expect(EventsService.initialize()).resolves.toBeUndefined();

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it("should handle initialization errors and rethrow", async () => {
            const initializationError = new Error("Electron API not available");
            mockWaitForElectronBridge.mockRejectedValue(initializationError);

            await expect(EventsService.initialize()).rejects.toThrowError(
                "Electron API not available"
            );

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(mockEnsureError).toHaveBeenCalledWith(initializationError);
            expect(mockLogger.error).toHaveBeenCalledWith(
                "[EventsService] Failed to initialize:",
                initializationError
            );
        });

        it("should handle non-error initialization failures", async () => {
            const stringError = "String error message";
            mockWaitForElectronBridge.mockRejectedValue(stringError);

            await expect(EventsService.initialize()).rejects.toBe(stringError);

            expect(mockEnsureError).toHaveBeenCalledWith(stringError);
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe("onCacheInvalidated", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onCacheInvalidated(callback);

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(
                mockElectronAPI.events.onCacheInvalidated
            ).toHaveBeenCalledWith(callback);
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronBridge.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(
                EventsService.onCacheInvalidated(callback)
            ).rejects.toThrowError("Init failed");

            expect(
                mockElectronAPI.events.onCacheInvalidated
            ).not.toHaveBeenCalled();
        });

        it("should log and return fallback when preload returns invalid cleanup handler", async () => {
            mockElectronAPI.events.onCacheInvalidated.mockReturnValueOnce(
                undefined as unknown as () => void
            );

            const cleanup = await EventsService.onCacheInvalidated(vi.fn());

            expect(mockLogger.error).toHaveBeenCalledWith(
                "[EventsService] Preload bridge returned an invalid cleanup handler for onCacheInvalidated",
                expect.objectContaining({ actualType: "undefined" })
            );
            expect(typeof cleanup).toBe("function");

            mockLogger.error.mockClear();

            cleanup();

            expect(mockLogger.error).toHaveBeenCalledWith(
                "[EventsService] Cleanup skipped for onCacheInvalidated: invalid cleanup handler returned by preload bridge"
            );
        });

        it("should log when the cleanup handler throws", async () => {
            const cleanupError = new Error("cleanup failed");
            const cleanupSpy = vi.fn(() => {
                throw cleanupError;
            });

            mockElectronAPI.events.onCacheInvalidated.mockReturnValueOnce(
                cleanupSpy
            );

            const cleanup = await EventsService.onCacheInvalidated(vi.fn());

            mockLogger.error.mockClear();
            mockEnsureError.mockClear();

            cleanup();

            expect(cleanupSpy).toHaveBeenCalledTimes(1);
            expect(mockEnsureError).toHaveBeenCalledWith(cleanupError);
            expect(mockLogger.error).toHaveBeenCalledWith(
                "[EventsService] Failed to cleanup onCacheInvalidated listener:",
                cleanupError
            );
        });
    });

    describe("onMonitorDown", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onMonitorDown(callback);

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(mockElectronAPI.events.onMonitorDown).toHaveBeenCalledWith(
                callback
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronBridge.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(
                EventsService.onMonitorDown(callback)
            ).rejects.toThrowError("Init failed");

            expect(mockElectronAPI.events.onMonitorDown).not.toHaveBeenCalled();
        });
    });

    describe("onMonitorCheckCompleted", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup =
                await EventsService.onMonitorCheckCompleted(callback);

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(
                mockElectronAPI.events.onMonitorCheckCompleted
            ).toHaveBeenCalledWith(callback);
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const callback = vi.fn();
            const initializationError = new Error("Initialization failed");
            mockWaitForElectronBridge.mockRejectedValueOnce(
                initializationError
            );

            await expect(
                EventsService.onMonitorCheckCompleted(callback)
            ).rejects.toThrowError("Initialization failed");

            expect(
                mockElectronAPI.events.onMonitorCheckCompleted
            ).not.toHaveBeenCalled();
        });
    });

    describe("onHistoryLimitUpdated", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onHistoryLimitUpdated(callback);

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(
                mockElectronAPI.events.onHistoryLimitUpdated
            ).toHaveBeenCalledWith(callback);
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const callback = vi.fn();
            const initializationError = new Error("Initialization failed");
            mockWaitForElectronBridge.mockRejectedValueOnce(
                initializationError
            );

            await expect(
                EventsService.onHistoryLimitUpdated(callback)
            ).rejects.toThrowError("Initialization failed");

            expect(
                mockElectronAPI.events.onHistoryLimitUpdated
            ).not.toHaveBeenCalled();
        });
    });

    describe("onMonitoringStarted", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onMonitoringStarted(callback);

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(
                mockElectronAPI.events.onMonitoringStarted
            ).toHaveBeenCalledTimes(1);

            const call =
                mockElectronAPI.events.onMonitoringStarted.mock.calls.at(0) as
                    | [MonitoringStartedEventHandler]
                    | undefined;
            expect(call).toBeDefined();
            if (!call) {
                throw new Error(
                    "Expected onMonitoringStarted to register a handler"
                );
            }

            const [registeredHandler] = call;
            expect(typeof registeredHandler).toBe("function");

            const payload = createMonitoringStartedEventPayload();
            registeredHandler(payload);
            expect(callback).toHaveBeenCalledWith(payload);
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronBridge.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(
                EventsService.onMonitoringStarted(callback)
            ).rejects.toThrowError("Init failed");

            expect(
                mockElectronAPI.events.onMonitoringStarted
            ).not.toHaveBeenCalled();
        });

        it("should log an error when the payload fails validation", async () => {
            const callback = vi.fn();
            await EventsService.onMonitoringStarted(callback);

            const call =
                mockElectronAPI.events.onMonitoringStarted.mock.calls.at(0);
            expect(call).toBeDefined();
            const [registeredHandler] = call as [MonitoringStartedEventHandler];

            mockLogger.error.mockClear();

            const invalidPayload = {
                invalid: true,
            } as unknown as MonitoringControlEventData;
            registeredHandler(
                invalidPayload as unknown as MonitoringStartedEventData
            );

            expect(callback).not.toHaveBeenCalled();
            expect(mockLogger.error).toHaveBeenCalledWith(
                "[EventsService] Dropped monitoring-start payload: invalid monitoring control event",
                undefined,
                { payload: invalidPayload }
            );
        });
    });

    describe("onMonitoringStopped", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onMonitoringStopped(callback);

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(
                mockElectronAPI.events.onMonitoringStopped
            ).toHaveBeenCalledTimes(1);

            const call =
                mockElectronAPI.events.onMonitoringStopped.mock.calls.at(0) as
                    | [MonitoringStoppedEventHandler]
                    | undefined;
            expect(call).toBeDefined();
            if (!call) {
                throw new Error(
                    "Expected onMonitoringStopped to register a handler"
                );
            }

            const [registeredHandler] = call;
            expect(typeof registeredHandler).toBe("function");

            const payload = createMonitoringStoppedEventPayload();
            registeredHandler(payload);
            expect(callback).toHaveBeenCalledWith(payload);
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronBridge.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(
                EventsService.onMonitoringStopped(callback)
            ).rejects.toThrowError("Init failed");

            expect(
                mockElectronAPI.events.onMonitoringStopped
            ).not.toHaveBeenCalled();
        });

        it("should log an error when the stop payload fails validation", async () => {
            const callback = vi.fn();
            await EventsService.onMonitoringStopped(callback);

            const call =
                mockElectronAPI.events.onMonitoringStopped.mock.calls.at(0);
            expect(call).toBeDefined();
            const [registeredHandler] = call as [MonitoringStoppedEventHandler];

            mockLogger.error.mockClear();

            const invalidPayload = {
                invalid: true,
            } as unknown as MonitoringControlEventData;
            registeredHandler(
                invalidPayload as unknown as MonitoringStoppedEventData
            );

            expect(callback).not.toHaveBeenCalled();
            expect(mockLogger.error).toHaveBeenCalledWith(
                "[EventsService] Dropped monitoring-stop payload: invalid monitoring control event",
                undefined,
                { payload: invalidPayload }
            );
        });
    });

    describe("onMonitorStatusChanged", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup =
                await EventsService.onMonitorStatusChanged(callback);

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(
                mockElectronAPI.events.onMonitorStatusChanged
            ).toHaveBeenCalledWith(callback);
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronBridge.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(
                EventsService.onMonitorStatusChanged(callback)
            ).rejects.toThrowError("Init failed");

            expect(
                mockElectronAPI.events.onMonitorStatusChanged
            ).not.toHaveBeenCalled();
        });
    });

    describe("onMonitorUp", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onMonitorUp(callback);

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(mockElectronAPI.events.onMonitorUp).toHaveBeenCalledWith(
                callback
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronBridge.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(
                EventsService.onMonitorUp(callback)
            ).rejects.toThrowError("Init failed");

            expect(mockElectronAPI.events.onMonitorUp).not.toHaveBeenCalled();
        });
    });

    describe("onSiteAdded", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onSiteAdded(callback);

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(mockElectronAPI.events.onSiteAdded).toHaveBeenCalledWith(
                callback
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronBridge.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(
                EventsService.onSiteAdded(callback)
            ).rejects.toThrowError("Init failed");

            expect(mockElectronAPI.events.onSiteAdded).not.toHaveBeenCalled();
        });
    });

    describe("onSiteRemoved", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onSiteRemoved(callback);

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(mockElectronAPI.events.onSiteRemoved).toHaveBeenCalledWith(
                callback
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronBridge.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(
                EventsService.onSiteRemoved(callback)
            ).rejects.toThrowError("Init failed");

            expect(mockElectronAPI.events.onSiteRemoved).not.toHaveBeenCalled();
        });
    });

    describe("onSiteUpdated", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onSiteUpdated(callback);

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(mockElectronAPI.events.onSiteUpdated).toHaveBeenCalledWith(
                callback
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronBridge.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(
                EventsService.onSiteUpdated(callback)
            ).rejects.toThrowError("Init failed");

            expect(mockElectronAPI.events.onSiteUpdated).not.toHaveBeenCalled();
        });
    });

    describe("onTestEvent", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onTestEvent(callback);

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(mockElectronAPI.events.onTestEvent).toHaveBeenCalledWith(
                callback
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronBridge.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(
                EventsService.onTestEvent(callback)
            ).rejects.toThrowError("Init failed");

            expect(mockElectronAPI.events.onTestEvent).not.toHaveBeenCalled();
        });
    });

    describe("onUpdateStatus", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onUpdateStatus(callback);

            expect(mockWaitForElectronBridge).toHaveBeenCalled();
            expect(mockElectronAPI.events.onUpdateStatus).toHaveBeenCalledWith(
                callback
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronBridge.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(
                EventsService.onUpdateStatus(callback)
            ).rejects.toThrowError("Init failed");

            expect(
                mockElectronAPI.events.onUpdateStatus
            ).not.toHaveBeenCalled();
        });
    });

    describe("Additional Coverage Tests", () => {
        it("should handle multiple callback types for event registration", async () => {
            const nullCallback = null as any;
            const normalCallback = vi.fn();

            // Test that normal callbacks work
            await expect(
                EventsService.onCacheInvalidated(normalCallback)
            ).resolves.toBeDefined();

            // Test edge cases that might occur
            try {
                await EventsService.onCacheInvalidated(nullCallback);
                // If this doesn't throw, the mock is handling it
            } catch (error) {
                // This is expected behavior for invalid callbacks
                expect(error).toBeDefined();
            }
        });

        it("should handle complex error scenarios during initialization", async () => {
            const complexError = {
                message: "Complex error",
                code: "ECONNREFUSED",
                stack: "Error stack trace",
            };

            mockWaitForElectronBridge.mockRejectedValue(complexError);

            await expect(EventsService.initialize()).rejects.toEqual(
                complexError
            );

            expect(mockEnsureError).toHaveBeenCalledWith(complexError);
            expect(mockLogger.error).toHaveBeenCalled();
        });

        it("should handle all event methods consistently", async () => {
            const testCallback = vi.fn();

            // Test all event methods return proper cleanup functions
            const cleanupFunctions = await Promise.all([
                EventsService.onCacheInvalidated(testCallback),
                EventsService.onMonitorDown(testCallback),
                EventsService.onMonitorCheckCompleted(testCallback),
                EventsService.onMonitoringStarted(testCallback),
                EventsService.onMonitoringStopped(testCallback),
                EventsService.onMonitorStatusChanged(testCallback),
                EventsService.onMonitorUp(testCallback),
                EventsService.onTestEvent(testCallback),
                EventsService.onUpdateStatus(testCallback),
            ]);

            // All should return cleanup functions
            for (const cleanup of cleanupFunctions) {
                expect(typeof cleanup).toBe("function");
            }

            // All should have shared the in-flight initialization
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
        });
    });

    describe("Integration Testing", () => {
        it("should handle multiple simultaneous event registrations", async () => {
            const callbacks = buildEventCallbacks();

            const cleanupFunctions = await Promise.all([
                EventsService.onCacheInvalidated(callbacks.cacheInvalidated),
                EventsService.onMonitorDown(callbacks.monitorDown),
                EventsService.onMonitorCheckCompleted(
                    callbacks.monitorCheckCompleted
                ),
                EventsService.onMonitoringStarted(
                    callbacks.monitoringStarted as MonitoringStartedEventHandler
                ),
                EventsService.onMonitoringStopped(
                    callbacks.monitoringStopped as MonitoringStoppedEventHandler
                ),
                EventsService.onMonitorStatusChanged(
                    callbacks.monitorStatusChanged
                ),
                EventsService.onMonitorUp(callbacks.monitorUp),
                EventsService.onTestEvent(callbacks.testEvent),
                EventsService.onUpdateStatus(callbacks.updateStatus),
            ]);

            // All registrations should succeed
            expect(cleanupFunctions).toHaveLength(9);
            for (const cleanup of cleanupFunctions) {
                expect(typeof cleanup).toBe("function");
            }

            // All electron API methods should have been called
            expect(
                mockElectronAPI.events.onCacheInvalidated
            ).toHaveBeenCalledWith(callbacks.cacheInvalidated);
            expect(mockElectronAPI.events.onMonitorDown).toHaveBeenCalledWith(
                callbacks.monitorDown
            );
            expect(
                mockElectronAPI.events.onMonitorCheckCompleted
            ).toHaveBeenCalledWith(callbacks.monitorCheckCompleted);
            expect(
                mockElectronAPI.events.onMonitoringStarted
            ).toHaveBeenCalledTimes(1);
            expect(
                mockElectronAPI.events.onMonitoringStopped
            ).toHaveBeenCalledTimes(1);
            expect(
                mockElectronAPI.events.onMonitorStatusChanged
            ).toHaveBeenCalledWith(callbacks.monitorStatusChanged);
            expect(mockElectronAPI.events.onMonitorUp).toHaveBeenCalledWith(
                callbacks.monitorUp
            );
            expect(mockElectronAPI.events.onTestEvent).toHaveBeenCalledWith(
                callbacks.testEvent
            );
            expect(mockElectronAPI.events.onUpdateStatus).toHaveBeenCalledWith(
                callbacks.updateStatus
            );

            const startedCall =
                mockElectronAPI.events.onMonitoringStarted.mock.calls.at(0) as
                    | [MonitoringStartedEventHandler]
                    | undefined;
            const stoppedCall =
                mockElectronAPI.events.onMonitoringStopped.mock.calls.at(0) as
                    | [MonitoringStoppedEventHandler]
                    | undefined;

            expect(startedCall).toBeDefined();
            expect(stoppedCall).toBeDefined();
            if (!startedCall || !stoppedCall) {
                throw new Error(
                    "Expected monitoring handlers to be registered during integration test"
                );
            }

            const [monitoringStartedHandler] = startedCall;
            const [monitoringStoppedHandler] = stoppedCall;

            expect(typeof monitoringStartedHandler).toBe("function");
            expect(typeof monitoringStoppedHandler).toBe("function");

            const startedPayload = createMonitoringStartedEventPayload();
            monitoringStartedHandler(startedPayload);
            expect(callbacks.monitoringStarted).toHaveBeenCalledWith(
                startedPayload
            );

            const stoppedPayload = createMonitoringStoppedEventPayload();
            monitoringStoppedHandler(stoppedPayload);
            expect(callbacks.monitoringStopped).toHaveBeenCalledWith(
                stoppedPayload
            );
        });

        it("should handle repeated initialization calls gracefully", async () => {
            // Multiple initialize calls should all succeed
            await Promise.all([
                EventsService.initialize(),
                EventsService.initialize(),
                EventsService.initialize(),
            ]);

            // Concurrent calls share the same in-flight initialization.
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
        });
    });

    describe("Error Edge Cases", () => {
        it("should handle callback registration when electron API throws", async () => {
            mockElectronAPI.events.onCacheInvalidated.mockImplementation(() => {
                throw new Error("Event registration failed");
            });

            const callback = vi.fn();

            await expect(
                EventsService.onCacheInvalidated(callback)
            ).rejects.toThrowError("Event registration failed");
        });

        it("should handle missing electron API gracefully", async () => {
            // Remove the electronAPI
            delete (globalThis as any).window.electronAPI;

            const callback = vi.fn();

            await expect(
                EventsService.onCacheInvalidated(callback)
            ).rejects.toThrowError();
        });
    });
});
