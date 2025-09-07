/**
 * Shared Zod validation schemas and validation utilities for monitor and site
 * data.
 *
 * @remarks
 * These schemas and functions are used by both frontend and backend to ensure
 * data integrity. Validation constraints are synchronized with UI constants in
 * {@link constants.ts}. All validation logic is centralized here for consistency
 * and maintainability.
 *
 * @packageDocumentation
 */

import type {
    BaseMonitorSchemaType,
    DnsMonitorSchemaType,
    HttpMonitorSchemaType,
    MonitorSchemaType,
    PingMonitorSchemaType,
    PortMonitorSchemaType,
    SiteSchemaType,
} from "@shared/types/schemaTypes";
/**
 * Result object returned by validation functions.
 *
 * @remarks
 * Contains the validated data (if successful), errors, warnings, and metadata.
 */
// Import from unified validation system
import type { ValidationResult } from "@shared/types/validation";
import type { UnknownRecord } from "type-fest";

import validator from "validator";
import * as z from "zod";

import { isValidHost, isValidPort } from "./validatorUtils";

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
        status: z.enum(["up", "down"]),
        timestamp: z.number(),
    })
    .strict();

/**
 * Validation constraints for monitor fields.
 *
 * @remarks
 * These values must match the UI constants in {@link constants.ts}.
 */
const VALIDATION_CONSTRAINTS = {
    CHECK_INTERVAL: {
        MAX: 2_592_000_000, // 30 days (maximum from CHECK_INTERVALS)
        MIN: 5000, // 5 seconds (minimum from CHECK_INTERVALS)
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
        status: z.enum([
            "up",
            "down",
            "pending",
            "paused",
        ]),
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
            "port",
            "ping",
            "dns",
        ]),
    })
    .strict();

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
        url: z.string().refine(
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
        ),
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
 * Zod discriminated union schema for all monitor types.
 *
 * @remarks
 * Supports HTTP, port, ping, and DNS monitors.
 */
export const monitorSchema: MonitorSchemaType = z.discriminatedUnion("type", [
    httpMonitorSchema,
    portMonitorSchema,
    pingMonitorSchema,
    dnsMonitorSchema,
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
    readonly dns: typeof dnsMonitorSchema;
    readonly http: typeof httpMonitorSchema;
    readonly ping: typeof pingMonitorSchema;
    readonly port: typeof portMonitorSchema;
}

/**
 * Organized monitor schemas by type.
 *
 * @remarks
 * Useful for dynamic schema selection.
 */
export const monitorSchemas: MonitorSchemas = {
    dns: dnsMonitorSchema,
    http: httpMonitorSchema,
    ping: pingMonitorSchema,
    port: portMonitorSchema,
} as const;

/**
 * Type representing a validated HTTP monitor.
 *
 * @see {@link httpMonitorSchema}
 */
export type HttpMonitor = z.infer<typeof httpMonitorSchema>;

/**
 * Type representing a validated DNS monitor.
 *
 * @see {@link dnsMonitorSchema}
 */
export type DnsMonitor = z.infer<typeof dnsMonitorSchema>;

/**
 * Type representing a validated monitor (HTTP, port, ping, or DNS).
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
 * const result = validateMonitorData("http", {
 *     url: "https://example.com",
 *     timeout: 5000,
 * });
 * if (result.success) {
 *     console.log("Valid monitor:", result.data);
 * } else {
 *     console.error("Validation errors:", result.errors);
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
