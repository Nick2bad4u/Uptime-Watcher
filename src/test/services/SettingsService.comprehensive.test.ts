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
const mockWaitForElectronAPI = mockWaitForElectronBridge;

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
        mockWaitForElectronAPI.mockResolvedValue(undefined);

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
            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(1);
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it("should handle initialization errors and rethrow", async () => {
            const error = new Error("Electron API unavailable");
            mockWaitForElectronAPI.mockRejectedValue(error);

            await expect(SettingsService.initialize()).rejects.toThrow(
                "Electron API unavailable"
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                "[SettingsService] Failed to initialize:",
                error
            );
        });

        it("should handle non-error initialization failures", async () => {
            const error = "String error";
            mockWaitForElectronAPI.mockRejectedValue(error);

            await expect(SettingsService.initialize()).rejects.toBe(error);
            expect(mockLogger.error).toHaveBeenCalled();
            expect(vi.mocked(ensureError)).toHaveBeenCalledWith(error);
        });

        it("should handle null/undefined initialization errors", async () => {
            mockWaitForElectronAPI.mockRejectedValue(null);

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
            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(1);
            expect(
                mockElectronAPI.settings.getHistoryLimit
            ).toHaveBeenCalledTimes(1);
        });

        it("should fail if initialization fails", async () => {
            const error = new Error("Initialization failed");
            mockWaitForElectronAPI.mockRejectedValue(error);

            await expect(SettingsService.getHistoryLimit()).rejects.toThrow(
                "Initialization failed"
            );
            expect(
                mockElectronAPI.settings.getHistoryLimit
            ).not.toHaveBeenCalled();
        });

        it("should handle getHistoryLimit API errors", async () => {
            const error = new Error("Failed to get history limit");
            mockElectronAPI.settings.getHistoryLimit.mockRejectedValue(error);

            await expect(SettingsService.getHistoryLimit()).rejects.toThrow(
                "Failed to get history limit"
            );
            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(1);
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
                const result = await SettingsService.getHistoryLimit();
                expect(result).toBe(limit);
            }

            expect(
                mockElectronAPI.settings.getHistoryLimit
            ).toHaveBeenCalledTimes(limits.length);
        });

        it("should handle negative and unusual numeric values", async () => {
            const unusualValues = [
                -1,
                -999,
                Infinity,
                -Infinity,
                Number.NaN,
            ];

            for (const value of unusualValues) {
                mockElectronAPI.settings.getHistoryLimit.mockResolvedValueOnce(
                    value
                );
                const result = await SettingsService.getHistoryLimit();

                if (Number.isNaN(value)) {
                    expect(Number.isNaN(result)).toBeTruthy();
                } else {
                    expect(result).toBe(value);
                }
            }
        });
    });

    describe("resetSettings", () => {
        it("should reset settings successfully after initialization", async () => {
            await expect(
                SettingsService.resetSettings()
            ).resolves.toBeUndefined();
            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(1);
            expect(
                mockElectronAPI.settings.resetSettings
            ).toHaveBeenCalledTimes(1);
        });

        it("should fail if initialization fails", async () => {
            const error = new Error("Initialization failed");
            mockWaitForElectronAPI.mockRejectedValue(error);

            await expect(SettingsService.resetSettings()).rejects.toThrow(
                "Initialization failed"
            );
            expect(
                mockElectronAPI.settings.resetSettings
            ).not.toHaveBeenCalled();
        });

        it("should handle resetSettings API errors", async () => {
            const error = new Error("Failed to reset settings");
            mockElectronAPI.settings.resetSettings.mockRejectedValue(error);

            await expect(SettingsService.resetSettings()).rejects.toThrow(
                "Failed to reset settings"
            );
            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(1);
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
            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(3);
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
            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(1);
            expect(
                mockElectronAPI.settings.updateHistoryLimit
            ).toHaveBeenCalledWith(newLimit);
        });

        it("should fail if initialization fails", async () => {
            const error = new Error("Initialization failed");
            mockWaitForElectronAPI.mockRejectedValue(error);

            await expect(
                SettingsService.updateHistoryLimit(1000)
            ).rejects.toThrow("Initialization failed");
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
            ).rejects.toThrow("Failed to update history limit");
            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(1);
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
                const result = await SettingsService.updateHistoryLimit(limit);
                expect(
                    mockElectronAPI.settings.updateHistoryLimit
                ).toHaveBeenCalledWith(limit);
                expect(result).toBe(limit);
            }

            expect(
                mockElectronAPI.settings.updateHistoryLimit
            ).toHaveBeenCalledTimes(limits.length);
        });

        it("should handle edge case limit values", async () => {
            const edgeCases = [
                -1,
                0,
                999_999,
                Infinity,
                -Infinity,
            ];

            for (const limit of edgeCases) {
                mockElectronAPI.settings.updateHistoryLimit.mockResolvedValueOnce(
                    limit
                );
                const result = await SettingsService.updateHistoryLimit(limit);
                expect(
                    mockElectronAPI.settings.updateHistoryLimit
                ).toHaveBeenCalledWith(limit);
                expect(result).toBe(limit);
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
                expect(result).toBe(Math.floor(limit));
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

            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(5);
        });

        it("should handle concurrent operations", async () => {
            const promises = [
                SettingsService.getHistoryLimit(),
                SettingsService.updateHistoryLimit(1500),
                SettingsService.getHistoryLimit(),
            ];

            await Promise.all(promises);

            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(3);
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

            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(3);
        });

        it("should handle mixed initialization and operation calls", async () => {
            await SettingsService.initialize();
            await SettingsService.getHistoryLimit();
            await SettingsService.initialize();
            await SettingsService.updateHistoryLimit(2000);

            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(4); // 2 explicit + 2 from operations
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

            await expect(SettingsService.getHistoryLimit()).rejects.toThrow(
                "Synchronous error"
            );
        });

        it("should handle missing electron API methods gracefully", async () => {
            mockElectronAPI.settings.getHistoryLimit.mockImplementation(() => {
                throw new TypeError("Cannot read properties of undefined");
            });

            await expect(SettingsService.getHistoryLimit()).rejects.toThrow();
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

            await expect(SettingsService.getHistoryLimit()).rejects.toThrow();
            await expect(SettingsService.resetSettings()).rejects.toThrow();
            await expect(
                SettingsService.updateHistoryLimit(100)
            ).rejects.toThrow();
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
                await expect(SettingsService.getHistoryLimit()).rejects.toThrow(
                    error.message
                );
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
                await expect(SettingsService.resetSettings()).rejects.toThrow(
                    error.message
                );
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
                mockElectronAPI.settings.getHistoryLimit.mockResolvedValueOnce(
                    value
                );
                const result = await SettingsService.getHistoryLimit();
                expect(result).toBe(value);
            }
        });

        it("should handle extremely large limit values", async () => {
            const largeLimits = [
                Number.MAX_SAFE_INTEGER,
                Number.MAX_VALUE,
                1e10,
                9_999_999_999,
            ];

            for (const limit of largeLimits) {
                mockElectronAPI.settings.updateHistoryLimit.mockResolvedValueOnce(
                    limit
                );
                await SettingsService.updateHistoryLimit(limit);
                expect(
                    mockElectronAPI.settings.updateHistoryLimit
                ).toHaveBeenCalledWith(limit);
            }
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
                if (Number.isNaN(value)) {
                    mockElectronAPI.settings.updateHistoryLimit.mockResolvedValueOnce(
                        Number.NaN
                    );
                    await SettingsService.updateHistoryLimit(value);
                    expect(
                        mockElectronAPI.settings.updateHistoryLimit
                    ).toHaveBeenCalledWith(value);
                } else {
                    mockElectronAPI.settings.updateHistoryLimit.mockResolvedValueOnce(
                        value
                    );
                    await SettingsService.updateHistoryLimit(value);
                    expect(
                        mockElectronAPI.settings.updateHistoryLimit
                    ).toHaveBeenCalledWith(value);
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
                        ? returnValue
                        : 100;
                await expect(
                    SettingsService.updateHistoryLimit(100)
                ).resolves.toBe(expectedResult);

                if (expectedResult === returnValue) {
                    expect(mockLogger.warn).not.toHaveBeenCalled();
                } else {
                    expect(mockLogger.warn).toHaveBeenCalledWith(
                        "Received invalid history limit from backend; falling back to requested value",
                        expect.objectContaining({
                            receivedValue: returnValue,
                            requestedLimit: 100,
                            sanitizedLimit: expectedResult,
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

            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(30);
        });
    });
});
