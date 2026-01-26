/**
 * Helper operations for {@link useSiteDetails}.
 *
 * @remarks
 * These helpers exist primarily to keep the main hook implementation readable
 * and to keep ESLint complexity checks from turning the hook into a dumping
 * ground for branching UI workflows.
 *
 * All helpers are **renderer-only** and may safely depend on renderer services
 * (e.g. {@link logger}).
 *
 * @packageDocumentation
 */

import type { Monitor, Site } from "@shared/types";

import type { SiteDetailsTab } from "../../stores/ui/types";
import type { ConfirmDialogOptions } from "../ui/useConfirmDialog";
import type { MonitorEditState } from "./useSiteDetails.utils";

import { logger } from "../../services/logger";
import { validateMonitorFieldClientSide } from "../../utils/monitorValidation";
import { timeoutSecondsToMs } from "../../utils/timeoutUtils";
import { updateMonitorEditStateById } from "./useSiteDetails.utils";

/**
 * Minimal setter type used for updating per-monitor edit state.
 *
 * @public
 */
export type MonitorEditStateByIdSetter = (
    updater: (
        previous: Readonly<Record<string, MonitorEditState>>
    ) => Record<string, MonitorEditState>
) => void;

/**
 * Applies a newly selected monitor ID and keeps analytics tabs aligned.
 *
 * @public
 */
export function applySelectedMonitorIdChange(args: {
    readonly activeSiteDetailsTab: SiteDetailsTab;
    readonly newMonitorId: string;
    readonly setActiveSiteDetailsTab: (tab: SiteDetailsTab) => void;
    readonly setSelectedMonitorId: (
        siteIdentifier: string,
        monitorId: string
    ) => void;
    readonly siteIdentifier: string;
}): void {
    const {
        activeSiteDetailsTab,
        newMonitorId,
        setActiveSiteDetailsTab,
        setSelectedMonitorId,
        siteIdentifier,
    } = args;

    setSelectedMonitorId(siteIdentifier, newMonitorId);

    // If current tab is an analytics tab, switch to the new monitor's analytics
    // tab.
    if (activeSiteDetailsTab.endsWith("-analytics")) {
        setActiveSiteDetailsTab(`${newMonitorId}-analytics`);
    }
}

/**
 * Requests confirmation and removes a site.
 *
 * @public
 */
export async function removeSiteWithConfirmation(args: {
    readonly clearError: () => void;
    readonly currentSite: Site;
    readonly deleteSite: (siteIdentifier: string) => Promise<void>;
    readonly requestConfirmation: (
        options: ConfirmDialogOptions
    ) => Promise<boolean>;
}): Promise<void> {
    const { clearError, currentSite, deleteSite, requestConfirmation } = args;

    const confirmed = await requestConfirmation({
        cancelLabel: "Keep Site",
        confirmLabel: "Remove Site",
        details: "This action permanently removes the site and its monitors.",
        emphasisText: currentSite.name,
        message: `Are you sure you want to remove ${currentSite.name}?`,
        title: "Remove Site",
        tone: "danger",
    });

    if (!confirmed) {
        return;
    }

    clearError();

    await deleteSite(currentSite.identifier);
    logger.site.removed(currentSite.identifier);
}

/**
 * Requests confirmation and removes a monitor from a site.
 *
 * @public
 */
export async function removeMonitorWithConfirmation(args: {
    readonly clearError: () => void;
    readonly currentSite: Site;
    readonly removeMonitorFromSite: (
        siteIdentifier: string,
        monitorId: string
    ) => Promise<void>;
    readonly requestConfirmation: (
        options: ConfirmDialogOptions
    ) => Promise<boolean>;
    readonly selectedMonitor: Monitor | undefined;
}): Promise<void> {
    const {
        clearError,
        currentSite,
        removeMonitorFromSite,
        requestConfirmation,
        selectedMonitor,
    } = args;

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
        emphasisText: monitorName,
        message: `Remove the monitor "${monitorName}" from ${currentSite.name}?`,
        title: "Remove Monitor",
        tone: "danger",
    });

    if (!confirmed) {
        return;
    }

    clearError();

    await removeMonitorFromSite(currentSite.identifier, selectedMonitor.id);
    logger.user.action("Monitor removed successfully", {
        monitorId: selectedMonitor.id,
        monitorType: selectedMonitor.type,
        siteIdentifier: currentSite.identifier,
    });
}

/**
 * Saves the site name, validating and resetting the local override.
 *
 * @public
 */
export async function saveSiteName(args: {
    readonly clearError: () => void;
    readonly currentSiteIdentifier: string;
    readonly currentSiteName: string;
    readonly localName: string;
    readonly modifySite: (
        siteIdentifier: string,
        updates: { readonly name: string }
    ) => Promise<void>;
    readonly setUserEditedSiteName: (value: string | undefined) => void;
}): Promise<void> {
    const {
        clearError,
        currentSiteIdentifier,
        currentSiteName,
        localName,
        modifySite,
        setUserEditedSiteName,
    } = args;

    clearError();

    const trimmedName = localName.trim();

    // If the user hasn't meaningfully changed the name, treat save as a
    // no-op and ensure we don't keep an unnecessary local override around.
    if (trimmedName === currentSiteName.trim()) {
        setUserEditedSiteName(undefined);
        return;
    }

    if (!trimmedName) {
        // Treat "save" with an empty name as "revert".
        setUserEditedSiteName(undefined);
        return;
    }

    await modifySite(currentSiteIdentifier, { name: trimmedName });

    // Reset the local override so the UI re-syncs to the store value.
    setUserEditedSiteName(undefined);

    logger.user.action("Updated site name", {
        identifier: currentSiteIdentifier,
        name: trimmedName,
    });
}

