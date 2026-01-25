import type { ChangeEvent } from "react";
import type { JSX } from "react/jsx-runtime";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedInput } from "../../../theme/components/ThemedInput";
import { ThemedText } from "../../../theme/components/ThemedText";
import {
    CLOUD_PROVIDER_SETUP_PANEL_TABS,
    type CloudProviderSetupPanelTabDefinition,
    type CloudProviderSetupPanelTabKey,
} from "./CloudProviderSetupPanel.model";
import { CloudProviderSetupPanelOAuthProviderPanel } from "./CloudProviderSetupPanel.OAuthProviderPanel";

/**
 * Props for {@link CloudProviderSetupPanelProviderPanel}.
 */
/**
 * Props for {@link CloudProviderSetupPanelProviderPanel}.
 */
export interface CloudProviderSetupPanelProviderPanelProperties {
    readonly activeProviderTab: CloudProviderSetupPanelTabKey | null;
    readonly configured: boolean;
    readonly connected: boolean;
    readonly filesystemBaseDirectory: string;
    readonly filesystemConfiguredBaseDirectory: null | string;
    readonly isConfiguringFilesystemProvider: boolean;
    readonly isConnectingDropbox: boolean;
    readonly isConnectingGoogleDrive: boolean;
    readonly onConfigureFilesystemProviderClick: () => void;
    readonly onConnectDropbox: () => void;
    readonly onConnectGoogleDrive: () => void;
    readonly onFilesystemBaseDirectoryChange: (
        event: ChangeEvent<HTMLInputElement>
    ) => void;
    readonly selectedProviderTab: CloudProviderSetupPanelTabKey;
}

function renderUnavailableProviderPanel(args: {
    tab: CloudProviderSetupPanelTabDefinition;
}): JSX.Element {
    return (
        <div
            aria-labelledby={`cloud-provider-tab-${args.tab.key}`}
            className="mt-3"
            id={`cloud-provider-panel-${args.tab.key}`}
            role="tabpanel"
        >
            <div className="settings-subcard settings-subcard--compact mt-3">
                <ThemedText as="p" size="sm" weight="medium">
                    {args.tab.label} integration is coming soon
                </ThemedText>
                <ThemedText className="mt-1" size="xs" variant="secondary">
                    {args.tab.description}
                </ThemedText>
            </div>
        </div>
    );
}

function renderFilesystemProviderPanel(args: {
    connected: boolean;
    filesystemBaseDirectory: string;
    filesystemConfiguredBaseDirectory: null | string;
    isConfiguringFilesystemProvider: boolean;
    onConfigureFilesystemProviderClick: () => void;
    onFilesystemBaseDirectoryChange: (
        event: ChangeEvent<HTMLInputElement>
    ) => void;
}): JSX.Element {
    const ariaDisabled =
        args.isConfiguringFilesystemProvider ||
        args.filesystemBaseDirectory.trim().length === 0;

    const handleFilesystemBaseDirectoryChange =
        args.onFilesystemBaseDirectoryChange;
    const handleConfigureFilesystemProviderClick =
        args.onConfigureFilesystemProviderClick;

    return (
        <div
            aria-labelledby="cloud-provider-tab-filesystem"
            className="mt-3"
            id="cloud-provider-panel-filesystem"
            role="tabpanel"
        >
            <div className="settings-subcard settings-subcard--compact settings-paragraph-stack mt-3">
                <ThemedText as="p" size="xs" variant="secondary">
                    Configure a local folder. If you already use Dropbox/Google
                    Drive/iCloud/SyncThing, point this at a folder inside your
                    sync directory and let your existing sync client do the
                    rest.
                </ThemedText>

                {args.filesystemConfiguredBaseDirectory ? (
                    <ThemedText as="p" size="xs" variant="tertiary">
                        Current folder: {args.filesystemConfiguredBaseDirectory}
                    </ThemedText>
                ) : null}

                {args.connected ? (
                    <ThemedText as="p" size="xs" variant="tertiary">
                        To use a different folder, clear configuration above and
                        set it again.
                    </ThemedText>
                ) : null}
            </div>

            {args.connected ? null : (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex-1">
                        <ThemedInput
                            aria-label="Local folder base directory"
                            onChange={handleFilesystemBaseDirectoryChange}
                            placeholder="Path to folder (e.g. C:\\Users\\You\\Dropbox\\UptimeWatcher)"
                            value={args.filesystemBaseDirectory}
                        />
                    </div>
                    <ThemedButton
                        aria-disabled={ariaDisabled}
                        disabled={ariaDisabled}
                        onClick={handleConfigureFilesystemProviderClick}
                        size="sm"
                        variant="secondary"
                    >
                        {args.isConfiguringFilesystemProvider
                            ? "Configuring…"
                            : "Use folder"}
                    </ThemedButton>
                </div>
            )}
        </div>
    );
}

