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
import { ensureError } from "@shared/utils/errorHandling";
import { safeInteger } from "@shared/validation/validatorUtils";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";

import type { ChartTimeRange } from "../../constants";
import type { SiteDetailsTab } from "../../stores/ui/types";

import { DEFAULT_CHECK_INTERVAL, RETRY_CONSTRAINTS } from "../../constants";
import { logger } from "../../services/logger";
import { useErrorStore } from "../../stores/error/useErrorStore";
import { useSitesStore } from "../../stores/sites/useSitesStore";
import { useUIStore } from "../../stores/ui/useUiStore";
import { getDefaultMonitorId } from "../../utils/monitorUiHelpers";
import { validateMonitorFieldClientSide } from "../../utils/monitorValidation";
import {
    clampTimeoutSeconds,
    getTimeoutSeconds,
    timeoutSecondsToMs,
} from "../../utils/timeoutUtils";
import { useConfirmDialog } from "../ui/useConfirmDialog";
import { type SiteAnalytics, useSiteAnalytics } from "./useSiteAnalytics";

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
    /** Local copy of check interval for editing before saving */
    localCheckInterval: number;
    /** Local copy of site name for editing before saving */
    localName: string;
    /** Local copy of retry attempts for editing before saving */
    localRetryAttempts: number;
    /** Local copy of timeout for editing before saving */
    localTimeout: number;
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

interface MonitorEditState {
    readonly intervalChanged: boolean;
    readonly retryAttemptsChanged: boolean;
    readonly timeoutChanged: boolean;
    readonly userEditedCheckInterval?: number | undefined;
    readonly userEditedRetryAttempts?: number | undefined;
    readonly userEditedTimeout?: number | undefined;
}

const DEFAULT_MONITOR_EDIT_STATE: MonitorEditState = {
    intervalChanged: false,
    retryAttemptsChanged: false,
    timeoutChanged: false,
};

function updateMonitorEditStateById(args: {
    readonly monitorId: string;
    readonly previous: Record<string, MonitorEditState>;
    readonly updater: (current: MonitorEditState) => MonitorEditState;
}): Record<string, MonitorEditState> {
    const current = args.previous[args.monitorId] ?? DEFAULT_MONITOR_EDIT_STATE;

    return {
        ...args.previous,
        [args.monitorId]: args.updater(current),
    };
}

/**
 * Executes a site-details operation and logs failures without rethrowing.
 *
 * @remarks
 * This helper prevents unhandled promise rejections for UI-driven operations
 * while allowing underlying store-level error handling (for example,
 * `withErrorHandling` in site stores) to manage user-facing error state.
 */
