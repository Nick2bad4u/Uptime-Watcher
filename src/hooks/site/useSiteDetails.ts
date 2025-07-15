/**
 * Custom hook for managing site details state and operations
 *
 * Provides comprehensive state management for the site details view including:
 * - Site data and monitor information
 * - UI state (active tab, loading states)
 * - Site operations (start/stop monitoring, check now, update settings)
 * - Local state management for editable fields
 * - Integration with analytics data
 */

import { useEffect, useState, useCallback } from "react";

import { DEFAULT_CHECK_INTERVAL } from "../../constants";
import { logger } from "../../services";
import { useErrorStore, useSitesStore, useUIStore } from "../../stores";
import { Site } from "../../types";
import { getTimeoutSeconds, timeoutSecondsToMs, clampTimeoutSeconds } from "../../utils";
import { useSiteAnalytics } from "./useSiteAnalytics";

/** Props for the useSiteDetails hook */
interface UseSiteDetailsProperties {
    /** The site object to manage details for */
    site: Site;
}

/**
 * Hook for managing site details state and operations.
 *
 * Provides all necessary state and handlers for the site details view,
 * including monitor selection, monitoring controls, settings management,
 * and integration with analytics.
 *
 * @param props - Hook props containing the site to manage
 * @returns Object containing all site details state and handlers
 *
 * @example
 * ```tsx
 * function SiteDetails({ site }) {
 *   const {
 *     currentSite,
 *     selectedMonitor,
 *     isLoading,
 *     handleStartMonitoring,
 *     handleStopMonitoring,
 *     // ... other state and handlers
 *   } = useSiteDetails({ site });
 *
 *   // Use the state and handlers in your component
 * }
 * ```
 */

