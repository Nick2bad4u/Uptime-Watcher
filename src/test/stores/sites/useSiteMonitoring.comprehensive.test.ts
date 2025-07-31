/**
 * Comprehensive tests for useSiteMonitoring module.
 * Tests the createSiteMonitoringActions function and all its operations.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the modules with correct paths first
vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: {
        getState: vi.fn(),
    },
}));

vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
    withErrorHandling: vi.fn(),
}));

vi.mock("../../../stores/sites/services/MonitoringService", () => ({
    MonitoringService: {
        startSiteMonitoring: vi.fn(),
        stopSiteMonitoring: vi.fn(),
        startMonitoring: vi.fn(),
        stopMonitoring: vi.fn(),
    },
}));

vi.mock("../../../stores/sites/services/SiteService", () => ({
    SiteService: {
        checkSiteNow: vi.fn(),
    },
}));

// Import after mocking
import { createSiteMonitoringActions } from "../../../stores/sites/useSiteMonitoring";
import type { SiteMonitoringActions } from "../../../stores/sites/useSiteMonitoring";
import { useErrorStore } from "../../../stores/error/useErrorStore";
import { logStoreAction, withErrorHandling } from "../../../stores/utils";
import { MonitoringService } from "../../../stores/sites/services/MonitoringService";
import { SiteService } from "../../../stores/sites/services/SiteService";

// Get mocked versions
const mockUseErrorStore = vi.mocked(useErrorStore);
const mockLogStoreAction = vi.mocked(logStoreAction);
const mockWithErrorHandling = vi.mocked(withErrorHandling);
const mockMonitoringService = vi.mocked(MonitoringService);
const mockSiteService = vi.mocked(SiteService);

describe("useSiteMonitoring", () => {
    let siteMonitoringActions: SiteMonitoringActions;
    let mockErrorStoreState: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup mock error store state
        mockErrorStoreState = {
            clearStoreError: vi.fn(),
            setStoreError: vi.fn(),
            setOperationLoading: vi.fn(),
        };

        (mockUseErrorStore.getState as any).mockReturnValue(mockErrorStoreState);

        // Setup withErrorHandling to actually call functions and handle errors properly
        mockWithErrorHandling.mockImplementation(async (fn, handlers) => {
            try {
                handlers.setLoading?.(true);
                handlers.clearError?.();
                const result = await fn();
                return result;
            } catch (error) {
                handlers.setError?.(error);
                throw error;
            } finally {
                handlers.setLoading?.(false);
            }
        });

        // Create actions instance
        siteMonitoringActions = createSiteMonitoringActions();
    });

    describe("createSiteMonitoringActions", () => {
        it("should create site monitoring actions object", () => {
            expect(siteMonitoringActions).toBeDefined();
            expect(typeof siteMonitoringActions.checkSiteNow).toBe("function");
            expect(typeof siteMonitoringActions.startSiteMonitoring).toBe("function");
            expect(typeof siteMonitoringActions.startSiteMonitorMonitoring).toBe("function");
            expect(typeof siteMonitoringActions.stopSiteMonitoring).toBe("function");
            expect(typeof siteMonitoringActions.stopSiteMonitorMonitoring).toBe("function");
        });
    });

    describe("checkSiteNow", () => {
        it("should check site now successfully", async () => {
            const siteId = "test-site-id";
            const monitorId = "test-monitor-id";

            mockSiteService.checkSiteNow.mockResolvedValueOnce(undefined);

            await siteMonitoringActions.checkSiteNow(siteId, monitorId);

            expect(mockLogStoreAction).toHaveBeenCalledWith("SitesStore", "checkSiteNow", {
                monitorId,
                siteId,
            });
            expect(mockSiteService.checkSiteNow).toHaveBeenCalledWith(siteId, monitorId);
            expect(mockWithErrorHandling).toHaveBeenCalled();
        });

        it("should handle errors when checking site now", async () => {
            const siteId = "test-site-id";
            const monitorId = "test-monitor-id";
            const error = new Error("Check site failed");

            mockSiteService.checkSiteNow.mockRejectedValueOnce(error);

            await expect(siteMonitoringActions.checkSiteNow(siteId, monitorId)).rejects.toThrow("Check site failed");

            expect(mockLogStoreAction).toHaveBeenCalledWith("SitesStore", "checkSiteNow", {
                monitorId,
                siteId,
            });
            expect(mockSiteService.checkSiteNow).toHaveBeenCalledWith(siteId, monitorId);
            expect(mockWithErrorHandling).toHaveBeenCalled();
        });

        it("should call error handling with correct handlers", async () => {
            const siteId = "test-site-id";
            const monitorId = "test-monitor-id";

            mockSiteService.checkSiteNow.mockResolvedValueOnce(undefined);

            await siteMonitoringActions.checkSiteNow(siteId, monitorId);

            expect(mockWithErrorHandling).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    clearError: expect.any(Function),
                    setError: expect.any(Function),
                    setLoading: expect.any(Function),
                })
            );

            // Test the handlers
            const handlerCall = mockWithErrorHandling.mock.calls[0];
            const handlers = handlerCall[1];

            expect(handlers.setLoading).toBeDefined();
            expect(handlers.clearError).toBeDefined();
            expect(handlers.setError).toBeDefined();
        });
    });

    describe("startSiteMonitoring", () => {
        it("should start site monitoring successfully", async () => {
            const siteId = "test-site-id";

            mockMonitoringService.startSiteMonitoring.mockResolvedValueOnce(undefined);

            await siteMonitoringActions.startSiteMonitoring(siteId);

            expect(mockLogStoreAction).toHaveBeenCalledWith("SitesStore", "startSiteMonitoring", {
                siteId,
            });
            expect(mockMonitoringService.startSiteMonitoring).toHaveBeenCalledWith(siteId);
            expect(mockWithErrorHandling).toHaveBeenCalled();
        });

        it("should handle errors when starting site monitoring", async () => {
            const siteId = "test-site-id";
            const error = new Error("Start monitoring failed");

            mockMonitoringService.startSiteMonitoring.mockRejectedValueOnce(error);

            await expect(siteMonitoringActions.startSiteMonitoring(siteId)).rejects.toThrow("Start monitoring failed");

            expect(mockMonitoringService.startSiteMonitoring).toHaveBeenCalledWith(siteId);
        });

        it("should call error handling with correct operation", async () => {
            const siteId = "test-site-id";

            mockMonitoringService.startSiteMonitoring.mockResolvedValueOnce(undefined);

            await siteMonitoringActions.startSiteMonitoring(siteId);

            const handlerCall = mockWithErrorHandling.mock.calls[0];
            const handlers = handlerCall[1];

            expect(handlers.setLoading).toBeDefined();
            expect(handlers.clearError).toBeDefined();
            expect(handlers.setError).toBeDefined();
        });
    });

    describe("startSiteMonitorMonitoring", () => {
        it("should start site monitor monitoring successfully", async () => {
            const siteId = "test-site-id";
            const monitorId = "test-monitor-id";

            mockMonitoringService.startMonitoring.mockResolvedValueOnce(undefined);

            await siteMonitoringActions.startSiteMonitorMonitoring(siteId, monitorId);

            expect(mockLogStoreAction).toHaveBeenCalledWith("SitesStore", "startSiteMonitorMonitoring", {
                monitorId,
                siteId,
            });
            expect(mockMonitoringService.startMonitoring).toHaveBeenCalledWith(siteId, monitorId);
        });

        it("should handle errors when starting site monitor monitoring", async () => {
            const siteId = "test-site-id";
            const monitorId = "test-monitor-id";
            const error = new Error("Start monitor monitoring failed");

            mockMonitoringService.startMonitoring.mockRejectedValueOnce(error);

            await expect(siteMonitoringActions.startSiteMonitorMonitoring(siteId, monitorId)).rejects.toThrow(
                "Start monitor monitoring failed"
            );

            expect(mockMonitoringService.startMonitoring).toHaveBeenCalledWith(siteId, monitorId);
        });

        it("should call error handling with correct operation", async () => {
            const siteId = "test-site-id";
            const monitorId = "test-monitor-id";

            mockMonitoringService.startMonitoring.mockResolvedValueOnce(undefined);

            await siteMonitoringActions.startSiteMonitorMonitoring(siteId, monitorId);

            const handlerCall = mockWithErrorHandling.mock.calls[0];
            const handlers = handlerCall[1];

            expect(handlers.setLoading).toBeDefined();
            expect(handlers.clearError).toBeDefined();
            expect(handlers.setError).toBeDefined();
        });
    });

    describe("stopSiteMonitoring", () => {
        it("should stop site monitoring successfully", async () => {
            const siteId = "test-site-id";

            mockMonitoringService.stopSiteMonitoring.mockResolvedValueOnce(undefined);

            await siteMonitoringActions.stopSiteMonitoring(siteId);

            expect(mockLogStoreAction).toHaveBeenCalledWith("SitesStore", "stopSiteMonitoring", {
                siteId,
            });
            expect(mockMonitoringService.stopSiteMonitoring).toHaveBeenCalledWith(siteId);
        });

        it("should handle errors when stopping site monitoring", async () => {
            const siteId = "test-site-id";
            const error = new Error("Stop monitoring failed");

            mockMonitoringService.stopSiteMonitoring.mockRejectedValueOnce(error);

            await expect(siteMonitoringActions.stopSiteMonitoring(siteId)).rejects.toThrow("Stop monitoring failed");

            expect(mockMonitoringService.stopSiteMonitoring).toHaveBeenCalledWith(siteId);
        });

        it("should call error handling with correct operation", async () => {
            const siteId = "test-site-id";

            mockMonitoringService.stopSiteMonitoring.mockResolvedValueOnce(undefined);

            await siteMonitoringActions.stopSiteMonitoring(siteId);

            const handlerCall = mockWithErrorHandling.mock.calls[0];
            const handlers = handlerCall[1];

            expect(handlers.setLoading).toBeDefined();
            expect(handlers.clearError).toBeDefined();
            expect(handlers.setError).toBeDefined();
        });
    });

    describe("stopSiteMonitorMonitoring", () => {
        it("should stop site monitor monitoring successfully", async () => {
            const siteId = "test-site-id";
            const monitorId = "test-monitor-id";

            mockMonitoringService.stopMonitoring.mockResolvedValueOnce(undefined);

            await siteMonitoringActions.stopSiteMonitorMonitoring(siteId, monitorId);

            expect(mockLogStoreAction).toHaveBeenCalledWith("SitesStore", "stopSiteMonitorMonitoring", {
                monitorId,
                siteId,
            });
            expect(mockMonitoringService.stopMonitoring).toHaveBeenCalledWith(siteId, monitorId);
        });

        it("should handle errors when stopping site monitor monitoring", async () => {
            const siteId = "test-site-id";
            const monitorId = "test-monitor-id";
            const error = new Error("Stop monitor monitoring failed");

            mockMonitoringService.stopMonitoring.mockRejectedValueOnce(error);

            await expect(siteMonitoringActions.stopSiteMonitorMonitoring(siteId, monitorId)).rejects.toThrow(
                "Stop monitor monitoring failed"
            );

            expect(mockMonitoringService.stopMonitoring).toHaveBeenCalledWith(siteId, monitorId);
        });

        it("should call error handling with correct operation", async () => {
            const siteId = "test-site-id";
            const monitorId = "test-monitor-id";

            mockMonitoringService.stopMonitoring.mockResolvedValueOnce(undefined);

            await siteMonitoringActions.stopSiteMonitorMonitoring(siteId, monitorId);

            const handlerCall = mockWithErrorHandling.mock.calls[0];
            const handlers = handlerCall[1];

            expect(handlers.setLoading).toBeDefined();
            expect(handlers.clearError).toBeDefined();
            expect(handlers.setError).toBeDefined();
        });
    });

    describe("Error Store Integration", () => {
        it("should use error store from getState", async () => {
            await siteMonitoringActions.checkSiteNow("site", "monitor");

            expect(mockUseErrorStore.getState).toHaveBeenCalled();
        });

        it("should handle error store methods", async () => {
            await siteMonitoringActions.checkSiteNow("site", "monitor");

            const handlerCall = mockWithErrorHandling.mock.calls[0];
            const handlers = handlerCall[1];

            // Test all error store methods
            expect(handlers.setLoading).toBeDefined();
            expect(handlers.clearError).toBeDefined();
            expect(handlers.setError).toBeDefined();

            // Test that they can be called
            handlers.setLoading(true);
            handlers.clearError();
            handlers.setError(new Error("test"));
        });
    });

    describe("Integration Tests", () => {
        it("should handle multiple operations in sequence", async () => {
            const siteId = "test-site-id";
            const monitorId = "test-monitor-id";

            mockSiteService.checkSiteNow.mockResolvedValue(undefined);
            mockMonitoringService.startSiteMonitoring.mockResolvedValue(undefined);
            mockMonitoringService.stopSiteMonitoring.mockResolvedValue(undefined);

            await siteMonitoringActions.checkSiteNow(siteId, monitorId);
            await siteMonitoringActions.startSiteMonitoring(siteId);
            await siteMonitoringActions.stopSiteMonitoring(siteId);

            expect(mockSiteService.checkSiteNow).toHaveBeenCalledWith(siteId, monitorId);
            expect(mockMonitoringService.startSiteMonitoring).toHaveBeenCalledWith(siteId);
            expect(mockMonitoringService.stopSiteMonitoring).toHaveBeenCalledWith(siteId);
        });

        it("should handle partial failures gracefully", async () => {
            const siteId = "test-site-id";
            const monitorId = "test-monitor-id";

            mockSiteService.checkSiteNow.mockResolvedValue(undefined);
            mockMonitoringService.startSiteMonitoring.mockRejectedValue(new Error("Failed"));
            mockMonitoringService.stopSiteMonitoring.mockResolvedValue(undefined);

            await siteMonitoringActions.checkSiteNow(siteId, monitorId);

            await expect(siteMonitoringActions.startSiteMonitoring(siteId)).rejects.toThrow("Failed");

            await siteMonitoringActions.stopSiteMonitoring(siteId);

            expect(mockSiteService.checkSiteNow).toHaveBeenCalledWith(siteId, monitorId);
            expect(mockMonitoringService.startSiteMonitoring).toHaveBeenCalledWith(siteId);
            expect(mockMonitoringService.stopSiteMonitoring).toHaveBeenCalledWith(siteId);
        });
    });
});
