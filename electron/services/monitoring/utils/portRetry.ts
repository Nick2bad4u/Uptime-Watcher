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
        // maxRetries parameter is "additional retries after first attempt"
        // withOperationalHooks expects "total attempts"
        // So if maxRetries=3, we want 4 total attempts (1 initial + 3 retries)
        const totalAttempts = maxRetries + 1;

        return await withOperationalHooks(() => performSinglePortCheck(host, port, timeout), {
            initialDelay: RETRY_BACKOFF.INITIAL_DELAY,
            maxRetries: totalAttempts,
            operationName: `Port check for ${host}:${port}`,
            ...(isDev() && {
                onRetry: (attempt: number, error: Error) => {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    logger.debug(
                        `[PortMonitor] Port ${host}:${port} failed attempt ${attempt}/${totalAttempts}: ${errorMessage}`
                    );
                },
            }),
        });
    } catch (error) {
        return handlePortCheckError(error, host, port);
    }
}
