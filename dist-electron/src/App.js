import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useStore } from "./store";
import { UI_DELAYS } from "./constants";
import { useTheme } from "./theme/useTheme";
import { Header } from "./components/Header";
import { SiteList } from "./components/SiteList";
import { AddSiteForm } from "./components/AddSiteForm";
import { Settings } from "./components/Settings";
import { SiteDetails } from "./components/SiteDetails";
import { ThemeProvider, ThemedBox, ThemedText, ThemedButton } from "./theme/components";
import logger from "./services/logger";
import { useBackendFocusSync } from "./hooks/useBackendFocusSync";
function App() {
    const { sites, showSettings, showSiteDetails, lastError, isLoading, updateStatus, updateError, 
    // Store actions - backend integration
    initializeApp, subscribeToStatusUpdates, unsubscribeFromStatusUpdates, clearError, 
    // UI actions
    setShowSettings, setShowSiteDetails, setUpdateStatus, setUpdateError, applyUpdate, getSelectedSite, syncSitesFromBackend, // Add this
     } = useStore();
    const { isDark } = useTheme();
    // Delayed loading state to prevent flash for quick operations
    const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
    // Only show loading overlay if loading takes more than 100ms
    useEffect(() => {
        let timeoutId;
        if (isLoading) {
            // Show loading overlay after 100ms delay
            timeoutId = setTimeout(() => {
                setShowLoadingOverlay(true);
            }, UI_DELAYS.LOADING_OVERLAY);
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
    useEffect(() => {
        if (process.env.NODE_ENV === "production") {
            logger.app.started();
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
    useBackendFocusSync(false); // Set to true to enable focus-based backend sync
    const selectedSite = getSelectedSite();
    return (_jsx(ThemeProvider, { children: _jsxs("div", { className: `app-container ${isDark ? "dark" : ""}`, children: [showLoadingOverlay && (_jsx("div", { className: "loading-overlay", children: _jsx(ThemedBox, { surface: "elevated", padding: "lg", rounded: "lg", shadow: "xl", children: _jsxs("div", { className: "loading-content", children: [_jsx("div", { className: "loading-spinner" }), _jsx(ThemedText, { size: "base", weight: "medium", children: "Loading..." })] }) }) })), lastError && (_jsx("div", { className: "fixed top-0 left-0 right-0 z-50", children: _jsx(ThemedBox, { surface: "elevated", padding: "md", className: "error-alert", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "error-alert__icon", children: "\u26A0\uFE0F" }), _jsx(ThemedText, { size: "sm", variant: "error", children: lastError })] }), _jsx(ThemedButton, { variant: "secondary", size: "sm", onClick: clearError, className: "error-alert__close ml-4", children: "\u2715" })] }) }) })), (updateStatus === "available" ||
                    updateStatus === "downloading" ||
                    updateStatus === "downloaded" ||
                    updateStatus === "error") && (_jsx("div", { className: "fixed top-12 left-0 right-0 z-50", children: _jsx(ThemedBox, { surface: "elevated", padding: "md", className: `update-alert update-alert--${updateStatus}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "update-alert__icon", children: [updateStatus === "available" && "⬇️", updateStatus === "downloading" && "⏬", updateStatus === "downloaded" && "✅", updateStatus === "error" && "⚠️"] }), _jsxs(ThemedText, { size: "sm", variant: updateStatus === "error" ? "error" : "primary", children: [updateStatus === "available" && "A new update is available. Downloading...", updateStatus === "downloading" && "Update is downloading...", updateStatus === "downloaded" && "Update downloaded! Restart to apply.", updateStatus === "error" && (updateError || "Update failed.")] })] }), (updateStatus === "downloaded" || updateStatus === "error") && (_jsx(ThemedButton, { variant: "secondary", size: "sm", onClick: () => {
                                        if (updateStatus === "downloaded") {
                                            applyUpdate();
                                        }
                                        else {
                                            setUpdateStatus("idle");
                                            setUpdateError(null);
                                        }
                                    }, className: "update-alert__action ml-4", children: updateStatus === "downloaded" ? "Restart Now" : "Dismiss" }))] }) }) })), _jsx(Header, {}), _jsx("main", { className: "main-container", children: _jsxs("div", { className: "grid-layout", children: [_jsx("div", { children: _jsxs(ThemedBox, { surface: "elevated", padding: "md", shadow: "sm", rounded: "lg", children: [_jsx(ThemedBox, { surface: "base", padding: "md", border: true, className: "border-b", children: _jsxs(ThemedText, { size: "lg", weight: "medium", children: ["Monitored Sites (", sites.length, ")"] }) }), _jsx("div", { className: "p-0", children: _jsx(SiteList, {}) })] }) }), _jsx("div", { children: _jsxs(ThemedBox, { surface: "elevated", padding: "lg", shadow: "sm", rounded: "lg", children: [_jsx(ThemedText, { size: "lg", weight: "medium", className: "mb-4", children: "Add New Site" }), _jsx(AddSiteForm, {})] }) })] }) }), showSettings && _jsx(Settings, { onClose: () => setShowSettings(false) }), showSiteDetails && selectedSite && (_jsx(SiteDetails, { site: selectedSite, onClose: () => setShowSiteDetails(false) }))] }) }));
}
export default App;
