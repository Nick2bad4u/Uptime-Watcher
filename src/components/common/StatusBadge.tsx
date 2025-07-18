/**
 * StatusBadge component for displaying status with optional icon and customizable styling.
 * Provides consistent status display throughout the application.
 */

import React from "react";

import { StatusIndicator, ThemedText } from "../../theme/components";

/** Props for the StatusBadge component */
interface StatusBadgeProperties {
    /** Additional CSS classes */
    className?: string;
    /** Label text to display */
    label: string;
    /** Whether to show the status icon */
    showIcon?: boolean;
    /** Text size (affects both text and icon sizing) */
    size?: "2xl" | "3xl" | "4xl" | "base" | "lg" | "sm" | "xl" | "xs";
    /** Current status to display */
    status: "down" | "paused" | "pending" | "up";
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
}: StatusBadgeProperties) {
    /**
     * Maps text sizes to appropriate indicator sizes.
     * Ensures visual consistency between text and icon.
     *
     * @param textSize - The text size to map
     * @returns Corresponding indicator size
     */
    const getIndicatorSize = (textSize: typeof size): "lg" | "md" | "sm" => {
        switch (textSize) {
            case "2xl":
            case "3xl":
            case "4xl":
            case "xl": {
                return "lg";
            }
            case "base":
            case "lg": {
                return "md";
            }
            case "sm":
            case "xs": {
                return "sm";
            }
            default: {
                return "sm";
            }
        }
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {showIcon && <StatusIndicator size={getIndicatorSize(size)} status={status} />}
            <ThemedText size={size} variant="secondary">
                {label}: {status}
            </ThemedText>
        </div>
    );
});
