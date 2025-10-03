/**
 * Action button group component for site monitoring operations.
 *
 * @remarks
 * Provides a unified interface for site check, start/stop monitoring actions
 * with consistent theming and accessibility support.
 */

import {
    memo,
    type MouseEvent,
    type NamedExoticComponent,
    useCallback,
} from "react";

import type { ButtonSize } from "../../../../theme/components/types";

import { ThemedButton } from "../../../../theme/components/ThemedButton";
import { AppIcons } from "../../../../utils/icons";
import {
    SiteMonitoringButton,
    type SiteMonitoringDisabledReason,
} from "../../../common/SiteMonitoringButton/SiteMonitoringButton";
import { Tooltip } from "../../../common/Tooltip/Tooltip";

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
    /** Size variant for rendered buttons (defaults to `sm`). */
    readonly buttonSize?: ButtonSize;
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
export const ActionButtonGroup: NamedExoticComponent<ActionButtonGroupProperties> =
    memo(function ActionButtonGroup({
        allMonitorsRunning,
        buttonSize = "sm",
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
            (event?: MouseEvent<HTMLButtonElement>) => {
                event?.stopPropagation();
                onCheckNow();
            },
            [onCheckNow]
        );

        const handleStartMonitoringClick = useCallback(
            (event?: MouseEvent<HTMLButtonElement>) => {
                event?.stopPropagation();
                onStartMonitoring();
            },
            [onStartMonitoring]
        );

        const handleStopMonitoringClick = useCallback(
            (event?: MouseEvent<HTMLButtonElement>) => {
                event?.stopPropagation();
                onStopMonitoring();
            },
            [onStopMonitoring]
        );

        const clusterGapClass = buttonSize === "xs" ? "gap-1.5" : "gap-2";
        const iconSize = buttonSize === "xs" ? 14 : 16;

        const RefreshIcon = AppIcons.actions.refresh;
        const PauseIcon = AppIcons.actions.pause;
        const PlayIcon = AppIcons.actions.play;

        let disabledContext: null | SiteMonitoringDisabledReason = null;

        if (disabled) {
            disabledContext = "unconfigured";
        } else if (isLoading) {
            disabledContext = "loading";
        }

        // Ensure tooltip copy explains why a control is disabled without
        // masking the primary action description.
        const buildActionTooltip = useCallback(
            (baseMessage: string): string => {
                if (disabledContext === "unconfigured") {
                    return `${baseMessage} • Select a monitor to enable this action.`;
                }
                if (disabledContext === "loading") {
                    return `${baseMessage} • Finishing the previous request.`;
                }
                return baseMessage;
            },
            [disabledContext]
        );

        return (
            <div className={`flex flex-wrap items-center ${clusterGapClass}`}>
                <Tooltip
                    content={buildActionTooltip(
                        "Trigger an immediate availability check"
                    )}
                    position="top"
                >
                    {(triggerProps) => (
                        <ThemedButton
                            {...triggerProps}
                            aria-label="Check Now"
                            className="min-w-8"
                            disabled={isLoading || disabled}
                            onClick={handleCheckNowClick}
                            size={buttonSize}
                            variant="ghost"
                        >
                            <RefreshIcon size={iconSize} />
                        </ThemedButton>
                    )}
                </Tooltip>

                <SiteMonitoringButton
                    allMonitorsRunning={allMonitorsRunning}
                    className="min-w-8"
                    compact
                    isLoading={isLoading || disabled}
                    onStartSiteMonitoring={onStartSiteMonitoring}
                    onStopSiteMonitoring={onStopSiteMonitoring}
                    size={buttonSize}
                    {...(disabledContext
                        ? { disabledReason: disabledContext }
                        : {})}
                />

                {isMonitoring ? (
                    <Tooltip
                        content={buildActionTooltip(
                            "Pause monitoring for this monitor"
                        )}
                        position="top"
                    >
                        {(triggerProps) => (
                            <ThemedButton
                                {...triggerProps}
                                aria-label="Stop Monitoring"
                                className="min-w-8"
                                disabled={isLoading || disabled}
                                onClick={handleStopMonitoringClick}
                                size={buttonSize}
                                variant="error"
                            >
                                <PauseIcon size={iconSize} />
                            </ThemedButton>
                        )}
                    </Tooltip>
                ) : (
                    <Tooltip
                        content={buildActionTooltip(
                            "Resume monitoring for this monitor"
                        )}
                        position="top"
                    >
                        {(triggerProps) => (
                            <ThemedButton
                                {...triggerProps}
                                aria-label="Start Monitoring"
                                className="min-w-8"
                                disabled={isLoading || disabled}
                                onClick={handleStartMonitoringClick}
                                size={buttonSize}
                                variant="success"
                            >
                                <PlayIcon size={iconSize} />
                            </ThemedButton>
                        )}
                    </Tooltip>
                )}
            </div>
        );
    });
