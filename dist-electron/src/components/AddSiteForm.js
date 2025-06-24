import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useStore } from "../store";
import { UI_DELAYS, CHECK_INTERVALS } from "../constants";
import { useTheme } from "../theme/useTheme";
import { ThemedBox, ThemedText, ThemedButton, ThemedInput, ThemedSelect } from "../theme/components";
import logger from "../services/logger";
export function AddSiteForm() {
    const { createSite, addMonitorToSite, sites, isLoading, lastError, clearError } = useStore();
    const { isDark } = useTheme();
    // Remove identifier state, use only for monitor input
    const [target, setTarget] = useState(""); // For HTTP URL
    const [host, setHost] = useState(""); // For Port monitor host
    const [port, setPort] = useState(""); // For Port monitor port (string for input)
    const [name, setName] = useState("");
    const [monitorType, setMonitorType] = useState("http");
    const [checkInterval, setCheckInterval] = useState(CHECK_INTERVALS[6]?.value || 60000); // Default 1 min
    // UUID state
    const generateUUID = () => typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `site-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
    const [siteId, setSiteId] = useState(generateUUID());
    // New: Add mode toggle
    const [addMode, setAddMode] = useState("new");
    const [selectedExistingSite, setSelectedExistingSite] = useState("");
    // Delayed loading state for button spinner (100ms delay)
    const [showButtonLoading, setShowButtonLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    useEffect(() => {
        let timeoutId;
        if (isLoading) {
            // Show button loading after 100ms delay
            timeoutId = setTimeout(() => {
                setShowButtonLoading(true);
            }, UI_DELAYS.LOADING_BUTTON);
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
    useEffect(() => {
        setFormError(null);
        setTarget("");
        setHost("");
        setPort("");
    }, [monitorType]);
    // Reset name and siteId when switching to new site
    useEffect(() => {
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
                logger.user.action("Added site", { identifier, name: name.trim(), monitorType, monitorId: monitor.id });
            }
            else {
                await addMonitorToSite(identifier, monitor);
                logger.user.action("Added monitor to site", { identifier, monitorType });
            }
            // Reset form on success
            setTarget("");
            setHost("");
            setPort("");
            setName("");
            setMonitorType("http");
            setCheckInterval(CHECK_INTERVALS[6]?.value || 60000);
            setSiteId(generateUUID());
            setAddMode("new");
            setSelectedExistingSite("");
        }
        catch (error) {
            logger.error("Failed to add site/monitor from form", error);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "flex gap-4 items-center", children: [_jsxs("label", { className: "flex items-center gap-1", children: [_jsx("input", { type: "radio", name: "addMode", value: "new", checked: addMode === "new", onChange: () => setAddMode("new") }), _jsx(ThemedText, { size: "sm", children: "Create New Site" })] }), _jsxs("label", { className: "flex items-center gap-1", children: [_jsx("input", { type: "radio", name: "addMode", value: "existing", checked: addMode === "existing", onChange: () => setAddMode("existing") }), _jsx(ThemedText, { size: "sm", children: "Add to Existing Site" })] })] }), addMode === "existing" && (_jsxs("div", { children: [_jsx(ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1", children: "Select Site" }), _jsxs(ThemedSelect, { value: selectedExistingSite, onChange: (e) => setSelectedExistingSite(e.target.value), "aria-label": "Select Existing Site", required: true, children: [_jsx("option", { value: "", children: "-- Select a site --" }), sites.map((site) => (_jsx("option", { value: site.identifier, children: site.name || site.identifier }, site.identifier)))] })] })), addMode === "new" && (_jsxs("div", { children: [_jsx(ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1", children: "Site Name *" }), _jsx(ThemedInput, { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "My Website", "aria-label": "Site name (required)", required: true })] })), addMode === "new" && (_jsx("div", { children: _jsxs(ThemedText, { size: "xs", variant: "tertiary", className: "block select-all", children: ["Site Identifier: ", _jsx("span", { className: "font-mono", children: siteId })] }) })), _jsxs("div", { children: [_jsx(ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1", children: "Monitor Type" }), _jsxs(ThemedSelect, { value: monitorType, onChange: (e) => setMonitorType(e.target.value), "aria-label": "Monitor Type", children: [_jsx("option", { value: "http", children: "HTTP (Website/API)" }), _jsx("option", { value: "port", children: "Port (Host/Port)" })] })] }), monitorType === "http" && (_jsxs("div", { children: [_jsx(ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1", children: "Website URL *" }), _jsx(ThemedInput, { type: "url", value: target, onChange: (e) => setTarget(e.target.value), placeholder: "https://example.com", required: true, "aria-label": "Website URL (required)" })] })), monitorType === "port" && (_jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("div", { children: [_jsx(ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1", children: "Host *" }), _jsx(ThemedInput, { type: "text", value: host, onChange: (e) => setHost(e.target.value), placeholder: "example.com or 192.168.1.1", required: true, "aria-label": "Host (required)" })] }), _jsxs("div", { children: [_jsx(ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1", children: "Port *" }), _jsx(ThemedInput, { type: "number", min: 1, max: 65535, value: port, onChange: (e) => setPort(e.target.value.replace(/[^0-9]/g, "")), placeholder: "80", required: true, "aria-label": "Port (required)" })] })] })), _jsxs("div", { children: [_jsx(ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1", children: "Check Interval" }), _jsx(ThemedSelect, { value: checkInterval, onChange: (e) => setCheckInterval(Number(e.target.value)), "aria-label": "Check Interval", children: CHECK_INTERVALS.map((interval) => (_jsx("option", { value: interval.value, children: interval.label }, interval.value))) })] }), _jsx(ThemedButton, { type: "submit", variant: "primary", disabled: (addMode === "new" && !name.trim()) ||
                    (addMode === "existing" && !selectedExistingSite) ||
                    (monitorType === "http" && !target.trim()) ||
                    (monitorType === "port" && (!host.trim() || !port.trim())) ||
                    isLoading, fullWidth: true, loading: showButtonLoading, children: addMode === "new" ? "Add Site" : "Add Monitor" }), (lastError || formError) && (_jsx(ThemedBox, { surface: "base", padding: "md", className: `error-alert ${isDark ? "dark" : ""}`, rounded: "md", children: _jsxs("div", { className: "flex items-center", children: [_jsxs(ThemedText, { size: "sm", className: `error-alert__text ${isDark ? "dark" : ""}`, children: ["\u274C ", formError || lastError] }), _jsx(ThemedButton, { variant: "secondary", size: "xs", onClick: () => {
                                clearError();
                                setFormError(null);
                            }, className: `error-alert__close ${isDark ? "dark" : ""}`, children: "\u2715" })] }) })), _jsxs("div", { className: "space-y-1", children: [_jsxs(ThemedText, { size: "xs", variant: "tertiary", children: ["\u2022 ", addMode === "new" ? "Site name is required" : "Select a site to add the monitor to"] }), monitorType === "http" && (_jsx(ThemedText, { size: "xs", variant: "tertiary", children: "\u2022 Enter the full URL including http:// or https://" })), monitorType === "port" && (_jsxs(_Fragment, { children: [_jsx(ThemedText, { size: "xs", variant: "tertiary", children: "\u2022 Enter a valid host (domain or IP)" }), _jsx(ThemedText, { size: "xs", variant: "tertiary", children: "\u2022 Enter a port number (1-65535)" })] })), _jsx(ThemedText, { size: "xs", variant: "tertiary", children: "\u2022 The monitor will be checked according to your monitoring interval" })] })] }));
}
