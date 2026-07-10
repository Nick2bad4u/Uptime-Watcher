/**
 * Test suite for SettingsRepository
 *
 * @module SettingsRepository
 *
 * @file Tests for settings repository database behavior.
 *
 * @since 2025-08-11
 *
 * @category Database
 *
 * @tags ["database", "repository", "settings"]
 */

import type {
    Database,
    QueryResult,
    RunResult,
    Statement,
} from "node-sqlite3-wasm";

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    SettingsRepository,
    type SettingsRepositoryDependencies,
} from "../../../services/database/SettingsRepository";
// Import the actual module to spy on it
import * as operationalHooks from "../../../utils/operationalHooks";

const createRunResult = (): RunResult => ({
    changes: 0,
    lastInsertRowid: 0,
});

const createMockStatement = () => ({
    finalize: vi.fn<Statement["finalize"]>(),
    run: vi.fn<Statement["run"]>(createRunResult),
});

const createMockDatabase = () => ({
    all: vi.fn<Database["all"]>(() => []),
    get: vi.fn<Database["get"]>(() => null),
    prepare: vi.fn(() => createMockStatement()),
    run: vi.fn<Database["run"]>(createRunResult),
});

const createMockDatabaseService = (database: Database) => ({
    executeTransaction:
        vi.fn<
            (operation: (transaction: Database) => unknown) => Promise<unknown>
        >(),
    getDatabase: vi.fn(() => database),
});

const mockDatabase = createMockDatabase();
const database = mockDatabase as unknown as Database;
const mockDatabaseService = createMockDatabaseService(database);
const databaseService =
    mockDatabaseService as unknown as SettingsRepositoryDependencies["databaseService"];

describe(SettingsRepository, () => {
    let repository: SettingsRepository;

    beforeEach(() => {
        vi.clearAllMocks();

        // Spy on withDatabaseOperation and make it just call the operation directly
        vi.spyOn(operationalHooks, "withDatabaseOperation").mockImplementation(
            async (operation) => await operation()
        );

        // Reset database mock implementations
        mockDatabase.get.mockReturnValue(null);
        mockDatabase.all.mockReturnValue([]);
        mockDatabaseService.getDatabase.mockReturnValue(database);
        mockDatabaseService.executeTransaction.mockResolvedValue(undefined);

        repository = new SettingsRepository({
            databaseService,
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

            const mockSetting: QueryResult = { value: "test-value" };
            mockDatabase.get.mockReturnValue(mockSetting);

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

            mockDatabase.get.mockReturnValue(null);

            const result = await repository.get("nonexistent-key");

            expect(result).toBeUndefined();
        });
        it("should handle database errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SettingsRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Database error");
            mockDatabase.get.mockImplementation(() => {
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

            const mockSettings: QueryResult[] = [
                { key: "setting1", value: "value1" },
                { key: "setting2", value: "value2" },
            ];
            mockDatabase.all.mockReturnValue(mockSettings);

            const result = await repository.getAll();

            expect(result).toEqual({
                setting1: "value1",
                setting2: "value2",
            });
            expect(mockDatabase.all).toHaveBeenCalledWith(
                expect.stringContaining("SELECT * FROM settings"),
                undefined
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

            mockDatabase.all.mockReturnValue([]);

            const result = await repository.getAll();

            expect(result).toEqual({});
        });
        it("should handle database errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SettingsRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Database error");
            mockDatabase.all.mockImplementation(() => {
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

            const mockSettings: QueryResult[] = [
                { key: "setting1", value: "value1" },
                { key: "setting2", value: null },
            ];
            mockDatabase.all.mockReturnValue(mockSettings);

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

                repository.setInternal(database, "test-key", "test-value");

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

                repository.setInternal(database, "test-key", "");

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

                repository.deleteInternal(database, "test-key");

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

                repository.deleteAllInternal(database);

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

                const mockStatement = createMockStatement();
                mockDatabase.prepare.mockReturnValue(mockStatement);

                repository.bulkInsertInternal(database, {
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

                const mockStatement = createMockStatement();
                mockDatabase.prepare.mockReturnValue(mockStatement);

                repository.bulkInsertInternal(database, {});

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
                const mockStatement = createMockStatement();
                mockStatement.run.mockImplementation(() => {
                    throw new Error("Statement error");
                });
                mockDatabase.prepare.mockReturnValue(mockStatement);

                expect(() => {
                    repository.bulkInsertInternal(database, settings);
                }).toThrow("Statement error");
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
            mockDatabase.get.mockReturnValueOnce(null); // No row found

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

            mockDatabase.get.mockReturnValueOnce(null); // No row found

            const malformedKey: unknown = null;
            const result = await repository.get(
                malformedKey as Parameters<SettingsRepository["get"]>[0]
            );

            expect(result).toBeUndefined();
            expect(mockDatabaseService.getDatabase).toHaveBeenCalled();
        });
    });
});
