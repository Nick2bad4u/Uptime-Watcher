/**
 * Factory functions for creating services with proper dependency injection.
 *
 * @remarks
 * Provides factory functions and adapter classes for creating database services
 * with standardized configurations. Includes logger adapters and cache factory
 * functions for consistent service instantiation across the application.
 *
 * @packageDocumentation
 */

import type { Site } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import { CACHE_CONFIG, CACHE_NAMES } from "@shared/constants/cacheConfig";

import { StandardizedCache } from "../../utils/cache/StandardizedCache";

/**
 * Adapter for the logger to implement Logger interface.
 *
 * Adapts the monitorLogger instance to match the Logger interface required by
 * database services, providing a consistent logging interface across different
 * components while maintaining type safety.
 *
 * @see {@link Logger} for the interface this class implements
 */
export class LoggerAdapter implements Logger {
    private readonly logger: Logger;

    public constructor(logger: Logger) {
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
 * Creates a temporary cache instance optimized for site operations with
 * appropriate TTL and size limits for temporary data storage. Statistics are
 * disabled for performance in temporary use cases.
 *
 * @returns New StandardizedCache instance configured for temporary site storage
 */
export function createSiteCache(): StandardizedCache<Site> {
    return new StandardizedCache<Site>({
        ...CACHE_CONFIG.TEMPORARY,
        name: CACHE_NAMES.temporary("sites"),
    });
}
