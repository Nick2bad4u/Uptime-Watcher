/**
 * Shared type definitions for themed UI components.
 *
 * Contains all the common types and interfaces used across the themed component library.
 */

export type BadgeSize = "lg" | "md" | "sm" | "xs";
export type BadgeVariant =
    | "error"
    | "info"
    | "primary"
    | "secondary"
    | "success"
    | "warning";
export type BoxElement =
    | "article"
    | "aside"
    | "button"
    | "div"
    | "footer"
    | "header"
    | "nav"
    | "section";
export type BoxPadding = "lg" | "md" | "sm" | "xl" | "xs";
export type BoxRounded = "full" | "lg" | "md" | "none" | "sm" | "xl";
export type BoxShadow = "inner" | "lg" | "md" | "sm" | "xl";

export type BoxSurface = "base" | "elevated" | "overlay";
export type BoxVariant = "primary" | "secondary" | "tertiary";
export type ButtonSize = "lg" | "md" | "sm" | "xl" | "xs";
export type ButtonVariant =
    | "error"
    | "ghost"
    | "outline"
    | "primary"
    | "secondary"
    | "success"
    | "tertiary"
    | "warning";

export type TextAlign = "center" | "justify" | "left" | "right";
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
export type TextWeight = "bold" | "medium" | "normal" | "semibold";

// Constants for commonly duplicated strings
export const CSS_CLASSES = {
    THEMED_BADGE: "themed-badge",
    THEMED_BOX: "themed-box",
    THEMED_BUTTON: "themed-button",
    THEMED_TEXT: "themed-text",
} as const;
