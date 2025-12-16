/* eslint-disable react/no-multi-comp -- Provider setup UI uses small, tightly-scoped local components for clarity. */

import type { CloudStatusSummary } from "@shared/types/cloud";
import type { JSX } from "react/jsx-runtime";

import {
    type ChangeEvent,
    type MouseEvent as ReactMouseEvent,
    useCallback,
    useMemo,
    useState,
} from "react";

import { StatusIndicator } from "../../../theme/components/StatusIndicator";
import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedInput } from "../../../theme/components/ThemedInput";
import { ThemedText } from "../../../theme/components/ThemedText";
import { SettingItem } from "../../shared/SettingItem";

type ConnectionSiteStatus = "down" | "pending" | "up";

type CloudProviderTabKey =
    | "dropbox"
    | "filesystem"
    | "google-drive"
    | "onedrive"
    | "webdav";

interface CloudProviderTabDefinition {
    readonly description: string;
    readonly isAvailable: boolean;
    readonly key: CloudProviderTabKey;
    readonly label: string;
}

const CLOUD_PROVIDER_TABS: readonly CloudProviderTabDefinition[] = [
    {
        description: "OAuth + PKCE via system browser.",
        isAvailable: true,
        key: "dropbox",
        label: "Dropbox",
    },
    {
        description: "Pick a local folder (bring your own sync client).",
        isAvailable: true,
        key: "filesystem",
        label: "Local folder",
    },
    {
        description: "Planned provider integration.",
        isAvailable: false,
        key: "google-drive",
        label: "Google Drive",
    },
    {
        description: "Planned provider integration.",
        isAvailable: false,
        key: "onedrive",
        label: "OneDrive",
    },
    {
        description: "Planned provider integration.",
        isAvailable: false,
        key: "webdav",
        label: "WebDAV",
    },
] as const;

function resolveConnectionSiteStatus(
    status: CloudStatusSummary | null
): ConnectionSiteStatus {
    if (status?.connected) {
        return "up";
    }

    if (status?.configured) {
        return "down";
    }

    return "pending";
}

function resolveProviderLabel(status: CloudStatusSummary | null): string {
    const provider = status?.provider ?? null;

    if (provider === "dropbox") {
        const accountLabel =
            status?.providerDetails?.kind === "dropbox"
                ? status.providerDetails.accountLabel
                : undefined;

        return accountLabel ? `Dropbox (${accountLabel})` : "Dropbox";
    }

    if (provider === "filesystem") {
        return "Local folder";
    }

    if (provider === "google-drive") {
        return "Google Drive";
    }

    if (provider === "webdav") {
        return "WebDAV";
    }

    return "Not configured";
}

function resolveActiveProviderTab(
    status: CloudStatusSummary | null
): CloudProviderTabKey | null {
    const provider = status?.provider ?? null;

    switch (provider) {
        case "dropbox":
        case "filesystem":
        case "google-drive":
        case "webdav": {
            return provider;
        }
        case null: {
            return null;
        }
        default: {
            return null;
        }
    }
}

function resolveCloudProviderTabLabel(key: CloudProviderTabKey): string {
    return CLOUD_PROVIDER_TABS.find((entry) => entry.key === key)?.label ?? key;
}

interface CloudProviderStatusControlProperties {
    readonly providerLabel: string;
    readonly status: ConnectionSiteStatus;
}

const CloudProviderStatusControl = ({
    providerLabel,
    status,
}: CloudProviderStatusControlProperties): JSX.Element => (
    <div className="flex items-center gap-3">
        <StatusIndicator showText status={status} />
        <ThemedText size="sm" variant="secondary">
            {providerLabel}
        </ThemedText>
    </div>
);

interface ProviderTabListProperties {
    readonly ariaLabel: string;
    readonly onSelect: (key: CloudProviderTabKey) => void;
    readonly selectedKey: CloudProviderTabKey;
}

const ProviderTabList = ({
    ariaLabel,
    onSelect,
    selectedKey,
}: ProviderTabListProperties): JSX.Element => {
    const handleTabClick = useCallback(
        (event: ReactMouseEvent<HTMLButtonElement>): void => {
            const rawKey = event.currentTarget.dataset["providerKey"];
            if (!rawKey) {
                return;
            }

            const match = CLOUD_PROVIDER_TABS.find((tab) => tab.key === rawKey);
            if (!match) {
                return;
            }

            onSelect(match.key);
        },
        [onSelect]
    );

    return (
        <div aria-label={ariaLabel} className="flex flex-wrap gap-2" role="tablist">
            {CLOUD_PROVIDER_TABS.map((tab) => {
                const isSelected = tab.key === selectedKey;
                const isAriaDisabled = !tab.isAvailable;

                const variantClass = isSelected
                    ? "themed-button--primary"
                    : "themed-button--secondary";

                const stateClass = isAriaDisabled
                    ? "opacity-60"
                    : "hover:opacity-95";

                return (
                    <button
                        aria-controls={`cloud-provider-panel-${tab.key}`}
                        aria-disabled={isAriaDisabled}
                        aria-selected={isSelected}
                        className={[
                            "themed-button themed-button--size-sm",
                            variantClass,
                            stateClass,
                        ].join(" ")}
                        data-provider-key={tab.key}
                        id={`cloud-provider-tab-${tab.key}`}
                        key={tab.key}
                        onClick={handleTabClick}
                        role="tab"
                        tabIndex={isSelected ? 0 : -1}
                        type="button"
                    >
                        {tab.label}
                        {tab.isAvailable ? null : " (soon)"}
                    </button>
                );
            })}
        </div>
    );
};

