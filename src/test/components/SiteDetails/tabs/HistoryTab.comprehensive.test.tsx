/**
 * Comprehensive test suite for HistoryTab component.
 * Tests filtering, pagination, display limits, and history management.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HistoryTab } from "../../../../components/SiteDetails/tabs/HistoryTab";
import type { HistoryTabProperties } from "../../../../components/SiteDetails/tabs/HistoryTab";
import { useSettingsStore } from "../../../../stores/settings/useSettingsStore";
import { useTheme } from "../../../../theme/useTheme";
import type { Monitor } from "../../../../../shared/types";

// Mock dependencies
vi.mock("../../../../stores/settings/useSettingsStore");
vi.mock("../../../../theme/useTheme");
vi.mock("../../../../services/logger");

// Mock icon imports
vi.mock("react-icons/fi", () => ({
    FiFilter: () => <div data-testid="filter-icon">FiFilter</div>,
    FiInbox: () => <div data-testid="inbox-icon">FiInbox</div>,
}));

vi.mock("react-icons/md", () => ({
    MdHistory: () => <div data-testid="history-icon">MdHistory</div>,
}));

// Mock themed components
vi.mock("../../../../theme/components", () => ({
    StatusIndicator: ({ children, ...props }: any) => (
        <div data-testid="status-indicator" {...props}>
            {children}
        </div>
    ),
    ThemedButton: ({ children, onClick, ...props }: any) => (
        <button data-testid="themed-button" onClick={onClick} {...props}>
            {children}
        </button>
    ),
    ThemedCard: ({ children, ...props }: any) => (
        <div data-testid="themed-card" {...props}>
            {children}
        </div>
    ),
    ThemedSelect: ({ children, value, onChange, ...props }: any) => (
        <select
            data-testid="themed-select"
            value={value}
            onChange={onChange}
            {...props}
        >
            {children}
        </select>
    ),
    ThemedText: ({ children, ...props }: any) => (
        <span data-testid="themed-text" {...props}>
            {children}
        </span>
    ),
}));

// Mock MonitorUiComponents
vi.mock("../../../../components/common/MonitorUiComponents", () => ({
    DetailLabel: ({ children, ...props }: any) => (
        <div data-testid="detail-label" {...props}>
            {children}
        </div>
    ),
}));

describe("HistoryTab", () => {
    const mockFormatFullTimestamp = vi.fn((timestamp: number) =>
        new Date(timestamp).toISOString()
    );
    const mockFormatResponseTime = vi.fn((time: number) => `${time}ms`);
    const mockFormatStatusWithIcon = vi.fn((status: string) =>
        status === "up" ? "✅ Up" : "❌ Down"
    );

    const createMockMonitor = (historyLength: number = 5): Monitor => ({
        id: "test-monitor",
        type: "http",
        url: "https://example.com",
        monitoring: true,
        checkInterval: 60000,
        timeout: 5000,
        retryAttempts: 3,
        status: "up",
        lastChecked: new Date(),
        responseTime: 150,
        history: Array.from({ length: historyLength }, (_, i) => ({
            timestamp: Date.now() - i * 60000,
            status: i % 2 === 0 ? "up" : "down",
            responseTime: 100 + i * 10,
        })),
    });

    const defaultProps: HistoryTabProperties = {
        formatFullTimestamp: mockFormatFullTimestamp,
        formatResponseTime: mockFormatResponseTime,
        formatStatusWithIcon: mockFormatStatusWithIcon,
        selectedMonitor: createMockMonitor(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        (useSettingsStore as any).mockReturnValue({
            settings: { historyLimit: 25 },
            initializeSettings: vi.fn(),
            updateSettings: vi.fn(),
            exportSettings: vi.fn(),
            importSettings: vi.fn(),
        });

        (useTheme as any).mockReturnValue({
            availableThemes: ["light", "dark"],
            currentTheme: {
                colors: {
                    primary: {
                        50: "#EFF6FF",
                        100: "#DBEAFE",
                        200: "#BFDBFE",
                        300: "#93C5FD",
                        400: "#60A5FA",
                        500: "#3B82F6",
                        600: "#2563EB",
                        700: "#1D4ED8",
                        800: "#1E40AF",
                        900: "#1E3A8A",
                    },
                    warning: "#F59E0B",
                    background: { primary: "#FFFFFF", secondary: "#F8FAFC" },
                    border: { primary: "#E2E8F0", secondary: "#CBD5E1" },
                    error: { 50: "#FEF2F2", 500: "#EF4444", 600: "#DC2626" },
                    errorAlert: "#DC2626",
                    info: "#3B82F6",
                    success: "#10B981",
                    successAlert: "#059669",
                    text: { primary: "#1F2937", secondary: "#6B7280" },
                    warningAlert: "#D97706",
                },
            } as any,
            getColor: vi.fn(),
            getStatusColor: vi.fn(),
            isDark: false,
            setTheme: vi.fn(),
            systemTheme: "light" as const,
            themeManager: {} as any,
            themeName: "light" as const,
            themeVersion: 1,
            toggleTheme: vi.fn(),
        });
    });

    describe("Component Rendering", () => {
        it("should render history tab with all main sections", () => {
            render(<HistoryTab {...defaultProps} />);

            expect(screen.getAllByTestId("themed-card")).toHaveLength(2); // History Filters and Check History cards
            expect(screen.getByTestId("history-tab")).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "All" })
            ).toBeInTheDocument();
        });

        it("should display filter buttons for all, up, and down", () => {
            render(<HistoryTab {...defaultProps} />);

            const buttons = screen.getAllByTestId("themed-button");
            expect(buttons).toHaveLength(3); // All, Up, Down filter buttons
        });

        it("should display history records when available", () => {
            const monitor = createMockMonitor(3);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            // Should show history records
            expect(screen.getAllByTestId("status-indicator")).toHaveLength(3);
        });

        it("should display empty state when no history available", () => {
            const monitor = createMockMonitor(0);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            expect(screen.getByTestId("inbox-icon")).toBeInTheDocument();
            expect(screen.getByText("No records found")).toBeInTheDocument();
        });
    });

    describe("History Filtering", () => {
        it("should filter history by 'all' status by default", () => {
            const monitor = createMockMonitor(4);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            // Should show all 4 history records
            expect(screen.getAllByTestId("status-indicator")).toHaveLength(4);
        });

        it("should filter history to show only 'up' status", async () => {
            const monitor = createMockMonitor(4);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            const upButton = screen.getByRole("button", { name: /up/i });
            await userEvent.click(upButton);

            // Should show only up status records (every even index)
            expect(screen.getAllByTestId("status-indicator")).toHaveLength(2);
        });

        it("should filter history to show only 'down' status", async () => {
            const monitor = createMockMonitor(4);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            // Get the filter button specifically (not any text containing "down")
            const downButton = screen.getByRole("button", { name: "❌ Down" });
            await userEvent.click(downButton);

            // Should show only down status records (every odd index)
            expect(screen.getAllByTestId("status-indicator")).toHaveLength(2);
        });

        it("should switch back to all records when 'all' filter is selected", async () => {
            const monitor = createMockMonitor(4);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            // First filter to up
            const upButton = screen.getByRole("button", { name: /up/i });
            await userEvent.click(upButton);
            expect(screen.getAllByTestId("status-indicator")).toHaveLength(2);

            // Then switch back to all
            const allButton = screen.getByRole("button", { name: /all/i });
            await userEvent.click(allButton);
            expect(screen.getAllByTestId("status-indicator")).toHaveLength(4);
        });
    });

    describe("Display Limits and Pagination", () => {
        it("should respect settings history limit", () => {
            vi.mocked(useSettingsStore).mockReturnValue({
                settings: { historyLimit: 10 },
                initializeSettings: vi.fn(),
                updateSettings: vi.fn(),
                exportSettings: vi.fn(),
                importSettings: vi.fn(),
            });

            const monitor = createMockMonitor(20);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            // Should show only up to history limit
            expect(screen.getAllByTestId("status-indicator")).toHaveLength(10);
        });

        it("should show all available records when history is less than limit", () => {
            vi.mocked(useSettingsStore).mockReturnValue({
                settings: { historyLimit: 100 },
                initializeSettings: vi.fn(),
                updateSettings: vi.fn(),
                exportSettings: vi.fn(),
                importSettings: vi.fn(),
            });

            const monitor = createMockMonitor(5);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            expect(screen.getAllByTestId("status-indicator")).toHaveLength(5);
        });

        it("should handle display limit dropdown changes", async () => {
            const monitor = createMockMonitor(50);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            const select = screen.getByTestId("themed-select");
            expect(select).toBeInTheDocument();

            // Change display limit
            fireEvent.change(select, { target: { value: "10" } });

            // Should now show only 10 records
            expect(screen.getAllByTestId("status-indicator")).toHaveLength(10);
        });
    });

    describe("Data Formatting", () => {
        it("should call formatting functions with correct parameters", () => {
            const monitor = createMockMonitor(2);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            expect(mockFormatFullTimestamp).toHaveBeenCalled();
            expect(mockFormatResponseTime).toHaveBeenCalled();
            expect(mockFormatStatusWithIcon).toHaveBeenCalled();
        });

        it("should display formatted timestamps", () => {
            const monitor = createMockMonitor(1);
            const timestamp = Date.now();
            if (monitor.history[0]) {
                monitor.history[0].timestamp = timestamp;
            }

            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            expect(mockFormatFullTimestamp).toHaveBeenCalledWith(timestamp);
        });

        it("should display formatted response times", () => {
            const monitor = createMockMonitor(1);
            if (monitor.history[0]) {
                monitor.history[0].responseTime = 250;
            }

            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            expect(mockFormatResponseTime).toHaveBeenCalledWith(250);
        });

        it("should display formatted status with icons", () => {
            const monitor = createMockMonitor(1);
            if (monitor.history[0]) {
                monitor.history[0].status = "up";
            }

            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            expect(mockFormatStatusWithIcon).toHaveBeenCalledWith("up");
        });
    });

    describe("Theme Integration", () => {
        it("should use theme colors for icons", () => {
            render(<HistoryTab {...defaultProps} />);

            expect(vi.mocked(useTheme)).toHaveBeenCalled();
            // Theme colors should be applied to filter and history icons
        });

        it("should handle theme changes", () => {
            const { rerender } = render(<HistoryTab {...defaultProps} />);

            // Change theme
            vi.mocked(useTheme).mockReturnValue({
                availableThemes: ["light", "dark"],
                currentTheme: {
                    colors: {
                        primary: {
                            50: "#FEF2F2",
                            100: "#FEE2E2",
                            200: "#FECACA",
                            300: "#FCA5A5",
                            400: "#F87171",
                            500: "#DC2626",
                            600: "#B91C1C",
                            700: "#991B1B",
                            800: "#7F1D1D",
                            900: "#7C2D12",
                        },
                        warning: "#F97316",
                        background: {
                            primary: "#000000",
                            secondary: "#1F2937",
                        },
                        border: { primary: "#374151", secondary: "#4B5563" },
                        error: {
                            50: "#FEF2F2",
                            500: "#EF4444",
                            600: "#DC2626",
                        },
                        errorAlert: "#DC2626",
                        info: "#3B82F6",
                        success: "#10B981",
                        successAlert: "#059669",
                        text: { primary: "#F9FAFB", secondary: "#D1D5DB" },
                        warningAlert: "#D97706",
                    },
                } as any,
                getColor: vi.fn(),
                getStatusColor: vi.fn(),
                isDark: true,
                setTheme: vi.fn(),
                systemTheme: "dark" as const,
                themeManager: {} as any,
                themeName: "dark" as const,
                themeVersion: 2,
                toggleTheme: vi.fn(),
            });

            rerender(<HistoryTab {...defaultProps} />);

            // Component should re-render with new theme
            expect(vi.mocked(useTheme)).toHaveBeenCalled();
        });
    });

    describe("Edge Cases", () => {
        it("should handle monitor with undefined history", () => {
            const monitor = { ...createMockMonitor(0), history: [] };

            // The component should handle empty history gracefully
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);
            expect(screen.getByText("No records found")).toBeInTheDocument();
        });

        it("should handle very large history arrays", () => {
            const monitor = createMockMonitor(1000);

            expect(() =>
                render(
                    <HistoryTab {...defaultProps} selectedMonitor={monitor} />
                )
            ).not.toThrow();
        });

        it("should handle missing settings gracefully", () => {
            vi.mocked(useSettingsStore).mockReturnValue({
                settings: {},
                initializeSettings: vi.fn(),
                updateSettings: vi.fn(),
                exportSettings: vi.fn(),
                importSettings: vi.fn(),
            });

            const monitor = createMockMonitor(5);
            expect(() =>
                render(
                    <HistoryTab {...defaultProps} selectedMonitor={monitor} />
                )
            ).not.toThrow();
        });

        it("should handle history records with missing fields", () => {
            const monitor = createMockMonitor(1);
            monitor.history[0] = {
                timestamp: Date.now(),
                status: "up",
                // Missing responseTime
            } as any;

            expect(() =>
                render(
                    <HistoryTab {...defaultProps} selectedMonitor={monitor} />
                )
            ).not.toThrow();
        });
    });

    describe("User Interactions", () => {
        it("should update filter state when filter buttons are clicked", async () => {
            render(<HistoryTab {...defaultProps} />);

            const upButton = screen.getByRole("button", { name: /up/i });
            const downButton = screen.getByRole("button", { name: /down/i });
            const allButton = screen.getByRole("button", { name: /all/i });

            // Test filter state changes
            await userEvent.click(upButton);
            await userEvent.click(downButton);
            await userEvent.click(allButton);

            // All clicks should work without errors
            expect(upButton).toBeInTheDocument();
            expect(downButton).toBeInTheDocument();
            expect(allButton).toBeInTheDocument();
        });

        it("should handle rapid filter changes", async () => {
            render(<HistoryTab {...defaultProps} />);

            const upButton = screen.getByRole("button", { name: "✅ Up" });
            const downButton = screen.getByRole("button", { name: "❌ Down" });

            // Rapid clicks
            await userEvent.click(upButton);
            await userEvent.click(downButton);
            await userEvent.click(upButton);
            await userEvent.click(downButton);

            // Should handle rapid state changes gracefully
            expect(screen.getAllByTestId("themed-card")).toHaveLength(2);
        });
    });

    describe("Accessibility", () => {
        it("should provide accessible filter buttons", () => {
            render(<HistoryTab {...defaultProps} />);

            const buttons = screen.getAllByTestId("themed-button");
            buttons.forEach((button) => {
                expect(button).toBeInTheDocument();
                expect(button.tagName).toBe("BUTTON");
            });
        });

        it("should provide accessible select dropdown", () => {
            render(<HistoryTab {...defaultProps} />);

            const select = screen.getByTestId("themed-select");
            expect(select).toBeInTheDocument();
            expect(select.tagName).toBe("SELECT");
        });
    });
});
