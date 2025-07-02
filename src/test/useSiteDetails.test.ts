/**
 * Comprehensive test suite for useSiteDetails hook
 * 
 * Tests all functionality including:
 * - Hook initialization and state management
 * - Monitor selection and switching
 * - Site monitoring controls (start/stop/check now)
 * - Settings management (intervals, timeouts, retry attempts, name)
 * - UI state synchronization with store
 * - Error handling and edge cases
 * - Analytics integration
 * - Local state tracking and unsaved changes
 */

import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_CHECK_INTERVAL, DEFAULT_REQUEST_TIMEOUT_SECONDS } from "../constants";
import { useSiteDetails } from "../hooks/site/useSiteDetails";
import { Site, Monitor } from "../types";
import type { ChartTimeRange } from "../store";

// Mock the store
const mockStore = {
    activeSiteDetailsTab: "overview",
    checkSiteNow: vi.fn(),
    clearError: vi.fn(),
    deleteSite: vi.fn(),
    getSelectedMonitorId: vi.fn(),
    isLoading: false,
    modifySite: vi.fn(),
    setActiveSiteDetailsTab: vi.fn(),
    setSelectedMonitorId: vi.fn(),
    setShowAdvancedMetrics: vi.fn(),
    setSiteDetailsChartTimeRange: vi.fn(),
    showAdvancedMetrics: true,
    siteDetailsChartTimeRange: "24h" as ChartTimeRange,
    sites: [] as Site[],
    startSiteMonitorMonitoring: vi.fn(),
    stopSiteMonitorMonitoring: vi.fn(),
    updateMonitorRetryAttempts: vi.fn(),
    updateMonitorTimeout: vi.fn(),
    updateSiteCheckInterval: vi.fn(),
};

vi.mock("../store", () => ({
    useStore: () => mockStore,
}));

// Mock logger
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

// Mock useSiteAnalytics
const mockAnalytics = {
    totalChecks: 10,
    upCount: 8,
    downCount: 2,
    uptime: "80.00",
    avgResponseTime: 150,
    fastestResponse: 100,
    slowestResponse: 300,
    p50: 140,
    p95: 250,
    p99: 280,
    downtimePeriods: [],
    totalDowntime: 0,
    mttr: 0,
    incidentCount: 0,
    filteredHistory: [],
};

vi.mock("../hooks/site/useSiteAnalytics", () => ({
    useSiteAnalytics: vi.fn(() => mockAnalytics),
}));

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
    writable: true,
    value: vi.fn(() => true),
});

