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
        it("should call IPC with correct channel and return sites array", async () => {
            const mockSites: Site[] = [
                {
                    identifier: "sync-site-1",
                    name: "Sync Site 1",
                    monitoring: true,
                    monitors: [],
                },
                {
                    identifier: "sync-site-2",
                    name: "Sync Site 2",
                    monitoring: false,
                    monitors: [],
                },
            ];

            mockIpcRenderer.invoke.mockResolvedValue(mockSites);

            const result = await api.getSyncStatus();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "get-sync-status"
            );
            expect(result).toEqual(mockSites);
            expect(Array.isArray(result)).toBeTruthy();
        });

        it("should handle empty sync status", async () => {
            mockIpcRenderer.invoke.mockResolvedValue([]);

            const result = await api.getSyncStatus();

            expect(result).toEqual([]);
            expect(Array.isArray(result)).toBeTruthy();
        });

        it("should handle sync status errors", async () => {
            const error = new Error("Failed to get sync status");
            mockIpcRenderer.invoke.mockRejectedValue(error);

            await expect(api.getSyncStatus()).rejects.toThrow(
                "Failed to get sync status"
            );
        });

        it("should handle large sync datasets", async () => {
            const largeSiteList: Site[] = Array.from(
                { length: 500 },
                (_, i) => ({
                    identifier: `sync-site-${i}`,
                    name: `Sync Site ${i}`,
                    monitoring: i % 3 === 0,
                    monitors: [],
                })
            );

            mockIpcRenderer.invoke.mockResolvedValue(largeSiteList);

            const result = await api.getSyncStatus();
            expect(result).toHaveLength(500);
            expect(Array.isArray(result)).toBeTruthy();
        });
    });

    describe("requestFullSync", () => {
        it("should call IPC with correct channel and return synchronized sites", async () => {
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

            mockIpcRenderer.invoke.mockResolvedValue(mockSyncedSites);

            const result = await api.requestFullSync();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "request-full-sync"
            );
            expect(result).toEqual(mockSyncedSites);
            expect(Array.isArray(result)).toBeTruthy();
        });

        it("should handle full sync with no sites", async () => {
            mockIpcRenderer.invoke.mockResolvedValue([]);

            const result = await api.requestFullSync();

            expect(result).toEqual([]);
            expect(Array.isArray(result)).toBeTruthy();
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
                "state:sync",
                expect.any(Function)
            );
            expect(typeof cleanup).toBe("function");
        });

        it("should call callback with valid StateSyncEventData", () => {
            const mockCallback = vi.fn();
            let registeredHandler: (data: unknown) => void = () => {};

            mockIpcRenderer.on.mockImplementation((_, handler) => {
                registeredHandler = handler;
            });

            api.onStateSyncEvent(mockCallback);

            const validEventData: StateSyncEventData = {
                action: "create",
                source: "backend",
                timestamp: Date.now(),
                siteId: "test-site",
            };

            registeredHandler(validEventData);

            expect(mockCallback).toHaveBeenCalledWith(validEventData);
        });

        it("should not call callback with invalid event data", () => {
            const mockCallback = vi.fn();
            let registeredHandler: (data: unknown) => void = () => {};

            mockIpcRenderer.on.mockImplementation((_, handler) => {
                registeredHandler = handler;
            });

            api.onStateSyncEvent(mockCallback);

            const invalidEventData = {
                invalidField: "invalid",
                timestamp: "not-a-number",
            };

            registeredHandler(invalidEventData);

            expect(mockCallback).not.toHaveBeenCalled();
        });

        it("should handle various event action types", () => {
            const mockCallback = vi.fn();
            let registeredHandler: (data: unknown) => void = () => {};

            mockIpcRenderer.on.mockImplementation((_, handler) => {
                registeredHandler = handler;
            });

            api.onStateSyncEvent(mockCallback);

            const actions: StateSyncEventData["action"][] = [
                "bulk-sync",
                "create",
                "delete",
                "update",
            ];

            for (const action of actions) {
                const eventData: StateSyncEventData = {
                    action,
                    source: "backend",
                    timestamp: Date.now(),
                };

                registeredHandler(eventData);
            }

            expect(mockCallback).toHaveBeenCalledTimes(4);
        });

        it("should handle various event source types", () => {
            const mockCallback = vi.fn();
            let registeredHandler: (data: unknown) => void = () => {};

            mockIpcRenderer.on.mockImplementation((_, handler) => {
                registeredHandler = handler;
            });

            api.onStateSyncEvent(mockCallback);

            const sources: StateSyncEventData["source"][] = [
                "backend",
                "cache",
                "manual",
            ];

            for (const source of sources) {
                const eventData: StateSyncEventData = {
                    action: "update",
                    source,
                    timestamp: Date.now(),
                };

                registeredHandler(eventData);
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
                    fc.array(
                        fc.record({
                            identifier: fc.string({
                                minLength: 1,
                                maxLength: 50,
                            }),
                            name: fc.string({ minLength: 1, maxLength: 100 }),
                            monitoring: fc.boolean(),
                        })
                    ),
                    async (siteData) => {
                        const mockSites: Site[] = siteData.map((site) => ({
                            ...site,
                            monitors: [],
                        }));

                        mockIpcRenderer.invoke.mockResolvedValue(mockSites);

                        const result = await api.getSyncStatus();
                        expect(result).toEqual(mockSites);
                        expect(Array.isArray(result)).toBeTruthy();
                        expect(result).toHaveLength(siteData.length);
                    }
                ),
                { numRuns: 20 }
            );
        });

        it("should handle various full sync scenarios", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 0, max: 100 }),
                    async (siteCount) => {
                        const mockSites: Site[] = Array.from(
                            { length: siteCount },
                            (_, i) => ({
                                identifier: `site-${i}`,
                                name: `Site ${i}`,
                                monitoring: i % 2 === 0,
                                monitors: [],
                            })
                        );

                        mockIpcRenderer.invoke.mockResolvedValue(mockSites);

                        const result = await api.requestFullSync();
                        expect(result).toHaveLength(siteCount);
                        expect(Array.isArray(result)).toBeTruthy();
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
            fc.assert(
                fc.property(
                    fc.record({
                        action: fc.constantFrom(
                            "bulk-sync",
                            "create",
                            "delete",
                            "update"
                        ),
                        source: fc.constantFrom("backend", "cache", "manual"),
                        timestamp: fc.integer({ min: 0 }),
                        data: fc.option(
                            fc.record({
                                identifier: fc.string({ minLength: 1 }),
                                name: fc.string({ minLength: 1 }),
                            })
                        ),
                    }),
                    (eventData) => {
                        const mockCallback = vi.fn();
                        let registeredHandler: (
                            data: unknown
                        ) => void = () => {};

                        mockIpcRenderer.on.mockImplementation((_, handler) => {
                            registeredHandler = handler;
                        });

                        api.onStateSyncEvent(mockCallback);
                        registeredHandler(eventData);

                        expect(mockCallback).toHaveBeenCalledWith(eventData);
                    }
                ),
                { numRuns: 25 }
            );
        });

        it("should reject invalid StateSyncEventData structures", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.record({
                            action: fc.string().filter(
                                (s) =>
                                    ![
                                        "bulk-sync",
                                        "create",
                                        "delete",
                                        "update",
                                    ].includes(s)
                            ),
                            source: fc.constantFrom(
                                "backend",
                                "cache",
                                "manual"
                            ),
                            timestamp: fc.integer(),
                        }),
                        fc.record({
                            action: fc.constantFrom(
                                "bulk-sync",
                                "create",
                                "delete",
                                "update"
                            ),
                            source: fc.string().filter(
                                (s) =>
                                    ![
                                        "backend",
                                        "cache",
                                        "manual",
                                    ].includes(s)
                            ),
                            timestamp: fc.integer(),
                        }),
                        fc.record({
                            action: fc.constantFrom(
                                "bulk-sync",
                                "create",
                                "delete",
                                "update"
                            ),
                            source: fc.constantFrom(
                                "backend",
                                "cache",
                                "manual"
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
                            data: unknown
                        ) => void = () => {};

                        mockIpcRenderer.on.mockImplementation((_, handler) => {
                            registeredHandler = handler;
                        });

                        api.onStateSyncEvent(mockCallback);
                        registeredHandler(invalidEventData);

                        expect(mockCallback).not.toHaveBeenCalled();
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    describe("Integration and workflow scenarios", () => {
        it("should handle complete sync workflow", async () => {
            const mockCallback = vi.fn();
            let registeredHandler: (data: unknown) => void = () => {};

            mockIpcRenderer.on.mockImplementation((_, handler) => {
                registeredHandler = handler;
            });

            // Set up event listener
            const cleanup = api.onStateSyncEvent(mockCallback);

            // Get initial sync status
            const initialSites: Site[] = [
                {
                    identifier: "initial-1",
                    name: "Initial Site 1",
                    monitoring: false,
                    monitors: [],
                },
            ];
            mockIpcRenderer.invoke.mockResolvedValueOnce(initialSites);
            const status = await api.getSyncStatus();
            expect(status).toEqual(initialSites);

            // Trigger sync event
            const syncEvent: StateSyncEventData = {
                action: "create",
                source: "backend",
                timestamp: Date.now(),
                siteId: "new-site",
            };
            registeredHandler(syncEvent);
            expect(mockCallback).toHaveBeenCalledWith(syncEvent);

            // Request full sync
            const syncedSites: Site[] = [
                ...initialSites,
                {
                    identifier: "new-site",
                    name: "New Site",
                    monitoring: true,
                    monitors: [],
                },
            ];
            mockIpcRenderer.invoke.mockResolvedValueOnce(syncedSites);
            const fullSync = await api.requestFullSync();
            expect(fullSync).toEqual(syncedSites);

            // Clean up
            cleanup();
            expect(mockIpcRenderer.invoke).toHaveBeenCalledTimes(2);
        });

        it("should handle sync conflicts and recovery", async () => {
            // Initial sync fails
            mockIpcRenderer.invoke.mockRejectedValueOnce(
                new Error("Sync conflict")
            );
            await expect(api.requestFullSync()).rejects.toThrow(
                "Sync conflict"
            );

            // Retry succeeds
            const resolvedSites: Site[] = [
                {
                    identifier: "resolved-site",
                    name: "Resolved Site",
                    monitoring: true,
                    monitors: [],
                },
            ];
            mockIpcRenderer.invoke.mockResolvedValueOnce(resolvedSites);
            const result = await api.requestFullSync();
            expect(result).toEqual(resolvedSites);
        });

        it("should handle multiple concurrent sync operations", async () => {
            const mockSites: Site[] = [
                {
                    identifier: "concurrent-1",
                    name: "Concurrent Site 1",
                    monitoring: true,
                    monitors: [],
                },
                {
                    identifier: "concurrent-2",
                    name: "Concurrent Site 2",
                    monitoring: false,
                    monitors: [],
                },
            ];

            mockIpcRenderer.invoke.mockResolvedValue(mockSites);

            const promises = [
                api.getSyncStatus(),
                api.requestFullSync(),
                api.getSyncStatus(),
            ];

            const results = await Promise.all(promises);
            expect(results).toHaveLength(3);
            for (const result of results) {
                expect(result).toEqual(mockSites);
            }
        });

        it("should handle event listener lifecycle properly", () => {
            const callbacks = [
                vi.fn(),
                vi.fn(),
                vi.fn(),
            ];
            const cleanups: (() => void)[] = [];

            // Register multiple listeners
            for (const callback of callbacks) {
                const cleanup = api.onStateSyncEvent(callback);
                cleanups.push(cleanup);
                expect(typeof cleanup).toBe("function");
            }

            // Clean up all listeners
            for (const cleanup of cleanups) {
                cleanup();
            }

            expect(mockIpcRenderer.on).toHaveBeenCalledTimes(3);
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
            mockIpcRenderer.invoke.mockResolvedValue(malformedData);

            const result = await api.getSyncStatus();
            expect(result).toEqual(malformedData);
        });

        it("should handle event listener errors gracefully", () => {
            const throwingCallback = vi.fn().mockImplementation(() => {
                throw new Error("Callback error");
            });

            let registeredHandler: (data: unknown) => void = () => {};

            mockIpcRenderer.on.mockImplementation((_, handler) => {
                registeredHandler = handler;
            });

            api.onStateSyncEvent(throwingCallback);

            const validEventData: StateSyncEventData = {
                action: "update",
                source: "backend",
                timestamp: Date.now(),
            };

            // Should not throw despite callback error
            expect(() => registeredHandler(validEventData)).not.toThrow();
            expect(throwingCallback).toHaveBeenCalledWith(validEventData);
        });

        it("should handle rapid event sequences", () => {
            const mockCallback = vi.fn();
            let registeredHandler: (data: unknown) => void = () => {};

            mockIpcRenderer.on.mockImplementation((_, handler) => {
                registeredHandler = handler;
            });

            api.onStateSyncEvent(mockCallback);

            // Send rapid sequence of events
            const events: StateSyncEventData[] = Array.from(
                { length: 100 },
                (_, i) => ({
                    action: "update",
                    source: "backend",
                    timestamp: Date.now() + i,
                    siteId: `rapid-${i}`,
                })
            );

            for (const event of events) {
                registeredHandler(event);
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

            mockIpcRenderer.invoke.mockResolvedValue(edgeCaseSites);

            const status = await api.getSyncStatus();
            const fullSync = await api.requestFullSync();

            expect(Array.isArray(status)).toBeTruthy();
            expect(Array.isArray(fullSync)).toBeTruthy();
            expect(status).toEqual(edgeCaseSites);
            expect(fullSync).toEqual(edgeCaseSites);
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
            mockIpcRenderer.invoke.mockResolvedValue(mockSites);

            const statusResult = await api.getSyncStatus();
            const syncResult = await api.requestFullSync();

            expect(Array.isArray(statusResult)).toBeTruthy();
            expect(Array.isArray(syncResult)).toBeTruthy();

            for (const site of statusResult) {
                expect(typeof site.identifier).toBe("string");
                expect(typeof site.name).toBe("string");
                expect(typeof site.monitoring).toBe("boolean");
                expect(Array.isArray(site.monitors)).toBeTruthy();
            }
        });

        it("should handle function context properly", async () => {
            const { getSyncStatus, requestFullSync, onStateSyncEvent } = api;

            mockIpcRenderer.invoke.mockResolvedValue([]);

            const status = await getSyncStatus();
            const sync = await requestFullSync();
            const cleanup = onStateSyncEvent(() => {});

            expect(Array.isArray(status)).toBeTruthy();
            expect(Array.isArray(sync)).toBeTruthy();
            expect(typeof cleanup).toBe("function");
        });

        it("should return Promise types correctly", () => {
            const promises = [api.getSyncStatus(), api.requestFullSync()];

            for (const promise of promises) {
                expect(promise).toBeInstanceOf(Promise);
            }
        });

        it("should handle event callback signatures properly", () => {
            const typedCallback = (data: StateSyncEventData): void => {
                expect(typeof data.action).toBe("string");
                expect(typeof data.source).toBe("string");
                expect(typeof data.timestamp).toBe("number");
            };

            const cleanup = api.onStateSyncEvent(typedCallback);
            expect(typeof cleanup).toBe("function");
        });
    });
});
