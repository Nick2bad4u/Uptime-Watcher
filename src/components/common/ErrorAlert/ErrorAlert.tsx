/**
 * Unified error alert component for consistent error display across the
 * application.
 *
 * @remarks
 * This component provides a standardized way to display error messages with:
 *
 * - Consistent styling and theming
 * - Proper icons instead of emojis
 * - Accessible markup and keyboard interaction
 * - Optional dismissible functionality
 * - Support for different error severity levels
 *
 * @example
 *
 * ```tsx
 * <ErrorAlert
 *     message="Failed to load data"
 *     onDismiss={() => clearError()}
 *     variant="error"
 * />;
 * ```
 *
 * @public
 */

import type { CoreComponentProperties } from "@shared/types/componentProps";
import type { JSX } from "react/jsx-runtime";

import { useCallback } from "react";

import { AppIcons } from "../../../utils/icons";

/**
 * Props for the ErrorAlert component.
 *
 * @public
 */
export interface ErrorAlertProperties extends CoreComponentProperties {
    /** The error message to display */
    readonly message: string;
    /** Optional callback when the error is dismissed */
    readonly onDismiss?: () => void;
    /** Error severity variant for styling */
    readonly variant?: ErrorAlertVariant;
}

/**
 * Supported error alert variants.
 *
 * @public
 */
export type ErrorAlertVariant = "error" | "info" | "warning";

/**
 * Get the appropriate icon for the error variant.
 *
 * @param variant - The error variant
 *
 * @returns React icon component
 *
 * @internal
 */
function getErrorIcon(variant: ErrorAlertVariant): JSX.Element {
    const ErrorIcon = AppIcons.status.downFilled;
    const InfoIcon = AppIcons.ui.info;
    const WarningIcon = AppIcons.status.warning;

    const className = "h-5 w-5 shrink-0";

    if (variant === "info") {
        return <InfoIcon className={className} data-testid="info-icon" />;
    }

    if (variant === "warning") {
        return (
            <WarningIcon
                className={className}
                data-testid="alert-triangle-icon"
            />
        );
    }

    return <ErrorIcon className={className} data-testid="alert-circle-icon" />;
}

/**
 * Get the appropriate CSS classes for error variants.
 *
 * @param variant - The error variant
 *
 * @returns CSS class string for variant styling
 *
 * @internal
 */
function getVariantClasses(variant: ErrorAlertVariant): string {
    switch (variant) {
        case "error": {
            return "border-error-default bg-error-muted text-error-default dark:border-error-default dark:bg-error-muted dark:text-error-alternative";
        }
        case "info": {
            return "border-info-default bg-info-muted text-info-default dark:border-info-default dark:bg-info-muted dark:text-info-alternative";
        }
        case "warning": {
            return "border-warning-default bg-warning-muted text-warning-default dark:border-warning-default dark:bg-warning-muted dark:text-warning-alternative";
        }
        default: {
            return "border-error-default bg-error-muted text-error-default dark:border-error-default dark:bg-error-muted dark:text-error-alternative";
        }
    }
}

/**
 * Unified error alert component for consistent error display.
 *
 * @param props - Component props
 *
 * @returns JSX element containing the error alert
 *
 * @public
 */
export const ErrorAlert = ({
    className = "",
    message,
    onDismiss,
    variant = "error",
}: ErrorAlertProperties): JSX.Element => {
    const handleDismiss = useCallback(() => {
        onDismiss?.();
    }, [onDismiss]);

    const CloseIcon = AppIcons.ui.close;

    const variantClasses = getVariantClasses(variant);
    const icon = getErrorIcon(variant);

    return (
        <div
            aria-live="polite"
            className={`flex items-start gap-3 rounded-md border p-4 ${variantClasses} ${className}`}
            role="alert"
        >
            {icon}

            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium wrap-break-word">{message}</p>
            </div>

            {onDismiss ? (
                <button
                    aria-label="Dismiss error"
                    className="hover:bg-overlay-default/5 dark:hover:bg-overlay-inverse/5 -m-1 shrink-0 rounded-xs p-1 transition-colors"
                    onClick={handleDismiss}
                    title="Dismiss this error message"
                    type="button"
                >
                    <CloseIcon className="h-4 w-4" />
                </button>
            ) : null}
        </div>
    );
};
