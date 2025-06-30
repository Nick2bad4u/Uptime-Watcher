/**
 * Test setup file for Electron main/preload process tests.
 * Configures testing environment for Node.js-based Electron code.
 */

import { vi } from "vitest";

// Mock Electron APIs that aren't available in test environment
const mockApp = {
    getPath: vi.fn(() => "/mock/path"),
    getVersion: vi.fn(() => "1.0.0"),
    getName: vi.fn(() => "Uptime Watcher"),
    quit: vi.fn(),
    on: vi.fn(),
    whenReady: vi.fn(() => Promise.resolve()),
};

const mockBrowserWindow = vi.fn(() => ({
    loadFile: vi.fn(),
    loadURL: vi.fn(),
    on: vi.fn(),
    webContents: {
        on: vi.fn(),
        send: vi.fn(),
    },
    show: vi.fn(),
    close: vi.fn(),
}));

const mockIpcMain = {
    on: vi.fn(),
    handle: vi.fn(),
    removeAllListeners: vi.fn(),
};

const mockIpcRenderer = {
    on: vi.fn(),
    send: vi.fn(),
    invoke: vi.fn(),
    removeAllListeners: vi.fn(),
};

const mockContextBridge = {
    exposeInMainWorld: vi.fn(),
};

// Mock electron module with all exports
vi.mock("electron", () => ({
    app: mockApp,
    BrowserWindow: mockBrowserWindow,
    ipcMain: mockIpcMain,
    ipcRenderer: mockIpcRenderer,
    contextBridge: mockContextBridge,
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
