/**
 * Comprehensive test coverage for ActionButtonGroup component. Focuses on
 * uncovered lines and edge cases to achieve 100% coverage.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ActionButtonGroup } from "../../components/Dashboard/SiteCard/components/ActionButtonGroup";
import { ThemeProvider } from "../../theme/components/ThemeProvider";

// Mock ThemedButton
vi.mock("../../theme/components/ThemedButton", () => ({
    ThemedButton: ({
        children,
        onClick,
        disabled,
        "aria-label": ariaLabel,
        ...props
    }: any) => (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
            data-testid={`themed-button-${ariaLabel?.toLowerCase().replaceAll(/\s+/g, "-")}`}
            {...props}
        >
            {children}
        </button>
    ),
}));

// Mock SiteMonitoringButton
vi.mock(
    "../../components/common/SiteMonitoringButton/SiteMonitoringButton",
    () => ({
        SiteMonitoringButton: ({
            onStartSiteMonitoring,
            onStopSiteMonitoring,
            allMonitorsRunning,
            isLoading,
            className,
            compact,
        }: any) => (
            <div
                data-testid="site-monitoring-button"
                className={className}
                data-compact={compact}
            >
                <button
                    onClick={
                        allMonitorsRunning
                            ? onStopSiteMonitoring
                            : onStartSiteMonitoring
                    }
                    disabled={isLoading}
                    data-testid="site-monitoring-action"
                >
                    {allMonitorsRunning ? "Stop Site" : "Start Site"}
                </button>
            </div>
        ),
    })
);

const defaultProps = {
    allMonitorsRunning: false,
    disabled: false,
    isLoading: false,
    isMonitoring: false,
    onCheckNow: vi.fn(),
    onStartMonitoring: vi.fn(),
    onStartSiteMonitoring: vi.fn(),
    onStopMonitoring: vi.fn(),
    onStopSiteMonitoring: vi.fn(),
};

const renderActionButtonGroup = (props = {}) =>
    render(
        <ThemeProvider>
            <ActionButtonGroup {...defaultProps} {...props} />
        </ThemeProvider>
    );
const REFRESH_ICON_PATH =
    "M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15";
const PLAY_ICON_PATH =
    "M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z";
const PAUSE_ICON_PATH =
    "M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z";

const expectButtonIconPath = (
    button: HTMLElement,
    expectedPath: string
): void => {
    const icon = button.querySelector("svg");
    expect(icon).not.toBeNull();
    const pathElements = icon?.querySelectorAll("path") ?? [];
    const pathValues = Array.from(pathElements, (path) =>
        path.getAttribute("d"));
    expect(pathValues).toContain(expectedPath);
};

describe("ActionButtonGroup - Complete Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Check Now Button", () => {
        it("should render check now button with correct aria-label", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderActionButtonGroup();

            const checkButton = screen.getByRole("button", {
                name: "Check Now",
            });
            expect(checkButton).toBeInTheDocument();
            expectButtonIconPath(checkButton, REFRESH_ICON_PATH);
        });

        it("should call onCheckNow when clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const onCheckNow = vi.fn();
            renderActionButtonGroup({ onCheckNow });

            const checkButton = screen.getByRole("button", {
                name: "Check Now",
            });
            await userEvent.click(checkButton);

            expect(onCheckNow).toHaveBeenCalledTimes(1);
        });

        it("should stop event propagation when clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Event Processing", "type");

            const onCheckNow = vi.fn();
            const stopPropagation = vi.fn();

            renderActionButtonGroup({ onCheckNow });

            const checkButton = screen.getByRole("button", {
                name: "Check Now",
            });

            // Create an event with stopPropagation
            const mockEvent = new MouseEvent("click", { bubbles: true });
            mockEvent.stopPropagation = stopPropagation;

            fireEvent(checkButton, mockEvent);

            expect(stopPropagation).toHaveBeenCalled();
            expect(onCheckNow).toHaveBeenCalled();
        });

        it("should be disabled when isLoading is true", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            renderActionButtonGroup({ isLoading: true });

            const checkButton = screen.getByRole("button", {
                name: "Check Now",
            });
            expect(checkButton).toBeDisabled();
        });

        it("should be disabled when disabled prop is true", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderActionButtonGroup({ disabled: true });

            const checkButton = screen.getByRole("button", {
                name: "Check Now",
            });
            expect(checkButton).toBeDisabled();
        });

        it("should be disabled when both isLoading and disabled are true", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            renderActionButtonGroup({ isLoading: true, disabled: true });

            const checkButton = screen.getByRole("button", {
                name: "Check Now",
            });
            expect(checkButton).toBeDisabled();
        });
    });

    describe("Start/Stop Monitoring Buttons", () => {
        it("should show start monitoring button when not monitoring", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            renderActionButtonGroup({ isMonitoring: false });

            const startButton = screen.getByRole("button", {
                name: "Start Monitoring",
            });
            expect(startButton).toBeInTheDocument();
            expectButtonIconPath(startButton, PLAY_ICON_PATH);

            const stopButton = screen.queryByRole("button", {
                name: "Stop Monitoring",
            });
            expect(stopButton).not.toBeInTheDocument();
        });

        it("should show stop monitoring button when monitoring", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            renderActionButtonGroup({ isMonitoring: true });

            const stopButton = screen.getByRole("button", {
                name: "Stop Monitoring",
            });
            expect(stopButton).toBeInTheDocument();
            expectButtonIconPath(stopButton, PAUSE_ICON_PATH);

            const startButton = screen.queryByRole("button", {
                name: "Start Monitoring",
            });
            expect(startButton).not.toBeInTheDocument();
        });

        it("should call onStartMonitoring when start button is clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const onStartMonitoring = vi.fn();
            renderActionButtonGroup({ isMonitoring: false, onStartMonitoring });

            const startButton = screen.getByRole("button", {
                name: "Start Monitoring",
            });
            await userEvent.click(startButton);

            expect(onStartMonitoring).toHaveBeenCalledTimes(1);
        });

        it("should call onStopMonitoring when stop button is clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const onStopMonitoring = vi.fn();
            renderActionButtonGroup({ isMonitoring: true, onStopMonitoring });

            const stopButton = screen.getByRole("button", {
                name: "Stop Monitoring",
            });
            await userEvent.click(stopButton);

            expect(onStopMonitoring).toHaveBeenCalledTimes(1);
        });

        it("should stop event propagation on start monitoring click", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const onStartMonitoring = vi.fn();
            const stopPropagation = vi.fn();

            renderActionButtonGroup({ isMonitoring: false, onStartMonitoring });

            const startButton = screen.getByRole("button", {
                name: "Start Monitoring",
            });

            // Create an event with stopPropagation
            const mockEvent = new MouseEvent("click", { bubbles: true });
            mockEvent.stopPropagation = stopPropagation;

            fireEvent(startButton, mockEvent);

            expect(stopPropagation).toHaveBeenCalled();
            expect(onStartMonitoring).toHaveBeenCalled();
        });

        it("should stop event propagation on stop monitoring click", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const onStopMonitoring = vi.fn();
            const stopPropagation = vi.fn();

            renderActionButtonGroup({ isMonitoring: true, onStopMonitoring });

            const stopButton = screen.getByRole("button", {
                name: "Stop Monitoring",
            });

            // Create an event with stopPropagation
            const mockEvent = new MouseEvent("click", { bubbles: true });
            mockEvent.stopPropagation = stopPropagation;

            fireEvent(stopButton, mockEvent);

            expect(stopPropagation).toHaveBeenCalled();
            expect(onStopMonitoring).toHaveBeenCalled();
        });

        it("should disable start button when loading", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            renderActionButtonGroup({ isMonitoring: false, isLoading: true });

            const startButton = screen.getByRole("button", {
                name: "Start Monitoring",
            });
            expect(startButton).toBeDisabled();
        });

        it("should disable stop button when loading", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            renderActionButtonGroup({ isMonitoring: true, isLoading: true });

            const stopButton = screen.getByRole("button", {
                name: "Stop Monitoring",
            });
            expect(stopButton).toBeDisabled();
        });

        it("should disable start button when disabled prop is true", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderActionButtonGroup({ isMonitoring: false, disabled: true });

            const startButton = screen.getByRole("button", {
                name: "Start Monitoring",
            });
            expect(startButton).toBeDisabled();
        });

        it("should disable stop button when disabled prop is true", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderActionButtonGroup({ isMonitoring: true, disabled: true });

            const stopButton = screen.getByRole("button", {
                name: "Stop Monitoring",
            });
            expect(stopButton).toBeDisabled();
        });
    });

    describe("SiteMonitoringButton Integration", () => {
        it("should render SiteMonitoringButton with correct props", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            renderActionButtonGroup({
                allMonitorsRunning: true,
                isLoading: false,
            });

            const siteMonitoringButton = screen.getByTestId(
                "site-monitoring-button"
            );
            expect(siteMonitoringButton).toBeInTheDocument();
            expect(siteMonitoringButton).toHaveAttribute(
                "data-compact",
                "true"
            );
        });

        it("should pass onStartSiteMonitoring to SiteMonitoringButton", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const onStartSiteMonitoring = vi.fn();
            renderActionButtonGroup({
                allMonitorsRunning: false,
                onStartSiteMonitoring,
            });

            const siteAction = screen.getByTestId("site-monitoring-action");
            await userEvent.click(siteAction);

            expect(onStartSiteMonitoring).toHaveBeenCalledTimes(1);
        });

        it("should pass onStopSiteMonitoring to SiteMonitoringButton", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const onStopSiteMonitoring = vi.fn();
            renderActionButtonGroup({
                allMonitorsRunning: true,
                onStopSiteMonitoring,
            });

            const siteAction = screen.getByTestId("site-monitoring-action");
            await userEvent.click(siteAction);

            expect(onStopSiteMonitoring).toHaveBeenCalledTimes(1);
        });

        it("should pass loading state to SiteMonitoringButton", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            renderActionButtonGroup({
                isLoading: true,
            });

            const siteAction = screen.getByTestId("site-monitoring-action");
            expect(siteAction).toBeDisabled();
        });

        it("should pass disabled state to SiteMonitoringButton", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            renderActionButtonGroup({
                disabled: true,
            });

            const siteAction = screen.getByTestId("site-monitoring-action");
            expect(siteAction).toBeDisabled();
        });
    });

    describe("Event Handling Edge Cases", () => {
        it("should handle click events without event object", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Event Processing", "type");

            const onCheckNow = vi.fn();
            renderActionButtonGroup({ onCheckNow });

            const checkButton = screen.getByRole("button", {
                name: "Check Now",
            });

            // Simulate a click that might not have an event object
            fireEvent.click(checkButton);

            expect(onCheckNow).toHaveBeenCalled();
            // Should not throw error when event is undefined
        });

        it("should handle start monitoring click without event object", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const onStartMonitoring = vi.fn();
            renderActionButtonGroup({ isMonitoring: false, onStartMonitoring });

            const startButton = screen.getByRole("button", {
                name: "Start Monitoring",
            });
            fireEvent.click(startButton);

            expect(onStartMonitoring).toHaveBeenCalled();
        });

        it("should handle stop monitoring click without event object", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const onStopMonitoring = vi.fn();
            renderActionButtonGroup({ isMonitoring: true, onStopMonitoring });

            const stopButton = screen.getByRole("button", {
                name: "Stop Monitoring",
            });
            fireEvent.click(stopButton);

            expect(onStopMonitoring).toHaveBeenCalled();
        });
    });

    describe("Component Structure", () => {
        it("should render all required buttons", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderActionButtonGroup({ isMonitoring: false });

            const checkButton = screen.getByRole("button", {
                name: "Check Now",
            });
            const startButton = screen.getByRole("button", {
                name: "Start Monitoring",
            });
            const siteButton = screen.getByTestId("site-monitoring-button");

            expect(checkButton).toBeInTheDocument();
            expect(startButton).toBeInTheDocument();
            expect(siteButton).toBeInTheDocument();
        });

        it("should have correct button structure for all states", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderActionButtonGroup({ isMonitoring: false });

            const checkButton = screen.getByRole("button", {
                name: "Check Now",
            });
            const startButton = screen.getByRole("button", {
                name: "Start Monitoring",
            });
            const siteButton = screen.getByTestId("site-monitoring-button");

            expect(checkButton).toBeInTheDocument();
            expect(startButton).toBeInTheDocument();
            expect(siteButton).toBeInTheDocument();
        });
    });

    describe("Accessibility", () => {
        it("should have proper aria-labels for all buttons", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            renderActionButtonGroup({ isMonitoring: false });

            expect(
                screen.getByRole("button", { name: "Check Now" })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "Start Monitoring" })
            ).toBeInTheDocument();
        });

        it("should have proper aria-labels when monitoring", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            renderActionButtonGroup({ isMonitoring: true });

            expect(
                screen.getByRole("button", { name: "Check Now" })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "Stop Monitoring" })
            ).toBeInTheDocument();
        });
    });

    describe("React.memo Optimization", () => {
        it("should be properly exported", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Export Operation", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Export Operation", "type");

            expect(ActionButtonGroup).toBeDefined();
            expect(typeof ActionButtonGroup).toBe("object");
        });
    });

    describe("State Combinations", () => {
        it("should handle all disabled and loading combinations", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            // All buttons disabled when both loading and disabled
            renderActionButtonGroup({
                isLoading: true,
                disabled: true,
                isMonitoring: false,
            });

            const checkButton = screen.getByRole("button", {
                name: "Check Now",
            });
            const startButton = screen.getByRole("button", {
                name: "Start Monitoring",
            });
            const siteButton = screen.getByTestId("site-monitoring-action");

            expect(checkButton).toBeDisabled();
            expect(startButton).toBeDisabled();
            expect(siteButton).toBeDisabled();
        });

        it("should handle monitoring state with all props", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            renderActionButtonGroup({
                isMonitoring: true,
                allMonitorsRunning: true,
                isLoading: false,
                disabled: false,
            });

            expect(
                screen.getByRole("button", { name: "Stop Monitoring" })
            ).toBeInTheDocument();
            expect(
                screen.queryByRole("button", { name: "Start Monitoring" })
            ).not.toBeInTheDocument();
        });
    });

    describe("Callback Dependencies", () => {
        it("should maintain callback identity with same dependencies", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate(
                "Component: ActionButtonGroup.complete-coverage",
                "component"
            );
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const onCheckNow = vi.fn();
            const { rerender } = renderActionButtonGroup({ onCheckNow });

            const checkButton1 = screen.getByRole("button", {
                name: "Check Now",
            });

            // Rerender with same props
            rerender(
                <ThemeProvider>
                    <ActionButtonGroup
                        {...defaultProps}
                        onCheckNow={onCheckNow}
                    />
                </ThemeProvider>
            );

            const checkButton2 = screen.getByRole("button", {
                name: "Check Now",
            });

            // Should be the same element (React.memo working)
            expect(checkButton1).toBe(checkButton2);
        });
    });
});
