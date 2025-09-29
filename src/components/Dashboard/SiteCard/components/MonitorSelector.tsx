/**
 * Monitor selection dropdown component. Provides interface for selecting
 * between multiple monitors for a site.
 */

import type { Monitor } from "@shared/types";
import type { EventHandlers } from "@shared/types/componentProps";

import {
    memo,
    type MouseEvent,
    type NamedExoticComponent,
    useCallback,
} from "react";

import {
    getMonitorDisplayIdentifier,
    getMonitorTypeDisplayLabel,
} from "../../../../utils/fallbacks";
import { formatTitleSuffix } from "../../../../utils/monitorTitleFormatters";
import { ThemedSelect } from "../../../../theme/components/ThemedSelect";

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
    readonly onChange: EventHandlers.ChangeWithEvent<HTMLSelectElement>;
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
export const MonitorSelector: NamedExoticComponent<MonitorSelectorProperties> =
    memo(function MonitorSelector({
        className = "min-w-20",
        monitors,
        onChange,
        selectedMonitorId,
    }: MonitorSelectorProperties) {
        // Memoize event handlers to prevent recreation on every render
        const handleClick = useCallback((event: MouseEvent) => {
            event.stopPropagation();
        }, []);

        const handleMouseDown = useCallback((event: MouseEvent) => {
            event.stopPropagation();
        }, []);

        // Memoize the option formatting to avoid recalculation
        const formatMonitorOption = useCallback((monitor: Monitor): string => {
            const monitorTypeLabel = getMonitorTypeDisplayLabel(monitor.type);
            const fallbackIdentifier = monitor.id;

            const rawSuffix = formatTitleSuffix(monitor).trim();
            const normalizedSuffix =
                rawSuffix.startsWith("(") && rawSuffix.endsWith(")")
                    ? rawSuffix.slice(1, -1)
                    : rawSuffix;

            const identifier =
                normalizedSuffix.length > 0
                    ? normalizedSuffix
                    : getMonitorDisplayIdentifier(monitor, fallbackIdentifier);

            return identifier
                ? `${monitorTypeLabel}: ${identifier}`
                : monitorTypeLabel;
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
