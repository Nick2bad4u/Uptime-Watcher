/**
 * StatusSummary component for displaying status overview in the header.
 *
 * @remarks
 * This component displays health indicator and status counters, reducing
 * nesting complexity in the main Header component.
 */

import type { JSX } from "react";

import { StatusIndicator } from "../../theme/components/StatusIndicator";
import { ThemedBox } from "../../theme/components/ThemedBox";
import { ThemedText } from "../../theme/components/ThemedText";
import { HealthIndicator } from "./HealthIndicator";
import { StatusCounter } from "./StatusCounter";

/**
 * Properties for the StatusSummary component.
 */
interface StatusSummaryProperties {
    /** Number of degraded monitors */
    readonly degradedMonitors: number;
    /** Number of down monitors */
    readonly downMonitors: number;
    /** Function to get availability color */
    readonly getAvailabilityColor: (percentage: number) => string;
    /** Number of paused monitors */
    readonly pausedMonitors: number;
    /** Number of pending monitors */
    readonly pendingMonitors: number;
    /** Total number of monitors */
    readonly totalMonitors: number;
    /** Number of up monitors */
    readonly upMonitors: number;
    /** Overall uptime percentage */
    readonly uptimePercentage: number;
}

/**
 * StatusSummary component for displaying monitoring status overview.
 *
 * @param props - The component properties
 *
 * @returns JSX element representing the status summary
 */
export const StatusSummary = ({
    degradedMonitors,
    downMonitors,
    getAvailabilityColor,
    pausedMonitors,
    pendingMonitors,
    totalMonitors,
    upMonitors,
    uptimePercentage,
}: StatusSummaryProperties): JSX.Element => (
    <ThemedBox
        className="header-status-summary-box inline-flex w-fit min-w-0 flex-wrap items-center gap-2 transition-all duration-300 sm:gap-3"
        padding="sm"
        rounded="lg"
        shadow="sm"
        variant="secondary"
    >
        {/* Overall Health Badge */}
        {totalMonitors > 0 && (
            <div className="shrink-0">
                <HealthIndicator
                    getAvailabilityColor={getAvailabilityColor}
                    uptimePercentage={uptimePercentage}
                />
            </div>
        )}

        {/* Up Status */}
        <div className="shrink-0">
            <StatusCounter
                className="status-up-badge"
                count={upMonitors}
                label="Up"
                status="up"
            />
        </div>

        {/* Degraded Status - Only show if there are degraded monitors */}
        {degradedMonitors > 0 && (
            <div className="shrink-0">
                <StatusCounter
                    className="status-degraded-badge"
                    count={degradedMonitors}
                    label="Degraded"
                    status="degraded"
                />
            </div>
        )}

        {/* Down Status */}
        <div className="shrink-0">
            <StatusCounter
                className="status-down-badge"
                count={downMonitors}
                label="Down"
                status="down"
            />
        </div>

        {/* Pending Status */}
        <div className="group status-pending-badge flex shrink-0 items-center space-x-2 rounded-md px-2 py-1 transition-all duration-200">
            <StatusIndicator size="sm" status="pending" />
            <div className="flex flex-col">
                <ThemedText size="sm" variant="primary" weight="semibold">
                    {pendingMonitors}
                </ThemedText>
                <ThemedText
                    className="leading-none"
                    size="xs"
                    variant="secondary"
                >
                    Pending
                </ThemedText>
            </div>
        </div>

        {/* Paused Status */}
        <div className="group status-paused-badge flex shrink-0 items-center space-x-2 rounded-md px-2 py-1 transition-all duration-200">
            <StatusIndicator size="sm" status="paused" />
            <div className="flex flex-col">
                <ThemedText size="sm" variant="primary" weight="semibold">
                    {pausedMonitors}
                </ThemedText>
                <ThemedText
                    className="leading-none"
                    size="xs"
                    variant="secondary"
                >
                    Paused
                </ThemedText>
            </div>
        </div>

        {/* Total Sites Badge */}
        {totalMonitors > 0 && (
            <div className="total-sites-badge bg-overlay-default/10 flex shrink-0 items-center space-x-2 rounded-md px-2 py-1">
                <div className="h-2 w-2 rounded-full bg-current opacity-50" />
                <div className="flex flex-col">
                    <ThemedText size="sm" variant="primary" weight="semibold">
                        {totalMonitors}
                    </ThemedText>
                    <ThemedText
                        className="leading-none"
                        size="xs"
                        variant="secondary"
                    >
                        Total
                    </ThemedText>
                </div>
            </div>
        )}
    </ThemedBox>
);
