/**
 * Site card metrics display component. Provides visual representation of key
 * site monitoring statistics.
 */

import { memo, type NamedExoticComponent } from "react";

import { Tooltip } from "../../common/Tooltip/Tooltip";
import { MetricCard } from "./components/MetricCard";

/**
 * Descriptor for an individual metric pill displayed on the site card.
 *
 * @public
 */
export interface SiteCardMetricDescriptor {
    /** Stable key used as the React list key for efficient rendering */
    readonly key: string;
    /** Label describing the metric */
    readonly label: string;
    /** Optional helper text shown as a tooltip */
    readonly tooltip?: string;
    /** Display value for the metric */
    readonly value: number | string;
}

/**
 * Props for the SiteCardMetrics component.
 *
 * @public
 */
export interface SiteCardMetricsProperties {
    /** Collection of metrics to render in the pill grid */
    readonly metrics: readonly SiteCardMetricDescriptor[];
}

/**
 * Metrics grid component displaying key site monitoring statistics.
 *
 * @remarks
 * Renders a responsive grid of "pills" using {@link MetricCard}. Each metric can
 * optionally include a tooltip for additional context. The component is
 * memoized to avoid unnecessary re-renders when the metrics array reference is
 * stable.
 *
 * @param props - Component props containing the metrics to display
 *
 * @returns JSX element containing the metrics grid
 */
export const SiteCardMetrics: NamedExoticComponent<SiteCardMetricsProperties> =
    memo(function SiteCardMetricsComponent({
        metrics,
    }: SiteCardMetricsProperties) {
        return (
            <div
                className="site-card__metrics-grid"
                data-testid="site-card-metrics-content"
            >
                {metrics.map(({ key, label, tooltip, value }) => {
                    if (!tooltip) {
                        return (
                            <MetricCard key={key} label={label} value={value} />
                        );
                    }

                    return (
                        <Tooltip content={tooltip} key={key} position="bottom">
                            {(triggerProps) => (
                                <div
                                    {...triggerProps}
                                    className="metric-card__tooltip"
                                >
                                    <MetricCard label={label} value={value} />
                                </div>
                            )}
                        </Tooltip>
                    );
                })}
            </div>
        );
    });
