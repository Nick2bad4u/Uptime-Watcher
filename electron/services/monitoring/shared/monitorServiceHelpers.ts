/**
 * Shared utilities for monitor services to reduce code duplication Contains
 * common patterns used across PingMonitor, PortMonitor, and HttpMonitor
 */

import type { Monitor } from "@shared/types";

import type { NormalizedMonitorConfig as NormalizedMonitorConfigType } from "../createMonitorConfig";
import type { MonitorCheckResult } from "../types";

import { createMonitorConfig as createMonitorConfigFactory } from "../createMonitorConfig";

/**
 * Derives a {@link NormalizedMonitorConfig} from a partial monitor and optional
 * default values.
 *
 * @param partial - Monitor fields to derive configuration from.
 * @param defaults - Optional overrides for normalized configuration defaults.
 *
 * @returns Fully normalized monitor configuration object.
 */
export function createMonitorConfig(
    partial: Partial<Monitor>,
    defaults: Partial<NormalizedMonitorConfigType> = {}
): NormalizedMonitorConfigType {
    return createMonitorConfigFactory(partial, defaults);
}

/**
 * Normalized monitor configuration used by monitor service implementations.
 */
export type NormalizedMonitorConfig = NormalizedMonitorConfigType;

/**
 * Create a standardized error result for monitor health checks
 *
 * @param error - Error message
 * @param responseTime - Response time in milliseconds
 *
 * @returns Standardized monitor health check error result
 */
export function createMonitorErrorResult(
    error: string,
    responseTime: number = 0
): MonitorCheckResult {
    return {
        error,
        responseTime,
        status: "down",
    };
}

/**
 * Validate that a monitor has the required host property
 *
 * @param monitor - Monitor to validate
 *
 * @returns Error message if validation fails, null if valid
 */
export function validateMonitorHost(monitor: Monitor): null | string {
    if (
        !monitor.host ||
        typeof monitor.host !== "string" ||
        monitor.host.trim() === ""
    ) {
        return "Monitor missing valid host";
    }
    return null;
}

/**
 * Validate that a monitor has the required host and port properties
 *
 * @param monitor - Monitor to validate
 *
 * @returns Error message if validation fails, null if valid
 */
export function validateMonitorHostAndPort(monitor: Monitor): null | string {
    const hostError = validateMonitorHost(monitor);
    if (hostError) {
        return hostError.replace("host", "host or port");
    }

    if (
        !monitor.port ||
        typeof monitor.port !== "number" ||
        monitor.port <= 0 ||
        monitor.port > 65_535
    ) {
        return "Monitor missing valid host or port";
    }
    return null;
}

/**
 * Validate that a monitor has the required URL property
 *
 * @param monitor - Monitor to validate
 *
 * @returns Error message if validation fails, null if valid
 */
export function validateMonitorUrl(monitor: Monitor): null | string {
    if (
        !monitor.url ||
        typeof monitor.url !== "string" ||
        monitor.url.trim() === ""
    ) {
        return "Monitor missing or invalid URL";
    }
    return null;
}

/**
 * Returns the provided value when it is not `null`/`undefined`, otherwise
 * yields the specified fallback.
 *
 * @typeParam T - The value type.
 *
 * @param value - Candidate value to unwrap.
 * @param fallback - Fallback value to use when `value` is nullish.
 */
export function withFallback<T>(value: null | T | undefined, fallback: T): T {
    return value ?? fallback;
}
const URL_LIST_SEPARATOR = /\r?\n|,/v;

/**
 * Parses a monitor URL list from a comma and/or newline separated string into a
 * normalized array of non-empty, trimmed URLs.
 *
 * @param value - Raw URL list string to parse.
 *
 * @returns Array of normalized URL strings.
 */
export function parseMonitorUrlList(value: string): string[] {
    if (typeof value !== "string" || value.trim().length === 0) {
        return [];
    }

    return value
        .split(URL_LIST_SEPARATOR)
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
}

/**
 * Extracts a nested field value from an arbitrary object using a dot-separated
 * path.
 *
 * @param source - Source object to traverse.
 * @param path - Dot-separated path (for example `details.status.code`).
 *
 * @returns The nested value when found; otherwise `undefined`.
 */
export function extractNestedFieldValue(
    source: unknown,
    path: string
): unknown {
    if (typeof path !== "string" || path.trim().length === 0) {
        return undefined;
    }

    const segments = path
        .split(".")
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0);

    let current: unknown = source;

    for (const segment of segments) {
        if (
            current !== null &&
            typeof current === "object" &&
            Object.hasOwn(current, segment)
        ) {
            current = Reflect.get(current, segment);
        } else {
            return undefined;
        }
    }

    return current;
}

const UNIX_SECONDS_THRESHOLD = 10_000_000_000;

/**
 * Normalizes a timestamp-like value into a Unix epoch millisecond value.
 *
 * @param value - Candidate timestamp expressed as a Date, seconds, or an
 *   ISO/string representation.
 *
 * @returns Epoch milliseconds when the value can be interpreted as a timestamp;
 *   otherwise `undefined`.
 */
export function normalizeTimestampValue(value: unknown): number | undefined {
    if (value instanceof Date) {
        return value.getTime();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        return value > UNIX_SECONDS_THRESHOLD
            ? Math.trunc(value)
            : Math.trunc(value * 1000);
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            return undefined;
        }

        const numeric = Number(trimmed);
        if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
            return numeric > UNIX_SECONDS_THRESHOLD
                ? Math.trunc(numeric)
                : Math.trunc(numeric * 1000);
        }

        const parsed = Date.parse(trimmed);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }

    return undefined;
}
