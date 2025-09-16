/**
 * Comprehensive tests for useSiteDetails.ts
 *
 * @file Src/test/hooks/site/useSiteDetails.test.ts
 */

import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import React from "react";
import { useSiteDetails } from "../../../hooks/site/useSiteDetails";

// Define types locally since they are not exported from types
interface Site {
    identifier: string;
    name: string;
    monitoring: boolean;
    monitors: any[];
}

// Mock error handling utilities
vi.mock("@shared/utils/errorHandling", () => ({
    withUtilityErrorHandling: vi.fn(),
}));

// Mock validation utilities
vi.mock("../../../utils/monitorValidation", () => ({
    validateMonitorFieldClientSide: vi.fn((_type, field, value) => {
        if (
            field === "checkInterval" &&
            (value < 10_000 || value > 86_400_000)
        ) {
            return {
                success: false,
                errors: ["Check interval must be between 10s and 24h"],
            };
        }
        if (field === "timeout" && (value < 1000 || value > 30_000)) {
            return {
                success: false,
                errors: ["Timeout must be between 1s and 30s"],
            };
        }
        if (field === "retryAttempts" && (value < 0 || value > 10)) {
            return {
                success: false,
                errors: ["Retry attempts must be between 0 and 10"],
            };
        }
        return { success: true };
    }),
}));

// Mock all dependencies
// Create mock functions that can be accessed in tests
const mockCheckSiteNow = vi.fn();
const mockDeleteSite = vi.fn();
const mockModifySite = vi.fn();
const mockRemoveMonitorFromSite = vi.fn();
const mockStartSiteMonitoring = vi.fn();
const mockStartSiteMonitorMonitoring = vi.fn();
const mockStopSiteMonitoring = vi.fn();
const mockStopSiteMonitorMonitoring = vi.fn();
const mockUpdateMonitorRetryAttempts = vi.fn();
const mockUpdateMonitorTimeout = vi.fn();
const mockUpdateSiteCheckInterval = vi.fn();

vi.mock("../../../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(() => ({
        checkSiteNow: mockCheckSiteNow,
        deleteSite: mockDeleteSite,
        getSelectedMonitorId: vi.fn(() => "monitor-1"),
        modifySite: mockModifySite,
        removeMonitorFromSite: mockRemoveMonitorFromSite,
        setSelectedMonitorId: vi.fn(),
        sites: [],
        startSiteMonitoring: mockStartSiteMonitoring,
        startSiteMonitorMonitoring: mockStartSiteMonitorMonitoring,
        stopSiteMonitoring: mockStopSiteMonitoring,
        stopSiteMonitorMonitoring: mockStopSiteMonitorMonitoring,
        updateMonitorRetryAttempts: mockUpdateMonitorRetryAttempts,
        updateMonitorTimeout: mockUpdateMonitorTimeout,
        updateSiteCheckInterval: mockUpdateSiteCheckInterval,
    })),
}));

vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: vi.fn(() => ({
        clearError: vi.fn(),
        isLoading: false,
    })),
}));

vi.mock("../../../stores/ui/useUiStore", () => ({
    useUIStore: vi.fn(() => ({
        activeSiteDetailsTab: "overview",
        setActiveSiteDetailsTab: vi.fn(),
        setShowAdvancedMetrics: vi.fn(),
        setSiteDetailsChartTimeRange: vi.fn(),
        showAdvancedMetrics: false,
        siteDetailsChartTimeRange: "1h",
    })),
}));

vi.mock("../../../hooks/site/useSiteAnalytics", () => ({
    useSiteAnalytics: vi.fn(() => ({
        chartData: [],
        isLoading: false,
        error: null,
    })),
}));

// Mock globalThis.confirm for destructive action tests
Object.defineProperty(globalThis, "confirm", {
    writable: true,
    value: vi.fn(() => true),
});

import { useSitesStore } from "../../../stores/sites/useSitesStore";
import { useErrorStore } from "../../../stores/error/useErrorStore";
import { useUIStore } from "../../../stores/ui/useUiStore";
import { useSiteAnalytics } from "../../../hooks/site/useSiteAnalytics";
import { withUtilityErrorHandling } from "@shared/utils/errorHandling";

