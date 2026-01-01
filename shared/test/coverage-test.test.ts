/**
 * Fixed Coverage Tests for Shared Module Targeting the exact uncovered lines to
 * achieve 100% coverage
 */

import { describe, expect, it, vi } from "vitest";
import { safeStringify } from "../utils/stringConversion";
import { validateMonitorField } from "@shared/validation/monitorSchemas";
import { isValidHistoryRow, safeGetRowProperty } from "../types/database";
import { withErrorHandling } from "../utils/errorHandling";

describe("Fixed Coverage Tests", () => {
    describe("stringConversion.ts - Lines 89-90, 92-93", () => {
        it("should handle undefined value (lines 86-87)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-test", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const result = safeStringify(undefined);
            expect(result).toBe("");
        });

        it("should attempt to reach default case (lines 89-90)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-test", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            // Create an edge case object that might trigger default behavior
            const weirdObject = {
                [Symbol.toPrimitive]: () => "weird",
                toString: () => "[Object]",
                valueOf: () => ({}),
            };

            const result = safeStringify(weirdObject);
            expect(typeof result).toBe("string");
        });
    });

    describe("schemas.ts - Line 399 (Unknown field error)", () => {
        it("should trigger unknown field error for truly unknown field", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-test", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

            // Test with a field that doesn't exist in any schema
            expect(() => {
                validateMonitorField("http", "totallyUnknownField", "value");
            }).toThrowError("Unknown field: totallyUnknownField");
        });
    });

    describe("database.ts - Line 208 (isValidTimestamp false)", () => {
        it("should trigger isValidTimestamp false case through isValidHistoryRow", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-test", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            // Create a history row with invalid timestamp to trigger line 208
            const invalidHistoryRow = {
                monitorId: "test",
                status: "up",
                timestamp: "invalid-timestamp", // This will fail isValidTimestamp
            };

            const result = isValidHistoryRow(invalidHistoryRow);
            expect(result).toBeFalsy();
        });
    });

    describe("database.ts - Lines 372-373 (Property access)", () => {
        it("should handle null property access in safeGetRowProperty", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-test", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Data Retrieval", "type");

            const row = {
                nested: {
                    value: null,
                },
            };

            // Access property path that leads to null/undefined
            const result = safeGetRowProperty(
                row,
                "nested.value.nonexistent",
                "default"
            );
            expect(result).toBe("default");
        });
    });

    describe("errorHandling.ts - Line 183 (Finally block)", () => {
        it("should handle setLoading error in finally block", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-test", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

            const consoleWarnSpy = vi
                .spyOn(console, "warn")
                .mockImplementation(() => {
                    /* noop – capture warning without polluting test output */
                });

            const consoleErrorSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {
                    /* noop – capture error without polluting test output */
                });

            const mockStore = {
                clearError: vi.fn(),
                setError: vi.fn(),
                setLoading: vi
                    .fn()
                    .mockImplementationOnce(() => {}) // First call (start) succeeds
                    .mockImplementationOnce(() => {
                        throw new Error("setLoading failed in finally");
                    }), // Second call (finally) fails
            };

            const operation = vi
                .fn()
                .mockRejectedValue(new Error("Operation failed"));

            // This should cover the error handling in the finally block
            await expect(
                withErrorHandling(operation, mockStore)
            ).rejects.toThrowError("Operation failed");

            // Verify the calls happened
            expect(mockStore.setLoading).toHaveBeenCalledTimes(2);
            expect(mockStore.setLoading).toHaveBeenNthCalledWith(1, true);
            expect(mockStore.setLoading).toHaveBeenNthCalledWith(2, false);

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                "Store operation failed for:",
                "clear loading state in finally block",
                expect.any(Error)
            );
            expect(consoleErrorSpy).not.toHaveBeenCalled();

            consoleWarnSpy.mockRestore();
            consoleErrorSpy.mockRestore();
        });
    });

    describe("schemas.ts - Lines 478-479, 482 (Error categorization)", () => {
        it("should handle validation error categorization", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-test", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Error Handling", "type");

            // Test with invalid data that should trigger the path length conditions
            const result = validateMonitorField(
                "http",
                "checkInterval",
                "not-a-number"
            );
            expect(result.success).toBeFalsy();
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });
});
