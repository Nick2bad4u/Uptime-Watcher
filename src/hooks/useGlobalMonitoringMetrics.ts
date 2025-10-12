/**
 * React hook returning aggregated monitoring metrics for the dashboard.
 *
 * @remarks
 * Wraps {@link calculateGlobalMonitoringMetrics} with store bindings so React
 * components can consume the metrics with a single import. Results are memoized
 * to avoid re-computation unless the sites array changes.
 *
 * @public
 */

import { useCallback, useMemo } from "react";

import { useSitesStore } from "../stores/sites/useSitesStore";
import {
    calculateGlobalMonitoringMetrics,
    type GlobalMonitoringMetrics,
} from "../utils/monitoring/globalMetrics";

/**
 * Returns global monitoring metrics derived from the sites store.
 *
 * @returns Aggregated metrics describing the overall monitoring state.
 *
 * @public
 */
export function useGlobalMonitoringMetrics(): GlobalMonitoringMetrics {
    const sites = useSitesStore(useCallback((state) => state.sites, []));

    return useMemo(() => calculateGlobalMonitoringMetrics(sites), [sites]);
}
