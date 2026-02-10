/**
 * SiteDetails tab content rendering.
 *
 * @remarks
 * Extracted from {@link src/components/SiteDetails/SiteDetails#SiteDetails} to keep the parent component focused on
 * modal layout, navigation, and orchestration.
 */

import type { Monitor, Site } from "@shared/types";
import type { ChartOptions } from "chart.js";
import type { ComponentProps, JSX } from "react";

import type { SiteAnalytics } from "../../hooks/site/useSiteAnalytics";
import type {
    ResponseTimeChartData,
    StatusBarChartData,
    UptimeChartData,
} from "../../services/chartConfig";
import type { SiteDetailsTab } from "../../stores/ui/types";

import { parseUptimeValue } from "../../utils/monitoring/dataValidation";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { OverviewTab } from "./tabs/OverviewTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { SiteOverviewTab } from "./tabs/SiteOverviewTab";

type AnalyticsTabProperties = ComponentProps<typeof AnalyticsTab>;
type HistoryTabProperties = ComponentProps<typeof HistoryTab>;
type OverviewTabProperties = ComponentProps<typeof OverviewTab>;
type SettingsTabProperties = ComponentProps<typeof SettingsTab>;
type SiteOverviewTabProperties = ComponentProps<typeof SiteOverviewTab>;

/**
 * Props for {@link SiteDetailsTabContent}.
 *
 * @public
 */
export interface SiteDetailsTabContentProperties {
    readonly activeSiteDetailsTab: SiteDetailsTab;
    readonly analytics: SiteAnalytics;
    readonly barChartData: StatusBarChartData;
    readonly barChartOptions: ChartOptions<"bar">;
    readonly doughnutChartData: UptimeChartData;
    readonly doughnutOptions: ChartOptions<"doughnut">;
    readonly formatDuration: (ms: number) => string;
    readonly formatFullTimestamp: HistoryTabProperties["formatFullTimestamp"];
    readonly formatResponseTime: (time: number) => string;
    readonly getAvailabilityDescription: (percentage: number) => string;
    readonly handleCheckNow: OverviewTabProperties["onCheckNow"];
    readonly handleIntervalChange: OverviewTabProperties["handleIntervalChange"];
    readonly handleRemoveMonitor: OverviewTabProperties["handleRemoveMonitor"];
    readonly handleRemoveSite: SettingsTabProperties["handleRemoveSite"];
    readonly handleRetryAttemptsChange: SettingsTabProperties["handleRetryAttemptsChange"];
    readonly handleSaveInterval: OverviewTabProperties["handleSaveInterval"];
    readonly handleSaveIntervalClick: SettingsTabProperties["handleSaveInterval"];
    readonly handleSaveName: SettingsTabProperties["handleSaveName"];
    readonly handleSaveRetryAttempts: SettingsTabProperties["handleSaveRetryAttempts"];
    readonly handleSaveTimeout: SettingsTabProperties["handleSaveTimeout"];
    readonly handleStartSiteMonitoring: SiteOverviewTabProperties["handleStartSiteMonitoring"];
    readonly handleStopSiteMonitoring: SiteOverviewTabProperties["handleStopSiteMonitoring"];
    readonly handleTimeoutChange: OverviewTabProperties["handleTimeoutChange"];
    readonly hasUnsavedChanges: SettingsTabProperties["hasUnsavedChanges"];
    readonly intervalChanged: SettingsTabProperties["intervalChanged"];
    readonly isLoading: SettingsTabProperties["isLoading"];
    readonly lineChartData: ResponseTimeChartData;
    readonly lineChartOptions: ChartOptions<"line">;
    readonly localCheckIntervalMs: SettingsTabProperties["localCheckIntervalMs"];
    readonly localName: SettingsTabProperties["localName"];
    readonly localRetryAttempts: SettingsTabProperties["localRetryAttempts"];
    readonly localTimeoutSeconds: SettingsTabProperties["localTimeoutSeconds"];
    readonly retryAttemptsChanged: SettingsTabProperties["retryAttemptsChanged"];
    readonly selectedMonitor: Monitor | undefined;
    readonly selectedMonitorId: string;
    readonly setLocalName: SettingsTabProperties["setLocalName"];
    readonly setShowAdvancedMetrics: AnalyticsTabProperties["setShowAdvancedMetrics"];
    readonly setSiteDetailsChartTimeRange: AnalyticsTabProperties["setSiteDetailsChartTimeRange"];
    readonly showAdvancedMetrics: AnalyticsTabProperties["showAdvancedMetrics"];
    readonly site: Site;
    readonly siteDetailsChartTimeRange: AnalyticsTabProperties["siteDetailsChartTimeRange"];
    readonly timeoutChanged: SettingsTabProperties["timeoutChanged"];
}

/**
 * Renders the content of the currently selected SiteDetails tab.
 *
 * @public
 */
