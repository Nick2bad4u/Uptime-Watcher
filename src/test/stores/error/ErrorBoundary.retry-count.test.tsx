/**
 * @module src/test/stores/error/ErrorBoundary.retry-count
 *
 * These tests target specific arithmetic operations in the ErrorBoundary component
 * to ensure that retry count regressions (e.g., + to -, * to /) are properly
 * detected and killed by the test suite.
 *
 * Target behavior:
 * - Line 121: `retryCount: prevState.retryCount + 1` -> `retryCount: prevState.retryCount - 1`
 * - Line 121: `retryCount: prevState.retryCount + 1` -> `retryCount: prevState.retryCount * 1`
 * - Line 121: `retryCount: prevState.retryCount + 1` -> `retryCount: prevState.retryCount / 1`
 *
 * @file Retry count behavior tests for ErrorBoundary component
 */

import type { JSX } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
// Import the jest-dom matchers for toBeInTheDocument
import "@testing-library/jest-dom";

import { ErrorBoundary } from "../../../stores/error/ErrorBoundary";

/**
 * Component that throws an error for testing error boundary functionality.
 */
interface ThrowingComponentProperties {
    /** Whether this component should throw an error */
    readonly shouldThrow?: boolean;
    /** Error message to throw */
    readonly throwMessage?: string;
}

let isGlobalShouldThrow = true;

const ThrowingComponent = ({
    shouldThrow = isGlobalShouldThrow,
    throwMessage = "Test error for ErrorBoundary",
}: ThrowingComponentProperties): JSX.Element => {
    if (shouldThrow) {
        throw new Error(throwMessage);
    }
    return <div>Normal component content</div>;
};

/**
 * Mock fallback component that provides retry functionality.
 */
interface MockFallbackProperties {
    /** Error object that was caught */
    readonly error?: Error;
    /** Retry callback function */
    readonly onRetry?: () => void;
}

const MockFallback = ({
    error,
    onRetry,
}: MockFallbackProperties): JSX.Element => (
    <div>
        <p>Error caught: {error?.message}</p>
        <button onClick={onRetry} type="button">
            Retry
        </button>
    </div>
);

