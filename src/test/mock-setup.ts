/**
 * Mock configuration setup for Vitest frontend tests Centralized mock
 * configuration for consistent testing behavior
 */

import EventEmitter from "node:events";

// Set max listeners to prevent memory leak warnings in tests
const MAX_LISTENERS = 200; // Higher threshold for test environment

// Set default max listeners for all EventEmitter instances
EventEmitter.defaultMaxListeners = MAX_LISTENERS;

// Set max listeners specifically for the process object
process.setMaxListeners(MAX_LISTENERS);

import { vi } from "vitest";
import fc from "fast-check";
import { resolveFastCheckEnvOverrides } from "@shared/test/utils/fastCheckEnv";
import type {
    Monitor,
    MonitoringStartSummary,
    MonitoringStopSummary,
    Site,
    StatusUpdate,
} from "@shared/types";
import type {
    StateSyncFullSyncResult,
    StateSyncStatusSummary,
} from "@shared/types/stateSync";
import type { ValidationResult } from "@shared/types/validation";
import type { ElectronAPI } from "../types";

vi.mock("electron", () => ({
    app: {
        getPath: vi.fn(() => ""),
        isPackaged: false,
        whenReady: vi.fn(async () => undefined),
        on: vi.fn(),
    },
    ipcRenderer: {
        invoke: vi.fn(),
        on: vi.fn(),
        once: vi.fn(),
        removeAllListeners: vi.fn(),
        removeListener: vi.fn(),
        send: vi.fn(),
    },
    nativeTheme: {
        on: vi.fn(),
        off: vi.fn(),
        shouldUseDarkColors: false,
        themeSource: "light",
    },
    shell: {
        openExternal: vi.fn(),
    },
    BrowserWindow: vi.fn(),
}));

Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: undefined,
    writable: true,
});

const startSummaryMock: MonitoringStartSummary = {
    attempted: 2,
    failed: 0,
    partialFailures: false,
    siteCount: 1,
    skipped: 0,
    succeeded: 2,
    isMonitoring: true,
    alreadyActive: false,
};

const stopSummaryMock: MonitoringStopSummary = {
    attempted: 2,
    failed: 0,
    partialFailures: false,
    siteCount: 1,
    skipped: 0,
    succeeded: 2,
    isMonitoring: false,
    alreadyInactive: false,
};

Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
    writable: true,
});

// Configure fast-check for property-based testing
const current = fc.readConfigureGlobal() ?? {};
const baseNumRuns = (current as { numRuns?: number }).numRuns ?? 10;
const fastCheckOverrides = resolveFastCheckEnvOverrides(baseNumRuns);

// Optional: example custom reporter (uncomment + adapt if you want structured output)
// const jsonReporter = (runDetails: any) => {
//   // e.g., write to a log file or console as JSON for CI parsing
//   // require('fs').appendFileSync('fc-report.json', JSON.stringify(runDetails) + '\n');
//   if (runDetails.failed) {
//     // default behavior is to throw; you can customize here if you prefer
//     throw new Error(`Property failed: seed=${runDetails.seed} path=${runDetails.path}`);
//   }
// };

fc.configureGlobal({
    ...current,
    ...fastCheckOverrides,

    // Reporting / debugging helpers
    verbose: 2, // 0 = quiet, 1 = medium, 2 = most verbose
    includeErrorInReport: true, // Include the original error text (helps many runners)

    // Failure and time limits
    endOnFailure: true, // Stop on first property failure
    timeout: 1000, // Per-case async timeout (ms)
    interruptAfterTimeLimit: 5 * 60 * 1000, // Overall cap for a run (ms)
    markInterruptAsFailure: true, // Treat interrupts as failures (good for CI)
    skipAllAfterTimeLimit: 60 * 1000, // Cap time spent on skipping/shrinking (ms)

    // Duplicate handling and skipping
    maxSkipsPerRun: 100, // Tolerance for preconditions / filters
    // skipEqualValues: true, // skip duplicates while still achieving numRuns

    // Examples and sampling
    // examples: [],          // add any concrete inputs you want always tested
    // unbiased: false,    // keep default biasing unless you need unbiased generators

    // RNG / reproducibility
    // seed: undefined,    // set a specific number to reproduce runs
    // randomType: 'xorshift128plus', // default; change if you need a different generator

    // Replace reporter if you want custom behavior:
    // reporter: jsonReporter,
    // asyncReporter: async (runDetails) => { /* async reporting */ },
});

