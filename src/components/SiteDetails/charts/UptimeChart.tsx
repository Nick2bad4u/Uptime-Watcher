/**
 * Uptime distribution doughnut chart component with memoization for performance
 * optimization.
 *
 * @remarks
 * This component displays uptime vs downtime distribution using a doughnut
 * chart visualization. It leverages Chart.js through the chartSetup service for
 * rendering and integrates with the ChartConfigService for theming. The
 * component is memoized to prevent unnecessary re-renders when parent component
 * updates, optimizing performance for frequent data updates.
 *
 * @example Basic uptime chart with data and options:
 *
 * ```tsx
 * <UptimeChart
 *     data={{
 *         labels: ["Uptime", "Downtime"],
 *         datasets: [
 *             {
 *                 data: [98.5, 1.5],
 *                 backgroundColor: ["#10B981", "#EF4444"],
 *                 borderWidth: 0,
 *             },
 *         ],
 *     }}
 *     options={doughnutChartOptions}
 * />;
 * ```
 *
 * @example Usage within SiteDetails component:
 *
 * ```tsx
 * const uptimeData = chartConfig.getUptimeChartData(
 *     site.uptime,
 *     site.downtime
 * );
 * const chartOptions = chartConfig.getDoughnutChartConfig();
 *
 * return <UptimeChart data={uptimeData} options={chartOptions} />;
 * ```
 *
 * @public
 */

import type { ChartOptions } from "chart.js";
import type { JSX } from "react/jsx-runtime";

import { memo, type MemoExoticComponent } from "react";
import { Doughnut } from "react-chartjs-2";

import type { UptimeChartData } from "../../../services/chartConfig";

// Ensure Chart.js registration happens
// eslint-disable-next-line import-x/no-unassigned-import
import "../../../services/chartSetup";

/**
 * Memoized uptime distribution doughnut chart component for site monitoring
 * visualization.
 *
 * @remarks
 * Displays uptime vs downtime distribution using a doughnut chart visualization
 * with Chart.js. The component is memoized to prevent unnecessary re-renders
 * when parent component updates, providing optimal performance for frequent
 * data updates in monitoring contexts.
 *
 * @example
 *
 * ```tsx
 * <UptimeChart data={uptimeChartData} options={doughnutOptions} />;
 * ```
 *
 * @param props - The component properties containing data and options for the
 *   chart
 *
 * @returns Memoized doughnut chart component
 *
 * @public
 */
const UptimeChart: MemoExoticComponent<
    ({
        data,
        options,
    }: {
        data: UptimeChartData;
        options: ChartOptions<"doughnut">;
    }) => JSX.Element
> = memo(
    ({
        data,
        options,
    }: {
        readonly data: UptimeChartData;
        readonly options: ChartOptions<"doughnut">;
    }) => <Doughnut data={data} options={options} />
);

// Set display name for better debugging and React DevTools experience
UptimeChart.displayName = "UptimeChart";

export default UptimeChart;
