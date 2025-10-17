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
import { StatusIndicator } from "../../../theme/components/StatusIndicator";
import { ThemedBox } from "../../../theme/components/ThemedBox";
import { ThemedText } from "../../../theme/components/ThemedText";
import {
    getMonitorDisplayIdentifier,
    getMonitorTypeDisplayLabel,
} from "../../../utils/fallbacks";
import { getMonitorRuntimeSummary } from "../../../utils/monitoring/monitorRuntime";
import { toSentenceCase } from "../../../utils/text/toSentenceCase";
import {
    MarqueeText,
    type MarqueeTextProperties,
} from "../../common/MarqueeText/MarqueeText";
import { ActionButtonGroup } from "./components/ActionButtonGroup";
import { MonitorSelector } from "./components/MonitorSelector";
import "./SiteCompactCard.css";

/**
 * Properties for {@link SiteCompactCard}.
 */
export interface SiteCompactCardProperties {
    /** Site entity to render. */
    readonly site: Site;
}

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

        const marqueeTextProps = useMemo<
            NonNullable<MarqueeTextProperties["textProps"]>
        >(
            () => ({
                size: "lg",
                weight: "semibold",
            }),
            []
        );

        const {
            allRunning: allMonitorsRunning,
            runningCount: runningMonitors,
            totalCount: totalMonitors,
        } = useMemo(
            () => getMonitorRuntimeSummary(latestSite.monitors),
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
        const runningSummary = useMemo(
            () => `${runningMonitors}/${totalMonitors}`,
            [runningMonitors, totalMonitors]
        );

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
                        <MarqueeText
                            activeClassName="site-card__compact-name--marquee"
                            className="site-card__compact-name"
                            cloneClassName="site-card__compact-name-segment--clone"
                            dependencies={marqueeDependencies}
                            segmentClassName="site-card__compact-name-segment"
                            text={latestSite.name}
                            textProps={marqueeTextProps}
                            trackClassName="site-card__compact-name-track"
                        />
                        <ThemedText
                            className="site-card__compact-subtitle"
                            size="xs"
                            variant="secondary"
                        >
                            <span
                                className="site-card__compact-subtitle-url"
                                title={site.identifier}
                            >
                                {site.identifier}
                            </span>
                            <span
                                aria-hidden="true"
                                className="site-card__compact-subtitle-separator"
                            >
                                •
                            </span>
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

                    <div className="site-card__compact-actions">
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
                        <ThemedText
                            className="site-card__compact-hint"
                            size="xs"
                            variant="tertiary"
                        >
                            Tap for detailed analytics •{" "}
                            {toSentenceCase(status)}
                        </ThemedText>
                    </div>
                </div>
            </ThemedBox>
        );
    });
