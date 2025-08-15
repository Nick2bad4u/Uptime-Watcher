import React from "react";

import type { ButtonSize, ButtonVariant } from "./types";

import ThemedButton from "./ThemedButton";

/**
 * Props for the ThemedIconButton component
 *
 * @public
 */
export interface ThemedIconButtonProperties {
    readonly className?: string;
    readonly disabled?: boolean;
    readonly icon: React.ReactNode;
    readonly iconColor?: string;
    readonly loading?: boolean;
    readonly onClick?: () => void;
    readonly size?: ButtonSize;
    readonly tooltip?: string;
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
            // eslint-disable-next-line @arthurgeron/react-usememo/require-usememo
            style={{
                height: buttonSize,
                minWidth: "unset",
                padding: "0",
                width: buttonSize,
            }}
            {...(tooltip && { title: tooltip })}
        />
    );
};

export default ThemedIconButton;
