/**
 * Comprehensive test suite for Header component
 * Tests all branches, edge cases, and user interactions
 */

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Header } from "../../../components/Header/Header";
import { useSitesStore } from "../../../stores/sites/useSitesStore";
import { useUIStore } from "../../../stores/ui/useUiStore";
import { useTheme, useAvailabilityColors } from "../../../theme/useTheme";

// Mock all store hooks
vi.mock("../../../stores/sites/useSitesStore");
vi.mock("../../../stores/ui/useUiStore");
vi.mock("../../../theme/useTheme");

const mockUseSitesStore = vi.mocked(useSitesStore);
const mockUseUIStore = vi.mocked(useUIStore);
const mockUseTheme = vi.mocked(useTheme);
const mockUseAvailabilityColors = vi.mocked(useAvailabilityColors);

// Create complete mock theme object
const createMockTheme = (isDark = false) => ({
    availableThemes: ["light", "dark"],
    isDark,
    toggleTheme: vi.fn(),
    setTheme: vi.fn(),
    systemTheme: "light",
    themeName: "light",
    themeVersion: 1,
    themeManager: {},
    currentTheme: {
        colors: {
            background: { primary: "#ffffff" },
            status: { up: "#green", down: "#red", pending: "#yellow" }
        },
        typography: {
            fontSize: {
                xs: "0.75rem",
                sm: "0.875rem", 
                base: "1rem"
            },
            fontWeight: {
                medium: "500"
            }
        },
        borderRadius: {
            sm: "0.125rem",
            full: "9999px"
        },
        spacing: {
            xs: "0.25rem"
        }
    },
    getColor: vi.fn(() => "#ffffff"),
    getStatusColor: vi.fn(() => "#green")
} as any);

