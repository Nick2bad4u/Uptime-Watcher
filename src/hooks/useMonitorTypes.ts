/**
 * Custom hook for managing monitor type configurations from the backend.
 * Provides async loading with caching and error handling.
 *
 * @returns Monitor type options and loading state
 *
 * @remarks
 * This hook fetches monitor type configurations from the backend and transforms
 * them into options suitable for form select fields. It includes error handling
 * and fallback options to ensure the UI remains functional even when backend
 * communication fails.
 *
 * Error handling strategy:
 * - Network errors: Logged and fallback options provided
 * - Parse errors: Logged with context for debugging
 * - Fallback behavior: Uses FALLBACK_MONITOR_TYPE_OPTIONS from constants
 *
 * @example
 * ```tsx
 * function MonitorTypeSelector() {
 *   const { options, isLoading, error, refresh } = useMonitorTypes();
 *
 *   if (isLoading) return <div>Loading monitor types...</div>;
 *   if (error) return <div>Error: {error} <button onClick={refresh}>Retry</button></div>;
 *
 *   return (
 *     <select>
 *       {options.map(option => (
 *         <option key={option.value} value={option.value}>
 *           {option.label}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */

import { useState } from "react";

import { FALLBACK_MONITOR_TYPE_OPTIONS } from "../constants";
import logger from "../services/logger";
import { getMonitorTypeOptions } from "../utils/monitorTypeHelper";
import { useMount } from "./useMount";

/**
 * Result interface for the useMonitorTypes hook
 *
 * @public
 */
export interface UseMonitorTypesResult {
    /** Error message if loading failed */
    error: string | undefined;
    /** Whether monitor types are currently loading */
    isLoading: boolean;
    /** Monitor type options for form select fields */
    options: Array<{ label: string; value: string }>;
    /** Refresh monitor types from backend */
    refresh: () => Promise<void>;
}

/**
 * Hook to load monitor type configurations from backend.
 *
 * @returns Monitor type options and loading state
 */
export function useMonitorTypes(): UseMonitorTypesResult {
    const [options, setOptions] = useState<
        Array<{ label: string; value: string }>
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const loadMonitorTypes = async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(undefined);
            const monitorOptions = await getMonitorTypeOptions();
            setOptions(monitorOptions);
        } catch (loadError) {
            const errorMessage =
                loadError instanceof Error
                    ? loadError.message
                    : "Failed to load monitor types";
            const contextualError = `Monitor types loading failed: ${errorMessage}. Using fallback options.`;
            setError(contextualError);
            logger.error(
                "Failed to load monitor types from backend",
                loadError instanceof Error
                    ? loadError
                    : new Error(String(loadError))
            );
            // Use centralized fallback options to ensure consistency
            setOptions(Array.from(FALLBACK_MONITOR_TYPE_OPTIONS));
        } finally {
            setIsLoading(false);
        }
    };

    const refresh = async (): Promise<void> => {
        await loadMonitorTypes();
    };

    useMount(() => loadMonitorTypes());

    return {
        error,
        isLoading,
        options,
        refresh,
    };
}
