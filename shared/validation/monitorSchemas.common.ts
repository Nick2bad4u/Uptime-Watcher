/**
 * Shared schema primitives for monitor validation.
 *
 * @remarks
 * This module contains the shared building blocks used by the per-monitor-type
 * Zod schemas (base fields, URL validation helpers, header/json path
 * primitives, and cross-monitor validation constraints).
 *
 * It is intentionally internal to the validation layer; the public surface area
 * remains `monitorSchemas.ts`.
 */

import type { BaseMonitorSchemaType } from "@shared/types/schemaTypes";

import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";
import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";
import * as z from "zod";

import { monitorIdSchema } from "./monitorFieldSchemas";
import {
    monitorStatusEnumValues,
    statusHistoryEnumValues,
} from "./statusValidationPrimitives";
import { isValidHost } from "./validatorUtils";

/**
 * Zod schema for status history entries.
 *
 * @remarks
 * Validates historical status records for monitors.
 */
const statusHistorySchema = z
    .object({
        details: z.string().optional(),
        responseTime: z.number(),
        status: z.enum(statusHistoryEnumValues),
        timestamp: z.number(),
    })
    .strict();

/**
 * Validation constraints for monitor fields.
 *
 * @remarks
 * These values must match the UI constants in `@shared/constants`.
 */
interface MonitorValidationConstraints {
    readonly CHECK_INTERVAL: {
        readonly MAX: number;
        readonly MIN: number;
    };
    readonly RETRY_ATTEMPTS: {
        readonly MAX: number;
        readonly MIN: number;
    };
    readonly TIMEOUT: {
        readonly MAX: number;
        readonly MIN: number;
    };
}

export const VALIDATION_CONSTRAINTS: MonitorValidationConstraints = {
    CHECK_INTERVAL: {
        MAX: 2_592_000_000, // 30 days (maximum from CHECK_INTERVALS)
        MIN: MIN_MONITOR_CHECK_INTERVAL_MS,
    },
    RETRY_ATTEMPTS: {
        MAX: 10, // 10 retries maximum (from RETRY_CONSTRAINTS)
        MIN: 0, // 0 retries minimum (from RETRY_CONSTRAINTS)
    },
    TIMEOUT: {
        MAX: 300_000, // 300 seconds (from TIMEOUT_CONSTRAINTS_MS)
        MIN: 1000, // 1 second (from TIMEOUT_CONSTRAINTS_MS)
    },
};

/**
 * Reusable host validation schema for monitors.
 *
 * @remarks
 * Delegates to {@link isValidHost} so that hostnames, IPv4/IPv6 literals, and
 * `localhost` are all accepted consistently across monitor types.
 */
const hostValidationSchema = z
    .string({
        error: "Host is required",
    })
    .trim()
    .min(1, "Host is required")
    .refine(isValidHost, "Must be a valid hostname");

/**
 * Zod schema for base monitor fields shared by all monitor types.
 *
 * @remarks
 * This schema is extended by type-specific monitor schemas.
 */
const baseMonitorSchema: BaseMonitorSchemaType = z
    .object({
        activeOperations: z.array(z.string()).optional(),
        checkInterval: z
            .number()
            .min(
                VALIDATION_CONSTRAINTS.CHECK_INTERVAL.MIN,
                `Check interval must be at least ${MIN_MONITOR_CHECK_INTERVAL_MS}ms`
            )
            .max(
                VALIDATION_CONSTRAINTS.CHECK_INTERVAL.MAX,
                "Check interval cannot exceed 30 days"
            ),
        history: z.array(statusHistorySchema),
        id: monitorIdSchema,
        lastChecked: z.date().optional(),
        monitoring: z.boolean(),
        /**
         * Response time in milliseconds.
         *
         * @remarks
         * Uses -1 as a sentinel value to indicate "never checked" state.
         * Positive values represent actual response times in milliseconds.
         */
        responseTime: z.number().min(-1), // -1 is sentinel for "never checked"
        retryAttempts: z
            .number()
            .min(
                VALIDATION_CONSTRAINTS.RETRY_ATTEMPTS.MIN,
                "Retry attempts cannot be negative"
            )
            .max(
                VALIDATION_CONSTRAINTS.RETRY_ATTEMPTS.MAX,
                "Retry attempts cannot exceed 10"
            ),
        status: z.enum(monitorStatusEnumValues),
        timeout: z
            .number()
            .min(
                VALIDATION_CONSTRAINTS.TIMEOUT.MIN,
                "Timeout must be at least 1 second"
            )
            .max(
                VALIDATION_CONSTRAINTS.TIMEOUT.MAX,
                "Timeout cannot exceed 300 seconds"
            ),
        type: z.enum([
            "http",
            "http-header",
            "http-keyword",
            "http-json",
            "http-latency",
            "http-status",
            "port",
            "ping",
            "dns",
            "ssl",
            "cdn-edge-consistency",
            "replication",
            "server-heartbeat",
            "websocket-keepalive",
        ]),
    })
    .strict();

