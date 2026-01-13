/**
 * Application bootstrap orchestration extracted from `App.tsx`.
 *
 * @remarks
 * `App.tsx` is intentionally a high-level coordinator, but it grew large due to
 * the startup pipeline (store initialization, IPC subscriptions, cache sync).
 * This module keeps the boot logic testable and reduces noise in the root
 * component.
 */

import type { StatusUpdate } from "@shared/types";

import { isDevelopment, isProduction } from "@shared/utils/environment";
import { ensureError } from "@shared/utils/errorHandling";

import type { StatusUpdateSubscriptionSummary } from "../../stores/sites/baseTypes";

import {
    enqueueAlertFromStatusUpdate,
    synchronizeNotificationPreferences,
} from "../../components/Alerts/alertCoordinator";
import { logger } from "../../services/logger";
import { NotificationPreferenceService } from "../../services/NotificationPreferenceService";
import { useErrorStore } from "../../stores/error/useErrorStore";
import { useSettingsStore } from "../../stores/settings/useSettingsStore";
import { useSitesStore } from "../../stores/sites/useSitesStore";
import { setupCacheSync } from "../../utils/cacheSync";
import {
    logStatusUpdateDebugInfo,
    reportSubscriptionDiagnostics,
    warnMissingImplementation,
} from "../statusUpdateDiagnostics";

/**
 * Structural ref type used by this module.
 *
 * @remarks
 * We intentionally avoid importing `React.MutableRefObject` because it is
 * deprecated in the project lint rules. `useRef()` values are structurally
 * compatible with this interface.
 */
export interface MutableRef<T> {
    current: T;
}

/**
 * Refs used to store cleanup callbacks for long-lived subscriptions.
 */
export interface AppBootstrapCleanupRefs {
    cacheSyncCleanupRef: MutableRef<(() => void) | null>;
    syncEventsCleanupRef: MutableRef<(() => void) | null>;
    updateStatusEventsCleanupRef: MutableRef<(() => void) | null>;
}

/**
 * Counters tracked for debug logging.
 */
export interface AppBootstrapUpdateCountRefs {
    alertsUpdateCountRef: MutableRef<number>;
    errorUpdateCountRef: MutableRef<number>;
    settingsUpdateCountRef: MutableRef<number>;
    sitesUpdateCountRef: MutableRef<number>;
    uiUpdateCountRef: MutableRef<number>;
    updatesUpdateCountRef: MutableRef<number>;
}

/**
 * Options for {@link runAppBootstrap}.
 */
export interface RunAppBootstrapOptions {
    cleanupRefs: AppBootstrapCleanupRefs;
    /** Mark the app as fully initialized (used to enable loading overlays). */
    setIsInitialized: (next: boolean) => void;
    subscribeToUpdateStatusEvents: () => () => void;
    updateCountRefs: AppBootstrapUpdateCountRefs;
}

/**
 * Run the App initialization pipeline.
 */
export async function runAppBootstrap(
    options: RunAppBootstrapOptions
): Promise<void> {
    logger.debug("[App:init] initializeApp invoked");

    if (isProduction()) {
        logger.app.started();
    }

    try {
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

        logger.debug("[App:init] setting up cache synchronization");
        // eslint-disable-next-line n/no-sync -- Function name contains 'sync' but is not a synchronous file operation
        const cacheSyncCleanup = setupCacheSync();
        logger.debug("[App:init] cache synchronization enabled");
        options.cleanupRefs.cacheSyncCleanupRef.current = cacheSyncCleanup;

        const subscribeToSyncEvents = sitesStore?.subscribeToSyncEvents;

        if (typeof subscribeToSyncEvents === "function") {
            logger.debug("[App:init] subscribing to sync events");
            options.cleanupRefs.syncEventsCleanupRef.current =
                subscribeToSyncEvents();
            logger.debug("[App:init] sync events subscription established");
        } else {
            warnMissingImplementation(
                "Sites store missing subscribeToSyncEvents implementation during app bootstrap"
            );
        }

        const subscribeToStatusUpdates = sitesStore?.subscribeToStatusUpdates;

        if (typeof subscribeToStatusUpdates === "function") {
            logger.debug("[App:init] subscribing to status updates");
            const subscriptionResult = (await subscribeToStatusUpdates(
                (update: StatusUpdate) => {
                    enqueueAlertFromStatusUpdate(update);
                    logStatusUpdateDebugInfo(update);
                }
            )) as StatusUpdateSubscriptionSummary | undefined;

            reportSubscriptionDiagnostics(subscriptionResult);
            logger.debug("[App:init] status updates subscription completed");
        } else {
            warnMissingImplementation(
                "Sites store missing subscribeToStatusUpdates implementation during app bootstrap"
            );
        }

        logger.debug("[App:init] subscribing to update status events");
        options.cleanupRefs.updateStatusEventsCleanupRef.current =
            options.subscribeToUpdateStatusEvents();
        logger.debug(
            "[App:init] update status events subscription established"
        );

        logger.debug(
            "[App:init] initialization pipeline finished, marking initialized"
        );
        options.setIsInitialized(true);

        logger.info("[App:init] store update counts after initialization", {
            alertUpdates: options.updateCountRefs.alertsUpdateCountRef.current,
            errorUpdates: options.updateCountRefs.errorUpdateCountRef.current,
            settingsUpdates:
                options.updateCountRefs.settingsUpdateCountRef.current,
            siteUpdates: options.updateCountRefs.sitesUpdateCountRef.current,
            uiUpdates: options.updateCountRefs.uiUpdateCountRef.current,
            updatesStoreUpdates:
                options.updateCountRefs.updatesUpdateCountRef.current,
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
}

/**
 * Clean up bootstrap-related subscriptions.
 */
export function cleanupAppBootstrap(options: {
    cleanupRefs: AppBootstrapCleanupRefs;
}): void {
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

    if (options.cleanupRefs.cacheSyncCleanupRef.current) {
        options.cleanupRefs.cacheSyncCleanupRef.current();
        options.cleanupRefs.cacheSyncCleanupRef.current = null;
    }

    if (options.cleanupRefs.syncEventsCleanupRef.current) {
        options.cleanupRefs.syncEventsCleanupRef.current();
        options.cleanupRefs.syncEventsCleanupRef.current = null;
    }

    if (options.cleanupRefs.updateStatusEventsCleanupRef.current) {
        options.cleanupRefs.updateStatusEventsCleanupRef.current();
        options.cleanupRefs.updateStatusEventsCleanupRef.current = null;
    }
}
