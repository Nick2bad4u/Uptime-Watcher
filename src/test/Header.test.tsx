/**
 * @vitest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "../components/Header/Header";
import { useSitesStore, useUIStore } from "../stores";
import { useTheme, useAvailabilityColors } from "../theme/useTheme";

// Mock the stores
vi.mock("../stores", () => ({
    useSitesStore: vi.fn(),
    useUIStore: vi.fn(),
}));

// Mock the theme hooks
vi.mock("../theme/useTheme", () => ({
    useTheme: vi.fn(),
    useAvailabilityColors: vi.fn(),
}));

// Mock the themed components
vi.mock("../theme/components", () => ({
    ThemedBox: ({ children, border, ...props }: any) => {
        const filteredProps = { ...props };
        // Remove non-DOM props
        delete filteredProps.border;
        if (border !== undefined) filteredProps["data-border"] = border.toString();
        return (
            <div data-testid="themed-box" {...filteredProps}>
                {children}
            </div>
        );
    },
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
    StatusIndicator: ({ status, ...props }: any) => {
        let icon = "🟡";
        if (status === "up") {
            icon = "🟢";
        } else if (status === "down") {
            icon = "🔴";
        }
        return (
            <div data-testid="status-indicator" data-status={status} {...props}>
                {icon}
            </div>
        );
    },
}));

// Mock CSS imports
vi.mock("../components/Header/Header.css", () => ({}));

describe("Header", () => {
    const mockSetShowSettings = vi.fn();
    const mockToggleTheme = vi.fn();
    const mockGetAvailabilityColor = vi.fn();

    const mockSites = [
        {
            identifier: "site-1",
            name: "Test Site 1",
            monitors: [
                { id: "monitor-1", status: "up" },
                { id: "monitor-2", status: "up" },
                { id: "monitor-3", status: "down" },
            ],
        },
        {
            identifier: "site-2",
            name: "Test Site 2",
            monitors: [
                { id: "monitor-4", status: "pending" },
                { id: "monitor-5", status: "up" },
            ],
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        (useSitesStore as any).mockReturnValue({
            sites: mockSites,
        });

        (useUIStore as any).mockReturnValue({
            setShowSettings: mockSetShowSettings,
        });

        (useTheme as any).mockReturnValue({
            isDark: false,
            toggleTheme: mockToggleTheme,
        });

        (useAvailabilityColors as any).mockReturnValue({
            getAvailabilityColor: mockGetAvailabilityColor,
        });

        mockGetAvailabilityColor.mockReturnValue("#10b981");
    });

    it("should render header with app title", () => {
        render(<Header />);

        expect(screen.getByText("📊")).toBeInTheDocument();
        expect(screen.getByText("Uptime Watcher")).toBeInTheDocument();
    });

    it("should display correct monitor counts", () => {
        render(<Header />);

        // Check that the specific numbers appear with their context
        expect(screen.getByText("3")).toBeInTheDocument(); // up monitors
        expect(screen.getByText("5")).toBeInTheDocument(); // total monitors

        // For the duplicate "1" values, we need to use getAllByText and check both exist
        const onesText = screen.getAllByText("1");
        expect(onesText).toHaveLength(2); // down and pending both show "1"

        // Check that the labels are present
        expect(screen.getByText("Up")).toBeInTheDocument();
        expect(screen.getByText("Down")).toBeInTheDocument();
        expect(screen.getByText("Pending")).toBeInTheDocument();
        expect(screen.getByText("Total")).toBeInTheDocument();
    });

    it("should calculate and display uptime percentage", () => {
        render(<Header />);

        // 3 up out of 5 total = 60%
        expect(screen.getByText("60%")).toBeInTheDocument();
        expect(screen.getByText("Health")).toBeInTheDocument();
    });

    it("should show status indicators", () => {
        render(<Header />);

        const statusIndicators = screen.getAllByTestId("status-indicator");
        expect(statusIndicators).toHaveLength(3);

        expect(screen.getByText("Up")).toBeInTheDocument();
        expect(screen.getByText("Down")).toBeInTheDocument();
        expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it("should show theme toggle button", () => {
        render(<Header />);

        const themeButton = screen.getByLabelText("Toggle theme");
        expect(themeButton).toBeInTheDocument();
        expect(themeButton).toHaveTextContent("🌙"); // Light mode shows moon
    });

    it("should show settings button", () => {
        render(<Header />);

        const settingsButton = screen.getByLabelText("Settings");
        expect(settingsButton).toBeInTheDocument();
        expect(settingsButton).toHaveTextContent("⚙️");
    });

    it("should handle theme toggle click", async () => {
        const user = userEvent.setup();
        render(<Header />);

        const themeButton = screen.getByLabelText("Toggle theme");
        await user.click(themeButton);

        expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it("should handle settings click", async () => {
        const user = userEvent.setup();
        render(<Header />);

        const settingsButton = screen.getByLabelText("Settings");
        await user.click(settingsButton);

        expect(mockSetShowSettings).toHaveBeenCalledWith(true);
    });

    it("should show dark theme icon when in dark mode", () => {
        (useTheme as any).mockReturnValue({
            isDark: true,
            toggleTheme: mockToggleTheme,
        });

        render(<Header />);

        const themeButton = screen.getByLabelText("Toggle theme");
        expect(themeButton).toHaveTextContent("☀️"); // Dark mode shows sun
    });

    it("should handle zero monitors gracefully", () => {
        (useSitesStore as any).mockReturnValue({
            sites: [],
        });

        (useUIStore as any).mockReturnValue({
            setShowSettings: mockSetShowSettings,
        });

        render(<Header />);

        expect(screen.getByText("Uptime Watcher")).toBeInTheDocument();

        // Check that all status counters show 0
        const upBadge = screen.getByText("Up").closest("div");
        expect(upBadge).toHaveTextContent("0");

        const downBadge = screen.getByText("Down").closest("div");
        expect(downBadge).toHaveTextContent("0");

        const pendingBadge = screen.getByText("Pending").closest("div");
        expect(pendingBadge).toHaveTextContent("0");
    });

    it("should handle sites without monitors", () => {
        (useSitesStore as any).mockReturnValue({
            sites: [{ identifier: "site-1", name: "Test Site", monitors: undefined }],
        });

        (useUIStore as any).mockReturnValue({
            setShowSettings: mockSetShowSettings,
        });

        render(<Header />);

        expect(screen.getByText("Uptime Watcher")).toBeInTheDocument();
        // Should not break with undefined monitors
    });

    it("should call availability color function with correct percentage", () => {
        render(<Header />);

        expect(mockGetAvailabilityColor).toHaveBeenCalledWith(60);
    });

    it("should display total monitors count", () => {
        render(<Header />);

        expect(screen.getByText("Total")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should show proper status badge counts", () => {
        render(<Header />);

        // Check that all status labels are present
        expect(screen.getByText("Up")).toBeInTheDocument();
        expect(screen.getByText("Down")).toBeInTheDocument();
        expect(screen.getByText("Pending")).toBeInTheDocument();
        expect(screen.getByText("Total")).toBeInTheDocument();
    });
});
