import { Database } from "node-sqlite3-wasm";

import { Site } from "../../types";
import { logger, withDatabaseOperation } from "../../utils/index";
import { DatabaseService } from "./DatabaseService";
import { HistoryRepository } from "./HistoryRepository";
import { MonitorRepository } from "./MonitorRepository";

/**
 * Repository for managing site data persistence.
 * Handles CRUD operations for sites in the database.
 */
export class SiteRepository {
    private readonly databaseService: DatabaseService;
    private readonly monitorRepository: MonitorRepository;
    private readonly historyRepository: HistoryRepository;

    constructor() {
        this.databaseService = DatabaseService.getInstance();
        this.monitorRepository = new MonitorRepository();
        this.historyRepository = new HistoryRepository();
    }

    /**
     * Get the database instance.
     */
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }

    /**
     * Get all sites from the database (without monitors).
     */
    public async findAll(): Promise<
        { identifier: string; name?: string | undefined; monitoring?: boolean | undefined }[]
    > {
        // eslint-disable-next-line @typescript-eslint/require-await
        return withDatabaseOperation(async () => {
            const db = this.getDb();
            const siteRows = db.all("SELECT identifier, name, monitoring FROM sites") as {
                identifier: string;
                name?: string;
                monitoring?: number;
            }[];
            return siteRows.map((row) => ({
                identifier: String(row.identifier),
                ...(row.name !== undefined && { name: String(row.name) }),
                ...(row.monitoring !== undefined && { monitoring: Boolean(row.monitoring) }),
            }));
        }, "find-all-sites");
    }

    /**
     * Find a site by its identifier with resilient error handling.
     */
    public async findByIdentifier(
        identifier: string
    ): Promise<{ identifier: string; name?: string | undefined; monitoring?: boolean | undefined } | undefined> {
        return withDatabaseOperation(
            async () => {
                const db = this.getDb();

                return new Promise<
                    { identifier: string; name?: string | undefined; monitoring?: boolean | undefined } | undefined
                >((resolve, reject) => {
                    try {
                        const siteRow = db.get("SELECT identifier, name, monitoring FROM sites WHERE identifier = ?", [
                            identifier,
                        ]) as { identifier: string; name?: string; monitoring?: number } | undefined;

                        if (!siteRow) {
                            resolve(
                                undefined as
                                    | {
                                          identifier: string;
                                          name?: string | undefined;
                                          monitoring?: boolean | undefined;
                                      }
                                    | undefined
                            );
                            return;
                        }

                        resolve({
                            identifier: String(siteRow.identifier),
                            ...(siteRow.name !== undefined && { name: String(siteRow.name) }),
                            ...(siteRow.monitoring !== undefined && { monitoring: Boolean(siteRow.monitoring) }),
                        });
                    } catch (error) {
                        reject(error instanceof Error ? error : new Error(String(error)));
                    }
                });
            },
            "site-lookup",
            undefined,
            { identifier }
        );
    }

    /**
     * Get a complete site by identifier with monitors and history.
     * This method returns a full Site object including all monitors and their history.
     */
    public async getByIdentifier(identifier: string): Promise<Site | undefined> {
        try {
            const siteRow = await this.findByIdentifier(identifier);
            if (!siteRow) {
                return undefined;
            }

            // Fetch monitors for this site
            const monitors = await this.monitorRepository.findBySiteIdentifier(siteRow.identifier);

            // Load history for each monitor
            for (const monitor of monitors) {
                if (monitor.id) {
                    monitor.history = await this.historyRepository.findByMonitorId(monitor.id);
                }
            }

            const site: Site = {
                identifier: siteRow.identifier,
                name: siteRow.name ?? "Unnamed Site",
                monitors: monitors,
                monitoring: siteRow.monitoring ?? true, // Default to true if not set
            };

            return site;
        } catch (error) {
            logger.error(`[SiteRepository] Failed to fetch complete site with identifier: ${identifier}`, error);
            throw error;
        }
    }

    /**
     * Create or update a site in the database.
     */
    public async upsert(site: Pick<Site, "identifier" | "name" | "monitoring">): Promise<void> {
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
     * Use this method when you're already within a transaction context.
     */
    public upsertInternal(db: Database, site: Pick<Site, "identifier" | "name" | "monitoring">): void {
        // Ensure all values are valid for SQLite
        const identifier = site.identifier || ""; // Fallback for undefined/empty identifier
        const name = site.name || "Unnamed Site"; // Fallback for undefined/empty name
        const monitoring = site.monitoring ? 1 : 0; // Convert boolean to integer

        db.run("INSERT OR REPLACE INTO sites (identifier, name, monitoring) VALUES (?, ?, ?)", [
            identifier,
            name,
            monitoring,
        ]);
        logger.debug(`[SiteRepository] Upserted site (internal): ${identifier}`);
    }

    /**
     * Delete a site from the database.
     */
    public async delete(identifier: string): Promise<boolean> {
        return withDatabaseOperation(
            () => {
                const db = this.databaseService.getDatabase();
                const result = this.deleteInternal(db, identifier);
                return Promise.resolve(result);
            },
            "site-delete",
            undefined,
            { identifier }
        );
    }

    /**
     * Delete a site from the database (internal version for use within existing transactions).
     * @param db - Database connection
     * @param identifier - Site identifier
     * @returns boolean indicating if the site was deleted
     */
    public deleteInternal(db: Database, identifier: string): boolean {
        try {
            const result = db.run("DELETE FROM sites WHERE identifier = ?", [identifier]);
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
     */
    public async exists(identifier: string): Promise<boolean> {
        try {
            const site = await this.findByIdentifier(identifier);
            return site !== undefined;
        } catch (error) {
            logger.error(`[SiteRepository] Failed to check if site exists: ${identifier}`, error);
            throw error;
        }
    }

    /**
     * Export all sites for backup/import functionality.
     */
    public exportAll(): { identifier: string; name?: string | undefined; monitoring?: boolean | undefined }[] {
        try {
            const db = this.getDb();
            const sites = db.all("SELECT identifier, name, monitoring FROM sites");
            return sites.map((row) => ({
                identifier: row.identifier ? String(row.identifier) : "",
                ...(row.name !== undefined && { name: String(row.name) }),
                ...(row.monitoring !== undefined && { monitoring: Boolean(row.monitoring) }),
            }));
        } catch (error) {
            logger.error("[SiteRepository] Failed to export sites", error);
            throw error;
        }
    }

    /**
     * Clear all sites from the database.
     */
    public async deleteAll(): Promise<void> {
        return withDatabaseOperation(() => {
            const db = this.databaseService.getDatabase();
            this.deleteAllInternal(db);
            return Promise.resolve();
        }, "site-delete-all");
    }

    /**
     * Internal method to clear all sites from the database within an existing transaction.
     * Use this method when you're already within a transaction context.
     */
    public deleteAllInternal(db: Database): void {
        db.run("DELETE FROM sites");
        logger.debug("[SiteRepository] All sites deleted (internal)");
    }

    /**
     * Bulk insert sites (for import functionality).
     * Uses executeTransaction for atomic operation.
     */
    public async bulkInsert(
        sites: { identifier: string; name?: string | undefined; monitoring?: boolean | undefined }[]
    ): Promise<void> {
        if (sites.length === 0) {
            return;
        }

        return withDatabaseOperation(
            () => {
                const db = this.databaseService.getDatabase();
                this.bulkInsertInternal(db, sites);
                return Promise.resolve();
            },
            "site-bulk-insert",
            undefined,
            { count: sites.length }
        );
    }

    /**
     * Internal method to bulk insert sites within an existing transaction.
     * Use this method when you're already within a transaction context.
     */
    public bulkInsertInternal(
        db: Database,
        sites: { identifier: string; name?: string | undefined; monitoring?: boolean | undefined }[]
    ): void {
        if (sites.length === 0) {
            return;
        }

        // Prepare the statement once for better performance
        const stmt = db.prepare("INSERT INTO sites (identifier, name, monitoring) VALUES (?, ?, ?)");

        try {
            for (const site of sites) {
                // Convert monitoring boolean to SQLite integer
                let monitoringValue = 1; // Default to true (1) if not specified
                if (site.monitoring !== undefined) {
                    monitoringValue = site.monitoring ? 1 : 0;
                }

                stmt.run([site.identifier, site.name ?? null, monitoringValue]);
            }

            logger.debug(`[SiteRepository] Bulk inserted ${sites.length} sites (internal)`);
        } finally {
            stmt.finalize();
        }
    }
}
