/**
 * UI store slice for {@link src/hooks/site/useSiteDetails#useSiteDetails}.
 *
 * @remarks
 * Extracted to keep the main hook focused on derived state and domain
 * orchestration.
 */

import { useShallow } from "zustand/react/shallow";

import type { SiteDetailsTab, UIStore } from "../../stores/ui/types";

import { useUIStore } from "../../stores/ui/useUiStore";

type SiteDetailsUiStoreSlice = Pick<
    UIStore,
    | "activeSiteDetailsTab"
    | "setActiveSiteDetailsTab"
    | "setShowAdvancedMetrics"
    | "setSiteDetailsChartTimeRange"
    | "showAdvancedMetrics"
    | "siteDetailsChartTimeRange"
    | "syncActiveSiteDetailsTab"
>;

const noopSyncActiveSiteDetailsTab: UIStore["syncActiveSiteDetailsTab"] =
    () => {
        // no-op
    };

const selectSiteDetailsUiStoreSlice = (
    state: UIStore
): SiteDetailsUiStoreSlice => ({
    activeSiteDetailsTab: state.activeSiteDetailsTab,
    setActiveSiteDetailsTab: state.setActiveSiteDetailsTab,
    setShowAdvancedMetrics: state.setShowAdvancedMetrics,
    setSiteDetailsChartTimeRange: state.setSiteDetailsChartTimeRange,
    showAdvancedMetrics: state.showAdvancedMetrics,
    siteDetailsChartTimeRange: state.siteDetailsChartTimeRange,
    syncActiveSiteDetailsTab:
        typeof state.syncActiveSiteDetailsTab === "function"
            ? state.syncActiveSiteDetailsTab
            : noopSyncActiveSiteDetailsTab,
});

/**
 * Reads the UI store slice used by
 * {@link src/hooks/site/useSiteDetails#useSiteDetails}.
 */
export function useSiteDetailsUiStore(): {
    readonly activeSiteDetailsTab: SiteDetailsTab;
    readonly setActiveSiteDetailsTab: UIStore["setActiveSiteDetailsTab"];
    readonly setShowAdvancedMetrics: UIStore["setShowAdvancedMetrics"];
    readonly setSiteDetailsChartTimeRange: UIStore["setSiteDetailsChartTimeRange"];
    readonly showAdvancedMetrics: boolean;
    readonly siteDetailsChartTimeRange: UIStore["siteDetailsChartTimeRange"];
    readonly syncActiveSiteDetailsTab: UIStore["syncActiveSiteDetailsTab"];
} {
    return useUIStore(useShallow(selectSiteDetailsUiStoreSlice));
}
