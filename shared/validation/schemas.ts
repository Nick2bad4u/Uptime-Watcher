/**
 * Shared Zod validation schemas and validation utilities for monitor and site
 * data.
 *
 * @remarks
 * These schemas and functions are used by both frontend and backend to ensure
 * data integrity. Validation constraints are synchronized with the UI constants
 * defined in `@shared/constants`. All validation logic is centralized here for
 * consistency and maintainability.
 *
 * @packageDocumentation
 */

import type { MonitorStatus, StatusHistoryStatus } from "@shared/types";
import type {
    BaseMonitorSchemaType,
    CdnEdgeConsistencyMonitorSchemaType,
    DnsMonitorSchemaType,
    HttpHeaderMonitorSchemaType,
    HttpJsonMonitorSchemaType,
    HttpKeywordMonitorSchemaType,
    HttpLatencyMonitorSchemaType,
    HttpMonitorSchemaType,
    HttpStatusMonitorSchemaType,
    MonitorSchemaType,
    PingMonitorSchemaType,
    PortMonitorSchemaType,
    ReplicationMonitorSchemaType,
    ServerHeartbeatMonitorSchemaType,
    SiteSchemaType,
    SslMonitorSchemaType,
    WebsocketKeepaliveMonitorSchemaType,
} from "@shared/types/schemaTypes";
import type { ValidationResult } from "@shared/types/validation";
import type { UnknownRecord } from "type-fest";

import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";
import { STATUS_KIND } from "@shared/types";
import validator from "validator";
import * as z from "zod";

import { isValidHost, isValidPort } from "./validatorUtils";

const statusHistoryEnumValues: [StatusHistoryStatus, ...StatusHistoryStatus[]] =
    [
        STATUS_KIND.UP,
        STATUS_KIND.DOWN,
        STATUS_KIND.DEGRADED,
    ];

const monitorStatusEnumValues: [MonitorStatus, ...MonitorStatus[]] = [
    STATUS_KIND.DEGRADED,
    STATUS_KIND.DOWN,
    STATUS_KIND.PAUSED,
    STATUS_KIND.PENDING,
    STATUS_KIND.UP,
];

/**
 * Result object returned by validation functions.
 *
 * @remarks
 * Contains the validated data (if successful), errors, warnings, and metadata.
 */
// Import from unified validation system

/**
 * Reusable host validation schema for monitors. Eliminates duplication between
 * port and ping monitor schemas.
 */
const hostValidationSchema = z
    .string()
    .refine(isValidHost, "Must be a valid hostname, IP address, or localhost");

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
const VALIDATION_CONSTRAINTS = {
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
} as const;

/**
 * Zod schema for base monitor fields shared by all monitor types.
 *
 * @remarks
 * This schema is extended by type-specific monitor schemas.
 */
