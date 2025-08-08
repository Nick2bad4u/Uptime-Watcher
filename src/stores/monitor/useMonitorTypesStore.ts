/**
 * Monitor Types store for managing monitor type configurations and validation.
 * Handles monitor type definitions, field configurations, and validation operations.
 *
 * @remarks
 * This store manages all monitor type related functionality with caching and
 * backend synchronization. It provides:
 * - Monitor type configuration loading and caching
 * - Monitor data validation through backend registry
 * - Monitor detail formatting and title suffix generation
 * - Field configuration management for dynamic forms
 *
 * The store centralizes all monitor type operations that were previously
 * scattered across components and utilities, providing consistent state
 * management and eliminating direct ElectronAPI calls.
 *
 * @example
 * ```typescript
 * // Get available monitor types
 * const { monitorTypes, loadMonitorTypes } = useMonitorTypesStore();
 * await loadMonitorTypes();
 *
 * // Validate monitor data
 * const { validateMonitorData } = useMonitorTypesStore();
 * const result = await validateMonitorData('http', { url: 'https://example.com' });
 *
 * // Format monitor details
 * const { formatMonitorDetail } = useMonitorTypesStore();
 * const formatted = await formatMonitorDetail('http', 'Response time: 150ms');
 * ```
 *
 * @public
 */

import type { MonitorTypeConfig } from "@shared/types/monitorTypes";

import { create, type StoreApi, type UseBoundStore } from "zustand";

import type { Monitor, MonitorType } from "../../../shared/types";
import type { ValidationResult } from "../../../shared/types/validation";
import type { BaseStore } from "../types";

import { safeExtractIpcData } from "../../types/ipc";
import { logStoreAction, withErrorHandling } from "../utils";

/**
 * Monitor Types store actions interface.
 *
 * @remarks
 * Defines all actions available for monitor type management including:
 * - Loading and caching monitor type configurations
 * - Validating monitor data against type schemas
 * - Formatting monitor details and titles
 * - Managing field configurations for dynamic forms
 *
 * All actions provide consistent error handling and logging through
 * the centralized error management system.
 *
 * @public
 */
export interface MonitorTypesActions {
    /**
     * Formats monitor detail text using backend registry.
     *
     * @remarks
     * Uses the backend monitor type registry to format detail text
     * according to type-specific rules and conventions.
     *
     * @param type - The monitor type identifier
     * @param details - Raw detail text to format
     * @returns Promise resolving to formatted detail text
     */
    formatMonitorDetail: (type: string, details: string) => Promise<string>;

    /**
     * Generates formatted title suffix for a monitor.
     *
     * @remarks
     * Creates a descriptive suffix for monitor titles based on
     * the monitor type and configuration. Used in UI displays
     * to provide context about the monitor's target.
     *
     * @param type - The monitor type identifier
     * @param monitor - The monitor configuration object
     * @returns Promise resolving to formatted title suffix
     */
    formatMonitorTitleSuffix: (
        type: string,
        monitor: Monitor
    ) => Promise<string>;

    /**
     * Retrieves field configuration for a specific monitor type.
     *
     * @remarks
     * Gets the field definitions used by dynamic form components
     * to render monitor-specific input fields.
     *
     * @param type - The monitor type to get fields for
     * @returns Field configuration or undefined if type not found
     */
    getFieldConfig: (
        type: MonitorType
    ) => MonitorTypeConfig["fields"] | undefined;

    /**
     * Loads all available monitor type configurations from backend.
     *
     * @remarks
     * Fetches monitor type definitions from the backend registry
     * and caches them in the store. This includes field configurations,
     * validation schemas, and UI metadata for each monitor type.
     *
     * Uses `safeExtractIpcData` for robust IPC response handling.
     *
     * @returns Promise that resolves when loading is complete
     */
    loadMonitorTypes: () => Promise<void>;

    /**
     * Clears monitor types cache and reloads from backend.
     *
     * @remarks
     * Forces a fresh load of monitor type configurations from
     * the backend, bypassing any cached data. Useful for
     * development or when types may have changed.
     *
     * @returns Promise that resolves when refresh is complete
     */
    refreshMonitorTypes: () => Promise<void>;

    /**
     * Validates monitor data against type-specific schema.
     *
     * @remarks
     * Performs comprehensive validation of monitor configuration data
     * using the backend validation registry. Returns detailed validation
     * results including success status, errors, and metadata.
     *
     * @param type - The monitor type to validate against
     * @param data - The monitor data to validate
     * @returns Promise resolving to validation result
     */
    validateMonitorData: (
        type: string,
        data: unknown
    ) => Promise<ValidationResult>;
}

/**
 * Monitor Types store state interface.
 *
 * @remarks
 * Defines the state structure for monitor type management including:
 * - Cached monitor type configurations
 * - Field configurations mapped by type for efficient access
 * - Loading state to prevent duplicate operations
 *
 * The state is designed to provide fast access to monitor type
 * information while maintaining consistency with backend data.
 *
 * @public
 */
