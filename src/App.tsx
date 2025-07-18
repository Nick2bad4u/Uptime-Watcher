/**
 * Main App component for Uptime Watcher application.
 * Manages global state, modals, notifications, and renders the main application layout.
 */

import { useEffect, useState } from "react";

import type { StatusUpdate } from "./types";

import { AddSiteForm } from "./components/AddSiteForm/AddSiteForm";
import { SiteList } from "./components/Dashboard/SiteList";
import { Header } from "./components/Header/Header";
import { Settings } from "./components/Settings/Settings";
import { SiteDetails } from "./components/SiteDetails/SiteDetails";
import { UI_DELAYS } from "./constants";
import { useBackendFocusSync } from "./hooks/useBackendFocusSync";
import { useSelectedSite } from "./hooks/useSelectedSite";
import logger from "./services/logger";
import { ErrorBoundary } from "./stores/error/ErrorBoundary";
import { useErrorStore } from "./stores/error/useErrorStore";
import { useSettingsStore } from "./stores/settings/useSettingsStore";
import { useSitesStore } from "./stores/sites/useSitesStore";
import { useUIStore } from "./stores/ui/useUiStore";
import { useUpdatesStore } from "./stores/updates/useUpdatesStore";
import { ThemedBox, ThemedButton, ThemedText, ThemeProvider } from "./theme/components";
import { useTheme } from "./theme/useTheme";

/**
 * Main application component that serves as the root of the Uptime Watcher app.
 *
 * @remarks
 * This is the primary entry point component that orchestrates the entire application
 * including state management, theming, error handling, and real-time updates.
 *
 * @public
 *
 * @beta
 * The component API may change as we refine the architecture.
 *
 * @see {@link useTheme} for theme management
 * @see {@link useSitesStore} for site state management
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <ErrorBoundary>
 *       <ThemeProvider>
 *         <div className="app-container">
 *           <Header />
 *         </div>
 *       </ThemeProvider>
 *     </ErrorBoundary>
 *   );
 * }
 * ```
 *
 * @returns The main App component JSX
 */
function App() {
    // Error store
    const { clearError, isLoading, lastError } = useErrorStore();

    // Sites store
    const { sites } = useSitesStore();

    // Settings store
    useSettingsStore();

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
    useEffect((): (() => void) | undefined => {
        if (!isLoading) {
            setShowLoadingOverlay(false);
            return undefined;
        }

        const timeoutId = setTimeout(() => {
            setShowLoadingOverlay(true);
        }, UI_DELAYS.LOADING_OVERLAY);

        return (): void => {
            clearTimeout(timeoutId);
        };
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
        const initializeApp = async () => {
            if (process.env.NODE_ENV === "production") {
                logger.app.started();
            }

            // Get fresh references to avoid stale closures
            const sitesStore = useSitesStore.getState();
            const settingsStore = useSettingsStore.getState();

            // Initialize both stores
            await Promise.all([sitesStore.initializeSites(), settingsStore.initializeSettings()]);

            // Subscribe to status updates
            sitesStore.subscribeToStatusUpdates((update: StatusUpdate) => {
                // Optional callback for additional processing if needed
                if (process.env.NODE_ENV === "development") {
                    const timestamp = new Date().toLocaleTimeString();
                    logger.debug(`[${timestamp}] Status update received for site: ${update.site.identifier}`);
                }
            });
        };

        void initializeApp();

        // Cleanup
        return () => {
            const currentSitesStore = useSitesStore.getState();
            currentSitesStore.unsubscribeFromStatusUpdates();
        };
    }, []); // Empty dependency array - this should only run once

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
                            <ThemedBox padding="lg" rounded="lg" shadow="xl" surface="elevated">
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
                            <ThemedBox className="error-alert" padding="md" surface="elevated">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="error-alert__icon">⚠️</div>
                                        <ThemedText size="sm" variant="error">
                                            {lastError}
                                        </ThemedText>
                                    </div>
                                    <ThemedButton
                                        className="ml-4 error-alert__close"
                                        onClick={clearError}
                                        size="sm"
                                        variant="secondary"
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
                                className={`update-alert update-alert--${updateStatus}`}
                                padding="md"
                                surface="elevated"
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
                                            className="ml-4 update-alert__action"
                                            onClick={() => {
                                                if (updateStatus === "downloaded") {
                                                    applyUpdate();
                                                } else {
                                                    setUpdateStatus("idle");
                                                    setUpdateError(undefined);
                                                }
                                            }}
                                            size="sm"
                                            variant="secondary"
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
                                <ThemedBox padding="md" rounded="lg" shadow="sm" surface="elevated">
                                    <ThemedBox border className="border-b" padding="md" surface="base">
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
                                <ThemedBox padding="lg" rounded="lg" shadow="sm" surface="elevated">
                                    <ThemedText className="mb-4" size="lg" weight="medium">
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
                        <SiteDetails onClose={() => setShowSiteDetails(false)} site={selectedSite} />
                    )}
                </div>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
