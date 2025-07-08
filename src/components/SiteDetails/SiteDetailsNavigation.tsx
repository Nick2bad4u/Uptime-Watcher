/**
 * Site details navigation component for managing monitoring controls and tabs.
 * Provides a comprehensive interface for controlling site monitoring, managing intervals,
 * and navigating between different detail views.
 */

import React from "react";

import logger from "../../services/logger";
import { ThemedBox, ThemedButton, ThemedSelect, ThemedText } from "../../theme";
import { Site } from "../../types";

/**
 * Props for the SiteDetailsNavigation component.
 * Contains all necessary handlers and state for monitoring control.
 */
interface SiteDetailsNavigationProperties {
    /** Currently active tab in the site details view */
    readonly activeSiteDetailsTab: string;
    /** The site object being displayed */
    readonly currentSite: Site;
    /** Handler for monitor selection changes */
    readonly handleMonitorIdChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
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
    handleMonitorIdChange,
    handleStartMonitoring,
    handleStartSiteMonitoring,
    handleStopMonitoring,
    handleStopSiteMonitoring,
    isLoading,
    isMonitoring,
    selectedMonitorId,
    setActiveSiteDetailsTab,
}: SiteDetailsNavigationProperties) {
    const logTabChange = (tab: string, additionalData?: Record<string, unknown>) => {
        logger.user.action("Site details tab changed", {
            siteId: currentSite.identifier,
            tab,
            ...additionalData,
        });
    };

    // Site-level monitoring state calculation
    const allMonitorsRunning =
        currentSite.monitors.length > 0 && currentSite.monitors.every((monitor) => monitor.monitoring === true);

    // Button variant constants
    const BUTTON_VARIANT_PRIMARY = "primary";
    const BUTTON_VARIANT_SECONDARY = "secondary";

    return (
        <ThemedBox variant="secondary" padding="lg" className="space-y-4 border-b">
            {/* Tab Navigation and Monitor Selection */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Tab navigation buttons (left) */}
                <div className="flex flex-wrap items-center gap-2">
                    <ThemedButton
                        variant={
                            activeSiteDetailsTab === "site-overview" ? BUTTON_VARIANT_PRIMARY : BUTTON_VARIANT_SECONDARY
                        }
                        size="sm"
                        onClick={() => {
                            setActiveSiteDetailsTab("site-overview");
                            logTabChange("site-overview");
                        }}
                    >
                        🏠 Site Overview
                    </ThemedButton>
                    <ThemedButton
                        variant={
                            activeSiteDetailsTab === "monitor-overview"
                                ? BUTTON_VARIANT_PRIMARY
                                : BUTTON_VARIANT_SECONDARY
                        }
                        size="sm"
                        onClick={() => {
                            setActiveSiteDetailsTab("monitor-overview");
                            logTabChange("monitor-overview");
                        }}
                    >
                        📊 Monitor Overview
                    </ThemedButton>
                    {/* Render analytics tab for selected monitor type only */}
                    <ThemedButton
                        key={selectedMonitorId}
                        variant={
                            activeSiteDetailsTab === `${selectedMonitorId}-analytics`
                                ? BUTTON_VARIANT_PRIMARY
                                : BUTTON_VARIANT_SECONDARY
                        }
                        size="sm"
                        onClick={() => {
                            setActiveSiteDetailsTab(`${selectedMonitorId}-analytics`);
                            logTabChange("analytics", { monitorId: selectedMonitorId });
                        }}
                    >
                        {`📈 ${selectedMonitorId.toUpperCase()}`}
                    </ThemedButton>
                    <ThemedButton
                        variant={activeSiteDetailsTab === "history" ? BUTTON_VARIANT_PRIMARY : BUTTON_VARIANT_SECONDARY}
                        size="sm"
                        onClick={() => {
                            setActiveSiteDetailsTab("history");
                            logTabChange("history");
                        }}
                    >
                        📜 History
                    </ThemedButton>
                    <ThemedButton
                        variant={
                            activeSiteDetailsTab === "settings" ? BUTTON_VARIANT_PRIMARY : BUTTON_VARIANT_SECONDARY
                        }
                        size="sm"
                        onClick={() => {
                            setActiveSiteDetailsTab("settings");
                            logTabChange("settings");
                        }}
                    >
                        ⚙️ Settings
                    </ThemedButton>
                </div>

                {/* Monitor Selection and Site-level Controls (right) */}
                <div className="flex items-center gap-4">
                    {/* Site-level monitoring controls */}
                    <div className="flex items-center gap-2">
                        {allMonitorsRunning ? (
                            <ThemedButton
                                variant="error"
                                size="sm"
                                onClick={handleStopSiteMonitoring}
                                aria-label="Stop All Monitoring"
                                className="flex items-center gap-1"
                                disabled={isLoading}
                            >
                                <span>⏹️</span>
                                <span className="hidden text-xs sm:inline">Stop All</span>
                            </ThemedButton>
                        ) : (
                            <ThemedButton
                                variant="success"
                                size="sm"
                                onClick={handleStartSiteMonitoring}
                                aria-label="Start All Monitoring"
                                className="flex items-center gap-1"
                                disabled={isLoading}
                            >
                                <span>▶️</span>
                                <span className="hidden text-xs sm:inline">Start All</span>
                            </ThemedButton>
                        )}

                        {/* Individual monitor controls */}
                        {isMonitoring ? (
                            <ThemedButton
                                variant="warning"
                                size="sm"
                                onClick={handleStopMonitoring}
                                aria-label="Stop Monitoring"
                                className="flex items-center gap-1"
                            >
                                <span>⏸️</span>
                                <span className="hidden text-xs sm:inline">Stop</span>
                            </ThemedButton>
                        ) : (
                            <ThemedButton
                                variant="success"
                                size="sm"
                                onClick={handleStartMonitoring}
                                aria-label="Start Monitoring"
                                className="flex items-center gap-1"
                            >
                                <span>▶️</span>
                                <span className="hidden text-xs sm:inline">Start</span>
                            </ThemedButton>
                        )}
                    </div>

                    {/* Monitor Selection */}
                    <div className="flex items-center gap-2">
                        <ThemedText variant="secondary" size="sm">
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
            </div>
        </ThemedBox>
    );
}
