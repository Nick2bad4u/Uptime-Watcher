/**
 * Reusable metric display card component. Provides consistent formatting for
 * displaying key performance metrics.
 */

import { memo, type NamedExoticComponent } from "react";

import { ThemedBox } from "../../../../theme/components/ThemedBox";
import { ThemedText } from "../../../../theme/components/ThemedText";

/**
 * Props for the MetricCard component.
 *
 * @public
 */
export interface MetricCardProperties {
    /** Optional CSS classes for custom styling */
    readonly className?: string;
    /** Label text describing the metric */
    readonly label: string;
    /** Value to display (string or number) */
    readonly value: number | string;
}

/**
 * Metric display card component for showing labeled values.
 *
 * Features:
 *
 * - Consistent vertical layout with label above value
 * - Themed text components for unified styling
 * - Flexible value types (string or number)
 * - Optimized with React.memo to prevent unnecessary re-renders
 * - Customizable styling through className prop
 *
 * @example
 *
 * ```tsx
 * <MetricCard label="Uptime" value="98.5%" className="border-r" />;
 * ```
 *
 * @param props - Component props
 *
 * @returns JSX element containing the metric display
 */

/**
 * Metric display card component implementation.
 *
 * @param props - MetricCard component props
 *
 * @returns JSX.Element containing the metric display
 */
export const MetricCard: NamedExoticComponent<MetricCardProperties> = memo(
    function MetricCard({
        className = "",
        label,
        value,
    }: MetricCardProperties) {
        return (
            <ThemedBox
                className={`metric-card ${className}`}
                padding="md"
                rounded="md"
                surface="overlay"
                variant="tertiary"
            >
                <ThemedText
                    className="metric-card__label"
                    size="xs"
                    variant="secondary"
                >
                    {label}
                </ThemedText>
                <ThemedText
                    className="metric-card__value"
                    size="sm"
                    weight="semibold"
                >
                    {value}
                </ThemedText>
            </ThemedBox>
        );
    }
);
