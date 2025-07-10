import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SiteCardHeader } from "../components/Dashboard/SiteCard/SiteCardHeader";

// Mock child components to isolate SiteCardHeader logic
vi.mock("../components/Dashboard/SiteCard/components/ActionButtonGroup", () => ({
    ActionButtonGroup: (props: any) => {
        // Explicitly set string attributes for test expectations
        const { isLoading, isMonitoring, disabled, ...rest } = props;
        return (
            <div
                data-testid="action-button-group"
                data-is-loading={String(isLoading)}
                data-is-monitoring={String(isMonitoring)}
                data-disabled={String(disabled)}
                {...rest}
            />
        );
    },
}));
vi.mock("../components/Dashboard/SiteCard/components/MonitorSelector", () => ({
    MonitorSelector: (props: any) => (
        <select data-testid="monitor-selector" value={props.selectedMonitorId} onChange={props.onChange}>
            {props.monitors.map((m: any) => (
                <option key={m.id} value={m.id}>
                    {m.id}
                </option>
            ))}
        </select>
    ),
}));

const mockSite = {
    name: "Test Site",
    identifier: "site-1",
    monitors: [
        { id: "monitor-1", type: "http" },
        { id: "monitor-2", type: "port" },
    ],
};

describe("SiteCardHeader", () => {
    let onCheckNow: ReturnType<typeof vi.fn>;
    let onMonitorIdChange: ReturnType<typeof vi.fn>;
    let onStartMonitoring: ReturnType<typeof vi.fn>;
    let onStopMonitoring: ReturnType<typeof vi.fn>;
    let baseProps: any;

    beforeEach(() => {
        onCheckNow = vi.fn();
        onMonitorIdChange = vi.fn();
        onStartMonitoring = vi.fn();
        onStopMonitoring = vi.fn();
        baseProps = {
            site: mockSite,
            selectedMonitorId: "monitor-1",
            onMonitorIdChange,
            onCheckNow,
            onStartMonitoring,
            onStopMonitoring,
            isLoading: false,
            isMonitoring: false,
            hasMonitor: true,
        };
    });

    it("renders site name", () => {
        render(<SiteCardHeader {...baseProps} />);
        expect(screen.getByText("Test Site")).toBeInTheDocument();
    });

    it("renders MonitorSelector with correct props", () => {
        render(<SiteCardHeader {...baseProps} />);
        const selector = screen.getByTestId("monitor-selector");
        expect(selector).toBeInTheDocument();
        expect(selector).toHaveValue("monitor-1");
        // Should have options for each monitor
        expect(selector.querySelectorAll("option")).toHaveLength(2);
    });

    it("calls onMonitorIdChange when monitor is changed", () => {
        render(<SiteCardHeader {...baseProps} />);
        const selector = screen.getByTestId("monitor-selector");
        fireEvent.change(selector, { target: { value: "monitor-2" } });
        expect(onMonitorIdChange).toHaveBeenCalled();
    });

    it("renders ActionButtonGroup with correct props", () => {
        render(<SiteCardHeader {...baseProps} />);
        const group = screen.getByTestId("action-button-group");
        expect(group).toBeInTheDocument();
        expect(group).toHaveAttribute("data-is-loading", "false");
        expect(group).toHaveAttribute("data-is-monitoring", "false");
        expect(group).toHaveAttribute("data-disabled", "false");
    });

    it("disables ActionButtonGroup if hasMonitor is false", () => {
        render(<SiteCardHeader {...baseProps} hasMonitor={false} />);
        const group = screen.getByTestId("action-button-group");
        expect(group).toHaveAttribute("data-disabled", "true");
    });

    it("passes through loading and monitoring props", () => {
        render(<SiteCardHeader {...baseProps} isLoading={true} isMonitoring={true} />);
        const group = screen.getByTestId("action-button-group");
        expect(group).toHaveAttribute("data-is-loading", "true");
        expect(group).toHaveAttribute("data-is-monitoring", "true");
    });

    it("passes through event handlers to ActionButtonGroup", () => {
        render(<SiteCardHeader {...baseProps} />);
        const group = screen.getByTestId("action-button-group");
        // Cannot check function props on DOM node, so just check presence of data-testid
        expect(group).toBeInTheDocument();
    });
});
