/**
 * Default fallback component for error boundaries
 */

import React, { useCallback } from "react";

/**
 * Default fallback component for error boundary
 */
export const DefaultErrorFallback: React.FC<{
    /** Error object containing details about what went wrong */
    readonly error?: Error;
    /** Callback function to retry the failed operation */
    readonly onRetry: () => void;
}> = ({ error, onRetry }) => {
    // useCallback handler for jsx-no-bind compliance
    const handleReload = useCallback(() => {
        window.location.reload();
    }, []);

    return (
        <div className="border-error-default bg-error-muted flex flex-col items-center justify-center rounded-lg border p-8">
            <div className="text-error-default mb-4">
                <h2 className="mb-2 text-lg font-semibold">
                    Something went wrong
                </h2>
                <p className="text-sm">
                    {error?.message &&
                    typeof error.message === "string" &&
                    error.message.trim()
                        ? error.message
                        : "An unexpected error occurred while loading this section."}
                </p>
            </div>
            <div className="flex gap-4">
                <button
                    className="bg-error-default hover:bg-error-alternative text-primary-inverse rounded-xs px-4 py-2 text-sm font-medium"
                    onClick={onRetry}
                    type="button"
                >
                    Try Again
                </button>
                <button
                    className="bg-error-muted/50 border-error-default text-error-default hover:bg-error-muted rounded-xs border px-4 py-2 text-sm font-medium"
                    onClick={handleReload}
                    type="button"
                >
                    Reload Page
                </button>
            </div>
        </div>
    );
};
