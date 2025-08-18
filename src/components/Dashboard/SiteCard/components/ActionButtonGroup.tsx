/**
 * Action button group component for site monitoring operations.
 *
 * @remarks
 * Provides a unified interface for site check, start/stop monitoring actions
 * with consistent theming and accessibility support.
 */

import React, { useCallback } from "react";

import ThemedButton from "../../../../theme/components/ThemedButton";
import { SiteMonitoringButton } from "../../../common/SiteMonitoringButton/SiteMonitoringButton";

/**
 * Props for the ActionButtonGroup component.
 *
 * @public
 *
 * @see ActionButtonGroup
 */
export interface ActionButtonGroupProperties {
    /** Whether all monitors are currently running */
    readonly allMonitorsRunning: boolean;
    /** Whether all buttons should be disabled */
    readonly disabled: boolean;
    /** Whether any operation is currently loading */
    readonly isLoading: boolean;
    /** Whether monitoring is currently active */
    readonly isMonitoring: boolean;
    /** Callback function to trigger immediate site check */
    readonly onCheckNow: () => void;
    /** Callback function to start monitoring */
    readonly onStartMonitoring: () => void;
    /** Callback function to start site-wide monitoring */
    readonly onStartSiteMonitoring: () => void;
    /** Callback function to stop monitoring */
    readonly onStopMonitoring: () => void;
    /** Callback function to stop site-wide monitoring */
    readonly onStopSiteMonitoring: () => void;
}

/**
 * Reusable action button group component for site monitoring operations.
 *
 * Features:
 *
 * - Unified interface for check now, start/stop monitoring actions
 * - Proper event handling with stopPropagation on individual buttons to prevent
 *   card click conflicts - Optimized with React.memo and useCallback to prevent
 *   unnecessary re-renders - Accessibility support with proper ARIA labels and
 *   native button elements
 * - Visual feedback for loading and disabled states
 *
 * @example
 *
 * ```tsx
 * import { ActionButtonGroup } from "./components/ActionButtonGroup";
 *
 * <ActionButtonGroup
 *     onCheckNow={handleCheckNow}
 *     onStartMonitoring={handleStart}
 *     onStopMonitoring={handleStop}
 *     isLoading={false}
 *     isMonitoring={true}
 *     disabled={false}
 * />;
 * ```
 *
 * @param props - Component props
 *
 * @returns JSX element containing action buttons
 */
export const ActionButtonGroup: React.NamedExoticComponent<ActionButtonGroupProperties> =
    React.memo(function ActionButtonGroup({
        allMonitorsRunning,
        disabled,
        isLoading,
        isMonitoring,
        onCheckNow,
        onStartMonitoring,
        onStartSiteMonitoring,
        onStopMonitoring,
        onStopSiteMonitoring,
    }: ActionButtonGroupProperties) {
        // Create individual wrapped handlers for each button with event
        // propagation control
        const handleCheckNowClick = useCallback(
            (event?: React.MouseEvent<HTMLButtonElement>) => {
                event?.stopPropagation();
                onCheckNow();
            },
            [onCheckNow]
        );

        const handleStartMonitoringClick = useCallback(
            (event?: React.MouseEvent<HTMLButtonElement>) => {
                event?.stopPropagation();
                onStartMonitoring();
            },
            [onStartMonitoring]
        );

        const handleStopMonitoringClick = useCallback(
            (event?: React.MouseEvent<HTMLButtonElement>) => {
                event?.stopPropagation();
                onStopMonitoring();
            },
            [onStopMonitoring]
        );

        return (
            <div className="flex items-center gap-2">
                <ThemedButton
                    aria-label="Check Now"
                    className="min-w-8"
                    disabled={isLoading || disabled}
                    onClick={handleCheckNowClick}
                    size="sm"
                    variant="ghost"
                >
                    {/* Using emoji icon consistent with project's status icon system */}
                    <span>🔄</span>
                </ThemedButton>

                <SiteMonitoringButton
                    allMonitorsRunning={allMonitorsRunning}
                    className="min-w-8"
                    compact
                    isLoading={isLoading || disabled}
                    onStartSiteMonitoring={onStartSiteMonitoring}
                    onStopSiteMonitoring={onStopSiteMonitoring}
                />

                {isMonitoring ? (
                    <ThemedButton
                        aria-label="Stop Monitoring"
                        className="min-w-8"
                        disabled={isLoading || disabled}
                        onClick={handleStopMonitoringClick}
                        size="sm"
                        variant="error"
                    >
                        {/* Using emoji icon consistent with project's status icon system */}
                        ⏸️
                    </ThemedButton>
                ) : (
                    <ThemedButton
                        aria-label="Start Monitoring"
                        className="min-w-8"
                        disabled={isLoading || disabled}
                        onClick={handleStartMonitoringClick}
                        size="sm"
                        variant="success"
                    >
                        {/* Using emoji icon consistent with project's status icon system */}
                        ▶️
                    </ThemedButton>
                )}
            </div>
        );
    });
