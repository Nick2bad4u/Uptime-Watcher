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
    SslMonitorSchemaType,
    WebsocketKeepaliveMonitorSchemaType,
} from "@shared/types/schemaTypes";
import type { ValidationResult } from "@shared/types/validation";
import type { Jsonify, UnknownRecord } from "type-fest";

import { isRecord } from "@shared/utils/typeHelpers";
import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import * as z from "zod";

import {
    createCdnEdgeConsistencyMonitorSchema,
    createReplicationMonitorSchema,
    createServerHeartbeatMonitorSchema,
    createWebsocketKeepaliveMonitorSchema,
} from "./monitorSchemas.advanced";
import {
    createBaseMonitorSchema,
    createDotPathSchemaFactory,
    createEdgeLocationListSchema,
    createHostValidationSchema,
    createHttpHeaderNameSchema,
    createHttpHeaderValueSchema,
    createHttpUrlSchema,
    createJsonPathSchema,
    createWebsocketUrlSchema,
} from "./monitorSchemas.common";
import {
    createHttpHeaderMonitorSchema,
    createHttpJsonMonitorSchema,
    createHttpKeywordMonitorSchema,
    createHttpLatencyMonitorSchema,
    createHttpMonitorSchema,
    createHttpStatusMonitorSchema,
} from "./monitorSchemas.http";
import {
    createDnsMonitorSchema,
    createPingMonitorSchema,
    createPortMonitorSchema,
    createSslMonitorSchema,
} from "./monitorSchemas.network";

const hostValidationSchema = createHostValidationSchema();
const httpHeaderNameSchema = createHttpHeaderNameSchema();
const httpHeaderValueSchema = createHttpHeaderValueSchema();
const httpUrlSchema = createHttpUrlSchema();
const jsonPathSchema = createJsonPathSchema();
const websocketUrlSchema = createWebsocketUrlSchema();
const edgeLocationListSchema = createEdgeLocationListSchema();

export const baseMonitorSchema: BaseMonitorSchemaType = createBaseMonitorSchema();

export const httpMonitorSchema: HttpMonitorSchemaType = createHttpMonitorSchema({
    baseMonitorSchema,
    httpUrlSchema,
});

export const httpHeaderMonitorSchema: HttpHeaderMonitorSchemaType =
    createHttpHeaderMonitorSchema({
    baseMonitorSchema,
    httpHeaderNameSchema,
    httpHeaderValueSchema,
    httpUrlSchema,
});

export const httpKeywordMonitorSchema: HttpKeywordMonitorSchemaType =
    createHttpKeywordMonitorSchema({
    baseMonitorSchema,
    httpUrlSchema,
});

export const httpJsonMonitorSchema: HttpJsonMonitorSchemaType =
    createHttpJsonMonitorSchema({
    baseMonitorSchema,
    httpUrlSchema,
    jsonPathSchema,
});

export const httpStatusMonitorSchema: HttpStatusMonitorSchemaType =
    createHttpStatusMonitorSchema({
    baseMonitorSchema,
    httpUrlSchema,
});

export const httpLatencyMonitorSchema: HttpLatencyMonitorSchemaType =
    createHttpLatencyMonitorSchema({
    baseMonitorSchema,
    httpUrlSchema,
});

export const portMonitorSchema: PortMonitorSchemaType = createPortMonitorSchema({
    baseMonitorSchema,
    hostValidationSchema,
});

export const pingMonitorSchema: PingMonitorSchemaType = createPingMonitorSchema({
    baseMonitorSchema,
    hostValidationSchema,
});

export const dnsMonitorSchema: DnsMonitorSchemaType = createDnsMonitorSchema({
    baseMonitorSchema,
    hostValidationSchema,
});

export const sslMonitorSchema: SslMonitorSchemaType = createSslMonitorSchema({
    baseMonitorSchema,
    hostValidationSchema,
});

export const cdnEdgeConsistencyMonitorSchema: CdnEdgeConsistencyMonitorSchemaType =
    createCdnEdgeConsistencyMonitorSchema({
        baseMonitorSchema,
        createDotPathSchema: createDotPathSchemaFactory,
        edgeLocationListSchema,
        httpUrlSchema,
        websocketUrlSchema,
    });

export const replicationMonitorSchema: ReplicationMonitorSchemaType =
    createReplicationMonitorSchema({
    baseMonitorSchema,
    createDotPathSchema: createDotPathSchemaFactory,
    edgeLocationListSchema,
    httpUrlSchema,
    websocketUrlSchema,
});

