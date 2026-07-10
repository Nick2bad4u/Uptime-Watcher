import type { Monitor, Site } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import { describe, expect, it, vi } from "vitest";

import type { StatusUpdateMonitorCheckResult } from "../../../services/monitoring/MonitorStatusUpdateService";

import { performCorrelatedCheck } from "../../../services/monitoring/enhancedMonitorChecker/performCorrelatedCheck";
import { performManualCheckOperation } from "../../../services/monitoring/enhancedMonitorChecker/performManualCheck";

interface Deferred<T> {
    readonly promise: Promise<T>;
    readonly resolve: (value: T | PromiseLike<T>) => void;
}

type CorrelatedCheckArgs = Parameters<typeof performCorrelatedCheck>[0];
type DirectCheck = Parameters<
    typeof performManualCheckOperation
>[0]["performDirectCheck"];

function createDeferred<T>(): Deferred<T> {
    let resolve: Deferred<T>["resolve"] = () => undefined;
    const promise = new Promise<T>((resolvePromise) => {
        resolve = resolvePromise;
    });
    return { promise, resolve };
}

function createLogger(): Logger {
    return {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    } as unknown as Logger;
}

function createMonitor(monitorId: string): Monitor {
    return {
        checkInterval: 30_000,
        history: [],
        id: monitorId,
        monitoring: true,
        responseTime: 0,
        retryAttempts: 3,
        status: "pending",
        timeout: 10_000,
        type: "http",
        url: "https://example.com",
    };
}

function createSite(monitor: Monitor): Site {
    return {
        identifier: `site-${monitor.id}`,
        monitoring: true,
        monitors: [monitor],
        name: `Site ${monitor.id}`,
    };
}

function createCheckResult(monitorId: string): StatusUpdateMonitorCheckResult {
    return {
        monitorId,
        operationId: `operation-${monitorId}`,
        responseTime: 25,
        status: "up",
        timestamp: new Date("2026-01-01T00:00:00.000Z"),
    };
}

function createCorrelatedCheckArgs(
    monitor: Monitor,
    overrides: Partial<CorrelatedCheckArgs> = {}
): CorrelatedCheckArgs {
    return {
        cleanupFailedOperation: vi.fn().mockResolvedValue(undefined),
        executeMonitorCheck: vi
            .fn()
            .mockResolvedValue(createCheckResult(monitor.id)),
        handleSuccessfulCheck: vi.fn().mockResolvedValue(undefined),
        logger: createLogger(),
        monitor,
        monitorId: monitor.id,
        saveHistoryEntry: vi.fn().mockResolvedValue(undefined),
        setupOperationCorrelation: vi.fn().mockResolvedValue({
            operationId: `operation-${monitor.id}`,
            signal: new AbortController().signal,
        }),
        site: createSite(monitor),
        updateMonitorStatus: vi.fn().mockResolvedValue(false),
        ...overrides,
    };
}

