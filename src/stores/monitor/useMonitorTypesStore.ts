/**
 * Monitor Types store for managing monitor type configurations and validation.
 * Handles monitor type definitions, field configurations, and validation
 * operations.
 *
 * @remarks
 * This store manages all monitor type related functionality with caching and
 * backend synchronization. It provides:
 *
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
 *
 * ```typescript
 * // Get available monitor types
 * const { monitorTypes, loadMonitorTypes } = useMonitorTypesStore();
 * await loadMonitorTypes();
 *
 * // Validate monitor data
 * const { validateMonitorData } = useMonitorTypesStore();
 * const result = await validateMonitorData("http", {
 *     url: "https://example.com",
 * });
 *
 * // Format monitor details
 * const { formatMonitorDetail } = useMonitorTypesStore();
 * const formatted = await formatMonitorDetail(
 *     "http",
 *     "Response time: 150ms"
 * );
 * ```
 *
 * @public
 */

import type { Monitor, MonitorType } from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type { ValidationResult } from "@shared/types/validation";
import type { Simplify } from "type-fest";

import { withErrorHandling } from "@shared/utils/errorHandling";
import { create, type StoreApi, type UseBoundStore } from "zustand";

import type { BaseStore } from "../types";

import { MonitorTypesService } from "../../services/MonitorTypesService";
import { logStoreAction } from "../utils";

/**
 * Monitor Types store actions interface.
 *
 * @remarks
 * Defines all actions available for monitor type management including:
 *
 * - Loading and caching monitor type configurations
 * - Validating monitor data against type schemas
 * - Formatting monitor details and titles
 * - Managing field configurations for dynamic forms
 *
 * All actions provide consistent error handling and logging through the
 * centralized error management system.
 *
 * @public
 */
export interface MonitorTypesActions {
    /**
     * Formats monitor detail text using backend registry.
     *
     * @remarks
     * Uses the backend monitor type registry to format detail text according to
     * type-specific rules and conventions.
     *
     * @param type - The monitor type identifier
     * @param details - Raw detail text to format
     *
     * @returns Promise resolving to formatted detail text
     */
    formatMonitorDetail: (type: string, details: string) => Promise<string>;

    /**
     * Generates formatted title suffix for a monitor.
     *
     * @remarks
     * Creates a descriptive suffix for monitor titles based on the monitor type
     * and configuration. Used in UI displays to provide context about the
     * monitor's target.
     *
     * @param type - The monitor type identifier
     * @param monitor - The monitor configuration object
     *
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
     * Gets the field definitions used by dynamic form components to render
     * monitor-specific input fields.
     *
     * @param type - The monitor type to get fields for
     *
     * @returns Field configuration or undefined if type not found
     */
    getFieldConfig: (
        type: MonitorType
    ) => MonitorTypeConfig["fields"] | undefined;

    /**
     * Loads all available monitor type configurations from backend.
     *
     * @remarks
     * **Initial Load Operation**: Fetches monitor type definitions from the
     * backend registry and caches them in the store on first use. This is
     * intended for application initialization or when monitor types haven't
     * been loaded yet.
     *
     * Key characteristics:
     *
     * - Designed for initial application startup
     * - Populates empty cache with fresh data
     * - Includes field configurations, validation schemas, and UI metadata
     * - Uses `safeExtractIpcData` for robust IPC response handling
     * - Should be called once during app initialization
     *
     * For updating existing cached data, use {@link refreshMonitorTypes}
     * instead, which provides cache invalidation and forced refresh semantics.
     *
     * @example
     *
     * ```typescript
     * // Application initialization
     * const { loadMonitorTypes, isLoaded } = useMonitorTypesStore();
     *
     * if (!isLoaded) {
     *     await loadMonitorTypes(); // Initial load
     * }
     * ```
     *
     * @returns Promise that resolves when loading is complete
     */
    loadMonitorTypes: () => Promise<void>;

