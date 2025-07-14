/**
 * Site details header component
 *
 * Displays the site title, URL, status indicator, and screenshot thumbnail
 * in a visually appealing header with gradient background and accent styling.
 */

import { MdExpandLess, MdExpandMore } from "react-icons/md";

import { useThemeStyles } from "../../hooks";
import { logger } from "../../services";
import { ThemedText, StatusIndicator, ThemedBox, ThemedBadge } from "../../theme";
import { Site, Monitor } from "../../types";
import { ScreenshotThumbnail } from "./ScreenshotThumbnail";

/**
 * Type guard to check if the window.electronAPI has openExternal method
 * @param api - The API object to check
 * @returns True if the API has openExternal method
 */
function hasOpenExternal(api: unknown): api is { openExternal: (url: string) => void } {
    return typeof (api as { openExternal?: unknown }).openExternal === "function";
}

/** Props for the SiteDetailsHeader component */
interface SiteDetailsHeaderProperties {
    /** The site object to display information for */
    readonly site: Site;
    /** The currently selected monitor for the site */
    readonly selectedMonitor?: Monitor;
    /** Whether the header is collapsed */
    readonly isCollapsed?: boolean;
    /** Callback to toggle the header collapse state */
    readonly onToggleCollapse?: () => void;
}

/**
 * Header component for site details view.
 *
 * Displays site name, URL (for HTTP monitors), status indicator with loading spinner,
 * and a screenshot thumbnail. Handles external URL opening with proper fallbacks.
 *
 * @param props - Component props
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
                        {!isCollapsed && (
                            <ScreenshotThumbnail
                                url={selectedMonitor?.type === "http" ? (selectedMonitor.url ?? "") : ""}
                                siteName={site.name}
                            />
                        )}
                        <div className="site-details-status-indicator">
                            <StatusIndicator status={selectedMonitor?.status ?? "unknown"} size="lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <ThemedText size="2xl" weight="bold" className="truncate site-details-title">
                                {site.name}
                            </ThemedText>
                            {/* Show clickable URL for HTTP monitors that have a URL */}
                            {!isCollapsed && selectedMonitor?.type === "http" && selectedMonitor.url && (
                                <a
                                    href={selectedMonitor.url}
                                    className="truncate site-details-url"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    tabIndex={0}
                                    aria-label={`Open ${selectedMonitor.url} in browser`}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        const url = selectedMonitor.url ?? "";
                                        logger.user.action("External URL opened from site details", {
                                            siteId: site.identifier,
                                            siteName: site.name,
                                            url: url,
                                        });
                                        const electronAPI = (
                                            window.electronAPI as unknown as {
                                                electronAPI?: { openExternal: (url: string) => void };
                                            }
                                        ).electronAPI;
                                        if (hasOpenExternal(electronAPI)) {
                                            electronAPI.openExternal(url);
                                        } else {
                                            window.open(url, "_blank");
                                        }
                                    }}
                                >
                                    {selectedMonitor.url}
                                </a>
                            )}
                            {/* Fallback if no monitor is available */}
                            {!isCollapsed && !selectedMonitor && (
                                <ThemedText variant="warning" size="base">
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
                                type="button"
                                onClick={onToggleCollapse}
                                style={styles.collapseButtonStyle}
                                aria-label={isCollapsed ? "Expand header" : "Collapse header"}
                                title={isCollapsed ? "Expand header" : "Collapse header"}
                            >
                                {isCollapsed ? (
                                    <MdExpandMore className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                ) : (
                                    <MdExpandLess className="w-5 h-5 text-gray-600 dark:text-gray-300" />
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
 * Enhanced monitoring status display component for the site details header.
 * Shows larger indicators with monitor names and types using the theme system.
 * @param monitors - Array of monitors to display status for
 * @returns JSX element with enhanced monitoring status indicators
 */
function MonitoringStatusDisplay({ monitors }: { readonly monitors: Monitor[] }) {
    if (monitors.length === 0) {
        return (
            <ThemedBox variant="secondary" padding="sm" rounded="md" data-testid="monitoring-status-display">
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
            variant="primary"
            surface="elevated"
            padding="md"
            rounded="lg"
            shadow="sm"
            data-testid="monitoring-status-display"
            className="min-w-0"
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <ThemedText size="sm" weight="semibold" variant="primary">
                        Monitor Status
                    </ThemedText>
                    <ThemedBadge variant={runningCount > 0 ? "success" : "secondary"} size="sm">
                        {runningCount}/{totalCount} active
                    </ThemedBadge>
                </div>
                <div className="flex flex-col gap-1 overflow-y-auto max-h-32">
                    {monitors.map((monitor) => (
                        <div
                            key={monitor.id}
                            className="flex items-center gap-2"
                            data-testid={`monitor-status-${monitor.id}`}
                        >
                            <ThemedBadge variant={monitor.monitoring ? "success" : "secondary"} size="xs">
                                <div className="flex items-center gap-1">
                                    <div
                                        className={`w-2 h-2 rounded-full ${
                                            monitor.monitoring ? "bg-green-500" : "bg-gray-400"
                                        }`}
                                        title={`${monitor.type.toUpperCase()}: ${monitor.monitoring ? "Running" : "Stopped"}`}
                                    />
                                    <ThemedText size="xs" weight="medium">
                                        {monitor.type.toUpperCase()}
                                    </ThemedText>
                                </div>
                            </ThemedBadge>
                            <ThemedText size="xs" variant="secondary" className="flex-1 min-w-0">
                                {/* Display appropriate connection info based on monitor type */}
                                {monitor.type === "http" && monitor.url && (
                                    <span className="block truncate">{new URL(monitor.url).hostname}</span>
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
