/**
 * Composite hook that combines all site-related functionality.
 *
 * @remarks
 * Provides a unified interface for site actions, monitoring, and statistics.
 * Aggregates functionality from multiple specialized hooks into a single
 * convenient interface for components.
 */
import type { Site } from "@shared/types";

import { useMemo } from "react";

import { useErrorStore } from "../../stores/error/useErrorStore";
import { type SiteActionsResult, useSiteActions } from "./useSiteActions";
import { type SiteMonitorResult, useSiteMonitor } from "./useSiteMonitor";
import { type SiteStats, useSiteStats } from "./useSiteStats";

/**
 * Combined result interface for the useSite hook. Merges data and functionality
 * from all site-related hooks.
 *
 * @public
 */
export interface UseSiteResult
    extends SiteActionsResult,
        SiteMonitorResult,
        SiteStats {
    /** Loading state from error store for UI consistency */
    isLoading: boolean;
}

/**
 * A comprehensive hook that combines site monitoring, actions, statistics, and
 * UI state
 *
 * @remarks
 * This hook serves as a composition layer that combines:
 *
 * - Monitor data and selection (from useSiteMonitor)
 * - Site statistics and analytics (from useSiteStats)
 * - Action handlers for site operations (from useSiteActions)
 * - UI loading state (from useErrorStore)
 *
 * Property precedence: Actions → Monitor → Stats → Loading state. The isLoading
 * property is added last and will not be overwritten.
 *
 * @example
 *
 * ```tsx
 * function SiteCard({ site }) {
 *   const {
 *     monitor,
 *     status,
 *     uptime,
 *     handleCheckNow,
 *     handleStartMonitoring,
 *     isLoading
 *   } = useSite(site);
 *
 *   return (
 *     <div>
 *       <h3>{site.name}</h3>
 *       <p>Status: {status}</p>
 *       <p>Uptime: {uptime}%</p>
 *       <button onClick={handleCheckNow} disabled={isLoading}>
 *         Check Now
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param site - The site to work with
 *
 * @returns Combined data and functionality from all site-related hooks
 *
 * @see {@link UseSiteResult} for the complete interface specification
 */
export function useSite(site: Site): UseSiteResult {
    // Get monitor data
    const monitorData = useSiteMonitor(site);
    const { filteredHistory, monitor } = monitorData;

    // Get site statistics
    const stats = useSiteStats(filteredHistory);

    // Get action handlers
    const actions = useSiteActions(site, monitor);

    // Get UI state from store for consistency
    const { isLoading } = useErrorStore();

    // Return everything together
    return useMemo(
        () => ({
            ...monitorData,
            ...stats,
            ...actions,
            isLoading,
        }),
        [
            actions,
            isLoading,
            monitorData,
            stats,
        ]
    );
}
