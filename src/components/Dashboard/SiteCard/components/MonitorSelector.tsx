/**
 * Monitor selection dropdown component. Provides interface for selecting
 * between multiple monitors for a site.
 */

import type { Monitor } from "@shared/types";

import React, { useCallback } from "react";

import ThemedSelect from "../../../../theme/components/ThemedSelect";

/**
 * Props for the MonitorSelector component.
 *
 * @public
 */
export interface MonitorSelectorProperties {
    /** Optional CSS classes for custom styling */
    readonly className?: string;
    /** Array of available monitors to choose from */
    readonly monitors: Monitor[];
    /** Callback function for selection change events */
    readonly onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    /** ID of the currently selected monitor */
    readonly selectedMonitorId: string;
}

/**
 * Monitor selection dropdown component for switching between site monitors.
 *
 * Features:
 *
 * - Dynamic option formatting based on monitor type and configuration
 * - Event propagation control to prevent card click conflicts
 * - Optimized with React.memo and useCallback for performance
 * - Themed select component integration
 * - Supports HTTP and port monitor types with descriptive labels
 *
 * @example
 *
 * ```tsx
 * <MonitorSelector
 *     monitors={site.monitors}
 *     selectedMonitorId="monitor-1"
 *     onChange={handleMonitorChange}
 *     className="w-32"
 * />;
 * ```
 *
 * @param props - Component props
 *
 * @returns JSX.Element containing the monitor selector dropdown
 */
export const MonitorSelector: React.NamedExoticComponent<MonitorSelectorProperties> =
    React.memo(function MonitorSelector({
        className = "min-w-20",
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
        const formatMonitorOption = useCallback((monitor: Monitor): string => {
            const monitorLabel = monitor.type.toUpperCase();
            const getDetail = (): string => {
                // Show details based on monitor type
                switch (monitor.type) {
                    case "dns": {
                        return monitor.host ? `: ${monitor.host}` : "";
                    }
                    case "http": {
                        return monitor.url ? `: ${monitor.url}` : "";
                    }
                    case "ping": {
                        return monitor.host ? `: ${monitor.host}` : "";
                    }
                    case "port": {
                        return monitor.port ? `: ${monitor.port}` : "";
                    }
                    default: {
                        // Fallback to port or URL for unknown types
                        if (monitor.port) {
                            return `: ${monitor.port}`;
                        }
                        if (monitor.url) {
                            return `: ${monitor.url}`;
                        }
                        return "";
                    }
                }
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
