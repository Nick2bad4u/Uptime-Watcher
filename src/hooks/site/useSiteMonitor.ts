/**
 * Custom hook for managing site monitor selection and data.
 * Provides monitor state, statistics, and selection handling for sites.
 */

import { useMemo, useCallback } from "react";

import { useSitesStore } from "../../stores/sites/useSitesStore";
import { Monitor, Site, StatusHistory } from "../../types";

/**
 * Result interface for the useSiteMonitor hook.
 */
interface SiteMonitorResult {
    // Current state
    /** Most up-to-date site data from store */
    latestSite: Site;
    /** ID of the currently selected monitor */
    selectedMonitorId: string;
    /** Currently selected monitor object */
    monitor: Monitor | undefined;
    /** Current status of the selected monitor */
    status: "up" | "down" | "pending" | "paused";
    /** Response time of the selected monitor */
    responseTime: number | undefined;
    /** Whether the selected monitor is actively being monitored */
    isMonitoring: boolean;

    // Helpers
    /** Array of all monitor IDs for this site */
    monitorIds: string[];
    /** Filtered history for the selected monitor */
    filteredHistory: StatusHistory[];

    // Actions
    /** Handler for monitor selection changes */
    handleMonitorIdChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Hook to manage monitor selection and state for a specific site
 *
 * @param site - The site object to monitor
 * @returns Monitor data and helper functions
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

    const defaultMonitorId = monitorIds[0] ?? "";
    const selectedMonitorId = getSelectedMonitorId(latestSite.identifier) ?? defaultMonitorId;

    // Get the currently selected monitor
    const monitor = useMemo(() => {
        return latestSite.monitors.find((m) => m.id === selectedMonitorId);
    }, [latestSite, selectedMonitorId]);

    // Extract monitor state information
    const status = monitor?.status ?? "pending";
    const responseTime = monitor?.responseTime;
    // Fix: Use history length and last timestamp as dependencies for proper memoization
    const filteredHistory = useMemo(() => {
        const history = monitor?.history ?? [];
        return history;
    }, [monitor]);
    const isMonitoring = monitor?.monitoring !== false; // default to true if undefined

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
