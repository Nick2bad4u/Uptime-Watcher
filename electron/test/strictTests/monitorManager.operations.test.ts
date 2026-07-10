import type { Monitor, Site } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import { describe, expect, it, vi } from "vitest";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { EnhancedLifecycleConfig } from "../../managers/MonitorManagerEnhancedLifecycle";
import type { DatabaseService } from "../../services/database/DatabaseService";
import type { MonitorRepository } from "../../services/database/MonitorRepository";
import type { EnhancedMonitoringServices } from "../../services/monitoring/EnhancedMonitoringServiceFactory";
import type { MonitorScheduler } from "../../services/monitoring/MonitorScheduler";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";

import {
    createEnhancedLifecycleConfigOperation,
    createEnhancedLifecycleHostOperation,
} from "../../managers/monitorManager/createEnhancedLifecycle";
import { createMonitorActionDelegate } from "../../managers/monitorManager/createMonitorActionDelegate";
import { handleScheduledCheckOperation } from "../../managers/monitorManager/handleScheduledCheckOperation";
import {
    startMonitoringAllOperation,
    stopMonitoringAllOperation,
} from "../../managers/monitorManager/toggleMonitoringAllOperation";
import { toggleMonitoringForSiteOperation } from "../../managers/monitorManager/toggleMonitoringForSiteOperation";
import {
    startAllMonitoringEnhancedFlow,
    startMonitoringForSiteEnhancedFlow,
    stopMonitoringForSiteEnhancedFlow,
} from "../../managers/MonitorManagerEnhancedLifecycle";
import { monitorLogger } from "../../utils/logger";
import {
    createMockEventBus,
    createMockStandardizedCache,
    createTestMonitor,
    createTestSite,
} from "../utils/enhanced-testUtilities";

const createSiteWithMonitors = (args: {
    readonly identifier: string;
    readonly monitoring: boolean;
    readonly monitors: readonly Pick<Monitor, "id" | "monitoring">[];
}): Site => {
    const monitors = args.monitors.map(({ id, monitoring }) =>
        createTestMonitor(id, { monitoring })
    );

    return createTestSite(args.identifier, {
        monitoring: args.monitoring,
        monitors,
    });
};

const createLifecycleHarness = (site: Site) => {
    const sitesCache =
        createMockStandardizedCache<Site>() as unknown as StandardizedCache<Site>;
    sitesCache.set(site.identifier, site);

    const checker = {
        startMonitoring: vi.fn().mockResolvedValue(true),
        stopMonitoring: vi.fn().mockResolvedValue(true),
    };
    const monitorScheduler = {
        startMonitor: vi.fn().mockReturnValue(true),
        startSite: vi.fn(),
        stopMonitor: vi.fn().mockReturnValue(true),
    };
    const applyMonitorState = vi.fn().mockResolvedValue(undefined);
    const runSequentially = async <TItem>(
        items: readonly TItem[],
        iterator: (item: TItem) => Promise<void>
    ): Promise<void> => {
        for (const item of items) {
            await iterator(item);
        }
    };

    const config = createEnhancedLifecycleConfigOperation({
        databaseService: {} as unknown as DatabaseService,
        eventEmitter:
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>,
        logger: monitorLogger,
        monitorRepository: {} as unknown as MonitorRepository,
        monitorScheduler: monitorScheduler as unknown as MonitorScheduler,
        sites: sitesCache,
    });
    const host = createEnhancedLifecycleHostOperation({
        applyMonitorState,
        runSequentially,
        services: { checker } as unknown as EnhancedMonitoringServices,
    });

    return {
        applyMonitorState,
        checker,
        config,
        host,
        monitorScheduler,
    };
};

