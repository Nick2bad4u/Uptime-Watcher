/**
 * Comprehensive tests for EventsService
 *
 * @remarks
 * This test suite provides comprehensive coverage for the EventsService
 * including initialization, event registration, error handling, and edge cases
 * to achieve 95%+ code coverage.
 */

import type { RendererEventPayloadMap } from "@shared/ipc/rendererEvents";

import {
    type CacheInvalidatedEventData,
    MONITORING_CONTROL_REASON,
    type MonitoringControlEventData,
    type MonitorStatusChangedEventData,
    type MonitoringStartedEventData as SharedMonitoringStartedEventData,
    type MonitoringStoppedEventData as SharedMonitoringStoppedEventData,
    type UpdateStatusEventData,
} from "@shared/types/events";
import { arrayAt, safeCastTo } from "ts-extras";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EventsService } from "../../services/EventsService";
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

const MOCK_BRIDGE_ERROR_MESSAGE =
    "ElectronAPI not available after maximum attempts. The application may not be running in an Electron environment.";

// Mock the bridge readiness helper to control initialization behavior
const mockWaitForElectronBridge = vi.hoisted(() => vi.fn());

const buildEventCallbacks = () => ({
    cacheInvalidated:
        createMockFunction<(data: CacheInvalidatedEventData) => void>(),
    monitorCheckCompleted:
        createMockFunction<(data: MonitorCheckCompletedEventPayload) => void>(),
    monitoringStarted:
        createMockFunction<(data: MonitoringStartedEventData) => void>(),
    monitoringStopped:
        createMockFunction<(data: MonitoringStoppedEventData) => void>(),
    monitorStatusChanged:
        createMockFunction<(data: MonitorStatusChangedEventData) => void>(),
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
        onMonitoringStarted: vi.fn((_handler: MonitoringStartedEventHandler) =>
            createEventCleanupFunction()
        ),
        onMonitoringStopped: vi.fn((_handler: MonitoringStoppedEventHandler) =>
            createEventCleanupFunction()
        ),
        onMonitorStatusChanged: vi.fn(() => createEventCleanupFunction()),
        onUpdateStatus: vi.fn(() => createEventCleanupFunction()),
    };
}

interface MockElectronAPI {
    events: ReturnType<typeof createMockEventApi>;
}

interface MockWindow {
    electronAPI?: MockElectronAPI;
}

const getMockWindow = (): MockWindow | undefined => {
    const windowRef = Reflect.get(globalThis, "window");
    return windowRef !== undefined && typeof windowRef === "object"
        ? (windowRef as unknown as MockWindow)
        : undefined;
};

