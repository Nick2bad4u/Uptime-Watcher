/**
 * Custom hook for managing site details state and operations
 *
 * Provides comprehensive state management for the site details view including:
 *
 * - Site data and monitor information
 * - UI state (active tab, loading states)
 * - Site operations (start/stop monitoring, check now, update settings)
 * - Derived state management for editable fields (computed during render)
 * - Integration with analytics
 *
 * @remarks
 * This hook uses modern React patterns with derived state computed during
 * render instead of managing state in useEffect hooks. Changes are tracked
 * using previous value comparison and user edit state to provide responsive UI
 * feedback.
 *
 * @public
 */

import type { Monitor, Site } from "@shared/types";

import { DEFAULT_SITE_NAME } from "@shared/constants/sites";
import { type ChangeEvent, useEffect, useState } from "react";

import type { ChartTimeRange } from "../../constants";
import type { SiteDetailsTab } from "../../stores/ui/types";

import { DEFAULT_CHECK_INTERVAL, RETRY_CONSTRAINTS } from "../../constants";
import { useErrorStore } from "../../stores/error/useErrorStore";
import { getDefaultMonitorId } from "../../utils/monitorUiHelpers";
import { getTimeoutSeconds } from "../../utils/timeoutUtils";
import { useConfirmDialog } from "../ui/useConfirmDialog";
import { type SiteAnalytics, useSiteAnalytics } from "./useSiteAnalytics";
import {
    useSiteDetailsMonitoringHandlers,
    useSiteDetailsNameHandler,
    useSiteDetailsRemovalHandlers,
    useSiteDetailsSelectionHandlers,
    useSiteDetailsSettingsHandlers,
} from "./useSiteDetails.handlers";
import { useSiteDetailsSitesStore } from "./useSiteDetails.sitesStore";
import { useSiteDetailsUiStore } from "./useSiteDetails.uiStore";
import {
    DEFAULT_MONITOR_EDIT_STATE,
    type MonitorEditState,
} from "./useSiteDetails.utils";

const resolveHasUnsavedChanges = (
    nameChanged: boolean,
    intervalChanged: boolean,
    retryAttemptsChanged: boolean,
    timeoutChanged: boolean
): boolean =>
    nameChanged || intervalChanged || retryAttemptsChanged || timeoutChanged;

/**
 * Props for the useSiteDetails hook
 *
 * @public
 */
export interface UseSiteDetailsProperties {
    /** The site object to manage details for */
    site: Site;
}

/**
 * Return type for the useSiteDetails hook containing all state and handlers.
 *
 * @remarks
 * Provides comprehensive site management functionality including monitor
 * selection, monitoring controls, settings management, and analytics
 * integration.
 *
 * @public
 */
export interface UseSiteDetailsResult {
    // UI state
    /** Currently active tab in the site details view */
    activeSiteDetailsTab: SiteDetailsTab;
    // Analytics
    /** Comprehensive analytics data for the selected monitor */
    analytics: SiteAnalytics;
    // Site data
    /** The current site being viewed/managed */
    currentSite: Site;
    // Handlers
    /** Trigger an immediate check of the selected monitor */
    handleCheckNow: () => Promise<void>;
    /** Handle changes to the check interval dropdown */
    handleIntervalChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    /** Handle changes to the monitor selection dropdown */
    handleMonitorIdChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    /** Remove the selected monitor from the site */
    handleRemoveMonitor: () => Promise<void>;
    /** Remove the entire site and all its monitors */
    handleRemoveSite: () => Promise<void>;
    /** Handle changes to the retry attempts input field */
    handleRetryAttemptsChange: (e: ChangeEvent<HTMLInputElement>) => void;
    /** Save the modified check interval to the database */
    handleSaveInterval: () => Promise<void>;
    /** Save the modified site name to the database */
    handleSaveName: () => Promise<void>;
    /** Save the modified retry attempts to the database */
    handleSaveRetryAttempts: () => Promise<void>;
    /** Save the modified timeout value to the database */
    handleSaveTimeout: () => Promise<void>;
    /** Start monitoring for the selected monitor only */
    handleStartMonitoring: () => Promise<void>;
    /** Start monitoring for all monitors in the site */
    handleStartSiteMonitoring: () => Promise<void>;
    /** Stop monitoring for the selected monitor only */
    handleStopMonitoring: () => Promise<void>;
    /** Stop monitoring for all monitors in the site */
    handleStopSiteMonitoring: () => Promise<void>;
    /** Handle changes to the timeout input field */
    handleTimeoutChange: (e: ChangeEvent<HTMLInputElement>) => void;
    // State
    /** Whether there are unsaved changes to site/monitor settings */
    hasUnsavedChanges: boolean;
    /** Whether the check interval has been modified but not saved */
    intervalChanged: boolean;
    /** Whether the component is in a loading state */
    isLoading: boolean;
    /** Whether monitoring is currently active for any monitor in the site */
    isMonitoring: boolean;
    /** Local copy of check interval (milliseconds) for editing before saving */
    localCheckIntervalMs: number;
    /** Local copy of site name for editing before saving */
    localName: string;
    /** Local copy of retry attempts for editing before saving */
    localRetryAttempts: number;
    /** Local copy of timeout (seconds) for editing before saving */
    localTimeoutSeconds: number;
    /** Whether the retry attempts value has been modified but not saved */
    retryAttemptsChanged: boolean;
    /** The currently selected monitor object */
    selectedMonitor: Monitor | undefined;
    /** ID of the currently selected monitor */
    selectedMonitorId: string;
    // Store actions
    /** Set the active tab in the site details view */
    setActiveSiteDetailsTab: (tab: SiteDetailsTab) => void;
    /** Update the local site name state */
    setLocalName: (name: string) => void;
    /** Toggle advanced metrics display in analytics */
    setShowAdvancedMetrics: (show: boolean) => void;
    /** Set the time range for analytics charts */
    setSiteDetailsChartTimeRange: (range: ChartTimeRange) => void;
    /** Whether to show advanced metrics in analytics */
    showAdvancedMetrics: boolean;
    /** Current time range setting for analytics charts */
    siteDetailsChartTimeRange: ChartTimeRange;
    /** Whether the site exists in the database */
    siteExists: boolean;
    /** Whether the timeout value has been modified but not saved */
    timeoutChanged: boolean;
}

