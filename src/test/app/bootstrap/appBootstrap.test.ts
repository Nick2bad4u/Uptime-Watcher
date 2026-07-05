import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
    const useErrorStore = Object.assign(vi.fn(), {
        getState: vi.fn(),
    });
    const useSettingsStore = Object.assign(vi.fn(), {
        getState: vi.fn(),
    });
    const useSitesStore = Object.assign(vi.fn(), {
        getState: vi.fn(),
    });

    return {
        cacheCleanup: vi.fn(),
        enqueueAlertFromStatusUpdate: vi.fn(),
        isDevelopment: vi.fn(() => false),
        isProduction: vi.fn(() => false),
        logger: {
            app: {
                started: vi.fn(),
            },
            debug: vi.fn(),
            error: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
        },
        setError: vi.fn(),
        setupCacheSync: vi.fn(),
        subscribeToSyncEventsCleanup: vi.fn(),
        synchronizeNotificationPreferences: vi.fn(),
        useErrorStore,
        useSettingsStore,
        useSitesStore,
    };
});

vi.mock("@shared/utils/environment", () => ({
    isDevelopment: mocks.isDevelopment,
    isProduction: mocks.isProduction,
}));

vi.mock("../../../components/Alerts/alertCoordinator", () => ({
    enqueueAlertFromStatusUpdate: mocks.enqueueAlertFromStatusUpdate,
    synchronizeNotificationPreferences:
        mocks.synchronizeNotificationPreferences,
}));

vi.mock("../../../services/logger", () => ({
    logger: mocks.logger,
}));

vi.mock("../../../services/NotificationPreferenceService", () => ({
    NotificationPreferenceService: {
        initialize: vi.fn().mockResolvedValue(undefined),
    },
}));

vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: mocks.useErrorStore,
}));

vi.mock("../../../stores/settings/useSettingsStore", () => ({
    useSettingsStore: mocks.useSettingsStore,
}));

vi.mock("../../../stores/sites/useSitesStore", () => ({
    useSitesStore: mocks.useSitesStore,
}));

vi.mock("../../../utils/cacheSync", () => ({
    setupCacheSync: mocks.setupCacheSync,
}));

describe("appBootstrap", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.setupCacheSync.mockReturnValue(mocks.cacheCleanup);
        mocks.synchronizeNotificationPreferences.mockResolvedValue(undefined);
        mocks.useErrorStore.getState.mockReturnValue({
            setError: mocks.setError,
        });
    });

    it("cleans up partial subscriptions when bootstrap fails after setup", async () => {
        const { runAppBootstrap } =
            await import("../../../app/bootstrap/appBootstrap");

        const failure = new Error("status subscription failed");
        const initializeSettings = vi.fn().mockResolvedValue(undefined);
        const initializeSites = vi.fn().mockResolvedValue(undefined);
        const unsubscribeFromStatusUpdates = vi.fn();
        const subscribeToStatusUpdates = vi.fn().mockRejectedValue(failure);
        const subscribeToSyncEvents = vi.fn(
            () => mocks.subscribeToSyncEventsCleanup
        );
        const subscribeToUpdateStatusEvents = vi.fn(() => vi.fn());

        mocks.useSettingsStore.getState.mockReturnValue({
            initializeSettings,
        });
        mocks.useSitesStore.getState.mockReturnValue({
            initializeSites,
            subscribeToStatusUpdates,
            subscribeToSyncEvents,
            unsubscribeFromStatusUpdates,
        });

        const cleanupRefs = {
            cacheSyncCleanupRef: { current: null },
            syncEventsCleanupRef: { current: null },
            updateStatusEventsCleanupRef: { current: null },
        };

        await runAppBootstrap({
            cleanupRefs,
            setIsInitialized: vi.fn(),
            subscribeToUpdateStatusEvents,
            updateCountRefs: {
                alertsUpdateCountRef: { current: 0 },
                errorUpdateCountRef: { current: 0 },
                settingsUpdateCountRef: { current: 0 },
                sitesUpdateCountRef: { current: 0 },
                uiUpdateCountRef: { current: 0 },
                updatesUpdateCountRef: { current: 0 },
            },
        });

        expect(subscribeToStatusUpdates).toHaveBeenCalledTimes(1);
        expect(subscribeToUpdateStatusEvents).not.toHaveBeenCalled();
        expect(unsubscribeFromStatusUpdates).toHaveBeenCalledTimes(1);
        expect(mocks.cacheCleanup).toHaveBeenCalledTimes(1);
        expect(mocks.subscribeToSyncEventsCleanup).toHaveBeenCalledTimes(1);
        expect(cleanupRefs.cacheSyncCleanupRef.current).toBeNull();
        expect(cleanupRefs.syncEventsCleanupRef.current).toBeNull();
        expect(cleanupRefs.updateStatusEventsCleanupRef.current).toBeNull();
        expect(mocks.setError).toHaveBeenCalledWith(failure.message);
    });
});
