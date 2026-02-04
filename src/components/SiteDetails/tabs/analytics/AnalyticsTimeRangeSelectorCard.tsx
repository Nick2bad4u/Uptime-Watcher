/**
 * Analytics time-range selector card.
 *
 * @remarks
 * Extracted from {@link AnalyticsTab} to keep the main tab component focused on
 * orchestration.
 */

import { type ComponentProps, type JSX, useMemo } from "react";

import type { ChartTimeRange } from "../../../../constants";

import { CHART_TIME_RANGES } from "../../../../constants";
import { ThemedButton } from "../../../../theme/components/ThemedButton";
import { ThemedCard } from "../../../../theme/components/ThemedCard";
import { ThemedText } from "../../../../theme/components/ThemedText";
import { AppIcons } from "../../../../utils/icons";

/**
 * Props for {@link AnalyticsTimeRangeSelectorCard}.
 *
 * @public
 */
export interface AnalyticsTimeRangeSelectorCardProperties {
    /** Selects a new time range. */
    readonly onSelectRange: (range: ChartTimeRange) => void;
    /** Currently selected time range. */
    readonly selectedRange: ChartTimeRange;
}

/**
 * Renders a card allowing the user to select the analytics time range.
 *
 * @public
 */
export const AnalyticsTimeRangeSelectorCard = ({
    onSelectRange,
    selectedRange,
}: AnalyticsTimeRangeSelectorCardProperties): JSX.Element => {
    const TimeIcon = AppIcons.metrics.time;
    const timeIcon = useMemo(() => <TimeIcon />, [TimeIcon]);

    type ButtonVariant = Exclude<
        ComponentProps<typeof ThemedButton>["variant"],
        undefined
    >;

    const rangeButtons = useMemo<
        Array<{
            readonly handleClick: () => void;
            readonly isSelected: boolean;
            readonly range: ChartTimeRange;
            readonly variant: ButtonVariant;
        }>
    >(
        () =>
            CHART_TIME_RANGES.map((range) => {
                const isSelected = selectedRange === range;
                const variant: ButtonVariant = isSelected
                    ? "primary"
                    : "secondary";

                return {
                    handleClick: (): void => {
                        onSelectRange(range);
                    },
                    isSelected,
                    range,
                    variant,
                };
            }),
        [onSelectRange, selectedRange]
    );

    return (
        <ThemedCard icon={timeIcon} title="Analytics Time Range">
            <div className="flex items-center justify-between">
                <ThemedText size="sm" variant="secondary">
                    Select time range for analytics data:
                </ThemedText>
                <div className="flex gap-2">
                    {rangeButtons.map((button) => (
                        <ThemedButton
                            aria-pressed={button.isSelected}
                            key={button.range}
                            onClick={button.handleClick}
                            size="sm"
                            variant={button.variant}
                        >
                            {button.range}
                        </ThemedButton>
                    ))}
                </div>
            </div>
        </ThemedCard>
    );
};
