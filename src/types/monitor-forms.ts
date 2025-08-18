/**
 * Specific types for monitor form data and field handling. Replaces generic
 * `Record<string, unknown>` patterns.
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
 * Monitor validation result with specific error types
 *
 * @deprecated Use ValidationResult from unified validation system instead
 *
 * @see {@link ValidationResult} in shared/types/validation.ts
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
 * Ping monitor specific fields
 */
export interface PingMonitorFields extends BaseMonitorFields {
    /** Host to ping */
    host: string;
}

/**
 * DNS monitor specific fields
 */
export interface DnsMonitorFields extends BaseMonitorFields {
    /** Expected value for the DNS response (optional) */
    expectedValue?: string;
    /** Host to query */
    host: string;
    /** DNS record type to query */
    recordType:
        | "A"
        | "AAAA"
        | "ANY"
        | "CAA"
        | "CNAME"
        | "MX"
        | "NAPTR"
        | "NS"
        | "PTR"
        | "SOA"
        | "SRV"
        | "TLSA"
        | "TXT";
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
 * Union type for all monitor field types
 */
export type MonitorFormFields =
    | DnsMonitorFields
    | HttpMonitorFields
    | PingMonitorFields
    | PortMonitorFields;

/**
 * Helper to get default fields for a monitor type.
 *
 * @remarks
 * For unknown monitor types, this function falls back to HTTP monitor fields as
 * they represent the most common monitoring use case. This ensures the function
 * always returns valid form fields even for unsupported types.
 *
 * @param type - The monitor type to get defaults for
 *
 * @returns Default field values for the specified monitor type
 */
export function getDefaultMonitorFields(type: MonitorType): MonitorFormFields {
    const baseFields: BaseMonitorFields = {
        checkInterval: 300_000, // 5 minutes
        retryAttempts: 3,
        timeout: 10_000, // 10 seconds
    };

    switch (type) {
        case "dns": {
            return {
                ...baseFields,
                expectedValue: "",
                host: "",
                recordType: "A",
            } satisfies DnsMonitorFields;
        }
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
        case "ping": {
            return {
                ...baseFields,
                host: "",
            } satisfies PingMonitorFields;
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
 * Type guard to check if fields are for HTTP monitor.
 *
 * @remarks
 * Checks for presence of required HTTP properties and absence of
 * port/ping-specific ones to provide more robust type detection and prevent
 * false positives.
 *
 * @param fields - Monitor form fields to check
 *
 * @returns True if fields contain HTTP monitor properties
 */
export function isHttpMonitorFields(
    fields: MonitorFormFields
): fields is HttpMonitorFields {
    return "url" in fields && !("host" in fields);
}

/**
 * Type guard to check if fields are for Ping monitor.
 *
 * @remarks
 * Validates presence of host property and absence of port property to
 * distinguish from port monitors which also have a host field.
 *
 * @param fields - Monitor form fields to check
 *
 * @returns True if fields contain valid ping monitor properties
 */
export function isPingMonitorFields(
    fields: MonitorFormFields
): fields is PingMonitorFields {
    return (
        "host" in fields &&
        !("port" in fields) &&
        !("url" in fields) &&
        typeof fields.host === "string"
    );
}

/**
 * Type guard to check if fields are for Port monitor.
 *
 * @remarks
 * Validates both presence and types of required properties to ensure runtime
 * type safety and prevent incorrect type assumptions.
 *
 * @param fields - Monitor form fields to check
 *
 * @returns True if fields contain valid port monitor properties
 */
export function isPortMonitorFields(
    fields: MonitorFormFields
): fields is PortMonitorFields {
    return (
        "host" in fields &&
        "port" in fields &&
        typeof fields.host === "string" &&
        typeof fields.port === "number"
    );
}
