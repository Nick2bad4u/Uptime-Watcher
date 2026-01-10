/**
 * Custom hook for managing site monitor selection and data.
 *
 * @public
 */

import type { Monitor, MonitorStatus, Site, StatusHistory } from "@shared/types";
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

    /** Handler for monitor selection changes */
    handleMonitorIdChange: (e: ChangeEvent<HTMLSelectElement>) => void;

    /** Whether the selected monitor is actively being monitored */
    isMonitoring: boolean;

    /** Most up-to-date site data from store */
    latestSite: Site;

    /** Currently selected monitor object */
    monitor: Monitor | undefined;

    /** Array of all monitor IDs for this site */
    monitorIds: string[];

    /** Response time of the selected monitor */
    responseTime: number | undefined;

    /** ID of the currently selected monitor */
    selectedMonitorId: string;

    /**
     * Current status of the selected monitor.
     *
     * @remarks
     * Falls back to {@link DEFAULT_MONITOR_STATUS} (`"pending"`) when no monitor
     * is selected.
     */
    status: MonitorStatus;
}

/**
 * Hook to manage monitor selection and state for a specific site.
 *
 * @remarks
 * Uses per-field selectors (Zustand v5) to avoid re-renders from unrelated store
 * updates.
 */
export function useSiteMonitor(site: Site): SiteMonitorResult {
    const sites = useSitesStore(useCallback((state) => state.sites, []));
    const getSelectedMonitorId = useSitesStore(
        useCallback((state) => state.getSelectedMonitorId, [])
    );
    const setSelectedMonitorId = useSitesStore(
        useCallback((state) => state.setSelectedMonitorId, [])
    );

    const latestSite = useMemo(
        () => sites.find((s) => s.identifier === site.identifier) ?? site,
        [site, sites]
    );

    const monitorIds = useMemo(
        () => latestSite.monitors.map((m) => m.id),
        [latestSite]
    );

    const defaultMonitorId = getDefaultMonitorId(monitorIds);

    const selectedMonitorId =
        getSelectedMonitorId(latestSite.identifier) ?? defaultMonitorId;

    const monitor = useMemo(
        () => latestSite.monitors.find((m) => m.id === selectedMonitorId),
        [latestSite, selectedMonitorId]
    );

    const status = monitor?.status ?? DEFAULT_MONITOR_STATUS;
    const responseTime = monitor?.responseTime;
    const filteredHistory = useMemo(() => monitor?.history ?? [], [monitor]);

    let isMonitoring = false;
    if (monitor) {
        isMonitoring = Object.hasOwn(monitor, "monitoring")
            ? monitor.monitoring
            : true;
    }

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