/**
 * Reusable URL validation helper restricted to a specific set of protocols.
 */
function isUrlWithAllowedProtocols(
    candidate: string,
    protocols: readonly string[]
): boolean {
    if (typeof candidate !== "string" || candidate.trim().length === 0) {
        return false;
    }

    // Defense-in-depth: reject ASCII control characters (including newlines)
    // to avoid ambiguous parsing/logging behavior.
    if (hasAsciiControlCharacters(candidate)) {
        return false;
    }

    const parsed = ((): null | URL => {
        try {
            return new URL(candidate);
        } catch {
            return null;
        }
    })();

    if (!parsed) {
        return false;
    }

    const scheme = parsed.protocol.replace(":", "").toLowerCase();
    if (!protocols.includes(scheme)) {
        return false;
    }

    return isValidHost(parsed.hostname);
}

/**
 * Creates a reusable URL schema restricted to a specific set of protocols.
 */
const createProtocolUrlSchema = (
    protocols: readonly string[],
    message: string
): z.ZodString =>
    z
        .string({
            error: "URL is required",
        })
        .min(1, "URL is required")
        .refine(
            (value): boolean => isUrlWithAllowedProtocols(value, protocols),
            message
        );

/** HTTP/S URL schema shared by multiple monitor types. */
const httpUrlSchema = createProtocolUrlSchema(
    ["http", "https"],
    "Must be a valid HTTP or HTTPS URL"
);

/** WebSocket URL schema shared by WebSocket monitors. */
const websocketUrlSchema = createProtocolUrlSchema(
    ["ws", "wss"],
    "Must be a valid WebSocket URL (ws:// or wss://)"
);

/**
 * RFC 7230 token characters permitted within HTTP header names.
 */
const ALLOWED_HEADER_SYMBOLS = new Set<string>([
    "!",
    "#",
    "$",
    "%",
    "&",
    "'",
    "*",
    "+",
    "-",
    ".",
    "^",
    "_",
    "`",
    "|",
    "~",
]);

/**
 * Determines whether a header name complies with HTTP token syntax.
 */
const isValidHeaderName = (value: string): boolean => {
    if (value.length === 0 || value.length > 256) {
        return false;
    }

    if (value.includes(":") || value.includes(" ")) {
        return false;
    }

    return Array.from(value).every((char) => {
        const codePoint = char.codePointAt(0);

        if (codePoint === undefined) {
            return false;
        }

        const isDigit = codePoint >= 48 && codePoint <= 57;
        const isUppercase = codePoint >= 65 && codePoint <= 90;
        const isLowercase = codePoint >= 97 && codePoint <= 122;

        return (
            isDigit ||
            isUppercase ||
            isLowercase ||
            ALLOWED_HEADER_SYMBOLS.has(char)
        );
    });
};

/** Shared schema enforcing {@link isValidHeaderName} constraints. */
const httpHeaderNameSchema = z
    .string()
    .min(1, "Header name is required")
    .max(256, "Header name must be 256 characters or fewer")
    .refine(isValidHeaderName, {
        error: "Header name must use valid HTTP token characters (letters, digits, and !#$%&'*+.^_`|~-)",
    });

