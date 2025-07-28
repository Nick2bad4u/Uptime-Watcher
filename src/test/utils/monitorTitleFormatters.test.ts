/**
 * @fileoverview Comprehensive tests for monitor title formatter utilities
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
    formatTitleSuffix,
    getTitleSuffixFormatter,
    registerTitleSuffixFormatter,
    type TitleSuffixFormatter,
} from "../../utils/monitorTitleFormatters";
import { Monitor } from "@shared/types";

/**
 * Mock monitor factory for testing
 */
function createMockMonitor(overrides: Partial<Monitor> = {}): Monitor {
    return {
        id: "test-monitor",
        name: "Test Monitor",
        type: "http",
        url: "https://example.com",
        ...overrides,
    } as Monitor;
}

describe("monitorTitleFormatters", () => {
    describe("formatTitleSuffix", () => {
        describe("HTTP monitor type", () => {
            it("should return formatted URL suffix for HTTP monitor with URL", () => {
                const monitor = createMockMonitor({
                    type: "http",
                    url: "https://example.com/api",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (https://example.com/api)");
            });

            it("should return empty string for HTTP monitor without URL", () => {
                const monitor = createMockMonitor({
                    type: "http",
                    url: "",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for HTTP monitor with null URL", () => {
                const monitor = createMockMonitor({
                    type: "http",
                    url: null,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for HTTP monitor with undefined URL", () => {
                const monitor = createMockMonitor({
                    type: "http",
                    url: undefined,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should handle HTTP monitor with special characters in URL", () => {
                const monitor = createMockMonitor({
                    type: "http",
                    url: "https://api.example.com:8080/v1/health?check=true",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (https://api.example.com:8080/v1/health?check=true)");
            });
        });

        describe("Port monitor type", () => {
            it("should return formatted host:port suffix for port monitor with both host and port", () => {
                const monitor = createMockMonitor({
                    type: "port",
                    host: "database.example.com",
                    port: 5432,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (database.example.com:5432)");
            });

            it("should return empty string for port monitor without host", () => {
                const monitor = createMockMonitor({
                    type: "port",
                    host: "",
                    port: 5432,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for port monitor without port", () => {
                const monitor = createMockMonitor({
                    type: "port",
                    host: "database.example.com",
                    port: 0,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for port monitor with null host", () => {
                const monitor = createMockMonitor({
                    type: "port",
                    host: null,
                    port: 5432,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for port monitor with undefined host", () => {
                const monitor = createMockMonitor({
                    type: "port",
                    host: undefined,
                    port: 5432,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for port monitor with null port", () => {
                const monitor = createMockMonitor({
                    type: "port",
                    host: "database.example.com",
                    port: null,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for port monitor with undefined port", () => {
                const monitor = createMockMonitor({
                    type: "port",
                    host: "database.example.com",
                    port: undefined,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should handle port monitor with IP address host", () => {
                const monitor = createMockMonitor({
                    type: "port",
                    host: "192.168.1.100",
                    port: 3306,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (192.168.1.100:3306)");
            });

            it("should handle port monitor with localhost", () => {
                const monitor = createMockMonitor({
                    type: "port",
                    host: "localhost",
                    port: 8080,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (localhost:8080)");
            });

            it("should handle port monitor with high port numbers", () => {
                const monitor = createMockMonitor({
                    type: "port",
                    host: "service.example.com",
                    port: 65535,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (service.example.com:65535)");
            });
        });

        describe("Unknown monitor types", () => {
            it("should return empty string for unknown monitor type", () => {
                const monitor = createMockMonitor({
                    type: "unknown-type",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for custom monitor type without formatter", () => {
                const monitor = createMockMonitor({
                    type: "custom-service",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });

            it("should return empty string for empty monitor type", () => {
                const monitor = createMockMonitor({
                    type: "",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            });
        });

        describe("Edge cases", () => {
            it("should handle monitor with mixed properties", () => {
                const monitor = createMockMonitor({
                    type: "http",
                    url: "https://mixed.example.com",
                    host: "should-be-ignored.com",
                    port: 9999,
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(" (https://mixed.example.com)");
            });

            it("should handle monitor type case sensitivity", () => {
                const monitor = createMockMonitor({
                    type: "HTTP", // Uppercase
                    url: "https://example.com",
                });

                const result = formatTitleSuffix(monitor);

                expect(result).toBe(""); // Should not match "http"
            });
        });
    });

    describe("getTitleSuffixFormatter", () => {
        it("should return HTTP formatter for 'http' type", () => {
            const formatter = getTitleSuffixFormatter("http");

            expect(formatter).toBeDefined();
            expect(typeof formatter).toBe("function");
        });

        it("should return port formatter for 'port' type", () => {
            const formatter = getTitleSuffixFormatter("port");

            expect(formatter).toBeDefined();
            expect(typeof formatter).toBe("function");
        });

        it("should return undefined for unknown type", () => {
            const formatter = getTitleSuffixFormatter("unknown");

            expect(formatter).toBeUndefined();
        });

        it("should return undefined for empty string type", () => {
            const formatter = getTitleSuffixFormatter("");

            expect(formatter).toBeUndefined();
        });

        it("should handle case sensitivity", () => {
            const formatter = getTitleSuffixFormatter("HTTP");

            expect(formatter).toBeUndefined(); // Should not match "http"
        });

        it("should return formatter function that works correctly", () => {
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

        it("should register a new formatter for custom type", () => {
            const customFormatter: TitleSuffixFormatter = (monitor) => 
                ` (Custom: ${monitor.name})`;
            
            registerTitleSuffixFormatter("custom", customFormatter);
            
            const formatter = getTitleSuffixFormatter("custom");
            expect(formatter).toBeDefined();
            expect(formatter).toBe(customFormatter);
        });

        it("should use registered custom formatter in formatTitleSuffix", () => {
            const customFormatter: TitleSuffixFormatter = (monitor) => 
                ` [${monitor.name}]`;
            
            registerTitleSuffixFormatter("api", customFormatter);
            
            const monitor = createMockMonitor({
                type: "api",
                name: "API Monitor",
            });
            
            const result = formatTitleSuffix(monitor);
            expect(result).toBe(" [API Monitor]");
        });

        it("should replace existing formatter when registering same type", () => {
            const originalFormatter: TitleSuffixFormatter = () => " (Original)";
            const newFormatter: TitleSuffixFormatter = () => " (New)";
            
            registerTitleSuffixFormatter("test", originalFormatter);
            registerTitleSuffixFormatter("test", newFormatter);
            
            const formatter = getTitleSuffixFormatter("test");
            expect(formatter).toBe(newFormatter);
            
            const monitor = createMockMonitor({ type: "test" });
            const result = formatTitleSuffix(monitor);
            expect(result).toBe(" (New)");
        });

        it("should register formatter that accesses monitor properties", () => {
            const databaseFormatter: TitleSuffixFormatter = (monitor) => {
                const host = monitor.host as string;
                const database = (monitor as any).database as string;
                return host && database ? ` (${host}/${database})` : "";
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

        it("should register formatter that returns empty string conditionally", () => {
            const conditionalFormatter: TitleSuffixFormatter = (monitor) => {
                const status = (monitor as any).enabled;
                return status ? " (Active)" : "";
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
            expect(formatTitleSuffix(disabledMonitor)).toBe("");
        });

        it("should register formatter with complex logic", () => {
            const complexFormatter: TitleSuffixFormatter = (monitor) => {
                const url = monitor.url as string;
                const host = monitor.host as string;
                const port = monitor.port as number;
                
                if (url) {
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
                type: "complex",
                url: "https://api.example.com",
                host: "ignored.com",
                port: 8080,
            });
            
            const hostPortMonitor = createMockMonitor({
                type: "complex",
                url: "",
                host: "service.example.com",
                port: 3000,
            });
            
            const hostOnlyMonitor = createMockMonitor({
                type: "complex",
                url: "",
                host: "simple.example.com",
                port: 0,
            });
            
            const noEndpointMonitor = createMockMonitor({
                type: "complex",
                url: "",
                host: "",
                port: 0,
            });
            
            expect(formatTitleSuffix(urlMonitor)).toBe(" (https://api.example.com)");
            expect(formatTitleSuffix(hostPortMonitor)).toBe(" (service.example.com:3000)");
            expect(formatTitleSuffix(hostOnlyMonitor)).toBe(" (simple.example.com)");
            expect(formatTitleSuffix(noEndpointMonitor)).toBe(" (No endpoint)");
        });

        it("should handle registration with empty type string", () => {
            const emptyTypeFormatter: TitleSuffixFormatter = () => " (Empty type)";
            
            registerTitleSuffixFormatter("", emptyTypeFormatter);
            
            const formatter = getTitleSuffixFormatter("");
            expect(formatter).toBeDefined();
            expect(formatter).toBe(emptyTypeFormatter);
        });

        it("should not affect existing built-in formatters", () => {
            const httpMonitor = createMockMonitor({
                type: "http",
                url: "https://original.example.com",
            });
            
            // Verify original behavior
            expect(formatTitleSuffix(httpMonitor)).toBe(" (https://original.example.com)");
            
            // Register custom formatter
            registerTitleSuffixFormatter("custom", () => " (Custom)");
            
            // Verify original formatter still works
            expect(formatTitleSuffix(httpMonitor)).toBe(" (https://original.example.com)");
            
            // Verify custom formatter works
            const customMonitor = createMockMonitor({ type: "custom" });
            expect(formatTitleSuffix(customMonitor)).toBe(" (Custom)");
        });
    });

    describe("Integration tests", () => {
        it("should work end-to-end with multiple monitor types", () => {
            const monitors = [
                createMockMonitor({
                    type: "http",
                    name: "Website",
                    url: "https://example.com",
                }),
                createMockMonitor({
                    type: "port",
                    name: "Database",
                    host: "db.example.com",
                    port: 5432,
                }),
                createMockMonitor({
                    type: "unknown",
                    name: "Mystery Service",
                }),
            ];
            
            const results = monitors.map(formatTitleSuffix);
            
            expect(results).toEqual([
                " (https://example.com)",
                " (db.example.com:5432)",
                "",
            ]);
        });

        it("should demonstrate formatter registration workflow", () => {
            // Register custom formatter
            registerTitleSuffixFormatter("ping", (monitor) => {
                const host = monitor.host as string;
                return host ? ` (ping ${host})` : " (ping)";
            });
            
            // Create monitors
            const pingMonitorWithHost = createMockMonitor({
                type: "ping",
                host: "google.com",
            });
            
            const pingMonitorWithoutHost = createMockMonitor({
                type: "ping",
                host: "",
            });
            
            // Test formatting
            expect(formatTitleSuffix(pingMonitorWithHost)).toBe(" (ping google.com)");
            expect(formatTitleSuffix(pingMonitorWithoutHost)).toBe(" (ping)");
            
            // Verify getter works
            const formatter = getTitleSuffixFormatter("ping");
            expect(formatter).toBeDefined();
            expect(typeof formatter).toBe("function");
        });
    });
});
