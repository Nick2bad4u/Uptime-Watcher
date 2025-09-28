/**
 * Property-based tests for Zod validation schemas using fast-check
 *
 * @packageDocumentation
 */

import { test, fc } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import validator from "validator";

import {
    baseMonitorSchema,
    httpMonitorSchema,
    portMonitorSchema,
    pingMonitorSchema,
    dnsMonitorSchema,
    monitorSchema,
    siteSchema,
    validateMonitorData,
    validateSiteData,
} from "../validation/schemas";

// Custom arbitraries for monitor data generation that match schema constraints
const baseMonitorArbitrary = fc.record({
    id: fc
        .string({ minLength: 1, maxLength: 100 })
        .filter((s) => s.trim().length > 0),
    type: fc.constantFrom(
        "http",
        "http-keyword",
        "http-status",
        "port",
        "ping",
        "dns",
        "ssl"
    ),
    monitoring: fc.boolean(),
    status: fc.constantFrom("up", "down", "pending", "paused"),
    checkInterval: fc.oneof(fc.integer({ min: 5000, max: 2_592_000_000 })),
    timeout: fc.integer({ min: 1000, max: 300_000 }),
    retryAttempts: fc.integer({ min: 0, max: 10 }),
    responseTime: fc.integer({ min: -1, max: 999_999 }),
    history: fc.array(
        fc.record({
            status: fc.constantFrom("up", "down"),
            responseTime: fc.integer({ min: 0, max: 999_999 }),
            timestamp: fc.integer({ min: 0, max: Date.now() + 86_400_000 }),
            details: fc.option(fc.string({ maxLength: 500 }), {
                nil: undefined,
            }),
        }),
        { maxLength: 100 }
    ),
    lastChecked: fc.option(
        fc
            .integer({
                min: Date.parse("2020-01-01"),
                max: Date.parse("2030-01-01"),
            })
            .map((timestamp) => new Date(timestamp)),
        { nil: undefined }
    ),
    activeOperations: fc.option(fc.array(fc.string(), { maxLength: 50 }), {
        nil: undefined,
    }),
});

// Valid URL arbitrary that creates URLs that pass validator.js
const validUrlArbitrary = fc
    .oneof(
        fc.constant("https://example.com"),
        fc.constant("http://example.com"),
        fc.constant("https://www.google.com"),
        fc.constant("http://www.google.com"),
        fc.constant("https://github.com"),
        fc.constant("http://github.com"),
        fc.constant("https://api.example.com"),
        fc.constant("http://api.example.com")
    )
    .filter((url) =>
        // Validate using the same options as the schema
        validator.isURL(url, {
            allow_protocol_relative_urls: false,
            allow_trailing_dot: false,
            allow_underscores: false,
            disallow_auth: false,
            protocols: ["http", "https"],
            require_host: true,
            require_protocol: true,
            require_tld: true,
            validate_length: true,
        })
    );

// Valid host arbitrary that passes isValidHost validation
const validHostArbitrary = fc
    .oneof(
        fc.constant("localhost"),
        fc.constant("example.com"),
        fc.constant("google.com"),
        fc.constant("github.com"),
        fc.constant("api.example.com"),
        fc.ipV4(),
        fc.constantFrom("192.168.1.1", "10.0.0.1", "127.0.0.1", "8.8.8.8")
    )
    .filter((host) => {
        // Validate using the same logic as isValidHost
        if (typeof host !== "string") return false;

        // Check if it's a valid IP address
        if (validator.isIP(host)) return true;

        // Check if it's a valid FQDN
        if (
            validator.isFQDN(host, {
                allow_numeric_tld: false,
                allow_trailing_dot: false,
                allow_underscores: false,
                allow_wildcard: false,
                require_tld: true,
            })
        )
            return true;

        // Allow localhost as a special case
        return host === "localhost";
    });

