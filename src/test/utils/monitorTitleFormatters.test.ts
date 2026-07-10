/**
 * @file Comprehensive tests for monitor title formatter utilities
 */

import type { Monitor, MonitorStatus } from "@shared/types";

import { test } from "@fast-check/vitest";
import { MONITOR_STATUS_VALUES } from "@shared/types";
import { getSafeUrlForDisplay } from "@shared/utils/urlSafety";
import * as fc from "fast-check";
import { safeCastTo } from "ts-extras";
import { describe, expect, it } from "vitest";

import { formatTitleSuffix } from "../../utils/monitorTitleFormatters";

const monitorStatusArbitrary = fc.constantFrom<MonitorStatus>(
    ...MONITOR_STATUS_VALUES
);

/**
 * Mock monitor factory for testing
 */
function createMockMonitor(overrides: Partial<Monitor> = {}): Monitor {
    return {
        checkInterval: 30_000,
        history: [],
        id: "test-monitor",
        monitoring: true,
        responseTime: 0,
        retryAttempts: 3,
        status: "pending",
        timeout: 5000,
        type: "http",
        ...overrides,
    };
}

describe("monitorTitleFormatters", () => {
    describe(formatTitleSuffix, () => {
        describe("HTTP monitor type", () => {
            it("should return formatted URL suffix for HTTP monitor with URL", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "http",
                    url: "https://example.com/api",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (https://example.com/api)");
            });

            it("should return empty string for HTTP monitor without URL", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "http",
                });
                // No URL provided - should return empty string

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should redact URL secrets in HTTP monitor title suffixes", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Privacy", "type");

                const monitor = createMockMonitor({
                    type: "http",
                    url: "https://example.com/status?token=display-secret#fragment",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (https://example.com/status)");
                expect(result).not.toContain("token=");
                expect(result).not.toContain("display-secret");
                expect(result).not.toContain("fragment");
            });

            it("should return empty string for HTTP monitor with null URL", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "http",
                });
                // Manually set URL to null to test edge case
                (monitor as any).url = null;

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for HTTP monitor with undefined URL", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "http",
                });
                // URL is undefined by default

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should handle HTTP monitor with special characters in URL", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "http",
                    url: "https://api.example.com:8080/v1/health?check=true",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(
                    " (https://api.example.com:8080/v1/health)"
                );
                expect(result).not.toContain("check=true");
            });
        });

        describe("port monitor type", () => {
            it.each([
                {
                    description:
                        "should return formatted host:port suffix for port monitor with both host and port",
                    expected: " (database.example.com:5432)",
                    host: "database.example.com",
                    port: 5432,
                },
                {
                    description:
                        "should handle port monitor with IP address host",
                    expected: " (192.168.1.100:3306)",
                    host: "192.168.1.100",
                    port: 3306,
                },
                {
                    description: "should handle port monitor with localhost",
                    expected: " (localhost:8080)",
                    host: "localhost",
                    port: 8080,
                },
                {
                    description:
                        "should handle port monitor with high port numbers",
                    expected: " (service.example.com:65535)",
                    host: "service.example.com",
                    port: 65_535,
                },
            ] as const)("$description", async ({ expected, host, port }) => {
                const monitor = createMockMonitor({
                    host,
                    port,
                    type: "port",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(expected);
            });

            it("should return empty string for port monitor without host", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    port: 5432,
                    type: "port",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for port monitor without port", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    host: "database.example.com",
                    type: "port",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for port monitor with null host", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    port: 5432,
                    type: "port",
                });
                // Manually set host to null to test edge case
                (monitor as any).host = null;

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for port monitor with undefined host", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    port: 5432,
                    type: "port",
                });
                // Host is already undefined in the base case

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for port monitor with null port", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    host: "database.example.com",
                    type: "port",
                });
                // Manually set port to null to test edge case
                (monitor as any).port = null;

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for port monitor with undefined port", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    host: "database.example.com",
                    type: "port",
                });
                // Port is already undefined in the base case

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });
        });

        describe("URL-driven monitor types", () => {
            const urlBasedMonitorTypes = [
                "http-header",
                "http-json",
                "http-keyword",
                "http-latency",
                "http-status",
                "server-heartbeat",
                "websocket-keepalive",
            ] as const;

            for (const monitorType of urlBasedMonitorTypes) {
                it(`should include url suffix for ${monitorType} monitors`, async ({
                    annotate,
                    task,
                }) => {
                    await annotate(`Testing: ${task.name}`, "functional");
                    await annotate(
                        "Component: monitorTitleFormatters",
                        "component"
                    );
                    await annotate("Category: Utility", "category");
                    await annotate("Type: Monitoring", "type");

                    const monitor = createMockMonitor({
                        type: monitorType,
                        url: "https://status.example.com",
                    });

                    const result = formatTitleSuffix(monitor);

                    expect(result).toBe(" (https://status.example.com)");
                });

                it(`should return empty suffix for ${monitorType} monitors without url`, async ({
                    annotate,
                    task,
                }) => {
                    await annotate(`Testing: ${task.name}`, "functional");
                    await annotate(
                        "Component: monitorTitleFormatters",
                        "component"
                    );
                    await annotate("Category: Utility", "category");
                    await annotate("Type: Monitoring", "type");

                    const monitor = createMockMonitor({ type: monitorType });

                    const result = formatTitleSuffix(monitor);

                    expect(result).toBe("");
                });
            }
        });

        describe("CDN edge consistency monitor type", () => {
            it("should prefer baselineUrl when available", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    baselineUrl: "https://edge.primary.example.com",
                    replicaStatusUrl: "https://edge.backup.example.com",
                    type: "cdn-edge-consistency",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (https://edge.primary.example.com)");
            });

            it("should fall back to replicaStatusUrl when baseline missing", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    replicaStatusUrl: "https://edge.backup.example.com",
                    type: "cdn-edge-consistency",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (https://edge.backup.example.com)");
            });

            it("should return empty suffix when no urls are provided", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "cdn-edge-consistency",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });
        });

        describe("replication monitor type", () => {
            it("should prefer primaryStatusUrl when available", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    primaryStatusUrl: "https://primary.replica.example.com",
                    replicaStatusUrl: "https://replica.example.com",
                    type: "replication",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (https://primary.replica.example.com)");
            });

            it("should fall back to replicaStatusUrl", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    replicaStatusUrl: "https://replica.example.com",
                    type: "replication",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (https://replica.example.com)");
            });

            it("should default to empty suffix when neither url is present", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({ type: "replication" });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });
        });

        describe("sSL monitor type", () => {
            it("should include port when host and port are provided", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    host: "secure.example.com",
                    port: 443,
                    type: "ssl",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (secure.example.com:443)");
            });

            it("should include host without port when port missing", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    host: "secure.example.com",
                    type: "ssl",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (secure.example.com)");
            });

            it("should return empty suffix when host missing", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({ type: "ssl" });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });
        });

        describe("ping monitor type", () => {
            it("should include host when provided", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    host: "api.internal",
                    type: "ping",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (api.internal)");
            });

            it("should return empty suffix when host missing", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({ type: "ping" });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });
        });

        describe("DNS monitor type", () => {
            it("should return formatted recordType host suffix for DNS monitor with both host and recordType", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    host: "example.com",
                    recordType: "A",
                    type: "dns",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (A example.com)");
            });

            it("should return empty string for DNS monitor without host", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    recordType: "A",
                    type: "dns",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for DNS monitor without recordType", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    host: "example.com",
                    type: "dns",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for DNS monitor with null host", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    recordType: "AAAA",
                    type: "dns",
                });
                (monitor as any).host = null;

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for DNS monitor with null recordType", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    host: "example.com",
                    type: "dns",
                });
                (monitor as any).recordType = null;

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should handle various DNS record types", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const recordTypes = [
                    "A",
                    "AAAA",
                    "CNAME",
                    "MX",
                    "TXT",
                    "NS",
                    "PTR",
                    "SOA",
                ];

                for (const recordType of recordTypes) {
                    const monitor = createMockMonitor({
                        host: "test.example.com",
                        recordType,
                        type: "dns",
                    });

                    const result = formatTitleSuffix(monitor);

                    expect(result).toBe(` (${recordType} test.example.com)`);
                }
            });

            it("should handle DNS monitor with subdomain", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    host: "api.subdomain.example.com",
                    recordType: "CNAME",
                    type: "dns",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (CNAME api.subdomain.example.com)");
            });
        });

        describe("unknown monitor types", () => {
            it.each([
                {
                    description:
                        "should return empty string for unknown monitor type",
                    monitorType: "unknown",
                },
                {
                    description:
                        "should return empty string for custom monitor type without formatter",
                    monitorType: "custom",
                },
                {
                    description:
                        "should return empty string for empty monitor type",
                    monitorType: "",
                },
            ] as const)("$description", async ({ monitorType }) => {
                const monitor = createMockMonitor({
                    url: "https://example.com",
                });
                (monitor as any).type = monitorType;

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });
        });

        describe("edge cases", () => {
            it("should handle monitor with mixed properties", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    host: "should-be-ignored.com",
                    port: 9999,
                    type: "http",
                    url: "https://mixed.example.com",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (https://mixed.example.com)");
            });

            it("should handle monitor type case sensitivity", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate(
                    "Component: monitorTitleFormatters",
                    "component"
                );
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    url: "https://example.com",
                });
                // Manually set type to uppercase to test edge case
                (monitor as any).type = "HTTP"; // Uppercase

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(""); // Should not match "http"
            });
        });
    });

    describe("integration tests", () => {
        it("should work end-to-end with multiple monitor types", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitors = [
                createMockMonitor({
                    type: "http",
                    url: "https://example.com",
                }),
                createMockMonitor({
                    host: "db.example.com",
                    port: 5432,
                    type: "port",
                }),
                createMockMonitor({}),
            ];

            // Manually set type for the unknown monitor to test edge case
            (monitors[2] as any).type = "unknown";

            const results = monitors.map((monitor) =>
                formatTitleSuffix(monitor)
            );

            expect(results).toEqual([
                " (https://example.com)",
                " (db.example.com:5432)",
                "",
            ]);
        });
    });

    // Property-based Tests
    describe("property-based Tests", () => {
        describe("formatTitleSuffix property tests", () => {
            test.prop([
                fc.record({
                    checkInterval: fc.integer({ max: 300_000, min: 1000 }),
                    history: safeCastTo<fc.Arbitrary<any[]>>(fc.constant([])),
                    id: fc.string({ maxLength: 50, minLength: 1 }),
                    monitoring: fc.boolean(),
                    responseTime: fc.integer({ max: 10_000, min: 0 }),
                    retryAttempts: fc.integer({ max: 10, min: 1 }),
                    status: monitorStatusArbitrary,
                    timeout: fc.integer({ max: 30_000, min: 1000 }),
                    type: fc.constantFrom("http"),
                    url: fc.webUrl(),
                }),
            ])(
                "should format HTTP monitor titles with valid URLs",
                (monitor) => {
                    const result = formatTitleSuffix(monitor);
                    const safeUrl = getSafeUrlForDisplay(monitor.url);

                    expect(result).toBe(` (${safeUrl})`);
                    expect(result).toContain(safeUrl);
                }
            );

            test.prop([
                fc.record({
                    checkInterval: fc.integer({ max: 300_000, min: 1000 }),
                    history: safeCastTo<fc.Arbitrary<any[]>>(fc.constant([])),
                    host: fc.domain(),
                    id: fc.string({ maxLength: 50, minLength: 1 }),
                    monitoring: fc.boolean(),
                    port: fc.integer({ max: 65_535, min: 1 }),
                    responseTime: fc.integer({ max: 10_000, min: 0 }),
                    retryAttempts: fc.integer({ max: 10, min: 1 }),
                    status: monitorStatusArbitrary,
                    timeout: fc.integer({ max: 30_000, min: 1000 }),
                    type: fc.constantFrom("port"),
                }),
            ])(
                "should format port monitor titles with host and port",
                (monitor) => {
                    const result = formatTitleSuffix(monitor);

                    expect(result).toBe(` (${monitor.host}:${monitor.port})`);
                    expect(result).toContain(monitor.host);
                    expect(result).toContain(monitor.port.toString());
                }
            );

            test.prop([
                fc.record({
                    checkInterval: fc.integer({ max: 300_000, min: 1000 }),
                    history: safeCastTo<fc.Arbitrary<any[]>>(fc.constant([])),
                    host: fc.domain(),
                    id: fc.string({ maxLength: 50, minLength: 1 }),
                    monitoring: fc.boolean(),
                    recordType: fc.constantFrom(
                        "A",
                        "AAAA",
                        "CNAME",
                        "MX",
                        "TXT",
                        "NS"
                    ),
                    responseTime: fc.integer({ max: 10_000, min: 0 }),
                    retryAttempts: fc.integer({ max: 10, min: 1 }),
                    status: monitorStatusArbitrary,
                    timeout: fc.integer({ max: 30_000, min: 1000 }),
                    type: fc.constantFrom("dns"),
                }),
            ])(
                "should format DNS monitor titles with record type and host",
                (monitor) => {
                    const result = formatTitleSuffix(monitor);

                    expect(result).toBe(
                        ` (${monitor.recordType} ${monitor.host})`
                    );
                    expect(result).toContain(monitor.recordType);
                    expect(result).toContain(monitor.host);
                }
            );

            test.prop([
                fc.record({
                    checkInterval: fc.integer({ max: 300_000, min: 1000 }),
                    history: safeCastTo<fc.Arbitrary<any[]>>(fc.constant([])),
                    id: fc.string({ maxLength: 50, minLength: 1 }),
                    monitoring: fc.boolean(),
                    responseTime: fc.integer({ max: 10_000, min: 0 }),
                    retryAttempts: fc.integer({ max: 10, min: 1 }),
                    status: monitorStatusArbitrary,
                    timeout: fc.integer({ max: 30_000, min: 1000 }),
                    type: fc.string({ maxLength: 20, minLength: 1 }).filter(
                        (type) =>
                            ![
                                "dns",
                                "http",
                                "port",
                            ].includes(type)
                    ),
                }),
            ])(
                "should return empty string for unknown monitor types",
                (monitor) => {
                    const result = formatTitleSuffix(
                        monitor as unknown as Monitor
                    );

                    expect(result).toBe("");
                }
            );
        });
    });
});
