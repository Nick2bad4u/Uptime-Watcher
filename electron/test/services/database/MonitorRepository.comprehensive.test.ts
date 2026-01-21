/**
 * Comprehensive tests for MonitorRepository focusing on coverage improvement.
 * Tests all CRUD operations, bulk operations, and edge cases to achieve 90%+
 * coverage.
 */

import {
    describe,
    it,
    expect,
    beforeEach,
    vi,
    afterEach,
    type MockedObject,
} from "vitest";

import { MonitorRepository } from "../../../services/database/MonitorRepository";
import type { DatabaseService } from "../../../services/database/DatabaseService";
import type { Site } from "@shared/types";

describe("MonitorRepository - Comprehensive Coverage", () => {
    let repository: MonitorRepository;
    let mockDatabaseService: MockedObject<DatabaseService>;
    let mockDatabase: any;

    beforeEach(() => {
        // Mock database instance with all required methods
        mockDatabase = {
            all: vi.fn(),
            get: vi.fn(),
            run: vi.fn(),
            prepare: vi.fn(() => ({
                all: vi.fn(),
                get: vi.fn(),
                run: vi.fn(),
                finalize: vi.fn(),
            })),
            exec: vi.fn(),
            close: vi.fn(),
        };

        // Mock DatabaseService with transaction support
        mockDatabaseService = {
            getDatabase: vi.fn(() => mockDatabase),
            executeTransaction: vi.fn(async (callback) =>
                callback(mockDatabase)
            ),
            initialize: vi.fn(),
            close: vi.fn(),
        } as any;

        repository = new MonitorRepository({
            databaseService: mockDatabaseService,
        });
    });
    afterEach(() => {
        vi.clearAllMocks();
    });
    describe("bulkCreate", () => {
        it("should create multiple monitors successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const siteIdentifier = "site-123";
            const monitors: Site["monitors"][0][] = [
                {
                    type: "http",
                    url: "https://example.com",
                    checkInterval: 60_000,
                    timeout: 5000,
                    retryAttempts: 3,
                    monitoring: true,
                    status: "pending",
                    responseTime: 0,
                    history: [],
                    id: "temp-1",
                },
                {
                    type: "ping",
                    host: "8.8.8.8",
                    checkInterval: 30_000,
                    timeout: 3000,
                    retryAttempts: 2,
                    monitoring: true,
                    status: "pending",
                    responseTime: 0,
                    history: [],
                    id: "temp-2",
                },
            ];

            // Mock the insertWithReturning calls for each monitor
            mockDatabase.get
                .mockReturnValueOnce({ id: "temp-1" })
                .mockReturnValueOnce({ id: "temp-2" });

            const result = await repository.bulkCreate(
                siteIdentifier,
                monitors
            );

            expect(result).toHaveLength(2);
            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should handle empty monitors array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const result = await repository.bulkCreate("site-123", []);
            expect(result).toEqual([]);
        });
        it("should handle database transaction errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockDatabaseService.executeTransaction.mockRejectedValue(
                new Error("Transaction failed")
            );

            await expect(
                repository.bulkCreate("site-123", [
                    {
                        type: "http",
                        url: "https://example.com",
                        checkInterval: 60_000,
                        timeout: 5000,
                        retryAttempts: 3,
                        monitoring: true,
                        status: "pending",
                        responseTime: 0,
                        history: [],
                        id: "temp-1",
                    },
                ])
            ).rejects.toThrowError("Transaction failed");
        });
    });
    describe("clearActiveOperations", () => {
        it("should clear active operations for a monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            mockDatabase.run.mockReturnValue({ changes: 1 });

            await repository.clearActiveOperations("monitor-123");

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should handle database errors during clear operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockDatabaseService.executeTransaction.mockRejectedValue(
                new Error("Clear failed")
            );

            await expect(
                repository.clearActiveOperations("monitor-123")
            ).rejects.toThrowError("Clear failed");
        });
    });
    describe("create", () => {
        it("should create a new monitor successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const siteIdentifier = "site-123";
            const monitor: Site["monitors"][0] = {
                id: "monitor-123",
                type: "http",
                url: "https://example.com",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                status: "pending",
                responseTime: 0,
                history: [],
            };

            mockDatabase.get.mockReturnValue({ id: "monitor-123" });

            const result = await repository.create(siteIdentifier, monitor);

            expect(result).toBe("monitor-123");
            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should handle port monitor creation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const siteIdentifier = "site-123";
            const monitor: Site["monitors"][0] = {
                id: "monitor-456",
                type: "port",
                host: "localhost",
                port: 8080,
                checkInterval: 30_000,
                timeout: 3000,
                retryAttempts: 2,
                monitoring: true,
                status: "pending",
                responseTime: 0,
                history: [],
            };

            mockDatabase.get.mockReturnValue({ id: "monitor-456" });

            const result = await repository.create(siteIdentifier, monitor);

            expect(result).toBe("monitor-456");
        });
        it("should handle creation errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockDatabaseService.executeTransaction.mockRejectedValue(
                new Error("Creation failed")
            );

            await expect(
                repository.create("site-123", {
                    id: "monitor-err",
                    type: "http",
                    url: "https://example.com",
                    checkInterval: 60_000,
                    timeout: 5000,
                    retryAttempts: 3,
                    monitoring: true,
                    status: "pending",
                    responseTime: 0,
                    history: [],
                })
            ).rejects.toThrowError("Creation failed");
        });
    });
    describe("delete", () => {
        it("should delete a monitor successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Deletion", "type");

            mockDatabase.run
                .mockReturnValueOnce({ changes: 1 }) // Delete history
                .mockReturnValueOnce({ changes: 1 }); // Delete monitor

            const result = await repository.delete("monitor-123");

            expect(result).toBeTruthy();
            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should return false when monitor not found", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            mockDatabase.run
                .mockReturnValueOnce({ changes: 0 }) // No history
                .mockReturnValueOnce({ changes: 0 }); // No monitor

            const result = await repository.delete("nonexistent");

            expect(result).toBeFalsy();
        });
        it("should handle deletion errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockDatabaseService.executeTransaction.mockRejectedValue(
                new Error("Deletion failed")
            );

            await expect(repository.delete("monitor-123")).rejects.toThrowError(
                "Deletion failed"
            );
        });
    });
    describe("deleteAll", () => {
        it("should delete all monitors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Deletion", "type");

            mockDatabase.run.mockReturnValue({ changes: 5 });

            await repository.deleteAll();

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
            // Optimized: clears history in one statement, then deletes monitors.
            expect(mockDatabase.run).toHaveBeenCalledWith(
                "DELETE FROM history"
            );
            expect(mockDatabase.run).toHaveBeenCalledWith(
                "DELETE FROM monitors"
            );
        });
        it("should handle delete all errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockDatabaseService.executeTransaction.mockRejectedValue(
                new Error("Delete all failed")
            );

            await expect(repository.deleteAll()).rejects.toThrowError(
                "Delete all failed"
            );
        });
    });
    describe("deleteBySiteIdentifier", () => {
        it("should delete monitors by site identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Deletion", "type");

            // Mock the query for monitor rows first, then the delete operations
            mockDatabase.all.mockReturnValue([
                { id: "monitor-1" },
                { id: "monitor-2" },
                { id: "monitor-3" },
            ]);
            mockDatabase.run.mockReturnValue({ changes: 3 });

            await repository.deleteBySiteIdentifier("site-123");

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should handle site deletion errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockDatabaseService.executeTransaction.mockRejectedValue(
                new Error("Site deletion failed")
            );

            await expect(
                repository.deleteBySiteIdentifier("site-123")
            ).rejects.toThrowError("Site deletion failed");
        });
    });
    describe("update", () => {
        it("should update a monitor successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Update", "type");

            const monitorId = "monitor-123";
            const updatedData = {
                url: "https://updated.com",
                checkInterval: 30_000,
                timeout: 10_000,
                retryAttempts: 5,
                monitoring: false,
                status: "up" as const,
                responseTime: 150,
            };

            mockDatabase.run.mockReturnValue({ changes: 1 });

            await repository.update(monitorId, updatedData);

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should handle monitor not found for update", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Update", "type");

            const monitorId = "nonexistent";
            const updateData = { url: "https://example.com" };

            mockDatabase.run.mockReturnValue({ changes: 0 });

            // Should not throw error even if monitor not found
            await repository.update(monitorId, updateData);

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should handle update errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockDatabaseService.executeTransaction.mockRejectedValue(
                new Error("Update failed")
            );

            await expect(
                repository.update("monitor-123", { url: "https://example.com" })
            ).rejects.toThrowError("Update failed");
        });
        it("should handle monitors with different status values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const statuses = [
                "up",
                "down",
                "pending",
                "paused",
            ] as const;

            for (const status of statuses) {
                mockDatabase.run.mockReturnValue({ changes: 1 });

                await repository.update(`monitor-${status}`, {
                    status,
                    responseTime: 100,
                    lastChecked: new Date(),
                });
                expect(
                    mockDatabaseService.executeTransaction
                ).toHaveBeenCalled();
            }
        });
    });
    describe("Edge Cases and Error Handling", () => {
        it("should handle malformed monitor data gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            // Test with minimal monitor data
            const monitor: Site["monitors"][0] = {
                id: "monitor-789",
                type: "http",
                url: "",
                checkInterval: 0,
                timeout: 0,
                retryAttempts: 0,
                monitoring: false,
                status: "pending",
                responseTime: 0,
                history: [],
            };

            mockDatabase.get.mockReturnValue({ id: "monitor-789" });

            const result = await repository.create("site-123", monitor);
            expect(result).toBe("monitor-789");
        });
        it("should handle database connection errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockDatabaseService.getDatabase.mockImplementation(() => {
                throw new Error("Database connection failed");
            });
            await expect(
                repository.findByIdentifier("monitor-123")
            ).rejects.toThrowError("Database connection failed");
        });
        it("should handle null/undefined responses from database", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            mockDatabase.get.mockReturnValue(null);

            const result = await repository.findByIdentifier("monitor-123");
            expect(result).toBeUndefined();
        });
        it("should handle empty result sets", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            mockDatabase.all.mockReturnValue([]);

            const result = await repository.findBySiteIdentifier("empty-site");
            expect(result).toEqual([]);
        });
        it("should handle very large datasets", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                id: `monitor-${i}`,
                site_identifier: "large-site",
                type: "http",
                url: `https://example${i}.com`,
                enabled: 1,
                check_interval: 60_000,
                timeout: 5000,
                retry_attempts: 3,
                status: "pending",
                response_time: 100,
                last_checked: Date.now(),
                created_at: Date.now(),
                updated_at: Date.now(),
            }));

            mockDatabase.all.mockReturnValue(largeDataset);

            const result = await repository.findBySiteIdentifier("large-site");
            expect(result).toHaveLength(1000);
        });
    });
    describe("Internal Method Coverage", () => {
        it("should cover clearActiveOperationsInternal through public method", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // This tests the internal method through the public interface
            mockDatabase.run.mockReturnValue({ changes: 1 });

            await repository.clearActiveOperations("monitor-123");

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should cover createInternal through public method", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            // This tests the internal method through the public interface
            mockDatabase.get.mockReturnValue({ id: "monitor-temp-id" });

            await repository.create("site-123", {
                id: "monitor-temp-id",
                type: "http",
                url: "https://internal-test.com",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                status: "pending",
                responseTime: 0,
                history: [],
            });
            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
    });
    describe("Complex Scenarios", () => {
        it("should handle mixed monitor types in bulk operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const mixedMonitors: Site["monitors"][0][] = [
                {
                    type: "http",
                    url: "https://example.com",
                    checkInterval: 60_000,
                    timeout: 5000,
                    retryAttempts: 3,
                    monitoring: true,
                    status: "pending",
                    responseTime: 0,
                    history: [],
                    id: "http-temp",
                },
                {
                    type: "ping",
                    host: "8.8.8.8",
                    checkInterval: 30_000,
                    timeout: 3000,
                    retryAttempts: 2,
                    monitoring: true,
                    status: "pending",
                    responseTime: 0,
                    history: [],
                    id: "ping-temp",
                },
                {
                    type: "port",
                    host: "localhost",
                    port: 8080,
                    checkInterval: 45_000,
                    timeout: 4000,
                    retryAttempts: 1,
                    monitoring: false,
                    status: "pending",
                    responseTime: 0,
                    history: [],
                    id: "port-temp",
                },
            ];

            // Mock the get calls for each monitor creation
            mockDatabase.get
                .mockReturnValueOnce({ id: "http-temp" })
                .mockReturnValueOnce({ id: "ping-temp" })
                .mockReturnValueOnce({ id: "port-temp" });

            const result = await repository.bulkCreate(
                "mixed-site",
                mixedMonitors
            );
            expect(result).toHaveLength(3);
        });
        it("should handle concurrent operations correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorRepository", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Set up mock responses for concurrent calls
            mockDatabase.get
                .mockReturnValueOnce({ id: "monitor-1" })
                .mockReturnValueOnce({ id: "monitor-2" })
                .mockReturnValueOnce({ id: "monitor-3" });

            // Execute concurrent operations and await all results
            const results = await Promise.all([
                repository.findByIdentifier("monitor-1"),
                repository.findByIdentifier("monitor-2"),
                repository.findByIdentifier("monitor-3"),
            ]);

            expect(results).toHaveLength(3);
        });
    });
});
