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
    activeSiteDetailsTab: string;

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
    setActiveSiteDetailsTab: (tab: string) => void;

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
     * Sets the selected time range for site details charts.
     *
     * @param range - The chart time range to select.
     */
    setSiteDetailsChartTimeRange: (range: ChartTimeRange) => void;

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
     * The selected time range for charts in the site details modal.
     */
    siteDetailsChartTimeRange: ChartTimeRange;

    // NOTE: getSelectedSite removed - use useSelectedSite hook instead
    // (src/hooks/useSelectedSite.ts)
}
