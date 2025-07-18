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

export { type ChartData, Chart as ChartJS, type ChartOptions } from "chart.js";

/**
 * Default Chart.js configuration export for type compatibility.
 * This enables TypeScript to properly resolve Chart.js types and components.
 * Chart.js types for proper TypeScript support.
 * Re-exporting these creates a single source of truth for chart-related types.
 */

/**
 * React-chartjs-2 components with proper typings.
 * Re-export these to make it clear which components should be used.
 */
export { Bar, Doughnut, Line } from "react-chartjs-2";