// Mock Electron APIs (not available in test environment) - matches new domain-based preload API structure
const cloneMonitor = (monitor: Monitor): Monitor => {
    const clonedMonitor: Monitor = {
        ...monitor,
        history: monitor.history.map((entry) => ({ ...entry })),
    };

    if (monitor.activeOperations === undefined) {
        return clonedMonitor;
    }

    return {
        ...clonedMonitor,
        activeOperations: Array.from(monitor.activeOperations),
    };
};

const cloneSite = (site: Site): Site => ({
    ...site,
    monitors: site.monitors.map((monitor: Monitor) => cloneMonitor(monitor)),
});

const defaultMonitor: Monitor = {
    activeOperations: [],
    checkInterval: 60_000,
    history: [],
    id: "monitor-1",
    monitoring: false,
    responseTime: 0,
    retryAttempts: 0,
    status: "up",
    timeout: 30_000,
    type: "http",
    url: "https://example.com",
};

const defaultSite: Site = {
    identifier: "mock-site",
    monitoring: false,
    monitors: [cloneMonitor(defaultMonitor)],
    name: "Mock Site",
};

const defaultStateSyncStatus: StateSyncStatusSummary = {
    lastSyncAt: Date.now(),
    siteCount: 1,
    source: "frontend",
    synchronized: true,
};

const defaultFullSyncResult: StateSyncFullSyncResult = {
    completedAt: Date.now(),
    siteCount: 1,
    sites: [cloneSite(defaultSite)],
    source: "frontend",
    synchronized: true,
};

