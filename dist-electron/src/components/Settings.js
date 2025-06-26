"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = Settings;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const constants_1 = require("../constants");
const logger_1 = __importDefault(require("../services/logger"));
const store_1 = require("../store");
const components_1 = require("../theme/components");
const useTheme_1 = require("../theme/useTheme");
function Settings({ onClose }) {
    const { clearError, downloadSQLiteBackup, // <-- keep this
    isLoading, lastError, resetSettings, setError, // <-- keep this
    settings, syncSitesFromBackend, updateHistoryLimitValue, updateSettings, } = (0, store_1.useStore)();
    const { availableThemes, isDark, setTheme } = (0, useTheme_1.useTheme)();
    // Delayed loading state for button spinners (100ms delay)
    const [showButtonLoading, setShowButtonLoading] = (0, react_1.useState)(false);
    // Local state for sync success message
    const [syncSuccess, setSyncSuccess] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (isLoading) {
            const timeoutId = setTimeout(() => {
                setShowButtonLoading(true);
            }, constants_1.UI_DELAYS.LOADING_BUTTON);
            return () => {
                clearTimeout(timeoutId);
            };
        }
        else {
            setShowButtonLoading(false);
        }
    }, [isLoading]);
    // Only allow keys that are part of AppSettings
    const allowedKeys = [
        "notifications",
        "autoStart",
        "minimizeToTray",
        "theme",
        "timeout",
        "maxRetries",
        "soundAlerts",
        "historyLimit",
    ];
    const handleSettingChange = (key, value) => {
        if (!allowedKeys.includes(key)) {
            logger_1.default.warn("Attempted to update invalid settings key", key);
            return;
        }
        // eslint-disable-next-line security/detect-object-injection
        const oldValue = settings[key];
        updateSettings({ [key]: value });
        logger_1.default.user.settingsChange(key, oldValue, value);
    };
    const handleHistoryLimitChange = async (limit) => {
        try {
            await updateHistoryLimitValue(limit);
            logger_1.default.user.settingsChange("historyLimit", settings.historyLimit, limit);
        }
        catch (error) {
            logger_1.default.error("Failed to update history limit from settings", error);
            // Error is already handled by the store action
        }
    };
    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all settings to defaults?")) {
            resetSettings();
            clearError(); // Clear any errors when resetting
            logger_1.default.user.action("Reset settings to defaults");
        }
    };
    const handleThemeChange = (themeName) => {
        const oldTheme = settings.theme;
        setTheme(themeName);
        logger_1.default.user.settingsChange("theme", oldTheme, themeName);
    };
    // Manual Sync Now handler (moved from Header)
    const handleSyncNow = (0, react_1.useCallback)(async () => {
        setSyncSuccess(false);
        try {
            await syncSitesFromBackend();
            setSyncSuccess(true);
            logger_1.default.user.action("Synced data from SQLite backend");
        }
        catch (error) {
            logger_1.default.error("Failed to sync data from backend", error);
            setError("Failed to sync data: " +
                (error && typeof error === "object" && "message" in error
                    ? error.message
                    : String(error)));
        }
    }, [syncSitesFromBackend, setError]);
    const handleDownloadSQLite = async () => {
        setShowButtonLoading(true);
        clearError();
        try {
            await downloadSQLiteBackup();
            logger_1.default.user.action("Downloaded SQLite backup");
        }
        catch (error) {
            logger_1.default.error("Failed to download SQLite backup", error);
            setError("Failed to download SQLite backup: " +
                (error && typeof error === "object" && "message" in error
                    ? error.message
                    : String(error)));
        }
        finally {
            setShowButtonLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "modal-overlay", children: (0, jsx_runtime_1.jsxs)(components_1.ThemedBox, { surface: "overlay", padding: "md", rounded: "lg", shadow: "xl", className: "modal-container", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedBox, { surface: "elevated", padding: "lg", rounded: "none", border: true, className: "border-b", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xl", weight: "semibold", children: "\u2699\uFE0F Settings" }), (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "secondary", size: "sm", onClick: onClose, className: "hover-opacity", children: "\u2715" })] }) }), lastError && ((0, jsx_runtime_1.jsx)(components_1.ThemedBox, { surface: "base", padding: "md", className: `error-alert ${isDark ? "dark" : ""}`, rounded: "md", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)(components_1.ThemedText, { variant: "primary", size: "sm", className: `error-alert__text ${isDark ? "dark" : ""}`, children: ["\u26A0\uFE0F ", lastError] }), (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "secondary", size: "xs", onClick: clearError, className: `error-alert__close ${isDark ? "dark" : ""}`, children: "\u2715" })] }) })), syncSuccess && !lastError && ((0, jsx_runtime_1.jsx)(components_1.ThemedBox, { surface: "base", padding: "md", className: "success-alert", rounded: "md", children: (0, jsx_runtime_1.jsx)(components_1.ThemedText, { variant: "success", size: "sm", children: "\u2705 Data synced from database." }) })), (0, jsx_runtime_1.jsxs)(components_1.ThemedBox, { surface: "base", padding: "lg", className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "lg", weight: "medium", className: "mb-4", children: "\uD83D\uDD0D Monitoring" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2", children: "History Limit" }), (0, jsx_runtime_1.jsx)(components_1.ThemedSelect, { value: settings.historyLimit, onChange: (e) => handleHistoryLimitChange(Number(e.target.value)), disabled: isLoading, "aria-label": "Maximum number of history records to keep per site", children: constants_1.HISTORY_LIMIT_OPTIONS.map((option) => ((0, jsx_runtime_1.jsx)("option", { value: option.value, children: option.label }, option.value))) }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "secondary", className: "mt-1", children: "Maximum number of check results to store per site" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2", children: "Request Timeout (ms)" }), (0, jsx_runtime_1.jsx)(components_1.ThemedInput, { type: "number", min: constants_1.TIMEOUT_CONSTRAINTS.MIN, max: constants_1.TIMEOUT_CONSTRAINTS.MAX, step: constants_1.TIMEOUT_CONSTRAINTS.STEP, value: settings.timeout, onChange: (e) => handleSettingChange("timeout", Number(e.target.value)), disabled: isLoading, "aria-label": "Request timeout in milliseconds" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "mt-1 block", children: "How long to wait for a response before considering a site down" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2", children: "Max Retries" }), (0, jsx_runtime_1.jsx)(components_1.ThemedInput, { type: "number", min: "1", max: "10", value: settings.maxRetries, onChange: (e) => handleSettingChange("maxRetries", Number(e.target.value)), disabled: isLoading, "aria-label": "Maximum number of retry attempts" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "mt-1 block", children: "Number of retry attempts before marking a site as down" })] })] })] }), (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "lg", weight: "medium", className: "mb-4", children: "\uD83D\uDD14 Notifications" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "setting-item", children: [(0, jsx_runtime_1.jsxs)("div", { className: "setting-info", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", className: "setting-title", children: "Desktop Notifications" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "setting-description", children: "Show notifications when sites go up or down" })] }), (0, jsx_runtime_1.jsx)(components_1.ThemedCheckbox, { checked: settings.notifications, onChange: (e) => handleSettingChange("notifications", e.target.checked), disabled: isLoading, "aria-label": "Enable desktop notifications" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "setting-item", children: [(0, jsx_runtime_1.jsxs)("div", { className: "setting-info", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", className: "setting-title", children: "Sound Alerts" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "setting-description", children: "Play sound when status changes occur" })] }), (0, jsx_runtime_1.jsx)(components_1.ThemedCheckbox, { checked: settings.soundAlerts, onChange: (e) => handleSettingChange("soundAlerts", e.target.checked), disabled: isLoading, "aria-label": "Enable sound alerts" })] })] })] }), (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "lg", weight: "medium", className: "mb-4", children: "\uD83D\uDDA5\uFE0F Application" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2", children: "Theme" }), (0, jsx_runtime_1.jsx)(components_1.ThemedSelect, { value: settings.theme, onChange: (e) => handleThemeChange(e.target.value), disabled: isLoading, "aria-label": "Select application theme", children: availableThemes.map((theme) => ((0, jsx_runtime_1.jsx)("option", { value: theme, children: theme.charAt(0).toUpperCase() + theme.slice(1) }, theme))) }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-2 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "tertiary", children: "Current theme preview:" }), (0, jsx_runtime_1.jsx)(components_1.StatusIndicator, { status: "up", size: "sm" }), (0, jsx_runtime_1.jsx)(components_1.StatusIndicator, { status: "down", size: "sm" }), (0, jsx_runtime_1.jsx)(components_1.StatusIndicator, { status: "pending", size: "sm" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "setting-item", children: [(0, jsx_runtime_1.jsxs)("div", { className: "setting-info", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", className: "setting-title", children: "Auto-start with System" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "setting-description", children: "Launch Uptime Watcher when your computer starts" })] }), (0, jsx_runtime_1.jsx)(components_1.ThemedCheckbox, { checked: settings.autoStart, onChange: (e) => handleSettingChange("autoStart", e.target.checked), disabled: isLoading, "aria-label": "Enable auto-start with system" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "setting-item", children: [(0, jsx_runtime_1.jsxs)("div", { className: "setting-info", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", className: "setting-title", children: "Minimize to System Tray" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "setting-description", children: "Keep app running in system tray when window is closed" })] }), (0, jsx_runtime_1.jsx)(components_1.ThemedCheckbox, { checked: settings.minimizeToTray, onChange: (e) => handleSettingChange("minimizeToTray", e.target.checked), disabled: isLoading, "aria-label": "Enable minimize to system tray" })] })] })] }), (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "lg", weight: "medium", className: "mb-4", children: "\uD83D\uDCC2 Data Management" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "secondary", size: "sm", onClick: handleSyncNow, loading: showButtonLoading, disabled: isLoading, className: "w-full", children: "\uD83D\uDD04 Sync Data" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2", children: "Export SQLite Database" }), (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "primary", size: "sm", onClick: handleDownloadSQLite, disabled: isLoading || showButtonLoading, loading: showButtonLoading, children: "Download SQLite Backup" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "xs", variant: "tertiary", className: "mt-1 block", children: "Download a direct backup of the raw SQLite database file for advanced backup or migration." })] })] })] })] }), (0, jsx_runtime_1.jsx)(components_1.ThemedBox, { surface: "elevated", padding: "lg", rounded: "none", border: true, className: "border-t", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "error", size: "sm", onClick: handleReset, disabled: isLoading, loading: showButtonLoading, children: "Reset to Defaults" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "secondary", size: "sm", onClick: onClose, disabled: isLoading, children: "Cancel" }), (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "primary", size: "sm", onClick: onClose, loading: showButtonLoading, children: "Save Changes" })] })] }) })] }) }));
}
