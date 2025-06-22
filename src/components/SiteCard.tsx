import { Site, MonitorType } from "../types";
import { useStore } from "../store";
import { ThemedBox, ThemedText, ThemedButton, ThemedSelect, StatusIndicator, MiniChartBar } from "../theme/components";
import logger from "../services/logger";

interface SiteCardProps {
    site: Site;
}

export function SiteCard({ site }: SiteCardProps) {
    // Always select the latest site from the store by id
    const {
        sites,
        checkSiteNow,
        setSelectedSite,
        setShowSiteDetails,
        startSiteMonitorMonitoring,
        stopSiteMonitorMonitoring,
        isLoading,
        setSelectedMonitorType,
        getSelectedMonitorType,
    } = useStore();
    const latestSite = sites.find((s) => s.identifier === site.identifier) || site;
    // Use global store for selected monitor type
    const monitorTypes = latestSite.monitors.map((m) => m.type);
    const defaultMonitorType = monitorTypes[0] || "http";
    const selectedMonitorType = getSelectedMonitorType(latestSite.identifier) || defaultMonitorType;
    const monitor = latestSite.monitors.find((m) => m.type === selectedMonitorType);
    const status = monitor?.status || "pending";
    const responseTime = monitor?.responseTime;
    const filteredHistory = monitor?.history || [];
    const isMonitoring = monitor?.monitoring !== false; // default to true if undefined

    const handleMonitorTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMonitorType(latestSite.identifier, e.target.value as MonitorType);
    };

    // Refactor handlers to not require event argument
    const handleStartMonitoring = () => {
        startSiteMonitorMonitoring(latestSite.identifier, selectedMonitorType);
    };
    const handleStopMonitoring = () => {
        stopSiteMonitorMonitoring(latestSite.identifier, selectedMonitorType);
    };
    const handleCheckNow = () => {
        checkSiteNow(latestSite.identifier, selectedMonitorType)
            .then(() =>
                logger.user.action("Quick site check", { identifier: latestSite.identifier, monitorType: selectedMonitorType })
            )
            .catch((error) => logger.site.error(latestSite.identifier, error instanceof Error ? error : String(error)));
    };

    const handleCardClick = () => {
        setSelectedSite(latestSite);
        setSelectedMonitorType(latestSite.identifier, selectedMonitorType);
        setShowSiteDetails(true);
    };

    // Calculate uptime for the selected monitor
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
                    {latestSite.name || latestSite.identifier}
                </ThemedText>
                <div className="flex items-center gap-2 min-w-[180px]">
                    <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                        <ThemedSelect
                            value={selectedMonitorType}
                            onChange={handleMonitorTypeChange}
                            className="min-w-[80px]"
                        >
                            {latestSite.monitors.map((m) => (
                                <option key={m.type} value={m.type}>
                                    {m.type.toUpperCase()}
                                </option>
                            ))}
                        </ThemedSelect>
                    </div>
                    <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                        <ThemedButton
                            variant="ghost"
                            size="sm"
                            onClick={handleCheckNow}
                            className="min-w-[32px]"
                            aria-label="Check Now"
                            disabled={isLoading || !monitor}
                        >
                            <span>🔄</span>
                        </ThemedButton>
                    </div>
                    {isMonitoring ? (
                        <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                            <ThemedButton
                                variant="error"
                                size="sm"
                                onClick={handleStopMonitoring}
                                className="min-w-[32px]"
                                aria-label="Stop Monitoring"
                                disabled={isLoading || !monitor}
                            >
                                ⏸️
                            </ThemedButton>
                        </div>
                    ) : (
                        <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                            <ThemedButton
                                variant="success"
                                size="sm"
                                onClick={handleStartMonitoring}
                                className="min-w-[32px]"
                                aria-label="Start Monitoring"
                                disabled={isLoading || !monitor}
                            >
                                ▶️
                            </ThemedButton>
                        </div>
                    )}
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
