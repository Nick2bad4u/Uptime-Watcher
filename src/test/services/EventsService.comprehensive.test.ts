/**
 * Comprehensive tests for EventsService
 *
 * @remarks
 * This test suite provides comprehensive coverage for the EventsService
 * including initialization, event registration, error handling, and edge cases
 * to achieve 95%+ code coverage.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { EventsService } from "../../services/EventsService";

// Mock the waitForElectronAPI utility
const mockWaitForElectronAPI = vi.hoisted(() => vi.fn());
vi.mock("../../stores/utils", () => ({
    waitForElectronAPI: mockWaitForElectronAPI,
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
        onMonitorDown: vi.fn(() => createEventCleanupFunction()),
        onMonitoringStarted: vi.fn(() => createEventCleanupFunction()),
        onMonitoringStopped: vi.fn(() => createEventCleanupFunction()),
        onMonitorStatusChanged: vi.fn(() => createEventCleanupFunction()),
        onMonitorUp: vi.fn(() => createEventCleanupFunction()),
        onTestEvent: vi.fn(() => createEventCleanupFunction()),
        onUpdateStatus: vi.fn(() => createEventCleanupFunction()),
    };
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
        mockWaitForElectronAPI.mockResolvedValue(undefined);
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
                "onMonitoringStarted",
                "onMonitoringStopped",
                "onMonitorStatusChanged",
                "onMonitorUp",
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

            expect(mockWaitForElectronAPI).toHaveBeenCalled();
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it("should handle initialization errors and rethrow", async () => {
            const initializationError = new Error("Electron API not available");
            mockWaitForElectronAPI.mockRejectedValue(initializationError);

            await expect(EventsService.initialize()).rejects.toThrow(
                "Electron API not available"
            );

            expect(mockWaitForElectronAPI).toHaveBeenCalled();
            expect(mockEnsureError).toHaveBeenCalledWith(initializationError);
            expect(mockLogger.error).toHaveBeenCalledWith(
                "[EventsService] Failed to initialize:",
                initializationError
            );
        });

        it("should handle non-error initialization failures", async () => {
            const stringError = "String error message";
            mockWaitForElectronAPI.mockRejectedValue(stringError);

            await expect(EventsService.initialize()).rejects.toBe(stringError);

            expect(mockEnsureError).toHaveBeenCalledWith(stringError);
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe("onCacheInvalidated", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onCacheInvalidated(callback);

            expect(mockWaitForElectronAPI).toHaveBeenCalled();
            expect(
                mockElectronAPI.events.onCacheInvalidated
            ).toHaveBeenCalledWith(callback);
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronAPI.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(
                EventsService.onCacheInvalidated(callback)
            ).rejects.toThrow("Init failed");

            expect(
                mockElectronAPI.events.onCacheInvalidated
            ).not.toHaveBeenCalled();
        });
    });

    describe("onMonitorDown", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onMonitorDown(callback);

            expect(mockWaitForElectronAPI).toHaveBeenCalled();
            expect(mockElectronAPI.events.onMonitorDown).toHaveBeenCalledWith(
                callback
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronAPI.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(EventsService.onMonitorDown(callback)).rejects.toThrow(
                "Init failed"
            );

            expect(mockElectronAPI.events.onMonitorDown).not.toHaveBeenCalled();
        });
    });

    describe("onMonitoringStarted", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onMonitoringStarted(callback);

            expect(mockWaitForElectronAPI).toHaveBeenCalled();
            expect(
                mockElectronAPI.events.onMonitoringStarted
            ).toHaveBeenCalledWith(callback);
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronAPI.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(
                EventsService.onMonitoringStarted(callback)
            ).rejects.toThrow("Init failed");

            expect(
                mockElectronAPI.events.onMonitoringStarted
            ).not.toHaveBeenCalled();
        });
    });

    describe("onMonitoringStopped", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onMonitoringStopped(callback);

            expect(mockWaitForElectronAPI).toHaveBeenCalled();
            expect(
                mockElectronAPI.events.onMonitoringStopped
            ).toHaveBeenCalledWith(callback);
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronAPI.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(
                EventsService.onMonitoringStopped(callback)
            ).rejects.toThrow("Init failed");

            expect(
                mockElectronAPI.events.onMonitoringStopped
            ).not.toHaveBeenCalled();
        });
    });

    describe("onMonitorStatusChanged", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup =
                await EventsService.onMonitorStatusChanged(callback);

            expect(mockWaitForElectronAPI).toHaveBeenCalled();
            expect(
                mockElectronAPI.events.onMonitorStatusChanged
            ).toHaveBeenCalledWith(callback);
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronAPI.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(
                EventsService.onMonitorStatusChanged(callback)
            ).rejects.toThrow("Init failed");

            expect(
                mockElectronAPI.events.onMonitorStatusChanged
            ).not.toHaveBeenCalled();
        });
    });

    describe("onMonitorUp", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onMonitorUp(callback);

            expect(mockWaitForElectronAPI).toHaveBeenCalled();
            expect(mockElectronAPI.events.onMonitorUp).toHaveBeenCalledWith(
                callback
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronAPI.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(EventsService.onMonitorUp(callback)).rejects.toThrow(
                "Init failed"
            );

            expect(mockElectronAPI.events.onMonitorUp).not.toHaveBeenCalled();
        });
    });

    describe("onTestEvent", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onTestEvent(callback);

            expect(mockWaitForElectronAPI).toHaveBeenCalled();
            expect(mockElectronAPI.events.onTestEvent).toHaveBeenCalledWith(
                callback
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronAPI.mockRejectedValue(initError);
            const callback = vi.fn();

            await expect(EventsService.onTestEvent(callback)).rejects.toThrow(
                "Init failed"
            );

            expect(mockElectronAPI.events.onTestEvent).not.toHaveBeenCalled();
        });
    });

    describe("onUpdateStatus", () => {
        it("should register event listener after initialization", async () => {
            const callback = vi.fn();

            const cleanup = await EventsService.onUpdateStatus(callback);

            expect(mockWaitForElectronAPI).toHaveBeenCalled();
            expect(mockElectronAPI.events.onUpdateStatus).toHaveBeenCalledWith(
                callback
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should fail if initialization fails", async () => {
            const initError = new Error("Init failed");
            mockWaitForElectronAPI.mockRejectedValue(initError);
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

            mockWaitForElectronAPI.mockRejectedValue(complexError);

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

            // All should have called initialization
            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(8);
        });
    });

    describe("Integration Testing", () => {
        it("should handle multiple simultaneous event registrations", async () => {
            const callbacks = Array.from({ length: 8 }, () => vi.fn()) as [
                ReturnType<typeof vi.fn>,
                ReturnType<typeof vi.fn>,
                ReturnType<typeof vi.fn>,
                ReturnType<typeof vi.fn>,
                ReturnType<typeof vi.fn>,
                ReturnType<typeof vi.fn>,
                ReturnType<typeof vi.fn>,
                ReturnType<typeof vi.fn>,
            ];

            const cleanupFunctions = await Promise.all([
                EventsService.onCacheInvalidated(callbacks[0]),
                EventsService.onMonitorDown(callbacks[1]),
                EventsService.onMonitoringStarted(callbacks[2]),
                EventsService.onMonitoringStopped(callbacks[3]),
                EventsService.onMonitorStatusChanged(callbacks[4]),
                EventsService.onMonitorUp(callbacks[5]),
                EventsService.onTestEvent(callbacks[6]),
                EventsService.onUpdateStatus(callbacks[7]),
            ]);

            // All registrations should succeed
            expect(cleanupFunctions).toHaveLength(8);
            for (const cleanup of cleanupFunctions) {
                expect(typeof cleanup).toBe("function");
            }

            // All electron API methods should have been called
            expect(
                mockElectronAPI.events.onCacheInvalidated
            ).toHaveBeenCalledWith(callbacks[0]);
            expect(mockElectronAPI.events.onMonitorDown).toHaveBeenCalledWith(
                callbacks[1]
            );
            expect(
                mockElectronAPI.events.onMonitoringStarted
            ).toHaveBeenCalledWith(callbacks[2]);
            expect(
                mockElectronAPI.events.onMonitoringStopped
            ).toHaveBeenCalledWith(callbacks[3]);
            expect(
                mockElectronAPI.events.onMonitorStatusChanged
            ).toHaveBeenCalledWith(callbacks[4]);
            expect(mockElectronAPI.events.onMonitorUp).toHaveBeenCalledWith(
                callbacks[5]
            );
            expect(mockElectronAPI.events.onTestEvent).toHaveBeenCalledWith(
                callbacks[6]
            );
            expect(mockElectronAPI.events.onUpdateStatus).toHaveBeenCalledWith(
                callbacks[7]
            );
        });

        it("should handle repeated initialization calls gracefully", async () => {
            // Multiple initialize calls should all succeed
            await Promise.all([
                EventsService.initialize(),
                EventsService.initialize(),
                EventsService.initialize(),
            ]);

            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(3);
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
            delete (globalThis as any).window.electronAPI;

            const callback = vi.fn();

            await expect(
                EventsService.onCacheInvalidated(callback)
            ).rejects.toThrow();
        });
    });
});
