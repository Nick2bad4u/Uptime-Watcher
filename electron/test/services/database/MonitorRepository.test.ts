/**
 * Test suite for MonitorRepository
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

import { describe, it, expect, beforeEach, vi } from "vitest";
import { MonitorRepository } from "../../../services/database/MonitorRepository";

describe(MonitorRepository, () => {
    let repository: MonitorRepository;
    let mockDatabaseService: any;

    beforeEach(() => {
        // Mock the database object that will be returned by getDatabase()
        const mockDatabase = {
            all: vi.fn(),
            get: vi.fn(),
            run: vi.fn().mockReturnValue({ changes: 1, lastInsertRowid: 1 }),
            prepare: vi.fn().mockReturnValue({
                all: vi.fn(),
                get: vi.fn(),
                run: vi.fn(),
                finalize: vi.fn(),
            }),
        };

        // Mock the DatabaseService
        mockDatabaseService = {
            getDatabase: vi.fn().mockReturnValue(mockDatabase),
            executeTransaction: vi
                .fn()
                .mockImplementation(async (callback) => callback(mockDatabase)),
        };

        repository = new MonitorRepository({
            databaseService: mockDatabaseService,
        });
    });
    describe("findBySiteIdentifier", () => {
        it("should find all monitors for a site", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const mockMonitors = [
                {
                    monitor_id: "mon1",
                    site_identifier: "site1",
                    monitor_type: "http",
                    url: "https://example.com",
                    interval_ms: 60_000,
                    timeout_ms: 5000,
                    enabled: 1,
                },
            ];

            const mockDb = mockDatabaseService.getDatabase();
            mockDb.all.mockReturnValue(mockMonitors);

            const result = await repository.findBySiteIdentifier("site1");

            expect(mockDatabaseService.getDatabase).toHaveBeenCalled();
            expect(mockDb.all).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
        it("should handle errors when finding monitors by site", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const mockDb = mockDatabaseService.getDatabase();
            mockDb.all.mockImplementation(() => {
                throw new Error("Database error");
            });
            await expect(
                repository.findBySiteIdentifier("site1")
            ).rejects.toThrowError("Database error");
        });
    });
    describe("findByIdentifier", () => {
        it("should find a monitor by id", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const mockMonitor = {
                monitor_id: "mon1",
                monitor_type: "http",
                site_identifier: "site-01",
                url: "https://example.com",
            };

            const mockDb = mockDatabaseService.getDatabase();
            mockDb.get.mockReturnValue(mockMonitor);

            const result = await repository.findByIdentifier("mon1");

            expect(mockDatabaseService.getDatabase).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
        it("should return undefined when monitor not found", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const mockDb = mockDatabaseService.getDatabase();
            mockDb.get.mockReturnValue(undefined);

            const result = await repository.findByIdentifier("nonexistent");

            expect(result).toBeUndefined();
        });
    });
    describe("getAllMonitorIds", () => {
        it("should return all monitor ids", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const mockIds = [{ monitor_id: "mon1" }, { monitor_id: "mon2" }];
            const mockDb = mockDatabaseService.getDatabase();
            mockDb.all.mockReturnValue(mockIds);

            const result = await repository.getAllMonitorIds();

            expect(mockDatabaseService.getDatabase).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });
});
