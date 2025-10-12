/**
 * Runtime summarization utilities for monitor collections.
 *
 * @remarks
 * These helpers power renderer components that display aggregate runtime state,
 * such as "all monitors running" banners and quick statistics. They accept
 * lightweight monitor descriptors so callers can pass data from either shared
 * types or UI-specific projections.
 *
 * @public
 */

/**
 * Summary information about monitor runtime activity.
 *
 * @remarks
 * Captures whether every monitor is actively running alongside total and
 * running counts. Suitable for driving UI badges and alerts.
 *
 * @public
 */
export interface MonitorRuntimeSummary {
    /** True when every monitor in the collection is currently running. */
    readonly allRunning: boolean;
    /** Count of monitors currently running. */
    readonly runningCount: number;
    /** Total number of monitors in the collection. */
    readonly totalCount: number;
}

/**
 * Computes runtime summary information for a collection of monitors.
 *
 * @remarks
 * Tallies how many monitors are flagged as currently monitoring and whether
 * this includes the entire collection. The input only requires a `monitoring`
 * boolean, making it compatible with trimmed DTOs or store slices.
 *
 * @param monitors - Collection of monitor descriptors with a `monitoring` flag.
 *
 * @returns Summary counts describing monitor runtime state.
 *
 * @public
 */
export function getMonitorRuntimeSummary(
    monitors: ReadonlyArray<{ readonly monitoring: boolean }>
): MonitorRuntimeSummary {
    const totalCount = monitors.length;

    if (totalCount === 0) {
        return {
            allRunning: false,
            runningCount: 0,
            totalCount,
        };
    }

    let runningCount = 0;

    for (const monitor of monitors) {
        if (monitor.monitoring) {
            runningCount += 1;
        }
    }

    return {
        allRunning: runningCount === totalCount,
        runningCount,
        totalCount,
    };
}
