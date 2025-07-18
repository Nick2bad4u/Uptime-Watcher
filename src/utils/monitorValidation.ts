/**
 * Registry-based monitor validation utilities.
 * Uses the backend monitor type registry for consistent validation.
 */

import type { MonitorType } from "../types";

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
