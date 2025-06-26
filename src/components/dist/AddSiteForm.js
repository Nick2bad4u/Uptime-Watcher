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
exports.AddSiteForm = void 0;
var react_1 = require("react");
var constants_1 = require("../constants");
var logger_1 = require("../services/logger");
var store_1 = require("../store");
var components_1 = require("../theme/components");
var useTheme_1 = require("../theme/useTheme");
function AddSiteForm() {
    var _this = this;
    var _a;
    var _b = store_1.useStore(), addMonitorToSite = _b.addMonitorToSite, clearError = _b.clearError, createSite = _b.createSite, isLoading = _b.isLoading, lastError = _b.lastError, sites = _b.sites;
    var isDark = useTheme_1.useTheme().isDark;
    // Remove identifier state, use only for monitor input
    var _c = react_1.useState(""), target = _c[0], setTarget = _c[1]; // For HTTP URL
    var _d = react_1.useState(""), host = _d[0], setHost = _d[1]; // For Port monitor host
    var _e = react_1.useState(""), port = _e[0], setPort = _e[1]; // For Port monitor port (string for input)
    var _f = react_1.useState(""), name = _f[0], setName = _f[1];
    var _g = react_1.useState("http"), monitorType = _g[0], setMonitorType = _g[1];
    var _h = react_1.useState(((_a = constants_1.CHECK_INTERVALS[6]) === null || _a === void 0 ? void 0 : _a.value) || 60000), checkInterval = _h[0], setCheckInterval = _h[1]; // Default 1 min
    // UUID state
    var generateUUID = function () {
        return typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : "site-" + Math.random().toString(36).slice(2, 10) + "-" + Date.now();
    };
    var _j = react_1.useState(generateUUID()), siteId = _j[0], setSiteId = _j[1];
    // New: Add mode toggle
    var _k = react_1.useState("new"), addMode = _k[0], setAddMode = _k[1];
    var _l = react_1.useState(""), selectedExistingSite = _l[0], setSelectedExistingSite = _l[1];
    // Delayed loading state for button spinner (100ms delay)
    var _m = react_1.useState(false), showButtonLoading = _m[0], setShowButtonLoading = _m[1];
    var _o = react_1.useState(undefined), formError = _o[0], setFormError = _o[1];
    react_1.useEffect(function () {
        if (isLoading) {
            var timeoutId_1 = setTimeout(function () {
                setShowButtonLoading(true);
            }, constants_1.UI_DELAYS.LOADING_BUTTON);
            return function () { return clearTimeout(timeoutId_1); };
        }
        else {
            setShowButtonLoading(false);
        }
    }, [isLoading]);
    // Reset fields when monitor type changes
    react_1.useEffect(function () {
        setFormError(undefined);
        setTarget("");
        setHost("");
        setPort("");
    }, [monitorType]);
    // Reset name and siteId when switching to new site
    react_1.useEffect(function () {
        if (addMode === "new") {
            setName("");
            setSiteId(generateUUID());
        }
        else {
            setName("");
        }
        setFormError(undefined);
    }, [addMode]);
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var portNum, identifier, monitor, siteData, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    e.preventDefault();
                    setFormError(undefined);
                    if (addMode === "new" && !name.trim()) {
                        setFormError("Site name is required");
                        return [2 /*return*/];
                    }
                    if (addMode === "existing" && !selectedExistingSite) {
                        setFormError("Please select a site to add the monitor to");
                        return [2 /*return*/];
                    }
                    if (monitorType === "http") {
                        if (!target.trim()) {
                            setFormError("Website URL is required for HTTP monitor");
                            return [2 /*return*/];
                        }
                        if (!/^https?:\/\//i.test(target.trim())) {
                            setFormError("HTTP monitor requires a URL starting with http:// or https://");
                            return [2 /*return*/];
                        }
                    }
                    else if (monitorType === "port") {
                        if (!host.trim()) {
                            setFormError("Host is required for port monitor");
                            return [2 /*return*/];
                        }
                        if (!port.trim()) {
                            setFormError("Port is required for port monitor");
                            return [2 /*return*/];
                        }
                        portNum = Number(port);
                        if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
                            setFormError("Port must be a number between 1 and 65535");
                            return [2 /*return*/];
                        }
                    }
                    clearError();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
                    identifier = addMode === "new" ? siteId : selectedExistingSite;
                    monitor = {
                        history: [],
                        id: generateUUID(),
                        status: "pending",
                        type: monitorType
                    };
                    if (monitorType === "http") {
                        monitor.url = target.trim();
                    }
                    else if (monitorType === "port") {
                        monitor.host = host.trim();
                        monitor.port = Number(port);
                    }
                    monitor.checkInterval = checkInterval;
                    if (!(addMode === "new")) return [3 /*break*/, 3];
                    siteData = {
                        identifier: identifier,
                        monitors: [monitor],
                        name: name.trim() || undefined
                    };
                    return [4 /*yield*/, createSite(siteData)];
                case 2:
                    _b.sent();
                    logger_1["default"].user.action("Added site", { identifier: identifier, monitorId: monitor.id, monitorType: monitorType, name: name.trim() });
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, addMonitorToSite(identifier, monitor)];
                case 4:
                    _b.sent();
                    logger_1["default"].user.action("Added monitor to site", { identifier: identifier, monitorType: monitorType });
                    _b.label = 5;
                case 5:
                    // Reset form on success
                    setTarget("");
                    setHost("");
                    setPort("");
                    setName("");
                    setMonitorType("http");
                    setCheckInterval(((_a = constants_1.CHECK_INTERVALS[6]) === null || _a === void 0 ? void 0 : _a.value) || 60000);
                    setSiteId(generateUUID());
                    setAddMode("new");
                    setSelectedExistingSite("");
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _b.sent();
                    logger_1["default"].error("Failed to add site/monitor from form", error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
        React.createElement("div", { className: "flex gap-4 items-center" },
            React.createElement("label", { className: "flex items-center gap-1" },
                React.createElement("input", { type: "radio", name: "addMode", value: "new", checked: addMode === "new", onChange: function () { return setAddMode("new"); } }),
                React.createElement(components_1.ThemedText, { size: "sm" }, "Create New Site")),
            React.createElement("label", { className: "flex items-center gap-1" },
                React.createElement("input", { type: "radio", name: "addMode", value: "existing", checked: addMode === "existing", onChange: function () { return setAddMode("existing"); } }),
                React.createElement(components_1.ThemedText, { size: "sm" }, "Add to Existing Site"))),
        addMode === "existing" && (React.createElement("div", null,
            React.createElement(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1" }, "Select Site"),
            React.createElement(components_1.ThemedSelect, { value: selectedExistingSite, onChange: function (e) { return setSelectedExistingSite(e.target.value); }, "aria-label": "Select Existing Site", required: true },
                React.createElement("option", { value: "" }, "-- Select a site --"),
                sites.map(function (site) { return (React.createElement("option", { key: site.identifier, value: site.identifier }, site.name || site.identifier)); })))),
        addMode === "new" && (React.createElement("div", null,
            React.createElement(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1" }, "Site Name *"),
            React.createElement(components_1.ThemedInput, { type: "text", value: name, onChange: function (e) { return setName(e.target.value); }, placeholder: "My Website", "aria-label": "Site name (required)", required: true }))),
        addMode === "new" && (React.createElement("div", null,
            React.createElement(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "block select-all" },
                "Site Identifier: ",
                React.createElement("span", { className: "font-mono" }, siteId)))),
        React.createElement("div", null,
            React.createElement(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1" }, "Monitor Type"),
            React.createElement(components_1.ThemedSelect, { value: monitorType, onChange: function (e) { return setMonitorType(e.target.value); }, "aria-label": "Monitor Type" },
                React.createElement("option", { value: "http" }, "HTTP (Website/API)"),
                React.createElement("option", { value: "port" }, "Port (Host/Port)"))),
        monitorType === "http" && (React.createElement("div", null,
            React.createElement(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1" }, "Website URL *"),
            React.createElement(components_1.ThemedInput, { type: "url", value: target, onChange: function (e) { return setTarget(e.target.value); }, placeholder: "https://example.com", required: true, "aria-label": "Website URL (required)" }))),
        monitorType === "port" && (React.createElement("div", { className: "flex flex-col gap-2" },
            React.createElement("div", null,
                React.createElement(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1" }, "Host *"),
                React.createElement(components_1.ThemedInput, { type: "text", value: host, onChange: function (e) { return setHost(e.target.value); }, placeholder: "example.com or 192.168.1.1", required: true, "aria-label": "Host (required)" })),
            React.createElement("div", null,
                React.createElement(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1" }, "Port *"),
                React.createElement(components_1.ThemedInput, { type: "number", min: 1, max: 65535, value: port, onChange: function (e) { return setPort(e.target.value.replace(/[^0-9]/g, "")); }, placeholder: "80", required: true, "aria-label": "Port (required)" })))),
        React.createElement("div", null,
            React.createElement(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-1" }, "Check Interval"),
            React.createElement(components_1.ThemedSelect, { value: checkInterval, onChange: function (e) { return setCheckInterval(Number(e.target.value)); }, "aria-label": "Check Interval" }, constants_1.CHECK_INTERVALS.map(function (interval) { return (React.createElement("option", { key: interval.value, value: interval.value }, interval.label)); }))),
        React.createElement(components_1.ThemedButton, { type: "submit", variant: "primary", disabled: (addMode === "new" && !name.trim()) ||
                (addMode === "existing" && !selectedExistingSite) ||
                (monitorType === "http" && !target.trim()) ||
                (monitorType === "port" && (!host.trim() || !port.trim())) ||
                isLoading, fullWidth: true, loading: showButtonLoading }, addMode === "new" ? "Add Site" : "Add Monitor"),
        (lastError || formError) && (React.createElement(components_1.ThemedBox, { surface: "base", padding: "md", className: "error-alert " + (isDark ? "dark" : ""), rounded: "md" },
            React.createElement("div", { className: "flex items-center" },
                React.createElement(components_1.ThemedText, { size: "sm", className: "error-alert__text " + (isDark ? "dark" : "") },
                    "\u274C ",
                    formError || lastError),
                React.createElement(components_1.ThemedButton, { variant: "secondary", size: "xs", onClick: function () {
                        clearError();
                        setFormError(undefined);
                    }, className: "error-alert__close " + (isDark ? "dark" : "") }, "\u2715")))),
        React.createElement("div", { className: "space-y-1" },
            React.createElement(components_1.ThemedText, { size: "xs", variant: "tertiary" },
                "\u2022 ",
                addMode === "new" ? "Site name is required" : "Select a site to add the monitor to"),
            monitorType === "http" && (React.createElement(components_1.ThemedText, { size: "xs", variant: "tertiary" }, "\u2022 Enter the full URL including http:// or https://")),
            monitorType === "port" && (React.createElement(React.Fragment, null,
                React.createElement(components_1.ThemedText, { size: "xs", variant: "tertiary" }, "\u2022 Enter a valid host (domain or IP)"),
                React.createElement(components_1.ThemedText, { size: "xs", variant: "tertiary" }, "\u2022 Enter a port number (1-65535)"))),
            React.createElement(components_1.ThemedText, { size: "xs", variant: "tertiary" }, "\u2022 The monitor will be checked according to your monitoring interval"))));
}
exports.AddSiteForm = AddSiteForm;
