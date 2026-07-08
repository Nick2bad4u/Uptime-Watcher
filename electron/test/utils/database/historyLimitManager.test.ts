/**
 * Tests for history it("should set limit to 0 for negative values without
 * pruning", async ({ task, annotate, }) => { await annotate(`Testing:
 * ${task.name}`, "functional"); await annotate("Component:
 * historyLimitManager", "component"); await annotate("Category: Utility",
 * "category"); await annotate("Type: Configuration", "type"); const
 * setHistoryLimitCallback = vi.fn(); const limit = -10; const expectedLimit =
 * 0;
 *
 * ```
 *         await setHistoryLimit({
 *             limit,
 *             databaseService: mockDatabaseService,
 *             repositories: {
 *                 history: mockHistoryRepository,
 *                 settings: mockSettingsRepository,
 *             },
 *             setHistoryLimit: setHistoryLimitCallback,
 *             logger: mockLogger,
 *         });nt utilities
 * ```
 *
 * @file Test suite for historyLimitManager.ts
 */

import type { Database } from "node-sqlite3-wasm";

import { DEFAULT_HISTORY_LIMIT_RULES } from "@shared/constants/history";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DatabaseService } from "../../../services/database/DatabaseService";
import type { HistoryRepository } from "../../../services/database/HistoryRepository";
import type { SettingsRepository } from "../../../services/database/SettingsRepository";

import { setHistoryLimit } from "../../../services/database/historyLimitManager";

// Mock repositories
// Mock database
const mockDatabase = {} as Database;

const mockHistoryRepositoryBase = {
    pruneAllHistory: vi.fn(),
    pruneAllHistoryInternal: vi.fn(),
    createTransactionAdapter: vi.fn(),
};

mockHistoryRepositoryBase.createTransactionAdapter.mockImplementation(
    (db: Database) => ({
        pruneAllHistory: vi.fn((limit: number) =>
            mockHistoryRepositoryBase.pruneAllHistoryInternal(db, limit)
        ),
    })
);

const mockHistoryRepository =
    mockHistoryRepositoryBase as unknown as HistoryRepository;

const mockSettingsRepositoryBase = {
    set: vi.fn(),
    setInternal: vi.fn(),
    createTransactionAdapter: vi.fn(),
};

mockSettingsRepositoryBase.createTransactionAdapter.mockImplementation(
    (db: Database) => ({
        set: vi.fn((key: string, value: string) =>
            mockSettingsRepositoryBase.setInternal(db, key, value)
        ),
    })
);

const mockSettingsRepository =
    mockSettingsRepositoryBase as unknown as SettingsRepository;

// Mock database service
const mockDatabaseService = {
    executeTransaction: vi.fn(async (callback) => await callback(mockDatabase)),
    getDatabase: vi.fn(() => mockDatabase),
} as unknown as DatabaseService;

// Mock logger
const mockLogger = {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
};

