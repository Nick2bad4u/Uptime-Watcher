import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useStore } from "../store";
import { ThemedBox, ThemedText, ThemedButton, StatusIndicator, ThemedInput, ThemedSelect, ThemedCheckbox, } from "../theme/components";
import { useTheme } from "../theme/useTheme";
import { HISTORY_LIMIT_OPTIONS, TIMEOUT_CONSTRAINTS, UI_DELAYS } from "../constants";
import { useState, useEffect, useCallback } from "react";
import logger from "../services/logger";
export function Settings({ onClose }) {
    const { settings, updateSettings, resetSettings, lastError, clearError, isLoading, updateHistoryLimitValue, syncSitesFromBackend, downloadSQLiteBackup, // <-- keep this
    setError, // <-- keep this
     } = useStore();
    const { setTheme, availableThemes, isDark } = useTheme();
    // Delayed loading state for button spinners (100ms delay)
    const [showButtonLoading, setShowButtonLoading] = useState(false);
    // Local state for sync success message
    const [syncSuccess, setSyncSuccess] = useState(false);
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
    const handleSettingChange = (key, value) => {
        const oldValue = settings[key];
        updateSettings({ [key]: value });
        logger.user.settingsChange(key, oldValue, value);
    };
    const handleHistoryLimitChange = async (limit) => {
        try {
            await updateHistoryLimitValue(limit);
            logger.user.settingsChange("historyLimit", settings.historyLimit, limit);
        }
        catch (error) {
            logger.error("Failed to update history limit from settings", error);
            // Error is already handled by the store action
        }
    };
    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all settings to defaults?")) {
            resetSettings();
            clearError(); // Clear any errors when resetting
            logger.user.action("Reset settings to defaults");
        }
    };
    const handleThemeChange = (themeName) => {
        const oldTheme = settings.theme;
        setTheme(themeName);
        logger.user.settingsChange("theme", oldTheme, themeName);
    };
    // Manual Sync Now handler (moved from Header)
    const handleSyncNow = useCallback(async () => {
        setSyncSuccess(false);
        try {
            await syncSitesFromBackend();
            setSyncSuccess(true);
            logger.user.action("Synced data from SQLite backend");
        }
        catch (error) {
            logger.error("Failed to sync data from backend", error);
            setError("Failed to sync data: " + (error && error.message ? error.message : String(error)));
        }
    }, [syncSitesFromBackend, setError]);
    const handleDownloadSQLite = async () => {
        setShowButtonLoading(true);
        clearError();
        try {
            await downloadSQLiteBackup();
            logger.user.action("Downloaded SQLite backup");
        }
        catch (error) {
            logger.error("Failed to download SQLite backup", error);
            setError("Failed to download SQLite backup: " + (error && error.message ? error.message : String(error)));
        }
        finally {
            setShowButtonLoading(false);
        }
    };
    return (_jsx("div", { className: "modal-overlay", children: _jsxs(ThemedBox, { surface: "overlay", padding: "md", rounded: "lg", shadow: "xl", className: "modal-container", children: [_jsx(ThemedBox, { surface: "elevated", padding: "lg", rounded: "none", border: true, className: "border-b", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(ThemedText, { size: "xl", weight: "semibold", children: "\u2699\uFE0F Settings" }), _jsx(ThemedButton, { variant: "secondary", size: "sm", onClick: onClose, className: "hover-opacity", children: "\u2715" })] }) }), lastError && (_jsx(ThemedBox, { surface: "base", padding: "md", className: `error-alert ${isDark ? "dark" : ""}`, rounded: "md", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(ThemedText, { variant: "primary", size: "sm", className: `error-alert__text ${isDark ? "dark" : ""}`, children: ["\u26A0\uFE0F ", lastError] }), _jsx(ThemedButton, { variant: "secondary", size: "xs", onClick: clearError, className: `error-alert__close ${isDark ? "dark" : ""}`, children: "\u2715" })] }) })), syncSuccess && !lastError && (_jsx(ThemedBox, { surface: "base", padding: "md", className: "success-alert", rounded: "md", children: _jsx(ThemedText, { variant: "success", size: "sm", children: "\u2705 Data synced from database." }) })), _jsxs(ThemedBox, { surface: "base", padding: "lg", className: "space-y-6", children: [_jsxs("section", { children: [_jsx(ThemedText, { size: "lg", weight: "medium", className: "mb-4", children: "\uD83D\uDD0D Monitoring" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2", children: "History Limit" }), _jsx(ThemedSelect, { value: settings.historyLimit, onChange: (e) => handleHistoryLimitChange(Number(e.target.value)), disabled: isLoading, "aria-label": "Maximum number of history records to keep per site", children: HISTORY_LIMIT_OPTIONS.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) }), _jsx(ThemedText, { size: "xs", variant: "secondary", className: "mt-1", children: "Maximum number of check results to store per site" })] }), _jsxs("div", { children: [_jsx(ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2", children: "Request Timeout (ms)" }), _jsx(ThemedInput, { type: "number", min: TIMEOUT_CONSTRAINTS.MIN, max: TIMEOUT_CONSTRAINTS.MAX, step: TIMEOUT_CONSTRAINTS.STEP, value: settings.timeout, onChange: (e) => handleSettingChange("timeout", Number(e.target.value)), disabled: isLoading, "aria-label": "Request timeout in milliseconds" }), _jsx(ThemedText, { size: "xs", variant: "tertiary", className: "mt-1 block", children: "How long to wait for a response before considering a site down" })] }), _jsxs("div", { children: [_jsx(ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2", children: "Max Retries" }), _jsx(ThemedInput, { type: "number", min: "1", max: "10", value: settings.maxRetries, onChange: (e) => handleSettingChange("maxRetries", Number(e.target.value)), disabled: isLoading, "aria-label": "Maximum number of retry attempts" }), _jsx(ThemedText, { size: "xs", variant: "tertiary", className: "mt-1 block", children: "Number of retry attempts before marking a site as down" })] })] })] }), _jsxs("section", { children: [_jsx(ThemedText, { size: "lg", weight: "medium", className: "mb-4", children: "\uD83D\uDD14 Notifications" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "setting-item", children: [_jsxs("div", { className: "setting-info", children: [_jsx(ThemedText, { size: "sm", weight: "medium", className: "setting-title", children: "Desktop Notifications" }), _jsx(ThemedText, { size: "xs", variant: "tertiary", className: "setting-description", children: "Show notifications when sites go up or down" })] }), _jsx(ThemedCheckbox, { checked: settings.notifications, onChange: (e) => handleSettingChange("notifications", e.target.checked), disabled: isLoading, "aria-label": "Enable desktop notifications" })] }), _jsxs("div", { className: "setting-item", children: [_jsxs("div", { className: "setting-info", children: [_jsx(ThemedText, { size: "sm", weight: "medium", className: "setting-title", children: "Sound Alerts" }), _jsx(ThemedText, { size: "xs", variant: "tertiary", className: "setting-description", children: "Play sound when status changes occur" })] }), _jsx(ThemedCheckbox, { checked: settings.soundAlerts, onChange: (e) => handleSettingChange("soundAlerts", e.target.checked), disabled: isLoading, "aria-label": "Enable sound alerts" })] })] })] }), _jsxs("section", { children: [_jsx(ThemedText, { size: "lg", weight: "medium", className: "mb-4", children: "\uD83D\uDDA5\uFE0F Application" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2", children: "Theme" }), _jsx(ThemedSelect, { value: settings.theme, onChange: (e) => handleThemeChange(e.target.value), disabled: isLoading, "aria-label": "Select application theme", children: availableThemes.map((theme) => (_jsx("option", { value: theme, children: theme.charAt(0).toUpperCase() + theme.slice(1) }, theme))) }), _jsxs("div", { className: "mt-2 flex items-center gap-2", children: [_jsx(ThemedText, { size: "xs", variant: "tertiary", children: "Current theme preview:" }), _jsx(StatusIndicator, { status: "up", size: "sm" }), _jsx(StatusIndicator, { status: "down", size: "sm" }), _jsx(StatusIndicator, { status: "pending", size: "sm" })] })] }), _jsxs("div", { className: "setting-item", children: [_jsxs("div", { className: "setting-info", children: [_jsx(ThemedText, { size: "sm", weight: "medium", className: "setting-title", children: "Auto-start with System" }), _jsx(ThemedText, { size: "xs", variant: "tertiary", className: "setting-description", children: "Launch Uptime Watcher when your computer starts" })] }), _jsx(ThemedCheckbox, { checked: settings.autoStart, onChange: (e) => handleSettingChange("autoStart", e.target.checked), disabled: isLoading, "aria-label": "Enable auto-start with system" })] }), _jsxs("div", { className: "setting-item", children: [_jsxs("div", { className: "setting-info", children: [_jsx(ThemedText, { size: "sm", weight: "medium", className: "setting-title", children: "Minimize to System Tray" }), _jsx(ThemedText, { size: "xs", variant: "tertiary", className: "setting-description", children: "Keep app running in system tray when window is closed" })] }), _jsx(ThemedCheckbox, { checked: settings.minimizeToTray, onChange: (e) => handleSettingChange("minimizeToTray", e.target.checked), disabled: isLoading, "aria-label": "Enable minimize to system tray" })] })] })] }), _jsxs("section", { children: [_jsx(ThemedText, { size: "lg", weight: "medium", className: "mb-4", children: "\uD83D\uDCC2 Data Management" }), _jsxs("div", { className: "space-y-4", children: [_jsx(ThemedButton, { variant: "secondary", size: "sm", onClick: handleSyncNow, loading: showButtonLoading, disabled: isLoading, className: "w-full", children: "\uD83D\uDD04 Sync Data" }), _jsxs("div", { children: [_jsx(ThemedText, { size: "sm", weight: "medium", variant: "secondary", className: "block mb-2", children: "Export SQLite Database" }), _jsx(ThemedButton, { variant: "primary", size: "sm", onClick: handleDownloadSQLite, disabled: isLoading || showButtonLoading, loading: showButtonLoading, children: "Download SQLite Backup" }), _jsx(ThemedText, { size: "xs", variant: "tertiary", className: "mt-1 block", children: "Download a direct backup of the raw SQLite database file for advanced backup or migration." })] })] })] })] }), _jsx(ThemedBox, { surface: "elevated", padding: "lg", rounded: "none", border: true, className: "border-t", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(ThemedButton, { variant: "error", size: "sm", onClick: handleReset, disabled: isLoading, loading: showButtonLoading, children: "Reset to Defaults" }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(ThemedButton, { variant: "secondary", size: "sm", onClick: onClose, disabled: isLoading, children: "Cancel" }), _jsx(ThemedButton, { variant: "primary", size: "sm", onClick: onClose, loading: showButtonLoading, children: "Save Changes" })] })] }) })] }) }));
}
