/**
 * High-precision unit tests for the enhanced monitoring lifecycle helpers.
 *
 * These tests exercise the orchestration logic that powers the enhanced
 * monitor lifecycle flows, ensuring we capture successes, skips, failures, and
 * recursive site-level behaviours without touching real services.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    MONITOR_STATUS,
    type Monitor,
    type MonitoringStartSummary,
    type MonitoringStopSummary,
    type Site,
} from "@shared/types";

import {
    startAllMonitoringEnhancedFlow,
    startMonitoringForSiteEnhancedFlow,
    stopAllMonitoringEnhancedFlow,
    stopMonitoringForSiteEnhancedFlow,
    type EnhancedLifecycleConfig,
    type EnhancedLifecycleHost,
    type MonitorActionDelegate,
} from "../../../../electron/managers/MonitorManagerEnhancedLifecycle";
import type { EnhancedMonitoringServices } from "../../../../electron/services/monitoring/EnhancedMonitoringServiceFactory";

/**
 * Creates a monitor entity with sensible defaults for testing scenarios.
 */
function createMonitor(overrides: Partial<Monitor> = {}): Monitor {
    return {
        activeOperations: overrides.activeOperations ?? [],
        checkInterval: overrides.checkInterval ?? 10_000,
        history: overrides.history ?? [],
        id: overrides.id ?? "monitor-id",
        monitoring: overrides.monitoring ?? false,
        responseTime: overrides.responseTime ?? 0,
        retryAttempts: overrides.retryAttempts ?? 0,
        status: overrides.status ?? MONITOR_STATUS.PENDING,
        timeout: overrides.timeout ?? 30_000,
        type: overrides.type ?? "http",
        ...overrides,
    } satisfies Monitor;
}

/**
 * Creates a site with the supplied monitors, allowing `undefined` placeholders
 * to exercise defensive branches in the lifecycle helpers.
 */
function createSite(
    identifier: string,
    monitors: Array<Monitor | undefined>,
    overrides: Partial<Site> = {}
): Site {
    return {
        identifier,
        monitoring: overrides.monitoring ?? false,
        monitors: monitors as unknown as Monitor[],
        name: overrides.name ?? `Site ${identifier}`,
    } satisfies Site;
}

type LoggerMock = Record<"debug" | "info" | "warn" | "error", ReturnType<typeof vi.fn>>;

interface LifecycleTestHarness {
    readonly config: EnhancedLifecycleConfig;
    readonly host: EnhancedLifecycleHost;
    readonly logger: LoggerMock;
    readonly scheduler: {
        readonly startSite: ReturnType<typeof vi.fn>;
        readonly startMonitor: ReturnType<typeof vi.fn>;
        readonly stopMonitor: ReturnType<typeof vi.fn>;
        readonly stopAll: ReturnType<typeof vi.fn>;
    };
    readonly checker: {
        readonly startMonitoring: ReturnType<typeof vi.fn>;
        readonly stopMonitoring: ReturnType<typeof vi.fn>;
    };
    readonly sites: {
        readonly getAll: ReturnType<typeof vi.fn>;
        readonly get: ReturnType<typeof vi.fn>;
    };
    readonly applyMonitorState: EnhancedLifecycleHost["applyMonitorState"];
    readonly runSequentially: EnhancedLifecycleHost["runSequentially"];
}

/**
 * Builds an isolated lifecycle harness with fully controllable dependencies.
 */
function createLifecycleHarness(sites: Site[]): LifecycleTestHarness {
    const logger: LoggerMock = {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    };

    const schedulerSpies = {
        startMonitor: vi.fn(() => true),
        startSite: vi.fn(),
        stopAll: vi.fn(),
        stopMonitor: vi.fn(() => true),
    } as const;

    const startMonitoringMock = vi.fn(
        async (_siteIdentifier: string, _monitorId: string) => true
    );
    const stopMonitoringMock = vi.fn(
        async (_siteIdentifier: string, _monitorId: string) => true
    );
    const checkerSpies = {
        startMonitoring: startMonitoringMock,
        stopMonitoring: stopMonitoringMock,
    } as const;

    const sitesCache = {
        get: vi.fn((identifier: string) =>
            sites.find((site) => site.identifier === identifier)
        ),
        getAll: vi.fn(() => sites),
    } as const;

    const applyMonitorState: EnhancedLifecycleHost["applyMonitorState"] = vi.fn(
        async (_site, monitor, state, nextStatus) => {
            Object.assign(monitor, state, { status: nextStatus });
        }
    );

    const runSequentially: EnhancedLifecycleHost["runSequentially"] = vi.fn(
        async (items, iterator) => {
            for (const item of items) {
                await iterator(item);
            }
        }
    );

    const services = {
        checker: checkerSpies as unknown as EnhancedMonitoringServices["checker"],
        operationRegistry: {},
        statusUpdateService: {},
        timeoutManager: {},
    } as unknown as EnhancedMonitoringServices;

    const host = {
        applyMonitorState,
        runSequentially,
        services,
    } as EnhancedLifecycleHost;

    const config = {
        databaseService: {},
        eventEmitter: {},
        logger,
        monitorRepository: {},
        monitorScheduler: schedulerSpies,
        sites: sitesCache,
    } as unknown as EnhancedLifecycleConfig;

    return {
        applyMonitorState,
        checker: checkerSpies,
        config,
        host,
        logger,
        runSequentially,
        scheduler: schedulerSpies,
        sites: sitesCache,
    } satisfies LifecycleTestHarness;
}

