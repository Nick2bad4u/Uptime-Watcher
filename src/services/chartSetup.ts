/**
 * Centralized Chart.js setup and registration module.
 *
 * @remarks
 * This file provides centralized registration of Chart.js components and plugins
 * to avoid duplication across components and ensure consistent chart configuration.
 * All Chart.js registrations should happen here.
 */

import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    DoughnutController,
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
 * Re-exports essential Chart.js types to provide a single source of truth
 * for chart-related TypeScript definitions. This enables proper type checking
 * and IntelliSense support across the application while maintaining consistency.
 *
 * Types included:
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
 * Previously re-exported Chart.js types and React Chart.js components.
 * Import directly from the original packages as needed:
 * - ChartData, Chart as ChartJS, ChartOptions: Import from "chart.js"
 * - Bar, Doughnut, Line: Import from "react-chartjs-2"
 *
 * @public
 */
