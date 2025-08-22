/**
 * Form data type definitions for Uptime Watcher monitor forms.
 *
 * @remarks
 * These interfaces provide type-safe form data structures for creating and
 * editing monitors. Each monitor type has its own specific form data interface
 * that extends the base form data. This ensures proper validation and type
 * checking throughout the form handling pipeline.
 *
 * @packageDocumentation
 */

import type { MonitorType } from "@shared/types";

/**
 * Add site form state interface.
 *
 * @remarks
 * Represents the complete state of the add site form including UI state and
 * form data.
 *
 * @public
 */
export interface AddSiteFormState {
    /** Current form mode */
    addMode: FormMode;
    /** Complete form data */
    formData: SiteFormData;
    /** Form error message */
    formError?: string;
    /** Selected existing site ID (when addMode is "existing") */
    selectedExistingSite: string;
}

/**
 * Base form data interface that all monitor form data types extend.
 *
 * @remarks
 * Contains common fields that all monitor types require regardless of their
 * specific type.
 *
 * @public
 */
export interface BaseFormData {
    /** Interval between checks in milliseconds */
    checkInterval: number;
    /** Whether the monitor is enabled */
    enabled?: boolean;
    /** Number of retry attempts when a check fails */
    retryAttempts: number;
    /** Timeout for the monitor check in milliseconds */
    timeout: number;
    /** The type of monitor (http, port, ping) */
    type: MonitorType;
}

/**
 * Interface for default form data values.
 *
 * @public
 */
export interface DefaultFormData {
    /** Default values for HTTP monitors */
    readonly http: {
        checkInterval: number;
        enabled: true;
        expectedStatusCode: number;
        followRedirects: true;
        method: "GET";
        retryAttempts: number;
        timeout: number;
        type: "http";
        url: string;
    };
    /** Default values for ping monitors */
    readonly ping: {
        checkInterval: number;
        enabled: true;
        host: string;
        maxPacketLoss: number;
        packetCount: number;
        packetSize: number;
        retryAttempts: number;
        timeout: number;
        type: "ping";
    };
    /** Default values for port monitors */
    readonly port: {
        checkInterval: number;
        connectionTimeout: number;
        enabled: true;
        host: string;
        port: number;
        retryAttempts: number;
        timeout: number;
        type: "port";
    };
}

/**
 * Form data interface for HTTP monitors.
 *
 * @remarks
 * Used for monitors that check HTTP/HTTPS endpoints.
 *
 * @public
 */
export interface HttpFormData extends BaseFormData {
    /** Authentication credentials */
    auth?: {
        password: string;
        username: string;
    };
    /** Expected response body content (for validation) */
    expectedContent?: string;
    /** Expected HTTP status code (default: 200) */
    expectedStatusCode?: number;
    /** Whether to follow redirects */
    followRedirects?: boolean;
    /** Custom headers to send with the request */
    headers?: Record<string, string>;
    /** HTTP method to use for the request */
    method?: "DELETE" | "GET" | "HEAD" | "POST" | "PUT";
    type: "http";
    /** The URL to monitor */
    url: string;
}

/**
 * Monitor field validation interface.
 *
 * @remarks
 * Used for validating individual monitor fields based on monitor type.
 *
 * @public
 */
export interface MonitorFieldValidation {
    /** Field name */
    fieldName: string;
    /** Field type */
    fieldType: "boolean" | "host" | "number" | "port" | "string" | "url";
    /** Maximum value (for number fields) */
    max?: number;
    /** Minimum value (for number fields) */
    min?: number;
    /** Validation pattern (for string fields) */
    pattern?: RegExp;
    /** Whether the field is required */
    required: boolean;
    /** Custom validation function */
    validator?: (value: unknown) => null | string;
}

/**
 * Form data interface for ping monitors.
 *
 * @remarks
 * Used for monitors that check host reachability via ICMP ping.
 *
 * @public
 */
export interface PingFormData extends BaseFormData {
    /** The hostname or IP address to ping */
    host: string;
    /** Maximum allowed packet loss percentage */
    maxPacketLoss?: number;
    /** Number of ping packets to send */
    packetCount?: number;
    /** Size of ping packets in bytes */
    packetSize?: number;
    type: "ping";
}

/**
 * Form data interface for port monitors.
 *
 * @remarks
 * Used for monitors that check TCP port connectivity.
 *
 * @public
 */
