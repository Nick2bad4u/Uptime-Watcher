"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteCard = SiteCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const logger_1 = __importDefault(require("../services/logger"));
const store_1 = require("../store");
const components_1 = require("../theme/components");
function SiteCard({ site }) {
    // Always select the latest site from the store by id
    const { checkSiteNow, getSelectedMonitorId, // updated
    isLoading, setSelectedMonitorId, // updated
    setSelectedSite, setShowSiteDetails, sites, startSiteMonitorMonitoring, stopSiteMonitorMonitoring, } = (0, store_1.useStore)();
    const latestSite = sites.find((s) => s.identifier === site.identifier) || site;
    // Use global store for selected monitor id
    const monitorIds = latestSite.monitors.map((m) => m.id);
    const defaultMonitorId = monitorIds[0] || "";
    const selectedMonitorId = getSelectedMonitorId(latestSite.identifier) || defaultMonitorId;
    const monitor = latestSite.monitors.find((m) => m.id === selectedMonitorId);
    // Debug: log the monitor and its history
    // if (monitor) {
    //     logger.debug(`[SiteCard] [${latestSite.identifier}] Monitor ${monitor.type} history:`, monitor.history);
    // } else {
    //     logger.debug(`[SiteCard] [${latestSite.identifier}] No monitor found for ${selectedMonitorType} in site ${latestSite.identifier}`);
    // }
    const status = monitor?.status || "pending";
    const responseTime = monitor?.responseTime;
    const filteredHistory = monitor?.history || [];
    const isMonitoring = monitor?.monitoring !== false; // default to true if undefined
    const handleMonitorIdChange = (e) => {
        setSelectedMonitorId(latestSite.identifier, e.target.value);
    };
    // Refactor handlers to not require event argument
    const handleStartMonitoring = () => {
        if (!monitor)
            return;
        startSiteMonitorMonitoring(latestSite.identifier, monitor.id);
    };
    const handleStopMonitoring = () => {
        if (!monitor)
            return;
        stopSiteMonitorMonitoring(latestSite.identifier, monitor.id);
    };
    const handleCheckNow = () => {
        if (!monitor)
            return;
        checkSiteNow(latestSite.identifier, monitor.id)
            .then(() => logger_1.default.user.action("Quick site check", {
            identifier: latestSite.identifier,
            monitorId: monitor.id,
        }))
            .catch((error) => logger_1.default.site.error(latestSite.identifier, error instanceof Error ? error : String(error)));
    };
    const handleCardClick = () => {
        setSelectedSite(latestSite);
        setSelectedMonitorId(latestSite.identifier, selectedMonitorId);
        setShowSiteDetails(true);
    };
    // Calculate uptime for the selected monitor
    const calculateUptime = () => {
        if (filteredHistory.length === 0)
            return 0;
        const upCount = filteredHistory.filter((record) => record.status === "up").length;
        return Math.round((upCount / filteredHistory.length) * 100);
    };
    // --- UI ---
    return ((0, jsx_runtime_1.jsxs)(components_1.ThemedBox, { variant: "secondary", padding: "md", rounded: "md", shadow: "sm", className: "site-card flex flex-col gap-2 cursor-pointer", onClick: handleCardClick, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { variant: "primary", size: "lg", weight: "semibold", children: latestSite.name || latestSite.identifier }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 min-w-[180px]", children: [(0, jsx_runtime_1.jsx)("div", { onClick: (e) => e.stopPropagation(), onMouseDown: (e) => e.stopPropagation(), children: (0, jsx_runtime_1.jsx)(components_1.ThemedSelect, { value: selectedMonitorId, onChange: handleMonitorIdChange, className: "min-w-[80px]", children: latestSite.monitors.map((m) => ((0, jsx_runtime_1.jsxs)("option", { value: m.id, children: [m.type.toUpperCase(), " ", m.port ? `:${m.port}` : m.url ? `: ${m.url}` : ""] }, m.id))) }) }), (0, jsx_runtime_1.jsx)("div", { onClick: (e) => e.stopPropagation(), onMouseDown: (e) => e.stopPropagation(), children: (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "ghost", size: "sm", onClick: handleCheckNow, className: "min-w-[32px]", "aria-label": "Check Now", disabled: isLoading || !monitor, children: (0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDD04" }) }) }), isMonitoring ? ((0, jsx_runtime_1.jsx)("div", { onClick: (e) => e.stopPropagation(), onMouseDown: (e) => e.stopPropagation(), children: (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "error", size: "sm", onClick: handleStopMonitoring, className: "min-w-[32px]", "aria-label": "Stop Monitoring", disabled: isLoading || !monitor, children: "\u23F8\uFE0F" }) })) : ((0, jsx_runtime_1.jsx)("div", { onClick: (e) => e.stopPropagation(), onMouseDown: (e) => e.stopPropagation(), children: (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "success", size: "sm", onClick: handleStartMonitoring, className: "min-w-[32px]", "aria-label": "Start Monitoring", disabled: isLoading || !monitor, children: "\u25B6\uFE0F" }) }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)(components_1.StatusIndicator, { status: status, size: "sm" }), (0, jsx_runtime_1.jsxs)(components_1.ThemedText, { variant: "secondary", size: "sm", children: [selectedMonitorId.toUpperCase(), " Status: ", status] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-4 gap-4 mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center flex flex-col items-center", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "secondary", className: "block mb-1", children: "Status" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", children: status?.toUpperCase() || "UNKNOWN" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center flex flex-col items-center", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "secondary", className: "block mb-1", children: "Uptime" }), (0, jsx_runtime_1.jsxs)(components_1.ThemedText, { size: "sm", weight: "medium", children: [calculateUptime(), "%"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center flex flex-col items-center", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "secondary", className: "block mb-1", children: "Response" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", children: responseTime !== undefined ? `${responseTime} ms` : "-" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center flex flex-col items-center", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "secondary", className: "block mb-1", children: "Checks" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", children: filteredHistory.length })] })] }), filteredHistory.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "mb-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-between mb-2", children: (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-2", children: (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "secondary", children: monitor
                                    ? monitor.type === "http"
                                        ? `HTTP History${monitor.url ? ` (${monitor.url})` : ""}`
                                        : monitor.type === "port"
                                            ? `Port History${monitor.port ? ` (${monitor.host}:${monitor.port})` : monitor.host ? ` (${monitor.host})` : ""}`
                                            : `${monitor.type} History`
                                    : "No Monitor Selected" }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center space-x-1", children: filteredHistory.slice(-20).map((record, index) => ((0, jsx_runtime_1.jsx)(components_1.MiniChartBar, { status: record.status, responseTime: record.responseTime, timestamp: record.timestamp }, index))) })] })), (0, jsx_runtime_1.jsx)("div", { className: "border-t pt-2 mt-2", children: (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "text-center opacity-0 group-hover:opacity-100 transition-opacity", children: "Click to view detailed statistics and settings" }) })] }));
}
