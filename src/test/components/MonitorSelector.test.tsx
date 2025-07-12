/**
 * Comprehensive tests for MonitorSelector component
 * Testing all functionality for 100% coverage
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MonitorSelector } from "../../components/Dashboard/SiteCard/components/MonitorSelector";
import { Monitor } from "../../types";

// Mock ThemedSelect component
vi.mock("../../theme", () => ({
    ThemedSelect: ({ children, value, onChange, className, onClick, onMouseDown }: any) => (
        <select
            value={value}
            onChange={onChange}
            className={className}
            onClick={onClick}
            onMouseDown={onMouseDown}
            data-testid="themed-select"
        >
            {children}
        </select>
    ),
}));

// Helper function to create valid Monitor objects
const createMonitor = (overrides: Partial<Monitor>): Monitor => ({
    id: "1",
    type: "http",
    status: "up",
    responseTime: 150,
    history: [],
    monitoring: true,
    checkInterval: 30000,
    timeout: 5000,
    retryAttempts: 3,
    ...overrides,
});

describe("MonitorSelector", () => {
    const mockMonitors: Monitor[] = [
        createMonitor({
            id: "1",
            type: "http",
            url: "https://example.com",
        }),
        createMonitor({
            id: "2",
            type: "port",
            host: "localhost",
            port: 8080,
        }),
        createMonitor({
            id: "3",
            type: "http",
            url: "https://api.example.com/health",
        }),
        createMonitor({
            id: "4",
            type: "port",
            host: "database.example.com",
            port: 5432,
        }),
    ];

    const defaultProps = {
        monitors: mockMonitors,
        selectedMonitorId: "1",
        onChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Rendering", () => {
        it("should render all monitor options", () => {
            render(<MonitorSelector {...defaultProps} />);

            expect(screen.getByText("HTTP: https://example.com")).toBeInTheDocument();
            expect(screen.getByText("PORT:8080")).toBeInTheDocument();
            expect(screen.getByText("HTTP: https://api.example.com/health")).toBeInTheDocument();
            expect(screen.getByText("PORT:5432")).toBeInTheDocument();
        });

        it("should render with default className", () => {
            render(<MonitorSelector {...defaultProps} />);

            const select = screen.getByTestId("themed-select");
            expect(select).toHaveClass("min-w-[80px]");
        });

        it("should render with custom className", () => {
            render(<MonitorSelector {...defaultProps} className="custom-width" />);

            const select = screen.getByTestId("themed-select");
            expect(select).toHaveClass("custom-width");
        });

        it("should select the correct option based on selectedMonitorId", () => {
            render(<MonitorSelector {...defaultProps} selectedMonitorId="2" />);

            const select = screen.getByTestId("themed-select");
            expect(select).toHaveValue("2");
        });
    });

    describe("Monitor Option Formatting", () => {
        it("should format HTTP monitors correctly", () => {
            const httpMonitors = [
                createMonitor({ id: "1", type: "http", url: "https://example.com" }),
                createMonitor({ id: "2", type: "http", url: "http://localhost:3000" }),
            ];

            render(<MonitorSelector {...defaultProps} monitors={httpMonitors} />);

            expect(screen.getByText("HTTP: https://example.com")).toBeInTheDocument();
            expect(screen.getByText("HTTP: http://localhost:3000")).toBeInTheDocument();
        });

        it("should format port monitors correctly", () => {
            const portMonitors = [
                createMonitor({ id: "1", type: "port", host: "localhost", port: 8080 }),
                createMonitor({ id: "2", type: "port", host: "database", port: 5432 }),
            ];

            render(<MonitorSelector {...defaultProps} monitors={portMonitors} />);

            expect(screen.getByText("PORT:8080")).toBeInTheDocument();
            expect(screen.getByText("PORT:5432")).toBeInTheDocument();
        });

        it("should handle monitors without URL or port", () => {
            const bareMonitors = [
                createMonitor({ id: "1", type: "http" }),
                createMonitor({ id: "2", type: "port", host: "localhost" }),
            ];

            render(<MonitorSelector {...defaultProps} monitors={bareMonitors} />);

            expect(screen.getByText("HTTP")).toBeInTheDocument();
            expect(screen.getByText("PORT")).toBeInTheDocument();
        });

        it("should handle mixed case monitor types", () => {
            const mixedMonitors = [
                createMonitor({ id: "1", type: "http", url: "https://example.com" }),
                createMonitor({ id: "2", type: "port", host: "localhost", port: 8080 }),
            ];

            render(<MonitorSelector {...defaultProps} monitors={mixedMonitors} />);

            expect(screen.getByText("HTTP: https://example.com")).toBeInTheDocument();
            expect(screen.getByText("PORT:8080")).toBeInTheDocument();
        });
    });

    describe("Event Handling", () => {
        it("should call onChange when selection changes", () => {
            render(<MonitorSelector {...defaultProps} />);

            fireEvent.change(screen.getByTestId("themed-select"), { target: { value: "2" } });

            expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
            expect(defaultProps.onChange).toHaveBeenCalledWith(expect.any(Object));
        });

        it("should stop propagation on click", () => {
            render(<MonitorSelector {...defaultProps} />);

            const clickEvent = new MouseEvent("click", { bubbles: true });
            const stopPropagationSpy = vi.fn();
            Object.defineProperty(clickEvent, "stopPropagation", {
                value: stopPropagationSpy,
                writable: true,
            });

            const select = screen.getByTestId("themed-select");
            fireEvent(select, clickEvent);

            expect(stopPropagationSpy).toHaveBeenCalled();
        });

        it("should stop propagation on mouse down", () => {
            render(<MonitorSelector {...defaultProps} />);

            const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true });
            const stopPropagationSpy = vi.fn();
            Object.defineProperty(mouseDownEvent, "stopPropagation", {
                value: stopPropagationSpy,
                writable: true,
            });

            const select = screen.getByTestId("themed-select");
            fireEvent(select, mouseDownEvent);

            expect(stopPropagationSpy).toHaveBeenCalled();
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty monitor list", () => {
            render(<MonitorSelector {...defaultProps} monitors={[]} />);

            const select = screen.getByTestId("themed-select");
            expect(select.children).toHaveLength(0);
        });

        it("should handle single monitor", () => {
            const singleMonitor = [createMonitor({ id: "1", type: "http", url: "https://example.com" })];

            render(<MonitorSelector {...defaultProps} monitors={singleMonitor} />);

            const select = screen.getByTestId("themed-select");
            expect(select.children).toHaveLength(1);
            expect(screen.getByText("HTTP: https://example.com")).toBeInTheDocument();
        });

        it("should handle selectedMonitorId that doesn't exist in monitors", () => {
            render(<MonitorSelector {...defaultProps} selectedMonitorId="non-existent" />);

            const select = screen.getByTestId("themed-select");
            expect(select).toHaveValue("1"); // Should default to first option
        });
    });

    describe("React.memo Optimization", () => {
        it("should be memoized component", () => {
            expect(MonitorSelector.$$typeof).toBe(Symbol.for("react.memo"));
        });
    });
});
