/**
 * Site details header component
 *
 * Displays the site title, URL, status indicator, and screenshot thumbnail in a
 * visually appealing header with gradient background and accent styling.
 */

import type { Monitor, Site } from "@shared/types";
import type { MouseEvent, NamedExoticComponent } from "react";
import type { JSX } from "react/jsx-runtime";

import { isValidUrl } from "@shared/validation/validatorUtils";
import { memo, useCallback, useMemo } from "react";
import { MdExpandLess, MdExpandMore } from "react-icons/md";

import { useThemeStyles } from "../../hooks/useThemeStyles";
import { useUIStore } from "../../stores/ui/useUiStore";
import { StatusIndicator } from "../../theme/components/StatusIndicator";
import { ThemedText } from "../../theme/components/ThemedText";
import { getMonitorTypeDisplayLabel } from "../../utils/fallbacks";
import { AppIcons } from "../../utils/icons";
import { formatFullTimestamp, formatRelativeTimestamp } from "../../utils/time";
import { Tooltip } from "../common/Tooltip/Tooltip";
import { MonitoringStatusDisplay } from "./MonitoringStatusDisplay";
import { ScreenshotThumbnail } from "./ScreenshotThumbnail";

/**
 * Props for the SiteDetailsHeader component
 *
 * @public
 */
export interface SiteDetailsHeaderProperties {
    /** Whether the header is collapsed */
    readonly isCollapsed?: boolean;
    /** Callback invoked when the modal should close */
    readonly onClose: () => void;
    /** Callback to toggle the header collapse state */
    readonly onToggleCollapse?: () => void;
    /** The currently selected monitor for the site */
    readonly selectedMonitor?: Monitor;
    /** The site object to display information for */
    readonly site: Site;
}

interface HeaderMetaItem {
    key: string;
    label: string;
    tooltip?: string;
    value: string;
}

interface HeaderMetaParameters {
    lastCheckExact?: string;
    lastCheckRelative?: string;
    monitorState: {
        description: string;
        label: string;
    };
    monitorTypeLabel?: string;
    runningMonitors: number;
    totalMonitors: number;
}

/**
 * Counts monitors with active monitoring enabled.
 *
 * @param monitors - Collection of site monitors.
 *
 * @returns Number of monitors currently monitoring.
 */
function getRunningMonitorCount(monitors: readonly Monitor[]): number {
    let running = 0;

    for (const monitor of monitors) {
        if (monitor.monitoring) {
            running += 1;
        }
    }

    return running;
}

/**
 * Derives a human-readable descriptor for the monitor state.
 *
 * @param monitor - The selected monitor instance.
 *
 * @returns Label and descriptive copy representing monitor state.
 */
function getMonitorStateDescriptor(monitor?: Monitor): {
    description: string;
    label: string;
} {
    if (!monitor) {
        return {
            description: "Monitoring not configured",
            label: "Not Configured",
        };
    }

    if (monitor.monitoring) {
        return {
            description: "Monitoring active",
            label: "Active",
        };
    }

    return {
        description: "Monitoring paused",
        label: "Paused",
    };
}

/**
 * Determines the most recent check timestamp for the selected monitor.
 *
 * @param monitor - Monitor with historical status entries.
 *
 * @returns Latest timestamp in milliseconds, or undefined if unavailable.
 */
function getLastCheckTimestamp(monitor?: Monitor): number | undefined {
    if (!monitor) {
        return undefined;
    }

    let latestTimestamp: number | undefined = undefined;

    for (const entry of monitor.history) {
        const { timestamp } = entry;

        if (
            typeof timestamp === "number" &&
            (latestTimestamp === undefined || timestamp > latestTimestamp)
        ) {
            latestTimestamp = timestamp;
        }
    }

    return latestTimestamp;
}

/**
 * Builds the header meta items displayed beneath the site summary.
 *
 * @param parameters - Arguments required to assemble header meta content.
 *
 * @returns List of meta items with labels, values, and optional tooltips.
 */
