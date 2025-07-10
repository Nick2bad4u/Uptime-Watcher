import { afterEach, describe, expect, it, vi } from "vitest";

import { createDatabaseBackup } from "../../../../services/database/utils/databaseBackup";

const mockFs = {
    readFileSync: vi.fn(),
};

// Mock the fs module with both default export and named export
vi.mock("node:fs", async () => {
    return {
        default: mockFs,
        readFileSync: mockFs.readFileSync,
    };
});

// Mock logger
vi.mock("../../../../utils/index", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

describe("Database Backup Utilities", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("createDatabaseBackup", () => {
        it("should successfully create database backup", async () => {
            const mockBuffer = Buffer.from("mock database content");
            const dbPath = "/path/to/database.sqlite";
            
            mockFs.readFileSync.mockReturnValue(mockBuffer);

            const result = await createDatabaseBackup(dbPath);

            expect(result).toEqual({
                buffer: mockBuffer,
                fileName: "uptime-watcher-backup.sqlite",
            });
            expect(mockFs.readFileSync).toHaveBeenCalledWith(dbPath);
        });

        it("should handle file read errors", async () => {
            const dbPath = "/path/to/nonexistent.sqlite";
            const error = new Error("File not found");
            
            mockFs.readFileSync.mockImplementation(() => {
                throw error;
            });

            await expect(createDatabaseBackup(dbPath)).rejects.toThrow("File not found");
            expect(mockFs.readFileSync).toHaveBeenCalledWith(dbPath);
        });

        it("should handle permission errors", async () => {
            const dbPath = "/path/to/protected.sqlite";
            const error = new Error("Permission denied");
            
            mockFs.readFileSync.mockImplementation(() => {
                throw error;
            });

            await expect(createDatabaseBackup(dbPath)).rejects.toThrow("Permission denied");
        });

        it("should handle empty database files", async () => {
            const mockBuffer = Buffer.alloc(0);
            const dbPath = "/path/to/empty.sqlite";
            
            mockFs.readFileSync.mockReturnValue(mockBuffer);

            const result = await createDatabaseBackup(dbPath);

            expect(result.buffer).toEqual(mockBuffer);
            expect(result.buffer.length).toBe(0);
            expect(result.fileName).toBe("uptime-watcher-backup.sqlite");
        });

        it("should handle large database files", async () => {
            const mockBuffer = Buffer.alloc(1024 * 1024); // 1MB
            const dbPath = "/path/to/large.sqlite";
            
            mockFs.readFileSync.mockReturnValue(mockBuffer);

            const result = await createDatabaseBackup(dbPath);

            expect(result.buffer).toEqual(mockBuffer);
            expect(result.buffer.length).toBe(1024 * 1024);
            expect(result.fileName).toBe("uptime-watcher-backup.sqlite");
        });

        it("should handle special characters in path", async () => {
            const mockBuffer = Buffer.from("database content");
            const dbPath = "/path/to/database with spaces & special-chars.sqlite";
            
            mockFs.readFileSync.mockReturnValue(mockBuffer);

            const result = await createDatabaseBackup(dbPath);

            expect(result.buffer).toEqual(mockBuffer);
            expect(mockFs.readFileSync).toHaveBeenCalledWith(dbPath);
        });

        it("should handle undefined/null path gracefully", async () => {
            const error = new Error("Path must be a string");
            
            mockFs.readFileSync.mockImplementation(() => {
                throw error;
            });

            await expect(createDatabaseBackup(null as any)).rejects.toThrow();
            await expect(createDatabaseBackup(undefined as any)).rejects.toThrow();
        });

        it("should handle network drive paths", async () => {
            const mockBuffer = Buffer.from("network database content");
            const dbPath = "\\\\server\\share\\database.sqlite";
            
            mockFs.readFileSync.mockReturnValue(mockBuffer);

            const result = await createDatabaseBackup(dbPath);

            expect(result.buffer).toEqual(mockBuffer);
            expect(result.fileName).toBe("uptime-watcher-backup.sqlite");
        });

        it("should handle relative paths", async () => {
            const mockBuffer = Buffer.from("relative database content");
            const dbPath = "./database.sqlite";
            
            mockFs.readFileSync.mockReturnValue(mockBuffer);

            const result = await createDatabaseBackup(dbPath);

            expect(result.buffer).toEqual(mockBuffer);
            expect(mockFs.readFileSync).toHaveBeenCalledWith(dbPath);
        });

        it("should maintain buffer integrity", async () => {
            const originalData = "database content with binary data \0\x01\x02\xFF";
            const mockBuffer = Buffer.from(originalData, "binary");
            const dbPath = "/path/to/binary.sqlite";
            
            mockFs.readFileSync.mockReturnValue(mockBuffer);

            const result = await createDatabaseBackup(dbPath);

            expect(result.buffer.toString("binary")).toBe(originalData);
            expect(Buffer.compare(result.buffer, mockBuffer)).toBe(0);
        });
    });
});
