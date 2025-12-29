/**
 * Settings tab component for configuring site monitoring parameters. Provides
 * interface for modifying site settings, intervals, and performing site
 * management actions.
 */

import type { Monitor, Site } from "@shared/types";
import type { ChangeEvent, JSX } from "react";

import { withUtilityErrorHandling } from "@shared/utils/errorHandling";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
    CHECK_INTERVALS,
    RETRY_CONSTRAINTS,
    TIMEOUT_CONSTRAINTS,
} from "../../../constants";
import { logger } from "../../../services/logger";
import { useSettingsStore } from "../../../stores/settings/useSettingsStore";
import { ThemedBadge } from "../../../theme/components/ThemedBadge";
import { ThemedBox } from "../../../theme/components/ThemedBox";
import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedCard } from "../../../theme/components/ThemedCard";
import { ThemedInput } from "../../../theme/components/ThemedInput";
import { ThemedSelect } from "../../../theme/components/ThemedSelect";
import { ThemedText } from "../../../theme/components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import {
    getMonitorDisplayIdentifier,
    getMonitorTypeDisplayLabel,
    UiDefaults,
} from "../../../utils/fallbacks";
import { AppIcons, getIconSize } from "../../../utils/icons";
import { getMonitorTypeConfig } from "../../../utils/monitorTypeHelper";
import { formatRetryAttemptsText, getIntervalLabel } from "../../../utils/time";
import { SiteSettingsHelpText } from "./SiteSettingsHelpText";
import { SiteSettingsNumberField } from "./SiteSettingsNumberField";

const WarningIcon = AppIcons.status.warning;
const DurationIcon = AppIcons.metrics.time;
const BellIcon = AppIcons.ui.bell;
const IdentifierIcon = AppIcons.ui.link;
const HistoryIcon = AppIcons.ui.history;
const LockIcon = AppIcons.ui.lock;
const LastCheckedIcon = AppIcons.metrics.activity;
const RetryIcon = AppIcons.actions.refreshAlt;
const SiteIcon = AppIcons.ui.site;
const UnlockIcon = AppIcons.ui.unlock;

const DangerZoneIcon = AppIcons.status.downFilled;
const InfoIcon = AppIcons.ui.info;
const SaveIcon = AppIcons.actions.save;
const SettingsIcon = AppIcons.settings.gear;
const TrashIcon = AppIcons.actions.remove;

const CHECK_INTERVAL_INFLIGHT_WARNING_SECONDS = 15;

