/**
 * @file Behavioral coverage tests for the `SiteCardHeader` component.
 */

import type { Monitor, Site } from "@shared/types";
import type { ChangeEvent, ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MonitorSelectorMockProperties {
    monitors: Site["monitors"];
    onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    selectedMonitorId: string;
}

interface ActionButtonGroupMockProperties {
    allMonitorsRunning: boolean;
    buttonSize?: string;
    disabled: boolean;
    isLoading: boolean;
    isMonitoring: boolean;
    onCheckNow: () => void;
    onStartMonitoring: () => void;
    onStartSiteMonitoring: () => void;
    onStopMonitoring: () => void;
    onStopSiteMonitoring: () => void;
}

const monitorSelectorProps = vi.hoisted(
    () => [] as MonitorSelectorMockProperties[]
);
const actionButtonGroupProps = vi.hoisted(
    () => [] as ActionButtonGroupMockProperties[]
);

vi.mock(
    "../../components/Dashboard/SiteCard/components/MonitorSelector",
    () => ({
        MonitorSelector: (props: MonitorSelectorMockProperties) => {
            monitorSelectorProps.push(props);
            return (
                <button
                    data-testid="mock-monitor-selector"
                    onClick={() =>
                        props.onChange({
                            target: { value: "monitor-2" },
                        } as ChangeEvent<HTMLSelectElement>)
                    }
                    type="button"
                >
                    monitor-selector
                </button>
            );
        },
    })
);

vi.mock(
    "../../components/Dashboard/SiteCard/components/ActionButtonGroup",
    () => ({
        ActionButtonGroup: (props: ActionButtonGroupMockProperties) => {
            actionButtonGroupProps.push(props);
            return (
                <button
                    data-testid="mock-check-now"
                    onClick={() => props.onCheckNow()}
                    type="button"
                >
                    check-now
                </button>
            );
        },
    })
);

vi.mock("../../components/Dashboard/SiteCard/SiteCardFooter", () => ({
    SiteCardFooter: () => <div data-testid="mock-site-card-footer" />,
}));

vi.mock("../../theme/components/ThemedText", () => ({
    ThemedText: ({ children }: { children?: ReactNode }) => (
        <span data-testid="mock-themed-text">{children}</span>
    ),
}));

import { SiteCardHeader } from "../../components/Dashboard/SiteCard/SiteCardHeader";

describe("SiteCardHeader coverage", () => {
    const baseMonitor: Monitor = {
        checkInterval: 60_000,
        history: [],
        id: "monitor-1",
        monitoring: true,
        responseTime: 120,
        retryAttempts: 0,
        status: "up",
        timeout: 30_000,
        type: "http",
    };

    const baseSite: Site = {
        identifier: "site-1",
        monitoring: true,
        monitors: [
            baseMonitor,
            {
                ...baseMonitor,
                id: "monitor-2",
            },
        ],
        name: "Main Site",
    };

    beforeEach(() => {
        monitorSelectorProps.length = 0;
        actionButtonGroupProps.length = 0;
    });

    it("wires interaction handlers and passes monitoring configuration", () => {
        const interactions = {
            onCheckNow: vi.fn(),
            onMonitorIdChange: vi.fn(),
            onStartMonitoring: vi.fn(),
            onStartSiteMonitoring: vi.fn(),
            onStopMonitoring: vi.fn(),
            onStopSiteMonitoring: vi.fn(),
        };

        render(
            <SiteCardHeader
                display={{ isLoading: false }}
                interactions={interactions}
                monitoring={{
                    allMonitorsRunning: false,
                    hasMonitor: true,
                    isMonitoring: true,
                    selectedMonitorId: "monitor-1",
                }}
                site={{ site: baseSite }}
            />
        );

        fireEvent.click(screen.getByTestId("mock-monitor-selector"));
        expect(interactions.onMonitorIdChange).toHaveBeenCalled();

        fireEvent.click(screen.getByTestId("mock-check-now"));
        expect(interactions.onCheckNow).toHaveBeenCalled();

        expect(monitorSelectorProps[0]).toMatchObject({
            monitors: baseSite.monitors,
            selectedMonitorId: "monitor-1",
        });
        expect(actionButtonGroupProps[0]).toMatchObject({
            allMonitorsRunning: false,
            disabled: false,
            isLoading: false,
            isMonitoring: true,
        });
        expect(screen.getByText("Main Site")).toBeInTheDocument();
        expect(screen.getByTestId("mock-site-card-footer")).toBeInTheDocument();
    });

    it("disables action buttons when the site lacks monitors", () => {
        actionButtonGroupProps.length = 0;

        render(
            <SiteCardHeader
                display={{ isLoading: true }}
                interactions={{
                    onCheckNow: vi.fn(),
                    onMonitorIdChange: vi.fn(),
                    onStartMonitoring: vi.fn(),
                    onStartSiteMonitoring: vi.fn(),
                    onStopMonitoring: vi.fn(),
                    onStopSiteMonitoring: vi.fn(),
                }}
                monitoring={{
                    allMonitorsRunning: false,
                    hasMonitor: false,
                    isMonitoring: false,
                    selectedMonitorId: "monitor-1",
                }}
                site={{
                    site: {
                        ...baseSite,
                        monitors: [],
                    },
                }}
            />
        );

        expect(actionButtonGroupProps[0]).toMatchObject({
            disabled: true,
            isLoading: true,
        });
    });

    it("propagates monitoring state when monitors are running", () => {
        actionButtonGroupProps.length = 0;

        render(
            <SiteCardHeader
                display={{ isLoading: false }}
                interactions={{
                    onCheckNow: vi.fn(),
                    onMonitorIdChange: vi.fn(),
                    onStartMonitoring: vi.fn(),
                    onStartSiteMonitoring: vi.fn(),
                    onStopMonitoring: vi.fn(),
                    onStopSiteMonitoring: vi.fn(),
                }}
                monitoring={{
                    allMonitorsRunning: true,
                    hasMonitor: true,
                    isMonitoring: false,
                    selectedMonitorId: "monitor-2",
                }}
                site={{
                    site: {
                        ...baseSite,
                        monitoring: false,
                    },
                }}
            />
        );

        expect(actionButtonGroupProps[0]).toMatchObject({
            allMonitorsRunning: true,
            isMonitoring: false,
            disabled: false,
        });
        expect(monitorSelectorProps[0]).toMatchObject({
            selectedMonitorId: "monitor-2",
        });
    });
});
