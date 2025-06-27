import React from "react";

import { StatusIndicator, ThemedText } from "../../theme/components";

interface StatusBadgeProps {
    label: string;
    status: "up" | "down" | "pending";
    size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
    showIcon?: boolean;
    className?: string;
}

/**
 * Reusable status badge component that combines status indicator with text
 * Can be used throughout the app for consistent status display
 * Memoized for performance optimization
 */
export const StatusBadge = React.memo(function StatusBadge({
    className = "",
    label,
    showIcon = true,
    size = "sm",
    status,
}: StatusBadgeProps) {
    // Map text sizes to indicator sizes
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
