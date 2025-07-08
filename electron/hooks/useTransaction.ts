/**
 * Transaction hook for database operations with logging and error handling.
 * Provides a reusable pattern for database transactions with correlation tracking.
 */

import { Database } from "node-sqlite3-wasm";

import { DatabaseService } from "../services";
import { dbLogger as logger } from "../utils";
import { generateCorrelationId } from "./correlationUtils";

/**
 * Hook for database transaction operations with correlation tracking and logging.
 * Wraps database transactions with consistent error handling and performance monitoring.
 *
 * @returns Function to execute operations within a database transaction
 */
export const useTransaction = () => {
    return async <T>(operation: (db: Database) => Promise<T>): Promise<T> => {
        const correlationId = generateCorrelationId();
        const startTime = Date.now();

        try {
            logger.info(`[Transaction:${correlationId}] Starting transaction`);

            const result = await DatabaseService.getInstance().executeTransaction(operation);

            const duration = Date.now() - startTime;
            logger.info(`[Transaction:${correlationId}] Completed in ${duration}ms`);
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            logger.error(`[Transaction:${correlationId}] Failed after ${duration}ms`, error);
            throw error;
        }
    };
};
