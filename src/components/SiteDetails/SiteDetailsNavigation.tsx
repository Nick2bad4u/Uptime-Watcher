/**
 * Site details navigation component for managing monitoring controls and tabs.
 * Provides a comprehensive interface for controlling site monitoring, managing intervals,
 * and navigating between different detail views.
 */

import React from "react";

import { CHECK_INTERVALS, TIMEOUT_CONSTRAINTS } from "../../constants";
import logger from "../../services/logger";
import { ThemedBox, ThemedButton, ThemedSelect, ThemedText } from "../../theme/components";
import { Site } from "../../types";

/**
 * Helper function to format time duration into human readable format.
 * @param milliseconds - Time duration in milliseconds
 * @returns Formatted time string (e.g., "30s", "5m", "1h")
 */
function formatDuration(milliseconds: number): string {
    if (milliseconds < 60000) {
        return `${milliseconds / 1000}s`;
    }
    if (milliseconds < 3600000) {
        return `${milliseconds / 60000}m`;
    }
    return `${milliseconds / 3600000}h`;
}

/**
 * Helper function to get display label for interval value.
 * @param interval - Interval configuration (number or object with value/label)
 * @returns Human readable label for the interval
 */
function getIntervalLabel(interval: number | { value: number; label?: string }): string {
    if (typeof interval === "number") {
        return formatDuration(interval);
    }

    if (interval.label) {
        return interval.label;
    }

    return formatDuration(interval.value);
}

/**
 * Props for the SiteDetailsNavigation component.
 * Contains all necessary handlers and state for monitoring control.
 */
interface SiteDetailsNavigationProps {
    /** Currently active tab in the site details view */
    readonly activeSiteDetailsTab: string;
    /** The site object being displayed */
    readonly currentSite: Site;
    /** Handler for monitor check interval changes */
    readonly handleIntervalChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    /** Handler for monitor selection changes */
    readonly handleMonitorIdChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    /** Handler for saving interval changes */
    readonly handleSaveInterval: () => Promise<void>;
    /** Handler for saving timeout changes */
    readonly handleSaveTimeout: () => Promise<void>;
    /** Handler for starting monitoring */
    readonly handleStartMonitoring: () => Promise<void>;
    /** Handler for stopping monitoring */
    readonly handleStopMonitoring: () => Promise<void>;
    /** Handler for monitor timeout changes */
    readonly handleTimeoutChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /** Whether the check interval has been changed */
    readonly intervalChanged: boolean;
    /** Whether any async operation is in progress */
    readonly isLoading: boolean;
    /** Whether monitoring is currently active */
    readonly isMonitoring: boolean;
    /** Local state value for check interval */
    readonly localCheckInterval: number;
    /** Local state value for timeout */
    readonly localTimeout: number;
    /** Handler for immediate check trigger */
    readonly onCheckNow: () => void;
    /** Currently selected monitor ID */
    readonly selectedMonitorId: string;
    /** Function to set the active tab */
    readonly setActiveSiteDetailsTab: (tab: string) => void;
    /** Function to set the chart time range */
    readonly setSiteDetailsChartTimeRange: (range: string) => void;
    /** Current chart time range selection */
    readonly siteDetailsChartTimeRange: string;
    /** Whether the timeout has been changed */
    readonly timeoutChanged: boolean;
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
    handleSaveTimeout,
    handleStartMonitoring,
    handleStopMonitoring,
    handleTimeoutChange,
    intervalChanged,
    isLoading,
    isMonitoring,
    localCheckInterval,
    localTimeout,
    onCheckNow,
    selectedMonitorId,
    setActiveSiteDetailsTab,
    setSiteDetailsChartTimeRange,
    siteDetailsChartTimeRange,
    timeoutChanged,
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
                            const label = getIntervalLabel(interval);
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
                    {/* Timeout control */}
                    <ThemedText variant="secondary" size="base">
                        Timeout (seconds):
                    </ThemedText>
                    <input
                        type="number"
                        min={TIMEOUT_CONSTRAINTS.MIN}
                        max={TIMEOUT_CONSTRAINTS.MAX}
                        step={TIMEOUT_CONSTRAINTS.STEP}
                        value={localTimeout}
                        onChange={handleTimeoutChange}
                        className="w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                        aria-label="Monitor timeout in seconds"
                    />
                    {timeoutChanged && (
                        <ThemedButton variant="primary" size="sm" onClick={handleSaveTimeout}>
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
