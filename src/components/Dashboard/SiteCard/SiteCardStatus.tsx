/**
 * Site card status display component. Provides visual status indicator for site
 * monitoring state.
 */

import type { MonitorStatus } from "@shared/types";

import React from "react";

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
export const SiteCardStatus: React.NamedExoticComponent<SiteCardStatusProperties> =
    React.memo(function SiteCardStatus({
        selectedMonitorId,
        status,
    }: SiteCardStatusProperties) {
        // Ensure selectedMonitorId is a string to prevent runtime errors
        const safeMonitorId = selectedMonitorId || "unknown";

        return (
            <StatusBadge
                label={`${safeMonitorId.toUpperCase()} Status`}
                size="sm"
                status={status}
            />
        );
    });
