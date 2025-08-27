import type {
    CoreComponentProperties,
    EventHandlers,
} from "@shared/types/componentProps";

import React, { useMemo } from "react";

import type { ButtonSize, ButtonVariant } from "./types";

import ThemedButton from "./ThemedButton";

/**
 * Props for the ThemedIconButton component
 *
 * @public
 */
export interface ThemedIconButtonProperties extends CoreComponentProperties {
    /** Icon element to display in the button */
    readonly icon: React.ReactNode;
    /** Custom color for the icon */
    readonly iconColor?: string;
    /** Whether the button is in a loading state */
    readonly loading?: boolean;
    /** Callback fired when button is clicked */
    readonly onClick?: EventHandlers.Click;
    /** Size variant for the button */
    readonly size?: ButtonSize;
    /** Tooltip text to display on hover */
    readonly tooltip?: string;
    /** Visual variant for the button */
    readonly variant?: ButtonVariant;
}

/**
 * A themed icon button component optimized for displaying only icons
 *
 * @param props - The icon button properties
 *
 * @returns The themed icon button JSX element
 *
 * @public
 */
const ThemedIconButton = ({
    className = "",
    disabled = false,
    icon,
    iconColor,
    loading = false,
    onClick,
    size = "md",
    tooltip,
    variant = "ghost",
}: ThemedIconButtonProperties): React.JSX.Element => {
    const getSize = (): string => {
        switch (size) {
            case "lg": {
                return "48px";
            }
            case "md": {
                return "40px";
            }
            case "sm": {
                return "32px";
            }
            case "xl": {
                return "56px";
            }
            case "xs": {
                return "24px";
            }

            default: {
                return "40px";
            }
        }
    };

    const buttonSize = getSize();

    const buttonStyle = useMemo(
        () => ({
            height: buttonSize,
            minWidth: "unset",
            padding: "0",
            width: buttonSize,
        }),
        [buttonSize]
    );

    return (
        <ThemedButton
            className={`themed-icon-button ${className}`}
            disabled={disabled}
            loading={loading}
            size={size}
            variant={variant}
            {...(onClick && { onClick })}
            icon={icon}
            {...(iconColor && { iconColor })}
            style={buttonStyle}
            {...(tooltip && { title: tooltip })}
        />
    );
};

export default ThemedIconButton;
