import type { CloudStatusSummary } from "@shared/types/cloud";

import {
    CLOUD_PROVIDER_SETUP_PANEL_TABS,
    type CloudProviderSetupPanelConnectionSiteStatus,
    type CloudProviderSetupPanelTabKey,
} from "./CloudProviderSetupPanel.model";

/**
 * Derives the StatusIndicator value from the cloud status summary.
 */
export function resolveConnectionSiteStatus(
    status: CloudStatusSummary | null
): CloudProviderSetupPanelConnectionSiteStatus {
    if (status?.connected) {
        return "up";
    }

    if (status?.configured) {
        return "down";
    }

    return "pending";
}

/**
 * Builds a human friendly label representing the active provider.
 */
export function resolveProviderLabel(status: CloudStatusSummary | null): string {
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

        return accountLabel
            ? `Google Drive (${accountLabel})`
            : "Google Drive";
    }

    if (provider === "webdav") {
        return "WebDAV";
    }

    return "Not configured";
}

/**
 * Resolves the currently configured provider key.
 */
export function resolveActiveProviderTab(
    status: CloudStatusSummary | null
): CloudProviderSetupPanelTabKey | null {
    const provider = status?.provider ?? null;

    if (
        provider === "dropbox" ||
        provider === "filesystem" ||
        provider === "google-drive" ||
        provider === "webdav"
    ) {
        return provider;
    }

    return null;
}

/**
 * Returns the human-facing label for a given tab key.
 */
export function resolveCloudProviderTabLabel(
    tab: CloudProviderSetupPanelTabKey
): string {
    const match = CLOUD_PROVIDER_SETUP_PANEL_TABS.find(
        (entry) => entry.key === tab
    );
    return match ? match.label : tab;
}

/**
 * Message shown when the user tries to switch providers while another provider
 * is already configured.
 */
export function buildDisconnectProviderFirstMessage(args: {
    activeProvider: CloudProviderSetupPanelTabKey;
    targetProvider: CloudProviderSetupPanelTabKey;
}): string {
    const activeLabel = resolveCloudProviderTabLabel(args.activeProvider);
    const targetLabel = resolveCloudProviderTabLabel(args.targetProvider);

    return `Disconnect ${activeLabel} before setting up ${targetLabel}.`;
}

/**
 * Informational message shown while provider switching is locked.
 */
export function buildProviderSwitchLockedMessage(
    activeProvider: CloudProviderSetupPanelTabKey
): string {
    const activeLabel = resolveCloudProviderTabLabel(activeProvider);
    return `Provider switching is locked while ${activeLabel} is configured. Disconnect to switch providers.`;
}

/**
 * Returns the configured base directory when the filesystem provider is the
 * active provider.
 */
export function resolveFilesystemConfiguredBaseDirectory(
    status: CloudStatusSummary | null
): null | string {
    if (status?.providerDetails?.kind === "filesystem") {
        return status.providerDetails.baseDirectory;
    }

    return null;
}
