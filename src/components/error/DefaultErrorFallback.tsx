/**
 * Default fallback component for error boundaries
 */

import type React from "react";

/**
 * Default fallback component for error boundary
 */
export const DefaultErrorFallback: React.FC<{
    readonly error?: Error;
    readonly onRetry: () => void;
}> = ({ error, onRetry }) => (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8">
        <div className="mb-4 text-red-600">
            <h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
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
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                onClick={onRetry}
                type="button"
            >
                Try Again
            </button>
            <button
                className="rounded border border-red-600 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                onClick={() => window.location.reload()}
                type="button"
            >
                Reload Page
            </button>
        </div>
    </div>
);
