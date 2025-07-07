/**
 * Retry hook for resilient operation execution with backoff strategies.
 * Provides configurable retry logic with correlation tracking and logging.
 */

import { monitorLogger as logger } from "../utils/logger";
import { generateCorrelationId } from "./correlationUtils";

export interface RetryOptions {
    maxAttempts: number;
    delay: number;
    backoff?: "linear" | "exponential";
}

/**
 * Hook for retry logic with configurable backoff strategies.
 * Provides consistent retry behavior with correlation tracking and logging.
 *
 * @returns Function to execute operations with retry logic
 */
export const useRetry = () => {
    return async <T>(operation: () => Promise<T>, options: RetryOptions): Promise<T> => {
        const correlationId = generateCorrelationId();

        for (const attempt of Array.from({ length: options.maxAttempts }, (_, i) => i + 1)) {
            try {
                logger.debug(`[Retry:${correlationId}] Attempt ${attempt}/${options.maxAttempts}`);
                return await operation();
            } catch (error) {
                if (attempt === options.maxAttempts) {
                    logger.error(`[Retry:${correlationId}] Failed after ${attempt} attempts`, error);
                    throw error;
                }

                const delay =
                    options.backoff === "exponential" ? options.delay * Math.pow(2, attempt - 1) : options.delay;

                logger.debug(`[Retry:${correlationId}] Attempt ${attempt} failed, retrying in ${delay}ms`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        throw new Error("Retry loop completed without success");
    };
};
