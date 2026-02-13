import type { Monitor, StatusHistory } from "@shared/types";

/**
 * Computes the most recent monitor history timestamp from an arbitrary history
 * ordering.
 *
 * @param history - Monitor status history entries.
 *
 * @returns Latest timestamp in milliseconds, if any valid value exists.
 */
export function getLatestHistoryTimestamp(
    history: ReadonlyArray<Pick<StatusHistory, "timestamp">>
): number | undefined {
    let latestTimestamp: number | undefined = undefined;

    for (const record of history) {
        const { timestamp } = record;

        if (
            typeof timestamp === "number" &&
            Number.isFinite(timestamp) &&
            (latestTimestamp === undefined || timestamp > latestTimestamp)
        ) {
            latestTimestamp = timestamp;
        }
    }

    return latestTimestamp;
}

/**
 * Resolves the latest history timestamp for a monitor.
 *
 * @param monitor - Optional monitor instance.
 *
 * @returns Latest timestamp in milliseconds, or undefined when unavailable.
 */
export function getLatestMonitorHistoryTimestamp(
    monitor?: Pick<Monitor, "history">
): number | undefined {
    if (!monitor) {
        return undefined;
    }

    return getLatestHistoryTimestamp(monitor.history);
}
