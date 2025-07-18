import { Database } from "node-sqlite3-wasm";

import { Site } from "../../types";
import { logger } from "../../utils/logger";
import { withDatabaseOperation } from "../../utils/operationalHooks";
import { DatabaseService } from "./DatabaseService";
import { HistoryRepository } from "./HistoryRepository";
import { MonitorRepository } from "./MonitorRepository";
import { rowsToSites, rowToSite, type SiteRow } from "./utils/siteMapper";

/**
 * Repository for managing site data persistence.
 * Handles CRUD operations for sites in the database.
 */
export class SiteRepository {
    private readonly databaseService: DatabaseService;
    private readonly historyRepository: HistoryRepository;
    private readonly monitorRepository: MonitorRepository;

    constructor() {
        this.databaseService = DatabaseService.getInstance();
        this.monitorRepository = new MonitorRepository();
        this.historyRepository = new HistoryRepository();
    }

    /**
     * Bulk insert sites (for import functionality).
     * Uses executeTransaction for atomic operation.
     */
    public async bulkInsert(sites: SiteRow[]): Promise<void> {
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
    public bulkInsertInternal(db: Database, sites: SiteRow[]): void {
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
     */
    public async exportAll(): Promise<SiteRow[]> {
        return withDatabaseOperation(() => {
            const db = this.getDb();
            const sites = db.all("SELECT identifier, name, monitoring FROM sites") as Record<string, unknown>[];
            return Promise.resolve(rowsToSites(sites));
        }, "site-export-all");
    }

    /**
     * Get all sites from the database (without monitors).
     */
    public async findAll(): Promise<SiteRow[]> {
        // eslint-disable-next-line @typescript-eslint/require-await
        return withDatabaseOperation(async () => {
            const db = this.getDb();
            const siteRows = db.all("SELECT identifier, name, monitoring FROM sites") as Record<string, unknown>[];
            return rowsToSites(siteRows);
        }, "find-all-sites");
    }

    /**
     * Find a site by its identifier with resilient error handling.
     */
    public async findByIdentifier(identifier: string): Promise<SiteRow | undefined> {
        return withDatabaseOperation(
            async () => {
                const db = this.getDb();

                return new Promise<SiteRow | undefined>((resolve, reject) => {
                    try {
                        const siteRow = db.get("SELECT identifier, name, monitoring FROM sites WHERE identifier = ?", [
                            identifier,
                        ]) as Record<string, unknown> | undefined;

                        if (!siteRow) {
                            resolve(undefined as SiteRow | undefined);
                            return;
                        }

                        resolve(rowToSite(siteRow));
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
        return withDatabaseOperation(
            async () => {
                const siteRow = await this.findByIdentifier(identifier);
                if (!siteRow) {
                    return;
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
                    monitoring: siteRow.monitoring ?? true, // Default to true if not set
                    monitors: monitors,
                    name: siteRow.name ?? "Unnamed Site",
                };

                return site;
            },
            "site-get-by-identifier",
            undefined,
            { identifier }
        );
    }

    /**
     * Create or update a site in the database.
     */
    public async upsert(site: Pick<Site, "identifier" | "monitoring" | "name">): Promise<void> {
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
    public upsertInternal(db: Database, site: Pick<Site, "identifier" | "monitoring" | "name">): void {
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
     * Get the database instance.
     */
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }
}
