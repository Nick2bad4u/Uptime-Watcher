/**
 * Debug test to understand store behavior
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useMonitorTypesStore } from "../stores/monitor/useMonitorTypesStore";

// Mock dependencies
vi.mock("@shared/utils/errorHandling", () => ({
    withErrorHandling: vi.fn(async (fn) => {
        console.log("withErrorHandling called");
        return await fn();
    }),
}));

vi.mock("../utils", () => ({
    logStoreAction: vi.fn(),
}));

vi.mock("../types/ipc", () => ({
    safeExtractIpcData: vi.fn((response, fallback) => response || fallback),
}));

// Mock ElectronAPI
const mockElectronAPI = {
    monitorTypes: {
        getMonitorTypes: vi.fn(() => {
            console.log("getMonitorTypes mock called!");
            return Promise.resolve([{ type: "test", displayName: "Test" }]);
        }),
        validateMonitorData: vi.fn(),
        formatMonitorDetail: vi.fn(),
        formatMonitorTitleSuffix: vi.fn(),
    },
};

// Properly mock window.electronAPI
Object.defineProperty(globalThis, "window", {
    value: {
        electronAPI: mockElectronAPI,
    },
    writable: true,
});

describe("Debug Store Test", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should debug the basic store behavior", async () => {
        console.log("Starting debug test");
        console.log("window.electronAPI:", globalThis.window?.electronAPI);

        const { result } = renderHook(() => useMonitorTypesStore());

        console.log("Store initial state:", {
            monitorTypes: result.current.monitorTypes,
            isLoaded: result.current.isLoaded,
            loadMonitorTypes: typeof result.current.loadMonitorTypes,
        });

        await act(async () => {
            console.log("Calling loadMonitorTypes...");
            await result.current.loadMonitorTypes();
            console.log("loadMonitorTypes completed");
        });

        console.log("Store final state:", {
            monitorTypes: result.current.monitorTypes,
            isLoaded: result.current.isLoaded,
        });

        console.log(
            "Mock call count:",
            mockElectronAPI.monitorTypes.getMonitorTypes.mock.calls.length
        );

        expect(mockElectronAPI.monitorTypes.getMonitorTypes).toHaveBeenCalled();
    });
});
