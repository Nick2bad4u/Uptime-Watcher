/**
 * Complete Function Coverage Tests for validatorUtils.ts
 * This test file ensures 100% function coverage using the Function Coverage Validation pattern.
 * It systematically calls every exported function to guarantee coverage.
 * Generated for 100% test coverage initiative.
 */

import { describe, expect, it } from 'vitest';
import * as validatorUtilsModule from '../../validation/validatorUtils';

describe('ValidatorUtils - Complete Function Coverage', () => {
    describe('Function Coverage Validation', () => {
        it('should call every exported function for complete coverage', () => {
            // Test isNonEmptyString function coverage
            expect(typeof validatorUtilsModule.isNonEmptyString).toBe('function');
            expect(validatorUtilsModule.isNonEmptyString('hello')).toBe(true);
            expect(validatorUtilsModule.isNonEmptyString('')).toBe(false);
            expect(validatorUtilsModule.isNonEmptyString('   ')).toBe(false); // Whitespace only
            expect(validatorUtilsModule.isNonEmptyString(null)).toBe(false);
            expect(validatorUtilsModule.isNonEmptyString(undefined)).toBe(false);
            expect(validatorUtilsModule.isNonEmptyString(123)).toBe(false);

            // Test isValidFQDN function coverage
            expect(typeof validatorUtilsModule.isValidFQDN).toBe('function');
            expect(validatorUtilsModule.isValidFQDN('example.com')).toBe(true);
            expect(validatorUtilsModule.isValidFQDN('sub.example.com')).toBe(true);
            expect(validatorUtilsModule.isValidFQDN('localhost')).toBe(false); // No TLD by default
            expect(validatorUtilsModule.isValidFQDN('invalid..domain')).toBe(false);
            expect(validatorUtilsModule.isValidFQDN(123)).toBe(false);
            expect(validatorUtilsModule.isValidFQDN(null)).toBe(false);
            // Test with options
            expect(validatorUtilsModule.isValidFQDN('localhost', { require_tld: false })).toBe(true);

            // Test isValidIdentifier function coverage
            expect(typeof validatorUtilsModule.isValidIdentifier).toBe('function');
            expect(validatorUtilsModule.isValidIdentifier('abc123')).toBe(true);
            expect(validatorUtilsModule.isValidIdentifier('abc-123_def')).toBe(true);
            expect(validatorUtilsModule.isValidIdentifier('valid_identifier')).toBe(true);
            expect(validatorUtilsModule.isValidIdentifier('abc@123')).toBe(false);
            expect(validatorUtilsModule.isValidIdentifier('')).toBe(false);
            expect(validatorUtilsModule.isValidIdentifier('   ')).toBe(false); // Whitespace only
            expect(validatorUtilsModule.isValidIdentifier(null)).toBe(false);
            expect(validatorUtilsModule.isValidIdentifier(123)).toBe(false);

            // Test isValidIdentifierArray function coverage
            expect(typeof validatorUtilsModule.isValidIdentifierArray).toBe('function');
            expect(validatorUtilsModule.isValidIdentifierArray(['abc', 'def-123'])).toBe(true);
            expect(validatorUtilsModule.isValidIdentifierArray(['valid_id'])).toBe(true);
            expect(validatorUtilsModule.isValidIdentifierArray([])).toBe(true); // Empty array is valid
            expect(validatorUtilsModule.isValidIdentifierArray(['abc', 123])).toBe(false);
            expect(validatorUtilsModule.isValidIdentifierArray(['abc', ''])).toBe(false);
            expect(validatorUtilsModule.isValidIdentifierArray(['abc', 'invalid@id'])).toBe(false);
            expect(validatorUtilsModule.isValidIdentifierArray('not-array')).toBe(false);
            expect(validatorUtilsModule.isValidIdentifierArray(null)).toBe(false);

            // Test isValidInteger function coverage
            expect(typeof validatorUtilsModule.isValidInteger).toBe('function');
            expect(validatorUtilsModule.isValidInteger('123')).toBe(true);
            expect(validatorUtilsModule.isValidInteger('-456')).toBe(true);
            expect(validatorUtilsModule.isValidInteger('0')).toBe(true);
            expect(validatorUtilsModule.isValidInteger('123.45')).toBe(false);
            expect(validatorUtilsModule.isValidInteger('abc')).toBe(false);
            expect(validatorUtilsModule.isValidInteger('')).toBe(false);
            expect(validatorUtilsModule.isValidInteger(123)).toBe(false); // Number not string
            expect(validatorUtilsModule.isValidInteger(null)).toBe(false);
            // Test with options
            expect(validatorUtilsModule.isValidInteger('123', { min: 100, max: 200 })).toBe(true);
            expect(validatorUtilsModule.isValidInteger('50', { min: 100, max: 200 })).toBe(false);

            // Test isValidNumeric function coverage
            expect(typeof validatorUtilsModule.isValidNumeric).toBe('function');
            expect(validatorUtilsModule.isValidNumeric('123.45')).toBe(true);
            expect(validatorUtilsModule.isValidNumeric('123')).toBe(true);
            expect(validatorUtilsModule.isValidNumeric('-456.78')).toBe(true);
            expect(validatorUtilsModule.isValidNumeric('0')).toBe(true);
            expect(validatorUtilsModule.isValidNumeric('abc')).toBe(false);
            expect(validatorUtilsModule.isValidNumeric('')).toBe(false);
            expect(validatorUtilsModule.isValidNumeric(123.45)).toBe(false); // Number not string
            expect(validatorUtilsModule.isValidNumeric(null)).toBe(false);
            // Test with options
            expect(validatorUtilsModule.isValidNumeric('50.5', { min: 10, max: 100 })).toBe(true);
            expect(validatorUtilsModule.isValidNumeric('5.5', { min: 10, max: 100 })).toBe(false);

            // Test isValidHost function coverage
            expect(typeof validatorUtilsModule.isValidHost).toBe('function');
            expect(validatorUtilsModule.isValidHost('192.168.1.1')).toBe(true); // IP address
            expect(validatorUtilsModule.isValidHost('example.com')).toBe(true); // FQDN
            expect(validatorUtilsModule.isValidHost('localhost')).toBe(true); // Special case
            expect(validatorUtilsModule.isValidHost('sub.example.com')).toBe(true);
            expect(validatorUtilsModule.isValidHost('invalid..host')).toBe(false);
            expect(validatorUtilsModule.isValidHost('no-tld')).toBe(false);
            expect(validatorUtilsModule.isValidHost('')).toBe(false);
            expect(validatorUtilsModule.isValidHost(123)).toBe(false);
            expect(validatorUtilsModule.isValidHost(null)).toBe(false);

            // Test isValidPort function coverage
            expect(typeof validatorUtilsModule.isValidPort).toBe('function');
            expect(validatorUtilsModule.isValidPort(80)).toBe(true); // Number
            expect(validatorUtilsModule.isValidPort('443')).toBe(true); // String
            expect(validatorUtilsModule.isValidPort('8080')).toBe(true);
            expect(validatorUtilsModule.isValidPort(65535)).toBe(true); // Max valid port
            expect(validatorUtilsModule.isValidPort(1)).toBe(true); // Min valid port
            expect(validatorUtilsModule.isValidPort(0)).toBe(false); // Reserved port
            expect(validatorUtilsModule.isValidPort('0')).toBe(false); // Reserved port string
            expect(validatorUtilsModule.isValidPort(70000)).toBe(false); // Too high
            expect(validatorUtilsModule.isValidPort('abc')).toBe(false);
            expect(validatorUtilsModule.isValidPort(null)).toBe(false);
            expect(validatorUtilsModule.isValidPort(undefined)).toBe(false);

            // Test isValidUrl function coverage
            expect(typeof validatorUtilsModule.isValidUrl).toBe('function');
            expect(validatorUtilsModule.isValidUrl('https://example.com')).toBe(true);
            expect(validatorUtilsModule.isValidUrl('http://localhost:3000')).toBe(true);
            expect(validatorUtilsModule.isValidUrl('https://sub.example.com/path')).toBe(true);
            expect(validatorUtilsModule.isValidUrl('ftp://example.com')).toBe(true);
            expect(validatorUtilsModule.isValidUrl('not-a-url')).toBe(false);
            expect(validatorUtilsModule.isValidUrl('https://')).toBe(false);
            expect(validatorUtilsModule.isValidUrl('')).toBe(false);
            expect(validatorUtilsModule.isValidUrl(123)).toBe(false);
            expect(validatorUtilsModule.isValidUrl(null)).toBe(false);
            // Test with options
            expect(validatorUtilsModule.isValidUrl('https://example.com', { require_tld: true })).toBe(true);

            // Test safeInteger function coverage
            expect(typeof validatorUtilsModule.safeInteger).toBe('function');
            expect(validatorUtilsModule.safeInteger('123', 0)).toBe(123);
            expect(validatorUtilsModule.safeInteger('abc', 0)).toBe(0); // Invalid returns default
            expect(validatorUtilsModule.safeInteger('', 5)).toBe(5); // Empty string returns default
            expect(validatorUtilsModule.safeInteger(null, 10)).toBe(10);
            expect(validatorUtilsModule.safeInteger(undefined, 15)).toBe(15);
            // Test with bounds
            expect(validatorUtilsModule.safeInteger('50', 0, 10, 100)).toBe(50);
            expect(validatorUtilsModule.safeInteger('5', 0, 10, 100)).toBe(10); // Below min, clamped
            expect(validatorUtilsModule.safeInteger('150', 0, 10, 100)).toBe(100); // Above max, clamped
            expect(validatorUtilsModule.safeInteger('123', 0, undefined, 100)).toBe(100); // No min, above max
            expect(validatorUtilsModule.safeInteger('5', 0, 10, undefined)).toBe(10); // No max, below min
        });

        it('should handle edge cases and complex validations', () => {
            // Test isNonEmptyString with various whitespace
            expect(validatorUtilsModule.isNonEmptyString('\t\n')).toBe(false);
            expect(validatorUtilsModule.isNonEmptyString('  hello  ')).toBe(true); // Non-empty after trim

            // Test isValidFQDN with various options
            expect(validatorUtilsModule.isValidFQDN('example.com.', { allow_trailing_dot: true })).toBe(true);
            expect(validatorUtilsModule.isValidFQDN('example.com.', { allow_trailing_dot: false })).toBe(false);

            // Test isValidIdentifier edge cases
            expect(validatorUtilsModule.isValidIdentifier('_')).toBe(false); // Single underscore becomes empty after replacement
            expect(validatorUtilsModule.isValidIdentifier('-')).toBe(false); // Single hyphen becomes empty after replacement
            expect(validatorUtilsModule.isValidIdentifier('123')).toBe(true); // Numbers only

            // Test isValidHost with IPv6
            expect(validatorUtilsModule.isValidHost('::1')).toBe(true); // IPv6 localhost
            expect(validatorUtilsModule.isValidHost('2001:db8::1')).toBe(true); // IPv6 address

            // Test isValidPort boundary conditions
            expect(validatorUtilsModule.isValidPort('65535')).toBe(true); // Max port
            expect(validatorUtilsModule.isValidPort('65536')).toBe(false); // Above max
            expect(validatorUtilsModule.isValidPort('-1')).toBe(false); // Negative

            // Test safeInteger with decimal strings
            expect(validatorUtilsModule.safeInteger('123.45', 0)).toBe(0); // Decimals are invalid integers
            expect(validatorUtilsModule.safeInteger('0', 5, 1, 10)).toBe(1); // Zero below min
        });

        it('should validate numeric ranges and bounds', () => {
            // Test isValidInteger with comprehensive range options
            expect(validatorUtilsModule.isValidInteger('0', { min: 0 })).toBe(true);
            expect(validatorUtilsModule.isValidInteger('-1', { min: 0 })).toBe(false);
            expect(validatorUtilsModule.isValidInteger('100', { max: 100 })).toBe(true);
            expect(validatorUtilsModule.isValidInteger('101', { max: 100 })).toBe(false);

            // Test isValidNumeric with range options
            expect(validatorUtilsModule.isValidNumeric('50.5', { min: 50 })).toBe(true);
            expect(validatorUtilsModule.isValidNumeric('49.9', { min: 50 })).toBe(false);
            expect(validatorUtilsModule.isValidNumeric('100.0', { max: 100 })).toBe(true);
            expect(validatorUtilsModule.isValidNumeric('100.1', { max: 100 })).toBe(false);

            // Test safeInteger comprehensive bounds handling
            const result1 = validatorUtilsModule.safeInteger('50', 0, 10, 100);
            expect(result1).toBe(50);
            
            const result2 = validatorUtilsModule.safeInteger('200', 0, 10, 100);
            expect(result2).toBe(100); // Clamped to max
            
            const result3 = validatorUtilsModule.safeInteger('5', 0, 10, 100);
            expect(result3).toBe(10); // Clamped to min
        });

        it('should handle type validation consistency', () => {
            // Verify that type guards work consistently
            const testValue = 'test123';
            
            expect(validatorUtilsModule.isNonEmptyString(testValue)).toBe(true);
            expect(validatorUtilsModule.isValidIdentifier(testValue)).toBe(true);
            
            // Test array consistency
            const validIds = ['id1', 'id2-test', 'id_3'];
            expect(validatorUtilsModule.isValidIdentifierArray(validIds)).toBe(true);
            expect(validIds.every(id => validatorUtilsModule.isValidIdentifier(id))).toBe(true);
            
            // Test URL and host validation
            const validHost = 'example.com';
            expect(validatorUtilsModule.isValidHost(validHost)).toBe(true);
            expect(validatorUtilsModule.isValidUrl(`https://${validHost}`)).toBe(true);
            
            // Test numeric validation consistency
            const numericString = '123';
            expect(validatorUtilsModule.isValidInteger(numericString)).toBe(true);
            expect(validatorUtilsModule.isValidNumeric(numericString)).toBe(true);
            expect(validatorUtilsModule.safeInteger(numericString, 0)).toBe(123);
        });
    });
});