export interface PortFormData extends BaseFormData {
    /** Connection timeout in milliseconds (separate from check timeout) */
    connectionTimeout?: number;
    /** The hostname or IP address to monitor */
    host: string;
    /** The port number to check */
    port: number;
    type: "port";
}

/**
 * Complete site form data including site information and monitor configuration.
 *
 * @remarks
 * Used when creating a new site with an initial monitor or adding a monitor to
 * an existing site.
 *
 * @public
 */
export interface SiteFormData {
    /** Unique identifier for the site */
    identifier: string;
    /** Monitor configuration for the site */
    monitor: MonitorFormData;
    /** The human-readable name for the site */
    name: string;
}

/**
 * Form mode enum for add site form.
 *
 * @remarks
 * Determines whether the form is creating a new site or adding to an existing
 * one.
 *
 * @public
 */
export type FormMode = "existing" | "new";

/**
 * Validation result interface for form validation.
 *
 * @remarks
 * Used to return validation results with success status and error details.
 * Import directly from "./validation" for FormValidationResult if needed.
 *
 * @public
 */

/**
 * Union type representing all possible monitor form data types.
 *
 * @remarks
 * Use this type when you need to handle form data for any monitor type.
 * TypeScript will ensure type safety through discriminated unions based on the
 * `type` field.
 *
 * @public
 */
export type MonitorFormData = HttpFormData | PingFormData | PortFormData;

/**
 * Type guard to check if form data is for HTTP monitors.
 *
 * @param formData - The form data to check
 *
 * @returns True if the form data is for an HTTP monitor
 *
 * @public
 */
export function isHttpFormData(
    formData: MonitorFormData
): formData is HttpFormData {
    if (formData === null || formData === undefined) {
        return false;
    }
    return formData && 
        typeof formData === 'object' && 
        formData.type === "http" &&
        typeof formData.checkInterval === 'number' &&
        typeof formData.retryAttempts === 'number' &&
        typeof formData.timeout === 'number' &&
        typeof formData.url === 'string';
}

/**
 * Type guard to check if form data is for ping monitors.
 *
 * @param formData - The form data to check
 *
 * @returns True if the form data is for a ping monitor
 *
 * @public
 */
export function isPingFormData(
    formData: MonitorFormData
): formData is PingFormData {
    if (formData === null || formData === undefined) {
        return false;
    }
    return formData && 
        typeof formData === 'object' && 
        formData.type === "ping" &&
        typeof formData.checkInterval === 'number' &&
        typeof formData.retryAttempts === 'number' &&
        typeof formData.timeout === 'number' &&
        typeof formData.host === 'string';
}

/**
 * Type guard to check if form data is for port monitors.
 *
 * @param formData - The form data to check
 *
 * @returns True if the form data is for a port monitor
 *
 * @public
 */
export function isPortFormData(
    formData: MonitorFormData
): formData is PortFormData {
    if (formData === null || formData === undefined) {
        return false;
    }
    return formData && 
        typeof formData === 'object' && 
        formData.type === "port" &&
        typeof formData.checkInterval === 'number' &&
        typeof formData.retryAttempts === 'number' &&
        typeof formData.timeout === 'number' &&
        typeof formData.host === 'string' &&
        typeof formData.port === 'number';
}

/**
 * Default form data values for different monitor types.
 *
 * @public
 */
export const DEFAULT_FORM_DATA: DefaultFormData = {
    /** Default values for HTTP monitors */
    http: {
        checkInterval: 300_000, // 5 minutes
        enabled: true,
        expectedStatusCode: 200,
        followRedirects: true,
        method: "GET" as const,
        retryAttempts: 3,
        timeout: 30_000, // 30 seconds
        type: "http" as const,
        url: "",
    } satisfies HttpFormData,

    /** Default values for ping monitors */
    ping: {
        checkInterval: 300_000, // 5 minutes
        enabled: true,
        host: "",
        maxPacketLoss: 0, // 0% packet loss
        packetCount: 4,
        packetSize: 32,
        retryAttempts: 3,
        timeout: 30_000, // 30 seconds
        type: "ping" as const,
    } satisfies PingFormData,

    /** Default values for port monitors */
    port: {
        checkInterval: 300_000, // 5 minutes
        connectionTimeout: 10_000, // 10 seconds
        enabled: true,
        host: "",
        port: 80,
        retryAttempts: 3,
        timeout: 30_000, // 30 seconds
        type: "port" as const,
    } satisfies PortFormData,
} as const;
