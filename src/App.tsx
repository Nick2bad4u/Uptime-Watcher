/**
 * Main App component for Uptime Watcher application.
 *
 * @remarks
 * Manages global state, modals, notifications, and renders the main application
 * layout. Coordinates between different views and handles application-wide
 * state management.
 */

import type { JSX } from "react/jsx-runtime";

import { isDevelopment, isProduction } from "@shared/utils/environment";
import { useEscapeKeyModalHandler } from "@shared/utils/modalHandlers";
import {
    memo,
    type NamedExoticComponent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import type { StatusUpdateSubscriptionSummary } from "./stores/sites/baseTypes";

import { AddSiteModal } from "./components/AddSiteForm/AddSiteModal";
import { ConfirmDialog } from "./components/common/ConfirmDialog/ConfirmDialog";
import { ErrorAlert } from "./components/common/ErrorAlert/ErrorAlert";
import { DashboardOverview } from "./components/Dashboard/Overview/DashboardOverview";
import { SiteList } from "./components/Dashboard/SiteList/SiteList";
import { Header } from "./components/Header/Header";
import { AppSidebar } from "./components/Layout/AppSidebar/AppSidebar";
import { SidebarLayoutProvider } from "./components/Layout/SidebarLayoutProvider";
import { SidebarRevealButton } from "./components/Layout/SidebarRevealButton/SidebarRevealButton";
import { Settings } from "./components/Settings/Settings";
import { SiteDetails } from "./components/SiteDetails/SiteDetails";
import { UI_DELAYS } from "./constants";
import { useBackendFocusSync } from "./hooks/useBackendFocusSync";
import { useGlobalMonitoringMetrics } from "./hooks/useGlobalMonitoringMetrics";
import { useMount } from "./hooks/useMount";
import { useSelectedSite } from "./hooks/useSelectedSite";
import { logger } from "./services/logger";
import { ErrorBoundary } from "./stores/error/ErrorBoundary";
import { useErrorStore } from "./stores/error/useErrorStore";
import { useSettingsStore } from "./stores/settings/useSettingsStore";
import { useSitesStore } from "./stores/sites/useSitesStore";
import { useConfirmDialogVisibility } from "./stores/ui/useConfirmDialogStore";
import { useUIStore } from "./stores/ui/useUiStore";
import { useUpdatesStore } from "./stores/updates/useUpdatesStore";
import { ThemedBox } from "./theme/components/ThemedBox";
import { ThemedButton } from "./theme/components/ThemedButton";
import { ThemedText } from "./theme/components/ThemedText";
import { ThemeProvider } from "./theme/components/ThemeProvider";
import { useTheme } from "./theme/useTheme";
import { setupCacheSync } from "./utils/cacheSync";
import { AppIcons } from "./utils/icons";

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

const SIDEBAR_COLLAPSE_MEDIA_QUERY = "(max-width: 1280px)";

/**
 * Main application component that serves as the root of the Uptime Watcher app.
 *
 * @remarks
 * This is the primary entry point component that orchestrates the entire
 * application including state management, theming, error handling, and
 * real-time updates. Uses deferred state updates via timeouts to comply with
 * React best practices.
 *
 * @example
 *
 * ```tsx
 * function App() {
 *     return (
 *         <ErrorBoundary>
 *             <ThemeProvider>
 *                 <div className="app-container">
 *                     <Header />
 *                 </div>
 *             </ThemeProvider>
 *         </ErrorBoundary>
 *     );
 * }
 * ```
 *
 * @returns The main App component JSX
 *
 * @public
 *
 * @beta
 * The component API may change as we refine the architecture.
 *
 * @see {@link useTheme} for theme management
 * @see {@link useSitesStore} for site state management
 */
export const App: NamedExoticComponent = memo(function App(): JSX.Element {
    // Error store
    const { clearError, isLoading, lastError } = useErrorStore();

    // Sites store
    // Settings store - store is initialized via the initialization effect below
    // Store subscription happens automatically when store is accessed

    // UI store
    const {
        setShowAddSiteModal,
        setShowSettings,
        setShowSiteDetails,
        setSidebarCollapsedPreference,
        showAddSiteModal,
        showSettings,
        showSiteDetails,
        sidebarCollapsedPreference,
        siteListLayout,
    } = useUIStore();

    const { cancel: closeConfirmDialog, isOpen: isConfirmDialogOpen } =
        useConfirmDialogVisibility();

    // Updates store
    const {
        applyUpdate,
        applyUpdateStatus,
        setUpdateError,
        updateError,
        updateStatus,
    } = useUpdatesStore();

    const { isDark } = useTheme();

    // Delayed loading state to prevent flash for quick operations
    const [showLoadingOverlay, setShowLoadingOverlay] =
        useState<boolean>(false);

    // Track if initial app initialization is complete to prevent loading overlay flash
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    // Sidebar responsive state management
    const [compactSidebarOpen, setCompactSidebarOpen] =
        useState<boolean>(false);
    const [isCompactViewport, setIsCompactViewport] = useState<boolean>(false);

    const isSidebarOpen = isCompactViewport
        ? compactSidebarOpen
        : !sidebarCollapsedPreference;

    // Ref to store cache sync cleanup function
    const cacheSyncCleanupRef = useRef<(() => void) | null>(null);
    const syncEventsCleanupRef = useRef<(() => void) | null>(null);
    const sidebarMediaQueryRef = useRef<MediaQueryList | null>(null);

    const persistSidebarPreference = useCallback(
        (nextOpen: boolean): void => {
            if (!isCompactViewport) {
                setSidebarCollapsedPreference(!nextOpen);
            }
        },
        [isCompactViewport, setSidebarCollapsedPreference]
    );

    // Create stable callbacks to avoid direct setState in useEffect
    const clearLoadingOverlay = useCallback(() => {
        setShowLoadingOverlay(false);
    }, []);
    const showLoadingOverlayCallback = useCallback(() => {
        setShowLoadingOverlay(true);
    }, []);

    /**
     * Only show loading overlay if loading takes more than 100ms and app is
     * initialized. This prevents flash for quick operations and during initial
     * app startup.
     */
    useEffect(
        function handleLoadingOverlay(): (() => void) | undefined {
            // Only proceed if app is initialized
            if (isInitialized) {
                if (!isLoading) {
                    // Use timeout to defer state update to avoid direct call in
                    // useEffect
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
            }
            return () => {};
        },
        [
            clearLoadingOverlay,
            isInitialized,
            isLoading,
            showLoadingOverlayCallback,
        ]
    );

    /**
     * Initializes the application by setting up stores, cache sync, and status
     * update subscriptions.
     *
     * @remarks
     * This function performs sequential initialization to avoid state conflicts
     * during startup. It also sets up cache synchronization with the backend
     * and stores the cleanup function for later use during component unmount.
     *
     * @returns Promise that resolves when initialization is complete
     *
     * @throws Error When store initialization fails
     */
    const initializeApp = useCallback(async () => {
        if (isProduction()) {
            logger.app.started();
        }

        // Get fresh references to avoid stale closures
        const sitesStoreGetter =
            typeof useSitesStore.getState === "function"
                ? useSitesStore.getState
                : undefined;
        const settingsStoreGetter =
            typeof useSettingsStore.getState === "function"
                ? useSettingsStore.getState
                : undefined;

        const sitesStore = sitesStoreGetter?.();
        const settingsStore = settingsStoreGetter?.();

        // Initialize stores sequentially to avoid state conflicts during startup
        const initializeSettings = settingsStore?.initializeSettings;
        if (typeof initializeSettings === "function") {
            await initializeSettings.call(settingsStore);
        } else if (isDevelopment()) {
            logger.warn(
                "Settings store missing initializeSettings implementation during app bootstrap"
            );
        }

        const initializeSites = sitesStore?.initializeSites;
        if (typeof initializeSites === "function") {
            await initializeSites.call(sitesStore);
        } else if (isDevelopment()) {
            logger.warn(
                "Sites store missing initializeSites implementation during app bootstrap"
            );
        }

        // Set up cache synchronization with backend and store cleanup
        // function
        // eslint-disable-next-line n/no-sync -- Function name contains 'sync' but is not a synchronous file operation
        const cacheSyncCleanup = setupCacheSync();
        cacheSyncCleanupRef.current = cacheSyncCleanup;

        // Subscribe to state sync events
        const subscribeToSyncEvents = sitesStore?.subscribeToSyncEvents;

        if (typeof subscribeToSyncEvents === "function") {
            syncEventsCleanupRef.current = subscribeToSyncEvents();
        } else if (isDevelopment()) {
            logger.warn(
                "Sites store missing subscribeToSyncEvents implementation during app bootstrap"
            );
        }

        // Subscribe to status updates
        const subscribeToStatusUpdates = sitesStore?.subscribeToStatusUpdates;

        if (typeof subscribeToStatusUpdates === "function") {
            const subscriptionResult = (await subscribeToStatusUpdates(
                (update) => {
                    // Optional callback for additional processing if needed
                    if (isDevelopment()) {
                        const timestamp = new Date().toLocaleTimeString();
                        logger.debug(
                            `[${timestamp}] Status update received for site: ${update.site?.identifier ?? update.siteIdentifier}`
                        );
                    }
                }
            )) as StatusUpdateSubscriptionSummary | undefined;

            if (!subscriptionResult) {
                logger.warn(
                    "Status update subscription resolved without diagnostics"
                );
            } else if (!subscriptionResult.success) {
                logger.warn("Status update subscription encountered issues", {
                    errors: subscriptionResult.errors,
                    listenersAttached: subscriptionResult.listenersAttached,
                });
            }
        } else if (isDevelopment()) {
            logger.warn(
                "Sites store missing subscribeToStatusUpdates implementation during app bootstrap"
            );
        }

        // Mark initialization as complete to enable loading overlay for future operations
        setIsInitialized(true);
    }, []);

    /**
     * Cleans up application resources when the component unmounts.
     *
     * @remarks
     * Unsubscribes from status updates and cleans up cache synchronization to
     * prevent memory leaks and background operations.
     */
    const cleanupApp = useCallback(() => {
        const currentSitesStore =
            typeof useSitesStore.getState === "function"
                ? useSitesStore.getState()
                : undefined;

        const unsubscribeFromStatusUpdates =
            currentSitesStore?.unsubscribeFromStatusUpdates;

        if (typeof unsubscribeFromStatusUpdates === "function") {
            unsubscribeFromStatusUpdates();
        } else if (isDevelopment()) {
            logger.warn(
                "Sites store missing unsubscribeFromStatusUpdates implementation during app cleanup"
            );
        }

        // Clean up cache sync
        if (cacheSyncCleanupRef.current) {
            cacheSyncCleanupRef.current();
            cacheSyncCleanupRef.current = null;
        }

        if (syncEventsCleanupRef.current) {
            syncEventsCleanupRef.current();
            syncEventsCleanupRef.current = null;
        }
    }, []);

    useMount(initializeApp, cleanupApp);

    // Focus-based state synchronization (disabled by default for performance)
    // eslint-disable-next-line n/no-sync -- Function name contains 'sync' but is not a synchronous file operation
    useBackendFocusSync(false); // Set to true to enable focus-based backend sync

    const handleSidebarBreakpointChange = useCallback(
        (event: MediaQueryListEvent): void => {
            setIsCompactViewport(event.matches);
            if (event.matches) {
                setCompactSidebarOpen(false);
            }
        },
        []
    );

    const cleanupSidebarListener = useCallback(() => {
        const mediaQuery = sidebarMediaQueryRef.current;
        if (!mediaQuery) {
            return;
        }

        if (typeof mediaQuery.removeEventListener === "function") {
            mediaQuery.removeEventListener(
                "change",
                handleSidebarBreakpointChange
            );
        }
        sidebarMediaQueryRef.current = null;
    }, [handleSidebarBreakpointChange]);

    useMount(
        useCallback(() => {
            const { matchMedia } = globalThis as typeof globalThis & {
                matchMedia?: (query: string) => MediaQueryList;
            };
            if (typeof matchMedia !== "function") {
                return;
            }

            const mediaQuery = matchMedia(SIDEBAR_COLLAPSE_MEDIA_QUERY);
            sidebarMediaQueryRef.current = mediaQuery;
            const { matches } = mediaQuery;
            if (typeof matches === "boolean") {
                setIsCompactViewport(matches);
                if (matches) {
                    setCompactSidebarOpen(false);
                }
            }

            if (typeof mediaQuery.addEventListener === "function") {
                mediaQuery.addEventListener(
                    "change",
                    handleSidebarBreakpointChange
                );
            }
        }, [handleSidebarBreakpointChange]),
        cleanupSidebarListener
    );

    // Auto-dismiss the navigation drawer on compact viewports once focus leaves it.
    useEffect(
        function handleCompactSidebarAutoDismissal(): () => void {
            const { matchMedia } = globalThis as typeof globalThis & {
                matchMedia?: (query: string) => MediaQueryList;
            };
            const mediaQuery =
                sidebarMediaQueryRef.current ??
                (typeof matchMedia === "function"
                    ? matchMedia(SIDEBAR_COLLAPSE_MEDIA_QUERY)
                    : undefined);

            if (!isSidebarOpen || !(mediaQuery?.matches ?? false)) {
                return () => {};
            }

            const handlePointerDown = (event: PointerEvent): void => {
                const { target } = event;
                if (!(target instanceof HTMLElement)) {
                    return;
                }

                const interactiveSelectors: readonly string[] = [
                    ".app-sidebar",
                    ".app-topbar__sidebar-toggle",
                    ".sidebar-reveal-button",
                ];

                const interactedWithinSidebar = interactiveSelectors.some(
                    (selector) => target.closest(selector) !== null
                );

                if (interactedWithinSidebar) {
                    return;
                }

                if (isCompactViewport) {
                    setCompactSidebarOpen(false);
                } else {
                    persistSidebarPreference(false);
                }
            };

            document.addEventListener("pointerdown", handlePointerDown, true);

            return () => {
                document.removeEventListener(
                    "pointerdown",
                    handlePointerDown,
                    true
                );
            };
        },
        [
            isCompactViewport,
            isSidebarOpen,
            persistSidebarPreference,
        ]
    );

    const toggleSidebar = useCallback(() => {
        if (isCompactViewport) {
            setCompactSidebarOpen((previous) => !previous);
            return;
        }

        const next = !isSidebarOpen;
        persistSidebarPreference(next);
    }, [
        isCompactViewport,
        isSidebarOpen,
        persistSidebarPreference,
    ]);

    const globalMetrics = useGlobalMonitoringMetrics();

    const selectedSite = useSelectedSite();

    /**
     * Handles update action based on current update status.
     *
     * @remarks
     * If an update has been downloaded, applies the update. Otherwise, resets
     * the update status to idle and clears any errors.
     */
    const handleUpdateAction = useCallback(async () => {
        if (updateStatus === "downloaded") {
            try {
                await applyUpdate();
            } catch (error: unknown) {
                logger.error("Failed to apply pending update:", error);
            }
            return;
        }

        applyUpdateStatus("idle");
        setUpdateError(undefined);
    }, [
        applyUpdate,
        applyUpdateStatus,
        setUpdateError,
        updateStatus,
    ]);

    /**
     * Handles closing the settings modal.
     */
    const handleCloseSettings = useCallback(() => {
        setShowSettings(false);
    }, [setShowSettings]);

    /**
     * Handles closing the add site modal.
     */
    const handleCloseAddSiteModal = useCallback(() => {
        setShowAddSiteModal(false);
    }, [setShowAddSiteModal]);

    /**
     * Handles closing the site details modal.
     */
    const handleCloseSiteDetails = useCallback(() => {
        setShowSiteDetails(false);
    }, [setShowSiteDetails]);

    /**
     * Handle escape key for closing modals
     */
    const modalConfigs = useMemo(
        () => [
            {
                isOpen: isConfirmDialogOpen,
                onClose: closeConfirmDialog,
                priority: 4,
            },
            {
                isOpen: showSiteDetails,
                onClose: handleCloseSiteDetails,
                priority: 3, // Highest priority
            },
            {
                isOpen: showAddSiteModal,
                onClose: handleCloseAddSiteModal,
                priority: 2,
            },
            {
                isOpen: showSettings,
                onClose: handleCloseSettings,
                priority: 1,
            },
        ],
        [
            closeConfirmDialog,
            handleCloseAddSiteModal,
            handleCloseSettings,
            handleCloseSiteDetails,
            isConfirmDialogOpen,
            showAddSiteModal,
            showSettings,
            showSiteDetails,
        ]
    );

    useEscapeKeyModalHandler(modalConfigs);

    // Extract SiteDetails JSX to avoid complex conditional rendering
    const siteDetailsJSX =
        showSiteDetails && selectedSite ? (
            <SiteDetails onClose={handleCloseSiteDetails} site={selectedSite} />
        ) : null;

    const UpdateWarningIcon = AppIcons.status.warning;
    const UpdateAvailableIcon = AppIcons.actions.refresh;
    const UpdateDownloadingIcon = AppIcons.actions.refreshAlt;
    const UpdateReadyIcon = AppIcons.status.upFilled;

    const handleUpdateButtonClick = useCallback(() => {
        void handleUpdateAction();
    }, [handleUpdateAction]);

    // Helper function to render update notification to reduce complexity
    const renderUpdateNotification = (): JSX.Element | null => {
        if (
            !(
                updateStatus === "available" ||
                updateStatus === "downloading" ||
                updateStatus === "downloaded" ||
                updateStatus === "error"
            )
        ) {
            return null;
        }

        if (updateStatus === "error") {
            return (
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
                                    <UpdateWarningIcon
                                        className="update-alert__icon-symbol"
                                        size={20}
                                    />
                                </div>
                                <ThemedText size="sm" variant="error">
                                    {updateError ??
                                        UI_MESSAGES.UPDATE_ERROR_FALLBACK}
                                </ThemedText>
                            </div>
                            <ThemedButton
                                className="update-alert__action ml-4"
                                onClick={handleUpdateButtonClick}
                                size="sm"
                                variant="secondary"
                            >
                                {UI_MESSAGES.UPDATE_DISMISS_BUTTON}
                            </ThemedButton>
                        </div>
                    </ThemedBox>
                </div>
            );
        }

        return (
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
                                {updateStatus === "available" ? (
                                    <UpdateAvailableIcon
                                        className="update-alert__icon-symbol"
                                        size={20}
                                    />
                                ) : null}
                                {updateStatus === "downloading" ? (
                                    <UpdateDownloadingIcon
                                        className="update-alert__icon-symbol"
                                        size={20}
                                    />
                                ) : null}
                                {updateStatus === "downloaded" ? (
                                    <UpdateReadyIcon
                                        className="update-alert__icon-symbol"
                                        size={20}
                                    />
                                ) : null}
                            </div>
                            <ThemedText size="sm" variant="primary">
                                {updateStatus === "available" &&
                                    UI_MESSAGES.UPDATE_AVAILABLE}
                                {updateStatus === "downloading" &&
                                    UI_MESSAGES.UPDATE_DOWNLOADING}
                                {updateStatus === "downloaded" &&
                                    UI_MESSAGES.UPDATE_DOWNLOADED}
                            </ThemedText>
                        </div>
                        {updateStatus === "downloaded" && (
                            <ThemedButton
                                className="update-alert__action ml-4"
                                onClick={handleUpdateButtonClick}
                                size="sm"
                                variant="secondary"
                            >
                                {UI_MESSAGES.UPDATE_RESTART_BUTTON}
                            </ThemedButton>
                        )}
                    </div>
                </ThemedBox>
            </output>
        );
    };

    return (
        <ErrorBoundary>
            <ThemeProvider>
                <SidebarLayoutProvider
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                >
                    <ConfirmDialog />
                    <div
                        className={`app-shell ${isDark ? "app-shell--dark" : "app-shell--light"} ${isSidebarOpen ? "app-shell--sidebar-open" : "app-shell--sidebar-closed"}`}
                        data-testid="app-container"
                    >
                        <AppSidebar />
                        <SidebarRevealButton />

                        <div className="app-shell__main">
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
                                            <ThemedText
                                                size="base"
                                                weight="medium"
                                            >
                                                {UI_MESSAGES.LOADING}
                                            </ThemedText>
                                        </div>
                                    </ThemedBox>
                                </output>
                            ) : null}

                            {lastError ? (
                                <div className="fixed top-0 right-0 left-0 z-50 p-4">
                                    <ErrorAlert
                                        message={lastError}
                                        onDismiss={clearError}
                                        variant="error"
                                    />
                                </div>
                            ) : null}

                            {renderUpdateNotification()}

                            <Header />

                            <div className="app-shell__content">
                                {siteListLayout === "card-large" && (
                                    <DashboardOverview
                                        metrics={globalMetrics}
                                        siteCountLabel={
                                            UI_MESSAGES.SITE_COUNT_LABEL
                                        }
                                    />
                                )}

                                <div className="app-shell__panel">
                                    <SiteList />
                                </div>
                            </div>
                        </div>
                    </div>

                    {showAddSiteModal ? (
                        <AddSiteModal onClose={handleCloseAddSiteModal} />
                    ) : null}

                    {showSettings ? (
                        <Settings onClose={handleCloseSettings} />
                    ) : null}

                    {siteDetailsJSX}
                </SidebarLayoutProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
});
