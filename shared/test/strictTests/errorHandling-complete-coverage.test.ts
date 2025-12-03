/**
 * Comprehensive coverage for shared error handling utilities.
 */

import { afterEach, describe, expect, it, vi } from "vitest";

import {
    ApplicationError,
    convertError,
    ensureError,
    withErrorHandling,
    withUtilityErrorHandling,
    type ErrorHandlingBackendContext,
    type ErrorHandlingFrontendStore,
} from "@shared/utils/errorHandling";

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

    it("handles non-serializable causes gracefully", () => {
        const circular: Record<string, unknown> = {};
        circular["self"] = circular;

        const error = new ApplicationError({
            cause: circular,
            code: "E_CIRCULAR",
            message: "Circular",
        });

        expect(error.cause).toBeInstanceOf(Error);
        expect((error.cause as Error).message).toBe("[unserializable:object]");
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
});

describe(convertError, () => {
    it("returns the original error when already an Error", () => {
        const original = new Error("existing");
        const result = convertError(original);

        expect(result.wasError).toBeTruthy();
        expect(result.error).toBe(original);
    });

    it("provides informative messages for whitespace strings", () => {
        const result = convertError("   ");

        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toBe("[whitespace-only string]");
        expect(result.originalType).toBe("string");
    });

    it("falls back when string conversion fails", () => {
        const problematic: Record<string, unknown> & {
            toString: () => never;
        } = {
            toString: () => {
                throw new Error("toString broke");
            },
        };
        problematic["self"] = problematic;

        const result = convertError(problematic);

        expect(result.error.message).toBe(
            "[object cannot be converted to string]"
        );
        expect(result.originalType).toBe("object");
        expect(result.wasError).toBeFalsy();
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
        ).rejects.toThrowError("frontend fail");

        expect(store.clearError).toHaveBeenCalledTimes(1);
        expect(store.setLoading).toHaveBeenCalledTimes(2);
        expect(store.setError).toHaveBeenCalledTimes(1);
        expect(store.setError).toHaveBeenCalledWith("frontend fail");
        expect(warnSpy).toHaveBeenCalledTimes(4);
        expect(errorSpy).toHaveBeenCalledWith(
            "Original operation error:",
            expect.any(Error)
        );
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
        ).rejects.toThrowError("backend fail");

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
        ).rejects.toThrowError("operation fail");

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Failed to sync",
            expect.any(Error)
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            "Logger error during error handling:",
            expect.any(Error)
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
            "load data failed",
            expect.any(Error)
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
        ).rejects.toThrowError("fatal");

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "dangerous failed",
            expect.any(Error)
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
        ).rejects.toThrowError(
            "dangerous failed and no fallback value provided"
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "dangerous failed",
            expect.any(Error)
        );
    });
});
