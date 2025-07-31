/**
 * Main App component for Uptime Watcher application.
 * Manages global state, modals, notifications, and renders the main application layout.
 */

import { useCallback, useEffect, useState } from "react";

import type { StatusUpdate } from "./types";

import { isDevelopment, isProduction } from "../shared/utils/environment";
import { AddSiteForm } from "./components/AddSiteForm/AddSiteForm";
import { SiteList } from "./components/Dashboard/SiteList/SiteList";
import { Header } from "./components/Header/Header";
import { Settings } from "./components/Settings/Settings";
import { SiteDetails } from "./components/SiteDetails/SiteDetails";
import { UI_DELAYS } from "./constants";

// UI Message constants for consistency and future localization
const UI_MESSAGES = {
    ADD_SITE_LABEL: "Add New Site",
    ERROR_CLOSE_BUTTON: "✕",
    LOADING: "Loading...",
    SITE_COUNT_LABEL: "Monitored Sites",
    UPDATE_AVAILABLE: "A new update is available. Downloading...",
    UPDATE_DISMISS_BUTTON: "Dismiss",
    UPDATE_DOWNLOADED: "Update downloaded! Restart to apply.",
    UPDATE_DOWNLOADING: "Update is downloading...",
    UPDATE_ERROR_FALLBACK: "Update failed.",
    UPDATE_RESTART_BUTTON: "Restart Now",
} as const;
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
import { setupCacheSync } from "./utils/cacheSync";

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

    // Settings store - store is initialized via the initialization effect below
    // Store subscription happens automatically when store is accessed

    // UI store
    const { setShowSettings, setShowSiteDetails, showSettings, showSiteDetails } = useUIStore();

    // Updates store
    const { applyUpdate, setUpdateError, setUpdateStatus, updateError, updateStatus } = useUpdatesStore();

    const { isDark } = useTheme();

    // Delayed loading state to prevent flash for quick operations
    const [showLoadingOverlay, setShowLoadingOverlay] = useState<boolean>(false);

    // Create stable callbacks to avoid direct setState in useEffect
    const clearLoadingOverlay = useCallback(() => setShowLoadingOverlay(false), []);
    const showLoadingOverlayCallback = useCallback(() => setShowLoadingOverlay(true), []);

    /**
     * Only show loading overlay if loading takes more than 100ms
     * This prevents flash for quick operations while still providing feedback for longer ones
     */
    useEffect((): (() => void) | undefined => {
        if (!isLoading) {
            // Use timeout to defer state update to avoid direct call in useEffect
            const clearTimeoutId = setTimeout(clearLoadingOverlay, 0);
            return (): void => {
                clearTimeout(clearTimeoutId);
            };
        }

        const timeoutId = setTimeout(showLoadingOverlayCallback, UI_DELAYS.LOADING_OVERLAY);

        return (): void => {
            clearTimeout(timeoutId);
        };
    }, [isLoading, clearLoadingOverlay, showLoadingOverlayCallback]);

    /**
     * Initialize the application and set up status update subscriptions.
     * This effect handles:
     * - Development logging
     * - App initialization
     * - Status update subscription with smart incremental updates
     * - Cleanup on component unmount
     */
    useEffect(() => {
        let cacheSyncCleanup: (() => void) | undefined;

        const initializeApp = async () => {
            if (isProduction()) {
                logger.app.started();
            }

            // Get fresh references to avoid stale closures
            const sitesStore = useSitesStore.getState();
            const settingsStore = useSettingsStore.getState();

            // Initialize both stores
            await Promise.all([sitesStore.initializeSites(), settingsStore.initializeSettings()]);

            // Set up cache synchronization with backend
            // eslint-disable-next-line n/no-sync -- Function name contains 'sync' but is not a synchronous file operation
            cacheSyncCleanup = setupCacheSync();

            // Subscribe to status updates
            sitesStore.subscribeToStatusUpdates((update: StatusUpdate) => {
                // Optional callback for additional processing if needed
                if (isDevelopment()) {
                    const timestamp = new Date().toLocaleTimeString();
                    logger.debug(
                        `[${timestamp}] Status update received for site: ${update.site?.identifier ?? update.siteIdentifier}`
                    );
                }
            });
        };

        void initializeApp();

        // Cleanup
        return () => {
            const currentSitesStore = useSitesStore.getState();
            currentSitesStore.unsubscribeFromStatusUpdates();
            cacheSyncCleanup?.();
        };
    }, []); // Empty dependency array - this should only run once

    // Focus-based state synchronization (disabled by default for performance)
    // eslint-disable-next-line n/no-sync -- Function name contains 'sync' but is not a synchronous file operation
    useBackendFocusSync(false); // Set to true to enable focus-based backend sync

    const selectedSite = useSelectedSite();

    // Memoized handlers to prevent unnecessary re-renders
    const handleUpdateAction = useCallback(() => {
        if (updateStatus === "downloaded") {
            applyUpdate();
        } else {
            setUpdateStatus("idle");
            setUpdateError(undefined);
        }
    }, [updateStatus, applyUpdate, setUpdateStatus, setUpdateError]);

    const handleCloseSettings = useCallback(() => {
        setShowSettings(false);
    }, [setShowSettings]);

    const handleCloseSiteDetails = useCallback(() => {
        setShowSiteDetails(false);
    }, [setShowSiteDetails]);

    return (
        <ErrorBoundary>
            <ThemeProvider>
                <div className={`app-container ${isDark ? "dark" : ""}`}>
                    {/* Global Loading Overlay */}
                    {showLoadingOverlay && (
                        <output aria-label="Loading application" aria-live="polite" className="loading-overlay">
                            <ThemedBox padding="lg" rounded="lg" shadow="xl" surface="elevated">
                                <div className="loading-content">
                                    <div className="loading-spinner" />
                                    <ThemedText size="base" weight="medium">
                                        {UI_MESSAGES.LOADING}
                                    </ThemedText>
                                </div>
                            </ThemedBox>
                        </output>
                    )}

                    {/* Global Error Notification */}
                    {lastError && (
                        <div aria-live="assertive" className="fixed top-0 left-0 right-0 z-50" role="alert">
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
                                        {UI_MESSAGES.ERROR_CLOSE_BUTTON}
                                    </ThemedButton>
                                </div>
                            </ThemedBox>
                        </div>
                    )}

                    {/* Update Notification */}
                    {(updateStatus === "available" ||
                        updateStatus === "downloading" ||
                        updateStatus === "downloaded" ||
                        updateStatus === "error") &&
                        (updateStatus === "error" ? (
                            <div aria-live="assertive" className="fixed left-0 right-0 z-50 top-12" role="alert">
                                <ThemedBox
                                    className={`update-alert update-alert--${updateStatus}`}
                                    padding="md"
                                    surface="elevated"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="update-alert__icon">⚠️</div>
                                            <ThemedText size="sm" variant="error">
                                                {updateError ?? UI_MESSAGES.UPDATE_ERROR_FALLBACK}
                                            </ThemedText>
                                        </div>
                                        <ThemedButton
                                            className="ml-4 update-alert__action"
                                            onClick={handleUpdateAction}
                                            size="sm"
                                            variant="secondary"
                                        >
                                            {UI_MESSAGES.UPDATE_DISMISS_BUTTON}
                                        </ThemedButton>
                                    </div>
                                </ThemedBox>
                            </div>
                        ) : (
                            <output aria-live="polite" className="fixed left-0 right-0 z-50 top-12">
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
                                            </div>
                                            <ThemedText size="sm" variant="primary">
                                                {updateStatus === "available" && UI_MESSAGES.UPDATE_AVAILABLE}
                                                {updateStatus === "downloading" && UI_MESSAGES.UPDATE_DOWNLOADING}
                                                {updateStatus === "downloaded" && UI_MESSAGES.UPDATE_DOWNLOADED}
                                            </ThemedText>
                                        </div>
                                        {updateStatus === "downloaded" && (
                                            <ThemedButton
                                                className="ml-4 update-alert__action"
                                                onClick={handleUpdateAction}
                                                size="sm"
                                                variant="secondary"
                                            >
                                                {UI_MESSAGES.UPDATE_RESTART_BUTTON}
                                            </ThemedButton>
                                        )}
                                    </div>
                                </ThemedBox>
                            </output>
                        ))}

                    <Header />

                    <main className="main-container">
                        <div className="grid-layout">
                            {/* Main content */}
                            <div>
                                <ThemedBox padding="md" rounded="lg" shadow="sm" surface="elevated">
                                    <ThemedBox border className="border-b" padding="md" surface="base">
                                        <ThemedText size="lg" weight="medium">
                                            {UI_MESSAGES.SITE_COUNT_LABEL} ({sites.length})
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
                                        {UI_MESSAGES.ADD_SITE_LABEL}
                                    </ThemedText>
                                    <AddSiteForm />
                                </ThemedBox>
                            </div>
                        </div>
                    </main>

                    {/* Settings Modal */}
                    {showSettings && <Settings onClose={handleCloseSettings} />}

                    {/* Site Details Modal */}
                    {showSiteDetails && selectedSite && (
                        <SiteDetails onClose={handleCloseSiteDetails} site={selectedSite} />
                    )}
                </div>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
