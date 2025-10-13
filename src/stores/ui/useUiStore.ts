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
    SiteDetailsTab,
    SiteListLayoutMode,
    SiteTableColumnKey,
    UIStore,
} from "./types";

import { logger } from "../../services/logger";
import { SystemService } from "../../services/SystemService";
import { logStoreAction } from "../utils";

interface UIPersistedState {
    activeSiteDetailsTab: SiteDetailsTab;
    showAdvancedMetrics: boolean;
    siteCardPresentation: SiteCardPresentation;
    siteDetailsChartTimeRange: ChartTimeRange;
    siteDetailsHeaderCollapsedState: Record<string, boolean>;
    siteDetailsTabState: Record<string, SiteDetailsTab>;
    siteListLayout: SiteListLayoutMode;
    siteTableColumnWidths: Record<SiteTableColumnKey, number>;
}

const SITE_TABLE_COLUMN_KEYS: readonly SiteTableColumnKey[] = [
    "site",
    "monitor",
    "status",
    "uptime",
    "response",
    "running",
    "controls",
] as const;

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
            selectedSiteIdentifier: undefined,
            selectSite: (site: Site | undefined): void => {
                logStoreAction("UIStore", "selectSite", { site });
                set({
                    selectedSiteIdentifier: site ? site.identifier : undefined,
                });
            },
            setActiveSiteDetailsTab: (tab: SiteDetailsTab): void => {
                logStoreAction("UIStore", "setActiveSiteDetailsTab", { tab });
                set((state) => {
                    const { selectedSiteIdentifier, siteDetailsTabState } =
                        state;
                    if (!selectedSiteIdentifier) {
                        return { activeSiteDetailsTab: tab };
                    }

                    return {
                        activeSiteDetailsTab: tab,
                        siteDetailsTabState: {
                            ...siteDetailsTabState,
                            [selectedSiteIdentifier]: tab,
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
            setSiteDetailsHeaderCollapsed: (
                siteIdentifier: string,
                collapsed: boolean
            ): void => {
                logStoreAction("UIStore", "setSiteDetailsHeaderCollapsed", {
                    collapsed,
                    siteIdentifier,
                });
                set((state) => ({
                    siteDetailsHeaderCollapsedState: {
                        ...state.siteDetailsHeaderCollapsedState,
                        [siteIdentifier]: collapsed,
                    },
                }));
            },
            setSiteListLayout: (layout: SiteListLayoutMode): void => {
                logStoreAction("UIStore", "setSiteListLayout", { layout });
                set({ siteListLayout: layout });
            },
            setSiteTableColumnWidths: (
                widths: Partial<Record<SiteTableColumnKey, number>>
            ): void => {
                logStoreAction("UIStore", "setSiteTableColumnWidths", {
                    widths,
                });
                set((state) => {
                    const updated: Record<SiteTableColumnKey, number> = {
                        ...state.siteTableColumnWidths,
                    };

                    for (const columnKey of SITE_TABLE_COLUMN_KEYS) {
                        const width = widths[columnKey];
                        if (width !== undefined && !Number.isNaN(width)) {
                            updated[columnKey] = width;
                        }
                    }

                    return {
                        siteTableColumnWidths: updated,
                    };
                });
            },
            showAddSiteModal: false,
            showAdvancedMetrics: false,
            showSettings: false,
            showSiteDetails: false,
            siteCardPresentation: "stacked",
            siteDetailsChartTimeRange: "24h",
            siteDetailsHeaderCollapsedState: {},
            siteDetailsTabState: {} as Record<string, SiteDetailsTab>,
            siteListLayout: "card-large",
            /**
             * Default width allocation (percentages) for list mode columns.
             */
            siteTableColumnWidths: {
                controls: 16,
                monitor: 14,
                response: 12,
                running: 10,
                site: 24,
                status: 12,
                uptime: 12,
            },
            syncActiveSiteDetailsTab: (siteIdentifier: string): void => {
                logStoreAction("UIStore", "syncActiveSiteDetailsTab", {
                    siteIdentifier,
                });
                set((state) => {
                    const existingTab =
                        state.siteDetailsTabState[siteIdentifier];

                    if (existingTab === undefined) {
                        return {
                            activeSiteDetailsTab: "site-overview",
                            siteDetailsTabState: {
                                ...state.siteDetailsTabState,
                                [siteIdentifier]: "site-overview",
                            },
                        };
                    }

                    return {
                        activeSiteDetailsTab: existingTab,
                        siteDetailsTabState: state.siteDetailsTabState,
                    };
                });
            },
            toggleSiteDetailsHeaderCollapsed: (
                siteIdentifier: string
            ): void => {
                logStoreAction("UIStore", "toggleSiteDetailsHeaderCollapsed", {
                    siteIdentifier,
                });
                set((state) => {
                    const current =
                        state.siteDetailsHeaderCollapsedState[siteIdentifier] ??
                        false;
                    return {
                        siteDetailsHeaderCollapsedState: {
                            ...state.siteDetailsHeaderCollapsedState,
                            [siteIdentifier]: !current,
                        },
                    };
                });
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
             *   session - selectedSiteIdentifier: Reset on each session for
             *   security/privacy
             */
            partialize: (state) => ({
                activeSiteDetailsTab: state.activeSiteDetailsTab,
                showAdvancedMetrics: state.showAdvancedMetrics,
                siteCardPresentation: state.siteCardPresentation,
                siteDetailsChartTimeRange: state.siteDetailsChartTimeRange,
                siteDetailsHeaderCollapsedState:
                    state.siteDetailsHeaderCollapsedState,
                siteDetailsTabState: state.siteDetailsTabState,
                siteListLayout: state.siteListLayout,
                siteTableColumnWidths: state.siteTableColumnWidths,
                // Don't persist modal states or selected site
            }),
        }
    )
);
