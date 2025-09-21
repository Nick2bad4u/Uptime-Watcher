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

import type { Monitor, Site } from "@shared/types";
import type { JSX } from "react/jsx-runtime";

import { useCallback, useMemo } from "react";

import { useSitesStore } from "../../stores/sites/useSitesStore";
import { useUIStore } from "../../stores/ui/useUiStore";
import { ThemedBox } from "../../theme/components/ThemedBox";
import { ThemedText } from "../../theme/components/ThemedText";
import { useAvailabilityColors, useTheme } from "../../theme/useTheme";
import { HeaderControls } from "./HeaderControls";
import "./Header.css";
import { StatusSummary } from "./StatusSummary";

/**
 * Initializes a monitor counts object with all status counts set to zero.
 *
 * @returns Initial monitor counts object with all values set to 0
 */
const initializeMonitorCounts = (): {
    degraded: number;
    down: number;
    paused: number;
    pending: number;
    total: number;
    up: number;
} => ({
    degraded: 0,
    down: 0,
    paused: 0,
    pending: 0,
    total: 0,
    up: 0,
});

/**
 * Increments the appropriate count in the monitor counts object based on
 * status.
 *
 * @param counts - The monitor counts object to modify
 * @param status - The monitor status to count
 */
const incrementCountByStatus = (
    counts: ReturnType<typeof initializeMonitorCounts>,
    status: string
): void => {
    switch (status) {
        case "degraded": {
            counts.total++;
            counts.degraded++;
            break;
        }
        case "down": {
            counts.total++;
            counts.down++;
            break;
        }
        case "paused": {
            counts.total++;
            counts.paused++;
            break;
        }
        case "pending": {
            counts.total++;
            counts.pending++;
            break;
        }
        case "up": {
            counts.total++;
            counts.up++;
            break;
        }
        default: {
            // Handle unknown/invalid status - don't count in totals
            // This ensures only valid monitors are included in health calculations
            break;
        }
    }
};

/**
 * Counts all monitors in a site and categorizes them by status.
 *
 * @param site - The site containing monitors to count
 *
 * @returns Monitor counts object with status breakdown for the site
 */
const countMonitorsInSite = (
    site: unknown
): ReturnType<typeof initializeMonitorCounts> => {
    const counts = initializeMonitorCounts();

    // Defensive programming: handle null/undefined sites
    if (!site || typeof site !== "object") {
        return counts;
    }

    // Type guard: ensure site has monitors property
    const siteObj = site as { monitors?: Monitor[] | null | undefined };
    const monitors = Array.isArray(siteObj.monitors) ? siteObj.monitors : [];

    for (const monitor of monitors) {
        // Defensive programming: handle null/undefined monitors
        const monitorObj = monitor as null | undefined | { status?: string };
        if (
            !monitorObj ||
            typeof monitorObj !== "object" ||
            !monitorObj.status
        ) {
            // Skip invalid monitors
        } else {
            incrementCountByStatus(counts, monitorObj.status);
        }
    }

    return counts;
};

/**
 * Aggregates monitor counts across all sites.
 *
 * @param sites - Array of sites to aggregate monitor counts from
 *
 * @returns Total monitor counts object with combined status breakdown
 */
const aggregateMonitorCounts = (
    sites: null | readonly Site[] | undefined
): ReturnType<typeof initializeMonitorCounts> => {
    const totalCounts = initializeMonitorCounts();

    // Defensive programming: handle null/undefined sites array
    if (!sites || !Array.isArray(sites)) {
        return totalCounts;
    }

    for (const site of sites) {
        // Defensive programming: countMonitorsInSite handles type validation internally
        const siteCounts = countMonitorsInSite(site);
        totalCounts.degraded += siteCounts.degraded;
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
    const { sites } = useSitesStore();
    const { setShowAddSiteModal, setShowSettings } = useUIStore();
    const { isDark, toggleTheme } = useTheme();
    const { getAvailabilityColor } = useAvailabilityColors();

    // Count all monitors across all sites by status using functional approach
    const monitorCounts = useMemo(() => aggregateMonitorCounts(sites), [sites]);

    const {
        degraded: degradedMonitors,
        down: downMonitors,
        paused: pausedMonitors,
        pending: pendingMonitors,
        total: totalMonitors,
        up: upMonitors,
    } = monitorCounts;

    // Calculate overall uptime percentage across all monitors
    // Up monitors count as 100%, degraded monitors count as 50%
    const uptimePercentage =
        totalMonitors > 0
            ? Math.round(
                  ((upMonitors + degradedMonitors * 0.5) / totalMonitors) * 100
              )
            : 0;

    // Memoized click handlers to prevent unnecessary re-renders
    const handleShowAddSiteModal = useCallback(() => {
        setShowAddSiteModal(true);
    }, [setShowAddSiteModal]);

    const handleShowSettings = useCallback(() => {
        setShowSettings(true);
    }, [setShowSettings]);

    return (
        <header role="banner">
            <ThemedBox
                border
                className="border-b shadow-xs"
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
                            <StatusSummary
                                degradedMonitors={degradedMonitors}
                                downMonitors={downMonitors}
                                getAvailabilityColor={getAvailabilityColor}
                                pausedMonitors={pausedMonitors}
                                pendingMonitors={pendingMonitors}
                                totalMonitors={totalMonitors}
                                upMonitors={upMonitors}
                                uptimePercentage={uptimePercentage}
                            />
                        </div>

                        {/* Right: Controls */}
                        <HeaderControls
                            isDark={isDark}
                            onShowAddSiteModal={handleShowAddSiteModal}
                            onShowSettings={handleShowSettings}
                            onToggleTheme={toggleTheme}
                        />
                    </div>
                </div>
            </ThemedBox>
        </header>
    );
};
