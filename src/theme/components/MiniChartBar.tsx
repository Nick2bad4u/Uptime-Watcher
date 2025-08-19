/**
 * MiniChartBar component for displaying status in compact chart form.
 */

import type { MonitorStatus, SiteStatus } from "@shared/types";
import type { JSX } from "react/jsx-runtime";

import React, { useMemo } from "react";

import { formatResponseTime } from "../../utils/time";
import { useTheme } from "../useTheme";

/**
 * Props for the MiniChartBar component
 *
 * @public
 */
export interface MiniChartBarProperties {
    readonly className?: string;
    readonly responseTime?: number;
    readonly status: MonitorStatus | SiteStatus;
    readonly timestamp: Date | number | string;
}

const MiniChartBar = ({
    className = "",
    responseTime,
    status,
    timestamp,
}: MiniChartBarProperties): JSX.Element => {
    const { currentTheme, getStatusColor } = useTheme();

    const styles = useMemo(
        (): React.CSSProperties => ({
            backgroundColor: getStatusColor(status),
            borderRadius: currentTheme.borderRadius.sm,
            height: "32px",
            width: "8px",
        }),
        [
            currentTheme.borderRadius.sm,
            getStatusColor,
            status,
        ]
    );
    return (
        <div
            className={`themed-mini-chart-bar ${className}`}
            style={styles}
            title={`${status} - ${formatResponseTime(responseTime)} at ${new Date(timestamp).toLocaleString()}`}
        />
    );
};

export default MiniChartBar;
