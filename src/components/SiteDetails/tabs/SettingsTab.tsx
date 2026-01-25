/**
 * Settings tab component for configuring site monitoring parameters. Provides
 * interface for modifying site settings, intervals, and performing site
 * management actions.
 */

import type { Monitor, Site } from "@shared/types";
import type { ChangeEvent, JSX } from "react";

import { useCallback, useMemo } from "react";

import { logger } from "../../../services/logger";
import { useSettingsStore } from "../../../stores/settings/useSettingsStore";
import { SettingsTabDangerZoneCard } from "./SettingsTab.DangerZoneCard";
import { SettingsTabMonitoringConfigurationCard } from "./SettingsTab.MonitoringConfigurationCard";
import { SettingsTabNotificationsCard } from "./SettingsTab.NotificationsCard";
import { SettingsTabSiteConfigurationCard } from "./SettingsTab.SiteConfigurationCard";
import { SettingsTabSiteInformationCard } from "./SettingsTab.SiteInformationCard";
import { getDisplayIdentifier, useIdentifierLabel } from "./SettingsTab.utils";

type SettingsStoreState = ReturnType<typeof useSettingsStore.getState>;

const selectMutedSiteNotificationIdentifiers = (
    state: SettingsStoreState
): SettingsStoreState["settings"]["mutedSiteNotificationIdentifiers"] =>
    state.settings.mutedSiteNotificationIdentifiers;

const selectUpdateSettings = (
    state: SettingsStoreState
): SettingsStoreState["updateSettings"] => state.updateSettings;

/**
 * Props for the SettingsTab component.
 *
 * @public
 */
export interface SettingsTabProperties {
    /** Current site being configured */
    readonly currentSite: Site;
    /** Handler for monitor check interval changes */
    readonly handleIntervalChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    /** Handler for removing/deleting the site */
    readonly handleRemoveSite: () => Promise<void>;
    /** Handler for monitor retry attempts changes */
    readonly handleRetryAttemptsChange: (
        e: ChangeEvent<HTMLInputElement>
    ) => void;
    /** Handler for saving interval changes */
    readonly handleSaveInterval: () => void;
    /** Handler for saving site name changes */
    readonly handleSaveName: () => Promise<void>;
    /** Handler for saving retry attempts changes */
    readonly handleSaveRetryAttempts: () => Promise<void>;
    /** Handler for saving timeout changes */
    readonly handleSaveTimeout: () => Promise<void>;
    /** Handler for monitor timeout changes */
    readonly handleTimeoutChange: (e: ChangeEvent<HTMLInputElement>) => void;
    /** Whether there are unsaved changes pending */
    readonly hasUnsavedChanges: boolean;
    /** Whether the check interval has been modified */
    readonly intervalChanged: boolean;
    /** Whether any async operation is in progress */
    readonly isLoading: boolean;
    /** Local state value for check interval in milliseconds */
    readonly localCheckIntervalMs: number;
    /** Local state value for site name */
    readonly localName: string;
    /** Local state value for retry attempts */
    readonly localRetryAttempts: number;
    /**
     * Local state value for timeout in seconds (converted to ms when saving)
     */
    readonly localTimeoutSeconds: number;
    /** Whether the retry attempts have been changed */
    readonly retryAttemptsChanged: boolean;
    /** Currently selected monitor being configured */
    readonly selectedMonitor: Monitor;
    /** Function to update local site name state */
    readonly setLocalName: (name: string) => void;
    /** Whether the timeout has been changed */
    readonly timeoutChanged: boolean;
}

/**
 * Settings tab component providing site configuration interface.
 *
 * Features:
 *
 * - Site name editing with validation
 * - Monitor check interval configuration
 * - Monitor status and information display
 * - Site removal with confirmation
 * - Unsaved changes tracking and warnings
 * - Real-time settings validation
 *
 * @param props - Component props containing site data and handlers.
 *
 * @returns JSX element displaying settings interface.
 *
 * @public
 */
