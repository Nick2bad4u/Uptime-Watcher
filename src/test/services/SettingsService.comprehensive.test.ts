/**
 * @file Comprehensive test suite for SettingsService
 *
 *   Tests all settings operations including history limit management, settings
 *   reset, initializat const limits = [ 0, 1, 100, 500, 1000, 5000, 10_000, ];r
 *   handling, and edge cases to achieve 95%+ coverage.
 *
 * @author Generated Test Suite
 *
 * @since 2024
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    DEFAULT_HISTORY_LIMIT_RULES,
    normalizeHistoryLimit,
} from "@shared/constants/history";
import { ensureError } from "@shared/utils/errorHandling";

import { SettingsService } from "../../services/SettingsService";

// Mock dependencies using vi.hoisted for proper initialization order
const mockWaitForElectronBridge = vi.hoisted(() => vi.fn());
const MockElectronBridgeNotReadyError = vi.hoisted(
    () =>
        class extends Error {
            public readonly diagnostics: unknown;

            public constructor(diagnostics: unknown) {
                super("Electron bridge not ready");
                this.name = "ElectronBridgeNotReadyError";
                this.diagnostics = diagnostics;
            }
        }
);
const mockLogger = vi.hoisted(() => ({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
}));

const mockElectronAPI = vi.hoisted(() => ({
    data: {},
    settings: {
        getHistoryLimit: vi.fn(),
        resetSettings: vi.fn(),
        updateHistoryLimit: vi.fn(),
    },
}));

// Mock modules
vi.mock("../../services/utils/electronBridgeReadiness", () => ({
    ElectronBridgeNotReadyError: MockElectronBridgeNotReadyError,
    waitForElectronBridge: mockWaitForElectronBridge,
}));

// Backwards-compatible alias for existing assertions

vi.mock("../../services/logger", () => ({
    logger: mockLogger,
}));

vi.mock("@shared/utils/errorHandling", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("@shared/utils/errorHandling")>();
    return {
        ...actual,
        ensureError: vi.fn(actual.ensureError),
    };
});

describe("SettingsService", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Reset mock implementations
        mockWaitForElectronBridge.mockResolvedValue(undefined);

        // Recreate fresh mocks for each test
        mockElectronAPI.data = {};
        mockElectronAPI.settings = {
            getHistoryLimit: vi.fn().mockResolvedValue(500),
            resetSettings: vi.fn().mockResolvedValue(undefined),
            updateHistoryLimit: vi.fn().mockResolvedValue(1000),
        };

        // Set up global window.electronAPI mock
        (globalThis as any).window = {
            electronAPI: mockElectronAPI,
        };
    });

    afterEach(() => {
        vi.resetAllMocks();
        delete (globalThis as any).window;
    });

    describe("Service Structure", () => {
        it("should expose all required methods", () => {
            expect(SettingsService).toBeDefined();
            expect(typeof SettingsService.initialize).toBe("function");
            expect(typeof SettingsService.getHistoryLimit).toBe("function");
            expect(typeof SettingsService.resetSettings).toBe("function");
            expect(typeof SettingsService.updateHistoryLimit).toBe("function");
        });
    });

    describe("initialize", () => {
        it("should initialize successfully when electron API is available", async () => {
            await expect(SettingsService.initialize()).resolves.toBeUndefined();
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it("should handle initialization errors and rethrow", async () => {
            const error = new Error("Electron API unavailable");
            mockWaitForElectronBridge.mockRejectedValue(error);

            await expect(SettingsService.initialize()).rejects.toThrowError(
                "Electron API unavailable"
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                "[SettingsService] Failed to initialize:",
                error
            );
        });

        it("should handle non-error initialization failures", async () => {
            const error = "String error";
            mockWaitForElectronBridge.mockRejectedValue(error);

            await expect(SettingsService.initialize()).rejects.toBe(error);
            expect(mockLogger.error).toHaveBeenCalled();
            expect(vi.mocked(ensureError)).toHaveBeenCalledWith(error);
        });

        it("should handle null/undefined initialization errors", async () => {
            mockWaitForElectronBridge.mockRejectedValue(null);

            await expect(SettingsService.initialize()).rejects.toBeNull();
            expect(mockLogger.error).toHaveBeenCalled();
            expect(vi.mocked(ensureError)).toHaveBeenCalledWith(null);
        });
    });

    describe("getHistoryLimit", () => {
        it("should get history limit successfully after initialization", async () => {
            const expectedLimit = 750;
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValue(
                expectedLimit
            );

            const result = await SettingsService.getHistoryLimit();

            expect(result).toBe(expectedLimit);
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(
                mockElectronAPI.settings.getHistoryLimit
            ).toHaveBeenCalledTimes(1);
        });

        it("should fail if initialization fails", async () => {
            const error = new Error("Initialization failed");
            mockWaitForElectronBridge.mockRejectedValue(error);

            await expect(
                SettingsService.getHistoryLimit()
            ).rejects.toThrowError("Initialization failed");
            expect(
                mockElectronAPI.settings.getHistoryLimit
            ).not.toHaveBeenCalled();
        });

        it("should handle getHistoryLimit API errors", async () => {
            const error = new Error("Failed to get history limit");
            mockElectronAPI.settings.getHistoryLimit.mockRejectedValue(error);

            await expect(
                SettingsService.getHistoryLimit()
            ).rejects.toThrowError("Failed to get history limit");
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(
                mockElectronAPI.settings.getHistoryLimit
            ).toHaveBeenCalledTimes(1);
        });

        it("should handle different history limit values", async () => {
            const limits = [
                0,
                1,
                100,
                500,
                1000,
                10_000,
                999_999,
            ];

            for (const limit of limits) {
                mockElectronAPI.settings.getHistoryLimit.mockResolvedValueOnce(
                    limit
                );
                mockLogger.warn.mockClear();

                const result = await SettingsService.getHistoryLimit();
                const expected = normalizeHistoryLimit(
                    limit,
                    DEFAULT_HISTORY_LIMIT_RULES
                );

                expect(result).toBe(expected);
                expect(mockLogger.warn).not.toHaveBeenCalled();
            }

            expect(
                mockElectronAPI.settings.getHistoryLimit
            ).toHaveBeenCalledTimes(limits.length);
        });

        it("should handle negative and unusual numeric values", async () => {
            const defaultLimit = DEFAULT_HISTORY_LIMIT_RULES.defaultLimit;
            const cases: {
                readonly expected: number;
                readonly expectWarn: boolean;
                readonly value: number;
            }[] = [
                { value: -1, expected: 0, expectWarn: false },
                { value: -999, expected: 0, expectWarn: false },
                {
                    value: Number.NEGATIVE_INFINITY,
                    expected: defaultLimit,
                    expectWarn: true,
                },
                {
                    value: Number.POSITIVE_INFINITY,
                    expected: defaultLimit,
                    expectWarn: true,
                },
                { value: Number.NaN, expected: defaultLimit, expectWarn: true },
            ];

            for (const { expected, expectWarn, value } of cases) {
                mockLogger.warn.mockClear();
                mockElectronAPI.settings.getHistoryLimit.mockResolvedValueOnce(
                    value
                );

                const result = await SettingsService.getHistoryLimit();

                expect(result).toBe(expected);

                if (expectWarn) {
                    expect(mockLogger.warn).toHaveBeenCalledWith(
                        "Received invalid history limit from backend; defaulting to shared rule",
                        expect.objectContaining({
                            error: expect.any(String),
                            receivedValue: value,
                        })
                    );
                } else {
                    expect(mockLogger.warn).not.toHaveBeenCalled();
                }
            }
        });
    });

    describe("resetSettings", () => {
        it("should reset settings successfully after initialization", async () => {
            await expect(
                SettingsService.resetSettings()
            ).resolves.toBeUndefined();
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(
                mockElectronAPI.settings.resetSettings
            ).toHaveBeenCalledTimes(1);
        });

        it("should fail if initialization fails", async () => {
            const error = new Error("Initialization failed");
            mockWaitForElectronBridge.mockRejectedValue(error);

            await expect(SettingsService.resetSettings()).rejects.toThrowError(
                "Initialization failed"
            );
            expect(
                mockElectronAPI.settings.resetSettings
            ).not.toHaveBeenCalled();
        });

        it("should handle resetSettings API errors", async () => {
            const error = new Error("Failed to reset settings");
            mockElectronAPI.settings.resetSettings.mockRejectedValue(error);

            await expect(SettingsService.resetSettings()).rejects.toThrowError(
                "Failed to reset settings"
            );
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(
                mockElectronAPI.settings.resetSettings
            ).toHaveBeenCalledTimes(1);
        });

        it("should handle multiple reset calls", async () => {
            await SettingsService.resetSettings();
            await SettingsService.resetSettings();
            await SettingsService.resetSettings();

            expect(
                mockElectronAPI.settings.resetSettings
            ).toHaveBeenCalledTimes(3);
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(3);
        });
    });

    describe("updateHistoryLimit", () => {
        it("should update history limit successfully after initialization", async () => {
            const newLimit = 2000;
            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValue(
                newLimit
            );

            await expect(
                SettingsService.updateHistoryLimit(newLimit)
            ).resolves.toBe(newLimit);
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(
                mockElectronAPI.settings.updateHistoryLimit
            ).toHaveBeenCalledWith(newLimit);
        });

        it("should fail if initialization fails", async () => {
            const error = new Error("Initialization failed");
            mockWaitForElectronBridge.mockRejectedValue(error);

            await expect(
                SettingsService.updateHistoryLimit(1000)
            ).rejects.toThrowError("Initialization failed");
            expect(
                mockElectronAPI.settings.updateHistoryLimit
            ).not.toHaveBeenCalled();
        });

        it("should handle updateHistoryLimit API errors", async () => {
            const error = new Error("Failed to update history limit");
            mockElectronAPI.settings.updateHistoryLimit.mockRejectedValue(
                error
            );

            await expect(
                SettingsService.updateHistoryLimit(1000)
            ).rejects.toThrowError("Failed to update history limit");
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(
                mockElectronAPI.settings.updateHistoryLimit
            ).toHaveBeenCalledWith(1000);
        });

        it("should handle different limit values", async () => {
            const limits = [
                0,
                1,
                50,
                100,
                500,
                1000,
                5000,
                10_000,
            ];

            for (const limit of limits) {
                mockElectronAPI.settings.updateHistoryLimit.mockResolvedValueOnce(
                    limit
                );
                const expectedLimit = normalizeHistoryLimit(
                    limit,
                    DEFAULT_HISTORY_LIMIT_RULES
                );
                const result = await SettingsService.updateHistoryLimit(limit);
                expect(
                    mockElectronAPI.settings.updateHistoryLimit
                ).toHaveBeenCalledWith(limit);
                expect(result).toBe(expectedLimit);
            }

            expect(
                mockElectronAPI.settings.updateHistoryLimit
            ).toHaveBeenCalledTimes(limits.length);
        });

        it("should handle edge case limit values", async () => {
            const resolvableEdgeCases = [
                -1,
                0,
                999_999,
            ];
            for (const limit of resolvableEdgeCases) {
                mockElectronAPI.settings.updateHistoryLimit.mockResolvedValueOnce(
                    limit
                );
                const expectedLimit = normalizeHistoryLimit(
                    limit,
                    DEFAULT_HISTORY_LIMIT_RULES
                );
                const result = await SettingsService.updateHistoryLimit(limit);
                expect(
                    mockElectronAPI.settings.updateHistoryLimit
                ).toHaveBeenCalledWith(limit);
                expect(result).toBe(expectedLimit);
            }

            const rejectingEdgeCases = [
                Number.POSITIVE_INFINITY,
                Number.NEGATIVE_INFINITY,
            ];

            for (const limit of rejectingEdgeCases) {
                mockLogger.warn.mockClear();
                mockElectronAPI.settings.updateHistoryLimit.mockResolvedValueOnce(
                    limit
                );

                await expect(
                    SettingsService.updateHistoryLimit(limit)
                ).rejects.toThrowError(RangeError);

                expect(mockLogger.warn).toHaveBeenCalledWith(
                    "History limit update rejected: requested limit could not be normalised",
                    expect.objectContaining({
                        error: expect.any(String),
                        receivedValue: limit,
                        requestedLimit: limit,
                    })
                );
            }
        });

        it("should handle non-integer values", async () => {
            const floatValues = [
                1.5,
                999.99,
                0.1,
                -1.5,
            ];

            for (const limit of floatValues) {
                mockElectronAPI.settings.updateHistoryLimit.mockResolvedValueOnce(
                    Math.floor(limit)
                );
                const result = await SettingsService.updateHistoryLimit(limit);
                expect(
                    mockElectronAPI.settings.updateHistoryLimit
                ).toHaveBeenCalledWith(limit);
                const expectedLimit = normalizeHistoryLimit(
                    Math.floor(limit),
                    DEFAULT_HISTORY_LIMIT_RULES
                );
                expect(result).toBe(expectedLimit);
            }
        });
    });

    describe("Integration Testing", () => {
        it("should handle multiple operations in sequence", async () => {
            // Get initial limit
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValueOnce(500);
            const initialLimit = await SettingsService.getHistoryLimit();
            expect(initialLimit).toBe(500);

            // Update limit
            const newLimit = 1000;
            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValueOnce(
                newLimit
            );
            await SettingsService.updateHistoryLimit(newLimit);

            // Get updated limit
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValueOnce(
                newLimit
            );
            const updatedLimit = await SettingsService.getHistoryLimit();
            expect(updatedLimit).toBe(newLimit);

            // Reset settings
            await SettingsService.resetSettings();

            // Get limit after reset
            mockElectronAPI.settings.getHistoryLimit.mockResolvedValueOnce(500);
            const resetLimit = await SettingsService.getHistoryLimit();
            expect(resetLimit).toBe(500);

            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(5);
        });

        it("should handle concurrent operations", async () => {
            const promises = [
                SettingsService.getHistoryLimit(),
                SettingsService.updateHistoryLimit(1500),
                SettingsService.getHistoryLimit(),
            ];

            await Promise.all(promises);

            // Concurrent operations share a single in-flight initialization.
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(
                mockElectronAPI.settings.getHistoryLimit
            ).toHaveBeenCalledTimes(2);
            expect(
                mockElectronAPI.settings.updateHistoryLimit
            ).toHaveBeenCalledTimes(1);
        });

        it("should handle repeated initialization calls gracefully", async () => {
            await SettingsService.initialize();
            await SettingsService.initialize();
            await SettingsService.initialize();

            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(3);
        });

        it("should handle mixed initialization and operation calls", async () => {
            await SettingsService.initialize();
            await SettingsService.getHistoryLimit();
            await SettingsService.initialize();
            await SettingsService.updateHistoryLimit(2000);

            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(4); // 2 explicit + 2 from operations
            expect(
                mockElectronAPI.settings.getHistoryLimit
            ).toHaveBeenCalledTimes(1);
            expect(
                mockElectronAPI.settings.updateHistoryLimit
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe("Error Edge Cases", () => {
        it("should handle electron API method throwing synchronously", async () => {
            mockElectronAPI.settings.getHistoryLimit.mockImplementation(() => {
                throw new Error("Synchronous error");
            });

            await expect(
                SettingsService.getHistoryLimit()
            ).rejects.toThrowError("Synchronous error");
        });

        it("should handle missing electron API methods gracefully", async () => {
            mockElectronAPI.settings.getHistoryLimit.mockImplementation(() => {
                throw new TypeError("Cannot read properties of undefined");
            });

            await expect(
                SettingsService.getHistoryLimit()
            ).rejects.toThrowError();
        });

        it("should handle partial electron API gracefully", async () => {
            mockElectronAPI.settings.getHistoryLimit.mockImplementation(() => {
                throw new TypeError("Cannot read properties of undefined");
            });
            mockElectronAPI.settings.resetSettings.mockImplementation(() => {
                throw new TypeError("Cannot read properties of undefined");
            });
            mockElectronAPI.settings.updateHistoryLimit.mockImplementation(
                () => {
                    throw new TypeError("Cannot read properties of undefined");
                }
            );

            await expect(
                SettingsService.getHistoryLimit()
            ).rejects.toThrowError();
            await expect(
                SettingsService.resetSettings()
            ).rejects.toThrowError();
            await expect(
                SettingsService.updateHistoryLimit(100)
            ).rejects.toThrowError();
        });

        it("should handle database-like errors in operations", async () => {
            const databaseErrors = [
                new Error("Database locked"),
                new Error("Connection timeout"),
                new Error("Transaction failed"),
                new Error("Constraint violation"),
            ];

            for (const error of databaseErrors) {
                mockElectronAPI.settings.getHistoryLimit.mockRejectedValueOnce(
                    error
                );
                await expect(
                    SettingsService.getHistoryLimit()
                ).rejects.toThrowError(error.message);
            }
        });

        it("should handle file system and permission errors", async () => {
            const fsErrors = [
                new Error("EACCES: permission denied"),
                new Error("ENOSPC: no space left on device"),
                new Error("EMFILE: too many open files"),
                new Error("EROFS: read-only file system"),
            ];

            for (const error of fsErrors) {
                mockElectronAPI.settings.resetSettings.mockRejectedValueOnce(
                    error
                );
                await expect(
                    SettingsService.resetSettings()
                ).rejects.toThrowError(error.message);
            }
        });
    });

    describe("Data Validation Edge Cases", () => {
        it("should handle unexpected return types from getHistoryLimit", async () => {
            const unexpectedValues = [
                null,
                undefined,
                "string",
                {},
                [],
                true,
                false,
            ];

            for (const value of unexpectedValues) {
                mockLogger.warn.mockClear();
                mockElectronAPI.settings.getHistoryLimit.mockResolvedValueOnce(
                    value
                );
                const result = await SettingsService.getHistoryLimit();
                expect(result).toBe(DEFAULT_HISTORY_LIMIT_RULES.defaultLimit);
                expect(mockLogger.warn).toHaveBeenCalledWith(
                    "Received invalid history limit from backend; defaulting to shared rule",
                    expect.objectContaining({
                        error: expect.any(String),
                        receivedValue: value,
                    })
                );
            }
        });

        it("should handle extremely large limit values", async () => {
            const validLargeLimits = [
                DEFAULT_HISTORY_LIMIT_RULES.maxLimit,
                10_000_000_000,
                9_999_999_999,
            ];

            for (const limit of validLargeLimits) {
                mockLogger.warn.mockClear();
                mockElectronAPI.settings.updateHistoryLimit.mockResolvedValueOnce(
                    limit
                );

                const result = await SettingsService.updateHistoryLimit(limit);

                expect(result).toBe(
                    normalizeHistoryLimit(limit, DEFAULT_HISTORY_LIMIT_RULES)
                );
                expect(
                    mockElectronAPI.settings.updateHistoryLimit
                ).toHaveBeenCalledWith(limit);
                expect(mockLogger.warn).not.toHaveBeenCalled();
            }

            mockElectronAPI.settings.updateHistoryLimit.mockResolvedValueOnce(
                Number.MAX_VALUE
            );

            await expect(
                SettingsService.updateHistoryLimit(Number.MAX_VALUE)
            ).rejects.toThrowError(TypeError);

            expect(mockLogger.warn).toHaveBeenCalledWith(
                "History limit update rejected: requested limit could not be normalised",
                expect.objectContaining({
                    error: expect.any(String),
                    receivedValue: Number.MAX_VALUE,
                    requestedLimit: Number.MAX_VALUE,
                })
            );
        });

        it("should handle special numeric values", async () => {
            const specialValues = [
                Number.NaN,
                Infinity,
                -Infinity,
                0,
                -0,
            ];

            for (const value of specialValues) {
                mockLogger.warn.mockClear();

                if (Number.isFinite(value) && Number.isInteger(value)) {
                    mockElectronAPI.settings.updateHistoryLimit.mockResolvedValueOnce(
                        value
                    );
                    const result =
                        await SettingsService.updateHistoryLimit(value);
                    expect(
                        mockElectronAPI.settings.updateHistoryLimit
                    ).toHaveBeenCalledWith(value);
                    expect(result).toBe(
                        normalizeHistoryLimit(
                            value,
                            DEFAULT_HISTORY_LIMIT_RULES
                        )
                    );
                    expect(mockLogger.warn).not.toHaveBeenCalled();
                } else {
                    mockElectronAPI.settings.updateHistoryLimit.mockResolvedValueOnce(
                        value as number
                    );
                    await expect(
                        SettingsService.updateHistoryLimit(value)
                    ).rejects.toThrowError();
                    expect(
                        mockElectronAPI.settings.updateHistoryLimit
                    ).toHaveBeenCalledWith(value);
                    expect(mockLogger.warn).toHaveBeenCalledWith(
                        "History limit update rejected: requested limit could not be normalised",
                        expect.objectContaining({
                            error: expect.any(String),
                            receivedValue: value,
                            requestedLimit: value,
                        })
                    );
                }
            }
        });

        it("should handle API returning unexpected promise resolutions", async () => {
            // Test when updateHistoryLimit returns different types
            const returnValues = [
                null,
                undefined,
                "success",
                {},
                [],
                42,
            ];

            for (const returnValue of returnValues) {
                mockLogger.warn.mockClear();
                mockElectronAPI.settings.updateHistoryLimit.mockResolvedValueOnce(
                    returnValue
                );
                const expectedResult =
                    typeof returnValue === "number" &&
                    Number.isFinite(returnValue)
                        ? normalizeHistoryLimit(
                              returnValue,
                              DEFAULT_HISTORY_LIMIT_RULES
                          )
                        : normalizeHistoryLimit(
                              100,
                              DEFAULT_HISTORY_LIMIT_RULES
                          );
                await expect(
                    SettingsService.updateHistoryLimit(100)
                ).resolves.toBe(expectedResult);

                if (
                    typeof returnValue === "number" &&
                    Number.isFinite(returnValue)
                ) {
                    expect(mockLogger.warn).not.toHaveBeenCalled();
                } else {
                    expect(mockLogger.warn).toHaveBeenCalledWith(
                        "Received invalid history limit from backend; falling back to requested value",
                        expect.objectContaining({
                            error: expect.stringContaining("History limit"),
                            receivedValue: returnValue,
                            requestedLimit: 100,
                        })
                    );
                }
            }
        });
    });

    describe("Performance and Load Testing", () => {
        it("should handle rapid successive calls", async () => {
            const calls = Array.from({ length: 100 }, (_, i) => i);

            const promises = calls.map((i) => {
                mockElectronAPI.settings.getHistoryLimit.mockResolvedValueOnce(
                    i
                );
                return SettingsService.getHistoryLimit();
            });

            const results = await Promise.all(promises);

            expect(results).toHaveLength(100);
            expect(
                mockElectronAPI.settings.getHistoryLimit
            ).toHaveBeenCalledTimes(100);
        });

        it("should handle mixed rapid operations", async () => {
            const operations = [
                () => SettingsService.getHistoryLimit(),
                () =>
                    SettingsService.updateHistoryLimit(
                        Math.floor(Math.random() * 1000)
                    ),
                () => SettingsService.resetSettings(),
            ];

            const promises = Array.from({ length: 30 }, (_, i) => {
                const operation = operations[i % operations.length];
                if (!operation) {
                    throw new Error("Operation is undefined");
                }
                return operation();
            });

            await Promise.all(promises);

            // All operations are created in the same tick; they share a single
            // in-flight initialization check.
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
        });
    });
});
