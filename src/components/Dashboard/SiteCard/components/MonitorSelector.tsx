/**
 * Monitor selection dropdown component.
 * Provides interface for selecting between multiple monitors for a site.
 */

import React, { useCallback } from "react";

import { ThemedSelect } from "../../../../theme/components";
import { Monitor } from "../../../../types";

/**
 * Props for the MonitorSelector component.
 *
 * @public
 */
export interface MonitorSelectorProperties {
    /** Optional CSS classes for custom styling */
    className?: string;
    /** Array of available monitors to choose from */
    monitors: Monitor[];
    /** Callback function for selection change events */
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    /** ID of the currently selected monitor */
    selectedMonitorId: string;
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
}: MonitorSelectorProperties) {
    // Memoize event handlers to prevent recreation on every render
    const handleClick = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
    }, []);

    const handleMouseDown = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
    }, []);

    // Memoize the option formatting to avoid recalculation
    const formatMonitorOption = useCallback((monitor: Monitor) => {
        const monitorLabel = monitor.type.toUpperCase();
        const getDetail = () => {
            if (monitor.port) {
                return `:${monitor.port}`;
            }
            if (monitor.url) {
                return `: ${monitor.url}`;
            }
            return "";
        };
        return `${monitorLabel}${getDetail()}`;
    }, []);

    return (
        <ThemedSelect
            className={className}
            onChange={onChange}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            value={selectedMonitorId}
        >
            {monitors.map((monitor) => (
                <option key={monitor.id} value={monitor.id}>
                    {formatMonitorOption(monitor)}
                </option>
            ))}
        </ThemedSelect>
    );
});
