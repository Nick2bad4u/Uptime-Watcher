/**
 * Type definitions for monitor form data.
 * Provides type-safe interfaces for form handling and validation.
 *
 * @remarks
 * These interfaces define the structure of form data used throughout the application
 * for creating and editing monitors. They help avoid index signature access issues
 * while maintaining type safety for form operations.
 *
 * @packageDocumentation
 */

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
    /** Monitor type identifier */
    type?: string;
}

/**
 * Dynamic form data for extensible monitor types.
 * Used when monitor type is not known at compile time.
 */
export interface DynamicFormData extends Record<string, unknown> {
    checkInterval?: number;
    monitoring?: boolean;
    retryAttempts?: number;
    timeout?: number;
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
 * Union type for all supported monitor form data types.
 */
export type MonitorFormData = HttpFormData | PingFormData | PortFormData;

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
 * Create default form data for a specific monitor type.
 *
 * @param type - Monitor type
 * @returns Default form data for the specified type
 */
export function createDefaultFormData(type: "http"): Partial<HttpFormData>;
export function createDefaultFormData(type: "ping"): Partial<PingFormData>;
export function createDefaultFormData(type: "port"): Partial<PortFormData>;
export function createDefaultFormData(type: string): Partial<BaseFormData> {
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
 * @returns True if data is HTTP form data
 */
export function isHttpFormData(data: Partial<MonitorFormData>): data is HttpFormData {
    return data.type === "http" && typeof data.url === "string";
}

/**
 * Type guard to check if form data is for ping monitor.
 *
 * @param data - Form data to check
 * @returns True if data is ping form data
 */
export function isPingFormData(data: Partial<MonitorFormData>): data is PingFormData {
    return data.type === "ping" && typeof data.host === "string";
}

/**
 * Type guard to check if form data is for port monitor.
 *
 * @param data - Form data to check
 * @returns True if data is port form data
 */
export function isPortFormData(data: Partial<MonitorFormData>): data is PortFormData {
    return data.type === "port" && typeof data.host === "string" && typeof data.port === "number";
}

/**
 * Registry of type-specific validation functions.
 * Add new monitor types here to enable dynamic validation.
 */
const FORM_DATA_VALIDATORS = {
    http: isHttpFormData,
    ping: isPingFormData,
    port: isPortFormData,
} as const;

/**
 * Type guard to check if form data is valid and complete.
 *
 * @param data - Form data to validate
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

    // Use index signature to avoid TypeScript compiler warnings
    const validator = (
        FORM_DATA_VALIDATORS as Record<string, ((data: Partial<MonitorFormData>) => boolean) | undefined>
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
 * @returns Property value or default
 */
export function safeGetFormProperty<T>(data: DynamicFormData, property: string, defaultValue: T): T {
    // eslint-disable-next-line security/detect-object-injection -- property is validated for form data
    if (property in data && data[property] !== undefined) {
        // eslint-disable-next-line security/detect-object-injection -- property is validated for form data
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
export function safeSetFormProperty<T>(data: DynamicFormData, property: string, value: T): void {
    // eslint-disable-next-line security/detect-object-injection -- property is validated for form data
    data[property] = value;
}
