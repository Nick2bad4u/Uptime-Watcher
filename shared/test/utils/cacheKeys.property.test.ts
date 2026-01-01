/**
 * Property-based tests for cache key generation utilities using fast-check.
 *
 * @remarks
 * These tests use property-based testing to verify cache key generation
 * behavior across a wide range of inputs, ensuring robustness and consistency.
 */

import { describe, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { CacheKeys } from "../../utils/cacheKeys";

describe("CacheKeys - Property-Based Tests", () => {
    describe("Site cache keys", () => {
        test.prop({
            identifier: fc.string({ minLength: 1, maxLength: 50 }),
        })(
            "should generate consistent site keys for any valid identifier",
            (props) => {
                const key = CacheKeys.site.byIdentifier(props.identifier);

                // Should always start with site prefix
                expect(key).toMatch(/^site:/);

                // Should contain the identifier
                expect(key).toContain(props.identifier);

                // Should follow the expected pattern
                expect(key).toBe(`site:${props.identifier}`);
            }
        );

        test.prop({
            identifier: fc.string({ minLength: 1, maxLength: 50 }),
        })("should be idempotent for same identifier", (props) => {
            const key1 = CacheKeys.site.byIdentifier(props.identifier);
            const key2 = CacheKeys.site.byIdentifier(props.identifier);

            expect(key1).toBe(key2);
        });
    });

    describe("Monitor cache keys", () => {
        test.prop({
            monitorId: fc.string({ minLength: 1, maxLength: 50 }),
        })(
            "should generate consistent monitor keys for any valid id",
            (props) => {
                const key = CacheKeys.monitor.byId(props.monitorId);

                // Should always start with monitor prefix
                expect(key).toMatch(/^monitor:/);

                // Should contain the monitor id
                expect(key).toContain(props.monitorId);

                // Should follow the expected pattern
                expect(key).toBe(`monitor:${props.monitorId}`);
            }
        );

        test.prop({
            siteIdentifier: fc.string({ minLength: 1, maxLength: 50 }),
        })("should generate site-scoped monitor keys", (props) => {
            const key = CacheKeys.monitor.bySite(props.siteIdentifier);

            // Should start with monitor prefix
            expect(key).toMatch(/^monitor:site:/);

            // Should contain the site id
            expect(key).toContain(props.siteIdentifier);

            // Should follow the expected pattern
            expect(key).toBe(`monitor:site:${props.siteIdentifier}`);
        });
    });

    describe("Config cache keys", () => {
        test.prop({
            configName: fc
                .string({ minLength: 1, maxLength: 30 })
                .filter((s) => !s.includes(":")),
        })(
            "should generate config keys without separator conflicts",
            (props) => {
                const key = CacheKeys.config.byName(props.configName);

                // Should start with config prefix
                expect(key).toMatch(/^config:/);

                // Should contain the config name
                expect(key).toContain(props.configName);

                // Should have exactly one separator (between prefix and name)
                const separatorCount = (key.match(/:/g) ?? []).length;
                expect(separatorCount).toBe(1);
            }
        );
    });

    describe("Validation cache keys", () => {
        test.prop({
            validationType: fc.constantFrom("site", "monitor", "general"),
            identifier: fc.string({ minLength: 1, maxLength: 40 }),
        })("should generate validation keys for different types", (props) => {
            const key = CacheKeys.validation.byType(
                props.validationType,
                props.identifier
            );

            // Should start with validation prefix
            expect(key).toMatch(/^validation:/);

            // Should contain both the type and identifier
            expect(key).toContain(props.validationType);
            expect(key).toContain(props.identifier);

            // Should follow the expected pattern
            expect(key).toBe(
                `validation:${props.validationType}:${props.identifier}`
            );
        });
    });

    describe("Key uniqueness properties", () => {
        test.prop({
            domain: fc.constantFrom("site", "monitor", "config"),
            identifier1: fc.string({ minLength: 1, maxLength: 30 }),
            identifier2: fc.string({ minLength: 1, maxLength: 30 }),
        })(
            "should generate unique keys for different identifiers in same domain",
            (props) => {
                // Skip test if identifiers are the same
                fc.pre(props.identifier1 !== props.identifier2);

                const [key1, key2] = (() => {
                    switch (props.domain) {
                        case "site": {
                            return [
                                CacheKeys.site.byIdentifier(props.identifier1),
                                CacheKeys.site.byIdentifier(props.identifier2),
                            ];
                        }
                        case "monitor": {
                            return [
                                CacheKeys.monitor.byId(props.identifier1),
                                CacheKeys.monitor.byId(props.identifier2),
                            ];
                        }
                        case "config": {
                            return [
                                CacheKeys.config.byName(props.identifier1),
                                CacheKeys.config.byName(props.identifier2),
                            ];
                        }
                        default: {
                            throw new Error(`Unknown domain: ${props.domain}`);
                        }
                    }
                })();

                expect(key1).not.toBe(key2);
            }
        );

        test.prop({
            identifier: fc.string({ minLength: 1, maxLength: 30 }),
        })(
            "should generate different keys across domains for same identifier",
            (props) => {
                const siteKey = CacheKeys.site.byIdentifier(props.identifier);
                const monitorKey = CacheKeys.monitor.byId(props.identifier);
                const configKey = CacheKeys.config.byName(props.identifier);

                // All keys should be different despite same identifier
                expect(siteKey).not.toBe(monitorKey);
                expect(siteKey).not.toBe(configKey);
                expect(monitorKey).not.toBe(configKey);

                // Each should have its proper prefix
                expect(siteKey).toMatch(/^site:/);
                expect(monitorKey).toMatch(/^monitor:/);
                expect(configKey).toMatch(/^config:/);
            }
        );
    });

    describe("Special character handling", () => {
        test.prop({
            identifier: fc.string({ minLength: 1, maxLength: 20 }).map(
                (s) => s.replaceAll(/[^\w-_.]/g, "_") // Replace special chars with underscores
            ),
        })("should handle sanitized identifiers safely", (props) => {
            const siteKey = CacheKeys.site.byIdentifier(props.identifier);
            const monitorKey = CacheKeys.monitor.byId(props.identifier);

            // Keys should be well-formed strings
            expect(typeof siteKey).toBe("string");
            expect(typeof monitorKey).toBe("string");
            expect(siteKey.length).toBeGreaterThan(0);
            expect(monitorKey.length).toBeGreaterThan(0);

            // Should maintain the expected structure
            expect(siteKey).toBe(`site:${props.identifier}`);
            expect(monitorKey).toBe(`monitor:${props.identifier}`);
        });
    });
});
