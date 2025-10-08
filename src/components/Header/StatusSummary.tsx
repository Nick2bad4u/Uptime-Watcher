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
import { Tooltip } from "../common/Tooltip/Tooltip";
import { HealthIndicator } from "./HealthIndicator";

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
        className="header-status-summary"
        data-testid="header-status-summary"
        padding="sm"
        rounded="lg"
        shadow="sm"
        variant="secondary"
    >
        <div className="header-status-summary__container">
            {totalMonitors > 0 ? (
                <Tooltip
                    content={`${uptimePercentage}% uptime across ${totalMonitors} monitor${totalMonitors === 1 ? "" : "s"}`}
                    position="bottom"
                >
                    {(triggerProps) => (
                        <div
                            className="header-status-summary__pill header-status-summary__pill--health"
                            {...triggerProps}
                        >
                            <HealthIndicator
                                getAvailabilityColor={getAvailabilityColor}
                                uptimePercentage={uptimePercentage}
                            />
                        </div>
                    )}
                </Tooltip>
            ) : null}

            <Tooltip content="Monitors operating normally" position="bottom">
                {(triggerProps) => (
                    <div
                        className="header-status-summary__pill status-up-badge"
                        {...triggerProps}
                    >
                        <StatusIndicator size="sm" status="up" />
                        <div className="header-status-summary__pill-text">
                            <ThemedText size="sm" weight="semibold">
                                {upMonitors}
                            </ThemedText>
                            <ThemedText size="xs" variant="secondary">
                                Up
                            </ThemedText>
                        </div>
                    </div>
                )}
            </Tooltip>

            {degradedMonitors > 0 ? (
                <Tooltip
                    content="Monitors experiencing degraded performance"
                    position="bottom"
                >
                    {(triggerProps) => (
                        <div
                            className="header-status-summary__pill status-degraded-badge"
                            {...triggerProps}
                        >
                            <StatusIndicator size="sm" status="degraded" />
                            <div className="header-status-summary__pill-text">
                                <ThemedText size="sm" weight="semibold">
                                    {degradedMonitors}
                                </ThemedText>
                                <ThemedText size="xs" variant="secondary">
                                    Degraded
                                </ThemedText>
                            </div>
                        </div>
                    )}
                </Tooltip>
            ) : null}

            <Tooltip content="Monitors currently down" position="bottom">
                {(triggerProps) => (
                    <div
                        className="header-status-summary__pill status-down-badge"
                        {...triggerProps}
                    >
                        <StatusIndicator size="sm" status="down" />
                        <div className="header-status-summary__pill-text">
                            <ThemedText size="sm" weight="semibold">
                                {downMonitors}
                            </ThemedText>
                            <ThemedText size="xs" variant="secondary">
                                Down
                            </ThemedText>
                        </div>
                    </div>
                )}
            </Tooltip>

            <Tooltip
                content="Monitoring jobs awaiting verification"
                position="bottom"
            >
                {(triggerProps) => (
                    <div
                        className="header-status-summary__pill status-pending-badge"
                        {...triggerProps}
                    >
                        <StatusIndicator size="sm" status="pending" />
                        <div className="header-status-summary__pill-text">
                            <ThemedText size="sm" weight="semibold">
                                {pendingMonitors}
                            </ThemedText>
                            <ThemedText size="xs" variant="secondary">
                                Pending
                            </ThemedText>
                        </div>
                    </div>
                )}
            </Tooltip>

            <Tooltip
                content="Monitoring paused manually or awaiting schedule"
                position="bottom"
            >
                {(triggerProps) => (
                    <div
                        className="header-status-summary__pill status-paused-badge"
                        {...triggerProps}
                    >
                        <StatusIndicator size="sm" status="paused" />
                        <div className="header-status-summary__pill-text">
                            <ThemedText size="sm" weight="semibold">
                                {pausedMonitors}
                            </ThemedText>
                            <ThemedText size="xs" variant="secondary">
                                Paused
                            </ThemedText>
                        </div>
                    </div>
                )}
            </Tooltip>

            {totalMonitors > 0 ? (
                <Tooltip
                    content="Total configured monitors across all sites"
                    position="bottom"
                >
                    {(triggerProps) => (
                        <div
                            className="header-status-summary__pill total-sites-badge"
                            {...triggerProps}
                        >
                            <div className="header-status-summary__dot" />
                            <div className="header-status-summary__pill-text">
                                <ThemedText size="sm" weight="semibold">
                                    {totalMonitors}
                                </ThemedText>
                                <ThemedText size="xs" variant="secondary">
                                    Total
                                </ThemedText>
                            </div>
                        </div>
                    )}
                </Tooltip>
            ) : null}
        </div>
    </ThemedBox>
);
