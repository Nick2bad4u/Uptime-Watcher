/**
 * Migration system for monitor types.
 *
 * @remarks
 * Provides a registry, orchestrator, and version manager for monitor
 * configuration migrations. All migrations are registered per monitor type and
 * applied in sequence. Designed for extensibility, maintainability, and robust
 * error handling.
 *
 * @public
 */

import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";
import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";
import isSemVer from "validator/lib/isSemVer";

import type { MonitorConfigurationInput } from "./types";

import { logger } from "../../utils/logger";
import { MAX_LOG_DATA_LENGTH, MAX_MIGRATION_STEPS } from "./constants";

/**
 * Describes a migration rule for a monitor type.
 *
 * @remarks
 * Each migration rule transforms monitor configuration data from one version to
 * another. Used by the migration system to upgrade or modify monitor
 * configuration schemas.
 *
 * @example
 *
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
     * Transformation function to migrate monitor configuration data.
     *
     * @remarks
     * Receives the monitor configuration data and returns a Promise resolving
     * to the transformed data. Must handle all data validation and
     * transformation logic for the version upgrade. May throw if transformation
     * fails or data is invalid.
     *
     * @param data - Monitor configuration data to transform.
     *
     * @returns A promise resolving to the transformed monitor configuration.
     *
     * @throws {@link Error} When transformation fails due to invalid data,
     *   missing required fields, or data validation errors
     */
    transform: (
        data: MonitorConfigurationInput
    ) => Promise<MonitorConfigurationInput>;
}

/**
 * Tracks version information for a monitor type.
 *
 * @remarks
 * Used by {@link VersionManager} to record migration state and applied versions
 * for each monitor type.
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
 * Orchestrates migration of monitor configuration data for a given monitor
 * type.
 *
 * @remarks
 * Applies registered migration rules in sequence to upgrade monitor data.
 * Handles errors, warnings, and version updates. Used internally by the
 * migration system and exposed via factory.
 *
 * @public
 */
class MigrationOrchestrator {
    private readonly registry: MigrationRegistry;

    private readonly versionManager: VersionManager;

