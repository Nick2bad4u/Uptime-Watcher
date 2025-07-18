/**
 * Database initialization utility.
 * Handles database setup and site loading with proper error handling.
 */

import { UptimeEvents } from "../../events/eventTypes";
import { TypedEventBus } from "../../events/TypedEventBus";
import { DatabaseService } from "../../services/database/DatabaseService";
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
    eventEmitter: TypedEventBus<UptimeEvents>
): Promise<void> {
    try {
        databaseService.initialize();
        await withDbRetry(loadSitesCallback, "loadSites");
    } catch (error) {
        logger.error("Failed to initialize database", error);
        await eventEmitter.emitTyped("database:error", {
            details: "Failed to initialize database",
            error: error instanceof Error ? error : new Error(String(error)),
            operation: "initialize-database",
            timestamp: Date.now(),
        });
        // Don't re-throw the error - let it be handled via the event system
    }
}
