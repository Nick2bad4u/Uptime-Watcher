"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = Header;
const jsx_runtime_1 = require("react/jsx-runtime");
/* eslint-disable functional/no-let */
const store_1 = require("../store");
const components_1 = require("../theme/components");
const useTheme_1 = require("../theme/useTheme");
const useTheme_2 = require("../theme/useTheme");
require("./Header.css");
function Header() {
    const { setShowSettings, sites } = (0, store_1.useStore)();
    const { isDark, toggleTheme } = (0, useTheme_1.useTheme)();
    const { getAvailabilityColor } = (0, useTheme_2.useAvailabilityColors)();
    // Count all monitors across all sites by status
    let upMonitors = 0;
    let downMonitors = 0;
    let pendingMonitors = 0;
    let totalMonitors = 0;
    for (const site of sites) {
        if (site.monitors)
            for (const monitor of site.monitors) {
                totalMonitors++;
                if (monitor.status === "up")
                    upMonitors++;
                else if (monitor.status === "down")
                    downMonitors++;
                else if (monitor.status === "pending")
                    pendingMonitors++;
            }
    }
    // Calculate uptime percentage for monitors
    const uptimePercentage = totalMonitors > 0 ? Math.round((upMonitors / totalMonitors) * 100) : 0;
    return ((0, jsx_runtime_1.jsx)(components_1.ThemedBox, { surface: "elevated", padding: "md", className: "shadow-sm border-b", border: true, children: (0, jsx_runtime_1.jsx)("div", { className: "header-container", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between py-4 gap-4 flex-wrap", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-6 min-w-0 flex-shrink flex-wrap", children: [(0, jsx_runtime_1.jsxs)("span", { className: "flex items-center gap-2 min-w-[180px] px-4 py-1 header-title-box", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-2xl select-none", children: "\uD83D\uDCCA" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "2xl", weight: "bold", className: "truncate header-title-accent", children: "Uptime Watcher" })] }), (0, jsx_runtime_1.jsxs)(components_1.ThemedBox, { variant: "secondary", padding: "sm", rounded: "lg", shadow: "sm", className: "flex items-center sphace-x-3 transition-all duration-300 min-w-[340px] header-status-summary-box", children: [totalMonitors > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: `flex items-center space-x-2 px-3 py-1 rounded-md group transition-all duration-200 health-badge`, "data-health-color": getAvailabilityColor(uptimePercentage), children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 rounded-full animate-pulse health-dot", "data-health-color": getAvailabilityColor(uptimePercentage) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col", children: [(0, jsx_runtime_1.jsxs)(components_1.ThemedText, { size: "sm", weight: "bold", className: "health-text", "data-health-color": getAvailabilityColor(uptimePercentage), children: [uptimePercentage, "%"] }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "secondary", className: "leading-none", children: "Health" })] })] })), totalMonitors > 0 && (0, jsx_runtime_1.jsx)("div", { className: "w-px h-8 bg-current opacity-20" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2 px-2 py-1 rounded-md transition-all duration-200 group status-up-badge", children: [(0, jsx_runtime_1.jsx)(components_1.StatusIndicator, { status: "up", size: "sm" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "semibold", variant: "primary", children: upMonitors }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "secondary", className: "leading-none", children: "Up" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "w-px h-8 bg-current opacity-20" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2 px-2 py-1 rounded-md transition-all duration-200 group status-down-badge", children: [(0, jsx_runtime_1.jsx)(components_1.StatusIndicator, { status: "down", size: "sm" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "semibold", variant: "primary", children: downMonitors }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "secondary", className: "leading-none", children: "Down" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "w-px h-8 bg-current opacity-20" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2 px-2 py-1 rounded-md transition-all duration-200 group status-pending-badge", children: [(0, jsx_runtime_1.jsx)(components_1.StatusIndicator, { status: "pending", size: "sm" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "semibold", variant: "primary", children: pendingMonitors }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "secondary", className: "leading-none", children: "Pending" })] })] }), totalMonitors > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "w-px h-8 bg-current opacity-20" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2 px-2 py-1 rounded-md bg-opacity-10 total-sites-badge", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-2 h-2 rounded-full bg-current opacity-50" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "semibold", variant: "primary", children: totalMonitors }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "secondary", className: "leading-none", children: "Total" })] })] })] }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 flex-wrap", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedBox, { variant: "tertiary", padding: "xs", rounded: "md", className: "flex items-center header-controls-box", children: (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "secondary", size: "sm", onClick: toggleTheme, className: "p-2 themed-button--icon", "aria-label": "Toggle theme", children: isDark ? "☀️" : "🌙" }) }), (0, jsx_runtime_1.jsx)(components_1.ThemedBox, { variant: "tertiary", padding: "xs", rounded: "md", className: "flex items-center header-controls-box", children: (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "secondary", size: "sm", onClick: () => setShowSettings(true), className: "p-2 themed-button--icon", "aria-label": "Settings", children: "\u2699\uFE0F" }) })] })] }) }) }));
}
