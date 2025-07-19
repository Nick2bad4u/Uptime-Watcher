import { RETRY_BACKOFF } from "../../../constants";
import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";
import { withOperationalHooks } from "../../../utils/operationalHooks";
import { MonitorCheckResult } from "../types";
import { performSinglePortCheck } from "./portChecker";
import { handlePortCheckError } from "./portErrorHandling";

/**
 * Utility functions for performing port checks with retry logic.
 */

/**
 * Perform port check with retry logic.
 */
export async function performPortCheckWithRetry(
    host: string,
    port: number,
    timeout: number,
    maxRetries: number
): Promise<MonitorCheckResult> {
    try {
        // DEBUG: Log the maxRetries value to understand the issue
        logger.debug(`[PortRetry] performPortCheckWithRetry called with maxRetries=${maxRetries} for ${host}:${port}`);

        // maxRetries parameter is "additional retries after first attempt"
        // withOperationalHooks expects "total attempts"
        // So if maxRetries=3, we want 4 total attempts (1 initial + 3 retries)
        const totalAttempts = maxRetries + 1;

        logger.debug(
            `[PortRetry] Converted maxRetries=${maxRetries} to totalAttempts=${totalAttempts} for ${host}:${port}`
        );

        return await withOperationalHooks(() => performSinglePortCheck(host, port, timeout), {
            initialDelay: RETRY_BACKOFF.INITIAL_DELAY,
            maxRetries: totalAttempts,
            onRetry: isDev()
                ? (attempt, error) => {
                      const errorMessage = error instanceof Error ? error.message : String(error);
                      logger.debug(
                          `[PortMonitor] Port ${host}:${port} failed attempt ${attempt}/${totalAttempts}: ${errorMessage}`
                      );
                  }
                : undefined,
            operationName: `Port check for ${host}:${port}`,
        });
    } catch (error) {
        return handlePortCheckError(error, host, port);
    }
}
