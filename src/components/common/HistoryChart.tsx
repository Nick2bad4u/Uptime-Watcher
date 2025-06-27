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
 */
export const HistoryChart = React.memo(function HistoryChart({
    className = "",
    history,
    maxItems = 20,
    title,
}: HistoryChartProps) {
    if (history.length === 0) {
        // React components, returning null from a render function
        // is actually the correct and idiomatic way to indicate "render nothing."
        // This is a special case where null is the standard React convention.
        // eslint-disable-next-line unicorn/no-null
        return null;
    }

    return (
        <div className={`mb-3 ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <ThemedText size="xs" variant="secondary">
                        {title}
                    </ThemedText>
                </div>
            </div>
            <div className="flex items-center space-x-1">
                {history.slice(-maxItems).map((record, index) => (
                    <MiniChartBar
                        key={index}
                        status={record.status}
                        responseTime={record.responseTime}
                        timestamp={record.timestamp}
                    />
                ))}
            </div>
        </div>
    );
});
