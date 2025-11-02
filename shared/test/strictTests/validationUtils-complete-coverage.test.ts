/**
 * Exhaustive coverage for shared validation utilities.
 */

import { describe, expect, it } from "vitest";

import {
    BASE_MONITOR_TYPES,
    STATUS_KIND,
    validateMonitor,
    type Monitor,
    type MonitorType,
} from "@shared/types";
import {
    getMonitorValidationErrors,
    validateMonitorType,
    validateSite,
} from "@shared/utils/validation";

import {
    createMonitorSnapshot,
    createSiteSnapshot,
} from "../fixtures/siteFactories";

const baseMonitor = {
    checkInterval: 5000,
    history: [],
    id: "monitor-1",
    monitoring: true,
    responseTime: 120,
    retryAttempts: 0,
    status: STATUS_KIND.UP,
    timeout: 1000,
} satisfies Partial<Monitor>;

const createMonitorForType = <T extends MonitorType>(
    type: T,
    overrides: Partial<Monitor> = {}
): Partial<Monitor> => ({
    ...baseMonitor,
    type,
    url: "https://example.com",
    ...overrides,
});

describe(validateMonitorType, () => {
    it("accepts known monitor types", () => {
        for (const type of BASE_MONITOR_TYPES) {
            expect(validateMonitorType(type)).toBeTruthy();
        }
    });

    it("rejects invalid values", () => {
        expect(validateMonitorType("not-a-type")).toBeFalsy();
        expect(validateMonitorType(42)).toBeFalsy();
    });
});

