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

// Configure fast-check for property-based testing
const current = fc.readConfigureGlobal() ?? {};

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
    // Required by you:
    numRuns: 10,

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
const mockElectronAPI: any = {
    // Data management operations (import/export, settings, backup)
    data: {
        // Settings operations
        getHistoryLimit: vi.fn().mockResolvedValue(1000),
        updateHistoryLimit: vi.fn().mockResolvedValue(30),
        resetSettings: vi.fn().mockResolvedValue(undefined),

        // Backup operations
        downloadSqliteBackup: vi.fn().mockResolvedValue({
            buffer: new ArrayBuffer(8),
            fileName: "backup.db",
        }),

        // Import/Export operations
        importData: vi.fn().mockResolvedValue(true),
        exportData: vi.fn().mockResolvedValue("{}"),
    },

    // Event listener registration for various system events
    events: {
        removeAllListeners: vi.fn().mockReturnValue(undefined),
        on: vi.fn().mockReturnValue(undefined),
        off: vi.fn().mockReturnValue(undefined),
    },

    // Monitoring control operations (start/stop, validation, formatting)
    monitoring: {
        removeMonitor: vi.fn().mockResolvedValue(undefined),
        startMonitor: vi.fn().mockResolvedValue(undefined),
        stopMonitor: vi.fn().mockResolvedValue(undefined),
        stopMonitoringForSite: vi.fn().mockResolvedValue(undefined),
        validateMonitorConfig: vi.fn().mockResolvedValue(true),
        formatHttpStatus: vi.fn().mockReturnValue("up"),
    },

    // Monitor type registry operations
    monitorTypes: {
        getAll: vi.fn().mockResolvedValue({
            success: true,
            data: [
                { type: "http", name: "HTTP", fields: [] },
                { type: "ping", name: "Ping", fields: [] },
                { type: "port", name: "Port", fields: [] },
                { type: "dns", name: "DNS", fields: [] },
            ],
        }),
        getMonitorTypes: vi.fn().mockResolvedValue([
            {
                type: "http",
                displayName: "HTTP",
                description: "HTTP monitoring",
                version: "1.0.0",
                fields: [
                    {
                        name: "url",
                        type: "url",
                        required: true,
                        label: "URL",
                    },
                ],
            },
            {
                type: "port",
                displayName: "Port",
                description: "Port monitoring",
                version: "1.0.0",
                fields: [
                    {
                        name: "host",
                        type: "text",
                        required: true,
                        label: "Host",
                    },
                    {
                        name: "port",
                        type: "number",
                        required: true,
                        label: "Port",
                    },
                ],
            },
            {
                type: "ping",
                displayName: "Ping",
                description: "Ping monitoring",
                version: "1.0.0",
                fields: [
                    {
                        name: "host",
                        type: "text",
                        required: true,
                        label: "Host",
                    },
                ],
            },
            {
                type: "dns",
                displayName: "DNS",
                description: "DNS monitoring",
                version: "1.0.0",
                fields: [
                    {
                        name: "host",
                        type: "text",
                        required: true,
                        label: "Host",
                    },
                ],
            },
        ]),
        getByType: vi.fn().mockResolvedValue({
            success: true,
            data: { type: "http", name: "HTTP", fields: [] },
        }),
        validateMonitorData: vi.fn().mockResolvedValue({
            success: true,
            data: {
                success: true,
                errors: [],
                warnings: [],
                metadata: {},
            },
        }),
        formatMonitorDetail: vi.fn().mockResolvedValue({
            success: true,
            data: "Formatted detail",
        }),
        formatMonitorTitleSuffix: vi.fn().mockResolvedValue({
            success: true,
            data: " (formatted)",
        }),
    },

    // Settings management operations
    settings: {
        getHistoryLimit: vi.fn().mockResolvedValue(1000),
        updateHistoryLimit: vi.fn().mockResolvedValue(1000),
    },

    // Site management operations (CRUD, monitoring control)
    sites: {
        getSites: vi.fn().mockResolvedValue([]),
        addSite: vi.fn().mockResolvedValue(undefined),
        updateSite: vi.fn().mockResolvedValue(undefined),
        removeSite: vi.fn().mockResolvedValue(undefined),
        removeMonitor: vi.fn().mockResolvedValue(undefined),
        getAll: vi.fn().mockResolvedValue([]), // Legacy alias
        create: vi.fn().mockResolvedValue({}), // Legacy alias
        update: vi.fn().mockResolvedValue({}), // Legacy alias
        delete: vi.fn().mockResolvedValue(true), // Legacy alias
        getById: vi.fn().mockResolvedValue(null), // Legacy alias
    },

    // State synchronization operations
    stateSync: {
        onStateSyncEvent: vi.fn().mockReturnValue(() => {}),
        offStateSyncEvent: vi.fn().mockReturnValue(undefined),
    },

    // System-level operations (external links, etc.)
    system: {
        openExternal: vi.fn().mockResolvedValue(undefined),
        quitAndInstall: vi.fn().mockResolvedValue(undefined),
        getVersion: vi.fn().mockReturnValue("1.0.0"),
        getName: vi.fn().mockReturnValue("Uptime Watcher"),
        quit: vi.fn().mockReturnValue(undefined),
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
vi.mock("chart.js", () => ({
    Chart: vi.fn(),
    registerables: [],
    CategoryScale: vi.fn(),
    LinearScale: vi.fn(),
    BarElement: vi.fn(),
    LineElement: vi.fn(),
    PointElement: vi.fn(),
    ArcElement: vi.fn(),
    Title: vi.fn(),
    Tooltip: vi.fn(),
    Legend: vi.fn(),
}));

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