const mockElectronAPI: ElectronAPI = {
    data: {
        downloadSqliteBackup: vi.fn<
            ElectronAPI["data"]["downloadSqliteBackup"]
        >(async () => ({
            buffer: new ArrayBuffer(8),
            fileName: "backup.db",
            metadata: {
                createdAt: 0,
                originalPath: "/tmp/backup.db",
                sizeBytes: 8,
            },
        })),
        exportData: vi.fn<ElectronAPI["data"]["exportData"]>(async () => "{}"),
        importData: vi.fn<ElectronAPI["data"]["importData"]>(async () => true),
    },

    events: {
        onCacheInvalidated: vi.fn<ElectronAPI["events"]["onCacheInvalidated"]>(
            (_callback) => () => undefined
        ),
        onMonitorCheckCompleted: vi.fn<
            ElectronAPI["events"]["onMonitorCheckCompleted"]
        >((_callback) => () => undefined),
        onHistoryLimitUpdated: vi.fn<
            ElectronAPI["events"]["onHistoryLimitUpdated"]
        >((_callback) => () => undefined),
        onMonitorDown: vi.fn<ElectronAPI["events"]["onMonitorDown"]>(
            (_callback) => () => undefined
        ),
        onMonitoringStarted: vi.fn<
            ElectronAPI["events"]["onMonitoringStarted"]
        >((_callback) => () => undefined),
        onMonitoringStopped: vi.fn<
            ElectronAPI["events"]["onMonitoringStopped"]
        >((_callback) => () => undefined),
        onMonitorStatusChanged: vi.fn<
            ElectronAPI["events"]["onMonitorStatusChanged"]
        >((_callback) => () => undefined),
        onMonitorUp: vi.fn<ElectronAPI["events"]["onMonitorUp"]>(
            (_callback) => () => undefined
        ),
        onSiteAdded: vi.fn<ElectronAPI["events"]["onSiteAdded"]>(
            (_callback) => () => undefined
        ),
        onSiteRemoved: vi.fn<ElectronAPI["events"]["onSiteRemoved"]>(
            (_callback) => () => undefined
        ),
        onSiteUpdated: vi.fn<ElectronAPI["events"]["onSiteUpdated"]>(
            (_callback) => () => undefined
        ),
        onStateSyncEvent: vi.fn<ElectronAPI["events"]["onStateSyncEvent"]>(
            (_callback) => () => undefined
        ),
        onTestEvent: vi.fn<ElectronAPI["events"]["onTestEvent"]>(
            (_callback) => () => undefined
        ),
        onUpdateStatus: vi.fn<ElectronAPI["events"]["onUpdateStatus"]>(
            (_callback) => () => undefined
        ),
        removeAllListeners: vi.fn<ElectronAPI["events"]["removeAllListeners"]>(
            () => undefined
        ),
    },
    notifications: {
        updatePreferences: vi.fn<
            ElectronAPI["notifications"]["updatePreferences"]
        >(async () => {
            /* noop */
        }),
    },
    monitoring: {
        checkSiteNow: vi.fn<ElectronAPI["monitoring"]["checkSiteNow"]>(
            async (siteIdentifier, monitorId) => {
                const base = cloneSite(defaultSite);
                base.identifier = siteIdentifier;

                const monitor = base.monitors.find(
                    (candidate) => candidate.id === monitorId
                );

                if (!monitor) {
                    return undefined;
                }

                const timestamp = new Date().toISOString();
                const previousStatus = monitor.status;

                const updatedSite = cloneSite({
                    ...base,
                    monitors: base.monitors.map((candidate) =>
                        candidate.id === monitorId
                            ? {
                                  ...candidate,
                                  lastChecked: new Date(),
                                  responseTime: Math.max(
                                      10,
                                      Math.round(Math.random() * 200)
                                  ),
                                  status: "up",
                              }
                            : candidate
                    ),
                });

                const updatedMonitor = updatedSite.monitors.find(
                    (candidate) => candidate.id === monitorId
                );

                const statusUpdate: StatusUpdate = {
                    details: `Manual check run for monitor '${monitorId}'.`,
                    monitor: updatedMonitor ?? monitor,
                    monitorId,
                    previousStatus,
                    site: updatedSite,
                    siteIdentifier,
                    status: updatedMonitor?.status ?? previousStatus,
                    timestamp,
                };

                return statusUpdate;
            }
        ),
        startMonitoring: vi.fn<ElectronAPI["monitoring"]["startMonitoring"]>(
            async () => startSummaryMock
        ),
        startMonitoringForMonitor: vi.fn<
            ElectronAPI["monitoring"]["startMonitoringForMonitor"]
        >(async () => true),
        startMonitoringForSite: vi.fn<
            ElectronAPI["monitoring"]["startMonitoringForSite"]
        >(async () => true),
        stopMonitoring: vi.fn<ElectronAPI["monitoring"]["stopMonitoring"]>(
            async () => stopSummaryMock
        ),
        stopMonitoringForMonitor: vi.fn<
            ElectronAPI["monitoring"]["stopMonitoringForMonitor"]
        >(async () => true),
        stopMonitoringForSite: vi.fn<
            ElectronAPI["monitoring"]["stopMonitoringForSite"]
        >(async () => true),
    },

    monitorTypes: {
        formatMonitorDetail: vi.fn<
            ElectronAPI["monitorTypes"]["formatMonitorDetail"]
        >(async (_monitorType, details) => details),
        formatMonitorTitleSuffix: vi.fn<
            ElectronAPI["monitorTypes"]["formatMonitorTitleSuffix"]
        >(async (monitorType, monitor) => `${monitor.id}-${monitorType}`),
        getMonitorTypes: vi.fn<ElectronAPI["monitorTypes"]["getMonitorTypes"]>(
            async () => []
        ),
        validateMonitorData: vi.fn<
            ElectronAPI["monitorTypes"]["validateMonitorData"]
        >(
            async (monitorType, monitorData) =>
                ({
                    data: monitorData ?? {},
                    errors: [],
                    metadata: { monitorType },
                    success: true,
                    warnings: [],
                }) satisfies ValidationResult
        ),
    },

    settings: {
        getHistoryLimit: vi.fn<ElectronAPI["settings"]["getHistoryLimit"]>(
            async () => 1000
        ),
        resetSettings: vi.fn<ElectronAPI["settings"]["resetSettings"]>(
            async () => undefined
        ),
        updateHistoryLimit: vi.fn<
            ElectronAPI["settings"]["updateHistoryLimit"]
        >(async (limit: number) => limit),
    },

    sites: {
        addSite: vi.fn<ElectronAPI["sites"]["addSite"]>(async (site) =>
            cloneSite(site)
        ),
        deleteAllSites: vi.fn<ElectronAPI["sites"]["deleteAllSites"]>(
            async () => 0
        ),
        getSites: vi.fn<ElectronAPI["sites"]["getSites"]>(async () => [
            cloneSite(defaultSite),
        ]),
        removeMonitor: vi.fn<ElectronAPI["sites"]["removeMonitor"]>(async () =>
            cloneSite(defaultSite)
        ),
        removeSite: vi.fn<ElectronAPI["sites"]["removeSite"]>(async () => true),
        updateSite: vi.fn<ElectronAPI["sites"]["updateSite"]>(
            async (siteIdentifier, updates) => {
                const base = cloneSite(defaultSite);
                return {
                    ...base,
                    ...updates,
                    identifier: siteIdentifier,
                    monitors: updates.monitors
                        ? updates.monitors.map((monitor: Monitor) =>
                              cloneMonitor(monitor)
                          )
                        : base.monitors,
                };
            }
        ),
    },

    stateSync: {
        getSyncStatus: vi.fn<ElectronAPI["stateSync"]["getSyncStatus"]>(
            async () => ({ ...defaultStateSyncStatus })
        ),
        onStateSyncEvent: vi.fn<ElectronAPI["stateSync"]["onStateSyncEvent"]>(
            (_callback) => () => undefined
        ),
        requestFullSync: vi.fn<ElectronAPI["stateSync"]["requestFullSync"]>(
            async () => ({
                ...defaultFullSyncResult,
                sites: defaultFullSyncResult.sites.map((site: Site) =>
                    cloneSite(site)
                ),
            })
        ),
    },

    system: {
        openExternal: vi.fn<ElectronAPI["system"]["openExternal"]>(
            async (url: string) => url.length > 0
        ),
        quitAndInstall: vi.fn<ElectronAPI["system"]["quitAndInstall"]>(
            async () => true
        ),
    },
};

