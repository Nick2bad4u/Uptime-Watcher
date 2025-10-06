/**
 * Summary information about monitor runtime activity.
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
 * @param monitors - Collection of monitor descriptors with a `monitoring` flag.
 *
 * @returns Summary counts describing monitor runtime state.
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
