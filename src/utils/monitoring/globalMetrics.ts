/**
 * Aggregation helpers for computing global monitoring metrics across sites.
 *
 * @remarks
 * The dashboard surfaces a unified view of all monitors (uptime percentage,
 * incident counts, response time averages, etc.). Centralising the logic in
 * this module keeps rendering components lean and guarantees the numbers stay
 * consistent across the app.
 *
 * @public
 */

import type { Monitor, Site } from "@shared/types";

/**
 * Discrete monitor status counters used by the UI.
 *
 * @public
 */
export interface MonitorStatusCounts {
    /** Total monitors currently reporting `degraded`. */
    readonly degraded: number;
    /** Total monitors currently reporting `down`. */
    readonly down: number;
    /** Total monitors currently paused. */
    readonly paused: number;
    /** Total monitors currently reporting `pending`. */
    readonly pending: number;
    /** Total monitors tracked across all sites. */
    readonly total: number;
    /** Total monitors currently reporting `up`. */
    readonly up: number;
}

/**
 * Composite metrics describing the global monitoring state.
 *
 * @public
 */
export interface GlobalMonitoringMetrics {
    /** Number of monitors actively running. */
    readonly activeMonitors: number;
    /** Average response time (milliseconds) across monitors with data. */
    readonly averageResponseTime?: number;
    /** Number of monitors that are currently reporting incidents. */
    readonly incidentCount: number;
    /** Aggregated status counters. */
    readonly monitorStatusCounts: MonitorStatusCounts;
    /** Total monitors registered across all sites. */
    readonly totalMonitors: number;
    /** Total number of monitored sites. */
    readonly totalSites: number;
    /** Global uptime percentage rounded to the nearest integer. */
    readonly uptimePercentage: number;
}

/**
 * Calculates aggregated monitoring metrics for a collection of sites.
 *
 * @remarks
 * Iterates all monitors across the provided sites, deriving totals, incident
 * counts, uptime percentage, and averaged response times. Results feed the
 * dashboard summary cards and sparklines, ensuring renderer components remain
 * presentation-focused.
 *
 * @param sites - All sites available in the store.
 *
 * @returns A metrics object with totals, status counters, incidents, and
 *   derived figures used by the dashboard UI.
 *
 * @public
 */
export function calculateGlobalMonitoringMetrics(
    sites: readonly Site[]
): GlobalMonitoringMetrics {
    let totalMonitors = 0;
    let activeMonitors = 0;
    let up = 0;
    let down = 0;
    let degraded = 0;
    let pending = 0;
    let paused = 0;
    let responseTimeAccumulator = 0;
    let responseTimeSamples = 0;

    const processMonitor = (monitor: Monitor): void => {
        totalMonitors++;

        if (monitor.monitoring) {
            activeMonitors++;
        }

        switch (monitor.status) {
            case "degraded": {
                degraded++;
                break;
            }
            case "down": {
                down++;
                break;
            }
            case "paused": {
                paused++;
                break;
            }
            case "pending": {
                pending++;
                break;
            }
            case "up": {
                up++;
                break;
            }
            default: {
                break;
            }
        }

        if (Number.isFinite(monitor.responseTime) && monitor.responseTime > 0) {
            responseTimeAccumulator += monitor.responseTime;
            responseTimeSamples++;
        }
    };

    for (const site of sites) {
        for (const monitor of site.monitors) {
            processMonitor(monitor);
        }
    }

    const uptimePercentage = totalMonitors
        ? Math.round(((up + degraded * 0.5) / totalMonitors) * 100)
        : 0;

    const averageResponseTime = responseTimeSamples
        ? Math.round(responseTimeAccumulator / responseTimeSamples)
        : undefined;

    const baseMetrics: Omit<GlobalMonitoringMetrics, "averageResponseTime"> = {
        activeMonitors,
        incidentCount: down + degraded,
        monitorStatusCounts: {
            degraded,
            down,
            paused,
            pending,
            total: totalMonitors,
            up,
        },
        totalMonitors,
        totalSites: sites.length,
        uptimePercentage,
    };

    return averageResponseTime === undefined
        ? baseMetrics
        : {
              ...baseMetrics,
              averageResponseTime,
          };
}
