/**
 * Unit tests for the CDN edge consistency monitor service.
 */

import type { Site } from "@shared/types";

import { MAX_CDN_EDGE_CONSISTENCY_ENDPOINTS } from "@shared/constants/monitoring";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CDN_EDGE_CONSISTENCY_CONCURRENCY } from "../../../constants";
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

    it("bounds concurrent edge endpoint requests", async () => {
        const baselineBuffer = Buffer.from("baseline-response");
        const edgeLocations = Array.from(
            { length: CDN_EDGE_CONSISTENCY_CONCURRENCY + 3 },
            (_, index) => `https://edge-${index}.example.com/status`
        ).join("\n");
        let activeEdgeRequests = 0;
        let maxActiveEdgeRequests = 0;

        monitor = createMonitor({ edgeLocations });

        httpGetMock.mockImplementation(async (url: string) => {
            if (url === monitor.baselineUrl) {
                return {
                    data: baselineBuffer,
                    responseTime: 42,
                    status: 200,
                };
            }

            activeEdgeRequests += 1;
            maxActiveEdgeRequests = Math.max(
                maxActiveEdgeRequests,
                activeEdgeRequests
            );

            await new Promise((resolve) => {
                setTimeout(resolve, 1);
            });

            activeEdgeRequests -= 1;

            return {
                data: baselineBuffer,
                responseTime: 45,
                status: 200,
            };
        });

        const result = await service.check(monitor);

        expect(result.status).toBe("up");
        expect(maxActiveEdgeRequests).toBeLessThanOrEqual(
            CDN_EDGE_CONSISTENCY_CONCURRENCY
        );
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

    it("redacts edge endpoint URL secrets from all-failed summaries", async () => {
        const baselineBuffer = Buffer.from("baseline-response");
        monitor = createMonitor({
            edgeLocations:
                "https://edge-a.example.com/status?token=edge-url-secret\nhttps://edge-b.example.com/status?api_key=edge-api-secret",
        });

        httpGetMock.mockImplementation(async (url: string) => {
            if (url === monitor.baselineUrl) {
                return {
                    data: baselineBuffer,
                    responseTime: 40,
                    status: 200,
                };
            }

            throw new Error("Failed request");
        });

        const result = await service.check(monitor);

        expect(result.status).toBe("down");
        expect(result.error).toContain("https://edge-a.example.com/status");
        expect(result.error).toContain("https://edge-b.example.com/status");
        expect(result.error).not.toContain("token=");
        expect(result.error).not.toContain("api_key=");
        expect(result.error).not.toContain("edge-url-secret");
        expect(result.error).not.toContain("edge-api-secret");
        expect(result.details).not.toContain("edge-url-secret");
        expect(result.details).not.toContain("edge-api-secret");
    });

    it("redacts edge endpoint URL secrets from degraded summaries", async () => {
        const baselineBuffer = Buffer.from("baseline-response");
        monitor = createMonitor({
            edgeLocations:
                "https://edge-a.example.com/status?token=edge-match-secret\nhttps://edge-b.example.com/status?token=edge-mismatch-secret",
        });

        httpGetMock.mockImplementation(async (url: string) => {
            if (url === monitor.baselineUrl || url.includes("edge-a")) {
                return {
                    data: baselineBuffer,
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
        expect(result.details).toContain("https://edge-b.example.com/status");
        expect(result.details).not.toContain("token=");
        expect(result.details).not.toContain("edge-match-secret");
        expect(result.details).not.toContain("edge-mismatch-secret");
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

    it("rejects excessive edge endpoint lists before making requests", async () => {
        const edgeLocations = Array.from(
            { length: MAX_CDN_EDGE_CONSISTENCY_ENDPOINTS + 1 },
            (_, index) => `https://edge-${index}.example.com/status`
        ).join("\n");

        monitor = createMonitor({ edgeLocations });

        const result = await service.check(monitor);

        expect(result.status).toBe("down");
        expect(result.error).toBe(
            `CDN edge consistency monitors support up to ${MAX_CDN_EDGE_CONSISTENCY_ENDPOINTS} edge endpoints`
        );
        expect(httpGetMock).not.toHaveBeenCalled();
    });
});
