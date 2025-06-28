import { useEffect, useState, useCallback } from "react";

import { AUTO_REFRESH_INTERVAL } from "../../constants";
import logger from "../../services/logger";
import { useStore } from "../../store";
import { Site } from "../../types";
import { useSiteAnalytics } from "./useSiteAnalytics";

interface UseSiteDetailsProps {
    site: Site;
}

export function useSiteDetails({ site }: UseSiteDetailsProps) {
    const {
        // Synchronized UI state from store
        activeSiteDetailsTab,
        checkSiteNow,
        clearError,
        deleteSite,
        getSelectedMonitorId,
        isLoading,
        modifySite,
        setActiveSiteDetailsTab,
        setSelectedMonitorId,
        setShowAdvancedMetrics,
        setSiteDetailsChartTimeRange,
        showAdvancedMetrics,
        siteDetailsChartTimeRange,
        sites,
        startSiteMonitorMonitoring,
        stopSiteMonitorMonitoring,
        updateSiteCheckInterval,
    } = useStore();

    const [isRefreshing, setIsRefreshing] = useState(false);

    // Always call hooks first, use fallback for currentSite
    const currentSite = sites.find((s) => s.identifier === site.identifier) || {
        identifier: site.identifier,
        monitors: [],
    };

    const monitorIds = currentSite.monitors.map((m) => m.id);
    const defaultMonitorId = monitorIds[0] || "";
    const selectedMonitorId = getSelectedMonitorId(currentSite.identifier) || defaultMonitorId;
    const selectedMonitor = currentSite.monitors.find((m) => m.id === selectedMonitorId) || currentSite.monitors[0];
    const isMonitoring = selectedMonitor?.monitoring !== false;

    // Check interval state
    const [localCheckInterval, setLocalCheckInterval] = useState<number>(selectedMonitor?.checkInterval || 60000);
    const [intervalChanged, setIntervalChanged] = useState(false);

    // Site name state for settings
    const [localName, setLocalName] = useState(currentSite.name || "");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Update local state when monitor changes
    useEffect(() => {
        setLocalCheckInterval(selectedMonitor?.checkInterval || 60000);
        setIntervalChanged(false);
    }, [selectedMonitor?.checkInterval, selectedMonitor?.type, currentSite.identifier]);

    // Track name changes
    useEffect(() => {
        setHasUnsavedChanges(localName !== (currentSite.name || ""));
    }, [localName, currentSite.name]);

    // Handler for check now
    const handleCheckNow = useCallback(
        async (isAutoRefresh = false) => {
            if (isAutoRefresh) {
                setIsRefreshing(true);
            } else {
                clearError();
            }
            try {
                await checkSiteNow(currentSite.identifier, selectedMonitorId);
                if (!isAutoRefresh) {
                    logger.user.action("Manual site check", {
                        identifier: currentSite.identifier,
                        monitorId: selectedMonitorId,
                    });
                }
            } catch (error) {
                logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
            } finally {
                if (isAutoRefresh) {
                    setIsRefreshing(false);
                }
            }
        },
        [checkSiteNow, clearError, currentSite.identifier, selectedMonitorId]
    );

    // Auto-refresh interval
    useEffect(() => {
        const interval = setInterval(async () => {
            if (isMonitoring && !isLoading && !isRefreshing) {
                await handleCheckNow(true);
            }
        }, AUTO_REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, [isMonitoring, isLoading, isRefreshing, selectedMonitorId, handleCheckNow]);

    // Handler for monitor selection change
    const handleMonitorIdChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newId = e.target.value;
            setSelectedMonitorId(currentSite.identifier, newId);
            // If current tab is an analytics tab, switch to the new monitor's analytics tab
            if (activeSiteDetailsTab.endsWith("-analytics")) {
                setActiveSiteDetailsTab(`${newId}-analytics`);
            }
        },
        [currentSite.identifier, activeSiteDetailsTab, setSelectedMonitorId, setActiveSiteDetailsTab]
    );

    // Handler for site removal
    const handleRemoveSite = useCallback(async () => {
        if (!window.confirm(`Are you sure you want to remove ${currentSite.name || currentSite.identifier}?`)) {
            return;
        }

        clearError();

        try {
            await deleteSite(currentSite.identifier);
            logger.site.removed(currentSite.identifier);
        } catch (error) {
            logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
        }
    }, [currentSite.identifier, currentSite.name, clearError, deleteSite]);

    // Monitoring handlers
    const handleStartMonitoring = useCallback(async () => {
        clearError();
        try {
            await startSiteMonitorMonitoring(currentSite.identifier, selectedMonitorId);
            logger.user.action("Started monitoring", {
                monitorId: selectedMonitorId,
                siteId: currentSite.identifier,
            });
        } catch (error) {
            logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
        }
    }, [currentSite.identifier, selectedMonitorId, startSiteMonitorMonitoring, clearError]);

    const handleStopMonitoring = useCallback(async () => {
        clearError();
        try {
            await stopSiteMonitorMonitoring(currentSite.identifier, selectedMonitorId);
            logger.user.action("Stopped monitoring", {
                monitorId: selectedMonitorId,
                siteId: currentSite.identifier,
            });
        } catch (error) {
            logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
        }
    }, [currentSite.identifier, selectedMonitorId, stopSiteMonitorMonitoring, clearError]);

    // Interval change handlers
    const handleIntervalChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setLocalCheckInterval(Number(e.target.value));
            setIntervalChanged(Number(e.target.value) !== selectedMonitor?.checkInterval);
        },
        [selectedMonitor?.checkInterval]
    );

    const handleSaveInterval = useCallback(async () => {
        clearError();
        try {
            await updateSiteCheckInterval(currentSite.identifier, selectedMonitorId, localCheckInterval);
            setIntervalChanged(false);
            logger.user.action("Updated check interval", {
                monitorId: selectedMonitorId,
                newInterval: localCheckInterval,
                siteId: currentSite.identifier,
            });
        } catch (error) {
            logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
        }
    }, [currentSite.identifier, selectedMonitorId, localCheckInterval, updateSiteCheckInterval, clearError]);

    // Name save handler
    const handleSaveName = useCallback(async () => {
        if (!hasUnsavedChanges) return;

        clearError();

        try {
            const updates = { name: localName.trim() || undefined };
            await modifySite(currentSite.identifier, updates);
            setHasUnsavedChanges(false);
            logger.user.action("Updated site name", { identifier: currentSite.identifier, name: localName.trim() });
        } catch (error) {
            logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
        }
    }, [hasUnsavedChanges, clearError, modifySite, currentSite.identifier, localName]);

    // Use analytics hook
    const analytics = useSiteAnalytics(selectedMonitor, siteDetailsChartTimeRange);

    // Check if site exists
    const siteExists = !!sites.find((s) => s.identifier === site.identifier);

    return {
        // UI state
        activeSiteDetailsTab,
        // Analytics
        analytics,
        // Site data
        currentSite,
        // Handlers
        handleCheckNow,
        handleIntervalChange,
        handleMonitorIdChange,
        handleRemoveSite,
        handleSaveInterval,
        handleSaveName,
        handleStartMonitoring,
        handleStopMonitoring,
        // Name state
        hasUnsavedChanges,
        // Interval state
        intervalChanged,
        isLoading,
        isMonitoring,
        isRefreshing,
        localCheckInterval,
        localName,
        selectedMonitor,
        selectedMonitorId,
        // Store actions
        setActiveSiteDetailsTab,
        setLocalName,
        setShowAdvancedMetrics,
        setSiteDetailsChartTimeRange,
        showAdvancedMetrics,
        siteDetailsChartTimeRange,
        siteExists,
    };
}
