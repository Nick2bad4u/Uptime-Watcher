/**
 * Default fallback component for error boundaries
 */

import type React from "react";

/**
 * Default fallback component for error boundary
 */
export const DefaultErrorFallback: React.FC<{ error?: Error; retry: () => void }> = ({ error, retry }) => (
    <div className="flex flex-col items-center justify-center p-8 border border-red-200 rounded-lg bg-red-50">
        <div className="mb-4 text-red-600">
            <h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm">
                {error?.message.trim() ? error.message : "An unexpected error occurred while loading this section."}
            </p>
        </div>
        <div className="flex gap-4">
            <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                onClick={retry}
                type="button"
            >
                Try Again
            </button>
            <button
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded hover:bg-red-50"
                onClick={() => window.location.reload()}
                type="button"
            >
                Reload Page
            </button>
        </div>
    </div>
);