/**
 * Saves the selected monitor's check interval.
 *
 * @public
 */
export async function saveMonitorCheckInterval(args: {
    readonly currentSiteIdentifier: string;
    readonly localCheckIntervalMs: number;
    readonly selectedMonitorId: string;
    readonly selectedMonitorType: Monitor["type"] | undefined;
    readonly setMonitorEditStateById: MonitorEditStateByIdSetter;
    readonly updateSiteCheckInterval: (
        siteIdentifier: string,
        monitorId: string,
        checkInterval: number
    ) => Promise<void>;
}): Promise<void> {
    const {
        currentSiteIdentifier,
        localCheckIntervalMs,
        selectedMonitorId,
        selectedMonitorType,
        setMonitorEditStateById,
        updateSiteCheckInterval,
    } = args;

    const validationResult = await validateMonitorFieldClientSide(
        selectedMonitorType ?? "http",
        "checkInterval",
        localCheckIntervalMs
    );

    if (!validationResult.success) {
        const validationError = new Error(
            `Validation failed: ${validationResult.errors.join(", ")}`
        );
        logger.site.error(currentSiteIdentifier, validationError);
        throw validationError;
    }

    await updateSiteCheckInterval(
        currentSiteIdentifier,
        selectedMonitorId,
        localCheckIntervalMs
    );

    setMonitorEditStateById((previous) =>
        updateMonitorEditStateById({
            monitorId: selectedMonitorId,
            previous,
            updater: (current) => ({
                ...current,
                intervalChanged: false,
                userEditedCheckIntervalMs: undefined,
            }),
        })
    );

    logger.user.action("Updated check interval", {
        monitorId: selectedMonitorId,
        newInterval: localCheckIntervalMs,
        siteIdentifier: currentSiteIdentifier,
    });
}

/**
 * Saves the selected monitor's timeout.
 *
 * @public
 */
export async function saveMonitorTimeout(args: {
    readonly currentSiteIdentifier: string;
    readonly localTimeoutSeconds: number;
    readonly selectedMonitorId: string;
    readonly selectedMonitorType: Monitor["type"] | undefined;
    readonly setMonitorEditStateById: MonitorEditStateByIdSetter;
    readonly updateMonitorTimeout: (
        siteIdentifier: string,
        monitorId: string,
        timeout: number
    ) => Promise<void>;
}): Promise<void> {
    const {
        currentSiteIdentifier,
        localTimeoutSeconds,
        selectedMonitorId,
        selectedMonitorType,
        setMonitorEditStateById,
        updateMonitorTimeout,
    } = args;

    const timeoutInMs = timeoutSecondsToMs(localTimeoutSeconds);
    const validationResult = await validateMonitorFieldClientSide(
        selectedMonitorType ?? "http",
        "timeout",
        timeoutInMs
    );

    if (!validationResult.success) {
        const validationError = new Error(
            `Validation failed: ${validationResult.errors.join(", ")}`
        );
        logger.site.error(currentSiteIdentifier, validationError);
        throw validationError;
    }

    await updateMonitorTimeout(
        currentSiteIdentifier,
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
                userEditedTimeoutSeconds: undefined,
            }),
        })
    );

    logger.user.action("Updated monitor timeout", {
        monitorId: selectedMonitorId,
        newTimeout: timeoutInMs,
        siteIdentifier: currentSiteIdentifier,
    });
}

/**
 * Saves the selected monitor's retry attempts.
 *
 * @public
 */
export async function saveMonitorRetryAttempts(args: {
    readonly currentSiteIdentifier: string;
    readonly localRetryAttempts: number;
    readonly selectedMonitorId: string;
    readonly selectedMonitorType: Monitor["type"] | undefined;
    readonly setMonitorEditStateById: MonitorEditStateByIdSetter;
    readonly updateMonitorRetryAttempts: (
        siteIdentifier: string,
        monitorId: string,
        retryAttempts: number
    ) => Promise<void>;
}): Promise<void> {
    const {
        currentSiteIdentifier,
        localRetryAttempts,
        selectedMonitorId,
        selectedMonitorType,
        setMonitorEditStateById,
        updateMonitorRetryAttempts,
    } = args;

    const validationResult = await validateMonitorFieldClientSide(
        selectedMonitorType ?? "http",
        "retryAttempts",
        localRetryAttempts
    );

    if (!validationResult.success) {
        const validationError = new Error(
            `Validation failed: ${validationResult.errors.join(", ")}`
        );
        logger.site.error(currentSiteIdentifier, validationError);
        throw validationError;
    }

    await updateMonitorRetryAttempts(
        currentSiteIdentifier,
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
        siteIdentifier: currentSiteIdentifier,
    });
}
