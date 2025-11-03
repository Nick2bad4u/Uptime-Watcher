/**
 * @file Coverage-oriented tests for header-oriented UI components.
 */

import type { HTMLAttributes, ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const tooltipModuleMock = vi.hoisted(() => ({
    Tooltip: ({
        children,
        content,
    }: {
        children: (props: Record<string, never>) => ReactNode;
        content?: ReactNode;
    }) => (
        <div data-testid="mock-tooltip">
            <span data-testid="mock-tooltip-content">{content}</span>
            {children({})}
        </div>
    ),
}));

vi.mock("../../components/common/Tooltip/Tooltip", () => tooltipModuleMock);

const themedTextModuleMock = vi.hoisted(() => ({
    ThemedText: ({
        children,
        className,
        size,
        variant,
        weight,
        ...props
    }: ThemedTextProperties) => (
        <span
            {...props}
            className={className}
            data-size={size}
            data-variant={variant}
            data-weight={weight}
        >
            {children}
        </span>
    ),
}));

vi.mock("../../theme/components/ThemedText", () => themedTextModuleMock);

const themedBoxModuleMock = vi.hoisted(() => ({
    ThemedBox: ({
        children,
        className,
        padding,
        rounded,
        shadow,
        surface,
        ...rest
    }: ThemedBoxProperties) => (
        <div
            {...rest}
            className={className}
            data-padding={padding}
            data-rounded={rounded}
            data-shadow={shadow}
            data-surface={surface}
        >
            {children}
        </div>
    ),
}));

vi.mock("../../theme/components/ThemedBox", () => themedBoxModuleMock);

const statusIndicatorRenderSpy = vi.hoisted(() => ({
    render: vi.fn(({ status }: { status: string }) => (
        <span data-testid={`status-indicator-${status}`} />
    )),
}));

vi.mock("../../theme/components/StatusIndicator", () => ({
    StatusIndicator: statusIndicatorRenderSpy.render,
}));

const statusSubscriptionIndicatorSpy = vi.hoisted(() => ({
    component: vi.fn(() => (
        <div data-testid="status-subscription-indicator-mock" />
    )),
}));

vi.mock("../../components/Header/StatusSubscriptionIndicator", () => ({
    StatusSubscriptionIndicator: statusSubscriptionIndicatorSpy.component,
}));

const uiStoreState = vi.hoisted(() => ({
    layout: "table" as "table" | "card-large",
    setShowAddSiteModal: vi.fn(),
    setShowSettings: vi.fn(),
}));

vi.mock("../../stores/ui/useUiStore", () => ({
    useUIStore: () => ({
        setShowAddSiteModal: uiStoreState.setShowAddSiteModal,
        setShowSettings: uiStoreState.setShowSettings,
        siteListLayout: uiStoreState.layout,
    }),
}));

const themeState = vi.hoisted(() => ({
    isDark: false,
    toggleTheme: vi.fn(),
}));

vi.mock("../../theme/useTheme", () => ({
    useTheme: () => ({
        isDark: themeState.isDark,
        toggleTheme: themeState.toggleTheme,
    }),
    useAvailabilityColors: () => ({
        getAvailabilityColor: (value: number) => `color-${value}`,
    }),
}));

const metricsState = vi.hoisted(() => ({
    metrics: {
        activeMonitors: 3,
        incidentCount: 1,
        monitorStatusCounts: {
            degraded: 2,
            down: 1,
            paused: 4,
            pending: 5,
            total: 6,
            up: 7,
        },
        totalMonitors: 6,
        totalSites: 2,
        uptimePercentage: 99,
    },
}));

vi.mock("../../hooks/useGlobalMonitoringMetrics", () => ({
    useGlobalMonitoringMetrics: () => metricsState.metrics,
}));

interface ThemedTextProperties extends HTMLAttributes<HTMLSpanElement> {
    readonly children?: ReactNode;
    readonly size?: string;
    readonly variant?: string;
    readonly weight?: string;
}

interface ThemedBoxProperties extends HTMLAttributes<HTMLDivElement> {
    readonly children?: ReactNode;
    readonly padding?: string;
    readonly rounded?: string;
    readonly shadow?: string;
    readonly surface?: string;
}

import { HealthIndicator } from "../../components/Header/HealthIndicator";
import { StatusSummary } from "../../components/Header/StatusSummary";
import { HeaderControls } from "../../components/Header/HeaderControls";
import { Header } from "../../components/Header/Header";

beforeEach(() => {
    uiStoreState.layout = "table";
    uiStoreState.setShowAddSiteModal.mockClear();
    uiStoreState.setShowSettings.mockClear();
    themeState.isDark = false;
    themeState.toggleTheme.mockClear();
    statusSubscriptionIndicatorSpy.component.mockClear();
    statusIndicatorRenderSpy.render.mockClear();
});

describe(HealthIndicator, () => {
    it("renders uptime percentage with consistent color mapping", () => {
        const getAvailabilityColor = vi.fn((value: number) => `color-${value}`);

        render(
            <HealthIndicator
                getAvailabilityColor={getAvailabilityColor}
                uptimePercentage={97}
            />
        );

        expect(getAvailabilityColor).toHaveBeenCalledTimes(1);
        expect(getAvailabilityColor).toHaveBeenCalledWith(97);

        const healthText = screen.getByText("97%");
        expect(healthText).toHaveAttribute("data-health-color", "color-97");

        const container = healthText.closest("[data-health-color]");
        expect(container).not.toBeNull();
        expect(container).toHaveAttribute("data-health-color", "color-97");

        expect(screen.getByText("Health")).toBeInTheDocument();
    });
});

describe(StatusSummary, () => {
    it("shows all status pills when monitors exist", () => {
        const getAvailabilityColor = vi.fn(() => "summary-color");

        render(
            <StatusSummary
                degradedMonitors={2}
                downMonitors={1}
                getAvailabilityColor={getAvailabilityColor}
                pausedMonitors={3}
                pendingMonitors={4}
                totalMonitors={5}
                upMonitors={7}
                uptimePercentage={96}
            />
        );

        expect(screen.getByTestId("header-status-summary")).toBeInTheDocument();
        expect(screen.getByText("Degraded")).toBeInTheDocument();
        expect(screen.getByText("Down")).toBeInTheDocument();
        expect(screen.getByText("Pending")).toBeInTheDocument();
        expect(screen.getByText("Paused")).toBeInTheDocument();
        expect(screen.getByText("Total")).toBeInTheDocument();
        expect(screen.getByText("96%")).toBeInTheDocument();
        expect(getAvailabilityColor).toHaveBeenCalledWith(96);
    });

    it("omits optional pills when totals are zero", () => {
        render(
            <StatusSummary
                degradedMonitors={0}
                downMonitors={0}
                getAvailabilityColor={() => "color"}
                pausedMonitors={0}
                pendingMonitors={0}
                totalMonitors={0}
                upMonitors={0}
                uptimePercentage={0}
            />
        );

        expect(screen.queryByText("Degraded")).toBeNull();
        expect(screen.queryByText("Total")).toBeNull();
        expect(screen.queryByText("Health")).toBeNull();
    });

    it("uses singular phrasing when exactly one monitor is configured", () => {
        render(
            <StatusSummary
                degradedMonitors={0}
                downMonitors={0}
                getAvailabilityColor={() => "single"}
                pausedMonitors={0}
                pendingMonitors={0}
                totalMonitors={1}
                upMonitors={1}
                uptimePercentage={100}
            />
        );

        expect(
            screen.getAllByTestId("mock-tooltip-content")[0]
        ).toHaveTextContent("1 monitor");
    });
});

describe(HeaderControls, () => {
    it("invokes callbacks for each control button", () => {
        const showAddSpy = vi.fn();
        const showSettingsSpy = vi.fn();
        const toggleThemeSpy = vi.fn();

        render(
            <HeaderControls
                isDark={false}
                onShowAddSiteModal={showAddSpy}
                onShowSettings={showSettingsSpy}
                onToggleTheme={toggleThemeSpy}
                orientation="horizontal"
            />
        );

        fireEvent.click(screen.getByTestId("header-control-add-site"));
        fireEvent.click(screen.getByTestId("header-control-toggle-theme"));
        fireEvent.click(screen.getByTestId("header-control-open-settings"));

        expect(showAddSpy).toHaveBeenCalledTimes(1);
        expect(toggleThemeSpy).toHaveBeenCalledTimes(1);
        expect(showSettingsSpy).toHaveBeenCalledTimes(1);

        expect(
            screen.getByTestId("header-control-toggle-theme")
        ).toHaveAttribute("aria-label", "Switch to dark theme");
    });

    it("renders vertical orientation and light-theme label when dark", () => {
        render(
            <HeaderControls
                isDark
                onShowAddSiteModal={vi.fn()}
                onShowSettings={vi.fn()}
                onToggleTheme={vi.fn()}
                orientation="vertical"
            />
        );

        expect(screen.getByTestId("header-controls")).toHaveClass(
            "header-controls--vertical"
        );

        expect(
            screen.getByTestId("header-control-toggle-theme")
        ).toHaveAttribute("aria-label", "Switch to light theme");
    });
});

describe("Header component", () => {
    it("renders metrics and summary when layout is not card-large", () => {
        render(<Header />);

        expect(screen.getByTestId("app-header")).toBeInTheDocument();
        expect(screen.getByText("Active")).toBeInTheDocument();
        expect(screen.getByText("3/6")).toBeInTheDocument();
        expect(screen.getByText("Global Uptime")).toBeInTheDocument();
        expect(screen.getAllByText("99%")).toHaveLength(2);
        expect(screen.getByTestId("header-status-summary")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("header-control-add-site"));
        fireEvent.click(screen.getByTestId("header-control-open-settings"));

        expect(uiStoreState.setShowAddSiteModal).toHaveBeenCalledWith(true);
        expect(uiStoreState.setShowSettings).toHaveBeenCalledWith(true);
        expect(statusSubscriptionIndicatorSpy.component).toHaveBeenCalled();
    });

    it("suppresses summary when layout is card-large", () => {
        uiStoreState.layout = "card-large";

        render(<Header />);

        expect(screen.queryByTestId("header-status-summary")).toBeNull();
    });
});
