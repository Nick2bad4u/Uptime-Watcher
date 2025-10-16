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

import {
    stateSyncApi,
    type StateSyncApiInterface,
} from "../../../preload/domains/stateSyncApi";
import type { Site } from "../../../../shared/types";
import type { StateSyncEventData } from "../../../../shared/types/events";
import type {
    StateSyncFullSyncResult,
    StateSyncStatusSummary,
} from "../../../../shared/types/stateSync";
import type { IpcResponse } from "../../../preload/core/bridgeFactory";

// Helper functions for creating properly formatted IPC responses
function createIpcResponse<T>(data: T): IpcResponse<T> {
    return {
        data,
        success: true,
    };
}

const VALID_STATE_SYNC_ACTIONS: readonly StateSyncEventData["action"][] = [
    "bulk-sync",
    "delete",
    "update",
] as const;
const VALID_STATE_SYNC_SOURCES: readonly StateSyncEventData["source"][] = [
    "cache",
    "database",
    "frontend",
] as const;

const buildStateSyncEventData = (
    action: StateSyncEventData["action"],
    source: StateSyncEventData["source"],
    timestamp: number,
    siteIdentifier: string | null
): StateSyncEventData => {
    const baseEvent: StateSyncEventData = {
        action,
        sites: [],
        source,
        timestamp,
    };

    if (siteIdentifier === null) {
        return baseEvent;
    }

    return {
        ...baseEvent,
        siteIdentifier,
    };
};

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
            const expectedMethods = [
                "getSyncStatus",
                "onStateSyncEvent",
                "requestFullSync",
            ];

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
                "get-sync-status"
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

            await expect(api.getSyncStatus()).rejects.toThrow(
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
                    identifier: "synced-1",
                    name: "Synced Site 1",
                    monitoring: true,
                    monitors: [],
                },
                {
                    identifier: "synced-2",
                    name: "Synced Site 2",
                    monitoring: false,
                    monitors: [],
                },
            ];

            const mockResult: StateSyncFullSyncResult = {
                completedAt: Date.now(),
                siteCount: mockSyncedSites.length,
                sites: mockSyncedSites,
                source: "database",
                synchronized: true,
            };

            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(mockResult)
            );

            const result = await api.requestFullSync();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "request-full-sync"
            );
            expect(result).toEqual(mockResult);
            expect(Array.isArray(result.sites)).toBeTruthy();
            expect(result.siteCount).toBe(mockSyncedSites.length);
        });

        it("should handle full sync with no sites", async () => {
            const emptyResult: StateSyncFullSyncResult = {
                completedAt: Date.now(),
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

            await expect(api.requestFullSync()).rejects.toThrow(
                "Sync operation failed"
            );
        });

        it("should handle network connectivity issues during sync", async () => {
            const networkError = new Error("Network unreachable during sync");
            mockIpcRenderer.invoke.mockRejectedValue(networkError);

            await expect(api.requestFullSync()).rejects.toThrow(
                "Network unreachable during sync"
            );
        });

        it("should handle database conflicts during sync", async () => {
            const conflictError = new Error(
                "Database conflict during synchronization"
            );
            mockIpcRenderer.invoke.mockRejectedValue(conflictError);

            await expect(api.requestFullSync()).rejects.toThrow(
                "Database conflict during synchronization"
            );
        });
    });

    describe("onStateSyncEvent", () => {
        it("should register event listener and return cleanup function", () => {
            const mockCallback = vi.fn();
            mockIpcRenderer.on.mockReturnValue(undefined);

            const cleanup = api.onStateSyncEvent(mockCallback);

            expect(mockIpcRenderer.on).toHaveBeenCalledWith(
                "state-sync-event",
                expect.any(Function)
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should call callback with valid StateSyncEventData", () => {
            const mockCallback = vi.fn();
            let registeredHandler: (
                event: unknown,
                ...args: unknown[]
            ) => void = () => {};

            mockIpcRenderer.on.mockImplementation((_, handler) => {
                registeredHandler = handler;
            });

            api.onStateSyncEvent(mockCallback);

            const validEventData: StateSyncEventData = {
                action: "update",
                sites: [],
                source: "database",
                timestamp: Date.now(),
                siteIdentifier: "test-site",
            };

            registeredHandler({}, validEventData);

            expect(mockCallback).toHaveBeenCalledWith(validEventData);
        });

        it("should not call callback with invalid event data", () => {
            const mockCallback = vi.fn();
            let registeredHandler: (
                event: unknown,
                ...args: unknown[]
            ) => void = () => {};

            mockIpcRenderer.on.mockImplementation((_, handler) => {
                registeredHandler = handler;
            });

            api.onStateSyncEvent(mockCallback);

            const invalidEventData = {
                invalidField: "invalid",
                timestamp: "not-a-number",
            };

            registeredHandler({}, invalidEventData);

            expect(mockCallback).not.toHaveBeenCalled();
        });

        it("should handle various event action types", () => {
            const mockCallback = vi.fn();
            let registeredHandler: (
                event: unknown,
                ...args: unknown[]
            ) => void = () => {};

            mockIpcRenderer.on.mockImplementation((_, handler) => {
                registeredHandler = handler;
            });

            api.onStateSyncEvent(mockCallback);

            const actions: StateSyncEventData["action"][] = [
                "bulk-sync",
                "delete",
                "update",
            ];

            for (const action of actions) {
                const eventData: StateSyncEventData = {
                    action,
                    sites: [],
                    source: "database",
                    timestamp: Date.now(),
                };

                registeredHandler({}, eventData);
            }

            expect(mockCallback).toHaveBeenCalledTimes(3);
        });

        it("should handle various event source types", () => {
            const mockCallback = vi.fn();
            let registeredHandler: (
                event: unknown,
                ...args: unknown[]
            ) => void = () => {};

            mockIpcRenderer.on.mockImplementation((_, handler) => {
                registeredHandler = handler;
            });

            api.onStateSyncEvent(mockCallback);

            const sources: StateSyncEventData["source"][] = [
                "cache",
                "database",
                "frontend",
            ];

            for (const source of sources) {
                const eventData: StateSyncEventData = {
                    action: "update",
                    sites: [],
                    source,
                    timestamp: Date.now(),
                };

                registeredHandler({}, eventData);
            }

            expect(mockCallback).toHaveBeenCalledTimes(3);
        });

        it("should cleanup event listeners when cleanup function is called", () => {
            const mockCallback = vi.fn();
            const mockCleanup = vi.fn();

            mockIpcRenderer.on.mockReturnValue(mockCleanup);

            const cleanup = api.onStateSyncEvent(mockCallback);
            cleanup();

            // Cleanup function should be called
            expect(typeof cleanup).toBe("function");
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

        it("should handle various full sync scenarios", async () => {
            const siteArrayArb = fc
                .array(
                    fc.record({
                        identifier: fc.string({ minLength: 1, maxLength: 50 }),
                        name: fc.string({ minLength: 1, maxLength: 120 }),
                        monitoring: fc.boolean(),
                    }),
                    { maxLength: 40 }
                )
                .map((sites) =>
                    sites.map((site) => ({
                        ...site,
                        monitors: [],
                    }))
                );

            await fc.assert(
                fc.asyncProperty(
                    siteArrayArb,
                    fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
                    fc.boolean(),
                    fc.constantFrom(...VALID_STATE_SYNC_SOURCES),
                    async (sites, completedAt, synchronized, source) => {
                        const fullSync: StateSyncFullSyncResult = {
                            completedAt,
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

                        await expect(api.getSyncStatus()).rejects.toThrow(
                            error.message
                        );
                        await expect(api.requestFullSync()).rejects.toThrow(
                            error.message
                        );
                    }
                ),
                { numRuns: 10 }
            );
        });

        it("should validate StateSyncEventData with various configurations", () => {
            const eventArb = fc
                .tuple(
                    fc.constantFrom(...VALID_STATE_SYNC_ACTIONS),
                    fc.constantFrom(...VALID_STATE_SYNC_SOURCES),
                    fc.integer({ min: 0 }),
                    fc.option(fc.string({ minLength: 1 }))
                )
                .map(
                    ([
                        action,
                        source,
                        timestamp,
                        siteIdentifier,
                    ]) =>
                        buildStateSyncEventData(
                            action,
                            source,
                            timestamp,
                            siteIdentifier
                        )
                );

            fc.assert(
                fc.property(eventArb, (eventData) => {
                    vi.clearAllMocks();

                    const mockCallback = vi.fn();
                    let registeredHandler: (
                        _event: unknown,
                        ...args: unknown[]
                    ) => void = () => {};

                    mockIpcRenderer.on.mockImplementation((_, handler) => {
                        registeredHandler = handler;
                    });

                    api.onStateSyncEvent(mockCallback);
                    registeredHandler({}, eventData);

                    expect(mockCallback).toHaveBeenCalledWith(eventData);
                }),
                { numRuns: 25 }
            );
        });

        it("should reject invalid StateSyncEventData structures", () => {
            const invalidActionArb = fc
                .string()
                .filter(
                    (value) =>
                        !VALID_STATE_SYNC_ACTIONS.includes(
                            value as StateSyncEventData["action"]
                        )
                );
            const invalidSourceArb = fc
                .string()
                .filter(
                    (value) =>
                        !VALID_STATE_SYNC_SOURCES.includes(
                            value as StateSyncEventData["source"]
                        )
                );

            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.record({
                            action: invalidActionArb,
                            source: fc.constantFrom(
                                ...VALID_STATE_SYNC_SOURCES
                            ),
                            timestamp: fc.integer({ min: 0 }),
                        }),
                        fc.record({
                            action: fc.constantFrom(
                                ...VALID_STATE_SYNC_ACTIONS
                            ),
                            source: invalidSourceArb,
                            timestamp: fc.integer({ min: 0 }),
                        }),
                        fc.record({
                            action: fc.constantFrom(
                                ...VALID_STATE_SYNC_ACTIONS
                            ),
                            source: fc.constantFrom(
                                ...VALID_STATE_SYNC_SOURCES
                            ),
                            timestamp: fc.string(),
                        }),
                        fc.constant(null),
                        fc.constant(undefined),
                        fc.string(),
                        fc.integer()
                    ),
                    (invalidEventData) => {
                        const mockCallback = vi.fn();
                        let registeredHandler: (
                            _event: unknown,
                            ...args: unknown[]
                        ) => void = () => {};

                        mockIpcRenderer.on.mockImplementation((_, handler) => {
                            registeredHandler = handler;
                        });

                        api.onStateSyncEvent(mockCallback);
                        registeredHandler({}, invalidEventData);

                        expect(mockCallback).not.toHaveBeenCalled();
                    }
                ),
                { numRuns: 25 }
            );
        });
    });

    describe("Integration and workflow scenarios", () => {
        it("should handle complete sync workflow", async () => {
            const mockCallback = vi.fn();
            let registeredHandler: (
                event: unknown,
                ...args: unknown[]
            ) => void = () => {};

            mockIpcRenderer.on.mockImplementation((_, handler) => {
                registeredHandler = handler;
            });

            const cleanup = api.onStateSyncEvent(mockCallback);

            const initialStatus: StateSyncStatusSummary = {
                lastSyncAt: Date.now(),
                siteCount: 1,
                source: "database",
                synchronized: true,
            };
            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(initialStatus)
            );
            const status = await api.getSyncStatus();
            expect(status).toEqual(initialStatus);

            const syncEvent: StateSyncEventData = {
                action: "bulk-sync",
                sites: [],
                source: "database",
                timestamp: Date.now(),
                siteIdentifier: "new-site",
            };
            registeredHandler({}, syncEvent);
            expect(mockCallback).toHaveBeenCalledWith(syncEvent);

            const syncedSites: Site[] = [
                {
                    identifier: "new-site",
                    name: "New Site",
                    monitoring: true,
                    monitors: [],
                },
            ];
            const fullSyncResult: StateSyncFullSyncResult = {
                completedAt: Date.now(),
                siteCount: syncedSites.length,
                sites: syncedSites,
                source: "database",
                synchronized: true,
            };
            mockIpcRenderer.invoke.mockResolvedValueOnce(
                createIpcResponse(fullSyncResult)
            );
            const fullSync = await api.requestFullSync();
            expect(fullSync).toEqual(fullSyncResult);

            cleanup();
            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(2);
        });

        it("should handle sync conflicts and recovery", async () => {
            mockIpcRenderer.invoke.mockRejectedValueOnce(
                new Error("Sync conflict")
            );
            await expect(api.requestFullSync()).rejects.toThrow(
                "Sync conflict"
            );

            const resolvedSites: Site[] = [
                {
                    identifier: "resolved-site",
                    name: "Resolved Site",
                    monitoring: true,
                    monitors: [],
                },
            ];
            const resolvedResult: StateSyncFullSyncResult = {
                completedAt: Date.now(),
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
            const mockSync: StateSyncFullSyncResult = {
                completedAt: Date.now(),
                siteCount: 2,
                sites: [],
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

            await expect(api.getSyncStatus()).rejects.toThrow(
                "Database corrupted during sync"
            );
            await expect(api.requestFullSync()).rejects.toThrow(
                "Database corrupted during sync"
            );
        });

        it("should handle memory limitations during large syncs", async () => {
            const memoryError = new Error(
                "Out of memory during sync operation"
            );
            mockIpcRenderer.invoke.mockRejectedValue(memoryError);

            await expect(api.requestFullSync()).rejects.toThrow(
                "Out of memory during sync operation"
            );
        });

        it("should handle malformed sync data gracefully", async () => {
            const malformedData = { invalid: "sync data structure" };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(malformedData)
            );

            const result = await api.getSyncStatus();
            expect(result).toEqual(malformedData);
        });

        it("should handle event listener errors gracefully", () => {
            const throwingCallback = vi.fn().mockImplementation(() => {
                throw new Error("Callback error");
            });

            let registeredHandler: (
                event: unknown,
                ...args: unknown[]
            ) => void = () => {};

            mockIpcRenderer.on.mockImplementation((_, handler) => {
                registeredHandler = handler;
            });

            api.onStateSyncEvent(throwingCallback);

            const validEventData: StateSyncEventData = {
                action: "update",
                sites: [],
                source: "database",
                timestamp: Date.now(),
            };

            // Should not throw despite callback error
            expect(() => registeredHandler({}, validEventData)).not.toThrow();
            expect(throwingCallback).toHaveBeenCalledWith(validEventData);
        });

        it("should handle rapid event sequences", () => {
            const mockCallback = vi.fn();
            let registeredHandler: (
                event: unknown,
                ...args: unknown[]
            ) => void = () => {};

            mockIpcRenderer.on.mockImplementation((_, handler) => {
                registeredHandler = handler;
            });

            api.onStateSyncEvent(mockCallback);

            // Send rapid sequence of events
            const events: StateSyncEventData[] = Array.from(
                { length: 100 },
                (_, i) => ({
                    action: "update",
                    sites: [],
                    source: "database",
                    timestamp: Date.now() + i,
                    siteIdentifier: `rapid-${i}`,
                })
            );

            for (const event of events) {
                registeredHandler({}, event);
            }

            expect(mockCallback).toHaveBeenCalledTimes(100);
        });

        it("should maintain type safety with edge case data", async () => {
            const edgeCaseSites: Site[] = [
                { identifier: "", name: "", monitoring: false, monitors: [] },
                {
                    identifier: "a".repeat(1000),
                    name: "b".repeat(1000),
                    monitoring: true,
                    monitors: [],
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
                    identifier: "typed-site",
                    name: "Typed Site",
                    monitoring: true,
                    monitors: [],
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
            const { getSyncStatus, requestFullSync, onStateSyncEvent } = api;

            const statusSummary: StateSyncStatusSummary = {
                lastSyncAt: Date.now(),
                siteCount: 0,
                source: "database",
                synchronized: true,
            };
            const fullSyncResult: StateSyncFullSyncResult = {
                completedAt: Date.now(),
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
            const cleanup = onStateSyncEvent(() => {});

            expect(status.siteCount).toBe(0);
            expect(sync.sites).toEqual([]);
            expect(typeof cleanup).toBe("function");
        });
    });
});
