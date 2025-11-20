/**
 * Single row within the dashboard site table layout.
 */

import type { MonitorStatus, Site } from "@shared/types";

import {
    type CSSProperties,
    type KeyboardEvent,
    memo,
    type MouseEvent,
    type NamedExoticComponent,
    useCallback,
    useMemo,
} from "react";

import { useSite } from "../../../hooks/site/useSite";
import { ThemedText } from "../../../theme/components/ThemedText";
import { getMonitorRuntimeSummary } from "../../../utils/monitoring/monitorRuntime";
import { toSentenceCase } from "../../../utils/text/toSentenceCase";
import {
    MarqueeText,
    type MarqueeTextProperties,
} from "../../common/MarqueeText/MarqueeText";
import { StatusBadge } from "../../common/StatusBadge";
import { ActionButtonGroup } from "../SiteCard/components/ActionButtonGroup";
import { MonitorSelector } from "../SiteCard/components/MonitorSelector";

/**
 * Properties for {@link SiteTableRow}.
 */
export interface SiteTableRowProperties {
    /** Zero-based order used for staggered animations. */
    readonly rowOrder?: number;
    /** Optional visual variant for zebra striping. */
    readonly rowVariant?: "even" | "odd";
    /** Site to present in the table row. */
    readonly site: Site;
}

type SurfaceOrderStyle = CSSProperties & {
    "--surface-order"?: number;
};

/**
 * Table row displaying monitoring information for a single site.
 */
export const SiteTableRow: NamedExoticComponent<SiteTableRowProperties> = memo(
    function SiteTableRow({
        rowOrder,
        rowVariant,
        site,
    }: SiteTableRowProperties) {
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

        const marqueeDependencies = useMemo(
            () => [latestSite.name, site.identifier],
            [latestSite.name, site.identifier]
        );

        const marqueeTextProps = useMemo<
            NonNullable<MarqueeTextProperties["textProps"]>
        >(
            () => ({
                size: "md",
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

        const statusFormatter = useCallback(
            (label: string, monitorStatus: MonitorStatus) =>
                `${label}: ${toSentenceCase(monitorStatus)}`,
            []
        );

        const handleRowActivation = useCallback(
            (event: MouseEvent<HTMLTableRowElement>) => {
                const { target } = event;
                if (!(target instanceof HTMLElement)) {
                    return;
                }

                if (
                    target.closest(
                        "button, a, input, select, textarea, [data-prevent-row-activation]"
                    )
                ) {
                    return;
                }

                handleCardClick();
            },
            [handleCardClick]
        );

        const handleRowKeyDown = useCallback(
            (event: KeyboardEvent<HTMLTableRowElement>) => {
                if (event.key !== "Enter" && event.key !== " ") {
                    return;
                }

                const { target } = event;
                if (!(target instanceof HTMLElement)) {
                    return;
                }

                if (
                    target.closest(
                        "button, a, input, select, textarea, [data-prevent-row-activation]"
                    )
                ) {
                    return;
                }

                event.preventDefault();
                handleCardClick();
            },
            [handleCardClick]
        );

        const rowClassName = [
            "site-table__row",
            "site-table__grid-layout",
            rowVariant ? `site-table__row--${rowVariant}` : "",
        ]
            .filter(Boolean)
            .join(" ");
        const rowStyle = useMemo<SurfaceOrderStyle | undefined>(
            () =>
                rowOrder === undefined
                    ? undefined
                    : { "--surface-order": rowOrder },
            [rowOrder]
        );

        return (
            <tr
                aria-label={`Open details for ${latestSite.name}`}
                className={rowClassName}
                data-site-identifier={latestSite.identifier}
                onClick={handleRowActivation}
                onKeyDown={handleRowKeyDown}
                style={rowStyle}
                tabIndex={0}
            >
                <td className="site-table__cell site-table__cell--site site-table__site">
                    <button
                        className="site-table__site-trigger"
                        onClick={handleCardClick}
                        type="button"
                    >
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
                        <ThemedText size="xs" variant="tertiary">
                            {site.identifier}
                        </ThemedText>
                        <span
                            aria-hidden="true"
                            className="site-table__row-hint"
                        >
                            View details
                        </span>
                    </button>
                </td>
                <td className="site-table__cell site-table__cell--monitor">
                    <MonitorSelector
                        className="site-table__monitor-selector"
                        monitors={latestSite.monitors}
                        onChange={handleMonitorIdChange}
                        selectedMonitorId={selectedMonitorId}
                    />
                </td>
                <td className="site-table__cell site-table__cell--status">
                    <StatusBadge
                        className="truncate-flex-row site-table__status-badge"
                        formatter={statusFormatter}
                        label="Status"
                        showIcon
                        size="xs"
                        status={status}
                    />
                </td>
                <td className="site-table__cell site-table__cell--uptime">
                    <ThemedText size="sm">{uptime}%</ThemedText>
                </td>
                <td className="site-table__cell site-table__cell--response">
                    <ThemedText size="sm">
                        {responseTime ? `${responseTime} ms` : "—"}
                    </ThemedText>
                </td>
                <td className="site-table__cell site-table__cell--running">
                    <ThemedText size="sm">
                        {runningMonitors}/{totalMonitors}
                    </ThemedText>
                </td>
                <td className="site-table__cell site-table__cell--end site-table__cell--controls">
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
