/**
 * Utilities used by the Site Details Settings tab.
 *
 * @remarks
 * Extracted from `SettingsTab.tsx` to keep the main component focused on UI
 * composition rather than calculations and async label resolution.
 */

import type { Monitor, Site } from "@shared/types";

import { withUtilityErrorHandling } from "@shared/utils/errorHandling";
import { useEffect, useMemo, useState } from "react";
import { arrayFirst, isFinite as isFiniteNumber } from "ts-extras";

import {
    getMonitorDisplayIdentifier,
    getMonitorTypeDisplayLabel,
    UiDefaults,
} from "../../../utils/fallbacks";
import { runSiteDetailsBackgroundOperation } from "../../../hooks/site/useSiteDetails.utils";
import { getMonitorTypeConfig } from "../../../utils/monitorTypeHelper";

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

/** Format a seconds value and include a minutes breakdown for long durations. */
export function formatSecondsWithMinutes(totalSeconds: number): string {
    const safeSeconds = isFiniteNumber(totalSeconds)
        ? Math.max(0, Math.round(totalSeconds))
        : 0;

    if (safeSeconds < 60) {
        return `${safeSeconds}s`;
    }

    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${safeSeconds}s (${minutes}m ${seconds}s)`;
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

/**
 * Hook that resolves the identifier label for the currently selected monitor.
 */
export function useIdentifierLabel(selectedMonitor: Monitor): string {
    const { type: monitorType } = selectedMonitor;
    const fallbackLabel = useMemo(
        () => getMonitorTypeDisplayLabel(monitorType),
        [monitorType]
    );
    const [resolvedLabel, setResolvedLabel] =
        useState<IdentifierLabelState>();
    const label =
        resolvedLabel?.monitorType === monitorType
            ? resolvedLabel.label
            : fallbackLabel;

    useEffect(
        function loadLabelWithCleanup() {
            let isCancelled = false;

            const loadLabel = async (): Promise<void> => {
                const identifierLabel = await getIdentifierLabel(monitorType);
                if (!isCancelled && identifierLabel !== fallbackLabel) {
                    setResolvedLabel((currentLabel) =>
                        currentLabel?.monitorType === monitorType &&
                        currentLabel.label === identifierLabel
                            ? currentLabel
                            : {
                                  label: identifierLabel,
                                  monitorType,
                              }
                    );
                }
            };

            runSiteDetailsBackgroundOperation(
                "SettingsTab.useIdentifierLabel.loadLabel",
                loadLabel
            );

            return (): void => {
                isCancelled = true;
            };
        },
        [fallbackLabel, monitorType]
    );

    return label;
}

interface IdentifierLabelState {
    readonly label: string;
    readonly monitorType: Monitor["type"];
}

function calculateBackoffSeconds(retryAttempts: number): number {
    if (retryAttempts <= 0) {
        return 0;
    }

    // Sum of exponential backoff delays: 2^0 + 2^1 + ... + 2^(n-1) = 2^n - 1
    return 2 ** retryAttempts - 1;
}

async function getIdentifierLabel(
    monitorType: Monitor["type"]
): Promise<string> {
    return withUtilityErrorHandling(
        async () => {
            const config = await getMonitorTypeConfig(monitorType);
            if (config?.fields) {
                const primaryField = config.fields.find(
                    (field) => field.required
                );
                if (primaryField) {
                    return primaryField.label;
                }

                const firstField = arrayFirst(config.fields);
                if (config.fields.length > 0 && firstField) {
                    return firstField.label;
                }
            }

            return getMonitorTypeDisplayLabel(monitorType);
        },
        "Get identifier label for monitor type",
        UiDefaults.unknownLabel
    );
}
