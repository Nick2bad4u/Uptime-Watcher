/**
 * SaveButton component for consistent save actions
 */

import React, { useMemo } from "react";
import { FiSave } from "react-icons/fi";

import ThemedButton from "../../theme/components/ThemedButton";

/**
 * Props for the SaveButton component
 */
export interface SaveButtonProps {
    /** Accessibility label */
    readonly "aria-label"?: string;
    /** Additional CSS classes */
    readonly className?: string;
    /** Whether the button should be disabled */
    readonly disabled?: boolean;
    /** Whether the save operation is loading */
    readonly isLoading?: boolean;
    /** Click handler for the save action */
    readonly onClick: () => void;
    /** Button size variant */
    readonly size?: "lg" | "md" | "sm" | "xs";
}

/**
 * Standardized save button with consistent styling and behavior
 *
 * @example
 *
 * ```tsx
 * <SaveButton disabled={!hasChanges} onClick={handleSave} size="sm" />;
 * ```
 *
 * @param props - SaveButton props
 *
 * @returns Themed save button component
 */
export const SaveButton: React.FC<SaveButtonProps> = ({
    "aria-label": ariaLabel = "Save changes",
    className = "",
    disabled = false,
    isLoading = false,
    onClick,
    size = "sm",
    ...props
}) => {
    const saveIcon = useMemo(() => <FiSave />, []);

    return (
        <ThemedButton
            {...props}
            aria-label={ariaLabel}
            className={className}
            disabled={disabled || isLoading}
            icon={saveIcon}
            onClick={onClick}
            size={size}
            variant={disabled ? "secondary" : "primary"}
        >
            Save
        </ThemedButton>
    );
};
