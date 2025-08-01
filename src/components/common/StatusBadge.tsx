/**
 * StatusBadge component for displaying status with optional icon and customizable styling.
 * Provides consistent status display throughout the application.
 */

import type { MonitorStatus } from "@shared/types";

import React from "react";

import { StatusIndicator, ThemedText } from "../../theme/components";

/**
 * Props for the StatusBadge component
 *
 * @public
 */
export interface StatusBadgeProperties {
    /** Additional CSS classes */
    className?: string;
    /** Optional custom formatter for label and status display */
    formatter?: (label: string, status: MonitorStatus) => string;
    /**
     * Label text to display (expected to be localized by caller)
     * @example "Status", "Current State", "Monitor Status"
     */
    label: string;
    /** Whether to show the status icon */
    showIcon?: boolean;
    /** Text size (affects both text and icon sizing) */
    size?: "2xl" | "3xl" | "4xl" | "base" | "lg" | "sm" | "xl" | "xs";
    /** Current status to display */
    status: MonitorStatus;
}

/**
 * Reusable status badge component that combines status indicator with text.
 * Can be used throughout the app for consistent status display.
 *
 * This component is memoized to prevent unnecessary re-renders when parent
 * components update. The memoization is beneficial because status badges are
 * often rendered in lists and don't change frequently. Consumers should ensure
 * that props are stable (especially formatter function) to maximize memoization benefits.
 *
 * @param props - StatusBadge component props
 * @returns JSX element containing status indicator and text
 */
export const StatusBadge = React.memo(function StatusBadge({
    className = "",
    formatter,
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

    // Use custom formatter if provided, otherwise default format
    const displayText = formatter ? formatter(label, status) : `${label}: ${status}`;

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {showIcon && <StatusIndicator size={getIndicatorSize(size)} status={status} />}
            <ThemedText size={size} variant="secondary">
                {displayText}
            </ThemedText>
        </div>
    );
});
