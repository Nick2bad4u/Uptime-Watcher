/**
 * Test suite for MonitorRepository
 *
 * @module MonitorRepository
 *
 * @file Tests for monitor repository database behavior.
 *
 * @since 2025-08-11
 *
 * @category Database
 *
 * @tags ["database", "repository", "monitor"]
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DatabaseService } from "../../../services/database/DatabaseService";

import { MonitorRepository } from "../../../services/database/MonitorRepository";

const createMockDatabaseService = () => {
    const mockDatabase = {
        all: vi.fn(),
        get: vi.fn(),
        prepare: vi.fn().mockReturnValue({
            all: vi.fn(),
            finalize: vi.fn(),
            get: vi.fn(),
            run: vi.fn(),
        }),
        run: vi.fn().mockReturnValue({ changes: 1, lastInsertRowid: 1 }),
    };

    return {
        executeTransaction: vi
            .fn()
            .mockImplementation(
                async (callback: (database: typeof mockDatabase) => unknown) =>
                    callback(mockDatabase)
            ),
        getDatabase: vi.fn().mockReturnValue(mockDatabase),
    };
};

type MockDatabaseService = ReturnType<typeof createMockDatabaseService>;

describe(MonitorRepository, () => {
    let repository: MonitorRepository;
    let mockDatabaseService: MockDatabaseService;

    beforeEach(() => {
        mockDatabaseService = createMockDatabaseService();

        repository = new MonitorRepository({
            databaseService: mockDatabaseService as unknown as DatabaseService,
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
                    id: "mon1",
                    site_identifier: "site1",
                    type: "http",
                    url: "https://example.com",
                    check_interval: 60_000,
                    timeout: 5000,
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
            ).rejects.toThrow("Database error");
        });
    });
    describe("findByIdentifier", () => {
        it("should find a monitor by id", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const mockMonitor = {
                id: "mon1",
                type: "http",
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

            const mockIds = [{ id: "mon1" }, { id: "mon2" }];
            const mockDb = mockDatabaseService.getDatabase();
            mockDb.all.mockReturnValue(mockIds);

            const result = await repository.getAllMonitorIds();

            expect(mockDatabaseService.getDatabase).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });
});
