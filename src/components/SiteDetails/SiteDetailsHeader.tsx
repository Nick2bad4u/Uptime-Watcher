/**
 * Site details header component
 *
 * Displays the site title, URL, status indicator, and screenshot thumbnail
 * in a visually appealing header with gradient background and accent styling.
 */

import logger from "../../services/logger";
import { ThemedText, StatusIndicator } from "../../theme/components";
import { Site, Monitor } from "../../types";
import { ScreenshotThumbnail } from "./ScreenshotThumbnail";

/** Props for the SiteDetailsHeader component */
interface SiteDetailsHeaderProps {
    /** The site object to display information for */
    site: Site;
    /** The currently selected monitor for the site */
    selectedMonitor?: Monitor;
    /** Whether the site is currently being refreshed/checked */
    isRefreshing: boolean;
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

export function SiteDetailsHeader({ isRefreshing, selectedMonitor, site }: SiteDetailsHeaderProps) {
    /**
     * Type guard to check if the window.electronAPI has openExternal method
     * @param api - The API object to check
     * @returns True if the API has openExternal method
     */
    function hasOpenExternal(api: unknown): api is { openExternal: (url: string) => void } {
        return typeof (api as { openExternal?: unknown })?.openExternal === "function";
    }

    return (
        <div className="site-details-header">
            <div className="site-details-header-overlay" />
            <div className="site-details-header-content">
                {/* Left accent bar */}
                <div className="site-details-header-accent" />
                <div className="flex items-center gap-4 site-details-header-info">
                    {/* Website Screenshot Thumbnail */}
                    <ScreenshotThumbnail
                        url={selectedMonitor?.type === "http" ? (selectedMonitor?.url ?? "") : ""}
                        siteName={site.name || site.identifier}
                    />
                    <div className="site-details-status-indicator">
                        <StatusIndicator status={selectedMonitor?.status ?? "unknown"} size="lg" />
                        {isRefreshing && (
                            <div className="site-details-loading-spinner">
                                <div className="site-details-spinner" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <ThemedText size="2xl" weight="bold" className="truncate site-details-title">
                            {site.name || site.identifier}
                        </ThemedText>
                        {/* Show URL for HTTP, host:port for port monitor */}
                        {selectedMonitor?.type === "http" && selectedMonitor?.url && (
                            <a
                                href={selectedMonitor.url}
                                className="truncate site-details-url"
                                target="_blank"
                                rel="noopener noreferrer"
                                tabIndex={0}
                                aria-label={`Open ${selectedMonitor.url} in browser`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    const url = selectedMonitor.url || "";
                                    logger.user.action("External URL opened from site details", {
                                        siteId: site.identifier,
                                        siteName: site.name,
                                        url: url,
                                    });
                                    if (hasOpenExternal(window.electronAPI)) {
                                        window.electronAPI.openExternal(url);
                                    } else {
                                        window.open(url, "_blank");
                                    }
                                }}
                            >
                                {selectedMonitor.url}
                            </a>
                        )}
                        {/* Fallback if no monitor is available */}
                        {!selectedMonitor && (
                            <ThemedText variant="warning" size="base">
                                No monitor data available for this site.
                            </ThemedText>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
