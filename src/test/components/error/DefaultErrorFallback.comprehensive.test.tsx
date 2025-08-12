/**
 * Comprehensive tests for DefaultErrorFallback component.
 * Tests error display, button interactions, and edge cases.
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
        it("should render error fallback with default message when no error provided", () => {
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

        it("should render error message when error is provided", () => {
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

        it("should display default message when error message is empty", () => {
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

        it("should display default message when error message is only whitespace", () => {
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

        it("should trim error message whitespace", () => {
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
        it("should call onRetry when Try Again button is clicked", async () => {
            const user = userEvent.setup();
            render(<DefaultErrorFallback onRetry={mockOnRetry} />);

            const tryAgainButton = screen.getByText("Try Again");
            await user.click(tryAgainButton);

            expect(mockOnRetry).toHaveBeenCalledTimes(1);
        });

        it("should call window.location.reload when Reload Page button is clicked", async () => {
            const user = userEvent.setup();
            render(<DefaultErrorFallback onRetry={mockOnRetry} />);

            const reloadButton = screen.getByText("Reload Page");
            await user.click(reloadButton);

            expect(mockReload).toHaveBeenCalledTimes(1);
        });

        it("should have correct button types", () => {
            render(<DefaultErrorFallback onRetry={mockOnRetry} />);

            const tryAgainButton = screen.getByText("Try Again");
            const reloadButton = screen.getByText("Reload Page");

            expect(tryAgainButton).toHaveAttribute("type", "button");
            expect(reloadButton).toHaveAttribute("type", "button");
        });
    });

    describe("CSS Classes and Styling", () => {
        it("should have correct CSS classes for layout and styling", () => {
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
                "border-red-200",
                "rounded-lg",
                "bg-red-50"
            );
        });

        it("should have correct button styling", () => {
            render(<DefaultErrorFallback onRetry={mockOnRetry} />);

            const tryAgainButton = screen.getByText("Try Again");
            const reloadButton = screen.getByText("Reload Page");

            expect(tryAgainButton).toHaveClass(
                "px-4",
                "py-2",
                "text-sm",
                "font-medium",
                "text-white",
                "bg-red-600",
                "rounded",
                "hover:bg-red-700"
            );

            expect(reloadButton).toHaveClass(
                "px-4",
                "py-2",
                "text-sm",
                "font-medium",
                "text-red-600",
                "border",
                "border-red-600",
                "rounded",
                "hover:bg-red-50"
            );
        });
    });

    describe("Accessibility", () => {
        it("should have proper heading structure", () => {
            render(<DefaultErrorFallback onRetry={mockOnRetry} />);

            const heading = screen.getByRole("heading", { level: 2 });
            expect(heading).toHaveTextContent("Something went wrong");
        });

        it("should have clickable buttons", () => {
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
        it("should handle error with non-string message property", () => {
            const error = { message: 123 } as any;
            render(
                <DefaultErrorFallback error={error} onRetry={mockOnRetry} />
            );

            // Should still render without crashing
            expect(
                screen.getByText("Something went wrong")
            ).toBeInTheDocument();
        });

        it("should handle error without message property", () => {
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

        it("should handle very long error messages", () => {
            const longMessage = "A".repeat(1000);
            const error = new Error(longMessage);
            render(
                <DefaultErrorFallback error={error} onRetry={mockOnRetry} />
            );

            expect(screen.getByText(longMessage)).toBeInTheDocument();
        });

        it("should handle error messages with special characters", () => {
            const specialMessage = "Error with special chars: <>&\"'";
            const error = new Error(specialMessage);
            render(
                <DefaultErrorFallback error={error} onRetry={mockOnRetry} />
            );

            expect(screen.getByText(specialMessage)).toBeInTheDocument();
        });
    });

    describe("Multiple Interactions", () => {
        it("should handle multiple retry clicks", async () => {
            const user = userEvent.setup();
            render(<DefaultErrorFallback onRetry={mockOnRetry} />);

            const tryAgainButton = screen.getByText("Try Again");

            await user.click(tryAgainButton);
            await user.click(tryAgainButton);
            await user.click(tryAgainButton);

            expect(mockOnRetry).toHaveBeenCalledTimes(3);
        });

        it("should handle rapid button clicks", async () => {
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
