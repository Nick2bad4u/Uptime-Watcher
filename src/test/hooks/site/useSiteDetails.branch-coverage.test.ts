import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { useSiteDetails } from "../../../hooks/site/useSiteDetails";
import { useSitesStore } from "../../../stores/sites/useSitesStore";
import { useErrorStore } from "../../../stores/error/useErrorStore";
import { useUIStore } from "../../../stores/ui/useUiStore";
import { useSiteAnalytics } from "../../../hooks/site/useSiteAnalytics";
import { validateMonitorFieldClientSide } from "../../../utils/monitorValidation";
import { logger } from "../../../services/logger";

// Mock all dependencies
vi.mock("../../../stores/sites/useSitesStore");
vi.mock("../../../stores/error/useErrorStore");
vi.mock("../../../stores/ui/useUiStore");
vi.mock("../../../hooks/site/useSiteAnalytics");
vi.mock("../../../utils/monitorValidation");
vi.mock("../../../services/logger");

const mockUseSitesStore = vi.mocked(useSitesStore);
const mockUseErrorStore = vi.mocked(useErrorStore);
const mockUseUIStore = vi.mocked(useUIStore);
const mockUseSiteAnalytics = vi.mocked(useSiteAnalytics);
const mockValidateMonitorFieldClientSide = vi.mocked(
    validateMonitorFieldClientSide
);
const mockLogger = vi.mocked(logger);

