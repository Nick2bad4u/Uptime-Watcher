import { RETRY_BACKOFF } from "../../../constants";
import { isDev } from "../../../electronUtils";
import { logger, withRetry } from "../../../utils/index";
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
    // Convert maxRetries (additional attempts) to totalAttempts for withRetry utility
    const totalAttempts = maxRetries + 1;

    return withRetry(() => performSinglePortCheck(host, port, timeout), {
        delayMs: RETRY_BACKOFF.INITIAL_DELAY,
        maxRetries: totalAttempts,
        onError: (error, attempt) => {
            if (isDev()) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger.debug(
                    `[PortMonitor] Port ${host}:${port} failed attempt ${attempt}/${totalAttempts}: ${errorMessage}`
                );
            }
        },
        operationName: `Port check for ${host}:${port}`,
    }).catch((error) => handlePortCheckError(error, host, port));
}
