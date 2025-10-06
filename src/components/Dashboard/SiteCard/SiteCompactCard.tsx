/**
 * Compact site card variant presenting essential monitoring information.
 *
 * @remarks
 * Designed for dense layouts where the full site card would be overwhelming.
 * This variant keeps critical controls visible while reducing vertical space.
 */

import type { MonitorStatus, Site } from "@shared/types";

import { memo, type NamedExoticComponent, useMemo } from "react";

import { useSite } from "../../../hooks/site/useSite";
import { useOverflowMarquee } from "../../../hooks/ui/useOverflowMarquee";
import { StatusIndicator } from "../../../theme/components/StatusIndicator";
import { ThemedBox } from "../../../theme/components/ThemedBox";
import { ThemedText } from "../../../theme/components/ThemedText";
import {
    getMonitorDisplayIdentifier,
    getMonitorTypeDisplayLabel,
} from "../../../utils/fallbacks";
import { ActionButtonGroup } from "./components/ActionButtonGroup";
import { MonitorSelector } from "./components/MonitorSelector";

/**
 * Properties for {@link SiteCompactCard}.
 */
export interface SiteCompactCardProperties {
    /** Site entity to render. */
    readonly site: Site;
}

const toSentenceCase = (value: string): string => {
    if (!value) {
        return "";
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
};

/**
 * Condensed site card used for the "Mini" layout option.
 */
export const SiteCompactCard: NamedExoticComponent<SiteCompactCardProperties> =
    memo(function SiteCompactCard({ site }: SiteCompactCardProperties) {
        const {
            checkCount,
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

        const marqueeDependencies = useMemo(
            () => [latestSite.name, site.identifier],
            [latestSite.name, site.identifier]
        );

        const marqueeOptions = useMemo(
            () => ({ dependencies: marqueeDependencies }),
            [marqueeDependencies]
        );

        const {
            containerRef: nameContainerRef,
            isOverflowing: isNameOverflowing,
        } = useOverflowMarquee<HTMLDivElement>(marqueeOptions);

        const allMonitorsRunning = useMemo(() => {
            if (latestSite.monitors.length === 0) {
                return false;
            }
            return latestSite.monitors.every(
                (siteMonitor) => siteMonitor.monitoring
            );
        }, [latestSite.monitors]);

        const runningMonitors = useMemo(
            () =>
                latestSite.monitors.filter(
                    (siteMonitor) => siteMonitor.monitoring
                ).length,
            [latestSite.monitors]
        );

        const monitorSummary = useMemo(() => {
            if (!monitor) {
                return "No Monitor Selected";
            }

            const identifier = getMonitorDisplayIdentifier(monitor, monitor.id);
            const monitorTypeLabel = getMonitorTypeDisplayLabel(monitor.type);

            if (identifier && identifier !== monitor.id) {
                return `${monitorTypeLabel} • ${identifier}`;
            }

            return monitorTypeLabel;
        }, [monitor]);

        const monitorStatus: MonitorStatus = monitor?.status ?? status;
        const monitorStatusLabel = monitor
            ? getMonitorTypeDisplayLabel(monitor.type)
            : "Monitor";

        const compactStatusEntries = useMemo(
            () => [
                {
                    id: "site",
                    label: "Site",
                    status,
                    value: toSentenceCase(status),
                },
                {
                    id: "monitor",
                    label: monitorStatusLabel,
                    status: monitorStatus,
                    value: toSentenceCase(monitorStatus),
                },
            ],
            [
                monitorStatus,
                monitorStatusLabel,
                status,
            ]
        );

        const uptimeDisplay =
            typeof uptime === "number" && Number.isFinite(uptime)
                ? `${uptime.toFixed(1)}%`
                : "—";
        const responseDisplay =
            responseTime === undefined ? "—" : `${responseTime} ms`;
        const checksDisplay = checkCount.toLocaleString();
        const runningSummary = `${runningMonitors}/${latestSite.monitors.length}`;

        return (
            <ThemedBox
                aria-label={`View details for ${latestSite.name}`}
                className="site-card site-card--compact"
                data-testid="site-card"
                onClick={handleCardClick}
                padding="md"
                rounded="lg"
                shadow="sm"
                surface="elevated"
            >
                <div className="site-card__compact-header">
                    <div className="site-card__compact-title">
                        <div
                            className={`site-card__compact-name ${
                                isNameOverflowing
                                    ? "site-card__compact-name--marquee"
                                    : ""
                            }`}
                            ref={nameContainerRef}
                        >
                            <div className="site-card__compact-name-track">
                                <ThemedText
                                    className="site-card__compact-name-segment"
                                    size="lg"
                                    weight="semibold"
                                >
                                    {latestSite.name}
                                </ThemedText>
                                {isNameOverflowing ? (
                                    <ThemedText
                                        aria-hidden="true"
                                        className="site-card__compact-name-segment site-card__compact-name-segment--clone"
                                        size="lg"
                                        weight="semibold"
                                    >
                                        {latestSite.name}
                                    </ThemedText>
                                ) : null}
                            </div>
                        </div>
                        <ThemedText
                            className="site-card__compact-subtitle"
                            size="xs"
                            variant="secondary"
                        >
                            <span
                                className="site-card__compact-subtitle-text"
                                title={monitorSummary}
                            >
                                {monitorSummary}
                            </span>
                        </ThemedText>
                    </div>
                    <div className="site-card__compact-status">
                        {compactStatusEntries.map(
                            ({ id, label, status: statusValue, value }) => (
                                <div
                                    className="site-card__compact-status-item"
                                    key={id}
                                >
                                    <StatusIndicator
                                        size="sm"
                                        status={statusValue}
                                    />
                                    <div className="site-card__compact-status-meta">
                                        <span className="site-card__compact-status-label">
                                            {label}
                                        </span>
                                        <span className="site-card__compact-status-value">
                                            {value}
                                        </span>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>

                <div className="site-card__compact-metrics">
                    <div className="site-card__compact-metric">
                        <span className="site-card__compact-metric-label">
                            Uptime
                        </span>
                        <span className="site-card__compact-metric-value">
                            {uptimeDisplay}
                        </span>
                    </div>
                    <div className="site-card__compact-metric">
                        <span className="site-card__compact-metric-label">
                            Resp.
                        </span>
                        <span className="site-card__compact-metric-value">
                            {responseDisplay}
                        </span>
                    </div>
                    <div className="site-card__compact-metric">
                        <span className="site-card__compact-metric-label">
                            Checks
                        </span>
                        <span className="site-card__compact-metric-value">
                            {checksDisplay}
                        </span>
                    </div>
                    <div className="site-card__compact-metric">
                        <span className="site-card__compact-metric-label">
                            Running
                        </span>
                        <span className="site-card__compact-metric-value">
                            {runningSummary}
                        </span>
                    </div>
                </div>

                <div className="site-card__compact-controls">
                    <MonitorSelector
                        className="site-card__compact-selector"
                        monitors={latestSite.monitors}
                        onChange={handleMonitorIdChange}
                        selectedMonitorId={selectedMonitorId}
                    />

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
                </div>

                <div className="site-card__compact-footer">
                    <ThemedText size="xs" variant="tertiary">
                        Tap for detailed analytics • {toSentenceCase(status)}
                    </ThemedText>
                </div>
            </ThemedBox>
        );
    });
