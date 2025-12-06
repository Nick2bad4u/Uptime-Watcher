/**
 * Shared type utilities for Electron preload domain APIs.
 *
 * @remarks
 * Provides strongly typed mappings between IPC invoke channels and the
 * renderer-facing preload bridge. This module is consumed by both the Electron
 * preload layer and the renderer global type declarations to guarantee
 * end-to-end alignment with ADR-005.
 */

import type { StateSyncEventData } from "./events";
import type {
    IpcInvokeChannel,
    IpcInvokeChannelParams,
    IpcInvokeChannelResult,
} from "./ipc";

/**
 * Resolves to the appropriate promise result type for a channel.
 *
 * @internal
 */
type BridgeResult<TChannel extends IpcInvokeChannel> =
    IpcInvokeChannelResult<TChannel> extends undefined
        ? Promise<void>
        : Promise<IpcInvokeChannelResult<TChannel>>;

/**
 * Function signature for invoking a typed IPC channel.
 *
 * @public
 */
export type IpcBridgeMethod<TChannel extends IpcInvokeChannel> =
    IpcInvokeChannelParams<TChannel> extends []
        ? () => BridgeResult<TChannel>
        : (...args: IpcInvokeChannelParams<TChannel>) => BridgeResult<TChannel>;

/**
 * Creates a typed preload bridge from a domain/channel mapping.
 *
 * @public
 */
export type DomainBridge<
    TMapping extends {
        readonly [Key in keyof TMapping]: IpcInvokeChannel;
    },
> = {
    readonly [Key in keyof TMapping]: IpcBridgeMethod<TMapping[Key]>;
};

/**
 * Mapping from data domain bridge methods to IPC channels.
 *
 * @internal
 */
interface DataChannelMap {
    readonly downloadSqliteBackup: "download-sqlite-backup";
    readonly exportData: "export-data";
    readonly importData: "import-data";
    readonly restoreSqliteBackup: "restore-sqlite-backup";
}

const DATA_CHANNELS_DEFINITION: DataChannelMap = {
    downloadSqliteBackup: "download-sqlite-backup",
    exportData: "export-data",
    importData: "import-data",
    restoreSqliteBackup: "restore-sqlite-backup",
};

/**
 * Strongly typed channel mapping for data-domain IPC interactions.
 *
 * @public
 */
export const DATA_CHANNELS: DataChannelMap = DATA_CHANNELS_DEFINITION;

/**
 * Renderer-facing preload bridge for data-domain IPC interactions.
 *
 * @public
 */
export type DataDomainBridge = DomainBridge<typeof DATA_CHANNELS>;

/**
 * Mapping from monitoring domain methods to IPC channels.
 *
 * @internal
 */
interface MonitoringChannelMap {
    readonly checkSiteNow: "check-site-now";
    readonly startMonitoring: "start-monitoring";
    readonly startMonitoringForMonitor: "start-monitoring-for-monitor";
    readonly startMonitoringForSite: "start-monitoring-for-site";
    readonly stopMonitoring: "stop-monitoring";
    readonly stopMonitoringForMonitor: "stop-monitoring-for-monitor";
    readonly stopMonitoringForSite: "stop-monitoring-for-site";
}

const MONITORING_CHANNELS_DEFINITION: MonitoringChannelMap = {
    checkSiteNow: "check-site-now",
    startMonitoring: "start-monitoring",
    startMonitoringForMonitor: "start-monitoring-for-monitor",
    startMonitoringForSite: "start-monitoring-for-site",
    stopMonitoring: "stop-monitoring",
    stopMonitoringForMonitor: "stop-monitoring-for-monitor",
    stopMonitoringForSite: "stop-monitoring-for-site",
};

/**
 * Strongly typed channel mapping for monitoring-domain IPC interactions.
 *
 * @public
 */
export const MONITORING_CHANNELS: MonitoringChannelMap =
    MONITORING_CHANNELS_DEFINITION;

/**
 * Renderer-facing preload bridge for monitoring-domain IPC interactions.
 *
 * @public
 */
export type MonitoringDomainBridge = DomainBridge<typeof MONITORING_CHANNELS>;

/**
 * Mapping from monitor-types domain methods to IPC channels.
 *
 * @internal
 */
interface MonitorTypesChannelMap {
    readonly formatMonitorDetail: "format-monitor-detail";
    readonly formatMonitorTitleSuffix: "format-monitor-title-suffix";
    readonly getMonitorTypes: "get-monitor-types";
    readonly validateMonitorData: "validate-monitor-data";
}

const MONITOR_TYPES_CHANNELS_DEFINITION: MonitorTypesChannelMap = {
    formatMonitorDetail: "format-monitor-detail",
    formatMonitorTitleSuffix: "format-monitor-title-suffix",
    getMonitorTypes: "get-monitor-types",
    validateMonitorData: "validate-monitor-data",
};

/**
 * Strongly typed channel mapping for monitor-type IPC interactions.
 *
 * @public
 */
export const MONITOR_TYPES_CHANNELS: MonitorTypesChannelMap =
    MONITOR_TYPES_CHANNELS_DEFINITION;

/**
 * Renderer-facing preload bridge for monitor-type IPC interactions.
 *
 * @public
 */
export type MonitorTypesDomainBridge = DomainBridge<
    typeof MONITOR_TYPES_CHANNELS
>;

