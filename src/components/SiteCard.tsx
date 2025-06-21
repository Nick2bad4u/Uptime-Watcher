import { useState } from "react";
import { Site } from "../types";
import { useStore } from "../store";
import {
    ThemedCard,
    ThemedText,
    ThemedIconButton,
    ThemedBadge,
    StatusIndicator,
    MiniChartBar,
    ThemedTooltip,
} from "../theme/components";

interface SiteCardProps {
    site: Site;
}

export function SiteCard({ site }: SiteCardProps) {
    const { deleteSite, checkSiteNow, isLoading, setSelectedSite, setShowSiteDetails } = useStore();
    const [showQuickActions, setShowQuickActions] = useState(false);

    const handleQuickCheck = async (e?: React.MouseEvent) => {
        e?.stopPropagation(); // Prevent card click
        try {
            await checkSiteNow(site.url);
        } catch (error) {
            console.error("Failed to check site:", error);
        }
    };

    const handleQuickRemove = async (e?: React.MouseEvent) => {
        e?.stopPropagation(); // Prevent card click
        if (!window.confirm(`Are you sure you want to remove ${site.name || site.url}?`)) {
            return;
        }

        try {
            await deleteSite(site.url);
        } catch (error) {
            console.error("Failed to remove site:", error);
        }
    };

    const handleCardClick = () => {
        setSelectedSite(site);
        setShowSiteDetails(true);
    };

    const formatResponseTime = (time?: number) => {
        if (!time) return "N/A";
        if (time < 1000) return `${time}ms`;
        return `${(time / 1000).toFixed(2)}s`;
    };

    const formatLastChecked = (date?: Date) => {
        if (!date) return "Never";
        const now = new Date();
        const checked = new Date(date);
        const diffMs = now.getTime() - checked.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return checked.toLocaleDateString();
    };

    const calculateUptime = () => {
        if (site.history.length === 0) return 0;
        const upCount = site.history.filter((record) => record.status === "up").length;
        return Math.round((upCount / site.history.length) * 100);
    };

    const getUptimeColor = (uptime: number) => {
        if (uptime >= 95) return "success";
        if (uptime >= 90) return "warning";
        return "error";
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
                    <StatusIndicator status={site.status as any} size="md" />
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
                    <ThemedBadge variant={getUptimeColor(uptime)} size="sm">
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
                                status={record.status as any}
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
