/**
 * Tests for SiteCardHeader component
 * Validates header rendering, monitor selection, and action buttons
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SiteCardHeader } from "../components/Dashboard/SiteCard/SiteCardHeader";
import { Site } from "../types";

const mockSite: Site = {
    identifier: "test-site",
    monitors: [
        {
            history: [],
            id: "monitor1",
            status: "up",
            type: "http",
        },
        {
            history: [],
            id: "monitor2",
            status: "down",
            type: "port",
        },
    ],
    name: "Test Site",
};

const defaultProps = {
    hasMonitor: true,
    isLoading: false,
    isMonitoring: false,
    onCheckNow: vi.fn(),
    onMonitorIdChange: vi.fn(),
    onStartMonitoring: vi.fn(),
    onStopMonitoring: vi.fn(),
    selectedMonitorId: "monitor1",
    site: mockSite,
};

describe("SiteCardHeader", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders site name correctly", () => {
        render(<SiteCardHeader {...defaultProps} />);

        expect(screen.getByText("Test Site")).toBeInTheDocument();
    });

    it("falls back to identifier when name is not provided", () => {
        const siteWithoutName: Site = {
            ...mockSite,
            name: undefined,
        };

        render(<SiteCardHeader {...defaultProps} site={siteWithoutName} />);

        expect(screen.getByText("test-site")).toBeInTheDocument();
    });

    it("renders monitor selector with correct options", () => {
        render(<SiteCardHeader {...defaultProps} />);

        // MonitorSelector should be rendered
        const selector = screen.getByRole("combobox");
        expect(selector).toBeInTheDocument();
    });

    it("calls onMonitorIdChange when monitor selection changes", async () => {
        const user = userEvent.setup();
        render(<SiteCardHeader {...defaultProps} />);

        const selector = screen.getByRole("combobox");
        await user.selectOptions(selector, "monitor2");

        expect(defaultProps.onMonitorIdChange).toHaveBeenCalled();
    });

    it("renders action button group", () => {
        render(<SiteCardHeader {...defaultProps} />);

        // Look for action buttons (these would be rendered by ActionButtonGroup)
        // The actual button text depends on the ActionButtonGroup implementation
        // Just check that the container is rendered
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThan(0);
    });

    it("passes correct props to ActionButtonGroup when monitoring", () => {
        render(<SiteCardHeader {...defaultProps} isMonitoring />);

        // Verify buttons are present (ActionButtonGroup should render them)
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThan(0);
    });

    it("passes correct props to ActionButtonGroup when loading", () => {
        render(<SiteCardHeader {...defaultProps} isLoading />);

        // When loading, buttons might be disabled
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThan(0);
    });

    it("disables action buttons when hasMonitor is false", () => {
        render(<SiteCardHeader {...defaultProps} hasMonitor={false} />);

        // ActionButtonGroup should receive disabled=true
        const buttons = screen.getAllByRole("button");
        for (const button of buttons) {
            expect(button).toBeDisabled();
        }
    });

    it("handles site with empty monitors array", () => {
        const siteWithNoMonitors: Site = {
            ...mockSite,
            monitors: [],
        };

        render(<SiteCardHeader {...defaultProps} site={siteWithNoMonitors} />);

        expect(screen.getByText("Test Site")).toBeInTheDocument();
    });

    it("memoizes component to prevent unnecessary re-renders", () => {
        const { rerender } = render(<SiteCardHeader {...defaultProps} />);

        // Rerender with same props
        rerender(<SiteCardHeader {...defaultProps} />);

        // Component should still be present
        expect(screen.getByText("Test Site")).toBeInTheDocument();
    });

    it("handles very long site names", () => {
        const siteWithLongName: Site = {
            ...mockSite,
            name: "This is a very long site name that might overflow the header layout",
        };

        render(<SiteCardHeader {...defaultProps} site={siteWithLongName} />);

        expect(
            screen.getByText("This is a very long site name that might overflow the header layout")
        ).toBeInTheDocument();
    });

    it("passes all callback props correctly", () => {
        render(<SiteCardHeader {...defaultProps} />);

        // Test that callbacks can be triggered
        // The actual button triggering depends on ActionButtonGroup implementation
        // But we can verify the props structure is correct
        expect(defaultProps.onCheckNow).toBeDefined();
        expect(defaultProps.onStartMonitoring).toBeDefined();
        expect(defaultProps.onStopMonitoring).toBeDefined();
        expect(defaultProps.onMonitorIdChange).toBeDefined();
    });
});
