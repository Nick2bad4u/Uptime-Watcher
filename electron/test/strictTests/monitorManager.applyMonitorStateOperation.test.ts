import type { Monitor, Site } from "@shared/types";

import { describe, expect, it, vi } from "vitest";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { DatabaseService } from "../../services/database/DatabaseService";
import type { MonitorRepository } from "../../services/database/MonitorRepository";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";

import { applyMonitorStateOperation } from "../../managers/monitorManager/applyMonitorStateOperation";
import {
    createMockEventBus,
    createMockStandardizedCache,
    createTestMonitor,
    createTestSite,
} from "../utils/enhanced-testUtilities";

vi.mock("../../utils/operationalHooks", () => ({
    withDatabaseOperation: async <T>(
        operation: () => Promise<T>,
        _operationName: string,
        _eventEmitter: unknown,
        _context: unknown
    ) => operation(),
}));

describe(applyMonitorStateOperation, () => {
    it("updates cache, persists changes, and emits status-changed when the monitor exists in the site", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2020-01-01T00:00:00.000Z"));

        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;
        const sitesCache =
            createMockStandardizedCache<Site>() as unknown as StandardizedCache<Site>;

        const monitor = createTestMonitor("m1", {
            monitoring: false,
            responseTime: 123,
            status: "down",
        });

        const site = createTestSite("s1", {
            monitors: [monitor],
        });

        const update = vi.fn();
        const monitorRepository = {
            createTransactionAdapter: vi.fn().mockReturnValue({ update }),
        } as unknown as MonitorRepository;

        const databaseService = {
            executeTransaction: vi
                .fn()
                .mockImplementation(
                    async (fn: (db: unknown) => Promise<void>) => {
                        await fn({});
                    }
                ),
        } as unknown as DatabaseService;

        const changes: Partial<Monitor> = {
            monitoring: true,
        };

        await applyMonitorStateOperation({
            changes,
            dependencies: {
                databaseService,
                eventEmitter,
                monitorRepository,
                sitesCache,
            },
            monitor,
            newStatus: "up",
            site,
        });

        expect(monitor.monitoring).toBeTruthy();
        expect(site.monitors[0]?.monitoring).toBeTruthy();

        expect(sitesCache.set).toHaveBeenCalledWith("s1", site);
        expect(update).toHaveBeenCalledWith("m1", { monitoring: true });

        expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
            "monitor:status-changed",
            expect.objectContaining({
                monitorId: "m1",
                previousStatus: "down",
                status: "up",
                siteIdentifier: "s1",
                timestamp: "2020-01-01T00:00:00.000Z",
            })
        );

        vi.useRealTimers();
    });

    it("still persists and emits even when the monitor is not present in the site array", async () => {
        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;
        const sitesCache =
            createMockStandardizedCache<Site>() as unknown as StandardizedCache<Site>;

        const monitor = createTestMonitor("m1", {
            monitoring: false,
            status: "pending",
        });

        const site = createTestSite("s1", {
            monitors: [createTestMonitor("other")],
        });

        const update = vi.fn();
        const monitorRepository = {
            createTransactionAdapter: vi.fn().mockReturnValue({ update }),
        } as unknown as MonitorRepository;

        const databaseService = {
            executeTransaction: vi
                .fn()
                .mockImplementation(
                    async (fn: (db: unknown) => Promise<void>) => {
                        await fn({});
                    }
                ),
        } as unknown as DatabaseService;

        await applyMonitorStateOperation({
            changes: { monitoring: true },
            dependencies: {
                databaseService,
                eventEmitter,
                monitorRepository,
                sitesCache,
            },
            monitor,
            newStatus: "up",
            site,
        });

        expect(update).toHaveBeenCalledWith("m1", { monitoring: true });
        expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
            "monitor:status-changed",
            expect.any(Object)
        );
    });

    it("ignores accessor-backed and identity state changes", async () => {
        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;
        const sitesCache =
            createMockStandardizedCache<Site>() as unknown as StandardizedCache<Site>;

        const monitor = createTestMonitor("m1", {
            monitoring: false,
            responseTime: 123,
            status: "down",
        });
        const site = createTestSite("s1", {
            monitors: [monitor],
        });

        const update = vi.fn();
        const monitorRepository = {
            createTransactionAdapter: vi.fn().mockReturnValue({ update }),
        } as unknown as MonitorRepository;

        const databaseService = {
            executeTransaction: vi
                .fn()
                .mockImplementation(
                    async (fn: (db: unknown) => Promise<void>) => {
                        await fn({});
                    }
                ),
        } as unknown as DatabaseService;

        const statusGetter = vi.fn(() => {
            throw new Error("status getter should not run");
        });
        const changes: Partial<Monitor> = { monitoring: true };

        Object.defineProperty(changes, "id", {
            enumerable: true,
            value: "different-monitor",
        });
        Object.defineProperty(changes, "status", {
            enumerable: true,
            get: statusGetter,
        });

        await applyMonitorStateOperation({
            changes,
            dependencies: {
                databaseService,
                eventEmitter,
                monitorRepository,
                sitesCache,
            },
            monitor,
            newStatus: "up",
            site,
        });

        expect(statusGetter).not.toHaveBeenCalled();
        expect(monitor.id).toBe("m1");
        expect(monitor.monitoring).toBeTruthy();
        expect(monitor.status).toBe("down");
        expect(update).toHaveBeenCalledWith("m1", { monitoring: true });
        expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
            "monitor:status-changed",
            expect.objectContaining({
                monitor: expect.objectContaining({
                    id: "m1",
                    monitoring: true,
                    status: "down",
                }),
                monitorId: "m1",
                previousStatus: "down",
                status: "up",
            })
        );
    });

    it("does not mutate cache state or emit when persistence fails", async () => {
        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;
        const sitesCache =
            createMockStandardizedCache<Site>() as unknown as StandardizedCache<Site>;

        const monitor = createTestMonitor("m1", {
            monitoring: false,
            responseTime: 123,
            status: "down",
        });
        const site = createTestSite("s1", {
            monitors: [monitor],
        });
        const databaseError = new Error("database unavailable");

        const update = vi.fn(() => {
            throw databaseError;
        });
        const monitorRepository = {
            createTransactionAdapter: vi.fn().mockReturnValue({ update }),
        } as unknown as MonitorRepository;

        const databaseService = {
            executeTransaction: vi
                .fn()
                .mockImplementation(
                    async (fn: (db: unknown) => Promise<void>) => {
                        await fn({});
                    }
                ),
        } as unknown as DatabaseService;

        await expect(
            applyMonitorStateOperation({
                changes: { monitoring: true, status: "up" },
                dependencies: {
                    databaseService,
                    eventEmitter,
                    monitorRepository,
                    sitesCache,
                },
                monitor,
                newStatus: "up",
                site,
            })
        ).rejects.toThrow(databaseError);

        expect(monitor.monitoring).toBeFalsy();
        expect(monitor.status).toBe("down");
        expect(site.monitors[0]).toBe(monitor);
        expect(site.monitors[0]?.monitoring).toBeFalsy();
        expect(site.monitors[0]?.status).toBe("down");
        expect(sitesCache.set).not.toHaveBeenCalled();
        expect(eventEmitter.emitTyped).not.toHaveBeenCalled();
    });

    it("drops reserved prototype keys before mutating cache or persisting changes", async () => {
        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;
        const sitesCache =
            createMockStandardizedCache<Site>() as unknown as StandardizedCache<Site>;

        const monitor = createTestMonitor("m1", {
            monitoring: false,
            status: "down",
        });
        const originalPrototype = Object.getPrototypeOf(monitor);
        const site = createTestSite("s1", {
            monitors: [monitor],
        });

        const update = vi.fn();
        const monitorRepository = {
            createTransactionAdapter: vi.fn().mockReturnValue({ update }),
        } as unknown as MonitorRepository;

        const databaseService = {
            executeTransaction: vi
                .fn()
                .mockImplementation(
                    async (fn: (db: unknown) => Promise<void>) => {
                        await fn({});
                    }
                ),
        } as unknown as DatabaseService;

        const changes: Partial<Monitor> = { monitoring: true };
        Object.defineProperty(changes, "__proto__", {
            enumerable: true,
            value: { polluted: true },
        });
        Object.defineProperty(changes, "constructor", {
            enumerable: true,
            value: "unsafe-constructor",
        });
        Object.defineProperty(changes, "prototype", {
            enumerable: true,
            value: "unsafe-prototype",
        });

        await applyMonitorStateOperation({
            changes,
            dependencies: {
                databaseService,
                eventEmitter,
                monitorRepository,
                sitesCache,
            },
            monitor,
            newStatus: "up",
            site,
        });

        expect(Object.getPrototypeOf(monitor)).toBe(originalPrototype);
        expect(Object.hasOwn(monitor, "__proto__")).toBe(false);
        expect(Object.hasOwn(monitor, "constructor")).toBe(false);
        expect(Object.hasOwn(monitor, "prototype")).toBe(false);
        expect(monitor.monitoring).toBeTruthy();

        const persistedChanges = update.mock.calls[0]?.[1] as object;
        expect(Reflect.ownKeys(persistedChanges)).toEqual(["monitoring"]);
        expect(update).toHaveBeenCalledWith("m1", { monitoring: true });
    });
});
