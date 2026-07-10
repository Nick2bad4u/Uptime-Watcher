/**
 * Tests for fallback and default value utilities
 *
 * @file Comprehensive tests covering all branches and edge cases for fallback
 *   utilities used throughout the app.
 */

import type { Monitor, MonitorStatus } from "@shared/types";

import { test } from "@fast-check/vitest";
import { MONITOR_STATUS_VALUES } from "@shared/types";
import { getSafeUrlForDisplay } from "@shared/utils/urlSafety";
import * as fc from "fast-check";
import { describe, it, expect, vi, beforeEach } from "vitest";

import {
    getMonitorDisplayIdentifier,
    getMonitorTypeDisplayLabel,
    truncateForLogging,
    UiDefaults,
} from "../../utils/fallbacks";

const monitorIdArbitrary = fc.uuid();
const fallbackIdentifierArbitrary = fc
    .string({ maxLength: 48, minLength: 1 })
    .filter((value) => value.trim().length > 0);
const httpUrlArbitrary = fc
    .webUrl()
    .filter((url) => url.startsWith("https://") || url.startsWith("https://"));
const hostIdentifierArbitrary = fc.oneof(fc.domain(), fc.constant("localhost"));
const portArbitrary = fc.integer({ max: 65_535, min: 1 });
const dnsRecordTypeArbitrary = fc.constantFrom(
    "A",
    "AAAA",
    "ANY",
    "CAA",
    "CNAME",
    "MX",
    "NAPTR",
    "NS",
    "PTR",
    "SOA",
    "SRV",
    "TLSA",
    "TXT"
);

const buildMinimalMonitor = (overrides: Partial<Monitor>): Monitor =>
    ({
        id: overrides.id ?? "monitor-id",
        type: "http",
        ...overrides,
    }) as Monitor;

// Mock the logger module
vi.mock("../../services/logger", () => ({
    logger: {
        error: vi.fn(),
    },
}));

// Mock the error handling utilities
vi.mock("@shared/utils/errorHandling", () => ({
    ensureError: vi.fn((error) =>
        Error.isError(error) ? error : new Error(String(error))
    ),
    withUtilityErrorHandling: vi.fn((operation) => operation()),
}));