// Mock window.electronAPI
Object.defineProperty(globalThis, "electronAPI", {
    writable: true,
    configurable: true,
    value: mockElectronAPI,
});

// Also assign to window for tests that access it via window.electronAPI
Object.defineProperty(window, "electronAPI", {
    writable: true,
    configurable: true,
    value: mockElectronAPI,
});

// Mock Chart.js for component testing
vi.mock("chart.js", () => {
    const Chart = Object.assign(vi.fn(), {
        register: vi.fn(),
    });

    return {
        Chart,
        registerables: [],
        CategoryScale: vi.fn(),
        LinearScale: vi.fn(),
        TimeScale: vi.fn(),
        BarElement: vi.fn(),
        LineElement: vi.fn(),
        PointElement: vi.fn(),
        ArcElement: vi.fn(),
        Title: vi.fn(),
        Tooltip: vi.fn(),
        Legend: vi.fn(),
        Filler: vi.fn(),
        Zoom: vi.fn(),
    };
});

vi.mock("chartjs-adapter-date-fns", () => ({}));

// Mock react-chartjs-2
vi.mock("react-chartjs-2", () => ({
    Line: vi.fn(),
    Bar: vi.fn(),
    Pie: vi.fn(),
    Doughnut: vi.fn(),
}));

// Mock axios for HTTP requests
vi.mock("axios", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        create: vi.fn(),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        },
    },
}));

// Mock Date for consistent testing
const mockDate: Date = new Date("2024-01-01T00:00:00.000Z");
vi.setSystemTime(mockDate);

// Mock crypto for UUID generation
Object.defineProperty(globalThis, "crypto", {
    value: {
        randomUUID: vi.fn(() => "12345678-1234-1234-1234-123456789012"),
        getRandomValues: vi.fn(),
    },
});

// Mock localStorage and sessionStorage
const createStorageMock = () => ({
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(() => null),
});

Object.defineProperty(globalThis, "localStorage", {
    value: createStorageMock(),
});

Object.defineProperty(globalThis, "sessionStorage", {
    value: createStorageMock(),
});

// Mock notifications
const MockNotification = vi.fn() as any;
MockNotification.permission = "granted";
MockNotification.requestPermission = vi.fn(() => Promise.resolve("granted"));

Object.defineProperty(globalThis, "Notification", {
    value: MockNotification,
});

// Export mock instances for test access
export { mockElectronAPI, mockDate };
