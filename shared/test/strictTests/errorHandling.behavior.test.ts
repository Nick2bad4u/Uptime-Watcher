/**
 * Shared error handling utility behavior.
 */

import {
    ApplicationError,
    convertError,
    ensureError,
    type ErrorHandlingBackendContext,
    type ErrorHandlingFrontendStore,
    withErrorHandling,
    withUtilityErrorHandling,
} from "@shared/utils/errorHandling";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
    vi.restoreAllMocks();
});

describe(ApplicationError, () => {
    it("normalizes primitive causes and preserves metadata", () => {
        const details = { scope: "sync" };
        const error = new ApplicationError({
            cause: "boom",
            code: "E_SYNC",
            details,
            message: "Sync failed",
            operation: "synchronize",
        });

        expect(error.message).toBe("Sync failed");
        expect(error.name).toBe("ApplicationError");
        expect(error.code).toBe("E_SYNC");
        expect(error.operation).toBe("synchronize");
        expect(error.cause).toBeInstanceOf(Error);
        expect((error.cause as Error).message).toBe("boom");
        expect(Object.isFrozen(error.details)).toBeTruthy();
    });

    it("does not invoke detail accessors while freezing metadata", () => {
        let getterCalls = 0;
        const details = { scope: "sync" };
        Object.defineProperty(details, "secret", {
            enumerable: true,
            get() {
                getterCalls += 1;
                throw new Error("detail getter should not run");
            },
        });

        const error = new ApplicationError({
            code: "E_DETAILS",
            details,
            message: "Metadata failed",
        });

        expect(error.details).toEqual({ scope: "sync" });
        expect(Object.hasOwn(error.details ?? {}, "secret")).toBeFalsy();
        expect(Object.isFrozen(error.details)).toBeTruthy();
        expect(getterCalls).toBe(0);
    });

    it("handles non-serializable causes gracefully", () => {
        const circular: Record<string, unknown> = {};
        circular["self"] = circular;

        const error = new ApplicationError({
            cause: circular,
            code: "E_CIRCULAR",
            message: "Circular",
        });

        expect(error.cause).toBeInstanceOf(Error);
        expect((error.cause as Error).message).toBe('{"self":"[Circular]"}');
    });

    it("redacts secret-like structured causes before wrapping", () => {
        const error = new ApplicationError({
            cause: {
                accessToken: "token-secret",
                nested: {
                    url: "https://example.com/callback?refresh_token=refresh-secret",
                },
                visible: "plain detail",
            },
            code: "E_SECRET",
            message: "Secret cause",
        });

        expect(error.cause).toBeInstanceOf(Error);
        expect((error.cause as Error).message).toContain(
            '"accessToken":"[redacted]"'
        );
        expect((error.cause as Error).message).toContain(
            "refresh_token=[redacted]"
        );
        expect((error.cause as Error).message).toContain("plain detail");
        expect((error.cause as Error).message).not.toContain("token-secret");
        expect((error.cause as Error).message).not.toContain("refresh-secret");
    });

    it("supports null and undefined causes without wrapping", () => {
        const nullCause = new ApplicationError({
            cause: null,
            code: "E_NULL",
            message: "Null cause",
        });

        const undefinedCause = new ApplicationError({
            code: "E_UNDEFINED",
            message: "Undefined cause",
        });

        expect((nullCause.cause as Error).message).toBe("null");
        expect(undefinedCause.cause).toBeUndefined();
    });

    it("preserves primitive bigint and symbol cause descriptions", () => {
        const bigintCause = new ApplicationError({
            cause: 123n,
            code: "E_BIGINT",
            message: "Bigint cause",
        });

        const symbolCause = new ApplicationError({
            cause: Symbol.for("shared-cause"),
            code: "E_SYMBOL",
            message: "Symbol cause",
        });

        expect(bigintCause.cause).toBeInstanceOf(Error);
        expect((bigintCause.cause as Error).message).toBe("123");
        expect(symbolCause.cause).toBeInstanceOf(Error);
        expect((symbolCause.cause as Error).message).toBe(
            "Symbol(shared-cause)"
        );
    });
});

