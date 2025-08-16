/**
 * Mock configuration setup for Vitest frontend tests Centralized mock
 * configuration for consistent testing behavior
 */

import { vi } from "vitest";

// Mock Electron APIs (not available in test environment)
const mockElectronAPI = {
    // IPC Communication
    invoke: vi.fn().mockResolvedValue({}),
    on: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),

    // Site Management
    sites: {
        getAll: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue(true),
        getById: vi.fn().mockResolvedValue(null),
    },

    // Settings Management
    settings: {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue(true),
        getAll: vi.fn().mockResolvedValue({}),
    },

    // Monitor Management
    monitor: {
        start: vi.fn().mockResolvedValue(true),
        stop: vi.fn().mockResolvedValue(true),
        getStatus: vi.fn().mockResolvedValue("stopped"),
    },

    // Window Management
    window: {
        minimize: vi.fn(),
        maximize: vi.fn(),
        close: vi.fn(),
        isMaximized: vi.fn().mockReturnValue(false),
    },

    // App Information
    app: {
        getVersion: vi.fn().mockReturnValue("1.0.0"),
        getName: vi.fn().mockReturnValue("Uptime Watcher"),
        quit: vi.fn(),
    },

    // Database Operations
    database: {
        backup: vi.fn().mockResolvedValue(true),
        restore: vi.fn().mockResolvedValue(true),
        optimize: vi.fn().mockResolvedValue(true),
    },

    // File System Operations
    fs: {
        readFile: vi.fn().mockResolvedValue(""),
        writeFile: vi.fn().mockResolvedValue(true),
        exists: vi.fn().mockResolvedValue(false),
        showOpenDialog: vi.fn().mockResolvedValue({ canceled: true }),
        showSaveDialog: vi.fn().mockResolvedValue({ canceled: true }),
    },
};

// Mock window.electronAPI
Object.defineProperty(globalThis, "electronAPI", {
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
const mockDate = new Date("2024-01-01T00:00:00.000Z");
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
const MockNotification = vi.fn();
MockNotification.permission = "granted";
MockNotification.requestPermission = vi.fn(() => Promise.resolve("granted"));

Object.defineProperty(globalThis, "Notification", {
    value: MockNotification,
});

// Export mock instances for test access
export { mockElectronAPI, mockDate };
