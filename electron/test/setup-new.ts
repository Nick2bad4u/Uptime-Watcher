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
        maximize: vi.fn(),
        minimize: vi.fn(),
        on: vi.fn(),
        once: vi.fn(),
        restore: vi.fn(),
        setAlwaysOnTop: vi.fn(),
        setFullScreen: vi.fn(),
        setIcon: vi.fn(),
        setTitle: vi.fn(),
        show: vi.fn(),
        unmaximize: vi.fn(),
        webContents: {
            on: vi.fn(),
            once: vi.fn(),
            send: vi.fn(),
            openDevTools: vi.fn(),
            closeDevTools: vi.fn(),
            isDevToolsOpened: vi.fn(() => false),
            executeJavaScript: vi.fn(() => Promise.resolve()),
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
    dialog: {
        showMessageBox: vi.fn(() => Promise.resolve({ response: 0 })),
        showSaveDialog: vi.fn(() => Promise.resolve({ canceled: false, filePath: "/mock/path" })),
        showOpenDialog: vi.fn(() => Promise.resolve({ canceled: false, filePaths: ["/mock/path"] })),
    },
    shell: {
        openExternal: vi.fn(() => Promise.resolve()),
        openPath: vi.fn(() => Promise.resolve("")),
        showItemInFolder: vi.fn(),
    },
    Menu: {
        buildFromTemplate: vi.fn(() => ({ popup: vi.fn() })),
        setApplicationMenu: vi.fn(),
    },
    Tray: vi.fn(() => ({
        setImage: vi.fn(),
        setToolTip: vi.fn(),
        setContextMenu: vi.fn(),
        destroy: vi.fn(),
    })),
    nativeImage: {
        createFromPath: vi.fn(() => ({})),
        createFromDataURL: vi.fn(() => ({})),
    },
    autoUpdater: {
        checkForUpdatesAndNotify: vi.fn(() => Promise.resolve()),
        on: vi.fn(),
        removeAllListeners: vi.fn(),
    },
    Notification: vi.fn(() => ({
        show: vi.fn(),
        on: vi.fn(),
    })),
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
