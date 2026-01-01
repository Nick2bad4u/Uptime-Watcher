/**
 * Shared dashboard helper for producing commonly reused derived values for site
 * presentation.
 *
 * @remarks
 * Multiple dashboard layouts (card + table row) need the same derived values:
 *
 * - A stable dependency tuple for {@link MarqueeText}
 * - Computed monitor runtime summary (running/total and whether all are running)
 *
 * Centralizing the derivation prevents subtle drift and keeps jscpd noise down.
 */

import type { Site } from "@shared/types";

import { useMemo } from "react";

import { getMonitorRuntimeSummary } from "../../../utils/monitoring/monitorRuntime";

/**
 * Computed metadata shared across dashboard site presentations.
 */
export interface DashboardSiteSummaryMeta {
    /** True when every monitor is currently running. */
    readonly allRunning: boolean;
    /** Dependency tuple used for MarqueeText segment invalidation. */
    readonly marqueeDependencies: readonly [string, string];
    /** Number of currently running monitors. */
    readonly runningCount: number;
    /** Total number of monitors configured for the site. */
    readonly totalCount: number;
}

/**
 * Builds shared derived values used across dashboard site presentations.
 */
export function useDashboardSiteSummaryMeta(args: {
    readonly latestSiteName: string;
    readonly monitors: Site["monitors"];
    readonly siteIdentifier: string;
}): DashboardSiteSummaryMeta {
    const { latestSiteName, monitors, siteIdentifier } = args;

    const marqueeDependencies = useMemo(
        () => [latestSiteName, siteIdentifier] as const,
        [latestSiteName, siteIdentifier]
    );

    const runtimeSummary = useMemo(
        () => getMonitorRuntimeSummary(monitors),
        [monitors]
    );

    return useMemo(
        () => ({
            marqueeDependencies,
            ...runtimeSummary,
        }),
        [marqueeDependencies, runtimeSummary]
    );
}