function buildHeaderMeta(parameters: HeaderMetaParameters): HeaderMetaItem[] {
    const {
        lastCheckExact,
        lastCheckRelative,
        monitorState,
        monitorTypeLabel,
        runningMonitors,
        totalMonitors,
    } = parameters;

    const items: HeaderMetaItem[] = [
        {
            key: "monitor-state",
            label: "Monitor State",
            value: monitorState.label,
        },
        {
            key: "running-monitors",
            label: "Running Monitors",
            value: `${runningMonitors}/${totalMonitors}`,
        },
    ];

    if (monitorTypeLabel) {
        items.push({
            key: "monitor-type",
            label: "Monitor Type",
            value: monitorTypeLabel,
        });
    }

    if (lastCheckRelative) {
        items.push({
            key: "last-check",
            label: "Last Check",
            value: lastCheckRelative,
            ...(lastCheckExact ? { tooltip: lastCheckExact } : {}),
        });
    }

    return items;
}

/**
 * Generates the collapsed summary copy when the header is minimized.
 *
 * @param lastCheckRelative - Relative description of the last check time.
 *
 * @returns Collapsed summary string, if available.
 */
function getCollapsedSummary(lastCheckRelative?: string): string | undefined {
    if (!lastCheckRelative) {
        return undefined;
    }

    return `Last check ${lastCheckRelative}`;
}

interface SiteDetailsHeaderModel {
    collapsedSummary?: string;
    hasHttpMonitorUrl: boolean;
    hasMonitorData: boolean;
    headerMeta: HeaderMetaItem[];
    lastCheckExact?: string;
    monitorState: {
        description: string;
        label: string;
    };
    monitorTypeLabel?: string;
    screenshotUrl: string;
    selectedMonitorUrl: string;
}

function useSiteDetailsHeaderModel(
    site: Site,
    selectedMonitor?: Monitor
): SiteDetailsHeaderModel {
    const totalMonitors = site.monitors.length;

    const runningMonitors = useMemo(
        () => getRunningMonitorCount(site.monitors),
        [site.monitors]
    );

    const monitorState = useMemo(
        () => getMonitorStateDescriptor(selectedMonitor),
        [selectedMonitor]
    );

    const monitorTypeLabel = useMemo(
        () =>
            selectedMonitor
                ? getMonitorTypeDisplayLabel(selectedMonitor.type)
                : undefined,
        [selectedMonitor]
    );

    const lastCheckTimestamp = useMemo(
        () => getLastCheckTimestamp(selectedMonitor),
        [selectedMonitor]
    );

    const lastCheckRelative = useMemo(
        () =>
            lastCheckTimestamp === undefined
                ? undefined
                : formatRelativeTimestamp(lastCheckTimestamp),
        [lastCheckTimestamp]
    );

    const lastCheckExact = useMemo(
        () =>
            lastCheckTimestamp === undefined
                ? undefined
                : formatFullTimestamp(lastCheckTimestamp),
        [lastCheckTimestamp]
    );

    const headerMeta = useMemo(() => {
        const parameters: HeaderMetaParameters = {
            monitorState,
            runningMonitors,
            totalMonitors,
        };

        if (monitorTypeLabel) {
            parameters.monitorTypeLabel = monitorTypeLabel;
        }

        if (lastCheckExact) {
            parameters.lastCheckExact = lastCheckExact;
        }

        if (lastCheckRelative) {
            parameters.lastCheckRelative = lastCheckRelative;
        }

        return buildHeaderMeta(parameters);
    }, [
        lastCheckExact,
        lastCheckRelative,
        monitorState,
        monitorTypeLabel,
        runningMonitors,
        totalMonitors,
    ]);

    const collapsedSummary = useMemo(
        () => getCollapsedSummary(lastCheckRelative),
        [lastCheckRelative]
    );

    const selectedMonitorUrl = selectedMonitor?.url ?? "";
    const hasMonitorData = Boolean(selectedMonitor);
    const hasHttpMonitorUrl =
        selectedMonitor?.type === "http" && selectedMonitorUrl.length > 0;

    const screenshotUrl = useMemo(() => {
        if (!hasHttpMonitorUrl) {
            return "";
        }

        return isValidUrl(selectedMonitorUrl) ? selectedMonitorUrl : "";
    }, [hasHttpMonitorUrl, selectedMonitorUrl]);

    return useMemo(() => {
        const baseModel: SiteDetailsHeaderModel = {
            hasHttpMonitorUrl,
            hasMonitorData,
            headerMeta,
            monitorState,
            screenshotUrl,
            selectedMonitorUrl,
        };

        if (collapsedSummary) {
            baseModel.collapsedSummary = collapsedSummary;
        }

        if (lastCheckExact) {
            baseModel.lastCheckExact = lastCheckExact;
        }

        if (monitorTypeLabel) {
            baseModel.monitorTypeLabel = monitorTypeLabel;
        }

        return baseModel;
    }, [
        collapsedSummary,
        hasHttpMonitorUrl,
        hasMonitorData,
        headerMeta,
        lastCheckExact,
        monitorState,
        monitorTypeLabel,
        screenshotUrl,
        selectedMonitorUrl,
    ]);
}

