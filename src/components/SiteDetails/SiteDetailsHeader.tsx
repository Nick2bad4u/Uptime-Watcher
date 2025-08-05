/**
 * Site details header component
 *
 * Displays the site title, URL, status indicator, and screenshot thumbnail
 * in a visually appealing header with gradient background and accent styling.
 */

import { MdExpandLess, MdExpandMore } from "react-icons/md";

import { useThemeStyles } from "../../hooks/useThemeStyles";
import { useUIStore } from "../../stores/ui/useUiStore";
import { StatusIndicator, ThemedBadge, ThemedBox, ThemedText } from "../../theme/components";
import { Monitor, Site } from "../../types";
import { isValidUrl, safeGetHostname } from "../../utils/monitoring/dataValidation";
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
 * Displays site name, URL (for HTTP monitors), status indicator with loading spinner,
 * and a screenshot thumbnail. Handles external URL opening with proper fallbacks
 * and validates URLs before processing.
 *
 * @param props - Component props containing site data and control handlers
 * @returns JSX element containing the site details header
 */
export function SiteDetailsHeader({
    isCollapsed,
    onToggleCollapse,
    selectedMonitor,
    site,
}: SiteDetailsHeaderProperties) {
    // Use theme-aware styles
    const styles = useThemeStyles(isCollapsed);
    const { openExternal } = useUIStore();

    // Get validated URL for screenshot component
    let screenshotUrl = "";
    if (selectedMonitor?.type === "http" && selectedMonitor.url) {
        screenshotUrl = isValidUrl(selectedMonitor.url) ? selectedMonitor.url : "";
    }

    return (
        <div style={styles.headerStyle}>
            <div style={styles.overlayStyle} />
            <div style={styles.contentStyle}>
                {/* Left accent bar */}
                <div className="site-details-header-accent" />
                <div className="flex items-start justify-between w-full gap-6 site-details-header-info">
                    {/* Left side: Screenshot, Status, and Site Info */}
                    <div className="flex items-center flex-1 min-w-0 gap-4">
                        {/* Website Screenshot Thumbnail - Only show URL for HTTP monitors */}
                        {!isCollapsed && <ScreenshotThumbnail siteName={site.name} url={screenshotUrl} />}
                        <div className="site-details-status-indicator">
                            <StatusIndicator size="lg" status={selectedMonitor?.status ?? "unknown"} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <ThemedText className="truncate site-details-title" size="2xl" weight="bold">
                                {site.name}
                            </ThemedText>
                            {/* Show clickable URL for HTTP monitors that have a URL */}
                            {!isCollapsed && selectedMonitor?.type === "http" && selectedMonitor.url && (
                                <a
                                    aria-label={`Open ${selectedMonitor.url} in browser`}
                                    className="truncate site-details-url"
                                    href={selectedMonitor.url}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        const url = selectedMonitor.url ?? "";
                                        openExternal(url, { siteName: site.name });
                                    }}
                                    rel="noopener noreferrer"
                                    tabIndex={0}
                                    target="_blank"
                                >
                                    {selectedMonitor.url}
                                </a>
                            )}
                            {/* Fallback if no monitor is available */}
                            {!isCollapsed && !selectedMonitor && (
                                <ThemedText size="base" variant="warning">
                                    No monitor data available for this site.
                                </ThemedText>
                            )}
                        </div>
                    </div>
                    {/* Right side: Monitoring Status Display and Collapse Button */}
                    <div className="flex items-center self-start flex-shrink-0 gap-2">
                        {!isCollapsed && <MonitoringStatusDisplay monitors={site.monitors} />}
                        {onToggleCollapse && (
                            <button
                                aria-label={isCollapsed ? "Expand header" : "Collapse header"}
                                onClick={onToggleCollapse}
                                style={styles.collapseButtonStyle}
                                title={isCollapsed ? "Expand header" : "Collapse header"}
                                type="button"
                            >
                                {isCollapsed ? (
                                    <MdExpandMore className="w-5 h-5 themed-text-secondary" />
                                ) : (
                                    <MdExpandLess className="w-5 h-5 themed-text-secondary" />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Type guard to check if the window.electronAPI has openExternal method.
/**
 * Enhanced monitoring status display component for the site details header.
 *
 * Shows larger indicators with monitor names and types using the theme system.
 * Displays monitor status, type, and connection information with proper error handling
 * for URL parsing.
 *
 * @param monitors - Array of monitors to display status for
 * @returns JSX element with enhanced monitoring status indicators
 */
function MonitoringStatusDisplay({ monitors }: { readonly monitors: Monitor[] }) {
    if (monitors.length === 0) {
        return (
            <ThemedBox data-testid="monitoring-status-display" padding="sm" rounded="md" variant="secondary">
                <ThemedText size="sm" variant="secondary">
                    No monitors configured
                </ThemedText>
            </ThemedBox>
        );
    }

    const runningCount = monitors.filter((monitor) => monitor.monitoring === true).length;
    const totalCount = monitors.length;

    return (
        <ThemedBox
            className="min-w-0"
            data-testid="monitoring-status-display"
            padding="md"
            rounded="lg"
            shadow="sm"
            surface="elevated"
            variant="primary"
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <ThemedText size="sm" variant="primary" weight="semibold">
                        Monitor Status
                    </ThemedText>
                    <ThemedBadge size="sm" variant={runningCount > 0 ? "success" : "secondary"}>
                        {runningCount}/{totalCount} active
                    </ThemedBadge>
                </div>
                <div className="flex flex-col gap-1 overflow-y-auto max-h-32">
                    {monitors.map((monitor) => (
                        <div
                            className="flex items-center gap-2"
                            data-testid={`monitor-status-${monitor.id}`}
                            key={monitor.id}
                        >
                            <ThemedBadge size="xs" variant={monitor.monitoring ? "success" : "secondary"}>
                                <div className="flex items-center gap-1">
                                    <div
                                        className={`w-2 h-2 rounded-full ${
                                            monitor.monitoring ? "themed-status-up" : "themed-status-paused"
                                        }`}
                                        title={`${monitor.type.toUpperCase()}: ${monitor.monitoring ? "Running" : "Stopped"}`}
                                    />
                                    <ThemedText size="xs" weight="medium">
                                        {monitor.type.toUpperCase()}
                                    </ThemedText>
                                </div>
                            </ThemedBadge>
                            <ThemedText className="flex-1 min-w-0" size="xs" variant="secondary">
                                {/* Display appropriate connection info based on monitor type */}
                                {monitor.type === "http" && monitor.url && (
                                    <span className="block truncate">
                                        {safeGetHostname(monitor.url) || monitor.url}
                                    </span>
                                )}
                                {monitor.type === "port" && monitor.host && monitor.port && (
                                    <span className="block truncate">
                                        {monitor.host}:{monitor.port}
                                    </span>
                                )}
                            </ThemedText>
                        </div>
                    ))}
                </div>
            </div>
        </ThemedBox>
    );
}
