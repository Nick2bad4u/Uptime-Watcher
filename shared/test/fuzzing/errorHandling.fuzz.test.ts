/**
 * @module shared/test/fuzzing/errorHandling
 *
 * @file Fast-Check fuzzing tests for shared error handling utilities
 */

import { fc, test } from "@fast-check/vitest";
import {
    convertError,
    ensureError,
    type ErrorHandlingBackendContext,
    type ErrorHandlingFrontendStore,
    withErrorHandling,
    withUtilityErrorHandling,
} from "@shared/utils/errorHandling";
import { normalizeLogValue } from "@shared/utils/loggingContext";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { describe, expect, it, vi } from "vitest";

const sanitizedErrorMessage = (message: string) =>
    expect.objectContaining({ message });
const sharedLogMessage = (message: string) => `[SHARED] ${message}`;
const asBackendContextForTesting = (
    context: unknown
): ErrorHandlingBackendContext => context as ErrorHandlingBackendContext;

describe("ErrorHandling fuzzing", () => {
    describe("withErrorHandling console fallback", () => {
        it("should use the console fallback when logger.error is not callable", async () => {
            const consoleErrorSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});
            const consoleWarnSpy = vi
                .spyOn(console, "warn")
                .mockImplementation(() => {});

            const context = asBackendContextForTesting({
                logger: { error: "not a function" },
                operationName: "test operation",
            });

            const failingOperation = async () => {
                throw new Error("Test error");
            };

            await expect(
                withErrorHandling(failingOperation, context)
            ).rejects.toThrow("Test error");

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                sharedLogMessage("Failed to test operation"),
                sanitizedErrorMessage("Test error")
            );

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                sharedLogMessage("Logger error during error handling"),
                expect.anything()
            );

            consoleErrorSpy.mockRestore();
            consoleWarnSpy.mockRestore();
        });

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
                fc.record({
                    error: fc.anything().filter((x) => typeof x !== "function"),
                })
            ),
            fc.option(fc.string(), { nil: undefined }),
            fc.string(),
        ])(
            "should use the console fallback for invalid logger values",
            async (invalidLogger, operationName, errorMessage) => {
                const consoleErrorSpy = vi
                    .spyOn(console, "error")
                    .mockImplementation(() => {});
                const consoleWarnSpy = vi
                    .spyOn(console, "warn")
                    .mockImplementation(() => {});

                const context = asBackendContextForTesting({
                    logger: invalidLogger,
                    ...(operationName !== undefined && { operationName }),
                });

                const failingOperation = async () => {
                    throw new Error(errorMessage);
                };

                await expect(
                    withErrorHandling(failingOperation, context)
                ).rejects.toThrow(errorMessage);

                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    sharedLogMessage(
                        operationName
                            ? `Failed to ${operationName}`
                            : "Async operation failed"
                    ),
                    sanitizedErrorMessage(errorMessage)
                );
                expect(consoleWarnSpy).toHaveBeenCalledWith(
                    sharedLogMessage("Logger error during error handling"),
                    expect.anything()
                );

                consoleErrorSpy.mockRestore();
                consoleWarnSpy.mockRestore();
            }
        );

        test.prop([fc.string().filter((s) => s.length > 0), fc.string()])(
            "should format fallback messages with an operation name",
            async (operationName, errorMessage) => {
                const consoleErrorSpy = vi
                    .spyOn(console, "error")
                    .mockImplementation(() => {});
                const consoleWarnSpy = vi
                    .spyOn(console, "warn")
                    .mockImplementation(() => {});

                const context = asBackendContextForTesting({
                    logger: {},
                    operationName,
                });

                const failingOperation = async () => {
                    throw new Error(errorMessage);
                };

                await expect(
                    withErrorHandling(failingOperation, context)
                ).rejects.toThrow(errorMessage);

                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    sharedLogMessage(`Failed to ${operationName}`),
                    sanitizedErrorMessage(errorMessage)
                );
                expect(consoleWarnSpy).toHaveBeenCalledWith(
                    sharedLogMessage("Logger error during error handling"),
                    expect.anything()
                );

                consoleErrorSpy.mockRestore();
                consoleWarnSpy.mockRestore();
            }
        );

        it("should use the default message without an operation name", async () => {
            const consoleErrorSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});
            const consoleWarnSpy = vi
                .spyOn(console, "warn")
                .mockImplementation(() => {});

            const context = asBackendContextForTesting({
                logger: { someOtherMethod: () => {} },
            });

            const failingOperation = async () => {
                throw new Error("Test error");
            };

            await expect(
                withErrorHandling(failingOperation, context)
            ).rejects.toThrow("Test error");

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                sharedLogMessage("Async operation failed"),
                sanitizedErrorMessage("Test error")
            );
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                sharedLogMessage("Logger error during error handling"),
                expect.anything()
            );

            consoleErrorSpy.mockRestore();
            consoleWarnSpy.mockRestore();
        });
    });

    describe("error handling fuzz edge cases", () => {
        test.prop([fc.anything().filter((v) => v !== null && v !== undefined)])(
            "should fuzz-handle any error type thrown",
            async (errorValue) => {
                const consoleErrorSpy = vi
                    .spyOn(console, "error")
                    .mockImplementation(() => {});
                const consoleWarnSpy = vi
                    .spyOn(console, "warn")
                    .mockImplementation(() => {});

                const context = asBackendContextForTesting({
                    logger: null,
                    operationName: "fuzz test",
                });

                const failingOperation = async () => {
                    throw errorValue;
                };

                await expect(
                    withErrorHandling(failingOperation, context)
                ).rejects.toBe(errorValue);

                // Should still call console.error regardless of error type
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    sharedLogMessage("Failed to fuzz test"),
                    normalizeLogValue(errorValue)
                );
                expect(consoleWarnSpy).toHaveBeenCalledWith(
                    sharedLogMessage("Logger error during error handling"),
                    expect.anything()
                );

                consoleErrorSpy.mockRestore();
                consoleWarnSpy.mockRestore();
            }
        );

        test.prop([
            fc.oneof(
                fc.constantFrom(null, undefined),
                fc.string().filter((s) => s.trim().length > 0),
                fc.integer()
            ),
            fc.string({ minLength: 1, maxLength: 100 }),
        ])(
            "should use default message when operationName is invalid during fuzz",
            async (invalidOperationName, errorMessage) => {
                const consoleErrorSpy = vi
                    .spyOn(console, "error")
                    .mockImplementation(() => {});
                const consoleWarnSpy = vi
                    .spyOn(console, "warn")
                    .mockImplementation(() => {});

                const context = asBackendContextForTesting({
                    logger: null,
                    operationName: invalidOperationName,
                });

                const failingOperation = async () => {
                    throw new Error(errorMessage);
                };

                await expect(
                    withErrorHandling(failingOperation, context)
                ).rejects.toThrow(errorMessage);

                // Should call console.error with appropriate message
                if (
                    invalidOperationName &&
                    (typeof invalidOperationName === "string" ||
                        typeof invalidOperationName === "number")
                ) {
                    expect(consoleErrorSpy).toHaveBeenCalledWith(
                        sharedLogMessage(`Failed to ${invalidOperationName}`),
                        sanitizedErrorMessage(errorMessage)
                    );
                } else {
                    expect(consoleErrorSpy).toHaveBeenCalledWith(
                        sharedLogMessage("Async operation failed"),
                        sanitizedErrorMessage(errorMessage)
                    );
                }

                expect(consoleWarnSpy).toHaveBeenCalledWith(
                    sharedLogMessage("Logger error during error handling"),
                    expect.anything()
                );

                consoleErrorSpy.mockRestore();
                consoleWarnSpy.mockRestore();
            }
        );
    });
});

