/**
 * Custom hook for dynamically loading monitor type help text.
 *
 * @param monitorType - MonitorType - The monitor type to load help text for
 * @returns Object containing help text data and loading state
 *
 * @remarks
 * This hook manages asynchronous loading of monitor-specific help text from
 * the backend configuration. It handles loading states, error scenarios, and
 * provides appropriate fallbacks when help text is unavailable.
 *
 * The hook automatically cancels pending requests when the component unmounts
 * or when the monitor type changes to prevent memory leaks and race
 * conditions.
 *
 * @example
 * ```tsx
 * function MonitorHelp({ monitorType }) {
 *   const { primary, secondary, error, isLoading } = useDynamicHelpText(monitorType);
 *
 *   if (isLoading) return <div>Loading help...</div>;
 *   if (error) return <div>Help unavailable: {error}</div>;
 *
 *   return (
 *     <div>
 *       {primary && <p>{primary}</p>}
 *       {secondary && <p>{secondary}</p>}
 *     </div>
 *   );
 * }
 * ```
 */

import type { MonitorType } from "@shared/types";

import { useEffect, useMemo, useState } from "react";

import logger from "../services/logger";
import { getMonitorHelpTexts } from "../utils/monitorUiHelpers";

/**
 * Result interface for useDynamicHelpText hook
 *
 * @public
 */
export interface DynamicHelpTextResult {
    /** Error message if loading failed */
    error?: string | undefined;
    /** Whether help texts are currently loading */
    isLoading: boolean;
    /** Primary help text content */
    primary?: string;
    /** Secondary help text content */
    secondary?: string;
}

/**
 * Custom hook for dynamically loading monitor type help text.
 *
 * @param monitorType - The monitor type to load help text for
 * @returns Object containing help text data and loading state
 *
 * @remarks
 * Provides monitor-specific help text with automatic loading state management.
 * Handles cancellation of pending requests on unmount or monitor type changes.
 *
 * @public
 */
export function useDynamicHelpText(
    monitorType: MonitorType
): DynamicHelpTextResult {
    const [helpTexts, setHelpTexts] = useState<{
        primary?: string;
        secondary?: string;
    }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    useEffect(
        function loadDynamicHelpText() {
            let isCancelled = false;

            const loadHelpTexts = async (): Promise<void> => {
                try {
                    setIsLoading(true);
                    setError(undefined);
                    const texts = await getMonitorHelpTexts(monitorType);
                    if (!isCancelled) {
                        setHelpTexts(texts);
                        setIsLoading(false);
                    }
                } catch (caughtError) {
                    logger.warn(
                        "Failed to load help texts",
                        caughtError instanceof Error
                            ? caughtError
                            : new Error(String(caughtError))
                    );
                    if (!isCancelled) {
                        const errorMessage =
                            caughtError instanceof Error
                                ? caughtError.message
                                : "Help text unavailable";
                        setError(errorMessage);
                        setHelpTexts({
                            primary: "Help text could not be loaded",
                            secondary:
                                "Please check your connection and try again",
                        });
                        setIsLoading(false);
                    }
                }
            };

            void loadHelpTexts();

            return (): void => {
                isCancelled = true;
            };
        },
        [monitorType]
    );

    return useMemo(
        () => ({
            ...helpTexts,
            error,
            isLoading,
        }),
        [error, helpTexts, isLoading]
    );
}
