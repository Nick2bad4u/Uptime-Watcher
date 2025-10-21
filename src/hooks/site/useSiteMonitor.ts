/**
 * Custom hook for managing site monitor selection and data. Provides monitor
 * state, statistics, and selection handling for sites.
 *
 * @public
 */

import type {
    Monitor,
    MonitorStatus,
    Site,
    StatusHistory,
} from "@shared/types";
import type { ChangeEvent } from "react";

import { DEFAULT_MONITOR_STATUS } from "@shared/types";
import { useCallback, useMemo } from "react";

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
    handleMonitorIdChange: (e: ChangeEvent<HTMLSelectElement>) => void;
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

    /**
     * Current status of the selected monitor
     *
     * @remarks
     * Falls back to {@link DEFAULT_MONITOR_STATUS} (`"pending"`) when no monitor
     * is selected.
     */
    status: MonitorStatus;
}

/**
 * Hook to manage monitor selection and state for a specific site
 *
 * @remarks
 * This hook manages monitor selection and provides current state for site
 * monitoring. It handles edge cases including:
 *
 * - Sites with no monitors (returns empty data with safe defaults)
 * - Invalid monitor selections (falls back to first available monitor)
 * - Undefined monitor references (provides safe fallback values)
 *
 * The hook automatically selects the most recent site data from the store to
 * ensure UI consistency when site data is updated elsewhere in the
 * application.
 *
 * @example
 *
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
 *
 * @param site - The site object to monitor.
 *
 * @returns Monitor data and helper functions.
 *
 * @public
 *
 * @see {@link SiteMonitorResult} for the complete interface specification.
 * @see {@link DEFAULT_MONITOR_STATUS} for the default pending state fallback.
 */
export function useSiteMonitor(site: Site): SiteMonitorResult {
    const {
        getSelectedMonitorId,
        selectedMonitorIds,
        setSelectedMonitorId,
        sites,
    } = useSitesStore();

    // Always select the latest site from the store by id to ensure we have the
    // most updated data
    const latestSite = useMemo(
        () => sites.find((s) => s.identifier === site.identifier) ?? site,
        [site, sites]
    );

    // Get monitor selection info
    const monitorIds = useMemo(
        () => latestSite.monitors.map((m) => m.id),
        [latestSite]
    );

    const defaultMonitorId = getDefaultMonitorId(monitorIds);
    const selectedMonitorId =
        selectedMonitorIds[latestSite.identifier] ??
        getSelectedMonitorId(latestSite.identifier) ??
        defaultMonitorId;

    // Get the currently selected monitor
    const monitor = useMemo(
        () => latestSite.monitors.find((m) => m.id === selectedMonitorId),
        [latestSite, selectedMonitorId]
    );

    // Extract monitor state information
    const status = monitor?.status ?? DEFAULT_MONITOR_STATUS;
    const responseTime = monitor?.responseTime;
    // Fix: Use history length and last timestamp as dependencies for proper
    // memoization
    const filteredHistory = useMemo(() => monitor?.history ?? [], [monitor]);

    // Fix: Explicitly check for monitor existence before checking monitoring
    // status Default to true when monitoring is undefined (monitors are active
    // by default) Note: Handle runtime case where monitoring property might be
    // missing despite types
    let isMonitoring = false;
    if (monitor) {
        // Handle potential undefined monitoring value (e.g., in test scenarios)
        // Use Object.hasOwnProperty to safely check for property existence
        const hasMonitoringProperty = Object.hasOwn(monitor, "monitoring");
        if (hasMonitoringProperty) {
            isMonitoring = monitor.monitoring;
        } else {
            // Default to true when monitoring property is missing
            isMonitoring = true;
        }
    }

    // Handler for changing the monitor - memoized to prevent recreation
    const handleMonitorIdChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
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
