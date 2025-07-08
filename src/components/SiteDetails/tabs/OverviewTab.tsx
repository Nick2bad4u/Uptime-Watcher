/**
 * Overview tab component for site details page.
 * Displays key metrics, statistics, and actions for a monitored site.
 */

import { FaListOl } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { MdAccessTime, MdBolt, MdSpeed, MdOutlineFactCheck } from "react-icons/md";

import { CHECK_INTERVALS, TIMEOUT_CONSTRAINTS } from "../../../constants";
import logger from "../../../services/logger";
import {
    ThemedText,
    ThemedButton,
    StatusIndicator,
    ThemedCard,
    ThemedBadge,
    ThemedProgress,
    ThemedSelect,
    ThemedInput,
} from "../../../theme/components";
import { useTheme, useAvailabilityColors } from "../../../theme/useTheme";
import { Monitor } from "../../../types";

/**
 * Helper function to format time duration into human readable format.
 * @param milliseconds - Time duration in milliseconds
 * @returns Formatted time string (e.g., "30s", "5m", "1h")
 */
const formatDuration = (milliseconds: number): string => {
    if (milliseconds < 1000) {
        return `${milliseconds}ms`;
    }
    if (milliseconds < 60_000) {
        return `${Math.round(milliseconds / 1000)}s`;
    }
    if (milliseconds < 3_600_000) {
        return `${Math.round(milliseconds / 60_000)}m`;
    }
    return `${Math.round(milliseconds / 3_600_000)}h`;
};

/**
 * Helper function to get display label for interval value.
 * @param interval - Interval configuration (number or object with value/label)
 * @returns Human readable label for the interval
 */
const getIntervalLabel = (interval: number | { value: number; label?: string }): string => {
    if (typeof interval === "number") {
        return formatDuration(interval);
    }

    if (interval.label) {
        return interval.label;
    }
    return formatDuration(interval.value);
};

/**
 * Props for the OverviewTab component.
 */
