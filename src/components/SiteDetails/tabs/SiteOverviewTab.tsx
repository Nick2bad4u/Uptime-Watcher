/**
 * Site Overview tab component for displaying comprehensive site information.
 * Provides an overview of the entire site including all monitors, general statistics,
 * and site-level actions.
 */

import type { Monitor, Site } from "@shared/types";
import type { JSX } from "react/jsx-runtime";

import { useCallback, useMemo } from "react";
import { FiPlay, FiSettings, FiSquare, FiTrash2 } from "react-icons/fi";
import {
    MdDomain,
    MdMonitorHeart,
    MdOutlineFactCheck,
    MdSpeed,
} from "react-icons/md";

import StatusIndicator from "../../../theme/components/StatusIndicator";
import ThemedBadge from "../../../theme/components/ThemedBadge";
import ThemedBox from "../../../theme/components/ThemedBox";
import ThemedButton from "../../../theme/components/ThemedButton";
import ThemedCard from "../../../theme/components/ThemedCard";
import ThemedProgress from "../../../theme/components/ThemedProgress";
import ThemedText from "../../../theme/components/ThemedText";
import { useAvailabilityColors, useTheme } from "../../../theme/useTheme";
import { getSiteDisplayStatus } from "../../../utils/siteStatus";
import { formatDuration, formatResponseTime } from "../../../utils/time";

/**
 * Props for the SiteOverviewTab component
 *
 * @public
 */
export interface SiteOverviewTabProperties {
    /** Average response time across all monitors */
    readonly avgResponseTime: number;
    /** Handler for removing the site */
    readonly handleRemoveSite: () => Promise<void>;
    /** Handler for starting site-level monitoring */
    readonly handleStartSiteMonitoring: () => Promise<void>;
    /** Handler for stopping site-level monitoring */
    readonly handleStopSiteMonitoring: () => Promise<void>;
    /** Whether any async operation is in progress */
    readonly isLoading: boolean;
    /** The site object to display overview for */
    readonly site: Site;
    /** Total number of checks across all monitors */
    readonly totalChecks: number;
    /** Total uptime percentage across all monitors */
    readonly uptime: number;
}

/**
 * Get monitor badge variant
 */
function getMonitorBadgeVariant(
    monitor: Monitor
): "error" | "success" | "warning" {
    return monitor.monitoring ? "success" : "warning";
}

/**
 * Get status text for monitor
 */
function getMonitorStatusText(monitor: Monitor): string {
    if (monitor.monitoring) {
        return "Running";
    }
    return "Stopped";
}

/**
 * Site Overview tab component that displays comprehensive site information.
 *
 * Features:
 * - Site metadata (name, creation date, identifier)
 * - Monitor summary with individual statuses
 * - Aggregate statistics across all monitors
 * - Site-level monitoring controls
 * - Quick actions for site management
 *
 * @param props - Component props
 * @returns JSX element containing the site overview
 */