describe("historyLimitManager", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockHistoryRepositoryBase.createTransactionAdapter.mockImplementation(
            (db: Database) => ({
                pruneAllHistory: vi.fn((limit: number) =>
                    mockHistoryRepositoryBase.pruneAllHistoryInternal(db, limit)
                ),
            })
        );

        mockSettingsRepositoryBase.createTransactionAdapter.mockImplementation(
            (db: Database) => ({
                set: vi.fn((key: string, value: string) =>
                    mockSettingsRepositoryBase.setInternal(db, key, value)
                ),
            })
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe(setHistoryLimit, () => {
        it("should set history limit with valid positive value", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyLimitManager", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Configuration", "type");

            const setHistoryLimitCallback = vi.fn();
            const limit = 100;

            await setHistoryLimit({
                databaseService: mockDatabaseService,
                limit,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                rules: DEFAULT_HISTORY_LIMIT_RULES,
                setHistoryLimit: setHistoryLimitCallback,
                logger: mockLogger,
            });

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(limit);
            expect(mockSettingsRepository.setInternal).toHaveBeenCalledWith(
                mockDatabase,
                "historyLimit",
                limit.toString()
            );
            expect(
                mockHistoryRepository.pruneAllHistoryInternal
            ).toHaveBeenCalledWith(mockDatabase, limit);
            expect(mockLogger.debug).toHaveBeenCalledWith("History limit set", {
                limit,
            });
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "History pruned to limit",
                { limit }
            );
        });

        it("should persist history limit without invoking Number prototype string conversion", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyLimitManager", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Configuration", "type");

            const toString = vi.spyOn(Number.prototype, "toString");
            toString.mockImplementation(() => {
                throw new Error("Number prototype toString should not run");
            });

            try {
                await setHistoryLimit({
                    databaseService: mockDatabaseService,
                    limit: 100,
                    repositories: {
                        history: mockHistoryRepository,
                        settings: mockSettingsRepository,
                    },
                    rules: DEFAULT_HISTORY_LIMIT_RULES,
                    setHistoryLimit: vi.fn(),
                    logger: mockLogger,
                });

                expect(mockSettingsRepository.setInternal).toHaveBeenCalledWith(
                    mockDatabase,
                    "historyLimit",
                    "100"
                );
                expect(toString).not.toHaveBeenCalled();
            } finally {
                toString.mockRestore();
            }
        });

        it("should not update in-memory state when persistence fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyLimitManager", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const setHistoryLimitCallback = vi.fn();
            const writeError = new Error("settings write failed");

            mockSettingsRepositoryBase.createTransactionAdapter.mockReturnValue(
                {
                    set: vi.fn(() => {
                        throw writeError;
                    }),
                }
            );

            await expect(
                setHistoryLimit({
                    databaseService: mockDatabaseService,
                    limit: 100,
                    repositories: {
                        history: mockHistoryRepository,
                        settings: mockSettingsRepository,
                    },
                    rules: DEFAULT_HISTORY_LIMIT_RULES,
                    setHistoryLimit: setHistoryLimitCallback,
                    logger: mockLogger,
                })
            ).rejects.toThrow(writeError);

            expect(setHistoryLimitCallback).not.toHaveBeenCalled();
            expect(
                mockHistoryRepository.pruneAllHistoryInternal
            ).not.toHaveBeenCalled();
        });

        it("should apply configured minimum for small positive values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyLimitManager", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Configuration", "type");

            const setHistoryLimitCallback = vi.fn();
            const limit = 5;
            const expectedLimit = DEFAULT_HISTORY_LIMIT_RULES.minLimit;

            await setHistoryLimit({
                limit,
                databaseService: mockDatabaseService,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                rules: DEFAULT_HISTORY_LIMIT_RULES,
                setHistoryLimit: setHistoryLimitCallback,
                logger: mockLogger,
            });

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(expectedLimit);
            expect(mockSettingsRepository.setInternal).toHaveBeenCalledWith(
                mockDatabase,
                "historyLimit",
                expectedLimit.toString()
            );
            expect(
                mockHistoryRepository.pruneAllHistoryInternal
            ).toHaveBeenCalledWith(mockDatabase, expectedLimit);
            expect(mockLogger.debug).toHaveBeenCalledWith("History limit set", {
                limit: expectedLimit,
            });
        });

        it("should set limit to 0 for negative values without pruning", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyLimitManager", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Configuration", "type");

            const setHistoryLimitCallback = vi.fn();
            const limit = -5;
            const expectedLimit = 0;

            await setHistoryLimit({
                limit,
                databaseService: mockDatabaseService,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                rules: DEFAULT_HISTORY_LIMIT_RULES,
                setHistoryLimit: setHistoryLimitCallback,
                logger: mockLogger,
            });

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(expectedLimit);
            expect(mockSettingsRepository.setInternal).toHaveBeenCalledWith(
                mockDatabase,
                "historyLimit",
                expectedLimit.toString()
            );
            expect(
                mockHistoryRepository.pruneAllHistoryInternal
            ).not.toHaveBeenCalled();
            expect(mockLogger.debug).toHaveBeenCalledWith("History limit set", {
                limit: expectedLimit,
            });
            expect(mockLogger.debug).not.toHaveBeenCalledWith(
                "History pruned to limit",
                expect.anything()
            );
        });

        it("should set limit to 0 for zero value without pruning", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyLimitManager", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Configuration", "type");

            const setHistoryLimitCallback = vi.fn();
            const limit = 0;
            const expectedLimit = 0;

            await setHistoryLimit({
                limit,
                databaseService: mockDatabaseService,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                rules: DEFAULT_HISTORY_LIMIT_RULES,
                setHistoryLimit: setHistoryLimitCallback,
                logger: mockLogger,
            });

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(expectedLimit);
            expect(mockSettingsRepository.setInternal).toHaveBeenCalledWith(
                mockDatabase,
                "historyLimit",
                expectedLimit.toString()
            );
            expect(
                mockHistoryRepository.pruneAllHistoryInternal
            ).not.toHaveBeenCalled();
            expect(mockLogger.debug).toHaveBeenCalledWith("History limit set", {
                limit: expectedLimit,
            });
            expect(mockLogger.debug).not.toHaveBeenCalledWith(
                "History pruned to limit",
                expect.anything()
            );
        });

        it("should work without logger", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyLimitManager", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const setHistoryLimitCallback = vi.fn();
            const limit = 50;

            await setHistoryLimit({
                limit,
                databaseService: mockDatabaseService,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                rules: DEFAULT_HISTORY_LIMIT_RULES,
                setHistoryLimit: setHistoryLimitCallback,
            });

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(limit);
            expect(mockSettingsRepository.setInternal).toHaveBeenCalledWith(
                mockDatabase,
                "historyLimit",
                limit.toString()
            );
            expect(
                mockHistoryRepository.pruneAllHistoryInternal
            ).toHaveBeenCalledWith(mockDatabase, limit);
            expect(mockLogger.debug).not.toHaveBeenCalled();
        });

        it("should handle large limit values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyLimitManager", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Configuration", "type");

            const setHistoryLimitCallback = vi.fn();
            const limit = 999_999;

            await setHistoryLimit({
                limit,
                databaseService: mockDatabaseService,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                rules: DEFAULT_HISTORY_LIMIT_RULES,
                setHistoryLimit: setHistoryLimitCallback,
                logger: mockLogger,
            });

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(limit);
            expect(mockSettingsRepository.setInternal).toHaveBeenCalledWith(
                mockDatabase,
                "historyLimit",
                limit.toString()
            );
            expect(
                mockHistoryRepository.pruneAllHistoryInternal
            ).toHaveBeenCalledWith(mockDatabase, limit);
        });

        it("should normalize float values to integers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyLimitManager", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const setHistoryLimitCallback = vi.fn();
            const limit = 50.7;
            const expectedLimit = Math.floor(limit);

            await setHistoryLimit({
                limit,
                databaseService: mockDatabaseService,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                rules: DEFAULT_HISTORY_LIMIT_RULES,
                setHistoryLimit: setHistoryLimitCallback,
                logger: mockLogger,
            });

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(expectedLimit);
            expect(mockSettingsRepository.setInternal).toHaveBeenCalledWith(
                mockDatabase,
                "historyLimit",
                expectedLimit.toString()
            );
            expect(
                mockHistoryRepository.pruneAllHistoryInternal
            ).toHaveBeenCalledWith(mockDatabase, expectedLimit);
        });
    });

    describe("integration scenarios", () => {
        it("should handle complete workflow with valid limit", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyLimitManager", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Configuration", "type");

            const setHistoryLimitCallback = vi.fn();
            const limit = 150;

            // Set the limit
            await setHistoryLimit({
                limit,
                databaseService: mockDatabaseService,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                rules: DEFAULT_HISTORY_LIMIT_RULES,
                setHistoryLimit: setHistoryLimitCallback,
                logger: mockLogger,
            });

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(limit);
            expect(mockSettingsRepository.setInternal).toHaveBeenCalledWith(
                mockDatabase,
                "historyLimit",
                limit.toString()
            );
            expect(
                mockHistoryRepository.pruneAllHistoryInternal
            ).toHaveBeenCalledWith(mockDatabase, limit);
        });

        it("should handle workflow with minimum limit enforcement", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: historyLimitManager", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Configuration", "type");

            const setHistoryLimitCallback = vi.fn();
            const limit = 3;
            const expectedLimit = DEFAULT_HISTORY_LIMIT_RULES.minLimit;

            // Set the limit
            await setHistoryLimit({
                limit,
                databaseService: mockDatabaseService,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                rules: DEFAULT_HISTORY_LIMIT_RULES,
                setHistoryLimit: setHistoryLimitCallback,
                logger: mockLogger,
            });

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(expectedLimit);
            expect(mockSettingsRepository.setInternal).toHaveBeenCalledWith(
                mockDatabase,
                "historyLimit",
                expectedLimit.toString()
            );
            expect(
                mockHistoryRepository.pruneAllHistoryInternal
            ).toHaveBeenCalledWith(mockDatabase, expectedLimit);
        });
    });
});