// More efficient arbitraries that don't use fc.sample
const httpMonitorBaseFields = {
    id: fc
        .string({ minLength: 1, maxLength: 100 })
        .filter((s) => s.trim().length > 0),
    monitoring: fc.boolean(),
    status: fc.constantFrom("up", "down", "pending", "paused"),
    checkInterval: fc.integer({ min: 5000, max: 2_592_000_000 }),
    timeout: fc.integer({ min: 1000, max: 300_000 }),
    retryAttempts: fc.integer({ min: 0, max: 10 }),
    responseTime: fc.integer({ min: -1, max: 999_999 }),
    history: fc.array(
        fc.record({
            status: fc.constantFrom("up", "down"),
            responseTime: fc.integer({ min: 0, max: 999_999 }),
            timestamp: fc.integer({ min: 0, max: Date.now() + 86_400_000 }),
            details: fc.option(fc.string({ maxLength: 500 }), {
                nil: undefined,
            }),
        }),
        { maxLength: 100 }
    ),
    lastChecked: fc.option(
        fc
            .integer({
                min: Date.parse("2020-01-01"),
                max: Date.parse("2030-01-01"),
            })
            .map((timestamp) => new Date(timestamp)),
        { nil: undefined }
    ),
    activeOperations: fc.option(fc.array(fc.string(), { maxLength: 50 }), {
        nil: undefined,
    }),
    url: validUrlArbitrary,
} as const;

const httpMonitorArbitrary = fc.record({
    ...httpMonitorBaseFields,
    type: fc.constant("http" as const),
});

const httpKeywordMonitorArbitrary = fc.record({
    ...httpMonitorBaseFields,
    bodyKeyword: fc
        .string({ minLength: 1, maxLength: 256 })
        .filter((keyword) => keyword.trim().length > 0),
    type: fc.constant("http-keyword" as const),
});

const httpStatusMonitorArbitrary = fc.record({
    ...httpMonitorBaseFields,
    expectedStatusCode: fc.integer({ min: 100, max: 599 }),
    type: fc.constant("http-status" as const),
});

const portMonitorArbitrary = fc.record({
    id: fc
        .string({ minLength: 1, maxLength: 100 })
        .filter((s) => s.trim().length > 0),
    type: fc.constant("port" as const),
    monitoring: fc.boolean(),
    status: fc.constantFrom("up", "down", "pending", "paused"),
    checkInterval: fc.integer({ min: 5000, max: 2_592_000_000 }),
    timeout: fc.integer({ min: 1000, max: 300_000 }),
    retryAttempts: fc.integer({ min: 0, max: 10 }),
    responseTime: fc.integer({ min: -1, max: 999_999 }),
    history: fc.array(
        fc.record({
            status: fc.constantFrom("up", "down"),
            responseTime: fc.integer({ min: 0, max: 999_999 }),
            timestamp: fc.integer({ min: 0, max: Date.now() + 86_400_000 }),
            details: fc.option(fc.string({ maxLength: 500 }), {
                nil: undefined,
            }),
        }),
        { maxLength: 100 }
    ),
    lastChecked: fc.option(
        fc
            .integer({
                min: Date.parse("2020-01-01"),
                max: Date.parse("2030-01-01"),
            })
            .map((timestamp) => new Date(timestamp)),
        { nil: undefined }
    ),
    activeOperations: fc.option(fc.array(fc.string(), { maxLength: 50 }), {
        nil: undefined,
    }),
    host: validHostArbitrary,
    port: fc.integer({ min: 1, max: 65_535 }),
});

