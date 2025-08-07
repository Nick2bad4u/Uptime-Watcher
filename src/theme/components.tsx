/**
 * Themed UI components for the Uptime Watcher application.
 *
 * Provides a comprehensive set of themed React components including boxes, buttons,
 * inputs, selects, badges, and specialized components for status display.
 * All components support the application's theming system with variants,
 * surfaces, and responsive design capabilities.
 *
 * Note: className is a standard React prop and should not be renamed.
 */

import type { MonitorStatus, SiteStatus } from "@shared/types";
import type { JSX } from "react/jsx-runtime";

import React from "react";

import { ARIA_LABEL, TRANSITION_ALL } from "../constants";
import { getStatusIcon } from "../utils/status";
import { formatResponseTime } from "../utils/time";
import "./components.css";
import { useTheme, useThemeClasses } from "./useTheme";

export type BadgeSize = "lg" | "md" | "sm" | "xs";
export type BadgeVariant = "error" | "info" | "primary" | "secondary" | "success" | "warning";
export type BoxElement = "article" | "aside" | "button" | "div" | "footer" | "header" | "nav" | "section";
export type BoxPadding = "lg" | "md" | "sm" | "xl" | "xs";
export type BoxRounded = "full" | "lg" | "md" | "none" | "sm" | "xl";
export type BoxShadow = "inner" | "lg" | "md" | "sm" | "xl";

export type BoxSurface = "base" | "elevated" | "overlay";
// Type aliases for commonly used union types
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
export type TextSize = "2xl" | "3xl" | "4xl" | "base" | "lg" | "md" | "sm" | "xl" | "xs";

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
const CSS_CLASSES = {
    THEMED_BADGE: "themed-badge",
    THEMED_BOX: "themed-box",
    THEMED_BUTTON: "themed-button",
    THEMED_TEXT: "themed-text",
} as const;

/**
 * Props for the MiniChartBar component
 *
 * @public
 */
export interface MiniChartBarProperties {
    readonly className?: string;
    readonly responseTime?: number;
    readonly status: MonitorStatus | SiteStatus;
    readonly timestamp: Date | number | string;
}

/**
 * Props for the StatusIndicator component
 *
 * @public
 */
export interface StatusIndicatorProperties {
    readonly className?: string;
    readonly showText?: boolean;
    readonly size?: "lg" | "md" | "sm";
    readonly status: SiteStatus;
}

/**
 * Props for the ThemedBadge component
 *
 * @public
 */
export interface ThemedBadgeProperties {
    readonly children: React.ReactNode;
    readonly className?: string;
    readonly icon?: React.ReactNode;
    readonly iconColor?: string;
    readonly size?: BadgeSize;
    readonly variant?: BadgeVariant;
}

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

/**
 * Props for the ThemedButton component
 *
 * @public
 */
export interface ThemedButtonProperties {
    readonly "aria-label"?: string;
    readonly children?: React.ReactNode;
    readonly className?: string;
    readonly disabled?: boolean;
    readonly fullWidth?: boolean;
    readonly icon?: React.ReactNode;
    readonly iconColor?: string;
    readonly iconPosition?: "left" | "right";
    readonly loading?: boolean;
    readonly onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    readonly size?: ButtonSize;
    readonly style?: React.CSSProperties;
    readonly title?: string;
    readonly type?: "button" | "reset" | "submit";
    readonly variant?: ButtonVariant;
}

/**
 * Props for the ThemedCard component
 *
 * @public
 */
export interface ThemedCardProperties {
    readonly children: React.ReactNode;
    readonly className?: string;
    readonly clickable?: boolean;
    readonly hoverable?: boolean;
    readonly icon?: React.ReactNode;
    readonly iconColor?: string;
    readonly onClick?: () => void;
    readonly onMouseEnter?: () => void;
    readonly onMouseLeave?: () => void;
    readonly padding?: BoxPadding;
    readonly rounded?: BoxRounded;
    readonly shadow?: BoxShadow;
    readonly subtitle?: string;
    readonly title?: string;
    readonly variant?: BoxVariant;
}

/**
 * Props for the ThemedCheckbox component
 *
 * @public
 */
