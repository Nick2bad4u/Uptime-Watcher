import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Monitor, Site, StatusHistory } from "@shared/types";
import { STATUS_KIND } from "@shared/types";

import { SiteCompactCard } from "../../../../components/Dashboard/SiteCard/SiteCompactCard";
import { getMonitorTypeDisplayLabel } from "../../../../utils/fallbacks";

const mockUseSite = vi.hoisted(() => vi.fn());
const monitorSelectorCalls: { selectedMonitorId: string }[] = [];
const actionButtonCalls: { disabled: boolean; isMonitoring: boolean }[] = [];

vi.mock("../../../../hooks/site/useSite", () => ({
    useSite: mockUseSite,
}));

vi.mock("../../../../theme/components/ThemedBox", () => ({
    ThemedBox: ({ children, onClick }: any) => (
        <div data-testid="themed-box" onClick={onClick}>
            {children}
        </div>
    ),
}));

vi.mock("../../../../theme/components/ThemedText", () => ({
    ThemedText: ({ children }: { children: ReactNode }) => (
        <span>{children}</span>
    ),
}));

vi.mock("../../../../theme/components/StatusIndicator", () => ({
    StatusIndicator: ({ status }: { status: string }) => (
        <span data-testid={`status-indicator-${status}`} />
    ),
}));

vi.mock("../../../../components/common/MarqueeText/MarqueeText", () => ({
    MarqueeText: ({ text }: { text: string }) => (
        <span data-testid="marquee-text">{text}</span>
    ),
}));

vi.mock(
    "../../../../components/Dashboard/SiteCard/components/MonitorSelector",
    () => ({
        MonitorSelector: ({ selectedMonitorId, onChange }: any) => {
            monitorSelectorCalls.push({ selectedMonitorId });
            return (
                <button
                    data-testid="monitor-selector"
                    onClick={() =>
                        onChange({ target: { value: "monitor-2" } } as any)
                    }
                >
                    monitor
                </button>
            );
        },
    })
);

vi.mock(
    "../../../../components/Dashboard/SiteCard/components/ActionButtonGroup",
    () => ({
        ActionButtonGroup: ({ disabled, isMonitoring, onCheckNow }: any) => {
            actionButtonCalls.push({ disabled, isMonitoring });
            return (
                <button
                    data-disabled={disabled}
                    data-testid="action-group"
                    onClick={onCheckNow}
                >
                    action
                </button>
            );
        },
    })
);

const baseMonitorHistory: StatusHistory[] = [];
const baseMonitor: Monitor = {
    checkInterval: 60_000,
    history: baseMonitorHistory,
    id: "monitor-1",
    monitoring: true,
    responseTime: 0,
    retryAttempts: 0,
    status: STATUS_KIND.UP,
    timeout: 10_000,
    type: "http",
};

const baseSite: Site = {
    identifier: "site-identifier",
    monitoring: true,
    monitors: [baseMonitor],
    name: "Production",
};

describe(SiteCompactCard, () => {
    const user = userEvent.setup();
    let siteState: any;

    beforeEach(() => {
        monitorSelectorCalls.length = 0;
        actionButtonCalls.length = 0;
        siteState = {
            checkCount: 42,
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
            monitor: baseSite.monitors[0],
            responseTime: 180,
            selectedMonitorId: "monitor-1",
            status: "degraded",
            uptime: 99.1,
        };
        mockUseSite.mockReturnValue(siteState);
    });

    it("renders core site information and responds to card clicks", async () => {
        const props = { site: baseSite };

        render(<SiteCompactCard {...props} />);

        const marqueeTexts = screen.getAllByTestId("marquee-text");
        expect(marqueeTexts[0]).toHaveTextContent("Production");
        expect(marqueeTexts[1]).toHaveTextContent(
            getMonitorTypeDisplayLabel(baseMonitor.type)
        );
        expect(screen.getByText("42")).toBeInTheDocument();

        await user.click(screen.getByTestId("themed-box"));
        expect(siteState.handleCardClick).toHaveBeenCalled();
        expect(monitorSelectorCalls.at(-1)).toEqual({
            selectedMonitorId: "monitor-1",
        });
    });

    it("passes monitoring state to action buttons and handlers", async () => {
        render(<SiteCompactCard site={baseSite} />);

        expect(actionButtonCalls.at(-1)).toEqual({
            disabled: false,
            isMonitoring: true,
        });

        await user.click(screen.getByTestId("action-group"));
        expect(siteState.handleCheckNow).toHaveBeenCalled();
    });

    it("shows fallback monitor summary when no monitor is selected", () => {
        mockUseSite.mockReturnValueOnce({
            ...siteState,
            monitor: undefined,
        });

        render(<SiteCompactCard site={baseSite} />);

        expect(screen.getByText(/no monitor selected/i)).toBeInTheDocument();
    });

    it("renders fallback metrics and disables actions without monitor data", () => {
        const monitors: Monitor[] = [
            { ...baseMonitor, id: "monitor-a", monitoring: true },
            { ...baseMonitor, id: "monitor-b", monitoring: false },
        ];

        mockUseSite.mockReturnValueOnce({
            ...siteState,
            checkCount: 0,
            latestSite: { ...siteState.latestSite, monitors },
            monitor: undefined,
            responseTime: undefined,
            uptime: undefined,
        });

        render(<SiteCompactCard site={baseSite} />);

        const metricValues = Array.from(
            document.querySelectorAll(".site-card__compact-metric-value"),
            (node) => node.textContent?.trim() ?? ""
        );
        expect(metricValues).toEqual([
            "—",
            "—",
            "0",
            "1/2",
        ]);

        expect(actionButtonCalls.at(-1)).toEqual({
            disabled: true,
            isMonitoring: true,
        });

        expect(
            screen.getByText(/tap for detailed analytics/i)
        ).toHaveTextContent("Tap for detailed analytics • Degraded");
    });
});
