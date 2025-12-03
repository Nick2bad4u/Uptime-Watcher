import type { Monitor } from "@shared/types";
import { describe, it, expect, vi } from "vitest";

import { createMonitorStrategyRegistry } from "../../../services/monitoring/strategies/MonitorStrategyRegistry";

const mockMonitor = (overrides: Partial<Monitor> = {}): Monitor => ({
    activeOperations: [],
    checkInterval: 30_000,
    id: overrides.id ?? "monitor-http",
    lastChecked: new Date(),
    monitoring: true,
    retryAttempts: 0,
    history: [],
    responseTime: overrides.responseTime ?? 0,
    status: overrides.status ?? "up",
    timeout: overrides.timeout ?? 5000,
    type: overrides.type ?? "http",
    url: overrides.url ?? "https://example.com",
});

describe("MonitorStrategyRegistry", () => {
    it("delegates to registered services", async () => {
        const service = {
            check: vi.fn().mockResolvedValue({
                details: "OK",
                responseTime: 50,
                status: "up" as const,
            }),
            getType: () => "http" as const,
            updateConfig: vi.fn(),
        };

        const registry = createMonitorStrategyRegistry([
            { getService: () => service, type: service.getType() },
        ]);

        const monitor = mockMonitor();
        const result = await registry.execute(monitor);

        expect(service.check).toHaveBeenCalledWith(monitor, undefined);
        expect(result.status).toBe("up");
        expect(result.details).toBe("OK");
    });

    it("returns default response for unknown types", async () => {
        const registry = createMonitorStrategyRegistry([]);
        const monitor = mockMonitor({ type: "dns" });

        const result = await registry.execute(monitor);

        expect(result.status).toBe("down");
        expect(result.details).toContain("Unknown monitor type");
    });
});
