/**
 * UI store for managing user interface state and interactions.
 *
 * @remarks
 * This store manages the global UI state including modal visibility, selected
 * site, active tabs, and user preferences. It uses Zustand persistence to
 * maintain user preferences across sessions while keeping transient state (like
 * modal visibility) in memory only.
 *
 * The store follows the app's modular architecture by separating UI concerns
 * from business logic, allowing components to focus on presentation while
 * delegating state management to this centralized store.
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
import type { Promisable } from "type-fest";

import { getOwnDataCause } from "@shared/utils/errorPropertyAccess";
import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";
import { isRecord } from "@shared/utils/typeHelpers";
import { validateExternalOpenUrlCandidate } from "@shared/utils/urlSafety";
import {
    isDefined,
    isFinite as isFiniteNumber,
    objectEntries,
} from "ts-extras";
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

const UI_PERSIST_VERSION = 1;

const ENTERPRISE_UI_DEFAULTS = {
    siteCardPresentation: "grid",
    siteListLayout: "list",
    surfaceDensity: "compact",
} as const satisfies Pick<
    UIPersistedState,
    "siteCardPresentation" | "siteListLayout" | "surfaceDensity"
>;

const SITE_TABLE_COLUMN_KEYS: readonly SiteTableColumnKey[] = [
    "controls",
    "monitor",
    "response",
    "running",
    "site",
    "status",
    "uptime",
] as const;

const CHART_TIME_RANGES: readonly ChartTimeRange[] = [
    "1h",
    "7d",
    "24h",
    "30d",
];
const CHART_TIME_RANGE_SET = new Set<string>(CHART_TIME_RANGES);

const INTERFACE_DENSITIES: readonly InterfaceDensity[] = [
    "comfortable",
    "compact",
    "cozy",
];
const INTERFACE_DENSITY_SET = new Set<string>(INTERFACE_DENSITIES);

const SITE_CARD_PRESENTATIONS: readonly SiteCardPresentation[] = [
    "grid",
    "stacked",
];
const SITE_CARD_PRESENTATION_SET = new Set<string>(SITE_CARD_PRESENTATIONS);

const SITE_DETAILS_STATIC_TABS: readonly SiteDetailsTab[] = [
    "analytics",
    "history",
    "monitor-overview",
    "settings",
    "site-overview",
];
const SITE_DETAILS_STATIC_TAB_SET = new Set<string>(SITE_DETAILS_STATIC_TABS);

const SITE_LIST_LAYOUT_MODES: readonly SiteListLayoutMode[] = [
    "card-compact",
    "card-large",
    "list",
];
const SITE_LIST_LAYOUT_MODE_SET = new Set<string>(SITE_LIST_LAYOUT_MODES);

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

const normalizeSiteTableColumnWidths = (
    widths?: Partial<Record<SiteTableColumnKey, number>>,
    base: Record<SiteTableColumnKey, number> = DEFAULT_SITE_TABLE_COLUMN_WIDTHS
): Record<SiteTableColumnKey, number> => {
    const updated: Record<SiteTableColumnKey, number> = { ...base };

    for (const columnKey of SITE_TABLE_COLUMN_KEYS) {
        const width = widths?.[columnKey];
        if (isDefined(width) && isFiniteNumber(width) && width > 0) {
            updated[columnKey] = width;
        }
    }

    return updated;
};

const createEmptySiteDetailsTabState = (): Record<
    string,
    SiteDetailsTab
> => ({});

function getOwnDataField(source: object, key: keyof UIPersistedState): unknown {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    return descriptor && "value" in descriptor ? descriptor.value : undefined;
}

const isChartTimeRange = (value: unknown): value is ChartTimeRange =>
    typeof value === "string" && CHART_TIME_RANGE_SET.has(value);

const isInterfaceDensity = (value: unknown): value is InterfaceDensity =>
    typeof value === "string" && INTERFACE_DENSITY_SET.has(value);

const isSiteCardPresentation = (
    value: unknown
): value is SiteCardPresentation =>
    typeof value === "string" && SITE_CARD_PRESENTATION_SET.has(value);

const isSiteDetailsTab = (value: unknown): value is SiteDetailsTab =>
    (typeof value === "string" && SITE_DETAILS_STATIC_TAB_SET.has(value)) ||
    (typeof value === "string" && value.endsWith("-analytics"));

const isSiteListLayoutMode = (value: unknown): value is SiteListLayoutMode =>
    typeof value === "string" && SITE_LIST_LAYOUT_MODE_SET.has(value);

function normalizeBooleanRecord(
    value: unknown
): Record<string, boolean> | undefined {
    if (!isRecord(value)) {
        return undefined;
    }

    const normalized: Record<string, boolean> = {};
    for (const [key, candidate] of objectEntries(value)) {
        if (typeof candidate === "boolean") {
            normalized[key] = candidate;
        }
    }

    return normalized;
}

function normalizeSiteDetailsTabRecord(
    value: unknown
): Record<string, SiteDetailsTab> | undefined {
    if (!isRecord(value)) {
        return undefined;
    }

    const normalized: Record<string, SiteDetailsTab> = {};
    for (const [key, candidate] of objectEntries(value)) {
        if (isSiteDetailsTab(candidate)) {
            normalized[key] = candidate;
        }
    }

    return normalized;
}

function normalizePersistedColumnWidths(
    value: unknown
): Record<SiteTableColumnKey, number> | undefined {
    if (!isRecord(value)) {
        return undefined;
    }

    const widths: Partial<Record<SiteTableColumnKey, number>> = {};
    for (const columnKey of SITE_TABLE_COLUMN_KEYS) {
        const width = value[columnKey];
        if (typeof width === "number") {
            widths[columnKey] = width;
        }
    }

    return normalizeSiteTableColumnWidths(widths);
}

function normalizePersistedState(
    persistedState: unknown
): Partial<UIPersistedState> {
    if (!isRecord(persistedState)) {
        return {};
    }

    const state: Partial<UIPersistedState> = {};
    const activeSiteDetailsTab = getOwnDataField(
        persistedState,
        "activeSiteDetailsTab"
    );
    if (isSiteDetailsTab(activeSiteDetailsTab)) {
        state.activeSiteDetailsTab = activeSiteDetailsTab;
    }

    const showAdvancedMetrics = getOwnDataField(
        persistedState,
        "showAdvancedMetrics"
    );
    if (typeof showAdvancedMetrics === "boolean") {
        state.showAdvancedMetrics = showAdvancedMetrics;
    }

    const sidebarCollapsedPreference = getOwnDataField(
        persistedState,
        "sidebarCollapsedPreference"
    );
    if (typeof sidebarCollapsedPreference === "boolean") {
        state.sidebarCollapsedPreference = sidebarCollapsedPreference;
    }

    const siteCardPresentation = getOwnDataField(
        persistedState,
        "siteCardPresentation"
    );
    if (isSiteCardPresentation(siteCardPresentation)) {
        state.siteCardPresentation = siteCardPresentation;
    }

    const siteDetailsChartTimeRange = getOwnDataField(
        persistedState,
        "siteDetailsChartTimeRange"
    );
    if (isChartTimeRange(siteDetailsChartTimeRange)) {
        state.siteDetailsChartTimeRange = siteDetailsChartTimeRange;
    }

    const siteDetailsHeaderCollapsedState = normalizeBooleanRecord(
        getOwnDataField(persistedState, "siteDetailsHeaderCollapsedState")
    );
    if (isDefined(siteDetailsHeaderCollapsedState)) {
        state.siteDetailsHeaderCollapsedState = siteDetailsHeaderCollapsedState;
    }

    const siteDetailsTabState = normalizeSiteDetailsTabRecord(
        getOwnDataField(persistedState, "siteDetailsTabState")
    );
    if (isDefined(siteDetailsTabState)) {
        state.siteDetailsTabState = siteDetailsTabState;
    }

    const siteListLayout = getOwnDataField(persistedState, "siteListLayout");
    if (isSiteListLayoutMode(siteListLayout)) {
        state.siteListLayout = siteListLayout;
    }

    const siteTableColumnWidths = normalizePersistedColumnWidths(
        getOwnDataField(persistedState, "siteTableColumnWidths")
    );
    if (isDefined(siteTableColumnWidths)) {
        state.siteTableColumnWidths = siteTableColumnWidths;
    }

    const surfaceDensity = getOwnDataField(persistedState, "surfaceDensity");
    if (isInterfaceDensity(surfaceDensity)) {
        state.surfaceDensity = surfaceDensity;
    }

    return state;
}

const getDefaultUIPersistedState = (): UIPersistedState => ({
    activeSiteDetailsTab: "site-overview",
    showAdvancedMetrics: false,
    sidebarCollapsedPreference: false,
    siteCardPresentation: ENTERPRISE_UI_DEFAULTS.siteCardPresentation,
    siteDetailsChartTimeRange: "24h",
    siteDetailsHeaderCollapsedState: {},
    siteDetailsTabState: {},
    siteListLayout: ENTERPRISE_UI_DEFAULTS.siteListLayout,
    siteTableColumnWidths: { ...DEFAULT_SITE_TABLE_COLUMN_WIDTHS },
    surfaceDensity: ENTERPRISE_UI_DEFAULTS.surfaceDensity,
});

const normalizeUIPersistedState = (
    state: Partial<UIPersistedState>
): UIPersistedState => {
    const defaults = getDefaultUIPersistedState();

    return {
        ...defaults,
        ...state,
        siteTableColumnWidths: normalizeSiteTableColumnWidths(
            state.siteTableColumnWidths,
            defaults.siteTableColumnWidths
        ),
    };
};

/**
 * Interface for the UI store with persistence capabilities.
 */
