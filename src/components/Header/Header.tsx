/**
 * Header component providing global status overview and application controls.
 *
 * @remarks
 * Displays application title, global uptime statistics, monitor counts, status
 * indicators, theme toggle, and settings access. Integrates with Zustand stores
 * for state management and provides responsive layout with accessibility
 * support.
 *
 * Features:
 *
 * - Application branding and title
 * - Global uptime statistics and monitor counts
 * - Status indicators for up/down/pending/paused monitors
 * - Theme toggle functionality
 * - Settings modal access
 * - Responsive layout with accessibility support
 */

import type { JSX } from "react/jsx-runtime";

import { useCallback } from "react";

import { useGlobalMonitoringMetrics } from "../../hooks/useGlobalMonitoringMetrics";
import { useUIStore } from "../../stores/ui/useUiStore";
import { ThemedBox } from "../../theme/components/ThemedBox";
import { ThemedText } from "../../theme/components/ThemedText";
import { useAvailabilityColors, useTheme } from "../../theme/useTheme";
import { AppIcons } from "../../utils/icons";
import { Tooltip } from "../common/Tooltip/Tooltip";
import { useSidebarLayout } from "../Layout/SidebarLayoutContext";
import "./Header.css";
import { HeaderControls } from "./HeaderControls";
import { StatusSubscriptionIndicator } from "./StatusSubscriptionIndicator";
import { StatusSummary } from "./StatusSummary";

/**
 * Main header component for the application.
 *
 * Features:
 *
 * - Global uptime statistics across all monitors
 * - Status indicator counts (up/down/pending)
 * - Theme toggle (light/dark mode)
 * - Settings modal trigger
 * - Responsive layout with proper text truncation
 *
 * @returns JSX element containing the application header
 */
export const Header = (): JSX.Element => {
    const { setShowAddSiteModal, setShowSettings, siteListLayout } =
        useUIStore();
    const { isDark, toggleTheme } = useTheme();
    const { getAvailabilityColor } = useAvailabilityColors();
    const { toggleSidebar } = useSidebarLayout();
    const metrics = useGlobalMonitoringMetrics();

    const {
        activeMonitors,
        monitorStatusCounts,
        totalMonitors,
        uptimePercentage,
    } = metrics;

    const {
        degraded: degradedMonitors,
        down: downMonitors,
        paused: pausedMonitors,
        pending: pendingMonitors,
        total: totalStatusMonitors,
        up: upMonitors,
    } = monitorStatusCounts;

    // Memoized click handlers to prevent unnecessary re-renders
    const handleShowAddSiteModal = useCallback(() => {
        setShowAddSiteModal(true);
    }, [setShowAddSiteModal]);

    const handleShowSettings = useCallback(() => {
        setShowSettings(true);
    }, [setShowSettings]);

    const SidebarToggleIcon = AppIcons.layout.viewColumns;
    const ActiveIcon = AppIcons.metrics.monitor;
    const GlobalUptimeIcon = AppIcons.metrics.uptime;

    return (
        <header className="app-topbar" data-testid="app-header" role="banner">
            <ThemedBox
                className="app-topbar__container"
                data-testid="app-header-container"
                padding="lg"
                rounded="xl"
                shadow="md"
                surface="elevated"
            >
                <div className="app-topbar__grid">
                    <div className="app-topbar__identity">
                        <Tooltip
                            content="Toggle navigation sidebar"
                            position="bottom"
                        >
                            {(triggerProps) => (
                                <button
                                    {...triggerProps}
                                    aria-label="Toggle navigation sidebar"
                                    className="app-topbar__sidebar-toggle"
                                    data-testid="header-sidebar-toggle"
                                    onClick={toggleSidebar}
                                    type="button"
                                >
                                    <SidebarToggleIcon size={20} />
                                </button>
                            )}
                        </Tooltip>
                        <div className="app-topbar__identity-text">
                            <ThemedText
                                className="app-topbar__title"
                                size="xl"
                                weight="semibold"
                            >
                                Uptime Watcher
                            </ThemedText>
                            <ThemedText
                                className="app-topbar__subtitle"
                                size="sm"
                                variant="secondary"
                            >
                                Command center for resilient sites
                            </ThemedText>
                        </div>
                    </div>

                    <div className="app-topbar__metrics">
                        <div className="app-topbar__badges">
                            <div className="app-topbar__badge">
                                <span
                                    aria-hidden="true"
                                    className="app-topbar__badge-icon"
                                >
                                    <ActiveIcon size={18} />
                                </span>
                                <div className="app-topbar__badge-body">
                                    <span className="app-topbar__badge-label">
                                        Active
                                    </span>
                                    <span className="app-topbar__badge-value">
                                        {activeMonitors}/{totalMonitors}
                                    </span>
                                </div>
                            </div>
                            <div className="app-topbar__badge app-topbar__badge--primary">
                                <span
                                    aria-hidden="true"
                                    className="app-topbar__badge-icon"
                                >
                                    <GlobalUptimeIcon size={18} />
                                </span>
                                <div className="app-topbar__badge-body">
                                    <span className="app-topbar__badge-label">
                                        Global Uptime
                                    </span>
                                    <span className="app-topbar__badge-value">
                                        {uptimePercentage}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {siteListLayout === "card-large" ? null : (
                            <div className="app-topbar__summary">
                                <StatusSummary
                                    degradedMonitors={degradedMonitors}
                                    downMonitors={downMonitors}
                                    getAvailabilityColor={getAvailabilityColor}
                                    pausedMonitors={pausedMonitors}
                                    pendingMonitors={pendingMonitors}
                                    totalMonitors={totalStatusMonitors}
                                    upMonitors={upMonitors}
                                    uptimePercentage={uptimePercentage}
                                />
                            </div>
                        )}
                    </div>

                    <div className="app-topbar__controls">
                        <StatusSubscriptionIndicator />
                        <HeaderControls
                            isDark={isDark}
                            onShowAddSiteModal={handleShowAddSiteModal}
                            onShowSettings={handleShowSettings}
                            onToggleTheme={toggleTheme}
                            orientation="vertical"
                        />
                    </div>
                </div>
            </ThemedBox>
        </header>
    );
};
