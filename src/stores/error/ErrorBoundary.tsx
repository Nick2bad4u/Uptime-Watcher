/**
 * Error boundary component for store-related errors.
 * Provides fallback UI when store operations fail.
 */

import React from "react";

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Default fallback component for error boundary
 */
const DefaultErrorFallback: React.FC<{ error?: Error; retry: () => void }> = ({ error, retry }) => (
    <div className="flex flex-col items-center justify-center p-8 border border-red-200 rounded-lg bg-red-50">
        <div className="mb-4 text-red-600">
            <h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm">{error?.message ?? "An unexpected error occurred while loading this section."}</p>
        </div>
        <button onClick={retry} className="px-4 py-2 text-white transition-colors bg-red-600 rounded hover:bg-red-700">
            Try Again
        </button>
    </div>
);

/**
 * Error boundary component for wrapping store-connected components
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            error,
            hasError: true,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Store Error Boundary caught an error:", error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });

        // Call the onError prop if provided
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ error: undefined, errorInfo: undefined, hasError: false });
    };

    render() {
        if (this.state.hasError) {
            const FallbackComponent = this.props.fallback || DefaultErrorFallback;
            return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
        }

        return this.props.children;
    }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>,
    fallback?: React.ComponentType<{ error?: Error; retry: () => void }>
) => {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary fallback={fallback}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName ?? Component.name})`;

    return WrappedComponent;
};