describe("withErrorHandling backend fuzz coverage", () => {
    it("should fuzz-resolve successfully without logging when operation succeeds", async () => {
        const logger = {
            error: vi.fn(),
        } satisfies ErrorHandlingBackendContext["logger"];

        const result = await withErrorHandling(async () => "ok", {
            logger,
            operationName: "successful op",
        });

        expect(result).toBe("ok");
        expect(logger.error).not.toHaveBeenCalled();
    });

    test.prop([
        fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
        fc.string({ minLength: 1, maxLength: 120 }),
    ])(
        "should fuzz-log failures with provided logger",
        async (operationName, errorMessage) => {
            const logCalls: { error: unknown; message: string }[] = [];
            const logger = {
                error: vi.fn((msg: string, err: unknown) => {
                    logCalls.push({ message: msg, error: err });
                }),
            } satisfies ErrorHandlingBackendContext["logger"];

            const failingOperation = async () => {
                throw new Error(errorMessage);
            };

            const backendContext: ErrorHandlingBackendContext =
                operationName && operationName.length > 0
                    ? { logger, operationName }
                    : { logger };

            await expect(
                withErrorHandling(failingOperation, backendContext)
            ).rejects.toThrow(errorMessage);

            const expectedMessage = operationName
                ? `Failed to ${operationName}`
                : "Async operation failed";

            expect(logger.error).toHaveBeenCalledTimes(1);
            expect(logger.error).toHaveBeenCalledWith(
                expectedMessage,
                expect.any(Error)
            );
            expect(logCalls[0]?.message).toBe(expectedMessage);
            expect(logCalls[0]?.error).toBeInstanceOf(Error);
        }
    );

    test.prop([
        fc.option(fc.string({ maxLength: 40 }), { nil: undefined }),
        fc.string({ minLength: 1, maxLength: 80 }),
    ])(
        "should fuzz fallback to console when logger throws",
        async (operationName, errorMessage) => {
            const consoleErrorSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});
            const consoleWarnSpy = vi
                .spyOn(console, "warn")
                .mockImplementation(() => {});

            const logger = {
                error: vi.fn(() => {
                    throw new Error("logger failure");
                }),
            } satisfies ErrorHandlingBackendContext["logger"];

            const failingOperation = async () => {
                throw new Error(errorMessage);
            };

            try {
                await expect(
                    withErrorHandling(
                        failingOperation,
                        operationName ? { logger, operationName } : { logger }
                    )
                ).rejects.toThrow(errorMessage);

                const expectedMessage = operationName
                    ? `Failed to ${operationName}`
                    : "Async operation failed";

                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    sharedLogMessage(expectedMessage),
                    sanitizedErrorMessage(errorMessage)
                );
                expect(consoleWarnSpy).toHaveBeenCalledWith(
                    sharedLogMessage("Logger error during error handling"),
                    sanitizedErrorMessage("logger failure")
                );
            } finally {
                consoleErrorSpy.mockRestore();
                consoleWarnSpy.mockRestore();
            }
        }
    );
});

