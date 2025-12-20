/* eslint-disable react/no-multi-comp -- Provider setup UI uses small, tightly-scoped local components for clarity. */

import type { CloudStatusSummary } from "@shared/types/cloud";
import type { IconType } from "react-icons";
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
import { AppIcons } from "../../../utils/icons";
import { ErrorAlert } from "../../common/ErrorAlert/ErrorAlert";
import { SettingItem } from "../../shared/SettingItem";

type ConnectionSiteStatus = "down" | "pending" | "up";

type CloudProviderTabKey = "dropbox" | "filesystem" | "google-drive" | "webdav";

interface CloudProviderTabDefinition {
    readonly description: string;
    readonly icon: IconType;
    readonly isAvailable: boolean;
    readonly key: CloudProviderTabKey;
    readonly label: string;
}

const CLOUD_PROVIDER_TABS: readonly CloudProviderTabDefinition[] = [
    {
        description: "OAuth + PKCE via system browser.",
        icon: AppIcons.brands.dropbox,
        isAvailable: true,
        key: "dropbox",
        label: "Dropbox",
    },
    {
        description: "Pick a local folder (bring your own sync client).",
        icon: AppIcons.ui.database,
        isAvailable: true,
        key: "filesystem",
        label: "Local folder",
    },
    {
        description: "Stores app data in Google Drive appDataFolder.",
        icon: AppIcons.brands.googleDrive,
        isAvailable: true,
        key: "google-drive",
        label: "Google Drive",
    },
    {
        description: "Planned provider integration.",
        icon: AppIcons.ui.cloud,
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

function buildDisconnectProviderFirstMessage(args: {
    activeProvider: CloudProviderTabKey;
    targetProvider: CloudProviderTabKey;
}): string {
    const activeLabel = resolveCloudProviderTabLabel(args.activeProvider);
    const targetLabel = resolveCloudProviderTabLabel(args.targetProvider);

    return `Disconnect ${activeLabel} before setting up ${targetLabel}.`;
}

function buildProviderSwitchLockedMessage(activeProvider: CloudProviderTabKey): string {
    const activeLabel = resolveCloudProviderTabLabel(activeProvider);
    return `Provider switching is locked while ${activeLabel} is configured. Disconnect to switch providers.`;
}

function resolveFilesystemConfiguredBaseDirectory(
    status: CloudStatusSummary | null
): null | string {
    if (status?.providerDetails?.kind === "filesystem") {
        return status.providerDetails.baseDirectory;
    }

    return null;
}

interface ProviderLockNoticeProperties {
    readonly attemptMessage: null | string;
    readonly infoMessage: null | string;
    readonly onDismissAttempt: () => void;
}

const ProviderLockNotice = ({
    attemptMessage,
    infoMessage,
    onDismissAttempt,
}: ProviderLockNoticeProperties): JSX.Element | null => {
    const handleDismissAttempt = useCallback((): void => {
        onDismissAttempt();
    }, [onDismissAttempt]);

    if (attemptMessage) {
        return (
            <ErrorAlert
                message={attemptMessage}
                onDismiss={handleDismissAttempt}
                variant="warning"
            />
        );
    }

    if (infoMessage) {
        return <ErrorAlert message={infoMessage} variant="info" />;
    }

    return null;
};

interface DisconnectControlProperties {
    readonly configured: boolean;
    readonly connected: boolean;
    readonly isDisconnecting: boolean;
    readonly onDisconnect: () => void;
}

const DisconnectControl = ({
    configured,
    connected,
    isDisconnecting,
    onDisconnect,
}: DisconnectControlProperties): JSX.Element | null => {
    const handleDisconnectClick = useCallback((): void => {
        onDisconnect();
    }, [onDisconnect]);

    if (connected) {
        return (
            <ThemedButton
                disabled={isDisconnecting}
                onClick={handleDisconnectClick}
                size="sm"
                variant="error"
            >
                {isDisconnecting ? "Disconnecting…" : "Disconnect"}
            </ThemedButton>
        );
    }

    if (configured) {
        return (
            <ThemedButton
                disabled={isDisconnecting}
                onClick={handleDisconnectClick}
                size="sm"
                variant="secondary"
            >
                {isDisconnecting ? "Clearing…" : "Clear configuration"}
            </ThemedButton>
        );
    }

    return null;
};

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
    readonly lockedKey: CloudProviderTabKey | null;
    readonly onAttemptLockedSelect: (key: CloudProviderTabKey) => void;
    readonly onSelect: (key: CloudProviderTabKey) => void;
    readonly selectedKey: CloudProviderTabKey;
}

function resolveProviderTabStateClass(args: {
    isAvailable: boolean;
    isLocked: boolean;
}): string {
    if (!args.isAvailable) {
        return "opacity-70";
    }

    return args.isLocked
        ? "opacity-70 cursor-not-allowed"
        : "hover:opacity-95";
}

function resolveProviderTabTitle(args: {
    isAvailable: boolean;
    isLocked: boolean;
}): string | undefined {
    if (!args.isAvailable) {
        return "Coming soon";
    }

    if (args.isLocked) {
        return "Disconnect the current provider before switching";
    }

    return undefined;
}

const ProviderTabList = ({
    ariaLabel,
    lockedKey,
    onAttemptLockedSelect,
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

            if (lockedKey && match.key !== lockedKey) {
                onAttemptLockedSelect(match.key);
                queueMicrotask(() => {
                    buttonByKeyRef.current.get(lockedKey)?.focus();
                });
                return;
            }

            onSelect(match.key);
        },
        [lockedKey, onAttemptLockedSelect, onSelect]
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

            if (lockedKey && nextKey !== lockedKey) {
                event.preventDefault();
                onAttemptLockedSelect(nextKey);
                return;
            }

            event.preventDefault();
            onSelect(nextKey);

            // Ensure focus follows selection for roving-tabindex behavior.
            queueMicrotask(() => {
                buttonByKeyRef.current.get(nextKey)?.focus();
            });
        },
        [lockedKey, onAttemptLockedSelect, onSelect, selectedKey]
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
                const isLocked = lockedKey !== null && tab.key !== lockedKey;

                const variantClass = isSelected
                    ? "themed-button--primary"
                    : "themed-button--secondary";

                const stateClass = resolveProviderTabStateClass({
                    isAvailable: tab.isAvailable,
                    isLocked,
                });

                const title = resolveProviderTabTitle({
                    isAvailable: tab.isAvailable,
                    isLocked,
                });

                return (
                    <button
                        aria-controls={`cloud-provider-panel-${tab.key}`}
                        aria-disabled={isLocked || !tab.isAvailable}
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
                        title={title}
                        type="button"
                    >
                        <tab.icon aria-hidden="true" size={16} />
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
    readonly onAttemptLockedAction: () => void;
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
    readonly onAttemptLockedAction: () => void;
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

    const handleConnectClick = args.providerSetupLocked
        ? args.onAttemptLockedAction
        : args.onConnect;

    const isSoftDisabled = args.providerSetupLocked;
    const ariaDisabled = isSoftDisabled || args.isConnecting;

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

            {args.connected ? (
                <ThemedText className="mt-2" size="xs" variant="tertiary">
                    Connected. To switch accounts or providers, disconnect
                    above and connect again.
                </ThemedText>
            ) : null}

            {args.connected ? null : (
                <div className="mt-3 flex flex-wrap gap-2">
                    <ThemedButton
                        aria-disabled={ariaDisabled}
                        className={isSoftDisabled ? "themed-button--loading" : ""}
                        disabled={args.isConnecting}
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
    readonly onAttemptLockedAction: () => void;
    onConfigureFilesystemProviderClick: () => void;
    onFilesystemBaseDirectoryChange: (
        event: ChangeEvent<HTMLInputElement>
    ) => void;
    providerSetupLocked: boolean;
}): JSX.Element {
    const handleFilesystemBaseDirectoryChange =
        args.onFilesystemBaseDirectoryChange;
    const handleConfigureFilesystemProviderClick =
        args.providerSetupLocked
            ? args.onAttemptLockedAction
            : args.onConfigureFilesystemProviderClick;

    const isSoftDisabled = args.providerSetupLocked;
    const ariaDisabled =
        isSoftDisabled ||
        args.isConfiguringFilesystemProvider ||
        args.filesystemBaseDirectory.trim().length === 0;

    return (
        <div
            aria-labelledby="cloud-provider-tab-filesystem"
            className="mt-3"
            id="cloud-provider-panel-filesystem"
            role="tabpanel"
        >
            {args.blockedCallout}

            <ThemedText className="mt-1" size="xs" variant="secondary">
                Configure a local folder. If you already use Dropbox/Google
                Drive/iCloud/SyncThing, point this at a folder inside your sync
                directory and let your existing sync client do the rest.
            </ThemedText>

            {args.filesystemConfiguredBaseDirectory ? (
                <ThemedText className="mt-2" size="xs" variant="tertiary">
                    Current folder: {args.filesystemConfiguredBaseDirectory}
                </ThemedText>
            ) : null}

            {args.connected ? (
                <ThemedText className="mt-2" size="xs" variant="tertiary">
                    To use a different folder, clear configuration above and
                    set it again.
                </ThemedText>
            ) : null}

            {args.connected ? null : (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex-1">
                        <ThemedInput
                            aria-label="Local folder base directory"
                            disabled={args.providerSetupLocked}
                            onChange={handleFilesystemBaseDirectoryChange}
                            placeholder="Path to folder (e.g. C:\\Users\\You\\Dropbox\\UptimeWatcher)"
                            value={args.filesystemBaseDirectory}
                        />
                    </div>
                    <ThemedButton
                        aria-disabled={ariaDisabled}
                        className={isSoftDisabled ? "themed-button--loading" : ""}
                        disabled={
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
    onAttemptLockedAction,
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
                    "Opens your default browser to authorize Dropbox access (OAuth + PKCE). Uptime Watcher stores an encrypted token on this device (no password is stored).",
                isConnecting: isConnectingDropbox,
                onAttemptLockedAction,
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
                onAttemptLockedAction,
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
                    "Opens your default browser to authorize Google Drive access (OAuth + PKCE). Data is stored in Drive’s app data area (appDataFolder), so it won’t appear in your normal Drive folders.",
                isConnecting: isConnectingGoogleDrive,
                onAttemptLockedAction,
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

    const lockedProviderTab = configured ? activeProviderTab : null;

    const [lockedProviderAttemptTab, setLockedProviderAttemptTab] =
        useState<CloudProviderTabKey | null>(null);

    const selectedProviderTab: CloudProviderTabKey =
        lockedProviderTab ?? userSelectedProviderTab ?? "dropbox";

    const handleAttemptLockedProviderSelect = useCallback(
        (targetKey: CloudProviderTabKey): void => {
            if (!lockedProviderTab) {
                return;
            }

            setLockedProviderAttemptTab(targetKey);
        },
        [lockedProviderTab]
    );

    const [filesystemBaseDirectory, setFilesystemBaseDirectory] = useState("");

    const filesystemConfiguredBaseDirectory =
        resolveFilesystemConfiguredBaseDirectory(status);

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
        setLockedProviderAttemptTab(null);
        setUserSelectedProviderTab(key);
    }, []);

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

    const providerStatusControl = useMemo(
        (): JSX.Element => (
            <CloudProviderStatusControl
                providerLabel={providerLabel}
                status={connectionSiteStatus}
            />
        ),
        [connectionSiteStatus, providerLabel]
    );

    const onDismiss = useCallback((): void => {
        setLockedProviderAttemptTab(null);
    }, []);

    const onAttemptLockedAction = useCallback((): void => {}, []);
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
                    lockedKey={lockedProviderTab}
                    onAttemptLockedSelect={handleAttemptLockedProviderSelect}
                    onSelect={handleProviderTabSelect}
                    selectedKey={selectedProviderTab}
                />

                <ProviderLockNotice
                    attemptMessage={lockedProviderAttemptMessage}
                    infoMessage={lockedProviderInfoMessage}
                    onDismissAttempt={onDismiss}
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
                    onAttemptLockedAction={onAttemptLockedAction}
                    onConfigureFilesystemProviderClick={
                        handleConfigureFilesystemProviderClick
                    }
                    onConnectDropbox={onConnectDropbox}
                    onConnectGoogleDrive={onConnectGoogleDrive}
                    onFilesystemBaseDirectoryChange={
                        handleFilesystemDirectoryChange
                    }
                    providerSetupLocked={false}
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

                    <DisconnectControl
                        configured={configured}
                        connected={connected}
                        isDisconnecting={isDisconnecting}
                        onDisconnect={onDisconnect}
                    />
                </div>
            </div>
        </div>
    );
};

/* eslint-enable react/no-multi-comp -- Provider setup UI relies on local components above. */
