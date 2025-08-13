/**
 * Response time line chart component with memoization for performance
 * optimization and trend visualization.
 *
 * @remarks
 * This component displays response time trends over time using a line chart
 * visualization. It leverages Chart.js through the chartSetup service for
 * rendering and integrates with the ChartConfigService for theming and
 * configuration. The component is memoized to prevent unnecessary re-renders
 * when parent component updates, optimizing performance for real-time
 * monitoring data updates.
 *
 * @example
 * Basic response time chart with trend data:
 * ```tsx
 * <ResponseTimeChart
 *   data={{
 *     labels: timeLabels,
 *     datasets: [{
 *       label: 'Response Time (ms)',
 *       data: responseTimes,
 *       borderColor: '#3B82F6',
 *       backgroundColor: 'rgba(59, 130, 246, 0.1)',
 *       tension: 0.4
 *     }]
 *   }}
 *   options={lineChartOptions}
 * />
 * ```
 *
 * @example
 * Usage within monitoring dashboard:
 * ```tsx
 * const responseData = chartConfig.getResponseTimeChartData(historicalData);
 * const chartOptions = chartConfig.getLineChartConfig();
 *
 * return (
 *   <ResponseTimeChart
 *     data={responseData}
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
import { Line } from "react-chartjs-2";

import type { ResponseTimeChartData } from "../../../services/chartConfig";

// Ensure Chart.js registration happens
// eslint-disable-next-line import-x/no-unassigned-import
import "../../../services/chartSetup";

/**
 * Memoized response time line chart component for monitoring performance
 * trends.
 *
 * @remarks
 * Displays response time trends over time using a line chart visualization
 * with Chart.js. The component is memoized to prevent unnecessary re-renders
 * when parent component updates, providing optimal performance for real-time
 * monitoring data visualization.
 *
 * @param props - The component properties containing data and options for the chart
 * @returns Memoized line chart component
 *
 * @example
 * ```tsx
 * <ResponseTimeChart
 *   data={responseTimeData}
 *   options={lineChartOptions}
 * />
 * ```
 *
 * @public
 */
const ResponseTimeChart: MemoExoticComponent<
    ({
        data,
        options,
    }: {
        data: ResponseTimeChartData;
        options: ChartOptions<"line">;
    }) => JSX.Element
> = memo(
    ({
        data,
        options,
    }: {
        readonly data: ResponseTimeChartData;
        readonly options: ChartOptions<"line">;
    }) => <Line data={data} options={options} />
);

// Set display name for better debugging and React DevTools experience
ResponseTimeChart.displayName = "ResponseTimeChart";

export default ResponseTimeChart;
