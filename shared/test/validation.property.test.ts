/**
 * Property-based tests for validation utilities using fast-check
 *
 * @packageDocumentation
 */

import { test, fc } from '@fast-check/vitest';
import { expect } from 'vitest';

import {
    isNonEmptyString,
    isValidFQDN,
    isValidIdentifier,
    isValidIdentifierArray,
    isValidInteger,
    isValidNumeric,
    isValidHost,
    isValidPort,
    isValidUrl,
    safeInteger,
} from '../validation/validatorUtils';

describe('Validation Utils Property-Based Tests', () => {
    describe('isNonEmptyString', () => {
        test.prop([fc.string({ minLength: 1 })])(
            'should accept non-empty strings',
            (str) => {
                // Filter out strings that are just whitespace
                if (str.trim().length > 0) {
                    expect(isNonEmptyString(str)).toBe(true);
                }
            }
        );

        test.prop([fc.constantFrom('', '   ', '\t', '\n', '\r\n')])(
            'should reject empty or whitespace-only strings',
            (emptyStr) => {
                expect(isNonEmptyString(emptyStr)).toBe(false);
            }
        );

        test.prop([fc.constantFrom(null, undefined, 123, {}, [])])(
            'should reject non-string values',
            (nonString) => {
                expect(isNonEmptyString(nonString)).toBe(false);
            }
        );
    });

    describe('isValidFQDN', () => {
        test.prop([fc.domain()])(
            'should accept valid domain names',
            (domain) => {
                expect(isValidFQDN(domain)).toBe(true);
            }
        );

        test.prop([fc.constantFrom(
            'localhost',
            'invalid..domain.com',
            'domain_with_underscores.com',
            'domain-ending-with-dash-.com',
            '-domain-starting-with-dash.com'
        )])(
            'should reject invalid FQDNs',
            (invalidFqdn) => {
                expect(isValidFQDN(invalidFqdn)).toBe(false);
            }
        );

        test.prop([fc.constantFrom(123, null, undefined, {})])(
            'should reject non-string values',
            (nonString) => {
                expect(isValidFQDN(nonString)).toBe(false);
            }
        );
    });

    describe('isValidIdentifier', () => {
        test.prop([
            // Generate identifiers that must have at least one alphanumeric character
            fc.string({ minLength: 1 })
                .filter(s => /^[\dA-Za-z]+(?:[_-]*[\dA-Za-z]+)*$/.test(s))
        ])(
            'should accept valid identifiers (alphanumeric with underscores and hyphens)',
            (identifier) => {
                expect(isValidIdentifier(identifier)).toBe(true);
            }
        );

        test.prop([fc.constantFrom(
            '',
            'identifier with spaces',
            'identifier@with.symbols',
            'identifier/with/slashes',
            'identifier.with.dots'
        )])(
            'should reject invalid identifiers',
            (invalidIdentifier) => {
                expect(isValidIdentifier(invalidIdentifier)).toBe(false);
            }
        );
    });

    describe('isValidIdentifierArray', () => {
        test.prop([fc.array(
            // Generate identifiers that must have at least one alphanumeric character
            fc.string({ minLength: 1 })
                .filter(s => /^[\dA-Za-z]+(?:[_-]*[\dA-Za-z]+)*$/.test(s)),
            { minLength: 1 }
        )])(
            'should accept arrays of valid identifiers',
            (identifiers) => {
                expect(isValidIdentifierArray(identifiers)).toBe(true);
            }
        );

        test.prop([fc.array(fc.constantFrom('', 'invalid identifier', 'id@symbol'))])(
            'should reject arrays containing invalid identifiers',
            (invalidIdentifiers) => {
                if (invalidIdentifiers.length > 0) {
                    expect(isValidIdentifierArray(invalidIdentifiers)).toBe(false);
                }
            }
        );

        test.prop([fc.constantFrom(null, undefined, 'not-an-array', 123)])(
            'should reject non-array values',
            (nonArray) => {
                expect(isValidIdentifierArray(nonArray)).toBe(false);
            }
        );
    });

    describe('isValidInteger', () => {
        test.prop([fc.integer().map(String)])(
            'should accept valid integer strings',
            (intStr) => {
                expect(isValidInteger(intStr)).toBe(true);
            }
        );

        test.prop([fc.constantFrom('123.45', 'abc', '', 'NaN', 'Infinity')])(
            'should reject invalid integer strings',
            (invalidInt) => {
                expect(isValidInteger(invalidInt)).toBe(false);
            }
        );

        test('should respect bounds when provided', () => {
            expect(isValidInteger('5', { min: 1, max: 10 })).toBe(true);
            expect(isValidInteger('15', { min: 1, max: 10 })).toBe(false);
            expect(isValidInteger('-5', { min: 1, max: 10 })).toBe(false);
        });
    });

    describe('isValidNumeric', () => {
        test.prop([fc.float().map(String)])(
            'should accept valid numeric strings',
            (numStr) => {
                // Filter out NaN and Infinity which are not valid for validator
                if (!numStr.includes('NaN') && !numStr.includes('Infinity')) {
                    expect(isValidNumeric(numStr)).toBe(true);
                }
            }
        );

        test.prop([fc.constantFrom('abc', '', 'not-a-number')])(
            'should reject invalid numeric strings',
            (invalidNum) => {
                expect(isValidNumeric(invalidNum)).toBe(false);
            }
        );
    });

    describe('isValidHost', () => {
        test.prop([fc.ipV4()])(
            'should accept valid IPv4 addresses',
            (ipv4) => {
                expect(isValidHost(ipv4)).toBe(true);
            }
        );

        test.prop([fc.ipV6()])(
            'should accept valid IPv6 addresses',
            (ipv6) => {
                expect(isValidHost(ipv6)).toBe(true);
            }
        );

        test.prop([fc.domain()])(
            'should accept valid domain names',
            (domain) => {
                expect(isValidHost(domain)).toBe(true);
            }
        );

        test('should accept localhost as a special case', () => {
            expect(isValidHost('localhost')).toBe(true);
        });

        test.prop([fc.constantFrom(
            'invalid..host.com',
            'host with spaces',
            '',
            '256.1.1.1',
            'host_with_underscores.com'
        )])(
            'should reject invalid hosts',
            (invalidHost) => {
                expect(isValidHost(invalidHost)).toBe(false);
            }
        );
    });

    describe('isValidPort', () => {
        test.prop([fc.integer({ min: 1, max: 65_535 })])(
            'should accept valid port numbers',
            (port) => {
                expect(isValidPort(port)).toBe(true);
                expect(isValidPort(String(port))).toBe(true);
            }
        );

        test.prop([fc.constantFrom(0, -1, 65_536, 999_999)])(
            'should reject invalid port numbers',
            (invalidPort) => {
                expect(isValidPort(invalidPort)).toBe(false);
                expect(isValidPort(String(invalidPort))).toBe(false);
            }
        );

        test('should reject port 0 as it is reserved', () => {
            expect(isValidPort(0)).toBe(false);
            expect(isValidPort('0')).toBe(false);
        });

        test.prop([fc.constantFrom(null, undefined, 'abc', {})])(
            'should reject non-numeric values',
            (nonNumeric) => {
                expect(isValidPort(nonNumeric)).toBe(false);
            }
        );
    });

    describe('isValidUrl', () => {
        test.prop([fc.webUrl()])(
            'should accept valid web URLs',
            (url) => {
                expect(isValidUrl(url)).toBe(true);
            }
        );

        test('should accept localhost URLs', () => {
            expect(isValidUrl('http://localhost')).toBe(true);
            expect(isValidUrl('http://localhost:3000')).toBe(true);
        });

        test.prop([fc.constantFrom(
            'not-a-url',
            '',
            'ftp://example.com',
            'file:///etc/passwd'
        )])(
            'should reject invalid URLs',
            (invalidUrl) => {
                expect(isValidUrl(invalidUrl)).toBe(false);
            }
        );

        test.prop([fc.constantFrom(123, null, undefined, {})])(
            'should reject non-string values',
            (nonString) => {
                expect(isValidUrl(nonString)).toBe(false);
            }
        );
    });

    describe('safeInteger', () => {
        test.prop([fc.integer(), fc.integer(), fc.integer(), fc.integer()])(
            'should convert valid integers correctly',
            (value, defaultValue, min, max) => {
                const result = safeInteger(String(value), defaultValue, min, max);
                expect(typeof result).toBe('number');
                expect(Number.isInteger(result)).toBe(true);

                if (min !== undefined && max !== undefined && min <= max) {
                    expect(result).toBeGreaterThanOrEqual(Math.min(min, max));
                    expect(result).toBeLessThanOrEqual(Math.max(min, max));
                }
            }
        );

        test.prop([fc.constantFrom('abc', 'not-a-number', ''), fc.integer()])(
            'should return default value for invalid inputs',
            (invalidValue, defaultValue) => {
                const result = safeInteger(invalidValue, defaultValue);
                expect(result).toBe(defaultValue);
            }
        );

        test('should clamp values to bounds', () => {
            expect(safeInteger('150', 0, 1, 100)).toBe(100);
            expect(safeInteger('-10', 0, 1, 100)).toBe(1);
            expect(safeInteger('50', 0, 1, 100)).toBe(50);
        });

        test.prop([fc.anything(), fc.integer()])(
            'should handle any input type gracefully',
            (anyValue, defaultValue) => {
                const result = safeInteger(anyValue, defaultValue);
                expect(typeof result).toBe('number');
                expect(Number.isInteger(result)).toBe(true);
            }
        );
    });

    describe('Integration Tests', () => {
        test.prop([
            fc.record({
                identifier: fc.stringMatching(/^[\w-]+$/).filter(s => {
                    // Must contain at least one alphanumeric character
                    const cleanedValue = s.replaceAll(/[_-]/g, "");
                    return cleanedValue.length > 0;
                }),
                port: fc.integer({ min: 1, max: 65_535 }),
                host: fc.oneof(fc.domain(), fc.ipV4(), fc.constant('localhost')),
                url: fc.webUrl()
            })
        ])(
            'should validate complex objects consistently',
            (data) => {
                expect(isValidIdentifier(data.identifier)).toBe(true);
                expect(isValidPort(data.port)).toBe(true);
                expect(isValidHost(data.host)).toBe(true);
                expect(isValidUrl(data.url)).toBe(true);
            }
        );

        test('should maintain validation consistency across multiple calls', ({ g }) => {
            const testData = g(() => fc.record({
                identifier: fc.stringMatching(/^[\w-]{1,20}$/),
                port: fc.integer({ min: 1, max: 65_535 }),
                host: fc.domain(),
                url: fc.webUrl()
            }));

            // Validate multiple times
            const results = Array.from({ length: 5 }, () => ({
                identifier: isValidIdentifier(testData.identifier),
                port: isValidPort(testData.port),
                host: isValidHost(testData.host),
                url: isValidUrl(testData.url)
            }));

            // All results should be identical
            const [firstResult] = results;
            expect(firstResult).toBeDefined();

            for (let i = 1; i < results.length; i++) {
                const currentResult = results[i];
                expect(currentResult).toBeDefined();
                expect(currentResult!.identifier).toBe(firstResult!.identifier);
                expect(currentResult!.port).toBe(firstResult!.port);
                expect(currentResult!.host).toBe(firstResult!.host);
                expect(currentResult!.url).toBe(firstResult!.url);
            }
        });

        test.prop([fc.array(fc.stringMatching(/^[\w-]{1,10}$/))])(
            'should handle batch validation correctly',
            (identifiers) => {
                const arrayResult = isValidIdentifierArray(identifiers);
                const individualResults = identifiers.map(id => isValidIdentifier(id));

                expect(arrayResult).toBe(individualResults.every(Boolean));
            }
        );
    });
});