export const baseMonitorSchema: BaseMonitorSchemaType = z
    .object({
        activeOperations: z.array(z.string()).optional(),
        checkInterval: z
            .number()
            .min(
                VALIDATION_CONSTRAINTS.CHECK_INTERVAL.MIN,
                "Check interval must be at least 5 seconds"
            )
            .max(
                VALIDATION_CONSTRAINTS.CHECK_INTERVAL.MAX,
                "Check interval cannot exceed 30 days"
            ),
        history: z.array(statusHistorySchema),
        id: z.string().min(1, "Monitor ID is required"),
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
 * Reusable HTTP URL validation schema for multiple monitor types.
 */
const httpUrlSchema = z.string().refine(
    (val) =>
        // Use validator.js for robust URL validation
        validator.isURL(val, {
            allow_protocol_relative_urls: false,
            allow_trailing_dot: false,
            allow_underscores: false,
            disallow_auth: false,
            protocols: ["http", "https"],
            require_host: true,
            require_protocol: true,
            require_tld: true,
            validate_length: true,
        }),
    "Must be a valid HTTP or HTTPS URL"
);

/**
 * Reusable WebSocket URL validation schema for multiple monitor types.
 */
const websocketUrlSchema = z.string().refine(
    (val) =>
        validator.isURL(val, {
            allow_protocol_relative_urls: false,
            allow_trailing_dot: false,
            allow_underscores: false,
            disallow_auth: false,
            protocols: ["ws", "wss"],
            require_host: true,
            require_protocol: true,
            require_tld: true,
            validate_length: true,
        }),
    "Must be a valid WebSocket URL (ws:// or wss://)"
);

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

const httpHeaderNameSchema = z
    .string()
    .min(1, "Header name is required")
    .max(256, "Header name must be 256 characters or fewer")
    .refine(isValidHeaderName, {
        message:
            "Header name must use valid HTTP token characters (letters, digits, and !#$%&'*+.^_`|~-)",
    });

const httpHeaderValueSchema = z
    .string()
    .min(1, "Expected header value is required")
    .max(2048, "Expected header value must be 2048 characters or fewer")
    .refine((value) => value.trim().length > 0, {
        message: "Expected header value is required",
    });
const isValidJsonPath = (value: string): boolean => {
    const trimmed = value.trim();

    if (trimmed.length === 0 || trimmed.includes("..")) {
        return false;
    }

    return trimmed
        .split(".")
        .every((segment) => segment.length > 0 && !segment.includes(" "));
};

const jsonPathSchema = z
    .string()
    .min(1, "JSON path is required")
    .max(512, "JSON path must be 512 characters or fewer")
    .refine(isValidJsonPath, {
        message:
            "JSON path must use dot notation without spaces or empty segments",
    });

const isValidDotPath = (value: string): boolean => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.includes("..")) {
        return false;
    }

    return trimmed.split(".").every((segment) => segment.length > 0);
};

const createDotPathSchema = (fieldLabel: string): z.ZodString =>
    z
        .string()
        .min(1, `${fieldLabel} is required`)
        .max(256, `${fieldLabel} must be 256 characters or fewer`)
        .refine(isValidDotPath, {
            message: `${fieldLabel} must use dot notation without spaces or empty segments`,
        });

const edgeLocationListSchema = z
    .string()
    .min(1, "At least one edge endpoint is required")
    .refine((value) => {
        const entries = value
            .split(/[\r\n,]+/v)
            .map((entry) => entry.trim())
            .filter((entry) => entry.length > 0);

        if (entries.length === 0) {
            return false;
        }

        return entries.every((entry) =>
            validator.isURL(entry, {
                allow_protocol_relative_urls: false,
                allow_trailing_dot: false,
                allow_underscores: false,
                disallow_auth: false,
                protocols: ["http", "https"],
                require_host: true,
                require_protocol: true,
                require_tld: true,
                validate_length: true,
            })
        );
    }, "Edge endpoints must be valid HTTP or HTTPS URLs separated by commas or new lines");

/**
 * Zod schema for HTTP monitor fields.
 *
 * @remarks
 * Extends {@link baseMonitorSchema} and adds the `url` field with robust
 * validation.
 */

export const httpMonitorSchema: HttpMonitorSchemaType = baseMonitorSchema
    .extend({
        type: z.literal("http"),
        url: httpUrlSchema,
    })
    .strict();

/**
 * Zod schema for HTTP header monitor fields.
 *
 * @remarks
 * Extends {@link baseMonitorSchema} and validates header name/value pairs for
 * response inspection.
 */
export const httpHeaderMonitorSchema: HttpHeaderMonitorSchemaType =
    baseMonitorSchema
        .extend({
            expectedHeaderValue: httpHeaderValueSchema,
            headerName: httpHeaderNameSchema,
            type: z.literal("http-header"),
            url: httpUrlSchema,
        })
        .strict();

/**
 * Zod schema for HTTP keyword monitor fields.
 *
 * @remarks
 * Extends {@link baseMonitorSchema} and adds `bodyKeyword` for response content
 * validation alongside the shared URL validation.
 */
export const httpKeywordMonitorSchema: HttpKeywordMonitorSchemaType =
    baseMonitorSchema
        .extend({
            bodyKeyword: z
                .string()
                .min(1, "Keyword is required")
                .max(1024, "Keyword must be 1024 characters or fewer")
                .refine((keyword) => keyword.trim().length > 0, {
                    message: "Keyword is required",
                }),
            type: z.literal("http-keyword"),
            url: httpUrlSchema,
        })
        .strict();

