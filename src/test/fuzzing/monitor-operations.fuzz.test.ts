/**
 * Comprehensive property-based fuzzing tests for monitor operations.
 *
 * @remarks
 * Expands on the form validation fuzzing by testing monitor creation,
 * normalization, validation, and state operations with complex edge cases.
 * Targets monitor operations utilities that handle object creation, validation,
 * and state transitions.
 *
 * @public
 */

import { describe, expect, test } from "vitest";
import fc from "fast-check";

import type {
    Monitor,
    MonitorType,
    MonitorStatus,
    Site,
} from "../../../shared/types";
import { BASE_MONITOR_TYPES } from "../../../shared/types";
import {
    createDefaultMonitor,
    normalizeMonitor,
    monitorOperations,
    addMonitorToSite,
    updateMonitorInSite,
    findMonitorInSite,
    validateMonitorExists,
} from "../../stores/sites/utils/monitorOperations";
import { isNonEmptyString } from "../../../shared/validation/validatorUtils";

// Test data generators using fast-check
const arbitraryMonitorType = (): fc.Arbitrary<MonitorType> =>
    fc.constantFrom(...BASE_MONITOR_TYPES);

const arbitraryMonitorStatus = (): fc.Arbitrary<MonitorStatus> =>
    fc.constantFrom("up", "down", "pending", "paused");

const arbitraryUrl = (): fc.Arbitrary<string> =>
    fc.oneof(
        // Valid URLs
        fc.webUrl(),
        fc.constantFrom(
            "https://example.com",
            "http://localhost:3000",
            "https://api.example.com/health",
            "https://192.168.1.1", // Local IP for testing
            "https://subdomain.example.org:8080/path"
        ),
        // Invalid URLs but string-like
        fc.string(),
        fc.constantFrom(
            "",
            "not-a-url",
            "ftp://example.com",
            "data:text/html,<script>alert(1)</script>",
            "file:///etc/passwd",
            "localhost",
            "example.com",
            "https://",
            "://invalid",
            "https://example.com:99999",
            "https://user:pass@example.com",
            "https://[invalid-ipv6]"
        )
    );

const arbitraryHost = (): fc.Arbitrary<string> =>
    fc.oneof(
        // Valid hostnames
        fc.domain(),
        fc.ipV4(),
        fc.ipV6(),
        fc.constantFrom(
            "localhost",
            "example.com",
            "api.service.local",
            "192.168.1.1",
            "::1",
            "fe80::1%lo0"
        ),
        // Invalid hostnames
        fc.string(),
        fc.constantFrom(
            "",
            "invalid_hostname",
            ".starting-dot.com",
            "ending-dot.com.",
            "spaces in hostname",
            `toolong${"a".repeat(300)}.com`,
            "localhost:3000", // Port in hostname
            "user@hostname",
            "hostname with spaces",
            "hostname.with..double.dots"
        )
    );

const arbitraryPort = (): fc.Arbitrary<number> =>
    fc.oneof(
        // Valid ports
        fc.integer({ min: 1, max: 65_535 }),
        fc.constantFrom(80, 443, 3000, 8080, 22, 21, 25, 53),
        // Invalid ports
        fc.integer(),
        fc.constantFrom(0, -1, 65_536, 99_999, -5000)
    );

const arbitraryTimeout = (): fc.Arbitrary<number> =>
    fc.oneof(
        // Valid timeouts
        fc.integer({ min: 1000, max: 300_000 }),
        fc.constantFrom(5000, 10_000, 30_000, 60_000),
        // Edge case timeouts
        fc.integer(),
        fc.constantFrom(0, -1, 999, 300_001, 999_999, -5000)
    );

const arbitraryCheckInterval = (): fc.Arbitrary<number> =>
    fc.oneof(
        // Valid intervals
        fc.integer({ min: 5000, max: 2_592_000_000 }), // 5s to 30 days
        fc.constantFrom(30_000, 60_000, 300_000, 900_000, 3_600_000),
        // Invalid intervals
        fc.integer(),
        fc.constantFrom(0, -1, 4999, 2_592_000_001, -10_000)
    );