// (monitor edit state helpers extracted to useSiteDetails.utils.ts)

/**
 * Hook for managing site details state and operations.
 *
 * Provides all necessary state and handlers for the site details view,
 * including monitor selection, monitoring controls, settings management, and
 * integration with analytics.
 *
 * @example
 *
 * ```tsx
 * function SiteDetails({ site }) {
 *     const {
 *         currentSite,
 *         selectedMonitor,
 *         isLoading,
 *         handleStartMonitoring,
 *         handleStopMonitoring,
 *         // ... other state and handlers
 *     } = useSiteDetails({ site });
 *
 *     // Use the state and handlers in your component
 * }
 * ```
 *
 * @param props - Hook props containing the site to manage.
 *
 * @returns Object containing all site details state and handlers.
 *
 * @public
 *
 * @see {@link UseSiteDetailsResult} for the complete return shape.
 */
export function useSiteDetails({
    site,
}: UseSiteDetailsProperties): UseSiteDetailsResult {
    const {
        checkSiteNow,
        deleteSite,
        getSelectedMonitorId,
        modifySite,
        removeMonitorFromSite,
        setSelectedMonitorId,
        sites,
        startSiteMonitoring,
        startSiteMonitorMonitoring,
        stopSiteMonitoring,
        stopSiteMonitorMonitoring,
        updateMonitorRetryAttempts,
        updateMonitorTimeout,
        updateSiteCheckInterval,
    } = useSiteDetailsSitesStore();

    const { clearError, isLoading } = useErrorStore();

    const {
        activeSiteDetailsTab,
        setActiveSiteDetailsTab,
        setShowAdvancedMetrics,
        setSiteDetailsChartTimeRange,
        showAdvancedMetrics,
        siteDetailsChartTimeRange,
        syncActiveSiteDetailsTab,
    } = useSiteDetailsUiStore();

    const requestConfirmation = useConfirmDialog();

    // Always call hooks first, use fallback for currentSite
    const currentSite = sites.find((s) => s.identifier === site.identifier) ?? {
        identifier: site.identifier,
        monitoring: true, // Default to monitoring enabled
        monitors: [],
        name: DEFAULT_SITE_NAME, // Use constant for consistency
    };

    const monitorIds = currentSite.monitors.map((m) => m.id);
    const defaultMonitorId = getDefaultMonitorId(monitorIds);

    let selectedMonitorId =
        getSelectedMonitorId(currentSite.identifier) ?? defaultMonitorId;

    useEffect(
        function synchronizeSiteDetailsTab(): void {
            if (typeof syncActiveSiteDetailsTab === "function") {
                syncActiveSiteDetailsTab(currentSite.identifier);
            }
        },
        [currentSite.identifier, syncActiveSiteDetailsTab]
    );

    let selectedMonitor = currentSite.monitors.find(
        (monitor) => monitor.id === selectedMonitorId
    );

    // If the selected monitor ID no longer exists for the current site,
    // automatically fall back to the default monitor and persist the
    // corrected selection back to the store.
    if (
        !selectedMonitor &&
        currentSite.monitors.length > 0 &&
        defaultMonitorId
    ) {
        selectedMonitorId = defaultMonitorId;
        selectedMonitor = currentSite.monitors.find(
            (monitor) => monitor.id === defaultMonitorId
        );
        setSelectedMonitorId(currentSite.identifier, defaultMonitorId);
    }

    const selectedMonitorCheckInterval = selectedMonitor?.checkInterval;
    const selectedMonitorTimeout = selectedMonitor?.timeout;
    const selectedMonitorRetryAttempts = selectedMonitor?.retryAttempts;

    const isMonitoring = selectedMonitor?.monitoring ?? false;

    // Per-monitor edit state so that unsaved edits do not bleed across
    // monitors and we do not rely on effects to reset local state.
    const [monitorEditStateById, setMonitorEditStateById] = useState<
        Record<string, MonitorEditState>
    >({});

    const editStateForSelectedMonitor: MonitorEditState =
        monitorEditStateById[selectedMonitorId] ?? DEFAULT_MONITOR_EDIT_STATE;

    const {
        intervalChanged,
        retryAttemptsChanged,
        timeoutChanged,
        userEditedCheckIntervalMs,
        userEditedRetryAttempts,
        userEditedTimeoutSeconds,
    } = editStateForSelectedMonitor;

    const localCheckIntervalMs =
        userEditedCheckIntervalMs ??
        selectedMonitorCheckInterval ??
        DEFAULT_CHECK_INTERVAL;

    // Timeout state (stored in seconds for UI, converted to ms when saving)
    const localTimeoutSeconds =
        userEditedTimeoutSeconds ?? getTimeoutSeconds(selectedMonitorTimeout);

    // Retry attempts state - track user edits separately from monitor defaults
    const localRetryAttempts =
        userEditedRetryAttempts ??
        selectedMonitorRetryAttempts ??
        RETRY_CONSTRAINTS.DEFAULT;

    // Site name edit state: store only the user's override and derive the
    // effective value during render.
    const [userEditedSiteName, setUserEditedSiteName] = useState<
        string | undefined
    >();

    const localName = userEditedSiteName ?? currentSite.name;
    const setLocalName = setUserEditedSiteName;
    const nameChanged = localName !== currentSite.name;

    // Derived state: computed during render
    const hasUnsavedChanges = resolveHasUnsavedChanges(
        nameChanged,
        intervalChanged,
        retryAttemptsChanged,
        timeoutChanged
    );

    const { handleMonitorIdChange } = useSiteDetailsSelectionHandlers(
        activeSiteDetailsTab,
        currentSite.identifier,
        setActiveSiteDetailsTab,
        setSelectedMonitorId
    );

    const { handleRemoveMonitor, handleRemoveSite } =
        useSiteDetailsRemovalHandlers(
            clearError,
            currentSite,
            deleteSite,
            removeMonitorFromSite,
            requestConfirmation,
            selectedMonitor
        );

    const {
        handleCheckNow,
        handleStartMonitoring,
        handleStartSiteMonitoring,
        handleStopMonitoring,
        handleStopSiteMonitoring,
    } = useSiteDetailsMonitoringHandlers(
        checkSiteNow,
        clearError,
        currentSite,
        selectedMonitorId,
        startSiteMonitoring,
        startSiteMonitorMonitoring,
        stopSiteMonitoring,
        stopSiteMonitorMonitoring
    );

    const {
        handleIntervalChange,
        handleRetryAttemptsChange,
        handleSaveInterval,
        handleSaveRetryAttempts,
        handleSaveTimeout,
        handleTimeoutChange,
    } = useSiteDetailsSettingsHandlers(
        clearError,
        currentSite.identifier,
        localCheckIntervalMs,
        localRetryAttempts,
        localTimeoutSeconds,
        selectedMonitorCheckInterval,
        selectedMonitorId,
        selectedMonitorRetryAttempts,
        selectedMonitorTimeout,
        selectedMonitor?.type,
        setMonitorEditStateById,
        updateMonitorRetryAttempts,
        updateMonitorTimeout,
        updateSiteCheckInterval
    );

    const { handleSaveName } = useSiteDetailsNameHandler(
        clearError,
        currentSite.identifier,
        currentSite.name,
        localName,
        modifySite,
        setUserEditedSiteName
    );

    // Use analytics hook
    const analytics = useSiteAnalytics(
        selectedMonitor,
        siteDetailsChartTimeRange
    );

    // Check if site exists
    const siteExists = sites.some((s) => s.identifier === site.identifier);

    return {
        // UI state
        activeSiteDetailsTab,
        // Analytics
        analytics,
        // Site data
        currentSite,
        // Handlers
        handleCheckNow,
        handleIntervalChange,
        handleMonitorIdChange,
        handleRemoveMonitor,
        handleRemoveSite,
        handleRetryAttemptsChange,
        handleSaveInterval,
        handleSaveName,
        handleSaveRetryAttempts,
        handleSaveTimeout,
        handleStartMonitoring,
        handleStartSiteMonitoring,
        handleStopMonitoring,
        handleStopSiteMonitoring,
        handleTimeoutChange,
        // Name state
        hasUnsavedChanges,
        // Interval state
        intervalChanged,
        isLoading,
        isMonitoring,
        localCheckIntervalMs,
        localName,
        localRetryAttempts,
        localTimeoutSeconds,
        retryAttemptsChanged,
        selectedMonitor,
        selectedMonitorId,
        // Store actions
        setActiveSiteDetailsTab,
        setLocalName,
        setShowAdvancedMetrics,
        setSiteDetailsChartTimeRange,
        showAdvancedMetrics,
        siteDetailsChartTimeRange,
        siteExists,
        timeoutChanged,
    };
}
