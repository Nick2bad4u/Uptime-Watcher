/**
 * Shared Zod validation schemas for monitor types.
 * Used by both frontend and backend to ensure data integrity.
 *
 * Validation constraints match the UI constants in src/constants.ts
 */

import validator from "validator";
import { z } from "zod";

// Validation constraints (matching UI constants)
const VALIDATION_CONSTRAINTS = {
    CHECK_INTERVAL: {
        MIN: 5000, // 5 seconds (minimum from CHECK_INTERVALS)
        MAX: 2592000000, // 30 days (maximum from CHECK_INTERVALS)
    },
    TIMEOUT: {
        MIN: 1000, // 1 second (from TIMEOUT_CONSTRAINTS_MS)
        MAX: 300000, // 300 seconds (from TIMEOUT_CONSTRAINTS_MS)
    },
    RETRY_ATTEMPTS: {
        MIN: 0, // 0 retries minimum (from RETRY_CONSTRAINTS)
        MAX: 10, // 10 retries maximum (from RETRY_CONSTRAINTS)
    },
} as const;

// Base monitor schema with common fields
export const baseMonitorSchema = z.object({
    id: z.string().min(1, "Monitor ID is required"),
    type: z.enum(["http", "port"]),
    checkInterval: z
        .number()
        .min(VALIDATION_CONSTRAINTS.CHECK_INTERVAL.MIN, "Check interval must be at least 5 seconds")
        .max(VALIDATION_CONSTRAINTS.CHECK_INTERVAL.MAX, "Check interval cannot exceed 30 days"),
    timeout: z
        .number()
        .min(VALIDATION_CONSTRAINTS.TIMEOUT.MIN, "Timeout must be at least 1 second")
        .max(VALIDATION_CONSTRAINTS.TIMEOUT.MAX, "Timeout cannot exceed 300 seconds"),
    retryAttempts: z
        .number()
        .min(VALIDATION_CONSTRAINTS.RETRY_ATTEMPTS.MIN, "Retry attempts cannot be negative")
        .max(VALIDATION_CONSTRAINTS.RETRY_ATTEMPTS.MAX, "Retry attempts cannot exceed 10"),
    monitoring: z.boolean(),
    status: z.enum(["up", "down", "pending", "paused"]),
    responseTime: z.number().min(-1), // -1 is sentinel for "never checked"
    lastChecked: z.date().optional(),
});

// HTTP monitor specific schema
export const httpMonitorSchema = baseMonitorSchema.extend({
    type: z.literal("http"),
    url: z.string().refine((val) => {
        // Use validator.js for robust URL validation
        return validator.isURL(val, {
            allow_protocol_relative_urls: false,
            allow_trailing_dot: false,
            allow_underscores: false,
            disallow_auth: false,
            protocols: ["http", "https"],
            require_host: true,
            require_protocol: true,
            require_tld: true,
            validate_length: true,
        });
    }, "Must be a valid HTTP or HTTPS URL"),
});

// Port monitor specific schema
export const portMonitorSchema = baseMonitorSchema.extend({
    type: z.literal("port"),
    host: z.string().refine((val) => {
        // Use validator.js for robust host validation
        if (validator.isIP(val)) {
            return true;
        }
        if (
            validator.isFQDN(val, {
                allow_numeric_tld: false,
                allow_trailing_dot: false,
                allow_underscores: false,
                allow_wildcard: false,
                require_tld: true,
            })
        ) {
            return true;
        }
        return val === "localhost";
    }, "Must be a valid hostname, IP address, or localhost"),
    port: z.number().refine((val) => {
        return validator.isPort(val.toString());
    }, "Must be a valid port number (1-65535)"),
});

// Union schema for all monitor types
export const monitorSchema = z.discriminatedUnion("type", [httpMonitorSchema, portMonitorSchema]);

// Site schema
export const siteSchema = z.object({
    identifier: z.string().min(1, "Site identifier is required").max(100, "Site identifier too long"),
    name: z.string().min(1, "Site name is required").max(200, "Site name too long"),
    monitoring: z.boolean(),
    monitors: z.array(monitorSchema).min(1, "At least one monitor is required"),
});

// Organized schemas by monitor type
export const monitorSchemas = {
    http: httpMonitorSchema,
    port: portMonitorSchema,
} as const;

// Type exports
export type HttpMonitor = z.infer<typeof httpMonitorSchema>;
export type PortMonitor = z.infer<typeof portMonitorSchema>;
export type Monitor = z.infer<typeof monitorSchema>;
export type Site = z.infer<typeof siteSchema>;

