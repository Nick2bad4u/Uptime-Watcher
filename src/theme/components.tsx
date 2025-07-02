/**
 * Themed UI components for the Uptime Watcher application.
 *
 * Provides a comprehensive set of themed React components including boxes, buttons,
 * inputs, selects, badges, and specialized components for status display.
 * All components support the application's theming system with variants,
 * surfaces, and responsive design capabilities.
 */

import React from "react";

import { ARIA_LABEL, TRANSITION_ALL } from "../constants";
import { useTheme, useThemeClasses } from "../theme/useTheme";
import { getStatusIcon } from "../utils/status";
import { formatResponseTime } from "../utils/time";
import "./components.css";

// Type aliases for commonly used union types
type BoxVariant = "primary" | "secondary" | "tertiary";
type BoxSurface = "base" | "elevated" | "overlay";
type BoxPadding = "xs" | "sm" | "md" | "lg" | "xl";
type BoxRounded = "none" | "sm" | "md" | "lg" | "xl" | "full";
type BoxShadow = "sm" | "md" | "lg" | "xl" | "inner";
type BoxElement = "div" | "button" | "section" | "article" | "aside" | "header" | "footer" | "nav";

type TextVariant =
    | "primary"
    | "secondary"
    | "tertiary"
    | "inverse"
    | "error"
    | "success"
    | "warning"
    | "danger"
    | "info";
type TextSize = "xs" | "sm" | "md" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
type TextWeight = "normal" | "medium" | "semibold" | "bold";
type TextAlign = "left" | "center" | "right" | "justify";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "success" | "warning" | "error" | "ghost" | "outline";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "error" | "info";
type BadgeSize = "xs" | "sm" | "md" | "lg";

// Constants for commonly duplicated strings
const CSS_CLASSES = {
    THEMED_BADGE: "themed-badge",
    THEMED_BOX: "themed-box",
    THEMED_BUTTON: "themed-button",
    THEMED_TEXT: "themed-text",
} as const;

interface ThemeProviderProps {
    readonly children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    // Initialize theme on mount
    useTheme();

    return <>{children}</>;
}

interface ThemedBoxProps {
    readonly variant?: BoxVariant;
    readonly surface?: BoxSurface;
    readonly padding?: BoxPadding;
    readonly rounded?: BoxRounded;
    readonly shadow?: BoxShadow;
    readonly border?: boolean;
    readonly className?: string;
    readonly style?: React.CSSProperties;
    readonly onClick?: (e?: React.MouseEvent<HTMLElement>) => void;
    readonly onMouseEnter?: () => void;
    readonly onMouseLeave?: () => void;
    readonly children: React.ReactNode;
    readonly as?: BoxElement;
    readonly role?: string;
    readonly tabIndex?: number;
    // eslint-disable-next-line sonarjs/no-duplicate-string -- Standard ARIA attribute name
    readonly "aria-label"?: string;
}