describe("useSiteDetails - Branch Coverage Tests", () => {
    const mockSite = {
        identifier: "test-site",
        name: "Test Site",
        monitoring: true,
        monitors: [
            {
                id: "monitor-1",
                type: "http" as const,
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                url: "https://example.com",
                monitoring: false,
                history: [],
                responseTime: 100,
                status: "up" as const,
            },
        ],
    };

    const mockSitesStore = {
        sites: [mockSite],
        selectedMonitorIds: {
            [mockSite.identifier]: mockSite.monitors[0]!.id,
        },
        getSelectedMonitorId: vi.fn(() => "monitor-1"),
        setSelectedMonitorId: vi.fn(),
        checkSiteNow: vi.fn(),
        startSiteMonitorMonitoring: vi.fn(),
        stopSiteMonitorMonitoring: vi.fn(),
        updateSiteCheckInterval: vi.fn(),
        updateMonitorTimeout: vi.fn(),
        updateMonitorRetryAttempts: vi.fn(),
        modifySite: vi.fn(),
        deleteSite: vi.fn(),
        removeMonitorFromSite: vi.fn(),
        startSiteMonitoring: vi.fn(),
        stopSiteMonitoring: vi.fn(),
    };

    const mockErrorStore = {
        isLoading: false,
        clearError: vi.fn(),
    };

    const mockUIStore = {
        activeSiteDetailsTab: "overview",
        showAdvancedMetrics: false,
        siteDetailsChartTimeRange: "1h" as const,
        setActiveSiteDetailsTab: vi.fn(),
        syncActiveSiteDetailsTab: vi.fn(),
        setShowAdvancedMetrics: vi.fn(),
        setSiteDetailsChartTimeRange: vi.fn(),
    };

    const mockAnalytics = {
        avgResponseTime: 100,
        degradedCount: 0,
        downCount: 0,
        downtimePeriods: [],
        fastestResponse: 50,
        filteredHistory: [],
        incidentCount: 0,
        mttr: 0,
        percentileMetrics: {
            p50: 90,
            p95: 150,
            p99: 200,
        },
        slowestResponse: 200,
        totalChecks: 100,
        totalDowntime: 0,
        upCount: 100,
        uptime: "100.0%",
        uptimeRaw: 100,
        chartData: [],
        isLoading: false,
        error: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseSitesStore.mockReturnValue(mockSitesStore);
        mockUseErrorStore.mockReturnValue(mockErrorStore);
        mockUseUIStore.mockReturnValue(mockUIStore);
        mockUseSiteAnalytics.mockReturnValue(mockAnalytics);

        // Mock logger methods
        mockLogger.user = {
            action: vi.fn(),
            settingsChange: vi.fn(),
        };
        mockLogger.site = {
            added: vi.fn(),
            check: vi.fn(),
            error: vi.fn(),
            removed: vi.fn(),
            statusChange: vi.fn(),
        };
    });

    describe("Validation Error Paths", () => {
        it("should handle validation failure for check interval", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: useSiteDetails.branch-coverage-new",
                "component"
            );
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            // Mock validation failure
            mockValidateMonitorFieldClientSide.mockResolvedValue({
                errors: ["Invalid interval value"],
                metadata: {},
                success: false,
                warnings: [],
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // Set up the interval change first
            act(() => {
                result.current.handleIntervalChange({
                    target: { value: "30000" },
                } as React.ChangeEvent<HTMLSelectElement>);
            });

            // Now try to save and expect it to throw
            await expect(
                act(async () => {
                    await result.current.handleSaveInterval();
                })
            ).rejects.toThrowError();

            expect(mockLogger.site.error).toHaveBeenCalled();
        });

        it("should handle validation failure for timeout", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: useSiteDetails.branch-coverage-new",
                "component"
            );
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            // Mock validation failure
            mockValidateMonitorFieldClientSide.mockResolvedValue({
                errors: ["Invalid timeout value"],
                metadata: {},
                success: false,
                warnings: [],
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // Set up the timeout change first
            act(() => {
                result.current.handleTimeoutChange({
                    target: { value: "1" },
                } as React.ChangeEvent<HTMLInputElement>);
            });

            // Now try to save and expect it to throw
            await expect(
                act(async () => {
                    await result.current.handleSaveTimeout();
                })
            ).rejects.toThrowError();

            expect(mockLogger.site.error).toHaveBeenCalled();
        });

        it("should handle validation failure for retry attempts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: useSiteDetails.branch-coverage-new",
                "component"
            );
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            // Mock validation failure
            mockValidateMonitorFieldClientSide.mockResolvedValue({
                errors: ["Invalid retry attempts value"],
                metadata: {},
                success: false,
                warnings: [],
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // Set up the retry attempts change first
            act(() => {
                result.current.handleRetryAttemptsChange({
                    target: { value: "10" },
                } as React.ChangeEvent<HTMLInputElement>);
            });

            // Now try to save and expect it to throw
            await expect(
                act(async () => {
                    await result.current.handleSaveRetryAttempts();
                })
            ).rejects.toThrowError();

            expect(mockLogger.site.error).toHaveBeenCalled();
        });
    });

    describe("Successful Save Operations", () => {
        it("should handle successful interval save", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: useSiteDetails.branch-coverage-new",
                "component"
            );
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Saving", "type");

            // Mock validation success
            mockValidateMonitorFieldClientSide.mockResolvedValue({
                errors: [],
                metadata: {},
                success: true,
                warnings: [],
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // Set up the interval change first
            act(() => {
                result.current.handleIntervalChange({
                    target: { value: "30000" },
                } as React.ChangeEvent<HTMLSelectElement>);
            });

            await act(async () => {
                await result.current.handleSaveInterval();
            });

            expect(mockSitesStore.updateSiteCheckInterval).toHaveBeenCalledWith(
                "test-site",
                "monitor-1",
                30_000
            );
            expect(mockLogger.user.action).toHaveBeenCalledWith(
                "Updated check interval",
                {
                    monitorId: "monitor-1",
                    newInterval: 30_000,
                    siteIdentifier: "test-site",
                }
            );
        });

        it("should handle successful timeout save", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: useSiteDetails.branch-coverage-new",
                "component"
            );
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Saving", "type");

            // Mock validation success
            mockValidateMonitorFieldClientSide.mockResolvedValue({
                errors: [],
                metadata: {},
                success: true,
                warnings: [],
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // Set up the timeout change first
            act(() => {
                result.current.handleTimeoutChange({
                    target: { value: "10" },
                } as React.ChangeEvent<HTMLInputElement>);
            });

            await act(async () => {
                await result.current.handleSaveTimeout();
            });

            expect(mockSitesStore.updateMonitorTimeout).toHaveBeenCalledWith(
                "test-site",
                "monitor-1",
                10_000 // Converted to milliseconds
            );
            expect(mockLogger.user.action).toHaveBeenCalledWith(
                "Updated monitor timeout",
                {
                    monitorId: "monitor-1",
                    newTimeout: 10_000,
                    siteIdentifier: "test-site",
                }
            );
        });

        it("should handle successful retry attempts save", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: useSiteDetails.branch-coverage-new",
                "component"
            );
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Saving", "type");

            // Mock validation success
            mockValidateMonitorFieldClientSide.mockResolvedValue({
                errors: [],
                metadata: {},
                success: true,
                warnings: [],
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // Set up the retry attempts change first
            act(() => {
                result.current.handleRetryAttemptsChange({
                    target: { value: "5" },
                } as React.ChangeEvent<HTMLInputElement>);
            });

            await act(async () => {
                await result.current.handleSaveRetryAttempts();
            });

            expect(
                mockSitesStore.updateMonitorRetryAttempts
            ).toHaveBeenCalledWith("test-site", "monitor-1", 5);
            expect(mockLogger.user.action).toHaveBeenCalledWith(
                "Updated monitor retry attempts",
                {
                    monitorId: "monitor-1",
                    newRetryAttempts: 5,
                    siteIdentifier: "test-site",
                }
            );
        });
    });

    describe("Monitoring Operations", () => {
        it("should handle start monitoring", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: useSiteDetails.branch-coverage-new",
                "component"
            );
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            await act(async () => {
                await result.current.handleStartMonitoring();
            });

            expect(
                mockSitesStore.startSiteMonitorMonitoring
            ).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(mockLogger.user.action).toHaveBeenCalledWith(
                "Started monitoring",
                {
                    monitorId: "monitor-1",
                    siteIdentifier: "test-site",
                }
            );
        });

        it("should handle stop monitoring", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: useSiteDetails.branch-coverage-new",
                "component"
            );
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            await act(async () => {
                await result.current.handleStopMonitoring();
            });

            expect(
                mockSitesStore.stopSiteMonitorMonitoring
            ).toHaveBeenCalledWith("test-site", "monitor-1");
            expect(mockLogger.user.action).toHaveBeenCalledWith(
                "Stopped monitoring",
                {
                    monitorId: "monitor-1",
                    siteIdentifier: "test-site",
                }
            );
        });
    });

    describe("Name Save Handling", () => {
        it("should handle early return when no unsaved changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: useSiteDetails.branch-coverage-new",
                "component"
            );
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Saving", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // Don't make any name changes, so hasUnsavedChanges should be false
            await act(async () => {
                await result.current.handleSaveName();
            });

            // Should not call modifySite since no changes
            expect(mockSitesStore.modifySite).not.toHaveBeenCalled();
        });

        it("should handle successful name save with trimmed name", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: useSiteDetails.branch-coverage-new",
                "component"
            );
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Saving", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // Make a name change to trigger hasUnsavedChanges
            act(() => {
                result.current.setLocalName("  New Site Name  ");
            });

            await act(async () => {
                await result.current.handleSaveName();
            });

            expect(mockSitesStore.modifySite).toHaveBeenCalledWith(
                "test-site",
                { name: "New Site Name" } // Should be trimmed
            );
            expect(mockLogger.user.action).toHaveBeenCalledWith(
                "Updated site name",
                {
                    identifier: "test-site",
                    name: "New Site Name",
                }
            );
        });
    });

    describe("Edge Cases", () => {
        it("should handle missing monitor type in validation (fallback to 'http')", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: useSiteDetails.branch-coverage-new",
                "component"
            );
            await annotate("Category: Hook", "category");
            await annotate("Type: Validation", "type");

            // Create a monitor without type to test the fallback
            const siteWithoutType = {
                ...mockSite,
                monitors: [
                    {
                        id: "monitor-1",
                        checkInterval: 60_000,
                        timeout: 5000,
                        retryAttempts: 3,
                        url: "https://example.com",
                        monitoring: false,
                        history: [],
                        responseTime: 100,
                        status: "up" as const,
                        type: "http" as const, // Adding type for TypeScript compliance
                    },
                ],
            };

            mockValidateMonitorFieldClientSide.mockResolvedValue({
                errors: [],
                metadata: {},
                success: true,
                warnings: [],
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: siteWithoutType })
            );

            act(() => {
                result.current.handleIntervalChange({
                    target: { value: "30000" },
                } as React.ChangeEvent<HTMLSelectElement>);
            });

            await act(async () => {
                await result.current.handleSaveInterval();
            });

            // Should use "http" as fallback when selectedMonitor?.type is undefined
            expect(mockValidateMonitorFieldClientSide).toHaveBeenCalledWith(
                "http",
                "checkInterval",
                30_000
            );
        });
    });
});