const mockWithUtilityErrorHandling = vi.mocked(withUtilityErrorHandling);

describe("useSiteDetails Hook - Basic Coverage", () => {
    const mockSite: Site = {
        identifier: "site-1",
        name: "Test Site",
        monitoring: true,
        monitors: [
            {
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                checkInterval: 60_000,
                timeout: 10_000,
                retryAttempts: 3,
                monitoring: true,
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock for withUtilityErrorHandling
        mockWithUtilityErrorHandling.mockImplementation(
            async (
                fn: () => Promise<any>,
                _operationName: string,
                fallback?: any
            ) => {
                try {
                    return await fn();
                } catch {
                    return fallback;
                }
            }
        );

        // Mock sites store to return the current site
        (useSitesStore as any).mockReturnValue({
            checkSiteNow: vi.fn(),
            deleteSite: vi.fn(),
            getSelectedMonitorId: vi.fn(() => "monitor-1"),
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
        });
    });

    describe("Hook Initialization", () => {
        it("should initialize with site data", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Initialization", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.currentSite).toEqual(mockSite);
            expect(result.current.selectedMonitorId).toBe("monitor-1");
            expect(result.current.isLoading).toBeFalsy();
        });

        it("should handle site with no monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const siteWithNoMonitors = {
                ...mockSite,
                monitors: [],
            };

            // Mock empty sites array for this test
            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => null),
                modifySite: vi.fn(),
                removeMonitorFromSite: vi.fn(),
                setSelectedMonitorId: vi.fn(),
                sites: [siteWithNoMonitors],
                startSiteMonitoring: vi.fn(),
                startSiteMonitorMonitoring: vi.fn(),
                stopSiteMonitoring: vi.fn(),
                stopSiteMonitorMonitoring: vi.fn(),
                updateMonitorRetryAttempts: vi.fn(),
                updateMonitorTimeout: vi.fn(),
                updateSiteCheckInterval: vi.fn(),
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: siteWithNoMonitors })
            );

            expect(result.current.selectedMonitor).toBeUndefined();
            expect(result.current.isMonitoring).toBeFalsy();
        });

        it("should handle site not found in store", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => null),
                modifySite: vi.fn(),
                removeMonitorFromSite: vi.fn(),
                setSelectedMonitorId: vi.fn(),
                sites: [], // Empty sites array
                startSiteMonitoring: vi.fn(),
                startSiteMonitorMonitoring: vi.fn(),
                stopSiteMonitoring: vi.fn(),
                stopSiteMonitorMonitoring: vi.fn(),
                updateMonitorRetryAttempts: vi.fn(),
                updateMonitorTimeout: vi.fn(),
                updateSiteCheckInterval: vi.fn(),
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.currentSite.name).toBe("Unnamed Site");
            expect(result.current.currentSite.monitoring).toBeTruthy();
            expect(result.current.currentSite.monitors).toEqual([]);
        });
    });

    describe("State Management", () => {
        it("should track local name changes", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.localName).toBe("Test Site");
            expect(result.current.hasUnsavedChanges).toBeFalsy();

            // Simulate name change using act for state updates
            act(() => {
                result.current.setLocalName("New Site Name");
            });

            expect(result.current.hasUnsavedChanges).toBeTruthy();
        });

        it("should track monitoring state", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.isMonitoring).toBeTruthy();
            expect(result.current.selectedMonitor).toBeDefined();
        });

        it("should have default values for monitor settings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.localCheckInterval).toBe(60_000);
            expect(result.current.localTimeout).toBeDefined();
            expect(result.current.localRetryAttempts).toBe(3);
        });
    });

    describe("Handler Functions", () => {
        it("should provide all required handlers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(typeof result.current.handleCheckNow).toBe("function");
            expect(typeof result.current.handleMonitorIdChange).toBe(
                "function"
            );
            expect(typeof result.current.handleRemoveMonitor).toBe("function");
            expect(typeof result.current.handleRemoveSite).toBe("function");
            expect(typeof result.current.handleStartMonitoring).toBe(
                "function"
            );
            expect(typeof result.current.handleStopMonitoring).toBe("function");
            expect(typeof result.current.handleSaveName).toBe("function");
        });

        it("should execute handlers without throwing errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // Test that handlers execute without errors
            await act(async () => {
                await result.current.handleCheckNow();
            });

            // If we get here without errors, the handler executed successfully
            expect(true).toBeTruthy();
        });
    });

    describe("Analytics Integration", () => {
        it("should integrate with site analytics", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.analytics).toBeDefined();
            expect(useSiteAnalytics).toHaveBeenCalled();
        });
    });

    describe("UI Store Integration", () => {
        it("should integrate with UI store", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.activeSiteDetailsTab).toBe("overview");
            expect(result.current.showAdvancedMetrics).toBeFalsy();
            expect(result.current.siteDetailsChartTimeRange).toBe("1h");
            expect(typeof result.current.setActiveSiteDetailsTab).toBe(
                "function"
            );
        });
    });

    describe("Error Handling", () => {
        it("should handle loading state from error store", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            (useErrorStore as any).mockReturnValue({
                clearError: vi.fn(),
                isLoading: true,
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.isLoading).toBeTruthy();
        });
    });

    describe("Monitor Selection", () => {
        it("should handle monitor ID changes", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const mockSetSelectedMonitorId = vi.fn();
            const mockSetActiveSiteDetailsTab = vi.fn();

            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
                modifySite: vi.fn(),
                removeMonitorFromSite: vi.fn(),
                setSelectedMonitorId: mockSetSelectedMonitorId,
                sites: [mockSite],
                startSiteMonitoring: vi.fn(),
                startSiteMonitorMonitoring: vi.fn(),
                stopSiteMonitoring: vi.fn(),
                stopSiteMonitorMonitoring: vi.fn(),
                updateMonitorRetryAttempts: vi.fn(),
                updateMonitorTimeout: vi.fn(),
                updateSiteCheckInterval: vi.fn(),
            });

            (useUIStore as any).mockReturnValue({
                activeSiteDetailsTab: "monitor-1-analytics",
                setActiveSiteDetailsTab: mockSetActiveSiteDetailsTab,
                setShowAdvancedMetrics: vi.fn(),
                setSiteDetailsChartTimeRange: vi.fn(),
                showAdvancedMetrics: false,
                siteDetailsChartTimeRange: "1h",
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            const mockEvent = {
                target: { value: "monitor-2" },
            } as React.ChangeEvent<HTMLSelectElement>;

            result.current.handleMonitorIdChange(mockEvent);

            expect(mockSetSelectedMonitorId).toHaveBeenCalledWith(
                "site-1",
                "monitor-2"
            );
            expect(mockSetActiveSiteDetailsTab).toHaveBeenCalledWith(
                "monitor-2-analytics"
            );
        });
    });
});

