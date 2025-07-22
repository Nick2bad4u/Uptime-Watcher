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

// Base monitor schema with common fields
export const baseMonitorSchema = z.object({
    checkInterval: z
        .number()
        .min(VALIDATION_CONSTRAINTS.CHECK_INTERVAL.MIN, "Check interval must be at least 5 seconds")
        .max(VALIDATION_CONSTRAINTS.CHECK_INTERVAL.MAX, "Check interval cannot exceed 30 days"),
    id: z.string().min(1, "Monitor ID is required"),
    lastChecked: z.date().optional(),
    monitoring: z.boolean(),
    responseTime: z.number().min(-1), // -1 is sentinel for "never checked"
    retryAttempts: z
        .number()
        .min(VALIDATION_CONSTRAINTS.RETRY_ATTEMPTS.MIN, "Retry attempts cannot be negative")
        .max(VALIDATION_CONSTRAINTS.RETRY_ATTEMPTS.MAX, "Retry attempts cannot exceed 10"),
    status: z.enum(["up", "down", "pending", "paused"]),
    timeout: z
        .number()
        .min(VALIDATION_CONSTRAINTS.TIMEOUT.MIN, "Timeout must be at least 1 second")
        .max(VALIDATION_CONSTRAINTS.TIMEOUT.MAX, "Timeout cannot exceed 300 seconds"),
    type: z.enum(["http", "port"]),
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
    type: z.literal("port"),
});

// Union schema for all monitor types
export const monitorSchema = z.discriminatedUnion("type", [httpMonitorSchema, portMonitorSchema]);

// Site schema
export const siteSchema = z.object({
    identifier: z.string().min(1, "Site identifier is required").max(100, "Site identifier too long"),
    monitoring: z.boolean(),
    monitors: z.array(monitorSchema).min(1, "At least one monitor is required"),
    name: z.string().min(1, "Site name is required").max(200, "Site name too long"),
});

// Organized schemas by monitor type
export const monitorSchemas = {
    http: httpMonitorSchema,
    port: portMonitorSchema,
} as const;

// Type exports
export type HttpMonitor = z.infer<typeof httpMonitorSchema>;
export type Monitor = z.infer<typeof monitorSchema>;
export type PortMonitor = z.infer<typeof portMonitorSchema>;
export type Site = z.infer<typeof siteSchema>;

// Validation result type
export interface ValidationResult {
    data?: unknown;
    errors: string[];
    metadata: Record<string, unknown>;
    success: boolean;
    warnings: string[];
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
                // Consider optional fields with format issues as warnings rather than errors
                if (issue.code === "invalid_type" && issue.message.includes("optional")) {
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
            errors: [`Validation failed: ${error instanceof Error ? error.message : String(error)}`],
            metadata: { monitorType: type },
            success: false,
            warnings: [],
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
                errors: [`Unknown monitor type: ${type}`],
                metadata: { fieldName, monitorType: type },
                success: false,
                warnings: [],
            };
        }

        // Create a test object and validate the specific field
        const fieldValidationResult = validateFieldWithSchema(type, fieldName, value);

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

        return {
            errors: [`Field validation failed: ${error instanceof Error ? error.message : String(error)}`],
            metadata: { fieldName, monitorType: type },
            success: false,
            warnings: [],
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
            const errors = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);

            return {
                errors,
                metadata: {},
                success: false,
                warnings: [],
            };
        }

        return {
            errors: [`Validation failed: ${error instanceof Error ? error.message : String(error)}`],
            metadata: {},
            success: false,
            warnings: [],
        };
    }
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
    const testData = {
        [fieldName]: value,
    };

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
            return z.object({ [fieldName]: commonFields[fieldName as keyof typeof commonFields] }).parse(testData);
        } else {
            throw new Error(`Unknown field: ${fieldName}`);
        }
    }
}
