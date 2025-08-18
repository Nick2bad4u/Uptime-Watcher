/**
 * Themed box component for consistent container layouts and styling.
 *
 * @remarks
 * Provides a flexible container with support for theming, shadows, padding,
 * borders, and surface variants. This component centralizes visual container
 * concerns so the app can enforce consistent styles across renderer UI
 * components. It renders a semantic element (default `div`) and adapts
 * accessibility attributes when used as an interactive control.
 */

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
 * The props accepted by the {@link ThemedBox} component.
 *
 * @remarks
 * All properties are optional except `children`. Several props have default
 * values which are applied when the prop is omitted (see individual property
 * docs below).
 *
 * @public
 */
export interface ThemedBoxProperties {
    /**
     * Accessible label forwarded to the rendered element.
     *
     * @remarks
     * This maps the HTML attribute `aria-label` to a JavaScript-safe name in
     * JSX consumers. It is used automatically when the component is interactive
     * (when `onClick` is provided).
     */
    readonly "aria-label"?: string;

    /**
     * Element type to render (for example `div`, `button`, `section`).
     *
     * @defaultValue "div"
     */
    readonly as?: BoxElement;

    /**
     * Render a visible border when true.
     *
     * @defaultValue false
     */
    readonly border?: boolean;

    /**
     * Child nodes to render inside the box.
     */
    readonly children: React.ReactNode;

    /**
     * Additional CSS class names appended to the component's generated classes.
     */
    readonly className?: string;

    /**
     * Click handler for interactive usage.
     *
     * @remarks
     * When provided the component will add keyboard handling and ARIA
     * attributes for accessibility if the rendered element is a `div`.
     */
    readonly onClick?: (e?: React.MouseEvent<HTMLElement>) => void;

    /**
     * Mouse enter callback.
     */
    readonly onMouseEnter?: () => void;

    /**
     * Mouse leave callback.
     */
    readonly onMouseLeave?: () => void;

    /**
     * Padding size variant.
     *
     * @defaultValue "md"
     */
    readonly padding?: BoxPadding;

    /**
     * Explicit ARIA role to apply when the component becomes interactive.
     */
    readonly role?: string;

    /**
     * Border radius variant.
     *
     * @defaultValue "md"
     */
    readonly rounded?: BoxRounded;

    /**
     * Shadow depth variant. When omitted, no shadow class is added.
     */
    readonly shadow?: BoxShadow;

    /**
     * Inline style object forwarded to the element.
     *
     * @defaultValue { } (internal singleton)
     */
    readonly style?: React.CSSProperties;

    /**
     * Surface variant used to select contextual surface styles.
     *
     * @defaultValue "base"
     */
    readonly surface?: BoxSurface;

    /**
     * Explicit tabIndex for interactive elements. When omitted and the
     * component is interactive, a sensible default is applied.
     */
    readonly tabIndex?: number;

    /**
     * Visual variant used to choose background styling.
     *
     * @defaultValue "primary"
     */
    readonly variant?: BoxVariant;
}

// Default styles object to prevent infinite render loops
/**
 * Default inline style used when no `style` prop is provided.
 *
 * @remarks
 * A shared, frozen empty object is used to avoid creating a new object on every
 * render which could otherwise lead to unnecessary re-renders for consumers
 * that compare by reference.
 *
 * @internal
 */
const DEFAULT_THEMED_BOX_STYLE = {};

/**
 * Themed box component for container layout and visual consistency.
 *
 * @remarks
 * This component composes utility CSS classes (from {@link CSS_CLASSES} and
 * local `themed-box--*` classes) to provide consistent padding, rounding,
 * shadows, and surface/variant backgrounds. When an `onClick` handler is
 * provided the component augments the rendered element with keyboard handling
 * and ARIA attributes to behave like a button when the element is a `div`.
 *
 * @example
 *
 * ```tsx
 * <ThemedBox padding="lg" rounded="xl" variant="secondary">
 *     <p>Content</p>
 * </ThemedBox>;
 * ```
 *
 * @param aria-label - Accessible label forwarded to the underlying element
 *   (maps to HTML `aria-label`).
 * @param as - Element tag or component to render. Default: `div`.
 * @param border - Whether to render a border. Default: `false`.
 * @param children - Child nodes to render inside the box.
 * @param className - Additional class names to append.
 * @param onClick - Click handler which enables interactive behavior.
 * @param onMouseEnter - Mouse enter callback.
 * @param onMouseLeave - Mouse leave callback.
 * @param padding - Padding size variant. Default: `md`.
 * @param role - Explicit ARIA role when interactive.
 * @param rounded - Border radius variant. Default: `md`.
 * @param shadow - Shadow depth variant.
 * @param style - Inline style object forwarded to the element.
 * @param surface - Surface variant for contextual surface styling. Default:
 *   `base`.
 * @param tabIndex - Explicit tabIndex when interactive.
 * @param variant - Visual variant that controls background. Default: `primary`.
 *
 * @returns A React element representing the themed box.
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
