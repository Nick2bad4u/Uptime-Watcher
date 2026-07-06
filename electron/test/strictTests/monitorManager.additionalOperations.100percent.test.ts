import type { Monitor, Site, StatusUpdate } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import { describe, expect, it, vi } from "vitest";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";

import { applyDefaultIntervalsOperation } from "../../managers/monitorManager/applyDefaultIntervalsOperation";
import { checkSiteManuallyOperation } from "../../managers/monitorManager/checkSiteManuallyOperation";
import { setupIndividualNewMonitorsOperation } from "../../managers/monitorManager/setupIndividualNewMonitorsOperation";
import { setupNewMonitorsOperation } from "../../managers/monitorManager/setupNewMonitorsOperation";
import { logger } from "../../utils/logger";
import {
    createMockEventBus,
    createMockStandardizedCache,
    createTestMonitor,
    createTestSite,
} from "../utils/enhanced-testUtilities";

const createStatusUpdate = (args: {
    readonly monitor: Monitor;
    readonly site: Site;
}): StatusUpdate => ({
    monitor: args.monitor,
    monitorId: args.monitor.id,
    site: args.site,
    siteIdentifier: args.site.identifier,
    status: "up",
    timestamp: new Date(0).toISOString(),
});

describe("monitorManager additional operations", () => {
    const rawMonitorId =
        "https://monitor.example/check?token=monitor-token#private-monitor";
    const rawSiteIdentifier =
        "https://user:site-secret@example.com/path?access_token=site-token#private-site";

    describe(applyDefaultIntervalsOperation, () => {
        it("redacts URL-shaped identifiers in default-interval diagnostics", async () => {
            const debug = vi.fn();
            const info = vi.fn();
            const update = vi.fn();
            const db = {};
            const site = createTestSite(rawSiteIdentifier, {
                monitors: [
                    createTestMonitor(rawMonitorId, {
                        checkInterval: 0,
                    }),
                ],
            });

            await applyDefaultIntervalsOperation({
                defaultCheckIntervalMs: 60_000,
                dependencies: {
                    databaseService: {
                        executeTransaction: vi.fn(async (callback) =>
                            callback(db as never)
                        ),
                    } as never,
                    logger: {
                        debug,
                        info,
                    } as unknown as Logger,
                    monitorRepository: {
                        createTransactionAdapter: vi.fn(() => ({
                            update,
                        })),
                    } as never,
                    sitesCache: {
                        set: vi.fn(),
                    } as unknown as StandardizedCache<Site>,
                },
                shouldApplyDefaultInterval: vi.fn().mockReturnValue(true),
                site,
            });

            expect(update).toHaveBeenCalledWith(rawMonitorId, {
                checkInterval: 60_000,
            });

            const logPayload = JSON.stringify([
                debug.mock.calls,
                info.mock.calls,
            ]);

            expect(logPayload).toContain("https://monitor.example/check");
            expect(logPayload).toContain("https://example.com/path");
            expect(logPayload).not.toContain("monitor-token");
            expect(logPayload).not.toContain("private-monitor");
            expect(logPayload).not.toContain("site-secret");
            expect(logPayload).not.toContain("site-token");
            expect(logPayload).not.toContain("private-site");
        });
    });

    describe(setupIndividualNewMonitorsOperation, () => {
        it("applies the default interval and auto-starts monitors when site monitoring is enabled", async () => {
            const debugSpy = vi
                .spyOn(logger, "debug")
                .mockImplementation(() => undefined);

            const shouldApplyDefaultInterval = vi.fn().mockReturnValue(true);
            const autoStartNewMonitors = vi.fn().mockResolvedValue(undefined);

            const site = createTestSite("s1", {
                monitoring: true,
                monitors: [
                    createTestMonitor("m1", { checkInterval: 0 }),
                    createTestMonitor("m2", { checkInterval: 0 }),
                ],
            });

            const newMonitors = site.monitors;

            await setupIndividualNewMonitorsOperation({
                autoStartNewMonitors,
                defaultCheckIntervalMs: 60_000,
                newMonitors,
                shouldApplyDefaultInterval,
                site,
            });

            expect(
                newMonitors.every((m) => m.checkInterval === 60_000)
            ).toBeTruthy();
            expect(autoStartNewMonitors).toHaveBeenCalledWith(
                site,
                newMonitors
            );
            expect(debugSpy).toHaveBeenCalled();

            debugSpy.mockRestore();
        });

        it("does not auto-start when site monitoring is disabled", async () => {
            const debugSpy = vi
                .spyOn(logger, "debug")
                .mockImplementation(() => undefined);

            const shouldApplyDefaultInterval = vi.fn().mockReturnValue(false);
            const autoStartNewMonitors = vi.fn().mockResolvedValue(undefined);

            const site = createTestSite("s1", {
                monitoring: false,
                monitors: [createTestMonitor("m1")],
            });

            await setupIndividualNewMonitorsOperation({
                autoStartNewMonitors,
                defaultCheckIntervalMs: 60_000,
                newMonitors: site.monitors,
                shouldApplyDefaultInterval,
                site,
            });

            expect(autoStartNewMonitors).not.toHaveBeenCalled();
            expect(debugSpy).toHaveBeenCalled();

            debugSpy.mockRestore();
        });

        it("redacts URL-shaped identifiers in setup diagnostics", async () => {
            const debugSpy = vi
                .spyOn(logger, "debug")
                .mockImplementation(() => undefined);

            const site = createTestSite(rawSiteIdentifier, {
                monitoring: false,
                monitors: [
                    createTestMonitor(rawMonitorId, { checkInterval: 0 }),
                ],
            });

            await setupIndividualNewMonitorsOperation({
                autoStartNewMonitors: vi.fn(),
                defaultCheckIntervalMs: 60_000,
                newMonitors: site.monitors,
                shouldApplyDefaultInterval: vi.fn().mockReturnValue(true),
                site,
            });

            const logPayload = JSON.stringify(debugSpy.mock.calls);

            expect(logPayload).toContain("https://monitor.example/check");
            expect(logPayload).not.toContain("monitor-token");
            expect(logPayload).not.toContain("private-monitor");

            debugSpy.mockRestore();
        });
    });

    describe(setupNewMonitorsOperation, () => {
        it("returns early when no valid monitor IDs are provided", async () => {
            const infoSpy = vi
                .spyOn(logger, "info")
                .mockImplementation(() => undefined);

            const setupIndividualNewMonitors = vi
                .fn()
                .mockResolvedValue(undefined);

            const site = createTestSite("s1", {
                monitors: [createTestMonitor("m1")],
            });

            await setupNewMonitorsOperation({
                newMonitorIds: ["missing"],
                setupIndividualNewMonitors,
                site,
            });

            expect(setupIndividualNewMonitors).not.toHaveBeenCalled();
            expect(infoSpy).not.toHaveBeenCalled();

            infoSpy.mockRestore();
        });

        it("sets up the provided monitor IDs and logs a summary", async () => {
            const infoSpy = vi
                .spyOn(logger, "info")
                .mockImplementation(() => undefined);

            const setupIndividualNewMonitors = vi
                .fn()
                .mockResolvedValue(undefined);

            const site = createTestSite("s1", {
                monitors: [createTestMonitor("m1"), createTestMonitor("m2")],
            });

            await setupNewMonitorsOperation({
                newMonitorIds: ["m2"],
                setupIndividualNewMonitors,
                site,
            });

            const monitor = site.monitors[1];
            if (!monitor) {
                throw new Error("Expected site to contain monitor m2");
            }

            expect(setupIndividualNewMonitors).toHaveBeenCalledWith(site, [
                monitor,
            ]);
            expect(infoSpy).toHaveBeenCalled();

            infoSpy.mockRestore();
        });

        it("redacts URL-shaped site identifiers in setup summary logs", async () => {
            const infoSpy = vi
                .spyOn(logger, "info")
                .mockImplementation(() => undefined);

            const setupIndividualNewMonitors = vi
                .fn()
                .mockResolvedValue(undefined);
            const site = createTestSite(rawSiteIdentifier, {
                monitors: [createTestMonitor(rawMonitorId)],
            });

            await setupNewMonitorsOperation({
                newMonitorIds: [rawMonitorId],
                setupIndividualNewMonitors,
                site,
            });

            expect(setupIndividualNewMonitors).toHaveBeenCalledWith(
                site,
                site.monitors
            );

            const logPayload = JSON.stringify(infoSpy.mock.calls);

            expect(logPayload).toContain("https://example.com/path");
            expect(logPayload).not.toContain("site-secret");
            expect(logPayload).not.toContain("site-token");
            expect(logPayload).not.toContain("private-site");

            infoSpy.mockRestore();
        });
    });

    describe(checkSiteManuallyOperation, () => {
        it("checks a specific monitor and emits a result", async () => {
            const eventEmitter =
                createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;
            const sitesCache =
                createMockStandardizedCache<Site>() as unknown as StandardizedCache<Site>;

            const site = createTestSite("s1", {
                monitors: [createTestMonitor("m1")],
            });
            sitesCache.set(site.identifier, site);

            const monitor = site.monitors[0];
            if (!monitor) {
                throw new Error(
                    "Expected site to contain at least one monitor"
                );
            }

            const statusUpdate = createStatusUpdate({
                monitor,
                site,
            });

            const checkMonitor = vi.fn().mockResolvedValue(statusUpdate);

            const loggerStub = {
                warn: vi.fn(),
            } as unknown as Logger;

            const dependencies = {
                checkMonitor,
                eventEmitter,
                logger: loggerStub,
                sitesCache,
            };

            await expect(
                checkSiteManuallyOperation({
                    dependencies,
                    identifier: "s1",
                    monitorId: "m1",
                })
            ).resolves.toBe(statusUpdate);

            expect(checkMonitor).toHaveBeenCalledWith(site, "m1", true);
            expect(eventEmitter.emitTyped).toHaveBeenCalledWith(
                "internal:monitor:manual-check-completed",
                expect.objectContaining({
                    identifier: "s1",
                    monitorId: "m1",
                    operation: "manual-check-completed",
                    result: statusUpdate,
                })
            );
        });

        it("falls back to the first monitor ID when monitorId is omitted", async () => {
            const eventEmitter =
                createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;
            const sitesCache =
                createMockStandardizedCache<Site>() as unknown as StandardizedCache<Site>;

            const site = createTestSite("s1", {
                monitors: [createTestMonitor("m1"), createTestMonitor("m2")],
            });
            sitesCache.set(site.identifier, site);

            const checkMonitor = vi.fn().mockResolvedValue(undefined);

            const loggerStub = {
                warn: vi.fn(),
            } as unknown as Logger;

            const dependencies = {
                checkMonitor,
                eventEmitter,
                logger: loggerStub,
                sitesCache,
            };

            await expect(
                checkSiteManuallyOperation({
                    dependencies,
                    identifier: "s1",
                    monitorId: undefined,
                })
            ).resolves.toBeUndefined();

            expect(checkMonitor).toHaveBeenCalledWith(site, "m1", true);
            expect(eventEmitter.emitTyped).not.toHaveBeenCalled();
        });

        it("warns when the site has no monitors", async () => {
            const eventEmitter =
                createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;
            const sitesCache =
                createMockStandardizedCache<Site>() as unknown as StandardizedCache<Site>;

            const site = createTestSite("s1", {
                monitors: [],
            });
            sitesCache.set(site.identifier, site);

            const checkMonitor = vi.fn();

            const loggerStub = {
                warn: vi.fn(),
            } as unknown as Logger;

            const dependencies = {
                checkMonitor,
                eventEmitter,
                logger: loggerStub,
                sitesCache,
            };

            await expect(
                checkSiteManuallyOperation({
                    dependencies,
                    identifier: "s1",
                    monitorId: undefined,
                })
            ).resolves.toBeUndefined();

            expect(loggerStub.warn).toHaveBeenCalled();
            expect(checkMonitor).not.toHaveBeenCalled();
            expect(eventEmitter.emitTyped).not.toHaveBeenCalled();
        });

        it("returns without emitting when the first monitor id is falsy", async () => {
            const eventEmitter =
                createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;
            const sitesCache =
                createMockStandardizedCache<Site>() as unknown as StandardizedCache<Site>;

            const site = createTestSite("s1", {
                monitors: [createTestMonitor("")],
            });
            sitesCache.set(site.identifier, site);

            const checkMonitor = vi.fn();

            const loggerStub = {
                warn: vi.fn(),
            } as unknown as Logger;

            const dependencies = {
                checkMonitor,
                eventEmitter,
                logger: loggerStub,
                sitesCache,
            };

            await expect(
                checkSiteManuallyOperation({
                    dependencies,
                    identifier: "s1",
                    monitorId: undefined,
                })
            ).resolves.toBeUndefined();

            expect(checkMonitor).not.toHaveBeenCalled();
            expect(eventEmitter.emitTyped).not.toHaveBeenCalled();
        });

        it("does not emit when checkMonitor returns no result", async () => {
            const eventEmitter =
                createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;
            const sitesCache =
                createMockStandardizedCache<Site>() as unknown as StandardizedCache<Site>;

            const site = createTestSite("s1", {
                monitors: [createTestMonitor("m1")],
            });
            sitesCache.set(site.identifier, site);

            const checkMonitor = vi.fn().mockResolvedValue(undefined);

            const loggerStub = {
                warn: vi.fn(),
            } as unknown as Logger;

            const dependencies = {
                checkMonitor,
                eventEmitter,
                logger: loggerStub,
                sitesCache,
            };

            await expect(
                checkSiteManuallyOperation({
                    dependencies,
                    identifier: "s1",
                    monitorId: "m1",
                })
            ).resolves.toBeUndefined();

            expect(eventEmitter.emitTyped).not.toHaveBeenCalled();
        });

        it("warns and returns when the site is not provided", async () => {
            const eventEmitter =
                createMockEventBus() as unknown as TypedEventBus<UptimeEvents>;
            const sitesCache =
                createMockStandardizedCache<Site>() as unknown as StandardizedCache<Site>;

            const checkMonitor = vi.fn();

            const loggerStub = {
                warn: vi.fn(),
            } as unknown as Logger;

            const dependencies = {
                checkMonitor,
                eventEmitter,
                logger: loggerStub,
                sitesCache,
            };

            await checkSiteManuallyOperation({
                dependencies,
                identifier: "missing",
                monitorId: "m1",
            });

            expect(loggerStub.warn).toHaveBeenCalled();
            expect(checkMonitor).not.toHaveBeenCalled();
            expect(eventEmitter.emitTyped).not.toHaveBeenCalled();
        });
    });
});
