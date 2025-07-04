import { useErrorStore } from "../../stores";
import { Site } from "../../types";
import { useSiteActions } from "./useSiteActions";
import { useSiteMonitor } from "./useSiteMonitor";
import { useSiteStats } from "./useSiteStats";

/**
 * A comprehensive hook that combines site monitoring, actions, statistics, and UI state
 *
 * @param site - The site to work with
 * @returns Combined data and functionality from all site-related hooks
 */
export function useSite(site: Site) {
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
    return {
        ...monitorData,
        ...stats,
        ...actions,
        isLoading,
    };
}
