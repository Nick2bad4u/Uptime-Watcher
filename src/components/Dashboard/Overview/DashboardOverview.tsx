/**
 * Compact dashboard overview cards summarising global monitoring health.
 *
 * @remarks
 * Renders a responsive grid of status cards inspired by modern collaboration
 * tools. The cards surface high-level metrics such as total sites, active
 * monitors, uptime, and incident counts. Each card uses the themed primitives
 * to stay consistent with the application's visual language.
 */

/* eslint-disable react/prop-types -- Component uses TypeScript for props validation. */

import type { NamedExoticComponent } from "react";

import { memo, useMemo } from "react";

import type { GlobalMonitoringMetrics } from "../../../utils/monitoring/globalMetrics";

import { ThemedBox } from "../../../theme/components/ThemedBox";
import { ThemedText } from "../../../theme/components/ThemedText";
import "./DashboardOverview.css";

/**
 * Properties for the {@link DashboardOverview} component.
 */
export interface DashboardOverviewProperties {
    /** Aggregated monitoring metrics. */
    readonly metrics: GlobalMonitoringMetrics;
    /** Localised label for the total site count indicator. */
    readonly siteCountLabel: string;
}

interface OverviewCardDescriptor {
    readonly description: string;
    readonly icon: string;
    readonly id: string;
    readonly label: string;
    readonly trend?: string;
    readonly value: string;
}

/**
 * Dashboard overview card grid presenting global monitoring metrics.
 */
export const DashboardOverview: NamedExoticComponent<DashboardOverviewProperties> =
    memo(function DashboardOverview({ metrics, siteCountLabel }) {
        const cards = useMemo<OverviewCardDescriptor[]>(() => {
            const averageResponse = metrics.averageResponseTime
                ? `${metrics.averageResponseTime} ms`
                : "—";
            const uptime = `${metrics.uptimePercentage}%`;
            const downMonitors = metrics.monitorStatusCounts.down;
            const degradedMonitors = metrics.monitorStatusCounts.degraded;

            return [
                {
                    description: "Sites currently under monitoring",
                    icon: "🛰️",
                    id: "sites",
                    label: siteCountLabel,
                    value: metrics.totalSites.toString(),
                },
                {
                    description: "Monitors with active polling",
                    icon: "📡",
                    id: "active-monitors",
                    label: "Active Monitors",
                    value: `${metrics.activeMonitors}/${metrics.totalMonitors}`,
                },
                {
                    description: "Global uptime across all monitors",
                    icon: "⚡",
                    id: "uptime",
                    label: "Global Uptime",
                    value: uptime,
                },
                {
                    description: "Monitors requiring attention",
                    icon: "🚨",
                    id: "incidents",
                    label: "Active Incidents",
                    trend: `${downMonitors} down · ${degradedMonitors} degraded`,
                    value: `${metrics.incidentCount}`,
                },
                {
                    description: "Average response time from active monitors",
                    icon: "⏱️",
                    id: "response",
                    label: "Avg Response",
                    value: averageResponse,
                },
            ];
        }, [
            metrics.activeMonitors,
            metrics.averageResponseTime,
            metrics.incidentCount,
            metrics.monitorStatusCounts.degraded,
            metrics.monitorStatusCounts.down,
            metrics.totalMonitors,
            metrics.totalSites,
            metrics.uptimePercentage,
            siteCountLabel,
        ]);

        return (
            <section
                aria-label="Monitoring overview"
                className="dashboard-overview"
            >
                <div className="dashboard-overview__grid">
                    {cards.map((card) => (
                        <ThemedBox
                            className="dashboard-overview__card"
                            key={card.id}
                            padding="lg"
                            rounded="lg"
                            shadow="md"
                            surface="elevated"
                        >
                            <div className="dashboard-overview__card-header">
                                <span
                                    aria-hidden="true"
                                    className="dashboard-overview__card-icon"
                                >
                                    {card.icon}
                                </span>
                                <ThemedText size="sm" variant="secondary">
                                    {card.label}
                                </ThemedText>
                            </div>

                            <ThemedText
                                className="dashboard-overview__card-value"
                                size="2xl"
                                weight="semibold"
                            >
                                {card.value}
                            </ThemedText>

                            <ThemedText
                                className="dashboard-overview__card-description"
                                size="xs"
                                variant="tertiary"
                            >
                                {card.description}
                            </ThemedText>

                            {card.trend ? (
                                <ThemedText
                                    className="dashboard-overview__card-trend"
                                    size="xs"
                                    variant="info"
                                >
                                    {card.trend}
                                </ThemedText>
                            ) : null}
                        </ThemedBox>
                    ))}
                </div>
            </section>
        );
    });

/* eslint-enable react/prop-types -- Re-enable prop-types lint rule. */
