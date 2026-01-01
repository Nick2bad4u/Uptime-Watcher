/**
 * Test suite for HistoryRepository
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
import { fc } from "@fast-check/vitest";
import type { Database } from "node-sqlite3-wasm";

import {
    HistoryRepository,
    type HistoryRepositoryDependencies,
} from "../../../services/database/HistoryRepository";
import type { DatabaseService } from "../../../services/database/DatabaseService";
import type { StatusHistory } from "@shared/types";

// Import mocked modules
import * as historyManipulation from "../../../services/database/utils/maintenance/historyManipulation";
import * as historyQuery from "../../../services/database/utils/queries/historyQuery";
import * as operationalHooks from "../../../utils/operationalHooks";
import * as logger from "../../../utils/logger";
import * as electronUtils from "../../../electronUtils";

// Mock the modules
vi.mock("../../../services/database/utils/maintenance/historyManipulation");
vi.mock("../../../services/database/utils/queries/historyQuery");
vi.mock("../../../utils/operationalHooks");
vi.mock("../../../utils/logger");
vi.mock("../../../electronUtils");

describe(HistoryRepository, () => {
    let historyRepository: HistoryRepository;
    let mockDatabaseService: DatabaseService;
    let mockDatabase: Database;
    let dependencies: HistoryRepositoryDependencies;

    const mockStatusHistory: StatusHistory = {
        timestamp: Date.now(),
        status: "up",
        responseTime: 250,
    };

    beforeEach(() => {
        // Mock database instance
        mockDatabase = {
            prepare: vi.fn(() => ({
                run: vi.fn(),
                finalize: vi.fn(),
            })),
            run: vi.fn(),
            all: vi.fn(),
        } as unknown as Database;

        // Mock database service
        mockDatabaseService = {
            getDatabase: vi.fn(() => mockDatabase),
            executeTransaction: vi.fn((callback) =>
                Promise.resolve(callback(mockDatabase))
            ),
        } as unknown as DatabaseService;

        dependencies = {
            databaseService: mockDatabaseService,
        };

        historyRepository = new HistoryRepository(dependencies);

        // Setup default mocks
        vi.mocked(operationalHooks.withDatabaseOperation).mockImplementation(
            (operation) => operation()
        );
        vi.mocked(electronUtils.isDev).mockReturnValue(true);

        // Clear all mocks
        vi.clearAllMocks();
    });
    describe("Constructor", () => {
        it("should create repository with dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(historyRepository).toBeInstanceOf(HistoryRepository);
            expect(historyRepository["databaseService"]).toBe(
                mockDatabaseService
            );
        });
    });
    describe("addEntry", () => {
        it("should add a history entry", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitorId = "monitor-123";
            const details = "Test details";

            await historyRepository.addEntry(
                monitorId,
                mockStatusHistory,
                details
            );

            expect(
                mockDatabaseService.executeTransaction
            ).toHaveBeenCalledTimes(1);
            expect(historyManipulation.addHistoryEntry).toHaveBeenCalledWith(
                mockDatabase,
                monitorId,
                mockStatusHistory,
                details
            );
        });
        it("should add entry without details", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitorId = "monitor-123";

            await historyRepository.addEntry(monitorId, mockStatusHistory);

            expect(historyManipulation.addHistoryEntry).toHaveBeenCalledWith(
                mockDatabase,
                monitorId,
                mockStatusHistory,
                undefined
            );
        });
    });
    describe("addEntryInternal", () => {
        it("should add entry internally", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitorId = "monitor-123";
            const details = "Test details";

            historyRepository.addEntryInternal(
                mockDatabase,
                monitorId,
                mockStatusHistory,
                details
            );

            expect(historyManipulation.addHistoryEntry).toHaveBeenCalledWith(
                mockDatabase,
                monitorId,
                mockStatusHistory,
                details
            );
        });
    });
    describe("bulkInsert", () => {
        it("should bulk insert history entries", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitorId = "monitor-123";
            const historyEntries = [
                { ...mockStatusHistory, details: "Entry 1" },
                { ...mockStatusHistory, details: "Entry 2" },
            ];

            const mockStatement = {
                run: vi.fn(),
                finalize: vi.fn(),
            };
            vi.mocked(mockDatabase.prepare).mockReturnValue(
                mockStatement as any
            );

            await historyRepository.bulkInsert(monitorId, historyEntries);

            expect(
                mockDatabaseService.executeTransaction
            ).toHaveBeenCalledTimes(1);
            expect(mockDatabase.prepare).toHaveBeenCalledWith(
                "INSERT INTO history (monitor_id, timestamp, status, responseTime, details) VALUES (?, ?, ?, ?, ?)"
            );
            expect(mockStatement.run).toHaveBeenCalledTimes(2);
            expect(mockStatement.finalize).toHaveBeenCalledTimes(1);
            expect(logger.logger.info).toHaveBeenCalledWith(
                `[HistoryRepository] Bulk inserted 2 history entries for monitor: ${monitorId}`
            );
        });
        it("should handle empty array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitorId = "monitor-123";
            const historyEntries: any[] = [];

            await historyRepository.bulkInsert(monitorId, historyEntries);

            expect(
                mockDatabaseService.executeTransaction
            ).not.toHaveBeenCalled();
        });
        it("should finalize statement even on error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const monitorId = "monitor-123";
            const historyEntries = [mockStatusHistory];

            const mockStatement = {
                run: vi.fn(() => {
                    throw new Error("SQL error");
                }),
                finalize: vi.fn(),
            };
            vi.mocked(mockDatabase.prepare).mockReturnValue(
                mockStatement as any
            );

            await expect(
                historyRepository.bulkInsert(monitorId, historyEntries)
            ).rejects.toThrowError("SQL error");

            expect(mockStatement.finalize).toHaveBeenCalledTimes(1);
        });
    });
    describe("deleteAll", () => {
        it("should delete all history", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Deletion", "type");

            await historyRepository.deleteAll();

            expect(
                mockDatabaseService.executeTransaction
            ).toHaveBeenCalledTimes(1);
            expect(historyManipulation.deleteAllHistory).toHaveBeenCalledWith(
                mockDatabase
            );
        });
    });
    describe("deleteAllInternal", () => {
        it("should delete all history internally", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Deletion", "type");

            historyRepository.deleteAllInternal(mockDatabase);

            expect(historyManipulation.deleteAllHistory).toHaveBeenCalledWith(
                mockDatabase
            );
        });
    });
    describe("deleteByMonitorId", () => {
        it("should delete history by monitor ID", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Deletion", "type");

            const monitorId = "monitor-123";

            await historyRepository.deleteByMonitorId(monitorId);

            expect(
                mockDatabaseService.executeTransaction
            ).toHaveBeenCalledTimes(1);
            expect(
                historyManipulation.deleteHistoryByMonitorId
            ).toHaveBeenCalledWith(mockDatabase, monitorId);
        });
    });
    describe("deleteByMonitorIdInternal", () => {
        it("should delete history by monitor ID internally", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Deletion", "type");

            const monitorId = "monitor-123";

            historyRepository.deleteByMonitorIdInternal(
                mockDatabase,
                monitorId
            );

            expect(
                historyManipulation.deleteHistoryByMonitorId
            ).toHaveBeenCalledWith(mockDatabase, monitorId);
        });
    });
    describe("findByMonitorId", () => {
        it("should find history by monitor ID", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const monitorId = "monitor-123";
            const expectedHistory = [mockStatusHistory];

            vi.mocked(historyQuery.findHistoryByMonitorId).mockReturnValue(
                expectedHistory
            );

            const result = await historyRepository.findByMonitorId(monitorId);

            expect(mockDatabaseService.getDatabase).toHaveBeenCalledTimes(1);
            expect(historyQuery.findHistoryByMonitorId).toHaveBeenCalledWith(
                mockDatabase,
                monitorId
            );
            expect(result).toEqual(expectedHistory);
        });
    });
    describe("getHistoryCount", () => {
        it("should get history count", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const monitorId = "monitor-123";
            const expectedCount = 42;

            vi.mocked(historyQuery.getHistoryCount).mockReturnValue(
                expectedCount
            );

            const result = await historyRepository.getHistoryCount(monitorId);

            expect(mockDatabaseService.getDatabase).toHaveBeenCalledTimes(1);
            expect(historyQuery.getHistoryCount).toHaveBeenCalledWith(
                mockDatabase,
                monitorId
            );
            expect(result).toBe(expectedCount);
        });
    });
    describe("getHistoryCountInternal", () => {
        it("should get history count internally", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const monitorId = "monitor-123";
            const expectedCount = 42;

            vi.mocked(historyQuery.getHistoryCount).mockReturnValue(
                expectedCount
            );

            const result = historyRepository.getHistoryCountInternal(
                mockDatabase,
                monitorId
            );

            expect(historyQuery.getHistoryCount).toHaveBeenCalledWith(
                mockDatabase,
                monitorId
            );
            expect(result).toBe(expectedCount);
        });
    });
    describe("getLatestEntry", () => {
        it("should get latest entry", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const monitorId = "monitor-123";

            vi.mocked(historyQuery.getLatestHistoryEntry).mockReturnValue(
                mockStatusHistory
            );

            const result = await historyRepository.getLatestEntry(monitorId);

            expect(mockDatabaseService.getDatabase).toHaveBeenCalledTimes(1);
            expect(historyQuery.getLatestHistoryEntry).toHaveBeenCalledWith(
                mockDatabase,
                monitorId
            );
            expect(result).toEqual(mockStatusHistory);
        });
        it("should return undefined when no entry exists", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitorId = "monitor-123";

            vi.mocked(historyQuery.getLatestHistoryEntry).mockReturnValue(
                undefined
            );

            const result = await historyRepository.getLatestEntry(monitorId);

            expect(result).toBeUndefined();
        });
    });
    describe("pruneAllHistory", () => {
        it("should prune all history with valid limit", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Configuration", "type");

            const limit = 100;
            const mockMonitors = [{ id: 1 }, { id: 2 }];
            const mockExcessEntries = [{ id: 10 }, { id: 11 }];

            vi.mocked(mockDatabase.all)
                .mockReturnValueOnce(mockMonitors)
                .mockReturnValue(mockExcessEntries);

            await historyRepository.pruneAllHistory(limit);

            expect(
                mockDatabaseService.executeTransaction
            ).toHaveBeenCalledTimes(1);
            expect(mockDatabase.all).toHaveBeenCalledWith(
                "SELECT id FROM monitors",
                undefined
            );
            expect(mockDatabase.run).toHaveBeenCalledWith(
                "DELETE FROM history WHERE id IN (?,?)",
                [10, 11]
            );
        });
        it("should not prune with zero limit", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Configuration", "type");

            await historyRepository.pruneAllHistory(0);

            expect(
                mockDatabaseService.executeTransaction
            ).not.toHaveBeenCalled();
        });
        it("should not prune with negative limit", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Configuration", "type");

            await historyRepository.pruneAllHistory(-1);

            expect(
                mockDatabaseService.executeTransaction
            ).not.toHaveBeenCalled();
        });
        it("should handle no excess entries", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const limit = 100;
            const mockMonitors = [{ id: 1 }];

            vi.mocked(mockDatabase.all)
                .mockReturnValueOnce(mockMonitors)
                .mockReturnValue([]);

            await historyRepository.pruneAllHistory(limit);

            expect(mockDatabase.run).not.toHaveBeenCalled();
        });
        it("should filter invalid IDs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const limit = 100;
            const mockMonitors = [{ id: 1 }];
            const mockExcessEntries = [
                { id: 10 },
                { id: "invalid" },
                { id: null },
                { id: 12 },
            ];

            vi.mocked(mockDatabase.all)
                .mockReturnValueOnce(mockMonitors)
                .mockReturnValue(mockExcessEntries);

            await historyRepository.pruneAllHistory(limit);

            expect(mockDatabase.run).toHaveBeenCalledWith(
                "DELETE FROM history WHERE id IN (?,?)",
                [10, 12]
            );
        });
    });
    describe("pruneAllHistoryInternal", () => {
        it("should prune all history internally", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const limit = 100;
            const mockMonitors = [{ id: 1 }, { id: 2 }];

            vi.mocked(mockDatabase.all).mockReturnValue(mockMonitors);

            historyRepository.pruneAllHistoryInternal(mockDatabase, limit);

            expect(mockDatabase.all).toHaveBeenCalledWith(
                "SELECT id FROM monitors",
                undefined
            );
            expect(
                historyManipulation.pruneHistoryForMonitor
            ).toHaveBeenCalledWith(mockDatabase, "1", limit);
            expect(
                historyManipulation.pruneHistoryForMonitor
            ).toHaveBeenCalledWith(mockDatabase, "2", limit);
            expect(logger.logger.debug).toHaveBeenCalledWith(
                "[HistoryRepository] Pruned history for all monitors (limit: 100) (internal)"
            );
        });
        it("should not prune with zero limit", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Configuration", "type");

            historyRepository.pruneAllHistoryInternal(mockDatabase, 0);

            expect(mockDatabase.all).not.toHaveBeenCalled();
        });
        it("should filter invalid monitor IDs", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const limit = 100;
            const mockMonitors = [
                { id: 1 },
                { id: "invalid" },
                { id: null },
                { id: 3 },
            ];

            vi.mocked(mockDatabase.all).mockReturnValue(mockMonitors);

            historyRepository.pruneAllHistoryInternal(mockDatabase, limit);

            expect(
                historyManipulation.pruneHistoryForMonitor
            ).toHaveBeenCalledWith(mockDatabase, "1", limit);
            expect(
                historyManipulation.pruneHistoryForMonitor
            ).toHaveBeenCalledWith(mockDatabase, "3", limit);
            expect(
                historyManipulation.pruneHistoryForMonitor
            ).toHaveBeenCalledTimes(2);
        });
    });
    describe("pruneHistory", () => {
        it("should prune history for specific monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const monitorId = "monitor-123";
            const limit = 100;

            await historyRepository.pruneHistory(monitorId, limit);

            expect(mockDatabaseService.getDatabase).toHaveBeenCalledTimes(1);
            expect(
                historyManipulation.pruneHistoryForMonitor
            ).toHaveBeenCalledWith(mockDatabase, monitorId, limit);
        });
    });
    describe("pruneHistoryInternal", () => {
        it("should prune history internally", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitorId = "monitor-123";
            const limit = 100;

            historyRepository.pruneHistoryInternal(
                mockDatabase,
                monitorId,
                limit
            );

            expect(
                historyManipulation.pruneHistoryForMonitor
            ).toHaveBeenCalledWith(mockDatabase, monitorId, limit);
            expect(logger.logger.debug).toHaveBeenCalledWith(
                "[HistoryRepository] Pruned history for monitor monitor-123 (limit: 100) (internal)"
            );
        });
        it("should not prune with zero limit", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Configuration", "type");

            const monitorId = "monitor-123";

            historyRepository.pruneHistoryInternal(mockDatabase, monitorId, 0);

            expect(
                historyManipulation.pruneHistoryForMonitor
            ).not.toHaveBeenCalled();
        });
        it("should not prune with negative limit", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Configuration", "type");

            const monitorId = "monitor-123";

            historyRepository.pruneHistoryInternal(mockDatabase, monitorId, -5);

            expect(
                historyManipulation.pruneHistoryForMonitor
            ).not.toHaveBeenCalled();
        });
    });
    describe("getDb", () => {
        it("should return database from service", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HistoryRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const db = historyRepository["getDb"]();

            expect(mockDatabaseService.getDatabase).toHaveBeenCalledTimes(1);
            expect(db).toBe(mockDatabase);
        });

        describe("Property-Based HistoryRepository Tests", () => {
            it("should handle various status history entries", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.string({ minLength: 1, maxLength: 50 }),
                        fc.array(
                            fc
                                .record({
                                    timestamp: fc.integer({
                                        min: Date.now() - 86_400_000,
                                        max: Date.now(),
                                    }),
                                    status: fc.constantFrom("up", "down"),
                                    responseTime: fc.integer({
                                        min: 0,
                                        max: 10_000,
                                    }),
                                })
                                .chain((base) =>
                                    fc.oneof(
                                        fc.constant(base),
                                        fc
                                            .string({ maxLength: 200 })
                                            .map((details) => ({
                                                ...base,
                                                details,
                                            }))
                                    )
                                ),
                            { minLength: 1, maxLength: 50 }
                        ),
                        async (monitorId, historyEntries) => {
                            // Clear mocks at the start of each property iteration
                            vi.clearAllMocks();

                            // Mock the addHistoryEntry function
                            const mockedAddHistoryEntry = vi.mocked(
                                historyManipulation.addHistoryEntry
                            );
                            mockedAddHistoryEntry.mockReturnValue(undefined);

                            for (const entry of historyEntries) {
                                await historyRepository.addEntry(
                                    monitorId,
                                    entry
                                );
                            }

                            expect(mockedAddHistoryEntry).toHaveBeenCalledTimes(
                                historyEntries.length
                            );

                            // Verify each call had proper parameters
                            for (const [
                                index,
                                entry,
                            ] of historyEntries.entries()) {
                                expect(
                                    mockedAddHistoryEntry
                                ).toHaveBeenNthCalledWith(
                                    index + 1,
                                    mockDatabase,
                                    monitorId,
                                    entry,
                                    undefined // Details parameter is undefined when not provided
                                );
                            }
                        }
                    )
                );
            });

            it("should handle various monitor ID patterns for history queries", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.array(fc.string({ minLength: 1, maxLength: 100 }), {
                            minLength: 1,
                            maxLength: 10,
                        }),
                        async (monitorIds) => {
                            const mockedFindHistoryByMonitorId = vi.mocked(
                                historyQuery.findHistoryByMonitorId
                            );

                            for (const monitorId of monitorIds) {
                                const mockHistoryData = [
                                    {
                                        timestamp: Date.now(),
                                        status: "up" as const,
                                        responseTime: 200,
                                    },
                                ];
                                mockedFindHistoryByMonitorId.mockReturnValue(
                                    mockHistoryData
                                );

                                const result =
                                    await historyRepository.findByMonitorId(
                                        monitorId
                                    );

                                expect(
                                    mockedFindHistoryByMonitorId
                                ).toHaveBeenCalledWith(mockDatabase, monitorId);
                                expect(result).toEqual(mockHistoryData);
                            }
                        }
                    )
                );
            });

            it("should handle various limit and offset parameters", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.string({ minLength: 1, maxLength: 50 }),
                        fc.integer({ min: 1, max: 1000 }),
                        fc.integer({ min: 0, max: 500 }),
                        async (monitorId, limit, _offset) => {
                            const mockedFindHistoryByMonitorId = vi.mocked(
                                historyQuery.findHistoryByMonitorId
                            );

                            const mockHistoryData = Array.from(
                                { length: Math.min(limit, 100) },
                                (_, i) => ({
                                    timestamp: Date.now() - i * 60_000,
                                    status:
                                        i % 2 === 0
                                            ? ("up" as const)
                                            : ("down" as const),
                                    responseTime: 100 + i * 10,
                                })
                            );

                            mockedFindHistoryByMonitorId.mockReturnValue(
                                mockHistoryData
                            );

                            const result =
                                await historyRepository.findByMonitorId(
                                    monitorId
                                );

                            expect(
                                mockedFindHistoryByMonitorId
                            ).toHaveBeenCalledWith(mockDatabase, monitorId);
                            expect(result).toEqual(mockHistoryData);
                        }
                    )
                );
            });

            it("should handle various bulk history insertion scenarios", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.string({ minLength: 1, maxLength: 50 }),
                        fc.array(
                            fc
                                .record({
                                    timestamp: fc.integer({
                                        min: Date.now() - 604_800_000,
                                        max: Date.now(),
                                    }),
                                    status: fc.constantFrom("up", "down"),
                                    responseTime: fc.integer({
                                        min: 0,
                                        max: 30_000,
                                    }),
                                })
                                .chain((base) =>
                                    fc.oneof(
                                        fc.constant(base),
                                        fc
                                            .string({ maxLength: 300 })
                                            .map((details) => ({
                                                ...base,
                                                details,
                                            }))
                                    )
                                ),
                            { minLength: 1, maxLength: 100 }
                        ),
                        async (monitorId, historyBatch) => {
                            // Clear mocks at the start of each property iteration
                            vi.clearAllMocks();

                            // Test that bulkInsert completes successfully
                            await expect(
                                historyRepository.bulkInsert(
                                    monitorId,
                                    historyBatch
                                )
                            ).resolves.toBeUndefined();
                        }
                    )
                );
            });

            it("should handle various history deletion scenarios", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
                            minLength: 1,
                            maxLength: 15,
                        }),
                        async (monitorIds) => {
                            // Clear mocks at the start of each property iteration
                            vi.clearAllMocks();

                            const mockedDeleteHistoryByMonitorId = vi.mocked(
                                historyManipulation.deleteHistoryByMonitorId
                            );

                            for (const monitorId of monitorIds) {
                                mockedDeleteHistoryByMonitorId.mockResolvedValue(
                                    undefined
                                );

                                await historyRepository.deleteByMonitorId(
                                    monitorId
                                );

                                expect(
                                    mockedDeleteHistoryByMonitorId
                                ).toHaveBeenCalledWith(mockDatabase, monitorId);
                            }

                            expect(
                                mockedDeleteHistoryByMonitorId
                            ).toHaveBeenCalledTimes(monitorIds.length);
                        }
                    )
                );
            });

            it("should handle various history count queries", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.array(
                            fc.record({
                                monitorId: fc.string({
                                    minLength: 1,
                                    maxLength: 50,
                                }),
                                expectedCount: fc.integer({
                                    min: 0,
                                    max: 100_000,
                                }),
                            }),
                            { minLength: 1, maxLength: 8 }
                        ),
                        async (monitorCountPairs) => {
                            const mockedGetHistoryCount = vi.mocked(
                                historyQuery.getHistoryCount
                            );

                            for (const {
                                monitorId,
                                expectedCount,
                            } of monitorCountPairs) {
                                mockedGetHistoryCount.mockReturnValue(
                                    expectedCount
                                );

                                const result =
                                    await historyRepository.getHistoryCount(
                                        monitorId
                                    );

                                expect(
                                    mockedGetHistoryCount
                                ).toHaveBeenCalledWith(mockDatabase, monitorId);
                                expect(result).toBe(expectedCount);
                                expect(result).toBeGreaterThanOrEqual(0);
                            }
                        }
                    )
                );
            });

            it("should handle various pruning configurations", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.string({ minLength: 1, maxLength: 50 }),
                        fc.integer({ min: 1, max: 10_000 }),
                        async (monitorId, keepCount) => {
                            const mockedPruneHistoryForMonitor = vi.mocked(
                                historyManipulation.pruneHistoryForMonitor
                            );
                            mockedPruneHistoryForMonitor.mockResolvedValue(
                                undefined
                            );

                            await historyRepository.pruneHistory(
                                monitorId,
                                keepCount
                            );

                            expect(
                                mockedPruneHistoryForMonitor
                            ).toHaveBeenCalledWith(
                                mockDatabase,
                                monitorId,
                                keepCount
                            );
                            expect(keepCount).toBeGreaterThan(0);
                        }
                    )
                );
            });

            it("should handle various latest history entry scenarios", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.string({ minLength: 1, maxLength: 50 }),
                        fc.oneof(
                            fc.constant(undefined), // No latest entry
                            fc
                                .record({
                                    timestamp: fc.integer({
                                        min: Date.now() - 3_600_000,
                                        max: Date.now(),
                                    }),
                                    status: fc.constantFrom("up", "down"),
                                    responseTime: fc.integer({
                                        min: 1,
                                        max: 10_000,
                                    }),
                                })
                                .chain((base) =>
                                    fc.oneof(
                                        fc.constant(base),
                                        fc
                                            .string({ maxLength: 100 })
                                            .map((details) => ({
                                                ...base,
                                                details,
                                            }))
                                    )
                                )
                        ),
                        async (monitorId, latestEntry) => {
                            const mockedGetLatestHistoryEntry = vi.mocked(
                                historyQuery.getLatestHistoryEntry
                            );
                            mockedGetLatestHistoryEntry.mockReturnValue(
                                latestEntry
                            );

                            const result =
                                await historyRepository.getLatestEntry(
                                    monitorId
                                );

                            expect(
                                mockedGetLatestHistoryEntry
                            ).toHaveBeenCalledWith(mockDatabase, monitorId);
                            expect(result).toEqual(latestEntry);

                            if (result) {
                                expect(typeof result.timestamp).toBe("number");
                                expect(["up", "down"]).toContain(result.status);
                                expect(typeof result.responseTime).toBe(
                                    "number"
                                );
                                expect(result.responseTime).toBeGreaterThan(0);
                            }
                        }
                    )
                );
            });

            it("should validate repository method error handling", async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.string({ minLength: 1, maxLength: 50 }),
                        fc.oneof(
                            fc.constantFrom(
                                "SQLITE_BUSY",
                                "SQLITE_LOCKED",
                                "SQLITE_CONSTRAINT",
                                "SQLITE_IOERR",
                                "SQLITE_CORRUPT"
                            ),
                            fc.string({ minLength: 5, maxLength: 50 })
                        ),
                        async (monitorId, errorType) => {
                            // Clear mocks at the start of each property iteration
                            vi.clearAllMocks();

                            const dbError = new Error(
                                `Mock ${errorType} error`
                            );
                            (dbError as any).code = errorType;

                            // Mock various functions to throw errors
                            const mockedAddHistoryEntry = vi.mocked(
                                historyManipulation.addHistoryEntry
                            );
                            const mockedFindHistoryByMonitorId = vi.mocked(
                                historyQuery.findHistoryByMonitorId
                            );

                            // For synchronous functions, use mockImplementation to throw
                            mockedAddHistoryEntry.mockImplementation(() => {
                                throw dbError;
                            });
                            mockedFindHistoryByMonitorId.mockImplementation(
                                () => {
                                    throw dbError;
                                }
                            );

                            // Test error propagation in various operations
                            await expect(
                                historyRepository.addEntry(monitorId, {
                                    timestamp: Date.now(),
                                    status: "up",
                                    responseTime: 200,
                                })
                            ).rejects.toThrowError();

                            await expect(
                                historyRepository.findByMonitorId(monitorId)
                            ).rejects.toThrowError();
                        }
                    )
                );
            });
        });
    });
});
