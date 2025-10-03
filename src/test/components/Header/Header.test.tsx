import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Header } from "../../../components/Header/Header";
import { useSidebarLayout } from "../../../components/Layout/SidebarLayoutContext";
import { useGlobalMonitoringMetrics } from "../../../hooks/useGlobalMonitoringMetrics";
import { useUIStore } from "../../../stores/ui/useUiStore";
import type { UIStore } from "../../../stores/ui/types";
import { useAvailabilityColors, useTheme } from "../../../theme/useTheme";

vi.mock("../../../stores/ui/useUiStore", () => ({ useUIStore: vi.fn() }));
vi.mock("../../../theme/useTheme", () => ({
    useAvailabilityColors: vi.fn(),
    useTheme: vi.fn(),
}));
vi.mock("../../../hooks/useGlobalMonitoringMetrics", () => ({
    useGlobalMonitoringMetrics: vi.fn(),
}));
vi.mock("../../../components/Layout/SidebarLayoutContext", () => ({
    useSidebarLayout: vi.fn(),
}));

const mockUseUIStore = vi.mocked(useUIStore);
const mockUseTheme = vi.mocked(useTheme);
const mockUseAvailabilityColors = vi.mocked(useAvailabilityColors);
const mockUseGlobalMonitoringMetrics = vi.mocked(useGlobalMonitoringMetrics);
const mockUseSidebarLayout = vi.mocked(useSidebarLayout);

const createUiState = (): UIStore => ({
    activeSiteDetailsTab: "site-overview",
    openExternal: vi.fn(),
    selectedSiteId: undefined,
    selectSite: vi.fn(),
    setActiveSiteDetailsTab: vi.fn(),
    setShowAddSiteModal: vi.fn(),
    setShowAdvancedMetrics: vi.fn(),
    setShowSettings: vi.fn(),
    setShowSiteDetails: vi.fn(),
    setSiteCardPresentation: vi.fn(),
    setSiteDetailsChartTimeRange: vi.fn(),
    setSiteListLayout: vi.fn(),
    showAddSiteModal: false,
    showAdvancedMetrics: false,
    showSettings: false,
    showSiteDetails: false,
    siteCardPresentation: "grid",
    siteDetailsChartTimeRange: "24h",
    siteListLayout: "card-compact",
});

const metricsFixture = {
    activeMonitors: 8,
    averageResponseTime: 245,
    incidentCount: 2,
    monitorStatusCounts: {
        degraded: 1,
        down: 1,
        paused: 0,
        pending: 1,
        total: 10,
        up: 7,
    },
    totalMonitors: 10,
    totalSites: 5,
    uptimePercentage: 92,
} as const;

