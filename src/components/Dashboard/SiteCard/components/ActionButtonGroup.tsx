/**
 * Action button group component for site monitoring operations.
 * Provides a unified interface for site check, start/stop monitoring actions.
 */

import React, { useCallback } from "react";

import { ThemedButton } from "../../../../theme";

/**
 * Props for the ActionButtonGroup component.
 */
interface ActionButtonGroupProperties {
    /** Callback function to trigger immediate site check */
    onCheckNow: () => void;
    /** Callback function to start monitoring */
    onStartMonitoring: () => void;
    /** Callback function to stop monitoring */
    onStopMonitoring: () => void;
    /** Whether any operation is currently loading */
    isLoading: boolean;
    /** Whether monitoring is currently active */
    isMonitoring: boolean;
    /** Whether all buttons should be disabled */
    disabled: boolean;
}

/**
 * Reusable action button group component for site monitoring operations.
 *
 * Features:
 * - Unified interface for check now, start/stop monitoring actions
 * - Proper event handling with stopPropagation on individual buttons to prevent card click conflicts
 * - Optimized with React.memo and useCallback to prevent unnecessary re-renders
 * - Accessibility support with proper ARIA labels and native button elements
 * - Visual feedback for loading and disabled states
 *
 * @param props - Component props
 * @returns JSX element containing action buttons
 *
 * @example
 * ```tsx
 * <ActionButtonGroup
 *   onCheckNow={handleCheckNow}
 *   onStartMonitoring={handleStart}
 *   onStopMonitoring={handleStop}
 *   isLoading={false}
 *   isMonitoring={true}
 *   disabled={false}
 * />
 * ```
 */
export const ActionButtonGroup = React.memo(function ActionButtonGroup({
    disabled,
    isLoading,
    isMonitoring,
    onCheckNow,
    onStartMonitoring,
    onStopMonitoring,
}: ActionButtonGroupProperties) {
    // Create individual wrapped handlers for each button with event propagation control
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
                variant="ghost"
                size="sm"
                onClick={handleCheckNowClick}
                className="min-w-[32px]"
                aria-label="Check Now"
                disabled={isLoading || disabled}
            >
                <span>🔄</span>
            </ThemedButton>

            {isMonitoring ? (
                <ThemedButton
                    variant="error"
                    size="sm"
                    onClick={handleStopMonitoringClick}
                    className="min-w-[32px]"
                    aria-label="Stop Monitoring"
                    disabled={isLoading || disabled}
                >
                    ⏸️
                </ThemedButton>
            ) : (
                <ThemedButton
                    variant="success"
                    size="sm"
                    onClick={handleStartMonitoringClick}
                    className="min-w-[32px]"
                    aria-label="Start Monitoring"
                    disabled={isLoading || disabled}
                >
                    ▶️
                </ThemedButton>
            )}
        </div>
    );
});
