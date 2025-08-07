/**
 * Error boundary component for store-related errors.
 *
 * @remarks
 * Provides fallback UI when store operations fail. Catches errors in child components and displays a fallback component or UI. Used to prevent the entire app from crashing due to store or rendering errors.
 *
 * @public
 */

import type { JSX } from "react/jsx-runtime";

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
    readonly children: React.ReactNode;
    readonly fallback?: React.ComponentType<{
        error?: Error;
        onRetry: () => void;
    }>;
    readonly onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * State for the {@link ErrorBoundary} component.
 *
 * @remarks
 * Tracks error state for rendering fallback UI.
 * The retryCount is used to force re-mounting of children on retry.
 *
 * @public
 */
export interface ErrorBoundaryState {
    error?: Error | undefined;
    hasError: boolean;
    retryCount: number;
}

/**
 * Interface for the wrapped component returned by withErrorBoundary.
 */
interface WrappedErrorBoundaryComponent<P extends object> {
    (properties: P): JSX.Element;
    // Set display name for better debugging experience in React DevTools
    // This helps developers identify wrapped components in the component tree
    displayName: string;
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
// eslint-disable-next-line react/require-optimization -- ErrorBoundary should always re-render on error state changes
export class ErrorBoundary extends React.Component<
    ErrorBoundaryProperties,
    ErrorBoundaryState
> {
    // eslint-disable-next-line react/sort-comp -- Constructor needs to be before lifecycle methods
    constructor(properties: ErrorBoundaryProperties) {
        super(properties);
        this.state = {
            hasError: false,
            retryCount: 0,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            error,
            hasError: true,
            retryCount: 0,
        };
    }

    override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        logger.error("Store Error Boundary caught an error", error);

        this.setState({
            error,
        });

        // Call the onError prop if provided
        const { onError } = this.props;
        onError?.(error, errorInfo);
    }

    handleRetry = (): void => {
        this.setState((prevState) => ({
            error: undefined,
            hasError: false,
            retryCount: prevState.retryCount + 1,
        }));
    };

    override render(): JSX.Element {
        const { error, hasError, retryCount } = this.state;
        const { children, fallback } = this.props;

        if (hasError) {
            const FallbackComponent = fallback ?? DefaultErrorFallback;
            return (
                <FallbackComponent
                    {...(error ? { error } : {})}
                    onRetry={this.handleRetry}
                />
            );
        }

        // Use retryCount as key to force remounting after retry
        return <div key={retryCount}>{children}</div>;
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
): WrappedErrorBoundaryComponent<P> => {
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
