/**
 * Dynamic hook for loading monitor type help text.
 */

import { useState, useEffect } from "react";
import type { MonitorType } from "../types";
import { getMonitorHelpTexts } from "../utils";

/**
 * Hook for dynamic help text loading.
 */
export function useDynamicHelpText(monitorType: MonitorType) {
    const [helpTexts, setHelpTexts] = useState<{
        primary?: string;
        secondary?: string;
    }>({});

    useEffect(() => {
        let isCancelled = false;

        const loadHelpTexts = async () => {
            try {
                const texts = await getMonitorHelpTexts(monitorType);
                if (!isCancelled) {
                    setHelpTexts(texts);
                }
            } catch (error) {
                console.warn("Failed to load help texts:", error);
                if (!isCancelled) {
                    setHelpTexts({});
                }
            }
        };

        void loadHelpTexts();

        return () => {
            isCancelled = true;
        };
    }, [monitorType]);

    return helpTexts;
}
