import type { ChangeEvent, ReactNode, RefObject } from "react";
import type { IconType } from "react-icons";
import type { JSX } from "react/jsx-runtime";

import type { BackupSummary } from "./BackupSummary";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";
import { Tooltip } from "../../common/Tooltip/Tooltip";
import { SettingsSection } from "./SettingsSection";

interface MaintenanceSectionProperties {
    readonly backupSummary: BackupSummary | null;
    readonly downloadButtonIcon: ReactNode;
    readonly icon: IconType;
    readonly isLoading: boolean;
    readonly onDownloadBackup: () => void;
    readonly onRefreshHistory: () => void;
    readonly onResetData: () => void;
    readonly onRestoreClick: () => void;
    readonly onRestoreFileChange: (
        event: ChangeEvent<HTMLInputElement>
    ) => void;
    readonly refreshButtonIcon: ReactNode;
    readonly resetButtonIcon: ReactNode;
    readonly restoreFileInputRef: RefObject<HTMLInputElement | null>;
    readonly showButtonLoading: boolean;
    readonly uploadButtonIcon: ReactNode;
}

/**
 * Backup, restore, and maintenance utilities section.
 */
export const MaintenanceSection = ({
    backupSummary,
    downloadButtonIcon,
    icon,
    isLoading,
    onDownloadBackup,
    onRefreshHistory,
    onResetData,
    onRestoreClick,
    onRestoreFileChange,
    refreshButtonIcon,
    resetButtonIcon,
    restoreFileInputRef,
    showButtonLoading,
    uploadButtonIcon,
}: MaintenanceSectionProperties): JSX.Element => (
    <SettingsSection
        description="Manage data exports and advanced utilities."
        icon={icon}
        testId="settings-section-data"
        title="Data & Maintenance"
    >
        <div className="settings-actions">
            <ThemedButton
                className="settings-actions__primary"
                data-testid="settings-export-data"
                disabled={isLoading}
                icon={downloadButtonIcon}
                loading={showButtonLoading}
                onClick={onDownloadBackup}
                size="sm"
                variant="primary"
            >
                Export monitoring data
            </ThemedButton>
            <Tooltip content="Restore a previously exported SQLite backup (overwrites current data)">
                {(triggerProps) => (
                    <ThemedButton
                        {...triggerProps}
                        data-testid="settings-restore-backup"
                        disabled={isLoading}
                        icon={uploadButtonIcon}
                        loading={showButtonLoading}
                        onClick={onRestoreClick}
                        size="sm"
                        variant="secondary"
                    >
                        Restore backup
                    </ThemedButton>
                )}
            </Tooltip>
            <input
                accept=".sqlite,.sqlite3,.db,.db3"
                data-testid="settings-restore-input"
                hidden
                onChange={onRestoreFileChange}
                ref={restoreFileInputRef}
                type="file"
            />
            <Tooltip content="Refreshes monitoring history from the database">
                {(triggerProps) => (
                    <ThemedButton
                        {...triggerProps}
                        data-testid="settings-refresh-history"
                        disabled={isLoading}
                        icon={refreshButtonIcon}
                        loading={showButtonLoading}
                        onClick={onRefreshHistory}
                        size="sm"
                        variant="secondary"
                    >
                        Refresh history
                    </ThemedButton>
                )}
            </Tooltip>
            <Tooltip content="Clear all monitoring data and reset settings">
                {(triggerProps) => (
                    <ThemedButton
                        {...triggerProps}
                        data-testid="settings-reset-all"
                        disabled={isLoading}
                        icon={resetButtonIcon}
                        loading={showButtonLoading}
                        onClick={onResetData}
                        size="sm"
                        variant="error"
                    >
                        Reset everything
                    </ThemedButton>
                )}
            </Tooltip>
            <div
                className="settings-field__helper"
                data-testid="settings-backup-metadata"
            >
                {backupSummary ? (
                    <>
                        <ThemedText size="xs" variant="secondary">
                            Latest backup: {backupSummary.formattedDate} ·{" "}
                            {backupSummary.formattedSize} · schema v
                            {backupSummary.schemaVersion}
                        </ThemedText>
                        <ThemedText size="xs" variant="tertiary">
                            Retain ~{backupSummary.retentionHintDays} day(s)
                        </ThemedText>
                    </>
                ) : (
                    <ThemedText size="xs" variant="tertiary">
                        Download a backup to view creation time, size, and
                        schema version metadata for restore validation.
                    </ThemedText>
                )}
            </div>
        </div>
    </SettingsSection>
);
