import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, TimeScale, Filler, DoughnutController, ArcElement, } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { useTheme, useAvailabilityColors } from "../theme/useTheme";
import { useStore } from "../store";
import { formatStatusWithIcon } from "../utils/status";
import { formatResponseTime, formatFullTimestamp, formatDuration } from "../utils/time";
import { AUTO_REFRESH_INTERVAL, CHECK_INTERVALS } from "../constants";
import { ChartConfigService } from "../services/chartConfig";
import logger from "../services/logger";
import { useSiteAnalytics } from "../hooks/useSiteAnalytics";
import { ThemedBox, ThemedText, ThemedButton, StatusIndicator, ThemedCard, ThemedBadge, ThemedProgress, ThemedInput, ThemedSelect, } from "../theme/components";
import "chartjs-adapter-date-fns";
import "./SiteDetails.css";
import { FaListOl } from "react-icons/fa";
import { FiTrash2, FiSave } from "react-icons/fi";
import { MdAccessTime, MdBolt, MdSpeed, MdOutlineFactCheck } from "react-icons/md";
import { createPortal } from "react-dom";
// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, TimeScale, Filler, DoughnutController, ArcElement, zoomPlugin);
export function SiteDetails({ site, onClose }) {
    const { currentTheme } = useTheme();
    const { getAvailabilityColor, getAvailabilityVariant, getAvailabilityDescription } = useAvailabilityColors();
    const { sites, deleteSite, checkSiteNow, isLoading, clearError, startSiteMonitorMonitoring, stopSiteMonitorMonitoring, updateSiteCheckInterval, 
    // Synchronized UI state from store
    activeSiteDetailsTab, setActiveSiteDetailsTab, siteDetailsChartTimeRange, setSiteDetailsChartTimeRange, showAdvancedMetrics, setShowAdvancedMetrics, setSelectedMonitorId, getSelectedMonitorId, } = useStore();
    const [isRefreshing, setIsRefreshing] = useState(false);
    // Always call hooks first, use fallback for currentSite
    const currentSite = sites.find((s) => s.identifier === site.identifier) || {
        monitors: [],
        identifier: site.identifier,
    };
    const monitorIds = currentSite.monitors.map((m) => m.id);
    const defaultMonitorId = monitorIds[0] || "";
    const selectedMonitorId = getSelectedMonitorId(currentSite.identifier) || defaultMonitorId;
    const selectedMonitor = currentSite.monitors.find((m) => m.id === selectedMonitorId) || currentSite.monitors[0];
    const isMonitoring = selectedMonitor?.monitoring !== false;
    // Handler for check now
    const handleCheckNow = useCallback(async (isAutoRefresh = false) => {
        if (isAutoRefresh) {
            setIsRefreshing(true);
        }
        else {
            clearError();
        }
        try {
            await checkSiteNow(currentSite.identifier, selectedMonitorId);
            if (!isAutoRefresh) {
                logger.user.action("Manual site check", {
                    identifier: currentSite.identifier,
                    monitorId: selectedMonitorId,
                });
            }
        }
        catch (error) {
            logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
        }
        finally {
            if (isAutoRefresh) {
                setIsRefreshing(false);
            }
        }
    }, [checkSiteNow, clearError, currentSite.identifier, selectedMonitorId]);
    // Auto-refresh interval
    useEffect(() => {
        const interval = setInterval(async () => {
            if (isMonitoring && !isLoading && !isRefreshing) {
                await handleCheckNow(true);
            }
        }, AUTO_REFRESH_INTERVAL); // Auto-refresh every 30 seconds
        return () => clearInterval(interval);
    }, [isMonitoring, isLoading, isRefreshing, selectedMonitorId, handleCheckNow]);
    // Use analytics hook (pass only selectedMonitor and timeRange)
    const analytics = useSiteAnalytics(selectedMonitor, siteDetailsChartTimeRange); // <-- Make sure the hook uses only this monitor's history
    // Create chart config service instance
    const chartConfig = useMemo(() => new ChartConfigService(currentTheme), [currentTheme]);
    // Chart configurations using the service
    const lineChartOptions = useMemo(() => chartConfig.getLineChartConfig(), [chartConfig]);
    const barChartOptions = useMemo(() => chartConfig.getBarChartConfig(), [chartConfig]);
    // Chart data using analytics
    const lineChartData = useMemo(() => ({
        labels: analytics.filteredHistory.map((h) => new Date(h.timestamp)),
        datasets: [
            {
                label: "Response Time (ms)",
                data: analytics.filteredHistory.map((h) => h.responseTime),
                borderColor: currentTheme.colors.primary[500],
                backgroundColor: currentTheme.colors.primary[500] + "20",
                fill: true,
                tension: 0.1,
            },
        ],
    }), [analytics.filteredHistory, currentTheme]);
    const barChartData = useMemo(() => ({
        labels: ["Up", "Down"],
        datasets: [
            {
                data: [analytics.upCount, analytics.downCount],
                backgroundColor: [currentTheme.colors.success, currentTheme.colors.error],
            },
        ],
    }), [analytics.upCount, analytics.downCount, currentTheme]);
    const doughnutChartData = useMemo(() => ({
        labels: ["Up", "Down"],
        datasets: [
            {
                data: [analytics.upCount, analytics.downCount],
                backgroundColor: [currentTheme.colors.success, currentTheme.colors.error],
            },
        ],
    }), [analytics.upCount, analytics.downCount, currentTheme]);
    const doughnutOptions = useMemo(() => chartConfig.getDoughnutChartConfig(analytics.totalChecks), [chartConfig, analytics.totalChecks]);
    // Handler for monitor selection change (dropdown)
    const handleMonitorIdChange = (e) => {
        const newId = e.target.value;
        setSelectedMonitorId(currentSite.identifier, newId);
        // If current tab is an analytics tab, switch to the new monitor's analytics tab
        if (activeSiteDetailsTab.endsWith("-analytics")) {
            setActiveSiteDetailsTab(`${newId}-analytics`);
        }
    };
    const handleRemoveSite = async () => {
        if (!window.confirm(`Are you sure you want to remove ${currentSite.name || currentSite.identifier}?`)) {
            return;
        }
        clearError(); // Clear previous errors
        try {
            await deleteSite(currentSite.identifier);
            logger.site.removed(currentSite.identifier);
            onClose(); // Close the details view after removing
        }
        catch (error) {
            logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
            // Error is already handled by the store action
        }
    };
    // Handler for per-monitor monitoring
    const handleStartMonitoring = () => {
        startSiteMonitorMonitoring(currentSite.identifier, selectedMonitorId);
    };
    const handleStopMonitoring = () => {
        stopSiteMonitorMonitoring(currentSite.identifier, selectedMonitorId);
    };
    // Check interval state and handlers
    const [localCheckInterval, setLocalCheckInterval] = useState(selectedMonitor?.checkInterval || 60000);
    const [intervalChanged, setIntervalChanged] = useState(false);
    useEffect(() => {
        setLocalCheckInterval(selectedMonitor?.checkInterval || 60000);
        setIntervalChanged(false);
    }, [selectedMonitor?.checkInterval, selectedMonitor?.type, currentSite.identifier]);
    const handleIntervalChange = (e) => {
        setLocalCheckInterval(Number(e.target.value));
        setIntervalChanged(Number(e.target.value) !== selectedMonitor?.checkInterval);
    };
    const handleSaveInterval = async () => {
        // Always use currentSite.identifier as the first argument
        await updateSiteCheckInterval(currentSite.identifier, selectedMonitorId, localCheckInterval);
        setIntervalChanged(false);
    };
    // Only return null after all hooks
    if (!sites.find((s) => s.identifier === site.identifier))
        return null;
    return (_jsx("div", { className: "site-details-modal", onClick: onClose, children: _jsx("div", { onClick: (e) => e.stopPropagation(), children: _jsxs(ThemedBox, { surface: "overlay", padding: "lg", rounded: "lg", shadow: "xl", className: "site-details-content overflow-hidden animate-scale-in", children: [_jsxs("div", { className: "site-details-header", children: [_jsx("div", { className: "site-details-header-overlay" }), _jsxs("div", { className: "site-details-header-content", children: [_jsx("div", { className: "site-details-header-accent" }), _jsxs("div", { className: "site-details-header-info flex items-center gap-4", children: [_jsx(ScreenshotThumbnail, { url: selectedMonitor?.type === "http" ? (selectedMonitor?.url ?? "") : "", siteName: currentSite.name || currentSite.identifier }), _jsxs("div", { className: "site-details-status-indicator", children: [_jsx(StatusIndicator, { status: selectedMonitor?.status ?? "unknown", size: "lg" }), isRefreshing && (_jsx("div", { className: "site-details-loading-spinner", children: _jsx("div", { className: "site-details-spinner" }) }))] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx(ThemedText, { size: "2xl", weight: "bold", className: "site-details-title truncate", children: site.name || site.identifier }), selectedMonitor?.type === "http" && selectedMonitor?.url && (_jsx("a", { href: selectedMonitor.url, className: "site-details-url truncate", target: "_blank", rel: "noopener noreferrer", tabIndex: 0, "aria-label": `Open ${selectedMonitor.url} in browser`, onClick: (e) => {
                                                            e.preventDefault();
                                                            const url = selectedMonitor.url || "";
                                                            if (hasOpenExternal(window.electronAPI)) {
                                                                window.electronAPI.openExternal(url);
                                                            }
                                                            else {
                                                                window.open(url, "_blank");
                                                            }
                                                        }, children: selectedMonitor.url })), !selectedMonitor && (_jsx(ThemedText, { variant: "warning", size: "base", children: "No monitor data available for this site." }))] })] })] })] }), _jsxs(ThemedBox, { variant: "secondary", padding: "lg", className: "border-b", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [_jsx(ThemedButton, { variant: activeSiteDetailsTab === "overview" ? "primary" : "secondary", onClick: () => setActiveSiteDetailsTab("overview"), children: "\uD83D\uDCCA Overview" }), _jsx(ThemedButton, { variant: activeSiteDetailsTab === `${selectedMonitorId}-analytics`
                                                    ? "primary"
                                                    : "secondary", onClick: () => setActiveSiteDetailsTab(`${selectedMonitorId}-analytics`), children: `📈 ${selectedMonitorId.toUpperCase()}` }, selectedMonitorId), _jsx(ThemedButton, { variant: activeSiteDetailsTab === "history" ? "primary" : "secondary", onClick: () => setActiveSiteDetailsTab("history"), children: "\uD83D\uDCDC History" }), _jsx(ThemedButton, { variant: activeSiteDetailsTab === "settings" ? "primary" : "secondary", onClick: () => setActiveSiteDetailsTab("settings"), children: "\u2699\uFE0F Settings" })] }), _jsxs("div", { className: "ml-auto flex items-center gap-2", children: [_jsx(ThemedText, { size: "sm", variant: "secondary", children: "Interval:" }), _jsx(ThemedSelect, { value: localCheckInterval, onChange: handleIntervalChange, children: CHECK_INTERVALS.map((interval) => {
                                                    // Support both number and object forms
                                                    const value = typeof interval === "number" ? interval : interval.value;
                                                    const label = typeof interval === "number"
                                                        ? value < 60000
                                                            ? `${value / 1000}s`
                                                            : value < 3600000
                                                                ? `${value / 60000}m`
                                                                : `${value / 3600000}h`
                                                        : interval.label ||
                                                            (interval.value < 60000
                                                                ? `${interval.value / 1000}s`
                                                                : interval.value < 3600000
                                                                    ? `${interval.value / 60000}m`
                                                                    : `${interval.value / 3600000}h`);
                                                    return (_jsx("option", { value: value, children: label }, value));
                                                }) }), intervalChanged && (_jsx(ThemedButton, { variant: "primary", size: "sm", onClick: handleSaveInterval, children: "Save" })), _jsx(ThemedButton, { variant: "ghost", size: "sm", onClick: handleCheckNow, className: "min-w-[32px]", "aria-label": "Check Now", disabled: isLoading, children: _jsx("span", { children: "\uD83D\uDD04" }) }), isMonitoring ? (_jsxs(ThemedButton, { variant: "error", size: "sm", onClick: handleStopMonitoring, "aria-label": "Stop Monitoring", className: "flex items-center gap-1", children: [_jsx("span", { className: "inline-block", children: "\u23F8\uFE0F" }), _jsx("span", { className: "hidden sm:inline", children: "Stop" })] })) : (_jsxs(ThemedButton, { variant: "success", size: "sm", onClick: handleStartMonitoring, "aria-label": "Start Monitoring", className: "flex items-center gap-1", children: [_jsx("span", { className: "inline-block", children: "\u25B6\uFE0F" }), _jsx("span", { className: "hidden sm:inline", children: "Start" })] })), _jsx(ThemedText, { variant: "secondary", size: "base", children: "Monitor:" }), _jsx(ThemedSelect, { value: selectedMonitorId, onChange: handleMonitorIdChange, children: currentSite.monitors.map((monitor) => (_jsx("option", { value: monitor.id, children: monitor.type.toUpperCase() }, monitor.id))) })] })] }), activeSiteDetailsTab === `${selectedMonitorId}-analytics` &&
                                (selectedMonitorId === "http" || selectedMonitorId === "port") && (_jsxs("div", { className: "flex items-center flex-wrap gap-3 mt-4", children: [_jsx(ThemedText, { size: "sm", variant: "secondary", className: "mr-2", children: "Time Range:" }), _jsx("div", { className: "flex flex-wrap gap-1", children: ["1h", "24h", "7d", "30d"].map((range) => (_jsx(ThemedButton, { variant: siteDetailsChartTimeRange === range ? "primary" : "ghost", size: "xs", onClick: () => setSiteDetailsChartTimeRange(range), children: range }, range))) })] }))] }), _jsxs(ThemedBox, { variant: "primary", padding: "lg", className: "max-h-[70vh] overflow-y-auto", children: [activeSiteDetailsTab === "overview" && (_jsx(OverviewTab, { selectedMonitor: selectedMonitor, uptime: analytics.uptime, avgResponseTime: analytics.avgResponseTime, totalChecks: analytics.totalChecks, fastestResponse: analytics.fastestResponse, slowestResponse: analytics.slowestResponse, formatResponseTime: formatResponseTime, handleRemoveSite: handleRemoveSite, isLoading: isLoading })), activeSiteDetailsTab === `${selectedMonitorId}-analytics` && (_jsx(AnalyticsTab, { filteredHistory: analytics.filteredHistory, upCount: analytics.upCount, downCount: analytics.downCount, totalChecks: analytics.totalChecks, uptime: analytics.uptime, avgResponseTime: analytics.avgResponseTime, p50: analytics.p50, p95: analytics.p95, p99: analytics.p99, mttr: analytics.mttr, totalDowntime: analytics.totalDowntime, downtimePeriods: analytics.downtimePeriods, chartTimeRange: siteDetailsChartTimeRange, lineChartData: lineChartData, lineChartOptions: lineChartOptions, barChartData: barChartData, barChartOptions: barChartOptions, uptimeChartData: doughnutChartData, doughnutOptions: doughnutOptions, formatResponseTime: formatResponseTime, formatDuration: formatDuration, showAdvancedMetrics: showAdvancedMetrics, setShowAdvancedMetrics: setShowAdvancedMetrics, getAvailabilityColor: getAvailabilityColor, getAvailabilityVariant: getAvailabilityVariant, getAvailabilityDescription: getAvailabilityDescription, monitorType: selectedMonitor?.type })), activeSiteDetailsTab === "history" && (_jsx(HistoryTab, { selectedMonitor: selectedMonitor, formatResponseTime: formatResponseTime, formatFullTimestamp: formatFullTimestamp, formatStatusWithIcon: formatStatusWithIcon })), activeSiteDetailsTab === "settings" && (_jsx(SettingsTab, { currentSite: site, selectedMonitor: selectedMonitor, handleRemoveSite: handleRemoveSite, isLoading: isLoading, localCheckInterval: localCheckInterval, intervalChanged: intervalChanged, handleIntervalChange: handleIntervalChange, handleSaveInterval: handleSaveInterval }))] })] }) }) }));
}
function OverviewTab({ selectedMonitor, uptime, avgResponseTime, totalChecks, fastestResponse, slowestResponse, formatResponseTime, handleRemoveSite, isLoading, }) {
    const { getAvailabilityVariant, getAvailabilityColor } = useAvailabilityColors();
    const { currentTheme } = useTheme();
    // Map availability variant to progress/badge variant
    const mapAvailabilityToBadgeVariant = (availability) => {
        const variant = getAvailabilityVariant(availability);
        return variant === "danger" ? "error" : variant;
    };
    const uptimeValue = parseFloat(uptime);
    const progressVariant = mapAvailabilityToBadgeVariant(uptimeValue);
    // Icon colors from theme/availability
    const statusIconColor = getAvailabilityColor(uptimeValue); // Status icon color by availability
    const uptimeIconColor = getAvailabilityColor(uptimeValue); // Uptime icon color by availability
    const responseIconColor = currentTheme.colors.warning; // Response time icon uses theme warning
    const checksIconColor = currentTheme.colors.primary[500]; // Checks icon uses theme primary
    const fastestIconColor = currentTheme.colors.success; // Fastest uses theme success
    const slowestIconColor = currentTheme.colors.warning; // Slowest uses theme warning
    const quickActionIconColor = currentTheme.colors.error; // Quick action uses theme error
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsx(ThemedCard, { icon: _jsx(MdOutlineFactCheck, {}), iconColor: statusIconColor, title: "Status", hoverable: true, className: "text-center flex flex-col items-center", children: _jsx(StatusIndicator, { status: selectedMonitor.status, size: "lg", showText: true }) }), _jsxs(ThemedCard, { icon: _jsx(MdAccessTime, {}), iconColor: uptimeIconColor, title: "Uptime", hoverable: true, className: "text-center flex flex-col items-center", children: [_jsx(ThemedProgress, { value: uptimeValue, variant: progressVariant, showLabel: true, className: "flex flex-col items-center" }), _jsxs(ThemedBadge, { variant: progressVariant, size: "sm", className: "mt-2", children: [uptime, "%"] })] }), _jsx(ThemedCard, { icon: _jsx(MdSpeed, {}), iconColor: responseIconColor, title: "Response Time", hoverable: true, className: "text-center flex flex-col items-center", children: _jsx(ThemedText, { size: "xl", weight: "bold", children: formatResponseTime(avgResponseTime) }) }), _jsx(ThemedCard, { icon: _jsx(FaListOl, {}), iconColor: checksIconColor, title: "Total Checks", hoverable: true, className: "text-center flex flex-col items-center", children: _jsx(ThemedText, { size: "xl", weight: "bold", children: totalChecks }) })] }), _jsx(ThemedCard, { icon: _jsx(MdBolt, { color: fastestIconColor }), title: "Performance Overview", children: _jsxs("div", { className: "grid grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx(ThemedText, { size: "sm", variant: "secondary", children: "Fastest Response" }), _jsx(ThemedBadge, { variant: "success", icon: _jsx(MdBolt, {}), iconColor: fastestIconColor, className: "ml-4", children: formatResponseTime(fastestResponse) })] }), _jsxs("div", { children: [_jsx(ThemedText, { size: "sm", variant: "secondary", children: "Slowest Response" }), _jsx(ThemedBadge, { variant: "warning", icon: _jsx(MdAccessTime, {}), iconColor: slowestIconColor, className: "ml-4", children: formatResponseTime(slowestResponse) })] })] }) }), _jsx(ThemedCard, { icon: _jsx(MdBolt, { color: quickActionIconColor }), title: "Quick Actions", children: _jsx("div", { className: "flex space-x-3", children: _jsx(ThemedButton, { variant: "error", size: "sm", onClick: handleRemoveSite, disabled: isLoading, icon: _jsx(FiTrash2, {}), children: "Remove Site" }) }) })] }));
}
function AnalyticsTab({ upCount, downCount, totalChecks, uptime, avgResponseTime, p50, p95, p99, mttr, totalDowntime, downtimePeriods, chartTimeRange, lineChartData, lineChartOptions, barChartData, barChartOptions, uptimeChartData, doughnutOptions, formatResponseTime, formatDuration, showAdvancedMetrics, setShowAdvancedMetrics, getAvailabilityColor, getAvailabilityVariant, getAvailabilityDescription, monitorType, }) {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(ThemedBox, { surface: "base", padding: "lg", border: true, rounded: "lg", className: "text-center flex flex-col items-center", children: [_jsxs(ThemedText, { size: "sm", variant: "secondary", children: ["Availability (", chartTimeRange, ")"] }), _jsxs(ThemedText, { size: "3xl", weight: "bold", variant: getAvailabilityVariant(parseFloat(uptime)), style: { color: getAvailabilityColor(parseFloat(uptime)) }, children: [uptime, "%"] }), _jsxs(ThemedText, { size: "xs", variant: "tertiary", children: [upCount, " up / ", downCount, " down"] }), _jsx(ThemedText, { size: "xs", variant: "secondary", className: "mt-1", children: getAvailabilityDescription(parseFloat(uptime)) })] }), (monitorType === "http" || monitorType === "port") && (_jsxs(ThemedBox, { surface: "base", padding: "lg", border: true, rounded: "lg", className: "text-center flex flex-col items-center", children: [_jsx(ThemedText, { size: "sm", variant: "secondary", children: "Avg Response Time" }), _jsx(ThemedText, { size: "3xl", weight: "bold", children: formatResponseTime(avgResponseTime) }), _jsxs(ThemedText, { size: "xs", variant: "tertiary", children: ["Based on ", totalChecks, " checks"] })] })), _jsxs(ThemedBox, { surface: "base", padding: "lg", border: true, rounded: "lg", className: "text-center flex flex-col items-center", children: [_jsx(ThemedText, { size: "sm", variant: "secondary", children: "Total Downtime" }), _jsx(ThemedText, { size: "3xl", weight: "bold", variant: "danger", children: formatDuration(totalDowntime) }), _jsxs(ThemedText, { size: "xs", variant: "tertiary", children: [downtimePeriods.length, " incidents"] })] })] }), (monitorType === "http" || monitorType === "port") && (_jsxs(ThemedBox, { surface: "base", padding: "lg", border: true, rounded: "lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx(ThemedText, { size: "lg", weight: "semibold", children: "Response Time Analysis" }), _jsxs(ThemedButton, { variant: "ghost", size: "sm", onClick: () => setShowAdvancedMetrics(!showAdvancedMetrics), children: [showAdvancedMetrics ? "Hide" : "Show", " Advanced"] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 mb-4", children: [_jsxs("div", { className: "text-center flex flex-col items-center", children: [_jsx(ThemedText, { size: "sm", variant: "secondary", className: "mb-4", children: "P50" }), _jsx(ThemedText, { size: "lg", weight: "medium", children: formatResponseTime(p50) })] }), _jsxs("div", { className: "text-center flex flex-col items-center", children: [_jsx(ThemedText, { size: "sm", variant: "secondary", className: "mb-4", children: "P95" }), _jsx(ThemedText, { size: "lg", weight: "medium", children: formatResponseTime(p95) })] }), _jsxs("div", { className: "text-center flex flex-col items-center", children: [_jsx(ThemedText, { size: "sm", variant: "secondary", className: "mb-4", children: "P99" }), _jsx(ThemedText, { size: "lg", weight: "medium", children: formatResponseTime(p99) })] })] }), showAdvancedMetrics && (_jsxs("div", { className: "grid grid-cols-2 gap-4 pt-4 border-t", children: [_jsxs("div", { className: "text-center flex flex-col items-center", children: [_jsx(ThemedText, { size: "sm", variant: "secondary", className: "mb-4", children: "Mean Time To Recovery" }), _jsx(ThemedText, { size: "lg", weight: "medium", children: formatDuration(mttr) })] }), _jsxs("div", { className: "text-center flex flex-col items-center", children: [_jsx(ThemedText, { size: "sm", variant: "secondary", className: "mb-4", children: "Incidents" }), _jsx(ThemedText, { size: "lg", weight: "medium", children: downtimePeriods.length })] })] }))] })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [(monitorType === "http" || monitorType === "port") && (_jsx(ThemedBox, { surface: "base", padding: "md", border: true, rounded: "lg", children: _jsx("div", { className: "h-64", children: _jsx(Line, { data: lineChartData, options: lineChartOptions }) }) })), _jsx(ThemedBox, { surface: "base", padding: "md", border: true, rounded: "lg", children: _jsx("div", { className: "h-64", children: _jsx(Doughnut, { data: uptimeChartData, options: doughnutOptions }) }) }), _jsx(ThemedBox, { surface: "base", padding: "md", border: true, rounded: "lg", className: "lg:col-span-2", children: _jsx("div", { className: "h-64", children: _jsx(Bar, { data: barChartData, options: barChartOptions }) }) })] })] }));
}
function HistoryTab({ selectedMonitor, formatResponseTime, formatFullTimestamp, formatStatusWithIcon, }) {
    const { settings } = useStore();
    const [historyFilter, setHistoryFilter] = useState("all");
    const historyLength = (selectedMonitor.history || []).length;
    const backendLimit = settings.historyLimit || 25;
    // Dropdown options: 25, 50, 100, All (clamped to backendLimit and available history)
    const maxShow = Math.min(backendLimit, historyLength);
    const showOptions = [10, 25, 50, 100, 250, 500, 1000, 10000].filter(opt => opt <= maxShow);
    // Always include 'All' if there are fewer than backendLimit
    if (historyLength > 0 && historyLength <= backendLimit && !showOptions.includes(historyLength)) {
        showOptions.push(historyLength);
    }
    // Default to 50, but never more than backendLimit or available history
    const defaultHistoryLimit = Math.min(50, backendLimit, historyLength);
    const [historyLimit, setHistoryLimit] = useState(defaultHistoryLimit);
    useEffect(() => {
        setHistoryLimit(Math.min(50, backendLimit, (selectedMonitor.history || []).length));
    }, [settings.historyLimit, selectedMonitor.history?.length]);
    const filteredHistoryRecords = (selectedMonitor.history || [])
        .filter((record) => historyFilter === "all" || record.status === historyFilter)
        .slice(0, historyLimit);
    // Helper to render details with label
    function renderDetails(record) {
        if (!record.details)
            return null;
        if (selectedMonitor.type === "port") {
            return _jsxs(ThemedText, { size: "xs", variant: "secondary", className: "ml-4", children: ["Port: ", record.details] });
        }
        if (selectedMonitor.type === "http") {
            return _jsxs(ThemedText, { size: "xs", variant: "secondary", className: "ml-4", children: ["Response Code: ", record.details] });
        }
        return _jsx(ThemedText, { size: "xs", variant: "secondary", className: "ml-4", children: record.details });
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(ThemedText, { size: "lg", weight: "semibold", children: "Check History" }), _jsx("div", { className: "flex space-x-1", children: ["all", "up", "down"].map((filter) => (_jsx(ThemedButton, { variant: historyFilter === filter ? "primary" : "ghost", size: "xs", onClick: () => setHistoryFilter(filter), className: "capitalize ml-4", children: filter === "all" ? "All" : filter === "up" ? "✅ Up" : "❌ Down" }, filter))) })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(ThemedText, { size: "sm", variant: "secondary", children: "Show:" }), _jsxs("select", { value: historyLimit, onChange: (e) => setHistoryLimit(Number(e.target.value)), className: "px-2 py-1 border rounded", "aria-label": "History limit", children: [showOptions.map(opt => (_jsx("option", { value: opt, children: opt }, opt))), historyLength > backendLimit && (_jsxs("option", { value: historyLength, children: ["All (", historyLength, ")"] }))] }), _jsxs(ThemedText, { size: "sm", variant: "secondary", children: ["of ", historyLength, " checks"] })] })] }), _jsx(ThemedBox, { surface: "base", padding: "md", border: true, rounded: "lg", className: "max-h-96 overflow-y-auto", children: _jsx("div", { className: "space-y-2", children: filteredHistoryRecords.map((record, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg hover:bg-surface-elevated transition-colors", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(StatusIndicator, { status: record.status, size: "sm" }), _jsxs("div", { children: [_jsx(ThemedText, { size: "sm", weight: "medium", children: formatFullTimestamp(record.timestamp) }), _jsxs(ThemedText, { size: "xs", variant: "secondary", className: "ml-4", children: ["Check #", (selectedMonitor.history || []).length - index] }), renderDetails(record)] })] }), _jsxs("div", { className: "text-right", children: [_jsx(ThemedText, { size: "sm", weight: "medium", children: formatResponseTime(record.responseTime) }), _jsx(ThemedText, { size: "xs", variant: "secondary", className: "ml-4", children: formatStatusWithIcon(record.status) })] })] }, index))) }) }), filteredHistoryRecords.length === 0 && (_jsx("div", { className: "text-center py-8", children: _jsx(ThemedText, { variant: "secondary", children: "No records found for the selected filter." }) }))] }));
}
function SettingsTab({ currentSite, selectedMonitor, handleRemoveSite, isLoading, localCheckInterval, intervalChanged, handleIntervalChange, handleSaveInterval, }) {
    const { modifySite, clearError } = useStore();
    const [localName, setLocalName] = useState(currentSite.name || "");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    // Track changes
    useEffect(() => {
        setHasUnsavedChanges(localName !== (currentSite.name || ""));
    }, [localName, currentSite.name]);
    const handleSaveName = async () => {
        if (!hasUnsavedChanges)
            return;
        clearError();
        try {
            const updates = { name: localName.trim() || undefined };
            await modifySite(currentSite.identifier, updates);
            setHasUnsavedChanges(false);
            logger.user.action("Updated site name", { identifier: currentSite.identifier, name: localName.trim() });
        }
        catch (error) {
            logger.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
        }
    };
    return (_jsxs("div", { className: "space-y-10", children: [_jsx(ThemedCard, { icon: "\u2699\uFE0F", title: "Site Configuration", padding: "xl", rounded: "xl", shadow: "lg", className: "mb-6", children: _jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx(ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2", children: "Site Name" }), _jsxs("div", { className: "flex gap-3 items-center", children: [_jsx(ThemedInput, { type: "text", value: localName, onChange: (e) => setLocalName(e.target.value), placeholder: "Enter a custom name for this site", className: "flex-1" }), _jsx(ThemedButton, { variant: hasUnsavedChanges ? "primary" : "secondary", size: "sm", onClick: handleSaveName, disabled: !hasUnsavedChanges || isLoading, loading: isLoading, icon: _jsx(FiSave, {}), className: "min-w-[90px]", children: "Save" })] }), hasUnsavedChanges && (_jsx(ThemedBadge, { variant: "warning", size: "xs", className: "mt-2", children: "\u26A0\uFE0F Unsaved changes" }))] }), _jsxs("div", { children: [_jsx(ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2", children: "Site Identifier" }), _jsx(ThemedInput, { type: "text", value: selectedMonitor?.url ?? currentSite.identifier, disabled: true, className: "opacity-70" }), _jsx(ThemedText, { size: "xs", variant: "tertiary", className: "mt-1", children: "Identifier cannot be changed" })] })] }) }), _jsxs(ThemedBox, { variant: "secondary", padding: "md", className: "flex items-center gap-3 mb-4", children: [_jsx(ThemedText, { size: "sm", variant: "secondary", children: "Check every:" }), _jsx(ThemedSelect, { value: localCheckInterval, onChange: handleIntervalChange, children: CHECK_INTERVALS.map((interval) => {
                            // Support both number and object forms
                            const value = typeof interval === "number" ? interval : interval.value;
                            const label = typeof interval === "number"
                                ? value < 60000
                                    ? `${value / 1000}s`
                                    : value < 3600000
                                        ? `${value / 60000}m`
                                        : `${value / 3600000}h`
                                : interval.label ||
                                    (interval.value < 60000
                                        ? `${interval.value / 1000}s`
                                        : interval.value < 3600000
                                            ? `${interval.value / 60000}m`
                                            : `${interval.value / 3600000}h`);
                            return (_jsx("option", { value: value, children: label }, value));
                        }) }), _jsx(ThemedButton, { variant: intervalChanged ? "primary" : "secondary", size: "sm", onClick: handleSaveInterval, disabled: !intervalChanged, children: "Save" }), _jsxs(ThemedText, { size: "xs", variant: "tertiary", className: "ml-2", children: ["(This monitor checks every ", Math.round(localCheckInterval / 1000), "s)"] })] }), _jsx(ThemedCard, { icon: "\uD83D\uDCCA", title: "Site Information", padding: "xl", rounded: "xl", shadow: "md", className: "mb-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "flex flex-col gap-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(ThemedText, { size: "sm", variant: "secondary", children: "Site Identifier:" }), _jsx(ThemedBadge, { variant: "secondary", size: "xs", children: currentSite.identifier })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(ThemedText, { size: "sm", variant: "secondary", children: "Total Monitor History Records:" }), _jsx(ThemedBadge, { variant: "info", size: "xs", children: (selectedMonitor.history || []).length })] })] }), _jsx("div", { className: "flex flex-col gap-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(ThemedText, { size: "sm", variant: "secondary", children: "Last Checked:" }), _jsx(ThemedText, { size: "xs", variant: "tertiary", children: selectedMonitor.lastChecked
                                            ? new Date(selectedMonitor.lastChecked).toLocaleString()
                                            : "Never" })] }) })] }) }), _jsx(ThemedCard, { icon: "\u26A0\uFE0F", title: "Danger Zone", variant: "tertiary", padding: "xl", rounded: "xl", shadow: "md", className: "border-2 border-error/30", children: _jsx("div", { className: "space-y-6", children: _jsxs("div", { children: [_jsx(ThemedText, { size: "sm", weight: "medium", variant: "error", className: "mb-2", children: "Remove Site" }), _jsx(ThemedText, { size: "xs", variant: "tertiary", className: "mb-4 ml-1 block", children: "This action cannot be undone. All history data for this site will be lost." }), _jsx(ThemedButton, { variant: "error", size: "md", onClick: handleRemoveSite, loading: isLoading, icon: _jsx(FiTrash2, {}), className: "w-full", children: "Remove Site" })] }) }) })] }));
}
// Ensure hasOpenExternal is defined at the top (after imports):
function hasOpenExternal(api) {
    return typeof api?.openExternal === "function";
}
// Update ScreenshotThumbnail to use only CSS classes for overlay/image
function ScreenshotThumbnail({ url, siteName }) {
    const [hovered, setHovered] = useState(false);
    const [overlayVars, setOverlayVars] = useState({});
    const linkRef = useRef(null);
    const { themeName } = useTheme();
    const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url&colorScheme=auto`;
    function handleClick(e) {
        e.preventDefault();
        if (hasOpenExternal(window.electronAPI)) {
            window.electronAPI.openExternal(url);
        }
        else {
            window.open(url, "_blank", "noopener");
        }
    }
    useEffect(() => {
        if (hovered && linkRef.current) {
            const rect = linkRef.current.getBoundingClientRect();
            const viewportW = window.innerWidth;
            const viewportH = window.innerHeight;
            const maxImgW = Math.min(viewportW * 0.9, 900); // 90vw or 900px max
            const maxImgH = Math.min(viewportH * 0.9, 700); // 90vh or 700px max
            let overlayW = maxImgW;
            let overlayH = maxImgH;
            let top = rect.top - overlayH - 16; // 16px gap above
            let left = rect.left + rect.width / 2 - overlayW / 2;
            if (top < 0) {
                top = rect.bottom + 16;
            }
            if (left < 8)
                left = 8;
            if (left + overlayW > viewportW - 8)
                left = viewportW - overlayW - 8;
            if (top < 8)
                top = 8;
            if (top + overlayH > viewportH - 8)
                top = viewportH - overlayH - 8;
            setOverlayVars({
                "--overlay-top": `${top}px`,
                "--overlay-left": `${left}px`,
                "--overlay-width": `${overlayW}px`,
                "--overlay-height": `${overlayH}px`,
            });
        }
        else if (!hovered) {
            setOverlayVars({});
        }
    }, [hovered, url, siteName]);
    return (_jsxs(_Fragment, { children: [_jsxs("a", { ref: linkRef, href: url, tabIndex: 0, "aria-label": `Open ${url} in browser`, onClick: handleClick, className: "site-details-thumbnail-link", onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), onFocus: () => setHovered(true), onBlur: () => setHovered(false), children: [_jsx("img", { src: screenshotUrl, alt: `Screenshot of ${siteName}`, className: "site-details-thumbnail-img", loading: "lazy" }), _jsxs("span", { className: "site-details-thumbnail-caption", children: ["Preview: ", siteName] })] }), hovered &&
                createPortal(_jsx("div", { className: `site-details-thumbnail-portal-overlay theme-${themeName}`, style: overlayVars, children: _jsx("div", { className: "site-details-thumbnail-portal-img-wrapper", children: _jsx("img", { src: screenshotUrl, alt: `Large screenshot of ${siteName}`, className: "site-details-thumbnail-img-portal", loading: "lazy", tabIndex: 0 }) }) }), document.body)] }));
}
