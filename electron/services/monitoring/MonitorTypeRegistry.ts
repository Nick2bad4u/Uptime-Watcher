/**
 * Extensible monitor type system for new monitoring capabilities.
 *
 * @remarks
 * This new architecture replaces hard-coded monitor types with a plugin-based
 * system that allows easy addition of new monitor types without code changes
 * in multiple files.
 */

import validator from "validator";
import { z } from "zod";

import type { MonitorFieldDefinition } from "../../../shared/types";
import type { MonitorType } from "./monitorTypes";

import { logger } from "../../utils/logger";
import { HttpMonitor } from "./HttpMonitor";
import { createMigrationOrchestrator, exampleMigrations, migrationRegistry, versionManager } from "./MigrationSystem";
import { PortMonitor } from "./PortMonitor";

// Base monitor type definition
export interface BaseMonitorConfig {
    /** Description of what this monitor checks */
    readonly description: string;
    /** Human-readable display name */
    readonly displayName: string;
    /** Field definitions for dynamic form generation */
    readonly fields: MonitorFieldDefinition[];
    /** Factory function to create monitor service instances */
    readonly serviceFactory: () => import("./types").IMonitorService;
    /** Unique identifier for the monitor type */
    readonly type: string;
    /** UI display configuration */
    readonly uiConfig?: {
        /** Detail label formatter for different contexts */
        detailFormats?: {
            /** Format for analytics display */
            analyticsLabel?: string;
            /** Format for history detail column */
            historyDetail?: (details: string) => string;
        };
        /** Display preferences */
        display?: {
            showAdvancedMetrics?: boolean;
            showUrl?: boolean;
        };
        /** Function to format detail display in history (e.g., "Port: 80", "Response Code: 200") */
        formatDetail?: (details: string) => string;
        /** Function to format title suffix for history charts (e.g., " (https://example.com)") */
        formatTitleSuffix?: (monitor: Record<string, unknown>) => string;
        /** Help text for form fields */
        helpTexts?: {
            primary?: string;
            secondary?: string;
        };
        /** Whether this monitor type supports advanced analytics */
        supportsAdvancedAnalytics?: boolean;
        /** Whether this monitor type supports response time analytics */
        supportsResponseTime?: boolean;
    };
    /** Zod validation schema for this monitor type */
    readonly validationSchema: z.ZodType;
    /** Version of the monitor implementation */
    readonly version: string;
}

// UI configuration for monitor type display
export interface MonitorUIConfig {
    /** Chart data formatters */
    chartFormatters?: {
        advanced?: boolean;
        responseTime?: boolean;
        uptime?: boolean;
    };
    /** Detail label formatter function name */
    detailLabelFormatter?: string;
    /** Display preferences */
    display?: {
        showAdvancedMetrics?: boolean;
        showPort?: boolean;
        showUrl?: boolean;
    };
    /** Help text for form fields */
    helpTexts?: {
        primary?: string;
        secondary?: string;
    };
}

