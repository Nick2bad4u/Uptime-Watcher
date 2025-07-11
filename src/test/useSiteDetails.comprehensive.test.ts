/**
 * Comprehensive test suite for useSiteDetails hook
 * Targeting coverage for lines 227-238, 245-252, 257-270, 276-280, 285-296, 301-315
 * Focus: error handling, save handlers, state changes, integration with stores
 */

import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

import type { Site, Monitor } from "../types";

import { useSiteDetails } from "../hooks/site/useSiteDetails";

// Mock all dependencies with factory functions to avoid hoisting issues
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
        site: {
            error: vi.fn(),
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

describe("useSiteDetails comprehensive coverage", () => {
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
                responseTime: 0,
            } as Monitor,
        ],
        name: "Test Site",
        monitoring: false
    };

    // Mock store functions
    const mockClearError = vi.fn();
    const mockUpdateSiteCheckInterval = vi.fn();
    const mockUpdateMonitorTimeout = vi.fn();
    const mockUpdateMonitorRetryAttempts = vi.fn();
    const mockModifySite = vi.fn();
    const mockSetSelectedMonitorId = vi.fn();
    const mockSetActiveSiteDetailsTab = vi.fn();
    const mockSetLocalName = vi.fn();
    const mockSetShowAdvancedMetrics = vi.fn();
    const mockSetSiteDetailsChartTimeRange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockConfirm.mockReturnValue(true);

        // Mock store returns
        (useErrorStore as any).mockReturnValue({
            clearError: mockClearError,
        });

        (useSitesStore as any).mockReturnValue({
            checkSiteNow: vi.fn(),
            deleteSite: vi.fn(),
            getSelectedMonitorId: vi.fn(() => "monitor-1"),
            modifySite: mockModifySite,
            selectedMonitorId: "monitor-1",
            setSelectedMonitorId: mockSetSelectedMonitorId,
            sites: [mockSite],
            startSiteMonitorMonitoring: vi.fn(),
            stopSiteMonitorMonitoring: vi.fn(),
            updateMonitorRetryAttempts: mockUpdateMonitorRetryAttempts,
            updateMonitorTimeout: mockUpdateMonitorTimeout,
            updateSiteCheckInterval: mockUpdateSiteCheckInterval,
        });

        (useUIStore as any).mockReturnValue({
            activeSiteDetailsTab: "overview",
            setActiveSiteDetailsTab: mockSetActiveSiteDetailsTab,
            setLocalName: mockSetLocalName,
            setShowAdvancedMetrics: mockSetShowAdvancedMetrics,
            setSiteDetailsChartTimeRange: mockSetSiteDetailsChartTimeRange,
            showAdvancedMetrics: false,
            siteDetailsChartTimeRange: "24h",
        });
    });

    describe("handleSaveInterval error handling (lines 227-238)", () => {
        it("should handle successful interval save", async () => {
            mockUpdateSiteCheckInterval.mockResolvedValueOnce(undefined);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleSaveInterval();
            });

            expect(mockClearError).toHaveBeenCalled();
            expect(mockUpdateSiteCheckInterval).toHaveBeenCalledWith("test-site-id", "monitor-1", 30000);
        });

        it("should handle interval save error with Error object", async () => {
            const testError = new Error("Update failed");
            mockUpdateSiteCheckInterval.mockRejectedValueOnce(testError);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleSaveInterval();
            });

            expect(mockClearError).toHaveBeenCalled();
            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", testError);
        });

        it("should handle interval save error with string", async () => {
            const testError = "String error message";
            mockUpdateSiteCheckInterval.mockRejectedValueOnce(testError);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleSaveInterval();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", testError);
        });
    });

    describe("handleTimeoutChange logic (lines 245-252)", () => {
        it("should update timeout and detect changes", () => {
            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            const event = {
                target: { value: "10" },
            } as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleTimeoutChange(event);
            });

            // Should detect change from default timeout (5 seconds) to 10 seconds
            expect(result.current.timeoutChanged).toBe(true);
        });

        it("should not detect change when timeout matches monitor", () => {
            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            const event = {
                target: { value: "5" }, // Same as monitor timeout (5000ms / 1000)
            } as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleTimeoutChange(event);
            });

            expect(result.current.timeoutChanged).toBe(false);
        });

        it("should handle timeout change when no selectedMonitor timeout", () => {
            const siteWithoutTimeout = {
                ...mockSite,
                monitors: [
                    {
                        ...mockSite.monitors[0],
                        timeout: undefined,
                    } as unknown as Monitor,
                ],
            };

            const { result } = renderHook(() => useSiteDetails({ site: siteWithoutTimeout }));

            const event = {
                target: { value: "15" }, // Different from DEFAULT_REQUEST_TIMEOUT_SECONDS (30)
            } as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleTimeoutChange(event);
            });

            expect(result.current.timeoutChanged).toBe(true);
        });
    });

    describe("handleSaveTimeout error handling (lines 257-270)", () => {
        it("should handle successful timeout save", async () => {
            mockUpdateMonitorTimeout.mockResolvedValueOnce(undefined);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            // Set a different timeout first
            const event = {
                target: { value: "10" },
            } as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleTimeoutChange(event);
            });

            await act(async () => {
                await result.current.handleSaveTimeout();
            });

            expect(mockClearError).toHaveBeenCalled();
            expect(mockUpdateMonitorTimeout).toHaveBeenCalledWith(
                "test-site-id",
                "monitor-1",
                10000 // 10 seconds * 1000 = 10000ms
            );
        });

        it("should handle timeout save error with Error object", async () => {
            const testError = new Error("Timeout update failed");
            mockUpdateMonitorTimeout.mockRejectedValueOnce(testError);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleSaveTimeout();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", testError);
        });

        it("should handle timeout save error with non-Error object", async () => {
            const testError = { message: "Unknown error" };
            mockUpdateMonitorTimeout.mockRejectedValueOnce(testError);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleSaveTimeout();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", "[object Object]");
        });
    });

    describe("handleRetryAttemptsChange logic (lines 276-280)", () => {
        it("should update retry attempts and detect changes", () => {
            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            const event = {
                target: { value: "5" },
            } as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleRetryAttemptsChange(event);
            });

            // Should detect change from monitor's retryAttempts (3) to 5
            expect(result.current.retryAttemptsChanged).toBe(true);
        });

        it("should not detect change when retry attempts match monitor", () => {
            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            const event = {
                target: { value: "3" }, // Same as monitor retryAttempts
            } as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleRetryAttemptsChange(event);
            });

            expect(result.current.retryAttemptsChanged).toBe(false);
        });

        it("should handle retry attempts change when monitor has no retryAttempts", () => {
            const siteWithoutRetryAttempts = {
                ...mockSite,
                monitors: [
                    {
                        ...mockSite.monitors[0],
                        retryAttempts: undefined,
                    } as unknown as Monitor,
                ],
            };

            const { result } = renderHook(() => useSiteDetails({ site: siteWithoutRetryAttempts }));

            const event = {
                target: { value: "2" },
            } as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleRetryAttemptsChange(event);
            });

            // Should detect change from default 0 to 2
            expect(result.current.retryAttemptsChanged).toBe(true);
        });
    });

    describe("handleSaveRetryAttempts error handling (lines 285-296)", () => {
        it("should handle successful retry attempts save", async () => {
            mockUpdateMonitorRetryAttempts.mockResolvedValueOnce(undefined);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            // Set different retry attempts first
            const event = {
                target: { value: "5" },
            } as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleRetryAttemptsChange(event);
            });

            await act(async () => {
                await result.current.handleSaveRetryAttempts();
            });

            expect(mockClearError).toHaveBeenCalled();
            expect(mockUpdateMonitorRetryAttempts).toHaveBeenCalledWith("test-site-id", "monitor-1", 5);
        });

        it("should handle retry attempts save error with Error object", async () => {
            const testError = new Error("Retry attempts update failed");
            mockUpdateMonitorRetryAttempts.mockRejectedValueOnce(testError);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleSaveRetryAttempts();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", testError);
        });

        it("should handle retry attempts save error with string", async () => {
            const testError = "String error message";
            mockUpdateMonitorRetryAttempts.mockRejectedValueOnce(testError);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            await act(async () => {
                await result.current.handleSaveRetryAttempts();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", testError);
        });
    });

    describe("handleSaveName logic and error handling (lines 301-315)", () => {
        it("should return early if no unsaved changes", async () => {
            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            // hasUnsavedChanges should be false initially
            await act(async () => {
                await result.current.handleSaveName();
            });

            expect(mockModifySite).not.toHaveBeenCalled();
        });

        it("should handle successful name save with trimmed name", async () => {
            mockModifySite.mockResolvedValueOnce(undefined);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            // Simulate name change to create unsaved changes
            act(() => {
                result.current.setLocalName("  New Site Name  ");
            });

            // Wait for hasUnsavedChanges to update
            await act(async () => {
                await result.current.handleSaveName();
            });

            expect(mockClearError).toHaveBeenCalled();
            expect(mockModifySite).toHaveBeenCalledWith("test-site-id", {
                name: "New Site Name",
            });
        });

        it("should not save if trimmed name is empty", async () => {
            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            // Simulate name change to whitespace only
            act(() => {
                result.current.setLocalName("   ");
            });

            await act(async () => {
                await result.current.handleSaveName();
            });

            expect(mockModifySite).not.toHaveBeenCalled();
        });

        it("should handle name save error with Error object", async () => {
            const testError = new Error("Name update failed");
            mockModifySite.mockRejectedValueOnce(testError);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            // Simulate name change
            act(() => {
                result.current.setLocalName("New Name");
            });

            await act(async () => {
                await result.current.handleSaveName();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", testError);
        });

        it("should handle name save error with non-Error object", async () => {
            const testError = { code: 500, message: "Server error" };
            mockModifySite.mockRejectedValueOnce(testError);

            const { result } = renderHook(() => useSiteDetails({ site: mockSite }));

            // Simulate name change
            act(() => {
                result.current.setLocalName("New Name");
            });

            await act(async () => {
                await result.current.handleSaveName();
            });

            expect(logger.site.error).toHaveBeenCalledWith("test-site-id", "[object Object]");
        });
    });
});
