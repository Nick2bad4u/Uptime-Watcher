import type { CloudStatusSummary } from "@shared/types/cloud";
import type { JSX } from "react/jsx-runtime";

import { type ChangeEvent, useCallback, useMemo, useState } from "react";

import type { CloudProviderSetupPanelTabKey } from "./CloudProviderSetupPanel.model";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";
import { AppIcons, getIconSize } from "../../../utils/icons";
import { CloudProviderSetupPanelDisconnectControl } from "./CloudProviderSetupPanel.DisconnectControl";
import { CloudProviderSetupPanelProviderLockNotice } from "./CloudProviderSetupPanel.ProviderLockNotice";
import { CloudProviderSetupPanelProviderPanel } from "./CloudProviderSetupPanel.ProviderPanel";
import { CloudProviderSetupPanelProviderTabList } from "./CloudProviderSetupPanel.ProviderTabList";
import { CloudProviderSetupPanelStatusControl } from "./CloudProviderSetupPanel.StatusControl";
import {
    buildDisconnectProviderFirstMessage,
    buildProviderSwitchLockedMessage,
    resolveActiveProviderTab,
    resolveConnectionSiteStatus,
    resolveFilesystemConfiguredBaseDirectory,
    resolveProviderLabel,
} from "./CloudProviderSetupPanel.utils";

/**
 * Props for the provider setup panel shown at the top of Cloud settings.
 */
export interface CloudProviderSetupPanelProperties {
    readonly isConfiguringFilesystemProvider: boolean;
    readonly isConnectingDropbox: boolean;
    readonly isConnectingGoogleDrive: boolean;
    readonly isDisconnecting: boolean;
    readonly isRefreshingStatus: boolean;
    readonly onConfigureFilesystemProvider: (baseDirectory: string) => void;
    readonly onConnectDropbox: () => void;
    readonly onConnectGoogleDrive: () => void;
    readonly onDisconnect: () => void;
    readonly onRefreshStatus: () => void;
    readonly status: CloudStatusSummary | null;
}

