/**
 * Test suite for uncovered lines in useSiteDetails hook
 * Targeting specific uncovered lines: 141-155, 164-170, 176-187, 192-201, 205-214, 220-222, 250
 * Focus: handleCheckNow, handleMonitorIdChange, handleRemoveSite, handleStartMonitoring, handleStopMonitoring
 */

import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

import type { Site, Monitor } from "../types";

import { useSiteDetails } from "../hooks/site/useSiteDetails";

// Mock all dependencies
vi.mock("../stores", () => ({
    useErrorStore: vi.fn(),
    useSitesStore: vi.fn(),
    useUIStore: vi.fn(),
}));

vi.mock("../hooks/site/useSiteAnalytics", () => ({
    useSiteAnalytics: vi.fn(() => ({
        data: null,
        error: null,
        loading: false,
    })),
}));

vi.mock("../services/logger", () => ({
    default: {
        error: vi.fn(),
        site: {
            error: vi.fn(),
            removed: vi.fn(),
        },
        user: {
            action: vi.fn(),
        },
    },
}));

import logger from "../services/logger";
// Import the mocked modules after setting up the mocks
import { useErrorStore, useSitesStore, useUIStore } from "../stores";

// Create mock global confirm
const mockConfirm = vi.fn();
Object.defineProperty(global, "confirm", {
    value: mockConfirm,
    writable: true,
});

