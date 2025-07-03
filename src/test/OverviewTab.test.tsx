/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { OverviewTab } from "../components/SiteDetails/tabs/OverviewTab";
import { Monitor } from "../types";
import logger from "../services/logger";

// Mock the theme hooks
const mockUseTheme = {
    currentTheme: {
        colors: {
            primary: { 500: "#3b82f6" },
            success: "#10b981",
            error: "#ef4444",
            warning: "#f59e0b",
            text: {
                primary: "#ffffff",
                secondary: "#a0a0a0",
            },
            surface: {
                elevated: "#2a2a2a",
            },
            border: {
                primary: "#404040",
            },
        },
    },
};

const mockUseAvailabilityColors = {
    getAvailabilityColor: vi.fn().mockReturnValue("#10b981"),
    getAvailabilityVariant: vi.fn().mockReturnValue("success"),
};

vi.mock("../theme/useTheme", () => ({
    useTheme: () => mockUseTheme,
    useAvailabilityColors: () => mockUseAvailabilityColors,
}));

// Mock themed components
vi.mock("../theme/components", () => ({
    ThemedText: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
        <span {...props}>{children}</span>
    ),
    ThemedButton: ({
        children,
        onClick,
        ...props
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        [key: string]: unknown;
    }) => (
        <button onClick={onClick} {...props}>
            {children}
        </button>
    ),
    StatusIndicator: ({ status, ...props }: { status: string; [key: string]: unknown }) => {
        // Only allow DOM-safe props to be spread!
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { showText, $iconColor, iconColor, size, ...domProps } = props;
        return (
            <div data-testid="status-indicator" {...domProps}>
                Status: {status}
            </div>
        );
    },
    ThemedCard: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
        // Remove non-DOM props before spreading
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { icon, iconColor, hoverable, showLabel, title, ...domProps } = props;
        return <div {...domProps}>{children}</div>;
    },
    ThemedBadge: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
        // Remove non-DOM props before spreading
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { variant, icon, iconColor, size, ...domProps } = props;
        return (
            <span data-testid="themed-badge" data-variant={variant} {...domProps}>
                {children}
            </span>
        );
    },
    ThemedProgress: ({ value, variant, ...props }: { value: number; variant: string; [key: string]: unknown }) => {
        // Remove non-DOM props before spreading
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { showLabel, ...domProps } = props;
        return (
            <div data-testid="themed-progress" data-value={value} data-variant={variant} {...domProps}>
                Progress: {value}%
            </div>
        );
    },
}));

// Mock logger
vi.mock("../services/logger", () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        user: {
            action: vi.fn(),
        },
    },
}));

