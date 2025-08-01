/**
 * Overview tab component for site details page.
 * Displays key metrics, statistics, and actions for a monitored site.
 */

import { FaListOl } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { MdAccessTime, MdBolt, MdOutlineFactCheck, MdSpeed } from "react-icons/md";

import { CHECK_INTERVALS, TIMEOUT_CONSTRAINTS } from "../../../constants";
import logger from "../../../services/logger";
import {
    StatusIndicator,
    ThemedBadge,
    ThemedButton,
    ThemedCard,
    ThemedInput,
    ThemedProgress,
    ThemedSelect,
    ThemedText,
} from "../../../theme/components";
import { useAvailabilityColors, useTheme } from "../../../theme/useTheme";
import { Monitor } from "../../../types";
import { parseUptimeValue } from "../../../utils/monitoring/dataValidation";
import { getIntervalLabel } from "../../../utils/time";

/**
 * Props for the OverviewTab component.
 *
 * @public
 */
export interface OverviewTabProperties {
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
    const mapAvailabilityToBadgeVariant = (availability: number): "error" | "success" | "warning" => {
        const variant = getAvailabilityVariant(availability);
        return variant === "danger" ? "error" : variant;
    };

    const uptimeValue = parseUptimeValue(uptime);
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

    const iconColors = getIconColors();

    return (
        <div className="space-y-6" data-testid="overview-tab">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <ThemedCard
                    className="flex flex-col items-center text-center"
                    hoverable
                    icon={<MdOutlineFactCheck />}
                    iconColor={iconColors.status}
                    title="Status"
                >
                    <StatusIndicator showText size="lg" status={selectedMonitor.status} />
                </ThemedCard>

                <ThemedCard
                    className="flex flex-col items-center text-center"
                    hoverable
                    icon={<MdAccessTime />}
                    iconColor={iconColors.uptime}
                    title="Uptime"
                >
                    <ThemedProgress
                        className="flex flex-col items-center"
                        showLabel
                        value={uptimeValue}
                        variant={progressVariant}
                    />
                    <ThemedBadge className="mt-2" size="sm" variant={progressVariant}>
                        {uptime}%
                    </ThemedBadge>
                </ThemedCard>

                <ThemedCard
                    className="flex flex-col items-center text-center"
                    hoverable
                    icon={<MdSpeed />}
                    iconColor={iconColors.response}
                    title="Response Time"
                >
                    <ThemedText size="xl" style={{ color: getResponseTimeColor(avgResponseTime) }} weight="bold">
                        {formatResponseTime(avgResponseTime)}
                    </ThemedText>
                </ThemedCard>

                <ThemedCard
                    className="flex flex-col items-center text-center"
                    hoverable
                    icon={<FaListOl />}
                    iconColor={iconColors.checks}
                    title="Total Checks"
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
                                className="ml-4"
                                icon={<MdBolt />}
                                iconColor={iconColors.fastest}
                                variant="success"
                            >
                                {formatResponseTime(fastestResponse)}
                            </ThemedBadge>
                        </div>
                        <div className="text-center">
                            <ThemedText size="sm" variant="secondary">
                                Slowest Response
                            </ThemedText>
                            <ThemedBadge
                                className="ml-4"
                                icon={<MdAccessTime />}
                                iconColor={iconColors.slowest}
                                variant="warning"
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
                        <ThemedSelect disabled={isLoading} onChange={handleIntervalChange} value={localCheckInterval}>
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
                            <ThemedButton
                                disabled={isLoading}
                                onClick={() => void handleSaveInterval()}
                                size="xs"
                                variant="primary"
                            >
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
                            aria-label="Monitor timeout in seconds"
                            className="w-16 text-xs"
                            disabled={isLoading}
                            max={TIMEOUT_CONSTRAINTS.MAX}
                            min={TIMEOUT_CONSTRAINTS.MIN}
                            onChange={handleTimeoutChange}
                            step={TIMEOUT_CONSTRAINTS.STEP}
                            type="number"
                            value={localTimeout}
                        />
                        <ThemedText size="xs" variant="secondary">
                            s
                        </ThemedText>
                        {timeoutChanged && (
                            <ThemedButton
                                disabled={isLoading}
                                onClick={() => void handleSaveTimeout()}
                                size="xs"
                                variant="primary"
                            >
                                Save
                            </ThemedButton>
                        )}
                    </div>

                    {/* Check Now Button */}
                    <ThemedButton
                        aria-label="Check Now"
                        className="flex items-center gap-1"
                        disabled={isLoading}
                        onClick={onCheckNow}
                        size="sm"
                        variant="secondary"
                    >
                        <span>🔄</span>
                        <span className="text-xs">Check Now</span>
                    </ThemedButton>

                    {/* Remove Monitor Button */}
                    <ThemedButton
                        disabled={isLoading}
                        icon={<FiTrash2 />}
                        onClick={() => {
                            logger.user.action("Monitor removal button clicked from overview tab", {
                                monitorId: selectedMonitor.id,
                                monitorType: selectedMonitor.type,
                                monitorUrl: selectedMonitor.url ?? selectedMonitor.host,
                            });
                            void handleRemoveMonitor();
                        }}
                        size="sm"
                        variant="error"
                    >
                        Remove Monitor
                    </ThemedButton>
                </div>
            </ThemedCard>
        </div>
    );
};
