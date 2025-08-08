/**
 * Site details navigation component for managing monitoring controls and tabs.
 * Provides a comprehensive interface for controlling site monitoring, managing intervals,
 * and navigating between different detail views.
 */

import type { JSX } from "react/jsx-runtime";

import React, { useCallback } from "react";

import type { Site } from "../../types";

import logger from "../../services/logger";
import {
    ThemedBox,
    ThemedButton,
    ThemedSelect,
    ThemedText,
} from "../../theme/components";
import { SiteMonitoringButton } from "../common/SiteMonitoringButton/SiteMonitoringButton";

/**
 * Props for the SiteDetailsNavigation component.
 * Contains all necessary handlers and state for monitoring control.
 *
 * @public
 */
export interface SiteDetailsNavigationProperties {
    /** Currently active tab in the site details view */
    readonly activeSiteDetailsTab: string;
    /** The site object being displayed */
    readonly currentSite: Site;
    /** Handler for monitor selection changes */
    readonly handleMonitorIdChange: (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => void;
    /** Handler for starting monitoring */
    readonly handleStartMonitoring: () => Promise<void>;
    /** Handler for starting site-level monitoring */
    readonly handleStartSiteMonitoring: () => Promise<void>;
    /** Handler for stopping monitoring */
    readonly handleStopMonitoring: () => Promise<void>;
    /** Handler for stopping site-level monitoring */
    readonly handleStopSiteMonitoring: () => Promise<void>;
    /** Whether any async operation is in progress */
    readonly isLoading: boolean;
    /** Whether monitoring is currently active */
    readonly isMonitoring: boolean;
    /** Currently selected monitor ID */
    readonly selectedMonitorId: string;
    /** Function to set the active tab */
    readonly setActiveSiteDetailsTab: (tab: string) => void;
}

/**
 * Navigation and control component for site details page.
 *
 * @remarks
 * Provides tabbed navigation and monitoring controls for site details,
 * including start/stop monitoring, manual checks, and configuration options.
 *
 * @param props - Component props for navigation and control
 * @returns JSX element containing navigation controls
 */
export const SiteDetailsNavigation = ({
    activeSiteDetailsTab,
    currentSite,
    handleMonitorIdChange,
    handleStartMonitoring,
    handleStartSiteMonitoring,
    handleStopMonitoring,
    handleStopSiteMonitoring,
    isLoading,
    isMonitoring,
    selectedMonitorId,
    setActiveSiteDetailsTab,
}: SiteDetailsNavigationProperties): JSX.Element => {
    /**
     * Logs tab change events for analytics and debugging purposes.
     *
     * @param tab - The tab name being changed to
     * @param additionalData - Optional additional data to include in the log
     */
    const logTabChange = useCallback(
        (tab: string, additionalData?: Record<string, unknown>) => {
            logger.user.action("Site details tab changed", {
                siteId: currentSite.identifier,
                tab,
                ...additionalData,
            });
        },
        [currentSite.identifier]
    );

    // Memoized handlers to prevent unnecessary re-renders of SiteMonitoringButton
    const handleStartSiteMonitoringMemoized = useCallback(() => {
        void handleStartSiteMonitoring();
    }, [handleStartSiteMonitoring]);

    const handleStopSiteMonitoringMemoized = useCallback(() => {
        void handleStopSiteMonitoring();
    }, [handleStopSiteMonitoring]);

    // Site-level monitoring state calculation
    const allMonitorsRunning =
        currentSite.monitors.length > 0 &&
        currentSite.monitors.every((monitor) => monitor.monitoring);

    // Find selected monitor to get its type for better labeling
    const selectedMonitor = currentSite.monitors.find(
        (monitor) => monitor.id === selectedMonitorId
    );
    const monitorTypeLabel = selectedMonitor
        ? selectedMonitor.type.toUpperCase()
        : "ANALYTICS";

    // Button variant constants
    const BUTTON_VARIANT_PRIMARY = "primary";
    const BUTTON_VARIANT_SECONDARY = "secondary";

    // Memoized tab click handlers
    const handleSiteOverviewClick = useCallback(() => {
        setActiveSiteDetailsTab("site-overview");
        logTabChange("site-overview");
    }, [logTabChange, setActiveSiteDetailsTab]);

    const handleHistoryClick = useCallback(() => {
        setActiveSiteDetailsTab("history");
        logTabChange("history");
    }, [logTabChange, setActiveSiteDetailsTab]);

    const handleSettingsClick = useCallback(() => {
        setActiveSiteDetailsTab("settings");
        logTabChange("settings");
    }, [logTabChange, setActiveSiteDetailsTab]);

    // Additional handlers for monitor-specific tabs and actions
    const handleMonitorOverviewClick = useCallback(() => {
        setActiveSiteDetailsTab("monitor-overview");
        logTabChange("monitor-overview", {
            monitorId: selectedMonitorId,
        });
    }, [logTabChange, selectedMonitorId, setActiveSiteDetailsTab]);

    const handleMonitorAnalyticsClick = useCallback(() => {
        setActiveSiteDetailsTab(`${selectedMonitorId}-analytics`);
        logTabChange("monitor-analytics", {
            monitorId: selectedMonitorId,
        });
    }, [logTabChange, selectedMonitorId, setActiveSiteDetailsTab]);

    const handleStopMonitoringClick = useCallback(() => {
        void handleStopMonitoring();
    }, [handleStopMonitoring]);

    const handleStartMonitoringClick = useCallback(() => {
        void handleStartMonitoring();
    }, [handleStartMonitoring]);

    return (
        <ThemedBox
            className="space-y-4 border-b"
            padding="lg"
            variant="secondary"
        >
            {/* Tab Navigation and Monitor Selection */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Tab navigation buttons (left) */}
                <div className="flex flex-wrap items-center gap-2">
                    <ThemedButton
                        onClick={handleSiteOverviewClick}
                        size="sm"
                        variant={
                            activeSiteDetailsTab === "site-overview"
                                ? BUTTON_VARIANT_PRIMARY
                                : BUTTON_VARIANT_SECONDARY
                        }
                    >
                        🏠 Site Overview
                    </ThemedButton>
                    <ThemedButton
                        onClick={handleMonitorOverviewClick}
                        size="sm"
                        variant={
                            activeSiteDetailsTab === "monitor-overview"
                                ? BUTTON_VARIANT_PRIMARY
                                : BUTTON_VARIANT_SECONDARY
                        }
                    >
                        📊 Monitor Overview
                    </ThemedButton>
                    {/* Render analytics tab for selected monitor type only */}
                    <ThemedButton
                        onClick={handleMonitorAnalyticsClick}
                        size="sm"
                        variant={
                            activeSiteDetailsTab ===
                            `${selectedMonitorId}-analytics`
                                ? BUTTON_VARIANT_PRIMARY
                                : BUTTON_VARIANT_SECONDARY
                        }
                    >
                        {`📈 ${monitorTypeLabel} Analytics`}
                    </ThemedButton>
                    <ThemedButton
                        onClick={handleHistoryClick}
                        size="sm"
                        variant={
                            activeSiteDetailsTab === "history"
                                ? BUTTON_VARIANT_PRIMARY
                                : BUTTON_VARIANT_SECONDARY
                        }
                    >
                        📜 History
                    </ThemedButton>
                    <ThemedButton
                        onClick={handleSettingsClick}
                        size="sm"
                        variant={
                            activeSiteDetailsTab === "settings"
                                ? BUTTON_VARIANT_PRIMARY
                                : BUTTON_VARIANT_SECONDARY
                        }
                    >
                        ⚙️ Settings
                    </ThemedButton>
                </div>

                {/* Monitor Selection and Site-level Controls (right) */}
                <div className="flex items-center gap-4">
                    {/* Site-level monitoring controls */}
                    <div className="flex items-center gap-2">
                        <SiteMonitoringButton
                            allMonitorsRunning={allMonitorsRunning}
                            isLoading={isLoading}
                            onStartSiteMonitoring={
                                handleStartSiteMonitoringMemoized
                            }
                            onStopSiteMonitoring={
                                handleStopSiteMonitoringMemoized
                            }
                        />

                        {/* Individual monitor controls */}
                        {isMonitoring ? (
                            <ThemedButton
                                aria-label="Stop Monitoring"
                                className="flex items-center gap-1"
                                onClick={handleStopMonitoringClick}
                                size="sm"
                                variant="warning"
                            >
                                <span>⏸️</span>
                                <span className="hidden text-xs sm:inline">
                                    Stop
                                </span>
                            </ThemedButton>
                        ) : (
                            <ThemedButton
                                aria-label="Start Monitoring"
                                className="flex items-center gap-1"
                                onClick={handleStartMonitoringClick}
                                size="sm"
                                variant="success"
                            >
                                <span>▶️</span>
                                <span className="hidden text-xs sm:inline">
                                    Start
                                </span>
                            </ThemedButton>
                        )}
                    </div>

                    {/* Monitor Selection */}
                    <div className="flex items-center gap-2">
                        <ThemedText size="sm" variant="secondary">
                            Monitor:
                        </ThemedText>
                        <ThemedSelect
                            onChange={handleMonitorIdChange}
                            value={selectedMonitorId}
                        >
                            {currentSite.monitors.map((monitor) => (
                                <option key={monitor.id} value={monitor.id}>
                                    {monitor.type.toUpperCase()}
                                </option>
                            ))}
                        </ThemedSelect>
                    </div>
                </div>
            </div>
        </ThemedBox>
    );
};
