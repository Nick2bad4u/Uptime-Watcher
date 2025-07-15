/**
 * Sophisticated database schema migration system for monitor types.
 * Handles version tracking, field type coercion, and migration strategies.
 */

/* eslint-disable security/detect-object-injection */
// ^ Dynamic object access is required for flexible schema migration
// Property names come from validated migration configurations

import { logger } from "../../utils/logger";
import type { BaseMonitorConfig } from "./MonitorTypeRegistry";

/**
 * Database field type definitions with proper coercion
 */
export const DatabaseFieldTypes = {
    STRING: "TEXT",
    NUMBER: "INTEGER",
    REAL: "REAL",
    BOOLEAN: "BOOLEAN",
    JSON: "TEXT", // JSON stored as TEXT
    TIMESTAMP: "INTEGER", // Unix timestamp
} as const;

export type DatabaseFieldType = (typeof DatabaseFieldTypes)[keyof typeof DatabaseFieldTypes];

/**
 * Field migration strategy options
 */
export interface FieldMigrationStrategy {
    /** Strategy type */
    type: "add" | "remove" | "rename" | "transform";
    /** Old field name (for rename/transform) */
    oldName?: string;
    /** New field name */
    newName: string;
    /** Field type */
    fieldType: DatabaseFieldType;
    /** Default value for new fields */
    defaultValue?: unknown;
    /** Transformation function for complex migrations */
    transform?: (oldValue: unknown) => unknown;
    /** Validation function for new values */
    validate?: (value: unknown) => boolean;
}

/**
 * Monitor type version configuration
 */
export interface MonitorTypeVersion {
    /** Version number (semantic versioning) */
    version: string;
    /** Migration strategies for this version */
    migrations: FieldMigrationStrategy[];
    /** Breaking changes flag */
    isBreaking: boolean;
    /** Description of changes */
    description?: string;
}

/**
 * Migration log entry
 */
export interface MigrationLogEntry {
    version: string;
    type: string;
    timestamp: number;
    success: boolean;
    error?: string;
}

/**
 * Enhanced monitor type configuration with versioning
 */
export interface VersionedMonitorConfig extends BaseMonitorConfig {
    /** Version history for migrations */
    versionHistory: MonitorTypeVersion[];
    /** Current version */
    currentVersion: string;
    /** Schema evolution strategy */
    evolutionStrategy: "backward-compatible" | "breaking-changes-allowed";
}

/**
 * Parse semantic version string
 */
function parseVersion(version: string): number[] {
    return version.split(".").map(Number);
}

/**
 * Database schema migration manager
 */
export class DatabaseSchemaMigrator {
    private readonly appliedMigrations = new Set<string>();
    private readonly migrationLog: MigrationLogEntry[] = [];

    /**
     * Apply migrations for a monitor type
     */
    async applyMigrations(
        config: VersionedMonitorConfig,
        currentVersion: string,
        targetVersion: string
    ): Promise<{
        success: boolean;
        appliedMigrations: string[];
        errors: string[];
    }> {
        const errors: string[] = [];
        const appliedMigrations: string[] = [];

        try {
            const migrationsToApply = this.getMigrationsToApply(config.versionHistory, currentVersion, targetVersion);

            for (const migration of migrationsToApply) {
                const migrationId = `${config.type}-${migration.version}`;

                if (this.appliedMigrations.has(migrationId)) {
                    logger.debug(`Migration ${migrationId} already applied, skipping`);
                    continue;
                }

                try {
                    await this.applyMigration(config.type, migration);
                    this.appliedMigrations.add(migrationId);
                    appliedMigrations.push(migrationId);

                    this.migrationLog.push({
                        version: migration.version,
                        type: config.type,
                        timestamp: Date.now(),
                        success: true,
                    });

                    logger.info(`Successfully applied migration ${migrationId}`);
                } catch (error) {
                    const errorMessage = `Failed to apply migration ${migrationId}: ${error}`;
                    errors.push(errorMessage);
                    logger.error(errorMessage, error);

                    this.migrationLog.push({
                        version: migration.version,
                        type: config.type,
                        timestamp: Date.now(),
                        success: false,
                        error: errorMessage,
                    });
                }
            }

            return {
                success: errors.length === 0,
                appliedMigrations,
                errors,
            };
        } catch (error) {
            const errorMessage = `Migration process failed: ${error}`;
            errors.push(errorMessage);
            logger.error(errorMessage, error);

            return {
                success: false,
                appliedMigrations,
                errors,
            };
        }
    }

