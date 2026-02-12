/**
 * Handler hooks for {@link src/hooks/site/useSiteDetails#useSiteDetails}.
 *
 * @remarks
 * Split out of the main hook to keep the core hook readable and to satisfy the
 * repo's ESLint complexity constraints.
 *
 * @packageDocumentation
 */

import type { Monitor, Site } from "@shared/types";

import { safeInteger } from "@shared/validation/validatorUtils";
import { type ChangeEvent, useCallback } from "react";

import type { SiteDetailsTab } from "../../stores/ui/types";
import type { ConfirmDialogOptions } from "../ui/useConfirmDialog";
import type {
    MonitorEditState,
    MonitorEditStateByIdSetter,
} from "./useSiteDetails.utils";

import { DEFAULT_CHECK_INTERVAL } from "../../constants";
import { logger } from "../../services/logger";
import {
    clampTimeoutSeconds,
    getTimeoutSeconds,
} from "../../utils/timeoutUtils";
import {
    applySelectedMonitorIdChange,
    removeMonitorWithConfirmation,
    removeSiteWithConfirmation,
    saveMonitorCheckInterval,
    saveMonitorRetryAttempts,
    saveMonitorTimeout,
    saveSiteName,
} from "./useSiteDetails.operations";
import {
    clampRetryAttempts,
    runSiteDetailsOperation,
    updateMonitorEditStateById,
} from "./useSiteDetails.utils";

/**
 * Selection handlers for {@link src/hooks/site/useSiteDetails#useSiteDetails}.
 *
 * @public
 */
export function useSiteDetailsSelectionHandlers(
    activeSiteDetailsTab: SiteDetailsTab,
    currentSiteIdentifier: string,
    setActiveSiteDetailsTab: (tab: SiteDetailsTab) => void,
    setSelectedMonitorId: (siteIdentifier: string, monitorId: string) => void
): {
    readonly handleMonitorIdChange: (e: ChangeEvent<HTMLSelectElement>) => void;
} {
    const handleMonitorIdChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            applySelectedMonitorIdChange({
                activeSiteDetailsTab,
                newMonitorId: e.target.value,
                setActiveSiteDetailsTab,
                setSelectedMonitorId,
                siteIdentifier: currentSiteIdentifier,
            });
        },
        [
            activeSiteDetailsTab,
            currentSiteIdentifier,
            setActiveSiteDetailsTab,
            setSelectedMonitorId,
        ]
    );

    return { handleMonitorIdChange };
}

/**
 * Remove-site / remove-monitor handlers for
 * {@link src/hooks/site/useSiteDetails#useSiteDetails}.
 *
 * @public
 */
export function useSiteDetailsRemovalHandlers(
    clearError: () => void,
    currentSite: Site,
    deleteSite: (siteIdentifier: string) => Promise<void>,
    removeMonitorFromSite: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>,
    requestConfirmation: (options: ConfirmDialogOptions) => Promise<boolean>,
    selectedMonitor: Monitor | undefined
): {
    readonly handleRemoveMonitor: () => Promise<void>;
    readonly handleRemoveSite: () => Promise<void>;
} {
    const handleRemoveSite = useCallback(async () => {
        await runSiteDetailsOperation(
            "useSiteDetails.handleRemoveSite",
            async () =>
                removeSiteWithConfirmation({
                    clearError,
                    currentSite,
                    deleteSite,
                    requestConfirmation,
                })
        );
    }, [
        clearError,
        currentSite,
        deleteSite,
        requestConfirmation,
    ]);

    const handleRemoveMonitor = useCallback(async () => {
        await runSiteDetailsOperation(
            "useSiteDetails.handleRemoveMonitor",
            async () =>
                removeMonitorWithConfirmation({
                    clearError,
                    currentSite,
                    removeMonitorFromSite,
                    requestConfirmation,
                    selectedMonitor,
                })
        );
    }, [
        clearError,
        currentSite,
        removeMonitorFromSite,
        requestConfirmation,
        selectedMonitor,
    ]);

    return { handleRemoveMonitor, handleRemoveSite };
}

