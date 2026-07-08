import type { Monitor } from "@shared/types";
import { isStrictPlainDecimalNumberString } from "@shared/utils/decimalNumberString";
import { getNativeDateEpochMs } from "@shared/utils/nativeDate";
/**
 * Shared utilities for monitor services to reduce code duplication Contains
 * common patterns used across PingMonitor, PortMonitor, and HttpMonitor
 */

import {
    isValidFQDN,
    isValidHost,
    isValidPort,
    isValidUrl,
} from "@shared/validation/validatorUtils";
import { safeParseIsoTimestamp } from "@shared/validation/statusUpdateSchemas";
import { isFinite as isFiniteNumber } from "ts-extras";

import type { NormalizedMonitorConfig as NormalizedMonitorConfigType } from "../createMonitorConfig";
import type { MonitorCheckResult } from "../types";

import { createMonitorConfig as createMonitorConfigFactory } from "../createMonitorConfig";
import { extractMonitorValueAtPath } from "./monitorPathTraversal";

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
    responseTime = 0
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
function validateMonitorHost(monitor: Monitor): null | string {
    const rawHost = monitor.host;
    if (typeof rawHost !== "string") {
        return "Monitor missing valid host";
    }

    const host = rawHost.trim();
    if (host.length === 0) {
        return "Monitor missing valid host";
    }

    // Prefer validator.js-backed host checks over hand-rolled heuristics.
    // We allow:
    // - IP literals
    // - localhost
    // - FQDNs (including intranet-style single-label names)
    // This is intentionally more permissive than `isValidHost` alone.
    const isHostLooksValid =
        isValidHost(host) ||
        isValidFQDN(host, {
            allow_trailing_dot: true,
            allow_underscores: true,
            require_tld: false,
        });

    if (!isHostLooksValid) {
        return "Monitor missing valid host";
    }

    return null;
}

/**
 * Resolves a validated, trimmed monitor host or a standardized error result.
 *
 * @param monitor - Monitor to resolve
 *
 * @returns Validated host resolution result
 */
export function resolveMonitorHost(monitor: Monitor):
    | {
          host: string;
          ok: true;
      }
    | {
          ok: false;
          result: MonitorCheckResult;
      } {
    const hostError = validateMonitorHost(monitor);
    if (hostError) {
        return {
            ok: false,
            result: createMonitorErrorResult(hostError, 0),
        };
    }

    const rawHost = monitor.host;
    if (typeof rawHost !== "string") {
        return {
            ok: false,
            result: createMonitorErrorResult("Monitor missing valid host", 0),
        };
    }

    return {
        host: rawHost.trim(),
        ok: true,
    };
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

    if (!isValidPort(monitor.port)) {
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
    const rawUrl = monitor.url;

    return isValidHttpMonitorUrl(rawUrl)
        ? null
        : "Monitor missing or invalid URL";
}

/**
 * Validates a URL using the HTTP monitor runtime policy.
 *
 * @remarks
 * Keep this aligned with the shared monitor schema policy: trim user input,
 * restrict protocols to HTTP/S, accept local/intranet hosts, and require a
 * WHATWG-parsed hostname that passes shared host validation.
 *
 * @param value - Candidate URL value.
 *
 * @returns `true` when the value is a valid HTTP/S monitor URL.
 */
export function isValidHttpMonitorUrl(value: unknown): value is string {
    if (typeof value !== "string") {
        return false;
    }

    const url = value.trim();
    if (url.length === 0) {
        return false;
    }

    if (
        !isValidUrl(url, {
            allow_protocol_relative_urls: false,
            allowSingleQuotes: true,
            protocols: ["http", "https"],
            require_protocol: true,
            require_tld: false,
        })
    ) {
        return false;
    }

    try {
        const parsed = new URL(url);
        return isValidHost(parsed.hostname);
    } catch {
        return false;
    }
}

/**
 * Resolves a trimmed HTTP monitor URL or a standardized error message.
 *
 * @param value - Candidate URL value.
 * @param errorMessage - Message returned when validation fails.
 *
 * @returns Validated URL resolution result.
 */
export function resolveHttpMonitorUrl(
    value: unknown,
    errorMessage: string
):
    | {
          ok: false;
          message: string;
      }
    | {
          ok: true;
          value: string;
      } {
    if (!isValidHttpMonitorUrl(value)) {
        return {
            message: errorMessage,
            ok: false,
        };
    }

    return {
        ok: true,
        value: value.trim(),
    };
}

/**
 * Normalizes an externally supplied response time.
 *
 * @param value - Candidate response time.
 * @param fallback - Value used when `value` is missing or invalid.
 *
 * @returns A finite, non-negative, rounded response time.
 */
export function normalizeResponseTime(value: unknown, fallback = 0): number {
    if (typeof value === "number" && isFiniteNumber(value)) {
        return Math.max(0, Math.round(value));
    }

    return typeof fallback === "number" && isFiniteNumber(fallback)
        ? Math.max(0, Math.round(fallback))
        : 0;
}

const URL_LIST_SEPARATOR = /\r?\n|,/u;

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
    return extractMonitorValueAtPath(source, path, {
        allowArrayIndexTokens: false,
    });
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
        return getNativeDateEpochMs(value);
    }

    if (typeof value === "number" && isFiniteNumber(value)) {
        return value > UNIX_SECONDS_THRESHOLD
            ? Math.trunc(value)
            : Math.trunc(value * 1000);
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            return undefined;
        }

        if (isStrictPlainDecimalNumberString(trimmed)) {
            const numeric = Number(trimmed);
            return numeric > UNIX_SECONDS_THRESHOLD
                ? Math.trunc(numeric)
                : Math.trunc(numeric * 1000);
        }

        const timestampResult = safeParseIsoTimestamp(trimmed);
        if (timestampResult.success) {
            return Date.parse(timestampResult.data);
        }
    }

    return undefined;
}