describe("withErrorHandling frontend fuzz integration", () => {
    const buildStore = (
        config: {
            clearThrows: boolean;
            setErrorThrows?: boolean;
            setLoadingFalseThrows: boolean;
            setLoadingTrueThrows: boolean;
        },
        state: { error: string | undefined; loading: boolean }
    ): ErrorHandlingFrontendStore & {
        calls: { method: string; payload?: unknown }[];
    } => {
        const calls: { method: string; payload?: unknown }[] = [];

        return {
            clearError: () => {
                calls.push({ method: "clearError" });
                if (config.clearThrows) {
                    throw new Error("clear failure");
                }
                state.error = undefined;
            },
            setLoading: (loading: boolean) => {
                calls.push({ method: "setLoading", payload: loading });
                if (loading && config.setLoadingTrueThrows) {
                    throw new Error("set loading true failure");
                }
                if (!loading && config.setLoadingFalseThrows) {
                    throw new Error("set loading false failure");
                }
                state.loading = loading;
            },
            setError: (err) => {
                calls.push({ method: "setError", payload: err });
                if (config.setErrorThrows) {
                    throw new Error("set error failure");
                }
                state.error = err;
            },
            calls,
        } satisfies ErrorHandlingFrontendStore & {
            calls: { method: string; payload?: unknown }[];
        };
    };

    test.prop([
        fc.record({
            clearThrows: fc.boolean(),
            setLoadingTrueThrows: fc.boolean(),
            setLoadingFalseThrows: fc.boolean(),
        }),
        fc.string({ maxLength: 60 }),
    ])(
        "should fuzz-manage store state even when store methods throw while succeeding",
        async (config, resultValue) => {
            const state = { loading: false, error: "preset" };
            const store = buildStore(config, state);

            const consoleWarnSpy = vi
                .spyOn(console, "warn")
                .mockImplementation(() => {});
            const consoleErrorSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});

            try {
                await expect(
                    withErrorHandling(async () => resultValue, store)
                ).resolves.toBe(resultValue);

                expect(store.calls.map((c) => c.method)).toEqual([
                    "clearError",
                    "setLoading",
                    "setLoading",
                ]);

                let expectedWarns = 0;
                if (config.clearThrows) {
                    expectedWarns += 1;
                }
                if (config.setLoadingTrueThrows) {
                    expectedWarns += 1;
                }
                if (config.setLoadingFalseThrows) {
                    expectedWarns += 1;
                }
                expect(consoleWarnSpy.mock.calls).toHaveLength(expectedWarns);

                const originalErrorLogs = consoleErrorSpy.mock.calls.filter(
                    (call) => call[0] === "Original operation error:"
                );
                expect(originalErrorLogs).toHaveLength(0);
            } finally {
                consoleWarnSpy.mockRestore();
                consoleErrorSpy.mockRestore();
            }
        }
    );

    test.prop([
        fc.record({
            clearThrows: fc.boolean(),
            setLoadingTrueThrows: fc.boolean(),
            setErrorThrows: fc.boolean(),
            setLoadingFalseThrows: fc.boolean(),
        }),
        fc.anything(),
    ])(
        "should fuzz-surface thrown errors and set error message",
        async (config, errorValue) => {
            const state = {
                loading: false,
                error: undefined as string | undefined,
            };
            const store = buildStore(config, state);

            const consoleWarnSpy = vi
                .spyOn(console, "warn")
                .mockImplementation(() => {});
            const consoleErrorSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});

            try {
                await expect(
                    withErrorHandling(async () => {
                        throw errorValue;
                    }, store)
                ).rejects.toSatisfy((rejection: unknown) => {
                    if (Error.isError(errorValue)) {
                        return rejection === errorValue;
                    }

                    if (!Error.isError(rejection)) {
                        return false;
                    }

                    return (
                        rejection.message ===
                            convertError(errorValue).error.message &&
                        (rejection as Error & { cause?: unknown }).cause ===
                            errorValue
                    );
                });

                const setErrorCall = store.calls.find(
                    (call) => call.method === "setError"
                );
                const expectedMessage = getUserFacingErrorDetail(errorValue);
                expect(setErrorCall?.payload).toBe(expectedMessage);

                const originalErrorLog = consoleErrorSpy.mock.calls.find(
                    (call) =>
                        call[0] === sharedLogMessage("Original operation error")
                );
                if (config.setErrorThrows && Boolean(errorValue)) {
                    expect(originalErrorLog).toEqual([
                        sharedLogMessage("Original operation error"),
                        normalizeLogValue(errorValue),
                    ]);
                } else {
                    expect(originalErrorLog).toBeUndefined();
                }
            } finally {
                consoleWarnSpy.mockRestore();
                consoleErrorSpy.mockRestore();
            }
        }
    );

    it("should fuzz-log original error when setError throws", async () => {
        const consoleWarnSpy = vi
            .spyOn(console, "warn")
            .mockImplementation(() => {});
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const state = {
            loading: false,
            error: undefined as string | undefined,
        };
        const store = buildStore(
            {
                clearThrows: false,
                setLoadingTrueThrows: false,
                setLoadingFalseThrows: false,
                setErrorThrows: true,
            },
            state
        );

        const originalError = new Error("frontend failure");

        try {
            await expect(
                withErrorHandling(async () => {
                    throw originalError;
                }, store)
            ).rejects.toBe(originalError);

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                sharedLogMessage("Store operation failed"),
                { operationName: "set error state" },
                sanitizedErrorMessage("set error failure")
            );
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                sharedLogMessage("Original operation error"),
                sanitizedErrorMessage("frontend failure")
            );
        } finally {
            consoleWarnSpy.mockRestore();
            consoleErrorSpy.mockRestore();
        }
    });
});