// Shared validation schemas using Zod with enhanced validation
export const monitorSchemas = {
    http: z.object({
        type: z.literal("http"),
        url: z.string().refine((val) => {
            // Use validator.js for robust URL validation
            return validator.isURL(val, {
                allow_protocol_relative_urls: false,
                allow_trailing_dot: false,
                allow_underscores: false,
                disallow_auth: false,
                protocols: ["http", "https"],
                require_host: true,
                require_protocol: true,
                require_tld: true,
                validate_length: true,
            });
        }, "Must be a valid URL"),
    }),
    port: z.object({
        host: z.string().refine((val) => {
            // Use validator.js for robust host validation
            if (validator.isIP(val)) {
                return true;
            }
            if (
                validator.isFQDN(val, {
                    allow_numeric_tld: false,
                    allow_trailing_dot: false,
                    allow_underscores: false,
                    allow_wildcard: false,
                    require_tld: true,
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
 * Get all registered monitor types with their configurations.
 *
 * @returns Array of monitor type configurations
 */
export function getAllMonitorTypeConfigs(): BaseMonitorConfig[] {
    return [...monitorTypes.values()];
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
 * Get configuration for a monitor type.
 *
 * @param type - Monitor type
 * @returns Monitor configuration or undefined
 */
export function getMonitorTypeConfig(type: string): BaseMonitorConfig | undefined {
    return monitorTypes.get(type);
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
 * Check if a monitor type is registered.
 *
 * @param type - Monitor type to check
 * @returns True if type is registered
 */
export function isValidMonitorType(type: string): boolean {
    return monitorTypes.has(type);
}

/**
 * Register a new monitor type.
 *
 * @param config - Monitor type configuration
 */
export function registerMonitorType(config: BaseMonitorConfig): void {
    monitorTypes.set(config.type, config);
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
    data?: unknown;
    errors: string[];
    metadata: Record<string, unknown>;
    success: boolean;
    warnings: string[];
} {
    const config = getMonitorTypeConfig(type);
    if (!config) {
        return {
            errors: [`Unknown monitor type: ${type}`],
            metadata: { monitorType: type },
            success: false,
            warnings: [],
        };
    }

    try {
        const validData = config.validationSchema.parse(data);
        return {
            data: validData,
            errors: [],
            metadata: {
                monitorType: type,
                validatedDataSize: JSON.stringify(validData).length,
            },
            success: true,
            warnings: [],
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Extract warnings from non-critical Zod issues
            const errors: string[] = [];
            const warnings: string[] = [];

            for (const issue of error.issues) {
                // Consider optional fields with format issues as warnings rather than errors
                if (issue.code === "invalid_type" && issue.message.includes("optional")) {
                    warnings.push(`${issue.path.join(".")}: ${issue.message}`);
                } else {
                    errors.push(`${issue.path.join(".")}: ${issue.message}`);
                }
            }

            return {
                errors,
                metadata: {
                    issueCount: error.issues.length,
                    monitorType: type,
                },
                success: errors.length === 0,
                warnings,
            };
        }
        return {
            errors: ["Validation failed with unknown error"],
            metadata: { errorType: "unknown" },
            success: false,
            warnings: [],
        };
    }
}

/**
 * Simple monitor type validation for internal use (breaks circular dependency with EnhancedTypeGuards).
 *
 * @param type - Monitor type to validate
 * @returns Validation result compatible with EnhancedTypeGuard interface
 */
function validateMonitorTypeInternal(type: unknown): {
    error?: string;
    success: boolean;
    value?: MonitorType;
} {
    if (typeof type !== "string") {
        return {
            error: "Monitor type must be a string",
            success: false,
        };
    }

    if (!isValidMonitorType(type)) {
        const validTypes = getRegisteredMonitorTypes();
        return {
            error: `Invalid monitor type: ${type}. Valid types: ${validTypes.join(", ")}`,
            success: false,
        };
    }

    return {
        success: true,
        value: type as MonitorType,
    };
}

// Register existing monitor types with their field definitions and schemas
registerMonitorType({
    description: "Monitors HTTP/HTTPS endpoints for availability and response time",
    displayName: "HTTP (Website/API)",
    fields: [
        {
            helpText: "Enter the full URL including http:// or https://",
            label: "Website URL",
            name: "url",
            placeholder: "https://example.com",
            required: true,
            type: "url",
        },
    ],
    serviceFactory: () => new HttpMonitor(),
    type: "http",
    uiConfig: {
        detailFormats: {
            analyticsLabel: "HTTP Response Time",
            historyDetail: (details: string) => `Response Code: ${details}`,
        },
        display: {
            showAdvancedMetrics: true,
            showUrl: true,
        },
        formatDetail: (details: string) => `Response Code: ${details}`,
        formatTitleSuffix: (monitor: Record<string, unknown>) => {
            const url = monitor.url as string;
            return url ? ` (${url})` : "";
        },
        helpTexts: {
            primary: "Enter the full URL including http:// or https://",
            secondary: "The monitor will check this URL according to your monitoring interval",
        },
        supportsAdvancedAnalytics: true,
        supportsResponseTime: true,
    },
    validationSchema: monitorSchemas.http,
    version: "1.0.0",
});

registerMonitorType({
    description: "Monitors TCP port connectivity",
    displayName: "Port (Host/Port)",
    fields: [
        {
            helpText: "Enter a valid host (domain or IP)",
            label: "Host",
            name: "host",
            placeholder: "example.com or 192.168.1.1",
            required: true,
            type: "text",
        },
        {
            helpText: "Enter a port number (1-65535)",
            label: "Port",
            max: 65_535,
            min: 1,
            name: "port",
            placeholder: "80",
            required: true,
            type: "number",
        },
    ],
    serviceFactory: () => new PortMonitor(),
    type: "port",
    uiConfig: {
        detailFormats: {
            analyticsLabel: "Port Response Time",
            historyDetail: (details: string) => `Port: ${details}`,
        },
        display: {
            showAdvancedMetrics: true,
            showUrl: false,
        },
        formatDetail: (details: string) => `Port: ${details}`,
        formatTitleSuffix: (monitor: Record<string, unknown>) => {
            const host = monitor.host as string;
            const port = monitor.port as number;
            return host && port ? ` (${host}:${port})` : "";
        },
        helpTexts: {
            primary: "Enter a valid host (domain or IP)",
            secondary: "Enter a port number (1-65535)",
        },
        supportsAdvancedAnalytics: true,
        supportsResponseTime: true,
    },
    validationSchema: monitorSchemas.port,
    version: "1.0.0",
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
    errors: string[];
    monitor?: Record<string, unknown>;
    success: boolean;
} {
    // Use internal type validation to avoid circular dependency
    const validationResult = validateMonitorTypeInternal(type);
    if (!validationResult.success) {
        return {
            errors: [validationResult.error ?? "Invalid monitor type"],
            success: false,
        };
    }

    const validMonitorType = validationResult.value;

    // Create monitor object with proper validation
    const monitor: Record<string, unknown> = {
        history: [],
        monitoring: true,
        responseTime: -1,
        retryAttempts: 3,
        status: "pending",
        timeout: 10_000,
        type: validMonitorType,
        ...data,
    };

    return {
        errors: [],
        monitor,
        success: true,
    };
}

// Type guard for runtime validation
export function isValidMonitorTypeGuard(type: unknown): type is string {
    return typeof type === "string" && isValidMonitorType(type);
}

// Database migration helper - properly implemented with basic migration system
export async function migrateMonitorType(
    monitorType: MonitorType,
    fromVersion: string,
    toVersion: string,
    data?: Record<string, unknown>
): Promise<{
    appliedMigrations: string[];
    data?: Record<string, unknown>;
    errors: string[];
    success: boolean;
}> {
    try {
        // Validate the monitor type using internal validation
        const validationResult = validateMonitorTypeInternal(monitorType);
        if (!validationResult.success) {
            return {
                appliedMigrations: [],
                errors: [validationResult.error ?? "Invalid monitor type"],
                success: false,
            };
        }

        logger.info(`Migrating monitor type ${monitorType} from ${fromVersion} to ${toVersion}`);

        // Check if migration is needed
        if (fromVersion === toVersion) {
            return {
                appliedMigrations: [],
                errors: [],
                success: true,
                ...(data && { data }),
            };
        }

        // If no data provided, just return success for version bump
        if (!data) {
            return {
                appliedMigrations: [`${monitorType}_${fromVersion}_to_${toVersion}`],
                errors: [],
                success: true,
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
            appliedMigrations: migrationResult.appliedMigrations,
            errors: migrationResult.errors,
            success: migrationResult.success,
            ...(migrationResult.data && { data: migrationResult.data }),
        };
    } catch (error) {
        logger.error("Migration error:", error);
        return {
            appliedMigrations: [],
            errors: [`Migration failed: ${error}`],
            success: false,
        };
    }
}
