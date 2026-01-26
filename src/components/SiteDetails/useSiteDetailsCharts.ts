/**
 * Chart wiring for {@link SiteDetails}.
 *
 * @remarks
 * The SiteDetails view builds multiple Chart.js datasets and option objects
 * derived from the site analytics hook. This module centralizes that logic so
 * the main component remains focused on layout and orchestration.
 *
 * @packageDocumentation
 */

import type { ChartOptions } from "chart.js";

import { useMemo } from "react";

import type { SiteAnalytics } from "../../hooks/site/useSiteAnalytics";
import type { Theme } from "../../theme/types";

import {
    ChartConfigService,
    type ResponseTimeChartData,
    type StatusBarChartData,
    type UptimeChartData,
} from "../../services/chartConfig";

interface StatusDistribution {
    readonly backgroundColors: string[];
    readonly borderColors: string[];
    readonly data: number[];
    readonly labels: string[];
}

/**
 * Builds chart configuration objects used by {@link SiteDetails}.
 *
 * @param analytics - Analytics computed by {@link useSiteAnalytics}.
 * @param currentTheme - Current application theme.
 *
 * @returns Memoized chart options and datasets.
 */
export function useSiteDetailsCharts(
    analytics: SiteAnalytics,
    currentTheme: Theme
): {
    readonly barChartData: StatusBarChartData;
    readonly barChartOptions: ChartOptions<"bar">;
    readonly doughnutChartData: UptimeChartData;
    readonly doughnutOptions: ChartOptions<"doughnut">;
    readonly lineChartData: ResponseTimeChartData;
    readonly lineChartOptions: ChartOptions<"line">;
} {
    const chartConfig = useMemo(
        () => new ChartConfigService(currentTheme),
        [currentTheme]
    );

    const lineChartOptions = useMemo(
        () => chartConfig.getLineChartConfig(),
        [chartConfig]
    );

    const barChartOptions = useMemo(
        () => chartConfig.getBarChartConfig(),
        [chartConfig]
    );

    const doughnutOptions = useMemo(
        () => chartConfig.getDoughnutChartConfig(analytics.totalChecks),
        [analytics.totalChecks, chartConfig]
    );

    const lineChartData = useMemo<ResponseTimeChartData>(
        () => ({
            datasets: [
                {
                    backgroundColor: `${currentTheme.colors.primary[500]}20`,
                    borderColor: currentTheme.colors.primary[500],
                    data: analytics.filteredHistory.map((h) => h.responseTime),
                    fill: true,
                    label: "Response Time (ms)",
                    tension: 0.1,
                },
            ],
            labels: analytics.filteredHistory.map((h) => new Date(h.timestamp)),
        }),
        [analytics.filteredHistory, currentTheme]
    );

    const statusDistribution = useMemo<StatusDistribution>(() => {
        const labels: string[] = [];
        const data: number[] = [];
        const backgroundColors: string[] = [];
        const borderColors: string[] = [];

        labels.push("Up");
        data.push(analytics.upCount);
        backgroundColors.push(currentTheme.colors.success);
        borderColors.push(currentTheme.colors.success);

        if (analytics.degradedCount > 0) {
            labels.push("Degraded");
            data.push(analytics.degradedCount);
            backgroundColors.push(currentTheme.colors.warning);
            borderColors.push(currentTheme.colors.warning);
        }

        labels.push("Down");
        data.push(analytics.downCount);
        backgroundColors.push(currentTheme.colors.error);
        borderColors.push(currentTheme.colors.error);

        return {
            backgroundColors,
            borderColors,
            data,
            labels,
        };
    }, [analytics.degradedCount, analytics.downCount, analytics.upCount, currentTheme]);

    const barChartData = useMemo<StatusBarChartData>(
        () => ({
            datasets: [
                {
                    backgroundColor: statusDistribution.backgroundColors,
                    borderColor: statusDistribution.borderColors,
                    borderWidth: 1,
                    data: statusDistribution.data,
                    label: "Status Distribution",
                },
            ],
            labels: statusDistribution.labels,
        }),
        [statusDistribution]
    );

    const doughnutChartData = useMemo<UptimeChartData>(
        () => ({
            datasets: [
                {
                    backgroundColor: statusDistribution.backgroundColors,
                    borderColor: statusDistribution.borderColors,
                    borderWidth: 1,
                    data: statusDistribution.data,
                },
            ],
            labels: statusDistribution.labels,
        }),
        [statusDistribution]
    );

    return {
        barChartData,
        barChartOptions,
        doughnutChartData,
        doughnutOptions,
        lineChartData,
        lineChartOptions,
    };
}
