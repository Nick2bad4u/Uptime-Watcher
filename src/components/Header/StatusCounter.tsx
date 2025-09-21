/**
 * StatusCounter component for displaying status counts in the header.
 *
 * @remarks
 * This component displays a status indicator with count and label, reducing
 * nesting complexity in the main Header component.
 */

import type { JSX } from "react";

import { StatusIndicator } from "../../theme/components/StatusIndicator";
import { ThemedText } from "../../theme/components/ThemedText";

/**
 * Properties for the StatusCounter component.
 */
interface StatusCounterProperties {
    /** Additional CSS classes */
    readonly className?: string;
    /** The count to display */
    readonly count: number;
    /** The label text to display */
    readonly label: string;
    /** The status type for the indicator */
    readonly status: "degraded" | "down" | "up";
}

/**
 * StatusCounter component for displaying status counts with indicators.
 *
 * @param props - The component properties
 *
 * @returns JSX element representing the status counter
 */
export const StatusCounter = ({
    className = "",
    count,
    label,
    status,
}: StatusCounterProperties): JSX.Element => (
    <div
        className={`group flex items-center space-x-2 rounded-md px-2 py-1 transition-all duration-200 ${className}`}
    >
        <StatusIndicator size="sm" status={status} />
        <div className="flex flex-col">
            <ThemedText size="sm" variant="primary" weight="semibold">
                {count}
            </ThemedText>
            <ThemedText
                className="leading-none"
                size="xs"
                variant="secondary"
                weight="medium"
            >
                {label}
            </ThemedText>
        </div>
    </div>
);
