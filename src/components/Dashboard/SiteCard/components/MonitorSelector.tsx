import React, { useCallback } from "react";

import { ThemedSelect } from "../../../../theme/components";
import { Monitor } from "../../../../types";

interface MonitorSelectorProps {
    monitors: Monitor[];
    selectedMonitorId: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    className?: string;
}

/**
 * Reusable monitor selection dropdown
 * Optimized with proper event handling and memoization
 */
export const MonitorSelector = React.memo(function MonitorSelector({
    className = "min-w-[80px]",
    monitors,
    onChange,
    selectedMonitorId,
}: MonitorSelectorProps) {
    // Memoize event handlers to prevent recreation on every render
    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    // Memoize the option formatting to avoid recalculation
    const formatMonitorOption = useCallback((monitor: Monitor) => {
        const typeLabel = monitor.type.toUpperCase();
        const detail = monitor.port ? `:${monitor.port}` : monitor.url ? `: ${monitor.url}` : "";
        return `${typeLabel}${detail}`;
    }, []);

    return (
        <div onClick={handleClick} onMouseDown={handleMouseDown}>
            <ThemedSelect value={selectedMonitorId} onChange={onChange} className={className}>
                {monitors.map((monitor) => (
                    <option key={monitor.id} value={monitor.id}>
                        {formatMonitorOption(monitor)}
                    </option>
                ))}
            </ThemedSelect>
        </div>
    );
});
