/**
 * Test suite for SettingsRepository
 *
 * @module Unknown
 *
 * @file Comprehensive tests for unknown functionality in the Uptime Watcher
 *   application.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category General
 *
 * @tags ["test"]
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Database } from "node-sqlite3-wasm";

import { SettingsRepository } from "../../../services/database/SettingsRepository";

// Import the actual module to spy on it
import * as operationalHooks from "../../../utils/operationalHooks";

// Mock dependencies
const mockDatabase = {
    all: vi.fn(),
    get: vi.fn(),
    prepare: vi.fn().mockReturnValue({
        run: vi.fn(),
        finalize: vi.fn(),
    }),
    run: vi.fn(),
} as unknown as Database;

const mockDatabaseService = {
    executeTransaction: vi.fn(),
    getDatabase: vi.fn().mockReturnValue(mockDatabase),
};

describe("SettingsRepository", () => {
    let repository: SettingsRepository;

    beforeEach(() => {
        vi.clearAllMocks();

        // Spy on withDatabaseOperation and make it just call the operation directly
        vi.spyOn(operationalHooks, "withDatabaseOperation").mockImplementation(
            async (operation) => await operation()
        );

        // Reset database mock implementations
        (mockDatabase.get as any).mockReturnValue(undefined);
        (mockDatabase.all as any).mockReturnValue([]);
        (mockDatabaseService.getDatabase as any).mockReturnValue(mockDatabase);
        mockDatabaseService.executeTransaction.mockResolvedValue(undefined);

        repository = new SettingsRepository({
            databaseService: mockDatabaseService as any,
        });
    });
    describe("get", () => {
        it("should return setting value when key exists", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SettingsRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const mockSetting = { value: "test-value" };
            (mockDatabase.get as any).mockReturnValue(mockSetting);

            const result = await repository.get("test-key");

            // Debug: Check if the methods were called
            expect(mockDatabaseService.getDatabase).toHaveBeenCalled();
            expect(mockDatabase.get).toHaveBeenCalledWith(
                expect.stringContaining("SELECT value FROM settings"),
                ["test-key"]
            );

            // Main assertion
            expect(result).toBe("test-value");
        });
        it("should return undefined when setting does not exist", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SettingsRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            (mockDatabase.get as any).mockReturnValue(undefined);

            const result = await repository.get("nonexistent-key");

            expect(result).toBeUndefined();
        });
        it("should handle database errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SettingsRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Database error");
            (mockDatabase.get as any).mockImplementation(() => {
                throw error;
            });
            await expect(repository.get("test-key")).rejects.toThrow(
                "Database error"
            );
        });
    });
    describe("getAll", () => {
        it("should return all settings as key-value pairs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SettingsRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const mockSettings = [
                { key: "setting1", value: "value1" },
                { key: "setting2", value: "value2" },
            ];
            (mockDatabase.all as any).mockReturnValue(mockSettings);

            const result = await repository.getAll();

            expect(result).toEqual({
                setting1: "value1",
                setting2: "value2",
            });
            expect(mockDatabase.all).toHaveBeenCalledWith(
                expect.stringContaining("SELECT * FROM settings")
            );
        });
        it("should return empty object when no settings exist", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SettingsRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            (mockDatabase.all as any).mockReturnValue([]);

            const result = await repository.getAll();

            expect(result).toEqual({});
        });
        it("should handle database errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SettingsRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Database error");
            (mockDatabase.all as any).mockImplementation(() => {
                throw error;
            });
            await expect(repository.getAll()).rejects.toThrow("Database error");
        });
        it("should handle null value gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SettingsRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const mockSettings = [
                { key: "setting1", value: "value1" },
                { key: "setting2", value: null },
            ];
            (mockDatabase.all as any).mockReturnValue(mockSettings);

            const result = await repository.getAll();

            expect(result).toEqual({
                setting1: "value1",
                setting2: "",
            });
        });
    });
    describe("set", () => {
        it("should set a setting value successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SettingsRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            mockDatabaseService.executeTransaction.mockResolvedValue(undefined);

            await repository.set("test-key", "test-value");

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalledWith(
                expect.any(Function)
            );
        });
        it("should handle database errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SettingsRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Database error");
            mockDatabaseService.executeTransaction.mockRejectedValue(error);

            await expect(
                repository.set("test-key", "test-value")
            ).rejects.toThrow("Database error");
        });
        it("should handle empty string value", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SettingsRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            mockDatabaseService.executeTransaction.mockResolvedValue(undefined);

            await repository.set("test-key", "");

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should handle special characters in key and value", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SettingsRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            mockDatabaseService.executeTransaction.mockResolvedValue(undefined);

            await repository.set(
                "test-key-with-special-chars_123",
                "value with spaces & symbols"
            );

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
    });
    describe("internal methods", () => {
        describe("setInternal", () => {
            it("should set setting using database run method", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: SettingsRepository", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                repository.setInternal(mockDatabase, "test-key", "test-value");

                expect(mockDatabase.run).toHaveBeenCalledWith(
                    expect.stringContaining("INSERT OR REPLACE"),
                    ["test-key", "test-value"]
                );
            });
            it("should handle empty values", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: SettingsRepository", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                repository.setInternal(mockDatabase, "test-key", "");

                expect(mockDatabase.run).toHaveBeenCalledWith(
                    expect.stringContaining("INSERT OR REPLACE"),
                    ["test-key", ""]
                );
            });
        });
        describe("deleteInternal", () => {
            it("should delete setting by key", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: SettingsRepository", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Data Deletion", "type");

                repository.deleteInternal(mockDatabase, "test-key");

                expect(mockDatabase.run).toHaveBeenCalledWith(
                    expect.stringContaining("DELETE"),
                    ["test-key"]
                );
            });
        });
        describe("deleteAllInternal", () => {
            it("should delete all settings", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: SettingsRepository", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Data Deletion", "type");

                repository.deleteAllInternal(mockDatabase);

                expect(mockDatabase.run).toHaveBeenCalledWith(
                    expect.stringContaining("DELETE")
                );
            });
        });
        describe("bulkInsertInternal", () => {
            it("should bulk insert multiple settings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: SettingsRepository", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const mockStatement = {
                    run: vi.fn(),
                    finalize: vi.fn(),
                };
                mockDatabase.prepare = vi.fn().mockReturnValue(mockStatement);

                repository.bulkInsertInternal(mockDatabase, {
                    setting1: "value1",
                    setting2: "value2",
                });
                expect(mockDatabase.prepare).toHaveBeenCalledWith(
                    expect.stringContaining("INSERT OR REPLACE")
                );
                expect(mockStatement.run).toHaveBeenCalledTimes(2);
                expect(mockStatement.run).toHaveBeenCalledWith([
                    "setting1",
                    "value1",
                ]);
                expect(mockStatement.run).toHaveBeenCalledWith([
                    "setting2",
                    "value2",
                ]);
                expect(mockStatement.finalize).toHaveBeenCalled();
            });
            it("should handle empty settings array", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: SettingsRepository", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const mockStatement = {
                    run: vi.fn(),
                    finalize: vi.fn(),
                };
                mockDatabase.prepare = vi.fn().mockReturnValue(mockStatement);

                repository.bulkInsertInternal(mockDatabase, {});

                expect(mockDatabase.prepare).not.toHaveBeenCalled();
                expect(mockStatement.run).not.toHaveBeenCalled();
                expect(mockStatement.finalize).not.toHaveBeenCalled();
            });
            it("should finalize statement even if error occurs", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: SettingsRepository", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const settings = { setting1: "value1" };
                const mockStatement = {
                    run: vi.fn().mockImplementation(() => {
                        throw new Error("Statement error");
                    }),
                    finalize: vi.fn(),
                };
                mockDatabase.prepare = vi.fn().mockReturnValue(mockStatement);

                expect(() =>
                    repository.bulkInsertInternal(mockDatabase, settings)
                ).toThrow("Statement error");
                expect(mockStatement.finalize).toHaveBeenCalled();
            });
        });
    });
    describe("edge cases and error handling", () => {
        it("should handle very long key names", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SettingsRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const longKey = "a".repeat(1000);
            (mockDatabase.get as any).mockReturnValueOnce(undefined); // No row found

            const result = await repository.get(longKey);

            expect(result).toBeUndefined();
            expect(mockDatabaseService.getDatabase).toHaveBeenCalled();
        });
        it("should handle very long values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SettingsRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const longValue = "x".repeat(10_000);
            mockDatabaseService.executeTransaction.mockResolvedValue(undefined);

            await repository.set("test-key", longValue);

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should handle unicode characters in keys and values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SettingsRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            mockDatabaseService.executeTransaction.mockResolvedValue(undefined);

            await repository.set("test-🔑", "value-🌟");

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should handle null key gracefully", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SettingsRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            (mockDatabase.get as any).mockReturnValueOnce(undefined); // No row found

            const result = await repository.get(null as any);

            expect(result).toBeUndefined();
            expect(mockDatabaseService.getDatabase).toHaveBeenCalled();
        });
    });
});
