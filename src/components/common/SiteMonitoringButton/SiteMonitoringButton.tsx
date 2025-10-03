/**
 * Reusable site monitoring button component. Provides a unified button for
 * starting/stopping all monitors in a site.
 *
 * @remarks
 * This component encapsulates the logic for site-wide monitoring control,
 * providing consistent behavior across different contexts (site cards, site
 * details). Supports compact mode for space-constrained layouts and includes
 * proper event handling to prevent propagation to parent elements.
 *
 * The button automatically switches between start and stop states based on the
 * `allMonitorsRunning` prop, using appropriate styling and icons for each
 * state.
 *
 * @example
 *
 * ```tsx
 * <SiteMonitoringButton
 *     allMonitorsRunning={false}
 *     isLoading={false}
 *     onStartSiteMonitoring={() => console.log("Starting...")}
 *     onStopSiteMonitoring={() => console.log("Stopping...")}
 * />;
 * ```
 *
 * @public
 */

import type { CoreComponentProperties } from "@shared/types/componentProps";

import {
    memo,
    type MouseEvent,
    type NamedExoticComponent,
    useCallback,
} from "react";

import type { ButtonSize } from "../../../theme/components/types";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { AppIcons } from "../../../utils/icons";
import { Tooltip } from "../Tooltip/Tooltip";

/**
 * Contextual reason applied when the monitoring button becomes disabled.
 *
 * @public
 */
export type SiteMonitoringDisabledReason = "loading" | "unconfigured";

/**
 * Props for the SiteMonitoringButton component.
 *
 * @remarks
 * Defines the interface for configuring the site monitoring button behavior and
 * appearance. The component supports both start and stop operations with
 * loading states and customizable styling.
 *
 * @public
 */
export interface SiteMonitoringButtonProperties
    extends CoreComponentProperties {
    /** Whether all monitors are currently running - determines button state */
    readonly allMonitorsRunning: boolean;
    /** Whether to show compact text (for smaller spaces) */
    readonly compact?: boolean;
    /** Optional reason describing why the control is disabled. */
    readonly disabledReason?: SiteMonitoringDisabledReason;
    /** Whether any operation is currently loading - disables button */
    readonly isLoading: boolean;
    /** Handler for starting site-level monitoring */
    readonly onStartSiteMonitoring: () => void;
    /** Handler for stopping site-level monitoring */
    readonly onStopSiteMonitoring: () => void;
    /** Size variant for the underlying themed buttons. */
    readonly size?: ButtonSize;
}

/**
 * Reusable site monitoring button that handles start/stop all monitoring.
 *
 * @remarks
 * This component provides a consistent interface for site-wide monitoring
 * controls across different parts of the application. It automatically switches
 * between start and stop states based on whether all monitors are currently
 * running.
 *
 * Key features:
 *
 * - Automatic state switching based on monitor status
 * - Event propagation prevention to avoid parent element interactions
 * - Loading state handling with button disabling
 * - Compact mode for space-constrained layouts
 * - Consistent styling with theme integration
 *
 * The component uses the appropriate variant (success for start, error for
 * stop) and includes intuitive emoji icons for visual clarity.
 *
 * @example
 *
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
 *
 * @param props - Component configuration and event handlers
 *
 * @returns JSX element containing the themed monitoring button
 */
export const SiteMonitoringButton: NamedExoticComponent<SiteMonitoringButtonProperties> =
    memo(function SiteMonitoringButton({
        allMonitorsRunning,
        className = "",
        compact = false,
        disabledReason,
        isLoading,
        onStartSiteMonitoring,
        onStopSiteMonitoring,
        size = "sm",
    }: SiteMonitoringButtonProperties) {
        // UseCallback handlers for jsx-no-bind compliance
        const handleStopClick = useCallback(
            (event?: MouseEvent<HTMLButtonElement>) => {
                event?.stopPropagation();
                onStopSiteMonitoring();
            },
            [onStopSiteMonitoring]
        );

        const handleStartClick = useCallback(
            (event?: MouseEvent<HTMLButtonElement>) => {
                event?.stopPropagation();
                onStartSiteMonitoring();
            },
            [onStartSiteMonitoring]
        );

        const iconSize = size === "xs" ? 14 : 16;
        const StopIcon = AppIcons.actions.pauseFilled;
        const StartIcon = AppIcons.actions.playFilled;

        // Mirror ActionButtonGroup tooltip behaviour so site-level controls
        // surface a consistent reason when disabled.
        const decorateTooltip = useCallback(
            (baseMessage: string): string => {
                if (disabledReason === "unconfigured") {
                    return `${baseMessage} • Configure a monitor to enable this control.`;
                }
                if (disabledReason === "loading") {
                    return `${baseMessage} • Finishing the previous request.`;
                }
                return baseMessage;
            },
            [disabledReason]
        );

        if (allMonitorsRunning) {
            return (
                <Tooltip
                    content={decorateTooltip(
                        "Stop monitoring all monitors for this site"
                    )}
                    position="top"
                >
                    {(triggerProps) => (
                        <ThemedButton
                            {...triggerProps}
                            aria-label="Stop All Monitoring"
                            className={`flex items-center gap-1 ${className}`}
                            disabled={isLoading}
                            onClick={handleStopClick}
                            size={size}
                            variant="error"
                        >
                            <StopIcon size={iconSize} />
                            {!compact && (
                                <span className="hidden text-xs sm:inline">
                                    Stop All
                                </span>
                            )}
                        </ThemedButton>
                    )}
                </Tooltip>
            );
        }

        return (
            <Tooltip
                content={decorateTooltip(
                    "Start monitoring all monitors for this site"
                )}
                position="top"
            >
                {(triggerProps) => (
                    <ThemedButton
                        {...triggerProps}
                        aria-label="Start All Monitoring"
                        className={`flex items-center gap-1 ${className}`}
                        disabled={isLoading}
                        onClick={handleStartClick}
                        size={size}
                        variant="success"
                    >
                        <StartIcon size={iconSize} />
                        {!compact && (
                            <span className="hidden text-xs sm:inline">
                                Start All
                            </span>
                        )}
                    </ThemedButton>
                )}
            </Tooltip>
        );
    });
