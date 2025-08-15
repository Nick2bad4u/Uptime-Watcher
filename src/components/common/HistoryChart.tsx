/**
 * HistoryChart component for visualizing status history as mini chart bars.
 * Provides a compact, responsive chart for displaying historical
 * uptime/downtime data.
 */

import type { StatusHistory } from "@shared/types";

import React from "react";

import MiniChartBar from "../../theme/components/MiniChartBar";
import ThemedText from "../../theme/components/ThemedText";

/**
 * Props for the HistoryChart component
 *
 * @public
 */
export interface HistoryChartProps {
    /** Additional CSS classes */
    readonly className?: string;
    /** Array of historical status records to display */
    readonly history: StatusHistory[];
    /** Maximum number of items to display (default: 120) */
    readonly maxItems?: number;
    /** Title to display above the chart */
    readonly title: string;
}

/**
 * Reusable history chart component for visualizing status history. Can be used
 * anywhere we need to show historical data.
 *
 * Features:
 *
 * - Responsive layout using CSS
 * - Memoized to prevent unnecessary re-renders
 * - Configurable item limit
 * - Graceful handling of empty data
 *
 * @param props - HistoryChart component props
 *
 * @returns JSX element containing the history chart, or null if no data
 *   (following React conventions for conditional rendering)
 */
export const HistoryChart: React.NamedExoticComponent<HistoryChartProps> =
    React.memo(function HistoryChart({
        className = "",
        history,
        maxItems = 120,
        title,
    }: HistoryChartProps) {
        // Return null for empty history (React convention for "render nothing")
        if (history.length === 0) {
            // React components, returning null from a render function
            // is actually the correct and idiomatic way to indicate "render
            // nothing." This is a special case where null is the standard React
            // convention.

            return null;
        }

        // Show up to maxItems bars, oldest first after reversal (chronological
        // order display) Note: Assumes input history is in newest-first order,
        // toReversed() makes it oldest-first for display
        const displayedHistory = history.slice(0, maxItems).toReversed();

        return (
            <div className={`mb-3 w-full ${className}`}>
                <div className="mb-2 flex items-center justify-end">
                    <ThemedText size="xs" variant="secondary">
                        {title}
                    </ThemedText>
                </div>
                <div className="flex min-w-0 shrink items-center justify-end gap-1 overflow-hidden">
                    {displayedHistory.map((record) => (
                        <MiniChartBar
                            key={`${record.timestamp}-${record.status}-${record.responseTime}`}
                            responseTime={record.responseTime}
                            status={record.status}
                            timestamp={record.timestamp}
                        />
                    ))}
                </div>
            </div>
        );
    });
