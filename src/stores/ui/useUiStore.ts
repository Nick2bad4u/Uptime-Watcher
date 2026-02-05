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

import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";
import { getSafeUrlForLogging } from "@shared/utils/urlSafety";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist, type PersistOptions } from "zustand/middleware";

import type { ChartTimeRange } from "../types";
import type {
    InterfaceDensity,
    SiteCardPresentation,
    SiteDetailsTab,
    SiteListLayoutMode,
    SiteTableColumnKey,
    UIStore,
} from "./types";

import { logger } from "../../services/logger";
import { SystemService } from "../../services/SystemService";
import { createPersistConfig, logStoreAction } from "../utils";
import { createStoreErrorHandler } from "../utils/storeErrorHandling";

interface UIPersistedState {
    activeSiteDetailsTab: SiteDetailsTab;
    showAdvancedMetrics: boolean;
    sidebarCollapsedPreference: boolean;
    siteCardPresentation: SiteCardPresentation;
    siteDetailsChartTimeRange: ChartTimeRange;
    siteDetailsHeaderCollapsedState: Record<string, boolean>;
    siteDetailsTabState: Record<string, SiteDetailsTab>;
    siteListLayout: SiteListLayoutMode;
    siteTableColumnWidths: Record<SiteTableColumnKey, number>;
    surfaceDensity: InterfaceDensity;
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
 * Default width allocation (percentages) for list mode columns.
 */
export const DEFAULT_SITE_TABLE_COLUMN_WIDTHS: Record<
    SiteTableColumnKey,
    number
> = Object.freeze({
    controls: 16,
    monitor: 14,
    response: 12,
    running: 10,
    site: 24,
    status: 12,
    uptime: 12,
});

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

const UI_PERSIST_CONFIG = createPersistConfig<UIStore, UIPersistedState>(
    "ui",
    (state) => ({
        activeSiteDetailsTab: state.activeSiteDetailsTab,
        showAdvancedMetrics: state.showAdvancedMetrics,
        sidebarCollapsedPreference: state.sidebarCollapsedPreference,
        siteCardPresentation: state.siteCardPresentation,
        siteDetailsChartTimeRange: state.siteDetailsChartTimeRange,
        siteDetailsHeaderCollapsedState: state.siteDetailsHeaderCollapsedState,
        siteDetailsTabState: state.siteDetailsTabState,
        siteListLayout: state.siteListLayout,
        siteTableColumnWidths: state.siteTableColumnWidths,
        surfaceDensity: state.surfaceDensity,
    })
);

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
                logStoreAction("UIStore", "openExternal", { context });

                const urlForMessage = getSafeUrlForLogging(url);

                const errorHandler = createStoreErrorHandler(
                    "system-open-external",
                    "ui.openExternal"
                );

                void (async (): Promise<void> => {
                    try {
                        await withErrorHandling(async () => {
                            try {
                                await SystemService.openExternal(url);
                            } catch (error: unknown) {
                                throw new Error(
                                    `Unable to open external link (${urlForMessage}).`,
                                    { cause: error }
                                );
                            }
                            logger.user.action("External URL opened", {
                                url: urlForMessage,
                                ...(context?.siteName
                                    ? { siteName: context.siteName }
                                    : {}),
                            });
                        }, errorHandler);
                    } catch (error: unknown) {
                        const normalizedError = ensureError(error);

                        // Prefer logging the underlying cause when we wrap an
                        // error for user-facing messaging.
                        const underlyingError = ensureError(
                            (normalizedError as { cause?: unknown }).cause ??
                                normalizedError
                        );

                        logger.error(
                            "Failed to open external URL via SystemService",
                            underlyingError,
                            {
                                context,
                                url: urlForMessage,
                            }
                        );

                        logger.user.action("External URL failed", {
                            error: underlyingError.message,
                            url: urlForMessage,
                            ...(context?.siteName
                                ? { siteName: context.siteName }
                                : {}),
                        });

                        logStoreAction("UIStore", "openExternalFailed", {
                            context,
                            error: underlyingError.message,
                            url: urlForMessage,
                        });
                    }
                })();
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
            setSidebarCollapsedPreference: (collapsed: boolean): void => {
                logStoreAction("UIStore", "setSidebarCollapsedPreference", {
                    collapsed,
                });
                set({ sidebarCollapsedPreference: collapsed });
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
            setSurfaceDensity: (density: InterfaceDensity): void => {
                logStoreAction("UIStore", "setSurfaceDensity", { density });
                set({ surfaceDensity: density });
            },
            showAddSiteModal: false,
            showAdvancedMetrics: false,
            showSettings: false,
            showSiteDetails: false,
            sidebarCollapsedPreference: false,
            siteCardPresentation: "stacked",
            siteDetailsChartTimeRange: "24h",
            siteDetailsHeaderCollapsedState: {},
            siteDetailsTabState: {} as Record<string, SiteDetailsTab>,
            siteListLayout: "card-large",
            siteTableColumnWidths: { ...DEFAULT_SITE_TABLE_COLUMN_WIDTHS },
            surfaceDensity: "comfortable",
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
            // Selectively persist stable UI preferences across sessions while
            // keeping transient state (modals, selections) in memory only.
            ...UI_PERSIST_CONFIG,
            // Re-state required fields explicitly for exactOptionalPropertyTypes.
            name: UI_PERSIST_CONFIG.name,
        }
    )
);