describe("useSiteDetails", () => {
    const createMonitor = (
        id: string,
        type: "http" | "port" = "http",
        overrides: Partial<Monitor> = {}
    ): Monitor => ({
        id,
        type,
        url: type === "http" ? "https://example.com" : undefined,
        host: type === "port" ? "example.com" : undefined,
        port: type === "port" ? 8080 : undefined,
        status: "up",
        history: [],
        monitoring: true,
        checkInterval: DEFAULT_CHECK_INTERVAL,
        timeout: DEFAULT_REQUEST_TIMEOUT_SECONDS * 1000,
        retryAttempts: 3,
        ...overrides,
    });

    const createSite = (identifier: string, overrides: Partial<Site> = {}): Site => ({
        identifier,
        name: `Site ${identifier}`,
        monitors: [createMonitor(`${identifier}-monitor-1`)],
        ...overrides,
    });

    beforeEach(() => {
        vi.clearAllMocks();
        mockStore.sites = [];
        mockStore.activeSiteDetailsTab = "overview";
        mockStore.isLoading = false;
        mockStore.showAdvancedMetrics = true;
        mockStore.siteDetailsChartTimeRange = "24h";
        mockStore.getSelectedMonitorId.mockReturnValue(null);
    });

    describe("Hook Initialization", () => {
        it("should initialize with default values when site exists in store", () => {
            const site = createSite("test-site");
            mockStore.sites = [site];
            mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);

            const { result } = renderHook(() => useSiteDetails({ site }));

            expect(result.current.currentSite).toEqual(site);
            expect(result.current.selectedMonitor).toEqual(site.monitors[0]);
            expect(result.current.selectedMonitorId).toBe(site.monitors[0].id);
            expect(result.current.isMonitoring).toBe(true);
            expect(result.current.siteExists).toBe(true);
            expect(result.current.localCheckInterval).toBe(DEFAULT_CHECK_INTERVAL);
            expect(result.current.localTimeout).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
            expect(result.current.localRetryAttempts).toBe(3);
            expect(result.current.localName).toBe(site.name);
            expect(result.current.hasUnsavedChanges).toBe(false);
            expect(result.current.intervalChanged).toBe(false);
            expect(result.current.timeoutChanged).toBe(false);
            expect(result.current.retryAttemptsChanged).toBe(false);
        });

        it("should initialize with fallback values when site does not exist in store", () => {
            const site = createSite("missing-site");
            mockStore.sites = [];

            const { result } = renderHook(() => useSiteDetails({ site }));

            expect(result.current.currentSite).toEqual({
                identifier: "missing-site",
                monitors: [],
            });
            expect(result.current.selectedMonitor).toBeUndefined();
            expect(result.current.selectedMonitorId).toBe("");
            expect(result.current.siteExists).toBe(false);
            expect(result.current.localName).toBe("");
        });

        it("should initialize with first monitor when no monitor is selected", () => {
            const site = createSite("test-site", {
                monitors: [
                    createMonitor("monitor-1"),
                    createMonitor("monitor-2"),
                ],
            });
            mockStore.sites = [site];
            mockStore.getSelectedMonitorId.mockReturnValue(null);

            const { result } = renderHook(() => useSiteDetails({ site }));

            expect(result.current.selectedMonitor).toEqual(site.monitors[0]);
            expect(result.current.selectedMonitorId).toBe("monitor-1");
        });

        it("should handle monitor with custom settings", () => {
            const customMonitor = createMonitor("custom-monitor", "http", {
                checkInterval: 60000,
                timeout: 15000,
                retryAttempts: 5,
                monitoring: false,
            });
            const site = createSite("test-site", {
                monitors: [customMonitor],
            });
            mockStore.sites = [site];
            mockStore.getSelectedMonitorId.mockReturnValue(customMonitor.id);

            const { result } = renderHook(() => useSiteDetails({ site }));

            expect(result.current.localCheckInterval).toBe(60000);
            expect(result.current.localTimeout).toBe(15); // Converted from ms to seconds
            expect(result.current.localRetryAttempts).toBe(5);
            expect(result.current.isMonitoring).toBe(false);
        });
    });

    describe("Monitor Selection", () => {
        it("should handle monitor selection change", () => {
            const site = createSite("test-site", {
                monitors: [
                    createMonitor("monitor-1"),
                    createMonitor("monitor-2"),
                ],
            });
            mockStore.sites = [site];
            mockStore.getSelectedMonitorId.mockReturnValue("monitor-1");

            const { result } = renderHook(() => useSiteDetails({ site }));

            const mockEvent = {
                target: { value: "monitor-2" },
            } as React.ChangeEvent<HTMLSelectElement>;

            act(() => {
                result.current.handleMonitorIdChange(mockEvent);
            });

            expect(mockStore.setSelectedMonitorId).toHaveBeenCalledWith("test-site", "monitor-2");
        });

        it("should switch to analytics tab when monitor changes and current tab is analytics", () => {
            const site = createSite("test-site", {
                monitors: [
                    createMonitor("monitor-1"),
                    createMonitor("monitor-2"),
                ],
            });
            mockStore.sites = [site];
            mockStore.activeSiteDetailsTab = "monitor-1-analytics";
            mockStore.getSelectedMonitorId.mockReturnValue("monitor-1");

            const { result } = renderHook(() => useSiteDetails({ site }));

            const mockEvent = {
                target: { value: "monitor-2" },
            } as React.ChangeEvent<HTMLSelectElement>;

            act(() => {
                result.current.handleMonitorIdChange(mockEvent);
            });

            expect(mockStore.setActiveSiteDetailsTab).toHaveBeenCalledWith("monitor-2-analytics");
        });

        it("should not switch tab when monitor changes and current tab is not analytics", () => {
            const site = createSite("test-site", {
                monitors: [
                    createMonitor("monitor-1"),
                    createMonitor("monitor-2"),
                ],
            });
            mockStore.sites = [site];
            mockStore.activeSiteDetailsTab = "overview";
            mockStore.getSelectedMonitorId.mockReturnValue("monitor-1");

            const { result } = renderHook(() => useSiteDetails({ site }));

            const mockEvent = {
                target: { value: "monitor-2" },
            } as React.ChangeEvent<HTMLSelectElement>;

            act(() => {
                result.current.handleMonitorIdChange(mockEvent);
            });

            expect(mockStore.setActiveSiteDetailsTab).not.toHaveBeenCalled();
        });
    });

    describe("Monitoring Controls", () => {
        describe("handleCheckNow", () => {
            it("should check site now successfully", async () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                mockStore.checkSiteNow.mockResolvedValue(undefined);

                const { result } = renderHook(() => useSiteDetails({ site }));

                await act(async () => {
                    await result.current.handleCheckNow();
                });

                expect(mockStore.clearError).toHaveBeenCalled();
                expect(mockStore.checkSiteNow).toHaveBeenCalledWith("test-site", site.monitors[0].id);
            });

            it("should handle check now errors", async () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                const error = new Error("Check failed");
                mockStore.checkSiteNow.mockRejectedValue(error);

                const { result } = renderHook(() => useSiteDetails({ site }));

                await act(async () => {
                    await result.current.handleCheckNow();
                });

                expect(mockStore.clearError).toHaveBeenCalled();
                expect(mockStore.checkSiteNow).toHaveBeenCalledWith("test-site", site.monitors[0].id);
            });
        });

        describe("handleStartMonitoring", () => {
            it("should start monitoring successfully", async () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                mockStore.startSiteMonitorMonitoring.mockResolvedValue(undefined);

                const { result } = renderHook(() => useSiteDetails({ site }));

                await act(async () => {
                    await result.current.handleStartMonitoring();
                });

                expect(mockStore.clearError).toHaveBeenCalled();
                expect(mockStore.startSiteMonitorMonitoring).toHaveBeenCalledWith("test-site", site.monitors[0].id);
            });

            it("should handle start monitoring errors", async () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                const error = new Error("Start monitoring failed");
                mockStore.startSiteMonitorMonitoring.mockRejectedValue(error);

                const { result } = renderHook(() => useSiteDetails({ site }));

                await act(async () => {
                    await result.current.handleStartMonitoring();
                });

                expect(mockStore.clearError).toHaveBeenCalled();
                expect(mockStore.startSiteMonitorMonitoring).toHaveBeenCalledWith("test-site", site.monitors[0].id);
            });
        });

        describe("handleStopMonitoring", () => {
            it("should stop monitoring successfully", async () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                mockStore.stopSiteMonitorMonitoring.mockResolvedValue(undefined);

                const { result } = renderHook(() => useSiteDetails({ site }));

                await act(async () => {
                    await result.current.handleStopMonitoring();
                });

                expect(mockStore.clearError).toHaveBeenCalled();
                expect(mockStore.stopSiteMonitorMonitoring).toHaveBeenCalledWith("test-site", site.monitors[0].id);
            });

            it("should handle stop monitoring errors", async () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                const error = new Error("Stop monitoring failed");
                mockStore.stopSiteMonitorMonitoring.mockRejectedValue(error);

                const { result } = renderHook(() => useSiteDetails({ site }));

                await act(async () => {
                    await result.current.handleStopMonitoring();
                });

                expect(mockStore.clearError).toHaveBeenCalled();
                expect(mockStore.stopSiteMonitorMonitoring).toHaveBeenCalledWith("test-site", site.monitors[0].id);
            });
        });
    });

    describe("Site Management", () => {
        describe("handleRemoveSite", () => {
            it("should remove site after confirmation", async () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                mockStore.deleteSite.mockResolvedValue(undefined);
                window.confirm = vi.fn(() => true);

                const { result } = renderHook(() => useSiteDetails({ site }));

                await act(async () => {
                    await result.current.handleRemoveSite();
                });

                expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to remove Site test-site?");
                expect(mockStore.clearError).toHaveBeenCalled();
                expect(mockStore.deleteSite).toHaveBeenCalledWith("test-site");
            });

            it("should not remove site when user cancels", async () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                window.confirm = vi.fn(() => false);

                const { result } = renderHook(() => useSiteDetails({ site }));

                await act(async () => {
                    await result.current.handleRemoveSite();
                });

                expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to remove Site test-site?");
                expect(mockStore.deleteSite).not.toHaveBeenCalled();
            });

            it("should handle remove site errors", async () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                const error = new Error("Delete failed");
                mockStore.deleteSite.mockRejectedValue(error);
                window.confirm = vi.fn(() => true);

                const { result } = renderHook(() => useSiteDetails({ site }));

                await act(async () => {
                    await result.current.handleRemoveSite();
                });

                expect(mockStore.clearError).toHaveBeenCalled();
                expect(mockStore.deleteSite).toHaveBeenCalledWith("test-site");
            });

            it("should use identifier when site has no name", async () => {
                const site = createSite("test-site", { name: undefined });
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                window.confirm = vi.fn(() => true);

                const { result } = renderHook(() => useSiteDetails({ site }));

                await act(async () => {
                    await result.current.handleRemoveSite();
                });

                expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to remove test-site?");
            });
        });
    });

    describe("Settings Management", () => {
        describe("Check Interval", () => {
            it("should handle interval change", () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);

                const { result } = renderHook(() => useSiteDetails({ site }));

                const mockEvent = {
                    target: { value: "120000" },
                } as React.ChangeEvent<HTMLSelectElement>;

                act(() => {
                    result.current.handleIntervalChange(mockEvent);
                });

                expect(result.current.localCheckInterval).toBe(120000);
                expect(result.current.intervalChanged).toBe(true);
            });

            it("should not mark as changed when value equals current monitor interval", () => {
                const site = createSite("test-site", {
                    monitors: [createMonitor("monitor-1", "http", { checkInterval: 60000 })],
                });
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);

                const { result } = renderHook(() => useSiteDetails({ site }));

                const mockEvent = {
                    target: { value: "60000" },
                } as React.ChangeEvent<HTMLSelectElement>;

                act(() => {
                    result.current.handleIntervalChange(mockEvent);
                });

                expect(result.current.localCheckInterval).toBe(60000);
                expect(result.current.intervalChanged).toBe(false);
            });

            it("should save interval successfully", async () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                mockStore.updateSiteCheckInterval.mockResolvedValue(undefined);

                const { result } = renderHook(() => useSiteDetails({ site }));

                // Change interval first
                act(() => {
                    result.current.handleIntervalChange({
                        target: { value: "120000" },
                    } as React.ChangeEvent<HTMLSelectElement>);
                });

                await act(async () => {
                    await result.current.handleSaveInterval();
                });

                expect(mockStore.clearError).toHaveBeenCalled();
                expect(mockStore.updateSiteCheckInterval).toHaveBeenCalledWith("test-site", site.monitors[0].id, 120000);
                expect(result.current.intervalChanged).toBe(false);
            });

            it("should handle save interval errors", async () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                const error = new Error("Update failed");
                mockStore.updateSiteCheckInterval.mockRejectedValue(error);

                const { result } = renderHook(() => useSiteDetails({ site }));

                await act(async () => {
                    await result.current.handleSaveInterval();
                });

                expect(mockStore.clearError).toHaveBeenCalled();
                expect(mockStore.updateSiteCheckInterval).toHaveBeenCalledWith("test-site", site.monitors[0].id, DEFAULT_CHECK_INTERVAL);
            });
        });

        describe("Timeout", () => {
            it("should handle timeout change", () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);

                const { result } = renderHook(() => useSiteDetails({ site }));

                const mockEvent = {
                    target: { value: "20" },
                } as React.ChangeEvent<HTMLInputElement>;

                act(() => {
                    result.current.handleTimeoutChange(mockEvent);
                });

                expect(result.current.localTimeout).toBe(20);
                expect(result.current.timeoutChanged).toBe(true);
            });

            it("should not mark as changed when value equals current monitor timeout", () => {
                const site = createSite("test-site", {
                    monitors: [createMonitor("monitor-1", "http", { timeout: 15000 })],
                });
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);

                const { result } = renderHook(() => useSiteDetails({ site }));

                const mockEvent = {
                    target: { value: "15" },
                } as React.ChangeEvent<HTMLInputElement>;

                act(() => {
                    result.current.handleTimeoutChange(mockEvent);
                });

                expect(result.current.localTimeout).toBe(15);
                expect(result.current.timeoutChanged).toBe(false);
            });

            it("should handle timeout change when monitor has no timeout", () => {
                const site = createSite("test-site", {
                    monitors: [createMonitor("monitor-1", "http", { timeout: undefined })],
                });
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);

                const { result } = renderHook(() => useSiteDetails({ site }));

                const mockEvent = {
                    target: { value: "20" },
                } as React.ChangeEvent<HTMLInputElement>;

                act(() => {
                    result.current.handleTimeoutChange(mockEvent);
                });

                expect(result.current.localTimeout).toBe(20);
                expect(result.current.timeoutChanged).toBe(true);
            });

            it("should save timeout successfully", async () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                mockStore.updateMonitorTimeout.mockResolvedValue(undefined);

                const { result } = renderHook(() => useSiteDetails({ site }));

                // Change timeout first
                act(() => {
                    result.current.handleTimeoutChange({
                        target: { value: "20" },
                    } as React.ChangeEvent<HTMLInputElement>);
                });

                await act(async () => {
                    await result.current.handleSaveTimeout();
                });

                expect(mockStore.clearError).toHaveBeenCalled();
                expect(mockStore.updateMonitorTimeout).toHaveBeenCalledWith("test-site", site.monitors[0].id, 20000); // Converted to ms
                expect(result.current.timeoutChanged).toBe(false);
            });

            it("should handle save timeout errors", async () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                const error = new Error("Update failed");
                mockStore.updateMonitorTimeout.mockRejectedValue(error);

                const { result } = renderHook(() => useSiteDetails({ site }));

                await act(async () => {
                    await result.current.handleSaveTimeout();
                });

                expect(mockStore.clearError).toHaveBeenCalled();
                expect(mockStore.updateMonitorTimeout).toHaveBeenCalledWith("test-site", site.monitors[0].id, DEFAULT_REQUEST_TIMEOUT_SECONDS * 1000);
            });
        });

        describe("Retry Attempts", () => {
            it("should handle retry attempts change", () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);

                const { result } = renderHook(() => useSiteDetails({ site }));

                const mockEvent = {
                    target: { value: "5" },
                } as React.ChangeEvent<HTMLInputElement>;

                act(() => {
                    result.current.handleRetryAttemptsChange(mockEvent);
                });

                expect(result.current.localRetryAttempts).toBe(5);
                expect(result.current.retryAttemptsChanged).toBe(true);
            });

            it("should not mark as changed when value equals current monitor retry attempts", () => {
                const site = createSite("test-site", {
                    monitors: [createMonitor("monitor-1", "http", { retryAttempts: 5 })],
                });
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);

                const { result } = renderHook(() => useSiteDetails({ site }));

                const mockEvent = {
                    target: { value: "5" },
                } as React.ChangeEvent<HTMLInputElement>;

                act(() => {
                    result.current.handleRetryAttemptsChange(mockEvent);
                });

                expect(result.current.localRetryAttempts).toBe(5);
                expect(result.current.retryAttemptsChanged).toBe(false);
            });

            it("should save retry attempts successfully", async () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                mockStore.updateMonitorRetryAttempts.mockResolvedValue(undefined);

                const { result } = renderHook(() => useSiteDetails({ site }));

                // Change retry attempts first
                act(() => {
                    result.current.handleRetryAttemptsChange({
                        target: { value: "5" },
                    } as React.ChangeEvent<HTMLInputElement>);
                });

                await act(async () => {
                    await result.current.handleSaveRetryAttempts();
                });

                expect(mockStore.clearError).toHaveBeenCalled();
                expect(mockStore.updateMonitorRetryAttempts).toHaveBeenCalledWith("test-site", site.monitors[0].id, 5);
                expect(result.current.retryAttemptsChanged).toBe(false);
            });

            it("should handle save retry attempts errors", async () => {
                const site = createSite("test-site");
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                const error = new Error("Update failed");
                mockStore.updateMonitorRetryAttempts.mockRejectedValue(error);

                const { result } = renderHook(() => useSiteDetails({ site }));

                await act(async () => {
                    await result.current.handleSaveRetryAttempts();
                });

                expect(mockStore.clearError).toHaveBeenCalled();
                expect(mockStore.updateMonitorRetryAttempts).toHaveBeenCalledWith("test-site", site.monitors[0].id, 3);
            });
        });

        describe("Site Name", () => {
            it("should track name changes", () => {
                const site = createSite("test-site", { name: "Original Name" });
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);

                const { result } = renderHook(() => useSiteDetails({ site }));

                expect(result.current.localName).toBe("Original Name");
                expect(result.current.hasUnsavedChanges).toBe(false);

                act(() => {
                    result.current.setLocalName("New Name");
                });

                expect(result.current.localName).toBe("New Name");
                expect(result.current.hasUnsavedChanges).toBe(true);
            });

            it("should save name successfully", async () => {
                const site = createSite("test-site", { name: "Original Name" });
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                mockStore.modifySite.mockResolvedValue(undefined);

                const { result } = renderHook(() => useSiteDetails({ site }));

                // Change name first
                act(() => {
                    result.current.setLocalName("New Name");
                });

                await act(async () => {
                    await result.current.handleSaveName();
                });

                expect(mockStore.clearError).toHaveBeenCalled();
                expect(mockStore.modifySite).toHaveBeenCalledWith("test-site", { name: "New Name" });
                expect(result.current.hasUnsavedChanges).toBe(false);
            });

            it("should not save when no changes", async () => {
                const site = createSite("test-site", { name: "Original Name" });
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);

                const { result } = renderHook(() => useSiteDetails({ site }));

                await act(async () => {
                    await result.current.handleSaveName();
                });

                expect(mockStore.modifySite).not.toHaveBeenCalled();
            });

            it("should handle empty name by setting to undefined", async () => {
                const site = createSite("test-site", { name: "Original Name" });
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                mockStore.modifySite.mockResolvedValue(undefined);

                const { result } = renderHook(() => useSiteDetails({ site }));

                // Change name to empty string
                act(() => {
                    result.current.setLocalName("   ");
                });

                await act(async () => {
                    await result.current.handleSaveName();
                });

                expect(mockStore.modifySite).toHaveBeenCalledWith("test-site", { name: undefined });
            });

            it("should handle save name errors", async () => {
                const site = createSite("test-site", { name: "Original Name" });
                mockStore.sites = [site];
                mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
                const error = new Error("Update failed");
                mockStore.modifySite.mockRejectedValue(error);

                const { result } = renderHook(() => useSiteDetails({ site }));

                // Change name first
                act(() => {
                    result.current.setLocalName("New Name");
                });

                await act(async () => {
                    await result.current.handleSaveName();
                });

                expect(mockStore.clearError).toHaveBeenCalled();
                expect(mockStore.modifySite).toHaveBeenCalledWith("test-site", { name: "New Name" });
            });
        });
    });

    describe("State Synchronization", () => {
        it("should update local state when monitor changes", () => {
            const site = createSite("test-site", {
                monitors: [
                    createMonitor("monitor-1", "http", { checkInterval: 60000, timeout: 15000, retryAttempts: 3 }),
                    createMonitor("monitor-2", "http", { checkInterval: 120000, timeout: 30000, retryAttempts: 5 }),
                ],
            });
            mockStore.sites = [site];
            mockStore.getSelectedMonitorId.mockReturnValue("monitor-1");

            const { result, rerender } = renderHook(() => useSiteDetails({ site }));

            expect(result.current.localCheckInterval).toBe(60000);
            expect(result.current.localTimeout).toBe(15);
            expect(result.current.localRetryAttempts).toBe(3);

            // Change selected monitor
            mockStore.getSelectedMonitorId.mockReturnValue("monitor-2");
            site.monitors[1] = createMonitor("monitor-2", "http", { checkInterval: 120000, timeout: 30000, retryAttempts: 5 });
            mockStore.sites = [site];

            rerender();

            expect(result.current.localCheckInterval).toBe(120000);
            expect(result.current.localTimeout).toBe(30);
            expect(result.current.localRetryAttempts).toBe(5);
            expect(result.current.intervalChanged).toBe(false);
            expect(result.current.timeoutChanged).toBe(false);
            expect(result.current.retryAttemptsChanged).toBe(false);
        });

        it("should expose store state correctly", () => {
            const site = createSite("test-site");
            mockStore.sites = [site];
            mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);
            mockStore.activeSiteDetailsTab = "settings";
            mockStore.isLoading = true;
            mockStore.showAdvancedMetrics = false;
            mockStore.siteDetailsChartTimeRange = "7d";

            const { result } = renderHook(() => useSiteDetails({ site }));

            expect(result.current.activeSiteDetailsTab).toBe("settings");
            expect(result.current.isLoading).toBe(true);
            expect(result.current.showAdvancedMetrics).toBe(false);
            expect(result.current.siteDetailsChartTimeRange).toBe("7d");
            expect(result.current.setActiveSiteDetailsTab).toBe(mockStore.setActiveSiteDetailsTab);
            expect(result.current.setShowAdvancedMetrics).toBe(mockStore.setShowAdvancedMetrics);
            expect(result.current.setSiteDetailsChartTimeRange).toBe(mockStore.setSiteDetailsChartTimeRange);
        });

        it("should integrate with analytics hook", () => {
            const site = createSite("test-site");
            mockStore.sites = [site];
            mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);

            const { result } = renderHook(() => useSiteDetails({ site }));

            expect(result.current.analytics).toEqual(mockAnalytics);
        });
    });

    describe("Edge Cases", () => {
        it("should handle monitor with undefined timeout", () => {
            const site = createSite("test-site", {
                monitors: [createMonitor("monitor-1", "http", { timeout: undefined })],
            });
            mockStore.sites = [site];
            mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);

            const { result } = renderHook(() => useSiteDetails({ site }));

            expect(result.current.localTimeout).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
        });

        it("should handle monitor with undefined retry attempts", () => {
            const site = createSite("test-site", {
                monitors: [createMonitor("monitor-1", "http", { retryAttempts: undefined })],
            });
            mockStore.sites = [site];
            mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);

            const { result } = renderHook(() => useSiteDetails({ site }));

            expect(result.current.localRetryAttempts).toBe(0);
        });

        it("should handle site with undefined name", () => {
            const site = createSite("test-site", { name: undefined });
            mockStore.sites = [site];
            mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);

            const { result } = renderHook(() => useSiteDetails({ site }));

            expect(result.current.localName).toBe("");
        });

        it("should handle empty monitor list", () => {
            const site = createSite("test-site", { monitors: [] });
            mockStore.sites = [site];
            mockStore.getSelectedMonitorId.mockReturnValue(null);

            const { result } = renderHook(() => useSiteDetails({ site }));

            expect(result.current.selectedMonitor).toBeUndefined();
            expect(result.current.selectedMonitorId).toBe("");
            expect(result.current.isMonitoring).toBe(true); // Default when no monitor
        });

        it("should handle monitor with monitoring: false", () => {
            const site = createSite("test-site", {
                monitors: [createMonitor("monitor-1", "http", { monitoring: false })],
            });
            mockStore.sites = [site];
            mockStore.getSelectedMonitorId.mockReturnValue(site.monitors[0].id);

            const { result } = renderHook(() => useSiteDetails({ site }));

            expect(result.current.isMonitoring).toBe(false);
        });
    });
});
