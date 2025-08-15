import React from "react";

import type {
    BoxElement,
    BoxPadding,
    BoxRounded,
    BoxShadow,
    BoxSurface,
    BoxVariant,
} from "./types";

import { CSS_CLASSES } from "./types";

/**
 * Props for the ThemedBox component
 *
 * @public
 */
export interface ThemedBoxProperties {
    readonly "aria-label"?: string;
    readonly as?: BoxElement;
    readonly border?: boolean;
    readonly children: React.ReactNode;
    readonly className?: string;
    readonly onClick?: (e?: React.MouseEvent<HTMLElement>) => void;
    readonly onMouseEnter?: () => void;
    readonly onMouseLeave?: () => void;
    readonly padding?: BoxPadding;
    readonly role?: string;
    readonly rounded?: BoxRounded;
    readonly shadow?: BoxShadow;
    readonly style?: React.CSSProperties;
    readonly surface?: BoxSurface;
    readonly tabIndex?: number;
    readonly variant?: BoxVariant;
}

// Default styles object to prevent infinite render loops
const DEFAULT_THEMED_BOX_STYLE = {};

/**
 * A themed box component for containers and layouts
 *
 * @param props - The box properties
 *
 * @returns The themed box JSX element
 *
 * @public
 */
const ThemedBox = ({
    "aria-label": ariaLabel,
    as: Component = "div",
    border = false,
    children,
    className = "",
    onClick,
    onMouseEnter,
    onMouseLeave,
    padding = "md",
    role,
    rounded = "md",
    shadow,
    style = DEFAULT_THEMED_BOX_STYLE,
    surface = "base",
    tabIndex,
    variant = "primary",
}: ThemedBoxProperties): React.DetailedReactHTMLElement<
    {
        "aria-label"?: string;
        className: string;
        onClick: ((e: React.MouseEvent<HTMLElement>) => void) | undefined;
        onKeyDown?: (e: React.KeyboardEvent) => void;
        onMouseEnter: (() => void) | undefined;
        onMouseLeave: (() => void) | undefined;
        role?: string;
        style: React.CSSProperties;
        tabIndex?: number;
        type?: "button";
    },
    HTMLElement
> => {
    const classNames = [
        CSS_CLASSES.THEMED_BOX,
        `themed-box--background-${variant}`,
        `themed-box--surface-${surface}`,
        `themed-box--padding-${padding}`,
        `themed-box--rounded-${rounded}`,
        shadow && `themed-box--shadow-${shadow}`,
        border && "themed-box--border",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    // For interactive elements, add proper accessibility attributes
    const isInteractive = Boolean(onClick);
    const elementProperties = {
        className: classNames,
        onClick: onClick
            ? (e: React.MouseEvent<HTMLElement>): void => {
                  onClick(e);
              }
            : undefined,
        onMouseEnter,
        onMouseLeave,
        style,
        ...(isInteractive &&
            Component === "div" && {
                "aria-label": ariaLabel,
                onKeyDown: (e: React.KeyboardEvent): void => {
                    if ((e.key === "Enter" || e.key === " ") && onClick) {
                        e.preventDefault();
                        onClick();
                    }
                },
                role: role ?? "button",
                tabIndex: tabIndex ?? 0,
            }),
        ...(isInteractive &&
            Component === "button" && {
                "aria-label": ariaLabel,
                type: "button" as const,
            }),
    };

    return React.createElement(Component, elementProperties, children);
};

export default ThemedBox;
