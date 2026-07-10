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
    type KeyboardEvent as ReactKeyboardEvent,
    useCallback,
    useMemo,
} from "react";

import type { SiteDetailsTab } from "../../stores/ui/types";

import { runSiteDetailsBackgroundOperation } from "../../hooks/site/useSiteDetails.utils";
import { logger } from "../../services/logger";
import { ThemedButton } from "../../theme/components/ThemedButton";
import { ThemedText } from "../../theme/components/ThemedText";
import { getMonitorTypeDisplayLabel } from "../../utils/fallbacks";
import { AppIcons } from "../../utils/icons";
import { SiteMonitoringButton } from "../common/SiteMonitoringButton/SiteMonitoringButton";
import { Tooltip } from "../common/Tooltip/Tooltip";
import { MonitorSelector } from "../Dashboard/SiteCard/components/MonitorSelector";
import { SurfaceContainer } from "../shared/SurfaceContainer";

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

function resolveSiteDetailsTabId(tabKey: string): string {
    return `site-details-tab-${tabKey}`;
}

function resolveNextTabIndex(args: {
    readonly currentIndex: number;
    readonly key: string;
    readonly tabCount: number;
}): null | number {
    switch (args.key) {
        case "ArrowLeft": {
            return (args.currentIndex - 1 + args.tabCount) % args.tabCount;
        }
        case "ArrowRight": {
            return (args.currentIndex + 1) % args.tabCount;
        }
        case "End": {
            return args.tabCount - 1;
        }
        case "Home": {
            return 0;
        }
        default: {
            return null;
        }
    }
}

/**
 * Navigation and control component for site details page.
 *
 * @remarks
 * Provides tabbed navigation and monitoring controls for site details,
 * including start/stop monitoring, manual checks, and configuration options.
 *
 * @param props - Component props for navigation and control.
 *
 * @returns JSX element containing navigation controls.
 *
 * @public
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
                    siteIdentifier: currentSite.identifier,
                    tab,
                    ...additionalData,
                });
            },
            [currentSite.identifier]
        );

        // Memoized handlers to prevent unnecessary re-renders of
        // SiteMonitoringButton
        const handleStartSiteMonitoringMemoized = useCallback(() => {
            runSiteDetailsBackgroundOperation(
                "SiteDetailsNavigation.handleStartSiteMonitoringMemoized",
                handleStartSiteMonitoring
            );
        }, [handleStartSiteMonitoring]);

        const handleStopSiteMonitoringMemoized = useCallback(() => {
            runSiteDetailsBackgroundOperation(
                "SiteDetailsNavigation.handleStopSiteMonitoringMemoized",
                handleStopSiteMonitoring
            );
        }, [handleStopSiteMonitoring]);

        // Site-level monitoring state calculation
        const isAllMonitorsRunning = useMemo(
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
            runSiteDetailsBackgroundOperation(
                "SiteDetailsNavigation.handleStopMonitoringClick",
                handleStopMonitoring
            );
        }, [handleStopMonitoring]);

        const handleStartMonitoringClick = useCallback(() => {
            runSiteDetailsBackgroundOperation(
                "SiteDetailsNavigation.handleStartMonitoringClick",
                handleStartMonitoring
            );
        }, [handleStartMonitoring]);

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

        const analyticsTabKey = `${selectedMonitorId}-analytics`;
        const tabDefinitions = useMemo(
            () =>
                [
                    {
                        Icon: AppIcons.ui.home,
                        key: "site-overview",
                        label: "Site Overview",
                        onSelect: handleSiteOverviewClick,
                    },
                    {
                        Icon: AppIcons.metrics.activity,
                        key: "monitor-overview",
                        label: "Monitor Overview",
                        onSelect: handleMonitorOverviewClick,
                    },
                    {
                        Icon: AppIcons.ui.analytics,
                        key: analyticsTabKey,
                        label: `${monitorTypeLabel} Analytics`,
                        onSelect: handleMonitorAnalyticsClick,
                    },
                    {
                        Icon: AppIcons.ui.history,
                        key: "history",
                        label: "History",
                        onSelect: handleHistoryClick,
                    },
                    {
                        Icon: AppIcons.settings.gear,
                        key: "settings",
                        label: "Settings",
                        onSelect: handleSettingsClick,
                    },
                ] as const,
            [
                analyticsTabKey,
                handleHistoryClick,
                handleMonitorAnalyticsClick,
                handleMonitorOverviewClick,
                handleSettingsClick,
                handleSiteOverviewClick,
                monitorTypeLabel,
            ]
        );

        const handleTabKeyDown = useCallback(
            (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
                const currentIndex = tabDefinitions.findIndex(
                    ({ key }) => key === activeSiteDetailsTab
                );
                if (currentIndex === -1) {
                    return;
                }

                const nextIndex = resolveNextTabIndex({
                    currentIndex,
                    key: event.key,
                    tabCount: tabDefinitions.length,
                });

                if (nextIndex === null) {
                    return;
                }

                const nextTab = tabDefinitions[nextIndex];
                if (!nextTab) {
                    return;
                }

                event.preventDefault();
                nextTab.onSelect();

                queueMicrotask(() => {
                    document
                        .querySelector<HTMLElement>(
                            `#${CSS.escape(resolveSiteDetailsTabId(nextTab.key))}`
                        )
                        ?.focus();
                });
            },
            [activeSiteDetailsTab, tabDefinitions]
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
                    <div
                        aria-label="Site details tabs"
                        className="site-details-navigation__tabs"
                        role="tablist"
                    >
                        {tabDefinitions.map(
                            ({ Icon, key, label, onSelect }) => {
                                const isActive = activeSiteDetailsTab === key;

                                return (
                                    <ThemedButton
                                        aria-controls="site-details-tabpanel"
                                        aria-selected={isActive}
                                        className="flex items-center gap-2"
                                        id={resolveSiteDetailsTabId(key)}
                                        key={key}
                                        onClick={onSelect}
                                        onKeyDown={handleTabKeyDown}
                                        role="tab"
                                        size="sm"
                                        tabIndex={isActive ? 0 : -1}
                                        variant={
                                            isActive
                                                ? BUTTON_VARIANT_PRIMARY
                                                : BUTTON_VARIANT_SECONDARY
                                        }
                                    >
                                        <Icon size={16} />
                                        <span>{label}</span>
                                    </ThemedButton>
                                );
                            }
                        )}
                    </div>

                    {/* Monitor Selection and Site-level Controls (right) */}
                    <div className="site-details-navigation__controls">
                        {/* Site-level monitoring controls */}
                        <div className="site-details-navigation__control-group">
                            <SiteMonitoringButton
                                allMonitorsRunning={isAllMonitorsRunning}
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
                                            className="flex min-w-20 items-center justify-center gap-2"
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
                                            className="flex min-w-20 items-center justify-center gap-2"
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
