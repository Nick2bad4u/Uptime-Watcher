/**
 * Site Overview tab component for displaying comprehensive site information.
 * Provides an overview of the entire site including all monitors, general
 * statistics, and site-level actions.
 */

import type { Monitor, Site } from "@shared/types";
import type { JSX } from "react/jsx-runtime";

import { ensureError } from "@shared/utils/errorHandling";
import { getSiteDisplayStatus } from "@shared/utils/siteStatus";
import { useCallback, useMemo } from "react";

import { logger } from "../../../services/logger";
import { SystemService } from "../../../services/SystemService";
import { StatusIndicator } from "../../../theme/components/StatusIndicator";
import { ThemedBadge } from "../../../theme/components/ThemedBadge";
import { ThemedBox } from "../../../theme/components/ThemedBox";
import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedCard } from "../../../theme/components/ThemedCard";
import { ThemedIconButton } from "../../../theme/components/ThemedIconButton";
import { ThemedProgress } from "../../../theme/components/ThemedProgress";
import { ThemedText } from "../../../theme/components/ThemedText";
import { useAvailabilityColors, useTheme } from "../../../theme/useTheme";
import { AppIcons } from "../../../utils/icons";
import { formatDuration, formatResponseTime } from "../../../utils/time";
import { useResponseTimeColorFromThemeColors } from "../utils/responseTimeColors";

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
 * Get display text for monitor based on type and available properties
 */
function getMonitorDisplayText(monitor: Monitor): string {
    if (monitor.url) {
        return monitor.url;
    }
    if (monitor.host) {
        return monitor.port ? `${monitor.host}:${monitor.port}` : monitor.host;
    }
    return monitor.id;
}

