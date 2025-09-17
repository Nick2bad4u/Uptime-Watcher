/**
 * Default fallback component for error boundaries
 */

import { type FC, useCallback } from "react";

/**
 * Default fallback component for error boundary
 */
export const DefaultErrorFallback: FC<
    Readonly<{
        /** Error object containing details about what went wrong */
        error?: Error;
        /** Callback function to retry the failed operation */
        onRetry: () => void;
    }>
> = ({ error, onRetry }) => {
    // UseCallback handler for jsx-no-bind compliance
    const handleReload = useCallback(() => {
        window.location.reload();
    }, []);

    // Extract error message logic to avoid complex conditional rendering
    const errorMessage =
        error?.message &&
        typeof error.message === "string" &&
        error.message.trim()
            ? error.message
            : "An unexpected error occurred while loading this section.";

    return (
        <div className="border-error-default bg-error-muted flex flex-col items-center justify-center rounded-lg border p-8">
            <div className="text-error-default mb-4">
                <h2 className="mb-2 text-lg font-semibold">
                    Something went wrong
                </h2>
                <p className="text-sm">{errorMessage}</p>
            </div>
            <div className="flex gap-4">
                <button
                    className="hover:bg-error-alternative bg-error-default text-primary-inverse rounded-xs px-4 py-2 text-sm font-medium"
                    onClick={onRetry}
                    type="button"
                >
                    Try Again
                </button>
                <button
                    className="hover:bg-error-muted border-error-default bg-error-muted/50 text-error-default rounded-xs border px-4 py-2 text-sm font-medium"
                    onClick={handleReload}
                    type="button"
                >
                    Reload Page
                </button>
            </div>
        </div>
    );
};