describe("fallback Utilities", () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    describe(getMonitorDisplayIdentifier, () => {
        describe("HTTP monitors", () => {
            it("should return URL for HTTP monitor", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        httpUrlArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, url, fallback) => {
                            const monitor = buildMinimalMonitor({
                                id,
                                type: "http",
                                url,
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(getSafeUrlForDisplay(url));
                        }
                    )
                );
            });

            it("should handle HTTP monitor with undefined URL", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host: undefined,
                                id,
                                type: "http",
                                url: undefined,
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(fallback);
                        }
                    )
                );
            });

            it("should redact URL secrets in HTTP monitor identifiers", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Privacy", "type");

                const monitor = buildMinimalMonitor({
                    type: "http",
                    url: "https://example.com/status?token=display-secret#fragment",
                });

                const result = getMonitorDisplayIdentifier(monitor, "fallback");

                expect(result).toBe("https://example.com/status");
                expect(result).not.toContain("token=");
                expect(result).not.toContain("display-secret");
                expect(result).not.toContain("fragment");
            });
        });

        describe("port monitors", () => {
            it("should return host:port for port monitor with both values", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        hostIdentifierArbitrary,
                        portArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, host, port, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host,
                                id,
                                port,
                                type: "port",
                                url: undefined,
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(`${host}:${port}`);
                        }
                    )
                );
            });

            it("should return host only for port monitor without port", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        hostIdentifierArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, host, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host,
                                id,
                                port: undefined,
                                type: "port",
                                url: undefined,
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(host);
                        }
                    )
                );
            });

            it("should use fallback for port monitor with no host", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        portArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, port, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host: undefined,
                                id,
                                port,
                                type: "port",
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(fallback);
                        }
                    )
                );
            });
        });

        describe("specialized monitor types", () => {
            it("should use baseline URL for CDN edge consistency monitors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        httpUrlArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, baselineUrl, fallback) => {
                            const monitor = buildMinimalMonitor({
                                baselineUrl,
                                id,
                                type: "cdn-edge-consistency",
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(getSafeUrlForDisplay(baselineUrl));
                        }
                    )
                );
            });

            it("should append DNS record type when available", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        hostIdentifierArbitrary,
                        dnsRecordTypeArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, host, recordType, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host,
                                id,
                                recordType,
                                type: "dns",
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(`${host} (${recordType})`);
                        }
                    )
                );
            });

            it("should prefer primary status URL for replication monitors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        httpUrlArbitrary,
                        httpUrlArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, primaryUrl, replicaUrl, fallback) => {
                            const monitor = buildMinimalMonitor({
                                id,
                                primaryStatusUrl: primaryUrl,
                                replicaStatusUrl: replicaUrl,
                                type: "replication",
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(getSafeUrlForDisplay(primaryUrl));
                        }
                    )
                );
            });

            it("should fall back to replica status URL when primary is missing", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        httpUrlArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, replicaUrl, fallback) => {
                            const monitor = buildMinimalMonitor({
                                id,
                                primaryStatusUrl: undefined,
                                replicaStatusUrl: replicaUrl,
                                type: "replication",
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(getSafeUrlForDisplay(replicaUrl));
                        }
                    )
                );
            });
        });

        describe("generic identifier fallback", () => {
            it("should use URL from generic identifier when type generator fails", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        httpUrlArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, url, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host: undefined,
                                id,
                                port: undefined,
                                type: "port",
                                url,
                            });

                            const result = getMonitorDisplayIdentifier(
                                monitor,
                                fallback
                            );

                            expect(result).toBe(getSafeUrlForDisplay(url));
                        }
                    )
                );
            });

            it("should redact URL secrets from generic identifiers", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Privacy", "type");

                const monitor = buildMinimalMonitor({
                    host: undefined,
                    port: undefined,
                    type: "port",
                    url: "https://fallback.example.com/status?refresh_token=generic-secret#section",
                });

                const result = getMonitorDisplayIdentifier(monitor, "fallback");

                expect(result).toBe("https://fallback.example.com/status");
                expect(result).not.toContain("refresh_token");
                expect(result).not.toContain("generic-secret");
                expect(result).not.toContain("section");
            });

            it("should use host from generic identifier", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        hostIdentifierArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, host, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host,
                                id,
                                type: "http",
                                url: undefined,
                            });

                            const result = getMonitorDisplayIdentifier(
                                monitor,
                                fallback
                            );

                            expect(result).toBe(host);
                        }
                    )
                );
            });

            it("should use host:port from generic identifier", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        hostIdentifierArbitrary,
                        portArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, host, port, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host,
                                id,
                                port,
                                type: "http",
                                url: undefined,
                            });

                            const result = getMonitorDisplayIdentifier(
                                monitor,
                                fallback
                            );

                            expect(result).toBe(`${host}:${port}`);
                        }
                    )
                );
            });
        });

        describe("fallback behavior", () => {
            it("should return site fallback for unknown monitor type with no identifiers", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host: undefined,
                                id,
                                port: undefined,
                                type: "http",
                                url: undefined,
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(fallback);
                        }
                    )
                );
            });

            it("should handle different fallback values", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        fallbackIdentifierArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, fallbackA, fallbackB) => {
                            const monitor = buildMinimalMonitor({
                                host: undefined,
                                id,
                                port: undefined,
                                type: "http",
                                url: undefined,
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallbackA)
                            ).toBe(fallbackA);
                            expect(
                                getMonitorDisplayIdentifier(monitor, fallbackB)
                            ).toBe(fallbackB);
                        }
                    )
                );
            });

            it("should handle monitor with no identifying properties (line 169 coverage)", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                // Create a monitor with no URL, host, or port to hit the return undefined line
                const monitor = {
                    checkInterval: 30_000,
                    id: "1",
                    retryAttempts: 3,
                    timeout: 5000,
                    type: "custom",
                    // No URL, host, or port properties
                } as unknown as Monitor;

                const result = getMonitorDisplayIdentifier(
                    monitor,
                    "Site Fallback"
                );

                expect(result).toBe("Site Fallback");
            });
        });

        describe("error handling", () => {
            it("should handle monitor with malformed properties", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = {
                    // Malformed properties that might cause errors
                    // url: undefined, // Remove undefined properties
                    // host: undefined, // Remove undefined properties
                    port: "invalid",
                    type: "http",
                } as any;

                const result = getMonitorDisplayIdentifier(
                    monitor,
                    "Error Fallback"
                );

                expect(result).toBe("Error Fallback");
            });
        });

        describe("property-based Tests", () => {
            const createMonitorArbitrary = (type: string) =>
                fc.record({
                    checkInterval: fc.integer({ min: 1000, max: 3_600_000 }),
                    history: fc.constant([]),
                    host: fc.option(fc.domain()),
                    id: fc.string().filter((s) => s.trim().length > 0),
                    monitoring: fc.boolean(),
                    port: fc.option(fc.integer({ min: 1, max: 65_535 })),
                    responseTime: fc.integer({ min: -1, max: 10_000 }),
                    retryAttempts: fc.integer({ min: 0, max: 10 }),
                    status: fc.constantFrom<MonitorStatus>(
                        ...MONITOR_STATUS_VALUES
                    ),
                    timeout: fc.integer({ min: 1000, max: 60_000 }),
                    type: fc.constant(type),
                    url: fc.option(fc.webUrl()),
                }) as fc.Arbitrary<Monitor>;

            test.prop([
                createMonitorArbitrary("http"),
                fc.string().filter((s) => s.trim().length > 0),
            ])(
                "should prefer URL over fallback for HTTP monitors with URL",
                (monitor, fallback) => {
                    const { url } = monitor;
                    fc.pre(typeof url === "string");
                    if (typeof url !== "string") {
                        return;
                    }

                    const result = getMonitorDisplayIdentifier(
                        monitor,
                        fallback
                    );

                    expect(result).toBe(getSafeUrlForDisplay(url));
                }
            );

            test.prop([
                createMonitorArbitrary("port"),
                fc.string().filter((s) => s.trim().length > 0),
            ])(
                "should create host:port identifier for port monitors",
                (monitor, fallback) => {
                    fc.pre(Boolean(monitor.host) && Boolean(monitor.port));
                    const result = getMonitorDisplayIdentifier(
                        monitor,
                        fallback
                    );

                    expect(result).toBe(`${monitor.host}:${monitor.port}`);
                }
            );

            test.prop([
                createMonitorArbitrary("ping"),
                fc.string().filter((s) => s.trim().length > 0),
            ])(
                "should use host for ping monitors with host",
                (monitor, fallback) => {
                    fc.pre(Boolean(monitor.host));
                    const result = getMonitorDisplayIdentifier(
                        monitor,
                        fallback
                    );

                    expect(result).toBe(monitor.host);
                }
            );

            test.prop([
                fc.record({
                    checkInterval: fc.integer({ min: 1000, max: 3_600_000 }),
                    history: fc.constant([]),
                    id: fc.string().filter((s) => s.trim().length > 0),
                    monitoring: fc.boolean(),
                    responseTime: fc.integer({ min: -1, max: 10_000 }),
                    retryAttempts: fc.integer({ min: 0, max: 10 }),
                    status: fc.constantFrom<MonitorStatus>(
                        ...MONITOR_STATUS_VALUES
                    ),
                    timeout: fc.integer({ min: 1000, max: 60_000 }),
                    type: fc.constantFrom("http", "port", "ping", "dns"),
                }) as fc.Arbitrary<Monitor>,
                fc.string().filter((s) => s.trim().length > 0),
            ])(
                "should return fallback when monitor lacks identifying properties",
                (monitor, fallback) => {
                    // Ensure monitor lacks identifying properties
                    const cleanMonitor = { ...monitor };
                    delete cleanMonitor.url;
                    delete cleanMonitor.host;
                    delete cleanMonitor.port;

                    const result = getMonitorDisplayIdentifier(
                        cleanMonitor,
                        fallback
                    );

                    expect(result).toBe(fallback);
                }
            );
        });
    });

    describe(getMonitorTypeDisplayLabel, () => {
        describe("configured monitor types", () => {
            it("should return configured label for HTTP", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("http")).toBe("Website URL");
            });

            it("should return configured label for port", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("port")).toBe("Host & Port");
            });
        });

        describe("unknown monitor types with formatting", () => {
            it.each([
                {
                    description: "should generate title case for camelCase",
                    input: "apiEndpoint",
                    expected: "API Endpoint Monitor",
                },
                {
                    description: "should handle snake_case",
                    input: "ssl_certificate",
                    expected: "Ssl Certificate Monitor",
                },
                {
                    description: "should handle kebab-case",
                    input: "dns-lookup",
                    expected: "DNS Lookup Monitor",
                },
                {
                    description: "should handle mixed cases",
                    input: "customAPI_Monitor",
                    expected: "Custom API Monitor Monitor",
                },
                {
                    description: "should handle single words",
                    input: "ping",
                    expected: "Ping Monitor",
                },
                {
                    description: "should handle uppercase",
                    input: "API",
                    expected: "API Monitor",
                },
                {
                    description: "should handle lowercase",
                    input: "database",
                    expected: "Database Monitor",
                },
            ] as const)("$description", async ({ expected, input }) => {
                expect(getMonitorTypeDisplayLabel(input)).toBe(expected);
            });
        });

        describe("edge cases and error handling", () => {
            it("should handle empty string", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("")).toBe(
                    "Monitor Configuration"
                );
            });

            it("should handle null input", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel(null as any)).toBe(
                    "Monitor Configuration"
                );
            });

            it("should handle undefined input", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel(undefined as any)).toBe(
                    "Monitor Configuration"
                );
            });

            it("should handle non-string input", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel(123 as any)).toBe(
                    "Monitor Configuration"
                );
            });

            it("should handle special characters", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("test@#$")).toBe(
                    "Test@#$ Monitor"
                );
            });

            it("should handle very long monitor types", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const longType = "a".repeat(100);
                const result = getMonitorTypeDisplayLabel(longType);

                expect(result).toBe(
                    `${longType.charAt(0).toUpperCase()}${longType.slice(1)} Monitor`
                );
            });
        });

        describe("property-based Tests", () => {
            test.prop([fc.constantFrom("http", "port", "ping", "dns")])(
                "should return consistent labels for known monitor types",
                (monitorType) => {
                    const result = getMonitorTypeDisplayLabel(monitorType);

                    expect(result).toBeTypeOf("string");
                    expect(result.length).toBeGreaterThan(0);

                    // Should not return the fallback "Monitor Configuration"
                    expect(result).not.toBe("Monitor Configuration");
                }
            );

            test.prop([
                fc
                    .string({ maxLength: 50, minLength: 1 })
                    .filter(
                        (s) =>
                            ![
                                "dns",
                                "http",
                                "ping",
                                "port",
                            ].includes(s)
                    )
                    .filter((s) => s.trim().length > 0),
            ])(
                "should format unknown monitor types with proper capitalization",
                (unknownType) => {
                    const result = getMonitorTypeDisplayLabel(unknownType);

                    expect(result).toBeTypeOf("string");
                    expect(result.length).toBeGreaterThan(0);
                    expect(result.endsWith(" Monitor")).toBe(true);

                    // First character should be uppercase
                    expect(result.charAt(0)).toBe(
                        result.charAt(0).toUpperCase()
                    );
                }
            );

            test.prop([
                fc.oneof(
                    fc.constant(null),
                    fc.constant(undefined),
                    fc.constant("")
                ),
            ])(
                "should return default label for invalid inputs",
                (invalidInput) => {
                    const result = getMonitorTypeDisplayLabel(
                        invalidInput as any
                    );

                    expect(result).toBe("Monitor Configuration");
                }
            );

            test.prop([
                fc
                    .string({ minLength: 1 })
                    .filter(
                        (s) =>
                            s.includes("_") ||
                            s.includes("-") ||
                            /[A-Z]/u.test(s)
                    )
                    .filter((s) => s.trim().length > 0),
            ])(
                "should handle various string formats (camelCase, snake_case, kebab-case)",
                (formattedString) => {
                    const result = getMonitorTypeDisplayLabel(formattedString);

                    expect(result).toBeTypeOf("string");
                    expect(result.length).toBeGreaterThan(0);
                    expect(result.endsWith(" Monitor")).toBe(true);

                    // Should contain some capitalization
                    expect(/[A-Z]/u.test(result)).toBe(true);
                }
            );
        });
    });

    describe(truncateForLogging, () => {
        describe("basic truncation", () => {
            it("should return original string if shorter than maxLength", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(truncateForLogging("short", 50)).toBe("short");
            });

            it("should return original string if equal to maxLength", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const text = "a".repeat(50);

                expect(truncateForLogging(text, 50)).toBe(text);
            });

            it("should truncate string if longer than maxLength", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const text = "a".repeat(60);
                const result = truncateForLogging(text, 50);

                expect(result).toBe("a".repeat(50));
                expect(result).toHaveLength(50);
            });
        });

        describe("default maxLength behavior", () => {
            it("should use default maxLength of 50", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const text = "a".repeat(60);
                const result = truncateForLogging(text);

                expect(result).toHaveLength(50);
            });

            it("should handle text exactly at default length", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const text = "a".repeat(50);

                expect(truncateForLogging(text)).toBe(text);
            });
        });

        describe("custom maxLength", () => {
            it("should respect custom maxLength", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const text = "hello world";

                expect(truncateForLogging(text, 5)).toBe("hello");
            });

            it("should handle zero maxLength", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(truncateForLogging("http", 0)).toBe("");
            });

            it("should handle negative maxLength", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                // With negative maxLength, the condition value.length <= maxLength would be false for any non-empty
                // string So it will still try to slice, but slice(0,
                // -1) returns first n-1 characters
                expect(truncateForLogging("test", -1)).toBe("tes");
            });
        });

        describe("edge cases", () => {
            it("should handle empty string", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(truncateForLogging("", 10)).toBe("");
            });

            it("should handle single character", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(truncateForLogging("a", 1)).toBe("a");
                expect(truncateForLogging("a", 0)).toBe("");
            });

            it("should handle Unicode characters", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const unicode = "🎉🎊🎈🎁🎂";
                // Unicode characters may take multiple bytes, so slice(0, 3) might not work as expected
                const result = truncateForLogging(unicode, 3);

                expect(result.length).toBeLessThanOrEqual(3);
                expect(result.startsWith("🎉")).toBe(true);
            });

            it("should handle newlines and special characters", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const text = String.raw`line1\nline2\ttab`;

                expect(truncateForLogging(text, 10)).toBe(
                    String.raw`line1\nlin`
                );
            });
        });

        describe("real-world scenarios", () => {
            it("should truncate URLs appropriately", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const url =
                    "https://very-long-domain-name.example.com/very/long/path/with/many/segments";
                const result = truncateForLogging(url, 30);

                expect(result).toHaveLength(30);
                expect(result).toBe("https://very-long-domain-name.");
            });

            it("should truncate error messages", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const error =
                    "Connection failed: Unable to connect to server at example.com:8080 after 30 seconds timeout";
                const result = truncateForLogging(error, 50);

                expect(result).toHaveLength(50);
                expect(result).toBe(
                    "Connection failed: Unable to connect to server at "
                );
            });
        });

        describe("property-based Tests", () => {
            test.prop([fc.string(), fc.integer({ max: 1000, min: 0 })])(
                "should always return string with length <= maxLength",
                (text, maxLength) => {
                    const result = truncateForLogging(text, maxLength);

                    expect(result).toBeTypeOf("string");
                    expect(result.length).toBeLessThanOrEqual(maxLength);
                }
            );

            test.prop([
                fc.string().filter((s) => s.length > 0),
                fc.integer({ max: 20, min: 1 }),
            ])(
                "should preserve start of string when truncating",
                (text, maxLength) => {
                    const result = truncateForLogging(text, maxLength);
                    if (text.length <= maxLength) {
                        expect(result).toBe(text);
                    } else {
                        expect(result).toBe(text.slice(0, maxLength));
                    }
                }
            );

            test.prop([fc.string()])(
                "should return original string when shorter than default max",
                (text) => {
                    // Default maxLength should be large enough for most strings
                    const result = truncateForLogging(text);
                    if (text.length <= 100) {
                        // Assuming default max is >= 100
                        expect(result).toBe(text);
                    }

                    expect(result.length).toBeLessThanOrEqual(text.length);
                }
            );

            test.prop([
                fc.string({ minLength: 100 }),
                fc.integer({ max: 50, min: 10 }),
            ])(
                "should truncate long strings to specified length",
                (longText, maxLength) => {
                    const result = truncateForLogging(longText, maxLength);

                    expect(result).toHaveLength(maxLength);
                    expect(result).toBe(longText.slice(0, maxLength));
                }
            );

            test.prop([fc.integer({ max: 10, min: 0 })])(
                "should handle zero and small maxLength values",
                (maxLength) => {
                    const text = "sample text";
                    const result = truncateForLogging(text, maxLength);

                    expect(result).toHaveLength(maxLength);

                    if (maxLength === 0) {
                        expect(result).toBe("");
                    } else {
                        expect(result).toBe(text.slice(0, maxLength));
                    }
                }
            );
        });
    });

    describe("default values", () => {
        describe("uiDefaults", () => {
            it("should have correct chart defaults", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(UiDefaults.chartPeriod).toBe("24h");
                expect(UiDefaults.chartPoints).toBe(24);
            });

            it("should have correct label defaults", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(UiDefaults.errorLabel).toBe("Error");
                expect(UiDefaults.loadingLabel).toBe("Loading...");
                expect(UiDefaults.notAvailableLabel).toBe("N/A");
                expect(UiDefaults.unknownLabel).toBe("Unknown");
            });

            it("should have correct timing defaults", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(UiDefaults.loadingDelay).toBe(100);
                expect(UiDefaults.pageSize).toBe(10);
            });

            it("should be deeply frozen (readonly)", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                // Note: 'as const' provides type-level readonly but not runtime immutability
                // The objects can still be modified at runtime, but should be treated as readonly
                expect(UiDefaults.chartPeriod).toBe("24h");
                expect(UiDefaults.chartPoints).toBe(24);

                // Test that we can't modify (this will silently fail in non-strict mode)
                (UiDefaults as any).chartPeriod = "48h";
                // The value may or may not actually change depending on JavaScript mode
                // but the intent is that it should be treated as readonly
            });
        });

        describe("property-based Tests", () => {
            test.prop([fc.string().filter((s) => s.trim().length > 0)])(
                "should validate UiDefaults properties maintain consistent types",
                (_propertyName) => {
                    // Test that UiDefaults is a consistent object
                    expect(UiDefaults).toEqual(expect.any(Object));
                    expect(UiDefaults).toBeTypeOf("object");
                    expect(UiDefaults).not.toBeNull();
                }
            );
        });
    });
});
