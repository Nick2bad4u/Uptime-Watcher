/**
 * Unit tests for the CDN edge consistency monitor service.
 */

import type { Site } from "@shared/types";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { CdnEdgeConsistencyMonitor } from "../../../services/monitoring/CdnEdgeConsistencyMonitor";

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

// Convenience helper to build monitor objects with required defaults
function createMonitor(
    overrides: Partial<Site["monitors"][0]> = {}
): Site["monitors"][0] {
    return {
        activeOperations: [],
        baselineUrl: "https://baseline.example.com/status",
        checkInterval: 60_000,
        edgeLocations:
            "https://edge-a.example.com/status\nhttps://edge-b.example.com/status",
        history: [],
        id: "cdn-edge-monitor-1",
        monitoring: true,
        responseTime: 0,
        retryAttempts: 0,
        status: "pending",
        timeout: 5000,
        type: "cdn-edge-consistency",
        ...overrides,
    };
}

describe("CdnEdgeConsistencyMonitor service", () => {
    let monitor: Site["monitors"][0];
    let service: CdnEdgeConsistencyMonitor;

    beforeEach(() => {
        vi.clearAllMocks();
        httpGetMock.mockReset();
        monitor = createMonitor();
        service = new CdnEdgeConsistencyMonitor();
    });

    it("returns up when all edges match the baseline", async () => {
        const baselineBuffer = Buffer.from("baseline-response");
        httpGetMock.mockImplementation(async (url: string) => {
            if (url === monitor.baselineUrl) {
                return {
                    data: baselineBuffer,
                    responseTime: 42,
                    status: 200,
                };
            }

            return {
                data: baselineBuffer,
                responseTime: 45,
                status: 200,
            };
        });

        const result = await service.check(monitor);

        expect(result.status).toBe("up");
        expect(result.details).toContain("match baseline");
    });

    it("returns degraded when an edge response differs from the baseline", async () => {
        const baselineBuffer = Buffer.from("baseline-response");
        httpGetMock.mockImplementation(async (url: string) => {
            if (url === monitor.baselineUrl) {
                return {
                    data: baselineBuffer,
                    responseTime: 40,
                    status: 200,
                };
            }

            if (url.includes("edge-a")) {
                return {
                    data: Buffer.from("baseline-response"),
                    responseTime: 45,
                    status: 200,
                };
            }

            return {
                data: Buffer.from("different-response"),
                responseTime: 50,
                status: 200,
            };
        });

        const result = await service.check(monitor);

        expect(result.status).toBe("degraded");
        expect(result.details).toContain("differ from baseline");
    });

    it("returns down when all edge requests fail", async () => {
        const baselineBuffer = Buffer.from("baseline-response");
        httpGetMock.mockImplementation(async (url: string) => {
            if (url === monitor.baselineUrl) {
                return {
                    data: baselineBuffer,
                    responseTime: 40,
                    status: 200,
                };
            }

            throw new Error(`Failed request for ${url}?token=edge-secret`);
        });

        const result = await service.check(monitor);

        expect(result.status).toBe("down");
        expect(result.error).toContain("Failed request");
        expect(result.error).toContain("token=[redacted]");
        expect(result.error).not.toContain("edge-secret");
        expect(result.details).not.toContain("edge-secret");
    });

    it("does not invoke responseTime accessors on edge request errors", async () => {
        const baselineBuffer = Buffer.from("baseline-response");
        const edgeError = new Error(
            "Failed edge request: token=edge-accessor-secret"
        );
        let accessCount = 0;

        Object.defineProperty(edgeError, "responseTime", {
            enumerable: true,
            get() {
                accessCount += 1;
                return 25;
            },
        });

        httpGetMock.mockImplementation(async (url: string) => {
            if (url === monitor.baselineUrl) {
                return {
                    data: baselineBuffer,
                    responseTime: 40,
                    status: 200,
                };
            }

            throw edgeError;
        });

        const result = await service.check(monitor);

        expect(result.status).toBe("down");
        expect(result.error).toContain("Failed edge request");
        expect(result.error).toContain("token=[redacted]");
        expect(result.error).not.toContain("edge-accessor-secret");
        expect(result.details).not.toContain("edge-accessor-secret");
        expect(accessCount).toBe(0);
    });

    it("returns sanitized baseline failure details without probing accessors", async () => {
        const baselineError = new Error(
            "Failed baseline request: token=baseline-accessor-secret"
        );
        let accessCount = 0;

        Object.defineProperty(baselineError, "responseTime", {
            enumerable: true,
            get() {
                accessCount += 1;
                return 25;
            },
        });

        httpGetMock.mockImplementation(async (url: string) => {
            if (url === monitor.baselineUrl) {
                throw baselineError;
            }

            return {
                data: Buffer.from("edge-response"),
                responseTime: 45,
                status: 200,
            };
        });

        const result = await service.check(monitor);

        expect(result.status).toBe("down");
        expect(result.error).toContain("Baseline request failed");
        expect(result.error).toContain("token=[redacted]");
        expect(result.error).not.toContain("baseline-accessor-secret");
        expect(result.details).not.toContain("baseline-accessor-secret");
        expect(accessCount).toBe(0);
    });

    it("validates configuration and returns error for missing baseline", async () => {
        monitor = createMonitor({ baselineUrl: "" });

        const result = await service.check(monitor);

        expect(result.status).toBe("down");
        expect(result.error).toContain("Baseline URL");
    });
});