const runSiteDetailsOperation = async (
    context: string,
    operation: () => Promise<void>
): Promise<void> => {
    try {
        await operation();
    } catch (error: unknown) {
        logger.app.error(context, ensureError(error));
    }
};

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
// eslint-disable-next-line complexity -- This orchestrator-style hook necessarily coordinates multiple concerns; further decomposition would add indirection without materially reducing complexity.
export function useSiteDetails({
    site,
}: UseSiteDetailsProperties): UseSiteDetailsResult {
    const {
        checkSiteNow,
        deleteSite,
        getSelectedMonitorId,
        modifySite,
        removeMonitorFromSite,
        selectedMonitorIds,
        setSelectedMonitorId,
        sites,
        startSiteMonitoring,
        startSiteMonitorMonitoring,
        stopSiteMonitoring,
        stopSiteMonitorMonitoring,
        updateMonitorRetryAttempts,
        updateMonitorTimeout,
        updateSiteCheckInterval,
    } = useSitesStore();

    const { clearError, isLoading } = useErrorStore();

    const {
        activeSiteDetailsTab,
        setActiveSiteDetailsTab,
        setShowAdvancedMetrics,
        setSiteDetailsChartTimeRange,
        showAdvancedMetrics,
        siteDetailsChartTimeRange,
        syncActiveSiteDetailsTab,
    } = useUIStore();

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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Store may not yet have monitor selections keyed.
    const selectedMonitorIdsBySite = selectedMonitorIds ?? {};

    let selectedMonitorId =
        selectedMonitorIdsBySite[currentSite.identifier] ??
        getSelectedMonitorId(currentSite.identifier) ??
        defaultMonitorId;

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

    const isMonitoring = selectedMonitor ? selectedMonitor.monitoring : false;

    // Per-monitor edit state so that unsaved edits do not bleed across
    // monitors and we do not rely on effects to reset local state.
    const [monitorEditStateById, setMonitorEditStateById] = useState<
        Record<string, MonitorEditState>
    >({});

    const effectiveMonitorId = selectedMonitorId;
    const editStateForSelectedMonitor: MonitorEditState = (effectiveMonitorId
        ? monitorEditStateById[effectiveMonitorId]
        : undefined) ?? DEFAULT_MONITOR_EDIT_STATE;

    const {
        intervalChanged,
        retryAttemptsChanged,
        timeoutChanged,
        userEditedCheckInterval,
        userEditedRetryAttempts,
        userEditedTimeout,
    } = editStateForSelectedMonitor;

    const localCheckInterval =
        userEditedCheckInterval ??
        selectedMonitorCheckInterval ??
        DEFAULT_CHECK_INTERVAL;

    // Timeout state (stored in seconds for UI, converted to ms when saving)
    const localTimeout =
        userEditedTimeout ?? getTimeoutSeconds(selectedMonitorTimeout);

    // Retry attempts state - track user edits separately from monitor defaults
    const localRetryAttempts =
        userEditedRetryAttempts ??
        selectedMonitorRetryAttempts ??
        RETRY_CONSTRAINTS.DEFAULT;

    // Site name state for settings
    const [localName, setLocalName] = useState(currentSite.name);

    // Derived state: computed during render
    const hasUnsavedChanges = localName !== currentSite.name;

    // Handler for check now
    const handleCheckNow = useCallback(async () => {
        clearError();
        await runSiteDetailsOperation(
            "useSiteDetails.handleCheckNow",
            async () => {
                logger.user.action("Manual site check initiated", {
                    monitorId: selectedMonitorId,
                    monitorType: currentSite.monitors.find(
                        (m) => m.id === selectedMonitorId
                    )?.type,
                    siteIdentifier: currentSite.identifier,
                    siteName: currentSite.name,
                });
                await checkSiteNow(currentSite.identifier, selectedMonitorId);
                logger.user.action("Manual site check completed successfully", {
                    monitorId: selectedMonitorId,
                    siteIdentifier: currentSite.identifier,
                    siteName: currentSite.name,
                });
            }
        );
    }, [
        checkSiteNow,
        clearError,
        currentSite.identifier,
        currentSite.monitors,
        currentSite.name,
        selectedMonitorId,
    ]);

    // No auto-refresh - respect the monitor's configured interval
    // Users can manually click "Check Now" if they want immediate updates

    // Handler for monitor selection change
    const handleMonitorIdChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            const newId = e.target.value;
            setSelectedMonitorId(currentSite.identifier, newId);
            // If current tab is an analytics tab, switch to the new monitor's
            // analytics tab
            if (activeSiteDetailsTab.endsWith("-analytics")) {
                setActiveSiteDetailsTab(`${newId}-analytics`);
            }
        },
        [
            activeSiteDetailsTab,
            currentSite.identifier,
            setActiveSiteDetailsTab,
            setSelectedMonitorId,
        ]
    );

    // Handler for site removal
    const handleRemoveSite = useCallback(async () => {
        const confirmed = await requestConfirmation({
            cancelLabel: "Keep Site",
            confirmLabel: "Remove Site",
            details:
                "This action permanently removes the site and its monitors.",
            message: `Are you sure you want to remove ${currentSite.name}?`,
            title: "Remove Site",
            tone: "danger",
        });

        if (!confirmed) {
            return;
        }

        clearError();

        await runSiteDetailsOperation(
            "useSiteDetails.handleRemoveSite",
            async () => {
                await deleteSite(currentSite.identifier);
                logger.site.removed(currentSite.identifier);
            }
        );
    }, [
        clearError,
        currentSite.identifier,
        currentSite.name,
        deleteSite,
        requestConfirmation,
    ]);

    // Handler for monitor removal
    const handleRemoveMonitor = useCallback(async () => {
        if (!selectedMonitor) {
            logger.site.error(
                currentSite.identifier,
                "No monitor selected for removal"
            );
            return;
        }

        const monitorName =
            selectedMonitor.url ?? selectedMonitor.host ?? selectedMonitor.type;

        const confirmed = await requestConfirmation({
            cancelLabel: "Keep Monitor",
            confirmLabel: "Remove Monitor",
            details: `${currentSite.name} will no longer be monitored by "${monitorName}".`,
            message: `Remove the monitor "${monitorName}" from ${currentSite.name}?`,
            title: "Remove Monitor",
            tone: "danger",
        });

        if (!confirmed) {
            return;
        }

        clearError();

        await runSiteDetailsOperation(
            "useSiteDetails.handleRemoveMonitor",
            async () => {
                await removeMonitorFromSite(
                    currentSite.identifier,
                    selectedMonitor.id
                );
                logger.user.action("Monitor removed successfully", {
                    monitorId: selectedMonitor.id,
                    monitorType: selectedMonitor.type,
                    siteIdentifier: currentSite.identifier,
                });
            }
        );
    }, [
        clearError,
        currentSite.identifier,
        currentSite.name,
        removeMonitorFromSite,
        requestConfirmation,
        selectedMonitor,
    ]);

    // Site-level monitoring handlers
    const handleStartSiteMonitoring = useCallback(async () => {
        clearError();
        await runSiteDetailsOperation(
            "useSiteDetails.handleStartSiteMonitoring",
            async () => {
                // Start the monitoring processes directly - this handles setting
                // the monitoring state appropriately without requiring a separate
                // database update that could trigger validation issues
                await startSiteMonitoring(currentSite.identifier);
                logger.user.action("Started site monitoring", {
                    monitorCount: currentSite.monitors.length,
                    siteIdentifier: currentSite.identifier,
                });
            }
        );
    }, [
        clearError,
        currentSite.identifier,
        currentSite.monitors.length,
        startSiteMonitoring,
    ]);

    const handleStopSiteMonitoring = useCallback(async () => {
        clearError();
        await runSiteDetailsOperation(
            "useSiteDetails.handleStopSiteMonitoring",
            async () => {
                // Stop the monitoring processes directly - this handles setting
                // the monitoring state appropriately without requiring a separate
                // database update that could trigger validation issues
                await stopSiteMonitoring(currentSite.identifier);
                logger.user.action("Stopped site monitoring", {
                    monitorCount: currentSite.monitors.length,
                    siteIdentifier: currentSite.identifier,
                });
            }
        );
    }, [
        clearError,
        currentSite.identifier,
        currentSite.monitors.length,
        stopSiteMonitoring,
    ]);

    // Monitoring handlers
    const handleStartMonitoring = useCallback(async () => {
        clearError();
        await runSiteDetailsOperation(
            "useSiteDetails.handleStartMonitoring",
            async () => {
                await startSiteMonitorMonitoring(
                    currentSite.identifier,
                    selectedMonitorId
                );
                logger.user.action("Started monitoring", {
                    monitorId: selectedMonitorId,
                    siteIdentifier: currentSite.identifier,
                });
            }
        );
    }, [
        clearError,
        currentSite.identifier,
        selectedMonitorId,
        startSiteMonitorMonitoring,
    ]);

    const handleStopMonitoring = useCallback(async () => {
        clearError();
        await runSiteDetailsOperation(
            "useSiteDetails.handleStopMonitoring",
            async () => {
                await stopSiteMonitorMonitoring(
                    currentSite.identifier,
                    selectedMonitorId
                );
                logger.user.action("Stopped monitoring", {
                    monitorId: selectedMonitorId,
                    siteIdentifier: currentSite.identifier,
                });
            }
        );
    }, [
        clearError,
        currentSite.identifier,
        selectedMonitorId,
        stopSiteMonitorMonitoring,
    ]);

    // Interval change handlers
    const handleIntervalChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>): void => {
            const newInterval = safeInteger(
                e.target.value,
                DEFAULT_CHECK_INTERVAL
            );
            setMonitorEditStateById((previous) =>
                updateMonitorEditStateById({
                    monitorId: selectedMonitorId,
                    previous,
                    updater: (current) => ({
                        ...current,
                        intervalChanged:
                            newInterval !== selectedMonitorCheckInterval,
                        userEditedCheckInterval: newInterval,
                    }),
                })
            );
        },
        [
            selectedMonitorCheckInterval,
            selectedMonitorId,
            setMonitorEditStateById,
        ]
    );

    // eslint-disable-next-line react-hooks/preserve-manual-memoization -- Dependencies are intentionally explicit to align with shared validation and logging behaviour.
    const handleSaveInterval = useCallback(async () => {
        clearError();

        // Validate check interval using shared schema
        const validationResult = await validateMonitorFieldClientSide(
            selectedMonitor?.type ?? "http",
            "checkInterval",
            localCheckInterval
        );

        if (!validationResult.success) {
            const validationError = new Error(
                `Validation failed: ${validationResult.errors.join(", ")}`
            );
            logger.site.error(currentSite.identifier, validationError);
            throw validationError;
        }

        await updateSiteCheckInterval(
            currentSite.identifier,
            selectedMonitorId,
            localCheckInterval
        );
        setMonitorEditStateById((previous) =>
            updateMonitorEditStateById({
                monitorId: selectedMonitorId,
                previous,
                updater: (current) => ({
                    ...current,
                    intervalChanged: false,
                    userEditedCheckInterval: undefined,
                }),
            })
        );
        logger.user.action("Updated check interval", {
            monitorId: selectedMonitorId,
            newInterval: localCheckInterval,
            siteIdentifier: currentSite.identifier,
        });
    }, [
        clearError,
        currentSite.identifier,
        localCheckInterval,
        selectedMonitor?.type,
        selectedMonitorId,
        setMonitorEditStateById,
        updateSiteCheckInterval,
    ]);

    // Timeout change handlers
    const handleTimeoutChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>): void => {
            // Work directly with seconds in the UI
            const timeoutInSeconds = clampTimeoutSeconds(
                safeInteger(e.target.value, 5)
            );
            // Compare against the monitor's timeout converted to seconds
            const currentTimeoutInSeconds = getTimeoutSeconds(
                selectedMonitorTimeout
            );
            setMonitorEditStateById((previous) =>
                updateMonitorEditStateById({
                    monitorId: selectedMonitorId,
                    previous,
                    updater: (current) => ({
                        ...current,
                        timeoutChanged:
                            timeoutInSeconds !== currentTimeoutInSeconds,
                        userEditedTimeout: timeoutInSeconds,
                    }),
                })
            );
        },
        [
            selectedMonitorId,
            selectedMonitorTimeout,
            setMonitorEditStateById,
        ]
    );

    // eslint-disable-next-line react-hooks/preserve-manual-memoization -- Dependencies are intentionally explicit to align with shared validation and logging behaviour.
    const handleSaveTimeout = useCallback(async () => {
        clearError();

        // Validate timeout using shared schema
        const timeoutInMs = timeoutSecondsToMs(localTimeout);
        const validationResult = await validateMonitorFieldClientSide(
            selectedMonitor?.type ?? "http",
            "timeout",
            timeoutInMs
        );

        if (!validationResult.success) {
            const validationError = new Error(
                `Validation failed: ${validationResult.errors.join(", ")}`
            );
            logger.site.error(currentSite.identifier, validationError);
            throw validationError;
        }

        await updateMonitorTimeout(
            currentSite.identifier,
            selectedMonitorId,
            timeoutInMs
        );
        setMonitorEditStateById((previous) =>
            updateMonitorEditStateById({
                monitorId: selectedMonitorId,
                previous,
                updater: (current) => ({
                    ...current,
                    timeoutChanged: false,
                    userEditedTimeout: undefined,
                }),
            })
        );
        logger.user.action("Updated monitor timeout", {
            monitorId: selectedMonitorId,
            newTimeout: timeoutInMs,
            siteIdentifier: currentSite.identifier,
        });
    }, [
        clearError,
        currentSite.identifier,
        localTimeout,
        selectedMonitor?.type,
        selectedMonitorId,
        updateMonitorTimeout,
    ]);

    // Retry attempts change handlers
    const handleRetryAttemptsChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>): void => {
            const retryAttempts = safeInteger(e.target.value, 3);
            const currentRetryAttempts = selectedMonitorRetryAttempts ?? 0;
            setMonitorEditStateById((previous) =>
                updateMonitorEditStateById({
                    monitorId: selectedMonitorId,
                    previous,
                    updater: (current) => ({
                        ...current,
                        retryAttemptsChanged:
                            retryAttempts !== currentRetryAttempts,
                        userEditedRetryAttempts: retryAttempts,
                    }),
                })
            );
        },
        [
            selectedMonitorId,
            selectedMonitorRetryAttempts,
            setMonitorEditStateById,
        ]
    );

    // eslint-disable-next-line react-hooks/preserve-manual-memoization -- Dependencies are intentionally explicit to align with shared validation and logging behaviour.
    const handleSaveRetryAttempts = useCallback(async () => {
        clearError();

        // Validate retry attempts using shared schema
        const validationResult = await validateMonitorFieldClientSide(
            selectedMonitor?.type ?? "http",
            "retryAttempts",
            localRetryAttempts
        );

        if (!validationResult.success) {
            // Log validation error and let the store operation handle it
            // normally
            const validationError = new Error(
                `Validation failed: ${validationResult.errors.join(", ")}`
            );
            logger.site.error(currentSite.identifier, validationError);
            throw validationError;
        }

        await updateMonitorRetryAttempts(
            currentSite.identifier,
            selectedMonitorId,
            localRetryAttempts
        );
        setMonitorEditStateById((previous) =>
            updateMonitorEditStateById({
                monitorId: selectedMonitorId,
                previous,
                updater: (current) => ({
                    ...current,
                    retryAttemptsChanged: false,
                    userEditedRetryAttempts: undefined,
                }),
            })
        );
        logger.user.action("Updated monitor retry attempts", {
            monitorId: selectedMonitorId,
            newRetryAttempts: localRetryAttempts,
            siteIdentifier: currentSite.identifier,
        });
    }, [
        clearError,
        currentSite.identifier,
        localRetryAttempts,
        selectedMonitor?.type,
        selectedMonitorId,
        updateMonitorRetryAttempts,
    ]);

    // Name save handler
    const handleSaveName = useCallback(async () => {
        if (!hasUnsavedChanges) {
            return;
        }

        clearError();

        await runSiteDetailsOperation(
            "useSiteDetails.handleSaveName",
            async () => {
                const trimmedName = localName.trim();
                if (trimmedName) {
                    const updates = {
                        name: trimmedName,
                    };
                    await modifySite(currentSite.identifier, updates);
                }
                logger.user.action("Updated site name", {
                    identifier: currentSite.identifier,
                    name: localName.trim(),
                });
            }
        );
    }, [
        clearError,
        currentSite.identifier,
        hasUnsavedChanges,
        localName,
        modifySite,
    ]);

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
        localCheckInterval,
        localName,
        localRetryAttempts,
        localTimeout,
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
