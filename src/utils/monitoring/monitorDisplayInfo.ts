import type { Monitor } from "@shared/types";

import {
    getMonitorDisplayIdentifier,
    getMonitorTypeDisplayLabel,
} from "../fallbacks";
import { formatTitleSuffix } from "../monitorTitleFormatters";

/**
 * Display metadata derived from monitor configuration fields.
 */
export interface MonitorDisplayInfo {
    readonly connectionInfo: string;
    readonly connectionInfoSource: "identifier" | "suffix";
    readonly monitorTypeLabel: string;
}

/**
 * Builds monitor type and connection display information.
 *
 * @remarks
 * Normalizes `formatTitleSuffix` output so wrapped values like
 * `"(api.example.com)"` render as `"api.example.com"`.
 */
export function buildMonitorDisplayInfo(args: {
    readonly fallbackIdentifier: string;
    readonly monitor: Monitor;
}): MonitorDisplayInfo {
    const { fallbackIdentifier, monitor } = args;

    const monitorTypeLabel = getMonitorTypeDisplayLabel(monitor.type);
    const suffix = formatTitleSuffix(monitor).trim();
    const normalizedSuffix =
        suffix.startsWith("(") && suffix.endsWith(")")
            ? suffix.slice(1, -1)
            : suffix;

    const [connectionInfo, connectionInfoSource] =
        normalizedSuffix.length > 0
            ? ([normalizedSuffix, "suffix"] as const)
            : ([
                  getMonitorDisplayIdentifier(monitor, fallbackIdentifier),
                  "identifier",
              ] as const);

    return {
        connectionInfo,
        connectionInfoSource,
        monitorTypeLabel,
    };
}
