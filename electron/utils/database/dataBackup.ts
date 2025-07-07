import { UptimeEvents } from "../../events/eventTypes";
import { TypedEventBus } from "../../events/TypedEventBus";
import { DatabaseService } from "../../services/database/DatabaseService";
import { Site } from "../../types";
import { monitorLogger as logger } from "../logger";

/**
 * Dependencies required for data backup operations.
 */
export interface DataBackupDependencies {
    databaseService: DatabaseService;
    eventEmitter: TypedEventBus<UptimeEvents>;
}

/**
 * Callbacks for operations that need to be handled by the main class.
 */
export interface DataBackupCallbacks {
    getSitesFromCache: () => Site[];
    loadSites: () => Promise<void>;
}

/**
 * Download SQLite database backup.
 */
export async function downloadBackup(deps: DataBackupDependencies): Promise<{ buffer: Buffer; fileName: string }> {
    try {
        return await deps.databaseService.downloadBackup();
    } catch (error) {
        logger.error("Failed to download backup", error);
        await deps.eventEmitter.emitTyped("database:error", {
            details: "Failed to download backup",
            error: error instanceof Error ? error : new Error(String(error)),
            operation: "download-backup",
            timestamp: Date.now(),
        });
        throw error;
    }
}

/**
 * Refresh sites from database and update in-memory cache.
 * Use this when you need to reload the in-memory cache from database.
 */
export async function refreshSites(callbacks: DataBackupCallbacks): Promise<Site[]> {
    try {
        await callbacks.loadSites();
        return callbacks.getSitesFromCache();
    } catch (error) {
        logger.error("Failed to refresh sites from database", error);
        throw error;
    }
}
