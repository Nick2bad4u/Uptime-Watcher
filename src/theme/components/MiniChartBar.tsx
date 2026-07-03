/**
 * MiniChartBar component for displaying status in compact chart form.
 */

import type { SiteStatus } from "@shared/types";
import type { CoreComponentProperties } from "@shared/types/componentProps";
import type { CSSProperties, JSX, NamedExoticComponent } from "react";

import { safeParseIsoTimestamp } from "@shared/validation/statusUpdateSchemas";
import { memo, useMemo } from "react";

import { UiDefaults } from "../../utils/fallbacks";
import { formatResponseTime } from "../../utils/time";
import { useTheme } from "../useTheme";

const formatValidDate = (value: Date): string =>
    Number.isFinite(value.getTime())
        ? value.toLocaleString()
        : UiDefaults.notAvailableLabel;

const formatTimestampLabel = (timestamp: Date | number | string): string => {
    if (timestamp instanceof Date) {
        return formatValidDate(timestamp);
    }

    if (typeof timestamp === "number") {
        return Number.isFinite(timestamp)
            ? formatValidDate(new Date(timestamp))
            : UiDefaults.notAvailableLabel;
    }

    const parsed = safeParseIsoTimestamp(timestamp);
    return parsed.success
        ? formatValidDate(new Date(parsed.data))
        : UiDefaults.notAvailableLabel;
};

/**
 * Props for the MiniChartBar component
 *
 * @public
 */
export interface MiniChartBarProperties extends CoreComponentProperties {
    /** Response time in milliseconds for the status check */
    readonly responseTime?: number;
    /**
     * Current status of the monitor or site.
     *
     * @remarks
     * {@link SiteStatus} already includes all monitor-level status literals, so
     * a single type keeps the prop well-aligned with the domain contract.
     */
    readonly status: SiteStatus;
    /** Timestamp when the status was recorded */
    readonly timestamp: Date | number | string;
}

export const MiniChartBar: NamedExoticComponent<MiniChartBarProperties> = memo(
    function MiniChartBarComponent({
        className = "",
        responseTime,
        status,
        timestamp,
    }: MiniChartBarProperties): JSX.Element {
        const { currentTheme, getStatusColor } = useTheme();

        const styles = useMemo(
            (): CSSProperties => ({
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

        const timestampLabel = formatTimestampLabel(timestamp);

        return (
            <div
                className={`themed-mini-chart-bar ${className}`}
                style={styles}
                title={`${status} - ${formatResponseTime(responseTime)} at ${timestampLabel}`}
            />
        );
    }
);
