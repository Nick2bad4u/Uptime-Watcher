/**
 * Comprehensive test for OverviewTab component to improve coverage.
 * Tests various props combinations, edge cases, and user interactions.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { OverviewTab } from "../../../../components/SiteDetails/tabs/OverviewTab";
import type { Monitor } from "../../../../../shared/types";

// Mock all external dependencies
vi.mock("../../../../constants", () => ({
    ARIA_LABEL: "aria-label",
    CHECK_INTERVALS: [30_000, 60_000, 300_000, 600_000],
    TIMEOUT_CONSTRAINTS: { MIN: 1000, MAX: 30_000 },
    TRANSITION_ALL: "all 0.2s ease-in-out",
}));

vi.mock("../../../../services/logger", () => ({
    default: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        user: {
            action: vi.fn(),
        },
    },
}));

vi.mock("../../../../theme/useTheme", () => ({
    useTheme: vi.fn(() => ({
        availableThemes: ["light", "dark"],
        currentTheme: {
            colors: {
                primary: { 500: "#3B82F6" },
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
                sm: "0 1px 2px rgba(0,0,0,0.05)",
                md: "0 4px 6px rgba(0,0,0,0.1)",
                lg: "0 10px 15px rgba(0,0,0,0.1)",
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
        },
        getColor: vi.fn(),
        getStatusColor: vi.fn(),
        isDark: false,
        setTheme: vi.fn(),
        systemTheme: "light",
        themeManager: {},
        themeName: "light",
        themeVersion: 1,
        toggleTheme: vi.fn(),
    })),
    useThemeClasses: vi.fn(() => ({
        getBackgroundClass: vi.fn(),
        getBorderClass: vi.fn(),
        getTextClass: vi.fn(),
    })),
    useAvailabilityColors: vi.fn(() => ({
        excellent: "#10B981",
        good: "#6EE7B7",
        fair: "#FCD34D",
        poor: "#F87171",
        getAvailabilityColor: vi.fn((value: number) => {
            if (value >= 99) return "#10B981";
            if (value >= 95) return "#6EE7B7";
            if (value >= 90) return "#FCD34D";
            return "#F87171";
        }),
        getAvailabilityVariant: vi.fn((value: number) => {
            if (value >= 99) return "success";
            if (value >= 95) return "success";
            if (value >= 90) return "warning";
            return "danger";
        }),
    })),
}));

vi.mock("../../../../theme/components", () => ({
    StatusIndicator: ({ children, ...props }: any) => (
        <div data-testid="status-indicator" {...props}>
            {children}
        </div>
    ),
    ThemedBadge: ({ children, ...props }: any) => (
        <span data-testid="themed-badge" {...props}>
            {children}
        </span>
    ),
    ThemedButton: ({ children, ...props }: any) => (
        <button data-testid="themed-button" {...props}>
            {children}
        </button>
    ),
    ThemedCard: ({ children, ...props }: any) => (
        <div data-testid="themed-card" {...props}>
            {children}
        </div>
    ),
    ThemedInput: (props: any) => (
        <input data-testid="themed-input" {...props} />
    ),
    ThemedProgress: (props: any) => (
        <div data-testid="themed-progress" {...props} />
    ),
    ThemedSelect: ({ children, ...props }: any) => (
        <select data-testid="themed-select" {...props}>
            {children}
        </select>
    ),
    ThemedText: ({ children, ...props }: any) => (
        <span data-testid="themed-text" {...props}>
            {children}
        </span>
    ),
}));

vi.mock("../../../../utils/monitoring/dataValidation", () => ({
    parseUptimeValue: vi.fn((value: string) => Number.parseFloat(value)),
}));

vi.mock("../../../../utils/time", () => ({
    getIntervalLabel: vi.fn((interval: number) => {
        if (interval < 60_000) return `${interval / 1000}s`;
        return `${interval / 60_000}m`;
    }),
}));

describe("OverviewTab", () => {
    const mockFormatResponseTime = vi.fn((time: number) => `${time}ms`);
    const mockHandleIntervalChange = vi.fn();
    const mockHandleRemoveMonitor = vi.fn();
    const mockHandleSaveInterval = vi.fn();
    const mockHandleSaveTimeout = vi.fn();
    const mockHandleTimeoutChange = vi.fn();
    const mockOnCheckNow = vi.fn();

    const createMockMonitor = (): Monitor => ({
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
        history: [],
    });

    const baseProps = {
        avgResponseTime: 150,
        fastestResponse: 100,
        formatResponseTime: mockFormatResponseTime,
        handleIntervalChange: mockHandleIntervalChange,
        handleRemoveMonitor: mockHandleRemoveMonitor,
        handleSaveInterval: mockHandleSaveInterval,
        handleSaveTimeout: mockHandleSaveTimeout,
        handleTimeoutChange: mockHandleTimeoutChange,
        intervalChanged: false,
        isLoading: false,
        localCheckInterval: 60_000,
        localTimeout: 5000,
        onCheckNow: mockOnCheckNow,
        selectedMonitor: createMockMonitor(),
        slowestResponse: 200,
        timeoutChanged: false,
        totalChecks: 100,
        uptime: "99.5",
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Component Rendering", () => {
        it("should render overview tab with all statistics", () => {
            render(<OverviewTab {...baseProps} />);

            // Check basic elements are present
            expect(
                document.querySelector(".themed-status-indicator")
            ).toBeInTheDocument();
            expect(
                document.querySelectorAll(".themed-card").length
            ).toBeGreaterThanOrEqual(2); // Should have multiple cards
            expect(
                document.querySelector(".themed-progress")
            ).toBeInTheDocument();
        });

        it("should display uptime percentage correctly", () => {
            render(<OverviewTab {...baseProps} />);

            // Check if uptime is displayed
            expect(screen.getAllByText("99.5%")[0]).toBeInTheDocument();
        });

        it("should show response time statistics", () => {
            render(<OverviewTab {...baseProps} />);

            // Check if response times are formatted correctly
            expect(mockFormatResponseTime).toHaveBeenCalledWith(150); // avg
            expect(mockFormatResponseTime).toHaveBeenCalledWith(100); // fastest
            expect(mockFormatResponseTime).toHaveBeenCalledWith(200); // slowest
        });

        it("should display total checks count", () => {
            render(<OverviewTab {...baseProps} />);

            // Should show total checks
            expect(screen.getByText("100")).toBeInTheDocument();
        });

        it("should render control buttons", () => {
            render(<OverviewTab {...baseProps} />);

            const buttons = document.querySelectorAll(".themed-button");
            expect(buttons.length).toBeGreaterThan(0);
        });
    });

    describe("User Interactions", () => {
        it("should handle check now button click", () => {
            render(<OverviewTab {...baseProps} />);

            const checkNowButton = screen.getByText("Check Now");
            fireEvent.click(checkNowButton);

            expect(mockOnCheckNow).toHaveBeenCalledTimes(1);
        });

        it("should handle remove monitor button click", async () => {
            render(<OverviewTab {...baseProps} />);

            const removeButton = screen.getByText("Remove Monitor");
            fireEvent.click(removeButton);

            await waitFor(() => {
                expect(mockHandleRemoveMonitor).toHaveBeenCalledTimes(1);
            });
        });

        it("should handle interval change", () => {
            render(<OverviewTab {...baseProps} />);

            const intervalSelect = document.querySelector(".themed-select");
            expect(intervalSelect).toBeInTheDocument();
            fireEvent.change(intervalSelect!, { target: { value: "300000" } });

            expect(mockHandleIntervalChange).toHaveBeenCalledTimes(1);
        });

        it("should handle timeout change", () => {
            render(<OverviewTab {...baseProps} />);

            const timeoutInput = document.querySelector(".themed-input");
            expect(timeoutInput).toBeInTheDocument();
            fireEvent.change(timeoutInput!, { target: { value: "10000" } });

            expect(mockHandleTimeoutChange).toHaveBeenCalledTimes(1);
        });

        it("should enable save interval button when interval changed", () => {
            render(<OverviewTab {...baseProps} intervalChanged={true} />);

            const saveButton = screen.getByText("Save");
            expect(saveButton).toBeInTheDocument();

            fireEvent.click(saveButton);
            expect(mockHandleSaveInterval).toHaveBeenCalledTimes(1);
        });

        it("should enable save timeout button when timeout changed", () => {
            render(<OverviewTab {...baseProps} timeoutChanged={true} />);

            const saveButton = screen.getByText("Save");
            expect(saveButton).toBeInTheDocument();

            fireEvent.click(saveButton);
            expect(mockHandleSaveTimeout).toHaveBeenCalledTimes(1);
        });
    });

    describe("Loading States", () => {
        it("should show loading state when isLoading is true", () => {
            render(<OverviewTab {...baseProps} isLoading={true} />);

            // Check if buttons have proper disabled attribute
            const checkNowButton = screen.getByLabelText("Check Now");
            expect(checkNowButton).toBeDisabled();
        });

        it("should disable buttons during loading", () => {
            render(<OverviewTab {...baseProps} isLoading={true} />);

            const checkNowButton = screen.getByLabelText("Check Now");
            expect(checkNowButton).toBeDisabled();
        });
    });

    describe("Different Monitor Types", () => {
        it("should handle port monitor", () => {
            const portMonitor = {
                ...createMockMonitor(),
                type: "port" as const,
                url: "127.0.0.1:8080",
            };

            render(
                <OverviewTab {...baseProps} selectedMonitor={portMonitor} />
            );

            expect(
                document.querySelector(".themed-status-indicator")
            ).toBeInTheDocument();
        });

        it("should handle down status monitor", () => {
            const downMonitor = {
                ...createMockMonitor(),
                status: "down" as const,
            };

            render(
                <OverviewTab {...baseProps} selectedMonitor={downMonitor} />
            );

            expect(
                document.querySelector(".themed-status-indicator")
            ).toBeInTheDocument();
        });

        it("should handle monitor without last check", () => {
            const { lastChecked, ...monitorWithoutLastCheck } =
                createMockMonitor();

            render(
                <OverviewTab
                    {...baseProps}
                    selectedMonitor={monitorWithoutLastCheck}
                />
            );

            expect(
                document.querySelector(".themed-status-indicator")
            ).toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("should handle zero response times", () => {
            render(
                <OverviewTab
                    {...baseProps}
                    avgResponseTime={0}
                    fastestResponse={0}
                    slowestResponse={0}
                />
            );

            expect(mockFormatResponseTime).toHaveBeenCalledWith(0);
        });

        it("should handle very high response times", () => {
            render(
                <OverviewTab
                    {...baseProps}
                    avgResponseTime={30_000}
                    fastestResponse={25_000}
                    slowestResponse={35_000}
                />
            );

            expect(mockFormatResponseTime).toHaveBeenCalledWith(30_000);
            expect(mockFormatResponseTime).toHaveBeenCalledWith(25_000);
            expect(mockFormatResponseTime).toHaveBeenCalledWith(35_000);
        });

        it("should handle zero total checks", () => {
            render(<OverviewTab {...baseProps} totalChecks={0} />);

            expect(screen.getByText("0")).toBeInTheDocument();
        });

        it("should handle 100% uptime", () => {
            render(<OverviewTab {...baseProps} uptime="100.0" />);

            expect(screen.getAllByText("100.0%")[0]).toBeInTheDocument();
        });

        it("should handle 0% uptime", () => {
            render(<OverviewTab {...baseProps} uptime="0.0" />);

            expect(screen.getAllByText("0.0%")[0]).toBeInTheDocument();
        });

        it("should handle extreme interval values", () => {
            render(<OverviewTab {...baseProps} localCheckInterval={30_000} />);

            expect(
                document.querySelector(".themed-select")
            ).toBeInTheDocument();
        });

        it("should handle extreme timeout values", () => {
            render(<OverviewTab {...baseProps} localTimeout={30_000} />);

            expect(document.querySelector(".themed-input")).toBeInTheDocument();
        });
    });

    describe("Accessibility", () => {
        it("should have proper labels and structure", () => {
            render(<OverviewTab {...baseProps} />);

            // Check that buttons have text content
            const checkNowButton = screen.getByText("Check Now");
            expect(checkNowButton).toBeInTheDocument();

            const removeButton = screen.getByText("Remove Monitor");
            expect(removeButton).toBeInTheDocument();
        });
    });
});
