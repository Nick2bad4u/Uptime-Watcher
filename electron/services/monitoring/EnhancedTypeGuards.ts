/**
 * Enhanced runtime type guards with better error messages
 * and improved generic type inference for dynamic fields.
 */

/* eslint-disable security/detect-object-injection */
// ^ Dynamic object access is required for flexible type validation
// Property names come from validated monitor configurations

import { z } from "zod";
import validator from "validator";
import { logger } from "../../utils/logger";
import type { MonitorType } from "../../types";
import type { BaseMonitorConfig } from "./MonitorTypeRegistry";
import { getRegisteredMonitorTypes } from "./MonitorTypeRegistry";

/**
 * Type guard result with detailed error information
 */
export interface TypeGuardResult<T = unknown> {
    success: boolean;
    value?: T;
    error?: string;
    details?: {
        expectedType: string;
        actualType: string;
        path?: string[];
        suggestions?: string[];
    };
}

/**
 * Runtime type validation context
 */
export interface RuntimeValidationContext {
    path: string[];
    fieldName: string;
    expectedType: string;
    actualValue: unknown;
    suggestions: string[];
}

/**
 * Enhanced runtime type guards with better error messages
 */
export const EnhancedTypeGuard = {
    /**
     * Validate monitor type with detailed error reporting
     */
    validateMonitorType(value: unknown): TypeGuardResult<MonitorType> {
        if (typeof value !== "string") {
            return {
                success: false,
                error: "Monitor type must be a string",
                details: {
                    expectedType: "string",
                    actualType: typeof value,
                    suggestions: ["Ensure monitor type is provided as a string"],
                },
            };
        }

        // Check against registered monitor types
        const validTypes = getRegisteredMonitorTypes();
        if (!validTypes.includes(value)) {
            return {
                success: false,
                error: `Invalid monitor type: ${value}`,
                details: {
                    expectedType: `one of: ${validTypes.join(", ")}`,
                    actualType: `string "${value}"`,
                    suggestions: [
                        "Use 'http' for HTTP/HTTPS monitoring",
                        "Use 'port' for TCP port monitoring",
                        "Check for typos in the monitor type",
                    ],
                },
            };
        }

        return {
            success: true,
            value: value,
        };
    },

    /**
     * Validate URL with comprehensive error reporting
     */
    validateURL(value: unknown): TypeGuardResult<string> {
        if (typeof value !== "string") {
            return {
                success: false,
                error: "URL must be a string",
                details: {
                    expectedType: "string",
                    actualType: typeof value,
                    suggestions: ["Provide URL as a string value"],
                },
            };
        }

        if (value.trim() === "") {
            return {
                success: false,
                error: "URL cannot be empty",
                details: {
                    expectedType: "non-empty string",
                    actualType: "empty string",
                    suggestions: ["Provide a valid URL like https://example.com"],
                },
            };
        }

        const trimmedValue = value.trim();

        // Use validator.js for proper URL validation
        if (
            !validator.isURL(trimmedValue, {
                protocols: ["http", "https"],
                require_protocol: true,
                require_host: true,
                require_tld: true,
                allow_underscores: false,
                allow_trailing_dot: false,
                allow_protocol_relative_urls: false,
                disallow_auth: false,
                validate_length: true,
            })
        ) {
            return {
                success: false,
                error: "Invalid URL format",
                details: {
                    expectedType: "valid URL",
                    actualType: "malformed URL string",
                    suggestions: [
                        "Ensure URL starts with http:// or https://",
                        "Check for typos in the URL",
                        "Verify domain name format",
                        "Example: https://example.com",
                        "Avoid multiple slashes like https:///example.com",
                        "Avoid double dots like https://example..com",
                    ],
                },
            };
        }

        return {
            success: true,
            value: trimmedValue,
        };
    },

    /**
     * Validate hostname with detailed error reporting
     */
    validateHostname(value: unknown): TypeGuardResult<string> {
        if (typeof value !== "string") {
            return {
                success: false,
                error: "Hostname must be a string",
                details: {
                    expectedType: "string",
                    actualType: typeof value,
                    suggestions: ["Provide hostname as a string value"],
                },
            };
        }

        if (value.trim() === "") {
            return {
                success: false,
                error: "Hostname cannot be empty",
                details: {
                    expectedType: "non-empty string",
                    actualType: "empty string",
                    suggestions: ["Provide a valid hostname or IP address"],
                },
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
                require_tld: true,
                allow_underscores: false,
                allow_trailing_dot: false,
                allow_numeric_tld: false,
                allow_wildcard: false,
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
            success: false,
            error: "Invalid hostname format",
            details: {
                expectedType: "valid hostname or IP address",
                actualType: "malformed hostname string",
                suggestions: [
                    "Use a valid domain name (e.g., example.com)",
                    "Use a valid IP address (e.g., 192.168.1.1)",
                    "Avoid invalid formats like 192.168.1.1.1",
                    "Avoid double dots like example..com",
                    "Avoid invalid characters like adasdsa",
                    "Ensure no spaces in hostname",
                ],
            },
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
                        success: false,
                        error: "Port must be a valid number",
                        details: {
                            expectedType: "number",
                            actualType: "non-numeric string",
                            suggestions: [
                                "Use a numeric value (e.g., 80, 443, 8080)",
                                "Remove non-numeric characters",
                                "Ensure port is between 1 and 65535",
                            ],
                        },
                    };
                }
                value = parsed;
            } else {
                return {
                    success: false,
                    error: "Port must be a number",
                    details: {
                        expectedType: "number",
                        actualType: typeof value,
                        suggestions: ["Provide port as a numeric value"],
                    },
                };
            }
        }

        const port = value as number;

        if (!Number.isInteger(port)) {
            return {
                success: false,
                error: "Port must be an integer",
                details: {
                    expectedType: "integer",
                    actualType: "decimal number",
                    suggestions: ["Use whole numbers only (e.g., 80, not 80.5)"],
                },
            };
        }

        // Use validator.js for port validation
        if (!validator.isPort(port.toString())) {
            return {
                success: false,
                error: "Port must be between 1 and 65535",
                details: {
                    expectedType: "number between 1 and 65535",
                    actualType: `number ${port}`,
                    suggestions: [
                        "Common ports: 80 (HTTP), 443 (HTTPS), 22 (SSH)",
                        "Use ports 1024-65535 for custom services",
                        "Avoid using port 0 or negative numbers",
                        "Ensure port is within valid range",
                    ],
                },
            };
        }

        return {
            success: true,
            value: port,
        };
    },

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
            if (["true", "1", "yes", "on"].includes(normalized)) {
                return {
                    success: true,
                    value: true,
                };
            }
            if (["false", "0", "no", "off"].includes(normalized)) {
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
            success: false,
            error: "Cannot convert to boolean",
            details: {
                expectedType: "boolean or boolean-like value",
                actualType: typeof value,
                suggestions: [
                    "Use true/false for boolean values",
                    "Use 'true'/'false' strings",
                    "Use 1/0 for numeric boolean values",
                    "Use 'yes'/'no' for text boolean values",
                ],
            },
        };
    },
};

