/**
 * Unit tests for the server heartbeat monitor service.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "@shared/types";

const httpGetMock = vi.fn();

vi.mock("../../../utils/operationalHooks", () => ({
    withOperationalHooks: vi.fn(async (operation: () => Promise<unknown>) =>
        operation()),
}));

vi.mock("../../../services/monitoring/utils/httpClient", () => ({
    createHttpClient: vi.fn(() => ({
        get: httpGetMock,
    })),
}));

import { ServerHeartbeatMonitor } from "../../../services/monitoring/ServerHeartbeatMonitor";

function createMonitor(
    overrides: Partial<Site["monitors"][0]> = {}
): Site["monitors"][0] {
    return {
        activeOperations: [],
        checkInterval: 60_000,
        heartbeatExpectedStatus: "healthy",
        heartbeatMaxDriftSeconds: 60,
        heartbeatStatusField: "status",
        heartbeatTimestampField: "timestamp",
        history: [],
        id: "heartbeat-monitor-1",
        monitoring: true,
        responseTime: 0,
        retryAttempts: 0,
        status: "pending",
        timeout: 5000,
        type: "server-heartbeat",
        url: "https://api.example.com/heartbeat",
        ...overrides,
    } as Site["monitors"][0];
}

describe("ServerHeartbeatMonitor service", () => {
    let monitor: Site["monitors"][0];
    let service: ServerHeartbeatMonitor;

    beforeEach(() => {
        vi.clearAllMocks();
        httpGetMock.mockReset();
        monitor = createMonitor();
        service = new ServerHeartbeatMonitor();
    });

    it("returns up when heartbeat status and drift are acceptable", async () => {
        httpGetMock.mockResolvedValue({
            data: {
                status: "healthy",
                timestamp: Date.now(),
            },
            responseTime: 25,
        });

        const result = await service.check(monitor);

        expect(result.status).toBe("up");
        expect(result.details).toContain("Status: healthy");
    });

    it("returns degraded when status differs from expected", async () => {
        httpGetMock.mockResolvedValue({
            data: {
                status: "offline",
                timestamp: Date.now(),
            },
            responseTime: 30,
        });

        const result = await service.check(monitor);

        expect(result.status).toBe("degraded");
        expect(result.error).toContain("Expected heartbeat status");
    });

    it("returns degraded when drift exceeds configured maximum", async () => {
        const staleTimestamp = Date.now() - 5 * 60_000;
        monitor = createMonitor({ heartbeatMaxDriftSeconds: 60 });
        httpGetMock.mockResolvedValue({
            data: {
                status: "healthy",
                timestamp: staleTimestamp,
            },
            responseTime: 35,
        });

        const result = await service.check(monitor);

        expect(result.status).toBe("degraded");
        expect(result.details).toContain("Drift");
    });

    it("returns error when configuration is invalid", async () => {
        monitor = createMonitor({ url: "invalid-url" });

        const result = await service.check(monitor);

        expect(result.status).toBe("down");
        expect(result.error).toContain(
            "Heartbeat monitor requires a valid URL"
        );
    });

    it("returns down result when fetching heartbeat fails", async () => {
        httpGetMock.mockRejectedValue(new Error("Network failure"));

        const result = await service.check(monitor);

        expect(result.status).toBe("down");
        expect(result.error).toContain("Failed to fetch heartbeat");
    });
});