const arbitraryRetryAttempts = (): fc.Arbitrary<number> =>
    fc.oneof(
        // Valid retry attempts
        fc.integer({ min: 0, max: 10 }),
        fc.constantFrom(0, 1, 3, 5, 10),
        // Invalid retry attempts
        fc.integer(),
        fc.constantFrom(-1, 11, 100, -5)
    );

// Generate mixed type values that could break type coercion
const arbitraryMixedValue = (): fc.Arbitrary<unknown> =>
    fc.oneof(
        fc.string(),
        fc.integer(),
        fc.float(),
        fc.boolean(),
        fc.constant(null),
        fc.constant(undefined),
        fc.array(fc.anything()),
        fc.object(),
        fc.constantFrom(
            "",
            "0",
            "false",
            "true",
            "null",
            "undefined",
            {},
            [],
            new Date(),
            /regex/,
            Symbol("test"),
            () => {},
            new Error("test")
        )
    );

const arbitraryPartialMonitor = (): fc.Arbitrary<Partial<Monitor>> =>
    fc
        .record({
            id: fc.string(),
            type: arbitraryMonitorType(),
            url: arbitraryUrl(),
            host: arbitraryHost(),
            port: arbitraryPort(),
            timeout: arbitraryTimeout(),
            checkInterval: arbitraryCheckInterval(),
            retryAttempts: arbitraryRetryAttempts(),
            monitoring: fc.boolean(),
            status: arbitraryMonitorStatus(),
            responseTime: fc.integer(),
            recordType: fc.string(),
            expectedValue: fc.string(),
            bodyKeyword: fc.string(),
            expectedStatusCode: fc.integer({ min: 100, max: 599 }),
            certificateWarningDays: fc.integer({ min: 1, max: 365 }),
            activeOperations: fc.array(fc.string()),
            history: fc.array(
                fc.record({
                    timestamp: fc.integer(),
                    status: fc.constantFrom("up", "down"), // StatusHistory only supports "up" | "down"
                    responseTime: fc.integer({ min: 0 }),
                    details: fc.string(),
                })
            ),
            lastChecked: fc.date(),
        })
        .map((fullMonitor) => {
            // Create a partial by randomly selecting which properties to include
            const partial: Partial<Monitor> = {};
            const keys = Object.keys(fullMonitor) as (keyof Monitor)[];

            for (const key of keys) {
                if (Math.random() > 0.5) {
                    // Randomly include ~50% of properties
                    (partial as any)[key] = fullMonitor[key];
                }
            }

            return partial;
        });

// Generate monitor with mixed type contamination
const arbitraryContaminatedMonitor = (): fc.Arbitrary<
    Record<string, unknown>
> =>
    fc.record({
        id: arbitraryMixedValue(),
        type: arbitraryMixedValue(),
        url: arbitraryMixedValue(),
        host: arbitraryMixedValue(),
        port: arbitraryMixedValue(),
        timeout: arbitraryMixedValue(),
        checkInterval: arbitraryMixedValue(),
        retryAttempts: arbitraryMixedValue(),
        monitoring: arbitraryMixedValue(),
        status: arbitraryMixedValue(),
        responseTime: arbitraryMixedValue(),
        recordType: arbitraryMixedValue(),
        expectedValue: arbitraryMixedValue(),
        bodyKeyword: arbitraryMixedValue(),
        expectedStatusCode: arbitraryMixedValue(),
        certificateWarningDays: arbitraryMixedValue(),
        activeOperations: arbitraryMixedValue(),
        history: arbitraryMixedValue(),
        lastChecked: arbitraryMixedValue(),
    });

