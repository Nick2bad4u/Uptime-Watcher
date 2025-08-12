/**
 * FormErrorAlert component for consistent error display
 */

import React from "react";

import ThemedBox from "../../theme/components/ThemedBox";
import ThemedButton from "../../theme/components/ThemedButton";
import ThemedText from "../../theme/components/ThemedText";

/**
 * Props for the FormErrorAlert component
 */
export interface FormErrorAlertProps {
    /** Additional CSS classes */
    readonly className?: string;
    /** Error message to display */
    readonly error: null | string;
    /** Whether dark theme is active */
    readonly isDark?: boolean;
    /** Handler to clear the error */
    readonly onClearError: () => void;
}

/**
 * Standardized error alert component with dismiss functionality
 *
 * @param props - FormErrorAlert props
 * @returns Themed error alert component
 *
 * @example
 * ```tsx
 * <FormErrorAlert
 *   error={lastError}
 *   onClearError={clearError}
 *   isDark={isDarkTheme}
 * />
 * ```
 */
export const FormErrorAlert: React.FC<FormErrorAlertProps> = ({
    className = "",
    error,
    isDark = false,
    onClearError,
}) => {
    if (!error) {
        return null;
    }

    return (
        <ThemedBox
            className={`error-alert ${isDark ? "dark" : ""} ${className}`.trim()}
            variant="secondary"
        >
            <div className="error-alert__content">
                <ThemedText size="sm" variant="error">
                    {error}
                </ThemedText>
                <ThemedButton
                    className={`error-alert__close ${isDark ? "dark" : ""}`}
                    onClick={onClearError}
                    size="xs"
                    variant="secondary"
                >
                    ✕
                </ThemedButton>
            </div>
        </ThemedBox>
    );
};