export interface ThemedCheckboxProperties {
    readonly "aria-label"?: string;
    readonly checked?: boolean;
    readonly className?: string;
    readonly disabled?: boolean;
    readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    readonly required?: boolean;
}

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
 * Props for the ThemedInput component
 *
 * @public
 */
export interface ThemedInputProperties {
    readonly "aria-describedby"?: string;
    readonly "aria-label"?: string;
    readonly className?: string;
    readonly disabled?: boolean;
    readonly id?: string;
    readonly max?: number | string;
    readonly min?: number | string;
    readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    readonly placeholder?: string;
    readonly required?: boolean;
    readonly step?: number | string;
    readonly type?: "email" | "number" | "password" | "text" | "url";
    readonly value?: number | string;
}

/**
 * Props for the ThemedProgress component
 *
 * @public
 */
export interface ThemedProgressProperties {
    readonly className?: string;
    readonly label?: string;
    readonly max?: number;
    readonly showLabel?: boolean;
    readonly size?: "lg" | "md" | "sm" | "xs";
    readonly value: number;
    readonly variant?: "error" | "primary" | "success" | "warning";
}

/**
 * Props for the ThemedSelect component
 *
 * @public
 */
export interface ThemedSelectProperties {
    readonly "aria-describedby"?: string;
    readonly "aria-label"?: string;
    readonly children: React.ReactNode;
    readonly className?: string;
    readonly disabled?: boolean;
    readonly id?: string;
    readonly onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    readonly onClick?: (e: React.MouseEvent<HTMLSelectElement>) => void;
    readonly onMouseDown?: (e: React.MouseEvent<HTMLSelectElement>) => void;
    readonly required?: boolean;
    readonly title?: string;
    readonly value?: number | string;
}

/**
 * Props for the ThemedText component
 *
 * @public
 */
export interface ThemedTextProperties {
    readonly align?: TextAlign;
    readonly children: React.ReactNode;
    readonly className?: string;
    readonly size?: TextSize;
    readonly style?: React.CSSProperties;
    readonly variant?: TextVariant;
    readonly weight?: TextWeight;
}

/**
 * Props for the ThemedTooltip component
 *
 * @public
 */
export interface ThemedTooltipProperties {
    readonly children: React.ReactNode;
    readonly className?: string;
    readonly content: string;
}

/**
 * Props for the ThemeProvider component
 *
 * @public
 */
export interface ThemeProviderProperties {
    readonly children: React.ReactNode;
}

export const MiniChartBar = ({ className = "", responseTime, status, timestamp }: MiniChartBarProperties): JSX.Element => {
    const { currentTheme, getStatusColor } = useTheme();

    const styles: React.CSSProperties = {
        backgroundColor: getStatusColor(status),
        borderRadius: currentTheme.borderRadius.sm,
        height: "32px",
        width: "8px",
    };
    return (
        <div
            className={`themed-mini-chart-bar ${className}`}
            style={styles}
            title={`${status} - ${formatResponseTime(responseTime)} at ${new Date(timestamp).toLocaleString()}`}
        />
    );
}

export const StatusIndicator = ({
    className = "",
    showText = false,
    size = "md",
    status,
}: StatusIndicatorProperties): JSX.Element => {
    const { currentTheme, getStatusColor } = useTheme();

    const getSizeStyles = () => {
        switch (size) {
            case "lg": {
                return {
                    fontSize: currentTheme.typography.fontSize.base,
                    height: "16px",
                    iconSize: "20px",
                    width: "16px",
                };
            }
            case "md": {
                return {
                    fontSize: currentTheme.typography.fontSize.sm,
                    height: "12px",
                    iconSize: "16px",
                    width: "12px",
                };
            }
            case "sm": {
                return {
                    fontSize: currentTheme.typography.fontSize.xs,
                    height: "8px",
                    iconSize: "12px",
                    width: "8px",
                };
            }
            default: {
                return { iconSize: "16px" };
            }
        }
    };

    const sizeStyles = getSizeStyles();

    const indicatorStyle: React.CSSProperties = {
        animation: status === "pending" ? "pulse 1.5s ease-in-out infinite" : undefined,
        backgroundColor: getStatusColor(status),
        borderRadius: currentTheme.borderRadius.full,
        boxShadow: `0 0 0 2px ${currentTheme.colors.background.primary}`,
        height: sizeStyles.height,
        position: "relative",
        width: sizeStyles.width,
    };

    const iconStyle: React.CSSProperties = {
        alignItems: "center",
        display: "flex",
        fontSize: sizeStyles.iconSize,
        justifyContent: "center",
        lineHeight: "1",
    };

    const textStyle: React.CSSProperties = {
        alignItems: "center",
        color: getStatusColor(status),
        display: "flex",
        fontSize: sizeStyles.fontSize,
        fontWeight: currentTheme.typography.fontWeight.medium,
        gap: currentTheme.spacing.xs,
        marginLeft: currentTheme.spacing.xs,
    };

    return (
        <div className={`themed-status-indicator ${className}`} style={{ alignItems: "center", display: "flex" }}>
            {showText ? (
                <div style={iconStyle}>{getStatusIcon(status)}</div>
            ) : (
                <div className="themed-status-indicator__dot" style={indicatorStyle} />
            )}
            {showText ? (
                <span className="themed-status-indicator__text" style={textStyle}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            ) : null}
        </div>
    );
}

