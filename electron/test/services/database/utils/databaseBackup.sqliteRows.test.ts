import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    assertSqliteDatabaseIntegrity,
    readDatabaseSchemaVersionFromFile,
} from "../../../../services/database/utils/backup/databaseBackup";

const { mockAll, mockClose, mockDatabaseConstructor, mockGet, mockPrepare } =
    vi.hoisted(() => {
        const mockGet = vi.fn();
        const mockAll = vi.fn();
        const mockPrepare = vi.fn(() => ({
            all: mockAll,
            get: mockGet,
        }));
        const mockClose = vi.fn();
        const mockDatabaseConstructor = vi.fn(function DatabaseMock() {
            return {
                close: mockClose,
                prepare: mockPrepare,
            };
        });

        return {
            mockAll,
            mockClose,
            mockDatabaseConstructor,
            mockGet,
            mockPrepare,
        };
    });

vi.mock("node-sqlite3-wasm", () => ({
    Database: mockDatabaseConstructor,
    default: { Database: mockDatabaseConstructor },
}));

describe("databaseBackup SQLite row access", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAll.mockReset();
        mockGet.mockReset();
        mockPrepare.mockClear();
        mockClose.mockClear();
        mockDatabaseConstructor.mockClear();
    });

    it("reads schema version from own numeric pragma data", () => {
        mockGet.mockReturnValue({ user_version: 7 });

        expect(readDatabaseSchemaVersionFromFile("backup.sqlite")).toBe(7);
        expect(mockDatabaseConstructor).toHaveBeenCalledWith("backup.sqlite", {
            fileMustExist: true,
        });
        expect(mockPrepare).toHaveBeenCalledWith("PRAGMA user_version");
        expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it("does not invoke user_version accessors while reading schema version", () => {
        const row = {};
        let accessCount = 0;

        Object.defineProperty(row, "user_version", {
            enumerable: true,
            get() {
                accessCount += 1;
                return 7;
            },
        });
        mockGet.mockReturnValue(row);

        expect(readDatabaseSchemaVersionFromFile("backup.sqlite")).toBe(0);
        expect(accessCount).toBe(0);
        expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it("accepts healthy integrity check rows with own data", () => {
        mockAll.mockReturnValue([{ quick_check: "ok" }]);

        expect(() =>
            assertSqliteDatabaseIntegrity({ filePath: "backup.sqlite" })
        ).not.toThrow();
        expect(mockPrepare).toHaveBeenCalledWith("PRAGMA quick_check");
        expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it("does not invoke integrity check row accessors", () => {
        const row = {};
        let accessCount = 0;

        Object.defineProperty(row, "quick_check", {
            enumerable: true,
            get() {
                accessCount += 1;
                return "ok";
            },
        });
        mockAll.mockReturnValue([row]);

        expect(() =>
            assertSqliteDatabaseIntegrity({ filePath: "backup.sqlite" })
        ).toThrow("SQLite quick_check failed: unknown");
        expect(accessCount).toBe(0);
        expect(mockClose).toHaveBeenCalledTimes(1);
    });
});
