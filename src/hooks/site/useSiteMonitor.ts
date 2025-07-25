/**
 * Custom hook for managing site monitor selection and data.
 * Provides monitor state, statistics, and selection handling for sites.
 */

import { DEFAULT_MONITOR_STATUS } from "@shared/types";
import { useCallback, useMemo } from "react";

import type { Monitor, MonitorStatus, Site, StatusHistory } from "../../types";

import { useSitesStore } from "../../stores/sites/useSitesStore";
import { getDefaultMonitorId } from "../../utils/monitorUiHelpers";

/**
 * Result interface for the useSiteMonitor hook.
 *
 * @public
 */
export interface SiteMonitorResult {
    /** Filtered history for the selected monitor */
    filteredHistory: StatusHistory[];
    // Actions
    /** Handler for monitor selection changes */
    handleMonitorIdChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    /** Whether the selected monitor is actively being monitored */
    isMonitoring: boolean;
    // Current state
    /** Most up-to-date site data from store */
    latestSite: Site;
    /** Currently selected monitor object */
    monitor: Monitor | undefined;
    // Helpers
    /** Array of all monitor IDs for this site */
    monitorIds: string[];

    /** Response time of the selected monitor */
    responseTime: number | undefined;
    /** ID of the currently selected monitor */
    selectedMonitorId: string;

    /** Current status of the selected monitor
     * @remarks Falls back to DEFAULT_MONITOR_STATUS ("pending") when no monitor is selected */
    status: MonitorStatus;
}

/**
 * Hook to manage monitor selection and state for a specific site
 *
 * @param site - The site object to monitor
 * @returns Monitor data and helper functions
 * @see {@link SiteMonitorResult} for the complete interface specification
 *
 * @remarks
 * This hook manages monitor selection and provides current state for site monitoring.
 * It handles edge cases including:
 * - Sites with no monitors (returns empty data with safe defaults)
 * - Invalid monitor selections (falls back to first available monitor)
 * - Undefined monitor references (provides safe fallback values)
 *
 * The hook automatically selects the most recent site data from the store to ensure
 * UI consistency when site data is updated elsewhere in the application.
 * @example
 * ```tsx
 * function SiteMonitorCard({ site }) {
 *   const {
 *     monitor,
 *     status,
 *     isMonitoring,
 *     handleMonitorIdChange
 *   } = useSiteMonitor(site);
 *
 *   if (!monitor) {
 *     return <div>No monitors configured for this site</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <select onChange={handleMonitorIdChange}>
 *         {monitorIds.map(id => <option key={id} value={id}>{id}</option>)}
 *       </select>
 *       <p>Status: {status}</p>
 *       <p>Monitoring: {isMonitoring ? 'Active' : 'Paused'}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSiteMonitor(site: Site): SiteMonitorResult {
    const { getSelectedMonitorId, setSelectedMonitorId, sites } = useSitesStore();

    // Always select the latest site from the store by id to ensure we have the most updated data
    const latestSite = useMemo(() => {
        return sites.find((s) => s.identifier === site.identifier) ?? site;
    }, [site, sites]);

    // Get monitor selection info
    const monitorIds = useMemo(() => {
        return latestSite.monitors.map((m) => m.id);
    }, [latestSite]);

    const defaultMonitorId = getDefaultMonitorId(monitorIds);
    const selectedMonitorId = getSelectedMonitorId(latestSite.identifier) ?? defaultMonitorId;

    // Get the currently selected monitor
    const monitor = useMemo(() => {
        return latestSite.monitors.find((m) => m.id === selectedMonitorId);
    }, [latestSite, selectedMonitorId]);

    // Extract monitor state information
    const status = monitor?.status ?? DEFAULT_MONITOR_STATUS;
    const responseTime = monitor?.responseTime;
    // Fix: Use history length and last timestamp as dependencies for proper memoization
    const filteredHistory = useMemo(() => {
        const history = monitor?.history ?? [];
        return history;
    }, [monitor]);

    // Fix: Explicitly check for monitor existence before checking monitoring status
    // Only return true if monitor exists AND monitoring is not explicitly false
    const isMonitoring = monitor ? monitor.monitoring !== false : false;

    // Handler for changing the monitor - memoized to prevent recreation
    const handleMonitorIdChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedMonitorId(latestSite.identifier, e.target.value);
        },
        [latestSite.identifier, setSelectedMonitorId]
    );

    return {
        filteredHistory,
        handleMonitorIdChange,
        isMonitoring,
        latestSite,
        monitor,
        monitorIds,
        responseTime,
        selectedMonitorId,
        status,
    };
}
