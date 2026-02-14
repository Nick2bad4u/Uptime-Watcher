import { describe, it, expect, vi } from "vitest";
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

describe(SiteCardStatus, () => {
    it("renders correct label and status for 'up'", () => {
        render(<SiteCardStatus monitorLabel="HTTP" status="up" />);
        const badge = screen.getByTestId("status-badge");
        expect(badge).toHaveAttribute("data-label", "HTTP Status");
        expect(badge).toHaveAttribute("data-status", "up");
        expect(badge).toHaveAttribute("data-size", "sm");
    });

    it("renders correct label and status for 'down'", () => {
        render(<SiteCardStatus monitorLabel="Port" status="down" />);
        const badge = screen.getByTestId("status-badge");
        expect(badge).toHaveAttribute("data-label", "Port Status");
        expect(badge).toHaveAttribute("data-status", "down");
    });

    it("renders correct label and status for 'pending'", () => {
        render(<SiteCardStatus monitorLabel="Custom" status="pending" />);
        const badge = screen.getByTestId("status-badge");
        expect(badge).toHaveAttribute("data-label", "Custom Status");
        expect(badge).toHaveAttribute("data-status", "pending");
    });

    it("renders correct label and status for 'paused'", () => {
        render(<SiteCardStatus monitorLabel="Website URL" status="paused" />);
        const badge = screen.getByTestId("status-badge");
        expect(badge).toHaveAttribute("data-label", "Website URL Status");
        expect(badge).toHaveAttribute("data-status", "paused");
    });
});
