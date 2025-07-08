/**
 * Site Overview tab component for displaying comprehensive site information.
 * Provides an overview of the entire site including all monitors, general statistics,
 * and site-level actions.
 */

import { FiSettings } from "react-icons/fi";
import { MdDomain, MdMonitorHeart, MdSpeed, MdOutlineFactCheck } from "react-icons/md";

import {
    ThemedText,
    ThemedButton,
    ThemedBadge,
    ThemedCard,
    StatusIndicator,
    ThemedProgress,
    useTheme,
    useAvailabilityColors,
} from "../../../theme";
import { Site, Monitor } from "../../../types";
import { getSiteDisplayStatus } from "../../../utils/siteStatus";
import { formatResponseTime, formatDuration } from "../../../utils/time";

/**
 * Props for the SiteOverviewTab component
 */
interface SiteOverviewTabProperties {
    /** The site object to display overview for */
    readonly site: Site;
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
    /** Total number of checks across all monitors */
    readonly totalChecks: number;
    /** Total uptime percentage across all monitors */
    readonly uptime: number;
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
export function SiteOverviewTab({
    avgResponseTime,
    handleRemoveSite,
    handleStartSiteMonitoring,
    handleStopSiteMonitoring,
    isLoading,
    site,
    totalChecks,
    uptime,
}: SiteOverviewTabProperties) {
    const { getAvailabilityColor, getAvailabilityVariant } = useAvailabilityColors();
    const { currentTheme } = useTheme();

    // Calculate site-level statistics
    const siteDisplayStatus = getSiteDisplayStatus(site);
    const allMonitorsRunning =
        site.monitors.length > 0 && site.monitors.every((monitor) => monitor.monitoring === true);
    const runningMonitors = site.monitors.filter((monitor) => monitor.monitoring === true);

    /**
     * Get status variant for theming based on uptime percentage
     */
    const getUptimeVariant = (percentage: number): "success" | "warning" | "error" => {
        const variant = getAvailabilityVariant(percentage);
        return variant === "danger" ? "error" : variant;
    };

    /**
     * Get status text for monitor
     */
    const getMonitorStatusText = (monitor: Monitor) => {
        if (monitor.monitoring) {
            return "Running";
        }
        return "Stopped";
    };

    /**
     * Get monitor badge variant
     */
    const getMonitorBadgeVariant = (monitor: Monitor): "success" | "warning" | "error" => {
        return monitor.monitoring ? "success" : "warning";
    };

    // Icon colors configuration
    const getIconColors = () => {
        const availabilityColor = getAvailabilityColor(uptime);
        const responseColor = getResponseTimeColor(avgResponseTime);
        // Use getColor to safely access theme colors with proper validation
        const siteStatusColor = (() => {
            switch (siteDisplayStatus) {
                case "up": {
                    return currentTheme.colors.status.up;
                }
                case "down": {
                    return currentTheme.colors.status.down;
                }
                case "pending": {
                    return currentTheme.colors.status.pending;
                }
                case "paused": {
                    return currentTheme.colors.status.paused;
                }
                case "mixed": {
                    return currentTheme.colors.status.mixed;
                }
                case "unknown": {
                    return currentTheme.colors.status.unknown;
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

    /**
     * Get response time color based on value
     */
    const getResponseTimeColor = (responseTime: number): string => {
        if (responseTime <= 200) {
            return currentTheme.colors.success;
        }
        if (responseTime <= 1000) {
            return currentTheme.colors.warning;
        }
        return currentTheme.colors.error;
    };

    /**
     * Get response time text color for styling
     */
    const getResponseTimeTextColor = (responseTime: number): string => {
        if (responseTime <= 200) {
            return "text-green-600 dark:text-green-400";
        }
        if (responseTime <= 1000) {
            return "text-yellow-600 dark:text-yellow-400";
        }
        return "text-red-600 dark:text-red-400";
    };

    const iconColors = getIconColors();
    const uptimeVariant = getUptimeVariant(uptime);

    return (
        <div data-testid="site-overview-tab" className="space-y-6">
            {/* Site Overview Metrics */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <ThemedCard
                    icon={<MdDomain />}
                    iconColor={iconColors.site}
                    title="Site Status"
                    hoverable
                    className="flex flex-col items-center justify-center text-center"
                >
                    <StatusIndicator status={siteDisplayStatus} size="lg" showText />
                </ThemedCard>

                <ThemedCard
                    icon={<MdMonitorHeart />}
                    iconColor={iconColors.monitors}
                    title="Monitors"
                    hoverable
                    className="flex flex-col items-center justify-center space-y-1 text-center"
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
                    icon={<MdOutlineFactCheck />}
                    iconColor={iconColors.uptime}
                    title="Overall Uptime"
                    hoverable
                    className="flex flex-col items-center justify-center text-center"
                >
                    <ThemedProgress
                        value={uptime}
                        variant={uptimeVariant}
                        showLabel
                        className="flex flex-col items-center"
                    />
                    <ThemedBadge variant={uptimeVariant} size="sm" className="mt-2">
                        {uptime.toFixed(2)}%
                    </ThemedBadge>
                </ThemedCard>

                <ThemedCard
                    icon={<MdSpeed />}
                    iconColor={iconColors.response}
                    title="Avg Response"
                    hoverable
                    className="flex flex-col items-center justify-center space-y-1 text-center"
                >
                    <div className="flex flex-col items-center">
                        <ThemedText size="xl" weight="bold" className={getResponseTimeTextColor(avgResponseTime)}>
                            {formatResponseTime(avgResponseTime)}
                        </ThemedText>
                        <ThemedText size="xs" variant="secondary">
                            {totalChecks} checks
                        </ThemedText>
                    </div>
                </ThemedCard>
            </div>

            {/* Site Information */}
            <ThemedCard icon={<MdDomain color={iconColors.site} />} title="Site Information">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <ThemedText size="xl" weight="bold" variant="primary" className="text-center">
                            {site.name}
                        </ThemedText>
                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                            <ThemedText variant="secondary">
                                <strong>ID:</strong> {site.identifier}
                            </ThemedText>
                            <ThemedText variant="secondary">
                                <strong>Name:</strong> {site.name ?? "Unnamed Site"}
                            </ThemedText>
                            <ThemedText variant="secondary">
                                <strong>Monitors:</strong> {site.monitors.length}
                            </ThemedText>
                        </div>
                    </div>
                </div>
            </ThemedCard>

            {/* Monitor Details */}
            <ThemedCard icon={<MdMonitorHeart color={iconColors.monitors} />} title="Monitor Details">
                <div className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <ThemedText size="lg" weight="semibold" variant="primary">
                            Individual Monitors
                        </ThemedText>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            <ThemedText variant="secondary">
                                <strong>Total:</strong> {site.monitors.length}
                            </ThemedText>
                            <ThemedText variant="secondary">
                                <strong>Running:</strong> {runningMonitors.length}
                            </ThemedText>
                            <ThemedText variant="secondary">
                                <strong>Stopped:</strong> {site.monitors.length - runningMonitors.length}
                            </ThemedText>
                        </div>
                    </div>

                    {site.monitors.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {site.monitors.map((monitor) => (
                                <div
                                    key={monitor.id}
                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg dark:border-gray-700"
                                >
                                    <div className="flex flex-col">
                                        <ThemedText weight="medium">{monitor.type.toUpperCase()} Monitor</ThemedText>
                                        <ThemedText size="sm" variant="secondary">
                                            {monitor.url ??
                                                (monitor.host ? `${monitor.host}:${monitor.port}` : monitor.id)}
                                        </ThemedText>
                                        <ThemedText size="xs" variant="tertiary">
                                            Every {formatDuration(monitor.checkInterval ?? 30_000)}
                                        </ThemedText>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ThemedBadge variant={getMonitorBadgeVariant(monitor)} size="sm">
                                            {getMonitorStatusText(monitor)}
                                        </ThemedBadge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <ThemedText variant="secondary" className="py-8 text-center">
                            No monitors configured for this site.
                        </ThemedText>
                    )}
                </div>
            </ThemedCard>

            {/* Site Actions */}
            <ThemedCard icon={<FiSettings color={iconColors.actions} />} title="Site Actions">
                <div className="flex flex-wrap items-center gap-4">
                    {allMonitorsRunning ? (
                        <ThemedButton
                            variant="error"
                            size="sm"
                            onClick={handleStopSiteMonitoring}
                            disabled={isLoading}
                            className="flex items-center gap-1"
                        >
                            ⏹️ Stop All Monitoring
                        </ThemedButton>
                    ) : (
                        <ThemedButton
                            variant="success"
                            size="sm"
                            onClick={handleStartSiteMonitoring}
                            disabled={isLoading}
                            className="flex items-center gap-1"
                        >
                            ▶️ Start All Monitoring
                        </ThemedButton>
                    )}
                    <ThemedButton
                        variant="error"
                        size="sm"
                        onClick={handleRemoveSite}
                        disabled={isLoading}
                        className="flex items-center gap-1"
                    >
                        �️ Remove Site
                    </ThemedButton>
                </div>
            </ThemedCard>
        </div>
    );
}