const sslMonitorArbitrary = fc.record({
    id: fc
        .string({ minLength: 1, maxLength: 100 })
        .filter((s) => s.trim().length > 0),
    type: fc.constant("ssl" as const),
    monitoring: fc.boolean(),
    status: fc.constantFrom("up", "down", "pending", "paused"),
    checkInterval: fc.integer({ min: 5000, max: 2_592_000_000 }),
    timeout: fc.integer({ min: 1000, max: 300_000 }),
    retryAttempts: fc.integer({ min: 0, max: 10 }),
    responseTime: fc.integer({ min: -1, max: 999_999 }),
    history: fc.array(
        fc.record({
            status: fc.constantFrom("up", "down"),
            responseTime: fc.integer({ min: 0, max: 999_999 }),
            timestamp: fc.integer({ min: 0, max: Date.now() + 86_400_000 }),
            details: fc.option(fc.string({ maxLength: 500 }), {
                nil: undefined,
            }),
        }),
        { maxLength: 100 }
    ),
    lastChecked: fc.option(
        fc
            .integer({
                min: Date.parse("2020-01-01"),
                max: Date.parse("2030-01-01"),
            })
            .map((timestamp) => new Date(timestamp)),
        { nil: undefined }
    ),
    activeOperations: fc.option(fc.array(fc.string(), { maxLength: 50 }), {
        nil: undefined,
    }),
    certificateWarningDays: fc.integer({ min: 1, max: 365 }),
    host: validHostArbitrary,
    port: fc.integer({ min: 1, max: 65_535 }),
});

const pingMonitorArbitrary = fc.record({
    id: fc
        .string({ minLength: 1, maxLength: 100 })
        .filter((s) => s.trim().length > 0),
    type: fc.constant("ping" as const),
    monitoring: fc.boolean(),
    status: fc.constantFrom("up", "down", "pending", "paused"),
    checkInterval: fc.integer({ min: 5000, max: 2_592_000_000 }),
    timeout: fc.integer({ min: 1000, max: 300_000 }),
    retryAttempts: fc.integer({ min: 0, max: 10 }),
    responseTime: fc.integer({ min: -1, max: 999_999 }),
    history: fc.array(
        fc.record({
            status: fc.constantFrom("up", "down"),
            responseTime: fc.integer({ min: 0, max: 999_999 }),
            timestamp: fc.integer({ min: 0, max: Date.now() + 86_400_000 }),
            details: fc.option(fc.string({ maxLength: 500 }), {
                nil: undefined,
            }),
        }),
        { maxLength: 100 }
    ),
    lastChecked: fc.option(
        fc
            .integer({
                min: Date.parse("2020-01-01"),
                max: Date.parse("2030-01-01"),
            })
            .map((timestamp) => new Date(timestamp)),
        { nil: undefined }
    ),
    activeOperations: fc.option(fc.array(fc.string(), { maxLength: 50 }), {
        nil: undefined,
    }),
    host: validHostArbitrary,
});

const dnsMonitorArbitrary = fc.record({
    id: fc
        .string({ minLength: 1, maxLength: 100 })
        .filter((s) => s.trim().length > 0),
    type: fc.constant("dns" as const),
    monitoring: fc.boolean(),
    status: fc.constantFrom("up", "down", "pending", "paused"),
    checkInterval: fc.integer({ min: 5000, max: 2_592_000_000 }),
    timeout: fc.integer({ min: 1000, max: 300_000 }),
    retryAttempts: fc.integer({ min: 0, max: 10 }),
    responseTime: fc.integer({ min: -1, max: 999_999 }),
    history: fc.array(
        fc.record({
            status: fc.constantFrom("up", "down"),
            responseTime: fc.integer({ min: 0, max: 999_999 }),
            timestamp: fc.integer({ min: 0, max: Date.now() + 86_400_000 }),
            details: fc.option(fc.string({ maxLength: 500 }), {
                nil: undefined,
            }),
        }),
        { maxLength: 100 }
    ),
    lastChecked: fc.option(
        fc
            .integer({
                min: Date.parse("2020-01-01"),
                max: Date.parse("2030-01-01"),
            })
            .map((timestamp) => new Date(timestamp)),
        { nil: undefined }
    ),
    activeOperations: fc.option(fc.array(fc.string(), { maxLength: 50 }), {
        nil: undefined,
    }),
    host: validHostArbitrary,
    recordType: fc.constantFrom(
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
    ),
});

