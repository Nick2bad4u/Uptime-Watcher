/**
 * Site card status display component.
 * Provides visual status indicator for site monitoring state.
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
    selectedMonitorId: string;
    /** Current status of the monitor */
    status: MonitorStatus;
}

/**
 * Status section component for site card displaying current monitor status.
 *
 * Features:
 * - Visual status indicator using StatusBadge component
 * - Monitor type identification in status label
 * - Optimized with React.memo to prevent unnecessary re-renders
 * - Consistent styling with theme system
 *
 * @param props - Component props
 * @returns JSX element containing the status badge
 *
 * @example
 * ```tsx
 * <SiteCardStatus
 *   selectedMonitorId="http"
 *   status="up"
 * />
 * ```
 */
export const SiteCardStatus = React.memo(function SiteCardStatus({
    selectedMonitorId,
    status,
}: SiteCardStatusProperties) {
    return <StatusBadge label={`${selectedMonitorId.toUpperCase()} Status`} size="sm" status={status} />;
});
