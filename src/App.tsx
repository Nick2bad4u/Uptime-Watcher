/**
 * Main App component for Uptime Watcher application.
 *
 * @remarks
 * Manages global state, modals, notifications, and renders the main application
 * layout. Coordinates between different views and handles application-wide
 * state management.
 */

import type { StatusUpdate } from "@shared/types";
import type { JSX } from "react/jsx-runtime";

import { isDevelopment, isProduction } from "@shared/utils/environment";
import { ensureError } from "@shared/utils/errorHandling";
import { useEscapeKeyModalHandler } from "@shared/utils/modalHandlers";
import { isRecord } from "@shared/utils/typeHelpers";
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
import {
    enqueueAlertFromStatusUpdate,
    synchronizeNotificationPreferences,
} from "./components/Alerts/alertCoordinator";
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
import { UI_DELAYS } from "./constants";
import { SIDEBAR_COLLAPSE_MEDIA_QUERY } from "./constants/layout";
import { useBackendFocusSync } from "./hooks/useBackendFocusSync";
import { useGlobalMonitoringMetrics } from "./hooks/useGlobalMonitoringMetrics";
import { useMount } from "./hooks/useMount";
import { useSelectedSite } from "./hooks/useSelectedSite";
import { logger } from "./services/logger";
import { NotificationPreferenceService } from "./services/NotificationPreferenceService";
import { useAlertStore } from "./stores/alerts/useAlertStore";
import { ErrorBoundary } from "./stores/error/ErrorBoundary";
import { useErrorStore } from "./stores/error/useErrorStore";
import { useSettingsStore } from "./stores/settings/useSettingsStore";
import { useSitesStore } from "./stores/sites/useSitesStore";
import { useConfirmDialogVisibility } from "./stores/ui/useConfirmDialogStore";
import { usePromptDialogVisibility } from "./stores/ui/usePromptDialogStore";
import { useUIStore } from "./stores/ui/useUiStore";
import { useUpdatesStore } from "./stores/updates/useUpdatesStore";
import { ThemedBox } from "./theme/components/ThemedBox";
import { ThemedButton } from "./theme/components/ThemedButton";
import { ThemedText } from "./theme/components/ThemedText";
import { ThemeProvider } from "./theme/components/ThemeProvider";
import { useTheme } from "./theme/useTheme";
import { setupCacheSync } from "./utils/cacheSync";
import { AppIcons } from "./utils/icons";
import {
    subscribeToMediaQueryListChanges,
    tryGetMediaQueryList,
} from "./utils/mediaQueries";

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

const warnMissingImplementation = (message: string): void => {
    if (isDevelopment()) {
        logger.warn(message);
    }
};

const resolveStatusUpdateSiteIdentifier = (update: StatusUpdate): string => {
    const siteCandidate = isRecord(update) ? update.site : undefined;
    let siteIdentifierFromSite = "";

    if (isRecord(siteCandidate)) {
        const identifierCandidate = siteCandidate.identifier;
        if (typeof identifierCandidate === "string") {
            const trimmedIdentifier = identifierCandidate.trim();
            if (trimmedIdentifier.length > 0) {
                siteIdentifierFromSite = trimmedIdentifier;
            }
        }
    }

    if (siteIdentifierFromSite.length > 0) {
        return siteIdentifierFromSite;
    }

    const siteIdentifierFromEvent = update.siteIdentifier.trim();
    if (siteIdentifierFromEvent.length > 0) {
        return siteIdentifierFromEvent;
    }

    return "unknown-site";
};

const logStatusUpdateDebugInfo = (update: StatusUpdate): void => {
    if (!isDevelopment()) {
        return;
    }

    const timestamp = new Date().toLocaleTimeString();
    const resolvedIdentifier = resolveStatusUpdateSiteIdentifier(update);

    logger.debug(
        `[${timestamp}] Status update received for site: ${resolvedIdentifier}`
    );
};

