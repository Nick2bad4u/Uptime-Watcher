/**
 * Targeted test coverage for useSiteOperations uncovered lines Focuses on
 * specific error handling paths and edge cases
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { type Site } from "../../../../shared/types";
import { ERROR_CATALOG } from "../../../../shared/utils/errorCatalog";

import { createSiteOperationsActions } from "../../../stores/sites/useSiteOperations";
import type { SiteOperationsDependencies } from "../../../stores/sites/types";
import logger from "../../../services/logger";
import { isDevelopment } from "../../../../shared/utils/environment";

// Get mock reference after import
const mockIsDevelopment = vi.mocked(isDevelopment);

// Mock logger to control development mode checks
vi.mock("../../../services/logger", () => ({
    default: {
        warn: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
    },
}));

// Mock isDevelopment to control development mode
vi.mock("../../../../shared/utils/environment", () => ({
    isDevelopment: vi.fn(() => true), // Set to true to trigger logger.warn calls
}));

const mockErrorStore = {
    clearStoreError: vi.fn(),
    setStoreError: vi.fn(),
    setOperationLoading: vi.fn(),
};

vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: {
        getState: vi.fn(() => mockErrorStore),
    },
}));

vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
    withErrorHandling: vi.fn(async (fn, handlers) => {
        try {
            return await fn().then((result: any) => {
                handlers.setLoading?.(false);
                return result;
            });
        } catch (error) {
            handlers.setError?.(error);
            handlers.setLoading?.(false);
            throw error;
        }
    }),
}));

vi.mock("../../../stores/sites/utils/fileDownload", () => ({
    handleSQLiteBackupDownload: vi.fn(async (callback) => await callback()),
}));

vi.mock("../../../utils/safeExtractIpcData", () => ({
    safeExtractIpcData: vi.fn((response, _defaultValue) => {
        if (response.success) {
            return response.data;
        }
        throw new Error("Failed to extract IPC data");
    }),
}));

describe("useSiteOperations - Targeted Coverage", () => {
    let mockElectronAPI: any;
    let mockSiteDeps: SiteOperationsDependencies;
    let actions: ReturnType<typeof createSiteOperationsActions>;

    // Test site with multiple monitors
    const mockSiteWithMultipleMonitors: Site = {
        identifier: "test-site-multi",
        name: "Test Site Multi",
        monitoring: true,
        monitors: [
            {
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                checkInterval: 60_000,
                timeout: 5000,
                status: "up",
                lastChecked: new Date(),
                responseTime: 100,
                monitoring: true,
                retryAttempts: 3,
                history: [],
            },
            {
                id: "monitor-2",
                type: "http",
                url: "https://example.com/api",
                checkInterval: 60_000,
                timeout: 5000,
                status: "up",
                lastChecked: new Date(),
                responseTime: 150,
                monitoring: true,
                retryAttempts: 3,
                history: [],
            },
        ],
    };

    // Test site with single monitor
    const mockSiteWithSingleMonitor: Site = {
        ...mockSiteWithMultipleMonitors,
        identifier: "test-site-single",
        monitors: [mockSiteWithMultipleMonitors.monitors[0]!],
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Ensure isDevelopment returns true for our tests
        mockIsDevelopment.mockReturnValue(true);

        mockElectronAPI = {
            sites: {
                removeSite: vi.fn().mockResolvedValue({ success: true }),
                removeMonitor: vi.fn().mockResolvedValue({ success: true }),
            },
            monitoring: {
                stopMonitoringForSite: vi
                    .fn()
                    .mockResolvedValue({ success: true }),
            },
            data: {
                downloadSQLiteBackup: vi.fn().mockResolvedValue({
                    success: true,
                    data: { buffer: new ArrayBuffer(1024) },
                }),
            },
        };

        // @ts-expect-error - Mocking global electronAPI
        globalThis.window = {
            electronAPI: mockElectronAPI,
        };

        mockSiteDeps = {
            getSites: vi.fn(() => [
                mockSiteWithMultipleMonitors,
                mockSiteWithSingleMonitor,
            ]),
            removeSite: vi.fn(),
            addSite: vi.fn(),
            setSites: vi.fn(),
            syncSitesFromBackend: vi.fn(),
        };

        actions = createSiteOperationsActions(mockSiteDeps);
    });

    describe("deleteSite Error Handling (Lines 115-116)", () => {
        it("should handle and log errors when stopping monitoring fails but continue with site deletion", async () => {
            // Make stopMonitoringForSite throw an error for the second monitor
            mockElectronAPI.monitoring.stopMonitoringForSite
                .mockResolvedValueOnce({ success: true }) // First monitor succeeds
                .mockRejectedValueOnce(new Error("Monitor stop failed")); // Second monitor fails

            // Delete site should still succeed despite monitor stop failure
            await actions.deleteSite(mockSiteWithMultipleMonitors.identifier);

            // Verify logger.warn was called for the failed monitor (line 115-116)
            expect(logger.warn).toHaveBeenCalledWith(
                expect.stringContaining(
                    "Failed to stop monitoring for monitor"
                ),
                expect.any(Error)
            );

            // Verify site deletion still proceeded
            expect(mockElectronAPI.sites.removeSite).toHaveBeenCalledWith(
                mockSiteWithMultipleMonitors.identifier
            );
            expect(mockSiteDeps.removeSite).toHaveBeenCalledWith(
                mockSiteWithMultipleMonitors.identifier
            );
        });

        it("should handle non-Error objects when stopping monitoring fails", async () => {
            // Make stopMonitoringForSite throw a non-Error object
            mockElectronAPI.monitoring.stopMonitoringForSite.mockRejectedValueOnce(
                "String error"
            );

            await actions.deleteSite(mockSiteWithSingleMonitor.identifier);

            // Verify logger.warn was called with Error wrapper for non-Error (line 118-120)
            expect(logger.warn).toHaveBeenCalledWith(
                expect.stringContaining(
                    "Failed to stop monitoring for monitor"
                ),
                expect.any(Error)
            );
        });
    });

    describe("downloadSQLiteBackup Error Handling (Lines 147-151)", () => {
        it("should handle and rethrow errors when SQLite backup download fails", async () => {
            const downloadError = new Error("Backup download failed");
            mockElectronAPI.data.downloadSQLiteBackup.mockRejectedValueOnce(
                downloadError
            );

            // Console.error should be called and error should be rethrown
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});

            await expect(actions.downloadSQLiteBackup()).rejects.toThrow(
                "Backup download failed"
            );

            // Verify console.error was called (line 147-148)
            expect(consoleSpy).toHaveBeenCalledWith(
                "Failed to download SQLite backup:",
                downloadError
            );

            consoleSpy.mockRestore();
        });

        it("should handle successful backup download", async () => {
            await actions.downloadSQLiteBackup();

            expect(
                mockElectronAPI.data.downloadSQLiteBackup
            ).toHaveBeenCalled();
        });
    });

    describe("removeMonitorFromSite Edge Cases (Line 203)", () => {
        it("should throw error when trying to remove the last monitor from a site", async () => {
            // Try to remove the only monitor from a site with single monitor
            await expect(
                actions.removeMonitorFromSite(
                    mockSiteWithSingleMonitor.identifier,
                    mockSiteWithSingleMonitor.monitors[0]!.id
                )
            ).rejects.toThrow(ERROR_CATALOG.monitors.CANNOT_REMOVE_LAST);

            // Verify no backend calls were made since validation failed early
            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).not.toHaveBeenCalled();
            expect(mockElectronAPI.sites.removeMonitor).not.toHaveBeenCalled();
        });
    });

    describe("removeMonitorFromSite Error Handling (Lines 214-215)", () => {
        it("should handle and log errors when stopping monitoring fails but continue with monitor removal", async () => {
            const stopError = new Error("Stop monitoring failed");
            mockElectronAPI.monitoring.stopMonitoringForSite.mockRejectedValueOnce(
                stopError
            );

            // Monitor removal should still succeed despite stop monitoring failure
            await actions.removeMonitorFromSite(
                mockSiteWithMultipleMonitors.identifier,
                mockSiteWithMultipleMonitors.monitors[0]!.id
            );

            // Verify logger.warn was called for the failed stop operation (lines 214-215)
            expect(logger.warn).toHaveBeenCalledWith(
                expect.stringContaining(
                    "Failed to stop monitoring for monitor"
                ),
                stopError
            );

            // Verify monitor removal still proceeded
            expect(mockElectronAPI.sites.removeMonitor).toHaveBeenCalledWith(
                mockSiteWithMultipleMonitors.identifier,
                mockSiteWithMultipleMonitors.monitors[0]!.id
            );
        });

        it("should handle non-Error objects when stopping monitoring fails during monitor removal", async () => {
            mockElectronAPI.monitoring.stopMonitoringForSite.mockRejectedValueOnce(
                "Non-error object"
            );

            await actions.removeMonitorFromSite(
                mockSiteWithMultipleMonitors.identifier,
                mockSiteWithMultipleMonitors.monitors[1]!.id
            );

            // Verify logger.warn was called with Error wrapper (lines 216-219)
            expect(logger.warn).toHaveBeenCalledWith(
                expect.stringContaining(
                    "Failed to stop monitoring for monitor"
                ),
                expect.any(Error)
            );
        });
    });

    describe("Branch Coverage Edge Cases", () => {
        it("should handle successful monitor removal with successful stop monitoring", async () => {
            await actions.removeMonitorFromSite(
                mockSiteWithMultipleMonitors.identifier,
                mockSiteWithMultipleMonitors.monitors[0]!.id
            );

            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).toHaveBeenCalledWith(
                mockSiteWithMultipleMonitors.identifier,
                mockSiteWithMultipleMonitors.monitors[0]!.id
            );
            expect(mockElectronAPI.sites.removeMonitor).toHaveBeenCalledWith(
                mockSiteWithMultipleMonitors.identifier,
                mockSiteWithMultipleMonitors.monitors[0]!.id
            );
        });

        it("should handle sites with exactly 2 monitors when removing one", async () => {
            // Site with exactly 2 monitors should allow removal
            await actions.removeMonitorFromSite(
                mockSiteWithMultipleMonitors.identifier,
                mockSiteWithMultipleMonitors.monitors[1]!.id
            );

            expect(mockElectronAPI.sites.removeMonitor).toHaveBeenCalledWith(
                mockSiteWithMultipleMonitors.identifier,
                mockSiteWithMultipleMonitors.monitors[1]!.id
            );
        });
    });
});
