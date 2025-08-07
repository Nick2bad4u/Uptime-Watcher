/**
 * Enhanced chart components that use proper typings and React.memo for performance.
 * These components wrap react-chartjs-2 components to provide consistent typing
 * and avoid unnecessary re-renders.
 *
 * Chart component wrappers for site monitoring visualizations
 *
 * Architecture Notes:
 * - Uses ChartOptions\<"type"\> directly to maintain type safety with Chart.js
 * - Memoization prevents unnecessary re-renders when parent components update
 * - Each component is typed for its specific chart type (line, doughnut, bar)
 */

import type { JSX } from "react/jsx-runtime";

import { memo, type MemoExoticComponent } from "react";

import { ResponseTimeChartData, StatusBarChartData, UptimeChartData } from "../../../services/chartConfig";
import { Bar, ChartOptions, Doughnut, Line } from "../../../services/chartSetup";

/**
 * Response time line chart component with memoization for performance optimization.
 *
 * Displays response time trends over time using a line chart visualization.
 * Memoized to prevent unnecessary re-renders when parent component updates.
 *
 * @param data - Chart.js compatible data configuration for line charts
 * @param options - Chart.js compatible options configuration for line charts
 * @returns Memoized line chart component
 */
export const ResponseTimeChart: MemoExoticComponent<
    ({ data, options }: { data: ResponseTimeChartData; options: ChartOptions<"line"> }) => JSX.Element
> = memo(({ data, options }: { readonly data: ResponseTimeChartData; readonly options: ChartOptions<"line"> }) => (
    <Line data={data} options={options} />
));

/**
 * Uptime distribution doughnut chart component with memoization for performance optimization.
 *
 * Displays uptime vs downtime distribution using a doughnut chart visualization.
 * Memoized to prevent unnecessary re-renders when parent component updates.
 *
 * @param data - Chart.js compatible data configuration for doughnut charts
 * @param options - Chart.js compatible options configuration for doughnut charts
 * @returns Memoized doughnut chart component
 */
export const UptimeChart: MemoExoticComponent<
    ({ data, options }: { data: UptimeChartData; options: ChartOptions<"doughnut"> }) => JSX.Element
> = memo(({ data, options }: { readonly data: UptimeChartData; readonly options: ChartOptions<"doughnut"> }) => (
    <Doughnut data={data} options={options} />
));

/**
 * Status distribution bar chart component with memoization for performance optimization.
 *
 * Displays status distribution (up/down/pending) using a bar chart visualization.
 * Memoized to prevent unnecessary re-renders when parent component updates.
 *
 * @param data - Chart.js compatible data configuration for bar charts
 * @param options - Chart.js compatible options configuration for bar charts
 * @returns Memoized bar chart component
 */
export const StatusChart: MemoExoticComponent<
    ({ data, options }: { data: StatusBarChartData; options: ChartOptions<"bar"> }) => JSX.Element
> = memo(({ data, options }: { readonly data: StatusBarChartData; readonly options: ChartOptions<"bar"> }) => (
    <Bar data={data} options={options} />
));

// Set display names for better debugging and React DevTools experience
// These names appear in React DevTools and error stack traces for easier debugging
ResponseTimeChart.displayName = "ResponseTimeChart";
UptimeChart.displayName = "UptimeChart";
StatusChart.displayName = "StatusChart";
