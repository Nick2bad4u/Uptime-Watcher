/**
 * Site card metrics display component.
 * Provides visual representation of key site monitoring statistics.
 */

import React, { useMemo } from "react";

import { MetricCard } from "./components/MetricCard";

/**
 * Props for the SiteCardMetrics component.
 */
interface SiteCardMetricsProperties {
    /** Total number of checks performed */
    checkCount: number;
    /** Average response time in milliseconds */
    responseTime?: number;
    /** Current status of the site */
    status: string;
    /** Uptime percentage (0-100) */
    uptime: number;
}

/**
 * Metrics grid component displaying key site monitoring statistics.
 *
 * Features:
 * - Four-column grid layout for status, uptime, response time, and check count
 * - Optimized with React.memo and useMemo to prevent unnecessary re-renders
 * - Consistent metric card formatting
 * - Handles undefined response times gracefully
 *
 * @param props - Component props
 * @returns JSX element containing the metrics grid
 *
 * @example
 * ```tsx
 * <SiteCardMetrics
 *   status="up"
 *   uptime={98.5}
 *   responseTime={250}
 *   checkCount={144}
 * />
 * ```
 */
export const SiteCardMetrics = React.memo(function SiteCardMetrics({
    checkCount,
    responseTime,
    status,
    uptime,
}: SiteCardMetricsProperties) {
    // Memoize the computed values to avoid recalculation on every render
    const metrics = useMemo(
        () => [
            {
                label: "Status",
                value: status.toUpperCase() || "UNKNOWN",
            },
            {
                label: "Uptime",
                value: `${uptime}%`,
            },
            {
                label: "Response",
                value: responseTime === undefined ? "-" : `${responseTime} ms`,
            },
            {
                label: "Checks",
                value: checkCount,
            },
        ],
        [status, uptime, responseTime, checkCount]
    );

    return (
        <div className="grid grid-cols-4 gap-4 mb-4">
            {metrics.map((metric) => (
                <MetricCard key={metric.label} label={metric.label} value={metric.value} />
            ))}
        </div>
    );
});
