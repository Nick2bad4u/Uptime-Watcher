/**
 * Utility helpers for constructing fully typed `SitesStore` mocks.
 *
 * @remarks
 * The real sites store exposes a large API surface that is consumed by many
 * component and hook tests. Re-creating that shape inline is repetitive and
 * error-prone, especially under `strict` TypeScript settings. This helper
 * fabricates a mock implementation that satisfies the complete
 * {@link SitesStore} contract while remaining easy to customize via partial
 * overrides.
 */

import { vi } from "vitest";

import type { StateSyncStatusSummary } from "@shared/types/stateSync";
import type { PartialDeep } from "type-fest";

import type {
    StatusUpdateSubscriptionSummary,
    StatusUpdateUnsubscribeResult,
} from "../../stores/sites/baseTypes";
import type { SitesStore as SitesStoreInternal } from "../../stores/sites/types";

/**
 * Public type alias for consumers of this test helper.
 *
 * @remarks
 * We intentionally avoid direct re-exports to comply with
 * canonical/no-re-export.
 */
export type SitesStore = SitesStoreInternal;

/**
 * Creates a reusable subscription summary object for mocks.
 */
const createSubscriptionSummary = (): StatusUpdateSubscriptionSummary => ({
    errors: [],
    expectedListeners: 0,
    listenersAttached: 0,
    listenerStates: [],
    message: "",
    subscribed: true,
    success: true,
});

/**
 * Creates a default synchronization status stub.
 */
const createSyncStatusSummary = (): StateSyncStatusSummary => ({
    lastSyncAt: null,
    siteCount: 0,
    source: "frontend",
    synchronized: true,
});

/**
 * Creates a default unsubscribe result stub.
 */
const createUnsubscribeResult = (): StatusUpdateUnsubscribeResult => ({
    message: "",
    success: true,
    unsubscribed: true,
});

/**
 * Creates a mock implementation for `SitesStore` that remains fully typed yet
 * simple to extend. All functions are implemented with {@link vi.fn}, enabling
 * tests to access standard Vitest mock helpers such as
 * `mockResolvedValueOnce`.
 *
 * @param overrides - Optional partial overrides applied to the generated mock.
 *
 * @returns A concrete {@link SitesStore} mock instance.
 */
export const createSitesStoreMock = (
    overrides: PartialDeep<SitesStore> = {}
): SitesStore => {
    type AsyncVoidFn = (...args: readonly unknown[]) => Promise<void>;

    const asyncVoid = <Fn extends AsyncVoidFn>(): Fn =>
        vi.fn(async () => undefined) as unknown as Fn;

    const store: SitesStore = {
        addMonitorToSite: asyncVoid(),
        addSite: vi.fn(),
        checkSiteNow: asyncVoid(),
        createSite: asyncVoid(),
        deleteSite: asyncVoid(),
        downloadSqliteBackup: vi.fn(async () => ({
            buffer: new ArrayBuffer(0),
            fileName: "uptime-watcher-backup.sqlite",
            metadata: {
                appVersion: "0.0.0-test",
                checksum: "mock-checksum",
                createdAt: Date.now(),
                originalPath: "/tmp/uptime-watcher.sqlite",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: 0,
            },
        })),
        saveSqliteBackup: vi.fn(async () => ({
            canceled: true as const,
        })),
        fullResyncSites: asyncVoid(),
        getSelectedMonitorId: vi.fn(),
        getSelectedSite: vi.fn(),
        getSyncStatus: vi.fn(async () => createSyncStatusSummary()),
        initializeSites: vi.fn(async () => ({
            message: "",
            sitesLoaded: 0,
            success: true,
        })),
        modifySite: asyncVoid(),
        recordSiteSyncDelta: vi.fn(),
        removeMonitorFromSite: asyncVoid(),
        removeSite: vi.fn(),
        retryStatusSubscription: vi.fn(async () => createSubscriptionSummary()),
        selectSite: vi.fn(),
        setLastBackupMetadata: vi.fn(),
        setSelectedMonitorId: vi.fn(),
        setSites: vi.fn(),
        setStatusSubscriptionSummary: vi.fn(),
        startSiteMonitoring: asyncVoid(),
        startSiteMonitorMonitoring: asyncVoid(),
        stopSiteMonitoring: asyncVoid(),
        stopSiteMonitorMonitoring: asyncVoid(),
        subscribeToStatusUpdates: vi.fn(async () =>
            createSubscriptionSummary()
        ),
        subscribeToSyncEvents: vi.fn(() => vi.fn()),
        syncSites: asyncVoid(),
        unsubscribeFromStatusUpdates: vi.fn(() => createUnsubscribeResult()),
        updateMonitorRetryAttempts: asyncVoid(),
        updateMonitorTimeout: asyncVoid(),
        updateSiteCheckInterval: asyncVoid(),
        applySiteSnapshot: vi.fn(),
        restoreSqliteBackup: vi.fn(async () => ({
            metadata: {
                appVersion: "0.0.0-test",
                checksum: "mock-restore-checksum",
                createdAt: Date.now(),
                originalPath: "restore.sqlite",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: 0,
            },
            preRestoreFileName: "pre-restore.sqlite",
            restoredAt: Date.now(),
        })),
        lastBackupMetadata: undefined,
        lastSyncDelta: undefined,
        optimisticMonitoringLocks: {},
        selectedMonitorIds: {},
        selectedSiteIdentifier: undefined,
        sites: [],
        sitesRevision: 0,
        statusSubscriptionSummary: undefined,
    };

    return Object.assign(store, overrides) as SitesStore;
};

/**
 * Convenience helper for constructing snapshot overrides that only touch
 * specific store properties while keeping type inference intact.
 *
 * @param state - Initial store snapshot to mutate.
 * @param partial - Partial updates applied to the snapshot.
 */
export const updateSitesStoreMock = (
    state: SitesStore,
    partial: PartialDeep<SitesStore>
): void => {
    Object.assign(state, partial);
};