interface OverviewTabProperties {
    /** Average response time across all checks */
    readonly avgResponseTime: number;
    /** Fastest recorded response time */
    readonly fastestResponse: number;
    /** Function to format response time for display */
    readonly formatResponseTime: (time: number) => string;
    /** Handler for monitor check interval changes */
    readonly handleIntervalChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    /** Handler for removing the monitor */
    readonly handleRemoveMonitor: () => Promise<void>;
    /** Handler for saving interval changes */
    readonly handleSaveInterval: () => Promise<void>;
    /** Handler for saving timeout changes */
    readonly handleSaveTimeout: () => Promise<void>;
    /** Handler for monitor timeout changes */
    readonly handleTimeoutChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /** Whether the check interval has been changed */
    readonly intervalChanged: boolean;
    /** Whether any async operation is in progress */
    readonly isLoading: boolean;
    /** Local state value for check interval */
    readonly localCheckInterval: number;
    /** Local state value for timeout */
    readonly localTimeout: number;
    /** Handler for immediate check trigger */
    readonly onCheckNow: () => void;
    /** Currently selected monitor */
    readonly selectedMonitor: Monitor;
    /** Slowest recorded response time */
    readonly slowestResponse: number;
    /** Whether the timeout has been changed */
    readonly timeoutChanged: boolean;
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
export const OverviewTab = ({
    avgResponseTime,
    fastestResponse,
    formatResponseTime,
    handleIntervalChange,
    handleRemoveMonitor,
    handleSaveInterval,
    handleSaveTimeout,
    handleTimeoutChange,
    intervalChanged,
    isLoading,
    localCheckInterval,
    localTimeout,
    onCheckNow,
    selectedMonitor,
    slowestResponse,
    timeoutChanged,
    totalChecks,
    uptime,
}: OverviewTabProperties) => {
    const { getAvailabilityColor, getAvailabilityVariant } = useAvailabilityColors();
    const { currentTheme } = useTheme();

    // Map availability variant to progress/badge variant
    const mapAvailabilityToBadgeVariant = (availability: number): "success" | "warning" | "error" => {
        const variant = getAvailabilityVariant(availability);
        return variant === "danger" ? "error" : variant;
    };

    const uptimeValue = Number.parseFloat(uptime);
    const progressVariant = mapAvailabilityToBadgeVariant(uptimeValue);

    // Icon colors configuration
    const getIconColors = () => {
        const availabilityColor = getAvailabilityColor(uptimeValue);
        const responseColor = getResponseTimeColor(avgResponseTime);
        return {
            checks: currentTheme.colors.primary[500],
            fastest: currentTheme.colors.success,
            quickAction: currentTheme.colors.error,
            response: responseColor,
            slowest: currentTheme.colors.warning,
            status: availabilityColor,
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

    return (
        <div data-testid="overview-tab" className="space-y-6">
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
                    <ThemedText size="xl" weight="bold" className={getResponseTimeTextColor(avgResponseTime)}>
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
                <div className="flex justify-center">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="text-center">
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
                        <div className="text-center">
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
                </div>
            </ThemedCard>

            {/* Quick Actions */}
            <ThemedCard icon={<MdBolt color={iconColors.quickAction} />} title="Quick Actions">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Interval Control */}
                    <div className="flex items-center gap-2">
                        <ThemedText size="sm" variant="secondary">
                            Interval:
                        </ThemedText>
                        <ThemedSelect value={localCheckInterval} onChange={handleIntervalChange} disabled={isLoading}>
                            {CHECK_INTERVALS.map((interval) => {
                                const value = typeof interval === "number" ? interval : interval.value;
                                const label = getIntervalLabel(interval);
                                return (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                );
                            })}
                        </ThemedSelect>
                        {intervalChanged && (
                            <ThemedButton variant="primary" size="xs" onClick={handleSaveInterval} disabled={isLoading}>
                                Save
                            </ThemedButton>
                        )}
                    </div>

                    {/* Timeout Control */}
                    <div className="flex items-center gap-2">
                        <ThemedText size="sm" variant="secondary">
                            Timeout:
                        </ThemedText>
                        <ThemedInput
                            type="number"
                            min={TIMEOUT_CONSTRAINTS.MIN}
                            max={TIMEOUT_CONSTRAINTS.MAX}
                            step={TIMEOUT_CONSTRAINTS.STEP}
                            value={localTimeout}
                            onChange={handleTimeoutChange}
                            disabled={isLoading}
                            aria-label="Monitor timeout in seconds"
                            className="w-16 text-xs"
                        />
                        <ThemedText size="xs" variant="secondary">
                            s
                        </ThemedText>
                        {timeoutChanged && (
                            <ThemedButton variant="primary" size="xs" onClick={handleSaveTimeout} disabled={isLoading}>
                                Save
                            </ThemedButton>
                        )}
                    </div>

                    {/* Check Now Button */}
                    <ThemedButton
                        variant="secondary"
                        size="sm"
                        onClick={onCheckNow}
                        aria-label="Check Now"
                        disabled={isLoading}
                        className="flex items-center gap-1"
                    >
                        <span>🔄</span>
                        <span className="text-xs">Check Now</span>
                    </ThemedButton>

                    {/* Remove Monitor Button */}
                    <ThemedButton
                        variant="error"
                        size="sm"
                        onClick={() => {
                            logger.user.action("Monitor removal button clicked from overview tab", {
                                monitorId: selectedMonitor?.id,
                                monitorType: selectedMonitor?.type,
                                monitorUrl: selectedMonitor?.url ?? selectedMonitor?.host,
                            });
                            handleRemoveMonitor();
                        }}
                        disabled={isLoading}
                        icon={<FiTrash2 />}
                    >
                        Remove Monitor
                    </ThemedButton>
                </div>
            </ThemedCard>
        </div>
    );
};
