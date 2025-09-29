/**
 * Monitoring status display component for the site details header. Shows
 * monitor status indicators with type and connection information.
 *
 * @remarks
 * Enhanced monitoring status display component for the site details header.
 * Shows larger indicators with monitor names and types using the theme system.
 * Displays monitor status, type, and connection information with proper error
 * handling for URL parsing.
 */

import type { Monitor } from "@shared/types";
import type { JSX } from "react/jsx-runtime";

import { memo, type NamedExoticComponent } from "react";

import { ThemedBadge } from "../../theme/components/ThemedBadge";
import { ThemedBox } from "../../theme/components/ThemedBox";
import { ThemedText } from "../../theme/components/ThemedText";
import {
    getMonitorDisplayIdentifier,
    getMonitorTypeDisplayLabel,
} from "../../utils/fallbacks";
import { formatTitleSuffix } from "../../utils/monitorTitleFormatters";

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
 *
 * @returns JSX element with enhanced monitoring status indicators
 */
export const MonitoringStatusDisplay: NamedExoticComponent<MonitoringStatusDisplayProperties> =
    memo(function MonitoringStatusDisplay({
        monitors,
    }: MonitoringStatusDisplayProperties): JSX.Element {
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
                        <ThemedText
                            size="sm"
                            variant="primary"
                            weight="semibold"
                        >
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
                        {monitors.map((monitor) => {
                            const monitorTypeLabel = getMonitorTypeDisplayLabel(
                                monitor.type
                            );
                            const fallbackIdentifier = monitor.id;
                            const suffix = formatTitleSuffix(monitor).trim();
                            const normalizedSuffix =
                                suffix.startsWith("(") && suffix.endsWith(")")
                                    ? suffix.slice(1, -1)
                                    : suffix;
                            const connectionInfo =
                                normalizedSuffix.length > 0
                                    ? normalizedSuffix
                                    : getMonitorDisplayIdentifier(
                                          monitor,
                                          fallbackIdentifier
                                      );

                            return (
                                <div
                                    className="flex items-center gap-2"
                                    data-testid={`monitor-status-${monitor.id}`}
                                    key={monitor.id}
                                >
                                    <ThemedBadge
                                        size="xs"
                                        variant={
                                            monitor.monitoring
                                                ? "success"
                                                : "secondary"
                                        }
                                    >
                                        <div className="flex items-center gap-1">
                                            <div
                                                className={`h-2 w-2 rounded-full ${
                                                    monitor.monitoring
                                                        ? "themed-status-up"
                                                        : "themed-status-paused"
                                                }`}
                                                title={`${monitorTypeLabel}: ${
                                                    monitor.monitoring
                                                        ? "Running"
                                                        : "Stopped"
                                                }`}
                                            />
                                            <ThemedText
                                                size="xs"
                                                weight="medium"
                                            >
                                                {monitorTypeLabel}
                                            </ThemedText>
                                        </div>
                                    </ThemedBadge>
                                    <ThemedText
                                        className="min-w-0 flex-1"
                                        size="xs"
                                        variant="secondary"
                                    >
                                        {connectionInfo ? (
                                            <span className="block truncate">
                                                {connectionInfo}
                                            </span>
                                        ) : null}
                                    </ThemedText>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </ThemedBox>
        );
    });
