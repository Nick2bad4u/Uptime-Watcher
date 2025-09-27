/**
 * Type definitions for monitor form data interfaces.
 *
 * @remarks
 * Provides type-safe interfaces for form handling and validation. form handling
 * and validation.
 * @remarks
 * These interfaces define the structure of form data used throughout the
 * application for creating and editing monitors. They help avoid index
 * signature access issues while maintaining type safety for form operations.
 *
 * @packageDocumentation
 */

import type { SetOptional, Simplify, UnknownRecord } from "type-fest";

/**
 * Base form data interface with common properties.
 */
export interface BaseFormData {
    /** Monitor check interval in milliseconds */
    checkInterval?: number;
    /** Whether monitoring is enabled */
    monitoring?: boolean;
    /** Number of retry attempts on failure */
    retryAttempts?: number;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Monitor type identifier with autocomplete for known types */
    type?: string;
}

/**
 * Dynamic form data for extensible monitor types. Used when monitor type is not
 * known at compile time.
 */
export interface DynamicFormData extends UnknownRecord {
    /** Monitor check interval in milliseconds */
    checkInterval?: number;
    /** Whether monitoring is enabled */
    monitoring?: boolean;
    /** Number of retry attempts on failure */
    retryAttempts?: number;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Monitor type identifier with autocomplete for known types */
    type?: string;
}

/**
 * Form data for HTTP monitors.
 */
export interface HttpFormData extends BaseFormData {
    type: "http";
    /** Target URL to monitor */
    url: string;
}

/**
 * Form data for ping monitors.
 */
export interface PingFormData extends BaseFormData {
    /** Target host to ping */
    host: string;
    type: "ping";
}

/**
 * Form data for port monitors.
 */
export interface PortFormData extends BaseFormData {
    /** Target host to monitor */
    host: string;
    /** Target port to monitor */
    port: number;
    type: "port";
}

/**
 * Form data for DNS monitors.
 */
export interface DnsFormData extends BaseFormData {
    /** Expected value for DNS record (optional) */
    expectedValue?: string;
    /** Target host to resolve */
    host: string;
    /** DNS record type to query */
    recordType: string;
    type: "dns";
}

/**
 * Form data for SSL certificate monitors.
 */
export interface SslFormData extends BaseFormData {
    /** Warning threshold in days before certificate expiry */
    certificateWarningDays: number;
    /** Target host serving the certificate */
    host: string;
    /** TLS port to connect to */
    port: number;
    type: "ssl";
}

/**
 * Union type for all supported monitor form data types. Simplified for better
 * IntelliSense display.
 */
export type MonitorFormData = Simplify<
    DnsFormData | HttpFormData | PingFormData | PortFormData | SslFormData
>;

/**
 * Create default form data for a specific monitor type.
 *
 * @param type - Monitor type
 *
 * @returns Default form data for the specified type
 */
/* eslint-disable no-redeclare -- Function overloads are legitimate TypeScript pattern */
export function createDefaultFormData(
    type: "dns"
): SetOptional<DnsFormData, "host" | "recordType">;
export function createDefaultFormData(
    type: "http"
): SetOptional<HttpFormData, "url">;
export function createDefaultFormData(
    type: "ping"
): SetOptional<PingFormData, "host">;
export function createDefaultFormData(
    type: "port"
): SetOptional<PortFormData, "host" | "port">;
export function createDefaultFormData(
    type: "ssl"
): SetOptional<SslFormData, "certificateWarningDays" | "host" | "port">;
export function createDefaultFormData(
    type: string
): SetOptional<BaseFormData, never> {
    /* eslint-enable no-redeclare -- Re-enable after necessary function overloading for type safety */
    return {
        checkInterval: 300_000, // 5 minutes
        monitoring: true,
        retryAttempts: 3,
        timeout: 10_000, // 10 seconds
        type,
    };
}

/**
 * Type guard to check if form data is for HTTP monitor.
 *
 * @param data - Form data to check
 *
 * @returns True if data is HTTP form data
 */