export const CloudProviderSetupPanel = ({
    isConfiguringFilesystemProvider,
    isConnectingDropbox,
    isConnectingGoogleDrive,
    isDisconnecting,
    isRefreshingStatus,
    onConfigureFilesystemProvider,
    onConnectDropbox,
    onConnectGoogleDrive,
    onDisconnect,
    onRefreshStatus,
    status,
}: CloudProviderSetupPanelProperties): JSX.Element => {
    const configured = status?.configured ?? false;
    const connected = status?.connected ?? false;

    const providerLabel = resolveProviderLabel(status);
    const connectionSiteStatus = resolveConnectionSiteStatus(status);

    const activeProviderTab = resolveActiveProviderTab(status);
    const lockedProviderTab = configured ? activeProviderTab : null;

    const [userSelectedProviderTab, setUserSelectedProviderTab] =
        useState<CloudProviderSetupPanelTabKey | null>(null);

    const [lockedProviderAttemptTab, setLockedProviderAttemptTab] =
        useState<CloudProviderSetupPanelTabKey | null>(null);

    const selectedProviderTab: CloudProviderSetupPanelTabKey =
        lockedProviderTab ?? userSelectedProviderTab ?? "dropbox";

    const handleAttemptLockedProviderSelect = useCallback(
        (targetKey: CloudProviderSetupPanelTabKey): void => {
            if (!lockedProviderTab) {
                return;
            }

            setLockedProviderAttemptTab(targetKey);
        },
        [lockedProviderTab]
    );

    const handleProviderTabSelect = useCallback(
        (key: CloudProviderSetupPanelTabKey): void => {
            setLockedProviderAttemptTab(null);
            setUserSelectedProviderTab(key);
        },
        []
    );

    const [filesystemBaseDirectory, setFilesystemBaseDirectory] = useState("");

    const filesystemConfiguredBaseDirectory =
        resolveFilesystemConfiguredBaseDirectory(status);

    const handleFilesystemDirectoryChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>): void => {
            setFilesystemBaseDirectory(event.target.value);
        },
        []
    );

    const handleConfigureFilesystemProviderClick = useCallback((): void => {
        const trimmed = filesystemBaseDirectory.trim();
        if (!trimmed) {
            return;
        }

        onConfigureFilesystemProvider(trimmed);
        setFilesystemBaseDirectory("");
    }, [filesystemBaseDirectory, onConfigureFilesystemProvider]);

    const lockedProviderAttemptMessage =
        lockedProviderTab && lockedProviderAttemptTab
            ? buildDisconnectProviderFirstMessage({
                  activeProvider: lockedProviderTab,
                  targetProvider: lockedProviderAttemptTab,
              })
            : null;

    const lockedProviderInfoMessage = lockedProviderTab
        ? buildProviderSwitchLockedMessage(lockedProviderTab)
        : null;

    const handleDismissAttempt = useCallback((): void => {
        setLockedProviderAttemptTab(null);
    }, []);

    const handleRefreshStatusClick = useCallback((): void => {
        onRefreshStatus();
    }, [onRefreshStatus]);

    const ProviderIcon = AppIcons.ui.cloud;
    const providerHeaderIcon = useMemo(
        () => (
            <ProviderIcon
                aria-hidden
                className="settings-accent--primary size-5"
            />
        ),
        [ProviderIcon]
    );

    const providerStatusIconSize = getIconSize("sm");

    return (
        <div className="settings-subcard">
            <div className="settings-subcard__header">
                <div className="settings-subcard__title">
                    {providerHeaderIcon}
                    <ThemedText
                        as="h4"
                        size="sm"
                        variant="secondary"
                        weight="medium"
                    >
                        Provider
                    </ThemedText>
                </div>

                <div className="settings-subcard__actions">
                    <ThemedButton
                        disabled={isRefreshingStatus}
                        onClick={handleRefreshStatusClick}
                        size="sm"
                        variant="secondary"
                    >
                        {isRefreshingStatus ? "Refreshing…" : "Refresh status"}
                    </ThemedButton>

                    <CloudProviderSetupPanelDisconnectControl
                        configured={configured}
                        connected={connected}
                        isDisconnecting={isDisconnecting}
                        onDisconnect={onDisconnect}
                    />
                </div>
            </div>

            <div className="settings-item-stack mt-4">
                <div className="setting-item">
                    <div className="setting-info">
                        <div className="setting-title-row">
                            <span aria-hidden className="setting-item__icon">
                                <ProviderIcon
                                    aria-hidden
                                    className="settings-accent--primary-muted"
                                    size={providerStatusIconSize}
                                />
                            </span>
                            <ThemedText
                                className="setting-title"
                                size="sm"
                                weight="medium"
                            >
                                Status
                            </ThemedText>
                        </div>
                        <ThemedText
                            className="setting-description"
                            size="xs"
                            variant="tertiary"
                        >
                            Current cloud provider connection status.
                        </ThemedText>
                    </div>
                    <div className="setting-control">
                        <CloudProviderSetupPanelStatusControl
                            providerLabel={providerLabel}
                            status={connectionSiteStatus}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
                <CloudProviderSetupPanelProviderTabList
                    ariaLabel="Cloud providers"
                    lockedKey={lockedProviderTab}
                    onAttemptLockedSelect={handleAttemptLockedProviderSelect}
                    onSelect={handleProviderTabSelect}
                    selectedKey={selectedProviderTab}
                />

                <CloudProviderSetupPanelProviderLockNotice
                    attemptMessage={lockedProviderAttemptMessage}
                    infoMessage={lockedProviderInfoMessage}
                    onDismissAttempt={handleDismissAttempt}
                />

                <CloudProviderSetupPanelProviderPanel
                    activeProviderTab={activeProviderTab}
                    configured={configured}
                    connected={connected}
                    filesystemBaseDirectory={filesystemBaseDirectory}
                    filesystemConfiguredBaseDirectory={
                        filesystemConfiguredBaseDirectory
                    }
                    isConfiguringFilesystemProvider={
                        isConfiguringFilesystemProvider
                    }
                    isConnectingDropbox={isConnectingDropbox}
                    isConnectingGoogleDrive={isConnectingGoogleDrive}
                    onConfigureFilesystemProviderClick={
                        handleConfigureFilesystemProviderClick
                    }
                    onConnectDropbox={onConnectDropbox}
                    onConnectGoogleDrive={onConnectGoogleDrive}
                    onFilesystemBaseDirectoryChange={
                        handleFilesystemDirectoryChange
                    }
                    selectedProviderTab={selectedProviderTab}
                />
            </div>
        </div>
    );
};
