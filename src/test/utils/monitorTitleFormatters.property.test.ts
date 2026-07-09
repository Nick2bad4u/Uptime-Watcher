/**
 * Uses fast-check to systematically test title formatting logic across all
 * possible monitor configurations and edge cases. Tests formatter registration,
 * suffix generation, and defensive handling of malformed data.
 *
 * @file Property-based tests for monitor title formatters
 *
 * @since 2025-09-05
 */

import type { Monitor } from "@shared/types";

import { test } from "@fast-check/vitest";
import { getSafeUrlForDisplay } from "@shared/utils/urlSafety";
import fc from "fast-check";
import { describe, expect } from "vitest";

import { formatTitleSuffix } from "../../utils/monitorTitleFormatters";

describe("monitorTitleFormatters property-based behavior", () => {
    /**
     * Helper function to create basic monitor structure
     */
    const createBaseMonitor = (overrides: Partial<Monitor> = {}): Monitor => ({
        checkInterval: 30_000,
        history: [],
        id: "test-id",
        monitoring: true,
        responseTime: 0,
        retryAttempts: 3,
        status: "up",
        timeout: 5000,
        type: "http",
        ...overrides,
    });

    const createRuntimeMonitor = (overrides: Record<string, unknown>): Monitor =>
        ({
            ...createBaseMonitor(),
            ...overrides,
        }) as Monitor;

    const runtimeMonitorType = (type: unknown): Monitor["type"] =>
        type as Monitor["type"];

    /**
     * Custom arbitraries for generating test data
     */
    const monitorTypeArbitrary = fc.oneof(
        fc.constant("http"),
        fc.constant("port"),
        fc.constant("ping"),
        fc.constant("dns"),
        fc.string({ maxLength: 20, minLength: 1 }) // Custom types
    );

    const urlArbitrary = fc.webUrl();
    const hostArbitrary = fc.domain();
    const portArbitrary = fc.integer({ max: 65_535, min: 1 });
    const recordTypeArbitrary = fc.oneof(
        fc.constant("A"),
        fc.constant("AAAA"),
        fc.constant("CNAME"),
        fc.constant("MX"),
        fc.constant("TXT"),
        fc.constant("NS")
    );

    describe(formatTitleSuffix, () => {
        test.prop([monitorTypeArbitrary])(
            "should always return a string",
            (type) => {
                const monitor = createBaseMonitor({
                    type: runtimeMonitorType(type),
                });
                const result = formatTitleSuffix(monitor);

                expect(result).toBeTypeOf("string");
            }
        );

        test.prop([monitorTypeArbitrary])(
            "should return empty string for unknown monitor types",
            (type) => {
                const unknownType = `unknown-${type}-xyz`;
                const monitor = createBaseMonitor({
                    type: runtimeMonitorType(unknownType),
                });
                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            }
        );

        describe("HTTP monitors", () => {
            test.prop([fc.option(urlArbitrary, { nil: undefined })])(
                "should format HTTP monitor suffix with URL when present",
                (url) => {
                    // Only create monitor if URL is defined to satisfy exactOptionalPropertyTypes
                    const monitorData: Partial<Monitor> = { type: "http" };
                    if (url !== undefined) {
                        monitorData.url = url;
                    }
                    const monitor = createBaseMonitor(monitorData);
                    const result = formatTitleSuffix(monitor);

                    if (url) {
                        const safeUrl = getSafeUrlForDisplay(url);

                        expect(result).toBe(` (${safeUrl})`);
                        expect(result).toContain(safeUrl);
                    } else {
                        expect(result).toBe("");
                    }
                }
            );

            test.prop([fc.string({ maxLength: 100, minLength: 1 })])(
                "should properly escape and handle various URL formats",
                (url) => {
                    const monitor = createBaseMonitor({ type: "http", url });
                    const result = formatTitleSuffix(monitor);

                    expect(result.startsWith(" (")).toBe(true);
                    expect(result.endsWith(")")).toBe(true);
                    expect(result).toBe(` (${getSafeUrlForDisplay(url)})`);
                }
            );

            test.prop([
                fc.oneof(
                    fc.constant(null),
                    fc.constant(undefined),
                    fc.constant(""),
                    fc.constant(0), // Falsy number
                    fc.constant(false) // Falsy boolean
                ),
            ])(
                "should handle HTTP monitors with falsy URL properties",
                (invalidUrl) => {
                    const monitor = createRuntimeMonitor({
                        type: "http",
                        url: invalidUrl,
                    });

                    expect(() => formatTitleSuffix(monitor)).not.toThrow();

                    const result = formatTitleSuffix(monitor);

                    expect(result).toBe("");
                }
            );

            test.prop([
                fc.oneof(
                    fc.integer().filter((n) => n !== 0), // Truthy numbers
                    fc.boolean().filter(Boolean) // Truthy boolean
                ),
            ])(
                "should format HTTP monitors with truthy non-string URLs as strings",
                (truthyUrl) => {
                    const monitor = createRuntimeMonitor({
                        type: "http",
                        url: truthyUrl,
                    });

                    expect(() => formatTitleSuffix(monitor)).not.toThrow();

                    const result = formatTitleSuffix(monitor);
                    const safeUrl = getSafeUrlForDisplay(String(truthyUrl));

                    expect(result).toBe(` (${safeUrl})`);
                    expect(result).toContain(safeUrl);
                }
            );
        });

        describe("port monitors", () => {
            test.prop([
                fc.option(hostArbitrary, { nil: undefined }),
                fc.option(portArbitrary, { nil: undefined }),
            ])(
                "should format port monitor suffix with host:port when both present",
                (host, port) => {
                    // Only include defined properties to satisfy exactOptionalPropertyTypes
                    const monitorData: Partial<Monitor> = { type: "port" };
                    if (host !== undefined) monitorData.host = host;
                    if (port !== undefined) monitorData.port = port;

                    const monitor = createBaseMonitor(monitorData);
                    const result = formatTitleSuffix(monitor);

                    if (host && port) {
                        expect(result).toBe(` (${host}:${port})`);
                        expect(result).toContain(host);
                        expect(result).toContain(String(port));
                    } else {
                        expect(result).toBe("");
                    }
                }
            );

            test.prop([hostArbitrary])(
                "should return empty string when port is missing",
                (host) => {
                    const monitorData: Partial<Monitor> = {
                        host,
                        type: "port",
                    };
                    const monitor = createBaseMonitor(monitorData);
                    const result = formatTitleSuffix(monitor);

                    expect(result).toBe("");
                }
            );

            test.prop([portArbitrary])(
                "should return empty string when host is missing",
                (port) => {
                    const monitorData: Partial<Monitor> = {
                        port,
                        type: "port",
                    };
                    const monitor = createBaseMonitor(monitorData);
                    const result = formatTitleSuffix(monitor);

                    expect(result).toBe("");
                }
            );

            test.prop([
                fc.oneof(
                    fc.constant(null),
                    fc.constant(undefined),
                    fc.constant("")
                ),
                fc.oneof(
                    fc.constant(null),
                    fc.constant(undefined),
                    fc.string()
                ),
            ])(
                "should handle port monitors with invalid host/port properties",
                (invalidHost, invalidPort) => {
                    const monitor = createRuntimeMonitor({
                        host: invalidHost,
                        port: invalidPort,
                        type: "port",
                    });

                    expect(() => formatTitleSuffix(monitor)).not.toThrow();

                    const result = formatTitleSuffix(monitor);

                    expect(result).toBe("");
                }
            );
        });

        describe("DNS monitors", () => {
            test.prop([
                fc.option(hostArbitrary, { nil: undefined }),
                fc.option(recordTypeArbitrary, { nil: undefined }),
            ])(
                "should format DNS monitor suffix with recordType and host when both present",
                (host, recordType) => {
                    // Only include defined properties to satisfy exactOptionalPropertyTypes
                    const monitorData: Partial<Monitor> = { type: "dns" };
                    if (host !== undefined) monitorData.host = host;
                    if (recordType !== undefined)
                        monitorData.recordType = recordType;

                    const monitor = createBaseMonitor(monitorData);
                    const result = formatTitleSuffix(monitor);

                    if (host && recordType) {
                        expect(result).toBe(` (${recordType} ${host})`);
                        expect(result).toContain(recordType);
                        expect(result).toContain(host);
                    } else {
                        expect(result).toBe("");
                    }
                }
            );

            test.prop([recordTypeArbitrary])(
                "should return empty string when host is missing",
                (recordType) => {
                    const monitorData: Partial<Monitor> = {
                        recordType,
                        type: "dns",
                    };
                    const monitor = createBaseMonitor(monitorData);
                    const result = formatTitleSuffix(monitor);

                    expect(result).toBe("");
                }
            );

            test.prop([hostArbitrary])(
                "should return empty string when recordType is missing",
                (host) => {
                    const monitorData: Partial<Monitor> = { host, type: "dns" };
                    const monitor = createBaseMonitor(monitorData);
                    const result = formatTitleSuffix(monitor);

                    expect(result).toBe("");
                }
            );
        });

        describe("ping monitors", () => {
            test.prop([fc.option(hostArbitrary, { nil: undefined })])(
                "should include host suffix when available",
                (host) => {
                    // Only include defined properties to satisfy exactOptionalPropertyTypes
                    const monitorData: Partial<Monitor> = { type: "ping" };
                    if (host !== undefined) monitorData.host = host;

                    const monitor = createBaseMonitor(monitorData);
                    const result = formatTitleSuffix(monitor);
                    if (host) {
                        expect(result).toBe(` (${host})`);
                    } else {
                        expect(result).toBe("");
                    }
                }
            );
        });
    });

    describe("edge cases and defensive programming", () => {
        test.prop([
            fc.oneof(
                fc.constant(null),
                fc.constant(undefined),
                fc.constant("")
            ),
        ])(
            "should handle monitors with invalid type properties",
            (invalidType) => {
                const monitor = createRuntimeMonitor({ type: invalidType });

                expect(() => formatTitleSuffix(monitor)).not.toThrow();

                const result = formatTitleSuffix(monitor);

                expect(result).toBe("");
            }
        );

        test.prop([
            fc.array(fc.constantFrom("http", "port", "dns", "ping"), {
                maxLength: 100,
                minLength: 10,
            }),
        ])(
            "should handle large numbers of monitors efficiently with known types only",
            (monitorTypes) => {
                // Only use known monitor types to avoid interference from custom formatters
                const monitors = monitorTypes.map((type) =>
                    createBaseMonitor({ type: runtimeMonitorType(type) })
                );

                const start = performance.now();

                for (const monitor of monitors) {
                    formatTitleSuffix(monitor);
                }

                const end = performance.now();
                const timePerMonitor = (end - start) / monitors.length;

                // Should process each monitor in less than 1ms on average
                expect(timePerMonitor).toBeLessThan(1);
            }
        );
    });
});
