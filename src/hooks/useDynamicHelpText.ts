/**
 * Custom hook for dynamically loading monitor type help text.
 *
 * @remarks
 * This hook manages asynchronous loading of monitor-specific help text from the
 * backend configuration. It handles loading states, error scenarios, and
 * provides appropriate fallbacks when help text is unavailable via
 * {@link getMonitorHelpTexts}.
 *
 * The hook automatically cancels pending requests when the component unmounts
 * or when the monitor type changes to prevent memory leaks and race
 * conditions.
 *
 * @example
 *
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
 *
 * @param monitorType - Monitor type to load help text for.
 *
 * @returns Object containing help text data and loading state.
 *
 * @public
 *
 * @see {@link getMonitorHelpTexts} for the underlying fetcher.
 */

import type { MonitorType } from "@shared/types";

import { useEffect, useMemo, useState } from "react";

import { logger } from "../services/logger";
import { getMonitorHelpTexts } from "../utils/monitorUiHelpers";

/**
 * Result interface for the {@link useDynamicHelpText} hook.
 *
 * @public
 */
export interface DynamicHelpTextResult {
    /** Error message if loading failed. */
    error?: string | undefined;
    /** Whether help texts are currently loading. */
    isLoading: boolean;
    /** Primary help text content. */
    primary?: string;
    /** Secondary help text content. */
    secondary?: string;
}

/**
 * Custom hook for dynamically loading monitor type help text.
 *
 * @remarks
 * Provides monitor-specific help text with automatic loading state management.
 * Handles cancellation of pending requests on unmount or monitor type changes
 * using AbortController for proper cleanup.
 *
 * @param monitorType - Monitor type to load help text for.
 *
 * @returns Object containing help text data and loading state.
 *
 * @public
 *
 * @see {@link getMonitorHelpTexts} for the IPC-backed helper powering this
 *   hook.
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
            const controller = new AbortController();

            const loadHelpTexts = async (): Promise<void> => {
                try {
                    setIsLoading(true);
                    setError(undefined);
                    const texts = await getMonitorHelpTexts(
                        monitorType,
                        controller.signal
                    );

                    // Check if operation was aborted before updating state
                    if (!controller.signal.aborted) {
                        setHelpTexts(texts);
                        setIsLoading(false);
                    }
                } catch (caughtError) {
                    // Don't log or update state if operation was aborted
                    if (controller.signal.aborted) {
                        return;
                    }

                    logger.warn(
                        "Failed to load help texts",
                        caughtError instanceof Error
                            ? caughtError
                            : new Error(String(caughtError))
                    );

                    const errorMessage =
                        caughtError instanceof Error
                            ? caughtError.message
                            : "Help text unavailable";
                    setError(errorMessage);
                    setHelpTexts({
                        primary: "Help text could not be loaded",
                        secondary: "Please check your connection and try again",
                    });
                    setIsLoading(false);
                }
            };

            void loadHelpTexts();

            return (): void => {
                controller.abort("Component unmounted or monitor type changed");
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
        [
            error,
            helpTexts,
            isLoading,
        ]
    );
}
