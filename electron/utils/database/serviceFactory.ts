/**
 * Factory functions to create services with proper dependency injection.
 */

import type { Site } from "../../../shared/types";
import type { monitorLogger } from "../logger";

import { StandardizedCache } from "../cache/StandardizedCache";

/**
 * Adapter for the logger to implement Logger interface.
 *
 * Adapts the monitorLogger instance to match the Logger interface required
 * by database services, providing a consistent logging interface across
 * different components while maintaining type safety.
 *
 * @see {@link Logger} for the interface this class implements
 */
export class LoggerAdapter {
    private readonly logger: typeof monitorLogger;

    public constructor(logger: typeof monitorLogger) {
        this.logger = logger;
    }

    public debug(message: string, ...args: unknown[]): void {
        this.logger.debug(message, ...args);
    }

    public error(message: string, error?: unknown, ...args: unknown[]): void {
        this.logger.error(message, error, ...args);
    }

    public info(message: string, ...args: unknown[]): void {
        this.logger.info(message, ...args);
    }

    public warn(message: string, ...args: unknown[]): void {
        this.logger.warn(message, ...args);
    }
}

/**
 * Factory function to create a standardized site cache.
 *
 * Creates a temporary cache instance optimized for site operations
 * with appropriate TTL and size limits for temporary data storage.
 * Statistics are disabled for performance in temporary use cases.
 *
 * @returns New StandardizedCache instance configured for temporary site storage
 */
export function createSiteCache(): StandardizedCache<Site> {
    return new StandardizedCache<Site>({
        defaultTTL: 300_000, // 5 minutes for temporary operations
        enableStats: false, // Disabled for performance in temporary caches
        maxSize: 1000,
        name: "temporary-sites",
    });
}
