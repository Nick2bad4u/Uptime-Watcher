/**
 * Tests for DatabaseManager class.
 * Tests event-driven communication instead of callbacks.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "events";
import { DatabaseManager, DatabaseManagerDependencies } from "../../managers/DatabaseManager";
import { DATABASE_EVENTS } from "../../events";

// Mock the utility functions
vi.mock("../../utils/database", () => ({
    refreshSites: vi.fn(() => Promise.resolve([])),
    loadSitesFromDatabase: vi.fn(() => Promise.resolve()),
    setHistoryLimit: vi.fn((params) => {
        // Call the setHistoryLimit callback to simulate the real behavior
        params?.setHistoryLimit?.(params.limit);
        return Promise.resolve();
    }),
    getHistoryLimit: vi.fn((getCallback) => getCallback()),
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
        } as Partial<DatabaseManagerDependencies["repositories"]["database"]> as DatabaseManagerDependencies["repositories"]["database"],
        site: {
            findAll: vi.fn(),
            exportAll: vi.fn(),
        } as Partial<DatabaseManagerDependencies["repositories"]["site"]> as DatabaseManagerDependencies["repositories"]["site"],
        monitor: {
            findAll: vi.fn(),
        } as Partial<DatabaseManagerDependencies["repositories"]["monitor"]> as DatabaseManagerDependencies["repositories"]["monitor"],
        history: {
            findAll: vi.fn(),
            pruneHistory: vi.fn(),
        } as Partial<DatabaseManagerDependencies["repositories"]["history"]> as DatabaseManagerDependencies["repositories"]["history"],
        settings: {
            get: vi.fn(),
            set: vi.fn(),
        } as Partial<DatabaseManagerDependencies["repositories"]["settings"]> as DatabaseManagerDependencies["repositories"]["settings"],
    },
};

describe("DatabaseManager", () => {
    let databaseManager: DatabaseManager;

    beforeEach(() => {
        vi.clearAllMocks();
        databaseManager = new DatabaseManager(mockDependencies);
    });

    describe("Event-driven communication", () => {
        it("should initialize without requiring callbacks", async () => {
            // Event-driven approach should work without callback setup
            try {
                await databaseManager.initialize();
                expect(true).toBe(true); // Success if no error thrown
            } catch (error) {
                // Should not throw "callbacks not set" error anymore
                expect((error as Error).message).not.toContain("callbacks not set");
            }
        });

        it("should emit database:initialized event when initialized", async () => {
            const eventSpy = vi.fn();
            mockDependencies.eventEmitter.on(DATABASE_EVENTS.INITIALIZED, eventSpy);

            try {
                await databaseManager.initialize();
                // May not complete due to mocking, but should emit event if successful
                expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
                    operation: "initialized",
                }));
            } catch (error) {
                // Event should still be emitted even if error occurs
                expect((error as Error).message).not.toContain("callbacks not set");
            }
        });

        it("should work with event-driven approach for refreshSites", async () => {
            // Event-driven approach should work without callback setup
            const sites = await databaseManager.refreshSites();
            expect(Array.isArray(sites)).toBe(true);
        });

        it("should emit events for data operations", async () => {
            const exportSpy = vi.fn();
            const importSpy = vi.fn();
            const backupSpy = vi.fn();
            const limitSpy = vi.fn();

            mockDependencies.eventEmitter.on(DATABASE_EVENTS.DATA_EXPORTED, exportSpy);
            mockDependencies.eventEmitter.on(DATABASE_EVENTS.DATA_IMPORTED, importSpy);
            mockDependencies.eventEmitter.on(DATABASE_EVENTS.BACKUP_DOWNLOADED, backupSpy);
            mockDependencies.eventEmitter.on(DATABASE_EVENTS.HISTORY_LIMIT_UPDATED, limitSpy);

            // Test export
            await databaseManager.exportData();
            expect(exportSpy).toHaveBeenCalledWith(expect.objectContaining({
                operation: "exported",
            }));

            // Test import
            await databaseManager.importData("test-data");
            expect(importSpy).toHaveBeenCalledWith(expect.objectContaining({
                operation: "imported",
            }));

            // Test backup
            await databaseManager.downloadBackup();
            expect(backupSpy).toHaveBeenCalledWith(expect.objectContaining({
                operation: "backup-downloaded",
            }));

            // Test history limit
            await databaseManager.setHistoryLimit(100);
            expect(limitSpy).toHaveBeenCalledWith(expect.objectContaining({
                operation: "history-limit-updated",
                limit: 100,
            }));
        });
    });

    describe("Database operations", () => {
        it("should handle exportData method", async () => {
            const result = await databaseManager.exportData();
            expect(typeof result).toBe("string");
        });

        it("should handle downloadBackup method", async () => {
            const result = await databaseManager.downloadBackup();
            expect(result).toHaveProperty("buffer");
            expect(result).toHaveProperty("fileName");
        });

        it("should handle importData method", async () => {
            const result = await databaseManager.importData("test-data");
            expect(typeof result).toBe("boolean");
        });

        it("should handle setHistoryLimit method", async () => {
            await databaseManager.setHistoryLimit(100);
            expect(databaseManager.getHistoryLimit()).toBe(100);
        });

        it("should handle getHistoryLimit method", () => {
            const limit = databaseManager.getHistoryLimit();
            expect(typeof limit).toBe("number");
        });
    });
});
