/**
 * Custom hook for managing monitor type configurations from the backend.
 * Provides async loading with caching and error handling.
 */

import { useEffect, useState } from "react";

import { getMonitorTypeOptions } from "../utils/monitorTypeHelper";

interface UseMonitorTypesResult {
    /** Error message if loading failed */
    error: string | undefined;
    /** Whether monitor types are currently loading */
    isLoading: boolean;
    /** Monitor type options for form select fields */
    options: { label: string; value: string }[];
    /** Refresh monitor types from backend */
    refresh: () => Promise<void>;
}

/**
 * Hook to load monitor type configurations from backend.
 *
 * @returns Monitor type options and loading state
 */
export function useMonitorTypes(): UseMonitorTypesResult {
    const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const loadMonitorTypes = async () => {
        try {
            setIsLoading(true);
            setError(undefined);
            const monitorOptions = await getMonitorTypeOptions();
            setOptions(monitorOptions);
        } catch (error_) {
            const errorMessage = error_ instanceof Error ? error_.message : "Failed to load monitor types";
            setError(errorMessage);
            console.error("Failed to load monitor types:", error_);
            // Fallback to basic options if backend fails
            setOptions([
                { label: "HTTP (Website/API)", value: "http" },
                { label: "Port (Host/Port)", value: "port" },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const refresh = async () => {
        await loadMonitorTypes();
    };

    useEffect(() => {
        void loadMonitorTypes();
    }, []);

    return {
        error,
        isLoading,
        options,
        refresh,
    };
}
