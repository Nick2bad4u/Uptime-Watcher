/**
 * Interfaces for database utilities to support dependency injection and testing.
 */

import { UptimeEvents } from "../../events/eventTypes";
import { TypedEventBus } from "../../events/TypedEventBus";
import { HistoryRepository } from "../../services/database/HistoryRepository";
import { MonitorRepository } from "../../services/database/MonitorRepository";
import { SettingsRepository } from "../../services/database/SettingsRepository";
import { SiteRepository } from "../../services/database/SiteRepository";
import { Site } from "../../types";
import { type Logger } from "../interfaces";

// Re-export Logger for database services
export type { Logger } from "../interfaces";

/**
 * Configuration for monitoring operations.
 */
export interface MonitoringConfig {
    /** Function to set history limit */
    setHistoryLimit: (limit: number) => void;
    /** Function to setup new monitors for a site */
    setupNewMonitors: (site: Site, newMonitorIds: string[]) => Promise<void>;
    /** Function to start monitoring for a site/monitor */
    startMonitoring: (
        identifier: string,
        monitorId: string
    ) => Promise<boolean>;
    /** Function to stop monitoring for a site/monitor */
    stopMonitoring: (identifier: string, monitorId: string) => Promise<boolean>;
}

/**
 * Configuration for site loading operations.
 */
export interface SiteLoadingConfig {
    /** Typed event emitter for error handling */
    eventEmitter: TypedEventBus<UptimeEvents>;
    /** Logger instance */
    logger: Logger;
    /** Repository dependencies */
    repositories: {
        history: HistoryRepository;
        monitor: MonitorRepository;
        settings: SettingsRepository;
        site: SiteRepository;
    };
}

/**
 * Configuration for site writing operations.
 */
export interface SiteWritingConfig {
    /** Logger instance */
    logger: Logger;
    /** Repository dependencies */
    repositories: {
        monitor: MonitorRepository;
        site: SiteRepository;
    };
}

/**
 * Custom error for site loading operations.
 *
 * Provides enhanced error context and stack trace preservation for site loading failures.
 */
export class SiteLoadingError extends Error {
    /**
     * Create a new SiteLoadingError.
     *
     * @param message - Descriptive error message
     * @param cause - Optional underlying error that caused this failure
     */
    constructor(message: string, cause?: Error) {
        super(`Failed to load sites: ${message}`);
        this.name = "SiteLoadingError";
        if (cause?.stack) {
            // Preserve both stack traces for better debugging
            this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
        }
    }
}

/**
 * Custom error types for better error handling.
 */

/**
 * Custom error for site not found scenarios.
 *
 * Thrown when attempting to access a site that doesn't exist in the system.
 */
export class SiteNotFoundError extends Error {
    /**
     * Create a new SiteNotFoundError.
     *
     * @param identifier - The site identifier that was not found
     */
    constructor(identifier: string) {
        super(`Site not found: ${identifier}`);
        this.name = "SiteNotFoundError";
    }
}