describe(performCorrelatedCheck, () => {
    it("redacts URL-shaped identifiers before interpolating start logs", async () => {
        const info = vi.fn();
        const logger = {
            debug: vi.fn(),
            error: vi.fn(),
            info,
            warn: vi.fn(),
        } as unknown as Logger;
        const monitor = {
            checkInterval: 30_000,
            history: [],
            id: "https://user:pass@monitor.example.com/check?access_token=monitor-secret#monitor-frag",
            monitoring: true,
            responseTime: 0,
            retryAttempts: 3,
            status: "pending",
            timeout: 10_000,
            type: "http",
            url: "https://example.com",
        } satisfies Monitor;
        const site = {
            identifier:
                "https://user:pass@site.example.com/path?refresh_token=site-secret#site-frag",
            monitoring: true,
            monitors: [monitor],
            name: "Sensitive Site",
        } satisfies Site;
        const checkResult = {
            monitorId: monitor.id,
            operationId: "operation-1",
            responseTime: 25,
            status: "up",
            timestamp: new Date("2026-01-01T00:00:00.000Z"),
        } satisfies StatusUpdateMonitorCheckResult;

        await performCorrelatedCheck({
            cleanupFailedOperation: vi.fn().mockResolvedValue(undefined),
            executeMonitorCheck: vi.fn().mockResolvedValue(checkResult),
            handleSuccessfulCheck: vi.fn().mockResolvedValue(undefined),
            logger,
            monitor,
            monitorId: monitor.id,
            saveHistoryEntry: vi.fn().mockResolvedValue(undefined),
            setupOperationCorrelation: vi.fn().mockResolvedValue({
                operationId: "operation-1",
                signal: new AbortController().signal,
            }),
            site,
            updateMonitorStatus: vi.fn().mockResolvedValue(false),
        });

        const serializedInfoLogs = JSON.stringify(info.mock.calls);
        expect(serializedInfoLogs).toContain(
            "https://monitor.example.com/check"
        );
        expect(serializedInfoLogs).toContain("https://site.example.com/path");
        expect(serializedInfoLogs).not.toContain("access_token");
        expect(serializedInfoLogs).not.toContain("refresh_token");
        expect(serializedInfoLogs).not.toContain("monitor-secret");
        expect(serializedInfoLogs).not.toContain("site-secret");
        expect(serializedInfoLogs).not.toContain("pass");
        expect(serializedInfoLogs).not.toContain("frag");
    });

    it("clears persisted and in-memory operation state when a check fails", async () => {
        const monitor = createMonitor("monitor-failure-cleanup");
        const cleanupFailedOperation = vi.fn().mockResolvedValue(undefined);

        await expect(
            performCorrelatedCheck(
                createCorrelatedCheckArgs(monitor, {
                    cleanupFailedOperation,
                    executeMonitorCheck: vi
                        .fn()
                        .mockRejectedValue(new Error("check failed")),
                })
            )
        ).resolves.toBeUndefined();

        expect(cleanupFailedOperation).toHaveBeenCalledWith(
            monitor.id,
            `operation-${monitor.id}`
        );
    });

    it("waits for a same-monitor correlated check before manual side effects", async () => {
        const monitor = createMonitor("monitor-exclusive");
        const correlatedStarted = createDeferred<undefined>();
        const releaseCorrelated =
            createDeferred<StatusUpdateMonitorCheckResult>();
        const executionOrder: string[] = [];

        const correlatedPromise = performCorrelatedCheck(
            createCorrelatedCheckArgs(monitor, {
                executeMonitorCheck: vi.fn(async () => {
                    executionOrder.push("correlated-start");
                    correlatedStarted.resolve(undefined);
                    const result = await releaseCorrelated.promise;
                    executionOrder.push("correlated-end");
                    return result;
                }),
            })
        );
        await correlatedStarted.promise;

        const cancelOperations = vi.fn();
        const clearActiveOperations = vi.fn(async () => {
            executionOrder.push("manual-clear");
        });
        const performDirectCheck = vi.fn<DirectCheck>(async () => {
            executionOrder.push("manual-check");
            return undefined;
        });

        const manualPromise = performManualCheckOperation({
            config: {
                monitorRepository: { clearActiveOperations } as never,
                operationRegistry: { cancelOperations } as never,
            },
            monitor,
            monitorId: monitor.id,
            performDirectCheck,
            signal: undefined,
            site: createSite(monitor),
        });

        expect(cancelOperations).toHaveBeenCalledWith(monitor.id);
        expect(clearActiveOperations).not.toHaveBeenCalled();
        expect(performDirectCheck).not.toHaveBeenCalled();

        releaseCorrelated.resolve(createCheckResult(monitor.id));
        await correlatedPromise;
        await manualPromise;

        expect(executionOrder).toEqual([
            "correlated-start",
            "correlated-end",
            "manual-clear",
            "manual-check",
        ]);
    });

    it("does not serialize checks for different monitors", async () => {
        const correlatedMonitor = createMonitor("monitor-correlated");
        const manualMonitor = createMonitor("monitor-manual");
        const correlatedStarted = createDeferred<undefined>();
        const releaseCorrelated =
            createDeferred<StatusUpdateMonitorCheckResult>();

        const correlatedPromise = performCorrelatedCheck(
            createCorrelatedCheckArgs(correlatedMonitor, {
                executeMonitorCheck: vi.fn(async () => {
                    correlatedStarted.resolve(undefined);
                    return releaseCorrelated.promise;
                }),
            })
        );
        await correlatedStarted.promise;

        const performDirectCheck = vi
            .fn<DirectCheck>()
            .mockResolvedValue(undefined);
        await performManualCheckOperation({
            config: {
                monitorRepository: {
                    clearActiveOperations: vi.fn(),
                } as never,
                operationRegistry: { cancelOperations: vi.fn() } as never,
            },
            monitor: manualMonitor,
            monitorId: manualMonitor.id,
            performDirectCheck,
            signal: undefined,
            site: createSite(manualMonitor),
        });

        expect(performDirectCheck).toHaveBeenCalledTimes(1);

        releaseCorrelated.resolve(createCheckResult(correlatedMonitor.id));
        await correlatedPromise;
    });

    it("skips a second correlated check while the monitor is busy", async () => {
        const monitor = createMonitor("monitor-single-flight");
        const correlatedStarted = createDeferred<undefined>();
        const releaseCorrelated =
            createDeferred<StatusUpdateMonitorCheckResult>();
        const firstArgs = createCorrelatedCheckArgs(monitor, {
            executeMonitorCheck: vi.fn(async () => {
                correlatedStarted.resolve(undefined);
                return releaseCorrelated.promise;
            }),
        });
        const firstCheck = performCorrelatedCheck(firstArgs);
        await correlatedStarted.promise;

        const secondSetup = vi.fn();
        await expect(
            performCorrelatedCheck(
                createCorrelatedCheckArgs(monitor, {
                    setupOperationCorrelation: secondSetup,
                })
            )
        ).resolves.toBeUndefined();
        expect(secondSetup).not.toHaveBeenCalled();

        releaseCorrelated.resolve(createCheckResult(monitor.id));
        await firstCheck;
    });

    it("preserves manual setup errors and releases the monitor gate", async () => {
        const monitor = createMonitor("monitor-error-release");
        const site = createSite(monitor);
        const setupError = new Error("Failed to clear active operations");
        const firstDirectCheck = vi.fn<DirectCheck>();

        await expect(
            performManualCheckOperation({
                config: {
                    monitorRepository: {
                        clearActiveOperations: vi
                            .fn()
                            .mockRejectedValue(setupError),
                    } as never,
                    operationRegistry: {
                        cancelOperations: vi.fn(),
                    } as never,
                },
                monitor,
                monitorId: monitor.id,
                performDirectCheck: firstDirectCheck,
                signal: undefined,
                site,
            })
        ).rejects.toBe(setupError);
        expect(firstDirectCheck).not.toHaveBeenCalled();

        const nextDirectCheck = vi
            .fn<DirectCheck>()
            .mockResolvedValue(undefined);
        await expect(
            performManualCheckOperation({
                config: {
                    monitorRepository: {
                        clearActiveOperations: vi
                            .fn()
                            .mockResolvedValue(undefined),
                    } as never,
                    operationRegistry: {
                        cancelOperations: vi.fn(),
                    } as never,
                },
                monitor,
                monitorId: monitor.id,
                performDirectCheck: nextDirectCheck,
                signal: undefined,
                site,
            })
        ).resolves.toBeUndefined();
        expect(nextDirectCheck).toHaveBeenCalledTimes(1);
    });
});
