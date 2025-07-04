/**
 * UI store types and interfaces.
 * Manages UI state, modal visibility, and user interface interactions.
 */

import type { ChartTimeRange, Site } from "../types";

/**
 * UI store interface.
 * Manages user interface state and interactions.
 */
export interface UIStore {
    // State
    /** Whether settings modal is open */
    showSettings: boolean;
    /** Currently selected site identifier */
    selectedSiteId: string | undefined;
    /** Whether site details modal is open */
    showSiteDetails: boolean;
    /** Active tab in site details modal */
    activeSiteDetailsTab: string;
    /** Selected time range for charts */
    siteDetailsChartTimeRange: ChartTimeRange;
    /** Whether to show advanced metrics */
    showAdvancedMetrics: boolean;

    // Actions
    /** Set settings modal visibility */
    setShowSettings: (show: boolean) => void;
    /** Set selected site */
    setSelectedSite: (site: Site | undefined) => void;
    /** Set site details modal visibility */
    setShowSiteDetails: (show: boolean) => void;
    /** Set active tab in site details modal */
    setActiveSiteDetailsTab: (tab: string) => void;
    /** Set chart time range */
    setSiteDetailsChartTimeRange: (range: ChartTimeRange) => void;
    /** Set advanced metrics visibility */
    setShowAdvancedMetrics: (show: boolean) => void;

    // Derived selectors
    /** Get currently selected site */
    getSelectedSite: () => Site | undefined;
}