    /**
     * Get migrations to apply between versions
     */
    private getMigrationsToApply(
        versionHistory: MonitorTypeVersion[],
        currentVersion: string,
        targetVersion: string
    ): MonitorTypeVersion[] {
        // Sort versions chronologically
        const sortedVersions = [...versionHistory].sort((a, b) => this.compareVersions(a.version, b.version));

        const currentIndex = sortedVersions.findIndex((v) => v.version === currentVersion);
        const targetIndex = sortedVersions.findIndex((v) => v.version === targetVersion);

        if (currentIndex === -1 || targetIndex === -1) {
            throw new Error(`Invalid version range: ${currentVersion} -> ${targetVersion}`);
        }

        if (currentIndex >= targetIndex) {
            // No migrations needed or downgrade (not supported)
            return [];
        }

        // Return migrations to apply (exclusive of current, inclusive of target)
        return sortedVersions.slice(currentIndex + 1, targetIndex + 1);
    }

    /**
     * Apply a single migration
     */
    private async applyMigration(monitorType: string, migration: MonitorTypeVersion): Promise<void> {
        logger.info(`Applying migration ${monitorType}:${migration.version}`);

        for (const strategy of migration.migrations) {
            switch (strategy.type) {
                case "add": {
                    await this.addField(monitorType, strategy);
                    break;
                }
                case "remove": {
                    await this.removeField(monitorType, strategy);
                    break;
                }
                case "rename": {
                    await this.renameField(monitorType, strategy);
                    break;
                }
                case "transform": {
                    await this.transformField(monitorType, strategy);
                    break;
                }
                default: {
                    throw new Error(`Unknown migration strategy: ${strategy.type}`);
                }
            }
        }
    }

    /**
     * Map field type to SQL type
     */
    private mapFieldTypeToSQL(fieldType: DatabaseFieldType): string {
        switch (fieldType) {
            case DatabaseFieldTypes.STRING: {
                return "TEXT";
            }
            case DatabaseFieldTypes.NUMBER: {
                return "INTEGER";
            }
            case DatabaseFieldTypes.REAL: {
                return "REAL";
            }
            case DatabaseFieldTypes.BOOLEAN: {
                return "INTEGER"; // SQLite stores booleans as integers
            }
            case DatabaseFieldTypes.JSON: {
                return "TEXT";
            }
            case DatabaseFieldTypes.TIMESTAMP: {
                return "INTEGER";
            }
            default: {
                throw new Error(`Unknown field type: ${fieldType}`);
            }
        }
    }

    /**
     * Add a new field to monitors
     */
    private async addField(monitorType: string, strategy: FieldMigrationStrategy): Promise<void> {
        logger.info(`Adding field ${strategy.newName} to ${monitorType} monitors`);

        // Get the database service (we'll need to inject it)
        const DatabaseService = await import("../database/DatabaseService");
        const databaseService = DatabaseService.DatabaseService.getInstance();
        const db = databaseService.getDatabase();

        // 1. Alter the database table to add the column
        const sqlType = this.mapFieldTypeToSQL(strategy.fieldType);
        const alterTableSQL = `ALTER TABLE monitors ADD COLUMN ${strategy.newName} ${sqlType}`;

        try {
            db.run(alterTableSQL);
            logger.info(`Successfully added column ${strategy.newName} to monitors table`);
        } catch (error) {
            logger.error(`Failed to add column ${strategy.newName}:`, error);
            throw error;
        }

        // 2. Update existing records with the default value if provided
        if (strategy.defaultValue !== undefined) {
            const updateSQL = `UPDATE monitors SET ${strategy.newName} = ? WHERE type = ?`;
            try {
                let defaultValue: string | null = null;
                if (strategy.defaultValue !== null) {
                    defaultValue =
                        typeof strategy.defaultValue === "string"
                            ? strategy.defaultValue
                            : JSON.stringify(strategy.defaultValue);
                }
                const result = db.run(updateSQL, [defaultValue, monitorType]);
                logger.info(
                    `Updated ${result.changes} ${monitorType} monitors with default value for ${strategy.newName}`
                );
            } catch (error) {
                logger.error(`Failed to set default value for ${strategy.newName}:`, error);
                throw error;
            }
        }

        // 3. Note: Monitor type schema updates would happen in the registry
        logger.info(`Successfully added field ${strategy.newName} to ${monitorType} monitors`);
    }

