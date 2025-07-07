/**
 * Tests for dataBackup utility functions.
 * Validates database backup and site refresh functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events";

import { downloadBackup, refreshSites } from "../../../utils/database/dataBackup";
import type { DataBackupDependencies, DataBackupCallbacks } from "../../../utils/database/dataBackup";
import type { Site } from "../../../types";

// Mock the logger
vi.mock("../../../utils/logger", () => ({
    monitorLogger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

// Mock DatabaseService
const mockDatabaseService = {
    downloadBackup: vi.fn(),
};

// Mock EventEmitter
let mockEventEmitter: EventEmitter;

// Mock Site data
const mockSites: Site[] = [
    {
        identifier: "site-1",
        name: "Test Site 1",
        monitors: [],
        monitoring: false,
    },
    {
        identifier: "site-2",
        name: "Test Site 2",
        monitors: [],
        monitoring: false,
    },
];

// Helper functions to avoid deep nesting in tests
const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

describe("dataBackup utilities", () => {
    let dependencies: DataBackupDependencies;
    let callbacks: DataBackupCallbacks;

    beforeEach(() => {
        vi.clearAllMocks();

        // Create fresh EventEmitter instance for each test
        mockEventEmitter = new EventEmitter();

        // Set up dependencies
        dependencies = {
            databaseService: mockDatabaseService as any,
            eventEmitter: mockEventEmitter,
        };

        // Set up callbacks
        callbacks = {
            getSitesFromCache: vi.fn(),
            loadSites: vi.fn(),
        };
    });

    afterEach(() => {
        vi.resetAllMocks();
        mockEventEmitter.removeAllListeners();
    });

    describe("downloadBackup", () => {
        it("should successfully download backup when database service succeeds", async () => {
            const expectedResult = {
                buffer: Buffer.from("mock backup data"),
                fileName: "backup-2024-01-01.db",
            };

            mockDatabaseService.downloadBackup.mockResolvedValue(expectedResult);

            const result = await downloadBackup(dependencies);

            expect(result).toEqual(expectedResult);
            expect(mockDatabaseService.downloadBackup).toHaveBeenCalledTimes(1);
            expect(mockDatabaseService.downloadBackup).toHaveBeenCalledWith();
        });

        it("should log error and emit db-error event when database service fails", async () => {
            const mockError = new Error("Database connection failed");
            mockDatabaseService.downloadBackup.mockRejectedValue(mockError);

            // Set up event listener to capture emitted event
            const emittedEvents: any[] = [];
            mockEventEmitter.on("db-error", (event) => {
                emittedEvents.push(event);
            });

            const { monitorLogger } = await import("../../../utils/logger");

            await expect(downloadBackup(dependencies)).rejects.toThrow("Database connection failed");

            // Verify error was logged
            expect(monitorLogger.error).toHaveBeenCalledTimes(1);
            expect(monitorLogger.error).toHaveBeenCalledWith("Failed to download backup", mockError);

            // Verify event was emitted
            expect(emittedEvents).toHaveLength(1);
            expect(emittedEvents[0]).toEqual({
                error: mockError,
                operation: "downloadBackup",
            });

            expect(mockDatabaseService.downloadBackup).toHaveBeenCalledTimes(1);
        });

        it("should handle different types of errors from database service", async () => {
            const stringError = "String error message";
            mockDatabaseService.downloadBackup.mockRejectedValue(stringError);

            const emittedEvents: any[] = [];
            mockEventEmitter.on("db-error", (event) => {
                emittedEvents.push(event);
            });

            const { monitorLogger } = await import("../../../utils/logger");

            await expect(downloadBackup(dependencies)).rejects.toBe(stringError);

            expect(monitorLogger.error).toHaveBeenCalledWith("Failed to download backup", stringError);
            expect(emittedEvents[0]).toEqual({
                error: stringError,
                operation: "downloadBackup",
            });
        });

        it("should handle null/undefined errors from database service", async () => {
            mockDatabaseService.downloadBackup.mockRejectedValue(null);

            const emittedEvents: any[] = [];
            mockEventEmitter.on("db-error", (event) => {
                emittedEvents.push(event);
            });

            const { monitorLogger } = await import("../../../utils/logger");

            await expect(downloadBackup(dependencies)).rejects.toBeNull();

            expect(monitorLogger.error).toHaveBeenCalledWith("Failed to download backup", null);
            expect(emittedEvents[0]).toEqual({
                error: null,
                operation: "downloadBackup",
            });
        });

        it("should work with different buffer sizes and file names", async () => {
            const largeBuffer = Buffer.alloc(1024 * 1024, "a"); // 1MB buffer
            const expectedResult = {
                buffer: largeBuffer,
                fileName: "large-backup-with-long-filename-2024-12-31-23-59-59.sqlite",
            };

            mockDatabaseService.downloadBackup.mockResolvedValue(expectedResult);

            const result = await downloadBackup(dependencies);

            expect(result).toEqual(expectedResult);
            expect(result.buffer.length).toBe(1024 * 1024);
        });

        it("should handle empty buffer", async () => {
            const expectedResult = {
                buffer: Buffer.alloc(0),
                fileName: "empty-backup.db",
            };

            mockDatabaseService.downloadBackup.mockResolvedValue(expectedResult);

            const result = await downloadBackup(dependencies);

            expect(result).toEqual(expectedResult);
            expect(result.buffer.length).toBe(0);
        });
    });

    describe("refreshSites", () => {
        it("should successfully refresh sites when callbacks succeed", async () => {
            callbacks.loadSites = vi.fn().mockResolvedValue(undefined);
            callbacks.getSitesFromCache = vi.fn().mockReturnValue(mockSites);

            const result = await refreshSites(callbacks);

            expect(result).toEqual(mockSites);
            expect(callbacks.loadSites).toHaveBeenCalledTimes(1);
            expect(callbacks.loadSites).toHaveBeenCalledWith();
            expect(callbacks.getSitesFromCache).toHaveBeenCalledTimes(1);
            expect(callbacks.getSitesFromCache).toHaveBeenCalledWith();
        });

        it("should call loadSites before getSitesFromCache to ensure proper order", async () => {
            const callOrder: string[] = [];

            callbacks.loadSites = vi.fn().mockImplementation(async () => {
                callOrder.push("loadSites");
                return undefined;
            });

            callbacks.getSitesFromCache = vi.fn().mockImplementation(() => {
                callOrder.push("getSitesFromCache");
                return mockSites;
            });

            await refreshSites(callbacks);

            expect(callOrder).toEqual(["loadSites", "getSitesFromCache"]);
        });

        it("should log error and rethrow when loadSites fails", async () => {
            const mockError = new Error("Failed to load sites from database");
            callbacks.loadSites = vi.fn().mockRejectedValue(mockError);
            callbacks.getSitesFromCache = vi.fn().mockReturnValue(mockSites);

            const { monitorLogger } = await import("../../../utils/logger");

            await expect(refreshSites(callbacks)).rejects.toThrow("Failed to load sites from database");

            expect(monitorLogger.error).toHaveBeenCalledTimes(1);
            expect(monitorLogger.error).toHaveBeenCalledWith("Failed to refresh sites from database", mockError);

            expect(callbacks.loadSites).toHaveBeenCalledTimes(1);
            // getSitesFromCache should not be called if loadSites fails
            expect(callbacks.getSitesFromCache).not.toHaveBeenCalled();
        });

        it("should log error and rethrow when getSitesFromCache fails", async () => {
            const mockError = new Error("Cache access failed");
            callbacks.loadSites = vi.fn().mockResolvedValue(undefined);
            callbacks.getSitesFromCache = vi.fn().mockImplementation(() => {
                throw mockError;
            });

            const { monitorLogger } = await import("../../../utils/logger");

            await expect(refreshSites(callbacks)).rejects.toThrow("Cache access failed");

            expect(monitorLogger.error).toHaveBeenCalledTimes(1);
            expect(monitorLogger.error).toHaveBeenCalledWith("Failed to refresh sites from database", mockError);

            expect(callbacks.loadSites).toHaveBeenCalledTimes(1);
            expect(callbacks.getSitesFromCache).toHaveBeenCalledTimes(1);
        });

        it("should handle empty sites array", async () => {
            const emptySites: Site[] = [];
            callbacks.loadSites = vi.fn().mockResolvedValue(undefined);
            callbacks.getSitesFromCache = vi.fn().mockReturnValue(emptySites);

            const result = await refreshSites(callbacks);

            expect(result).toEqual(emptySites);
            expect(result).toHaveLength(0);
        });

        it("should handle different types of errors from loadSites", async () => {
            const stringError = "String error from loadSites";
            callbacks.loadSites = vi.fn().mockRejectedValue(stringError);

            const { monitorLogger } = await import("../../../utils/logger");

            await expect(refreshSites(callbacks)).rejects.toBe(stringError);

            expect(monitorLogger.error).toHaveBeenCalledWith("Failed to refresh sites from database", stringError);
        });

        it("should handle null/undefined errors from loadSites", async () => {
            callbacks.loadSites = vi.fn().mockRejectedValue(null);

            const { monitorLogger } = await import("../../../utils/logger");

            await expect(refreshSites(callbacks)).rejects.toBeNull();

            expect(monitorLogger.error).toHaveBeenCalledWith("Failed to refresh sites from database", null);
        });

        it("should return the exact same reference from getSitesFromCache", async () => {
            const siteReference = mockSites;
            callbacks.loadSites = vi.fn().mockResolvedValue(undefined);
            callbacks.getSitesFromCache = vi.fn().mockReturnValue(siteReference);

            const result = await refreshSites(callbacks);

            // Should be the exact same reference, not a copy
            expect(result).toBe(siteReference);
        });

        it("should handle async loadSites with delay", async () => {
            let loadCompleted = false;

            const delayedLoadSites = async (): Promise<void> => {
                await delay(100);
                loadCompleted = true;
            };

            callbacks.loadSites = vi.fn().mockImplementation(delayedLoadSites);

            callbacks.getSitesFromCache = vi.fn().mockImplementation(() => {
                // This should only be called after loadSites completes
                expect(loadCompleted).toBe(true);
                return mockSites;
            });

            const result = await refreshSites(callbacks);

            expect(result).toEqual(mockSites);
            expect(loadCompleted).toBe(true);
        });
    });

    describe("Integration scenarios", () => {
        it("should handle multiple operations with same dependencies", async () => {
            // Test downloadBackup
            const backupResult = {
                buffer: Buffer.from("backup data"),
                fileName: "test-backup.db",
            };
            mockDatabaseService.downloadBackup.mockResolvedValue(backupResult);

            const downloadResult = await downloadBackup(dependencies);
            expect(downloadResult).toEqual(backupResult);

            // Test refreshSites with different callbacks but should not interfere
            callbacks.loadSites = vi.fn().mockResolvedValue(undefined);
            callbacks.getSitesFromCache = vi.fn().mockReturnValue(mockSites);

            const sitesResult = await refreshSites(callbacks);
            expect(sitesResult).toEqual(mockSites);

            // Both operations should have worked independently
            expect(mockDatabaseService.downloadBackup).toHaveBeenCalledTimes(1);
            expect(callbacks.loadSites).toHaveBeenCalledTimes(1);
            expect(callbacks.getSitesFromCache).toHaveBeenCalledTimes(1);
        });

        it("should handle event emitter with multiple listeners", async () => {
            const mockError = new Error("Test error");
            mockDatabaseService.downloadBackup.mockRejectedValue(mockError);

            const events: any[] = [];
            const listener1 = (event: any) => events.push({ listener: 1, event });
            const listener2 = (event: any) => events.push({ listener: 2, event });

            mockEventEmitter.on("db-error", listener1);
            mockEventEmitter.on("db-error", listener2);

            await expect(downloadBackup(dependencies)).rejects.toThrow("Test error");

            expect(events).toHaveLength(2);
            expect(events[0].listener).toBe(1);
            expect(events[1].listener).toBe(2);
            expect(events[0].event).toEqual({ error: mockError, operation: "downloadBackup" });
            expect(events[1].event).toEqual({ error: mockError, operation: "downloadBackup" });
        });
    });

    describe("Type safety and interface compliance", () => {
        it("should work with proper DataBackupDependencies interface", () => {
            const typedDeps: DataBackupDependencies = {
                databaseService: mockDatabaseService as any,
                eventEmitter: mockEventEmitter,
            };

            expect(typedDeps.databaseService).toBeDefined();
            expect(typedDeps.eventEmitter).toBeDefined();
            expect(typedDeps.eventEmitter).toBeInstanceOf(EventEmitter);
        });

        it("should work with proper DataBackupCallbacks interface", () => {
            const typedCallbacks: DataBackupCallbacks = {
                getSitesFromCache: () => mockSites,
                loadSites: async () => {
                    /* no-op */
                },
            };

            expect(typeof typedCallbacks.getSitesFromCache).toBe("function");
            expect(typeof typedCallbacks.loadSites).toBe("function");
            expect(typedCallbacks.getSitesFromCache()).toEqual(mockSites);
        });

        it("should return Promise<Site[]> from refreshSites", async () => {
            callbacks.loadSites = vi.fn().mockResolvedValue(undefined);
            callbacks.getSitesFromCache = vi.fn().mockReturnValue(mockSites);

            const result: Promise<Site[]> = refreshSites(callbacks);

            expect(result).toBeInstanceOf(Promise);
            const sites = await result;
            expect(Array.isArray(sites)).toBe(true);
            expect(sites.every((site) => typeof site.identifier === "string")).toBe(true);
        });

        it("should return Promise<{buffer: Buffer, fileName: string}> from downloadBackup", async () => {
            const expectedResult = {
                buffer: Buffer.from("test"),
                fileName: "test.db",
            };
            mockDatabaseService.downloadBackup.mockResolvedValue(expectedResult);

            const result: Promise<{ buffer: Buffer; fileName: string }> = downloadBackup(dependencies);

            expect(result).toBeInstanceOf(Promise);
            const backup = await result;
            expect(backup.buffer).toBeInstanceOf(Buffer);
            expect(typeof backup.fileName).toBe("string");
        });
    });
});
