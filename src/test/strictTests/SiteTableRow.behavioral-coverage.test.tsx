/**
 * @file Behavioral coverage tests for `SiteTableRow` interaction handlers.
 */

import type { ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "@shared/types";

const useSiteState = vi.hoisted(() => ({
    factory: vi.fn(),
}));

vi.mock("../../hooks/site/useSite", () => ({
    useSite: (site: Site) => useSiteState.factory(site),
}));

const marqueeTextMock = vi.hoisted(() => ({
    component: ({ children, text }: { children?: ReactNode; text: string }) => (
        <div data-testid="marquee-text">{children ?? text}</div>
    ),
}));

vi.mock("../../components/common/MarqueeText/MarqueeText", () => ({
    MarqueeText: marqueeTextMock.component,
}));

const themedTextMock = vi.hoisted(() => ({
    component: ({ children }: { children?: ReactNode }) => (
        <span>{children}</span>
    ),
}));

vi.mock("../../theme/components/ThemedText", () => ({
    ThemedText: themedTextMock.component,
}));

const statusBadgeMock = vi.hoisted(() => ({
    props: [] as Record<string, unknown>[],
    component: (props: Record<string, unknown>) => {
        statusBadgeMock.props.push(props);
        return <div data-testid="status-badge" />;
    },
}));

vi.mock("../../components/common/StatusBadge", () => ({
    StatusBadge: statusBadgeMock.component,
}));

const monitorSelectorMock = vi.hoisted(() => ({
    props: [] as Record<string, unknown>[],
    component: (props: {
        monitors: unknown;
        onChange: (event: { target: { value: string } }) => void;
        selectedMonitorId: string;
    }) => {
        monitorSelectorMock.props.push(props);
        return (
            <button
                data-testid="monitor-selector"
                onClick={() =>
                    props.onChange({ target: { value: "monitor-2" } })
                }
                type="button"
            >
                selector
            </button>
        );
    },
}));

vi.mock(
    "../../components/Dashboard/SiteCard/components/MonitorSelector",
    () => ({
        MonitorSelector: monitorSelectorMock.component,
    })
);

const actionButtonGroupMock = vi.hoisted(() => ({
    props: [] as Record<string, unknown>[],
    component: (props: {
        onCheckNow: () => void;
        onStartMonitoring: () => void;
        onStopMonitoring: () => void;
        onStartSiteMonitoring: () => void;
        onStopSiteMonitoring: () => void;
        isLoading: boolean;
    }) => {
        actionButtonGroupMock.props.push(props);
        return (
            <div data-testid="action-button-group">
                <button
                    data-prevent-row-activation
                    onClick={props.onCheckNow}
                    type="button"
                >
                    check
                </button>
            </div>
        );
    },
}));

vi.mock(
    "../../components/Dashboard/SiteCard/components/ActionButtonGroup",
    () => ({
        ActionButtonGroup: actionButtonGroupMock.component,
    })
);

interface UseSiteReturnValue {
    handleCardClick: ReturnType<typeof vi.fn>;
    handleCheckNow: ReturnType<typeof vi.fn>;
    handleMonitorIdChange: ReturnType<typeof vi.fn>;
    handleStartMonitoring: ReturnType<typeof vi.fn>;
    handleStartSiteMonitoring: ReturnType<typeof vi.fn>;
    handleStopMonitoring: ReturnType<typeof vi.fn>;
    handleStopSiteMonitoring: ReturnType<typeof vi.fn>;
    isLoading: boolean;
    isMonitoring: boolean;
    latestSite: Site;
    monitor: object | null;
    responseTime: number | null;
    selectedMonitorId: string;
    status: string;
    uptime: number;
    allMonitorsRunning: boolean;
}

const createUseSiteReturn = (
    overrides: Partial<UseSiteReturnValue> = {}
): UseSiteReturnValue => {
    const baseSite: Site = {
        identifier: "alpha",
        monitoring: true,
        monitors: [
            {
                checkInterval: 60_000,
                history: [],
                id: "monitor-1",
                monitoring: true,
                responseTime: 120,
                retryAttempts: 0,
                status: "up",
                timeout: 30_000,
                type: "http",
                url: "https://primary.example",
            },
            {
                checkInterval: 60_000,
                history: [],
                id: "monitor-2",
                monitoring: false,
                responseTime: 0,
                retryAttempts: 0,
                status: "paused",
                timeout: 30_000,
                type: "http",
                url: "https://secondary.example",
            },
        ],
        name: "Alpha Site",
    };

    return {
        allMonitorsRunning: false,
        handleCardClick: vi.fn(),
        handleCheckNow: vi.fn(),
        handleMonitorIdChange: vi.fn(),
        handleStartMonitoring: vi.fn(),
        handleStartSiteMonitoring: vi.fn(),
        handleStopMonitoring: vi.fn(),
        handleStopSiteMonitoring: vi.fn(),
        isLoading: false,
        isMonitoring: true,
        latestSite: baseSite,
        monitor: baseSite.monitors[0] ?? null,
        responseTime: 142,
        selectedMonitorId: "monitor-1",
        status: "up",
        uptime: 99,
        ...overrides,
    };
};

const sampleSite: Site = {
    identifier: "alpha",
    monitoring: true,
    monitors: [],
    name: "Alpha Site",
};

import { SiteTableRow } from "../../components/Dashboard/SiteList/SiteTableRow";

const renderSiteTableRow = (site: Site = sampleSite): void => {
    render(
        <table>
            <tbody>
                <SiteTableRow site={site} />
            </tbody>
        </table>
    );
};

describe("SiteTableRow interaction coverage", () => {
    beforeEach(() => {
        statusBadgeMock.props.length = 0;
        monitorSelectorMock.props.length = 0;
        actionButtonGroupMock.props.length = 0;
        useSiteState.factory.mockReset();
    });

    it("activates and suppresses clicks based on target element", () => {
        const useSiteResult = createUseSiteReturn();
        useSiteState.factory.mockReturnValue(useSiteResult);

        renderSiteTableRow();

        const row = screen.getByRole("row");
        fireEvent.click(row);
        expect(useSiteResult.handleCardClick).toHaveBeenCalledTimes(1);

        const button = screen.getByTestId("action-button-group");
        fireEvent.click(button.querySelector("[data-prevent-row-activation]")!);
        expect(useSiteResult.handleCardClick).toHaveBeenCalledTimes(1);

        const synthetic = new MouseEvent("click", { bubbles: true });
        Object.defineProperty(synthetic, "target", {
            configurable: true,
            value: Object.create(null),
        });
        row.dispatchEvent(synthetic);
        expect(useSiteResult.handleCardClick).toHaveBeenCalledTimes(1);
    });

    it("handles keyboard activation and ignores non-activation keys", () => {
        const useSiteResult = createUseSiteReturn();
        useSiteState.factory.mockReturnValue(useSiteResult);

        renderSiteTableRow();

        const row = screen.getByRole("row");
        fireEvent.keyDown(row, { key: "Enter" });
        fireEvent.keyDown(row, { key: " " });
        expect(useSiteResult.handleCardClick).toHaveBeenCalledTimes(2);

        fireEvent.keyDown(row, { key: "Escape" });
        expect(useSiteResult.handleCardClick).toHaveBeenCalledTimes(2);

        const interactiveButton = screen
            .getByTestId("action-button-group")
            .querySelector("[data-prevent-row-activation]");
        expect(interactiveButton).not.toBeNull();
        fireEvent.keyDown(interactiveButton!, { key: "Enter" });
        expect(useSiteResult.handleCardClick).toHaveBeenCalledTimes(2);
    });

    it("renders fallback response time when unavailable", () => {
        const useSiteResult = createUseSiteReturn({ responseTime: null });
        useSiteState.factory.mockReturnValue(useSiteResult);

        renderSiteTableRow();

        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("provides runtime details to monitor selector and status badge", () => {
        const useSiteResult = createUseSiteReturn();
        useSiteState.factory.mockReturnValue(useSiteResult);

        renderSiteTableRow();

        expect(monitorSelectorMock.props[0]).toMatchObject({
            monitors: useSiteResult.latestSite.monitors,
            selectedMonitorId: "monitor-1",
        });
        expect(statusBadgeMock.props[0]).toMatchObject({
            label: "Status",
            status: "up",
        });
    });

    it("disables action group when monitor context is missing", () => {
        const useSiteResult = createUseSiteReturn({ monitor: null });
        useSiteState.factory.mockReturnValue(useSiteResult);

        renderSiteTableRow();

        expect(actionButtonGroupMock.props[0]).toMatchObject({
            disabled: true,
            isLoading: false,
        });
    });

    it("reflects monitoring summary when all monitors are running", () => {
        const runningSite: Site = {
            identifier: "alpha",
            monitoring: true,
            monitors: [
                {
                    checkInterval: 60_000,
                    history: [],
                    id: "monitor-1",
                    monitoring: true,
                    responseTime: 50,
                    retryAttempts: 0,
                    status: "up",
                    timeout: 30_000,
                    type: "http",
                    url: "https://primary.example",
                },
                {
                    checkInterval: 60_000,
                    history: [],
                    id: "monitor-2",
                    monitoring: true,
                    responseTime: 45,
                    retryAttempts: 0,
                    status: "up",
                    timeout: 30_000,
                    type: "http",
                    url: "https://secondary.example",
                },
            ],
            name: "Alpha Site",
        };

        const useSiteResult = createUseSiteReturn({
            isMonitoring: false,
            latestSite: runningSite,
            monitor: runningSite.monitors[0]!,
            responseTime: 75,
            uptime: 100,
        });
        useSiteState.factory.mockReturnValue(useSiteResult);

        renderSiteTableRow();

        expect(screen.getByText("100%")).toBeInTheDocument();
        expect(screen.getByText("75 ms")).toBeInTheDocument();
        expect(screen.getByText("2/2")).toBeInTheDocument();
        expect(actionButtonGroupMock.props[0]).toMatchObject({
            allMonitorsRunning: true,
            isMonitoring: false,
        });
    });
});