describe("Monitor Operations Fuzzing Tests", () => {
    describe(createDefaultMonitor, () => {
        test("should create valid monitor with any partial override", () => {
            fc.assert(
                fc.property(arbitraryPartialMonitor(), (overrides) => {
                    const monitor = createDefaultMonitor(overrides);

                    // All monitors must have these required fields
                    expect(monitor).toHaveProperty("id");
                    expect(monitor).toHaveProperty("type");
                    expect(monitor).toHaveProperty("checkInterval");
                    expect(monitor).toHaveProperty("timeout");
                    expect(monitor).toHaveProperty("retryAttempts");
                    expect(monitor).toHaveProperty("monitoring");
                    expect(monitor).toHaveProperty("status");
                    expect(monitor).toHaveProperty("responseTime");
                    expect(monitor).toHaveProperty("history");
                    expect(monitor).toHaveProperty("activeOperations");

                    // Validate types and ranges
                    expect(typeof monitor.id).toBe("string");
                    expect(monitor.id.length).toBeGreaterThan(0);
                    expect(BASE_MONITOR_TYPES).toContain(monitor.type);
                    expect(typeof monitor.checkInterval).toBe("number");
                    expect(monitor.checkInterval).toBeGreaterThan(0);
                    expect(typeof monitor.timeout).toBe("number");
                    expect(monitor.timeout).toBeGreaterThan(0);
                    expect(typeof monitor.retryAttempts).toBe("number");
                    expect(monitor.retryAttempts).toBeGreaterThanOrEqual(0);
                    expect(typeof monitor.monitoring).toBe("boolean");
                    expect([
                        "up",
                        "down",
                        "pending",
                        "paused",
                    ]).toContain(monitor.status);
                    expect(typeof monitor.responseTime).toBe("number");
                    expect(Array.isArray(monitor.history)).toBeTruthy();
                    expect(
                        Array.isArray(monitor.activeOperations)
                    ).toBeTruthy();
                })
            );
        });

        test("should handle contaminated input gracefully", () => {
            fc.assert(
                fc.property(arbitraryContaminatedMonitor(), (contaminated) => {
                    const monitor = createDefaultMonitor(
                        contaminated as Partial<Monitor>
                    );

                    // Should still create a valid monitor despite contamination
                    expect(monitor).toHaveProperty("id");
                    expect(typeof monitor.id).toBe("string");
                    expect(BASE_MONITOR_TYPES).toContain(monitor.type);
                })
            );
        });
    });

    describe(normalizeMonitor, () => {
        test("should normalize any partial monitor input", () => {
            fc.assert(
                fc.property(arbitraryPartialMonitor(), (partial) => {
                    const normalized = normalizeMonitor(partial);

                    // Should have all required fields
                    expect(normalized).toHaveProperty("id");
                    expect(normalized).toHaveProperty("type");
                    expect(normalized).toHaveProperty("checkInterval");
                    expect(normalized).toHaveProperty("timeout");
                    expect(normalized).toHaveProperty("retryAttempts");
                    expect(normalized).toHaveProperty("monitoring");
                    expect(normalized).toHaveProperty("status");
                    expect(normalized).toHaveProperty("responseTime");
                    expect(normalized).toHaveProperty("history");
                    expect(normalized).toHaveProperty("activeOperations");

                    // Should have valid values
                    expect(typeof normalized.id).toBe("string");
                    expect(normalized.id.length).toBeGreaterThan(0);
                    expect(BASE_MONITOR_TYPES).toContain(normalized.type);
                    expect(normalized.checkInterval).toBeGreaterThanOrEqual(
                        5000
                    );
                    expect(normalized.timeout).toBeGreaterThanOrEqual(1000);
                    expect(normalized.timeout).toBeLessThanOrEqual(300_000);
                    expect(normalized.retryAttempts).toBeGreaterThanOrEqual(0);
                    expect(normalized.retryAttempts).toBeLessThanOrEqual(10);
                    expect(typeof normalized.monitoring).toBe("boolean");
                    expect([
                        "up",
                        "down",
                        "pending",
                        "paused",
                    ]).toContain(normalized.status);
                    expect(Array.isArray(normalized.history)).toBeTruthy();
                    expect(
                        Array.isArray(normalized.activeOperations)
                    ).toBeTruthy();
                })
            );
        });

        test("should handle array input gracefully", () => {
            fc.assert(
                fc.property(fc.array(fc.anything()), (arrayInput) => {
                    expect(() =>
                        normalizeMonitor(arrayInput as Partial<Monitor>)
                    ).toThrow(
                        "Invalid monitor data: must be an object, not an array"
                    );
                })
            );
        });

        test("should filter fields by monitor type", () => {
            fc.assert(
                fc.property(
                    arbitraryMonitorType(),
                    arbitraryPartialMonitor(),
                    (type, partial) => {
                        const monitorWithType = { ...partial, type };
                        const normalized = normalizeMonitor(monitorWithType);

                        expect(normalized.type).toBe(type);

                        // Check type-specific field filtering
                        switch (type) {
                            case "http": {
                                // HTTP monitors should have URL if provided and valid
                                if (
                                    partial.url &&
                                    typeof partial.url === "string" &&
                                    partial.url.startsWith("http")
                                ) {
                                    expect(normalized).toHaveProperty("url");
                                }
                                // HTTP monitors should not have port or host fields (unless host is needed for proxy)

                                break;
                            }
                            case "port": {
                                // Port monitors should have host and port if provided and valid
                                if (
                                    partial.host &&
                                    typeof partial.host === "string" &&
                                    partial.host.length > 0
                                ) {
                                    expect(normalized).toHaveProperty("host");
                                }
                                if (
                                    partial.port &&
                                    typeof partial.port === "number" &&
                                    partial.port > 0 &&
                                    partial.port <= 65_535
                                ) {
                                    expect(normalized).toHaveProperty("port");
                                }

                                break;
                            }
                            case "dns": {
                                // DNS monitors should have host, recordType, expectedValue if provided and valid
                                if (
                                    partial.host &&
                                    typeof partial.host === "string" &&
                                    partial.host.length > 0
                                ) {
                                    expect(normalized).toHaveProperty("host");
                                }
                                if (
                                    partial.recordType &&
                                    typeof partial.recordType === "string" &&
                                    partial.recordType.length > 0
                                ) {
                                    expect(normalized).toHaveProperty(
                                        "recordType"
                                    );
                                }
                                if (
                                    partial.expectedValue &&
                                    typeof partial.expectedValue === "string" &&
                                    isNonEmptyString(partial.expectedValue)
                                ) {
                                    expect(normalized).toHaveProperty(
                                        "expectedValue"
                                    );
                                }

                                break;
                            }
                            // No default
                        }
                    }
                )
            );
        });

        test("should handle contaminated input with type coercion", () => {
            fc.assert(
                fc.property(arbitraryContaminatedMonitor(), (contaminated) => {
                    try {
                        const normalized = normalizeMonitor(
                            contaminated as Partial<Monitor>
                        );

                        // Should still produce valid monitor
                        expect(normalized).toHaveProperty("id");
                        expect(typeof normalized.id).toBe("string");
                        expect(BASE_MONITOR_TYPES).toContain(normalized.type);
                        expect(normalized.checkInterval).toBeGreaterThanOrEqual(
                            5000
                        );
                        expect(normalized.timeout).toBeGreaterThanOrEqual(1000);
                        expect(normalized.retryAttempts).toBeGreaterThanOrEqual(
                            0
                        );
                    } catch (error) {
                        // If it throws, it should be a TypeError for invalid input
                        expect(error).toBeInstanceOf(TypeError);
                    }
                })
            );
        });
    });

    describe("monitorOperations", () => {
        test("updateStatus should validate status values", () => {
            fc.assert(
                fc.property(
                    arbitraryPartialMonitor(),
                    arbitraryMixedValue(),
                    (monitorData, statusValue) => {
                        const monitor = normalizeMonitor(monitorData);

                        if (
                            [
                                "up",
                                "down",
                                "pending",
                                "paused",
                            ].includes(statusValue as string)
                        ) {
                            const updated = monitorOperations.updateStatus(
                                monitor,
                                statusValue as MonitorStatus
                            );
                            expect(updated.status).toBe(statusValue);
                            expect(updated.id).toBe(monitor.id); // Other fields preserved
                        } else {
                            expect(() =>
                                monitorOperations.updateStatus(
                                    monitor,
                                    statusValue as MonitorStatus
                                )
                            ).toThrow("Invalid monitor status");
                        }
                    }
                )
            );
        });

        test("updateTimeout should preserve monitor integrity", () => {
            fc.assert(
                fc.property(
                    arbitraryPartialMonitor(),
                    arbitraryTimeout(),
                    (monitorData, timeout) => {
                        const monitor = normalizeMonitor(monitorData);
                        const updated = monitorOperations.updateTimeout(
                            monitor,
                            timeout
                        );

                        expect(updated.timeout).toBe(timeout);
                        expect(updated.id).toBe(monitor.id);
                        expect(updated.type).toBe(monitor.type);
                        expect(updated.status).toBe(monitor.status);
                        // All other fields should be preserved
                    }
                )
            );
        });

        test("updateCheckInterval should handle any numeric input", () => {
            fc.assert(
                fc.property(
                    arbitraryPartialMonitor(),
                    arbitraryCheckInterval(),
                    (monitorData, interval) => {
                        const monitor = normalizeMonitor(monitorData);
                        const updated = monitorOperations.updateCheckInterval(
                            monitor,
                            interval
                        );

                        expect(updated.checkInterval).toBe(interval);
                        expect(updated.id).toBe(monitor.id);
                        // Other fields preserved
                    }
                )
            );
        });

        test("updateRetryAttempts should handle any numeric input", () => {
            fc.assert(
                fc.property(
                    arbitraryPartialMonitor(),
                    arbitraryRetryAttempts(),
                    (monitorData, retries) => {
                        const monitor = normalizeMonitor(monitorData);
                        const updated = monitorOperations.updateRetryAttempts(
                            monitor,
                            retries
                        );

                        expect(updated.retryAttempts).toBe(retries);
                        expect(updated.id).toBe(monitor.id);
                        // Other fields preserved
                    }
                )
            );
        });

        test("toggleMonitoring should flip boolean state", () => {
            fc.assert(
                fc.property(arbitraryPartialMonitor(), (monitorData) => {
                    const monitor = normalizeMonitor(monitorData);
                    const originalState = monitor.monitoring;
                    const toggled = monitorOperations.toggleMonitoring(monitor);

                    expect(toggled.monitoring).toBe(!originalState);
                    expect(toggled.id).toBe(monitor.id);
                    // All other fields preserved
                })
            );
        });
    });

    describe("site monitor operations", () => {
        const arbitrarySite = (): fc.Arbitrary<Site> =>
            fc.record({
                identifier: fc.string({ minLength: 1 }),
                name: fc.string({ minLength: 1 }),
                monitoring: fc.boolean(),
                monitors: fc.array(
                    arbitraryPartialMonitor().map((monitor) =>
                        normalizeMonitor(monitor)
                    )
                ),
            });

        test("addMonitorToSite should preserve site structure", () => {
            fc.assert(
                fc.property(
                    arbitrarySite(),
                    arbitraryPartialMonitor(),
                    (site, monitorData) => {
                        const monitor = normalizeMonitor(monitorData);
                        const updated = addMonitorToSite(site, monitor);

                        expect(updated.identifier).toBe(site.identifier);
                        expect(updated.name).toBe(site.name);
                        expect(updated.monitors).toHaveLength(
                            site.monitors.length + 1
                        );
                        expect(updated.monitors).toContain(monitor);
                    }
                )
            );
        });

        test("findMonitorInSite should handle various monitor IDs", () => {
            fc.assert(
                fc.property(arbitrarySite(), fc.string(), (site, searchId) => {
                    const found = findMonitorInSite(site, searchId);

                    const existsInSite = site.monitors.some(
                        (m) => m.id === searchId
                    );
                    if (existsInSite) {
                        expect(found).toBeDefined();
                        expect(found!.id).toBe(searchId);
                    } else {
                        expect(found).toBeUndefined();
                    }
                })
            );
        });

        test("updateMonitorInSite should handle update failures gracefully", () => {
            fc.assert(
                fc.property(
                    arbitrarySite(),
                    fc.string(),
                    arbitraryContaminatedMonitor(),
                    (site, monitorId, updates) => {
                        // Add a monitor with the ID we'll try to update
                        const testMonitor = normalizeMonitor({ id: monitorId });
                        const siteWithMonitor = addMonitorToSite(
                            site,
                            testMonitor
                        );

                        // Use the actual ID that was generated by normalizeMonitor
                        // (normalizeMonitor generates UUID for empty/invalid IDs)
                        const actualMonitorId = testMonitor.id;

                        const updated = updateMonitorInSite(
                            siteWithMonitor,
                            actualMonitorId,
                            updates as Partial<Monitor>
                        );

                        // Should always return a site
                        expect(updated).toHaveProperty("identifier");
                        expect(updated).toHaveProperty("name");
                        expect(updated).toHaveProperty("monitors");

                        // Should still have the monitor (with the actual ID)
                        const monitor = findMonitorInSite(
                            updated,
                            actualMonitorId
                        );
                        expect(monitor).toBeDefined();
                    }
                )
            );
        });

        test("validateMonitorExists should throw for missing monitor", () => {
            fc.assert(
                fc.property(arbitrarySite(), fc.string(), (site, randomId) => {
                    const monitorExists = site.monitors.some(
                        (m) => m.id === randomId
                    );

                    if (monitorExists) {
                        expect(() =>
                            validateMonitorExists(site, randomId)
                        ).not.toThrow();
                    } else {
                        expect(() =>
                            validateMonitorExists(site, randomId)
                        ).toThrow();
                    }
                })
            );
        });

        test("validateMonitorExists should throw for undefined site", () => {
            fc.assert(
                fc.property(fc.string(), (monitorId) => {
                    expect(() =>
                        validateMonitorExists(undefined, monitorId)
                    ).toThrow();
                })
            );
        });
    });

    describe("edge cases and boundary conditions", () => {
        test("should handle empty string inputs", () => {
            const emptyStringMonitor = normalizeMonitor({
                id: "",
                type: "" as unknown as MonitorType,
                url: "",
                host: "",
                recordType: "",
                expectedValue: "",
            } as Partial<Monitor>);

            // Should generate valid defaults
            expect(emptyStringMonitor.id).toBeTruthy();
            expect(emptyStringMonitor.id.length).toBeGreaterThan(0);
            expect(BASE_MONITOR_TYPES).toContain(emptyStringMonitor.type);
        });

        test("should handle numeric strings for validation", () => {
            const numericStringMonitor = normalizeMonitor({
                timeout: "5000" as unknown as number,
                checkInterval: "300000" as unknown as number,
                retryAttempts: "3" as unknown as number,
                port: "80" as unknown as number,
            });

            // Should coerce properly
            expect(typeof numericStringMonitor.timeout).toBe("number");
            expect(numericStringMonitor.timeout).toBeGreaterThan(0);
        });

        test("should handle extreme numeric values", () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: -1_000_000, max: 1_000_000 }),
                    fc.integer({ min: -1_000_000, max: 1_000_000 }),
                    fc.integer({ min: -1_000_000, max: 1_000_000 }),
                    (timeout, interval, retries) => {
                        const monitor = normalizeMonitor({
                            timeout,
                            checkInterval: interval,
                            retryAttempts: retries,
                        });

                        // Should enforce bounds
                        expect(monitor.timeout).toBeGreaterThanOrEqual(1000);
                        expect(monitor.timeout).toBeLessThanOrEqual(300_000);
                        expect(monitor.checkInterval).toBeGreaterThanOrEqual(
                            5000
                        );
                        expect(monitor.retryAttempts).toBeGreaterThanOrEqual(0);
                        expect(monitor.retryAttempts).toBeLessThanOrEqual(10);
                    }
                )
            );
        });

        test("should handle Unicode and special characters", () => {
            fc.assert(
                fc.property(fc.string(), (unicodeStr) => {
                    const monitor = normalizeMonitor({
                        id: unicodeStr,
                        url: unicodeStr,
                        host: unicodeStr,
                        recordType: unicodeStr,
                        expectedValue: unicodeStr,
                    });

                    // Should handle gracefully without throwing
                    expect(monitor).toHaveProperty("id");
                    expect(monitor).toHaveProperty("type");
                })
            );
        });

        test("should handle circular references safely", () => {
            const circular: any = { type: "http" };
            circular.self = circular;
            circular.nested = { parent: circular };

            // Should not hang or crash
            const monitor = normalizeMonitor(circular);
            expect(monitor).toHaveProperty("id");
            expect(monitor).toHaveProperty("type");
        });

        test("should handle very large objects", () => {
            const largeData: Record<string, unknown> = { type: "http" };
            for (let i = 0; i < 1000; i++) {
                largeData[`field${i}`] = `value${i}`;
            }

            const monitor = normalizeMonitor(largeData);
            expect(monitor).toHaveProperty("id");
            expect(monitor).toHaveProperty("type");

            // Should filter out extra fields
            expect(Object.keys(monitor).length).toBeLessThan(100);
        });
    });
});
