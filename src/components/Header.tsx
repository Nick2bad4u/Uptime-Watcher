import { useStore } from "../store";
import { UI_DELAYS } from "../constants";
import { ThemedBox, ThemedText, ThemedButton, StatusIndicator, ThemedSelect } from "../theme/components";
import { useTheme } from "../theme/useTheme";
import { CHECK_INTERVALS } from "../constants";
import { useState, useEffect } from "react";

interface HeaderProps {
    onStartMonitoring: () => void;
    onStopMonitoring: () => void;
}

export function Header({ onStartMonitoring, onStopMonitoring }: HeaderProps) {
    const {
        isMonitoring,
        sites,
        checkInterval,
        setShowSettings,
        isLoading,
        updateCheckIntervalValue,
    } = useStore();

    const { toggleTheme, isDark } = useTheme();

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

    const handleIntervalChange = async (interval: number) => {
        try {
            await updateCheckIntervalValue(interval);
        } catch (error) {
            console.error("Failed to update check interval:", error);
            // Error is already handled by the store action
        }
    };

    const handleStartMonitoring = async () => {
        try {
            await onStartMonitoring();
        } catch (error) {
            console.error("Failed to start monitoring:", error);
            // Error is handled by the calling component
        }
    };

    const handleStopMonitoring = async () => {
        try {
            await onStopMonitoring();
        } catch (error) {
            console.error("Failed to stop monitoring:", error);
            // Error is handled by the calling component
        }
    };

    return (
        <ThemedBox surface="elevated" padding="md" className="shadow-sm border-b" border>
            <div className="header-container">
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center space-x-4">
                        <ThemedText size="2xl" weight="bold">
                            📊 Uptime Watcher
                        </ThemedText>

                        {/* Status Summary */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                                <StatusIndicator status="up" size="sm" />
                                <ThemedText size="sm" variant="secondary">
                                    {upSites} Up
                                </ThemedText>
                            </div>
                            <div className="flex items-center space-x-1">
                                <StatusIndicator status="down" size="sm" />
                                <ThemedText size="sm" variant="secondary">
                                    {downSites} Down
                                </ThemedText>
                            </div>
                            <div className="flex items-center space-x-1">
                                <StatusIndicator status="pending" size="sm" />
                                <ThemedText size="sm" variant="secondary">
                                    {pendingSites} Pending
                                </ThemedText>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Check Interval Selector */}
                        <div className="flex items-center space-x-2">
                            <ThemedText size="sm" variant="secondary">
                                Check every:
                            </ThemedText>
                            <ThemedSelect
                                value={checkInterval}
                                onChange={(e) => handleIntervalChange(Number(e.target.value))}
                                disabled={isLoading}
                                aria-label="Check interval"
                                className="text-sm"
                            >
                                {CHECK_INTERVALS.map((interval) => (
                                    <option key={interval.value} value={interval.value}>
                                        {interval.label}
                                    </option>
                                ))}
                            </ThemedSelect>
                        </div>

                        {/* Monitoring Controls */}
                        <div className="flex items-center space-x-2">
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
                        </div>

                        {/* Theme Toggle */}
                        <ThemedButton variant="secondary" size="sm" onClick={toggleTheme} className="p-2">
                            {isDark ? "☀️" : "🌙"}
                        </ThemedButton>

                        {/* Settings Button */}
                        <ThemedButton
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowSettings(true)}
                            className="p-2"
                        >
                            ⚙️
                        </ThemedButton>
                    </div>
                </div>
            </div>
        </ThemedBox>
    );
}