/**
 * Site Overview tab component that displays comprehensive site information.
 *
 * Features:
 *
 * - Site metadata (name, creation date, identifier)
 * - Monitor summary with individual statuses
 * - Aggregate statistics across all monitors
 * - Site-level monitoring controls
 * - Quick actions for site management
 *
 * @param props - Component props.
 *
 * @returns JSX element containing the site overview.
 *
 * @public
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
        if (variant === "danger") {
            return "error";
        }
        return variant; // "success" | "warning"
    };

    /**
     * Get response time color based on value
     */
    const getResponseTimeColor = useResponseTimeColorFromThemeColors(
        currentTheme.colors
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
                case "degraded": {
                    return currentTheme.colors.status.degraded;
                }
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

    const siteIdentifier = site.identifier;
    const siteName = site.name;

    const siteIdentifierDisplay = useMemo(() => {
        const id = siteIdentifier;
        if (id.length <= 18) return id;
        return `${id.slice(0, 8)}…${id.slice(-4)}`;
    }, [siteIdentifier]);

    const siteNameDisplay = useMemo(() => {
        const name = siteName;
        if (name.length <= 40) return name;
        return `${name.slice(0, 28)}…${name.slice(-8)}`;
    }, [siteName]);

    const ActionsIcon = AppIcons.settings.gear;
    const FactCheckIcon = AppIcons.metrics.uptime;
    const ListIcon = AppIcons.layout.listAlt;
    const LinkIcon = AppIcons.ui.link;
    const DatabaseIcon = AppIcons.ui.database;
    const CopyIcon = AppIcons.actions.copy;
    const MonitorIcon = AppIcons.ui.monitor;
    const SiteIcon = AppIcons.ui.site;
    const SpeedIcon = AppIcons.metrics.response;
    const StartIcon = AppIcons.actions.play;
    const StopIcon = AppIcons.actions.stop;
    const TrashIcon = AppIcons.actions.remove;
    const uptimeVariant = getUptimeVariant(uptime);

    // Memoize the response time text style to avoid inline object creation
    const responseTimeTextStyle = useMemo(
        () => ({ color: getResponseTimeColor(avgResponseTime) }),
        [avgResponseTime, getResponseTimeColor]
    );

    // UseCallback handlers for jsx-no-bind compliance
    const handleStopSiteMonitoringClick = useCallback(() => {
        void handleStopSiteMonitoring();
    }, [handleStopSiteMonitoring]);

    const handleStartSiteMonitoringClick = useCallback(() => {
        void handleStartSiteMonitoring();
    }, [handleStartSiteMonitoring]);

    const handleRemoveSiteClick = useCallback(() => {
        void handleRemoveSite();
    }, [handleRemoveSite]);

    const handleCopySiteIdentifierClick = useCallback(() => {
        void (async (): Promise<void> => {
            try {
                await SystemService.writeClipboardText(siteIdentifier);
            } catch (error: unknown) {
                const ensuredError = ensureError(error);
                logger.warn("Failed to copy site identifier", ensuredError, {
                    siteIdentifier,
                });
            }
        })();
    }, [siteIdentifier]);

    const handleCopySiteNameClick = useCallback(() => {
        void (async (): Promise<void> => {
            try {
                await SystemService.writeClipboardText(siteName);
            } catch (error: unknown) {
                const ensuredError = ensureError(error);
                logger.warn("Failed to copy site name", ensuredError, {
                    siteName,
                });
            }
        })();
    }, [siteName]);

    const domainIcon = useMemo(() => <SiteIcon />, [SiteIcon]);
    const monitorHeartIcon = useMemo(() => <MonitorIcon />, [MonitorIcon]);
    const factCheckIcon = useMemo(() => <FactCheckIcon />, [FactCheckIcon]);
    const speedIcon = useMemo(() => <SpeedIcon />, [SpeedIcon]);
    const siteIcon = useMemo(
        () => <SiteIcon color={iconColors.site} />,
        [iconColors.site, SiteIcon]
    );
    const monitorsIcon = useMemo(
        () => <MonitorIcon color={iconColors.monitors} />,
        [iconColors.monitors, MonitorIcon]
    );
    const actionsIcon = useMemo(
        () => <ActionsIcon color={iconColors.actions} />,
        [ActionsIcon, iconColors.actions]
    );

    const copyIcon = useMemo(
        () => <CopyIcon className="size-4" />,
        [CopyIcon]
    );

    const siteNameIcon = useMemo(
        () => <SiteIcon className="size-5" />,
        [SiteIcon]
    );
    const siteIdIcon = useMemo(
        () => <DatabaseIcon className="size-4" />,
        [DatabaseIcon]
    );
    const siteLinkIcon = useMemo(
        () => <LinkIcon className="size-4" />,
        [LinkIcon]
    );
    const monitorsCountIcon = useMemo(
        () => <MonitorIcon className="size-4" />,
        [MonitorIcon]
    );
    const monitorsTotalIcon = useMemo(
        () => <ListIcon className="size-4" />,
        [ListIcon]
    );
    const monitorsRunningIcon = useMemo(
        () => <StartIcon className="size-4" />,
        [StartIcon]
    );
    const monitorsStoppedIcon = useMemo(
        () => <StopIcon className="size-4" />,
        [StopIcon]
    );

    const stopSiteMonitoringIcon = useMemo(
        () => <StopIcon className="size-4" />,
        [StopIcon]
    );
    const startSiteMonitoringIcon = useMemo(
        () => <StartIcon className="size-4" />,
        [StartIcon]
    );
    const removeSiteIcon = useMemo(
        () => <TrashIcon className="size-4" />,
        [TrashIcon]
    );
    return (
        <div className="space-y-6" data-testid="site-overview-tab">
            {/* Site Overview Metrics */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <ThemedCard
                    className="flex flex-col items-center justify-center text-center"
                    hoverable
                    icon={domainIcon}
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
                    icon={monitorHeartIcon}
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
                    icon={factCheckIcon}
                    iconColor={iconColors.uptime}
                    title="Overall Uptime"
                >
                    <ThemedProgress
                        className="flex flex-col items-center"
                        showLabel={false}
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
                    icon={speedIcon}
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
            <ThemedCard icon={siteIcon} title="Site Information">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span aria-hidden>{siteNameIcon}</span>
                            <ThemedText
                                className="truncate"
                                size="xl"
                                variant="primary"
                                weight="bold"
                            >
                                {site.name}
                            </ThemedText>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
                        <div className="flex items-center gap-1">
                            <ThemedBadge
                                icon={siteIdIcon}
                                size="sm"
                                variant="secondary"
                            >
                                <span title={site.identifier}>
                                    ID: {siteIdentifierDisplay}
                                </span>
                            </ThemedBadge>

                            <ThemedIconButton
                                aria-label="Copy site ID"
                                icon={copyIcon}
                                onClick={handleCopySiteIdentifierClick}
                                size="xs"
                                tooltip="Copy ID"
                            />
                        </div>

                        <div className="flex items-center gap-1">
                            <ThemedBadge
                                icon={siteLinkIcon}
                                size="sm"
                                variant="secondary"
                            >
                                <span title={site.name}>
                                    Name: {siteNameDisplay}
                                </span>
                            </ThemedBadge>

                            <ThemedIconButton
                                aria-label="Copy site name"
                                icon={copyIcon}
                                onClick={handleCopySiteNameClick}
                                size="xs"
                                tooltip="Copy name"
                            />
                        </div>

                        <ThemedBadge
                            icon={monitorsCountIcon}
                            size="sm"
                            variant="secondary"
                        >
                            Monitors: {site.monitors.length}
                        </ThemedBadge>
                    </div>
                </div>
            </ThemedCard>

            {/* Monitor Details */}
            <ThemedCard icon={monitorsIcon} title="Monitor Details">
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
                            <ThemedBadge
                                icon={monitorsTotalIcon}
                                size="sm"
                                variant="secondary"
                            >
                                Total: {site.monitors.length}
                            </ThemedBadge>

                            <ThemedBadge
                                icon={monitorsRunningIcon}
                                size="sm"
                                variant="secondary"
                            >
                                Running: {runningMonitors.length}
                            </ThemedBadge>

                            <ThemedBadge
                                icon={monitorsStoppedIcon}
                                size="sm"
                                variant="secondary"
                            >
                                Stopped:{" "}
                                {site.monitors.length - runningMonitors.length}
                            </ThemedBadge>
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
                                            {getMonitorDisplayText(monitor)}
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
            <ThemedCard icon={actionsIcon} title="Site Actions">
                <div className="flex flex-wrap items-center gap-4">
                    {allMonitorsRunning ? (
                        <ThemedButton
                            className="flex items-center gap-1"
                            disabled={isLoading}
                            icon={stopSiteMonitoringIcon}
                            onClick={handleStopSiteMonitoringClick}
                            size="sm"
                            variant="error"
                        >
                            Stop All Monitoring
                        </ThemedButton>
                    ) : (
                        <ThemedButton
                            className="flex items-center gap-1"
                            disabled={isLoading}
                            icon={startSiteMonitoringIcon}
                            onClick={handleStartSiteMonitoringClick}
                            size="sm"
                            variant="success"
                        >
                            Start All Monitoring
                        </ThemedButton>
                    )}

                    <ThemedButton
                        className="flex items-center gap-1"
                        disabled={isLoading}
                        icon={removeSiteIcon}
                        onClick={handleRemoveSiteClick}
                        size="sm"
                        variant="error"
                    >
                        Remove Site
                    </ThemedButton>
                </div>
            </ThemedCard>
        </div>
    );
};
