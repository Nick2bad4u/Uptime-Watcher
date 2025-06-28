import { useEffect, useState } from "react";

import { AddSiteForm } from "./components/AddSiteForm/AddSiteForm";
import { SiteList } from "./components/Dashboard/SiteList";
import { Header } from "./components/Header/Header";
import { Settings } from "./components/Settings/Settings";
import { SiteDetails } from "./components/SiteDetails/SiteDetails";
import { UI_DELAYS } from "./constants";
import { useBackendFocusSync } from "./hooks/useBackendFocusSync";
import logger from "./services/logger";
import { useStore } from "./store";
import { ThemeProvider, ThemedBox, ThemedText, ThemedButton } from "./theme/components";
import { useTheme } from "./theme/useTheme";
import { StatusUpdate } from "./types";

function App() {
    const {
        applyUpdate,
        clearError,
        getSelectedSite,
        // Store actions - backend integration
        initializeApp,
        isLoading,
        lastError,
        // UI actions
        setShowSettings,
        setShowSiteDetails,
        setUpdateError,
        setUpdateStatus,
        showSettings,
        showSiteDetails,
        sites,
        subscribeToStatusUpdates,
        unsubscribeFromStatusUpdates,
        updateError,
        updateStatus,
    } = useStore();

    const { isDark } = useTheme();

    // Delayed loading state to prevent flash for quick operations
    const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

    // Only show loading overlay if loading takes more than 100ms
    useEffect(() => {
        if (isLoading) {
            const timeoutId = setTimeout(() => {
                setShowLoadingOverlay(true);
            }, UI_DELAYS.LOADING_OVERLAY);
            return () => clearTimeout(timeoutId);
        } else {
            setShowLoadingOverlay(false);
        }
    }, [isLoading]);

    useEffect(() => {
        if (process.env.NODE_ENV === "production") {
            logger.app.started();
        }
        initializeApp();

        // Subscribe to status updates with optimized incremental updates
        // The store's subscribeToStatusUpdates now handles smart incremental updates automatically
        // No need to manually sync - the store updates efficiently using the status update payload
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const handleStatusUpdate = (_update: StatusUpdate) => {
            // Optional: Add any app-level status update handling here
            // The store has already been updated with the new site data
        };

        subscribeToStatusUpdates(handleStatusUpdate);

        // Cleanup
        return () => {
            unsubscribeFromStatusUpdates();
        };
    }, [initializeApp, subscribeToStatusUpdates, unsubscribeFromStatusUpdates]);

    // --- State Sync: Focus only (no polling) ---
    useBackendFocusSync(false); // Set to true to enable focus-based backend sync

    const selectedSite = getSelectedSite();

    return (
        <ThemeProvider>
            <div className={`app-container ${isDark ? "dark" : ""}`}>
                {/* Global Loading Overlay */}
                {showLoadingOverlay && (
                    <div className="loading-overlay">
                        <ThemedBox surface="elevated" padding="lg" rounded="lg" shadow="xl">
                            <div className="loading-content">
                                <div className="loading-spinner" />
                                <ThemedText size="base" weight="medium">
                                    Loading...
                                </ThemedText>
                            </div>
                        </ThemedBox>
                    </div>
                )}

                {/* Global Error Notification */}
                {lastError && (
                    <div className="fixed top-0 left-0 right-0 z-50">
                        <ThemedBox surface="elevated" padding="md" className="error-alert">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="error-alert__icon">⚠️</div>
                                    <ThemedText size="sm" variant="error">
                                        {lastError}
                                    </ThemedText>
                                </div>
                                <ThemedButton
                                    variant="secondary"
                                    size="sm"
                                    onClick={clearError}
                                    className="ml-4 error-alert__close"
                                >
                                    ✕
                                </ThemedButton>
                            </div>
                        </ThemedBox>
                    </div>
                )}

                {/* Update Notification */}
                {(updateStatus === "available" ||
                    updateStatus === "downloading" ||
                    updateStatus === "downloaded" ||
                    updateStatus === "error") && (
                    <div className="fixed left-0 right-0 z-50 top-12">
                        <ThemedBox
                            surface="elevated"
                            padding="md"
                            className={`update-alert update-alert--${updateStatus}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="update-alert__icon">
                                        {updateStatus === "available" && "⬇️"}
                                        {updateStatus === "downloading" && "⏬"}
                                        {updateStatus === "downloaded" && "✅"}
                                        {updateStatus === "error" && "⚠️"}
                                    </div>
                                    <ThemedText size="sm" variant={updateStatus === "error" ? "error" : "primary"}>
                                        {updateStatus === "available" && "A new update is available. Downloading..."}
                                        {updateStatus === "downloading" && "Update is downloading..."}
                                        {updateStatus === "downloaded" && "Update downloaded! Restart to apply."}
                                        {updateStatus === "error" && (updateError || "Update failed.")}
                                    </ThemedText>
                                </div>
                                {(updateStatus === "downloaded" || updateStatus === "error") && (
                                    <ThemedButton
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            if (updateStatus === "downloaded") {
                                                applyUpdate();
                                            } else {
                                                setUpdateStatus("idle");
                                                setUpdateError(undefined);
                                            }
                                        }}
                                        className="ml-4 update-alert__action"
                                    >
                                        {updateStatus === "downloaded" ? "Restart Now" : "Dismiss"}
                                    </ThemedButton>
                                )}
                            </div>
                        </ThemedBox>
                    </div>
                )}

                <Header />

                <main className="main-container">
                    <div className="grid-layout">
                        {/* Main content */}
                        <div>
                            <ThemedBox surface="elevated" padding="md" shadow="sm" rounded="lg">
                                <ThemedBox surface="base" padding="md" border className="border-b">
                                    <ThemedText size="lg" weight="medium">
                                        Monitored Sites ({sites.length})
                                    </ThemedText>
                                </ThemedBox>
                                <div className="p-0">
                                    <SiteList />
                                </div>
                            </ThemedBox>
                        </div>

                        {/* Sidebar */}
                        <div>
                            <ThemedBox surface="elevated" padding="lg" shadow="sm" rounded="lg">
                                <ThemedText size="lg" weight="medium" className="mb-4">
                                    Add New Site
                                </ThemedText>
                                <AddSiteForm />
                            </ThemedBox>
                        </div>
                    </div>
                </main>

                {/* Settings Modal */}
                {showSettings && <Settings onClose={() => setShowSettings(false)} />}

                {/* Site Details Modal */}
                {showSiteDetails && selectedSite && (
                    <SiteDetails site={selectedSite} onClose={() => setShowSiteDetails(false)} />
                )}
            </div>
        </ThemeProvider>
    );
}

export default App;