/**
 * Zod schema for HTTP JSON monitor fields.
 *
 * @remarks
 * Validates dot-notation JSON paths and expected values for structured content
 * checks.
 */
export const httpJsonMonitorSchema: HttpJsonMonitorSchemaType =
    baseMonitorSchema
        .extend({
            expectedJsonValue: z
                .string()
                .min(1, "Expected JSON value is required")
                .max(
                    2048,
                    "Expected JSON value must be 2048 characters or fewer"
                )
                .refine((value) => value.trim().length > 0, {
                    message: "Expected JSON value is required",
                }),
            jsonPath: jsonPathSchema,
            type: z.literal("http-json"),
            url: httpUrlSchema,
        })
        .strict();

/**
 * Zod schema for HTTP status monitor fields.
 *
 * @remarks
 * Extends {@link baseMonitorSchema} and adds `expectedStatusCode` for response
 * status validation alongside the shared URL validation.
 */
export const httpStatusMonitorSchema: HttpStatusMonitorSchemaType =
    baseMonitorSchema
        .extend({
            expectedStatusCode: z
                .number()
                .int("Status code must be an integer")
                .min(100, "Status code must be between 100 and 599")
                .max(599, "Status code must be between 100 and 599"),
            type: z.literal("http-status"),
            url: httpUrlSchema,
        })
        .strict();

/**
 * Zod schema for HTTP latency monitor fields.
 *
 * @remarks
 * Ensures latency thresholds are positive and within sensible limits.
 */
export const httpLatencyMonitorSchema: HttpLatencyMonitorSchemaType =
    baseMonitorSchema
        .extend({
            maxResponseTime: z
                .number()
                .min(1, "Maximum response time must be at least 1 millisecond")
                .max(
                    VALIDATION_CONSTRAINTS.TIMEOUT.MAX,
                    "Maximum response time cannot exceed 300 seconds"
                ),
            type: z.literal("http-latency"),
            url: httpUrlSchema,
        })
        .strict();

/**
 * Zod schema for port monitor fields.
 *
 * @remarks
 * Extends {@link baseMonitorSchema} and adds `host` and `port` fields with
 * strict validation.
 */
export const portMonitorSchema: PortMonitorSchemaType = baseMonitorSchema
    .extend({
        host: hostValidationSchema,
        port: z
            .number()
            .refine(isValidPort, "Must be a valid port number (1-65535)"),
        type: z.literal("port"),
    })
    .strict();

/**
 * Zod schema for ping monitor fields.
 *
 * @remarks
 * Extends {@link baseMonitorSchema} and adds `host` field with strict
 * validation.
 */
export const pingMonitorSchema: PingMonitorSchemaType = baseMonitorSchema
    .extend({
        host: hostValidationSchema,
        type: z.literal("ping"),
    })
    .strict();

/**
 * Zod schema for DNS monitor fields.
 *
 * @remarks
 * Extends {@link baseMonitorSchema} and adds DNS-specific fields for domain name
 * resolution monitoring with support for different record types.
 */
export const dnsMonitorSchema: DnsMonitorSchemaType = baseMonitorSchema
    .extend({
        expectedValue: z.string().optional(),
        host: hostValidationSchema,
        recordType: z.enum([
            "A",
            "AAAA",
            "ANY",
            "CAA",
            "CNAME",
            "MX",
            "NAPTR",
            "NS",
            "PTR",
            "SOA",
            "SRV",
            "TLSA",
            "TXT",
        ]),
        type: z.literal("dns"),
    })
    .strict();

/**
 * Zod schema for SSL monitor fields.
 *
 * @remarks
 * Extends {@link baseMonitorSchema} and adds SSL-specific fields for certificate
 * monitoring.
 */
