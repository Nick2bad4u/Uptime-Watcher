/**
 * Overview tab component for site details page. Displays key metrics,
 * statistics, and actions for a monitored site.
 */

import type { Monitor } from "@shared/types";
import type { ChangeEvent } from "react";
import type { JSX } from "react/jsx-runtime";

import { ensureError } from "@shared/utils/errorHandling";
import { useCallback, useMemo } from "react";

import { CHECK_INTERVALS, TIMEOUT_CONSTRAINTS } from "../../../constants";
import { logger } from "../../../services/logger";
import { StatusIndicator } from "../../../theme/components/StatusIndicator";
import { ThemedBadge } from "../../../theme/components/ThemedBadge";
import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedCard } from "../../../theme/components/ThemedCard";
import { ThemedInput } from "../../../theme/components/ThemedInput";
import { ThemedProgress } from "../../../theme/components/ThemedProgress";
import { ThemedSelect } from "../../../theme/components/ThemedSelect";
import { ThemedText } from "../../../theme/components/ThemedText";
import { useAvailabilityColors, useTheme } from "../../../theme/useTheme";
import { AppIcons } from "../../../utils/icons";
import { parseUptimeValue } from "../../../utils/monitoring/dataValidation";
import { getIntervalLabel } from "../../../utils/time";
import { useResponseTimeColorFromThemeColors } from "../utils/responseTimeColors";

const MonitorIcon = AppIcons.metrics.monitor;
const TimeIcon = AppIcons.metrics.time;
const PerformanceIcon = AppIcons.metrics.performance;
const ResponseIcon = AppIcons.metrics.response;
const ListIcon = AppIcons.layout.listAlt;

const RefreshIcon = AppIcons.actions.refresh;
const CheckNowIcon = AppIcons.actions.checkNow;
const RemoveIcon = AppIcons.actions.remove;
const SaveIcon = AppIcons.actions.save;

