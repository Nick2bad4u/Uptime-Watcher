/**
 * Shared helpers for monitor service core factories.
 */

import type { Site } from "@shared/types";

import type { MonitorConfig } from "../types";

import { DEFAULT_REQUEST_TIMEOUT } from "../../../constants";
import { createMonitorConfig } from "./monitorServiceHelpers";

/**
 * Monitor narrowed to the provided type literal.
 */
export type MonitorByType<TType extends Site["monitors"][number]["type"]> =
    Site["monitors"][number] & { type: TType };

/**
 * Ensures the supplied monitor matches the expected type literal.
 *
 * @throws Error when the monitor type does not match the expected literal.
 */
export function ensureMonitorType<
    TType extends Site["monitors"][number]["type"],
>(
    monitor: Site["monitors"][number],
    expectedType: TType,
    scope: string
): MonitorByType<TType> {
    if (monitor.type !== expectedType) {
        throw new Error(`${scope} cannot handle monitor type: ${monitor.type}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Monitor type is validated against the expected literal above.
    return monitor as MonitorByType<TType>;
}

/**
 * Resolves retry attempts and timeout values for a monitor by merging monitor
 * overrides with the service configuration defaults.
 */
export function deriveMonitorTiming<
    TType extends Site["monitors"][number]["type"],
>(
    monitor: MonitorByType<TType>,
    serviceConfig: MonitorConfig
): {
    retryAttempts: number;
    timeout: number;
} {
    const normalized = createMonitorConfig(monitor, {
        timeout: serviceConfig.timeout ?? DEFAULT_REQUEST_TIMEOUT,
    });

    return {
        retryAttempts: normalized.retryAttempts,
        timeout: normalized.timeout,
    };
}
