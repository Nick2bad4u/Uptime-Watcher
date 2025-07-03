/**
 * Database initialization utility.
 * Handles database setup and site loading with proper error handling.
 */

import { EventEmitter } from "events";

import { DatabaseService } from "../../services/database";
import { monitorLogger as logger } from "../logger";
import { withDbRetry } from "../retry";

/**
 * Initialize the database and load sites.
 * @param databaseService - The database service instance
 * @param loadSitesCallback - Callback function to load sites
 * @param eventEmitter - Event emitter for error handling
 */
export async function initDatabase(
    databaseService: DatabaseService,
    loadSitesCallback: () => Promise<void>,
    eventEmitter: EventEmitter
): Promise<void> {
    try {
        await databaseService.initialize();
        await withDbRetry(loadSitesCallback, "loadSites");
    } catch (error) {
        logger.error("Failed to initialize database", error);
        eventEmitter.emit("db-error", { error, operation: "initDatabase" });
        // Don't re-throw the error - let it be handled via the event system
    }
}
