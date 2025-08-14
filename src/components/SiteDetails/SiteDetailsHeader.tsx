/**
 * Site details header component
 *
 * Displays the site title, URL, status indicator, and screenshot thumbnail
 * in a visually appealing header with gradient background and accent styling.
 */

import type { Monitor, Site } from "@shared/types";
import type { MouseEvent } from "react";
import type { JSX } from "react/jsx-runtime";

import { isValidUrl } from "@shared/validation/validatorUtils";
import { useCallback } from "react";
import { MdExpandLess, MdExpandMore } from "react-icons/md";

import { useThemeStyles } from "../../hooks/useThemeStyles";
import { useUIStore } from "../../stores/ui/useUiStore";
import StatusIndicator from "../../theme/components/StatusIndicator";
import ThemedText from "../../theme/components/ThemedText";
import MonitoringStatusDisplay from "./MonitoringStatusDisplay";
import { ScreenshotThumbnail } from "./ScreenshotThumbnail";

/**
 * Props for the SiteDetailsHeader component
 *
 * @public
 */
export interface SiteDetailsHeaderProperties {
    /** Whether the header is collapsed */
    readonly isCollapsed?: boolean;
    /** Callback to toggle the header collapse state */
    readonly onToggleCollapse?: () => void;
    /** The currently selected monitor for the site */
    readonly selectedMonitor?: Monitor;
    /** The site object to display information for */
    readonly site: Site;
}

/**
 * Site details header component displaying site information and controls.
 *
 * Displays site name, URL (for HTTP monitors), status indicator with loading
 * spinner, and a screenshot thumbnail. Handles external URL opening with
 * proper fallbacks and validates URLs before processing.
 *
 * @param props - Component props containing site data and control handlers
 * @returns JSX element containing the site details header
 */
const SiteDetailsHeader = ({
    isCollapsed,
    onToggleCollapse,
    selectedMonitor,
    site,
}: SiteDetailsHeaderProperties): JSX.Element => {
    // Use theme-aware styles
    const styles = useThemeStyles(isCollapsed);
    const { openExternal } = useUIStore();

    // Get validated URL for screenshot component
    let screenshotUrl = "";
    if (selectedMonitor?.type === "http" && selectedMonitor.url) {
        screenshotUrl = isValidUrl(selectedMonitor.url)
            ? selectedMonitor.url
            : "";
    }

    // Memoized click handler for URL link
    const handleUrlClick = useCallback(
        (event: MouseEvent) => {
            event.preventDefault();
            const url = selectedMonitor?.url ?? "";
            openExternal(url, {
                siteName: site.name,
            });
        },
        [openExternal, selectedMonitor?.url, site.name]
    );

    return (
        <div style={styles.headerStyle}>
            <div style={styles.overlayStyle} />
            <div style={styles.contentStyle}>
                {/* Left accent bar */}
                <div className="site-details-header-accent" />
                <div className="site-details-header-info flex w-full items-start justify-between gap-6">
                    {/* Left side: Screenshot, Status, and Site Info */}
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                        {/* Website Screenshot Thumbnail - Only show URL for HTTP monitors */}
                        {!isCollapsed && (
                            <ScreenshotThumbnail
                                siteName={site.name}
                                url={screenshotUrl}
                            />
                        )}
                        <div className="site-details-status-indicator">
                            <StatusIndicator
                                size="lg"
                                status={selectedMonitor?.status ?? "unknown"}
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <ThemedText
                                className="site-details-title truncate"
                                size="2xl"
                                weight="bold"
                            >
                                {site.name}
                            </ThemedText>
                            {/* Show clickable URL for HTTP monitors that have a URL */}
                            {!isCollapsed &&
                            selectedMonitor?.type === "http" &&
                            selectedMonitor.url ? (
                                <a
                                    aria-label={`Open ${selectedMonitor.url} in browser`}
                                    className="site-details-url truncate"
                                    href={selectedMonitor.url}
                                    onClick={handleUrlClick}
                                    rel="noopener noreferrer"
                                    tabIndex={0}
                                    target="_blank"
                                >
                                    {selectedMonitor.url}
                                </a>
                            ) : null}
                            {/* Fallback if no monitor is available */}
                            {!isCollapsed && !selectedMonitor && (
                                <ThemedText size="base" variant="warning">
                                    No monitor data available for this site.
                                </ThemedText>
                            )}
                        </div>
                    </div>
                    {/* Right side: Monitoring Status Display and Collapse Button */}
                    <div className="flex shrink-0 items-center gap-2 self-start">
                        {!isCollapsed && (
                            <MonitoringStatusDisplay monitors={site.monitors} />
                        )}
                        {onToggleCollapse ? (
                            <button
                                aria-label={
                                    isCollapsed
                                        ? "Expand header"
                                        : "Collapse header"
                                }
                                onClick={onToggleCollapse}
                                style={styles.collapseButtonStyle}
                                title={
                                    isCollapsed
                                        ? "Expand header"
                                        : "Collapse header"
                                }
                                type="button"
                            >
                                {isCollapsed ? (
                                    <MdExpandMore className="themed-text-secondary h-5 w-5" />
                                ) : (
                                    <MdExpandLess className="themed-text-secondary h-5 w-5" />
                                )}
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SiteDetailsHeader;
