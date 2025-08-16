/**
 * Mock configuration setup for Vitest frontend tests Centralized mock
 * configuration for consistent testing behavior
 */

import { vi, type MockedFunction } from "vitest";

// Mock Electron APIs (not available in test environment)
const mockElectronAPI: {
    invoke: MockedFunction<(...args: any[]) => Promise<any>>;
    on: MockedFunction<(...args: any[]) => void>;
    off: MockedFunction<(...args: any[]) => void>;
    removeAllListeners: MockedFunction<(...args: any[]) => void>;
    sites: {
        getAll: MockedFunction<() => Promise<any[]>>;
        create: MockedFunction<(...args: any[]) => Promise<any>>;
        update: MockedFunction<(...args: any[]) => Promise<any>>;
        delete: MockedFunction<(...args: any[]) => Promise<boolean>>;
        getById: MockedFunction<(...args: any[]) => Promise<any>>;
    };
    settings: {
        get: MockedFunction<(...args: any[]) => Promise<any>>;
        set: MockedFunction<(...args: any[]) => Promise<boolean>>;
        getAll: MockedFunction<() => Promise<any>>;
    };
    monitor: {
        start: MockedFunction<(...args: any[]) => Promise<boolean>>;
        stop: MockedFunction<(...args: any[]) => Promise<boolean>>;
        getStatus: MockedFunction<() => Promise<string>>;
    };
    window: {
        minimize: MockedFunction<() => void>;
        maximize: MockedFunction<() => void>;
        close: MockedFunction<() => void>;
        isMaximized: MockedFunction<() => boolean>;
    };
    app: {
        getVersion: MockedFunction<() => string>;
        getName: MockedFunction<() => string>;
        quit: MockedFunction<() => void>;
    };
    database: {
        backup: MockedFunction<(...args: any[]) => Promise<boolean>>;
        restore: MockedFunction<(...args: any[]) => Promise<boolean>>;
        optimize: MockedFunction<(...args: any[]) => Promise<boolean>>;
    };
    fs: {
        readFile: MockedFunction<(...args: any[]) => Promise<string>>;
        writeFile: MockedFunction<(...args: any[]) => Promise<boolean>>;
        exists: MockedFunction<(...args: any[]) => Promise<boolean>>;
        showOpenDialog: MockedFunction<(...args: any[]) => Promise<{ canceled: boolean }>>;
        showSaveDialog: MockedFunction<(...args: any[]) => Promise<{ canceled: boolean }>>;
    };
} = {
    // IPC Communication
    invoke: vi.fn().mockResolvedValue({}) satisfies MockedFunction<(...args: any[]) => Promise<any>> as MockedFunction<(...args: any[]) => Promise<any>>,
    on: vi.fn() satisfies MockedFunction<(...args: any[]) => void> as MockedFunction<(...args: any[]) => void>,
    off: vi.fn() satisfies MockedFunction<(...args: any[]) => void> as MockedFunction<(...args: any[]) => void>,
    removeAllListeners: vi.fn() satisfies MockedFunction<(...args: any[]) => void> as MockedFunction<(...args: any[]) => void>,

    // Site Management
    sites: {
        getAll: vi.fn().mockResolvedValue([]) satisfies MockedFunction<() => Promise<any[]>> as MockedFunction<() => Promise<any[]>>,
        create: vi.fn().mockResolvedValue({}) satisfies MockedFunction<(...args: any[]) => Promise<any>> as MockedFunction<(...args: any[]) => Promise<any>>,
        update: vi.fn().mockResolvedValue({}) satisfies MockedFunction<(...args: any[]) => Promise<any>> as MockedFunction<(...args: any[]) => Promise<any>>,
        delete: vi.fn().mockResolvedValue(true) satisfies MockedFunction<(...args: any[]) => Promise<boolean>> as MockedFunction<(...args: any[]) => Promise<boolean>>,
        getById: vi.fn().mockResolvedValue(null) satisfies MockedFunction<(...args: any[]) => Promise<any>> as MockedFunction<(...args: any[]) => Promise<any>>,
    },

    // Settings Management
    settings: {
        get: vi.fn().mockResolvedValue(null) satisfies MockedFunction<(...args: any[]) => Promise<any>> as MockedFunction<(...args: any[]) => Promise<any>>,
        set: vi.fn().mockResolvedValue(true) satisfies MockedFunction<(...args: any[]) => Promise<boolean>> as MockedFunction<(...args: any[]) => Promise<boolean>>,
        getAll: vi.fn().mockResolvedValue({}) satisfies MockedFunction<() => Promise<any>> as MockedFunction<() => Promise<any>>,
    },

    // Monitor Management
    monitor: {
        start: vi.fn().mockResolvedValue(true) satisfies MockedFunction<(...args: any[]) => Promise<boolean>> as MockedFunction<(...args: any[]) => Promise<boolean>>,
        stop: vi.fn().mockResolvedValue(true) satisfies MockedFunction<(...args: any[]) => Promise<boolean>> as MockedFunction<(...args: any[]) => Promise<boolean>>,
        getStatus: vi.fn().mockResolvedValue("stopped") satisfies MockedFunction<() => Promise<string>> as MockedFunction<() => Promise<string>>,
    },

    // Window Management
    window: {
        minimize: vi.fn() satisfies MockedFunction<() => void> as MockedFunction<() => void>,
        maximize: vi.fn() satisfies MockedFunction<() => void> as MockedFunction<() => void>,
        close: vi.fn() satisfies MockedFunction<() => void> as MockedFunction<() => void>,
        isMaximized: vi.fn().mockReturnValue(false) satisfies MockedFunction<() => boolean> as MockedFunction<() => boolean>,
    },

    // App Information
    app: {
        getVersion: vi.fn().mockReturnValue("1.0.0") satisfies MockedFunction<() => string> as MockedFunction<() => string>,
        getName: vi.fn().mockReturnValue("Uptime Watcher") satisfies MockedFunction<() => string> as MockedFunction<() => string>,
        quit: vi.fn() satisfies MockedFunction<() => void> as MockedFunction<() => void>,
    },

    // Database Operations
    database: {
        backup: vi.fn().mockResolvedValue(true) satisfies MockedFunction<(...args: any[]) => Promise<boolean>> as MockedFunction<(...args: any[]) => Promise<boolean>>,
        restore: vi.fn().mockResolvedValue(true) satisfies MockedFunction<(...args: any[]) => Promise<boolean>> as MockedFunction<(...args: any[]) => Promise<boolean>>,
        optimize: vi.fn().mockResolvedValue(true) satisfies MockedFunction<(...args: any[]) => Promise<boolean>> as MockedFunction<(...args: any[]) => Promise<boolean>>,
    },

    // File System Operations
    fs: {
        readFile: vi.fn().mockResolvedValue("") satisfies MockedFunction<(...args: any[]) => Promise<string>> as MockedFunction<(...args: any[]) => Promise<string>>,
        writeFile: vi.fn().mockResolvedValue(true) satisfies MockedFunction<(...args: any[]) => Promise<boolean>> as MockedFunction<(...args: any[]) => Promise<boolean>>,
        exists: vi.fn().mockResolvedValue(false) satisfies MockedFunction<(...args: any[]) => Promise<boolean>> as MockedFunction<(...args: any[]) => Promise<boolean>>,
        showOpenDialog: vi.fn().mockResolvedValue({ canceled: true }) satisfies MockedFunction<(...args: any[]) => Promise<{ canceled: boolean }>> as MockedFunction<(...args: any[]) => Promise<{ canceled: boolean }>>,
        showSaveDialog: vi.fn().mockResolvedValue({ canceled: true }) satisfies MockedFunction<(...args: any[]) => Promise<{ canceled: boolean }>> as MockedFunction<(...args: any[]) => Promise<{ canceled: boolean }>>,
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
