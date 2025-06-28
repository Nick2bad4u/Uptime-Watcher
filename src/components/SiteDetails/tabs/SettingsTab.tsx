/**
 * Settings tab component for configuring site monitoring parameters.
 * Provides interface for modifying site settings, intervals, and performing site management actions.
 */

import React from "react";
import { FiTrash2, FiSave } from "react-icons/fi";

import { CHECK_INTERVALS } from "../../../constants";
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

/**
 * Props for the SettingsTab component.
 */
interface SettingsTabProps {
    /** Current site being configured */
    currentSite: Site;
    /** Handler for monitor check interval changes */
    handleIntervalChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    /** Handler for removing/deleting the site */
    handleRemoveSite: () => Promise<void>;
    /** Handler for saving interval changes */
    handleSaveInterval: () => void;
    /** Handler for saving site name changes */
    handleSaveName: () => Promise<void>;
    /** Whether there are unsaved changes pending */
    hasUnsavedChanges: boolean;
    /** Whether the check interval has been modified */
    intervalChanged: boolean;
    /** Whether any async operation is in progress */
    isLoading: boolean;
    /** Local state value for check interval */
    localCheckInterval: number;
    /** Local state value for site name */
    localName: string;
    /** Currently selected monitor being configured */
    selectedMonitor: Monitor;
    /** Function to update local site name state */
    setLocalName: (name: string) => void;
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
    handleSaveInterval,
    handleSaveName,
    hasUnsavedChanges,
    intervalChanged,
    isLoading,
    localCheckInterval,
    localName,
    selectedMonitor,
    setLocalName,
}: SettingsTabProps) {
    const loggedHandleSaveName = async () => {
        logger.user.action("Settings: Save site name initiated", {
            newName: localName.trim(),
            oldName: currentSite.name || "",
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
            siteName: currentSite.name || "",
        });
        await handleRemoveSite();
    };

    return (
        <div className="space-y-10">
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

                    {/* Site URL */}
                    <div>
                        <ThemedText size="sm" weight="medium" variant="secondary" className="block mb-2">
                            Site Identifier
                        </ThemedText>
                        <ThemedInput
                            type="text"
                            value={selectedMonitor?.url ?? currentSite.identifier}
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
                        const label =
                            typeof interval === "number"
                                ? value < 60000
                                    ? `${value / 1000}s`
                                    : value < 3600000
                                      ? `${value / 60000}m`
                                      : `${value / 3600000}h`
                                : interval.label ||
                                  (interval.value < 60000
                                      ? `${interval.value / 1000}s`
                                      : interval.value < 3600000
                                        ? `${interval.value / 60000}m`
                                        : `${interval.value / 3600000}h`);
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

            {/* Site Information */}
            <ThemedCard icon="📊" title="Site Information" padding="xl" rounded="xl" shadow="md" className="mb-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <ThemedText size="sm" variant="secondary">
                                Site Identifier:
                            </ThemedText>
                            <ThemedBadge variant="secondary" size="xs">
                                {currentSite.identifier}
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
