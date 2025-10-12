/**
 * Response time line chart component with memoization for performance
 * optimization and trend visualization.
 *
 * @remarks
 * This component displays response time trends over time using a line chart
 * visualization. It uses selective Chart.js component registration for optimal
 * bundle size and integrates with the ChartConfigService for theming and
 * configuration. The component is memoized to prevent unnecessary re-renders
 * when parent component updates, optimizing performance for real-time
 * monitoring data updates.
 *
 * @example Basic response time chart with trend data:
 *
 * ```tsx
 * <ResponseTimeChart
 *     data={{
 *         labels: timeLabels,
 *         datasets: [
 *             {
 *                 label: "Response Time (ms)",
 *                 data: responseTimes,
 *                 borderColor: "#3B82F6",
 *                 backgroundColor: "rgba(59, 130, 246, 0.1)",
 *                 tension: 0.4,
 *             },
 *         ],
 *     }}
 *     options={lineChartOptions}
 * />;
 * ```
 *
 * @example Usage within monitoring dashboard:
 *
 * ```tsx
 * const responseData =
 *     chartConfig.getResponseTimeChartData(historicalData);
 * const chartOptions = chartConfig.getLineChartConfig();
 *
 * return <ResponseTimeChart data={responseData} options={chartOptions} />;
 * ```
 *
 * @public
 */

import type { ChartOptions } from "chart.js";

import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeScale,
    Title,
    Tooltip,
} from "chart.js";
import Zoom from "chartjs-plugin-zoom";
// eslint-disable-next-line import-x/no-unassigned-import -- Required for Chart.js date adapter
import "chartjs-adapter-date-fns";
import { memo, type NamedExoticComponent } from "react";
import { Line } from "react-chartjs-2";

import type { ResponseTimeChartData } from "../../../services/chartConfig";

// Register only Chart.js components needed for line charts with zoom (controller auto-registered by Line component)
ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    Zoom
);

/**
 * Memoized response time line chart component for monitoring performance
 * trends.
 *
 * @remarks
 * Displays response time trends over time using a line chart visualization with
 * Chart.js. The component is memoized to prevent unnecessary re-renders when
 * parent component updates, providing optimal performance for real-time
 * monitoring data visualization.
 *
 * @example
 *
 * ```tsx
 * <ResponseTimeChart data={responseTimeData} options={lineChartOptions} />;
 * ```
 *
 * @param props - The component properties containing data and options for the
 *   chart.
 *
 * @returns Memoized line chart component.
 *
 * @public
 */
export const ResponseTimeChart: NamedExoticComponent<
    Readonly<{
        data: ResponseTimeChartData;
        options: ChartOptions<"line">;
    }>
> = memo(function ResponseTimeChart({
    data,
    options,
}: Readonly<{
    data: ResponseTimeChartData;
    options: ChartOptions<"line">;
}>) {
    return <Line data={data} options={options} />;
});

// Set displayName explicitly for debugging
ResponseTimeChart.displayName = "ResponseTimeChart";
