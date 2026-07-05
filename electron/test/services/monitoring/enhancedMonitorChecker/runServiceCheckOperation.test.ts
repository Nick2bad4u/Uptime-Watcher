import type { Monitor, Site } from "@shared/types";

import { describe, expect, it, vi } from "vitest";

import type { MonitorCheckContext } from "../../../../services/monitoring/checkContext";
import type { MonitorStrategyRegistry } from "../../../../services/monitoring/strategies/MonitorStrategyRegistry";

import { runServiceCheckOperation } from "../../../../services/monitoring/enhancedMonitorChecker/runServiceCheck";

const createMonitor = (overrides: Partial<Monitor> = {}): Monitor => ({
    checkInterval: 60_000,
    history: [],
    id: "monitor-1",
    monitoring: true,
    responseTime: 0,
    retryAttempts: 3,
    status: "pending",
    timeout: 30_000,
    type: "http",
    url: "https://example.com",
    ...overrides,
});

const createSite = (monitor: Monitor): Site => ({
    identifier: "site-1",
    monitoring: true,
    monitors: [monitor],
    name: "Site 1",
});

describe(runServiceCheckOperation, () => {
    it("sanitizes thrown monitor strategy errors before building failure results", async () => {
        const monitor = createMonitor();
        const context: MonitorCheckContext = {
            monitor,
            site: createSite(monitor),
        };

        const strategyRegistry: MonitorStrategyRegistry = {
            execute: vi
                .fn()
                .mockRejectedValue(
                    new Error(
                        "Monitor failed: https://example.com/callback?token=SECRET"
                    )
                ),
        };

        const result = await runServiceCheckOperation({
            context,
            operationId: "operation-1",
            strategyRegistry,
        });

        expect(result.serviceResult).toMatchObject({
            details:
                "Monitor failed: https://example.com/callback?token=[redacted]",
            responseTime: 0,
            status: "down",
        });
        expect(result.checkResult.details).toBe(
            "Monitor failed: https://example.com/callback?token=[redacted]"
        );
        expect(result.checkResult.monitorId).toBe(monitor.id);
        expect(result.checkResult.operationId).toBe("operation-1");
        expect(result.checkResult.status).toBe("down");
    });

    it("uses the shared fallback for blank thrown monitor strategy messages", async () => {
        const monitor = createMonitor();
        const context: MonitorCheckContext = {
            monitor,
            site: createSite(monitor),
        };

        const strategyRegistry: MonitorStrategyRegistry = {
            execute: vi.fn().mockRejectedValue(new Error(" ".repeat(3))),
        };

        const result = await runServiceCheckOperation({
            context,
            operationId: "operation-2",
            strategyRegistry,
        });

        expect(result.serviceResult.details).toBe("Unknown error");
        expect(result.checkResult.details).toBe("Unknown error");
    });
});
