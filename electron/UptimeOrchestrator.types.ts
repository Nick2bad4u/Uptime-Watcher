/* V8 ignore start */

/** @internal Runtime marker to satisfy coverage for the pure type module. */
/**
 * Supporting type definitions for {@link UptimeOrchestrator}.
 *
 * @remarks
 * Isolates complex interface declarations to keep the orchestrator module
 * focused on behaviour while still providing rich documentation and type safety
 * for inter-manager communication structures.
 */

import type { Monitor, Site } from "@shared/types";
import type { SiteAddedSource } from "@shared/types/events";

import type { UptimeEvents } from "./events/eventTypes";
import type { DatabaseManager } from "./managers/DatabaseManager";
import type { MonitorManager } from "./managers/MonitorManager";
import type { SiteManager } from "./managers/SiteManager";

export const UPTIME_ORCHESTRATOR_TYPES_RUNTIME_MARKER = true as const;

/**
 * Payload describing a request to check the active monitoring status for a
 * specific monitor.
 */
export interface IsMonitoringActiveRequestData {
    /** Site identifier for the status check. */
    identifier: string;
    /** Specific monitor ID to check. */
    monitorId: string;
}

/**
 * Payload describing a request to restart monitoring for a specific monitor.
 */
export interface RestartMonitoringRequestData {
    /** Site identifier for the restart request. */
    identifier: string;
    /** Monitor configuration for restart. */
    monitor: Monitor;
}

/**
 * Standardized metadata emitted with site-level events.
 */
export interface SiteEventData {
    /** Indicates whether the event was triggered as part of a cascade. */
    cascade?: boolean;
    /** Identifier of the site associated with the event. */
    identifier?: string;
    /** Site state included with the event when available. */
    site?: Site;
    /** Origin of the site addition when relevant. */
    source?: SiteAddedSource;
    /** Timestamp associated with the event. */
    timestamp: number;
    /** Names of fields that were updated prior to emission. */
    updatedFields?: string[];
}

/**
 * Payload describing a request to start monitoring.
 */
export interface StartMonitoringRequestData {
    /** Site identifier for the monitoring request. */
    identifier: string;
    /** Specific monitor ID to start (optional for starting all monitors). */
    monitorId?: string;
}

/**
 * Payload describing a request to stop monitoring.
 */
export interface StopMonitoringRequestData {
    /** Site identifier for the monitoring request. */
    identifier: string;
    /** Specific monitor ID to stop. */
    monitorId: string;
}

/**
 * Payload describing a request to update the in-memory sites cache.
 */
export interface UpdateSitesCacheRequestData {
    /** Updated sites array for cache synchronization. */
    sites: Site[];
}

/**
 * Dependencies required to construct an {@link UptimeOrchestrator} instance.
 */
export interface UptimeOrchestratorDependencies {
    /** Database manager for data persistence operations. */
    databaseManager: DatabaseManager;
    /** Monitor manager for monitoring lifecycle operations. */
    monitorManager: MonitorManager;
    /** Site manager for site management operations. */
    siteManager: SiteManager;
}

/**
 * Combined event interface for the orchestrator, spanning internal and public
 * event channels.
 */
export type OrchestratorEvents = UptimeEvents;

/* V8 ignore end */
