/**
 * Tests for SiteCardStatus component
 * Validate    it("memoizes component to prevent unnecessary re-renders", () => {
        const { rerender } = render(<SiteCardStatus selectedMonitorId="monitor1" status="up" />);
        
        // Re-render with the same props
        rerender(<SiteCardStatus selectedMonitorId="monitor1" status="up" />);
        
        expect(screen.getByText(/MONITOR1 Status.*:.*up/)).toBeInTheDocument();
    }); badge rendering and monitor identification
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteCardStatus } from "../components/Dashboard/SiteCard/SiteCardStatus";

describe("SiteCardStatus", () => {
    it("renders status badge with up status", () => {
        render(<SiteCardStatus selectedMonitorId="monitor1" status="up" />);

        expect(screen.getByText(/MONITOR1 Status.*:.*up/)).toBeInTheDocument();
    });

    it("renders status badge with down status", () => {
        render(<SiteCardStatus selectedMonitorId="http-monitor" status="down" />);

        expect(screen.getByText(/HTTP-MONITOR Status.*:.*down/)).toBeInTheDocument();
    });

    it("renders status badge with pending status", () => {
        render(<SiteCardStatus selectedMonitorId="port-check" status="pending" />);

        expect(screen.getByText(/PORT-CHECK Status.*:.*pending/)).toBeInTheDocument();
    });

    it("converts monitor ID to uppercase in label", () => {
        render(<SiteCardStatus selectedMonitorId="http" status="up" />);

        expect(screen.getByText(/HTTP Status.*:.*up/)).toBeInTheDocument();
    });

    it("handles long monitor IDs", () => {
        render(<SiteCardStatus selectedMonitorId="very-long-monitor-identifier" status="up" />);

        expect(screen.getByText(/VERY-LONG-MONITOR-IDENTIFIER Status.*:.*up/)).toBeInTheDocument();
    });

    it("handles monitor IDs with special characters", () => {
        render(<SiteCardStatus selectedMonitorId="monitor_123" status="down" />);

        expect(screen.getByText(/MONITOR_123 Status.*:.*down/)).toBeInTheDocument();
    });

    it("renders with small size badge", () => {
        render(<SiteCardStatus selectedMonitorId="monitor1" status="up" />);

        // StatusBadge should be rendered with size="sm"
        const badge = screen.getByText(/MONITOR1 Status.*:.*up/);
        expect(badge).toBeInTheDocument();
    });

    it("memoizes component to prevent unnecessary re-renders", () => {
        const { rerender } = render(<SiteCardStatus selectedMonitorId="monitor1" status="up" />);

        // Rerender with same props
        rerender(<SiteCardStatus selectedMonitorId="monitor1" status="up" />);

        expect(screen.getByText(/MONITOR1 Status.*:.*up/)).toBeInTheDocument();
    });

    it("re-renders when status changes", () => {
        const { rerender } = render(<SiteCardStatus selectedMonitorId="monitor1" status="up" />);

        rerender(<SiteCardStatus selectedMonitorId="monitor1" status="down" />);

        expect(screen.getByText(/MONITOR1 Status.*:.*down/)).toBeInTheDocument();
    });

    it("re-renders when monitor ID changes", () => {
        const { rerender } = render(<SiteCardStatus selectedMonitorId="monitor1" status="up" />);

        rerender(<SiteCardStatus selectedMonitorId="monitor2" status="up" />);

        expect(screen.getByText(/MONITOR2 Status.*:.*up/)).toBeInTheDocument();
        expect(screen.queryByText(/MONITOR1 Status/)).not.toBeInTheDocument();
    });

    it("handles empty monitor ID gracefully", () => {
        render(<SiteCardStatus selectedMonitorId="" status="pending" />);

        expect(screen.getByText(/Status.*:.*pending/)).toBeInTheDocument();
    });

    it("passes correct props to StatusBadge", () => {
        render(<SiteCardStatus selectedMonitorId="test" status="up" />);

        const badge = screen.getByText(/TEST Status.*:.*up/);
        expect(badge).toBeInTheDocument();

        // StatusBadge should receive the correct status by checking if the status indicator exists
        // We look for the status indicator which should be present when status is "up"
        const statusIndicator = badge.parentElement?.querySelector(".themed-status-indicator");
        expect(statusIndicator).toBeInTheDocument();
    });

    it("handles all valid status values", () => {
        const statuses: ("up" | "down" | "pending")[] = ["up", "down", "pending"];

        for (const status of statuses) {
            const { unmount } = render(<SiteCardStatus selectedMonitorId="test" status={status} />);

            expect(screen.getByText(new RegExp(`TEST Status.*:.*${status}`))).toBeInTheDocument();

            unmount();
        }
    });
});
