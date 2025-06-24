"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSiteForm = AddSiteForm;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const store_1 = require("../store");
const constants_1 = require("../constants");
const useTheme_1 = require("../theme/useTheme");
const components_1 = require("../theme/components");
const logger_1 = __importDefault(require("../services/logger"));
function AddSiteForm() {
    const { createSite, addMonitorToSite, sites, isLoading, lastError, clearError } = (0, store_1.useStore)();
    const { isDark } = (0, useTheme_1.useTheme)();
    // Remove identifier state, use only for monitor input
    const [target, setTarget] = (0, react_1.useState)(""); // For HTTP URL
    const [host, setHost] = (0, react_1.useState)(""); // For Port monitor host
    const [port, setPort] = (0, react_1.useState)(""); // For Port monitor port (string for input)
    const [name, setName] = (0, react_1.useState)("");
    const [monitorType, setMonitorType] = (0, react_1.useState)("http");
    const [checkInterval, setCheckInterval] = (0, react_1.useState)(constants_1.CHECK_INTERVALS[6]?.value || 60000); // Default 1 min
    // UUID state
    const generateUUID = () => typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `site-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
    const [siteId, setSiteId] = (0, react_1.useState)(generateUUID());
    // New: Add mode toggle
    const [addMode, setAddMode] = (0, react_1.useState)("new");
    const [selectedExistingSite, setSelectedExistingSite] = (0, react_1.useState)("");
    // Delayed loading state for button spinner (100ms delay)
    const [showButtonLoading, setShowButtonLoading] = (0, react_1.useState)(false);
    const [formError, setFormError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        let timeoutId;
        if (isLoading) {
            // Show button loading after 100ms delay
            timeoutId = setTimeout(() => {
                setShowButtonLoading(true);
            }, constants_1.UI_DELAYS.LOADING_BUTTON);
        }
        else {
            // Hide button loading immediately when loading stops
            setShowButtonLoading(false);
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isLoading]);
    // Reset fields when monitor type changes
    (0, react_1.useEffect)(() => {
        setFormError(null);
        setTarget("");
        setHost("");
        setPort("");
    }, [monitorType]);
    // Reset name and siteId when switching to new site
    (0, react_1.useEffect)(() => {
        if (addMode === "new") {
            setName("");
            setSiteId(generateUUID());
        }
        else {
            setName("");
        }
        setFormError(null);
    }, [addMode]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        if (addMode === "new" && !name.trim()) {
            setFormError("Site name is required");
            return;
        }
        if (addMode === "existing" && !selectedExistingSite) {
            setFormError("Please select a site to add the monitor to");
            return;
        }
        if (monitorType === "http") {
            if (!target.trim()) {
                setFormError("Website URL is required for HTTP monitor");
                return;
            }
            if (!/^https?:\/\//i.test(target.trim())) {
                setFormError("HTTP monitor requires a URL starting with http:// or https://");
                return;
            }
        }
        else if (monitorType === "port") {
            if (!host.trim()) {
                setFormError("Host is required for port monitor");
                return;
            }
            if (!port.trim()) {
                setFormError("Port is required for port monitor");
                return;
            }
            const portNum = Number(port);
            if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
                setFormError("Port must be a number between 1 and 65535");
                return;
            }
        }
        clearError();
        try {
            const identifier = addMode === "new" ? siteId : selectedExistingSite;
            const monitor = {
                id: generateUUID(), // Always assign a unique string id
                type: monitorType,
                status: "pending",
                history: [],
            };
            if (monitorType === "http") {
                monitor.url = target.trim();
            }
            else if (monitorType === "port") {
                monitor.host = host.trim();
                monitor.port = Number(port);
            }
            monitor.checkInterval = checkInterval;
            if (addMode === "new") {
                const siteData = {
                    identifier,
                    name: name.trim() || undefined,
                    monitors: [monitor],
                };
                await createSite(siteData);
                logger_1.default.user.action("Added site", { identifier, name: name.trim(), monitorType, monitorId: monitor.id });
            }
            else {
                await addMonitorToSite(identifier, monitor);
                logger_1.default.user.action("Added monitor to site", { identifier, monitorType });
            }
            // Reset form on success
            setTarget("");
            setHost("");
            setPort("");
            setName("");
            setMonitorType("http");
            setCheckInterval(constants_1.CHECK_INTERVALS[6]?.value || 60000);
            setSiteId(generateUUID());
            setAddMode("new");
            setSelectedExistingSite("");
        }
        catch (error) {
            logger_1.default.error("Failed to add site/monitor from form", error);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-4 items-center", children: [(0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)("input", { type: "radio", name: "addMode", value: "new", checked: addMode === "new", onChange: () => setAddMode("new") }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", children: "Create New Site" })] }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)("input", { type: "radio", name: "addMode", value: "existing", checked: addMode === "existing", onChange: () => setAddMode("existing") }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", children: "Add to Existing Site" })] })] }), addMode === "existing" && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1", children: "Select Site" }), (0, jsx_runtime_1.jsxs)(components_1.ThemedSelect, { value: selectedExistingSite, onChange: (e) => setSelectedExistingSite(e.target.value), "aria-label": "Select Existing Site", required: true, children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "-- Select a site --" }), sites.map((site) => ((0, jsx_runtime_1.jsx)("option", { value: site.identifier, children: site.name || site.identifier }, site.identifier)))] })] })), addMode === "new" && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1", children: "Site Name *" }), (0, jsx_runtime_1.jsx)(components_1.ThemedInput, { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "My Website", "aria-label": "Site name (required)", required: true })] })), addMode === "new" && ((0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "block select-all", children: ["Site Identifier: ", (0, jsx_runtime_1.jsx)("span", { className: "font-mono", children: siteId })] }) })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1", children: "Monitor Type" }), (0, jsx_runtime_1.jsxs)(components_1.ThemedSelect, { value: monitorType, onChange: (e) => setMonitorType(e.target.value), "aria-label": "Monitor Type", children: [(0, jsx_runtime_1.jsx)("option", { value: "http", children: "HTTP (Website/API)" }), (0, jsx_runtime_1.jsx)("option", { value: "port", children: "Port (Host/Port)" })] })] }), monitorType === "http" && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1", children: "Website URL *" }), (0, jsx_runtime_1.jsx)(components_1.ThemedInput, { type: "url", value: target, onChange: (e) => setTarget(e.target.value), placeholder: "https://example.com", required: true, "aria-label": "Website URL (required)" })] })), monitorType === "port" && ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-2", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1", children: "Host *" }), (0, jsx_runtime_1.jsx)(components_1.ThemedInput, { type: "text", value: host, onChange: (e) => setHost(e.target.value), placeholder: "example.com or 192.168.1.1", required: true, "aria-label": "Host (required)" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1", children: "Port *" }), (0, jsx_runtime_1.jsx)(components_1.ThemedInput, { type: "number", min: 1, max: 65535, value: port, onChange: (e) => setPort(e.target.value.replace(/[^0-9]/g, "")), placeholder: "80", required: true, "aria-label": "Port (required)" })] })] })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1", children: "Check Interval" }), (0, jsx_runtime_1.jsx)(components_1.ThemedSelect, { value: checkInterval, onChange: (e) => setCheckInterval(Number(e.target.value)), "aria-label": "Check Interval", children: constants_1.CHECK_INTERVALS.map((interval) => ((0, jsx_runtime_1.jsx)("option", { value: interval.value, children: interval.label }, interval.value))) })] }), (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { type: "submit", variant: "primary", disabled: (addMode === "new" && !name.trim()) ||
                    (addMode === "existing" && !selectedExistingSite) ||
                    (monitorType === "http" && !target.trim()) ||
                    (monitorType === "port" && (!host.trim() || !port.trim())) ||
                    isLoading, fullWidth: true, loading: showButtonLoading, children: addMode === "new" ? "Add Site" : "Add Monitor" }), (lastError || formError) && ((0, jsx_runtime_1.jsx)(components_1.ThemedBox, { surface: "base", padding: "md", className: `error-alert ${isDark ? "dark" : ""}`, rounded: "md", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsxs)(components_1.ThemedText, { size: "sm", className: `error-alert__text ${isDark ? "dark" : ""}`, children: ["\u274C ", formError || lastError] }), (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "secondary", size: "xs", onClick: () => {
                                clearError();
                                setFormError(null);
                            }, className: `error-alert__close ${isDark ? "dark" : ""}`, children: "\u2715" })] }) })), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1", children: [(0, jsx_runtime_1.jsxs)(components_1.ThemedText, { size: "xs", variant: "tertiary", children: ["\u2022 ", addMode === "new" ? "Site name is required" : "Select a site to add the monitor to"] }), monitorType === "http" && ((0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "tertiary", children: "\u2022 Enter the full URL including http:// or https://" })), monitorType === "port" && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "tertiary", children: "\u2022 Enter a valid host (domain or IP)" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "tertiary", children: "\u2022 Enter a port number (1-65535)" })] })), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "tertiary", children: "\u2022 The monitor will be checked according to your monitoring interval" })] })] }));
}
