/**
 * Working utility function coverage tests.
 */

import { describe, expect, it } from "vitest";

import { standardTestAnnotation } from "@shared/test/testUtils";

// Import utility functions from shared modules with low function coverage
import {
    getEnvironment,
    getNodeEnv,
    isBrowserEnvironment,
    isNodeEnvironment,
    isProduction,
    isTest,
    isDevelopment,
} from "@shared/utils/environment";
import {
    hasProperties,
    hasProperty,
    isArray,
    isBoolean,
    isDate,
    isError,
    isFiniteNumber,
    isFunction,
    isNonNegativeNumber,
    isNonNullObject,
    isPositiveNumber,
    isValidPort,
    isValidTimestamp,
} from "@shared/utils/typeGuards";
import {
    safeJsonParse,
    safeJsonParseArray,
    safeJsonParseWithFallback,
    safeJsonStringify,
    safeJsonStringifyWithFallback,
} from "@shared/utils/jsonSafety";
import { validateMonitorType } from "@shared/utils/validation";
import { withErrorHandling } from "@shared/utils/errorHandling";
import { safeStringify } from "@shared/utils/stringConversion";
import {
    calculateSiteStatus,
    calculateSiteMonitoringStatus,
    getSiteDisplayStatus,
    getSiteStatusDescription,
} from "@shared/utils/siteStatus";