/**
 * Site details header component displaying site information and controls.
 *
 * Displays site name, URL (for HTTP monitors), status indicator with loading
 * spinner, and a screenshot thumbnail. Handles external URL opening with proper
 * fallbacks and validates URLs before processing.
 *
 * @param props - Component props containing site data and control handlers
 *
 * @returns JSX element containing the site details header
 */
export const SiteDetailsHeader: NamedExoticComponent<SiteDetailsHeaderProperties> =
    memo(function SiteDetailsHeader({
        isCollapsed,
        onClose,
        onToggleCollapse,
        selectedMonitor,
        site,
    }: SiteDetailsHeaderProperties): JSX.Element {
        const isHeaderCollapsed = Boolean(isCollapsed);

        const isExpanded = !isHeaderCollapsed;

        // Use theme-aware styles
        const styles = useThemeStyles(isHeaderCollapsed);
        const { openExternal } = useUIStore();
        const {
            collapsedSummary,
            hasHttpMonitorUrl,
            hasMonitorData,
            headerMeta,
            lastCheckExact,
            monitorState,
            monitorTypeLabel,
            screenshotUrl,
            selectedMonitorUrl,
        } = useSiteDetailsHeaderModel(site, selectedMonitor);

        const monitorStatus = selectedMonitor?.status ?? "unknown";
        const CloseIcon = AppIcons.ui.close;

        // Memoized click handler for URL link
        const handleUrlClick = useCallback(
            (event: MouseEvent) => {
                event.preventDefault();
                if (!selectedMonitorUrl) {
                    return;
                }

                openExternal(selectedMonitorUrl, {
                    siteName: site.name,
                });
            },
            [
                openExternal,
                selectedMonitorUrl,
                site.name,
            ]
        );

        const shouldShowUrl = isExpanded && hasHttpMonitorUrl;
        const collapseLabel = isHeaderCollapsed
            ? "Expand header"
            : "Collapse header";
        const CollapseIcon = isHeaderCollapsed ? MdExpandMore : MdExpandLess;
        const SummaryIcon = AppIcons.ui.history;
        const headerClassName = isHeaderCollapsed
            ? "site-details-header site-details-header--collapsed"
            : "site-details-header";

        const urlElement = shouldShowUrl ? (
            <a
                aria-label={`Open ${selectedMonitorUrl} in browser`}
                className="site-details-url truncate"
                href={selectedMonitorUrl}
                onClick={handleUrlClick}
                rel="noopener noreferrer"
                tabIndex={0}
                target="_blank"
            >
                {selectedMonitorUrl}
            </a>
        ) : null;

        const handleCloseClick = useCallback(() => {
            onClose();
        }, [onClose]);

        return (
            <div className={headerClassName} style={styles.headerStyle}>
                <div
                    className="site-details-header__overlay"
                    style={styles.overlayStyle}
                />
                <div
                    className="site-details-header__content"
                    style={styles.contentStyle}
                >
                    <div className="site-details-header-accent" />
                    <div className="site-details-header-info">
                        <div className="site-details-header-main">
                            {isExpanded ? (
                                <ScreenshotThumbnail
                                    siteName={site.name}
                                    url={screenshotUrl}
                                />
                            ) : null}
                            <div className="site-details-status">
                                <StatusIndicator
                                    size="lg"
                                    status={monitorStatus}
                                />
                                {monitorTypeLabel ? (
                                    <ThemedText
                                        className="site-details-status__label"
                                        size="xs"
                                        variant="secondary"
                                        weight="medium"
                                    >
                                        {monitorTypeLabel}
                                    </ThemedText>
                                ) : null}
                            </div>
                            <div className="site-details-header-text">
                                <ThemedText
                                    className="site-details-title truncate"
                                    size="2xl"
                                    weight="bold"
                                >
                                    {site.name}
                                </ThemedText>
                                {urlElement}
                                {isExpanded ? (
                                    <ThemedText
                                        className="site-details-header-state"
                                        size="xs"
                                        variant="secondary"
                                    >
                                        {monitorState.description}
                                    </ThemedText>
                                ) : null}
                                {isHeaderCollapsed && collapsedSummary ? (
                                    <Tooltip
                                        content={
                                            lastCheckExact ?? collapsedSummary
                                        }
                                        position="bottom"
                                    >
                                        {(triggerProps) => (
                                            <span
                                                {...triggerProps}
                                                className="site-details-header-collapsed-summary"
                                            >
                                                <SummaryIcon
                                                    aria-hidden="true"
                                                    className="site-details-header-summary-icon"
                                                    size={14}
                                                />
                                                {collapsedSummary}
                                            </span>
                                        )}
                                    </Tooltip>
                                ) : null}
                                {isExpanded && !hasMonitorData ? (
                                    <ThemedText size="base" variant="warning">
                                        No monitor data available for this site.
                                    </ThemedText>
                                ) : null}
                            </div>
                        </div>
                        <div className="site-details-header-actions">
                            {isExpanded ? (
                                <MonitoringStatusDisplay
                                    monitors={site.monitors}
                                />
                            ) : null}
                            <div className="site-details-header-actions__controls">
                                {onToggleCollapse ? (
                                    <button
                                        aria-label={collapseLabel}
                                        onClick={onToggleCollapse}
                                        style={styles.collapseButtonStyle}
                                        title={collapseLabel}
                                        type="button"
                                    >
                                        <CollapseIcon className="themed-text-secondary h-5 w-5" />
                                    </button>
                                ) : null}
                                <button
                                    aria-label="Close site details"
                                    className="modal-shell__close site-details-modal__close site-details-header__close"
                                    onClick={handleCloseClick}
                                    title="Close site details"
                                    type="button"
                                >
                                    <CloseIcon size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                    {isExpanded && headerMeta.length > 0 ? (
                        <ul className="site-details-header-meta">
                            {headerMeta.map(
                                ({ key, label, tooltip, value }) => {
                                    const valueContent = (
                                        <span className="site-details-header-meta-value">
                                            {value}
                                        </span>
                                    );

                                    return (
                                        <li
                                            className="site-details-header-meta-item"
                                            key={key}
                                        >
                                            <ThemedText
                                                className="site-details-header-meta-label"
                                                size="xs"
                                                variant="secondary"
                                                weight="medium"
                                            >
                                                {label}
                                            </ThemedText>
                                            {tooltip ? (
                                                <Tooltip
                                                    content={tooltip}
                                                    position="bottom"
                                                >
                                                    {(triggerProps) => (
                                                        <span
                                                            {...triggerProps}
                                                            className="site-details-header-meta-value-wrapper"
                                                        >
                                                            {valueContent}
                                                        </span>
                                                    )}
                                                </Tooltip>
                                            ) : (
                                                valueContent
                                            )}
                                        </li>
                                    );
                                }
                            )}
                        </ul>
                    ) : null}
                </div>
            </div>
        );
    });
