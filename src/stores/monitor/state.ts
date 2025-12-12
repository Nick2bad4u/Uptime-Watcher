import type { MonitorType } from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
/**
 * Core state slice for the monitor types store.
 */
import type { StoreApi } from "zustand";

import type { MonitorTypesStore } from "./types";

/**
 * Setter helper type for composing monitor types store slices.
 */
export type MonitorTypesStoreSetter = StoreApi<MonitorTypesStore>["setState"];

/**
 * Getter helper type for composing monitor types store slices.
 */
export type MonitorTypesStoreGetter = StoreApi<MonitorTypesStore>["getState"];

/**
 * Initial state for monitor types management.
 */
export const initialMonitorTypesState: Pick<
    MonitorTypesStore,
    "fieldConfigs" | "isLoaded" | "monitorTypes"
> = {
    fieldConfigs: {},
    isLoaded: false,
    monitorTypes: [],
};

/**
 * Creates the basic state slice including field lookups and base store helpers.
 */
export const createMonitorTypesStateSlice = (
    _setState: MonitorTypesStoreSetter,
    getState: MonitorTypesStoreGetter
): Pick<
    MonitorTypesStore,
    "fieldConfigs" | "getFieldConfig" | "isLoaded" | "monitorTypes"
> => ({
    ...initialMonitorTypesState,
    getFieldConfig: (
        type: MonitorType
    ): MonitorTypeConfig["fields"] | undefined => getState().fieldConfigs[type],
});
