/**
 * SiteCardHeader component displaying site name, monitor selector, and action
 * buttons. Provides the top section of each site card with interactive
 * controls.
 */

import type { Site } from "@shared/types";

import { type ChangeEvent, memo, type NamedExoticComponent } from "react";

import { ThemedText } from "../../../theme/components/ThemedText";
import { ActionButtonGroup } from "./components/ActionButtonGroup";
import { MonitorSelector } from "./components/MonitorSelector";
import { SiteCardFooter } from "./SiteCardFooter";

/**
 * Display and UI state options
 *
 * @public
 */
export interface DisplayOptions {
    /** Whether any operation is currently loading */
    isLoading: boolean;
}

/**
 * Interaction handlers for user actions
 *
 * @public
 */
export interface InteractionHandlers {
    /** Handler for immediate check button */
    onCheckNow: () => void;
    /** Handler for monitor selection changes */
    onMonitorIdChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    /** Handler for start monitoring button */
    onStartMonitoring: () => void;
    /** Handler for start site monitoring button */
    onStartSiteMonitoring: () => void;
    /** Handler for stop monitoring button */
    onStopMonitoring: () => void;
    /** Handler for stop site monitoring button */
    onStopSiteMonitoring: () => void;
}

/**
 * Monitoring configuration and state
 *
 * @public
 */
export interface MonitoringConfig {
    /** Whether all monitors are currently running */
    allMonitorsRunning: boolean;
    /** Whether site has any monitors configured */
    hasMonitor: boolean;
    /** Whether monitoring is currently active */
    isMonitoring: boolean;
    /** Currently selected monitor ID */
    selectedMonitorId: string;
}

/**
 * Props interface for SiteCardHeader component
 *
 * @public
 */
export interface SiteCardHeaderProperties {
    /** Display and UI options */
    readonly display: DisplayOptions;
    /** User interaction handlers */
    readonly interactions: InteractionHandlers;
    /** Monitoring configuration and state */
    readonly monitoring: MonitoringConfig;
    /** Site information */
    readonly site: SiteInfo;
}

/**
 * Site information for the header
 *
 * @public
 */
export interface SiteInfo {
    /** Site data to display */
    site: Site;
}

/**
 * Header section of the site card containing site name, monitor selection, and
 * action buttons. Provides interactive controls for monitor management and site
 * operations.
 *
 * This component is memoized to prevent unnecessary re-renders when parent
 * components update. For optimal performance, ensure that all callback props
 * are stable references (wrapped in useCallback). The site object should also
 * be stable to prevent unnecessary re-renders.
 *
 * UX Note: ActionButtonGroup is disabled when hasMonitor is false, preventing
 * actions on sites without configured monitors. The isLoading state is handled
 * internally by ActionButtonGroup to disable buttons during operations.
 *
 * @param props - SiteCardHeader component props
 *
 * @returns JSX.Element containing site header with controls
 */
export const SiteCardHeader: NamedExoticComponent<SiteCardHeaderProperties> =
    memo(function SiteCardHeader({
        display,
        interactions,
        monitoring,
        site,
    }: SiteCardHeaderProperties) {
        // Alias interaction handlers to satisfy react/jsx-handler-names rule
        const {
            onCheckNow: handleCheckNow,
            onMonitorIdChange: handleChange,
            onStartMonitoring: handleStartMonitoring,
            onStartSiteMonitoring: handleStartSiteMonitoring,
            onStopMonitoring: handleStopMonitoring,
            onStopSiteMonitoring: handleStopSiteMonitoring,
        } = interactions;

        return (
            <div className="site-card__header-row">
                <div className="site-card__title-container">
                    <span aria-hidden="true" className="site-card__title-dot" />
                    <ThemedText
                        className="site-card__title"
                        size="lg"
                        variant="primary"
                        weight="semibold"
                    >
                        {site.site.name}
                    </ThemedText>
                </div>

                <div className="site-card__control-cluster">
                    <MonitorSelector
                        monitors={site.site.monitors}
                        onChange={handleChange}
                        selectedMonitorId={monitoring.selectedMonitorId}
                    />

                    <div className="site-card__control-actions">
                        <ActionButtonGroup
                            allMonitorsRunning={monitoring.allMonitorsRunning}
                            buttonSize="xs"
                            disabled={!monitoring.hasMonitor}
                            isLoading={display.isLoading}
                            isMonitoring={monitoring.isMonitoring}
                            onCheckNow={handleCheckNow}
                            onStartMonitoring={handleStartMonitoring}
                            onStartSiteMonitoring={handleStartSiteMonitoring}
                            onStopMonitoring={handleStopMonitoring}
                            onStopSiteMonitoring={handleStopSiteMonitoring}
                        />
                        <SiteCardFooter />
                    </div>
                </div>
            </div>
        );
    });
