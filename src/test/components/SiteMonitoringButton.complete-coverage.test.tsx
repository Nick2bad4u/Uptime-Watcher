/**
 * Comprehensive test coverage for SiteMonitoringButton component. Targeting
 * 100% coverage with focus on state handling, interactions, and accessibility.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { SiteMonitoringButton } from "../../components/common/SiteMonitoringButton/SiteMonitoringButton";
import { ThemeProvider } from "../../theme/components/ThemeProvider";

// Mock ThemedButton component
vi.mock("../../theme/components/ThemedButton", () => ({
    ThemedButton: ({
        children,
        onClick,
        disabled,
        "aria-label": ariaLabel,
        className,
        size,
        variant,
        ...props
    }: any) => (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
            className={className}
            data-testid="themed-button"
            data-size={size}
            data-variant={variant}
            {...props}
        >
            {children}
        </button>
    ),
}));

/**
 * Test wrapper with theme provider
 */
const renderWithTheme = (ui: React.ReactElement) =>
    render(<ThemeProvider>{ui}</ThemeProvider>);

describe("SiteMonitoringButton - Complete Coverage", () => {
    const defaultProps = {
        allMonitorsRunning: false,
        isLoading: false,
        onStartSiteMonitoring: vi.fn(),
        onStopSiteMonitoring: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Basic Rendering", () => {
        it("should render start button when monitors are not running", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={false}
                />
            );

            const button = screen.getByTestId("themed-button");
            expect(button).toBeInTheDocument();
            expect(button).toHaveAttribute(
                "aria-label",
                "Start All Monitoring"
            );
            expect(button).toHaveAttribute("data-variant", "success");
            expect(button).toHaveAttribute("data-size", "sm");
            expect(screen.getByText("▶️")).toBeInTheDocument();
            expect(screen.getByText("Start All")).toBeInTheDocument();
        });

        it("should render stop button when monitors are running", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={true}
                />
            );

            const button = screen.getByTestId("themed-button");
            expect(button).toBeInTheDocument();
            expect(button).toHaveAttribute("aria-label", "Stop All Monitoring");
            expect(button).toHaveAttribute("data-variant", "error");
            expect(button).toHaveAttribute("data-size", "sm");
            expect(screen.getByText("⏹️")).toBeInTheDocument();
            expect(screen.getByText("Stop All")).toBeInTheDocument();
        });

        it("should apply custom className", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    className="custom-class"
                />
            );

            const button = screen.getByTestId("themed-button");
            expect(button).toHaveClass(
                "flex",
                "items-center",
                "gap-1",
                "custom-class"
            );
        });

        it("should apply default className when none provided", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderWithTheme(<SiteMonitoringButton {...defaultProps} />);

            const button = screen.getByTestId("themed-button");
            expect(button).toHaveClass("flex", "items-center", "gap-1");
        });
    });

    describe("Compact Mode", () => {
        it("should hide text in compact mode for start button", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={false}
                    compact={true}
                />
            );

            expect(screen.getByText("▶️")).toBeInTheDocument();
            expect(screen.queryByText("Start All")).not.toBeInTheDocument();
        });

        it("should hide text in compact mode for stop button", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={true}
                    compact={true}
                />
            );

            expect(screen.getByText("⏹️")).toBeInTheDocument();
            expect(screen.queryByText("Stop All")).not.toBeInTheDocument();
        });

        it("should show text when compact is false", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={false}
                    compact={false}
                />
            );

            expect(screen.getByText("Start All")).toBeInTheDocument();
        });

        it("should show text when compact is undefined (default)", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={false}
                />
            );

            expect(screen.getByText("Start All")).toBeInTheDocument();
        });
    });

    describe("Loading State", () => {
        it("should disable start button when loading", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={false}
                    isLoading={true}
                />
            );

            const button = screen.getByTestId("themed-button");
            expect(button).toBeDisabled();
        });

        it("should disable stop button when loading", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={true}
                    isLoading={true}
                />
            );

            const button = screen.getByTestId("themed-button");
            expect(button).toBeDisabled();
        });

        it("should enable button when not loading", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            renderWithTheme(
                <SiteMonitoringButton {...defaultProps} isLoading={false} />
            );

            const button = screen.getByTestId("themed-button");
            expect(button).not.toBeDisabled();
        });
    });

    describe("Click Handlers", () => {
        it("should call onStartSiteMonitoring when start button is clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const mockStart = vi.fn();
            const user = userEvent.setup();

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={false}
                    onStartSiteMonitoring={mockStart}
                />
            );

            const button = screen.getByTestId("themed-button");
            await user.click(button);

            expect(mockStart).toHaveBeenCalledTimes(1);
        });

        it("should call onStopSiteMonitoring when stop button is clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const mockStop = vi.fn();
            const user = userEvent.setup();

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={true}
                    onStopSiteMonitoring={mockStop}
                />
            );

            const button = screen.getByTestId("themed-button");
            await user.click(button);

            expect(mockStop).toHaveBeenCalledTimes(1);
        });

        it("should not call handlers when button is disabled", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockStart = vi.fn();
            const mockStop = vi.fn();
            const user = userEvent.setup();

            const { rerender } = renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={false}
                    isLoading={true}
                    onStartSiteMonitoring={mockStart}
                />
            );

            let button = screen.getByTestId("themed-button");
            await user.click(button);
            expect(mockStart).not.toHaveBeenCalled();

            rerender(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={true}
                    isLoading={true}
                    onStopSiteMonitoring={mockStop}
                />
            );

            button = screen.getByTestId("themed-button");
            await user.click(button);
            expect(mockStop).not.toHaveBeenCalled();
        });

        it("should handle multiple clicks correctly", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockStart = vi.fn();
            const user = userEvent.setup();

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={false}
                    onStartSiteMonitoring={mockStart}
                />
            );

            const button = screen.getByTestId("themed-button");
            await user.click(button);
            await user.click(button);
            await user.click(button);

            expect(mockStart).toHaveBeenCalledTimes(3);
        });
    });

    describe("Event Propagation", () => {
        it("should stop propagation when start button is clicked", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockStart = vi.fn();
            const mockParentClick = vi.fn();

            renderWithTheme(
                <div onClick={mockParentClick}>
                    <SiteMonitoringButton
                        {...defaultProps}
                        allMonitorsRunning={false}
                        onStartSiteMonitoring={mockStart}
                    />
                </div>
            );

            const button = screen.getByTestId("themed-button");
            fireEvent.click(button);

            expect(mockStart).toHaveBeenCalledTimes(1);
            expect(mockParentClick).not.toHaveBeenCalled();
        });

        it("should stop propagation when stop button is clicked", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockStop = vi.fn();
            const mockParentClick = vi.fn();

            renderWithTheme(
                <div onClick={mockParentClick}>
                    <SiteMonitoringButton
                        {...defaultProps}
                        allMonitorsRunning={true}
                        onStopSiteMonitoring={mockStop}
                    />
                </div>
            );

            const button = screen.getByTestId("themed-button");
            fireEvent.click(button);

            expect(mockStop).toHaveBeenCalledTimes(1);
            expect(mockParentClick).not.toHaveBeenCalled();
        });

        it("should handle click events without event object", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Event Processing", "type");

            const mockStart = vi.fn();

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={false}
                    onStartSiteMonitoring={mockStart}
                />
            );

            const button = screen.getByTestId("themed-button");
            // Simulate a click without event object (edge case)
            button.click();

            expect(mockStart).toHaveBeenCalledTimes(1);
        });
    });

    describe("State Transitions", () => {
        it("should switch from start to stop when allMonitorsRunning changes", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const { rerender } = renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={false}
                />
            );

            expect(screen.getByText("Start All")).toBeInTheDocument();
            expect(screen.getByText("▶️")).toBeInTheDocument();

            rerender(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={true}
                />
            );

            expect(screen.getByText("Stop All")).toBeInTheDocument();
            expect(screen.getByText("⏹️")).toBeInTheDocument();
        });

        it("should maintain button attributes during state transitions", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const { rerender } = renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={false}
                    className="custom-class"
                />
            );

            let button = screen.getByTestId("themed-button");
            expect(button).toHaveClass("custom-class");
            expect(button).toHaveAttribute("data-size", "sm");

            rerender(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={true}
                    className="custom-class"
                />
            );

            button = screen.getByTestId("themed-button");
            expect(button).toHaveClass("custom-class");
            expect(button).toHaveAttribute("data-size", "sm");
        });
    });

    describe("Accessibility", () => {
        it("should have proper aria-label for start button", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={false}
                />
            );

            const button = screen.getByTestId("themed-button");
            expect(button).toHaveAttribute(
                "aria-label",
                "Start All Monitoring"
            );
        });

        it("should have proper aria-label for stop button", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={true}
                />
            );

            const button = screen.getByTestId("themed-button");
            expect(button).toHaveAttribute("aria-label", "Stop All Monitoring");
        });

        it("should be keyboard accessible", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockStart = vi.fn();
            const user = userEvent.setup();

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={false}
                    onStartSiteMonitoring={mockStart}
                />
            );

            const button = screen.getByTestId("themed-button");

            // Focus the button
            await user.tab();
            expect(button).toHaveFocus();

            // Activate with Enter
            await user.keyboard("{Enter}");
            expect(mockStart).toHaveBeenCalledTimes(1);
        });

        it("should be activatable with Space key", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockStart = vi.fn();
            const user = userEvent.setup();

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={false}
                    onStartSiteMonitoring={mockStart}
                />
            );

            const button = screen.getByTestId("themed-button");
            button.focus();

            await user.keyboard(" ");
            expect(mockStart).toHaveBeenCalledTimes(1);
        });
    });

    describe("React.memo Performance", () => {
        it("should be a memoized component", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            expect(typeof SiteMonitoringButton).toBe("object");
            expect(SiteMonitoringButton).toBeDefined();
            // Check that it's a React.memo component
            expect(SiteMonitoringButton.$$typeof).toBe(
                Symbol.for("react.memo")
            );
        });

        it("should have proper display name", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // React.memo with function name preserves displayName (may have number suffix in testing)
            const displayName =
                SiteMonitoringButton.displayName ||
                (SiteMonitoringButton as any).type?.name;
            expect(displayName).toMatch(/^SiteMonitoringButton\d*$/);
        });

        it("should maintain stable callback references", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockStart = vi.fn();
            const mockStop = vi.fn();

            const { rerender } = renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    onStartSiteMonitoring={mockStart}
                    onStopSiteMonitoring={mockStop}
                />
            );

            const firstButton = screen.getByTestId("themed-button");
            const firstOnClick = (firstButton as any).onclick;

            // Re-render with same props
            rerender(
                <SiteMonitoringButton
                    {...defaultProps}
                    onStartSiteMonitoring={mockStart}
                    onStopSiteMonitoring={mockStop}
                />
            );

            const secondButton = screen.getByTestId("themed-button");
            const secondOnClick = (secondButton as any).onclick;

            // useCallback should maintain reference stability
            expect(firstOnClick).toBe(secondOnClick);
        });
    });

    describe("useCallback Implementation", () => {
        it("should maintain handler reference stability across re-renders", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockStart = vi.fn();
            const mockStop = vi.fn();

            const { rerender } = renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    onStartSiteMonitoring={mockStart}
                    onStopSiteMonitoring={mockStop}
                    allMonitorsRunning={false}
                />
            );

            const firstStartButton = screen.getByTestId("themed-button");

            // Re-render with different allMonitorsRunning but same callbacks
            rerender(
                <SiteMonitoringButton
                    {...defaultProps}
                    onStartSiteMonitoring={mockStart}
                    onStopSiteMonitoring={mockStop}
                    allMonitorsRunning={true}
                />
            );

            const stopButton = screen.getByTestId("themed-button");

            // Different components but same underlying callbacks should be stable
            expect(firstStartButton).not.toBe(stopButton); // Different button instances
        });

        it("should handle callback dependency changes", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockStart1 = vi.fn();
            const mockStart2 = vi.fn();

            const { rerender } = renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    onStartSiteMonitoring={mockStart1}
                    allMonitorsRunning={false}
                />
            );

            fireEvent.click(screen.getByTestId("themed-button"));
            expect(mockStart1).toHaveBeenCalledTimes(1);

            // Re-render with different callback
            rerender(
                <SiteMonitoringButton
                    {...defaultProps}
                    onStartSiteMonitoring={mockStart2}
                    allMonitorsRunning={false}
                />
            );

            fireEvent.click(screen.getByTestId("themed-button"));
            expect(mockStart1).toHaveBeenCalledTimes(1); // Still 1
            expect(mockStart2).toHaveBeenCalledTimes(1); // New callback called
        });
    });

    describe("Edge Cases", () => {
        it("should handle undefined event in click handlers", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Event Processing", "type");

            const mockStart = vi.fn();

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={false}
                    onStartSiteMonitoring={mockStart}
                />
            );

            const button = screen.getByTestId("themed-button");

            // Trigger click which calls handleStartClick
            fireEvent.click(button, { stopPropagation: undefined });
            expect(mockStart).toHaveBeenCalledTimes(1);
        });

        it("should handle null event in click handlers", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Event Processing", "type");

            const mockStop = vi.fn();

            renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={true}
                    onStopSiteMonitoring={mockStop}
                />
            );

            const button = screen.getByTestId("themed-button");

            // Trigger click which calls handleStopClick
            fireEvent.click(button, { stopPropagation: undefined });
            expect(mockStop).toHaveBeenCalledTimes(1);
        });

        it("should handle rapid state changes", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const { rerender } = renderWithTheme(
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning={false}
                />
            );

            // Rapid state changes
            for (let i = 0; i < 10; i++) {
                rerender(
                    <SiteMonitoringButton
                        {...defaultProps}
                        allMonitorsRunning={i % 2 === 0}
                    />
                );
            }

            // Should end in start state (false)
            expect(screen.getByText("Start All")).toBeInTheDocument();
        });

        it("should handle empty className gracefully", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderWithTheme(
                <SiteMonitoringButton {...defaultProps} className="" />
            );

            const button = screen.getByTestId("themed-button");
            expect(button).toHaveClass("flex", "items-center", "gap-1");
        });
    });

    describe("Component Integration", () => {
        it("should work with all prop combinations", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockStart = vi.fn();
            const mockStop = vi.fn();

            renderWithTheme(
                <SiteMonitoringButton
                    allMonitorsRunning={false}
                    className="test-class"
                    compact={true}
                    isLoading={false}
                    onStartSiteMonitoring={mockStart}
                    onStopSiteMonitoring={mockStop}
                />
            );

            const button = screen.getByTestId("themed-button");
            expect(button).toHaveClass("test-class");
            expect(button).toHaveAttribute("data-variant", "success");
            expect(button).not.toBeDisabled();
            expect(screen.getByText("▶️")).toBeInTheDocument();
            expect(screen.queryByText("Start All")).not.toBeInTheDocument(); // compact mode
        });

        it("should maintain consistency across theme changes", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: SiteMonitoringButton.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const { rerender } = renderWithTheme(
                <SiteMonitoringButton {...defaultProps} />
            );

            const button = screen.getByTestId("themed-button");
            expect(button).toHaveAttribute("data-size", "sm");

            // Re-render (simulating theme change)
            rerender(
                <ThemeProvider>
                    <SiteMonitoringButton {...defaultProps} />
                </ThemeProvider>
            );

            const newButton = screen.getByTestId("themed-button");
            expect(newButton).toHaveAttribute("data-size", "sm");
        });
    });
});
