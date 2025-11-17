import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "@shared/types";

import { SiteCompactCard } from "../../../../components/Dashboard/SiteCard/SiteCompactCard";

const mockUseSite = vi.hoisted(() => vi.fn());
const monitorSelectorCalls: Array<{ selectedMonitorId: string }> = [];
const actionButtonCalls: Array<{ isMonitoring: boolean }> = [];

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
    ThemedText: ({ children }: { children: React.ReactNode }) => (
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
        ActionButtonGroup: ({ isMonitoring, onCheckNow }: any) => {
            actionButtonCalls.push({ isMonitoring });
            return (
                <button data-testid="action-group" onClick={onCheckNow}>
                    action
                </button>
            );
        },
    })
);

const baseSite = {
    id: "site-1",
    identifier: "site-identifier",
    monitors: [
        {
            checkInterval: 60_000,
            history: [],
            id: "monitor-1",
            monitoring: true,
            type: "http",
            status: "up",
        },
    ],
    monitoring: true,
    name: "Production",
    status: "up",
    history: [],
} as Site;

describe("SiteCompactCard", () => {
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

        expect(screen.getByTestId("marquee-text")).toHaveTextContent(
            "Production"
        );
        expect(screen.getByText("site-identifier")).toBeInTheDocument();
        expect(screen.getByText("42")).toBeInTheDocument();

        await user.click(screen.getByTestId("themed-box"));
        expect(siteState.handleCardClick).toHaveBeenCalled();
        expect(monitorSelectorCalls.at(-1)).toEqual({
            selectedMonitorId: "monitor-1",
        });
    });

    it("passes monitoring state to action buttons and handlers", async () => {
        render(<SiteCompactCard site={baseSite} />);

        expect(actionButtonCalls.at(-1)).toEqual({ isMonitoring: true });

        await user.click(screen.getByTestId("action-group"));
        expect(siteState.handleCheckNow).toHaveBeenCalled();
    });

    it("shows fallback monitor summary when no monitor is selected", () => {
        mockUseSite.mockReturnValueOnce({
            ...siteState,
            monitor: undefined,
        });

        render(<SiteCompactCard site={baseSite} />);

        expect(screen.getByText(/No Monitor Selected/i)).toBeInTheDocument();
    });
});