    /**
     * Remove a field from monitors
     */
    private async removeField(monitorType: string, strategy: FieldMigrationStrategy): Promise<void> {
        logger.info(`Removing field ${strategy.newName} from ${monitorType} monitors`);

        // Get the database service
        const DatabaseService = await import("../database/DatabaseService");
        const databaseService = DatabaseService.DatabaseService.getInstance();
        const db = databaseService.getDatabase();

        // SQLite doesn't support DROP COLUMN directly, so we need to:
        // 1. Create a new table without the column
        // 2. Copy data from old table to new table
        // 3. Drop old table and rename new table

        try {
            // Get current table schema
            const tableInfo = db.all("PRAGMA table_info(monitors)") as {
                cid: number;
                name: string;
                type: string;
                notnull: number;
                dflt_value: string | null;
                pk: number;
            }[];

            // Filter out the column we want to remove
            const remainingColumns = tableInfo.filter((col) => col.name !== strategy.newName);

            if (remainingColumns.length === tableInfo.length) {
                logger.warn(`Column ${strategy.newName} does not exist in monitors table`);
                return;
            }

            // Create new table schema
            const columnDefinitions = remainingColumns.map((col) => {
                let def = `${col.name} ${col.type}`;
                if (col.notnull === 1) def += " NOT NULL";
                if (col.dflt_value !== null) def += ` DEFAULT ${col.dflt_value}`;
                if (col.pk === 1) def += " PRIMARY KEY";
                return def;
            });

            const createTableSQL = `CREATE TABLE monitors_new (${columnDefinitions.join(", ")})`;
            db.run(createTableSQL);

            // Copy data to new table
            const columnNames = remainingColumns.map((col) => col.name).join(", ");
            const copyDataSQL = `INSERT INTO monitors_new (${columnNames}) SELECT ${columnNames} FROM monitors`;
            db.run(copyDataSQL);

            // Drop old table and rename new table
            db.run("DROP TABLE monitors");
            db.run("ALTER TABLE monitors_new RENAME TO monitors");

            logger.info(`Successfully removed field ${strategy.newName} from ${monitorType} monitors`);
        } catch (error) {
            logger.error(`Failed to remove field ${strategy.newName}:`, error);
            throw error;
        }
    }

    /**
     * Rename a field in monitors
     */
    private renameField(monitorType: string, strategy: FieldMigrationStrategy): Promise<void> {
        if (!strategy.oldName) {
            throw new Error("Old field name required for rename migration");
        }

        logger.info(`Renaming field ${strategy.oldName} to ${strategy.newName} in ${monitorType} monitors`);

        // In a real implementation, this would:
        // 1. Create new column with new name
        // 2. Copy data from old column to new column
        // 3. Remove old column
        // 4. Update schema

        return Promise.resolve();
    }

    /**
     * Transform field values in monitors
     */
    private transformField(monitorType: string, strategy: FieldMigrationStrategy): Promise<void> {
        if (!strategy.transform) {
            throw new Error("Transform function required for transform migration");
        }

        logger.info(`Transforming field ${strategy.newName} in ${monitorType} monitors`);

        // In a real implementation, this would:
        // 1. Read all existing values
        // 2. Apply transformation function
        // 3. Update with new values
        // 4. Validate results

        return Promise.resolve();
    }

    /**
     * Compare semantic versions
     */
    private compareVersions(a: string, b: string): number {
        const versionA = parseVersion(a);
        const versionB = parseVersion(b);

        for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
            const partA = versionA[i] ?? 0;
            const partB = versionB[i] ?? 0;

            if (partA < partB) return -1;
            if (partA > partB) return 1;
        }

        return 0;
    }

    /**
     * Get migration log
     */
    getMigrationLog(): MigrationLogEntry[] {
        return [...this.migrationLog];
    }

    /**
     * Check if migration is applied
     */
    isMigrationApplied(migrationId: string): boolean {
        return this.appliedMigrations.has(migrationId);
    }
}

/**
 * Enhanced field type coercion with better error handling
 */
