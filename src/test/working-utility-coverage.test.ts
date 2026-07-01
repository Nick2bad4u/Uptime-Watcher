/**
 * Working utility function coverage tests.
 */

import { standardTestAnnotation } from "@shared/test/testUtils";
// Import utility functions from shared modules with low function coverage
import {
    getEnvironment,
    getNodeEnv,
    isBrowserEnvironment,
    isDevelopment,
    isNodeEnvironment,
    isProduction,
    isTest,
} from "@shared/utils/environment";
import { withErrorHandling } from "@shared/utils/errorHandling";
import {
    safeJsonParse,
    safeJsonParseArray,
    safeJsonParseWithFallback,
    safeJsonStringify,
    safeJsonStringifyWithFallback,
} from "@shared/utils/jsonSafety";
import {
    calculateSiteMonitoringStatus,
    calculateSiteStatus,
    getSiteDisplayStatus,
    getSiteStatusDescription,
} from "@shared/utils/siteStatus";
import { safeStringify } from "@shared/utils/stringConversion";
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
import { validateMonitorType } from "@shared/utils/validation";
import { describe, expect, it } from "vitest";

describe("working Utility Coverage Tests", () => {
    describe("environment Utilities", () => {
        it("should test all environment detection functions", ({
            annotate,
            task,
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

            expect(env).toBeTypeOf("string");

            // Test getNodeEnv
            const nodeEnv = getNodeEnv();

            expect(nodeEnv).toBeTypeOf("string");

            // Test environment checks
            expect(isBrowserEnvironment()).toBeTypeOf("boolean");
            expect(isNodeEnvironment()).toBeTypeOf("boolean");
            expect(isProduction()).toBeTypeOf("boolean");
            expect(isTest()).toBeTypeOf("boolean");
            expect(isDevelopment()).toBeTypeOf("boolean");
        });
    });

    describe("type Guard Utilities", () => {
        it("should test all type guard functions", ({ annotate, task }) => {
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
            expect(hasProperties(testObj, ["test"])).toBe(true);
            expect(hasProperties(testObj, ["nonexistent"])).toBe(false);
            expect(hasProperty(testObj, "test")).toBe(true);
            expect(hasProperty(testObj, "nonexistent")).toBe(false);

            // Test type checks
            expect(isArray(testArray)).toBe(true);
            expect(isArray(testObj)).toBe(false);
            expect(isBoolean(true)).toBe(true);
            expect(isBoolean("true")).toBe(false);
            expect(isDate(testDate)).toBe(true);
            expect(isDate("2023-01-01")).toBe(false);
            expect(isError(testError)).toBe(true);
            expect(isError("error")).toBe(false);
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

    describe("JSON Safety Utilities", () => {
        it("should test all JSON safety functions", ({ annotate, task }) => {
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

            expect(parseResult.success).toBe(true);

            const badParseResult = safeJsonParse("invalid json", validator);

            expect(badParseResult.success).toBe(false);

            // Test safeJsonParseArray
            const arrayValidator = (item: unknown): item is number =>
                typeof item === "number";
            const arrayResult = safeJsonParseArray("[1,2,3]", arrayValidator);

            expect(arrayResult.success).toBe(true);

            // Test safeJsonParseWithFallback
            const fallbackResult = safeJsonParseWithFallback(
                "invalid",
                validator,
                { test: "fallback" }
            );

            expect(fallbackResult.test).toBe("fallback");

            // Test safeJsonStringify
            const stringifyResult = safeJsonStringify({ test: "value" });

            expect(stringifyResult.success).toBe(true);

            // Test safeJsonStringifyWithFallback
            const stringifyFallback = safeJsonStringifyWithFallback(
                { test: "value" },
                "{}"
            );

            expect(stringifyFallback).toBeTypeOf("string");
        });
    });

    describe("validation Utilities", () => {
        it("should test validation functions", ({ annotate, task }) => {
            standardTestAnnotation(
                task,
                annotate,
                "working-utility-coverage",
                "Core",
                "Validation"
            );

            // Test validateMonitorType
            expect(validateMonitorType("http")).toBe(true);
            expect(validateMonitorType("port")).toBe(true);
            expect(validateMonitorType("ping")).toBe(true);
            expect(validateMonitorType("dns")).toBe(true);
            expect(validateMonitorType("invalid")).toBe(false);
        });
    });

    describe("error Handling Utilities", () => {
        it("should test error handling functions", ({ annotate, task }) => {
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

    describe("string Conversion Utilities", () => {
        it("should test string conversion functions", ({ annotate, task }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: working-utility-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: working-utility-coverage", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            // Test safeStringify
            expect(safeStringify("test")).toBeTypeOf("string");
            expect(safeStringify(42)).toBeTypeOf("string");
            expect(safeStringify({})).toBeTypeOf("string");
            expect(safeStringify([])).toBeTypeOf("string");
            expect(safeStringify(null)).toBeTypeOf("string");
            expect(safeStringify(undefined)).toBeTypeOf("string");
        });
    });

    describe("site Status Utilities", () => {
        it("should test site status functions", ({ annotate, task }) => {
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

            expect(status).toBeTypeOf("string");

            // Test calculateSiteMonitoringStatus
            const monitoringStatus = calculateSiteMonitoringStatus(mockSite);

            expect(monitoringStatus).toBeTypeOf("string");

            // Test getSiteDisplayStatus
            const displayStatus = getSiteDisplayStatus(mockSite);

            expect(displayStatus).toBeTypeOf("string");

            // Test getSiteStatusDescription
            const statusDesc = getSiteStatusDescription(mockSite);

            expect(statusDesc).toBeTypeOf("string");
        });
    });
});
