import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { ARIA_LABEL, TRANSITION_ALL } from "../constants";
import { useTheme, useThemeClasses } from "../theme/useTheme";
import { getStatusIcon } from "../utils/status";
import { formatResponseTime } from "../utils/time";
import "./components.css";
export function ThemeProvider({ children }) {
    // Initialize theme on mount
    useTheme();
    return _jsx(_Fragment, { children: children });
}
export function ThemedBox({ border = false, children, className = "", onClick, onMouseEnter, onMouseLeave, padding = "md", rounded = "md", shadow, style = {}, surface = "base", variant = "primary", }) {
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
    return (_jsx("div", { className: classNames, style: style, onClick: onClick, onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave, children: children }));
}
export function ThemedText({ align = "left", children, className = "", size = "base", style = {}, variant = "primary", weight = "normal", }) {
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
    return (_jsx("span", { className: classNames, style: style, children: children }));
}
// Utility: map color name to CSS class for icon coloring
function getIconColorClass(color) {
    if (!color)
        return undefined;
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
function renderColoredIcon(icon, color) {
    if (!icon)
        return icon;
    const colorClass = getIconColorClass(color);
    if (colorClass) {
        return _jsx("span", { className: colorClass, children: icon });
    }
    if (color) {
        return _jsx("span", { style: { color }, children: icon });
    }
    return icon;
}
export function ThemedButton({ children, className = "", disabled = false, fullWidth = false, icon, iconColor, iconPosition = "left", loading = false, onClick, size = "md", style = {}, title, type = "button", variant = "primary", }) {
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
            return (_jsxs("div", { className: "themed-button__loading", children: [_jsx("div", { className: "themed-button__spinner" }), _jsx("span", { children: children })] }));
        }
        if (icon) {
            // eslint-disable-next-line functional/no-let -- we assign iconElement conditionally
            let iconElement;
            if (React.isValidElement(icon) && iconColor) {
                iconElement = renderColoredIcon(icon, iconColor);
            }
            else if (iconColor) {
                iconElement = renderColoredIcon(icon, iconColor);
            }
            else {
                iconElement = icon;
            }
            if (!children) {
                return iconElement;
            }
            return iconPosition === "left" ? (_jsxs(_Fragment, { children: [iconElement, _jsx("span", { children: children })] })) : (_jsxs(_Fragment, { children: [_jsx("span", { children: children }), iconElement] }));
        }
        return children;
    };
    return (_jsx("button", { type: type, className: classNames, style: style, onClick: onClick, disabled: disabled || loading, title: title, children: renderContent() }));
}
export function StatusIndicator({ className = "", showText = false, size = "md", status }) {
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
    const indicatorStyle = {
        animation: status === "pending" ? "pulse 1.5s ease-in-out infinite" : undefined,
        backgroundColor: getStatusColor(status),
        borderRadius: currentTheme.borderRadius.full,
        boxShadow: `0 0 0 2px ${currentTheme.colors.background.primary}`,
        height: sizeStyles.height,
        position: "relative",
        width: sizeStyles.width,
    };
    const iconStyle = {
        alignItems: "center",
        display: "flex",
        fontSize: sizeStyles.iconSize,
        justifyContent: "center",
        lineHeight: "1",
    };
    const textStyle = {
        alignItems: "center",
        color: getStatusColor(status),
        display: "flex",
        fontSize: sizeStyles.fontSize,
        fontWeight: currentTheme.typography.fontWeight.medium,
        gap: currentTheme.spacing.xs,
        marginLeft: currentTheme.spacing.xs,
    };
    return (_jsxs("div", { className: `themed-status-indicator ${className}`, style: { alignItems: "center", display: "flex" }, children: [showText ? (_jsx("div", { style: iconStyle, children: getStatusIcon(status) })) : (_jsx("div", { className: "themed-status-indicator__dot", style: indicatorStyle })), showText && (_jsx("span", { className: "themed-status-indicator__text", style: textStyle, children: status.charAt(0).toUpperCase() + status.slice(1) }))] }));
}
export function ThemedInput({ [ARIA_LABEL]: ariaLabel, className = "", disabled = false, max, min, onChange, placeholder, required = false, step, type = "text", value, }) {
    const { currentTheme } = useTheme();
    const { getBackgroundClass, getBorderClass, getTextClass } = useThemeClasses();
    // Ensure value is always defined to prevent controlled/uncontrolled warnings
    const inputValue = value ?? "";
    const styles = {
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
    return (_jsx("input", { type: type, value: inputValue, placeholder: placeholder, disabled: disabled, required: required, min: min, max: max, step: step, className: `themed-input ${className}`, style: styles, "aria-label": ariaLabel, onChange: onChange }));
}
export function ThemedSelect({ [ARIA_LABEL]: ariaLabel, children, className = "", disabled = false, onChange, required = false, value, }) {
    const { currentTheme } = useTheme();
    const { getBackgroundClass, getBorderClass, getTextClass } = useThemeClasses();
    // Ensure value is always defined to prevent controlled/uncontrolled warnings
    const selectValue = value ?? "";
    const styles = {
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
    return (_jsx("select", { value: selectValue, disabled: disabled, required: required, className: `themed-select ${className}`, style: styles, "aria-label": ariaLabel, onChange: onChange, children: children }));
}
export function ThemedCheckbox({ [ARIA_LABEL]: ariaLabel, checked = false, className = "", disabled = false, onChange, required = false, }) {
    return (_jsx("input", { type: "checkbox", checked: checked, disabled: disabled, required: required, className: `themed-checkbox ${className}`, "aria-label": ariaLabel, onChange: onChange }));
}
export function MiniChartBar({ className = "", responseTime, status, timestamp }) {
    const { getStatusColor } = useTheme();
    const { currentTheme } = useTheme();
    const styles = {
        backgroundColor: getStatusColor(status),
        borderRadius: currentTheme.borderRadius.sm,
        height: "32px",
        width: "8px",
    };
    return (_jsx("div", { className: `themed-mini-chart-bar ${className}`, style: styles, title: `${status} - ${formatResponseTime(responseTime)} at ${new Date(timestamp).toLocaleString()}` }));
}
export function ThemedIconButton({ className = "", disabled = false, icon, iconColor, loading = false, onClick, size = "md", tooltip, variant = "ghost", }) {
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
    return (_jsx(ThemedButton, { variant: variant, size: size, disabled: disabled, loading: loading, className: `themed-icon-button ${className}`, onClick: onClick, icon: icon, iconColor: iconColor, style: {
            height: buttonSize,
            minWidth: "unset",
            padding: "0",
            width: buttonSize,
        }, title: tooltip }));
}
export function ThemedCard({ children, className = "", clickable = false, hoverable = false, icon, iconColor, onClick, onMouseEnter, onMouseLeave, padding = "lg", rounded = "lg", shadow = "md", subtitle, title, variant = "primary", }) {
    const { currentTheme } = useTheme();
    const cardStyles = {
        cursor: clickable ? "pointer" : "default",
        overflow: "hidden",
        position: "relative",
        transition: TRANSITION_ALL,
    };
    return (_jsxs(ThemedBox, { variant: variant, surface: "elevated", padding: padding, rounded: rounded, shadow: shadow, className: `themed-card ${hoverable ? "themed-card--hoverable" : ""} ${clickable ? "themed-card--clickable" : ""} ${className}`, style: cardStyles, onClick: clickable ? onClick : undefined, onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave, children: [(title || subtitle || icon) && (_jsxs("div", { className: "themed-card__header", style: {
                    alignItems: "center",
                    display: "flex",
                    gap: currentTheme.spacing.md,
                    marginBottom: currentTheme.spacing.md,
                }, children: [icon && (_jsx("span", { style: {
                            alignItems: "center",
                            display: "flex",
                            fontSize: "1.5em",
                            lineHeight: "1",
                        }, children: renderColoredIcon(icon, iconColor || "primary") })), _jsxs("div", { style: { flex: 1 }, children: [title && (_jsx(ThemedText, { variant: "primary", size: "lg", weight: "semibold", children: title })), subtitle && (_jsx(ThemedText, { variant: "secondary", size: "sm", children: subtitle }))] })] })), _jsx("div", { className: "themed-card__content", children: children })] }));
}
export function ThemedBadge({ children, className = "", icon, iconColor, size = "sm", variant = "primary", }) {
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
    const badgeStyles = {
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
    return (_jsxs("span", { className: `themed-badge themed-badge--${variant} themed-badge--${size} ${className}`, style: badgeStyles, children: [icon && (_jsx("span", { style: { fontSize: "0.9em", lineHeight: "1" }, children: renderColoredIcon(icon, iconColor || variant) })), children] }));
}
export function ThemedProgress({ className = "", label, max = 100, showLabel = false, size = "md", value, variant = "primary", }) {
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
    const containerStyles = {
        backgroundColor: currentTheme.colors.background.secondary,
        borderRadius: currentTheme.borderRadius.full,
        height: getHeight(),
        overflow: "hidden",
        position: "relative",
        width: "100%",
    };
    const progressStyles = {
        backgroundColor: getVariantColor(),
        borderRadius: currentTheme.borderRadius.full,
        height: "100%",
        transition: "width 0.3s ease-in-out",
        width: `${percentage}%`,
    };
    return (_jsxs("div", { className: `themed-progress ${className}`, children: [(showLabel || label) && (_jsxs("div", { style: {
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: currentTheme.spacing.xs,
                }, children: [label && (_jsx(ThemedText, { variant: "secondary", size: "sm", children: label })), showLabel && (_jsxs(ThemedText, { variant: "secondary", size: "sm", children: [percentage.toFixed(1), "%"] }))] })), _jsx("div", { style: containerStyles, children: _jsx("div", { style: progressStyles }) })] }));
}
export function ThemedTooltip({ children, className = "", content }) {
    return (_jsx("div", { className: `themed-tooltip ${className}`, title: content, children: children }));
}
