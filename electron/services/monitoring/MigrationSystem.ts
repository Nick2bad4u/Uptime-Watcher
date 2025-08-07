/**
 * Migration system for monitor types.
 *
 * @remarks
 * Provides a registry, orchestrator, and version manager for monitor configuration migrations. All migrations are registered per monitor type and applied in sequence. Designed for extensibility, maintainability, and robust error handling.
 *
 * @public
 */

import { interpolateLogTemplate, LOG_TEMPLATES } from "../../../shared/utils/logTemplates";
import { logger } from "../../utils/logger";
import { MAX_LOG_DATA_LENGTH, MAX_MIGRATION_STEPS } from "./constants";

/**
 * Describes a migration rule for a monitor type.
 *
 * @remarks
 * Each migration rule transforms monitor configuration data from one version to another. Used by the migration system to upgrade or modify monitor configuration schemas.
 *
 * @example
 * ```typescript
 * {
 *   description: "Add timeout field",
 *   fromVersion: "1.0.0",
 *   toVersion: "1.1.0",
 *   isBreaking: false,
 *   transform: async (data) => ({ ...data, timeout: 30000 })
 * }
 * ```
 *
 * @public
 */
export interface MigrationRule {
    /**
     * Human-readable description of the migration.
     *
     * @remarks
     * Used for logging and diagnostics.
     */
    description: string;
    /**
     * Source version for the migration.
     *
     * @remarks
     * The version string this migration starts from (e.g., "1.0.0").
     */
    fromVersion: string;
    /**
     * Indicates if the migration is breaking.
     *
     * @remarks
     * If true, migration may require user intervention or data review.
     */
    isBreaking: boolean;
    /**
     * Target version for the migration.
     *
     * @remarks
     * The version string this migration upgrades to (e.g., "1.1.0").
     */
    toVersion: string;
    /**
     * Transformation function to migrate data.
     *
     * @remarks
     * Receives the monitor configuration data and returns a Promise resolving to the transformed data. May throw if transformation fails or data is invalid.
     *
     * @param data - The monitor configuration data to transform.
     * @returns A promise resolving to the transformed data.
     * @throws Throws if transformation fails or data is invalid.
     */
    transform: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
}

/**
 * Tracks version information for a monitor type.
 *
 * @remarks
 * Used by {@link VersionManager} to record migration state and applied versions for each monitor type.
 *
 * @public
 */
export interface VersionInfo {
    /**
     * Indicates if the version has been applied.
     *
     * @remarks
     * True if the migration to this version has been completed.
     */
    applied: boolean;
    /**
     * Timestamp when the version was set.
     *
     * @remarks
     * Milliseconds since epoch.
     */
    timestamp: number;
    /**
     * The version string.
     *
     * @remarks
     * Semantic version string (e.g., "1.1.0").
     */
    version: string;
}

/**
 * Orchestrates migration of monitor configuration data for a given monitor type.
 *
 * @remarks
 * Applies registered migration rules in sequence to upgrade monitor data. Handles errors, warnings, and version updates. Used internally by the migration system and exposed via factory.
 *
 * @public
 */
class MigrationOrchestrator {
    /**
     * Constructs a new {@link MigrationOrchestrator}.
     *
     * @param registry - The migration registry instance.
     * @param versionManager - The version manager instance.
     */
    constructor(
        private readonly registry: MigrationRegistry,
        private readonly versionManager: VersionManager
    ) {}

