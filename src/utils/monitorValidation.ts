/**
 * Enhanced monitor validation utilities with shared schemas. Provides both
 * client-side and server-side validation support.
 */

import type { Monitor, MonitorType } from "@shared/types";
import type { ValidationResult } from "@shared/types/validation";
import type { Simplify, UnknownRecord } from "type-fest";

import { withUtilityErrorHandling } from "@shared/utils/errorHandling";
// Import shared validation functions for client-side validation
import {
    validateMonitorData as sharedValidateMonitorData,
    validateMonitorField as sharedValidateMonitorField,
} from "@shared/validation/schemas";

import type {
    DnsFormData,
    HttpFormData,
    MonitorFormData,
    PingFormData,
    PortFormData,
    SslFormData,
} from "../types/monitorFormData";

import { useMonitorTypesStore } from "../stores/monitor/useMonitorTypesStore";

// ValidationResult type available via direct import from
// @shared/types/validation

/**
 * Enhanced validation result with additional type information using Simplify.
 */
type EnhancedValidationResult = Simplify<
    ValidationResult & {
        /** Field that was validated (if applicable) */
        fieldName?: string;
        /** Type information about the validation */
        validationType: "field" | "full" | "partial";
    }
>;

/**
 * Required fields for monitor creation, ensuring type safety. Prevents runtime
 * errors by guaranteeing essential properties are present.
 */
export interface MonitorCreationData
    extends Pick<
            Monitor,
            | "history"
            | "monitoring"
            | "responseTime"
            | "retryAttempts"
            | "status"
            | "timeout"
            | "type"
        >,
        UnknownRecord {} /**
 * Create monitor object with proper field mapping and type safety.
 *
 * @param type - Monitor type
 * @param fields - Field values to merge with defaults
 *
 * @returns Monitor creation data with type-specific fields and guaranteed
 *   required fields
 */
export function createMonitorObject(
    type: MonitorType,
    fields: Partial<MonitorFormData>
): MonitorCreationData {
    // Create base monitor with defaults
    const baseData: MonitorCreationData = {
        history: [],
        monitoring: true,
        responseTime: -1,
        retryAttempts: 3,
        status: "pending",
        timeout: 10_000,
        type,
        ...fields,
    };

    // Ensure the type is preserved if it was valid
    baseData.type = type;

    return baseData;
}

/**
 * Validate monitor data using backend registry.
 *
 * @param type - Monitor type
 * @param data - Monitor data to validate
 *
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
            return store.validateMonitorData(type, data);
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
 * Perform client-side validation using shared Zod schemas. Provides immediate
 * feedback without IPC round-trip.
 *
 * @param type - Monitor type
 * @param data - Monitor data to validate
 *
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
 * Enhanced field validation with type information and better error handling.
 *
 * @param type - Monitor type
 * @param fieldName - Field name to validate
 * @param value - Field value
 *
 * @returns Promise resolving to enhanced validation result
 */
