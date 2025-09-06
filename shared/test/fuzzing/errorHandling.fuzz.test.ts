/**
 * @fileoverview Fast-Check fuzzing tests for errorHandling targeting line 141
 * @module shared/test/fuzzing/errorHandling
 */

import { describe, expect, it, vi } from "vitest";
import { fc, test } from "@fast-check/vitest";
import { withErrorHandling, type ErrorHandlingBackendContext } from "@shared/utils/errorHandling";

describe("ErrorHandling Fuzzing - Line 141", () => {
    it("simple test", () => {
        expect(1 + 1).toBe(2);
    });

    describe("withErrorHandling - Line 141 console.error fallback", () => {
        it("should use console.error when logger is invalid - line 141", async () => {
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            // Backend context with invalid logger to trigger line 141
            const context: ErrorHandlingBackendContext = {
                logger: { error: "not a function" as any }, // Invalid logger that will fail runtime check
                operationName: "test operation"
            };

            const failingOperation = async () => {
                throw new Error("Test error");
            };

            await expect(withErrorHandling(failingOperation, context)).rejects.toThrow("Test error");

            // Verify line 141 was hit - console.error should be called
            expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to test operation", expect.any(Error));

            consoleErrorSpy.mockRestore();
        });

        // Fast-Check fuzzing tests for invalid logger scenarios
        test.prop([
            fc.oneof(
                fc.constant(undefined),
                fc.constant(null),
                fc.constant({}),
                fc.constant({ error: undefined }),
                fc.constant({ error: null }),
                fc.constant({ error: "not a function" }),
                fc.constant({ error: 123 }),
                fc.constant({ error: {} }),
                fc.record({ error: fc.anything().filter(x => typeof x !== "function") })
            ),
            fc.option(fc.string(), { nil: undefined }),
            fc.string()
        ])("should trigger console.error fallback with invalid logger - line 141", async (invalidLogger, operationName, errorMessage) => {
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            // Force type to pass TypeScript compilation but fail runtime check
            const context: ErrorHandlingBackendContext = {
                logger: invalidLogger as any,
                ...(operationName !== undefined && { operationName })
            };

            const failingOperation = async () => {
                throw new Error(errorMessage);
            };

            await expect(withErrorHandling(failingOperation, context)).rejects.toThrow(errorMessage);

            // Verify line 141 was hit - console.error should be called instead of logger.error
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                operationName ? `Failed to ${operationName}` : "Async operation failed",
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });

        test.prop([
            fc.string().filter(s => s.length > 0),
            fc.string()
        ])("should format console.error message correctly - line 141", async (operationName, errorMessage) => {
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            // Context with no logger property to trigger console.error
            const context: ErrorHandlingBackendContext = {
                logger: {} as any, // Empty object fails the logger check
                operationName
            };

            const failingOperation = async () => {
                throw new Error(errorMessage);
            };

            await expect(withErrorHandling(failingOperation, context)).rejects.toThrow(errorMessage);

            // Verify the specific message format for line 141
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                `Failed to ${operationName}`,
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });

        it("should verify line 141 path with undefined operationName", async () => {
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            const context: ErrorHandlingBackendContext = {
                logger: { someOtherMethod: () => {} } as any, // Invalid logger without error method
            };

            const failingOperation = async () => {
                throw new Error("Test error");
            };

            await expect(withErrorHandling(failingOperation, context)).rejects.toThrow("Test error");

            // Verify line 141 console.error call with default message
            expect(consoleErrorSpy).toHaveBeenCalledWith("Async operation failed", expect.any(Error));

            consoleErrorSpy.mockRestore();
        });
    });

    describe("Error handling edge cases", () => {
        test.prop([fc.anything().filter(v => v !== null && v !== undefined)])(
            "should handle any error type thrown",
            async (errorValue) => {
                const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

                const context: ErrorHandlingBackendContext = {
                    logger: null as any, // Force console.error path
                    operationName: "fuzz test"
                };

                const failingOperation = async () => {
                    throw errorValue;
                };

                await expect(withErrorHandling(failingOperation, context)).rejects.toBe(errorValue);

                // Should still call console.error regardless of error type
                expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to fuzz test", errorValue);

                consoleErrorSpy.mockRestore();
            }
        );

        test.prop([
            fc.oneof(fc.constantFrom(null, undefined), fc.string().filter(s => s.trim().length > 0), fc.integer()),
            fc.string({ minLength: 1, maxLength: 100 })
        ])(
            "should use default message when operationName is invalid",
            async (invalidOperationName, errorMessage) => {
                const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

                const context: ErrorHandlingBackendContext = {
                    logger: null as any, // Invalid logger to force console.error path
                    operationName: invalidOperationName as any
                };

                const failingOperation = async () => {
                    throw new Error(errorMessage);
                };

                await expect(withErrorHandling(failingOperation, context)).rejects.toThrow(errorMessage);

                // Should call console.error with appropriate message
                if (
                    invalidOperationName &&
                    (typeof invalidOperationName === "string" || typeof invalidOperationName === "number")
                ) {
                    expect(consoleErrorSpy).toHaveBeenCalledWith(`Failed to ${invalidOperationName}`, expect.any(Error));
                } else {
                    expect(consoleErrorSpy).toHaveBeenCalledWith("Async operation failed", expect.any(Error));
                }

                consoleErrorSpy.mockRestore();
            }
        );
    });
});
