/**
 * 100% line coverage test for useSiteSync.ts
 * Targets all uncovered lines specifically identified by coverage analysis
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Site } from "../../../../shared/types";

// Mock all dependencies
vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: {
        getState: vi.fn(() => ({
            clearStoreError: vi.fn(),
            setStoreError: vi.fn(),
            setOperationLoading: vi.fn(),
        })),
    },
}));

vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
    withErrorHandling: vi.fn(),
}));

vi.mock("../../../stores/sites/services/SiteService", () => ({
    SiteService: {
        getSites: vi.fn(),
    },
}));

vi.mock("../../../stores/sites/utils/statusUpdateHandler", () => ({
    StatusUpdateManager: vi.fn().mockImplementation(() => ({
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
    })),
}));

vi.mock("../../../types/ipc", () => ({
    safeExtractIpcData: vi.fn((response, fallback) => response ?? fallback),
}));

vi.mock("../../../services/logger", () => ({
    default: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
    },
}));

vi.mock("../../../utils/errorHandling", () => ({
    ensureError: vi.fn((error) => error),
}));

// Mock window.electronAPI
const mockElectronAPI = {
    stateSync: {
        onStateSyncEvent: vi.fn(),
        getSyncStatus: vi.fn(),
    },
};

Object.defineProperty(globalThis, "window", {
    value: {
        electronAPI: mockElectronAPI,
    },
    writable: true,
});

// Import after mocking
import { createSiteSyncActions } from "../../../stores/sites/useSiteSync";
import { SiteService } from "../../../stores/sites/services/SiteService";
import { useErrorStore } from "../../../stores/error/useErrorStore";
import { withErrorHandling, logStoreAction } from "../../../stores/utils";
import logger from "../../../services/logger";

describe("useSiteSync - Line Coverage Completion", () => {
    let mockDeps: any;
    let mockSites: Site[];
    let syncActions: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSites = [
            {
                identifier: "site-1",
                name: "Test Site 1",
                monitoring: true,
                monitors: [],
            },
        ];

        mockDeps = {
            getSites: vi.fn(() => mockSites),
            setSites: vi.fn(),
        };

        syncActions = createSiteSyncActions(mockDeps);
    });

    describe("Lines 224-230: getSyncStatus error handlers", () => {
        it("should call clearError, setError, and setLoading handlers", async () => {
            const mockErrorStore = {
                clearStoreError: vi.fn(),
                setStoreError: vi.fn(),
                setOperationLoading: vi.fn(),
            };

            vi.mocked(useErrorStore.getState).mockReturnValue(
                mockErrorStore as any
            );

            // Mock withErrorHandling to call the handlers
            vi.mocked(withErrorHandling).mockImplementationOnce(
                async (_operation, handlers) => {
                    // Call all the handlers to cover lines 224-230
                    const frontendHandlers = handlers as any;
                    if (frontendHandlers?.clearError)
                        frontendHandlers.clearError();
                    if (frontendHandlers?.setError)
                        frontendHandlers.setError(new Error("test"));
                    if (frontendHandlers?.setLoading)
                        frontendHandlers.setLoading(true);
                    if (frontendHandlers?.setLoading)
                        frontendHandlers.setLoading(false);

                    return {
                        siteCount: 5,
                        synchronized: true,
                        lastSync: 1_640_995_200_000,
                        success: true,
                    };
                }
            );

            vi.mocked(
                mockElectronAPI.stateSync.getSyncStatus
            ).mockResolvedValue({
                siteCount: 5,
                synchronized: true,
                lastSync: 1_640_995_200_000,
                success: true,
            });

            await syncActions.getSyncStatus();

            // Verify the specific error handlers were called (lines 224-230)
            expect(mockErrorStore.clearStoreError).toHaveBeenCalledWith(
                "sites-sync"
            );
            expect(mockErrorStore.setStoreError).toHaveBeenCalledWith(
                "sites-sync",
                expect.any(Error)
            );
            expect(mockErrorStore.setOperationLoading).toHaveBeenCalledWith(
                "getSyncStatus",
                true
            );
            expect(mockErrorStore.setOperationLoading).toHaveBeenCalledWith(
                "getSyncStatus",
                false
            );
        });
    });

    describe("Line 262: Logger error in subscribeToStatusUpdates", () => {
        it("should log error when StatusUpdateManager.subscribe throws", async () => {
            const mockCallback = vi.fn();
            const testError = new Error("Subscribe failed");

            // Mock StatusUpdateManager to throw during subscribe
            const statusUpdateHandlerModule = await import(
                "../../../stores/sites/utils/statusUpdateHandler"
            );
            const mockStatusUpdateManager = {
                subscribe: vi.fn(() => {
                    throw testError;
                }),
                unsubscribe: vi.fn(),
            };

            vi.mocked(
                statusUpdateHandlerModule.StatusUpdateManager
            ).mockImplementation(() => mockStatusUpdateManager as any);

            syncActions.subscribeToStatusUpdates(mockCallback);

            // Verify line 262: logger.error was called
            expect(logger.error).toHaveBeenCalledWith(
                "Failed to subscribe to status updates:",
                testError
            );
        });
    });

    describe("Lines 298-307: Delete/update event handling", () => {
        it("should handle delete event and call syncSitesFromBackend (line 300)", async () => {
            let eventHandler: any;
            mockElectronAPI.stateSync.onStateSyncEvent.mockImplementation(
                (handler) => {
                    eventHandler = handler;
                    return vi.fn();
                }
            );

            // Spy on syncSitesFromBackend
            const syncSpy = vi
                .spyOn(syncActions, "syncSitesFromBackend")
                .mockResolvedValue(undefined);

            syncActions.subscribeToSyncEvents();

            const deleteEvent = {
                action: "delete",
                siteIdentifier: "site-1",
                source: "backend",
                timestamp: Date.now(),
            };

            // Trigger delete event (line 296-297)
            eventHandler(deleteEvent);

            // Wait for async operation
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Verify line 300: syncSitesFromBackend was called
            expect(syncSpy).toHaveBeenCalled();
        });

        it("should handle update event and call syncSitesFromBackend (line 300)", async () => {
            let eventHandler: any;
            mockElectronAPI.stateSync.onStateSyncEvent.mockImplementation(
                (handler) => {
                    eventHandler = handler;
                    return vi.fn();
                }
            );

            const syncSpy = vi
                .spyOn(syncActions, "syncSitesFromBackend")
                .mockResolvedValue(undefined);

            syncActions.subscribeToSyncEvents();

            const updateEvent = {
                action: "update",
                siteIdentifier: "site-1",
                source: "backend",
                timestamp: Date.now(),
            };

            // Trigger update event (line 296-297)
            eventHandler(updateEvent);

            await new Promise((resolve) => setTimeout(resolve, 0));

            // Verify line 300: syncSitesFromBackend was called
            expect(syncSpy).toHaveBeenCalled();
        });

        it("should log error when syncSitesFromBackend fails (lines 301-304)", async () => {
            let eventHandler: any;
            mockElectronAPI.stateSync.onStateSyncEvent.mockImplementation(
                (handler) => {
                    eventHandler = handler;
                    return vi.fn();
                }
            );

            const testError = new Error("Sync failed");
            const syncSpy = vi
                .spyOn(syncActions, "syncSitesFromBackend")
                .mockRejectedValue(testError);

            syncActions.subscribeToSyncEvents();

            const deleteEvent = {
                action: "delete",
                siteIdentifier: "site-1",
                source: "backend",
                timestamp: Date.now(),
            };

            eventHandler(deleteEvent);

            // Wait for async operation and error handling
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(syncSpy).toHaveBeenCalled();
            // Verify lines 301-304: error was logged
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "error", {
                error: testError,
            });
        });
    });

    describe("Lines 335-341: syncSitesFromBackend error handlers", () => {
        it("should call clearError, setError, and setLoading handlers", async () => {
            const mockErrorStore = {
                clearStoreError: vi.fn(),
                setStoreError: vi.fn(),
                setOperationLoading: vi.fn(),
            };

            vi.mocked(useErrorStore.getState).mockReturnValue(
                mockErrorStore as any
            );

            // Mock withErrorHandling to call the handlers
            vi.mocked(withErrorHandling).mockImplementationOnce(
                async (operation, handlers) => {
                    // Call all the handlers to cover lines 335-341
                    const frontendHandlers = handlers as any;
                    if (frontendHandlers?.clearError)
                        frontendHandlers.clearError();
                    if (frontendHandlers?.setError)
                        frontendHandlers.setError(new Error("test"));
                    if (frontendHandlers?.setLoading)
                        frontendHandlers.setLoading(true);
                    if (frontendHandlers?.setLoading)
                        frontendHandlers.setLoading(false);

                    return await operation();
                }
            );

            vi.mocked(SiteService.getSites).mockResolvedValue(mockSites);

            await syncActions.syncSitesFromBackend();

            // Verify the specific error handlers were called (lines 335-341)
            expect(mockErrorStore.clearStoreError).toHaveBeenCalledWith(
                "sites-sync"
            );
            expect(mockErrorStore.setStoreError).toHaveBeenCalledWith(
                "sites-sync",
                expect.any(Error)
            );
            expect(mockErrorStore.setOperationLoading).toHaveBeenCalledWith(
                "syncSitesFromBackend",
                true
            );
            expect(mockErrorStore.setOperationLoading).toHaveBeenCalledWith(
                "syncSitesFromBackend",
                false
            );
        });
    });

    describe("Additional edge cases", () => {
        it("should handle bulk-sync with sites", () => {
            let eventHandler: any;
            mockElectronAPI.stateSync.onStateSyncEvent.mockImplementation(
                (handler) => {
                    eventHandler = handler;
                    return vi.fn();
                }
            );

            syncActions.subscribeToSyncEvents();

            const bulkSyncEvent = {
                action: "bulk-sync",
                sites: mockSites,
                source: "backend",
                timestamp: Date.now(),
            };

            eventHandler(bulkSyncEvent);

            expect(mockDeps.setSites).toHaveBeenCalledWith(mockSites);
        });

        it("should handle unsubscribe with existing manager", () => {
            // First subscribe to create a manager
            const mockCallback = vi.fn();
            syncActions.subscribeToStatusUpdates(mockCallback);

            // Then unsubscribe
            const result = syncActions.unsubscribeFromStatusUpdates();

            expect(result).toEqual({
                message: "Successfully unsubscribed from status updates",
                success: true,
                unsubscribed: true,
            });
        });
    });
});
