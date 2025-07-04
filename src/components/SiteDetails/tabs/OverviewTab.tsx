/**
 * Overview tab component for site details page.
 * Displays key metrics, statistics, and actions for a monitored site.
 */

import { FaListOl } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { MdAccessTime, MdBolt, MdSpeed, MdOutlineFactCheck } from "react-icons/md";

import logger from "../../../services/logger";
import {
    ThemedText,
    ThemedButton,
    StatusIndicator,
    ThemedCard,
    ThemedBadge,
    ThemedProgress,
} from "../../../theme/components";
import { useTheme, useAvailabilityColors } from "../../../theme/useTheme";
import { Monitor } from "../../../types";

/**
 * Props for the OverviewTab component.
 */
interface OverviewTabProps {
    /** Average response time across all checks */
    readonly avgResponseTime: number;
    /** Fastest recorded response time */
    readonly fastestResponse: number;
    /** Function to format response time for display */
    readonly formatResponseTime: (time: number) => string;
    /** Handler for removing the site */
    readonly handleRemoveSite: () => Promise<void>;
    /** Whether any async operation is in progress */
    readonly isLoading: boolean;
    /** Currently selected monitor */
    readonly selectedMonitor: Monitor;
    /** Slowest recorded response time */
    readonly slowestResponse: number;
    /** Total number of checks performed */
    readonly totalChecks: number;
    /** Uptime percentage as a string */
    readonly uptime: string;
}

/**
 * Overview tab component displaying site monitoring statistics and metrics.
 *
 * Features:
 * - Uptime percentage with visual progress indicator
 * - Response time statistics (average, fastest, slowest)
 * - Total checks counter
 * - Monitor status indicator
 * - Site removal action
 *
 * @param props - Component props containing metrics and handlers
 * @returns JSX element displaying overview information
 */
export function OverviewTab({
    avgResponseTime,
    fastestResponse,
    formatResponseTime,
    handleRemoveSite,
    isLoading,
    selectedMonitor,
    slowestResponse,
    totalChecks,
    uptime,
}: OverviewTabProps) {
    const { getAvailabilityColor, getAvailabilityVariant } = useAvailabilityColors();
    const { currentTheme } = useTheme();

    // Map availability variant to progress/badge variant
    const mapAvailabilityToBadgeVariant = (availability: number): "success" | "warning" | "error" => {
        const variant = getAvailabilityVariant(availability);
        return variant === "danger" ? "error" : variant;
    };

    const uptimeValue = parseFloat(uptime);
    const progressVariant = mapAvailabilityToBadgeVariant(uptimeValue);

    // Icon colors configuration
    const getIconColors = () => {
        const availabilityColor = getAvailabilityColor(uptimeValue);
        return {
            checks: currentTheme.colors.primary[500],
            fastest: currentTheme.colors.success,
            quickAction: currentTheme.colors.error,
            response: currentTheme.colors.warning,
            slowest: currentTheme.colors.warning,
            status: availabilityColor,
            uptime: availabilityColor,
        };
    };

    const iconColors = getIconColors();

    return (
        <div data-testid="overview-tab" className="space-y-6">
            {/* Overview Tab */}
            <ThemedText variant="primary" weight="bold">
                Overview Tab
            </ThemedText>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <ThemedCard
                    icon={<MdOutlineFactCheck />}
                    iconColor={iconColors.status}
                    title="Status"
                    hoverable
                    className="flex flex-col items-center text-center"
                >
                    <StatusIndicator status={selectedMonitor.status} size="lg" showText />
                </ThemedCard>

                <ThemedCard
                    icon={<MdAccessTime />}
                    iconColor={iconColors.uptime}
                    title="Uptime"
                    hoverable
                    className="flex flex-col items-center text-center"
                >
                    <ThemedProgress
                        value={uptimeValue}
                        variant={progressVariant}
                        showLabel
                        className="flex flex-col items-center"
                    />
                    <ThemedBadge variant={progressVariant} size="sm" className="mt-2">
                        {uptime}%
                    </ThemedBadge>
                </ThemedCard>

                <ThemedCard
                    icon={<MdSpeed />}
                    iconColor={iconColors.response}
                    title="Response Time"
                    hoverable
                    className="flex flex-col items-center text-center"
                >
                    <ThemedText size="xl" weight="bold">
                        {formatResponseTime(avgResponseTime)}
                    </ThemedText>
                </ThemedCard>

                <ThemedCard
                    icon={<FaListOl />}
                    iconColor={iconColors.checks}
                    title="Total Checks"
                    hoverable
                    className="flex flex-col items-center text-center"
                >
                    <ThemedText size="xl" weight="bold">
                        {totalChecks}
                    </ThemedText>
                </ThemedCard>
            </div>

            {/* Performance Metrics */}
            <ThemedCard icon={<MdBolt color={iconColors.fastest} />} title="Performance Overview">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <ThemedText size="sm" variant="secondary">
                            Fastest Response
                        </ThemedText>
                        <ThemedBadge
                            variant="success"
                            icon={<MdBolt />}
                            iconColor={iconColors.fastest}
                            className="ml-4"
                        >
                            {formatResponseTime(fastestResponse)}
                        </ThemedBadge>
                    </div>
                    <div>
                        <ThemedText size="sm" variant="secondary">
                            Slowest Response
                        </ThemedText>
                        <ThemedBadge
                            variant="warning"
                            icon={<MdAccessTime />}
                            iconColor={iconColors.slowest}
                            className="ml-4"
                        >
                            {formatResponseTime(slowestResponse)}
                        </ThemedBadge>
                    </div>
                </div>
            </ThemedCard>

            {/* Quick Actions */}
            <ThemedCard icon={<MdBolt color={iconColors.quickAction} />} title="Quick Actions">
                <div className="flex space-x-3">
                    <ThemedButton
                        variant="error"
                        size="sm"
                        onClick={() => {
                            logger.user.action("Site removal button clicked from overview tab", {
                                monitorType: selectedMonitor?.type,
                                siteId: selectedMonitor?.url ?? "unknown",
                            });
                            handleRemoveSite();
                        }}
                        disabled={isLoading}
                        icon={<FiTrash2 />}
                    >
                        Remove Site
                    </ThemedButton>
                </div>
            </ThemedCard>
        </div>
    );
}
