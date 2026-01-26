/**
 * Analytics key metrics grid.
 *
 * @remarks
 * Extracted from {@link AnalyticsTab} to keep the main tab component smaller
 * and to isolate presentation-specific structure.
 */

import type { MonitorType } from "@shared/types";

import { type ComponentProps, type JSX, useMemo } from "react";

import { ThemedBadge } from "../../../../theme/components/ThemedBadge";
import { ThemedCard } from "../../../../theme/components/ThemedCard";
import { ThemedProgress } from "../../../../theme/components/ThemedProgress";
import { ThemedText } from "../../../../theme/components/ThemedText";
import { AppIcons } from "../../../../utils/icons";
import { ConditionalResponseTime } from "../../../common/MonitorUiComponents";

/**
 * Theme-derived icon colors used throughout analytics UI.
 *
 * @public
 */
export interface AnalyticsIconColors {
    readonly analytics: string;
    readonly charts: string;
    readonly downtime: string;
    readonly performance: string;
    readonly uptime: string;
}

type ProgressVariant = ComponentProps<typeof ThemedProgress>["variant"];

type StrictProgressVariant = Exclude<ProgressVariant, undefined>;
type BadgeVariant = Exclude<ComponentProps<typeof ThemedBadge>["variant"], undefined>;

/**
 * Props for {@link AnalyticsKeyMetricsGrid}.
 *
 * @public
 */
export interface AnalyticsKeyMetricsGridProperties {
    readonly avgResponseTime: number;
    readonly downCount: number;
    readonly downtimeIncidentCount: number;
    readonly formatAvailabilityDescription: (percentage: number) => string;
    readonly formatDuration: (ms: number) => string;
    readonly formatResponseTime: (time: number) => string;
    readonly iconColors: AnalyticsIconColors;
    readonly monitorType: MonitorType;
    readonly progressVariant: StrictProgressVariant;
    readonly totalChecks: number;
    readonly totalDowntime: number;
    readonly upCount: number;
    readonly uptime: string;
    readonly uptimeValue: number;
}

/**
 * Renders the primary analytics KPIs as a responsive grid.
 *
 * @public
 */
export const AnalyticsKeyMetricsGrid = ({
    avgResponseTime,
    downCount,
    downtimeIncidentCount,
    formatAvailabilityDescription,
    formatDuration,
    formatResponseTime,
    iconColors,
    monitorType,
    progressVariant,
    totalChecks,
    totalDowntime,
    upCount,
    uptime,
    uptimeValue,
}: AnalyticsKeyMetricsGridProperties): JSX.Element => {
    const UptimeIcon = AppIcons.metrics.uptime;
    const ResponseIcon = AppIcons.metrics.response;
    const IncidentsIcon = AppIcons.metrics.incidents;
    const ListIcon = AppIcons.layout.listAlt;
    const UpIcon = AppIcons.status.up;
    const DownIcon = AppIcons.status.down;

    const uptimeIcon = useMemo(() => <UptimeIcon />, [UptimeIcon]);
    const responseIcon = useMemo(() => <ResponseIcon />, [ResponseIcon]);
    const incidentsIcon = useMemo(() => <IncidentsIcon />, [IncidentsIcon]);
    const checksIcon = useMemo(() => <ListIcon />, [ListIcon]);
    const upCountIcon = useMemo(
        () => <UpIcon aria-hidden className="size-4" />,
        [UpIcon]
    );
    const downCountIcon = useMemo(
        () => <DownIcon aria-hidden className="size-4" />,
        [DownIcon]
    );

    const badgeVariant = progressVariant as BadgeVariant;

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <ThemedCard
                className="flex flex-col items-center text-center"
                hoverable
                icon={uptimeIcon}
                iconColor={iconColors.uptime}
                title="Availability"
            >
                <div className="flex flex-col items-center space-y-2">
                    <ThemedProgress
                        className="flex flex-col items-center"
                        showLabel
                        value={uptimeValue}
                        variant={progressVariant}
                    />
                    <ThemedBadge size="sm" variant={badgeVariant}>
                        {uptime}%
                    </ThemedBadge>
                    <ThemedText size="xs" variant="secondary">
                        {formatAvailabilityDescription(uptimeValue)}
                    </ThemedText>
                </div>
            </ThemedCard>

            <ConditionalResponseTime monitorType={monitorType}>
                <ThemedCard
                    className="flex flex-col items-center text-center"
                    hoverable
                    icon={responseIcon}
                    iconColor={iconColors.performance}
                    title="Avg Response"
                >
                    <div className="flex flex-col items-center space-y-1">
                        <ThemedText size="xl" weight="bold">
                            {formatResponseTime(avgResponseTime)}
                        </ThemedText>
                        <ThemedText size="xs" variant="secondary">
                            {totalChecks} checks
                        </ThemedText>
                    </div>
                </ThemedCard>
            </ConditionalResponseTime>

            <ThemedCard
                className="flex flex-col items-center text-center"
                hoverable
                icon={incidentsIcon}
                iconColor={iconColors.downtime}
                title="Downtime"
            >
                <div className="flex flex-col items-center space-y-1">
                    <ThemedText size="xl" variant="error" weight="bold">
                        {formatDuration(totalDowntime)}
                    </ThemedText>
                    <ThemedText size="xs" variant="secondary">
                        {downtimeIncidentCount} incidents
                    </ThemedText>
                </div>
            </ThemedCard>

            <ThemedCard
                className="flex flex-col items-center text-center"
                hoverable
                icon={checksIcon}
                iconColor={iconColors.analytics}
                title="Total Checks"
            >
                <div className="flex flex-col items-center space-y-1">
                    <ThemedText size="xl" weight="bold">
                        {totalChecks.toLocaleString()}
                    </ThemedText>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <ThemedBadge
                            icon={upCountIcon}
                            size="sm"
                            variant="success"
                        >
                            Up: {upCount}
                        </ThemedBadge>
                        <ThemedBadge
                            icon={downCountIcon}
                            size="sm"
                            variant="error"
                        >
                            Down: {downCount}
                        </ThemedBadge>
                    </div>
                </div>
            </ThemedCard>
        </div>
    );
};
