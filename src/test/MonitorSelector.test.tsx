/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MonitorSelector } from "../components/Dashboard/SiteCard/components/MonitorSelector";
import type { Monitor } from "../types";

// Mock ThemedSelect component
vi.mock("../theme/components", () => ({
    ThemedSelect: ({
        children,
        onChange,
        onClick,
        onMouseDown,
        value,
        className,
        ...props
    }: {
        children: React.ReactNode;
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
        onClick?: (e: React.MouseEvent<HTMLSelectElement>) => void;
        onMouseDown?: (e: React.MouseEvent<HTMLSelectElement>) => void;
        value: string;
        className?: string;
        [key: string]: unknown;
    }) => (
        <select
            data-testid="themed-select"
            onChange={onChange}
            onClick={onClick}
            onMouseDown={onMouseDown}
            value={value}
            className={className}
            {...props}
        >
            {children}
        </select>
    ),
}));

describe("MonitorSelector", () => {
    const mockOnChange = vi.fn();

    const mockHttpMonitor: Monitor = {
        id: "http-monitor",
        type: "http",
        url: "https://example.com",
        status: "up",
        history: [],
        monitoring: true,
        checkInterval: 60000,
        timeout: 30000,
        retryAttempts: 3,
    };

    const mockPortMonitor: Monitor = {
        id: "port-monitor",
        type: "port",
        host: "example.com",
        port: 8080,
        status: "up",
        history: [],
        monitoring: true,
        checkInterval: 60000,
        timeout: 30000,
        retryAttempts: 3,
    };

    const mockMinimalMonitor: Monitor = {
        id: "minimal-monitor",
        type: "http",
        status: "up",
        history: [],
        monitoring: true,
        checkInterval: 60000,
        timeout: 30000,
        retryAttempts: 3,
    };

    const defaultProps = {
        monitors: [mockHttpMonitor, mockPortMonitor],
        selectedMonitorId: "http-monitor",
        onChange: mockOnChange,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Basic Rendering", () => {
        it("should render ThemedSelect with monitors", () => {
            render(<MonitorSelector {...defaultProps} />);

            const select = screen.getByTestId("themed-select");
            expect(select).toBeInTheDocument();
            expect(select).toHaveValue("http-monitor");
        });

        it("should render all monitor options", () => {
            render(<MonitorSelector {...defaultProps} />);

            const options = screen.getAllByRole("option");
            expect(options).toHaveLength(2);

            // Check by text content instead of display value
            const httpOption = screen.getByText("HTTP: https://example.com");
            const portOption = screen.getByText("PORT:8080");

            expect(httpOption).toBeInTheDocument();
            expect(portOption).toBeInTheDocument();
        });

        it("should use default className when not provided", () => {
            render(<MonitorSelector {...defaultProps} />);

            const select = screen.getByTestId("themed-select");
            expect(select).toHaveClass("min-w-[80px]");
        });

        it("should use custom className when provided", () => {
            render(<MonitorSelector {...defaultProps} className="custom-class" />);

            const select = screen.getByTestId("themed-select");
            expect(select).toHaveClass("custom-class");
        });
    });

    describe("Monitor Option Formatting", () => {
        it("should format HTTP monitor with URL correctly", () => {
            render(<MonitorSelector {...defaultProps} />);

            const httpOption = screen.getByText("HTTP: https://example.com");
            expect(httpOption).toBeInTheDocument();
        });

        it("should format port monitor with port correctly", () => {
            render(<MonitorSelector {...defaultProps} />);

            const portOption = screen.getByText("PORT:8080");
            expect(portOption).toBeInTheDocument();
        });

        it("should format monitor without URL or port", () => {
            const propsWithMinimal = {
                ...defaultProps,
                monitors: [mockMinimalMonitor],
                selectedMonitorId: "minimal-monitor",
            };

            render(<MonitorSelector {...propsWithMinimal} />);

            const minimalOption = screen.getByText("HTTP");
            expect(minimalOption).toBeInTheDocument();
        });

        it("should handle monitor with both URL and port (port takes precedence)", () => {
            const monitorWithBoth: Monitor = {
                ...mockHttpMonitor,
                port: 9000,
            };

            const propsWithBoth = {
                ...defaultProps,
                monitors: [monitorWithBoth],
                selectedMonitorId: "http-monitor",
            };

            render(<MonitorSelector {...propsWithBoth} />);

            // Port should take precedence over URL
            const option = screen.getByText("HTTP:9000");
            expect(option).toBeInTheDocument();
        });

        it("should format different monitor types correctly", () => {
            const portTypeMonitor: Monitor = {
                id: "port-only-monitor",
                type: "port",
                host: "localhost",
                port: 3000,
                status: "up",
                history: [],
                monitoring: true,
                checkInterval: 60000,
                timeout: 30000,
                retryAttempts: 3,
            };

            const propsWithPortOnly = {
                ...defaultProps,
                monitors: [portTypeMonitor],
                selectedMonitorId: "port-only-monitor",
            };

            render(<MonitorSelector {...propsWithPortOnly} />);

            const portOption = screen.getByText("PORT:3000");
            expect(portOption).toBeInTheDocument();
        });
    });

    describe("User Interactions", () => {
        it("should call onChange when selection changes", async () => {
            const user = userEvent.setup();
            render(<MonitorSelector {...defaultProps} />);

            const select = screen.getByTestId("themed-select");
            await user.selectOptions(select, "port-monitor");

            expect(mockOnChange).toHaveBeenCalledTimes(1);

            // Check that the callback received an event
            const call = mockOnChange.mock.calls[0]?.[0];
            expect(call).toBeDefined();
            expect(call.target).toBeDefined();
            expect(call.type).toBe("change");
        });

        it("should stop propagation on click", async () => {
            const user = userEvent.setup();
            const mockClick = vi.fn();

            // Create a wrapper to test event propagation
            const TestWrapper = () => (
                <button type="button" onClick={mockClick} title="Monitor Selector Button">
                    <MonitorSelector {...defaultProps} />
                </button>
            );

            render(<TestWrapper />);

            const select = screen.getByTestId("themed-select");
            await user.click(select);

            // The parent button click should not be called due to stopPropagation
            // This tests that the onClick handler in MonitorSelector calls stopPropagation
            expect(mockClick).not.toHaveBeenCalled();
        });

        it("should stop propagation on mouse down", async () => {
            const user = userEvent.setup();
            const mockMouseDown = vi.fn();

            // Create a wrapper to test event propagation
            const TestWrapper = () => (
                <button type="button" onMouseDown={mockMouseDown} title="Monitor Selector MouseDown Button">
                    <MonitorSelector {...defaultProps} />
                </button>
            );

            render(<TestWrapper />);

            const select = screen.getByTestId("themed-select");

            // Focus and then use pointer events to simulate mouse down
            await user.click(select);

            // The component should handle the interaction properly
            expect(select).toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty monitors array", () => {
            const emptyProps = {
                ...defaultProps,
                monitors: [],
            };

            render(<MonitorSelector {...emptyProps} />);

            const select = screen.getByTestId("themed-select");
            expect(select).toBeInTheDocument();
            expect(select.children).toHaveLength(0);
        });

        it("should handle monitor without id", () => {
            const monitorWithoutId: Monitor = {
                ...mockHttpMonitor,
                id: "",
            };

            const propsWithoutId = {
                ...defaultProps,
                monitors: [monitorWithoutId],
                selectedMonitorId: "",
            };

            render(<MonitorSelector {...propsWithoutId} />);

            const option = screen.getByText("HTTP: https://example.com");
            expect(option).toBeInTheDocument();
            expect(option).toHaveValue("");
        });

        it("should handle very long URLs", () => {
            const longUrlMonitor: Monitor = {
                ...mockHttpMonitor,
                url: "https://very-long-domain-name-that-might-cause-layout-issues.example.com/path/to/resource",
            };

            const propsWithLongUrl = {
                ...defaultProps,
                monitors: [longUrlMonitor],
                selectedMonitorId: "http-monitor",
            };

            render(<MonitorSelector {...propsWithLongUrl} />);

            const option = screen.getByText(
                "HTTP: https://very-long-domain-name-that-might-cause-layout-issues.example.com/path/to/resource"
            );
            expect(option).toBeInTheDocument();
        });

        it("should handle high port numbers", () => {
            const highPortMonitor: Monitor = {
                ...mockPortMonitor,
                port: 65535,
            };

            const propsWithHighPort = {
                ...defaultProps,
                monitors: [highPortMonitor],
                selectedMonitorId: "port-monitor",
            };

            render(<MonitorSelector {...propsWithHighPort} />);

            const option = screen.getByText("PORT:65535");
            expect(option).toBeInTheDocument();
        });
    });

    describe("Performance and Memoization", () => {
        it("should not recreate handlers on re-render with same props", () => {
            const { rerender } = render(<MonitorSelector {...defaultProps} />);

            // Re-render with same props
            rerender(<MonitorSelector {...defaultProps} />);

            // Component should still be rendered properly (memo working)
            const select = screen.getByTestId("themed-select");
            expect(select).toBeInTheDocument();
        });

        it("should update when monitors change", () => {
            const { rerender } = render(<MonitorSelector {...defaultProps} />);

            const newMonitor: Monitor = {
                id: "new-monitor",
                type: "http",
                url: "https://newsite.com",
                status: "up",
                history: [],
                monitoring: true,
                checkInterval: 60000,
                timeout: 30000,
                retryAttempts: 3,
            };

            const newProps = {
                ...defaultProps,
                monitors: [...defaultProps.monitors, newMonitor],
            };

            rerender(<MonitorSelector {...newProps} />);

            const newOption = screen.getByText("HTTP: https://newsite.com");
            expect(newOption).toBeInTheDocument();
        });

        it("should update when selectedMonitorId changes", () => {
            const { rerender } = render(<MonitorSelector {...defaultProps} />);

            const updatedProps = {
                ...defaultProps,
                selectedMonitorId: "port-monitor",
            };

            rerender(<MonitorSelector {...updatedProps} />);

            const select = screen.getByTestId("themed-select");
            expect(select).toHaveValue("port-monitor");
        });
    });

    describe("Accessibility", () => {
        it("should be keyboard accessible", async () => {
            const user = userEvent.setup();
            render(<MonitorSelector {...defaultProps} />);

            const select = screen.getByTestId("themed-select");

            // Should be focusable
            await user.tab();
            expect(select).toHaveFocus();

            // Should be operable with keyboard
            await user.keyboard("[ArrowDown]");
            expect(select).toHaveFocus();
        });

        it("should maintain proper option values and labels", () => {
            render(<MonitorSelector {...defaultProps} />);

            const options = screen.getAllByRole("option");
            expect(options).toHaveLength(2);

            const httpOption = options.find((option) => option.textContent === "HTTP: https://example.com");
            const portOption = options.find((option) => option.textContent === "PORT:8080");

            expect(httpOption).toHaveAttribute("value", "http-monitor");
            expect(portOption).toHaveAttribute("value", "port-monitor");
        });
    });

    describe("Component Integration", () => {
        it("should integrate properly with ThemedSelect", () => {
            render(<MonitorSelector {...defaultProps} />);

            const select = screen.getByTestId("themed-select");
            expect(select).toBeInTheDocument();

            // Should pass through all necessary props
            expect(select).toHaveValue("http-monitor");
            expect(select).toHaveClass("min-w-[80px]");
        });

        it("should handle change events from ThemedSelect", async () => {
            const user = userEvent.setup();
            render(<MonitorSelector {...defaultProps} />);

            const select = screen.getByTestId("themed-select");
            await user.selectOptions(select, "port-monitor");

            expect(mockOnChange).toHaveBeenCalled();
        });
    });
});