export const SiteDetailsTabContent = ({
    activeSiteDetailsTab,
    analytics,
    barChartData,
    barChartOptions,
    doughnutChartData,
    doughnutOptions,
    formatDuration,
    formatFullTimestamp,
    formatResponseTime,
    getAvailabilityDescription,
    handleCheckNow,
    handleIntervalChange,
    handleRemoveMonitor,
    handleRemoveSite,
    handleRetryAttemptsChange,
    handleSaveInterval,
    handleSaveIntervalClick,
    handleSaveName,
    handleSaveRetryAttempts,
    handleSaveTimeout,
    handleStartSiteMonitoring,
    handleStopSiteMonitoring,
    handleTimeoutChange,
    hasUnsavedChanges,
    intervalChanged,
    isLoading,
    lineChartData,
    lineChartOptions,
    localCheckIntervalMs,
    localName,
    localRetryAttempts,
    localTimeoutSeconds,
    retryAttemptsChanged,
    selectedMonitor,
    selectedMonitorId,
    setLocalName,
    setShowAdvancedMetrics,
    setSiteDetailsChartTimeRange,
    showAdvancedMetrics,
    site,
    siteDetailsChartTimeRange,
    timeoutChanged,
}: SiteDetailsTabContentProperties): JSX.Element => {
    const monitorOverviewTab =
        activeSiteDetailsTab === "monitor-overview" && selectedMonitor ? (
            <OverviewTab
                avgResponseTime={analytics.avgResponseTime}
                fastestResponse={analytics.fastestResponse}
                formatResponseTime={formatResponseTime}
                handleIntervalChange={handleIntervalChange}
                handleRemoveMonitor={handleRemoveMonitor}
                handleSaveInterval={handleSaveInterval}
                handleSaveTimeout={handleSaveTimeout}
                handleTimeoutChange={handleTimeoutChange}
                intervalChanged={intervalChanged}
                isLoading={isLoading}
                localCheckIntervalMs={localCheckIntervalMs}
                localTimeoutSeconds={localTimeoutSeconds}
                onCheckNow={handleCheckNow}
                selectedMonitor={selectedMonitor}
                slowestResponse={analytics.slowestResponse}
                timeoutChanged={timeoutChanged}
                totalChecks={analytics.totalChecks}
                uptime={analytics.uptime}
            />
        ) : null;

    const analyticsTab =
        activeSiteDetailsTab === `${selectedMonitorId}-analytics` &&
        selectedMonitor ? (
            <AnalyticsTab
                avgResponseTime={analytics.avgResponseTime}
                barChartData={barChartData}
                barChartOptions={barChartOptions}
                doughnutOptions={doughnutOptions}
                downCount={analytics.downCount}
                downtimePeriods={analytics.downtimePeriods}
                formatDuration={formatDuration}
                formatResponseTime={formatResponseTime}
                getAvailabilityDescription={getAvailabilityDescription}
                lineChartData={lineChartData}
                lineChartOptions={lineChartOptions}
                monitorType={selectedMonitor.type}
                mttr={analytics.mttr}
                p50={analytics.percentileMetrics.p50}
                p95={analytics.percentileMetrics.p95}
                p99={analytics.percentileMetrics.p99}
                setShowAdvancedMetrics={setShowAdvancedMetrics}
                setSiteDetailsChartTimeRange={setSiteDetailsChartTimeRange}
                showAdvancedMetrics={showAdvancedMetrics}
                siteDetailsChartTimeRange={siteDetailsChartTimeRange}
                totalChecks={analytics.totalChecks}
                totalDowntime={analytics.totalDowntime}
                upCount={analytics.upCount}
                uptime={analytics.uptime}
                uptimeChartData={doughnutChartData}
            />
        ) : null;

    const historyTab =
        activeSiteDetailsTab === "history" && selectedMonitor ? (
            <HistoryTab
                formatFullTimestamp={formatFullTimestamp}
                formatResponseTime={formatResponseTime}
                selectedMonitor={selectedMonitor}
            />
        ) : null;

    const settingsTab =
        activeSiteDetailsTab === "settings" && selectedMonitor ? (
            <SettingsTab
                currentSite={site}
                handleIntervalChange={handleIntervalChange}
                handleRemoveSite={handleRemoveSite}
                handleRetryAttemptsChange={handleRetryAttemptsChange}
                handleSaveInterval={handleSaveIntervalClick}
                handleSaveName={handleSaveName}
                handleSaveRetryAttempts={handleSaveRetryAttempts}
                handleSaveTimeout={handleSaveTimeout}
                handleTimeoutChange={handleTimeoutChange}
                hasUnsavedChanges={hasUnsavedChanges}
                intervalChanged={intervalChanged}
                isLoading={isLoading}
                localCheckIntervalMs={localCheckIntervalMs}
                localName={localName}
                localRetryAttempts={localRetryAttempts}
                localTimeoutSeconds={localTimeoutSeconds}
                retryAttemptsChanged={retryAttemptsChanged}
                selectedMonitor={selectedMonitor}
                setLocalName={setLocalName}
                timeoutChanged={timeoutChanged}
            />
        ) : null;

    return (
        <>
            {activeSiteDetailsTab === "site-overview" ? (
                <SiteOverviewTab
                    avgResponseTime={analytics.avgResponseTime}
                    handleRemoveSite={handleRemoveSite}
                    handleStartSiteMonitoring={handleStartSiteMonitoring}
                    handleStopSiteMonitoring={handleStopSiteMonitoring}
                    isLoading={isLoading}
                    site={site}
                    totalChecks={analytics.totalChecks}
                    uptime={parseUptimeValue(analytics.uptime)}
                />
            ) : null}

            {monitorOverviewTab}
            {analyticsTab}
            {historyTab}
            {settingsTab}
        </>
    );
};
