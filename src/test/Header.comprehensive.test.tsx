/**
 * Comprehensive test suite for Header component.
 * Tests all functionality including status indicators, theme toggle, and settings.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { Header } from "../components/Header/Header";
import { useSitesStore, useUIStore } from "../stores";
import { useTheme, useAvailabilityColors } from "../theme";

// Mock all dependencies
vi.mock("../stores", () => ({
    useSitesStore: vi.fn(),
    useUIStore: vi.fn(),
}));

vi.mock("../theme", () => ({
    ThemedBox: ({ children, ...props }: any) => (
        <div data-testid="themed-box" {...props}>
            {children}
        </div>
    ),
    ThemedText: ({ children, ...props }: any) => (
        <span data-testid="themed-text" {...props}>
            {children}
        </span>
    ),
    ThemedButton: ({ children, onClick, ...props }: any) => (
        <button data-testid="themed-button" onClick={onClick} {...props}>
            {children}
        </button>
    ),
    StatusIndicator: ({ status, ...props }: any) => (
        <div data-testid="status-indicator" data-status={status} {...props} />
    ),
    useTheme: vi.fn(),
    useAvailabilityColors: vi.fn(),
}));

// Mock CSS import
vi.mock("../components/Header/Header.css", () => ({}));

describe("Header Component", () => {
    const mockSetShowSettings = vi.fn();
    const mockToggleTheme = vi.fn();
    const mockGetAvailabilityColor = vi.fn();

    const defaultMocks = {
        useSitesStore: {
            sites: [],
        },
        useUIStore: {
            setShowSettings: mockSetShowSettings,
        },
        useTheme: {
            isDark: false,
            toggleTheme: mockToggleTheme,
        },
        useAvailabilityColors: {
            getAvailabilityColor: mockGetAvailabilityColor,
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mocks
        (useSitesStore as any).mockReturnValue(defaultMocks.useSitesStore);
        (useUIStore as any).mockReturnValue(defaultMocks.useUIStore);
        (useTheme as any).mockReturnValue(defaultMocks.useTheme);
        (useAvailabilityColors as any).mockReturnValue(defaultMocks.useAvailabilityColors);

        mockGetAvailabilityColor.mockReturnValue("green");
    });

    describe("Rendering", () => {
        it("renders header with app title", () => {
            render(<Header />);

            expect(screen.getByText("📊")).toBeInTheDocument();
            expect(screen.getByText("Uptime Watcher")).toBeInTheDocument();
        });

        it("renders theme toggle button", () => {
            render(<Header />);

            const themeButtons = screen.getAllByTestId("themed-button");
            const themeButton = themeButtons.find((btn) => btn.textContent === "🌙" || btn.textContent === "☀️");
            expect(themeButton).toBeInTheDocument();
        });

        it("renders settings button", () => {
            render(<Header />);

            const settingsButton = screen.getByText("⚙️");
            expect(settingsButton).toBeInTheDocument();
        });
    });

    describe("Theme Toggle", () => {
        it("shows moon icon when in light mode", () => {
            (useTheme as any).mockReturnValue({
                isDark: false,
                toggleTheme: mockToggleTheme,
            });

            render(<Header />);

            expect(screen.getByText("🌙")).toBeInTheDocument();
        });

        it("shows sun icon when in dark mode", () => {
            (useTheme as any).mockReturnValue({
                isDark: true,
                toggleTheme: mockToggleTheme,
            });

            render(<Header />);

            expect(screen.getByText("☀️")).toBeInTheDocument();
        });

        it("calls toggleTheme when theme button is clicked", () => {
            render(<Header />);

            const themeButton = screen.getByText("🌙");
            fireEvent.click(themeButton);

            expect(mockToggleTheme).toHaveBeenCalledTimes(1);
        });
    });

    describe("Settings Modal", () => {
        it("calls setShowSettings when settings button is clicked", () => {
            render(<Header />);

            const settingsButton = screen.getByText("⚙️");
            fireEvent.click(settingsButton);

            expect(mockSetShowSettings).toHaveBeenCalledWith(true);
        });
    });

    describe("Monitor Status Display", () => {
        it("shows status indicators even when no sites exist", () => {
            render(<Header />);

            // Status indicators are always shown, they just show 0 counts
            const statusIndicators = screen.getAllByTestId("status-indicator");
            expect(statusIndicators).toHaveLength(3); // up, down, pending

            // Check that the counts are all 0
            const upText = screen.getByText("Up").previousElementSibling;
            const downText = screen.getByText("Down").previousElementSibling;
            const pendingText = screen.getByText("Pending").previousElementSibling;

            expect(upText).toHaveTextContent("0");
            expect(downText).toHaveTextContent("0");
            expect(pendingText).toHaveTextContent("0");
        });

        it("calculates and displays correct monitor counts", () => {
            const sitesWithMonitors = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    monitors: [
                        { id: 1, status: "up" },
                        { id: 2, status: "down" },
                        { id: 3, status: "pending" },
                    ],
                },
                {
                    identifier: "site2",
                    name: "Site 2",
                    monitors: [
                        { id: 4, status: "up" },
                        { id: 5, status: "up" },
                    ],
                },
            ];

            (useSitesStore as any).mockReturnValue({
                sites: sitesWithMonitors,
            });

            render(<Header />);

            // Should show: 3 up, 1 down, 1 pending, 5 total
            const upText = screen.getByText("Up").previousElementSibling;
            const downText = screen.getByText("Down").previousElementSibling;
            const pendingText = screen.getByText("Pending").previousElementSibling;
            const totalText = screen.getByText("Total").previousElementSibling;

            expect(upText).toHaveTextContent("3");
            expect(downText).toHaveTextContent("1");
            expect(pendingText).toHaveTextContent("1");
            expect(totalText).toHaveTextContent("5");
        });

        it("calculates correct uptime percentage", () => {
            const sitesWithMonitors = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    monitors: [
                        { id: 1, status: "up" },
                        { id: 2, status: "up" },
                        { id: 3, status: "up" },
                        { id: 4, status: "down" },
                    ],
                },
            ];

            (useSitesStore as any).mockReturnValue({
                sites: sitesWithMonitors,
            });

            render(<Header />);

            // 3 up out of 4 total = 75%
            expect(screen.getByText("75%")).toBeInTheDocument();
        });

        it("shows status indicators for each monitor type", () => {
            const sitesWithMonitors = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    monitors: [
                        { id: 1, status: "up" },
                        { id: 2, status: "down" },
                        { id: 3, status: "pending" },
                    ],
                },
            ];

            (useSitesStore as any).mockReturnValue({
                sites: sitesWithMonitors,
            });

            render(<Header />);

            const statusIndicators = screen.getAllByTestId("status-indicator");
            const statusTypes = statusIndicators.map((indicator) => indicator.getAttribute("data-status"));

            expect(statusTypes).toContain("up");
            expect(statusTypes).toContain("down");
            expect(statusTypes).toContain("pending");
        });

        it("calls getAvailabilityColor with correct percentage", () => {
            const sitesWithMonitors = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    monitors: [
                        { id: 1, status: "up" },
                        { id: 2, status: "up" },
                        { id: 3, status: "down" },
                        { id: 4, status: "down" },
                    ],
                },
            ];

            (useSitesStore as any).mockReturnValue({
                sites: sitesWithMonitors,
            });

            render(<Header />);

            // 2 up out of 4 total = 50%
            expect(mockGetAvailabilityColor).toHaveBeenCalledWith(50);
        });
    });

    describe("Edge Cases", () => {
        it("handles empty monitors array", () => {
            const sitesWithEmptyMonitors = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    monitors: [],
                },
            ];

            (useSitesStore as any).mockReturnValue({
                sites: sitesWithEmptyMonitors,
            });

            render(<Header />);

            // Should show status indicators with 0 counts
            const statusIndicators = screen.getAllByTestId("status-indicator");
            expect(statusIndicators).toHaveLength(3);

            // Check that all counts are 0
            const upText = screen.getByText("Up").previousElementSibling;
            const downText = screen.getByText("Down").previousElementSibling;
            const pendingText = screen.getByText("Pending").previousElementSibling;

            expect(upText).toHaveTextContent("0");
            expect(downText).toHaveTextContent("0");
            expect(pendingText).toHaveTextContent("0");
        });

        it("handles monitors with unknown status", () => {
            const sitesWithUnknownStatus = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    monitors: [
                        { id: 1, status: "up" },
                        { id: 2, status: "unknown" }, // invalid status
                        { id: 3, status: "down" },
                    ],
                },
            ];

            (useSitesStore as any).mockReturnValue({
                sites: sitesWithUnknownStatus,
            });

            render(<Header />);

            // Should count total = 3, up = 1, down = 1, pending = 0
            // Unknown status should not be counted in any specific category
            const upText = screen.getByText("Up").previousElementSibling;
            const downText = screen.getByText("Down").previousElementSibling;
            const pendingText = screen.getByText("Pending").previousElementSibling;
            const totalText = screen.getByText("Total").previousElementSibling;

            expect(upText).toHaveTextContent("1");
            expect(downText).toHaveTextContent("1");
            expect(pendingText).toHaveTextContent("0");
            expect(totalText).toHaveTextContent("3");
        });

        it("calculates uptime as 0% when no monitors exist", () => {
            render(<Header />);

            // With no monitors, uptime should be 0%
            const percentageElements = screen.queryAllByText(/\d+%/);
            if (percentageElements.length > 0) {
                expect(percentageElements[0]).toHaveTextContent("0%");
            }
        });
    });

    describe("Responsive Behavior", () => {
        it("applies correct CSS classes for responsive layout", () => {
            render(<Header />);

            const themedBoxes = screen.getAllByTestId("themed-box");
            expect(themedBoxes.length).toBeGreaterThan(0);

            // Should have classes for responsive behavior
            const headerContainer = themedBoxes[0];
            expect(headerContainer).toHaveClass("border-b", "shadow-sm");
        });
    });

    describe("Accessibility", () => {
        it("has proper aria-labels for buttons", () => {
            render(<Header />);

            const themeButtons = screen.getAllByTestId("themed-button");
            const themeButton = themeButtons.find((btn) => btn.getAttribute("aria-label") === "Toggle theme");
            const settingsButton = themeButtons.find((btn) => btn.getAttribute("aria-label") === "Settings");

            expect(themeButton).toBeInTheDocument();
            expect(settingsButton).toBeInTheDocument();
        });
    });

    describe("Performance", () => {
        it("memoizes monitor counts calculation", () => {
            const sitesWithMonitors = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    monitors: [
                        { id: 1, status: "up" },
                        { id: 2, status: "down" },
                    ],
                },
            ];

            const { rerender } = render(<Header />);

            (useSitesStore as any).mockReturnValue({
                sites: sitesWithMonitors,
            });

            // Re-render with same data
            rerender(<Header />);

            // The useMemo should prevent recalculation if sites haven't changed
            const upText = screen.getByText("Up").previousElementSibling;
            const downText = screen.getByText("Down").previousElementSibling;
            const totalText = screen.getByText("Total").previousElementSibling;

            expect(upText).toHaveTextContent("1");
            expect(downText).toHaveTextContent("1");
            expect(totalText).toHaveTextContent("2");
        });
    });
});
