/**
 * Reusable site monitoring button component.
 * Provides a unified button for starting/stopping all monitors in a site.
 *
 * @remarks
 * This component encapsulates the logic for site-wide monitoring control,
 * providing consistent behavior across different contexts (site cards, site details).
 * Supports compact mode for space-constrained layouts and includes proper
 * event handling to prevent propagation to parent elements.
 *
 * The button automatically switches between start and stop states based on
 * the `allMonitorsRunning` prop, using appropriate styling and icons for
 * each state.
 *
 * @example
 * ```tsx
 * <SiteMonitoringButton
 *   allMonitorsRunning={false}
 *   isLoading={false}
 *   onStartSiteMonitoring={() => console.log('Starting...')}
 *   onStopSiteMonitoring={() => console.log('Stopping...')}
 * />
 * ```
 *
 * @public
 */

import React from "react";

import { ThemedButton } from "../../../theme/components";

/**
 * Props for the SiteMonitoringButton component.
 *
 * @remarks
 * Defines the interface for configuring the site monitoring button behavior
 * and appearance. The component supports both start and stop operations
 * with loading states and customizable styling.
 *
 * @public
 */
export interface SiteMonitoringButtonProperties {
    /** Whether all monitors are currently running - determines button state */
    allMonitorsRunning: boolean;
    /** Additional CSS classes to apply to the button */
    className?: string;
    /** Whether to show compact text (for smaller spaces) */
    compact?: boolean;
    /** Whether any operation is currently loading - disables button */
    isLoading: boolean;
    /** Handler for starting site-level monitoring */
    onStartSiteMonitoring: () => void;
    /** Handler for stopping site-level monitoring */
    onStopSiteMonitoring: () => void;
}

/**
 * Reusable site monitoring button that handles start/stop all monitoring.
 *
 * @remarks
 * This component provides a consistent interface for site-wide monitoring controls
 * across different parts of the application. It automatically switches between
 * start and stop states based on whether all monitors are currently running.
 *
 * Key features:
 * - Automatic state switching based on monitor status
 * - Event propagation prevention to avoid parent element interactions
 * - Loading state handling with button disabling
 * - Compact mode for space-constrained layouts
 * - Consistent styling with theme integration
 *
 * The component uses the appropriate variant (success for start, error for stop)
 * and includes intuitive emoji icons for visual clarity.
 *
 * @param props - Component configuration and event handlers
 * @returns JSX element containing the themed monitoring button
 *
 * @example
 * ```tsx
 * // Standard usage
 * <SiteMonitoringButton
 *   allMonitorsRunning={site.monitors.every(m => m.monitoring)}
 *   isLoading={false}
 *   onStartSiteMonitoring={handleStart}
 *   onStopSiteMonitoring={handleStop}
 * />
 *
 * // Compact mode for site cards
 * <SiteMonitoringButton
 *   allMonitorsRunning={allRunning}
 *   compact
 *   isLoading={loading}
 *   onStartSiteMonitoring={handleStart}
 *   onStopSiteMonitoring={handleStop}
 * />
 * ```
 */
export const SiteMonitoringButton = React.memo(function SiteMonitoringButton({
    allMonitorsRunning,
    className = "",
    compact = false,
    isLoading,
    onStartSiteMonitoring,
    onStopSiteMonitoring,
}: SiteMonitoringButtonProperties) {
    if (allMonitorsRunning) {
        return (
            <ThemedButton
                aria-label="Stop All Monitoring"
                className={`flex items-center gap-1 ${className}`}
                disabled={isLoading}
                onClick={(event) => {
                    event?.stopPropagation();
                    onStopSiteMonitoring();
                }}
                size="sm"
                variant="error"
            >
                <span>⏹️</span>
                {!compact && <span className="hidden text-xs sm:inline">Stop All</span>}
            </ThemedButton>
        );
    }

    return (
        <ThemedButton
            aria-label="Start All Monitoring"
            className={`flex items-center gap-1 ${className}`}
            disabled={isLoading}
            onClick={(event) => {
                event?.stopPropagation();
                onStartSiteMonitoring();
            }}
            size="sm"
            variant="success"
        >
            <span>▶️</span>
            {!compact && <span className="hidden text-xs sm:inline">Start All</span>}
        </ThemedButton>
    );
});