beforeEach(() => {
    vi.clearAllMocks();

    const uiState = createUiState();
    mockUseUIStore.mockImplementation((selector) => selector(uiState));

    mockUseTheme.mockReturnValue({
        availableThemes: ["light", "dark"],
        currentTheme: {
            borderRadius: {
                full: "9999px",
                lg: "0.75rem",
                md: "0.5rem",
                none: "0",
                sm: "0.25rem",
                xl: "1rem",
            },
            colors: {
                background: {
                    modal: "#ffffff",
                    primary: "#ffffff",
                    secondary: "#f5f5f5",
                    tertiary: "#f0f0f0",
                },
                border: {
                    focus: "#000000",
                    primary: "#e0e0e0",
                    secondary: "#cfcfcf",
                },
                error: "#ff0000",
                errorAlert: "#ff0000",
                hover: {
                    dark: "#222222",
                    light: "#f0f0f0",
                    medium: "#cccccc",
                },
                info: "#2196f3",
                primary: {
                    50: "#f9fafb",
                    100: "#f4f6fb",
                    200: "#e4e9fb",
                    300: "#c6cef7",
                    400: "#9ca9f0",
                    500: "#6b7fe8",
                    600: "#4b5ee0",
                    700: "#3a4bbd",
                    800: "#2c3a95",
                    900: "#1f296e",
                },
                status: {
                    degraded: "#f59e0b",
                    down: "#ef4444",
                    paused: "#9ca3af",
                    pending: "#f97316",
                    unknown: "#6b7280",
                    up: "#22c55e",
                },
                success: "#22c55e",
                warning: "#f59e0b",
            },
            isDark: false,
            name: "light",
            shadows: {
                lg: "0 10px 30px rgba(0,0,0,0.12)",
                md: "0 4px 12px rgba(0,0,0,0.1)",
                none: "none",
                sm: "0 2px 4px rgba(0,0,0,0.08)",
                xl: "0 20px 40px rgba(0,0,0,0.14)",
            },
            spacing: {
                lg: "1.5rem",
                md: "1rem",
                none: "0",
                sm: "0.5rem",
                xl: "2rem",
                xs: "0.25rem",
            },
            typography: {
                fontFamily: "Inter, sans-serif",
                fontSize: {
                    base: "1rem",
                    lg: "1.125rem",
                    sm: "0.875rem",
                    xl: "1.25rem",
                    xs: "0.75rem",
                },
                fontWeight: {
                    bold: "700",
                    medium: "500",
                    regular: "400",
                    semibold: "600",
                },
            },
        },
        getColor: vi.fn(() => "#ffffff"),
        getStatusColor: vi.fn(() => "#22c55e"),
        isDark: false,
        setTheme: vi.fn(),
        systemTheme: "light",
        themeManager: {} as never,
        themeName: "light",
        themeVersion: 1,
        toggleTheme: vi.fn(),
    } as unknown as ReturnType<typeof useTheme>);

    mockUseAvailabilityColors.mockReturnValue({
        getAvailabilityColor: vi.fn(() => "status-success"),
        getAvailabilityDescription: vi.fn(() => "Operational"),
        getAvailabilityVariant: vi.fn<
            (percentage: number) => "danger" | "success" | "warning"
        >(() => "success"),
    });

    mockUseGlobalMonitoringMetrics.mockReturnValue(metricsFixture);

    mockUseSidebarLayout.mockReturnValue({
        isSidebarOpen: true,
        toggleSidebar: vi.fn(),
    });
});

describe(Header, () => {
    it("displays summary metrics", () => {
        render(<Header />);

        expect(screen.getByText("Uptime Watcher")).toBeInTheDocument();
        expect(screen.getByText("Global uptime")).toBeInTheDocument();
        expect(screen.getByText("92%")).toBeInTheDocument();
        expect(screen.getByText(/tracking 5 sites/i)).toBeInTheDocument();
    });

    it("toggles sidebar when nav button clicked", () => {
        const layout = { isSidebarOpen: true, toggleSidebar: vi.fn() };
        mockUseSidebarLayout.mockReturnValue(layout);

        render(<Header />);
        fireEvent.click(screen.getByLabelText("Toggle navigation sidebar"));

        expect(layout.toggleSidebar).toHaveBeenCalledTimes(1);
    });

    it("opens add site modal", () => {
        const uiState = createUiState();
        mockUseUIStore.mockImplementation((selector) => selector(uiState));

        render(<Header />);
        fireEvent.click(screen.getByLabelText("Add new site"));

        expect(uiState.setShowAddSiteModal).toHaveBeenCalledWith(true);
    });

    it("opens settings modal", () => {
        const uiState = createUiState();
        mockUseUIStore.mockImplementation((selector) => selector(uiState));

        render(<Header />);
        fireEvent.click(screen.getByLabelText("Settings"));

        expect(uiState.setShowSettings).toHaveBeenCalledWith(true);
    });

    it("toggles theme when requested", () => {
        const toggleTheme = vi.fn();
        mockUseTheme.mockReturnValue({
            isDark: false,
            toggleTheme,
        } as unknown as ReturnType<typeof useTheme>);

        render(<Header />);
        fireEvent.click(screen.getByLabelText("Toggle theme"));

        expect(toggleTheme).toHaveBeenCalledTimes(1);
    });

    it("requests availability colour for uptime", () => {
        const getAvailabilityColor = vi.fn();
        mockUseAvailabilityColors.mockReturnValue({
            getAvailabilityColor,
            getAvailabilityDescription: vi.fn(),
            getAvailabilityVariant: vi.fn<
                (percentage: number) => "danger" | "success" | "warning"
            >(() => "success"),
        });

        render(<Header />);

        expect(getAvailabilityColor).toHaveBeenCalledWith(
            metricsFixture.uptimePercentage
        );
    });
});