/**
 * Generic type inference helper for dynamic fields
 */
export const GenericTypeInference = {
    /**
     * Infer field type from monitor configuration
     */
    inferFieldType<T extends BaseMonitorConfig>(
        config: T,
        fieldName: string
    ): {
        type: string;
        optional: boolean;
        validator: z.ZodType;
    } | null {
        const field = config.fields.find((f) => f.name === fieldName);
        if (!field) {
            return null;
        }

        let validator: z.ZodType;

        switch (field.type) {
            case "text": {
                validator = z.string();
                break;
            }
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
            type: field.type,
            optional: !field.required,
            validator,
        };
    },

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
                success: false as const,
                error: `Field ${fieldName} not found in configuration`,
                details: {
                    expectedType: "valid field name",
                    actualType: "unknown field",
                    suggestions: [
                        `Available fields: ${config.fields.map((f) => f.name).join(", ")}`,
                        "Check field name spelling",
                        "Verify field is defined in monitor configuration",
                    ],
                },
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
                        success: false,
                        error: `Required field ${fieldName} is missing`,
                        details: {
                            expectedType: fieldInfo.type,
                            actualType: "undefined",
                            suggestions: [
                                `Provide a value for ${fieldName}`,
                                `Field type should be: ${fieldInfo.type}`,
                            ],
                        },
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
                        success: false,
                        error: `Invalid value for field ${fieldName}`,
                        details: {
                            expectedType: fieldInfo.type,
                            actualType: typeof value,
                            suggestions: validationResult.error.issues.map((e) => e.message),
                        },
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
                        success: false,
                        error: `Validation failed for field ${fieldName}`,
                        details: {
                            expectedType: fieldInfo.type,
                            actualType: typeof value,
                            suggestions: validationResult.error.issues.map((e) => e.message),
                        },
                    };
                }

                return {
                    success: true,
                    value: validationResult.data,
                };
            },
        };
    },
};

/**
 * Type-safe monitor data interface with runtime validation
 */
export interface TypeSafeMonitorData<T extends MonitorType> {
    type: T;
    [K: string]: unknown;
}

/**
 * Enhanced monitor data builder with type safety
 */
export class TypeSafeMonitorBuilder<T extends MonitorType> {
    private data: Record<string, unknown> = {};
    private readonly monitorType: T;
    private readonly errors: string[] = [];

    constructor(monitorType: T) {
        this.monitorType = monitorType;
        this.data.type = monitorType;
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
                logger.warn("Field validation failed:", validation.details);
            }
        } catch (error) {
            this.errors.push(`Error setting field ${fieldName}: ${error}`);
            logger.error("Error setting field:", error);
        }

        return this;
    }

    /**
     * Get field value with type checking
     */
    getField<K extends string>(fieldName: K): TypeGuardResult<unknown> {
        if (!(fieldName in this.data)) {
            return {
                success: false,
                error: `Field ${fieldName} not found`,
                details: {
                    expectedType: "existing field",
                    actualType: "undefined",
                    suggestions: [`Available fields: ${Object.keys(this.data).join(", ")}`],
                },
            };
        }

        return {
            success: true,
            value: this.data[fieldName],
        };
    }

    /**
     * Build the monitor data with validation
     */
    build(): TypeGuardResult<TypeSafeMonitorData<T>> {
        if (this.errors.length > 0) {
            return {
                success: false,
                error: "Monitor data has validation errors",
                details: {
                    expectedType: "valid monitor data",
                    actualType: "invalid monitor data",
                    suggestions: this.errors,
                },
            };
        }

        return {
            success: true,
            value: this.data as TypeSafeMonitorData<T>,
        };
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
                success: false,
                error: "Monitor data must be an object",
                details: {
                    expectedType: "object",
                    actualType: typeof data,
                    suggestions: ["Provide monitor data as an object with type and other fields"],
                },
            };
        }

        const obj = data as Record<string, unknown>;
        const validationResult = EnhancedTypeGuard.validateMonitorType(obj.type);

        if (!validationResult.success) {
            return {
                success: false,
                error: validationResult.error ?? "Validation failed",
                details: validationResult.details ?? {
                    expectedType: "valid monitor data",
                    actualType: "invalid data",
                    suggestions: ["Ensure monitor data is properly formatted"],
                },
            };
        }

        return {
            success: true,
            value: obj as TypeSafeMonitorData<T>,
        };
    },
};
