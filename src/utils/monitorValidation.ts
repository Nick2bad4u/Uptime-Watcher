/**
 * Enhanced monitor validation utilities with shared schemas.
 * Provides both client-side and server-side validation support.
 */

import type { Monitor, MonitorType } from "@shared/types";
import type { HttpFormData, MonitorFormData, PingFormData, PortFormData } from "@shared/types/formData";
import type { ValidationResult } from "@shared/types/validation";

// Import shared validation functions for client-side validation
import {
    validateMonitorData as sharedValidateMonitorData,
    validateMonitorField as sharedValidateMonitorField,
} from "@shared/validation/schemas";

import { useMonitorTypesStore } from "../stores/monitor/useMonitorTypesStore";
import { withUtilityErrorHandling } from "./errorHandling";

/**
 * Required fields for monitor creation, ensuring type safety.
 * Prevents runtime errors by guaranteeing essential properties are present.
 */
export interface MonitorCreationData
    extends Pick<Monitor, "history" | "monitoring" | "responseTime" | "retryAttempts" | "status" | "timeout" | "type"> {
    /** Additional fields provided during creation */
    [key: string]: unknown;
}

/**
 * Create monitor object with proper field mapping and type safety.
 *
 * @param type - Monitor type
 * @param fields - Field values to merge with defaults
 * @returns Monitor creation data with type-specific fields and guaranteed required fields
 */
export function createMonitorObject(type: MonitorType, fields: Partial<MonitorFormData>): MonitorCreationData {
    const monitor: MonitorCreationData = {
        history: [],
        monitoring: true,
        responseTime: -1,
        retryAttempts: 3,
        status: "pending",
        timeout: 10_000,
        type,
        ...fields,
    };

    return monitor;
}

/**
 * Validate monitor data using backend registry.
 *
 * @param type - Monitor type
 * @param data - Monitor data to validate
 * @returns Promise resolving to validation result
 */
export async function validateMonitorData(
    type: MonitorType,
    data: Partial<MonitorFormData>
): Promise<ValidationResult> {
    return withUtilityErrorHandling(
        async () => {
            // Use store method instead of direct IPC call
            const store = useMonitorTypesStore.getState();
            const result = await store.validateMonitorData(type, data);

            return result;
        },
        "Monitor data validation",
        {
            errors: ["Validation failed - unable to connect to backend"],
            metadata: {},
            success: false,
            warnings: [],
        }
    );
}

/**
 * Perform client-side validation using shared Zod schemas.
 * Provides immediate feedback without IPC round-trip.
 *
 * @param type - Monitor type
 * @param data - Monitor data to validate
 * @returns Promise resolving to validation result
 */
export async function validateMonitorDataClientSide(
    type: MonitorType,
    data: Partial<MonitorFormData>
): Promise<ValidationResult> {
    return withUtilityErrorHandling(
        () => {
            // Use shared validation directly on client-side
            const result = sharedValidateMonitorData(type, data);

            return Promise.resolve({
                errors: result.errors,
                success: result.success,
                warnings: result.warnings ?? [],
            });
        },
        "Client-side monitor data validation",
        {
            errors: ["Client-side validation failed"],
            success: false,
            warnings: [],
        }
    );
}

/**
 * Validate individual monitor field with improved error filtering.
 *
 * @param type - Monitor type
 * @param fieldName - Field name to validate
 * @param value - Field value
 * @returns Promise resolving to validation errors (empty if valid)
 */
export async function validateMonitorField(type: MonitorType, fieldName: string, value: unknown): Promise<string[]> {
    return withUtilityErrorHandling(
        async () => {
            // Use the full validation and extract errors for this field
            const data: Record<string, unknown> = {
                [fieldName]: value,
                type,
            };
            const result = await validateMonitorData(type, data);

            if (result.success) {
                return [];
            }

            // Improved error filtering: look for field-specific errors more robustly
            const fieldErrors = result.errors.filter((error) => {
                const errorLower = error.toLowerCase();
                const fieldLower = fieldName.toLowerCase();

                // Check if error message contains the field name or common field error patterns
                return (
                    errorLower.includes(fieldLower) ||
                    errorLower.includes(`"${fieldLower}"`) ||
                    errorLower.includes(`'${fieldLower}'`) ||
                    errorLower.includes(`${fieldLower}:`) ||
                    errorLower.includes(`${fieldLower} `)
                );
            });

            // If no field-specific errors found but validation failed, return all errors
            // This prevents losing important validation information
            return fieldErrors.length > 0 ? fieldErrors : result.errors;
        },
        `Monitor field validation for ${fieldName}`,
        [`Failed to validate ${fieldName}`]
    );
}

