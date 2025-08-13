/**
 * Monitoring status display component for the site details header.
 * Shows monitor status indicators with type and connection information.
 *
 * @remarks
 * Enhanced monitoring status display component for the site details header.
 * Shows larger indicators with monitor names and types using the theme system.
 * Displays monitor status, type, and connection information with proper error
 * handling for URL parsing.
 */

import type { Monitor } from "@shared/types";
import type { JSX } from "react/jsx-runtime";

import ThemedBadge from "../../theme/components/ThemedBadge";
import ThemedBox from "../../theme/components/ThemedBox";
import ThemedText from "../../theme/components/ThemedText";
import { safeGetHostname } from "../../utils/monitoring/dataValidation";

/**
 * Props for the MonitoringStatusDisplay component.
 */
export interface MonitoringStatusDisplayProperties {
    /** Array of monitors to display status for */
    readonly monitors: Monitor[];
}

/**
 * Enhanced monitoring status display component for the site details header.
 *
 * Shows larger indicators with monitor names and types using the theme system.
 * Displays monitor status, type, and connection information with proper error
 * handling for URL parsing.
 *
 * @param props - Component props containing monitors array
 * @returns JSX element with enhanced monitoring status indicators
 */
const MonitoringStatusDisplay = ({
    monitors,
}: MonitoringStatusDisplayProperties): JSX.Element => {
    if (monitors.length === 0) {
        return (
            <ThemedBox
                data-testid="monitoring-status-display"
                padding="sm"
                rounded="md"
                variant="secondary"
            >
                <ThemedText size="sm" variant="secondary">
                    No monitors configured
                </ThemedText>
            </ThemedBox>
        );
    }

    const runningCount = monitors.filter(
        (monitor) => monitor.monitoring
    ).length;
    const totalCount = monitors.length;

    return (
        <ThemedBox
            className="min-w-0"
            data-testid="monitoring-status-display"
            padding="md"
            rounded="lg"
            shadow="sm"
            surface="elevated"
            variant="primary"
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <ThemedText size="sm" variant="primary" weight="semibold">
                        Monitor Status
                    </ThemedText>
                    <ThemedBadge
                        size="sm"
                        variant={runningCount > 0 ? "success" : "secondary"}
                    >
                        {runningCount}/{totalCount} active
                    </ThemedBadge>
                </div>
                <div className="flex max-h-32 flex-col gap-1 overflow-y-auto">
                    {monitors.map((monitor) => (
                        <div
                            className="flex items-center gap-2"
                            data-testid={`monitor-status-${monitor.id}`}
                            key={monitor.id}
                        >
                            <ThemedBadge
                                size="xs"
                                variant={
                                    monitor.monitoring ? "success" : "secondary"
                                }
                            >
                                <div className="flex items-center gap-1">
                                    <div
                                        className={`h-2 w-2 rounded-full ${
                                            monitor.monitoring
                                                ? "themed-status-up"
                                                : "themed-status-paused"
                                        }`}
                                        title={`${monitor.type.toUpperCase()}: ${monitor.monitoring ? "Running" : "Stopped"}`}
                                    />
                                    <ThemedText size="xs" weight="medium">
                                        {monitor.type.toUpperCase()}
                                    </ThemedText>
                                </div>
                            </ThemedBadge>
                            <ThemedText
                                className="min-w-0 flex-1"
                                size="xs"
                                variant="secondary"
                            >
                                {/* Display appropriate connection info based on monitor type */}
                                {monitor.type === "http" && monitor.url ? (
                                    <span className="block truncate">
                                        {safeGetHostname(monitor.url) ||
                                            monitor.url}
                                    </span>
                                ) : null}
                                {monitor.type === "port" &&
                                monitor.host &&
                                monitor.port ? (
                                    <span className="block truncate">
                                        {monitor.host}:{monitor.port}
                                    </span>
                                ) : null}
                            </ThemedText>
                        </div>
                    ))}
                </div>
            </div>
        </ThemedBox>
    );
};

export default MonitoringStatusDisplay;