export const SiteOverviewTab = ({
    avgResponseTime,
    handleRemoveSite,
    handleStartSiteMonitoring,
    handleStopSiteMonitoring,
    isLoading,
    site,
    totalChecks,
    uptime,
}: SiteOverviewTabProperties): JSX.Element => {
    const { getAvailabilityColor, getAvailabilityVariant } =
        useAvailabilityColors();
    const { currentTheme } = useTheme();

    // Calculate site-level statistics
    const siteDisplayStatus = getSiteDisplayStatus(site);
    const allMonitorsRunning =
        site.monitors.length > 0 &&
        site.monitors.every((monitor) => monitor.monitoring);
    const runningMonitors = site.monitors.filter(
        (monitor) => monitor.monitoring
    );

    /**
     * Get status variant for theming based on uptime percentage
     */
    const getUptimeVariant = (
        percentage: number
    ): "error" | "success" | "warning" => {
        const variant = getAvailabilityVariant(percentage);
        return variant === "danger" ? "error" : variant;
    };

    /**
     * Get response time color based on value
     */
    const getResponseTimeColor = useCallback(
        (responseTime: number): string => {
            if (responseTime <= 200) {
                return currentTheme.colors.success;
            }
            if (responseTime <= 1000) {
                return currentTheme.colors.warning;
            }
            return currentTheme.colors.error;
        },
        [
            currentTheme.colors.success,
            currentTheme.colors.warning,
            currentTheme.colors.error,
        ]
    );

    // Icon colors configuration
    const getIconColors = (): {
        actions: string;
        monitors: string;
        response: string;
        site: string;
        uptime: string;
    } => {
        const availabilityColor = getAvailabilityColor(uptime);
        const responseColor = getResponseTimeColor(avgResponseTime);
        // Use getColor to safely access theme colors with proper validation
        const siteStatusColor = ((): string => {
            switch (siteDisplayStatus) {
                case "down": {
                    return currentTheme.colors.status.down;
                }
                case "mixed": {
                    return currentTheme.colors.status.mixed;
                }
                case "paused": {
                    return currentTheme.colors.status.paused;
                }
                case "pending": {
                    return currentTheme.colors.status.pending;
                }
                case "unknown": {
                    return currentTheme.colors.status.unknown;
                }
                case "up": {
                    return currentTheme.colors.status.up;
                }
                default: {
                    return currentTheme.colors.error;
                }
            }
        })();

        return {
            actions: currentTheme.colors.error,
            monitors: currentTheme.colors.primary[600],
            response: responseColor,
            site: siteStatusColor,
            uptime: availabilityColor,
        };
    };

    const iconColors = getIconColors();
    const uptimeVariant = getUptimeVariant(uptime);

    // Memoize the response time text style to avoid inline object creation
    const responseTimeTextStyle = useMemo(
        () => ({ color: getResponseTimeColor(avgResponseTime) }),
        [avgResponseTime, getResponseTimeColor]
    );

    // useCallback handlers for jsx-no-bind compliance
    const handleStopSiteMonitoringClick = useCallback(() => {
        void handleStopSiteMonitoring();
    }, [handleStopSiteMonitoring]);

    const handleStartSiteMonitoringClick = useCallback(() => {
        void handleStartSiteMonitoring();
    }, [handleStartSiteMonitoring]);

    const handleRemoveSiteClick = useCallback(() => {
        void handleRemoveSite();
    }, [handleRemoveSite]);

    return (
        <div className="space-y-6" data-testid="site-overview-tab">
            {/* Site Overview Metrics */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <ThemedCard
                    className="flex flex-col items-center justify-center text-center"
                    hoverable
                    icon={<MdDomain />}
                    iconColor={iconColors.site}
                    title="Site Status"
                >
                    <StatusIndicator
                        showText
                        size="lg"
                        status={siteDisplayStatus}
                    />
                </ThemedCard>

                <ThemedCard
                    className="flex flex-col items-center justify-center space-y-1 text-center"
                    hoverable
                    icon={<MdMonitorHeart />}
                    iconColor={iconColors.monitors}
                    title="Monitors"
                >
                    <div className="flex flex-col items-center">
                        <ThemedText size="xl" weight="bold">
                            {runningMonitors.length}/{site.monitors.length}
                        </ThemedText>

                        <ThemedText size="xs" variant="secondary">
                            Active
                        </ThemedText>
                    </div>
                </ThemedCard>

                <ThemedCard
                    className="flex flex-col items-center justify-center text-center"
                    hoverable
                    icon={<MdOutlineFactCheck />}
                    iconColor={iconColors.uptime}
                    title="Overall Uptime"
                >
                    <ThemedProgress
                        className="flex flex-col items-center"
                        showLabel
                        value={uptime}
                        variant={uptimeVariant}
                    />

                    <ThemedBadge
                        className="mt-2"
                        size="sm"
                        variant={uptimeVariant}
                    >
                        {uptime.toFixed(2)}%
                    </ThemedBadge>
                </ThemedCard>

                <ThemedCard
                    className="flex flex-col items-center justify-center space-y-1 text-center"
                    hoverable
                    icon={<MdSpeed />}
                    iconColor={iconColors.response}
                    title="Avg Response"
                >
                    <div className="flex flex-col items-center">
                        <ThemedText
                            size="xl"
                            style={responseTimeTextStyle}
                            weight="bold"
                        >
                            {formatResponseTime(avgResponseTime)}
                        </ThemedText>

                        <ThemedText size="xs" variant="secondary">
                            {totalChecks} checks
                        </ThemedText>
                    </div>
                </ThemedCard>
            </div>

            {/* Site Information */}
            <ThemedCard
                icon={<MdDomain color={iconColors.site} />}
                title="Site Information"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <ThemedText
                            className="text-center"
                            size="xl"
                            variant="primary"
                            weight="bold"
                        >
                            {site.name}
                        </ThemedText>

                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                            <ThemedText variant="secondary">
                                <strong>ID:</strong> {site.identifier}
                            </ThemedText>

                            <ThemedText variant="secondary">
                                <strong>Name:</strong> {site.name}
                            </ThemedText>

                            <ThemedText variant="secondary">
                                <strong>Monitors:</strong>{" "}
                                {site.monitors.length}
                            </ThemedText>
                        </div>
                    </div>
                </div>
            </ThemedCard>

            {/* Monitor Details */}
            <ThemedCard
                icon={<MdMonitorHeart color={iconColors.monitors} />}
                title="Monitor Details"
            >
                <div className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <ThemedText
                            size="lg"
                            variant="primary"
                            weight="semibold"
                        >
                            Individual Monitors
                        </ThemedText>

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            <ThemedText variant="secondary">
                                <strong>Total:</strong> {site.monitors.length}
                            </ThemedText>

                            <ThemedText variant="secondary">
                                <strong>Running:</strong>{" "}
                                {runningMonitors.length}
                            </ThemedText>

                            <ThemedText variant="secondary">
                                <strong>Stopped:</strong>{" "}
                                {site.monitors.length - runningMonitors.length}
                            </ThemedText>
                        </div>
                    </div>

                    {site.monitors.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {site.monitors.map((monitor) => (
                                <ThemedBox
                                    border
                                    className="flex items-center justify-between"
                                    key={monitor.id}
                                    padding="md"
                                    rounded="lg"
                                    surface="elevated"
                                    variant="secondary"
                                >
                                    <div className="flex flex-col">
                                        <ThemedText weight="medium">
                                            {monitor.type.toUpperCase()} Monitor
                                        </ThemedText>

                                        <ThemedText
                                            size="sm"
                                            variant="secondary"
                                        >
                                            {monitor.url ??
                                                (monitor.host
                                                    ? `${monitor.host}:${monitor.port}`
                                                    : monitor.id)}
                                        </ThemedText>

                                        <ThemedText
                                            size="xs"
                                            variant="tertiary"
                                        >
                                            Every{" "}
                                            {formatDuration(
                                                monitor.checkInterval
                                            )}
                                        </ThemedText>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <ThemedBadge
                                            size="sm"
                                            variant={getMonitorBadgeVariant(
                                                monitor
                                            )}
                                        >
                                            {getMonitorStatusText(monitor)}
                                        </ThemedBadge>
                                    </div>
                                </ThemedBox>
                            ))}
                        </div>
                    ) : (
                        <ThemedText
                            className="py-8 text-center"
                            variant="secondary"
                        >
                            No monitors configured for this site.
                        </ThemedText>
                    )}
                </div>
            </ThemedCard>

            {/* Site Actions */}
            <ThemedCard
                icon={<FiSettings color={iconColors.actions} />}
                title="Site Actions"
            >
                <div className="flex flex-wrap items-center gap-4">
                    {allMonitorsRunning ? (
                        <ThemedButton
                            className="flex items-center gap-1"
                            disabled={isLoading}
                            onClick={handleStopSiteMonitoringClick}
                            size="sm"
                            variant="error"
                        >
                            <FiSquare className="h-4 w-4" />
                            Stop All Monitoring
                        </ThemedButton>
                    ) : (
                        <ThemedButton
                            className="flex items-center gap-1"
                            disabled={isLoading}
                            onClick={handleStartSiteMonitoringClick}
                            size="sm"
                            variant="success"
                        >
                            <FiPlay className="h-4 w-4" />
                            Start All Monitoring
                        </ThemedButton>
                    )}

                    <ThemedButton
                        className="flex items-center gap-1"
                        disabled={isLoading}
                        onClick={handleRemoveSiteClick}
                        size="sm"
                        variant="error"
                    >
                        <FiTrash2 className="h-4 w-4" />
                        Remove Site
                    </ThemedButton>
                </div>
            </ThemedCard>
        </div>
    );
};