export const sslMonitorSchema: SslMonitorSchemaType = baseMonitorSchema
    .extend({
        certificateWarningDays: z
            .number()
            .min(1, "Certificate warning threshold must be at least 1 day")
            .max(365, "Certificate warning threshold cannot exceed 365 days"),
        host: hostValidationSchema,
        port: z
            .number()
            .refine(isValidPort, "Must be a valid port number (1-65535)"),
        type: z.literal("ssl"),
    })
    .strict();

/**
 * Zod schema for CDN edge consistency monitor fields.
 */
export const cdnEdgeConsistencyMonitorSchema: CdnEdgeConsistencyMonitorSchemaType =
    baseMonitorSchema
        .extend({
            baselineUrl: httpUrlSchema,
            edgeLocations: edgeLocationListSchema,
            type: z.literal("cdn-edge-consistency"),
        })
        .strict();

/**
 * Zod schema for replication monitor fields.
 */
export const replicationMonitorSchema: ReplicationMonitorSchemaType =
    baseMonitorSchema
        .extend({
            maxReplicationLagSeconds: z
                .number()
                .min(0, "Replication lag threshold must be zero or greater"),
            primaryStatusUrl: httpUrlSchema,
            replicaStatusUrl: httpUrlSchema,
            replicationTimestampField: createDotPathSchema(
                "Replication timestamp field"
            ),
            type: z.literal("replication"),
        })
        .strict();

/**
 * Zod schema for server heartbeat monitor fields.
 */
export const serverHeartbeatMonitorSchema: ServerHeartbeatMonitorSchemaType =
    baseMonitorSchema
        .extend({
            heartbeatExpectedStatus: z
                .string()
                .min(1, "Expected status is required")
                .max(128, "Expected status must be 128 characters or fewer")
                .refine((value) => value.trim().length > 0, {
                    message: "Expected status is required",
                }),
            heartbeatMaxDriftSeconds: z
                .number()
                .min(0, "Heartbeat drift tolerance must be zero or greater")
                .max(
                    86_400,
                    "Heartbeat drift tolerance cannot exceed 24 hours"
                ),
            heartbeatStatusField: createDotPathSchema("Heartbeat status field"),
            heartbeatTimestampField: createDotPathSchema(
                "Heartbeat timestamp field"
            ),
            type: z.literal("server-heartbeat"),
            url: httpUrlSchema,
        })
        .strict();

/**
 * Zod schema for WebSocket keepalive monitor fields.
 */
export const websocketKeepaliveMonitorSchema: WebsocketKeepaliveMonitorSchemaType =
    baseMonitorSchema
        .extend({
            maxPongDelayMs: z
                .number()
                .min(10, "Maximum pong delay must be at least 10 milliseconds")
                .max(60_000, "Maximum pong delay cannot exceed 60 seconds"),
            type: z.literal("websocket-keepalive"),
            url: websocketUrlSchema,
        })
        .strict();

/**
 * Zod discriminated union schema for all monitor types.
 *
 * @remarks
 * Supports the full set of monitor types declared in the shared domain.
 */
export const monitorSchema: MonitorSchemaType = z.discriminatedUnion("type", [
    httpMonitorSchema,
    httpHeaderMonitorSchema,
    httpJsonMonitorSchema,
    httpKeywordMonitorSchema,
    httpLatencyMonitorSchema,
    httpStatusMonitorSchema,
    portMonitorSchema,
    pingMonitorSchema,
    dnsMonitorSchema,
    sslMonitorSchema,
    cdnEdgeConsistencyMonitorSchema,
    replicationMonitorSchema,
    serverHeartbeatMonitorSchema,
    websocketKeepaliveMonitorSchema,
]);

/**
 * Zod schema for site data.
 *
 * @remarks
 * Validates site identifier, name, monitoring flag, and an array of monitors.
 */
export const siteSchema: SiteSchemaType = z
    .object({
        identifier: z
            .string()
            .min(1, "Site identifier is required")
            .max(100, "Site identifier too long"),
        monitoring: z.boolean(),
        monitors: z
            .array(monitorSchema)
            .min(1, "At least one monitor is required"),
        name: z
            .string()
            .min(1, "Site name is required")
            .max(200, "Site name too long"),
    })
    .strict();

