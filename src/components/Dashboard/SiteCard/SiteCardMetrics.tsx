import React, { useMemo } from "react";

import { MetricCard } from "./components/MetricCard";

interface SiteCardMetricsProps {
    status: string;
    uptime: number;
    responseTime?: number;
    checkCount: number;
}

/**
 * Metrics grid section of the site card showing key statistics
 * Memoized to prevent unnecessary recalculations
 */
export const SiteCardMetrics = React.memo(function SiteCardMetrics({
    checkCount,
    responseTime,
    status,
    uptime,
}: SiteCardMetricsProps) {
    // Memoize the computed values to avoid recalculation on every render
    const metrics = useMemo(
        () => [
            {
                label: "Status",
                value: status?.toUpperCase() || "UNKNOWN",
            },
            {
                label: "Uptime",
                value: `${uptime}%`,
            },
            {
                label: "Response",
                value: responseTime !== undefined ? `${responseTime} ms` : "-",
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
