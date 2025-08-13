/**
 * Header component providing global status overview and application controls
 *
 * This file exports the main Header component that displays:
 * - Application title and branding
 * - Global uptime statistics and monitor counts
 * - Status indicators for up/down/pending/paused monitors
 * - Theme toggle functionality
 * - Settings modal access
 * - Responsive layout with accessibility support
 *
 * The component integrates with the application's state management via Zustand
 * stores and provides a consistent navigation and status overview experience.
 */

/**
 * Header component providing global status overview and application controls.
 * Displays uptime statistics, theme toggle, and settings access.
 */

import type { Monitor, Site } from "@shared/types";
import type { JSX } from "react/jsx-runtime";

import { useCallback, useMemo } from "react";

import { useSitesStore } from "../../stores/sites/useSitesStore";
import { useUIStore } from "../../stores/ui/useUiStore";
import StatusIndicator from "../../theme/components/StatusIndicator";
import ThemedBox from "../../theme/components/ThemedBox";
import ThemedButton from "../../theme/components/ThemedButton";
import ThemedText from "../../theme/components/ThemedText";
import "./Header.css";
import { useAvailabilityColors, useTheme } from "../../theme/useTheme";

// Helper functions for monitor counting (reduces complexity by composition)
const initializeMonitorCounts = (): {
    down: number;
    paused: number;
    pending: number;
    total: number;
    up: number;
} => ({
    down: 0,
    paused: 0,
    pending: 0,
    total: 0,
    up: 0,
});

const incrementCountByStatus = (
    counts: ReturnType<typeof initializeMonitorCounts>,
    status: string
): void => {
    counts.total++;
    switch (status) {
        case "down": {
            counts.down++;
            break;
        }
        case "paused": {
            counts.paused++;
            break;
        }
        case "pending": {
            counts.pending++;
            break;
        }
        case "up": {
            counts.up++;
            break;
        }
    }
};

const countMonitorsInSite = (
    site: Site
): ReturnType<typeof initializeMonitorCounts> => {
    const counts = initializeMonitorCounts();
    const monitors = (site.monitors as Monitor[] | null | undefined) ?? [];

    for (const monitor of monitors) {
        incrementCountByStatus(counts, monitor.status);
    }

    return counts;
};

const aggregateMonitorCounts = (
    sites: Site[]
): ReturnType<typeof initializeMonitorCounts> => {
    const totalCounts = initializeMonitorCounts();

    for (const site of sites) {
        const siteCounts = countMonitorsInSite(site);
        totalCounts.down += siteCounts.down;
        totalCounts.paused += siteCounts.paused;
        totalCounts.pending += siteCounts.pending;
        totalCounts.total += siteCounts.total;
        totalCounts.up += siteCounts.up;
    }

    return totalCounts;
};

/**
 * Main header component for the application.
 *
 * Features:
 * - Global uptime statistics across all monitors
 * - Status indicator counts (up/down/pending)
 * - Theme toggle (light/dark mode)
 * - Settings modal trigger
 * - Responsive layout with proper text truncation
 *
 * @returns JSX element containing the application header
 */
