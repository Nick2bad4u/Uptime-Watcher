/**
 * Error boundary component for graceful error handling in React component
 * trees.
 *
 * @remarks
 * This component implements React's error boundary pattern to catch JavaScript
 * errors anywhere in the child component tree, log those errors, and display a
 * fallback UI instead of the component tree that crashed. It's specifically
 * designed for store-related and critical UI error scenarios.
 *
 * Key features:
 *
 * - Automatic error logging with contextual information
 * - Customizable fallback UI for different error scenarios
 * - Retry mechanism that remounts failed components
 * - Integration with application logging infrastructure
 * - TypeScript support with proper error type handling
 *
 * @example
 *
 * ```tsx
 * <ErrorBoundary>
 *     <StoreConnectedComponent />
 * </ErrorBoundary>;
 * ```
 *
 * @public
 */

import type { ComponentType, ErrorInfo, JSX, ReactNode } from "react";

import { PureComponent } from "react";

import { DefaultErrorFallback } from "../../components/error/DefaultErrorFallback";
import { logger } from "../../services/logger";

/**
 * Props for a custom error boundary fallback component.
 */
export interface ErrorBoundaryFallbackProps {
    /** Error object that was caught by the boundary */
    readonly error?: Error;
    /** Function to retry rendering by resetting the error state */
    readonly onRetry: () => void;
}

/**
 * Props for the {@link ErrorBoundary} component.
 *
 * @public
 */
export interface ErrorBoundaryProperties {
    /** React children to be rendered within the error boundary */
    readonly children: ReactNode;

    /** Optional custom fallback component to render when an error occurs */
    readonly fallback?: ComponentType<ErrorBoundaryFallbackProps>;

    /** Optional callback function called when an error is caught */
    readonly onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * State for the {@link ErrorBoundary} component.
 *
 * @public
 */
export interface ErrorBoundaryState {
    /** The error object that was caught, if any */
    error?: Error | undefined;
    /** Whether an error has been caught and the fallback UI should be shown */
    hasError: boolean;
    /** Number of retry attempts, used to force re-mounting of children */
    retryCount: number;
}

class ErrorBoundaryBase extends PureComponent<
    ErrorBoundaryProperties,
    ErrorBoundaryState
> {
    public override state: ErrorBoundaryState = {
        hasError: false,
        retryCount: 0,
    };

    public handleRetry = (): void => {
        this.setState((prevState) => ({
            error: undefined,
            hasError: false,
            retryCount: prevState.retryCount + 1,
        }));
    };

    public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            error,
            hasError: true,
            retryCount: 0,
        };
    }

    public override componentDidCatch(
        error: Error,
        errorInfo: ErrorInfo
    ): void {
        logger.error("Store Error Boundary caught an error", error);
        logger.error("Store Error Boundary component stack", {
            componentStack: errorInfo.componentStack,
        });

        const { onError } = this.props;
        onError?.(error, errorInfo);
    }

    public override render(): JSX.Element {
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

        return <div key={retryCount}>{children}</div>;
    }
}

/**
 * Error boundary component for wrapping store-connected components.
 */
export const ErrorBoundary: typeof ErrorBoundaryBase = ErrorBoundaryBase;
