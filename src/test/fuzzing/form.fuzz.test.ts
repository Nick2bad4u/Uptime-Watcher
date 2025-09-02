/**
 * Property-based fuzzing tests for form validation functions.
 *
 * @remarks
 * Tests the monitor validation functions and form data processing using
 * property-based testing with fast-check. Focuses on validating that form
 * validation handles malformed, unexpected, and edge-case input gracefully.
 *
 * Key areas tested:
 * - Monitor object creation robustness
 * - Form data type safety
 * - Input sanitization
 * - Error handling paths
 * - Edge case handling
 *
 * @packageDocumentation
 */

import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';

import { createMonitorObject } from '../../utils/monitorValidation';

// Define simple test types to avoid complex type issues
type SimpleMonitorType = 'http' | 'ping' | 'port' | 'dns';

describe('Form Validation Fuzzing Tests', () => {
    describe('Monitor Object Creation Fuzzing', () => {
        it('should handle any monitor type and form data without throwing', () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant('http' as SimpleMonitorType),
                        fc.constant('ping' as SimpleMonitorType),
                        fc.constant('port' as SimpleMonitorType),
                        fc.constant('dns' as SimpleMonitorType),
                        fc.string({ maxLength: 20 }) as fc.Arbitrary<SimpleMonitorType>
                    ),
                    fc.record({
                        url: fc.oneof(fc.webUrl(), fc.string(), fc.constant(undefined)),
                        host: fc.oneof(fc.domain(), fc.ipV4(), fc.string(), fc.constant(undefined)),
                        port: fc.oneof(
                            fc.integer({ min: 1, max: 65_535 }),
                            fc.string(),
                            fc.constant(undefined)
                        ),
                        interval: fc.oneof(
                            fc.integer({ min: 1, max: 3_600_000 }),
                            fc.string(),
                            fc.constant(undefined)
                        ),
                        timeout: fc.oneof(
                            fc.integer({ min: 1000, max: 60_000 }),
                            fc.string(),
                            fc.constant(undefined)
                        ),
                        retryAttempts: fc.oneof(
                            fc.integer({ min: 0, max: 10 }),
                            fc.string(),
                            fc.constant(undefined)
                        )
                    }),
                    (type: SimpleMonitorType, formData: unknown) => {
                        // Property: createMonitorObject should never throw

                        expect(() => createMonitorObject(type, formData)).not.toThrow();


                        const result = createMonitorObject(type, formData);

                        // Property: result should always have required fields
                        expect(result).toHaveProperty('type');
                        expect(result).toHaveProperty('monitoring');
                        expect(result).toHaveProperty('status');
                        expect(result).toHaveProperty('history');
                        expect(result).toHaveProperty('responseTime');
                        expect(result).toHaveProperty('retryAttempts');
                        expect(result).toHaveProperty('timeout');

                        // Property: type should match input
                        expect(result.type).toBe(type);

                        // Property: required fields should have correct default types
                        expect(typeof result.monitoring).toBe('boolean');
                        expect(typeof result.responseTime).toBe('number');
                        expect(Array.isArray(result.history)).toBe(true);
                        expect(typeof result.retryAttempts).toBe('number');
                        expect(typeof result.timeout).toBe('number');
                    }
                )
            );
        });

        it('should preserve valid numeric form data fields', () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant('http' as SimpleMonitorType),
                        fc.constant('ping' as SimpleMonitorType),
                        fc.constant('port' as SimpleMonitorType),
                        fc.constant('dns' as SimpleMonitorType)
                    ),
                    fc.record({
                        timeout: fc.integer({ min: 5000, max: 30_000 }),
                        retryAttempts: fc.integer({ min: 1, max: 5 })
                    }),
                    (type: SimpleMonitorType, formData: { timeout: number; retryAttempts: number }) => {

                        const result = createMonitorObject(type, formData);

                        // Property: valid numeric data should be preserved
                        expect(result.timeout).toBe(formData.timeout);
                        expect(result.retryAttempts).toBe(formData.retryAttempts);
                    }
                )
            );
        });

        it('should handle malformed and invalid field types gracefully', () => {
            fc.assert(
                fc.property(
                    fc.constant('http' as SimpleMonitorType),
                    fc.record({
                        url: fc.oneof(
                            fc.anything(),
                            fc.constant(null),
                            fc.constant(undefined),
                            fc.object()
                        ),
                        host: fc.oneof(
                            fc.anything(),
                            fc.constant(null),
                            fc.constant(undefined),
                            fc.array(fc.string())
                        ),
                        port: fc.oneof(
                            fc.anything(),
                            fc.constant('not-a-number'),
                            fc.constant(-1),
                            fc.constant(70_000),
                            fc.float()
                        ),
                        timeout: fc.oneof(
                            fc.anything(),
                            fc.constant('timeout'),
                            fc.array(fc.integer())
                        ),
                        retryAttempts: fc.oneof(
                            fc.anything(),
                            fc.string(),
                            fc.constant(-5),
                            fc.constant(100)
                        )
                    }),
                    (type: SimpleMonitorType, formData: unknown) => {
                        // Property: should handle invalid data gracefully

                        expect(() => createMonitorObject(type, formData)).not.toThrow();


                        const result = createMonitorObject(type, formData);

                        // Property: should maintain required fields even with invalid input
                        expect(result.type).toBe(type);
                        expect(typeof result.monitoring).toBe('boolean');
                        expect(typeof result.responseTime).toBe('number');
                        expect(Array.isArray(result.history)).toBe(true);
                    }
                )
            );
        });

        it('should handle deeply nested and complex form data', () => {
            fc.assert(
                fc.property(
                    fc.constant('http' as SimpleMonitorType),
                    fc.object({ maxDepth: 5 }),
                    (type: SimpleMonitorType, complexData: object) => {
                        // Property: should handle complex nested data without crashing

                        expect(() => createMonitorObject(type, complexData)).not.toThrow();


                        const result = createMonitorObject(type, complexData);

                        // Property: core fields should still be valid
                        expect(result.type).toBe(type);
                        expect(typeof result.monitoring).toBe('boolean');
                    }
                )
            );
        });

        it('should handle extreme numeric values', () => {
            fc.assert(
                fc.property(
                    fc.constant('port' as SimpleMonitorType),
                    fc.record({
                        port: fc.oneof(
                            fc.constant(Number.MAX_SAFE_INTEGER),
                            fc.constant(Number.MIN_SAFE_INTEGER),
                            fc.constant(Number.POSITIVE_INFINITY),
                            fc.constant(Number.NEGATIVE_INFINITY),
                            fc.constant(Number.NaN),
                            fc.constant(0),
                            fc.float({ min: -1e10, max: 1e10 })
                        ),
                        timeout: fc.oneof(
                            fc.constant(Number.MAX_SAFE_INTEGER),
                            fc.constant(0),
                            fc.constant(-1000),
                            fc.float({ min: -1e6, max: 1e6 })
                        ),
                        retryAttempts: fc.oneof(
                            fc.constant(Number.MAX_SAFE_INTEGER),
                            fc.constant(-100),
                            fc.float()
                        )
                    }),
                    (type: SimpleMonitorType, extremeData: unknown) => {

                        expect(() => createMonitorObject(type, extremeData)).not.toThrow();


                        const result = createMonitorObject(type, extremeData);

                        // Property: should handle extreme values gracefully
                        expect(result.type).toBe(type);
                        expect(typeof result.monitoring).toBe('boolean');
                    }
                )
            );
        });

        it('should handle Unicode and special characters in string fields', () => {
            fc.assert(
                fc.property(
                    fc.constant('http' as SimpleMonitorType),
                    fc.record({
                        url: fc.oneof(
                            fc.string({ maxLength: 200 }),
                            fc.constant('https://üñíçødé.example.com/påth?ñámé=vålúé'),
                            fc.constant('https://🌟.example.com/🚀'),
                            fc.constant('https://例え.テスト'),
                            fc.constant('')
                        ),
                        host: fc.oneof(
                            fc.string({ maxLength: 100 }),
                            fc.constant('üñíçødé.example.com'),
                            fc.constant('localhost'),
                            fc.constant('')
                        )
                    }),
                    (type: SimpleMonitorType, unicodeData: { url: string; host: string }) => {

                        expect(() => createMonitorObject(type, unicodeData)).not.toThrow();


                        const result = createMonitorObject(type, unicodeData);

                        // Property: Unicode strings should be preserved
                        expect(result.url).toBe(unicodeData.url);
                        expect(result.host).toBe(unicodeData.host);
                    }
                )
            );
        });

        it('should handle prototype pollution attempts', () => {
            fc.assert(
                fc.property(
                    fc.constant('http' as SimpleMonitorType),
                    (type: SimpleMonitorType) => {
                        const maliciousData = {
                            '__proto__': { malicious: true },
                            'constructor': { prototype: { hacked: true } },
                            'toString': () => 'malicious',
                            'valueOf': () => ({ evil: true }),
                            'url': 'https://example.com',
                            'host': 'example.com'
                        };


                        expect(() => createMonitorObject(type, maliciousData)).not.toThrow();


                        const result = createMonitorObject(type, maliciousData);

                        // Property: should preserve legitimate fields
                        expect(result.url).toBe('https://example.com');
                        expect(result.host).toBe('example.com');
                        expect(result.type).toBe(type);

                        // Property: malicious prototype properties should not affect core functionality
                        expect(typeof result.monitoring).toBe('boolean');
                        expect(Array.isArray(result.history)).toBe(true);
                    }
                )
            );
        });
    });

    describe('Form Field Validation Edge Cases', () => {
        it('should handle empty and whitespace-only inputs', () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant(''),
                        fc.constant('   '),
                        fc.constant(String.raw`\t\n\r`),
                        fc.string({ maxLength: 50 }).filter(s => s.trim() === '')
                    ),
                    (emptyInput: string) => {
                        const formData = {
                            url: emptyInput,
                            host: emptyInput
                        };


                        expect(() => createMonitorObject('http', formData)).not.toThrow();


                        const result = createMonitorObject('http', formData);
                        expect(result.url).toBe(emptyInput);
                        expect(result.host).toBe(emptyInput);
                    }
                )
            );
        });

        it('should handle very long input strings', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1000, maxLength: 10_000 }),
                    fc.string({ minLength: 500, maxLength: 5000 }),
                    (longUrl: string, longHost: string) => {
                        const formData = {
                            url: `https://${longUrl}.com`,
                            host: longHost
                        };


                        expect(() => createMonitorObject('http', formData)).not.toThrow();


                        const result = createMonitorObject('http', formData);
                        expect(result.url).toBe(formData.url);
                        expect(result.host).toBe(formData.host);
                    }
                )
            );
        });

        it('should handle boundary values for numeric fields', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        port: fc.oneof(
                            fc.constant(1),
                            fc.constant(65_535),
                            fc.constant(0),
                            fc.constant(65_536),
                            fc.constant(-1)
                        ),
                        timeout: fc.oneof(
                            fc.constant(1),
                            fc.constant(1000),
                            fc.constant(60_000),
                            fc.constant(0),
                            fc.constant(-1)
                        ),
                        retryAttempts: fc.oneof(
                            fc.constant(0),
                            fc.constant(1),
                            fc.constant(10),
                            fc.constant(-1),
                            fc.constant(100)
                        )
                    }),
                    (boundaryData: { port: number; timeout: number; retryAttempts: number }) => {

                        expect(() => createMonitorObject('port', boundaryData)).not.toThrow();


                        const result = createMonitorObject('port', boundaryData);

                        // Property: boundary values should be preserved
                        for (const [key, value] of Object.entries(boundaryData)) {
                            if (value !== undefined && typeof value === 'number') {
                                expect(result[key as keyof typeof result]).toBe(value);
                            }
                        }
                    }
                )
            );
        });

        it('should handle mixed type inputs for numeric fields', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        port: fc.oneof(
                            fc.integer({ min: 1, max: 65_535 }),
                            fc.integer({ min: 1, max: 65_535 }).map(String),
                            fc.constant('invalid'),
                            fc.constant(null),
                            fc.constant(undefined),
                            fc.boolean(),
                            fc.array(fc.integer())
                        ),
                        timeout: fc.oneof(
                            fc.integer({ min: 1000, max: 60_000 }),
                            fc.integer({ min: 1000, max: 60_000 }).map(String),
                            fc.constant('timeout-value'),
                            fc.object()
                        ),
                        retryAttempts: fc.oneof(
                            fc.integer({ min: 0, max: 10 }),
                            fc.integer({ min: 0, max: 10 }).map(String),
                            fc.constant('retry'),
                            fc.float()
                        )
                    }),
                    (mixedData: unknown) => {

                        expect(() => createMonitorObject('port', mixedData)).not.toThrow();


                        const result = createMonitorObject('port', mixedData);

                        // Property: should handle mixed types gracefully
                        expect(result.type).toBe('port');
                        expect(typeof result.monitoring).toBe('boolean');

                        // Property: numeric fields should always be numbers (valid input or defaults)
                        expect(typeof result.timeout).toBe('number');
                        expect(typeof result.retryAttempts).toBe('number');

                        // Property: valid numeric values should be preserved
                        if (typeof mixedData === 'object' && mixedData !== null) {
                            const data = mixedData as Record<string, unknown>;

                            // Check timeout field handling
                            if (typeof data.timeout === 'number' && Number.isFinite(data.timeout)) {
                                expect(result.timeout).toBe(data.timeout);
                            } else if (typeof data.timeout === 'string' && data.timeout.trim() !== '') {
                                const parsed = Number(data.timeout);
                                if (Number.isFinite(parsed)) {
                                    expect(result.timeout).toBe(parsed);
                                } else {
                                    expect(result.timeout).toBe(10_000); // Default value
                                }
                            } else {
                                expect(result.timeout).toBe(10_000); // Default value for invalid/undefined
                            }

                            // Check retryAttempts field handling
                            if (typeof data.retryAttempts === 'number' && Number.isFinite(data.retryAttempts)) {
                                expect(result.retryAttempts).toBe(data.retryAttempts);
                            } else if (typeof data.retryAttempts === 'string' && data.retryAttempts.trim() !== '') {
                                const parsed = Number(data.retryAttempts);
                                if (Number.isFinite(parsed)) {
                                    expect(result.retryAttempts).toBe(parsed);
                                } else {
                                    expect(result.retryAttempts).toBe(3); // Default value
                                }
                            } else {
                                expect(result.retryAttempts).toBe(3); // Default value for invalid/undefined
                            }

                            // Check port field handling (non-numeric field)
                            if (data.port !== undefined) {
                                expect(result.port).toBe(data.port);
                            }
                        }
                    }
                )
            );
        });
    });
});