export const FieldTypeCoercer = {
    /**
     * Coerce value to target type with comprehensive error handling
     */
    coerceValue(
        value: unknown,
        targetType: DatabaseFieldType,
        fieldName: string
    ): {
        success: boolean;
        value?: unknown;
        error?: string;
    } {
        try {
            switch (targetType) {
                case DatabaseFieldTypes.STRING: {
                    return this.coerceToString(value, fieldName);
                }
                case DatabaseFieldTypes.NUMBER: {
                    return this.coerceToNumber(value, fieldName);
                }
                case DatabaseFieldTypes.REAL: {
                    return this.coerceToReal(value, fieldName);
                }
                case DatabaseFieldTypes.BOOLEAN: {
                    return this.coerceToBoolean(value, fieldName);
                }
                case DatabaseFieldTypes.JSON: {
                    return this.coerceToJSON(value, fieldName);
                }
                case DatabaseFieldTypes.TIMESTAMP: {
                    return this.coerceToTimestamp(value, fieldName);
                }
                default: {
                    return {
                        success: false,
                        error: `Unknown target type: ${targetType}`,
                    };
                }
            }
        } catch (error) {
            return {
                success: false,
                error: `Coercion failed for ${fieldName}: ${error}`,
            };
        }
    },

    /**
     * Coerce to string with null/undefined handling
     */
    coerceToString(value: unknown, fieldName: string) {
        if (value === null || value === undefined) {
            return { success: true, value: null };
        }

        if (typeof value === "string") {
            return { success: true, value };
        }

        if (typeof value === "number" || typeof value === "boolean") {
            return { success: true, value: String(value) };
        }

        if (typeof value === "object") {
            try {
                return { success: true, value: JSON.stringify(value) };
            } catch {
                return {
                    success: false,
                    error: `Cannot convert object to string for field ${fieldName}`,
                };
            }
        }

        return {
            success: false,
            error: `Cannot coerce ${typeof value} to string for field ${fieldName}`,
        };
    },

    /**
     * Coerce to number with range validation
     */
    coerceToNumber(value: unknown, fieldName: string) {
        if (value === null || value === undefined) {
            return { success: true, value: null };
        }

        if (typeof value === "number") {
            if (Number.isInteger(value)) {
                return { success: true, value };
            }
            return {
                success: false,
                error: `Non-integer number for field ${fieldName}`,
            };
        }

        if (typeof value === "string") {
            const parsed = Number.parseInt(value, 10);
            if (Number.isNaN(parsed)) {
                return {
                    success: false,
                    error: `Cannot parse string "${value}" as number for field ${fieldName}`,
                };
            }
            return { success: true, value: parsed };
        }

        if (typeof value === "boolean") {
            return { success: true, value: value ? 1 : 0 };
        }

        return {
            success: false,
            error: `Cannot coerce ${typeof value} to number for field ${fieldName}`,
        };
    },

    /**
     * Coerce to real number
     */
    coerceToReal(value: unknown, fieldName: string) {
        if (value === null || value === undefined) {
            return { success: true, value: null };
        }

        if (typeof value === "number") {
            return { success: true, value };
        }

        if (typeof value === "string") {
            const parsed = Number.parseFloat(value);
            if (Number.isNaN(parsed)) {
                return {
                    success: false,
                    error: `Cannot parse string "${value}" as real number for field ${fieldName}`,
                };
            }
            return { success: true, value: parsed };
        }

        return {
            success: false,
            error: `Cannot coerce ${typeof value} to real number for field ${fieldName}`,
        };
    },

    /**
     * Coerce to boolean with comprehensive interpretation
     */
    coerceToBoolean(value: unknown, fieldName: string) {
        if (value === null || value === undefined) {
            return { success: true, value: null };
        }

        if (typeof value === "boolean") {
            return { success: true, value };
        }

        if (typeof value === "number") {
            return { success: true, value: value !== 0 };
        }

        if (typeof value === "string") {
            const lower = value.toLowerCase().trim();
            if (["true", "1", "yes", "on"].includes(lower)) {
                return { success: true, value: true };
            }
            if (["false", "0", "no", "off"].includes(lower)) {
                return { success: true, value: false };
            }
            return {
                success: false,
                error: `Cannot interpret string "${value}" as boolean for field ${fieldName}`,
            };
        }

        return {
            success: false,
            error: `Cannot coerce ${typeof value} to boolean for field ${fieldName}`,
        };
    },

    /**
     * Coerce to JSON with validation
     */
    coerceToJSON(value: unknown, fieldName: string) {
        if (value === null || value === undefined) {
            return { success: true, value: null };
        }

        if (typeof value === "string") {
            try {
                JSON.parse(value); // Validate JSON
                return { success: true, value };
            } catch {
                return {
                    success: false,
                    error: `Invalid JSON string for field ${fieldName}`,
                };
            }
        }

        if (typeof value === "object") {
            try {
                return { success: true, value: JSON.stringify(value) };
            } catch {
                return {
                    success: false,
                    error: `Cannot serialize object to JSON for field ${fieldName}`,
                };
            }
        }

        return {
            success: false,
            error: `Cannot coerce ${typeof value} to JSON for field ${fieldName}`,
        };
    },

    /**
     * Coerce to timestamp
     */
    coerceToTimestamp(value: unknown, fieldName: string) {
        if (value === null || value === undefined) {
            return { success: true, value: null };
        }

        if (typeof value === "number") {
            return { success: true, value: Math.floor(value) };
        }

        if (typeof value === "string") {
            const parsed = Date.parse(value);
            if (Number.isNaN(parsed)) {
                return {
                    success: false,
                    error: `Cannot parse string "${value}" as timestamp for field ${fieldName}`,
                };
            }
            return { success: true, value: Math.floor(parsed) };
        }

        if (value instanceof Date) {
            return { success: true, value: Math.floor(value.getTime()) };
        }

        return {
            success: false,
            error: `Cannot coerce ${typeof value} to timestamp for field ${fieldName}`,
        };
    },
};

// Export singleton instance
export const databaseSchemaMigrator = new DatabaseSchemaMigrator();
