/**
 * Shared type definitions for themed UI components.
 *
 * Contains all the common types and interfaces used across the themed component
 * library.
 */

/** Size variants for badge components */
export type BadgeSize = "lg" | "md" | "sm" | "xs";

/** Visual style variants for badge components */
export type BadgeVariant =
    | "error"
    | "info"
    | "primary"
    | "secondary"
    | "success"
    | "warning";

/** HTML element types that can be used as box containers */
export type BoxElement =
    | "article"
    | "aside"
    | "button"
    | "div"
    | "footer"
    | "header"
    | "nav"
    | "section";

/** Padding size variants for box components */
export type BoxPadding = "lg" | "md" | "sm" | "xl" | "xs";

/** Border radius variants for box components */
export type BoxRounded = "full" | "lg" | "md" | "none" | "sm" | "xl";

/** Shadow depth variants for box components */
export type BoxShadow = "inner" | "lg" | "md" | "sm" | "xl";

/** Surface depth variants for box components */
export type BoxSurface = "base" | "elevated" | "overlay";

/** Visual style variants for box components */
export type BoxVariant = "primary" | "secondary" | "tertiary";

/** Size variants for button components */
export type ButtonSize = "lg" | "md" | "sm" | "xl" | "xs";

/** Visual style variants for button components */
export type ButtonVariant =
    | "error"
    | "ghost"
    | "outline"
    | "primary"
    | "secondary"
    | "success"
    | "tertiary"
    | "warning";

/** Text alignment options for text components */
export type TextAlign = "center" | "justify" | "left" | "right";

/** Font size variants for text components */
export type TextSize =
    | "2xl"
    | "3xl"
    | "4xl"
    | "base"
    | "lg"
    | "md"
    | "sm"
    | "xl"
    | "xs";

/** Color and semantic variants for text components */
export type TextVariant =
    | "danger"
    | "error"
    | "info"
    | "inverse"
    | "primary"
    | "secondary"
    | "success"
    | "tertiary"
    | "warning";

/** Font weight variants for text components */
export type TextWeight = "bold" | "medium" | "normal" | "semibold";

/**
 * CSS class name constants for themed components.
 *
 * @remarks
 * Provides centralized constants for CSS class names used across themed
 * components to ensure consistency and prevent typos.
 */
export const CSS_CLASSES = {
    /** Base CSS class for themed badge components */
    THEMED_BADGE: "themed-badge",
    /** Base CSS class for themed box components */
    THEMED_BOX: "themed-box",
    /** Base CSS class for themed button components */
    THEMED_BUTTON: "themed-button",
    /** Base CSS class for themed text components */
    THEMED_TEXT: "themed-text",
} as const;
