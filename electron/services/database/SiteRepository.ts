import { Database } from "node-sqlite3-wasm";

import { logger } from "../../utils/logger";
import { withDatabaseOperation } from "../../utils/operationalHooks";
import { DatabaseService } from "./DatabaseService";
import { rowsToSites, rowToSite, type SiteRow } from "./utils/siteMapper";

/**
 * Repository for managing site data persistence.
 * Handles CRUD operations for sites in the database.
 *
 * @remarks
 * **Data Consistency Standards:**
 * - Site names: Default to "Unnamed Site" when null/undefined for consistency
 * - Monitoring: Default to true (1) when undefined for safety
 * - All operations maintain referential integrity within transactions
 */
export interface SiteRepositoryDependencies {
    databaseService: DatabaseService;
}

/**
 * Standard site data defaults for consistency across operations.
 */
const SITE_DEFAULTS = {
    MONITORING: true,
    NAME: "Unnamed Site",
} as const;

/**
 * Common SQL queries to ensure consistency and maintainability.
 */
const SITE_QUERIES = {
    DELETE_ALL: "DELETE FROM sites",
    DELETE_BY_ID: "DELETE FROM sites WHERE identifier = ?",
    INSERT: "INSERT OR IGNORE INTO sites (identifier, name, monitoring) VALUES (?, ?, ?)",
    SELECT_ALL: "SELECT identifier, name, monitoring FROM sites",
    SELECT_BY_ID: "SELECT identifier, name, monitoring FROM sites WHERE identifier = ?",
    UPSERT: "INSERT OR REPLACE INTO sites (identifier, name, monitoring) VALUES (?, ?, ?)",
} as const;

export class SiteRepository {
    private readonly databaseService: DatabaseService;

    constructor(dependencies: SiteRepositoryDependencies) {
        this.databaseService = dependencies.databaseService;
    }

    /**
     * Bulk insert sites (for import functionality).
     * Uses executeTransaction for atomic operation.
     *
     * @param sites - Array of site data to insert
     * @throws Re-throws database errors after logging for upstream handling
     *
     * @remarks
     * Performs bulk insertion with consistent data normalization:
     * - Uses INSERT OR IGNORE to handle conflicts gracefully
     * - Applies standard name and monitoring defaults
     * - Wraps operation in database transaction for atomicity
     */
    public async bulkInsert(sites: SiteRow[]): Promise<void> {
        if (sites.length === 0) {
            return;
        }

        return withDatabaseOperation(
            async () => {
                return this.databaseService.executeTransaction((db) => {
                    this.bulkInsertInternal(db, sites);
                    return Promise.resolve();
                });
            },
            "site-bulk-insert",
            undefined,
            { count: sites.length }
        );
    }

    /**
     * Internal method to bulk insert sites within an existing transaction.
     *
     * @param db - Database connection (must be within active transaction)
     * @param sites - Array of site data to insert
     *
     * @remarks
     * **IMPORTANT**: This method is strictly synchronous and must be called
     * within an existing database transaction context. It uses prepared
     * statements for performance and applies consistent data normalization.
     *
     * **Data Normalization:**
     * - Names: Default to "Unnamed Site" when null/undefined
     * - Monitoring: Default to true when undefined
     * - Uses INSERT OR IGNORE to handle identifier conflicts gracefully
     */
    public bulkInsertInternal(db: Database, sites: SiteRow[]): void {
        if (sites.length === 0) {
            return;
        }

        // Use consistent INSERT OR IGNORE for conflict handling
        const stmt = db.prepare(SITE_QUERIES.INSERT);

        try {
            for (const site of sites) {
                // Apply consistent data normalization
                const name = site.name ?? SITE_DEFAULTS.NAME;
                const monitoring = site.monitoring ?? SITE_DEFAULTS.MONITORING;
                const monitoringValue = monitoring ? 1 : 0;

                stmt.run([site.identifier, name, monitoringValue]);
            }

            logger.debug(`[SiteRepository] Bulk inserted ${sites.length} sites (internal)`);
        } finally {
            stmt.finalize();
        }
    }

    /**
     * Delete a site from the database.
     *
     * @param identifier - Unique site identifier to delete
     * @returns Promise resolving to true if site was deleted, false if not found
     */
    public async delete(identifier: string): Promise<boolean> {
        return withDatabaseOperation(
            async () => {
                return this.databaseService.executeTransaction((db) => {
                    return Promise.resolve(this.deleteInternal(db, identifier));
                });
            },
            "site-delete",
            undefined,
            { identifier }
        );
    }

    /**
     * Clear all sites from the database.
     *
     * @remarks
     * **WARNING**: This operation is irreversible and will delete all site data.
     * Use with caution in production environments.
     */
    public async deleteAll(): Promise<void> {
        return withDatabaseOperation(async () => {
            return this.databaseService.executeTransaction((db) => {
                this.deleteAllInternal(db);
                return Promise.resolve();
            });
        }, "site-delete-all");
    }

    /**
     * Internal method to clear all sites from the database within an existing transaction.
     *
     * @param db - Database connection (must be within active transaction)
     *
     * @remarks
     * **IMPORTANT**: This method must be called within an existing transaction context.
     * It performs a hard delete of all site records.
     */
    public deleteAllInternal(db: Database): void {
        db.run(SITE_QUERIES.DELETE_ALL);
        logger.debug("[SiteRepository] All sites deleted (internal)");
    }

