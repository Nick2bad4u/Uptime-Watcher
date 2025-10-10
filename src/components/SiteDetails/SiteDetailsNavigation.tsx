/**
 * Site details navigation component for managing monitoring controls and tabs.
 * Provides a comprehensive interface for controlling site monitoring, managing
 * intervals, and navigating between different detail views.
 */

import type { Site } from "@shared/types";
import type { JSX } from "react/jsx-runtime";
import type { UnknownRecord } from "type-fest";

import {
    type ChangeEvent,
    memo,
    type NamedExoticComponent,
    useCallback,
    useMemo,
} from "react";

import type { SiteDetailsTab } from "../../stores/ui/types";

import { logger } from "../../services/logger";
import { ThemedButton } from "../../theme/components/ThemedButton";
import { ThemedText } from "../../theme/components/ThemedText";
import { getMonitorTypeDisplayLabel } from "../../utils/fallbacks";
import { AppIcons } from "../../utils/icons";
import { SiteMonitoringButton } from "../common/SiteMonitoringButton/SiteMonitoringButton";
import { Tooltip } from "../common/Tooltip/Tooltip";
import { SurfaceContainer } from "../shared/SurfaceContainer";
import { MonitorSelector } from "../Dashboard/SiteCard/components/MonitorSelector";

/**
 * Props for the SiteDetailsNavigation component. Contains all necessary
 * handlers and state for monitoring control.
 *
 * @public
 */
export interface SiteDetailsNavigationProperties {
    /** Currently active tab in the site details view */
    readonly activeSiteDetailsTab: SiteDetailsTab;
    /** The site object being displayed */
    readonly currentSite: Site;
    /** Handler for monitor selection changes */
    readonly handleMonitorIdChange: (
        event: ChangeEvent<HTMLSelectElement>
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
    readonly setActiveSiteDetailsTab: (tab: SiteDetailsTab) => void;
}

/**
 * Navigation and control component for site details page.
 *
 * @remarks
 * Provides tabbed navigation and monitoring controls for site details,
 * including start/stop monitoring, manual checks, and configuration options.
 *
 * @param props - Component props for navigation and control
 *
 * @returns JSX element containing navigation controls
 */
export const SiteDetailsNavigation: NamedExoticComponent<SiteDetailsNavigationProperties> =
    memo(function SiteDetailsNavigationComponent({
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
    }: SiteDetailsNavigationProperties): JSX.Element {
        /**
         * Logs tab change events for analytics and debugging purposes.
         *
         * @param tab - The tab name being changed to
         * @param additionalData - Optional additional data to include in the
         *   log
         */
        const logTabChange = useCallback(
            (tab: string, additionalData?: UnknownRecord) => {
                logger.user.action("Site details tab changed", {
                    siteId: currentSite.identifier,
                    tab,
                    ...additionalData,
                });
            },
            [currentSite.identifier]
        );

        // Memoized handlers to prevent unnecessary re-renders of
        // SiteMonitoringButton
        const handleStartSiteMonitoringMemoized = useCallback(() => {
            void handleStartSiteMonitoring();
        }, [handleStartSiteMonitoring]);

        const handleStopSiteMonitoringMemoized = useCallback(() => {
            void handleStopSiteMonitoring();
        }, [handleStopSiteMonitoring]);

        // Site-level monitoring state calculation
        const allMonitorsRunning = useMemo(
            () =>
                currentSite.monitors.length > 0 &&
                currentSite.monitors.every((monitor) => monitor.monitoring),
            [currentSite.monitors]
        );

        // Find selected monitor to get its type for better labeling
        const selectedMonitor = useMemo(
            () =>
                currentSite.monitors.find(
                    (monitor) => monitor.id === selectedMonitorId
                ),
            [currentSite.monitors, selectedMonitorId]
        );
        const monitorTypeLabel = useMemo(() => {
            if (!selectedMonitor) {
                return "Monitor";
            }

            return getMonitorTypeDisplayLabel(selectedMonitor.type);
        }, [selectedMonitor]);

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
        }, [
            logTabChange,
            selectedMonitorId,
            setActiveSiteDetailsTab,
        ]);

        const handleMonitorAnalyticsClick = useCallback(() => {
            setActiveSiteDetailsTab(`${selectedMonitorId}-analytics`);
            logTabChange("monitor-analytics", {
                monitorId: selectedMonitorId,
            });
        }, [
            logTabChange,
            selectedMonitorId,
            setActiveSiteDetailsTab,
        ]);

        const handleStopMonitoringClick = useCallback(() => {
            void handleStopMonitoring();
        }, [handleStopMonitoring]);

        const handleStartMonitoringClick = useCallback(() => {
            void handleStartMonitoring();
        }, [handleStartMonitoring]);

        const SiteOverviewIcon = AppIcons.ui.home;
        const MonitorOverviewIcon = AppIcons.metrics.activity;
        const AnalyticsIcon = AppIcons.ui.analytics;
        const HistoryIcon = AppIcons.ui.history;
        const SettingsIcon = AppIcons.settings.gear;
        const PauseIcon = AppIcons.actions.pause;
        const PlayIcon = AppIcons.actions.play;

