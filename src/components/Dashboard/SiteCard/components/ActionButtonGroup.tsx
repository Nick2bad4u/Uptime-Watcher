import React, { useCallback } from "react";

import { ThemedButton } from "../../../../theme/components";

interface ActionButtonGroupProps {
    onCheckNow: () => void;
    onStartMonitoring: () => void;
    onStopMonitoring: () => void;
    isLoading: boolean;
    isMonitoring: boolean;
    disabled: boolean;
}

/**
 * Reusable action button group with proper event handling
 * Eliminates repetitive stopPropagation code by handling it centrally
 * Optimized with useCallback to prevent unnecessary re-renders
 */
export const ActionButtonGroup = React.memo(function ActionButtonGroup({
    disabled,
    isLoading,
    isMonitoring,
    onCheckNow,
    onStartMonitoring,
    onStopMonitoring,
}: ActionButtonGroupProps) {
    // Create individual wrapped handlers for each button
    const handleCheckNowClick = useCallback(() => {
        onCheckNow();
    }, [onCheckNow]);

    const handleStartMonitoringClick = useCallback(() => {
        onStartMonitoring();
    }, [onStartMonitoring]);

    const handleStopMonitoringClick = useCallback(() => {
        onStopMonitoring();
    }, [onStopMonitoring]);

    const handleContainerClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    return (
        <div className="flex items-center gap-2" onClick={handleContainerClick} onMouseDown={handleMouseDown}>
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
