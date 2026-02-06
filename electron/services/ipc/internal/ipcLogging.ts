/**
 * IPC logging configuration.
 */

import { MONITOR_TYPES_CHANNELS } from "@shared/types/preload";

import { isDev } from "../../../electronUtils";

const HIGH_FREQUENCY_OPERATIONS = new Set<string>([
    MONITOR_TYPES_CHANNELS.formatMonitorDetail,
    MONITOR_TYPES_CHANNELS.getMonitorTypes,
]);

/**
 * Determines whether an IPC handler should emit debug/warn logs.
 */
export function shouldLogHandler(channelName: string): boolean {
    return isDev() && !HIGH_FREQUENCY_OPERATIONS.has(channelName);
}