describe("Header Component", () => {
    const mockSetShowSettings = vi.fn();
    const mockGetAvailabilityColor = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations
        mockUseUIStore.mockReturnValue({
            setShowSettings: mockSetShowSettings,
        } as any);

        mockUseTheme.mockReturnValue(createMockTheme());

        mockUseAvailabilityColors.mockReturnValue({
            getAvailabilityColor: mockGetAvailabilityColor,
        } as any);

        mockGetAvailabilityColor.mockReturnValue("success");
    });

    describe("Monitor Count Calculations", () => {
        it("should display correct counts with no sites", () => {
            mockUseSitesStore.mockReturnValue({
                sites: [],
            } as any);

            render(<Header />);

            // Should not display any status indicators when no monitors
            expect(screen.queryByText("Health")).not.toBeInTheDocument();
            expect(screen.queryByText("Total")).not.toBeInTheDocument();
        });

        it("should display correct counts with sites having no monitors", () => {
            mockUseSitesStore.mockReturnValue({
                sites: [
                    { id: "1", name: "Site 1", monitors: [] },
                    { id: "2", name: "Site 2", monitors: [] },
                ],
            } as any);

            render(<Header />);

            // Should not display health indicator when no monitors
            expect(screen.queryByText("Health")).not.toBeInTheDocument();
        });

        it("should correctly count monitors with all 'up' status", () => {
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "up" },
                            { id: "2", status: "up" },
                        ],
                    },
                    {
                        id: "2",
                        name: "Site 2",
                        monitors: [
                            { id: "3", status: "up" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            expect(screen.getByText("Up")).toBeInTheDocument();
            expect(screen.getByText("Up").parentElement?.parentElement?.textContent).toContain("3");
            expect(screen.getByText("Down")).toBeInTheDocument();
            expect(screen.getByText("Down").parentElement?.parentElement?.textContent).toContain("0");
            expect(screen.getByText("100%")).toBeInTheDocument(); // Health percentage
            expect(screen.getByText("Total")).toBeInTheDocument();
        });

        it("should correctly count monitors with mixed statuses", () => {
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "up" },
                            { id: "2", status: "down" },
                            { id: "3", status: "pending" },
                            { id: "4", status: "paused" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            // Find all text elements and check for the right counts
            const upElements = screen.getAllByText("1");
            expect(upElements.length).toBeGreaterThan(0); // Should have up, down, pending, paused each as 1

            expect(screen.getByText("25%")).toBeInTheDocument(); // 1 up out of 4 total = 25%
            expect(screen.getByText("4")).toBeInTheDocument(); // Total count
        });

        it("should handle large numbers of monitors correctly", () => {
            const monitors = Array.from({ length: 100 }, (_, i) => ({
                id: `${i}`,
                status: i < 75 ? "up" : "down",
            }));

            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Large Site",
                        monitors,
                    },
                ],
            } as any);

            render(<Header />);

            expect(screen.getByText("75")).toBeInTheDocument(); // Up count
            expect(screen.getByText("25")).toBeInTheDocument(); // Down count
            expect(screen.getByText("75%")).toBeInTheDocument(); // Health percentage
            expect(screen.getByText("100")).toBeInTheDocument(); // Total count
        });
    });

    describe("Uptime Percentage Calculation", () => {
        it("should calculate 0% when no monitors are up", () => {
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "down" },
                            { id: "2", status: "down" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            expect(screen.getByText("0%")).toBeInTheDocument();
        });

        it("should calculate 100% when all monitors are up", () => {
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "up" },
                            { id: "2", status: "up" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            expect(screen.getByText("100%")).toBeInTheDocument();
        });

        it("should round percentage correctly", () => {
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "up" },
                            { id: "2", status: "down" },
                            { id: "3", status: "down" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            expect(screen.getByText("33%")).toBeInTheDocument(); // 1/3 = 0.333... rounded to 33
        });
    });

    describe("Theme Toggle", () => {
        it("should display moon icon when in light mode", () => {
            mockUseTheme.mockReturnValue(createMockTheme(false));

            render(<Header />);

            const themeButton = screen.getByLabelText("Toggle theme");
            expect(themeButton).toHaveTextContent("🌙");
        });

        it("should display sun icon when in dark mode", () => {
            mockUseTheme.mockReturnValue(createMockTheme(true));

            render(<Header />);

            const themeButton = screen.getByLabelText("Toggle theme");
            expect(themeButton).toHaveTextContent("☀️");
        });

        it("should call toggleTheme when theme button is clicked", () => {
            const mockTheme = createMockTheme();
            mockUseTheme.mockReturnValue(mockTheme);
            
            render(<Header />);

            const themeButton = screen.getByLabelText("Toggle theme");
            fireEvent.click(themeButton);

            expect(mockTheme.toggleTheme).toHaveBeenCalledTimes(1);
        });
    });

    describe("Settings Modal", () => {
        it("should call setShowSettings when settings button is clicked", () => {
            render(<Header />);

            const settingsButton = screen.getByLabelText("Settings");
            fireEvent.click(settingsButton);

            expect(mockSetShowSettings).toHaveBeenCalledWith(true);
        });

        it("should display settings icon", () => {
            render(<Header />);

            const settingsButton = screen.getByLabelText("Settings");
            expect(settingsButton).toHaveTextContent("⚙️");
        });
    });

    describe("Status Indicators", () => {
        it("should display all status types when present", () => {
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "up" },
                            { id: "2", status: "down" },
                            { id: "3", status: "pending" },
                            { id: "4", status: "paused" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            expect(screen.getByText("Up")).toBeInTheDocument();
            expect(screen.getByText("Down")).toBeInTheDocument();
            expect(screen.getByText("Pending")).toBeInTheDocument();
            expect(screen.getByText("Paused")).toBeInTheDocument();
        });

        it("should handle monitors with unknown status", () => {
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "unknown" },
                            { id: "2", status: "up" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            // Unknown status should not be counted in any specific category
            expect(screen.getByText("1")).toBeInTheDocument(); // Up count
            expect(screen.getByText("50%")).toBeInTheDocument(); // 1 up out of 2 total
        });
    });

    describe("Accessibility", () => {
        it("should have proper aria labels for buttons", () => {
            render(<Header />);

            expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
            expect(screen.getByLabelText("Settings")).toBeInTheDocument();
        });

        it("should have proper heading structure", () => {
            render(<Header />);

            expect(screen.getByText("Uptime Watcher")).toBeInTheDocument();
        });
    });

    describe("Availability Color Integration", () => {
        it("should call getAvailabilityColor with correct percentage", () => {
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "up" },
                            { id: "2", status: "down" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            expect(mockGetAvailabilityColor).toHaveBeenCalledWith(50); // 1 up out of 2 = 50%
        });

        it("should handle 0% uptime correctly", () => {
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "down" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            expect(mockGetAvailabilityColor).toHaveBeenCalledWith(0);
        });

        it("should handle 100% uptime correctly", () => {
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "up" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            expect(mockGetAvailabilityColor).toHaveBeenCalledWith(100);
        });
    });

    describe("Component Structure", () => {
        it("should render the main title", () => {
            render(<Header />);

            expect(screen.getByText("Uptime Watcher")).toBeInTheDocument();
            expect(screen.getByText("📊")).toBeInTheDocument();
        });

        it("should have proper CSS classes for styling", () => {
            const { container } = render(<Header />);

            expect(container.querySelector(".header-container")).toBeInTheDocument();
            expect(container.querySelector(".header-title-box")).toBeInTheDocument();
            expect(container.querySelector(".header-status-summary-box")).toBeInTheDocument();
        });
    });

    describe("Memoization", () => {
        it("should recalculate monitor counts when sites change", () => {
            const { rerender } = render(<Header />);

            // Initial state
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [{ id: "1", status: "up" }],
                    },
                ],
            } as any);

            rerender(<Header />);
            expect(screen.getByText("100%")).toBeInTheDocument();

            // Updated state
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1", status: "up" },
                            { id: "2", status: "down" },
                        ],
                    },
                ],
            } as any);

            rerender(<Header />);
            expect(screen.getByText("50%")).toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty monitor arrays", () => {
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [],
                    },
                ],
            } as any);

            render(<Header />);

            expect(screen.queryByText("Health")).not.toBeInTheDocument();
            expect(screen.queryByText("Total")).not.toBeInTheDocument();
        });

        it("should handle monitors without status", () => {
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: [
                            { id: "1" }, // No status property
                            { id: "2", status: "up" },
                        ],
                    },
                ],
            } as any);

            render(<Header />);

            // Should still render but only count the valid status
            expect(screen.getByText("50%")).toBeInTheDocument(); // 1 up out of 2 total
        });

        it("should handle sites with null/undefined monitors", () => {
            mockUseSitesStore.mockReturnValue({
                sites: [
                    {
                        id: "1",
                        name: "Site 1",
                        monitors: null,
                    },
                ],
            } as any);

            expect(() => render(<Header />)).not.toThrow();
        });
    });
});
