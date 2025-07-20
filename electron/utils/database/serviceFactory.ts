/**
 * Factory functions to create services with proper dependency injection.
 */

import { Site } from "../../types";
import { StandardizedCache } from "../cache/StandardizedCache";
import { monitorLogger } from "../logger";

/**
 * Adapter for the logger to implement Logger interface.
 */
export class LoggerAdapter {
    private readonly logger: typeof monitorLogger;

    constructor(logger: typeof monitorLogger) {
        this.logger = logger;
    }

    debug(message: string, ...args: unknown[]): void {
        this.logger.debug(message, ...args);
    }

    error(message: string, error?: unknown, ...args: unknown[]): void {
        this.logger.error(message, error, ...args);
    }

    info(message: string, ...args: unknown[]): void {
        this.logger.info(message, ...args);
    }

    warn(message: string, ...args: unknown[]): void {
        this.logger.warn(message, ...args);
    }
}

/**
 * Factory function to create a standardized site cache.
 *
 * @returns New StandardizedCache instance configured for temporary use
 */
export function createSiteCache(): StandardizedCache<Site> {
    return new StandardizedCache<Site>({
        defaultTTL: 300_000, // 5 minutes for temporary operations
        enableStats: false, // No need for stats in temporary caches
        maxSize: 1000,
        name: "temporary-sites",
    });
}
