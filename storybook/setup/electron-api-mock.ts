// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair -- Context: Storybook mock for Electron API
/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-unnecessary-type-parameters, @typescript-eslint/no-unnecessary-condition, sonarjs/pseudo-random -- Disable Strict Rules */
import type { Site, StatusUpdate } from "@shared/types";
import type { StateSyncEventData } from "@shared/types/events";
import type { SerializedDatabaseBackupResult } from "@shared/types/ipc";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type { StateSyncDomainBridge } from "@shared/types/preload";
import type {
    StateSyncFullSyncResult,
    StateSyncStatusSummary,
} from "@shared/types/stateSync";
import type { ValidationResult } from "@shared/types/validation";

import type { ElectronAPI } from "../types/electron-api";

interface ElectronMockState {
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
    historyLimit: DEFAULT_HISTORY_LIMIT,
    monitorTypes: [],
    sites: [],
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
    data: {
        downloadSqliteBackup:
            async (): Promise<SerializedDatabaseBackupResult> => ({
                buffer: new ArrayBuffer(0),
                fileName: "uptime-watcher-backup.sqlite",
                metadata: {
                    createdAt: Date.now(),
                    originalPath: "C:/mock/uptime-watcher.sqlite",
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
        resetSettings: async (): Promise<void> => {
            mockState.historyLimit = DEFAULT_HISTORY_LIMIT;
        },
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

            const updatedSite = applySiteMutation(
                siteIdentifier,
                (current) => ({
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
                            : candidate
                    ),
                })
            );

            const resultingMonitor = updatedSite.monitors.find(
                (candidate) => candidate.id === monitorId
            );

            return {
                details: `Manual check completed for monitor '${monitorId}'.`,
                monitorId,
                previousStatus,
                site: clone(updatedSite),
                siteIdentifier,
                status: resultingMonitor?.status ?? previousStatus,
                timestamp,
            };
        },
        formatMonitorDetail: async (
            monitorType: string,
            details: string
        ): Promise<string> => `${monitorType}: ${details}`,
        formatMonitorTitleSuffix: async (
            monitorType: string,
            monitor: Site["monitors"][number]
        ): Promise<string> => `${monitor.id} · ${monitorType}`,
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
        startMonitoring: async (): Promise<boolean> => {
            mockState.sites = mockState.sites.map((site) => ({
                ...site,
                monitoring: true,
                monitors: site.monitors.map((monitor) => ({
                    ...monitor,
                    monitoring: true,
                })),
            }));
            return true;
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
                        : monitor
                ),
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
        stopMonitoring: async (): Promise<boolean> => {
            mockState.sites = mockState.sites.map((site) => ({
                ...site,
                monitoring: false,
                monitors: site.monitors.map((monitor) => ({
                    ...monitor,
                    monitoring: false,
                })),
            }));
            return true;
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
                        : monitor
                ),
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
    monitorTypes: {
        getMonitorTypes: async (): Promise<MonitorTypeConfig[]> =>
            clone(mockState.monitorTypes),
    },
    settings: {
        getHistoryLimit: async (): Promise<number> => mockState.historyLimit,
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