describe("useSiteDetails uncovered lines", () => {
    const mockSite: Site = {
        identifier: "test-site-id",
        monitors: [
            {
                checkInterval: 30000,
                history: [],
                id: "monitor-1",
                monitoring: true,
                retryAttempts: 3,
                status: "up",
                timeout: 5000,
                type: "http",
                url: "https://test.com",
            } as Monitor,
            {
                checkInterval: 60000,
                history: [],
                id: "monitor-2",
                monitoring: false,
                retryAttempts: 1,
                status: "down",
                timeout: 10000,
                type: "port",
                url: "https://test2.com",
            } as Monitor,
        ],
        name: "Test Site",
    };

    // Mock store functions
    const mockClearError = vi.fn();
    const mockCheckSiteNow = vi.fn();
    const mockDeleteSite = vi.fn();
    const mockStartSiteMonitorMonitoring = vi.fn();
    const mockStopSiteMonitorMonitoring = vi.fn();
    const mockSetSelectedMonitorId = vi.fn();
    const mockSetActiveSiteDetailsTab = vi.fn();
    const mockGetSelectedMonitorId = vi.fn(() => "monitor-1");

    beforeEach(() => {
        vi.clearAllMocks();
        mockConfirm.mockReturnValue(true);

        // Mock store returns
        (useErrorStore as any).mockReturnValue({
            clearError: mockClearError,
            isLoading: false,
        });

        (useSitesStore as any).mockReturnValue({
            checkSiteNow: mockCheckSiteNow,
            deleteSite: mockDeleteSite,
            getSelectedMonitorId: mockGetSelectedMonitorId,
            modifySite: vi.fn(),
            setSelectedMonitorId: mockSetSelectedMonitorId,
            sites: [mockSite],
            startSiteMonitorMonitoring: mockStartSiteMonitorMonitoring,
            stopSiteMonitorMonitoring: mockStopSiteMonitorMonitoring,
            updateMonitorRetryAttempts: vi.fn(),
            updateMonitorTimeout: vi.fn(),
            updateSiteCheckInterval: vi.fn(),
        });

        (useUIStore as any).mockReturnValue({
            activeSiteDetailsTab: "overview",
            setActiveSiteDetailsTab: mockSetActiveSiteDetailsTab,
            setShowAdvancedMetrics: vi.fn(),
            setSiteDetailsChartTimeRange: vi.fn(),
            showAdvancedMetrics: false,
            siteDetailsChartTimeRange: "24h",
        });
    });

    describe("handleCheckNow - success path (lines 141-155)", () => {
        it("should successfully check site now with full logging", async () => {
            mockCheckSiteNow.mockResolvedValueOnce(undefined);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleCheckNow();
            });

            expect(mockClearError).toHaveBeenCalled();
            expect(logger.user.action).toHaveBeenCalledWith("Manual site check initiated", {
                monitorId: "monitor-1",
                monitorType: "http",
                siteId: "test-site-id",
                siteName: "Test Site",
            });
            expect(mockCheckSiteNow).toHaveBeenCalledWith("test-site-id", "monitor-1");
            expect(logger.user.action).toHaveBeenCalledWith("Manual site check completed successfully", {
                monitorId: "monitor-1",
                siteId: "test-site-id",
                siteName: "Test Site",
            });
        });

        it("should handle checkSiteNow error with Error object", async () => {
            const testError = new Error("Check failed");
            mockCheckSiteNow.mockRejectedValueOnce(testError);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleCheckNow();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", testError);
            expect(logger.error).toHaveBeenCalledWith("Manual site check failed", testError, {
                monitorId: "monitor-1",
                siteId: "test-site-id",
                siteName: "Test Site",
            });
        });

        it("should handle checkSiteNow error with string", async () => {
            const testError = "String error message";
            mockCheckSiteNow.mockRejectedValueOnce(testError);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleCheckNow();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", testError);
            expect(logger.error).toHaveBeenCalledWith("Manual site check failed", new Error(testError), {
                monitorId: "monitor-1",
                siteId: "test-site-id",
                siteName: "Test Site",
            });
        });
    });

    describe("handleMonitorIdChange (lines 164-170)", () => {
        it("should change monitor and update tab when analytics tab is active", () => {
            // Set active tab to analytics
            (useUIStore as any).mockReturnValue({
                activeSiteDetailsTab: "monitor-2-analytics",
                setActiveSiteDetailsTab: mockSetActiveSiteDetailsTab,
                setShowAdvancedMetrics: vi.fn(),
                setSiteDetailsChartTimeRange: vi.fn(),
                showAdvancedMetrics: false,
                siteDetailsChartTimeRange: "24h",
            });

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            const event = {
                target: { value: "monitor-2" },
            } as React.ChangeEvent<HTMLSelectElement>;

            act(() => {
                result.current.handleMonitorIdChange(event);
            });

            expect(mockSetSelectedMonitorId).toHaveBeenCalledWith("test-site-id", "monitor-2");
            expect(mockSetActiveSiteDetailsTab).toHaveBeenCalledWith("monitor-2-analytics");
        });

        it("should change monitor without updating tab when not analytics tab", () => {
            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            const event = {
                target: { value: "monitor-2" },
            } as React.ChangeEvent<HTMLSelectElement>;

            act(() => {
                result.current.handleMonitorIdChange(event);
            });

            expect(mockSetSelectedMonitorId).toHaveBeenCalledWith("test-site-id", "monitor-2");
            expect(mockSetActiveSiteDetailsTab).not.toHaveBeenCalled();
        });
    });

    describe("handleRemoveSite (lines 176-187)", () => {
        it("should remove site successfully after confirmation", async () => {
            mockConfirm.mockReturnValue(true);
            mockDeleteSite.mockResolvedValueOnce(undefined);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleRemoveSite();
            });

            expect(mockConfirm).toHaveBeenCalledWith("Are you sure you want to remove Test Site?");
            expect(mockClearError).toHaveBeenCalled();
            expect(mockDeleteSite).toHaveBeenCalledWith("test-site-id");
            expect(logger.site.removed).toHaveBeenCalledWith("test-site-id");
        });

        it("should handle site without name in confirmation", async () => {
            const siteWithoutName = { ...mockSite, name: "Unnamed Site" };
            mockConfirm.mockReturnValue(true);
            mockDeleteSite.mockResolvedValueOnce(undefined);

            // Mock store to return the site without name
            (useSitesStore as any).mockReturnValue({
                checkSiteNow: mockCheckSiteNow,
                deleteSite: mockDeleteSite,
                getSelectedMonitorId: mockGetSelectedMonitorId,
                modifySite: vi.fn(),
                setSelectedMonitorId: mockSetSelectedMonitorId,
                sites: [siteWithoutName],
                startSiteMonitorMonitoring: mockStartSiteMonitorMonitoring,
                stopSiteMonitorMonitoring: mockStopSiteMonitorMonitoring,
                updateMonitorRetryAttempts: vi.fn(),
                updateMonitorTimeout: vi.fn(),
                updateSiteCheckInterval: vi.fn(),
            });

            const { result } = renderHook(() => useSiteDetails({ site: siteWithoutName }));

            await act(async () => {
                await result.current.handleRemoveSite();
            });

            expect(mockConfirm).toHaveBeenCalledWith("Are you sure you want to remove test-site-id?");
        });

        it("should return early if user cancels confirmation", async () => {
            mockConfirm.mockReturnValue(false);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleRemoveSite();
            });

            expect(mockDeleteSite).not.toHaveBeenCalled();
        });

        it("should handle delete site error with Error object", async () => {
            mockConfirm.mockReturnValue(true);
            const testError = new Error("Delete failed");
            mockDeleteSite.mockRejectedValueOnce(testError);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleRemoveSite();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", testError);
        });

        it("should handle delete site error with string", async () => {
            mockConfirm.mockReturnValue(true);
            const testError = "Delete operation failed";
            mockDeleteSite.mockRejectedValueOnce(testError);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleRemoveSite();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", testError);
        });
    });

    describe("handleStartMonitoring (lines 192-201)", () => {
        it("should start monitoring successfully", async () => {
            mockStartSiteMonitorMonitoring.mockResolvedValueOnce(undefined);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleStartMonitoring();
            });

            expect(mockClearError).toHaveBeenCalled();
            expect(mockStartSiteMonitorMonitoring).toHaveBeenCalledWith("test-site-id", "monitor-1");
            expect(logger.user.action).toHaveBeenCalledWith("Started monitoring", {
                monitorId: "monitor-1",
                siteId: "test-site-id",
            });
        });

        it("should handle start monitoring error with Error object", async () => {
            const testError = new Error("Start monitoring failed");
            mockStartSiteMonitorMonitoring.mockRejectedValueOnce(testError);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleStartMonitoring();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", testError);
        });

        it("should handle start monitoring error with string", async () => {
            const testError = "Monitoring start failed";
            mockStartSiteMonitorMonitoring.mockRejectedValueOnce(testError);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleStartMonitoring();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", testError);
        });
    });

    describe("handleStopMonitoring (lines 205-214)", () => {
        it("should stop monitoring successfully", async () => {
            mockStopSiteMonitorMonitoring.mockResolvedValueOnce(undefined);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleStopMonitoring();
            });

            expect(mockClearError).toHaveBeenCalled();
            expect(mockStopSiteMonitorMonitoring).toHaveBeenCalledWith("test-site-id", "monitor-1");
            expect(logger.user.action).toHaveBeenCalledWith("Stopped monitoring", {
                monitorId: "monitor-1",
                siteId: "test-site-id",
            });
        });

        it("should handle stop monitoring error with Error object", async () => {
            const testError = new Error("Stop monitoring failed");
            mockStopSiteMonitorMonitoring.mockRejectedValueOnce(testError);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleStopMonitoring();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", testError);
        });

        it("should handle stop monitoring error with string", async () => {
            const testError = "Monitoring stop failed";
            mockStopSiteMonitorMonitoring.mockRejectedValueOnce(testError);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleStopMonitoring();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", testError);
        });
    });

    describe("handleIntervalChange (lines 220-222)", () => {
        it("should update interval and detect changes correctly", () => {
            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            const event = {
                target: { value: "60000" }, // Different from current 30000
            } as React.ChangeEvent<HTMLSelectElement>;

            act(() => {
                result.current.handleIntervalChange(event);
            });

            expect(result.current.localCheckInterval).toBe(60000);
            expect(result.current.intervalChanged).toBe(true);
        });

        it("should not detect change when interval matches monitor", () => {
            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            const event = {
                target: { value: "30000" }, // Same as current
            } as React.ChangeEvent<HTMLSelectElement>;

            act(() => {
                result.current.handleIntervalChange(event);
            });

            expect(result.current.localCheckInterval).toBe(30000);
            expect(result.current.intervalChanged).toBe(false);
        });
    });

    describe("timeout seconds calculation (line 250)", () => {
        it("should handle monitor with undefined timeout", () => {
            const siteWithUndefinedTimeout = {
                ...mockSite,
                monitors: [
                    {
                        ...mockSite.monitors[0],
                        timeout: undefined,
                    } as Monitor,
                ],
            };

            // Mock store to return the site with undefined timeout
            (useSitesStore as any).mockReturnValue({
                checkSiteNow: mockCheckSiteNow,
                deleteSite: mockDeleteSite,
                getSelectedMonitorId: mockGetSelectedMonitorId,
                modifySite: vi.fn(),
                setSelectedMonitorId: mockSetSelectedMonitorId,
                sites: [siteWithUndefinedTimeout],
                startSiteMonitorMonitoring: mockStartSiteMonitorMonitoring,
                stopSiteMonitorMonitoring: mockStopSiteMonitorMonitoring,
                updateMonitorRetryAttempts: vi.fn(),
                updateMonitorTimeout: vi.fn(),
                updateSiteCheckInterval: vi.fn(),
            });

            const { result } = renderHook(() => useSiteDetails({ site: siteWithUndefinedTimeout }));

            // Should use DEFAULT_REQUEST_TIMEOUT_SECONDS (10) when timeout is undefined
            expect(result.current.localTimeout).toBe(10); // DEFAULT_REQUEST_TIMEOUT_SECONDS
        });

        it("should calculate timeout in seconds from milliseconds", () => {
            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            // Monitor has 5000ms timeout, should be 5 seconds
            expect(result.current.localTimeout).toBe(5);
        });
    });

    describe("fallback site handling", () => {
        it("should handle site not found in sites array", () => {
            // Mock empty sites array
            (useSitesStore as any).mockReturnValue({
                checkSiteNow: mockCheckSiteNow,
                deleteSite: mockDeleteSite,
                getSelectedMonitorId: mockGetSelectedMonitorId,
                modifySite: vi.fn(),
                setSelectedMonitorId: mockSetSelectedMonitorId,
                sites: [], // No sites
                startSiteMonitorMonitoring: mockStartSiteMonitorMonitoring,
                stopSiteMonitorMonitoring: mockStopSiteMonitorMonitoring,
                updateMonitorRetryAttempts: vi.fn(),
                updateMonitorTimeout: vi.fn(),
                updateSiteCheckInterval: vi.fn(),
            });

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            // Should use fallback currentSite with just identifier and empty monitors
            expect(result.current.currentSite).toEqual({
                identifier: "test-site-id",
                monitors: [],
            });
            expect(result.current.siteExists).toBe(false);
        });
    });
});
