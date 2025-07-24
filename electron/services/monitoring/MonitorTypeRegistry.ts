/**
 * Extensible monitor type system for new monitoring capabilities.
 *
 * @remarks
 * This new architecture replaces hard-coded monitor types with a plugin-based
 * system that allows easy addition of new monitor types without code changes
 * in multiple files.
 */

import { z } from "zod";

import type { MonitorType } from "./monitorTypes";

import { MONITOR_STATUS, type MonitorFieldDefinition } from "../../../shared/types";
// Import shared validation schemas
import { withErrorHandling } from "../../../shared/utils/errorHandling";
import { monitorSchemas, validateMonitorData as sharedValidateMonitorData } from "../../../shared/validation/schemas";
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
 * Validate monitor data using shared Zod schemas.
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
    // Use shared validation logic
    const result = sharedValidateMonitorData(type, data);

    return {
        data: result.data,
        errors: result.errors,
        metadata: result.metadata,
        success: result.success,
        warnings: result.warnings,
    };
}

/**
 * Simple monitor type validation for internal use.
 *
 * @param type - Monitor type to validate
 * @returns Validation result compatible with EnhancedTypeGuard interface
 *
 * @remarks
 * Breaks circular dependency with EnhancedTypeGuards by providing basic validation.
 * Used internally by registry functions that need type validation without
 * importing external validation utilities.
 *
 * Validation logic:
 * - Checks if type is a string
 * - Verifies type is registered in the monitor registry
 * - Returns structured result compatible with type guard patterns
 *
 * @internal
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

/**
 * Create monitor object with runtime type validation.
 *
 * @param type - Monitor type string to validate
 * @param data - Monitor data to merge with defaults
 * @returns Validation result with created monitor or errors
 *
 * @remarks
 * Provides runtime type safety by validating monitor type and creating
 * properly structured monitor objects with sensible defaults.
 *
 * Process:
 * 1. Validates monitor type using internal validation
 * 2. Creates monitor object with default values
 * 3. Merges provided data with defaults
 * 4. Returns structured result for error handling
 *
 * @example
 * ```typescript
 * const result = createMonitorWithTypeGuards("http", { url: "https://example.com" });
 * if (result.success) {
 *   console.log("Created monitor:", result.monitor);
 * } else {
 *   console.error("Validation errors:", result.errors);
 * }
 * ```
 */
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
        status: MONITOR_STATUS.PENDING,
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

/**
 * Migrate monitor data between versions with comprehensive error handling.
 *
 * @param monitorType - Type of monitor to migrate
 * @param fromVersion - Source version of the data
 * @param toVersion - Target version for migration
 * @param data - Optional monitor data to migrate
 * @returns Migration result with transformed data or errors
 *
 * @remarks
 * Provides version migration support for monitor configurations using
 * the migration system. Handles both data transformations and version updates.
 *
 * Migration process:
 * 1. Validates monitor type using internal validation
 * 2. Checks if migration is needed (version comparison)
 * 3. Uses migration orchestrator for data transformation
 * 4. Returns structured result with applied migrations
 *
 * Error handling:
 * - Invalid monitor types return validation errors
 * - Missing migration paths return migration errors
 * - Transform failures include original error details
 * - All errors are logged for debugging
 *
 * @example
 * ```typescript
 * const result = await migrateMonitorType("http", "1.0.0", "1.1.0", monitorData);
 * if (result.success) {
 *   console.log("Applied migrations:", result.appliedMigrations);
 *   return result.data;
 * } else {
 *   console.error("Migration failed:", result.errors);
 * }
 * ```
 */
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
    return withErrorHandling(
        async () => {
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
        },
        { logger, operationName: "Monitor migration" }
    ).catch((error) => ({
        appliedMigrations: [],
        errors: [`Migration failed: ${error instanceof Error ? error.message : String(error)}`],
        success: false,
    }));
}
