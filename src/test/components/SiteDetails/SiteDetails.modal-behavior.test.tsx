import "@testing-library/jest-dom";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Site } from "@shared/types";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteDetails } from "../../../components/SiteDetails/SiteDetails";
import { useSiteDetails } from "../../../hooks/site/useSiteDetails";

const waitForAnimationMock = vi.hoisted(() => vi.fn(() => Promise.resolve()));

vi.mock("../../../hooks/site/useSiteDetails", () => ({
    useSiteDetails: vi.fn(),
}));

vi.mock("../../../utils/time/waitForAnimation", () => ({
    waitForAnimation: waitForAnimationMock,
}));

vi.mock("../../../theme/useTheme", () => ({
    useTheme: () => ({
        currentTheme: {
            colors: {
                error: { 500: "#dc2626" },
                primary: { 500: "#2563eb" },
                success: "#22c55e",
                warning: "#f97316",
            },
        },
        isDark: false,
    }),
    useAvailabilityColors: () => ({
        getAvailabilityDescription: vi.fn(() => "Nominal"),
    }),
}));

vi.mock("../../../services/chartConfig", () => ({
    ChartConfigService: class {
        getLineChartConfig() {
            return { kind: "line" };
        }

        getBarChartConfig() {
            return { kind: "bar" };
        }

        getDoughnutChartConfig() {
            return { kind: "doughnut" };
        }
    },
}));

const siteOverviewTabProps: any[] = [];
const overviewTabProps: any[] = [];
const analyticsTabProps: any[] = [];
const historyTabProps: any[] = [];
const settingsTabProps: any[] = [];

vi.mock("../../../components/SiteDetails/SiteDetailsHeader", () => ({
    SiteDetailsHeader: ({ children }: { readonly children?: ReactNode }) => (
        <header data-testid="site-details-header">{children}</header>
    ),
}));

vi.mock("../../../components/SiteDetails/SiteDetailsNavigation", () => ({
    SiteDetailsNavigation: () => (
        <nav data-testid="site-details-navigation">navigation</nav>
    ),
}));

vi.mock("../../../components/shared/SurfaceContainer", () => ({
    SurfaceContainer: ({ children }: { readonly children?: ReactNode }) => (
        <section data-testid="surface-container">{children}</section>
    ),
}));

vi.mock("../../../theme/components/ThemedBox", () => ({
    ThemedBox: ({ children, ...props }: any) => (
        <div data-testid="themed-box" {...props}>
            {children}
        </div>
    ),
}));

vi.mock("../../../components/SiteDetails/tabs/SiteOverviewTab", () => ({
    SiteOverviewTab: (props: any) => {
        siteOverviewTabProps.push(props);
        return <div data-testid="site-overview-tab">site overview</div>;
    },
}));

vi.mock("../../../components/SiteDetails/tabs/OverviewTab", () => ({
    OverviewTab: (props: any) => {
        overviewTabProps.push(props);
        return <div data-testid="monitor-overview-tab">overview</div>;
    },
}));

vi.mock("../../../components/SiteDetails/tabs/AnalyticsTab", () => ({
    AnalyticsTab: (props: any) => {
        analyticsTabProps.push(props);
        return <div data-testid="analytics-tab">analytics</div>;
    },
}));

vi.mock("../../../components/SiteDetails/tabs/HistoryTab", () => ({
    HistoryTab: (props: any) => {
        historyTabProps.push(props);
        return <div data-testid="history-tab">history</div>;
    },
}));

vi.mock("../../../components/SiteDetails/tabs/SettingsTab", () => ({
    SettingsTab: (props: any) => {
        settingsTabProps.push(props);
        return <div data-testid="settings-tab">settings</div>;
    },
}));

const mockUseSiteDetails = vi.mocked(useSiteDetails);

const baseSite: Site = {
    identifier: "site-123",
    name: "Site Under Test",
    monitors: [],
    monitoring: true,
};

const baseMonitor = {
    checkInterval: 60_000,
    history: [],
    id: "monitor-1",
    monitoring: true,
    responseTime: 250,
    retryAttempts: 2,
    status: "up" as const,
    timeout: 5000,
    type: "http" as const,
};

const createHookState = (overrides: Record<string, unknown> = {}) => {
    const analytics = {
        avgResponseTime: 200,
        degradedCount: 2,
        downCount: 1,
        downtimePeriods: [],
        fastestResponse: 120,
        filteredHistory: [
            {
                responseTime: 345,
                timestamp: 1_700_000_000_000,
            },
        ],
        mttr: "3m",
        p50: 180,
        p95: 400,
        p99: 550,
        slowestResponse: 600,
        totalChecks: 42,
        totalDowntime: 1200,
        upCount: 5,
        uptime: "95.5%",
        ...(overrides["analytics"] as Record<string, unknown> | undefined),
    };

    return {
        activeSiteDetailsTab: "site-overview",
        analytics,
        currentSite: baseSite,
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
        localCheckInterval: 60_000,
        localName: baseSite.name,
        localRetryAttempts: 2,
        localTimeout: 5000,
        retryAttemptsChanged: false,
        selectedMonitor: baseMonitor,
        selectedMonitorId: baseMonitor.id,
        setActiveSiteDetailsTab: vi.fn(),
        setLocalName: vi.fn(),
        setSiteDetailsChartTimeRange: vi.fn(),
        showAdvancedMetrics: false,
        siteDetailsChartTimeRange: "24h",
        siteExists: true,
        timeoutChanged: false,
        ...overrides,
    } as any;
};