    /**
     * Migrates monitor configuration data from one version to another.
     *
     * @remarks
     * Applies all necessary migrations in order. Updates version state if successful. Returns a summary object with migration results, errors, and warnings. Throws only if orchestration fails unexpectedly (e.g., registry or version manager error).
     *
     * @param monitorType - The monitor type (e.g., "http", "port").
     * @param data - The monitor configuration data to migrate.
     * @param fromVersion - The current version of the data.
     * @param toVersion - The target version to migrate to.
     * @returns An object containing applied migrations, migrated data, errors, success flag, and warnings.
     * @throws Throws if migration orchestration fails unexpectedly.
     *
     * @example
     * ```typescript
     * const result = await orchestrator.migrateMonitorData("http", config, "1.0.0", "1.1.0");
     * ```
     */
    async migrateMonitorData(
        monitorType: string,
        data: Record<string, unknown>,
        fromVersion: string,
        toVersion: string
    ): Promise<{
        appliedMigrations: string[];
        data?: Record<string, unknown>;
        errors: string[];
        success: boolean;
        warnings: string[];
    }> {
        const errors: string[] = [];
        const warnings: string[] = [];
        const appliedMigrations: string[] = [];

        try {
            // Check if migration is needed
            if (fromVersion === toVersion) {
                return {
                    appliedMigrations: [],
                    data,
                    errors: [],
                    success: true,
                    warnings: [],
                };
            }

            // Get migration path
            const migrationPath = this.registry.getMigrationPath(monitorType, fromVersion, toVersion);

            // Apply migrations in sequence
            let currentData = data;

            for (const migration of migrationPath) {
                try {
                    logger.info(
                        interpolateLogTemplate(LOG_TEMPLATES.services.MIGRATION_APPLYING, {
                            fromVersion: migration.fromVersion,
                            monitorType,
                            toVersion: migration.toVersion,
                        })
                    );

                    currentData = await migration.transform(currentData);
                    appliedMigrations.push(`${migration.fromVersion}_to_${migration.toVersion}`);

                    if (migration.isBreaking) {
                        warnings.push(`Applied breaking migration: ${migration.description}`);
                    }
                } catch (error) {
                    // Preserve error context for better debugging
                    const errorDetails = error instanceof Error ? error.message : String(error);
                    const errorMessage = `Migration failed: ${migration.description}`;

                    errors.push(`${errorMessage} - ${errorDetails}`);
                    logger.error(errorMessage, {
                        currentData: JSON.stringify(currentData).slice(0, MAX_LOG_DATA_LENGTH), // Truncate for logging
                        error,
                        migration: {
                            description: migration.description,
                            fromVersion: migration.fromVersion,
                            isBreaking: migration.isBreaking,
                            toVersion: migration.toVersion,
                        },
                        monitorType,
                    });
                    break;
                }
            }

            // Update version only if migrations were actually applied
            if (errors.length === 0 && appliedMigrations.length > 0) {
                this.versionManager.setVersion(monitorType, toVersion);
            }

            return {
                appliedMigrations,
                data: currentData,
                errors,
                success: errors.length === 0,
                warnings,
            };
        } catch (error) {
            const errorMessage = `Migration orchestration failed: ${error}`;
            errors.push(errorMessage);
            logger.error(errorMessage, error);

            return {
                appliedMigrations,
                data,
                errors,
                success: false,
                warnings,
            };
        }
    }
}

/**
 * Registry for migration rules per monitor type.
 *
 * @remarks
 * Stores and retrieves migration rules, calculates migration paths, and validates migration feasibility. Used by orchestrators and migration utilities.
 *
 * @public
 */
class MigrationRegistry {
    private readonly migrations = new Map<string, MigrationRule[]>();

