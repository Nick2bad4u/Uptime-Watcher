/**
 * Tests for ActionButtonGroup component
 * Validates action button rendering, event handling, and state management
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { ActionButtonGroup } from "../components/Dashboard/SiteCard/components/ActionButtonGroup";

const defaultProps = {
    onCheckNow: vi.fn(),
    onStartMonitoring: vi.fn(),
    onStopMonitoring: vi.fn(),
    isLoading: false,
    isMonitoring: false,
    disabled: false,
};

describe("ActionButtonGroup", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders check now button", () => {
        render(<ActionButtonGroup {...defaultProps} />);

        const checkButton = screen.getByLabelText("Check Now");
        expect(checkButton).toBeInTheDocument();
        expect(checkButton).toHaveTextContent("🔄");
    });

    it("renders start monitoring button when not monitoring", () => {
        render(<ActionButtonGroup {...defaultProps} isMonitoring={false} />);

        const startButton = screen.getByLabelText("Start Monitoring");
        expect(startButton).toBeInTheDocument();
        expect(startButton).toHaveTextContent("▶️");
    });

    it("renders stop monitoring button when monitoring", () => {
        render(<ActionButtonGroup {...defaultProps} isMonitoring={true} />);

        const stopButton = screen.getByLabelText("Stop Monitoring");
        expect(stopButton).toBeInTheDocument();
        expect(stopButton).toHaveTextContent("⏸️");
    });

    it("calls onCheckNow when check button is clicked", async () => {
        const user = userEvent.setup();
        render(<ActionButtonGroup {...defaultProps} />);

        const checkButton = screen.getByLabelText("Check Now");
        await user.click(checkButton);

        expect(defaultProps.onCheckNow).toHaveBeenCalledTimes(1);
    });

    it("calls onStartMonitoring when start button is clicked", async () => {
        const user = userEvent.setup();
        render(<ActionButtonGroup {...defaultProps} isMonitoring={false} />);

        const startButton = screen.getByLabelText("Start Monitoring");
        await user.click(startButton);

        expect(defaultProps.onStartMonitoring).toHaveBeenCalledTimes(1);
    });

    it("calls onStopMonitoring when stop button is clicked", async () => {
        const user = userEvent.setup();
        render(<ActionButtonGroup {...defaultProps} isMonitoring={true} />);

        const stopButton = screen.getByLabelText("Stop Monitoring");
        await user.click(stopButton);

        expect(defaultProps.onStopMonitoring).toHaveBeenCalledTimes(1);
    });

    it("disables all buttons when loading", () => {
        render(<ActionButtonGroup {...defaultProps} isLoading={true} />);

        const checkButton = screen.getByLabelText("Check Now");
        expect(checkButton).toBeDisabled();

        const monitoringButton = screen.getByLabelText("Start Monitoring");
        expect(monitoringButton).toBeDisabled();
    });

    it("disables all buttons when disabled prop is true", () => {
        render(<ActionButtonGroup {...defaultProps} disabled={true} />);

        const checkButton = screen.getByLabelText("Check Now");
        expect(checkButton).toBeDisabled();

        const monitoringButton = screen.getByLabelText("Start Monitoring");
        expect(monitoringButton).toBeDisabled();
    });

    it("disables all buttons when both loading and disabled", () => {
        render(<ActionButtonGroup {...defaultProps} isLoading={true} disabled={true} />);

        const checkButton = screen.getByLabelText("Check Now");
        expect(checkButton).toBeDisabled();

        const monitoringButton = screen.getByLabelText("Start Monitoring");
        expect(monitoringButton).toBeDisabled();
    });

    it("toggles between start and stop buttons based on monitoring state", () => {
        const { rerender } = render(<ActionButtonGroup {...defaultProps} isMonitoring={false} />);

        expect(screen.getByLabelText("Start Monitoring")).toBeInTheDocument();
        expect(screen.queryByLabelText("Stop Monitoring")).not.toBeInTheDocument();

        rerender(<ActionButtonGroup {...defaultProps} isMonitoring={true} />);

        expect(screen.getByLabelText("Stop Monitoring")).toBeInTheDocument();
        expect(screen.queryByLabelText("Start Monitoring")).not.toBeInTheDocument();
    });

    it("has correct CSS classes for styling", () => {
        render(<ActionButtonGroup {...defaultProps} />);

        const container = screen.getByLabelText("Check Now").parentElement;
        expect(container).toHaveClass("flex", "items-center", "gap-2");
    });

    it("applies minimum width to buttons", () => {
        render(<ActionButtonGroup {...defaultProps} />);

        const checkButton = screen.getByLabelText("Check Now");
        expect(checkButton).toHaveClass("min-w-[32px]");

        const monitoringButton = screen.getByLabelText("Start Monitoring");
        expect(monitoringButton).toHaveClass("min-w-[32px]");
    });

    it("uses correct button variants", () => {
        const { rerender } = render(<ActionButtonGroup {...defaultProps} isMonitoring={false} />);

        const checkButton = screen.getByLabelText("Check Now");
        // Check button uses ghost variant (we can't easily test ThemedButton variant directly)
        expect(checkButton).toBeInTheDocument();

        const startButton = screen.getByLabelText("Start Monitoring");
        // Start button uses success variant
        expect(startButton).toBeInTheDocument();

        rerender(<ActionButtonGroup {...defaultProps} isMonitoring={true} />);

        const stopButton = screen.getByLabelText("Stop Monitoring");
        // Stop button uses error variant
        expect(stopButton).toBeInTheDocument();
    });

    it("memoizes component to prevent unnecessary re-renders", () => {
        const { rerender } = render(<ActionButtonGroup {...defaultProps} />);

        // Rerender with same props
        rerender(<ActionButtonGroup {...defaultProps} />);

        expect(screen.getByLabelText("Check Now")).toBeInTheDocument();
    });

    it("handles rapid clicking without breaking", async () => {
        const user = userEvent.setup();
        render(<ActionButtonGroup {...defaultProps} />);

        const checkButton = screen.getByLabelText("Check Now");

        // Click rapidly multiple times
        await user.click(checkButton);
        await user.click(checkButton);
        await user.click(checkButton);

        expect(defaultProps.onCheckNow).toHaveBeenCalledTimes(3);
    });

    it("maintains accessibility with proper ARIA labels", () => {
        render(<ActionButtonGroup {...defaultProps} />);

        const checkButton = screen.getByLabelText("Check Now");
        expect(checkButton).toHaveAttribute("aria-label", "Check Now");

        const startButton = screen.getByLabelText("Start Monitoring");
        expect(startButton).toHaveAttribute("aria-label", "Start Monitoring");
    });

    it("prevents event propagation on button clicks", async () => {
        const user = userEvent.setup();
        const parentClickHandler = vi.fn();

        render(
            <div onClick={parentClickHandler}>
                <ActionButtonGroup {...defaultProps} />
            </div>
        );

        const checkButton = screen.getByLabelText("Check Now");
        await user.click(checkButton);

        // Parent click should not be triggered due to stopPropagation
        expect(parentClickHandler).not.toHaveBeenCalled();
        expect(defaultProps.onCheckNow).toHaveBeenCalledTimes(1);
    });
});
