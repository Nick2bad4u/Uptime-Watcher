/**
 * UI store for managing user interface state and interactions.
 *
 * @remarks
 * This store manages the global UI state including modal visibility, selected site,
 * active tabs, and user preferences. It uses Zustand persistence to maintain
 * user preferences across sessions while keeping transient state (like modal
 * visibility) in memory only.
 *
 * The store follows the application's modular architecture by separating UI
 * concerns from business logic, allowing components to focus on presentation
 * while delegating state management to this centralized store.
 *
 * @example
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
import type { UIStore } from "./types";

import logger from "../../services/logger";
import { logStoreAction } from "../utils";

/**
 * Interface for the UI store with persistence capabilities.
 */
type UIStoreWithPersist = UseBoundStore<
    Omit<StoreApi<UIStore>, "persist"> & {
        persist: {
            clearStorage: () => void;
            getOptions: () => Partial<
                PersistOptions<
                    UIStore,
                    {
                        activeSiteDetailsTab: string;
                        showAdvancedMetrics: boolean;
                        siteDetailsChartTimeRange: ChartTimeRange;
                    }
                >
            >;
            hasHydrated: () => boolean;
            onFinishHydration: (fn: (state: UIStore) => void) => () => void;
            onHydrate: (fn: (state: UIStore) => void) => () => void;
            rehydrate: () => Promise<void> | void;
            setOptions: (
                options: Partial<
                    PersistOptions<
                        UIStore,
                        {
                            activeSiteDetailsTab: string;
                            showAdvancedMetrics: boolean;
                            siteDetailsChartTimeRange: ChartTimeRange;
                        }
                    >
                >
            ) => void;
        };
    }
>;

export const useUIStore: UIStoreWithPersist = create<UIStore>()(
    persist(
        (set) => ({
            // State
            activeSiteDetailsTab: "site-overview",
            // Actions
            openExternal: (
                url: string,
                context?: { siteName?: string }
            ): void => {
                logStoreAction("UIStore", "openExternal", { context, url });

                // Log user action for analytics
                logger.user.action("External URL opened", {
                    url,
                    ...(context && { siteName: context.siteName }),
                });

                // Use electronAPI to open external URL
                // In test environments, this might fallback to window.open via mocking
                try {
                    window.electronAPI.system.openExternal(url);
                } catch {
                    // Fallback for test environments where electronAPI might throw
                    window.open(url, "_blank", "noopener");
                }
            },
            selectedSiteId: undefined,
            setActiveSiteDetailsTab: (tab: string): void => {
                logStoreAction("UIStore", "setActiveSiteDetailsTab", { tab });
                set({ activeSiteDetailsTab: tab });
            },
            setSelectedSite: (site: Site | undefined): void => {
                logStoreAction("UIStore", "setSelectedSite", { site });
                set({ selectedSiteId: site ? site.identifier : undefined });
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
            setSiteDetailsChartTimeRange: (range: ChartTimeRange): void => {
                logStoreAction("UIStore", "setSiteDetailsChartTimeRange", {
                    range,
                });
                set({ siteDetailsChartTimeRange: range });
            },
            showAddSiteModal: false,
            showAdvancedMetrics: false,
            showSettings: false,
            showSiteDetails: false,
            siteDetailsChartTimeRange: "24h",
        }),
        {
            name: "uptime-watcher-ui",
            /**
             * Partialize function for selective state persistence.
             *
             * @remarks
             * This function determines which parts of the UI state should be persisted
             * across browser sessions. It includes user preferences and settings that
             * should be remembered, while excluding transient state like modal visibility
             * and selected site which should reset on each session.
             *
             * Persisted state:
             * - activeSiteDetailsTab: Remember which tab was last active
             * - showAdvancedMetrics: User preference for advanced metrics visibility
             * - siteDetailsChartTimeRange: User preference for chart time range
             *
             * Non-persisted state:
             * - Modal states (showSettings, showSiteDetails): Reset on each session
             * - selectedSiteId: Reset on each session for security/privacy
             */
            partialize: (state) => ({
                activeSiteDetailsTab: state.activeSiteDetailsTab,
                showAdvancedMetrics: state.showAdvancedMetrics,
                siteDetailsChartTimeRange: state.siteDetailsChartTimeRange,
                // Don't persist modal states or selected site
            }),
        }
    )
);
