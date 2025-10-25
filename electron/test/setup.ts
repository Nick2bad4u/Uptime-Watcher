/**
 * Test setup file for Electron backend tests. Provides global mocks and
 * utilities for consistent testing environment.
 */

import { vi } from "vitest";
import fc from "fast-check";

// Increase Node.js process listener limits for tests to prevent MaxListenersExceededWarning
process.setMaxListeners(200);

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

// Suppress PromiseRejectionHandledWarning for test environment
// This warning is expected in retry tests where we intentionally test promise rejections
process.on("rejectionHandled", () => {
    // Silently handle - this is expected in our test environment
});

// Handle unhandled promise rejections in test environment
process.on("unhandledRejection", (reason, promise) => {
    // In tests, we expect some unhandled rejections, especially in retry tests
    // Log them but don't crash the test process
    console.warn("Unhandled Rejection at:", promise, "reason:", reason);
});

// Also suppress specific warning types during tests
const originalStderr = process.stderr.write;
process.stderr.write = function (chunk: any, encoding?: any, fd?: any) {
    const output = chunk.toString();
    if (
        output.includes("PromiseRejectionHandledWarning") ||
        output.includes("UnhandledPromiseRejectionWarning")
    ) {
        return true; // Suppress these warnings in test environment
    }
    return originalStderr.call(this, chunk, encoding, fd);
};

// Mock electron before any imports
vi.mock("electron", () => ({
    app: {
        getName: vi.fn(() => "Uptime Watcher"),
        getPath: vi.fn((name: string) => `/mock/path/${name}`),
        getVersion: vi.fn(() => "1.0.0"),
        isPackaged: false,
        on: vi.fn(),
        quit: vi.fn(),
        whenReady: vi.fn(() => Promise.resolve()),
        ready: true,
        commandLine: {
            appendSwitch: vi.fn(),
        },
        dock: {
            hide: vi.fn(),
        },
    },
    BrowserWindow: vi.fn(() => ({
        close: vi.fn(),
        destroy: vi.fn(),
        focus: vi.fn(),
        hide: vi.fn(),
        isDestroyed: vi.fn(() => false),
        isMinimized: vi.fn(() => false),
        loadFile: vi.fn(() => Promise.resolve()),
        loadURL: vi.fn(() => Promise.resolve()),
        on: vi.fn(),
        webContents: {
            on: vi.fn(),
            send: vi.fn(),
        },
        show: vi.fn(),
    })),
    ipcMain: {
        on: vi.fn(),
        handle: vi.fn(),
        removeAllListeners: vi.fn(),
    },
    ipcRenderer: {
        on: vi.fn(),
        send: vi.fn(),
        invoke: vi.fn(),
        removeAllListeners: vi.fn(),
    },
    contextBridge: {
        exposeInMainWorld: vi.fn(),
    },
}));

// Mock node-sqlite3-wasm with comprehensive Database interface
vi.mock("node-sqlite3-wasm", () => ({
    default: vi.fn(),
    Database: vi.fn(() => {
        const preparedStatement = {
            run: vi.fn(() => ({ changes: 1, lastInsertRowid: 1 })),
            get: vi.fn(() => undefined),
            all: vi.fn(() => []),
            finalize: vi.fn(),
        };

        return {
            run: vi.fn(() => ({ changes: 1, lastInsertRowid: 1 })),
            get: vi.fn(() => undefined),
            all: vi.fn(() => []),
            exec: vi.fn(),
            prepare: vi.fn(() => preparedStatement),
            close: vi.fn(),
        };
    }),
}));

// Mock fs for file system operations with constructable partials
const createFsMock = async (
    moduleSpecifier: "fs" | "node:fs"
): Promise<typeof import("node:fs")> => {
    const actual =
        await vi.importActual<typeof import("node:fs")>(moduleSpecifier);

    const readFileSyncMock = vi.fn(
        (...args: Parameters<typeof actual.readFileSync>) =>
            actual.readFileSync(...args)
    ) as unknown as typeof actual.readFileSync;

    const readFilePromiseMock = vi.fn(
        (...args: Parameters<typeof actual.promises.readFile>) =>
            actual.promises.readFile(...args)
    ) as unknown as typeof actual.promises.readFile;

    const accessPromiseMock = vi.fn(
        (...args: Parameters<typeof actual.promises.access>) =>
            actual.promises.access(...args)
    ) as unknown as typeof actual.promises.access;

    const writeFilePromiseMock = vi.fn(
        async (...args: Parameters<typeof actual.promises.writeFile>) => {
            // No-op to avoid mutating the real filesystem during tests
            void args;
            return undefined;
        }
    ) as unknown as typeof actual.promises.writeFile;

    const mkdirPromiseMock = vi.fn(
        async (...args: Parameters<typeof actual.promises.mkdir>) => {
            // No-op to avoid mutating the real filesystem during tests
            void args;
            return undefined;
        }
    ) as unknown as typeof actual.promises.mkdir;

    return {
        ...actual,
        existsSync: actual.existsSync.bind(actual),
        readdirSync: actual.readdirSync.bind(actual),
        statSync: actual.statSync.bind(actual),
        readFileSync: readFileSyncMock,
        promises: {
            ...actual.promises,
            readFile: readFilePromiseMock,
            writeFile: writeFilePromiseMock,
            access: accessPromiseMock,
            mkdir: mkdirPromiseMock,
        },
    };
};

vi.mock("fs", () => createFsMock("fs"));
vi.mock("node:fs", () => createFsMock("node:fs"));

// Mock path modules
const createPathMock = async <T extends typeof import("path")>(
    moduleSpecifier: string
) => {
    const actual = await vi.importActual<T>(moduleSpecifier);
    return {
        ...actual,
        default: actual,
        join: vi.fn((...args: string[]) => args.join("/")),
        resolve: vi.fn((...args: string[]) => `/${args.join("/")}`),
    };
};