    /**
     * Migrates monitor configuration data from one version to another.
     *
     * @remarks
     * Orchestrates the complete migration process by finding the migration path
     * using {@link MigrationRegistry.getMigrationPath}, applying each
     * {@link MigrationRule.transform} sequentially, and updating version state
     * on success. Uses {@link withErrorHandling} for consistent error handling
     * and structured logging throughout the process.
     *
     * The method accumulates errors and warnings during execution, stopping on
     * the first transformation failure. Version state is only updated if all
     * migrations complete successfully and at least one migration was applied.
     *
     * @example
     *
     * ```typescript
     * const result = await orchestrator.migrateMonitorData(
     *     "http",
     *     { url: "example.com" },
     *     "1.0.0",
     *     "1.1.0"
     * );
     * if (result.success) {
     *     logger.info(
     *         `Applied ${result.appliedMigrations.length} migrations`
     *     );
     * }
     * ```
     *
     * @param monitorType - The monitor type identifier (e.g., "http", "ping",
     *   "dns")
     * @param data - Partial monitor configuration data to migrate
     * @param fromVersion - The current semantic version of the data (e.g.,
     *   "1.0.0")
     * @param toVersion - The target semantic version to migrate to (e.g.,
     *   "1.1.0")
     *
     * @returns A Promise resolving to an object containing:
     *
     *   - `appliedMigrations`: Array of migration identifiers that were applied
     *   - `data`: The transformed configuration data (undefined if errors occurred)
     *   - `errors`: Array of error messages encountered during migration
     *   - `success`: Boolean indicating if all migrations completed successfully
     *   - `warnings`: Array of warning messages (e.g., breaking migration notices)
     *
     * @throws {@link Error} When migration orchestration fails due to
     *   unexpected errors not related to individual transformation failures
     *
     * @see {@link MigrationRegistry.getMigrationPath} for path calculation
     * @see {@link VersionManager.setVersion} for version state updates
     */
    public async migrateMonitorData(
        monitorType: string,
        data: MonitorConfigurationInput,
        fromVersion: string,
        toVersion: string
    ): Promise<{
        appliedMigrations: string[];
        data?: MonitorConfigurationInput;
        errors: string[];
        success: boolean;
        warnings: string[];
    }> {
        return withErrorHandling(
            async () => {
                const errors: string[] = [];
                const warnings: string[] = [];
                const appliedMigrations: string[] = [];

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
                const migrationPath = this.registry.getMigrationPath(
                    monitorType,
                    fromVersion,
                    toVersion
                );

                // Apply migrations in sequence
                let currentData = data;

                for (const migration of migrationPath) {
                    try {
                        logger.info(
                            interpolateLogTemplate(
                                LOG_TEMPLATES.services.MIGRATION_APPLYING,
                                {
                                    fromVersion: migration.fromVersion,
                                    monitorType,
                                    toVersion: migration.toVersion,
                                }
                            )
                        );

                        // eslint-disable-next-line no-await-in-loop -- Sequential migration transformations must be applied in order
                        currentData = await migration.transform(currentData);
                        appliedMigrations.push(
                            `${migration.fromVersion}_to_${migration.toVersion}`
                        );

                        if (migration.isBreaking) {
                            warnings.push(
                                `Applied breaking migration: ${migration.description}`
                            );
                        }
                    } catch (error: unknown) {
                        const normalizedError = ensureError(error);
                        // Preserve error context for better debugging
                        const errorDetails = normalizedError.message;
                        const errorMessage = `Migration failed: ${migration.description}`;

                        errors.push(`${errorMessage} - ${errorDetails}`);
                        logger.error(errorMessage, normalizedError, {
                            currentData: JSON.stringify(currentData).slice(
                                0,
                                MAX_LOG_DATA_LENGTH
                            ), // Truncate for logging
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
            },
            {
                logger: logger as {
                    error: (msg: string, err: unknown) => void;
                },
                operationName: `migrateMonitorData[${monitorType}:${fromVersion}->${toVersion}]`,
            }
        );
    }

    /**
     * Constructs a new {@link MigrationOrchestrator} instance.
     *
     * @remarks
     * Creates an orchestrator that coordinates migration operations between the
     * provided registry and version manager. Both dependencies are required for
     * proper migration functionality.
     *
     * @param registry - The {@link MigrationRegistry} instance containing
     *   migration rules
     * @param versionManager - The {@link VersionManager} instance for tracking
     *   version state
     */
    public constructor(
        registry: MigrationRegistry,
        versionManager: VersionManager
    ) {
        this.registry = registry;
        this.versionManager = versionManager;
    }
}

/**
 * Registry for migration rules per monitor type.
 *
 * @remarks
 * Stores and retrieves migration rules, calculates migration paths, and
 * validates migration feasibility. Used by orchestrators and migration
 * utilities.
 *
 * @public
 */
class MigrationRegistry {
    /**
     * Internal storage for migration rules organized by monitor type.
     *
     * @remarks
     * Maps monitor type strings to arrays of {@link MigrationRule} objects.
     * Rules are automatically sorted by source version when added via
     * {@link registerMigration}.
     *
     * @internal
     */
    private readonly migrations = new Map<string, MigrationRule[]>();

    /**
     * Determines if migration is possible between two versions for a monitor
     * type.
     *
     * @remarks
     * Returns true if a valid migration path exists, false otherwise. Does not
     * mutate registry state. Internally calls {@link getMigrationPath} and
     * catches any exceptions to determine feasibility.
     *
     * @param monitorType - The monitor type identifier (e.g., "http", "ping",
     *   "dns")
     * @param fromVersion - The source semantic version string (e.g., "1.0.0")
     * @param toVersion - The target semantic version string (e.g., "1.1.0")
     *
     * @returns True if a valid migration path exists, false if no path is
     *   available
     *
     * @see {@link getMigrationPath} for the underlying path calculation logic
     */
    public canMigrate(
        monitorType: string,
        fromVersion: string,
        toVersion: string
    ): boolean {
        try {
            this.getMigrationPath(monitorType, fromVersion, toVersion);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Calculates the migration path (sequence of rules) from one version to
     * another.
     *
     * @remarks
     * Uses a graph traversal algorithm to find the sequence of
     * {@link MigrationRule} objects needed to migrate from source to target
     * version. Validates version strings before processing and includes safety
     * checks for circular paths and excessive migration chains.
     *
     * Algorithm ensures no infinite loops by tracking visited versions and
     * enforces a maximum path length limit defined by
     * {@link MAX_MIGRATION_STEPS} to prevent excessive migration chains that
     * could indicate design issues.
     *
     * @param monitorType - The monitor type identifier (e.g., "http", "ping",
     *   "dns")
     * @param fromVersion - The source semantic version string (e.g., "1.0.0")
     * @param toVersion - The target semantic version string (e.g., "1.1.0")
     *
     * @returns Array of {@link MigrationRule} objects to apply in sequential
     *   order
     *
     * @throws {@link Error} When no migration path exists from source to target
     *   version
     * @throws {@link Error} When a circular migration path is detected during
     *   traversal
     * @throws {@link Error} When the migration path exceeds
     *   {@link MAX_MIGRATION_STEPS} limit
     * @throws {@link Error} When version strings are invalid or malformed
     *
     * @see {@link validateVersionString} for version validation logic
     * @see {@link registerMigration} for how migration rules are stored
     */
    public getMigrationPath(
        monitorType: string,
        fromVersion: string,
        toVersion: string
    ): MigrationRule[] {
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
            const currentVersionForSearch = currentVersion;
            const nextRule = rules.find(
                (rule) => rule.fromVersion === currentVersionForSearch
            );

            if (!nextRule) {
                const availableFromVersions = rules
                    .map((r) => r.fromVersion)
                    .join(", ");
                throw new Error(
                    `No migration path from ${currentVersion} to ${toVersion} for ${monitorType}. ` +
                        `Available migration starting points: [${availableFromVersions}]`
                );
            }

            // Add to visited AFTER confirming we have a valid next step
            visitedVersions.add(currentVersion);

            // Additional safeguard: limit the number of migration steps
            if (maxMigrationSteps <= path.length) {
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
     * Registers a migration rule for a specific monitor type.
     *
     * @remarks
     * Adds the {@link MigrationRule} to the registry and automatically sorts all
     * rules for the monitor type by source version using
     * {@link compareVersions}. Creates a new rule array if this is the first
     * rule for the monitor type. Logs the registration using structured logging
     * templates.
     *
     * @param monitorType - The monitor type identifier (e.g., "http", "ping",
     *   "dns")
     * @param rule - The {@link MigrationRule} object containing transformation
     *   logic
     *
     * @throws {@link Error} When the migration rules array cannot be created or
     *   retrieved for the specified monitor type (should rarely occur)
     *
     * @see {@link compareVersions} for version sorting logic
     * @see {@link MigrationRule} for rule structure requirements
     */
    public registerMigration(monitorType: string, rule: MigrationRule): void {
        if (!this.migrations.has(monitorType)) {
            this.migrations.set(monitorType, []);
        }

        const rules = this.migrations.get(monitorType);
        if (!rules) {
            throw new Error(
                `Failed to create migration rules for ${monitorType}`
            );
        }

        rules.push(rule);

        // Sort by version using immutable operation
        const sortedRules = rules.toSorted((a, b) =>
            this.compareVersions(a.fromVersion, b.fromVersion));
        rules.length = 0;
        rules.push(...sortedRules);

        logger.info(
            interpolateLogTemplate(
                LOG_TEMPLATES.services.MIGRATION_REGISTERED,
                {
                    fromVersion: rule.fromVersion,
                    monitorType,
                    toVersion: rule.toVersion,
                }
            )
        );
    }

    /**
     * Compares two semantic version strings for sorting purposes.
     *
     * @remarks
     * Implements lexicographic comparison of semantic version components.
     * Validates both version strings using {@link validateVersionString} before
     * comparison to prevent NaN comparisons from malformed versions. Uses
     * numeric comparison of major.minor.patch components, treating missing
     * components as 0.
     *
     * @param a - First semantic version string to compare (e.g., "1.0.0")
     * @param b - Second semantic version string to compare (e.g., "1.1.0")
     *
     * @returns -1 if `a < b`, 1 if `a > b`, 0 if versions are equal
     *
     * @throws {@link Error} When either version string is malformed or invalid
     *
     * @internal
     *
     * @see {@link validateVersionString} for version validation logic
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
            if (partB < partA) return 1;
        }

        return 0;
    }

    /**
     * Validates a version string format to ensure safe processing.
     *
     * @remarks
     * Performs comprehensive validation of semantic version strings using the
     * validator.js {@link isSemVer} function for SemVer 2.0.0 compliance.
     * Additionally validates numeric components to prevent overflow conditions
     * and injection attacks. Extracts base version components while ignoring
     * pre-release and build metadata.
     *
     * @param version - The semantic version string to validate (e.g., "1.0.0")
     * @param parameterName - The parameter name for error reporting context
     *
     * @throws {@link Error} When version is not a non-empty string
     * @throws {@link Error} When version does not follow semantic versioning
     *   format
     * @throws {@link Error} When version contains invalid numeric parts (NaN,
     *   negative, or exceeds MAX_SAFE_INTEGER)
     *
     * @internal
     *
     * @see {@link isSemVer} for semantic version format validation
     */
    private validateVersionString(
        version: string,
        parameterName: string
    ): void {
        if (!version || typeof version !== "string") {
            throw new Error(
                `${parameterName} must be a non-empty string, got: ${typeof version}`
            );
        }

        // Use validator.js' isSemVer for spec-compliant validation (SemVer
        // 2.0.0)
        if (!isSemVer(version)) {
            throw new Error(
                `${parameterName} "${version}" is not a valid semantic version. Expected format: x.y.z (e.g., "1.0.0")`
            );
        }

        // Additional validation: ensure numeric parts are reasonable (prevent
        // overflow) Extract strictly the numeric MAJOR.MINOR.PATCH, ignoring
        // any pre-release/build metadata
        const baseWithoutPre = version.split("-")[0] ?? version;
        const base = baseWithoutPre.split("+")[0] ?? baseWithoutPre;
        const parts = base.split(".").slice(0, 3).map(Number);
        for (const part of parts) {
            if (
                Number.isNaN(part) ||
                part < 0 ||
                Number.MAX_SAFE_INTEGER < part
            ) {
                throw new Error(
                    `${parameterName} "${version}" contains invalid numeric parts`
                );
            }
        }
    }
}

/**
 * Manages version state for monitor types.
 *
 * @remarks
 * Tracks applied versions and timestamps for each monitor type. Used by
 * orchestrators and migration utilities to record and query migration state.
 *
 * @public
 */
class VersionManager {
    /**
     * Internal storage for version information organized by monitor type.
     *
     * @remarks
     * Maps monitor type strings to {@link VersionInfo} objects containing
     * version state, application status, and timestamps. Used to track which
     * migrations have been successfully applied.
     *
     * @internal
     */
    private readonly versions = new Map<string, VersionInfo>();

    /**
     * Retrieves all version information for all monitor types.
     *
     * @remarks
     * Returns a defensive copy of the internal version storage to prevent
     * external modification of the version state. The returned Map contains the
     * same {@link VersionInfo} object references but modifications to the Map
     * structure will not affect the internal state.
     *
     * @returns A new Map with monitor type strings as keys and
     *   {@link VersionInfo} objects as values
     */
    public getAllVersions(): Map<string, VersionInfo> {
        return new Map(this.versions);
    }

    /**
     * Gets the current version for a specific monitor type.
     *
     * @remarks
     * Retrieves the version string from the stored {@link VersionInfo} for the
     * specified monitor type. Returns undefined if no version has been set for
     * the monitor type.
     *
     * @param monitorType - The monitor type identifier (e.g., "http", "ping",
     *   "dns")
     *
     * @returns The semantic version string (e.g., "1.1.0") if set, or undefined
     *   if no version information exists for the monitor type
     */
    public getVersion(monitorType: string): string | undefined {
        return this.versions.get(monitorType)?.version;
    }

    /**
     * Checks if a specific version is applied for a monitor type.
     *
     * @remarks
     * Verifies both that the version matches the stored version string and that
     * the {@link VersionInfo.applied} flag is true. Returns false if the monitor
     * type is not found, version doesn't match, or the applied flag is false.
     *
     * @param monitorType - The monitor type identifier (e.g., "http", "ping",
     *   "dns")
     * @param version - The semantic version string to check (e.g., "1.1.0")
     *
     * @returns True if the specified version is applied for the monitor type,
     *   false if not found, version mismatch, or not applied
     */
    public isVersionApplied(monitorType: string, version: string): boolean {
        const info = this.versions.get(monitorType);
        return info?.version === version && info.applied;
    }

    /**
     * Sets the version for a monitor type and marks it as applied.
     *
     * @remarks
     * Creates or updates the {@link VersionInfo} entry for the specified monitor
     * type, setting the version string, marking it as applied, and recording
     * the current timestamp. This indicates that migrations to this version
     * have been successfully completed.
     *
     * @param monitorType - The monitor type identifier (e.g., "http", "ping",
     *   "dns")
     * @param version - The semantic version string to set (e.g., "1.1.0")
     */
    public setVersion(monitorType: string, version: string): void {
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
 * Global {@link MigrationRegistry} instance used to register and retrieve
 * migration rules for all monitor types throughout the application. Thread-safe
 * for read operations but registration should occur during application
 * initialization to avoid race conditions.
 *
 * @example
 *
 * ```typescript
 * // Register a migration rule
 * migrationRegistry.registerMigration("http", {
 *     fromVersion: "1.0.0",
 *     toVersion: "1.1.0",
 *     description: "Add timeout field",
 *     isBreaking: false,
 *     transform: async (data) => ({ ...data, timeout: 30000 }),
 * });
 *
 * // Check migration feasibility
 * const canMigrate = migrationRegistry.canMigrate(
 *     "http",
 *     "1.0.0",
 *     "1.1.0"
 * );
 * ```
 *
 * @public
 */
export const migrationRegistry: MigrationRegistry = new MigrationRegistry();

/**
 * Singleton manager for monitor type version tracking.
 *
 * @remarks
 * Global {@link VersionManager} instance used to query and update migration
 * state for all monitor types throughout the application. Maintains persistent
 * version information and application status to track which migrations have
 * been successfully applied.
 *
 * @example
 *
 * ```typescript
 * // Check current version
 * const currentVersion = versionManager.getVersion("http");
 *
 * // Verify if specific version is applied
 * const isApplied = versionManager.isVersionApplied("http", "1.1.0");
 *
 * // Get all version information
 * const allVersions = versionManager.getAllVersions();
 * ```
 *
 * @public
 */
export const versionManager: VersionManager = new VersionManager();

/**
 * Factory for creating migration orchestrator instances.
 *
 * @remarks
 * Creates a new {@link MigrationOrchestrator} instance using the shared
 * {@link migrationRegistry} and {@link versionManager} singletons. Useful for
 * isolated migration workflows, testing scenarios, or when you need multiple
 * orchestrator instances with the same registry and version state.
 *
 * @example
 *
 * ```typescript
 * const orchestrator = createMigrationOrchestrator();
 * const result = await orchestrator.migrateMonitorData(
 *     "http",
 *     monitorData,
 *     "1.0.0",
 *     "1.1.0"
 * );
 * ```
 *
 * @returns A new {@link MigrationOrchestrator} instance configured with the
 *   global registry and version manager
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
 * Provides template {@link MigrationRule} implementations for common migration
 * scenarios. These examples demonstrate proper migration structure and are not
 * registered by default. Register manually using {@link migrationRegistry} as
 * needed for tests or new monitor types.
 *
 * Contains migrations for HTTP and port monitor types that showcase typical
 * migration patterns like adding fields with defaults and data type
 * conversions.
 *
 * @example
 *
 * ```typescript
 * // Register example migrations
 * migrationRegistry.registerMigration(
 *     "http",
 *     exampleMigrations.httpV1_0_to_1_1
 * );
 * migrationRegistry.registerMigration(
 *     "port",
 *     exampleMigrations.portV1_0_to_1_1
 * );
 *
 * // Use in tests
 * const result = await exampleMigrations.httpV1_0_to_1_1.transform({
 *     url: "https://example.com",
 * });
 * ```
 *
 * @public
 *
 * @see {@link migrationRegistry} for registration of these examples
 */
export const exampleMigrations = {
    /**
     * HTTP monitor migration: Adds a timeout field with default value.
     *
     * @remarks
     * Non-breaking migration that adds a `timeout` field to HTTP monitor
     * configuration if not already present. Uses a safe default value and
     * preserves existing timeout values if they exist. Demonstrates the pattern
     * for adding optional fields during schema evolution.
     *
     * @example
     *
     * ```typescript
     * const migrated = await exampleMigrations.httpV1_0_to_1_1.transform({
     *     url: "https://example.com",
     * });
     * // Result: { url: "https://example.com", timeout: 30000 }
     * ```
     *
     * @defaultValue timeout = 30000 (30 seconds)
     *
     * @param data - The monitor configuration data
     *
     * @returns Promise resolving to data with `timeout` field set
     *
     * @throws {@link Error} Should not throw for valid input data
     */
    httpV1_0_to_1_1: {
        description: "Add timeout field with default 30s",
        fromVersion: "1.0.0",
        isBreaking: false,
        toVersion: "1.1.0",
        transform: (data: MonitorConfigurationInput) =>
            Promise.resolve({
                ...data,
                timeout:
                    typeof data.timeout === "number" ? data.timeout : 30_000,
            }),
    } as MigrationRule,

    /**
     * Port monitor migration: Ensures port is numeric and valid.
     *
     * @remarks
     * Converts string port numbers to integers and validates port range.
     * Handles both string and numeric input, ensuring the port value is within
     * the valid TCP/UDP port range (1-65535). Demonstrates data type conversion
     * and validation patterns for migration rules.
     *
     * @example
     *
     * ```typescript
     * const migrated = await exampleMigrations.portV1_0_to_1_1.transform({
     *     port: "8080",
     * });
     * // Result: { port: 8080 }
     * ```
     *
     * @param data - Monitor configuration data from legacy versions
     *
     * @returns Promise resolving to data with numeric port value
     *
     * @throws {@link Error} When port value is invalid, not a number/string, or
     *   outside the valid range (1-65535)
     */
    portV1_0_to_1_1: {
        description: "Ensure port is a number",
        fromVersion: "1.0.0",
        isBreaking: false,
        toVersion: "1.1.0",
        transform: (data: MonitorConfigurationInput) => {
            const rawPort = (data as Record<string, unknown>)["port"];

            // Handle different port value types
            if (typeof rawPort === "string") {
                const parsed = Number.parseInt(rawPort, 10);
                // Validate parsed number is valid port
                if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 65_535) {
                    return Promise.resolve({
                        ...data,
                        port: parsed,
                    });
                }
                throw new Error(
                    `Invalid port value: ${rawPort}. Must be 1-65535.`
                );
            }

            // If already a number, validate it
            if (typeof rawPort === "number") {
                if (rawPort >= 1 && rawPort <= 65_535) {
                    return Promise.resolve({
                        ...data,
                        port: rawPort,
                    });
                }
                throw new Error(
                    `Invalid port number: ${rawPort}. Must be 1-65535.`
                );
            }

            // Invalid port type
            throw new Error(
                `Port must be a number or numeric string, got: ${typeof rawPort}`
            );
        },
    } as MigrationRule,
};
