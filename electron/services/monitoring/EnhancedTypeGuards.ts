/**
 * Enhanced runtime type guards with better error messages
 * and improved generic type inference for dynamic fields.
 */

// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable security/detect-object-injection -- Dynamic object access */
// ^ Dynamic object access is required for flexible type validation
// Property names come from validated monitor configurations

import validator from "validator";
import { z } from "zod";

import type { BaseMonitorConfig } from "./MonitorTypeRegistry";
import type { MonitorType } from "./monitorTypes";

import { logger } from "../../utils/logger";
import { getRegisteredMonitorTypes } from "./MonitorTypeRegistry";

/**
 * Runtime type validation context
 */
export interface RuntimeValidationContext {
    actualValue: unknown;
    expectedType: string;
    fieldName: string;
    path: string[];
    suggestions: string[];
}

/**
 * Type guard result with detailed error information
 */
export interface TypeGuardResult<T = unknown> {
    details?: {
        actualType: string;
        expectedType: string;
        path?: string[];
        suggestions?: string[];
    };
    error?: string;
    success: boolean;
    value?: T;
}

/**
 * Enhanced runtime type guards with better error messages
 */
export const EnhancedTypeGuard = {
    /**
     * Validate boolean value with flexible interpretation
     */
    validateBoolean(value: unknown): TypeGuardResult<boolean> {
        if (typeof value === "boolean") {
            return {
                success: true,
                value,
            };
        }

        if (typeof value === "string") {
            const normalized = value.toLowerCase().trim();
            if (["1", "on", "true", "yes"].includes(normalized)) {
                return {
                    success: true,
                    value: true,
                };
            }
            if (["0", "false", "no", "off"].includes(normalized)) {
                return {
                    success: true,
                    value: false,
                };
            }
        }

        if (typeof value === "number") {
            return {
                success: true,
                value: value !== 0,
            };
        }

        return {
            details: {
                actualType: typeof value,
                expectedType: "boolean or boolean-like value",
                suggestions: [
                    "Use true/false for boolean values",
                    "Use 'true'/'false' strings",
                    "Use 1/0 for numeric boolean values",
                    "Use 'yes'/'no' for text boolean values",
                ],
            },
            error: "Cannot convert to boolean",
            success: false,
        };
    },

    /**
     * Validate hostname with detailed error reporting
     */
    validateHostname(value: unknown): TypeGuardResult<string> {
        if (typeof value !== "string") {
            return {
                details: {
                    actualType: typeof value,
                    expectedType: "string",
                    suggestions: ["Provide hostname as a string value"],
                },
                error: "Hostname must be a string",
                success: false,
            };
        }

        if (value.trim() === "") {
            return {
                details: {
                    actualType: "empty string",
                    expectedType: "non-empty string",
                    suggestions: ["Provide a valid hostname or IP address"],
                },
                error: "Hostname cannot be empty",
                success: false,
            };
        }

        const hostname = value.trim();

        // Check for valid IP address first
        if (validator.isIP(hostname)) {
            return {
                success: true,
                value: hostname,
            };
        }

        // Check for valid FQDN (domain name)
        if (
            validator.isFQDN(hostname, {
                allow_numeric_tld: false,
                allow_trailing_dot: false,
                allow_underscores: false,
                allow_wildcard: false,
                require_tld: true,
            })
        ) {
            return {
                success: true,
                value: hostname,
            };
        }

        // Additional check for localhost
        if (hostname === "localhost") {
            return {
                success: true,
                value: hostname,
            };
        }

        return {
            details: {
                actualType: "malformed hostname string",
                expectedType: "valid hostname or IP address",
                suggestions: [
                    "Use a valid domain name (e.g., example.com)",
                    "Use a valid IP address (e.g., 192.168.1.1)",
                    "Avoid invalid formats like 192.168.1.1.1",
                    "Avoid double dots like example..com",
                    "Avoid invalid characters like adasdsa",
                    "Ensure no spaces in hostname",
                ],
            },
            error: "Invalid hostname format",
            success: false,
        };
    },

    /**
     * Validate monitor type with detailed error reporting
     */
    validateMonitorType(value: unknown): TypeGuardResult<MonitorType> {
        if (typeof value !== "string") {
            return {
                details: {
                    actualType: typeof value,
                    expectedType: "string",
                    suggestions: ["Ensure monitor type is provided as a string"],
                },
                error: "Monitor type must be a string",
                success: false,
            };
        }

        // Check against registered monitor types
        const validTypes = getRegisteredMonitorTypes();
        if (!validTypes.includes(value)) {
            return {
                details: {
                    actualType: `string "${value}"`,
                    expectedType: `one of: ${validTypes.join(", ")}`,
                    suggestions: [
                        "Use 'http' for HTTP/HTTPS monitoring",
                        "Use 'port' for TCP port monitoring",
                        "Check for typos in the monitor type",
                    ],
                },
                error: `Invalid monitor type: ${value}`,
                success: false,
            };
        }

        return {
            success: true,
            value: value as MonitorType,
        };
    },

    /**
     * Validate port number with range checking
     */
    validatePort(value: unknown): TypeGuardResult<number> {
        if (typeof value !== "number") {
            if (typeof value === "string") {
                const parsed = Number.parseInt(value, 10);
                if (Number.isNaN(parsed)) {
                    return {
                        details: {
                            actualType: "non-numeric string",
                            expectedType: "number",
                            suggestions: [
                                "Use a numeric value (e.g., 80, 443, 8080)",
                                "Remove non-numeric characters",
                                "Ensure port is between 1 and 65535",
                            ],
                        },
                        error: "Port must be a valid number",
                        success: false,
                    };
                }
                value = parsed;
            } else {
                return {
                    details: {
                        actualType: typeof value,
                        expectedType: "number",
                        suggestions: ["Provide port as a numeric value"],
                    },
                    error: "Port must be a number",
                    success: false,
                };
            }
        }

        const port = value as number;

        if (!Number.isInteger(port)) {
            return {
                details: {
                    actualType: "decimal number",
                    expectedType: "integer",
                    suggestions: ["Use whole numbers only (e.g., 80, not 80.5)"],
                },
                error: "Port must be an integer",
                success: false,
            };
        }

        // Use validator.js for port validation
        if (!validator.isPort(port.toString())) {
            return {
                details: {
                    actualType: `number ${port}`,
                    expectedType: "number between 1 and 65535",
                    suggestions: [
                        "Common ports: 80 (HTTP), 443 (HTTPS), 22 (SSH)",
                        "Use ports 1024-65535 for custom services",
                        "Avoid using port 0 or negative numbers",
                        "Ensure port is within valid range",
                    ],
                },
                error: "Port must be between 1 and 65535",
                success: false,
            };
        }

        return {
            success: true,
            value: port,
        };
    },

    /**
     * Validate URL with comprehensive error reporting
     */
    validateURL(value: unknown): TypeGuardResult<string> {
        if (typeof value !== "string") {
            return {
                details: {
                    actualType: typeof value,
                    expectedType: "string",
                    suggestions: ["Provide URL as a string value"],
                },
                error: "URL must be a string",
                success: false,
            };
        }

        if (value.trim() === "") {
            return {
                details: {
                    actualType: "empty string",
                    expectedType: "non-empty string",
                    suggestions: ["Provide a valid URL like https://example.com"],
                },
                error: "URL cannot be empty",
                success: false,
            };
        }

        const trimmedValue = value.trim();

        // Use validator.js for proper URL validation
        if (
            !validator.isURL(trimmedValue, {
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
        ) {
            return {
                details: {
                    actualType: "malformed URL string",
                    expectedType: "valid URL",
                    suggestions: [
                        "Ensure URL starts with http:// or https://",
                        "Check for typos in the URL",
                        "Verify domain name format",
                        "Example: https://example.com",
                        "Avoid multiple slashes like https:///example.com",
                        "Avoid double dots like https://example..com",
                    ],
                },
                error: "Invalid URL format",
                success: false,
            };
        }

        return {
            success: true,
            value: trimmedValue,
        };
    },
};

/**
 * Generic type inference helper for dynamic fields
 */
export const GenericTypeInference = {
    /**
     * Create typed field accessor with runtime validation
     */
    createTypedAccessor<T extends BaseMonitorConfig>(
        config: T,
        fieldName: string
    ): {
        get: (data: Record<string, unknown>) => TypeGuardResult<unknown>;
        set: (data: Record<string, unknown>, value: unknown) => TypeGuardResult<void>;
        validate: (value: unknown) => TypeGuardResult<unknown>;
    } {
        const fieldInfo = this.inferFieldType(config, fieldName);

        if (!fieldInfo) {
            const errorResult = {
                details: {
                    actualType: "unknown field",
                    expectedType: "valid field name",
                    suggestions: [
                        `Available fields: ${config.fields.map((f) => f.name).join(", ")}`,
                        "Check field name spelling",
                        "Verify field is defined in monitor configuration",
                    ],
                },
                error: `Field ${fieldName} not found in configuration`,
                success: false as const,
            };

            return {
                get: () => errorResult,
                set: () => errorResult,
                validate: () => errorResult,
            };
        }

        return {
            get: (data: Record<string, unknown>) => {
                const value = data[fieldName];

                if (value === undefined && !fieldInfo.optional) {
                    return {
                        details: {
                            actualType: "undefined",
                            expectedType: fieldInfo.type,
                            suggestions: [
                                `Provide a value for ${fieldName}`,
                                `Field type should be: ${fieldInfo.type}`,
                            ],
                        },
                        error: `Required field ${fieldName} is missing`,
                        success: false,
                    };
                }

                return {
                    success: true,
                    value,
                };
            },

            set: (data: Record<string, unknown>, value: unknown) => {
                const validationResult = fieldInfo.validator.safeParse(value);

                if (!validationResult.success) {
                    return {
                        details: {
                            actualType: typeof value,
                            expectedType: fieldInfo.type,
                            suggestions: validationResult.error.issues.map((e) => e.message),
                        },
                        error: `Invalid value for field ${fieldName}`,
                        success: false,
                    };
                }

                data[fieldName] = validationResult.data;
                return {
                    success: true,
                };
            },

            validate: (value: unknown) => {
                const validationResult = fieldInfo.validator.safeParse(value);

                if (!validationResult.success) {
                    return {
                        details: {
                            actualType: typeof value,
                            expectedType: fieldInfo.type,
                            suggestions: validationResult.error.issues.map((e) => e.message),
                        },
                        error: `Validation failed for field ${fieldName}`,
                        success: false,
                    };
                }

                return {
                    success: true,
                    value: validationResult.data,
                };
            },
        };
    },

    /**
     * Infer field type from monitor configuration
     */
    inferFieldType<T extends BaseMonitorConfig>(
        config: T,
        fieldName: string
    ): null | {
        optional: boolean;
        type: string;
        validator: z.ZodType;
    } {
        const field = config.fields.find((f) => f.name === fieldName);
        if (!field) {
            return null;
        }

        let validator: z.ZodType;

        switch (field.type) {
            case "number": {
                let numberValidator = z.number();
                if (field.min !== undefined) {
                    numberValidator = numberValidator.min(field.min);
                }
                if (field.max !== undefined) {
                    numberValidator = numberValidator.max(field.max);
                }
                validator = numberValidator;
                break;
            }
            case "text": {
                validator = z.string();
                break;
            }
            case "url": {
                validator = z.string().refine(
                    (val) => {
                        try {
                            new URL(val);
                            return true;
                        } catch {
                            return false;
                        }
                    },
                    { message: "Invalid URL format" }
                );
                break;
            }
            default: {
                validator = z.unknown();
            }
        }

        if (!field.required) {
            validator = validator.optional();
        }

        return {
            optional: !field.required,
            type: field.type,
            validator,
        };
    },
};

/**
 * Type-safe monitor data interface with runtime validation
 */
export interface TypeSafeMonitorData<T extends MonitorType> {
    [K: string]: unknown;
    type: T;
}

/**
 * Enhanced monitor data builder with type safety
 */
export class TypeSafeMonitorBuilder<T extends MonitorType> {
    private data: Record<string, unknown> = {};
    private readonly errors: string[] = [];
    private readonly monitorType: T;

    constructor(monitorType: T) {
        this.monitorType = monitorType;
        this.data.type = monitorType;
    }

    /**
     * Build the monitor data with validation
     */
    build(): TypeGuardResult<TypeSafeMonitorData<T>> {
        if (this.errors.length > 0) {
            return {
                details: {
                    actualType: "invalid monitor data",
                    expectedType: "valid monitor data",
                    suggestions: this.errors,
                },
                error: "Monitor data has validation errors",
                success: false,
            };
        }

        return {
            success: true,
            value: this.data as TypeSafeMonitorData<T>,
        };
    }

    /**
     * Get field value with type checking
     */
    getField<K extends string>(fieldName: K): TypeGuardResult<unknown> {
        if (!(fieldName in this.data)) {
            return {
                details: {
                    actualType: "undefined",
                    expectedType: "existing field",
                    suggestions: [`Available fields: ${Object.keys(this.data).join(", ")}`],
                },
                error: `Field ${fieldName} not found`,
                success: false,
            };
        }

        return {
            success: true,
            value: this.data[fieldName],
        };
    }

    /**
     * Set field value with runtime validation
     */
    setField<K extends string>(fieldName: K, value: unknown): this {
        try {
            // Validate field based on monitor type
            const validation = this.validateField(fieldName, value);

            if (validation.success) {
                this.data[fieldName] = validation.value;
            } else {
                this.errors.push(validation.error ?? `Invalid value for field ${fieldName}`);
                logger.warn("Field validation failed:", validation.details); /* v8 ignore next */
            }
        } catch (error) {
            this.errors.push(`Error setting field ${fieldName}: ${error}`);
            logger.error("Error setting field:", error);
        }

        return this;
    }

    /**
     * Validate individual field
     */
    private validateField(fieldName: string, value: unknown): TypeGuardResult<unknown> {
        // Basic validation based on monitor type
        switch (this.monitorType) {
            case "http": {
                if (fieldName === "url") {
                    return EnhancedTypeGuard.validateURL(value);
                }
                break;
            }
            case "port": {
                if (fieldName === "host") {
                    return EnhancedTypeGuard.validateHostname(value);
                }
                if (fieldName === "port") {
                    return EnhancedTypeGuard.validatePort(value);
                }
                break;
            }
        }

        // Default validation for common fields
        if (fieldName === "type") {
            return EnhancedTypeGuard.validateMonitorType(value);
        }

        if (fieldName === "monitoring") {
            return EnhancedTypeGuard.validateBoolean(value);
        }

        // Allow any other fields
        return {
            success: true,
            value,
        };
    }
}

/**
 * Type-safe monitor factory with enhanced error reporting
 */
export const TypeSafeMonitorFactory = {
    /**
     * Create a typed monitor builder
     */
    create<T extends MonitorType>(monitorType: T): TypeSafeMonitorBuilder<T> {
        return new TypeSafeMonitorBuilder(monitorType);
    },

    /**
     * Validate existing monitor data
     */
    validate<T extends MonitorType>(data: unknown): TypeGuardResult<TypeSafeMonitorData<T>> {
        if (typeof data !== "object" || data === null) {
            return {
                details: {
                    actualType: typeof data,
                    expectedType: "object",
                    suggestions: ["Provide monitor data as an object with type and other fields"],
                },
                error: "Monitor data must be an object",
                success: false,
            };
        }

        const obj = data as Record<string, unknown>;
        const validationResult = EnhancedTypeGuard.validateMonitorType(obj.type);

        if (!validationResult.success) {
            return {
                details: validationResult.details ?? {
                    actualType: "invalid data",
                    expectedType: "valid monitor data",
                    suggestions: ["Ensure monitor data is properly formatted"],
                },
                error: validationResult.error ?? "Validation failed",
                success: false,
            };
        }

        return {
            success: true,
            value: obj as TypeSafeMonitorData<T>,
        };
    },
};
