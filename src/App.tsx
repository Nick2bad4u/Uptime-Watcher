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
import { StatusUpdate } from "./types";
import logger from "./services/logger";
import { useBackendFocusSync } from "./hooks/useBackendFocusSync";

function App() {
    const {
        sites,
        showSettings,
        showSiteDetails,
        lastError,
        isLoading,
        updateStatus,
        updateError,
        // Store actions - backend integration
        initializeApp,
        updateSiteStatus,
        subscribeToStatusUpdates,
        unsubscribeFromStatusUpdates,
        clearError,
        // UI actions
        setShowSettings,
        setShowSiteDetails,
        setUpdateStatus,
        setUpdateError,
        applyUpdate,
        getSelectedSite,
    } = useStore();

    const { isDark } = useTheme();

    // Delayed loading state to prevent flash for quick operations
    const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

    // Only show loading overlay if loading takes more than 100ms
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isLoading) {
            // Show loading overlay after 100ms delay
            timeoutId = setTimeout(() => {
                setShowLoadingOverlay(true);
            }, UI_DELAYS.LOADING_OVERLAY);
        } else {
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
        const handleStatusUpdate = (update: StatusUpdate) => {
            updateSiteStatus(update);
        };

        subscribeToStatusUpdates(handleStatusUpdate);

        // Cleanup
        return () => {
            unsubscribeFromStatusUpdates();
        };
    }, [initializeApp, updateSiteStatus, subscribeToStatusUpdates, unsubscribeFromStatusUpdates]);

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
                                <div className="loading-spinner"></div>
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
                                    className="error-alert__close ml-4"
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
                    <div className="fixed top-12 left-0 right-0 z-50">
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
                                                setUpdateError(null);
                                            }
                                        }}
                                        className="update-alert__action ml-4"
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
