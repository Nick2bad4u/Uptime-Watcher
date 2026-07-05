/**
 * Unit tests for the server heartbeat monitor service.
 */

import type { Site } from "@shared/types";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { MAX_HTTP_JSON_PAYLOAD_PARSE_BYTES } from "../../../services/monitoring/shared/httpMonitorJsonUtils";
import { ServerHeartbeatMonitor } from "../../../services/monitoring/ServerHeartbeatMonitor";

const httpGetMock = vi.fn();

vi.mock("../../../utils/operationalHooks", () => ({
    withOperationalHooks: vi.fn(async (operation: () => Promise<unknown>) =>
        operation()
    ),
}));

vi.mock("../../../services/monitoring/utils/httpClient", () => ({
    createHttpClient: vi.fn(() => ({
        get: httpGetMock,
    })),
}));

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
    };
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
        monitor = createMonitor({
            url: "https://api.example.com/heartbeat?token=heartbeat-secret",
        });
        const transportError = new Error(
            "Network failure token=transport-secret"
        );
        httpGetMock.mockRejectedValue(transportError);

        const result = await service.check(monitor);

        expect(result.status).toBe("down");
        expect(result.error).toContain("Failed to fetch heartbeat");
        expect(result.error).toContain("https://api.example.com/heartbeat");
        expect(result.error).toContain("token=[redacted]");
        expect(result.error).not.toContain("heartbeat-secret");
        expect(result.error).not.toContain("transport-secret");
        expect(result.details).not.toContain("heartbeat-secret");
        expect(result.details).not.toContain("transport-secret");
        expect(transportError.message).toContain("transport-secret");
    });

    it("keeps invalid JSON failures distinct from generic fetch failures", async () => {
        monitor = createMonitor({
            url: "https://api.example.com/heartbeat?token=json-secret",
        });
        httpGetMock.mockResolvedValue({
            data: "{not-json",
            responseTime: 25,
        });

        const result = await service.check(monitor);

        expect(result.status).toBe("down");
        expect(result.error).toContain("Failed to fetch heartbeat");
        expect(result.error).toContain("Invalid JSON response");
        expect(result.error).toContain("https://api.example.com/heartbeat");
        expect(result.error).not.toContain("token=");
        expect(result.error).not.toContain("json-secret");
        expect(result.error).not.toContain(
            "Failed to fetch https://api.example.com/heartbeat"
        );
    });

    it("treats empty string responses as invalid JSON", async () => {
        httpGetMock.mockResolvedValue({
            data: "",
            responseTime: 25,
        });

        const result = await service.check(monitor);

        expect(result.status).toBe("down");
        expect(result.error).toContain("Invalid JSON response");
    });

    it("rejects oversized string JSON responses before parsing", async () => {
        httpGetMock.mockResolvedValue({
            data: " ".repeat(MAX_HTTP_JSON_PAYLOAD_PARSE_BYTES + 1),
            responseTime: 25,
        });

        const result = await service.check(monitor);

        expect(result.status).toBe("down");
        expect(result.error).toContain("Invalid JSON response");
        expect(result.error).toContain("exceeds maximum parse size");
    });
});
