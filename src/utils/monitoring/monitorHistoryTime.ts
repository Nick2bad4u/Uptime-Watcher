import type { Monitor, StatusHistory } from "@shared/types";

import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { isDefined, isSafeInteger } from "ts-extras";

const isValidHistoryTimestamp = (timestamp: unknown): timestamp is number =>
    typeof timestamp === "number" &&
    isSafeInteger(timestamp) &&
    timestamp >= 0 &&
    timestamp <= MAX_VALID_DATE_EPOCH_MS;

/**
 * Computes the most recent monitor history timestamp from an arbitrary history
 * ordering.
 *
 * @param history - Monitor status history entries.
 *
 * @returns Latest timestamp in milliseconds, if any valid value exists.
 */
export function getLatestHistoryTimestamp(
    history: readonly Pick<StatusHistory, "timestamp">[]
): number | undefined {
    let latestTimestamp: number | undefined;

    for (const record of history) {
        const { timestamp } = record;
        const hasLatestTimestamp = isDefined(latestTimestamp);

        if (
            isValidHistoryTimestamp(timestamp) &&
            (!hasLatestTimestamp || timestamp > (latestTimestamp ?? timestamp))
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