/**
 * Interface for monitor schemas by type.
 */
export interface MonitorSchemas {
    readonly "cdn-edge-consistency": typeof cdnEdgeConsistencyMonitorSchema;
    readonly dns: typeof dnsMonitorSchema;
    readonly http: typeof httpMonitorSchema;
    readonly "http-header": typeof httpHeaderMonitorSchema;
    readonly "http-json": typeof httpJsonMonitorSchema;
    readonly "http-keyword": typeof httpKeywordMonitorSchema;
    readonly "http-latency": typeof httpLatencyMonitorSchema;
    readonly "http-status": typeof httpStatusMonitorSchema;
    readonly ping: typeof pingMonitorSchema;
    readonly port: typeof portMonitorSchema;
    readonly replication: typeof replicationMonitorSchema;
    readonly "server-heartbeat": typeof serverHeartbeatMonitorSchema;
    readonly ssl: typeof sslMonitorSchema;
    readonly "websocket-keepalive": typeof websocketKeepaliveMonitorSchema;
}

/**
 * Organized monitor schemas by type.
 *
 * @remarks
 * Useful for dynamic schema selection.
 */
export const monitorSchemas: MonitorSchemas = {
    "cdn-edge-consistency": cdnEdgeConsistencyMonitorSchema,
    dns: dnsMonitorSchema,
    http: httpMonitorSchema,
    "http-header": httpHeaderMonitorSchema,
    "http-json": httpJsonMonitorSchema,
    "http-keyword": httpKeywordMonitorSchema,
    "http-latency": httpLatencyMonitorSchema,
    "http-status": httpStatusMonitorSchema,
    ping: pingMonitorSchema,
    port: portMonitorSchema,
    replication: replicationMonitorSchema,
    "server-heartbeat": serverHeartbeatMonitorSchema,
    ssl: sslMonitorSchema,
    "websocket-keepalive": websocketKeepaliveMonitorSchema,
};

/**
 * Type representing a validated HTTP monitor.
 *
 * @see {@link httpMonitorSchema}
 */
export type HttpMonitor = z.infer<typeof httpMonitorSchema>;

/**
 * Type representing a validated HTTP header monitor.
 *
 * @see {@link httpHeaderMonitorSchema}
 */
export type HttpHeaderMonitor = z.infer<typeof httpHeaderMonitorSchema>;

/**
 * Type representing a validated HTTP keyword monitor.
 *
 * @see {@link httpKeywordMonitorSchema}
 */
export type HttpKeywordMonitor = z.infer<typeof httpKeywordMonitorSchema>;

/**
 * Type representing a validated HTTP JSON monitor.
 *
 * @see {@link httpJsonMonitorSchema}
 */
export type HttpJsonMonitor = z.infer<typeof httpJsonMonitorSchema>;

/**
 * Type representing a validated HTTP status monitor.
 *
 * @see {@link httpStatusMonitorSchema}
 */
export type HttpStatusMonitor = z.infer<typeof httpStatusMonitorSchema>;

/**
 * Type representing a validated HTTP latency monitor.
 *
 * @see {@link httpLatencyMonitorSchema}
 */
export type HttpLatencyMonitor = z.infer<typeof httpLatencyMonitorSchema>;

/**
 * Type representing a validated CDN edge consistency monitor.
 */
export type CdnEdgeConsistencyMonitor = z.infer<
    typeof cdnEdgeConsistencyMonitorSchema
>;

/**
 * Type representing a validated replication monitor.
 */
export type ReplicationMonitor = z.infer<typeof replicationMonitorSchema>;

/**
 * Type representing a validated server heartbeat monitor.
 */
export type ServerHeartbeatMonitor = z.infer<
    typeof serverHeartbeatMonitorSchema
>;

/**
 * Type representing a validated WebSocket keepalive monitor.
 */
export type WebsocketKeepaliveMonitor = z.infer<
    typeof websocketKeepaliveMonitorSchema
>;

/**
 * Type representing a validated DNS monitor.
 *
 * @see {@link dnsMonitorSchema}
 */
