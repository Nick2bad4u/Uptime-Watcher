/**
 * Test setup file for Electron backend tests.
 * Provides global mocks and utilities for consistent testing environment.
 */

import { vi } from "vitest";

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

// Mock node-sqlite3-wasm if used in Electron tests
vi.mock("node-sqlite3-wasm", () => ({
    default: {
        open: vi.fn(),
        close: vi.fn(),
        exec: vi.fn(),
        prepare: vi.fn(),
    },
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
    };
});

// Mock path module
vi.mock("path", async () => {
    const actual = await vi.importActual("path");
    return {
        ...actual,
        join: vi.fn((...args) => args.join("/")),
        resolve: vi.fn((...args) => "/" + args.join("/")),
    };
});

// Global test configuration for Electron tests
global.console = {
    ...console,
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
};

// Mock all repository classes with comprehensive method sets
const createMockRepository = (additionalMethods = {}) => {
    return vi.fn(() => ({
        // Base CRUD operations
        create: vi.fn(() => Promise.resolve("mock-id")),
        findAll: vi.fn(() => Promise.resolve([])),
        findById: vi.fn(() => Promise.resolve(null)),
        update: vi.fn(() => Promise.resolve()),
        delete: vi.fn(() => Promise.resolve()),
        upsert: vi.fn(() => Promise.resolve()),

        // Additional methods
        ...additionalMethods,
    }));
};

// Mock SiteRepository
vi.mock("../services/database/SiteRepository", () => ({
    SiteRepository: createMockRepository({
        findByIdentifier: vi.fn(() => Promise.resolve(null)),
        deleteByIdentifier: vi.fn(() => Promise.resolve()),
        exportAll: vi.fn(() => Promise.resolve([])),
    }),
}));

// Mock MonitorRepository
vi.mock("../services/database/MonitorRepository", () => ({
    MonitorRepository: createMockRepository({
        findBySiteIdentifier: vi.fn(() => Promise.resolve([])),
        deleteByIds: vi.fn(() => Promise.resolve()),
        deleteBySiteIdentifier: vi.fn(() => Promise.resolve()),
        updateStatus: vi.fn(() => Promise.resolve()),
    }),
}));

// Mock HistoryRepository
vi.mock("../services/database/HistoryRepository", () => ({
    HistoryRepository: createMockRepository({
        findByMonitorId: vi.fn(() => Promise.resolve([])),
        deleteByMonitorIds: vi.fn(() => Promise.resolve()),
        deleteOldEntries: vi.fn(() => Promise.resolve()),
        addEntry: vi.fn(() => Promise.resolve()),
    }),
}));

// Mock SettingsRepository
vi.mock("../services/database/SettingsRepository", () => ({
    SettingsRepository: createMockRepository({
        get: vi.fn(() => Promise.resolve(null)),
        set: vi.fn(() => Promise.resolve()),
        getAll: vi.fn(() => Promise.resolve({})),
    }),
}));

// Mock DatabaseService
vi.mock("../services/database/DatabaseService", () => ({
    DatabaseService: {
        getInstance: vi.fn(() => ({
            initializeDatabase: vi.fn(() => Promise.resolve()),
            close: vi.fn(() => Promise.resolve()),
        })),
    },
}));

// Mock MonitorScheduler
vi.mock("../services/monitoring/MonitorScheduler", () => ({
    MonitorScheduler: vi.fn(() => ({
        startAll: vi.fn(),
        stopAll: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        setCallback: vi.fn(),
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

// Mock logger utilities
vi.mock("../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    },
}));

// Mock electron-log
vi.mock("electron-log/main", () => ({
    default: {
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
