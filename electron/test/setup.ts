/**
 * Test setup file for Electron backend tests. Provides global mocks and
 * utilities for consistent testing environment.
 */

import { vi } from "vitest";

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

// Mock fs for file system operations
vi.mock("fs", async () => {
    const actual = await vi.importActual("fs");
    return {
        ...actual,
        promises: {
            readFile: vi.fn(),
            writeFile: vi.fn(),
            access: vi.fn(),
            mkdir: vi.fn(),
        },
        readFileSync: vi.fn(() => Buffer.from("mock-db-content")),
    };
});

// Mock path module
vi.mock("path", async () => {
    const actual = await vi.importActual("path");
    return {
        ...actual,
        join: vi.fn((...args) => args.join("/")),
        resolve: vi.fn((...args) => `/${args.join("/")}`),
    };
});

// Global test configuration for Electron tests
globalThis.console = {
    ...console,
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
};

// Mock logger module
vi.mock("../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        silly: vi.fn(),
        verbose: vi.fn(),
    },
    dbLogger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        silly: vi.fn(),
        verbose: vi.fn(),
    },
    monitorLogger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        silly: vi.fn(),
        verbose: vi.fn(),
    },
}));

// Note: Repository classes are NOT mocked globally to allow individual test files
// to provide their own mocks for better test isolation and control

// Mock MonitorScheduler
vi.mock("../services/monitoring/MonitorScheduler", () => ({
    MonitorScheduler: vi.fn(() => ({
        // Private properties accessed by tests
        intervals: new Map(),
        onCheckCallback: undefined,

        // Public methods
        setCheckCallback: vi.fn(function (this: any, callback: any) {
            this.onCheckCallback = callback;
        }),
        startMonitor: vi.fn(function (this: any, siteId: string, monitor: any) {
            if (!monitor.id) return false;
            const key = `${siteId}|${monitor.id}`;
            this.intervals.set(key, 123); // Mock interval ID
            return true;
        }),
        stopMonitor: vi.fn(function (
            this: any,
            siteId: string,
            monitorId: string
        ) {
            const key = `${siteId}|${monitorId}`;
            if (this.intervals.has(key)) {
                this.intervals.delete(key);
                return true;
            }
            return false;
        }),
        startSite: vi.fn(function (this: any, site: any) {
            let started = 0;
            if (site.monitors) {
                for (const monitor of site.monitors) {
                    if (monitor.id && monitor.isActive) {
                        this.startMonitor(site.id, monitor);
                        started++;
                    }
                }
            }
            return started;
        }),
        stopSite: vi.fn(function (this: any, siteId: string, monitors?: any[]) {
            if (monitors) {
                for (const monitor of monitors) {
                    if (monitor.id) {
                        this.stopMonitor(siteId, monitor.id);
                    }
                }
            } else {
                // Stop all monitors for the site
                const keysToDelete: string[] = [];
                for (const key of this.intervals.keys()) {
                    if (
                        typeof key === "string" &&
                        key.startsWith(`${siteId}|`)
                    ) {
                        keysToDelete.push(key);
                    }
                }
                for (const key of keysToDelete) this.intervals.delete(key);
            }
        }),
        stopAll: vi.fn(function (this: any) {
            this.intervals.clear();
        }),
        restartMonitor: vi.fn(function (
            this: any,
            siteId: string,
            monitor: any
        ) {
            if (!monitor.id) return false;
            this.stopMonitor(siteId, monitor.id);
            return this.startMonitor(siteId, monitor);
        }),
        isMonitoring: vi.fn(function (
            this: any,
            siteId: string,
            monitorId: string
        ) {
            const key = `${siteId}|${monitorId}`;
            return this.intervals.has(key);
        }),
        getActiveCount: vi.fn(function (this: any) {
            return this.intervals.size;
        }),
        getActiveMonitors: vi.fn(function (this: any) {
            return [...this.intervals.keys()];
        }),
    })),
}));

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