export async function validateMonitorFieldEnhanced(
    type: MonitorType,
    fieldName: string,
    value: unknown
): Promise<EnhancedValidationResult> {
    return withUtilityErrorHandling(
        async () => {
            // Use the shared validation for consistent results
            const data: UnknownRecord = {
                [fieldName]: value,
                type,
            };
            const result = await validateMonitorData(type, data);

            // Filter errors to include only field-specific ones
            const filteredErrors = result.errors.filter((error) =>
                error.toLowerCase().includes(fieldName.toLowerCase())
            );

            // If we had errors but filtering removed them all, and validation failed,
            // return a field-specific error message
            const finalErrors =
                result.errors.length > 0 &&
                filteredErrors.length === 0 &&
                !result.success
                    ? [`Failed to validate field: ${fieldName}`]
                    : filteredErrors;

            return {
                errors: finalErrors,
                fieldName,
                success: result.success,
                validationType: "field" as const,
                warnings:
                    result.warnings?.filter((warning) =>
                        warning.toLowerCase().includes(fieldName.toLowerCase())
                    ) ?? [],
            };
        },
        "Enhanced field validation",
        {
            errors: [`Failed to validate field: ${fieldName}`],
            fieldName,
            success: false,
            validationType: "field" as const,
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
 *
 * @returns Promise resolving to validation errors (empty if valid)
 */
export async function validateMonitorField(
    type: MonitorType,
    fieldName: string,
    value: unknown
): Promise<readonly string[]> {
    return withUtilityErrorHandling(
        async () => {
            // Use the enhanced validation for better error handling
            const result = await validateMonitorFieldEnhanced(
                type,
                fieldName,
                value
            );
            return result.errors;
        },
        "Field validation",
        [`Failed to validate field: ${fieldName}`]
    );
}

/**
 * Validate a specific monitor field for real-time feedback using shared
 * schemas. Provides immediate validation without IPC round-trip.
 *
 * @param type - Monitor type
 * @param fieldName - Field name to validate
 * @param value - Field value to validate
 *
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

// Helper functions for monitor form validation (reduces complexity by
// composition)
const validateHttpMonitorFormData = (data: Partial<HttpFormData>): string[] => {
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

/**
 * Validates DNS monitor form data by checking required host and recordType
 * fields, with optional expectedValue field.
 *
 * @remarks
 * DNS monitors require host and recordType fields. The expectedValue field is
 * optional and only validated if provided. Uses shared validation to ensure
 * consistency with backend validation rules.
 *
 * @param data - Form data to validate
 *
 * @returns Array of validation error messages
 */
const validateDnsMonitorFormData = (data: Partial<DnsFormData>): string[] => {
    const errors: string[] = [];

    if (!data.host || typeof data.host !== "string") {
        errors.push("Host is required for DNS monitors");
    } else {
        // Validate host field specifically
        const hostResult = sharedValidateMonitorField("dns", "host", data.host);
        errors.push(...hostResult.errors);
    }

    if (!data.recordType || typeof data.recordType !== "string") {
        errors.push("Record type is required for DNS monitors");
    } else {
        // Validate recordType field specifically
        const recordTypeResult = sharedValidateMonitorField(
            "dns",
            "recordType",
            data.recordType
        );
        errors.push(...recordTypeResult.errors);
    }

    // Optional expectedValue validation
    if (
        data.expectedValue &&
        typeof data.expectedValue === "string" &&
        data.expectedValue.trim()
    ) {
        const expectedValueResult = sharedValidateMonitorField(
            "dns",
            "expectedValue",
            data.expectedValue
        );
        errors.push(...expectedValueResult.errors);
    }

    return errors;
};

const validatePortMonitorFormData = (data: Partial<PortFormData>): string[] => {
    const errors: string[] = [];

    if (!data.host || typeof data.host !== "string") {
        errors.push("Host is required for port monitors");
    } else {
        // Validate host field specifically
        const hostResult = sharedValidateMonitorField(
            "port",
            "host",
            data.host
        );
        errors.push(...hostResult.errors);
    }

    if (!data.port || typeof data.port !== "number") {
        errors.push("Port is required for port monitors");
    } else {
        // Validate port field specifically
        const portResult = sharedValidateMonitorField(
            "port",
            "port",
            data.port
        );
        errors.push(...portResult.errors);
    }

    return errors;
};

const validateSslMonitorFormData = (data: Partial<SslFormData>): string[] => {
    const errors: string[] = [];

    if (!data.host || typeof data.host !== "string") {
        errors.push("Host is required for SSL monitors");
    } else {
        const hostResult = sharedValidateMonitorField("ssl", "host", data.host);
        errors.push(...hostResult.errors);
    }

    if (!data.port || typeof data.port !== "number") {
        errors.push("Port is required for SSL monitors");
    } else {
        const portResult = sharedValidateMonitorField("ssl", "port", data.port);
        errors.push(...portResult.errors);
    }

    if (
        !data.certificateWarningDays ||
        typeof data.certificateWarningDays !== "number"
    ) {
        errors.push(
            "Certificate warning threshold is required for SSL monitors"
        );
    } else {
        const warningResult = sharedValidateMonitorField(
            "ssl",
            "certificateWarningDays",
            data.certificateWarningDays
        );
        errors.push(...warningResult.errors);
    }

    return errors;
};

const validatePingMonitorFormData = (data: Partial<PingFormData>): string[] => {
    const errors: string[] = [];

    if (!data.host || typeof data.host !== "string") {
        errors.push("Host is required for ping monitors");
    } else {
        const hostResult = sharedValidateMonitorField(
            "ping",
            "host",
            data.host
        );
        errors.push(...hostResult.errors);
    }

    return errors;
};

const validateMonitorFormDataByType = (
    type: MonitorType,
    data: Partial<MonitorFormData>
): string[] => {
    const errors: string[] = [];

    // Validate type-specific required fields only
    /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Safe type narrowing within switch statement, each case guarantees the correct form data type */
    switch (type) {
        case "dns": {
            errors.push(
                ...validateDnsMonitorFormData(data as Partial<DnsFormData>)
            );
            break;
        }
        case "http": {
            errors.push(
                ...validateHttpMonitorFormData(data as Partial<HttpFormData>)
            );
            break;
        }
        case "ping": {
            errors.push(
                ...validatePingMonitorFormData(data as Partial<PingFormData>)
            );
            break;
        }
        case "port": {
            errors.push(
                ...validatePortMonitorFormData(data as Partial<PortFormData>)
            );
            break;
        }
        case "ssl": {
            errors.push(
                ...validateSslMonitorFormData(data as Partial<SslFormData>)
            );
            break;
        }
        default: {
            errors.push(`Unsupported monitor type: ${String(type)}`);
        }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-type-assertion -- Turn on again after switch statement */

    return errors;
};

/**
 * Validate monitor form data with only the fields that are provided. Used for
 * form validation where not all monitor fields are available yet.
 *
 * @param type - Monitor type
 * @param data - Partial monitor data from form
 *
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
