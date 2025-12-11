/**
 * Unit tests for the replication monitor service.
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

import { ReplicationMonitor } from "../../../services/monitoring/ReplicationMonitor";

function createMonitor(
    overrides: Partial<Site["monitors"][0]> = {}
): Site["monitors"][0] {
    return {
        activeOperations: [],
        checkInterval: 60_000,
        history: [],
        id: "replication-monitor-1",
        maxReplicationLagSeconds: 5,
        monitoring: true,
        primaryStatusUrl: "https://primary.example.com/status",
        replicaStatusUrl: "https://replica.example.com/status",
        replicationTimestampField: "timestamp",
        responseTime: 0,
        retryAttempts: 0,
        status: "pending",
        timeout: 5000,
        type: "replication",
        ...overrides,
    } as Site["monitors"][0];
}

describe("ReplicationMonitor service", () => {
    let monitor: Site["monitors"][0];
    let service: ReplicationMonitor;

    beforeEach(() => {
        vi.clearAllMocks();
        httpGetMock.mockReset();
        monitor = createMonitor();
        service = new ReplicationMonitor();
    });

    it("returns up when replication lag is within threshold", async () => {
        const now = Date.now();
        httpGetMock.mockImplementation(async (url: string) => {
            if (url.includes("primary")) {
                return {
                    data: {
                        timestamp: now,
                    },
                    responseTime: 30,
                };
            }

            return {
                data: {
                    timestamp: now - 2000,
                },
                responseTime: 35,
            };
        });

        const result = await service.check(monitor);

        expect(result.status).toBe("up");
        expect(result.details).toContain("Replication lag");
    });

    it("returns degraded when replication lag exceeds threshold", async () => {
        const now = Date.now();
        monitor = createMonitor({ maxReplicationLagSeconds: 5 });
        httpGetMock.mockImplementation(async (url: string) => {
            if (url.includes("primary")) {
                return {
                    data: {
                        timestamp: now,
                    },
                    responseTime: 40,
                };
            }

            return {
                data: {
                    timestamp: now - 15_000,
                },
                responseTime: 45,
            };
        });

        const result = await service.check(monitor);

        expect(result.status).toBe("degraded");
        expect(result.details).toContain("exceeds threshold");
    });

    it("returns error when configuration is invalid", async () => {
        monitor = createMonitor({ primaryStatusUrl: "invalid" });

        const result = await service.check(monitor);

        expect(result.status).toBe("down");
        expect(result.error).toContain("Primary status URL is required");
    });

    it("returns down when fetching primary status fails", async () => {
        httpGetMock.mockImplementation(async (url: string) => {
            if (url.includes("primary")) {
                throw new Error("Primary unreachable");
            }

            return {
                data: {
                    timestamp: Date.now(),
                },
                responseTime: 50,
            };
        });

        const result = await service.check(monitor);

        expect(result.status).toBe("down");
        expect(result.error).toContain("Failed to fetch");
    });
});
