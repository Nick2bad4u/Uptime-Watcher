/**
 * Higher-order component for wrapping components with error boundary protection.
 * Provides a convenient way to add error boundaries to existing components.
 *
 * @remarks
 * Returns a new component that wraps the given component in an {@link ErrorBoundary}.
 * Supports custom fallback components for error display.
 * Sets a display name for easier debugging in React DevTools.
 */

import type { JSX } from "react/jsx-runtime";

import React from "react";

import ErrorBoundary from "./ErrorBoundary";

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
const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>,
    fallback?: React.ComponentType<{ error?: Error; onRetry: () => void }>
): WrappedErrorBoundaryComponent<P> => {
    const WrappedComponent = (properties: P): React.ReactElement => (
        <ErrorBoundary {...(fallback ? { fallback } : {})}>
            <Component {...properties} />
        </ErrorBoundary>
    );

    // Set display name for better debugging experience in React DevTools
    // This helps developers identify wrapped components in the component tree
    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName ?? Component.name})`;

    return WrappedComponent;
};

export default withErrorBoundary;
