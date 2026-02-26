/**
 * Site card status display component. Provides visual status indicator for site
 * monitoring state.
 */

import type { MonitorStatus } from "@shared/types";

import { memo, type NamedExoticComponent, useCallback } from "react";

import { StatusBadge } from "../../common/StatusBadge";

/**
 * Props for the SiteCardStatus component.
 *
 * @public
 */
export interface SiteCardStatusProperties {
    /** Human-readable label for the selected monitor */
    readonly monitorLabel: string;
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
export const SiteCardStatus: NamedExoticComponent<SiteCardStatusProperties> =
    memo(function SiteCardStatusComponent({
        monitorLabel,
        status,
    }: SiteCardStatusProperties) {
        const safeMonitorLabel =
            monitorLabel.trim().length > 0 ? monitorLabel : "Monitor";

        const formatStatus = useCallback(
            (label: string, monitorStatus: MonitorStatus) =>
                `${label}: ${monitorStatus.charAt(0).toUpperCase()}${monitorStatus.slice(1)}`,
            []
        );

        return (
            <StatusBadge
                formatter={formatStatus}
                label={`${safeMonitorLabel} Status`}
                size="sm"
                status={status}
            />
        );
    });
