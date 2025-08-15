/**
 * Comprehensive tests for MonitorRepository focusing on coverage improvement.
 * Tests all CRUD operations, bulk operations, and edge cases to achieve 90%+
 * coverage.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

import { MonitorRepository } from "../../../services/database/MonitorRepository";
import type { DatabaseService } from "../../../services/database/DatabaseService";
import type { Site } from "../../../../shared/types.js";

describe("MonitorRepository - Comprehensive Coverage", () => {
    let repository: MonitorRepository;
    let mockDatabaseService: jest.Mocked<DatabaseService>;
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
            executeTransaction: vi.fn(async (callback) => {
                return callback(mockDatabase);
            }),
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
        it("should create multiple monitors successfully", async () => {
            const siteIdentifier = "site-123";
            const monitors: Array<Site["monitors"][0]> = [
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
                .mockReturnValueOnce({ id: 1 })
                .mockReturnValueOnce({ id: 2 });

            const result = await repository.bulkCreate(
                siteIdentifier,
                monitors
            );

            expect(result).toHaveLength(2);
            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should handle empty monitors array", async () => {
            const result = await repository.bulkCreate("site-123", []);
            expect(result).toEqual([]);
        });
        it("should handle database transaction errors", async () => {
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
            ).rejects.toThrow("Transaction failed");
        });
    });
    describe("clearActiveOperations", () => {
        it("should clear active operations for a monitor", async () => {
            mockDatabase.run.mockReturnValue({ changes: 1 });

            await repository.clearActiveOperations("monitor-123");

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should handle database errors during clear operations", async () => {
            mockDatabaseService.executeTransaction.mockRejectedValue(
                new Error("Clear failed")
            );

            await expect(
                repository.clearActiveOperations("monitor-123")
            ).rejects.toThrow("Clear failed");
        });
    });
    describe("create", () => {
        it("should create a new monitor successfully", async () => {
            const siteIdentifier = "site-123";
            const monitor: Omit<Site["monitors"][0], "id"> = {
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

            mockDatabase.get.mockReturnValue({ id: 123 });

            const result = await repository.create(siteIdentifier, monitor);

            expect(result).toBe("123");
            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should handle port monitor creation", async () => {
            const siteIdentifier = "site-123";
            const monitor: Omit<Site["monitors"][0], "id"> = {
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

            mockDatabase.get.mockReturnValue({ id: 456 });

            const result = await repository.create(siteIdentifier, monitor);

            expect(result).toBe("456");
        });
        it("should handle creation errors", async () => {
            mockDatabaseService.executeTransaction.mockRejectedValue(
                new Error("Creation failed")
            );

            await expect(
                repository.create("site-123", {
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
            ).rejects.toThrow("Creation failed");
        });
    });
    describe("delete", () => {
        it("should delete a monitor successfully", async () => {
            mockDatabase.run
                .mockReturnValueOnce({ changes: 1 }) // Delete history
                .mockReturnValueOnce({ changes: 1 }); // Delete monitor

            const result = await repository.delete("monitor-123");

            expect(result).toBe(true);
            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should return false when monitor not found", async () => {
            mockDatabase.run
                .mockReturnValueOnce({ changes: 0 }) // No history
                .mockReturnValueOnce({ changes: 0 }); // No monitor

            const result = await repository.delete("nonexistent");

            expect(result).toBe(false);
        });
        it("should handle deletion errors", async () => {
            mockDatabaseService.executeTransaction.mockRejectedValue(
                new Error("Deletion failed")
            );

            await expect(repository.delete("monitor-123")).rejects.toThrow(
                "Deletion failed"
            );
        });
    });
    describe("deleteAll", () => {
        it("should delete all monitors", async () => {
            mockDatabase.run.mockReturnValue({ changes: 5 });

            await repository.deleteAll();

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should handle delete all errors", async () => {
            mockDatabaseService.executeTransaction.mockRejectedValue(
                new Error("Delete all failed")
            );

            await expect(repository.deleteAll()).rejects.toThrow(
                "Delete all failed"
            );
        });
    });
    describe("deleteBySiteIdentifier", () => {
        it("should delete monitors by site identifier", async () => {
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
        it("should handle site deletion errors", async () => {
            mockDatabaseService.executeTransaction.mockRejectedValue(
                new Error("Site deletion failed")
            );

            await expect(
                repository.deleteBySiteIdentifier("site-123")
            ).rejects.toThrow("Site deletion failed");
        });
    });
    describe("update", () => {
        it("should update a monitor successfully", async () => {
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
        it("should handle monitor not found for update", async () => {
            const monitorId = "nonexistent";
            const updateData = { url: "https://example.com" };

            mockDatabase.run.mockReturnValue({ changes: 0 });

            // Should not throw error even if monitor not found
            await repository.update(monitorId, updateData);

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should handle update errors", async () => {
            mockDatabaseService.executeTransaction.mockRejectedValue(
                new Error("Update failed")
            );

            await expect(
                repository.update("monitor-123", { url: "https://example.com" })
            ).rejects.toThrow("Update failed");
        });
        it("should handle monitors with different status values", async () => {
            const statuses = ["up", "down", "pending", "paused"] as const;

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
        it("should handle malformed monitor data gracefully", async () => {
            // Test with minimal monitor data
            const monitor: Omit<Site["monitors"][0], "id"> = {
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

            mockDatabase.get.mockReturnValue({ id: 789 });

            const result = await repository.create("site-123", monitor);
            expect(result).toBe("789");
        });
        it("should handle database connection errors", async () => {
            mockDatabaseService.getDatabase.mockImplementation(() => {
                throw new Error("Database connection failed");
            });
            await expect(
                repository.findByIdentifier("monitor-123")
            ).rejects.toThrow("Database connection failed");
        });
        it("should handle null/undefined responses from database", async () => {
            mockDatabase.get.mockReturnValue(null);

            const result = await repository.findByIdentifier("monitor-123");
            expect(result).toBeUndefined();
        });
        it("should handle empty result sets", async () => {
            mockDatabase.all.mockReturnValue([]);

            const result = await repository.findBySiteIdentifier("empty-site");
            expect(result).toEqual([]);
        });
        it("should handle very large datasets", async () => {
            const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                id: `monitor-${i}`,
                site_identifier: "large-site",
                type: "http",
                url: `https://example${i}.com`,
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: 1,
                status: "pending",
                responseTime: 100,
                lastChecked: Date.now(),
            }));

            mockDatabase.all.mockReturnValue(largeDataset);

            const result = await repository.findBySiteIdentifier("large-site");
            expect(result).toHaveLength(1000);
        });
    });
    describe("Internal Method Coverage", () => {
        it("should cover clearActiveOperationsInternal through public method", async () => {
            // This tests the internal method through the public interface
            mockDatabase.run.mockReturnValue({ changes: 1 });

            await repository.clearActiveOperations("monitor-123");

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        });
        it("should cover createInternal through public method", async () => {
            // This tests the internal method through the public interface
            mockDatabase.get.mockReturnValue({ id: 999 });

            await repository.create("site-123", {
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
        it("should handle mixed monitor types in bulk operations", async () => {
            const mixedMonitors: Array<Site["monitors"][0]> = [
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
                .mockReturnValueOnce({ id: 100 })
                .mockReturnValueOnce({ id: 200 })
                .mockReturnValueOnce({ id: 300 });

            const result = await repository.bulkCreate(
                "mixed-site",
                mixedMonitors
            );
            expect(result).toHaveLength(3);
        });
        it("should handle concurrent operations correctly", async () => {
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
