// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair -- Context: Storybook mock for Electron API
/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-unnecessary-type-parameters, @typescript-eslint/no-unnecessary-condition, sonarjs/pseudo-random -- Disable Strict Rules */
import type {
    MonitoringStartSummary,
    MonitoringStopSummary,
    Site,
    StatusUpdate,
} from "@shared/types";
import type {
    CloudBackupEntry,
    CloudFilesystemProviderConfig,
    CloudStatusSummary,
} from "@shared/types/cloud";
import type {
    CloudBackupMigrationRequest,
    CloudBackupMigrationResult,
} from "@shared/types/cloudBackupMigration";
import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { StateSyncEventData } from "@shared/types/events";
import type {
    SerializedDatabaseBackupResult,
    SerializedDatabaseRestoreResult,
} from "@shared/types/ipc";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type { StateSyncDomainBridge } from "@shared/types/preload";
import type {
    StateSyncFullSyncResult,
    StateSyncStatusSummary,
} from "@shared/types/stateSync";
import type { ValidationResult } from "@shared/types/validation";

import type { ElectronAPI } from "../types/electron-api";

interface ElectronMockState {
    cloudBackups: CloudBackupEntry[];
    cloudFilesystemBaseDirectory: null | string;
    historyLimit: number;
    monitorTypes: MonitorTypeConfig[];
    sites: Site[];
}

const DEFAULT_HISTORY_LIMIT = 30;

const clone = <Value>(value: Value): Value => {
    if (typeof globalThis.structuredClone === "function") {
        return globalThis.structuredClone(value);
    }

    return value;
};

const mockState: ElectronMockState = {
    cloudBackups: [],
    cloudFilesystemBaseDirectory: null,
    historyLimit: DEFAULT_HISTORY_LIMIT,
    monitorTypes: [],
    sites: [],
};

const getCloudStatus = (): CloudStatusSummary => {
    const baseDirectory = mockState.cloudFilesystemBaseDirectory;
    const connected =
        typeof baseDirectory === "string" && baseDirectory.length > 0;

    if (!connected) {
        return {
            backupsEnabled: false,
            configured: false,
            connected: false,
            encryptionLocked: false,
            encryptionMode: "none",
            lastBackupAt: null,
            lastSyncAt: null,
            provider: null,
            syncEnabled: false,
        };
    }

    return {
        backupsEnabled: true,
        configured: true,
        connected: true,
        encryptionLocked: false,
        encryptionMode: "none",
        lastBackupAt: mockState.cloudBackups[0]?.metadata.createdAt ?? null,
        lastSyncAt: null,
        provider: "filesystem",
        providerDetails: {
            baseDirectory,
            kind: "filesystem",
        },
        syncEnabled: false,
    };
};

const noop = (): void => {
    // Intentional noop
};

const noopCleanup = (): (() => void) => noop;

const registerListener = <Value>(
    listener: (value: Value) => void
): (() => void) => {
    const listenerReference: (value: Value) => void = listener;

    if (typeof listenerReference !== "function") {
        return noopCleanup();
    }

    return noopCleanup();
};

const normalizeLimit = (limit: number): number => {
    if (!Number.isFinite(limit)) {
        return mockState.historyLimit;
    }

    return Math.max(0, Math.round(limit));
};

const findSiteIndex = (identifier: string): number =>
    mockState.sites.findIndex((site) => site.identifier === identifier);

const ensureSite = (identifier: string): Site => {
    const index = findSiteIndex(identifier);
    if (index < 0) {
        throw new Error(
            `Storybook electron mock: site '${identifier}' was not found.`
        );
    }

    const site = mockState.sites[index];
    if (!site) {
        throw new Error(
            `Storybook electron mock: site '${identifier}' was removed unexpectedly.`
        );
    }

    return site;
};

const applySiteMutation = (
    identifier: string,
    mutator: (site: Site) => Site
): Site => {
    const current = clone(ensureSite(identifier));
    const next = mutator(current);
    const index = findSiteIndex(identifier);

    mockState.sites[index] = clone(next);
    return clone(next);
};

