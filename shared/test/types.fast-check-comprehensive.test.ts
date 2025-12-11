/**
 * Comprehensive Fast-Check Property-Based Tests for shared/types.ts
 *
 * This test file specifically targets 100% function coverage for all functions
 * in shared/types.ts using property-based testing. The current coverage shows
 * only 50% function coverage (5/10), so this aims to exercise all functions
 * comprehensively.
 *
 * Target Functions:
 *
 * - IsValidActiveOperations (internal function)
 * - IsComputedSiteStatus
 * - IsMonitorStatus
 * - IsSiteStatus
 * - ValidateMonitor
 *
 * Plus any exported co test.prop([fc.record({ id: fc.string({ minLength: 1 }),
 * type: fc.constantFrom(...BASE_MONITOR_TYPES), status: fc.constantFrom("down",
 * "paused", "pending", "up"), monitoring: fc.boolean(), responseTime: fc.nat(),
 * checkInterval: fc.nat(), timeout: fc.nat(), retryAttempts: fc.nat(), history:
 * fc.array(fc.anything()), activeOperations: fc.array(fc.constantFrom(" ", " \t
 * ", " \n ", ""), { minLength: 1 }) })])( "should return false when
 * activeOperations contains whitespace-only strings",
 * (monitorWithWhitespaceActiveOps: any) => {
 * expect(validateMonitor(monitorWithWhitespaceActiveOps)).toBeFalsy(); }
 * );constructors.
 */

import { describe, it, expect } from "vitest";
import { test } from "@fast-check/vitest";
import fc from "fast-check";

// Import all functions and types from shared/types.ts
import {
    isComputedSiteStatus,
    isMonitorStatus,
    isSiteStatus,
    validateMonitor,
    type Monitor,
    type MonitorStatus,
    type MonitorType,
    type SiteStatus,
    BASE_MONITOR_TYPES,
    MONITOR_STATUS,
    DEFAULT_MONITOR_STATUS,
    DEFAULT_SITE_STATUS,
} from "../types";

const createMonitorSample = (
    overrides: Partial<Monitor> & Pick<Monitor, "id" | "type">
): Monitor =>
    ({
        activeOperations: [],
        checkInterval: 60 * 1000,
        history: [],
        monitoring: true,
        responseTime: 0,
        retryAttempts: 2,
        status: "up",
        timeout: 5 * 1000,
        ...overrides,
    }) as Monitor;

const VALID_MONITOR_SAMPLES: readonly Monitor[] = [
    createMonitorSample({
        id: "monitor-http",
        type: "http",
        url: "https://example.com",
    }),
    createMonitorSample({
        bodyKeyword: "healthy",
        id: "monitor-http-keyword",
        type: "http-keyword",
        url: "https://example.com/search",
    }),
    createMonitorSample({
        expectedStatusCode: 200,
        id: "monitor-http-status",
        type: "http-status",
        url: "https://example.com/status",
    }),
    createMonitorSample({
        expectedHeaderValue: "application/json",
        headerName: "content-type",
        id: "monitor-http-header",
        type: "http-header",
        url: "https://example.com/data",
    }),
    createMonitorSample({
        expectedJsonValue: "ok",
        id: "monitor-http-json",
        jsonPath: "$.status",
        type: "http-json",
        url: "https://example.com/api",
    }),
    createMonitorSample({
        id: "monitor-http-latency",
        maxResponseTime: 15 * 100,
        type: "http-latency",
        url: "https://example.com/perf",
    }),
    createMonitorSample({
        host: "services.internal",
        id: "monitor-port",
        port: 443,
        type: "port",
    }),
    createMonitorSample({
        host: "services.internal",
        id: "monitor-ping",
        type: "ping",
    }),
    createMonitorSample({
        host: "example.com",
        id: "monitor-dns",
        recordType: "A",
        type: "dns",
    }),
    createMonitorSample({
        certificateWarningDays: 30,
        host: "secure.example.com",
        id: "monitor-ssl",
        port: 443,
        type: "ssl",
    }),
    createMonitorSample({
        id: "monitor-websocket",
        maxPongDelayMs: 15 * 100,
        type: "websocket-keepalive",
        url: "wss://example.com/socket",
    }),
    createMonitorSample({
        heartbeatExpectedStatus: "ok",
        heartbeatMaxDriftSeconds: 120,
        heartbeatStatusField: "status",
        heartbeatTimestampField: "timestamp",
        id: "monitor-heartbeat",
        type: "server-heartbeat",
        url: "https://example.com/heartbeat",
    }),
    createMonitorSample({
        id: "monitor-replication",
        maxReplicationLagSeconds: 15,
        primaryStatusUrl: "https://primary.example.com/status",
        replicaStatusUrl: "https://replica.example.com/status",
        replicationTimestampField: "lastApplied",
        type: "replication",
    }),
    createMonitorSample({
        baselineUrl: "https://origin.example.com",
        edgeLocations: "https://edge1.example.com\nhttps://edge2.example.com",
        id: "monitor-cdn",
        type: "cdn-edge-consistency",
    }),
];

