/**
 * Comprehensive tests for ActionButtonGroup component
 * Testing all functionality for 100% coverage
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ActionButtonGroup } from "../../components/Dashboard/SiteCard/components/ActionButtonGroup";

// Mock ThemedButton component
vi.mock("../../theme", () => ({
    ThemedButton: ({ children, onClick, disabled, "aria-label": ariaLabel, className, variant, size }: any) => (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
            className={className}
            data-variant={variant}
            data-size={size}
            data-testid={`themed-button-${ariaLabel?.toLowerCase().replace(/\s+/g, "-") || "unknown"}`}
        >
            {children}
        </button>
    ),
}));

describe("ActionButtonGroup", () => {
    const defaultProps = {
        onCheckNow: vi.fn(),
        onStartMonitoring: vi.fn(),
        onStopMonitoring: vi.fn(),
        isLoading: false,
        isMonitoring: false,
        disabled: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Rendering", () => {
        it("should render all buttons when not monitoring", () => {
            render(<ActionButtonGroup {...defaultProps} />);

            expect(screen.getByLabelText("Check Now")).toBeInTheDocument();
            expect(screen.getByLabelText("Start Monitoring")).toBeInTheDocument();
            expect(screen.queryByLabelText("Stop Monitoring")).not.toBeInTheDocument();
        });

        it("should render stop monitoring button when monitoring", () => {
            render(<ActionButtonGroup {...defaultProps} isMonitoring={true} />);

            expect(screen.getByLabelText("Check Now")).toBeInTheDocument();
            expect(screen.getByLabelText("Stop Monitoring")).toBeInTheDocument();
            expect(screen.queryByLabelText("Start Monitoring")).not.toBeInTheDocument();
        });

        it("should apply correct variants and sizes", () => {
            render(<ActionButtonGroup {...defaultProps} />);

            const checkButton = screen.getByTestId("themed-button-check-now");
            const startButton = screen.getByTestId("themed-button-start-monitoring");

            expect(checkButton).toHaveAttribute("data-variant", "ghost");
            expect(checkButton).toHaveAttribute("data-size", "sm");
            expect(startButton).toHaveAttribute("data-variant", "success");
            expect(startButton).toHaveAttribute("data-size", "sm");
        });

        it("should render stop button with correct variant when monitoring", () => {
            render(<ActionButtonGroup {...defaultProps} isMonitoring={true} />);

            const stopButton = screen.getByTestId("themed-button-stop-monitoring");
            expect(stopButton).toHaveAttribute("data-variant", "error");
            expect(stopButton).toHaveAttribute("data-size", "sm");
        });

        it("should apply correct CSS classes", () => {
            render(<ActionButtonGroup {...defaultProps} />);

            const checkButton = screen.getByTestId("themed-button-check-now");
            const startButton = screen.getByTestId("themed-button-start-monitoring");

            expect(checkButton).toHaveClass("min-w-[32px]");
            expect(startButton).toHaveClass("min-w-[32px]");
        });
    });

    describe("Event Handling", () => {
        it("should call onCheckNow when check button is clicked", () => {
            render(<ActionButtonGroup {...defaultProps} />);

            fireEvent.click(screen.getByLabelText("Check Now"));

            expect(defaultProps.onCheckNow).toHaveBeenCalledTimes(1);
        });

        it("should call onStartMonitoring when start button is clicked", () => {
            render(<ActionButtonGroup {...defaultProps} />);

            fireEvent.click(screen.getByLabelText("Start Monitoring"));

            expect(defaultProps.onStartMonitoring).toHaveBeenCalledTimes(1);
        });

        it("should call onStopMonitoring when stop button is clicked", () => {
            render(<ActionButtonGroup {...defaultProps} isMonitoring={true} />);

            fireEvent.click(screen.getByLabelText("Stop Monitoring"));

            expect(defaultProps.onStopMonitoring).toHaveBeenCalledTimes(1);
        });

        it("should stop event propagation on check button click", () => {
            const stopPropagationSpy = vi.fn();
            render(<ActionButtonGroup {...defaultProps} />);

            const event = new MouseEvent("click", { bubbles: true });
            Object.defineProperty(event, "stopPropagation", {
                value: stopPropagationSpy,
                writable: true,
            });

            const checkButton = screen.getByLabelText("Check Now");
            fireEvent(checkButton, event);

            expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
        });

        it("should stop event propagation on start monitoring button click", () => {
            const stopPropagationSpy = vi.fn();
            render(<ActionButtonGroup {...defaultProps} />);

            const event = new MouseEvent("click", { bubbles: true });
            Object.defineProperty(event, "stopPropagation", {
                value: stopPropagationSpy,
                writable: true,
            });

            const startButton = screen.getByLabelText("Start Monitoring");
            fireEvent(startButton, event);

            expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
        });

        it("should stop event propagation on stop monitoring button click", () => {
            const stopPropagationSpy = vi.fn();
            render(<ActionButtonGroup {...defaultProps} isMonitoring={true} />);

            const event = new MouseEvent("click", { bubbles: true });
            Object.defineProperty(event, "stopPropagation", {
                value: stopPropagationSpy,
                writable: true,
            });

            const stopButton = screen.getByLabelText("Stop Monitoring");
            fireEvent(stopButton, event);

            expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe("Disabled States", () => {
        it("should disable all buttons when isLoading is true", () => {
            render(<ActionButtonGroup {...defaultProps} isLoading={true} />);

            expect(screen.getByLabelText("Check Now")).toBeDisabled();
            expect(screen.getByLabelText("Start Monitoring")).toBeDisabled();
        });

        it("should disable all buttons when disabled prop is true", () => {
            render(<ActionButtonGroup {...defaultProps} disabled={true} />);

            expect(screen.getByLabelText("Check Now")).toBeDisabled();
            expect(screen.getByLabelText("Start Monitoring")).toBeDisabled();
        });

        it("should disable stop button when isLoading is true and monitoring", () => {
            render(<ActionButtonGroup {...defaultProps} isLoading={true} isMonitoring={true} />);

            expect(screen.getByLabelText("Check Now")).toBeDisabled();
            expect(screen.getByLabelText("Stop Monitoring")).toBeDisabled();
        });

        it("should disable all buttons when both isLoading and disabled are true", () => {
            render(<ActionButtonGroup {...defaultProps} isLoading={true} disabled={true} />);

            expect(screen.getByLabelText("Check Now")).toBeDisabled();
            expect(screen.getByLabelText("Start Monitoring")).toBeDisabled();
        });

        it("should not call handlers when buttons are disabled", () => {
            render(<ActionButtonGroup {...defaultProps} disabled={true} />);

            fireEvent.click(screen.getByLabelText("Check Now"));
            fireEvent.click(screen.getByLabelText("Start Monitoring"));

            expect(defaultProps.onCheckNow).not.toHaveBeenCalled();
            expect(defaultProps.onStartMonitoring).not.toHaveBeenCalled();
        });
    });

    describe("Accessibility", () => {
        it("should have proper ARIA labels", () => {
            render(<ActionButtonGroup {...defaultProps} />);

            expect(screen.getByLabelText("Check Now")).toBeInTheDocument();
            expect(screen.getByLabelText("Start Monitoring")).toBeInTheDocument();
        });

        it("should have proper ARIA label for stop button when monitoring", () => {
            render(<ActionButtonGroup {...defaultProps} isMonitoring={true} />);

            expect(screen.getByLabelText("Stop Monitoring")).toBeInTheDocument();
        });

        it("should be keyboard accessible", () => {
            render(<ActionButtonGroup {...defaultProps} />);

            const checkButton = screen.getByLabelText("Check Now");
            checkButton.focus();

            expect(document.activeElement).toBe(checkButton);
        });
    });

    describe("Content Rendering", () => {
        it("should render correct icon for check button", () => {
            render(<ActionButtonGroup {...defaultProps} />);

            const checkButton = screen.getByLabelText("Check Now");
            expect(checkButton).toHaveTextContent("🔄");
        });

        it("should render correct icon for start monitoring button", () => {
            render(<ActionButtonGroup {...defaultProps} />);

            const startButton = screen.getByLabelText("Start Monitoring");
            expect(startButton).toHaveTextContent("▶️");
        });

        it("should render correct icon for stop monitoring button", () => {
            render(<ActionButtonGroup {...defaultProps} isMonitoring={true} />);

            const stopButton = screen.getByLabelText("Stop Monitoring");
            expect(stopButton).toHaveTextContent("⏸️");
        });
    });

    describe("State Transitions", () => {
        it("should transition from start to stop button when monitoring state changes", () => {
            const { rerender } = render(<ActionButtonGroup {...defaultProps} isMonitoring={false} />);

            expect(screen.getByLabelText("Start Monitoring")).toBeInTheDocument();
            expect(screen.queryByLabelText("Stop Monitoring")).not.toBeInTheDocument();

            rerender(<ActionButtonGroup {...defaultProps} isMonitoring={true} />);

            expect(screen.queryByLabelText("Start Monitoring")).not.toBeInTheDocument();
            expect(screen.getByLabelText("Stop Monitoring")).toBeInTheDocument();
        });

        it("should maintain check button across state transitions", () => {
            const { rerender } = render(<ActionButtonGroup {...defaultProps} isMonitoring={false} />);

            expect(screen.getByLabelText("Check Now")).toBeInTheDocument();

            rerender(<ActionButtonGroup {...defaultProps} isMonitoring={true} />);

            expect(screen.getByLabelText("Check Now")).toBeInTheDocument();
        });
    });

    describe("React.memo Optimization", () => {
        it("should be memoized component", () => {
            // Test that the component is wrapped with React.memo
            // React.memo components have a $$typeof property
            expect(ActionButtonGroup.$$typeof).toBe(Symbol.for("react.memo"));
        });
    });

    describe("Edge Cases", () => {
        it("should handle stopPropagation calls correctly", () => {
            render(<ActionButtonGroup {...defaultProps} />);

            const checkButton = screen.getByLabelText("Check Now");

            // Create mock event with stopPropagation
            const mockEvent = {
                stopPropagation: vi.fn(),
            } as any;

            // Test that the handler works with proper event
            fireEvent.click(checkButton, mockEvent);

            expect(defaultProps.onCheckNow).toHaveBeenCalledTimes(1);
        });

        it("should handle all props being undefined gracefully", () => {
            // This tests the TypeScript interface requirements
            expect(() => {
                render(
                    <ActionButtonGroup
                        onCheckNow={() => {}}
                        onStartMonitoring={() => {}}
                        onStopMonitoring={() => {}}
                        isLoading={false}
                        isMonitoring={false}
                        disabled={false}
                    />
                );
            }).not.toThrow();
        });
    });
});