    /**
     * Clears monitor types cache and reloads from backend.
     *
     * @remarks
     * **Background Refresh Operation**: Forces a fresh load of monitor type
     * configurations from the backend, bypassing and replacing any cached data.
     * This is intended for runtime updates when monitor types may have changed
     * or when explicit cache invalidation is needed.
     *
     * Key characteristics:
     *
     * - Designed for runtime cache invalidation
     * - Replaces existing cached data with fresh backend data
     * - Useful during development when types are being modified
     * - Appropriate for user-triggered refresh actions
     * - Can be called multiple times without side effects
     *
     * For initial application loading, use {@link loadMonitorTypes} instead,
     * which provides first-time loading semantics optimized for startup.
     *
     * @example
     *
     * ```typescript
     * // User-triggered refresh or development hot-reload
     * const { refreshMonitorTypes } = useMonitorTypesStore();
     *
     * // Force cache refresh
     * await refreshMonitorTypes();
     * ```
     *
     * @returns Promise that resolves when refresh is complete
     */
    refreshMonitorTypes: () => Promise<void>;

    /**
     * Validates monitor data against type-specific schema.
     *
     * @remarks
     * Performs comprehensive validation of monitor configuration data using the
     * backend validation registry. Returns detailed validation results
     * including success status, errors, and metadata.
     *
     * @param type - The monitor type to validate against
     * @param data - The monitor data to validate
     *
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
 *
 * - Cached monitor type configurations
 * - Field configurations mapped by type for efficient access
 * - Loading state to prevent duplicate operations
 *
 * The state is designed to provide fast access to monitor type information
 * while maintaining consistency with backend data.
 *
 * @public
 */
export interface MonitorTypesState {
    /**
     * Field configurations mapped by monitor type.
     *
     * @remarks
     * Provides efficient access to field definitions for dynamic form
     * rendering. Each monitor type maps to its specific field configuration
     * array.
     */
    fieldConfigs: Record<string, MonitorTypeConfig["fields"]>;

    /**
     * Flag indicating whether monitor types have been loaded.
     *
     * @remarks
     * Used to prevent duplicate loading operations and to show appropriate
     * loading states in the UI.
     */
    isLoaded: boolean;

