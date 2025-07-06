/**
 * UI store for managing user interface state and interactions.
 * Handles modal visibility, selected states, and UI preferences.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ChartTimeRange, Site } from "../types";
import type { UIStore } from "./types";

import { useSitesStore } from "../sites/useSitesStore";
import { logStoreAction } from "../utils";

export const useUIStore = create<UIStore>()(
    persist(
        (set, get) => ({
            // State
            activeSiteDetailsTab: "site-overview",
            // Actions
            getSelectedSite: () => {
                const { selectedSiteId } = get();
                if (!selectedSiteId) return undefined;

                const sitesStore = useSitesStore.getState();
                return sitesStore.sites.find((s) => s.identifier === selectedSiteId) || undefined;
            },
            selectedSiteId: undefined,
            setActiveSiteDetailsTab: (tab: string) => {
                logStoreAction("UIStore", "setActiveSiteDetailsTab", { tab });
                set({ activeSiteDetailsTab: tab });
            },
            setSelectedSite: (site: Site | undefined) => {
                logStoreAction("UIStore", "setSelectedSite", { site });
                set({ selectedSiteId: site ? site.identifier : undefined });
            },
            setShowAdvancedMetrics: (show: boolean) => {
                logStoreAction("UIStore", "setShowAdvancedMetrics", { show });
                set({ showAdvancedMetrics: show });
            },
            setShowSettings: (show: boolean) => {
                logStoreAction("UIStore", "setShowSettings", { show });
                set({ showSettings: show });
            },
            setShowSiteDetails: (show: boolean) => {
                logStoreAction("UIStore", "setShowSiteDetails", { show });
                set({ showSiteDetails: show });
            },
            setSiteDetailsChartTimeRange: (range: ChartTimeRange) => {
                logStoreAction("UIStore", "setSiteDetailsChartTimeRange", { range });
                set({ siteDetailsChartTimeRange: range });
            },
            showAdvancedMetrics: false,
            showSettings: false,
            showSiteDetails: false,
            siteDetailsChartTimeRange: "24h",
        }),
        {
            name: "uptime-watcher-ui",
            partialize: (state) => ({
                activeSiteDetailsTab: state.activeSiteDetailsTab,
                showAdvancedMetrics: state.showAdvancedMetrics,
                siteDetailsChartTimeRange: state.siteDetailsChartTimeRange,
                // Don't persist modal states or selected site
            }),
        }
    )
);
