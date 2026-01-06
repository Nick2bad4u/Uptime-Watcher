/**
 * Comprehensive tests for StateSyncService
 */

import { fc, test as fcTest } from "@fast-check/vitest";
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
                revision: 10,
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

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.calls[0]?.[0]).toMatchObject({
            action: STATE_SYNC_ACTION.BULK_SYNC,
            siteIdentifier: "all",
            revision: fullSyncPayload.revision,
            siteCount: fullSyncPayload.siteCount,
            source: fullSyncPayload.source,
        });

        const broadcastEvent = {
            action: STATE_SYNC_ACTION.BULK_SYNC,
            revision: fullSyncPayload.revision,
            siteCount: fullSyncPayload.siteCount,
            siteIdentifier: "all",
            sites: fullSyncPayload.sites,
            source: fullSyncPayload.source,
            timestamp: fullSyncPayload.completedAt,
        } as const;

        capturedHandler?.(broadcastEvent);

        // The broadcast event carries the same timestamp as the recovery snapshot
        // and is intentionally suppressed to avoid duplicate delivery.
        await vi.waitFor(() => {
            expect(callback).toHaveBeenCalledTimes(1);
        });
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
                siteCount: broadcastEvent.siteCount,
                source: broadcastEvent.source,
                timestamp: broadcastEvent.timestamp,
            })
        );
    });

    it("recovers via full sync when event is truncated", async () => {
        const callback = vi.fn();
        const fullSyncPayload = {
            completedAt: Date.now(),
            revision: 11,
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

        const truncatedEvent = {
            action: STATE_SYNC_ACTION.BULK_SYNC,
            revision: 22,
            siteCount: 123,
            sites: [],
            source: "database" as const,
            timestamp: Date.now(),
            truncated: true,
        } as const;

        capturedHandler?.(truncatedEvent);

        await vi.waitFor(() => {
            expect(
                mockElectronAPI.stateSync.requestFullSync
            ).toHaveBeenCalledTimes(1);
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.calls[0]?.[0]).toMatchObject({
            action: STATE_SYNC_ACTION.BULK_SYNC,
            siteIdentifier: "all",
            source: fullSyncPayload.source,
        });

        expect(mockLogger.warn).toHaveBeenCalledWith(
            "[StateSyncService] Received truncated state sync event; scheduling full sync recovery",
            expect.objectContaining({
                action: STATE_SYNC_ACTION.BULK_SYNC,
                revision: truncatedEvent.revision,
                siteCount: 123,
                source: truncatedEvent.source,
            })
        );
        expect(mockLogger.warn).toHaveBeenCalledWith(
            "[StateSyncService] Attempting full sync recovery after truncated state sync event"
        );
    });

    it("deduplicates recovery attempts while a full sync is pending", async () => {
        const callback = vi.fn();
        let resolveFullSync: (() => void) | undefined;
        const fullSyncPayload = {
            completedAt: Date.now(),
            revision: 12,
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
            revision: fullSyncPayload.revision,
            siteCount: 0,
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
            revision: 20,
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
            revision: 21,
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

    fcTest.prop([
        fc.anything().filter((candidate) => typeof candidate !== "function"),
    ])(
        "wraps invalid cleanup candidates returned by the preload bridge",
        async (invalidCleanup) => {
            mockElectronAPI.stateSync.onStateSyncEvent.mockImplementationOnce(
                (handler: (event: unknown) => void) => {
                    capturedHandler = handler;
                    return invalidCleanup;
                }
            );

            const callback = vi.fn();
            const initialErrorCount = mockLogger.error.mock.calls.length;
            const cleanup = await StateSyncService.onStateSyncEvent(callback);

            expect(typeof cleanup).toBe("function");

            const invalidCleanupCall =
                mockLogger.error.mock.calls[initialErrorCount];
            expect(invalidCleanupCall).toEqual([
                "[StateSyncService] Preload bridge returned an invalid unsubscribe handler",
                expect.objectContaining({
                    actualType: typeof invalidCleanup,
                    value: invalidCleanup,
                }),
            ]);

            cleanup();

            const skipCleanupCall =
                mockLogger.error.mock.calls[initialErrorCount + 1];
            expect(skipCleanupCall).toEqual([
                "[StateSyncService] Skip cleanup, unsubscribe handler was not a function",
            ]);
        }
    );

    fcTest.prop([
        fc.string({ minLength: 1 }).map((message) => new Error(message)),
    ])(
        "reports cleanup errors through the logger while preserving control flow",
        async (cleanupError) => {
            mockElectronAPI.stateSync.onStateSyncEvent.mockImplementationOnce(
                (handler: (event: unknown) => void) => {
                    capturedHandler = handler;
                    return () => {
                        throw cleanupError;
                    };
                }
            );

            const callback = vi.fn();
            const initialErrorCount = mockLogger.error.mock.calls.length;
            const cleanup = await StateSyncService.onStateSyncEvent(callback);

            expect(() => cleanup()).not.toThrowError();

            const cleanupErrorCall =
                mockLogger.error.mock.calls[initialErrorCount];
            expect(cleanupErrorCall).toEqual([
                "[StateSyncService] Failed to cleanup state sync subscription:",
                cleanupError,
            ]);
        }
    );

    it("logs a warning when recovery broadcasts are not observed", async () => {
        vi.useFakeTimers();

        try {
            const callback = vi.fn();
            const fullSyncPayload = {
                completedAt: Date.now(),
                siteCount: 1,
                sites: [
                    {
                        identifier: "site-timeout",
                        monitoring: true,
                        monitors: [
                            {
                                checkInterval: 60_000,
                                history: [],
                                id: "monitor-timeout",
                                monitoring: true,
                                responseTime: -1,
                                retryAttempts: 0,
                                status: "up",
                                timeout: 5000,
                                type: "http",
                                url: "https://timeout.example.com",
                            },
                        ],
                        name: "Timeout Site",
                    },
                ],
                source: "database" as const,
                synchronized: true,
                   revision: 30,
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

            await vi.waitFor(() => {
                expect(mockLogger.info).toHaveBeenCalledWith(
                    "[StateSyncService] Full sync recovery snapshot retrieved",
                    expect.objectContaining({
                        timestamp: fullSyncPayload.completedAt,
                    })
                );
            });

            await vi.advanceTimersByTimeAsync(5000);

            const timeoutWarning = mockLogger.warn.mock.calls.find(
                ([message]) =>
                    message ===
                    "[StateSyncService] Full sync recovery broadcast not received within expected window"
            );

            expect(timeoutWarning?.[1]).toEqual(
                expect.objectContaining({
                    expectedTimestamp: fullSyncPayload.completedAt,
                })
            );
        } finally {
            vi.useRealTimers();
        }
    });
});
