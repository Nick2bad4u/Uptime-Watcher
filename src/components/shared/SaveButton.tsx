/**
 * SaveButton component for consistent save actions across the application.
 *
 * @remarks
 * Provides a standardized save button with loading states, theming, and
 * accessibility support. Used throughout forms and settings interfaces.
 */

import type {
    ComponentProperties,
    StandardButtonProperties,
} from "@shared/types/componentProps";

import { type FC, useMemo } from "react";

import { ThemedButton } from "../../theme/components/ThemedButton";
import { AppIcons, getIconSize } from "../../utils/icons";

/**
 * Props for the SaveButton component.
 *
 * @remarks
 * This component forwards most button/DOM attributes to the underlying
 * {@link ThemedButton}. See {@link StandardButtonProperties} for the shared
 * prop surface.
 */
export type SaveButtonProperties = ComponentProperties<
    StandardButtonProperties,
    Readonly<{
        /** Whether the save operation is loading. */
        readonly isLoading?: boolean;
        /** Click handler for the save action. */
        readonly onClick: () => void;
        /** Button size variant. */
        readonly size?: "lg" | "md" | "sm" | "xs";
    }>
>;

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
export const SaveButton: FC<SaveButtonProperties> = ({
    "aria-label": ariaLabel = "Save changes",
    className = "",
    disabled = false,
    isLoading = false,
    onClick,
    size = "sm",
    ...props
}) => {
    const SaveIcon = AppIcons.actions.save;
    const iconSize = useMemo((): number => {
        switch (size) {
            case "lg": {
                return getIconSize("lg");
            }
            case "md": {
                return getIconSize("md");
            }
            case "sm": {
                return getIconSize("sm");
            }
            case "xs": {
                return getIconSize("xs");
            }
            default: {
                return getIconSize("sm");
            }
        }
    }, [size]);

    const saveIcon = useMemo(
        () => <SaveIcon aria-hidden size={iconSize} />,
        [iconSize, SaveIcon]
    );

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
