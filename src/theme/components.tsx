import React from "react";
import { useTheme, useThemeClasses } from "../theme/useTheme";
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
  children,
}: ThemedBoxProps) {
  const { currentTheme } = useTheme();
  const { getBackgroundClass, getSurfaceClass, getBorderClass } =
    useThemeClasses();

  const styles: React.CSSProperties = {
    ...getBackgroundClass(variant),
    ...getSurfaceClass(surface),
    padding: currentTheme.spacing[padding],
    borderRadius: currentTheme.borderRadius[rounded],
    ...(shadow && { boxShadow: currentTheme.shadows[shadow] }),
    ...(border && {
      borderWidth: "1px",
      borderStyle: "solid",
      ...getBorderClass("primary"),
    }),
  };

  return (
    <div className={className} style={styles}>
      {children}
    </div>
  );
}

interface ThemedTextProps {
  variant?: "primary" | "secondary" | "tertiary" | "inverse";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  align?: "left" | "center" | "right";
  className?: string;
  children: React.ReactNode;
}

export function ThemedText({
  variant = "primary",
  size = "base",
  weight = "normal",
  align = "left",
  className = "",
  children,
}: ThemedTextProps) {
  const { currentTheme } = useTheme();
  const { getTextClass } = useThemeClasses();

  const styles: React.CSSProperties = {
    ...getTextClass(variant),
    fontSize: currentTheme.typography.fontSize[size],
    fontWeight: currentTheme.typography.fontWeight[weight],
    textAlign: align,
    lineHeight: currentTheme.typography.lineHeight.normal,
  };

  return (
    <span className={className} style={styles}>
      {children}
    </span>
  );
}

interface ThemedButtonProps {
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  size?: "xs" | "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

export function ThemedButton({
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
  onClick,
  children,
}: ThemedButtonProps) {
  const { currentTheme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: currentTheme.colors.primary[500],
          color: currentTheme.colors.text.inverse,
          borderColor: currentTheme.colors.primary[500],
        };
      case "secondary":
        return {
          backgroundColor: "transparent",
          color: currentTheme.colors.text.primary,
          borderColor: currentTheme.colors.border.primary,
        };
      case "success":
        return {
          backgroundColor: currentTheme.colors.success,
          color: currentTheme.colors.text.inverse,
          borderColor: currentTheme.colors.success,
        };
      case "warning":
        return {
          backgroundColor: currentTheme.colors.warning,
          color: currentTheme.colors.text.inverse,
          borderColor: currentTheme.colors.warning,
        };
      case "error":
        return {
          backgroundColor: currentTheme.colors.error,
          color: currentTheme.colors.text.inverse,
          borderColor: currentTheme.colors.error,
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
      case "lg":
        return {
          padding: `${currentTheme.spacing.lg} ${currentTheme.spacing.xl}`,
          fontSize: currentTheme.typography.fontSize.lg,
        };
      default:
        return {};
    }
  };

  const styles: React.CSSProperties = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: currentTheme.borderRadius.md,
    fontWeight: currentTheme.typography.fontWeight.medium,
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? "100%" : "auto",
    transition: "all 0.2s ease-in-out",
  };
  return (
    <button
      type={type}
      className={className}
      style={styles}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {" "}
      {loading ? (
        <div className="themed-button__loading">
          <div className="themed-button__spinner"></div>
          <span>{children}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

interface StatusIndicatorProps {
  status: "up" | "down" | "pending" | "unknown";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function StatusIndicator({
  status,
  size = "md",
  showText = false,
  className = "",
}: StatusIndicatorProps) {
  const { getStatusColor } = useTheme();
  const { currentTheme } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          width: "8px",
          height: "8px",
          fontSize: currentTheme.typography.fontSize.xs,
        };
      case "md":
        return {
          width: "12px",
          height: "12px",
          fontSize: currentTheme.typography.fontSize.sm,
        };
      case "lg":
        return {
          width: "16px",
          height: "16px",
          fontSize: currentTheme.typography.fontSize.base,
        };
      default:
        return {};
    }
  };

  const indicatorStyle: React.CSSProperties = {
    ...getSizeStyles(),
    backgroundColor: getStatusColor(status),
    borderRadius: currentTheme.borderRadius.full,
  };

  const textStyle: React.CSSProperties = {
    color: getStatusColor(status),
    fontSize: getSizeStyles().fontSize,
    fontWeight: currentTheme.typography.fontWeight.medium,
    marginLeft: currentTheme.spacing.xs,
  };
  return (
    <div className={`themed-status-indicator ${className}`}>
      <div className="themed-status-indicator__dot" style={indicatorStyle} />
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
  const { getBackgroundClass, getTextClass, getBorderClass } =
    useThemeClasses();

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
  const { getBackgroundClass, getTextClass, getBorderClass } =
    useThemeClasses();

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

export function MiniChartBar({
  status,
  responseTime,
  timestamp,
  className = "",
}: MiniChartBarProps) {
  const { getStatusColor } = useTheme();
  const { currentTheme } = useTheme();

  const formatResponseTime = (time?: number) => {
    if (!time) return "N/A";
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

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
