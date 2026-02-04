/**
 * Type definitions for the monitor types store.
 *
 * @remarks
 * Extracted into a standalone module to support modular store composition
 * similar to the sites and settings stores.
 */
import type { Monitor, MonitorType } from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type { ValidationResult } from "@shared/types/validation";
import type { Simplify } from "type-fest";

/**
 * Monitor Types store actions interface.
 *
 * @public
 */
export interface MonitorTypesActions {
    formatMonitorDetail: (
        type: MonitorType,
        details: string
    ) => Promise<string>;
    formatMonitorTitleSuffix: (
        type: MonitorType,
        monitor: Monitor
    ) => Promise<string>;
    getFieldConfig: (
        type: MonitorType
    ) => MonitorTypeConfig["fields"] | undefined;
    loadMonitorTypes: () => Promise<void>;
    refreshMonitorTypes: () => Promise<void>;
    validateMonitorData: (
        type: MonitorType,
        data: unknown
    ) => Promise<ValidationResult>;
}

/**
 * Monitor Types store state interface.
 *
 * @public
 */
export interface MonitorTypesState {
    fieldConfigs: Partial<Record<MonitorType, MonitorTypeConfig["fields"]>>;
    isLoaded: boolean;
    monitorTypes: MonitorTypeConfig[];
}

/**
 * Combined interface for the monitor types store.
 *
 * @public
 */
export type MonitorTypesStore = Simplify<
    MonitorTypesActions & MonitorTypesState
>;
