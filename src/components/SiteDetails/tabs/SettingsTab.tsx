/**
 * Settings tab component for configuring site monitoring parameters.
 * Provides interface for modifying site settings, intervals, and performing site management actions.
 */

import React from "react";
import { FiTrash2, FiSave } from "react-icons/fi";
import { MdSettings, MdTimer, MdInfoOutline, MdDangerous } from "react-icons/md";

import { CHECK_INTERVALS, RETRY_CONSTRAINTS, TIMEOUT_CONSTRAINTS } from "../../../constants";
import logger from "../../../services/logger";
import {
    ThemedText,
    ThemedButton,
    ThemedCard,
    ThemedBadge,
    ThemedInput,
    ThemedSelect,
    useTheme,
} from "../../../theme";
import { Site, Monitor } from "../../../types";
import { calculateMaxDuration } from "../../../utils/duration";

/**
 * Helper function to format time duration into human readable format.
 * @param milliseconds - Time duration in milliseconds
 * @returns Formatted time string (e.g., "30s", "5m", "1h")
 */
function formatDuration(milliseconds: number): string {
    if (milliseconds < 60_000) {
        return `${milliseconds / 1000}s`;
    }
    if (milliseconds < 3_600_000) {
        return `${milliseconds / 60_000}m`;
    }
    return `${milliseconds / 3_600_000}h`;
}

/**
 * Helper function to get display label for interval value.
 * @param interval - Interval configuration (number or object with value/label)
 * @returns Human readable label for the interval
 */
function getIntervalLabel(interval: number | { value: number; label?: string }): string {
    if (typeof interval === "number") {
        return formatDuration(interval);
    }

    if (interval.label) {
        return interval.label;
    }

    return formatDuration(interval.value);
}

/**
 * Helper function to format retry attempts text.
 * @param attempts - Number of retry attempts
 * @returns Formatted retry attempts description
 */
function formatRetryAttemptsText(attempts: number): string {
    if (attempts === 0) {
        return "(Retry disabled - immediate failure detection)";
    }

    const timesText = attempts === 1 ? "time" : "times";
    return `(Retry ${attempts} ${timesText} before marking down)`;
}

/**
 * Generate a display label for the identifier field based on monitor type.
 */
function getIdentifierLabel(selectedMonitor: Monitor): string {
    if (selectedMonitor.type === "http") {
        return "Website URL";
    }

    if (selectedMonitor.type === "port") {
        return "Host & Port";
    }

    return "Internal Site ID";
}

/**
 * Generate a display identifier based on the monitor type.
 * For HTTP monitors: shows the URL
 * For port monitors: shows host:port
 * Fallback: shows the site identifier
 */
function getDisplayIdentifier(currentSite: Site, selectedMonitor: Monitor): string {
    if (selectedMonitor.type === "http" && selectedMonitor.url) {
        return selectedMonitor.url;
    }

    if (selectedMonitor.type === "port" && selectedMonitor.host && selectedMonitor.port) {
        return `${selectedMonitor.host}:${selectedMonitor.port}`;
    }

    // Fallback to site identifier
    return currentSite.identifier;
}

/**
 * Props for the SettingsTab component.
 */
interface SettingsTabProperties {
    /** Current site being configured */
    readonly currentSite: Site;
    /** Handler for monitor check interval changes */
    readonly handleIntervalChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    /** Handler for removing/deleting the site */
    readonly handleRemoveSite: () => Promise<void>;
    /** Handler for saving interval changes */
    readonly handleSaveInterval: () => void;
    /** Handler for saving site name changes */
    readonly handleSaveName: () => Promise<void>;
    /** Handler for saving retry attempts changes */
    readonly handleSaveRetryAttempts: () => Promise<void>;
    /** Handler for saving timeout changes */
    readonly handleSaveTimeout: () => Promise<void>;
    /** Handler for monitor retry attempts changes */
    readonly handleRetryAttemptsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /** Handler for monitor timeout changes */
    readonly handleTimeoutChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
    /** Local state value for timeout in seconds (converted to ms when saving) */
    readonly localTimeout: number;
    /** Currently selected monitor being configured */
    readonly selectedMonitor: Monitor;
    /** Function to update local site name state */
    readonly setLocalName: (name: string) => void;
    /** Whether the retry attempts have been changed */
    readonly retryAttemptsChanged: boolean;
    /** Whether the timeout has been changed */
    readonly timeoutChanged: boolean;
}

/**
 * Settings tab component providing site configuration interface.
 *
 * Features:
 * - Site name editing with validation
 * - Monitor check interval configuration
 * - Monitor status and information display
 * - Site removal with confirmation
 * - Unsaved changes tracking and warnings
 * - Real-time settings validation
 *
 * @param props - Component props containing site data and handlers
 * @returns JSX element displaying settings interface
 */