type UIStoreWithPersist = UseBoundStore<
    StoreApi<UIStore> & {
        persist: {
            clearStorage: () => void;
            getOptions: () => Partial<
                PersistOptions<UIStore, UIPersistedState>
            >;
            hasHydrated: () => boolean;
            onFinishHydration: (fn: (state: UIStore) => void) => () => void;
            onHydrate: (fn: (state: UIStore) => void) => () => void;
            rehydrate: () => Promisable<void>;
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

                const validationResult = validateExternalOpenUrlCandidate(url);
                const urlForMessage = validationResult.safeUrlForLogging;

                const errorHandler = createStoreErrorHandler(
                    "system-open-external",
                    "ui.openExternal"
                );

                const logOpenExternalFailure = (
                    underlyingError: Error
                ): void => {
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
                        ...(context?.siteName && {
                            siteName: context.siteName,
                        }),
                    });

                    logStoreAction("UIStore", "openExternalFailed", {
                        context,
                        error: underlyingError.message,
                        url: urlForMessage,
                    });
                };

                if (!validationResult.ok) {
                    const validationError = new TypeError(
                        `Unable to open external link (${urlForMessage}): ${validationResult.reason}.`
                    );

                    errorHandler.clearError();
                    errorHandler.setError(validationError.message);
                    logOpenExternalFailure(validationError);

                    return;
                }

                void (async (): Promise<void> => {
                    try {
                        await withErrorHandling(async () => {
                            try {
                                await SystemService.openExternal(
                                    validationResult.normalizedUrl
                                );
                            } catch (error: unknown) {
                                throw new Error(
                                    `Unable to open external link (${urlForMessage}).`,
                                    { cause: error }
                                );
                            }
                            logger.user.action("External URL opened", {
                                url: urlForMessage,
                                ...(context?.siteName && {
                                    siteName: context.siteName,
                                }),
                            });
                        }, errorHandler);
                    } catch (error: unknown) {
                        const normalizedError = ensureError(error);
                        const underlyingCause =
                            getOwnDataCause(normalizedError) ??
                            normalizedError;

                        // Prefer logging the underlying cause when we wrap an
                        // error for user-facing messaging.
                        const underlyingError = ensureError(underlyingCause);

                        logOpenExternalFailure(underlyingError);
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
                set((state) => ({
                    siteTableColumnWidths: normalizeSiteTableColumnWidths(
                        widths,
                        state.siteTableColumnWidths
                    ),
                }));
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
            siteCardPresentation: "grid",
            siteDetailsChartTimeRange: "24h",
            siteDetailsHeaderCollapsedState: {},
            siteDetailsTabState: createEmptySiteDetailsTabState(),
            siteListLayout: "list",
            siteTableColumnWidths: { ...DEFAULT_SITE_TABLE_COLUMN_WIDTHS },
            surfaceDensity: "compact",
            syncActiveSiteDetailsTab: (siteIdentifier: string): void => {
                logStoreAction("UIStore", "syncActiveSiteDetailsTab", {
                    siteIdentifier,
                });
                set((state) => {
                    const existingTab =
                        state.siteDetailsTabState[siteIdentifier];

                    if (!isDefined(existingTab)) {
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
                    const isCurrent =
                        state.siteDetailsHeaderCollapsedState[siteIdentifier] ??
                        false;
                    return {
                        siteDetailsHeaderCollapsedState: {
                            ...state.siteDetailsHeaderCollapsedState,
                            [siteIdentifier]: !isCurrent,
                        },
                    };
                });
            },
        }),
        {
            // Selectively persist stable UI preferences across sessions while
            // keeping transient state (modals, selections) in memory only.
            ...UI_PERSIST_CONFIG,
            migrate: (persistedState: unknown, version: number) => {
                const state = normalizePersistedState(persistedState);

                if (version < UI_PERSIST_VERSION) {
                    return normalizeUIPersistedState({
                        ...state,
                        ...ENTERPRISE_UI_DEFAULTS,
                    });
                }

                return normalizeUIPersistedState(state);
            },
            // Re-state required fields explicitly for exactOptionalPropertyTypes.
            name: UI_PERSIST_CONFIG.name,
            version: UI_PERSIST_VERSION,
        }
    )
);
