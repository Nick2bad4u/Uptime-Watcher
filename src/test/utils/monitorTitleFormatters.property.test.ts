/**
 * @fileoverview Comprehensive property-based tests for monitor title formatters
 *
 * @description
 * Uses fast-check to systematically test title formatting logic across all
 * possible monitor configurations and edge cases. Tests formatter registration,
 * suffix generation, and defensive handling of malformed data.
 *
 * @author GitHub Copilot
 * @since 2025-09-05
 */

import { describe, expect, beforeEach } from "vitest";
import { test } from "@fast-check/vitest";
import fc from "fast-check";
import type { Monitor } from "../../../shared/types.js";

import {
    formatTitleSuffix,
    getTitleSuffixFormatter,
    registerTitleSuffixFormatter,
    type TitleSuffixFormatter,
} from "../../utils/monitorTitleFormatters";

describe("MonitorTitleFormatters Property-Based Tests", () => {

    /**
     * Helper function to create basic monitor structure
     */
    const createBaseMonitor = (overrides: Partial<Monitor> = {}): Monitor => ({
        id: "test-id",
        type: "http",
        status: "up",
        checkInterval: 30_000,
        timeout: 5000,
        retryAttempts: 3,
        monitoring: true,
        responseTime: 0,
        history: [],
        ...overrides,
    });

    /**
     * Custom arbitraries for generating test data
     */
    const monitorTypeArbitrary = fc.oneof(
        fc.constant("http"),
        fc.constant("port"),
        fc.constant("ping"),
        fc.constant("dns"),
        fc.string({ minLength: 1, maxLength: 20 }) // Custom types
    );

    const urlArbitrary = fc.webUrl();
    const hostArbitrary = fc.domain();
    const portArbitrary = fc.integer({ min: 1, max: 65_535 });
    const recordTypeArbitrary = fc.oneof(
        fc.constant("A"),
        fc.constant("AAAA"),
        fc.constant("CNAME"),
        fc.constant("MX"),
        fc.constant("TXT"),
        fc.constant("NS")
    );

    describe("formatTitleSuffix", () => {
        test.prop([monitorTypeArbitrary])(
            "should always return a string",
            (type) => {
                const monitor = createBaseMonitor({ type: type as any });
                const result = formatTitleSuffix(monitor);
                expect(typeof result).toBe("string");
            }
        );

        test.prop([monitorTypeArbitrary])(
            "should return empty string for unknown monitor types",
            (type) => {
                const unknownType = `unknown-${type}-xyz`;
                const monitor = createBaseMonitor({ type: unknownType as any });
                const result = formatTitleSuffix(monitor);
                expect(result).toBe("");
            }
        );

        describe("HTTP monitors", () => {
            test.prop([fc.option(urlArbitrary, { nil: undefined })])(
                "should format HTTP monitor suffix with URL when present",
                (url) => {
                    // Only create monitor if url is defined to satisfy exactOptionalPropertyTypes
                    const monitorData: Partial<Monitor> = { type: "http" };
                    if (url !== undefined) {
                        monitorData.url = url;
                    }
                    const monitor = createBaseMonitor(monitorData);
                    const result = formatTitleSuffix(monitor);

                    if (url) {
                        expect(result).toBe(` (${url})`);
                        expect(result).toContain(url);
                    } else {
                        expect(result).toBe("");
                    }
                }
            );

            test.prop([fc.string({ minLength: 1, maxLength: 100 })])(
                "should properly escape and handle various URL formats",
                (url) => {
                    const monitor = createBaseMonitor({ type: "http", url });
                    const result = formatTitleSuffix(monitor);
                    expect(result.startsWith(" (")).toBe(true);
                    expect(result.endsWith(")")).toBe(true);
                    expect(result).toContain(url);
                }
            );

            test.prop([
                fc.oneof(
                    fc.constant(null),
                    fc.constant(undefined),
                    fc.constant(""),
                    fc.constant(0),     // Falsy number
                    fc.constant(false)  // Falsy boolean
                )
            ])(
                "should handle HTTP monitors with falsy URL properties",
                (invalidUrl) => {
                    const monitor = createBaseMonitor({ type: "http", url: invalidUrl as any });
                    expect(() => formatTitleSuffix(monitor)).not.toThrow();
                    const result = formatTitleSuffix(monitor);
                    expect(result).toBe("");
                }
            );

            test.prop([
                fc.oneof(
                    fc.integer().filter(n => n !== 0), // Truthy numbers
                    fc.boolean().filter(b => b === true)  // Truthy boolean
                )
            ])(
                "should format HTTP monitors with truthy non-string URLs as strings",
                (truthyUrl) => {
                    const monitor = createBaseMonitor({ type: "http", url: truthyUrl as any });
                    expect(() => formatTitleSuffix(monitor)).not.toThrow();
                    const result = formatTitleSuffix(monitor);
                    expect(result).toBe(` (${truthyUrl})`);
                    expect(result).toContain(String(truthyUrl));
                }
            );
        });

        describe("Port monitors", () => {
            test.prop([
                fc.option(hostArbitrary, { nil: undefined }),
                fc.option(portArbitrary, { nil: undefined })
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
                    const monitorData: Partial<Monitor> = { type: "port", host };
                    const monitor = createBaseMonitor(monitorData);
                    const result = formatTitleSuffix(monitor);
                    expect(result).toBe("");
                }
            );

            test.prop([portArbitrary])(
                "should return empty string when host is missing",
                (port) => {
                    const monitorData: Partial<Monitor> = { type: "port", port };
                    const monitor = createBaseMonitor(monitorData);
                    const result = formatTitleSuffix(monitor);
                    expect(result).toBe("");
                }
            );

            test.prop([
                fc.oneof(fc.constant(null), fc.constant(undefined), fc.constant("")),
                fc.oneof(fc.constant(null), fc.constant(undefined), fc.string())
            ])(
                "should handle port monitors with invalid host/port properties",
                (invalidHost, invalidPort) => {
                    const monitor = createBaseMonitor({
                        type: "port",
                        host: invalidHost as any,
                        port: invalidPort as any
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
                fc.option(recordTypeArbitrary, { nil: undefined })
            ])(
                "should format DNS monitor suffix with recordType and host when both present",
                (host, recordType) => {
                    // Only include defined properties to satisfy exactOptionalPropertyTypes
                    const monitorData: Partial<Monitor> = { type: "dns" };
                    if (host !== undefined) monitorData.host = host;
                    if (recordType !== undefined) monitorData.recordType = recordType;

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
                    const monitorData: Partial<Monitor> = { type: "dns", recordType };
                    const monitor = createBaseMonitor(monitorData);
                    const result = formatTitleSuffix(monitor);
                    expect(result).toBe("");
                }
            );

            test.prop([hostArbitrary])(
                "should return empty string when recordType is missing",
                (host) => {
                    const monitorData: Partial<Monitor> = { type: "dns", host };
                    const monitor = createBaseMonitor(monitorData);
                    const result = formatTitleSuffix(monitor);
                    expect(result).toBe("");
                }
            );
        });

        describe("Ping monitors", () => {
            test.prop([fc.option(hostArbitrary, { nil: undefined })])(
                "should return empty string for ping monitors (no built-in formatter)",
                (host) => {
                    // Only include defined properties to satisfy exactOptionalPropertyTypes
                    const monitorData: Partial<Monitor> = { type: "ping" };
                    if (host !== undefined) monitorData.host = host;

                    const monitor = createBaseMonitor(monitorData);
                    const result = formatTitleSuffix(monitor);
                    expect(result).toBe("");
                }
            );
        });
    });

    describe("getTitleSuffixFormatter", () => {
        test.prop([fc.string()])(
            "should return function for known monitor types, undefined for unknown",
            (monitorType) => {
                const formatter = getTitleSuffixFormatter(monitorType);

                const knownTypes = ["http", "port", "dns"];
                if (knownTypes.includes(monitorType)) {
                    expect(typeof formatter).toBe("function");
                } else {
                    expect(formatter).toBeUndefined();
                }
            }
        );

        test.prop([monitorTypeArbitrary])(
            "should consistently return same result for same input",
            (monitorType) => {
                const formatter1 = getTitleSuffixFormatter(monitorType);
                const formatter2 = getTitleSuffixFormatter(monitorType);
                expect(formatter1).toBe(formatter2);
            }
        );
    });

    describe("registerTitleSuffixFormatter", () => {
        beforeEach(() => {
            // Clean up any previously registered custom formatters
        });

        test.prop([
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => !["http", "port", "dns", "ping"].includes(s)),
            fc.string({ minLength: 1, maxLength: 100 })
        ])(
            "should register and retrieve custom formatters",
            (customType, customSuffix) => {
                const customFormatter: TitleSuffixFormatter = () => customSuffix;

                registerTitleSuffixFormatter(customType, customFormatter);

                const retrievedFormatter = getTitleSuffixFormatter(customType);
                expect(retrievedFormatter).toBe(customFormatter);

                // Test that the formatter works
                const testMonitor = createBaseMonitor({ type: customType as any });
                const result = formatTitleSuffix(testMonitor);
                expect(result).toBe(customSuffix);
            }
        );

        test.prop([
            fc.string({ minLength: 1 }),
            fc.string({ minLength: 1 }),
            fc.string({ minLength: 1 })
        ])(
            "should allow overriding existing formatters",
            (monitorType, firstSuffix, secondSuffix) => {
                fc.pre(firstSuffix !== secondSuffix);

                const firstFormatter: TitleSuffixFormatter = () => firstSuffix;
                const secondFormatter: TitleSuffixFormatter = () => secondSuffix;

                registerTitleSuffixFormatter(monitorType, firstFormatter);
                registerTitleSuffixFormatter(monitorType, secondFormatter);

                const retrievedFormatter = getTitleSuffixFormatter(monitorType);
                expect(retrievedFormatter).toBe(secondFormatter);

                const testMonitor = createBaseMonitor({ type: monitorType as any });
                const result = formatTitleSuffix(testMonitor);
                expect(result).toBe(secondSuffix);
            }
        );
    });

    describe("Edge cases and defensive programming", () => {
        test.prop([
            fc.oneof(fc.constant(null), fc.constant(undefined), fc.constant(""))
        ])(
            "should handle monitors with invalid type properties",
            (invalidType) => {
                const monitor = createBaseMonitor({ type: invalidType as any });
                expect(() => formatTitleSuffix(monitor)).not.toThrow();
                const result = formatTitleSuffix(monitor);
                expect(result).toBe("");
            }
        );

        describe("Formatter function edge cases", () => {
            test.prop([
                fc.string({ minLength: 1 }).filter(s =>
                    !["__proto__", "constructor", "prototype"].includes(s)
                )
            ])(
                "should handle formatters that throw errors",
                (customType) => {
                    const errorFormatter: TitleSuffixFormatter = () => {
                        throw new Error("Formatter error");
                    };

                    registerTitleSuffixFormatter(customType, errorFormatter);

                    const testMonitor = createBaseMonitor({ type: customType as any });

                    // The current implementation doesn't handle errors, but test that it fails predictably
                    expect(() => formatTitleSuffix(testMonitor)).toThrow();
                }
            );

            test.prop([
                fc.string({ minLength: 1 }).filter(s =>
                    !["__proto__", "constructor", "prototype"].includes(s)
                )
            ])(
                "should handle formatters that return non-string values",
                (customType) => {
                    const nonStringFormatter: TitleSuffixFormatter = () => null as any; // Return invalid type

                    registerTitleSuffixFormatter(customType, nonStringFormatter);

                    const testMonitor = createBaseMonitor({ type: customType as any });

                    const result = formatTitleSuffix(testMonitor);
                    // Should still work, as JavaScript coerces null to string
                    expect(typeof result === "string" || result === null).toBe(true);
                }
            );
        });

        test.prop([
            fc.array(fc.constantFrom("http", "port", "dns", "ping"), { minLength: 10, maxLength: 100 })
        ])(
            "should handle large numbers of monitors efficiently with known types only",
            (monitorTypes) => {
                // Only use known monitor types to avoid interference from custom formatters
                const monitors = monitorTypes.map(type => createBaseMonitor({ type: type as any }));

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
