import type { Site } from "@shared/types";

/**
 * Represents a temporary optimistic lock applied to a monitor's monitoring
 * state.
 */
export interface OptimisticMonitoringLock {
    /** Epoch timestamp in milliseconds when this lock expires. */
    readonly expiresAt: number;
    /**
     * Whether the monitor should be treated as actively monitoring while
     * locked.
     */
    readonly monitoring: boolean;
}

const LOCK_KEY_SEPARATOR = "::";

/**
 * Builds a deterministic key for a monitor lock entry.
 *
 * @param siteIdentifier - Site identifier that owns the monitor.
 * @param monitorId - Unique monitor identifier within the site.
 *
 * @returns Stable string key for lock lookups.
 */
export const buildMonitoringLockKey = (
    siteIdentifier: Site["identifier"],
    monitorId: string
): string => `${siteIdentifier}${LOCK_KEY_SEPARATOR}${monitorId}`;