// Validation result type
export interface ValidationResult {
    success: boolean;
    errors: string[];
    warnings: string[];
    data?: unknown;
    metadata: Record<string, unknown>;
}

/**
 * Get the appropriate schema for a monitor type.
 */
function getMonitorSchema(type: string) {
    if (type === "http") {
        return httpMonitorSchema;
    } else if (type === "port") {
        return portMonitorSchema;
    }
    return null;
}

/**
 * Validate a specific field using the appropriate schema.
 */
function validateFieldWithSchema(type: string, fieldName: string, value: unknown) {
    const testData = { [fieldName]: value };

    if (fieldName === "url" && type === "http") {
        return z.object({ url: httpMonitorSchema.shape.url }).parse(testData);
    } else if (fieldName === "host" && type === "port") {
        return z.object({ host: portMonitorSchema.shape.host }).parse(testData);
    } else if (fieldName === "port" && type === "port") {
        return z.object({ port: portMonitorSchema.shape.port }).parse(testData);
    } else {
        // For common fields, use base schema
        const commonFields = baseMonitorSchema.shape;
        if (fieldName in commonFields) {
            return z
                .object({ [fieldName]: commonFields[fieldName as keyof typeof commonFields] })
                .parse(testData);
        } else {
            throw new Error(`Unknown field: ${fieldName}`);
        }
    }
}

/**
 * Validate monitor data using shared Zod schemas.
 */
export function validateMonitorData(type: string, data: unknown): ValidationResult {
    try {
        // Get the appropriate schema
        const schema = getMonitorSchema(type);

        if (!schema) {
            return {
                success: false,
                errors: [`Unknown monitor type: ${type}`],
                warnings: [],
                metadata: { monitorType: type },
            };
        }

        const validData = schema.parse(data);
        return {
            success: true,
            errors: [],
            warnings: [],
            data: validData,
            metadata: {
                monitorType: type,
                validatedDataSize: JSON.stringify(validData).length,
            },
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors: string[] = [];
            const warnings: string[] = [];

            for (const issue of error.issues) {
                // Consider optional fields with format issues as warnings rather than errors
                if (issue.code === "invalid_type" && issue.message.includes("optional")) {
                    warnings.push(`${issue.path.join(".")}: ${issue.message}`);
                } else {
                    errors.push(`${issue.path.join(".")}: ${issue.message}`);
                }
            }

            return {
                success: false,
                errors,
                warnings,
                metadata: { monitorType: type },
            };
        }

        return {
            success: false,
            errors: [`Validation failed: ${error instanceof Error ? error.message : String(error)}`],
            warnings: [],
            metadata: { monitorType: type },
        };
    }
}

/**
 * Validate site data using shared Zod schema.
 */
export function validateSiteData(data: unknown): ValidationResult {
    try {
        const validData = siteSchema.parse(data);
        return {
            success: true,
            errors: [],
            warnings: [],
            data: validData,
            metadata: {
                siteIdentifier: validData.identifier,
                monitorCount: validData.monitors.length,
            },
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);

            return {
                success: false,
                errors,
                warnings: [],
                metadata: {},
            };
        }

        return {
            success: false,
            errors: [`Validation failed: ${error instanceof Error ? error.message : String(error)}`],
            warnings: [],
            metadata: {},
        };
    }
}

/**
 * Validate a specific field of a monitor.
 */
export function validateMonitorField(type: string, fieldName: string, value: unknown): ValidationResult {
    try {
        const schema = getMonitorSchema(type);

        if (!schema) {
            return {
                success: false,
                errors: [`Unknown monitor type: ${type}`],
                warnings: [],
                metadata: { monitorType: type, fieldName },
            };
        }

        // Create a test object and validate the specific field
        const fieldValidationResult = validateFieldWithSchema(type, fieldName, value);

        return {
            success: true,
            errors: [],
            warnings: [],
            data: fieldValidationResult,
            metadata: { monitorType: type, fieldName },
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.issues.map((issue) => issue.message);

            return {
                success: false,
                errors,
                warnings: [],
                metadata: { monitorType: type, fieldName },
            };
        }

        return {
            success: false,
            errors: [`Field validation failed: ${error instanceof Error ? error.message : String(error)}`],
            warnings: [],
            metadata: { monitorType: type, fieldName },
        };
    }
}