const renderSiteDetails = (hookOverrides?: Record<string, unknown>) => {
    mockUseSiteDetails.mockReturnValue(createHookState(hookOverrides));
    return render(<SiteDetails onClose={vi.fn()} site={baseSite} />);
};

describe(SiteDetails, () => {
    beforeEach(() => {
        waitForAnimationMock.mockClear();
        mockUseSiteDetails.mockReset();
        siteOverviewTabProps.length = 0;
        overviewTabProps.length = 0;
        analyticsTabProps.length = 0;
        historyTabProps.length = 0;
        settingsTabProps.length = 0;
    });

    it("renders the site overview tab with parsed uptime", () => {
        renderSiteDetails();

        expect(screen.getByTestId("site-overview-tab")).toBeInTheDocument();
        expect(siteOverviewTabProps).toHaveLength(1);
        expect(siteOverviewTabProps[0]?.uptime).toBe(95.5);
    });

    it("closes when the overlay backdrop is clicked", async () => {
        const onClose = vi.fn();
        mockUseSiteDetails.mockReturnValue(createHookState());

        render(<SiteDetails onClose={onClose} site={baseSite} />);

        const overlay = screen.getByRole("button", {
            name: /close site details/i,
        });
        const user = userEvent.setup();
        await user.click(overlay);

        expect(waitForAnimationMock).toHaveBeenCalled();
        await waitFor(() => expect(onClose).toHaveBeenCalled());
    });

    it("closes when the overlay receives keyboard dismissal", async () => {
        const onClose = vi.fn();
        mockUseSiteDetails.mockReturnValue(createHookState());

        render(<SiteDetails onClose={onClose} site={baseSite} />);

        const overlay = screen.getByRole("button", {
            name: /close site details/i,
        });
        fireEvent.keyDown(overlay, { key: "Escape" });

        expect(waitForAnimationMock).toHaveBeenCalled();
        await waitFor(() => expect(onClose).toHaveBeenCalled());
    });

    it("does not close when clicking inside the modal content", async () => {
        const onClose = vi.fn();
        mockUseSiteDetails.mockReturnValue(createHookState());

        render(<SiteDetails onClose={onClose} site={baseSite} />);

        const modal = screen.getByTestId("site-details-modal");
        const user = userEvent.setup();
        await user.click(modal);

        expect(onClose).not.toHaveBeenCalled();
    });

    it("toggles monitor overview tab when selected monitor tab is active", () => {
        mockUseSiteDetails.mockReturnValue(
            createHookState({ activeSiteDetailsTab: "monitor-overview" })
        );

        render(<SiteDetails onClose={vi.fn()} site={baseSite} />);

        expect(screen.getByTestId("monitor-overview-tab")).toBeInTheDocument();
        expect(overviewTabProps.at(-1)?.selectedMonitor?.id).toBe(
            baseMonitor.id
        );
    });

    it("returns null when the site is missing", () => {
        mockUseSiteDetails.mockReturnValue(
            createHookState({ siteExists: false })
        );

        const { container } = render(
            <SiteDetails onClose={vi.fn()} site={baseSite} />
        );

        expect(container.firstChild).toBeNull();
    });

    it("renders the analytics tab with hydrated chart props", () => {
        const filteredHistory = [
            {
                responseTime: 512,
                timestamp: 1_701_000_000_000,
            },
        ];

        renderSiteDetails({
            activeSiteDetailsTab: `${baseMonitor.id}-analytics`,
            analytics: {
                degradedCount: 4,
                filteredHistory,
            },
        });

        expect(screen.getByTestId("analytics-tab")).toBeInTheDocument();
        expect(analyticsTabProps).toHaveLength(1);
        const props = analyticsTabProps[0];
        expect(props.lineChartData.datasets[0]?.data).toEqual([
            filteredHistory[0]?.responseTime,
        ]);
        expect(props.lineChartData.labels[0]).toEqual(
            new Date(filteredHistory[0]?.timestamp ?? 0)
        );
    });

    it("renders the history tab when selected", () => {
        renderSiteDetails({ activeSiteDetailsTab: "history" });

        expect(screen.getByTestId("history-tab")).toBeInTheDocument();
        expect(historyTabProps.at(-1)?.selectedMonitor?.id).toBe(
            baseMonitor.id
        );
    });

    it("bridges the settings tab save interval handler", async () => {
        const handleSaveInterval = vi.fn().mockResolvedValue(undefined);

        renderSiteDetails({
            activeSiteDetailsTab: "settings",
            handleSaveInterval,
        });

        expect(screen.getByTestId("settings-tab")).toBeInTheDocument();
        const props = settingsTabProps.at(-1);
        expect(typeof props.handleSaveInterval).toBe("function");

        props.handleSaveInterval();
        await waitFor(() =>
            expect(handleSaveInterval).toHaveBeenCalledTimes(1)
        );
    });
});
