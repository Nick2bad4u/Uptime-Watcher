/**
 * Main App component for Uptime Watcher application.
 * Manages global state, modals, notifications, and renders the main application layout.
 */

import type { JSX } from "react/jsx-runtime";

import { useCallback, useEffect, useRef, useState } from "react";

import { isDevelopment, isProduction } from "../shared/utils/environment";
import { AddSiteModal } from "./components/AddSiteForm/AddSiteModal";
import { ErrorAlert } from "./components/common/ErrorAlert/ErrorAlert";
import { SiteList } from "./components/Dashboard/SiteList/SiteList";
import { Header } from "./components/Header/Header";
import { Settings } from "./components/Settings/Settings";
import { SiteDetails } from "./components/SiteDetails/SiteDetails";
import { UI_DELAYS } from "./constants";
import { useBackendFocusSync } from "./hooks/useBackendFocusSync";
import { useMount } from "./hooks/useMount";
import { useSelectedSite } from "./hooks/useSelectedSite";
import logger from "./services/logger";
import ErrorBoundary from "./stores/error/ErrorBoundary";
import { useErrorStore } from "./stores/error/useErrorStore";
import { useSettingsStore } from "./stores/settings/useSettingsStore";
import { useSitesStore } from "./stores/sites/useSitesStore";
import { useUIStore } from "./stores/ui/useUiStore";
import { useUpdatesStore } from "./stores/updates/useUpdatesStore";
import ThemedBox from "./theme/components/ThemedBox";
import ThemedButton from "./theme/components/ThemedButton";
import ThemedText from "./theme/components/ThemedText";
import ThemeProvider from "./theme/components/ThemeProvider";
import { useTheme } from "./theme/useTheme";
import { setupCacheSync } from "./utils/cacheSync";

// UI Message constants for consistency and future localization
const UI_MESSAGES = {
    ERROR_CLOSE_BUTTON: "Close",
    LOADING: "Loading...",
    SITE_COUNT_LABEL: "Monitored Sites",
    UPDATE_AVAILABLE: "A new update is available. Downloading...",
    UPDATE_DISMISS_BUTTON: "Dismiss",
    UPDATE_DOWNLOADED: "Update downloaded! Restart to apply.",
    UPDATE_DOWNLOADING: "Update is downloading...",
    UPDATE_ERROR_FALLBACK: "Update failed.",
    UPDATE_RESTART_BUTTON: "Restart Now",
} as const;

