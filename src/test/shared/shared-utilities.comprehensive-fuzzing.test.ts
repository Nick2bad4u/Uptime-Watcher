/**
 * Comprehensive fast-check fuzzing tests for shared utility modules.
 *
 * This test suite provides basic fuzzing coverage for available shared
 * utilities with existing APIs.
 *
 * @packageDocumentation
 */

import { describe, expect } from "vitest";
import { test as fcTest, fc } from "@fast-check/vitest";

// Import existing shared utilities for testing
import * as guards from "../../../shared/utils/typeGuards";
import * as jsonSafety from "../../../shared/utils/jsonSafety";

// Import specific validation functions that exist
import {
    isValidUrl,
    isValidPort,
} from "../../../shared/validation/validatorUtils";

describe("Shared Utilities Comprehensive Fuzzing", () => {
    describe("validatorUtils", () => {
        fcTest.prop([fc.webUrl()])("should handle URL validation", (url) => {
            const result = isValidUrl(url);
            expect(typeof result).toBe("boolean");
        });

        fcTest.prop([fc.integer({ min: 1, max: 65_535 })])(
            "should handle port validation",
            (port) => {
                const result = isValidPort(port);
                expect(typeof result).toBe("boolean");
            }
        );
    });

    describe("typeGuards", () => {
        fcTest.prop([fc.anything()])("should handle type guard operations", (
            input
        ) => {
            expect(() => guards.isObject(input)).not.toThrowError();
            expect(() => guards.isString(input)).not.toThrowError();
            expect(() => guards.isNumber(input)).not.toThrowError();
        });
    });

    describe("jsonSafety", () => {
        fcTest.prop([fc.jsonValue()])("should handle JSON operations safely", (
            value
        ) => {
            const result = jsonSafety.safeJsonStringify(value);
            expect(result).toBeDefined();
            expect(typeof result).toBe("object");
            expect(typeof result.success).toBe("boolean");

            // If successful, should have data as string
            if (result.success) {
                expect(typeof result.data).toBe("string");
            }
        });
    });
});
