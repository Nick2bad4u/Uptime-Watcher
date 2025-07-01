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
        maximize: vi.fn(),
        minimize: vi.fn(),
        on: vi.fn(),
        once: vi.fn(),
        restore: vi.fn(),
        show: vi.fn(),
        webContents: {
            on: vi.fn(),
            once: vi.fn(),
            send: vi.fn(),
        },
    })),
    contextBridge: {
        exposeInMainWorld: vi.fn(),
    },
    ipcMain: {
        handle: vi.fn(),
        on: vi.fn(),
        once: vi.fn(),
        removeAllListeners: vi.fn(),
        removeHandler: vi.fn(),
    },
    ipcRenderer: {
        invoke: vi.fn(() => Promise.resolve()),
        on: vi.fn(),
        once: vi.fn(),
        removeAllListeners: vi.fn(),
        send: vi.fn(),
        sendSync: vi.fn(),
    },
}));

// Mock electron-log
vi.mock("electron-log/main", () => ({
    default: {
        initialize: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        transports: {
            file: {
                level: "info",
                fileName: "test.log",
                maxSize: 1024 * 1024,
                format: "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}",
            },
            console: {
                level: "debug",
                format: "[{h}:{i}:{s}.{ms}] [{level}] {text}",
            },
        },
    },
}));

// Test utilities
export const createMockSite = (overrides = {}) => ({
    identifier: "test-site-123",
    name: "Test Site",
    monitoring: false,
    monitors: [],
    ...overrides,
});

export const createMockMonitor = (overrides = {}) => ({
    id: "test-monitor-123",
    type: "http" as const,
    status: "pending" as const,
    history: [],
    url: "https://example.com",
    checkInterval: 300000,
    timeout: 10000,
    retryAttempts: 3,
    ...overrides,
});

export const createMockStatusHistory = (overrides = {}) => ({
    timestamp: Date.now(),
    status: "up" as const,
    responseTime: 100,
    ...overrides,
});

// Global test cleanup
beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    vi.restoreAllMocks();
});
