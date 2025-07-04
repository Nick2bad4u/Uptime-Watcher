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
        exportData: vi.fn().mockResolvedValue("mock-data"),
        importData: vi.fn().mockResolvedValue(true),
        downloadSQLiteBackup: vi.fn().mockResolvedValue({
            buffer: new ArrayBuffer(8),
            fileName: "test-backup.sqlite",
        }),
    },
    events: {
        onStatusUpdate: vi.fn((callback) => {
            // Mock implementation - just store the callback but don't call it
            // In real usage, this would be called by the backend
            return callback;
        }),
        removeAllListeners: vi.fn(),
    },
    monitoring: {
        startMonitoring: vi.fn().mockResolvedValue(undefined),
        stopMonitoring: vi.fn().mockResolvedValue(undefined),
        startMonitoringForSite: vi.fn().mockResolvedValue(undefined),
        stopMonitoringForSite: vi.fn().mockResolvedValue(undefined),
    },
    settings: {
        getHistoryLimit: vi.fn().mockResolvedValue(1000),
        updateHistoryLimit: vi.fn().mockResolvedValue(undefined),
    },
    sites: {
        getSites: vi.fn().mockResolvedValue([]),
        addSite: vi.fn().mockResolvedValue({
            identifier: "test-site",
            name: "Test Site",
            monitors: [],
        }),
        removeSite: vi.fn().mockResolvedValue(undefined),
        updateSite: vi.fn().mockResolvedValue(undefined),
        checkSiteNow: vi.fn().mockResolvedValue(undefined),
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

// Export mock for use in individual tests
export { mockElectronAPI };
