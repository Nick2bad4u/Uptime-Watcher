import type { JSX } from "react/jsx-runtime";
/**
 * Main App component for Uptime Watcher application.
 *
 * @remarks
 * Manages global state, modals, notifications, and renders the main application
 * layout. Coordinates between different views and handles application-wide
 * state management.
 */

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
import { useShallow } from "zustand/react/shallow";

import type { ErrorStore } from "./stores/error/types";
import type { UIStore } from "./stores/ui/types";
import type { UpdatesStore } from "./stores/updates/types";

import { UI_MESSAGES } from "./app/appUiMessages";
import {
    cleanupAppBootstrap,
    runAppBootstrap,
} from "./app/bootstrap/appBootstrap";
import {
    cleanupDebugStoreSubscriptions as cleanupDebugStoreSubscriptionsImpl,
    subscribeToDebugStores as subscribeToDebugStoresImpl,
} from "./app/debug/debugStoreSubscriptions";
import { useDelayedLoadingOverlay } from "./app/loading/useDelayedLoadingOverlay";
import {
    cleanupSidebarMediaQueryListener,
    setupSidebarMediaQueryListener,
} from "./app/sidebar/sidebarMediaQueryListener";
import { useCompactSidebarAutoDismiss } from "./app/sidebar/useCompactSidebarAutoDismiss";
import { AddSiteModal } from "./components/AddSiteForm/AddSiteModal";
import { synchronizeNotificationPreferences } from "./components/Alerts/alertCoordinator";
import { StatusAlertToaster } from "./components/Alerts/StatusAlertToaster";
import { ConfirmDialog } from "./components/common/ConfirmDialog/ConfirmDialog";
import { ErrorAlert } from "./components/common/ErrorAlert/ErrorAlert";
import { PromptDialog } from "./components/common/PromptDialog/PromptDialog";
import { DashboardOverview } from "./components/Dashboard/Overview/DashboardOverview";
import { SiteList } from "./components/Dashboard/SiteList/SiteList";
import { Header } from "./components/Header/Header";
import { AppSidebar } from "./components/Layout/AppSidebar/AppSidebar";
import { SidebarLayoutProvider } from "./components/Layout/SidebarLayoutProvider";
import { SidebarRevealButton } from "./components/Layout/SidebarRevealButton/SidebarRevealButton";
import { Settings } from "./components/Settings/Settings";
import { SiteDetails } from "./components/SiteDetails/SiteDetails";
import { UpdateNotificationBanner } from "./components/Updates/UpdateNotificationBanner";
import { useBackendFocusSync } from "./hooks/useBackendFocusSync";
import { useGlobalMonitoringMetrics } from "./hooks/useGlobalMonitoringMetrics";
import { useMount } from "./hooks/useMount";
import { useSelectedSite } from "./hooks/useSelectedSite";
import { logger } from "./services/logger";
import { ErrorBoundary } from "./stores/error/ErrorBoundary";
import { useErrorStore } from "./stores/error/useErrorStore";
import { useSettingsStore } from "./stores/settings/useSettingsStore";
import { useConfirmDialogVisibility } from "./stores/ui/useConfirmDialogStore";
import { usePromptDialogVisibility } from "./stores/ui/usePromptDialogStore";
import { useUIStore } from "./stores/ui/useUiStore";
import { useUpdatesStore } from "./stores/updates/useUpdatesStore";
import { ThemedBox } from "./theme/components/ThemedBox";
import { ThemedText } from "./theme/components/ThemedText";
import { ThemeProvider } from "./theme/components/ThemeProvider";
import { useTheme } from "./theme/useTheme";

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
 * @beta The
 * component API may change as we refine the architecture.
 *
 * @see {@link useTheme} for theme management
 * @see {@link src/stores/sites/useSitesStore#useSitesStore} for site state management
 */
export const App: NamedExoticComponent = memo(function AppComponent(): JSX.Element {
    // Error store
    const { clearError, isLoading, lastError } = useErrorStore(
        useShallow(
            useCallback(
                (state: ErrorStore) => ({
                    clearError: state.clearError,
                    isLoading: state.isLoading,
                    lastError: state.lastError,
                }),
                []
            )
        )
    );

    // Sites store
    // Settings store - store is initialized via the initialization effect below
    // Store subscription happens automatically when store is accessed
    const systemNotificationsEnabled = useSettingsStore(
        useCallback((state) => state.settings.systemNotificationsEnabled, [])
    );
    const systemNotificationsSoundEnabled = useSettingsStore(
        useCallback(
            (state) => state.settings.systemNotificationsSoundEnabled,
            []
        )
    );

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
    } = useUIStore(
        useShallow(
            useCallback(
                (state: UIStore) => ({
                    setShowAddSiteModal: state.setShowAddSiteModal,
                    setShowSettings: state.setShowSettings,
                    setShowSiteDetails: state.setShowSiteDetails,
                    setSidebarCollapsedPreference:
                        state.setSidebarCollapsedPreference,
                    showAddSiteModal: state.showAddSiteModal,
                    showSettings: state.showSettings,
                    showSiteDetails: state.showSiteDetails,
                    sidebarCollapsedPreference:
                        state.sidebarCollapsedPreference,
                    siteListLayout: state.siteListLayout,
                }),
                []
            )
        )
    );

    const { cancel: closeConfirmDialog, isOpen: isConfirmDialogOpen } =
        useConfirmDialogVisibility();

    const { cancel: closePromptDialog, isOpen: isPromptDialogOpen } =
        usePromptDialogVisibility();

    // Updates store
    const {
        applyUpdate,
        applyUpdateStatus,
        setUpdateError,
        subscribeToUpdateStatusEvents,
        updateError,
        updateStatus,
    } = useUpdatesStore(
        useShallow(
            useCallback(
                (state: UpdatesStore) => ({
                    applyUpdate: state.applyUpdate,
                    applyUpdateStatus: state.applyUpdateStatus,
                    setUpdateError: state.setUpdateError,
                    subscribeToUpdateStatusEvents:
                        state.subscribeToUpdateStatusEvents,
                    updateError: state.updateError,
                    updateStatus: state.updateStatus,
                }),
                []
            )
        )
    );

    const { isDark } = useTheme();

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
    const updateStatusEventsCleanupRef = useRef<(() => void) | null>(null);
    const sidebarMediaQueryRef = useRef<MediaQueryList | null>(null);
    const sidebarMediaQueryUnsubscribeRef = useRef<(() => void) | null>(null);
    const settingsSubscriptionRef = useRef<(() => void) | null>(null);
    const debugSubscriptionsRef = useRef<Array<() => void>>([]);
    const settingsUpdateCountRef = useRef(0);
    const sitesUpdateCountRef = useRef(0);
    const uiUpdateCountRef = useRef(0);
    const errorUpdateCountRef = useRef(0);
    const updatesUpdateCountRef = useRef(0);
    const alertsUpdateCountRef = useRef(0);
    const subscribeToSettingsStore = useCallback((): void => {
        settingsSubscriptionRef.current = useSettingsStore.subscribe(
            (state) => {
                settingsUpdateCountRef.current += 1;
                logger.info("[App:debug] settings store update", {
                    count: settingsUpdateCountRef.current,
                    historyLimit: state.settings.historyLimit,
                    systemNotificationsEnabled:
                        state.settings.systemNotificationsEnabled,
                    systemNotificationsSoundEnabled:
                        state.settings.systemNotificationsSoundEnabled,
                });
            }
        );
    }, []);

    const cleanupSettingsStoreSubscription = useCallback((): void => {
        settingsSubscriptionRef.current?.();
        settingsSubscriptionRef.current = null;
    }, []);

    useMount(subscribeToSettingsStore, cleanupSettingsStoreSubscription);

    const persistSidebarPreference = useCallback(
        (nextOpen: boolean): void => {
            if (!isCompactViewport) {
                setSidebarCollapsedPreference(!nextOpen);
            }
        },
        [isCompactViewport, setSidebarCollapsedPreference]
    );

    const showLoadingOverlay = useDelayedLoadingOverlay({
        isInitialized,
        isLoading,
    });

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
        await runAppBootstrap({
            cleanupRefs: {
                cacheSyncCleanupRef,
                syncEventsCleanupRef,
                updateStatusEventsCleanupRef,
            },
            setIsInitialized,
            subscribeToUpdateStatusEvents,
            updateCountRefs: {
                alertsUpdateCountRef,
                errorUpdateCountRef,
                settingsUpdateCountRef,
                sitesUpdateCountRef,
                uiUpdateCountRef,
                updatesUpdateCountRef,
            },
        });
    }, [subscribeToUpdateStatusEvents]);

    /**
     * Cleans up application resources when the component unmounts.
     *
     * @remarks
     * Unsubscribes from status updates and cleans up cache synchronization to
     * prevent memory leaks and background operations.
     */
    const cleanupApp = useCallback(() => {
        cleanupAppBootstrap({
            cleanupRefs: {
                cacheSyncCleanupRef,
                syncEventsCleanupRef,
                updateStatusEventsCleanupRef,
            },
        });
    }, []);

    useMount(initializeApp, cleanupApp);

    const subscribeToDebugStores = useCallback((): void => {
        subscribeToDebugStoresImpl({
            countRefs: {
                alertsUpdateCountRef,
                errorUpdateCountRef,
                sitesUpdateCountRef,
                uiUpdateCountRef,
                updatesUpdateCountRef,
            },
            refs: {
                subscriptionsRef: debugSubscriptionsRef,
            },
        });
    }, []);

    const cleanupDebugStoreSubscriptions = useCallback((): void => {
        cleanupDebugStoreSubscriptionsImpl({
            refs: {
                subscriptionsRef: debugSubscriptionsRef,
            },
        });
    }, []);

    useMount(subscribeToDebugStores, cleanupDebugStoreSubscriptions);

    useEffect(
        function syncNotificationPreferencesEffect(): void {
            logger.debug("[App:syncNotifEffect] triggered", {
                soundEnabled: systemNotificationsSoundEnabled,
                systemEnabled: systemNotificationsEnabled,
            });
            void synchronizeNotificationPreferences();
        },
        [systemNotificationsEnabled, systemNotificationsSoundEnabled]
    );

    // Update status events are subscribed during the initialization pipeline
    // via the UpdatesStore to keep event ownership consistent.

    // Focus-based state synchronization (disabled by default for performance)
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

    const closeCompactSidebar = useCallback((): void => {
        setCompactSidebarOpen(false);
    }, []);

    const closeNonCompactSidebar = useCallback((): void => {
        persistSidebarPreference(false);
    }, [persistSidebarPreference]);

    const cleanupSidebarListener = useCallback(() => {
        cleanupSidebarMediaQueryListener({
            refs: {
                mediaQueryRef: sidebarMediaQueryRef,
                unsubscribeRef: sidebarMediaQueryUnsubscribeRef,
            },
        });
    }, []);

    useMount(
        useCallback(() => {
            setupSidebarMediaQueryListener({
                closeCompactSidebar: () => {
                    setCompactSidebarOpen(false);
                },
                onBreakpointChange: handleSidebarBreakpointChange,
                refs: {
                    mediaQueryRef: sidebarMediaQueryRef,
                    unsubscribeRef: sidebarMediaQueryUnsubscribeRef,
                },
                setIsCompactViewport,
            });
        }, [handleSidebarBreakpointChange]),
        cleanupSidebarListener
    );

    // Auto-dismiss the navigation drawer on compact viewports once focus leaves it.
    useCompactSidebarAutoDismiss({
        closeCompactSidebar,
        closeNonCompactSidebar,
        isCompactViewport,
        isSidebarOpen,
        sidebarMediaQueryRef,
    });

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
                isOpen: isPromptDialogOpen,
                onClose: closePromptDialog,
                priority: 5,
            },
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
            closePromptDialog,
            handleCloseAddSiteModal,
            handleCloseSettings,
            handleCloseSiteDetails,
            isConfirmDialogOpen,
            isPromptDialogOpen,
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

    const handleUpdateButtonClick = useCallback(() => {
        void handleUpdateAction();
    }, [handleUpdateAction]);

    return (
        <ErrorBoundary>
            <ThemeProvider>
                <SidebarLayoutProvider
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                >
                    <StatusAlertToaster />
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
                                <div className="fixed inset-x-0 top-0 z-50 p-4">
                                    <ErrorAlert
                                        message={lastError}
                                        onDismiss={clearError}
                                        variant="error"
                                    />
                                </div>
                            ) : null}

                            <UpdateNotificationBanner
                                onAction={handleUpdateButtonClick}
                                updateError={updateError}
                                updateStatus={updateStatus}
                            />

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

                    {/*
                     * Keep the global prompt/confirm dialogs at the end of the
                     * React tree so their portals are appended last in
                     * document.body. This guarantees they stack above other
                     * modals like SiteDetails.
                     */}
                    <PromptDialog />
                    <ConfirmDialog />
                </SidebarLayoutProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
});