/**
 * Monitoring handlers for {@link src/hooks/site/useSiteDetails#useSiteDetails}.
 *
 * @public
 */
export function useSiteDetailsMonitoringHandlers(
    checkSiteNow: (siteIdentifier: string, monitorId: string) => Promise<void>,
    clearError: () => void,
    currentSite: Site,
    selectedMonitorId: string,
    startSiteMonitoring: (siteIdentifier: string) => Promise<void>,
    startSiteMonitorMonitoring: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>,
    stopSiteMonitoring: (siteIdentifier: string) => Promise<void>,
    stopSiteMonitorMonitoring: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>
): {
    readonly handleCheckNow: () => Promise<void>;
    readonly handleStartMonitoring: () => Promise<void>;
    readonly handleStartSiteMonitoring: () => Promise<void>;
    readonly handleStopMonitoring: () => Promise<void>;
    readonly handleStopSiteMonitoring: () => Promise<void>;
} {
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
        currentSite,
        selectedMonitorId,
    ]);

    const handleStartSiteMonitoring = useCallback(async () => {
        clearError();
        await runSiteDetailsOperation(
            "useSiteDetails.handleStartSiteMonitoring",
            async () => {
                await startSiteMonitoring(currentSite.identifier);
                logger.user.action("Started site monitoring", {
                    monitorCount: currentSite.monitors.length,
                    siteIdentifier: currentSite.identifier,
                });
            }
        );
    }, [
        clearError,
        currentSite,
        startSiteMonitoring,
    ]);

    const handleStopSiteMonitoring = useCallback(async () => {
        clearError();
        await runSiteDetailsOperation(
            "useSiteDetails.handleStopSiteMonitoring",
            async () => {
                await stopSiteMonitoring(currentSite.identifier);
                logger.user.action("Stopped site monitoring", {
                    monitorCount: currentSite.monitors.length,
                    siteIdentifier: currentSite.identifier,
                });
            }
        );
    }, [
        clearError,
        currentSite,
        stopSiteMonitoring,
    ]);

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
        currentSite,
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
        currentSite,
        selectedMonitorId,
        stopSiteMonitorMonitoring,
    ]);

    return {
        handleCheckNow,
        handleStartMonitoring,
        handleStartSiteMonitoring,
        handleStopMonitoring,
        handleStopSiteMonitoring,
    };
}

/**
 * Settings edit/save handlers for
 * {@link src/hooks/site/useSiteDetails#useSiteDetails}.
 *
 * @public
 */
