/**
 * StatusBadge component for displaying status with optional icon and
 * customizable styling.
 *
 * @remarks
 * This component provides a standardized way to display monitor and site
 * status throughout the application. It combines visual status indicators with
 * text labels to create an accessible and consistent user experience.
 *
 * The component is optimized for performance using React.memo and is designed
 * to be reusable across different contexts while maintaining visual
 * consistency. It supports various sizing options and can be customized with
 * different formatting functions.
 *
 * Features:
 * - Consistent status visualization across the application
 * - Accessibility-compliant with proper ARIA attributes
 * - Performance optimized with memoization
 * - Customizable sizing and styling options
 * - Optional custom formatting for different display contexts
 *
 * @param props - Component configuration properties
 * @returns Themed status badge with icon and text
 *
 * @example
 * ```tsx
 * // Basic usage
 * <StatusBadge label="Monitor Status" status="up" />
 *
 * // With custom formatting
 * <StatusBadge
 *   label="Site Status"
 *   status="down"
 *   formatter={(label, status) => `${label}: ${status.toUpperCase()}`}
 *   size="lg"
 * />
 * ```
 *
 * @public
 */

import type { MonitorStatus } from "@shared/types";

import React from "react";

import StatusIndicator from "../../theme/components/StatusIndicator";
import ThemedText from "../../theme/components/ThemedText";

/**
 * Props for the StatusBadge component
 *
 * @public
 */
export interface StatusBadgeProperties {
    /** Additional CSS classes */
    readonly className?: string;
    /** Optional custom formatter for label and status display */
    readonly formatter?: (label: string, status: MonitorStatus) => string;
    /**
     * Label text to display (expected to be localized by caller)
     * @example "Status", "Current State", "Monitor Status"
     */
    readonly label: string;
    /** Whether to show the status icon */
    readonly showIcon?: boolean;
    /** Text size (affects both text and icon sizing) */
    readonly size?: "2xl" | "3xl" | "4xl" | "base" | "lg" | "sm" | "xl" | "xs";
    /** Current status to display */
    readonly status: MonitorStatus;
}

/**
 * Reusable status badge component that combines status indicator with text.
 * Can be used throughout the app for consistent status display.
 *
 * This component is memoized to prevent unnecessary re-renders when parent
 * components update. The memoization is beneficial because status badges are
 * often rendered in lists and don't change frequently. Consumers should ensure
 * that props are stable (especially formatter function) to maximize
 * memoization benefits.
 *
 * @param props - StatusBadge component props
 * @returns JSX element containing status indicator and text
 */
export const StatusBadge: React.NamedExoticComponent<StatusBadgeProperties> =
    React.memo(function StatusBadge({
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
        const getIndicatorSize = (
            textSize: typeof size
        ): "lg" | "md" | "sm" => {
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
        const displayText = formatter
            ? formatter(label, status)
            : `${label}: ${status}`;

        return (
            <div className={`flex items-center gap-3 ${className}`}>
                {showIcon ? (
                    <StatusIndicator
                        size={getIndicatorSize(size)}
                        status={status}
                    />
                ) : null}
                <ThemedText size={size} variant="secondary">
                    {displayText}
                </ThemedText>
            </div>
        );
    });
