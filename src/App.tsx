/**
 * Main App component for Uptime Watcher application.
 * Manages global state, modals, notifications, and renders the main application layout.
 */

import { useEffect, useState } from "react";

import type { StatusUpdate } from "./types";

import { AddSiteForm, SiteList, Header, Settings, SiteDetails } from "./components";
import { UI_DELAYS } from "./constants";
import { useBackendFocusSync, useSelectedSite } from "./hooks";
import { logger } from "./services";
import { ErrorBoundary, useErrorStore, useSettingsStore, useSitesStore, useUIStore, useUpdatesStore } from "./stores";
import { ThemeProvider, ThemedBox, ThemedText, ThemedButton, useTheme } from "./theme";

/**
 * Main application component that serves as the root of the Uptime Watcher app.
 *
 * Features:
 * - Global state management via focused Zustand stores
 * - Theme management with light/dark mode support
 * - Modal management (Settings, Site Details)
 * - Error and update notifications
 * - Loading states with delayed overlay
 * - Real-time status updates subscription
 * - Focus-based backend synchronization
 *
 * @returns The main App component JSX
 */
function App() {
    // Error store
    const { clearError, isLoading, lastError } = useErrorStore();

    // Sites store
    const { initializeSites, sites, subscribeToStatusUpdates, unsubscribeFromStatusUpdates } = useSitesStore();

    // Settings store
    const { initializeSettings } = useSettingsStore();

    // UI store
    const { setShowSettings, setShowSiteDetails, showSettings, showSiteDetails } = useUIStore();

    // Updates store
    const { applyUpdate, setUpdateError, setUpdateStatus, updateError, updateStatus } = useUpdatesStore();

    const { isDark } = useTheme();

    // Delayed loading state to prevent flash for quick operations
    const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

    /**
     * Only show loading overlay if loading takes more than 100ms
     * This prevents flash for quick operations while still providing feedback for longer ones
     */
    useEffect(() => {
        if (!isLoading) {
            setShowLoadingOverlay(false);
            return undefined;
        }

        const timeoutId = setTimeout(() => {
            setShowLoadingOverlay(true);
        }, UI_DELAYS.LOADING_OVERLAY);

        return () => clearTimeout(timeoutId);
    }, [isLoading]);

    /**
     * Initialize the application and set up status update subscriptions.
     * This effect handles:
     * - Development logging
     * - App initialization
     * - Status update subscription with smart incremental updates
     * - Cleanup on component unmount
     */
    useEffect(() => {
        if (process.env.NODE_ENV === "production") {
            logger.app.started();
        }

        // Initialize all stores
        const initializeApp = async () => {
            await Promise.all([initializeSites(), initializeSettings()]);
        };

        void initializeApp();

        // Subscribe to status updates with optimized incremental updates
        // The store's subscribeToStatusUpdates now handles smart incremental updates automatically
        subscribeToStatusUpdates((update: StatusUpdate) => {
            // Optional callback for additional processing if needed
            if (process.env.NODE_ENV === "development") {
                const timestamp = new Date().toLocaleTimeString();
                console.log(`[${timestamp}] [App] Status update received:`, update.site.identifier);
            }
        });

        // Cleanup
        return () => {
            unsubscribeFromStatusUpdates();
        };
    }, [initializeSites, initializeSettings, subscribeToStatusUpdates, unsubscribeFromStatusUpdates]);

    // Focus-based state synchronization (disabled by default for performance)
    useBackendFocusSync(false); // Set to true to enable focus-based backend sync

    const selectedSite = useSelectedSite();

    return (
        <ErrorBoundary>
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
                                            {updateStatus === "available" &&
                                                "A new update is available. Downloading..."}
                                            {updateStatus === "downloading" && "Update is downloading..."}
                                            {updateStatus === "downloaded" && "Update downloaded! Restart to apply."}
                                            {updateStatus === "error" && (updateError ?? "Update failed.")}
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
        </ErrorBoundary>
    );
}

export default App;
