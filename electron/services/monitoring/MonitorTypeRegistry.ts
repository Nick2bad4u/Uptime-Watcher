/**
 * Extensible monitor type system for new monitoring capabilities.
 *
 * @remarks
 * This new architecture replaces hard-coded monitor types with a plugin-based
 * system that allows easy addition of new monitor types without code changes
 * in multiple files.
 */

import { z } from "zod";
import validator from "validator";
import { HttpMonitor } from "./HttpMonitor";
import { PortMonitor } from "./PortMonitor";
import { EnhancedTypeGuard } from "./EnhancedTypeGuards";
import { migrationRegistry, versionManager, createMigrationOrchestrator, exampleMigrations } from "./MigrationSystem";
import { logger } from "../../utils/logger";

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
        /** Function to format title suffix for history charts (e.g., " (https://example.com)") */
        formatTitleSuffix?: (monitor: Record<string, unknown>) => string;
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

// Shared validation schemas using Zod with enhanced validation
export const monitorSchemas = {
    http: z.object({
        url: z.string().refine((val) => {
            // Use validator.js for robust URL validation
            return validator.isURL(val, {
                protocols: ["http", "https"],
                require_protocol: true,
                require_host: true,
                require_tld: true,
                allow_underscores: false,
                allow_trailing_dot: false,
                allow_protocol_relative_urls: false,
                disallow_auth: false,
                validate_length: true,
            });
        }, "Must be a valid URL"),
        type: z.literal("http"),
    }),
    port: z.object({
        host: z.string().refine((val) => {
            // Use validator.js for robust host validation
            if (validator.isIP(val)) {
                return true;
            }
            if (
                validator.isFQDN(val, {
                    require_tld: true,
                    allow_underscores: false,
                    allow_trailing_dot: false,
                    allow_numeric_tld: false,
                    allow_wildcard: false,
                })
            ) {
                return true;
            }
            return val === "localhost";
        }, "Must be a valid hostname, IP address, or localhost"),
        port: z.number().refine((val) => {
            return validator.isPort(val.toString());
        }, "Must be a valid port number (1-65535)"),
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
        const validData = config.validationSchema.parse(data);
        return {
            success: true,
            errors: [],
            data: validData,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                errors: error.issues.map((err) => `${err.path.join(".")}: ${err.message}`),
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
        formatTitleSuffix: (monitor: Record<string, unknown>) => {
            const url = monitor.url as string;
            return url ? ` (${url})` : "";
        },
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
        formatTitleSuffix: (monitor: Record<string, unknown>) => {
            const host = monitor.host as string;
            const port = monitor.port as number;
            return host && port ? ` (${host}:${port})` : "";
        },
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

// Register example migrations for the migration system
migrationRegistry.registerMigration("http", exampleMigrations.httpV1_0_to_1_1);
migrationRegistry.registerMigration("port", exampleMigrations.portV1_0_to_1_1);

// Set current versions for existing monitor types
versionManager.setVersion("http", "1.0.0");
versionManager.setVersion("port", "1.0.0");

// Enhanced type guard for better runtime validation
export function createMonitorWithTypeGuards(
    type: string,
    data: Record<string, unknown>
): {
    success: boolean;
    monitor?: Record<string, unknown>;
    errors: string[];
} {
    // Use enhanced type guard validation
    const validationResult = EnhancedTypeGuard.validateMonitorType(type);
    if (!validationResult.success) {
        return {
            success: false,
            errors: [validationResult.error ?? "Invalid monitor type"],
        };
    }

    const validMonitorType = validationResult.value;

    // Create monitor object with proper validation
    const monitor: Record<string, unknown> = {
        type: validMonitorType,
        monitoring: true,
        status: "pending",
        responseTime: -1,
        retryAttempts: 3,
        timeout: 10_000,
        history: [],
        ...data,
    };

    return {
        success: true,
        monitor,
        errors: [],
    };
}

// Database migration helper - properly implemented with basic migration system
export async function migrateMonitorType(
    monitorType: MonitorType,
    fromVersion: string,
    toVersion: string,
    data?: Record<string, unknown>
): Promise<{
    success: boolean;
    appliedMigrations: string[];
    errors: string[];
    data?: Record<string, unknown>;
}> {
    try {
        // Validate the monitor type
        const validationResult = EnhancedTypeGuard.validateMonitorType(monitorType);
        if (!validationResult.success) {
            return {
                success: false,
                appliedMigrations: [],
                errors: [validationResult.error ?? "Invalid monitor type"],
            };
        }

        logger.info(`Migrating monitor type ${monitorType} from ${fromVersion} to ${toVersion}`);

        // Check if migration is needed
        if (fromVersion === toVersion) {
            return {
                success: true,
                appliedMigrations: [],
                errors: [],
                ...(data && { data }),
            };
        }

        // If no data provided, just return success for version bump
        if (!data) {
            return {
                success: true,
                appliedMigrations: [`${monitorType}_${fromVersion}_to_${toVersion}`],
                errors: [],
            };
        }

        // Use the migration orchestrator for data migration
        const migrationOrchestrator = createMigrationOrchestrator();

        const migrationResult = await migrationOrchestrator.migrateMonitorData(
            monitorType,
            data,
            fromVersion,
            toVersion
        );

        return {
            success: migrationResult.success,
            appliedMigrations: migrationResult.appliedMigrations,
            errors: migrationResult.errors,
            ...(migrationResult.data && { data: migrationResult.data }),
        };
    } catch (error) {
        logger.error("Migration error:", error);
        return {
            success: false,
            appliedMigrations: [],
            errors: [`Migration failed: ${error}`],
        };
    }
}

// Type guard for runtime validation
export function isValidMonitorTypeGuard(type: unknown): type is string {
    return typeof type === "string" && isValidMonitorType(type);
}

// Generate union type from registered monitor types
export type MonitorType = ReturnType<typeof getRegisteredMonitorTypes>[number];