describe(getMonitorValidationErrors, () => {
    it("collects core field violations", () => {
        const errors = getMonitorValidationErrors({});

        expect(errors).toContain("Monitor id is required");
        expect(errors).toContain("Monitor type is required");
        expect(errors).toContain("Monitor status is required");
    });

    it("flags invalid monitor type and status", () => {
        const errors = getMonitorValidationErrors({
            ...baseMonitor,
            id: "missing-type",
            status: "WRONG" as Monitor["status"],
            type: "definitely-invalid" as MonitorType,
        });

        expect(errors).toContain("Invalid monitor type");
        expect(errors).toContain("Invalid monitor status");
        expect(errors).toContain("Unknown monitor type: definitely-invalid");
    });

    it("enforces numeric guardrails", () => {
        const errors = getMonitorValidationErrors({
            ...createMonitorForType("http"),
            checkInterval: 500,
            retryAttempts: 99,
            timeout: 0,
        });

        expect(errors).toContain("Check interval must be at least 1000ms");
        expect(errors).toContain("Timeout must be a positive number");
        expect(errors).toContain("Retry attempts must be between 0 and 10");
    });

    describe("HTTP variants", () => {
        it("requires a URL for base HTTP monitors", () => {
            const errors = getMonitorValidationErrors(
                createMonitorForType("http", { url: undefined })
            );

            expect(errors).toContain("URL is required for HTTP monitors");
        });

        it("validates keyword monitors", () => {
            const missingKeywordErrors = getMonitorValidationErrors(
                createMonitorForType("http-keyword", {
                    url: "https://example.com",
                })
            );
            const whitespaceKeywordErrors = getMonitorValidationErrors(
                createMonitorForType("http-keyword", { bodyKeyword: "  " })
            );

            expect(missingKeywordErrors).toContain(
                "Keyword is required for HTTP keyword monitors"
            );
            expect(whitespaceKeywordErrors).toContain(
                "Keyword must not be empty"
            );
        });

        it("validates header monitors", () => {
            const missingHeaderErrors = getMonitorValidationErrors(
                createMonitorForType("http-header", {
                    expectedHeaderValue: "value",
                    headerName: undefined,
                })
            );
            const whitespaceErrors = getMonitorValidationErrors(
                createMonitorForType("http-header", {
                    expectedHeaderValue: "  ",
                    headerName: "  ",
                })
            );

            expect(missingHeaderErrors).toContain(
                "Header name is required for HTTP header monitors"
            );
            expect(whitespaceErrors).toContain("Header name must not be empty");
            expect(whitespaceErrors).toContain(
                "Expected header value must not be empty"
            );
        });

        it("validates HTTP status monitors", () => {
            const missingStatusErrors = getMonitorValidationErrors(
                createMonitorForType("http-status", {
                    expectedStatusCode: undefined,
                })
            );
            const outOfRangeErrors = getMonitorValidationErrors(
                createMonitorForType("http-status", {
                    expectedStatusCode: 42,
                })
            );

            expect(missingStatusErrors).toContain(
                "Expected status code is required for HTTP status monitors"
            );
            expect(outOfRangeErrors).toContain(
                "Expected status code must be between 100 and 599"
            );
        });

        it("validates HTTP JSON monitors", () => {
            const missingJsonPathErrors = getMonitorValidationErrors(
                createMonitorForType("http-json", {
                    expectedJsonValue: "value",
                    jsonPath: undefined,
                })
            );
            const whitespaceJsonErrors = getMonitorValidationErrors(
                createMonitorForType("http-json", {
                    expectedJsonValue: "  ",
                    jsonPath: "  ",
                })
            );

            expect(missingJsonPathErrors).toContain(
                "JSON path is required for HTTP JSON monitors"
            );
            expect(whitespaceJsonErrors).toContain(
                "JSON path must not be empty"
            );
            expect(whitespaceJsonErrors).toContain(
                "Expected JSON value must not be empty"
            );
        });

        it("validates HTTP latency monitors", () => {
            const missingLatencyErrors = getMonitorValidationErrors(
                createMonitorForType("http-latency", {
                    maxResponseTime: undefined,
                })
            );
            const invalidLatencyErrors = getMonitorValidationErrors(
                createMonitorForType("http-latency", {
                    maxResponseTime: -1,
                })
            );

            expect(missingLatencyErrors).toContain(
                "Maximum response time is required for HTTP latency monitors"
            );
            expect(invalidLatencyErrors).toContain(
                "Maximum response time must be a positive number for HTTP latency monitors"
            );
        });
    });

    describe("network monitors", () => {
        it("validates ping monitors", () => {
            const errors = getMonitorValidationErrors(
                createMonitorForType("ping", { host: undefined })
            );

            expect(errors).toContain("Host is required for ping monitors");
        });

        it("validates port monitors", () => {
            const errors = getMonitorValidationErrors(
                createMonitorForType("port", {
                    host: "example.com",
                    port: 0,
                })
            );

            expect(errors).toContain(
                "Valid port number (1-65535) is required for port monitors"
            );
        });

        it("validates DNS monitors", () => {
            const missingRecordErrors = getMonitorValidationErrors(
                createMonitorForType("dns", {
                    host: undefined,
                    recordType: undefined,
                })
            );
            const invalidTypeErrors = getMonitorValidationErrors(
                createMonitorForType("dns", {
                    host: "example.com",
                    recordType: "invalid",
                })
            );

            expect(missingRecordErrors).toContain(
                "Host is required for DNS monitors"
            );
            expect(missingRecordErrors).toContain(
                "Record type is required for DNS monitors"
            );
            expect(invalidTypeErrors).toContain(
                "Invalid record type: invalid. Valid types are: A, AAAA, ANY, CAA, CNAME, MX, NAPTR, NS, PTR, SOA, SRV, TLSA, TXT"
            );
        });

        it("validates WebSocket keepalive monitors", () => {
            const missingUrlErrors = getMonitorValidationErrors(
                createMonitorForType("websocket-keepalive", { url: undefined })
            );
            const invalidPongErrors = getMonitorValidationErrors(
                createMonitorForType("websocket-keepalive", {
                    maxPongDelayMs: 0,
                })
            );

            expect(missingUrlErrors).toContain(
                "WebSocket URL is required for keepalive monitors"
            );
            expect(invalidPongErrors).toContain(
                "Maximum pong delay must be a positive number for WebSocket keepalive monitors"
            );
        });
    });

    describe("specialized monitors", () => {
        it("validates SSL monitors", () => {
            const errors = getMonitorValidationErrors(
                createMonitorForType("ssl", {
                    certificateWarningDays: 0,
                    host: undefined,
                    port: 80,
                })
            );

            expect(errors).toContain("Host is required for SSL monitors");
            expect(errors).toContain(
                "Certificate warning threshold must be between 1 and 365 days for SSL monitors"
            );
        });

        it("validates CDN edge consistency monitors", () => {
            const missingEdgeErrors = getMonitorValidationErrors(
                createMonitorForType("cdn-edge-consistency", {
                    baselineUrl: undefined,
                    edgeLocations: undefined,
                })
            );
            const emptyEdgeErrors = getMonitorValidationErrors(
                createMonitorForType("cdn-edge-consistency", {
                    baselineUrl: "https://baseline.example.com",
                    edgeLocations: " , , ",
                })
            );
            const invalidEdgeErrors = getMonitorValidationErrors(
                createMonitorForType("cdn-edge-consistency", {
                    baselineUrl: "https://baseline.example.com",
                    edgeLocations:
                        "https://valid.example.com, ftp://invalid.example.com",
                })
            );

            expect(missingEdgeErrors).toContain(
                "Baseline URL is required for CDN edge consistency monitors"
            );
            expect(missingEdgeErrors).toContain(
                "Edge locations are required for CDN edge consistency monitors"
            );
            expect(emptyEdgeErrors).toContain(
                "At least one edge endpoint must be provided"
            );
            expect(invalidEdgeErrors).toContain(
                "Invalid edge endpoint URL: ftp://invalid.example.com"
            );
        });

        it("validates replication monitors", () => {
            const errors = getMonitorValidationErrors(
                createMonitorForType("replication", {
                    maxReplicationLagSeconds: -1,
                    primaryStatusUrl: undefined,
                    replicaStatusUrl: undefined,
                    replicationTimestampField: "  ",
                })
            );

            expect(errors).toContain(
                "Primary status URL is required for replication monitors"
            );
            expect(errors).toContain(
                "Replica status URL is required for replication monitors"
            );
            expect(errors).toContain(
                "Maximum replication lag seconds must be a non-negative number"
            );
            expect(errors).toContain(
                "Replication timestamp field is required for replication monitors"
            );
        });

        it("validates server heartbeat monitors", () => {
            const errors = getMonitorValidationErrors(
                createMonitorForType("server-heartbeat", {
                    heartbeatExpectedStatus: "  ",
                    heartbeatMaxDriftSeconds: -1,
                    heartbeatStatusField: "  ",
                    heartbeatTimestampField: undefined,
                    url: undefined,
                })
            );

            expect(errors).toContain(
                "Heartbeat URL is required for server heartbeat monitors"
            );
            expect(errors).toContain(
                "Expected status is required for server heartbeat monitors"
            );
            expect(errors).toContain(
                "Heartbeat drift tolerance must be a non-negative number"
            );
            expect(errors).toContain(
                "Heartbeat status field is required for server heartbeat monitors"
            );
            expect(errors).toContain(
                "Heartbeat timestamp field is required for server heartbeat monitors"
            );
        });
    });

    it("returns an empty array for fully valid monitors", () => {
        const validMonitor = createMonitorForType("ssl", {
            certificateWarningDays: 30,
            host: "example.com",
            port: 443,
        });

        expect(getMonitorValidationErrors(validMonitor)).toHaveLength(0);
    });
});

