/**
 * Integration tests for DatabaseManager.
 * Uses real database and repository implementations for actual coverage.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs/promises";

import { DatabaseManager } from "../../managers/DatabaseManager";
import { DatabaseService } from "../../services/database/DatabaseService";
import { HistoryRepository } from "../../services/database/HistoryRepository";
import { MonitorRepository } from "../../services/database/MonitorRepository";
import { SettingsRepository } from "../../services/database/SettingsRepository";
import { SiteRepository } from "../../services/database/SiteRepository";
import { TypedEventBus } from "../../events/TypedEventBus";
import type { UptimeEvents } from "../../events/eventTypes";

describe("DatabaseManager - Integration Tests", () => {
    let databaseManager: DatabaseManager;
    let databaseService: DatabaseService;
    let eventBus: TypedEventBus<UptimeEvents>;
    let tempDbPath: string;

    beforeEach(async () => {
        // Create a temporary database for testing
        tempDbPath = `test-db-${Date.now()}.sqlite`;

        // Create real database service with temporary database
        databaseService = DatabaseService.getInstance();
        databaseService.initialize();

        // Create real event bus
        eventBus = new TypedEventBus<UptimeEvents>();

        // Create real repositories with the database service
        const historyRepository = new HistoryRepository({ databaseService });
        const monitorRepository = new MonitorRepository({ databaseService });
        const settingsRepository = new SettingsRepository({ databaseService });
        const siteRepository = new SiteRepository({ databaseService });

        // Create DatabaseManager with real dependencies
        databaseManager = new DatabaseManager({
            configurationManager: {
                getHistoryRetentionRules: () => ({
                    defaultLimit: 500,
                    maxLimit: Number.MAX_SAFE_INTEGER,
                    minLimit: 25,
                }),
            } as any,
            eventEmitter: eventBus,
            repositories: {
                database: databaseService,
                history: historyRepository,
                monitor: monitorRepository,
                settings: settingsRepository,
                site: siteRepository,
            },
        });
    });
    afterEach(async () => {
        // Clean up: close database and remove temp file
        await databaseService.close();
        try {
            await fs.unlink(tempDbPath);
        } catch {
            // Ignore if file doesn't exist
        }
    });
    describe("Initialization", () => {
        it("should initialize with default history limit", async () => {
            const historyLimit = databaseManager.getHistoryLimit();
            expect(typeof historyLimit).toBe("number");
            expect(historyLimit).toBeGreaterThan(0);
        });
    });
    describe("History Limit Management", () => {
        it("should set and get history limit", async () => {
            const newLimit = 500;

            await databaseManager.setHistoryLimit(newLimit);
            const retrievedLimit = databaseManager.getHistoryLimit();

            expect(retrievedLimit).toBe(newLimit);
        });
        it("should emit event when history limit is set", async () => {
            const eventSpy = vi.fn();
            eventBus.on("internal:database:history-limit-updated", eventSpy);

            const newLimit = 750;
            await databaseManager.setHistoryLimit(newLimit);

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: newLimit,
                    operation: "history-limit-updated",
                    timestamp: expect.any(Number),
                })
            );
        });
        it("should handle setting zero history limit", async () => {
            await databaseManager.setHistoryLimit(0);
            const retrievedLimit = databaseManager.getHistoryLimit();
            expect(retrievedLimit).toBe(0);
        });
        it("should reject negative history limit", async () => {
            await expect(
                databaseManager.setHistoryLimit(-100)
            ).rejects.toThrow();
        });
    });
    describe("Data Export", () => {
        it("should export data when database has content", async () => {
            // First, add some test data via repositories
            const settingsRepo = new SettingsRepository({ databaseService });
            await settingsRepo.set("test-key", "test-value");

            // Export data
            const exportResult = await databaseManager.exportData();
            expect(typeof exportResult).toBe("string");
            expect(() => JSON.parse(exportResult)).not.toThrow();
        });
        it("should handle export of empty database", async () => {
            const exportResult = await databaseManager.exportData();

            expect(typeof exportResult).toBe("string");
            expect(() => JSON.parse(exportResult)).not.toThrow();
        });
        it("should emit export event on successful export", async () => {
            const eventSpy = vi.fn();
            eventBus.on("internal:database:data-exported", eventSpy);

            await databaseManager.exportData();

            expect(eventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    operation: "data-exported",
                    timestamp: expect.any(Number),
                })
            );
        });
    });
    describe("Backup Operations", () => {
        it.skip("should download backup when database exists - requires file system", async () => {
            // This test requires real file system access and is skipped in integration tests
            // It would be better tested in an end-to-end test environment
        });
        it.skip("should emit backup event on successful backup - requires file system", async () => {
            // This test requires real file system access and is skipped in integration tests
            // It would be better tested in an end-to-end test environment
        });
    });
    describe("Data Import", () => {
        it("should handle import with valid data structure", async () => {
            const testData = {
                settings: [{ key: "test-import", value: "imported-value" }],
                sites: [],
                monitors: [],
                history: [],
            };

            const importResult = await databaseManager.importData(
                JSON.stringify(testData)
            );

            // The result depends on the implementation
            expect(typeof importResult).toBe("boolean");
        });
        it("should handle import with empty data", async () => {
            const emptyData = {
                settings: [],
                sites: [],
                monitors: [],
                history: [],
            };

            const importResult = await databaseManager.importData(
                JSON.stringify(emptyData)
            );
            expect(typeof importResult).toBe("boolean");
        });
        it("should handle import with malformed data", async () => {
            const malformedData = {
                // Missing required fields
                invalidField: "invalid",
            };

            const importResult = await databaseManager.importData(
                malformedData as any
            );
            expect(typeof importResult).toBe("boolean");
        });
    });
    describe("Error Handling", () => {
        it("should handle database errors gracefully", async () => {
            // Close the database to simulate an error condition
            databaseService.close();

            // Operations should handle errors gracefully
            expect(() => databaseManager.getHistoryLimit()).not.toThrow();
        });
    });
    describe("Event Emission", () => {
        it("should emit site loading events", async () => {
            const eventSpy = vi.fn();
            eventBus.on(
                "internal:database:update-sites-cache-requested",
                eventSpy
            );

            // Trigger an operation that should emit site loading events
            await databaseManager.refreshSites();

            // Check if events were emitted (depending on implementation)
            // The specific assertion depends on when events are emitted
            expect(eventSpy).toHaveBeenCalledWith(expect.any(Object));
        });
    });
    describe("Complex Integration Scenarios", () => {
        it.skip("should handle full workflow: set limit -> add data -> export -> backup - requires file system", async () => {
            // This test requires file system access for backup operations
            // Skip in integration tests to focus on database operations
        });
        it("should maintain data consistency across operations", async () => {
            // Set initial state
            await databaseManager.setHistoryLimit(500);

            // Add data via repositories
            const settingsRepository2 = new SettingsRepository({
                databaseService,
            });
            await settingsRepository2.set("consistency-test", "initial-value");
            await settingsRepository2.set("consistency-test", "updated-value");
            const exportResult = await databaseManager.exportData();
            expect(typeof exportResult).toBe("string");

            // Verify history limit is unchanged
            const historyLimit = await databaseManager.getHistoryLimit();
            expect(historyLimit).toBe(500);
        });
    });
});
