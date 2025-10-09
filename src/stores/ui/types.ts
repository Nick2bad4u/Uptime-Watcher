/**
 * UI store types and interfaces. Manages UI state, modal visibility, and user
 * interface interactions.
 *
 * @remarks
 * This store is responsible for managing the UI state of the application,
 * including modal visibility, selected site, active tabs, and chart time
 * ranges. All state mutations must be performed via store actions.
 */

import type { Site } from "@shared/types";

import type { ChartTimeRange } from "../types";

/**
 * Layout modes available for the dashboard site list.
 */
export type SiteListLayoutMode = "card-compact" | "card-large" | "list";

/**
 * Presentation modes available for large site cards.
 */
export type SiteCardPresentation = "grid" | "stacked";

/**
 * Resizable column identifiers for the list layout table.
 */
export type SiteTableColumnKey =
    | "controls"
    | "monitor"
    | "response"
    | "running"
    | "site"
    | "status"
    | "uptime";

/**
 * Supported tab identifiers for the site details view.
 */
export type SiteDetailsTab =
    | "analytics"
    | "history"
    | "monitor-overview"
    | "settings"
    | "site-overview"
    | `${string}-analytics`;

/**
 * Interface for the UI store.
 *
 * @remarks
 * Provides state and actions for managing user interface interactions and modal
 * visibility.
 */
export interface UIStore {
    /**
     * The active tab in the site details modal.
     */
    activeSiteDetailsTab: SiteDetailsTab;

    /**
     * Opens an external URL using the system's default browser.
     *
     * @param url - The URL to open externally.
     * @param context - Optional context for logging purposes.
     */
    openExternal: (url: string, context?: { siteName?: string }) => void;

    /**
     * The identifier of the currently selected site.
     */
    selectedSiteId: string | undefined;

    /**
     * Selects a site for focused operations and UI display.
     *
     * @param site - The site to select, or `undefined` to clear selection.
     */
    selectSite: (site: Site | undefined) => void;

    /**
     * Sets the active tab in the site details modal.
     *
     * @param tab - The tab identifier to activate.
     */
    setActiveSiteDetailsTab: (tab: SiteDetailsTab) => void;

    /**
     * Sets the visibility of the add site modal.
     *
     * @param show - Whether to show the add site modal.
     */
    setShowAddSiteModal: (show: boolean) => void;

    /**
     * Sets the visibility of advanced metrics in the UI.
     *
     * @param show - Whether to show advanced metrics.
     */
    setShowAdvancedMetrics: (show: boolean) => void;

    // Actions

    /**
     * Sets the visibility of the settings modal.
     *
     * @param show - Whether to show the settings modal.
     */
    setShowSettings: (show: boolean) => void;

    /**
     * Sets the visibility of the site details modal.
     *
     * @param show - Whether to show the site details modal.
     */
    setShowSiteDetails: (show: boolean) => void;

    /**
     * Updates the presentation style for large site cards.
     *
     * @param presentation - The presentation mode to activate.
     */
    setSiteCardPresentation: (presentation: SiteCardPresentation) => void;

    /**
     * Sets the selected time range for site details charts.
     *
     * @param range - The chart time range to select.
     */
    setSiteDetailsChartTimeRange: (range: ChartTimeRange) => void;

    /**
     * Persists the collapsed state of the site details header for a specific
     * site.
     *
     * @param siteId - Identifier of the site being viewed.
     * @param collapsed - Whether the header should be collapsed.
     */
    setSiteDetailsHeaderCollapsed: (siteId: string, collapsed: boolean) => void;

    /**
     * Updates the active presentation layout for the dashboard site list.
     *
     * @param layout - The target layout mode to activate.
     */
    setSiteListLayout: (layout: SiteListLayoutMode) => void;

    /**
     * Updates one or more table column widths for the list layout view.
     *
     * @param widths - Partial mapping of column identifiers to percentage
     *   widths.
     */
    setSiteTableColumnWidths: (
        widths: Partial<Record<SiteTableColumnKey, number>>
    ) => void;

    /**
     * Whether the add site modal is currently open.
     */
    showAddSiteModal: boolean;

    /**
     * Whether advanced metrics are visible in the UI.
     */
    showAdvancedMetrics: boolean;

    // State

    /**
     * Whether the settings modal is currently open.
     */
    showSettings: boolean;

    /**
     * Whether the site details modal is currently open.
     */
    showSiteDetails: boolean;

    /**
     * Presentation style for large site cards (grid or stacked).
     */
    siteCardPresentation: SiteCardPresentation;

    /**
     * The selected time range for charts in the site details modal.
     */
    siteDetailsChartTimeRange: ChartTimeRange;

    /**
     * Map of site identifiers to the persisted collapsed state of the site
     * details header.
     */
    siteDetailsHeaderCollapsedState: Record<string, boolean>;

    /**
     * Map of site identifiers to the last active site details tab.
     */
    siteDetailsTabState: Record<string, SiteDetailsTab>;

    /**
     * The currently active presentation layout for the dashboard site list.
     */
    siteListLayout: SiteListLayoutMode;

    /**
     * Current percentage widths for the list layout columns.
     */
    siteTableColumnWidths: Record<SiteTableColumnKey, number>;

    /**
     * Synchronizes the active tab with the last tab opened for a site.
     *
     * @param siteId - Identifier of the site being viewed.
     */
    syncActiveSiteDetailsTab: (siteId: string) => void;

    /**
     * Toggles the collapsed state of the site details header for the provided
     * site.
     *
     * @param siteId - Identifier of the site being viewed.
     */
    toggleSiteDetailsHeaderCollapsed: (siteId: string) => void;

    // NOTE: getSelectedSite removed - use useSelectedSite hook instead
    // (src/hooks/useSelectedSite.ts)
}
