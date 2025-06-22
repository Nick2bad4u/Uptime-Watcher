import { useState } from "react";
import { Site, MonitorType } from "../types";
import { useStore } from "../store";
import {
    ThemedBox,
    ThemedText,
    ThemedButton,
    ThemedSelect,
    StatusIndicator,
    MiniChartBar
} from "../theme/components";
import logger from "../services/logger";

interface SiteCardProps {
    site: Site;
}

export function SiteCard({ site }: SiteCardProps) {
    const { deleteSite, checkSiteNow, setSelectedSite, setShowSiteDetails } = useStore();
    const [selectedMonitorType, setSelectedMonitorType] = useState<MonitorType>(site.monitors[0]?.type || "http");

    // Find the monitor for the selected type
    const monitor = site.monitors.find((m) => m.type === selectedMonitorType);
    const status = monitor?.status || "pending";
    const responseTime = monitor?.responseTime;
    const filteredHistory = monitor?.history || [];

    const handleMonitorTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMonitorType(e.target.value as MonitorType);
    };

    const handleQuickCheck = (e: React.MouseEvent) => {
        e.stopPropagation();
        checkSiteNow(site.url, selectedMonitorType)
            .then(() => logger.user.action("Quick site check", { url: site.url }))
            .catch((error) => logger.site.error(site.url, error instanceof Error ? error : String(error)));
    };

    const handleQuickRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to remove ${site.name || site.url}?`)) {
            return;
        }
        deleteSite(site.url)
            .then(() => logger.site.removed(site.url))
            .catch((error) => logger.site.error(site.url, error instanceof Error ? error : String(error)));
    };

    const handleCardClick = () => {
        setSelectedSite(site);
        setShowSiteDetails(true);
    };

    const calculateUptime = () => {
        if (filteredHistory.length === 0) return 0;
        const upCount = filteredHistory.filter((record) => record.status === "up").length;
        return Math.round((upCount / filteredHistory.length) * 100);
    };

    // --- UI ---
    return (
        <ThemedBox
            variant="secondary"
            padding="md"
            rounded="md"
            shadow="sm"
            className="site-card flex flex-col gap-2 cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="flex items-center justify-between">
                <ThemedText variant="primary" size="lg" weight="semibold">
                    {site.name || site.url}
                </ThemedText>
                <div className="flex items-center gap-2 min-w-[180px]">
                    <div onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                        <ThemedSelect
                            value={selectedMonitorType}
                            onChange={handleMonitorTypeChange}
                            className="min-w-[80px]"
                        >
                            {site.monitors.map((m) => (
                                <option key={m.type} value={m.type}>
                                    {m.type.toUpperCase()}
                                </option>
                            ))}
                        </ThemedSelect>
                    </div>
                    <ThemedButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickCheck as any}
                        className="min-w-[32px]"
                        aria-label="Check Now"
                    >
                        <span onClick={handleQuickCheck}>🔄</span>
                    </ThemedButton>
                    <ThemedButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickRemove as any}
                        className="min-w-[32px]"
                        aria-label="Delete"
                    >
                        <span onClick={handleQuickRemove}>🗑️</span>
                    </ThemedButton>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <StatusIndicator status={status} size="sm" />
                <ThemedText variant="secondary" size="sm">
                    {selectedMonitorType.toUpperCase()} Status: {status}
                </ThemedText>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center flex flex-col items-center">
                    <ThemedText size="xs" variant="secondary" className="block mb-1">
                        Status
                    </ThemedText>
                    <ThemedText size="sm" weight="medium">
                        {status?.toUpperCase() || "UNKNOWN"}
                    </ThemedText>
                </div>
                <div className="text-center flex flex-col items-center">
                    <ThemedText size="xs" variant="secondary" className="block mb-1">
                        Uptime
                    </ThemedText>
                    <ThemedText size="sm" weight="medium">
                        {calculateUptime()}%
                    </ThemedText>
                </div>
                <div className="text-center flex flex-col items-center">
                    <ThemedText size="xs" variant="secondary" className="block mb-1">
                        Response
                    </ThemedText>
                    <ThemedText size="sm" weight="medium">
                        {responseTime !== undefined ? `${responseTime} ms` : "-"}
                    </ThemedText>
                </div>
                <div className="text-center flex flex-col items-center">
                    <ThemedText size="xs" variant="secondary" className="block mb-1">
                        Checks
                    </ThemedText>
                    <ThemedText size="sm" weight="medium">
                        {filteredHistory.length}
                    </ThemedText>
                </div>
            </div>
            {filteredHistory.length > 0 && (
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <ThemedText size="xs" variant="secondary">
                                {selectedMonitorType === "http"
                                    ? "HTTP History"
                                    : selectedMonitorType === "port"
                                    ? "Port History"
                                    : "?"}
                            </ThemedText>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        {filteredHistory.slice(-20).map((record, index) => (
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
            <div className="border-t pt-2 mt-2">
                <ThemedText
                    size="xs"
                    variant="tertiary"
                    className="text-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    Click to view detailed statistics and settings
                </ThemedText>
            </div>
        </ThemedBox>
    );
}
