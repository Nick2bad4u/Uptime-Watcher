/**
 * Final 100% line coverage test for useSiteSync.ts Covers the last remaining
 * uncovered lines: 194-195, 207-220, 239
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
}));

vi.mock("../../../../shared/utils/errorHandling", () => ({
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
import { withErrorHandling } from "../../../../shared/utils/errorHandling";
import { logStoreAction } from "../../../stores/utils";
import { safeExtractIpcData } from "../../../types/ipc";

describe("useSiteSync - Final 100% Coverage", () => {
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

    describe("Lines 194-195: fullSyncFromBackend", () => {
        it("should call syncSitesFromBackend and log success message", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: useSiteSync.final-coverage",
                "component"
            );
            await annotate("Category: Store", "category");
            await annotate("Type: Business Logic", "type");

            // Mock syncSitesFromBackend to succeed
            vi.mocked(SiteService.getSites).mockResolvedValue(mockSites);

            // Mock withErrorHandling to execute normally
            vi.mocked(withErrorHandling).mockImplementation(
                async (operation) => await operation()
            );

            await syncActions.fullSyncFromBackend();

            // Verify lines 194-195: syncSitesFromBackend was called and logStoreAction was called
            expect(logStoreAction).toHaveBeenCalledWith(
                "SitesStore",
                "fullSyncFromBackend",
                {
                    message: "Full backend synchronization completed",
                    success: true,
                }
            );
        });
    });

    describe("Lines 207-220: getSyncStatus successful path", () => {
        it("should execute successful getSyncStatus path and log result", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: useSiteSync.final-coverage",
                "component"
            );
            await annotate("Category: Store", "category");
            await annotate("Type: Data Retrieval", "type");

            const mockStatus = {
                siteCount: 10,
                synchronized: true,
                lastSync: 1_640_995_200_000,
                success: true,
            };

            // Mock electronAPI response
            vi.mocked(
                mockElectronAPI.stateSync.getSyncStatus
            ).mockResolvedValue(mockStatus);

            // Mock safeExtractIpcData to return the status
            vi.mocked(safeExtractIpcData).mockReturnValue(mockStatus);

            // Mock withErrorHandling to execute operation normally
            vi.mocked(withErrorHandling).mockImplementation(
                async (operation) => await operation()
            );

            const result = await syncActions.getSyncStatus();

            // Verify lines 207-220: electronAPI was called, safeExtractIpcData was called, and logStoreAction was called
            expect(mockElectronAPI.stateSync.getSyncStatus).toHaveBeenCalled();
            expect(safeExtractIpcData).toHaveBeenCalledWith(mockStatus, {
                lastSync: undefined,
                siteCount: 0,
                success: false,
                synchronized: false,
            });
            expect(logStoreAction).toHaveBeenCalledWith(
                "SitesStore",
                "getSyncStatus",
                {
                    message: "Sync status retrieved",
                    siteCount: mockStatus.siteCount,
                    success: true,
                    synchronized: mockStatus.synchronized,
                }
            );
            expect(result).toEqual(mockStatus);
        });
    });

    describe("Line 239: getSyncStatus catch block fallback", () => {
        it("should return fallback when withErrorHandling throws", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: useSiteSync.final-coverage",
                "component"
            );
            await annotate("Category: Store", "category");
            await annotate("Type: Error Handling", "type");

            // Mock withErrorHandling to throw an error
            vi.mocked(withErrorHandling).mockImplementation(() => {
                throw new Error("withErrorHandling failed");
            });

            const result = await syncActions.getSyncStatus();

            // Verify line 239: fallback return statement is executed
            expect(result).toEqual({
                lastSync: undefined,
                siteCount: 0,
                success: false,
                synchronized: false,
            });
        });
    });
});
