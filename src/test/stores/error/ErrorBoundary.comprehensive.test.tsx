/**
 * Comprehensive tests for ErrorBoundary component.
 * Tests error catching, fallback rendering, retry functionality, and HOC behavior.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

import { ErrorBoundary, withErrorBoundary } from "../../../stores/error/ErrorBoundary";

// Create a component that throws errors for testing
const ThrowingComponent = ({ shouldThrow }: { shouldThrow?: boolean }) => {
    if (shouldThrow) {
        throw new Error("Test error");
    }
    return <div data-testid="normal-content">Normal content</div>;
};

// Create a custom fallback component for testing
const CustomFallback = ({ error, onRetry }: { error?: Error; onRetry: () => void }) => (
    <div data-testid="custom-fallback">
        <p>Custom error: {error?.message}</p>
        <button onClick={onRetry} data-testid="custom-retry">
            Custom Retry
        </button>
    </div>
);

// Mock logger to avoid console output during tests
vi.mock("../../../services/logger", () => ({
    default: {
        error: vi.fn(),
    },
}));

describe("ErrorBoundary", () => {
    describe("Normal Operation", () => {
        it("should render children when there are no errors", () => {
            render(
                <ErrorBoundary>
                    <ThrowingComponent />
                </ErrorBoundary>
            );

            expect(screen.getByTestId("normal-content")).toBeInTheDocument();
            expect(screen.queryByText(/Something went wrong/)).not.toBeInTheDocument();
        });

        it("should render multiple children correctly", () => {
            render(
                <ErrorBoundary>
                    <ThrowingComponent />
                    <div data-testid="second-child">Second child</div>
                </ErrorBoundary>
            );

            expect(screen.getByTestId("normal-content")).toBeInTheDocument();
            expect(screen.getByTestId("second-child")).toBeInTheDocument();
        });
    });

    describe("Error Handling", () => {
        it("should catch errors and display default fallback", () => {
            render(
                <ErrorBoundary>
                    <ThrowingComponent shouldThrow={true} />
                </ErrorBoundary>
            );

            expect(screen.queryByTestId("normal-content")).not.toBeInTheDocument();
            expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
        });

        it("should display custom fallback when provided", () => {
            render(
                <ErrorBoundary fallback={CustomFallback}>
                    <ThrowingComponent shouldThrow={true} />
                </ErrorBoundary>
            );

            expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
            expect(screen.getByText("Custom error: Test error")).toBeInTheDocument();
        });

        it("should call onError callback when error occurs", () => {
            const onError = vi.fn();

            render(
                <ErrorBoundary onError={onError}>
                    <ThrowingComponent shouldThrow={true} />
                </ErrorBoundary>
            );

            expect(onError).toHaveBeenCalledWith(
                expect.any(Error),
                expect.objectContaining({
                    componentStack: expect.any(String),
                })
            );
        });

        it("should not call onError when no callback is provided", () => {
            // This test ensures no errors are thrown when onError is undefined
            expect(() => {
                render(
                    <ErrorBoundary>
                        <ThrowingComponent shouldThrow={true} />
                    </ErrorBoundary>
                );
            }).not.toThrow();
        });
    });

    describe("Retry Functionality", () => {
        it("should retry with default fallback", async () => {
            const user = userEvent.setup();
            let shouldThrow = true;

            const RetryableComponent = () => {
                if (shouldThrow) {
                    throw new Error("Test error");
                }
                return <div data-testid="normal-content">Normal content</div>;
            };

            render(
                <ErrorBoundary>
                    <RetryableComponent />
                </ErrorBoundary>
            );

            // Should show error initially
            expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();

            // Fix the condition to stop throwing
            shouldThrow = false;

            const retryButton = screen.getByText("Try Again");
            await user.click(retryButton);

            // Should show normal content after retry
            await waitFor(() => {
                expect(screen.getByTestId("normal-content")).toBeInTheDocument();
            });
        });

        it("should retry with custom fallback", async () => {
            const user = userEvent.setup();
            let shouldThrow = true;

            const CustomFallback = ({ error, onRetry }: { error?: Error; onRetry: () => void }) => (
                <div data-testid="custom-fallback">
                    <p>Custom error: {error?.message}</p>
                    <button data-testid="custom-retry" onClick={onRetry}>
                        Custom Retry
                    </button>
                </div>
            );

            const RetryableComponent = () => {
                if (shouldThrow) {
                    throw new Error("Test error");
                }
                return <div data-testid="normal-content">Normal content</div>;
            };

            const { rerender } = render(
                <ErrorBoundary fallback={CustomFallback}>
                    <RetryableComponent />
                </ErrorBoundary>
            );

            // Should show custom error initially
            expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();

            // Change the flag to stop throwing, then click retry
            shouldThrow = false;
            const retryButton = screen.getByTestId("custom-retry");
            await user.click(retryButton);

            // Force rerender to trigger the retry behavior
            rerender(
                <ErrorBoundary fallback={CustomFallback}>
                    <RetryableComponent />
                </ErrorBoundary>
            );

            // Should show normal content after retry
            expect(screen.getByTestId("normal-content")).toBeInTheDocument();
        });
    });

    describe("State Management", () => {
        it("should reset error state on retry", async () => {
            const user = userEvent.setup();

            let componentState = { shouldThrow: true };
            const StateControlledComponent = () => {
                return <ThrowingComponent shouldThrow={componentState.shouldThrow} />;
            };

            render(
                <ErrorBoundary>
                    <StateControlledComponent />
                </ErrorBoundary>
            );

            // Should show error
            expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();

            // Fix the component state
            componentState.shouldThrow = false;

            // Click retry
            const retryButton = screen.getByText("Try Again");
            await user.click(retryButton);

            // Should show normal content
            expect(screen.getByTestId("normal-content")).toBeInTheDocument();
        });
    });

    describe("getDerivedStateFromError", () => {
        it("should return correct state when error occurs", () => {
            const error = new Error("Test error");
            const result = ErrorBoundary.getDerivedStateFromError(error);

            expect(result).toEqual({
                error,
                hasError: true,
                retryCount: 0,
            });
        });
    });
});

describe("withErrorBoundary HOC", () => {
    const TestComponent = ({ message }: { message: string }) => (
        <div data-testid="wrapped-component">{message}</div>
    );

    it("should wrap component with error boundary", () => {
        const WrappedComponent = withErrorBoundary(TestComponent);

        render(<WrappedComponent message="Test message" />);

        expect(screen.getByTestId("wrapped-component")).toBeInTheDocument();
        expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    it("should use custom fallback when provided", () => {
        const ThrowingTestComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
            if (shouldThrow) {
                throw new Error("HOC test error");
            }
            return <div data-testid="wrapped-component">Normal content</div>;
        };

        const WrappedComponent = withErrorBoundary(ThrowingTestComponent, CustomFallback);

        render(<WrappedComponent shouldThrow={true} />);

        expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
        expect(screen.getByText("Custom error: HOC test error")).toBeInTheDocument();
    });

    it("should set correct display name for wrapped component", () => {
        const TestComponentWithName = ({ message }: { message: string }) => (
            <div data-testid="wrapped-component">{message}</div>
        );
        TestComponentWithName.displayName = "TestComponent";
        
        const WrappedComponent = withErrorBoundary(TestComponentWithName);

        expect(WrappedComponent.displayName).toBe("withErrorBoundary(TestComponent)");
    });

    it("should handle component without displayName", () => {
        const AnonymousComponent = () => <div>Anonymous</div>;
        const WrappedComponent = withErrorBoundary(AnonymousComponent);

        expect(WrappedComponent.displayName).toBe("withErrorBoundary(AnonymousComponent)");
    });

    it("should use default fallback when none provided", () => {
        const ThrowingTestComponent = () => {
            throw new Error("Default fallback test");
        };

        const WrappedComponent = withErrorBoundary(ThrowingTestComponent);

        render(<WrappedComponent />);

        expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    });
});
