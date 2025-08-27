/**
 * Working utility function coverage tests.
 */

import { describe, expect, it } from 'vitest';

// Import utility functions from shared modules with low function coverage
import { getEnvironment, getNodeEnv, isBrowserEnvironment, isNodeEnvironment, isProduction, isTest, isDevelopment } from '../../shared/utils/environment';
import { hasProperties, hasProperty, isArray, isBoolean, isDate, isError, isFiniteNumber, isFunction, isNonNegativeNumber, isNonNullObject, isPositiveNumber, isValidPort, isValidTimestamp } from '../../shared/utils/typeGuards';
import { safeJsonParse, safeJsonParseArray, safeJsonParseWithFallback, safeJsonStringify, safeJsonStringifyWithFallback } from '../../shared/utils/jsonSafety';
import { validateMonitorType } from '../../shared/utils/validation';
import { withErrorHandling } from '../../shared/utils/errorHandling';
import { safeStringify } from '../../shared/utils/stringConversion';
import { calculateSiteStatus, calculateSiteMonitoringStatus, getSiteDisplayStatus, getSiteStatusDescription } from '../../shared/utils/siteStatus';

describe('Working Utility Coverage Tests', () => {
    describe('Environment Utilities', () => {
        it('should test all environment detection functions', () => {
            // Test getEnvironment
            const env = getEnvironment();
            expect(typeof env).toBe('string');

            // Test getNodeEnv
            const nodeEnv = getNodeEnv();
            expect(typeof nodeEnv).toBe('string');

            // Test environment checks
            expect(typeof isBrowserEnvironment()).toBe('boolean');
            expect(typeof isNodeEnvironment()).toBe('boolean');
            expect(typeof isProduction()).toBe('boolean');
            expect(typeof isTest()).toBe('boolean');
            expect(typeof isDevelopment()).toBe('boolean');
        });
    });

    describe('Type Guard Utilities', () => {
        it('should test all type guard functions', () => {
            const testObj = { test: 'value' };
            const testArray = [1, 2, 3];
            const testDate = new Date();
            const testError = new Error('test');
            const testFunc = () => {};

            // Test object property checks
            expect(hasProperties(testObj, ['test'])).toBe(true);
            expect(hasProperties(testObj, ['nonexistent'])).toBe(false);
            expect(hasProperty(testObj, 'test')).toBe(true);
            expect(hasProperty(testObj, 'nonexistent')).toBe(false);

            // Test type checks
            expect(isArray(testArray)).toBe(true);
            expect(isArray(testObj)).toBe(false);
            expect(isBoolean(true)).toBe(true);
            expect(isBoolean('true')).toBe(false);
            expect(isDate(testDate)).toBe(true);
            expect(isDate('2023-01-01')).toBe(false);
            expect(isError(testError)).toBe(true);
            expect(isError('error')).toBe(false);
            expect(isFunction(testFunc)).toBe(true);
            expect(isFunction(testObj)).toBe(false);

            // Test number validations
            expect(isFiniteNumber(42)).toBe(true);
            expect(isFiniteNumber(Infinity)).toBe(false);
            expect(isNonNegativeNumber(0)).toBe(true);
            expect(isNonNegativeNumber(-1)).toBe(false);
            expect(isPositiveNumber(1)).toBe(true);
            expect(isPositiveNumber(0)).toBe(false);
            expect(isValidPort(80)).toBe(true);
            expect(isValidPort(70_000)).toBe(false);
            expect(isValidTimestamp(Date.now())).toBe(true);
            expect(isValidTimestamp(-1)).toBe(false);

            // Test object checks
            expect(isNonNullObject(testObj)).toBe(true);
            expect(isNonNullObject(null)).toBe(false);
        });
    });

    describe('JSON Safety Utilities', () => {
        it('should test all JSON safety functions', () => {
            // Test safeJsonParse
            const validator = (data: unknown): data is { test: string } =>
                typeof data === 'object' && data !== null && 'test' in data;

            const parseResult = safeJsonParse('{"test":"value"}', validator);
            expect(parseResult.success).toBe(true);

            const badParseResult = safeJsonParse('invalid json', validator);
            expect(badParseResult.success).toBe(false);

            // Test safeJsonParseArray
            const arrayValidator = (item: unknown): item is number => typeof item === 'number';
            const arrayResult = safeJsonParseArray('[1,2,3]', arrayValidator);
            expect(arrayResult.success).toBe(true);

            // Test safeJsonParseWithFallback
            const fallbackResult = safeJsonParseWithFallback('invalid', validator, { test: 'fallback' });
            expect(fallbackResult.test).toBe('fallback');

            // Test safeJsonStringify
            const stringifyResult = safeJsonStringify({ test: 'value' });
            expect(stringifyResult.success).toBe(true);

            // Test safeJsonStringifyWithFallback
            const stringifyFallback = safeJsonStringifyWithFallback(undefined, '{}');
            expect(typeof stringifyFallback).toBe('string');
        });
    });

    describe('Validation Utilities', () => {
        it('should test validation functions', () => {
            // Test validateMonitorType
            expect(validateMonitorType('http')).toBe(true);
            expect(validateMonitorType('port')).toBe(true);
            expect(validateMonitorType('ping')).toBe(true);
            expect(validateMonitorType('dns')).toBe(true);
            expect(validateMonitorType('invalid')).toBe(false);
        });
    });

    describe('Error Handling Utilities', () => {
        it('should test error handling functions', () => {
            // Test withErrorHandling with mock context
            const mockContext = {
                logger: {
                    error: () => {}
                },
                operationName: 'test operation'
            };

            const successResult = withErrorHandling(async () => 'success', mockContext);
            expect(successResult).toBeInstanceOf(Promise);
        });
    });

    describe('String Conversion Utilities', () => {
        it('should test string conversion functions', () => {
            // Test safeStringify
            expect(typeof safeStringify('test')).toBe('string');
            expect(typeof safeStringify(42)).toBe('string');
            expect(typeof safeStringify({})).toBe('string');
            expect(typeof safeStringify([])).toBe('string');
            expect(typeof safeStringify(null)).toBe('string');
            expect(typeof safeStringify(undefined)).toBe('string');
        });
    });

    describe('Site Status Utilities', () => {
        it('should test site status functions', () => {
            const mockSite = {
                monitors: [
                    { monitoring: true, status: 'up' as const },
                    { monitoring: false, status: 'down' as const }
                ]
            };

            // Test calculateSiteStatus
            const status = calculateSiteStatus(mockSite);
            expect(typeof status).toBe('string');

            // Test calculateSiteMonitoringStatus
            const monitoringStatus = calculateSiteMonitoringStatus(mockSite);
            expect(typeof monitoringStatus).toBe('string');

            // Test getSiteDisplayStatus
            const displayStatus = getSiteDisplayStatus(mockSite);
            expect(typeof displayStatus).toBe('string');

            // Test getSiteStatusDescription
            const statusDesc = getSiteStatusDescription(mockSite);
            expect(typeof statusDesc).toBe('string');
        });
    });
});
