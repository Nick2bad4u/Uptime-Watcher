/**
 * Detailed monitor list for stacked site card layout.
 *
 * @remarks
 * Provides a richer view of monitor health, response time, and activity when
 * the card is displayed in stacked mode.
 */

import type { Monitor, MonitorStatus } from "@shared/types";

import { memo, type NamedExoticComponent, useMemo } from "react";

import { ThemedText } from "../../../theme/components/ThemedText";
import { AppIcons } from "../../../utils/icons";
import { Tooltip } from "../../common/Tooltip/Tooltip";

const STATUS_LABELS: Record<MonitorStatus, string> = {
    degraded: "Degraded",
    down: "Down",
    paused: "Paused",
    pending: "Pending",
    up: "Online",
};

const STATUS_ICON_MAP = {
    degraded: AppIcons.status.warning,
    down: AppIcons.status.downFilled,
    paused: AppIcons.status.pausedFilled,
    pending: AppIcons.status.pendingFilled,
    up: AppIcons.status.upFilled,
} as const;

const formatResponseTime = (milliseconds: number): string =>
    new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    }).format(milliseconds);

const SECOND_IN_MS = 1000;
const MINUTE_IN_MS = 60 * SECOND_IN_MS;

const formatInterval = (milliseconds: number): string => {
    if (milliseconds <= 0) {
        return "N/A";
    }

    if (milliseconds < MINUTE_IN_MS) {
        const seconds = Math.round(milliseconds / SECOND_IN_MS);
        return `${seconds}s`;
    }

    const minutes = milliseconds / MINUTE_IN_MS;
    if (minutes < 60) {
        return `${minutes.toFixed(minutes >= 10 ? 0 : 1)}m`;
    }

    const hours = minutes / 60;
    return `${hours.toFixed(hours >= 10 ? 0 : 1)}h`;
};

const formatRelativeTime = (timestamp?: number): string => {
    if (!timestamp) {
        return "No history";
    }

    const diffSeconds = Math.max(
        0,
        Math.round((Date.now() - timestamp) / SECOND_IN_MS)
    );
    if (diffSeconds < 5) {
        return "Just now";
    }
    if (diffSeconds < 60) {
        return `${diffSeconds}s ago`;
    }

    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 48) {
        return `${diffHours}h ago`;
    }

    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
};

const resolveMonitorLabel = (monitor: Monitor): string => {
    if (monitor.url) {
        try {
            return new URL(monitor.url).hostname;
        } catch {
            return monitor.url;
        }
    }

    if (monitor.host) {
        return monitor.host;
    }

    if (monitor.baselineUrl) {
        return monitor.baselineUrl;
    }

    return monitor.type.toUpperCase();
};

const extractLatestTimestamp = (monitor: Monitor): number | undefined => {
    const [latest] = monitor.history;
    return latest?.timestamp;
};

const ResponseIcon = AppIcons.metrics.response;
const IntervalIcon = AppIcons.metrics.time;
const ActivityIcon = AppIcons.metrics.activity;

/**
 * Props for {@link SiteCardMonitorList}.
 */
export interface SiteCardMonitorListProperties {
    /** Monitors attached to the site. */
    readonly monitors: readonly Monitor[];
    /** Currently focused monitor identifier. */
    readonly selectedMonitorId: string;
}

/**
 * Monitor overview list used in stacked site card layout.
 */
export const SiteCardMonitorList: NamedExoticComponent<SiteCardMonitorListProperties> =
    memo(function SiteCardMonitorList({
        monitors,
        selectedMonitorId,
    }: SiteCardMonitorListProperties) {
        const monitorItems = useMemo(
            () =>
                monitors.map((monitor) => {
                    const StatusIcon = STATUS_ICON_MAP[monitor.status];
                    const statusLabel = STATUS_LABELS[monitor.status];
                    const lastTimestamp = extractLatestTimestamp(monitor);
                    const isActive = monitor.id === selectedMonitorId;

                    return {
                        interval: formatInterval(monitor.checkInterval),
                        isActive,
                        lastCheck: formatRelativeTime(lastTimestamp),
                        monitor,
                        responseTime: formatResponseTime(monitor.responseTime),
                        statusIcon: StatusIcon,
                        statusLabel,
                        statusValue: monitor.status,
                        title: resolveMonitorLabel(monitor),
                    } as const;
                }),
            [monitors, selectedMonitorId]
        );

        if (monitorItems.length === 0) {
            return (
                <div className="site-card__monitor-panel">
                    <ThemedText
                        className="site-card__monitor-empty"
                        size="sm"
                        variant="tertiary"
                    >
                        No monitors configured yet — add one to begin tracking
                        this site.
                    </ThemedText>
                </div>
            );
        }

        return (
            <div className="site-card__monitor-panel">
                <ThemedText
                    className="site-card__monitor-title"
                    size="sm"
                    variant="secondary"
                    weight="semibold"
                >
                    Monitor Health
                </ThemedText>

                <ul className="site-card__monitor-list">
                    {monitorItems.map((item) => {
                        const {
                            interval,
                            isActive,
                            lastCheck,
                            monitor,
                            responseTime,
                            statusIcon: StatusIcon,
                            statusLabel,
                            statusValue,
                            title,
                        } = item;

                        return (
                            <li
                                className={
                                    isActive
                                        ? "site-card__monitor-item site-card__monitor-item--active"
                                        : "site-card__monitor-item"
                                }
                                key={monitor.id}
                            >
                                <div className="site-card__monitor-item-header">
                                    <Tooltip
                                        content={`Status: ${statusLabel}`}
                                        position="bottom"
                                    >
                                        {(triggerProps) => (
                                            <span
                                                className={`site-card__monitor-status site-card__monitor-status--${statusValue}`}
                                                {...triggerProps}
                                            >
                                                <StatusIcon className="site-card__monitor-status-icon" />
                                            </span>
                                        )}
                                    </Tooltip>
                                    <ThemedText
                                        className="site-card__monitor-name"
                                        size="sm"
                                        weight="semibold"
                                    >
                                        {title}
                                    </ThemedText>
                                    {isActive ? (
                                        <span className="site-card__monitor-chip">
                                            Selected
                                        </span>
                                    ) : null}
                                </div>

                                <div className="site-card__monitor-item-body">
                                    <Tooltip
                                        content="Average response time across recent checks"
                                        position="bottom"
                                    >
                                        {(triggerProps) => (
                                            <span
                                                className="site-card__monitor-stat"
                                                {...triggerProps}
                                            >
                                                <ResponseIcon className="site-card__monitor-stat-icon" />
                                                <span>{responseTime} ms</span>
                                            </span>
                                        )}
                                    </Tooltip>
                                    <Tooltip
                                        content="Configured check frequency"
                                        position="bottom"
                                    >
                                        {(triggerProps) => (
                                            <span
                                                className="site-card__monitor-stat"
                                                {...triggerProps}
                                            >
                                                <IntervalIcon className="site-card__monitor-stat-icon" />
                                                <span>{interval}</span>
                                            </span>
                                        )}
                                    </Tooltip>
                                    <Tooltip
                                        content="Time since the last successful status update"
                                        position="bottom"
                                    >
                                        {(triggerProps) => (
                                            <span
                                                className="site-card__monitor-stat"
                                                {...triggerProps}
                                            >
                                                <ActivityIcon className="site-card__monitor-stat-icon" />
                                                <span>{lastCheck}</span>
                                            </span>
                                        )}
                                    </Tooltip>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    });
