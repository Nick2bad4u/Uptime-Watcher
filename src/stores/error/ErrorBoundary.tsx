/**
 * Error boundary component for store-related errors.
 *
 * @remarks
 * Provides fallback UI when store operations fail. Catches errors in child components and displays a fallback component or UI. Used to prevent the entire app from crashing due to store or rendering errors.
 *
 * @public
 */

import React from "react";

import { DefaultErrorFallback } from "../../components/error/DefaultErrorFallback";
import logger from "../../services/logger";

/**
 * Props for the {@link ErrorBoundary} component.
 *
 * @remarks
 * Accepts children to render, an optional fallback component for error display, and an optional error handler callback.
 *
 * @public
 */
export interface ErrorBoundaryProperties {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error?: Error; onRetry: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * State for the {@link ErrorBoundary} component.
 *
 * @remarks
 * Tracks error and error info for rendering fallback UI and debugging.
 *
 * @public
 */
export interface ErrorBoundaryState {
    error?: Error | undefined;
    errorInfo?: React.ErrorInfo | undefined;
    hasError: boolean;
}

/**
 * Error boundary component for wrapping store-connected components.
 *
 * @remarks
 * Catches errors in child components, logs them, and displays a fallback UI. Supports custom fallback components and error handling callbacks. Used to wrap store-connected or critical UI components.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 *
 * @public
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProperties, ErrorBoundaryState> {
    constructor(properties: ErrorBoundaryProperties) {
        super(properties);
        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            error,
            hasError: true,
        };
    }

    override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        logger.error("Store Error Boundary caught an error", error);

        this.setState({
            error,
            errorInfo,
        });

        // Call the onError prop if provided
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({
            error: undefined,
            errorInfo: undefined,
            hasError: false,
        });
    };

    // eslint-disable-next-line sonarjs/function-return-type -- React component can return different node types
    override render() {
        if (this.state.hasError) {
            const FallbackComponent = this.props.fallback ?? DefaultErrorFallback;
            return (
                <FallbackComponent
                    {...(this.state.error ? { error: this.state.error } : {})}
                    onRetry={this.handleRetry}
                />
            );
        }

        return this.props.children;
    }
}

/**
 * Higher-order component for wrapping components with error boundary protection.
 *
 * @remarks
 * Returns a new component that wraps the given component in an {@link ErrorBoundary}. Supports custom fallback components for error display. Sets a display name for easier debugging in React DevTools.
 *
 * @typeParam P - The props type for the wrapped component.
 * @param Component - The component to wrap with error boundary protection.
 * @param fallback - Optional custom fallback component for error display.
 * @returns Wrapped component with error boundary functionality.
 * @example
 * ```tsx
 * const SafeComponent = withErrorBoundary(MyComponent, CustomErrorFallback);
 * ```
 * @public
 */
export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>,
    fallback?: React.ComponentType<{ error?: Error; onRetry: () => void }>
) => {
    const WrappedComponent = (properties: P) => (
        <ErrorBoundary {...(fallback ? { fallback } : {})}>
            <Component {...properties} />
        </ErrorBoundary>
    );

    // Set display name for better debugging experience in React DevTools
    // This helps developers identify wrapped components in the component tree
    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName ?? Component.name})`;

    return WrappedComponent;
};
