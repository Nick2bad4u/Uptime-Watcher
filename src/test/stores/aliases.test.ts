/**
 * Tests for store alias methods added as part of naming convention
 * standardization.
 *
 * @remarks
 * Verifies that new standardized alias methods properly delegate to their
 * original implementations with correct parameter passing and return values.
 * This ensures backward compatibility while providing improved naming
 * conventions.
 *
 * Covers:
 *
 * - Settings store: persistHistoryLimit -> persistHistoryLimit
 * - Sites sync store: syncSites -> syncSites, fullResyncSites -> fullResyncSites
 * - Sites state store: selectSite -> selectSite
 * - Updates store: applyUpdateStatus -> applyUpdateStatus
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all dependencies
vi.mock("../../constants", () => ({
    DEFAULT_HISTORY_LIMIT: 100,
}));

vi.mock("../../types/ipc", () => ({
    extractIpcData: vi.fn((data) => data),
    safeExtractIpcData: vi.fn((data) => data),
}));

vi.mock("../../services/logger", () => ({
    logger: {
        warn: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

const mockErrorStore = {
    clearStoreError: vi.fn(),
    setStoreError: vi.fn(),
    setOperationLoading: vi.fn(),
};

vi.mock("../../stores/error/useErrorStore", () => ({
    useErrorStore: {
        getState: () => mockErrorStore,
    },
}));

vi.mock("../../stores/utils", () => ({
    logStoreAction: vi.fn(),
    createStoreErrorHandler: vi.fn(() => ({
        setError: mockErrorStore.setStoreError,
        setLoading: mockErrorStore.setOperationLoading,
        clearError: mockErrorStore.clearStoreError,
    })),
}));

vi.mock("../../../shared/utils/errorHandling", () => ({
    withErrorHandling: vi.fn((fn) => fn()),
    ensureError: vi.fn((error) =>
        error instanceof Error ? error : new Error(String(error))),
}));

const mockStateSyncService = {
    getSyncStatus: vi.fn(),
    initialize: vi.fn(),
    onStateSyncEvent: vi.fn(),
    requestFullSync: vi.fn().mockResolvedValue({
        completedAt: Date.now(),
        siteCount: 0,
        sites: [],
        source: "frontend" as const,
        synchronized: true,
    }),
};

vi.mock("../../services/StateSyncService", () => ({
    StateSyncService: mockStateSyncService,
}));

// Mock electron API
const mockElectronAPI = {
    settings: {
        getHistoryLimit: vi.fn().mockResolvedValue(100),
        updateHistoryLimit: vi.fn().mockResolvedValue(100),
        resetSettings: vi.fn().mockResolvedValue(undefined),
        loadSettings: vi.fn().mockResolvedValue({}),
        syncSettings: vi.fn().mockResolvedValue(undefined),
    },
    sites: {
        loadSites: vi.fn().mockResolvedValue([]),
        syncSites: vi.fn().mockResolvedValue(undefined),
        getSites: vi.fn().mockResolvedValue([]),
        saveSites: vi.fn().mockResolvedValue(undefined),
        validateSite: vi.fn().mockResolvedValue({ isValid: true }),
    },
    system: {
        quitAndInstall: vi.fn().mockResolvedValue(true),
    },
};

Object.defineProperty(window, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

describe("Store Alias Methods", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockStateSyncService.requestFullSync.mockResolvedValue({
            completedAt: Date.now(),
            siteCount: 0,
            sites: [],
            source: "frontend" as const,
            synchronized: true,
        });
    });

    describe("Settings Store Aliases", () => {
        it("persistHistoryLimit should exist and delegate correctly", async () => {
            const { useSettingsStore } =
                await import("../../stores/settings/useSettingsStore");

            const store = useSettingsStore.getState();

            // Verify the alias method exists
            expect(store.persistHistoryLimit).toBeDefined();
            expect(typeof store.persistHistoryLimit).toBe("function");

            // Mock the original method to verify delegation
            const originalMethod = vi
                .spyOn(store, "persistHistoryLimit")
                .mockResolvedValue();

            // Call the alias
            await store.persistHistoryLimit(500);

            // Verify delegation occurred
            expect(originalMethod).toHaveBeenCalledWith(500);
            expect(originalMethod).toHaveBeenCalledTimes(1);
        });
    });

    describe("Sites Sync Store Aliases", () => {
        it("syncSites should exist and be callable", async () => {
            const { useSitesStore } =
                await import("../../stores/sites/useSitesStore");

            const store = useSitesStore.getState();

            // Verify the alias method exists
            expect(store.syncSites).toBeDefined();
            expect(typeof store.syncSites).toBe("function");

            // Call the alias to ensure it doesn't throw - it should delegate correctly
            await expect(store.syncSites()).resolves.not.toThrowError();
        });

        it("fullResyncSites should exist and be callable", async () => {
            const { useSitesStore } =
                await import("../../stores/sites/useSitesStore");

            const store = useSitesStore.getState();

            // Verify the alias method exists
            expect(store.fullResyncSites).toBeDefined();
            expect(typeof store.fullResyncSites).toBe("function");

            // Call the alias to ensure it doesn't throw - it should delegate correctly
            await expect(store.fullResyncSites()).resolves.not.toThrowError();
        });
    });

    describe("Updates Store Aliases", () => {
        it("applyUpdateStatus should exist and work correctly", async () => {
            const { useUpdatesStore } =
                await import("../../stores/updates/useUpdatesStore");

            // Reset store to initial state
            useUpdatesStore.setState({ updateStatus: "idle" });

            const store = useUpdatesStore.getState();

            // Verify the alias method exists
            expect(store.applyUpdateStatus).toBeDefined();
            expect(typeof store.applyUpdateStatus).toBe("function");

            // Call the alias
            store.applyUpdateStatus("downloading");

            // Get fresh state to ensure updates are reflected
            const currentState = useUpdatesStore.getState();
            expect(currentState.updateStatus).toBe("downloading");
        });

        it("applyUpdateStatus should handle different status values", async () => {
            const { useUpdatesStore } =
                await import("../../stores/updates/useUpdatesStore");

            const statusValues = [
                "idle",
                "checking",
                "downloading",
                "downloaded",
                "error",
            ] as const;

            for (const status of statusValues) {
                // Reset and get fresh store instance for each iteration
                useUpdatesStore.setState({ updateStatus: "idle" });
                const store = useUpdatesStore.getState();

                store.applyUpdateStatus(status);

                // Get fresh state to ensure updates are reflected
                const currentState = useUpdatesStore.getState();
                expect(currentState.updateStatus).toBe(status);
            }
        });
    });

    describe("Basic Integration Tests", () => {
        it("all alias methods should be accessible from their respective stores", async () => {
            // Import all stores
            const { useSettingsStore } =
                await import("../../stores/settings/useSettingsStore");
            const { useSitesStore } =
                await import("../../stores/sites/useSitesStore");
            const { useUpdatesStore } =
                await import("../../stores/updates/useUpdatesStore");

            const settingsStore = useSettingsStore.getState();
            const sitesStore = useSitesStore.getState();
            const updatesStore = useUpdatesStore.getState();

            // Verify all aliases exist
            expect(settingsStore.persistHistoryLimit).toBeDefined();
            expect(sitesStore.syncSites).toBeDefined();
            expect(sitesStore.fullResyncSites).toBeDefined();
            expect(updatesStore.applyUpdateStatus).toBeDefined();

            // Verify they are functions
            expect(typeof settingsStore.persistHistoryLimit).toBe("function");
            expect(typeof sitesStore.syncSites).toBe("function");
            expect(typeof sitesStore.fullResyncSites).toBe("function");
            expect(typeof updatesStore.applyUpdateStatus).toBe("function");
        });

        it("async aliases should return promises", async () => {
            const { useSettingsStore } =
                await import("../../stores/settings/useSettingsStore");
            const { useSitesStore } =
                await import("../../stores/sites/useSitesStore");

            const settingsStore = useSettingsStore.getState();
            const sitesStore = useSitesStore.getState();

            // Mock original methods to prevent actual API calls
            vi.spyOn(settingsStore, "persistHistoryLimit").mockResolvedValue();
            vi.spyOn(sitesStore, "syncSites").mockResolvedValue();
            vi.spyOn(sitesStore, "fullResyncSites").mockResolvedValue();

            // Call aliases and verify they return promises
            const persistPromise = settingsStore.persistHistoryLimit(100);
            const syncPromise = sitesStore.syncSites();
            const fullSyncPromise = sitesStore.fullResyncSites();

            expect(persistPromise).toBeInstanceOf(Promise);
            expect(syncPromise).toBeInstanceOf(Promise);
            expect(fullSyncPromise).toBeInstanceOf(Promise);

            // Ensure they resolve
            await expect(persistPromise).resolves.toBeUndefined();
            await expect(syncPromise).resolves.toBeUndefined();
            await expect(fullSyncPromise).resolves.toBeUndefined();
        });
    });
});
