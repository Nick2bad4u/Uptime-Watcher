/**
 * Database initialization utility for setup and site loading.
 *
 * @remarks
 * Handles database setup and site loading with proper error handling, event
 * emission, and transaction management. Provides a centralized initialization
 * flow with comprehensive error recovery and logging.
 *
 * @packageDocumentation
 */

import { ensureError } from "@shared/utils/errorHandling";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { DatabaseService } from "./DatabaseService";

import { toSerializedError } from "../../utils/errorSerialization";
import { monitorLogger as logger } from "../../utils/logger";
import { withDatabaseOperation } from "../../utils/operationalHooks";

/**
 * Initialize the database and load sites.
 *
 * Handles database setup and site loading with proper error handling. Errors
 * are emitted via the event bus and re-thrown following project guidelines.
 *
 * @param databaseService - The database service instance
 * @param loadSitesCallback - Callback function to load sites
 * @param eventEmitter - Event emitter for error handling
 *
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
        const normalizedError = ensureError(error);
        logger.error("Failed to initialize database", normalizedError);

        try {
            await eventEmitter.emitTyped("database:error", {
                details: "Failed to initialize database",
                error: toSerializedError(normalizedError),
                operation: "initialize-database",
                timestamp: Date.now(),
            });
        } catch (emitError: unknown) {
            logger.warn(
                "Failed to emit database initialization error event",
                ensureError(emitError)
            );
        }
        throw normalizedError;
    }
}