    /**
     * Determines if migration is possible between two versions for a monitor type.
     *
     * @remarks
     * Returns true if a valid migration path exists, false otherwise. Does not mutate state.
     *
     * @param monitorType - The monitor type.
     * @param fromVersion - The source version.
     * @param toVersion - The target version.
     * @returns True if migration is possible, false otherwise.
     */
    canMigrate(monitorType: string, fromVersion: string, toVersion: string): boolean {
        try {
            this.getMigrationPath(monitorType, fromVersion, toVersion);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Calculates the migration path (sequence of rules) from one version to another.
     *
     * @remarks
     * Throws if no valid path exists, a circular path is detected, or the path exceeds the maximum steps limit.
     * Used internally by orchestrators and for migration feasibility checks.
     *
     * Algorithm ensures no infinite loops by checking for visited versions before adding them to the path.
     * The maximum path length prevents excessive migration chains that could indicate design issues.
     *
     * @param monitorType - The monitor type.
     * @param fromVersion - The source version.
     * @param toVersion - The target version.
     * @returns Array of migration rules to apply in order.
     * @throws {@link Error} If no migration path exists, circular path detected, or path exceeds maximum steps.
     */
    getMigrationPath(monitorType: string, fromVersion: string, toVersion: string): MigrationRule[] {
        // Validate version strings
        this.validateVersionString(fromVersion, "fromVersion");
        this.validateVersionString(toVersion, "toVersion");

        const rules = this.migrations.get(monitorType) ?? [];
        const path: MigrationRule[] = [];
        const visitedVersions = new Set<string>();
        const maxMigrationSteps = MAX_MIGRATION_STEPS; // Use configurable constant

        let currentVersion = fromVersion;

        while (currentVersion !== toVersion) {
            // Check for circular paths BEFORE adding to visited set
            if (visitedVersions.has(currentVersion)) {
                throw new Error(
                    `Circular migration path detected for ${monitorType} at version ${currentVersion}. ` +
                        `Visited versions: ${Array.from(visitedVersions).join(" -> ")}`
                );
            }

            // Find next migration rule
            const nextRule = rules.find((rule) => rule.fromVersion === currentVersion);

            if (!nextRule) {
                const availableFromVersions = rules.map((r) => r.fromVersion).join(", ");
                throw new Error(
                    `No migration path from ${currentVersion} to ${toVersion} for ${monitorType}. ` +
                        `Available migration starting points: [${availableFromVersions}]`
                );
            }

            // Add to visited AFTER confirming we have a valid next step
            visitedVersions.add(currentVersion);

            // Additional safeguard: limit the number of migration steps
            if (path.length >= maxMigrationSteps) {
                throw new Error(
                    `Migration path too long for ${monitorType}: ${path.length} steps exceeded maximum of ${maxMigrationSteps}. ` +
                        `This may indicate a circular dependency or design issue.`
                );
            }

            path.push(nextRule);
            currentVersion = nextRule.toVersion;
        }

        return path;
    }

    /**
     * Registers a migration rule for a monitor type.
     *
     * @remarks
     * Rules are sorted by source version after registration. Throws if migration rules cannot be created for the monitor type.
     *
     * @param monitorType - The monitor type.
     * @param rule - The migration rule to register.
     * @throws Throws if migration rules cannot be created for the monitor type.
     */
    registerMigration(monitorType: string, rule: MigrationRule): void {
        if (!this.migrations.has(monitorType)) {
            this.migrations.set(monitorType, []);
        }

        const rules = this.migrations.get(monitorType);
        if (!rules) {
            throw new Error(`Failed to create migration rules for ${monitorType}`);
        }

        rules.push(rule);

        // Sort by version
        rules.sort((a, b) => this.compareVersions(a.fromVersion, b.fromVersion));

        logger.info(
            interpolateLogTemplate(LOG_TEMPLATES.services.MIGRATION_REGISTERED, {
                fromVersion: rule.fromVersion,
                monitorType,
                toVersion: rule.toVersion,
            })
        );
    }

    /**
     * Compares two semantic version strings.
     *
     * @remarks
     * Used for sorting migration rules and determining migration order.
     * Now includes validation to prevent NaN comparisons from malformed versions.
     *
     * @param a - First version string.
     * @param b - Second version string.
     * @returns -1 if a \< b, 1 if a \> b, 0 if equal.
     * @throws {@link Error} If either version string is malformed.
     * @internal
     */
    private compareVersions(a: string, b: string): number {
        // Validate both version strings before comparison
        this.validateVersionString(a, "version a");
        this.validateVersionString(b, "version b");

        const versionA = a.split(".").map(Number);
        const versionB = b.split(".").map(Number);

        for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
            const partA = versionA[i] ?? 0;

            const partB = versionB[i] ?? 0;

            if (partA < partB) return -1;
            if (partA > partB) return 1;
        }

        return 0;
    }

    /**
     * Validates a version string format to ensure safe processing.
     *
     * @remarks
     * Ensures version strings follow semantic versioning pattern and contain only valid characters.
     * Prevents injection attacks and ensures consistent version comparison behavior.
     *
     * @param version - The version string to validate.
     * @param parameterName - The parameter name for error reporting.
     * @throws {@link Error} If the version string format is invalid.
     * @internal
     */
    private validateVersionString(version: string, parameterName: string): void {
        if (!version || typeof version !== "string") {
            throw new Error(`${parameterName} must be a non-empty string, got: ${typeof version}`);
        }

        // Basic semantic version validation: x.y.z where x, y, z are non-negative integers
        // eslint-disable-next-line security/detect-unsafe-regex, regexp/require-unicode-sets-regexp -- Simple semver pattern, safe for our use case
        const versionPattern = /^\d+\.\d+\.\d+(?:-[\da-z\-]+)?(?:\+[\da-z\-]+)?$/i;
        if (!versionPattern.test(version)) {
            throw new Error(
                `${parameterName} "${version}" is not a valid semantic version. Expected format: x.y.z (e.g., "1.0.0")`
            );
        }

        // Additional validation: ensure numeric parts are reasonable (prevent overflow)
        const parts = version.split(".").slice(0, 3).map(Number);
        for (const part of parts) {
            if (part < 0 || part > Number.MAX_SAFE_INTEGER) {
                throw new Error(`${parameterName} "${version}" contains invalid numeric parts`);
            }
        }
    }
}

/**
 * Manages version state for monitor types.
 *
 * @remarks
 * Tracks applied versions and timestamps for each monitor type. Used by orchestrators and migration utilities to record and query migration state.
 *
 * @public
 */
class VersionManager {
    private readonly versions = new Map<string, VersionInfo>();