export type DnsMonitor = z.infer<typeof dnsMonitorSchema>;

/**
 * Type representing a validated monitor (HTTP, HTTP keyword, HTTP status, port,
 * ping, DNS, or SSL).
 *
 * @see {@link monitorSchema}
 */
export type Monitor = z.infer<typeof monitorSchema>;

/**
 * Type representing a validated ping monitor.
 *
 * @see {@link pingMonitorSchema}
 */
export type PingMonitor = z.infer<typeof pingMonitorSchema>;

/**
 * Type representing a validated port monitor.
 *
 * @see {@link portMonitorSchema}
 */
export type PortMonitor = z.infer<typeof portMonitorSchema>;

/**
 * Type representing a validated SSL monitor.
 *
 * @see {@link sslMonitorSchema}
 */
export type SslMonitor = z.infer<typeof sslMonitorSchema>;

/**
 * Type representing a validated site.
 *
 * @see {@link siteSchema}
 */
export type Site = z.infer<typeof siteSchema>;

// ValidationResult type available for consumers via direct import from
// ../types/validation

/**
 * Gets the appropriate Zod schema for a monitor type.
 *
 * @remarks
 * Uses the central schema registry for dynamic schema lookup. Returns
 * `undefined` if the type is not recognized.
 *
 * @param type - The monitor type string (any supported monitor type).
 *
 * @returns The Zod schema for the monitor type, or `undefined` if unknown.
 */
function getMonitorSchema(
    type: string
): (typeof monitorSchemas)[keyof typeof monitorSchemas] | undefined {
    // Type assertion is safe since we're checking if the property exists
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- safe type assertion for monitor schema lookup
    return monitorSchemas[type as keyof typeof monitorSchemas];
}

/**
 * Validates a specific field using the appropriate monitor schema.
 *
 * @remarks
 * Internal helper that creates a test object and validates the specific field.
 * Throws if the field is not recognized for the given monitor type.
 *
 * @param type - The monitor type string ("http" or "port").
 * @param fieldName - The name of the field to validate.
 * @param value - The value of the field to validate.
 *
 * @returns An object containing the validated field.
 *
 * @throws Error If the field name is unknown for the monitor type.
 * @throws {@link z.ZodError} If validation fails.
 */
function validateFieldWithSchema(
    type: string,
    fieldName: string,
    value: unknown
): UnknownRecord {
    const testData = {
        [fieldName]: value,
    };

    // Get the schema for the monitor type
    const schema = getMonitorSchema(type);
    if (schema && Object.hasOwn(schema.shape, fieldName)) {
        // Use the specific schema's field definition
        // Type assertion is safe since we check field existence above
        const fieldSchema =
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- safe assertion for schema field lookup
            schema.shape[fieldName as keyof typeof schema.shape];
        return z
            .object({ [fieldName]: fieldSchema })
            .strict()
            .parse(testData);
    }

    // Fallback to base schema for common fields
    const commonFields = baseMonitorSchema.shape;
    if (Object.hasOwn(commonFields, fieldName)) {
        return z
            .object({
                [fieldName]:
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- safe assertion for common field lookup
                    commonFields[fieldName as keyof typeof commonFields],
            })
            .strict()
            .parse(testData);
    }

    throw new Error(`Unknown field: ${fieldName}`);
}

/**
 * Validates monitor data using the appropriate Zod schema.
 *
 * @remarks
 * Selects the schema based on monitor type ("http" or "port"). Returns a
 * {@link ValidationResult} with success status, validated data, errors, and
 * warnings.
 *
 * @example
 *
 * ```typescript
 * import { logger } from "@app/services/logger";
 *
 * const result = validateMonitorData("http", {
 *     url: "https://example.com",
 *     timeout: 5000,
 * });
 * if (result.success) {
 *     logger.info("Monitor validation succeeded", result.data);
 * } else {
 *     logger.error("Monitor validation failed", result.errors);
 * }
 * ```
 *
 * @param type - The monitor type string ("http" or "port").
 * @param data - The monitor data to validate.
 *
 * @returns The validation result object.
 *
 * @throws {@link z.ZodError} If validation fails and is not handled internally.
 */
