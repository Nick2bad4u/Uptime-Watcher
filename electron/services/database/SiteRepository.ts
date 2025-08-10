import type { Database } from "node-sqlite3-wasm";

import type { SiteRow as DatabaseSiteRow } from "../../../shared/types/database";
import type { DatabaseService } from "./DatabaseService";

import { logger } from "../../utils/logger";
import { withDatabaseOperation } from "../../utils/operationalHooks";
import { rowsToSites, rowToSite, type SiteRow } from "./utils/siteMapper";

/**
 * Defines the dependencies required by the {@link SiteRepository} for managing site data persistence.
 *
 * @remarks
 * Used to inject the {@link DatabaseService} for transactional operations. This interface is used for dependency injection.
 * @public
 */
export interface SiteRepositoryDependencies {
    /**
     * The database service used for transactional operations.
     * @readonly
     */
    databaseService: DatabaseService;
}

/**
 * Standard site data defaults for normalization across repository operations.
 *
 * @remarks
 * Used to ensure consistent fallback values for site properties. This constant is internal to the repository and not exported.
 * @internal
 */
const SITE_DEFAULTS = {
    MONITORING: true,
    NAME: "Unnamed Site",
} as const;

/**
 * Common SQL queries for site persistence operations.
 *
 * @remarks
 * Centralizes query strings for maintainability and consistency. This constant is internal to the repository and not exported.
 * @internal
 */
const SITE_QUERIES = {
    DELETE_ALL: "DELETE FROM sites",
    DELETE_BY_ID: "DELETE FROM sites WHERE identifier = ?",
    INSERT: "INSERT OR IGNORE INTO sites (identifier, name, monitoring) VALUES (?, ?, ?)",
    SELECT_ALL: "SELECT identifier, name, monitoring FROM sites",
    SELECT_BY_ID:
        "SELECT identifier, name, monitoring FROM sites WHERE identifier = ?",
    UPSERT: "INSERT OR REPLACE INTO sites (identifier, name, monitoring) VALUES (?, ?, ?)",
} as const;

/**
 * @public
 * Repository for managing site data persistence.
 *
 * @remarks
 * Handles all CRUD operations for sites in the database using the repository pattern.
 * All mutations are wrapped in transactions for consistency and error handling.
 * Data normalization is applied for site names and monitoring status.
 */
export class SiteRepository {
    /** @internal */
    private readonly databaseService: DatabaseService;