const stateSyncBase: StateSyncDomainBridge = {
    getSyncStatus: async (): Promise<StateSyncStatusSummary> => ({
        lastSyncAt: Date.now(),
        siteCount: mockState.sites.length,
        source: "frontend",
        synchronized: true,
    }),
    requestFullSync: async (): Promise<StateSyncFullSyncResult> => {
        const sites = clone(mockState.sites);
        return {
            completedAt: Date.now(),
            siteCount: sites.length,
            sites,
            source: "frontend",
            synchronized: true,
        };
    },
};

const electronAPIMockDefinition = {
    cloud: {
        clearEncryptionKey: async (): Promise<CloudStatusSummary> =>
            getCloudStatus(),
        configureFilesystemProvider: async (
            config: CloudFilesystemProviderConfig
        ): Promise<CloudStatusSummary> => {
            mockState.cloudFilesystemBaseDirectory = config.baseDirectory;
            return getCloudStatus();
        },
        connectDropbox: async (): Promise<CloudStatusSummary> =>
            getCloudStatus(),

        connectGoogleDrive: async (): Promise<CloudStatusSummary> =>
            getCloudStatus(),

        deleteBackup: async (key: string): Promise<CloudBackupEntry[]> => {
            mockState.cloudBackups = mockState.cloudBackups.filter(
                (entry) => entry.key !== key
            );
            return clone(mockState.cloudBackups);
        },
        disconnect: async (): Promise<CloudStatusSummary> => {
            mockState.cloudFilesystemBaseDirectory = null;
            return getCloudStatus();
        },
        enableSync: async (): Promise<CloudStatusSummary> => getCloudStatus(),
        getStatus: async (): Promise<CloudStatusSummary> => getCloudStatus(),
        listBackups: async (): Promise<CloudBackupEntry[]> =>
            clone(mockState.cloudBackups),
        migrateBackups: async (
            config: CloudBackupMigrationRequest
        ): Promise<CloudBackupMigrationResult> => {
            const startedAt = Date.now();
            const targetEncrypted = config.target === "encrypted";

            const failures: CloudBackupMigrationResult["failures"] = [];
            let migrated = 0;
            let skipped = 0;
            let processedCount = 0;

            const nextBackups: CloudBackupEntry[] = [];
            for (const entry of mockState.cloudBackups) {
                processedCount += 1;
                if (entry.encrypted === targetEncrypted) {
                    skipped += 1;
                    nextBackups.push(entry);
                } else {
                    const nextFileName = targetEncrypted
                        ? `${entry.fileName}.enc`
                        : entry.fileName.replace(/\.enc$/v, "");
                    const nextKey = targetEncrypted
                        ? `${entry.key}.enc`
                        : entry.key.replace(/\.enc$/v, "");

                    const migratedEntry: CloudBackupEntry = {
                        ...entry,
                        encrypted: targetEncrypted,
                        fileName: nextFileName,
                        key: nextKey,
                    };

                    migrated += 1;
                    nextBackups.push(migratedEntry);

                    if (!config.deleteSource) {
                        nextBackups.push(entry);
                    }
                }
            }

            mockState.cloudBackups = nextBackups;

            return {
                completedAt: Date.now(),
                deleteSource: config.deleteSource,
                failures,
                migrated,
                processed: processedCount,
                skipped,
                startedAt,
                target: config.target,
            };
        },
        previewResetRemoteSyncState:
            async (): Promise<CloudSyncResetPreview> => ({
                deviceIds: [],
                fetchedAt: Date.now(),
                operationDeviceIds: [],
                operationObjectCount: 0,
                otherObjectCount: 0,
                perDevice: [],
                snapshotObjectCount: 0,
                syncObjectCount: 0,
            }),
        requestSyncNow: async (): Promise<void> => {
            // noop
        },
        resetRemoteSyncState: async (): Promise<CloudSyncResetResult> => {
            const startedAt = Date.now();
            return {
                completedAt: Date.now(),
                deletedObjects: 0,
                failedDeletions: [],
                resetAt: Date.now(),
                startedAt,
            };
        },
        restoreBackup: async (
            key: string
        ): Promise<SerializedDatabaseRestoreResult> => {
            const entry = mockState.cloudBackups.find(
                (candidate) => candidate.key === key
            );

            const createdAt = entry?.metadata.createdAt ?? Date.now();

            return {
                metadata: {
                    appVersion: "storybook-mock",
                    checksum: `mock-restore-checksum-${createdAt}`,
                    createdAt,
                    originalPath: "C:/mock/uptime-watcher.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 0,
                },
                preRestoreFileName: "uptime-watcher.sqlite",
                restoredAt: Date.now(),
            };
        },
        setEncryptionPassphrase: async (
            // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Storybook mock only; never log or persist passphrases.
            _passphrase: string
        ): Promise<CloudStatusSummary> => getCloudStatus(),
        uploadLatestBackup: async (): Promise<CloudBackupEntry> => {
            const createdAt = Date.now();
            const entry: CloudBackupEntry = {
                encrypted: false,
                fileName: `uptime-watcher-backup-${createdAt}.sqlite`,
                key: `backups/${createdAt}.sqlite`,
                metadata: {
                    appVersion: "storybook-mock",
                    checksum: `mock-checksum-${createdAt}`,
                    createdAt,
                    originalPath: "C:/mock/uptime-watcher.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 0,
                },
            };

            mockState.cloudBackups = [entry, ...mockState.cloudBackups];
            return clone(entry);
        },
    },
    data: {
        downloadSqliteBackup:
            async (): Promise<SerializedDatabaseBackupResult> => ({
                buffer: new ArrayBuffer(0),
                fileName: "uptime-watcher-backup.sqlite",
                metadata: {
                    appVersion: "storybook-mock",
                    checksum: "mock-checksum",
                    createdAt: Date.now(),
                    originalPath: "C:/mock/uptime-watcher.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 0,
                },
            }),
        exportData: async (): Promise<string> =>
            JSON.stringify({
                historyLimit: mockState.historyLimit,
                monitorTypes: mockState.monitorTypes,
                sites: mockState.sites,
            }),
        importData: async (payload: string): Promise<boolean> => {
            try {
                const parsed = JSON.parse(payload) as Partial<{
                    historyLimit: number;
                    monitorTypes: MonitorTypeConfig[];
                    sites: Site[];
                }>;

                if (Array.isArray(parsed.sites)) {
                    mockState.sites = clone(parsed.sites);
                }

                if (Array.isArray(parsed.monitorTypes)) {
                    mockState.monitorTypes = clone(parsed.monitorTypes);
                }

                if (typeof parsed.historyLimit === "number") {
                    mockState.historyLimit = normalizeLimit(
                        parsed.historyLimit
                    );
                }

                return true;
            } catch {
                return false;
            }
        },
        restoreSqliteBackup:
            async (): Promise<SerializedDatabaseRestoreResult> => ({
                metadata: {
                    appVersion: "storybook-mock",
                    checksum: "mock-restore-checksum",
                    createdAt: Date.now(),
                    originalPath: "mock-upload.sqlite",
                    retentionHintDays: 30,
                    schemaVersion: 1,
                    sizeBytes: 0,
                },
                preRestoreFileName:
                    "uptime-watcher-pre-restore-storybook.sqlite",
                restoredAt: Date.now(),
            }),
    },
    events: {
        onCacheInvalidated: registerListener,
        onHistoryLimitUpdated: registerListener,
        onMonitorCheckCompleted: registerListener,
        onMonitorDown: registerListener,
        onMonitoringStarted: registerListener,
        onMonitoringStopped: registerListener,
        onMonitorStatusChanged: registerListener,
        onMonitorUp: registerListener,
        onSiteAdded: registerListener,
        onSiteRemoved: registerListener,
        onSiteUpdated: registerListener,
        onStateSyncEvent: registerListener,
        onTestEvent: registerListener,
        onUpdateStatus: registerListener,
        removeAllListeners: noop,
    },
    monitoring: {
        checkSiteNow: async (
            siteIdentifier: string,
            monitorId: string
        ): Promise<StatusUpdate | undefined> => {
            const site = ensureSite(siteIdentifier);
            const monitor = site.monitors.find(
                (candidate) => candidate.id === monitorId
            );

            if (!monitor) {
                return undefined;
            }

            const previousStatus = monitor.status;
            const timestamp = new Date().toISOString();

            const updatedSite = applySiteMutation(siteIdentifier, (
                current
            ) => ({
                ...current,
                monitors: current.monitors.map((candidate) =>
                    candidate.id === monitorId
                        ? {
                              ...candidate,
                              lastChecked: new Date(),
                              responseTime: Math.max(
                                  10,
                                  Math.round(Math.random() * 250)
                              ),
                              status: "up",
                          }
                        : candidate),
            }));

            const resultingMonitor = updatedSite.monitors.find(
                (candidate) => candidate.id === monitorId
            );
            const monitorSnapshot = clone(resultingMonitor ?? monitor);

            return {
                details: `Manual check completed for monitor '${monitorId}'.`,
                monitor: monitorSnapshot,
                monitorId,
                previousStatus,
                site: clone(updatedSite),
                siteIdentifier,
                status: monitorSnapshot.status,
                timestamp,
            };
        },
        removeMonitor: async (
            siteIdentifier: string,
            monitorId: string
        ): Promise<boolean> => {
            applySiteMutation(siteIdentifier, (site) => ({
                ...site,
                monitors: site.monitors.filter(
                    (monitor) => monitor.id !== monitorId
                ),
            }));
            return true;
        },
        startMonitoring: async (): Promise<MonitoringStartSummary> => {
            const siteCount = mockState.sites.length;
            let attempted = 0;

            for (const site of mockState.sites) {
                attempted += site.monitors.length;
            }
            const alreadyActive =
                siteCount > 0 &&
                mockState.sites.every(
                    (site) =>
                        site.monitoring &&
                        site.monitors.every((monitor) => monitor.monitoring)
                );

            mockState.sites = mockState.sites.map((site) => ({
                ...site,
                monitoring: true,
                monitors: site.monitors.map((monitor) => ({
                    ...monitor,
                    monitoring: true,
                })),
            }));

            const succeeded = attempted;

            return {
                alreadyActive,
                attempted,
                failed: 0,
                isMonitoring: alreadyActive || succeeded > 0,
                partialFailures: false,
                siteCount,
                skipped: 0,
                succeeded,
            };
        },
        startMonitoringForMonitor: async (
            siteIdentifier: string,
            monitorId: string
        ): Promise<boolean> => {
            applySiteMutation(siteIdentifier, (site) => ({
                ...site,
                monitors: site.monitors.map((monitor) =>
                    monitor.id === monitorId
                        ? {
                              ...monitor,
                              monitoring: true,
                          }
                        : monitor),
            }));
            return true;
        },
        startMonitoringForSite: async (
            siteIdentifier: string
        ): Promise<boolean> => {
            applySiteMutation(siteIdentifier, (site) => ({
                ...site,
                monitoring: true,
                monitors: site.monitors.map((monitor) => ({
                    ...monitor,
                    monitoring: true,
                })),
            }));
            return true;
        },
        stopMonitoring: async (): Promise<MonitoringStopSummary> => {
            const siteCount = mockState.sites.length;
            let attempted = 0;

            for (const site of mockState.sites) {
                for (const monitor of site.monitors) {
                    if (monitor.monitoring) {
                        attempted += 1;
                    }
                }
            }

            mockState.sites = mockState.sites.map((site) => ({
                ...site,
                monitoring: false,
                monitors: site.monitors.map((monitor) => ({
                    ...monitor,
                    monitoring: false,
                })),
            }));

            return {
                alreadyInactive: attempted === 0,
                attempted,
                failed: 0,
                isMonitoring: false,
                partialFailures: false,
                siteCount,
                skipped: 0,
                succeeded: attempted,
            };
        },
        stopMonitoringForMonitor: async (
            siteIdentifier: string,
            monitorId: string
        ): Promise<boolean> => {
            applySiteMutation(siteIdentifier, (site) => ({
                ...site,
                monitors: site.monitors.map((monitor) =>
                    monitor.id === monitorId
                        ? {
                              ...monitor,
                              monitoring: false,
                          }
                        : monitor),
            }));
            return true;
        },
        stopMonitoringForSite: async (
            siteIdentifier: string
        ): Promise<boolean> => {
            applySiteMutation(siteIdentifier, (site) => ({
                ...site,
                monitoring: false,
                monitors: site.monitors.map((monitor) => ({
                    ...monitor,
                    monitoring: false,
                })),
            }));
            return true;
        },
    },
    monitorTypes: {
        formatMonitorDetail: async (
            monitorType: string,
            details: string
        ): Promise<string> => `${monitorType}: ${details}`,
        formatMonitorTitleSuffix: async (
            monitorType: string,
            monitor: Site["monitors"][number]
        ): Promise<string> => `${monitor.id} · ${monitorType}`,
        getMonitorTypes: async (): Promise<MonitorTypeConfig[]> =>
            clone(mockState.monitorTypes),
        validateMonitorData: async (
            monitorType: string,
            monitorData: unknown
        ): Promise<ValidationResult> => ({
            data: monitorData ?? {},
            errors: [],
            metadata: { monitorType },
            success: true,
            warnings: [],
        }),
    },
    notifications: {
        notifyAppEvent: async (): Promise<void> => {
            /* Storybook mock: no-op */
        },
        updatePreferences: async (): Promise<void> => {
            /* Storybook mock: no-op */
        },
    },
    settings: {
        getHistoryLimit: async (): Promise<number> => mockState.historyLimit,
        resetSettings: async (): Promise<void> => {
            mockState.historyLimit = DEFAULT_HISTORY_LIMIT;
        },
        updateHistoryLimit: async (limit: number): Promise<number> => {
            mockState.historyLimit = normalizeLimit(limit);
            return mockState.historyLimit;
        },
    },
    sites: {
        addSite: async (site: Site): Promise<Site> => {
            mockState.sites = [...mockState.sites, clone(site)];
            return clone(site);
        },
        deleteAllSites: async (): Promise<number> =>
            mockState.sites.splice(0).length,
        getSites: async (): Promise<Site[]> => clone(mockState.sites),
        removeMonitor: async (
            siteIdentifier: string,
            monitorId: string
        ): Promise<Site> =>
            applySiteMutation(siteIdentifier, (site) => {
                const nextMonitors = site.monitors.filter(
                    (monitor) => monitor.id !== monitorId
                );

                if (nextMonitors.length === site.monitors.length) {
                    throw new Error(
                        `Storybook electron mock: monitor '${monitorId}' not found on site '${siteIdentifier}'.`
                    );
                }

                return {
                    ...site,
                    monitors: nextMonitors,
                } satisfies Site;
            }),
        removeSite: async (identifier: string): Promise<boolean> => {
            const index = findSiteIndex(identifier);
            if (index < 0) {
                throw new Error(
                    `Storybook electron mock: cannot remove site '${identifier}'.`
                );
            }

            const [removed] = mockState.sites.splice(index, 1);
            if (!removed) {
                throw new Error(
                    `Storybook electron mock: failed to remove site '${identifier}'.`
                );
            }

            return true;
        },
        updateSite: async (
            identifier: string,
            updates: Partial<Site>
        ): Promise<Site> =>
            applySiteMutation(identifier, (site) => ({
                ...site,
                ...updates,
                monitors: updates.monitors
                    ? clone(updates.monitors)
                    : site.monitors,
            })),
    },
    stateSync: stateSyncBase as ElectronAPI["stateSync"],
    system: {
        openExternal: async (url: string): Promise<boolean> =>
            typeof url === "string" && url.length > 0,
        quitAndInstall: async (): Promise<boolean> => true,
    },
} as ElectronAPI;

const electronAPIMock: ElectronAPI = electronAPIMockDefinition;
Reflect.set(
    electronAPIMock.stateSync as Record<string, unknown>,
    "onStateSyncEvent",
    registerListener<StateSyncEventData>
);

export { electronAPIMock };

export const electronMockState: ElectronMockState = mockState;

export const setMockSites = (sites: Site[]): void => {
    mockState.sites = clone(sites);
};

export const setMockMonitorTypes = (
    monitorTypes: MonitorTypeConfig[]
): void => {
    mockState.monitorTypes = clone(monitorTypes);
};

export const setMockHistoryLimit = (historyLimit: number): void => {
    mockState.historyLimit = normalizeLimit(historyLimit);
};

export const installElectronAPIMock = (): ElectronAPI => {
    if (typeof window !== "undefined" && !window.electronAPI) {
        window.electronAPI = electronAPIMock;
    }
    return electronAPIMock;
};

installElectronAPIMock();
