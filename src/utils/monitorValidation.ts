/**
 * Enhanced monitor validation utilities with shared schemas.
 * Provides both client-side and server-side validation support.
 */

import type { MonitorType } from "@shared/types";

// Import shared validation functions for client-side validation
import {
    validateMonitorData as sharedValidateMonitorData,
    validateMonitorField as sharedValidateMonitorField,
} from "@shared/validation/schemas";

import { withUtilityErrorHandling } from "./errorHandling";

/**
 * Create monitor object with proper field mapping.
 *
 * @param type - Monitor type
 * @param fields - Field values
 * @returns Monitor object with type-specific fields
 */
export function createMonitorObject(type: MonitorType, fields: Record<string, unknown>): Record<string, unknown> {
    const monitor: Record<string, unknown> = {
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
    data: Record<string, unknown>
): Promise<{ errors: string[]; success: boolean }> {
    return withUtilityErrorHandling(
        async () => {
            // Use IPC to validate via backend registry
            const result = await window.electronAPI.monitorTypes.validateMonitorData(type, data);

            // Handle the advanced validation result format
            return {
                errors: result.errors,
                success: result.success,
            };
        },
        "Monitor data validation",
        {
            errors: ["Validation failed - unable to connect to backend"],
            success: false,
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
    data: Record<string, unknown>
): Promise<{ errors: string[]; success: boolean; warnings: string[] }> {
    return withUtilityErrorHandling(
        () => {
            // Use shared validation directly on client-side
            const result = sharedValidateMonitorData(type, data);

            return Promise.resolve({
                errors: result.errors,
                success: result.success,
                warnings: result.warnings,
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
 * Validate individual monitor field.
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

            // Filter errors to only include those for the specific field
            const fieldErrors = result.errors.filter((error) => error.toLowerCase().includes(fieldName.toLowerCase()));

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
): Promise<{ errors: string[]; success: boolean }> {
    return withUtilityErrorHandling(
        () => {
            // Use shared field validation for immediate feedback
            const result = sharedValidateMonitorField(type, fieldName, value);

            return Promise.resolve({
                errors: result.errors,
                success: result.success,
            });
        },
        `Client-side field validation for ${fieldName}`,
        {
            errors: [`Failed to validate ${fieldName} on client-side`],
            success: false,
        }
    );
}

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
    data: Record<string, unknown>
): Promise<{ errors: string[]; success: boolean; warnings: string[] }> {
    return withUtilityErrorHandling(
        () => {
            const errors: string[] = [];

            // Validate type-specific required fields only
            if (type === "http") {
                if (!data.url || typeof data.url !== "string") {
                    errors.push("URL is required for HTTP monitors");
                } else {
                    // Validate URL field specifically
                    const urlResult = sharedValidateMonitorField(type, "url", data.url);
                    errors.push(...urlResult.errors);
                }
            }

            if (type === "port") {
                if (!data.host || typeof data.host !== "string") {
                    errors.push("Host is required for port monitors");
                } else {
                    // Validate host field specifically
                    const hostResult = sharedValidateMonitorField(type, "host", data.host);
                    errors.push(...hostResult.errors);
                }

                if (!data.port || typeof data.port !== "number") {
                    errors.push("Port is required for port monitors");
                } else {
                    // Validate port field specifically
                    const portResult = sharedValidateMonitorField(type, "port", data.port);
                    errors.push(...portResult.errors);
                }
            }

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
