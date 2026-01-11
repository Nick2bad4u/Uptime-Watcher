/**
 * Site card status display component. Provides visual status indicator for site
 * monitoring state.
 */

import type { MonitorStatus } from "@shared/types";

import { memo, type NamedExoticComponent, useCallback, useMemo } from "react";

import { StatusBadge } from "../../common/StatusBadge";

/**
 * Props for the SiteCardStatus component.
 *
 * @public
 */
export interface SiteCardStatusProperties {
    /** ID of the currently selected monitor */
    readonly selectedMonitorId: string;
    /** Current status of the monitor */
    readonly status: MonitorStatus;
}

const STATUS_LABEL_ACRONYMS = new Set(["api", "dns", "http"]);

const toTitleCase = (value: string): string => {
    if (!value) {
        return "";
    }

    // Preserve already-uppercase segments.
    if (/^[A-Z0-9]+$/u.test(value)) {
        return value;
    }

    const lower = value.toLowerCase();
    if (STATUS_LABEL_ACRONYMS.has(lower)) {
        return lower.toUpperCase();
    }

    return `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`;
};

/**
 * Status section component for site card displaying current monitor status.
 *
 * Features:
 *
 * - Visual status indicator using StatusBadge component
 * - Monitor type identification in status label
 * - Optimized with React.memo to prevent unnecessary re-renders
 * - Consistent styling with theme system
 *
 * @example
 *
 * ```tsx
 * <SiteCardStatus selectedMonitorId="http" status="up" />;
 * ```
 *
 * @param props - Component props
 *
 * @returns JSX.Element containing the status badge
 *
 * @see StatusBadge For the underlying status display component
 */
export const SiteCardStatus: NamedExoticComponent<SiteCardStatusProperties> =
    memo(function SiteCardStatus({
        selectedMonitorId,
        status,
    }: SiteCardStatusProperties) {
        // Ensure selectedMonitorId is a string to prevent runtime errors
        const safeMonitorId = selectedMonitorId || "unknown";
        const statusLabel = useMemo(() => {
            const normalizedSegments = safeMonitorId
                .trim()
                .replaceAll(/[\p{Dash_Punctuation}_]+/gu, " ")
                .split(/\s+/u)
                .filter(Boolean)
                .map((segment) => toTitleCase(segment));

            const joined = normalizedSegments.join(" ").trim();
            return joined.length > 0 ? joined : "Monitor";
        }, [safeMonitorId]);

        const formatStatus = useCallback(
            (label: string, monitorStatus: MonitorStatus) =>
                `${label}: ${monitorStatus.charAt(0).toUpperCase()}${monitorStatus.slice(1)}`,
            []
        );

        return (
            <StatusBadge
                formatter={formatStatus}
                label={`${statusLabel} Status`}
                size="sm"
                status={status}
            />
        );
    });