    /**
     * Delete a site from the database (internal version for use within existing transactions).
     *
     * @param db - Database connection (must be within active transaction)
     * @param identifier - Site identifier to delete
     * @returns True if the site was deleted, false if not found
     *
     * @throws Re-throws database errors after logging for upstream handling
     */
    public deleteInternal(db: Database, identifier: string): boolean {
        try {
            const result = db.run(SITE_QUERIES.DELETE_BY_ID, [identifier]);
            const deleted = result.changes > 0;

            if (deleted) {
                logger.debug(`[SiteRepository] Deleted site: ${identifier}`);
            } else {
                logger.warn(`[SiteRepository] Site not found for deletion: ${identifier}`);
            }

            return deleted;
        } catch (error) {
            logger.error(`[SiteRepository] Failed to delete site: ${identifier}`, error);
            throw error;
        }
    }

    /**
     * Check if a site exists by identifier.
     *
     * @param identifier - Site identifier to check
     * @returns Promise resolving to true if site exists, false otherwise
     */
    public async exists(identifier: string): Promise<boolean> {
        return withDatabaseOperation(
            async () => {
                const site = await this.findByIdentifier(identifier);
                return site !== undefined;
            },
            "site-exists",
            undefined,
            { identifier }
        );
    }

    /**
     * Export all sites for backup/import functionality.
     *
     * @returns Promise resolving to array of all site data
     *
     * @remarks
     * Returns raw site data suitable for backup or export operations.
     * Uses consistent query and validation patterns.
     */
    public async exportAll(): Promise<SiteRow[]> {
        return withDatabaseOperation(() => {
            const db = this.getDb();
            const siteRows = db.all(SITE_QUERIES.SELECT_ALL) as Record<string, unknown>[];
            return Promise.resolve(rowsToSites(siteRows));
        }, "site-export-all");
    }

    /**
     * Get all sites from the database (without monitors).
     *
     * @returns Promise resolving to array of all site data
     *
     * @remarks
     * Uses consistent query patterns and validation. Identical to exportAll
     * in functionality but semantically different purpose.
     */
    public async findAll(): Promise<SiteRow[]> {
        return withDatabaseOperation(() => {
            const db = this.getDb();
            const siteRows = db.all(SITE_QUERIES.SELECT_ALL) as Record<string, unknown>[];
            return Promise.resolve(rowsToSites(siteRows));
        }, "find-all-sites");
    }

    /**
     * Find a site by its identifier with resilient error handling.
     *
     * @param identifier - Site identifier to find
     * @returns Promise resolving to site data if found, undefined otherwise
     *
     * @throws Re-throws database errors after logging for upstream handling
     */
    public async findByIdentifier(identifier: string): Promise<SiteRow | undefined> {
        return withDatabaseOperation(
            () => {
                const db = this.getDb();

                try {
                    const siteRow = db.get(SITE_QUERIES.SELECT_BY_ID, [identifier]) as
                        | Record<string, unknown>
                        | undefined;

                    const result: SiteRow | undefined = siteRow ? rowToSite(siteRow) : undefined;
                    return Promise.resolve(result);
                } catch (error) {
                    logger.error(`[SiteRepository] Failed to find site: ${identifier}`, error);
                    throw error instanceof Error ? error : new Error(String(error));
                }
            },
            "site-lookup",
            undefined,
            { identifier }
        );
    }

    /**
     * Create or update a site in the database.
     *
     * @param site - Site data to create or update
     * @throws Re-throws database errors after logging for upstream handling
     *
     * @remarks
     * Uses INSERT OR REPLACE to handle both creation and updates atomically.
     * Applies consistent data normalization with standard defaults.
     */
    public async upsert(site: Pick<SiteRow, "identifier" | "monitoring" | "name">): Promise<void> {
        return withDatabaseOperation(
            () => {
                const db = this.databaseService.getDatabase();
                this.upsertInternal(db, site);
                return Promise.resolve();
            },
            "site-upsert",
            undefined,
            { identifier: site.identifier }
        );
    }

    /**
     * Internal method to create or update a site within an existing transaction.
     *
     * @param db - Database connection (must be within active transaction)
     * @param site - Site data to create or update
     *
     * @remarks
     * **IMPORTANT**: This method must be called within an existing transaction context.
     *
     * **Data Normalization:**
     * - Names: Default to "Unnamed Site" when null/undefined (consistent with bulk operations)
     * - Monitoring: Default to true when undefined (safe default)
     * - Uses INSERT OR REPLACE for atomic upsert operation
     */
    public upsertInternal(db: Database, site: Pick<SiteRow, "identifier" | "monitoring" | "name">): void {
        // Apply consistent data normalization
        const identifier = site.identifier;
        const name = site.name ?? SITE_DEFAULTS.NAME;
        const monitoring = site.monitoring ?? SITE_DEFAULTS.MONITORING;
        const monitoringValue = monitoring ? 1 : 0;

        db.run(SITE_QUERIES.UPSERT, [identifier, name, monitoringValue]);
        logger.debug(`[SiteRepository] Upserted site (internal): ${identifier}`);
    }

    /**
     * Get the database instance for internal operations.
     *
     * @returns Database connection from the DatabaseService
     *
     * @remarks
     * Provides centralized access to the database connection for all repository methods.
     * Used consistently across all query operations.
     */
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }
}
