import React from "react";

import { MiniChartBar, ThemedText } from "../../theme/components";
import { StatusHistory } from "../../types";

interface HistoryChartProps {
    history: StatusHistory[];
    title: string;
    maxItems?: number;
    className?: string;
}

/**
 * Reusable history chart component for visualizing status history
 * Can be used anywhere we need to show historical data
 * Memoized to prevent unnecessary re-renders when data hasn't changed
 * Uses CSS-based responsive layout instead of complex JavaScript calculations
 */
export const HistoryChart = React.memo(function HistoryChart({
    className = "",
    history,
    maxItems = 120,
    title,
}: HistoryChartProps) {
    if (history.length === 0) {
        // React components, returning null from a render function
        // is actually the correct and idiomatic way to indicate "render nothing."
        // This is a special case where null is the standard React convention.
        // eslint-disable-next-line unicorn/no-null
        return null;
    }

    // Simple approach: show up to maxItems bars, let CSS handle responsive layout
    const displayedHistory = history.slice(0, maxItems).reverse();

    return (
        <div className={`mb-3 w-full ${className}`}>
            <div className="flex items-center justify-end mb-2">
                <ThemedText size="xs" variant="secondary">
                    {title}
                </ThemedText>
            </div>
            <div className="flex items-center justify-end gap-1 overflow-hidden min-w-0 flex-shrink">
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