describe("convertError and ensureError fuzz coverage", () => {
    test.prop([fc.anything()])(
        "should always produce an Error instance under fuzz",
        (value) => {
            const result = convertError(value);
            expect(result.error).toBeInstanceOf(Error);
            expect(typeof result.originalType).toBe("string");
            if (Error.isError(value)) {
                expect(result.wasError).toBeTruthy();
            } else {
                expect(result.wasError).toBeFalsy();
            }
        }
    );

    it("should fuzz-preserve Error instances without modification", () => {
        const original = new TypeError("original");
        const result = convertError(original);
        expect(result.error).toBe(original);
        expect(result.originalType).toBe("Error");
        expect(result.wasError).toBeTruthy();
    });

    it("should fuzz-handle whitespace-only strings", () => {
        const result = convertError("   \t   ");
        expect(result.error.message).toBe("[whitespace-only string]");
        expect(result.wasError).toBeFalsy();
    });

    it("should fuzz-avoid object string coercion during conversion", () => {
        const toString = vi.fn(() => {
            throw new Error("toString failure");
        });
        const problematic: { self?: unknown; toString: () => never } = {
            toString,
        };
        problematic.self = problematic;

        const result = convertError(problematic);
        expect(result.error.message).toBe('{"self":"[Circular]"}');
        expect(result.originalType).toBe("object");
        expect(result.wasError).toBeFalsy();
        expect(toString).not.toHaveBeenCalled();
    });

    it("ensureError should delegate to convertError during fuzzing", () => {
        const value = 42;
        const resultFromConvert = convertError(value);
        const ensured = ensureError(value);
        expect(ensured).toStrictEqual(resultFromConvert.error);
    });
});

