/**
 * Status distribution bar chart component with memoization for performance
 * optimization and status visualization.
 *
 * @remarks
 * This component displays status distribution (up/down/pending) using a bar
 * visualization. It uses selective Chart.js component registration for optimal
 * bundle size and integrates with the ChartConfigService for theming and
 * configuration. The component is memoized to prevent unnecessary re-renders
 * when parent component updates, optimizing performance for frequent status
 * updates in monitoring scenarios.
 *
 * @example Basic status chart with distribution data:
 *
 * ```tsx
 * <StatusChart
 *     data={{
 *         labels: ["Up", "Down", "Pending"],
 *         datasets: [
 *             {
 *                 label: "Status Count",
 *                 data: [45, 2, 3],
 *                 backgroundColor: ["#10B981", "#EF4444", "#F59E0B"],
 *                 borderColor: ["#059669", "#DC2626", "#D97706"],
 *                 borderWidth: 1,
 *             },
 *         ],
 *     }}
 *     options={barChartOptions}
 * />;
 * ```
 *
 * @example Usage within monitoring dashboard:
 *
 * ```tsx
 * const statusData = chartConfig.getStatusBarChartData(statusCounts);
 * const chartOptions = chartConfig.getBarChartConfig();
 *
 * return <StatusChart data={statusData} options={chartOptions} />;
 * ```
 *
 * @public
 */

import type { ChartOptions } from "chart.js";

import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip,
} from "chart.js";
import { memo, type NamedExoticComponent } from "react";
import { Bar } from "react-chartjs-2";

import type { StatusBarChartData } from "../../../services/chartConfig";

// Register only Chart.js components needed for bar charts (controller auto-registered by Bar component)
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

/**
 * Memoized status distribution bar chart component for monitoring status
 * visualization.
 *
 * @remarks
 * Displays status distribution (up/down/pending) using a bar chart
 * visualization with Chart.js. The component is memoized to prevent unnecessary
 * re-renders when parent component updates, providing optimal performance for
 * frequent status updates in monitoring contexts.
 *
 * @example
 *
 * ```tsx
 * <StatusChart data={statusDistributionData} options={barChartOptions} />;
 * ```
 *
 * @param props - The component properties containing data and options for the
 *   chart
 *
 * @returns Memoized bar chart component
 *
 * @public
 */
export const StatusChart: NamedExoticComponent<
    Readonly<{
        data: StatusBarChartData;
        options: ChartOptions<"bar">;
    }>
> = memo(function StatusChart({
    data,
    options,
}: Readonly<{
    data: StatusBarChartData;
    options: ChartOptions<"bar">;
}>) {
    return <Bar data={data} options={options} />;
});

// Set displayName explicitly for debugging
StatusChart.displayName = "StatusChart";