export function validateMonitorData(
    type: string,
    data: unknown
): ValidationResult {
    try {
        // Get the appropriate schema
        const schema = getMonitorSchema(type);

        if (!schema) {
            return {
                errors: [`Unknown monitor type: ${type}`],
                metadata: { monitorType: type },
                success: false,
                warnings: [],
            };
        }

        const validData = schema.parse(data);
        return {
            data: validData,
            errors: [],
            metadata: {
                monitorType: type,
                validatedDataSize: JSON.stringify(validData).length,
            },
            success: true,
            warnings: [],
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors: string[] = [];
            const warnings: string[] = [];

            for (const issue of error.issues) {
                // Use Zod's structured error codes for robust warning detection
                const isOptionalField =
                    issue.code === "invalid_type" &&
                    "received" in issue &&
                    issue.received === "undefined" &&
                    issue.path.length > 0;

                if (isOptionalField) {
                    warnings.push(`${issue.path.join(".")}: ${issue.message}`);
                } else {
                    errors.push(`${issue.path.join(".")}: ${issue.message}`);
                }
            }

            return {
                errors,
                metadata: { monitorType: type },
                success: false,
                warnings,
            };
        }

        return {
            errors: [
                `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
            ],
            metadata: { monitorType: type },
            success: false,
            warnings: [],
        };
    }
}

/**
 * Validates a specific field of a monitor using the appropriate schema.
 *
 * @remarks
 * Useful for real-time validation during form input. Only validates the
 * specified field.
 *
 * @param type - The monitor type string ("http" or "port").
 * @param fieldName - The name of the field to validate.
 * @param value - The value of the field to validate.
 *
 * @returns The validation result object for the field.
 *
 * @throws {@link z.ZodError} If validation fails and is not handled internally.
 * @throws Error If the field name is unknown for the given monitor type.
 */
export function validateMonitorField(
    type: string,
    fieldName: string,
    value: unknown
): ValidationResult {
    try {
        const schema = getMonitorSchema(type);

        if (!schema) {
            return {
                errors: [`Unknown monitor type: ${type}`],
                metadata: { fieldName, monitorType: type },
                success: false,
                warnings: [],
            };
        }

        // Create a test object and validate the specific field
        const fieldValidationResult = validateFieldWithSchema(
            type,
            fieldName,
            value
        );

        return {
            data: fieldValidationResult,
            errors: [],
            metadata: { fieldName, monitorType: type },
            success: true,
            warnings: [],
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.issues.map((issue) => issue.message);

            return {
                errors,
                metadata: { fieldName, monitorType: type },
                success: false,
                warnings: [],
            };
        }

        // Re-throw unknown field errors as documented in JSDoc
        if (error instanceof Error && error.message.includes("Unknown field")) {
            throw error;
        }

        return {
            errors: [
                `Field validation failed: ${error instanceof Error ? error.message : String(error)}`,
            ],
            metadata: { fieldName, monitorType: type },
            success: false,
            warnings: [],
        };
    }
}

/**
 * Validates site data using the shared Zod schema.
 *
 * @remarks
 * Validates the complete site structure, including all monitors. Ensures data
 * integrity for site operations.
 *
 * @param data - The site data to validate.
 *
 * @returns The validation result object for the site.
 *
 * @throws {@link z.ZodError} If validation fails and is not handled internally.
 */
export function validateSiteData(data: unknown): ValidationResult {
    try {
        const validData = siteSchema.parse(data);
        return {
            data: validData,
            errors: [],
            metadata: {
                monitorCount: validData.monitors.length,
                siteIdentifier: validData.identifier,
            },
            success: true,
            warnings: [],
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.issues.map(
                (issue) => `${issue.path.join(".")}: ${issue.message}`
            );

            return {
                errors,
                metadata: {},
                success: false,
                warnings: [],
            };
        }

        return {
            errors: [
                `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
            ],
            metadata: {},
            success: false,
            warnings: [],
        };
    }
}
