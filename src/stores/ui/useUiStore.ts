/**
 * UI store for managing user interface state and interactions.
 *
 * @remarks
 * This store manages the global UI state including modal visibility, selected
 * site, active tabs, and user preferences. It uses Zustand persistence to
 * maintain user preferences across sessions while keeping transient state (like
 * modal visibility) in memory only.
 *
 * The store follows the application's modular architecture by separating UI
 * concerns from business logic, allowing components to focus on presentation
 * while delegating state management to this centralized store.
 *
 * @example
 *
 * ```typescript
 * import { useUIStore } from './stores/ui/useUiStore';
 *
 * function MyComponent() {
 *   const { showSettings, setShowSettings } = useUIStore();
 *
 *   return (
 *     <button onClick={() => setShowSettings(true)}>
 *       Open Settings
 *     </button>
 *   );
 * }
 * ```
 *
 * @public
 */

import type { Site } from "@shared/types";

import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist, type PersistOptions } from "zustand/middleware";

import type { ChartTimeRange } from "../types";
import type {
    SiteCardPresentation,
    SiteListLayoutMode,
    UIStore,
} from "./types";

import { logger } from "../../services/logger";
import { SystemService } from "../../services/SystemService";
import { logStoreAction } from "../utils";

interface UIPersistedState {
    activeSiteDetailsTab: string;
    showAdvancedMetrics: boolean;
    siteCardPresentation: SiteCardPresentation;
    siteDetailsChartTimeRange: ChartTimeRange;
    siteDetailsTabState: Record<string, string>;
    siteListLayout: SiteListLayoutMode;
}

/**
 * Interface for the UI store with persistence capabilities.
 */
type UIStoreWithPersist = UseBoundStore<
    Omit<StoreApi<UIStore>, "persist"> & {
        persist: {
            clearStorage: () => void;
            getOptions: () => Partial<
                PersistOptions<UIStore, UIPersistedState>
            >;
            hasHydrated: () => boolean;
            onFinishHydration: (fn: (state: UIStore) => void) => () => void;
            onHydrate: (fn: (state: UIStore) => void) => () => void;
            rehydrate: () => Promise<void> | void;
            setOptions: (
                options: Partial<PersistOptions<UIStore, UIPersistedState>>
            ) => void;
        };
    }
>;

/**
 * Zustand store for managing UI state and user interface interactions.
 *
 * @remarks
 * This store provides centralized management of UI state including modal
 * visibility, tab selections, and user preferences with automatic persistence
 * for settings that should survive session restarts.
 *
 * @public
 */
export const useUIStore: UIStoreWithPersist = create<UIStore>()(
    persist(
        (set) => ({
            activeSiteDetailsTab: "site-overview",
            openExternal: (
                url: string,
                context?: { siteName?: string }
            ): void => {
                logStoreAction("UIStore", "openExternal", { context, url });

                logger.user.action("External URL opened", {
                    url,
                    ...(context && { siteName: context.siteName }),
                });

                /* eslint-disable-next-line promise/prefer-await-to-then -- Fire-and-forget pattern for external URL opening */
                void SystemService.openExternal(url).catch(() => {
                    window.open(url, "_blank", "noopener");
                });
            },
            selectedSiteId: undefined,
            selectSite: (site: Site | undefined): void => {
                logStoreAction("UIStore", "selectSite", { site });
                set({ selectedSiteId: site ? site.identifier : undefined });
            },
            setActiveSiteDetailsTab: (tab: string): void => {
                logStoreAction("UIStore", "setActiveSiteDetailsTab", { tab });
                set((state) => {
                    const { selectedSiteId, siteDetailsTabState } = state;
                    if (!selectedSiteId) {
                        return { activeSiteDetailsTab: tab };
                    }

                    return {
                        activeSiteDetailsTab: tab,
                        siteDetailsTabState: {
                            ...siteDetailsTabState,
                            [selectedSiteId]: tab,
                        },
                    };
                });
            },
            setShowAddSiteModal: (show: boolean): void => {
                logStoreAction("UIStore", "setShowAddSiteModal", { show });
                set({ showAddSiteModal: show });
            },
            setShowAdvancedMetrics: (show: boolean): void => {
                logStoreAction("UIStore", "setShowAdvancedMetrics", { show });
                set({ showAdvancedMetrics: show });
            },
            setShowSettings: (show: boolean): void => {
                logStoreAction("UIStore", "setShowSettings", { show });
                set({ showSettings: show });
            },
            setShowSiteDetails: (show: boolean): void => {
                logStoreAction("UIStore", "setShowSiteDetails", { show });
                set({ showSiteDetails: show });
            },
            setSiteCardPresentation: (
                presentation: SiteCardPresentation
            ): void => {
                logStoreAction("UIStore", "setSiteCardPresentation", {
                    presentation,
                });
                set({ siteCardPresentation: presentation });
            },
            setSiteDetailsChartTimeRange: (range: ChartTimeRange): void => {
                logStoreAction("UIStore", "setSiteDetailsChartTimeRange", {
                    range,
                });
                set({ siteDetailsChartTimeRange: range });
            },
            setSiteListLayout: (layout: SiteListLayoutMode): void => {
                logStoreAction("UIStore", "setSiteListLayout", { layout });
                set({ siteListLayout: layout });
            },
            showAddSiteModal: false,
            showAdvancedMetrics: false,
            showSettings: false,
            showSiteDetails: false,
            siteCardPresentation: "grid",
            siteDetailsChartTimeRange: "24h",
            siteDetailsTabState: {},
            siteListLayout: "card-large",
            syncActiveSiteDetailsTab: (siteId: string): void => {
                logStoreAction("UIStore", "syncActiveSiteDetailsTab", {
                    siteId,
                });
                set((state) => ({
                    activeSiteDetailsTab:
                        state.siteDetailsTabState[siteId] ?? "site-overview",
                }));
            },
        }),
        {
            name: "uptime-watcher-ui",
            /**
             * Partialize function for selective state persistence.
             *
             * @remarks
             * This function determines which parts of the UI state should be
             * persisted across browser sessions. It includes user preferences
             * and settings that should be remembered, while excluding transient
             * state like modal visibility and selected site which should reset
             * on each session.
             *
             * Persisted state:
             *
             * - ActiveSiteDetailsTab: Remember which tab was last active
             * - ShowAdvancedMetrics: User preference for advanced metrics
             *   visibility
             * - SiteDetailsTabState: Per-site tab preferences for the details
             *   modal
             * - SiteDetailsChartTimeRange: User preference for chart time range
             *
             * Non-persisted state:
             *
             * - Modal states (showSettings, showSiteDetails): Reset on each
             *   session - selectedSiteId: Reset on each session for
             *   security/privacy
             */
            partialize: (state) => ({
                activeSiteDetailsTab: state.activeSiteDetailsTab,
                showAdvancedMetrics: state.showAdvancedMetrics,
                siteCardPresentation: state.siteCardPresentation,
                siteDetailsChartTimeRange: state.siteDetailsChartTimeRange,
                siteDetailsTabState: state.siteDetailsTabState,
                siteListLayout: state.siteListLayout,
                // Don't persist modal states or selected site
            }),
        }
    )
);
