/**
 * Tests for DatabaseService.
 * Validates database initialization, schema management, and operations.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import * as path from "path";

import { DatabaseService } from "../../../services/database/DatabaseService";

// Mock dependencies
vi.mock("electron", () => ({
    app: {
        getPath: vi.fn(() => "/mock/userData"),
    },
}));

vi.mock("node-sqlite3-wasm", () => ({
    Database: vi.fn(() => ({
        run: vi.fn(),
        close: vi.fn(),
    })),
}));

vi.mock("../../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    },
}));

vi.mock("../../../services/database/utils/index", () => ({
    createDatabaseTables: vi.fn(),
    createDatabaseIndexes: vi.fn(),
    setupMonitorTypeValidation: vi.fn(),
    createDatabaseBackup: vi.fn(),
}));

vi.mock("path", () => ({
    join: vi.fn((...args) => args.join("/")),
}));

vi.mock("fs", () => ({
    readFileSync: vi.fn(() => Buffer.from("mock database content")),
}));

describe("DatabaseService", () => {
    let databaseService: DatabaseService;
    let mockDatabase: any;
    let mockApp: any;
    let mockLogger: any;

    beforeEach(async () => {
        vi.clearAllMocks();

        mockApp = await import("electron").then((m) => m.app);
        mockLogger = await import("../../../utils/logger").then((m) => m.logger);

        const { Database } = await import("node-sqlite3-wasm");
        mockDatabase = {
            run: vi.fn(),
            close: vi.fn(),
        };
        (Database as any).mockImplementation(() => mockDatabase);

        // Get the singleton instance
        databaseService = DatabaseService.getInstance();

        // Reset the internal database state by setting _db to undefined
        (databaseService as any)._db = undefined;
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("Singleton Pattern", () => {
        it("should return the same instance", () => {
            const instance1 = DatabaseService.getInstance();
            const instance2 = DatabaseService.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe("initialize", () => {
        it("should initialize database and create tables", () => {
            const result = databaseService.initialize();

            expect(mockApp.getPath).toHaveBeenCalledWith("userData");
            expect(path.join).toHaveBeenCalledWith("/mock/userData", "uptime-watcher.sqlite");
            expect(result).toBe(mockDatabase);
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[DatabaseService] Initializing SQLite DB at: /mock/userData/uptime-watcher.sqlite"
            );
            expect(mockLogger.info).toHaveBeenCalledWith("[DatabaseService] Database initialized successfully");
        });

        it("should return existing database if already initialized", () => {
            // First initialization
            const db1 = databaseService.initialize();

            // Second call should return the same instance
            const db2 = databaseService.initialize();

            expect(db1).toBe(db2);
            expect(db1).toBe(mockDatabase);
        });

        it("should handle database initialization errors", async () => {
            const Database = (await import("node-sqlite3-wasm")).Database;
            const error = new Error("Failed to create database");
            vi.mocked(Database).mockImplementation(() => {
                throw error;
            });

            expect(() => databaseService.initialize()).toThrow("Failed to create database");
            expect(mockLogger.error).toHaveBeenCalledWith("[DatabaseService] Failed to initialize database", error);
        });

        it("should handle table creation errors", async () => {
            const { createDatabaseTables } = await import("../../../services/database/utils/index");
            const error = new Error("Failed to create tables");
            vi.mocked(createDatabaseTables).mockImplementation(() => {
                throw error;
            });

            expect(() => databaseService.initialize()).toThrow("Failed to create tables");
        });
    });

    describe("getDatabase", () => {
        it("should return database instance when initialized", () => {
            databaseService.initialize();
            const db = databaseService.getDatabase();
            expect(db).toBe(mockDatabase);
        });

        it("should throw error when not initialized", () => {
            expect(() => databaseService.getDatabase()).toThrow("Database not initialized. Call initialize() first.");
        });
    });

    describe("downloadBackup", () => {
        it("should create database backup", async () => {
            databaseService.initialize();

            const { createDatabaseBackup } = await import("../../../services/database/utils/index");
            const mockBackup = { buffer: Buffer.from("backup"), fileName: "backup.sqlite" };
            vi.mocked(createDatabaseBackup).mockResolvedValue(mockBackup);

            const result = await databaseService.downloadBackup();

            expect(result).toEqual(mockBackup);
            expect(createDatabaseBackup).toHaveBeenCalledWith("/mock/userData/uptime-watcher.sqlite");
        });

        it("should handle backup creation errors", async () => {
            const { createDatabaseBackup } = await import("../../../services/database/utils/index");
            const error = new Error("Backup failed");
            vi.mocked(createDatabaseBackup).mockRejectedValue(error);

            await expect(databaseService.downloadBackup()).rejects.toThrow("Backup failed");
        });
    });

    describe("executeTransaction", () => {
        beforeEach(() => {
            databaseService.initialize();
        });

        it("should execute operation within transaction and commit", async () => {
            const operation = vi.fn().mockResolvedValue("result");

            const result = await databaseService.executeTransaction(operation);

            expect(mockDatabase.run).toHaveBeenCalledWith("BEGIN TRANSACTION");
            expect(operation).toHaveBeenCalledWith(mockDatabase);
            expect(mockDatabase.run).toHaveBeenCalledWith("COMMIT");
            expect(result).toBe("result");
        });

        it("should rollback transaction on operation error", async () => {
            const error = new Error("Operation failed");
            const operation = vi.fn().mockRejectedValue(error);

            await expect(databaseService.executeTransaction(operation)).rejects.toThrow("Operation failed");

            expect(mockDatabase.run).toHaveBeenCalledWith("BEGIN TRANSACTION");
            expect(operation).toHaveBeenCalledWith(mockDatabase);
            expect(mockDatabase.run).toHaveBeenCalledWith("ROLLBACK");
        });

        it("should handle rollback errors gracefully", async () => {
            const operationError = new Error("Operation failed");
            const rollbackError = new Error("Rollback failed");
            const operation = vi.fn().mockRejectedValue(operationError);

            mockDatabase.run.mockImplementation((sql: string) => {
                if (sql === "ROLLBACK") {
                    throw rollbackError;
                }
            });

            await expect(databaseService.executeTransaction(operation)).rejects.toThrow("Operation failed");

            expect(mockLogger.error).toHaveBeenCalledWith(
                "[DatabaseService] Failed to rollback transaction",
                rollbackError
            );
        });

        it("should throw error if database not initialized", async () => {
            const uninitializedService = DatabaseService.getInstance();
            (uninitializedService as any)._db = undefined;

            const operation = vi.fn();

            await expect(uninitializedService.executeTransaction(operation)).rejects.toThrow(
                "Database not initialized. Call initialize() first."
            );
        });
    });

    describe("close", () => {
        it("should close database connection", () => {
            databaseService.initialize();

            databaseService.close();

            expect(mockDatabase.close).toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalledWith("[DatabaseService] Database connection closed");
        });

        it("should handle close errors", () => {
            databaseService.initialize();
            const error = new Error("Close failed");
            mockDatabase.close.mockImplementation(() => {
                throw error;
            });

            expect(() => databaseService.close()).toThrow("Close failed");
            expect(mockLogger.error).toHaveBeenCalledWith("[DatabaseService] Failed to close database", error);
        });

        it("should handle multiple close calls gracefully", () => {
            databaseService.initialize();

            databaseService.close();
            databaseService.close(); // Second call should be safe

            expect(mockDatabase.close).toHaveBeenCalledTimes(1);
        });

        it("should handle close when database not initialized", () => {
            // Should not throw error
            expect(() => databaseService.close()).not.toThrow();
        });
    });
});