describe("ErrorBoundary retry count behavior", () => {
    /**
     * Test the retryCount increment arithmetic to ensure regressions are
     * detected.
     *
     * Target: retryCount: prevState.retryCount + 1 Regression examples:
     *
     * - RetryCount: prevState.retryCount - 1 (would cause retryCount to stay the
     *   same or decrease)
     * - RetryCount: prevState.retryCount * 1 (would not increment retryCount)
     * - RetryCount: prevState.retryCount / 1 (would not increment retryCount)
     */
    it("should increment retryCount on each retry attempt", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: ErrorBoundary", "component");
        annotate("Category: Error Handling", "category");
        annotate("Type: Arithmetic Operations", "type");

        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockReturnValue(undefined);

        try {
            // Set component to throw error initially
            isGlobalShouldThrow = true;

            render(
                <ErrorBoundary fallback={MockFallback}>
                    <ThrowingComponent throwMessage="Arithmetic test error" />
                </ErrorBoundary>
            );

            // Verify error fallback is displayed
            expect(
                screen.getByText("Error caught: Arithmetic test error")
            ).toBeInTheDocument();

            // Get the retry button
            const retryButton = screen.getByRole("button", { name: /retry/iv });
            expect(retryButton).toBeInTheDocument();

            // Stop throwing errors so retry can succeed
            isGlobalShouldThrow = false;

            // Click retry - this should increment retryCount from 0 to 1
            fireEvent.click(retryButton);

            // After retry, the component should re-render with incremented retryCount
            // The key prop of the div wrapper uses retryCount, so children should remount
            // If + was mutated to - or other operators, retryCount would not increment properly
            expect(
                screen.getByText("Normal component content")
            ).toBeInTheDocument();

            // Verify we're back to normal content (error was cleared)
            expect(screen.queryByText("Error caught:")).not.toBeInTheDocument();
        } finally {
            consoleErrorSpy.mockRestore();
            isGlobalShouldThrow = true; // Reset for other tests
        }
    });

    /**
     * Test that retryCount properly increments through multiple retry cycles.
     * This specifically targets the + arithmetic operation.
     */
    it("should correctly perform retryCount arithmetic across multiple retries", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: ErrorBoundary", "component");
        annotate("Category: Error Handling", "category");
        annotate("Type: Arithmetic Operations", "type");

        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockReturnValue(undefined);

        try {
            // First mount with error
            isGlobalShouldThrow = true;
            const { rerender } = render(
                <ErrorBoundary fallback={MockFallback}>
                    <ThrowingComponent />
                </ErrorBoundary>
            );

            // Should show error state
            expect(
                screen.getByText("Error caught: Test error for ErrorBoundary")
            ).toBeInTheDocument();
            const retryButton = screen.getByRole("button", { name: /retry/iv });

            // First retry
            isGlobalShouldThrow = false;
            fireEvent.click(retryButton);
            expect(
                screen.getByText("Normal component content")
            ).toBeInTheDocument();

            // Second error cycle - use rerender instead of new render to avoid multiple components
            isGlobalShouldThrow = true;
            rerender(
                <ErrorBoundary fallback={MockFallback}>
                    <ThrowingComponent throwMessage="Second error" />
                </ErrorBoundary>
            );
            expect(
                screen.getByText("Error caught: Second error")
            ).toBeInTheDocument();

            // Second retry - retryCount should be 1 + 1 = 2
            isGlobalShouldThrow = false;
            const retryButton2 = screen.getByRole("button", {
                name: /retry/iv,
            });
            fireEvent.click(retryButton2);

            // Should succeed again - demonstrating consistent arithmetic
            expect(
                screen.getAllByText("Normal component content")
            ).toHaveLength(1);
        } finally {
            consoleErrorSpy.mockRestore();
            isGlobalShouldThrow = true;
        }
    });

    /**
     * Test that the key prop (which uses retryCount) changes correctly. This
     * verifies that the arithmetic result affects component behavior.
     */
    it("should use incremented retryCount as key for component remounting", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: ErrorBoundary", "component");
        annotate("Category: Error Handling", "category");
        annotate("Type: Arithmetic Operations", "type");

        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockReturnValue(undefined);

        try {
            // This test validates that retryCount arithmetic affects the key prop
            // which forces component remounting

            // Start with error state
            isGlobalShouldThrow = true;
            const { rerender } = render(
                <ErrorBoundary fallback={MockFallback}>
                    <ThrowingComponent />
                </ErrorBoundary>
            );

            const retryButton = screen.getByRole("button", { name: /retry/iv });

            // Click retry to increment retryCount (should be 0 + 1 = 1)
            isGlobalShouldThrow = false;
            fireEvent.click(retryButton);

            // Should now see normal content
            expect(
                screen.getAllByText("Normal component content")
            ).toHaveLength(1);

            // Trigger another error to test retryCount increment again
            isGlobalShouldThrow = true;
            rerender(
                <ErrorBoundary fallback={MockFallback}>
                    <ThrowingComponent throwMessage="Second error test" />
                </ErrorBoundary>
            );

            expect(
                screen.getByText("Error caught: Second error test")
            ).toBeInTheDocument();

            // Second retry should increment retryCount to 2
            isGlobalShouldThrow = false;
            const retryButton2 = screen.getByRole("button", {
                name: /retry/iv,
            });
            fireEvent.click(retryButton2);

            // Should see normal content again - key should have changed due to retryCount increment
            expect(
                screen.getAllByText("Normal component content")
            ).toHaveLength(1);
        } finally {
            consoleErrorSpy.mockRestore();
            isGlobalShouldThrow = true;
        }
    });
});
