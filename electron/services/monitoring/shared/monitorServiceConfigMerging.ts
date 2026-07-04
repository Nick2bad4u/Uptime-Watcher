import type { MonitorServiceConfig } from "../types";

import { getOwnDataProperty } from "@shared/utils/errorPropertyAccess";
import { safeObjectOmit } from "@shared/utils/objectSafety";
import { isDefined, isFinite as isFiniteNumber } from "ts-extras";

const RESERVED_MONITOR_SERVICE_CONFIG_KEYS = [
    "__proto__",
    "constructor",
    "prototype",
] as const;

/**
 * Creates a monitor service config with standard defaults and accessor-safe
 * overrides.
 */
export function createDefaultMonitorServiceConfig(args: {
    readonly config?: Partial<MonitorServiceConfig>;
    readonly defaultTimeoutMs: number;
    readonly defaultUserAgent?: string;
}): MonitorServiceConfig {
    return {
        timeout: args.defaultTimeoutMs,
        ...(args.defaultUserAgent && { userAgent: args.defaultUserAgent }),
        ...copyDefinedConfigData(args.config),
    };
}

/**
 * Merges runtime monitor service config updates without invoking accessors.
 */
export function mergeMonitorServiceConfig(args: {
    readonly currentConfig: MonitorServiceConfig;
    readonly update: Partial<MonitorServiceConfig>;
}): MonitorServiceConfig {
    return {
        ...copyDefinedConfigData(args.currentConfig),
        ...copyDefinedConfigData(args.update),
    };
}

/**
 * Validates a timeout update when it is supplied as an own data property.
 */
export function assertPositiveTimeoutConfigUpdate(
    config: Partial<MonitorServiceConfig>
): void {
    const timeoutProperty = getOwnDataProperty(config, "timeout");
    if (!timeoutProperty.found) {
        return;
    }

    const { value: timeout } = timeoutProperty;
    if (
        isDefined(timeout) &&
        (typeof timeout !== "number" ||
            !isFiniteNumber(timeout) ||
            timeout <= 0)
    ) {
        throw new Error("Invalid timeout: must be a positive number");
    }
}

function copyDefinedConfigData(
    config: Partial<MonitorServiceConfig> | undefined
): Partial<MonitorServiceConfig> {
    const configRecord = config as
        (Partial<MonitorServiceConfig> & Record<string, unknown>) | undefined;
    const copied = safeObjectOmit(
        configRecord,
        RESERVED_MONITOR_SERVICE_CONFIG_KEYS
    );

    for (const key of Reflect.ownKeys(copied)) {
        const property = getOwnDataProperty(copied, key);
        if (property.found && !isDefined(property.value)) {
            Reflect.deleteProperty(copied, key);
        }
    }

    return copied;
}
