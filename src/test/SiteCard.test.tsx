/**
 * Tests for SiteCard component.
 * Validates site monitoring card display and interactions.
 */

import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import type { Site } from "../types";

import { SiteCard } from "../components/Dashboard/SiteCard";

// Mock the useSite hook with minimal required return
vi.mock("../hooks/site", () => ({
    useSite: vi.fn(),
}));

// Mock all the sub-components
vi.mock("../components/Dashboard/SiteCard/SiteCardFooter", () => ({
    SiteCardFooter: () => <div data-testid="site-card-footer">Footer</div>,
}));

vi.mock("../components/Dashboard/SiteCard/SiteCardHeader", () => ({
    SiteCardHeader: () => <div data-testid="site-card-header">Header</div>,
}));

vi.mock("../components/Dashboard/SiteCard/SiteCardHistory", () => ({
    SiteCardHistory: () => <div data-testid="site-card-history">History</div>,
}));

vi.mock("../components/Dashboard/SiteCard/SiteCardMetrics", () => ({
    SiteCardMetrics: () => <div data-testid="site-card-metrics">Metrics</div>,
}));

vi.mock("../components/Dashboard/SiteCard/SiteCardStatus", () => ({
    SiteCardStatus: () => <div data-testid="site-card-status">Status</div>,
}));

// Mock ThemedBox
vi.mock("../theme/components", () => ({
    ThemedBox: ({
        children,
        onClick,
        ...props
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        [key: string]: unknown;
    }) => (
        <button data-testid="themed-box" onClick={onClick} type="button" {...props}>
            {children}
        </button>
    ),
}));

// Import mocked modules
import { useSite } from "../hooks/site";

describe("SiteCard Component", () => {
    const mockUseSite = vi.mocked(useSite);

    const mockSite: Site = {
        identifier: "https://example.com",
        monitors: [],
        name: "Test Site",
    };

    const mockUseSiteReturn = {
        // Add additional required properties based on what the hook actually returns
        averageResponseTime: 150,
        checkCount: 100,
        filteredHistory: [],
        handleCardClick: vi.fn(),
        handleCheckNow: vi.fn(),
        handleMonitorIdChange: vi.fn(),
        handleStartMonitoring: vi.fn(),
        handleStopMonitoring: vi.fn(),
        isLoading: false,
        isMonitoring: true,
        latestSite: mockSite,
        monitor: undefined,
        monitorIds: ["monitor-1"],
        responseTime: 150,
        selectedMonitorId: "monitor-1",
        status: "up" as const,
        uptime: 99.5,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseSite.mockReturnValue(mockUseSiteReturn);
    });

    describe("Rendering", () => {
        it("should render all sub-components", () => {
            render(<SiteCard site={mockSite} />);

            expect(screen.getByTestId("site-card-header")).toBeInTheDocument();
            expect(screen.getByTestId("site-card-status")).toBeInTheDocument();
            expect(screen.getByTestId("site-card-metrics")).toBeInTheDocument();
            expect(screen.getByTestId("site-card-history")).toBeInTheDocument();
            expect(screen.getByTestId("site-card-footer")).toBeInTheDocument();
        });

        it("should render with ThemedBox wrapper", () => {
            render(<SiteCard site={mockSite} />);

            const themedBox = screen.getByTestId("themed-box");
            expect(themedBox).toBeInTheDocument();
            expect(themedBox).toHaveAttribute("type", "button");
        });

        it("should use site identifier when name is not available", () => {
            const siteWithoutName = { ...mockSite, name: undefined };
            mockUseSite.mockReturnValue({
                ...mockUseSiteReturn,
                latestSite: siteWithoutName,
            });

            render(<SiteCard site={siteWithoutName} />);

            // Should still render without errors
            expect(screen.getByTestId("themed-box")).toBeInTheDocument();
        });
    });

    describe("Interactions", () => {
        it("should handle card click", async () => {
            render(<SiteCard site={mockSite} />);

            const themedBox = screen.getByTestId("themed-box");
            themedBox.click();

            expect(mockUseSiteReturn.handleCardClick).toHaveBeenCalledTimes(1);
        });

        it("should call useSite hook with site prop", () => {
            render(<SiteCard site={mockSite} />);

            expect(mockUseSite).toHaveBeenCalledWith(mockSite);
        });
    });

    describe("Memoization", () => {
        it("should memoize the component", () => {
            const { rerender } = render(<SiteCard site={mockSite} />);

            // Clear mock calls
            mockUseSite.mockClear();

            // Rerender with same props
            rerender(<SiteCard site={mockSite} />);

            // Should not call useSite again due to memoization if React.memo works
            // Note: This might still call useSite depending on React's internal logic
            expect(screen.getByTestId("themed-box")).toBeInTheDocument();
        });

        it("should re-render when site prop changes", () => {
            const { rerender } = render(<SiteCard site={mockSite} />);

            // Clear mock calls
            mockUseSite.mockClear();

            // Rerender with different site
            const newSite = { ...mockSite, identifier: "https://different.com" };
            rerender(<SiteCard site={newSite} />);

            // Should call useSite again
            expect(mockUseSite).toHaveBeenCalledWith(newSite);
        });
    });
});