    /**
     * Array of all available monitor type configurations.
     *
     * @remarks
     * Contains the complete set of monitor type definitions loaded from the
     * backend registry, including metadata, field definitions, and validation
     * rules.
     */
    monitorTypes: MonitorTypeConfig[];
}

/**
 * Combined interface for Monitor Types store.
 */
export type MonitorTypesStore = Simplify<
    BaseStore & MonitorTypesActions & MonitorTypesState
>;

/**
 * Monitor Types store for managing monitor type configurations and operations.
 *
 * @remarks
 * Centralizes all monitor type related functionality that was previously
 * scattered across components and utilities. Provides consistent state
 * management and eliminates direct ElectronAPI calls.
 *
 * @returns Complete monitor types store with all actions and state
 *
 * @public
 */
export const useMonitorTypesStore: UseBoundStore<StoreApi<MonitorTypesStore>> =
    create<MonitorTypesStore>()((set, get) => ({
        // Base store actions
        clearError: (): void => {
            set({ lastError: undefined });
        },
        // Initial state
        fieldConfigs: {},
        // Monitor types actions
        formatMonitorDetail: async (
            type: string,
            details: string
        ): Promise<string> =>
            withErrorHandling(
                async () => {
                    logStoreAction("MonitorTypesStore", "formatMonitorDetail", {
                        type,
                    });

                    const result =
                        await MonitorTypesService.formatMonitorDetail(
                            type,
                            details
                        );

                    // Handle unexpected null/undefined responses (runtime safety check)
                    if (
                        (result as unknown) === null ||
                        (result as unknown) === undefined
                    ) {
                        throw new Error(
                            `formatMonitorDetail returned null for type: ${type}`
                        );
                    }

                    logStoreAction("MonitorTypesStore", "formatMonitorDetail", {
                        resultLength: result.length,
                        success: true,
                        type,
                    });

                    return result;
                },
                {
                    clearError: get().clearError,
                    setError: get().setError,
                    setLoading: get().setLoading,
                }
            ),

        formatMonitorTitleSuffix: async (
            type: string,
            monitor: Monitor
        ): Promise<string> =>
            withErrorHandling(
                async () => {
                    logStoreAction(
                        "MonitorTypesStore",
                        "formatMonitorTitleSuffix",
                        { type }
                    );

                    const result =
                        await MonitorTypesService.formatMonitorTitleSuffix(
                            type,
                            monitor
                        );

                    // Handle unexpected null/undefined responses (runtime safety check)
                    if (
                        (result as unknown) === null ||
                        (result as unknown) === undefined
                    ) {
                        throw new Error(
                            `formatMonitorTitleSuffix returned null for type: ${type}`
                        );
                    }

                    logStoreAction(
                        "MonitorTypesStore",
                        "formatMonitorTitleSuffix",
                        {
                            resultLength: result.length,
                            success: true,
                            type,
                        }
                    );

                    return result;
                },
                {
                    clearError: get().clearError,
                    setError: get().setError,
                    setLoading: get().setLoading,
                }
            ),
        getFieldConfig: (
            type: MonitorType
        ): MonitorTypeConfig["fields"] | undefined => {
            const state = get();
            return state.fieldConfigs[type];
        },

        isLoaded: false,

        isLoading: false,

        lastError: undefined,

        loadMonitorTypes: async (): Promise<void> => {
            const state = get();

            // Skip if already loaded and no error
            if (state.isLoaded && !state.lastError) {
                return;
            }

            await withErrorHandling(
                async () => {
                    logStoreAction("MonitorTypesStore", "loadMonitorTypes", {});

                    const rawConfigs =
                        await MonitorTypesService.getMonitorTypes();

                    // Ensure rawConfigs is an array before filtering
                    const configsArray = Array.isArray(rawConfigs)
                        ? rawConfigs
                        : [];

                    // Filter out invalid/malformed configs
                    const configs = configsArray.filter(
                        (config): config is MonitorTypeConfig => {
                            if (typeof config !== "object") return false;
                            if (!("type" in config)) return false;
                            // Safe assertion after validation
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Type validated to have 'type' property above
                            const typedConfig = config as { type: unknown };
                            return (
                                typeof typedConfig.type === "string" &&
                                typedConfig.type.length > 0
                            );
                        }
                    );

                    // Build field configs map
                    const fieldMap: Record<
                        string,
                        MonitorTypeConfig["fields"]
                    > = {};
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
                },
                {
                    clearError: get().clearError,
                    setError: get().setError,
                    setLoading: get().setLoading,
                }
            );
        },

        monitorTypes: [],

        refreshMonitorTypes: async (): Promise<void> => {
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

        setError: (error: string | undefined): void => {
            set({ lastError: error });
        },

        setLoading: (loading: boolean): void => {
            set({ isLoading: loading });
        },

        validateMonitorData: async (
            type: string,
            data: unknown
        ): Promise<ValidationResult> =>
            withErrorHandling(
                async () => {
                    logStoreAction("MonitorTypesStore", "validateMonitorData", {
                        type,
                    });

                    // Get the validation result directly from the service
                    const validationResult =
                        await MonitorTypesService.validateMonitorData(
                            type,
                            data
                        );

                    if (!Array.isArray(validationResult.errors)) {
                        throw new TypeError(
                            "Invalid validation result received: errors payload missing"
                        );
                    }

                    const normalizedResult: ValidationResult = {
                        data: validationResult.data,
                        errors: Array.from(validationResult.errors),
                        metadata: validationResult.metadata
                            ? { ...validationResult.metadata }
                            : {},
                        success: validationResult.success,
                        warnings: validationResult.warnings
                            ? Array.from(validationResult.warnings)
                            : [],
                    };

                    logStoreAction("MonitorTypesStore", "validateMonitorData", {
                        errorCount: normalizedResult.errors.length,
                        success: normalizedResult.success,
                        type,
                    });

                    return normalizedResult;
                },
                {
                    clearError: get().clearError,
                    setError: get().setError,
                    setLoading: get().setLoading,
                }
            ),
    }));
