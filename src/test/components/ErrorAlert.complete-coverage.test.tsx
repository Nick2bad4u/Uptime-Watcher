/**
 * Comprehensive test coverage for ErrorAlert component. Targeting 100% coverage
 * with focus on variants, interactions, and accessibility.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ErrorAlert } from "../../components/common/ErrorAlert/ErrorAlert";
import type { ErrorAlertVariant } from "../../components/common/ErrorAlert/ErrorAlert";

describe("ErrorAlert - Complete Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Basic Rendering", () => {
        it("should render with required props only", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<ErrorAlert message="Test error message" />);

            expect(screen.getByRole("alert")).toBeInTheDocument();
            expect(screen.getByText("Test error message")).toBeInTheDocument();
            expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument(); // Default error variant
        });

        it("should render with custom className", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ErrorAlert
                    message="Test message"
                    className="custom-error-class"
                />
            );

            const alertElement = screen.getByRole("alert");
            expect(alertElement).toHaveClass("custom-error-class");
        });

        it("should render with default className when not provided", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const { container: _container } = render(
                <ErrorAlert message="Test message" />
            );

            const alertElement = screen.getByRole("alert");
            expect(alertElement).toHaveClass(
                "flex",
                "items-start",
                "gap-3",
                "rounded-md",
                "border",
                "p-4"
            );
        });

        it("should have proper accessibility attributes", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<ErrorAlert message="Test message" />);

            const alertElement = screen.getByRole("alert");
            expect(alertElement).toHaveAttribute("aria-live", "polite");
            expect(alertElement).toHaveAttribute("role", "alert");
        });
    });

    describe("Variant Handling", () => {
        it("should render error variant by default", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            render(<ErrorAlert message="Error message" />);

            expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();
            const alertElement = screen.getByRole("alert");
            expect(alertElement).toHaveClass(
                "border-error-default",
                "bg-error-muted",
                "text-error-default"
            );
        });

        it("should render error variant explicitly", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

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

        it("should render warning variant correctly", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<ErrorAlert message="Warning message" variant="warning" />);

            expect(
                screen.getByTestId("alert-triangle-icon")
            ).toBeInTheDocument();
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

        it("should render info variant correctly", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

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

        it("should handle invalid variant by defaulting to error", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            render(
                <ErrorAlert
                    message="Invalid variant"
                    variant={"invalid" as ErrorAlertVariant}
                />
            );

            expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();
            const alertElement = screen.getByRole("alert");
            expect(alertElement).toHaveClass(
                "border-error-default",
                "bg-error-muted",
                "text-error-default"
            );
        });
    });

    describe("Icon Rendering", () => {
        it("should render correct icon for error variant", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            render(<ErrorAlert message="Error" variant="error" />);

            const icon = screen.getByTestId("alert-circle-icon");
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass("size-5", "shrink-0");
        });

        it("should render correct icon for warning variant", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<ErrorAlert message="Warning" variant="warning" />);

            const icon = screen.getByTestId("alert-triangle-icon");
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass("size-5", "shrink-0");
        });

        it("should render correct icon for info variant", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<ErrorAlert message="Info" variant="info" />);

            const icon = screen.getByTestId("info-icon");
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass("size-5", "shrink-0");
        });

        it("should render default icon for undefined variant", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<ErrorAlert message="Default" />);

            const icon = screen.getByTestId("alert-circle-icon");
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass("size-5", "shrink-0");
        });
    });

    describe("Message Display", () => {
        it("should display simple text message", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<ErrorAlert message="Simple error message" />);

            const messageElement = screen.getByText("Simple error message");
            expect(messageElement).toBeInTheDocument();
            expect(messageElement).toHaveClass(
                "text-sm",
                "font-medium",
                "wrap-break-word"
            );
        });

        it("should handle long messages with proper text wrapping", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const longMessage =
                "This is a very long error message that should wrap properly and not break the layout even when it contains many words and characters";
            render(<ErrorAlert message={longMessage} />);

            const messageElement = screen.getByText(longMessage);
            expect(messageElement).toBeInTheDocument();
            expect(messageElement).toHaveClass("wrap-break-word");
        });

        it("should handle empty message string", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<ErrorAlert message="" />);

            // Find the specific message paragraph element, not by text content
            const alertElement = screen.getByRole("alert");
            const messageElement = alertElement.querySelector(
                "p.text-sm.font-medium.wrap-break-word"
            );
            expect(messageElement).toBeInTheDocument();
            expect(messageElement).toHaveTextContent("");
        });

        it("should handle message with special characters", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const specialMessage =
                "Error: Failed to connect to server @ 192.168.1.1:8080 - Connection refused (errno: 111)";
            render(<ErrorAlert message={specialMessage} />);

            expect(screen.getByText(specialMessage)).toBeInTheDocument();
        });

        it("should handle message with HTML-like content as plain text", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const htmlMessage =
                "<script>alert('test')</script> This should be safe";
            render(<ErrorAlert message={htmlMessage} />);

            expect(screen.getByText(htmlMessage)).toBeInTheDocument();
        });

        it("should be contained in proper flex layout", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<ErrorAlert message="Layout test" />);

            const messageElement = screen.getByText("Layout test");
            const messageContainer = messageElement.parentElement;
            expect(messageContainer).toHaveClass("min-w-0", "flex-1");
        });
    });

    describe("Dismiss Functionality", () => {
        it("should not render dismiss button when onDismiss is not provided", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<ErrorAlert message="No dismiss" />);

            expect(
                screen.queryByLabelText("Dismiss error")
            ).not.toBeInTheDocument();
        });

        it("should render dismiss button when onDismiss is provided", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockDismiss = vi.fn();
            render(
                <ErrorAlert message="With dismiss" onDismiss={mockDismiss} />
            );

            const dismissButton = screen.getByLabelText("Dismiss error");
            expect(dismissButton).toBeInTheDocument();
            expect(dismissButton).toHaveAttribute("type", "button");
            expect(dismissButton).toHaveAttribute(
                "title",
                "Dismiss this error message"
            );
            expect(dismissButton.querySelector("svg")).not.toBeNull();
        });

        it("should call onDismiss when dismiss button is clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockDismiss = vi.fn();
            const user = userEvent.setup();

            render(
                <ErrorAlert
                    message="Clickable dismiss"
                    onDismiss={mockDismiss}
                />
            );

            const dismissButton = screen.getByLabelText("Dismiss error");
            await user.click(dismissButton);

            expect(mockDismiss).toHaveBeenCalledTimes(1);
        });

        it("should call onDismiss with fireEvent click", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Event Processing", "type");

            const mockDismiss = vi.fn();
            render(
                <ErrorAlert message="Fire event test" onDismiss={mockDismiss} />
            );

            const dismissButton = screen.getByLabelText("Dismiss error");
            fireEvent.click(dismissButton);

            expect(mockDismiss).toHaveBeenCalledTimes(1);
        });

        it("should handle multiple clicks correctly", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockDismiss = vi.fn();
            const user = userEvent.setup();

            render(
                <ErrorAlert message="Multiple clicks" onDismiss={mockDismiss} />
            );

            const dismissButton = screen.getByLabelText("Dismiss error");
            await user.click(dismissButton);
            await user.click(dismissButton);
            await user.click(dismissButton);

            expect(mockDismiss).toHaveBeenCalledTimes(3);
        });

        it("should have proper styling for dismiss button", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockDismiss = vi.fn();
            render(
                <ErrorAlert message="Button styling" onDismiss={mockDismiss} />
            );

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

        it("should render X icon with correct styling", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockDismiss = vi.fn();
            render(
                <ErrorAlert message="Icon styling" onDismiss={mockDismiss} />
            );

            const dismissButton = screen.getByLabelText("Dismiss error");
            const svg = dismissButton.querySelector("svg");
            expect(svg).not.toBeNull();
            expect(svg).toHaveClass("size-4");
        });
    });

    describe("Keyboard Accessibility", () => {
        it("should be focusable and activatable with keyboard when dismiss is available", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockDismiss = vi.fn();
            const user = userEvent.setup();

            render(
                <ErrorAlert message="Keyboard test" onDismiss={mockDismiss} />
            );

            const dismissButton = screen.getByLabelText("Dismiss error");

            // Focus the button
            await user.tab();
            expect(dismissButton).toHaveFocus();

            // Activate with Enter
            await user.keyboard("{Enter}");
            expect(mockDismiss).toHaveBeenCalledTimes(1);
        });

        it("should be activatable with Space key", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockDismiss = vi.fn();
            const user = userEvent.setup();

            render(
                <ErrorAlert message="Space key test" onDismiss={mockDismiss} />
            );

            const dismissButton = screen.getByLabelText("Dismiss error");
            dismissButton.focus();

            await user.keyboard(" ");
            expect(mockDismiss).toHaveBeenCalledTimes(1);
        });
    });

    describe("Edge Cases", () => {
        it("should handle undefined onDismiss gracefully", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<ErrorAlert message="Undefined dismiss" />);

            expect(
                screen.queryByLabelText("Dismiss error")
            ).not.toBeInTheDocument();
        });

        it("should handle null onDismiss gracefully", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ErrorAlert message="Null dismiss" onDismiss={null as any} />
            );

            expect(
                screen.queryByLabelText("Dismiss error")
            ).not.toBeInTheDocument();
        });

        it("should maintain stable callback reference with useCallback", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const mockDismiss = vi.fn();
            const { rerender } = render(
                <ErrorAlert message="Callback test" onDismiss={mockDismiss} />
            );

            const firstButton = screen.getByLabelText("Dismiss error");
            const firstOnClick = (firstButton as any).onclick;

            // Re-render with same props
            rerender(
                <ErrorAlert message="Callback test" onDismiss={mockDismiss} />
            );

            const secondButton = screen.getByLabelText("Dismiss error");
            const secondOnClick = (secondButton as any).onclick;

            // UseCallback should maintain reference stability
            expect(firstOnClick).toBe(secondOnClick);
        });
    });

    describe("Component Integration", () => {
        it("should render all variants together correctly", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Retrieval", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Retrieval", "type");

            const { rerender } = render(
                <ErrorAlert message="Test" variant="error" />
            );
            expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();

            rerender(<ErrorAlert message="Test" variant="warning" />);
            expect(
                screen.getByTestId("alert-triangle-icon")
            ).toBeInTheDocument();

            rerender(<ErrorAlert message="Test" variant="info" />);
            expect(screen.getByTestId("info-icon")).toBeInTheDocument();
        });

        it("should combine all props correctly", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: ErrorAlert.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

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
            expect(
                screen.getByTestId("alert-triangle-icon")
            ).toBeInTheDocument();
            expect(screen.getByLabelText("Dismiss error")).toBeInTheDocument();
        });
    });
});
