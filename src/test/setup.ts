/**
 * Test setup file for Vitest.
 * Configures testing environment for React components.
 */

import "@testing-library/jest-dom";
import { vi, type Mock } from "vitest";

// Mock ResizeObserver for Chart.js testing
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Global test configuration and mocks
const mockElectronAPI: {
    data: {
        downloadSQLiteBackup: Mock<(...args: any[]) => any>;
        exportData: Mock<(...args: any[]) => any>;
        importData: Mock<(...args: any[]) => any>;
    };
    events: {
        onMonitorStatusChanged: Mock<(_callback: any) => Mock<(...args: any[]) => any>>;
        onMonitorUp: Mock<(_callback: any) => Mock<(...args: any[]) => any>>;
        onMonitorDown: Mock<(_callback: any) => Mock<(...args: any[]) => any>>;
        onMonitoringStarted: Mock<(_callback: any) => Mock<(...args: any[]) => any>>;
        onMonitoringStopped: Mock<(_callback: any) => Mock<(...args: any[]) => any>>;
        onTestEvent: Mock<(_callback: any) => Mock<(...args: any[]) => any>>;
        onUpdateStatus: Mock<(_callback: any) => Mock<(...args: any[]) => any>>;
        removeAllListeners: Mock<(...args: any[]) => any>;
    };
    monitoring: {
        startMonitoring: Mock<(...args: any[]) => any>;
        startMonitoringForSite: Mock<(...args: any[]) => any>;
        stopMonitoring: Mock<(...args: any[]) => any>;
        stopMonitoringForSite: Mock<(...args: any[]) => any>;
    };
    monitorTypes: {
        formatMonitorDetail: Mock<(...args: any[]) => any>;
        getMonitorTypes: Mock<(...args: any[]) => any>;
        validateMonitorData: Mock<(...args: any[]) => any>;
    };
    settings: {
        getHistoryLimit: Mock<(...args: any[]) => any>;
        updateHistoryLimit: Mock<(...args: any[]) => any>;
    };
    sites: {
        addSite: Mock<(...args: any[]) => any>;
        checkSiteNow: Mock<(...args: any[]) => any>;
        getSites: Mock<(...args: any[]) => any>;
        removeMonitor: Mock<(...args: any[]) => any>;
        removeSite: Mock<(...args: any[]) => any>;
        updateSite: Mock<(...args: any[]) => any>;
    };
    stateSync: {
        getSyncStatus: Mock<(...args: any[]) => any>;
        onStateSyncEvent: Mock<(_callback: any) => Mock<(...args: any[]) => any>>;
    };
    system: {
        openExternal: Mock<(...args: any[]) => any>;
        quitAndInstall: Mock<(...args: any[]) => any>;
    };
} = {
    data: {
        downloadSQLiteBackup: vi.fn().mockResolvedValue({
            buffer: new ArrayBuffer(8),
            fileName: "test-backup.sqlite",
        }),
        exportData: vi.fn().mockResolvedValue("mock-data"),
        importData: vi.fn().mockResolvedValue(true),
    },
    events: {
        onMonitorStatusChanged: vi.fn((_callback: any): Mock<(...args: any[]) => any> => {
            // Mock implementation - return cleanup function
            return vi.fn(); // Mock cleanup function
        }),
        onMonitorUp: vi.fn((_callback: any): Mock<(...args: any[]) => any> => {
            // Mock implementation - return cleanup function
            return vi.fn(); // Mock cleanup function
        }),
        onMonitorDown: vi.fn((_callback: any): Mock<(...args: any[]) => any> => {
            // Mock implementation - return cleanup function
            return vi.fn(); // Mock cleanup function
        }),
        onMonitoringStarted: vi.fn((_callback: any): Mock<(...args: any[]) => any> => {
            // Mock implementation - return cleanup function
            return vi.fn(); // Mock cleanup function
        }),
        onMonitoringStopped: vi.fn((_callback: any): Mock<(...args: any[]) => any> => {
            // Mock implementation - return cleanup function
            return vi.fn(); // Mock cleanup function
        }),
        onTestEvent: vi.fn((_callback: any): Mock<(...args: any[]) => any> => {
            // Mock implementation - return cleanup function
            return vi.fn(); // Mock cleanup function
        }),
        onUpdateStatus: vi.fn((_callback: any): Mock<(...args: any[]) => any> => {
            // Mock implementation - return cleanup function
            return vi.fn(); // Mock cleanup function
        }),
        removeAllListeners: vi.fn(),
    },
    monitoring: {
        startMonitoring: vi.fn().mockResolvedValue(true),
        startMonitoringForSite: vi.fn().mockResolvedValue(true),
        stopMonitoring: vi.fn().mockResolvedValue(true),
        stopMonitoringForSite: vi.fn().mockResolvedValue(true),
    },
    monitorTypes: {
        formatMonitorDetail: vi.fn().mockResolvedValue({
            success: true,
            data: "Mock formatted detail",
        }),
        getMonitorTypes: vi.fn().mockResolvedValue({
            success: true,
            data: [
                {
                    type: "http",
                    fields: [
                        {
                            id: "url",
                            label: "URL",
                            type: "url",
                            required: true,
                            placeholder: "https://example.com",
                        },
                        {
                            id: "port",
                            label: "Port",
                            type: "number",
                            required: false,
                            min: 1,
                            max: 65535,
                        },
                    ],
                },
                {
                    type: "port",
                    fields: [
                        {
                            id: "host",
                            label: "Host",
                            type: "text",
                            required: true,
                        },
                        {
                            id: "port",
                            label: "Port",
                            type: "number",
                            required: true,
                            min: 1,
                            max: 65535,
                        },
                    ],
                },
            ],
        }),
        validateMonitorData: vi.fn().mockResolvedValue({
            success: true,
            errors: [],
        }),
    },
    settings: {
        getHistoryLimit: vi.fn().mockResolvedValue(1000),
        updateHistoryLimit: vi.fn().mockResolvedValue(undefined), // Returns void
    },
    sites: {
        addSite: vi.fn().mockResolvedValue({
            identifier: "test-site",
            monitors: [],
            name: "Test Site",
        }),
        checkSiteNow: vi.fn().mockResolvedValue({
            monitorId: "test-monitor",
            status: "up",
            timestamp: Date.now(),
        }),
        getSites: vi.fn().mockResolvedValue([]),
        removeMonitor: vi.fn().mockResolvedValue(true), // Returns boolean
        removeSite: vi.fn().mockResolvedValue(true), // Returns boolean
        updateSite: vi.fn().mockResolvedValue(undefined), // Returns void
    },
    stateSync: {
        getSyncStatus: vi.fn().mockResolvedValue({
            success: true,
            siteCount: 0,
            lastSync: undefined,
            synchronized: false,
        }),
        onStateSyncEvent: vi.fn((_callback: any): Mock<(...args: any[]) => any> => {
            // Mock implementation - return cleanup function
            return vi.fn(); // Mock cleanup function
        }),
    },
    system: {
        openExternal: vi.fn().mockResolvedValue(undefined),
        quitAndInstall: vi.fn(),
    },
};

// Mock window.electronAPI globally
Object.defineProperty(window, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

// Mock window.matchMedia for theme tests
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock crypto API for UUID generation
Object.defineProperty(global, "crypto", {
    value: {
        randomUUID: vi.fn(() => "mock-uuid-" + Math.random().toString(36).substring(2, 15)),
        getRandomValues: vi.fn((arr) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256);
            }
            return arr;
        }),
    },
    writable: true,
});

// Mock document.body.classList for theme tests
Object.defineProperty(document.body, "classList", {
    value: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
        toggle: vi.fn(),
    },
    writable: true,
});

// Mock document.getElementById for main.tsx tests
const originalGetElementById = document.getElementById;
document.getElementById = vi.fn((id) => {
    if (id === "root") {
        return document.createElement("div");
    }
    return originalGetElementById.call(document, id);
});

vi.mock("electron-log/renderer", () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        transports: {
            console: {
                level: "debug",
                format: "[{h}:{i}:{s}.{ms}] [{level}] {text}",
            },
            file: {
                level: "info",
            },
        },
    },
}));

// Export mock for use in individual tests
export { mockElectronAPI };
