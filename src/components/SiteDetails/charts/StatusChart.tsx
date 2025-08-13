/**
 * Status distribution bar chart component with memoization for performance optimization and status visualization.
 *
 * @remarks
 * This component displays status distribution (up/down/pending) using a bar chart visualization.
 * It leverages Chart.js through the chartSetup service for rendering and integrates with the
 * ChartConfigService for theming and configuration. The component is memoized to prevent
 * unnecessary re-renders when parent component updates, optimizing performance for frequent
 * status updates in monitoring scenarios.
 *
 * @example
 * Basic status chart with distribution data:
 * ```tsx
 * <StatusChart
 *   data={{
 *     labels: ['Up', 'Down', 'Pending'],
 *     datasets: [{
 *       label: 'Status Count',
 *       data: [45, 2, 3],
 *       backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
 *       borderColor: ['#059669', '#DC2626', '#D97706'],
 *       borderWidth: 1
 *     }]
 *   }}
 *   options={barChartOptions}
 * />
 * ```
 *
 * @example
 * Usage within monitoring dashboard:
 * ```tsx
 * const statusData = chartConfig.getStatusBarChartData(statusCounts);
 * const chartOptions = chartConfig.getBarChartConfig();
 *
 * return (
 *   <StatusChart
 *     data={statusData}
 *     options={chartOptions}
 *   />
 * );
 * ```
 *
 * @public
 */

import type { ChartOptions } from "chart.js";
import type { JSX } from "react/jsx-runtime";

import { memo, type MemoExoticComponent } from "react";
import { Bar } from "react-chartjs-2";

import type { StatusBarChartData } from "../../../services/chartConfig";

// Ensure Chart.js registration happens
// eslint-disable-next-line import-x/no-unassigned-import
import "../../../services/chartSetup";

/**
 * Memoized status distribution bar chart component for monitoring status visualization.
 *
 * @remarks
 * Displays status distribution (up/down/pending) using a bar chart visualization with Chart.js.
 * The component is memoized to prevent unnecessary re-renders when parent component updates,
 * providing optimal performance for frequent status updates in monitoring contexts.
 *
 * @param props - The component properties containing data and options for the chart
 * @returns Memoized bar chart component
 *
 * @example
 * ```tsx
 * <StatusChart
 *   data={statusDistributionData}
 *   options={barChartOptions}
 * />
 * ```
 *
 * @public
 */
const StatusChart: MemoExoticComponent<
    ({
        data,
        options,
    }: {
        data: StatusBarChartData;
        options: ChartOptions<"bar">;
    }) => JSX.Element
> = memo(
    ({
        data,
        options,
    }: {
        readonly data: StatusBarChartData;
        readonly options: ChartOptions<"bar">;
    }) => <Bar data={data} options={options} />
);

// Set display name for better debugging and React DevTools experience
StatusChart.displayName = "StatusChart";

export default StatusChart;
