import { describe, expect, it, vi } from "vitest";

import type { Monitor } from "@shared/types";

import { createServicesByTypeAndStrategyRegistry } from "../../services/monitoring/enhancedMonitorChecker/createServicesByTypeAndStrategyRegistry";
import { performManualCheckOperation } from "../../services/monitoring/enhancedMonitorChecker/performManualCheck";
import { performScheduledCheckOperation } from "../../services/monitoring/enhancedMonitorChecker/performScheduledCheck";

import type {
    IMonitorService,
    MonitorCheckResult,
} from "../../services/monitoring/types";
import type { MonitorCheckContext } from "../../services/monitoring/checkContext";

import {
    createTestMonitor,
    createTestSite,
} from "../utils/enhanced-testUtilities";

describe("enhancedMonitorChecker helper modules", () => {
    describe(createServicesByTypeAndStrategyRegistry, () => {
        it("builds a service map and routes strategy execution to the correct service", async () => {
            const checkResult: MonitorCheckResult = {
                responseTime: 1,
                status: "up",
            };

            const httpService: IMonitorService = {
                check: vi.fn().mockResolvedValue(checkResult),
                getType: () => "http",
                updateConfig: vi.fn(),
            };

            const pingService: IMonitorService = {
                check: vi.fn().mockResolvedValue(checkResult),
                getType: () => "ping",
                updateConfig: vi.fn(),
            };

            const getServiceForType = vi
                .fn<(type: Monitor["type"]) => IMonitorService>()
                .mockImplementation((type) =>
                    type === "http" ? httpService : pingService
                );

            const { servicesByType, strategyRegistry } =
                createServicesByTypeAndStrategyRegistry({
                    getServiceForType,
                    registeredTypes: ["http", "ping"],
                });

            expect(getServiceForType).toHaveBeenCalledTimes(2);
            expect(servicesByType.get("http")).toBe(httpService);
            expect(servicesByType.get("ping")).toBe(pingService);

            const signal = new AbortController().signal;
            const monitor = createTestMonitor("m1", { type: "ping" });
            const site = createTestSite("s1", {
                monitoring: true,
                monitors: [monitor],
            });

            const context: MonitorCheckContext = {
                monitor,
                signal,
                site,
            };

            await expect(
                strategyRegistry.execute(monitor, context)
            ).resolves.toEqual(checkResult);

            expect(pingService.check).toHaveBeenCalledWith(monitor, signal);
            expect(httpService.check).not.toHaveBeenCalled();
        });

        it("throws when a service is removed from the returned map", async () => {
            const service: IMonitorService = {
                check: vi
                    .fn()
                    .mockResolvedValue({ responseTime: 1, status: "up" }),
                getType: () => "http",
                updateConfig: vi.fn(),
            };

            const { servicesByType, strategyRegistry } =
                createServicesByTypeAndStrategyRegistry({
                    getServiceForType: () => service,
                    registeredTypes: ["http"],
                });

            servicesByType.delete("http");

            const monitor = createTestMonitor("m1", { type: "http" });
            const site = createTestSite("s1", {
                monitoring: true,
                monitors: [monitor],
            });

            await expect(
                strategyRegistry.execute(monitor, {
                    monitor,
                    site,
                    signal: new AbortController().signal,
                })
            ).rejects.toThrowError(/no monitor service registered/i);
        });
    });

    describe(performScheduledCheckOperation, () => {
        it("skips when a monitor is not monitoring", async () => {
            const logger = {
                debug: vi.fn(),
            };

            const monitor = createTestMonitor("m1", { monitoring: false });
            const site = createTestSite("s1", {
                monitoring: true,
                monitors: [monitor],
            });

            const performCorrelatedCheck = vi.fn();

            await expect(
                performScheduledCheckOperation({
                    logger: logger as never,
                    monitor,
                    monitorId: monitor.id,
                    performCorrelatedCheck,
                    signal: undefined,
                    site,
                })
            ).resolves.toBeUndefined();

            expect(logger.debug).toHaveBeenCalledTimes(1);
            expect(performCorrelatedCheck).not.toHaveBeenCalled();
        });

        it("delegates to performCorrelatedCheck when monitoring is enabled", async () => {
            const logger = {
                debug: vi.fn(),
            };

            const monitor = createTestMonitor("m1", { monitoring: true });
            const site = createTestSite("s1", {
                monitoring: true,
                monitors: [monitor],
            });

            const expected = { status: "up" };
            const signal = new AbortController().signal;

            const performCorrelatedCheck = vi.fn().mockResolvedValue(expected);

            await expect(
                performScheduledCheckOperation({
                    logger: logger as never,
                    monitor,
                    monitorId: monitor.id,
                    performCorrelatedCheck,
                    signal,
                    site,
                })
            ).resolves.toBe(expected);

            expect(performCorrelatedCheck).toHaveBeenCalledWith(
                site,
                monitor,
                monitor.id,
                signal
            );
        });
    });

    describe(performManualCheckOperation, () => {
        it("cancels correlated operations, clears active operations, and performs a direct check", async () => {
            const monitor = createTestMonitor("m1", { timeout: 10 });
            const site = createTestSite("s1", {
                monitoring: true,
                monitors: [monitor],
            });

            const operationRegistry = {
                cancelOperations: vi.fn(),
            };

            const monitorRepository = {
                clearActiveOperations: vi.fn().mockResolvedValue(undefined),
            };

            const performDirectCheck = vi.fn().mockResolvedValue(undefined);

            await performManualCheckOperation({
                config: {
                    monitorRepository: monitorRepository as never,
                    operationRegistry: operationRegistry as never,
                },
                monitor,
                monitorId: monitor.id,
                performDirectCheck,
                signal: undefined,
                site,
            });

            expect(operationRegistry.cancelOperations).toHaveBeenCalledWith(
                monitor.id
            );
            expect(
                monitorRepository.clearActiveOperations
            ).toHaveBeenCalledWith(monitor.id);

            expect(performDirectCheck).toHaveBeenCalledWith(
                site,
                monitor,
                true,
                expect.any(AbortSignal)
            );

            const directSignal = (performDirectCheck.mock.calls[0] ?? [])[3];
            expect((directSignal as AbortSignal).aborted).toBeFalsy();
        });

        it("propagates an already-aborted external signal", async () => {
            const monitor = createTestMonitor("m1", { timeout: 10 });
            const site = createTestSite("s1", {
                monitoring: true,
                monitors: [monitor],
            });

            const operationRegistry = {
                cancelOperations: vi.fn(),
            };

            const monitorRepository = {
                clearActiveOperations: vi.fn().mockResolvedValue(undefined),
            };

            const performDirectCheck = vi.fn().mockResolvedValue(undefined);

            const controller = new AbortController();
            controller.abort();

            await performManualCheckOperation({
                config: {
                    monitorRepository: monitorRepository as never,
                    operationRegistry: operationRegistry as never,
                },
                monitor,
                monitorId: monitor.id,
                performDirectCheck,
                signal: controller.signal,
                site,
            });

            const directSignal = (performDirectCheck.mock.calls[0] ?? [])[3];
            expect((directSignal as AbortSignal).aborted).toBeTruthy();
        });
    });
});
