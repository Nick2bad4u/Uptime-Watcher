import { useMemo, useEffect, useState } from "react";
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
    DoughnutController,
    ArcElement,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { Line, Bar, Doughnut } from "react-chartjs-2";
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
    DoughnutController,
    ArcElement,
    zoomPlugin
);

interface SiteDetailsProps {
    site: Site;
    onClose: () => void;
}

export function SiteDetails({ site, onClose }: SiteDetailsProps) {
    const { currentTheme, getStatusColor } = useTheme();
    const { removeSite, setError, setLoading, isLoading, selectedSite, updateSiteStatus } = useStore();
    
    // Enhanced state management
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'history' | 'settings'>('overview');
    const [chartTimeRange, setChartTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

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

    // Auto-refresh interval
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(async () => {
            if (!isLoading && !isRefreshing) {
                await handleCheckNow(true);
            }
        }, 30000); // Auto-refresh every 30 seconds

        return () => clearInterval(interval);
    }, [autoRefresh, isLoading, isRefreshing]);

    // Use the updated site from store if available
    const currentSite = selectedSite && selectedSite.url === site.url ? selectedSite : site;
    // Enhanced statistics with time-based filtering
    const getFilteredHistory = (timeRange: string) => {
        const now = Date.now();
        const ranges = {
            '1h': 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
        };
        const cutoff = now - ranges[timeRange as keyof typeof ranges];
        return currentSite.history.filter(record => record.timestamp >= cutoff);
    };

    const filteredHistory = getFilteredHistory(chartTimeRange);
    const upCount = filteredHistory.filter((h) => h.status === "up").length;
    const downCount = filteredHistory.filter((h) => h.status === "down").length;
    const totalChecks = filteredHistory.length;
    
    // Advanced metrics calculations
    const avgResponseTime = totalChecks > 0
        ? Math.round(filteredHistory.reduce((sum, h) => sum + h.responseTime, 0) / totalChecks)
        : 0;
    
    const uptime = totalChecks > 0 ? ((upCount / totalChecks) * 100).toFixed(2) : "0";
    const availability = totalChecks > 0 ? ((upCount / totalChecks) * 100).toFixed(1) : "0";
    
    const fastestResponse = filteredHistory.length > 0 
        ? Math.min(...filteredHistory.map((h) => h.responseTime)) 
        : 0;
    const slowestResponse = filteredHistory.length > 0 
        ? Math.max(...filteredHistory.map((h) => h.responseTime)) 
        : 0;
    
    // Calculate response time percentiles
    const sortedResponseTimes = filteredHistory.map(h => h.responseTime).sort((a, b) => a - b);
    const p50 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.5)] || 0;
    const p95 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)] || 0;
    const p99 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)] || 0;
    
    // Downtime periods calculation
    const downtimePeriods = [];
    let currentDowntime = null;
    for (const record of [...filteredHistory].reverse()) {
        if (record.status === 'down') {
            if (!currentDowntime) {
                currentDowntime = { start: record.timestamp, end: record.timestamp, duration: 0 };
            } else {
                currentDowntime.end = record.timestamp;
            }
        } else if (currentDowntime) {
            currentDowntime.duration = currentDowntime.end - currentDowntime.start;
            downtimePeriods.push(currentDowntime);
            currentDowntime = null;
        }
    }
    
    const totalDowntime = downtimePeriods.reduce((sum, period) => sum + period.duration, 0);
    const mttr = downtimePeriods.length > 0 ? totalDowntime / downtimePeriods.length : 0; // Mean Time To Recovery
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

    // Enhanced handler functions
    const handleCheckNow = async (isAutoRefresh = false) => {
        if (isAutoRefresh) {
            setIsRefreshing(true);
        } else {
            setLoading(true);
        }
        
        try {
            await window.electronAPI.checkSiteNow(currentSite.url);
        } catch (error) {
            console.error("Failed to check site:", error);
            setError("Failed to check site");
        } finally {
            if (isAutoRefresh) {
                setIsRefreshing(false);
            } else {
                setLoading(false);
            }
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

    // Enhanced chart data with time filtering
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

    // New doughnut chart for uptime visualization
    const uptimeChartData = useMemo(
        () => ({
            labels: ["Uptime", "Downtime"],
            datasets: [
                {
                    data: [upCount, downCount],
                    backgroundColor: [
                        currentTheme.colors.success,
                        currentTheme.colors.error,
                    ],
                    borderColor: [
                        currentTheme.colors.success,
                        currentTheme.colors.error,
                    ],
                    borderWidth: 2,
                },
            ],
        }),
        [upCount, downCount, currentTheme]
    );

    const doughnutOptions = useMemo(
        (): ChartOptions<"doughnut"> => ({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom" as const,
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
                    text: "Uptime Distribution",
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
                    callbacks: {
                        label: function(context) {
                            const percentage = totalChecks > 0 ? ((context.parsed / totalChecks) * 100).toFixed(1) : '0';
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                },
            },
        }),
        [currentTheme, totalChecks]
    );
    // Utility functions
    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    const formatResponseTime = (time: number) => {
        if (time < 1000) return `${time}ms`;
        return `${(time / 1000).toFixed(2)}s`;
    };

    const formatDuration = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    // Tab component
    const TabButton = ({ id, label, isActive, onClick }: { 
        id: string; 
        label: string; 
        isActive: boolean; 
        onClick: () => void;
    }) => (
        <ThemedButton
            variant={isActive ? "primary" : "ghost"}
            size="sm"
            onClick={onClick}
            className={`px-4 py-2 ${isActive ? 'shadow-sm' : ''}`}
        >
            {label}
        </ThemedButton>
    );

    return (
        <div className="site-details-modal" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()}>
                <ThemedBox 
                    surface="overlay" 
                    padding="lg" 
                    rounded="lg" 
                    shadow="xl" 
                    className="site-details-content overflow-hidden animate-scale-in"
                >
                    {/* Enhanced Header with Theme-Aware Styling */}
                    <div className="site-details-header">
                        <div className="site-details-header-overlay"></div>
                        <div className="site-details-header-content">
                            <div className="site-details-header-info">
                                <div className="relative">
                                    <StatusIndicator status={currentSite.status as any} size="lg" />
                                    {isRefreshing && (
                                        <div className="site-details-loading-spinner">
                                            <div className="site-details-spinner"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="site-details-title">
                                        {currentSite.name || currentSite.url}
                                    </div>
                                    {currentSite.name && (
                                        <div className="site-details-url">
                                            {currentSite.url}
                                        </div>
                                    )}
                                    <div className="site-details-meta">
                                        <div className="site-details-last-checked">
                                            Last checked: {formatTimestamp(typeof currentSite.lastChecked === 'number' ? currentSite.lastChecked : Date.now())}
                                        </div>
                                        {autoRefresh && (
                                            <div className="site-details-auto-refresh">
                                                <div className="site-details-refresh-indicator"></div>
                                                <div className="site-details-refresh-text">
                                                    Auto-refresh enabled
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="site-details-actions">
                                <ThemedButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    className="themed-button-ghost"
                                >
                                    {autoRefresh ? '⏸️' : '▶️'}
                                </ThemedButton>
                                <ThemedButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCheckNow}
                                    loading={isLoading}
                                    className="themed-button-ghost"
                                >
                                    {isLoading ? "Checking..." : "🔄 Check Now"}
                                </ThemedButton>
                                <ThemedButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    className="themed-button-ghost"
                                >
                                    ✕
                                </ThemedButton>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <ThemedBox variant="secondary" padding="lg" className="border-b">
                        <div className="flex flex-wrap gap-2">
                            <TabButton 
                                id="overview" 
                                label="📊 Overview" 
                                isActive={activeTab === 'overview'} 
                                onClick={() => setActiveTab('overview')}
                            />
                            <TabButton 
                                id="analytics" 
                                label="📈 Analytics" 
                                isActive={activeTab === 'analytics'} 
                                onClick={() => setActiveTab('analytics')}
                            />
                            <TabButton 
                                id="history" 
                                label="📜 History" 
                                isActive={activeTab === 'history'} 
                                onClick={() => setActiveTab('history')}
                            />
                            <TabButton 
                                id="settings" 
                                label="⚙️ Settings" 
                                isActive={activeTab === 'settings'} 
                                onClick={() => setActiveTab('settings')}
                            />
                        </div>
                        
                        {/* Time Range Selector for Analytics */}
                        {activeTab === 'analytics' && (
                            <div className="flex items-center flex-wrap gap-3 mt-4">
                                <ThemedText size="sm" variant="secondary" className="mr-2">
                                    Time Range:
                                </ThemedText>
                                <div className="flex flex-wrap gap-1">
                                    {(['1h', '24h', '7d', '30d'] as const).map((range) => (
                                        <ThemedButton
                                            key={range}
                                            variant={chartTimeRange === range ? "primary" : "ghost"}
                                            size="xs"
                                            onClick={() => setChartTimeRange(range)}
                                        >
                                            {range}
                                        </ThemedButton>
                                    ))}
                                </div>
                            </div>
                        )}
                    </ThemedBox>

                    {/* Tab Content */}
                    <ThemedBox variant="primary" padding="lg" className="max-h-[70vh] overflow-y-auto">
                        {activeTab === 'overview' && (
                            <OverviewTab
                                currentSite={currentSite}
                                uptime={uptime}
                                avgResponseTime={avgResponseTime}
                                totalChecks={totalChecks}
                                fastestResponse={fastestResponse}
                                slowestResponse={slowestResponse}
                                formatResponseTime={formatResponseTime}
                                handleRemoveSite={handleRemoveSite}
                                isLoading={isLoading}
                            />
                        )}

                        {activeTab === 'analytics' && (
                            <AnalyticsTab
                                filteredHistory={filteredHistory}
                                upCount={upCount}
                                downCount={downCount}
                                totalChecks={totalChecks}
                                uptime={uptime}
                                avgResponseTime={avgResponseTime}
                                p50={p50}
                                p95={p95}
                                p99={p99}
                                mttr={mttr}
                                totalDowntime={totalDowntime}
                                downtimePeriods={downtimePeriods}
                                chartTimeRange={chartTimeRange}
                                lineChartData={lineChartData}
                                lineChartOptions={lineChartOptions}
                                barChartData={barChartData}
                                barChartOptions={barChartOptions}
                                uptimeChartData={uptimeChartData}
                                doughnutOptions={doughnutOptions}
                                formatResponseTime={formatResponseTime}
                                formatDuration={formatDuration}
                                showAdvancedMetrics={showAdvancedMetrics}
                                setShowAdvancedMetrics={setShowAdvancedMetrics}
                            />
                        )}

                        {activeTab === 'history' && (
                            <HistoryTab
                                currentSite={currentSite}
                                formatTimestamp={formatTimestamp}
                                formatResponseTime={formatResponseTime}
                            />
                        )}

                        {activeTab === 'settings' && (
                            <SettingsTab
                                currentSite={currentSite}
                                handleRemoveSite={handleRemoveSite}
                                isLoading={isLoading}
                                autoRefresh={autoRefresh}
                                setAutoRefresh={setAutoRefresh}
                            />
                        )}
                    </ThemedBox>
                </ThemedBox>
            </div>
        </div>
    );
}

    // Tab Components
    interface OverviewTabProps {
        currentSite: Site;
        uptime: string;
        avgResponseTime: number;
        totalChecks: number;
        fastestResponse: number;
        slowestResponse: number;
        formatResponseTime: (time: number) => string;
        handleRemoveSite: () => Promise<void>;
        isLoading: boolean;
    }

    function OverviewTab({
        currentSite,
        uptime,
        avgResponseTime,
        totalChecks,
        fastestResponse,
        slowestResponse,
        formatResponseTime,
        handleRemoveSite,
        isLoading
    }: OverviewTabProps) {
        return (
            <div className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ThemedBox surface="base" padding="lg" border rounded="lg" className="text-center hover:shadow-md transition-shadow">
                        <StatusIndicator status={currentSite.status as any} size="lg" className="mx-auto mb-2" />
                        <ThemedText size="sm" variant="secondary">Current Status</ThemedText>
                        <ThemedText size="xl" weight="bold" className="capitalize mt-1">
                            {currentSite.status}
                        </ThemedText>
                    </ThemedBox>

                    <ThemedBox surface="base" padding="lg" border rounded="lg" className="text-center hover:shadow-md transition-shadow">
                        <div className="text-3xl mb-2">⏱️</div>
                        <ThemedText size="sm" variant="secondary">Uptime</ThemedText>
                        <ThemedText size="xl" weight="bold" className="mt-1 text-green-600">
                            {uptime}%
                        </ThemedText>
                    </ThemedBox>

                    <ThemedBox surface="base" padding="lg" border rounded="lg" className="text-center hover:shadow-md transition-shadow">
                        <div className="text-3xl mb-2">⚡</div>
                        <ThemedText size="sm" variant="secondary">Avg Response</ThemedText>
                        <ThemedText size="xl" weight="bold" className="mt-1">
                            {formatResponseTime(avgResponseTime)}
                        </ThemedText>
                    </ThemedBox>

                    <ThemedBox surface="base" padding="lg" border rounded="lg" className="text-center hover:shadow-md transition-shadow">
                        <div className="text-3xl mb-2">📊</div>
                        <ThemedText size="sm" variant="secondary">Total Checks</ThemedText>
                        <ThemedText size="xl" weight="bold" className="mt-1">
                            {totalChecks}
                        </ThemedText>
                    </ThemedBox>
                </div>

                {/* Performance Metrics */}
                <ThemedBox surface="base" padding="lg" border rounded="lg">
                    <ThemedText size="lg" weight="semibold" className="mb-4">Performance Overview</ThemedText>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <ThemedText size="sm" variant="secondary">Fastest Response</ThemedText>
                            <ThemedText size="lg" weight="medium" className="text-green-600">
                                {formatResponseTime(fastestResponse)}
                            </ThemedText>
                        </div>
                        <div>
                            <ThemedText size="sm" variant="secondary">Slowest Response</ThemedText>
                            <ThemedText size="lg" weight="medium" className="text-orange-600">
                                {formatResponseTime(slowestResponse)}
                            </ThemedText>
                        </div>
                    </div>
                </ThemedBox>

                {/* Quick Actions */}
                <ThemedBox surface="base" padding="lg" border rounded="lg">
                    <ThemedText size="lg" weight="semibold" className="mb-4">Quick Actions</ThemedText>
                    <div className="flex space-x-3">
                        <ThemedButton
                            variant="error"
                            size="md"
                            onClick={handleRemoveSite}
                            loading={isLoading}
                            className="flex-1"
                        >
                            🗑️ Remove Site
                        </ThemedButton>
                    </div>
                </ThemedBox>
            </div>
        );
    }

    interface AnalyticsTabProps {
        filteredHistory: any[];
        upCount: number;
        downCount: number;
        totalChecks: number;
        uptime: string;
        avgResponseTime: number;
        p50: number;
        p95: number;
        p99: number;
        mttr: number;
        totalDowntime: number;
        downtimePeriods: any[];
        chartTimeRange: string;
        lineChartData: any;
        lineChartOptions: any;
        barChartData: any;
        barChartOptions: any;
        uptimeChartData: any;
        doughnutOptions: any;
        formatResponseTime: (time: number) => string;
        formatDuration: (ms: number) => string;
        showAdvancedMetrics: boolean;
        setShowAdvancedMetrics: (show: boolean) => void;
    }

    function AnalyticsTab({
        upCount,
        downCount,
        totalChecks,
        uptime,
        avgResponseTime,
        p50,
        p95,
        p99,
        mttr,
        totalDowntime,
        downtimePeriods,
        chartTimeRange,
        lineChartData,
        lineChartOptions,
        barChartData,
        barChartOptions,
        uptimeChartData,
        doughnutOptions,
        formatResponseTime,
        formatDuration,
        showAdvancedMetrics,
        setShowAdvancedMetrics
    }: AnalyticsTabProps) {
        return (
            <div className="space-y-6">
                {/* Analytics Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ThemedBox surface="base" padding="lg" border rounded="lg" className="text-center">
                        <ThemedText size="sm" variant="secondary">Availability ({chartTimeRange})</ThemedText>
                        <ThemedText size="3xl" weight="bold" className="text-green-600">
                            {uptime}%
                        </ThemedText>
                        <ThemedText size="xs" variant="tertiary">
                            {upCount} up / {downCount} down
                        </ThemedText>
                    </ThemedBox>

                    <ThemedBox surface="base" padding="lg" border rounded="lg" className="text-center">
                        <ThemedText size="sm" variant="secondary">Avg Response Time</ThemedText>
                        <ThemedText size="3xl" weight="bold">
                            {formatResponseTime(avgResponseTime)}
                        </ThemedText>
                        <ThemedText size="xs" variant="tertiary">
                            Based on {totalChecks} checks
                        </ThemedText>
                    </ThemedBox>

                    <ThemedBox surface="base" padding="lg" border rounded="lg" className="text-center">
                        <ThemedText size="sm" variant="secondary">Total Downtime</ThemedText>
                        <ThemedText size="3xl" weight="bold" className="text-red-600">
                            {formatDuration(totalDowntime)}
                        </ThemedText>
                        <ThemedText size="xs" variant="tertiary">
                            {downtimePeriods.length} incidents
                        </ThemedText>
                    </ThemedBox>
                </div>

                {/* Response Time Percentiles */}
                <ThemedBox surface="base" padding="lg" border rounded="lg">
                    <div className="flex items-center justify-between mb-4">
                        <ThemedText size="lg" weight="semibold">Response Time Analysis</ThemedText>
                        <ThemedButton
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                        >
                            {showAdvancedMetrics ? 'Hide' : 'Show'} Advanced
                        </ThemedButton>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                            <ThemedText size="sm" variant="secondary">P50</ThemedText>
                            <ThemedText size="lg" weight="medium">{formatResponseTime(p50)}</ThemedText>
                        </div>
                        <div className="text-center">
                            <ThemedText size="sm" variant="secondary">P95</ThemedText>
                            <ThemedText size="lg" weight="medium">{formatResponseTime(p95)}</ThemedText>
                        </div>
                        <div className="text-center">
                            <ThemedText size="sm" variant="secondary">P99</ThemedText>
                            <ThemedText size="lg" weight="medium">{formatResponseTime(p99)}</ThemedText>
                        </div>
                    </div>

                    {showAdvancedMetrics && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <ThemedText size="sm" variant="secondary">Mean Time To Recovery</ThemedText>
                                <ThemedText size="lg" weight="medium">{formatDuration(mttr)}</ThemedText>
                            </div>
                            <div>
                                <ThemedText size="sm" variant="secondary">Incidents</ThemedText>
                                <ThemedText size="lg" weight="medium">{downtimePeriods.length}</ThemedText>
                            </div>
                        </div>
                    )}
                </ThemedBox>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Response Time Chart */}
                    <ThemedBox surface="base" padding="md" border rounded="lg">
                        <div className="h-64">
                            <Line data={lineChartData} options={lineChartOptions} />
                        </div>
                    </ThemedBox>

                    {/* Uptime Doughnut Chart */}
                    <ThemedBox surface="base" padding="md" border rounded="lg">
                        <div className="h-64">
                            <Doughnut data={uptimeChartData} options={doughnutOptions} />
                        </div>
                    </ThemedBox>

                    {/* Status Distribution Bar Chart */}
                    <ThemedBox surface="base" padding="md" border rounded="lg" className="lg:col-span-2">
                        <div className="h-64">
                            <Bar data={barChartData} options={barChartOptions} />
                        </div>
                    </ThemedBox>
                </div>
            </div>
        );
    }

    interface HistoryTabProps {
        currentSite: Site;
        formatTimestamp: (timestamp: number) => string;
        formatResponseTime: (time: number) => string;
    }

    function HistoryTab({ currentSite, formatTimestamp, formatResponseTime }: HistoryTabProps) {
        const [historyFilter, setHistoryFilter] = useState<'all' | 'up' | 'down'>('all');
        const [historyLimit, setHistoryLimit] = useState(50);

        const filteredHistoryRecords = currentSite.history
            .filter(record => historyFilter === 'all' || record.status === historyFilter)
            .slice(0, historyLimit);

        return (
            <div className="space-y-6">
                {/* History Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <ThemedText size="lg" weight="semibold">Check History</ThemedText>
                        <div className="flex space-x-1">
                            {(['all', 'up', 'down'] as const).map((filter) => (
                                <ThemedButton
                                    key={filter}
                                    variant={historyFilter === filter ? "primary" : "ghost"}
                                    size="xs"
                                    onClick={() => setHistoryFilter(filter)}
                                    className="capitalize"
                                >
                                    {filter === 'all' ? 'All' : filter === 'up' ? '✅ Up' : '❌ Down'}
                                </ThemedButton>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ThemedText size="sm" variant="secondary">Show:</ThemedText>
                        <select 
                            value={historyLimit} 
                            onChange={(e) => setHistoryLimit(Number(e.target.value))}
                            className="px-2 py-1 border rounded"
                            aria-label="History limit"
                        >
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={currentSite.history.length}>All ({currentSite.history.length})</option>
                        </select>
                    </div>
                </div>

                {/* History List */}
                <ThemedBox surface="base" padding="md" border rounded="lg" className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                        {filteredHistoryRecords.map((record, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-elevated transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <StatusIndicator status={record.status as any} size="sm" />
                                    <div>
                                        <ThemedText size="sm" weight="medium">
                                            {formatTimestamp(record.timestamp)}
                                        </ThemedText>
                                        <ThemedText size="xs" variant="secondary">
                                            Check #{currentSite.history.length - index}
                                        </ThemedText>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <ThemedText size="sm" weight="medium">
                                        {formatResponseTime(record.responseTime)}
                                    </ThemedText>
                                    <ThemedText size="xs" variant="secondary" className="capitalize">
                                        {record.status}
                                    </ThemedText>
                                </div>
                            </div>
                        ))}
                    </div>
                </ThemedBox>

                {filteredHistoryRecords.length === 0 && (
                    <div className="text-center py-8">
                        <ThemedText variant="secondary">No records found for the selected filter.</ThemedText>
                    </div>
                )}
            </div>
        );
    }

    interface SettingsTabProps {
        currentSite: Site;
        handleRemoveSite: () => Promise<void>;
        isLoading: boolean;
        autoRefresh: boolean;
        setAutoRefresh: (enabled: boolean) => void;
    }

    function SettingsTab({
        currentSite,
        handleRemoveSite,
        isLoading,
        autoRefresh,
        setAutoRefresh
    }: SettingsTabProps) {
        return (
            <div className="space-y-6">
                {/* Site Information */}
                <ThemedBox surface="base" padding="lg" border rounded="lg">
                    <ThemedText size="lg" weight="semibold" className="mb-4">Site Information</ThemedText>
                    <div className="space-y-3">
                        <div>
                            <ThemedText size="sm" variant="secondary">Name</ThemedText>
                            <ThemedText size="base" weight="medium">
                                {currentSite.name || 'No name set'}
                            </ThemedText>
                        </div>
                        <div>
                            <ThemedText size="sm" variant="secondary">URL</ThemedText>
                            <ThemedText size="base" weight="medium" className="break-all">
                                {currentSite.url}
                            </ThemedText>
                        </div>
                        <div>
                            <ThemedText size="sm" variant="secondary">Added</ThemedText>
                            <ThemedText size="base" weight="medium">
                                {new Date(currentSite.lastChecked || Date.now()).toLocaleDateString()}
                            </ThemedText>
                        </div>
                    </div>
                </ThemedBox>

                {/* Monitoring Settings */}
                <ThemedBox surface="base" padding="lg" border rounded="lg">
                    <ThemedText size="lg" weight="semibold" className="mb-4">Monitoring Settings</ThemedText>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <ThemedText size="base" weight="medium">Auto-refresh</ThemedText>
                                <ThemedText size="sm" variant="secondary">
                                    Automatically refresh data every 30 seconds
                                </ThemedText>
                            </div>
                            <ThemedButton
                                variant={autoRefresh ? "success" : "secondary"}
                                size="sm"
                                onClick={() => setAutoRefresh(!autoRefresh)}
                            >
                                {autoRefresh ? 'Enabled' : 'Disabled'}
                            </ThemedButton>
                        </div>
                    </div>
                </ThemedBox>

                {/* Danger Zone */}
                <ThemedBox surface="base" padding="lg" border rounded="lg" className="border-red-200">
                    <ThemedText size="lg" weight="semibold" className="mb-4 text-red-600">Danger Zone</ThemedText>
                    <div className="space-y-4">
                        <div>
                            <ThemedText size="base" weight="medium">Remove Site</ThemedText>
                            <ThemedText size="sm" variant="secondary" className="mb-3">
                                This action cannot be undone. All monitoring data for this site will be permanently deleted.
                            </ThemedText>
                            <ThemedButton
                                variant="error"
                                size="md"
                                onClick={handleRemoveSite}
                                loading={isLoading}
                            >
                                🗑️ Remove Site Permanently
                            </ThemedButton>
                        </div>
                    </div>
                </ThemedBox>
            </div>
        );
    }
