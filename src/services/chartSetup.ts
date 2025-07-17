/**
 * Centralized Chart.js setup and registration module.
 *
 * @remarks
 * This file provides centralized registration of Chart.js components and plugins
 * to avoid duplication across components and ensure consistent chart configuration.
 * All Chart.js registrations should happen here.
 */

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    DoughnutController,
    ArcElement,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
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
    zoomPlugin
);

/**
 * React-chartjs-2 components with proper typings.
 * Re-export these to make it clear which components should be used.
 */
export { Line, Bar, Doughnut } from "react-chartjs-2";

/**
 * Default Chart.js configuration export for type compatibility.
 * This enables TypeScript to properly resolve Chart.js types and components.
 * Chart.js types for proper TypeScript support.
 * Re-exporting these creates a single source of truth for chart-related types.
 */

export { type ChartOptions, Chart as ChartJS, type ChartData } from "chart.js";
