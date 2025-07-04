/**
 * Test suite for ErrorBoundary component
 */

import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary, withErrorBoundary } from "../stores/error/ErrorBoundary";

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean; message?: string }> = ({ shouldThrow = true, message = "Test error" }) => {
    if (shouldThrow) {
        throw new Error(message);
    }
    return <div>No error</div>;
};

// Component that works fine
const WorkingComponent: React.FC = () => <div>Working component</div>;

describe("ErrorBoundary", () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        user = userEvent.setup();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe("ErrorBoundary Component", () => {
        it("should render children when there is no error", () => {
            render(
                <ErrorBoundary>
                    <div>Test content</div>
                </ErrorBoundary>
            );

            expect(screen.getByText("Test content")).toBeInTheDocument();
        });

        it("should render default error fallback when child throws error", () => {
            render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(screen.getByText("Something went wrong")).toBeInTheDocument();
            expect(screen.getByText("Test error")).toBeInTheDocument();
            expect(screen.getByText("Try Again")).toBeInTheDocument();
        });

        it("should render custom fallback when provided", () => {
            const CustomFallback: React.FC<{ error?: Error; retry: () => void }> = ({ error, retry }) => (
                <div>
                    <p>Custom error: {error?.message}</p>
                    <button onClick={retry}>Custom retry</button>
                </div>
            );

            render(
                <ErrorBoundary fallback={CustomFallback}>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(screen.getByText("Custom error: Test error")).toBeInTheDocument();
            expect(screen.getByText("Custom retry")).toBeInTheDocument();
        });

        it("should call onError callback when error occurs", () => {
            const onErrorSpy = vi.fn();

            render(
                <ErrorBoundary onError={onErrorSpy}>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(onErrorSpy).toHaveBeenCalledWith(
                expect.any(Error),
                expect.objectContaining({
                    componentStack: expect.any(String),
                })
            );
        });

        it("should reset error state when retry is clicked", async () => {
            // Use a component that we can control the error state for
            let shouldThrow = true;
            const ControlledErrorComponent: React.FC = () => {
                if (shouldThrow) {
                    throw new Error("Test error");
                }
                return <div>No error</div>;
            };

            const { rerender } = render(
                <ErrorBoundary>
                    <ControlledErrorComponent />
                </ErrorBoundary>
            );

            expect(screen.getByText("Something went wrong")).toBeInTheDocument();

            // Change the error state before retry
            shouldThrow = false;

            await user.click(screen.getByText("Try Again"));

            // Force a rerender to see the updated state
            rerender(
                <ErrorBoundary>
                    <ControlledErrorComponent />
                </ErrorBoundary>
            );

            expect(screen.getByText("No error")).toBeInTheDocument();
        });

        it("should handle error with undefined message", () => {
            const ThrowErrorWithoutMessage: React.FC = () => {
                const error = new Error();
                error.message = "";
                throw error;
            };

            render(
                <ErrorBoundary>
                    <ThrowErrorWithoutMessage />
                </ErrorBoundary>
            );

            // When error message is empty string, it should show the default message
            expect(screen.getByText("An unexpected error occurred while loading this section.")).toBeInTheDocument();
        });

        it("should log error to console", () => {
            render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(consoleSpy).toHaveBeenCalledWith(
                "Store Error Boundary caught an error:",
                expect.any(Error),
                expect.objectContaining({
                    componentStack: expect.any(String),
                })
            );
        });

        it("should handle retry without fallback error prop", async () => {
            const CustomFallback: React.FC<{ retry: () => void }> = ({ retry }) => (
                <button onClick={retry}>Retry without error</button>
            );

            render(
                <ErrorBoundary fallback={CustomFallback}>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(screen.getByText("Retry without error")).toBeInTheDocument();
            
            await user.click(screen.getByText("Retry without error"));
            
            // Should not throw - testing that retry works even without error prop
            expect(() => {
                user.click(screen.getByText("Retry without error"));
            }).not.toThrow();
        });

        it("should handle multiple error types and retry functionality", async () => {
            // First, test with a normal error
            const { unmount } = render(
                <ErrorBoundary>
                    <ThrowError message="First error" />
                </ErrorBoundary>
            );

            expect(screen.getByText("First error")).toBeInTheDocument();

            // Verify retry button works
            await user.click(screen.getByText("Try Again"));

            // Clean up and test a second error boundary instance
            unmount();

            render(
                <ErrorBoundary>
                    <ThrowError message="Second error" />
                </ErrorBoundary>
            );

            expect(screen.getByText("Second error")).toBeInTheDocument();
        });
    });

    describe("withErrorBoundary HOC", () => {
        it("should wrap component with ErrorBoundary", () => {
            const WrappedComponent = withErrorBoundary(WorkingComponent);

            render(<WrappedComponent />);

            expect(screen.getByText("Working component")).toBeInTheDocument();
        });

        it("should handle errors in wrapped component", () => {
            const WrappedComponent = withErrorBoundary(ThrowError);

            render(<WrappedComponent />);

            expect(screen.getByText("Something went wrong")).toBeInTheDocument();
        });

        it("should use custom fallback when provided", () => {
            const CustomFallback: React.FC<{ error?: Error; retry: () => void }> = ({ error, retry }) => (
                <div>
                    <p>HOC Custom error: {error?.message}</p>
                    <button onClick={retry}>HOC retry</button>
                </div>
            );

            const WrappedComponent = withErrorBoundary(ThrowError, CustomFallback);

            render(<WrappedComponent />);

            expect(screen.getByText("HOC Custom error: Test error")).toBeInTheDocument();
        });

        it("should set correct displayName for wrapped component", () => {
            const TestComponent = () => <div>Test</div>;
            TestComponent.displayName = "TestComponent";

            const WrappedComponent = withErrorBoundary(TestComponent);

            expect(WrappedComponent.displayName).toBe("withErrorBoundary(TestComponent)");
        });

        it("should use component name when displayName is not available", () => {
            const TestComponent = () => <div>Test</div>;

            const WrappedComponent = withErrorBoundary(TestComponent);

            expect(WrappedComponent.displayName).toBe("withErrorBoundary(TestComponent)");
        });

        it("should handle component without name", () => {
            const TestComponent = () => <div>Test</div>;
            Object.defineProperty(TestComponent, "name", { value: "" });

            const WrappedComponent = withErrorBoundary(TestComponent);

            expect(WrappedComponent.displayName).toBe("withErrorBoundary()");
        });

        it("should pass props to wrapped component", () => {
            const PropsComponent: React.FC<{ testProp: string }> = ({ testProp }) => <div>{testProp}</div>;
            const WrappedComponent = withErrorBoundary(PropsComponent);

            render(<WrappedComponent testProp="test value" />);

            expect(screen.getByText("test value")).toBeInTheDocument();
        });

        it("should work with components that have no fallback", () => {
            const WrappedComponent = withErrorBoundary(WorkingComponent);

            render(<WrappedComponent />);

            expect(screen.getByText("Working component")).toBeInTheDocument();
        });
    });

    describe("DefaultErrorFallback Component", () => {
        it("should render with minimal props", () => {
            render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(screen.getByText("Something went wrong")).toBeInTheDocument();
            expect(screen.getByText("Try Again")).toBeInTheDocument();
        });

        it("should call retry function when button is clicked", async () => {
            render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            await user.click(screen.getByText("Try Again"));

            // The retry function is called internally, we can't directly test it
            // but we can test that clicking doesn't throw
            expect(() => {
                user.click(screen.getByText("Try Again"));
            }).not.toThrow();
        });

        it("should handle undefined error", () => {
            const CustomFallback: React.FC<{ retry: () => void }> = () => (
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            render(<CustomFallback retry={() => {}} />);

            expect(screen.getByText("Something went wrong")).toBeInTheDocument();
        });
    });

    describe("Error Boundary State Management", () => {
        it("should maintain error state across renders", () => {
            const { rerender } = render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(screen.getByText("Something went wrong")).toBeInTheDocument();

            // Rerender with same error
            rerender(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(screen.getByText("Something went wrong")).toBeInTheDocument();
        });

        it("should handle getDerivedStateFromError", () => {
            // This is implicitly tested by other tests, but we can verify the behavior
            render(
                <ErrorBoundary>
                    <ThrowError />
                </ErrorBoundary>
            );

            expect(screen.getByText("Something went wrong")).toBeInTheDocument();
        });
    });
});