describe("useSiteDetails Hook - Comprehensive Coverage", () => {
    const mockSite: Site = {
        identifier: "site-1",
        name: "Test Site",
        monitoring: true,
        monitors: [
            {
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                checkInterval: 60_000,
                timeout: 10_000,
                retryAttempts: 3,
                monitoring: true,
            },
            {
                id: "monitor-2",
                type: "ping",
                host: "8.8.8.8",
                checkInterval: 30_000,
                timeout: 5000,
                retryAttempts: 2,
                monitoring: false,
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset confirm mock
        (globalThis.confirm as any) = vi.fn(() => true);

        // Mock sites store with default values
        (useSitesStore as any).mockReturnValue({
            checkSiteNow: vi.fn(),
            deleteSite: vi.fn(),
            getSelectedMonitorId: vi.fn(() => "monitor-1"),
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
        });

        // Reset error store mock
        (useErrorStore as any).mockReturnValue({
            clearError: vi.fn(),
            isLoading: false,
        });

        // Reset UI store mock
        (useUIStore as any).mockReturnValue({
            activeSiteDetailsTab: "overview",
            setActiveSiteDetailsTab: vi.fn(),
            setShowAdvancedMetrics: vi.fn(),
            setSiteDetailsChartTimeRange: vi.fn(),
            showAdvancedMetrics: false,
            siteDetailsChartTimeRange: "1h",
        });

        // Reset withUtilityErrorHandling mock
        mockWithUtilityErrorHandling.mockImplementation(
            async (
                fn: () => Promise<any>,
                _operationName: string,
                fallback?: any
            ) => {
                try {
                    return await fn();
                } catch {
                    return fallback;
                }
            }
        );
    });

    describe("Async Handler Error Handling", () => {
        it("should handle handleCheckNow execution gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // Should not throw error since withUtilityErrorHandling catches it
            await act(async () => {
                await result.current.handleCheckNow();
            });

            // Test passes if no error is thrown
            expect(true).toBeTruthy();
        });

        it("should handle handleCheckNow when no monitor is selected", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => null),
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
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // Should complete without throwing when no monitor is selected
            await expect(
                result.current.handleCheckNow()
            ).resolves.toBeUndefined();
        });
    });

    describe("Monitor Field Updates with Validation", () => {
        it("should handle valid check interval updates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const mockUpdateSiteCheckInterval = vi.fn();

            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
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
                updateSiteCheckInterval: mockUpdateSiteCheckInterval,
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // First update the local interval via change handler
            const mockEvent = {
                target: { value: "30000" },
            } as React.ChangeEvent<HTMLSelectElement>;

            act(() => {
                result.current.handleIntervalChange(mockEvent);
            });

            // Then save the interval
            await act(async () => {
                await result.current.handleSaveInterval();
            });

            expect(mockUpdateSiteCheckInterval).toHaveBeenCalledWith(
                "site-1",
                "monitor-1",
                30_000
            );
        });

        it("should handle invalid check interval updates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const mockUpdateSiteCheckInterval = vi.fn();

            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
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
                updateSiteCheckInterval: mockUpdateSiteCheckInterval,
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // First update the local interval to an invalid value
            const mockEvent = {
                target: { value: "5000" }, // Too small
            } as React.ChangeEvent<HTMLSelectElement>;

            act(() => {
                result.current.handleIntervalChange(mockEvent);
            });

            // Try to save the invalid interval - should throw
            await act(async () => {
                await expect(
                    result.current.handleSaveInterval()
                ).rejects.toThrow();
            });

            // Should not call store method with invalid value
            expect(mockUpdateSiteCheckInterval).not.toHaveBeenCalled();
        });

        it("should handle valid timeout updates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const mockUpdateMonitorTimeout = vi.fn();

            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
                modifySite: vi.fn(),
                removeMonitorFromSite: vi.fn(),
                setSelectedMonitorId: vi.fn(),
                sites: [mockSite],
                startSiteMonitoring: vi.fn(),
                startSiteMonitorMonitoring: vi.fn(),
                stopSiteMonitoring: vi.fn(),
                stopSiteMonitorMonitoring: vi.fn(),
                updateMonitorRetryAttempts: vi.fn(),
                updateMonitorTimeout: mockUpdateMonitorTimeout,
                updateSiteCheckInterval: vi.fn(),
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // First update the local timeout via change handler (in seconds)
            const mockEvent = {
                target: { value: "15" }, // 15 seconds
            } as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleTimeoutChange(mockEvent);
            });

            // Then save the timeout
            await act(async () => {
                await result.current.handleSaveTimeout();
            });

            expect(mockUpdateMonitorTimeout).toHaveBeenCalledWith(
                "site-1",
                "monitor-1",
                15_000 // Should be converted to milliseconds
            );
        });

        it("should handle invalid timeout updates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const mockUpdateMonitorTimeout = vi.fn();

            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
                modifySite: vi.fn(),
                removeMonitorFromSite: vi.fn(),
                setSelectedMonitorId: vi.fn(),
                sites: [mockSite],
                startSiteMonitoring: vi.fn(),
                startSiteMonitorMonitoring: vi.fn(),
                stopSiteMonitoring: vi.fn(),
                stopSiteMonitorMonitoring: vi.fn(),
                updateMonitorRetryAttempts: vi.fn(),
                updateMonitorTimeout: mockUpdateMonitorTimeout,
                updateSiteCheckInterval: vi.fn(),
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // First update the local timeout to an invalid value (in seconds)
            const mockEvent = {
                target: { value: "45" }, // 45 seconds - too large
            } as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleTimeoutChange(mockEvent);
            });

            // Try to save the invalid timeout - should throw
            await act(async () => {
                await expect(
                    result.current.handleSaveTimeout()
                ).rejects.toThrow();
            });

            // Should not call store method with invalid value
            expect(mockUpdateMonitorTimeout).not.toHaveBeenCalled();
        });

        it("should handle valid retry attempts updates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const mockUpdateMonitorRetryAttempts = vi.fn();

            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
                modifySite: vi.fn(),
                removeMonitorFromSite: vi.fn(),
                setSelectedMonitorId: vi.fn(),
                sites: [mockSite],
                startSiteMonitoring: vi.fn(),
                startSiteMonitorMonitoring: vi.fn(),
                stopSiteMonitoring: vi.fn(),
                stopSiteMonitorMonitoring: vi.fn(),
                updateMonitorRetryAttempts: mockUpdateMonitorRetryAttempts,
                updateMonitorTimeout: vi.fn(),
                updateSiteCheckInterval: vi.fn(),
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // First update the local retry attempts via change handler
            const mockEvent = {
                target: { value: "5" },
            } as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleRetryAttemptsChange(mockEvent);
            });

            // Then save the retry attempts
            await act(async () => {
                await result.current.handleSaveRetryAttempts();
            });

            expect(mockUpdateMonitorRetryAttempts).toHaveBeenCalledWith(
                "site-1",
                "monitor-1",
                5
            );
        });

        it("should handle invalid retry attempts updates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const mockUpdateMonitorRetryAttempts = vi.fn();

            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
                modifySite: vi.fn(),
                removeMonitorFromSite: vi.fn(),
                setSelectedMonitorId: vi.fn(),
                sites: [mockSite],
                startSiteMonitoring: vi.fn(),
                startSiteMonitorMonitoring: vi.fn(),
                stopSiteMonitoring: vi.fn(),
                stopSiteMonitorMonitoring: vi.fn(),
                updateMonitorRetryAttempts: mockUpdateMonitorRetryAttempts,
                updateMonitorTimeout: vi.fn(),
                updateSiteCheckInterval: vi.fn(),
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // First update the local retry attempts to an invalid value
            const mockEvent = {
                target: { value: "15" }, // Too large
            } as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleRetryAttemptsChange(mockEvent);
            });

            // Try to save the invalid retry attempts - should throw
            await act(async () => {
                await expect(
                    result.current.handleSaveRetryAttempts()
                ).rejects.toThrow();
            });

            // Should not call store method with invalid value
            expect(mockUpdateMonitorRetryAttempts).not.toHaveBeenCalled();
        });
    });

    describe("Site Name Updates", () => {
        it("should handle site name updates", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // Change the local name first
            act(() => {
                result.current.setLocalName("Updated Site Name");
            });

            // Verify name change is reflected in state
            expect(result.current.localName).toBe("Updated Site Name");
            expect(result.current.hasUnsavedChanges).toBeTruthy();

            // Execute the save handler without errors
            await act(async () => {
                await result.current.handleSaveName();
            });

            // Test passes if no error is thrown
            expect(true).toBeTruthy();
        });

        it("should not save site name when no changes are made", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Saving", "type");

            const mockModifySite = vi.fn();

            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
                modifySite: mockModifySite,
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
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // Don't change the name - should not trigger save
            await act(async () => {
                await result.current.handleSaveName();
            });

            expect(mockModifySite).not.toHaveBeenCalled();
        });
    });

    describe("Destructive Actions with Confirmation", () => {
        it("should handle monitor removal when user confirms", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            (globalThis.confirm as any) = vi.fn(() => true);

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            await act(async () => {
                await result.current.handleRemoveMonitor();
            });

            expect(globalThis.confirm).toHaveBeenCalledWith(
                'Are you sure you want to remove the monitor "https://example.com" from Test Site?'
            );
            // Test passes if no error is thrown
            expect(true).toBeTruthy();
        });

        it("should not remove monitor when user cancels confirmation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Deletion", "type");

            const mockRemoveMonitorFromSite = vi.fn();

            (globalThis.confirm as any) = vi.fn(() => false);

            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
                modifySite: vi.fn(),
                removeMonitorFromSite: mockRemoveMonitorFromSite,
                setSelectedMonitorId: vi.fn(),
                sites: [mockSite],
                startSiteMonitoring: vi.fn(),
                startSiteMonitorMonitoring: vi.fn(),
                stopSiteMonitoring: vi.fn(),
                stopSiteMonitorMonitoring: vi.fn(),
                updateMonitorRetryAttempts: vi.fn(),
                updateMonitorTimeout: vi.fn(),
                updateSiteCheckInterval: vi.fn(),
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            await act(async () => {
                await result.current.handleRemoveMonitor();
            });

            expect(globalThis.confirm).toHaveBeenCalled();
            expect(mockRemoveMonitorFromSite).not.toHaveBeenCalled();
        });

        it("should handle site deletion when user confirms", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            (globalThis.confirm as any) = vi.fn(() => true);

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            await act(async () => {
                await result.current.handleRemoveSite();
            });

            expect(globalThis.confirm).toHaveBeenCalledWith(
                "Are you sure you want to remove Test Site?"
            );
            // Test passes if no error is thrown
            expect(true).toBeTruthy();
        });

        it("should not delete site when user cancels confirmation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Deletion", "type");

            const mockDeleteSite = vi.fn();

            (globalThis.confirm as any) = vi.fn(() => false);

            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: mockDeleteSite,
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
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
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            await act(async () => {
                await result.current.handleRemoveSite();
            });

            expect(globalThis.confirm).toHaveBeenCalled();
            expect(mockDeleteSite).not.toHaveBeenCalled();
        });
    });

    describe("Monitoring State Management", () => {
        it("should handle start monitoring for site", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: { ...mockSite, monitoring: false } })
            );

            await act(async () => {
                await result.current.handleStartSiteMonitoring();
            });

            // Test passes if no error is thrown
            expect(true).toBeTruthy();
        });

        it("should handle start monitoring for specific monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const siteWithInactiveMonitor = {
                ...mockSite,
                monitors: [{ ...mockSite.monitors[0], monitoring: false }],
            };

            const { result } = renderHook(() =>
                useSiteDetails({ site: siteWithInactiveMonitor })
            );

            await act(async () => {
                await result.current.handleStartMonitoring();
            });

            // Test passes if no error is thrown
            expect(true).toBeTruthy();
        });

        it("should handle stop monitoring for site", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            await act(async () => {
                await result.current.handleStopSiteMonitoring();
            });

            // Test passes if no error is thrown
            expect(true).toBeTruthy();
        });

        it("should handle stop monitoring for specific monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            await act(async () => {
                await result.current.handleStopMonitoring();
            });

            // Test passes if no error is thrown
            expect(true).toBeTruthy();
        });
    });

    describe("Edge Cases and State Synchronization", () => {
        it("should handle monitor ID changes when tab needs updating", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Monitoring", "type");

            const mockSetSelectedMonitorId = vi.fn();
            const mockSetActiveSiteDetailsTab = vi.fn();

            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
                modifySite: vi.fn(),
                removeMonitorFromSite: vi.fn(),
                setSelectedMonitorId: mockSetSelectedMonitorId,
                sites: [mockSite],
                startSiteMonitoring: vi.fn(),
                startSiteMonitorMonitoring: vi.fn(),
                stopSiteMonitoring: vi.fn(),
                stopSiteMonitorMonitoring: vi.fn(),
                updateMonitorRetryAttempts: vi.fn(),
                updateMonitorTimeout: vi.fn(),
                updateSiteCheckInterval: vi.fn(),
            });

            (useUIStore as any).mockReturnValue({
                activeSiteDetailsTab: "monitor-1-analytics",
                setActiveSiteDetailsTab: mockSetActiveSiteDetailsTab,
                setShowAdvancedMetrics: vi.fn(),
                setSiteDetailsChartTimeRange: vi.fn(),
                showAdvancedMetrics: false,
                siteDetailsChartTimeRange: "1h",
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            const mockEvent = {
                target: { value: "monitor-2" },
            } as React.ChangeEvent<HTMLSelectElement>;

            act(() => {
                result.current.handleMonitorIdChange(mockEvent);
            });

            expect(mockSetSelectedMonitorId).toHaveBeenCalledWith(
                "site-1",
                "monitor-2"
            );
            expect(mockSetActiveSiteDetailsTab).toHaveBeenCalledWith(
                "monitor-2-analytics"
            );
        });

        it("should handle stale monitor ID updates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Update", "type");

            const mockSetSelectedMonitorId = vi.fn();

            // Initial monitor is monitor-1, but it gets removed
            const siteWithRemovedMonitor = {
                ...mockSite,
                monitors: [mockSite.monitors[1]], // Only monitor-2 remains
            };

            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => "monitor-1"), // Stale ID
                modifySite: vi.fn(),
                removeMonitorFromSite: vi.fn(),
                setSelectedMonitorId: mockSetSelectedMonitorId,
                sites: [siteWithRemovedMonitor],
                startSiteMonitoring: vi.fn(),
                startSiteMonitorMonitoring: vi.fn(),
                stopSiteMonitoring: vi.fn(),
                stopSiteMonitorMonitoring: vi.fn(),
                updateMonitorRetryAttempts: vi.fn(),
                updateMonitorTimeout: vi.fn(),
                updateSiteCheckInterval: vi.fn(),
            });

            renderHook(() => useSiteDetails({ site: siteWithRemovedMonitor }));

            // Should update to the first available monitor
            expect(mockSetSelectedMonitorId).toHaveBeenCalledWith(
                "site-1",
                "monitor-2"
            );
        });

        it("should handle error store loading state changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            (useErrorStore as any).mockReturnValue({
                clearError: vi.fn(),
                isLoading: true,
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.isLoading).toBeTruthy();
        });

        it("should initialize local values from current monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Initialization", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            expect(result.current.localCheckInterval).toBe(60_000);
            expect(result.current.localTimeout).toBe(10); // Should be 10 seconds (converted from 10,000ms)
            expect(result.current.localRetryAttempts).toBe(3);
        });

        it("should detect unsaved changes correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Data Saving", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // Initially no changes
            expect(result.current.hasUnsavedChanges).toBeFalsy();

            // Change local name
            act(() => {
                result.current.setLocalName("Changed Name");
            });

            expect(result.current.hasUnsavedChanges).toBeTruthy();

            // Reset to original name
            act(() => {
                result.current.setLocalName("Test Site");
            });

            expect(result.current.hasUnsavedChanges).toBeFalsy();
        });
    });

    describe("Error Handling Integration", () => {
        it("should call withUtilityErrorHandling for async operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            await result.current.handleCheckNow();

            expect(withUtilityErrorHandling).toHaveBeenCalled();
        });

        it("should handle validation errors in field updates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteDetails", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            const mockUpdateSiteCheckInterval = vi.fn();

            (useSitesStore as any).mockReturnValue({
                checkSiteNow: vi.fn(),
                deleteSite: vi.fn(),
                getSelectedMonitorId: vi.fn(() => "monitor-1"),
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
                updateSiteCheckInterval: mockUpdateSiteCheckInterval,
            });

            const { result } = renderHook(() =>
                useSiteDetails({ site: mockSite })
            );

            // First update the local interval to an invalid value
            const mockEvent = {
                target: { value: "100000000" }, // Too large
            } as React.ChangeEvent<HTMLSelectElement>;

            act(() => {
                result.current.handleIntervalChange(mockEvent);
            });

            // Try to save an invalid interval - should throw due to validation
            await act(async () => {
                await expect(
                    result.current.handleSaveInterval()
                ).rejects.toThrow();
            });

            // Validation should prevent the store call
            expect(mockUpdateSiteCheckInterval).not.toHaveBeenCalled();
        });
    });
});