const reportSubscriptionDiagnostics = (
    summary: StatusUpdateSubscriptionSummary | undefined
): void => {
    if (!summary) {
        logger.warn("Status update subscription resolved without diagnostics");
        return;
    }

    if (summary.success) {
        return;
    }

    logger.warn("Status update subscription encountered issues", {
        errors: summary.errors,
        listenersAttached: summary.listenersAttached,
    });
};

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
    } = useUIStore();

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
        logger.debug("[App:init] initializeApp invoked");
        if (isProduction()) {
            logger.app.started();
        }

        try {
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
                logger.debug("[App:init] invoking settings initialize");
                await initializeSettings.call(settingsStore);
                logger.debug("[App:init] settings initialized");
            } else {
                warnMissingImplementation(
                    "Settings store missing initializeSettings implementation during app bootstrap"
                );
            }

            try {
                logger.debug(
                    "[App:init] initializing notification preference bridge"
                );
                await NotificationPreferenceService.initialize();
            } catch (error) {
                logger.warn(
                    "Failed to initialize notification preference bridge",
                    ensureError(error)
                );
            }

            logger.debug(
                "[App:init] running initial notification preference synchronization"
            );
            await synchronizeNotificationPreferences();
            logger.debug(
                "[App:init] initial notification preference synchronization completed"
            );

            const initializeSites = sitesStore?.initializeSites;
            if (typeof initializeSites === "function") {
                logger.debug("[App:init] invoking sites initialize");
                await initializeSites.call(sitesStore);
                logger.debug("[App:init] sites initialized");
            } else {
                warnMissingImplementation(
                    "Sites store missing initializeSites implementation during app bootstrap"
                );
            }

            // Set up cache synchronization with backend and store cleanup
            // function
            logger.debug("[App:init] setting up cache synchronization");
            // eslint-disable-next-line n/no-sync -- Function name contains 'sync' but is not a synchronous file operation
            const cacheSyncCleanup = setupCacheSync();
            logger.debug("[App:init] cache synchronization enabled");
            cacheSyncCleanupRef.current = cacheSyncCleanup;

            // Subscribe to state sync events
            const subscribeToSyncEvents = sitesStore?.subscribeToSyncEvents;

            if (typeof subscribeToSyncEvents === "function") {
                logger.debug("[App:init] subscribing to sync events");
                syncEventsCleanupRef.current = subscribeToSyncEvents();
                logger.debug("[App:init] sync events subscription established");
            } else {
                warnMissingImplementation(
                    "Sites store missing subscribeToSyncEvents implementation during app bootstrap"
                );
            }

            // Subscribe to status updates
            const subscribeToStatusUpdates =
                sitesStore?.subscribeToStatusUpdates;

            if (typeof subscribeToStatusUpdates === "function") {
                logger.debug("[App:init] subscribing to status updates");
                const subscriptionResult = (await subscribeToStatusUpdates(
                    (update: StatusUpdate) => {
                        enqueueAlertFromStatusUpdate(update);
                        logStatusUpdateDebugInfo(update);
                    }
                )) as StatusUpdateSubscriptionSummary | undefined;

                reportSubscriptionDiagnostics(subscriptionResult);
                logger.debug(
                    "[App:init] status updates subscription completed"
                );
            } else {
                warnMissingImplementation(
                    "Sites store missing subscribeToStatusUpdates implementation during app bootstrap"
                );
            }

            // Subscribe to app update status events (store-owned subscription)
            logger.debug("[App:init] subscribing to update status events");
            updateStatusEventsCleanupRef.current =
                subscribeToUpdateStatusEvents();
            logger.debug(
                "[App:init] update status events subscription established"
            );

            // Mark initialization as complete to enable loading overlay for future operations
            logger.debug(
                "[App:init] initialization pipeline finished, marking initialized"
            );
            setIsInitialized(true);
            logger.info("[App:init] store update counts after initialization", {
                alertUpdates: alertsUpdateCountRef.current,
                errorUpdates: errorUpdateCountRef.current,
                settingsUpdates: settingsUpdateCountRef.current,
                siteUpdates: sitesUpdateCountRef.current,
                uiUpdates: uiUpdateCountRef.current,
                updatesStoreUpdates: updatesUpdateCountRef.current,
            });
        } catch (error) {
            const normalizedError = ensureError(error);
            logger.error(
                "[App:init] Unhandled error during initialization pipeline",
                normalizedError
            );
            useErrorStore
                .getState()
                .setError(
                    normalizedError.message ||
                        "Failed to initialize application. Please restart and try again."
                );
        }
    }, [subscribeToUpdateStatusEvents]);

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

        if (updateStatusEventsCleanupRef.current) {
            updateStatusEventsCleanupRef.current();
            updateStatusEventsCleanupRef.current = null;
        }
    }, []);

    useMount(initializeApp, cleanupApp);

    const subscribeToDebugStores = useCallback((): void => {
        const nextSubscriptions: Array<() => void> = [];

        const isCleanupFunction = (
            candidate: unknown
        ): candidate is () => void => typeof candidate === "function";

        const isUnsubscribeContainer = (
            candidate: unknown
        ): candidate is { unsubscribe: () => void } => {
            if (!isRecord(candidate)) {
                return false;
            }

            const { unsubscribe } = candidate as {
                unsubscribe?: unknown;
            };
            return typeof unsubscribe === "function";
        };

        const registerSubscription = (
            unsubscribeCandidate: unknown,
            storeIdentifier: string
        ): void => {
            if (isCleanupFunction(unsubscribeCandidate)) {
                nextSubscriptions.push(unsubscribeCandidate);
                return;
            }

            if (isUnsubscribeContainer(unsubscribeCandidate)) {
                const { unsubscribe } = unsubscribeCandidate;
                nextSubscriptions.push(() => {
                    unsubscribe.call(unsubscribeCandidate);
                });
                return;
            }

            logger.warn(
                "[App:debug] store subscribe did not return a callable unsubscribe",
                {
                    storeIdentifier,
                    type: typeof unsubscribeCandidate,
                }
            );
        };

        const sitesUnsubscribe = useSitesStore.subscribe((state) => {
            if (!isDevelopment()) {
                return;
            }
            sitesUpdateCountRef.current += 1;
            logger.info("[App:debug] sites store update", {
                count: sitesUpdateCountRef.current,
                siteCount: state.sites.length,
            });
        });
        registerSubscription(sitesUnsubscribe, "sites");

        const uiUnsubscribe = useUIStore.subscribe((state) => {
            if (!isDevelopment()) {
                return;
            }
            uiUpdateCountRef.current += 1;
            logger.info("[App:debug] ui store update", {
                count: uiUpdateCountRef.current,
                showAddSiteModal: state.showAddSiteModal,
                showSettings: state.showSettings,
                showSiteDetails: state.showSiteDetails,
            });
        });
        registerSubscription(uiUnsubscribe, "ui");

        const errorUnsubscribe = useErrorStore.subscribe((state) => {
            if (!isDevelopment()) {
                return;
            }
            errorUpdateCountRef.current += 1;
            logger.info("[App:debug] error store update", {
                count: errorUpdateCountRef.current,
                isLoading: state.isLoading,
                lastError: state.lastError,
            });
        });
        registerSubscription(errorUnsubscribe, "error");

        const updatesUnsubscribe = useUpdatesStore.subscribe((state) => {
            if (!isDevelopment()) {
                return;
            }
            updatesUpdateCountRef.current += 1;
            logger.info("[App:debug] updates store update", {
                count: updatesUpdateCountRef.current,
                updateError: state.updateError,
                updateStatus: state.updateStatus,
            });
        });
        registerSubscription(updatesUnsubscribe, "updates");

        const alertsUnsubscribe = useAlertStore.subscribe((state) => {
            if (!isDevelopment()) {
                return;
            }
            alertsUpdateCountRef.current += 1;
            logger.info("[App:debug] alerts store update", {
                alertCount: state.alerts.length,
                count: alertsUpdateCountRef.current,
            });
        });
        registerSubscription(alertsUnsubscribe, "alerts");

        debugSubscriptionsRef.current = nextSubscriptions;
    }, []);

    const cleanupDebugStoreSubscriptions = useCallback((): void => {
        debugSubscriptionsRef.current.forEach((unsubscribe, index) => {
            if (typeof unsubscribe !== "function") {
                logger.warn(
                    "[App:debug] encountered a non-function during debug subscription cleanup",
                    { index, type: typeof unsubscribe }
                );
                return;
            }

            try {
                unsubscribe();
            } catch (error) {
                logger.error(
                    "[App:debug] failed to unsubscribe from store",
                    ensureError(error)
                );
            }
        });
        debugSubscriptionsRef.current = [];
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
        sidebarMediaQueryUnsubscribeRef.current?.();
        sidebarMediaQueryUnsubscribeRef.current = null;
        sidebarMediaQueryRef.current = null;
    }, []);

    useMount(
        useCallback(() => {
            const mediaQuery = tryGetMediaQueryList(
                SIDEBAR_COLLAPSE_MEDIA_QUERY
            );
            if (!mediaQuery) {
                return;
            }

            sidebarMediaQueryRef.current = mediaQuery;
            const { matches } = mediaQuery;
            if (typeof matches === "boolean") {
                setIsCompactViewport(matches);
                if (matches) {
                    setCompactSidebarOpen(false);
                }
            }

            sidebarMediaQueryUnsubscribeRef.current =
                subscribeToMediaQueryListChanges(
                    mediaQuery,
                    handleSidebarBreakpointChange
                );
        }, [handleSidebarBreakpointChange]),
        cleanupSidebarListener
    );

    // Auto-dismiss the navigation drawer on compact viewports once focus leaves it.
    useEffect(
        function handleCompactSidebarAutoDismissal(): () => void {
            const mediaQuery =
                sidebarMediaQueryRef.current ??
                tryGetMediaQueryList(SIDEBAR_COLLAPSE_MEDIA_QUERY);

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
