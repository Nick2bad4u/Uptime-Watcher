import { describe, expect, it, vi } from "vitest";

import type { Monitor, Site } from "@shared/types";
import type { BaseLogger, Logger } from "@shared/utils/logger/interfaces";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { DatabaseService } from "../../services/database/DatabaseService";
import type { MonitorRepository } from "../../services/database/MonitorRepository";
import type { EnhancedMonitoringServices } from "../../services/monitoring/EnhancedMonitoringServiceFactory";
import type { MonitorScheduler } from "../../services/monitoring/MonitorScheduler";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";
import type { EnhancedLifecycleConfig } from "../../managers/MonitorManagerEnhancedLifecycle";

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
            logger: monitorLogger as unknown as BaseLogger,
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
            logger: monitorLogger as unknown as BaseLogger,
            monitorId: undefined,
        });

        await expect(delegate("s1", undefined)).resolves.toBeFalsy();
        expect(action).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledTimes(1);

        warnSpy.mockRestore();
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
            logger: monitorLogger as unknown as BaseLogger,
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
            logger: monitorLogger as unknown as BaseLogger,
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
            logger: monitorLogger as unknown as BaseLogger,
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
            logger: monitorLogger as unknown as BaseLogger,
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
            logger: monitorLogger as unknown as BaseLogger,
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
            logger: monitorLogger as unknown as BaseLogger,
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
                logger: monitorLogger as unknown as BaseLogger,
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

    it("startMonitoringAllOperation throws when monitoring is not active", async () => {
        await expect(
            startMonitoringAllOperation({
                config: {} as unknown as EnhancedLifecycleConfig,
                eventEmitter:
                    createMockEventBus() as unknown as TypedEventBus<UptimeEvents>,
                isMonitoring: false,
                logger: monitorLogger as unknown as BaseLogger,
                startAllMonitoringEnhanced: vi.fn().mockResolvedValue({
                    alreadyActive: false,
                    attempted: 1,
                    isMonitoring: false,
                    partialFailures: false,
                }),
            })
        ).rejects.toThrowError(/failed to start monitoring/i);
    });

    it("stopMonitoringAllOperation throws when monitoring remains active", async () => {
        await expect(
            stopMonitoringAllOperation({
                config: {} as unknown as EnhancedLifecycleConfig,
                eventEmitter:
                    createMockEventBus() as unknown as TypedEventBus<UptimeEvents>,
                logger: monitorLogger as unknown as BaseLogger,
                stopAllMonitoringEnhanced: vi.fn().mockResolvedValue({
                    alreadyInactive: false,
                    attempted: 1,
                    isMonitoring: true,
                    partialFailures: false,
                }),
            })
        ).rejects.toThrowError(/failed to stop monitoring/i);
    });

    it("stopMonitoringAllOperation emits when monitoring is inactive", async () => {
        const eventEmitter =
            createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;

        const summary = await stopMonitoringAllOperation({
            config: {} as unknown as EnhancedLifecycleConfig,
            eventEmitter,
            logger: monitorLogger as unknown as BaseLogger,
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
            logger: monitorLogger as unknown as BaseLogger,
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
            logger: monitorLogger as unknown as BaseLogger,
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
