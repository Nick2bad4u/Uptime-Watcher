import { useStore } from "../store";
import { UI_DELAYS } from "../constants";
import { ThemedBox, ThemedText, ThemedButton, StatusIndicator, ThemedSelect } from "../theme/components";
import { useTheme } from "../theme/useTheme";
import { useAvailabilityColors } from "../theme/useTheme";
import { CHECK_INTERVALS } from "../constants";
import { useState, useEffect } from "react";
import logger from "../services/logger";
import "./Header.css";

interface HeaderProps {
    onStartMonitoring: () => void;
    onStopMonitoring: () => void;
}

export function Header({ onStartMonitoring, onStopMonitoring }: HeaderProps) {
    const { isMonitoring, sites, checkInterval, setShowSettings, isLoading, updateCheckIntervalValue } = useStore();

    const { toggleTheme, isDark } = useTheme();
    const { getAvailabilityColor } = useAvailabilityColors();

    // Delayed loading state for button spinners (100ms delay)
    const [showButtonLoading, setShowButtonLoading] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isLoading) {
            // Show button loading after 100ms delay
            timeoutId = setTimeout(() => {
                setShowButtonLoading(true);
            }, UI_DELAYS.LOADING_BUTTON);
        } else {
            // Hide button loading immediately when loading stops
            setShowButtonLoading(false);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isLoading]);

    const upSites = sites.filter((site) => site.status === "up").length;
    const downSites = sites.filter((site) => site.status === "down").length;
    const pendingSites = sites.filter((site) => site.status === "pending").length;
    const totalSites = sites.length;

    // Calculate uptime percentage
    const uptimePercentage = totalSites > 0 ? Math.round((upSites / totalSites) * 100) : 0;

    const handleIntervalChange = async (interval: number) => {
        try {
            await updateCheckIntervalValue(interval);
            logger.user.settingsChange("checkInterval", checkInterval, interval);
        } catch (error) {
            logger.error("Failed to update check interval from header", error);
            // Error is already handled by the store action
        }
    };

    const handleStartMonitoring = async () => {
        try {
            await onStartMonitoring();
            logger.user.action("Started monitoring from header");
        } catch (error) {
            logger.error("Failed to start monitoring from header", error);
            // Error is handled by the calling component
        }
    };

    const handleStopMonitoring = async () => {
        try {
            await onStopMonitoring();
            logger.user.action("Stopped monitoring from header");
        } catch (error) {
            logger.error("Failed to stop monitoring from header", error);
            // Error is handled by the calling component
        }
    };

    return (
        <ThemedBox surface="elevated" padding="md" className="shadow-sm border-b" border>
            <div className="header-container">
                <div className="flex items-center justify-between py-4 gap-4 flex-wrap">
                    {/* Left: App Title & Status Summary */}
                    <div className="flex items-center gap-6 min-w-0 flex-shrink flex-wrap">
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
                            {totalSites > 0 && (
                                <div
                                    className={
                                        `flex items-center space-x-2 px-3 py-1 rounded-md group transition-all duration-200 health-badge`
                                    }
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

                            {totalSites > 0 && <div className="w-px h-8 bg-current opacity-20"></div>}

                            {/* Up Status */}
                            <div
                                className="flex items-center space-x-2 px-2 py-1 rounded-md transition-all duration-200 group status-up-badge"
                            >
                                <StatusIndicator status="up" size="sm" />
                                <div className="flex flex-col">
                                    <ThemedText size="sm" weight="semibold" variant="primary">
                                        {upSites}
                                    </ThemedText>
                                    <ThemedText size="xs" variant="secondary" className="leading-none">
                                        Up
                                    </ThemedText>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-8 bg-current opacity-20"></div>

                            {/* Down Status */}
                            <div
                                className="flex items-center space-x-2 px-2 py-1 rounded-md transition-all duration-200 group status-down-badge"
                            >
                                <StatusIndicator status="down" size="sm" />
                                <div className="flex flex-col">
                                    <ThemedText size="sm" weight="semibold" variant="primary">
                                        {downSites}
                                    </ThemedText>
                                    <ThemedText size="xs" variant="secondary" className="leading-none">
                                        Down
                                    </ThemedText>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-8 bg-current opacity-20"></div>

                            {/* Pending Status */}
                            <div
                                className="flex items-center space-x-2 px-2 py-1 rounded-md transition-all duration-200 group status-pending-badge"
                            >
                                <StatusIndicator status="pending" size="sm" />
                                <div className="flex flex-col">
                                    <ThemedText size="sm" weight="semibold" variant="primary">
                                        {pendingSites}
                                    </ThemedText>
                                    <ThemedText size="xs" variant="secondary" className="leading-none">
                                        Pending
                                    </ThemedText>
                                </div>
                            </div>

                            {/* Total Sites Badge */}
                            {totalSites > 0 && (
                                <>
                                    <div className="w-px h-8 bg-current opacity-20"></div>
                                    <div className="flex items-center space-x-2 px-2 py-1 rounded-md bg-opacity-10 total-sites-badge">
                                        <div className="w-2 h-2 rounded-full bg-current opacity-50"></div>
                                        <div className="flex flex-col">
                                            <ThemedText size="sm" weight="semibold" variant="primary">
                                                {totalSites}
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
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Check Interval Selector */}
                        <ThemedBox
                            variant="tertiary"
                            padding="xs"
                            rounded="md"
                            className="flex items-center gap-2 px-3 py-1 header-interval-box"
                        >
                            <ThemedText size="sm" variant="secondary" className="text-center flex flex-col items-center">
                                Check every:
                            </ThemedText>
                            <ThemedSelect
                                value={checkInterval}
                                onChange={(e) => handleIntervalChange(Number(e.target.value))}
                                disabled={isLoading}
                                aria-label="Check interval"
                                className="text-sm min-w-[110px]"
                            >
                                {CHECK_INTERVALS.map((interval) => (
                                    <option key={interval.value} value={interval.value}>
                                        {interval.label}
                                    </option>
                                ))}
                            </ThemedSelect>
                        </ThemedBox>

                        {/* Monitoring Controls */}
                        <ThemedBox
                            variant="tertiary"
                            padding="xs"
                            rounded="md"
                            className="flex items-center gap-2 px-2 py-1 header-controls-box"
                        >
                            {isMonitoring ? (
                                <ThemedButton
                                    variant="error"
                                    size="sm"
                                    onClick={handleStopMonitoring}
                                    disabled={isLoading}
                                    loading={showButtonLoading}
                                    className="min-w-140"
                                >
                                    ⏸️ Stop Monitoring
                                </ThemedButton>
                            ) : (
                                <ThemedButton
                                    variant="success"
                                    size="sm"
                                    onClick={handleStartMonitoring}
                                    disabled={isLoading}
                                    loading={showButtonLoading}
                                    className="min-w-140"
                                >
                                    ▶️ Start Monitoring
                                </ThemedButton>
                            )}
                        </ThemedBox>

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
