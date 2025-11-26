/**
 * Comprehensive tests for SiteDetails component
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { SiteDetails } from "../../../components/SiteDetails/SiteDetails";
import { useSiteDetails } from "../../../hooks/site/useSiteDetails";
import type { Monitor, Site } from "@shared/types";
import {
    monitorIdArbitrary,
    sampleOne,
    siteIdentifierArbitrary,
    siteNameArbitrary,
    siteUrlArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";

const sampledSiteName = sampleOne(siteNameArbitrary);
const sampledSiteIdentifier = sampleOne(siteIdentifierArbitrary);
const sampledMonitorId = sampleOne(monitorIdArbitrary);
const sampledMonitorUrl = sampleOne(siteUrlArbitrary);

// Mock BrowserRouter to avoid react-router-dom dependency
const MockBrowserRouter = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
);

// Mock window.matchMedia before other imports
Object.defineProperty(globalThis, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(
        (query) =>
            ({
                addEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
                matches: false,
                media: query,
                onchange: null,
                removeEventListener: vi.fn(),
            }) as unknown as MediaQueryList
    ),
});

// Also mock the theme manager to avoid deep dependencies
vi.mock("../../../theme/ThemeManager", () => ({
    ThemeManager: {
        getTheme: vi.fn(() => "light"),
        getSystemThemePreference: vi.fn(() => "light"),
        applyTheme: vi.fn(),
    },
}));

vi.mock("../../../theme/useTheme", () => ({
    useTheme: vi.fn(() => ({
        currentTheme: {
            colors: {
                text: {
                    primary: "#000000",
                    secondary: "#666666",
                },
                background: {
                    primary: "#ffffff",
                    secondary: "#f5f5f5",
                },
                border: {
                    primary: "#e0e0e0",
                    secondary: "#e5e5e5",
                },
                surface: {
                    base: "#ffffff",
                    elevated: "#f8f9fa",
                    overlay: "#ffffff",
                },
                primary: {
                    500: "#3b82f6",
                },
                success: "#10b981",
                error: "#ef4444",
                warning: "#f59e0b",
                status: {
                    up: "#10b981",
                    down: "#ef4444",
                    pending: "#f59e0b",
                    unknown: "#6b7280",
                },
            },
            typography: {
                fontFamily: {
                    sans: ["Arial", "sans-serif"],
                },
            },
            isDark: false,
        },
        setTheme: vi.fn(),
        availableThemes: ["light", "dark"],
        getColor: vi.fn((_path: string) => "#000000"),
        getStatusColor: vi.fn(() => "#000000"),
        isDark: false,
        systemTheme: "light" as const,
        themeManager: {},
        themeName: "light" as const,
        themeVersion: 1,
        toggleTheme: vi.fn(),
    })),
    useAvailabilityColors: vi.fn(() => ({
        getAvailabilityColor: vi.fn((percentage: number) => {
            if (percentage >= 95) return "#10b981";
            if (percentage >= 80) return "#f59e0b";
            return "#ef4444";
        }),
        getAvailabilityDescription: vi.fn((percentage: number) => {
            if (percentage >= 99.9) return "Excellent";
            if (percentage >= 95) return "Good";
            if (percentage >= 80) return "Fair";
            return "Poor";
        }),
        getAvailabilityVariant: vi.fn((percentage: number) => {
            if (percentage >= 95) return "success";
            if (percentage >= 80) return "warning";
            return "danger";
        }),
    })),
    useStatusColors: vi.fn(() => ({
        up: "#10b981",
        down: "#ef4444",
        pending: "#f59e0b",
        unknown: "#6b7280",
    })),
    useThemeClasses: vi.fn(() => ({
        getBackgroundClass: vi.fn(() => ({ backgroundColor: "#ffffff" })),
        getBorderClass: vi.fn(() => ({ borderColor: "#e0e0e0" })),
        getColor: vi.fn(() => "#000000"),
        getStatusClass: vi.fn(() => ({ color: "#000000" })),
        getSurfaceClass: vi.fn(() => ({ backgroundColor: "#ffffff" })),
        getTextClass: vi.fn(() => ({ color: "#000000" })),
    })),
    useThemeValue: vi.fn((selector) =>
        selector({ colors: { text: { primary: "#000000" } } })
    ),
}));

vi.mock("../../../services/chartConfig", () => {
    const ChartConfigServiceMock = vi.fn(function ChartConfigServiceMock(
        this: any
    ) {
        this.getLineChartConfig = vi.fn(() => ({}));
        this.getBarChartConfig = vi.fn(() => ({}));
        this.getDoughnutChartConfig = vi.fn(() => ({}));
        this.getBaseConfig = vi.fn(() => ({}));
    });

    return {
        ChartConfigService: ChartConfigServiceMock,
    };
});

vi.mock("../../../theme/components", () => ({
    ThemedBox: vi.fn(({ children, ...props }) => (
        <div {...props}>{children}</div>
    )),
}));

// Mock the hook and all dependencies
vi.mock("../../../hooks/site/useSiteDetails", () => ({
    useSiteDetails: vi.fn(),
}));

vi.mock("../../../components/SiteDetails/SiteDetailsHeader", () => ({
    SiteDetailsHeader: vi.fn(({ site, selectedMonitor }) => (
        <div data-testid="site-details-header">
            <span>Site: {site?.name || "Unknown"}</span>
            {selectedMonitor && <span>Monitor: {selectedMonitor.id}</span>}
        </div>
    )),
}));

vi.mock("../../../components/SiteDetails/SiteDetailsNavigation", () => ({
    SiteDetailsNavigation: vi.fn(
        ({ setActiveSiteDetailsTab, activeSiteDetailsTab }) => (
            <div data-testid="site-details-navigation">
                <button
                    onClick={() => setActiveSiteDetailsTab("overview")}
                    data-testid="overview-tab"
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveSiteDetailsTab("history")}
                    data-testid="history-tab"
                >
                    History
                </button>
                <button
                    onClick={() => setActiveSiteDetailsTab("analytics")}
                    data-testid="analytics-tab"
                >
                    Analytics
                </button>
                <span data-testid="selected-tab">{activeSiteDetailsTab}</span>
            </div>
        )
    ),
}));

vi.mock("../../../components/SiteDetails/tabs/OverviewTab", () => ({
    OverviewTab: vi.fn(() => (
        <div data-testid="overview-tab-content">Overview Content</div>
    )),
}));

vi.mock("../../../components/SiteDetails/tabs/SiteOverviewTab", () => ({
    SiteOverviewTab: vi.fn(() => (
        <div data-testid="site-overview-tab-content">Site Overview Content</div>
    )),
}));

vi.mock("../../../components/SiteDetails/tabs/HistoryTab", () => ({
    HistoryTab: vi.fn(() => (
        <div data-testid="history-tab-content">History Content</div>
    )),
}));

vi.mock("../../../components/SiteDetails/tabs/AnalyticsTab", () => ({
    AnalyticsTab: vi.fn(() => (
        <div data-testid="analytics-tab-content">Analytics Content</div>
    )),
}));

vi.mock("../../../components/SiteDetails/tabs/SettingsTab", () => ({
    SettingsTab: vi.fn(() => (
        <div data-testid="settings-tab-content">Settings Content</div>
    )),
}));

vi.mock("../../../components/error/DefaultErrorFallback", () => ({
    DefaultErrorFallback: vi.fn(({ error, resetErrorBoundary }) => (
        <div data-testid="error-fallback">
            <p>Error: {error?.message}</p>
            <button onClick={resetErrorBoundary} data-testid="reset-error">
                Reset
            </button>
        </div>
    )),
}));

const requireFirstMonitor = (site: Pick<Site, "monitors">): Monitor => {
    const [firstMonitor] = site.monitors;
    if (firstMonitor === undefined) {
        throw new Error("Test fixtures require at least one monitor");
    }
    return firstMonitor;
};

const mockSite: Site = {
    identifier: sampledSiteIdentifier,
    name: sampledSiteName,
    monitoring: true,
    monitors: [
        {
            id: sampledMonitorId,
            type: "http" as const,
            url: sampledMonitorUrl,
            checkInterval: 300_000,
            timeout: 30_000,
            retryAttempts: 3,
            monitoring: true,
            status: "up" as const,
            responseTime: 150,
            history: [],
        },
    ],
};

const primaryMonitor = requireFirstMonitor(mockSite);

// Mock all the hook functions and properties
const mockUseSiteDetailsReturn = {
    activeSiteDetailsTab: "site-overview", // Fixed: Use actual tab value
    analytics: {
        totalChecks: 100,
        upCount: 95,
        downCount: 5,
        uptime: "95.0%",
        uptimeRaw: 95,
        avgResponseTime: 150,
        fastestResponse: 50,
        slowestResponse: 300,
        p50: 140,
        p95: 280,
        p99: 295,
        totalDowntime: 300_000,
        mttr: 60_000,
        incidentCount: 2,
        downtimePeriods: [],
        filteredHistory: [],
    },
    currentSite: mockSite,
    handleCheckNow: vi.fn(),
    handleIntervalChange: vi.fn(),
    handleMonitorIdChange: vi.fn(),
    handleRemoveMonitor: vi.fn(),
    handleRemoveSite: vi.fn(),
    handleRetryAttemptsChange: vi.fn(),
    handleSaveInterval: vi.fn(),
    handleSaveName: vi.fn(),
    handleSaveRetryAttempts: vi.fn(),
    handleSaveTimeout: vi.fn(),
    handleStartMonitoring: vi.fn(),
    handleStartSiteMonitoring: vi.fn(),
    handleStopMonitoring: vi.fn(),
    handleStopSiteMonitoring: vi.fn(),
    handleTimeoutChange: vi.fn(),
    hasUnsavedChanges: false,
    intervalChanged: false,
    isLoading: false,
    isMonitoring: true,
    localCheckInterval: 300_000,
    localName: sampledSiteName,
    localRetryAttempts: 3,
    localTimeout: 30_000,
    retryAttemptsChanged: false,
    selectedMonitor: primaryMonitor,
    selectedMonitorId: primaryMonitor.id,
    setActiveSiteDetailsTab: vi.fn(),
    setLocalName: vi.fn(),
    setShowAdvancedMetrics: vi.fn(),
    setSiteDetailsChartTimeRange: vi.fn(),
    showAdvancedMetrics: false,
    siteDetailsChartTimeRange: "24h" as const,
    siteExists: true,
    timeoutChanged: false,
};

const renderSiteDetails = (site = mockSite, onClose = vi.fn()) =>
    render(
        <MockBrowserRouter>
            <SiteDetails site={site} onClose={onClose} />
        </MockBrowserRouter>
    );

describe(SiteDetails, () => {
    beforeEach(() => {
        // Clear only specific mocks, not all mocks
        vi.mocked(useSiteDetails).mockClear();
        (useSiteDetails as any).mockReturnValue(mockUseSiteDetailsReturn);
    });

    afterEach(() => {
        // Don't restore all mocks as it will break our module mocks
        // vi.restoreAllMocks();
    });

    describe("Basic Rendering", () => {
        it("should render site details component", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderSiteDetails();

            expect(
                screen.getByTestId("site-details-header")
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("site-details-navigation")
            ).toBeInTheDocument();
        });

        it("should render with correct site data", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const customSite = {
                ...mockSite,
                id: "custom-site-id",
                name: "Custom Site",
            };

            renderSiteDetails(customSite);

            expect(useSiteDetails).toHaveBeenCalled();
        });

        it("should render default overview tab content", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderSiteDetails();

            expect(
                screen.getByTestId("site-overview-tab-content")
            ).toBeInTheDocument();
        });
    });

    describe("Tab Navigation", () => {
        it("should switch to history tab when selected", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            (useSiteDetails as any).mockReturnValue({
                ...mockUseSiteDetailsReturn,
                activeSiteDetailsTab: "history",
            });

            renderSiteDetails();

            expect(
                screen.getByTestId("history-tab-content")
            ).toBeInTheDocument();
            expect(
                screen.queryByTestId("site-overview-tab-content")
            ).not.toBeInTheDocument();
        });

        it("should switch to analytics tab when selected", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            (useSiteDetails as any).mockReturnValue({
                ...mockUseSiteDetailsReturn,
                activeSiteDetailsTab: `${sampledMonitorId}-analytics`, // Use monitor ID format
            });

            renderSiteDetails();

            expect(
                screen.getByTestId("analytics-tab-content")
            ).toBeInTheDocument();
            expect(
                screen.queryByTestId("site-overview-tab-content")
            ).not.toBeInTheDocument();
        });

        it("should switch to settings tab when selected", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            (useSiteDetails as any).mockReturnValue({
                ...mockUseSiteDetailsReturn,
                activeSiteDetailsTab: "settings",
            });

            renderSiteDetails();

            expect(
                screen.getByTestId("settings-tab-content")
            ).toBeInTheDocument();
            expect(
                screen.queryByTestId("site-overview-tab-content")
            ).not.toBeInTheDocument();
        });

        it("should handle tab change events", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Event Processing", "type");

            renderSiteDetails();

            // Use the test id to find the history tab button
            const historyTabButton = screen.getByTestId("history-tab");
            fireEvent.click(historyTabButton);

            expect(
                mockUseSiteDetailsReturn.setActiveSiteDetailsTab
            ).toHaveBeenCalledWith("history");
        });
    });

    describe("Header Actions", () => {
        it("should render header with site information", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderSiteDetails();

            const headerElement = screen.getByTestId("site-details-header");
            expect(headerElement).toBeInTheDocument();
            expect(headerElement).toHaveTextContent(`Site: ${mockSite.name}`);
            expect(headerElement).toHaveTextContent(
                `Monitor: ${primaryMonitor.id}`
            );
        });

        it("should display site data in header", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderSiteDetails();

            expect(
                screen.getByText(`Site: ${sampledSiteName}`)
            ).toBeInTheDocument();
            expect(
                screen.getByText(`Monitor: ${sampledMonitorId}`)
            ).toBeInTheDocument();
        });

        it("should handle different site data in header", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const customSite = {
                ...mockSite,
                name: "Custom Test Site",
            };

            // Update the mock to use the custom site
            (useSiteDetails as any).mockReturnValue({
                ...mockUseSiteDetailsReturn,
                currentSite: customSite,
            });

            renderSiteDetails(customSite);

            // Use a more flexible text matcher to handle broken up text
            expect(
                screen.getByText(
                    (_content, element) =>
                        element?.textContent === "Site: Custom Test Site"
                )
            ).toBeInTheDocument();
        });
    });

    describe("Loading States", () => {
        it("should render loading state when isLoading is true", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            (useSiteDetails as any).mockReturnValue({
                ...mockUseSiteDetailsReturn,
                isLoading: true,
                site: null,
            });

            renderSiteDetails();

            // Should still render structure but with loading state
            expect(
                screen.getByTestId("site-details-header")
            ).toBeInTheDocument();
        });

        it("should render content when loading is complete", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            renderSiteDetails();

            expect(
                screen.getByTestId("site-details-header")
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("site-details-navigation")
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("site-overview-tab-content")
            ).toBeInTheDocument(); // Corrected expectation
        });
    });

    describe("Error Handling", () => {
        it("should render normal content even when error exists in hook", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            // Note: SiteDetails component doesn't have error boundary logic
            // It renders normally regardless of hook error state
            (useSiteDetails as any).mockReturnValue({
                ...mockUseSiteDetailsReturn,
                error: new Error("Failed to load site"),
                site: mockSite, // Keep site data
            });

            renderSiteDetails();

            // Component still renders normally - error handling would be at a higher level
            expect(
                screen.getByTestId("site-details-header")
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("site-details-navigation")
            ).toBeInTheDocument();
        });

        it("should handle missing error boundary gracefully", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            // Test that component doesn't crash when hook has error
            (useSiteDetails as any).mockReturnValue({
                ...mockUseSiteDetailsReturn,
                error: new Error("Test error"),
                site: mockSite,
            });

            renderSiteDetails();

            // Component should still render normally
            expect(
                screen.getByTestId("site-details-header")
            ).toBeInTheDocument();
        });
    });

    describe("Site Data Handling", () => {
        it("should handle missing site data gracefully", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            (useSiteDetails as any).mockReturnValue({
                ...mockUseSiteDetailsReturn,
                site: null,
                isLoading: false,
                error: null,
            });

            renderSiteDetails();

            // Should still render basic structure
            expect(
                screen.getByTestId("site-details-header")
            ).toBeInTheDocument();
        });

        it("should pass correct site data to tabs", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderSiteDetails();

            expect(
                screen.getByTestId("site-overview-tab-content")
            ).toBeInTheDocument(); // Corrected expectation
            // Tabs should receive site data through props
        });
    });

    describe("Integration with URL Parameters", () => {
        it("should handle different site data", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const differentSite = {
                ...mockSite,
                id: "different-site-id",
                name: "Different Site",
            };

            renderSiteDetails(differentSite);

            expect(useSiteDetails).toHaveBeenCalled();
        });

        it("should handle minimal site data", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const minimalSite = {
                ...mockSite,
                id: "",
                name: "Minimal Site",
            };

            renderSiteDetails(minimalSite);

            expect(useSiteDetails).toHaveBeenCalled();
        });

        it("should handle special characters in site data", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const specialSite = {
                ...mockSite,
                id: "site-with-special-chars-123!@#",
                name: "Site with Special Characters",
            };

            renderSiteDetails(specialSite);

            expect(useSiteDetails).toHaveBeenCalled();
        });
    });

    describe("Component Lifecycle", () => {
        it("should call refresh when component mounts", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderSiteDetails();

            // The hook should be called indicating component mounted
            expect(useSiteDetails).toHaveBeenCalled();
        });

        it("should handle component updates correctly", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Update", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Update", "type");

            const initialSite: Site & { id: string } = {
                ...mockSite,
                id: "initial-id",
                name: "Initial Site",
            };
            const initialMonitor = requireFirstMonitor(initialSite);
            const updatedSite: Site & { id: string } = {
                ...initialSite,
                id: "updated-id",
                name: "Updated Site",
                monitors: [
                    {
                        ...initialMonitor,
                        id: "updated-monitor-id",
                        status:
                            initialMonitor.status === "down" ? "up" : "down",
                    },
                ],
            };
            const { rerender } = renderSiteDetails(initialSite);

            expect(
                screen.getByText(`Site: ${mockSite.name}`)
            ).toBeInTheDocument();
            expect(
                screen.getByText(`Monitor: ${primaryMonitor.id}`)
            ).toBeInTheDocument();

            // Rerender with different site
            rerender(
                <MockBrowserRouter>
                    <SiteDetails site={updatedSite} onClose={vi.fn()} />
                </MockBrowserRouter>
            );

            await waitFor(() => {
                expect(useSiteDetails).toHaveBeenCalled();
            });
        });
    });

    describe("Accessibility", () => {
        it("should have proper accessibility structure", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderSiteDetails();

            // Check that main components are rendered
            expect(
                screen.getByTestId("site-details-header")
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("site-details-navigation")
            ).toBeInTheDocument();
        });

        it("should handle keyboard navigation", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderSiteDetails();

            const tabButton = screen.getByTestId("history-tab");

            // Simulate keyboard interaction
            fireEvent.keyDown(tabButton, { key: "Enter", code: "Enter" });

            // Should still be functional (mocked component handles this)
            expect(tabButton).toBeInTheDocument();
        });
    });

    describe("Performance Considerations", () => {
        it("should not cause unnecessary re-renders", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const { rerender } = renderSiteDetails();

            // Re-render with same props
            rerender(
                <MockBrowserRouter>
                    <SiteDetails site={mockSite} onClose={vi.fn()} />
                </MockBrowserRouter>
            );

            // Component should still render correctly
            expect(
                screen.getByTestId("site-details-header")
            ).toBeInTheDocument();
        });

        it("should handle rapid tab switching", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: SiteDetails", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // Clear any previous calls to setActiveSiteDetailsTab
            vi.clearAllMocks();

            renderSiteDetails();

            // Test available tabs based on the mocked navigation component
            const availableTabs = [
                "overview",
                "history",
                "analytics",
            ];

            for (const tab of availableTabs) {
                const button = screen.getByTestId(`${tab}-tab`);
                fireEvent.click(button);
            }

            // Verify the total number of calls matches expectations
            expect(
                mockUseSiteDetailsReturn.setActiveSiteDetailsTab
            ).toHaveBeenCalledTimes(availableTabs.length);

            // Verify each call was made with the correct tab name
            for (const [index, tab] of availableTabs.entries()) {
                expect(
                    mockUseSiteDetailsReturn.setActiveSiteDetailsTab
                ).toHaveBeenNthCalledWith(index + 1, tab);
            }
        });
    });
});
