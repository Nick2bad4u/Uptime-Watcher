/**
 * @remarks
 * This centralized registration approach has been replaced with per-component
 * registration for better tree-shaking and bundle size optimization. Each chart
 * component now registers only the Chart.js components it actually needs.
 *
 * New approach: - UptimeChart: Registers ArcElement, DoughnutController,
 * Legend, Tooltip - ResponseTimeChart: Registers CategoryScale, LinearScale,
 * TimeScale, PointElement, LineElement, LineController, Title, Tooltip, Legend,
 * Filler, Zoom, plus date adapter - StatusChart: Registers CategoryScale,
 * LinearScale, BarElement, BarController, Title, Tooltip, Legend
 *
 * This file is maintained for compatibility with existing tests but should not
 * be imported in new code. Components should register their own Chart.js
 * requirements.
 *
 * @deprecated Chart.js setup and registration module - DEPRECATED
 *
 * @packageDocumentation
 */

import {
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    DoughnutController,
    Filler,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    TimeScale,
    Title,
    Tooltip,
} from "chart.js";
import Zoom from "chartjs-plugin-zoom";
// Side-effect import for Chart.js date adapter
// eslint-disable-next-line import-x/no-unassigned-import
import "chartjs-adapter-date-fns";

// Register all required Chart.js components centrally
ChartJS.register(
    // Scales
    CategoryScale,
    LinearScale,
    TimeScale,

    // Elements
    PointElement,
    LineElement,
    BarElement,
    ArcElement,

    // Controllers
    LineController,
    BarController,
    DoughnutController,

    // Plugins
    Title,
    Tooltip,
    Legend,
    Filler,
    Zoom
);

/**
 * Chart.js type exports for centralized type management.
 *
 * @remarks
 * Re-exports essential Chart.js types to provide a single source of truth for
 * chart-related TypeScript definitions. This enables proper type checking and
 * IntelliSense support across the application while maintaining consistency.
 *
 * Types included:
 *
 * - ChartData: Defines the data structure for charts
 * - ChartJS: Main Chart.js class for direct usage
 * - ChartOptions: Configuration options for chart behavior and styling
 *
 * @public
 */
/**
 * Chart.js setup and configuration.
 *
 * @remarks
 * This module registers all required Chart.js components centrally. Import
 * Chart.js and react-chartjs-2 components directly from their packages:
 *
 * - Chart: Import from "chart.js"
 * - Bar, Doughnut, Line: Import from "react-chartjs-2"
 * - ChartData, ChartOptions types: Import from "chart.js"
 *
 * @public
 */
