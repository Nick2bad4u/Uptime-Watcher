/**
 * Extensible monitor type system for new monitoring capabilities.
 *
 * @remarks
 * This new architecture replaces hard-coded monitor types with a plugin-based
 * system that allows easy addition of new monitor types without code changes
 * in multiple files.
 */

import { z } from "zod";
import { HttpMonitor } from "./HttpMonitor";
import { PortMonitor } from "./PortMonitor";

// Field definition for dynamic form generation
export interface MonitorFieldDefinition {
    /** Field name (matches monitor property) */
    name: string;
    /** Display label for the field */
    label: string;
    /** Input type for form rendering */
    type: "text" | "number" | "url";
    /** Whether field is required */
    required: boolean;
    /** Placeholder text */
    placeholder?: string;
    /** Help text for the field */
    helpText?: string;
    /** Min value for number fields */
    min?: number;
    /** Max value for number fields */
    max?: number;
}

// UI configuration for monitor type display
export interface MonitorUIConfig {
    /** Detail label formatter function name */
    detailLabelFormatter?: string;
    /** Chart data formatters */
    chartFormatters?: {
        responseTime?: boolean;
        uptime?: boolean;
        advanced?: boolean;
    };
    /** Help text for form fields */
    helpTexts?: {
        primary?: string;
        secondary?: string;
    };
    /** Display preferences */
    display?: {
        showUrl?: boolean;
        showPort?: boolean;
        showAdvancedMetrics?: boolean;
    };
}

// Base monitor type definition
export interface BaseMonitorConfig {
    /** Unique identifier for the monitor type */
    readonly type: string;
    /** Human-readable display name */
    readonly displayName: string;
    /** Description of what this monitor checks */
    readonly description: string;
    /** Version of the monitor implementation */
    readonly version: string;
    /** Field definitions for dynamic form generation */
    readonly fields: MonitorFieldDefinition[];
    /** Zod validation schema for this monitor type */
    readonly validationSchema: z.ZodSchema;
    /** Factory function to create monitor service instances */
    readonly serviceFactory: () => import("./types").IMonitorService;
    /** UI display configuration */
    readonly uiConfig?: {
        /** Function to format detail display in history (e.g., "Port: 80", "Response Code: 200") */
        formatDetail?: (details: string) => string;
        /** Whether this monitor type supports response time analytics */
        supportsResponseTime?: boolean;
        /** Whether this monitor type supports advanced analytics */
        supportsAdvancedAnalytics?: boolean;
        /** Help text for form fields */
        helpTexts?: {
            primary?: string;
            secondary?: string;
        };
        /** Display preferences */
        display?: {
            showUrl?: boolean;
            showAdvancedMetrics?: boolean;
        };
        /** Detail label formatter for different contexts */
        detailFormats?: {
            /** Format for history detail column */
            historyDetail?: (details: string) => string;
            /** Format for analytics display */
            analyticsLabel?: string;
        };
    };
}

// Shared validation schemas using Zod
export const monitorSchemas = {
    http: z.object({
        url: z.string().url("Must be a valid URL"),
        type: z.literal("http"),
    }),
    port: z.object({
        host: z.string().min(1, "Host is required"),
        port: z.number().min(1, "Port must be at least 1").max(65_535, "Port must be at most 65535"),
        type: z.literal("port"),
    }),
};

// Registry for monitor types
const monitorTypes = new Map<string, BaseMonitorConfig>();

/**
 * Register a new monitor type.
 *
 * @param config - Monitor type configuration
 */
export function registerMonitorType(config: BaseMonitorConfig): void {
    monitorTypes.set(config.type, config);
}

/**
 * Get all registered monitor types.
 *
 * @returns Array of registered monitor types
 */
export function getRegisteredMonitorTypes(): string[] {
    return [...monitorTypes.keys()];
}

/**
 * Get all registered monitor types with their configurations.
 *
 * @returns Array of monitor type configurations
 */
export function getAllMonitorTypeConfigs(): BaseMonitorConfig[] {
    return [...monitorTypes.values()];
}

/**
 * Check if a monitor type is registered.
 *
 * @param type - Monitor type to check
 * @returns True if type is registered
 */