describe("OverviewTab", () => {
    const mockMonitor: Monitor = {
        id: "monitor-1",
        type: "http",
        status: "up",
        url: "https://example.com",
        responseTime: 250,
        lastChecked: new Date(),
        history: [],
        monitoring: true,
        checkInterval: 60000,
        timeout: 30000,
        retryAttempts: 3,
    };

    const defaultProps = {
        avgResponseTime: 250,
        fastestResponse: 150,
        formatResponseTime: vi.fn().mockImplementation((time: number) => `${time}ms`),
        handleRemoveSite: vi.fn().mockResolvedValue(undefined),
        isLoading: false,
        selectedMonitor: mockMonitor,
        slowestResponse: 500,
        totalChecks: 100,
        uptime: "99.5",
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAvailabilityColors.getAvailabilityColor.mockReturnValue("#10b981");
        mockUseAvailabilityColors.getAvailabilityVariant.mockReturnValue("success");
    });

    describe("Basic Rendering", () => {
        it("should render overview tab with metrics", () => {
            render(<OverviewTab {...defaultProps} />);

            expect(screen.getByText("99.5%")).toBeInTheDocument();
            expect(screen.getByText("250ms")).toBeInTheDocument();
            expect(screen.getByText("150ms")).toBeInTheDocument();
            expect(screen.getByText("500ms")).toBeInTheDocument();
            expect(screen.getByText("100")).toBeInTheDocument();
        });

        it("should render status indicator", () => {
            render(<OverviewTab {...defaultProps} />);

            const statusIndicator = screen.getByTestId("status-indicator");
            expect(statusIndicator).toBeInTheDocument();
            expect(statusIndicator).toHaveTextContent("Status: up");
        });

        it("should render progress bar with correct value", () => {
            render(<OverviewTab {...defaultProps} />);

            const progress = screen.getByTestId("themed-progress");
            expect(progress).toBeInTheDocument();
            expect(progress).toHaveAttribute("data-value", "99.5");
        });
    });

    describe("Availability Colors and Variants", () => {
        it("should call availability color functions with uptime value", () => {
            render(<OverviewTab {...defaultProps} />);

            expect(mockUseAvailabilityColors.getAvailabilityColor).toHaveBeenCalledWith(99.5);
            expect(mockUseAvailabilityColors.getAvailabilityVariant).toHaveBeenCalledWith(99.5);
        });

        it("should map danger variant to error for badge", () => {
            mockUseAvailabilityColors.getAvailabilityVariant.mockReturnValue("danger");
            render(<OverviewTab {...defaultProps} />);

            const progress = screen.getByTestId("themed-progress");
            expect(progress).toHaveAttribute("data-variant", "error");
        });

        it("should preserve non-danger variants", () => {
            mockUseAvailabilityColors.getAvailabilityVariant.mockReturnValue("warning");
            render(<OverviewTab {...defaultProps} />);

            const progress = screen.getByTestId("themed-progress");
            expect(progress).toHaveAttribute("data-variant", "warning");
        });
    });

    describe("Response Time Formatting", () => {
        it("should format response times using provided formatter", () => {
            const customFormatter = vi.fn().mockReturnValue("custom format");
            render(<OverviewTab {...defaultProps} formatResponseTime={customFormatter} />);

            expect(customFormatter).toHaveBeenCalledWith(250);
            expect(customFormatter).toHaveBeenCalledWith(150);
            expect(customFormatter).toHaveBeenCalledWith(500);
            expect(screen.getAllByText("custom format")).toHaveLength(3);
        });
    });

    describe("Remove Site Functionality", () => {
        it("should render remove site button", () => {
            render(<OverviewTab {...defaultProps} />);

            const removeButton = screen.getByRole("button", { name: /remove/i });
            expect(removeButton).toBeInTheDocument();
        });

        it("should call handleRemoveSite when remove button is clicked", async () => {
            const user = userEvent.setup();
            render(<OverviewTab {...defaultProps} />);

            const removeButton = screen.getByRole("button", { name: /remove/i });
            await user.click(removeButton);

            expect(defaultProps.handleRemoveSite).toHaveBeenCalledTimes(1);
        });

        it("should disable remove button when loading", () => {
            render(<OverviewTab {...defaultProps} isLoading={true} />);

            const removeButton = screen.getByRole("button", { name: /remove/i });
            expect(removeButton).toBeDisabled();
        });

        it("should handle remove site logging with undefined URL (line 196 coverage)", async () => {
            const user = userEvent.setup();

            // Create a monitor without a URL to trigger the nullish coalescing on line 196
            const monitorWithoutUrl: Monitor = {
                ...mockMonitor,
                url: undefined, // This should trigger the ?? "unknown" fallback
            };

            const loggerSpy = vi.spyOn(logger.user, "action");

            render(<OverviewTab {...defaultProps} selectedMonitor={monitorWithoutUrl} />);

            const removeButton = screen.getByRole("button", { name: /remove/i });
            await user.click(removeButton);

            // Check that the logger was called with "unknown" when URL is undefined
            expect(loggerSpy).toHaveBeenCalledWith("Site removal button clicked from overview tab", {
                monitorType: monitorWithoutUrl.type,
                siteId: "unknown", // This should be the fallback value
            });

            loggerSpy.mockRestore();
        });

        it("should handle remove site logging with undefined URL", async () => {
            const user = userEvent.setup();

            // Create a monitor with undefined URL to test another undefined case
            const monitorWithNullUrl: Monitor = {
                ...mockMonitor,
                url: undefined, // This should also trigger the ?? "unknown" fallback
            };

            const loggerSpy = vi.spyOn(logger.user, "action");

            render(<OverviewTab {...defaultProps} selectedMonitor={monitorWithNullUrl} />);

            const removeButton = screen.getByRole("button", { name: /remove/i });
            await user.click(removeButton);

            // Check that the logger was called with "unknown" when URL is undefined
            expect(loggerSpy).toHaveBeenCalledWith("Site removal button clicked from overview tab", {
                monitorType: monitorWithNullUrl.type,
                siteId: "unknown", // This should be the fallback value
            });

            loggerSpy.mockRestore();
        });
    });

    describe("Different Monitor Types", () => {
        it("should handle port monitor", () => {
            const portMonitor: Monitor = {
                ...mockMonitor,
                type: "port",
                host: "example.com",
                port: 80,
                url: undefined,
            };

            render(<OverviewTab {...defaultProps} selectedMonitor={portMonitor} />);

            const statusIndicator = screen.getByTestId("status-indicator");
            expect(statusIndicator).toHaveTextContent("Status: up");
        });
    });

    describe("Edge Cases", () => {
        it("should handle zero values", () => {
            render(
                <OverviewTab
                    {...defaultProps}
                    avgResponseTime={0}
                    fastestResponse={0}
                    slowestResponse={0}
                    totalChecks={0}
                    uptime="0"
                />
            );

            expect(screen.getByText("0%")).toBeInTheDocument();
            expect(screen.getByText("0")).toBeInTheDocument();
        });

        it("should handle very high uptime", () => {
            render(<OverviewTab {...defaultProps} uptime="100" />);

            expect(screen.getByText("100%")).toBeInTheDocument();
            expect(mockUseAvailabilityColors.getAvailabilityColor).toHaveBeenCalledWith(100);
        });

        it("should handle low uptime", () => {
            render(<OverviewTab {...defaultProps} uptime="50.5" />);

            expect(screen.getByText("50.5%")).toBeInTheDocument();
            expect(mockUseAvailabilityColors.getAvailabilityColor).toHaveBeenCalledWith(50.5);
        });

        it("should handle very large response times", () => {
            const largeTime = 10000;
            render(
                <OverviewTab
                    {...defaultProps}
                    avgResponseTime={largeTime}
                    fastestResponse={largeTime}
                    slowestResponse={largeTime}
                />
            );

            expect(defaultProps.formatResponseTime).toHaveBeenCalledWith(largeTime);
        });
    });

    describe("Theme Integration", () => {
        it("should use theme colors for icons", () => {
            render(<OverviewTab {...defaultProps} />);

            // Verify that availability colors are retrieved
            expect(mockUseAvailabilityColors.getAvailabilityColor).toHaveBeenCalled();
        });

        it("should work with different theme configurations", () => {
            const customTheme = {
                ...mockUseTheme.currentTheme,
                colors: {
                    ...mockUseTheme.currentTheme.colors,
                    primary: { 500: "#ff0000" },
                },
            };

            vi.mocked(mockUseTheme).currentTheme = customTheme;
            render(<OverviewTab {...defaultProps} />);

            // Component should render without errors with custom theme
            expect(screen.getByText("99.5%")).toBeInTheDocument();
        });
    });
});
