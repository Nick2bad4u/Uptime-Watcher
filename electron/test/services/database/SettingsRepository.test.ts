/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SettingsRepository } from "../../../services/database/SettingsRepository";
import { DatabaseService } from "../../../services/database/DatabaseService";
import { logger } from "../../../utils/logger";
import { isDev } from "../../../electronUtils";

// Mock dependencies
vi.mock("../../../services/database/DatabaseService");
vi.mock("../../../utils/logger", () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));
vi.mock("../../../electronUtils", () => ({
    isDev: vi.fn(),
}));

describe("SettingsRepository", () => {
    let settingsRepository: SettingsRepository;
    let mockDatabase: any;
    let mockDatabaseService: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock database methods
        const mockStatement = {
            run: vi.fn(),
            finalize: vi.fn(),
        };
        
        mockDatabase = {
            all: vi.fn(),
            get: vi.fn(),
            run: vi.fn(),
            prepare: vi.fn().mockReturnValue(mockStatement),
        };

        // Mock DatabaseService
        mockDatabaseService = {
            getDatabase: vi.fn().mockReturnValue(mockDatabase),
        };

        // Mock the static getInstance method
        (DatabaseService.getInstance as any).mockReturnValue(mockDatabaseService);

        settingsRepository = new SettingsRepository();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("get", () => {
        it("should return setting value when found", async () => {
            mockDatabase.get.mockReturnValue({ value: "test-value" });

            const result = await settingsRepository.get("test-key");

            expect(mockDatabase.get).toHaveBeenCalledWith("SELECT value FROM settings WHERE key = ?", ["test-key"]);
            expect(result).toBe("test-value");
        });

        it("should return undefined when setting not found", async () => {
            mockDatabase.get.mockReturnValue(undefined);

            const result = await settingsRepository.get("nonexistent-key");

            expect(result).toBeUndefined();
        });

        it("should return undefined when value is null or empty", async () => {
            mockDatabase.get.mockReturnValue({ value: null });
            const result1 = await settingsRepository.get("null-key");
            expect(result1).toBeUndefined();

            mockDatabase.get.mockReturnValue({ value: "" });
            const result2 = await settingsRepository.get("empty-key");
            expect(result2).toBeUndefined();
        });

        it("should convert value to string", async () => {
            mockDatabase.get.mockReturnValue({ value: 123 });

            const result = await settingsRepository.get("numeric-key");

            expect(result).toBe("123");
        });

        it("should handle database errors", async () => {
            const error = new Error("Database error");
            mockDatabase.get.mockImplementation(() => {
                throw error;
            });

            await expect(settingsRepository.get("test-key")).rejects.toThrow("Database error");
            expect(logger.error).toHaveBeenCalledWith("[SettingsRepository] Failed to get setting: test-key", error);
        });
    });

    describe("set", () => {
        it("should set a setting value in development mode", async () => {
            (isDev as any).mockReturnValue(true);

            await settingsRepository.set("test-key", "test-value");

            expect(mockDatabase.run).toHaveBeenCalledWith(
                "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
                ["test-key", "test-value"]
            );
            expect(logger.debug).toHaveBeenCalledWith("[SettingsRepository] Set setting: test-key = test-value");
        });

        it("should set a setting value in production mode", async () => {
            (isDev as any).mockReturnValue(false);

            await settingsRepository.set("test-key", "test-value");

            expect(mockDatabase.run).toHaveBeenCalledWith(
                "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
                ["test-key", "test-value"]
            );
            expect(logger.debug).not.toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            const error = new Error("Insert failed");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            await expect(settingsRepository.set("test-key", "test-value")).rejects.toThrow("Insert failed");
            expect(logger.error).toHaveBeenCalledWith("[SettingsRepository] Failed to set setting: test-key", error);
        });
    });

    describe("delete", () => {
        it("should delete a setting in development mode", async () => {
            (isDev as any).mockReturnValue(true);

            await settingsRepository.delete("test-key");

            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM settings WHERE key = ?", ["test-key"]);
            expect(logger.debug).toHaveBeenCalledWith("[SettingsRepository] Deleted setting: test-key");
        });

        it("should delete a setting in production mode", async () => {
            (isDev as any).mockReturnValue(false);

            await settingsRepository.delete("test-key");

            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM settings WHERE key = ?", ["test-key"]);
            expect(logger.debug).not.toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            const error = new Error("Delete failed");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            await expect(settingsRepository.delete("test-key")).rejects.toThrow("Delete failed");
            expect(logger.error).toHaveBeenCalledWith("[SettingsRepository] Failed to delete setting: test-key", error);
        });
    });

    describe("getAll", () => {
        it("should return all settings as an object", async () => {
            const mockSettings = [
                { key: "setting1", value: "value1" },
                { key: "setting2", value: "value2" },
                { key: "setting3", value: "value3" },
            ];
            mockDatabase.all.mockReturnValue(mockSettings);

            const result = await settingsRepository.getAll();

            expect(mockDatabase.all).toHaveBeenCalledWith("SELECT * FROM settings");
            expect(result).toEqual({
                setting1: "value1",
                setting2: "value2",
                setting3: "value3",
            });
        });

        it("should return empty object when no settings", async () => {
            mockDatabase.all.mockReturnValue([]);

            const result = await settingsRepository.getAll();

            expect(result).toEqual({});
        });

        it("should handle non-string keys", async () => {
            const mockSettings = [
                { key: "valid-key", value: "valid-value" },
                { key: null, value: "invalid-value" },
                { key: 123, value: "numeric-key" },
            ];
            mockDatabase.all.mockReturnValue(mockSettings);

            const result = await settingsRepository.getAll();

            // Should only include valid string keys
            expect(result).toEqual({
                "valid-key": "valid-value",
            });
        });

        it("should convert values to strings", async () => {
            const mockSettings = [
                { key: "string-value", value: "test" },
                { key: "number-value", value: 42 },
                { key: "boolean-value", value: true },
            ];
            mockDatabase.all.mockReturnValue(mockSettings);

            const result = await settingsRepository.getAll();

            expect(result).toEqual({
                "string-value": "test",
                "number-value": "42",
                "boolean-value": "true",
            });
        });

        it("should handle database errors", async () => {
            const error = new Error("Query failed");
            mockDatabase.all.mockImplementation(() => {
                throw error;
            });

            await expect(settingsRepository.getAll()).rejects.toThrow("Query failed");
            expect(logger.error).toHaveBeenCalledWith("[SettingsRepository] Failed to get all settings", error);
        });
    });

    describe("deleteAll", () => {
        it("should delete all settings", async () => {
            await settingsRepository.deleteAll();

            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM settings");
            expect(logger.info).toHaveBeenCalledWith("[SettingsRepository] All settings deleted");
        });

        it("should handle database errors", async () => {
            const error = new Error("Delete all failed");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            await expect(settingsRepository.deleteAll()).rejects.toThrow("Delete all failed");
            expect(logger.error).toHaveBeenCalledWith("[SettingsRepository] Failed to delete all settings", error);
        });
    });

    describe("bulkInsert", () => {
        it("should bulk insert settings", async () => {
            const settings = {
                key1: "value1",
                key2: "value2",
                key3: "value3",
            };

            await settingsRepository.bulkInsert(settings);

            // Should start transaction
            expect(mockDatabase.run).toHaveBeenCalledWith("BEGIN TRANSACTION");
            
            // Should prepare statement
            expect(mockDatabase.prepare).toHaveBeenCalledWith(
                "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"
            );
            
            // Should run statements for each setting
            const mockStatement = mockDatabase.prepare.mock.results[0].value;
            expect(mockStatement.run).toHaveBeenCalledTimes(3);
            expect(mockStatement.run).toHaveBeenNthCalledWith(1, ["key1", "value1"]);
            expect(mockStatement.run).toHaveBeenNthCalledWith(2, ["key2", "value2"]);
            expect(mockStatement.run).toHaveBeenNthCalledWith(3, ["key3", "value3"]);
            
            // Should commit transaction
            expect(mockDatabase.run).toHaveBeenCalledWith("COMMIT");
            
            // Should finalize statement
            expect(mockStatement.finalize).toHaveBeenCalled();
        });

        it("should handle empty settings object", async () => {
            await settingsRepository.bulkInsert({});

            expect(mockDatabase.run).not.toHaveBeenCalled();
            expect(mockDatabase.prepare).not.toHaveBeenCalled();
            expect(logger.info).not.toHaveBeenCalled();
        });

        it("should convert values to strings", async () => {
            const settings = {
                string: "text",
                number: 42,
                boolean: true,
                object: { nested: "value" },
            };

            await settingsRepository.bulkInsert(settings as any);

            // Should start transaction
            expect(mockDatabase.run).toHaveBeenCalledWith("BEGIN TRANSACTION");
            
            // Should prepare statement
            expect(mockDatabase.prepare).toHaveBeenCalledWith(
                "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"
            );
            
            // Should run statements for each setting (order may vary)
            const mockStatement = mockDatabase.prepare.mock.results[0].value;
            expect(mockStatement.run).toHaveBeenCalledTimes(4);
            expect(mockStatement.run).toHaveBeenCalledWith(["string", "text"]);
            expect(mockStatement.run).toHaveBeenCalledWith(["number", "42"]);
            expect(mockStatement.run).toHaveBeenCalledWith(["boolean", "true"]);
            expect(mockStatement.run).toHaveBeenCalledWith(["object", "[object Object]"]);
            
            // Should commit transaction
            expect(mockDatabase.run).toHaveBeenCalledWith("COMMIT");
            
            // Should finalize statement
            expect(mockStatement.finalize).toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            const error = new Error("Bulk insert failed");
            mockDatabase.run.mockImplementation(() => {
                throw error;
            });

            const settings = { key1: "value1" };

            await expect(settingsRepository.bulkInsert(settings)).rejects.toThrow("Bulk insert failed");
            expect(logger.error).toHaveBeenCalledWith("[SettingsRepository] Failed to bulk insert settings", error);
        });
    });
});
