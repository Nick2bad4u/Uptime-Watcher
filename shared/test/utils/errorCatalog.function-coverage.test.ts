/**
 * Targeted tests to improve function coverage for errorCatalog. Tests specific
 * function paths that might not be covered by fuzzing tests.
 *
 * @packageDocumentation
 */

import { describe, expect, test } from "vitest";
import {
    formatErrorMessage,
    isKnownErrorMessage,
    ERROR_CATALOG,
    SITE_ERRORS,
    MONITOR_ERRORS,
    VALIDATION_ERRORS,
    SYSTEM_ERRORS,
    NETWORK_ERRORS,
    DATABASE_ERRORS,
    IPC_ERRORS,
} from "../../utils/errorCatalog.js";

describe("ErrorCatalog Function Coverage Tests", () => {
    describe(formatErrorMessage, () => {
        test("should replace single placeholder", () => {
            const template = "Error: {message}";
            const params = { message: "Something went wrong" };
            const result = formatErrorMessage(template, params);

            expect(result).toBe("Error: Something went wrong");
        });

        test("should replace multiple placeholders", () => {
            const template = "Site {siteName} failed with error {errorCode}";
            const params = { siteName: "example.com", errorCode: 404 };
            const result = formatErrorMessage(template, params);

            expect(result).toBe("Site example.com failed with error 404");
        });

        test("should handle numeric values", () => {
            const template = "Timeout after {seconds} seconds";
            const params = { seconds: 30 };
            const result = formatErrorMessage(template, params);

            expect(result).toBe("Timeout after 30 seconds");
        });

        test("should handle empty params object", () => {
            const template = "No placeholders here";
            const params = {};
            const result = formatErrorMessage(template, params);

            expect(result).toBe("No placeholders here");
        });

        test("should handle non-matching placeholders", () => {
            const template = "Error: {nonexistent}";
            const params = { different: "value" };
            const result = formatErrorMessage(template, params);

            expect(result).toBe("Error: {nonexistent}");
        });

        test("should skip dangerous prototype keys for security", () => {
            const template =
                "Value: {__proto__} and {constructor} and {prototype}";
            const params = {
                __proto__: "dangerous",
                constructor: "risky",
                prototype: "unsafe",
                safe: "ok",
            };
            const result = formatErrorMessage(template, params);

            // Dangerous keys should not be replaced
            expect(result).toBe(
                "Value: {__proto__} and {constructor} and {prototype}"
            );
        });

        test("should handle string conversion of values", () => {
            const template = "Values: {number} {string}";
            const params = {
                number: 42,
                string: "test",
            };
            const result = formatErrorMessage(template, params);

            expect(result).toBe("Values: 42 test");
        });

        test("should handle same placeholder multiple times", () => {
            const template = "{name} said {name} is working on {name}";
            const params = { name: "Alice" };
            const result = formatErrorMessage(template, params);

            expect(result).toBe("Alice said Alice is working on Alice");
        });

        test("should handle special regex characters in replacement", () => {
            const template = "Pattern: {pattern}";
            const params = { pattern: "$1 and $& and $$" };
            const result = formatErrorMessage(template, params);

            expect(result).toBe("Pattern: $1 and $& and $$");
        });
    });

    describe(isKnownErrorMessage, () => {
        test("should return true for known site error messages", () => {
            expect(
                isKnownErrorMessage(SITE_ERRORS.ALREADY_EXISTS)
            ).toBeTruthy();
            expect(isKnownErrorMessage(SITE_ERRORS.FAILED_TO_ADD)).toBeTruthy();
            expect(isKnownErrorMessage(SITE_ERRORS.NOT_FOUND)).toBeTruthy();
        });

        test("should return true for known monitor error messages", () => {
            expect(
                isKnownErrorMessage(MONITOR_ERRORS.CONFIGURATION_INVALID)
            ).toBeTruthy();
            expect(
                isKnownErrorMessage(MONITOR_ERRORS.FAILED_TO_ADD)
            ).toBeTruthy();
            expect(isKnownErrorMessage(MONITOR_ERRORS.NOT_FOUND)).toBeTruthy();
        });

        test("should return true for known validation error messages", () => {
            expect(
                isKnownErrorMessage(VALIDATION_ERRORS.URL_INVALID)
            ).toBeTruthy();
            expect(
                isKnownErrorMessage(VALIDATION_ERRORS.FIELD_REQUIRED)
            ).toBeTruthy();
            expect(
                isKnownErrorMessage(VALIDATION_ERRORS.FIELD_INVALID_FORMAT)
            ).toBeTruthy();
        });

        test("should return true for known system error messages", () => {
            expect(
                isKnownErrorMessage(SYSTEM_ERRORS.INITIALIZATION_FAILED)
            ).toBeTruthy();
            expect(
                isKnownErrorMessage(SYSTEM_ERRORS.ACCESS_DENIED)
            ).toBeTruthy();
            expect(
                isKnownErrorMessage(SYSTEM_ERRORS.OPERATION_TIMEOUT)
            ).toBeTruthy();
        });

        test("should return true for known network error messages", () => {
            expect(
                isKnownErrorMessage(NETWORK_ERRORS.CONNECTION_TIMEOUT)
            ).toBeTruthy();
            expect(
                isKnownErrorMessage(NETWORK_ERRORS.DNS_RESOLUTION_FAILED)
            ).toBeTruthy();
            expect(
                isKnownErrorMessage(NETWORK_ERRORS.CONNECTION_FAILED)
            ).toBeTruthy();
        });

        test("should return true for known database error messages", () => {
            expect(
                isKnownErrorMessage(DATABASE_ERRORS.CONNECTION_FAILED)
            ).toBeTruthy();
            expect(
                isKnownErrorMessage(DATABASE_ERRORS.QUERY_FAILED)
            ).toBeTruthy();
            expect(
                isKnownErrorMessage(DATABASE_ERRORS.TRANSACTION_FAILED)
            ).toBeTruthy();
        });

        test("should return true for known IPC error messages", () => {
            expect(
                isKnownErrorMessage(IPC_ERRORS.INVALID_RESPONSE_FORMAT)
            ).toBeTruthy();
            expect(
                isKnownErrorMessage(IPC_ERRORS.IPC_OPERATION_FAILED)
            ).toBeTruthy();
            expect(
                isKnownErrorMessage(IPC_ERRORS.VALIDATION_FAILED)
            ).toBeTruthy();
        });

        test("should return false for unknown error messages", () => {
            expect(
                isKnownErrorMessage("This is not a known error message")
            ).toBeFalsy();
            expect(isKnownErrorMessage("Random error text")).toBeFalsy();
            expect(isKnownErrorMessage("")).toBeFalsy();
            expect(isKnownErrorMessage("123")).toBeFalsy();
        });

        test("should return false for empty or whitespace strings", () => {
            expect(isKnownErrorMessage("")).toBeFalsy();
            expect(isKnownErrorMessage("   ")).toBeFalsy();
            expect(isKnownErrorMessage("\n\t")).toBeFalsy();
        });
    });

    describe("ERROR_CATALOG structure", () => {
        test("should have all expected error categories", () => {
            expect(ERROR_CATALOG.sites).toBeDefined();
            expect(ERROR_CATALOG.monitors).toBeDefined();
            expect(ERROR_CATALOG.validation).toBeDefined();
            expect(ERROR_CATALOG.system).toBeDefined();
            expect(ERROR_CATALOG.network).toBeDefined();
            expect(ERROR_CATALOG.database).toBeDefined();
            expect(ERROR_CATALOG.ipc).toBeDefined();
        });

        test("should have consistent error categories", () => {
            expect(ERROR_CATALOG.sites).toBe(SITE_ERRORS);
            expect(ERROR_CATALOG.monitors).toBe(MONITOR_ERRORS);
            expect(ERROR_CATALOG.validation).toBe(VALIDATION_ERRORS);
            expect(ERROR_CATALOG.system).toBe(SYSTEM_ERRORS);
            expect(ERROR_CATALOG.network).toBe(NETWORK_ERRORS);
            expect(ERROR_CATALOG.database).toBe(DATABASE_ERRORS);
            expect(ERROR_CATALOG.ipc).toBe(IPC_ERRORS);
        });
    });
});
