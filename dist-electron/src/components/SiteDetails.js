"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteDetails = SiteDetails;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const chart_js_1 = require("chart.js");
const chartjs_plugin_zoom_1 = __importDefault(require("chartjs-plugin-zoom"));
const react_chartjs_2_1 = require("react-chartjs-2");
const useTheme_1 = require("../theme/useTheme");
const store_1 = require("../store");
const status_1 = require("../utils/status");
const time_1 = require("../utils/time");
const constants_1 = require("../constants");
const chartConfig_1 = require("../services/chartConfig");
const logger_1 = __importDefault(require("../services/logger"));
const useSiteAnalytics_1 = require("../hooks/useSiteAnalytics");
const components_1 = require("../theme/components");
require("chartjs-adapter-date-fns");
require("./SiteDetails.css");
const fa_1 = require("react-icons/fa");
const fi_1 = require("react-icons/fi");
const md_1 = require("react-icons/md");
const react_dom_1 = require("react-dom");
// Register Chart.js components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.BarElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend, chart_js_1.TimeScale, chart_js_1.Filler, chart_js_1.DoughnutController, chart_js_1.ArcElement, chartjs_plugin_zoom_1.default);
function SiteDetails({ site, onClose }) {
    const { currentTheme } = (0, useTheme_1.useTheme)();
    const { getAvailabilityColor, getAvailabilityVariant, getAvailabilityDescription } = (0, useTheme_1.useAvailabilityColors)();
    const { sites, deleteSite, checkSiteNow, isLoading, clearError, startSiteMonitorMonitoring, stopSiteMonitorMonitoring, updateSiteCheckInterval, 
    // Synchronized UI state from store
    activeSiteDetailsTab, setActiveSiteDetailsTab, siteDetailsChartTimeRange, setSiteDetailsChartTimeRange, showAdvancedMetrics, setShowAdvancedMetrics, setSelectedMonitorId, getSelectedMonitorId, } = (0, store_1.useStore)();
    const [isRefreshing, setIsRefreshing] = (0, react_1.useState)(false);
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
    const handleCheckNow = (0, react_1.useCallback)(async (isAutoRefresh = false) => {
        if (isAutoRefresh) {
            setIsRefreshing(true);
        }
        else {
            clearError();
        }
        try {
            await checkSiteNow(currentSite.identifier, selectedMonitorId);
            if (!isAutoRefresh) {
                logger_1.default.user.action("Manual site check", {
                    identifier: currentSite.identifier,
                    monitorId: selectedMonitorId,
                });
            }
        }
        catch (error) {
            logger_1.default.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
        }
        finally {
            if (isAutoRefresh) {
                setIsRefreshing(false);
            }
        }
    }, [checkSiteNow, clearError, currentSite.identifier, selectedMonitorId]);
    // Auto-refresh interval
    (0, react_1.useEffect)(() => {
        const interval = setInterval(async () => {
            if (isMonitoring && !isLoading && !isRefreshing) {
                await handleCheckNow(true);
            }
        }, constants_1.AUTO_REFRESH_INTERVAL); // Auto-refresh every 30 seconds
        return () => clearInterval(interval);
    }, [isMonitoring, isLoading, isRefreshing, selectedMonitorId, handleCheckNow]);
    // Use analytics hook (pass only selectedMonitor and timeRange)
    const analytics = (0, useSiteAnalytics_1.useSiteAnalytics)(selectedMonitor, siteDetailsChartTimeRange); // <-- Make sure the hook uses only this monitor's history
    // Create chart config service instance
    const chartConfig = (0, react_1.useMemo)(() => new chartConfig_1.ChartConfigService(currentTheme), [currentTheme]);
    // Chart configurations using the service
    const lineChartOptions = (0, react_1.useMemo)(() => chartConfig.getLineChartConfig(), [chartConfig]);
    const barChartOptions = (0, react_1.useMemo)(() => chartConfig.getBarChartConfig(), [chartConfig]);
    // Chart data using analytics
    const lineChartData = (0, react_1.useMemo)(() => ({
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
    const barChartData = (0, react_1.useMemo)(() => ({
        labels: ["Up", "Down"],
        datasets: [
            {
                data: [analytics.upCount, analytics.downCount],
                backgroundColor: [currentTheme.colors.success, currentTheme.colors.error],
            },
        ],
    }), [analytics.upCount, analytics.downCount, currentTheme]);
    const doughnutChartData = (0, react_1.useMemo)(() => ({
        labels: ["Up", "Down"],
        datasets: [
            {
                data: [analytics.upCount, analytics.downCount],
                backgroundColor: [currentTheme.colors.success, currentTheme.colors.error],
            },
        ],
    }), [analytics.upCount, analytics.downCount, currentTheme]);
    const doughnutOptions = (0, react_1.useMemo)(() => chartConfig.getDoughnutChartConfig(analytics.totalChecks), [chartConfig, analytics.totalChecks]);
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
            logger_1.default.site.removed(currentSite.identifier);
            onClose(); // Close the details view after removing
        }
        catch (error) {
            logger_1.default.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
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
    const [localCheckInterval, setLocalCheckInterval] = (0, react_1.useState)(selectedMonitor?.checkInterval || 60000);
    const [intervalChanged, setIntervalChanged] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
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
    return ((0, jsx_runtime_1.jsx)("div", { className: "site-details-modal", onClick: onClose, children: (0, jsx_runtime_1.jsx)("div", { onClick: (e) => e.stopPropagation(), children: (0, jsx_runtime_1.jsxs)(components_1.ThemedBox, { surface: "overlay", padding: "lg", rounded: "lg", shadow: "xl", className: "site-details-content overflow-hidden animate-scale-in", children: [(0, jsx_runtime_1.jsxs)("div", { className: "site-details-header", children: [(0, jsx_runtime_1.jsx)("div", { className: "site-details-header-overlay" }), (0, jsx_runtime_1.jsxs)("div", { className: "site-details-header-content", children: [(0, jsx_runtime_1.jsx)("div", { className: "site-details-header-accent" }), (0, jsx_runtime_1.jsxs)("div", { className: "site-details-header-info flex items-center gap-4", children: [(0, jsx_runtime_1.jsx)(ScreenshotThumbnail, { url: selectedMonitor?.type === "http" ? (selectedMonitor?.url ?? "") : "", siteName: currentSite.name || currentSite.identifier }), (0, jsx_runtime_1.jsxs)("div", { className: "site-details-status-indicator", children: [(0, jsx_runtime_1.jsx)(components_1.StatusIndicator, { status: selectedMonitor?.status ?? "unknown", size: "lg" }), isRefreshing && ((0, jsx_runtime_1.jsx)("div", { className: "site-details-loading-spinner", children: (0, jsx_runtime_1.jsx)("div", { className: "site-details-spinner" }) }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "2xl", weight: "bold", className: "site-details-title truncate", children: site.name || site.identifier }), selectedMonitor?.type === "http" && selectedMonitor?.url && ((0, jsx_runtime_1.jsx)("a", { href: selectedMonitor.url, className: "site-details-url truncate", target: "_blank", rel: "noopener noreferrer", tabIndex: 0, "aria-label": `Open ${selectedMonitor.url} in browser`, onClick: (e) => {
                                                            e.preventDefault();
                                                            const url = selectedMonitor.url || "";
                                                            if (hasOpenExternal(window.electronAPI)) {
                                                                window.electronAPI.openExternal(url);
                                                            }
                                                            else {
                                                                window.open(url, "_blank");
                                                            }
                                                        }, children: selectedMonitor.url })), !selectedMonitor && ((0, jsx_runtime_1.jsx)(components_1.ThemedText, { variant: "warning", size: "base", children: "No monitor data available for this site." }))] })] })] })] }), (0, jsx_runtime_1.jsxs)(components_1.ThemedBox, { variant: "secondary", padding: "lg", className: "border-b", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap items-center gap-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-2 items-center", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: activeSiteDetailsTab === "overview" ? "primary" : "secondary", onClick: () => setActiveSiteDetailsTab("overview"), children: "\uD83D\uDCCA Overview" }), (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: activeSiteDetailsTab === `${selectedMonitorId}-analytics`
                                                    ? "primary"
                                                    : "secondary", onClick: () => setActiveSiteDetailsTab(`${selectedMonitorId}-analytics`), children: `📈 ${selectedMonitorId.toUpperCase()}` }, selectedMonitorId), (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: activeSiteDetailsTab === "history" ? "primary" : "secondary", onClick: () => setActiveSiteDetailsTab("history"), children: "\uD83D\uDCDC History" }), (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: activeSiteDetailsTab === "settings" ? "primary" : "secondary", onClick: () => setActiveSiteDetailsTab("settings"), children: "\u2699\uFE0F Settings" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-auto flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", variant: "secondary", children: "Interval:" }), (0, jsx_runtime_1.jsx)(components_1.ThemedSelect, { value: localCheckInterval, onChange: handleIntervalChange, children: constants_1.CHECK_INTERVALS.map((interval) => {
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
                                                    return ((0, jsx_runtime_1.jsx)("option", { value: value, children: label }, value));
                                                }) }), intervalChanged && ((0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "primary", size: "sm", onClick: handleSaveInterval, children: "Save" })), (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "ghost", size: "sm", onClick: handleCheckNow, className: "min-w-[32px]", "aria-label": "Check Now", disabled: isLoading, children: (0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDD04" }) }), isMonitoring ? ((0, jsx_runtime_1.jsxs)(components_1.ThemedButton, { variant: "error", size: "sm", onClick: handleStopMonitoring, "aria-label": "Stop Monitoring", className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "inline-block", children: "\u23F8\uFE0F" }), (0, jsx_runtime_1.jsx)("span", { className: "hidden sm:inline", children: "Stop" })] })) : ((0, jsx_runtime_1.jsxs)(components_1.ThemedButton, { variant: "success", size: "sm", onClick: handleStartMonitoring, "aria-label": "Start Monitoring", className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "inline-block", children: "\u25B6\uFE0F" }), (0, jsx_runtime_1.jsx)("span", { className: "hidden sm:inline", children: "Start" })] })), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { variant: "secondary", size: "base", children: "Monitor:" }), (0, jsx_runtime_1.jsx)(components_1.ThemedSelect, { value: selectedMonitorId, onChange: handleMonitorIdChange, children: currentSite.monitors.map((monitor) => ((0, jsx_runtime_1.jsx)("option", { value: monitor.id, children: monitor.type.toUpperCase() }, monitor.id))) })] })] }), activeSiteDetailsTab === `${selectedMonitorId}-analytics` &&
                                (selectedMonitorId === "http" || selectedMonitorId === "port") && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center flex-wrap gap-3 mt-4", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", variant: "secondary", className: "mr-2", children: "Time Range:" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-1", children: ["1h", "24h", "7d", "30d"].map((range) => ((0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: siteDetailsChartTimeRange === range ? "primary" : "ghost", size: "xs", onClick: () => setSiteDetailsChartTimeRange(range), children: range }, range))) })] }))] }), (0, jsx_runtime_1.jsxs)(components_1.ThemedBox, { variant: "primary", padding: "lg", className: "max-h-[70vh] overflow-y-auto", children: [activeSiteDetailsTab === "overview" && ((0, jsx_runtime_1.jsx)(OverviewTab, { selectedMonitor: selectedMonitor, uptime: analytics.uptime, avgResponseTime: analytics.avgResponseTime, totalChecks: analytics.totalChecks, fastestResponse: analytics.fastestResponse, slowestResponse: analytics.slowestResponse, formatResponseTime: time_1.formatResponseTime, handleRemoveSite: handleRemoveSite, isLoading: isLoading })), activeSiteDetailsTab === `${selectedMonitorId}-analytics` && ((0, jsx_runtime_1.jsx)(AnalyticsTab, { filteredHistory: analytics.filteredHistory, upCount: analytics.upCount, downCount: analytics.downCount, totalChecks: analytics.totalChecks, uptime: analytics.uptime, avgResponseTime: analytics.avgResponseTime, p50: analytics.p50, p95: analytics.p95, p99: analytics.p99, mttr: analytics.mttr, totalDowntime: analytics.totalDowntime, downtimePeriods: analytics.downtimePeriods, chartTimeRange: siteDetailsChartTimeRange, lineChartData: lineChartData, lineChartOptions: lineChartOptions, barChartData: barChartData, barChartOptions: barChartOptions, uptimeChartData: doughnutChartData, doughnutOptions: doughnutOptions, formatResponseTime: time_1.formatResponseTime, formatDuration: time_1.formatDuration, showAdvancedMetrics: showAdvancedMetrics, setShowAdvancedMetrics: setShowAdvancedMetrics, getAvailabilityColor: getAvailabilityColor, getAvailabilityVariant: getAvailabilityVariant, getAvailabilityDescription: getAvailabilityDescription, monitorType: selectedMonitor?.type })), activeSiteDetailsTab === "history" && ((0, jsx_runtime_1.jsx)(HistoryTab, { selectedMonitor: selectedMonitor, formatResponseTime: time_1.formatResponseTime, formatFullTimestamp: time_1.formatFullTimestamp, formatStatusWithIcon: status_1.formatStatusWithIcon })), activeSiteDetailsTab === "settings" && ((0, jsx_runtime_1.jsx)(SettingsTab, { currentSite: site, selectedMonitor: selectedMonitor, handleRemoveSite: handleRemoveSite, isLoading: isLoading, localCheckInterval: localCheckInterval, intervalChanged: intervalChanged, handleIntervalChange: handleIntervalChange, handleSaveInterval: handleSaveInterval }))] })] }) }) }));
}
function OverviewTab({ selectedMonitor, uptime, avgResponseTime, totalChecks, fastestResponse, slowestResponse, formatResponseTime, handleRemoveSite, isLoading, }) {
    const { getAvailabilityVariant, getAvailabilityColor } = (0, useTheme_1.useAvailabilityColors)();
    const { currentTheme } = (0, useTheme_1.useTheme)();
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedCard, { icon: (0, jsx_runtime_1.jsx)(md_1.MdOutlineFactCheck, {}), iconColor: statusIconColor, title: "Status", hoverable: true, className: "text-center flex flex-col items-center", children: (0, jsx_runtime_1.jsx)(components_1.StatusIndicator, { status: selectedMonitor.status, size: "lg", showText: true }) }), (0, jsx_runtime_1.jsxs)(components_1.ThemedCard, { icon: (0, jsx_runtime_1.jsx)(md_1.MdAccessTime, {}), iconColor: uptimeIconColor, title: "Uptime", hoverable: true, className: "text-center flex flex-col items-center", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedProgress, { value: uptimeValue, variant: progressVariant, showLabel: true, className: "flex flex-col items-center" }), (0, jsx_runtime_1.jsxs)(components_1.ThemedBadge, { variant: progressVariant, size: "sm", className: "mt-2", children: [uptime, "%"] })] }), (0, jsx_runtime_1.jsx)(components_1.ThemedCard, { icon: (0, jsx_runtime_1.jsx)(md_1.MdSpeed, {}), iconColor: responseIconColor, title: "Response Time", hoverable: true, className: "text-center flex flex-col items-center", children: (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xl", weight: "bold", children: formatResponseTime(avgResponseTime) }) }), (0, jsx_runtime_1.jsx)(components_1.ThemedCard, { icon: (0, jsx_runtime_1.jsx)(fa_1.FaListOl, {}), iconColor: checksIconColor, title: "Total Checks", hoverable: true, className: "text-center flex flex-col items-center", children: (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xl", weight: "bold", children: totalChecks }) })] }), (0, jsx_runtime_1.jsx)(components_1.ThemedCard, { icon: (0, jsx_runtime_1.jsx)(md_1.MdBolt, { color: fastestIconColor }), title: "Performance Overview", children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", variant: "secondary", children: "Fastest Response" }), (0, jsx_runtime_1.jsx)(components_1.ThemedBadge, { variant: "success", icon: (0, jsx_runtime_1.jsx)(md_1.MdBolt, {}), iconColor: fastestIconColor, className: "ml-4", children: formatResponseTime(fastestResponse) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", variant: "secondary", children: "Slowest Response" }), (0, jsx_runtime_1.jsx)(components_1.ThemedBadge, { variant: "warning", icon: (0, jsx_runtime_1.jsx)(md_1.MdAccessTime, {}), iconColor: slowestIconColor, className: "ml-4", children: formatResponseTime(slowestResponse) })] })] }) }), (0, jsx_runtime_1.jsx)(components_1.ThemedCard, { icon: (0, jsx_runtime_1.jsx)(md_1.MdBolt, { color: quickActionIconColor }), title: "Quick Actions", children: (0, jsx_runtime_1.jsx)("div", { className: "flex space-x-3", children: (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "error", size: "sm", onClick: handleRemoveSite, disabled: isLoading, icon: (0, jsx_runtime_1.jsx)(fi_1.FiTrash2, {}), children: "Remove Site" }) }) })] }));
}
function AnalyticsTab({ upCount, downCount, totalChecks, uptime, avgResponseTime, p50, p95, p99, mttr, totalDowntime, downtimePeriods, chartTimeRange, lineChartData, lineChartOptions, barChartData, barChartOptions, uptimeChartData, doughnutOptions, formatResponseTime, formatDuration, showAdvancedMetrics, setShowAdvancedMetrics, getAvailabilityColor, getAvailabilityVariant, getAvailabilityDescription, monitorType, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [(0, jsx_runtime_1.jsxs)(components_1.ThemedBox, { surface: "base", padding: "lg", border: true, rounded: "lg", className: "text-center flex flex-col items-center", children: [(0, jsx_runtime_1.jsxs)(components_1.ThemedText, { size: "sm", variant: "secondary", children: ["Availability (", chartTimeRange, ")"] }), (0, jsx_runtime_1.jsxs)(components_1.ThemedText, { size: "3xl", weight: "bold", variant: getAvailabilityVariant(parseFloat(uptime)), style: { color: getAvailabilityColor(parseFloat(uptime)) }, children: [uptime, "%"] }), (0, jsx_runtime_1.jsxs)(components_1.ThemedText, { size: "xs", variant: "tertiary", children: [upCount, " up / ", downCount, " down"] }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "secondary", className: "mt-1", children: getAvailabilityDescription(parseFloat(uptime)) })] }), (monitorType === "http" || monitorType === "port") && ((0, jsx_runtime_1.jsxs)(components_1.ThemedBox, { surface: "base", padding: "lg", border: true, rounded: "lg", className: "text-center flex flex-col items-center", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", variant: "secondary", children: "Avg Response Time" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "3xl", weight: "bold", children: formatResponseTime(avgResponseTime) }), (0, jsx_runtime_1.jsxs)(components_1.ThemedText, { size: "xs", variant: "tertiary", children: ["Based on ", totalChecks, " checks"] })] })), (0, jsx_runtime_1.jsxs)(components_1.ThemedBox, { surface: "base", padding: "lg", border: true, rounded: "lg", className: "text-center flex flex-col items-center", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", variant: "secondary", children: "Total Downtime" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "3xl", weight: "bold", variant: "danger", children: formatDuration(totalDowntime) }), (0, jsx_runtime_1.jsxs)(components_1.ThemedText, { size: "xs", variant: "tertiary", children: [downtimePeriods.length, " incidents"] })] })] }), (monitorType === "http" || monitorType === "port") && ((0, jsx_runtime_1.jsxs)(components_1.ThemedBox, { surface: "base", padding: "lg", border: true, rounded: "lg", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "lg", weight: "semibold", children: "Response Time Analysis" }), (0, jsx_runtime_1.jsxs)(components_1.ThemedButton, { variant: "ghost", size: "sm", onClick: () => setShowAdvancedMetrics(!showAdvancedMetrics), children: [showAdvancedMetrics ? "Hide" : "Show", " Advanced"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-3 gap-4 mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center flex flex-col items-center", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", variant: "secondary", className: "mb-4", children: "P50" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "lg", weight: "medium", children: formatResponseTime(p50) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center flex flex-col items-center", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", variant: "secondary", className: "mb-4", children: "P95" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "lg", weight: "medium", children: formatResponseTime(p95) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center flex flex-col items-center", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", variant: "secondary", className: "mb-4", children: "P99" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "lg", weight: "medium", children: formatResponseTime(p99) })] })] }), showAdvancedMetrics && ((0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4 pt-4 border-t", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center flex flex-col items-center", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", variant: "secondary", className: "mb-4", children: "Mean Time To Recovery" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "lg", weight: "medium", children: formatDuration(mttr) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center flex flex-col items-center", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", variant: "secondary", className: "mb-4", children: "Incidents" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "lg", weight: "medium", children: downtimePeriods.length })] })] }))] })), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [(monitorType === "http" || monitorType === "port") && ((0, jsx_runtime_1.jsx)(components_1.ThemedBox, { surface: "base", padding: "md", border: true, rounded: "lg", children: (0, jsx_runtime_1.jsx)("div", { className: "h-64", children: (0, jsx_runtime_1.jsx)(react_chartjs_2_1.Line, { data: lineChartData, options: lineChartOptions }) }) })), (0, jsx_runtime_1.jsx)(components_1.ThemedBox, { surface: "base", padding: "md", border: true, rounded: "lg", children: (0, jsx_runtime_1.jsx)("div", { className: "h-64", children: (0, jsx_runtime_1.jsx)(react_chartjs_2_1.Doughnut, { data: uptimeChartData, options: doughnutOptions }) }) }), (0, jsx_runtime_1.jsx)(components_1.ThemedBox, { surface: "base", padding: "md", border: true, rounded: "lg", className: "lg:col-span-2", children: (0, jsx_runtime_1.jsx)("div", { className: "h-64", children: (0, jsx_runtime_1.jsx)(react_chartjs_2_1.Bar, { data: barChartData, options: barChartOptions }) }) })] })] }));
}
function HistoryTab({ selectedMonitor, formatResponseTime, formatFullTimestamp, formatStatusWithIcon, }) {
    const { settings } = (0, store_1.useStore)();
    const [historyFilter, setHistoryFilter] = (0, react_1.useState)("all");
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
    const [historyLimit, setHistoryLimit] = (0, react_1.useState)(defaultHistoryLimit);
    (0, react_1.useEffect)(() => {
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
            return (0, jsx_runtime_1.jsxs)(components_1.ThemedText, { size: "xs", variant: "secondary", className: "ml-4", children: ["Port: ", record.details] });
        }
        if (selectedMonitor.type === "http") {
            return (0, jsx_runtime_1.jsxs)(components_1.ThemedText, { size: "xs", variant: "secondary", className: "ml-4", children: ["Response Code: ", record.details] });
        }
        return (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "secondary", className: "ml-4", children: record.details });
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "lg", weight: "semibold", children: "Check History" }), (0, jsx_runtime_1.jsx)("div", { className: "flex space-x-1", children: ["all", "up", "down"].map((filter) => ((0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: historyFilter === filter ? "primary" : "ghost", size: "xs", onClick: () => setHistoryFilter(filter), className: "capitalize ml-4", children: filter === "all" ? "All" : filter === "up" ? "✅ Up" : "❌ Down" }, filter))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", variant: "secondary", children: "Show:" }), (0, jsx_runtime_1.jsxs)("select", { value: historyLimit, onChange: (e) => setHistoryLimit(Number(e.target.value)), className: "px-2 py-1 border rounded", "aria-label": "History limit", children: [showOptions.map(opt => ((0, jsx_runtime_1.jsx)("option", { value: opt, children: opt }, opt))), historyLength > backendLimit && ((0, jsx_runtime_1.jsxs)("option", { value: historyLength, children: ["All (", historyLength, ")"] }))] }), (0, jsx_runtime_1.jsxs)(components_1.ThemedText, { size: "sm", variant: "secondary", children: ["of ", historyLength, " checks"] })] })] }), (0, jsx_runtime_1.jsx)(components_1.ThemedBox, { surface: "base", padding: "md", border: true, rounded: "lg", className: "max-h-96 overflow-y-auto", children: (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: filteredHistoryRecords.map((record, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-3 rounded-lg hover:bg-surface-elevated transition-colors", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)(components_1.StatusIndicator, { status: record.status, size: "sm" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", children: formatFullTimestamp(record.timestamp) }), (0, jsx_runtime_1.jsxs)(components_1.ThemedText, { size: "xs", variant: "secondary", className: "ml-4", children: ["Check #", (selectedMonitor.history || []).length - index] }), renderDetails(record)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", children: formatResponseTime(record.responseTime) }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "secondary", className: "ml-4", children: formatStatusWithIcon(record.status) })] })] }, index))) }) }), filteredHistoryRecords.length === 0 && ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8", children: (0, jsx_runtime_1.jsx)(components_1.ThemedText, { variant: "secondary", children: "No records found for the selected filter." }) }))] }));
}
function SettingsTab({ currentSite, selectedMonitor, handleRemoveSite, isLoading, localCheckInterval, intervalChanged, handleIntervalChange, handleSaveInterval, }) {
    const { modifySite, clearError } = (0, store_1.useStore)();
    const [localName, setLocalName] = (0, react_1.useState)(currentSite.name || "");
    const [hasUnsavedChanges, setHasUnsavedChanges] = (0, react_1.useState)(false);
    // Track changes
    (0, react_1.useEffect)(() => {
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
            logger_1.default.user.action("Updated site name", { identifier: currentSite.identifier, name: localName.trim() });
        }
        catch (error) {
            logger_1.default.site.error(currentSite.identifier, error instanceof Error ? error : String(error));
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-10", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedCard, { icon: "\u2699\uFE0F", title: "Site Configuration", padding: "xl", rounded: "xl", shadow: "lg", className: "mb-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-8", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2", children: "Site Name" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3 items-center", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedInput, { type: "text", value: localName, onChange: (e) => setLocalName(e.target.value), placeholder: "Enter a custom name for this site", className: "flex-1" }), (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: hasUnsavedChanges ? "primary" : "secondary", size: "sm", onClick: handleSaveName, disabled: !hasUnsavedChanges || isLoading, loading: isLoading, icon: (0, jsx_runtime_1.jsx)(fi_1.FiSave, {}), className: "min-w-[90px]", children: "Save" })] }), hasUnsavedChanges && ((0, jsx_runtime_1.jsx)(components_1.ThemedBadge, { variant: "warning", size: "xs", className: "mt-2", children: "\u26A0\uFE0F Unsaved changes" }))] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2", children: "Site Identifier" }), (0, jsx_runtime_1.jsx)(components_1.ThemedInput, { type: "text", value: selectedMonitor?.url ?? currentSite.identifier, disabled: true, className: "opacity-70" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "mt-1", children: "Identifier cannot be changed" })] })] }) }), (0, jsx_runtime_1.jsxs)(components_1.ThemedBox, { variant: "secondary", padding: "md", className: "flex items-center gap-3 mb-4", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", variant: "secondary", children: "Check every:" }), (0, jsx_runtime_1.jsx)(components_1.ThemedSelect, { value: localCheckInterval, onChange: handleIntervalChange, children: constants_1.CHECK_INTERVALS.map((interval) => {
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
                            return ((0, jsx_runtime_1.jsx)("option", { value: value, children: label }, value));
                        }) }), (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: intervalChanged ? "primary" : "secondary", size: "sm", onClick: handleSaveInterval, disabled: !intervalChanged, children: "Save" }), (0, jsx_runtime_1.jsxs)(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "ml-2", children: ["(This monitor checks every ", Math.round(localCheckInterval / 1000), "s)"] })] }), (0, jsx_runtime_1.jsx)(components_1.ThemedCard, { icon: "\uD83D\uDCCA", title: "Site Information", padding: "xl", rounded: "xl", shadow: "md", className: "mb-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", variant: "secondary", children: "Site Identifier:" }), (0, jsx_runtime_1.jsx)(components_1.ThemedBadge, { variant: "secondary", size: "xs", children: currentSite.identifier })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", variant: "secondary", children: "Total Monitor History Records:" }), (0, jsx_runtime_1.jsx)(components_1.ThemedBadge, { variant: "info", size: "xs", children: (selectedMonitor.history || []).length })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-col gap-3", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", variant: "secondary", children: "Last Checked:" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "tertiary", children: selectedMonitor.lastChecked
                                            ? new Date(selectedMonitor.lastChecked).toLocaleString()
                                            : "Never" })] }) })] }) }), (0, jsx_runtime_1.jsx)(components_1.ThemedCard, { icon: "\u26A0\uFE0F", title: "Danger Zone", variant: "tertiary", padding: "xl", rounded: "xl", shadow: "md", className: "border-2 border-error/30", children: (0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", variant: "error", className: "mb-2", children: "Remove Site" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "mb-4 ml-1 block", children: "This action cannot be undone. All history data for this site will be lost." }), (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "error", size: "md", onClick: handleRemoveSite, loading: isLoading, icon: (0, jsx_runtime_1.jsx)(fi_1.FiTrash2, {}), className: "w-full", children: "Remove Site" })] }) }) })] }));
}
// Ensure hasOpenExternal is defined at the top (after imports):
function hasOpenExternal(api) {
    return typeof api?.openExternal === "function";
}
// Update ScreenshotThumbnail to use only CSS classes for overlay/image
function ScreenshotThumbnail({ url, siteName }) {
    const [hovered, setHovered] = (0, react_1.useState)(false);
    const [overlayVars, setOverlayVars] = (0, react_1.useState)({});
    const linkRef = (0, react_1.useRef)(null);
    const { themeName } = (0, useTheme_1.useTheme)();
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
    (0, react_1.useEffect)(() => {
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
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("a", { ref: linkRef, href: url, tabIndex: 0, "aria-label": `Open ${url} in browser`, onClick: handleClick, className: "site-details-thumbnail-link", onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), onFocus: () => setHovered(true), onBlur: () => setHovered(false), children: [(0, jsx_runtime_1.jsx)("img", { src: screenshotUrl, alt: `Screenshot of ${siteName}`, className: "site-details-thumbnail-img", loading: "lazy" }), (0, jsx_runtime_1.jsxs)("span", { className: "site-details-thumbnail-caption", children: ["Preview: ", siteName] })] }), hovered &&
                (0, react_dom_1.createPortal)((0, jsx_runtime_1.jsx)("div", { className: `site-details-thumbnail-portal-overlay theme-${themeName}`, style: overlayVars, children: (0, jsx_runtime_1.jsx)("div", { className: "site-details-thumbnail-portal-img-wrapper", children: (0, jsx_runtime_1.jsx)("img", { src: screenshotUrl, alt: `Large screenshot of ${siteName}`, className: "site-details-thumbnail-img-portal", loading: "lazy", tabIndex: 0 }) }) }), document.body)] }));
}
