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

import type { BaseStore } from "../types";

/**
 * Monitor Types store actions interface.
 *
 * @public
 */
export interface MonitorTypesActions {
    formatMonitorDetail: (type: string, details: string) => Promise<string>;
    formatMonitorTitleSuffix: (
        type: string,
        monitor: Monitor
    ) => Promise<string>;
    getFieldConfig: (
        type: MonitorType
    ) => MonitorTypeConfig["fields"] | undefined;
    loadMonitorTypes: () => Promise<void>;
    refreshMonitorTypes: () => Promise<void>;
    validateMonitorData: (
        type: string,
        data: unknown
    ) => Promise<ValidationResult>;
}

/**
 * Monitor Types store state interface.
 *
 * @public
 */
export interface MonitorTypesState {
    fieldConfigs: Record<string, MonitorTypeConfig["fields"]>;
    isLoaded: boolean;
    monitorTypes: MonitorTypeConfig[];
}

/**
 * Combined interface for the monitor types store.
 *
 * @public
 */
export type MonitorTypesStore = Simplify<
    BaseStore & MonitorTypesActions & MonitorTypesState
>;
