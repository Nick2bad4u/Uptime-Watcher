"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const store_1 = require("./store");
const constants_1 = require("./constants");
const useTheme_1 = require("./theme/useTheme");
const Header_1 = require("./components/Header");
const SiteList_1 = require("./components/SiteList");
const AddSiteForm_1 = require("./components/AddSiteForm");
const Settings_1 = require("./components/Settings");
const SiteDetails_1 = require("./components/SiteDetails");
const components_1 = require("./theme/components");
const logger_1 = __importDefault(require("./services/logger"));
const useBackendFocusSync_1 = require("./hooks/useBackendFocusSync");
function App() {
    const { sites, showSettings, showSiteDetails, lastError, isLoading, updateStatus, updateError, 
    // Store actions - backend integration
    initializeApp, subscribeToStatusUpdates, unsubscribeFromStatusUpdates, clearError, 
    // UI actions
    setShowSettings, setShowSiteDetails, setUpdateStatus, setUpdateError, applyUpdate, getSelectedSite, syncSitesFromBackend, // Add this
     } = (0, store_1.useStore)();
    const { isDark } = (0, useTheme_1.useTheme)();
    // Delayed loading state to prevent flash for quick operations
    const [showLoadingOverlay, setShowLoadingOverlay] = (0, react_1.useState)(false);
    // Only show loading overlay if loading takes more than 100ms
    (0, react_1.useEffect)(() => {
        let timeoutId;
        if (isLoading) {
            // Show loading overlay after 100ms delay
            timeoutId = setTimeout(() => {
                setShowLoadingOverlay(true);
            }, constants_1.UI_DELAYS.LOADING_OVERLAY);
        }
        else {
            // Hide loading overlay immediately when loading stops
            setShowLoadingOverlay(false);
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isLoading]);
    (0, react_1.useEffect)(() => {
        if (process.env.NODE_ENV === "production") {
            logger_1.default.app.started();
        }
        initializeApp();
        // Listen for status updates
        const handleStatusUpdate = () => {
            // No need to call updateSiteStatus; just sync from backend
            syncSitesFromBackend();
        };
        subscribeToStatusUpdates(handleStatusUpdate);
        // Cleanup
        return () => {
            unsubscribeFromStatusUpdates();
        };
    }, [initializeApp, syncSitesFromBackend, subscribeToStatusUpdates, unsubscribeFromStatusUpdates]);
    // --- State Sync: Focus only (no polling) ---
    (0, useBackendFocusSync_1.useBackendFocusSync)(false); // Set to true to enable focus-based backend sync
    const selectedSite = getSelectedSite();
    return ((0, jsx_runtime_1.jsx)(components_1.ThemeProvider, { children: (0, jsx_runtime_1.jsxs)("div", { className: `app-container ${isDark ? "dark" : ""}`, children: [showLoadingOverlay && ((0, jsx_runtime_1.jsx)("div", { className: "loading-overlay", children: (0, jsx_runtime_1.jsx)(components_1.ThemedBox, { surface: "elevated", padding: "lg", rounded: "lg", shadow: "xl", children: (0, jsx_runtime_1.jsxs)("div", { className: "loading-content", children: [(0, jsx_runtime_1.jsx)("div", { className: "loading-spinner" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "base", weight: "medium", children: "Loading..." })] }) }) })), lastError && ((0, jsx_runtime_1.jsx)("div", { className: "fixed top-0 left-0 right-0 z-50", children: (0, jsx_runtime_1.jsx)(components_1.ThemedBox, { surface: "elevated", padding: "md", className: "error-alert", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "error-alert__icon", children: "\u26A0\uFE0F" }), (0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "sm", variant: "error", children: lastError })] }), (0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "secondary", size: "sm", onClick: clearError, className: "error-alert__close ml-4", children: "\u2715" })] }) }) })), (updateStatus === "available" ||
                    updateStatus === "downloading" ||
                    updateStatus === "downloaded" ||
                    updateStatus === "error") && ((0, jsx_runtime_1.jsx)("div", { className: "fixed top-12 left-0 right-0 z-50", children: (0, jsx_runtime_1.jsx)(components_1.ThemedBox, { surface: "elevated", padding: "md", className: `update-alert update-alert--${updateStatus}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "update-alert__icon", children: [updateStatus === "available" && "⬇️", updateStatus === "downloading" && "⏬", updateStatus === "downloaded" && "✅", updateStatus === "error" && "⚠️"] }), (0, jsx_runtime_1.jsxs)(components_1.ThemedText, { size: "sm", variant: updateStatus === "error" ? "error" : "primary", children: [updateStatus === "available" && "A new update is available. Downloading...", updateStatus === "downloading" && "Update is downloading...", updateStatus === "downloaded" && "Update downloaded! Restart to apply.", updateStatus === "error" && (updateError || "Update failed.")] })] }), (updateStatus === "downloaded" || updateStatus === "error") && ((0, jsx_runtime_1.jsx)(components_1.ThemedButton, { variant: "secondary", size: "sm", onClick: () => {
                                        if (updateStatus === "downloaded") {
                                            applyUpdate();
                                        }
                                        else {
                                            setUpdateStatus("idle");
                                            setUpdateError(null);
                                        }
                                    }, className: "update-alert__action ml-4", children: updateStatus === "downloaded" ? "Restart Now" : "Dismiss" }))] }) }) })), (0, jsx_runtime_1.jsx)(Header_1.Header, {}), (0, jsx_runtime_1.jsx)("main", { className: "main-container", children: (0, jsx_runtime_1.jsxs)("div", { className: "grid-layout", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(components_1.ThemedBox, { surface: "elevated", padding: "md", shadow: "sm", rounded: "lg", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedBox, { surface: "base", padding: "md", border: true, className: "border-b", children: (0, jsx_runtime_1.jsxs)(components_1.ThemedText, { size: "lg", weight: "medium", children: ["Monitored Sites (", sites.length, ")"] }) }), (0, jsx_runtime_1.jsx)("div", { className: "p-0", children: (0, jsx_runtime_1.jsx)(SiteList_1.SiteList, {}) })] }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)(components_1.ThemedBox, { surface: "elevated", padding: "lg", shadow: "sm", rounded: "lg", children: [(0, jsx_runtime_1.jsx)(components_1.ThemedText, { size: "lg", weight: "medium", className: "mb-4", children: "Add New Site" }), (0, jsx_runtime_1.jsx)(AddSiteForm_1.AddSiteForm, {})] }) })] }) }), showSettings && (0, jsx_runtime_1.jsx)(Settings_1.Settings, { onClose: () => setShowSettings(false) }), showSiteDetails && selectedSite && ((0, jsx_runtime_1.jsx)(SiteDetails_1.SiteDetails, { site: selectedSite, onClose: () => setShowSiteDetails(false) }))] }) }));
}
exports.default = App;
