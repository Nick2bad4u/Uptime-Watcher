/**
 * HealthIndicator component for displaying overall system health.
 *
 * @remarks
 * This component displays a health dot with status and percentage, reducing
 * nesting complexity in the main Header component.
 */

import type { JSX } from "react";

import { ThemedText } from "../../theme/components/ThemedText";

/**
 * Properties for the HealthIndicator component.
 */
interface HealthIndicatorProperties {
    /** Function to get availability color */
    readonly getAvailabilityColor: (percentage: number) => string;
    /** The uptime percentage */
    readonly uptimePercentage: number;
}

/**
 * HealthIndicator component for displaying system health status.
 *
 * @param props - The component properties
 *
 * @returns JSX element representing the health indicator
 */
export const HealthIndicator = ({
    getAvailabilityColor,
    uptimePercentage,
}: HealthIndicatorProperties): JSX.Element => {
    const healthColor = getAvailabilityColor(uptimePercentage);

    return (
        <div
            className="group health-badge flex items-center space-x-2 rounded-md px-3 py-1 transition-all duration-200"
            data-health-color={healthColor}
        >
            <div
                className="health-dot h-3 w-3 animate-pulse rounded-full"
                data-health-color={healthColor}
            />
            <div className="flex flex-col">
                <ThemedText
                    className="health-text"
                    data-health-color={healthColor}
                    size="sm"
                    weight="bold"
                >
                    {uptimePercentage}%
                </ThemedText>
                <ThemedText
                    className="leading-none"
                    size="xs"
                    variant="secondary"
                >
                    Health
                </ThemedText>
            </div>
        </div>
    );
};