    /**
     * Retrieves all version info for all monitor types.
     *
     * @returns Map of monitor type to version info. Keys are monitor type strings, values are {@link VersionInfo} objects.
     */
    getAllVersions(): Map<string, VersionInfo> {
        return new Map(this.versions);
    }

    /**
     * Gets the current version for a monitor type.
     *
     * @param monitorType - The monitor type.
     * @returns The version string, or undefined if not set for this monitor type.
     */
    getVersion(monitorType: string): string | undefined {
        return this.versions.get(monitorType)?.version;
    }

    /**
     * Checks if a specific version is applied for a monitor type.
     *
     * @param monitorType - The monitor type.
     * @param version - The version string to check.
     * @returns True if the version is applied, false otherwise.
     */
    isVersionApplied(monitorType: string, version: string): boolean {
        const info = this.versions.get(monitorType);
        return info?.version === version && info.applied;
    }

    /**
     * Sets the version for a monitor type.
     *
     * @param monitorType - The monitor type.
     * @param version - The version string to set.
     * @remarks
     * Updates the version info and timestamp for the given monitor type.
     */
    setVersion(monitorType: string, version: string): void {
        this.versions.set(monitorType, {
            applied: true,
            timestamp: Date.now(),
            version,
        });
    }
}

/**
 * Singleton registry for monitor type migrations.
 *
 * @remarks
 * Use to register and retrieve migration rules for all monitor types. Shared across the application.
 *
 * @example
 * ```typescript
 * migrationRegistry.registerMigration("http", {
 *   fromVersion: "1.0.0",
 *   toVersion: "1.1.0",
 *   description: "Add timeout field",
 *   isBreaking: false,
 *   transform: async (data) => ({ ...data, timeout: 30000 })
 * });
 * ```
 *
 * @public
 */
export const migrationRegistry: MigrationRegistry = new MigrationRegistry();

/**
 * Singleton manager for monitor type version tracking.
 *
 * @remarks
 * Use to query and update migration state for all monitor types. Shared across the application.
 *
 * @public
 */
export const versionManager: VersionManager = new VersionManager();

/**
 * Factory for creating migration orchestrator instances.
 *
 * @remarks
 * Use for isolated migration workflows or testing. Returns a new {@link MigrationOrchestrator} instance using the shared registry and version manager.
 *
 * @returns A new {@link MigrationOrchestrator} instance.
 *
 * @example
 * ```typescript
 * const orchestrator = createMigrationOrchestrator();
 * ```
 *
 * @public
 */
export function createMigrationOrchestrator(): MigrationOrchestrator {
    return new MigrationOrchestrator(migrationRegistry, versionManager);
}

/**
 * Example migration definitions for reference and testing.
 *
 * @remarks
 * Provides templates for common migration scenarios. These are not registered by default; register as needed for tests or new monitor types.
 *
 * @example
 * ```typescript
 * migrationRegistry.registerMigration("http", exampleMigrations.httpV1_0_to_1_1);
 * migrationRegistry.registerMigration("port", exampleMigrations.portV1_0_to_1_1);
 * ```
 *
 * @public
 */
export const exampleMigrations = {
    /**
     * HTTP monitor migration: Adds a timeout field with default value.
     *
     * @remarks
     * Non-breaking migration. Adds `timeout` field if missing.
     *
     * @param data - The monitor configuration data.
     * @returns Promise resolving to data with `timeout` field set.
     * @defaultValue timeout = 30000
     * @example
     * ```typescript
     * const migrated = await exampleMigrations.httpV1_0_to_1_1.transform({ url: "https://..." });
     * ```
     */
    httpV1_0_to_1_1: {
        description: "Add timeout field with default 30s",
        fromVersion: "1.0.0",
        isBreaking: false,
        toVersion: "1.1.0",
        transform: (data: Record<string, unknown>) =>
            Promise.resolve({
                ...data,
                timeout: (data["timeout"] as number | undefined) ?? 30_000, // Default 30 seconds
            }),
    } as MigrationRule,

    /**
     * Port monitor migration: Ensures port is numeric and valid.
     *
     * @remarks
     * Converts string port numbers to integers. Validates port range.
     *
     * @param data - The monitor configuration data.
     * @returns Promise resolving to data with numeric port.
     * @throws Throws if port is invalid or not in range 1-65535.
     * @example
     * ```typescript
     * const migrated = await exampleMigrations.portV1_0_to_1_1.transform({ port: "8080" });
     * ```
     */
    portV1_0_to_1_1: {
        description: "Ensure port is a number",
        fromVersion: "1.0.0",
        isBreaking: false,
        toVersion: "1.1.0",
        transform: (data: Record<string, unknown>) => {
            const portValue = data["port"];

            // Handle different port value types
            if (typeof portValue === "string") {
                const parsed = Number.parseInt(portValue, 10);
                // Validate parsed number is valid port
                if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 65_535) {
                    return Promise.resolve({
                        ...data,
                        port: parsed,
                    });
                } else {
                    throw new Error(`Invalid port value: ${portValue}. Must be 1-65535.`);
                }
            }

            // If already a number, validate it
            if (typeof portValue === "number") {
                if (portValue >= 1 && portValue <= 65_535) {
                    return Promise.resolve({
                        ...data,
                        port: portValue,
                    });
                } else {
                    throw new Error(`Invalid port number: ${portValue}. Must be 1-65535.`);
                }
            }

            // Invalid port type
            throw new Error(`Port must be a number or numeric string, got: ${typeof portValue}`);
        },
    } as MigrationRule,
};
