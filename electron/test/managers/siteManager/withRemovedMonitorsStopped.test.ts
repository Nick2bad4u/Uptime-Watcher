import type { Site } from "@shared/types";

import { describe, expect, it, vi } from "vitest";

import type { MonitoringConfig } from "../../../services/database/interfaces";

import { withRemovedMonitorsStopped } from "../../../managers/siteManager/withRemovedMonitorsStopped";

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
});
