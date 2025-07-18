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
    /** Active tab in site details modal */
    activeSiteDetailsTab: string;
    /** Currently selected site identifier */
    selectedSiteId: string | undefined;
    /** Set active tab in site details modal */
    setActiveSiteDetailsTab: (tab: string) => void;
    /** Set selected site */
    setSelectedSite: (site: Site | undefined) => void;
    /** Set advanced metrics visibility */
    setShowAdvancedMetrics: (show: boolean) => void;
    // Actions
    /** Set settings modal visibility */
    setShowSettings: (show: boolean) => void;

    /** Set site details modal visibility */
    setShowSiteDetails: (show: boolean) => void;
    /** Set chart time range */
    setSiteDetailsChartTimeRange: (range: ChartTimeRange) => void;
    /** Whether to show advanced metrics */
    showAdvancedMetrics: boolean;
    // State
    /** Whether settings modal is open */
    showSettings: boolean;
    /** Whether site details modal is open */
    showSiteDetails: boolean;
    /** Selected time range for charts */
    siteDetailsChartTimeRange: ChartTimeRange;

    // NOTE: getSelectedSite removed - use useSelectedSite hook instead
}