const formatIntervalOption = (
    intervalOption: number | { label?: string; value: number }
): { label: string; value: number } => {
    const value =
        typeof intervalOption === "number"
            ? intervalOption
            : intervalOption.value;

    try {
        const label = getIntervalLabel(intervalOption);
        return { label, value };
    } catch (error) {
        const ensuredError = ensureError(error);
        logger.warn("Failed to format interval option", ensuredError, {
            intervalOption,
        });
        const fallbackLabel = getIntervalLabel(value);
        return { label: fallbackLabel, value };
    }
};

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
    readonly handleIntervalChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    /** Handler for removing the monitor */
    readonly handleRemoveMonitor: () => Promise<void>;
    /** Handler for saving interval changes */
    readonly handleSaveInterval: () => Promise<void>;
    /** Handler for saving timeout changes */
    readonly handleSaveTimeout: () => Promise<void>;
    /** Handler for monitor timeout changes */
    readonly handleTimeoutChange: (e: ChangeEvent<HTMLInputElement>) => void;
    /** Whether the check interval has been changed */
    readonly intervalChanged: boolean;
    /** Whether any async operation is in progress */
    readonly isLoading: boolean;
    /** Local state value for check interval in milliseconds */
    readonly localCheckIntervalMs: number;
    /** Local state value for timeout in seconds */
    readonly localTimeoutSeconds: number;
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
 *
 * - Uptime percentage with visual progress indicator
 * - Response time statistics (average, fastest, slowest)
 * - Total checks counter
 * - Monitor status indicator
 * - Site removal action
 *
 * @param props - Component props containing metrics and handlers.
 *
 * @returns JSX element displaying overview information.
 *
 * @public
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
    localCheckIntervalMs,
    localTimeoutSeconds,
    onCheckNow,
    selectedMonitor,
    slowestResponse,
    timeoutChanged,
    totalChecks,
    uptime,
}: OverviewTabProperties): JSX.Element => {
    const { getAvailabilityColor, getAvailabilityVariant } =
        useAvailabilityColors();
    const { currentTheme } = useTheme();

    // Map availability variant to progress/badge variant
    const mapAvailabilityToBadgeVariant = (
        availability: number
    ): "error" | "success" | "warning" => {
        const variant = getAvailabilityVariant(availability);
        if (variant === "danger") return "error";
        return variant; // "success" | "warning"
    };

    const uptimeValue = parseUptimeValue(uptime);
    const progressVariant = mapAvailabilityToBadgeVariant(uptimeValue);

    /**
     * Get response time color based on value
     */
    const getResponseTimeColor = useResponseTimeColorFromThemeColors(
        currentTheme.colors
    );

    // Icon colors configuration
    const getIconColors = (): {
        checks: string;
        fastest: string;
        quickAction: string;
        response: string;
        slowest: string;
        status: string;
        uptime: string;
    } => {
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

    const iconColors = getIconColors();

    // Click handlers to avoid inline functions in JSX
    const handleSaveIntervalClick = useCallback(() => {
        void handleSaveInterval();
    }, [handleSaveInterval]);

    const handleSaveTimeoutClick = useCallback(() => {
        void handleSaveTimeout();
    }, [handleSaveTimeout]);

    const handleRemoveClick = useCallback(() => {
        logger.user.action("Monitor removal button clicked from overview tab", {
            monitorId: selectedMonitor.id,
            monitorType: selectedMonitor.type,
            monitorUrl: selectedMonitor.url,
        });
        void handleRemoveMonitor();
    }, [
        handleRemoveMonitor,
        selectedMonitor.id,
        selectedMonitor.type,
        selectedMonitor.url,
    ]);

    const checkIcon = useMemo(() => <MonitorIcon />, []);
    const timeIcon = useMemo(() => <TimeIcon />, []);
    const speedIcon = useMemo(() => <ResponseIcon />, []);
    const responseTimeStyle = useMemo(
        () => ({ color: getResponseTimeColor(avgResponseTime) }),
        [avgResponseTime, getResponseTimeColor]
    );
    const listIcon = useMemo(() => <ListIcon />, []);
    const performanceIcon = useMemo(() => <PerformanceIcon />, []);
    const boltIcon = useMemo(() => <PerformanceIcon />, []);
    const accessTimeIcon = useMemo(() => <TimeIcon />, []);
    const quickActionIcon = useMemo(() => <RefreshIcon />, []);
    const checkNowIcon = useMemo(() => <CheckNowIcon className="size-4" />, []);
    const trashIcon = useMemo(() => <RemoveIcon />, []);
    const saveIcon = useMemo(() => <SaveIcon className="size-4" />, []);
    return (
        <div className="space-y-6" data-testid="overview-tab">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <ThemedCard
                    className="flex flex-col items-center text-center"
                    hoverable
                    icon={checkIcon}
                    iconColor={iconColors.status}
                    title="Status"
                >
                    <StatusIndicator
                        showText
                        size="lg"
                        status={selectedMonitor.status}
                    />
                </ThemedCard>

                <ThemedCard
                    className="flex flex-col items-center text-center"
                    hoverable
                    icon={timeIcon}
                    iconColor={iconColors.uptime}
                    title="Uptime"
                >
                    <ThemedProgress
                        className="flex flex-col items-center"
                        showLabel={false}
                        value={uptimeValue}
                        variant={progressVariant}
                    />
                    <ThemedBadge
                        className="mt-2"
                        size="sm"
                        variant={progressVariant}
                    >
                        {uptime}%
                    </ThemedBadge>
                </ThemedCard>

                <ThemedCard
                    className="flex flex-col items-center text-center"
                    hoverable
                    icon={speedIcon}
                    iconColor={iconColors.response}
                    title="Response Time"
                >
                    <ThemedText
                        size="xl"
                        style={responseTimeStyle}
                        weight="bold"
                    >
                        {formatResponseTime(avgResponseTime)}
                    </ThemedText>
                </ThemedCard>

                <ThemedCard
                    className="flex flex-col items-center text-center"
                    hoverable
                    icon={listIcon}
                    iconColor={iconColors.checks}
                    title="Total Checks"
                >
                    <ThemedText size="xl" weight="bold">
                        {totalChecks}
                    </ThemedText>
                </ThemedCard>

                <ThemedCard
                    className="flex flex-col items-center text-center"
                    hoverable
                    icon={checkIcon}
                    iconColor={iconColors.status}
                    title="Monitor ID"
                >
                    <ThemedText
                        className="max-w-full font-mono break-all"
                        size="xs"
                        variant="secondary"
                    >
                        {selectedMonitor.id}
                    </ThemedText>
                </ThemedCard>
            </div>

            {/* Performance Metrics */}
            <ThemedCard
                icon={performanceIcon}
                iconColor={iconColors.fastest}
                title="Performance Overview"
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <ThemedText size="sm" variant="secondary">
                            Fastest Response
                        </ThemedText>
                        <ThemedBadge
                            icon={boltIcon}
                            iconColor={iconColors.fastest}
                            size="sm"
                            variant="success"
                        >
                            {formatResponseTime(fastestResponse)}
                        </ThemedBadge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <ThemedText size="sm" variant="secondary">
                            Slowest Response
                        </ThemedText>
                        <ThemedBadge
                            icon={accessTimeIcon}
                            iconColor={iconColors.slowest}
                            size="sm"
                            variant="warning"
                        >
                            {formatResponseTime(slowestResponse)}
                        </ThemedBadge>
                    </div>
                </div>
            </ThemedCard>

            {/* Quick Actions */}
            <ThemedCard icon={quickActionIcon} title="Quick Actions">
                <div className="grid gap-4 md:grid-cols-3 md:items-end">
                    {/* Interval Control */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <TimeIcon className="size-4 opacity-80" />
                            <ThemedText size="sm" variant="secondary">
                                Interval
                            </ThemedText>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemedSelect
                                className="min-w-0 flex-1"
                                disabled={isLoading}
                                onChange={handleIntervalChange}
                                value={localCheckIntervalMs}
                            >
                                {CHECK_INTERVALS.map((intervalOption) => {
                                    const { label, value } =
                                        formatIntervalOption(intervalOption);
                                    return (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    );
                                })}
                            </ThemedSelect>
                            {intervalChanged ? (
                                <ThemedButton
                                    disabled={isLoading}
                                    icon={saveIcon}
                                    onClick={handleSaveIntervalClick}
                                    size="xs"
                                    variant="primary"
                                >
                                    Save
                                </ThemedButton>
                            ) : null}
                        </div>
                    </div>

                    {/* Timeout Control */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <TimeIcon className="size-4 opacity-80" />
                            <ThemedText size="sm" variant="secondary">
                                Timeout
                            </ThemedText>
                        </div>

                        <div className="flex items-center gap-2">
                            <ThemedInput
                                aria-label="Monitor timeout in seconds"
                                className="w-24 text-xs"
                                disabled={isLoading}
                                max={TIMEOUT_CONSTRAINTS.MAX}
                                min={TIMEOUT_CONSTRAINTS.MIN}
                                onChange={handleTimeoutChange}
                                step={TIMEOUT_CONSTRAINTS.STEP}
                                type="number"
                                value={localTimeoutSeconds}
                            />
                            <ThemedText size="xs" variant="secondary">
                                s
                            </ThemedText>
                            {timeoutChanged ? (
                                <ThemedButton
                                    disabled={isLoading}
                                    icon={saveIcon}
                                    onClick={handleSaveTimeoutClick}
                                    size="xs"
                                    variant="primary"
                                >
                                    Save
                                </ThemedButton>
                            ) : null}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 md:items-end">
                        <ThemedButton
                            aria-label="Check Now"
                            disabled={isLoading}
                            icon={checkNowIcon}
                            onClick={onCheckNow}
                            size="sm"
                            variant="secondary"
                        >
                            Check Now
                        </ThemedButton>

                        <ThemedButton
                            disabled={isLoading}
                            icon={trashIcon}
                            onClick={handleRemoveClick}
                            size="sm"
                            variant="error"
                        >
                            Remove Monitor
                        </ThemedButton>
                    </div>
                </div>
            </ThemedCard>
        </div>
    );
};
