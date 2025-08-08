/**
 * Database initialization utility.
 * Handles database setup and site loading with proper error handling.
 */

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { DatabaseService } from "../../services/database/DatabaseService";

import { monitorLogger as logger } from "../logger";
import { withDatabaseOperation } from "../operationalHooks";

/**
 * Initialize the database and load sites.
 *
 * Handles database setup and site loading with proper error handling.
 * Errors are emitted via the event bus and re-thrown following project guidelines.
 *
 * @param databaseService - The database service instance
 * @param loadSitesCallback - Callback function to load sites
 * @param eventEmitter - Event emitter for error handling
 * @throws Will re-throw any errors after logging and emitting events
 */
export async function initDatabase(
    databaseService: DatabaseService,
    loadSitesCallback: () => Promise<void>,
    eventEmitter: TypedEventBus<UptimeEvents>
): Promise<void> {
    try {
        databaseService.initialize();
        await withDatabaseOperation(
            loadSitesCallback,
            "loadSites",
            eventEmitter
        );
    } catch (error) {
        logger.error("Failed to initialize database", error);
        await eventEmitter.emitTyped("database:error", {
            details: "Failed to initialize database",
            error: error instanceof Error ? error : new Error(String(error)),
            operation: "initialize-database",
            timestamp: Date.now(),
        });
        // Re-throw error following project guidelines for proper error handling
        throw error;
    }
}
