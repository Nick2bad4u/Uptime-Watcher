/**
 * Test setup file for Vitest.
 * Configures testing environment for React components.
 */

import "@testing-library/jest-dom";
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect, vi } from "vitest";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Global test configuration and mocks
const mockElectronAPI = {
    data: {
        downloadSQLiteBackup: vi.fn().mockResolvedValue({
            buffer: new ArrayBuffer(8),
            fileName: "test-backup.sqlite",
        }),
        exportData: vi.fn().mockResolvedValue("mock-data"),
        importData: vi.fn().mockResolvedValue(true),
    },
    events: {
        onMonitorStatusChanged: vi.fn((_callback) => {
            // Mock implementation - return cleanup function
            return vi.fn(); // Mock cleanup function
        }),
        onMonitorUp: vi.fn((_callback) => {
            // Mock implementation - return cleanup function
            return vi.fn(); // Mock cleanup function
        }),
        onMonitorDown: vi.fn((_callback) => {
            // Mock implementation - return cleanup function
            return vi.fn(); // Mock cleanup function
        }),
        onMonitoringStarted: vi.fn((_callback) => {
            // Mock implementation - return cleanup function
            return vi.fn(); // Mock cleanup function
        }),
        onMonitoringStopped: vi.fn((_callback) => {
            // Mock implementation - return cleanup function
            return vi.fn(); // Mock cleanup function
        }),
        onTestEvent: vi.fn((_callback) => {
            // Mock implementation - return cleanup function
            return vi.fn(); // Mock cleanup function
        }),
        onUpdateStatus: vi.fn((_callback) => {
            // Mock implementation - return cleanup function
            return vi.fn(); // Mock cleanup function
        }),
        removeAllListeners: vi.fn(),
    },
    monitoring: {
        startMonitoring: vi.fn().mockResolvedValue(undefined),
        startMonitoringForSite: vi.fn().mockResolvedValue(undefined),
        stopMonitoring: vi.fn().mockResolvedValue(undefined),
        stopMonitoringForSite: vi.fn().mockResolvedValue(undefined),
    },
    settings: {
        getHistoryLimit: vi.fn().mockResolvedValue(1000),
        updateHistoryLimit: vi.fn().mockResolvedValue(undefined),
    },
    sites: {
        addSite: vi.fn().mockResolvedValue({
            identifier: "test-site",
            monitors: [],
            name: "Test Site",
        }),
        checkSiteNow: vi.fn().mockResolvedValue(undefined),
        getSites: vi.fn().mockResolvedValue([]),
        removeSite: vi.fn().mockResolvedValue(undefined),
        updateSite: vi.fn().mockResolvedValue(undefined),
    },
    system: {
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