export const serverHeartbeatMonitorSchema: ServerHeartbeatMonitorSchemaType =
    createServerHeartbeatMonitorSchema({
    baseMonitorSchema,
    createDotPathSchema: createDotPathSchemaFactory,
    edgeLocationListSchema,
    httpUrlSchema,
    websocketUrlSchema,
});

export const websocketKeepaliveMonitorSchema: WebsocketKeepaliveMonitorSchemaType =
    createWebsocketKeepaliveMonitorSchema({
        baseMonitorSchema,
        createDotPathSchema: createDotPathSchemaFactory,
        edgeLocationListSchema,
        httpUrlSchema,
        websocketUrlSchema,
    });

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

function isKnownMonitorTypeKey(
    value: string
): value is keyof typeof monitorSchemas {
    return Object.hasOwn(monitorSchemas, value);
}

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

/** JSON-safe representation of a validated monitor. */
export type MonitorJson = Jsonify<Monitor>;

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
 * Retrieves the Zod schema associated with a monitor type.
 *
 * @remarks
 * Uses the central schema registry for dynamic schema lookup. Returns
 * `undefined` when the provided discriminator is not part of
 * {@link monitorSchemas}.
 */
function getMonitorSchema(
    type: string
): (typeof monitorSchemas)[keyof typeof monitorSchemas] | undefined {
    if (!isKnownMonitorTypeKey(type)) {
        return undefined;
    }

    return monitorSchemas[type];
}

/**
 * Error thrown when a monitor field name is not part of the schema for a given
 * monitor type.
 */
export class MonitorUnknownFieldError extends Error {
    public readonly fieldName: string;

    public readonly monitorType: string;

    public constructor(args: { fieldName: string; monitorType: string }) {
        super(`Unknown field: ${args.fieldName}`);
        this.name = "MonitorUnknownFieldError";
        this.fieldName = args.fieldName;
        this.monitorType = args.monitorType;
    }
}

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

    throw new MonitorUnknownFieldError({
        fieldName,
        monitorType: type,
    });
}

/**
 * Validates monitor data using the appropriate Zod schema.
 *
 * @remarks
 * Selects the schema based on the monitor discriminator and produces a
 * {@link ValidationResult} containing success state, validated data, and any
 * accumulated errors or warnings. Optional fields that are omitted are reported
 * as warnings instead of hard validation failures.
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
        const serializedData = JSON.stringify(validData);
        return {
            data: validData,
            errors: [],
            metadata: {
                monitorType: type,
                validatedDataSize: serializedData.length,
            },
            success: true,
            warnings: [],
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            type Issue = (typeof error.issues)[number];
            const errorIssues: Issue[] = [];
            const warningIssues: Issue[] = [];

            for (const issue of error.issues) {
                // Use Zod's structured error codes for robust warning detection
                const isOptionalField =
                    issue.code === "invalid_type" &&
                    "received" in issue &&
                    issue.received === "undefined" &&
                    issue.path.length > 0;

                if (isOptionalField) {
                    warningIssues.push(issue);
                } else {
                    errorIssues.push(issue);
                }
            }

            return {
                errors: formatZodIssues(errorIssues),
                metadata: { monitorType: type },
                success: false,
                warnings: formatZodIssues(warningIssues),
            };
        }

        return {
            errors: [
                `Validation failed: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            ],
            metadata: { monitorType: type },
            success: false,
            warnings: [],
        };
    }
}

/**
 * Validates an unknown monitor candidate and returns a list of human-readable
 * validation errors.
 *
 * @remarks
 * Prefer this function whenever you need to validate an unknown monitor-like
 * payload (for example from JSON, IPC, or tests).
 */
export function getMonitorValidationErrors(candidate: unknown): string[] {
    if (!isRecord(candidate)) {
        return ["Monitor data must be an object"];
    }

    const rawKind = candidate["type"];
    if (typeof rawKind !== "string" || rawKind.trim().length === 0) {
        return ["Monitor type is required"];
    }

    const result = validateMonitorData(rawKind, candidate);

    return result.success ? [] : Array.from(result.errors);
}

/**
 * Validates a specific field of a monitor using the appropriate schema.
 *
 * @remarks
 * Useful for real-time validation during form input. Only validates the
 * specified field and mirrors the logic used by {@link validateMonitorData} for
 * warnings and metadata.
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
            const errors = formatZodIssues(error.issues, {
                includePath: false,
            });

            return {
                errors,
                metadata: { fieldName, monitorType: type },
                success: false,
                warnings: [],
            };
        }

        // Re-throw unknown field errors as documented in JSDoc
        if (error instanceof MonitorUnknownFieldError) {
            throw error;
        }

        return {
            errors: [
                `Field validation failed: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            ],
            metadata: { fieldName, monitorType: type },
            success: false,
            warnings: [],
        };
    }
}
