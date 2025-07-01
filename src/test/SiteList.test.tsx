/**
 * @vitest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteList } from "../components/Dashboard/SiteList";
import { useStore } from "../store";
import { useTheme } from "../theme/useTheme";

// Mock the store
vi.mock("../store", () => ({
    useStore: vi.fn(),
}));

// Mock the theme hook
vi.mock("../theme/useTheme", () => ({
    useTheme: vi.fn(),
}));

// Mock the child components
vi.mock("../components/Dashboard/SiteCard", () => ({
    SiteCard: ({ site }: { site: { identifier: string; name: string } }) => (
        <div data-testid={`site-card-${site.identifier}`}>
            Site Card: {site.name}
        </div>
    ),
}));

vi.mock("../components/Dashboard/SiteList/EmptyState", () => ({
    EmptyState: () => <div data-testid="empty-state">No sites configured</div>,
}));

describe("SiteList", () => {
    const mockSites = [
        {
            identifier: "site-1",
            name: "Test Site 1",
            url: "https://example1.com",
        },
        {
            identifier: "site-2", 
            name: "Test Site 2",
            url: "https://example2.com",
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render EmptyState when no sites exist", () => {
        (useStore as any).mockReturnValue({
            sites: [],
        });
        (useTheme as any).mockReturnValue({
            isDark: false,
        });

        render(<SiteList />);

        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
        expect(screen.getByText("No sites configured")).toBeInTheDocument();
    });

    it("should render site cards when sites exist", () => {
        (useStore as any).mockReturnValue({
            sites: mockSites,
        });
        (useTheme as any).mockReturnValue({
            isDark: false,
        });

        render(<SiteList />);

        expect(screen.getByTestId("site-card-site-1")).toBeInTheDocument();
        expect(screen.getByTestId("site-card-site-2")).toBeInTheDocument();
        expect(screen.getByText("Site Card: Test Site 1")).toBeInTheDocument();
        expect(screen.getByText("Site Card: Test Site 2")).toBeInTheDocument();
    });

    it("should apply light theme classes", () => {
        (useStore as any).mockReturnValue({
            sites: mockSites,
        });
        (useTheme as any).mockReturnValue({
            isDark: false,
        });

        const { container } = render(<SiteList />);
        const dividerElement = container.querySelector(".divider-y");

        expect(dividerElement).toBeInTheDocument();
        expect(dividerElement).not.toHaveClass("dark");
    });

    it("should apply dark theme classes", () => {
        (useStore as any).mockReturnValue({
            sites: mockSites,
        });
        (useTheme as any).mockReturnValue({
            isDark: true,
        });

        const { container } = render(<SiteList />);
        const dividerElement = container.querySelector(".divider-y");

        expect(dividerElement).toBeInTheDocument();
        expect(dividerElement).toHaveClass("dark");
    });

    it("should render correct number of site cards", () => {
        (useStore as any).mockReturnValue({
            sites: mockSites,
        });
        (useTheme as any).mockReturnValue({
            isDark: false,
        });

        render(<SiteList />);

        const siteCards = screen.getAllByText(/Site Card:/);
        expect(siteCards).toHaveLength(2);
    });

    it("should handle single site", () => {
        const singleSite = [mockSites[0]];
        (useStore as any).mockReturnValue({
            sites: singleSite,
        });
        (useTheme as any).mockReturnValue({
            isDark: false,
        });

        render(<SiteList />);

        expect(screen.getByTestId("site-card-site-1")).toBeInTheDocument();
        expect(screen.queryByTestId("site-card-site-2")).not.toBeInTheDocument();
        expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    });
});