export function SettingsTab({
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
}: SettingsTabProperties) {
    const { currentTheme } = useTheme();

    // Icon colors configuration
    const getIconColors = () => ({
        danger: currentTheme.colors.error,
        info: currentTheme.colors.info,
        monitoring: currentTheme.colors.primary[600],
        settings: currentTheme.colors.primary[500],
        timing: currentTheme.colors.warning,
    });

    const iconColors = getIconColors();

    const loggedHandleSaveName = async () => {
        logger.user.action("Settings: Save site name initiated", {
            newName: localName.trim(),
            oldName: currentSite.name ?? "",
            siteId: currentSite.identifier,
        });
        await handleSaveName();
    };

    const loggedHandleSaveInterval = () => {
        logger.user.action("Settings: Save check interval", {
            monitorId: selectedMonitor?.id,
            newInterval: localCheckInterval,
            oldInterval: selectedMonitor?.checkInterval,
            siteId: currentSite.identifier,
        });
        handleSaveInterval();
    };

    const loggedHandleRemoveSite = async () => {
        logger.user.action("Settings: Remove site initiated", {
            siteId: currentSite.identifier,
            siteName: currentSite.name ?? "",
        });
        await handleRemoveSite();
    };

    const loggedHandleSaveTimeout = async () => {
        logger.user.action("Settings: Save timeout", {
            monitorId: selectedMonitor?.id,
            newTimeout: localTimeout,
            oldTimeout: selectedMonitor?.timeout,
            siteId: currentSite.identifier,
        });
        await handleSaveTimeout();
    };

    const loggedHandleSaveRetryAttempts = async () => {
        logger.user.action("Settings: Save retry attempts", {
            monitorId: selectedMonitor?.id,
            newRetryAttempts: localRetryAttempts,
            oldRetryAttempts: selectedMonitor?.retryAttempts,
            siteId: currentSite.identifier,
        });
        await handleSaveRetryAttempts();
    };

    return (
        <div data-testid="settings-tab" className="space-y-6">
            {/* Site Configuration */}
            <ThemedCard icon={<MdSettings color={iconColors.settings} />} title="Site Configuration">
                <div className="space-y-6">
                    {/* Site Name */}
                    <div className="space-y-2">
                        <ThemedText size="sm" weight="medium" variant="secondary">
                            Site Name
                        </ThemedText>
                        <div className="flex items-center gap-3">
                            <ThemedInput
                                type="text"
                                value={localName}
                                onChange={(e) => setLocalName(e.target.value)}
                                placeholder="Enter a custom name for this site"
                                className="flex-1"
                            />
                            <ThemedButton
                                variant={hasUnsavedChanges ? "primary" : "secondary"}
                                size="sm"
                                onClick={loggedHandleSaveName}
                                disabled={!hasUnsavedChanges || isLoading}
                                loading={isLoading}
                                icon={<FiSave />}
                            >
                                Save
                            </ThemedButton>
                        </div>
                        {hasUnsavedChanges && (
                            <ThemedBadge variant="warning" size="sm">
                                ⚠️ Unsaved changes
                            </ThemedBadge>
                        )}
                    </div>

                    {/* Site Identifier */}
                    <div className="space-y-2">
                        <ThemedText size="sm" weight="medium" variant="secondary">
                            {getIdentifierLabel(selectedMonitor)}
                        </ThemedText>
                        <ThemedInput
                            type="text"
                            value={getDisplayIdentifier(currentSite, selectedMonitor)}
                            disabled
                            className="opacity-70"
                        />
                        <ThemedText size="xs" variant="tertiary">
                            Identifier cannot be changed
                        </ThemedText>
                    </div>
                </div>
            </ThemedCard>

            {/* Monitoring Configuration */}
            <ThemedCard icon={<MdTimer color={iconColors.timing} />} title="Monitoring Configuration">
                <div className="space-y-6">
                    {/* Check Interval */}
                    <div className="space-y-2">
                        <ThemedText size="sm" weight="medium" variant="secondary">
                            Check Interval
                        </ThemedText>
                        <div className="flex items-center gap-3">
                            <ThemedSelect value={localCheckInterval} onChange={handleIntervalChange} className="flex-1">
                                {CHECK_INTERVALS.map((interval) => {
                                    const value = typeof interval === "number" ? interval : interval.value;
                                    const label = getIntervalLabel(interval);
                                    return (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    );
                                })}
                            </ThemedSelect>
                            <ThemedButton
                                variant={intervalChanged ? "primary" : "secondary"}
                                size="sm"
                                onClick={loggedHandleSaveInterval}
                                disabled={!intervalChanged}
                                icon={<FiSave />}
                            >
                                Save
                            </ThemedButton>
                        </div>
                        <ThemedText size="xs" variant="tertiary">
                            Monitor checks every {Math.round(localCheckInterval / 1000)} seconds
                        </ThemedText>
                    </div>

                    {/* Timeout Configuration */}
                    <div className="space-y-2">
                        <ThemedText size="sm" weight="medium" variant="secondary">
                            Timeout (seconds)
                        </ThemedText>
                        <div className="flex items-center gap-3">
                            <ThemedInput
                                type="number"
                                value={localTimeout}
                                onChange={handleTimeoutChange}
                                placeholder="Enter timeout in seconds"
                                className="flex-1"
                                min={TIMEOUT_CONSTRAINTS.MIN}
                                max={TIMEOUT_CONSTRAINTS.MAX}
                                step={TIMEOUT_CONSTRAINTS.STEP}
                            />
                            <ThemedButton
                                variant={timeoutChanged ? "primary" : "secondary"}
                                size="sm"
                                onClick={loggedHandleSaveTimeout}
                                disabled={!timeoutChanged}
                                icon={<FiSave />}
                            >
                                Save
                            </ThemedButton>
                        </div>
                        <ThemedText size="xs" variant="tertiary">
                            Request timeout: {localTimeout} seconds
                        </ThemedText>
                    </div>

                    {/* Retry Attempts Configuration */}
                    <div className="space-y-2">
                        <ThemedText size="sm" weight="medium" variant="secondary">
                            Retry Attempts
                        </ThemedText>
                        <div className="flex items-center gap-3">
                            <ThemedInput
                                type="number"
                                value={localRetryAttempts}
                                onChange={handleRetryAttemptsChange}
                                placeholder="Enter retry attempts"
                                className="flex-1"
                                min={RETRY_CONSTRAINTS.MIN}
                                max={RETRY_CONSTRAINTS.MAX}
                                step={RETRY_CONSTRAINTS.STEP}
                            />
                            <ThemedButton
                                variant={retryAttemptsChanged ? "primary" : "secondary"}
                                size="sm"
                                onClick={loggedHandleSaveRetryAttempts}
                                disabled={!retryAttemptsChanged}
                                icon={<FiSave />}
                            >
                                Save
                            </ThemedButton>
                        </div>
                        <ThemedText size="xs" variant="tertiary">
                            {formatRetryAttemptsText(localRetryAttempts)}
                        </ThemedText>
                    </div>

                    {/* Total monitoring time indicator */}
                    {localRetryAttempts > 0 && (
                        <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
                            <ThemedText size="xs" variant="info">
                                💡 <strong>Maximum check duration:</strong> ~
                                {calculateMaxDuration(localTimeout, localRetryAttempts)} ({localTimeout}s per attempt ×{" "}
                                {localRetryAttempts + 1} attempts + backoff delays)
                            </ThemedText>
                        </div>
                    )}
                </div>
            </ThemedCard>

            {/* Site Information */}
            <ThemedCard icon={<MdInfoOutline color={iconColors.info} />} title="Site Information">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <ThemedText size="sm" variant="secondary">
                                {getIdentifierLabel(selectedMonitor)}:
                            </ThemedText>
                            <ThemedBadge variant="secondary" size="sm">
                                {getDisplayIdentifier(currentSite, selectedMonitor)}
                            </ThemedBadge>
                        </div>
                        <div className="flex items-center justify-between">
                            <ThemedText size="sm" variant="secondary">
                                History Records:
                            </ThemedText>
                            <ThemedBadge variant="info" size="sm">
                                {(selectedMonitor.history || []).length}
                            </ThemedBadge>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <ThemedText size="sm" variant="secondary">
                                Last Checked:
                            </ThemedText>
                            <ThemedText size="xs" variant="tertiary">
                                {selectedMonitor.lastChecked
                                    ? new Date(selectedMonitor.lastChecked).toLocaleString()
                                    : "Never"}
                            </ThemedText>
                        </div>
                    </div>
                </div>
            </ThemedCard>

            {/* Danger Zone */}
            <ThemedCard
                icon={<MdDangerous color={iconColors.danger} />}
                title="Danger Zone"
                className="border-2 border-error/30 bg-error/5"
            >
                <div className="space-y-4">
                    <div>
                        <ThemedText size="sm" weight="medium" variant="error" className="mb-2">
                            Remove Site
                        </ThemedText>
                        <ThemedText size="xs" variant="tertiary" className="mb-4">
                            This action cannot be undone. All history data for this site will be lost.
                        </ThemedText>
                        <ThemedButton
                            variant="error"
                            size="md"
                            onClick={loggedHandleRemoveSite}
                            loading={isLoading}
                            icon={<FiTrash2 />}
                            className="w-full"
                        >
                            Remove Site
                        </ThemedButton>
                    </div>
                </div>
            </ThemedCard>
        </div>
    );
}
