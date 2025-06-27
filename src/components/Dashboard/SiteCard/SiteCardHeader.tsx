import React from "react";

import { ThemedText } from "../../../theme/components";
import { Site } from "../../../types";
import { ActionButtonGroup } from "./components/ActionButtonGroup";
import { MonitorSelector } from "./components/MonitorSelector";

interface SiteCardHeaderProps {
    site: Site;
    selectedMonitorId: string;
    onMonitorIdChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onCheckNow: () => void;
    onStartMonitoring: () => void;
    onStopMonitoring: () => void;
    isLoading: boolean;
    isMonitoring: boolean;
    hasMonitor: boolean;
}

/**
 * Header section of the site card containing site name, monitor selection, and action buttons
 * Memoized to prevent unnecessary re-renders
 */
export const SiteCardHeader = React.memo(function SiteCardHeader({
    hasMonitor,
    isLoading,
    isMonitoring,
    onCheckNow,
    onMonitorIdChange,
    onStartMonitoring,
    onStopMonitoring,
    selectedMonitorId,
    site,
}: SiteCardHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <ThemedText variant="primary" size="lg" weight="semibold">
                {site.name || site.identifier}
            </ThemedText>

            <div className="flex items-center gap-2 min-w-[180px]">
                <MonitorSelector
                    monitors={site.monitors}
                    selectedMonitorId={selectedMonitorId}
                    onChange={onMonitorIdChange}
                />

                <ActionButtonGroup
                    onCheckNow={onCheckNow}
                    onStartMonitoring={onStartMonitoring}
                    onStopMonitoring={onStopMonitoring}
                    isLoading={isLoading}
                    isMonitoring={isMonitoring}
                    disabled={!hasMonitor}
                />
            </div>
        </div>
    );
});