describe("MonitorManagerEnhancedLifecycle", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("startAllMonitoringEnhancedFlow", () => {
        it("returns cached summary when monitoring already active", async () => {
            const site = createSite("alpha", [createMonitor({ id: "m-1" })]);
            const harness = createLifecycleHarness([site]);

            const summary = await startAllMonitoringEnhancedFlow({
                config: harness.config,
                host: harness.host,
                isMonitoring: true,
            });

            const expected: MonitoringStartSummary = {
                alreadyActive: true,
                attempted: 0,
                failed: 0,
                isMonitoring: true,
                partialFailures: false,
                siteCount: 1,
                skipped: 0,
                succeeded: 0,
            };

            expect(summary).toStrictEqual(expected);
            expect(harness.logger.debug).toHaveBeenCalledWith(
                "Monitoring already running; returning cached summary",
                expected
            );
            expect(harness.checker.startMonitoring).not.toHaveBeenCalled();
        });

        it("tracks successes, skips, and failures across all monitors", async () => {
            const successfulMonitor = createMonitor({
                id: "monitor-success",
                monitoring: false,
            });
            const missingIdMonitor = createMonitor({ id: "" });
            const invalidIntervalMonitor = createMonitor({
                checkInterval: 0,
                id: "monitor-invalid-interval",
            });
            const failingMonitor = createMonitor({ id: "monitor-fail" });
            const errorMonitor = createMonitor({ id: "monitor-error" });

            const site = createSite(
                "beta",
                [
                    successfulMonitor,
                    undefined,
                    missingIdMonitor,
                    invalidIntervalMonitor,
                    failingMonitor,
                    errorMonitor,
                ]
            );

            const harness = createLifecycleHarness([site]);

            harness.checker.startMonitoring
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false)
                .mockRejectedValueOnce(new Error("checker boom"));

            const summary = await startAllMonitoringEnhancedFlow({
                config: harness.config,
                host: harness.host,
                isMonitoring: false,
            });

            expect(summary).toStrictEqual<MonitoringStartSummary>({
                alreadyActive: false,
                attempted: 3,
                failed: 2,
                isMonitoring: true,
                partialFailures: true,
                siteCount: 1,
                skipped: 3,
                succeeded: 1,
            });

            expect(harness.logger.info).toHaveBeenCalledWith(
                "Starting monitoring across 1 sites (enhanced system)"
            );
            expect(harness.logger.warn).toHaveBeenCalledWith(
                "[MonitorManager] Global monitoring started with partial failures",
                summary
            );
            expect(harness.scheduler.startSite).toHaveBeenCalledWith(site);
            expect(harness.applyMonitorState).toHaveBeenCalledWith(
                site,
                successfulMonitor,
                {
                    activeOperations: [],
                    monitoring: true,
                    status: MONITOR_STATUS.PENDING,
                },
                MONITOR_STATUS.PENDING
            );
            expect(harness.checker.startMonitoring).toHaveBeenCalledWith(
                "beta",
                "monitor-success"
            );
            expect(harness.checker.startMonitoring).toHaveBeenCalledWith(
                "beta",
                "monitor-fail"
            );
            expect(harness.checker.startMonitoring).toHaveBeenCalledWith(
                "beta",
                "monitor-error"
            );
        });

        it("reports inactivity when no monitors qualify for startup", async () => {
            const site = createSite(
                "gamma",
                [
                    undefined,
                    createMonitor({ id: "", monitoring: false }),
                    createMonitor({
                        checkInterval: Number.NaN,
                        id: "invalid-interval",
                    }),
                ]
            );

            const harness = createLifecycleHarness([site]);

            const summary = await startAllMonitoringEnhancedFlow({
                config: harness.config,
                host: harness.host,
                isMonitoring: false,
            });

            expect(summary).toStrictEqual<MonitoringStartSummary>({
                alreadyActive: false,
                attempted: 0,
                failed: 0,
                isMonitoring: false,
                partialFailures: false,
                siteCount: 1,
                skipped: 3,
                succeeded: 0,
            });

            expect(harness.logger.info).toHaveBeenCalledWith(
                "[MonitorManager] No monitors eligible for start; monitoring remains inactive"
            );
            expect(harness.scheduler.startSite).not.toHaveBeenCalled();
            expect(harness.checker.startMonitoring).not.toHaveBeenCalled();
        });
    });

    describe("stopAllMonitoringEnhancedFlow", () => {
        it("coordinates partial failures while ensuring stopAll executes", async () => {
            const undefinedSlot = undefined;
            const missingIdMonitor = createMonitor({ id: "", monitoring: true });
            const inactiveMonitor = createMonitor({
                id: "monitor-inactive",
                monitoring: false,
            });
            const successfulMonitor = createMonitor({
                id: "monitor-success",
                monitoring: true,
            });
            const failingMonitor = createMonitor({
                id: "monitor-fail",
                monitoring: true,
            });
            const errorMonitor = createMonitor({
                id: "monitor-error",
                monitoring: true,
            });

            const site = createSite("delta", [
                undefinedSlot,
                missingIdMonitor,
                inactiveMonitor,
                successfulMonitor,
                failingMonitor,
                errorMonitor,
            ]);

            const harness = createLifecycleHarness([site]);

            harness.checker.stopMonitoring
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false)
                .mockRejectedValueOnce(new Error("stop boom"));

            const summary = await stopAllMonitoringEnhancedFlow({
                config: harness.config,
                host: harness.host,
            });

            expect(summary).toStrictEqual<MonitoringStopSummary>({
                alreadyInactive: false,
                attempted: 3,
                failed: 2,
                isMonitoring: true,
                partialFailures: true,
                siteCount: 1,
                skipped: 3,
                succeeded: 1,
            });

            expect(harness.logger.warn).toHaveBeenCalledWith(
                "[MonitorManager] Global monitoring stopped with partial failures",
                summary
            );
            expect(harness.scheduler.stopAll).toHaveBeenCalledTimes(1);
            expect(harness.applyMonitorState).toHaveBeenCalledWith(
                site,
                successfulMonitor,
                {
                    activeOperations: [],
                    monitoring: false,
                    status: MONITOR_STATUS.PAUSED,
                },
                MONITOR_STATUS.PAUSED
            );
        });

        it("flags no-op shutdowns when nothing required stopping", async () => {
            const site = createSite("epsilon", [
                undefined,
                createMonitor({ id: "", monitoring: true }),
                createMonitor({ id: "monitor-idle", monitoring: false }),
            ]);

            const harness = createLifecycleHarness([site]);

            const summary = await stopAllMonitoringEnhancedFlow({
                config: harness.config,
                host: harness.host,
            });

            expect(summary).toStrictEqual<MonitoringStopSummary>({
                alreadyInactive: true,
                attempted: 0,
                failed: 0,
                isMonitoring: false,
                partialFailures: false,
                siteCount: 1,
                skipped: 3,
                succeeded: 0,
            });

            expect(harness.logger.info).toHaveBeenCalledWith(
                "[MonitorManager] No active monitors required stopping"
            );
            expect(harness.scheduler.stopAll).toHaveBeenCalledTimes(1);
            expect(harness.checker.stopMonitoring).not.toHaveBeenCalled();
        });
    });

    describe("startMonitoringForSiteEnhancedFlow", () => {
        it("returns false and logs when site is missing", async () => {
            const harness = createLifecycleHarness([]);

            const result = await startMonitoringForSiteEnhancedFlow({
                config: harness.config,
                host: harness.host,
                identifier: "missing",
            });

            expect(result).toBe(false);
            expect(harness.logger.warn).toHaveBeenCalledWith(
                "Site not found: missing"
            );
        });

        it("rejects monitors without valid intervals when monitorId supplied", async () => {
            const problematicMonitor = createMonitor({
                checkInterval: 0,
                id: "broken",
            });
            const site = createSite("zeta", [problematicMonitor]);
            const harness = createLifecycleHarness([site]);

            const result = await startMonitoringForSiteEnhancedFlow({
                config: harness.config,
                host: harness.host,
                identifier: "zeta",
                monitorId: "broken",
            });

            expect(result).toBe(false);
            expect(harness.logger.warn).toHaveBeenCalledWith(
                "Monitor zeta:broken has no valid check interval set"
            );
            expect(harness.checker.startMonitoring).not.toHaveBeenCalled();
        });

        it("propagates checker denials without updating monitor state", async () => {
            const monitor = createMonitor({ id: "deny" });
            const site = createSite("eta", [monitor]);
            const harness = createLifecycleHarness([site]);

            harness.checker.startMonitoring.mockResolvedValueOnce(false);

            const result = await startMonitoringForSiteEnhancedFlow({
                config: harness.config,
                host: harness.host,
                identifier: "eta",
                monitorId: "deny",
            });

            expect(result).toBe(false);
            expect(harness.applyMonitorState).not.toHaveBeenCalled();
            expect(harness.scheduler.startMonitor).not.toHaveBeenCalled();
        });

        it("updates monitor state, scheduler, and status when checker approves", async () => {
            const monitor = createMonitor({ id: "approve" });
            const site = createSite("theta", [monitor]);
            const harness = createLifecycleHarness([site]);

            harness.checker.startMonitoring.mockResolvedValueOnce(true);

            const result = await startMonitoringForSiteEnhancedFlow({
                config: harness.config,
                host: harness.host,
                identifier: "theta",
                monitorId: "approve",
            });

            expect(result).toBe(true);
            expect(harness.applyMonitorState).toHaveBeenCalledWith(
                site,
                monitor,
                {
                    activeOperations: [],
                    monitoring: true,
                    status: MONITOR_STATUS.PENDING,
                },
                MONITOR_STATUS.PENDING
            );
            expect(harness.scheduler.startMonitor).toHaveBeenCalledWith(
                "theta",
                monitor
            );
            expect(monitor.monitoring).toBe(true);
        });

        it("handles checker exceptions gracefully", async () => {
            const monitor = createMonitor({ id: "explode" });
            const site = createSite("iota", [monitor]);
            const harness = createLifecycleHarness([site]);

            const failure = new Error("unexpected failure");
            harness.checker.startMonitoring.mockRejectedValueOnce(failure);

            const result = await startMonitoringForSiteEnhancedFlow({
                config: harness.config,
                host: harness.host,
                identifier: "iota",
                monitorId: "explode",
            });

            expect(result).toBe(false);
            expect(harness.logger.error).toHaveBeenCalledWith(
                "Enhanced start failed for iota:explode",
                failure
            );
        });

        it("recurses across monitors when no delegate is provided", async () => {
            const firstMonitor = createMonitor({ id: "first" });
            const secondMonitor = createMonitor({ id: "second" });
            const site = createSite("kappa", [firstMonitor, secondMonitor]);
            const harness = createLifecycleHarness([site]);

            harness.checker.startMonitoring
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false);

            const result = await startMonitoringForSiteEnhancedFlow({
                config: harness.config,
                host: harness.host,
                identifier: "kappa",
            });

            expect(result).toBe(true);
            expect(harness.checker.startMonitoring).toHaveBeenCalledWith(
                "kappa",
                "first"
            );
            expect(harness.checker.startMonitoring).toHaveBeenCalledWith(
                "kappa",
                "second"
            );
            expect(harness.applyMonitorState).toHaveBeenCalledTimes(1);
        });

        it("leverages custom monitorAction delegates and aggregates results", async () => {
            const firstMonitor = createMonitor({ id: "first" });
            const secondMonitor = createMonitor({ id: "second" });
            const site = createSite("lambda", [firstMonitor, secondMonitor]);
            const harness = createLifecycleHarness([site]);

            const delegateMock = vi
                .fn(async (_identifier: string, _monitorId?: string) => false)
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(true);

            const result = await startMonitoringForSiteEnhancedFlow({
                config: harness.config,
                host: harness.host,
                identifier: "lambda",
                monitorAction: delegateMock as MonitorActionDelegate,
            });

            expect(result).toBe(true);
            expect(delegateMock).toHaveBeenCalledTimes(2);
            expect(delegateMock).toHaveBeenLastCalledWith("lambda", "second");
        });
    });

    describe("stopMonitoringForSiteEnhancedFlow", () => {
        it("logs and returns false when the site cannot be located", async () => {
            const harness = createLifecycleHarness([]);

            const result = await stopMonitoringForSiteEnhancedFlow({
                config: harness.config,
                host: harness.host,
                identifier: "missing",
            });

            expect(result).toBe(false);
            expect(harness.logger.warn).toHaveBeenCalledWith(
                "Site not found: missing"
            );
        });

        it("cleans up monitor state and scheduler when checker confirms stop", async () => {
            const monitor = createMonitor({ id: "stop-me", monitoring: true });
            const site = createSite("mu", [monitor]);
            const harness = createLifecycleHarness([site]);

            harness.checker.stopMonitoring.mockResolvedValueOnce(true);

            const result = await stopMonitoringForSiteEnhancedFlow({
                config: harness.config,
                host: harness.host,
                identifier: "mu",
                monitorId: "stop-me",
            });

            expect(result).toBe(true);
            expect(harness.applyMonitorState).toHaveBeenCalledWith(
                site,
                monitor,
                {
                    activeOperations: [],
                    monitoring: false,
                    status: MONITOR_STATUS.PAUSED,
                },
                MONITOR_STATUS.PAUSED
            );
            expect(harness.scheduler.stopMonitor).toHaveBeenCalledWith(
                "mu",
                "stop-me"
            );
            expect(monitor.monitoring).toBe(false);
        });

        it("propagates false when checker declines to stop", async () => {
            const monitor = createMonitor({ id: "busy", monitoring: true });
            const site = createSite("nu", [monitor]);
            const harness = createLifecycleHarness([site]);

            harness.checker.stopMonitoring.mockResolvedValueOnce(false);

            const result = await stopMonitoringForSiteEnhancedFlow({
                config: harness.config,
                host: harness.host,
                identifier: "nu",
                monitorId: "busy",
            });

            expect(result).toBe(false);
            expect(harness.applyMonitorState).not.toHaveBeenCalled();
            expect(harness.scheduler.stopMonitor).not.toHaveBeenCalled();
        });

        it("handles checker exceptions while continuing evaluation", async () => {
            const monitor = createMonitor({ id: "errant", monitoring: true });
            const site = createSite("omicron", [monitor]);
            const harness = createLifecycleHarness([site]);

            const error = new Error("stop failure");
            harness.checker.stopMonitoring.mockRejectedValueOnce(error);

            const result = await stopMonitoringForSiteEnhancedFlow({
                config: harness.config,
                host: harness.host,
                identifier: "omicron",
                monitorId: "errant",
            });

            expect(result).toBe(false);
            expect(harness.logger.error).toHaveBeenCalledWith(
                "Enhanced stop failed for omicron:errant",
                error
            );
        });

        it("recursively stops all active monitors when no monitorId provided", async () => {
            const m1 = createMonitor({ id: "m1", monitoring: true });
            const m2 = createMonitor({ id: "m2", monitoring: true });
            const m3 = createMonitor({ id: "m3", monitoring: false });
            const site = createSite("pi", [m1, m2, m3]);
            const harness = createLifecycleHarness([site]);

            harness.checker.stopMonitoring
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false);

            const result = await stopMonitoringForSiteEnhancedFlow({
                config: harness.config,
                host: harness.host,
                identifier: "pi",
            });

            expect(result).toBe(false);
            expect(harness.checker.stopMonitoring).toHaveBeenCalledWith(
                "pi",
                "m1"
            );
            expect(harness.checker.stopMonitoring).toHaveBeenCalledWith(
                "pi",
                "m2"
            );
            expect(harness.scheduler.stopMonitor).toHaveBeenCalledWith(
                "pi",
                "m1"
            );
        });

        it("invokes provided stop delegates for each monitor", async () => {
            const m1 = createMonitor({ id: "a", monitoring: true });
            const m2 = createMonitor({ id: "b", monitoring: true });
            const site = createSite("rho", [m1, m2]);
            const harness = createLifecycleHarness([site]);

            const delegateMock = vi
                .fn(async (_identifier: string, _monitorId?: string) => true)
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false);

            const result = await stopMonitoringForSiteEnhancedFlow({
                config: harness.config,
                host: harness.host,
                identifier: "rho",
                monitorAction: delegateMock as MonitorActionDelegate,
            });

            expect(result).toBe(false);
            expect(delegateMock).toHaveBeenCalledTimes(2);
            expect(delegateMock).toHaveBeenCalledWith("rho", "a");
            expect(delegateMock).toHaveBeenCalledWith("rho", "b");
        });
    });
});
