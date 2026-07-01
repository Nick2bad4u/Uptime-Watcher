/**
 * @file Comprehensive tests for monitor title formatter utilities
 */

import type { Monitor } from "@shared/types";

import { test } from "@fast-check/vitest";
import * as fc from "fast-check";
import { safeCastTo } from "ts-extras";
import { beforeEach, describe, expect, it } from "vitest";

import {
    formatTitleSuffix,
    getTitleSuffixFormatter,
    registerTitleSuffixFormatter,
    type TitleSuffixFormatter,
} from "../../utils/monitorTitleFormatters";

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
                    " (https://api.example.com:8080/v1/health?check=true)"
                );
            });
        });

        describe("port monitor type", () => {
            it("should return formatted host:port suffix for port monitor with both host and port", async ({
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
                    port: 5432,
                    type: "port",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (database.example.com:5432)");
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

            it("should handle port monitor with IP address host", async ({
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
                    host: "192.168.1.100",
                    port: 3306,
                    type: "port",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (192.168.1.100:3306)");
            });

            it("should handle port monitor with localhost", async ({
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
                    host: "localhost",
                    port: 8080,
                    type: "port",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (localhost:8080)");
            });

            it("should handle port monitor with high port numbers", async ({
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
                    host: "service.example.com",
                    port: 65_535,
                    type: "port",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (service.example.com:65535)");
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
            it("should return empty string for unknown monitor type", async ({
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
                // Manually set type to unknown to test edge case
                (monitor as any).type = "unknown";

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for custom monitor type without formatter", async ({
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
                // Manually set type to custom to test edge case
                (monitor as any).type = "custom";

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for empty monitor type", async ({
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
                // Manually set type to empty string to test edge case
                (monitor as any).type = "";

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

    describe(getTitleSuffixFormatter, () => {
        it("should return HTTP formatter for 'http' type", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const formatter = getTitleSuffixFormatter("http");

            expect(formatter).toBeDefined();
            expect(formatter).toBeTypeOf("function");
        });

        it("should return port formatter for 'port' type", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const formatter = getTitleSuffixFormatter("port");

            expect(formatter).toBeDefined();
            expect(formatter).toBeTypeOf("function");
        });

        it("should return DNS formatter for 'dns' type", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const formatter = getTitleSuffixFormatter("dns");

            expect(formatter).toBeDefined();
            expect(formatter).toBeTypeOf("function");
        });

        it("should return undefined for unknown type", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const formatter = getTitleSuffixFormatter("unknown");

            expect(formatter).toBeUndefined();
        });

        it("should return undefined for empty string type", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const formatter = getTitleSuffixFormatter("");

            expect(formatter).toBeUndefined();
        });

        it("should handle case sensitivity", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const formatter = getTitleSuffixFormatter("HTTP");

            expect(formatter).toBeUndefined(); // Should not match "http"
        });

        it("should return formatter function that works correctly", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const formatter = getTitleSuffixFormatter("http");
            const monitor = createMockMonitor({
                type: "http",
                url: "https://test.example.com",
            });

            expect(formatter).toBeDefined();

            const result = formatter!(monitor);

            expect(result).toBe(" (https://test.example.com)");
        });
    });

    describe(registerTitleSuffixFormatter, () => {
        beforeEach(() => {
            // Clean up any custom formatters registered in tests
            // This is done by overriding with undefined, which effectively removes them
        });

        it("should register a new formatter for custom type", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const customFormatter: TitleSuffixFormatter = (monitor) =>
                ` (Custom: ${(monitor as any).name})`;

            registerTitleSuffixFormatter("custom", customFormatter);

            const formatter = getTitleSuffixFormatter("custom");

            expect(formatter).toBeDefined();
            expect(formatter).toBe(customFormatter);
        });

        it("should use registered custom formatter in formatTitleSuffix", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const customFormatter: TitleSuffixFormatter = (monitor) =>
                ` [${monitor.url || "API Monitor"}]`;

            registerTitleSuffixFormatter("api", customFormatter);

            const monitor = createMockMonitor({
                url: "API Monitor",
            });
            // Manually set type to API to test custom formatter
            (monitor as any).type = "api";

            const result = formatTitleSuffix(monitor);

            expect(result).toBe(" [API Monitor]");
        });

        it("should replace existing formatter when registering same type", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const originalFormatter: TitleSuffixFormatter = () => " (Original)";
            const newFormatter: TitleSuffixFormatter = () => " (New)";

            registerTitleSuffixFormatter("replaceable", originalFormatter);
            registerTitleSuffixFormatter("replaceable", newFormatter);

            const formatter = getTitleSuffixFormatter("replaceable");

            expect(formatter).toBe(newFormatter);

            const monitor = createMockMonitor({});
            // Manually set type to replaceable to test custom formatter
            (monitor as any).type = "replaceable";
            const result = formatTitleSuffix(monitor);

            expect(result).toBe(" (New)");
        });

        it("should register formatter that accesses monitor properties", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const databaseFormatter: TitleSuffixFormatter = (monitor) => {
                const host = monitor.host!;
                const database = safeCastTo<string>((monitor as any).database);
                return host && database ? ` (${host}/${database})` : "http";
            };

            registerTitleSuffixFormatter("database", databaseFormatter);

            const monitor = createMockMonitor({
                database: "users_db",
                host: "db.example.com",
                type: "database",
            } as any);

            const result = formatTitleSuffix(monitor);

            expect(result).toBe(" (db.example.com/users_db)");
        });

        it("should register formatter that returns empty string conditionally", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const conditionalFormatter: TitleSuffixFormatter = (monitor) => {
                const status = (monitor as any).enabled;
                return status ? " (Active)" : "http";
            };

            registerTitleSuffixFormatter("conditional", conditionalFormatter);

            const enabledMonitor = createMockMonitor({
                enabled: true,
                type: "conditional",
            } as any);

            const disabledMonitor = createMockMonitor({
                enabled: false,
                type: "conditional",
            } as any);

            expect(formatTitleSuffix(enabledMonitor)).toBe(" (Active)");
            expect(formatTitleSuffix(disabledMonitor)).toBe("http");
        });

        it("should register formatter with complex logic", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const complexFormatter: TitleSuffixFormatter = (monitor) => {
                const url = monitor.url!;
                const host = monitor.host!;
                const port = monitor.port!;

                if (url && url !== "complex") {
                    return ` (${url})`;
                }
                if (host && port) {
                    return ` (${host}:${port})`;
                }
                if (host) {
                    return ` (${host})`;
                }
                return " (No endpoint)";
            };

            registerTitleSuffixFormatter("complex", complexFormatter);

            const urlMonitor = createMockMonitor({
                host: "ignored.com",
                port: 8080,
                url: "https://api.example.com",
            });
            // Manually set type to complex to test custom formatter
            (urlMonitor as any).type = "complex";

            const hostPortMonitor = createMockMonitor({
                host: "service.example.com",
                port: 3000,
            });
            // Manually set type to complex to test custom formatter
            (hostPortMonitor as any).type = "complex";

            const hostOnlyMonitor = createMockMonitor({
                host: "simple.example.com",
            });
            // Manually set type to complex to test custom formatter
            (hostOnlyMonitor as any).type = "complex";

            const noEndpointMonitor = createMockMonitor({});
            // Manually set type to complex to test custom formatter
            (noEndpointMonitor as any).type = "complex";

            expect(formatTitleSuffix(urlMonitor)).toBe(
                " (https://api.example.com)"
            );
            expect(formatTitleSuffix(hostPortMonitor)).toBe(
                " (service.example.com:3000)"
            );
            expect(formatTitleSuffix(hostOnlyMonitor)).toBe(
                " (simple.example.com)"
            );
            expect(formatTitleSuffix(noEndpointMonitor)).toBe(" (No endpoint)");
        });

        it("should handle registration with empty type string", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const emptyTypeFormatter: TitleSuffixFormatter = () =>
                " (Empty type)";

            registerTitleSuffixFormatter("", emptyTypeFormatter);

            const formatter = getTitleSuffixFormatter("");

            expect(formatter).toBeDefined();
            expect(formatter).toBe(emptyTypeFormatter);
        });

        it("should not affect existing built-in formatters", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const httpMonitor = createMockMonitor({
                type: "http",
                url: "https://original.example.com",
            });

            // Verify original behavior
            expect(formatTitleSuffix(httpMonitor)).toBe(
                " (https://original.example.com)"
            );

            // Register custom formatter for different type
            registerTitleSuffixFormatter("custom", () => " (Custom)");

            // Verify original formatter still works for HTTP
            expect(formatTitleSuffix(httpMonitor)).toBe(
                " (https://original.example.com)"
            );

            // Verify custom formatter works for custom type
            const customMonitor = createMockMonitor({});
            // Manually set type to custom to test custom formatter
            (customMonitor as any).type = "custom";

            expect(formatTitleSuffix(customMonitor)).toBe(" (Custom)");
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

        it("should demonstrate formatter registration workflow", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Register custom formatter
            registerTitleSuffixFormatter("ping", (monitor) => {
                const host = monitor.host!;
                return host ? ` (ping ${host})` : " (ping)";
            });

            // Create monitors
            const pingMonitorWithHost = createMockMonitor({
                host: "google.com",
            });
            // Manually set type to ping to test custom formatter
            (pingMonitorWithHost as any).type = "ping";

            const pingMonitorWithoutHost = createMockMonitor({});
            // Manually set type to ping to test custom formatter
            (pingMonitorWithoutHost as any).type = "ping";

            // Test formatting
            expect(formatTitleSuffix(pingMonitorWithHost)).toBe(
                " (ping google.com)"
            );
            expect(formatTitleSuffix(pingMonitorWithoutHost)).toBe(" (ping)");

            // Verify getter works
            const formatter = getTitleSuffixFormatter("ping");

            expect(formatter).toBeDefined();
            expect(formatter).toBeTypeOf("function");
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
                    status: fc.constantFrom("up", "down", "pending", "paused"),
                    timeout: fc.integer({ max: 30_000, min: 1000 }),
                    type: fc.constantFrom("http"),
                    url: fc.webUrl(),
                }),
            ])(
                "should format HTTP monitor titles with valid URLs",
                (monitor) => {
                    const result = formatTitleSuffix(monitor);

                    expect(result).toBe(` (${monitor.url})`);
                    expect(result).toContain(monitor.url);
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
                    status: fc.constantFrom("up", "down", "pending", "paused"),
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
                    status: fc.constantFrom("up", "down", "pending", "paused"),
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
                    status: fc.constantFrom("up", "down", "pending", "paused"),
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

        describe("getTitleSuffixFormatter property tests", () => {
            test.prop([fc.constantFrom("http", "port", "dns")])(
                "should return formatter functions for valid monitor types",
                (monitorType) => {
                    const formatter = getTitleSuffixFormatter(monitorType);

                    expect(formatter).toBeDefined();
                    expect(formatter).toBeTypeOf("function");
                }
            );

            test.prop([
                fc.string({ maxLength: 50, minLength: 1 }).filter(
                    (type) =>
                        ![
                            "dns",
                            "http",
                            "port",
                        ].includes(type)
                ),
            ])(
                "should return undefined for invalid monitor types",
                (monitorType) => {
                    const formatter = getTitleSuffixFormatter(monitorType);

                    expect(formatter).toBeUndefined();
                }
            );
        });

        describe("registerTitleSuffixFormatter property tests", () => {
            test.prop([
                fc.string({ maxLength: 50, minLength: 1 }).filter(
                    (str) =>
                        ![
                            "__proto__",
                            "constructor",
                            "prototype",
                        ].includes(str)
                ),
                fc.constant((monitor: Monitor) => ` (custom-${monitor.id})`),
            ])(
                "should register custom formatters that can be retrieved",
                (monitorType, formatter) => {
                    // Register the formatter
                    registerTitleSuffixFormatter(monitorType, formatter);

                    // Verify it can be retrieved
                    const retrievedFormatter =
                        getTitleSuffixFormatter(monitorType);

                    expect(retrievedFormatter).toBeDefined();
                    expect(retrievedFormatter).toBe(formatter);
                }
            );

            test.prop([
                fc.string({ maxLength: 50, minLength: 1 }).filter(
                    (s) =>
                        ![
                            "__proto__",
                            "constructor",
                            "prototype",
                        ].includes(s)
                ),
                fc.record({
                    checkInterval: fc.integer({ max: 300_000, min: 1000 }),
                    history: safeCastTo<fc.Arbitrary<any[]>>(fc.constant([])),
                    id: fc.string({ maxLength: 50, minLength: 1 }),
                    monitoring: fc.boolean(),
                    responseTime: fc.integer({ max: 10_000, min: 0 }),
                    retryAttempts: fc.integer({ max: 10, min: 1 }),
                    status: fc.constantFrom("up", "down", "pending", "paused"),
                    timeout: fc.integer({ max: 30_000, min: 1000 }),
                    type: fc.string({ maxLength: 20, minLength: 1 }),
                }),
            ])(
                "should register formatters that work with formatTitleSuffix",
                (monitorType, monitor) => {
                    const customFormatter = (m: Monitor) => ` (test-${m.id})`;
                    const testMonitor = {
                        ...monitor,
                        type: monitorType,
                    } as unknown as Monitor;

                    // Register custom formatter
                    registerTitleSuffixFormatter(monitorType, customFormatter);

                    // Test that formatTitleSuffix uses the custom formatter
                    const result = formatTitleSuffix(testMonitor);

                    expect(result).toBe(` (test-${monitor.id})`);
                }
            );

            test.prop([
                fc.constantFrom("http", "port", "dns"),
                fc.constant(
                    (monitor: Monitor) => ` (overridden-${monitor.id})`
                ),
            ])(
                "should allow overriding existing formatters",
                (monitorType, newFormatter) => {
                    // Register new formatter to override existing one
                    registerTitleSuffixFormatter(monitorType, newFormatter);

                    // Verify the new formatter is used
                    const retrievedFormatter =
                        getTitleSuffixFormatter(monitorType);

                    expect(retrievedFormatter).toBe(newFormatter);
                }
            );
        });
    });
});
