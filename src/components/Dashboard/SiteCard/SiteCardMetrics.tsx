/**
 * Site card metrics display component. Provides visual representation of key
 * site monitoring statistics.
 */

import { memo, type NamedExoticComponent, useMemo } from "react";

import { MetricCard } from "./components/MetricCard";

/**
 * Props for the SiteCardMetrics component.
 *
 * @public
 */
export interface SiteCardMetricsProperties {
    /** Total number of checks performed */
    readonly checkCount: number;
    /** Average response time in milliseconds */
    readonly responseTime?: number;
    /** Current status of the site */
    readonly status: string;
    /** Uptime percentage (0-100) */
    readonly uptime: number;
}

/**
 * Metrics grid component displaying key site monitoring statistics.
 *
 * Features:
 *
 * - Four-column grid layout for status, uptime, response time, and check count
 * - Optimized with React.memo and useMemo to prevent unnecessary re-renders
 * - Consistent metric card formatting
 * - Handles undefined response times gracefully (displays "-" when not available)
 * - Formats uptime to 1 decimal place for consistency
 *
 * @example
 *
 * ```tsx
 * <SiteCardMetrics
 *     status="up"
 *     uptime={98.5}
 *     responseTime={250}
 *     checkCount={144}
 * />;
 * ```
 *
 * @param props - Component props
 *
 * @returns JSX.Element containing the metrics grid
 */
export const SiteCardMetrics: NamedExoticComponent<SiteCardMetricsProperties> =
    memo(function SiteCardMetrics({
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
                    value: status ? status.toUpperCase() : "UNKNOWN",
                },
                {
                    label: "Uptime",
                    value: `${uptime.toFixed(1)}%`,
                },
                {
                    label: "Response",
                    value:
                        responseTime === undefined ? "-" : `${responseTime} ms`,
                },
                {
                    label: "Checks",
                    value: checkCount,
                },
            ],
            [
                checkCount,
                responseTime,
                status,
                uptime,
            ]
        );

        return (
            <div className="mb-4 grid grid-cols-4 gap-4">
                {metrics.map((metric) => (
                    <MetricCard
                        key={metric.label}
                        label={metric.label}
                        value={metric.value}
                    />
                ))}
            </div>
        );
    });
