/**
 * Comprehensive tests for State Sync domain API Includes fast-check
 * property-based testing for robust coverage
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import fc from "fast-check";

// Mock electron using vi.hoisted() to ensure proper initialization order
const mockIpcRenderer = vi.hoisted(() => ({
    invoke: vi.fn(),
    on: vi.fn(),
    removeAllListeners: vi.fn(),
    removeListener: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer: mockIpcRenderer,
}));

const ipcContext = expect.objectContaining({
    __uptimeWatcherIpcContext: true,
});

import {
    stateSyncApi,
    type StateSyncApiInterface,
} from "../../../preload/domains/stateSyncApi";
import { STATE_SYNC_CHANNELS } from "@shared/types/preload";
import type { Site } from "@shared/types";
import type {
    StateSyncFullSyncResult,
    StateSyncStatusSummary,
} from "@shared/types/stateSync";
import type { IpcResponse } from "../../../preload/core/bridgeFactory";

// Helper functions for creating properly formatted IPC responses
function createIpcResponse<T>(data: T): IpcResponse<T> {
    return {
        data,
        success: true,
    };
}

const VALID_STATE_SYNC_SOURCES = [
    "cache",
    "database",
    "frontend",
] as const;

const createMinimalSite = (identifier: string): Site => ({
    identifier,
    monitors: [
        {
            checkInterval: 30_000,
            history: [],
            id: `monitor-${identifier}`,
            monitoring: true,
            responseTime: -1,
            retryAttempts: 0,
            status: "up",
            timeout: 1000,
            type: "http",
            url: "https://example.com",
        },
    ],
    monitoring: true,
    name: `Site ${identifier}`,
});

describe("State Sync Domain API", () => {
    let api: StateSyncApiInterface;

    beforeEach(() => {
        vi.clearAllMocks();
        api = stateSyncApi;
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("API Structure Validation", () => {
        it("should expose all required state sync methods", () => {
            const expectedMethods = ["getSyncStatus", "requestFullSync"];

            for (const method of expectedMethods) {
                expect(api).toHaveProperty(method);
                expect(typeof api[method as keyof typeof api]).toBe("function");
            }
        });

        it("should reference the same stateSyncApi instance", () => {
            expect(api).toBe(stateSyncApi);
        });
    });

    describe("getSyncStatus", () => {
        it("should call IPC with correct channel and return summary", async () => {
            const mockStatus: StateSyncStatusSummary = {
                lastSyncAt: Date.now(),
                siteCount: 2,
                source: "database",
                synchronized: true,
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockStatus)
            );

            const result = await api.getSyncStatus();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                STATE_SYNC_CHANNELS.getSyncStatus,
                ipcContext
            );
            expect(result).toEqual(mockStatus);
            expect(typeof result.siteCount).toBe("number");
            expect(typeof result.synchronized).toBe("boolean");
        });

        it("should handle empty sync summary", async () => {
            const emptyStatus: StateSyncStatusSummary = {
                lastSyncAt: null,
                siteCount: 0,
                source: "cache",
                synchronized: false,
            };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(emptyStatus)
            );

            const result = await api.getSyncStatus();

            expect(result).toEqual(emptyStatus);
            expect(result.siteCount).toBe(0);
            expect(result.synchronized).toBeFalsy();
        });

        it("should handle sync status errors", async () => {
            const error = new Error("Failed to get sync status");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.getSyncStatus()).rejects.toThrowError(
                "Failed to get sync status"
            );
        });

        it("should handle large sync datasets by site count", async () => {
            const largeStatus: StateSyncStatusSummary = {
                lastSyncAt: Date.now(),
                siteCount: 500,
                source: "database",
                synchronized: true,
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(largeStatus)
            );

            const result = await api.getSyncStatus();
            expect(result.siteCount).toBe(500);
            expect(result.synchronized).toBeTruthy();
        });
    });

    describe("requestFullSync", () => {
        it("should call IPC with correct channel and return full sync result", async () => {
            const mockSyncedSites: Site[] = [
                {
                    ...createMinimalSite("synced-1"),
                    name: "Synced Site 1",
                },
                {
                    ...createMinimalSite("synced-2"),
                    name: "Synced Site 2",
                    monitoring: false,
                },
            ];

            const mockResult: StateSyncFullSyncResult = {
                completedAt: Date.now(),
                revision: 1,
                siteCount: mockSyncedSites.length,
                sites: mockSyncedSites,
                source: "frontend",
                synchronized: true,
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockResult)
            );

            const result = await api.requestFullSync();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                STATE_SYNC_CHANNELS.requestFullSync,
                ipcContext
            );
            expect(result).toEqual(mockResult);
            expect(Array.isArray(result.sites)).toBeTruthy();
            expect(result.siteCount).toBe(mockSyncedSites.length);
        });

        it("should handle full sync with no sites", async () => {
            const emptyResult: StateSyncFullSyncResult = {
                completedAt: Date.now(),
                revision: 2,
                siteCount: 0,
                sites: [],
                source: "cache",
                synchronized: false,
            };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(emptyResult)
            );

            const result = await api.requestFullSync();

            expect(result).toEqual(emptyResult);
            expect(result.siteCount).toBe(0);
            expect(result.sites).toHaveLength(0);
        });

        it("should handle sync operation failures", async () => {
            const error = new Error("Sync operation failed");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.requestFullSync()).rejects.toThrowError(
                "Sync operation failed"
            );
        });

        it("should handle network connectivity issues during sync", async () => {
            const networkError = new Error("Network unreachable during sync");
            mockIpcRenderer.invoke.mockRejectedValue(networkError);

            await expect(api.requestFullSync()).rejects.toThrowError(
                "Network unreachable during sync"
            );
        });

        it("should handle database conflicts during sync", async () => {
            const conflictError = new Error(
                "Database conflict during synchronization"
            );
            mockIpcRenderer.invoke.mockRejectedValue(conflictError);

            await expect(api.requestFullSync()).rejects.toThrowError(
                "Database conflict during synchronization"
            );
        });
    });

    describe("Property-based testing with fast-check", () => {
        it("should handle various sync status responses", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        lastSyncAt: fc.option(
                            fc.integer({
                                min: 0,
                                max: Number.MAX_SAFE_INTEGER,
                            }),
                            { nil: null }
                        ),
                        siteCount: fc.integer({ min: 0, max: 250 }),
                        source: fc.constantFrom(...VALID_STATE_SYNC_SOURCES),
                        synchronized: fc.boolean(),
                    }),
                    async (statusSummary) => {
                        mockIpcRenderer.invoke.mockResolvedValue(
                            createIpcResponse(statusSummary)
                        );

                        const result = await api.getSyncStatus();
                        expect(result).toEqual(statusSummary);
                        expect(typeof result.siteCount).toBe("number");
                        expect(typeof result.synchronized).toBe("boolean");
                    }
                ),
                { numRuns: 20 }
            );
        });

        // Must match the shared Zod schemas:
        // - identifier: /^[\dA-Z:_-]+$/i
        // - name: /^[\dA-Z .:_-]+$/i
        const siteIdentifierArb = fc.stringMatching(/^[\w:-]{1,50}$/);
        const siteNameArb = fc
            .stringMatching(/^[\w .:-]{1,120}$/)
            .filter((name) => name.trim().length > 0);

        it("should handle various full sync scenarios", async () => {
            const siteArrayArb = fc
                .array(
                    fc.record({
                        identifier: siteIdentifierArb,
                        name: siteNameArb,
                        monitoring: fc.boolean(),
                    }),
                    { minLength: 0, maxLength: 40 }
                )
                .map((sites) =>
                    sites.map((site) => ({
                        ...site,
                        monitors: createMinimalSite(site.identifier).monitors,
                    }))
                );

            await fc.assert(
                fc.asyncProperty(
                    siteArrayArb,
                    // Zod's `z.int()` contract expects a safe, non-negative
                    // integer. Use a bounded range to avoid edge cases with
                    // extremely large timestamps.
                    fc.integer({ min: 0, max: 2_147_483_647 }),
                    fc.integer({ min: 0, max: 2_147_483_647 }),
                    fc.boolean(),
                    fc.constantFrom(...VALID_STATE_SYNC_SOURCES),
                    async (
                        sites,
                        completedAt,
                        revision,
                        synchronized,
                        source
                    ) => {
                        const fullSync: StateSyncFullSyncResult = {
                            completedAt,
                            revision,
                            siteCount: sites.length,
                            sites,
                            source,
                            synchronized,
                        };

                        mockIpcRenderer.invoke.mockResolvedValue(
                            createIpcResponse(fullSync)
                        );

                        const result = await api.requestFullSync();
                        expect(result).toEqual(fullSync);
                        expect(result.sites).toHaveLength(sites.length);
                    }
                ),
                { numRuns: 15 }
            );
        });

        it("should handle various error scenarios", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.oneof(
                        fc
                            .string({ minLength: 1 })
                            .map((msg) => new Error(msg)),
                        fc.constant(new Error("Sync failed")),
                        fc.constant(new Error("Database error")),
                        fc.constant(new Error("Network timeout"))
                    ),
                    async (error) => {
                        mockIpcRenderer.invoke.mockRejectedValue(error);

                        await expect(api.getSyncStatus()).rejects.toThrowError(
                            error.message
                        );
                        await expect(
                            api.requestFullSync()
                        ).rejects.toThrowError(error.message);
                    }
                ),
                { numRuns: 10 }
            );
        });
    });

    describe("Integration and workflow scenarios", () => {
        it("should handle sync conflicts and recovery", async () => {
            mockIpcRenderer.invoke.mockRejectedValueOnce(
                new Error("Sync conflict")
            );
            await expect(api.requestFullSync()).rejects.toThrowError(
                "Sync conflict"
            );

            const resolvedSites: Site[] = [
                {
                    ...createMinimalSite("resolved-site"),
                    name: "Resolved Site",
                },
            ];
            const resolvedResult: StateSyncFullSyncResult = {
                completedAt: Date.now(),
                revision: 3,
                siteCount: resolvedSites.length,
                sites: resolvedSites,
                source: "database",
                synchronized: true,
            };
            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(resolvedResult)
            );
            const result = await api.requestFullSync();
            expect(result).toEqual(resolvedResult);
        });

        it("should handle multiple concurrent sync operations", async () => {
            const mockStatus: StateSyncStatusSummary = {
                lastSyncAt: Date.now(),
                siteCount: 2,
                source: "database",
                synchronized: true,
            };

            const syncedSites: Site[] = [
                createMinimalSite("sync-1"),
                createMinimalSite("sync-2"),
            ];
            const mockSync: StateSyncFullSyncResult = {
                completedAt: Date.now(),
                revision: 4,
                siteCount: syncedSites.length,
                sites: syncedSites,
                source: "database",
                synchronized: true,
            };

            mockIpcRenderer.invoke
                .mockResolvedValueOnce(createIpcResponse(mockStatus))
                .mockResolvedValueOnce(createIpcResponse(mockSync))
                .mockResolvedValueOnce(createIpcResponse(mockStatus));

            const promises = [
                api.getSyncStatus(),
                api.requestFullSync(),
                api.getSyncStatus(),
            ];

            const results = await Promise.all(promises);
            expect(results).toHaveLength(3);
            expect(results[0]).toEqual(mockStatus);
            expect(results[1]).toEqual(mockSync);
            expect(results[2]).toEqual(mockStatus);
        });
    });

    describe("Error handling and edge cases", () => {
        it("should handle database corruption scenarios", async () => {
            const corruptionError = new Error("Database corrupted during sync");
            mockIpcRenderer.invoke.mockRejectedValue(corruptionError);

            await expect(api.getSyncStatus()).rejects.toThrowError(
                "Database corrupted during sync"
            );
            await expect(api.requestFullSync()).rejects.toThrowError(
                "Database corrupted during sync"
            );
        });

        it("should handle memory limitations during large syncs", async () => {
            const memoryError = new Error(
                "Out of memory during sync operation"
            );
            mockIpcRenderer.invoke.mockRejectedValue(memoryError);

            await expect(api.requestFullSync()).rejects.toThrowError(
                "Out of memory during sync operation"
            );
        });

        it("should handle malformed sync data gracefully", async () => {
            const malformedData = { invalid: "sync data structure" };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(malformedData)
            );

            await expect(api.getSyncStatus()).rejects.toThrowError(
                /failed validation/i
            );
        });

        it("should maintain type safety with edge case data", async () => {
            const edgeCaseSites: Site[] = [
                {
                    identifier: "a".repeat(100),
                    name: "b".repeat(200),
                    monitoring: true,
                    monitors: createMinimalSite("edge-case").monitors,
                },
            ];

            const edgeCaseStatus: StateSyncStatusSummary = {
                lastSyncAt: Date.now(),
                siteCount: edgeCaseSites.length,
                source: "database",
                synchronized: true,
            };
            const edgeCaseFullSync: StateSyncFullSyncResult = {
                completedAt: Date.now(),
                revision: 10,
                siteCount: edgeCaseSites.length,
                sites: edgeCaseSites,
                source: "database",
                synchronized: true,
            };

            mockIpcRenderer.invoke
                .mockResolvedValueOnce(createIpcResponse(edgeCaseStatus))
                .mockResolvedValueOnce(createIpcResponse(edgeCaseFullSync));

            const status = await api.getSyncStatus();
            const fullSync = await api.requestFullSync();

            expect(status.siteCount).toBe(edgeCaseSites.length);
            expect(fullSync.sites).toEqual(edgeCaseSites);
        });
    });

    describe("Type safety and contract validation", () => {
        it("should maintain proper typing for all return values", async () => {
            const mockSites: Site[] = [
                {
                    ...createMinimalSite("typed-site"),
                    name: "Typed Site",
                },
            ];

            const statusSummary: StateSyncStatusSummary = {
                lastSyncAt: Date.now(),
                siteCount: mockSites.length,
                source: "database",
                synchronized: true,
            };
            const fullSyncResult: StateSyncFullSyncResult = {
                completedAt: Date.now(),
                revision: 11,
                siteCount: mockSites.length,
                sites: mockSites,
                source: "database",
                synchronized: true,
            };

            mockIpcRenderer.invoke
                .mockResolvedValueOnce(createIpcResponse(statusSummary))
                .mockResolvedValueOnce(createIpcResponse(fullSyncResult));

            const statusResult = await api.getSyncStatus();
            const syncResult = await api.requestFullSync();

            expect(statusResult.siteCount).toBe(mockSites.length);
            expect(syncResult.sites).toHaveLength(mockSites.length);

            for (const site of syncResult.sites) {
                expect(typeof site.identifier).toBe("string");
                expect(typeof site.name).toBe("string");
                expect(typeof site.monitoring).toBe("boolean");
                expect(Array.isArray(site.monitors)).toBeTruthy();
            }
        });

        it("should handle function context properly", async () => {
            const { getSyncStatus, requestFullSync } = api;

            const statusSummary: StateSyncStatusSummary = {
                lastSyncAt: Date.now(),
                siteCount: 0,
                source: "database",
                synchronized: true,
            };
            const fullSyncResult: StateSyncFullSyncResult = {
                completedAt: Date.now(),
                revision: 12,
                siteCount: 0,
                sites: [],
                source: "database",
                synchronized: true,
            };

            mockIpcRenderer.invoke
                .mockResolvedValueOnce(createIpcResponse(statusSummary))
                .mockResolvedValueOnce(createIpcResponse(fullSyncResult));

            const status = await getSyncStatus();
            const sync = await requestFullSync();

            expect(status.siteCount).toBe(0);
            expect(sync.sites).toEqual([]);
        });
    });
});