/**
 * Renders the provider-specific setup panel for the selected tab.
 */
export const CloudProviderSetupPanelProviderPanel = ({
    activeProviderTab,
    configured,
    connected,
    filesystemBaseDirectory,
    filesystemConfiguredBaseDirectory,
    isConfiguringFilesystemProvider,
    isConnectingDropbox,
    isConnectingGoogleDrive,
    onConfigureFilesystemProviderClick,
    onConnectDropbox,
    onConnectGoogleDrive,
    onFilesystemBaseDirectoryChange,
    selectedProviderTab,
}: CloudProviderSetupPanelProviderPanelProperties): JSX.Element => {
    const isSelectedProviderActive =
        activeProviderTab !== null && activeProviderTab === selectedProviderTab;
    const configuredForSelectedProvider = configured && isSelectedProviderActive;
    const connectedForSelectedProvider = connected && isSelectedProviderActive;

    const tab = CLOUD_PROVIDER_SETUP_PANEL_TABS.find(
        (entry) => entry.key === selectedProviderTab
    );
    if (!tab) {
        return <div />;
    }

    if (!tab.isAvailable) {
        return renderUnavailableProviderPanel({ tab });
    }

    switch (selectedProviderTab) {
        case "dropbox": {
            return (
                <CloudProviderSetupPanelOAuthProviderPanel
                    configured={configuredForSelectedProvider}
                    connected={connectedForSelectedProvider}
                    description="Opens your default browser to authorize Dropbox access (OAuth + PKCE). Uptime Watcher stores an encrypted token on this device (no password is stored)."
                    isConnecting={isConnectingDropbox}
                    onConnect={onConnectDropbox}
                    providerKey="dropbox"
                    providerLabel="Dropbox"
                />
            );
        }
        case "filesystem": {
            return renderFilesystemProviderPanel({
                connected: connectedForSelectedProvider,
                filesystemBaseDirectory,
                filesystemConfiguredBaseDirectory,
                isConfiguringFilesystemProvider,
                onConfigureFilesystemProviderClick,
                onFilesystemBaseDirectoryChange,
            });
        }
        case "google-drive": {
            return (
                <CloudProviderSetupPanelOAuthProviderPanel
                    configured={configuredForSelectedProvider}
                    connected={connectedForSelectedProvider}
                    description="Opens your default browser to authorize Google Drive access (OAuth + PKCE). Data is stored in Drive’s app data area (appDataFolder), so it won’t appear in your normal Drive folders."
                    isConnecting={isConnectingGoogleDrive}
                    onConnect={onConnectGoogleDrive}
                    providerKey="google-drive"
                    providerLabel="Google Drive"
                />
            );
        }
        case "webdav": {
            return renderUnavailableProviderPanel({ tab });
        }
        default: {
            return (
                <div
                    aria-labelledby={`cloud-provider-tab-${tab.key}`}
                    className="mt-3"
                    id={`cloud-provider-panel-${tab.key}`}
                    role="tabpanel"
                >
                    <ThemedText size="sm" variant="secondary">
                        Provider setup is not available yet.
                    </ThemedText>
                </div>
            );
        }
    }
};
