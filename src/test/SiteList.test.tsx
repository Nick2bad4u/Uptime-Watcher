/**
 * @vitest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { SiteList } from "../components/Dashboard/SiteList";
import { useSitesStore } from "../stores/sites/useSitesStore";
import { useTheme } from "../theme/useTheme";

// Mock the sites store with proper variable hoisting
vi.mock("../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(),
}));

// Mock the theme hook
vi.mock("../theme/useTheme", () => ({
    useTheme: vi.fn(),
}));

// Get the mocked function for type safety
const mockUseSitesStore = vi.mocked(useSitesStore);
const mockUseTheme = vi.mocked(useTheme);

// Mock the child components
vi.mock("../components/Dashboard/SiteCard", () => ({
    SiteCard: ({ site }: { site: { identifier: string; name: string } }) => (
        <div data-testid={`site-card-${site.identifier}`}>Site Card: {site.name}</div>
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

    it("should render empty state when no sites exist", () => {
        mockUseSitesStore.mockReturnValue({
            sites: [],
        });
        mockUseTheme.mockReturnValue({
            isDark: false,
        } as any);

        render(<SiteList />);

        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
        expect(screen.getByText("No sites configured")).toBeInTheDocument();
    });

    it("should render site cards when sites exist", () => {
        mockUseSitesStore.mockReturnValue({
            sites: mockSites,
        });
        mockUseTheme.mockReturnValue({
            isDark: false,
        } as any);

        render(<SiteList />);

        expect(screen.getByTestId("site-card-site-1")).toBeInTheDocument();
        expect(screen.getByTestId("site-card-site-2")).toBeInTheDocument();
        expect(screen.getByText("Site Card: Test Site 1")).toBeInTheDocument();
        expect(screen.getByText("Site Card: Test Site 2")).toBeInTheDocument();
    });

    it("should apply light theme classes", () => {
        mockUseSitesStore.mockReturnValue({
            sites: mockSites,
        });
        mockUseTheme.mockReturnValue({
            isDark: false,
        } as any);

        const { container } = render(<SiteList />);
        const dividerElement = container.querySelector(".divider-y");

        expect(dividerElement).toBeInTheDocument();
        expect(dividerElement).not.toHaveClass("dark");
    });

    it("should apply dark theme classes", () => {
        mockUseSitesStore.mockReturnValue({
            sites: mockSites,
        });
        mockUseTheme.mockReturnValue({
            isDark: true,
        } as any);

        const { container } = render(<SiteList />);
        const dividerElement = container.querySelector(".divider-y");

        expect(dividerElement).toBeInTheDocument();
        expect(dividerElement).toHaveClass("dark");
    });

    it("should render correct number of site cards", () => {
        mockUseSitesStore.mockReturnValue({
            sites: mockSites,
        });
        mockUseTheme.mockReturnValue({
            isDark: false,
        } as any);

        render(<SiteList />);

        const siteCards = screen.getAllByText(/Site Card:/);
        expect(siteCards).toHaveLength(2);
    });

    it("should handle single site", () => {
        const singleSite = [mockSites[0]];
        mockUseSitesStore.mockReturnValue({
            sites: singleSite,
        });
        mockUseTheme.mockReturnValue({
            isDark: false,
        } as any);

        render(<SiteList />);

        expect(screen.getByTestId("site-card-site-1")).toBeInTheDocument();
        expect(screen.queryByTestId("site-card-site-2")).not.toBeInTheDocument();
        expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    });
});
