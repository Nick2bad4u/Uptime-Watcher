/**
 * Header component providing global status overview and application controls.
 * Displays uptime statistics, theme toggle, and settings access.
 */

/* eslint-disable functional/no-let */
import { useStore } from "../../store";
import { ThemedBox, ThemedText, ThemedButton, StatusIndicator } from "../../theme/components";
import { useTheme, useAvailabilityColors } from "../../theme/useTheme";
import "./Header.css";

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
export function Header() {
    const { setShowSettings, sites } = useStore();
    const { isDark, toggleTheme } = useTheme();
    const { getAvailabilityColor } = useAvailabilityColors();

    // Count all monitors across all sites by status
    let upMonitors = 0;
    let downMonitors = 0;
    let pendingMonitors = 0;
    let totalMonitors = 0;

    // Iterate through all sites and their monitors to calculate totals
    for (const site of sites) {
        if (site.monitors)
            for (const monitor of site.monitors) {
                totalMonitors++;
                if (monitor.status === "up") upMonitors++;
                else if (monitor.status === "down") downMonitors++;
                else if (monitor.status === "pending") pendingMonitors++;
            }
    }

    // Calculate overall uptime percentage across all monitors
    const uptimePercentage = totalMonitors > 0 ? Math.round((upMonitors / totalMonitors) * 100) : 0;

    return (
        <ThemedBox surface="elevated" padding="md" className="border-b shadow-sm" border>
            <div className="header-container">
                <div className="flex flex-wrap items-center justify-between gap-4 py-4">
                    {/* Left: App Title & Status Summary */}
                    <div className="flex flex-wrap items-center flex-shrink min-w-0 gap-6">
                        {/* App Title with subtle background and border */}
                        <span className="flex items-center gap-2 min-w-[180px] px-4 py-1 header-title-box">
                            <span className="text-2xl select-none">📊</span>
                            <ThemedText size="2xl" weight="bold" className="truncate header-title-accent">
                                Uptime Watcher
                            </ThemedText>
                        </span>

                        {/* Status Summary - Enhanced */}
                        <ThemedBox
                            variant="secondary"
                            padding="sm"
                            rounded="lg"
                            shadow="sm"
                            className="flex items-center space-x-3 transition-all duration-300 min-w-[340px] header-status-summary-box"
                        >
                            {/* Overall Health Badge */}
                            {totalMonitors > 0 && (
                                <div
                                    className={`flex items-center space-x-2 px-3 py-1 rounded-md group transition-all duration-200 health-badge`}
                                    data-health-color={getAvailabilityColor(uptimePercentage)}
                                >
                                    <div
                                        className="w-3 h-3 rounded-full animate-pulse health-dot"
                                        data-health-color={getAvailabilityColor(uptimePercentage)}
                                    />
                                    <div className="flex flex-col">
                                        <ThemedText
                                            size="sm"
                                            weight="bold"
                                            className="health-text"
                                            data-health-color={getAvailabilityColor(uptimePercentage)}
                                        >
                                            {uptimePercentage}%
                                        </ThemedText>
                                        <ThemedText size="xs" variant="secondary" className="leading-none">
                                            Health
                                        </ThemedText>
                                    </div>
                                </div>
                            )}

                            {totalMonitors > 0 && <div className="w-px h-8 bg-current opacity-20" />}

                            {/* Up Status */}
                            <div className="flex items-center px-2 py-1 space-x-2 transition-all duration-200 rounded-md group status-up-badge">
                                <StatusIndicator status="up" size="sm" />
                                <div className="flex flex-col">
                                    <ThemedText size="sm" weight="semibold" variant="primary">
                                        {upMonitors}
                                    </ThemedText>
                                    <ThemedText size="xs" variant="secondary" className="leading-none">
                                        Up
                                    </ThemedText>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-8 bg-current opacity-20" />

                            {/* Down Status */}
                            <div className="flex items-center px-2 py-1 space-x-2 transition-all duration-200 rounded-md group status-down-badge">
                                <StatusIndicator status="down" size="sm" />
                                <div className="flex flex-col">
                                    <ThemedText size="sm" weight="semibold" variant="primary">
                                        {downMonitors}
                                    </ThemedText>
                                    <ThemedText size="xs" variant="secondary" className="leading-none">
                                        Down
                                    </ThemedText>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-8 bg-current opacity-20" />

                            {/* Pending Status */}
                            <div className="flex items-center px-2 py-1 space-x-2 transition-all duration-200 rounded-md group status-pending-badge">
                                <StatusIndicator status="pending" size="sm" />
                                <div className="flex flex-col">
                                    <ThemedText size="sm" weight="semibold" variant="primary">
                                        {pendingMonitors}
                                    </ThemedText>
                                    <ThemedText size="xs" variant="secondary" className="leading-none">
                                        Pending
                                    </ThemedText>
                                </div>
                            </div>

                            {/* Total Sites Badge */}
                            {totalMonitors > 0 && (
                                <>
                                    <div className="w-px h-8 bg-current opacity-20" />
                                    <div className="flex items-center px-2 py-1 space-x-2 rounded-md bg-opacity-10 total-sites-badge">
                                        <div className="w-2 h-2 bg-current rounded-full opacity-50" />
                                        <div className="flex flex-col">
                                            <ThemedText size="sm" weight="semibold" variant="primary">
                                                {totalMonitors}
                                            </ThemedText>
                                            <ThemedText size="xs" variant="secondary" className="leading-none">
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
                        {/* Theme Toggle */}
                        <ThemedBox
                            variant="tertiary"
                            padding="xs"
                            rounded="md"
                            className="flex items-center header-controls-box"
                        >
                            <ThemedButton
                                variant="secondary"
                                size="sm"
                                onClick={toggleTheme}
                                className="p-2 themed-button--icon"
                                aria-label="Toggle theme"
                            >
                                {isDark ? "☀️" : "🌙"}
                            </ThemedButton>
                        </ThemedBox>

                        {/* Settings Button */}
                        <ThemedBox
                            variant="tertiary"
                            padding="xs"
                            rounded="md"
                            className="flex items-center header-controls-box"
                        >
                            <ThemedButton
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowSettings(true)}
                                className="p-2 themed-button--icon"
                                aria-label="Settings"
                            >
                                ⚙️
                            </ThemedButton>
                        </ThemedBox>
                    </div>
                </div>
            </div>
        </ThemedBox>
    );
}
