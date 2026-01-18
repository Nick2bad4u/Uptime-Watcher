import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MonitorFieldDefinition } from "@shared/types";

import { useMonitorFields } from "../../hooks/useMonitorFields";
import { useErrorStore } from "../../stores/error/useErrorStore";
import { useMonitorTypesStore } from "../../stores/monitor/useMonitorTypesStore";

vi.mock("../../stores/monitor/useMonitorTypesStore", () => ({
    useMonitorTypesStore: vi.fn(),
}));

vi.mock("../../stores/error/useErrorStore", () => ({
    useErrorStore: vi.fn(),
}));

const mockHttpFields: MonitorFieldDefinition[] = [
    {
        name: "url",
        label: "URL",
        type: "url",
        placeholder: "https://example.com",
        required: true,
    },
    {
        name: "timeout",
        label: "Timeout",
        type: "number",
        required: false,
    },
];

describe(useMonitorFields, () => {
    const mockLoadMonitorTypes = vi.fn(async () => undefined);

    interface MonitorTypesState {
        fieldConfigs: Record<string, MonitorFieldDefinition[]>;
        isLoaded: boolean;
        loadMonitorTypes: () => Promise<void>;
    }

    interface ErrorState {
        monitorTypesError: string | undefined;
        getStoreError: (key: string) => string | undefined;
    }

    let monitorTypesState: MonitorTypesState;
    let errorState: ErrorState;

    beforeEach(() => {
        vi.clearAllMocks();

        monitorTypesState = {
            fieldConfigs: {
                http: mockHttpFields,
            },
            isLoaded: false,
            loadMonitorTypes: mockLoadMonitorTypes,
        };

        errorState = {
            monitorTypesError: undefined,
            getStoreError: (key) =>
                key === "monitor-types"
                    ? errorState.monitorTypesError
                    : undefined,
        };

        vi.mocked(useMonitorTypesStore).mockImplementation(((
            selector?: (state: MonitorTypesState) => unknown
        ) =>
            typeof selector === "function"
                ? selector(monitorTypesState)
                : (monitorTypesState as unknown)) as unknown as typeof useMonitorTypesStore);

        vi.mocked(useErrorStore).mockImplementation(((
            selector?: (state: ErrorState) => unknown
        ) =>
            typeof selector === "function"
                ? selector(errorState)
                : (errorState as unknown)) as unknown as typeof useErrorStore);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("loads monitor types when not loaded and no error exists", async () => {
        renderHook(() => useMonitorFields());

        await waitFor(() => {
            expect(mockLoadMonitorTypes).toHaveBeenCalledTimes(1);
        });
    });

    it("does not load monitor types when already loaded", async () => {
        monitorTypesState.isLoaded = true;

        renderHook(() => useMonitorFields());

        await waitFor(() => {
            expect(mockLoadMonitorTypes).toHaveBeenCalledTimes(0);
        });
    });

    it("does not load monitor types when an error exists", async () => {
        errorState.monitorTypesError = "boom";

        renderHook(() => useMonitorFields());

        await waitFor(() => {
            expect(mockLoadMonitorTypes).toHaveBeenCalledTimes(0);
        });
    });

    it("returns fields and required field helpers", () => {
        const { result } = renderHook(() => useMonitorFields());

        expect(result.current.isLoaded).toBeFalsy();
        expect(result.current.error).toBeUndefined();

        expect(result.current.getFields("missing")).toEqual([]);
        expect(result.current.getFields("http")).toEqual(mockHttpFields);

        expect(result.current.getRequiredFields("http")).toEqual(["url"]);
        expect(result.current.isFieldRequired("http", "url")).toBeTruthy();
        expect(result.current.isFieldRequired("http", "timeout")).toBeFalsy();
    });
});