interface ProviderPanelProperties {
    readonly activeProviderTab: CloudProviderTabKey | null;
    readonly configured: boolean;
    readonly connected: boolean;
    readonly filesystemBaseDirectory: string;
    readonly filesystemConfiguredBaseDirectory: null | string;
    readonly isConfiguringFilesystemProvider: boolean;
    readonly isConnectingDropbox: boolean;
    readonly onConfigureFilesystemProviderClick: () => void;
    readonly onConnectDropbox: () => void;
    readonly onFilesystemBaseDirectoryChange: (
        event: ChangeEvent<HTMLInputElement>
    ) => void;
    readonly providerSetupLocked: boolean;
    readonly selectedProviderTab: CloudProviderTabKey;
}

const ProviderPanel = ({
    activeProviderTab,
    configured,
    connected,
    filesystemBaseDirectory,
    filesystemConfiguredBaseDirectory,
    isConfiguringFilesystemProvider,
    isConnectingDropbox,
    onConfigureFilesystemProviderClick,
    onConnectDropbox,
    onFilesystemBaseDirectoryChange,
    providerSetupLocked,
    selectedProviderTab,
}: ProviderPanelProperties): JSX.Element => {
    const providerBlockMessage =
        providerSetupLocked && activeProviderTab
            ? `Currently configured provider is ${resolveCloudProviderTabLabel(activeProviderTab)}. Disconnect or clear configuration before switching providers.`
            : null;

    const blockedCallout = providerBlockMessage ? (
        <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
            <ThemedText size="xs" variant="secondary">
                {providerBlockMessage}
            </ThemedText>
        </div>
    ) : null;

    const tab = CLOUD_PROVIDER_TABS.find((entry) => entry.key === selectedProviderTab);
    if (!tab) {
        return <div />;
    }

    if (!tab.isAvailable) {
        return (
            <div
                aria-labelledby={`cloud-provider-tab-${tab.key}`}
                className="mt-3"
                id={`cloud-provider-panel-${tab.key}`}
                role="tabpanel"
            >
                {blockedCallout}

                <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
                    <ThemedText size="sm" weight="medium">
                        {tab.label} integration is coming soon
                    </ThemedText>
                    <ThemedText className="mt-1" size="xs" variant="secondary">
                        {tab.description}
                    </ThemedText>
                </div>
            </div>
        );
    }

    if (selectedProviderTab === "dropbox") {
        let connectLabel = "Connect Dropbox";
        if (configured) {
            connectLabel = "Reconnect Dropbox";
        }
        if (isConnectingDropbox) {
            connectLabel = "Connecting…";
        }

        return (
            <div
                aria-labelledby="cloud-provider-tab-dropbox"
                className="mt-3"
                id="cloud-provider-panel-dropbox"
                role="tabpanel"
            >
                {blockedCallout}

                <ThemedText className="mt-1" size="xs" variant="secondary">
                    Dropbox uses OAuth in your default browser. Tokens are stored in the
                    main process and never exposed to the renderer.
                </ThemedText>

                {connected ? null : (
                    <div className="mt-3 flex flex-wrap gap-2">
                        <ThemedButton
                            disabled={providerSetupLocked || isConnectingDropbox}
                            onClick={onConnectDropbox}
                            size="sm"
                            variant="primary"
                        >
                            {connectLabel}
                        </ThemedButton>
                    </div>
                )}
            </div>
        );
    }

    if (selectedProviderTab === "filesystem") {
        return (
            <div
                aria-labelledby="cloud-provider-tab-filesystem"
                className="mt-3"
                id="cloud-provider-panel-filesystem"
                role="tabpanel"
            >
                {blockedCallout}

                <ThemedText className="mt-1" size="xs" variant="secondary">
                    Configure a local folder. This is useful if you want to manage syncing
                    externally (e.g. Dropbox/Drive client).
                </ThemedText>

                {filesystemConfiguredBaseDirectory ? (
                    <ThemedText className="mt-2" size="xs" variant="tertiary">
                        Current folder: {filesystemConfiguredBaseDirectory}
                    </ThemedText>
                ) : null}

                {connected ? null : (
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="flex-1">
                            <ThemedInput
                                aria-label="Local folder base directory"
                                disabled={providerSetupLocked}
                                onChange={onFilesystemBaseDirectoryChange}
                                placeholder="C:\\Path\\To\\CloudStorage"
                                value={filesystemBaseDirectory}
                            />
                        </div>
                        <ThemedButton
                            disabled={
                                providerSetupLocked ||
                                isConfiguringFilesystemProvider ||
                                filesystemBaseDirectory.trim().length === 0
                            }
                            onClick={onConfigureFilesystemProviderClick}
                            size="sm"
                            variant="secondary"
                        >
                            {isConfiguringFilesystemProvider
                                ? "Configuring…"
                                : "Use folder"}
                        </ThemedButton>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            aria-labelledby={`cloud-provider-tab-${tab.key}`}
            className="mt-3"
            id={`cloud-provider-panel-${tab.key}`}
            role="tabpanel"
        >
            {blockedCallout}
            <ThemedText size="sm" variant="secondary">
                Provider setup is not available yet.
            </ThemedText>
        </div>
    );
};

/**
 * Props for the provider setup panel shown at the top of Cloud settings.
 */
export interface CloudProviderSetupPanelProperties {
    readonly isConfiguringFilesystemProvider: boolean;
    readonly isConnectingDropbox: boolean;
    readonly isDisconnecting: boolean;
    readonly isRefreshingStatus: boolean;
    readonly onConfigureFilesystemProvider: (baseDirectory: string) => void;
    readonly onConnectDropbox: () => void;
    readonly onDisconnect: () => void;
    readonly onRefreshStatus: () => void;
    readonly status: CloudStatusSummary | null;
}

export const CloudProviderSetupPanel = ({
    isConfiguringFilesystemProvider,
    isConnectingDropbox,
    isDisconnecting,
    isRefreshingStatus,
    onConfigureFilesystemProvider,
    onConnectDropbox,
    onDisconnect,
    onRefreshStatus,
    status,
}: CloudProviderSetupPanelProperties): JSX.Element => {
    const configured = status?.configured ?? false;
    const connected = status?.connected ?? false;

    const providerLabel = resolveProviderLabel(status);
    const connectionSiteStatus = resolveConnectionSiteStatus(status);

    const activeProviderTab = resolveActiveProviderTab(status);

    const [userSelectedProviderTab, setUserSelectedProviderTab] =
        useState<CloudProviderTabKey | null>(null);

    const selectedProviderTab: CloudProviderTabKey =
        userSelectedProviderTab ?? activeProviderTab ?? "dropbox";

    const providerSetupLocked =
        configured &&
        activeProviderTab !== null &&
        activeProviderTab !== selectedProviderTab;

    const [filesystemBaseDirectory, setFilesystemBaseDirectory] = useState("");

    const filesystemConfiguredBaseDirectory =
        status?.providerDetails?.kind === "filesystem"
            ? status.providerDetails.baseDirectory
            : null;

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

    const handleProviderTabSelect = useCallback(
        (key: CloudProviderTabKey): void => {
            setUserSelectedProviderTab(key);
        },
        []
    );

    const providerStatusControl = useMemo(
        (): JSX.Element => (
            <CloudProviderStatusControl
                providerLabel={providerLabel}
                status={connectionSiteStatus}
            />
        ),
        [connectionSiteStatus, providerLabel]
    );

    let disconnectControl: JSX.Element | null = null;
    if (connected) {
        disconnectControl = (
            <ThemedButton
                disabled={isDisconnecting}
                onClick={onDisconnect}
                size="sm"
                variant="error"
            >
                {isDisconnecting ? "Disconnecting…" : "Disconnect"}
            </ThemedButton>
        );
    } else if (configured) {
        disconnectControl = (
            <ThemedButton
                disabled={isDisconnecting}
                onClick={onDisconnect}
                size="sm"
                variant="secondary"
            >
                {isDisconnecting ? "Clearing…" : "Clear configuration"}
            </ThemedButton>
        );
    }

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <ThemedText size="sm" variant="secondary" weight="medium">
                Provider
            </ThemedText>

            <div className="settings-toggle-stack mt-3">
                <SettingItem
                    control={providerStatusControl}
                    description="Current cloud provider connection status."
                    title="Status"
                />
            </div>

            <div className="mt-3 flex flex-col gap-3">
                <ProviderTabList
                    ariaLabel="Cloud providers"
                    onSelect={handleProviderTabSelect}
                    selectedKey={selectedProviderTab}
                />

                <ProviderPanel
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
                    onConfigureFilesystemProviderClick={
                        handleConfigureFilesystemProviderClick
                    }
                    onConnectDropbox={onConnectDropbox}
                    onFilesystemBaseDirectoryChange={
                        handleFilesystemDirectoryChange
                    }
                    providerSetupLocked={providerSetupLocked}
                    selectedProviderTab={selectedProviderTab}
                />

                <div className="flex flex-wrap gap-2">
                    <ThemedButton
                        disabled={isRefreshingStatus}
                        onClick={onRefreshStatus}
                        size="sm"
                        variant="secondary"
                    >
                        {isRefreshingStatus ? "Refreshing…" : "Refresh status"}
                    </ThemedButton>

                    {disconnectControl}
                </div>
            </div>
        </div>
    );
};

/* eslint-enable react/no-multi-comp -- Provider setup UI relies on local components above. */
