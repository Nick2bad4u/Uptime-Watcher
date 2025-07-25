/**
 * Migration system for monitor types.
 *
 * @remarks
 * Provides a registry, orchestrator, and version manager for monitor configuration migrations.
 * All migrations are registered per monitor type and applied in sequence.
 * Designed for extensibility and maintainability.
 */

import { logger } from "../../utils/logger";

/**
 * Describes a migration rule for a monitor type.
 *
 * @remarks
 * Each migration rule transforms monitor configuration data from one version to another.
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
     */
    description: string;
    /**
     * Source version for the migration.
     */
    fromVersion: string;
    /**
     * Indicates if the migration is breaking.
     */
    isBreaking: boolean;
    /**
     * Target version for the migration.
     */
    toVersion: string;
    /**
     * Transformation function to migrate data.
     *
     * @param data - The monitor configuration data to transform.
     * @returns A promise resolving to the transformed data.
     * @throws May throw if transformation fails or data is invalid.
     */
    transform: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
}

/**
 * Tracks version information for a monitor type.
 *
 * @remarks
 * Used by {@link VersionManager} to record migration state.
 *
 * @public
 */
export interface VersionInfo {
    /**
     * Indicates if the version has been applied.
     */
    applied: boolean;
    /**
     * Timestamp when the version was set.
     */
    timestamp: number;
    /**
     * The version string.
     */
    version: string;
}

/**
 * Orchestrates migration of monitor configuration data.
 *
 * @remarks
 * Applies registered migration rules in sequence to upgrade monitor data.
 * Handles errors, warnings, and version updates.
 *
 * @public
 */
class MigrationOrchestrator {
    /**
     * Constructs a MigrationOrchestrator.
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
     * Applies all necessary migrations in order. Updates version state if successful.
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
                    logger.info(`Applying migration: ${monitorType} ${migration.fromVersion} → ${migration.toVersion}`);

                    currentData = await migration.transform(currentData);
                    appliedMigrations.push(`${migration.fromVersion}_to_${migration.toVersion}`);

                    if (migration.isBreaking) {
                        warnings.push(`Applied breaking migration: ${migration.description}`);
                    }
                } catch (error) {
                    const errorMessage = `Migration failed: ${migration.description} - ${error}`;
                    errors.push(errorMessage);
                    logger.error(errorMessage, error);
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
 * Stores and retrieves migration rules, calculates migration paths, and validates migration feasibility.
 *
 * @public
 */
class MigrationRegistry {
    private readonly migrations = new Map<string, MigrationRule[]>();

    /**
     * Determines if migration is possible between two versions for a monitor type.
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
     * Throws if no valid path exists or if a circular path is detected.
     *
     * @param monitorType - The monitor type.
     * @param fromVersion - The source version.
     * @param toVersion - The target version.
     * @returns Array of migration rules to apply in order.
     * @throws Throws if no migration path exists, circular path detected, or path exceeds 100 steps.
     */
    getMigrationPath(monitorType: string, fromVersion: string, toVersion: string): MigrationRule[] {
        const rules = this.migrations.get(monitorType) ?? [];
        const path: MigrationRule[] = [];
        const visitedVersions = new Set<string>();

        let currentVersion = fromVersion;

        while (currentVersion !== toVersion) {
            // Prevent infinite loops by checking if we've already visited this version
            if (visitedVersions.has(currentVersion)) {
                throw new Error(`Circular migration path detected for ${monitorType} at version ${currentVersion}`);
            }
            visitedVersions.add(currentVersion);

            const nextRule = rules.find((rule) => rule.fromVersion === currentVersion);

            if (!nextRule) {
                throw new Error(`No migration path from ${currentVersion} to ${toVersion} for ${monitorType}`);
            }

            path.push(nextRule);
            currentVersion = nextRule.toVersion;

            // Additional safeguard: limit the number of migration steps
            if (path.length > 100) {
                throw new Error(
                    `Migration path too long for ${monitorType}: ${path.length} steps exceeded maximum of 100`
                );
            }
        }

        return path;
    }

    /**
     * Registers a migration rule for a monitor type.
     *
     * @remarks
     * Rules are sorted by source version after registration.
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

        logger.info(`Registered migration for ${monitorType}: ${rule.fromVersion} → ${rule.toVersion}`);
    }

    /**
     * Compares two semantic version strings.
     *
     * @param a - First version string.
     * @param b - Second version string.
     * @returns -1 if a \< b, 1 if a \> b, 0 if equal.
     */
    private compareVersions(a: string, b: string): number {
        const versionA = a.split(".").map(Number);
        const versionB = b.split(".").map(Number);

        for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
            // eslint-disable-next-line security/detect-object-injection
            const partA = versionA[i] ?? 0;
            // eslint-disable-next-line security/detect-object-injection
            const partB = versionB[i] ?? 0;

            if (partA < partB) return -1;
            if (partA > partB) return 1;
        }

        return 0;
    }
}

/**
 * Manages version state for monitor types.
 *
 * @remarks
 * Tracks applied versions and timestamps for each monitor type.
 *
 * @public
 */
class VersionManager {
    private readonly versions = new Map<string, VersionInfo>();

    /**
     * Retrieves all version info for all monitor types.
     *
     * @returns Map of monitor type to version info.
     */
    getAllVersions(): Map<string, VersionInfo> {
        return new Map(this.versions);
    }

    /**
     * Gets the current version for a monitor type.
     *
     * @param monitorType - The monitor type.
     * @returns The version string, or undefined if not set.
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
 * Use to register and retrieve migration rules for all monitor types.
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
export const migrationRegistry = new MigrationRegistry();

/**
 * Singleton manager for monitor type version tracking.
 *
 * @remarks
 * Use to query and update migration state for all monitor types.
 *
 * @public
 */
export const versionManager = new VersionManager();

/**
 * Factory for creating migration orchestrator instances.
 *
 * @remarks
 * Use for isolated migration workflows or testing.
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
 * Provides templates for common migration scenarios.
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
                timeout: (data.timeout as number | undefined) ?? 30_000, // Default 30 seconds
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
            const portValue = data.port;

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