/**
 * Mapping from notification domain methods to IPC channels.
 *
 * @internal
 */
interface NotificationsChannelMap {
    readonly updatePreferences: "update-notification-preferences";
}

const NOTIFICATION_CHANNELS_DEFINITION: NotificationsChannelMap = {
    updatePreferences: "update-notification-preferences",
};

/**
 * Strongly typed channel mapping for notification preference IPC interactions.
 *
 * @public
 */
export const NOTIFICATION_CHANNELS: NotificationsChannelMap =
    NOTIFICATION_CHANNELS_DEFINITION;

/**
 * Renderer-facing preload bridge for notification preference IPC interactions.
 *
 * @public
 */
export type NotificationsDomainBridge = DomainBridge<
    typeof NOTIFICATION_CHANNELS
>;

/**
 * Mapping from settings domain methods to IPC channels.
 *
 * @internal
 */
interface SettingsChannelMap {
    readonly getHistoryLimit: "get-history-limit";
    readonly resetSettings: "reset-settings";
    readonly updateHistoryLimit: "update-history-limit";
}

const SETTINGS_CHANNELS_DEFINITION: SettingsChannelMap = {
    getHistoryLimit: "get-history-limit",
    resetSettings: "reset-settings",
    updateHistoryLimit: "update-history-limit",
};

/**
 * Strongly typed channel mapping for settings-domain IPC interactions.
 *
 * @public
 */
export const SETTINGS_CHANNELS: SettingsChannelMap =
    SETTINGS_CHANNELS_DEFINITION;

/**
 * Renderer-facing preload bridge for settings-domain IPC interactions.
 *
 * @public
 */
export type SettingsDomainBridge = DomainBridge<typeof SETTINGS_CHANNELS>;

/**
 * Mapping from sites domain methods to IPC channels.
 *
 * @internal
 */
interface SitesChannelMap {
    readonly addSite: "add-site";
    readonly deleteAllSites: "delete-all-sites";
    readonly getSites: "get-sites";
    readonly removeMonitor: "remove-monitor";
    readonly removeSite: "remove-site";
    readonly updateSite: "update-site";
}

const SITES_CHANNELS_DEFINITION: SitesChannelMap = {
    addSite: "add-site",
    deleteAllSites: "delete-all-sites",
    getSites: "get-sites",
    removeMonitor: "remove-monitor",
    removeSite: "remove-site",
    updateSite: "update-site",
};

/**
 * Strongly typed channel mapping for sites-domain IPC interactions.
 *
 * @public
 */
export const SITES_CHANNELS: SitesChannelMap = SITES_CHANNELS_DEFINITION;

/**
 * Renderer-facing preload bridge for sites-domain IPC interactions.
 *
 * @public
 */
export type SitesDomainBridge = DomainBridge<typeof SITES_CHANNELS>;

/**
 * Mapping from state-sync domain methods to IPC channels.
 *
 * @internal
 */
interface StateSyncChannelMap {
    readonly getSyncStatus: "get-sync-status";
    readonly requestFullSync: "request-full-sync";
}

const STATE_SYNC_CHANNELS_DEFINITION: StateSyncChannelMap = {
    getSyncStatus: "get-sync-status",
    requestFullSync: "request-full-sync",
};

/**
 * Strongly typed channel mapping for state-sync IPC interactions.
 *
 * @public
 */
export const STATE_SYNC_CHANNELS: StateSyncChannelMap =
    STATE_SYNC_CHANNELS_DEFINITION;

/**
 * Renderer-facing preload bridge for state-sync IPC interactions.
 *
 * @public
 */
export type StateSyncDomainBridge = DomainBridge<typeof STATE_SYNC_CHANNELS>;

/**
 * Combined state-sync API including the event subscription surface.
 *
 * @public
 */
export type StateSyncApiSurface = StateSyncDomainBridge & {
    readonly onStateSyncEvent: (
        callback: (data: StateSyncEventData) => void
    ) => () => void;
};

/**
 * Mapping from system domain methods to IPC channels.
 *
 * @internal
 */
interface SystemChannelMap {
    readonly openExternal: "open-external";
    readonly quitAndInstall: "quit-and-install";
}

const SYSTEM_CHANNELS_DEFINITION: SystemChannelMap = {
    openExternal: "open-external",
    quitAndInstall: "quit-and-install",
};

/**
 * Strongly typed channel mapping for system-domain IPC interactions.
 *
 * @public
 */
export const SYSTEM_CHANNELS: SystemChannelMap = SYSTEM_CHANNELS_DEFINITION;

/**
 * Renderer-facing preload bridge for system-domain IPC interactions.
 *
 * @public
 */
export type SystemDomainBridge = DomainBridge<typeof SYSTEM_CHANNELS>;

/**
 * Shared shape of the Electron bridge API exposed to the renderer.
 *
 * @public
 */
export interface ElectronBridgeApi<
    TEventsApi,
    TSystemApi extends SystemDomainBridge,
> {
    readonly data: DataDomainBridge;
    readonly events: TEventsApi;
    readonly monitoring: MonitoringDomainBridge;
    readonly monitorTypes: MonitorTypesDomainBridge;
    readonly notifications: NotificationsDomainBridge;
    readonly settings: SettingsDomainBridge;
    readonly sites: SitesDomainBridge;
    readonly stateSync: StateSyncApiSurface;
    readonly system: TSystemApi;
}
