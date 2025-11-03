import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import type { Site } from "@shared/types";

const ensureErrorMock = vi.hoisted(() =>
    vi.fn((error: unknown) =>
        error instanceof Error ? error : new Error(String(error))
    )
);
const withErrorHandlingMock = vi.hoisted(() =>
    vi.fn(async <T>(operation: () => Promise<T>) => await operation())
);

vi.mock("@shared/utils/errorHandling", () => ({
    ensureError: ensureErrorMock,
    withErrorHandling: withErrorHandlingMock,
}));

const logStoreActionMock = vi.hoisted(() => vi.fn());
vi.mock("../../../stores/utils", () => ({
    logStoreAction: logStoreActionMock,
}));

const createStoreErrorHandlerMock = vi.hoisted(() =>
    vi.fn(() => ({
        setError: vi.fn(),
    }))
);
vi.mock("../../../stores/utils/storeErrorHandling", () => ({
    createStoreErrorHandler: createStoreErrorHandlerMock,
}));

const loggerMock = vi.hoisted(() => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
}));
vi.mock("../../../services/logger", () => ({
    logger: loggerMock,
}));

const stateSyncServiceMock = vi.hoisted(() => ({
    getSyncStatus: vi.fn(),
    onStateSyncEvent: vi.fn(),
    requestFullSync: vi.fn(),
}));
vi.mock("../../../services/StateSyncService", () => ({
    StateSyncService: stateSyncServiceMock,
}));

const statusUpdateManagerConstructor = vi.hoisted(() =>
    vi.fn(function StatusUpdateManagerMock() {
        return {
            getExpectedListenerCount: vi.fn(() => 4),
            subscribe: vi.fn(async () => ({
                errors: [],
                expectedListeners: 4,
                listenersAttached: 4,
                listenerStates: [],
                success: true,
            })),
            unsubscribe: vi.fn(),
        };
    })
);
vi.mock("../../../stores/sites/utils/statusUpdateHandler", () => ({
    StatusUpdateManager: statusUpdateManagerConstructor,
}));

import { createSiteSyncActions } from "../../../stores/sites/useSiteSync";

const buildSite = (identifier: string): Site => ({
    identifier,
    monitoring: true,
    monitors: [],
    name: identifier,
});

describe("useSiteSync throttling and edge cases", () => {
    let deps: {
        getSites: Mock<() => Site[]>;
        setSites: Mock<(sites: Site[]) => void>;
        setStatusSubscriptionSummary: Mock<(summary: unknown) => void>;
        onSiteDelta: Mock<(delta: unknown) => void>;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        deps = {
            getSites: vi.fn(() => []),
            onSiteDelta: vi.fn(),
            setSites: vi.fn(),
            setStatusSubscriptionSummary: vi.fn(),
        };
    });

    it("coalesces concurrent fullResyncSites requests", async () => {
        const actions = createSiteSyncActions(deps);
        const syncSpy = vi
            .spyOn(actions, "syncSites")
            .mockResolvedValue(undefined);

        const firstPromise = actions.fullResyncSites();
        const secondPromise = actions.fullResyncSites();

        await Promise.all([firstPromise, secondPromise]);
        expect(syncSpy).toHaveBeenCalledTimes(1);
        expect(logStoreActionMock).toHaveBeenCalledWith(
            "SitesStore",
            "fullResyncSites",
            expect.objectContaining({
                coalesced: true,
                message: "Coalesced site resync request",
                status: "pending",
            })
        );
    });

    it("restarts coalesced sync after failure", async () => {
        const actions = createSiteSyncActions(deps);
        const syncSpy = vi
            .spyOn(actions, "syncSites")
            .mockRejectedValueOnce(new Error("first failure"))
            .mockResolvedValueOnce(undefined);

        await expect(actions.fullResyncSites()).rejects.toThrow(
            "first failure"
        );
        await expect(actions.fullResyncSites()).resolves.toBeUndefined();
        expect(syncSpy).toHaveBeenCalledTimes(2);
    });

    it("sanitizes duplicate sites and warns when backend isn't synchronized", async () => {
        const duplicateSites = [buildSite("dup"), buildSite("dup")];
        stateSyncServiceMock.requestFullSync.mockResolvedValueOnce({
            completedAt: "now",
            siteCount: duplicateSites.length,
            sites: duplicateSites,
            source: "backend",
            synchronized: false,
        });

        const actions = createSiteSyncActions(deps);
        await actions.syncSites();

        expect(deps.setSites).toHaveBeenCalledWith([
            expect.objectContaining({ identifier: "dup" }),
        ]);
        expect(loggerMock.error).toHaveBeenCalledWith(
            "Duplicate site identifiers detected in full sync response",
            expect.objectContaining({
                duplicates: [
                    expect.objectContaining({
                        identifier: "dup",
                    }),
                ],
                sanitizedSiteCount: 1,
                source: "backend",
            })
        );
        expect(loggerMock.warn).toHaveBeenCalledWith(
            "Backend full sync completed without synchronized flag",
            expect.objectContaining({
                originalSitesCount: duplicateSites.length,
                sanitizedSiteCount: 1,
            })
        );
        expect(logStoreActionMock).toHaveBeenCalledWith(
            "SitesStore",
            "syncSites",
            expect.objectContaining({
                failureReason: "backend-not-synchronized",
                success: false,
                status: "failure",
            })
        );
    });

    it("logs malformed sync events lacking site snapshots", async () => {
        const cleanup = vi.fn();
        let emittedHandler: ((event: any) => void) | undefined;
        stateSyncServiceMock.onStateSyncEvent.mockImplementation(
            async (handler: (event: any) => void) => {
                emittedHandler = handler;
                return cleanup;
            }
        );

        const actions = createSiteSyncActions(deps);
        const unsubscribe = actions.subscribeToSyncEvents();
        expect(typeof unsubscribe).toBe("function");
        expect(stateSyncServiceMock.onStateSyncEvent).toHaveBeenCalledTimes(1);

        emittedHandler?.({ action: "update", timestamp: Date.now() });

        expect(loggerMock.error).toHaveBeenCalledWith(
            "State sync event missing sites payload",
            expect.objectContaining({ action: "update" })
        );
    });
});
