/**
 * Tests for DatabaseService.
 * Validates database initialization, schema management, and operations.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

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

        // Reset singleton instance
        (DatabaseService as any).instance = undefined;

        mockApp = await import("electron").then((m) => m.app);
        mockLogger = await import("../../../utils/logger").then((m) => m.logger);

        const { Database } = await import("node-sqlite3-wasm");
        mockDatabase = {
            run: vi.fn(),
            close: vi.fn(),
        };
        (Database as any).mockImplementation(() => mockDatabase);

        databaseService = DatabaseService.getInstance();
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

        it("should create new instance if none exists", () => {
            const instance = DatabaseService.getInstance();
            expect(instance).toBeInstanceOf(DatabaseService);
        });
    });

    describe("Database Initialization", () => {
        it("should initialize database successfully", async () => {
            mockApp.getPath.mockReturnValue("/mock/userData");

            const db = await databaseService.initialize();

            expect(mockApp.getPath).toHaveBeenCalledWith("userData");
            expect(path.join).toHaveBeenCalledWith("/mock/userData", "uptime-watcher.sqlite");
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[DatabaseService] Initializing SQLite DB at: /mock/userData/uptime-watcher.sqlite"
            );
            expect(mockDatabase.run).toHaveBeenCalledTimes(6); // 6 tables created
            expect(mockLogger.info).toHaveBeenCalledWith("[DatabaseService] Database initialized successfully");
            expect(db).toBe(mockDatabase);
        });

        it("should return existing database if already initialized", async () => {
            // Initialize once
            await databaseService.initialize();
            vi.clearAllMocks();

            // Initialize again
            const db = await databaseService.initialize();

            expect(mockApp.getPath).not.toHaveBeenCalled();
            expect(mockDatabase.run).not.toHaveBeenCalled();
            expect(db).toBe(mockDatabase);
        });

        it("should handle initialization errors", async () => {
            const error = new Error("Database initialization failed");
            const { Database } = await import("node-sqlite3-wasm");
            (Database as any).mockImplementation(() => {
                throw error;
            });

            await expect(databaseService.initialize()).rejects.toThrow("Database initialization failed");
            expect(mockLogger.error).toHaveBeenCalledWith("[DatabaseService] Failed to initialize database", error);
        });

        it("should handle table creation errors", async () => {
            const error = new Error("Table creation failed");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            await expect(databaseService.initialize()).rejects.toThrow("Table creation failed");
            expect(mockLogger.error).toHaveBeenCalledWith("[DatabaseSchema] Failed to create tables", error);
        });
    });

    describe("Database Access", () => {
        it("should return database when initialized", async () => {
            await databaseService.initialize();

            const db = databaseService.getDatabase();
            expect(db).toBe(mockDatabase);
        });

        it("should throw error when database not initialized", () => {
            expect(() => databaseService.getDatabase()).toThrow("Database not initialized. Call initialize() first.");
        });
    });

    describe("Table Creation", () => {
        it("should create all required tables", async () => {
            await databaseService.initialize();

            // Verify all 6 tables were created
            expect(mockDatabase.run).toHaveBeenCalledTimes(6);

            // Check specific table creation SQL
            const createTableCalls = mockDatabase.run.mock.calls;
            expect(createTableCalls[0][0]).toContain("CREATE TABLE IF NOT EXISTS sites");
            expect(createTableCalls[1][0]).toContain("CREATE TABLE IF NOT EXISTS monitors");
            expect(createTableCalls[2][0]).toContain("CREATE TABLE IF NOT EXISTS history");
            expect(createTableCalls[3][0]).toContain("CREATE TABLE IF NOT EXISTS settings");
            expect(createTableCalls[4][0]).toContain("CREATE TABLE IF NOT EXISTS stats");
            expect(createTableCalls[5][0]).toContain("CREATE TABLE IF NOT EXISTS logs");

            expect(mockLogger.info).toHaveBeenCalledWith("[DatabaseSchema] All tables created successfully");
        });

        it("should handle database not initialized error during table creation", async () => {
            // This test is no longer relevant as createTables is now part of the utility module
            // and the database service ensures the database is initialized before calling it.
            // Instead, we'll test that getDatabase throws when not initialized
            expect(() => {
                databaseService.getDatabase();
            }).toThrow("Database not initialized");
        });
    });

    describe("Database Closure", () => {
        it("should close database successfully", async () => {
            await databaseService.initialize();

            await databaseService.close();

            expect(mockDatabase.close).toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalledWith("[DatabaseService] Database connection closed");
        });

        it("should handle close when database not initialized", async () => {
            await databaseService.close();

            expect(mockDatabase.close).not.toHaveBeenCalled();
        });

        it("should handle close errors", async () => {
            await databaseService.initialize();
            const error = new Error("Close failed");
            mockDatabase.close.mockImplementation(() => {
                throw error;
            });

            await expect(databaseService.close()).rejects.toThrow("Close failed");
            expect(mockLogger.error).toHaveBeenCalledWith("[DatabaseService] Failed to close database", error);
        });
    });

    describe("Database Backup", () => {
        it("should create backup successfully", async () => {
            const mockBuffer = Buffer.from("mock database content");
            const mockFs = await import("fs");
            (mockFs.readFileSync as any).mockReturnValue(mockBuffer);

            const result = await databaseService.downloadBackup();

            expect(mockApp.getPath).toHaveBeenCalledWith("userData");
            expect(path.join).toHaveBeenCalledWith("/mock/userData", "uptime-watcher.sqlite");
            expect(mockFs.readFileSync).toHaveBeenCalledWith("/mock/userData/uptime-watcher.sqlite");
            expect(result).toEqual({
                buffer: mockBuffer,
                fileName: "uptime-watcher-backup.sqlite",
            });
            expect(mockLogger.info).toHaveBeenCalledWith("[DatabaseBackup] Database backup created successfully");
        });

        it("should handle backup errors", async () => {
            const error = new Error("Backup failed");
            const mockFs = await import("fs");
            (mockFs.readFileSync as any).mockImplementation(() => {
                throw error;
            });

            await expect(databaseService.downloadBackup()).rejects.toThrow("Backup failed");
            expect(mockLogger.error).toHaveBeenCalledWith("[DatabaseBackup] Failed to create database backup", error);
        });
    });
});
