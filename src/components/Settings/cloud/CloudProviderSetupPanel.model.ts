import type { IconType } from "react-icons";

import { AppIcons } from "../../../utils/icons";

/**
 * Status used for the provider connection indicator in
 * {@link src/components/Settings/cloud/CloudProviderSetupPanel#CloudProviderSetupPanel}.
 */
export type CloudProviderSetupPanelConnectionSiteStatus =
    | "down"
    | "pending"
    | "up";

/**
 * Supported tabs inside
 * {@link src/components/Settings/cloud/CloudProviderSetupPanel#CloudProviderSetupPanel}.
 */
export type CloudProviderSetupPanelTabKey =
    | "dropbox"
    | "filesystem"
    | "google-drive"
    | "webdav";

/**
 * Tab descriptor used to render the provider tab strip.
 */
export interface CloudProviderSetupPanelTabDefinition {
    readonly description: string;
    readonly icon: IconType;
    readonly isAvailable: boolean;
    readonly key: CloudProviderSetupPanelTabKey;
    readonly label: string;
}

/**
 * Tab definitions for
 * {@link src/components/Settings/cloud/CloudProviderSetupPanel#CloudProviderSetupPanel}.
 */
export const CLOUD_PROVIDER_SETUP_PANEL_TABS: readonly CloudProviderSetupPanelTabDefinition[] =
    [
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
