/**
 * Behavioral tests for the `SiteCardHeader` component focusing on delegated
 * props and interaction wiring with child components.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { ChangeEvent } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteCardHeader } from "../../../../components/Dashboard/SiteCard/SiteCardHeader";
import type { Monitor, Site } from "@shared/types";

const monitorSelectorPropsSpy = vi.fn();
const actionButtonGroupPropsSpy = vi.fn();

vi.mock(
    "../../../../components/Dashboard/SiteCard/components/MonitorSelector",
    async (importOriginal) => {
        const actual =
            await importOriginal<
                typeof import("../../../../components/Dashboard/SiteCard/components/MonitorSelector")
            >();
        type MonitorSelectorProperties = Parameters<
            typeof actual.MonitorSelector
        >[0];

        return {
            MonitorSelector: (props: MonitorSelectorProperties) => {
                monitorSelectorPropsSpy(props);
                return (
                    <button
                        data-testid="monitor-selector"
                        onClick={() =>
                            props.onChange({
                                target: { value: "monitor-2" },
                            } as ChangeEvent<HTMLSelectElement>)
                        }
                        type="button"
                    >
                        mock-monitor-selector
                    </button>
                );
            },
        };
    }
);

vi.mock(
    "../../../../components/Dashboard/SiteCard/components/ActionButtonGroup",
    async (importOriginal) => {
        const actual =
            await importOriginal<
                typeof import("../../../../components/Dashboard/SiteCard/components/ActionButtonGroup")
            >();
        type ActionButtonGroupProperties = Parameters<
            typeof actual.ActionButtonGroup
        >[0];

        return {
            ActionButtonGroup: (props: ActionButtonGroupProperties) => {
                actionButtonGroupPropsSpy(props);
                return (
                    <div data-testid="action-button-group">
                        <button
                            data-testid="action-check-now"
                            onClick={props.onCheckNow}
                            type="button"
                        >
                            check-now
                        </button>
                        <button
                            data-testid="action-start-monitoring"
                            onClick={props.onStartMonitoring}
                            type="button"
                        >
                            start-monitoring
                        </button>
                        <button
                            data-testid="action-start-site-monitoring"
                            onClick={props.onStartSiteMonitoring}
                            type="button"
                        >
                            start-site-monitoring
                        </button>
                        <button
                            data-testid="action-stop-monitoring"
                            onClick={props.onStopMonitoring}
                            type="button"
                        >
                            stop-monitoring
                        </button>
                        <button
                            data-testid="action-stop-site-monitoring"
                            onClick={props.onStopSiteMonitoring}
                            type="button"
                        >
                            stop-site-monitoring
                        </button>
                    </div>
                );
            },
        };
    }
);

vi.mock("../../../../components/Dashboard/SiteCard/SiteCardFooter", () => ({
    SiteCardFooter: () => <div data-testid="site-card-footer">mock-footer</div>,
}));

describe(SiteCardHeader, () => {
    /**
     * Creates a monitor with sensible defaults for behavior testing.
     *
     * @param overrides - Property overrides applied to the base monitor.
     *
     * @returns Monitor instance tailored for the current test case.
     */
    const createMonitor = (overrides: Partial<Monitor>): Monitor => ({
        checkInterval: 60_000,
        history: [],
        id: "monitor-default",
        monitoring: true,
        responseTime: 125,
        retryAttempts: 0,
        status: "up",
        timeout: 30_000,
        type: "http",
        ...overrides,
    });

    const site: Site = {
        identifier: "site-123",
        monitoring: true,
        monitors: [
            createMonitor({ id: "monitor-1", url: "https://status.example" }),
            createMonitor({
                id: "monitor-2",
                url: "https://status-backup.example",
            }),
        ],
        name: "Example Site",
    };

    /**
     * Constructs the default prop payload for the component under test.
     *
     * @returns SiteCardHeader props pre-populated with spy handlers.
     */
    const createDefaultProps = () => ({
        display: {
            isLoading: false,
        },
        interactions: {
            onCheckNow: vi.fn(),
            onMonitorIdChange: vi.fn(),
            onStartMonitoring: vi.fn(),
            onStartSiteMonitoring: vi.fn(),
            onStopMonitoring: vi.fn(),
            onStopSiteMonitoring: vi.fn(),
        },
        monitoring: {
            allMonitorsRunning: false,
            hasMonitor: true,
            isMonitoring: false,
            selectedMonitorId: "monitor-1",
        },
        site: {
            site,
        },
    });

    beforeEach(() => {
        monitorSelectorPropsSpy.mockClear();
        actionButtonGroupPropsSpy.mockClear();
    });

    it("passes monitor metadata to the selector and renders the site title", () => {
        const props = createDefaultProps();
        render(<SiteCardHeader {...props} />);

        expect(screen.getByText("Example Site")).toBeInTheDocument();
        expect(screen.getByTestId("site-card-footer")).toBeInTheDocument();

        expect(monitorSelectorPropsSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                monitors: site.monitors,
                selectedMonitorId: "monitor-1",
            })
        );

        fireEvent.click(screen.getByTestId("monitor-selector"));
        expect(props.interactions.onMonitorIdChange).toHaveBeenCalledWith(
            expect.objectContaining({
                target: expect.objectContaining({ value: "monitor-2" }),
            })
        );
    });

    it("wires action handlers and disables actions when no monitor exists", () => {
        const props = createDefaultProps();
        props.monitoring.hasMonitor = false;

        render(<SiteCardHeader {...props} />);

        fireEvent.click(screen.getByTestId("action-check-now"));
        fireEvent.click(screen.getByTestId("action-start-monitoring"));
        fireEvent.click(screen.getByTestId("action-start-site-monitoring"));
        fireEvent.click(screen.getByTestId("action-stop-monitoring"));
        fireEvent.click(screen.getByTestId("action-stop-site-monitoring"));

        expect(props.interactions.onCheckNow).toHaveBeenCalledTimes(1);
        expect(props.interactions.onStartMonitoring).toHaveBeenCalledTimes(1);
        expect(props.interactions.onStartSiteMonitoring).toHaveBeenCalledTimes(
            1
        );
        expect(props.interactions.onStopMonitoring).toHaveBeenCalledTimes(1);
        expect(props.interactions.onStopSiteMonitoring).toHaveBeenCalledTimes(
            1
        );

        expect(actionButtonGroupPropsSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                disabled: true,
                isLoading: false,
            })
        );
    });
});
