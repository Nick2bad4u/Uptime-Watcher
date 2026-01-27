import { describe, expect, it, vi } from "vitest";

import type { Monitor, Site } from "@shared/types";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { DatabaseService } from "../../services/database/DatabaseService";
import type { MonitorRepository } from "../../services/database/MonitorRepository";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";

vi.mock("../../utils/operationalHooks", () => ({
    withDatabaseOperation: async <T>(
        operation: () => Promise<T>,
        _operationName: string,
        _eventEmitter: unknown,
        _context: unknown
    ) => operation(),
}));

import { applyMonitorStateOperation } from "../../managers/monitorManager/applyMonitorStateOperation";

import {
    createMockEventBus,
    createMockStandardizedCache,
    createTestMonitor,
    createTestSite,
} from "../utils/enhanced-testUtilities";

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
                .mockImplementation(async (fn: (db: unknown) => Promise<void>) => {
                    await fn({});
                }),
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
        expect(update).toHaveBeenCalledWith("m1", changes);

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
                .mockImplementation(async (fn: (db: unknown) => Promise<void>) => {
                    await fn({});
                }),
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
});
