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
    /** Compute stats from sites data - accepts sites parameter to avoid cross-store dependencies */
    computeStats: (sites?: Site[]) => void;
    /** Reset all stats */
    resetStats: () => void;

    /** Update total downtime */
    setTotalDowntime: (downtime: number) => void;
    // Actions
    /** Update total uptime */
    setTotalUptime: (uptime: number) => void;
    /** Total downtime across all sites */
    totalDowntime: number;
    // State
    /** Total uptime across all sites */
    totalUptime: number;
}
