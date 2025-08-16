/**
 * Additional test coverage for useSettingsStore to reach 100% coverage.
 */

import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../types/ipc", () => ({
    extractIpcData: vi.fn(),
    safeExtractIpcData: vi.fn(),
}));

vi.mock("../error/useErrorStore", () => ({
    useErrorStore: {
        getState: vi.fn(() => ({
            setError: vi.fn(),
            clearError: vi.fn(),
            setLoading: vi.fn(),
        })),
    },
}));

vi.mock("../utils", () => ({
    logStoreAction: vi.fn(),
    withErrorHandling: vi.fn(async (fn, errorHandling) => {
        try {
            if (errorHandling?.clearError) {
                errorHandling.clearError();
            }
            if (errorHandling?.setLoading) {
                errorHandling.setLoading(true);
            }

            return await fn().then((result: any) => {
                if (errorHandling?.setLoading) {
                    errorHandling.setLoading(false);
                }
                return result;
            });
        } catch (error) {
            if (errorHandling?.setError) {
                errorHandling.setError(
                    error instanceof Error ? error.message : String(error)
                );
            }
            if (errorHandling?.setLoading) {
                errorHandling.setLoading(false);
            }

            throw error;
        }
    }),
}));

vi.mock("../../constants", () => ({
    DEFAULT_HISTORY_LIMIT: 1000,
}));

// Mock electron API with proper vi.fn() mocks
const mockGetHistoryLimit = vi.fn();
const mockResetSettings = vi.fn();
const mockUpdateHistoryLimit = vi.fn();

globalThis.window = {
    ...globalThis.window,
    electronAPI: {
        settings: {
            getHistoryLimit: mockGetHistoryLimit,
            resetSettings: mockResetSettings,
            updateHistoryLimit: mockUpdateHistoryLimit,
        },
    },
} as any;

import { useSettingsStore } from "../../../stores/settings/useSettingsStore";

describe("useSettingsStore - Additional Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        localStorage.clear();
        sessionStorage.clear();

        mockGetHistoryLimit.mockResolvedValue({ success: true, data: 1000 });
        mockResetSettings.mockResolvedValue({ success: true });
        mockUpdateHistoryLimit.mockResolvedValue({ success: true });
    });

    it("should test basic functionality", async () => {
        const { result } = renderHook(() => useSettingsStore());

        expect(result.current.settings).toBeDefined();
        expect(result.current.settings.theme).toBe("system");
    });
});
