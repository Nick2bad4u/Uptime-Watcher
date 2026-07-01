/**
 * Additional test coverage for useSettingsStore to reach 100% coverage.
 */

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSettingsStore } from "../../../stores/settings/useSettingsStore";

vi.mock(import('../error/useErrorStore'), () => ({
    useErrorStore: {
        getState: vi.fn(() => ({
            setError: vi.fn(),
            clearError: vi.fn(),
            setLoading: vi.fn(),
        })),
    },
}));

vi.mock(import('../utils'), () => ({
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
        } catch (error: unknown) {
            if (errorHandling?.setError) {
                errorHandling.setError(
                    Error.isError(error) ? error.message : String(error)
                );
            }
            if (errorHandling?.setLoading) {
                errorHandling.setLoading(false);
            }

            throw error;
        }
    }),
}));

vi.mock(import('../../constants'), () => ({
    DEFAULT_HISTORY_LIMIT: 1000,
}));

// Mock electron API with proper vi.fn() mocks
const mockGetHistoryLimit = vi.fn();
const mockResetSettings = vi.fn();
const mockUpdateHistoryLimit = vi.fn();

globalThis.window = {
    ...globalThis,
    electronAPI: {
        settings: {
            getHistoryLimit: mockGetHistoryLimit,
            resetSettings: mockResetSettings,
            updateHistoryLimit: mockUpdateHistoryLimit,
        },
    },
} as any;

describe("useSettingsStore - Additional Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        localStorage.clear();
        sessionStorage.clear();

        mockGetHistoryLimit.mockResolvedValue(1000);
        mockResetSettings.mockResolvedValue({ success: true });
        mockUpdateHistoryLimit.mockResolvedValue(1000);
    });

    it("should test basic functionality", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useSettingsStore.additional", "component");
        await annotate("Category: Store", "category");
        await annotate("Type: Business Logic", "type");

        const { result } = renderHook(() => useSettingsStore());

        expect(result.current.settings).toBeDefined();
        expect(result.current.settings.theme).toBe("system");
    });
});
