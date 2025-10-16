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

import { create, type StoreApi, type UseBoundStore } from "zustand";

import type { MonitorTypesStore } from "./types";

import { createMonitorTypesOperationsSlice } from "./operations";
import { createMonitorTypesStateSlice } from "./state";

/**
 * Monitor types store composed from modular state and operations slices.
 *
 * @public
 */
export const useMonitorTypesStore: UseBoundStore<StoreApi<MonitorTypesStore>> =
    create<MonitorTypesStore>()((set, get) => ({
        ...createMonitorTypesStateSlice(set, get),
        ...createMonitorTypesOperationsSlice(set, get),
    }));
