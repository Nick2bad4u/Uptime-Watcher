import type { Site } from "@shared/types";
import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { arrayAt, objectValues } from "ts-extras";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteCardHeader } from "../../../../components/Dashboard/SiteCard/SiteCardHeader";
import type { ActionButtonGroupProperties } from "../../../../components/Dashboard/SiteCard/components/ActionButtonGroup";
import type { MonitorSelectorProperties } from "../../../../components/Dashboard/SiteCard/components/MonitorSelector";

const monitorSelectorCalls: { selectedMonitorId: string }[] = [];
const monitorSelectionValues: string[] = [];
const actionButtonCalls: {
    allMonitorsRunning: boolean;
    disabled: boolean;
    isMonitoring: boolean;
}[] = [];

vi.mock("../../../../theme/components/ThemedText", () => ({
    ThemedText: ({ children }: { children: ReactNode }) => (
        <span data-testid="themed-text">{children}</span>
    ),
}));

vi.mock(
    "../../../../components/Dashboard/SiteCard/components/MonitorSelector",
    () => ({
        MonitorSelector: ({
            onChange,
            selectedMonitorId,
        }: MonitorSelectorProperties) => {
            monitorSelectorCalls.push({ selectedMonitorId });
            return (
                <select
                    data-testid="monitor-selector"
                    onChange={(event) => {
                        monitorSelectionValues.push(event.target.value);
                        onChange(event);
                    }}
                    value={selectedMonitorId}
                >
                    <option value="monitor-1">Monitor 1</option>
                    <option value="monitor-2">Monitor 2</option>
                </select>
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
        }: ActionButtonGroupProperties) => {
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

    const getFaviconImage = (): HTMLImageElement | null =>
        document.querySelector<HTMLImageElement>(
            ".site-card__title-dot-favicon"
        );

    const createPropsWithMonitorEndpoint = (endpoint: string) => ({
        ...baseProps,
        site: {
            site: {
                ...baseSite,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        url: endpoint,
                    },
                ] as Site["monitors"],
            },
        },
    });

    beforeEach(() => {
        monitorSelectorCalls.length = 0;
        monitorSelectionValues.length = 0;
        actionButtonCalls.length = 0;
        for (const fn of objectValues(baseProps.interactions)) fn.mockClear();
    });

    it("renders the site name in the title", () => {
        render(<SiteCardHeader {...baseProps} />);
        expect(screen.getByText("Production")).toBeInTheDocument();
    });

    it("propagates monitor selection changes", async () => {
        const user = userEvent.setup();
        render(<SiteCardHeader {...baseProps} />);

        const selector = screen.getByTestId("monitor-selector");
        await user.selectOptions(selector, "monitor-2");

        expect(baseProps.interactions.onMonitorIdChange).toHaveBeenCalledTimes(
            1
        );
        expect(arrayAt(monitorSelectionValues, -1)).toBe("monitor-2");
        expect(arrayAt(monitorSelectorCalls, -1)).toEqual({
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

        expect(arrayAt(actionButtonCalls, -1)).toEqual({
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

    it("uses a redacted public URL for third-party favicon lookup", () => {
        render(
            <SiteCardHeader
                {...createPropsWithMonitorEndpoint(
                    "https://example.com/path/abcdefghijklmnopqrstuvwxyz123456?token=secret#fragment"
                )}
            />
        );

        const favicon = getFaviconImage();
        const faviconSrc = favicon?.getAttribute("src") ?? "";

        expect(faviconSrc).toContain("https://api.microlink.io/");
        expect(faviconSrc).toContain(
            encodeURIComponent("https://example.com/path/[redacted]")
        );
        expect(faviconSrc).not.toContain("token");
        expect(faviconSrc).not.toContain("secret");
        expect(faviconSrc).not.toContain("fragment");
    });

    it.each([
        "http://localhost:3000/status",
        "https://192.168.1.10/dashboard",
        "https://user:pass@example.com/private",
    ])(
        "does not create third-party favicon URLs for unsafe endpoints: %s",
        (endpoint) => {
            render(
                <SiteCardHeader {...createPropsWithMonitorEndpoint(endpoint)} />
            );

            expect(getFaviconImage()).toBeNull();
        }
    );
});
