/**
 * Specific types for monitor form data and field handling.
 * Replaces generic `Record<string, unknown>` patterns.
 */

import type { MonitorType } from "@shared/types";

/**
 * Base monitor fields common to all monitor types
 */
export interface BaseMonitorFields {
    /** Check interval in milliseconds */
    checkInterval?: number;
    /** Monitor name */
    name?: string;
    /** Number of retry attempts */
    retryAttempts?: number;
    /** Timeout in milliseconds */
    timeout?: number;
}

/**
 * HTTP monitor specific fields
 */
export interface HttpMonitorFields extends BaseMonitorFields {
    /** Expected status code */
    expectedStatusCode?: number;
    /** Follow redirects */
    followRedirects?: boolean;
    /** Request headers */
    headers?: Record<string, string>;
    /** HTTP method */
    method?: "DELETE" | "GET" | "HEAD" | "POST" | "PUT";
    /** URL to monitor */
    url: string;
}

/**
 * Type-safe field change handlers for monitor forms
 */
export interface MonitorFieldChangeHandlers {
    /** Handler for boolean fields */
    boolean: (fieldName: string, value: boolean) => void;
    /** Handler for number fields */
    number: (fieldName: string, value: number) => void;
    /** Handler for object fields */
    object: (fieldName: string, value: Record<string, unknown>) => void;
    /** Handler for string fields */
    string: (fieldName: string, value: string) => void;
}

/**
 * Monitor field values organized by type
 */
export interface MonitorFieldValues {
    /** Boolean field values */
    booleans: Record<string, boolean>;
    /** Number field values */
    numbers: Record<string, number>;
    /** Object field values */
    objects: Record<string, Record<string, unknown>>;
    /** String field values */
    strings: Record<string, string>;
}

/**
 * Union type for all monitor field types
 */
export type MonitorFormFields = HttpMonitorFields | PortMonitorFields;

/**
 * Monitor validation result with specific error types
 */
export interface MonitorValidationResult {
    /** Array of error messages */
    errors: string[];
    /** Additional validation metadata */
    metadata: {
        /** Monitor type being validated */
        monitorType: MonitorType;
        /** Validation timestamp */
        timestamp: number;
        /** Fields that were validated */
        validatedFields: string[];
    };
    /** Whether validation passed */
    success: boolean;
    /** Array of warning messages */
    warnings: string[];
}

/**
 * Port monitor specific fields
 */
export interface PortMonitorFields extends BaseMonitorFields {
    /** Connection type */
    connectionType?: "tcp" | "udp";
    /** Host to monitor */
    host: string;
    /** Port number */
    port: number;
}

/**
 * Helper to get default fields for a monitor type
 */
export function getDefaultMonitorFields(type: MonitorType): MonitorFormFields {
    const baseFields: BaseMonitorFields = {
        checkInterval: 300_000, // 5 minutes
        retryAttempts: 3,
        timeout: 10_000, // 10 seconds
    };

    switch (type) {
        case "http": {
            return {
                ...baseFields,
                expectedStatusCode: 200,
                followRedirects: true,
                headers: {},
                method: "GET",
                url: "",
            } satisfies HttpMonitorFields;
        }
        case "port": {
            return {
                ...baseFields,
                connectionType: "tcp",
                host: "",
                port: 80,
            } satisfies PortMonitorFields;
        }
        default: {
            // Fallback to HTTP fields for unknown types
            return {
                ...baseFields,
                url: "",
            } satisfies HttpMonitorFields;
        }
    }
}

/**
 * Type guard to check if fields are for HTTP monitor
 */
export function isHttpMonitorFields(fields: MonitorFormFields): fields is HttpMonitorFields {
    return "url" in fields;
}

/**
 * Type guard to check if fields are for Port monitor
 */
export function isPortMonitorFields(fields: MonitorFormFields): fields is PortMonitorFields {
    return "host" in fields && "port" in fields;
}
