/**
 * Basic migration system for monitor types.
 * Simple, functional implementation without over-complexity.
 */

import { logger } from "../../utils/logger";

export interface MigrationRule {
    description: string;
    fromVersion: string;
    isBreaking: boolean;
    toVersion: string;
    transform: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
}

export interface VersionInfo {
    applied: boolean;
    timestamp: number;
    version: string;
}

/**
 * Basic migration orchestrator
 */
class MigrationOrchestrator {
    constructor(
        private readonly registry: MigrationRegistry,
        private readonly versionManager: VersionManager
    ) {}

    /**
     * Migrate monitor data from one version to another
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
 * Simple migration registry
 */
class MigrationRegistry {
    private readonly migrations = new Map<string, MigrationRule[]>();

    /**
     * Check if migration is possible
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
     * Get migration path from one version to another
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
     * Register a migration for a monitor type
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
     * Compare semantic versions
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
 * Simple version manager
 */
class VersionManager {
    private readonly versions = new Map<string, VersionInfo>();

    /**
     * Get all versions
     */
    getAllVersions(): Map<string, VersionInfo> {
        return new Map(this.versions);
    }

    /**
     * Get version for a monitor type
     */
    getVersion(monitorType: string): string | undefined {
        return this.versions.get(monitorType)?.version;
    }

    /**
     * Check if version is applied
     */
    isVersionApplied(monitorType: string, version: string): boolean {
        const info = this.versions.get(monitorType);
        return info?.version === version && info.applied;
    }

    /**
     * Set version for a monitor type
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
 * Registry for monitor type migrations.
 *
 * @remarks
 * Singleton instance for registering and retrieving migration rules.
 * Provides migration path calculation and validation for monitor data upgrades.
 *
 * @example
 * ```typescript
 * // Register a migration
 * migrationRegistry.registerMigration("http", {
 *   fromVersion: "1.0.0",
 *   toVersion: "1.1.0",
 *   description: "Add timeout field",
 *   isBreaking: false,
 *   transform: async (data) => ({ ...data, timeout: 30000 })
 * });
 * ```
 */
export const migrationRegistry = new MigrationRegistry();

/**
 * Manager for monitor type version tracking.
 *
 * @remarks
 * Singleton instance for tracking applied versions and migration state.
 * Provides version queries and updates for monitor types.
 */
export const versionManager = new VersionManager();

/**
 * Factory function for creating migration orchestrator instances.
 *
 * @returns New migration orchestrator instance
 *
 * @remarks
 * Use this when you need an isolated orchestrator instance instead of
 * the shared singleton pattern. Useful for testing or specialized workflows.
 */
export function createMigrationOrchestrator(): MigrationOrchestrator {
    return new MigrationOrchestrator(migrationRegistry, versionManager);
}

/**
 * Example migration definitions for reference and testing.
 *
 * @remarks
 * Provides working examples of migration rules for different monitor types.
 * Use these as templates when creating new migrations for your monitor types.
 *
 * @example
 * ```typescript
 * // Register example migrations
 * migrationRegistry.registerMigration("http", exampleMigrations.httpV1_0_to_1_1);
 * migrationRegistry.registerMigration("port", exampleMigrations.portV1_0_to_1_1);
 * ```
 */
export const exampleMigrations = {
    /**
     * Example HTTP monitor migration: Add timeout field with default value.
     *
     * @remarks
     * Demonstrates non-breaking migration that adds a new field with sensible default.
     * Safe to apply to existing HTTP monitor configurations.
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
     * Example port monitor migration: Ensure port is numeric.
     *
     * @remarks
     * Demonstrates data type normalization migration with validation.
     * Converts string port numbers to integers with proper error handling.
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
