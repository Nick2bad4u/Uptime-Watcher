/**
 * Stats store types and interfaces.
 * Manages application statistics and computed metrics.
 */

import type { Site } from "../../types";

/**
 * Stats store interface.
 * Manages computed statistics and metrics.
 */
export interface StatsStore {
    // State
    /** Total uptime across all sites */
    totalUptime: number;
    /** Total downtime across all sites */
    totalDowntime: number;

    // Actions
    /** Update total uptime */
    setTotalUptime: (uptime: number) => void;
    /** Update total downtime */
    setTotalDowntime: (downtime: number) => void;
    /** Compute stats from sites data - accepts sites parameter to avoid cross-store dependencies */
    computeStats: (sites?: Site[]) => void;
    /** Reset all stats */
    resetStats: () => void;
}
