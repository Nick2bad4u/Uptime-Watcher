import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "@shared/types";

import { SiteCardHeader } from "../../../../components/Dashboard/SiteCard/SiteCardHeader";

const monitorSelectorCalls: { selectedMonitorId: string }[] = [];
const actionButtonCalls: Array<{
    allMonitorsRunning: boolean;
    disabled: boolean;
    isMonitoring: boolean;
}> = [];

vi.mock("../../../../theme/components/ThemedText", () => ({
    ThemedText: ({ children }: { children: ReactNode }) => (
        <span data-testid="themed-text">{children}</span>
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
                    select
                </button>
            );
        },
    })
);

vi.mock(
    "../../../../components/Dashboard/SiteCard/components/ActionButtonGroup",
    () => ({
        ActionButtonGroup: ({
            allMonitorsRunning,
            disabled,
            isMonitoring,
            onCheckNow,
            onStartMonitoring,
            onStartSiteMonitoring,
            onStopMonitoring,
            onStopSiteMonitoring,
        }: any) => {
            actionButtonCalls.push({
                allMonitorsRunning,
                disabled,
                isMonitoring,
            });
            return (
                <div data-disabled={disabled} data-testid="action-buttons">
                    <button
                        data-testid="action-check-now"
                        onClick={onCheckNow}
                        type="button"
                    >
                        check
                    </button>
                    <button
                        data-testid="action-start-monitoring"
                        onClick={onStartMonitoring}
                        type="button"
                    >
                        start-monitor
                    </button>
                    <button
                        data-testid="action-start-site-monitoring"
                        onClick={onStartSiteMonitoring}
                        type="button"
                    >
                        start-site
                    </button>
                    <button
                        data-testid="action-stop-monitoring"
                        onClick={onStopMonitoring}
                        type="button"
                    >
                        stop-monitor
                    </button>
                    <button
                        data-testid="action-stop-site-monitoring"
                        onClick={onStopSiteMonitoring}
                        type="button"
                    >
                        stop-site
                    </button>
                </div>
            );
        },
    })
);

vi.mock("../../../../components/Dashboard/SiteCard/SiteCardFooter", () => ({
    SiteCardFooter: () => <div data-testid="site-card-footer" />,
}));

describe(SiteCardHeader, () => {
    const baseSite = {
        id: "site-1",
        identifier: "site-1",
        monitors: [{ id: "monitor-1" }] as Site["monitors"],
        monitoring: true,
        name: "Production",
        status: "up",
        history: [],
    } as Site;

    const baseProps = {
        display: { isLoading: false },
        interactions: {
            onCheckNow: vi.fn(),
            onMonitorIdChange: vi.fn(),
            onStartMonitoring: vi.fn(),
            onStartSiteMonitoring: vi.fn(),
            onStopMonitoring: vi.fn(),
            onStopSiteMonitoring: vi.fn(),
        },
        monitoring: {
            allMonitorsRunning: true,
            hasMonitor: true,
            isMonitoring: true,
            selectedMonitorId: "monitor-1",
        },
        site: { site: baseSite },
    } as const;

    beforeEach(() => {
        monitorSelectorCalls.length = 0;
        actionButtonCalls.length = 0;
        for (const fn of Object.values(baseProps.interactions)) fn.mockClear();
    });

    it("renders the site name in the title", () => {
        render(<SiteCardHeader {...baseProps} />);
        expect(screen.getByText("Production")).toBeInTheDocument();
    });

    it("propagates monitor selection changes", async () => {
        const user = userEvent.setup();
        render(<SiteCardHeader {...baseProps} />);

        const selector = screen.getByTestId("monitor-selector");
        await user.click(selector);

        expect(baseProps.interactions.onMonitorIdChange).toHaveBeenCalledWith(
            expect.objectContaining({ target: { value: "monitor-2" } })
        );
        expect(monitorSelectorCalls.at(-1)).toEqual({
            selectedMonitorId: "monitor-1",
        });
    });

    it("disables action buttons when the site lacks monitors", () => {
        render(
            <SiteCardHeader
                {...baseProps}
                monitoring={{ ...baseProps.monitoring, hasMonitor: false }}
            />
        );

        expect(actionButtonCalls.at(-1)).toEqual({
            allMonitorsRunning: true,
            disabled: true,
            isMonitoring: true,
        });
        expect(screen.getByTestId("action-buttons")).toHaveAttribute(
            "data-disabled",
            "true"
        );
    });

    it("invokes interaction handlers via action buttons", async () => {
        const user = userEvent.setup();
        render(<SiteCardHeader {...baseProps} />);

        await user.click(screen.getByTestId("action-check-now"));
        await user.click(screen.getByTestId("action-start-monitoring"));
        await user.click(screen.getByTestId("action-start-site-monitoring"));
        await user.click(screen.getByTestId("action-stop-monitoring"));
        await user.click(screen.getByTestId("action-stop-site-monitoring"));

        expect(baseProps.interactions.onCheckNow).toHaveBeenCalledTimes(1);
        expect(baseProps.interactions.onStartMonitoring).toHaveBeenCalledTimes(
            1
        );
        expect(
            baseProps.interactions.onStartSiteMonitoring
        ).toHaveBeenCalledTimes(1);
        expect(baseProps.interactions.onStopMonitoring).toHaveBeenCalledTimes(
            1
        );
        expect(
            baseProps.interactions.onStopSiteMonitoring
        ).toHaveBeenCalledTimes(1);
    });
});
