/**
 * Settings tab component for configuring site monitoring parameters. Provides
 * interface for modifying site settings, intervals, and performing site
 * management actions.
 */

import type { Monitor, Site } from "@shared/types";
import type { ChangeEvent, JSX } from "react";

import { withUtilityErrorHandling } from "@shared/utils/errorHandling";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiSave, FiTrash2 } from "react-icons/fi";
import { MdDangerous, MdInfoOutline, MdSettings } from "react-icons/md";

import {
    CHECK_INTERVALS,
    RETRY_CONSTRAINTS,
    TIMEOUT_CONSTRAINTS,
} from "../../../constants";
import { logger } from "../../../services/logger";
import { ThemedBadge } from "../../../theme/components/ThemedBadge";
import { ThemedBox } from "../../../theme/components/ThemedBox";
import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedCard } from "../../../theme/components/ThemedCard";
import { ThemedInput } from "../../../theme/components/ThemedInput";
import { ThemedSelect } from "../../../theme/components/ThemedSelect";
import { ThemedText } from "../../../theme/components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { calculateMaxDuration } from "../../../utils/duration";
import {
    getMonitorDisplayIdentifier,
    getMonitorTypeDisplayLabel,
    UiDefaults,
} from "../../../utils/fallbacks";
import { AppIcons } from "../../../utils/icons";
import { getMonitorTypeConfig } from "../../../utils/monitorTypeHelper";
import { formatRetryAttemptsText, getIntervalLabel } from "../../../utils/time";

const WarningIcon = AppIcons.status.warning;
const DurationIcon = AppIcons.metrics.time;
const IdentifierIcon = AppIcons.ui.link;
const HistoryIcon = AppIcons.metrics.activity;
const LastCheckedIcon = AppIcons.ui.history;

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
 * Resolves and renders the primary identifier label for the selected monitor
 * type.
 *
 * @param selectedMonitor - Monitor whose identifier metadata should be
 *   displayed.
 *
 * @returns Localised label string for the monitor identifier field.
 */
interface IdentifierLabelProps {
    selectedMonitor: Monitor;
}

function IdentifierLabel({ selectedMonitor }: IdentifierLabelProps): string {
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

    const settingsIcon = useMemo(
        () => <MdSettings color={iconColors.settings} />,
        [iconColors.settings]
    );
    const saveIcon = useMemo(() => <FiSave />, []);
    const timerIcon = useMemo(
        () => <DurationIcon color={iconColors.timing} size={18} />,
        [iconColors.timing]
    );
    const saveIconTwo = useMemo(() => <FiSave />, []);
    const saveIconThree = useMemo(() => <FiSave />, []);
    const saveIconFour = useMemo(() => <FiSave />, []);
    const infoIcon = useMemo(
        () => <MdInfoOutline color={iconColors.info} />,
        [iconColors.info]
    );
    const dangerIcon = useMemo(
        () => <MdDangerous color={iconColors.danger} />,
        [iconColors.danger]
    );
    const trashIcon = useMemo(() => <FiTrash2 />, []);
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
                            Site Name
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
                            <IdentifierLabel
                                selectedMonitor={selectedMonitor}
                            />
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
                        <ThemedText size="xs" variant="tertiary">
                            Identifier cannot be changed
                        </ThemedText>
                    </div>
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
                            Check Interval
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
                                icon={saveIconTwo}
                                onClick={loggedHandleSaveInterval}
                                size="sm"
                                variant={
                                    intervalChanged ? "primary" : "secondary"
                                }
                            >
                                Save
                            </ThemedButton>
                        </div>
                        <ThemedText size="xs" variant="tertiary">
                            Monitor checks every{" "}
                            {Math.round(localCheckInterval / 1000)} seconds
                        </ThemedText>
                    </div>

                    {/* Timeout Configuration */}
                    <div className="site-settings-field">
                        <ThemedText
                            className="site-settings-field__label"
                            size="sm"
                            variant="secondary"
                            weight="medium"
                        >
                            Timeout (seconds)
                        </ThemedText>
                        <div className="site-settings-field__controls">
                            <ThemedInput
                                className="flex-1"
                                max={TIMEOUT_CONSTRAINTS.MAX}
                                min={TIMEOUT_CONSTRAINTS.MIN}
                                onChange={handleTimeoutChange}
                                placeholder="Enter timeout in seconds"
                                step={TIMEOUT_CONSTRAINTS.STEP}
                                type="number"
                                value={localTimeout}
                            />
                            <ThemedButton
                                disabled={!timeoutChanged || !isTimeoutValid}
                                icon={saveIconThree}
                                onClick={handleSaveTimeoutClick}
                                size="sm"
                                variant={
                                    timeoutChanged ? "primary" : "secondary"
                                }
                            >
                                Save
                            </ThemedButton>
                        </div>
                        <ThemedText size="xs" variant="tertiary">
                            Request timeout: {localTimeout} seconds
                        </ThemedText>
                        {isTimeoutValid ? null : (
                            <ThemedText size="xs" variant="error">
                                Allowed range: {TIMEOUT_CONSTRAINTS.MIN}-
                                {TIMEOUT_CONSTRAINTS.MAX} seconds.
                            </ThemedText>
                        )}
                    </div>

                    {/* Retry Attempts Configuration */}
                    <div className="site-settings-field">
                        <ThemedText
                            className="site-settings-field__label"
                            size="sm"
                            variant="secondary"
                            weight="medium"
                        >
                            Retry Attempts
                        </ThemedText>
                        <div className="site-settings-field__controls">
                            <ThemedInput
                                className="flex-1"
                                max={RETRY_CONSTRAINTS.MAX}
                                min={RETRY_CONSTRAINTS.MIN}
                                onChange={handleRetryAttemptsChange}
                                placeholder="Enter retry attempts"
                                step={RETRY_CONSTRAINTS.STEP}
                                type="number"
                                value={localRetryAttempts}
                            />
                            <ThemedButton
                                disabled={
                                    !retryAttemptsChanged ||
                                    !isRetryAttemptsValid
                                }
                                icon={saveIconFour}
                                onClick={handleSaveRetryAttemptsClick}
                                size="sm"
                                variant={
                                    retryAttemptsChanged
                                        ? "primary"
                                        : "secondary"
                                }
                            >
                                Save
                            </ThemedButton>
                        </div>
                        <ThemedText size="xs" variant="tertiary">
                            {formatRetryAttemptsText(localRetryAttempts)}
                        </ThemedText>
                        {isRetryAttemptsValid ? null : (
                            <ThemedText size="xs" variant="error">
                                Retry attempts must be between{" "}
                                {RETRY_CONSTRAINTS.MIN} and{" "}
                                {RETRY_CONSTRAINTS.MAX}.
                            </ThemedText>
                        )}
                    </div>

                    {/* Total monitoring time indicator */}
                    {localRetryAttempts > 0 && (
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
                                    <ThemedText
                                        size="sm"
                                        variant="primary"
                                        weight="medium"
                                    >
                                        Maximum check duration ~{" "}
                                        {calculateMaxDuration(
                                            localTimeout,
                                            localRetryAttempts
                                        )}
                                    </ThemedText>
                                    <ThemedText
                                        className="site-settings-duration__meta"
                                        size="xs"
                                        variant="secondary"
                                    >
                                        {localTimeout}s per attempt x{" "}
                                        {localRetryAttempts + 1} attempts +{" "}
                                        backoff delays
                                    </ThemedText>
                                </div>
                            </div>
                        </ThemedBox>
                    )}
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
                                    <IdentifierLabel
                                        selectedMonitor={selectedMonitor}
                                    />
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