describe("Working Utility Coverage Tests", () => {
    describe("Environment Utilities", () => {
        it("should test all environment detection functions", ({
            task,
            annotate,
        }) => {
            standardTestAnnotation(
                task,
                annotate,
                "working-utility-coverage",
                "Core",
                "Business Logic"
            );

            // Test getEnvironment
            const env = getEnvironment();
            expect(typeof env).toBe("string");

            // Test getNodeEnv
            const nodeEnv = getNodeEnv();
            expect(typeof nodeEnv).toBe("string");

            // Test environment checks
            expect(typeof isBrowserEnvironment()).toBe("boolean");
            expect(typeof isNodeEnvironment()).toBe("boolean");
            expect(typeof isProduction()).toBe("boolean");
            expect(typeof isTest()).toBe("boolean");
            expect(typeof isDevelopment()).toBe("boolean");
        });
    });

    describe("Type Guard Utilities", () => {
        it("should test all type guard functions", ({ task, annotate }) => {
            standardTestAnnotation(
                task,
                annotate,
                "working-utility-coverage",
                "Core",
                "Business Logic"
            );

            const testObj = { test: "value" } as const;
            const testArray = [
                1,
                2,
                3,
            ] as const;
            const testDate = new Date();
            const testError = new Error("test");
            const testFunc = () => {};

            // Test object property checks
            expect(hasProperties(testObj, ["test"])).toBeTruthy();
            expect(hasProperties(testObj, ["nonexistent"])).toBeFalsy();
            expect(hasProperty(testObj, "test")).toBeTruthy();
            expect(hasProperty(testObj, "nonexistent")).toBeFalsy();

            // Test type checks
            expect(isArray(testArray)).toBeTruthy();
            expect(isArray(testObj)).toBeFalsy();
            expect(isBoolean(true)).toBeTruthy();
            expect(isBoolean("true")).toBeFalsy();
            expect(isDate(testDate)).toBeTruthy();
            expect(isDate("2023-01-01")).toBeFalsy();
            expect(isError(testError)).toBeTruthy();
            expect(isError("error")).toBeFalsy();
            expect(isFunction(testFunc)).toBeTruthy();
            expect(isFunction(testObj)).toBeFalsy();

            // Test number validations
            expect(isFiniteNumber(42)).toBeTruthy();
            expect(isFiniteNumber(Infinity)).toBeFalsy();
            expect(isNonNegativeNumber(0)).toBeTruthy();
            expect(isNonNegativeNumber(-1)).toBeFalsy();
            expect(isPositiveNumber(1)).toBeTruthy();
            expect(isPositiveNumber(0)).toBeFalsy();
            expect(isValidPort(80)).toBeTruthy();
            expect(isValidPort(70_000)).toBeFalsy();
            expect(isValidTimestamp(Date.now())).toBeTruthy();
            expect(isValidTimestamp(-1)).toBeFalsy();

            // Test object checks
            expect(isNonNullObject(testObj)).toBeTruthy();
            expect(isNonNullObject(null)).toBeFalsy();
        });
    });

    describe("JSON Safety Utilities", () => {
        it("should test all JSON safety functions", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: working-utility-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: working-utility-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            // Test safeJsonParse
            const validator = (data: unknown): data is { test: string } =>
                typeof data === "object" && data !== null && "test" in data;

            const parseResult = safeJsonParse('{"test":"value"}', validator);
            expect(parseResult.success).toBeTruthy();

            const badParseResult = safeJsonParse("invalid json", validator);
            expect(badParseResult.success).toBeFalsy();

            // Test safeJsonParseArray
            const arrayValidator = (item: unknown): item is number =>
                typeof item === "number";
            const arrayResult = safeJsonParseArray("[1,2,3]", arrayValidator);
            expect(arrayResult.success).toBeTruthy();

            // Test safeJsonParseWithFallback
            const fallbackResult = safeJsonParseWithFallback(
                "invalid",
                validator,
                { test: "fallback" }
            );
            expect(fallbackResult.test).toBe("fallback");

            // Test safeJsonStringify
            const stringifyResult = safeJsonStringify({ test: "value" });
            expect(stringifyResult.success).toBeTruthy();

            // Test safeJsonStringifyWithFallback
            const stringifyFallback = safeJsonStringifyWithFallback(
                undefined,
                "{}"
            );
            expect(typeof stringifyFallback).toBe("string");
        });
    });

    describe("Validation Utilities", () => {
        it("should test validation functions", ({ task, annotate }) => {
            standardTestAnnotation(
                task,
                annotate,
                "working-utility-coverage",
                "Core",
                "Validation"
            );

            // Test validateMonitorType
            expect(validateMonitorType("http")).toBeTruthy();
            expect(validateMonitorType("port")).toBeTruthy();
            expect(validateMonitorType("ping")).toBeTruthy();
            expect(validateMonitorType("dns")).toBeTruthy();
            expect(validateMonitorType("invalid")).toBeFalsy();
        });
    });

    describe("Error Handling Utilities", () => {
        it("should test error handling functions", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: working-utility-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: working-utility-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Error Handling", "type");

            // Test withErrorHandling with mock context
            const mockContext = {
                logger: {
                    error: () => {},
                },
                operationName: "test operation",
            };

            const successResult = withErrorHandling(
                async () => "success",
                mockContext
            );
            expect(successResult).toBeInstanceOf(Promise);
        });
    });

    describe("String Conversion Utilities", () => {
        it("should test string conversion functions", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: working-utility-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: working-utility-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            // Test safeStringify
            expect(typeof safeStringify("test")).toBe("string");
            expect(typeof safeStringify(42)).toBe("string");
            expect(typeof safeStringify({})).toBe("string");
            expect(typeof safeStringify([])).toBe("string");
            expect(typeof safeStringify(null)).toBe("string");
            expect(typeof safeStringify(undefined)).toBe("string");
        });
    });

    describe("Site Status Utilities", () => {
        it("should test site status functions", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: working-utility-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: working-utility-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const mockSite = {
                monitors: [
                    { monitoring: true, status: "up" as const },
                    { monitoring: false, status: "down" as const },
                ],
            };

            // Test calculateSiteStatus
            const status = calculateSiteStatus(mockSite);
            expect(typeof status).toBe("string");

            // Test calculateSiteMonitoringStatus
            const monitoringStatus = calculateSiteMonitoringStatus(mockSite);
            expect(typeof monitoringStatus).toBe("string");

            // Test getSiteDisplayStatus
            const displayStatus = getSiteDisplayStatus(mockSite);
            expect(typeof displayStatus).toBe("string");

            // Test getSiteStatusDescription
            const statusDesc = getSiteStatusDescription(mockSite);
            expect(typeof statusDesc).toBe("string");
        });
    });
});
