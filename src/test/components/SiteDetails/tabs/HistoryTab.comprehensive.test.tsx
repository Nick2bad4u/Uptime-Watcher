/**
 * Comprehensive test suite for HistoryTab component. Tests filtering,
 * pagination, display limits, and history management.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HistoryTab } from "../../../../components/SiteDetails/tabs/HistoryTab";
import type { HistoryTabProperties } from "../../../../components/SiteDetails/tabs/HistoryTab";
import { useSettingsStore } from "../../../../stores/settings/useSettingsStore";
import { useTheme } from "../../../../theme/useTheme";
import type { Monitor } from "@shared/types";

// Mock dependencies
vi.mock("../../../../stores/settings/useSettingsStore");
vi.mock("../../../../services/logger");
vi.mock("../../../../theme/useTheme", () => ({
    useTheme: vi.fn(),
    useThemeClasses: vi.fn(() => ({
        getBackgroundClass: vi.fn((variant: string) => ({
            backgroundColor: `var(--color-background-${variant})`,
        })),
        getTextClass: vi.fn((variant: string) => ({
            color: `var(--color-text-${variant})`,
        })),
        getBorderClass: vi.fn((variant: string) => ({
            borderColor: `var(--color-border-${variant})`,
        })),
    })),
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

// Get mocked functions
const mockUseSettingsStore = vi.mocked(useSettingsStore);
const mockUseTheme = vi.mocked(useTheme);

describe(HistoryTab, () => {
    const mockFormatFullTimestamp = vi.fn((timestamp: number) =>
        new Date(timestamp).toISOString()
    );
    const mockFormatResponseTime = vi.fn((time: number) => `${time}ms`);
    const createMockMonitor = (historyLength: number = 5): Monitor => ({
        id: "test-monitor",
        type: "http",
        url: "https://example.com",
        monitoring: true,
        checkInterval: 60_000,
        timeout: 5000,
        retryAttempts: 3,
        status: "up",
        lastChecked: new Date(),
        responseTime: 150,
        history: Array.from({ length: historyLength }, (_, i) => ({
            timestamp: Date.now() - i * 60_000,
            status: i % 2 === 0 ? "up" : "down",
            responseTime: 100 + i * 10,
        })),
    });

    const defaultProps: HistoryTabProperties = {
        formatFullTimestamp: mockFormatFullTimestamp,
        formatResponseTime: mockFormatResponseTime,
        selectedMonitor: createMockMonitor(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseSettingsStore.mockReturnValue({
            settings: { historyLimit: 25 },
            initializeSettings: vi.fn(),
            updateSettings: vi.fn(),
            exportSettings: vi.fn(),
            importSettings: vi.fn(),
        });

        mockUseTheme.mockReturnValue({
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
                spacing: {
                    xs: "4px",
                    sm: "8px",
                    md: "16px",
                    lg: "24px",
                    xl: "32px",
                },
                borderRadius: {
                    sm: "4px",
                    md: "8px",
                    lg: "12px",
                    xl: "16px",
                },
                shadows: {
                    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                },
                typography: {
                    fontFamily: {
                        sans: ["Inter", "sans-serif"],
                        mono: ["Fira Code", "monospace"],
                    },
                    fontSize: {
                        xs: "12px",
                        sm: "14px",
                        md: "16px",
                        lg: "18px",
                        xl: "20px",
                    },
                    fontWeight: {
                        normal: "400",
                        medium: "500",
                        semibold: "600",
                        bold: "700",
                    },
                    lineHeight: {
                        normal: "1.5",
                        relaxed: "1.75",
                        tight: "1.25",
                    },
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
        it("should render history tab with all main sections", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<HistoryTab {...defaultProps} />);

            expect(document.querySelectorAll(".themed-card")).toHaveLength(2); // History Filters and Check History cards
            expect(screen.getByTestId("history-tab")).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "All" })
            ).toBeInTheDocument();
        });

        it("should display filter buttons for all, up, and down", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<HistoryTab {...defaultProps} />);

            const filterLabels = [
                "All",
                "Up",
                "Down",
            ];
            const filterButtons = filterLabels.map((label) =>
                screen.getByRole("button", { name: label })
            );

            expect(filterButtons).toHaveLength(filterLabels.length);
        });

        it("should display history records when available", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const monitor = createMockMonitor(3);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            // Should show history records
            expect(
                document.querySelectorAll(".themed-status-indicator")
            ).toHaveLength(3);
        });

        it("should display empty state when no history available", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const monitor = createMockMonitor(0);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            expect(screen.getByText("No records found")).toBeInTheDocument();
        });
    });

    describe("History Filtering", () => {
        it("should filter history by 'all' status by default", () => {
            const monitor = createMockMonitor(4);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            // Should show all 4 history records
            expect(
                document.querySelectorAll(".themed-status-indicator")
            ).toHaveLength(4);
        });

        it("should filter history to show only 'up' status", async () => {
            const monitor = createMockMonitor(4);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            const upButton = screen.getByRole("button", { name: /up/i });
            await userEvent.click(upButton);

            // Should show only up status records (every even index)
            expect(
                document.querySelectorAll(".themed-status-indicator")
            ).toHaveLength(2);
        });

        it("should filter history to show only 'down' status", async () => {
            const monitor = createMockMonitor(4);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            // Get the filter button specifically (not any text containing "down")
            const downButton = screen.getByRole("button", {
                name: /^down$/i,
            });
            await userEvent.click(downButton);

            // Should show only down status records (every odd index)
            expect(
                document.querySelectorAll(".themed-status-indicator")
            ).toHaveLength(2);
        });

        it("should switch back to all records when 'all' filter is selected", async () => {
            const monitor = createMockMonitor(4);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            // First filter to up
            const upButton = screen.getByRole("button", { name: /up/i });
            await userEvent.click(upButton);
            expect(
                document.querySelectorAll(".themed-status-indicator")
            ).toHaveLength(2);

            // Then switch back to all
            const allButton = screen.getByRole("button", { name: /all/i });
            await userEvent.click(allButton);
            expect(
                document.querySelectorAll(".themed-status-indicator")
            ).toHaveLength(4);
        });
    });

    describe("Display Limits and Pagination", () => {
        it("should respect settings history limit", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Configuration", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Configuration", "type");

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
            expect(
                document.querySelectorAll(".themed-status-indicator")
            ).toHaveLength(10);
        });

        it("should show all available records when history is less than limit", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Configuration", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Configuration", "type");

            vi.mocked(useSettingsStore).mockReturnValue({
                settings: { historyLimit: 100 },
                initializeSettings: vi.fn(),
                updateSettings: vi.fn(),
                exportSettings: vi.fn(),
                importSettings: vi.fn(),
            });

            const monitor = createMockMonitor(5);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            expect(
                document.querySelectorAll(".themed-status-indicator")
            ).toHaveLength(5);
        });

        it("should handle display limit dropdown changes", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Configuration", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Configuration", "type");

            const monitor = createMockMonitor(50);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            const select = document.querySelector(".themed-select");
            expect(select).toBeInTheDocument();

            // Change display limit
            fireEvent.change(select!, { target: { value: "10" } });

            // Should now show only 10 records
            expect(
                document.querySelectorAll(".themed-status-indicator")
            ).toHaveLength(10);
        });
    });

    describe("Data Formatting", () => {
        it("should call formatting functions with correct parameters", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const monitor = createMockMonitor(2);
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            expect(mockFormatFullTimestamp).toHaveBeenCalled();
            expect(mockFormatResponseTime).toHaveBeenCalled();
        });

        it("should display formatted timestamps", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const monitor = createMockMonitor(1);
            const timestamp = Date.now();
            if (monitor.history[0]) {
                monitor.history[0].timestamp = timestamp;
            }

            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            expect(mockFormatFullTimestamp).toHaveBeenCalledWith(timestamp);
        });

        it("should display formatted response times", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const monitor = createMockMonitor(1);
            if (monitor.history[0]) {
                monitor.history[0].responseTime = 250;
            }

            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            expect(mockFormatResponseTime).toHaveBeenCalledWith(250);
        });

        it("should display formatted status with icons", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const monitor = createMockMonitor(1);
            if (monitor.history[0]) {
                monitor.history[0].status = "up";
            }

            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);

            const statusLabel = screen.getByText("Up", {
                selector: ".history-tab__row-status span",
            });
            expect(statusLabel).toBeInTheDocument();
            const statusIcon = statusLabel
                .closest(".history-tab__row-status")
                ?.querySelector(
                    ".history-tab__row-status-icon"
                ) as SVGElement | null;
            expect(statusIcon).not.toBeNull();
        });
    });

    describe("Theme Integration", () => {
        it("should use theme colors for icons", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<HistoryTab {...defaultProps} />);

            expect(vi.mocked(useTheme)).toHaveBeenCalled();
            // Theme colors should be applied to filter and history icons
        });

        it("should handle theme changes", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

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
                    spacing: {
                        xs: "4px",
                        sm: "8px",
                        md: "16px",
                        lg: "24px",
                        xl: "32px",
                    },
                    borderRadius: {
                        sm: "4px",
                        md: "8px",
                        lg: "12px",
                        xl: "16px",
                    },
                    shadows: {
                        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                    },
                    typography: {
                        fontFamily: {
                            sans: ["Inter", "sans-serif"],
                            mono: ["Fira Code", "monospace"],
                        },
                        fontSize: {
                            xs: "12px",
                            sm: "14px",
                            md: "16px",
                            lg: "18px",
                            xl: "20px",
                        },
                        fontWeight: {
                            normal: "400",
                            medium: "500",
                            semibold: "600",
                            bold: "700",
                        },
                        lineHeight: {
                            normal: "1.5",
                            relaxed: "1.75",
                            tight: "1.25",
                        },
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
        it("should handle monitor with undefined history", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const monitor = { ...createMockMonitor(0), history: [] };

            // The component should handle empty history gracefully
            render(<HistoryTab {...defaultProps} selectedMonitor={monitor} />);
            expect(screen.getByText("No records found")).toBeInTheDocument();
        });

        it("should handle very large history arrays", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const monitor = createMockMonitor(1000);

            expect(() =>
                render(
                    <HistoryTab {...defaultProps} selectedMonitor={monitor} />
                )
            ).not.toThrowError();
        });

        it("should handle missing settings gracefully", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

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
            ).not.toThrowError();
        });

        it("should handle history records with missing fields", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

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
            ).not.toThrowError();
        });
    });

    describe("User Interactions", () => {
        it("should update filter state when filter buttons are clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Update", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Update", "type");

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

        it("should handle rapid filter changes", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<HistoryTab {...defaultProps} />);

            const upButton = screen.getByRole("button", { name: /^up$/i });
            const downButton = screen.getByRole("button", { name: /^down$/i });

            // Rapid clicks
            await userEvent.click(upButton);
            await userEvent.click(downButton);
            await userEvent.click(upButton);
            await userEvent.click(downButton);

            // Should handle rapid state changes gracefully
            expect(document.querySelectorAll(".themed-card")).toHaveLength(2);
        });
    });

    describe("Accessibility", () => {
        it("should provide accessible filter buttons", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<HistoryTab {...defaultProps} />);

            const buttons = document.querySelectorAll(".themed-button");
            for (const button of Array.from(buttons)) {
                expect(button).toBeInTheDocument();
                expect(button.tagName).toBe("BUTTON");
            }
        });

        it("should provide accessible select dropdown", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<HistoryTab {...defaultProps} />);

            const select = document.querySelector(".themed-select");
            expect(select).toBeInTheDocument();
            expect(select!.tagName).toBe("SELECT");
        });
    });
});