export function useSiteDetailsSettingsHandlers(
    clearError: () => void,
    currentSiteIdentifier: string,
    localCheckIntervalMs: number,
    localRetryAttempts: number,
    localTimeoutSeconds: number,
    selectedMonitorCheckInterval: number | undefined,
    selectedMonitorId: string,
    selectedMonitorRetryAttempts: number | undefined,
    selectedMonitorTimeout: number | undefined,
    selectedMonitorType: Monitor["type"] | undefined,
    setMonitorEditStateById: MonitorEditStateByIdSetter,
    updateMonitorRetryAttempts: (
        siteIdentifier: string,
        monitorId: string,
        retryAttempts: number
    ) => Promise<void>,
    updateMonitorTimeout: (
        siteIdentifier: string,
        monitorId: string,
        timeout: number
    ) => Promise<void>,
    updateSiteCheckInterval: (
        siteIdentifier: string,
        monitorId: string,
        checkInterval: number
    ) => Promise<void>
): {
    readonly handleIntervalChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    readonly handleRetryAttemptsChange: (
        e: ChangeEvent<HTMLInputElement>
    ) => void;
    readonly handleSaveInterval: () => Promise<void>;
    readonly handleSaveRetryAttempts: () => Promise<void>;
    readonly handleSaveTimeout: () => Promise<void>;
    readonly handleTimeoutChange: (e: ChangeEvent<HTMLInputElement>) => void;
} {
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
                    updater: (current): MonitorEditState => ({
                        ...current,
                        intervalChanged:
                            newInterval !== selectedMonitorCheckInterval,
                        userEditedCheckIntervalMs: newInterval,
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

    const handleSaveInterval = useCallback(async () => {
        clearError();
        await saveMonitorCheckInterval({
            currentSiteIdentifier,
            localCheckIntervalMs,
            selectedMonitorId,
            selectedMonitorType,
            setMonitorEditStateById,
            updateSiteCheckInterval,
        });
    }, [
        clearError,
        currentSiteIdentifier,
        localCheckIntervalMs,
        selectedMonitorId,
        selectedMonitorType,
        setMonitorEditStateById,
        updateSiteCheckInterval,
    ]);

    const handleTimeoutChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>): void => {
            const timeoutInSeconds = clampTimeoutSeconds(
                safeInteger(e.target.value, 5)
            );
            const currentTimeoutInSeconds = getTimeoutSeconds(
                selectedMonitorTimeout
            );

            setMonitorEditStateById((previous) =>
                updateMonitorEditStateById({
                    monitorId: selectedMonitorId,
                    previous,
                    updater: (current): MonitorEditState => ({
                        ...current,
                        timeoutChanged:
                            timeoutInSeconds !== currentTimeoutInSeconds,
                        userEditedTimeoutSeconds: timeoutInSeconds,
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

    const handleSaveTimeout = useCallback(async () => {
        clearError();
        await saveMonitorTimeout({
            currentSiteIdentifier,
            localTimeoutSeconds,
            selectedMonitorId,
            selectedMonitorType,
            setMonitorEditStateById,
            updateMonitorTimeout,
        });
    }, [
        clearError,
        currentSiteIdentifier,
        localTimeoutSeconds,
        selectedMonitorId,
        selectedMonitorType,
        setMonitorEditStateById,
        updateMonitorTimeout,
    ]);

    const handleRetryAttemptsChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>): void => {
            const retryAttempts = safeInteger(e.target.value, 3);
            const clampedRetryAttempts = clampRetryAttempts(retryAttempts);
            const currentRetryAttempts = selectedMonitorRetryAttempts ?? 0;

            setMonitorEditStateById((previous) =>
                updateMonitorEditStateById({
                    monitorId: selectedMonitorId,
                    previous,
                    updater: (current): MonitorEditState => ({
                        ...current,
                        retryAttemptsChanged:
                            clampedRetryAttempts !== currentRetryAttempts,
                        userEditedRetryAttempts: clampedRetryAttempts,
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

    const handleSaveRetryAttempts = useCallback(async () => {
        clearError();
        await saveMonitorRetryAttempts({
            currentSiteIdentifier,
            localRetryAttempts,
            selectedMonitorId,
            selectedMonitorType,
            setMonitorEditStateById,
            updateMonitorRetryAttempts,
        });
    }, [
        clearError,
        currentSiteIdentifier,
        localRetryAttempts,
        selectedMonitorId,
        selectedMonitorType,
        setMonitorEditStateById,
        updateMonitorRetryAttempts,
    ]);

    return {
        handleIntervalChange,
        handleRetryAttemptsChange,
        handleSaveInterval,
        handleSaveRetryAttempts,
        handleSaveTimeout,
        handleTimeoutChange,
    };
}

/**
 * Site-name save handler for
 * {@link src/hooks/site/useSiteDetails#useSiteDetails}.
 *
 * @public
 */
export function useSiteDetailsNameHandler(
    clearError: () => void,
    currentSiteIdentifier: string,
    currentSiteName: string,
    localName: string,
    modifySite: (
        siteIdentifier: string,
        updates: { readonly name: string }
    ) => Promise<void>,
    setUserEditedSiteName: (value: string | undefined) => void
): { readonly handleSaveName: () => Promise<void> } {
    const handleSaveName = useCallback(async () => {
        await runSiteDetailsOperation(
            "useSiteDetails.handleSaveName",
            async () =>
                saveSiteName({
                    clearError,
                    currentSiteIdentifier,
                    currentSiteName,
                    localName,
                    modifySite,
                    setUserEditedSiteName,
                })
        );
    }, [
        clearError,
        currentSiteIdentifier,
        currentSiteName,
        localName,
        modifySite,
        setUserEditedSiteName,
    ]);

    return { handleSaveName };
}
