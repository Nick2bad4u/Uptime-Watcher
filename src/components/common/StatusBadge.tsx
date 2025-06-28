/**
 * StatusBadge component for displaying status with optional icon and customizable styling.
 * Provides consistent status display throughout the application.
 */

import React from "react";

import { StatusIndicator, ThemedText } from "../../theme/components";

/** Props for the StatusBadge component */
interface StatusBadgeProps {
    /** Label text to display */
    label: string;
    /** Current status to display */
    status: "up" | "down" | "pending";
    /** Text size (affects both text and icon sizing) */
    size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
    /** Whether to show the status icon */
    showIcon?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Reusable status badge component that combines status indicator with text.
 * Can be used throughout the app for consistent status display.
 * Memoized for performance optimization.
 *
 * @param props - StatusBadge component props
 * @returns JSX element containing status indicator and text
 */
export const StatusBadge = React.memo(function StatusBadge({
    className = "",
    label,
    showIcon = true,
    size = "sm",
    status,
}: StatusBadgeProps) {
    /**
     * Maps text sizes to appropriate indicator sizes.
     * Ensures visual consistency between text and icon.
     *
     * @param textSize - The text size to map
     * @returns Corresponding indicator size
     */
    const getIndicatorSize = (textSize: typeof size): "sm" | "md" | "lg" => {
        switch (textSize) {
            case "xs":
            case "sm":
                return "sm";
            case "base":
            case "lg":
                return "md";
            case "xl":
            case "2xl":
            case "3xl":
            case "4xl":
                return "lg";
            default:
                return "sm";
        }
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {showIcon && <StatusIndicator status={status} size={getIndicatorSize(size)} />}
            <ThemedText variant="secondary" size={size}>
                {label}: {status}
            </ThemedText>
        </div>
    );
});
