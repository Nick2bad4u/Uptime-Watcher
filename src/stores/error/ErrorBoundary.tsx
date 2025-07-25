/**
 * Error boundary component for store-related errors.
 * Provides fallback UI when store operations fail.
 */

import React from "react";

import { DefaultErrorFallback } from "../../components/error/DefaultErrorFallback";
import logger from "../../services/logger";

/**
 * Props for the ErrorBoundary component
 *
 * @public
 */
export interface ErrorBoundaryProperties {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error?: Error; onRetry: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * State for the ErrorBoundary component
 *
 * @public
 */
export interface ErrorBoundaryState {
    error?: Error | undefined;
    errorInfo?: React.ErrorInfo | undefined;
    hasError: boolean;
}

/**
 * Error boundary component for wrapping store-connected components
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
 * Higher-order component for wrapping components with error boundary
 *
 * @param Component - The component to wrap with error boundary protection
 * @param fallback - Optional custom fallback component for error display
 * @returns Wrapped component with error boundary functionality
 *
 * @example
 * ```tsx
 * const SafeComponent = withErrorBoundary(MyComponent, CustomErrorFallback);
 * ```
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