export const Header = (): JSX.Element => {
    const { sites } = useSitesStore();
    const { setShowAddSiteModal, setShowSettings } = useUIStore();
    const { isDark, toggleTheme } = useTheme();
    const { getAvailabilityColor } = useAvailabilityColors();

    // Count all monitors across all sites by status using functional approach
    const monitorCounts = useMemo(() => aggregateMonitorCounts(sites), [sites]);

    const {
        down: downMonitors,
        paused: pausedMonitors,
        pending: pendingMonitors,
        total: totalMonitors,
        up: upMonitors,
    } = monitorCounts;

    // Calculate overall uptime percentage across all monitors
    const uptimePercentage =
        totalMonitors > 0 ? Math.round((upMonitors / totalMonitors) * 100) : 0;

    // Memoized click handlers to prevent unnecessary re-renders
    const handleShowAddSiteModal = useCallback(() => {
        setShowAddSiteModal(true);
    }, [setShowAddSiteModal]);

    const handleShowSettings = useCallback(() => {
        setShowSettings(true);
    }, [setShowSettings]);

    return (
        <ThemedBox
            border
            className="border-b shadow-sm"
            padding="md"
            surface="elevated"
        >
            <div className="header-container">
                <div className="flex flex-wrap items-center justify-between gap-4 py-4">
                    {/* Left: App Title & Status Summary */}
                    <div className="flex min-w-0 shrink flex-wrap items-center gap-6">
                        {/* App Title with subtle background and border */}
                        <span className="header-title-box flex min-w-45 items-center gap-2 px-4 py-1">
                            <span className="text-2xl select-none">📊</span>
                            <ThemedText
                                className="header-title-accent truncate"
                                size="2xl"
                                weight="bold"
                            >
                                Uptime Watcher
                            </ThemedText>
                        </span>

                        {/* Status Summary - Enhanced */}
                        <ThemedBox
                            className="header-status-summary-box flex min-w-85 items-center space-x-3 transition-all duration-300"
                            padding="sm"
                            rounded="lg"
                            shadow="sm"
                            variant="secondary"
                        >
                            {/* Overall Health Badge */}
                            {totalMonitors > 0 && (
                                <div
                                    className="group health-badge flex items-center space-x-2 rounded-md px-3 py-1 transition-all duration-200"
                                    data-health-color={getAvailabilityColor(
                                        uptimePercentage
                                    )}
                                >
                                    <div
                                        className="health-dot h-3 w-3 animate-pulse rounded-full"
                                        data-health-color={getAvailabilityColor(
                                            uptimePercentage
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <ThemedText
                                            className="health-text"
                                            data-health-color={getAvailabilityColor(
                                                uptimePercentage
                                            )}
                                            size="sm"
                                            weight="bold"
                                        >
                                            {uptimePercentage}%
                                        </ThemedText>
                                        <ThemedText
                                            className="leading-none"
                                            size="xs"
                                            variant="secondary"
                                        >
                                            Health
                                        </ThemedText>
                                    </div>
                                </div>
                            )}

                            {totalMonitors > 0 && (
                                <div className="h-8 w-px bg-current opacity-20" />
                            )}

                            {/* Up Status */}
                            <div className="group status-up-badge flex items-center space-x-2 rounded-md px-2 py-1 transition-all duration-200">
                                <StatusIndicator size="sm" status="up" />
                                <div className="flex flex-col">
                                    <ThemedText
                                        size="sm"
                                        variant="primary"
                                        weight="semibold"
                                    >
                                        {upMonitors}
                                    </ThemedText>
                                    <ThemedText
                                        className="leading-none"
                                        size="xs"
                                        variant="secondary"
                                    >
                                        Up
                                    </ThemedText>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-8 w-px bg-current opacity-20" />

                            {/* Down Status */}
                            <div className="group status-down-badge flex items-center space-x-2 rounded-md px-2 py-1 transition-all duration-200">
                                <StatusIndicator size="sm" status="down" />
                                <div className="flex flex-col">
                                    <ThemedText
                                        size="sm"
                                        variant="primary"
                                        weight="semibold"
                                    >
                                        {downMonitors}
                                    </ThemedText>
                                    <ThemedText
                                        className="leading-none"
                                        size="xs"
                                        variant="secondary"
                                    >
                                        Down
                                    </ThemedText>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-8 w-px bg-current opacity-20" />

                            {/* Pending Status */}
                            <div className="group status-pending-badge flex items-center space-x-2 rounded-md px-2 py-1 transition-all duration-200">
                                <StatusIndicator size="sm" status="pending" />
                                <div className="flex flex-col">
                                    <ThemedText
                                        size="sm"
                                        variant="primary"
                                        weight="semibold"
                                    >
                                        {pendingMonitors}
                                    </ThemedText>
                                    <ThemedText
                                        className="leading-none"
                                        size="xs"
                                        variant="secondary"
                                    >
                                        Pending
                                    </ThemedText>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-8 w-px bg-current opacity-20" />

                            {/* Paused Status */}
                            <div className="group status-paused-badge flex items-center space-x-2 rounded-md px-2 py-1 transition-all duration-200">
                                <StatusIndicator size="sm" status="paused" />
                                <div className="flex flex-col">
                                    <ThemedText
                                        size="sm"
                                        variant="primary"
                                        weight="semibold"
                                    >
                                        {pausedMonitors}
                                    </ThemedText>
                                    <ThemedText
                                        className="leading-none"
                                        size="xs"
                                        variant="secondary"
                                    >
                                        Paused
                                    </ThemedText>
                                </div>
                            </div>

                            {/* Total Sites Badge */}
                            {totalMonitors > 0 && (
                                <>
                                    <div className="h-8 w-px bg-current opacity-20" />
                                    <div className="total-sites-badge flex items-center space-x-2 rounded-md bg-gray-500/10 px-2 py-1">
                                        <div className="h-2 w-2 rounded-full bg-current opacity-50" />
                                        <div className="flex flex-col">
                                            <ThemedText
                                                size="sm"
                                                variant="primary"
                                                weight="semibold"
                                            >
                                                {totalMonitors}
                                            </ThemedText>
                                            <ThemedText
                                                className="leading-none"
                                                size="xs"
                                                variant="secondary"
                                            >
                                                Total
                                            </ThemedText>
                                        </div>
                                    </div>
                                </>
                            )}
                        </ThemedBox>
                    </div>

                    {/* Right: Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Add Site Button */}
                        <ThemedBox
                            className="header-controls-box flex items-center"
                            padding="xs"
                            rounded="md"
                            variant="tertiary"
                        >
                            <ThemedButton
                                aria-label="Add new site"
                                className="themed-button--icon p-2"
                                onClick={handleShowAddSiteModal}
                                size="sm"
                                variant="secondary"
                            >
                                ➕
                            </ThemedButton>
                        </ThemedBox>

                        {/* Theme Toggle */}
                        <ThemedBox
                            className="header-controls-box flex items-center"
                            padding="xs"
                            rounded="md"
                            variant="tertiary"
                        >
                            <ThemedButton
                                aria-label="Toggle theme"
                                className="themed-button--icon p-2"
                                onClick={toggleTheme}
                                size="sm"
                                variant="secondary"
                            >
                                {isDark ? "☀️" : "🌙"}
                            </ThemedButton>
                        </ThemedBox>

                        {/* Settings Button */}
                        <ThemedBox
                            className="header-controls-box flex items-center"
                            padding="xs"
                            rounded="md"
                            variant="tertiary"
                        >
                            <ThemedButton
                                aria-label="Settings"
                                className="themed-button--icon p-2"
                                onClick={handleShowSettings}
                                size="sm"
                                variant="secondary"
                            >
                                ⚙️
                            </ThemedButton>
                        </ThemedBox>
                    </div>
                </div>
            </div>
        </ThemedBox>
    );
};
