/**
 * Site details navigation component for managing monitoring controls and tabs.
 * Provides a comprehensive interface for controlling site monitoring, managing intervals,
 * and navigating between different detail views.
 */

import React from "react";

import { CHECK_INTERVALS } from "../../constants";
import logger from "../../services/logger";
import { ThemedBox, ThemedButton, ThemedSelect, ThemedText } from "../../theme/components";
import { Site } from "../../types";

/**
 * Props for the SiteDetailsNavigation component.
 * Contains all necessary handlers and state for monitoring control.
 */
interface SiteDetailsNavigationProps {
    /** Currently active tab in the site details view */
    activeSiteDetailsTab: string;
    /** The site object being displayed */
    currentSite: Site;
    /** Handler for monitor check interval changes */
    handleIntervalChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    /** Handler for monitor selection changes */
    handleMonitorIdChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    /** Handler for saving interval changes */
    handleSaveInterval: () => Promise<void>;
    /** Handler for starting monitoring */
    handleStartMonitoring: () => Promise<void>;
    /** Handler for stopping monitoring */
    handleStopMonitoring: () => Promise<void>;
    /** Whether the check interval has been changed */
    intervalChanged: boolean;
    /** Whether any async operation is in progress */
    isLoading: boolean;
    /** Whether monitoring is currently active */
    isMonitoring: boolean;
    /** Local state value for check interval */
    localCheckInterval: number;
    /** Handler for immediate check trigger */
    onCheckNow: () => void;
    /** Currently selected monitor ID */
    selectedMonitorId: string;
    /** Function to set the active tab */
    setActiveSiteDetailsTab: (tab: string) => void;
    /** Function to set the chart time range */
    setSiteDetailsChartTimeRange: (range: string) => void;
    /** Current chart time range selection */
    siteDetailsChartTimeRange: string;
}

/**
 * Navigation and control component for site details page.
 *
 * Features:
 * - Tab navigation for different views (Overview, History, Analytics, Settings)
 * - Monitor control buttons (Start/Stop monitoring, Check now)
 * - Monitor selection dropdown
 * - Check interval configuration
 * - Time range selection for charts
 *
 * @param props - Component props for navigation and control
 * @returns JSX element containing navigation controls
 */