export const SettingsTab = ({
    currentSite,
    handleIntervalChange,
    handleRemoveSite,
    handleRetryAttemptsChange,
    handleSaveInterval,
    handleSaveName,
    handleSaveRetryAttempts,
    handleSaveTimeout,
    handleTimeoutChange,
    hasUnsavedChanges,
    intervalChanged,
    isLoading,
    localCheckIntervalMs,
    localName,
    localRetryAttempts,
    localTimeoutSeconds,
    retryAttemptsChanged,
    selectedMonitor,
    setLocalName,
    timeoutChanged,
}: SettingsTabProperties): JSX.Element => {
    const mutedSiteNotificationIdentifiers = useSettingsStore(
        selectMutedSiteNotificationIdentifiers
    );
    const updateSettings = useSettingsStore(selectUpdateSettings);
    const identifierLabel = useIdentifierLabel(selectedMonitor);
    const trimmedSiteName = localName.trim();
    const isSiteNameValid = trimmedSiteName.length > 0;
    const loggedHandleSaveName = useCallback(async () => {
        logger.user.action("Settings: Save site name initiated", {
            newName: trimmedSiteName,
            oldName: currentSite.name,
            siteIdentifier: currentSite.identifier,
        });
        await handleSaveName();
    }, [
        currentSite.identifier,
        currentSite.name,
        handleSaveName,
        trimmedSiteName,
    ]);

    const isSiteMuted = useMemo(
        () => mutedSiteNotificationIdentifiers.includes(currentSite.identifier),
        [currentSite.identifier, mutedSiteNotificationIdentifiers]
    );

    const handleToggleSiteMute = useCallback(() => {
        const currentMuted = mutedSiteNotificationIdentifiers;
        const nextMuted = isSiteMuted
            ? currentMuted.filter((id) => id !== currentSite.identifier)
            : [...currentMuted, currentSite.identifier];

        updateSettings({
            mutedSiteNotificationIdentifiers: nextMuted,
        });

        logger.user.action("Settings: Toggled site notification mute", {
            muted: !isSiteMuted,
            siteIdentifier: currentSite.identifier,
        });
    }, [
        currentSite.identifier,
        isSiteMuted,
        mutedSiteNotificationIdentifiers,
        updateSettings,
    ]);

    const loggedHandleSaveInterval = useCallback(() => {
        logger.user.action("Settings: Save check interval", {
            monitorId: selectedMonitor.id,
            newInterval: localCheckIntervalMs,
            oldInterval: selectedMonitor.checkInterval,
            siteIdentifier: currentSite.identifier,
        });
        handleSaveInterval();
    }, [
        currentSite.identifier,
        handleSaveInterval,
        localCheckIntervalMs,
        selectedMonitor.checkInterval,
        selectedMonitor.id,
    ]);

    const loggedHandleRemoveSite = useCallback(async () => {
        logger.user.action("Settings: Remove site initiated", {
            siteIdentifier: currentSite.identifier,
            siteName: currentSite.name,
        });
        await handleRemoveSite();
    }, [
        currentSite.identifier,
        currentSite.name,
        handleRemoveSite,
    ]);

    const loggedHandleSaveTimeout = useCallback(async () => {
        logger.user.action("Settings: Save timeout", {
            monitorId: selectedMonitor.id,
            newTimeoutSeconds: localTimeoutSeconds,
            oldTimeout: selectedMonitor.timeout,
            siteIdentifier: currentSite.identifier,
        });
        await handleSaveTimeout();
    }, [
        currentSite.identifier,
        handleSaveTimeout,
        localTimeoutSeconds,
        selectedMonitor.id,
        selectedMonitor.timeout,
    ]);

    const loggedHandleSaveRetryAttempts = useCallback(async () => {
        logger.user.action("Settings: Save retry attempts", {
            monitorId: selectedMonitor.id,
            newRetryAttempts: localRetryAttempts,
            oldRetryAttempts: selectedMonitor.retryAttempts,
            siteIdentifier: currentSite.identifier,
        });
        await handleSaveRetryAttempts();
    }, [
        currentSite.identifier,
        handleSaveRetryAttempts,
        localRetryAttempts,
        selectedMonitor.id,
        selectedMonitor.retryAttempts,
    ]);

    // UseCallback handlers for jsx-no-bind compliance
    const handleNameChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setLocalName(e.target.value);
        },
        [setLocalName]
    );

    const handleSaveNameClick = useCallback(() => {
        void loggedHandleSaveName();
    }, [loggedHandleSaveName]);

    const handleSaveTimeoutClick = useCallback(() => {
        void loggedHandleSaveTimeout();
    }, [loggedHandleSaveTimeout]);

    const handleSaveRetryAttemptsClick = useCallback(() => {
        void loggedHandleSaveRetryAttempts();
    }, [loggedHandleSaveRetryAttempts]);

    const handleRemoveSiteClick = useCallback(() => {
        void loggedHandleRemoveSite();
    }, [loggedHandleRemoveSite]);

    const displayIdentifier = useMemo(
        () => getDisplayIdentifier(currentSite, selectedMonitor),
        [currentSite, selectedMonitor]
    );

    return (
        <div className="space-y-6" data-testid="settings-tab">
            <SettingsTabSiteConfigurationCard
                displayIdentifier={displayIdentifier}
                hasUnsavedChanges={hasUnsavedChanges}
                identifierLabel={identifierLabel}
                isLoading={isLoading}
                isSiteNameValid={isSiteNameValid}
                localName={localName}
                onNameChange={handleNameChange}
                onSaveName={handleSaveNameClick}
            />

            <SettingsTabNotificationsCard
                isLoading={isLoading}
                isSiteMuted={isSiteMuted}
                onToggleSiteMute={handleToggleSiteMute}
            />

            <SettingsTabMonitoringConfigurationCard
                handleIntervalChange={handleIntervalChange}
                handleRetryAttemptsChange={handleRetryAttemptsChange}
                handleTimeoutChange={handleTimeoutChange}
                intervalChanged={intervalChanged}
                localCheckIntervalMs={localCheckIntervalMs}
                localRetryAttempts={localRetryAttempts}
                localTimeoutSeconds={localTimeoutSeconds}
                onSaveInterval={loggedHandleSaveInterval}
                onSaveRetryAttempts={handleSaveRetryAttemptsClick}
                onSaveTimeout={handleSaveTimeoutClick}
                retryAttemptsChanged={retryAttemptsChanged}
                timeoutChanged={timeoutChanged}
            />

            <SettingsTabSiteInformationCard
                displayIdentifier={displayIdentifier}
                identifierLabel={identifierLabel}
                selectedMonitor={selectedMonitor}
            />

            <SettingsTabDangerZoneCard
                isLoading={isLoading}
                onRemoveSite={handleRemoveSiteClick}
            />
        </div>
    );
};
