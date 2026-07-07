/**
 * Default fallback component for error boundaries
 */

import {
    getCallableDataProperty,
    getOwnPropertyValue,
} from "@shared/utils/errorPropertyAccess";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { type FC, useCallback } from "react";

const DEFAULT_ERROR_MESSAGE =
    "An unexpected error occurred while loading this section.";

const reloadCurrentPage = (): void => {
    const locationProperty = getOwnPropertyValue(globalThis, "location");

    if (!locationProperty.found) {
        return;
    }

    const reload = getCallableDataProperty(locationProperty.value, "reload");

    if (!reload) {
        return;
    }

    try {
        Reflect.apply(reload, locationProperty.value, []);
    } catch {
        // Error fallbacks should not fail again if the runtime blocks reload.
    }
};

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
        reloadCurrentPage();
    }, []);

    // Extract error message logic to avoid complex conditional rendering
    const errorMessage =
        error?.message &&
        typeof error.message === "string" &&
        error.message.trim()
            ? getUserFacingErrorDetail(error)
            : DEFAULT_ERROR_MESSAGE;

    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-error-default bg-error-muted p-8">
            <div className="mb-4 text-error-default">
                <h2 className="mb-2 font-semibold text-lg">
                    Something went wrong
                </h2>
                <p className="text-sm">{errorMessage}</p>
            </div>
            <div className="flex gap-4">
                <button
                    className="rounded-xs bg-error-default px-4 py-2 font-medium text-primary-inverse text-sm hover:bg-error-alternative"
                    onClick={onRetry}
                    type="button"
                >
                    Try Again
                </button>
                <button
                    className="rounded-xs border border-error-default bg-error-muted/50 px-4 py-2 font-medium text-error-default text-sm hover:bg-error-muted"
                    onClick={handleReload}
                    type="button"
                >
                    Reload Page
                </button>
            </div>
        </div>
    );
};