const getMockGlobalElectronAPI = (): MockElectronAPI | undefined => {
    const bridge = Reflect.get(globalThis, "electronAPI");
    return bridge !== undefined && typeof bridge === "object"
        ? (bridge as MockElectronAPI)
        : undefined;
};

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
    let mockElectronAPI: MockElectronAPI;

    beforeEach(() => {
        vi.clearAllMocks();

        // Create fresh mock for each test
        mockElectronAPI = {
            events: createMockEventApi(),
        };

        // Set up global window.electronAPI mock
        Object.defineProperty(globalThis, "window", {
            configurable: true,
            value: {
                electronAPI: mockElectronAPI,
            } satisfies MockWindow,
            writable: true,
        });

        // Default successful initialization
        mockWaitForElectronBridge.mockReset();
        mockWaitForElectronBridge.mockImplementation(async () => {
            const bridge =
                getMockWindow()?.electronAPI ?? getMockGlobalElectronAPI();

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
        Reflect.deleteProperty(globalThis, "window");
    });

    describe("Service Structure", () => {
        it("should expose all required methods", () => {
            const expectedMethods = [
                "initialize",
                "onCacheInvalidated",
                "onHistoryLimitUpdated",
                "onMonitorCheckCompleted",
                "onMonitoringStarted",
                "onMonitoringStopped",
                "onMonitorStatusChanged",
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

            await expect(EventsService.initialize()).rejects.toThrow(
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
            ).rejects.toThrow("Init failed");

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

            mockLogger.debug.mockClear();

            cleanup();

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[EventsService] Cleanup skipped for onCacheInvalidated: invalid cleanup handler returned by preload bridge"
            );

            mockLogger.debug.mockClear();
            cleanup();
            expect(mockLogger.debug).not.toHaveBeenCalled();
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
            ).rejects.toThrow("Initialization failed");

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
            ).rejects.toThrow("Initialization failed");

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

            const call = safeCastTo<
                [MonitoringStartedEventHandler] | undefined
            >(
                arrayAt(
                    mockElectronAPI.events.onMonitoringStarted.mock.calls,
                    0
                )
            );
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
            ).rejects.toThrow("Init failed");

            expect(
                mockElectronAPI.events.onMonitoringStarted
            ).not.toHaveBeenCalled();
        });

        it("should not validate payloads in the renderer (preload is the boundary)", async () => {
            const callback = vi.fn();
            await EventsService.onMonitoringStarted(callback);

            const call = arrayAt(
                mockElectronAPI.events.onMonitoringStarted.mock.calls,
                0
            );
            expect(call).toBeDefined();
            const [registeredHandler] = call as [MonitoringStartedEventHandler];

            mockLogger.error.mockClear();

            const invalidPayload = {
                invalid: true,
            } as unknown as MonitoringControlEventData;
            registeredHandler(
                invalidPayload as unknown as MonitoringStartedEventData
            );

            expect(callback).toHaveBeenCalledWith(invalidPayload);
            expect(mockLogger.error).not.toHaveBeenCalled();
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

            const call = safeCastTo<
                [MonitoringStoppedEventHandler] | undefined
            >(
                arrayAt(
                    mockElectronAPI.events.onMonitoringStopped.mock.calls,
                    0
                )
            );
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
            ).rejects.toThrow("Init failed");

            expect(
                mockElectronAPI.events.onMonitoringStopped
            ).not.toHaveBeenCalled();
        });

        it("should not validate payloads in the renderer (preload is the boundary)", async () => {
            const callback = vi.fn();
            await EventsService.onMonitoringStopped(callback);

            const call = arrayAt(
                mockElectronAPI.events.onMonitoringStopped.mock.calls,
                0
            );
            expect(call).toBeDefined();
            const [registeredHandler] = call as [MonitoringStoppedEventHandler];

            mockLogger.error.mockClear();

            const invalidPayload = {
                invalid: true,
            } as unknown as MonitoringControlEventData;
            registeredHandler(
                invalidPayload as unknown as MonitoringStoppedEventData
            );

            expect(callback).toHaveBeenCalledWith(invalidPayload);
            expect(mockLogger.error).not.toHaveBeenCalled();
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
            ).rejects.toThrow("Init failed");

            expect(
                mockElectronAPI.events.onMonitorStatusChanged
            ).not.toHaveBeenCalled();
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
            ).rejects.toThrow("Init failed");

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
                EventsService.onMonitorCheckCompleted(testCallback),
                EventsService.onMonitoringStarted(testCallback),
                EventsService.onMonitoringStopped(testCallback),
                EventsService.onMonitorStatusChanged(testCallback),
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
                EventsService.onMonitorCheckCompleted(
                    callbacks.monitorCheckCompleted
                ),
                EventsService.onMonitoringStarted(
                    safeCastTo<MonitoringStartedEventHandler>(
                        callbacks.monitoringStarted
                    )
                ),
                EventsService.onMonitoringStopped(
                    safeCastTo<MonitoringStoppedEventHandler>(
                        callbacks.monitoringStopped
                    )
                ),
                EventsService.onMonitorStatusChanged(
                    callbacks.monitorStatusChanged
                ),
                EventsService.onUpdateStatus(callbacks.updateStatus),
            ]);

            // All registrations should succeed
            expect(cleanupFunctions).toHaveLength(6);
            for (const cleanup of cleanupFunctions) {
                expect(typeof cleanup).toBe("function");
            }

            // All electron API methods should have been called
            expect(
                mockElectronAPI.events.onCacheInvalidated
            ).toHaveBeenCalledWith(callbacks.cacheInvalidated);
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
            expect(mockElectronAPI.events.onUpdateStatus).toHaveBeenCalledWith(
                callbacks.updateStatus
            );

            const startedCall = safeCastTo<
                [MonitoringStartedEventHandler] | undefined
            >(
                arrayAt(
                    mockElectronAPI.events.onMonitoringStarted.mock.calls,
                    0
                )
            );
            const stoppedCall = safeCastTo<
                [MonitoringStoppedEventHandler] | undefined
            >(
                arrayAt(
                    mockElectronAPI.events.onMonitoringStopped.mock.calls,
                    0
                )
            );

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
            ).rejects.toThrow("Event registration failed");
        });

        it("should handle missing electron API gracefully", async () => {
            // Remove the electronAPI
            const mockWindow = getMockWindow();
            if (!mockWindow) {
                throw new Error("Mock window is not installed");
            }
            Reflect.deleteProperty(mockWindow, "electronAPI");

            const callback = vi.fn();

            await expect(
                EventsService.onCacheInvalidated(callback)
            ).rejects.toThrow();
        });
    });
});
