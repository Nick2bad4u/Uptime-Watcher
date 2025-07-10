import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteCardStatus } from "../components/Dashboard/SiteCard/SiteCardStatus";

// Mock StatusBadge to isolate SiteCardStatus logic
vi.mock("../components/common/StatusBadge", () => ({
  StatusBadge: (props: any) => (
    <div
      data-testid="status-badge"
      data-label={props.label}
      data-status={props.status}
      data-size={props.size}
    />
  ),
}));

describe("SiteCardStatus", () => {
  it("renders correct label and status for 'up'", () => {
    render(<SiteCardStatus selectedMonitorId="http" status="up" />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveAttribute("data-label", "HTTP Status");
    expect(badge).toHaveAttribute("data-status", "up");
    expect(badge).toHaveAttribute("data-size", "sm");
  });

  it("renders correct label and status for 'down'", () => {
    render(<SiteCardStatus selectedMonitorId="port" status="down" />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveAttribute("data-label", "PORT Status");
    expect(badge).toHaveAttribute("data-status", "down");
  });

  it("renders correct label and status for 'pending'", () => {
    render(<SiteCardStatus selectedMonitorId="custom" status="pending" />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveAttribute("data-label", "CUSTOM Status");
    expect(badge).toHaveAttribute("data-status", "pending");
  });

  it("renders correct label and status for 'paused'", () => {
    render(<SiteCardStatus selectedMonitorId="myMonitor" status="paused" />);
    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveAttribute("data-label", "MYMONITOR Status");
    expect(badge).toHaveAttribute("data-status", "paused");
  });
});