describe(convertError, () => {
    it("returns the original error when already an Error", () => {
        const original = new Error("existing");
        const result = convertError(original);

        expect(result.wasError).toBeTruthy();
        expect(result.error).toBe(original);
    });

    it("provides informative messages for whitespace strings", () => {
        const result = convertError(" ".repeat(3));

        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toBe("[whitespace-only string]");
        expect(result.originalType).toBe("string");
    });

    it("does not invoke object string coercion during conversion", () => {
        const toString = vi.fn(() => {
            throw new Error("toString broke");
        });
        const problematic: Record<string, unknown> & {
            toString: () => never;
        } = {
            toString,
        };
        problematic["self"] = problematic;

        const result = convertError(problematic);

        expect(result.error.message).toBe('{"self":"[Circular]"}');
        expect(result.originalType).toBe("object");
        expect(result.wasError).toBeFalsy();
        expect(toString).not.toHaveBeenCalled();
    });

    it("redacts secret-like strings during conversion", () => {
        const result = convertError(
            "request failed Authorization Bearer string-secret"
        );

        expect(result.error.message).toBe(
            "request failed Authorization [redacted]"
        );
        expect(result.error.message).not.toContain("string-secret");
    });
});

describe(ensureError, () => {
    it("always returns an Error instance", () => {
        const ensured = ensureError({ issue: true });

        expect(ensured).toBeInstanceOf(Error);
        expect(ensured.message.length).toBeGreaterThan(0);
    });
});

