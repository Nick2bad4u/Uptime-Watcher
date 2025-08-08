/**
 * Extensible monitor type system for new monitoring capabilities.
 *
 * @remarks
 * This new architecture replaces hard-coded monitor types with a plugin-based
 * system that allows easy addition of new monitor types without code changes
 * in multiple files.
 */

import { z } from "zod";

import {
    type Monitor,
    MONITOR_STATUS,
    type MonitorFieldDefinition,
} from "../../../shared/types";
// Import shared validation schemas
import { withErrorHandling } from "../../../shared/utils/errorHandling";
import {
    monitorSchemas,
    validateMonitorData as sharedValidateMonitorData,
} from "../../../shared/validation/schemas";
import { logger } from "../../utils/logger";
import { HttpMonitor } from "./HttpMonitor";
import {
    createMigrationOrchestrator,
    exampleMigrations,
    migrationRegistry,
    versionManager,
} from "./MigrationSystem";
import { type MonitorType } from "./monitorTypes";
import { PingMonitor } from "./PingMonitor";
import { PortMonitor } from "./PortMonitor";

// Base monitor type definition
/**
 * Configuration contract for a monitor type in the monitoring system.
 *
 * @remarks
 * Each monitor type (e.g., HTTP, Port) must provide a configuration object
 * describing its metadata, validation schema, UI display options, and service factory.
 * This enables dynamic registration, validation, and UI rendering for new monitor types.
 *
 * @param description - Description of what this monitor checks.
 * @param displayName - Human-readable display name for UI.
 * @param fields - Field definitions for dynamic form generation.
 * @param serviceFactory - Factory function to create monitor service instances.
 * @param type - Unique identifier for the monitor type.
 * @param uiConfig - Optional UI display configuration for analytics, history, and help texts.
 * @param validationSchema - Zod validation schema for this monitor type.
 * @param version - Version of the monitor implementation.
 *
 * @public
 */
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
        formatTitleSuffix?: (monitor: Monitor) => string;
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

/**
 * Internal registry for all monitor types and their configurations.
 *
 * @remarks
 * Used by registry functions to store and retrieve monitor type definitions. Not exported.
 *
 * @internal
 */
const monitorTypes = new Map<string, BaseMonitorConfig>();

/**
 * Gets all registered monitor types with their configurations.
 *
 * @remarks
 * Returns an array of all monitor type configuration objects currently registered in the system.
 *
 * @returns Array of {@link BaseMonitorConfig} objects for all registered monitor types.
 * @public
 */
export function getAllMonitorTypeConfigs(): BaseMonitorConfig[] {
    return Array.from(monitorTypes.values());
}

/**
 * Gets the service factory function for a given monitor type.
 *
 * @remarks
 * Returns the factory function for creating monitor service instances for the specified type, or undefined if not registered.
 *
 * @param type - The monitor type identifier.
 * @returns Service factory function or undefined if the type is not registered.
 * @public
 */
export function getMonitorServiceFactory(
    type: string
): (() => import("./types").IMonitorService) | undefined {
    const config = getMonitorTypeConfig(type);
    return config?.serviceFactory;
}

/**
 * Gets the configuration object for a given monitor type.
 *
 * @remarks
 * Returns the {@link BaseMonitorConfig} for the specified type, or undefined if not registered.
 *
 * @param type - The monitor type identifier.
 * @returns Monitor configuration object or undefined if the type is not registered.
 * @public
 */
export function getMonitorTypeConfig(
    type: string
): BaseMonitorConfig | undefined {
    return monitorTypes.get(type);
}

/**
 * Gets all registered monitor type identifiers.
 *
 * @remarks
 * Returns an array of all monitor type string identifiers currently registered in the system.
 *
 * @returns Array of registered monitor type strings.
 * @public
 */
export function getRegisteredMonitorTypes(): string[] {
    return Array.from(monitorTypes.keys());
}

/**
 * Checks if a monitor type is registered in the system.
 *
 * @remarks
 * Returns true if the specified monitor type identifier is registered, false otherwise.
 *
 * @param type - The monitor type identifier to check.
 * @returns True if the type is registered, false otherwise.
 * @public
 */
export function isValidMonitorType(type: string): boolean {
    return monitorTypes.has(type);
}

/**
 * Registers a new monitor type with its configuration.
 *
 * @remarks
 * Adds the provided {@link BaseMonitorConfig} to the internal registry, making it available for use in the system.
 *
 * @param config - The monitor type configuration object to register.
 * @public
 */
