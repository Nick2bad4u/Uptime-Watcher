"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.ThemedTooltip = exports.ThemedProgress = exports.ThemedBadge = exports.ThemedCard = exports.ThemedIconButton = exports.MiniChartBar = exports.ThemedCheckbox = exports.ThemedSelect = exports.ThemedInput = exports.StatusIndicator = exports.ThemedButton = exports.ThemedText = exports.ThemedBox = exports.ThemeProvider = void 0;
var react_1 = require("react");
var constants_1 = require("../constants");
var useTheme_1 = require("../theme/useTheme");
var status_1 = require("../utils/status");
var time_1 = require("../utils/time");
require("./components.css");
function ThemeProvider(_a) {
    var children = _a.children;
    // Initialize theme on mount
    useTheme_1.useTheme();
    return react_1["default"].createElement(react_1["default"].Fragment, null, children);
}
exports.ThemeProvider = ThemeProvider;
function ThemedBox(_a) {
    var _b = _a.border, border = _b === void 0 ? false : _b, children = _a.children, _c = _a.className, className = _c === void 0 ? "" : _c, onClick = _a.onClick, onMouseEnter = _a.onMouseEnter, onMouseLeave = _a.onMouseLeave, _d = _a.padding, padding = _d === void 0 ? "md" : _d, _e = _a.rounded, rounded = _e === void 0 ? "md" : _e, shadow = _a.shadow, _f = _a.style, style = _f === void 0 ? {} : _f, _g = _a.surface, surface = _g === void 0 ? "base" : _g, _h = _a.variant, variant = _h === void 0 ? "primary" : _h;
    var classNames = [
        "themed-box",
        "themed-box--background-" + variant,
        "themed-box--surface-" + surface,
        "themed-box--padding-" + padding,
        "themed-box--rounded-" + rounded,
        shadow && "themed-box--shadow-" + shadow,
        border && "themed-box--border",
        className,
    ]
        .filter(Boolean)
        .join(" ");
    return (react_1["default"].createElement("div", { className: classNames, style: style, onClick: onClick, onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave }, children));
}
exports.ThemedBox = ThemedBox;
function ThemedText(_a) {
    var _b = _a.align, align = _b === void 0 ? "left" : _b, children = _a.children, _c = _a.className, className = _c === void 0 ? "" : _c, _d = _a.size, size = _d === void 0 ? "base" : _d, _e = _a.style, style = _e === void 0 ? {} : _e, _f = _a.variant, variant = _f === void 0 ? "primary" : _f, _g = _a.weight, weight = _g === void 0 ? "normal" : _g;
    var classNames = [
        "themed-text",
        "themed-text--" + variant,
        "themed-text--size-" + size,
        "themed-text--weight-" + weight,
        "themed-text--align-" + align,
        className,
    ]
        .filter(Boolean)
        .join(" ");
    return (react_1["default"].createElement("span", { className: classNames, style: style }, children));
}
exports.ThemedText = ThemedText;
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
    var colorClass = getIconColorClass(color);
    if (colorClass) {
        return react_1["default"].createElement("span", { className: colorClass }, icon);
    }
    if (color) {
        return react_1["default"].createElement("span", { style: { color: color } }, icon);
    }
    return icon;
}
function ThemedButton(_a) {
    var children = _a.children, _b = _a.className, className = _b === void 0 ? "" : _b, _c = _a.disabled, disabled = _c === void 0 ? false : _c, _d = _a.fullWidth, fullWidth = _d === void 0 ? false : _d, icon = _a.icon, iconColor = _a.iconColor, _e = _a.iconPosition, iconPosition = _e === void 0 ? "left" : _e, _f = _a.loading, loading = _f === void 0 ? false : _f, onClick = _a.onClick, _g = _a.size, size = _g === void 0 ? "md" : _g, _h = _a.style, style = _h === void 0 ? {} : _h, title = _a.title, _j = _a.type, type = _j === void 0 ? "button" : _j, _k = _a.variant, variant = _k === void 0 ? "primary" : _k;
    var classNames = [
        "themed-button",
        "themed-button--" + variant,
        "themed-button--size-" + size,
        fullWidth && "themed-button--full-width",
        (disabled || loading) && "themed-button--loading",
        className,
    ]
        .filter(Boolean)
        .join(" ");
    var renderContent = function () {
        if (loading) {
            return (react_1["default"].createElement("div", { className: "themed-button__loading" },
                react_1["default"].createElement("div", { className: "themed-button__spinner" }),
                react_1["default"].createElement("span", null, children)));
        }
        if (icon) {
            // eslint-disable-next-line functional/no-let -- we assign iconElement conditionally
            var iconElement = void 0;
            if (react_1["default"].isValidElement(icon) && iconColor) {
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
            return iconPosition === "left" ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                iconElement,
                react_1["default"].createElement("span", null, children))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("span", null, children),
                iconElement));
        }
        return children;
    };
    return (react_1["default"].createElement("button", { type: type, className: classNames, style: style, onClick: onClick, disabled: disabled || loading, title: title }, renderContent()));
}
exports.ThemedButton = ThemedButton;
function StatusIndicator(_a) {
    var _b = _a.className, className = _b === void 0 ? "" : _b, _c = _a.showText, showText = _c === void 0 ? false : _c, _d = _a.size, size = _d === void 0 ? "md" : _d, status = _a.status;
    var getStatusColor = useTheme_1.useTheme().getStatusColor;
    var currentTheme = useTheme_1.useTheme().currentTheme;
    var getSizeStyles = function () {
        switch (size) {
            case "sm":
                return {
                    fontSize: currentTheme.typography.fontSize.xs,
                    height: "8px",
                    iconSize: "12px",
                    width: "8px"
                };
            case "md":
                return {
                    fontSize: currentTheme.typography.fontSize.sm,
                    height: "12px",
                    iconSize: "16px",
                    width: "12px"
                };
            case "lg":
                return {
                    fontSize: currentTheme.typography.fontSize.base,
                    height: "16px",
                    iconSize: "20px",
                    width: "16px"
                };
            default:
                return { iconSize: "16px" };
        }
    };
    var sizeStyles = getSizeStyles();
    var indicatorStyle = {
        animation: status === "pending" ? "pulse 1.5s ease-in-out infinite" : undefined,
        backgroundColor: getStatusColor(status),
        borderRadius: currentTheme.borderRadius.full,
        boxShadow: "0 0 0 2px " + currentTheme.colors.background.primary,
        height: sizeStyles.height,
        position: "relative",
        width: sizeStyles.width
    };
    var iconStyle = {
        alignItems: "center",
        display: "flex",
        fontSize: sizeStyles.iconSize,
        justifyContent: "center",
        lineHeight: "1"
    };
    var textStyle = {
        alignItems: "center",
        color: getStatusColor(status),
        display: "flex",
        fontSize: sizeStyles.fontSize,
        fontWeight: currentTheme.typography.fontWeight.medium,
        gap: currentTheme.spacing.xs,
        marginLeft: currentTheme.spacing.xs
    };
    return (react_1["default"].createElement("div", { className: "themed-status-indicator " + className, style: { alignItems: "center", display: "flex" } },
        showText ? (react_1["default"].createElement("div", { style: iconStyle }, status_1.getStatusIcon(status))) : (react_1["default"].createElement("div", { className: "themed-status-indicator__dot", style: indicatorStyle })),
        showText && (react_1["default"].createElement("span", { className: "themed-status-indicator__text", style: textStyle }, status.charAt(0).toUpperCase() + status.slice(1)))));
}
exports.StatusIndicator = StatusIndicator;
function ThemedInput(_a) {
    var _b = constants_1.ARIA_LABEL, ariaLabel = _a[_b], _c = _a.className, className = _c === void 0 ? "" : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d, max = _a.max, min = _a.min, onChange = _a.onChange, placeholder = _a.placeholder, _e = _a.required, required = _e === void 0 ? false : _e, step = _a.step, _f = _a.type, type = _f === void 0 ? "text" : _f, value = _a.value;
    var currentTheme = useTheme_1.useTheme().currentTheme;
    var _g = useTheme_1.useThemeClasses(), getBackgroundClass = _g.getBackgroundClass, getBorderClass = _g.getBorderClass, getTextClass = _g.getTextClass;
    // Ensure value is always defined to prevent controlled/uncontrolled warnings
    var inputValue = value !== null && value !== void 0 ? value : "";
    var styles = __assign(__assign(__assign(__assign({}, getBackgroundClass("primary")), getTextClass("primary")), getBorderClass("primary")), { borderRadius: currentTheme.borderRadius.md, borderStyle: "solid", borderWidth: "1px", fontSize: currentTheme.typography.fontSize.sm, padding: currentTheme.spacing.sm + " " + currentTheme.spacing.md, transition: constants_1.TRANSITION_ALL, width: "100%" });
    return (react_1["default"].createElement("input", { type: type, value: inputValue, placeholder: placeholder, disabled: disabled, required: required, min: min, max: max, step: step, className: "themed-input " + className, style: styles, "aria-label": ariaLabel, onChange: onChange }));
}
exports.ThemedInput = ThemedInput;
function ThemedSelect(_a) {
    var _b = constants_1.ARIA_LABEL, ariaLabel = _a[_b], children = _a.children, _c = _a.className, className = _c === void 0 ? "" : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d, onChange = _a.onChange, _e = _a.required, required = _e === void 0 ? false : _e, value = _a.value;
    var currentTheme = useTheme_1.useTheme().currentTheme;
    var _f = useTheme_1.useThemeClasses(), getBackgroundClass = _f.getBackgroundClass, getBorderClass = _f.getBorderClass, getTextClass = _f.getTextClass;
    // Ensure value is always defined to prevent controlled/uncontrolled warnings
    var selectValue = value !== null && value !== void 0 ? value : "";
    var styles = __assign(__assign(__assign(__assign({}, getBackgroundClass("primary")), getTextClass("primary")), getBorderClass("primary")), { borderRadius: currentTheme.borderRadius.md, borderStyle: "solid", borderWidth: "1px", fontSize: currentTheme.typography.fontSize.sm, padding: currentTheme.spacing.sm + " " + currentTheme.spacing.md, transition: constants_1.TRANSITION_ALL, width: "100%" });
    return (react_1["default"].createElement("select", { value: selectValue, disabled: disabled, required: required, className: "themed-select " + className, style: styles, "aria-label": ariaLabel, onChange: onChange }, children));
}
exports.ThemedSelect = ThemedSelect;
function ThemedCheckbox(_a) {
    var _b = constants_1.ARIA_LABEL, ariaLabel = _a[_b], _c = _a.checked, checked = _c === void 0 ? false : _c, _d = _a.className, className = _d === void 0 ? "" : _d, _e = _a.disabled, disabled = _e === void 0 ? false : _e, onChange = _a.onChange, _f = _a.required, required = _f === void 0 ? false : _f;
    return (react_1["default"].createElement("input", { type: "checkbox", checked: checked, disabled: disabled, required: required, className: "themed-checkbox " + className, "aria-label": ariaLabel, onChange: onChange }));
}
exports.ThemedCheckbox = ThemedCheckbox;
function MiniChartBar(_a) {
    var _b = _a.className, className = _b === void 0 ? "" : _b, responseTime = _a.responseTime, status = _a.status, timestamp = _a.timestamp;
    var getStatusColor = useTheme_1.useTheme().getStatusColor;
    var currentTheme = useTheme_1.useTheme().currentTheme;
    var styles = {
        backgroundColor: getStatusColor(status),
        borderRadius: currentTheme.borderRadius.sm,
        height: "32px",
        width: "8px"
    };
    return (react_1["default"].createElement("div", { className: "themed-mini-chart-bar " + className, style: styles, title: status + " - " + time_1.formatResponseTime(responseTime) + " at " + new Date(timestamp).toLocaleString() }));
}
exports.MiniChartBar = MiniChartBar;
function ThemedIconButton(_a) {
    var _b = _a.className, className = _b === void 0 ? "" : _b, _c = _a.disabled, disabled = _c === void 0 ? false : _c, icon = _a.icon, iconColor = _a.iconColor, _d = _a.loading, loading = _d === void 0 ? false : _d, onClick = _a.onClick, _e = _a.size, size = _e === void 0 ? "md" : _e, tooltip = _a.tooltip, _f = _a.variant, variant = _f === void 0 ? "ghost" : _f;
    var getSize = function () {
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
    var buttonSize = getSize();
    return (react_1["default"].createElement(ThemedButton, { variant: variant, size: size, disabled: disabled, loading: loading, className: "themed-icon-button " + className, onClick: onClick, icon: icon, iconColor: iconColor, style: {
            height: buttonSize,
            minWidth: "unset",
            padding: "0",
            width: buttonSize
        }, title: tooltip }));
}
exports.ThemedIconButton = ThemedIconButton;
function ThemedCard(_a) {
    var children = _a.children, _b = _a.className, className = _b === void 0 ? "" : _b, _c = _a.clickable, clickable = _c === void 0 ? false : _c, _d = _a.hoverable, hoverable = _d === void 0 ? false : _d, icon = _a.icon, iconColor = _a.iconColor, onClick = _a.onClick, onMouseEnter = _a.onMouseEnter, onMouseLeave = _a.onMouseLeave, _e = _a.padding, padding = _e === void 0 ? "lg" : _e, _f = _a.rounded, rounded = _f === void 0 ? "lg" : _f, _g = _a.shadow, shadow = _g === void 0 ? "md" : _g, subtitle = _a.subtitle, title = _a.title, _h = _a.variant, variant = _h === void 0 ? "primary" : _h;
    var currentTheme = useTheme_1.useTheme().currentTheme;
    var cardStyles = {
        cursor: clickable ? "pointer" : "default",
        overflow: "hidden",
        position: "relative",
        transition: constants_1.TRANSITION_ALL
    };
    return (react_1["default"].createElement(ThemedBox, { variant: variant, surface: "elevated", padding: padding, rounded: rounded, shadow: shadow, className: "themed-card " + (hoverable ? "themed-card--hoverable" : "") + " " + (clickable ? "themed-card--clickable" : "") + " " + className, style: cardStyles, onClick: clickable ? onClick : undefined, onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave },
        (title || subtitle || icon) && (react_1["default"].createElement("div", { className: "themed-card__header", style: {
                alignItems: "center",
                display: "flex",
                gap: currentTheme.spacing.md,
                marginBottom: currentTheme.spacing.md
            } },
            icon && (react_1["default"].createElement("span", { style: {
                    alignItems: "center",
                    display: "flex",
                    fontSize: "1.5em",
                    lineHeight: "1"
                } }, renderColoredIcon(icon, iconColor || "primary"))),
            react_1["default"].createElement("div", { style: { flex: 1 } },
                title && (react_1["default"].createElement(ThemedText, { variant: "primary", size: "lg", weight: "semibold" }, title)),
                subtitle && (react_1["default"].createElement(ThemedText, { variant: "secondary", size: "sm" }, subtitle))))),
        react_1["default"].createElement("div", { className: "themed-card__content" }, children)));
}
exports.ThemedCard = ThemedCard;
function ThemedBadge(_a) {
    var children = _a.children, _b = _a.className, className = _b === void 0 ? "" : _b, icon = _a.icon, iconColor = _a.iconColor, _c = _a.size, size = _c === void 0 ? "sm" : _c, _d = _a.variant, variant = _d === void 0 ? "primary" : _d;
    var currentTheme = useTheme_1.useTheme().currentTheme;
    var getVariantStyles = function () {
        switch (variant) {
            case "primary":
                return {
                    backgroundColor: currentTheme.colors.primary[100],
                    borderColor: currentTheme.colors.primary[200],
                    color: currentTheme.colors.primary[700]
                };
            case "secondary":
                return {
                    backgroundColor: currentTheme.colors.background.secondary,
                    borderColor: currentTheme.colors.border.secondary,
                    color: currentTheme.colors.text.secondary
                };
            case "success":
                return {
                    backgroundColor: currentTheme.colors.success + "20",
                    borderColor: currentTheme.colors.success + "40",
                    color: currentTheme.colors.success
                };
            case "warning":
                return {
                    backgroundColor: currentTheme.colors.warning + "20",
                    borderColor: currentTheme.colors.warning + "40",
                    color: currentTheme.colors.warning
                };
            case "error":
                return {
                    backgroundColor: currentTheme.colors.error + "20",
                    borderColor: currentTheme.colors.error + "40",
                    color: currentTheme.colors.error
                };
            case "info":
                return {
                    backgroundColor: currentTheme.colors.primary[500] + "20",
                    borderColor: currentTheme.colors.primary[500] + "40",
                    color: currentTheme.colors.primary[600]
                };
            default:
                return {};
        }
    };
    var getSizeStyles = function () {
        switch (size) {
            case "xs":
                return {
                    fontSize: currentTheme.typography.fontSize.xs,
                    padding: currentTheme.spacing.xs + " " + currentTheme.spacing.sm
                };
            case "sm":
                return {
                    fontSize: currentTheme.typography.fontSize.sm,
                    padding: currentTheme.spacing.sm + " " + currentTheme.spacing.md
                };
            case "md":
                return {
                    fontSize: currentTheme.typography.fontSize.base,
                    padding: currentTheme.spacing.md + " " + currentTheme.spacing.lg
                };
            default:
                return {};
        }
    };
    var badgeStyles = __assign(__assign(__assign({}, getVariantStyles()), getSizeStyles()), { alignItems: "center", borderRadius: currentTheme.borderRadius.full, borderStyle: "solid", borderWidth: "1px", display: "inline-flex", fontWeight: currentTheme.typography.fontWeight.medium, gap: currentTheme.spacing.xs, lineHeight: "1", whiteSpace: "nowrap" });
    return (react_1["default"].createElement("span", { className: "themed-badge themed-badge--" + variant + " themed-badge--" + size + " " + className, style: badgeStyles },
        icon && (react_1["default"].createElement("span", { style: { fontSize: "0.9em", lineHeight: "1" } }, renderColoredIcon(icon, iconColor || variant))),
        children));
}
exports.ThemedBadge = ThemedBadge;
function ThemedProgress(_a) {
    var _b = _a.className, className = _b === void 0 ? "" : _b, label = _a.label, _c = _a.max, max = _c === void 0 ? 100 : _c, _d = _a.showLabel, showLabel = _d === void 0 ? false : _d, _e = _a.size, size = _e === void 0 ? "md" : _e, value = _a.value, _f = _a.variant, variant = _f === void 0 ? "primary" : _f;
    var currentTheme = useTheme_1.useTheme().currentTheme;
    var percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    var getVariantColor = function () {
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
    var getHeight = function () {
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
    var containerStyles = {
        backgroundColor: currentTheme.colors.background.secondary,
        borderRadius: currentTheme.borderRadius.full,
        height: getHeight(),
        overflow: "hidden",
        position: "relative",
        width: "100%"
    };
    var progressStyles = {
        backgroundColor: getVariantColor(),
        borderRadius: currentTheme.borderRadius.full,
        height: "100%",
        transition: "width 0.3s ease-in-out",
        width: percentage + "%"
    };
    return (react_1["default"].createElement("div", { className: "themed-progress " + className },
        (showLabel || label) && (react_1["default"].createElement("div", { style: {
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
                marginBottom: currentTheme.spacing.xs
            } },
            label && (react_1["default"].createElement(ThemedText, { variant: "secondary", size: "sm" }, label)),
            showLabel && (react_1["default"].createElement(ThemedText, { variant: "secondary", size: "sm" },
                percentage.toFixed(1),
                "%")))),
        react_1["default"].createElement("div", { style: containerStyles },
            react_1["default"].createElement("div", { style: progressStyles }))));
}
exports.ThemedProgress = ThemedProgress;
function ThemedTooltip(_a) {
    var children = _a.children, _b = _a.className, className = _b === void 0 ? "" : _b, content = _a.content;
    return (react_1["default"].createElement("div", { className: "themed-tooltip " + className, title: content }, children));
}
exports.ThemedTooltip = ThemedTooltip;