describe("Fast-Check Property-Based Tests for shared/types.ts Functions", () => {
    describe("isComputedSiteStatus property-based tests", () => {
        test.prop([fc.string()])(
            "should return true only for 'mixed' and 'unknown' strings",
            (input: string) => {
                const result = isComputedSiteStatus(input);

                if (input === "mixed" || input === "unknown") {
                    expect(result).toBeTruthy();
                } else {
                    expect(result).toBeFalsy();
                }
            }
        );

        test.prop([fc.anything()])(
            "should return false for non-string inputs",
            (input: unknown) => {
                if (typeof input !== "string") {
                    expect(isComputedSiteStatus(input as string)).toBeFalsy();
                }
            }
        );

        test.prop([fc.oneof(fc.constant("mixed"), fc.constant("unknown"))])(
            "should always return true for valid computed site statuses",
            (validStatus: "mixed" | "unknown") => {
                expect(isComputedSiteStatus(validStatus)).toBeTruthy();
            }
        );
    });

    describe("isMonitorStatus property-based tests", () => {
        const validMonitorStatuses = [
            "degraded",
            "down",
            "paused",
            "pending",
            "up",
        ] as const;

        test.prop([fc.constantFrom(...validMonitorStatuses)])(
            "should return true for all valid monitor statuses",
            (status: MonitorStatus) => {
                expect(isMonitorStatus(status)).toBeTruthy();
            }
        );

        test.prop([
            fc
                .string()
                .filter(
                    (s) => !validMonitorStatuses.includes(s as MonitorStatus)
                ),
        ])("should return false for invalid monitor statuses", (
            invalidStatus: string
        ) => {
            expect(isMonitorStatus(invalidStatus)).toBeFalsy();
        });

        test.prop([fc.anything()])(
            "should return false for non-string inputs",
            (input: unknown) => {
                if (typeof input !== "string") {
                    expect(isMonitorStatus(input as string)).toBeFalsy();
                }
            }
        );

        test.prop([
            fc.oneof(
                fc.constant("mixed"),
                fc.constant("unknown"),
                fc
                    .string({ minLength: 1 })
                    .filter(
                        (s) =>
                            !validMonitorStatuses.includes(s as MonitorStatus)
                    )
            ),
        ])(
            "should return false for computed site statuses and other invalid strings",
            (invalidStatus: string) => {
                expect(isMonitorStatus(invalidStatus)).toBeFalsy();
            }
        );
    });

    describe("isSiteStatus property-based tests", () => {
        const validSiteStatuses = [
            "degraded",
            "down",
            "mixed",
            "paused",
            "pending",
            "unknown",
            "up",
        ] as const;

        test.prop([fc.constantFrom(...validSiteStatuses)])(
            "should return true for all valid site statuses",
            (status: SiteStatus) => {
                expect(isSiteStatus(status)).toBeTruthy();
            }
        );

        test.prop([
            fc
                .string()
                .filter((s) => !validSiteStatuses.includes(s as SiteStatus)),
        ])("should return false for invalid site statuses", (
            invalidStatus: string
        ) => {
            expect(isSiteStatus(invalidStatus)).toBeFalsy();
        });

        test.prop([fc.anything()])(
            "should return false for non-string inputs",
            (input: unknown) => {
                if (typeof input !== "string") {
                    expect(isSiteStatus(input as string)).toBeFalsy();
                }
            }
        );

        test.prop([
            fc
                .string({ minLength: 1 })
                .filter((s) => !validSiteStatuses.includes(s as SiteStatus)),
        ])("should return false for random invalid strings", (
            invalidStatus: string
        ) => {
            expect(isSiteStatus(invalidStatus)).toBeFalsy();
        });
    });

    describe("validateMonitor property-based tests", () => {
        // Generator for valid Monitor objects
        const validMonitorArbitrary = fc.constantFrom(...VALID_MONITOR_SAMPLES);

        test.prop([validMonitorArbitrary])(
            "should return true for valid Monitor objects",
            (monitor: Monitor) => {
                expect(validateMonitor(monitor)).toBeTruthy();
            }
        );

        test.prop([
            fc.record({
                id: fc.anything().filter((x) => typeof x !== "string"),
                type: fc.constantFrom(...BASE_MONITOR_TYPES),
                status: fc.constantFrom("down", "paused", "pending", "up"),
                monitoring: fc.boolean(),
                responseTime: fc.nat(),
                checkInterval: fc.nat(),
                timeout: fc.nat(),
                retryAttempts: fc.nat(),
                history: fc.array(fc.anything()),
            }),
        ])("should return false when id is not a string", (
            invalidMonitor: any
        ) => {
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        test.prop([
            fc.record({
                id: fc.string(),
                type: fc
                    .string()
                    .filter(
                        (t) => !BASE_MONITOR_TYPES.includes(t as MonitorType)
                    ),
                status: fc.constantFrom("down", "paused", "pending", "up"),
                monitoring: fc.boolean(),
                responseTime: fc.nat(),
                checkInterval: fc.nat(),
                timeout: fc.nat(),
                retryAttempts: fc.nat(),
                history: fc.array(fc.anything()),
            }),
        ])("should return false when type is not a valid MonitorType", (
            invalidMonitor: any
        ) => {
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        test.prop([
            fc.record({
                id: fc.string(),
                type: fc.constantFrom(...BASE_MONITOR_TYPES),
                status: fc.string().filter(
                    (s) =>
                        ![
                            "down",
                            "paused",
                            "pending",
                            "up",
                        ].includes(s)
                ),
                monitoring: fc.boolean(),
                responseTime: fc.nat(),
                checkInterval: fc.nat(),
                timeout: fc.nat(),
                retryAttempts: fc.nat(),
                history: fc.array(fc.anything()),
            }),
        ])("should return false when status is not a valid MonitorStatus", (
            invalidMonitor: any
        ) => {
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        test.prop([
            fc.record({
                id: fc.string(),
                type: fc.constantFrom(...BASE_MONITOR_TYPES),
                status: fc.constantFrom("down", "paused", "pending", "up"),
                monitoring: fc.anything().filter((x) => typeof x !== "boolean"),
                responseTime: fc.nat(),
                checkInterval: fc.nat(),
                timeout: fc.nat(),
                retryAttempts: fc.nat(),
                history: fc.array(fc.anything()),
            }),
        ])("should return false when monitoring is not a boolean", (
            invalidMonitor: any
        ) => {
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        test.prop([
            fc.record({
                id: fc.string(),
                type: fc.constantFrom(...BASE_MONITOR_TYPES),
                status: fc.constantFrom("down", "paused", "pending", "up"),
                monitoring: fc.boolean(),
                responseTime: fc
                    .anything()
                    .filter((x) => typeof x !== "number"),
                checkInterval: fc.nat(),
                timeout: fc.nat(),
                retryAttempts: fc.nat(),
                history: fc.array(fc.anything()),
            }),
        ])("should return false when responseTime is not a number", (
            invalidMonitor: any
        ) => {
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        test.prop([
            fc.record({
                id: fc.string(),
                type: fc.constantFrom(...BASE_MONITOR_TYPES),
                status: fc.constantFrom("down", "paused", "pending", "up"),
                monitoring: fc.boolean(),
                responseTime: fc.nat(),
                checkInterval: fc
                    .anything()
                    .filter((x) => typeof x !== "number"),
                timeout: fc.nat(),
                retryAttempts: fc.nat(),
                history: fc.array(fc.anything()),
            }),
        ])("should return false when checkInterval is not a number", (
            invalidMonitor: any
        ) => {
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        test.prop([
            fc.record({
                id: fc.string(),
                type: fc.constantFrom(...BASE_MONITOR_TYPES),
                status: fc.constantFrom("down", "paused", "pending", "up"),
                monitoring: fc.boolean(),
                responseTime: fc.nat(),
                checkInterval: fc.nat(),
                timeout: fc.anything().filter((x) => typeof x !== "number"),
                retryAttempts: fc.nat(),
                history: fc.array(fc.anything()),
            }),
        ])("should return false when timeout is not a number", (
            invalidMonitor: any
        ) => {
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        test.prop([
            fc.record({
                id: fc.string(),
                type: fc.constantFrom(...BASE_MONITOR_TYPES),
                status: fc.constantFrom("down", "paused", "pending", "up"),
                monitoring: fc.boolean(),
                responseTime: fc.nat(),
                checkInterval: fc.nat(),
                timeout: fc.nat(),
                retryAttempts: fc
                    .anything()
                    .filter((x) => typeof x !== "number"),
                history: fc.array(fc.anything()),
            }),
        ])("should return false when retryAttempts is not a number", (
            invalidMonitor: any
        ) => {
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        test.prop([
            fc.record({
                id: fc.string(),
                type: fc.constantFrom(...BASE_MONITOR_TYPES),
                status: fc.constantFrom("down", "paused", "pending", "up"),
                monitoring: fc.boolean(),
                responseTime: fc.nat(),
                checkInterval: fc.nat(),
                timeout: fc.nat(),
                retryAttempts: fc.nat(),
                history: fc.anything().filter((x) => !Array.isArray(x)),
            }),
        ])("should return false when history is not an array", (
            invalidMonitor: any
        ) => {
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        test.prop([
            fc.record({
                id: fc.string(),
                type: fc.constantFrom(...BASE_MONITOR_TYPES),
                status: fc.constantFrom("down", "paused", "pending", "up"),
                monitoring: fc.boolean(),
                responseTime: fc.nat(),
                checkInterval: fc.nat(),
                timeout: fc.nat(),
                retryAttempts: fc.nat(),
                history: fc.array(fc.anything()),
                activeOperations: fc.oneof(
                    fc.string(),
                    fc.integer(),
                    fc.boolean(),
                    fc.object(),
                    fc.array(
                        fc.anything().filter((x) => typeof x !== "string"),
                        { minLength: 1 }
                    ),
                    fc.array(
                        fc.string().filter((s) => s.trim().length === 0),
                        { minLength: 1 }
                    )
                ),
            }),
        ])("should return false when activeOperations is invalid", (
            invalidMonitor: any
        ) => {
            expect(validateMonitor(invalidMonitor)).toBeFalsy();
        });

        test.prop([
            fc.oneof(
                fc.constant(null),
                fc.constant(undefined),
                fc.string(),
                fc.integer(),
                fc.boolean(),
                fc.array(fc.anything())
            ),
        ])("should return false for null, undefined, or non-object inputs", (
            invalidInput: any
        ) => {
            expect(validateMonitor(invalidInput)).toBeFalsy();
        });

        // Test valid activeOperations arrays
        test.prop([
            fc.record({
                id: fc.string({ minLength: 1 }),
                type: fc.constantFrom(...BASE_MONITOR_TYPES),
                status: fc.constantFrom("down", "paused", "pending", "up"),
                monitoring: fc.boolean(),
                responseTime: fc.nat(),
                checkInterval: fc.nat(),
                timeout: fc.nat(),
                retryAttempts: fc.nat(),
                history: fc.array(fc.anything()),
                activeOperations: fc.array(
                    fc
                        .string({ minLength: 1 })
                        .filter((s) => s.trim().length > 0),
                    { maxLength: 5 }
                ),
            }),
        ])("should return true when activeOperations contains valid strings", (
            monitorWithActiveOps: any
        ) => {
            expect(validateMonitor(monitorWithActiveOps)).toBeTruthy();
        });
    });

    describe("Constants and exports validation", () => {
        it("should export BASE_MONITOR_TYPES correctly", () => {
            expect(BASE_MONITOR_TYPES).toEqual([
                "http",
                "http-keyword",
                "http-status",
                "http-header",
                "http-json",
                "http-latency",
                "port",
                "ping",
                "dns",
                "ssl",
                "websocket-keepalive",
                "server-heartbeat",
                "replication",
                "cdn-edge-consistency",
            ]);
            expect(Array.isArray(BASE_MONITOR_TYPES)).toBeTruthy();
            expect(BASE_MONITOR_TYPES).toHaveLength(14);
        });

        it("should export MONITOR_STATUS constants correctly", () => {
            expect(MONITOR_STATUS).toBeDefined();
            expect(typeof MONITOR_STATUS).toBe("object");
        });

        it("should export DEFAULT_MONITOR_STATUS correctly", () => {
            expect(DEFAULT_MONITOR_STATUS).toBe(MONITOR_STATUS.PENDING);
            expect(isMonitorStatus(DEFAULT_MONITOR_STATUS)).toBeTruthy();
        });

        it("should export DEFAULT_SITE_STATUS correctly", () => {
            expect(DEFAULT_SITE_STATUS).toBe("unknown");
            expect(isSiteStatus(DEFAULT_SITE_STATUS)).toBeTruthy();
        });

        test.prop([fc.constantFrom(...BASE_MONITOR_TYPES)])(
            "should validate all BASE_MONITOR_TYPES are valid MonitorTypes",
            (monitorType: MonitorType) => {
                expect(typeof monitorType).toBe("string");
                expect(monitorType).not.toHaveLength(0);
            }
        );
    });

    describe("Type intersections and edge cases", () => {
        test.prop([
            fc.oneof(
                fc.constant("up"),
                fc.constant("down"),
                fc.constant("pending"),
                fc.constant("paused")
            ),
        ])("should validate that monitor statuses are also site statuses", (
            status: MonitorStatus
        ) => {
            expect(isMonitorStatus(status)).toBeTruthy();
            expect(isSiteStatus(status)).toBeTruthy();
            expect(isComputedSiteStatus(status)).toBeFalsy();
        });

        test.prop([fc.oneof(fc.constant("mixed"), fc.constant("unknown"))])(
            "should validate that computed site statuses are site statuses but not monitor statuses",
            (status: "mixed" | "unknown") => {
                expect(isComputedSiteStatus(status)).toBeTruthy();
                expect(isSiteStatus(status)).toBeTruthy();
                expect(isMonitorStatus(status)).toBeFalsy();
            }
        );

        test.prop([fc.string()])(
            "should maintain consistency between type guards",
            (status: string) => {
                // If it's a computed site status, it should also be a site status
                if (isComputedSiteStatus(status)) {
                    expect(isSiteStatus(status)).toBeTruthy();
                }

                // If it's a monitor status, it should also be a site status
                if (isMonitorStatus(status)) {
                    expect(isSiteStatus(status)).toBeTruthy();
                }

                // But computed site statuses and monitor statuses should be mutually exclusive
                if (isComputedSiteStatus(status)) {
                    expect(isMonitorStatus(status)).toBeFalsy();
                }
                if (isMonitorStatus(status)) {
                    expect(isComputedSiteStatus(status)).toBeFalsy();
                }

                // Ensure at least one assertion always runs
                expect(typeof status).toBe("string");
            }
        );
    });

    describe("Edge case validation for validateMonitor", () => {
        test.prop([
            fc.record({
                id: fc.string({ minLength: 1 }),
                type: fc.constantFrom(...BASE_MONITOR_TYPES),
                status: fc.constantFrom("down", "paused", "pending", "up"),
                monitoring: fc.boolean(),
                responseTime: fc.nat(),
                checkInterval: fc.nat(),
                timeout: fc.nat(),
                retryAttempts: fc.nat(),
                history: fc.array(fc.anything()),
                activeOperations: fc.constant(undefined),
            }),
        ])("should return true when activeOperations is undefined", (
            monitorWithUndefinedActiveOps: any
        ) => {
            expect(validateMonitor(monitorWithUndefinedActiveOps)).toBeTruthy();
        });

        test.prop([
            fc.record({
                id: fc.string({ minLength: 1 }),
                type: fc.constantFrom(...BASE_MONITOR_TYPES),
                status: fc.constantFrom("down", "paused", "pending", "up"),
                monitoring: fc.boolean(),
                responseTime: fc.nat(),
                checkInterval: fc.nat(),
                timeout: fc.nat(),
                retryAttempts: fc.nat(),
                history: fc.array(fc.anything()),
                activeOperations: fc.constant([]),
            }),
        ])("should return true when activeOperations is an empty array", (
            monitorWithEmptyActiveOps: any
        ) => {
            expect(validateMonitor(monitorWithEmptyActiveOps)).toBeTruthy();
        });

        // Test specific isValidActiveOperations scenarios through validateMonitor
        test.prop([
            fc.record({
                id: fc.string({ minLength: 1 }),
                type: fc.constantFrom(...BASE_MONITOR_TYPES),
                status: fc.constantFrom("down", "paused", "pending", "up"),
                monitoring: fc.boolean(),
                responseTime: fc.nat(),
                checkInterval: fc.nat(),
                timeout: fc.nat(),
                retryAttempts: fc.nat(),
                history: fc.array(fc.anything()),
                activeOperations: fc.array(fc.constant(""), { minLength: 1 }),
            }),
        ])("should return false when activeOperations contains empty strings", (
            monitorWithEmptyStringActiveOps: any
        ) => {
            expect(
                validateMonitor(monitorWithEmptyStringActiveOps)
            ).toBeFalsy();
        });

        test.prop([
            fc.record({
                id: fc.string({ minLength: 1 }),
                type: fc.constantFrom(...BASE_MONITOR_TYPES),
                status: fc.constantFrom("down", "paused", "pending", "up"),
                monitoring: fc.boolean(),
                responseTime: fc.nat(),
                checkInterval: fc.nat(),
                timeout: fc.nat(),
                retryAttempts: fc.nat(),
                history: fc.array(fc.anything()),
                activeOperations: fc.array(
                    fc.constantFrom("   ", "  \t  ", " \n ", ""),
                    { minLength: 1 }
                ),
            }),
        ])(
            "should return false when activeOperations contains whitespace-only strings",
            (monitorWithWhitespaceActiveOps: any) => {
                expect(
                    validateMonitor(monitorWithWhitespaceActiveOps)
                ).toBeFalsy();
            }
        );
    });
});