describe(validateSite, () => {
    it("accepts well-formed site snapshots", () => {
        const site = createSiteSnapshot();

        expect(validateSite(site)).toBeTruthy();
    });

    it("rejects malformed payloads", () => {
        expect(validateSite(null as unknown as Partial<Monitor>)).toBeFalsy();
        expect(
            validateSite({
                identifier: "",
                monitoring: true,
                monitors: [],
                name: "Example",
            })
        ).toBeFalsy();
    });

    it("rejects sites with invalid monitors", () => {
        const minimalInvalidMonitor = {
            id: "bad-monitor",
            monitoring: true,
            status: STATUS_KIND.UP,
            type: "http",
        } satisfies Partial<Monitor>;
        const invalidMonitor = minimalInvalidMonitor as unknown as Monitor;

        expect(
            validateSite({
                identifier: "site-with-invalid-monitor",
                monitoring: true,
                monitors: [invalidMonitor],
                name: "Invalid",
            })
        ).toBeFalsy();
    });

    it("delegates to validateMonitor for monitor validation", () => {
        const spySite = createSiteSnapshot();
        const monitor = createMonitorSnapshot({
            id: "monitor-to-spy",
        });
        spySite.monitors = [monitor];

        expect(validateMonitor(monitor)).toBeTruthy();
        expect(validateSite(spySite)).toBeTruthy();
    });
});