describe("withUtilityErrorHandling fuzz behavior", () => {
    test.prop([fc.string({ maxLength: 40 }), fc.string({ maxLength: 80 })])(
        "should fuzz-resolve operation results",
        async (operationName, value) => {
            await expect(
                withUtilityErrorHandling(async () => value, operationName)
            ).resolves.toBe(value);
        }
    );

    it("should fuzz-rethrow when shouldThrow is true", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const failingError = new Error("utility failure");

        try {
            await expect(
                withUtilityErrorHandling(
                    async () => {
                        throw failingError;
                    },
                    "utility op",
                    undefined,
                    true
                )
            ).rejects.toBe(failingError);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                sharedLogMessage("utility op failed"),
                sanitizedErrorMessage("utility failure")
            );
        } finally {
            consoleErrorSpy.mockRestore();
        }
    });

    it("should fuzz-return fallback when provided and shouldThrow is false", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        try {
            await expect(
                withUtilityErrorHandling(
                    async () => {
                        throw new Error("utility failure");
                    },
                    "utility fallback",
                    "fallback"
                )
            ).resolves.toBe("fallback");

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                sharedLogMessage("utility fallback failed"),
                sanitizedErrorMessage("utility failure")
            );
        } finally {
            consoleErrorSpy.mockRestore();
        }
    });

    it("should fuzz-throw descriptive error when fallback missing", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        try {
            await expect(
                withUtilityErrorHandling(async () => {
                    throw new Error("boom");
                }, "no fallback provided")
            ).rejects.toThrow("no fallback value provided");
        } finally {
            consoleErrorSpy.mockRestore();
        }
    });
});