const monitorArbitrary = fc.oneof(
    httpMonitorArbitrary,
    httpKeywordMonitorArbitrary,
    httpStatusMonitorArbitrary,
    portMonitorArbitrary,
    pingMonitorArbitrary,
    dnsMonitorArbitrary,
    sslMonitorArbitrary
);

const siteArbitrary = fc.record({
    identifier: fc
        .string({ minLength: 1, maxLength: 100 })
        .filter((s) => /^[\w-]+$/.test(s) && s.trim().length > 0),
    name: fc
        .string({ minLength: 1, maxLength: 200 })
        .filter((s) => s.trim().length > 0),
    monitoring: fc.boolean(),
    monitors: fc.array(monitorArbitrary, { minLength: 1, maxLength: 10 }),
});

describe("Schema Property-Based Tests", () => {
    describe("baseMonitorSchema", () => {
        test.prop([baseMonitorArbitrary])(
            "should validate any generated monitor data",
            (monitorData) => {
                const result = baseMonitorSchema.safeParse(monitorData);
                expect(result.success).toBeTruthy();

                if (result.success) {
                    expect(result.data).toEqual(monitorData);
                    expect(result.data.id).toBeDefined();
                    expect(result.data.type).toBeOneOf([
                        "http",
                        "http-keyword",
                        "http-status",
                        "port",
                        "ping",
                        "dns",
                        "ssl",
                    ]);
                    expect(result.data.status).toBeOneOf([
                        "up",
                        "down",
                        "pending",
                        "paused",
                    ]);
                    expect(result.data.monitoring).toBeTypeOf("boolean");
                    expect(result.data.checkInterval).toBeGreaterThanOrEqual(
                        5000
                    );
                    expect(result.data.checkInterval).toBeLessThanOrEqual(
                        2_592_000_000
                    );
                    expect(result.data.timeout).toBeGreaterThanOrEqual(1000);
                    expect(result.data.timeout).toBeLessThanOrEqual(300_000);
                    expect(result.data.retryAttempts).toBeGreaterThanOrEqual(0);
                    expect(result.data.retryAttempts).toBeLessThanOrEqual(10);
                    expect(result.data.responseTime).toBeGreaterThanOrEqual(-1);
                }
            }
        );

        test("should round-trip through parsing and serialization", () => {
            const [originalData] = fc.sample(baseMonitorArbitrary, 1);
            const parseResult = baseMonitorSchema.safeParse(originalData);

            expect(parseResult.success).toBeTruthy();

            if (parseResult.success) {
                const serialized = JSON.stringify(parseResult.data);
                const deserialized = JSON.parse(serialized);

                // Handle date fields that become strings after JSON serialization
                if (
                    deserialized.lastChecked &&
                    typeof deserialized.lastChecked === "string"
                ) {
                    deserialized.lastChecked = new Date(
                        deserialized.lastChecked
                    );
                }

                const reparseResult = baseMonitorSchema.safeParse(deserialized);

                expect(reparseResult.success).toBeTruthy();
                if (reparseResult.success) {
                    // Note: dates might be serialized as strings, so we need to handle that
                    expect(reparseResult.data).toMatchObject(
                        expect.objectContaining({
                            id: parseResult.data.id,
                            type: parseResult.data.type,
                            monitoring: parseResult.data.monitoring,
                        })
                    );
                }
            }
        });
    });

    describe("httpMonitorSchema", () => {
        test.prop([httpMonitorArbitrary])(
            "should validate HTTP monitor data with proper URL format",
            (httpMonitor) => {
                const result = httpMonitorSchema.safeParse(httpMonitor);
                expect(result.success).toBeTruthy();

                if (result.success) {
                    expect(result.data.type).toBe("http");
                    expect(result.data.url).toMatch(/^https?:\/\/.+/);
                    expect(result.data.url).toBeTypeOf("string");
                }
            }
        );

        test("should reject invalid URL formats", () => {
            const [validHttpMonitor] = fc.sample(httpMonitorArbitrary, 1);
            const invalidUrls = [
                "",
                "not-a-url",
                "ftp://example.com",
                "http://",
                "https://",
                "data:text/html,<script>alert(1)</script>",
                "file:///etc/passwd",
            ];

            for (const invalidUrl of invalidUrls) {
                const invalidMonitor = {
                    ...(validHttpMonitor as object),
                    url: invalidUrl,
                };
                const result = httpMonitorSchema.safeParse(invalidMonitor);
                expect(result.success).toBeFalsy();
            }
        });
    });

    describe("portMonitorSchema", () => {
        test.prop([portMonitorArbitrary])(
            "should validate port monitor data with valid ports and hosts",
            (portMonitor) => {
                const result = portMonitorSchema.safeParse(portMonitor);
                expect(result.success).toBeTruthy();

                if (result.success) {
                    expect(result.data.type).toBe("port");
                    expect(result.data.port).toBeGreaterThanOrEqual(1);
                    expect(result.data.port).toBeLessThanOrEqual(65_535);
                    expect(result.data.host).toBeTypeOf("string");
                    expect(result.data.host.length).toBeGreaterThan(0);
                }
            }
        );

        test("should reject invalid port numbers", () => {
            const [validPortMonitor] = fc.sample(portMonitorArbitrary, 1);
            const invalidPorts = [
                0,
                -1,
                65_536,
                999_999,
                Number.NaN,
                Number.POSITIVE_INFINITY,
            ];

            for (const invalidPort of invalidPorts) {
                const invalidMonitor = {
                    ...(validPortMonitor as object),
                    port: invalidPort,
                };
                const result = portMonitorSchema.safeParse(invalidMonitor);
                expect(result.success).toBeFalsy();
            }
        });
    });

    describe("pingMonitorSchema", () => {
        test.prop([pingMonitorArbitrary])(
            "should validate ping monitor data with valid hosts",
            (pingMonitor) => {
                const result = pingMonitorSchema.safeParse(pingMonitor);
                expect(result.success).toBeTruthy();

                if (result.success) {
                    expect(result.data.type).toBe("ping");
                    expect(result.data.host).toBeTypeOf("string");
                    expect(result.data.host.length).toBeGreaterThan(0);
                }
            }
        );
    });

    describe("dnsMonitorSchema", () => {
        test.prop([dnsMonitorArbitrary])(
            "should validate DNS monitor data with valid record types",
            (dnsMonitor) => {
                const result = dnsMonitorSchema.safeParse(dnsMonitor);
                expect(result.success).toBeTruthy();

                if (result.success) {
                    expect(result.data.type).toBe("dns");
                    expect(result.data.host).toBeTypeOf("string");
                    expect(result.data.recordType).toBeOneOf([
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
                        "TXT",
                    ]);
                }
            }
        );
    });

    describe("monitorSchema (discriminated union)", () => {
        test.prop([monitorArbitrary])(
            "should validate any monitor type through discriminated union",
            (monitor) => {
                const result = monitorSchema.safeParse(monitor);
                expect(result.success).toBeTruthy();

                if (result.success) {
                    expect([
                        "http",
                        "port",
                        "ping",
                        "dns",
                    ]).toContain(result.data.type);

                    // Type-specific validation
                    switch (result.data.type) {
                        case "http": {
                            expect(result.data).toHaveProperty("url");
                            break;
                        }
                        case "http-keyword": {
                            expect(result.data).toHaveProperty("url");
                            expect(result.data).toHaveProperty("bodyKeyword");
                            break;
                        }
                        case "http-status": {
                            expect(result.data).toHaveProperty("url");
                            expect(result.data).toHaveProperty(
                                "expectedStatusCode"
                            );
                            break;
                        }
                        case "port": {
                            expect(result.data).toHaveProperty("host");
                            expect(result.data).toHaveProperty("port");
                            break;
                        }
                        case "ping": {
                            expect(result.data).toHaveProperty("host");
                            expect(result.data).not.toHaveProperty("port");
                            break;
                        }
                        case "dns": {
                            expect(result.data).toHaveProperty("host");
                            expect(result.data).toHaveProperty("recordType");
                            break;
                        }
                        case "ssl": {
                            expect(result.data).toHaveProperty("host");
                            expect(result.data).toHaveProperty("port");
                            expect(result.data).toHaveProperty(
                                "certificateWarningDays"
                            );
                            break;
                        }
                        default: {
                            // This should never happen due to discriminated union, but TypeScript requires it
                            const exhaustiveCheck: never = result.data;
                            throw new Error(
                                `Unknown monitor type: ${(exhaustiveCheck as { type: string }).type}`
                            );
                        }
                    }
                }
            }
        );
    });

    describe("siteSchema", () => {
        test.prop([siteArbitrary])(
            "should validate site data with monitors array",
            (site) => {
                const result = siteSchema.safeParse(site);
                expect(result.success).toBeTruthy();

                if (result.success) {
                    expect(result.data.name).toBeTypeOf("string");
                    expect(result.data.name.length).toBeGreaterThan(0);
                    expect(result.data.name.length).toBeLessThanOrEqual(200);
                    expect(result.data.identifier).toBeTypeOf("string");
                    expect(result.data.identifier.length).toBeGreaterThan(0);
                    expect(result.data.identifier.length).toBeLessThanOrEqual(
                        100
                    );
                    expect(result.data.monitoring).toBeTypeOf("boolean");
                    expect(Array.isArray(result.data.monitors)).toBeTruthy();
                    expect(result.data.monitors.length).toBeGreaterThanOrEqual(
                        1
                    );

                    // Validate each monitor
                    for (const monitor of result.data.monitors) {
                        const monitorResult = monitorSchema.safeParse(monitor);
                        expect(monitorResult.success).toBeTruthy();
                    }
                }
            }
        );

        test("should reject sites with no monitors", () => {
            const [validSite] = fc.sample(siteArbitrary, 1);
            const siteWithoutMonitors = {
                ...(validSite as object),
                monitors: [],
            };

            const result = siteSchema.safeParse(siteWithoutMonitors);
            expect(result.success).toBeFalsy();
        });

        test("should reject sites with names that are too long", () => {
            const [validSite] = fc.sample(siteArbitrary, 1);
            const longName = "a".repeat(201);
            const siteWithLongName = {
                ...(validSite as object),
                name: longName,
            };

            const result = siteSchema.safeParse(siteWithLongName);
            expect(result.success).toBeFalsy();
        });
    });

    describe("Validation Functions", () => {
        describe(validateMonitorData, () => {
            test.prop([monitorArbitrary])(
                "should validate monitor data using validation function",
                (monitorData) => {
                    const result = validateMonitorData(
                        monitorData.type,
                        monitorData
                    );
                    expect(result.success).toBeTruthy();
                    if (result.success) {
                        expect(result.data).toBeDefined();
                        expect((result.data as { type: string }).type).toBe(
                            monitorData.type
                        );
                    }
                }
            );

            test("should handle invalid monitor types", () => {
                const [monitorData] = fc.sample(monitorArbitrary, 1);
                const invalidType = "invalid-type";

                const result = validateMonitorData(invalidType, monitorData);
                expect(result.success).toBeFalsy();
            });

            test.prop([
                fc.constantFrom(
                    "http",
                    "http-keyword",
                    "http-status",
                    "port",
                    "ping",
                    "dns",
                    "ssl"
                ),
            ])("should handle completely invalid data gracefully", (type) => {
                const invalidData = null;

                const result = validateMonitorData(type, invalidData);
                expect(result.success).toBeFalsy();
            });
        });

        describe(validateSiteData, () => {
            test.prop([siteArbitrary])(
                "should validate site data using validation function",
                (siteData) => {
                    const result = validateSiteData(siteData);
                    expect(result.success).toBeTruthy();
                    if (result.success) {
                        expect(result.data).toBeDefined();
                        expect(result.data).toMatchObject(siteData);
                    }
                }
            );
        });
    });
});