export function isHttpFormData(
    data: Partial<MonitorFormData>
): data is HttpFormData {
    return (
        data.type === "http" &&
        typeof data.url === "string" &&
        data.url.trim() !== ""
    );
}

/**
 * Type guard to check if form data is for DNS monitor.
 *
 * @param data - Form data to check
 *
 * @returns True if data is DNS form data
 */
export function isDnsFormData(
    data: Partial<MonitorFormData>
): data is DnsFormData {
    return (
        data.type === "dns" &&
        typeof data.host === "string" &&
        data.host.trim() !== "" &&
        typeof data.recordType === "string" &&
        data.recordType.trim() !== ""
    );
}

/**
 * Type guard to check if form data is for ping monitor.
 *
 * @param data - Form data to check
 *
 * @returns True if data is ping form data
 */
export function isPingFormData(
    data: Partial<MonitorFormData>
): data is PingFormData {
    return (
        data.type === "ping" &&
        typeof data.host === "string" &&
        data.host.trim() !== ""
    );
}

/**
 * Type guard to check if form data is for port monitor.
 *
 * @param data - Form data to check
 *
 * @returns True if data is port form data
 */
export function isPortFormData(
    data: Partial<MonitorFormData>
): data is PortFormData {
    return (
        data.type === "port" &&
        typeof data.host === "string" &&
        data.host.trim() !== "" &&
        typeof data.port === "number" &&
        data.port > 0 &&
        data.port <= 65_535
    );
}

/**
 * Type guard to check if form data is for SSL monitor.
 *
 * @param data - Form data to check
 *
 * @returns True if data is SSL form data
 */
export function isSslFormData(
    data: Partial<MonitorFormData>
): data is SslFormData {
    return (
        data.type === "ssl" &&
        typeof data.host === "string" &&
        data.host.trim() !== "" &&
        typeof data.port === "number" &&
        data.port > 0 &&
        data.port <= 65_535 &&
        typeof data.certificateWarningDays === "number" &&
        data.certificateWarningDays >= 1 &&
        data.certificateWarningDays <= 365
    );
}

/**
 * Registry of type-specific validation functions. Add new monitor types here to
 * enable dynamic validation.
 */
const FORM_DATA_VALIDATORS = {
    dns: isDnsFormData,
    http: isHttpFormData,
    ping: isPingFormData,
    port: isPortFormData,
    ssl: isSslFormData,
} as const;

/**
 * Type guard to check if form data is valid and complete.
 *
 * @param data - Form data to validate
 *
 * @returns True if data is valid monitor form data
 */
export function isValidMonitorFormData(data: unknown): data is MonitorFormData {
    if (typeof data !== "object" || data === null) {
        return false;
    }

    const formData = data as Partial<MonitorFormData>;

    if (!formData.type || typeof formData.type !== "string") {
        return false;
    }

    // Use type-safe access with proper typing
    const validator = (
        FORM_DATA_VALIDATORS as Simplify<
            Record<
                string,
                ((data: Partial<MonitorFormData>) => boolean) | undefined
            >
        >
    )[formData.type];
    if (!validator) {
        return false;
    }

    return validator(formData);
}

/**
 * Safely get a property from dynamic form data.
 *
 * @param data - Form data object
 * @param property - Property name to access
 * @param defaultValue - Default value if property is undefined
 *
 * @returns Property value or default
 */
export function safeGetFormProperty<T>(
    data: DynamicFormData,
    property: string,
    defaultValue: T
): T {
    if (property in data && data[property] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Caller provides type T and default value as contract for expected property type
        return data[property] as T;
    }
    return defaultValue;
}

/**
 * Safely set a property on dynamic form data.
 *
 * @param data - Form data object
 * @param property - Property name to set
 * @param value - Value to set
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- Type parameter ensures type safety for value at call site
export function safeSetFormProperty<T>(
    data: DynamicFormData,
    property: string,
    value: T
): void {
    data[property] = value;
}
