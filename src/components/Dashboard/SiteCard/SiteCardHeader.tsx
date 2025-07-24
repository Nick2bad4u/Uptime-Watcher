/**
 * SiteCardHeader component displaying site name, monitor selector, and action buttons.
 * Provides the top section of each site card with interactive controls.
 */

import React from "react";

import { ThemedText } from "../../../theme/components";
import { Site } from "../../../types";
import { ActionButtonGroup } from "./components/ActionButtonGroup";
import { MonitorSelector } from "./components/MonitorSelector";

/**
 * Props for the SiteCardHeader component
 *
 * @public
 */
export interface SiteCardHeaderProperties {
    /** Whether site has any monitors configured */
    hasMonitor: boolean;
    /** Whether any operation is currently loading */
    isLoading: boolean;
    /** Whether monitoring is currently active */
    isMonitoring: boolean;
    /** Handler for immediate check button */
    onCheckNow: () => void;
    /** Handler for monitor selection changes */
    onMonitorIdChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    /** Handler for start monitoring button */
    onStartMonitoring: () => void;
    /** Handler for stop monitoring button */
    onStopMonitoring: () => void;
    /** Currently selected monitor ID */
    selectedMonitorId: string;
    /** Site data to display */
    site: Site;
}

/**
 * Header section of the site card containing site name, monitor selection, and action buttons.
 * Provides interactive controls for monitor management and site operations.
 * Memoized to prevent unnecessary re-renders when parent data hasn't changed.
 *
 * @param props - SiteCardHeader component props
 * @returns JSX element containing site header with controls
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
}: SiteCardHeaderProperties) {
    return (
        <div className="flex items-center justify-between">
            <ThemedText size="lg" variant="primary" weight="semibold">
                {site.name}
            </ThemedText>

            <div className="flex items-center gap-2 min-w-[180px]">
                <MonitorSelector
                    monitors={site.monitors}
                    onChange={onMonitorIdChange}
                    selectedMonitorId={selectedMonitorId}
                />

                <ActionButtonGroup
                    disabled={!hasMonitor}
                    isLoading={isLoading}
                    isMonitoring={isMonitoring}
                    onCheckNow={onCheckNow}
                    onStartMonitoring={onStartMonitoring}
                    onStopMonitoring={onStopMonitoring}
                />
            </div>
        </div>
    );
});