/**
 * Main application component that serves as the root of the Uptime Watcher app.
 *
 * @remarks
 * This is the primary entry point component that orchestrates the entire application
 * including state management, theming, error handling, and real-time updates.
 * Uses deferred state updates via timeouts to comply with React best practices.
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
const App = (): JSX.Element => {
    // Error store
    const { clearError, isLoading, lastError } = useErrorStore();

    // Sites store
    const { sites } = useSitesStore();

    // Settings store - store is initialized via the initialization effect below
    // Store subscription happens automatically when store is accessed

    // UI store
    const {
        setShowSettings,
        setShowSiteDetails,
        showSettings,
        showSiteDetails,
    } = useUIStore();

    // Updates store
    const {
        applyUpdate,
        setUpdateError,
        setUpdateStatus,
        updateError,
        updateStatus,
    } = useUpdatesStore();

    const { isDark } = useTheme();

    // Delayed loading state to prevent flash for quick operations
    const [showLoadingOverlay, setShowLoadingOverlay] =
        useState<boolean>(false);

    // Ref to store cache sync cleanup function
    const cacheSyncCleanupRef = useRef<(() => void) | null>(null);

    // Create stable callbacks to avoid direct setState in useEffect
    const clearLoadingOverlay = useCallback(() => {
        setShowLoadingOverlay(false);
    }, []);
    const showLoadingOverlayCallback = useCallback(() => {
        setShowLoadingOverlay(true);
    }, []);

    /**
     * Only show loading overlay if loading takes more than 100ms
     * This prevents flash for quick operations while still providing feedback for longer ones
     */
    useEffect((): (() => void) | undefined => {
        if (!isLoading) {
            // Use timeout to defer state update to avoid direct call in useEffect
            const clearTimeoutId = setTimeout(
                clearLoadingOverlay,
                UI_DELAYS.STATE_UPDATE_DEFER
            );
            return (): void => {
                clearTimeout(clearTimeoutId);
            };
        }

        const timeoutId = setTimeout(
            showLoadingOverlayCallback,
            UI_DELAYS.LOADING_OVERLAY
        );

        return (): void => {
            clearTimeout(timeoutId);
        };
    }, [clearLoadingOverlay, isLoading, showLoadingOverlayCallback]);

    /**
     * Initialize the application and set up status update subscriptions.
     * This effect handles:
     * - Development logging
     * - App initialization
     * - Status update subscription with smart incremental updates
     * - Cleanup on component unmount
     */
    useMount(
        async () => {
            if (isProduction()) {
                logger.app.started();
            }

            // Get fresh references to avoid stale closures
            const sitesStore = useSitesStore.getState();
            const settingsStore = useSettingsStore.getState();

            // Initialize both stores
            await Promise.all([
                sitesStore.initializeSites(),
                settingsStore.initializeSettings(),
            ]);

            // Set up cache synchronization with backend and store cleanup function
            // eslint-disable-next-line n/no-sync -- Function name contains 'sync' but is not a synchronous file operation
            const cacheSyncCleanup = setupCacheSync();
            cacheSyncCleanupRef.current = cacheSyncCleanup;

            // Subscribe to status updates
            sitesStore.subscribeToStatusUpdates((update) => {
                // Optional callback for additional processing if needed
                if (isDevelopment()) {
                    const timestamp = new Date().toLocaleTimeString();
                    logger.debug(
                        `[${timestamp}] Status update received for site: ${update.site?.identifier ?? update.siteIdentifier}`
                    );
                }
            });
        },
        () => {
            const currentSitesStore = useSitesStore.getState();
            currentSitesStore.unsubscribeFromStatusUpdates();

            // Clean up cache sync
            if (cacheSyncCleanupRef.current) {
                cacheSyncCleanupRef.current();
                cacheSyncCleanupRef.current = null;
            }
        }
    );

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
    }, [applyUpdate, setUpdateError, setUpdateStatus, updateStatus]);

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
                    {showLoadingOverlay ? (
                        <output
                            aria-label="Loading application"
                            aria-live="polite"
                            className="loading-overlay"
                        >
                            <ThemedBox
                                padding="lg"
                                rounded="lg"
                                shadow="xl"
                                surface="elevated"
                            >
                                <div className="loading-content">
                                    <div className="loading-spinner" />
                                    <ThemedText size="base" weight="medium">
                                        {UI_MESSAGES.LOADING}
                                    </ThemedText>
                                </div>
                            </ThemedBox>
                        </output>
                    ) : null}

                    {/* Global Error Notification */}
                    {lastError ? (
                        <div className="fixed top-0 right-0 left-0 z-50 p-4">
                            <ErrorAlert
                                message={lastError}
                                onDismiss={clearError}
                                variant="error"
                            />
                        </div>
                    ) : null}

                    {/* Update Notification */}
                    {(updateStatus === "available" ||
                        updateStatus === "downloading" ||
                        updateStatus === "downloaded" ||
                        updateStatus === "error") &&
                        (updateStatus === "error" ? (
                            <div
                                aria-live="assertive"
                                className="fixed top-12 right-0 left-0 z-50"
                                role="alert"
                            >
                                <ThemedBox
                                    className={`update-alert update-alert--${updateStatus}`}
                                    padding="md"
                                    surface="elevated"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="update-alert__icon">
                                                ⚠️
                                            </div>
                                            <ThemedText
                                                size="sm"
                                                variant="error"
                                            >
                                                {updateError ??
                                                    UI_MESSAGES.UPDATE_ERROR_FALLBACK}
                                            </ThemedText>
                                        </div>
                                        <ThemedButton
                                            className="update-alert__action ml-4"
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
                            <output
                                aria-live="polite"
                                className="fixed top-12 right-0 left-0 z-50"
                            >
                                <ThemedBox
                                    className={`update-alert update-alert--${updateStatus}`}
                                    padding="md"
                                    surface="elevated"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="update-alert__icon">
                                                {updateStatus === "available" &&
                                                    "⬇️"}
                                                {updateStatus ===
                                                    "downloading" && "⏬"}
                                                {updateStatus ===
                                                    "downloaded" && "✅"}
                                            </div>
                                            <ThemedText
                                                size="sm"
                                                variant="primary"
                                            >
                                                {updateStatus === "available" &&
                                                    UI_MESSAGES.UPDATE_AVAILABLE}
                                                {updateStatus ===
                                                    "downloading" &&
                                                    UI_MESSAGES.UPDATE_DOWNLOADING}
                                                {updateStatus ===
                                                    "downloaded" &&
                                                    UI_MESSAGES.UPDATE_DOWNLOADED}
                                            </ThemedText>
                                        </div>
                                        {updateStatus === "downloaded" && (
                                            <ThemedButton
                                                className="update-alert__action ml-4"
                                                onClick={handleUpdateAction}
                                                size="sm"
                                                variant="secondary"
                                            >
                                                {
                                                    UI_MESSAGES.UPDATE_RESTART_BUTTON
                                                }
                                            </ThemedButton>
                                        )}
                                    </div>
                                </ThemedBox>
                            </output>
                        ))}

                    <Header />

                    <main className="main-container">
                        {/* Full-width site list */}
                        <ThemedBox
                            padding="md"
                            rounded="lg"
                            shadow="sm"
                            surface="elevated"
                        >
                            <ThemedBox
                                border
                                className="border-b"
                                padding="md"
                                surface="base"
                            >
                                <ThemedText size="lg" weight="medium">
                                    {UI_MESSAGES.SITE_COUNT_LABEL} (
                                    {sites.length})
                                </ThemedText>
                            </ThemedBox>
                            <div className="p-0">
                                <SiteList />
                            </div>
                        </ThemedBox>
                    </main>

                    {/* Add Site Modal */}
                    <AddSiteModal />

                    {/* Settings Modal */}
                    {showSettings ? (
                        <Settings onClose={handleCloseSettings} />
                    ) : null}

                    {/* Site Details Modal */}
                    {showSiteDetails && selectedSite ? (
                        <SiteDetails
                            onClose={handleCloseSiteDetails}
                            site={selectedSite}
                        />
                    ) : null}
                </div>
            </ThemeProvider>
        </ErrorBoundary>
    );
};

export default App;
