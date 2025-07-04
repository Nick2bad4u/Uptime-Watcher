/**
 * Settings tab component for configuring site monitoring parameters.
 * Provides interface for modifying site settings, intervals, and performing site management actions.
 */

import React from "react";
import { FiTrash2, FiSave } from "react-icons/fi";

import { CHECK_INTERVALS, RETRY_CONSTRAINTS, TIMEOUT_CONSTRAINTS } from "../../../constants";
import logger from "../../../services/logger";
import {
    ThemedBox,
    ThemedText,
    ThemedButton,
    ThemedCard,
    ThemedBadge,
    ThemedInput,
    ThemedSelect,
} from "../../../theme/components";
import { Site, Monitor } from "../../../types";
import { calculateMaxDuration } from "../../../utils/duration";

/**
 * Helper function to format time duration into human readable format.
 * @param milliseconds - Time duration in milliseconds
 * @returns Formatted time string (e.g., "30s", "5m", "1h")
 */
function formatDuration(milliseconds: number): string {
    if (milliseconds < 60000) {
        return `${milliseconds / 1000}s`;
    }
    if (milliseconds < 3600000) {
        return `${milliseconds / 60000}m`;
    }
    return `${milliseconds / 3600000}h`;
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
interface SettingsTabProps {
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
}: SettingsTabProps) {
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
        <div data-testid="settings-tab" className="space-y-10">
            {/* Settings Tab */}
            <ThemedText variant="primary" weight="bold">
                Settings Tab
            </ThemedText>
            {/* Site Configuration */}
            <ThemedCard icon="⚙️" title="Site Configuration" padding="xl" rounded="xl" shadow="lg" className="mb-6">
                <div className="space-y-8">
                    {/* Site Name */}
                    <div>
                        <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-2">
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
                                className="min-w-[90px]"
                            >
                                Save
                            </ThemedButton>
                        </div>
                        {hasUnsavedChanges && (
                            <ThemedBadge variant="warning" size="xs" className="mt-2">
                                ⚠️ Unsaved changes
                            </ThemedBadge>
                        )}
                    </div>

                    {/* Site Identifier */}
                    <div>
                        <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-2">
                            {getIdentifierLabel(selectedMonitor)}
                        </ThemedText>
                        <ThemedInput
                            type="text"
                            value={getDisplayIdentifier(currentSite, selectedMonitor)}
                            disabled
                            className="opacity-70"
                        />
                        <ThemedText size="xs" variant="tertiary" className="mt-1">
                            Identifier cannot be changed
                        </ThemedText>
                    </div>
                </div>
            </ThemedCard>

            {/* Per-site check interval control */}
            <ThemedBox variant="secondary" padding="md" className="flex items-center gap-3 mb-4">
                <ThemedText size="sm" variant="secondary">
                    Check every:
                </ThemedText>
                <ThemedSelect value={localCheckInterval} onChange={handleIntervalChange}>
                    {CHECK_INTERVALS.map((interval) => {
                        // Support both number and object forms
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
                >
                    Save
                </ThemedButton>
                <ThemedText size="xs" variant="tertiary" className="ml-2">
                    (This monitor checks every {Math.round(localCheckInterval / 1000)}s)
                </ThemedText>
            </ThemedBox>

            {/* Timeout configuration */}
            <ThemedBox variant="secondary" padding="md" className="flex items-center gap-3 mb-4">
                <ThemedText size="sm" variant="secondary">
                    Timeout (seconds):
                </ThemedText>
                <ThemedInput
                    type="number"
                    value={localTimeout} // Now stored in seconds, display directly
                    onChange={handleTimeoutChange}
                    placeholder="Enter timeout in seconds"
                    className="w-32"
                    min={TIMEOUT_CONSTRAINTS.MIN}
                    max={TIMEOUT_CONSTRAINTS.MAX}
                    step={TIMEOUT_CONSTRAINTS.STEP}
                />
                <ThemedButton
                    variant={timeoutChanged ? "primary" : "secondary"}
                    size="sm"
                    onClick={loggedHandleSaveTimeout}
                    disabled={!timeoutChanged}
                >
                    Save
                </ThemedButton>
                <ThemedText size="xs" variant="tertiary" className="ml-2">
                    (Request timeout: {localTimeout}s)
                </ThemedText>
            </ThemedBox>

            {/* Retry attempts configuration */}
            <ThemedBox variant="secondary" padding="md" className="flex items-center gap-3 mb-4">
                <ThemedText size="sm" variant="secondary">
                    Retry Attempts:
                </ThemedText>
                <ThemedInput
                    type="number"
                    value={localRetryAttempts}
                    onChange={handleRetryAttemptsChange}
                    placeholder="Enter retry attempts"
                    className="w-32"
                    min={RETRY_CONSTRAINTS.MIN}
                    max={RETRY_CONSTRAINTS.MAX}
                    step={RETRY_CONSTRAINTS.STEP}
                />
                <ThemedButton
                    variant={retryAttemptsChanged ? "primary" : "secondary"}
                    size="sm"
                    onClick={loggedHandleSaveRetryAttempts}
                    disabled={!retryAttemptsChanged}
                >
                    Save
                </ThemedButton>
                <ThemedText size="xs" variant="tertiary" className="ml-2">
                    {formatRetryAttemptsText(localRetryAttempts)}
                </ThemedText>
            </ThemedBox>

            {/* Total monitoring time indicator */}
            {localRetryAttempts > 0 && (
                <ThemedBox variant="tertiary" padding="sm" className="mb-4">
                    <ThemedText size="xs" variant="secondary">
                        💡 <strong>Maximum check duration:</strong> ~
                        {calculateMaxDuration(localTimeout, localRetryAttempts)} ({localTimeout}s per attempt ×{" "}
                        {localRetryAttempts + 1} attempts + backoff delays)
                    </ThemedText>
                </ThemedBox>
            )}

            {/* Site Information */}
            <ThemedCard icon="📊" title="Site Information" padding="xl" rounded="xl" shadow="md" className="mb-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <ThemedText size="sm" variant="secondary">
                                {getIdentifierLabel(selectedMonitor)}:
                            </ThemedText>
                            <ThemedBadge variant="secondary" size="xs">
                                {getDisplayIdentifier(currentSite, selectedMonitor)}
                            </ThemedBadge>
                        </div>
                        <div className="flex items-center justify-between">
                            <ThemedText size="sm" variant="secondary">
                                Total Monitor History Records:
                            </ThemedText>
                            <ThemedBadge variant="info" size="xs">
                                {(selectedMonitor.history || []).length}
                            </ThemedBadge>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
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
                icon="⚠️"
                title="Danger Zone"
                variant="tertiary"
                padding="xl"
                rounded="xl"
                shadow="md"
                className="border-2 border-error/30"
            >
                <div className="space-y-6">
                    <div>
                        <ThemedText size="sm" weight="medium" variant="error" className="mb-2">
                            Remove Site
                        </ThemedText>
                        <ThemedText size="xs" variant="tertiary" className="block mb-4 ml-1">
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
