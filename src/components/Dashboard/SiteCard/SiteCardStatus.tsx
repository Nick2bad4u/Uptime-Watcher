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

const toTitleCase = (value: string): string =>
    `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`;

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
                .split(/\s+/)
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
