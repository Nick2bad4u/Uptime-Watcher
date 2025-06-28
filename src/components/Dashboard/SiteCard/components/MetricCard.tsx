/**
 * Reusable metric display card component.
 * Provides consistent formatting for displaying key performance metrics.
 */

import React from "react";

import { ThemedText } from "../../../../theme/components";

/**
 * Props for the MetricCard component.
 */
interface MetricCardProps {
    /** Label text describing the metric */
    label: string;
    /** Value to display (string or number) */
    value: string | number;
    /** Optional CSS classes for custom styling */
    className?: string;
}

/**
 * Metric display card component for showing labeled values.
 *
 * Features:
 * - Consistent vertical layout with label above value
 * - Themed text components for unified styling
 * - Flexible value types (string or number)
 * - Optimized with React.memo to prevent unnecessary re-renders
 * - Customizable styling through className prop
 *
 * @param props - Component props
 * @returns JSX element containing the metric display
 *
 * @example
 * ```tsx
 * <MetricCard
 *   label="Uptime"
 *   value="98.5%"
 *   className="border-r"
 * />
 * ```
 */
export const MetricCard = React.memo(function MetricCard({ className = "", label, value }: MetricCardProps) {
    return (
        <div className={`flex flex-col items-center text-center ${className}`}>
            <ThemedText size="xs" variant="secondary" className="block mb-1">
                {label}
            </ThemedText>
            <ThemedText size="sm" weight="medium">
                {value}
            </ThemedText>
        </div>
    );
});
