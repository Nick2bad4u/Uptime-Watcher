/**
 * Tests for DatabaseManager class.
 * Tests error handling when callbacks are not set.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "events";
import { DatabaseManager, DatabaseManagerDependencies } from "../../managers/DatabaseManager";

// Mock the utility functions
vi.mock("../../utils/database", () => ({
    refreshSites: vi.fn(() => Promise.resolve([])),
    loadSitesFromDatabase: vi.fn(() => Promise.resolve()),
    setHistoryLimit: vi.fn(() => Promise.resolve()),
    importData: vi.fn(() => Promise.resolve(true)),
    exportData: vi.fn(() => Promise.resolve("exported-data")),
    initDatabase: vi.fn(() => Promise.resolve()),
    downloadBackup: vi.fn(() => Promise.resolve({ buffer: Buffer.from("test"), fileName: "test.db" })),
}));

// Mock dependencies
const mockDependencies: DatabaseManagerDependencies = {
    eventEmitter: new EventEmitter(),
    repositories: {
        database: {
            getInstance: vi.fn(),
        } as any,
        site: {
            findAll: vi.fn(),
            exportAll: vi.fn(),
        } as any,
        monitor: {
            findAll: vi.fn(),
        } as any,
        history: {
            findAll: vi.fn(),
            pruneHistory: vi.fn(),
        } as any,
        settings: {
            get: vi.fn(),
            set: vi.fn(),
        } as any,
    },
};

describe("DatabaseManager", () => {
    let databaseManager: DatabaseManager;

    beforeEach(() => {
        vi.clearAllMocks();
        databaseManager = new DatabaseManager(mockDependencies);
    });

    describe("Error handling when callbacks not set", () => {
        it("should throw error when initialize is called without callbacks", async () => {
            // Don't call setCallbacks - this should trigger the error (lines 78-79)
            await expect(databaseManager.initialize()).rejects.toThrow(
                "DatabaseManager callbacks not set. Call setCallbacks() first."
            );
        });

        it("should throw error when importData is called without callbacks", async () => {
            // Don't call setCallbacks - this should trigger the error (lines 145-146)
            await expect(databaseManager.importData("test-data")).rejects.toThrow(
                "DatabaseManager callbacks not set. Call setCallbacks() first."
            );
        });

        it("should throw error when refreshSites is called without callbacks", async () => {
            // Don't call setCallbacks - this should trigger the error (lines 183-184)
            await expect(databaseManager.refreshSites()).rejects.toThrow(
                "DatabaseManager callbacks not set. Call setCallbacks() first."
            );
        });

        it("should throw error when setHistoryLimit is called without callbacks", async () => {
            // Don't call setCallbacks - this should trigger the error (lines 199-200)
            await expect(databaseManager.setHistoryLimit(100)).rejects.toThrow(
                "DatabaseManager callbacks not set. Call setCallbacks() first."
            );
        });

        it("should throw error in loadSites when callbacks not set", async () => {
            // This is a private method, but we can test it indirectly through initialize
            await expect(databaseManager.initialize()).rejects.toThrow(
                "DatabaseManager callbacks not set. Call setCallbacks() first."
            );
        });
    });

    describe("Methods that work without callbacks", () => {
        it("should handle exportData method which doesn't require callbacks", async () => {
            // exportData should work even without callbacks (lines 93-94)
            const result = await databaseManager.exportData();
            expect(typeof result).toBe("string");
        });

        it("should handle downloadBackup method which doesn't require callbacks", async () => {
            // downloadBackup should work even without callbacks
            const result = await databaseManager.downloadBackup();
            expect(result).toHaveProperty("buffer");
            expect(result).toHaveProperty("fileName");
        });
    });

    describe("Methods working with callbacks set", () => {
        beforeEach(() => {
            const mockCallbacks = {
                getSitesFromCache: vi.fn(() => []),
                updateSitesCache: vi.fn(),
                startMonitoringForSite: vi.fn(() => Promise.resolve(true)),
                setHistoryLimit: vi.fn(),
            };
            
            databaseManager.setCallbacks(mockCallbacks);
        });

        it("should work properly when callbacks are set", async () => {
            // These should not throw when callbacks are set
            const sites = await databaseManager.refreshSites();
            expect(Array.isArray(sites)).toBe(true);

            await databaseManager.initialize();
            
            const importResult = await databaseManager.importData("test-data");
            expect(typeof importResult).toBe("boolean");
            
            await databaseManager.setHistoryLimit(100);
            
            const exportResult = await databaseManager.exportData();
            expect(typeof exportResult).toBe("string");
        });
    });
});
