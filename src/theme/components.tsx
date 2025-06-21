import React from "react";
import { useTheme, useThemeClasses } from "../theme/useTheme";
import { getStatusIcon } from "../utils/status";
import { formatResponseTime } from "../utils/time";
import "./components.css";

interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    // Initialize theme on mount
    useTheme();

    return <>{children}</>;
}

interface ThemedBoxProps {
    variant?: "primary" | "secondary" | "tertiary";
    surface?: "base" | "elevated" | "overlay";
    padding?: "xs" | "sm" | "md" | "lg" | "xl";
    rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
    shadow?: "sm" | "md" | "lg" | "xl" | "inner";
    border?: boolean;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    children: React.ReactNode;
}

export function ThemedBox({
    variant = "primary",
    surface = "base",
    padding = "md",
    rounded = "md",
    shadow,
    border = false,
    className = "",
    style = {},
    onClick,
    onMouseEnter,
    onMouseLeave,
    children,
}: ThemedBoxProps) {
    const classNames = [
        "themed-box",
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

    return (
        <div
            className={classNames}
            style={style}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {children}
        </div>
    );
}

interface ThemedTextProps {
    variant?: "primary" | "secondary" | "tertiary" | "inverse" | "error" | "success" | "warning" | "danger";
    size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
    weight?: "normal" | "medium" | "semibold" | "bold";
    align?: "left" | "center" | "right";
    className?: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
}

export function ThemedText({
    variant = "primary",
    size = "base",
    weight = "normal",
    align = "left",
    className = "",
    style = {},
    children,
}: ThemedTextProps) {
    const classNames = [
        "themed-text",
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
    variant?: "primary" | "secondary" | "success" | "warning" | "error" | "ghost";
    size?: "xs" | "sm" | "md" | "lg";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconColor?: string;
    iconPosition?: "left" | "right";
    className?: string;
    style?: React.CSSProperties;
    title?: string;
    onClick?: () => void;
    children?: React.ReactNode;
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
    variant = "primary",
    size = "md",
    type = "button",
    disabled = false,
    loading = false,
    fullWidth = false,
    icon,
    iconColor,
    iconPosition = "left",
    className = "",
    style = {},
    title,
    onClick,
    children,
}: ThemedButtonProps) {
    const classNames = [
        "themed-button",
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
                    <div className="themed-button__spinner"></div>
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
            type={type}
            className={classNames}
            style={style}
            onClick={onClick}
            disabled={disabled || loading}
            title={title}
        >
            {renderContent()}
        </button>
    );
}

interface StatusIndicatorProps {
    status: "up" | "down" | "pending" | "unknown";
    size?: "sm" | "md" | "lg";
    showText?: boolean;
    className?: string;
}

export function StatusIndicator({ status, size = "md", showText = false, className = "" }: StatusIndicatorProps) {
    const { getStatusColor } = useTheme();
    const { currentTheme } = useTheme();

    const getSizeStyles = () => {
        switch (size) {
            case "sm":
                return {
                    width: "8px",
                    height: "8px",
                    fontSize: currentTheme.typography.fontSize.xs,
                    iconSize: "12px",
                };
            case "md":
                return {
                    width: "12px",
                    height: "12px",
                    fontSize: currentTheme.typography.fontSize.sm,
                    iconSize: "16px",
                };
            case "lg":
                return {
                    width: "16px",
                    height: "16px",
                    fontSize: currentTheme.typography.fontSize.base,
                    iconSize: "20px",
                };
            default:
                return { iconSize: "16px" };
        }
    };

    const sizeStyles = getSizeStyles();

    const indicatorStyle: React.CSSProperties = {
        width: sizeStyles.width,
        height: sizeStyles.height,
        backgroundColor: getStatusColor(status),
        borderRadius: currentTheme.borderRadius.full,
        position: "relative",
        boxShadow: `0 0 0 2px ${currentTheme.colors.background.primary}`,
        animation: status === "pending" ? "pulse 1.5s ease-in-out infinite" : undefined,
    };

    const iconStyle: React.CSSProperties = {
        fontSize: sizeStyles.iconSize,
        lineHeight: "1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const textStyle: React.CSSProperties = {
        color: getStatusColor(status),
        fontSize: sizeStyles.fontSize,
        fontWeight: currentTheme.typography.fontWeight.medium,
        marginLeft: currentTheme.spacing.xs,
        display: "flex",
        alignItems: "center",
        gap: currentTheme.spacing.xs,
    };

    return (
        <div className={`themed-status-indicator ${className}`} style={{ display: "flex", alignItems: "center" }}>
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
    type?: "text" | "number" | "email" | "password" | "url";
    value?: string | number;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    className?: string;
    "aria-label"?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ThemedInput({
    type = "text",
    value,
    placeholder,
    disabled = false,
    required = false,
    min,
    max,
    step,
    className = "",
    "aria-label": ariaLabel,
    onChange,
}: ThemedInputProps) {
    const { currentTheme } = useTheme();
    const { getBackgroundClass, getTextClass, getBorderClass } = useThemeClasses();

    // Ensure value is always defined to prevent controlled/uncontrolled warnings
    const inputValue = value ?? "";

    const styles: React.CSSProperties = {
        ...getBackgroundClass("primary"),
        ...getTextClass("primary"),
        ...getBorderClass("primary"),
        borderWidth: "1px",
        borderStyle: "solid",
        borderRadius: currentTheme.borderRadius.md,
        padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`,
        width: "100%",
        fontSize: currentTheme.typography.fontSize.sm,
        transition: "all 0.2s ease-in-out",
    };
    return (
        <input
            type={type}
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            min={min}
            max={max}
            step={step}
            className={`themed-input ${className}`}
            style={styles}
            aria-label={ariaLabel}
            onChange={onChange}
        />
    );
}

interface ThemedSelectProps {
    value?: string | number;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    "aria-label"?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
}

export function ThemedSelect({
    value,
    disabled = false,
    required = false,
    className = "",
    "aria-label": ariaLabel,
    onChange,
    children,
}: ThemedSelectProps) {
    const { currentTheme } = useTheme();
    const { getBackgroundClass, getTextClass, getBorderClass } = useThemeClasses();

    // Ensure value is always defined to prevent controlled/uncontrolled warnings
    const selectValue = value ?? "";

    const styles: React.CSSProperties = {
        ...getBackgroundClass("primary"),
        ...getTextClass("primary"),
        ...getBorderClass("primary"),
        borderWidth: "1px",
        borderStyle: "solid",
        borderRadius: currentTheme.borderRadius.md,
        padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`,
        width: "100%",
        fontSize: currentTheme.typography.fontSize.sm,
        transition: "all 0.2s ease-in-out",
    };
    return (
        <select
            value={selectValue}
            disabled={disabled}
            required={required}
            className={`themed-select ${className}`}
            style={styles}
            aria-label={ariaLabel}
            onChange={onChange}
        >
            {children}
        </select>
    );
}

interface ThemedCheckboxProps {
    checked?: boolean;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    "aria-label"?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ThemedCheckbox({
    checked = false,
    disabled = false,
    required = false,
    className = "",
    "aria-label": ariaLabel,
    onChange,
}: ThemedCheckboxProps) {
    return (
        <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            required={required}
            className={`themed-checkbox ${className}`}
            aria-label={ariaLabel}
            onChange={onChange}
        />
    );
}

interface MiniChartBarProps {
    status: "up" | "down" | "pending" | "unknown";
    responseTime?: number;
    timestamp: string | number | Date;
    className?: string;
}

export function MiniChartBar({ status, responseTime, timestamp, className = "" }: MiniChartBarProps) {
    const { getStatusColor } = useTheme();
    const { currentTheme } = useTheme();

    const styles: React.CSSProperties = {
        width: "8px",
        height: "32px",
        borderRadius: currentTheme.borderRadius.sm,
        backgroundColor: getStatusColor(status),
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
    icon: React.ReactNode;
    iconColor?: string;
    variant?: "primary" | "secondary" | "success" | "warning" | "error" | "ghost";
    size?: "xs" | "sm" | "md" | "lg";
    disabled?: boolean;
    loading?: boolean;
    tooltip?: string;
    className?: string;
    onClick?: () => void;
}

export function ThemedIconButton({
    icon,
    iconColor,
    variant = "ghost",
    size = "md",
    disabled = false,
    loading = false,
    tooltip,
    className = "",
    onClick,
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
                width: buttonSize,
                height: buttonSize,
                padding: "0",
                minWidth: "unset",
            }}
            title={tooltip}
        />
    );
}

interface ThemedCardProps {
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    iconColor?: string;
    variant?: "primary" | "secondary" | "tertiary";
    padding?: "xs" | "sm" | "md" | "lg" | "xl";
    rounded?: "none" | "sm" | "md" | "lg" | "xl";
    shadow?: "sm" | "md" | "lg" | "xl";
    hoverable?: boolean;
    clickable?: boolean;
    className?: string;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    children: React.ReactNode;
}

export function ThemedCard({
    title,
    subtitle,
    icon,
    iconColor,
    variant = "primary",
    padding = "lg",
    rounded = "lg",
    shadow = "md",
    hoverable = false,
    clickable = false,
    className = "",
    onClick,
    onMouseEnter,
    onMouseLeave,
    children,
}: ThemedCardProps) {
    const { currentTheme } = useTheme();

    const cardStyles: React.CSSProperties = {
        transition: "all 0.2s ease-in-out",
        cursor: clickable ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
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
                        display: "flex",
                        alignItems: "center",
                        gap: currentTheme.spacing.md,
                        marginBottom: currentTheme.spacing.md,
                    }}
                >
                    {icon && (
                        <span
                            style={{
                                fontSize: "1.5em",
                                lineHeight: "1",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            {renderColoredIcon(icon, iconColor || "primary")}
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
    variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
    size?: "xs" | "sm" | "md";
    icon?: React.ReactNode;
    iconColor?: string;
    className?: string;
    children: React.ReactNode;
}

export function ThemedBadge({ variant = "primary", size = "sm", icon, iconColor, className = "", children }: ThemedBadgeProps) {
    const { currentTheme } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case "primary":
                return {
                    backgroundColor: currentTheme.colors.primary[100],
                    color: currentTheme.colors.primary[700],
                    borderColor: currentTheme.colors.primary[200],
                };
            case "secondary":
                return {
                    backgroundColor: currentTheme.colors.background.secondary,
                    color: currentTheme.colors.text.secondary,
                    borderColor: currentTheme.colors.border.secondary,
                };
            case "success":
                return {
                    backgroundColor: `${currentTheme.colors.success}20`,
                    color: currentTheme.colors.success,
                    borderColor: `${currentTheme.colors.success}40`,
                };
            case "warning":
                return {
                    backgroundColor: `${currentTheme.colors.warning}20`,
                    color: currentTheme.colors.warning,
                    borderColor: `${currentTheme.colors.warning}40`,
                };
            case "error":
                return {
                    backgroundColor: `${currentTheme.colors.error}20`,
                    color: currentTheme.colors.error,
                    borderColor: `${currentTheme.colors.error}40`,
                };
            case "info":
                return {
                    backgroundColor: `${currentTheme.colors.primary[500]}20`,
                    color: currentTheme.colors.primary[600],
                    borderColor: `${currentTheme.colors.primary[500]}40`,
                };
            default:
                return {};
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case "xs":
                return {
                    padding: `${currentTheme.spacing.xs} ${currentTheme.spacing.sm}`,
                    fontSize: currentTheme.typography.fontSize.xs,
                };
            case "sm":
                return {
                    padding: `${currentTheme.spacing.sm} ${currentTheme.spacing.md}`,
                    fontSize: currentTheme.typography.fontSize.sm,
                };
            case "md":
                return {
                    padding: `${currentTheme.spacing.md} ${currentTheme.spacing.lg}`,
                    fontSize: currentTheme.typography.fontSize.base,
                };
            default:
                return {};
        }
    };

    const badgeStyles: React.CSSProperties = {
        ...getVariantStyles(),
        ...getSizeStyles(),
        display: "inline-flex",
        alignItems: "center",
        gap: currentTheme.spacing.xs,
        borderRadius: currentTheme.borderRadius.full,
        borderWidth: "1px",
        borderStyle: "solid",
        fontWeight: currentTheme.typography.fontWeight.medium,
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
                    {renderColoredIcon(icon, iconColor || variant)}
                </span>
            )}
            {children}
        </span>
    );
}

interface ThemedProgressProps {
    value: number;
    max?: number;
    variant?: "primary" | "success" | "warning" | "error";
    size?: "xs" | "sm" | "md" | "lg";
    showLabel?: boolean;
    label?: string;
    className?: string;
}

export function ThemedProgress({
    value,
    max = 100,
    variant = "primary",
    size = "md",
    showLabel = false,
    label,
    className = "",
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
        width: "100%",
        height: getHeight(),
        backgroundColor: currentTheme.colors.background.secondary,
        borderRadius: currentTheme.borderRadius.full,
        overflow: "hidden",
        position: "relative",
    };

    const progressStyles: React.CSSProperties = {
        height: "100%",
        width: `${percentage}%`,
        backgroundColor: getVariantColor(),
        borderRadius: currentTheme.borderRadius.full,
        transition: "width 0.3s ease-in-out",
    };

    return (
        <div className={`themed-progress ${className}`}>
            {(showLabel || label) && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
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
            <div style={containerStyles}>
                <div style={progressStyles} />
            </div>
        </div>
    );
}

interface ThemedTooltipProps {
    content: string;
    position?: "top" | "bottom" | "left" | "right";
    className?: string;
    children: React.ReactNode;
}

export function ThemedTooltip({ content, className = "", children }: ThemedTooltipProps) {
    return (
        <div className={`themed-tooltip ${className}`} title={content}>
            {children}
        </div>
    );
}