describe(withErrorHandling, () => {
    it("manages frontend store state for successful operations", async () => {
        const store: ErrorHandlingFrontendStore = {
            clearError: vi.fn(),
            setError: vi.fn(),
            setLoading: vi.fn(),
        };

        const result = await withErrorHandling(async () => 42, store);

        expect(result).toBe(42);
        expect(store.clearError).toHaveBeenCalledTimes(1);
        expect(store.setLoading).toHaveBeenNthCalledWith(1, true);
        expect(store.setLoading).toHaveBeenNthCalledWith(2, false);
        expect(store.setError).not.toHaveBeenCalled();
    });

    it("normalizes frontend errors and logs safe operation failures", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
            /* noop */
        });
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {
            /* noop */
        });

        const store: ErrorHandlingFrontendStore = {
            clearError: vi.fn(() => {
                throw new Error("clear fail");
            }),
            setError: vi.fn(() => {
                throw new Error("set error fail");
            }),
            setLoading: vi.fn(() => {
                throw new Error("set loading fail");
            }),
        };

        await expect(
            withErrorHandling(async () => {
                throw new Error("frontend fail");
            }, store)
        ).rejects.toThrow("frontend fail");

        expect(store.clearError).toHaveBeenCalledTimes(1);
        expect(store.setLoading).toHaveBeenCalledTimes(2);
        expect(store.setError).toHaveBeenCalledTimes(1);
        expect(store.setError).toHaveBeenCalledWith("frontend fail");
        expect(warnSpy).toHaveBeenCalledTimes(4);
        expect(errorSpy).toHaveBeenCalledWith(
            "[SHARED] Original operation error",
            expect.objectContaining({ message: "frontend fail" })
        );
    });

    it("sanitizes fallback frontend console errors", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
            /* noop */
        });
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {
            /* noop */
        });

        const store: ErrorHandlingFrontendStore = {
            clearError: vi.fn(),
            setError: vi.fn(() => {
                throw new Error("set error fail");
            }),
            setLoading: vi.fn(),
        };

        await expect(
            withErrorHandling(async () => {
                throw {
                    accessToken: "token-secret",
                    message: "failed Authorization Bearer bearer-secret",
                };
            }, store)
        ).rejects.toThrow(
            '{"accessToken":"[redacted]","message":"failed Authorization [redacted]"}'
        );

        expect(errorSpy).toHaveBeenCalledWith(
            "[SHARED] Original operation error",
            expect.objectContaining({
                accessToken: "[redacted]",
                message: "failed Authorization [redacted]",
            })
        );
        expect(warnSpy).toHaveBeenCalledWith(
            "[SHARED] Store operation failed",
            expect.objectContaining({ operationName: "set error state" }),
            expect.objectContaining({ message: "set error fail" })
        );
        const errorCalls = JSON.stringify(errorSpy.mock.calls);
        expect(errorCalls).not.toContain("token-secret");
        expect(errorCalls).not.toContain("bearer-secret");
    });

    it("logs backend failures with contextual messaging", async () => {
        const logger = {
            error: vi.fn(),
        } satisfies ErrorHandlingBackendContext["logger"];

        await expect(
            withErrorHandling(
                async () => {
                    throw new Error("backend fail");
                },
                { logger, operationName: 99 as unknown as string }
            )
        ).rejects.toThrow("backend fail");

        expect(logger.error).toHaveBeenCalledWith(
            "Failed to 99",
            expect.any(Error)
        );
    });

    it("falls back to console logging when logger throws", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {
                /* noop */
            });
        const consoleWarnSpy = vi
            .spyOn(console, "warn")
            .mockImplementation(() => {
                /* noop */
            });

        const logger = {
            error: vi.fn(() => {
                throw new Error("logger fail");
            }),
        };

        await expect(
            withErrorHandling(
                async () => {
                    throw new Error("operation fail");
                },
                { logger, operationName: "sync" }
            )
        ).rejects.toThrow("operation fail");

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "[SHARED] Failed to sync",
            expect.objectContaining({ message: "operation fail" })
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            "[SHARED] Logger error during error handling",
            expect.objectContaining({ message: "logger fail" })
        );
    });

    it("sanitizes backend console fallback errors", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {
                /* noop */
            });
        const consoleWarnSpy = vi
            .spyOn(console, "warn")
            .mockImplementation(() => {
                /* noop */
            });

        const logger = {
            error: vi.fn(() => {
                throw new Error("logger Authorization Bearer logger-secret");
            }),
        };

        await expect(
            withErrorHandling(
                async () => {
                    throw {
                        refreshToken: "refresh-secret",
                        message: "operation failed",
                    };
                },
                { logger, operationName: "sync" }
            )
        ).rejects.toMatchObject({ message: "operation failed" });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "[SHARED] Failed to sync",
            expect.objectContaining({
                message: "operation failed",
                refreshToken: "[redacted]",
            })
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            "[SHARED] Logger error during error handling",
            expect.objectContaining({
                message: "logger Authorization [redacted]",
            })
        );
        expect(JSON.stringify(consoleErrorSpy.mock.calls)).not.toContain(
            "refresh-secret"
        );
        expect(JSON.stringify(consoleWarnSpy.mock.calls)).not.toContain(
            "logger-secret"
        );
    });
});

describe(withUtilityErrorHandling, () => {
    it("returns operation result on success", async () => {
        const result = await withUtilityErrorHandling(
            async () => "value",
            "compute"
        );

        expect(result).toBe("value");
    });

    it("returns fallback value when instructed not to throw", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
            /* noop */
        });

        const result = await withUtilityErrorHandling(
            async () => {
                throw new Error("boom");
            },
            "load data",
            "fallback"
        );

        expect(result).toBe("fallback");
        expect(consoleSpy).toHaveBeenCalledWith(
            "[SHARED] load data failed",
            expect.objectContaining({ message: "boom" })
        );
    });

    it("rethrows when instructed to do so", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {
                /* noop – captured for assertions */
            });

        await expect(
            withUtilityErrorHandling(
                async () => {
                    throw new Error("fatal");
                },
                "dangerous",
                undefined,
                true
            )
        ).rejects.toThrow("fatal");

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "[SHARED] dangerous failed",
            expect.objectContaining({ message: "fatal" })
        );
    });

    it("throws informative error when fallback missing", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {
                /* noop – captured for assertions */
            });

        await expect(
            withUtilityErrorHandling(async () => {
                throw new Error("fatal");
            }, "dangerous")
        ).rejects.toThrow("dangerous failed and no fallback value provided");

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "[SHARED] dangerous failed",
            expect.objectContaining({ message: "fatal" })
        );
    });
});
