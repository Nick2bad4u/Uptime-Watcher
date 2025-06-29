/**
 * Monitor selection dropdown component.
 * Provides interface for selecting between multiple monitors for a site.
 */

import React, { useCallback } from "react";

import { ThemedSelect } from "../../../../theme/components";
import { Monitor } from "../../../../types";

/**
 * Props for the MonitorSelector component.
 */
interface MonitorSelectorProps {
    /** Array of available monitors to choose from */
    monitors: Monitor[];
    /** ID of the currently selected monitor */
    selectedMonitorId: string;
    /** Callback function for selection change events */
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    /** Optional CSS classes for custom styling */
    className?: string;
}

/**
 * Monitor selection dropdown component for switching between site monitors.
 *
 * Features:
 * - Dynamic option formatting based on monitor type and configuration
 * - Event propagation control to prevent card click conflicts
 * - Optimized with React.memo and useCallback for performance
 * - Themed select component integration
 * - Supports HTTP and port monitor types with descriptive labels
 *
 * @param props - Component props
 * @returns JSX element containing the monitor selector dropdown
 *
 * @example
 * ```tsx
 * <MonitorSelector
 *   monitors={site.monitors}
 *   selectedMonitorId="monitor-1"
 *   onChange={handleMonitorChange}
 *   className="w-32"
 * />
 * ```
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
        const getDetail = () => {
            if (monitor.port) {
                return `:${monitor.port}`;
            }
            if (monitor.url) {
                return `: ${monitor.url}`;
            }
            return "";
        };
        return `${typeLabel}${getDetail()}`;
    }, []);

    return (
        <ThemedSelect
            value={selectedMonitorId}
            onChange={onChange}
            className={className}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
        >
            {monitors.map((monitor) => (
                <option key={monitor.id} value={monitor.id}>
                    {formatMonitorOption(monitor)}
                </option>
            ))}
        </ThemedSelect>
    );
});