export function SiteDetailsNavigation({
    activeSiteDetailsTab,
    currentSite,
    handleIntervalChange,
    handleMonitorIdChange,
    handleSaveInterval,
    handleStartMonitoring,
    handleStopMonitoring,
    intervalChanged,
    isLoading,
    isMonitoring,
    localCheckInterval,
    onCheckNow,
    selectedMonitorId,
    setActiveSiteDetailsTab,
    setSiteDetailsChartTimeRange,
    siteDetailsChartTimeRange,
}: SiteDetailsNavigationProps) {
    const logTabChange = (tab: string, additionalData?: Record<string, unknown>) => {
        logger.user.action("Site details tab changed", {
            siteId: currentSite.identifier,
            tab,
            ...additionalData,
        });
    };

    return (
        <ThemedBox variant="secondary" padding="lg" className="border-b">
            <div className="flex flex-wrap items-center gap-2">
                {/* Tab navigation buttons (left) */}
                <div className="flex flex-wrap items-center gap-2">
                    <ThemedButton
                        variant={activeSiteDetailsTab === "overview" ? "primary" : "secondary"}
                        onClick={() => {
                            setActiveSiteDetailsTab("overview");
                            logTabChange("overview");
                        }}
                    >
                        📊 Overview
                    </ThemedButton>
                    {/* Render analytics tab for selected monitor type only */}
                    <ThemedButton
                        key={selectedMonitorId}
                        variant={activeSiteDetailsTab === `${selectedMonitorId}-analytics` ? "primary" : "secondary"}
                        onClick={() => {
                            setActiveSiteDetailsTab(`${selectedMonitorId}-analytics`);
                            logTabChange("analytics", { monitorId: selectedMonitorId });
                        }}
                    >
                        {`📈 ${selectedMonitorId.toUpperCase()}`}
                    </ThemedButton>
                    <ThemedButton
                        variant={activeSiteDetailsTab === "history" ? "primary" : "secondary"}
                        onClick={() => {
                            setActiveSiteDetailsTab("history");
                            logTabChange("history");
                        }}
                    >
                        📜 History
                    </ThemedButton>
                    <ThemedButton
                        variant={activeSiteDetailsTab === "settings" ? "primary" : "secondary"}
                        onClick={() => {
                            setActiveSiteDetailsTab("settings");
                            logTabChange("settings");
                        }}
                    >
                        ⚙️ Settings
                    </ThemedButton>
                </div>
                {/* Controls (right, before monitor type selector) */}
                <div className="flex items-center gap-2 ml-auto">
                    <ThemedText size="sm" variant="secondary">
                        Interval:
                    </ThemedText>
                    <ThemedSelect value={localCheckInterval} onChange={handleIntervalChange}>
                        {CHECK_INTERVALS.map((interval) => {
                            // Support both number and object forms
                            const value = typeof interval === "number" ? interval : interval.value;
                            const label =
                                typeof interval === "number"
                                    ? value < 60000
                                        ? `${value / 1000}s`
                                        : value < 3600000
                                          ? `${value / 60000}m`
                                          : `${value / 3600000}h`
                                    : interval.label ||
                                      (interval.value < 60000
                                          ? `${interval.value / 1000}s`
                                          : interval.value < 3600000
                                            ? `${interval.value / 60000}m`
                                            : `${interval.value / 3600000}h`);
                            return (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            );
                        })}
                    </ThemedSelect>
                    {intervalChanged && (
                        <ThemedButton variant="primary" size="sm" onClick={handleSaveInterval}>
                            Save
                        </ThemedButton>
                    )}
                    {/* Check now button */}
                    <ThemedButton
                        variant="ghost"
                        size="sm"
                        onClick={onCheckNow}
                        className="min-w-[32px]"
                        aria-label="Check Now"
                        disabled={isLoading}
                    >
                        <span>🔄</span>
                    </ThemedButton>
                    {isMonitoring ? (
                        <ThemedButton
                            variant="error"
                            size="sm"
                            onClick={handleStopMonitoring}
                            aria-label="Stop Monitoring"
                            className="flex items-center gap-1"
                        >
                            <span className="inline-block">⏸️</span>
                            <span className="hidden sm:inline">Stop</span>
                        </ThemedButton>
                    ) : (
                        <ThemedButton
                            variant="success"
                            size="sm"
                            onClick={handleStartMonitoring}
                            aria-label="Start Monitoring"
                            className="flex items-center gap-1"
                        >
                            <span className="inline-block">▶️</span>
                            <span className="hidden sm:inline">Start</span>
                        </ThemedButton>
                    )}
                    {/* Monitor type selector (far right) */}
                    <ThemedText variant="secondary" size="base">
                        Monitor:
                    </ThemedText>
                    <ThemedSelect value={selectedMonitorId} onChange={handleMonitorIdChange}>
                        {currentSite.monitors.map((monitor) => (
                            <option key={monitor.id} value={monitor.id}>
                                {monitor.type.toUpperCase()}
                            </option>
                        ))}
                    </ThemedSelect>
                </div>
            </div>
            {/* Time Range Selector for Analytics Tab */}
            {activeSiteDetailsTab === `${selectedMonitorId}-analytics` &&
                (selectedMonitorId === "http" || selectedMonitorId === "port") && (
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <ThemedText size="sm" variant="secondary" className="mr-2">
                            Time Range:
                        </ThemedText>
                        <div className="flex flex-wrap gap-1">
                            {(["1h", "24h", "7d", "30d"] as const).map((range) => (
                                <ThemedButton
                                    key={range}
                                    variant={siteDetailsChartTimeRange === range ? "primary" : "ghost"}
                                    size="xs"
                                    onClick={() => setSiteDetailsChartTimeRange(range)}
                                >
                                    {range}
                                </ThemedButton>
                            ))}
                        </div>
                    </div>
                )}
        </ThemedBox>
    );
}
