/**
 * FormErrorAlert component for consistent error display
 */

import type { CoreComponentProperties } from "@shared/types/componentProps";
import type { FC } from "react";

import { ThemedBox } from "../../theme/components/ThemedBox";
import { ThemedButton } from "../../theme/components/ThemedButton";
import { ThemedText } from "../../theme/components/ThemedText";
import { AppIcons } from "../../utils/icons";

/**
 * Props for the FormErrorAlert component
 */
export interface FormErrorAlertProperties extends CoreComponentProperties {
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
 * @example
 *
 * ```tsx
 * <FormErrorAlert
 *     error={lastError}
 *     onClearError={clearError}
 *     isDark={isDarkTheme}
 * />;
 * ```
 *
 * @param props - FormErrorAlert props
 *
 * @returns Themed error alert component
 */
export const FormErrorAlert: FC<FormErrorAlertProperties> = ({
    className = "",
    error,
    isDark = false,
    onClearError,
}) => {
    if (!error) {
        return null;
    }

    const CloseIcon = AppIcons.ui.close;

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
                    <CloseIcon size={14} />
                </ThemedButton>
            </div>
        </ThemedBox>
    );
};
