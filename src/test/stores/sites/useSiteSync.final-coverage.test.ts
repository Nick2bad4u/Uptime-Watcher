/**
 * Final 100% line coverage test for useSiteSync.ts Covers the last remaining
 * uncovered lines: 194-195, 207-220, 239
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Site } from "@shared/types";
import type { StateSyncStatusSummary } from "@shared/types/stateSync";

const LISTENER_NAMES = [
    "monitor-status-changed",
    "monitor-check-completed",
    "monitoring-started",
    "monitoring-stopped",
];

const buildListenerStates = (attachedCount: number) =>
    LISTENER_NAMES.map((name, index) => ({
        attached: index < attachedCount,
        name,
    }));

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
    ensureError: vi.fn((error) =>
        error instanceof Error ? error : new Error(String(error))),
    withErrorHandling: vi.fn(async (operation) => await operation()),
    withUtilityErrorHandling: vi.fn(),
    convertError: vi.fn((error) =>
        error instanceof Error ? error : new Error(String(error))),
}));

vi.mock("../../../stores/sites/utils/statusUpdateHandler", () => ({
    StatusUpdateManager: vi.fn(function StatusUpdateManagerMock() {
        return {
            subscribe: vi.fn(async () => ({
                errors: [],
                expectedListeners: LISTENER_NAMES.length,
                listenersAttached: LISTENER_NAMES.length,
                listenerStates: buildListenerStates(LISTENER_NAMES.length),
                success: true,
            })),
            unsubscribe: vi.fn(),
        } as unknown as StatusUpdateManager;
    }),
}));

const mockStateSyncService = vi.hoisted(() => ({
    getSyncStatus: vi.fn(),
    initialize: vi.fn(),
    onStateSyncEvent: vi.fn(),
    requestFullSync: vi.fn(),
}));

vi.mock("../../../services/StateSyncService", () => ({
    StateSyncService: mockStateSyncService,
}));

// Mock window.electronAPI
Object.defineProperty(globalThis, "window", {
    value: {
        electronAPI: {},
    },
    writable: true,
});

// Import after mocking
import { createSiteSyncActions } from "../../../stores/sites/useSiteSync";
import { withErrorHandling } from "@shared/utils/errorHandling";
import { logStoreAction } from "../../../stores/utils";
import type { StatusUpdateManager } from "../../../stores/sites/utils/statusUpdateHandler";

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
            setStatusSubscriptionSummary: vi.fn(),
            onSiteDelta: vi.fn(),
        };

        syncActions = createSiteSyncActions(mockDeps);
    });

    describe("Lines 194-195: fullResyncSites", () => {
        it("should call syncSites and log success message", async ({
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

            const fullSyncResult = {
                completedAt: Date.now(),
                siteCount: mockSites.length,
                sites: mockSites,
                source: "frontend" as const,
                synchronized: true,
            };

            mockStateSyncService.requestFullSync.mockResolvedValue(
                fullSyncResult
            );

            // Mock withErrorHandling to execute normally
            vi.mocked(withErrorHandling).mockImplementation(
                async (operation) => await operation()
            );

            await syncActions.fullResyncSites();

            // Verify lines 194-195: syncSites was called and logStoreAction was called
            expect(logStoreAction).toHaveBeenCalledWith(
                "SitesStore",
                "fullResyncSites",
                {
                    message: "Full backend resynchronization completed",
                    status: "success",
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
                lastSyncAt: 1_640_995_200_000,
                siteCount: 10,
                source: "database",
                synchronized: true,
            } satisfies StateSyncStatusSummary;

            // Mock electronAPI response
            mockStateSyncService.getSyncStatus.mockResolvedValue(mockStatus);

            // Mock withErrorHandling to execute operation normally
            vi.mocked(withErrorHandling).mockImplementation(
                async (operation) => await operation()
            );

            const result = await syncActions.getSyncStatus();

            expect(mockStateSyncService.getSyncStatus).toHaveBeenCalled();
            expect(logStoreAction).toHaveBeenCalledWith(
                "SitesStore",
                "getSyncStatus",
                {
                    lastSyncAt: mockStatus.lastSyncAt,
                    message: "Sync status retrieved",
                    siteCount: mockStatus.siteCount,
                    source: mockStatus.source,
                    status: "success",
                    success: true,
                    synchronized: mockStatus.synchronized,
                }
            );
            expect(result).toEqual(mockStatus);
        });
    });

    describe("Line 239: getSyncStatus catch block fallback", () => {
        it("should return fallback when stateSync API throws", async ({
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

            vi.mocked(withErrorHandling).mockImplementation(
                async (operation) => await operation()
            );

            mockStateSyncService.getSyncStatus.mockRejectedValue(
                new Error("Status fetch failed")
            );

            const result = await syncActions.getSyncStatus();

            expect(result).toEqual({
                lastSyncAt: null,
                siteCount: 0,
                source: "frontend",
                synchronized: false,
            });
        });
    });
});