    /**
     * Bulk inserts sites into the database.
     *
     * @remarks
     * - Uses a transaction for atomicity.
     * - Applies default values for missing name or monitoring fields.
     * - Uses `INSERT OR IGNORE` to avoid duplicate identifiers.
     *
     * @param sites - Array of site data to insert.
     * @returns A promise that resolves when all sites are inserted.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * await repo.bulkInsert([{ identifier: "abc", name: "Site", monitoring: true }]);
     * ```
     */
    public async bulkInsert(sites: SiteRow[]): Promise<void> {
        if (sites.length === 0) {
            return;
        }

        await withDatabaseOperation(
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
     * Deletes a site by its identifier.
     *
     * @param identifier - Unique site identifier to delete.
     * @returns Promise resolving to `true` if the site was deleted, `false` if not found.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * const deleted = await repo.delete("site-123");
     * ```
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
     * Deletes all sites from the database.
     *
     * @remarks
     * **WARNING**: This operation is irreversible and will delete all site data.
     *
     * @returns Promise that resolves when all sites are deleted.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * await repo.deleteAll();
     * ```
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
     * Checks if a site exists by its identifier.
     *
     * @param identifier - Site identifier to check.
     * @returns Promise resolving to `true` if the site exists, `false` otherwise.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * const exists = await repo.exists("site-123");
     * ```
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
     * Exports all sites for backup or import functionality.
     *
     * @remarks
     * Returns raw site data suitable for backup or export operations.
     *
     * @returns Promise resolving to an array of all site data.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * const allSites = await repo.exportAll();
     * ```
     */
    public async exportAll(): Promise<SiteRow[]> {
        return withDatabaseOperation(() => {
            const db = this.getDb();
            const siteRows = db.all(
                SITE_QUERIES.SELECT_ALL
            ) as DatabaseSiteRow[];
            return Promise.resolve(rowsToSites(siteRows));
        }, "site-export-all");
    }

    /**
     * Retrieves all sites from the database.
     *
     * @remarks
     * Functionally identical to {@link exportAll}, but intended for general querying.
     *
     * @returns Promise resolving to an array of all site data.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * const sites = await repo.findAll();
     * ```
     */
    public async findAll(): Promise<SiteRow[]> {
        return withDatabaseOperation(() => {
            const db = this.getDb();
            const siteRows = db.all(
                SITE_QUERIES.SELECT_ALL
            ) as DatabaseSiteRow[];
            return Promise.resolve(rowsToSites(siteRows));
        }, "find-all-sites");
    }

    /**
     * Finds a site by its identifier.
     *
     * @param identifier - Site identifier to find.
     * @returns Promise resolving to site data if found, or `undefined` if not found.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * const site = await repo.findByIdentifier("site-123");
     * ```
     */
    public async findByIdentifier(
        identifier: string
    ): Promise<SiteRow | undefined> {
        return withDatabaseOperation(
            () => {
                const db = this.getDb();

                try {
                    const siteRow = db.get(SITE_QUERIES.SELECT_BY_ID, [
                        identifier,
                    ]) as DatabaseSiteRow | undefined;

                    const result: SiteRow | undefined = siteRow
                        ? rowToSite(siteRow)
                        : undefined;
                    return Promise.resolve(result);
                } catch (error) {
                    logger.error(
                        `[SiteRepository] Failed to find site: ${identifier}`,
                        error
                    );
                    throw error instanceof Error
                        ? error
                        : new Error(String(error));
                }
            },
            "site-lookup",
            undefined,
            { identifier }
        );
    }

    /**
     * Creates or updates a site in the database.
     *
     * @remarks
     * - Uses `INSERT OR REPLACE` for atomic upsert.
     * - Normalizes site data before persistence.
     *
     * @param site - Site data to create or update.
     * @returns Promise that resolves when the operation completes.
     * @throws If the database operation fails.
     * @example
     * ```typescript
     * await repo.upsert({ identifier: "site-123", name: "My Site", monitoring: true });
     * ```
     */
    public async upsert(
        site: Pick<SiteRow, "identifier" | "monitoring" | "name">
    ): Promise<void> {
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
     * Constructs a new {@link SiteRepository} instance.
     *
     * @param dependencies - The required dependencies for site operations.
     * @example
     * ```typescript
     * const repo = new SiteRepository({ databaseService });
     * ```
     */
    public constructor(dependencies: SiteRepositoryDependencies) {
        this.databaseService = dependencies.databaseService;
    }

    /**
     * Internal method to bulk insert sites within an existing transaction.
     *
     * @remarks
     * - Must be called within an active transaction context.
     * - Uses prepared statements for performance.
     * - Normalizes site data before insertion.
     *
     * @param db - Database connection (must be within active transaction).
     * @param sites - Array of site data to insert.
     * @returns void
     * @throws {@link Error} When database operations fail.
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

            logger.debug(
                `[SiteRepository] Bulk inserted ${sites.length} sites (internal)`
            );
        } finally {
            stmt.finalize();
        }
    }

    /**
     * Internal method to delete all sites within an existing transaction.
     *
     * @remarks
     * - Must be called within an active transaction context.
     * - Performs a hard delete of all site records.
     *
     * @param db - Database connection (must be within active transaction).
     * @returns void
     */
    public deleteAllInternal(db: Database): void {
        db.run(SITE_QUERIES.DELETE_ALL);
        logger.debug("[SiteRepository] All sites deleted (internal)");
    }

    /**
     * Internal method to delete a site by identifier within an existing transaction.
     *
     * @remarks
     * - Must be called within an active transaction context.
     * - Logs deletion status.
     *
     * @param db - Database connection (must be within active transaction).
     * @param identifier - Site identifier to delete.
     * @returns `true` if the site was deleted, `false` if not found.
     * @throws {@link Error} When database operations fail.
     */
    public deleteInternal(db: Database, identifier: string): boolean {
        try {
            const result = db.run(SITE_QUERIES.DELETE_BY_ID, [identifier]);
            const deleted = result.changes > 0;

            if (deleted) {
                logger.debug(`[SiteRepository] Deleted site: ${identifier}`);
            } else {
                logger.warn(
                    `[SiteRepository] Site not found for deletion: ${identifier}`
                );
            }

            return deleted;
        } catch (error) {
            logger.error(
                `[SiteRepository] Failed to delete site: ${identifier}`,
                error
            );
            throw error;
        }
    }

    /**
     * Creates or updates a site within an existing transaction context.
     *
     * @param db - The database connection (must be within an active transaction).
     * @param site - Site data to create or update.
     * @remarks
     * - Must be called within an active transaction context.
     * - Applies default values for missing fields.
     */
    public upsertInternal(
        db: Database,
        site: Pick<SiteRow, "identifier" | "monitoring" | "name">
    ): void {
        // Apply consistent data normalization
        const { identifier } = site;
        const name = site.name ?? SITE_DEFAULTS.NAME;
        const monitoring = site.monitoring ?? SITE_DEFAULTS.MONITORING;
        const monitoringValue = monitoring ? 1 : 0;

        db.run(SITE_QUERIES.UPSERT, [identifier, name, monitoringValue]);
        logger.debug(
            `[SiteRepository] Upserted site (internal): ${identifier}`
        );
    }

    /**
     * Gets the database instance for internal operations.
     *
     * @returns Database connection from the {@link DatabaseService}.
     * @remarks
     * Used for all direct query operations within the repository.
     */
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }
}
