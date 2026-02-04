/**
 * Analytics tab component providing comprehensive monitoring statistics and
 * visualizations. Displays advanced metrics, charts, and performance analysis
 * for site monitoring.
 */

import type { MonitorType } from "@shared/types";
import type { ChartOptions } from "chart.js";
import type { JSX } from "react/jsx-runtime";

import { useCallback, useMemo } from "react";

import type { ChartTimeRange } from "../../../constants";
import type { DowntimePeriod } from "../../../hooks/site/useSiteAnalytics";
import type {
    ResponseTimeChartData,
    StatusBarChartData,
    UptimeChartData,
} from "../../../services/chartConfig";
import type { AnalyticsIconColors } from "./analytics/AnalyticsKeyMetricsGrid";

import { logger } from "../../../services/logger";
import { ThemedCard } from "../../../theme/components/ThemedCard";
import { ThemedText } from "../../../theme/components/ThemedText";
import { useAvailabilityColors, useTheme } from "../../../theme/useTheme";
import { parseUptimeValue } from "../../../utils/monitoring/dataValidation";
import { ConditionalResponseTime } from "../../common/MonitorUiComponents";
import { AnalyticsChartsGrid } from "./analytics/AnalyticsChartsGrid";
import { AnalyticsKeyMetricsGrid } from "./analytics/AnalyticsKeyMetricsGrid";
import { AnalyticsTimeRangeSelectorCard } from "./analytics/AnalyticsTimeRangeSelectorCard";
import { ResponseTimeAnalysisCard } from "./analytics/ResponseTimeAnalysisCard";

// NOTE: MTTR/incidents coloring was extracted into ResponseTimeAnalysisCard.

/**
 * Props for the AnalyticsTab component. Contains comprehensive metrics, chart
 * data, and formatting functions.
 *
 * @public
 */
export interface AnalyticsTabProperties {
    /** Average response time across all checks */
    readonly avgResponseTime: number;
    /** Chart.js data configuration for bar chart */
    readonly barChartData: StatusBarChartData;
    /** Chart.js options configuration for bar chart */
    readonly barChartOptions: ChartOptions<"bar">;
    /** Chart.js options configuration for doughnut chart */
    readonly doughnutOptions: ChartOptions<"doughnut">;
    /** Number of failed checks */
    readonly downCount: number;
    /** Array of downtime periods with durations */
    readonly downtimePeriods: DowntimePeriod[];
    /** Function to format duration values */
    readonly formatDuration: (ms: number) => string;
    /** Function to format response time values */
    readonly formatResponseTime: (time: number) => string;
    /** Function to get description based on availability percentage */
    readonly getAvailabilityDescription: (percentage: number) => string;
    /** Chart.js data configuration for line chart */
    readonly lineChartData: ResponseTimeChartData;
    /** Chart.js options configuration for line chart */
    readonly lineChartOptions: ChartOptions<"line">;
    /** Type of monitor being analyzed */
    readonly monitorType: MonitorType;
    /** Mean time to recovery in milliseconds */
    readonly mttr: number;
    /** 50th percentile response time */
    readonly p50: number;
    /** 95th percentile response time */
    readonly p95: number;
    /** 99th percentile response time */
    readonly p99: number;
    /** Function to toggle advanced metrics visibility */
    readonly setShowAdvancedMetrics: (show: boolean) => void;
    /** Function to set the chart time range */
    readonly setSiteDetailsChartTimeRange: (range: ChartTimeRange) => void;
    /** Whether advanced metrics are currently shown */
    readonly showAdvancedMetrics: boolean;
    /** Current chart time range selection */
    readonly siteDetailsChartTimeRange: ChartTimeRange;
    /** Total number of checks performed */
    readonly totalChecks: number;
    /** Total downtime in milliseconds */
    readonly totalDowntime: number;
    /** Number of successful checks */
    readonly upCount: number;
    /** Uptime percentage as string */
    readonly uptime: string;
    /** Chart.js data configuration for uptime chart */
    readonly uptimeChartData: UptimeChartData;
}

/**
 * Analytics tab component displaying comprehensive monitoring analytics and
 * visualizations.
 *
 * Features:
 *
 * - Multiple chart types (line, bar, doughnut) for different metrics
 * - Key performance indicators (uptime, response time, availability)
 * - Advanced metrics (percentiles, MTTR, downtime analysis)
 * - Interactive charts with time range filtering
 * - Downtime period analysis
 * - Export capabilities for chart data
 *
 * @param props - Component props containing metrics and chart configurations.
 *
 * @returns JSX element displaying analytics interface.
 *
 * @public
 */
