import type { Site } from "@shared/types";
import type { Tagged } from "type-fest";

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
 * Unique branded key used to reference optimistic monitoring locks.
 *
 * @remarks
 * Combines the site identifier and monitor identifier using a deterministic
 * separator so locks can be stored in simple record maps without accidental
 * collisions.
 */
export type OptimisticLockKey = Tagged<
    string,
    "optimistic-monitoring-lock-key"
>;

const hasValidLockSegments = (value: string): boolean => {
    const separatorIndex = value.lastIndexOf(LOCK_KEY_SEPARATOR);

    if (separatorIndex <= 0) {
        return false;
    }

    const monitorIdIndex = separatorIndex + LOCK_KEY_SEPARATOR.length;
    return monitorIdIndex < value.length;
};

/**
 * Type guard that validates whether a string matches the branded lock key
 * format.
 */
export const isOptimisticLockKey = (
    value: string
): value is OptimisticLockKey => hasValidLockSegments(value);

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
    monitorId: Site["monitors"][number]["id"]
): OptimisticLockKey => {
    const key = `${siteIdentifier}${LOCK_KEY_SEPARATOR}${monitorId}`;

    if (!isOptimisticLockKey(key)) {
        throw new Error("Failed to build optimistic monitoring lock key");
    }

    return key;
};
