import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSiteDetails } from "../../../hooks/site/useSiteDetails";
import { useSitesStore } from "../../../stores/sites/useSitesStore";
import { useErrorStore } from "../../../stores/error/useErrorStore";
import { useUIStore } from "../../../stores/ui/useUiStore";
import { useSiteAnalytics } from "../../../hooks/site/useSiteAnalytics";
import { validateMonitorFieldClientSide } from "../../../utils/monitorValidation";
import { useSelectedSite } from "../../../hooks/useSelectedSite";
import { useMonitorTypesStore } from "../../../stores/monitor/useMonitorTypesStore";
import logger from "../../../services/logger";

// Mock all dependencies
vi.mock("../../../hooks/useSelectedSite");
vi.mock("../../../stores/sites/useSitesStore");
vi.mock("../../../stores/monitor/useMonitorTypesStore");
vi.mock("../../../utils/monitorValidation");
vi.mock("../../../services/logger");

const mockUseSelectedSite = vi.mocked(useSelectedSite);
const mockUseSitesStore = vi.mocked(useSitesStore);
const mockUseMonitorTypesStore = vi.mocked(useMonitorTypesStore);
const mockValidateMonitorFieldClientSide = vi.mocked(
    validateMonitorFieldClientSide
);
const mockLogger = vi.mocked(logger);

describe("useSiteDetails - Branch Coverage", () => {
    const mockSite = {
        identifier: "test-site",
        name: "Test Site",
        monitors: [
            {
                id: "monitor-1",
                type: "http" as const,
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                url: "https://example.com",
                isMonitoring: false,
            },
        ],
    };

    const mockSitesStore = {
        checkSiteNow: vi.fn(),
        deleteSite: vi.fn(),
        getSelectedMonitorId: vi.fn(),
        modifySite: vi.fn(),
        removeMonitorFromSite: vi.fn(),
        setSelectedMonitorId: vi.fn(),
        sites: [mockSite],
        startSiteMonitoring: vi.fn(),
        startSiteMonitorMonitoring: vi.fn(),
        stopSiteMonitoring: vi.fn(),
        stopSiteMonitorMonitoring: vi.fn(),
        updateMonitorRetryAttempts: vi.fn(),
        updateMonitorTimeout: vi.fn(),
        updateSiteCheckInterval: vi.fn(),
        error: null,
        clearError: vi.fn(),
    };

    const mockMonitorTypesStore = {
        getDisplayName: vi.fn(() => "HTTP"),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseSelectedSite.mockReturnValue({
            selectedSite: mockSite,
            selectedMonitorId: "monitor-1",
            selectedMonitor: mockSite.monitors[0],
        });

        mockUseSitesStore.mockReturnValue(mockSitesStore);
        mockUseMonitorTypesStore.mockReturnValue(mockMonitorTypesStore);

        mockLogger.user = {
            action: vi.fn(),
        };
        mockLogger.site = {
            error: vi.fn(),
        };
    });

    describe("handleStartMonitoring", () => {
        it("should handle successful start monitoring (lines 420-430)", async () => {
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
                    siteId: "test-site",
                }
            );
        });
    });

    describe("handleStopMonitoring", () => {
        it("should handle successful stop monitoring (lines 434-450)", async () => {
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
                    siteId: "test-site",
                }
            );
        });
    });

    describe("handleSaveInterval - validation error path", () => {
        it("should handle validation failure for check interval (lines 484-492)", async () => {
            // Mock validation failure
            mockValidateMonitorFieldClientSide.mockResolvedValue({
                success: false,
                errors: ["Invalid interval value"],
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
            ).rejects.toThrow("Validation failed: Invalid interval value");

            expect(mockLogger.site.error).toHaveBeenCalledWith(
                "test-site",
                expect.any(Error)
            );
        });

        it("should handle successful interval save (lines 494-508)", async () => {
            // Mock validation success
            mockValidateMonitorFieldClientSide.mockResolvedValue({
                success: true,
                errors: [],
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
                    siteId: "test-site",
                }
            );
        });
    });

    describe("handleSaveTimeout - validation error path", () => {
        it("should handle validation failure for timeout (lines 534-542)", async () => {
            // Mock validation failure
            mockValidateMonitorFieldClientSide.mockResolvedValue({
                success: false,
                errors: ["Invalid timeout value"],
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
            ).rejects.toThrow("Validation failed: Invalid timeout value");

            expect(mockLogger.site.error).toHaveBeenCalledWith(
                "test-site",
                expect.any(Error)
            );
        });

        it("should handle successful timeout save (lines 544-558)", async () => {
            // Mock validation success
            mockValidateMonitorFieldClientSide.mockResolvedValue({
                success: true,
                errors: [],
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
                    siteId: "test-site",
                }
            );
        });
    });

    describe("handleSaveRetryAttempts - validation error path", () => {
        it("should handle validation failure for retry attempts (lines 584-595)", async () => {
            // Mock validation failure
            mockValidateMonitorFieldClientSide.mockResolvedValue({
                success: false,
                errors: ["Invalid retry attempts value"],
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
            ).rejects.toThrow(
                "Validation failed: Invalid retry attempts value"
            );

            expect(mockLogger.site.error).toHaveBeenCalledWith(
                "test-site",
                expect.any(Error)
            );
        });

        it("should handle successful retry attempts save (lines 597-608)", async () => {
            // Mock validation success
            mockValidateMonitorFieldClientSide.mockResolvedValue({
                success: true,
                errors: [],
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
                    siteId: "test-site",
                }
            );
        });
    });

    describe("handleSaveName - early return path", () => {
        it("should handle early return when no unsaved changes (lines 624-627)", async () => {
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

        it("should handle successful name save with trimmed name (lines 629-639)", async () => {
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

    describe("Edge case validations", () => {
        it("should handle missing monitor type in validation (fallback to 'http')", async () => {
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
                        isMonitoring: false,
                        // No type property
                    },
                ],
            };

            mockUseSelectedSite.mockReturnValue({
                selectedSite: siteWithoutType,
                selectedMonitorId: "monitor-1",
                selectedMonitor: siteWithoutType.monitors[0],
            });

            mockValidateMonitorFieldClientSide.mockResolvedValue({
                success: true,
                errors: [],
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
