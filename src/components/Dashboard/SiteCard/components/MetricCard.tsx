import React from "react";

import { ThemedText } from "../../../../theme/components";

interface MetricCardProps {
    label: string;
    value: string | number;
    className?: string;
}

/**
 * Reusable metric display component
 * Used in the metrics grid to show status, uptime, response time, etc.
 * Memoized to prevent unnecessary re-renders when parent re-renders
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