/** Shared schema constraining monitored header values. */
const httpHeaderValueSchema = z
    .string()
    .min(1, "Expected header value is required")
    .max(2048, "Expected header value must be 2048 characters or fewer")
    .refine((value) => value.trim().length > 0, {
        error: "Expected header value is required",
    });

type DotSeparatedPathValidationOptions = Readonly<{
    /** When false, spaces are rejected anywhere in the path. */
    allowSpaces: boolean;
}>;

/** Validates whether a string represents a dot-separated path. */
const isValidDotSeparatedPath = (
    value: string,
    options: DotSeparatedPathValidationOptions
): boolean => {
    const trimmed = value.trim();

    if (trimmed.length === 0 || trimmed.includes("..")) {
        return false;
    }

    if (!options.allowSpaces && trimmed.includes(" ")) {
        return false;
    }

    return trimmed.split(".").every((segment) => segment.length > 0);
};

const isValidJsonPath = (value: string): boolean =>
    isValidDotSeparatedPath(value, { allowSpaces: false });

/** Shared schema validating JSON path configuration fields. */
const jsonPathSchema = z
    .string()
    .min(1, "JSON path is required")
    .max(512, "JSON path must be 512 characters or fewer")
    .refine(isValidJsonPath, {
        error: "JSON path must use dot notation without spaces or empty segments",
    });

const isValidDotPath = (value: string): boolean =>
    isValidDotSeparatedPath(value, { allowSpaces: false });

/**
 * Creates a dot-notation schema with a contextualized validation message.
 */
const createDotPathSchema = (fieldLabel: string): z.ZodString =>
    z
        .string()
        .min(1, `${fieldLabel} is required`)
        .max(256, `${fieldLabel} must be 256 characters or fewer`)
        .refine(isValidDotPath, {
            error: `${fieldLabel} must use dot notation without spaces or empty segments`,
        });

/**
 * Schema verifying newline- or comma-separated lists of edge endpoint URLs.
 */
const edgeLocationListSchema = z
    .string()
    .min(1, "At least one edge endpoint is required")
    .refine((value) => {
        const entries = value
            .split(/[\n\r,]+/u)
            .map((entry) => entry.trim())
            .filter((entry) => entry.length > 0);

        if (entries.length === 0) {
            return false;
        }

        return entries.every((entry) =>
            isUrlWithAllowedProtocols(entry, ["http", "https"])
        );
    }, "Edge endpoints must be valid HTTP or HTTPS URLs separated by commas or new lines");

/** Creates the shared base monitor schema instance. */
export function createBaseMonitorSchema(): BaseMonitorSchemaType {
    return baseMonitorSchema;
}

/** Creates the shared host validation schema instance. */
export function createHostValidationSchema(): z.ZodString {
    return hostValidationSchema;
}

/** Creates the shared HTTP/S URL schema instance. */
export function createHttpUrlSchema(): z.ZodString {
    return httpUrlSchema;
}

/** Creates the shared WebSocket URL schema instance. */
export function createWebsocketUrlSchema(): z.ZodString {
    return websocketUrlSchema;
}

/** Creates the shared HTTP header name schema instance. */
export function createHttpHeaderNameSchema(): z.ZodString {
    return httpHeaderNameSchema;
}

/** Creates the shared HTTP header value schema instance. */
export function createHttpHeaderValueSchema(): z.ZodString {
    return httpHeaderValueSchema;
}

/** Creates the shared JSON path schema instance. */
export function createJsonPathSchema(): z.ZodString {
    return jsonPathSchema;
}

/** Creates a dot-notation schema with a contextualized validation message. */
export function createDotPathSchemaFactory(fieldLabel: string): z.ZodString {
    return createDotPathSchema(fieldLabel);
}

/** Creates the shared edge location list schema instance. */
export function createEdgeLocationListSchema(): z.ZodString {
    return edgeLocationListSchema;
}
