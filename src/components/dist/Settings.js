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
exports.Settings = void 0;
var react_1 = require("react");
var constants_1 = require("../constants");
var logger_1 = require("../services/logger");
var store_1 = require("../store");
var components_1 = require("../theme/components");
var useTheme_1 = require("../theme/useTheme");
function Settings(_a) {
    var _this = this;
    var onClose = _a.onClose;
    var _b = store_1.useStore(), clearError = _b.clearError, downloadSQLiteBackup = _b.downloadSQLiteBackup, // <-- keep this
    isLoading = _b.isLoading, lastError = _b.lastError, resetSettings = _b.resetSettings, setError = _b.setError, // <-- keep this
    settings = _b.settings, syncSitesFromBackend = _b.syncSitesFromBackend, updateHistoryLimitValue = _b.updateHistoryLimitValue, updateSettings = _b.updateSettings;
    var _c = useTheme_1.useTheme(), availableThemes = _c.availableThemes, isDark = _c.isDark, setTheme = _c.setTheme;
    // Delayed loading state for button spinners (100ms delay)
    var _d = react_1.useState(false), showButtonLoading = _d[0], setShowButtonLoading = _d[1];
    // Local state for sync success message
    var _e = react_1.useState(false), syncSuccess = _e[0], setSyncSuccess = _e[1];
    react_1.useEffect(function () {
        if (isLoading) {
            var timeoutId_1 = setTimeout(function () {
                setShowButtonLoading(true);
            }, constants_1.UI_DELAYS.LOADING_BUTTON);
            return function () {
                clearTimeout(timeoutId_1);
            };
        }
        else {
            setShowButtonLoading(false);
        }
    }, [isLoading]);
    // Only allow keys that are part of AppSettings
    var allowedKeys = [
        "notifications",
        "autoStart",
        "minimizeToTray",
        "theme",
        "timeout",
        "maxRetries",
        "soundAlerts",
        "historyLimit",
    ];
    var handleSettingChange = function (key, value) {
        var _a;
        if (!allowedKeys.includes(key)) {
            logger_1["default"].warn("Attempted to update invalid settings key", key);
            return;
        }
        // eslint-disable-next-line security/detect-object-injection
        var oldValue = settings[key];
        updateSettings((_a = {}, _a[key] = value, _a));
        logger_1["default"].user.settingsChange(key, oldValue, value);
    };
    var handleHistoryLimitChange = function (limit) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, updateHistoryLimitValue(limit)];
                case 1:
                    _a.sent();
                    logger_1["default"].user.settingsChange("historyLimit", settings.historyLimit, limit);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    logger_1["default"].error("Failed to update history limit from settings", error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleReset = function () {
        if (window.confirm("Are you sure you want to reset all settings to defaults?")) {
            resetSettings();
            clearError(); // Clear any errors when resetting
            logger_1["default"].user.action("Reset settings to defaults");
        }
    };
    var handleThemeChange = function (themeName) {
        var oldTheme = settings.theme;
        setTheme(themeName);
        logger_1["default"].user.settingsChange("theme", oldTheme, themeName);
    };
    // Manual Sync Now handler (moved from Header)
    var handleSyncNow = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSyncSuccess(false);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, syncSitesFromBackend()];
                case 2:
                    _a.sent();
                    setSyncSuccess(true);
                    logger_1["default"].user.action("Synced data from SQLite backend");
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    logger_1["default"].error("Failed to sync data from backend", error_2);
                    setError("Failed to sync data: " +
                        (error_2 && typeof error_2 === "object" && "message" in error_2
                            ? error_2.message
                            : String(error_2)));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [syncSitesFromBackend, setError]);
    var handleDownloadSQLite = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setShowButtonLoading(true);
                    clearError();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, downloadSQLiteBackup()];
                case 2:
                    _a.sent();
                    logger_1["default"].user.action("Downloaded SQLite backup");
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    logger_1["default"].error("Failed to download SQLite backup", error_3);
                    setError("Failed to download SQLite backup: " +
                        (error_3 && typeof error_3 === "object" && "message" in error_3
                            ? error_3.message
                            : String(error_3)));
                    return [3 /*break*/, 5];
                case 4:
                    setShowButtonLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("div", { className: "modal-overlay" },
        React.createElement(components_1.ThemedBox, { surface: "overlay", padding: "md", rounded: "lg", shadow: "xl", className: "modal-container" },
            React.createElement(components_1.ThemedBox, { surface: "elevated", padding: "lg", rounded: "none", border: true, className: "border-b" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement(components_1.ThemedText, { size: "xl", weight: "semibold" }, "\u2699\uFE0F Settings"),
                    React.createElement(components_1.ThemedButton, { variant: "secondary", size: "sm", onClick: onClose, className: "hover-opacity" }, "\u2715"))),
            lastError && (React.createElement(components_1.ThemedBox, { surface: "base", padding: "md", className: "error-alert " + (isDark ? "dark" : ""), rounded: "md" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement(components_1.ThemedText, { variant: "primary", size: "sm", className: "error-alert__text " + (isDark ? "dark" : "") },
                        "\u26A0\uFE0F ",
                        lastError),
                    React.createElement(components_1.ThemedButton, { variant: "secondary", size: "xs", onClick: clearError, className: "error-alert__close " + (isDark ? "dark" : "") }, "\u2715")))),
            syncSuccess && !lastError && (React.createElement(components_1.ThemedBox, { surface: "base", padding: "md", className: "success-alert", rounded: "md" },
                React.createElement(components_1.ThemedText, { variant: "success", size: "sm" }, "\u2705 Data synced from database."))),
            React.createElement(components_1.ThemedBox, { surface: "base", padding: "lg", className: "space-y-6" },
                React.createElement("section", null,
                    React.createElement(components_1.ThemedText, { size: "lg", weight: "medium", className: "mb-4" }, "\uD83D\uDD0D Monitoring"),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2" }, "History Limit"),
                            React.createElement(components_1.ThemedSelect, { value: settings.historyLimit, onChange: function (e) { return handleHistoryLimitChange(Number(e.target.value)); }, disabled: isLoading, "aria-label": "Maximum number of history records to keep per site" }, constants_1.HISTORY_LIMIT_OPTIONS.map(function (option) { return (React.createElement("option", { key: option.value, value: option.value }, option.label)); })),
                            React.createElement(components_1.ThemedText, { size: "xs", variant: "secondary", className: "mt-1" }, "Maximum number of check results to store per site")),
                        React.createElement("div", null,
                            React.createElement(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2" }, "Request Timeout (ms)"),
                            React.createElement(components_1.ThemedInput, { type: "number", min: constants_1.TIMEOUT_CONSTRAINTS.MIN, max: constants_1.TIMEOUT_CONSTRAINTS.MAX, step: constants_1.TIMEOUT_CONSTRAINTS.STEP, value: settings.timeout, onChange: function (e) { return handleSettingChange("timeout", Number(e.target.value)); }, disabled: isLoading, "aria-label": "Request timeout in milliseconds" }),
                            React.createElement(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "mt-1 block" }, "How long to wait for a response before considering a site down")),
                        React.createElement("div", null,
                            React.createElement(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2" }, "Max Retries"),
                            React.createElement(components_1.ThemedInput, { type: "number", min: "1", max: "10", value: settings.maxRetries, onChange: function (e) { return handleSettingChange("maxRetries", Number(e.target.value)); }, disabled: isLoading, "aria-label": "Maximum number of retry attempts" }),
                            React.createElement(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "mt-1 block" }, "Number of retry attempts before marking a site as down")))),
                React.createElement("section", null,
                    React.createElement(components_1.ThemedText, { size: "lg", weight: "medium", className: "mb-4" }, "\uD83D\uDD14 Notifications"),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "setting-item" },
                            React.createElement("div", { className: "setting-info" },
                                React.createElement(components_1.ThemedText, { size: "sm", weight: "medium", className: "setting-title" }, "Desktop Notifications"),
                                React.createElement(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "setting-description" }, "Show notifications when sites go up or down")),
                            React.createElement(components_1.ThemedCheckbox, { checked: settings.notifications, onChange: function (e) { return handleSettingChange("notifications", e.target.checked); }, disabled: isLoading, "aria-label": "Enable desktop notifications" })),
                        React.createElement("div", { className: "setting-item" },
                            React.createElement("div", { className: "setting-info" },
                                React.createElement(components_1.ThemedText, { size: "sm", weight: "medium", className: "setting-title" }, "Sound Alerts"),
                                React.createElement(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "setting-description" }, "Play sound when status changes occur")),
                            React.createElement(components_1.ThemedCheckbox, { checked: settings.soundAlerts, onChange: function (e) { return handleSettingChange("soundAlerts", e.target.checked); }, disabled: isLoading, "aria-label": "Enable sound alerts" })))),
                React.createElement("section", null,
                    React.createElement(components_1.ThemedText, { size: "lg", weight: "medium", className: "mb-4" }, "\uD83D\uDDA5\uFE0F Application"),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2" }, "Theme"),
                            React.createElement(components_1.ThemedSelect, { value: settings.theme, onChange: function (e) { return handleThemeChange(e.target.value); }, disabled: isLoading, "aria-label": "Select application theme" }, availableThemes.map(function (theme) { return (React.createElement("option", { key: theme, value: theme }, theme.charAt(0).toUpperCase() + theme.slice(1))); })),
                            React.createElement("div", { className: "mt-2 flex items-center gap-2" },
                                React.createElement(components_1.ThemedText, { size: "xs", variant: "tertiary" }, "Current theme preview:"),
                                React.createElement(components_1.StatusIndicator, { status: "up", size: "sm" }),
                                React.createElement(components_1.StatusIndicator, { status: "down", size: "sm" }),
                                React.createElement(components_1.StatusIndicator, { status: "pending", size: "sm" }))),
                        React.createElement("div", { className: "setting-item" },
                            React.createElement("div", { className: "setting-info" },
                                React.createElement(components_1.ThemedText, { size: "sm", weight: "medium", className: "setting-title" }, "Auto-start with System"),
                                React.createElement(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "setting-description" }, "Launch Uptime Watcher when your computer starts")),
                            React.createElement(components_1.ThemedCheckbox, { checked: settings.autoStart, onChange: function (e) { return handleSettingChange("autoStart", e.target.checked); }, disabled: isLoading, "aria-label": "Enable auto-start with system" })),
                        React.createElement("div", { className: "setting-item" },
                            React.createElement("div", { className: "setting-info" },
                                React.createElement(components_1.ThemedText, { size: "sm", weight: "medium", className: "setting-title" }, "Minimize to System Tray"),
                                React.createElement(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "setting-description" }, "Keep app running in system tray when window is closed")),
                            React.createElement(components_1.ThemedCheckbox, { checked: settings.minimizeToTray, onChange: function (e) { return handleSettingChange("minimizeToTray", e.target.checked); }, disabled: isLoading, "aria-label": "Enable minimize to system tray" })))),
                React.createElement("section", null,
                    React.createElement(components_1.ThemedText, { size: "lg", weight: "medium", className: "mb-4" }, "\uD83D\uDCC2 Data Management"),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement(components_1.ThemedButton, { variant: "secondary", size: "sm", onClick: handleSyncNow, loading: showButtonLoading, disabled: isLoading, className: "w-full" }, "\uD83D\uDD04 Sync Data"),
                        React.createElement("div", null,
                            React.createElement(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2" }, "Export SQLite Database"),
                            React.createElement(components_1.ThemedButton, { variant: "primary", size: "sm", onClick: handleDownloadSQLite, disabled: isLoading || showButtonLoading, loading: showButtonLoading }, "Download SQLite Backup"),
                            React.createElement(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "mt-1 block" }, "Download a direct backup of the raw SQLite database file for advanced backup or migration."))))),
            React.createElement(components_1.ThemedBox, { surface: "elevated", padding: "lg", rounded: "none", border: true, className: "border-t" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement(components_1.ThemedButton, { variant: "error", size: "sm", onClick: handleReset, disabled: isLoading, loading: showButtonLoading }, "Reset to Defaults"),
                    React.createElement("div", { className: "flex items-center space-x-3" },
                        React.createElement(components_1.ThemedButton, { variant: "secondary", size: "sm", onClick: onClose, disabled: isLoading }, "Cancel"),
                        React.createElement(components_1.ThemedButton, { variant: "primary", size: "sm", onClick: onClose, loading: showButtonLoading }, "Save Changes")))))));
}
exports.Settings = Settings;