export const ThemedBadge = ({
    children,
    className = "",
    icon,
    iconColor,
    size = "sm",
    variant = "primary",
}: ThemedBadgeProperties): JSX.Element => {
    const { currentTheme } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case "error": {
                return {
                    backgroundColor: `${currentTheme.colors.error}20`,
                    borderColor: `${currentTheme.colors.error}40`,
                    color: currentTheme.colors.error,
                };
            }
            case "info": {
                return {
                    backgroundColor: `${currentTheme.colors.primary[500]}20`,
                    borderColor: `${currentTheme.colors.primary[500]}40`,
                    color: currentTheme.colors.primary[600],
                };
            }
            case "primary": {
                return {
                    backgroundColor: currentTheme.colors.primary[100],
                    borderColor: currentTheme.colors.primary[200],
                    color: currentTheme.colors.primary[700],
                };
            }
            case "secondary": {
                return {
                    backgroundColor: currentTheme.colors.background.secondary,
                    borderColor: currentTheme.colors.border.secondary,
                    color: currentTheme.colors.text.secondary,
                };
            }
            case "success": {
                return {
                    backgroundColor: `${currentTheme.colors.success}20`,
                    borderColor: `${currentTheme.colors.success}40`,
                    color: currentTheme.colors.success,
                };
            }
            case "warning": {
                return {
                    backgroundColor: `${currentTheme.colors.warning}20`,
                    borderColor: `${currentTheme.colors.warning}40`,
                    color: currentTheme.colors.warning,
                };
            }
            default: {
                return {};
            }
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case "lg": {
                return {
                    fontSize: currentTheme.typography.fontSize.lg,
                    padding: `${currentTheme.spacing.lg} ${currentTheme.spacing.xl}`,
                };
            }
            case "md": {
                return {
                    fontSize: currentTheme.typography.fontSize.base,
                    padding: `${currentTheme.spacing.md} ${currentTheme.spacing.lg}`,
                };
            }
            case "sm": {
                return {
                    fontSize: currentTheme.typography.fontSize.sm,
                    padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`,
                };
            }
            case "xs": {
                return {
                    fontSize: currentTheme.typography.fontSize.xs,
                    padding: `${currentTheme.spacing.xs} ${currentTheme.spacing.sm}`,
                };
            }
            default: {
                return {};
            }
        }
    };

    const badgeStyles: React.CSSProperties = {
        ...getVariantStyles(),
        ...getSizeStyles(),
        alignItems: "center",
        borderRadius: currentTheme.borderRadius.full,
        borderStyle: "solid",
        borderWidth: "1px",
        display: "inline-flex",
        fontWeight: currentTheme.typography.fontWeight.medium,
        gap: currentTheme.spacing.xs,
        lineHeight: "1",
        whiteSpace: "nowrap",
    };

    return (
        <span
            className={`themed-badge themed-badge--${variant} themed-badge--${size} ${className}`}
            style={badgeStyles}
        >
            {icon ? (
                <span style={{ fontSize: "0.9em", lineHeight: "1" }}>
                    {renderColoredIcon(icon, iconColor ?? variant)}
                </span>
            ) : null}
            {children}
        </span>
    );
}

// Default styles object to prevent infinite render loops
const DEFAULT_THEMED_BOX_STYLE = {};

export const ThemedBox = ({
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
        onClick: onClick ? (e: React.MouseEvent<HTMLElement>) => onClick(e) : undefined,
        onMouseEnter,
        onMouseLeave,
        style,
        ...(isInteractive &&
            Component === "div" && {
                "aria-label": ariaLabel,
                onKeyDown: (e: React.KeyboardEvent) => {
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
}

export const ThemedButton = ({
    "aria-label": ariaLabel,
    children,
    className = "",
    disabled = false,
    fullWidth = false,
    icon,
    iconColor,
    iconPosition = "left",
    loading = false,
    onClick,
    size = "md",
    style = DEFAULT_THEMED_BOX_STYLE,
    title,
    type = "button",
    variant = "primary",
}: ThemedButtonProperties): JSX.Element => {
    const classNames = [
        CSS_CLASSES.THEMED_BUTTON,
        `themed-button--${variant}`,
        `themed-button--size-${size}`,
        fullWidth && "themed-button--full-width",
        (disabled || loading) && "themed-button--loading",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    // eslint-disable-next-line sonarjs/function-return-type -- React component can return different node types
    const renderContent = () => {
        if (loading) {
            return (
                <div className="themed-button__loading">
                    <div className="themed-button__spinner" />
                    <span>{children}</span>
                </div>
            );
        }
        if (icon) {
            let iconElement: React.ReactNode;
            if (React.isValidElement(icon) && iconColor) {
                iconElement = renderColoredIcon(icon, iconColor);
            } else if (iconColor) {
                iconElement = renderColoredIcon(icon, iconColor);
            } else {
                iconElement = icon;
            }
            if (!children) {
                return iconElement;
            }
            return iconPosition === "left" ? (
                <>
                    {iconElement}
                    <span>{children}</span>
                </>
            ) : (
                <>
                    <span>{children}</span>
                    {iconElement}
                </>
            );
        }
        return children;
    };

    return (
        <button
            aria-label={ariaLabel}
            className={classNames}
            disabled={disabled || loading}
            onClick={(e) => onClick?.(e)}
            style={style}
            title={title}
            // eslint-disable-next-line react/button-has-type -- Type is correctly typed with default value
            type={type}
        >
            {renderContent()}
        </button>
    );
}

export const ThemedCard = ({
    children,
    className = "",
    clickable = false,
    hoverable = false,
    icon,
    iconColor,
    onClick,
    onMouseEnter,
    onMouseLeave,
    padding = "lg",
    rounded = "lg",
    shadow = "md",
    subtitle,
    title,
    variant = "primary",
}: ThemedCardProperties): JSX.Element => {
    const { currentTheme } = useTheme();

    const cardStyles: React.CSSProperties = {
        cursor: clickable ? "pointer" : "default",
        overflow: "hidden",
        position: "relative",
        transition: TRANSITION_ALL,
    };

    return (
        <ThemedBox
            className={`themed-card ${hoverable ? "themed-card--hoverable" : ""} ${clickable ? "themed-card--clickable" : ""} ${className}`}
            padding={padding}
            rounded={rounded}
            shadow={shadow}
            style={cardStyles}
            surface="elevated"
            variant={variant}
            {...(clickable && onClick && { onClick })}
            {...(onMouseEnter && { onMouseEnter })}
            {...(onMouseLeave && { onMouseLeave })}
        >
            {(title ?? subtitle ?? icon) ? (
                <div
                    className="themed-card__header"
                    style={{
                        alignItems: "center",
                        display: "flex",
                        gap: currentTheme.spacing.md,
                        marginBottom: currentTheme.spacing.md,
                    }}
                >
                    {icon ? (
                        <span
                            style={{
                                alignItems: "center",
                                display: "flex",
                                fontSize: "1.5em",
                                lineHeight: "1",
                            }}
                        >
                            {renderColoredIcon(icon, iconColor ?? "primary")}
                        </span>
                    ) : null}
                    <div style={{ flex: 1 }}>
                        {title ? (
                            <ThemedText size="lg" variant="primary" weight="semibold">
                                {title}
                            </ThemedText>
                        ) : null}
                        {subtitle ? (
                            <ThemedText size="sm" variant="secondary">
                                {subtitle}
                            </ThemedText>
                        ) : null}
                    </div>
                </div>
            ) : null}
            <div className="themed-card__content">{children}</div>
        </ThemedBox>
    );
}

// Enhanced components with better visual feedback and icons

export const ThemedCheckbox = ({
    [ARIA_LABEL]: ariaLabel,
    checked,
    className = "",
    disabled = false,
    onChange,
    required = false,
}: ThemedCheckboxProperties): JSX.Element => {
    return (
        <input
            type="checkbox"
            {...(checked === undefined ? {} : { checked })}
            aria-label={ariaLabel}
            className={`themed-checkbox ${className}`}
            disabled={disabled}
            onChange={onChange}
            required={required}
        />
    );
}

export const ThemedIconButton = ({
    className = "",
    disabled = false,
    icon,
    iconColor,
    loading = false,
    onClick,
    size = "md",
    tooltip,
    variant = "ghost",
}: ThemedIconButtonProperties): JSX.Element => {
    const getSize = () => {
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
            style={{
                height: buttonSize,
                minWidth: "unset",
                padding: "0",
                width: buttonSize,
            }}
            {...(tooltip && { title: tooltip })}
        />
    );
}

export const ThemedInput = ({
    "aria-describedby": ariaDescribedBy,
    [ARIA_LABEL]: ariaLabel,
    className = "",
    disabled = false,
    id,
    max,
    min,
    onChange,
    placeholder,
    required = false,
    step,
    type = "text",
    value,
}: ThemedInputProperties): JSX.Element => {
    const { currentTheme } = useTheme();
    const { getBackgroundClass, getBorderClass, getTextClass } = useThemeClasses();

    // Ensure value is always defined to prevent controlled/uncontrolled warnings
    const inputValue = value ?? "";

    const styles: React.CSSProperties = {
        ...getBackgroundClass("primary"),
        ...getTextClass("primary"),
        ...getBorderClass("primary"),
        borderRadius: currentTheme.borderRadius.md,
        borderStyle: "solid",
        borderWidth: "1px",
        fontSize: currentTheme.typography.fontSize.sm,
        padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`,
        transition: TRANSITION_ALL,
        width: "100%",
    };
    return (
        <input
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
            className={`themed-input ${className}`}
            disabled={disabled}
            id={id}
            max={max}
            min={min}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            step={step}
            style={styles}
            type={type}
            {...(value === undefined ? {} : { value: inputValue })}
        />
    );
}

export const ThemedProgress = ({
    className = "",
    label,
    max = 100,
    showLabel = false,
    size = "md",
    value,
    variant = "primary",
}: ThemedProgressProperties): JSX.Element => {
    const { currentTheme } = useTheme();

    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const getVariantColor = () => {
        switch (variant) {
            case "error": {
                return currentTheme.colors.error;
            }
            case "primary": {
                return currentTheme.colors.primary[500];
            }
            case "success": {
                return currentTheme.colors.success;
            }
            case "warning": {
                return currentTheme.colors.warning;
            }
            default: {
                return currentTheme.colors.primary[500];
            }
        }
    };

    const getHeight = () => {
        switch (size) {
            case "lg": {
                return "12px";
            }
            case "md": {
                return "8px";
            }
            case "sm": {
                return "6px";
            }
            case "xs": {
                return "4px";
            }
            default: {
                return "8px";
            }
        }
    };

    const containerStyles: React.CSSProperties = {
        backgroundColor: currentTheme.colors.background.secondary,
        borderRadius: currentTheme.borderRadius.full,
        height: getHeight(),
        overflow: "hidden",
        position: "relative",
        width: "100%",
    };

    const progressStyles: React.CSSProperties = {
        backgroundColor: getVariantColor(),
        borderRadius: currentTheme.borderRadius.full,
        height: "100%",
        transition: "width 0.3s ease-in-out",
        width: `${percentage}%`,
    };

    return (
        <div className={`themed-progress ${className}`}>
            {showLabel || label ? (
                <div
                    style={{
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: currentTheme.spacing.xs,
                    }}
                >
                    {label ? (
                        <ThemedText size="sm" variant="secondary">
                            {label}
                        </ThemedText>
                    ) : null}
                    {showLabel ? (
                        <ThemedText size="sm" variant="secondary">
                            {percentage.toFixed(1)}%
                        </ThemedText>
                    ) : null}
                </div>
            ) : null}
            <progress max={max} style={{ left: "-9999px", position: "absolute", top: "-9999px" }} value={value} />
            <div aria-hidden="true" style={containerStyles}>
                <div style={progressStyles} />
            </div>
        </div>
    );
}

export const ThemedSelect = ({
    "aria-describedby": ariaDescribedBy,
    [ARIA_LABEL]: ariaLabel,
    children,
    className = "",
    disabled = false,
    id,
    onChange,
    onClick,
    onMouseDown,
    required = false,
    title,
    value,
}: ThemedSelectProperties): JSX.Element => {
    const { currentTheme } = useTheme();
    const { getBackgroundClass, getBorderClass, getTextClass } = useThemeClasses();

    // Ensure value is always defined to prevent controlled/uncontrolled warnings
    const selectValue = value ?? "";

    const styles: React.CSSProperties = {
        ...getBackgroundClass("primary"),
        ...getTextClass("primary"),
        ...getBorderClass("primary"),
        borderRadius: currentTheme.borderRadius.md,
        borderStyle: "solid",
        borderWidth: "1px",
        fontSize: currentTheme.typography.fontSize.sm,
        padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`,
        transition: TRANSITION_ALL,
        width: "100%",
    };
    return (
        <select
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
            className={`themed-select ${className}`}
            disabled={disabled}
            id={id}
            onChange={onChange}
            onClick={onClick}
            onMouseDown={onMouseDown}
            required={required}
            style={styles}
            title={title}
            {...(value === undefined ? {} : { value: selectValue })}
        >
            {children}
        </select>
    );
}

export const ThemedText = ({
    align = "left",
    children,
    className = "",
    size = "base",
    style = DEFAULT_THEMED_BOX_STYLE,
    variant = "primary",
    weight = "normal",
}: ThemedTextProperties): JSX.Element => {
    const classNames = [
        CSS_CLASSES.THEMED_TEXT,
        `themed-text--${variant}`,
        `themed-text--size-${size}`,
        `themed-text--weight-${weight}`,
        `themed-text--align-${align}`,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <span className={classNames} style={style}>
            {children}
        </span>
    );
}

export const ThemedTooltip = ({ children, className = "", content }: ThemedTooltipProperties): JSX.Element => {
    return (
        <div className={`themed-tooltip ${className}`} title={content}>
            {children}
        </div>
    );
}

// eslint-disable-next-line sonarjs/function-return-type -- React component returns children as-is
export function ThemeProvider({ children }: ThemeProviderProperties): React.ReactNode {
    // Initialize theme system on mount to ensure theme context is available
    useTheme();

    return children;
}

/**
 * Maps color name to CSS class for icon coloring.
 *
 * @param color - Color name or custom color value
 * @returns CSS class name or undefined for custom colors
 *
 * @internal
 */
function getIconColorClass(color?: string): string | undefined {
    if (!color) {
        return undefined;
    }
    switch (color) {
        case "danger":
        case "error": {
            return "themed-icon--error";
        }
        case "info": {
            return "themed-icon--info";
        }
        case "primary": {
            return "themed-icon--primary";
        }
        case "secondary": {
            return "themed-icon--secondary";
        }
        case "success": {
            return "themed-icon--success";
        }
        case "warning": {
            return "themed-icon--warning";
        }
        default: {
            // If it's a hex or rgb(a) or custom string, fallback to inline style
            return undefined;
        }
    }
}

/**
 * Wraps icon in a span with color class or inline style.
 *
 * @param icon - React icon element
 * @param color - Color name or custom color value
 * @returns Colored icon wrapped in span
 *
 * @internal
 */
function renderColoredIcon(icon: React.ReactNode, color?: string) {
    if (!icon) {
        return icon;
    }
    const colorClass = getIconColorClass(color);
    if (colorClass) {
        return <span className={colorClass}>{icon}</span>;
    }
    if (color) {
        return <span style={{ color }}>{icon}</span>;
    }
    return icon;
}