export function isValidMonitorType(type: string): boolean {
    return monitorTypes.has(type);
}

/**
 * Get configuration for a monitor type.
 *
 * @param type - Monitor type
 * @returns Monitor configuration or undefined
 */
export function getMonitorTypeConfig(type: string): BaseMonitorConfig | undefined {
    return monitorTypes.get(type);
}

/**
 * Get service factory for a monitor type.
 *
 * @param type - Monitor type
 * @returns Service factory function or undefined
 */
export function getMonitorServiceFactory(type: string): (() => import("./types").IMonitorService) | undefined {
    const config = getMonitorTypeConfig(type);
    return config?.serviceFactory;
}

/**
 * Validate monitor data using Zod schemas.
 *
 * @param type - Monitor type
 * @param data - Monitor data to validate
 * @returns Validation result
 */
export function validateMonitorData(
    type: string,
    data: unknown
): {
    success: boolean;
    errors: string[];
    data?: unknown;
} {
    const config = getMonitorTypeConfig(type);
    if (!config) {
        return {
            success: false,
            errors: [`Unknown monitor type: ${type}`],
        };
    }

    try {
        const validData = config.validationSchema.parse(data) as unknown;
        return {
            success: true,
            errors: [],
            data: validData,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                errors: error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
            };
        }
        return {
            success: false,
            errors: ["Validation failed with unknown error"],
        };
    }
}

// Register existing monitor types with their field definitions and schemas
registerMonitorType({
    type: "http",
    displayName: "HTTP (Website/API)",
    description: "Monitors HTTP/HTTPS endpoints for availability and response time",
    version: "1.0.0",
    validationSchema: monitorSchemas.http,
    serviceFactory: () => new HttpMonitor(),
    fields: [
        {
            name: "url",
            label: "Website URL",
            type: "url",
            required: true,
            placeholder: "https://example.com",
            helpText: "Enter the full URL including http:// or https://",
        },
    ],
    uiConfig: {
        formatDetail: (details: string) => `Response Code: ${details}`,
        supportsResponseTime: true,
        supportsAdvancedAnalytics: true,
        helpTexts: {
            primary: "Enter the full URL including http:// or https://",
            secondary: "The monitor will check this URL according to your monitoring interval",
        },
        display: {
            showUrl: true,
            showAdvancedMetrics: true,
        },
        detailFormats: {
            historyDetail: (details: string) => `Response Code: ${details}`,
            analyticsLabel: "HTTP Response Time",
        },
    },
});

registerMonitorType({
    type: "port",
    displayName: "Port (Host/Port)",
    description: "Monitors TCP port connectivity",
    version: "1.0.0",
    validationSchema: monitorSchemas.port,
    serviceFactory: () => new PortMonitor(),
    fields: [
        {
            name: "host",
            label: "Host",
            type: "text",
            required: true,
            placeholder: "example.com or 192.168.1.1",
            helpText: "Enter a valid host (domain or IP)",
        },
        {
            name: "port",
            label: "Port",
            type: "number",
            required: true,
            placeholder: "80",
            helpText: "Enter a port number (1-65535)",
            min: 1,
            max: 65_535,
        },
    ],
    uiConfig: {
        formatDetail: (details: string) => `Port: ${details}`,
        supportsResponseTime: true,
        supportsAdvancedAnalytics: true,
        helpTexts: {
            primary: "Enter a valid host (domain or IP)",
            secondary: "Enter a port number (1-65535)",
        },
        display: {
            showUrl: false,
            showAdvancedMetrics: true,
        },
        detailFormats: {
            historyDetail: (details: string) => `Port: ${details}`,
            analyticsLabel: "Port Response Time",
        },
    },
});

// Type guard for runtime validation
export function isValidMonitorTypeGuard(type: unknown): type is string {
    return typeof type === "string" && isValidMonitorType(type);
}

// Generate union type from registered monitor types
export type MonitorType = "http" | "port";

// Helper to get the current monitor types as a union
export type RegisteredMonitorType = ReturnType<typeof getRegisteredMonitorTypes>[number];