export function registerMonitorType(config: BaseMonitorConfig): void {
    monitorTypes.set(config.type, config);
}

/**
 * Validates monitor data using shared Zod schemas for the specified monitor type.
 *
 * @remarks
 * Uses the shared validation logic to validate monitor data against the schema for the given type. Returns a structured result with errors, warnings, and metadata.
 *
 * @param type - The monitor type identifier.
 * @param data - The monitor data to validate.
 * @returns Validation result object with data, errors, warnings, metadata, and success flag.
 * @public
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
        metadata: result.metadata ?? {},
        success: result.success,
        warnings: result.warnings ?? [],
    };
}

/**
 * Simple monitor type validation for internal use.
 *
 * @remarks
 * Breaks circular dependency with EnhancedTypeGuards by providing basic validation. Used internally by registry functions that need type validation without importing external validation utilities.
 *
 * Validation logic:
 * - Checks if type is a string
 * - Verifies type is registered in the monitor registry
 * - Returns structured result compatible with type guard patterns
 *
 * @param type - The monitor type to validate.
 * @returns Validation result compatible with EnhancedTypeGuard interface.
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
    description:
        "Monitors HTTP/HTTPS endpoints for availability and response time",
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
        formatTitleSuffix: (monitor: Monitor) => {
            if (monitor.type === "http") {
                return monitor.url ? ` (${monitor.url})` : "";
            }
            return "";
        },
        helpTexts: {
            primary: "Enter the full URL including http:// or https://",
            secondary:
                "The monitor will check this URL according to your monitoring interval",
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
        formatTitleSuffix: (monitor: Monitor) => {
            if (monitor.type === "port") {
                return monitor.host && monitor.port
                    ? ` (${monitor.host}:${monitor.port})`
                    : "";
            }
            return "";
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

registerMonitorType({
    description: "Monitors network connectivity via ping",
    displayName: "Ping (Host)",
    fields: [
        {
            helpText: "Enter a valid host (domain or IP)",
            label: "Host",
            name: "host",
            placeholder: "example.com or 192.168.1.1",
            required: true,
            type: "text",
        },
    ],
    serviceFactory: () => new PingMonitor(),
    type: "ping",
    uiConfig: {
        detailFormats: {
            analyticsLabel: "Ping Response Time",
            historyDetail: (details: string) => `Ping: ${details}`,
        },
        display: {
            showAdvancedMetrics: true,
            showUrl: false,
        },
        formatDetail: (details: string) => `Ping: ${details}`,
        formatTitleSuffix: (monitor: Monitor) => {
            if (monitor.type === "ping") {
                return monitor.host ? ` (${monitor.host})` : "";
            }
            return "";
        },
        helpTexts: {
            primary: "Enter a valid host (domain or IP)",
            secondary:
                "The monitor will ping this host according to your monitoring interval",
        },
        supportsAdvancedAnalytics: true,
        supportsResponseTime: true,
    },
    validationSchema: monitorSchemas.ping,
    version: "1.0.0",
});

// Register example migrations for the migration system
migrationRegistry.registerMigration("http", exampleMigrations.httpV1_0_to_1_1);
migrationRegistry.registerMigration("port", exampleMigrations.portV1_0_to_1_1);

// Set current versions for existing monitor types
versionManager.setVersion("http", "1.0.0");
versionManager.setVersion("ping", "1.0.0");
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
    try {
        return await withErrorHandling(
            async () => {
                // Validate the monitor type using internal validation
                const validationResult =
                    validateMonitorTypeInternal(monitorType);
                if (!validationResult.success) {
                    return {
                        appliedMigrations: [],
                        errors: [
                            validationResult.error ?? "Invalid monitor type",
                        ],
                        success: false,
                    };
                }

                logger.info(
                    `Migrating monitor type ${monitorType} from ${fromVersion} to ${toVersion}`
                );

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
                        appliedMigrations: [
                            `${monitorType}_${fromVersion}_to_${toVersion}`,
                        ],
                        errors: [],
                        success: true,
                    };
                }

                // Use the migration orchestrator for data migration
                const migrationOrchestrator = createMigrationOrchestrator();

                const migrationResult =
                    await migrationOrchestrator.migrateMonitorData(
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
        );
    } catch (error) {
        return {
            appliedMigrations: [],
            errors: [
                `Migration failed: ${error instanceof Error ? error.message : String(error)}`,
            ],
            success: false,
        };
    }
}
