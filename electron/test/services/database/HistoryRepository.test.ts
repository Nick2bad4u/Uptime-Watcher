/**
 * Test suite for HistoryRepository
 * 
 * @fileoverview Comprehensive tests for unknown functionality
 * in the Uptime Watcher application.
 * 
 * @author GitHub Copilot
 * @since 2025-08-11
 * @category General
 * @module Unknown
 * @tags ["test"]
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Database } from "node-sqlite3-wasm";

import {
    HistoryRepository,
    type HistoryRepositoryDependencies,
} from "../../../services/database/HistoryRepository";
import type { DatabaseService } from "../../../services/database/DatabaseService";
import type { StatusHistory } from "../../../types";

// Import mocked modules
import * as historyManipulation from "../../../services/database/utils/historyManipulation";
import * as historyQuery from "../../../services/database/utils/historyQuery";
import * as operationalHooks from "../../../utils/operationalHooks";
import * as logger from "../../../utils/logger";
import * as electronUtils from "../../../electronUtils";

// Mock the modules
vi.mock("../../../services/database/utils/historyManipulation");
vi.mock("../../../services/database/utils/historyQuery");
vi.mock("../../../utils/operationalHooks");
vi.mock("../../../utils/logger");
vi.mock("../../../electronUtils");

describe("HistoryRepository", () => {
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
            executeTransaction: vi.fn((callback) => {
                return Promise.resolve(callback(mockDatabase));
            }),
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
        vi.clearAllMocks();        });
    describe("Constructor", () => {
        it("should create repository with dependencies", () => {
            expect(historyRepository).toBeInstanceOf(HistoryRepository);
            expect(historyRepository["databaseService"]).toBe(
                mockDatabaseService
            );        });        });
    describe("addEntry", () => {
        it("should add a history entry", async () => {
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
            );        });
        it("should add entry without details", async () => {
            const monitorId = "monitor-123";

            await historyRepository.addEntry(monitorId, mockStatusHistory);

            expect(historyManipulation.addHistoryEntry).toHaveBeenCalledWith(
                mockDatabase,
                monitorId,
                mockStatusHistory,
                undefined
            );        });        });
    describe("addEntryInternal", () => {
        it("should add entry internally", () => {
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
            );        });        });
    describe("bulkInsert", () => {
        it("should bulk insert history entries", async () => {
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
            );        });
        it("should handle empty array", async () => {
            const monitorId = "monitor-123";
            const historyEntries: any[] = [];

            await historyRepository.bulkInsert(monitorId, historyEntries);

            expect(
                mockDatabaseService.executeTransaction
            ).not.toHaveBeenCalled();        });
        it("should finalize statement even on error", async () => {
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
            ).rejects.toThrow("SQL error");

            expect(mockStatement.finalize).toHaveBeenCalledTimes(1);        });        });
    describe("deleteAll", () => {
        it("should delete all history", async () => {
            await historyRepository.deleteAll();

            expect(
                mockDatabaseService.executeTransaction
            ).toHaveBeenCalledTimes(1);
            expect(historyManipulation.deleteAllHistory).toHaveBeenCalledWith(
                mockDatabase
            );        });        });
    describe("deleteAllInternal", () => {
        it("should delete all history internally", () => {
            historyRepository.deleteAllInternal(mockDatabase);

            expect(historyManipulation.deleteAllHistory).toHaveBeenCalledWith(
                mockDatabase
            );        });        });
    describe("deleteByMonitorId", () => {
        it("should delete history by monitor ID", async () => {
            const monitorId = "monitor-123";

            await historyRepository.deleteByMonitorId(monitorId);

            expect(
                mockDatabaseService.executeTransaction
            ).toHaveBeenCalledTimes(1);
            expect(
                historyManipulation.deleteHistoryByMonitorId
            ).toHaveBeenCalledWith(mockDatabase, monitorId);        });        });
    describe("deleteByMonitorIdInternal", () => {
        it("should delete history by monitor ID internally", () => {
            const monitorId = "monitor-123";

            historyRepository.deleteByMonitorIdInternal(
                mockDatabase,
                monitorId
            );

            expect(
                historyManipulation.deleteHistoryByMonitorId
            ).toHaveBeenCalledWith(mockDatabase, monitorId);        });        });
    describe("findByMonitorId", () => {
        it("should find history by monitor ID", async () => {
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
            expect(result).toEqual(expectedHistory);        });        });
    describe("getHistoryCount", () => {
        it("should get history count", async () => {
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
            expect(result).toBe(expectedCount);        });        });
    describe("getHistoryCountInternal", () => {
        it("should get history count internally", () => {
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
            expect(result).toBe(expectedCount);        });        });
    describe("getLatestEntry", () => {
        it("should get latest entry", async () => {
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
            expect(result).toEqual(mockStatusHistory);        });
        it("should return undefined when no entry exists", async () => {
            const monitorId = "monitor-123";

            vi.mocked(historyQuery.getLatestHistoryEntry).mockReturnValue(
                undefined
            );

            const result = await historyRepository.getLatestEntry(monitorId);

            expect(result).toBeUndefined();        });        });
    describe("pruneAllHistory", () => {
        it("should prune all history with valid limit", async () => {
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
                "SELECT id FROM monitors"
            );
            expect(mockDatabase.run).toHaveBeenCalledWith(
                "DELETE FROM history WHERE id IN (?,?)",
                [10, 11]
            );        });
        it("should not prune with zero limit", async () => {
            await historyRepository.pruneAllHistory(0);

            expect(
                mockDatabaseService.executeTransaction
            ).not.toHaveBeenCalled();        });
        it("should not prune with negative limit", async () => {
            await historyRepository.pruneAllHistory(-1);

            expect(
                mockDatabaseService.executeTransaction
            ).not.toHaveBeenCalled();        });
        it("should handle no excess entries", async () => {
            const limit = 100;
            const mockMonitors = [{ id: 1 }];

            vi.mocked(mockDatabase.all)
                .mockReturnValueOnce(mockMonitors)
                .mockReturnValue([]);

            await historyRepository.pruneAllHistory(limit);

            expect(mockDatabase.run).not.toHaveBeenCalled();        });
        it("should filter invalid IDs", async () => {
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
            );        });        });
    describe("pruneAllHistoryInternal", () => {
        it("should prune all history internally", () => {
            const limit = 100;
            const mockMonitors = [{ id: 1 }, { id: 2 }];

            vi.mocked(mockDatabase.all).mockReturnValue(mockMonitors);

            historyRepository.pruneAllHistoryInternal(mockDatabase, limit);

            expect(mockDatabase.all).toHaveBeenCalledWith(
                "SELECT id FROM monitors"
            );
            expect(
                historyManipulation.pruneHistoryForMonitor
            ).toHaveBeenCalledWith(mockDatabase, "1", limit);
            expect(
                historyManipulation.pruneHistoryForMonitor
            ).toHaveBeenCalledWith(mockDatabase, "2", limit);
            expect(logger.logger.debug).toHaveBeenCalledWith(
                "[HistoryRepository] Pruned history for all monitors (limit: 100) (internal)"
            );        });
        it("should not prune with zero limit", () => {
            historyRepository.pruneAllHistoryInternal(mockDatabase, 0);

            expect(mockDatabase.all).not.toHaveBeenCalled();        });
        it("should filter invalid monitor IDs", () => {
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
            ).toHaveBeenCalledTimes(2);        });        });
    describe("pruneHistory", () => {
        it("should prune history for specific monitor", async () => {
            const monitorId = "monitor-123";
            const limit = 100;

            await historyRepository.pruneHistory(monitorId, limit);

            expect(mockDatabaseService.getDatabase).toHaveBeenCalledTimes(1);
            expect(
                historyManipulation.pruneHistoryForMonitor
            ).toHaveBeenCalledWith(mockDatabase, monitorId, limit);        });        });
    describe("pruneHistoryInternal", () => {
        it("should prune history internally", () => {
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
            );        });
        it("should not prune with zero limit", () => {
            const monitorId = "monitor-123";

            historyRepository.pruneHistoryInternal(mockDatabase, monitorId, 0);

            expect(
                historyManipulation.pruneHistoryForMonitor
            ).not.toHaveBeenCalled();        });
        it("should not prune with negative limit", () => {
            const monitorId = "monitor-123";

            historyRepository.pruneHistoryInternal(mockDatabase, monitorId, -5);

            expect(
                historyManipulation.pruneHistoryForMonitor
            ).not.toHaveBeenCalled();        });        });
    describe("getDb", () => {
        it("should return database from service", () => {
            const db = historyRepository["getDb"]();

            expect(mockDatabaseService.getDatabase).toHaveBeenCalledTimes(1);
            expect(db).toBe(mockDatabase);        });        });        });