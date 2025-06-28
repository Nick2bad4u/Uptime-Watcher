import logger from "../../services/logger";
import { ThemedText, StatusIndicator } from "../../theme/components";
import { Site, Monitor } from "../../types";
import { ScreenshotThumbnail } from "./ScreenshotThumbnail";

interface SiteDetailsHeaderProps {
    site: Site;
    selectedMonitor?: Monitor;
    isRefreshing: boolean;
}

export function SiteDetailsHeader({ isRefreshing, selectedMonitor, site }: SiteDetailsHeaderProps) {
    // Accept unknown for runtime type check
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
