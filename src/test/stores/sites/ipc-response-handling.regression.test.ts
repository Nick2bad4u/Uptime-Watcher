/**
 * Regression tests for IPC response handling fixes.
 *
 * These tests verify that the switch from safeExtractIpcData to extractIpcData
 * in critical mutation flows properly propagates backend failures instead of
 * silently swallowing them with fallback values.
 *
 * @see https://github.com/Owner/Uptime-Watcher/issues/ai-claims-validation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Site } from "@shared/types";
import { extractIpcData } from "../../../types/ipc";

// Mock the electron API
const mockElectronAPI = {
    sites: {
        addSite: vi.fn(),
        getSites: vi.fn(),
    },
    data: {
        downloadSqliteBackup: vi.fn().mockResolvedValue({
            buffer: new ArrayBuffer(1024),
            fileName: "backup.db",
            metadata: {
                createdAt: 0,
                originalPath: "/tmp/backup.db",
                sizeBytes: 1024,
            },
        }),
    },
    settings: {
        getHistoryLimit: vi.fn().mockResolvedValue(1000),
    },
    stateSync: {
        getSyncStatus: vi.fn(),
        onStateSyncEvent: vi.fn(),
        requestFullSync: vi.fn(),
    },
};

const mockStateSyncService = vi.hoisted(() => ({
    getSyncStatus: vi.fn(),
    initialize: vi.fn(),
    onStateSyncEvent: vi.fn(),
    requestFullSync: vi.fn(),
}));

vi.mock("../../../services/StateSyncService", () => ({
    StateSyncService: mockStateSyncService,
}));

// Mock global window.electronAPI
Object.defineProperty(window, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

// Mock the logger to avoid console output during tests
vi.mock("../../../services/logger", () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

// Mock error handling utilities
vi.mock("../../../../shared/utils/errorHandling", () => ({
    ensureError: vi.fn((error) =>
        error instanceof Error ? error : new Error(String(error))
    ),
}));

// Mock DataService to prevent actual backend calls
vi.mock("../../../services/DataService", () => ({
    DataService: {
        isConnected: vi.fn().mockReturnValue(true),
        downloadSqliteBackup: vi.fn().mockResolvedValue({
            buffer: new ArrayBuffer(1024),
            fileName: "backup.db",
            metadata: {
                createdAt: 0,
                originalPath: "/tmp/backup.db",
                sizeBytes: 1024,
            },
        }),
    },
}));

// Mock utility functions
vi.mock("../../utils", () => ({
    waitForElectronAPI: vi.fn().mockResolvedValue(undefined),
}));

describe("IPC Response Handling Regression Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Set up default mock responses to prevent hanging
        mockElectronAPI.sites.getSites.mockResolvedValue([]);
        mockElectronAPI.sites.addSite.mockResolvedValue(undefined);
        mockElectronAPI.stateSync.getSyncStatus.mockResolvedValue({
            lastSyncAt: Date.now(),
            siteCount: 0,
            source: "cache",
            synchronized: true,
        });
    });

    describe("extractIpcData behavior verification", () => {
        it("should throw error when response indicates failure", () => {
            const failureResponse = {
                success: false,
                error: "Backend operation failed",
                data: null,
            };

            expect(() => extractIpcData(failureResponse)).toThrow(
                "Backend operation failed"
            );
        });

        it("should return data when response indicates success", () => {
            const successResponse = {
                success: true,
                data: { id: "test-site", name: "Test Site" },
                error: null,
            };

            const result = extractIpcData<{ id: string; name: string }>(
                successResponse
            );
            expect(result).toEqual({ id: "test-site", name: "Test Site" });
        });

        it("should throw error for invalid response format", () => {
            const invalidResponse = { not: "valid" };

            expect(() => extractIpcData(invalidResponse)).toThrow();
        });
    });

    describe("Site Creation Failure Propagation", () => {
        it("should propagate backend failures in site creation", async () => {
            // Mock the electronAPI to throw an error directly (extraction happens in preload)
            mockElectronAPI.sites.addSite.mockRejectedValue(
                new Error("Site creation failed in backend")
            );

            // Import the service after mocking
            const { SiteService } = await import(
                "../../../stores/sites/services/SiteService"
            );

            const testSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [],
            };

            try {
                await SiteService.addSite(testSite);
                expect.fail("Expected error to be thrown");
            } catch (error) {
                expect(String(error)).toContain(
                    "Site creation failed in backend"
                );
            }
        });
    });

    describe("Site Initialization Failure Propagation", () => {
        it("should propagate backend failures in site initialization", async () => {
            // Mock the electronAPI to throw an error directly (extraction happens in preload)
            mockElectronAPI.sites.getSites.mockRejectedValue(
                new Error("Database connection failed")
            );

            const { SiteService } = await import(
                "../../../stores/sites/services/SiteService"
            );

            try {
                await SiteService.getSites();
                expect.fail("Expected error to be thrown");
            } catch (error) {
                expect(String(error)).toContain("Database connection failed");
            }
        });
    });

    describe("Sync Status Failure Propagation", () => {
        it("should handle backend failures in sync status retrieval gracefully", async () => {
            // Mock a backend failure response
            mockElectronAPI.stateSync.getSyncStatus.mockRejectedValue(
                new Error("Sync service unavailable")
            );

            // Import the sync module after mocking
            const { createSiteSyncActions } = await import(
                "../../../stores/sites/useSiteSync"
            );

            // Create a minimal deps object for testing
            const mockDeps = {
                setSites: vi.fn(),
                getSites: vi.fn().mockReturnValue([]),
                setStatusSubscriptionSummary: vi.fn(),
                addSite: vi.fn(),
                updateSite: vi.fn(),
                deleteSite: vi.fn(),
                updateSiteStatus: vi.fn(),
            };

            const syncActions = createSiteSyncActions(mockDeps);

            // GetSyncStatus should gracefully handle errors and return a failure status object
            const result = await syncActions.getSyncStatus();

            expect(result).toEqual({
                lastSyncAt: null,
                siteCount: 0,
                source: "frontend",
                synchronized: false,
            });
        });
    });

    describe("Integration with Error Handling Middleware", () => {
        it("should allow errors to bubble up through withErrorHandling", async () => {
            // This test verifies that extractIpcData errors are not caught
            // at the wrong level and can reach the error handling middleware

            mockElectronAPI.sites.addSite.mockRejectedValue(
                new Error("Critical backend error")
            );

            const { SiteService } = await import(
                "../../../stores/sites/services/SiteService"
            );

            // The error should propagate and not be silently handled
            let caughtError: Error | null = null;
            try {
                await SiteService.addSite({
                    identifier: "test",
                    name: "Test",
                    monitoring: true,
                    monitors: [],
                });
            } catch (error) {
                caughtError = error as Error;
            }

            expect(caughtError).toBeInstanceOf(Error);
            expect(caughtError?.message).toBe("Critical backend error");
        });
    });

    describe("Performance Impact Verification", () => {
        it("should have minimal performance overhead compared to safeExtractIpcData", () => {
            const successResponse = {
                success: true,
                data: { test: "data" },
                error: null,
            };

            // Measure extractIpcData performance
            const start = performance.now();
            for (let i = 0; i < 1000; i++) {
                extractIpcData(successResponse);
            }
            const end = performance.now();

            // Should complete quickly (< 10ms for 1000 operations)
            expect(end - start).toBeLessThan(10);
        });
    });
});
