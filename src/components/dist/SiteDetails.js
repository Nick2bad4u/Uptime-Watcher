"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.SiteDetails = void 0;
var chart_js_1 = require("chart.js");
var chartjs_plugin_zoom_1 = require("chartjs-plugin-zoom");
var react_1 = require("react");
var react_chartjs_2_1 = require("react-chartjs-2");
var react_dom_1 = require("react-dom");
var fa_1 = require("react-icons/fa");
var fi_1 = require("react-icons/fi");
var md_1 = require("react-icons/md");
var constants_1 = require("../constants");
var useSiteAnalytics_1 = require("../hooks/useSiteAnalytics");
var chartConfig_1 = require("../services/chartConfig");
var logger_1 = require("../services/logger");
var store_1 = require("../store");
var components_1 = require("../theme/components");
require("chartjs-adapter-date-fns");
require("./SiteDetails.css");
var useTheme_1 = require("../theme/useTheme");
var status_1 = require("../utils/status");
var time_1 = require("../utils/time");
// Register Chart.js components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.BarElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend, chart_js_1.TimeScale, chart_js_1.Filler, chart_js_1.DoughnutController, chart_js_1.ArcElement, chartjs_plugin_zoom_1["default"]);
function SiteDetails(_a) {
    var _this = this;
    var _b, _c;
    var onClose = _a.onClose, site = _a.site;
    var currentTheme = useTheme_1.useTheme().currentTheme;
    var _d = useTheme_1.useAvailabilityColors(), getAvailabilityColor = _d.getAvailabilityColor, getAvailabilityDescription = _d.getAvailabilityDescription, getAvailabilityVariant = _d.getAvailabilityVariant;
    var _e = store_1.useStore(), 
    // Synchronized UI state from store
    activeSiteDetailsTab = _e.activeSiteDetailsTab, checkSiteNow = _e.checkSiteNow, clearError = _e.clearError, deleteSite = _e.deleteSite, getSelectedMonitorId = _e.getSelectedMonitorId, isLoading = _e.isLoading, setActiveSiteDetailsTab = _e.setActiveSiteDetailsTab, setSelectedMonitorId = _e.setSelectedMonitorId, setShowAdvancedMetrics = _e.setShowAdvancedMetrics, setSiteDetailsChartTimeRange = _e.setSiteDetailsChartTimeRange, showAdvancedMetrics = _e.showAdvancedMetrics, siteDetailsChartTimeRange = _e.siteDetailsChartTimeRange, sites = _e.sites, startSiteMonitorMonitoring = _e.startSiteMonitorMonitoring, stopSiteMonitorMonitoring = _e.stopSiteMonitorMonitoring, updateSiteCheckInterval = _e.updateSiteCheckInterval;
    var _f = react_1.useState(false), isRefreshing = _f[0], setIsRefreshing = _f[1];
    // Always call hooks first, use fallback for currentSite
    var currentSite = sites.find(function (s) { return s.identifier === site.identifier; }) || {
        identifier: site.identifier,
        monitors: []
    };
    var monitorIds = currentSite.monitors.map(function (m) { return m.id; });
    var defaultMonitorId = monitorIds[0] || "";
    var selectedMonitorId = getSelectedMonitorId(currentSite.identifier) || defaultMonitorId;
    var selectedMonitor = currentSite.monitors.find(function (m) { return m.id === selectedMonitorId; }) || currentSite.monitors[0];
    var isMonitoring = (selectedMonitor === null || selectedMonitor === void 0 ? void 0 : selectedMonitor.monitoring) !== false;
    // Handler for check now
    var handleCheckNow = react_1.useCallback(function (isAutoRefresh) {
        if (isAutoRefresh === void 0) { isAutoRefresh = false; }
        return __awaiter(_this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (isAutoRefresh) {
                            setIsRefreshing(true);
                        }
                        else {
                            clearError();
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, checkSiteNow(currentSite.identifier, selectedMonitorId)];
                    case 2:
                        _a.sent();
                        if (!isAutoRefresh) {
                            logger_1["default"].user.action("Manual site check", {
                                identifier: currentSite.identifier,
                                monitorId: selectedMonitorId
                            });
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        logger_1["default"].site.error(currentSite.identifier, error_1 instanceof Error ? error_1 : String(error_1));
                        return [3 /*break*/, 5];
                    case 4:
                        if (isAutoRefresh) {
                            setIsRefreshing(false);
                        }
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }, [checkSiteNow, clearError, currentSite.identifier, selectedMonitorId]);
    // Auto-refresh interval
    react_1.useEffect(function () {
        var interval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(isMonitoring && !isLoading && !isRefreshing)) return [3 /*break*/, 2];
                        return [4 /*yield*/, handleCheckNow(true)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); }, constants_1.AUTO_REFRESH_INTERVAL); // Auto-refresh every 30 seconds
        return function () { return clearInterval(interval); };
    }, [isMonitoring, isLoading, isRefreshing, selectedMonitorId, handleCheckNow]);
    // Use analytics hook (pass only selectedMonitor and timeRange)
    var analytics = useSiteAnalytics_1.useSiteAnalytics(selectedMonitor, siteDetailsChartTimeRange); // <-- Make sure the hook uses only this monitor's history
    // Create chart config service instance
    var chartConfig = react_1.useMemo(function () { return new chartConfig_1.ChartConfigService(currentTheme); }, [currentTheme]);
    // Chart configurations using the service
    var lineChartOptions = react_1.useMemo(function () { return chartConfig.getLineChartConfig(); }, [chartConfig]);
    var barChartOptions = react_1.useMemo(function () { return chartConfig.getBarChartConfig(); }, [chartConfig]);
    // Chart data using analytics
    var lineChartData = react_1.useMemo(function () { return ({
        datasets: [
            {
                backgroundColor: currentTheme.colors.primary[500] + "20",
                borderColor: currentTheme.colors.primary[500],
                data: analytics.filteredHistory.map(function (h) { return h.responseTime; }),
                fill: true,
                label: "Response Time (ms)",
                tension: 0.1
            },
        ],
        labels: analytics.filteredHistory.map(function (h) { return new Date(h.timestamp); })
    }); }, [analytics.filteredHistory, currentTheme]);
    var barChartData = react_1.useMemo(function () { return ({
        datasets: [
            {
                backgroundColor: [currentTheme.colors.success, currentTheme.colors.error],
                data: [analytics.upCount, analytics.downCount]
            },
        ],
        labels: ["Up", "Down"]
    }); }, [analytics.upCount, analytics.downCount, currentTheme]);
    var doughnutChartData = react_1.useMemo(function () { return ({
        datasets: [
            {
                backgroundColor: [currentTheme.colors.success, currentTheme.colors.error],
                data: [analytics.upCount, analytics.downCount]
            },
        ],
        labels: ["Up", "Down"]
    }); }, [analytics.upCount, analytics.downCount, currentTheme]);
    var doughnutOptions = react_1.useMemo(function () { return chartConfig.getDoughnutChartConfig(analytics.totalChecks); }, [chartConfig, analytics.totalChecks]);
    // Handler for monitor selection change (dropdown)
    var handleMonitorIdChange = function (e) {
        var newId = e.target.value;
        setSelectedMonitorId(currentSite.identifier, newId);
        // If current tab is an analytics tab, switch to the new monitor's analytics tab
        if (activeSiteDetailsTab.endsWith("-analytics")) {
            setActiveSiteDetailsTab(newId + "-analytics");
        }
    };
    var handleRemoveSite = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm("Are you sure you want to remove " + (currentSite.name || currentSite.identifier) + "?")) {
                        return [2 /*return*/];
                    }
                    clearError(); // Clear previous errors
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteSite(currentSite.identifier)];
                case 2:
                    _a.sent();
                    logger_1["default"].site.removed(currentSite.identifier);
                    onClose(); // Close the details view after removing
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    logger_1["default"].site.error(currentSite.identifier, error_2 instanceof Error ? error_2 : String(error_2));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Handler for per-monitor monitoring
    var handleStartMonitoring = function () {
        startSiteMonitorMonitoring(currentSite.identifier, selectedMonitorId);
    };
    var handleStopMonitoring = function () {
        stopSiteMonitorMonitoring(currentSite.identifier, selectedMonitorId);
    };
    // Check interval state and handlers
    var _g = react_1.useState((selectedMonitor === null || selectedMonitor === void 0 ? void 0 : selectedMonitor.checkInterval) || 60000), localCheckInterval = _g[0], setLocalCheckInterval = _g[1];
    var _h = react_1.useState(false), intervalChanged = _h[0], setIntervalChanged = _h[1];
    react_1.useEffect(function () {
        setLocalCheckInterval((selectedMonitor === null || selectedMonitor === void 0 ? void 0 : selectedMonitor.checkInterval) || 60000);
        setIntervalChanged(false);
    }, [selectedMonitor === null || selectedMonitor === void 0 ? void 0 : selectedMonitor.checkInterval, selectedMonitor === null || selectedMonitor === void 0 ? void 0 : selectedMonitor.type, currentSite.identifier]);
    var handleIntervalChange = function (e) {
        setLocalCheckInterval(Number(e.target.value));
        setIntervalChanged(Number(e.target.value) !== (selectedMonitor === null || selectedMonitor === void 0 ? void 0 : selectedMonitor.checkInterval));
    };
    var handleSaveInterval = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Always use currentSite.identifier as the first argument
                return [4 /*yield*/, updateSiteCheckInterval(currentSite.identifier, selectedMonitorId, localCheckInterval)];
                case 1:
                    // Always use currentSite.identifier as the first argument
                    _a.sent();
                    setIntervalChanged(false);
                    return [2 /*return*/];
            }
        });
    }); };
    // Only return undefined after all hooks
    if (!sites.find(function (s) { return s.identifier === site.identifier; }))
        return undefined;
    return (react_1["default"].createElement("div", { className: "site-details-modal", onClick: onClose },
        react_1["default"].createElement("div", { onClick: function (e) { return e.stopPropagation(); } },
            react_1["default"].createElement(components_1.ThemedBox, { surface: "overlay", padding: "lg", rounded: "lg", shadow: "xl", className: "site-details-content overflow-hidden animate-scale-in" },
                react_1["default"].createElement("div", { className: "site-details-header" },
                    react_1["default"].createElement("div", { className: "site-details-header-overlay" }),
                    react_1["default"].createElement("div", { className: "site-details-header-content" },
                        react_1["default"].createElement("div", { className: "site-details-header-accent" }),
                        react_1["default"].createElement("div", { className: "site-details-header-info flex items-center gap-4" },
                            react_1["default"].createElement(ScreenshotThumbnail, { url: (selectedMonitor === null || selectedMonitor === void 0 ? void 0 : selectedMonitor.type) === "http" ? ((_b = selectedMonitor === null || selectedMonitor === void 0 ? void 0 : selectedMonitor.url) !== null && _b !== void 0 ? _b : "") : "", siteName: currentSite.name || currentSite.identifier }),
                            react_1["default"].createElement("div", { className: "site-details-status-indicator" },
                                react_1["default"].createElement(components_1.StatusIndicator, { status: (_c = selectedMonitor === null || selectedMonitor === void 0 ? void 0 : selectedMonitor.status) !== null && _c !== void 0 ? _c : "unknown", size: "lg" }),
                                isRefreshing && (react_1["default"].createElement("div", { className: "site-details-loading-spinner" },
                                    react_1["default"].createElement("div", { className: "site-details-spinner" })))),
                            react_1["default"].createElement("div", { className: "flex-1 min-w-0" },
                                react_1["default"].createElement(components_1.ThemedText, { size: "2xl", weight: "bold", className: "site-details-title truncate" }, site.name || site.identifier),
                                (selectedMonitor === null || selectedMonitor === void 0 ? void 0 : selectedMonitor.type) === "http" && (selectedMonitor === null || selectedMonitor === void 0 ? void 0 : selectedMonitor.url) && (react_1["default"].createElement("a", { href: selectedMonitor.url, className: "site-details-url truncate", target: "_blank", rel: "noopener noreferrer", tabIndex: 0, "aria-label": "Open " + selectedMonitor.url + " in browser", onClick: function (e) {
                                        e.preventDefault();
                                        var url = selectedMonitor.url || "";
                                        if (hasOpenExternal(window.electronAPI)) {
                                            window.electronAPI.openExternal(url);
                                        }
                                        else {
                                            window.open(url, "_blank");
                                        }
                                    } }, selectedMonitor.url)),
                                !selectedMonitor && (react_1["default"].createElement(components_1.ThemedText, { variant: "warning", size: "base" }, "No monitor data available for this site.")))))),
                react_1["default"].createElement(components_1.ThemedBox, { variant: "secondary", padding: "lg", className: "border-b" },
                    react_1["default"].createElement("div", { className: "flex flex-wrap items-center gap-2" },
                        react_1["default"].createElement("div", { className: "flex flex-wrap gap-2 items-center" },
                            react_1["default"].createElement(components_1.ThemedButton, { variant: activeSiteDetailsTab === "overview" ? "primary" : "secondary", onClick: function () { return setActiveSiteDetailsTab("overview"); } }, "\uD83D\uDCCA Overview"),
                            react_1["default"].createElement(components_1.ThemedButton, { key: selectedMonitorId, variant: activeSiteDetailsTab === selectedMonitorId + "-analytics"
                                    ? "primary"
                                    : "secondary", onClick: function () { return setActiveSiteDetailsTab(selectedMonitorId + "-analytics"); } }, "\uD83D\uDCC8 " + selectedMonitorId.toUpperCase()),
                            react_1["default"].createElement(components_1.ThemedButton, { variant: activeSiteDetailsTab === "history" ? "primary" : "secondary", onClick: function () { return setActiveSiteDetailsTab("history"); } }, "\uD83D\uDCDC History"),
                            react_1["default"].createElement(components_1.ThemedButton, { variant: activeSiteDetailsTab === "settings" ? "primary" : "secondary", onClick: function () { return setActiveSiteDetailsTab("settings"); } }, "\u2699\uFE0F Settings")),
                        react_1["default"].createElement("div", { className: "ml-auto flex items-center gap-2" },
                            react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary" }, "Interval:"),
                            react_1["default"].createElement(components_1.ThemedSelect, { value: localCheckInterval, onChange: handleIntervalChange }, constants_1.CHECK_INTERVALS.map(function (interval) {
                                // Support both number and object forms
                                var value = typeof interval === "number" ? interval : interval.value;
                                var label = typeof interval === "number"
                                    ? value < 60000
                                        ? value / 1000 + "s"
                                        : value < 3600000
                                            ? value / 60000 + "m"
                                            : value / 3600000 + "h"
                                    : interval.label ||
                                        (interval.value < 60000
                                            ? interval.value / 1000 + "s"
                                            : interval.value < 3600000
                                                ? interval.value / 60000 + "m"
                                                : interval.value / 3600000 + "h");
                                return (react_1["default"].createElement("option", { key: value, value: value }, label));
                            })),
                            intervalChanged && (react_1["default"].createElement(components_1.ThemedButton, { variant: "primary", size: "sm", onClick: handleSaveInterval }, "Save")),
                            react_1["default"].createElement(components_1.ThemedButton, { variant: "ghost", size: "sm", onClick: handleCheckNow, className: "min-w-[32px]", "aria-label": "Check Now", disabled: isLoading },
                                react_1["default"].createElement("span", null, "\uD83D\uDD04")),
                            isMonitoring ? (react_1["default"].createElement(components_1.ThemedButton, { variant: "error", size: "sm", onClick: handleStopMonitoring, "aria-label": "Stop Monitoring", className: "flex items-center gap-1" },
                                react_1["default"].createElement("span", { className: "inline-block" }, "\u23F8\uFE0F"),
                                react_1["default"].createElement("span", { className: "hidden sm:inline" }, "Stop"))) : (react_1["default"].createElement(components_1.ThemedButton, { variant: "success", size: "sm", onClick: handleStartMonitoring, "aria-label": "Start Monitoring", className: "flex items-center gap-1" },
                                react_1["default"].createElement("span", { className: "inline-block" }, "\u25B6\uFE0F"),
                                react_1["default"].createElement("span", { className: "hidden sm:inline" }, "Start"))),
                            react_1["default"].createElement(components_1.ThemedText, { variant: "secondary", size: "base" }, "Monitor:"),
                            react_1["default"].createElement(components_1.ThemedSelect, { value: selectedMonitorId, onChange: handleMonitorIdChange }, currentSite.monitors.map(function (monitor) { return (react_1["default"].createElement("option", { key: monitor.id, value: monitor.id }, monitor.type.toUpperCase())); })))),
                    activeSiteDetailsTab === selectedMonitorId + "-analytics" &&
                        (selectedMonitorId === "http" || selectedMonitorId === "port") && (react_1["default"].createElement("div", { className: "flex items-center flex-wrap gap-3 mt-4" },
                        react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary", className: "mr-2" }, "Time Range:"),
                        react_1["default"].createElement("div", { className: "flex flex-wrap gap-1" }, ["1h", "24h", "7d", "30d"].map(function (range) { return (react_1["default"].createElement(components_1.ThemedButton, { key: range, variant: siteDetailsChartTimeRange === range ? "primary" : "ghost", size: "xs", onClick: function () { return setSiteDetailsChartTimeRange(range); } }, range)); }))))),
                react_1["default"].createElement(components_1.ThemedBox, { variant: "primary", padding: "lg", className: "max-h-[70vh] overflow-y-auto" },
                    activeSiteDetailsTab === "overview" && (react_1["default"].createElement(OverviewTab, { selectedMonitor: selectedMonitor, uptime: analytics.uptime, avgResponseTime: analytics.avgResponseTime, totalChecks: analytics.totalChecks, fastestResponse: analytics.fastestResponse, slowestResponse: analytics.slowestResponse, formatResponseTime: time_1.formatResponseTime, handleRemoveSite: handleRemoveSite, isLoading: isLoading })),
                    activeSiteDetailsTab === selectedMonitorId + "-analytics" && (react_1["default"].createElement(AnalyticsTab, { filteredHistory: analytics.filteredHistory, upCount: analytics.upCount, downCount: analytics.downCount, totalChecks: analytics.totalChecks, uptime: analytics.uptime, avgResponseTime: analytics.avgResponseTime, p50: analytics.p50, p95: analytics.p95, p99: analytics.p99, mttr: analytics.mttr, totalDowntime: analytics.totalDowntime, downtimePeriods: analytics.downtimePeriods, chartTimeRange: siteDetailsChartTimeRange, lineChartData: lineChartData, lineChartOptions: lineChartOptions, barChartData: barChartData, barChartOptions: barChartOptions, uptimeChartData: doughnutChartData, doughnutOptions: doughnutOptions, formatResponseTime: time_1.formatResponseTime, formatDuration: time_1.formatDuration, showAdvancedMetrics: showAdvancedMetrics, setShowAdvancedMetrics: setShowAdvancedMetrics, getAvailabilityColor: getAvailabilityColor, getAvailabilityVariant: getAvailabilityVariant, getAvailabilityDescription: getAvailabilityDescription, monitorType: selectedMonitor === null || selectedMonitor === void 0 ? void 0 : selectedMonitor.type })),
                    activeSiteDetailsTab === "history" && (react_1["default"].createElement(HistoryTab, { selectedMonitor: selectedMonitor, formatResponseTime: time_1.formatResponseTime, formatFullTimestamp: time_1.formatFullTimestamp, formatStatusWithIcon: status_1.formatStatusWithIcon })),
                    activeSiteDetailsTab === "settings" && (react_1["default"].createElement(SettingsTab, { currentSite: site, selectedMonitor: selectedMonitor, handleRemoveSite: handleRemoveSite, isLoading: isLoading, localCheckInterval: localCheckInterval, intervalChanged: intervalChanged, handleIntervalChange: handleIntervalChange, handleSaveInterval: handleSaveInterval })))))));
}
exports.SiteDetails = SiteDetails;
function OverviewTab(_a) {
    var avgResponseTime = _a.avgResponseTime, fastestResponse = _a.fastestResponse, formatResponseTime = _a.formatResponseTime, handleRemoveSite = _a.handleRemoveSite, isLoading = _a.isLoading, selectedMonitor = _a.selectedMonitor, slowestResponse = _a.slowestResponse, totalChecks = _a.totalChecks, uptime = _a.uptime;
    var _b = useTheme_1.useAvailabilityColors(), getAvailabilityColor = _b.getAvailabilityColor, getAvailabilityVariant = _b.getAvailabilityVariant;
    var currentTheme = useTheme_1.useTheme().currentTheme;
    // Map availability variant to progress/badge variant
    var mapAvailabilityToBadgeVariant = function (availability) {
        var variant = getAvailabilityVariant(availability);
        return variant === "danger" ? "error" : variant;
    };
    var uptimeValue = parseFloat(uptime);
    var progressVariant = mapAvailabilityToBadgeVariant(uptimeValue);
    // Icon colors from theme/availability
    var statusIconColor = getAvailabilityColor(uptimeValue); // Status icon color by availability
    var uptimeIconColor = getAvailabilityColor(uptimeValue); // Uptime icon color by availability
    var responseIconColor = currentTheme.colors.warning; // Response time icon uses theme warning
    var checksIconColor = currentTheme.colors.primary[500]; // Checks icon uses theme primary
    var fastestIconColor = currentTheme.colors.success; // Fastest uses theme success
    var slowestIconColor = currentTheme.colors.warning; // Slowest uses theme warning
    var quickActionIconColor = currentTheme.colors.error; // Quick action uses theme error
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" },
            react_1["default"].createElement(components_1.ThemedCard, { icon: react_1["default"].createElement(md_1.MdOutlineFactCheck, null), iconColor: statusIconColor, title: "Status", hoverable: true, className: "text-center flex flex-col items-center" },
                react_1["default"].createElement(components_1.StatusIndicator, { status: selectedMonitor.status, size: "lg", showText: true })),
            react_1["default"].createElement(components_1.ThemedCard, { icon: react_1["default"].createElement(md_1.MdAccessTime, null), iconColor: uptimeIconColor, title: "Uptime", hoverable: true, className: "text-center flex flex-col items-center" },
                react_1["default"].createElement(components_1.ThemedProgress, { value: uptimeValue, variant: progressVariant, showLabel: true, className: "flex flex-col items-center" }),
                react_1["default"].createElement(components_1.ThemedBadge, { variant: progressVariant, size: "sm", className: "mt-2" },
                    uptime,
                    "%")),
            react_1["default"].createElement(components_1.ThemedCard, { icon: react_1["default"].createElement(md_1.MdSpeed, null), iconColor: responseIconColor, title: "Response Time", hoverable: true, className: "text-center flex flex-col items-center" },
                react_1["default"].createElement(components_1.ThemedText, { size: "xl", weight: "bold" }, formatResponseTime(avgResponseTime))),
            react_1["default"].createElement(components_1.ThemedCard, { icon: react_1["default"].createElement(fa_1.FaListOl, null), iconColor: checksIconColor, title: "Total Checks", hoverable: true, className: "text-center flex flex-col items-center" },
                react_1["default"].createElement(components_1.ThemedText, { size: "xl", weight: "bold" }, totalChecks))),
        react_1["default"].createElement(components_1.ThemedCard, { icon: react_1["default"].createElement(md_1.MdBolt, { color: fastestIconColor }), title: "Performance Overview" },
            react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-6" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary" }, "Fastest Response"),
                    react_1["default"].createElement(components_1.ThemedBadge, { variant: "success", icon: react_1["default"].createElement(md_1.MdBolt, null), iconColor: fastestIconColor, className: "ml-4" }, formatResponseTime(fastestResponse))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary" }, "Slowest Response"),
                    react_1["default"].createElement(components_1.ThemedBadge, { variant: "warning", icon: react_1["default"].createElement(md_1.MdAccessTime, null), iconColor: slowestIconColor, className: "ml-4" }, formatResponseTime(slowestResponse))))),
        react_1["default"].createElement(components_1.ThemedCard, { icon: react_1["default"].createElement(md_1.MdBolt, { color: quickActionIconColor }), title: "Quick Actions" },
            react_1["default"].createElement("div", { className: "flex space-x-3" },
                react_1["default"].createElement(components_1.ThemedButton, { variant: "error", size: "sm", onClick: handleRemoveSite, disabled: isLoading, icon: react_1["default"].createElement(fi_1.FiTrash2, null) }, "Remove Site")))));
}
function AnalyticsTab(_a) {
    var avgResponseTime = _a.avgResponseTime, barChartData = _a.barChartData, barChartOptions = _a.barChartOptions, chartTimeRange = _a.chartTimeRange, doughnutOptions = _a.doughnutOptions, downCount = _a.downCount, downtimePeriods = _a.downtimePeriods, formatDuration = _a.formatDuration, formatResponseTime = _a.formatResponseTime, getAvailabilityColor = _a.getAvailabilityColor, getAvailabilityDescription = _a.getAvailabilityDescription, getAvailabilityVariant = _a.getAvailabilityVariant, lineChartData = _a.lineChartData, lineChartOptions = _a.lineChartOptions, monitorType = _a.monitorType, mttr = _a.mttr, p50 = _a.p50, p95 = _a.p95, p99 = _a.p99, setShowAdvancedMetrics = _a.setShowAdvancedMetrics, showAdvancedMetrics = _a.showAdvancedMetrics, totalChecks = _a.totalChecks, totalDowntime = _a.totalDowntime, upCount = _a.upCount, uptime = _a.uptime, uptimeChartData = _a.uptimeChartData;
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
            react_1["default"].createElement(components_1.ThemedBox, { surface: "base", padding: "lg", border: true, rounded: "lg", className: "text-center flex flex-col items-center" },
                react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary" },
                    "Availability (",
                    chartTimeRange,
                    ")"),
                react_1["default"].createElement(components_1.ThemedText, { size: "3xl", weight: "bold", variant: getAvailabilityVariant(parseFloat(uptime)), style: { color: getAvailabilityColor(parseFloat(uptime)) } },
                    uptime,
                    "%"),
                react_1["default"].createElement(components_1.ThemedText, { size: "xs", variant: "tertiary" },
                    upCount,
                    " up / ",
                    downCount,
                    " down"),
                react_1["default"].createElement(components_1.ThemedText, { size: "xs", variant: "secondary", className: "mt-1" }, getAvailabilityDescription(parseFloat(uptime)))),
            (monitorType === "http" || monitorType === "port") && (react_1["default"].createElement(components_1.ThemedBox, { surface: "base", padding: "lg", border: true, rounded: "lg", className: "text-center flex flex-col items-center" },
                react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary" }, "Avg Response Time"),
                react_1["default"].createElement(components_1.ThemedText, { size: "3xl", weight: "bold" }, formatResponseTime(avgResponseTime)),
                react_1["default"].createElement(components_1.ThemedText, { size: "xs", variant: "tertiary" },
                    "Based on ",
                    totalChecks,
                    " checks"))),
            react_1["default"].createElement(components_1.ThemedBox, { surface: "base", padding: "lg", border: true, rounded: "lg", className: "text-center flex flex-col items-center" },
                react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary" }, "Total Downtime"),
                react_1["default"].createElement(components_1.ThemedText, { size: "3xl", weight: "bold", variant: "danger" }, formatDuration(totalDowntime)),
                react_1["default"].createElement(components_1.ThemedText, { size: "xs", variant: "tertiary" },
                    downtimePeriods.length,
                    " incidents"))),
        (monitorType === "http" || monitorType === "port") && (react_1["default"].createElement(components_1.ThemedBox, { surface: "base", padding: "lg", border: true, rounded: "lg" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between mb-4" },
                react_1["default"].createElement(components_1.ThemedText, { size: "lg", weight: "semibold" }, "Response Time Analysis"),
                react_1["default"].createElement(components_1.ThemedButton, { variant: "ghost", size: "sm", onClick: function () { return setShowAdvancedMetrics(!showAdvancedMetrics); } },
                    showAdvancedMetrics ? "Hide" : "Show",
                    " Advanced")),
            react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4 mb-4" },
                react_1["default"].createElement("div", { className: "text-center flex flex-col items-center" },
                    react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary", className: "mb-4" }, "P50"),
                    react_1["default"].createElement(components_1.ThemedText, { size: "lg", weight: "medium" }, formatResponseTime(p50))),
                react_1["default"].createElement("div", { className: "text-center flex flex-col items-center" },
                    react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary", className: "mb-4" }, "P95"),
                    react_1["default"].createElement(components_1.ThemedText, { size: "lg", weight: "medium" }, formatResponseTime(p95))),
                react_1["default"].createElement("div", { className: "text-center flex flex-col items-center" },
                    react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary", className: "mb-4" }, "P99"),
                    react_1["default"].createElement(components_1.ThemedText, { size: "lg", weight: "medium" }, formatResponseTime(p99)))),
            showAdvancedMetrics && (react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4 pt-4 border-t" },
                react_1["default"].createElement("div", { className: "text-center flex flex-col items-center" },
                    react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary", className: "mb-4" }, "Mean Time To Recovery"),
                    react_1["default"].createElement(components_1.ThemedText, { size: "lg", weight: "medium" }, formatDuration(mttr))),
                react_1["default"].createElement("div", { className: "text-center flex flex-col items-center" },
                    react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary", className: "mb-4" }, "Incidents"),
                    react_1["default"].createElement(components_1.ThemedText, { size: "lg", weight: "medium" }, downtimePeriods.length)))))),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
            (monitorType === "http" || monitorType === "port") && (react_1["default"].createElement(components_1.ThemedBox, { surface: "base", padding: "md", border: true, rounded: "lg" },
                react_1["default"].createElement("div", { className: "h-64" },
                    react_1["default"].createElement(react_chartjs_2_1.Line, { data: lineChartData, options: lineChartOptions })))),
            react_1["default"].createElement(components_1.ThemedBox, { surface: "base", padding: "md", border: true, rounded: "lg" },
                react_1["default"].createElement("div", { className: "h-64" },
                    react_1["default"].createElement(react_chartjs_2_1.Doughnut, { data: uptimeChartData, options: doughnutOptions }))),
            react_1["default"].createElement(components_1.ThemedBox, { surface: "base", padding: "md", border: true, rounded: "lg", className: "lg:col-span-2" },
                react_1["default"].createElement("div", { className: "h-64" },
                    react_1["default"].createElement(react_chartjs_2_1.Bar, { data: barChartData, options: barChartOptions }))))));
}
function HistoryTab(_a) {
    var formatFullTimestamp = _a.formatFullTimestamp, formatResponseTime = _a.formatResponseTime, formatStatusWithIcon = _a.formatStatusWithIcon, selectedMonitor = _a.selectedMonitor;
    var settings = store_1.useStore().settings;
    var _b = react_1.useState("all"), historyFilter = _b[0], setHistoryFilter = _b[1];
    var historyLength = (selectedMonitor.history || []).length;
    var backendLimit = settings.historyLimit || 25;
    // Dropdown options: 25, 50, 100, All (clamped to backendLimit and available history)
    var maxShow = Math.min(backendLimit, historyLength);
    var showOptions = [10, 25, 50, 100, 250, 500, 1000, 10000].filter(function (opt) { return opt <= maxShow; });
    // Always include 'All' if there are fewer than backendLimit
    if (historyLength > 0 && historyLength <= backendLimit && !showOptions.includes(historyLength)) {
        showOptions.push(historyLength);
    }
    // Default to 50, but never more than backendLimit or available history
    var defaultHistoryLimit = Math.min(50, backendLimit, historyLength);
    var _c = react_1.useState(defaultHistoryLimit), historyLimit = _c[0], setHistoryLimit = _c[1];
    react_1.useEffect(function () {
        setHistoryLimit(Math.min(50, backendLimit, (selectedMonitor.history || []).length));
    }, [settings.historyLimit, selectedMonitor.history.length, backendLimit, selectedMonitor.history]);
    var filteredHistoryRecords = (selectedMonitor.history || [])
        .filter(function (record) { return historyFilter === "all" || record.status === historyFilter; })
        .slice(0, historyLimit);
    // Helper to render details with label
    // Use 'details' as optional property for backward compatibility
    function renderDetails(record) {
        if (!record.details)
            return undefined;
        if (selectedMonitor.type === "port") {
            return (react_1["default"].createElement(components_1.ThemedText, { size: "xs", variant: "secondary", className: "ml-4" },
                "Port: ",
                record.details));
        }
        if (selectedMonitor.type === "http") {
            return (react_1["default"].createElement(components_1.ThemedText, { size: "xs", variant: "secondary", className: "ml-4" },
                "Response Code: ",
                record.details));
        }
        return (react_1["default"].createElement(components_1.ThemedText, { size: "xs", variant: "secondary", className: "ml-4" }, record.details));
    }
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
            react_1["default"].createElement("div", { className: "flex items-center space-x-3" },
                react_1["default"].createElement(components_1.ThemedText, { size: "lg", weight: "semibold" }, "Check History"),
                react_1["default"].createElement("div", { className: "flex space-x-1" }, ["all", "up", "down"].map(function (filter) { return (react_1["default"].createElement(components_1.ThemedButton, { key: filter, variant: historyFilter === filter ? "primary" : "ghost", size: "xs", onClick: function () { return setHistoryFilter(filter); }, className: "capitalize ml-4" }, filter === "all" ? "All" : filter === "up" ? "✅ Up" : "❌ Down")); }))),
            react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary" }, "Show:"),
                react_1["default"].createElement("select", { value: historyLimit, onChange: function (e) { return setHistoryLimit(Number(e.target.value)); }, className: "px-2 py-1 border rounded", "aria-label": "History limit" },
                    showOptions.map(function (opt) { return (react_1["default"].createElement("option", { key: opt, value: opt }, opt)); }),
                    historyLength > backendLimit && react_1["default"].createElement("option", { value: historyLength },
                        "All (",
                        historyLength,
                        ")")),
                react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary" },
                    "of ",
                    historyLength,
                    " checks"))),
        react_1["default"].createElement(components_1.ThemedBox, { surface: "base", padding: "md", border: true, rounded: "lg", className: "max-h-96 overflow-y-auto" },
            react_1["default"].createElement("div", { className: "space-y-2" }, filteredHistoryRecords.map(function (record, index) { return (react_1["default"].createElement("div", { key: index, className: "flex items-center justify-between p-3 rounded-lg hover:bg-surface-elevated transition-colors" },
                react_1["default"].createElement("div", { className: "flex items-center space-x-3" },
                    react_1["default"].createElement(components_1.StatusIndicator, { status: record.status, size: "sm" }),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(components_1.ThemedText, { size: "sm", weight: "medium" }, formatFullTimestamp(record.timestamp)),
                        react_1["default"].createElement(components_1.ThemedText, { size: "xs", variant: "secondary", className: "ml-4" },
                            "Check #",
                            (selectedMonitor.history || []).length - index),
                        renderDetails(record))),
                react_1["default"].createElement("div", { className: "text-right" },
                    react_1["default"].createElement(components_1.ThemedText, { size: "sm", weight: "medium" }, formatResponseTime(record.responseTime)),
                    react_1["default"].createElement(components_1.ThemedText, { size: "xs", variant: "secondary", className: "ml-4" }, formatStatusWithIcon(record.status))))); }))),
        filteredHistoryRecords.length === 0 && (react_1["default"].createElement("div", { className: "text-center py-8" },
            react_1["default"].createElement(components_1.ThemedText, { variant: "secondary" }, "No records found for the selected filter.")))));
}
function SettingsTab(_a) {
    var _this = this;
    var _b;
    var currentSite = _a.currentSite, handleIntervalChange = _a.handleIntervalChange, handleRemoveSite = _a.handleRemoveSite, handleSaveInterval = _a.handleSaveInterval, intervalChanged = _a.intervalChanged, isLoading = _a.isLoading, localCheckInterval = _a.localCheckInterval, selectedMonitor = _a.selectedMonitor;
    var _c = store_1.useStore(), clearError = _c.clearError, modifySite = _c.modifySite;
    var _d = react_1.useState(currentSite.name || ""), localName = _d[0], setLocalName = _d[1];
    var _e = react_1.useState(false), hasUnsavedChanges = _e[0], setHasUnsavedChanges = _e[1];
    // Track changes
    react_1.useEffect(function () {
        setHasUnsavedChanges(localName !== (currentSite.name || ""));
    }, [localName, currentSite.name]);
    var handleSaveName = function () { return __awaiter(_this, void 0, void 0, function () {
        var updates, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!hasUnsavedChanges)
                        return [2 /*return*/];
                    clearError();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    updates = { name: localName.trim() || undefined };
                    return [4 /*yield*/, modifySite(currentSite.identifier, updates)];
                case 2:
                    _a.sent();
                    setHasUnsavedChanges(false);
                    logger_1["default"].user.action("Updated site name", { identifier: currentSite.identifier, name: localName.trim() });
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    logger_1["default"].site.error(currentSite.identifier, error_3 instanceof Error ? error_3 : String(error_3));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement("div", { className: "space-y-10" },
        react_1["default"].createElement(components_1.ThemedCard, { icon: "\u2699\uFE0F", title: "Site Configuration", padding: "xl", rounded: "xl", shadow: "lg", className: "mb-6" },
            react_1["default"].createElement("div", { className: "space-y-8" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2" }, "Site Name"),
                    react_1["default"].createElement("div", { className: "flex gap-3 items-center" },
                        react_1["default"].createElement(components_1.ThemedInput, { type: "text", value: localName, onChange: function (e) { return setLocalName(e.target.value); }, placeholder: "Enter a custom name for this site", className: "flex-1" }),
                        react_1["default"].createElement(components_1.ThemedButton, { variant: hasUnsavedChanges ? "primary" : "secondary", size: "sm", onClick: handleSaveName, disabled: !hasUnsavedChanges || isLoading, loading: isLoading, icon: react_1["default"].createElement(fi_1.FiSave, null), className: "min-w-[90px]" }, "Save")),
                    hasUnsavedChanges && (react_1["default"].createElement(components_1.ThemedBadge, { variant: "warning", size: "xs", className: "mt-2" }, "\u26A0\uFE0F Unsaved changes"))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2" }, "Site Identifier"),
                    react_1["default"].createElement(components_1.ThemedInput, { type: "text", value: (_b = selectedMonitor === null || selectedMonitor === void 0 ? void 0 : selectedMonitor.url) !== null && _b !== void 0 ? _b : currentSite.identifier, disabled: true, className: "opacity-70" }),
                    react_1["default"].createElement(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "mt-1" }, "Identifier cannot be changed")))),
        react_1["default"].createElement(components_1.ThemedBox, { variant: "secondary", padding: "md", className: "flex items-center gap-3 mb-4" },
            react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary" }, "Check every:"),
            react_1["default"].createElement(components_1.ThemedSelect, { value: localCheckInterval, onChange: handleIntervalChange }, constants_1.CHECK_INTERVALS.map(function (interval) {
                // Support both number and object forms
                var value = typeof interval === "number" ? interval : interval.value;
                var label = typeof interval === "number"
                    ? value < 60000
                        ? value / 1000 + "s"
                        : value < 3600000
                            ? value / 60000 + "m"
                            : value / 3600000 + "h"
                    : interval.label ||
                        (interval.value < 60000
                            ? interval.value / 1000 + "s"
                            : interval.value < 3600000
                                ? interval.value / 60000 + "m"
                                : interval.value / 3600000 + "h");
                return (react_1["default"].createElement("option", { key: value, value: value }, label));
            })),
            react_1["default"].createElement(components_1.ThemedButton, { variant: intervalChanged ? "primary" : "secondary", size: "sm", onClick: handleSaveInterval, disabled: !intervalChanged }, "Save"),
            react_1["default"].createElement(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "ml-2" },
                "(This monitor checks every ",
                Math.round(localCheckInterval / 1000),
                "s)")),
        react_1["default"].createElement(components_1.ThemedCard, { icon: "\uD83D\uDCCA", title: "Site Information", padding: "xl", rounded: "xl", shadow: "md", className: "mb-6" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                react_1["default"].createElement("div", { className: "flex flex-col gap-3" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                        react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary" }, "Site Identifier:"),
                        react_1["default"].createElement(components_1.ThemedBadge, { variant: "secondary", size: "xs" }, currentSite.identifier)),
                    react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                        react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary" }, "Total Monitor History Records:"),
                        react_1["default"].createElement(components_1.ThemedBadge, { variant: "info", size: "xs" }, (selectedMonitor.history || []).length))),
                react_1["default"].createElement("div", { className: "flex flex-col gap-3" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                        react_1["default"].createElement(components_1.ThemedText, { size: "sm", variant: "secondary" }, "Last Checked:"),
                        react_1["default"].createElement(components_1.ThemedText, { size: "xs", variant: "tertiary" }, selectedMonitor.lastChecked
                            ? new Date(selectedMonitor.lastChecked).toLocaleString()
                            : "Never"))))),
        react_1["default"].createElement(components_1.ThemedCard, { icon: "\u26A0\uFE0F", title: "Danger Zone", variant: "tertiary", padding: "xl", rounded: "xl", shadow: "md", className: "border-2 border-error/30" },
            react_1["default"].createElement("div", { className: "space-y-6" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(components_1.ThemedText, { size: "sm", weight: "medium", variant: "error", className: "mb-2" }, "Remove Site"),
                    react_1["default"].createElement(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "mb-4 ml-1 block" }, "This action cannot be undone. All history data for this site will be lost."),
                    react_1["default"].createElement(components_1.ThemedButton, { variant: "error", size: "md", onClick: handleRemoveSite, loading: isLoading, icon: react_1["default"].createElement(fi_1.FiTrash2, null), className: "w-full" }, "Remove Site"))))));
}
// Ensure hasOpenExternal is defined at the top (after imports):
// Accept unknown for runtime type check
function hasOpenExternal(api) {
    var _a;
    return typeof ((_a = api) === null || _a === void 0 ? void 0 : _a.openExternal) === "function";
}
// Update ScreenshotThumbnail to use only CSS classes for overlay/image
function ScreenshotThumbnail(_a) {
    var siteName = _a.siteName, url = _a.url;
    var _b = react_1.useState(false), hovered = _b[0], setHovered = _b[1];
    var _c = react_1.useState({}), overlayVars = _c[0], setOverlayVars = _c[1];
    var linkRef = react_1.useRef(null);
    var themeName = useTheme_1.useTheme().themeName;
    var screenshotUrl = "https://api.microlink.io/?url=" + encodeURIComponent(url) + "&screenshot=true&meta=false&embed=screenshot.url&colorScheme=auto";
    function handleClick(e) {
        e.preventDefault();
        if (hasOpenExternal(window.electronAPI)) {
            window.electronAPI.openExternal(url);
        }
        else {
            window.open(url, "_blank", "noopener");
        }
    }
    react_1.useEffect(function () {
        if (hovered && linkRef.current) {
            var rect = linkRef.current.getBoundingClientRect();
            var viewportW = window.innerWidth;
            var viewportH = window.innerHeight;
            var maxImgW = Math.min(viewportW * 0.9, 900); // 90vw or 900px max
            var maxImgH = Math.min(viewportH * 0.9, 700); // 90vh or 700px max
            var overlayW = maxImgW;
            var overlayH = maxImgH;
            // eslint-disable-next-line functional/no-let -- top is reassigned if it is above the viewport or too close to the top/bottom.
            var top = rect.top - overlayH - 16; // 16px gap above
            // eslint-disable-next-line functional/no-let -- left is reassigned if it is too far left or right.
            var left = rect.left + rect.width / 2 - overlayW / 2;
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
                "--overlay-height": overlayH + "px",
                "--overlay-left": left + "px",
                "--overlay-top": top + "px",
                "--overlay-width": overlayW + "px"
            });
        }
        else if (!hovered) {
            setOverlayVars({});
        }
    }, [hovered, url, siteName]);
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("a", { ref: linkRef, href: url, tabIndex: 0, "aria-label": "Open " + url + " in browser", onClick: handleClick, className: "site-details-thumbnail-link", onMouseEnter: function () { return setHovered(true); }, onMouseLeave: function () { return setHovered(false); }, onFocus: function () { return setHovered(true); }, onBlur: function () { return setHovered(false); } },
            react_1["default"].createElement("img", { src: screenshotUrl, alt: "Screenshot of " + siteName, className: "site-details-thumbnail-img", loading: "lazy" }),
            react_1["default"].createElement("span", { className: "site-details-thumbnail-caption" },
                "Preview: ",
                siteName)),
        hovered &&
            react_dom_1.createPortal(react_1["default"].createElement("div", { className: "site-details-thumbnail-portal-overlay theme-" + themeName, style: overlayVars },
                react_1["default"].createElement("div", { className: "site-details-thumbnail-portal-img-wrapper" },
                    react_1["default"].createElement("img", { src: screenshotUrl, alt: "Large screenshot of " + siteName, className: "site-details-thumbnail-img-portal", loading: "lazy", tabIndex: 0 }))), document.body)));
}
