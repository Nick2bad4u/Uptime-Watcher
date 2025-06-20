import { useMemo, useEffect } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    ChartOptions,
    Filler,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { Line, Bar } from "react-chartjs-2";
import { Site } from "../types";
import { useTheme } from "../theme/useTheme";
import { useStore } from "../store";
import { ThemedBox, ThemedText, ThemedButton, StatusIndicator } from "../theme/components";
import "chartjs-adapter-date-fns";
import "./SiteDetails.css";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    Filler,
    zoomPlugin
);

interface SiteDetailsProps {
    site: Site;
    onClose: () => void;
}

export function SiteDetails({ site, onClose }: SiteDetailsProps) {
    const { currentTheme } = useTheme();
    const { removeSite, setError, setLoading, isLoading, selectedSite, updateSiteStatus } = useStore();

    // Auto-refresh when selected site updates
    useEffect(() => {
        const handleStatusUpdate = (update: any) => {
            if (update.site.url === site.url) {
                updateSiteStatus(update);
            }
        };

        window.electronAPI.onStatusUpdate(handleStatusUpdate);

        return () => {
            window.electronAPI.removeAllListeners("status-update");
        };
    }, [site.url, updateSiteStatus]);

    // Use the updated site from store if available
    const currentSite = selectedSite && selectedSite.url === site.url ? selectedSite : site;
    // Memoize chart options to ensure they update when theme changes
    const lineChartOptions = useMemo(
        (): ChartOptions<"line"> => ({
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: "index",
            },
            plugins: {
                legend: {
                    position: "top" as const,
                    labels: {
                        color: currentTheme.colors.text.primary,
                        font: {
                            family: currentTheme.typography.fontFamily.sans.join(", "),
                            size: 12,
                        },
                    },
                },
                title: {
                    display: true,
                    text: "Response Time Over Time",
                    color: currentTheme.colors.text.primary,
                    font: {
                        family: currentTheme.typography.fontFamily.sans.join(", "),
                        size: 16,
                        weight: "bold",
                    },
                },
                tooltip: {
                    backgroundColor: currentTheme.colors.surface.elevated,
                    titleColor: currentTheme.colors.text.primary,
                    bodyColor: currentTheme.colors.text.secondary,
                    borderColor: currentTheme.colors.border.primary,
                    borderWidth: 1,
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true,
                        },
                        mode: "x",
                    },
                    pan: {
                        enabled: true,
                        mode: "x",
                    },
                },
            },
            scales: {
                x: {
                    type: "time" as const,
                    time: {
                        displayFormats: {
                            minute: "HH:mm",
                            hour: "HH:mm",
                            day: "MMM dd",
                        },
                    },
                    grid: {
                        color: currentTheme.colors.border.secondary,
                    },
                    ticks: {
                        color: currentTheme.colors.text.secondary,
                        font: {
                            family: currentTheme.typography.fontFamily.sans.join(", "),
                            size: 11,
                        },
                    },
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Response Time (ms)",
                        color: currentTheme.colors.text.secondary,
                        font: {
                            family: currentTheme.typography.fontFamily.sans.join(", "),
                            size: 12,
                        },
                    },
                    grid: {
                        color: currentTheme.colors.border.secondary,
                    },
                    ticks: {
                        color: currentTheme.colors.text.secondary,
                        font: {
                            family: currentTheme.typography.fontFamily.sans.join(", "),
                            size: 11,
                        },
                    },
                },
            },
        }),
        [currentTheme]
    );

    const barChartOptions = useMemo(
        (): ChartOptions<"bar"> => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: "Status Distribution",
                    color: currentTheme.colors.text.primary,
                    font: {
                        family: currentTheme.typography.fontFamily.sans.join(", "),
                        size: 16,
                        weight: "bold",
                    },
                },
                tooltip: {
                    backgroundColor: currentTheme.colors.surface.elevated,
                    titleColor: currentTheme.colors.text.primary,
                    bodyColor: currentTheme.colors.text.secondary,
                    borderColor: currentTheme.colors.border.primary,
                    borderWidth: 1,
                },
            },
            scales: {
                x: {
                    grid: {
                        color: currentTheme.colors.border.secondary,
                    },
                    ticks: {
                        color: currentTheme.colors.text.secondary,
                        font: {
                            family: currentTheme.typography.fontFamily.sans.join(", "),
                            size: 11,
                        },
                    },
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Count",
                        color: currentTheme.colors.text.secondary,
                        font: {
                            family: currentTheme.typography.fontFamily.sans.join(", "),
                            size: 12,
                        },
                    },
                    grid: {
                        color: currentTheme.colors.border.secondary,
                    },
                    ticks: {
                        color: currentTheme.colors.text.secondary,
                        font: {
                            family: currentTheme.typography.fontFamily.sans.join(", "),
                            size: 11,
                        },
                    },
                },
            },
        }),
        [currentTheme]
    );
    // Memoize chart data to ensure theme updates
    const lineChartData = useMemo(() => {
        // Sort history from oldest to newest for proper chart display
        const sortedHistory = [...currentSite.history].sort((a, b) => a.timestamp - b.timestamp);

        return {
            datasets: [
                {
                    label: "Response Time",
                    data: sortedHistory.map((record) => ({
                        x: record.timestamp,
                        y: record.responseTime,
                    })),
                    borderColor: currentTheme.colors.primary[500],
                    backgroundColor: `${currentTheme.colors.primary[500]}20`,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1,
                    pointBackgroundColor: sortedHistory.map((record) =>
                        record.status === "up" ? currentTheme.colors.success : currentTheme.colors.error
                    ),
                    pointBorderColor: sortedHistory.map((record) =>
                        record.status === "up" ? currentTheme.colors.success : currentTheme.colors.error
                    ),
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
            ],
        };
    }, [currentSite.history, currentTheme]);
    // Calculate statistics
    const upCount = currentSite.history.filter((h) => h.status === "up").length;
    const downCount = currentSite.history.filter((h) => h.status === "down").length;
    const avgResponseTime =
        currentSite.history.length > 0
            ? Math.round(currentSite.history.reduce((sum, h) => sum + h.responseTime, 0) / currentSite.history.length)
            : 0;
    const uptime = currentSite.history.length > 0 ? ((upCount / currentSite.history.length) * 100).toFixed(2) : "0";

    // Enhanced statistics
    const recentHistory = currentSite.history.slice(-24); // Last 24 checks
    const recentUptime =
        recentHistory.length > 0
            ? ((recentHistory.filter((h) => h.status === "up").length / recentHistory.length) * 100).toFixed(1)
            : "0";

    const fastestResponse =
        currentSite.history.length > 0 ? Math.min(...currentSite.history.map((h) => h.responseTime)) : 0;

    const slowestResponse =
        currentSite.history.length > 0 ? Math.max(...currentSite.history.map((h) => h.responseTime)) : 0; // Handler functions
    const handleCheckNow = async () => {
        setLoading(true);
        try {
            await window.electronAPI.checkSiteNow(currentSite.url);
        } catch (error) {
            console.error("Failed to check site:", error);
            setError("Failed to check site");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSite = async () => {
        if (!window.confirm(`Are you sure you want to remove ${currentSite.name || currentSite.url}?`)) {
            return;
        }

        setLoading(true);
        try {
            await window.electronAPI.removeSite(currentSite.url);
            removeSite(currentSite.url);
            onClose(); // Close the details view after removing
        } catch (error) {
            console.error("Failed to remove site:", error);
            setError("Failed to remove site");
        } finally {
            setLoading(false);
        }
    };

    const barChartData = useMemo(
        () => ({
            labels: ["Up", "Down"],
            datasets: [
                {
                    label: "Status Count",
                    data: [upCount, downCount],
                    backgroundColor: [currentTheme.colors.success, currentTheme.colors.error],
                    borderColor: [currentTheme.colors.success, currentTheme.colors.error],
                    borderWidth: 1,
                },
            ],
        }),
        [upCount, downCount, currentTheme]
    );

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    const formatResponseTime = (time: number) => {
        if (time < 1000) return `${time}ms`;
        return `${(time / 1000).toFixed(2)}s`;
    };
    return (
        <div className="site-details-modal" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()}>
                <ThemedBox surface="overlay" padding="lg" rounded="lg" shadow="xl" className="site-details-content">
                    {" "}
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <StatusIndicator status={currentSite.status as any} size="lg" />
                            <div>
                                <ThemedText size="xl" weight="bold">
                                    {currentSite.name || currentSite.url}
                                </ThemedText>
                                {currentSite.name && (
                                    <ThemedText size="sm" variant="tertiary">
                                        {currentSite.url}
                                    </ThemedText>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <ThemedButton
                                variant="primary"
                                size="sm"
                                onClick={handleCheckNow}
                                loading={isLoading}
                                className="px-4"
                            >
                                {isLoading ? "Checking..." : "Check Now"}
                            </ThemedButton>
                            <ThemedButton
                                variant="secondary"
                                size="sm"
                                onClick={handleRemoveSite}
                                loading={isLoading}
                                className="px-4"
                            >
                                Remove Site
                            </ThemedButton>
                            <ThemedButton variant="ghost" size="sm" onClick={onClose}>
                                ✕
                            </ThemedButton>
                        </div>
                    </div>
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <ThemedBox surface="base" padding="md" border>
                            <ThemedText size="sm" variant="secondary">
                                Current Status
                            </ThemedText>
                            <div className="flex items-center space-x-2 mt-1">
                                <StatusIndicator status={site.status as any} size="sm" />
                                <ThemedText size="lg" weight="medium" className="capitalize">
                                    {site.status}
                                </ThemedText>
                            </div>
                        </ThemedBox>

                        <ThemedBox surface="base" padding="md" border>
                            <ThemedText size="sm" variant="secondary">
                                Uptime
                            </ThemedText>
                            <ThemedText size="lg" weight="medium" className="mt-1">
                                {uptime}%
                            </ThemedText>
                        </ThemedBox>

                        <ThemedBox surface="base" padding="md" border>
                            <ThemedText size="sm" variant="secondary">
                                Avg Response
                            </ThemedText>
                            <ThemedText size="lg" weight="medium" className="mt-1">
                                {formatResponseTime(avgResponseTime)}
                            </ThemedText>
                        </ThemedBox>

                        <ThemedBox surface="base" padding="md" border>
                            <ThemedText size="sm" variant="secondary">
                                Total Checks
                            </ThemedText>
                            <ThemedText size="lg" weight="medium" className="mt-1">
                                {site.history.length}
                            </ThemedText>
                        </ThemedBox>
                    </div>
                    {/* Enhanced Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <ThemedBox surface="base" padding="md" border>
                            <ThemedText size="sm" variant="secondary">
                                Recent Uptime
                            </ThemedText>
                            <ThemedText size="lg" weight="medium" className="mt-1">
                                {recentUptime}%
                            </ThemedText>
                        </ThemedBox>

                        <ThemedBox surface="base" padding="md" border>
                            <ThemedText size="sm" variant="secondary">
                                Fastest Response
                            </ThemedText>
                            <ThemedText size="lg" weight="medium" className="mt-1">
                                {formatResponseTime(fastestResponse)}
                            </ThemedText>
                        </ThemedBox>

                        <ThemedBox surface="base" padding="md" border>
                            <ThemedText size="sm" variant="secondary">
                                Slowest Response
                            </ThemedText>
                            <ThemedText size="lg" weight="medium" className="mt-1">
                                {formatResponseTime(slowestResponse)}
                            </ThemedText>
                        </ThemedBox>

                        <ThemedBox surface="base" padding="md" border>
                            <ThemedText size="sm" variant="secondary">
                                Action
                            </ThemedText>
                            <div className="flex space-x-2 mt-1">
                                {" "}
                                <ThemedButton
                                    variant="primary"
                                    size="sm"
                                    onClick={handleCheckNow}
                                    loading={isLoading}
                                    className="flex-1"
                                >
                                    Check Now
                                </ThemedButton>
                                <ThemedButton
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleRemoveSite}
                                    loading={isLoading}
                                    className="flex-1"
                                >
                                    Remove
                                </ThemedButton>
                            </div>
                        </ThemedBox>
                    </div>
                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Response Time Chart */}
                        <ThemedBox surface="base" padding="md" border>
                            {" "}
                            <div className="h-64">
                                <Line data={lineChartData} options={lineChartOptions} />
                            </div>
                        </ThemedBox>

                        {/* Status Distribution Chart */}
                        <ThemedBox surface="base" padding="md" border>
                            {" "}
                            <div className="h-64">
                                <Bar data={barChartData} options={barChartOptions} />
                            </div>
                        </ThemedBox>
                    </div>{" "}
                    {/* Recent History */}
                    <ThemedBox surface="base" padding="md" border>
                        <ThemedText size="lg" weight="medium" className="mb-4">
                            Recent History (Last 10 Checks)
                        </ThemedText>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {currentSite.history
                                .slice(0, 10) // Get first 10 (newest since history is already sorted newest first)
                                .map((record, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 rounded bg-surface-elevated"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <StatusIndicator status={record.status as any} size="sm" />
                                            <ThemedText size="sm">{formatTimestamp(record.timestamp)}</ThemedText>
                                        </div>
                                        <ThemedText size="sm" variant="secondary">
                                            {formatResponseTime(record.responseTime)}
                                        </ThemedText>
                                    </div>
                                ))}
                        </div>
                    </ThemedBox>
                </ThemedBox>
            </div>
        </div>
    );
}
