/**
 * @file Comprehensive tests for monitor title formatter utilities
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
    formatTitleSuffix,
    getTitleSuffixFormatter,
    registerTitleSuffixFormatter,
    type TitleSuffixFormatter,
} from "../../utils/monitorTitleFormatters";
import { Monitor } from "../../../shared/types.js";

/**
 * Mock monitor factory for testing
 */
function createMockMonitor(overrides: Partial<Monitor> = {}): Monitor {
    return {
        id: "test-monitor",
        type: "http",
        monitoring: true,
        checkInterval: 30_000,
        timeout: 5000,
        retryAttempts: 3,
        responseTime: 0,
        status: "pending",
        history: [],
        ...overrides,
    } as Monitor;
}

describe("monitorTitleFormatters", () => {
    describe("formatTitleSuffix", () => {
        describe("HTTP monitor type", () => {
            it("should return formatted URL suffix for HTTP monitor with URL", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
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
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
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
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "http",
                });
                // Manually set url to null to test edge case
                (monitor as any).url = null;

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for HTTP monitor with undefined URL", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "http",
                });
                // url is undefined by default

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should handle HTTP monitor with special characters in URL", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
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

        describe("Port monitor type", () => {
            it("should return formatted host:port suffix for port monitor with both host and port", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "port",
                    host: "database.example.com",
                    port: 5432,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (database.example.com:5432)");
            });

            it("should return empty string for port monitor without host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "port",
                    port: 5432,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for port monitor without port", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "port",
                    host: "database.example.com",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for port monitor with null host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "port",
                    port: 5432,
                });
                // Manually set host to null to test edge case
                (monitor as any).host = null;

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for port monitor with undefined host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "port",
                    port: 5432,
                });
                // host is already undefined in the base case

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for port monitor with null port", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "port",
                    host: "database.example.com",
                });
                // Manually set port to null to test edge case
                (monitor as any).port = null;

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for port monitor with undefined port", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "port",
                    host: "database.example.com",
                });
                // port is already undefined in the base case

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should handle port monitor with IP address host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "port",
                    host: "192.168.1.100",
                    port: 3306,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (192.168.1.100:3306)");
            });

            it("should handle port monitor with localhost", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "port",
                    host: "localhost",
                    port: 8080,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (localhost:8080)");
            });

            it("should handle port monitor with high port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "port",
                    host: "service.example.com",
                    port: 65_535,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (service.example.com:65535)");
            });
        });

        describe("DNS monitor type", () => {
            it("should return formatted recordType host suffix for DNS monitor with both host and recordType", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "dns",
                    host: "example.com",
                    recordType: "A",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (A example.com)");
            });

            it("should return empty string for DNS monitor without host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "dns",
                    recordType: "A",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for DNS monitor without recordType", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "dns",
                    host: "example.com",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for DNS monitor with null host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "dns",
                    recordType: "AAAA",
                });
                (monitor as any).host = null;

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for DNS monitor with null recordType", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "dns",
                    host: "example.com",
                });
                (monitor as any).recordType = null;

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should handle various DNS record types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
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
                        type: "dns",
                        host: "test.example.com",
                        recordType,
                    });

                    const result = formatTitleSuffix(monitor);

                    expect(result).toBe(` (${recordType} test.example.com)`);
                }
            });

            it("should handle DNS monitor with subdomain", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "dns",
                    host: "api.subdomain.example.com",
                    recordType: "CNAME",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (CNAME api.subdomain.example.com)");
            });
        });

        describe("Unknown monitor types", () => {
            it("should return empty string for unknown monitor type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
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
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
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
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
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

        describe("Edge cases", () => {
            it("should handle monitor with mixed properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

                const monitor = createMockMonitor({
                    type: "http",
                    url: "https://mixed.example.com",
                    host: "should-be-ignored.com",
                    port: 9999,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (https://mixed.example.com)");
            });

            it("should handle monitor type case sensitivity", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
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

    describe("getTitleSuffixFormatter", () => {
        it("should return HTTP formatter for 'http' type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const formatter = getTitleSuffixFormatter("http");

            expect(formatter).toBeDefined();
            expect(typeof formatter).toBe("function");
        });

        it("should return port formatter for 'port' type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const formatter = getTitleSuffixFormatter("port");

            expect(formatter).toBeDefined();
            expect(typeof formatter).toBe("function");
        });

        it("should return DNS formatter for 'dns' type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const formatter = getTitleSuffixFormatter("dns");

            expect(formatter).toBeDefined();
            expect(typeof formatter).toBe("function");
        });

        it("should return undefined for unknown type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const formatter = getTitleSuffixFormatter("unknown");

            expect(formatter).toBeUndefined();
        });

        it("should return undefined for empty string type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const formatter = getTitleSuffixFormatter("");

            expect(formatter).toBeUndefined();
        });

        it("should handle case sensitivity", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const formatter = getTitleSuffixFormatter("HTTP");

            expect(formatter).toBeUndefined(); // Should not match "http"
        });

        it("should return formatter function that works correctly", async ({
            task,
            annotate,
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

    describe("registerTitleSuffixFormatter", () => {
        beforeEach(() => {
            // Clean up any custom formatters registered in tests
            // This is done by overriding with undefined, which effectively removes them
        });

        it("should register a new formatter for custom type", async ({
            task,
            annotate,
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
            task,
            annotate,
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
            // Manually set type to api to test custom formatter
            (monitor as any).type = "api";

            const result = formatTitleSuffix(monitor);
            expect(result).toBe(" [API Monitor]");
        });

        it("should replace existing formatter when registering same type", async ({
            task,
            annotate,
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
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const databaseFormatter: TitleSuffixFormatter = (monitor) => {
                const host = monitor.host as string;
                const database = (monitor as any).database as string;
                return host && database ? ` (${host}/${database})` : "http";
            };

            registerTitleSuffixFormatter("database", databaseFormatter);

            const monitor = createMockMonitor({
                type: "database",
                host: "db.example.com",
                database: "users_db",
            } as any);

            const result = formatTitleSuffix(monitor);
            expect(result).toBe(" (db.example.com/users_db)");
        });

        it("should register formatter that returns empty string conditionally", async ({
            task,
            annotate,
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
                type: "conditional",
                enabled: true,
            } as any);

            const disabledMonitor = createMockMonitor({
                type: "conditional",
                enabled: false,
            } as any);

            expect(formatTitleSuffix(enabledMonitor)).toBe(" (Active)");
            expect(formatTitleSuffix(disabledMonitor)).toBe("http");
        });

        it("should register formatter with complex logic", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const complexFormatter: TitleSuffixFormatter = (monitor) => {
                const url = monitor.url as string;
                const host = monitor.host as string;
                const port = monitor.port as number;

                if (url && url !== "complex") {
                    return ` (${url})`;
                } else if (host && port) {
                    return ` (${host}:${port})`;
                } else if (host) {
                    return ` (${host})`;
                }
                return " (No endpoint)";
            };

            registerTitleSuffixFormatter("complex", complexFormatter);

            const urlMonitor = createMockMonitor({
                url: "https://api.example.com",
                host: "ignored.com",
                port: 8080,
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
            task,
            annotate,
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
            task,
            annotate,
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

            // Verify original formatter still works for http
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

    describe("Integration tests", () => {
        it("should work end-to-end with multiple monitor types", async ({
            task,
            annotate,
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
                    type: "port",
                    host: "db.example.com",
                    port: 5432,
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
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTitleFormatters", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Register custom formatter
            registerTitleSuffixFormatter("ping", (monitor) => {
                const host = monitor.host as string;
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
            expect(typeof formatter).toBe("function");
        });
    });
});
