/**
 * Response time analysis card.
 *
 * @remarks
 * Extracted from {@link AnalyticsTab}.
 */

import type { JSX } from "react/jsx-runtime";

import { useMemo } from "react";

import type { Theme } from "../../../../theme/types";

import { ThemedButton } from "../../../../theme/components/ThemedButton";
import { ThemedCard } from "../../../../theme/components/ThemedCard";
import { ThemedText } from "../../../../theme/components/ThemedText";
import { AppIcons } from "../../../../utils/icons";

const getMttrColor = (mttrValue: number, theme: Theme): string =>
    mttrValue === 0 ? theme.colors.success : theme.colors.error;

const getIncidentsColor = (incidentCount: number, theme: Theme): string =>
    incidentCount === 0 ? theme.colors.success : theme.colors.error;

/**
 * Props for {@link ResponseTimeAnalysisCard}.
 *
 * @public
 */
export interface ResponseTimeAnalysisCardProperties {
    readonly currentTheme: Theme;
    readonly formatDuration: (ms: number) => string;
    readonly formatResponseTime: (time: number) => string;
    readonly getResponseTimeColor: (responseTime: number) => string;
    readonly incidentCount: number;
    readonly mttr: number;
    readonly onToggleAdvancedMetrics: () => void;
    readonly p50: number;
    readonly p95: number;
    readonly p99: number;
    readonly showAdvancedMetrics: boolean;
}

/**
 * Renders response-time percentile metrics and optional advanced metrics.
 *
 * @public
 */
export const ResponseTimeAnalysisCard = ({
    currentTheme,
    formatDuration,
    formatResponseTime,
    getResponseTimeColor,
    incidentCount,
    mttr,
    onToggleAdvancedMetrics,
    p50,
    p95,
    p99,
    showAdvancedMetrics,
}: ResponseTimeAnalysisCardProperties): JSX.Element => {
    const ResponseIcon = AppIcons.metrics.response;
    const ExpandIcon = AppIcons.ui.expand;
    const CollapseIcon = AppIcons.ui.collapse;

    const toggleIcon = showAdvancedMetrics ? <CollapseIcon /> : <ExpandIcon />;
    const toggleLabel = showAdvancedMetrics ? "Hide" : "Show";

    const speedIconColored = useMemo(
        () => <ResponseIcon color={getResponseTimeColor(p50)} />,
        [
            getResponseTimeColor,
            p50,
            ResponseIcon,
        ]
    );

    // Memoized style objects to prevent object recreation
    const fiftiethPercentileStyle = useMemo(
        () => ({ color: getResponseTimeColor(p50) }),
        [getResponseTimeColor, p50]
    );
    const ninetyFifthPercentileStyle = useMemo(
        () => ({ color: getResponseTimeColor(p95) }),
        [getResponseTimeColor, p95]
    );
    const ninetyNinthPercentileStyle = useMemo(
        () => ({ color: getResponseTimeColor(p99) }),
        [getResponseTimeColor, p99]
    );
    const mttrStyle = useMemo(
        () => ({
            color: getMttrColor(mttr, currentTheme),
        }),
        [currentTheme, mttr]
    );
    const incidentsStyle = useMemo(
        () => ({
            color: getIncidentsColor(incidentCount, currentTheme),
        }),
        [currentTheme, incidentCount]
    );

    return (
        <ThemedCard icon={speedIconColored} title="Response Time Analysis">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <ThemedText size="lg" weight="semibold">
                        Percentile Analysis
                    </ThemedText>
                    <ThemedButton
                        icon={toggleIcon}
                        onClick={onToggleAdvancedMetrics}
                        size="sm"
                        variant="ghost"
                    >
                        {toggleLabel} Advanced
                    </ThemedButton>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center text-center">
                        <ThemedText
                            className="mb-2"
                            size="sm"
                            variant="secondary"
                        >
                            P50
                        </ThemedText>
                        <ThemedText
                            size="lg"
                            style={fiftiethPercentileStyle}
                            weight="medium"
                        >
                            {formatResponseTime(p50)}
                        </ThemedText>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <ThemedText
                            className="mb-2"
                            size="sm"
                            variant="secondary"
                        >
                            P95
                        </ThemedText>
                        <ThemedText
                            size="lg"
                            style={ninetyFifthPercentileStyle}
                            weight="medium"
                        >
                            {formatResponseTime(p95)}
                        </ThemedText>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <ThemedText
                            className="mb-2"
                            size="sm"
                            variant="secondary"
                        >
                            P99
                        </ThemedText>
                        <ThemedText
                            size="lg"
                            style={ninetyNinthPercentileStyle}
                            weight="medium"
                        >
                            {formatResponseTime(p99)}
                        </ThemedText>
                    </div>
                </div>

                {showAdvancedMetrics ? (
                    <div className="border-primary/20 grid grid-cols-2 gap-4 border-t pt-4">
                        <div className="flex flex-col items-center text-center">
                            <ThemedText
                                className="mb-2"
                                size="sm"
                                variant="secondary"
                            >
                                Mean Time To Recovery
                            </ThemedText>
                            <ThemedText
                                size="lg"
                                style={mttrStyle}
                                weight="medium"
                            >
                                {formatDuration(mttr)}
                            </ThemedText>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <ThemedText
                                className="mb-2"
                                size="sm"
                                variant="secondary"
                            >
                                Incidents
                            </ThemedText>
                            <ThemedText
                                size="lg"
                                style={incidentsStyle}
                                weight="medium"
                            >
                                {incidentCount}
                            </ThemedText>
                        </div>
                    </div>
                ) : null}
            </div>
        </ThemedCard>
    );
};
