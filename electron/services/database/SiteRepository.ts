import { Database } from "node-sqlite3-wasm";

import { Site } from "../../types";
import { logger } from "../../utils/index";
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
     * Find a site by its identifier.
     */
    public findByIdentifier(identifier: string): { identifier: string; name?: string | undefined; monitoring?: boolean | undefined } | undefined {
        try {
            const db = this.getDb();
            const siteRow = db.get("SELECT identifier, name, monitoring FROM sites WHERE identifier = ?", [identifier]) as
                | { identifier: string; name?: string; monitoring?: number }
                | undefined;

            if (!siteRow) {
                return undefined;
            }

            return {
                identifier: String(siteRow.identifier),
                ...(siteRow.name !== undefined && { name: String(siteRow.name) }),
                ...(siteRow.monitoring !== undefined && { monitoring: Boolean(siteRow.monitoring) }),
            };
        } catch (error) {
            logger.error(`[SiteRepository] Failed to fetch site with identifier: ${identifier}`, error);
            throw error;
        }
    }

    /**
     * Get a complete site by identifier with monitors and history.
     * This method returns a full Site object including all monitors and their history.
     */
    public getByIdentifier(identifier: string): Site | undefined {
        try {
            const siteRow = this.findByIdentifier(identifier);
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
    public upsert(site: Pick<Site, "identifier" | "name" | "monitoring">): void {
        try {
            const db = this.getDb();
            db.run("INSERT OR REPLACE INTO sites (identifier, name, monitoring) VALUES (?, ?, ?)", [
                site.identifier,
                site.name,
                site.monitoring ? 1 : 0, // Convert boolean to integer for SQLite
            ]);
            logger.debug(`[SiteRepository] Upserted site: ${site.identifier}`);
        } catch (error) {
            logger.error(`[SiteRepository] Failed to upsert site: ${site.identifier}`, error);
            throw error;
        }
    }

    /**
     * Delete a site from the database.
     */
    public delete(identifier: string): boolean {
        try {
            const db = this.getDb();
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
    public exists(identifier: string): boolean {
        try {
            const site = this.findByIdentifier(identifier);
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
    public deleteAll(): void {
        try {
            const db = this.getDb();
            db.run("DELETE FROM sites");
            logger.info("[SiteRepository] All sites deleted");
        } catch (error) {
            logger.error("[SiteRepository] Failed to delete all sites", error);
            throw error;
        }
    }

    /**
     * Bulk insert sites (for import functionality).
     * Uses a prepared statement and transaction for better performance.
     */
    public bulkInsert(sites: { identifier: string; name?: string | undefined; monitoring?: boolean | undefined }[]): void {
        if (sites.length === 0) {
            return;
        }

        try {
            const db = this.getDb();

            // Use a transaction for bulk operations
            db.run("BEGIN TRANSACTION");

            // Prepare the statement once for better performance
            const stmt = db.prepare("INSERT INTO sites (identifier, name, monitoring) VALUES (?, ?, ?)");

            try {
                for (const site of sites) {
                    // Convert monitoring boolean to SQLite integer
                    let monitoringValue = 1; // Default to true (1) if not specified
                    if (site.monitoring !== undefined) {
                        monitoringValue = site.monitoring ? 1 : 0;
                    }
                    
                    stmt.run([
                        site.identifier, 
                        site.name ?? null,
                        monitoringValue
                    ]);
                }

                db.run("COMMIT");
                logger.info(`[SiteRepository] Bulk inserted ${sites.length} sites`);
            } catch (error) {
                db.run("ROLLBACK");
                throw error;
            } finally {
                stmt.finalize();
            }
        } catch (error) {
            logger.error("[SiteRepository] Failed to bulk insert sites", error);
            throw error;
        }
    }
}
