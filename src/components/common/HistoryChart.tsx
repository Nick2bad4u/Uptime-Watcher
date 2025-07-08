/**
 * HistoryChart component for visualizing status history as mini chart bars.
 * Provides a compact, responsive chart for displaying historical uptime/downtime data.
 */

import React from "react";

import { MiniChartBar, ThemedText } from "../../theme";
import { StatusHistory } from "../../types";

/** Props for the HistoryChart component */
interface HistoryChartProperties {
    /** Array of historical status records to display */
    history: StatusHistory[];
    /** Title to display above the chart */
    title: string;
    /** Maximum number of items to display (default: 120) */
    maxItems?: number;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Reusable history chart component for visualizing status history.
 * Can be used anywhere we need to show historical data.
 *
 * Features:
 * - Responsive layout using CSS
 * - Memoized to prevent unnecessary re-renders
 * - Configurable item limit
 * - Graceful handling of empty data
 *
 * @param props - HistoryChart component props
 * @returns JSX element containing the history chart or null if no data
 */
export const HistoryChart = React.memo(function HistoryChart({
    className = "",
    history,
    maxItems = 120,
    title,
}: HistoryChartProperties) {
    // Return null for empty history (React convention for "render nothing")
    if (history.length === 0) {
        // React components, returning null from a render function
        // is actually the correct and idiomatic way to indicate "render nothing."
        // This is a special case where null is the standard React convention.

        return null;
    }

    // Show up to maxItems bars, most recent first (reverse chronological order)
    const displayedHistory = history.slice(0, maxItems).reverse();

    return (
        <div className={`mb-3 w-full ${className}`}>
            <div className="flex items-center justify-end mb-2">
                <ThemedText size="xs" variant="secondary">
                    {title}
                </ThemedText>
            </div>
            <div className="flex items-center justify-end flex-shrink min-w-0 gap-1 overflow-hidden">
                {displayedHistory.map((record) => (
                    <MiniChartBar
                        key={record.timestamp}
                        status={record.status}
                        responseTime={record.responseTime}
                        timestamp={record.timestamp}
                    />
                ))}
            </div>
        </div>
    );
});
