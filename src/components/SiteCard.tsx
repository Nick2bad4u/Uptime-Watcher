import { useState } from "react";
import { Site } from "../types";
import { useStore } from "../store";
import { formatResponseTime, formatLastChecked } from "../utils/time";
import {
    ThemedCard,
    ThemedText,
    ThemedIconButton,
    ThemedBadge,
    StatusIndicator,
    MiniChartBar,
    ThemedTooltip,
} from "../theme/components";
import { useAvailabilityColors } from "../theme/useTheme";
import logger from "../services/logger";

interface SiteCardProps {
    site: Site;
}

export function SiteCard({ site }: SiteCardProps) {
    const { deleteSite, checkSiteNow, isLoading, setSelectedSite, setShowSiteDetails } = useStore();
    const { getAvailabilityVariant } = useAvailabilityColors();
    const [showQuickActions, setShowQuickActions] = useState(false);

    const handleQuickCheck = async (e?: React.MouseEvent) => {
        e?.stopPropagation(); // Prevent card click
        try {
            await checkSiteNow(site.url);
            logger.user.action("Quick site check", { url: site.url });
        } catch (error) {
            logger.site.error(site.url, error instanceof Error ? error : String(error));
        }
    };

    const handleQuickRemove = async (e?: React.MouseEvent) => {
        e?.stopPropagation(); // Prevent card click
        if (!window.confirm(`Are you sure you want to remove ${site.name || site.url}?`)) {
            return;
        }

        try {
            await deleteSite(site.url);
            logger.site.removed(site.url);
        } catch (error) {
            logger.site.error(site.url, error instanceof Error ? error : String(error));
        }
    };

    const handleCardClick = () => {
        setSelectedSite(site);
        setShowSiteDetails(true);
    };

    const calculateUptime = () => {
        if (site.history.length === 0) return 0;
        const upCount = site.history.filter((record) => record.status === "up").length;
        return Math.round((upCount / site.history.length) * 100);
    };

    const mapAvailabilityToBadgeVariant = (availability: number): "success" | "warning" | "error" => {
        const variant = getAvailabilityVariant(availability);
        return variant === "danger" ? "error" : variant;
    };

    const getTrendIcon = () => {
        if (site.history.length < 2) return "➖";
        const recent = site.history.slice(-5);
        const upCount = recent.filter((r) => r.status === "up").length;
        const ratio = upCount / recent.length;

        if (ratio >= 0.8) return "📈";
        if (ratio >= 0.4) return "➖";
        return "📉";
    };

    const getSiteIcon = () => {
        try {
            const url = new URL(site.url);
            return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
        } catch {
            return "🌐";
        }
    };

    const uptime = calculateUptime();

    return (
        <ThemedCard
            variant="primary"
            padding="lg"
            shadow="sm"
            clickable
            onClick={handleCardClick}
            className="site-card-enhanced group"
            onMouseEnter={() => setShowQuickActions(true)}
            onMouseLeave={() => setShowQuickActions(false)}
        >
            {/* Header Section */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="site-icon-container">
                        <img
                            src={getSiteIcon()}
                            alt=""
                            className="site-icon"
                            onError={(e) => {
                                e.currentTarget.classList.add("hidden");
                                const fallback = e.currentTarget.nextElementSibling as HTMLDivElement;
                                if (fallback) fallback.classList.remove("site-icon-fallback-hidden");
                            }}
                        />
                        <div className="site-icon-fallback site-icon-fallback-hidden">🌐</div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                            <ThemedText size="lg" weight="semibold" className="truncate">
                                {site.name || site.url}
                            </ThemedText>
                            <span className="text-sm">{getTrendIcon()}</span>
                        </div>

                        {site.name && (
                            <ThemedText size="sm" variant="tertiary" className="truncate">
                                {site.url}
                            </ThemedText>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <StatusIndicator status={site.status} size="md" />
                    {showQuickActions && (
                        <div
                            className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ThemedTooltip content="Check now">
                                <ThemedIconButton
                                    icon="🔄"
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleQuickCheck}
                                    disabled={isLoading}
                                />
                            </ThemedTooltip>
                            <ThemedTooltip content="Remove site">
                                <ThemedIconButton
                                    icon="🗑️"
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleQuickRemove}
                                    disabled={isLoading}
                                />
                            </ThemedTooltip>
                        </div>
                    )}
                </div>
            </div>

            {/* Metrics Section */}
            <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center flex flex-col items-center">
                    <ThemedText size="xs" variant="secondary" className="block mb-1">
                        Status
                    </ThemedText>
                    <ThemedBadge
                        variant={site.status === "up" ? "success" : site.status === "down" ? "error" : "warning"}
                        size="sm"
                    >
                        {site.status?.toUpperCase() || "UNKNOWN"}
                    </ThemedBadge>
                </div>

                <div className="text-center flex flex-col items-center">
                    <ThemedText size="xs" variant="secondary" className="block mb-1">
                        Uptime
                    </ThemedText>
                    <ThemedBadge variant={mapAvailabilityToBadgeVariant(uptime)} size="sm">
                        {uptime}%
                    </ThemedBadge>
                </div>

                <div className="text-center flex flex-col items-center">
                    <ThemedText size="xs" variant="secondary" className="block mb-1">
                        Response
                    </ThemedText>
                    <ThemedText size="sm" weight="medium">
                        {formatResponseTime(site.responseTime)}
                    </ThemedText>
                </div>

                <div className="text-center flex flex-col items-center">
                    <ThemedText size="xs" variant="secondary" className="block mb-1">
                        Checks
                    </ThemedText>
                    <ThemedText size="sm" weight="medium">
                        {site.history.length}
                    </ThemedText>
                </div>
            </div>

            {/* Status History Section */}
            {site.history.length > 0 && (
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                        <ThemedText size="xs" variant="secondary">
                            Recent History
                        </ThemedText>
                        <ThemedText size="xs" variant="tertiary">
                            Last: {formatLastChecked(site.lastChecked)}
                        </ThemedText>
                    </div>
                    <div className="flex items-center space-x-1">
                        {site.history.slice(-20).map((record, index) => (
                            <MiniChartBar
                                key={index}
                                status={record.status}
                                responseTime={record.responseTime}
                                timestamp={record.timestamp}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Footer - Click to view details hint */}
            <div className="border-t pt-2 mt-2">
                <ThemedText
                    size="xs"
                    variant="tertiary"
                    className="text-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    Click to view detailed statistics and settings
                </ThemedText>
            </div>
        </ThemedCard>
    );
}