describe("monitorManager helper operations", () => {
    it("createEnhancedLifecycleConfigOperation returns injected dependencies", () => {
        const databaseService = {} as unknown as DatabaseService;
        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;
        const logger = {} as unknown as Logger;
        const monitorRepository = {} as unknown as MonitorRepository;
        const monitorScheduler = {} as unknown as MonitorScheduler;
        const sites =
            createMockStandardizedCache<Site>() as unknown as StandardizedCache<Site>;

        const config = createEnhancedLifecycleConfigOperation({
            databaseService,
            eventEmitter,
            logger,
            monitorRepository,
            monitorScheduler,
            sites,
        });

        expect(config).toEqual({
            databaseService,
            eventEmitter,
            logger,
            monitorRepository,
            monitorScheduler,
            sites,
        });
    });

    it("createEnhancedLifecycleHostOperation returns injected dependencies", () => {
        const applyMonitorState = vi.fn();
        const runSequentially = vi.fn();
        const services = {} as unknown as EnhancedMonitoringServices;

        const host = createEnhancedLifecycleHostOperation({
            applyMonitorState,
            runSequentially,
            services,
        });

        expect(host).toEqual({
            applyMonitorState,
            runSequentially,
            services,
        });
    });

    it("createMonitorActionDelegate prevents recursion and forwards unique tuples", async () => {
        const warnSpy = vi
            .spyOn(monitorLogger, "warn")
            .mockImplementation(() => undefined);

        const action = vi
            .fn<(identifier: string, monitorId?: string) => Promise<boolean>>()
            .mockResolvedValue(true);

        const delegate = createMonitorActionDelegate({
            action,
            identifier: "s1",
            logger: monitorLogger,
            monitorId: "m1",
        });

        // Recursion guard for the same tuple as the delegate was created with.
        await expect(delegate("s1", "m1")).resolves.toBeFalsy();
        expect(action).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledTimes(1);

        // Different tuple should be allowed.
        await expect(delegate("s1", "m2")).resolves.toBeTruthy();
        expect(action).toHaveBeenCalledWith("s1", "m2");

        warnSpy.mockRestore();
    });

    it("createMonitorActionDelegate warns with monitorId 'all' when created without a monitorId", async () => {
        const warnSpy = vi
            .spyOn(monitorLogger, "warn")
            .mockImplementation(() => undefined);

        const action = vi
            .fn<(identifier: string, monitorId?: string) => Promise<boolean>>()
            .mockResolvedValue(true);

        const delegate = createMonitorActionDelegate({
            action,
            identifier: "s1",
            logger: monitorLogger,
            monitorId: undefined,
        });

        await expect(delegate("s1", undefined)).resolves.toBeFalsy();
        expect(action).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledTimes(1);

        warnSpy.mockRestore();
    });

    it("startAllMonitoringEnhancedFlow skips monitors with non-finite check intervals", async () => {
        const warnSpy = vi
            .spyOn(monitorLogger, "warn")
            .mockImplementation(() => undefined);

        const site = createTestSite("s1", {
            monitors: [
                createTestMonitor("m1", {
                    checkInterval: Infinity,
                }),
            ],
        });
        const { applyMonitorState, checker, config, host, monitorScheduler } =
            createLifecycleHarness(site);

        const summary = await startAllMonitoringEnhancedFlow({
            config,
            host,
            isMonitoring: false,
        });

        expect(summary).toMatchObject({
            attempted: 0,
            failed: 0,
            isMonitoring: false,
            skipped: 1,
            succeeded: 0,
        });
        expect(checker.startMonitoring).not.toHaveBeenCalled();
        expect(applyMonitorState).not.toHaveBeenCalled();
        expect(monitorScheduler.startSite).not.toHaveBeenCalled();

        warnSpy.mockRestore();
    });

    it("startMonitoringForSiteEnhancedFlow rejects fractional check intervals before scheduling", async () => {
        const warnSpy = vi
            .spyOn(monitorLogger, "warn")
            .mockImplementation(() => undefined);

        const site = createTestSite("s1", {
            monitors: [
                createTestMonitor("m1", {
                    checkInterval: 60_000.5,
                }),
            ],
        });
        const { checker, config, host, monitorScheduler } =
            createLifecycleHarness(site);

        await expect(
            startMonitoringForSiteEnhancedFlow({
                config,
                host,
                identifier: "s1",
                monitorId: "m1",
            })
        ).resolves.toBeFalsy();

        expect(checker.startMonitoring).not.toHaveBeenCalled();
        expect(monitorScheduler.startMonitor).not.toHaveBeenCalled();

        warnSpy.mockRestore();
    });

    it("stops the scheduler before waiting for checker shutdown", async () => {
        const site = createTestSite("s1", {
            monitors: [createTestMonitor("m1")],
        });
        const { checker, config, host, monitorScheduler } =
            createLifecycleHarness(site);
        const order: string[] = [];
        monitorScheduler.stopMonitor.mockImplementation(() => {
            order.push("scheduler");
            return true;
        });
        checker.stopMonitoring.mockImplementation(async () => {
            order.push("checker");
            return true;
        });

        await expect(
            stopMonitoringForSiteEnhancedFlow({
                config,
                host,
                identifier: "s1",
                monitorId: "m1",
            })
        ).resolves.toBeTruthy();

        expect(order).toEqual(["scheduler", "checker"]);
    });

    it("restores scheduling when checker shutdown fails", async () => {
        const site = createTestSite("s1", {
            monitors: [createTestMonitor("m1")],
        });
        const { checker, config, host, monitorScheduler } =
            createLifecycleHarness(site);
        checker.stopMonitoring.mockResolvedValue(false);

        await expect(
            stopMonitoringForSiteEnhancedFlow({
                config,
                host,
                identifier: "s1",
                monitorId: "m1",
            })
        ).resolves.toBeFalsy();

        expect(monitorScheduler.stopMonitor).toHaveBeenCalledWith("s1", "m1");
        expect(monitorScheduler.startMonitor).toHaveBeenCalledWith(
            "s1",
            site.monitors[0]
        );
    });

    it("restores scheduling when checker shutdown throws", async () => {
        const site = createTestSite("s1", {
            monitors: [createTestMonitor("m1")],
        });
        const { checker, config, host, monitorScheduler } =
            createLifecycleHarness(site);
        checker.stopMonitoring.mockRejectedValue(new Error("shutdown failed"));

        await expect(
            stopMonitoringForSiteEnhancedFlow({
                config,
                host,
                identifier: "s1",
                monitorId: "m1",
            })
        ).resolves.toBeFalsy();

        expect(monitorScheduler.startMonitor).toHaveBeenCalledWith(
            "s1",
            site.monitors[0]
        );
    });

    it("handleScheduledCheckOperation warns when site is missing", async () => {
        const warnSpy = vi
            .spyOn(monitorLogger, "warn")
            .mockImplementation(() => undefined);

        const sitesCache =
            createMockStandardizedCache<Site>() as unknown as StandardizedCache<Site>;

        const checker = {
            checkMonitor: vi.fn(),
        };

        await handleScheduledCheckOperation({
            checker,
            logger: monitorLogger,
            monitorId: "m1",
            signal: new AbortController().signal,
            siteIdentifier: "missing",
            sitesCache,
        });

        expect(checker.checkMonitor).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledTimes(1);

        warnSpy.mockRestore();
    });

    it("handleScheduledCheckOperation falls back to the first monitor when the requested monitor is missing", async () => {
        const warnSpy = vi
            .spyOn(monitorLogger, "warn")
            .mockImplementation(() => undefined);

        const sitesCache =
            createMockStandardizedCache<Site>() as unknown as StandardizedCache<Site>;

        const site = createSiteWithMonitors({
            identifier: "s1",
            monitoring: true,
            monitors: [{ id: "m1", monitoring: true }],
        });

        sitesCache.set("s1", site);

        const checker = {
            checkMonitor: vi.fn(),
        };

        const signal = new AbortController().signal;

        await handleScheduledCheckOperation({
            checker,
            logger: monitorLogger,
            monitorId: "missing",
            signal,
            siteIdentifier: "s1",
            sitesCache,
        });

        expect(checker.checkMonitor).toHaveBeenCalledWith(
            site,
            "missing",
            false,
            signal
        );
        expect(warnSpy).not.toHaveBeenCalled();

        warnSpy.mockRestore();
    });

    it("handleScheduledCheckOperation executes check and logs errors", async () => {
        const errorSpy = vi
            .spyOn(monitorLogger, "error")
            .mockImplementation(() => undefined);

        const sitesCache =
            createMockStandardizedCache<Site>() as unknown as StandardizedCache<Site>;
        const site = createSiteWithMonitors({
            identifier: "s1",
            monitoring: true,
            monitors: [{ id: "m1", monitoring: true }],
        });

        sitesCache.set("s1", site);

        const checker = {
            checkMonitor: vi.fn().mockRejectedValue(new Error("boom")),
        };

        const signal = new AbortController().signal;

        await handleScheduledCheckOperation({
            checker,
            logger: monitorLogger,
            monitorId: "m1",
            signal,
            siteIdentifier: "s1",
            sitesCache,
        });

        expect(checker.checkMonitor).toHaveBeenCalledWith(
            site,
            "m1",
            false,
            signal
        );
        expect(errorSpy).toHaveBeenCalledTimes(1);

        errorSpy.mockRestore();
    });

    it("toggleMonitoringForSiteOperation emits started/stopped monitor events", async () => {
        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;

        const nowSpy = vi.spyOn(Date, "now").mockReturnValue(123);

        await expect(
            toggleMonitoringForSiteOperation({
                eventEmitter,
                identifier: "s1",
                monitorId: "m1",
                operation: "started",
                toggle: vi.fn().mockResolvedValue(true),
            })
        ).resolves.toBeTruthy();

        expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
            "internal:monitor:started",
            expect.objectContaining({
                identifier: "s1",
                monitorId: "m1",
                operation: "started",
                timestamp: 123,
            })
        );

        await expect(
            toggleMonitoringForSiteOperation({
                eventEmitter,
                identifier: "s1",
                monitorId: "m1",
                operation: "stopped",
                reason: "user",
                toggle: vi.fn().mockResolvedValue(true),
            })
        ).resolves.toBeTruthy();

        expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
            "internal:monitor:stopped",
            expect.objectContaining({
                identifier: "s1",
                monitorId: "m1",
                operation: "stopped",
                reason: "user",
                timestamp: 123,
            })
        );

        nowSpy.mockRestore();
    });

    it("toggleMonitoringForSiteOperation can emit stopped without a monitorId", async () => {
        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;

        const nowSpy = vi.spyOn(Date, "now").mockReturnValue(123);

        await expect(
            toggleMonitoringForSiteOperation({
                eventEmitter,
                identifier: "s1",
                monitorId: undefined,
                operation: "stopped",
                reason: "user",
                toggle: vi.fn().mockResolvedValue(true),
            })
        ).resolves.toBeTruthy();

        const payload = (
            eventEmitter.emitTyped as unknown as ReturnType<typeof vi.fn>
        ).mock.calls[0]?.[1] as unknown;

        expect(payload).toBeDefined();
        expect("monitorId" in (payload as Record<string, unknown>)).toBeFalsy();

        nowSpy.mockRestore();
    });

    it("toggleMonitoringForSiteOperation can emit started without a monitorId", async () => {
        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;

        const nowSpy = vi.spyOn(Date, "now").mockReturnValue(123);

        await expect(
            toggleMonitoringForSiteOperation({
                eventEmitter,
                identifier: "s1",
                monitorId: undefined,
                operation: "started",
                toggle: vi.fn().mockResolvedValue(true),
            })
        ).resolves.toBeTruthy();

        const payload = (
            eventEmitter.emitTyped as unknown as ReturnType<typeof vi.fn>
        ).mock.calls[0]?.[1] as unknown;

        expect(payload).toBeDefined();
        expect("monitorId" in (payload as Record<string, unknown>)).toBeFalsy();

        nowSpy.mockRestore();
    });

    it("toggleMonitoringForSiteOperation returns false and emits nothing when toggle returns false", async () => {
        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;

        await expect(
            toggleMonitoringForSiteOperation({
                eventEmitter,
                identifier: "s1",
                monitorId: undefined,
                operation: "started",
                toggle: vi.fn().mockResolvedValue(false),
            })
        ).resolves.toBeFalsy();

        expect(eventEmitter.emitTyped).not.toHaveBeenCalled();
    });

    it("startMonitoringAllOperation emits when monitoring is active", async () => {
        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;

        const summary = await startMonitoringAllOperation({
            config: {} as unknown as EnhancedLifecycleConfig,
            eventEmitter,
            isMonitoring: true,
            logger: monitorLogger,
            startAllMonitoringEnhanced: vi.fn().mockResolvedValue({
                alreadyActive: false,
                attempted: 2,
                isMonitoring: true,
                partialFailures: false,
            }),
        });

        expect(summary.isMonitoring).toBeTruthy();
        expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
            "internal:monitor:started",
            expect.objectContaining({ identifier: "all", operation: "started" })
        );
    });

    it("startMonitoringAllOperation emits even when monitoring was already active", async () => {
        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;

        const summary = await startMonitoringAllOperation({
            config: {} as unknown as EnhancedLifecycleConfig,
            eventEmitter,
            isMonitoring: true,
            logger: monitorLogger,
            startAllMonitoringEnhanced: vi.fn().mockResolvedValue({
                alreadyActive: true,
                attempted: 0,
                isMonitoring: true,
                partialFailures: false,
            }),
        });

        expect(summary.alreadyActive).toBeTruthy();
        expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
            "internal:monitor:started",
            expect.objectContaining({ identifier: "all", operation: "started" })
        );
    });

    it("startMonitoringAllOperation returns without emitting when monitoring is inactive and nothing was attempted", async () => {
        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;

        const summary = await startMonitoringAllOperation({
            config: {} as unknown as EnhancedLifecycleConfig,
            eventEmitter,
            isMonitoring: true,
            logger: monitorLogger,
            startAllMonitoringEnhanced: vi.fn().mockResolvedValue({
                alreadyActive: false,
                attempted: 0,
                isMonitoring: false,
                partialFailures: false,
            }),
        });

        expect(summary.isMonitoring).toBeFalsy();
        expect(eventEmitter.emitTyped).not.toHaveBeenCalled();
    });

    it("startMonitoringAllOperation warns when partial failures occur", async () => {
        const warnSpy = vi
            .spyOn(monitorLogger, "warn")
            .mockImplementation(() => undefined);

        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;

        await expect(
            startMonitoringAllOperation({
                config: {} as unknown as EnhancedLifecycleConfig,
                eventEmitter,
                isMonitoring: true,
                logger: monitorLogger,
                startAllMonitoringEnhanced: vi.fn().mockResolvedValue({
                    alreadyActive: false,
                    attempted: 2,
                    isMonitoring: true,
                    partialFailures: true,
                }),
            })
        ).resolves.toBeDefined();

        expect(warnSpy).toHaveBeenCalledTimes(1);
        warnSpy.mockRestore();
    });

    it("startMonitoringAllOperation throws a typed summary error when monitoring is not active", async () => {
        const summary = {
            alreadyActive: false,
            attempted: 1,
            isMonitoring: false,
            partialFailures: false,
        };

        let thrown: unknown;
        try {
            await startMonitoringAllOperation({
                config: {} as unknown as EnhancedLifecycleConfig,
                eventEmitter:
                    createMockEventBus() as unknown as TypedEventBus<UptimeEvents>,
                isMonitoring: false,
                logger: monitorLogger,
                startAllMonitoringEnhanced: vi.fn().mockResolvedValue(summary),
            });
        } catch (error: unknown) {
            thrown = error;
        }

        expect(thrown).toMatchObject({
            name: "MonitoringAllOperationError",
            summary,
        });
    });

    it("stopMonitoringAllOperation throws a typed summary error when monitoring remains active", async () => {
        const summary = {
            alreadyInactive: false,
            attempted: 1,
            isMonitoring: true,
            partialFailures: false,
        };

        let thrown: unknown;
        try {
            await stopMonitoringAllOperation({
                config: {} as unknown as EnhancedLifecycleConfig,
                eventEmitter:
                    createMockEventBus() as unknown as TypedEventBus<UptimeEvents>,
                logger: monitorLogger,
                stopAllMonitoringEnhanced: vi.fn().mockResolvedValue(summary),
            });
        } catch (error: unknown) {
            thrown = error;
        }

        expect(thrown).toMatchObject({
            name: "MonitoringAllOperationError",
            summary,
        });
    });

    it("stopMonitoringAllOperation emits when monitoring is inactive", async () => {
        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;

        const summary = await stopMonitoringAllOperation({
            config: {} as unknown as EnhancedLifecycleConfig,
            eventEmitter,
            logger: monitorLogger,
            stopAllMonitoringEnhanced: vi.fn().mockResolvedValue({
                alreadyInactive: false,
                attempted: 2,
                isMonitoring: false,
                partialFailures: false,
            }),
        });

        expect(summary.isMonitoring).toBeFalsy();
        expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
            "internal:monitor:stopped",
            expect.objectContaining({ identifier: "all", operation: "stopped" })
        );
    });

    it("stopMonitoringAllOperation emits even when monitoring was already inactive", async () => {
        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;

        const summary = await stopMonitoringAllOperation({
            config: {} as unknown as EnhancedLifecycleConfig,
            eventEmitter,
            logger: monitorLogger,
            stopAllMonitoringEnhanced: vi.fn().mockResolvedValue({
                alreadyInactive: true,
                attempted: 0,
                isMonitoring: false,
                partialFailures: false,
            }),
        });

        expect(summary.alreadyInactive).toBeTruthy();
        expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
            "internal:monitor:stopped",
            expect.objectContaining({ identifier: "all", operation: "stopped" })
        );
    });

    it("stopMonitoringAllOperation warns when partial failures occur", async () => {
        const warnSpy = vi
            .spyOn(monitorLogger, "warn")
            .mockImplementation(() => undefined);

        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;

        await stopMonitoringAllOperation({
            config: {} as unknown as EnhancedLifecycleConfig,
            eventEmitter,
            logger: monitorLogger,
            stopAllMonitoringEnhanced: vi.fn().mockResolvedValue({
                alreadyInactive: false,
                attempted: 2,
                isMonitoring: false,
                partialFailures: true,
            }),
        });

        expect(warnSpy).toHaveBeenCalledTimes(1);
        warnSpy.mockRestore();
    });
});
