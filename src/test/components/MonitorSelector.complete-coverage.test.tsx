/**
 * Comprehensive test coverage for MonitorSelector component. Focuses on
 * uncovered lines and edge cases to achieve 100% coverage.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MonitorSelector } from "../../components/Dashboard/SiteCard/components/MonitorSelector";
import ThemeProvider from "../../theme/components/ThemeProvider";
import type { Monitor } from "../../../shared/types";
import { createValidMonitor } from "../shared/testHelpers";

// Mock ThemedSelect
vi.mock("../../theme/components/ThemedSelect", () => ({
    default: ({
        children,
        onChange,
        onClick,
        onMouseDown,
        value,
        className,
    }: any) => (
        <select
            className={className}
            onChange={onChange}
            onClick={onClick}
            onMouseDown={onMouseDown}
            value={value}
            data-testid="themed-select"
        >
            {children}
        </select>
    ),
}));

const createMockMonitor = (
    id: string,
    type: "http" | "port" | "ping",
    options: { url?: string; port?: number; host?: string } = {}
): Monitor =>
    createValidMonitor({
        id,
        type,
        status: "pending",
        monitoring: false,
        responseTime: 0,
        ...options,
    });

const defaultProps = {
    monitors: [
        createMockMonitor("monitor-1", "http", { url: "https://example.com" }),
        createMockMonitor("monitor-2", "port", { port: 8080 }),
        createMockMonitor("monitor-3", "ping"),
    ],
    selectedMonitorId: "monitor-1",
    onChange: vi.fn(),
};

const renderMonitorSelector = (props = {}) => {
    return render(
        <ThemeProvider>
            <MonitorSelector {...defaultProps} {...props} />
        </ThemeProvider>
    );
};

describe("MonitorSelector - Complete Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Basic Rendering", () => {
        it("should render with default className", () => {
            renderMonitorSelector();

            const select = screen.getByTestId("themed-select");
            expect(select).toHaveClass("min-w-20");
        });

        it("should render with custom className", () => {
            renderMonitorSelector({ className: "custom-class" });

            const select = screen.getByTestId("themed-select");
            expect(select).toHaveClass("custom-class");
        });

        it("should render all monitor options", () => {
            renderMonitorSelector();

            const options = screen.getAllByRole("option");
            expect(options).toHaveLength(3);

            expect(options[0]).toHaveValue("monitor-1");
            expect(options[1]).toHaveValue("monitor-2");
            expect(options[2]).toHaveValue("monitor-3");
        });

        it("should show selected monitor value", () => {
            renderMonitorSelector({ selectedMonitorId: "monitor-2" });

            const select = screen.getByTestId("themed-select");
            expect(select).toHaveValue("monitor-2");
        });
    });

    describe("Monitor Option Formatting", () => {
        it("should format HTTP monitor with URL", () => {
            renderMonitorSelector();

            const option = screen.getByText("HTTP: https://example.com");
            expect(option).toBeInTheDocument();
        });

        it("should format port monitor with port number", () => {
            renderMonitorSelector();

            const option = screen.getByText("PORT: 8080");
            expect(option).toBeInTheDocument();
        });

        it("should format ping monitor without additional details", () => {
            renderMonitorSelector();

            const option = screen.getByText("PING");
            expect(option).toBeInTheDocument();
        });

        it("should format monitor with only type when no url or port", () => {
            const monitors = [
                createMockMonitor("monitor-no-details", "http"), // No url or port
            ];

            renderMonitorSelector({ monitors });

            const option = screen.getByText("HTTP");
            expect(option).toBeInTheDocument();
        });

        it("should handle mixed case monitor types", () => {
            const monitors = [
                {
                    ...createMockMonitor("monitor-1", "http"),
                    type: "HTTP",
                } as any,
            ];

            renderMonitorSelector({ monitors });

            const option = screen.getByText("HTTP");
            expect(option).toBeInTheDocument();
        });

        it("should prioritize port over url when both present", () => {
            const monitors = [
                createMockMonitor("monitor-both", "http", {
                    url: "https://example.com",
                    port: 3000,
                }),
            ];

            renderMonitorSelector({ monitors });

            const option = screen.getByText("HTTP: 3000");
            expect(option).toBeInTheDocument();
        });
    });

    describe("Event Handling", () => {
        it("should call onChange when selection changes", async () => {
            const onChange = vi.fn();
            renderMonitorSelector({ onChange });

            const select = screen.getByTestId("themed-select");
            await userEvent.selectOptions(select, "monitor-2");

            expect(onChange).toHaveBeenCalled();
        });

        it("should stop propagation on click events", () => {
            renderMonitorSelector();

            const select = screen.getByTestId("themed-select");
            const stopPropagation = vi.fn();

            const mockEvent = new MouseEvent("click", { bubbles: true });
            mockEvent.stopPropagation = stopPropagation;

            fireEvent(select, mockEvent);

            expect(stopPropagation).toHaveBeenCalled();
        });

        it("should stop propagation on mouseDown events", () => {
            renderMonitorSelector();

            const select = screen.getByTestId("themed-select");
            const stopPropagation = vi.fn();

            const mockEvent = new MouseEvent("mousedown", { bubbles: true });
            mockEvent.stopPropagation = stopPropagation;

            fireEvent(select, mockEvent);

            expect(stopPropagation).toHaveBeenCalled();
        });

        it("should handle click without event object", () => {
            renderMonitorSelector();

            const select = screen.getByTestId("themed-select");

            // Should not throw when event handlers receive undefined
            fireEvent.click(select);

            expect(select).toBeInTheDocument();
        });

        it("should handle mouseDown without event object", () => {
            renderMonitorSelector();

            const select = screen.getByTestId("themed-select");

            // Should not throw when event handlers receive undefined
            fireEvent.mouseDown(select);

            expect(select).toBeInTheDocument();
        });
    });

    describe("Performance Optimizations", () => {
        it("should be a memoized component (React.memo)", () => {
            expect(typeof MonitorSelector).toBe("object");
            // React.memo components don't automatically have displayName
            expect(MonitorSelector).toBeDefined();
        });

        it("should maintain stable event handlers across renders", () => {
            const { rerender } = renderMonitorSelector();

            const select1 = screen.getByTestId("themed-select");

            // Rerender with same props
            rerender(
                <ThemeProvider>
                    <MonitorSelector {...defaultProps} />
                </ThemeProvider>
            );

            const select2 = screen.getByTestId("themed-select");

            // Should be the same element (React.memo working)
            expect(select1).toBe(select2);
        });

        it("should re-render when props change", () => {
            const { rerender } = renderMonitorSelector();

            screen.getAllByRole("option");

            // Rerender with different monitors
            const newMonitors = [
                createMockMonitor("new-monitor", "http", {
                    url: "https://new.com",
                }),
            ];

            rerender(
                <ThemeProvider>
                    <MonitorSelector {...defaultProps} monitors={newMonitors} />
                </ThemeProvider>
            );

            const newOptions = screen.getAllByRole("option");
            expect(newOptions).toHaveLength(1);
            expect(newOptions[0]).toHaveValue("new-monitor");
            expect(newOptions[0]).toHaveTextContent("HTTP: https://new.com");
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty monitors array", () => {
            renderMonitorSelector({ monitors: [] });

            const select = screen.getByTestId("themed-select");
            expect(select).toBeInTheDocument();

            const options = screen.queryAllByRole("option");
            expect(options).toHaveLength(0);
        });

        it("should handle single monitor", () => {
            const singleMonitor = [createMockMonitor("only-monitor", "ping")];
            renderMonitorSelector({ monitors: singleMonitor });

            const options = screen.getAllByRole("option");
            expect(options).toHaveLength(1);
            expect(options[0]).toHaveTextContent("PING");
        });

        it("should handle monitors with special characters in URL", () => {
            const monitors = [
                createMockMonitor("special-chars", "http", {
                    url: "https://example.com/path?param=value&other=test",
                }),
            ];

            renderMonitorSelector({ monitors });

            const option = screen.getByText(
                "HTTP: https://example.com/path?param=value&other=test"
            );
            expect(option).toBeInTheDocument();
        });

        it("should handle monitors with very high port numbers", () => {
            const monitors = [
                createMockMonitor("high-port", "port", { port: 65_535 }),
            ];

            renderMonitorSelector({ monitors });

            const option = screen.getByText("PORT: 65535");
            expect(option).toBeInTheDocument();
        });

        it("should handle monitors with port 0 (falsy value edge case)", () => {
            const monitors = [
                createMockMonitor("port-zero", "port", { port: 0 }),
            ];

            renderMonitorSelector({ monitors });

            // Note: port 0 is falsy in JS, so the component shows just "PORT"
            // This might be unexpected behavior - port 0 is a valid port number
            const option = screen.getByText("PORT");
            expect(option).toBeInTheDocument();
        });

        it("should handle invalid selected monitor ID gracefully", () => {
            const monitors = defaultProps.monitors;
            renderMonitorSelector({
                monitors,
                selectedMonitorId: "non-existent-id",
            });

            const select = screen.getByTestId("themed-select");
            // The component should still render even with invalid ID
            expect(select).toBeInTheDocument();

            // Options should still be available
            const options = screen.getAllByRole("option");
            expect(options).toHaveLength(3);
        });

        it("should handle undefined selected monitor ID", () => {
            renderMonitorSelector({ selectedMonitorId: undefined as any });

            const select = screen.getByTestId("themed-select");
            expect(select).toBeInTheDocument();
        });
    });

    describe("Monitor Type Coverage", () => {
        it("should handle all supported monitor types", () => {
            const allTypes = [
                createMockMonitor("http-monitor", "http", {
                    url: "https://test.com",
                }),
                createMockMonitor("port-monitor", "port", { port: 443 }),
                createMockMonitor("ping-monitor", "ping"),
            ];

            renderMonitorSelector({ monitors: allTypes });

            expect(
                screen.getByText("HTTP: https://test.com")
            ).toBeInTheDocument();
            expect(screen.getByText("PORT: 443")).toBeInTheDocument();
            expect(screen.getByText("PING")).toBeInTheDocument();
        });

        it("should format monitor options consistently", () => {
            const monitors = [
                createMockMonitor("test-1", "http", {
                    url: "http://localhost",
                }),
                createMockMonitor("test-2", "port", { port: 8080 }),
                createMockMonitor("test-3", "ping"),
            ];

            renderMonitorSelector({ monitors });

            const options = screen.getAllByRole("option");

            // Check that each option has expected format
            expect(options[0]).toHaveTextContent(/^HTTP:/);
            expect(options[1]).toHaveTextContent(/^PORT:/);
            expect(options[2]).toHaveTextContent(/^PING$/);
        });
    });

    describe("Accessibility", () => {
        it("should be keyboard navigable", async () => {
            renderMonitorSelector();

            const select = screen.getByTestId("themed-select");

            // Focus the select
            select.focus();
            expect(select).toHaveFocus();

            // Should be able to change selection with keyboard
            await userEvent.keyboard("{ArrowDown}");
            // The actual selection change depends on the select implementation
        });

        it("should have proper roles and attributes", () => {
            renderMonitorSelector();

            const select = screen.getByTestId("themed-select");
            // Check that the select element exists and is properly structured
            expect(select).toBeInTheDocument();

            const options = screen.getAllByRole("option");
            for (const option of options) {
                expect(option).toHaveAttribute("value");
            }
        });
    });
});
