/* eslint-disable react/no-multi-comp -- Provider setup UI uses small, tightly-scoped local components for clarity. */

import type { CloudStatusSummary } from "@shared/types/cloud";
import type { JSX } from "react/jsx-runtime";

import {
    type ChangeEvent,
    type KeyboardEvent as ReactKeyboardEvent,
    type MouseEvent as ReactMouseEvent,
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react";

import { StatusIndicator } from "../../../theme/components/StatusIndicator";
import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedInput } from "../../../theme/components/ThemedInput";
import { ThemedText } from "../../../theme/components/ThemedText";
import { SettingItem } from "../../shared/SettingItem";

type ConnectionSiteStatus = "down" | "pending" | "up";

type CloudProviderTabKey = "dropbox" | "filesystem" | "google-drive" | "webdav";

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
        description: "Stores app data in Google Drive appDataFolder.",
        isAvailable: true,
        key: "google-drive",
        label: "Google Drive",
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
        const accountLabel =
            status?.providerDetails?.kind === "google-drive"
                ? status.providerDetails.accountLabel
                : undefined;

        return accountLabel ? `Google Drive (${accountLabel})` : "Google Drive";
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
    const buttonByKeyRef = useRef(
        new Map<CloudProviderTabKey, HTMLButtonElement>()
    );

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

    const handleKeyDown = useCallback(
        (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
            const keys = CLOUD_PROVIDER_TABS.map((tab) => tab.key);
            const currentIndex = keys.indexOf(selectedKey);
            if (currentIndex === -1) {
                return;
            }

            let nextKey: CloudProviderTabKey = selectedKey;
            switch (event.key) {
                case "ArrowLeft": {
                    const nextIndex =
                        (currentIndex - 1 + keys.length) % keys.length;
                    nextKey = keys[nextIndex] ?? selectedKey;
                    break;
                }
                case "ArrowRight": {
                    const nextIndex = (currentIndex + 1) % keys.length;
                    nextKey = keys[nextIndex] ?? selectedKey;
                    break;
                }
                case "End": {
                    nextKey = keys.at(-1) ?? selectedKey;
                    break;
                }
                case "Home": {
                    nextKey = keys[0] ?? selectedKey;
                    break;
                }
                default: {
                    return;
                }
            }

            event.preventDefault();
            onSelect(nextKey);

            // Ensure focus follows selection for roving-tabindex behavior.
            queueMicrotask(() => {
                buttonByKeyRef.current.get(nextKey)?.focus();
            });
        },
        [onSelect, selectedKey]
    );

    const handleButtonRef = useCallback((element: HTMLButtonElement | null) => {
        if (!element) {
            return;
        }

        const rawKey = element.dataset["providerKey"];
        if (!rawKey) {
            return;
        }

        const match = CLOUD_PROVIDER_TABS.find((tab) => tab.key === rawKey);
        if (!match) {
            return;
        }

        buttonByKeyRef.current.set(match.key, element);
    }, []);

    return (
        <div
            aria-label={ariaLabel}
            aria-orientation="horizontal"
            className="flex flex-wrap gap-2"
            role="tablist"
        >
            {CLOUD_PROVIDER_TABS.map((tab) => {
                const isSelected = tab.key === selectedKey;

                const variantClass = isSelected
                    ? "themed-button--primary"
                    : "themed-button--secondary";

                const stateClass = tab.isAvailable
                    ? "hover:opacity-95"
                    : "opacity-70";

                return (
                    <button
                        aria-controls={`cloud-provider-panel-${tab.key}`}
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
                        onKeyDown={handleKeyDown}
                        ref={handleButtonRef}
                        role="tab"
                        tabIndex={isSelected ? 0 : -1}
                        title={tab.isAvailable ? undefined : "Coming soon"}
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
    readonly isConnectingGoogleDrive: boolean;
    readonly onConfigureFilesystemProviderClick: () => void;
    readonly onConnectDropbox: () => void;
    readonly onConnectGoogleDrive: () => void;
    readonly onFilesystemBaseDirectoryChange: (
        event: ChangeEvent<HTMLInputElement>
    ) => void;
    readonly providerSetupLocked: boolean;
    readonly selectedProviderTab: CloudProviderTabKey;
}

function resolveConnectActionLabel(args: {
    configured: boolean;
    isConnecting: boolean;
    providerLabel: string;
}): string {
    if (args.isConnecting) {
        return "Connecting…";
    }

    return args.configured
        ? `Reconnect ${args.providerLabel}`
        : `Connect ${args.providerLabel}`;
}

function renderUnavailableProviderPanel(args: {
    blockedCallout: JSX.Element | null;
    tab: CloudProviderTabDefinition;
}): JSX.Element {
    return (
        <div
            aria-labelledby={`cloud-provider-tab-${args.tab.key}`}
            className="mt-3"
            id={`cloud-provider-panel-${args.tab.key}`}
            role="tabpanel"
        >
            {args.blockedCallout}

            <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
                <ThemedText size="sm" weight="medium">
                    {args.tab.label} integration is coming soon
                </ThemedText>
                <ThemedText className="mt-1" size="xs" variant="secondary">
                    {args.tab.description}
                </ThemedText>
            </div>
        </div>
    );
}

function renderOAuthProviderPanel(args: {
    blockedCallout: JSX.Element | null;
    configured: boolean;
    connected: boolean;
    description: string;
    isConnecting: boolean;
    onConnect: () => void;
    providerKey: "dropbox" | "google-drive";
    providerLabel: string;
    providerSetupLocked: boolean;
}): JSX.Element {
    const connectLabel = resolveConnectActionLabel({
        configured: args.configured,
        isConnecting: args.isConnecting,
        providerLabel: args.providerLabel,
    });

    const handleConnectClick = args.onConnect;

    return (
        <div
            aria-labelledby={`cloud-provider-tab-${args.providerKey}`}
            className="mt-3"
            id={`cloud-provider-panel-${args.providerKey}`}
            role="tabpanel"
        >
            {args.blockedCallout}

            <ThemedText className="mt-1" size="xs" variant="secondary">
                {args.description}
            </ThemedText>

            {args.connected ? null : (
                <div className="mt-3 flex flex-wrap gap-2">
                    <ThemedButton
                        disabled={args.providerSetupLocked || args.isConnecting}
                        onClick={handleConnectClick}
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

function renderFilesystemProviderPanel(args: {
    blockedCallout: JSX.Element | null;
    connected: boolean;
    filesystemBaseDirectory: string;
    filesystemConfiguredBaseDirectory: null | string;
    isConfiguringFilesystemProvider: boolean;
    onConfigureFilesystemProviderClick: () => void;
    onFilesystemBaseDirectoryChange: (
        event: ChangeEvent<HTMLInputElement>
    ) => void;
    providerSetupLocked: boolean;
}): JSX.Element {
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
            {args.blockedCallout}

            <ThemedText className="mt-1" size="xs" variant="secondary">
                Configure a local folder. This is useful if you want to manage
                syncing externally (e.g. Dropbox/Drive client).
            </ThemedText>

            {args.filesystemConfiguredBaseDirectory ? (
                <ThemedText className="mt-2" size="xs" variant="tertiary">
                    Current folder: {args.filesystemConfiguredBaseDirectory}
                </ThemedText>
            ) : null}

            {args.connected ? null : (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex-1">
                        <ThemedInput
                            aria-label="Local folder base directory"
                            disabled={args.providerSetupLocked}
                            onChange={handleFilesystemBaseDirectoryChange}
                            placeholder="C:\\Path\\To\\CloudStorage"
                            value={args.filesystemBaseDirectory}
                        />
                    </div>
                    <ThemedButton
                        disabled={
                            args.providerSetupLocked ||
                            args.isConfiguringFilesystemProvider ||
                            args.filesystemBaseDirectory.trim().length === 0
                        }
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

const ProviderPanel = ({
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
    providerSetupLocked,
    selectedProviderTab,
}: ProviderPanelProperties): JSX.Element => {
    const isSelectedProviderActive =
        activeProviderTab !== null && activeProviderTab === selectedProviderTab;
    const configuredForSelectedProvider =
        configured && isSelectedProviderActive;
    const connectedForSelectedProvider = connected && isSelectedProviderActive;

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

    const tab = CLOUD_PROVIDER_TABS.find(
        (entry) => entry.key === selectedProviderTab
    );
    if (!tab) {
        return <div />;
    }

    if (!tab.isAvailable) {
        return renderUnavailableProviderPanel({ blockedCallout, tab });
    }

    switch (selectedProviderTab) {
        case "dropbox": {
            return renderOAuthProviderPanel({
                blockedCallout,
                configured: configuredForSelectedProvider,
                connected: connectedForSelectedProvider,
                description:
                    "Dropbox uses OAuth in your default browser. Tokens are stored in the main process and never exposed to the renderer.",
                isConnecting: isConnectingDropbox,
                onConnect: onConnectDropbox,
                providerKey: "dropbox",
                providerLabel: "Dropbox",
                providerSetupLocked,
            });
        }
        case "filesystem": {
            return renderFilesystemProviderPanel({
                blockedCallout,
                connected: connectedForSelectedProvider,
                filesystemBaseDirectory,
                filesystemConfiguredBaseDirectory,
                isConfiguringFilesystemProvider,
                onConfigureFilesystemProviderClick,
                onFilesystemBaseDirectoryChange,
                providerSetupLocked,
            });
        }
        case "google-drive": {
            return renderOAuthProviderPanel({
                blockedCallout,
                configured: configuredForSelectedProvider,
                connected: connectedForSelectedProvider,
                description:
                    "Google Drive uses OAuth in your default browser. Tokens are stored in the main process and never exposed to the renderer. Uptime Watcher stores files in the app data folder (private to the app).",
                isConnecting: isConnectingGoogleDrive,
                onConnect: onConnectGoogleDrive,
                providerKey: "google-drive",
                providerLabel: "Google Drive",
                providerSetupLocked,
            });
        }
        case "webdav": {
            return renderUnavailableProviderPanel({ blockedCallout, tab });
        }
        default: {
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
        }
    }
};

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

    const handleFilesystemDirectoryChange = useCallback((
        event: ChangeEvent<HTMLInputElement>
    ): void => {
        setFilesystemBaseDirectory(event.target.value);
    }, []);

    const handleConfigureFilesystemProviderClick = useCallback((): void => {
        const trimmed = filesystemBaseDirectory.trim();
        if (!trimmed) {
            return;
        }

        onConfigureFilesystemProvider(trimmed);
        setFilesystemBaseDirectory("");
    }, [filesystemBaseDirectory, onConfigureFilesystemProvider]);

    const handleProviderTabSelect = useCallback((
        key: CloudProviderTabKey
    ): void => {
        setUserSelectedProviderTab(key);
    }, []);

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
                    isConnectingGoogleDrive={isConnectingGoogleDrive}
                    onConfigureFilesystemProviderClick={
                        handleConfigureFilesystemProviderClick
                    }
                    onConnectDropbox={onConnectDropbox}
                    onConnectGoogleDrive={onConnectGoogleDrive}
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