export function ThemedBox({
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
    style = {},
    surface = "base",
    tabIndex,
    variant = "primary",
}: ThemedBoxProps) {
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
    const elementProps = {
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

    return React.createElement(Component, elementProps, children);
}

interface ThemedTextProps {
    readonly variant?: TextVariant;
    readonly size?: TextSize;
    readonly weight?: TextWeight;
    readonly align?: TextAlign;
    readonly className?: string;
    readonly style?: React.CSSProperties;
    readonly children: React.ReactNode;
}

export function ThemedText({
    align = "left",
    children,
    className = "",
    size = "base",
    style = {},
    variant = "primary",
    weight = "normal",
}: ThemedTextProps) {
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

interface ThemedButtonProps {
    readonly variant?: ButtonVariant;
    readonly size?: ButtonSize;
    readonly type?: "button" | "submit" | "reset";
    readonly disabled?: boolean;
    readonly loading?: boolean;
    readonly fullWidth?: boolean;
    readonly icon?: React.ReactNode;
    readonly iconColor?: string;
    readonly iconPosition?: "left" | "right";
    readonly className?: string;
    readonly style?: React.CSSProperties;
    readonly title?: string;
    readonly onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    readonly children?: React.ReactNode;
    readonly "aria-label"?: string;
}

// Utility: map color name to CSS class for icon coloring
function getIconColorClass(color?: string): string | undefined {
    if (!color) return undefined;
    switch (color) {
        case "primary":
            return "themed-icon--primary";
        case "secondary":
            return "themed-icon--secondary";
        case "success":
            return "themed-icon--success";
        case "warning":
            return "themed-icon--warning";
        case "error":
        case "danger":
            return "themed-icon--error";
        case "info":
            return "themed-icon--info";
        default:
            // If it's a hex or rgb(a) or custom string, fallback to inline style
            return undefined;
    }
}

// Utility: always wrap icon in a <span> with color class or style
function renderColoredIcon(icon: React.ReactNode, color?: string) {
    if (!icon) return icon;
    const colorClass = getIconColorClass(color);
    if (colorClass) {
        return <span className={colorClass}>{icon}</span>;
    }
    if (color) {
        return <span style={{ color }}>{icon}</span>;
    }
    return icon;
}

export function ThemedButton({
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
    style = {},
    title,
    type = "button",
    variant = "primary",
}: ThemedButtonProps) {
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
            // eslint-disable-next-line functional/no-let -- we assign iconElement conditionally
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
            type={type}
            className={classNames}
            style={style}
            onClick={(e) => onClick?.(e)}
            disabled={disabled || loading}
            title={title}
            aria-label={ariaLabel}
        >
            {renderContent()}
        </button>
    );
}

interface StatusIndicatorProps {
    readonly status: "up" | "down" | "pending" | "unknown";
    readonly size?: "sm" | "md" | "lg";
    readonly showText?: boolean;
    readonly className?: string;
}

export function StatusIndicator({ className = "", showText = false, size = "md", status }: StatusIndicatorProps) {
    const { getStatusColor } = useTheme();
    const { currentTheme } = useTheme();

    const getSizeStyles = () => {
        switch (size) {
            case "sm":
                return {
                    fontSize: currentTheme.typography.fontSize.xs,
                    height: "8px",
                    iconSize: "12px",
                    width: "8px",
                };
            case "md":
                return {
                    fontSize: currentTheme.typography.fontSize.sm,
                    height: "12px",
                    iconSize: "16px",
                    width: "12px",
                };
            case "lg":
                return {
                    fontSize: currentTheme.typography.fontSize.base,
                    height: "16px",
                    iconSize: "20px",
                    width: "16px",
                };
            default:
                return { iconSize: "16px" };
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
            {showText && (
                <span className="themed-status-indicator__text" style={textStyle}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            )}
        </div>
    );
}

interface ThemedInputProps {
    readonly type?: "text" | "number" | "email" | "password" | "url";
    readonly value?: string | number;
    readonly placeholder?: string;
    readonly disabled?: boolean;
    readonly required?: boolean;
    readonly min?: string | number;
    readonly max?: string | number;
    readonly step?: string | number;
    readonly className?: string;
    readonly id?: string;
    readonly "aria-label"?: string;
    readonly "aria-describedby"?: string;
    readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ThemedInput({
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
}: ThemedInputProps) {
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
            {...(value !== undefined ? { value: inputValue } : {})}
        />
    );
}

interface ThemedSelectProps {
    readonly value?: string | number;
    readonly disabled?: boolean;
    readonly required?: boolean;
    readonly className?: string;
    readonly id?: string;
    readonly title?: string;
    readonly "aria-label"?: string;
    readonly "aria-describedby"?: string;
    readonly onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    readonly onClick?: (e: React.MouseEvent<HTMLSelectElement>) => void;
    readonly onMouseDown?: (e: React.MouseEvent<HTMLSelectElement>) => void;
    readonly children: React.ReactNode;
}

export function ThemedSelect({
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
}: ThemedSelectProps) {
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
            {...(value !== undefined ? { value: selectValue } : {})}
        >
            {children}
        </select>
    );
}

interface ThemedCheckboxProps {
    readonly checked?: boolean;
    readonly disabled?: boolean;
    readonly required?: boolean;
    readonly className?: string;
    readonly "aria-label"?: string;
    readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ThemedCheckbox({
    [ARIA_LABEL]: ariaLabel,
    checked,
    className = "",
    disabled = false,
    onChange,
    required = false,
}: ThemedCheckboxProps) {
    return (
        <input
            type="checkbox"
            {...(checked !== undefined ? { checked } : {})}
            disabled={disabled}
            required={required}
            className={`themed-checkbox ${className}`}
            aria-label={ariaLabel}
            onChange={onChange}
        />
    );
}

interface MiniChartBarProps {
    readonly status: "up" | "down" | "pending" | "unknown";
    readonly responseTime?: number;
    readonly timestamp: string | number | Date;
    readonly className?: string;
}

export function MiniChartBar({ className = "", responseTime, status, timestamp }: MiniChartBarProps) {
    const { getStatusColor } = useTheme();
    const { currentTheme } = useTheme();

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

// Enhanced components with better visual feedback and icons

interface ThemedIconButtonProps {
    readonly icon: React.ReactNode;
    readonly iconColor?: string;
    readonly variant?: ButtonVariant;
    readonly size?: ButtonSize;
    readonly disabled?: boolean;
    readonly loading?: boolean;
    readonly tooltip?: string;
    readonly className?: string;
    readonly onClick?: () => void;
}

export function ThemedIconButton({
    className = "",
    disabled = false,
    icon,
    iconColor,
    loading = false,
    onClick,
    size = "md",
    tooltip,
    variant = "ghost",
}: ThemedIconButtonProps) {
    const getSize = () => {
        switch (size) {
            case "xs":
                return "24px";
            case "sm":
                return "32px";
            case "md":
                return "40px";
            case "lg":
                return "48px";

            default:
                return "40px";
        }
    };

    const buttonSize = getSize();

    return (
        <ThemedButton
            variant={variant}
            size={size}
            disabled={disabled}
            loading={loading}
            className={`themed-icon-button ${className}`}
            onClick={onClick}
            icon={icon}
            iconColor={iconColor}
            style={{
                height: buttonSize,
                minWidth: "unset",
                padding: "0",
                width: buttonSize,
            }}
            title={tooltip}
        />
    );
}

interface ThemedCardProps {
    readonly title?: string;
    readonly subtitle?: string;
    readonly icon?: React.ReactNode;
    readonly iconColor?: string;
    readonly variant?: BoxVariant;
    readonly padding?: BoxPadding;
    readonly rounded?: BoxRounded;
    readonly shadow?: BoxShadow;
    readonly hoverable?: boolean;
    readonly clickable?: boolean;
    readonly className?: string;
    readonly onClick?: () => void;
    readonly onMouseEnter?: () => void;
    readonly onMouseLeave?: () => void;
    readonly children: React.ReactNode;
}

export function ThemedCard({
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
}: ThemedCardProps) {
    const { currentTheme } = useTheme();

    const cardStyles: React.CSSProperties = {
        cursor: clickable ? "pointer" : "default",
        overflow: "hidden",
        position: "relative",
        transition: TRANSITION_ALL,
    };

    return (
        <ThemedBox
            variant={variant}
            surface="elevated"
            padding={padding}
            rounded={rounded}
            shadow={shadow}
            className={`themed-card ${hoverable ? "themed-card--hoverable" : ""} ${clickable ? "themed-card--clickable" : ""} ${className}`}
            style={cardStyles}
            onClick={clickable ? onClick : undefined}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {(title || subtitle || icon) && (
                <div
                    className="themed-card__header"
                    style={{
                        alignItems: "center",
                        display: "flex",
                        gap: currentTheme.spacing.md,
                        marginBottom: currentTheme.spacing.md,
                    }}
                >
                    {icon && (
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
                    )}
                    <div style={{ flex: 1 }}>
                        {title && (
                            <ThemedText variant="primary" size="lg" weight="semibold">
                                {title}
                            </ThemedText>
                        )}
                        {subtitle && (
                            <ThemedText variant="secondary" size="sm">
                                {subtitle}
                            </ThemedText>
                        )}
                    </div>
                </div>
            )}
            <div className="themed-card__content">{children}</div>
        </ThemedBox>
    );
}

interface ThemedBadgeProps {
    readonly variant?: BadgeVariant;
    readonly size?: BadgeSize;
    readonly icon?: React.ReactNode;
    readonly iconColor?: string;
    readonly className?: string;
    readonly children: React.ReactNode;
}

export function ThemedBadge({
    children,
    className = "",
    icon,
    iconColor,
    size = "sm",
    variant = "primary",
}: ThemedBadgeProps) {
    const { currentTheme } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case "primary":
                return {
                    backgroundColor: currentTheme.colors.primary[100],
                    borderColor: currentTheme.colors.primary[200],
                    color: currentTheme.colors.primary[700],
                };
            case "secondary":
                return {
                    backgroundColor: currentTheme.colors.background.secondary,
                    borderColor: currentTheme.colors.border.secondary,
                    color: currentTheme.colors.text.secondary,
                };
            case "success":
                return {
                    backgroundColor: `${currentTheme.colors.success}20`,
                    borderColor: `${currentTheme.colors.success}40`,
                    color: currentTheme.colors.success,
                };
            case "warning":
                return {
                    backgroundColor: `${currentTheme.colors.warning}20`,
                    borderColor: `${currentTheme.colors.warning}40`,
                    color: currentTheme.colors.warning,
                };
            case "error":
                return {
                    backgroundColor: `${currentTheme.colors.error}20`,
                    borderColor: `${currentTheme.colors.error}40`,
                    color: currentTheme.colors.error,
                };
            case "info":
                return {
                    backgroundColor: `${currentTheme.colors.primary[500]}20`,
                    borderColor: `${currentTheme.colors.primary[500]}40`,
                    color: currentTheme.colors.primary[600],
                };
            default:
                return {};
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case "xs":
                return {
                    fontSize: currentTheme.typography.fontSize.xs,
                    padding: `${currentTheme.spacing.xs} ${currentTheme.spacing.sm}`,
                };
            case "sm":
                return {
                    fontSize: currentTheme.typography.fontSize.sm,
                    padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`,
                };
            case "md":
                return {
                    fontSize: currentTheme.typography.fontSize.base,
                    padding: `${currentTheme.spacing.md} ${currentTheme.spacing.lg}`,
                };
            default:
                return {};
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
            {icon && (
                <span style={{ fontSize: "0.9em", lineHeight: "1" }}>
                    {renderColoredIcon(icon, iconColor ?? variant)}
                </span>
            )}
            {children}
        </span>
    );
}

interface ThemedProgressProps {
    readonly value: number;
    readonly max?: number;
    readonly variant?: "primary" | "success" | "warning" | "error";
    readonly size?: "xs" | "sm" | "md" | "lg";
    readonly showLabel?: boolean;
    readonly label?: string;
    readonly className?: string;
}

export function ThemedProgress({
    className = "",
    label,
    max = 100,
    showLabel = false,
    size = "md",
    value,
    variant = "primary",
}: ThemedProgressProps) {
    const { currentTheme } = useTheme();

    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const getVariantColor = () => {
        switch (variant) {
            case "primary":
                return currentTheme.colors.primary[500];
            case "success":
                return currentTheme.colors.success;
            case "warning":
                return currentTheme.colors.warning;
            case "error":
                return currentTheme.colors.error;
            default:
                return currentTheme.colors.primary[500];
        }
    };

    const getHeight = () => {
        switch (size) {
            case "xs":
                return "4px";
            case "sm":
                return "6px";
            case "md":
                return "8px";
            case "lg":
                return "12px";
            default:
                return "8px";
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
            {(showLabel || label) && (
                <div
                    style={{
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: currentTheme.spacing.xs,
                    }}
                >
                    {label && (
                        <ThemedText variant="secondary" size="sm">
                            {label}
                        </ThemedText>
                    )}
                    {showLabel && (
                        <ThemedText variant="secondary" size="sm">
                            {percentage.toFixed(1)}%
                        </ThemedText>
                    )}
                </div>
            )}
            <progress value={value} max={max} style={{ left: "-9999px", position: "absolute", top: "-9999px" }} />
            <div style={containerStyles} aria-hidden="true">
                <div style={progressStyles} />
            </div>
        </div>
    );
}

interface ThemedTooltipProps {
    readonly content: string;
    readonly className?: string;
    readonly children: React.ReactNode;
}

export function ThemedTooltip({ children, className = "", content }: ThemedTooltipProps) {
    return (
        <div className={`themed-tooltip ${className}`} title={content}>
            {children}
        </div>
    );
}
