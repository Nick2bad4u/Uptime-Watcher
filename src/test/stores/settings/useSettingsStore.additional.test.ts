/**
 * Additional test coverage for useSettingsStore to reach 100% coverage.
 */

import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSettingsStore } from "../../../stores/settings/useSettingsStore";
import { installElectronApiMock } from "../../utils/electronApiMock";

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
    withErrorHandling: vi.fn(
        async <T>(
            fn: () => Promise<T>,
            errorHandling?: {
                clearError?: () => void;
                setError?: (error: string) => void;
                setLoading?: (loading: boolean) => void;
            }
        ) => {
            try {
                if (errorHandling?.clearError) {
                    errorHandling.clearError();
                }
                if (errorHandling?.setLoading) {
                    errorHandling.setLoading(true);
                }

                const result = await fn();
                if (errorHandling?.setLoading) {
                    errorHandling.setLoading(false);
                }
                return result;
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
        }
    ),
}));

vi.mock("../../constants", () => ({
    DEFAULT_HISTORY_LIMIT: 1000,
}));

// Mock electron API with proper vi.fn() mocks
const mockGetHistoryLimit = vi.fn();
const mockResetSettings = vi.fn();
const mockUpdateHistoryLimit = vi.fn();

const mockElectronAPI = {
    settings: {
        getHistoryLimit: mockGetHistoryLimit,
        resetSettings: mockResetSettings,
        updateHistoryLimit: mockUpdateHistoryLimit,
    },
};

let restoreElectronApi: (() => void) | undefined;

describe("useSettingsStore - Additional Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        ({ restore: restoreElectronApi } = installElectronApiMock(
            mockElectronAPI,
            {
                ensureWindow: true,
            }
        ));

        localStorage.clear();
        sessionStorage.clear();

        mockGetHistoryLimit.mockResolvedValue(1000);
        mockResetSettings.mockResolvedValue({ success: true });
        mockUpdateHistoryLimit.mockResolvedValue(1000);
    });

    afterEach(() => {
        restoreElectronApi?.();
        restoreElectronApi = undefined;
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
