/**
 * Enhanced chart components that use proper typings and React.memo for performance.
 * These components wrap react-chartjs-2 components to provide consistent typing
 * and avoid unnecessary re-renders.
 */

import { memo } from "react";

import { ResponseTimeChartData, StatusBarChartData, UptimeChartData } from "../../../services/chartConfig";
import { Bar, ChartOptions, Doughnut, Line } from "../../../services/chartSetup";

// We're using ChartOptions<"type"> directly in the components

/**
 * Response time line chart with proper typings and memoization
 */
export const ResponseTimeChart = memo(
    ({ data, options }: { data: ResponseTimeChartData; options: ChartOptions<"line"> }) => (
        <Line data={data} options={options} />
    )
);

/**
 * Uptime distribution doughnut chart with proper typings and memoization
 */
export const UptimeChart = memo(({ data, options }: { data: UptimeChartData; options: ChartOptions<"doughnut"> }) => (
    <Doughnut data={data} options={options} />
));

/**
 * Status distribution bar chart with proper typings and memoization
 */
export const StatusChart = memo(({ data, options }: { data: StatusBarChartData; options: ChartOptions<"bar"> }) => (
    <Bar data={data} options={options} />
));

// Set display names for better debugging
ResponseTimeChart.displayName = "ResponseTimeChart";
UptimeChart.displayName = "UptimeChart";
StatusChart.displayName = "StatusChart";