        const buildMonitorActionTooltip = useCallback(
            (baseMessage: string): string => {
                if (isLoading) {
                    return `${baseMessage} • Finishing the previous request.`;
                }

                return baseMessage;
            },
            [isLoading]
        );

        return (
            <SurfaceContainer
                className="site-details-navigation"
                padding="lg"
                variant="secondary"
            >
                {/* Tab Navigation and Monitor Selection */}
                <div className="site-details-navigation__grid">
                    {/* Tab navigation buttons (left) */}
                    <div className="site-details-navigation__tabs">
                        <ThemedButton
                            className="flex items-center gap-2"
                            onClick={handleSiteOverviewClick}
                            size="sm"
                            variant={
                                activeSiteDetailsTab === "site-overview"
                                    ? BUTTON_VARIANT_PRIMARY
                                    : BUTTON_VARIANT_SECONDARY
                            }
                        >
                            <SiteOverviewIcon size={16} />
                            <span>Site Overview</span>
                        </ThemedButton>
                        <ThemedButton
                            className="flex items-center gap-2"
                            onClick={handleMonitorOverviewClick}
                            size="sm"
                            variant={
                                activeSiteDetailsTab === "monitor-overview"
                                    ? BUTTON_VARIANT_PRIMARY
                                    : BUTTON_VARIANT_SECONDARY
                            }
                        >
                            <MonitorOverviewIcon size={16} />
                            <span>Monitor Overview</span>
                        </ThemedButton>
                        {/* Render analytics tab for selected monitor type only */}
                        <ThemedButton
                            className="flex items-center gap-2"
                            onClick={handleMonitorAnalyticsClick}
                            size="sm"
                            variant={
                                activeSiteDetailsTab ===
                                `${selectedMonitorId}-analytics`
                                    ? BUTTON_VARIANT_PRIMARY
                                    : BUTTON_VARIANT_SECONDARY
                            }
                        >
                            <AnalyticsIcon size={16} />
                            <span>{`${monitorTypeLabel} Analytics`}</span>
                        </ThemedButton>
                        <ThemedButton
                            className="flex items-center gap-2"
                            onClick={handleHistoryClick}
                            size="sm"
                            variant={
                                activeSiteDetailsTab === "history"
                                    ? BUTTON_VARIANT_PRIMARY
                                    : BUTTON_VARIANT_SECONDARY
                            }
                        >
                            <HistoryIcon size={16} />
                            <span>History</span>
                        </ThemedButton>
                        <ThemedButton
                            className="flex items-center gap-2"
                            onClick={handleSettingsClick}
                            size="sm"
                            variant={
                                activeSiteDetailsTab === "settings"
                                    ? BUTTON_VARIANT_PRIMARY
                                    : BUTTON_VARIANT_SECONDARY
                            }
                        >
                            <SettingsIcon size={16} />
                            <span>Settings</span>
                        </ThemedButton>
                    </div>

                    {/* Monitor Selection and Site-level Controls (right) */}
                    <div className="site-details-navigation__controls">
                        {/* Site-level monitoring controls */}
                        <div className="site-details-navigation__control-group">
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
                                <Tooltip
                                    content={buildMonitorActionTooltip(
                                        "Pause monitoring for this monitor"
                                    )}
                                    position="top"
                                >
                                    {(triggerProps) => (
                                        <ThemedButton
                                            {...triggerProps}
                                            aria-label="Stop Monitoring"
                                            className="flex items-center gap-2"
                                            onClick={handleStopMonitoringClick}
                                            size="sm"
                                            variant="warning"
                                        >
                                            <PauseIcon size={16} />
                                            <span className="hidden text-xs sm:inline">
                                                Stop
                                            </span>
                                        </ThemedButton>
                                    )}
                                </Tooltip>
                            ) : (
                                <Tooltip
                                    content={buildMonitorActionTooltip(
                                        "Resume monitoring for this monitor"
                                    )}
                                    position="top"
                                >
                                    {(triggerProps) => (
                                        <ThemedButton
                                            {...triggerProps}
                                            aria-label="Start Monitoring"
                                            className="flex items-center gap-2"
                                            onClick={handleStartMonitoringClick}
                                            size="sm"
                                            variant="success"
                                        >
                                            <PlayIcon size={16} />
                                            <span className="hidden text-xs sm:inline">
                                                Start
                                            </span>
                                        </ThemedButton>
                                    )}
                                </Tooltip>
                            )}
                        </div>

                        {/* Monitor Selection */}
                        <div className="site-details-navigation__select">
                            <ThemedText size="sm" variant="secondary">
                                Monitor:
                            </ThemedText>
                            <MonitorSelector
                                className="site-details-navigation__monitor-selector"
                                monitors={currentSite.monitors}
                                onChange={handleMonitorIdChange}
                                selectedMonitorId={selectedMonitorId}
                            />
                        </div>
                    </div>
                </div>
            </SurfaceContainer>
        );
    });