export function useSiteDetails({ site }: UseSiteDetailsProperties) {
    const {
        checkSiteNow,
        deleteSite,
        getSelectedMonitorId,
        modifySite,
        removeMonitorFromSite,
        setSelectedMonitorId,
        sites,
        startSiteMonitoring,
        startSiteMonitorMonitoring,
        stopSiteMonitoring,
        stopSiteMonitorMonitoring,
        updateMonitorRetryAttempts,
        updateMonitorTimeout,
        updateSiteCheckInterval,
    } = useSitesStore();

    const { clearError, isLoading } = useErrorStore();

    const {
        activeSiteDetailsTab,
        setActiveSiteDetailsTab,
        setShowAdvancedMetrics,
        setSiteDetailsChartTimeRange,
        showAdvancedMetrics,
        siteDetailsChartTimeRange,
    } = useUIStore();

    // Always call hooks first, use fallback for currentSite
    const currentSite = sites.find((s) => s.identifier === site.identifier) ?? {
        identifier: site.identifier,
        monitoring: true, // Default to monitoring enabled
        monitors: [],
        name: "Unnamed Site", // Provide default name
    };

    const monitorIds = currentSite.monitors.map((m) => m.id);
    const defaultMonitorId = monitorIds[0] ?? "";
    const selectedMonitorId = getSelectedMonitorId(currentSite.identifier) ?? defaultMonitorId;

    // Find the selected monitor, and if it doesn't exist, update the selection to the first monitor
    const foundMonitor = currentSite.monitors.find((m) => m.id === selectedMonitorId);
    const selectedMonitor = foundMonitor ?? currentSite.monitors[0];

    // Use useEffect to handle stale monitor ID updates (avoid state updates during render)
    useEffect(() => {
        // If the selected monitor ID is stale (doesn't exist), update it to match the actual selected monitor
        if (!foundMonitor && selectedMonitor) {
            setSelectedMonitorId(currentSite.identifier, selectedMonitor.id);
        }
    }, [foundMonitor, selectedMonitor, currentSite.identifier, setSelectedMonitorId]);

    const isMonitoring = selectedMonitor ? selectedMonitor.monitoring !== false : false;

    // Check interval state
    const [localCheckInterval, setLocalCheckInterval] = useState<number>(
        selectedMonitor?.checkInterval ?? DEFAULT_CHECK_INTERVAL
    );
    const [intervalChanged, setIntervalChanged] = useState(false);

    // Timeout state (stored in seconds for UI, converted to ms when saving)
    const [localTimeout, setLocalTimeout] = useState<number>(getTimeoutSeconds(selectedMonitor?.timeout));
    const [timeoutChanged, setTimeoutChanged] = useState(false);

    // Retry attempts state
    const [localRetryAttempts, setLocalRetryAttempts] = useState<number>(selectedMonitor?.retryAttempts ?? 0);
    const [retryAttemptsChanged, setRetryAttemptsChanged] = useState(false);

    // Site name state for settings
    const [localName, setLocalName] = useState(currentSite.name);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Update local state when monitor changes
    useEffect(() => {
        setLocalCheckInterval(selectedMonitor?.checkInterval ?? DEFAULT_CHECK_INTERVAL);
        setIntervalChanged(false);
        setLocalTimeout(getTimeoutSeconds(selectedMonitor?.timeout));
        setTimeoutChanged(false);
        setLocalRetryAttempts(selectedMonitor?.retryAttempts ?? 3);
        setRetryAttemptsChanged(false);
    }, [
        selectedMonitor?.checkInterval,
        selectedMonitor?.timeout,
        selectedMonitor?.retryAttempts,
        selectedMonitor?.type,
        currentSite.identifier,
    ]);

    // Track name changes
    useEffect(() => {
        setHasUnsavedChanges(localName !== currentSite.name);
    }, [localName, currentSite.name]);

    // Handler for check now
    const handleCheckNow = useCallback(async () => {
        clearError();
        try {
            logger.user.action("Manual site check initiated", {
                monitorId: selectedMonitorId,
                monitorType: currentSite.monitors.find((m) => m.id === selectedMonitorId)?.type,
                siteId: currentSite.identifier,
                siteName: currentSite.name,
            });
            await checkSiteNow(currentSite.identifier, selectedMonitorId);
            logger.user.action("Manual site check completed successfully", {
                monitorId: selectedMonitorId,
                siteId: currentSite.identifier,
                siteName: currentSite.name,
            });
        } catch (error) {
            logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
            logger.error("Manual site check failed", error instanceof Error ? error : new Error(String(error)), {
                monitorId: selectedMonitorId,
                siteId: currentSite.identifier,
                siteName: currentSite.name,
            });
        }
    }, [checkSiteNow, clearError, currentSite.identifier, currentSite.monitors, currentSite.name, selectedMonitorId]);

    // No auto-refresh - respect the monitor's configured interval
    // Users can manually click "Check Now" if they want immediate updates

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
        if (!globalThis.confirm(`Are you sure you want to remove ${currentSite.name}?`)) {
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

    // Handler for monitor removal
    const handleRemoveMonitor = useCallback(async () => {
        if (!selectedMonitor) {
            logger.site.error(currentSite.identifier, "No monitor selected for removal");
            return;
        }

        const monitorName = selectedMonitor.url ?? selectedMonitor.host ?? selectedMonitor.type;
        if (
            !globalThis.confirm(
                `Are you sure you want to remove the monitor "${monitorName}" from ${currentSite.name}?`
            )
        ) {
            return;
        }

        clearError();

        try {
            await removeMonitorFromSite(currentSite.identifier, selectedMonitor.id);
            logger.user.action("Monitor removed successfully", {
                monitorId: selectedMonitor.id,
                monitorType: selectedMonitor.type,
                siteId: currentSite.identifier,
            });
        } catch (error) {
            logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
        }
    }, [currentSite.identifier, currentSite.name, selectedMonitor, clearError, removeMonitorFromSite]);

    // Site-level monitoring handlers
    const handleStartSiteMonitoring = useCallback(async () => {
        clearError();
        try {
            // First, update the site's monitoring field in the database
            await modifySite(currentSite.identifier, { monitoring: true });
            // Then start the actual monitoring processes
            await startSiteMonitoring(currentSite.identifier);
            logger.user.action("Started site monitoring", {
                monitorCount: currentSite.monitors.length,
                siteId: currentSite.identifier,
            });
        } catch (error) {
            logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
        }
    }, [currentSite.identifier, currentSite.monitors.length, startSiteMonitoring, modifySite, clearError]);

    const handleStopSiteMonitoring = useCallback(async () => {
        clearError();
        try {
            // First, update the site's monitoring field in the database
            await modifySite(currentSite.identifier, { monitoring: false });
            // Then stop the actual monitoring processes
            await stopSiteMonitoring(currentSite.identifier);
            logger.user.action("Stopped site monitoring", {
                monitorCount: currentSite.monitors.length,
                siteId: currentSite.identifier,
            });
        } catch (error) {
            logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
        }
    }, [currentSite.identifier, currentSite.monitors.length, stopSiteMonitoring, modifySite, clearError]);

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

    // Timeout change handlers
    const handleTimeoutChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            // Work directly with seconds in the UI
            const timeoutInSeconds = clampTimeoutSeconds(Number(e.target.value));
            setLocalTimeout(timeoutInSeconds);
            // Compare against the monitor's timeout converted to seconds
            const currentTimeoutInSeconds = getTimeoutSeconds(selectedMonitor?.timeout);
            setTimeoutChanged(timeoutInSeconds !== currentTimeoutInSeconds);
        },
        [selectedMonitor?.timeout]
    );

    const handleSaveTimeout = useCallback(async () => {
        clearError();
        try {
            // Convert seconds to milliseconds when saving to backend
            const timeoutInMs = timeoutSecondsToMs(localTimeout);
            await updateMonitorTimeout(currentSite.identifier, selectedMonitorId, timeoutInMs);
            setTimeoutChanged(false);
            logger.user.action("Updated monitor timeout", {
                monitorId: selectedMonitorId,
                newTimeout: timeoutInMs,
                siteId: currentSite.identifier,
            });
        } catch (error) {
            logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
        }
    }, [currentSite.identifier, selectedMonitorId, localTimeout, updateMonitorTimeout, clearError]);

    // Retry attempts change handlers
    const handleRetryAttemptsChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const retryAttempts = Number(e.target.value);
            setLocalRetryAttempts(retryAttempts);
            const currentRetryAttempts = selectedMonitor?.retryAttempts ?? 0;
            setRetryAttemptsChanged(retryAttempts !== currentRetryAttempts);
        },
        [selectedMonitor?.retryAttempts]
    );

    const handleSaveRetryAttempts = useCallback(async () => {
        clearError();
        try {
            await updateMonitorRetryAttempts(currentSite.identifier, selectedMonitorId, localRetryAttempts);
            setRetryAttemptsChanged(false);
            logger.user.action("Updated monitor retry attempts", {
                monitorId: selectedMonitorId,
                newRetryAttempts: localRetryAttempts,
                siteId: currentSite.identifier,
            });
        } catch (error) {
            logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
        }
    }, [currentSite.identifier, selectedMonitorId, localRetryAttempts, updateMonitorRetryAttempts, clearError]);

    // Name save handler
    const handleSaveName = useCallback(async () => {
        if (!hasUnsavedChanges) {
            return;
        }

        clearError();

        try {
            const trimmedName = localName.trim();
            if (trimmedName) {
                const updates = { name: trimmedName };
                await modifySite(currentSite.identifier, updates);
            }
            setHasUnsavedChanges(false);
            logger.user.action("Updated site name", { identifier: currentSite.identifier, name: localName.trim() });
        } catch (error) {
            logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
        }
    }, [hasUnsavedChanges, clearError, modifySite, currentSite.identifier, localName]);

    // Use analytics hook
    const analytics = useSiteAnalytics(selectedMonitor, siteDetailsChartTimeRange);

    // Check if site exists
    const siteExists = sites.some((s) => s.identifier === site.identifier);

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
        handleRemoveMonitor,
        handleRemoveSite,
        handleRetryAttemptsChange,
        handleSaveInterval,
        handleSaveName,
        handleSaveRetryAttempts,
        handleSaveTimeout,
        handleStartMonitoring,
        handleStartSiteMonitoring,
        handleStopMonitoring,
        handleStopSiteMonitoring,
        handleTimeoutChange,
        // Name state
        hasUnsavedChanges,
        // Interval state
        intervalChanged,
        isLoading,
        isMonitoring,
        localCheckInterval,
        localName,
        localRetryAttempts,
        localTimeout,
        retryAttemptsChanged,
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
        timeoutChanged,
    };
}
