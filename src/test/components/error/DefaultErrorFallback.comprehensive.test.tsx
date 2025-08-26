/**
 * Comprehensive tests for DefaultErrorFallback component. Tests error display,
 * button interactions, and edge cases.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

import { DefaultErrorFallback } from "../../../components/error/DefaultErrorFallback";

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(globalThis, "location", {
    value: {
        reload: mockReload,
    },
    writable: true,
});

describe("DefaultErrorFallback", () => {
    const mockOnRetry = vi.fn();

    beforeEach(() => {
        mockOnRetry.mockClear();
        mockReload.mockClear();
    });

    describe("Basic Rendering", () => {
        it("should render error fallback with default message when no error provided", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            render(<DefaultErrorFallback onRetry={mockOnRetry} />);

            expect(
                screen.getByText("Something went wrong")
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "An unexpected error occurred while loading this section."
                )
            ).toBeInTheDocument();
            expect(screen.getByText("Try Again")).toBeInTheDocument();
            expect(screen.getByText("Reload Page")).toBeInTheDocument();
        });

        it("should render error message when error is provided", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const error = new Error("Custom error message");
            render(
                <DefaultErrorFallback error={error} onRetry={mockOnRetry} />
            );

            expect(
                screen.getByText("Something went wrong")
            ).toBeInTheDocument();
            expect(
                screen.getByText("Custom error message")
            ).toBeInTheDocument();
            expect(screen.getByText("Try Again")).toBeInTheDocument();
            expect(screen.getByText("Reload Page")).toBeInTheDocument();
        });

        it("should display default message when error message is empty", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            // eslint-disable-next-line unicorn/error-message -- testing empty error message
            const error = new Error("");
            render(
                <DefaultErrorFallback error={error} onRetry={mockOnRetry} />
            );

            expect(
                screen.getByText("Something went wrong")
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "An unexpected error occurred while loading this section."
                )
            ).toBeInTheDocument();
        });

        it("should display default message when error message is only whitespace", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const error = new Error("   \t\n   ");
            render(
                <DefaultErrorFallback error={error} onRetry={mockOnRetry} />
            );

            expect(
                screen.getByText("Something went wrong")
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "An unexpected error occurred while loading this section."
                )
            ).toBeInTheDocument();
        });

        it("should trim error message whitespace", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const error = new Error("  Error with whitespace  ");
            render(
                <DefaultErrorFallback error={error} onRetry={mockOnRetry} />
            );

            expect(
                screen.getByText("Error with whitespace")
            ).toBeInTheDocument();
        });
    });

    describe("Button Interactions", () => {
        it("should call onRetry when Try Again button is clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            render(<DefaultErrorFallback onRetry={mockOnRetry} />);

            const tryAgainButton = screen.getByText("Try Again");
            await user.click(tryAgainButton);

            expect(mockOnRetry).toHaveBeenCalledTimes(1);
        });

        it("should call window.location.reload when Reload Page button is clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            const user = userEvent.setup();
            render(<DefaultErrorFallback onRetry={mockOnRetry} />);

            const reloadButton = screen.getByText("Reload Page");
            await user.click(reloadButton);

            expect(mockReload).toHaveBeenCalledTimes(1);
        });

        it("should have correct button types", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<DefaultErrorFallback onRetry={mockOnRetry} />);

            const tryAgainButton = screen.getByText("Try Again");
            const reloadButton = screen.getByText("Reload Page");

            expect(tryAgainButton).toHaveAttribute("type", "button");
            expect(reloadButton).toHaveAttribute("type", "button");
        });
    });

    describe("CSS Classes and Styling", () => {
        it("should have correct CSS classes for layout and styling", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const { container } = render(
                <DefaultErrorFallback onRetry={mockOnRetry} />
            );

            const mainDiv = container.firstChild as HTMLElement;
            expect(mainDiv).toHaveClass(
                "flex",
                "flex-col",
                "items-center",
                "justify-center",
                "p-8",
                "border",
                "border-error-default",
                "rounded-lg",
                "bg-error-muted"
            );
        });

        it("should have correct button styling", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<DefaultErrorFallback onRetry={mockOnRetry} />);

            const tryAgainButton = screen.getByText("Try Again");
            const reloadButton = screen.getByText("Reload Page");

            expect(tryAgainButton).toHaveClass(
                "px-4",
                "py-2",
                "text-sm",
                "font-medium",
                "text-primary-inverse",
                "bg-error-default",
                "rounded-xs",
                "hover:bg-error-alternative"
            );

            expect(reloadButton).toHaveClass(
                "px-4",
                "py-2",
                "text-sm",
                "font-medium",
                "text-error-default",
                "border",
                "border-error-default",
                "rounded-xs",
                "bg-error-muted/50",
                "hover:bg-error-muted"
            );
        });
    });

    describe("Accessibility", () => {
        it("should have proper heading structure", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<DefaultErrorFallback onRetry={mockOnRetry} />);

            const heading = screen.getByRole("heading", { level: 2 });
            expect(heading).toHaveTextContent("Something went wrong");
        });

        it("should have clickable buttons", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<DefaultErrorFallback onRetry={mockOnRetry} />);

            const tryAgainButton = screen.getByRole("button", {
                name: "Try Again",
            });
            const reloadButton = screen.getByRole("button", {
                name: "Reload Page",
            });

            expect(tryAgainButton).toBeInTheDocument();
            expect(reloadButton).toBeInTheDocument();
        });
    });

    describe("Error Object Variations", () => {
        it("should handle error with non-string message property", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const error = { message: 123 } as any;
            render(
                <DefaultErrorFallback error={error} onRetry={mockOnRetry} />
            );

            // Should still render without crashing
            expect(
                screen.getByText("Something went wrong")
            ).toBeInTheDocument();
        });

        it("should handle error without message property", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const error = {} as Error;
            render(
                <DefaultErrorFallback error={error} onRetry={mockOnRetry} />
            );

            expect(
                screen.getByText("Something went wrong")
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "An unexpected error occurred while loading this section."
                )
            ).toBeInTheDocument();
        });

        it("should handle very long error messages", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const longMessage = "A".repeat(1000);
            const error = new Error(longMessage);
            render(
                <DefaultErrorFallback error={error} onRetry={mockOnRetry} />
            );

            expect(screen.getByText(longMessage)).toBeInTheDocument();
        });

        it("should handle error messages with special characters", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const specialMessage = "Error with special chars: <>&\"'";
            const error = new Error(specialMessage);
            render(
                <DefaultErrorFallback error={error} onRetry={mockOnRetry} />
            );

            expect(screen.getByText(specialMessage)).toBeInTheDocument();
        });
    });

    describe("Multiple Interactions", () => {
        it("should handle multiple retry clicks", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            render(<DefaultErrorFallback onRetry={mockOnRetry} />);

            const tryAgainButton = screen.getByText("Try Again");

            await user.click(tryAgainButton);
            await user.click(tryAgainButton);
            await user.click(tryAgainButton);

            expect(mockOnRetry).toHaveBeenCalledTimes(3);
        });

        it("should handle rapid button clicks", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: DefaultErrorFallback", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            render(<DefaultErrorFallback onRetry={mockOnRetry} />);

            const tryAgainButton = screen.getByText("Try Again");
            const reloadButton = screen.getByText("Reload Page");

            await user.click(tryAgainButton);
            await user.click(reloadButton);
            await user.click(tryAgainButton);

            expect(mockOnRetry).toHaveBeenCalledTimes(2);
            expect(mockReload).toHaveBeenCalledTimes(1);
        });
    });
});
