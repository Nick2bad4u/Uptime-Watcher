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
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

vi.mock("electron-log/renderer", () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

// Export mock for use in individual tests
export { mockElectronAPI };
