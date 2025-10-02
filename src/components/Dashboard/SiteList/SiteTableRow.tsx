/**
 * Single row within the dashboard site table layout.
 */

import type { MonitorStatus, Site } from "@shared/types";

import { memo, type NamedExoticComponent, useCallback, useMemo } from "react";

import { useSite } from "../../../hooks/site/useSite";
import { ThemedText } from "../../../theme/components/ThemedText";
import { StatusBadge } from "../../common/StatusBadge";
import { ActionButtonGroup } from "../SiteCard/components/ActionButtonGroup";
import { MonitorSelector } from "../SiteCard/components/MonitorSelector";

/**
 * Properties for {@link SiteTableRow}.
 */
export interface SiteTableRowProperties {
    /** Site to present in the table row. */
    readonly site: Site;
}

const toSentenceCase = (value: string): string => {
    if (!value) {
        return "";
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
};

/**
 * Table row displaying monitoring information for a single site.
 */
export const SiteTableRow: NamedExoticComponent<SiteTableRowProperties> = memo(
    function SiteTableRow({ site }: SiteTableRowProperties) {
        const {
            handleCardClick,
            handleCheckNow,
            handleMonitorIdChange,
            handleStartMonitoring,
            handleStartSiteMonitoring,
            handleStopMonitoring,
            handleStopSiteMonitoring,
            isLoading,
            isMonitoring,
            latestSite,
            monitor,
            responseTime,
            selectedMonitorId,
            status,
            uptime,
        } = useSite(site);

        const runningMonitors = useMemo(
            () =>
                latestSite.monitors.filter(
                    (siteMonitor) => siteMonitor.monitoring
                ).length,
            [latestSite.monitors]
        );

        const allMonitorsRunning = useMemo(() => {
            if (latestSite.monitors.length === 0) {
                return false;
            }
            return latestSite.monitors.every(
                (siteMonitor) => siteMonitor.monitoring
            );
        }, [latestSite.monitors]);

        const statusFormatter = useCallback(
            (label: string, monitorStatus: MonitorStatus) =>
                `${label}: ${toSentenceCase(monitorStatus)}`,
            []
        );

        return (
            <tr className="site-table__row">
                <th className="site-table__site" scope="row">
                    <button
                        className="site-table__site-trigger"
                        onClick={handleCardClick}
                        type="button"
                    >
                        <ThemedText size="md" weight="semibold">
                            {latestSite.name}
                        </ThemedText>
                        <ThemedText size="xs" variant="tertiary">
                            {site.identifier}
                        </ThemedText>
                    </button>
                </th>
                <td>
                    <MonitorSelector
                        className="site-table__monitor-selector"
                        fluid={false}
                        monitors={latestSite.monitors}
                        onChange={handleMonitorIdChange}
                        selectedMonitorId={selectedMonitorId}
                    />
                </td>
                <td>
                    <StatusBadge
                        formatter={statusFormatter}
                        label="Status"
                        showIcon
                        size="xs"
                        status={status}
                    />
                </td>
                <td>
                    <ThemedText size="sm">{uptime}%</ThemedText>
                </td>
                <td>
                    <ThemedText size="sm">
                        {responseTime ? `${responseTime} ms` : "—"}
                    </ThemedText>
                </td>
                <td>
                    <ThemedText size="sm">
                        {runningMonitors}/{latestSite.monitors.length}
                    </ThemedText>
                </td>
                <td className="site-table__actions">
                    <ActionButtonGroup
                        allMonitorsRunning={allMonitorsRunning}
                        buttonSize="xs"
                        disabled={!monitor}
                        isLoading={isLoading}
                        isMonitoring={isMonitoring}
                        onCheckNow={handleCheckNow}
                        onStartMonitoring={handleStartMonitoring}
                        onStartSiteMonitoring={handleStartSiteMonitoring}
                        onStopMonitoring={handleStopMonitoring}
                        onStopSiteMonitoring={handleStopSiteMonitoring}
                    />
                </td>
            </tr>
        );
    }
);

SiteTableRow.displayName = "SiteTableRow";