function formatSecondsWithMinutes(totalSeconds: number): string {
    const safeSeconds = Number.isFinite(totalSeconds)
        ? Math.max(0, Math.round(totalSeconds))
        : 0;

    if (safeSeconds < 60) {
        return `${safeSeconds}s`;
    }

    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${safeSeconds}s (${minutes}m ${seconds}s)`;
}

function calculateBackoffSeconds(retryAttempts: number): number {
    if (retryAttempts <= 0) {
        return 0;
    }

    let backoffSeconds = 0;
    for (let i = 0; i < retryAttempts; i += 1) {
        backoffSeconds += 2 ** i;
    }

    return backoffSeconds;
}

function calculateMaxCheckDurationSeconds(args: {
    retryAttempts: number;
    timeoutSeconds: number;
}): {
    readonly backoffSeconds: number;
    readonly totalAttempts: number;
    readonly totalSeconds: number;
} {
    const totalAttempts = args.retryAttempts + 1;
    const backoffSeconds = calculateBackoffSeconds(args.retryAttempts);
    const totalSeconds = args.timeoutSeconds * totalAttempts + backoffSeconds;

    return {
        backoffSeconds,
        totalAttempts,
        totalSeconds,
    };
}

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
    /** Local state value for check interval */
    readonly localCheckInterval: number;
    /** Local state value for site name */
    readonly localName: string;
    /** Local state value for retry attempts */
    readonly localRetryAttempts: number;
    /**
     * Local state value for timeout in seconds (converted to ms when saving)
     */
    readonly localTimeout: number;
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
 * Generate a display identifier based on the monitor type. Uses dynamic utility
 * instead of hardcoded backward compatibility patterns.
 */
function getDisplayIdentifier(
    currentSite: Site,
    selectedMonitor: Monitor
): string {
    return getMonitorDisplayIdentifier(selectedMonitor, currentSite.identifier);
}

/**
 * Generate a display label for the identifier field based on monitor type.
 */
async function getIdentifierLabel(selectedMonitor: Monitor): Promise<string> {
    return withUtilityErrorHandling(
        async () => {
            const config = await getMonitorTypeConfig(selectedMonitor.type);
            if (config?.fields) {
                // Generate label based on primary field(s)
                const primaryField = config.fields.find(
                    (field) => field.required
                );
                if (primaryField) {
                    return primaryField.label;
                }
                // Fallback to first field
                if (config.fields.length > 0 && config.fields[0]) {
                    return config.fields[0].label;
                }
            }
            // Use dynamic utility instead of hardcoded backward compatibility
            // patterns
            return getMonitorTypeDisplayLabel(selectedMonitor.type);
        },
        "Get identifier label for monitor type",
        UiDefaults.unknownLabel
    );
}

/**
 * Computes the primary identifier label for the selected monitor type and keeps
 * it in sync as monitor configuration is loaded.
 *
 * @param selectedMonitor - Monitor whose identifier metadata should be
 *   displayed.
 *
 * @returns Localised label string for the monitor identifier field.
 */
function useIdentifierLabel(selectedMonitor: Monitor): string {
    const [label, setLabel] = useState<string>(UiDefaults.loadingLabel);

    useEffect(
        function loadLabelWithCleanup() {
            let isCancelled = false;

            const loadLabel = async (): Promise<void> => {
                const identifierLabel =
                    await getIdentifierLabel(selectedMonitor);
                if (!isCancelled) {
                    setLabel(identifierLabel);
                }
            };

            void loadLabel();

            return (): void => {
                isCancelled = true;
            };
        },
        [selectedMonitor]
    );

    return label;
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
    localCheckInterval,
    localName,
    localRetryAttempts,
    localTimeout,
    retryAttemptsChanged,
    selectedMonitor,
    setLocalName,
    timeoutChanged,
}: SettingsTabProperties): JSX.Element => {
    const { currentTheme } = useTheme();
    const { settings, updateSettings } = useSettingsStore();
    const identifierLabel = useIdentifierLabel(selectedMonitor);
    const trimmedSiteName = localName.trim();
    const isSiteNameValid = trimmedSiteName.length > 0;
    const isTimeoutValid =
        localTimeout >= TIMEOUT_CONSTRAINTS.MIN &&
        localTimeout <= TIMEOUT_CONSTRAINTS.MAX;
    const isRetryAttemptsValid =
        localRetryAttempts >= RETRY_CONSTRAINTS.MIN &&
        localRetryAttempts <= RETRY_CONSTRAINTS.MAX;

    // Icon colors configuration
    const getIconColors = (): {
        danger: string;
        info: string;
        monitoring: string;
        settings: string;
        timing: string;
    } => ({
        danger: currentTheme.colors.error,
        info: currentTheme.colors.info,
        monitoring: currentTheme.colors.primary[600],
        settings: currentTheme.colors.primary[500],
        timing: currentTheme.colors.warning,
    });

    const iconColors = getIconColors();

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
        () =>
            settings.mutedSiteNotificationIdentifiers.includes(
                currentSite.identifier
            ),
        [currentSite.identifier, settings.mutedSiteNotificationIdentifiers]
    );

    const handleToggleSiteMute = useCallback(() => {
        const currentMuted = settings.mutedSiteNotificationIdentifiers;
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
        settings.mutedSiteNotificationIdentifiers,
        updateSettings,
    ]);

    const loggedHandleSaveInterval = useCallback(() => {
        logger.user.action("Settings: Save check interval", {
            monitorId: selectedMonitor.id,
            newInterval: localCheckInterval,
            oldInterval: selectedMonitor.checkInterval,
            siteIdentifier: currentSite.identifier,
        });
        handleSaveInterval();
    }, [
        currentSite.identifier,
        handleSaveInterval,
        localCheckInterval,
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
            newTimeout: localTimeout,
            oldTimeout: selectedMonitor.timeout,
            siteIdentifier: currentSite.identifier,
        });
        await handleSaveTimeout();
    }, [
        currentSite.identifier,
        handleSaveTimeout,
        localTimeout,
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

    const buttonIconSize = getIconSize("sm");
    const fieldIconSize = getIconSize("xs");

    const settingsIcon = useMemo(
        () => <SettingsIcon color={iconColors.settings} />,
        [iconColors.settings]
    );
    const saveIcon = useMemo(
        () => <SaveIcon aria-hidden size={buttonIconSize} />,
        [buttonIconSize]
    );
    const timerIcon = useMemo(
        () => <DurationIcon color={iconColors.timing} size={18} />,
        [iconColors.timing]
    );
    const notificationsIcon = useMemo(
        () => <BellIcon color={iconColors.info} size={18} />,
        [iconColors.info]
    );
    const infoIcon = useMemo(
        () => <InfoIcon color={iconColors.info} />,
        [iconColors.info]
    );
    const dangerIcon = useMemo(
        () => <DangerZoneIcon color={iconColors.danger} />,
        [iconColors.danger]
    );
    const trashIcon = useMemo(
        () => <TrashIcon aria-hidden size={buttonIconSize} />,
        [buttonIconSize]
    );

    const muteToggleIcon = useMemo(() => {
        const IconComponent = isSiteMuted ? UnlockIcon : LockIcon;
        return <IconComponent aria-hidden size={buttonIconSize} />;
    }, [buttonIconSize, isSiteMuted]);

    const nameLabelIcon = useMemo(
        () => <SiteIcon aria-hidden size={fieldIconSize} />,
        [fieldIconSize]
    );
    const identifierLabelIcon = useMemo(
        () => <IdentifierIcon aria-hidden size={fieldIconSize} />,
        [fieldIconSize]
    );
    const intervalLabelIcon = useMemo(
        () => <DurationIcon aria-hidden size={fieldIconSize} />,
        [fieldIconSize]
    );
    const timeoutLabelIcon = useMemo(
        () => <DurationIcon aria-hidden size={fieldIconSize} />,
        [fieldIconSize]
    );
    const retryLabelIcon = useMemo(
        () => <RetryIcon aria-hidden size={fieldIconSize} />,
        [fieldIconSize]
    );

    const timeoutFieldLabel = useMemo(
        () => (
            <span className="inline-flex items-center gap-2">
                {timeoutLabelIcon}
                Timeout (seconds)
            </span>
        ),
        [timeoutLabelIcon]
    );

    const retryAttemptsFieldLabel = useMemo(
        () => (
            <span className="inline-flex items-center gap-2">
                {retryLabelIcon}
                Retry attempts
            </span>
        ),
        [retryLabelIcon]
    );

    const maxCheckDuration = useMemo(
        () =>
            calculateMaxCheckDurationSeconds({
                retryAttempts: localRetryAttempts,
                timeoutSeconds: localTimeout,
            }),
        [localRetryAttempts, localTimeout]
    );

    const maxDurationVariant = useMemo(() => {
        if (maxCheckDuration.backoffSeconds >= 16 || maxCheckDuration.totalSeconds >= 180) {
            return "error";
        }

        if (maxCheckDuration.backoffSeconds >= 8 || maxCheckDuration.totalSeconds >= 60) {
            return "warning";
        }

        return "success";
    }, [maxCheckDuration.backoffSeconds, maxCheckDuration.totalSeconds]);

    const maxDurationLabel = useMemo(
        () => formatSecondsWithMinutes(maxCheckDuration.totalSeconds),
        [maxCheckDuration.totalSeconds]
    );
    return (
        <div className="space-y-6" data-testid="settings-tab">
            {/* Site Configuration */}
            <ThemedCard icon={settingsIcon} title="Site Configuration">
                <div className="site-settings-section">
                    {/* Site Name */}
                    <div className="site-settings-field">
                        <ThemedText
                            className="site-settings-field__label"
                            size="sm"
                            variant="secondary"
                            weight="medium"
                        >
                            <span className="inline-flex items-center gap-2">
                                {nameLabelIcon}
                                Site name
                            </span>
                        </ThemedText>
                        <div className="site-settings-field__controls">
                            <ThemedInput
                                className="flex-1"
                                onChange={handleNameChange}
                                placeholder="Enter a custom name for this site"
                                type="text"
                                value={localName}
                            />
                            <ThemedButton
                                disabled={
                                    !hasUnsavedChanges ||
                                    isLoading ||
                                    !isSiteNameValid
                                }
                                icon={saveIcon}
                                loading={isLoading}
                                onClick={handleSaveNameClick}
                                size="sm"
                                variant={
                                    hasUnsavedChanges ? "primary" : "secondary"
                                }
                            >
                                Save
                            </ThemedButton>
                        </div>
                        {hasUnsavedChanges ? (
                            <ThemedBadge size="sm" variant="warning">
                                <WarningIcon size={14} />
                                <span className="ml-1">Unsaved changes</span>
                            </ThemedBadge>
                        ) : null}
                        {isSiteNameValid ? null : (
                            <ThemedText size="xs" variant="error">
                                Enter a name before saving.
                            </ThemedText>
                        )}
                    </div>

                    {/* Site Identifier */}
                    <div className="site-settings-field">
                        <ThemedText
                            className="site-settings-field__label"
                            size="sm"
                            variant="secondary"
                            weight="medium"
                        >
                            <span className="inline-flex items-center gap-2">
                                {identifierLabelIcon}
                                {identifierLabel}
                            </span>
                        </ThemedText>
                        <ThemedInput
                            className="opacity-70"
                            disabled
                            type="text"
                            value={getDisplayIdentifier(
                                currentSite,
                                selectedMonitor
                            )}
                        />
                            <div className="mt-2">
                                <SiteSettingsHelpText icon={InfoIcon}>
                                    Generated when this site is created and cannot be changed.
                                </SiteSettingsHelpText>
                            </div>
                    </div>
                </div>
            </ThemedCard>

            <ThemedCard
                className="site-settings-section"
                icon={notificationsIcon}
                title="Notifications"
            >
                <div className="site-settings-field">
                    <ThemedText className="mb-2" size="sm" variant="secondary">
                        System notifications
                    </ThemedText>
                    <div className="mb-4">
                        <SiteSettingsHelpText icon={BellIcon}>
                            {isSiteMuted
                                ? "Notifications for this site are muted. This overrides global notification settings."
                                : "This site follows your global notification settings."}
                        </SiteSettingsHelpText>
                    </div>
                    <ThemedButton
                        className="site-settings-field__cta"
                        icon={muteToggleIcon}
                        loading={isLoading}
                        onClick={handleToggleSiteMute}
                        size="sm"
                        variant={isSiteMuted ? "secondary" : "primary"}
                    >
                        {isSiteMuted
                            ? "Unmute notifications for this site"
                            : "Mute notifications for this site"}
                    </ThemedButton>
                </div>
            </ThemedCard>

            {/* Monitoring Configuration */}
            <ThemedCard icon={timerIcon} title="Monitoring Configuration">
                <div className="site-settings-section">
                    {/* Check Interval */}
                    <div className="site-settings-field">
                        <ThemedText
                            className="site-settings-field__label"
                            size="sm"
                            variant="secondary"
                            weight="medium"
                        >
                            <span className="inline-flex items-center gap-2">
                                {intervalLabelIcon}
                                Check interval
                            </span>
                        </ThemedText>
                        <div className="site-settings-field__controls">
                            <ThemedSelect
                                className="flex-1"
                                onChange={handleIntervalChange}
                                value={localCheckInterval}
                            >
                                {CHECK_INTERVALS.map((interval) => {
                                    const value =
                                        typeof interval === "number"
                                            ? interval
                                            : interval.value;
                                    const label = getIntervalLabel(interval);
                                    return (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    );
                                })}
                            </ThemedSelect>
                            <ThemedButton
                                disabled={!intervalChanged}
                                icon={saveIcon}
                                onClick={loggedHandleSaveInterval}
                                size="sm"
                                variant={
                                    intervalChanged ? "primary" : "secondary"
                                }
                            >
                                Save
                            </ThemedButton>
                        </div>
                        <div className="mt-2">
                            <SiteSettingsHelpText>
                                How often Uptime Watcher runs a check for this monitor.
                                <span className="ml-2 inline-flex items-center gap-1 font-medium">
                                    <DurationIcon aria-hidden size={14} />
                                    Current: {formatSecondsWithMinutes(
                                        Math.round(localCheckInterval / 1000)
                                    )}
                                </span>
                            </SiteSettingsHelpText>
                        </div>

                        {Math.round(localCheckInterval / 1000) <
                        CHECK_INTERVAL_INFLIGHT_WARNING_SECONDS ? (
                            <div className="mt-2">
                                <SiteSettingsHelpText
                                    icon={WarningIcon}
                                    tone="warning"
                                >
                                    Intervals below {CHECK_INTERVAL_INFLIGHT_WARNING_SECONDS}s may
                                    cause multiple in-flight checks if a request takes longer than
                                    the interval. Not recommended.
                                </SiteSettingsHelpText>
                            </div>
                        ) : null}
                    </div>

                    {/* Timeout Configuration */}
                    <SiteSettingsNumberField
                        errorText={`Allowed range: ${TIMEOUT_CONSTRAINTS.MIN}-${TIMEOUT_CONSTRAINTS.MAX} seconds.`}
                        helperText={
                            <>
                                Maximum time to wait per attempt before it is treated as failed.
                                <span className="ml-2 inline-flex items-center gap-1 font-medium">
                                    <DurationIcon aria-hidden size={14} />
                                    Current: {formatSecondsWithMinutes(localTimeout)}
                                </span>
                                <span className="ml-2 inline-flex items-center gap-1">
                                    <DurationIcon aria-hidden size={14} />
                                    Max: {formatSecondsWithMinutes(TIMEOUT_CONSTRAINTS.MAX)}
                                </span>
                            </>
                        }
                        isChanged={timeoutChanged}
                        isValid={isTimeoutValid}
                        label={timeoutFieldLabel}
                        max={TIMEOUT_CONSTRAINTS.MAX}
                        min={TIMEOUT_CONSTRAINTS.MIN}
                        onChange={handleTimeoutChange}
                        onSave={handleSaveTimeoutClick}
                        placeholder="Enter timeout in seconds"
                        saveIcon={saveIcon}
                        step={TIMEOUT_CONSTRAINTS.STEP}
                        value={localTimeout}
                    />

                    {/* Retry Attempts Configuration */}
                    <SiteSettingsNumberField
                        errorText={`Retry attempts must be between ${RETRY_CONSTRAINTS.MIN} and ${RETRY_CONSTRAINTS.MAX}.`}
                        helperText={
                            <>
                                {formatRetryAttemptsText(localRetryAttempts)}.
                                <span className="ml-2">Range: 0–{RETRY_CONSTRAINTS.MAX}.</span>
                                <span className="ml-2">
                                    Values above {RETRY_CONSTRAINTS.MAX} are clamped.
                                </span>
                            </>
                        }
                        isChanged={retryAttemptsChanged}
                        isValid={isRetryAttemptsValid}
                        label={retryAttemptsFieldLabel}
                        max={RETRY_CONSTRAINTS.MAX}
                        min={RETRY_CONSTRAINTS.MIN}
                        onChange={handleRetryAttemptsChange}
                        onSave={handleSaveRetryAttemptsClick}
                        placeholder="Enter retry attempts"
                        saveIcon={saveIcon}
                        step={RETRY_CONSTRAINTS.STEP}
                        value={localRetryAttempts}
                    />

                    {/* Total monitoring time indicator */}
                    {localRetryAttempts > 0 ? (
                        <ThemedBox
                            className="site-settings-duration"
                            padding="md"
                            rounded="lg"
                            variant="tertiary"
                        >
                        <div className="site-settings-duration__body">
                            <span
                                aria-hidden="true"
                                className="site-settings-duration__icon"
                            >
                                <DurationIcon size={18} />
                            </span>
                            <div className="site-settings-duration__content">
                                <div className="flex flex-wrap items-center gap-2">
                                    <ThemedText
                                        size="sm"
                                        variant="secondary"
                                        weight="medium"
                                    >
                                        Maximum check duration
                                    </ThemedText>
                                    <ThemedBadge
                                        className="shrink-0"
                                        size="sm"
                                        variant={maxDurationVariant}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            <DurationIcon aria-hidden size={14} />
                                            ~ {maxDurationLabel}
                                        </span>
                                    </ThemedBadge>
                                </div>
                                <ThemedText
                                    className="site-settings-duration__meta"
                                    size="xs"
                                    variant="secondary"
                                >
                                    <span className="inline-flex items-center gap-1">
                                        <DurationIcon aria-hidden size={14} />
                                        {formatSecondsWithMinutes(localTimeout)}
                                    </span>
                                    <span> per attempt</span>
                                    <span className="mx-1">×</span>
                                    <span className="inline-flex items-center gap-1">
                                        <RetryIcon aria-hidden size={14} />
                                        {maxCheckDuration.totalAttempts} attempts
                                    </span>
                                    <span className="mx-1">+</span>
                                    <span className="inline-flex items-center gap-1">
                                        <LastCheckedIcon aria-hidden size={14} />
                                        {formatSecondsWithMinutes(
                                            maxCheckDuration.backoffSeconds
                                        )} backoff
                                    </span>
                                </ThemedText>
                                <div className="mt-2">
                                    <SiteSettingsHelpText icon={InfoIcon}>
                                        This estimate updates automatically based on Timeout and
                                        Retry attempts above.
                                    </SiteSettingsHelpText>
                                </div>
                            </div>
                        </div>
                        </ThemedBox>
                    ) : null}
                </div>
            </ThemedCard>

            {/* Site Information */}
            <ThemedCard icon={infoIcon} title="Site Information">
                <div className="site-settings-info-grid">
                    <div className="site-settings-info-grid__column">
                        <div className="site-settings-info-item">
                            <span
                                aria-hidden="true"
                                className="site-settings-info-item__icon"
                            >
                                <IdentifierIcon size={18} />
                            </span>
                            <div className="site-settings-info-item__content">
                                <ThemedText
                                    className="site-settings-info-item__label"
                                    size="sm"
                                    variant="secondary"
                                >
                                    {identifierLabel}
                                </ThemedText>
                                <ThemedBadge size="sm" variant="secondary">
                                    {getDisplayIdentifier(
                                        currentSite,
                                        selectedMonitor
                                    )}
                                </ThemedBadge>
                            </div>
                        </div>
                        <div className="site-settings-info-item">
                            <span
                                aria-hidden="true"
                                className="site-settings-info-item__icon"
                            >
                                <HistoryIcon size={18} />
                            </span>
                            <div className="site-settings-info-item__content">
                                <ThemedText
                                    className="site-settings-info-item__label"
                                    size="sm"
                                    variant="secondary"
                                >
                                    History Records
                                </ThemedText>
                                <ThemedBadge size="sm" variant="info">
                                    {selectedMonitor.history.length}
                                </ThemedBadge>
                            </div>
                        </div>
                    </div>
                    <div className="site-settings-info-grid__column">
                        <div className="site-settings-info-item">
                            <span
                                aria-hidden="true"
                                className="site-settings-info-item__icon"
                            >
                                <LastCheckedIcon size={18} />
                            </span>
                            <div className="site-settings-info-item__content">
                                <ThemedText
                                    className="site-settings-info-item__label"
                                    size="sm"
                                    variant="secondary"
                                >
                                    Last Checked
                                </ThemedText>
                                <ThemedText
                                    className="site-settings-info-item__value"
                                    size="xs"
                                    variant="primary"
                                >
                                    {selectedMonitor.lastChecked
                                        ? new Date(
                                              selectedMonitor.lastChecked
                                          ).toLocaleString()
                                        : "Never"}
                                </ThemedText>
                            </div>
                        </div>
                    </div>
                </div>
            </ThemedCard>

            {/* Danger Zone */}
            <ThemedCard
                className="border-error/30 bg-error/5 border-2"
                icon={dangerIcon}
                title="Danger Zone"
            >
                <div className="site-settings-section">
                    <div className="site-settings-field">
                        <ThemedText
                            className="mb-2"
                            size="sm"
                            variant="error"
                            weight="medium"
                        >
                            Remove Site
                        </ThemedText>
                        <ThemedText
                            className="mb-4"
                            size="xs"
                            variant="tertiary"
                        >
                            This action cannot be undone. All history data for
                            this site will be lost.
                        </ThemedText>
                        <ThemedButton
                            className="site-settings-field__cta"
                            icon={trashIcon}
                            loading={isLoading}
                            onClick={handleRemoveSiteClick}
                            size="md"
                            variant="error"
                        >
                            Remove Site
                        </ThemedButton>
                    </div>
                </div>
            </ThemedCard>
        </div>
    );
};