export interface MonitorTypesState {
    /**
     * Field configurations mapped by monitor type.
     *
     * @remarks
     * Provides efficient access to field definitions for
     * dynamic form rendering. Each monitor type maps to
     * its specific field configuration array.
     */
    fieldConfigs: Record<string, MonitorTypeConfig["fields"]>;

    /**
     * Flag indicating whether monitor types have been loaded.
     *
     * @remarks
     * Used to prevent duplicate loading operations and to
     * show appropriate loading states in the UI.
     */
    isLoaded: boolean;

    /**
     * Array of all available monitor type configurations.
     *
     * @remarks
     * Contains the complete set of monitor type definitions
     * loaded from the backend registry, including metadata,
     * field definitions, and validation rules.
     */
    monitorTypes: MonitorTypeConfig[];
}

/**
 * Combined interface for Monitor Types store.
 */
export type MonitorTypesStore = BaseStore &
    MonitorTypesActions &
    MonitorTypesState;

/**
 * Monitor Types store for managing monitor type configurations and operations.
 *
 * @remarks
 * Centralizes all monitor type related functionality that was previously
 * scattered across components and utilities. Provides consistent state
 * management and eliminates direct ElectronAPI calls.
 *
 * @returns Complete monitor types store with all actions and state
 * @public
 */
export const useMonitorTypesStore: UseBoundStore<StoreApi<MonitorTypesStore>> =
    create<MonitorTypesStore>()((set, get) => ({
        // Base store actions
        clearError: () => {
            set({ lastError: undefined });
        },
        // Initial state
        fieldConfigs: {},
        // Monitor types actions
        formatMonitorDetail: async (type: string, details: string) => {
            const state = get();

            return withErrorHandling(async () => {
                logStoreAction("MonitorTypesStore", "formatMonitorDetail", {
                    type,
                });

                const response =
                    await window.electronAPI.monitorTypes.formatMonitorDetail(
                        type,
                        details
                    );
                const formattedDetail = safeExtractIpcData<string>(
                    response,
                    details
                );

                logStoreAction("MonitorTypesStore", "formatMonitorDetail", {
                    success: true,
                    type,
                });

                return formattedDetail;
            }, state);
        },
        formatMonitorTitleSuffix: async (type: string, monitor: Monitor) => {
            const state = get();

            return withErrorHandling(async () => {
                logStoreAction(
                    "MonitorTypesStore",
                    "formatMonitorTitleSuffix",
                    { type }
                );

                const response =
                    await window.electronAPI.monitorTypes.formatMonitorTitleSuffix(
                        type,
                        monitor
                    );
                const formattedSuffix = safeExtractIpcData<string>(
                    response,
                    ""
                );

                logStoreAction(
                    "MonitorTypesStore",
                    "formatMonitorTitleSuffix",
                    {
                        success: true,
                        type,
                    }
                );

                return formattedSuffix;
            }, state);
        },
        getFieldConfig: (type: MonitorType) => {
            const state = get();
            return state.fieldConfigs[type];
        },

        isLoaded: false,

        isLoading: false,

        lastError: undefined,

        loadMonitorTypes: async () => {
            const state = get();

            // Skip if already loaded and no error
            if (state.isLoaded && !state.lastError) {
                return;
            }

            await withErrorHandling(async () => {
                logStoreAction("MonitorTypesStore", "loadMonitorTypes", {});

                const response =
                    await window.electronAPI.monitorTypes.getMonitorTypes();
                const configs = safeExtractIpcData<MonitorTypeConfig[]>(
                    response,
                    []
                );

                // Build field configs map
                const fieldMap: Record<string, MonitorTypeConfig["fields"]> =
                    {};
                for (const config of configs) {
                    fieldMap[config.type] = config.fields;
                }

                set({
                    fieldConfigs: fieldMap,
                    isLoaded: true,
                    monitorTypes: configs,
                });

                logStoreAction("MonitorTypesStore", "loadMonitorTypes", {
                    success: true,
                    typesCount: configs.length,
                });
            }, state);
        },

        monitorTypes: [],

        refreshMonitorTypes: async () => {
            const state = get();

            logStoreAction("MonitorTypesStore", "refreshMonitorTypes", {});

            // Clear current state and reload
            set({
                fieldConfigs: {},
                isLoaded: false,
                monitorTypes: [],
            });

            await state.loadMonitorTypes();
        },

        setError: (error: string | undefined) => {
            set({ lastError: error });
        },

        setLoading: (loading: boolean) => {
            set({ isLoading: loading });
        },

        validateMonitorData: async (type: string, data: unknown) => {
            const state = get();

            return withErrorHandling(async () => {
                logStoreAction("MonitorTypesStore", "validateMonitorData", {
                    type,
                });

                const result =
                    await window.electronAPI.monitorTypes.validateMonitorData(
                        type,
                        data
                    );

                // Transform result to ensure all required properties are present
                const validationResult: ValidationResult = {
                    data: result.data,
                    errors: result.errors,
                    metadata: result.metadata ?? {},
                    success: result.success,
                    warnings: result.warnings ?? [],
                };

                logStoreAction("MonitorTypesStore", "validateMonitorData", {
                    errorCount: validationResult.errors.length,
                    success: validationResult.success,
                    type,
                });

                return validationResult;
            }, state);
        },
    }));
