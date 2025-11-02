/**
 * Comprehensive tests for StateSyncService
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { STATE_SYNC_ACTION } from "@shared/types/stateSync";

import { StateSyncService } from "../../services/StateSyncService";

const mockWaitForElectronBridge = vi.hoisted(() => vi.fn());
const MockElectronBridgeNotReadyError = vi.hoisted(
    () =>
        class extends Error {
            public readonly diagnostics: unknown;

            public constructor(diagnostics: unknown) {
                super("Electron bridge not ready");
                this.name = "ElectronBridgeNotReadyError";
                this.diagnostics = diagnostics;
            }
        }
);
const mockLogger = vi.hoisted(() => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
}));

const mockElectronAPI = vi.hoisted(() => ({
    stateSync: {
        getSyncStatus: vi.fn(),
        onStateSyncEvent: vi.fn(),
        requestFullSync: vi.fn(),
    },
}));

vi.mock("../../services/utils/electronBridgeReadiness", () => ({
    ElectronBridgeNotReadyError: MockElectronBridgeNotReadyError,
    waitForElectronBridge: mockWaitForElectronBridge,
}));

vi.mock("../../services/logger", () => ({
    logger: mockLogger,
}));

vi.mock(
    "../../services/utils/createIpcServiceHelpers",
    async (importOriginal) => {
        const actual =
            await importOriginal<
                typeof import("../../services/utils/createIpcServiceHelpers")
            >();
        return {
            ...actual,
            createIpcServiceHelpers: actual.createIpcServiceHelpers,
        };
    }
);

describe("StateSyncService", () => {
    let capturedHandler: ((event: unknown) => void) | undefined;
    let cleanupSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        capturedHandler = undefined;
        cleanupSpy = vi.fn();

        mockWaitForElectronBridge.mockResolvedValue(undefined);

        mockElectronAPI.stateSync = {
            getSyncStatus: vi.fn(),
            onStateSyncEvent: vi.fn((handler: (event: unknown) => void) => {
                capturedHandler = handler;
                return cleanupSpy;
            }),
            requestFullSync: vi.fn(),
        };

        (globalThis as any).window = {
            electronAPI: mockElectronAPI,
        };
    });

    afterEach(() => {
        vi.resetAllMocks();
        delete (globalThis as any).window;
    });

    it("recovers via full sync when event validation fails", async () => {
        const callback = vi.fn();
        const fullSyncPayload = {
            completedAt: Date.now(),
            siteCount: 1,
            sites: [
                {
                    identifier: "site-1",
                    monitoring: true,
                    monitors: [
                        {
                            checkInterval: 60_000,
                            history: [],
                            id: "monitor-1",
                            monitoring: true,
                            responseTime: -1,
                            retryAttempts: 0,
                            status: "up",
                            timeout: 5000,
                            type: "http",
                            url: "https://example.com",
                        },
                    ],
                    name: "Site 1",
                },
            ],
            source: "database" as const,
            synchronized: true,
        };

        mockElectronAPI.stateSync.requestFullSync.mockResolvedValueOnce(
            fullSyncPayload
        );

        await StateSyncService.onStateSyncEvent(callback);
        expect(capturedHandler).toBeTypeOf("function");
        capturedHandler?.({ invalid: true });

        await vi.waitFor(() => {
            expect(
                mockElectronAPI.stateSync.requestFullSync
            ).toHaveBeenCalledTimes(1);
        });

        expect(callback).not.toHaveBeenCalled();

        const broadcastEvent = {
            action: STATE_SYNC_ACTION.BULK_SYNC,
            delta: {
                addedSites: fullSyncPayload.sites,
                removedSiteIdentifiers: [],
                updatedSites: [],
            },
            siteIdentifier: "all",
            sites: fullSyncPayload.sites,
            source: fullSyncPayload.source,
            timestamp: fullSyncPayload.completedAt,
        } as const;

        capturedHandler?.(broadcastEvent);

        await vi.waitFor(() => {
            expect(callback).toHaveBeenCalledTimes(1);
        });

        expect(callback).toHaveBeenCalledWith(broadcastEvent);
        expect(mockLogger.warn).toHaveBeenCalledWith(
            "[StateSyncService] Attempting full sync recovery after invalid state sync event"
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
            "[StateSyncService] Full sync recovery snapshot retrieved",
            expect.objectContaining({
                siteCount: fullSyncPayload.siteCount,
                source: fullSyncPayload.source,
                timestamp: fullSyncPayload.completedAt,
            })
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
            "[StateSyncService] Full sync recovery broadcast applied",
            expect.objectContaining({
                siteCount: broadcastEvent.sites.length,
                source: broadcastEvent.source,
                timestamp: broadcastEvent.timestamp,
            })
        );
    });

    it("deduplicates recovery attempts while a full sync is pending", async () => {
        const callback = vi.fn();
        let resolveFullSync: (() => void) | undefined;
        const fullSyncPayload = {
            completedAt: Date.now(),
            siteCount: 0,
            sites: [],
            source: "database" as const,
            synchronized: true,
        };

        mockElectronAPI.stateSync.requestFullSync.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveFullSync = () => resolve(fullSyncPayload);
                })
        );

        await StateSyncService.onStateSyncEvent(callback);
        expect(capturedHandler).toBeTypeOf("function");

        capturedHandler?.(null);
        capturedHandler?.(undefined);

        expect(mockElectronAPI.stateSync.requestFullSync).toHaveBeenCalledTimes(
            1
        );

        resolveFullSync?.();

        expect(callback).not.toHaveBeenCalled();

        capturedHandler?.({
            action: STATE_SYNC_ACTION.BULK_SYNC,
            delta: {
                addedSites: [],
                removedSiteIdentifiers: [],
                updatedSites: [],
            },
            siteIdentifier: "all",
            sites: [],
            source: fullSyncPayload.source,
            timestamp: fullSyncPayload.completedAt,
        });

        await vi.waitFor(() => {
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    it("clears recovery timer and expectation when cleanup is invoked", async () => {
        vi.useFakeTimers();

        const callback = vi.fn();
        const fullSyncPayload = {
            completedAt: Date.now(),
            siteCount: 1,
            sites: [
                {
                    identifier: "site-cleanup",
                    monitoring: true,
                    monitors: [
                        {
                            checkInterval: 120_000,
                            history: [],
                            id: "monitor-cleanup",
                            monitoring: true,
                            responseTime: -1,
                            retryAttempts: 0,
                            status: "up",
                            timeout: 5000,
                            type: "http",
                            url: "https://cleanup.example.com",
                        },
                    ],
                    name: "Cleanup Site",
                },
            ],
            source: "database" as const,
            synchronized: true,
        };

        mockElectronAPI.stateSync.requestFullSync.mockResolvedValueOnce(
            fullSyncPayload
        );

        const cleanup = await StateSyncService.onStateSyncEvent(callback);
        try {
            expect(typeof cleanup).toBe("function");
            expect(capturedHandler).toBeTypeOf("function");

            capturedHandler?.({ invalid: true });

            await vi.waitFor(() => {
                expect(
                    mockElectronAPI.stateSync.requestFullSync
                ).toHaveBeenCalledTimes(1);
            });

            cleanup?.();
            expect(cleanupSpy).toHaveBeenCalledTimes(1);

            vi.advanceTimersByTime(5000);

            const broadcastTimeoutWarning = mockLogger.warn.mock.calls.find(
                ([message]) =>
                    message ===
                    "[StateSyncService] Full sync recovery broadcast not received within expected window"
            );
            expect(broadcastTimeoutWarning).toBeUndefined();
        } finally {
            vi.useRealTimers();
        }
    });

    it("does not reschedule recovery expectation after cleanup completes", async () => {
        vi.useFakeTimers();

        const callback = vi.fn();
        const fullSyncPayload = {
            completedAt: Date.now(),
            siteCount: 2,
            sites: [],
            source: "database" as const,
            synchronized: true,
        };

        let resolveFullSync: (() => void) | undefined;
        mockElectronAPI.stateSync.requestFullSync.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveFullSync = () => resolve(fullSyncPayload);
                })
        );

        const cleanup = await StateSyncService.onStateSyncEvent(callback);
        try {
            expect(typeof cleanup).toBe("function");
            expect(capturedHandler).toBeTypeOf("function");

            capturedHandler?.({ invalid: true });

            await vi.waitFor(() => {
                expect(
                    mockElectronAPI.stateSync.requestFullSync
                ).toHaveBeenCalledTimes(1);
            });

            cleanup?.();
            expect(cleanupSpy).toHaveBeenCalledTimes(1);

            resolveFullSync?.();

            vi.advanceTimersByTime(5000);

            const broadcastTimeoutWarning = mockLogger.warn.mock.calls.find(
                ([message]) =>
                    message ===
                    "[StateSyncService] Full sync recovery broadcast not received within expected window"
            );
            expect(broadcastTimeoutWarning).toBeUndefined();
        } finally {
            vi.useRealTimers();
        }
    });

    it("logs recovery failures when full sync throws", async () => {
        const callback = vi.fn();
        const failure = new Error("full sync failed");

        mockElectronAPI.stateSync.requestFullSync.mockRejectedValueOnce(
            failure
        );

        await StateSyncService.onStateSyncEvent(callback);
        expect(capturedHandler).toBeTypeOf("function");

        capturedHandler?.("invalid-payload");

        await vi.waitFor(() => {
            expect(mockLogger.error).toHaveBeenCalledWith(
                "[StateSyncService] Full sync recovery failed",
                failure
            );
        });
        expect(callback).not.toHaveBeenCalled();
    });
});