vi.mock("path", () => createPathMock("path"));
vi.mock("node:path", () => createPathMock("node:path"));

// Global test configuration for Electron tests
globalThis.console = {
    ...console,
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
};

// Note: Logger module is NOT mocked globally to allow individual test files
// to test the actual logger implementation with mocked electron-log

// Note: Repository classes are NOT mocked globally to allow individual test files
// to provide their own mocks for better test isolation and control

// Mock MonitorScheduler
vi.mock("../services/monitoring/MonitorScheduler", () => {
    class MockMonitorScheduler {
        public readonly intervals = new Map<string, symbol>();

        private onCheckCallback?: (
            siteIdentifier: string,
            monitorId: string
        ) => Promise<void> | void;

        public readonly setCheckCallback = vi.fn(
            (
                callback: (
                    siteIdentifier: string,
                    monitorId: string
                ) => Promise<void> | void
            ) => {
                this.onCheckCallback = callback;
            }
        );

        public readonly startMonitor = vi.fn(
            (siteIdentifier: string, monitor: { id?: string | null }) => {
                if (!monitor?.id) {
                    return false;
                }

                const key = this.createIntervalKey(siteIdentifier, monitor.id);
                this.intervals.set(key, Symbol("interval"));
                this.triggerImmediateCheck(siteIdentifier, monitor.id);
                return true;
            }
        );

        public readonly stopMonitor = vi.fn(
            (siteIdentifier: string, monitorId: string) => {
                const key = this.createIntervalKey(siteIdentifier, monitorId);
                return this.intervals.delete(key);
            }
        );

        public readonly startSite = vi.fn(
            (site: {
                identifier?: string;
                id?: string;
                monitors?: {
                    id?: string | null;
                    monitoring?: boolean | null;
                }[];
            }) => {
                if (!site?.monitors?.length) {
                    return;
                }

                const siteIdentifier = site.identifier ?? site.id ?? "";
                for (const monitor of site.monitors) {
                    if (monitor?.id && monitor.monitoring !== false) {
                        this.startMonitor(siteIdentifier, monitor);
                    }
                }
            }
        );

        public readonly stopSite = vi.fn(
            (siteIdentifier: string, monitors?: { id?: string | null }[]) => {
                if (monitors?.length) {
                    for (const monitor of monitors) {
                        if (monitor?.id) {
                            this.stopMonitor(siteIdentifier, monitor.id);
                        }
                    }
                    return;
                }

                for (const key of Array.from(this.intervals.keys())) {
                    if (key.startsWith(`${siteIdentifier}|`)) {
                        this.intervals.delete(key);
                    }
                }
            }
        );

        public readonly stopAll = vi.fn(() => {
            this.intervals.clear();
        });

        public readonly restartMonitor = vi.fn(
            (siteIdentifier: string, monitor: { id?: string | null }) => {
                if (!monitor?.id) {
                    return false;
                }

                this.stopMonitor(siteIdentifier, monitor.id);
                return this.startMonitor(siteIdentifier, monitor);
            }
        );

        public readonly isMonitoring = vi.fn(
            (siteIdentifier: string, monitorId: string) => {
                const key = this.createIntervalKey(siteIdentifier, monitorId);
                return this.intervals.has(key);
            }
        );

        public readonly getActiveCount = vi.fn(() => this.intervals.size);

        public readonly getActiveMonitors = vi.fn(() =>
            Array.from(this.intervals.keys())
        );

        public readonly performImmediateCheck = vi.fn(
            async (siteIdentifier: string, monitorId: string) => {
                this.triggerImmediateCheck(siteIdentifier, monitorId);
            }
        );

        private createIntervalKey(
            siteIdentifier: string,
            monitorId: string
        ): string {
            return `${siteIdentifier}|${monitorId}`;
        }

        private triggerImmediateCheck(
            siteIdentifier: string,
            monitorId: string
        ): void {
            if (!this.onCheckCallback) {
                return;
            }

            void Promise.resolve(
                this.onCheckCallback(siteIdentifier, monitorId)
            ).catch(() => {
                // Suppress errors in mock callback to mimic production logging behavior
            });
        }
    }

    return {
        MonitorScheduler: MockMonitorScheduler,
    };
});

// Mock MonitoringService
vi.mock("../services/monitoring/MonitoringService", () => ({
    MonitoringService: vi.fn(() => ({
        checkSite: vi.fn(() =>
            Promise.resolve({
                status: "up" as const,
                responseTime: 100,
                timestamp: new Date(),
            })
        ),
    })),
}));

// Mock ApplicationService
vi.mock("../services/application", () => ({
    ApplicationService: vi.fn(() => ({
        cleanup: vi.fn(() => Promise.resolve()),
        initialize: vi.fn(() => Promise.resolve()),
    })),
}));

// Remove global logger mock to allow test-specific mocking
// Individual tests can mock these as needed

// Mock electron-log
vi.mock("electron-log/main", () => ({
    default: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        initialize: vi.fn(),
        transports: {
            file: {
                level: "info",
                fileName: "uptime-watcher-main.log",
                maxSize: 1024 * 1024 * 5,
                format: "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}",
            },
            console: {
                level: "debug",
                format: "[{h}:{i}:{s}.{ms}] [{level}] {text}",
            },
        },
    },
}));

vi.mock("electron-log/renderer", () => ({
    default: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        transports: {
            file: {
                level: "info",
                fileName: "uptime-watcher-renderer.log",
                maxSize: 1024 * 1024 * 5,
                format: "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}",
            },
            console: {
                level: "debug",
                format: "[{h}:{i}:{s}.{ms}] [{level}] {text}",
            },
        },
    },
}));
