/**
 * @file Test suite for historyLimitManager.ts
 * @description Tests for history limit management utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setHistoryLimit, getHistoryLimit } from "../../../utils/database/historyLimitManager";
import type { HistoryRepository, SettingsRepository } from "../../../services/database";

// Mock repositories
const mockHistoryRepository = {
    pruneAllHistory: vi.fn(),
} as unknown as HistoryRepository;

const mockSettingsRepository = {
    set: vi.fn(),
} as unknown as SettingsRepository;

// Mock logger
const mockLogger = {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
};

describe("historyLimitManager", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("setHistoryLimit", () => {
        it("should set history limit with valid positive value", async () => {
            const setHistoryLimitCallback = vi.fn();
            const limit = 100;

            await setHistoryLimit({
                limit,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                setHistoryLimit: setHistoryLimitCallback,
                logger: mockLogger,
            });

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(limit);
            expect(mockSettingsRepository.set).toHaveBeenCalledWith("historyLimit", limit.toString());
            expect(mockHistoryRepository.pruneAllHistory).toHaveBeenCalledWith(limit);
            expect(mockLogger.debug).toHaveBeenCalledWith(`History limit set to ${limit}`);
            expect(mockLogger.debug).toHaveBeenCalledWith(`Pruned history to ${limit} entries per monitor`);
        });

        it("should set minimum limit of 10 for small positive values", async () => {
            const setHistoryLimitCallback = vi.fn();
            const limit = 5;
            const expectedLimit = 10;

            await setHistoryLimit({
                limit,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                setHistoryLimit: setHistoryLimitCallback,
                logger: mockLogger,
            });

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(expectedLimit);
            expect(mockSettingsRepository.set).toHaveBeenCalledWith("historyLimit", expectedLimit.toString());
            expect(mockHistoryRepository.pruneAllHistory).toHaveBeenCalledWith(expectedLimit);
            expect(mockLogger.debug).toHaveBeenCalledWith(`History limit set to ${expectedLimit}`);
        });

        it("should set limit to 0 for negative values without pruning", async () => {
            const setHistoryLimitCallback = vi.fn();
            const limit = -5;
            const expectedLimit = 0;

            await setHistoryLimit({
                limit,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                setHistoryLimit: setHistoryLimitCallback,
                logger: mockLogger,
            });

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(expectedLimit);
            expect(mockSettingsRepository.set).toHaveBeenCalledWith("historyLimit", expectedLimit.toString());
            expect(mockHistoryRepository.pruneAllHistory).not.toHaveBeenCalled();
            expect(mockLogger.debug).toHaveBeenCalledWith(`History limit set to ${expectedLimit}`);
            expect(mockLogger.debug).not.toHaveBeenCalledWith(expect.stringContaining("Pruned history"));
        });

        it("should set limit to 0 for zero value without pruning", async () => {
            const setHistoryLimitCallback = vi.fn();
            const limit = 0;
            const expectedLimit = 0;

            await setHistoryLimit({
                limit,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                setHistoryLimit: setHistoryLimitCallback,
                logger: mockLogger,
            });

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(expectedLimit);
            expect(mockSettingsRepository.set).toHaveBeenCalledWith("historyLimit", expectedLimit.toString());
            expect(mockHistoryRepository.pruneAllHistory).not.toHaveBeenCalled();
            expect(mockLogger.debug).toHaveBeenCalledWith(`History limit set to ${expectedLimit}`);
            expect(mockLogger.debug).not.toHaveBeenCalledWith(expect.stringContaining("Pruned history"));
        });

        it("should work without logger", async () => {
            const setHistoryLimitCallback = vi.fn();
            const limit = 50;

            await setHistoryLimit({
                limit,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                setHistoryLimit: setHistoryLimitCallback,
            });

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(limit);
            expect(mockSettingsRepository.set).toHaveBeenCalledWith("historyLimit", limit.toString());
            expect(mockHistoryRepository.pruneAllHistory).toHaveBeenCalledWith(limit);
            expect(mockLogger.debug).not.toHaveBeenCalled();
        });

        it("should handle settings repository errors gracefully", async () => {
            const setHistoryLimitCallback = vi.fn();
            const limit = 100;
            const settingsError = new Error("Settings save failed");

            mockSettingsRepository.set = vi.fn().mockRejectedValue(settingsError);

            await expect(
                setHistoryLimit({
                    limit,
                    repositories: {
                        history: mockHistoryRepository,
                        settings: mockSettingsRepository,
                    },
                    setHistoryLimit: setHistoryLimitCallback,
                    logger: mockLogger,
                })
            ).rejects.toThrow(settingsError);

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(limit);
            expect(mockSettingsRepository.set).toHaveBeenCalledWith("historyLimit", limit.toString());
        });

        it("should handle history repository errors gracefully", async () => {
            const setHistoryLimitCallback = vi.fn();
            const limit = 100;
            const historyError = new Error("History pruning failed");

            mockHistoryRepository.pruneAllHistory = vi.fn().mockRejectedValue(historyError);

            await expect(
                setHistoryLimit({
                    limit,
                    repositories: {
                        history: mockHistoryRepository,
                        settings: mockSettingsRepository,
                    },
                    setHistoryLimit: setHistoryLimitCallback,
                    logger: mockLogger,
                })
            ).rejects.toThrow(historyError);

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(limit);
            expect(mockSettingsRepository.set).toHaveBeenCalledWith("historyLimit", limit.toString());
            expect(mockHistoryRepository.pruneAllHistory).toHaveBeenCalledWith(limit);
        });

        it("should handle large limit values", async () => {
            const setHistoryLimitCallback = vi.fn();
            const limit = 999999;

            await setHistoryLimit({
                limit,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                setHistoryLimit: setHistoryLimitCallback,
                logger: mockLogger,
            });

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(limit);
            expect(mockSettingsRepository.set).toHaveBeenCalledWith("historyLimit", limit.toString());
            expect(mockHistoryRepository.pruneAllHistory).toHaveBeenCalledWith(limit);
        });

        it("should handle float values by using them as-is", async () => {
            const setHistoryLimitCallback = vi.fn();
            const limit = 50.7;

            await setHistoryLimit({
                limit,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                setHistoryLimit: setHistoryLimitCallback,
                logger: mockLogger,
            });

            expect(setHistoryLimitCallback).toHaveBeenCalledWith(limit);
            expect(mockSettingsRepository.set).toHaveBeenCalledWith("historyLimit", limit.toString());
            expect(mockHistoryRepository.pruneAllHistory).toHaveBeenCalledWith(limit);
        });
    });

    describe("getHistoryLimit", () => {
        it("should return current history limit from callback", () => {
            const expectedLimit = 250;
            const getHistoryLimitCallback = vi.fn().mockReturnValue(expectedLimit);

            const result = getHistoryLimit(getHistoryLimitCallback);

            expect(result).toBe(expectedLimit);
            expect(getHistoryLimitCallback).toHaveBeenCalledOnce();
        });

        it("should return zero limit", () => {
            const expectedLimit = 0;
            const getHistoryLimitCallback = vi.fn().mockReturnValue(expectedLimit);

            const result = getHistoryLimit(getHistoryLimitCallback);

            expect(result).toBe(expectedLimit);
            expect(getHistoryLimitCallback).toHaveBeenCalledOnce();
        });

        it("should return negative limit if callback returns one", () => {
            const expectedLimit = -1;
            const getHistoryLimitCallback = vi.fn().mockReturnValue(expectedLimit);

            const result = getHistoryLimit(getHistoryLimitCallback);

            expect(result).toBe(expectedLimit);
            expect(getHistoryLimitCallback).toHaveBeenCalledOnce();
        });

        it("should return large limit values", () => {
            const expectedLimit = 999999;
            const getHistoryLimitCallback = vi.fn().mockReturnValue(expectedLimit);

            const result = getHistoryLimit(getHistoryLimitCallback);

            expect(result).toBe(expectedLimit);
            expect(getHistoryLimitCallback).toHaveBeenCalledOnce();
        });

        it("should work with callback that returns undefined", () => {
            const getHistoryLimitCallback = vi.fn().mockReturnValue(undefined);

            const result = getHistoryLimit(getHistoryLimitCallback);

            expect(result).toBeUndefined();
            expect(getHistoryLimitCallback).toHaveBeenCalledOnce();
        });
    });

    describe("integration scenarios", () => {
        it("should handle complete workflow with valid limit", async () => {
            const setHistoryLimitCallback = vi.fn();
            const getHistoryLimitCallback = vi.fn();
            const limit = 150;

            // Set the limit
            await setHistoryLimit({
                limit,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                setHistoryLimit: setHistoryLimitCallback,
                logger: mockLogger,
            });

            // Simulate the internal callback setting the limit
            getHistoryLimitCallback.mockReturnValue(limit);

            // Get the limit
            const result = getHistoryLimit(getHistoryLimitCallback);

            expect(result).toBe(limit);
            expect(setHistoryLimitCallback).toHaveBeenCalledWith(limit);
            expect(mockSettingsRepository.set).toHaveBeenCalledWith("historyLimit", limit.toString());
            expect(mockHistoryRepository.pruneAllHistory).toHaveBeenCalledWith(limit);
        });

        it("should handle workflow with minimum limit enforcement", async () => {
            const setHistoryLimitCallback = vi.fn();
            const getHistoryLimitCallback = vi.fn();
            const limit = 3;
            const expectedLimit = 10;

            // Set the limit
            await setHistoryLimit({
                limit,
                repositories: {
                    history: mockHistoryRepository,
                    settings: mockSettingsRepository,
                },
                setHistoryLimit: setHistoryLimitCallback,
                logger: mockLogger,
            });

            // Simulate the internal callback setting the corrected limit
            getHistoryLimitCallback.mockReturnValue(expectedLimit);

            // Get the limit
            const result = getHistoryLimit(getHistoryLimitCallback);

            expect(result).toBe(expectedLimit);
            expect(setHistoryLimitCallback).toHaveBeenCalledWith(expectedLimit);
            expect(mockSettingsRepository.set).toHaveBeenCalledWith("historyLimit", expectedLimit.toString());
            expect(mockHistoryRepository.pruneAllHistory).toHaveBeenCalledWith(expectedLimit);
        });
    });
});
