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
        className="header-status-summary"
        padding="md"
        rounded="lg"
        shadow="md"
        variant="secondary"
    >
        <div className="header-status-summary__group">
            {totalMonitors > 0 ? (
                <Tooltip
                    content={`${uptimePercentage}% uptime across ${totalMonitors} monitor${totalMonitors === 1 ? "" : "s"}`}
                    position="bottom"
                >
                    {(triggerProps) => (
                        <div
                            className="header-status-summary__health"
                            {...triggerProps}
                        >
                            <HealthIndicator
                                getAvailabilityColor={getAvailabilityColor}
                                uptimePercentage={uptimePercentage}
                            />
                            <div className="header-status-summary__health-meta">
                                <ThemedText
                                    size="xs"
                                    variant="secondary"
                                    weight="medium"
                                >
                                    Global Health
                                </ThemedText>
                                <ThemedText size="lg" weight="semibold">
                                    {uptimePercentage}%
                                </ThemedText>
                            </div>
                        </div>
                    )}
                </Tooltip>
            ) : null}

            <Tooltip content="Monitors operating normally" position="bottom">
                {(triggerProps) => (
                    <div {...triggerProps}>
                        <StatusCounter
                            className="status-up-badge"
                            count={upMonitors}
                            label="Up"
                            status="up"
                        />
                    </div>
                )}
            </Tooltip>

            {degradedMonitors > 0 ? (
                <Tooltip
                    content="Monitors experiencing degraded performance"
                    position="bottom"
                >
                    {(triggerProps) => (
                        <div {...triggerProps}>
                            <StatusCounter
                                className="status-degraded-badge"
                                count={degradedMonitors}
                                label="Degraded"
                                status="degraded"
                            />
                        </div>
                    )}
                </Tooltip>
            ) : null}

            <Tooltip content="Monitors currently down" position="bottom">
                {(triggerProps) => (
                    <div {...triggerProps}>
                        <StatusCounter
                            className="status-down-badge"
                            count={downMonitors}
                            label="Down"
                            status="down"
                        />
                    </div>
                )}
            </Tooltip>
        </div>

        <div className="header-status-summary__group header-status-summary__group--secondary">
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
                            <ThemedText
                                size="sm"
                                variant="primary"
                                weight="semibold"
                            >
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
                            <ThemedText
                                size="sm"
                                variant="primary"
                                weight="semibold"
                            >
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
                                <ThemedText
                                    size="sm"
                                    variant="primary"
                                    weight="semibold"
                                >
                                    {totalMonitors}
                                </ThemedText>
                                <ThemedText
                                    className="leading-none"
                                    size="xs"
                                    variant="secondary"
                                >
                                    Total Monitors
                                </ThemedText>
                            </div>
                        </div>
                    )}
                </Tooltip>
            ) : null}
        </div>
    </ThemedBox>
);
