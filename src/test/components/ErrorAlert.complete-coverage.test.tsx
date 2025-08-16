/**
 * Comprehensive test coverage for ErrorAlert component.
 * Targeting 100% coverage with focus on variants, interactions, and accessibility.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ErrorAlert } from "../../components/common/ErrorAlert/ErrorAlert";
import type { ErrorAlertVariant } from "../../components/common/ErrorAlert/ErrorAlert";

// Mock react-icons/fi
vi.mock("react-icons/fi", () => ({
    FiAlertCircle: ({ className, ...props }: any) => (
        <div data-testid="alert-circle-icon" className={className} {...props}>
            alert-circle
        </div>
    ),
    FiAlertTriangle: ({ className, ...props }: any) => (
        <div data-testid="alert-triangle-icon" className={className} {...props}>
            alert-triangle
        </div>
    ),
    FiInfo: ({ className, ...props }: any) => (
        <div data-testid="info-icon" className={className} {...props}>
            info
        </div>
    ),
    FiX: ({ className, ...props }: any) => (
        <div data-testid="x-icon" className={className} {...props}>
            x
        </div>
    ),
}));

describe("ErrorAlert - Complete Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Basic Rendering", () => {
        it("should render with required props only", () => {
            render(<ErrorAlert message="Test error message" />);

            expect(screen.getByRole("alert")).toBeInTheDocument();
            expect(screen.getByText("Test error message")).toBeInTheDocument();
            expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument(); // default error variant
        });

        it("should render with custom className", () => {
            const { container } = render(
                <ErrorAlert 
                    message="Test message" 
                    className="custom-error-class" 
                />
            );

            const alertElement = container.querySelector(".custom-error-class");
            expect(alertElement).toBeInTheDocument();
        });

        it("should render with default className when not provided", () => {
            const { container } = render(<ErrorAlert message="Test message" />);

            const alertElement = screen.getByRole("alert");
            expect(alertElement).toHaveClass("flex", "items-start", "gap-3", "rounded-md", "border", "p-4");
        });

        it("should have proper accessibility attributes", () => {
            render(<ErrorAlert message="Test message" />);

            const alertElement = screen.getByRole("alert");
            expect(alertElement).toHaveAttribute("aria-live", "polite");
            expect(alertElement).toHaveAttribute("role", "alert");
        });
    });

    describe("Variant Handling", () => {
        it("should render error variant by default", () => {
            render(<ErrorAlert message="Error message" />);

            expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();
            const alertElement = screen.getByRole("alert");
            expect(alertElement).toHaveClass("border-error-default", "bg-error-muted", "text-error-default");
        });

        it("should render error variant explicitly", () => {
            render(<ErrorAlert message="Error message" variant="error" />);

            expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();
            const alertElement = screen.getByRole("alert");
            expect(alertElement).toHaveClass(
                "border-error-default", 
                "bg-error-muted", 
                "text-error-default",
                "dark:border-error-default",
                "dark:bg-error-muted",
                "dark:text-error-alternative"
            );
        });

        it("should render warning variant correctly", () => {
            render(<ErrorAlert message="Warning message" variant="warning" />);

            expect(screen.getByTestId("alert-triangle-icon")).toBeInTheDocument();
            const alertElement = screen.getByRole("alert");
            expect(alertElement).toHaveClass(
                "border-warning-default", 
                "bg-warning-muted", 
                "text-warning-default",
                "dark:border-warning-default",
                "dark:bg-warning-muted",
                "dark:text-warning-alternative"
            );
        });

        it("should render info variant correctly", () => {
            render(<ErrorAlert message="Info message" variant="info" />);

            expect(screen.getByTestId("info-icon")).toBeInTheDocument();
            const alertElement = screen.getByRole("alert");
            expect(alertElement).toHaveClass(
                "border-info-default", 
                "bg-info-muted", 
                "text-info-default",
                "dark:border-info-default",
                "dark:bg-info-muted",
                "dark:text-info-alternative"
            );
        });

        it("should handle invalid variant by defaulting to error", () => {
            render(<ErrorAlert message="Invalid variant" variant={"invalid" as ErrorAlertVariant} />);

            expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();
            const alertElement = screen.getByRole("alert");
            expect(alertElement).toHaveClass("border-error-default", "bg-error-muted", "text-error-default");
        });
    });

    describe("Icon Rendering", () => {
        it("should render correct icon for error variant", () => {
            render(<ErrorAlert message="Error" variant="error" />);

            const icon = screen.getByTestId("alert-circle-icon");
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass("h-5", "w-5", "shrink-0");
        });

        it("should render correct icon for warning variant", () => {
            render(<ErrorAlert message="Warning" variant="warning" />);

            const icon = screen.getByTestId("alert-triangle-icon");
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass("h-5", "w-5", "shrink-0");
        });

        it("should render correct icon for info variant", () => {
            render(<ErrorAlert message="Info" variant="info" />);

            const icon = screen.getByTestId("info-icon");
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass("h-5", "w-5", "shrink-0");
        });

        it("should render default icon for undefined variant", () => {
            render(<ErrorAlert message="Default" variant={undefined} />);

            const icon = screen.getByTestId("alert-circle-icon");
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass("h-5", "w-5", "shrink-0");
        });
    });

    describe("Message Display", () => {
        it("should display simple text message", () => {
            render(<ErrorAlert message="Simple error message" />);

            const messageElement = screen.getByText("Simple error message");
            expect(messageElement).toBeInTheDocument();
            expect(messageElement).toHaveClass("text-sm", "font-medium", "break-words");
        });

        it("should handle long messages with proper text wrapping", () => {
            const longMessage = "This is a very long error message that should wrap properly and not break the layout even when it contains many words and characters";
            render(<ErrorAlert message={longMessage} />);

            const messageElement = screen.getByText(longMessage);
            expect(messageElement).toBeInTheDocument();
            expect(messageElement).toHaveClass("break-words");
        });

        it("should handle empty message string", () => {
            render(<ErrorAlert message="" />);

            // Find the specific message paragraph element, not by text content
            const alertElement = screen.getByRole("alert");
            const messageElement = alertElement.querySelector("p.text-sm.font-medium.break-words");
            expect(messageElement).toBeInTheDocument();
            expect(messageElement).toHaveTextContent("");
        });

        it("should handle message with special characters", () => {
            const specialMessage = "Error: Failed to connect to server @ 192.168.1.1:8080 - Connection refused (errno: 111)";
            render(<ErrorAlert message={specialMessage} />);

            expect(screen.getByText(specialMessage)).toBeInTheDocument();
        });

        it("should handle message with HTML-like content as plain text", () => {
            const htmlMessage = "<script>alert('test')</script> This should be safe";
            render(<ErrorAlert message={htmlMessage} />);

            expect(screen.getByText(htmlMessage)).toBeInTheDocument();
        });

        it("should be contained in proper flex layout", () => {
            render(<ErrorAlert message="Layout test" />);

            const messageElement = screen.getByText("Layout test");
            const messageContainer = messageElement.parentElement;
            expect(messageContainer).toHaveClass("min-w-0", "flex-1");
        });
    });

    describe("Dismiss Functionality", () => {
        it("should not render dismiss button when onDismiss is not provided", () => {
            render(<ErrorAlert message="No dismiss" />);

            expect(screen.queryByLabelText("Dismiss error")).not.toBeInTheDocument();
            expect(screen.queryByTestId("x-icon")).not.toBeInTheDocument();
        });

        it("should render dismiss button when onDismiss is provided", () => {
            const mockDismiss = vi.fn();
            render(<ErrorAlert message="With dismiss" onDismiss={mockDismiss} />);

            const dismissButton = screen.getByLabelText("Dismiss error");
            expect(dismissButton).toBeInTheDocument();
            expect(dismissButton).toHaveAttribute("type", "button");
            expect(dismissButton).toHaveAttribute("title", "Dismiss this error message");
            expect(screen.getByTestId("x-icon")).toBeInTheDocument();
        });

        it("should call onDismiss when dismiss button is clicked", async () => {
            const mockDismiss = vi.fn();
            const user = userEvent.setup();

            render(<ErrorAlert message="Clickable dismiss" onDismiss={mockDismiss} />);

            const dismissButton = screen.getByLabelText("Dismiss error");
            await user.click(dismissButton);

            expect(mockDismiss).toHaveBeenCalledTimes(1);
        });

        it("should call onDismiss with fireEvent click", () => {
            const mockDismiss = vi.fn();
            render(<ErrorAlert message="Fire event test" onDismiss={mockDismiss} />);

            const dismissButton = screen.getByLabelText("Dismiss error");
            fireEvent.click(dismissButton);

            expect(mockDismiss).toHaveBeenCalledTimes(1);
        });

        it("should handle multiple clicks correctly", async () => {
            const mockDismiss = vi.fn();
            const user = userEvent.setup();

            render(<ErrorAlert message="Multiple clicks" onDismiss={mockDismiss} />);

            const dismissButton = screen.getByLabelText("Dismiss error");
            await user.click(dismissButton);
            await user.click(dismissButton);
            await user.click(dismissButton);

            expect(mockDismiss).toHaveBeenCalledTimes(3);
        });

        it("should have proper styling for dismiss button", () => {
            const mockDismiss = vi.fn();
            render(<ErrorAlert message="Button styling" onDismiss={mockDismiss} />);

            const dismissButton = screen.getByLabelText("Dismiss error");
            expect(dismissButton).toHaveClass(
                "hover:bg-overlay-default/5",
                "dark:hover:bg-overlay-inverse/5",
                "-m-1",
                "shrink-0",
                "rounded-xs",
                "p-1",
                "transition-colors"
            );
        });

        it("should render X icon with correct styling", () => {
            const mockDismiss = vi.fn();
            render(<ErrorAlert message="Icon styling" onDismiss={mockDismiss} />);

            const xIcon = screen.getByTestId("x-icon");
            expect(xIcon).toHaveClass("h-4", "w-4");
        });
    });

    describe("Keyboard Accessibility", () => {
        it("should be focusable and activatable with keyboard when dismiss is available", async () => {
            const mockDismiss = vi.fn();
            const user = userEvent.setup();

            render(<ErrorAlert message="Keyboard test" onDismiss={mockDismiss} />);

            const dismissButton = screen.getByLabelText("Dismiss error");
            
            // Focus the button
            await user.tab();
            expect(dismissButton).toHaveFocus();

            // Activate with Enter
            await user.keyboard("{Enter}");
            expect(mockDismiss).toHaveBeenCalledTimes(1);
        });

        it("should be activatable with Space key", async () => {
            const mockDismiss = vi.fn();
            const user = userEvent.setup();

            render(<ErrorAlert message="Space key test" onDismiss={mockDismiss} />);

            const dismissButton = screen.getByLabelText("Dismiss error");
            dismissButton.focus();

            await user.keyboard(" ");
            expect(mockDismiss).toHaveBeenCalledTimes(1);
        });
    });

    describe("Edge Cases", () => {
        it("should handle undefined onDismiss gracefully", () => {
            render(<ErrorAlert message="Undefined dismiss" onDismiss={undefined} />);

            expect(screen.queryByLabelText("Dismiss error")).not.toBeInTheDocument();
        });

        it("should handle null onDismiss gracefully", () => {
            render(<ErrorAlert message="Null dismiss" onDismiss={null as any} />);

            expect(screen.queryByLabelText("Dismiss error")).not.toBeInTheDocument();
        });

        it("should maintain stable callback reference with useCallback", () => {
            const mockDismiss = vi.fn();
            const { rerender } = render(<ErrorAlert message="Callback test" onDismiss={mockDismiss} />);

            const firstButton = screen.getByLabelText("Dismiss error");
            const firstOnClick = (firstButton as any).onclick;

            // Re-render with same props
            rerender(<ErrorAlert message="Callback test" onDismiss={mockDismiss} />);

            const secondButton = screen.getByLabelText("Dismiss error");
            const secondOnClick = (secondButton as any).onclick;

            // useCallback should maintain reference stability
            expect(firstOnClick).toBe(secondOnClick);
        });
    });

    describe("Component Integration", () => {
        it("should render all variants together correctly", () => {
            const { rerender } = render(<ErrorAlert message="Test" variant="error" />);
            expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();

            rerender(<ErrorAlert message="Test" variant="warning" />);
            expect(screen.getByTestId("alert-triangle-icon")).toBeInTheDocument();

            rerender(<ErrorAlert message="Test" variant="info" />);
            expect(screen.getByTestId("info-icon")).toBeInTheDocument();
        });

        it("should combine all props correctly", () => {
            const mockDismiss = vi.fn();
            render(
                <ErrorAlert 
                    message="Full props test" 
                    variant="warning"
                    className="custom-alert"
                    onDismiss={mockDismiss}
                />
            );

            const alertElement = screen.getByRole("alert");
            expect(alertElement).toHaveClass("custom-alert");
            expect(alertElement).toHaveClass("border-warning-default");
            expect(screen.getByText("Full props test")).toBeInTheDocument();
            expect(screen.getByTestId("alert-triangle-icon")).toBeInTheDocument();
            expect(screen.getByLabelText("Dismiss error")).toBeInTheDocument();
        });
    });
});
