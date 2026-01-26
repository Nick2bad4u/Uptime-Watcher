/**
 * Analytics charts grid.
 *
 * @remarks
 * Extracted from {@link AnalyticsTab}.
 */

import type { MonitorType } from "@shared/types";
import type { ChartOptions } from "chart.js";

import { type JSX, useMemo } from "react";

import type {
    ResponseTimeChartData,
    StatusBarChartData,
    UptimeChartData,
} from "../../../../services/chartConfig";
import type { AnalyticsIconColors } from "./AnalyticsKeyMetricsGrid";

import { ThemedCard } from "../../../../theme/components/ThemedCard";
import { AppIcons } from "../../../../utils/icons";
import { ConditionalResponseTime } from "../../../common/MonitorUiComponents";
import { ResponseTimeChart } from "../../charts/ResponseTimeChart";
import { StatusChart } from "../../charts/StatusChart";
import { UptimeChart } from "../../charts/UptimeChart";

/**
 * Props for {@link AnalyticsChartsGrid}.
 *
 * @public
 */
export interface AnalyticsChartsGridProperties {
    readonly barChartData: StatusBarChartData;
    readonly barChartOptions: ChartOptions<"bar">;
    readonly doughnutOptions: ChartOptions<"doughnut">;
    readonly iconColors: AnalyticsIconColors;
    readonly lineChartData: ResponseTimeChartData;
    readonly lineChartOptions: ChartOptions<"line">;
    readonly monitorType: MonitorType;
    readonly uptimeChartData: UptimeChartData;
}

/**
 * Renders the analytics charts section.
 *
 * @public
 */
export const AnalyticsChartsGrid = ({
    barChartData,
    barChartOptions,
    doughnutOptions,
    iconColors,
    lineChartData,
    lineChartOptions,
    monitorType,
    uptimeChartData,
}: AnalyticsChartsGridProperties): JSX.Element => {
    const AnalyticsIcon = AppIcons.ui.analytics;
    const ResponseIcon = AppIcons.metrics.response;
    const UptimeIcon = AppIcons.metrics.uptime;

    const responseTimeIcon = useMemo(
        () => <ResponseIcon color={iconColors.performance} />,
        [iconColors.performance, ResponseIcon]
    );

    const uptimeIcon = useMemo(
        () => <UptimeIcon color={iconColors.uptime} />,
        [iconColors.uptime, UptimeIcon]
    );

    const statusDistributionIcon = useMemo(
        () => <AnalyticsIcon color={iconColors.charts} />,
        [AnalyticsIcon, iconColors.charts]
    );

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ConditionalResponseTime monitorType={monitorType}>
                <ThemedCard
                    icon={responseTimeIcon}
                    title="Response Time Trends"
                >
                    <div className="h-64">
                        <ResponseTimeChart
                            data={lineChartData}
                            options={lineChartOptions}
                        />
                    </div>
                </ThemedCard>
            </ConditionalResponseTime>

            <ThemedCard
                icon={uptimeIcon}
                title="Uptime Distribution"
            >
                <div className="h-64">
                    <UptimeChart data={uptimeChartData} options={doughnutOptions} />
                </div>
            </ThemedCard>

            <ThemedCard
                className="lg:col-span-2"
                icon={statusDistributionIcon}
                title="Status Distribution"
            >
                <div className="h-64">
                    <StatusChart data={barChartData} options={barChartOptions} />
                </div>
            </ThemedCard>
        </div>
    );
};