export const AnalyticsTab = ({
    avgResponseTime,
    barChartData,
    barChartOptions,
    doughnutOptions,
    downCount,
    downtimePeriods,
    formatDuration,
    formatResponseTime,
    getAvailabilityDescription,
    lineChartData,
    lineChartOptions,
    monitorType,
    mttr,
    p50,
    p95,
    p99,
    setShowAdvancedMetrics,
    setSiteDetailsChartTimeRange,
    showAdvancedMetrics,
    siteDetailsChartTimeRange,
    totalChecks,
    totalDowntime,
    upCount,
    uptime,
    uptimeChartData,
}: AnalyticsTabProperties): JSX.Element => {
    const {
        getAvailabilityColor: getColor,
        getAvailabilityVariant: getVariant,
    } = useAvailabilityColors();
    const { currentTheme } = useTheme();

    // Function to get response time color based on performance
    const getResponseTimeColor = useCallback(
        (responseTime: number): string => {
            if (responseTime <= 100) {
                return currentTheme.colors.success;
            } // Green for excellent (Γëñ100ms)
            if (responseTime <= 500) {
                return currentTheme.colors.warning;
            } // Yellow for good (Γëñ500ms)
            return currentTheme.colors.error; // Red for poor (>500ms)
        },
        [
            currentTheme.colors.error,
            currentTheme.colors.success,
            currentTheme.colors.warning,
        ]
    );

    // Parse uptime value once with validation
    const uptimeValue = parseUptimeValue(uptime);

    // Error-safe wrapper functions to handle formatter errors gracefully
    const safeDurationFormat = useCallback(
        (ms: number): string => {
            try {
                return formatDuration(ms);
            } catch (error) {
                logger.error("Error formatting duration", error);
                return `${Math.round(ms / 1000)}s`; // Fallback format
            }
        },
        [formatDuration]
    );

    const safeResponseTimeFormat = useCallback(
        (time: number): string => {
            try {
                return formatResponseTime(time);
            } catch (error) {
                logger.error("Error formatting response time", error);
                return `${time}ms`; // Fallback format
            }
        },
        [formatResponseTime]
    );

    const safeAvailabilityDescription = useCallback(
        (percentage: number): string => {
            try {
                return getAvailabilityDescription(percentage);
            } catch (error) {
                logger.error("Error getting availability description", error);
                if (percentage >= 99) return "Good";
                if (percentage >= 95) return "Fair";
                return "Poor"; // Fallback descriptions
            }
        },
        [getAvailabilityDescription]
    );

    const iconColors = useMemo<AnalyticsIconColors>(() => {
        const availabilityColor = getColor(uptimeValue);
        const responseTimeColor = getResponseTimeColor(avgResponseTime);

        return {
            analytics: currentTheme.colors.primary[500],
            charts: currentTheme.colors.primary[600],
            downtime: currentTheme.colors.error,
            performance: responseTimeColor,
            uptime: availabilityColor,
        };
    }, [
        avgResponseTime,
        currentTheme,
        getColor,
        getResponseTimeColor,
        uptimeValue,
    ]);
    const variant = getVariant(uptimeValue);
    const progressVariant = variant === "danger" ? "error" : variant;

    const handleSelectTimeRange = useCallback(
        (range: ChartTimeRange): void => {
            const previousRange = siteDetailsChartTimeRange;
            logger.user.action("Chart time range changed", {
                monitorType,
                newRange: range,
                previousRange,
            });
            setSiteDetailsChartTimeRange(range);
        },
        [
            monitorType,
            setSiteDetailsChartTimeRange,
            siteDetailsChartTimeRange,
        ]
    );

    const handleAdvancedMetricsToggle = useCallback(() => {
        const previousValue = showAdvancedMetrics;
        const newValue = !showAdvancedMetrics;
        logger.user.action("Advanced metrics toggle", {
            monitorType,
            newValue,
            previousValue,
        });
        setShowAdvancedMetrics(newValue);
    }, [
        monitorType,
        setShowAdvancedMetrics,
        showAdvancedMetrics,
    ]);

    return (
        <div className="space-y-6" data-testid="analytics-tab">
            {totalChecks === 0 ? (
                <ThemedCard title="No analytics yet" variant="secondary">
                    <ThemedText size="sm" variant="secondary">
                        Run a check (or wait for scheduled checks) to populate
                        uptime and response-time charts.
                    </ThemedText>
                </ThemedCard>
            ) : null}

            <AnalyticsTimeRangeSelectorCard
                onSelectRange={handleSelectTimeRange}
                selectedRange={siteDetailsChartTimeRange}
            />

            <AnalyticsKeyMetricsGrid
                avgResponseTime={avgResponseTime}
                downCount={downCount}
                downtimeIncidentCount={downtimePeriods.length}
                formatAvailabilityDescription={safeAvailabilityDescription}
                formatDuration={safeDurationFormat}
                formatResponseTime={safeResponseTimeFormat}
                iconColors={iconColors}
                monitorType={monitorType}
                progressVariant={progressVariant}
                totalChecks={totalChecks}
                totalDowntime={totalDowntime}
                upCount={upCount}
                uptime={uptime}
                uptimeValue={uptimeValue}
            />

            <ConditionalResponseTime monitorType={monitorType}>
                <ResponseTimeAnalysisCard
                    currentTheme={currentTheme}
                    formatDuration={safeDurationFormat}
                    formatResponseTime={safeResponseTimeFormat}
                    getResponseTimeColor={getResponseTimeColor}
                    incidentCount={downtimePeriods.length}
                    mttr={mttr}
                    onToggleAdvancedMetrics={handleAdvancedMetricsToggle}
                    p50={p50}
                    p95={p95}
                    p99={p99}
                    showAdvancedMetrics={showAdvancedMetrics}
                />
            </ConditionalResponseTime>

            <AnalyticsChartsGrid
                barChartData={barChartData}
                barChartOptions={barChartOptions}
                doughnutOptions={doughnutOptions}
                iconColors={iconColors}
                lineChartData={lineChartData}
                lineChartOptions={lineChartOptions}
                monitorType={monitorType}
                uptimeChartData={uptimeChartData}
            />
        </div>
    );
};
