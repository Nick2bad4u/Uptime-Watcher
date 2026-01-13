/**
 * Utilities used by the Site Details Settings tab.
 *
 * @remarks
 * Extracted from `SettingsTab.tsx` to keep the main component focused on UI
 * composition rather than calculations and async label resolution.
 */

import type { Monitor, Site } from "@shared/types";

import { withUtilityErrorHandling } from "@shared/utils/errorHandling";
import { useEffect, useState } from "react";

import {
    getMonitorDisplayIdentifier,
    getMonitorTypeDisplayLabel,
    UiDefaults,
} from "../../../utils/fallbacks";
import { getMonitorTypeConfig } from "../../../utils/monitorTypeHelper";

/** Format a seconds value and include a minutes breakdown for long durations. */
export function formatSecondsWithMinutes(totalSeconds: number): string {
    const safeSeconds = Number.isFinite(totalSeconds)
        ? Math.max(0, Math.round(totalSeconds))
        : 0;

    if (safeSeconds < 60) {
        return `${safeSeconds}s`;
    }

    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${safeSeconds}s (${minutes}m ${seconds}s)`;
}

function calculateBackoffSeconds(retryAttempts: number): number {
    if (retryAttempts <= 0) {
        return 0;
    }

    let backoffSeconds = 0;
    for (let i = 0; i < retryAttempts; i += 1) {
        backoffSeconds += 2 ** i;
    }

    return backoffSeconds;
}

/**
 * Calculate the maximum potential duration of a monitor check including retries
 * and exponential backoff.
 */
export function calculateMaxCheckDurationSeconds(args: {
    retryAttempts: number;
    timeoutSeconds: number;
}): {
    readonly backoffSeconds: number;
    readonly totalAttempts: number;
    readonly totalSeconds: number;
} {
    const totalAttempts = args.retryAttempts + 1;
    const backoffSeconds = calculateBackoffSeconds(args.retryAttempts);
    const totalSeconds = args.timeoutSeconds * totalAttempts + backoffSeconds;

    return {
        backoffSeconds,
        totalAttempts,
        totalSeconds,
    };
}

/**
 * Generate a display identifier based on the monitor type.
 */
export function getDisplayIdentifier(
    currentSite: Site,
    selectedMonitor: Monitor
): string {
    return getMonitorDisplayIdentifier(selectedMonitor, currentSite.identifier);
}

async function getIdentifierLabel(selectedMonitor: Monitor): Promise<string> {
    return withUtilityErrorHandling(
        async () => {
            const config = await getMonitorTypeConfig(selectedMonitor.type);
            if (config?.fields) {
                const primaryField = config.fields.find(
                    (field) => field.required
                );
                if (primaryField) {
                    return primaryField.label;
                }

                if (config.fields.length > 0 && config.fields[0]) {
                    return config.fields[0].label;
                }
            }

            return getMonitorTypeDisplayLabel(selectedMonitor.type);
        },
        "Get identifier label for monitor type",
        UiDefaults.unknownLabel
    );
}

/**
 * Hook that resolves the identifier label for the currently selected monitor.
 */
export function useIdentifierLabel(selectedMonitor: Monitor): string {
    const [label, setLabel] = useState<string>(UiDefaults.loadingLabel);

    useEffect(
        function loadLabelWithCleanup() {
            let isCancelled = false;

            const loadLabel = async (): Promise<void> => {
                const identifierLabel =
                    await getIdentifierLabel(selectedMonitor);
                if (!isCancelled) {
                    setLabel(identifierLabel);
                }
            };

            void loadLabel();

            return (): void => {
                isCancelled = true;
            };
        },
        [selectedMonitor]
    );

    return label;
}
