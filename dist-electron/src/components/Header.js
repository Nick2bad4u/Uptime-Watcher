import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useStore } from "../store";
import { ThemedBox, ThemedText, ThemedButton, StatusIndicator } from "../theme/components";
import { useTheme } from "../theme/useTheme";
import { useAvailabilityColors } from "../theme/useTheme";
import "./Header.css";
export function Header() {
    const { sites, setShowSettings } = useStore();
    const { toggleTheme, isDark } = useTheme();
    const { getAvailabilityColor } = useAvailabilityColors();
    // Count all monitors across all sites by status
    let upMonitors = 0;
    let downMonitors = 0;
    let pendingMonitors = 0;
    let totalMonitors = 0;
    sites.forEach((site) => {
        site.monitors?.forEach((monitor) => {
            totalMonitors++;
            if (monitor.status === "up")
                upMonitors++;
            else if (monitor.status === "down")
                downMonitors++;
            else if (monitor.status === "pending")
                pendingMonitors++;
        });
    });
    // Calculate uptime percentage for monitors
    const uptimePercentage = totalMonitors > 0 ? Math.round((upMonitors / totalMonitors) * 100) : 0;
    return (_jsx(ThemedBox, { surface: "elevated", padding: "md", className: "shadow-sm border-b", border: true, children: _jsx("div", { className: "header-container", children: _jsxs("div", { className: "flex items-center justify-between py-4 gap-4 flex-wrap", children: [_jsxs("div", { className: "flex items-center gap-6 min-w-0 flex-shrink flex-wrap", children: [_jsxs("span", { className: "flex items-center gap-2 min-w-[180px] px-4 py-1 header-title-box", children: [_jsx("span", { className: "text-2xl select-none", children: "\uD83D\uDCCA" }), _jsx(ThemedText, { size: "2xl", weight: "bold", className: "truncate header-title-accent", children: "Uptime Watcher" })] }), _jsxs(ThemedBox, { variant: "secondary", padding: "sm", rounded: "lg", shadow: "sm", className: "flex items-center sphace-x-3 transition-all duration-300 min-w-[340px] header-status-summary-box", children: [totalMonitors > 0 && (_jsxs("div", { className: `flex items-center space-x-2 px-3 py-1 rounded-md group transition-all duration-200 health-badge`, "data-health-color": getAvailabilityColor(uptimePercentage), children: [_jsx("div", { className: "w-3 h-3 rounded-full animate-pulse health-dot", "data-health-color": getAvailabilityColor(uptimePercentage) }), _jsxs("div", { className: "flex flex-col", children: [_jsxs(ThemedText, { size: "sm", weight: "bold", className: "health-text", "data-health-color": getAvailabilityColor(uptimePercentage), children: [uptimePercentage, "%"] }), _jsx(ThemedText, { size: "xs", variant: "secondary", className: "leading-none", children: "Health" })] })] })), totalMonitors > 0 && _jsx("div", { className: "w-px h-8 bg-current opacity-20" }), _jsxs("div", { className: "flex items-center space-x-2 px-2 py-1 rounded-md transition-all duration-200 group status-up-badge", children: [_jsx(StatusIndicator, { status: "up", size: "sm" }), _jsxs("div", { className: "flex flex-col", children: [_jsx(ThemedText, { size: "sm", weight: "semibold", variant: "primary", children: upMonitors }), _jsx(ThemedText, { size: "xs", variant: "secondary", className: "leading-none", children: "Up" })] })] }), _jsx("div", { className: "w-px h-8 bg-current opacity-20" }), _jsxs("div", { className: "flex items-center space-x-2 px-2 py-1 rounded-md transition-all duration-200 group status-down-badge", children: [_jsx(StatusIndicator, { status: "down", size: "sm" }), _jsxs("div", { className: "flex flex-col", children: [_jsx(ThemedText, { size: "sm", weight: "semibold", variant: "primary", children: downMonitors }), _jsx(ThemedText, { size: "xs", variant: "secondary", className: "leading-none", children: "Down" })] })] }), _jsx("div", { className: "w-px h-8 bg-current opacity-20" }), _jsxs("div", { className: "flex items-center space-x-2 px-2 py-1 rounded-md transition-all duration-200 group status-pending-badge", children: [_jsx(StatusIndicator, { status: "pending", size: "sm" }), _jsxs("div", { className: "flex flex-col", children: [_jsx(ThemedText, { size: "sm", weight: "semibold", variant: "primary", children: pendingMonitors }), _jsx(ThemedText, { size: "xs", variant: "secondary", className: "leading-none", children: "Pending" })] })] }), totalMonitors > 0 && (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-px h-8 bg-current opacity-20" }), _jsxs("div", { className: "flex items-center space-x-2 px-2 py-1 rounded-md bg-opacity-10 total-sites-badge", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-current opacity-50" }), _jsxs("div", { className: "flex flex-col", children: [_jsx(ThemedText, { size: "sm", weight: "semibold", variant: "primary", children: totalMonitors }), _jsx(ThemedText, { size: "xs", variant: "secondary", className: "leading-none", children: "Total" })] })] })] }))] })] }), _jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [_jsx(ThemedBox, { variant: "tertiary", padding: "xs", rounded: "md", className: "flex items-center header-controls-box", children: _jsx(ThemedButton, { variant: "secondary", size: "sm", onClick: toggleTheme, className: "p-2 themed-button--icon", "aria-label": "Toggle theme", children: isDark ? "☀️" : "🌙" }) }), _jsx(ThemedBox, { variant: "tertiary", padding: "xs", rounded: "md", className: "flex items-center header-controls-box", children: _jsx(ThemedButton, { variant: "secondary", size: "sm", onClick: () => setShowSettings(true), className: "p-2 themed-button--icon", "aria-label": "Settings", children: "\u2699\uFE0F" }) })] })] }) }) }));
}
