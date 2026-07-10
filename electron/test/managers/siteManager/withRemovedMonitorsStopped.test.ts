import type { Site } from "@shared/types";

import { describe, expect, it, vi } from "vitest";

import type { MonitoringConfig } from "../../../services/database/interfaces";

import { withRemovedMonitorsStopped } from "../../../managers/siteManager/withRemovedMonitorsStopped";
import { runExclusiveMonitorCheck } from "../../../services/monitoring/MonitorExecutionFence";

interface Deferred<T> {
    readonly promise: Promise<T>;
    readonly resolve: (value: T | PromiseLike<T>) => void;
}

function createDeferred<T>(): Deferred<T> {
    let resolve: Deferred<T>["resolve"] = () => undefined;
    const promise = new Promise<T>((resolvePromise) => {
        resolve = resolvePromise;
    });
    return { promise, resolve };
}

function createMonitor(id: string): Site["monitors"][number] {
    return {
        checkInterval: 5000,
        history: [],
        id,
        monitoring: true,
        responseTime: 0,
        retryAttempts: 3,
        status: "pending",
        timeout: 5000,
        type: "http",
        url: `https://example.com/${id}`,
    };
}

function createMonitoringConfig(): MonitoringConfig {
    return {
        setHistoryLimit: vi.fn().mockResolvedValue(undefined),
        setupNewMonitors: vi.fn().mockResolvedValue(undefined),
        startMonitoring: vi.fn().mockResolvedValue(true),
        stopMonitoring: vi.fn().mockResolvedValue(true),
    };
}

describe(withRemovedMonitorsStopped, () => {
    it("stops removed monitors before persisting", async () => {
        const monitoringConfig = createMonitoringConfig();
        const operation = vi.fn().mockResolvedValue("updated");

        const result = await withRemovedMonitorsStopped({
            identifier: "site-1",
            monitoringConfig,
            nextMonitors: [createMonitor("monitor-1")],
            operation,
            originalMonitors: [
                createMonitor("monitor-1"),
                createMonitor("monitor-2"),
            ],
        });

        expect(result).toBe("updated");
        expect(monitoringConfig.stopMonitoring).toHaveBeenCalledWith(
            "site-1",
            "monitor-2"
        );
        expect(monitoringConfig.stopMonitoring).toHaveBeenCalledBefore(
            operation
        );
        expect(monitoringConfig.startMonitoring).not.toHaveBeenCalled();
    });

    it("restarts stopped monitors when persistence fails", async () => {
        const monitoringConfig = createMonitoringConfig();
        const error = new Error("database update failed");
        const operation = vi.fn().mockRejectedValue(error);

        await expect(
            withRemovedMonitorsStopped({
                identifier: "site-1",
                monitoringConfig,
                nextMonitors: [createMonitor("monitor-1")],
                operation,
                originalMonitors: [
                    createMonitor("monitor-1"),
                    createMonitor("monitor-2"),
                ],
            })
        ).rejects.toBe(error);

        expect(monitoringConfig.startMonitoring).toHaveBeenCalledWith(
            "site-1",
            "monitor-2"
        );
    });

    it("reports a failed rollback together with the mutation failure", async () => {
        const monitoringConfig = createMonitoringConfig();
        const mutationError = new Error("database update failed");
        vi.mocked(monitoringConfig.startMonitoring).mockResolvedValue(false);

        const result = withRemovedMonitorsStopped({
            identifier: "site-1",
            monitoringConfig,
            nextMonitors: [createMonitor("monitor-1")],
            operation: vi.fn().mockRejectedValue(mutationError),
            originalMonitors: [
                createMonitor("monitor-1"),
                createMonitor("monitor-2"),
            ],
        });

        await expect(result).rejects.toMatchObject({
            cause: mutationError,
            errors: [
                mutationError,
                expect.objectContaining({
                    message: "Failed to restore monitor after site mutation",
                }),
            ],
            message:
                "Site mutation failed and monitor scheduling could not be fully restored",
        });
    });

    it("rolls back earlier stops when a later stop fails", async () => {
        const monitoringConfig = createMonitoringConfig();
        const error = new Error("stop failed");
        vi.mocked(monitoringConfig.stopMonitoring)
            .mockResolvedValueOnce(true)
            .mockRejectedValueOnce(error);
        const operation = vi.fn().mockResolvedValue("updated");

        await expect(
            withRemovedMonitorsStopped({
                identifier: "site-1",
                monitoringConfig,
                nextMonitors: [createMonitor("monitor-1")],
                operation,
                originalMonitors: [
                    createMonitor("monitor-1"),
                    createMonitor("monitor-2"),
                    createMonitor("monitor-3"),
                ],
            })
        ).rejects.toBe(error);

        expect(operation).not.toHaveBeenCalled();
        expect(monitoringConfig.startMonitoring).toHaveBeenCalledTimes(1);
        expect(monitoringConfig.startMonitoring).toHaveBeenCalledWith(
            "site-1",
            "monitor-2"
        );
    });

    it("does not persist when a removed monitor cannot be stopped", async () => {
        const monitoringConfig = createMonitoringConfig();
        vi.mocked(monitoringConfig.stopMonitoring).mockResolvedValue(false);
        const operation = vi.fn().mockResolvedValue("updated");

        await expect(
            withRemovedMonitorsStopped({
                identifier: "site-1",
                monitoringConfig,
                nextMonitors: [createMonitor("monitor-1")],
                operation,
                originalMonitors: [
                    createMonitor("monitor-1"),
                    createMonitor("monitor-2"),
                ],
            })
        ).rejects.toThrow("Failed to stop monitor before site mutation");

        expect(operation).not.toHaveBeenCalled();
    });

    it("blocks new manual checks through the persistence operation", async () => {
        const monitoringConfig = createMonitoringConfig();
        const mutationStarted = createDeferred<undefined>();
        const releaseMutation = createDeferred<undefined>();
        const operation = vi.fn(async () => {
            mutationStarted.resolve(undefined);
            await releaseMutation.promise;
            return "updated";
        });
        const mutation = withRemovedMonitorsStopped({
            identifier: "site-1",
            monitoringConfig,
            nextMonitors: [createMonitor("monitor-1")],
            operation,
            originalMonitors: [
                createMonitor("monitor-1"),
                createMonitor("monitor-2"),
            ],
        });
        await mutationStarted.promise;

        const manualOperation = vi.fn().mockResolvedValue("manual");
        const manualCheck = runExclusiveMonitorCheck({
            monitorId: "monitor-2",
            operation: manualOperation,
            skipIfBusy: false,
        });
        await Promise.resolve();
        expect(manualOperation).not.toHaveBeenCalled();

        releaseMutation.resolve(undefined);
        await expect(mutation).resolves.toBe("updated");
        await expect(manualCheck).resolves.toBe("manual");
    });
});