/**
 * Validate a specific monitor field for real-time feedback using shared schemas.
 * Provides immediate validation without IPC round-trip.
 *
 * @param type - Monitor type
 * @param fieldName - Field name to validate
 * @param value - Field value to validate
 * @returns Promise resolving to validation result
 */
export async function validateMonitorFieldClientSide(
    type: MonitorType,
    fieldName: string,
    value: unknown
): Promise<ValidationResult> {
    return withUtilityErrorHandling(
        () => {
            // Use shared field validation for immediate feedback
            const result = sharedValidateMonitorField(type, fieldName, value);

            return Promise.resolve({
                errors: result.errors,
                metadata: result.metadata ?? {},
                success: result.success,
                warnings: result.warnings ?? [],
            });
        },
        `Client-side field validation for ${fieldName}`,
        {
            errors: [`Failed to validate ${fieldName} on client-side`],
            metadata: {},
            success: false,
            warnings: [],
        }
    );
}

// Helper functions for monitor form validation (reduces complexity by composition)
const validateHttpMonitorFormData = (data: Partial<HttpFormData>) => {
    const errors: string[] = [];

    if (!data.url || typeof data.url !== "string") {
        errors.push("URL is required for HTTP monitors");
    } else {
        // Validate URL field specifically
        const urlResult = sharedValidateMonitorField("http", "url", data.url);
        errors.push(...urlResult.errors);
    }

    return errors;
};

const validatePortMonitorFormData = (data: Partial<PortFormData>) => {
    const errors: string[] = [];

    if (!data.host || typeof data.host !== "string") {
        errors.push("Host is required for port monitors");
    } else {
        // Validate host field specifically
        const hostResult = sharedValidateMonitorField("port", "host", data.host);
        errors.push(...hostResult.errors);
    }

    if (!data.port || typeof data.port !== "number") {
        errors.push("Port is required for port monitors");
    } else {
        // Validate port field specifically
        const portResult = sharedValidateMonitorField("port", "port", data.port);
        errors.push(...portResult.errors);
    }

    return errors;
};

/**
 * Validates ping monitor form data by checking required host field.
 *
 * @param data - Form data to validate
 * @returns Array of validation error messages
 *
 * @remarks
 * Ping monitors require a host field that must be a valid hostname, IP address, or localhost.
 * Uses shared validation to ensure consistency with backend validation rules.
 */
const validatePingMonitorFormData = (data: Partial<PingFormData>) => {
    const errors: string[] = [];

    if (!data.host || typeof data.host !== "string") {
        errors.push("Host is required for ping monitors");
    } else {
        // Validate host field specifically
        const hostResult = sharedValidateMonitorField("ping", "host", data.host);
        errors.push(...hostResult.errors);
    }

    return errors;
};

const validateMonitorFormDataByType = (type: MonitorType, data: Partial<MonitorFormData>) => {
    const errors: string[] = [];

    // Validate type-specific required fields only
    switch (type) {
        case "http": {
            errors.push(...validateHttpMonitorFormData(data as Partial<HttpFormData>));
            break;
        }
        case "ping": {
            errors.push(...validatePingMonitorFormData(data as Partial<PingFormData>));
            break;
        }
        case "port": {
            errors.push(...validatePortMonitorFormData(data as Partial<PortFormData>));
            break;
        }
    }

    return errors;
};

/**
 * Validate monitor form data with only the fields that are provided.
 * Used for form validation where not all monitor fields are available yet.
 *
 * @param type - Monitor type
 * @param data - Partial monitor data from form
 * @returns Promise resolving to validation result
 */
export async function validateMonitorFormData(
    type: MonitorType,
    data: Partial<MonitorFormData>
): Promise<ValidationResult> {
    return withUtilityErrorHandling(
        () => {
            const errors = validateMonitorFormDataByType(type, data);

            return Promise.resolve({
                errors,
                success: errors.length === 0,
                warnings: [],
            });
        },
        "Form data validation",
        {
            errors: ["Form validation failed"],
            success: false,
            warnings: [],
        }
    );
}
