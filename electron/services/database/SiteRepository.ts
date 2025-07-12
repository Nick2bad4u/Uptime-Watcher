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
    public findAll(): { identifier: string; name?: string | undefined; monitoring?: boolean | undefined }[] {
        try {
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
        } catch (error) {
            logger.error("[SiteRepository] Failed to fetch all sites", error);
            throw error;
        }
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
                
                return new Promise<{ identifier: string; name?: string | undefined; monitoring?: boolean | undefined } | undefined>((resolve, reject) => {
                    try {
                        const siteRow = db.get("SELECT identifier, name, monitoring FROM sites WHERE identifier = ?", [
                            identifier,
                        ]) as { identifier: string; name?: string; monitoring?: number } | undefined;

                        if (!siteRow) {
                            resolve(undefined as { identifier: string; name?: string | undefined; monitoring?: boolean | undefined } | undefined);
                            return;
                        }

                        resolve({
                            identifier: String(siteRow.identifier),
                            ...(siteRow.name !== undefined && { name: String(siteRow.name) }),
                            ...(siteRow.monitoring !== undefined && { monitoring: Boolean(siteRow.monitoring) }),
                        });
                    } catch (error) {
                        reject(error);
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
            const monitors = this.monitorRepository.findBySiteIdentifier(siteRow.identifier);

            // Load history for each monitor
            for (const monitor of monitors) {
                if (monitor.id) {
                    monitor.history = this.historyRepository.findByMonitorId(monitor.id);
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
        try {
            await this.databaseService.executeTransaction((db) => {
                // Ensure all values are valid for SQLite
                const identifier = site.identifier || ""; // Fallback for undefined/empty identifier
                const name = site.name || "Unnamed Site"; // Fallback for undefined/empty name
                const monitoring = site.monitoring ? 1 : 0; // Convert boolean to integer
                
                db.run("INSERT OR REPLACE INTO sites (identifier, name, monitoring) VALUES (?, ?, ?)", [
                    identifier,
                    name,
                    monitoring,
                ]);
                logger.debug(`[SiteRepository] Upserted site: ${identifier}`);
                return Promise.resolve();
            });
        } catch (error) {
            logger.error(`[SiteRepository] Failed to upsert site: ${site.identifier}`, error);
            throw error;
        }
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
        try {
            return await this.databaseService.executeTransaction((db) => {
                const result = db.run("DELETE FROM sites WHERE identifier = ?", [identifier]);
                const deleted = result.changes > 0;

                if (deleted) {
                    logger.debug(`[SiteRepository] Deleted site: ${identifier}`);
                } else {
                    logger.warn(`[SiteRepository] Site not found for deletion: ${identifier}`);
                }

                return Promise.resolve(deleted);
            });
        } catch (error) {
            logger.error(`[SiteRepository] Failed to delete site: ${identifier}`, error);
            throw error;
        }
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
        try {
            await this.databaseService.executeTransaction((db) => {
                db.run("DELETE FROM sites");
                logger.info("[SiteRepository] All sites deleted");
                return Promise.resolve();
            });
        } catch (error) {
            logger.error("[SiteRepository] Failed to delete all sites", error);
            throw error;
        }
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

        try {
            await this.databaseService.executeTransaction((db) => {
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

                    logger.info(`[SiteRepository] Bulk inserted ${sites.length} sites`);
                } finally {
                    stmt.finalize();
                }

                return Promise.resolve();
            });
        } catch (error) {
            logger.error("[SiteRepository] Failed to bulk insert sites", error);
            throw error;
        }
    }
}
