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
 */
type BridgeResult<TChannel extends IpcInvokeChannel> =
    IpcInvokeChannelResult<TChannel> extends undefined
        ? Promise<void>
        : Promise<IpcInvokeChannelResult<TChannel>>;

/**
 * Function signature for invoking a typed IPC channel.
 */
export type IpcBridgeMethod<TChannel extends IpcInvokeChannel> =
    IpcInvokeChannelParams<TChannel> extends []
        ? () => BridgeResult<TChannel>
        : (...args: IpcInvokeChannelParams<TChannel>) => BridgeResult<TChannel>;

/**
 * Creates a typed preload bridge from a domain/channel mapping.
 */
export type DomainBridge<
    TMapping extends {
        readonly [Key in keyof TMapping]: IpcInvokeChannel;
    },
> = {
    readonly [Key in keyof TMapping]: IpcBridgeMethod<TMapping[Key]>;
};

interface DataChannelMap {
    readonly downloadSqliteBackup: "download-sqlite-backup";
    readonly exportData: "export-data";
    readonly importData: "import-data";
    readonly resetSettings: "reset-settings";
}

const DATA_CHANNELS_DEFINITION: DataChannelMap = {
    downloadSqliteBackup: "download-sqlite-backup",
    exportData: "export-data",
    importData: "import-data",
    resetSettings: "reset-settings",
};

export const DATA_CHANNELS: DataChannelMap = DATA_CHANNELS_DEFINITION;

export type DataDomainBridge = DomainBridge<typeof DATA_CHANNELS>;

interface MonitoringChannelMap {
    readonly checkSiteNow: "check-site-now";
    readonly formatMonitorDetail: "format-monitor-detail";
    readonly formatMonitorTitleSuffix: "format-monitor-title-suffix";
    readonly removeMonitor: "remove-monitor";
    readonly startMonitoring: "start-monitoring";
    readonly startMonitoringForSite: "start-monitoring-for-site";
    readonly stopMonitoring: "stop-monitoring";
    readonly stopMonitoringForSite: "stop-monitoring-for-site";
    readonly validateMonitorData: "validate-monitor-data";
}

const MONITORING_CHANNELS_DEFINITION: MonitoringChannelMap = {
    checkSiteNow: "check-site-now",
    formatMonitorDetail: "format-monitor-detail",
    formatMonitorTitleSuffix: "format-monitor-title-suffix",
    removeMonitor: "remove-monitor",
    startMonitoring: "start-monitoring",
    startMonitoringForSite: "start-monitoring-for-site",
    stopMonitoring: "stop-monitoring",
    stopMonitoringForSite: "stop-monitoring-for-site",
    validateMonitorData: "validate-monitor-data",
};

export const MONITORING_CHANNELS: MonitoringChannelMap =
    MONITORING_CHANNELS_DEFINITION;

export type MonitoringDomainBridge = DomainBridge<typeof MONITORING_CHANNELS>;

interface MonitorTypesChannelMap {
    readonly getMonitorTypes: "get-monitor-types";
}

const MONITOR_TYPES_CHANNELS_DEFINITION: MonitorTypesChannelMap = {
    getMonitorTypes: "get-monitor-types",
};

export const MONITOR_TYPES_CHANNELS: MonitorTypesChannelMap =
    MONITOR_TYPES_CHANNELS_DEFINITION;

export type MonitorTypesDomainBridge = DomainBridge<
    typeof MONITOR_TYPES_CHANNELS
>;

interface SettingsChannelMap {
    readonly getHistoryLimit: "get-history-limit";
    readonly updateHistoryLimit: "update-history-limit";
}

const SETTINGS_CHANNELS_DEFINITION: SettingsChannelMap = {
    getHistoryLimit: "get-history-limit",
    updateHistoryLimit: "update-history-limit",
};

export const SETTINGS_CHANNELS: SettingsChannelMap =
    SETTINGS_CHANNELS_DEFINITION;

export type SettingsDomainBridge = DomainBridge<typeof SETTINGS_CHANNELS>;

interface SitesChannelMap {
    readonly addSite: "add-site";
    readonly deleteAllSites: "delete-all-sites";
    readonly getSites: "get-sites";
    readonly removeSite: "remove-site";
    readonly updateSite: "update-site";
}

const SITES_CHANNELS_DEFINITION: SitesChannelMap = {
    addSite: "add-site",
    deleteAllSites: "delete-all-sites",
    getSites: "get-sites",
    removeSite: "remove-site",
    updateSite: "update-site",
};

export const SITES_CHANNELS: SitesChannelMap = SITES_CHANNELS_DEFINITION;

export type SitesDomainBridge = DomainBridge<typeof SITES_CHANNELS>;

interface StateSyncChannelMap {
    readonly getSyncStatus: "get-sync-status";
    readonly requestFullSync: "request-full-sync";
}

const STATE_SYNC_CHANNELS_DEFINITION: StateSyncChannelMap = {
    getSyncStatus: "get-sync-status",
    requestFullSync: "request-full-sync",
};

export const STATE_SYNC_CHANNELS: StateSyncChannelMap =
    STATE_SYNC_CHANNELS_DEFINITION;

export type StateSyncDomainBridge = DomainBridge<typeof STATE_SYNC_CHANNELS>;

export type StateSyncApiSurface = StateSyncDomainBridge & {
    readonly onStateSyncEvent: (
        callback: (data: StateSyncEventData) => void
    ) => () => void;
};

interface SystemChannelMap {
    readonly openExternal: "open-external";
}

const SYSTEM_CHANNELS_DEFINITION: SystemChannelMap = {
    openExternal: "open-external",
};

export const SYSTEM_CHANNELS: SystemChannelMap = SYSTEM_CHANNELS_DEFINITION;

export type SystemDomainBridge = DomainBridge<typeof SYSTEM_CHANNELS>;

/**
 * Shared shape of the Electron bridge API exposed to the renderer.
 */
export interface ElectronBridgeApi<
    TEventsApi,
    TSystemApi extends SystemDomainBridge,
> {
    readonly data: DataDomainBridge;
    readonly events: TEventsApi;
    readonly monitoring: MonitoringDomainBridge;
    readonly monitorTypes: MonitorTypesDomainBridge;
    readonly settings: SettingsDomainBridge;
    readonly sites: SitesDomainBridge;
    readonly stateSync: StateSyncApiSurface;
    readonly system: TSystemApi;
}
